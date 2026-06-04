<template>
  <div class="schedule-container">
    <header class="page-header">
      <div class="header-content">
        <h1 class="page-title">Master Schedule</h1>
        <p class="page-subtitle">Manage lecture timings, venues, and instructor assignments.</p>
      </div>
      <button class="btn-primary" @click="openAddModal">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="icon">
          <line x1="12" y1="5" x2="12" y2="19"></line>
          <line x1="5" y1="12" x2="19" y2="12"></line>
        </svg>
        <span>Add Class</span>
      </button>
    </header>

    <div class="filters-panel">
      <div class="filter-section">
        <span class="filter-label">Semester</span>
        <div class="pill-group">
          <button class="filter-pill" :class="{ active: selectedSemester === 'All' }" @click="selectedSemester = 'All'">All</button>
          <button class="filter-pill" :class="{ active: selectedSemester === 'Semester 1' }" @click="selectedSemester = 'Semester 1'">Sem 1</button>
          <button class="filter-pill" :class="{ active: selectedSemester === 'Semester 2' }" @click="selectedSemester = 'Semester 2'">Sem 2</button>
        </div>
      </div>

      <div class="filter-section">
        <span class="filter-label">Academic Level</span>
        <div class="pill-group">
          <button v-for="level in levels" :key="level" 
            class="filter-pill" :class="{ active: selectedLevel === level }"
            @click="selectedLevel = level">
            Level {{ level }}
          </button>
        </div>
      </div>
      
      <div class="filter-section">
        <span class="filter-label">Session Mode</span>
        <div class="pill-group">
          <button v-for="mode in modes" :key="mode" 
            class="filter-pill" :class="{ active: selectedMode === mode }"
            @click="selectedMode = mode">
            {{ mode }}
          </button>
        </div>
      </div>
    </div>

    <div class="schedule-layout">
      <aside class="days-sidebar">
        <button v-for="day in activeDays" :key="day" 
          class="day-btn" :class="{ active: selectedDay === day }"
          @click="selectedDay = day">
          <span class="day-name">{{ day }}</span>
          <span class="class-count" v-if="getClassCount(day) > 0">{{ getClassCount(day) }}</span>
        </button>
      </aside>

      <main class="classes-area">
        <div class="classes-list" v-if="filteredClasses.length > 0">
          <div v-for="cls in filteredClasses" :key="cls.id" class="class-card">
            <div class="class-time">
              <span class="time-block">{{ formatTime(cls.startTime) }} - {{ formatTime(cls.endTime) }}</span>
              <span class="duration">{{ getDuration(cls.startTime, cls.endTime) }} hrs</span>
            </div>
            
            <div class="class-divider"></div>
            
            <div class="class-details">
              <div class="course-header">
                <span class="course-code">{{ cls.courseCode }}</span>
                <span class="semester-tag">{{ cls.semester || 'Semester 1' }}</span>
                <h3 class="course-title">{{ cls.courseTitle }}</h3>
              </div>
              <div class="meta-info">
                <span class="meta-item">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="meta-icon"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>
                  {{ cls.lecturer }}
                </span>
                <span class="meta-separator">•</span>
                <span class="meta-item">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="meta-icon"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path><circle cx="12" cy="10" r="3"></circle></svg>
                  {{ cls.venue }}
                </span>
              </div>
            </div>
            
            <div class="class-actions">
              <button class="action-btn edit" title="Edit" @click="alert('Edit class functionality coming soon')">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path></svg>
              </button>
              <button class="action-btn delete" title="Delete" @click="deleteClass(cls.id)">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>
              </button>
            </div>
          </div>
        </div>

        <div v-else class="empty-state">
          <div class="empty-icon-wrapper">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" class="empty-icon">
              <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
              <line x1="16" y1="2" x2="16" y2="6"></line>
              <line x1="8" y1="2" x2="8" y2="6"></line>
              <line x1="3" y1="10" x2="21" y2="10"></line>
            </svg>
          </div>
          <h3>No classes scheduled</h3>
          <p>No classes are arranged for {{ selectedDay }}. Click "Add Class" to schedule one.</p>
          <button class="btn-outline" @click="openAddModal">Schedule a Class</button>
        </div>
      </main>
    </div>

    <!-- Add Class Modal -->
    <div class="modal-backdrop" v-if="isModalOpen" @click.self="closeModal">
      <div class="modal-card">
        <div class="modal-header">
          <h2>Add New Class</h2>
          <button class="close-btn" @click="closeModal" aria-label="Close modal">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
          </button>
        </div>
        <div class="modal-body">
          <form @submit.prevent="saveClass" class="schedule-form">
            <div class="form-grid">
              <div class="form-group col-span-2">
                <label>Select Course</label>
                <select v-model="newClass.courseId" required class="form-select w-full" style="padding: 12px; border: 1px solid #cbd5e1; border-radius: 10px;">
                  <option disabled value="">Choose a course</option>
                  <option v-for="course in courses" :key="course.id" :value="course.id">
                    {{ course.code }} - {{ course.name }}
                  </option>
                </select>
              </div>
              
              <div class="form-group">
                <label>Lecturer</label>
                <input type="text" v-model="newClass.lecturer" placeholder="Assigned Lecturer" required class="form-input">
              </div>
              
              <div class="form-group">
                <label>Venue</label>
                <input type="text" v-model="newClass.venue" placeholder="Hall/Room" required class="form-input">
              </div>
              
              <div class="form-group">
                <label>Day of Week</label>
                <select v-model="newClass.day" required class="form-select">
                  <option v-for="d in activeDays" :key="d" :value="d">{{ d }}</option>
                </select>
              </div>
              
              <div class="form-group time-group">
                <label>Timing</label>
                <div class="time-inputs">
                  <div class="time-field">
                    <span class="time-label">Start</span>
                    <input type="time" v-model="newClass.startTime" required class="form-input">
                  </div>
                  <div class="time-field">
                    <span class="time-label">End</span>
                    <input type="time" v-model="newClass.endTime" required class="form-input">
                  </div>
                </div>
              </div>
            </div>
            
            <div class="modal-footer">
              <button type="button" class="btn-ghost" @click="closeModal">Cancel</button>
              <button type="submit" class="btn-primary">Save Schedule</button>
            </div>
          </form>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch, onMounted } from 'vue';
