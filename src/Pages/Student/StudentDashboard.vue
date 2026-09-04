<template>
  <div class="dashboard-container">
    <!-- Header -->
    <div class="dashboard-header">
      <div>
        <h1 class="page-title">Welcome, {{ firstName }} 👋</h1>
        <p class="page-subtitle">{{ currentDate }} · Student Portal</p>
      </div>
      <div class="header-actions">
        <button class="btn-primary" @click="$emit('navigate', '/attendance')">
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
          <button class="link-btn" @click="$emit('navigate', '/attendance')">Mark Now →</button>
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

    <!-- Absence Warning Alerts -->
    <div v-if="hasAbsenceAlerts" class="alerts-panel">
      <div class="alerts-panel-head">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polygon points="7.86 2 16.14 2 22 7.86 22 16.14 16.14 22 7.86 22 2 16.14 2 7.86 7.86 2"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
        <h2>Notifications</h2>
        <span class="alerts-count" v-if="notifUnreadCount > 0">{{ notifUnreadCount }} unread</span>
        <button class="link-btn" @click="$emit('navigate', '/notifications')" style="margin-left:auto">View All →</button>
      </div>

      <!-- Evaluation Open notices -->
      <div
        v-for="n in evalOpenNotifications"
        :key="n.id"
        class="alert-card alert-eval-open"
        :class="{ 'alert-read': n.isRead }"
        @click="notifStore.markRead(n.id); $emit('navigate', '/evaluation')"
      >
        <div class="alert-icon">📋</div>
        <div class="alert-body">
          <p class="alert-title">Evaluations Now Open</p>
          <p class="alert-msg">{{ n.message }}</p>
          <span class="alert-time">{{ new Date(n.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) }}</span>
        </div>
        <span v-if="!n.isRead" class="unread-dot"></span>
      </div>

      <!-- Ineligible notices -->
      <div v-for="n in ineligibleWarnings" :key="n.id" class="alert-card alert-ineligible" :class="{ 'alert-read': n.isRead }" @click="notifStore.markRead(n.id)">
        <div class="alert-icon">❌</div>
        <div class="alert-body">
          <p class="alert-title">Exam Ineligibility – {{ n.courseCode }}</p>
          <p class="alert-msg">{{ n.message }}</p>
          <span class="alert-time">{{ new Date(n.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) }}</span>
        </div>
        <span v-if="!n.isRead" class="unread-dot"></span>
      </div>

      <!-- Warning notices -->
      <div v-for="n in absenceWarnings" :key="n.id" class="alert-card" :class="[n.type === 'warning_2' ? 'alert-warning-2' : 'alert-warning-1', { 'alert-read': n.isRead }]" @click="notifStore.markRead(n.id)">
        <div class="alert-icon">{{ n.type === 'warning_2' ? '🚨' : '⚠️' }}</div>
        <div class="alert-body">
          <p class="alert-title">{{ n.type === 'warning_2' ? 'Critical Warning' : 'Attendance Warning' }} – {{ n.courseCode }}</p>
          <p class="alert-msg">{{ n.message }}</p>
          <span class="alert-time">{{ new Date(n.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) }}</span>
        </div>
        <span v-if="!n.isRead" class="unread-dot"></span>
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
        <button class="action-tile notif-tile" @click="$emit('navigate', '/notifications')">
          <div class="action-icon" style="background:#fee2e2;color:#b91c1c">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/></svg>
          </div>
          <span>Notifications</span>
          <span v-if="notifUnreadCount > 0" class="notif-badge">{{ notifUnreadCount }}</span>
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
import { useStudentNotificationsStore } from '@/stores/studentNotifications';

const emit = defineEmits(['navigate']);

const authStore     = useAuthStore();
const coursesStore  = useCoursesStore();
const enrollStore   = useEnrollmentsStore();
const schedStore    = useSchedulesStore();
const sessStore     = useSessionsStore();
const attStore      = useAttendancesStore();
const notifStore    = useStudentNotificationsStore();

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
    notifStore.fetchNotifications(),
  ]);
  sessStore.subscribeToSessions();
  attStore.subscribeToAttendances();
  isLoading.value = false;
});

// ── Absence warnings ──────────────────────────────────────────────────────────
const absenceWarnings      = computed(() => notifStore.warningNotifications);
const ineligibleWarnings   = computed(() => notifStore.ineligibleNotifications);
const evalOpenNotifications = computed(() => notifStore.evalOpenNotifications);
const hasAbsenceAlerts     = computed(() => notifStore.notifications.length > 0);
const notifUnreadCount     = computed(() => notifStore.unreadCount);

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

