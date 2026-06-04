<template>
  <div class="lecturer-courses-container">
    <div class="page-header">
      <div>
        <h1 class="page-title">Assigned Courses</h1>
        <p class="page-subtitle">Manage the classes you are currently instructing.</p>
      </div>
      <div class="header-controls">
        <div class="semester-badge">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
            <line x1="16" y1="2" x2="16" y2="6"></line>
            <line x1="8" y1="2" x2="8" y2="6"></line>
            <line x1="3" y1="10" x2="21" y2="10"></line>
          </svg>
          Current Semester
        </div>
      </div>
    </div>

    <!-- Empty State if no courses assigned -->
    <div v-if="lecturerCourses.length === 0" class="empty-state">
      <div class="empty-icon-wrap">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
          <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"></path>
          <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"></path>
        </svg>
      </div>
      <h3>No Assigned Courses</h3>
      <p>You haven't been assigned to teach any courses this semester.</p>
    </div>

    <!-- Courses Grid -->
    <div v-else class="courses-grid">
      <div class="course-card" v-for="course in lecturerCourses" :key="course.id">
        <div class="course-color-bar" :style="{ backgroundColor: course.color }"></div>
        <div class="course-card-content">
          <div class="card-header">
            <span class="course-code">{{ course.code }}</span>
            <span class="student-count">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><path d="M23 21v-2a4 4 0 0 0-3-3.87"></path><path d="M16 3.13a4 4 0 0 1 0 7.75"></path></svg>
              {{ course.studentsCount }} Students
            </span>
          </div>
          
          <h3 class="course-name">{{ course.name }}</h3>
          
          <div class="schedule-info">
             <div class="info-row">
               <svg viewBox="0 0 24 24" fill="none" class="icon" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg>
               <span>{{ course.day }} • {{ course.time }}</span>
               <button class="icon-btn edit-btn" @click="openEditModal(course)" title="Reschedule Class">
                 <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path></svg>
               </button>
             </div>
             <div class="info-row">
               <svg viewBox="0 0 24 24" fill="none" class="icon" stroke="currentColor" stroke-width="2"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path><circle cx="12" cy="10" r="3"></circle></svg>
               <span>{{ course.venue }}</span>
             </div>
          </div>

          <div class="attendance-summary">
            <div class="summary-top">
              <span class="summary-label">Average Attendance</span>
              <span class="summary-value" :style="{ color: course.color }">{{ course.avgAttendance }}%</span>
            </div>
            <div class="progress-bar">
              <div class="progress-fill" :style="{ width: `${course.avgAttendance}%`, backgroundColor: course.color }"></div>
            </div>
          </div>

          <div class="card-actions">
            <button class="action-btn solid-btn" :style="{ backgroundColor: course.color }" @click="goToAttendance(course)">
              Take Attendance
            </button>
            <button class="action-btn outline-btn">
              View Class List
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Modal for Reschedule -->
    <div v-if="editingCourse" class="modal-overlay">
      <div class="modal-content">
        <h2>Reschedule Class</h2>
        <p>Update the schedule for {{ editingCourse.code }} - {{ editingCourse.name }}</p>
        
        <div class="form-group">
          <label>Day of Week</label>
          <select v-model="editForm.day" class="modern-input">
            <option>Mondays</option>
            <option>Tuesdays</option>
            <option>Wednesdays</option>
            <option>Thursdays</option>
            <option>Fridays</option>
            <option>Saturdays</option>
            <option>Sundays</option>
          </select>
        </div>

        <div class="form-group">
          <label>Time</label>
          <input type="text" v-model="editForm.time" class="modern-input" placeholder="e.g. 10:00 AM - 12:00 PM" />
        </div>

        <div class="modal-actions">
          <button class="action-btn outline-btn" @click="cancelEdit">Cancel</button>
          <button class="action-btn primary-btn" @click="saveEdit">Save Schedule</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import api from '../../api.js';

const emit = defineEmits(['navigate']);

const lecturerCourses = ref([]);

onMounted(async () => {
  try {
    const userJson = localStorage.getItem('user');
    const user = userJson ? JSON.parse(userJson) : null;
    const lecturerName = user ? user.name : '';

    const res = await api.get('/schedules');
    // For simplicity, showing all schedules or filtered by lecturer name
    const schedules = res.data.filter(s => !lecturerName || s.lecturer === lecturerName);
    
    lecturerCourses.value = schedules.map(s => ({
      id: s.courseId, // Use courseId to navigate to attendance
      code: s.course?.code || 'Unknown',
      name: s.course?.name || 'Unknown Course',
      semester: s.course?.semester || 'Semester 1',
      studentsCount: 0, // Placeholder
      day: s.day,
      time: `${s.startTime} - ${s.endTime}`,
      venue: s.venue,
      avgAttendance: 0,
      color: '#4f46e5'
    }));
  } catch (error) {
    console.error('Error fetching lecturer courses:', error);
  }
});

const editingCourse = ref(null);
const editForm = ref({ day: '', time: '' });