import api from '../../api.js';

const levels = ['100', '200', '300', '400'];
const modes = ['Regular', 'Weekend'];
const regularDays = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];
const weekendDays = ['Friday', 'Saturday', 'Sunday'];

const selectedLevel = ref('100');
const selectedMode = ref('Regular');
const selectedSemester = ref('Semester 1');
const selectedDay = ref('Monday');
const isModalOpen = ref(false);

const activeDays = computed(() => selectedMode.value === 'Regular' ? regularDays : weekendDays);

watch(selectedMode, (newMode) => {
  selectedDay.value = newMode === 'Regular' ? 'Monday' : 'Friday';
});

const schedules = ref([]);
const courses = ref([]);

onMounted(async () => {
  await fetchSchedules();
  await fetchCourses();
});

const fetchSchedules = async () => {
  try {
    const res = await api.get('/schedules');
    schedules.value = res.data;
  } catch (error) {
    console.error('Error fetching schedules:', error);
  }
};

const fetchCourses = async () => {
  try {
    const res = await api.get('/courses');
    courses.value = res.data;
  } catch (error) {
    console.error('Error fetching courses:', error);
  }
};

const newClass = ref({
  courseId: '',
  lecturer: '',
  venue: '',
  day: 'Monday',
  startTime: '',
  endTime: ''
});

const filteredClasses = computed(() => {
  return schedules.value.filter(c => 
    c.level === selectedLevel.value && 
    c.mode === selectedMode.value && 
    c.day === selectedDay.value &&
    (selectedSemester.value === 'All' || (c.course?.semester || 'Semester 1') === selectedSemester.value)
  ).map(c => ({
    ...c,
    courseCode: c.course?.code || c.courseCode,
    courseTitle: c.course?.name || c.courseTitle,
    semester: c.course?.semester || 'Semester 1'
  })).sort((a, b) => (a.startTime || '').localeCompare(b.startTime || ''));
});

