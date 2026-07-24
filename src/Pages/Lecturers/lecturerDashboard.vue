<template>
  <div class="dashboard-container">
    <div class="dashboard-header">
      <div class="header-text">
        <h1 class="page-title">Lecturer Portal</h1>
        <p class="page-subtitle">Welcome back. Here is an overview of your teaching responsibilities today.</p>
      </div>
      <div class="date-badge">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
          <line x1="16" y1="2" x2="16" y2="6"></line>
          <line x1="8" y1="2" x2="8" y2="6"></line>
          <line x1="3" y1="10" x2="21" y2="10"></line>
        </svg>
        <span>{{ currentDate }}</span>
      </div>
    </div>

    <!-- Key Metrics Grid -->
    <div class="metrics-grid">
      <div class="metric-card" v-for="metric in metrics" :key="metric.title">
        <div class="metric-icon-wrap" :style="{ backgroundColor: metric.bgColor, color: metric.color }">
          <div class="metric-icon" v-html="metric.icon"></div>
        </div>
        <div class="metric-content">
          <p class="metric-title">{{ metric.title }}</p>
          <h3 class="metric-value">{{ metric.value }}</h3>
        </div>
      </div>
    </div>

    <div class="dashboard-content-split">
      <!-- Left Column: Teaching Schedule Today -->
      <div class="schedule-panel">
        <div class="panel-header">
          <h2>Following Classes Today</h2>
          <button class="view-all-btn" @click="$emit('navigate', '/lecturer-courses')">View Full Routine</button>
        </div>
        
        <div class="schedule-list">
          <div class="schedule-item" v-for="cls in todaySchedule" :key="cls.id">
            <div class="time-block">
              <span class="time-start">{{ cls.startTime }}</span>
              <span class="time-end">{{ cls.endTime }}</span>
            </div>
            
            <div class="course-info">
              <h4>{{ cls.name }} <span class="course-code">{{ cls.code }}</span></h4>
              <p>Venue: <strong>{{ cls.venue }}</strong> • {{ cls.students }} Students Registered</p>
            </div>
            
            <div class="action-block">
               <button class="mark-btn" @click="markAttendance(cls)">Mark Attendance</button>
            </div>
          </div>
          
          <div v-if="todaySchedule.length === 0" class="empty-schedule">
            <div class="icon-circle">
              <svg viewBox="0 0 24 24" fill="none" class="icon" stroke="currentColor" stroke-width="1.5">
                <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
                <line x1="16" y1="2" x2="16" y2="6"></line>
                <line x1="8" y1="2" x2="8" y2="6"></line>
                <line x1="3" y1="10" x2="21" y2="10"></line>
              </svg>
            </div>
            <p>You have no classes scheduled for today.</p>
            <span>Enjoy your free time or prepare materials for upcoming lectures.</span>
          </div>
        </div>
      </div>

      <!-- Right Column: Quick Links & Alerts -->
      <div class="side-panel">
        <div class="action-panel">
          <div class="panel-header">
            <h2>Quick Actions</h2>
          </div>
          <div class="action-grid">
            <button class="action-btn" @click="$emit('navigate', '/lecturer-courses')">
              <span class="icon-wrap bg-indigo">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"></path>
                  <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"></path>
                </svg>
              </span>
              My Assigned Courses
            </button>
            <button class="action-btn" @click="$emit('navigate', '/attendance-view')">
              <span class="icon-wrap bg-emerald">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
                  <polyline points="22 4 12 14.01 9 11.01"></polyline>
                </svg>
              </span>
              Mark / Edit Attendance
            </button>
            <button class="action-btn" @click="$emit('navigate', '/lecturer-reports')">
              <span class="icon-wrap bg-purple">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <line x1="18" y1="20" x2="18" y2="10"></line>
                  <line x1="12" y1="20" x2="12" y2="4"></line>
                  <line x1="6" y1="20" x2="6" y2="14"></line>
                </svg>
              </span>
              Detailed Course Reports
            </button>
          </div>
        </div>

        <div class="notifications-summary">
          <div class="panel-header">
            <h2>System Alerts</h2>
          </div>
          <div class="alerts-content">
            <div class="alert-item empty-alert">
              <div class="alert-icon">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
                  <polyline points="22 4 12 14.01 9 11.01"></polyline>
                </svg>
              </div>
              <div class="alert-text">
                <p>Everything is caught up!</p>
                <span>There are no pending actions.</span>
              </div>
            </div>
            <div class="alert-item">
              <div class="alert-icon bg-amber-light">
                <svg viewBox="0 0 24 24" fill="none" stroke="#f59e0b" stroke-width="2">
                  <circle cx="12" cy="12" r="10"></circle>
                  <line x1="12" y1="8" x2="12" y2="12"></line>
                  <line x1="12" y1="16" x2="12.01" y2="16"></line>
                </svg>
              </div>
              <div class="alert-text">
                <p>Reminder: Upload Syllabi</p>
                <span>Please prepare course outlines for the new semester.</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
<script setup>
import { computed, onMounted, onUnmounted } from 'vue';
import { storeToRefs } from 'pinia';
import { useAuthStore } from '@/stores/authstore';
import { useSchedulesStore } from '@/stores/schedules';
import { useCoursesStore } from '@/stores/courses';
import { useEnrollmentsStore } from '@/stores/enrollments';
import { useSessionsStore } from '@/stores/sessions';
import { useAttendancesStore } from '@/stores/attendances';

