<template>
  <div class="classrep-dash">
    <!-- Header -->
    <div class="dash-header">
      <div>
        <div class="title-row">
          <span class="cr-badge">🎓 Class Rep</span>
          <h1 class="page-title">Class Rep Dashboard</h1>
        </div>
        <p class="page-subtitle">{{ currentDate }} · Mark and track lecturer attendance</p>
      </div>
    </div>

    <!-- Loading -->
    <div v-if="isLoading" class="loading-state">
      <div class="spinner"></div><span>Loading your courses…</span>
    </div>

    <!-- No roles assigned -->
    <div v-else-if="store.myRoles.length === 0" class="empty-state">
      <div class="empty-icon">🎓</div>
      <h3>No Class Rep Roles Found</h3>
      <p>You have not been assigned as a class representative for any course yet. Please contact your administrator.</p>
    </div>

    <template v-else>
      <!-- Course Tabs -->
      <div class="course-tabs">
        <button
          v-for="role in store.myRoles"
          :key="role.courseId"
          class="tab-btn"
          :class="{ active: activeCourseId === role.courseId }"
          @click="switchCourse(role.courseId)"
        >
          <span class="tab-code">{{ role.courseCode }}</span>
          <span class="tab-name">{{ role.courseName }}</span>
        </button>
      </div>

      <div v-if="activeCourse" class="content-grid">
        <!-- Left: Mark Attendance Form -->
        <div class="panel mark-panel">
          <div class="panel-head">
            <div class="panel-icon">📋</div>
            <div>
              <h2>Mark Lecturer Attendance</h2>
              <p class="panel-sub">{{ activeCourse.courseCode }} – {{ activeCourse.courseName }}</p>
            </div>
          </div>

          <!-- Schedule Info -->
          <div v-if="activeCourse.schedules?.length" class="schedule-info">
            <div v-for="(sch, i) in activeCourse.schedules" :key="i" class="schedule-chip">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
              {{ sch.day }} {{ sch.startTime }}–{{ sch.endTime }} · {{ sch.venue }}
            </div>
          </div>

          <form @submit.prevent="submitAttendance" class="mark-form">
            <!-- Session Code Verification Section -->
            <div class="form-group session-code-group">
              <label for="att-session-code" class="session-label">
                <span>Session Code / PIN *</span>
                <span class="session-hint">Enter code to auto-retrieve creation date & time for {{ activeCourse.courseCode }}</span>
              </label>

              <div class="session-input-row">
                <div class="session-input-wrapper">
                  <svg class="session-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect><path d="M7 11V7a5 5 0 0 1 10 0v4"></path></svg>
                  <input
                    type="text"
                    id="att-session-code"
                    v-model="form.sessionCode"
                    class="form-in session-code-in"
                    placeholder="Enter session code (e.g. 482913)"
                    @input="onSessionCodeInput"
                    @keyup.enter.prevent="handleVerifySession"
                  />
                  <button v-if="form.sessionCode" type="button" @click="clearSessionCode" class="clear-session-btn" title="Clear">✕</button>
                </div>

                <button
                  type="button"
                  class="btn-verify-session"
                  :disabled="isVerifying || !form.sessionCode"
                  @click="handleVerifySession"
                  id="btn-verify-session"
                >
                  <span v-if="isVerifying" class="spinner-xs"></span>
                  <span v-else>Verify & Auto-Fill</span>
                </button>
              </div>

              <!-- Available / Recent Sessions for this Course -->
              <div v-if="courseSessions.length > 0" class="recent-sessions-box">
                <span class="recent-title">Recent sessions for {{ activeCourse.courseCode }}:</span>
                <div class="recent-chips">
                  <button
                    v-for="s in courseSessions"
                    :key="s.id || s.pin"
                    type="button"
                    class="recent-chip"
                    :class="{ active: form.sessionCode === s.pin }"
                    @click="selectRecentSession(s)"
                    title="Click to apply this session code"
                  >
                    <span class="chip-code">#{{ s.pin }}</span>
                    <span class="chip-meta">{{ s.date }} · {{ s.time }}</span>
                  </button>
                </div>
              </div>

              <!-- Verified Session Banner -->
              <div v-if="verifiedSession" class="verified-session-card">
                <div class="v-card-icon">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="20 6 9 17 4 12"/></svg>
                </div>
                <div class="v-card-body">
                  <p class="v-card-title">
                    Session <strong>#{{ verifiedSession.pin }}</strong> Verified for {{ verifiedSession.courseCode || activeCourse.courseCode }}
                  </p>
                  <p class="v-card-sub">
                    <span>📅 Created: <strong>{{ verifiedSession.date }}</strong> at <strong>{{ verifiedSession.time }}</strong></span>
                    <span v-if="verifiedSession.lecturerName"> • Lecturer: <strong>{{ verifiedSession.lecturerName }}</strong></span>
                  </p>
                </div>
                <span class="v-card-badge">Date & Time Synced</span>
              </div>

              <p v-if="sessionError" class="session-error-msg">{{ sessionError }}</p>
            </div>

            <!-- Date & Time (Auto-retrieved from Session) -->
            <div class="form-row">
              <div class="form-group">
                <label for="att-date">
                  Date *
                  <span v-if="verifiedSession" class="sync-tag">Auto-retrieved</span>
                </label>
                <input type="date" id="att-date" v-model="form.date" class="form-in" :max="todayStr" required/>
              </div>
              <div class="form-group">
                <label for="att-time">
                  Time *
                  <span v-if="verifiedSession" class="sync-tag">Auto-retrieved</span>
                </label>
                <input type="time" id="att-time" v-model="form.time" class="form-in" required/>
              </div>
            </div>

            <!-- Status -->
            <div class="form-group">
              <label>Lecturer Status *</label>
              <div class="status-options">
                <label
                  v-for="opt in statusOptions"
                  :key="opt.value"
                  class="status-opt"
                  :class="[`opt-${opt.value}`, { selected: form.status === opt.value }]"
                >
                  <input type="radio" :value="opt.value" v-model="form.status" class="sr-only"/>
                  <span class="opt-icon">{{ opt.icon }}</span>
                  <span class="opt-label">{{ opt.label }}</span>
                </label>
              </div>
            </div>

            <!-- Notes -->
            <div class="form-group">
              <label for="att-notes">Notes <span class="optional">(optional)</span></label>
              <textarea id="att-notes" v-model="form.notes" class="form-ta" rows="2" placeholder="Any remarks regarding lecturer attendance, arrival time, or topic…"></textarea>
            </div>

            <p v-if="formError" class="form-error">{{ formError }}</p>
            <p v-if="formSuccess" class="form-success">✅ {{ formSuccess }}</p>

            <button type="submit" class="btn-submit" :disabled="store.isLoading || !form.status" id="btn-save-attendance">
              <span v-if="store.isLoading">Saving…</span>
              <span v-else>Save Attendance Record</span>
            </button>
          </form>
        </div>

        <!-- Right: History -->
        <div class="panel history-panel">
          <div class="panel-head">
            <div class="panel-icon">📊</div>
            <div>
              <h2>Attendance History</h2>
              <p class="panel-sub">Past records for {{ activeCourse.courseCode }}</p>
            </div>
          </div>

          <!-- Summary Pills -->
          <div class="history-summary" v-if="history.length">
            <div class="summary-pill pill-present">
              <span class="pill-num">{{ countStatus('present') }}</span>
              <span class="pill-lbl">Present</span>
            </div>
            <div class="summary-pill pill-late">
              <span class="pill-num">{{ countStatus('late') }}</span>
              <span class="pill-lbl">Late</span>
            </div>
            <div class="summary-pill pill-absent">
              <span class="pill-num">{{ countStatus('absent') }}</span>
              <span class="pill-lbl">Absent</span>
            </div>
            <div class="summary-pill pill-total">
              <span class="pill-num">{{ history.length }}</span>
              <span class="pill-lbl">Total</span>
            </div>
          </div>

          <div v-if="histLoading" class="hist-loading">
            <div class="spinner"></div> Loading history…
          </div>
          <div v-else-if="history.length === 0" class="hist-empty">
            <p>No records yet for this course.</p>
          </div>
          <div v-else class="history-list">
            <div
              v-for="rec in history"
              :key="rec.id"
              class="history-item"
              :class="`hist-${rec.status}`"
            >
              <div class="hist-status-icon">{{ statusIcon(rec.status) }}</div>
              <div class="hist-body">
                <div class="hist-top">
                  <span class="hist-date">{{ formatDate(rec.date) }}</span>
                  <span class="hist-time">🕐 {{ formatTime(rec.time) }}</span>
                  <span class="hist-badge" :class="`badge-${rec.status}`">{{ rec.status }}</span>
                </div>
                <p v-if="rec.notes" class="hist-notes">{{ rec.notes }}</p>
                <p class="hist-by">Marked by {{ rec.markedBy }}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </template>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue';
