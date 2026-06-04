import prisma from '../config/db.js';

/**
 * Create a new schedule entry (Admin only)
 */
export const createSchedule = async (req, res) => {
  try {
    const { courseId, level, mode, day, startTime, endTime, venue, lecturer } = req.body;

    if (!courseId || !level || !mode || !day || !startTime || !endTime || !venue || !lecturer) {
      return res.status(400).json({ message: 'Missing required fields' });
    }

    const course = await prisma.course.findUnique({
      where: { id: courseId }
    });

    if (!course) {
      return res.status(404).json({ message: 'Course not found' });
    }

    const schedule = await prisma.schedule.create({
      data: {
        courseId,
        level,
        mode,
        day,
        startTime,
        endTime,
        venue,
        lecturer
      }
    });

    res.status(201).json({ message: 'Schedule entry created successfully', schedule });
  } catch (error) {
    console.error('Create schedule error:', error);
    res.status(500).json({ message: 'Server error creating schedule', error: error.message });
  }
};

/**
 * Fetch list of schedules
 */
export const getSchedules = async (req, res) => {
  try {
    const { level, mode, courseId } = req.query;

    const where = {};
    if (level) where.level = level;
    if (mode) where.mode = mode;
    if (courseId) where.courseId = courseId;

    const schedules = await prisma.schedule.findMany({
      where,
      include: {
        course: {
          select: {
            code: true,
            name: true,
            semester: true,
            _count: {
              select: { enrollments: true }
            }
          }
        }
      },
      orderBy: [
        { day: 'asc' },
        { startTime: 'asc' }
      ]
    });

    res.status(200).json(schedules);
  } catch (error) {
    console.error('Fetch schedules error:', error);
    res.status(500).json({ message: 'Server error fetching schedules', error: error.message });
  }
};

/**
 * Delete a schedule entry (Admin only)
 */
export const deleteSchedule = async (req, res) => {
  try {
    const { id } = req.params;
    
    if (!id) {
      return res.status(400).json({ message: 'Schedule ID is required' });
    }

    const schedule = await prisma.schedule.findUnique({
      where: { id }
    });

    if (!schedule) {
      return res.status(404).json({ message: 'Schedule not found' });
    }

    await prisma.schedule.delete({
      where: { id }
    });

    res.status(200).json({ message: 'Schedule deleted successfully' });
  } catch (error) {
    console.error('Delete schedule error:', error);
    res.status(500).json({ message: 'Server error deleting schedule', error: error.message });
  }
};
