<template>
  <div class="dashboard-container">
    <!-- Header -->
    <div class="dashboard-header">
      <div>
        <h1 class="page-title">Welcome, {{ firstName }} 👋</h1>
        <p class="page-subtitle">{{ currentDate }} · Student Portal</p>
      </div>
      <div class="header-actions">
        <button class="btn-primary" @click="$emit('navigate', '/mark-attendance')">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="20 6 9 17 4 12"/></svg>
          Mark Attendance
        </button>
      </div>
    </div>

    <!-- KPI Cards -->
    <div class="kpi-grid">
      <div class="kpi-card kpi-indigo">
        <div class="kpi-icon">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/></svg>
        </div>
        <div class="kpi-body">
          <p class="kpi-label">Enrolled Courses</p>
          <h2 class="kpi-value">{{ enrolledCourseIds.length }}</h2>
        </div>
      </div>

      <div class="kpi-card" :class="overallRate >= 75 ? 'kpi-green' : overallRate >= 50 ? 'kpi-amber' : 'kpi-red'">
        <div class="kpi-icon">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/></svg>
        </div>
        <div class="kpi-body">
          <p class="kpi-label">Attendance Rate</p>
          <h2 class="kpi-value">{{ overallRate }}%</h2>
        </div>
      </div>

      <div class="kpi-card kpi-sky">
        <div class="kpi-icon">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
        </div>
        <div class="kpi-body">
          <p class="kpi-label">Classes Attended</p>
          <h2 class="kpi-value">{{ presentCount }}</h2>
        </div>
      </div>

      <div class="kpi-card kpi-red">
        <div class="kpi-icon">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polygon points="7.86 2 16.14 2 22 7.86 22 16.14 16.14 22 7.86 22 2 16.14 2 7.86 7.86 2"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
        </div>
        <div class="kpi-body">
          <p class="kpi-label">Classes Missed</p>
          <h2 class="kpi-value">{{ absentCount }}</h2>
        </div>
      </div>
    </div>

    <!-- Main grid -->
    <div class="main-grid">
      <!-- Today's Schedule -->
      <div class="panel">
        <div class="panel-head">
          <h2>Today's Classes</h2>
          <button class="link-btn" @click="$emit('navigate', '/my-courses')">Full Timetable →</button>
        </div>
        <div v-if="isLoading" class="panel-loading">Loading schedule…</div>
        <div v-else-if="todayClasses.length === 0" class="panel-empty">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
          <p>No classes scheduled for today.</p>
        </div>
        <div v-else class="class-list">
          <div v-for="cls in todayClasses" :key="cls.id" class="class-card" :class="{ 'class-active': cls.isActive }">
            <div class="class-time">
              <span>{{ formatTime(cls.startTime) }}</span>
              <span class="time-sep">–</span>
              <span>{{ formatTime(cls.endTime) }}</span>
            </div>
            <div class="class-divider"></div>
            <div class="class-info">
              <div class="class-code-row">
                <span class="class-code">{{ cls.courseCode }}</span>
                <span v-if="cls.isActive" class="live-chip">LIVE</span>
              </div>
              <p class="class-name">{{ cls.courseName }}</p>
              <p class="class-meta">{{ cls.lecturer }} · {{ cls.venue }}</p>
            </div>
          </div>
        </div>
      </div>

      <!-- Per-course Attendance -->
      <div class="panel">
        <div class="panel-head">
          <h2>My Attendance</h2>
          <button class="link-btn" @click="$emit('navigate', '/mark-attendance')">Mark Now →</button>
        </div>
        <div v-if="isLoading" class="panel-loading">Loading attendance…</div>
        <div v-else-if="courseStats.length === 0" class="panel-empty">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/></svg>
          <p>No attendance records yet.</p>
        </div>
        <div v-else class="course-stats-list">
          <div v-for="stat in courseStats" :key="stat.courseId" class="course-stat-row">
            <div class="stat-header">
              <span class="stat-code">{{ stat.code }}</span>
              <span class="stat-name">{{ stat.name }}</span>
              <span class="stat-rate" :class="rateClass(stat.rate)">{{ stat.rate }}%</span>
            </div>
            <div class="stat-bar-track">
              <div class="stat-bar-fill" :style="{ width: stat.rate + '%', background: rateColor(stat.rate) }"></div>
            </div>
            <div class="stat-counts">
              <span class="present-txt">✓ {{ stat.present }} present</span>
              <span class="absent-txt">✗ {{ stat.absent }} absent</span>
              <span class="total-txt">{{ stat.total }} sessions</span>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Quick Actions -->
    <div class="panel">
      <div class="panel-head"><h2>Quick Actions</h2></div>
      <div class="actions-grid">
        <button class="action-tile" @click="$emit('navigate', '/attendance')">
          <div class="action-icon" style="background:#e0e7ff;color:#4f46e5">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="20 6 9 17 4 12"/></svg>
          </div>
          <span>Mark Attendance</span>
        </button>
        <button class="action-tile" @click="$emit('navigate', '/my-courses')">
          <div class="action-icon" style="background:#dcfce7;color:#15803d">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/></svg>
          </div>
          <span>My Courses</span>
        </button>
        <button class="action-tile" @click="$emit('navigate', '/registration')">
          <div class="action-icon" style="background:#fef9c3;color:#a16207">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
          </div>
          <span>Register Course</span>
        </button>
        <button class="action-tile" @click="$emit('navigate', '/notifications')">
          <div class="action-icon" style="background:#fee2e2;color:#b91c1c">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/></svg>
          </div>
          <span>Notifications</span>
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue';
import { storeToRefs } from 'pinia';
import { useAuthStore } from '@/stores/authstore';
import { useCoursesStore } from '@/stores/courses';
import { useEnrollmentsStore } from '@/stores/enrollments';
import { useSchedulesStore } from '@/stores/schedules';
import { useSessionsStore } from '@/stores/sessions';
import { useAttendancesStore } from '@/stores/attendances';

