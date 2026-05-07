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
          <h1 class="page-title">Record Attendance</h1>
          <p class="page-subtitle">CSC 101 - Introduction to Computer Science</p>
        </div>
      </div>
      <div class="header-right">
        <div class="completion-badge" :class="{ 'complete': totalStudents === markedStudents }">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <polyline points="20 6 9 17 4 12"></polyline>
          </svg>
          {{ markedStudents }} / {{ totalStudents }} Marked
        </div>
      </div>
    </div>

    <!-- Controls Panel -->
    <div class="control-panel">
      <div class="date-selector">
        <label>Attendance Date</label>
        <input type="date" v-model="attendanceDate" class="modern-input" />
      </div>

      <div class="search-student">
        <label>Search Roster</label>
        <div class="search-input-wrap">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <circle cx="11" cy="11" r="8"></circle>
            <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
          </svg>
          <input type="text" v-model="searchQuery" placeholder="Search by name or ID..." class="modern-input" />
        </div>
      </div>

      <div class="bulk-actions">
        <label>Bulk Actions</label>
        <div class="action-buttons">
          <button class="bulk-btn present" @click="markAll('present')">All Present</button>
          <button class="bulk-btn absent" @click="markAll('absent')">All Absent</button>
          <button class="bulk-btn reset" @click="markAll(null)">Reset</button>
        </div>
      </div>
    </div>

    <!-- Roster Board -->
    <div class="roster-board">
      <div class="roster-header">
        <div class="col-student">Student Information</div>
        <div class="col-status">Attendance Status</div>
        <div class="col-notes">Private Notes</div>
      </div>

      <div class="roster-list">
        <div v-if="filteredStudents.length === 0" class="empty-search">
          <p>No students match your search.</p>
        </div>

        <div class="student-row" v-for="student in filteredStudents" :key="student.id">
          
          <div class="col-student">
            <div class="student-avatar" :style="{ backgroundColor: getBgColor(student.name) }">
              {{ getInitials(student.name) }}
            </div>
            <div class="student-details">
              <h4>{{ student.name }}</h4>
              <span>ID: {{ student.id }}</span>
            </div>
          </div>
          
          <div class="col-status">
            <div class="status-toggles">
              <label class="toggle-option present">
                <input type="radio" :name="'status-'+student.id" value="present" v-model="student.status">
                <span class="toggle-btn">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="20 6 9 17 4 12"></polyline></svg>
                  Present
                </span>
              </label>
              
              <label class="toggle-option late">
                <input type="radio" :name="'status-'+student.id" value="late" v-model="student.status">
                <span class="toggle-btn">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg>
                  Late
                </span>
              </label>
              
              <label class="toggle-option absent">
                <input type="radio" :name="'status-'+student.id" value="absent" v-model="student.status">
                <span class="toggle-btn">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
                  Absent
                </span>
              </label>
            </div>
          </div>
          
          <div class="col-notes">
            <input type="text" v-model="student.notes" placeholder="Add note (optional)..." class="note-input" />
          </div>
        </div>
      </div>
    </div>

    <!-- Final Submission Footer -->
    <div class="submission-footer" :class="{ 'floating': isScrolled }">
      <div class="footer-stats">
        <div class="stat"><strong>{{ stats.present }}</strong> Present</div>
        <div class="stat"><strong>{{ stats.late }}</strong> Late</div>
        <div class="stat"><strong>{{ stats.absent }}</strong> Absent</div>
      </div>
      <div class="footer-actions">
        <button class="export-btn">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="7 10 12 15 17 10"></polyline><line x1="12" y1="15" x2="12" y2="3"></line></svg>
          Export CSV
        </button>
        <button class="save-btn" :disabled="markedStudents === 0" @click="saveAttendance">
          Complete & Save Records
        </button>
      </div>
    </div>

  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue';

const emit = defineEmits(['navigate']);

const attendanceDate = ref(new Date().toISOString().split('T')[0]);
const searchQuery = ref('');
const isScrolled = ref(false);

const checkScroll = () => {
  isScrolled.value = window.scrollY > 50;
};

onMounted(() => {
  window.addEventListener('scroll', checkScroll);
});

onUnmounted(() => {
  window.removeEventListener('scroll', checkScroll);
});

// Mock Students
const roster = ref([
  { id: '1001', name: 'John Doe', status: null, notes: '' },
  { id: '1002', name: 'Jane Smith', status: null, notes: '' },
  { id: '1003', name: 'Michael Johnson', status: null, notes: '' },
  { id: '1004', name: 'Emily Davis', status: null, notes: '' },
  { id: '1005', name: 'William Brown', status: null, notes: '' },
  { id: '1006', name: 'Jessica Wilson', status: null, notes: '' },
  { id: '1007', name: 'David Taylor', status: null, notes: '' }
]);

