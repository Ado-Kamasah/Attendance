import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import prisma from '../config/db.js';

const JWT_SECRET = process.env.JWT_SECRET || 'super_secret_key_for_attendance_system_2026_dev';

/**
 * Handle user registration
 */
export const register = async (req, res) => {
  try {
    const { fullName, email, role, idNumber, password, program } = req.body;

    if (!fullName || !email || !role || !password) {
      return res.status(400).json({ message: 'Missing required fields' });
    }

    // Map role string to Database Enum Role
    let prismaRole;
    const lowerRole = role.toLowerCase();
    if (lowerRole === 'student') {
      prismaRole = 'STUDENT';
    } else if (lowerRole === 'staff' || lowerRole === 'lecturer') {
      prismaRole = 'LECTURER';
    } else if (lowerRole === 'admin') {
      prismaRole = 'ADMIN';
    } else {
      return res.status(400).json({ message: 'Invalid role provided' });
    }

    // Determine ID to use (student/staff ID or email/uuid)
    const userId = idNumber ? idNumber.trim() : (prismaRole === 'ADMIN' ? `admin-${Date.now()}` : email.trim());

    // Check if user already exists
    const existingUser = await prisma.user.findFirst({
      where: {
        OR: [
          { id: userId },
          { email: email.trim().toLowerCase() }
        ]
      }
    });

    if (existingUser) {
      return res.status(400).json({ message: 'User with this ID or Email already exists' });
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);

    // Auto-detect program if student and not provided
    let userProgram = program;
    if (prismaRole === 'STUDENT' && !userProgram) {
      const idUpper = userId.toUpperCase();
      if (idUpper.startsWith('BSC/CSM/')) {
        userProgram = 'Computer Science';
      } else if (idUpper.startsWith('BBA/')) {
        userProgram = 'Business';
      } else {
        userProgram = 'General Science';
      }
    }

    // Create user in DB
    const user = await prisma.user.create({
      data: {
        id: userId,
        email: email.trim().toLowerCase(),
        passwordHash,
        name: fullName.trim(),
        role: prismaRole,
        program: userProgram || null
      }
    });

    // Create token
    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role },
      JWT_SECRET,
      { expiresIn: '24h' }
    );

    res.status(201).json({
      message: 'User registered successfully',
      token,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        program: user.program
      }
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ message: 'Server error during registration', error: error.message });
  }
};

/**
 * Handle user login
 */
export const login = async (req, res) => {
  try {
    const { loginId, password, role } = req.body;

    if (!loginId || !password) {
      return res.status(400).json({ message: 'ID/Email and password are required' });
    }

    // Find user by ID or Email
    const user = await prisma.user.findFirst({
      where: {
        OR: [
          { id: loginId.trim() },
          { email: loginId.trim().toLowerCase() }
        ]
      }
    });

    if (!user) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    // Compare passwords
    const isMatch = await bcrypt.compare(password, user.passwordHash);
    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    // If role is passed, verify role matches (case-insensitive checks)
    if (role) {
      let expectedRole = role.toUpperCase();
      if (expectedRole === 'STAFF') expectedRole = 'LECTURER';
      if (user.role !== expectedRole) {
        return res.status(400).json({ message: `Access denied: registered as ${user.role}` });
      }
    }

    // Sign JWT token
    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role },
      JWT_SECRET,
      { expiresIn: '24h' }
    );

    res.status(200).json({
      message: 'Login successful',
      token,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        program: user.program
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Server error during login', error: error.message });
  }
};

/**
 * Fetch profile of current logged-in user
 */
export const getProfile = async (req, res) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user.id }
    });

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.status(200).json({
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
      program: user.program,
      createdAt: user.createdAt
    });
  } catch (error) {
    console.error('Profile fetch error:', error);
    res.status(500).json({ message: 'Server error fetching profile', error: error.message });
  }
};
