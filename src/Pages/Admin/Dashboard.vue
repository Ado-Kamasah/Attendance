<template>
  <div class="dashboard-container">
    <div class="dashboard-header">
      <h1 class="page-title">Dashboard Overview</h1>
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
          <p class="metric-trend" :class="metric.trend > 0 ? 'positive' : 'negative'">
            <svg v-if="metric.trend > 0" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="23 6 13.5 15.5 8.5 10.5 1 18"></polyline><polyline points="17 6 23 6 23 12"></polyline></svg>
            <svg v-else viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="23 18 13.5 8.5 8.5 13.5 1 6"></polyline><polyline points="17 18 23 18 23 12"></polyline></svg>
            <span>{{ Math.abs(metric.trend) }}% from last week</span>
          </p>
        </div>
      </div>
    </div>

    <div class="dashboard-content-split">
      <!-- Left Column: Ongoing / Upcoming Schedules -->
      <div class="schedule-panel">
        <div class="panel-header">
          <h2>Today's Schedule</h2>
          <button class="view-all-btn" @click="$emit('navigate', '/schedule')">View All</button>
        </div>
        
        <div class="schedule-list">
          <div class="schedule-item" v-for="course in todaySchedule" :key="course.id">
            <div class="time-block">
              <span class="time-start">{{ course.startTime }}</span>
              <span class="time-end">{{ course.endTime }}</span>
            </div>
            <div class="course-info">
              <h4>{{ course.name }}</h4>
              <p>{{ course.lecturer }} • {{ course.room }}</p>
            </div>
            <div class="status-badge" :class="course.status">
              {{ course.statusText }}
            </div>
          </div>
          
          <div v-if="todaySchedule.length === 0" class="empty-schedule-msg" style="padding: 2rem; text-align: center; color: #94a3b8; font-size: 0.9rem;">
            You have no courses scheduled for today.
          </div>
        </div>
      </div>

      <div class="side-panel">
        <div class="attendance-summary audit-panel">
          <div class="panel-header">
            <h2>Live Audit Logs</h2>
          </div>
          <div class="audit-content">
            <div class="audit-item" v-for="log in systemAuditLogs.slice(0, 5)" :key="log.id">
              <div class="audit-header">
                <span class="audit-action">{{ log.action }}</span>
                <span class="audit-time">{{ log.timestamp }}</span>
              </div>
              <p class="audit-details">{{ log.details }}</p>
              <div class="audit-user">
                <span class="user-role" :class="log.role.toLowerCase()">{{ log.role }}</span>
                <span class="user-name">{{ log.user }}</span>
              </div>
            </div>
            <div v-if="systemAuditLogs.length === 0" class="empty-msg">No audit logs available.</div>
          </div>
          <button class="view-all-btn full-width" @click="alert('Full Audit Trail functionality coming soon')">View Full Audit Trail</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue';
import { storeToRefs } from 'pinia';
import { useCoursesStore } from '@/stores/courses';
import { useSchedulesStore } from '@/stores/schedules';
import { useAuditLogsStore } from '@/stores/auditlogs';
import { useEnrollmentsStore } from '@/stores/enrollments';
import { useAttendancesStore } from '@/stores/attendances';

const coursesStore = useCoursesStore();
const schedulesStore = useSchedulesStore();
const auditLogsStore = useAuditLogsStore();
const enrollmentsStore = useEnrollmentsStore();
const attendancesStore = useAttendancesStore();

const { courses } = storeToRefs(coursesStore);
const { schedules } = storeToRefs(schedulesStore);
const { logs } = storeToRefs(auditLogsStore);
const { enrollments } = storeToRefs(enrollmentsStore);
const { attendances } = storeToRefs(attendancesStore);