<style scoped>
* { font-family: 'Inter', sans-serif; box-sizing: border-box; }

.dashboard-container { display: flex; flex-direction: column; gap: 1.75rem; width: 100%; }

/* Header */
.dashboard-header { display: flex; justify-content: space-between; align-items: flex-start; flex-wrap: wrap; gap: 1rem; }
.page-title  { margin: 0; font-size: 1.75rem; font-weight: 700; color: #0f172a; letter-spacing: -0.025em; }
.page-subtitle { margin: 0.25rem 0 0; font-size: 0.9rem; color: #64748b; }
.header-actions { display: flex; gap: 0.75rem; flex-shrink: 0; }

.btn-primary {
  display: inline-flex; align-items: center; gap: 0.5rem;
  background: linear-gradient(135deg,#6366f1,#4f46e5); color: #fff;
  border: none; padding: 0.6rem 1.25rem; border-radius: 10px;
  font-weight: 600; font-size: 0.9rem; cursor: pointer;
  box-shadow: 0 4px 12px rgba(99,102,241,.25); transition: all 0.2s;
  white-space: nowrap;
}
.btn-primary svg { width: 16px; height: 16px; flex-shrink: 0; }
.btn-primary:hover { transform: translateY(-1px); box-shadow: 0 6px 16px rgba(99,102,241,.35); }

/* KPI Grid */
.kpi-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px,1fr)); gap: 1.25rem; }