import { useClassRepStore } from '@/stores/classrep.js';

const store = useClassRepStore();
const isLoading = ref(true);
const histLoading = ref(false);
const activeCourseId = ref('');
const formError = ref('');
const formSuccess = ref('');

const todayStr = new Date().toISOString().split('T')[0];
const now = new Date();
const currentDate = now.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });

const form = ref({
  sessionCode: '',
  date: todayStr,
  time: `${String(now.getHours()).padStart(2,'0')}:${String(now.getMinutes()).padStart(2,'0')}`,
  status: '',
  notes: '',
});

const isVerifying = ref(false);
const verifiedSession = ref(null);
const sessionError = ref('');
const courseSessions = ref([]);

const statusOptions = [
  { value: 'present', label: 'Present', icon: '✅' },
  { value: 'late',    label: 'Late',    icon: '🕐' },
  { value: 'absent',  label: 'Absent',  icon: '❌' },
];

onMounted(async () => {
  await store.fetchMyRoles();
  isLoading.value = false;
  if (store.myRoles.length > 0) {
    await switchCourse(store.myRoles[0].courseId);
  }
});

const activeCourse = computed(() => store.myRoles.find(r => r.courseId === activeCourseId.value));
const history = computed(() => store.attendanceHistory[activeCourseId.value] || []);

