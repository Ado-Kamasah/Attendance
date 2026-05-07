import { ref } from 'vue';

// Global store for current user properties
export const currentUserId = ref('');
export const currentUserProgram = ref('');

const currentDayName = new Date().toLocaleDateString('en-US', { weekday: 'long' });

// Global mock data to facilitate testing of the student registration flow
export const availableGlobalCourses = ref([
  // Computer Science Courses
  { id: 101, code: 'CSC 101', name: 'Introduction to Computer Science', credits: 3, lecturer: 'Dr. Alan Turing', program: 'Computer Science', level: '100', status: 'active', schedule: `${currentDayName} 08:00 - 10:00` },
  { id: 102, code: 'MTH 102', name: 'Calculus I', credits: 4, lecturer: 'Prof. Isaac Newton', program: 'Computer Science', level: '100', status: 'active', schedule: 'Monday 10:30 - 12:30' },
  { id: 103, code: 'SWE 302', name: 'Software Engineering Principles', credits: 3, lecturer: 'Dr. Ada Lovelace', program: 'Computer Science', level: '300', status: 'active', schedule: 'Not Assigned' },
  { id: 104, code: 'STA 204', name: 'Probability and Statistics', credits: 3, lecturer: 'Dr. Carl Gauss', program: 'Computer Science', level: '200', status: 'active', schedule: 'Not Assigned' },
  // Business Courses
  { id: 201, code: 'BBA 101', name: 'Introduction to Business Administration', credits: 3, lecturer: 'Dr. Adam Smith', program: 'Business', level: '100', status: 'active', schedule: `${currentDayName} 14:00 - 16:00` },
  { id: 202, code: 'MKT 201', name: 'Marketing Principles', credits: 3, lecturer: 'Prof. Philip Kotler', program: 'Business', level: '200', status: 'active', schedule: 'Saturday 09:00 - 12:00' },
  { id: 203, code: 'ACC 101', name: 'Financial Accounting', credits: 4, lecturer: 'Dr. Luca Pacioli', program: 'Business', level: '100', status: 'active', schedule: 'Not Assigned' },
  { id: 204, code: 'HRM 301', name: 'Human Resource Management', credits: 3, lecturer: 'Prof. Elton Mayo', program: 'Business', level: '300', status: 'archived', schedule: 'Not Assigned' }
]);

export const masterSchedule = ref([
  { id: 1, level: '100', mode: 'Regular', day: currentDayName, startTime: '08:00', endTime: '10:00', courseCode: 'CSC 101', courseTitle: 'Introduction to Computer Science', lecturer: 'Dr. Alan Turing', venue: 'Hall A' },
  { id: 2, level: '100', mode: 'Regular', day: 'Monday', startTime: '10:30', endTime: '12:30', courseCode: 'MTH 102', courseTitle: 'Calculus I', lecturer: 'Prof. Isaac Newton', venue: 'Hall B' },
  { id: 3, level: '100', mode: 'Regular', day: currentDayName, startTime: '14:00', endTime: '16:00', courseCode: 'BBA 101', courseTitle: 'Introduction to Business Administration', lecturer: 'Dr. Adam Smith', venue: 'Hall C' },
  { id: 4, level: '200', mode: 'Weekend', day: 'Saturday', startTime: '09:00', endTime: '12:00', courseCode: 'MKT 201', courseTitle: 'Marketing Principles', lecturer: 'Prof. Philip Kotler', venue: 'Room 3' },
]);

export const studentEnrolledCourses = ref([]);

export const registerSelectedCourses = (selectedCoursesArr) => {
  const colors = ['#4f46e5', '#10b981', '#f59e0b', '#ec4899', '#8b5cf6'];

  selectedCoursesArr.forEach(course => {
    // Check if not already enrolled
    if (!studentEnrolledCourses.value.find(c => c.id === course.id)) {
      studentEnrolledCourses.value.push({
        ...course,
        attendance: 0, // start with 0% attendance
        color: colors[studentEnrolledCourses.value.length % colors.length]
      });
    }
  });
};
