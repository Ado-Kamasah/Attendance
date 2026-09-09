<template>
  <div class="classrep-page">
    <!-- Header -->
    <div class="page-header">
      <div>
        <h1 class="page-title">Class Representative Management</h1>
        <p class="page-subtitle">Assign and manage class representatives for each course</p>
      </div>
      <button class="btn-primary" @click="openAssignModal" id="assign-rep-btn">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
        Assign Class Rep
      </button>
    </div>

    <!-- Stats Strip -->
    <div class="stats-strip">
      <div class="stat-pill">
        <span class="stat-num">{{ store.allReps.length }}</span>
        <span class="stat-lbl">Total Class Reps</span>
      </div>
      <div class="stat-pill stat-course">
        <span class="stat-num">{{ uniqueCourses }}</span>
        <span class="stat-lbl">Courses Covered</span>
      </div>
    </div>

    <!-- Loading -->
    <div v-if="store.isLoading && store.allReps.length === 0" class="loading-state">
      <div class="spinner"></div><span>Loading class reps from Supabase…</span>
    </div>

    <!-- Empty -->
    <div v-else-if="store.allReps.length === 0" class="empty-state">
      <div class="empty-icon">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>
      </div>
      <h3>No Class Reps Assigned</h3>
      <p>Click "Assign Class Rep" to select a course and assign a student.</p>
    </div>

    <!-- Reps Table -->
    <div v-else class="table-card">
      <div class="table-head">
        <div class="search-wrap">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
          <input v-model="search" type="text" placeholder="Search by name, student ID, or course…" class="search-in" id="classrep-search"/>
        </div>
      </div>
      <div class="table-wrap">
        <table class="rep-table">
          <thead>
            <tr>
              <th>Student</th>
              <th>Program</th>
              <th>Course</th>
              <th>Level</th>
              <th>Assigned On</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="rep in filteredReps" :key="rep.id">
              <td>
                <div class="student-cell">
                  <div class="avatar-sm">{{ initials(rep.studentName) }}</div>
                  <div>
                    <p class="student-name">{{ rep.studentName }}</p>
                    <p class="student-email">{{ rep.studentEmail }}</p>
                  </div>
                </div>
              </td>
              <td><span class="tag-program">{{ rep.studentProgram || '—' }}</span></td>
              <td>
                <span class="tag-course">{{ rep.courseCode }}</span>
                <span class="course-name-text">{{ rep.courseName }}</span>
              </td>
              <td>{{ rep.courseLevel }}</td>
              <td>{{ formatDate(rep.assignedAt) }}</td>
              <td>
                <button class="btn-remove" @click="confirmRemove(rep)" :id="`remove-rep-${rep.courseId}`">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>
                  Remove
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- Assign Modal -->
    <div v-if="showModal" class="modal-overlay" @click.self="closeModal">
      <div class="modal">
        <div class="modal-header">
          <h2>Assign Class Representative</h2>
          <button class="modal-close" @click="closeModal" aria-label="Close modal">✕</button>
        </div>

        <div class="modal-body">
          <!-- Step 1: Select Course -->
          <div class="form-group">
            <label class="form-label">Select Course *</label>
            <select v-model="form.courseId" class="form-sel" id="modal-course-select">
              <option value="">-- Choose a course --</option>
              <option v-for="c in coursesStore.courses" :key="c.id" :value="c.id">
                {{ c.code }} — {{ c.name }} (Level {{ c.level || '—' }})
              </option>
            </select>
          </div>

          <!-- Step 2: Select Student (Searchable Dropdown) -->
          <div class="form-group" ref="studentDropdownRef">
            <label class="form-label dropdown-label-row">
              <span>Select Student *</span>
              <span v-if="store.isLoading" class="loading-badge">Loading from Supabase...</span>
              <span v-else-if="store.students.length" class="count-badge">
                {{ filteredStudents.length }} of {{ store.students.length }} students
              </span>
            </label>

            <!-- Searchable Dropdown Wrapper -->
            <div class="searchable-dropdown">
              <!-- Dropdown Trigger Box -->
              <div 
                class="dropdown-trigger" 
                :class="{ 'is-open': isStudentDropdownOpen, 'has-selected': !!selectedStudent }"
                @click="toggleStudentDropdown"
                id="modal-student-trigger"
              >
                <div class="trigger-selected-wrap" v-if="selectedStudent">
                  <div class="avatar-xs">{{ initials(selectedStudent.name) }}</div>
                  <div class="selected-text-col">
                    <span class="selected-name">{{ selectedStudent.name }}</span>
                    <span class="selected-sub">ID: {{ selectedStudent.studentId }} &bull; {{ selectedStudent.program || 'Student' }}</span>
                  </div>
                </div>
                <span v-else class="trigger-placeholder">Click to search and select student...</span>

                <div class="trigger-actions">
                  <button 
                    v-if="selectedStudent" 
                    type="button" 
                    class="btn-clear-student" 
                    @click.stop="clearSelectedStudent" 
                    title="Clear selection"
                  >
                    ✕
                  </button>
                  <svg class="dropdown-chevron" :class="{ 'rotate': isStudentDropdownOpen }" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <polyline points="6 9 12 15 18 9"></polyline>
                  </svg>
                </div>
              </div>

              <!-- Dropdown Popover with Search Input Inside -->
              <div v-if="isStudentDropdownOpen" class="dropdown-popover" @click.stop>
                <!-- Search Input with live filter -->
                <div class="dropdown-search-box">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <circle cx="11" cy="11" r="8"/>
                    <line x1="21" y1="21" x2="16.65" y2="16.65"/>
                  </svg>
                  <input
                    ref="studentSearchInputRef"
                    v-model="studentSearch"
                    type="text"
                    placeholder="Search name, student ID, email, program..."
                    class="dropdown-search-input"
                    id="dropdown-student-search-input"
                  />
                  <button v-if="studentSearch" @click="studentSearch = ''" class="btn-clear-search-text" type="button">✕</button>
                </div>

                <!-- Mode Quick Filter Pills -->
                <div class="dropdown-filter-tabs">
                  <button 
                    type="button" 
                    class="tab-btn" 
                    :class="{ active: studentModeFilter === 'all' }"
                    @click="studentModeFilter = 'all'"
                  >
                    All Modes
                  </button>
                  <button 
                    type="button" 
                    class="tab-btn" 
                    :class="{ active: studentModeFilter === 'Regular' }"
                    @click="studentModeFilter = 'Regular'"
                  >
                    Regular
                  </button>
                  <button 
                    type="button" 
                    class="tab-btn" 
                    :class="{ active: studentModeFilter === 'Weekend' }"
                    @click="studentModeFilter = 'Weekend'"
                  >
                    Weekend
                  </button>
                </div>

                <!-- Scrollable Students List -->
                <div class="dropdown-items-scroll">
                  <div v-if="store.isLoading" class="dropdown-state-box">
                    <div class="spinner-tiny"></div>
                    <span>Loading student records from Supabase...</span>
                  </div>
                  <div v-else-if="filteredStudents.length === 0" class="dropdown-state-box">
                    <p>No students match "{{ studentSearch }}".</p>
                  </div>
                  <div
                    v-else
                    v-for="s in filteredStudents"
                    :key="s.id"
                    class="dropdown-student-item"
                    :class="{ selected: form.studentId === s.id }"
                    @click="selectStudent(s)"
                  >
                    <div class="avatar-xs">{{ initials(s.name) }}</div>
                    <div class="student-item-details">
                      <div class="item-name-row">
                        <span class="item-name">{{ s.name }}</span>
                        <span class="item-id-pill">{{ s.studentId }}</span>
                      </div>
                      <div class="item-meta-row">
                        <span class="item-email">{{ s.email }}</span>
                        <span class="item-dot" v-if="s.program">&bull;</span>
                        <span class="item-prog" v-if="s.program">{{ s.program }}</span>
                      </div>
                    </div>
                    <span class="item-mode-tag" :class="s.mode ? s.mode.toLowerCase() : 'regular'">
                      {{ s.mode || 'Regular' }}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Selected Student Summary Card -->
          <div v-if="selectedStudent" class="selected-preview">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
            <div>
              <p class="preview-name">{{ selectedStudent.name }}</p>
              <p class="preview-email">{{ selectedStudent.email }} &bull; ID: {{ selectedStudent.studentId }} ({{ selectedStudent.mode || 'Regular' }})</p>
            </div>
            <span class="preview-badge">Ready to Assign</span>
          </div>

          <p v-if="modalError" class="modal-error">{{ modalError }}</p>
        </div>

        <div class="modal-footer">
          <button class="btn-cancel" @click="closeModal">Cancel</button>
          <button
            class="btn-confirm"
            @click="submitAssign"
            :disabled="!form.courseId || !form.studentId || store.isLoading"
            id="confirm-assign-btn"
          >
            <span v-if="store.isLoading">Saving to Supabase...</span>
            <span v-else>Confirm Assignment</span>
          </button>
        </div>
      </div>
    </div>

    <!-- Remove Confirmation Modal -->
    <div v-if="removeTarget" class="modal-overlay" @click.self="removeTarget = null">
      <div class="modal confirm-modal">
        <div class="modal-header">
          <h2>Remove Class Rep</h2>
          <button class="modal-close" @click="removeTarget = null">✕</button>
        </div>
        <div class="modal-body">
          <p>Are you sure you want to remove <strong>{{ removeTarget.studentName }}</strong> as class rep for <strong>{{ removeTarget.courseCode }}</strong>?</p>
        </div>
        <div class="modal-footer">
          <button class="btn-cancel" @click="removeTarget = null">Cancel</button>
          <button class="btn-danger" @click="doRemove" :disabled="store.isLoading" id="confirm-remove-btn">
            {{ store.isLoading ? 'Removing...' : 'Remove' }}
          </button>
        </div>
      </div>
    </div>

    <!-- Toast Notification -->
    <transition name="toast">
      <div v-if="toast" class="toast" :class="toast.type">{{ toast.msg }}</div>
    </transition>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted, nextTick } from 'vue';
