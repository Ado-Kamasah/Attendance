import prisma from '../config/db.js';
import {
  sendFirstAbsenceWarning,
  sendSecondAbsenceWarning,
  sendIneligibilityNotice,
} from '../config/email.js';

// ─────────────────────────────────────────────────────────────────────────────
// Broadcast: notify all students that evaluation period is now open
// POST /api/notifications/evaluation-open  (Admin only)
// ─────────────────────────────────────────────────────────────────────────────
export const broadcastEvaluationOpen = async (req, res) => {
  try {
    // Get all students
    const students = await prisma.user.findMany({
      where: { role: 'STUDENT' },
      select: { id: true },
    });

    if (students.length === 0) {
      return res.status(200).json({ message: 'No students to notify', count: 0 });
    }

    // Get any active course to satisfy the required courseId FK.
    // We use the first course found; evaluation notifications are not
    // course-specific so we pick any valid course as a placeholder.
    const anyCourse = await prisma.course.findFirst({ select: { id: true } });
    if (!anyCourse) {
      return res.status(400).json({ message: 'No courses found in the system' });
    }

    const message =
      '📋 Lecturer evaluations are now open! Please visit the Evaluation page to rate your lecturers. Your feedback is confidential and important.';

    // Upsert: avoid duplicate eval_open notices — delete old ones first
    await prisma.studentNotification.deleteMany({
      where: { type: 'eval_open', courseId: anyCourse.id },
    });

    // Create a notification for every student
    await prisma.studentNotification.createMany({
      data: students.map((s) => ({
        studentId: s.id,
        courseId:  anyCourse.id,
        type:      'eval_open',
        message,
        isRead:    false,
      })),
    });

    res.status(200).json({ message: 'Evaluation open notifications sent', count: students.length });
  } catch (error) {
    console.error('broadcastEvaluationOpen error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// Internal helper – determine missed class count for a student in a course
// ─────────────────────────────────────────────────────────────────────────────
async function getMissedCount(studentId, courseId) {
  const totalSessions = await prisma.session.count({ where: { courseId } });
  const attended = await prisma.attendance.count({
    where: { studentId, session: { courseId } },
  });
  return Math.max(0, totalSessions - attended);
}

// ─────────────────────────────────────────────────────────────────────────────
// Pure logic: scan absent students for a session and fire warnings.
// Can be called from sessionController directly (no req/res needed).
// ─────────────────────────────────────────────────────────────────────────────
export async function runAbsencesCheck(sessionId) {
  const session = await prisma.session.findUnique({
    where: { id: sessionId },
    include: { course: true },
  });
  if (!session) return [];

  const { courseId, course } = session;

  const enrollments = await prisma.enrollment.findMany({
    where: { courseId },
    include: { student: { select: { id: true, name: true, email: true } } },
  });

  const presentIds = new Set(
    (await prisma.attendance.findMany({
      where: { sessionId },
      select: { studentId: true },
    })).map((a) => a.studentId)
  );

  const results = [];

  for (const enrollment of enrollments) {
    const student = enrollment.student;
    if (presentIds.has(student.id)) continue;

    const missedCount = await getMissedCount(student.id, courseId);
    if (missedCount < 1) continue;

    let notificationType = null;
    if (missedCount === 1)      notificationType = 'warning_1';
    else if (missedCount === 2) notificationType = 'warning_2';
    else if (missedCount >= 3)  notificationType = 'ineligible';

    if (!notificationType) continue;

    // Avoid duplicate notifications for the same absence milestone
    const existing = await prisma.studentNotification.findFirst({
      where: { studentId: student.id, courseId, type: notificationType },
    });
    if (existing) continue;

    let message = '';
    if (notificationType === 'warning_1') {
      message = `⚠️ Warning: You have missed 1 class in ${course.name} (${course.code}). Missing 3 classes will make you ineligible to write the exam.`;
    } else if (notificationType === 'warning_2') {
      message = `🚨 Critical Warning: You have missed 2 classes in ${course.name} (${course.code}). One more absence will render you ineligible to sit the examination.`;
    } else {
      message = `❌ Exam Ineligibility: You have missed ${missedCount} classes in ${course.name} (${course.code}). You are NOT eligible to write the examination for this course.`;
    }

    await prisma.studentNotification.create({
      data: { studentId: student.id, courseId, type: notificationType, message },
    });

    const emailPayload = {
      studentName: student.name,
      studentEmail: student.email,
      courseName: course.name,
      courseCode: course.code,
      missedCount,
    };

    try {
      if (notificationType === 'warning_1')      await sendFirstAbsenceWarning(emailPayload);
      else if (notificationType === 'warning_2') await sendSecondAbsenceWarning(emailPayload);
      else                                        await sendIneligibilityNotice(emailPayload);
    } catch (emailErr) {
      console.error(`Failed to send email to ${student.email}:`, emailErr.message);
    }

    results.push({ studentId: student.id, studentName: student.name, type: notificationType });
  }

  return results;
}

// ─────────────────────────────────────────────────────────────────────────────
// POST /api/notifications/check-absences  (Lecturer / Admin manual trigger)
// ─────────────────────────────────────────────────────────────────────────────
export const checkAbsencesForSession = async (req, res) => {
  try {
    const { sessionId } = req.body;
    if (!sessionId) return res.status(400).json({ message: 'sessionId is required' });

    const session = await prisma.session.findUnique({ where: { id: sessionId } });
    if (!session) return res.status(404).json({ message: 'Session not found' });

    const results = await runAbsencesCheck(sessionId);

    res.status(200).json({
      message: 'Absence check completed',
      notificationsSent: results.length,
      results,
    });
  } catch (error) {
    console.error('checkAbsencesForSession error:', error);
    res.status(500).json({ message: 'Server error during absence check', error: error.message });
  }
};



// ─────────────────────────────────────────────────────────────────────────────
// GET /api/notifications/my
// Fetch the logged-in student's notifications (newest first)
// ─────────────────────────────────────────────────────────────────────────────
export const getMyNotifications = async (req, res) => {
  try {
    const studentId = req.user.id;

    const notifications = await prisma.studentNotification.findMany({
      where: { studentId },
      include: {
        course: { select: { code: true, name: true } },
      },
      orderBy: { createdAt: 'desc' },
    });

    res.status(200).json(
      notifications.map((n) => ({
        id: n.id,
        type: n.type,
        message: n.message,
        isRead: n.isRead,
        courseCode: n.course.code,
        courseName: n.course.name,
        createdAt: n.createdAt,
      }))
    );
  } catch (error) {
    console.error('getMyNotifications error:', error);
    res.status(500).json({ message: 'Server error fetching notifications', error: error.message });
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// PATCH /api/notifications/:id/read
// Mark a single notification as read
// ─────────────────────────────────────────────────────────────────────────────
export const markNotificationRead = async (req, res) => {
  try {
    const { id } = req.params;
    const studentId = req.user.id;

    const notification = await prisma.studentNotification.findUnique({ where: { id } });

    if (!notification) {
      return res.status(404).json({ message: 'Notification not found' });
    }

    if (notification.studentId !== studentId) {
      return res.status(403).json({ message: 'Access denied' });
    }

    const updated = await prisma.studentNotification.update({
      where: { id },
      data: { isRead: true },
    });

    res.status(200).json({ message: 'Marked as read', notification: updated });
  } catch (error) {
    console.error('markNotificationRead error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// PATCH /api/notifications/read-all
// Mark all student notifications as read
// ─────────────────────────────────────────────────────────────────────────────
export const markAllNotificationsRead = async (req, res) => {
  try {
    const studentId = req.user.id;

    await prisma.studentNotification.updateMany({
      where: { studentId, isRead: false },
      data: { isRead: true },
    });

    res.status(200).json({ message: 'All notifications marked as read' });
  } catch (error) {
    console.error('markAllNotificationsRead error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};
