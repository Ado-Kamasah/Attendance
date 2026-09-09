import bcrypt from 'bcryptjs';
import prisma from '../config/db.js';

/**
 * Get all users with optional filtering (search, role, program) and statistical breakdown
 */
export const getAllUsers = async (req, res) => {
  try {
    const { q, role, program } = req.query;

    const where = {};

    if (role && role !== 'all') {
      where.role = role.toUpperCase();
    }

    if (program && program !== 'all') {
      where.program = program;
    }

    if (q && q.trim()) {
      const searchTerm = q.trim().toLowerCase();
      where.OR = [
        { name: { contains: searchTerm } },
        { email: { contains: searchTerm } },
        { id: { contains: searchTerm } }
      ];
    }

    const [users, totalCount, studentCount, lecturerCount, adminCount, superAdminCount, financeCount] = await Promise.all([
      prisma.user.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        select: {
          id: true,
          name: true,
          email: true,
          role: true,
          program: true,
          createdAt: true,
          updatedAt: true,
          _count: {
            select: {
              enrollments: true,
              attendances: true,
              sessions: true
            }
          }
        }
      }),
      prisma.user.count(),
      prisma.user.count({ where: { role: 'STUDENT' } }),
      prisma.user.count({ where: { role: 'LECTURER' } }),
      prisma.user.count({ where: { role: 'ADMIN' } }),
      prisma.user.count({ where: { role: 'SUPER_ADMIN' } }),
      prisma.user.count({ where: { role: 'FINANCE' } })
    ]);

    res.status(200).json({
      users,
      stats: {
        total: totalCount,
        students: studentCount,
        lecturers: lecturerCount,
        admins: adminCount,
        superAdmins: superAdminCount,
        finance: financeCount
      }
    });
  } catch (error) {
    console.error('Error fetching users:', error);
    res.status(500).json({ message: 'Failed to retrieve users', error: error.message });
  }
};

/**
 * Get single user by ID
 */
export const getUserById = async (req, res) => {
  try {
    const { id } = req.params;
    const user = await prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        program: true,
        createdAt: true,
        updatedAt: true
      }
    });

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.status(200).json(user);
  } catch (error) {
    console.error('Error fetching user by ID:', error);
    res.status(500).json({ message: 'Failed to retrieve user', error: error.message });
  }
};

/**
 * Create a new user (Super Admin only)
 */
export const createUser = async (req, res) => {
  try {
    const { id, name, email, role, password, program } = req.body;

    if (!name || !email || !role || !password) {
      return res.status(400).json({ message: 'Name, email, role, and password are required' });
    }

    if (password.length < 6) {
      return res.status(400).json({ message: 'Password must be at least 6 characters long' });
    }

    // Normalize and validate role
    let normalizedRole = role.toUpperCase().replace(/[\s_-]+/g, '_');
    if (normalizedRole === 'SUPERADMIN') normalizedRole = 'SUPER_ADMIN';
    if (normalizedRole === 'STAFF') normalizedRole = 'LECTURER';

    const validRoles = ['STUDENT', 'LECTURER', 'ADMIN', 'FINANCE', 'SUPER_ADMIN'];
    if (!validRoles.includes(normalizedRole)) {
      return res.status(400).json({ message: `Invalid role. Allowed: ${validRoles.join(', ')}` });
    }

    const cleanEmail = email.trim().toLowerCase();
    const cleanId = id && id.trim() ? id.trim() : (
      normalizedRole === 'SUPER_ADMIN' ? `superadmin-${Date.now()}` :
      normalizedRole === 'ADMIN' ? `admin-${Date.now()}` :
      normalizedRole === 'LECTURER' ? `STAFF/${Date.now().toString().slice(-5)}` :
      `STU/${Date.now().toString().slice(-6)}`
    );

    // Check conflict
    const existing = await prisma.user.findFirst({
      where: {
        OR: [
          { id: cleanId },
          { email: cleanEmail }
        ]
      }
    });

    if (existing) {
      return res.status(400).json({
        message: existing.id === cleanId
          ? `User with ID '${cleanId}' already exists`
          : `User with email '${cleanEmail}' already exists`
      });
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);

    const newUser = await prisma.user.create({
      data: {
        id: cleanId,
        name: name.trim(),
        email: cleanEmail,
        passwordHash,
        role: normalizedRole,
        program: program ? program.trim() : null
      },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        program: true,
        createdAt: true,
        updatedAt: true
      }
    });

    // Create Audit Log
    try {
      await prisma.auditLog.create({
        data: {
          action: 'CREATE_USER',
          details: `Super Admin created user ${newUser.name} (${newUser.id}) with role ${newUser.role}`,
          userId: req.user?.id || 'system',
          userRole: req.user?.role || 'SUPER_ADMIN',
          userName: req.user?.name || 'Super Admin'
        }
      });
    } catch (auditErr) {
      console.warn('Failed to write audit log:', auditErr.message);
    }

    res.status(201).json({
      message: 'User created successfully',
      user: newUser
    });
  } catch (error) {
    console.error('Error creating user:', error);
    res.status(500).json({ message: 'Failed to create user', error: error.message });
  }
};