onMounted(async () => {
  try {
    await Promise.all([
      coursesStore.fetchCourses(),
      schedulesStore.fetchSchedules(),
      auditLogsStore.fetchLogs(),
      enrollmentsStore.fetchEnrollments(),
      attendancesStore.fetchAttendances(),
    ]);

    coursesStore.subscribeToCourses();
    schedulesStore.subscribeToSchedules();
    auditLogsStore.subscribeToLogs();
    enrollmentsStore.subscribeToEnrollments();
    attendancesStore.subscribeToAttendances();
  } catch (error) {
    console.error('Error fetching dashboard data:', error);
  }
});

onUnmounted(() => {
  coursesStore.unsubscribeFromCourses();
  schedulesStore.unsubscribeFromSchedules();
  auditLogsStore.unsubscribeFromLogs();
  enrollmentsStore.unsubscribeFromEnrollments();
  attendancesStore.unsubscribeFromAttendances();
});

const currentDate = new Date().toLocaleDateString('en-US', {
  weekday: 'long',
  year: 'numeric',
  month: 'long',
  day: 'numeric'
});

const currentDayName = new Date().toLocaleDateString('en-US', { weekday: 'long' });

// --- Derived stats (replacing the old /admin/dashboard-stats endpoint) ---

const totalStudents = computed(() => {
  const uniqueStudentIds = new Set(enrollments.value.map((e) => e.studentId));
  return uniqueStudentIds.size;
});

const averageAttendance = computed(() => {
  if (attendances.value.length === 0) return 0;
  const presentCount = attendances.value.filter((a) => a.status === 'present').length;
  return Math.round((presentCount / attendances.value.length) * 100);
});

const flaggedAbsences = computed(() =>
  attendances.value.filter((a) => a.status === 'absent').length
);

const metrics = computed(() => [
  {
    title: 'Total Students',
    value: totalStudents.value.toString(),
    trend: 5,
    bgColor: 'rgba(99, 102, 241, 0.1)',
    color: '#6366f1',
    icon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><path d="M23 21v-2a4 4 0 0 0-3-3.87"></path><path d="M16 3.13a4 4 0 0 1 0 7.75"></path></svg>'
  },
  {
    title: 'Average Attendance',
    value: `${averageAttendance.value}%`,
    trend: 2,
    bgColor: 'rgba(16, 185, 129, 0.1)',
    color: '#10b981',
    icon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"></polyline></svg>'
  },
  {
    title: 'Active Courses',
    value: courses.value.filter((c) => c.status === 'active').length.toString(),
    trend: 12,
    bgColor: 'rgba(245, 158, 11, 0.1)',
    color: '#f59e0b',
    icon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"></path><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"></path></svg>'
  },
  {
    title: 'Flagged Absences',
    value: flaggedAbsences.value.toString(),
    trend: -4,
    bgColor: 'rgba(239, 68, 68, 0.1)',
    color: '#ef4444',
    icon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polygon points="7.86 2 16.14 2 22 7.86 22 16.14 16.14 22 7.86 22 2 16.14 2 7.86 7.86 2"></polygon><line x1="12" y1="8" x2="12" y2="12"></line><line x1="12" y1="16" x2="12.01" y2="16"></line></svg>'
  }
]);

// --- Today's schedule (attach course info via coursesStore, same pattern as Schedule.vue) ---
const todaySchedule = computed(() => {
  return schedules.value
    .filter((s) => s.day === currentDayName)
    .sort((a, b) => (a.startTime || '').localeCompare(b.startTime || ''))
    .map((s) => {
      const course = coursesStore.getCourseById(s.courseId);
      return {
        ...s,
        name: course?.name ?? 'Unknown Course',
        room: s.venue,
        status: 'upcoming',
        statusText: 'Upcoming'
      };
    });
});

// --- Audit logs reshaped to match the template's expected field names ---
const systemAuditLogs = computed(() =>
  logs.value.map((l) => ({
    id: l.id,
    action: l.action,
    details: l.details,
    timestamp: l.timestamp
      ? new Date(l.timestamp).toLocaleString('en-US', {
          hour: 'numeric',
          minute: '2-digit',
          month: 'short',
          day: 'numeric'
        })
      : '',
    role: l.userRole || 'System',
    user: l.userName || 'System',
  }))
);
</script>

