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

/**
 * Get Lecturer Stats (Total Active Courses, Total Students Taught, Average Attendance Rate)
 */
export const getLecturerStats = async (req, res) => {
  try {
    const lecturerId = req.user.id;
    const lecturerName = req.user.name;

    // Total Active Courses (Assigned to Lecturer)
    const schedules = await prisma.schedule.findMany({
      where: { lecturer: lecturerName },
      select: { courseId: true }
    });
    const courseIds = [...new Set(schedules.map(s => s.courseId))];

    // Total Students Taught
    const enrollments = await prisma.enrollment.findMany({
      where: { courseId: { in: courseIds } },
      select: { studentId: true }
    });
    const uniqueStudents = new Set(enrollments.map(e => e.studentId));

    // Average Attendance Rate
    const sessions = await prisma.session.findMany({
      where: { lecturerId },
      include: {
        course: { include: { enrollments: true } },
        _count: { select: { attendances: true } }
      }
    });

    let possibleAttendances = 0;
    let actualAttendances = 0;

    sessions.forEach(s => {
      possibleAttendances += s.course.enrollments.length;
      actualAttendances += s._count.attendances;
    });

    const averageAttendanceRate = possibleAttendances > 0
      ? Math.round((actualAttendances / possibleAttendances) * 100)
      : 0;

    res.status(200).json({
      totalActiveCourses: courseIds.length,
      totalStudentsTaught: uniqueStudents.size,
      averageAttendanceRate
    });
  } catch (error) {
    console.error('Lecturer stats error:', error);
    res.status(500).json({ message: 'Server error fetching lecturer stats', error: error.message });
  }
};

/**
 * Get Course Reports (Attendance aggregations per course for Lecturer)
 */
export const getCourseReports = async (req, res) => {
  try {
    const lecturerName = req.user.name;

    const schedules = await prisma.schedule.findMany({
      where: { lecturer: lecturerName },
      include: {
        course: {
          include: {
            enrollments: true,
            sessions: {
              include: { _count: { select: { attendances: true } } }
            }
          }
        }
      }
    });

    const uniqueCourses = new Map();

    schedules.forEach(schedule => {
      if (!uniqueCourses.has(schedule.courseId)) {
        const course = schedule.course;
        
        let possible = 0;
        let actual = 0;
        course.sessions.forEach(s => {
          possible += course.enrollments.length;
          actual += s._count.attendances;
        });

        const avgAttendance = possible > 0 ? Math.round((actual / possible) * 100) : 0;
        // Mocking perfect attendance/at risk for simplicity unless we iterate each student
        
        uniqueCourses.set(course.id, {
          courseId: course.id,
          code: course.code,
          name: course.name,
          semester: course.semester,
          totalStudents: course.enrollments.length,
          sessionsHeld: course.sessions.length,
          avgAttendance,
          perfectAttendance: 0, // placeholder
          atRisk: 0 // placeholder
        });
      }
    });

    res.status(200).json(Array.from(uniqueCourses.values()));
  } catch (error) {
    console.error('Course reports error:', error);
    res.status(500).json({ message: 'Server error fetching course reports', error: error.message });
  }
};

/**
 * Get Students in a Course with their specific attendance percentage
 */
export const getCourseStudentsAttendance = async (req, res) => {
  try {
    const { courseId } = req.params;

    const enrollments = await prisma.enrollment.findMany({
      where: { courseId },
      include: {
        student: true
      }
    });

    const totalSessions = await prisma.session.count({ where: { courseId } });

    const studentsAttendance = await Promise.all(
      enrollments.map(async (e) => {
        const attended = await prisma.attendance.count({
          where: { studentId: e.studentId, session: { courseId } }
        });
        const attendanceRate = totalSessions > 0 ? Math.round((attended / totalSessions) * 100) : 0;
        return {
          id: e.student.id,
          studentId: e.student.id,
          name: e.student.name,
          program: e.student.program,
          attendanceRate
        };
      })
    );

    res.status(200).json(studentsAttendance);
  } catch (error) {
    console.error('Course students attendance error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};