/**
 * Update an existing user (Super Admin only)
 */
export const updateUser = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, email, role, program, password } = req.body;

    const existingUser = await prisma.user.findUnique({ where: { id } });
    if (!existingUser) {
      return res.status(404).json({ message: 'User not found' });
    }

    const updateData = {};

    if (name && name.trim()) {
      updateData.name = name.trim();
    }

    if (email && email.trim()) {
      const cleanEmail = email.trim().toLowerCase();
      if (cleanEmail !== existingUser.email) {
        const emailTaken = await prisma.user.findUnique({ where: { email: cleanEmail } });
        if (emailTaken) {
          return res.status(400).json({ message: `Email '${cleanEmail}' is already registered to another user` });
        }
        updateData.email = cleanEmail;
      }
    }

    if (role) {
      let normalizedRole = role.toUpperCase().replace(/[\s_-]+/g, '_');
      if (normalizedRole === 'SUPERADMIN') normalizedRole = 'SUPER_ADMIN';
      if (normalizedRole === 'STAFF') normalizedRole = 'LECTURER';

      const validRoles = ['STUDENT', 'LECTURER', 'ADMIN', 'FINANCE', 'SUPER_ADMIN'];
      if (!validRoles.includes(normalizedRole)) {
        return res.status(400).json({ message: `Invalid role. Allowed: ${validRoles.join(', ')}` });
      }
      updateData.role = normalizedRole;
    }

    if (program !== undefined) {
      updateData.program = program ? program.trim() : null;
    }

    if (password && password.trim()) {
      if (password.length < 6) {
        return res.status(400).json({ message: 'New password must be at least 6 characters long' });
      }
      const salt = await bcrypt.genSalt(10);
      updateData.passwordHash = await bcrypt.hash(password.trim(), salt);
    }

    const updatedUser = await prisma.user.update({
      where: { id },
      data: updateData,
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        program: true,
        createdAt: true,
        updatedAt: true
      }
    });

    // Create Audit Log
    try {
      await prisma.auditLog.create({
        data: {
          action: 'UPDATE_USER',
          details: `Super Admin updated user ${updatedUser.name} (${updatedUser.id})`,
          userId: req.user?.id || 'system',
          userRole: req.user?.role || 'SUPER_ADMIN',
          userName: req.user?.name || 'Super Admin'
        }
      });
    } catch (auditErr) {
      console.warn('Failed to write audit log:', auditErr.message);
    }

    res.status(200).json({
      message: 'User updated successfully',
      user: updatedUser
    });
  } catch (error) {
    console.error('Error updating user:', error);
    res.status(500).json({ message: 'Failed to update user', error: error.message });
  }
};

/**
 * Delete an existing user (Super Admin only)
 * Safely cascades relations in a transaction to prevent constraint errors
 */
export const deleteUser = async (req, res) => {
  try {
    const { id } = req.params;

    // Prevent deleting one's own account
    if (req.user && req.user.id === id) {
      return res.status(400).json({ message: 'You cannot delete your own Super Admin account' });
    }

    const existingUser = await prisma.user.findUnique({ where: { id } });
    if (!existingUser) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Clean up dependent records safely via transaction
    await prisma.$transaction(async (tx) => {
      // 1. Delete student notifications
      await tx.studentNotification.deleteMany({ where: { studentId: id } });

      // 2. Delete attendances
      await tx.attendance.deleteMany({ where: { studentId: id } });

      // 3. Delete enrollments
      await tx.enrollment.deleteMany({ where: { studentId: id } });

      // 4. Delete class rep records
      await tx.classRep.deleteMany({ where: { studentId: id } });

      // 5. Delete lecturer attendances marked by this user
      await tx.lecturerAttendance.deleteMany({ where: { markedById: id } });

      // 6. Delete suggestions submitted by this user
      await tx.suggestion.deleteMany({ where: { studentId: id } });

      // 7. Delete lecturer sessions (and their associated attendances)
      const sessions = await tx.session.findMany({
        where: { lecturerId: id },
        select: { id: true }
      });
      if (sessions.length > 0) {
        const sessionIds = sessions.map(s => s.id);
        await tx.attendance.deleteMany({ where: { sessionId: { in: sessionIds } } });
        await tx.session.deleteMany({ where: { lecturerId: id } });
      }

      // 8. Finally delete the user
      await tx.user.delete({ where: { id } });
    });

    // Create Audit Log
    try {
      await prisma.auditLog.create({
        data: {
          action: 'DELETE_USER',
          details: `Super Admin deleted user ${existingUser.name} (${existingUser.id}) [Role: ${existingUser.role}]`,
          userId: req.user?.id || 'system',
          userRole: req.user?.role || 'SUPER_ADMIN',
          userName: req.user?.name || 'Super Admin'
        }
      });
    } catch (auditErr) {
      console.warn('Failed to write audit log:', auditErr.message);
    }

    res.status(200).json({
      message: `User '${existingUser.name}' (${existingUser.id}) was successfully deleted`
    });
  } catch (error) {
    console.error('Error deleting user:', error);
    res.status(500).json({ message: 'Failed to delete user', error: error.message });
  }
};