async function switchCourse(courseId) {
  activeCourseId.value = courseId;
  formError.value = '';
  formSuccess.value = '';
  sessionError.value = '';
  verifiedSession.value = null;
  form.value.sessionCode = '';
  histLoading.value = true;

  await Promise.allSettled([
    store.fetchAttendanceHistory(courseId),
    loadCourseSessions(courseId)
  ]);

  histLoading.value = false;
}

async function loadCourseSessions(courseId) {
  try {
    courseSessions.value = await store.fetchCourseSessions(courseId);
  } catch (err) {
    console.warn('Error loading course sessions:', err);
    courseSessions.value = [];
  }
}

function onSessionCodeInput() {
  sessionError.value = '';
  if (verifiedSession.value && verifiedSession.value.pin !== form.value.sessionCode) {
    verifiedSession.value = null;
  }
}

async function handleVerifySession() {
  if (!form.value.sessionCode || !form.value.sessionCode.trim()) {
    sessionError.value = 'Please enter a session code to verify.';
    return;
  }
  sessionError.value = '';
  isVerifying.value = true;

  try {
    const session = await store.verifySessionCode(form.value.sessionCode, activeCourseId.value);
    verifiedSession.value = session;
    // Auto-populate date and time from the verified session creation!
    if (session.date) form.value.date = session.date;
    if (session.time) form.value.time = session.time;
  } catch (err) {
    verifiedSession.value = null;
    sessionError.value = err.message || 'Could not verify session code for this course.';
  } finally {
    isVerifying.value = false;
  }
}

