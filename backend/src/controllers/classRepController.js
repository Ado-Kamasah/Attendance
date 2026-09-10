import prisma from '../config/db.js';

// ─────────────────────────────────────────────────────────────────────────────
// GET /api/classrep/all  — Admin: list all class reps across all courses
// ─────────────────────────────────────────────────────────────────────────────
export const getAllClassReps = async (req, res) => {
  try {
    const reps = await prisma.classRep.findMany({
      include: {
        student: { select: { id: true, name: true, email: true, program: true } },
        course:  { select: { id: true, code: true, name: true, level: true } },
      },
      orderBy: { assignedAt: 'desc' },
    });

    res.status(200).json(
      reps.map((r) => {
        const code = r.course?.code || '';
        let level = r.course?.level || '';
        if (!level && code) {
          const match = code.match(/\b([1-4]\d{2})\b/);
          if (match) level = match[1];
        }
        return {
          id:          r.id,
          studentId:   r.studentId,
          studentName: r.student?.name || 'Student Rep',
          studentEmail:r.student?.email || '',
          studentProgram: r.student?.program || '',
          courseId:    r.courseId,
          courseCode:  code || (r.courseId.length <= 10 ? r.courseId : '—'),
          courseName:  r.course?.name || (code ? code : 'Course'),
          courseLevel: level || '100',
          assignedAt:  r.assignedAt,
        };
      })
    );
  } catch (error) {
    console.error('getAllClassReps error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// GET /api/classrep/students   — Admin: list all students (optionally highlighting enrolled)
// ─────────────────────────────────────────────────────────────────────────────
export const getStudentList = async (req, res) => {
  try {
    const { courseId, q } = req.query;

    let enrolledIds = [];
    if (courseId) {
      const enrollments = await prisma.enrollment.findMany({
        where: {
          OR: [
            { courseId },
            { course: { code: courseId.toUpperCase() } }
          ]
        },
        select: { studentId: true },
      });
      enrolledIds = enrollments.map((e) => e.studentId);
    }

    const where = { role: 'STUDENT' };
    if (q && q.trim()) {
      const term = q.trim().toLowerCase();
      where.OR = [
        { name: { contains: term } },
        { email: { contains: term } },
        { id: { contains: term } }
      ];
    }

    const allStudents = await prisma.user.findMany({
      where,
      select: { id: true, name: true, email: true, program: true },
      orderBy: { name: 'asc' },
    });

    // Mark enrolled students if courseId was supplied, placing enrolled ones first
    const mapped = allStudents.map((s) => ({
      ...s,
      studentId: s.id,
      isEnrolled: enrolledIds.includes(s.id),
    }));

    if (courseId && enrolledIds.length > 0) {
      mapped.sort((a, b) => (b.isEnrolled ? 1 : 0) - (a.isEnrolled ? 1 : 0));
    }

    res.status(200).json(mapped);
  } catch (error) {
    console.error('getStudentList error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// POST /api/classrep/assign  — Admin: assign a student as class rep for a course
// Body: { studentId, courseId, studentName?, studentEmail?, studentProgram?, courseCode?, courseName?, courseLevel? }
// ─────────────────────────────────────────────────────────────────────────────
export const assignClassRep = async (req, res) => {
  try {
    const {
      studentId,
      courseId,
      studentName,
      studentEmail,
      studentProgram,
      courseCode,
      courseName,
      courseLevel
    } = req.body;

    if (!studentId || !courseId) {
      return res.status(400).json({ message: 'studentId and courseId are required' });
    }

    // Flexible student lookup by ID or Email
    let student = await prisma.user.findFirst({
      where: {
        OR: [
          { id: studentId },
          { email: studentId.trim().toLowerCase() }
        ]
      }
    });

    // If not found in local DB, auto-create/sync from provided details
    if (!student) {
      try {
        const email = (studentEmail || `${studentId.replace(/[^a-zA-Z0-9]/g, '').toLowerCase() || 'student'}@southshore.edu.gh`).toLowerCase();
        student = await prisma.user.upsert({
          where: { email },
          update: {
            name: studentName || 'Student',
            role: 'STUDENT',
          },
          create: {
            id: studentId,
            name: studentName || 'Student',
            email,
            role: 'STUDENT',
            program: studentProgram || 'General',
            password: 'student_placeholder_password'
          }
        });
      } catch (err) {
        console.warn('Auto-create student in local DB fallback:', err.message);
        student = await prisma.user.findFirst({ where: { role: 'STUDENT' } });
      }
    }

    if (!student) {
      return res.status(404).json({ message: 'Student account not found or could not be initialized' });
    }

    // Flexible course lookup by ID or Code
    let course = await prisma.course.findFirst({
      where: {
        OR: [
          { id: courseId },
          { code: courseId.trim().toUpperCase() },
          ...(courseCode ? [{ code: courseCode.trim().toUpperCase() }] : [])
        ]
      }
    });

    // If not found in local DB, auto-create/sync from provided details
    if (!course) {
      try {
        const code = (courseCode || (courseId.length <= 10 ? courseId : `CRS-${courseId.slice(0, 6)}`)).toUpperCase();
        course = await prisma.course.upsert({
          where: { code },
          update: {
            name: courseName || 'Academic Course',
          },
          create: {
            id: courseId,
            code,
            name: courseName || 'Academic Course',
            program: studentProgram || 'General',
            level: courseLevel ? String(courseLevel) : '100',
            semester: 'Semester 1',
            status: 'active'
          }
        });
      } catch (err) {
        console.warn('Auto-create course in local DB fallback:', err.message);
        course = await prisma.course.findFirst();
      }
    }

    if (!course) {
      return res.status(404).json({ message: 'Course not found or could not be initialized' });
    }

    // Upsert: replace existing rep for this course if any
    const rep = await prisma.classRep.upsert({
      where:  { courseId: course.id },
      update: { studentId: student.id, assignedAt: new Date() },
      create: { studentId: student.id, courseId: course.id },
      include: {
        student: { select: { id: true, name: true, email: true, program: true } },
        course:  { select: { id: true, code: true, name: true, level: true } },
      },
    });

    // Auto-enroll the student in the course so they have full access to course materials & attendance
    await prisma.enrollment.upsert({
      where: {
        studentId_courseId: { studentId: student.id, courseId: course.id }
      },
      update: {},
      create: { studentId: student.id, courseId: course.id }
    }).catch(e => console.warn('Auto-enroll enrollment notice:', e.message));

    res.status(200).json({
      message: `${student.name} assigned as Class Rep for ${course.name} (${course.code})`,
      rep: {
        id:          rep.id,
        studentId:   rep.studentId,
        studentName: rep.student?.name || student.name,
        studentEmail:rep.student?.email || student.email,
        studentProgram: rep.student?.program || student.program,
        courseId:    rep.courseId,
        courseCode:  rep.course?.code || course.code,
        courseName:  rep.course?.name || course.name,
        courseLevel: rep.course?.level || course.level,
        assignedAt:  rep.assignedAt,
      },
    });
  } catch (error) {
    console.error('assignClassRep error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// DELETE /api/classrep/:courseId  — Admin: remove class rep for a course
// ─────────────────────────────────────────────────────────────────────────────
export const removeClassRep = async (req, res) => {
  try {
    const { courseId } = req.params;

    const existing = await prisma.classRep.findFirst({
      where: {
        OR: [
          { courseId },
          { course: { code: courseId.toUpperCase() } }
        ]
      }
    });

    if (!existing) {
      return res.status(404).json({ message: 'No class rep found for this course' });
    }

    await prisma.classRep.delete({ where: { id: existing.id } });

    res.status(200).json({ message: 'Class rep removed successfully' });
  } catch (error) {
    console.error('removeClassRep error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// GET /api/classrep/my-roles  — Student: check if they are a class rep & get their courses
// ─────────────────────────────────────────────────────────────────────────────
export const getMyClassRepRoles = async (req, res) => {
  try {
    const studentId = req.user.id;
    const userEmail = req.user.email;

    const roles = await prisma.classRep.findMany({
      where: {
        OR: [
          { studentId },
          ...(userEmail ? [{ student: { email: userEmail.toLowerCase() } }] : [])
        ]
      },
      include: {
        course: {
          include: {
            schedules: { select: { lecturer: true, day: true, startTime: true, endTime: true, venue: true } },
          },
        },
      },
    });

    res.status(200).json(
      roles.map((r) => ({
        id:        r.id,
        courseId:  r.courseId,
        courseCode:r.course.code,
        courseName:r.course.name,
        schedules: r.course.schedules,
        assignedAt:r.assignedAt,
      }))
    );
  } catch (error) {
    console.error('getMyClassRepRoles error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// ─────────────────────────────────────────────────────────────────────────────
// GET /api/classrep/verify-session  — Class Rep: verify session code with course reference
// Query: ?code=123456&courseId=...
// ─────────────────────────────────────────────────────────────────────────────
export const verifySession = async (req, res) => {
  try {
    const { code, courseId } = req.query;

    if (!code || !code.trim()) {
      return res.status(400).json({ valid: false, message: 'Session code is required' });
    }

    const cleanCode = code.trim();

    // 1. Search Prisma session
    const session = await prisma.session.findFirst({
      where: { pin: cleanCode },
      include: {
        course: { select: { id: true, code: true, name: true, level: true } },
        lecturer: { select: { id: true, name: true, email: true } },
      },
    });

    if (session) {
      // Check if course matches
      const targetCourse = courseId ? courseId.trim().toUpperCase() : null;
      const courseMatch = !targetCourse ||
        session.courseId === courseId ||
        session.course?.id === courseId ||
        session.course?.code?.toUpperCase() === targetCourse;

      if (!courseMatch) {
        return res.status(400).json({
          valid: false,
          message: `Session code "${cleanCode}" belongs to ${session.course?.code || 'another course'}, not this course.`,
          sessionCourse: session.course?.code,
          sessionCourseName: session.course?.name
        });
      }

      const createdDate = new Date(session.createdAt || session.date);
      const dateStr = createdDate.toISOString().split('T')[0];
      const hours = String(createdDate.getHours()).padStart(2, '0');
      const minutes = String(createdDate.getMinutes()).padStart(2, '0');
      const timeStr = `${hours}:${minutes}`;

      return res.status(200).json({
        valid: true,
        message: 'Session verified successfully',
        session: {
          id: session.id,
          pin: session.pin,
          courseId: session.courseId,
          courseCode: session.course?.code,
          courseName: session.course?.name,
          date: dateStr,
          time: timeStr,
          createdAt: createdDate.toISOString(),
          isActive: session.isActive,
          lecturerName: session.lecturer?.name || 'Lecturer'
        }
      });
    }

    // Session code not found in local database
    return res.status(404).json({
      valid: false,
      message: `No active or recorded session found with code "${cleanCode}".`
    });
  } catch (error) {
    console.error('verifySession error:', error);
    res.status(500).json({ valid: false, message: 'Server error verifying session code', error: error.message });
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// GET /api/classrep/course-sessions/:courseId  — Class Rep: list sessions for course
// ─────────────────────────────────────────────────────────────────────────────
export const getCourseSessions = async (req, res) => {
  try {
    const { courseId } = req.params;

    const sessions = await prisma.session.findMany({
      where: {
        OR: [
          { courseId },
          { course: { code: courseId.toUpperCase() } }
        ]
      },
      orderBy: { createdAt: 'desc' },
      take: 10,
      include: {
        course: { select: { code: true, name: true } },
        lecturer: { select: { name: true } }
      }
    });

    const mapped = sessions.map(s => {
      const d = new Date(s.createdAt || s.date);
      return {
        id: s.id,
        pin: s.pin,
        courseId: s.courseId,
        courseCode: s.course?.code,
        courseName: s.course?.name,
        date: d.toISOString().split('T')[0],
        time: `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`,
        createdAt: d.toISOString(),
        isActive: s.isActive,
        lecturerName: s.lecturer?.name || 'Lecturer'
      };
    });

    res.status(200).json(mapped);
  } catch (error) {
    console.error('getCourseSessions error:', error);
    res.status(500).json({ message: 'Server error fetching course sessions', error: error.message });
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// POST /api/classrep/lecturer-attendance   — Class Rep: mark lecturer attendance
// Body: { courseId, sessionCode?, date?, time?, status, notes? }
// ─────────────────────────────────────────────────────────────────────────────
export const markLecturerAttendance = async (req, res) => {
  try {
    const markedById = req.user.id;
    const { courseId, sessionCode, date, time, status, notes } = req.body;

    if (!courseId || !status) {
      return res.status(400).json({ message: 'courseId and status are required' });
    }

    if (!['present', 'absent', 'late'].includes(status.toLowerCase())) {
      return res.status(400).json({ message: 'status must be present, absent, or late' });
    }

    const normStatus = status.toLowerCase();

    // Resolve course
    const course = await prisma.course.findFirst({
      where: {
        OR: [
          { id: courseId },
          { code: courseId.trim().toUpperCase() }
        ]
      }
    });

    const targetCourseId = course ? course.id : courseId;

    // Verify this student is the class rep for this course
    const rep = await prisma.classRep.findFirst({
      where: {
        studentId: markedById,
        OR: [
          { courseId: targetCourseId },
          { course: { code: courseId.trim().toUpperCase() } }
        ]
      },
    });

    if (!rep && req.user.role !== 'ADMIN' && process.env.NODE_ENV === 'production') {
      return res.status(403).json({ message: 'Access denied: You are not the class rep for this course' });
    }

    let resolvedDate = date;
    let resolvedTime = time;
    let sessionDetailsTag = '';

    // If sessionCode is provided, verify against this course and extract date/time
    if (sessionCode && String(sessionCode).trim()) {
      const cleanCode = String(sessionCode).trim();
      sessionDetailsTag = `[Session Code: ${cleanCode}]`;

      const session = await prisma.session.findFirst({
        where: { pin: cleanCode },
        include: { course: true, lecturer: true }
      });

      if (session) {
        // Course reference check
        const match = session.courseId === targetCourseId ||
          session.course?.code?.toUpperCase() === courseId.trim().toUpperCase();

        if (!match) {
          return res.status(400).json({
            message: `Session code ${cleanCode} references ${session.course?.code || 'another course'}, not this course.`
          });
        }

        const createdDate = new Date(session.createdAt || session.date);
        if (!resolvedDate) {
          resolvedDate = createdDate.toISOString().split('T')[0];
        }
        if (!resolvedTime) {
          resolvedTime = `${String(createdDate.getHours()).padStart(2, '0')}:${String(createdDate.getMinutes()).padStart(2, '0')}`;
        }
      }
    }

    // Default to current date/time if not determined
    if (!resolvedDate) {
      resolvedDate = new Date().toISOString().split('T')[0];
    }
    if (!resolvedTime) {
      const n = new Date();
      resolvedTime = `${String(n.getHours()).padStart(2, '0')}:${String(n.getMinutes()).padStart(2, '0')}`;
    }

    const mergedNotes = sessionDetailsTag
      ? (notes ? `${sessionDetailsTag} ${notes}` : sessionDetailsTag)
      : (notes || null);

    // Prevent duplicate for the same course + date
    const existing = await prisma.lecturerAttendance.findFirst({
      where: { courseId: targetCourseId, date: resolvedDate },
    });

    if (existing) {
      const updated = await prisma.lecturerAttendance.update({
        where: { id: existing.id },
        data: {
          time: resolvedTime,
          status: normStatus,
          notes: mergedNotes,
          markedById
        },
        include: { course: { select: { code: true, name: true } } },
      });
      return res.status(200).json({ message: 'Lecturer attendance record updated', record: updated });
    }

    const record = await prisma.lecturerAttendance.create({
      data: {
        courseId: targetCourseId,
        markedById,
        date: resolvedDate,
        time: resolvedTime,
        status: normStatus,
        notes: mergedNotes
      },
      include: { course: { select: { code: true, name: true } } },
    });

    res.status(201).json({ message: 'Lecturer attendance recorded successfully', record });
  } catch (error) {
    console.error('markLecturerAttendance error:', error);
    res.status(500).json({ message: 'Server error marking lecturer attendance', error: error.message });
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// GET /api/classrep/lecturer-attendance/:courseId  — Class Rep: view past records
// ─────────────────────────────────────────────────────────────────────────────
export const getLecturerAttendanceHistory = async (req, res) => {
  try {
    const { courseId } = req.params;

    const records = await prisma.lecturerAttendance.findMany({
      where: {
        OR: [
          { courseId },
          { course: { code: courseId.toUpperCase() } }
        ]
      },
      include: {
        course:    { select: { code: true, name: true } },
        markedBy:  { select: { name: true } },
      },
      orderBy: [{ date: 'desc' }, { time: 'desc' }],
    });

    res.status(200).json(
      records.map((r) => ({
        id:          r.id,
        courseId:    r.courseId,
        courseCode:  r.course?.code || r.courseId,
        courseName:  r.course?.name || 'Course',
        date:        r.date,
        time:        r.time,
        status:      r.status,
        notes:       r.notes,
        markedBy:    r.markedBy?.name || 'Class Rep',
        createdAt:   r.createdAt,
      }))
    );
  } catch (error) {
    console.error('getLecturerAttendanceHistory error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};
