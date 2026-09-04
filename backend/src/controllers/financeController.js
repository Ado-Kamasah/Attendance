import prisma from '../config/db.js';

// ─────────────────────────────────────────────────────────────────────────────
// Helper: build structured claim rows for every lecturer
// Returns an array of claim objects ready for JSON or CSV export.
// ─────────────────────────────────────────────────────────────────────────────
async function buildClaimsData({ lecturerId, courseId, fromDate, toDate } = {}) {
  const sessionWhere = {};
  if (lecturerId) sessionWhere.lecturerId = lecturerId;
  if (courseId)   sessionWhere.courseId   = courseId;
  if (fromDate || toDate) {
    sessionWhere.date = {};
    if (fromDate) sessionWhere.date.gte = new Date(fromDate);
    if (toDate)   sessionWhere.date.lte = new Date(toDate);
  }

  const sessions = await prisma.session.findMany({
    where: sessionWhere,
    include: {
      lecturer: { select: { id: true, name: true, email: true } },
      course:   { select: { id: true, code: true, name: true, credits: true } },
      attendances: { select: { status: true } },
    },
    orderBy: { date: 'desc' },
  });

  // Group sessions by lecturer → course
  const map = new Map(); // key: lecturerId

  for (const s of sessions) {
    const lKey = s.lecturerId;
    if (!map.has(lKey)) {
      map.set(lKey, {
        lecturerId:    s.lecturer.id,
        lecturerName:  s.lecturer.name,
        lecturerEmail: s.lecturer.email,
        courses: new Map(),
      });
    }
    const lec = map.get(lKey);
    const cKey = s.courseId;
    if (!lec.courses.has(cKey)) {
      lec.courses.set(cKey, {
        courseId:   s.course.id,
        courseCode: s.course.code,
        courseName: s.course.name,
        credits:    s.course.credits,
        sessions:   [],
      });
    }
    lec.courses.get(cKey).sessions.push({
      sessionId:  s.id,
      date:       s.date,
      totalEnrolled: s.attendances.length,
      present:    s.attendances.filter(a => a.status === 'present').length,
      absent:     s.attendances.filter(a => a.status === 'absent').length,
    });
  }

  // Flatten to claim rows
  const rows = [];
  for (const lec of map.values()) {
    for (const course of lec.courses.values()) {
      const totalSessions   = course.sessions.length;
      const totalPresent    = course.sessions.reduce((s, r) => s + r.present, 0);
      const totalStudents   = course.sessions.reduce((s, r) => s + r.totalEnrolled, 0);
      const attendanceRate  = totalStudents > 0
        ? Math.round((totalPresent / totalStudents) * 100)
        : 0;

      rows.push({
        lecturerId:      lec.lecturerId,
        lecturerName:    lec.lecturerName,
        lecturerEmail:   lec.lecturerEmail,
        courseId:        course.courseId,
        courseCode:      course.courseCode,
        courseName:      course.courseName,
        credits:         course.credits,
        totalSessions,
        totalStudentSlots: totalStudents,
        totalPresent,
        attendanceRate,
        sessions:        course.sessions,
      });
    }
  }

  return rows;
}

// ─────────────────────────────────────────────────────────────────────────────
// GET /api/finance/claims
// Finance: get all lecturer claims as JSON
// ─────────────────────────────────────────────────────────────────────────────
export const getClaims = async (req, res) => {
  try {
    const { lecturerId, courseId, from, to } = req.query;
    const rows = await buildClaimsData({ lecturerId, courseId, fromDate: from, toDate: to });
    res.status(200).json(rows);
  } catch (error) {
    console.error('getClaims error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// GET /api/finance/claims/download
// Finance: download lecturer claims as CSV
// ─────────────────────────────────────────────────────────────────────────────
export const downloadClaims = async (req, res) => {
  try {
    const { lecturerId, courseId, from, to } = req.query;
    const rows = await buildClaimsData({ lecturerId, courseId, fromDate: from, toDate: to });

    const headers = [
      'Lecturer ID', 'Lecturer Name', 'Lecturer Email',
      'Course Code', 'Course Name', 'Credits',
      'Total Sessions', 'Total Student Slots', 'Total Present',
      'Attendance Rate (%)',
    ];

    const csvLines = [
      headers.join(','),
      ...rows.map(r => [
        `"${r.lecturerId}"`,
        `"${r.lecturerName}"`,
        `"${r.lecturerEmail}"`,
        `"${r.courseCode}"`,
        `"${r.courseName}"`,
        r.credits,
        r.totalSessions,
        r.totalStudentSlots,
        r.totalPresent,
        r.attendanceRate,
      ].join(',')),
    ];

    const csv = csvLines.join('\n');
    const filename = `lecturer_claims_${new Date().toISOString().slice(0, 10)}.csv`;

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    res.status(200).send(csv);
  } catch (error) {
    console.error('downloadClaims error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// GET /api/finance/lecturers
// Finance: get list of all lecturers (for filter dropdown)
// ─────────────────────────────────────────────────────────────────────────────
export const getLecturers = async (req, res) => {
  try {
    const lecturers = await prisma.user.findMany({
      where:   { role: 'LECTURER' },
      select:  { id: true, name: true, email: true },
      orderBy: { name: 'asc' },
    });
    res.status(200).json(lecturers);
  } catch (error) {
    console.error('getLecturers error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};
