<template>
  <div class="setup-container">
    <header class="page-header">
      <div class="header-content">
        <h1 class="page-title">Semester Setup</h1>
        <p class="page-subtitle">Configure academic calendars, terms, and active sessions.</p>
      </div>
    </header>

    <div class="setup-layout">
      <!-- Left Column: Form to setup a new term -->
      <div class="setup-column">
        <div class="card form-card">
          <div class="card-header">
            <h2>Configure New Semester</h2>
            <p>Define the dates and parameters for an academic term.</p>
          </div>
          
          <form @submit.prevent="saveSemester" class="setup-form">
            <div class="form-grid">
              <div class="form-group">
                <label>Academic Year</label>
                <div class="input-with-icon">
                  <svg viewBox="0 0 24 24" fill="none" class="input-icon" stroke="currentColor" stroke-width="2"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect><line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" y2="6"></line><line x1="3" y1="10" x2="21" y2="10"></line></svg>
                  <select v-model="form.year" required class="form-control pl-10">
                    <option disabled value="">Select Year</option>
                    <option value="2023/2024">2023/2024</option>
                    <option value="2024/2025">2024/2025</option>
                    <option value="2025/2026">2025/2026</option>
                    <option value="2026/2027">2026/2027</option>
                  </select>
                </div>
              </div>
              
              <div class="form-group">
                <label>Semester Term</label>
                <div class="input-with-icon">
                  <svg viewBox="0 0 24 24" fill="none" class="input-icon" stroke="currentColor" stroke-width="2"><path d="M22 12h-4l-3 9L9 3l-3 9H2"></path></svg>
                  <select v-model="form.term" required class="form-control pl-10">
                    <option disabled value="">Select Semester</option>
                    <option value="First Semester">First Semester</option>
                    <option value="Second Semester">Second Semester</option>
                    <option value="Summer Session">Summer Session</option>
                  </select>
                </div>
              </div>
              
              <div class="form-row">
                <div class="form-group">
                  <label>Lectures Start Date</label>
                  <input type="date" v-model="form.startDate" required class="form-control" />
                </div>
                <div class="form-group">
                  <label>Lectures End Date</label>
                  <input type="date" v-model="form.endDate" required class="form-control" />
                </div>
              </div>
              
              <div class="form-row">
                <div class="form-group">
                  <label>Exams Start Date</label>
                  <input type="date" v-model="form.examsStart" class="form-control" />
                </div>
                <div class="form-group">
                  <label>Exams End Date</label>
                  <input type="date" v-model="form.examsEnd" class="form-control" />
                </div>
              </div>
              
              <div class="checkbox-group">
                <label class="custom-checkbox">
                  <input type="checkbox" v-model="form.isCurrent">
                  <span class="checkmark">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" v-if="form.isCurrent">
                      <polyline points="20 6 9 17 4 12"></polyline>
                    </svg>
                  </span>
                  <span class="checkbox-text">Set as current active semester</span>
                </label>
                <p class="checkbox-hint">This will deactivate any currently active semester automatically.</p>
              </div>
            </div>
            
            <div class="form-actions">
              <button type="submit" class="btn-primary">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"></path><polyline points="17 21 17 13 7 13 7 21"></polyline><polyline points="7 3 7 8 15 8"></polyline></svg>
                Save Configuration
              </button>
              <button type="button" class="btn-ghost" @click="resetForm">Clear</button>
            </div>
          </form>
        </div>
      </div>
      
      <!-- Right Column: Summary / active semester -->
      <div class="info-column">
        <div class="card active-status-card" v-if="activeSemester">
          <div class="card-bg-pattern"></div>
          <div class="status-badge">CURRENTLY ACTIVE</div>
          <h2 class="active-year">{{ activeSemester.year }}</h2>
          <h3 class="active-term">{{ activeSemester.term }}</h3>
          
          <div class="timeline">
            <div class="timeline-item">
              <div class="timeline-dot start"></div>
              <div class="timeline-content">
                <span>Lectures Begin</span>
                <strong>{{ formatDate(activeSemester.startDate) }}</strong>
              </div>
            </div>
            <div class="timeline-item">
              <div class="timeline-dot end"></div>
              <div class="timeline-content">
                <span>Semester Ends</span>
                <strong>{{ activeSemester.examsEnd ? formatDate(activeSemester.examsEnd) : formatDate(activeSemester.endDate) }}</strong>
              </div>
            </div>
          </div>
        </div>
        
        <div class="card history-card">
          <div class="card-header border-bottom">
            <h2>Saved Configurations</h2>
          </div>
          <div class="history-list">
            <div v-for="sem in sortedSemesters" :key="sem.id" class="history-item">
              <div class="history-icon" :class="{ 'is-active': sem.isCurrent }">
                <svg v-if="sem.isCurrent" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="20 6 9 17 4 12"></polyline></svg>
                <svg v-else viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg>
              </div>
              <div class="history-details">
                <div class="history-title">
                  {{ sem.term }} <span class="history-year">({{ sem.year }})</span>
                </div>
                <div class="history-dates">{{ formatDate(sem.startDate) }} — {{ formatDate(sem.endDate) }}</div>
              </div>
              <div class="history-actions" v-if="!sem.isCurrent">
                <button class="btn-activate" title="Set as Current" @click="setActive(sem.id)">Set Active</button>
                <button class="btn-icon" title="Delete" @click="deleteSemester(sem.id)">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>
                </button>
              </div>
            </div>
            
            <div v-if="semesters.length === 0" class="empty-history">
              No semesters configured yet.
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import api from '../../api.js';

