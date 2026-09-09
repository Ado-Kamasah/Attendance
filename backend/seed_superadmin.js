import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';
import prisma from './src/config/db.js';

dotenv.config();

async function seedSuperAdmin() {
  try {
    const existing = await prisma.user.findFirst({
      where: {
        OR: [
          { id: 'superadmin-001' },
          { email: 'superadmin@southshore.edu.gh' },
          { role: 'SUPER_ADMIN' }
        ]
      }
    });

    if (existing) {
      console.log('Super Admin already exists:', existing.email, 'Role:', existing.role);
      // Ensure role is SUPER_ADMIN
      if (existing.role !== 'SUPER_ADMIN') {
        const updated = await prisma.user.update({
          where: { id: existing.id },
          data: { role: 'SUPER_ADMIN' }
        });
        console.log('Updated user to SUPER_ADMIN:', updated.id);
      }
      return;
    }

    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash('SuperAdminPassword123', salt);

    const superAdmin = await prisma.user.create({
      data: {
        id: 'superadmin-001',
        email: 'superadmin@southshore.edu.gh',
        passwordHash,
        name: 'Super Administrator',
        role: 'SUPER_ADMIN',
        program: null
      }
    });

    console.log('✅ Super Admin created successfully:', superAdmin.email, `(ID: ${superAdmin.id})`);
  } catch (err) {
    console.error('Error seeding super admin:', err);
  } finally {
    await prisma.$disconnect();
  }
}

seedSuperAdmin();
