import prisma from '../config/db.js';

/**
 * Admin creates a new course
 */
export const createCourse = async (req, res) => {
  try {
    const { code, name, credits, program, level, status } = req.body;

    if (!code || !name || !credits || !program || !level) {
      return res.status(400).json({ message: 'Missing required fields' });
    }

    // Check code uniqueness
    const existingCourse = await prisma.course.findUnique({
      where: { code: code.trim().toUpperCase() }
    });

    if (existingCourse) {
      return res.status(400).json({ message: 'Course with this code already exists' });
    }

    const course = await prisma.course.create({
      data: {
        code: code.trim().toUpperCase(),
        name: name.trim(),
        credits: parseInt(credits, 10),
        program: program.trim(),
        level: level.trim(),
        status: status || 'active'
      }
    });

    res.status(201).json({ message: 'Course created successfully', course });
  } catch (error) {
    console.error('Create course error:', error);
    res.status(500).json({ message: 'Server error creating course', error: error.message });
  }
};

/**
 * Get courses list with optional query filters
 */
export const getCourses = async (req, res) => {
  try {
    const { program, level, status } = req.query;

    const where = {};
    if (program) where.program = program;
    if (level) where.level = level;
    if (status) where.status = status;

    const courses = await prisma.course.findMany({
      where,
      orderBy: { code: 'asc' }
    });

    res.status(200).json(courses);
  } catch (error) {
    console.error('Fetch courses error:', error);
    res.status(500).json({ message: 'Server error fetching courses', error: error.message });
  }
};

/**
 * Enroll a student in a course
 */
export const enrollInCourse = async (req, res) => {
  try {
    const { courseId } = req.params;
    let studentId = req.user.id;

    // Admins can enroll any student
    if (req.user.role === 'ADMIN' && req.body.studentId) {
      studentId = req.body.studentId;
    }

    if (!courseId) {
      return res.status(400).json({ message: 'Course ID is required' });
    }

    const course = await prisma.course.findUnique({
      where: { id: courseId }
    });

    if (!course) {
      return res.status(404).json({ message: 'Course not found' });
    }

    const student = await prisma.user.findUnique({
      where: { id: studentId }
    });

    if (!student || student.role !== 'STUDENT') {
      return res.status(400).json({ message: 'Invalid student ID. Enrolled users must have the STUDENT role.' });
    }

    // Verify duplicate enrollments
    const existingEnrollment = await prisma.enrollment.findUnique({
      where: {
        studentId_courseId: {
          studentId,
          courseId
        }
      }
    });

    if (existingEnrollment) {
      return res.status(400).json({ message: 'Student is already registered for this course' });
    }

    const enrollment = await prisma.enrollment.create({
      data: {
        studentId,
        courseId
      }
    });

    res.status(201).json({ message: 'Student registered in course successfully', enrollment });
  } catch (error) {
    console.error('Enroll course error:', error);
    res.status(500).json({ message: 'Server error enrolling in course', error: error.message });
  }
};

/**
 * Get courses the student is currently enrolled in
 */
export const getStudentEnrollments = async (req, res) => {
  try {
    let studentId = req.user.id;

    if ((req.user.role === 'ADMIN' || req.user.role === 'LECTURER') && req.query.studentId) {
      studentId = req.query.studentId;
    }

    const enrollments = await prisma.enrollment.findMany({
      where: { studentId },
      include: {
        course: true
      }
    });

    const enrolledCourses = enrollments.map(e => e.course);
    res.status(200).json(enrolledCourses);
  } catch (error) {
    console.error('Fetch student enrollments error:', error);
    res.status(500).json({ message: 'Server error fetching enrollments', error: error.message });
  }
};

/**
 * Get courses available for student registration (same program/level, not yet enrolled)
 */
export const getAvailableCoursesForStudent = async (req, res) => {
  try {
    const studentId = req.user.id;
    const student = await prisma.user.findUnique({
      where: { id: studentId }
    });

    if (!student || student.role !== 'STUDENT') {
      return res.status(400).json({ message: 'Only student accounts can fetch registration options.' });
    }

    // Find enrolled IDs
    const studentEnrollments = await prisma.enrollment.findMany({
      where: { studentId },
      select: { courseId: true }
    });
    const enrolledCourseIds = studentEnrollments.map(e => e.courseId);

    // Find active courses matching student's program and level
    const availableCourses = await prisma.course.findMany({
      where: {
        program: student.program,
        status: 'active',
        id: {
          notIn: enrolledCourseIds.length > 0 ? enrolledCourseIds : undefined
        }
      }
    });

    res.status(200).json(availableCourses);
  } catch (error) {
    console.error('Fetch available courses error:', error);
    res.status(500).json({ message: 'Server error fetching available courses', error: error.message });
  }
};

/**
 * Get students enrolled in a specific course
 */
export const getCourseStudents = async (req, res) => {
  try {
    const { courseId } = req.params;
    
    if (!courseId) {
      return res.status(400).json({ message: 'Course ID is required' });
    }

    const enrollments = await prisma.enrollment.findMany({
      where: { courseId },
      include: {
        student: {
          select: {
            id: true,
            name: true,
            email: true,
            program: true
          }
        }
      }
    });

    const students = enrollments.map(e => ({
      id: e.student.id,
      name: e.student.name,
      studentId: e.student.id, // For display purposes
      email: e.student.email,
      program: e.student.program
    }));

    res.status(200).json(students);
  } catch (error) {
    console.error('Fetch course students error:', error);
    res.status(500).json({ message: 'Server error fetching students', error: error.message });
  }
};