const semesters = ref([]);

const initialForm = {
  year: '',
  term: '',
  startDate: '',
  endDate: '',
  examsStart: '',
  examsEnd: '',
  isCurrent: false
};

const form = ref({ ...initialForm });

const fetchSemesters = async () => {
  try {
    const res = await api.get('/semesters');
    semesters.value = res.data.map(s => ({
      ...s,
      year: s.name.split(' - ')[0],
      term: s.name.split(' - ')[1] || s.name,
      isCurrent: s.isActive
    }));
  } catch (error) {
    console.error('Error fetching semesters:', error);
  }
};

onMounted(() => {
  fetchSemesters();
});

const activeSemester = computed(() => {
  return semesters.value.find(s => s.isCurrent);
});

const sortedSemesters = computed(() => {
  return [...semesters.value].sort((a, b) => new Date(b.startDate) - new Date(a.startDate));
});

const formatDate = (dateStr) => {
  if (!dateStr) return '';
  const date = new Date(dateStr);
  return date.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
};

const resetForm = () => {
  form.value = { ...initialForm };
};

const saveSemester = async () => {
  try {
    const name = `${form.value.year} - ${form.value.term}`;
    await api.post('/semesters', {
      name,
      startDate: form.value.startDate,
      endDate: form.value.endDate,
      isActive: form.value.isCurrent
    });
    resetForm();
    await fetchSemesters();
  } catch (error) {
    console.error('Error saving semester:', error);
  }
};

const setActive = async (id) => {
  try {
    const sem = semesters.value.find(s => s.id === id);
    if (!sem) return;
    await api.put(`/semesters/${id}`, {
      name: sem.name,
      startDate: sem.startDate,
      endDate: sem.endDate,
      isActive: true
    });
    await fetchSemesters();
  } catch (error) {
    console.error('Error setting active semester:', error);
  }
};

const deleteSemester = async (id) => {
  try {
    await api.delete(`/semesters/${id}`);
    await fetchSemesters();
  } catch (error) {
    console.error('Error deleting semester:', error);
  }
};
</script>

