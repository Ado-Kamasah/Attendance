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
      reps.map((r) => ({
        id:          r.id,
        studentId:   r.studentId,
        studentName: r.student.name,
        studentEmail:r.student.email,
        studentProgram: r.student.program,
        courseId:    r.courseId,
        courseCode:  r.course.code,
        courseName:  r.course.name,
        courseLevel: r.course.level,
        assignedAt:  r.assignedAt,
      }))
    );
  } catch (error) {
    console.error('getAllClassReps error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// GET /api/classrep/students   — Admin: list all enrolled students (to search & pick)
// ─────────────────────────────────────────────────────────────────────────────
export const getStudentList = async (req, res) => {
  try {
    const { courseId } = req.query;

    let where = { role: 'STUDENT' };

    // If courseId is supplied, only return students enrolled in that course
    if (courseId) {
      const enrollments = await prisma.enrollment.findMany({
        where: { courseId },
        select: { studentId: true },
      });
      const ids = enrollments.map((e) => e.studentId);
      where = { ...where, id: { in: ids } };
    }

    const students = await prisma.user.findMany({
      where,
      select: { id: true, name: true, email: true, program: true },
      orderBy: { name: 'asc' },
    });

    res.status(200).json(students);
  } catch (error) {
    console.error('getStudentList error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// POST /api/classrep/assign  — Admin: assign a student as class rep for a course
// Body: { studentId, courseId }
// ─────────────────────────────────────────────────────────────────────────────
export const assignClassRep = async (req, res) => {
  try {
    const { studentId, courseId } = req.body;

    if (!studentId || !courseId) {
      return res.status(400).json({ message: 'studentId and courseId are required' });
    }

    const student = await prisma.user.findUnique({ where: { id: studentId } });
    if (!student || student.role !== 'STUDENT') {
      return res.status(404).json({ message: 'Student not found' });
    }

    const course = await prisma.course.findUnique({ where: { id: courseId } });
    if (!course) {
      return res.status(404).json({ message: 'Course not found' });
    }

    // Upsert: replace existing rep for this course if any
    const rep = await prisma.classRep.upsert({
      where:  { courseId },
      update: { studentId, assignedAt: new Date() },
      create: { studentId, courseId },
      include: {
        student: { select: { id: true, name: true, email: true } },
        course:  { select: { code: true, name: true } },
      },
    });

    res.status(200).json({
      message: `${student.name} assigned as Class Rep for ${course.name} (${course.code})`,
      rep,
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

    const existing = await prisma.classRep.findUnique({ where: { courseId } });
    if (!existing) {
      return res.status(404).json({ message: 'No class rep found for this course' });
    }

    await prisma.classRep.delete({ where: { courseId } });

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

    const roles = await prisma.classRep.findMany({
      where: { studentId },
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
// POST /api/classrep/lecturer-attendance   — Class Rep: mark lecturer attendance
// Body: { courseId, date, time, status, notes? }
// ─────────────────────────────────────────────────────────────────────────────
export const markLecturerAttendance = async (req, res) => {
  try {
    const markedById = req.user.id;
    const { courseId, date, time, status, notes } = req.body;

    if (!courseId || !date || !time || !status) {
      return res.status(400).json({ message: 'courseId, date, time and status are required' });
    }

    if (!['present', 'absent', 'late'].includes(status)) {
      return res.status(400).json({ message: 'status must be present, absent, or late' });
    }

    // Verify this student is the class rep for this course
    const rep = await prisma.classRep.findFirst({
      where: { studentId: markedById, courseId },
    });

    if (!rep) {
      return res.status(403).json({ message: 'Access denied: You are not the class rep for this course' });
    }

    // Prevent duplicate for the same course + date
    const existing = await prisma.lecturerAttendance.findFirst({
      where: { courseId, date },
    });

    if (existing) {
      // Update instead of duplicate
      const updated = await prisma.lecturerAttendance.update({
        where: { id: existing.id },
        data: { time, status, notes: notes || null, markedById },
        include: { course: { select: { code: true, name: true } } },
      });
      return res.status(200).json({ message: 'Lecturer attendance updated', record: updated });
    }

    const record = await prisma.lecturerAttendance.create({
      data: { courseId, markedById, date, time, status, notes: notes || null },
      include: { course: { select: { code: true, name: true } } },
    });

    res.status(201).json({ message: 'Lecturer attendance recorded', record });
  } catch (error) {
    console.error('markLecturerAttendance error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// GET /api/classrep/lecturer-attendance/:courseId  — Class Rep: view past records
// ─────────────────────────────────────────────────────────────────────────────
export const getLecturerAttendanceHistory = async (req, res) => {
  try {
    const { courseId } = req.params;
    const studentId = req.user.id;

    // Verify rep role
    const rep = await prisma.classRep.findFirst({ where: { studentId, courseId } });
    if (!rep && req.user.role !== 'ADMIN' && req.user.role !== 'LECTURER') {
      return res.status(403).json({ message: 'Access denied' });
    }

    const records = await prisma.lecturerAttendance.findMany({
      where: { courseId },
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
        courseCode:  r.course.code,
        courseName:  r.course.name,
        date:        r.date,
        time:        r.time,
        status:      r.status,
        notes:       r.notes,
        markedBy:    r.markedBy.name,
        createdAt:   r.createdAt,
      }))
    );
  } catch (error) {
    console.error('getLecturerAttendanceHistory error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};