const getInitials = (name) => {
  return name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();
};

const getBgColor = (name) => {
  const colors = ['#eff6ff', '#f0fdf4', '#fdf2f8', '#fffbeb', '#f3e8ff'];
  const charSum = name.split('').reduce((sum, char) => sum + char.charCodeAt(0), 0);
  return colors[charSum % colors.length];
};

const filteredStudents = computed(() => {
  if (!searchQuery.value) return roster.value;
  return roster.value.filter(s => 
    s.name.toLowerCase().includes(searchQuery.value.toLowerCase()) || 
    s.id.includes(searchQuery.value)
  );
});

const totalStudents = computed(() => roster.value.length);
const markedStudents = computed(() => roster.value.filter(s => s.status !== null).length);

const stats = computed(() => {
  return {
    present: roster.value.filter(s => s.status === 'present').length,
    late: roster.value.filter(s => s.status === 'late').length,
    absent: roster.value.filter(s => s.status === 'absent').length,
  };
});

const markAll = (status) => {
  roster.value.forEach(student => {
    student.status = status;
  });
};

const saveAttendance = () => {
  alert(`Attendance successfully saved for ${markedStudents.value} students!`);
};
</script>

<style scoped>
.attendance-container {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
  width: 100%;
  padding-bottom: 80px; /* Space for the floating footer */
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

.completion-badge {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  background-color: #f1f5f9;
  color: #475569;
  padding: 0.75rem 1.25rem;
  border-radius: 999px;
  font-size: 0.95rem;
  font-weight: 700;
  border: 1px solid #e2e8f0;
  transition: all 0.3s ease;
}

.completion-badge.complete {
  background-color: #dcfce7;
  color: #166534;
  border-color: #bbf7d0;
}

.completion-badge svg {
  width: 18px;
  height: 18px;
}

/* Control Panel */
.control-panel {
  display: grid;
  grid-template-columns: auto 1fr auto;
  gap: 2rem;
  background-color: #ffffff;
  padding: 1.5rem;
  border-radius: 16px;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05);
  border: 1px solid #e2e8f0;
}

.control-panel label {
  display: block;
  font-size: 0.8rem;
  font-weight: 600;
  color: #64748b;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  margin-bottom: 0.5rem;
}

.modern-input {
  width: 100%;
  padding: 0.75rem 1rem;
  border: 1px solid #cbd5e1;
  border-radius: 8px;
  background-color: #f8fafc;
  font-size: 0.95rem;
  color: #0f172a;
  outline: none;
  transition: all 0.2s;
  font-family: inherit;
}

.modern-input:focus {
  background-color: #ffffff;
  border-color: #6366f1;
  box-shadow: 0 0 0 3px rgba(99, 102, 241, 0.1);
}

.date-selector .modern-input {
  min-width: 180px;
}

.search-input-wrap {
  position: relative;
}

.search-input-wrap svg {
  position: absolute;
  left: 12px;
  top: 50%;
  transform: translateY(-50%);
  width: 18px;
  height: 18px;
  color: #94a3b8;
}

.search-input-wrap input {
  padding-left: 2.5rem;
}

.action-buttons {
  display: flex;
  gap: 0.75rem;
}

.bulk-btn {
  padding: 0.75rem 1rem;
  border-radius: 8px;
  font-size: 0.9rem;
  font-weight: 600;
  cursor: pointer;
  border: 1px solid transparent;
  transition: all 0.2s;
  background: #f1f5f9;
  color: #475569;
}

.bulk-btn.present:hover {
  background: #dcfce7;
  color: #166534;
  border-color: #bbf7d0;
}

.bulk-btn.absent:hover {
  background: #fee2e2;
  color: #991b1b;
  border-color: #fecaca;
}

.bulk-btn.reset:hover {
  background: #e2e8f0;
  color: #1e293b;
}

/* Roster Board */
.roster-board {
  background-color: #ffffff;
  border-radius: 16px;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05);
  border: 1px solid #e2e8f0;
  overflow: hidden;
}

.roster-header {
  display: grid;
  grid-template-columns: 2fr 3fr 2fr;
  gap: 1.5rem;
  padding: 1.25rem 1.5rem;
  background-color: #f8fafc;
  border-bottom: 1px solid #e2e8f0;
  font-size: 0.85rem;
  font-weight: 700;
  color: #475569;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.roster-list {
  display: flex;
  flex-direction: column;
}

.student-row {
  display: grid;
  grid-template-columns: 2fr 3fr 2fr;
  gap: 1.5rem;
  padding: 1.25rem 1.5rem;
  border-bottom: 1px solid #f1f5f9;
  align-items: center;
  transition: background-color 0.2s;
}