const getClassCount = (day) => {
  return schedules.value.filter(c => 
    c.level === selectedLevel.value && 
    c.mode === selectedMode.value && 
    c.day === day &&
    (selectedSemester.value === 'All' || (c.course?.semester || 'Semester 1') === selectedSemester.value)
  ).length;
};

const formatTime = (timeStr) => {
  if (!timeStr) return '';
  const [hours, minutes] = timeStr.split(':');
  let h = parseInt(hours, 10);
  const ampm = h >= 12 ? 'PM' : 'AM';
  h = h % 12 || 12;
  return `${h}:${minutes} ${ampm}`;
};

const getDuration = (start, end) => {
  if (!start || !end) return '';
  const startStr = String(start);
  const endStr = String(end);
  const [sH, sM] = startStr.split(':').map(Number);
  const [eH, eM] = endStr.split(':').map(Number);
  const diff = (eH * 60 + (eM || 0)) - (sH * 60 + (sM || 0));
  return (diff / 60).toFixed(1).replace('.0', '');
};

const openAddModal = () => {
  newClass.value = { 
    courseId: '', lecturer: '', venue: '', 
    day: selectedDay.value, startTime: '', endTime: '' 
  };
  isModalOpen.value = true;
};

const closeModal = () => {
  isModalOpen.value = false;
};

const saveClass = async () => {
  try {
    const payload = {
      level: selectedLevel.value,
      mode: selectedMode.value,
      ...newClass.value
    };
    await api.post('/schedules', payload);
    await fetchSchedules();
    closeModal();
  } catch (error) {
    console.error('Error saving schedule:', error);
    alert('Failed to save schedule');
  }
};

const deleteClass = async (id) => {
  // Optional: implement real delete logic if your backend has it. 
  // For now, let's filter it locally or alert if no endpoint exists
  alert('Delete not implemented on backend yet.');
};
</script>

<style scoped>
.schedule-container {
  max-width: 1200px;
  margin: 0 auto;
  display: flex;
  flex-direction: column;
  gap: 24px;
}

/* Header */
.page-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-end;
  background: white;
  padding: 24px 32px;
  border-radius: 16px;
  box-shadow: 0 4px 20px rgba(0,0,0,0.03);
}

.page-title {
  font-size: 1.8rem;
  font-weight: 800;
  color: #0f172a;
  margin: 0 0 8px 0;
  letter-spacing: -0.02em;
}

.page-subtitle {
  color: #64748b;
  margin: 0;
  font-size: 1rem;
}

/* Buttons */
.btn-primary {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  background: linear-gradient(135deg, #6366f1 0%, #4f46e5 100%);
  color: white;
  border: none;
  padding: 12px 24px;
  border-radius: 10px;
  font-weight: 600;
  font-size: 0.95rem;
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  box-shadow: 0 4px 12px rgba(99, 102, 241, 0.25);
}

.btn-primary:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 16px rgba(99, 102, 241, 0.35);
}

.btn-primary .icon {
  width: 20px;
  height: 20px;
}

.btn-outline {
  background: transparent;
  border: 2px solid #e2e8f0;
  color: #475569;
  padding: 10px 20px;
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
  margin-top: 16px;
}

.btn-outline:hover {
  border-color: #6366f1;
  color: #6366f1;
}

