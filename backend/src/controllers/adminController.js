import prisma from '../config/db.js';

export const getDashboardStats = async (req, res) => {
  try {
    const totalStudents = await prisma.user.count({ where: { role: 'STUDENT' } });
    
    // Average Attendance
    const totalSessions = await prisma.session.count();
    const totalAttendances = await prisma.attendance.count({ where: { status: 'present' } });
    
    // Naive way: total expected attendances = totalSessions * maxStudents? 
    // Or we just get average attendance per session.
    // Let's get total attendances vs total possible enrollments for those sessions.
    // For simplicity, just fetch all sessions with their attendance count and enrolled count.
    const sessions = await prisma.session.findMany({
      include: {
        course: {
          include: {
            enrollments: true
          }
        },
        _count: {
          select: { attendances: true }
        }
      }
    });

    let possibleAttendances = 0;
    let actualAttendances = 0;
    
    sessions.forEach(s => {
      possibleAttendances += s.course.enrollments.length;
      actualAttendances += s._count.attendances;
    });

    const averageAttendance = possibleAttendances > 0 
      ? Math.round((actualAttendances / possibleAttendances) * 100) 
      : 0;

    // Flagged absences: any attendance marked as 'absent' if you use that status, 
    // or just calculate (possible - actual)
    const flaggedAbsences = possibleAttendances - actualAttendances;

    res.status(200).json({
      totalStudents,
      averageAttendance,
      flaggedAbsences: flaggedAbsences > 0 ? flaggedAbsences : 0
    });
  } catch (error) {
    console.error('Error fetching admin dashboard stats:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

export const getAuditLogs = async (req, res) => {
  try {
    const logs = await prisma.auditLog.findMany({
      orderBy: { timestamp: 'desc' },
      take: 50
    });
    res.status(200).json(logs);
  } catch (error) {
    console.error('Error fetching audit logs:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

export const createAuditLog = async (req, res) => {
  try {
    const { action, details } = req.body;
    const log = await prisma.auditLog.create({
      data: {
        action,
        details,
        userId: req.user.id,
        userRole: req.user.role,
        userName: req.user.name
      }
    });
    res.status(201).json(log);
  } catch (error) {
    console.error('Error creating audit log:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

/**
 * Get all lecturer accounts (Admin only)
 */
export const getLecturers = async (req, res) => {
  try {
    const lecturers = await prisma.user.findMany({
      where: { role: 'LECTURER' },
      select: { id: true, name: true, email: true }
    });
    res.status(200).json(lecturers);
  } catch (error) {
    console.error('Error fetching lecturers:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

/**
 * Assign a lecturer to a course by creating/replacing a Schedule entry (Admin only)
 * Body: { lecturerId, lecturerName, day, startTime, endTime, venue, mode }
 */
export const assignLecturerToCourse = async (req, res) => {
  try {
    const { courseId } = req.params;
    const { lecturerId, lecturerName, day, startTime, endTime, venue, mode } = req.body;

    if (!courseId || !lecturerId || !lecturerName || !day || !startTime || !endTime || !venue) {
      return res.status(400).json({ message: 'Missing required fields' });
    }

    const course = await prisma.course.findUnique({ where: { id: courseId } });
    if (!course) {
      return res.status(404).json({ message: 'Course not found' });
    }

    // Check if a schedule already exists for this course and delete it to replace
    const existing = await prisma.schedule.findFirst({ where: { courseId } });
    if (existing) {
      await prisma.schedule.delete({ where: { id: existing.id } });
    }

    // Create the new schedule linking the lecturer to the course
    const schedule = await prisma.schedule.create({
      data: {
        courseId,
        level: course.level,
        mode: mode || 'Lecture',
        day,
        startTime,
        endTime,
        venue,
        lecturer: lecturerName
      }
    });

    res.status(201).json({ message: 'Lecturer assigned to course successfully', schedule });
  } catch (error) {
    console.error('Error assigning lecturer:', error);
    res.status(500).json({ message: 'Server error assigning lecturer', error: error.message });
  }
};