.student-row:hover {
  background-color: #f8fafc;
}

.student-row:last-child {
  border-bottom: none;
}

.empty-search {
  padding: 3rem;
  text-align: center;
  color: #64748b;
  font-style: italic;
}

.col-student {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.student-avatar {
  width: 44px;
  height: 44px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 700;
  font-size: 1rem;
  color: #0f172a;
}

.student-details h4 {
  margin: 0 0 0.25rem 0;
  font-size: 1rem;
  font-weight: 600;
  color: #1e293b;
}

.student-details span {
  font-size: 0.8rem;
  color: #64748b;
  font-weight: 500;
}

/* Status Toggles */
.status-toggles {
  display: flex;
  gap: 0.5rem;
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
  font-size: 0.85rem;
  font-weight: 600;
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
  text-align: center;
}

.toggle-btn svg {
  width: 16px;
  height: 16px;
}

/* Active States */
.toggle-option.present input:checked + .toggle-btn {
  background-color: #ecfdf5;
  border-color: #10b981;
  color: #047857;
  box-shadow: 0 2px 4px rgba(16, 185, 129, 0.1);
}

.toggle-option.late input:checked + .toggle-btn {
  background-color: #fffbeb;
  border-color: #f59e0b;
  color: #b45309;
  box-shadow: 0 2px 4px rgba(245, 158, 11, 0.1);
}

.toggle-option.absent input:checked + .toggle-btn {
  background-color: #fef2f2;
  border-color: #ef4444;
  color: #b91c1c;
  box-shadow: 0 2px 4px rgba(239, 68, 68, 0.1);
}

/* Notes Column */
.note-input {
  width: 100%;
  padding: 0.75rem 1rem;
  border: 1px solid transparent;
  border-radius: 8px;
  background-color: transparent;
  font-size: 0.85rem;
  color: #334155;
  outline: none;
  transition: all 0.2s;
  font-family: inherit;
}

.note-input:hover {
  background-color: #f1f5f9;
}

.note-input:focus {
  background-color: #ffffff;
  border-color: #cbd5e1;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
}

/* Submission Footer */
.submission-footer {
  position: sticky;
  bottom: 0;
  display: flex;
  justify-content: space-between;
  align-items: center;
  background-color: #ffffff;
  padding: 1.25rem 2rem;
  border-radius: 16px;
  box-shadow: 0 -4px 6px -1px rgba(0, 0, 0, 0.05);
  border: 1px solid #e2e8f0;
  margin-top: 1rem;
  z-index: 100;
  transition: box-shadow 0.3s;
}

.submission-footer.floating {
  box-shadow: 0 -10px 25px rgba(0, 0, 0, 0.1);
}

.footer-stats {
  display: flex;
  gap: 1.5rem;
}

.stat {
  font-size: 0.95rem;
  color: #64748b;
  font-weight: 500;
}

.stat strong {
  font-size: 1.1rem;
  color: #0f172a;
}

.footer-actions {
  display: flex;
  gap: 1rem;
}

.export-btn {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.85rem 1.5rem;
  border-radius: 10px;
  background-color: #ffffff;
  color: #475569;
  border: 1px solid #cbd5e1;
  font-weight: 600;
  font-size: 0.95rem;
  cursor: pointer;
  transition: all 0.2s;
}

.export-btn:hover {
  background-color: #f8fafc;
  color: #0f172a;
}

.save-btn {
  padding: 0.85rem 2rem;
  border-radius: 10px;
  background: linear-gradient(135deg, #4f46e5 0%, #3b82f6 100%);
  color: white;
  border: none;
  font-weight: 700;
  font-size: 0.95rem;
  cursor: pointer;
  box-shadow: 0 4px 6px -1px rgba(79, 70, 229, 0.25);
  transition: all 0.2s;
}

.save-btn:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 6px 12px rgba(79, 70, 229, 0.3);
}

.save-btn:disabled {
  background: #cbd5e1;
  cursor: not-allowed;
  box-shadow: none;
  transform: none;
}

/* Responsiveness */
@media (max-width: 1024px) {
  .control-panel {
    grid-template-columns: 1fr;
    gap: 1rem;
  }
}

@media (max-width: 900px) {
  .roster-header {
    display: none;
  }
  
  .student-row {
    grid-template-columns: 1fr;
    gap: 1rem;
  }
  
  .submission-footer {
    flex-direction: column;
    gap: 1.5rem;
  }
  
  .footer-actions {
    width: 100%;
  }
  
  .export-btn, .save-btn {
    flex: 1;
    justify-content: center;
  }
}
</style>
