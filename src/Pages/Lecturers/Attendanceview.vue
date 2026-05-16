<template>
  <div class="attendance-container">
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
          <p class="page-subtitle">CSC 101 - Introduction to Computer Science</p>
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
</template>

<script setup>
import { ref, watch } from 'vue';
import { liveAttendanceSession, systemAuditLogs } from '../../store';

const emit = defineEmits(['navigate']);

const lecturerStatus = ref(null);

const enrolledStudents = ref([
  { id: 1, name: 'Alice Akua', studentId: 'STD-001' },
  { id: 2, name: 'Ben Osei', studentId: 'STD-002' },
  { id: 3, name: 'Charles Mensah', studentId: 'STD-003' },
  { id: 4, name: 'Diana Amoah', studentId: 'STD-004' },
  { id: 5, name: 'Evans Appiah', studentId: 'STD-005' },
  { id: 6, name: 'Francis Nugboryor', studentId: 'STD-006' },
  { id: 7, name: 'George Adjei', studentId: 'STD-007' },
  { id: 8, name: 'Hannah Adjetey', studentId: 'STD-008' },
]);

const selectedStudents = ref([]);

const toggleSelectAll = () => {
  if (selectedStudents.value.length === enrolledStudents.value.length) {
    selectedStudents.value = [];
  } else {
    selectedStudents.value = enrolledStudents.value.map(s => s.id);
  }
};

const startLiveSession = () => {
  const code = Math.floor(100000 + Math.random() * 900000).toString();
  liveAttendanceSession.value = {
    isActive: true,
    code: 'CSC 101',
    name: 'Introduction to Computer Science',
    lecturer: 'Dr. Kwame Nkrumah',
    room: 'Hall A',
    pin: code,
    maxStudents: selectedStudents.value.length,
    selectedStudents: selectedStudents.value,
    currentStudents: 0
  };
  
  // Provide feedback that the code was sent
  alert(`Attendance code ${code} has been generated and sent to ${selectedStudents.value.length} selected student(s).`);

  systemAuditLogs.value.unshift({
    id: Date.now(),
    timestamp: new Date().toLocaleTimeString(),
    user: 'Dr. Kwame Nkrumah',
    role: 'Lecturer',
    action: 'Live Session Started',
    details: `Started live session for CSC 101 with ${selectedStudents.value.length} expected students.`
  });
};

const stopLiveSession = () => {
  liveAttendanceSession.value.isActive = false;
  lecturerStatus.value = null;

  systemAuditLogs.value.unshift({
    id: Date.now(),
    timestamp: new Date().toLocaleTimeString(),
    user: 'Dr. Kwame Nkrumah',
    role: 'Lecturer',
    action: 'Live Session Ended',
    details: 'Ended live session for CSC 101.'
  });
};

// Log lecturer self-attendance using a watcher
watch(lecturerStatus, (newVal) => {
  if (newVal) {
    systemAuditLogs.value.unshift({
      id: Date.now(),
      timestamp: new Date().toLocaleTimeString(),
      user: 'Dr. Kwame Nkrumah',
      role: 'Lecturer',
      action: 'Lecturer Attendance Marked',
      details: `Marked self as ${newVal} for CSC 101 session.`
    });
  }
});
</script>

<style scoped>
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
</style>