import { useClassRepStore } from '@/stores/classrep.js';
import { useCoursesStore } from '@/stores/courses.js';

const store = useClassRepStore();
const coursesStore = useCoursesStore();

const search = ref('');
const showModal = ref(false);
const removeTarget = ref(null);
const studentSearch = ref('');
const studentModeFilter = ref('all');
const selectedStudent = ref(null);
const isStudentDropdownOpen = ref(false);
const studentDropdownRef = ref(null);
const studentSearchInputRef = ref(null);
const modalError = ref('');
const toast = ref(null);

const form = ref({ courseId: '', studentId: '' });

onMounted(async () => {
  document.addEventListener('click', handleClickOutside);
  await Promise.all([
    store.fetchAllReps(), 
    coursesStore.fetchCourses()
  ]);
});

onUnmounted(() => {
  document.removeEventListener('click', handleClickOutside);
});

function handleClickOutside(e) {
  if (studentDropdownRef.value && !studentDropdownRef.value.contains(e.target)) {
    isStudentDropdownOpen.value = false;
  }
}

function toggleStudentDropdown() {
  isStudentDropdownOpen.value = !isStudentDropdownOpen.value;
  if (isStudentDropdownOpen.value) {
    nextTick(() => {
      studentSearchInputRef.value?.focus();
    });
  }
}