.btn-ghost {
  background: transparent;
  border: none;
  color: #64748b;
  padding: 10px 20px;
  border-radius: 8px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-ghost:hover {
  background: #f1f5f9;
  color: #334155;
}

/* Filters */
.filters-panel {
  display: flex;
  gap: 32px;
  background: white;
  padding: 20px 32px;
  border-radius: 16px;
  box-shadow: 0 4px 20px rgba(0,0,0,0.03);
}

.filter-section {
  display: flex;
  align-items: center;
  gap: 16px;
}

.filter-label {
  font-size: 0.85rem;
  font-weight: 700;
  text-transform: uppercase;
  color: #94a3b8;
  letter-spacing: 0.05em;
}

.pill-group {
  display: flex;
  background: #f8fafc;
  padding: 4px;
  border-radius: 10px;
  border: 1px solid #e2e8f0;
}

.filter-pill {
  border: none;
  background: transparent;
  padding: 8px 16px;
  border-radius: 6px;
  font-weight: 600;
  font-size: 0.9rem;
  color: #64748b;
  cursor: pointer;
  transition: all 0.2s;
}

.filter-pill:hover {
  color: #334155;
}

.filter-pill.active {
  background: white;
  color: #0f172a;
  box-shadow: 0 2px 6px rgba(0,0,0,0.05);
}

/* Layout */
.schedule-layout {
  display: flex;
  gap: 24px;
  align-items: flex-start;
}

@media (max-width: 768px) {
  .schedule-layout {
    flex-direction: column;
  }
  .filters-panel {
    flex-direction: column;
    gap: 16px;
  }
  .days-sidebar {
    flex-direction: row;
    overflow-x: auto;
    width: 100%;
    padding-bottom: 8px;
  }
  .day-btn {
    flex-shrink: 0;
  }
}

/* Days Sidebar */
.days-sidebar {
  display: flex;
  flex-direction: column;
  gap: 8px;
  width: 220px;
  flex-shrink: 0;
}

.day-btn {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 14px 20px;
  background: white;
  border: 1px solid transparent;
  border-radius: 12px;
  cursor: pointer;
  transition: all 0.2s;
  box-shadow: 0 2px 10px rgba(0,0,0,0.02);
}

.day-btn .day-name {
  font-weight: 600;
  color: #475569;
  font-size: 1rem;
}

.day-btn .class-count {
  background: #f1f5f9;
  color: #64748b;
  font-size: 0.75rem;
  font-weight: 700;
  padding: 2px 8px;
  border-radius: 20px;
}

.day-btn:hover {
  transform: translateX(4px);
  background: #f8fafc;
}

.day-btn.active {
  background: #6366f1;
  border-color: #6366f1;
  box-shadow: 0 4px 12px rgba(99, 102, 241, 0.2);
}

.day-btn.active .day-name {
  color: white;
}

.day-btn.active .class-count {
  background: rgba(255,255,255,0.2);
  color: white;
}

/* Classes Area */
.classes-area {
  flex: 1;
  min-width: 0;
}

.classes-list {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.class-card {
  display: flex;
  background: white;
  border-radius: 16px;
  padding: 20px;
  box-shadow: 0 4px 15px rgba(0,0,0,0.03);
  transition: transform 0.2s, box-shadow 0.2s;
  border: 1px solid #f1f5f9;
  position: relative;
  overflow: hidden;
}

.class-card::before {
  content: '';
  position: absolute;
  left: 0;
  top: 0;
  bottom: 0;
  width: 4px;
  background: #6366f1;
  border-radius: 4px 0 0 4px;
}

.class-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 25px rgba(0,0,0,0.06);
}

.class-time {
  display: flex;
  flex-direction: column;
  justify-content: center;
  min-width: 140px;
}

.time-block {
  font-weight: 700;
  color: #0f172a;
  font-size: 1.1rem;
}

.duration {
  color: #64748b;
  font-size: 0.85rem;
  font-weight: 500;
  margin-top: 4px;
}

.class-divider {
  width: 1px;
  background: #e2e8f0;
  margin: 0 20px;
}

.class-details {
  flex: 1;
  display: flex;
  flex-direction: column;
  justify-content: center;
}

.course-header {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 8px;
}

.course-code {
  background: #e0e7ff;
  color: #4338ca;
  font-size: 0.75rem;
  font-weight: 700;
  padding: 4px 8px;
  border-radius: 6px;
  letter-spacing: 0.05em;
}

.course-title {
  margin: 0;
  font-size: 1.1rem;
  font-weight: 700;
  color: #1e293b;
}

.semester-tag {
  background: #f1f5f9;
  color: #475569;
  font-size: 0.7rem;
  font-weight: 600;
  padding: 4px 8px;
  border-radius: 6px;
  letter-spacing: 0.05em;
}

.meta-info {
  display: flex;
  align-items: center;
  gap: 12px;
  color: #64748b;
  font-size: 0.9rem;
}

.meta-item {
  display: flex;
  align-items: center;
  gap: 6px;
}

.meta-icon {
  width: 16px;
  height: 16px;
  color: #94a3b8;
}

.meta-separator {
  color: #cbd5e1;
}

.class-actions {
  display: flex;
  gap: 8px;
  align-items: flex-start;
  opacity: 0;
  transition: opacity 0.2s;
}

.class-card:hover .class-actions {
  opacity: 1;
}

.action-btn {
  background: transparent;
  border: none;
  width: 36px;
  height: 36px;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  color: #94a3b8;
  transition: all 0.2s;
}

.action-btn:hover {
  background: #f1f5f9;
  color: #334155;
}

.action-btn.delete:hover {
  background: #fee2e2;
  color: #ef4444;
}

.action-btn svg {
  width: 18px;
  height: 18px;
}

/* Empty State */
.empty-state {
  background: white;
  border-radius: 16px;
  padding: 4rem 2rem;
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  border: 1px dashed #cbd5e1;
}

.empty-icon-wrapper {
  background: #f8fafc;
  width: 80px;
  height: 80px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 20px;
}

.empty-icon {
  width: 40px;
  height: 40px;
  color: #94a3b8;
}

.empty-state h3 {
  margin: 0 0 8px 0;
  font-size: 1.4rem;
  color: #1e293b;
}

.empty-state p {
  color: #64748b;
  margin: 0;
  max-width: 400px;
}

/* Modal */
.modal-backdrop {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(15, 23, 42, 0.5);
  backdrop-filter: blur(4px);
  z-index: 1000;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px;
}

.modal-card {
  background: white;
  border-radius: 20px;
  width: 100%;
  max-width: 600px;
  box-shadow: 0 20px 40px rgba(0,0,0,0.1);
  overflow: hidden;
  animation: modalIn 0.3s cubic-bezier(0.16, 1, 0.3, 1);
}

@keyframes modalIn {
  0% { transform: translateY(20px); opacity: 0; }
  100% { transform: translateY(0); opacity: 1; }
}

.modal-header {
  padding: 24px 32px;
  border-bottom: 1px solid #f1f5f9;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.modal-header h2 {
  margin: 0;
  font-size: 1.4rem;
  color: #0f172a;
}

.close-btn {
  background: #f1f5f9;
  border: none;
  width: 32px;
  height: 32px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #64748b;
  cursor: pointer;
  transition: all 0.2s;
}

.close-btn:hover {
  background: #e2e8f0;
  color: #0f172a;
}

.close-btn svg {
  width: 18px;
  height: 18px;
}

.modal-body {
  padding: 32px;
}

.schedule-form {
  display: flex;
  flex-direction: column;
}

.form-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 24px;
}

