import prisma from '../config/db.js';

/**
 * Get student's courses and their attendance percentages
 */
export const getStudentAttendanceSummary = async (req, res) => {
  try {
    let studentId = req.user.id;

    // Admin can specify a different studentId
    if (req.user.role === 'ADMIN' && req.query.studentId) {
      studentId = req.query.studentId;
    }

    // Fetch all courses the student is enrolled in
    const enrollments = await prisma.enrollment.findMany({
      where: { studentId },
      include: {
        course: true
      }
    });

    const summary = [];

    for (const enrollment of enrollments) {
      const courseId = enrollment.courseId;

      // Count total sessions started for this course
      const totalSessions = await prisma.session.count({
        where: { courseId }
      });

      // Count sessions attended by the student
      const attendedSessions = await prisma.attendance.count({
        where: {
          studentId,
          session: {
            courseId
          }
        }
      });

      // Percentage calculation
      const percentage = totalSessions === 0 ? 0 : Math.round((attendedSessions / totalSessions) * 100);

      summary.push({
        courseId,
        courseCode: enrollment.course.code,
        courseName: enrollment.course.name,
        credits: enrollment.course.credits,
        program: enrollment.course.program,
        level: enrollment.course.level,
        status: enrollment.course.status,
        totalSessions,
        attendedSessions,
        attendancePercentage: percentage
      });
    }

    res.status(200).json(summary);
  } catch (error) {
    console.error('Student attendance summary error:', error);
    res.status(500).json({ message: 'Server error fetching attendance summary', error: error.message });
  }
};

/**
 * Get report of all sessions started by the lecturer
 */
export const getLecturerSessionsReport = async (req, res) => {
  try {
    const lecturerId = req.user.id;

    const sessions = await prisma.session.findMany({
      where: { lecturerId },
      include: {
        course: {
          select: {
            code: true,
            name: true
          }
        },
        _count: {
          select: { attendances: true }
        }
      },
      orderBy: { date: 'desc' }
    });

    const report = sessions.map(s => ({
      sessionId: s.id,
      courseCode: s.course.code,
      courseName: s.course.name,
      date: s.date,
      pin: s.pin,
      maxStudents: s.maxStudents,
      attendeeCount: s._count.attendances,
      isActive: s.isActive
    }));

    res.status(200).json(report);
  } catch (error) {
    console.error('Lecturer sessions report error:', error);
    res.status(500).json({ message: 'Server error fetching sessions report', error: error.message });
  }
};

/**
 * Get student details for an attendance session (Lecturers & Admins only)
 */
export const getSessionAttendanceList = async (req, res) => {
  try {
    const { sessionId } = req.params;
    const userId = req.user.id;

    if (!sessionId) {
      return res.status(400).json({ message: 'Session ID is required' });
    }

    const session = await prisma.session.findUnique({
      where: { id: sessionId },
      include: {
        course: true
      }
    });

    if (!session) {
      return res.status(404).json({ message: 'Session not found' });
    }

    // Verify ownership or Admin role
    if (session.lecturerId !== userId && req.user.role !== 'ADMIN') {
      return res.status(403).json({ message: 'Access denied: Unauthorized to view this session records.' });
    }

    const attendances = await prisma.attendance.findMany({
      where: { sessionId },
      include: {
        student: {
          select: {
            id: true,
            name: true,
            email: true,
            program: true
          }
        }
      },
      orderBy: { timestamp: 'asc' }
    });

    const list = attendances.map(a => ({
      attendanceId: a.id,
      studentId: a.student.id,
      studentName: a.student.name,
      studentEmail: a.student.email,
      studentProgram: a.student.program,
      timestamp: a.timestamp,
      status: a.status
    }));

    res.status(200).json({
      sessionId: session.id,
      courseCode: session.course.code,
      courseName: session.course.name,
      date: session.date,
      pin: session.pin,
      attendees: list
    });
  } catch (error) {
    console.error('Session attendance list error:', error);
    res.status(500).json({ message: 'Server error fetching session attendance list', error: error.message });
  }
};
