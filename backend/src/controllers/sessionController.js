import prisma from '../config/db.js';

/**
 * Generate a unique random PIN for the live session
 */
const generateUniquePin = async () => {
  let pin;
  let isUnique = false;
  let attempts = 0;
  
  while (!isUnique && attempts < 15) {
    // Generate a 4-digit PIN string (1000 - 9999)
    pin = Math.floor(1000 + Math.random() * 9000).toString();
    
    const existing = await prisma.session.findUnique({
      where: { pin }
    });
    
    if (!existing) {
      isUnique = true;
    }
    attempts++;
  }
  
  // If 4-digit is fully saturated, expand to 6 digits
  if (!isUnique) {
    pin = Math.floor(100000 + Math.random() * 900000).toString();
  }
  return pin;
};

/**
 * Lecturer starts a new live session
 */
export const startSession = async (req, res) => {
  try {
    const { courseId, pin, maxStudents } = req.body;
    const lecturerId = req.user.id;

    if (!courseId) {
      return res.status(400).json({ message: 'Course ID is required' });
    }

    // Verify course exists
    const course = await prisma.course.findUnique({
      where: { id: courseId }
    });

    if (!course) {
      return res.status(404).json({ message: 'Course not found' });
    }

    // Deactivate any active sessions for this course to prevent conflicts
    await prisma.session.updateMany({
      where: {
        courseId,
        isActive: true
      },
      data: {
        isActive: false
      }
    });

    // Establish unique PIN
    let sessionPin = pin ? pin.trim() : null;
    if (sessionPin) {
      const existingPin = await prisma.session.findUnique({
        where: { pin: sessionPin }
      });
      if (existingPin) {
        return res.status(400).json({ message: 'This PIN is currently in use by another session. Please choose a different PIN.' });
      }
    } else {
      sessionPin = await generateUniquePin();
    }

    const session = await prisma.session.create({
      data: {
        courseId,
        lecturerId,
        pin: sessionPin,
        maxStudents: maxStudents ? parseInt(maxStudents, 10) : 100,
        isActive: true
      },
      include: {
        course: {
          select: {
            code: true,
            name: true
          }
        }
      }
    });

    res.status(201).json({ message: 'Live attendance session started successfully', session });
  } catch (error) {
    console.error('Start session error:', error);
    res.status(500).json({ message: 'Server error starting session', error: error.message });
  }
};

/**
 * Fetch all active sessions
 */
export const getActiveSessions = async (req, res) => {
  try {
    const sessions = await prisma.session.findMany({
      where: { isActive: true },
      include: {
        course: {
          select: {
            code: true,
            name: true
          }
        },
        lecturer: {
          select: {
            name: true
          }
        },
        _count: {
          select: { attendances: true }
        }
      }
    });

    const formatted = sessions.map(s => ({
      id: s.id,
      courseId: s.courseId,
      courseCode: s.course.code,
      courseName: s.course.name,
      lecturerName: s.lecturer.name,
      pin: s.pin,
      maxStudents: s.maxStudents,
      currentStudents: s._count.attendances,
      createdAt: s.createdAt
    }));

    res.status(200).json(formatted);
  } catch (error) {
    console.error('Fetch active sessions error:', error);
    res.status(500).json({ message: 'Server error fetching active sessions', error: error.message });
  }
};

/**
 * Student submits PIN to mark attendance
 */
export const markAttendance = async (req, res) => {
  try {
    const { pin } = req.body;
    const studentId = req.user.id;

    if (!pin) {
      return res.status(400).json({ message: 'Session PIN is required' });
    }

    // Find active session with matching PIN
    const session = await prisma.session.findFirst({
      where: {
        pin: pin.trim(),
        isActive: true
      },
      include: {
        course: true
      }
    });

    if (!session) {
      return res.status(400).json({ message: 'Invalid PIN or session is no longer active' });
    }

    // Verify student enrollment in course
    const enrollment = await prisma.enrollment.findUnique({
      where: {
        studentId_courseId: {
          studentId,
          courseId: session.courseId
        }
      }
    });

    if (!enrollment) {
      return res.status(403).json({ message: 'Access denied: You are not enrolled in this course.' });
    }

    // Check if attendance already marked
    const existingAttendance = await prisma.attendance.findUnique({
      where: {
        sessionId_studentId: {
          sessionId: session.id,
          studentId
        }
      }
    });

    if (existingAttendance) {
      return res.status(400).json({ message: 'Attendance already recorded for this class session' });
    }

    // Check student capacity limit
    const attendanceCount = await prisma.attendance.count({
      where: { sessionId: session.id }
    });

    if (session.maxStudents > 0 && attendanceCount >= session.maxStudents) {
      return res.status(400).json({ message: 'Session has reached its maximum student capacity' });
    }

    // Record attendance check-in
    const attendance = await prisma.attendance.create({
      data: {
        sessionId: session.id,
        studentId,
        status: 'present'
      }
    });

    res.status(201).json({
      message: 'Attendance recorded successfully',
      attendance,
      courseCode: session.course.code,
      courseName: session.course.name
    });
  } catch (error) {
    console.error('Mark attendance error:', error);
    res.status(500).json({ message: 'Server error marking attendance', error: error.message });
  }
};

/**
 * Lecturer or Admin ends a live session
 */
export const endSession = async (req, res) => {
  try {
    const { sessionId } = req.params;
    const lecturerId = req.user.id;

    if (!sessionId) {
      return res.status(400).json({ message: 'Session ID is required' });
    }

    const session = await prisma.session.findUnique({
      where: { id: sessionId }
    });

    if (!session) {
      return res.status(404).json({ message: 'Session not found' });
    }

    // Verify authorized user owns this session or is admin
    if (session.lecturerId !== lecturerId && req.user.role !== 'ADMIN') {
      return res.status(403).json({ message: 'Access denied: Unauthorized to end this session' });
    }

    const updatedSession = await prisma.session.update({
      where: { id: sessionId },
      data: { isActive: false }
    });

    res.status(200).json({ message: 'Live session closed successfully', session: updatedSession });
  } catch (error) {
    console.error('End session error:', error);
    res.status(500).json({ message: 'Server error closing session', error: error.message });
  }
};

/**
 * Get checked-in students for a specific session (for live polling)
 */
export const getSessionAttendances = async (req, res) => {
  try {
    const { sessionId } = req.params;
    const attendances = await prisma.attendance.findMany({
      where: { sessionId },
      include: { student: { select: { id: true, name: true } } },
      orderBy: { timestamp: 'asc' }
    });
    res.status(200).json(attendances.map(a => ({
      id: a.id,
      studentId: a.studentId,
      name: a.student.name,
      timestamp: a.timestamp,
      status: a.status
    })));
  } catch (error) {
    console.error('Get session attendances error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};