const emit = defineEmits(['navigate']);

const authStore     = useAuthStore();
const coursesStore  = useCoursesStore();
const enrollStore   = useEnrollmentsStore();
const schedStore    = useSchedulesStore();
const sessStore     = useSessionsStore();
const attStore      = useAttendancesStore();

const { profile }     = storeToRefs(authStore);
const { courses }     = storeToRefs(coursesStore);
const { enrollments } = storeToRefs(enrollStore);
const { schedules }   = storeToRefs(schedStore);
const { sessions }    = storeToRefs(sessStore);
const { attendances } = storeToRefs(attStore);

const isLoading = ref(true);

const firstName = computed(() => (profile.value?.name || 'Student').split(' ')[0]);
const currentDate = new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
const todayName   = new Date().toLocaleDateString('en-US', { weekday: 'long' });

onMounted(async () => {
  isLoading.value = true;
  const uid = profile.value?.id;
  await Promise.all([
    coursesStore.fetchCourses(),
    enrollStore.fetchEnrollments({ studentId: uid }),
    schedStore.fetchSchedules(),
    sessStore.fetchSessions(),
    attStore.fetchAttendances({ studentId: uid }),
  ]);
  sessStore.subscribeToSessions();
  attStore.subscribeToAttendances();
  isLoading.value = false;
});

onUnmounted(() => {
  sessStore.unsubscribeFromSessions();
  attStore.unsubscribeFromAttendances();
});

// ── Enrolled course IDs ───────────────────────────────────────────────────────
const enrolledCourseIds = computed(() =>
  enrollments.value
    .filter(e => e.studentId === profile.value?.id)
    .map(e => e.courseId)
);

// ── KPI counts ────────────────────────────────────────────────────────────────
const myAttendances = computed(() =>
  attendances.value.filter(a => a.studentId === profile.value?.id)
);

const presentCount = computed(() => myAttendances.value.filter(a => a.status === 'present').length);
const absentCount  = computed(() => myAttendances.value.filter(a => a.status === 'absent').length);
const overallRate  = computed(() => {
  const total = myAttendances.value.length;
  return total > 0 ? Math.round((presentCount.value / total) * 100) : 0;
});

// ── Today's schedule ──────────────────────────────────────────────────────────
const todayClasses = computed(() => {
  const activeSessions = new Set(sessions.value.filter(s => s.isActive).map(s => s.courseId));
  return schedules.value
    .filter(s => s.day === todayName && enrolledCourseIds.value.includes(s.courseId))
    .map(s => {
      const course = coursesStore.getCourseById(s.courseId);
      return {
        id: s.id,
        courseCode: course?.code  ?? '—',
        courseName: course?.name  ?? 'Unknown',
        lecturer:   s.lecturer    ?? '—',
        venue:      s.venue       ?? '—',
        startTime:  s.startTime,
        endTime:    s.endTime,
        isActive:   activeSessions.has(s.courseId),
      };
    })
    .sort((a, b) => (a.startTime || '').localeCompare(b.startTime || ''));
});

// ── Per-course attendance stats ───────────────────────────────────────────────
const courseStats = computed(() => {
  return enrolledCourseIds.value.map(cid => {
    const course = coursesStore.getCourseById(cid);
    // find sessions for this course
    const courseSessIds = new Set(sessions.value.filter(s => s.courseId === cid).map(s => s.id));
    const recs    = myAttendances.value.filter(a => courseSessIds.has(a.sessionId));
    const present = recs.filter(a => a.status === 'present').length;
    const absent  = recs.filter(a => a.status === 'absent').length;
    const total   = recs.length;
    const rate    = total > 0 ? Math.round((present / total) * 100) : 0;
    return { courseId: cid, code: course?.code ?? '—', name: course?.name ?? 'Unknown', present, absent, total, rate };
  }).filter(s => s.total > 0);
});

// ── Helpers ───────────────────────────────────────────────────────────────────
function formatTime(t) {
  if (!t) return '';
  const [h, m] = t.split(':').map(Number);
  const ampm = h >= 12 ? 'PM' : 'AM';
  return `${h % 12 || 12}:${String(m).padStart(2, '0')} ${ampm}`;
}

function rateClass(r) {
  return r >= 75 ? 'rate-good' : r >= 50 ? 'rate-warn' : 'rate-bad';
}

function rateColor(r) {
  return r >= 75 ? '#10b981' : r >= 50 ? '#f59e0b' : '#ef4444';
}
</script>