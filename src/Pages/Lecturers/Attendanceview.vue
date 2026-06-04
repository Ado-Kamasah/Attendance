<template>
  <div class="attendance-container">
    <div v-if="!courseId" class="empty-course-state">
      <div class="empty-icon-wrap">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
          <path d="M13 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V9z"></path>
          <polyline points="13 2 13 9 20 9"></polyline>
        </svg>
      </div>
      <h2>No Course Selected</h2>
      <p>Please select a course from the "My Courses" page to manage its attendance.</p>
      <button class="primary-btn" @click="$emit('navigate', '/lecturer-courses')">Go to My Courses</button>
    </div>
    
    <div v-else class="attendance-content-wrapper">
      <div class="page-header">
      <div class="header-left">
        <button class="back-btn" @click="$emit('navigate', '/lecturer-courses')">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <line x1="19" y1="12" x2="5" y2="12"></line>
            <polyline points="12 19 5 12 12 5"></polyline>
          </svg>
          Back to Courses
        </button>
        <div class="title-wrap">
          <h1 class="page-title">Live Attendance Management</h1>
          <p class="page-subtitle">{{ courseCode }} - {{ courseName }}</p>
        </div>
      </div>
    </div>

    <!-- Live Session Management -->
    <div class="live-session-panel">
      <div class="panel-header">
        <h2 style="display: flex; align-items: center; gap: 0.5rem;">
          Live Attendance Session
          <span class="pulse-dot" v-if="liveAttendanceSession.isActive"></span>
        </h2>
      </div>
      
      <div class="live-session-content" v-if="!liveAttendanceSession.isActive">
        <p>Select the students who are physically present in the class. The attendance code will only be valid for these selected students.</p>
        
        <div class="student-selection-list">
          <div class="list-header">
            <h3>Class List ({{ selectedStudents.length }} / {{ enrolledStudents.length }} Selected)</h3>
            <button class="action-btn outline-btn btn-sm" @click="toggleSelectAll">
              {{ selectedStudents.length === enrolledStudents.length ? 'Deselect All' : 'Select All' }}
            </button>
          </div>
          <div class="students-grid">
            <label v-for="student in enrolledStudents" :key="student.id" class="student-checkbox-card" :class="{ 'selected': selectedStudents.includes(student.id) }">
              <input type="checkbox" :value="student.id" v-model="selectedStudents" />
              <div class="student-info">
                <div class="student-avatar">{{ student.name.charAt(0) }}</div>
                <div class="student-details">
                  <span class="student-name">{{ student.name }}</span>
                  <span class="student-id">{{ student.studentId }}</span>
                </div>
              </div>
            </label>
          </div>
        </div>

        <div class="start-session-controls">
          <button class="primary-btn" @click="startLiveSession" :disabled="selectedStudents.length === 0">
            Generate & Send Attendance Code
          </button>
        </div>
      </div>
      
      <div class="live-session-active" v-else>
        <div class="active-details">
          <div class="pin-display">
            <span>Class PIN:</span>
            <h1>{{ liveAttendanceSession.pin }}</h1>
            <div class="timer-display" :class="{'timer-warning': timeLeft <= 15}">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="timer-icon"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg>
              Time Remaining: <strong>{{ timeLeft }}s</strong>
            </div>
          </div>
          <div class="student-count">
            <div class="count-circle">
              <strong>{{ liveAttendanceSession.currentStudents }}</strong>
              <span>/ {{ liveAttendanceSession.maxStudents }}</span>
            </div>
            <p>Students Checked In</p>
          </div>
        </div>
        <div class="active-actions">
           <button class="extend-btn" @click="extendTimer(15)">+15s Extension</button>
           <button class="danger-btn" @click="stopLiveSession">End Live Session</button>
        </div>
      </div>
    </div>

    <!-- Lecturer Attendance Panel -->
    <div class="lecturer-attendance-panel" v-if="liveAttendanceSession.isActive">
      <div class="panel-header">
        <h2>My Attendance</h2>
      </div>
      <div class="panel-body">
        <p>Record your own attendance for this session.</p>
        <div class="status-toggles">
          <label class="toggle-option present">
            <input type="radio" name="lecturerStatus" value="present" v-model="lecturerStatus">
            <span class="toggle-btn">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="20 6 9 17 4 12"></polyline></svg>
              Present
            </span>
          </label>
          
          <label class="toggle-option absent">
            <input type="radio" name="lecturerStatus" value="absent" v-model="lecturerStatus">
            <span class="toggle-btn">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
              Absent
            </span>
          </label>
        </div>
        <div v-if="lecturerStatus" class="attendance-confirmation">
          Status saved: <strong>{{ lecturerStatus.charAt(0).toUpperCase() + lecturerStatus.slice(1) }}</strong>
        </div>
      </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, watch, onMounted, onUnmounted } from 'vue';
