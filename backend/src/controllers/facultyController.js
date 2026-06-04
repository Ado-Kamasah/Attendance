import prisma from '../config/db.js';

export const getFaculties = async (req, res) => {
  try {
    const faculties = await prisma.faculty.findMany({
      orderBy: { name: 'asc' }
    });
    res.status(200).json(faculties);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching faculties', error: error.message });
  }
};

export const createFaculty = async (req, res) => {
  try {
    const { name } = req.body;
    if (!name) return res.status(400).json({ message: 'Faculty name is required' });

    const faculty = await prisma.faculty.create({
      data: { name }
    });
    res.status(201).json(faculty);
  } catch (error) {
    if (error.code === 'P2002') {
      return res.status(400).json({ message: 'Faculty already exists' });
    }
    res.status(500).json({ message: 'Error creating faculty', error: error.message });
  }
};

export const deleteFaculty = async (req, res) => {
  try {
    const { id } = req.params;
    await prisma.faculty.delete({
      where: { id }
    });
    res.status(200).json({ message: 'Faculty deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting faculty', error: error.message });
  }
};

export const updateFaculty = async (req, res) => {
  try {
    const { id } = req.params;
    const { name } = req.body;
    
    if (!name) return res.status(400).json({ message: 'Faculty name is required' });

    const updatedFaculty = await prisma.faculty.update({
      where: { id },
      data: { name }
    });
    res.status(200).json(updatedFaculty);
  } catch (error) {
    if (error.code === 'P2002') {
      return res.status(400).json({ message: 'Another faculty with this name already exists' });
    }
    res.status(500).json({ message: 'Error updating faculty', error: error.message });
  }
};
