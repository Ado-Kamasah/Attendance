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
            <h2>{{ editingSemesterId ? 'Update Semester' : 'Configure New Semester' }}</h2>
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
                  <span class="checkbox-text ">Set as current active semester</span>
                </label>
                <p class="checkbox-hint">This will deactivate any currently active semester automatically.</p>
              </div>
            </div>
            
            <div class="form-actions">
              <button type="submit" class="btn-primary" :disabled="semestersStore.isLoading">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"></path><polyline points="17 21 17 13 7 13 7 21"></polyline><polyline points="7 3 7 8 15 8"></polyline></svg>
                {{ editingSemesterId ? 'Update Configuration' : 'Save Configuration' }}
              </button>
              <button type="button" class="btn-ghost" @click="resetForm">{{ editingSemesterId ? 'Cancel' : 'Clear' }}</button>
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
                <svg v-if="sem.isCurrent" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg>
                <svg v-else viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="20 6 9 17 4 12"></polyline></svg>
                
              </div>
              <div class="history-details">
                <div class="history-title">
                  {{ sem.term }} <span class="history-year">({{ sem.year }})</span>
                </div>
                <div class="history-dates">{{ formatDate(sem.startDate) }} — {{ formatDate(sem.endDate) }}</div>
              </div>
              <div class="history-actions" v-if="!sem.isCurrent">
                <button class="btn-activate" title="Set as Current" @click="setActive(sem.id)">Set Active</button>
                <button class="btn-icon edit" title="Edit" @click="editSemester(sem)">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path></svg>
                </button>
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
import { ref, computed, onMounted, onUnmounted } from 'vue';
import { useSemestersStore } from '@/stores/semesters';
import { useAuditLogsStore } from '@/stores/auditlogs';
import { supabase } from '@/stores/supabase';

const semestersStore = useSemestersStore();
const auditLogsStore = useAuditLogsStore();

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
const editingSemesterId = ref(null);
const currentUser = ref(null);

// UI-shaped view over the store's semesters: derives year/term from `name`
// ("2025/2026 - First Semester") and isCurrent from isActive.
const semesters = computed(() =>
  semestersStore.semesters.map((s) => ({
    ...s,
    year: s.name.split(' - ')[0],
    term: s.name.split(' - ')[1] || s.name,
    isCurrent: s.isActive,
  }))
);

const loadCurrentUser = async () => {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return;

  const { data, error } = await supabase
    .from('users')
    .select('id, name, role')
    .eq('id', user.id)
    .single();

  if (!error) currentUser.value = data;
};

const logAudit = (action, details) => {
  if (!currentUser.value) return;
  auditLogsStore.logAction({
    action,
    details,
    userId: currentUser.value.id,
    userRole: currentUser.value.role,
    userName: currentUser.value.name,
  });
};

onMounted(async () => {
  await Promise.all([semestersStore.fetchSemesters(), loadCurrentUser()]);
  semestersStore.subscribeToSemesters();
});

onUnmounted(() => {
  semestersStore.unsubscribeFromSemesters();
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
  editingSemesterId.value = null;
};

const editSemester = (sem) => {
  editingSemesterId.value = sem.id;
  form.value = {
    year: sem.year,
    term: sem.term,
    startDate: sem.startDate ? sem.startDate.split('T')[0] : '',
    endDate: sem.endDate ? sem.endDate.split('T')[0] : '',
    examsStart: sem.examsStart ? sem.examsStart.split('T')[0] : '',
    examsEnd: sem.examsEnd ? sem.examsEnd.split('T')[0] : '',
    isCurrent: sem.isCurrent
  };
};

const saveSemester = async () => {
  const name = `${form.value.year} - ${form.value.term}`;
  const payload = {
    name,
    startDate: form.value.startDate,
    endDate: form.value.endDate,
    examsStart: form.value.examsStart || null,
    examsEnd: form.value.examsEnd || null,
  };

  try {
    let semesterId = editingSemesterId.value;

    if (semesterId) {
      await semestersStore.updateSemester(semesterId, payload);
      logAudit('semester_updated', `Updated semester "${name}"`);
    } else {
      const created = await semestersStore.createSemester({ ...payload, isActive: false });
      semesterId = created.id;
      logAudit('semester_created', `Created semester "${name}"`);
    }

    // setActiveSemester deactivates every other semester atomically, so at
    // most one semester is ever marked active.
    if (form.value.isCurrent) {
      await semestersStore.setActiveSemester(semesterId);
      logAudit('semester_activated', `Set semester "${name}" as active`);
    }

    resetForm();
  } catch (error) {
    console.error('Error saving semester:', error);
  }
};

const setActive = async (id) => {
  try {
    const sem = semesters.value.find(s => s.id === id);
    await semestersStore.setActiveSemester(id);
    if (sem) logAudit('semester_activated', `Set semester "${sem.name}" as active`);
  } catch (error) {
    console.error('Error setting active semester:', error);
  }
};

const deleteSemester = async (id) => {
  const sem = semesters.value.find(s => s.id === id);
  if (!confirm(`Delete semester "${sem?.name ?? ''}"? This cannot be undone.`)) return;

  try {
    await semestersStore.deleteSemester(id);
    logAudit('semester_deleted', `Deleted semester "${sem?.name ?? ''}"`);
  } catch (error) {
    console.error('Error deleting semester:', error);
  }
};
</script>