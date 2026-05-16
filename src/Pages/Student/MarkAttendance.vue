<template>
  <div class="attendance-container">
    <div class="page-header">
      <div>
        <h1 class="page-title">Mark Attendance</h1>
        <p class="page-subtitle">Verify your presence for active classes securely.</p>
      </div>
      <div class="live-badge">
        <span class="pulse-dot"></span>
        System Live
      </div>
    </div>

    <div class="attendance-content">
      <!-- Left Column: Active Session Entry -->
      <div class="active-session-panel">
        <div class="panel-header">
          <h2>Current Session</h2>
        </div>

        <div class="session-body">
          <!-- Zero state fallback -->
          <div v-if="!activeClass" class="no-session-state">
            <div class="icon-wrap-large">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
                <circle cx="12" cy="12" r="10"></circle>
                <polyline points="12 6 12 12 16 14"></polyline>
              </svg>
            </div>
            <h3>No Active Classes</h3>
            <p>You don't have any classes currently running. Attendance marking is only available during scheduled class times.</p>
            <button class="outline-btn" @click="$emit('navigate', '/student-dashboard')">Return to Dashboard</button>
          </div>

          <!-- Active class UI (Hidden by default for initial zero state) -->
          <div v-else class="active-class-ui">
            <div class="course-banner">
              <span class="course-code">{{ activeClass.code }}</span>
              <h3 class="course-name">{{ activeClass.name }}</h3>
              <p class="course-details">{{ activeClass.lecturer }} • {{ activeClass.room }}</p>
            </div>

            <div class="verification-box">
              <h4>Enter Attendance Code</h4>
              <p>Please enter the 6-digit code provided by your instructor.</p>
              
              <div class="code-inputs">
                <input type="text" maxlength="1" class="pin-box" v-for="(n, idx) in 6" :key="n" v-model="enteredPins[idx]" @input="focusNext(idx)" />
              </div>

              <button class="primary-btn submit-btn" @click="verifyAttendance">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
                  <polyline points="22 4 12 14.01 9 11.01"></polyline>
                </svg>
                Verify Attendance
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- Right Column: Recent History -->
      <div class="history-panel">
        <div class="panel-header">
          <h2>Recent History</h2>
          <button class="text-btn">View Full Log</button>
        </div>

        <div class="history-list">
          <div v-if="attendanceHistory.length === 0" class="empty-history">
            <p>No recent attendance records found.</p>
          </div>

          <div v-else class="history-item" v-for="record in attendanceHistory" :key="record.id">
            <div class="status-icon" :class="record.status">
              <svg v-if="record.status === 'present'" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="20 6 9 17 4 12"></polyline></svg>
              <svg v-else-if="record.status === 'late'" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg>
              <svg v-else viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
            </div>
            <div class="history-details">
              <h4>{{ record.course }}</h4>
              <p>{{ record.date }} • {{ record.time }}</p>
            </div>
            <div class="history-status" :class="record.status">
              {{ record.statusText }}
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue';
import { liveAttendanceSession, systemAuditLogs, currentUserId } from '../../store';

const emit = defineEmits(['navigate']);

const activeClass = computed(() => {
  return liveAttendanceSession.value.isActive ? liveAttendanceSession.value : null;
});

const attendanceHistory = ref([]);
const enteredPins = ref(['', '', '', '', '', '']);

const focusNext = (idx) => {
  if (enteredPins.value[idx] && idx < 5) {
    const inputs = document.querySelectorAll('.pin-box');
    if (inputs[idx + 1]) inputs[idx + 1].focus();
  }
};

const verifyAttendance = () => {
  if (!activeClass.value) return;
  const enteredCode = enteredPins.value.join('');
  
  if (enteredCode !== activeClass.value.pin) {
    alert('Invalid attendance code. Please check and try again.');
    return;
  }
  
  if (activeClass.value.currentStudents >= activeClass.value.maxStudents) {
    alert('Attendance failed: The maximum number of expected students for this class has already been reached. Only students physically present can mark attendance.');
    return;
  }
  
  // Success
  liveAttendanceSession.value.currentStudents++;
  
  attendanceHistory.value.unshift({
    id: Date.now(),
    course: activeClass.value.code + ' - ' + activeClass.value.name,
    date: new Date().toLocaleDateString(),
    time: new Date().toLocaleTimeString(),
    status: 'present',
    statusText: 'Present'
  });
  
  systemAuditLogs.value.unshift({
    id: Date.now() + 1,
    timestamp: new Date().toLocaleTimeString(),
    user: currentUserId.value || 'Student',
    role: 'Student',
    action: 'Student Attendance Marked',
    details: `Successfully marked present for ${activeClass.value.code} via PIN.`
  });
  
  alert('Attendance marked successfully!');
  enteredPins.value = ['', '', '', '', '', ''];
};
</script>

<style scoped>
.attendance-container {
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

.live-badge {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  background-color: #f1f5f9;
  color: #334155;
  padding: 0.5rem 1rem;
  border-radius: 9999px;
  font-size: 0.85rem;
  font-weight: 600;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);
}

.pulse-dot {
  width: 8px;
  height: 8px;
  background-color: #10b981;
  border-radius: 50%;
  animation: pulse 2s infinite;
}

@keyframes pulse {
  0% { transform: scale(0.95); box-shadow: 0 0 0 0 rgba(16, 185, 129, 0.7); }
  70% { transform: scale(1); box-shadow: 0 0 0 4px rgba(16, 185, 129, 0); }
  100% { transform: scale(0.95); box-shadow: 0 0 0 0 rgba(16, 185, 129, 0); }
}

