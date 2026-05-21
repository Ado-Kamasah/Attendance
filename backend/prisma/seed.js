import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding database with initial records...');

  // 1. Hash password strings
  const adminPasswordHash = await bcrypt.hash('AdminPassword123', 10);
  const staffPasswordHash = await bcrypt.hash('StaffPassword123', 10);
  const studentPasswordHash = await bcrypt.hash('StudentPassword123', 10);

  // 2. Create Users
  // Admins
  const admin = await prisma.user.upsert({
    where: { email: 'admin@southshore.edu.gh' },
    update: {},
    create: {
      id: 'admin-001',
      email: 'admin@southshore.edu.gh',
      passwordHash: adminPasswordHash,
      name: 'Admin User',
      role: 'ADMIN'
    }
  });

  // Lecturers
  const lecturer1 = await prisma.user.upsert({
    where: { email: 'kwame@southshore.edu.gh' },
    update: {},
    create: {
      id: 'STAFF/KWAME',
      email: 'kwame@southshore.edu.gh',
      passwordHash: staffPasswordHash,
      name: 'Dr. Kwame Nkrumah',
      role: 'LECTURER'
    }
  });

  const lecturer2 = await prisma.user.upsert({
    where: { email: 'frimpong@southshore.edu.gh' },
    update: {},
    create: {
      id: 'STAFF/FRIMPONG',
      email: 'frimpong@southshore.edu.gh',
      passwordHash: staffPasswordHash,
      name: 'Prof. Frimpong Boateng',
      role: 'LECTURER'
    }
  });

  const lecturer3 = await prisma.user.upsert({
    where: { email: 'oseitutu@southshore.edu.gh' },
    update: {},
    create: {
      id: 'STAFF/OSEITUTU',
      email: 'oseitutu@southshore.edu.gh',
      passwordHash: staffPasswordHash,
      name: 'Dr. Osei Tutu',
      role: 'LECTURER'
    }
  });

  // Students
  const studentCS = await prisma.user.upsert({
    where: { email: 'studentcs@southshore.edu.gh' },
    update: {},
    create: {
      id: 'BSC/CSM/2026/01',
      email: 'studentcs@southshore.edu.gh',
      passwordHash: studentPasswordHash,
      name: 'Student CS',
      role: 'STUDENT',
      program: 'Computer Science'
    }
  });

  const studentBiz = await prisma.user.upsert({
    where: { email: 'studentbiz@southshore.edu.gh' },
    update: {},
    create: {
      id: 'BBA/2026/01',
      email: 'studentbiz@southshore.edu.gh',
      passwordHash: studentPasswordHash,
      name: 'Student Business',
      role: 'STUDENT',
      program: 'Business'
    }
  });

  console.log('Seeded users.');

  // 3. Create Courses
  const csc101 = await prisma.course.upsert({
    where: { code: 'CSC 101' },
    update: {},
    create: {
      code: 'CSC 101',
      name: 'Introduction to Computer Science',
      credits: 3,
      program: 'Computer Science',
      level: '100',
      status: 'active'
    }
  });

  const mth102 = await prisma.course.upsert({
    where: { code: 'MTH 102' },
    update: {},
    create: {
      code: 'MTH 102',
      name: 'Calculus I',
      credits: 4,
      program: 'Computer Science',
      level: '100',
      status: 'active'
    }
  });

  const bba101 = await prisma.course.upsert({
    where: { code: 'BBA 101' },
    update: {},
    create: {
      code: 'BBA 101',
      name: 'Introduction to Business Administration',
      credits: 3,
      program: 'Business',
      level: '100',
      status: 'active'
    }
  });

  const mkt201 = await prisma.course.upsert({
    where: { code: 'MKT 201' },
    update: {},
    create: {
      code: 'MKT 201',
      name: 'Marketing Principles',
      credits: 3,
      program: 'Business',
      level: '200',
      status: 'active'
    }
  });

  console.log('Seeded courses.');

  // 4. Enrollments (Students to Courses)
  await prisma.enrollment.upsert({
    where: {
      studentId_courseId: {
        studentId: studentCS.id,
        courseId: csc101.id
      }
    },
    update: {},
    create: {
      studentId: studentCS.id,
      courseId: csc101.id
    }
  });

  await prisma.enrollment.upsert({
    where: {
      studentId_courseId: {
        studentId: studentCS.id,
        courseId: mth102.id
      }
    },
    update: {},
    create: {
      studentId: studentCS.id,
      courseId: mth102.id
    }
  });

  await prisma.enrollment.upsert({
    where: {
      studentId_courseId: {
        studentId: studentBiz.id,
        courseId: bba101.id
      }
    },
    update: {},
    create: {
      studentId: studentBiz.id,
      courseId: bba101.id
    }
  });

  await prisma.enrollment.upsert({
    where: {
      studentId_courseId: {
        studentId: studentBiz.id,
        courseId: mkt201.id
      }
    },
    update: {},
    create: {
      studentId: studentBiz.id,
      courseId: mkt201.id
    }
  });

  console.log('Seeded course enrollments.');

  // 5. Weekly master schedule entries
  const currentDayName = new Date().toLocaleDateString('en-US', { weekday: 'long' });

  // Clear existing schedules to seed cleanly
  await prisma.schedule.deleteMany({});

  await prisma.schedule.create({
    data: {
      courseId: csc101.id,
      level: '100',
      mode: 'Regular',
      day: currentDayName,
      startTime: '08:00',
      endTime: '10:00',
      venue: 'Hall A',
      lecturer: 'Dr. Kwame Nkrumah'
    }
  });

  await prisma.schedule.create({
    data: {
      courseId: mth102.id,
      level: '100',
      mode: 'Regular',
      day: 'Monday',
      startTime: '10:30',
      endTime: '12:30',
      venue: 'Hall B',
      lecturer: 'Prof. Frimpong Boateng'
    }
  });

  await prisma.schedule.create({
    data: {
      courseId: bba101.id,
      level: '100',
      mode: 'Regular',
      day: currentDayName,
      startTime: '14:00',
      endTime: '16:00',
      venue: 'Hall C',
      lecturer: 'Dr. Osei Tutu'
    }
  });

  await prisma.schedule.create({
    data: {
      courseId: mkt201.id,
      level: '200',
      mode: 'Weekend',
      day: 'Saturday',
      startTime: '09:00',
      endTime: '12:00',
      venue: 'Room 3',
      lecturer: 'Prof. Jane Naana Opoku-Agyemang'
    }
  });

  console.log('Seeded schedules.');
  console.log('Database seeding complete!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