const openEditModal = (course) => {
  editingCourse.value = course;
  editForm.value = { day: course.day, time: course.time };
};

const goToAttendance = (course) => {
  localStorage.setItem('activeCourseId', course.id);
  localStorage.setItem('activeCourseCode', course.code);
  localStorage.setItem('activeCourseName', course.name);
  localStorage.setItem('activeCourseSemester', course.semester);
  emit('navigate', '/attendance-view');
};

const cancelEdit = () => {
  editingCourse.value = null;
};

const saveEdit = () => {
  if (editingCourse.value) {
    editingCourse.value.day = editForm.value.day;
    editingCourse.value.time = editForm.value.time;
    editingCourse.value = null;
    alert('Class schedule successfully updated!');
  }
};
</script>

<style scoped>
.lecturer-courses-container {
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

.semester-badge {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  background-color: #f1f5f9;
  color: #475569;
  padding: 0.5rem 1rem;
  border-radius: 9999px;
  font-size: 0.875rem;
  font-weight: 600;
  box-shadow: 0 1px 2px 0 rgba(0, 0, 0, 0.05);
  border: 1px solid #e2e8f0;
}

.semester-badge svg {
  width: 16px;
  height: 16px;
  color: #6366f1;
}

/* Empty State */
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
  margin: 0;
  font-size: 1rem;
}

/* Grid Layout */
.courses-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(340px, 1fr));
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
  height: 8px;
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
  background: #f1f5f9;
  padding: 4px 8px;
  border-radius: 6px;
}

.student-count {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 0.8rem;
  font-weight: 600;
  color: #475569;
}

.student-count svg {
  width: 14px;
  height: 14px;
  color: #94a3b8;
}

.course-name {
  margin: 0 0 1rem 0;
  font-size: 1.2rem;
  font-weight: 700;
  color: #0f172a;
  line-height: 1.3;
}

.schedule-info {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  margin-bottom: 1.5rem;
}

.info-row {
  display: flex;
  align-items: center;
  gap: 10px;
  color: #475569;
  font-size: 0.9rem;
  font-weight: 500;
}

.info-row .icon {
  width: 18px;
  height: 18px;
  color: #94a3b8;
}

.attendance-summary {
  margin-bottom: 1.5rem;
  padding-bottom: 1.5rem;
  border-bottom: 1px solid #f1f5f9;
}

.summary-top {
  display: flex;
  justify-content: space-between;
  align-items: flex-end;
  margin-bottom: 0.5rem;
}

.summary-label {
  font-size: 0.8rem;
  font-weight: 600;
  color: #64748b;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.summary-value {
  font-size: 1rem;
  font-weight: 800;
}

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
  padding: 0.7rem;
  border-radius: 10px;
  font-size: 0.9rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
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
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
}

.solid-btn:hover {
  filter: brightness(110%);
  transform: translateY(-1px);
  box-shadow: 0 6px 8px -1px rgba(0, 0, 0, 0.15);
}



/* Reschedule Buttons */
.icon-btn {
  background: none;
  border: none;
  color: #6366f1;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 4px;
  border-radius: 4px;
  transition: all 0.2s;
  margin-left: auto;
}

.icon-btn:hover {
  background: #e0e7ff;
  color: #4338ca;
}

.icon-btn svg {
  width: 16px;
  height: 16px;
}

/* Modal Styles */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(15, 23, 42, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  backdrop-filter: blur(4px);
}

.modal-content {
  background-color: #ffffff;
  border-radius: 16px;
  padding: 2rem;
  width: 90%;
  max-width: 500px;
  box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
}

.modal-content h2 {
  margin: 0 0 0.5rem 0;
  font-size: 1.5rem;
  font-weight: 700;
  color: #0f172a;
}

.modal-content p {
  margin: 0 0 1.5rem 0;
  color: #64748b;
  font-size: 0.95rem;
}

.form-group {
  margin-bottom: 1.5rem;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.form-group label {
  font-size: 0.85rem;
  font-weight: 600;
  color: #475569;
}

.modern-input {
  padding: 0.75rem 1rem;
  border: 1px solid #cbd5e1;
  border-radius: 8px;
  background-color: #f8fafc;
  font-size: 0.95rem;
  color: #0f172a;
  outline: none;
  transition: all 0.2s;
  font-family: inherit;
  width: 100%;
}

.modern-input:focus {
  background-color: #ffffff;
  border-color: #6366f1;
  box-shadow: 0 0 0 3px rgba(99, 102, 241, 0.1);
}

.modal-actions {
  display: flex;
  justify-content: flex-end;
  gap: 1rem;
  margin-top: 2rem;
}

.primary-btn {
  background-color: #10b981;
  color: white;
  border: none;
}

.primary-btn:hover {
  background-color: #059669;
}

@media (max-width: 768px) {
  .page-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 1rem;
  }
  
  .courses-grid {
    grid-template-columns: 1fr;
  }
  
  .card-actions {
    flex-direction: column;
  }
}
</style>