function selectRecentSession(s) {
  form.value.sessionCode = s.pin;
  verifiedSession.value = s;
  sessionError.value = '';
  if (s.date) form.value.date = s.date;
  if (s.time) form.value.time = s.time;
}

function clearSessionCode() {
  form.value.sessionCode = '';
  verifiedSession.value = null;
  sessionError.value = '';
}

async function submitAttendance() {
  formError.value = '';
  formSuccess.value = '';
  if (!form.value.status) { formError.value = 'Please select a status.'; return; }

  try {
    const result = await store.markLecturerAttendance({
      courseId: activeCourseId.value,
      sessionCode: form.value.sessionCode || null,
      date: form.value.date,
      time: form.value.time,
      status: form.value.status,
      notes: form.value.notes,
    });
    formSuccess.value = result.message || 'Attendance recorded successfully!';
    form.value.status = '';
    form.value.notes = '';
    setTimeout(() => (formSuccess.value = ''), 4000);
  } catch (err) {
    formError.value = err.message || 'Failed to record attendance.';
  }
}

function countStatus(s) { return history.value.filter(r => r.status === s).length; }
function statusIcon(s) { return s === 'present' ? '✅' : s === 'late' ? '🕐' : '❌'; }
function formatDate(d) {
  if (!d) return '—';
  return new Date(d + 'T00:00:00').toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' });
}
function formatTime(t) {
  if (!t) return '—';
  const [h, m] = t.split(':').map(Number);
  const ap = h >= 12 ? 'PM' : 'AM';
  return `${h % 12 || 12}:${String(m).padStart(2, '0')} ${ap}`;
}
</script>

<style scoped>
* { font-family: 'Inter', sans-serif; box-sizing: border-box; }
.classrep-dash { display: flex; flex-direction: column; gap: 1.75rem; width: 100%; }

