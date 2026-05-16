<template>
  <div class="my-courses-container">
    <div class="page-header">
      <div>
        <h1 class="page-title">My Courses</h1>
        <p class="page-subtitle">Manage your active enrolments and track your attendance.</p>
      </div>
      <div class="header-controls">
        <select class="term-select">
          <option>Current Semester</option>
          <option>Previous Semester</option>
        </select>
      </div>
    </div>

    <div class="courses-content">
      <!-- Empty State -->
      <div v-if="myCourses.length === 0" class="empty-state">
        <div class="empty-icon-wrap">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
            <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"></path>
            <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"></path>
          </svg>
        </div>
        <h3>No Enrolled Courses</h3>
        <p>You haven't registered for any courses this semester.</p>
        <button class="primary-btn" @click="$emit('navigate', '/registration')">
          Browse Course Catalog
        </button>
      </div>

      <!-- Courses Grid (Visual layout if items exist) -->
      <div v-else class="courses-grid">
        <div class="course-card" v-for="course in myCourses" :key="course.id">
          <div class="course-color-bar" :style="{ backgroundColor: course.color }"></div>
          <div class="course-card-content">
            <div class="card-header">
              <span class="course-code">{{ course.code }}</span>
              <span class="credits-badge">{{ course.credits }} Credits</span>
            </div>
            
            <h3 class="course-name">{{ course.name }}</h3>
            
            <div class="instructor-info">
              <div class="avatar" :style="{ backgroundColor: course.color + '20', color: course.color }">
                {{ getInitials(course.lecturer) }}
              </div>
              <span class="instructor-name">{{ course.lecturer }}</span>
            </div>
            
            <div class="schedule-info">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline>
              </svg>
              {{ course.schedule || 'Schedule pending' }}
            </div>

            <div class="attendance-tracker">
              <div class="tracker-labels">
                <span>Attendance</span>
                <span :class="course.attendance < 75 ? 'text-danger' : 'text-success'">
                  {{ course.attendance }}%
                </span>
              </div>
              <div class="progress-bar">
                <div class="progress-fill" :style="{ width: `${course.attendance}%`, backgroundColor: course.attendance < 75 ? '#ef4444' : '#10b981' }"></div>
              </div>
            </div>

            <div class="card-actions">
              <button class="action-btn solid-btn" :style="{ backgroundColor: course.color }" @click="$emit('navigate', '/attendance')">
                Mark Present
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { studentEnrolledCourses } from '../../store.js';

const emit = defineEmits(['navigate']);

const myCourses = studentEnrolledCourses;

const getInitials = (name) => {
  return name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();
};
</script>

<style scoped>
.my-courses-container {
  display: flex;
  flex-direction: column;
  gap: 2rem;
  width: 100%;
}

.page-header {
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

.term-select {
  padding: 0.65rem 2rem 0.65rem 1rem;
  border: 1px solid #e2e8f0;
  border-radius: 10px;
  background-color: #ffffff;
  color: #0f172a;
  font-size: 0.9rem;
  font-weight: 500;
  outline: none;
  cursor: pointer;
  appearance: none;
  background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 24 24' fill='none' stroke='%2364748b' stroke-width='2' stroke-linecap='round' stroke-linejoin='round' xmlns='http://www.w3.org/2000/svg'%3E%3Cpolyline points='6 9 12 15 18 9'%3E%3C/polyline%3E%3C/svg%3E");
  background-repeat: no-repeat;
  background-position: right 0.75rem center;
  background-size: 16px;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);
}

.term-select:focus {
  border-color: #6366f1;
}

/* Empty State */
.courses-content {
  width: 100%;
}

.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 6rem 1rem;
  text-align: center;
  background-color: #ffffff;
  border-radius: 16px;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05);
  border: 1px solid rgba(226, 232, 240, 0.8);
}

.empty-icon-wrap {
  width: 80px;
  height: 80px;
  background-color: #f8fafc;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 1.5rem;
  color: #94a3b8;
}