.kpi-card {
  display: flex; align-items: center; gap: 1rem;
  background: #fff; border-radius: 16px; padding: 1.25rem 1.5rem;
  border: 1px solid #f1f5f9; box-shadow: 0 2px 8px rgba(0,0,0,.04);
  transition: transform 0.2s, box-shadow 0.2s;
  min-width: 0;
}
.kpi-card:hover { transform: translateY(-2px); box-shadow: 0 8px 20px rgba(0,0,0,.07); }
.kpi-icon { width: 46px; height: 46px; border-radius: 12px; display: flex; align-items: center; justify-content: center; flex-shrink: 0; }
.kpi-icon svg { width: 22px; height: 22px; }
.kpi-body { min-width: 0; }
.kpi-label { margin: 0 0 2px; font-size: 0.78rem; font-weight: 600; text-transform: uppercase; letter-spacing: 0.05em; color: #64748b; }
.kpi-value { margin: 0; font-size: 1.9rem; font-weight: 700; color: #0f172a; letter-spacing: -0.03em; }

.kpi-indigo .kpi-icon { background: #e0e7ff; color: #4f46e5; }
.kpi-green  .kpi-icon { background: #dcfce7; color: #15803d; }
.kpi-amber  .kpi-icon { background: #fef9c3; color: #a16207; }
.kpi-red    .kpi-icon { background: #fee2e2; color: #b91c1c; }
.kpi-sky    .kpi-icon { background: #e0f2fe; color: #0369a1; }

/* Main grid */
.main-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 1.5rem; }

/* Panel */
.panel { background: #fff; border-radius: 16px; padding: 1.5rem; border: 1px solid #f1f5f9; box-shadow: 0 2px 8px rgba(0,0,0,.04); min-width: 0; }
.panel-head { display: flex; justify-content: space-between; align-items: center; margin-bottom: 1.25rem; gap: 0.75rem; flex-wrap: wrap; }
.panel-head h2 { margin: 0; font-size: 1rem; font-weight: 700; color: #0f172a; }
.link-btn { background: none; border: none; color: #6366f1; font-size: 0.82rem; font-weight: 600; cursor: pointer; padding: 0; transition: color 0.2s; white-space: nowrap; }
.link-btn:hover { color: #4338ca; }
.panel-loading { color: #94a3b8; font-size: 0.9rem; text-align: center; padding: 2rem; }
.panel-empty { display: flex; flex-direction: column; align-items: center; gap: 0.75rem; padding: 2.5rem 1rem; background: #f8fafc; border-radius: 12px; border: 1px dashed #cbd5e1; }
.panel-empty svg { width: 36px; height: 36px; color: #94a3b8; }
.panel-empty p { margin: 0; color: #64748b; font-size: 0.9rem; }

/* Today's classes */
.class-list { display: flex; flex-direction: column; gap: 0.75rem; }
.class-card { display: flex; align-items: center; gap: 1rem; background: #f8fafc; border-radius: 12px; padding: 0.85rem 1rem; border: 1px solid #f1f5f9; border-left: 3px solid #6366f1; transition: box-shadow 0.2s; min-width: 0; }
.class-card.class-active { border-left-color: #10b981; background: #f0fdf4; }
.class-card:hover { box-shadow: 0 4px 12px rgba(0,0,0,.06); }
.class-time { display: flex; flex-direction: column; align-items: center; min-width: 70px; font-size: 0.78rem; font-weight: 600; color: #475569; flex-shrink: 0; }
.time-sep { color: #cbd5e1; font-size: 0.7rem; }
.class-divider { width: 1px; height: 36px; background: #e2e8f0; flex-shrink: 0; }
.class-info { flex: 1; min-width: 0; }
.class-code-row { display: flex; align-items: center; gap: 0.5rem; margin-bottom: 2px; flex-wrap: wrap; }
.class-code { font-size: 0.72rem; font-weight: 700; background: #e0e7ff; color: #4338ca; padding: 0.1rem 0.4rem; border-radius: 4px; }
.live-chip { font-size: 0.65rem; font-weight: 700; background: #dcfce7; color: #15803d; padding: 0.1rem 0.4rem; border-radius: 4px; letter-spacing: 0.05em; animation: pulse 2s infinite; }
@keyframes pulse { 0%,100%{opacity:1}50%{opacity:0.5} }
.class-name { margin: 0 0 2px; font-size: 0.88rem; font-weight: 600; color: #1e293b; word-break: break-word; }
.class-meta { margin: 0; font-size: 0.78rem; color: #64748b; word-break: break-word; }

/* Course stats */
.course-stats-list { display: flex; flex-direction: column; gap: 1rem; }
.course-stat-row { display: flex; flex-direction: column; gap: 0.4rem; min-width: 0; }
.stat-header { display: flex; align-items: center; gap: 0.5rem; }
.stat-code { font-size: 0.72rem; font-weight: 700; background: #f1f5f9; color: #475569; padding: 0.15rem 0.4rem; border-radius: 4px; flex-shrink: 0; }
.stat-name { flex: 1; font-size: 0.85rem; font-weight: 600; color: #1e293b; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; min-width: 0; }
.stat-rate { font-size: 0.8rem; font-weight: 700; flex-shrink: 0; }
.rate-good { color: #10b981; }
.rate-warn { color: #f59e0b; }
.rate-bad  { color: #ef4444; }
.stat-bar-track { height: 6px; background: #f1f5f9; border-radius: 999px; overflow: hidden; }
.stat-bar-fill  { height: 100%; border-radius: 999px; transition: width 0.6s ease; }
.stat-counts { display: flex; gap: 0.75rem; font-size: 0.72rem; flex-wrap: wrap; }
.present-txt { color: #10b981; font-weight: 600; }
.absent-txt  { color: #ef4444; font-weight: 600; }
.total-txt   { color: #94a3b8; }

/* Quick actions */
.actions-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 1rem; }
.action-tile { display: flex; flex-direction: column; align-items: center; gap: 0.75rem; background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 14px; padding: 1.25rem 0.75rem; cursor: pointer; transition: all 0.2s; font-size: 0.82rem; font-weight: 600; color: #334155; text-align: center; position: relative; }
.action-tile:hover { transform: translateY(-2px); box-shadow: 0 6px 16px rgba(0,0,0,.07); background: #fff; }
.action-icon { width: 44px; height: 44px; border-radius: 12px; display: flex; align-items: center; justify-content: center; }
.action-icon svg { width: 20px; height: 20px; }

/* Notification unread badge on action tile */
.notif-badge {
  position: absolute;
  top: 8px;
  right: 8px;
  background: #ef4444;
  color: #fff;
  font-size: 0.65rem;
  font-weight: 700;
  min-width: 18px;
  height: 18px;
  border-radius: 999px;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0 4px;
  line-height: 1;
}

/* ── Absence Warning Alerts ───────────────────────────────────────────────── */
.alerts-panel {
  background: #fff;
  border-radius: 16px;
  padding: 1.5rem;
  border: 1px solid #f1f5f9;
  box-shadow: 0 2px 8px rgba(0,0,0,.04);
  display: flex;
  flex-direction: column;
  gap: 0.85rem;
}

.alerts-panel-head {
  display: flex;
  align-items: center;
  gap: 0.6rem;
  flex-wrap: wrap;
}
.alerts-panel-head svg { width: 20px; height: 20px; color: #f59e0b; flex-shrink: 0; }
.alerts-panel-head h2 { margin: 0; font-size: 1rem; font-weight: 700; color: #0f172a; }
.alerts-count {
  font-size: 0.72rem;
  font-weight: 700;
  background: #fee2e2;
  color: #b91c1c;
  padding: 0.15rem 0.55rem;
  border-radius: 20px;
}

.alert-card {
  display: flex;
  align-items: flex-start;
  gap: 0.85rem;
  padding: 1rem 1.1rem;
  border-radius: 12px;
  border: 1px solid transparent;
  cursor: pointer;
  transition: opacity 0.2s, box-shadow 0.2s;
  position: relative;
}
.alert-card:hover { box-shadow: 0 4px 12px rgba(0,0,0,.06); }
.alert-card.alert-read { opacity: 0.6; }

.alert-warning-1 { background: #fffbeb; border-color: #fde68a; }
.alert-warning-2 { background: #fff7ed; border-color: #fed7aa; }
.alert-ineligible { background: #fff1f2; border-color: #fecdd3; }
.alert-eval-open { background: #eff6ff; border-color: #bfdbfe; cursor: pointer; }
.alert-eval-open:hover { background: #dbeafe; }

.alert-icon { font-size: 1.35rem; flex-shrink: 0; line-height: 1.4; }
.alert-body { flex: 1; min-width: 0; }
.alert-title { margin: 0 0 3px; font-size: 0.88rem; font-weight: 700; color: #1e293b; }
.alert-msg   { margin: 0 0 4px; font-size: 0.82rem; color: #475569; line-height: 1.45; word-break: break-word; }
.alert-time  { font-size: 0.72rem; color: #94a3b8; }

.unread-dot {
  width: 9px;
  height: 9px;
  border-radius: 50%;
  background: #ef4444;
  flex-shrink: 0;
  margin-top: 4px;
}


/* ==========================================================================
   Responsive Breakpoints
   L  (large / laptop-desktop): < 1200px  — tighten gaps
   M  (tablet):                 < 900px   — stack main grid, 3-col KPIs
   S  (small tablet / large phone): < 768px — stack header, 2-col KPIs/actions
   XS (mobile):                 < 480px  — single-column KPIs, compact cards
   ========================================================================== */

/* L — Large screens / small laptops */
@media (max-width: 1200px) {
  .kpi-grid { gap: 1rem; }
  .main-grid { gap: 1.25rem; }
}

/* M — Tablets: stack the two-column main grid */
@media (max-width: 900px) {
  .main-grid { grid-template-columns: 1fr; }
}

/* S — Small tablets / large phones */
@media (max-width: 768px) {
  .dashboard-container { gap: 1.5rem; }
  .dashboard-header { flex-direction: column; align-items: stretch; }
  .page-title { font-size: 1.5rem; }
  .header-actions { width: 100%; }
  .btn-primary { width: 100%; justify-content: center; }
  .kpi-grid { grid-template-columns: repeat(2, 1fr); }
  .actions-grid { grid-template-columns: repeat(2, 1fr); }
  .panel { padding: 1.25rem; }
}

/* XS — Mobile phones */
@media (max-width: 480px) {
  .dashboard-container { gap: 1.25rem; }
  .page-title { font-size: 1.3rem; }
  .page-subtitle { font-size: 0.85rem; }
  .kpi-grid { grid-template-columns: 1fr; gap: 0.85rem; }
  .kpi-card { padding: 1rem 1.15rem; }
  .kpi-value { font-size: 1.6rem; }
  .kpi-icon { width: 40px; height: 40px; }
  .kpi-icon svg { width: 18px; height: 18px; }
  .panel { padding: 1rem; }
  .panel-head h2 { font-size: 0.95rem; }
  .class-card { padding: 0.65rem 0.75rem; gap: 0.65rem; }
  .class-time { min-width: 44px; font-size: 0.68rem; gap: 0; }
  .time-sep { display: none; }
  .class-divider { height: 28px; }
  .class-code-row { flex-wrap: nowrap; }
  .class-name,
  .class-meta { overflow: hidden; text-overflow: ellipsis; white-space: nowrap; word-break: normal; }
  .actions-grid { grid-template-columns: repeat(2, 1fr); gap: 0.75rem; }
  .action-tile { padding: 1rem 0.5rem; font-size: 0.78rem; }
  .action-icon { width: 38px; height: 38px; }
  .action-icon svg { width: 18px; height: 18px; }
}

/* Utility */
.link-btn {
  background: none;
  border: none;
  color: #6366f1;
  font-size: 0.82rem;
  font-weight: 600;
  cursor: pointer;
  padding: 0;
  transition: color 0.2s;
  white-space: nowrap;
}
.link-btn:hover { color: #4f46e5; text-decoration: underline; }
</style>