<style scoped>
.setup-container {
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

/* Layout Grid */
.setup-layout {
  display: grid;
  grid-template-columns: 1.3fr 1fr;
  gap: 24px;
  align-items: start;
}

@media (max-width: 992px) {
  .setup-layout {
    grid-template-columns: 1fr;
  }
}

.setup-column, .info-column {
  display: flex;
  flex-direction: column;
  gap: 24px;
}

/* Cards */
.card {
  background: white;
  border-radius: 16px;
  box-shadow: 0 4px 15px rgba(0,0,0,0.03);
  overflow: hidden;
  border: 1px solid #f1f5f9;
}

.card-header {
  padding: 24px 32px 16px;
}

.card-header.border-bottom {
  border-bottom: 1px solid #f1f5f9;
}

.card-header h2 {
  margin: 0 0 6px 0;
  font-size: 1.3rem;
  color: #1e293b;
  font-weight: 700;
}

.card-header p {
  margin: 0;
  color: #64748b;
  font-size: 0.95rem;
}

/* Form Styles */
.setup-form {
  padding: 0 32px 32px;
}

.form-grid {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.form-row {
  display: flex;
  gap: 20px;
}

.form-row .form-group {
  flex: 1;
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

.input-with-icon {
  position: relative;
}

.input-icon {
  position: absolute;
  left: 14px;
  top: 50%;
  transform: translateY(-50%);
  width: 18px;
  height: 18px;
  color: #94a3b8;
  pointer-events: none;
}

.form-control {
  width: 100%;
  box-sizing: border-box;
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

.pl-10 {
  padding-left: 42px !important;
}

.form-control:focus {
  border-color: #6366f1;
  box-shadow: 0 0 0 3px rgba(99, 102, 241, 0.1);
}

.form-control::placeholder {
  color: #94a3b8;
}

/* Custom Checkbox */
.checkbox-group {
  margin-top: 10px;
  padding: 16px;
  background: #f8fafc;
  border-radius: 10px;
  border: 1px solid #e2e8f0;
}

.custom-checkbox {
  display: flex;
  align-items: center;
  gap: 12px;
  cursor: pointer;
  position: relative;
}

.custom-checkbox input {
  position: absolute;
  opacity: 0;
  cursor: pointer;
  height: 0;
  width: 0;
}

.checkmark {
  width: 22px;
  height: 22px;
  background: white;
  border: 2px solid #cbd5e1;
  border-radius: 6px;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s ease;
}

.custom-checkbox input:checked ~ .checkmark {
  background: #6366f1;
  border-color: #6366f1;
}

.checkmark svg {
  width: 14px;
  height: 14px;
  color: white;
}

.checkbox-text {
  font-weight: 600;
  font-size: 0.95rem;
  color: #334155;
}

.checkbox-hint {
  margin: 6px 0 0 34px;
  font-size: 0.8rem;
  color: #64748b;
}

/* Buttons */
.form-actions {
  display: flex;
  gap: 16px;
  margin-top: 32px;
  padding-top: 24px;
  border-top: 1px solid #f1f5f9;
}

.btn-primary {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  background: linear-gradient(135deg, #6366f1 0%, #4f46e5 100%);
  color: white;
  border: none;
  padding: 12px 28px;
  border-radius: 10px;
  font-weight: 600;
  font-size: 1rem;
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  box-shadow: 0 4px 12px rgba(99, 102, 241, 0.25);
  flex: 1;
}

.btn-primary:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 16px rgba(99, 102, 241, 0.35);
}

.btn-primary svg {
  width: 20px;
  height: 20px;
}

.btn-ghost {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  background: transparent;
  border: 1px solid #e2e8f0;
  color: #64748b;
  padding: 12px 24px;
  border-radius: 10px;
  font-weight: 600;
  font-size: 1rem;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-ghost:hover {
  background: #f1f5f9;
  color: #334155;
}

/* Active Status Card */
.active-status-card {
  position: relative;
  background: linear-gradient(135deg, #1e293b 0%, #0f172a 100%);
  color: white;
  padding: 32px;
  border-radius: 16px;
  overflow: hidden;
  border: none;
}

.card-bg-pattern {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  opacity: 0.05;
  background-image: radial-gradient(white 2px, transparent 2px);
  background-size: 30px 30px;
  pointer-events: none;
}

.status-badge {
  display: inline-block;
  background: rgba(34, 197, 94, 0.2);
  color: #4ade80;
  padding: 6px 12px;
  border-radius: 20px;
  font-size: 0.75rem;
  font-weight: 800;
  letter-spacing: 0.1em;
  margin-bottom: 16px;
  border: 1px solid rgba(34, 197, 94, 0.3);
}

.active-year {
  margin: 0;
  font-size: 2.5rem;
  font-weight: 800;
  line-height: 1.1;
  color: #fff;
}

.active-term {
  margin: 4px 0 24px 0;
  font-size: 1.2rem;
  font-weight: 500;
  color: #94a3b8;
}

.timeline {
  display: flex;
  flex-direction: column;
  position: relative;
  padding-left: 20px;
}

.timeline::before {
  content: '';
  position: absolute;
  top: 10px;
  bottom: 10px;
  left: 7px;
  width: 2px;
  background: rgba(255, 255, 255, 0.1);
}

.timeline-item {
  position: relative;
  margin-bottom: 24px;
}

.timeline-item:last-child {
  margin-bottom: 0;
}

.timeline-dot {
  position: absolute;
  left: -20px;
  top: 6px;
  width: 16px;
  height: 16px;
  border-radius: 50%;
  border: 3px solid #0f172a;
}

.timeline-dot.start {
  background: #6366f1;
}

.timeline-dot.end {
  background: #f43f5e;
}

.timeline-content {
  display: flex;
  flex-direction: column;
}

.timeline-content span {
  font-size: 0.8rem;
  color: #94a3b8;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  margin-bottom: 2px;
}

.timeline-content strong {
  font-size: 1.05rem;
  color: #f8fafc;
}

/* History List */
.history-list {
  display: flex;
  flex-direction: column;
}

.history-item {
  display: flex;
  align-items: center;
  padding: 16px 24px;
  border-bottom: 1px solid #f1f5f9;
  transition: background 0.2s;
}

.history-item:last-child {
  border-bottom: none;
}

.history-item:hover {
  background: #f8fafc;
}

.history-icon {
  width: 40px;
  height: 40px;
  border-radius: 10px;
  background: #f1f5f9;
  color: #64748b;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: 16px;
  flex-shrink: 0;
}

.history-icon.is-active {
  background: #e0e7ff;
  color: #4f46e5;
}

.history-icon svg {
  width: 20px;
  height: 20px;
}

.history-details {
  flex: 1;
}

.history-title {
  font-weight: 700;
  color: #1e293b;
  margin-bottom: 4px;
}

.history-year {
  color: #64748b;
  font-weight: 500;
}

.history-dates {
  font-size: 0.85rem;
  color: #94a3b8;
}

.history-actions {
  display: flex;
  align-items: center;
  gap: 8px;
  opacity: 0;
  transition: opacity 0.2s;
}

.history-item:hover .history-actions {
  opacity: 1;
}

@media (max-width: 768px) {
  .history-actions {
    opacity: 1;
  }
}

.btn-activate {
  background: transparent;
  border: 1px solid #6366f1;
  color: #6366f1;
  padding: 6px 12px;
  border-radius: 6px;
  font-size: 0.8rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
  white-space: nowrap;
}

.btn-activate:hover {
  background: #6366f1;
  color: white;
}

.btn-icon {
  background: transparent;
  border: none;
  width: 32px;
  height: 32px;
  border-radius: 6px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #94a3b8;
  cursor: pointer;
}

.btn-icon:hover {
  background: #fee2e2;
  color: #ef4444;
}

.btn-icon svg {
  width: 16px;
  height: 16px;
}

.empty-history {
  padding: 32px;
  text-align: center;
  color: #94a3b8;
  font-size: 0.95rem;
}
</style>
