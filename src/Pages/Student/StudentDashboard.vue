<template>
  <div class="dashboard-container">
    <div class="dashboard-header">
      <div class="header-text">
        <h1 class="page-title">Student Portal</h1>
        <p class="page-subtitle">Welcome to your central learning hub.</p>
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

    <!-- Student Metrics Grid -->
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
      <!-- Left Column: Upcoming Classes -->
      <div class="schedule-panel">
        <div class="panel-header">
          <h2>My Schedule For Today</h2>
          <button class="view-all-btn" @click="$emit('navigate', '/my-courses')">Full Timetable</button>
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
          
          <div v-if="todaySchedule.length === 0" class="empty-state">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
              <path d="M22 12h-4l-3 9L9 3l-3 9H2"></path>
            </svg>
            <p>You have no classes scheduled for today.</p>
            <button class="register-cta-btn" @click="$emit('navigate', '/registration')">Register for Courses</button>
          </div>
        </div>
      </div>


    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import api from '../../api.js';

const emit = defineEmits(['navigate']);

const studentEnrolledCourses = ref([]);
const masterSchedule = ref([]);
const attendanceSummary = ref([]);

onMounted(async () => {
  try {
    const [enrolledRes, schedulesRes, summaryRes] = await Promise.all([
      api.get('/courses/enrolled'),
      api.get('/schedules'),
      api.get('/attendance/summary')
    ]);
    studentEnrolledCourses.value = enrolledRes.data.map(item => item.course || item);
    masterSchedule.value = schedulesRes.data;
    attendanceSummary.value = summaryRes.data;
  } catch (error) {
    console.error('Error fetching student dashboard data:', error);
  }
});

const currentDate = new Date().toLocaleDateString('en-US', {
  weekday: 'long',
  year: 'numeric',
  month: 'long',
  day: 'numeric'
});

const metrics = computed(() => {
  let totalSessions = 0;
  let attendedSessions = 0;
  attendanceSummary.value.forEach(s => {
    totalSessions += s.totalSessions;
    attendedSessions += s.attendedSessions;
  });

  const overallAttendance = totalSessions > 0 ? Math.round((attendedSessions / totalSessions) * 100) : 0;
  const missedClasses = totalSessions - attendedSessions;

  return [
    {
      title: 'Enrolled Courses',
      value: studentEnrolledCourses.value.length.toString(),
      bgColor: 'rgba(99, 102, 241, 0.1)',
      color: '#6366f1',
      icon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"></path><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"></path></svg>'
    },
    {
      title: 'Overall Attendance',
      value: `${overallAttendance}%`,
      bgColor: 'rgba(16, 185, 129, 0.1)',
      color: '#10b981',
      icon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"></polyline></svg>'
    },
    {
      title: 'Classes Missed',
      value: missedClasses.toString(),
      bgColor: 'rgba(239, 68, 68, 0.1)',
      color: '#ef4444',
      icon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polygon points="7.86 2 16.14 2 22 7.86 22 16.14 16.14 22 7.86 22 2 16.14 2 7.86 7.86 2"></polygon><line x1="12" y1="8" x2="12" y2="12"></line><line x1="12" y1="16" x2="12.01" y2="16"></line></svg>'
    }
  ];
});

const currentDayName = new Date().toLocaleDateString('en-US', { weekday: 'long' });

const todaySchedule = computed(() => {
  const enrolledCodes = studentEnrolledCourses.value.map(c => c.code);
  return masterSchedule.value
    .filter(schedule => schedule.day === currentDayName && enrolledCodes.includes(schedule.course.code))
    .sort((a, b) => a.startTime.localeCompare(b.startTime))
    .map(schedule => {
      return {
        ...schedule,
        name: schedule.course?.name || schedule.courseTitle || 'Unknown Course',
        room: schedule.venue,
        status: 'upcoming',
        statusText: 'Upcoming'
      };
    });
});
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
}

.page-title {
  margin: 0;
  font-size: 1.75rem;
  font-weight: 700;
  color: #0f172a;
  letter-spacing: -0.025em;
}

.page-subtitle {
  margin: 0.25rem 0 0 0;
  font-size: 0.95rem;
  color: #64748b;
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
}

.date-badge svg {
  width: 16px;
  height: 16px;
  color: #6366f1;
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
  align-items: center;
  gap: 1.25rem;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05), 0 2px 4px -1px rgba(0, 0, 0, 0.03);
  border: 1px solid rgba(226, 232, 240, 0.8);
  transition: transform 0.2s ease, box-shadow 0.2s ease;
}

.metric-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.08), 0 4px 6px -2px rgba(0, 0, 0, 0.04);
}

.metric-icon-wrap {
  width: 54px;
  height: 54px;
  border-radius: 14px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.metric-icon {
  width: 26px;
  height: 26px;
  display: flex;
}

.metric-icon svg {
  width: 100%;
  height: 100%;
}

.metric-content {
  flex: 1;
}

.metric-title {
  margin: 0 0 0.25rem 0;
  font-size: 0.85rem;
  color: #64748b;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.metric-value {
  margin: 0;
  font-size: 1.85rem;
  font-weight: 700;
  color: #0f172a;
  letter-spacing: -0.025em;
}

/* Content Split */
.dashboard-content-split {
  display: grid;
  grid-template-columns: 1fr;
  gap: 1.5rem;
}

.schedule-panel,
.action-panel,
.notifications-summary {
  background-color: #ffffff;
  border-radius: 16px;
  padding: 1.5rem;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05), 0 2px 4px -1px rgba(0, 0, 0, 0.03);
  border: 1px solid rgba(226, 232, 240, 0.8);
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

.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 3rem 1rem;
  text-align: center;
  background-color: #f8fafc;
  border-radius: 12px;
  border: 1px dashed #cbd5e1;
}

.empty-state svg {
  width: 48px;
  height: 48px;
  color: #94a3b8;
  margin-bottom: 1rem;
  opacity: 0.5;
}

.empty-state p {
  color: #64748b;
  margin: 0 0 1.5rem 0;
  font-size: 1rem;
}

.register-cta-btn {
  background-color: #4f46e5;
  color: white;
  border: none;
  padding: 0.75rem 1.5rem;
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;
  transition: background-color 0.2s;
}

.register-cta-btn:hover {
  background-color: #4338ca;
}

/* Dashboard Responsiveness */
@media (max-width: 768px) {
  .dashboard-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 1rem;
  }
  
  .page-title {
    font-size: 1.5rem;
  }
}
</style>