<style scoped>
.dashboard-container {
  display: flex;
  flex-direction: column;
  gap: 2rem;
  width: 100%;
}

.dashboard-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 1rem;
}

.page-title {
  margin: 0;
  font-size: 1.75rem;
  font-weight: 700;
  color: #0f172a;
  letter-spacing: -0.025em;
}

.date-badge {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  background-color: #ffffff;
  padding: 0.5rem 1rem;
  border-radius: 9999px;
  font-size: 0.875rem;
  font-weight: 500;
  color: #64748b;
  box-shadow: 0 1px 2px 0 rgba(0, 0, 0, 0.05);
  border: 1px solid #e2e8f0;
  white-space: nowrap;
}

.date-badge svg {
  width: 16px;
  height: 16px;
  color: #6366f1;
  flex-shrink: 0;
}

/* Key Metrics */
.metrics-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(min(100%, 240px), 1fr));
  gap: 1.5rem;
}

.metric-card {
  background-color: #ffffff;
  border-radius: 16px;
  padding: 1.5rem;
  display: flex;
  align-items: flex-start;
  gap: 1rem;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05), 0 2px 4px -1px rgba(0, 0, 0, 0.03);
  border: 1px solid rgba(226, 232, 240, 0.8);
  transition: transform 0.2s ease, box-shadow 0.2s ease;
  min-width: 0;
}

.metric-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.08), 0 4px 6px -2px rgba(0, 0, 0, 0.04);
}