import api from '../../api.js';

const emit = defineEmits(['navigate']);

const courseId = ref(localStorage.getItem('activeCourseId') || '');
const courseCode = ref(localStorage.getItem('activeCourseCode') || 'Unknown Code');
const courseName = ref(localStorage.getItem('activeCourseName') || 'Unknown Course');

const lecturerStatus = ref(null);
const enrolledStudents = ref([]);
const selectedStudents = ref([]);
const liveAttendanceSession = ref({ isActive: false });
const timeLeft = ref(60);
let timerInterval = null;

onMounted(async () => {
  if (courseId.value) {
    try {
      const response = await api.get(`/courses/${courseId.value}/students`);
      enrolledStudents.value = response.data;
    } catch (error) {
      console.error('Error fetching enrolled students:', error);
    }
  }
});

const toggleSelectAll = () => {
  if (selectedStudents.value.length === enrolledStudents.value.length) {
    selectedStudents.value = [];
  } else {
    selectedStudents.value = enrolledStudents.value.map(s => s.id);
  }
};

const startLiveSession = async () => {
  try {
    const response = await api.post('/sessions/start', {
      courseId: courseId.value,
      maxStudents: selectedStudents.value.length
    });
    
    liveAttendanceSession.value = {
      id: response.data.session.id,
      isActive: true,
      pin: response.data.session.pin,
      maxStudents: selectedStudents.value.length,
      currentStudents: 0
    };
    
    // Start the 60-second timer
    timeLeft.value = 60;
    if (timerInterval) clearInterval(timerInterval);
    timerInterval = setInterval(() => {
      if (timeLeft.value > 0) {
        timeLeft.value--;
      }
      if (timeLeft.value === 0) {
        stopLiveSession();
      }
    }, 1000);
    
    alert(`Attendance session started! PIN is ${response.data.session.pin}. It will automatically close in 60 seconds.`);
  } catch (error) {
    console.error('Failed to start session', error);
    alert(error.response?.data?.message || 'Failed to start session');
  }
};

const stopLiveSession = async () => {
  try {
    if (timerInterval) {
      clearInterval(timerInterval);
      timerInterval = null;
    }
    if (liveAttendanceSession.value.id) {
      await api.post(`/sessions/${liveAttendanceSession.value.id}/end`);
    }
    liveAttendanceSession.value = { isActive: false };
    lecturerStatus.value = null;
    alert('Session ended successfully');
  } catch (error) {
    console.error('Failed to end session', error);
  }
};

const extendTimer = (seconds) => {
  if (liveAttendanceSession.value.isActive) {
    timeLeft.value += seconds;
  }
};

// Log lecturer self-attendance using a watcher
watch(lecturerStatus, (newVal) => {
  if (newVal) {
    console.log(`Lecturer marked as ${newVal}`);
    // Optional: Send this to backend
  }
});

onUnmounted(() => {
  if (timerInterval) clearInterval(timerInterval);
});
</script>

<style scoped>
.empty-course-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 6rem 2rem;
  background: white;
  border-radius: 16px;
  border: 1px dashed #cbd5e1;
  text-align: center;
}
.empty-course-state h2 {
  margin: 1rem 0 0.5rem 0;
  color: #0f172a;
}
.empty-course-state p {
  color: #64748b;
  margin-bottom: 2rem;
}
.empty-icon-wrap {
  width: 80px;
  height: 80px;
  background: #f8fafc;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #94a3b8;
}
.empty-icon-wrap svg {
  width: 40px;
  height: 40px;
}
.attendance-content-wrapper {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
  width: 100%;
}

.attendance-container {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
  width: 100%;
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-end;
  border-bottom: 1px solid #e2e8f0;
  padding-bottom: 1.5rem;
}