function selectStudent(s) {
  form.value.studentId = s.id;
  selectedStudent.value = s;
  isStudentDropdownOpen.value = false;
}

function clearSelectedStudent() {
  form.value.studentId = '';
  selectedStudent.value = null;
}

const uniqueCourses = computed(() => new Set(store.allReps.map((r) => r.courseId)).size);

const filteredReps = computed(() => {
  const q = search.value.toLowerCase().trim();
  if (!q) return store.allReps;
  return store.allReps.filter((r) =>
    (r.studentName || '').toLowerCase().includes(q) ||
    (r.courseCode || '').toLowerCase().includes(q) ||
    (r.courseName || '').toLowerCase().includes(q) ||
    (r.studentEmail || '').toLowerCase().includes(q) ||
    (r.studentProgram || '').toLowerCase().includes(q)
  );
});

const filteredStudents = computed(() => {
  const q = studentSearch.value.trim().toLowerCase();
  let list = store.students;

  if (studentModeFilter.value !== 'all') {
    list = list.filter((s) => (s.mode || '').toLowerCase() === studentModeFilter.value.toLowerCase());
  }

  if (!q) return list;
  return list.filter((s) =>
    (s.name || '').toLowerCase().includes(q) ||
    (s.studentId || '').toLowerCase().includes(q) ||
    (s.email || '').toLowerCase().includes(q) ||
    (s.program || '').toLowerCase().includes(q)
  );
});

