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
    const { name, startDate, endDate, isActive } = req.body;
    
    // If setting active, maybe we want to deactivate others, but we'll keep it simple
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
    const { name, startDate, endDate, isActive } = req.body;

    if (isActive) {
      await prisma.semester.updateMany({
        where: { isActive: true, id: { not: id } },
        data: { isActive: false }
      });
    }

    const semester = await prisma.semester.update({
      where: { id },
      data: {
        name,
        startDate: startDate ? new Date(startDate) : null,
        endDate: endDate ? new Date(endDate) : null,
        isActive
      }
    });

    res.status(200).json(semester);
  } catch (error) {
    console.error('Error updating semester:', error);
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