const emit = defineEmits(['navigate']);

const authStore = useAuthStore();
const schedulesStore = useSchedulesStore();
const coursesStore = useCoursesStore();
const enrollmentsStore = useEnrollmentsStore();
const sessionsStore = useSessionsStore();
const attendancesStore = useAttendancesStore();

const { profile } = storeToRefs(authStore);
const { schedules } = storeToRefs(schedulesStore);
const { courses } = storeToRefs(coursesStore);
const { enrollments } = storeToRefs(enrollmentsStore);
const { sessions } = storeToRefs(sessionsStore);
const { attendances } = storeToRefs(attendancesStore);

const currentDate = new Date().toLocaleDateString('en-US', {
  weekday: 'long',
  year: 'numeric',
  month: 'long',
  day: 'numeric'
});

const currentDayName = new Date().toLocaleDateString('en-US', { weekday: 'long' });

onMounted(async () => {
  try {
    await Promise.all([
      schedulesStore.fetchSchedules(),
      coursesStore.fetchCourses(),
      enrollmentsStore.fetchEnrollments(),
      sessionsStore.fetchSessions(),
      attendancesStore.fetchAttendances(),
    ]);

    schedulesStore.subscribeToSchedules();
    coursesStore.subscribeToCourses();
    enrollmentsStore.subscribeToEnrollments();
    sessionsStore.subscribeToSessions();
    attendancesStore.subscribeToAttendances();
  } catch (error) {
    console.error('Error fetching dashboard data:', error);
  }
});

onUnmounted(() => {
  schedulesStore.unsubscribeFromSchedules();
  coursesStore.unsubscribeFromCourses();
  enrollmentsStore.unsubscribeFromEnrollments();
  sessionsStore.unsubscribeFromSessions();
  attendancesStore.unsubscribeFromAttendances();
});

const lecturerName = computed(() => profile.value?.name ?? '');

// Course ids this lecturer teaches, derived from the schedules table
// (schedules.lecturer stores the lecturer's name — see Schedule.vue).
const lecturerCourseIds = computed(() => {
  const ids = new Set(
    schedules.value
      .filter((s) => s.lecturer === lecturerName.value)
      .map((s) => s.courseId)
  );
  return [...ids];
});

const lecturerCourses = computed(() =>
  lecturerCourseIds.value
    .map((id) => coursesStore.getCourseById(id))
    .filter(Boolean)
);

// --- Stats (replacing the old /attendance/lecturer-stats endpoint) ---

const totalActiveCourses = computed(
  () => lecturerCourses.value.filter((c) => c.status === 'active').length
);

const totalStudentsTaught = computed(() => {
  const studentIds = new Set(
    enrollments.value
      .filter((e) => lecturerCourseIds.value.includes(e.courseId))
      .map((e) => e.studentId)
  );
  return studentIds.size;
});

const averageAttendanceRate = computed(() => {
  const lecturerSessionIds = new Set(
    sessions.value
      .filter((s) => lecturerCourseIds.value.includes(s.courseId))
      .map((s) => s.id)
  );
  if (lecturerSessionIds.size === 0) return 0;

  const relevant = attendances.value.filter((a) => lecturerSessionIds.has(a.sessionId));
  if (relevant.length === 0) return 0;

  const present = relevant.filter((a) => a.status === 'present').length;
  return Math.round((present / relevant.length) * 100);
});

const lecturerStats = computed(() => ({
  totalActiveCourses: totalActiveCourses.value,
  totalStudentsTaught: totalStudentsTaught.value,
  averageAttendanceRate: averageAttendanceRate.value,
}));

const metrics = computed(() => [
  {
    title: 'Total Active Courses',
    value: lecturerStats.value.totalActiveCourses.toString(),
    bgColor: 'rgba(99, 102, 241, 0.1)',
    color: '#6366f1',
    icon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"></path><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"></path></svg>'
  },
  {
    title: 'Total Students Taught',
    value: lecturerStats.value.totalStudentsTaught.toString(),
    bgColor: 'rgba(236, 72, 153, 0.1)',
    color: '#ec4899',
    icon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><path d="M23 21v-2a4 4 0 0 0-3-3.87"></path><path d="M16 3.13a4 4 0 0 1 0 7.75"></path></svg>'
  },
  {
    title: 'Average Attendance Rate',
    value: `${lecturerStats.value.averageAttendanceRate}%`,
    bgColor: 'rgba(16, 185, 129, 0.1)',
    color: '#10b981',
    icon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"></polyline></svg>'
  }
]);

// --- Today's schedule ---
const todaySchedule = computed(() => {
  return schedules.value
    .filter((s) => s.lecturer === lecturerName.value && s.day === currentDayName)
    .sort((a, b) => (a.startTime || '').localeCompare(b.startTime || ''))
    .map((s) => {
      const course = coursesStore.getCourseById(s.courseId);
      return {
        id: s.id,
        courseId: s.courseId,
        code: course?.code ?? 'Unknown',
        name: course?.name ?? 'Unknown Course',
        startTime: s.startTime,
        endTime: s.endTime,
        venue: s.venue,
        students: enrollmentsStore.enrollmentsByCourse(s.courseId).length,
      };
    });
});

const markAttendance = (cls) => {
  localStorage.setItem('activeCourseId', cls.courseId);
  localStorage.setItem('activeCourseCode', cls.code);
  localStorage.setItem('activeCourseName', cls.name);
  emit('navigate', '/attendance-view');
};
</script>