.metric-icon-wrap {
  width: 48px;
  height: 48px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.metric-icon {
  width: 24px;
  height: 24px;
  display: flex;
}

.metric-icon svg {
  width: 100%;
  height: 100%;
}

.metric-content {
  flex: 1;
  min-width: 0;
}

.metric-title {
  margin: 0 0 0.5rem 0;
  font-size: 0.875rem;
  color: #64748b;
  font-weight: 500;
}

.metric-value {
  margin: 0 0 0.5rem 0;
  font-size: 1.75rem;
  font-weight: 700;
  color: #0f172a;
  letter-spacing: -0.025em;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.metric-trend {
  display: flex;
  align-items: center;
  gap: 0.25rem;
  margin: 0;
  font-size: 0.75rem;
  font-weight: 600;
  flex-wrap: wrap;
}

.metric-trend svg {
  width: 14px;
  height: 14px;
  flex-shrink: 0;
}

.metric-trend.positive {
  color: #10b981;
}

.metric-trend.negative {
  color: #ef4444;
}

.metric-trend span {
  color: #94a3b8;
  font-weight: 500;
  margin-left: 0.25rem;
}

/* Content Split */
.dashboard-content-split {
  display: grid;
  grid-template-columns: 2fr 1fr;
  gap: 1.5rem;
}

.schedule-panel,
.attendance-summary {
  background-color: #ffffff;
  border-radius: 16px;
  padding: 1.5rem;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05), 0 2px 4px -1px rgba(0, 0, 0, 0.03);
  border: 1px solid rgba(226, 232, 240, 0.8);
  min-width: 0;
}

.side-panel {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.panel-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;
  flex-wrap: wrap;
  gap: 0.5rem;
}

.panel-header h2 {
  margin: 0;
  font-size: 1.25rem;
  font-weight: 600;
  color: #0f172a;
  letter-spacing: -0.015em;
}

.view-all-btn {
  background: none;
  border: none;
  color: #6366f1;
  font-size: 0.875rem;
  font-weight: 600;
  cursor: pointer;
  padding: 0;
  transition: color 0.2s;
  white-space: nowrap;
}

.view-all-btn:hover {
  color: #4f46e5;
  text-decoration: underline;
}

/* Schedule List */
.schedule-list {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.schedule-item {
  display: flex;
  align-items: center;
  gap: 1.5rem;
  padding: 1rem;
  border-radius: 12px;
  background-color: #f8fafc;
  border: 1px solid transparent;
  transition: background-color 0.2s, border-color 0.2s;
}

.schedule-item:hover {
  background-color: #ffffff;
  border-color: #e2e8f0;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.02);
}

.time-block {
  display: flex;
  flex-direction: column;
  min-width: 80px;
  align-items: flex-end;
  border-right: 2px solid #e2e8f0;
  padding-right: 1.5rem;
  flex-shrink: 0;
}

.time-start {
  font-weight: 600;
  color: #0f172a;
  font-size: 0.95rem;
}

.time-end {
  font-size: 0.8rem;
  color: #94a3b8;
  margin-top: 0.25rem;
}

.course-info {
  flex: 1;
  min-width: 0;
}

.course-info h4 {
  margin: 0 0 0.35rem 0;
  font-size: 1rem;
  font-weight: 600;
  color: #1e293b;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.course-info p {
  margin: 0;
  font-size: 0.85rem;
  color: #64748b;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.status-badge {
  padding: 0.35rem 0.75rem;
  border-radius: 9999px;
  font-size: 0.75rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  white-space: nowrap;
  flex-shrink: 0;
}

.status-badge.completed {
  background-color: #dcfce7;
  color: #166534;
}

.status-badge.ongoing {
  background-color: #e0e7ff;
  color: #3730a3;
  position: relative;
}

.status-badge.ongoing::before {
  content: '';
  display: inline-block;
  width: 6px;
  height: 6px;
  background-color: #4f46e5;
  border-radius: 50%;
  margin-right: 6px;
  margin-bottom: 1px;
  animation: pulse 2s infinite;
}

@keyframes pulse {
  0% { transform: scale(0.95); box-shadow: 0 0 0 0 rgba(79, 70, 229, 0.7); }
  70% { transform: scale(1); box-shadow: 0 0 0 6px rgba(79, 70, 229, 0); }
  100% { transform: scale(0.95); box-shadow: 0 0 0 0 rgba(79, 70, 229, 0); }
}

.status-badge.upcoming {
  background-color: #f1f5f9;
  color: #475569;
}


/* Live Audit Logs */
.audit-panel {
  display: flex;
  flex-direction: column;
}

.audit-content {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  margin-bottom: 1rem;
}

.audit-item {
  background-color: #f8fafc;
  padding: 1rem;
  border-radius: 10px;
  border-left: 3px solid #6366f1;
  min-width: 0;
}

.audit-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 0.25rem;
  gap: 0.5rem;
  flex-wrap: wrap;
}

.audit-action {
  font-weight: 700;
  font-size: 0.9rem;
  color: #0f172a;
}

.audit-time {
  font-size: 0.75rem;
  color: #94a3b8;
  white-space: nowrap;
}

.audit-details {
  margin: 0 0 0.5rem 0;
  font-size: 0.85rem;
  color: #475569;
  line-height: 1.4;
  word-break: break-word;
}

.audit-user {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  flex-wrap: wrap;
}

.user-role {
  font-size: 0.65rem;
  text-transform: uppercase;
  font-weight: 700;
  padding: 0.15rem 0.4rem;
  border-radius: 4px;
  white-space: nowrap;
}

.user-role.system {
  background-color: #f1f5f9;
  color: #64748b;
}

.user-role.lecturer {
  background-color: #e0e7ff;
  color: #4338ca;
}

.user-role.student {
  background-color: #dcfce7;
  color: #15803d;
}

.user-name {
  font-size: 0.8rem;
  color: #64748b;
  font-weight: 500;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.empty-msg {
  color: #94a3b8;
  font-size: 0.85rem;
  text-align: center;
  padding: 1rem 0;
}

.full-width {
  width: 100%;
  padding: 0.75rem;
  background-color: #f8fafc;
  border-radius: 8px;
  margin-top: auto;
}

.full-width:hover {
  background-color: #f1f5f9;
  text-decoration: none;
}

/* ================================
   RESPONSIVE BREAKPOINTS
   Small laptop (≤1200px) → Tablet (≤1024px) → Tablet/large phone (≤768px)
   → Mobile L (≤480px) → Mobile M (≤414px) → Mobile S (≤360px)
   ================================ */

@media (max-width: 1200px) {
  .metrics-grid {
    grid-template-columns: repeat(auto-fit, minmax(min(100%, 200px), 1fr));
  }
}

@media (max-width: 1024px) {
  .dashboard-content-split {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 768px) {
  .dashboard-container {
    gap: 1.5rem;
  }

  .dashboard-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 0.75rem;
  }

  .page-title {
    font-size: 1.5rem;
  }

  .metrics-grid {
    grid-template-columns: repeat(auto-fit, minmax(min(100%, 220px), 1fr));
    gap: 1rem;
  }

  .metric-card {
    padding: 1.25rem;
  }

  .schedule-panel,
  .attendance-summary {
    padding: 1.25rem;
  }

  .schedule-item {
    flex-direction: column;
    align-items: stretch;
    gap: 0.75rem;
    padding: 1.25rem;
  }

  .time-block {
    flex-direction: row;
    align-items: center;
    gap: 0.5rem;
    border-right: none;
    border-bottom: 2px solid #e2e8f0;
    padding-right: 0;
    padding-bottom: 0.75rem;
  }

  .time-end {
    margin-top: 0;
  }

  .status-badge {
    align-self: flex-start;
    margin-top: 0.5rem;
  }
}

/* Mobile L (large phones, ~425-480px) */
@media (max-width: 480px) {
  .page-title {
    font-size: 1.3rem;
  }

  .date-badge {
    font-size: 0.8rem;
    padding: 0.45rem 0.85rem;
  }

  .metrics-grid {
    grid-template-columns: 1fr;
  }

  .metric-icon-wrap {
    width: 42px;
    height: 42px;
  }

  .metric-icon {
    width: 20px;
    height: 20px;
  }

  .metric-value {
    font-size: 1.5rem;
  }

  .panel-header h2 {
    font-size: 1.1rem;
  }

  .time-block {
    flex-direction: column;
    align-items: flex-start;
    gap: 0.25rem;
  }

  .audit-item {
    padding: 0.85rem;
  }
}

/* Mobile M (e.g. iPhone SE/12/13, ~375-414px) */
@media (max-width: 414px) {
  .metric-card {
    padding: 1rem;
    gap: 0.75rem;
  }

  .schedule-panel,
  .attendance-summary {
    padding: 1rem;
  }

  .schedule-item {
    padding: 1rem;
  }

  .audit-item {
    padding: 0.75rem;
  }

  .audit-action {
    font-size: 0.85rem;
  }

  .audit-details {
    font-size: 0.8rem;
  }

  .full-width {
    padding: 0.65rem;
    font-size: 0.85rem;
  }
}

/* Mobile S (small phones, ≤360px) */
@media (max-width: 360px) {
  .page-title {
    font-size: 1.15rem;
  }

  .date-badge span {
    font-size: 0.75rem;
  }

  .metric-icon-wrap {
    width: 38px;
    height: 38px;
  }

  .metric-icon {
    width: 18px;
    height: 18px;
  }

  .metric-value {
    font-size: 1.3rem;
  }

  .metric-title {
    font-size: 0.8rem;
  }

  .metric-trend {
    font-size: 0.68rem;
  }

  .course-info h4 {
    font-size: 0.9rem;
  }

  .status-badge {
    font-size: 0.68rem;
    padding: 0.3rem 0.6rem;
  }

  .user-role {
    font-size: 0.6rem;
  }
}
</style>