/* Header */
.dash-header { display: flex; justify-content: space-between; align-items: flex-start; flex-wrap: wrap; gap: 1rem; }
.title-row { display: flex; align-items: center; gap: 0.75rem; margin-bottom: 0.25rem; flex-wrap: wrap; }
.cr-badge { background: linear-gradient(135deg,#8b5cf6,#6d28d9); color: #fff; font-size: 0.72rem; font-weight: 700; padding: 0.25rem 0.65rem; border-radius: 20px; letter-spacing: 0.04em; }
.page-title { margin: 0; font-size: 1.75rem; font-weight: 700; color: #0f172a; letter-spacing: -0.025em; }
.page-subtitle { margin: 0; font-size: 0.9rem; color: #64748b; }

.loading-state { display: flex; align-items: center; gap: 1rem; padding: 3rem; justify-content: center; color: #64748b; }
.spinner { width: 20px; height: 20px; border: 2px solid #e2e8f0; border-top-color: #8b5cf6; border-radius: 50%; animation: spin 0.7s linear infinite; }
@keyframes spin { to { transform: rotate(360deg); } }

.empty-state { display: flex; flex-direction: column; align-items: center; padding: 5rem 1rem; background: #fff; border-radius: 16px; border: 1px solid #e2e8f0; text-align: center; gap: 0.75rem; }
.empty-icon { font-size: 3rem; }
.empty-state h3 { margin: 0; color: #1e293b; font-size: 1.1rem; }
.empty-state p { margin: 0; color: #64748b; font-size: 0.9rem; max-width: 360px; }

/* Course Tabs */
.course-tabs { display: flex; gap: 0.6rem; flex-wrap: wrap; }
.tab-btn { display: flex; flex-direction: column; align-items: flex-start; gap: 0.1rem; background: #fff; border: 1.5px solid #e2e8f0; border-radius: 12px; padding: 0.65rem 1.1rem; cursor: pointer; transition: all 0.2s; }
.tab-btn.active { border-color: #8b5cf6; background: #f5f3ff; box-shadow: 0 2px 8px rgba(139,92,246,.15); }
.tab-btn:hover:not(.active) { border-color: #c4b5fd; }
.tab-code { font-size: 0.78rem; font-weight: 700; color: #6d28d9; }
.tab-name { font-size: 0.8rem; color: #334155; white-space: nowrap; max-width: 160px; overflow: hidden; text-overflow: ellipsis; }

/* Content Grid */
.content-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 1.5rem; }

/* Panel */
.panel { background: #fff; border-radius: 16px; padding: 1.5rem; border: 1px solid #f1f5f9; box-shadow: 0 2px 8px rgba(0,0,0,.04); display: flex; flex-direction: column; gap: 1.25rem; }
.panel-head { display: flex; align-items: flex-start; gap: 0.85rem; }
.panel-icon { font-size: 1.5rem; flex-shrink: 0; }
.panel-head h2 { margin: 0; font-size: 1rem; font-weight: 700; color: #0f172a; }
.panel-sub { margin: 0.15rem 0 0; font-size: 0.8rem; color: #64748b; }

/* Schedule Info */
.schedule-info { display: flex; flex-direction: column; gap: 0.5rem; }
.schedule-chip { display: flex; align-items: center; gap: 0.5rem; font-size: 0.82rem; color: #475569; background: #f8fafc; border-radius: 8px; padding: 0.5rem 0.75rem; border: 1px solid #f1f5f9; }
.schedule-chip svg { width: 14px; height: 14px; flex-shrink: 0; color: #8b5cf6; }

/* Form */
.mark-form { display: flex; flex-direction: column; gap: 1.1rem; }
.form-row { display: grid; grid-template-columns: 1fr 1fr; gap: 0.85rem; }
.form-group { display: flex; flex-direction: column; gap: 0.35rem; }
.form-group label { font-size: 0.8rem; font-weight: 600; color: #475569; }
.optional { font-weight: 400; color: #94a3b8; }
.form-in { padding: 0.6rem 0.85rem; border: 1.5px solid #e2e8f0; border-radius: 10px; font-size: 0.875rem; color: #334155; outline: none; transition: border-color 0.2s; width: 100%; }
.form-in:focus { border-color: #8b5cf6; }
.form-ta { padding: 0.65rem 0.85rem; border: 1.5px solid #e2e8f0; border-radius: 10px; font-size: 0.875rem; color: #334155; outline: none; resize: vertical; width: 100%; font-family: inherit; transition: border-color 0.2s; }
.form-ta:focus { border-color: #8b5cf6; }

/* Session Code Section */
.session-code-group {
  background: #f8fafc;
  border: 1px solid #e2e8f0;
  border-radius: 12px;
  padding: 0.85rem;
  display: flex;
  flex-direction: column;
  gap: 0.65rem;
}

.session-input-row {
  display: flex;
  gap: 0.6rem;
  align-items: center;
}

.session-input-wrapper {
  position: relative;
  flex: 1;
  display: flex;
  align-items: center;
}

.session-code-in {
  font-family: 'JetBrains Mono', 'Fira Code', monospace, sans-serif;
  font-size: 0.95rem;
  font-weight: 600;
  letter-spacing: 0.05em;
  padding-right: 2rem;
  background: #fff;
}

.clear-session-btn {
  position: absolute;
  right: 8px;
  background: none;
  border: none;
  color: #94a3b8;
  font-size: 0.85rem;
  cursor: pointer;
  padding: 4px;
  line-height: 1;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: color 0.15s;
}
.clear-session-btn:hover {
  color: #475569;
}

.btn-verify-session {
  background: #ede9fe;
  color: #6d28d9;
  border: 1.5px solid #c4b5fd;
  border-radius: 10px;
  padding: 0.6rem 0.9rem;
  font-size: 0.82rem;
  font-weight: 600;
  cursor: pointer;
  white-space: nowrap;
  transition: all 0.2s;
  display: flex;
  align-items: center;
  justify-content: center;
}
.btn-verify-session:hover:not(:disabled) {
  background: #ddd6fe;
  border-color: #8b5cf6;
}
.btn-verify-session:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.spinner-xs {
  width: 14px;
  height: 14px;
  border: 2px solid #c4b5fd;
  border-top-color: #6d28d9;
  border-radius: 50%;
  animation: spin 0.7s linear infinite;
  display: inline-block;
}

/* Recent Sessions Box */
.recent-sessions-box {
  display: flex;
  flex-direction: column;
  gap: 0.35rem;
  padding-top: 0.35rem;
  border-top: 1px dashed #e2e8f0;
}
.recent-title {
  font-size: 0.73rem;
  color: #64748b;
  font-weight: 500;
}
.recent-chips {
  display: flex;
  flex-wrap: wrap;
  gap: 0.45rem;
}
.recent-chip {
  display: inline-flex;
  align-items: center;
  gap: 0.4rem;
  background: #fff;
  border: 1px solid #cbd5e1;
  border-radius: 7px;
  padding: 0.25rem 0.55rem;
  font-size: 0.75rem;
  cursor: pointer;
  transition: all 0.15s;
  color: #334155;
}
.recent-chip:hover {
  border-color: #8b5cf6;
  background: #f5f3ff;
}
.recent-chip.active {
  border-color: #7c3aed;
  background: #ede9fe;
  color: #6d28d9;
  font-weight: 600;
}
.chip-code {
  font-family: monospace;
  font-weight: 700;
  color: #6d28d9;
}
.chip-meta {
  color: #64748b;
  font-size: 0.7rem;
}

/* Verified Session Card */
.verified-session-card {
  display: flex;
  align-items: center;
  gap: 0.65rem;
  background: #f0fdf4;
  border: 1.5px solid #86efac;
  border-radius: 10px;
  padding: 0.6rem 0.85rem;
}
.v-card-icon {
  width: 28px;
  height: 28px;
  background: #22c55e;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  color: #fff;
}
.v-card-icon svg {
  width: 16px;
  height: 16px;
}
.v-card-body {
  flex: 1;
  min-width: 0;
}
.v-card-title {
  margin: 0;
  font-size: 0.8rem;
  font-weight: 600;
  color: #14532d;
}
.v-card-sub {
  margin: 0.15rem 0 0;
  font-size: 0.74rem;
  color: #166534;
  display: flex;
  flex-wrap: wrap;
  gap: 0.4rem;
}
.v-card-badge {
  background: #22c55e;
  color: #fff;
  font-size: 0.65rem;
  font-weight: 700;
  padding: 0.2rem 0.5rem;
  border-radius: 6px;
  text-transform: uppercase;
  letter-spacing: 0.04em;
  white-space: nowrap;
}

.sync-tag {
  margin-left: 0.4rem;
  font-size: 0.65rem;
  font-weight: 600;
  color: #15803d;
  background: #dcfce7;
  padding: 0.1rem 0.4rem;
  border-radius: 4px;
}

.session-error-msg {
  margin: 0;
  font-size: 0.78rem;
  color: #b91c1c;
  background: #fee2e2;
  border: 1px solid #fca5a5;
  padding: 0.45rem 0.65rem;
  border-radius: 8px;
}

/* Status options */
.status-options { display: grid; grid-template-columns: repeat(3, 1fr); gap: 0.65rem; }
.status-opt { display: flex; flex-direction: column; align-items: center; gap: 0.35rem; padding: 0.85rem 0.5rem; border-radius: 12px; border: 1.5px solid #e2e8f0; cursor: pointer; transition: all 0.2s; text-align: center; }
.status-opt:hover { border-color: #c4b5fd; background: #faf5ff; }
.status-opt.selected { border-color: #8b5cf6; background: #f5f3ff; box-shadow: 0 2px 8px rgba(139,92,246,.15); }
.opt-present.selected { border-color: #10b981; background: #f0fdf4; }
.opt-late.selected    { border-color: #f59e0b; background: #fffbeb; }
.opt-absent.selected  { border-color: #ef4444; background: #fff1f2; }
.opt-icon { font-size: 1.5rem; }
.opt-label { font-size: 0.78rem; font-weight: 600; color: #334155; }
.sr-only { position: absolute; width: 1px; height: 1px; overflow: hidden; clip: rect(0,0,0,0); }

.form-error { color: #b91c1c; font-size: 0.82rem; margin: 0; background: #fee2e2; padding: 0.5rem 0.75rem; border-radius: 8px; }
.form-success { color: #15803d; font-size: 0.82rem; margin: 0; background: #dcfce7; padding: 0.5rem 0.75rem; border-radius: 8px; }

.btn-submit { background: linear-gradient(135deg,#8b5cf6,#6d28d9); color: #fff; border: none; padding: 0.75rem 1.5rem; border-radius: 12px; font-weight: 700; font-size: 0.9rem; cursor: pointer; transition: all 0.2s; box-shadow: 0 4px 12px rgba(109,40,217,.25); }
.btn-submit:disabled { opacity: 0.5; cursor: not-allowed; }
.btn-submit:not(:disabled):hover { transform: translateY(-1px); box-shadow: 0 6px 16px rgba(109,40,217,.35); }

/* History */
.history-summary { display: flex; gap: 0.65rem; flex-wrap: wrap; }
.summary-pill { display: flex; flex-direction: column; align-items: center; gap: 0.15rem; padding: 0.65rem 1rem; border-radius: 10px; border: 1px solid transparent; flex: 1; min-width: 60px; text-align: center; }
.pill-num { font-size: 1.4rem; font-weight: 700; }
.pill-lbl { font-size: 0.68rem; font-weight: 600; text-transform: uppercase; letter-spacing: 0.04em; }
.pill-present { background: #f0fdf4; border-color: #bbf7d0; color: #15803d; }
.pill-late    { background: #fffbeb; border-color: #fde68a; color: #a16207; }
.pill-absent  { background: #fff1f2; border-color: #fecdd3; color: #b91c1c; }
.pill-total   { background: #f8fafc; border-color: #e2e8f0; color: #334155; }

.hist-loading { display: flex; align-items: center; gap: 0.75rem; color: #64748b; font-size: 0.9rem; padding: 1rem 0; }
.hist-empty { color: #94a3b8; font-size: 0.9rem; text-align: center; padding: 2rem 0; }

.history-list { display: flex; flex-direction: column; gap: 0.7rem; max-height: 420px; overflow-y: auto; padding-right: 4px; }
.history-item { display: flex; align-items: flex-start; gap: 0.85rem; padding: 0.9rem 1rem; border-radius: 12px; border: 1px solid transparent; }
.hist-present { background: #f0fdf4; border-color: #bbf7d0; }
.hist-late    { background: #fffbeb; border-color: #fde68a; }
.hist-absent  { background: #fff1f2; border-color: #fecdd3; }
.hist-status-icon { font-size: 1.3rem; flex-shrink: 0; line-height: 1.4; }
.hist-body { flex: 1; min-width: 0; }
.hist-top { display: flex; align-items: center; gap: 0.5rem; flex-wrap: wrap; margin-bottom: 0.25rem; }
.hist-date { font-size: 0.82rem; font-weight: 600; color: #1e293b; }
.hist-time { font-size: 0.75rem; color: #64748b; }
.hist-badge { font-size: 0.65rem; font-weight: 700; text-transform: uppercase; letter-spacing: 0.05em; padding: 0.1rem 0.45rem; border-radius: 5px; }
.badge-present { background: #dcfce7; color: #15803d; }
.badge-late    { background: #fef9c3; color: #a16207; }
.badge-absent  { background: #fee2e2; color: #b91c1c; }
.hist-notes { margin: 0 0 0.2rem; font-size: 0.8rem; color: #475569; font-style: italic; }
.hist-by    { margin: 0; font-size: 0.72rem; color: #94a3b8; }

@media (max-width: 900px) {
  .content-grid { grid-template-columns: 1fr; }
}
@media (max-width: 600px) {
  .status-options { grid-template-columns: repeat(3, 1fr); }
  .form-row { grid-template-columns: 1fr; }
}
</style>
