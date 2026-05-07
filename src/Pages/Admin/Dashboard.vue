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
          <button class="view-all-btn">View All</button>
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

        <div class="attendance-summary">
          <div class="panel-header">
            <h2>System Health</h2>
          </div>
          <div class="health-content">
            <div class="health-item">
              <div class="health-info">
                <span>Database Status</span>
                <span class="status-dot healthy"></span>
              </div>
              <p class="health-msg">All systems operational</p>
            </div>
            <div class="health-item">
              <div class="health-info">
                <span>API Latency</span>
                <span class="status-dot healthy"></span>
              </div>
              <p class="health-msg">42ms average response</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue';
import { availableGlobalCourses, masterSchedule } from '../../store.js';

const currentDate = new Date().toLocaleDateString('en-US', {
  weekday: 'long',
  year: 'numeric',
  month: 'long',
  day: 'numeric'
});

const currentDayName = new Date().toLocaleDateString('en-US', { weekday: 'long' });

const metrics = computed(() => [
  {
    title: 'Total Students',
    value: '1',
    trend: 5,
    bgColor: 'rgba(99, 102, 241, 0.1)',
    color: '#6366f1',
    icon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><path d="M23 21v-2a4 4 0 0 0-3-3.87"></path><path d="M16 3.13a4 4 0 0 1 0 7.75"></path></svg>'
  },
  {
    title: 'Average Attendance',
    value: '95%',
    trend: 2,
    bgColor: 'rgba(16, 185, 129, 0.1)',
    color: '#10b981',
    icon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"></polyline></svg>'
  },
  {
    title: 'Active Courses',
    value: availableGlobalCourses.value.filter(c => c.status === 'active').length.toString(),
    trend: 12,
    bgColor: 'rgba(245, 158, 11, 0.1)',
    color: '#f59e0b',
    icon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"></path><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"></path></svg>'
  },
  {
    title: 'Flagged Absences',
    value: '0',
    trend: -4,
    bgColor: 'rgba(239, 68, 68, 0.1)',
    color: '#ef4444',
    icon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polygon points="7.86 2 16.14 2 22 7.86 22 16.14 16.14 22 7.86 22 2 16.14 2 7.86 7.86 2"></polygon><line x1="12" y1="8" x2="12" y2="12"></line><line x1="12" y1="16" x2="12.01" y2="16"></line></svg>'
  }
]);

const todaySchedule = computed(() => {
  return masterSchedule.value
    .filter(schedule => schedule.day === currentDayName)
    .sort((a, b) => a.startTime.localeCompare(b.startTime))
    .map(schedule => {
      return {
        ...schedule,
        name: schedule.courseTitle,
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
  align-items: flex-start;
  gap: 1rem;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05), 0 2px 4px -1px rgba(0, 0, 0, 0.03);
  border: 1px solid rgba(226, 232, 240, 0.8);
  transition: transform 0.2s ease, box-shadow 0.2s ease;
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
}

.metric-trend {
  display: flex;
  align-items: center;
  gap: 0.25rem;
  margin: 0;
  font-size: 0.75rem;
  font-weight: 600;
}

.metric-trend svg {
  width: 14px;
  height: 14px;
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

@media (max-width: 1024px) {
  .dashboard-content-split {
    grid-template-columns: 1fr;
  }
}

.schedule-panel,
.attendance-summary {
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
}

.course-info h4 {
  margin: 0 0 0.35rem 0;
  font-size: 1rem;
  font-weight: 600;
  color: #1e293b;
}

.course-info p {
  margin: 0;
  font-size: 0.85rem;
  color: #64748b;
}

.status-badge {
  padding: 0.35rem 0.75rem;
  border-radius: 9999px;
  font-size: 0.75rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.05em;
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


/* System Health */
.health-content {
  display: flex;
  flex-direction: column;
  gap: 1.25rem;
}

.health-item {
  background-color: #f8fafc;
  padding: 1rem;
  border-radius: 10px;
  border: 1px solid #f1f5f9;
}

.health-info {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 0.5rem;
  font-weight: 600;
  font-size: 0.95rem;
  color: #1e293b;
}

.status-dot {
  width: 10px;
  height: 10px;
  border-radius: 50%;
}

.status-dot.healthy {
  background-color: #10b981;
  box-shadow: 0 0 0 3px rgba(16, 185, 129, 0.2);
}

.health-msg {
  margin: 0;
  font-size: 0.85rem;
  color: #64748b;
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

@media (max-width: 480px) {
  .metrics-grid {
    grid-template-columns: 1fr;
  }
  
  .time-block {
    flex-direction: column;
    align-items: flex-start;
    gap: 0.25rem;
  }
}
</style>