.empty-icon-wrap svg {
  width: 40px;
  height: 40px;
  opacity: 0.8;
}

.empty-state h3 {
  margin: 0 0 0.5rem 0;
  font-size: 1.25rem;
  color: #1e293b;
  font-weight: 600;
}

.empty-state p {
  color: #64748b;
  margin: 0 0 2rem 0;
  font-size: 1rem;
}

.primary-btn {
  background-color: #4f46e5;
  color: white;
  border: none;
  padding: 0.85rem 1.75rem;
  border-radius: 10px;
  font-size: 0.95rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
  box-shadow: 0 4px 6px -1px rgba(79, 70, 229, 0.2);
}

.primary-btn:hover {
  background-color: #4338ca;
  transform: translateY(-2px);
  box-shadow: 0 6px 10px -2px rgba(79, 70, 229, 0.3);
}

/* Grid Layout */
.courses-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
  gap: 1.5rem;
}

.course-card {
  background-color: #ffffff;
  border-radius: 16px;
  overflow: hidden;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05), 0 2px 4px -1px rgba(0, 0, 0, 0.03);
  border: 1px solid rgba(226, 232, 240, 0.8);
  transition: transform 0.2s ease, box-shadow 0.2s ease;
  display: flex;
  flex-direction: column;
}

.course-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.05);
}

.course-color-bar {
  height: 6px;
  width: 100%;
}

.course-card-content {
  padding: 1.5rem;
  display: flex;
  flex-direction: column;
  flex: 1;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 0.75rem;
}

.course-code {
  font-size: 0.85rem;
  font-weight: 700;
  color: #64748b;
  letter-spacing: 0.05em;
}

.credits-badge {
  font-size: 0.75rem;
  font-weight: 600;
  background-color: #f1f5f9;
  color: #475569;
  padding: 0.2rem 0.5rem;
  border-radius: 4px;
}

.course-name {
  margin: 0 0 1rem 0;
  font-size: 1.15rem;
  font-weight: 600;
  color: #0f172a;
  line-height: 1.3;
}

.instructor-info {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  margin-bottom: 1rem;
}

.avatar {
  width: 28px;
  height: 28px;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.75rem;
  font-weight: 700;
}

.instructor-name {
  font-size: 0.9rem;
  color: #334155;
  font-weight: 500;
}

.schedule-info {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.85rem;
  color: #64748b;
  margin-bottom: 1.5rem;
  padding-bottom: 1.25rem;
  border-bottom: 1px solid #f1f5f9;
}

.schedule-info svg {
  width: 16px;
  height: 16px;
}

.attendance-tracker {
  margin-bottom: 1.5rem;
}

.tracker-labels {
  display: flex;
  justify-content: space-between;
  font-size: 0.85rem;
  font-weight: 600;
  color: #475569;
  margin-bottom: 0.5rem;
}

.text-success { color: #10b981; }
.text-danger { color: #ef4444; }

.progress-bar {
  height: 6px;
  background-color: #e2e8f0;
  border-radius: 999px;
  overflow: hidden;
}

.progress-fill {
  height: 100%;
  border-radius: 999px;
  transition: width 0.5s ease;
}

.card-actions {
  display: flex;
  gap: 0.75rem;
  margin-top: auto;
}

.action-btn {
  flex: 1;
  padding: 0.6rem;
  border-radius: 8px;
  font-size: 0.85rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
  text-align: center;
}

.outline-btn {
  background-color: transparent;
  color: #475569;
  border: 1px solid #cbd5e1;
}

.outline-btn:hover {
  background-color: #f8fafc;
  border-color: #94a3b8;
  color: #0f172a;
}

.solid-btn {
  color: white;
  border: none;
}

.solid-btn:hover {
  filter: brightness(110%);
}

/* Responsiveness */
@media (max-width: 768px) {
  .page-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 1rem;
  }
  
  .courses-grid {
    grid-template-columns: 1fr;
  }
  
  .term-select {
    width: 100%;
  }
}
</style>
