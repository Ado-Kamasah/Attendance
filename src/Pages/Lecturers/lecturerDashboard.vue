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
import { ref, onMounted } from 'vue';
import api from '../../api.js';

const emit = defineEmits(['navigate']);

const currentDate = new Date().toLocaleDateString('en-US', {
  weekday: 'long',
  year: 'numeric',
  month: 'long',
  day: 'numeric'
});

const lecturerStats = ref({ totalActiveCourses: 0, totalStudentsTaught: 0, averageAttendanceRate: 0 });

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

const todaySchedule = ref([]);

onMounted(async () => {
  try {
    const userJson = localStorage.getItem('user');
    const user = userJson ? JSON.parse(userJson) : null;
    const lecturerName = user ? user.name : '';

    const currentDayName = new Date().toLocaleDateString('en-US', { weekday: 'long' }) + 's'; // e.g., 'Mondays'
    
    const [schedulesRes, statsRes] = await Promise.all([
      api.get('/schedules'),
      api.get('/attendance/lecturer-stats')
    ]);
    
    lecturerStats.value = statsRes.data;

    const schedules = schedulesRes.data.filter(s => 
      (!lecturerName || s.lecturer === lecturerName) &&
      (s.day === currentDayName || s.day === currentDayName.replace('s', ''))
    );
    
    // We can just query course enrollment sizes if needed, but for now we'll set a placeholder or fetch it
    todaySchedule.value = schedules.map(s => ({
      id: s.id,
      courseId: s.courseId,
      code: s.course?.code || 'Unknown',
      name: s.course?.name || 'Unknown Course',
      startTime: s.startTime,
      endTime: s.endTime,
      venue: s.venue,
      students: s.course?._count?.enrollments || 0
    }));
  } catch (error) {
    console.error('Error fetching dashboard schedules:', error);
  }
});

const markAttendance = (cls) => {
  localStorage.setItem('activeCourseId', cls.courseId);
  localStorage.setItem('activeCourseCode', cls.code);
  localStorage.setItem('activeCourseName', cls.name);
  emit('navigate', '/attendance-view');
};
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
  font-weight: 800;
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
  gap: 0.75rem;
  background-color: #ffffff;
  padding: 0.6rem 1.25rem;
  border-radius: 9999px;
  font-size: 0.875rem;
  font-weight: 600;
  color: #475569;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
  border: 1px solid #e2e8f0;
}

.date-badge svg {
  width: 18px;
  height: 18px;
  color: #6366f1;
}

/* Key Metrics */
.metrics-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(min(100%, 260px), 1fr));
  gap: 1.5rem;
}

.metric-card {
  background-color: #ffffff;
  border-radius: 16px;
  padding: 1.75rem 1.5rem;
  display: flex;
  align-items: center;
  gap: 1.25rem;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05), 0 2px 4px -1px rgba(0, 0, 0, 0.03);
  border: 1px solid rgba(226, 232, 240, 0.8);
  transition: transform 0.2s ease, box-shadow 0.2s ease;
}

.metric-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 12px 20px -3px rgba(0, 0, 0, 0.08), 0 4px 6px -2px rgba(0, 0, 0, 0.04);
}