.header-left {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.back-btn {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  background: none;
  border: none;
  color: #64748b;
  font-weight: 600;
  font-size: 0.9rem;
  cursor: pointer;
  padding: 0;
  transition: color 0.2s;
  align-self: flex-start;
}

.back-btn:hover {
  color: #0f172a;
}

.back-btn svg {
  width: 16px;
  height: 16px;
}

.title-wrap {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.page-title {
  margin: 0;
  font-size: 1.85rem;
  font-weight: 800;
  color: #0f172a;
  letter-spacing: -0.025em;
}

.page-subtitle {
  margin: 0;
  font-size: 1rem;
  color: #6366f1;
  font-weight: 600;
}

/* Live Session Panel */
.live-session-panel, .lecturer-attendance-panel {
  background-color: #ffffff;
  border-radius: 16px;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05);
  border: 1px solid #e2e8f0;
  padding: 1.5rem;
}

.panel-header {
  border-bottom: 1px solid #f1f5f9;
  padding-bottom: 1rem;
  margin-bottom: 1.5rem;
}

.panel-header h2 {
  margin: 0;
  font-size: 1.25rem;
  font-weight: 600;
  color: #0f172a;
}

.live-session-content {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.live-session-content p {
  margin: 0;
  color: #64748b;
  font-size: 0.95rem;
}

.start-session-controls {
  display: flex;
  justify-content: flex-end;
  margin-top: 1rem;
}

.primary-btn {
  background: #10b981;
  color: white;
  border: none;
  padding: 0.75rem 1.5rem;
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;
  height: 42px;
  transition: background 0.2s;
}

.primary-btn:hover:not(:disabled) {
  background: #059669;
}

.primary-btn:disabled {
  background: #cbd5e1;
  cursor: not-allowed;
}

/* Student Selection List */
.student-selection-list {
  background: #f8fafc;
  border: 1px solid #e2e8f0;
  border-radius: 12px;
  padding: 1.25rem;
  margin-top: 1rem;
}

.list-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
}

.list-header h3 {
  margin: 0;
  font-size: 1.1rem;
  color: #1e293b;
}

.btn-sm {
  padding: 0.4rem 0.8rem;
  font-size: 0.85rem;
  border-radius: 6px;
  cursor: pointer;
  background-color: transparent;
  color: #475569;
  border: 1px solid #cbd5e1;
  transition: all 0.2s;
}

.btn-sm:hover {
  background-color: #f1f5f9;
  color: #0f172a;
}

.students-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: 1rem;
  max-height: 300px;
  overflow-y: auto;
  padding-right: 0.5rem;
}

.students-grid::-webkit-scrollbar {
  width: 6px;
}
.students-grid::-webkit-scrollbar-track {
  background: #f1f5f9; 
  border-radius: 10px;
}
.students-grid::-webkit-scrollbar-thumb {
  background: #cbd5e1; 
  border-radius: 10px;
}
.students-grid::-webkit-scrollbar-thumb:hover {
  background: #94a3b8; 
}

.student-checkbox-card {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 0.75rem;
  background: white;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s;
}

.student-checkbox-card:hover {
  border-color: #cbd5e1;
  box-shadow: 0 2px 4px rgba(0,0,0,0.02);
}

.student-checkbox-card.selected {
  border-color: #10b981;
  background-color: #ecfdf5;
}

.student-checkbox-card input[type="checkbox"] {
  width: 18px;
  height: 18px;
  cursor: pointer;
  accent-color: #10b981;
}