/* Content Layout */
.attendance-content {
  display: grid;
  grid-template-columns: 3fr 2fr;
  gap: 1.5rem;
}

.active-session-panel,
.history-panel {
  background-color: #ffffff;
  border-radius: 16px;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05), 0 2px 4px -1px rgba(0, 0, 0, 0.03);
  border: 1px solid rgba(226, 232, 240, 0.8);
  display: flex;
  flex-direction: column;
}

.panel-header {
  padding: 1.5rem;
  border-bottom: 1px solid #f1f5f9;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.panel-header h2 {
  margin: 0;
  font-size: 1.25rem;
  font-weight: 600;
  color: #0f172a;
}

.text-btn {
  background: none;
  border: none;
  color: #6366f1;
  font-size: 0.85rem;
  font-weight: 600;
  cursor: pointer;
}

.text-btn:hover {
  color: #4f46e5;
  text-decoration: underline;
}

/* Zero State */
.session-body {
  padding: 2rem;
  flex: 1;
  display: flex;
  flex-direction: column;
}

.no-session-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  text-align: center;
  padding: 3rem 1rem;
  background-color: #f8fafc;
  border-radius: 12px;
  border: 1px dashed #cbd5e1;
  height: 100%;
}

.icon-wrap-large {
  width: 64px;
  height: 64px;
  background-color: #ffffff;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #94a3b8;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);
  margin-bottom: 1.5rem;
}

.icon-wrap-large svg {
  width: 32px;
  height: 32px;
}

.no-session-state h3 {
  margin: 0 0 0.5rem 0;
  color: #1e293b;
  font-size: 1.25rem;
}

.no-session-state p {
  color: #64748b;
  margin: 0 0 2rem 0;
  max-width: 300px;
  line-height: 1.5;
}

.outline-btn {
  background-color: transparent;
  color: #0f172a;
  border: 1px solid #cbd5e1;
  padding: 0.75rem 1.5rem;
  border-radius: 8px;
  font-size: 0.9rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
}

.outline-btn:hover {
  background-color: #f1f5f9;
  border-color: #94a3b8;
}

/* Active Class UI Placeholder */
.active-class-ui {
  display: flex;
  flex-direction: column;
  align-items: stretch;
  gap: 2rem;
}

.course-banner {
  background: linear-gradient(135deg, #4f46e5 0%, #6366f1 100%);
  border-radius: 12px;
  padding: 1.5rem;
  color: white;
}

.course-banner .course-code {
  background-color: rgba(255, 255, 255, 0.2);
  padding: 0.25rem 0.75rem;
  border-radius: 6px;
  font-size: 0.8rem;
  font-weight: 600;
  display: inline-block;
  margin-bottom: 0.5rem;
}

.course-banner .course-name {
  margin: 0 0 0.5rem 0;
  font-size: 1.25rem;
  font-weight: 600;
}

.course-banner .course-details {
  margin: 0;
  font-size: 0.9rem;
  opacity: 0.9;
}

.verification-box {
  background-color: #f8fafc;
  border-radius: 12px;
  padding: 2rem 1.5rem;
  text-align: center;
  border: 1px solid #e2e8f0;
}

.verification-box h4 {
  margin: 0 0 0.5rem 0;
  font-size: 1.15rem;
  color: #0f172a;
}

.verification-box p {
  margin: 0 0 1.5rem 0;
  color: #64748b;
  font-size: 0.9rem;
}

.code-inputs {
  display: flex;
  justify-content: center;
  gap: 0.5rem;
  margin-bottom: 2rem;
}

.pin-box {
  width: 48px;
  height: 56px;
  font-size: 1.5rem;
  font-weight: 700;
  text-align: center;
  border-radius: 8px;
  border: 2px solid #cbd5e1;
  background-color: #ffffff;
  color: #0f172a;
  outline: none;
  transition: border-color 0.2s;
}

.pin-box:focus {
  border-color: #6366f1;
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
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  transition: background-color 0.2s;
}

.primary-btn svg {
  width: 20px;
  height: 20px;
}

.primary-btn:hover {
  background-color: #4338ca;
}

/* History Detail */
.history-list {
  padding: 1.5rem;
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.empty-history {
  text-align: center;
  color: #94a3b8;
  font-size: 0.9rem;
  padding: 2rem 0;
  font-style: italic;
}

.history-item {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 1rem;
  background-color: #f8fafc;
  border-radius: 10px;
  border: 1px solid #f1f5f9;
}

.status-icon {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.status-icon.present { background-color: #dcfce7; color: #10b981; }
.status-icon.late { background-color: #fef3c7; color: #f59e0b; }
.status-icon.absent { background-color: #fee2e2; color: #ef4444; }

.status-icon svg {
  width: 18px;
  height: 18px;
}

.history-details {
  flex: 1;
}

.history-details h4 {
  margin: 0 0 0.25rem 0;
  font-size: 0.95rem;
  color: #1e293b;
}

.history-details p {
  margin: 0;
  font-size: 0.8rem;
  color: #64748b;
}

.history-status {
  font-size: 0.8rem;
  font-weight: 600;
  text-transform: uppercase;
}

.history-status.present { color: #10b981; }
.history-status.late { color: #f59e0b; }
.history-status.absent { color: #ef4444; }

/* Responsiveness */
@media (max-width: 1024px) {
  .attendance-content {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 768px) {
  .page-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 1rem;
  }
  
  .code-inputs {
    flex-wrap: wrap;
  }
}
</style>