.metric-icon-wrap {
  width: 56px;
  height: 56px;
  border-radius: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.metric-icon {
  width: 28px;
  height: 28px;
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
  font-size: 0.85rem;
  color: #64748b;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.metric-value {
  margin: 0;
  font-size: 2rem;
  font-weight: 800;
  color: #0f172a;
  letter-spacing: -0.025em;
  line-height: 1;
}

/* Content Split */
.dashboard-content-split {
  display: grid;
  grid-template-columns: 2fr 1fr;
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
  font-weight: 700;
  color: #0f172a;
  letter-spacing: -0.015em;
}

.view-all-btn {
  background: none;
  border: none;
  color: #6366f1;
  font-size: 0.9rem;
  font-weight: 600;
  cursor: pointer;
  padding: 0;
  transition: color 0.2s;
}

.view-all-btn:hover {
  color: #4338ca;
  text-decoration: underline;
}

/* Teaching Schedule List */
.schedule-list {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.schedule-item {
  display: flex;
  align-items: stretch;
  background: #f8fafc;
  border: 1px solid #e2e8f0;
  border-radius: 12px;
  overflow: hidden;
  transition: all 0.2s;
}

.schedule-item:hover {
  border-color: #cbd5e1;
  box-shadow: 0 2px 8px rgba(0,0,0,0.04);
}

.time-block {
  display: flex;
  flex-direction: column;
  justify-content: center;
  background: #f1f5f9;
  padding: 1.25rem;
  min-width: 140px;
  border-right: 1px solid #e2e8f0;
}

.time-start {
  font-weight: 800;
  color: #0f172a;
  font-size: 1.05rem;
}

.time-end {
  font-size: 0.85rem;
  color: #64748b;
  font-weight: 600;
  margin-top: 4px;
}

.course-info {
  padding: 1.25rem;
  flex: 1;
  display: flex;
  flex-direction: column;
  justify-content: center;
}

.course-info h4 {
  margin: 0 0 0.5rem 0;
  font-size: 1.1rem;
  font-weight: 700;
  color: #1e293b;
  display: flex;
  align-items: center;
  gap: 10px;
}

.course-code {
  background: #e0e7ff;
  color: #4f46e5;
  font-size: 0.75rem;
  padding: 2px 8px;
  border-radius: 6px;
  font-weight: 800;
}

.course-info p {
  margin: 0;
  color: #475569;
  font-size: 0.9rem;
}

.action-block {
  padding: 1.25rem;
  display: flex;
  align-items: center;
  justify-content: center;
}

.mark-btn {
  background: #10b981;
  color: white;
  border: none;
  padding: 0.75rem 1.25rem;
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;
  white-space: nowrap;
  transition: all 0.2s;
  box-shadow: 0 2px 4px rgba(16, 185, 129, 0.2);
}

.mark-btn:hover {
  background: #059669;
  transform: translateY(-1px);
}

.empty-schedule {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 4rem 1rem;
  text-align: center;
  background-color: #f8fafc;
  border-radius: 12px;
  border: 1px dashed #cbd5e1;
}

.icon-circle {
  width: 64px;
  height: 64px;
  background-color: #f1f5f9;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 1.25rem;
}

.icon-circle svg {
  width: 32px;
  height: 32px;
  color: #94a3b8;
}

.empty-schedule p {
  color: #1e293b;
  margin: 0 0 0.5rem 0;
  font-size: 1.1rem;
  font-weight: 600;
}

.empty-schedule span {
  color: #64748b;
  font-size: 0.9rem;
}

/* Quick Actions */
.action-grid {
  display: grid;
  grid-template-columns: 1fr;
  gap: 1rem;
}

.action-btn {
  display: flex;
  align-items: center;
  justify-content: flex-start;
  gap: 1.25rem;
  padding: 1.25rem;
  background-color: #f8fafc;
  border: 1px solid #e2e8f0;
  border-radius: 12px;
  cursor: pointer;
  font-size: 0.95rem;
  font-weight: 600;
  color: #334155;
  transition: all 0.2s ease;
  font-family: inherit;
  text-align: left;
}

.action-btn:hover {
  background-color: #ffffff;
  border-color: #cbd5e1;
  box-shadow: 0 4px 8px -1px rgba(0, 0, 0, 0.05);
  transform: translateX(4px);
}

.icon-wrap {
  width: 44px;
  height: 44px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  flex-shrink: 0;
}

.icon-wrap svg {
  width: 22px;
  height: 22px;
}

.bg-indigo { background-color: #6366f1; }
.bg-emerald { background-color: #10b981; }
.bg-purple { background-color: #8b5cf6; }

/* Alerts Summary */
.alerts-content {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.alert-item {
  display: flex;
  align-items: center;
  gap: 1.25rem;
  padding: 1.25rem;
  border-radius: 12px;
  background-color: #f8fafc;
  border: 1px solid #e2e8f0;
}

.empty-alert {
  background-color: #ffffff;
  border: 1px dashed #cbd5e1;
}

.alert-icon {
  width: 42px;
  height: 42px;
  background-color: #f1f5f9;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #64748b;
  flex-shrink: 0;
}

.bg-amber-light {
  background-color: #fef3c7;
}

.alert-icon svg {
  width: 20px;
  height: 20px;
}

.alert-text p {
  margin: 0 0 0.35rem 0;
  font-weight: 700;
  font-size: 0.95rem;
  color: #1e293b;
}

.alert-text span {
  font-size: 0.85rem;
  color: #64748b;
}

/* Dashboard Responsiveness */
@media (max-width: 1024px) {
  .dashboard-content-split {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 768px) {
  .dashboard-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 1.25rem;
  }
  
  .page-title {
    font-size: 1.5rem;
  }
  
  .schedule-item {
    flex-direction: column;
  }
  
  .time-block {
    border-right: none;
    border-bottom: 1px solid #e2e8f0;
    flex-direction: row;
    justify-content: flex-start;
    gap: 10px;
    align-items: center;
  }
  
  .time-end {
    margin-top: 0;
  }
  
  .action-block {
    padding-top: 0;
  }
  
  .mark-btn {
    width: 100%;
  }
}
</style>