async function openAssignModal() {
  form.value = { courseId: '', studentId: '' };
  studentSearch.value = '';
  studentModeFilter.value = 'all';
  selectedStudent.value = null;
  modalError.value = '';
  isStudentDropdownOpen.value = false;
  showModal.value = true;
  await store.fetchStudents();
}

function closeModal() {
  showModal.value = false;
  isStudentDropdownOpen.value = false;
}

async function submitAssign() {
  modalError.value = '';
  if (!form.value.courseId) {
    modalError.value = 'Please select a course.';
    return;
  }
  if (!form.value.studentId) {
    modalError.value = 'Please select a student from the dropdown.';
    return;
  }

  try {
    const result = await store.assignClassRep(form.value.studentId, form.value.courseId);
    showToast(result.message || 'Class representative assigned successfully!', 'success');
    closeModal();
  } catch (err) {
    modalError.value = err.message || 'Failed to assign class rep';
  }
}

function confirmRemove(rep) {
  removeTarget.value = rep;
}

async function doRemove() {
  try {
    await store.removeClassRep(removeTarget.value.courseId);
    showToast(`Class rep removed from ${removeTarget.value.courseCode}`, 'success');
    removeTarget.value = null;
  } catch (err) {
    showToast(err.message || 'Failed to remove class rep', 'error');
  }
}

function showToast(msg, type = 'success') {
  toast.value = { msg, type };
  setTimeout(() => (toast.value = null), 3500);
}

function initials(name) {
  return (name || '').split(' ').map((w) => w[0]).join('').toUpperCase().slice(0, 2);
}