.student-info {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.student-avatar {
  width: 32px;
  height: 32px;
  background-color: #e0e7ff;
  color: #4f46e5;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 700;
  font-size: 0.9rem;
}

.student-details {
  display: flex;
  flex-direction: column;
}

.student-name {
  font-size: 0.9rem;
  font-weight: 600;
  color: #1e293b;
}

.student-id {
  font-size: 0.75rem;
  color: #64748b;
}

.pulse-dot {
  width: 10px;
  height: 10px;
  background-color: #ef4444;
  border-radius: 50%;
  animation: pulse-red 2s infinite;
}

@keyframes pulse-red {
  0% { transform: scale(0.95); box-shadow: 0 0 0 0 rgba(239, 68, 68, 0.7); }
  70% { transform: scale(1); box-shadow: 0 0 0 6px rgba(239, 68, 68, 0); }
  100% { transform: scale(0.95); box-shadow: 0 0 0 0 rgba(239, 68, 68, 0); }
}

.live-session-active {
  display: flex;
  justify-content: space-between;
  align-items: center;
  background: #f8fafc;
  padding: 1.5rem;
  border-radius: 12px;
  border: 1px solid #e2e8f0;
}

.active-details {
  display: flex;
  align-items: center;
  gap: 3rem;
}

.pin-display span {
  font-size: 0.85rem;
  color: #64748b;
  font-weight: 600;
  text-transform: uppercase;
}

.pin-display h1 {
  margin: 0;
  font-size: 2.5rem;
  letter-spacing: 0.2em;
  color: #0f172a;
}

.timer-display {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-top: 0.75rem;
  padding: 0.5rem 1rem;
  background: #f1f5f9;
  border-radius: 8px;
  color: #475569;
  font-size: 0.95rem;
}

.timer-icon {
  width: 18px;
  height: 18px;
}

.timer-warning {
  background: #fef2f2;
  color: #ef4444;
}

.timer-warning strong {
  color: #b91c1c;
}

.student-count {
  text-align: center;
}

.count-circle {
  font-size: 1.5rem;
  color: #0f172a;
}

.count-circle strong {
  font-size: 2rem;
  color: #10b981;
}

.student-count p {
  margin: 0;
  font-size: 0.85rem;
  color: #64748b;
  font-weight: 600;
}

.active-actions {
  display: flex;
  gap: 1rem;
  align-items: center;
}

.danger-btn {
  background: #ef4444;
  color: white;
  border: none;
  padding: 0.75rem 1.5rem;
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;
  transition: background 0.2s;
}

.danger-btn:hover {
  background: #dc2626;
}

.extend-btn {
  background: transparent;
  color: #4f46e5;
  border: 1px solid #6366f1;
  padding: 0.75rem 1.5rem;
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
}

.extend-btn:hover {
  background: #e0e7ff;
}

/* Status Toggles for Lecturer Attendance */
.panel-body p {
  color: #64748b;
  margin: 0 0 1rem 0;
}

.status-toggles {
  display: flex;
  gap: 1rem;
  max-width: 300px;
}

.toggle-option {
  flex: 1;
  cursor: pointer;
}

.toggle-option input {
  display: none;
}

.toggle-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  padding: 0.75rem 0.5rem;
  border-radius: 8px;
  border: 1px solid #e2e8f0;
  background-color: #ffffff;
  color: #64748b;
  font-size: 0.9rem;
  font-weight: 600;
  transition: all 0.2s;
  text-align: center;
}

.toggle-btn svg {
  width: 18px;
  height: 18px;
}

.toggle-option.present input:checked + .toggle-btn {
  background-color: #ecfdf5;
  border-color: #10b981;
  color: #047857;
  box-shadow: 0 2px 4px rgba(16, 185, 129, 0.1);
}

.toggle-option.absent input:checked + .toggle-btn {
  background-color: #fef2f2;
  border-color: #ef4444;
  color: #b91c1c;
  box-shadow: 0 2px 4px rgba(239, 68, 68, 0.1);
}

.attendance-confirmation {
  margin-top: 1rem;
  padding: 0.75rem;
  background-color: #f8fafc;
  border-left: 4px solid #6366f1;
  border-radius: 4px;
  color: #334155;
  font-size: 0.95rem;
}

.attendance-confirmation strong {
  color: #0f172a;
}

@media (max-width: 768px) {
  .page-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 1rem;
  }
  
  .header-actions {
    width: 100%;
    flex-wrap: wrap;
  }
  
  .live-session-active {
    flex-direction: column;
    align-items: stretch;
    gap: 1.5rem;
  }
  
  .active-details {
    flex-direction: column;
    align-items: flex-start;
    gap: 1.5rem;
    width: 100%;
  }
  
  .pin-display h1 {
    font-size: 2rem;
  }
  
  .students-grid {
    grid-template-columns: 1fr;
  }
  
  .status-toggles {
    flex-direction: column;
    max-width: 100%;
  }
  
  .active-actions {
    flex-direction: column;
    width: 100%;
  }
  
  .extend-btn, .danger-btn {
    width: 100%;
    text-align: center;
  }
}
</style>
