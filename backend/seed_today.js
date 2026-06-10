import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
  // Fetch existing data
  const courses = await prisma.course.findMany({ select: { id: true, code: true, name: true, level: true } });
  const lecturers = await prisma.user.findMany({ where: { role: 'LECTURER' }, select: { id: true, name: true } });

  console.log('=== COURSES ===');
  courses.forEach(c => console.log(`  ${c.id} | ${c.code} | ${c.name} | Level ${c.level}`));
  console.log('\n=== LECTURERS ===');
  lecturers.forEach(l => console.log(`  ${l.id} | ${l.name}`));

  if (courses.length === 0) {
    console.log('\nNo courses found! Please create a course first via the Admin panel.');
    return;
  }

  const course = courses[0]; // Pick first course
  const lecturerName = lecturers.length > 0 ? lecturers[0].name : 'Dr. Mensah';

  // Check if Wednesday schedule already exists for this course
  const existing = await prisma.schedule.findFirst({
    where: { courseId: course.id, day: 'Wednesday', startTime: '14:00' }
  });

  if (existing) {
    console.log(`\nSchedule already exists for ${course.code} on Wednesday 14:00-18:00 (id: ${existing.id})`);
  } else {
    const schedule = await prisma.schedule.create({
      data: {
        courseId: course.id,
        level: course.level,
        mode: 'Regular',
        day: 'Wednesday',
        startTime: '14:00',
        endTime: '18:00',
        venue: 'Lecture Hall A',
        lecturer: lecturerName
      }
    });
    console.log(`\n✅ Scheduled: ${course.code} - ${course.name}`);
    console.log(`   Day: Wednesday | Time: 2:00 PM - 6:00 PM`);
    console.log(`   Venue: Lecture Hall A | Lecturer: ${lecturerName}`);
    console.log(`   Schedule ID: ${schedule.id}`);
  }
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