function formatDate(dt) {
  if (!dt) return '—';
  return new Date(dt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}
</script>

<style scoped>
* { font-family: 'Inter', sans-serif; box-sizing: border-box; }
.classrep-page { display: flex; flex-direction: column; gap: 1.75rem; width: 100%; }

.page-header { display: flex; justify-content: space-between; align-items: flex-start; flex-wrap: wrap; gap: 1rem; }
.page-title { margin: 0; font-size: 1.75rem; font-weight: 700; color: #0f172a; letter-spacing: -0.025em; }
.page-subtitle { margin: 0.25rem 0 0; font-size: 0.9rem; color: #64748b; }

.btn-primary { display: inline-flex; align-items: center; gap: 0.5rem; background: linear-gradient(135deg,#ef4444,#dc2626); color: #fff; border: none; padding: 0.65rem 1.3rem; border-radius: 10px; font-weight: 600; font-size: 0.9rem; cursor: pointer; box-shadow: 0 4px 12px rgba(239,68,68,.25); transition: all 0.2s; }
.btn-primary svg { width: 16px; height: 16px; }
.btn-primary:hover { transform: translateY(-1px); box-shadow: 0 6px 16px rgba(239,68,68,.35); }

.stats-strip { display: flex; gap: 1rem; flex-wrap: wrap; }
.stat-pill { display: flex; align-items: center; gap: 0.6rem; background: #fff; border: 1px solid #e2e8f0; border-radius: 10px; padding: 0.65rem 1.1rem; font-size: 0.85rem; }
.stat-num { font-weight: 700; font-size: 1.1rem; color: #0f172a; }
.stat-lbl { color: #64748b; }
.stat-course .stat-num { color: #ef4444; }

.loading-state { display: flex; align-items: center; gap: 1rem; padding: 3rem; justify-content: center; color: #64748b; }
.spinner { width: 20px; height: 20px; border: 2px solid #e2e8f0; border-top-color: #ef4444; border-radius: 50%; animation: spin 0.7s linear infinite; }
@keyframes spin { to { transform: rotate(360deg); } }

.empty-state { display: flex; flex-direction: column; align-items: center; padding: 5rem 1rem; background: #fff; border-radius: 16px; border: 1px solid #e2e8f0; text-align: center; }
.empty-icon { width: 64px; height: 64px; background: #f8fafc; border-radius: 50%; display: flex; align-items: center; justify-content: center; margin-bottom: 1rem; color: #94a3b8; }
.empty-icon svg { width: 30px; height: 30px; }
.empty-state h3 { margin: 0 0 0.5rem; color: #1e293b; }
.empty-state p { margin: 0; color: #64748b; font-size: 0.9rem; }

.table-card { background: #fff; border-radius: 16px; border: 1px solid #f1f5f9; box-shadow: 0 2px 8px rgba(0,0,0,.04); overflow: hidden; }
.table-head { padding: 1.1rem 1.5rem; border-bottom: 1px solid #f1f5f9; }
.search-wrap { display: flex; align-items: center; gap: 0.5rem; background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 0.45rem 0.75rem; max-width: 320px; }
.search-wrap svg { width: 15px; height: 15px; color: #94a3b8; flex-shrink: 0; }
.search-in { border: none; background: transparent; outline: none; font-size: 0.875rem; color: #334155; width: 100%; }

.table-wrap { overflow-x: auto; }
.rep-table { width: 100%; border-collapse: collapse; font-size: 0.875rem; }
.rep-table th { background: #f8fafc; color: #64748b; font-size: 0.72rem; font-weight: 700; text-transform: uppercase; letter-spacing: 0.06em; padding: 0.75rem 1.25rem; text-align: left; border-bottom: 1px solid #f1f5f9; white-space: nowrap; }
.rep-table td { padding: 0.9rem 1.25rem; border-bottom: 1px solid #f8fafc; color: #334155; vertical-align: middle; }
.rep-table tr:last-child td { border-bottom: none; }
.rep-table tr:hover td { background: #fafafa; }

.student-cell { display: flex; align-items: center; gap: 0.75rem; }
.avatar-sm { width: 34px; height: 34px; border-radius: 10px; background: linear-gradient(135deg,#ef4444,#dc2626); color: #fff; font-size: 0.72rem; font-weight: 700; display: flex; align-items: center; justify-content: center; flex-shrink: 0; }
.student-name { margin: 0; font-weight: 600; color: #0f172a; font-size: 0.88rem; }
.student-email { margin: 0; font-size: 0.75rem; color: #94a3b8; }
.tag-program { font-size: 0.7rem; background: #f1f5f9; color: #475569; padding: 0.15rem 0.5rem; border-radius: 5px; font-weight: 600; }
.tag-course { font-size: 0.7rem; background: #e0e7ff; color: #4338ca; padding: 0.15rem 0.5rem; border-radius: 5px; font-weight: 700; margin-right: 0.4rem; }
.course-name-text { font-size: 0.82rem; color: #334155; }

.btn-remove { display: inline-flex; align-items: center; gap: 0.4rem; background: #fff; border: 1px solid #fecdd3; color: #b91c1c; padding: 0.4rem 0.85rem; border-radius: 8px; font-size: 0.8rem; font-weight: 600; cursor: pointer; transition: all 0.2s; }
.btn-remove svg { width: 14px; height: 14px; }
.btn-remove:hover { background: #fee2e2; }

/* Modal Styles */
.modal-overlay { position: fixed; inset: 0; background: rgba(15,23,42,0.5); backdrop-filter: blur(4px); display: flex; align-items: center; justify-content: center; z-index: 9999; padding: 1rem; }
.modal { background: #fff; border-radius: 20px; width: 100%; max-width: 540px; box-shadow: 0 24px 48px rgba(0,0,0,0.2); overflow: visible; }
.confirm-modal { max-width: 400px; }
.modal-header { display: flex; justify-content: space-between; align-items: center; padding: 1.5rem 1.75rem 1rem; border-bottom: 1px solid #f1f5f9; }
.modal-header h2 { margin: 0; font-size: 1.15rem; font-weight: 700; color: #0f172a; }
.modal-close { background: none; border: none; font-size: 1.1rem; color: #94a3b8; cursor: pointer; padding: 0.25rem 0.5rem; border-radius: 6px; transition: color 0.2s; }
.modal-close:hover { color: #334155; }
.modal-body { padding: 1.25rem 1.75rem; display: flex; flex-direction: column; gap: 1.25rem; }
.modal-footer { display: flex; justify-content: flex-end; gap: 0.75rem; padding: 1rem 1.75rem 1.5rem; border-top: 1px solid #f1f5f9; }

.form-group { display: flex; flex-direction: column; gap: 0.45rem; position: relative; }
.form-label { font-size: 0.82rem; font-weight: 600; color: #475569; }
.dropdown-label-row { display: flex; justify-content: space-between; align-items: center; }
.form-sel { padding: 0.65rem 0.85rem; border: 1.5px solid #e2e8f0; border-radius: 10px; font-size: 0.875rem; color: #334155; background: #fff; outline: none; transition: border-color 0.2s; width: 100%; }
.form-sel:focus { border-color: #ef4444; }

/* Searchable Dropdown */
.searchable-dropdown { position: relative; width: 100%; }

.dropdown-trigger {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0.55rem 0.85rem;
  min-height: 44px;
  background: #fff;
  border: 1.5px solid #e2e8f0;
  border-radius: 10px;
  cursor: pointer;
  transition: all 0.2s;
  user-select: none;
}
.dropdown-trigger:hover { border-color: #cbd5e1; background: #fafafa; }
.dropdown-trigger.is-open { border-color: #ef4444; box-shadow: 0 0 0 3px rgba(239, 68, 68, 0.15); }
.dropdown-trigger.has-selected { border-color: #cbd5e1; }

.trigger-placeholder { color: #94a3b8; font-size: 0.875rem; }

.trigger-selected-wrap { display: flex; align-items: center; gap: 0.6rem; min-width: 0; flex: 1; }
.avatar-xs { width: 28px; height: 28px; border-radius: 8px; background: linear-gradient(135deg,#ef4444,#dc2626); color: #fff; font-size: 0.65rem; font-weight: 700; display: flex; align-items: center; justify-content: center; flex-shrink: 0; }
.selected-text-col { display: flex; flex-direction: column; min-width: 0; overflow: hidden; }
.selected-name { font-size: 0.86rem; font-weight: 600; color: #0f172a; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.selected-sub { font-size: 0.72rem; color: #64748b; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }

.trigger-actions { display: flex; align-items: center; gap: 0.4rem; }
.btn-clear-student { background: #f1f5f9; border: none; border-radius: 6px; width: 20px; height: 20px; font-size: 0.7rem; color: #64748b; cursor: pointer; display: flex; align-items: center; justify-content: center; transition: all 0.2s; }
.btn-clear-student:hover { background: #fee2e2; color: #ef4444; }
.dropdown-chevron { width: 16px; height: 16px; color: #94a3b8; transition: transform 0.2s; }
.dropdown-chevron.rotate { transform: rotate(180deg); }

/* Dropdown Menu Popover */
.dropdown-popover {
  position: absolute;
  top: calc(100% + 6px);
  left: 0;
  right: 0;
  background: #fff;
  border: 1.5px solid #e2e8f0;
  border-radius: 12px;
  box-shadow: 0 12px 32px rgba(15, 23, 42, 0.15);
  z-index: 10001;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  animation: popIn 0.15s ease;
}
@keyframes popIn {
  from { opacity: 0; transform: translateY(-6px); }
  to { opacity: 1; transform: translateY(0); }
}

.dropdown-search-box {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.6rem 0.85rem;
  background: #f8fafc;
  border-bottom: 1px solid #f1f5f9;
}
.dropdown-search-box svg { width: 16px; height: 16px; color: #94a3b8; flex-shrink: 0; }
.dropdown-search-input {
  border: none;
  background: transparent;
  outline: none;
  font-size: 0.85rem;
  color: #1e293b;
  width: 100%;
}
.btn-clear-search-text { background: none; border: none; font-size: 0.75rem; color: #94a3b8; cursor: pointer; }
.btn-clear-search-text:hover { color: #334155; }

.dropdown-filter-tabs {
  display: flex;
  gap: 0.35rem;
  padding: 0.4rem 0.75rem;
  background: #fff;
  border-bottom: 1px solid #f1f5f9;
}
.tab-btn {
  background: #f1f5f9;
  border: none;
  border-radius: 6px;
  font-size: 0.72rem;
  font-weight: 600;
  color: #64748b;
  padding: 0.2rem 0.6rem;
  cursor: pointer;
  transition: all 0.15s;
}
.tab-btn.active { background: #ef4444; color: #fff; }
.tab-btn:hover:not(.active) { background: #e2e8f0; color: #334155; }

.dropdown-items-scroll { max-height: 220px; overflow-y: auto; display: flex; flex-direction: column; }
.dropdown-state-box { display: flex; align-items: center; justify-content: center; gap: 0.5rem; padding: 2rem 1rem; color: #64748b; font-size: 0.82rem; }
.dropdown-state-box p { margin: 0; }

.dropdown-student-item {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.65rem 0.9rem;
  cursor: pointer;
  border-bottom: 1px solid #f8fafc;
  transition: background 0.15s;
}
.dropdown-student-item:last-child { border-bottom: none; }
.dropdown-student-item:hover { background: #f8fafc; }
.dropdown-student-item.selected { background: #fee2e2; }

.student-item-details { display: flex; flex-direction: column; flex: 1; min-width: 0; }
.item-name-row { display: flex; align-items: center; gap: 0.4rem; }
.item-name { font-size: 0.85rem; font-weight: 600; color: #0f172a; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.item-id-pill { font-size: 0.68rem; background: #f1f5f9; color: #475569; padding: 0.05rem 0.4rem; border-radius: 4px; font-weight: 700; flex-shrink: 0; }
.item-meta-row { display: flex; align-items: center; gap: 0.35rem; font-size: 0.72rem; color: #94a3b8; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.item-email { overflow: hidden; text-overflow: ellipsis; }
.item-prog { color: #64748b; overflow: hidden; text-overflow: ellipsis; }
.item-mode-tag { font-size: 0.68rem; font-weight: 700; padding: 0.1rem 0.45rem; border-radius: 5px; flex-shrink: 0; background: #e0e7ff; color: #4338ca; }
.item-mode-tag.weekend { background: #fef3c7; color: #b45309; }

/* Selected Student Preview */
.selected-preview { display: flex; align-items: center; gap: 0.75rem; background: #f0fdf4; border: 1px solid #bbf7d0; border-radius: 10px; padding: 0.75rem 1rem; }
.selected-preview svg { width: 20px; height: 20px; color: #15803d; flex-shrink: 0; }
.preview-name { margin: 0; font-weight: 700; color: #0f172a; font-size: 0.88rem; }
.preview-email { margin: 0; font-size: 0.74rem; color: #64748b; }
.preview-badge { margin-left: auto; background: #dcfce7; color: #15803d; font-size: 0.7rem; font-weight: 700; padding: 0.15rem 0.5rem; border-radius: 5px; white-space: nowrap; }

.modal-error { color: #b91c1c; font-size: 0.82rem; margin: 0; }

.btn-cancel { background: #f1f5f9; border: none; color: #475569; padding: 0.6rem 1.2rem; border-radius: 10px; font-weight: 600; font-size: 0.875rem; cursor: pointer; transition: background 0.2s; }
.btn-cancel:hover { background: #e2e8f0; }
.btn-confirm { background: linear-gradient(135deg,#ef4444,#dc2626); color: #fff; border: none; padding: 0.6rem 1.4rem; border-radius: 10px; font-weight: 600; font-size: 0.875rem; cursor: pointer; transition: all 0.2s; }
.btn-confirm:disabled { opacity: 0.5; cursor: not-allowed; }
.btn-confirm:not(:disabled):hover { transform: translateY(-1px); box-shadow: 0 4px 12px rgba(239,68,68,.3); }
.btn-danger { background: #ef4444; color: #fff; border: none; padding: 0.6rem 1.2rem; border-radius: 10px; font-weight: 600; font-size: 0.875rem; cursor: pointer; transition: all 0.2s; }
.btn-danger:disabled { opacity: 0.5; cursor: not-allowed; }
.btn-danger:hover:not(:disabled) { background: #dc2626; }

.spinner-tiny { width: 14px; height: 14px; border: 2px solid #e2e8f0; border-top-color: #ef4444; border-radius: 50%; animation: spin 0.7s linear infinite; }

/* Toast */
.toast { position: fixed; bottom: 1.5rem; right: 1.5rem; padding: 0.85rem 1.4rem; border-radius: 12px; font-size: 0.875rem; font-weight: 600; color: #fff; z-index: 10000; box-shadow: 0 8px 24px rgba(0,0,0,0.15); }
.toast.success { background: #10b981; }
.toast.error   { background: #ef4444; }
.toast-enter-active, .toast-leave-active { transition: all 0.3s; }
.toast-enter-from, .toast-leave-to { opacity: 0; transform: translateY(12px); }

@media (max-width: 768px) {
  .page-header { flex-direction: column; }
  .rep-table th:nth-child(3), .rep-table td:nth-child(3) { display: none; }
}

.loading-badge { font-size: 0.72rem; font-weight: 400; color: #94a3b8; font-style: italic; }
.count-badge { background: #f1f5f9; color: #475569; font-size: 0.7rem; font-weight: 700; padding: 0.1rem 0.5rem; border-radius: 10px; }
</style>