.col-span-2 {
  grid-column: span 2;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.form-group label {
  font-size: 0.85rem;
  font-weight: 600;
  color: #475569;
}

.input-group-row {
  display: flex;
  gap: 16px;
}

.flex-1 { flex: 1; }
.flex-2 { flex: 2; }

.form-input, .form-select {
  padding: 12px 16px;
  border: 1px solid #cbd5e1;
  border-radius: 10px;
  font-family: inherit;
  font-size: 0.95rem;
  color: #0f172a;
  outline: none;
  transition: all 0.2s;
  background: #fff;
}

.form-input:focus, .form-select:focus {
  border-color: #6366f1;
  box-shadow: 0 0 0 3px rgba(99, 102, 241, 0.1);
}

.form-input::placeholder {
  color: #94a3b8;
}

.time-group {
  grid-column: span 2;
}

.time-inputs {
  display: flex;
  gap: 16px;
}

.time-field {
  flex: 1;
  display: flex;
  align-items: center;
  gap: 12px;
  background: #f8fafc;
  padding: 8px 16px;
  border-radius: 10px;
  border: 1px solid #e2e8f0;
}

.time-label {
  font-size: 0.9rem;
  font-weight: 500;
  color: #64748b;
  width: 40px;
}

.time-field .form-input {
  flex: 1;
  border: none;
  background: transparent;
  padding: 4px 0;
}

.time-field .form-input:focus {
  box-shadow: none;
}

.time-field:focus-within {
  border-color: #6366f1;
  background: white;
}

.modal-footer {
  margin-top: 32px;
  padding-top: 24px;
  border-top: 1px solid #f1f5f9;
  display: flex;
  justify-content: flex-end;
  gap: 12px;
}
</style>
