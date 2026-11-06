import prisma from '../config/db.js';

export const getSemesters = async (req, res) => {
  try {
    const semesters = await prisma.semester.findMany({
      orderBy: { createdAt: 'desc' }
    });
    res.status(200).json(semesters);
  } catch (error) {
    console.error('Error fetching semesters:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

export const createSemester = async (req, res) => {
  try {
    const {
      name,
      startDate,
      endDate,
      examsStart,
      examsEnd,
      registrationDeadline,
      registrationOpen,
      isActive
    } = req.body;

    if (isActive) {
      await prisma.semester.updateMany({
        where: { isActive: true },
        data: { isActive: false }
      });
    }

    const semester = await prisma.semester.create({
      data: {
        name,
        startDate: startDate ? new Date(startDate) : null,
        endDate: endDate ? new Date(endDate) : null,
        examsStart: examsStart ? new Date(examsStart) : null,
        examsEnd: examsEnd ? new Date(examsEnd) : null,
        registrationDeadline: registrationDeadline ? new Date(registrationDeadline) : null,
        registrationOpen: registrationOpen !== undefined ? Boolean(registrationOpen) : true,
        isActive: isActive || false
      }
    });

    res.status(201).json(semester);
  } catch (error) {
    console.error('Error creating semester:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

export const updateSemester = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      name,
      startDate,
      endDate,
      examsStart,
      examsEnd,
      registrationDeadline,
      registrationOpen,
      isActive
    } = req.body;

    if (isActive) {
      await prisma.semester.updateMany({
        where: { isActive: true, id: { not: id } },
        data: { isActive: false }
      });
    }

    const data = {};
    if (name !== undefined) data.name = name;
    if (startDate !== undefined) data.startDate = startDate ? new Date(startDate) : null;
    if (endDate !== undefined) data.endDate = endDate ? new Date(endDate) : null;
    if (examsStart !== undefined) data.examsStart = examsStart ? new Date(examsStart) : null;
    if (examsEnd !== undefined) data.examsEnd = examsEnd ? new Date(examsEnd) : null;
    if (registrationDeadline !== undefined)
      data.registrationDeadline = registrationDeadline ? new Date(registrationDeadline) : null;
    if (registrationOpen !== undefined) data.registrationOpen = Boolean(registrationOpen);
    if (isActive !== undefined) data.isActive = Boolean(isActive);

    const semester = await prisma.semester.update({ where: { id }, data });
    res.status(200).json(semester);
  } catch (error) {
    console.error('Error updating semester:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

/**
 * Toggle course registration open/closed for a specific semester.
 * PATCH /api/semesters/:id/registration
 * Body: { registrationOpen: boolean, registrationDeadline?: string }
 */
export const toggleRegistration = async (req, res) => {
  try {
    const { id } = req.params;
    const { registrationOpen, registrationDeadline } = req.body;

    if (typeof registrationOpen !== 'boolean') {
      return res.status(400).json({ message: 'registrationOpen must be a boolean' });
    }

    const data = { registrationOpen };
    if (registrationDeadline !== undefined) {
      data.registrationDeadline = registrationDeadline ? new Date(registrationDeadline) : null;
    }

    const semester = await prisma.semester.update({ where: { id }, data });
    res.status(200).json({
      message: `Course registration ${registrationOpen ? 'opened' : 'closed'} successfully`,
      semester
    });
  } catch (error) {
    console.error('Error toggling registration:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

export const deleteSemester = async (req, res) => {
  try {
    const { id } = req.params;
    await prisma.semester.delete({ where: { id } });
    res.status(200).json({ message: 'Semester deleted successfully' });
  } catch (error) {
    console.error('Error deleting semester:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};
