<template>
  <div class="attendance-container">
    <!-- No Course Selected -->
    <div v-if="!courseId" class="empty-course-state">
      <div class="empty-icon-wrap">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M13 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V9z"></path><polyline points="13 2 13 9 20 9"></polyline></svg>
      </div>
      <h2>No Course Selected</h2>
      <p>Please select a course from "My Courses" to manage its attendance.</p>
      <button class="primary-btn" @click="$emit('navigate', '/lecturer-courses')">Go to My Courses</button>
    </div>

    <div v-else class="attendance-content-wrapper">
      <!-- Header -->
      <div class="page-header">
        <div class="header-left">
          <button class="back-btn" @click="$emit('navigate', '/lecturer-courses')">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="19" y1="12" x2="5" y2="12"></line><polyline points="12 19 5 12 12 5"></polyline></svg>
            Back to Courses
          </button>
          <div class="title-wrap">
            <h1 class="page-title">Attendance Management</h1>
            <p class="page-subtitle"><span class="semester-tag">{{ courseSemester }}</span> {{ courseCode }} — {{ courseName }}</p>
          </div>
        </div>
      </div>

      <!-- === CLASS IN SESSION BANNER === -->
      <div v-if="liveAttendanceSession.isActive" class="session-live-banner">
        <div class="banner-left">
          <span class="live-pill"><span class="pulse-dot"></span>CLASS IN SESSION</span>
          <span class="banner-course-name">{{ courseCode }} — {{ courseName }}</span>
        </div>
        <div class="banner-stats">
          <div class="bstat"><span class="bstat-num">{{ checkedInStudents.length }}</span><span class="bstat-lbl">Checked In</span></div>
          <div class="bstat-div"></div>
          <div class="bstat"><span class="bstat-num">{{ liveAttendanceSession.maxStudents }}</span><span class="bstat-lbl">Expected</span></div>
          <div class="bstat-div"></div>
          <div class="bstat" :class="{'danger-stat': timeLeft <= 15}"><span class="bstat-num">{{ timeLeft }}s</span><span class="bstat-lbl">Remaining</span></div>
        </div>
      </div>

      <!-- === ACTIVE SESSION: split layout === -->
      <div v-if="liveAttendanceSession.isActive" class="session-split">
        <!-- Left: PIN + Ring -->
        <div class="pin-panel card">
          <div class="card-header"><h2>Session PIN</h2></div>
          <div class="pin-panel-body">
            <div class="ring-wrap">
              <svg viewBox="0 0 160 160" width="160" height="160">
                <circle class="ring-track" cx="80" cy="80" r="66" />
                <circle class="ring-fill" cx="80" cy="80" r="66"
                  :stroke-dasharray="circumference"
                  :stroke-dashoffset="strokeOffset"
                  :class="{ 'ring-danger': timeLeft <= 15 }"
                  transform="rotate(-90 80 80)" />
              </svg>
              <div class="ring-center">
                <span class="ring-label">PIN</span>
                <div class="ring-pin">{{ liveAttendanceSession.pin }}</div>
                <span class="ring-time" :class="{ 'time-danger': timeLeft <= 15 }">{{ timeLeft }}s</span>
              </div>
            </div>
            <div class="session-btns">
              <button class="extend-btn" @click="extendTimer(15)">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg>
                +15s
              </button>
              <button class="danger-btn" @click="stopLiveSession">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="18" height="18" rx="2"></rect></svg>
                End Session
              </button>
            </div>
            <p class="share-hint">Share this PIN with students present in class</p>
          </div>
        </div>

        <!-- Right: Live check-in list -->
        <div class="checkin-panel card">
          <div class="card-header">
            <h2>Live Check-ins</h2>
            <span class="count-badge">{{ checkedInStudents.length }}/{{ liveAttendanceSession.maxStudents }}</span>
          </div>
          <div class="checkin-progress-wrap">
            <div class="checkin-progress" :style="{ width: progressPct + '%' }"></div>
          </div>
          <div class="checkin-list" v-if="checkedInStudents.length > 0">
            <div class="checkin-item" v-for="(s, i) in checkedInStudents" :key="s.id">
              <span class="ci-num">{{ i + 1 }}</span>
              <div class="ci-avatar">{{ s.name.charAt(0) }}</div>
              <div class="ci-info"><span class="ci-name">{{ s.name }}</span><span class="ci-time">{{ formatTime(s.timestamp) }}</span></div>
              <span class="ci-badge">Present</span>
            </div>
          </div>
          <div class="waiting-state" v-else>
            <div class="dots-wrap"><span class="dot"></span><span class="dot"></span><span class="dot"></span></div>
            <p>Waiting for students to check in…</p>
          </div>
        </div>
      </div>

      <!-- === SETUP SESSION: not active === -->
      <div v-else class="setup-panel card">
        <div class="card-header"><h2>Start Attendance Session</h2></div>
        <div class="setup-body">
          <p class="setup-hint">Select students physically present, then start the session to generate a secure 4-digit PIN.</p>

          <div class="student-selection-list">
            <div class="list-header">
              <h3>Class List ({{ selectedStudents.length }}/{{ enrolledStudents.length }} selected)</h3>
              <button class="btn-sm outline-btn" @click="toggleSelectAll">{{ selectedStudents.length === enrolledStudents.length ? 'Deselect All' : 'Select All' }}</button>
            </div>
            <div v-if="enrolledStudents.length === 0" class="no-students">No students enrolled in this course yet.</div>
            <div class="students-grid">
              <label v-for="student in enrolledStudents" :key="student.id" class="student-checkbox-card" :class="{ selected: selectedStudents.includes(student.id) }">
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

          <div v-if="startError" class="error-banner">{{ startError }}</div>

          <div class="start-controls">
            <button class="start-btn" @click="startLiveSession" :disabled="selectedStudents.length === 0 || isStarting">
              <svg v-if="isStarting" class="spin" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10" stroke-dasharray="31" stroke-dashoffset="10"></circle></svg>
              <svg v-else viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polygon points="5 3 19 12 5 21 5 3"></polygon></svg>
              {{ isStarting ? 'Starting…' : 'Start Class Session' }}
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue';
import { storeToRefs } from 'pinia';
import { useAuthStore } from '@/stores/authstore';
import { useSessionsStore } from '@/stores/sessions';
import { useAttendancesStore } from '@/stores/attendances';
import { useEnrollmentsStore } from '@/stores/enrollments';
import { supabase } from '@/stores/supabase';

const emit = defineEmits(['navigate']);

const authStore = useAuthStore();
const sessionsStore = useSessionsStore();
const attendancesStore = useAttendancesStore();
const enrollmentsStore = useEnrollmentsStore();

const { profile } = storeToRefs(authStore);
const { attendances } = storeToRefs(attendancesStore);

const courseId = ref(localStorage.getItem('activeCourseId') || '');
const courseCode = ref(localStorage.getItem('activeCourseCode') || '');
const courseName = ref(localStorage.getItem('activeCourseName') || '');
const courseSemester = ref(localStorage.getItem('activeCourseSemester') || 'Semester 1');

const enrolledStudents = ref([]);
const selectedStudents = ref([]);
const liveAttendanceSession = ref({ isActive: false });
const timeLeft = ref(60);
const totalTime = ref(60);
const isStarting = ref(false);
const startError = ref('');

let timerInterval = null;

const circumference = 2 * Math.PI * 66; // r=66
const strokeOffset = computed(() => circumference * (1 - timeLeft.value / totalTime.value));
const progressPct = computed(() =>
  liveAttendanceSession.value.maxStudents > 0
    ? Math.min(100, (checkedInStudents.value.length / liveAttendanceSession.value.maxStudents) * 100)
    : 0
);

const formatTime = (ts) => new Date(ts).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });

// Live check-ins for the active session, joined with student names/ids
// already loaded in enrolledStudents (attendances only carry studentId).
const checkedInStudents = computed(() => {
  if (!liveAttendanceSession.value.id) return [];

  return attendances.value
    .filter((a) => a.sessionId === liveAttendanceSession.value.id && a.status === 'present')
    .map((a) => {
      const student = enrolledStudents.value.find((s) => s.id === a.studentId);
      return {
        id: a.id,
        studentId: a.studentId,
        name: student?.name ?? 'Unknown student',
        timestamp: a.timestamp,
      };
    })
    .sort((x, y) => new Date(x.timestamp) - new Date(y.timestamp));
});

onMounted(async () => {
  if (courseId.value) {
    try {
      const studentIds = enrollmentsStore
        .enrollmentsByCourse(courseId.value)
        .map((e) => e.studentId);

      if (studentIds.length > 0) {
        const { data, error } = await supabase
          .from('users')
          .select('id, name, id_number')
          .in('id', studentIds)
          .order('name');

        if (error) throw error;

        enrolledStudents.value = (data ?? []).map((u) => ({
          id: u.id,
          name: u.name,
          studentId: u.id_number,
        }));
      }
    } catch (e) {
      console.error(e);
    }
  }

  // Realtime feed of attendance inserts replaces the old polling loop.
  attendancesStore.subscribeToAttendances();
});

const toggleSelectAll = () => {
  selectedStudents.value = selectedStudents.value.length === enrolledStudents.value.length
    ? []
    : enrolledStudents.value.map(s => s.id);
};

const startLiveSession = async () => {
  startError.value = '';
  isStarting.value = true;
  try {
    const created = await sessionsStore.createSession({
      courseId: courseId.value,
      lecturerId: profile.value?.id,
      maxStudents: selectedStudents.value.length,
      isActive: true,
    });

    totalTime.value = 60;
    timeLeft.value = 60;
    liveAttendanceSession.value = {
      id: created.id,
      isActive: true,
      pin: created.pin,
      maxStudents: selectedStudents.value.length,
    };

    if (timerInterval) clearInterval(timerInterval);
    timerInterval = setInterval(() => {
      if (timeLeft.value > 0) { timeLeft.value--; }
      else { stopLiveSession(); }
    }, 1000);
  } catch (e) {
    startError.value = e.message || 'Failed to start session.';
  } finally {
    isStarting.value = false;
  }
};

const stopLiveSession = async () => {
  clearInterval(timerInterval); timerInterval = null;
  try {
    if (liveAttendanceSession.value.id) {
      await sessionsStore.closeSession(liveAttendanceSession.value.id);
    }
  } catch (e) {
    console.error(e);
  }
  liveAttendanceSession.value = { isActive: false };
};

const extendTimer = (secs) => { if (liveAttendanceSession.value.isActive) timeLeft.value += secs; };

onUnmounted(() => {
  clearInterval(timerInterval);
  attendancesStore.unsubscribeFromAttendances();
});
</script>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap');
* { font-family: 'Inter', sans-serif; box-sizing: border-box; }

.attendance-container { display: flex; flex-direction: column; gap: 1.5rem; width: 100%; }
.attendance-content-wrapper { display: flex; flex-direction: column; gap: 1.5rem; }

/* Empty state */
.empty-course-state { display:flex;flex-direction:column;align-items:center;justify-content:center;padding:6rem 2rem;background:white;border-radius:16px;border:1px dashed #cbd5e1;text-align:center; }
.empty-icon-wrap { width:80px;height:80px;background:#f8fafc;border-radius:50%;display:flex;align-items:center;justify-content:center;color:#94a3b8;margin-bottom:1.5rem; }
.empty-icon-wrap svg { width:40px;height:40px; }
.empty-course-state h2 { margin:0 0 0.5rem;color:#0f172a; }
.empty-course-state p { color:#64748b;margin-bottom:2rem; }

/* Header */
.page-header { display:flex;justify-content:space-between;align-items:flex-end;border-bottom:1px solid #e2e8f0;padding-bottom:1.5rem; }
.header-left { display:flex;flex-direction:column;gap:1rem; }
.back-btn { display:flex;align-items:center;gap:0.5rem;background:none;border:none;color:#64748b;font-weight:600;font-size:0.9rem;cursor:pointer;padding:0;transition:color 0.2s;align-self:flex-start; }
.back-btn:hover { color:#0f172a; }
.back-btn svg { width:16px;height:16px; }
.title-wrap { display:flex;flex-direction:column;gap:0.25rem; }
.page-title { margin:0;font-size:1.85rem;font-weight:800;color:#0f172a;letter-spacing:-0.025em; }
.page-subtitle { margin:0;font-size:1rem;color:#6366f1;font-weight:600;display:flex;align-items:center;gap:0.5rem; }
.semester-tag { background:#e0e7ff;color:#4338ca;font-size:0.75rem;padding:0.2rem 0.5rem;border-radius:6px;font-weight:700; }

/* Live Banner */
.session-live-banner { background:linear-gradient(135deg,#0f172a 0%,#1e293b 100%);border-radius:16px;padding:1.25rem 1.75rem;display:flex;justify-content:space-between;align-items:center;gap:1rem; }
.banner-left { display:flex;align-items:center;gap:1.25rem; }
.live-pill { display:flex;align-items:center;gap:8px;background:rgba(239,68,68,0.15);border:1px solid rgba(239,68,68,0.3);color:#fca5a5;padding:0.4rem 0.9rem;border-radius:9999px;font-size:0.75rem;font-weight:700;letter-spacing:0.06em;white-space:nowrap; }
.pulse-dot { width:8px;height:8px;background:#ef4444;border-radius:50%;animation:pulseRed 1.5s infinite; }
@keyframes pulseRed { 0%,100%{opacity:1}50%{opacity:0.3} }
.banner-course-name { color:#f1f5f9;font-weight:600;font-size:1rem; }
.banner-stats { display:flex;align-items:center;gap:1.5rem; }
.bstat { display:flex;flex-direction:column;align-items:center;gap:2px; }
.bstat-num { font-size:1.5rem;font-weight:800;color:#ffffff; }
.bstat-lbl { font-size:0.7rem;font-weight:600;color:#94a3b8;text-transform:uppercase;letter-spacing:0.05em; }
.bstat-div { width:1px;height:40px;background:rgba(255,255,255,0.1); }
.danger-stat .bstat-num { color:#fca5a5; }

/* Cards */
.card { background:#fff;border-radius:16px;box-shadow:0 4px 6px -1px rgba(0,0,0,0.05);border:1px solid #e2e8f0; }
.card-header { padding:1.25rem 1.5rem;border-bottom:1px solid #f1f5f9;display:flex;justify-content:space-between;align-items:center; }
.card-header h2 { margin:0;font-size:1.15rem;font-weight:700;color:#0f172a; }

/* Session Split */
.session-split { display:grid;grid-template-columns:300px 1fr;gap:1.5rem; }

/* PIN Panel */
.pin-panel-body { display:flex;flex-direction:column;align-items:center;padding:1.5rem;gap:1.25rem; }
.ring-wrap { position:relative;display:flex;align-items:center;justify-content:center; }
.ring-track { fill:none;stroke:#f1f5f9;stroke-width:8; }
.ring-fill { fill:none;stroke:#10b981;stroke-width:8;stroke-linecap:round;transition:stroke-dashoffset 1s linear,stroke 0.3s; }
.ring-danger { stroke:#ef4444; }
.ring-center { position:absolute;display:flex;flex-direction:column;align-items:center;gap:2px; }
.ring-label { font-size:0.65rem;font-weight:700;color:#94a3b8;letter-spacing:0.1em;text-transform:uppercase; }
.ring-pin { font-size:2rem;font-weight:800;color:#0f172a;letter-spacing:0.3em; }
.ring-time { font-size:0.85rem;font-weight:600;color:#64748b; }
.time-danger { color:#ef4444;font-weight:700; }
.session-btns { display:flex;gap:0.75rem;width:100%; }
.share-hint { font-size:0.8rem;color:#94a3b8;text-align:center;margin:0; }
.extend-btn,.danger-btn { flex:1;display:flex;align-items:center;justify-content:center;gap:0.5rem;padding:0.65rem 1rem;border-radius:8px;font-size:0.85rem;font-weight:600;cursor:pointer;transition:all 0.2s; }
.extend-btn svg,.danger-btn svg { width:16px;height:16px; }
.extend-btn { background:transparent;color:#4f46e5;border:1px solid #6366f1; }
.extend-btn:hover { background:#e0e7ff; }
.danger-btn { background:#ef4444;color:white;border:none; }
.danger-btn:hover { background:#dc2626; }

/* Checkin Panel */
.count-badge { background:#dcfce7;color:#166534;font-size:0.8rem;font-weight:700;padding:0.25rem 0.75rem;border-radius:9999px; }
.checkin-progress-wrap { height:4px;background:#f1f5f9;overflow:hidden; }
.checkin-progress { height:100%;background:#10b981;transition:width 0.5s ease; }
.checkin-list { max-height:420px;overflow-y:auto;display:flex;flex-direction:column; }
.checkin-item { display:flex;align-items:center;gap:0.75rem;padding:0.85rem 1.5rem;border-bottom:1px solid #f8fafc;transition:background 0.15s; }
.checkin-item:hover { background:#fafafa; }
.ci-num { font-size:0.75rem;color:#94a3b8;font-weight:600;width:20px;text-align:right; }
.ci-avatar { width:34px;height:34px;background:#e0e7ff;color:#4338ca;border-radius:50%;display:flex;align-items:center;justify-content:center;font-weight:700;font-size:0.9rem;flex-shrink:0; }
.ci-info { flex:1;display:flex;flex-direction:column;gap:2px; }
.ci-name { font-size:0.9rem;font-weight:600;color:#1e293b; }
.ci-time { font-size:0.75rem;color:#94a3b8; }
.ci-badge { background:#dcfce7;color:#166534;font-size:0.7rem;font-weight:700;padding:0.2rem 0.6rem;border-radius:9999px; }
.waiting-state { display:flex;flex-direction:column;align-items:center;justify-content:center;padding:3rem 1rem;gap:1rem; }
.waiting-state p { margin:0;color:#64748b;font-size:0.95rem; }
.dots-wrap { display:flex;gap:6px; }
.dot { width:8px;height:8px;background:#cbd5e1;border-radius:50%;animation:dotBounce 1.2s infinite; }
.dot:nth-child(2) { animation-delay:0.2s; }
.dot:nth-child(3) { animation-delay:0.4s; }
@keyframes dotBounce { 0%,60%,100%{transform:translateY(0)}30%{transform:translateY(-8px)} }

/* Setup Panel */
.setup-body { padding:1.5rem;display:flex;flex-direction:column;gap:1.25rem; }
.setup-hint { margin:0;color:#64748b;font-size:0.95rem; }
.student-selection-list { background:#f8fafc;border:1px solid #e2e8f0;border-radius:12px;padding:1.25rem; }
.list-header { display:flex;justify-content:space-between;align-items:center;margin-bottom:1rem; }
.list-header h3 { margin:0;font-size:1rem;color:#1e293b;font-weight:600; }
.no-students { text-align:center;color:#94a3b8;padding:2rem;font-style:italic; }
.btn-sm { padding:0.4rem 0.8rem;font-size:0.85rem;border-radius:6px;cursor:pointer;background:transparent;color:#475569;border:1px solid #cbd5e1;transition:all 0.2s; }
.btn-sm:hover { background:#f1f5f9;color:#0f172a; }
.outline-btn { background:transparent; }
.students-grid { display:grid;grid-template-columns:repeat(auto-fill,minmax(200px,1fr));gap:0.75rem;max-height:280px;overflow-y:auto; }
.student-checkbox-card { display:flex;align-items:center;gap:0.75rem;padding:0.75rem;background:white;border:1.5px solid #e2e8f0;border-radius:8px;cursor:pointer;transition:all 0.2s; }
.student-checkbox-card:hover { border-color:#cbd5e1; }
.student-checkbox-card.selected { border-color:#10b981;background:#ecfdf5; }
.student-checkbox-card input[type="checkbox"] { width:16px;height:16px;cursor:pointer;accent-color:#10b981; }
.student-info { display:flex;align-items:center;gap:0.6rem; }
.student-avatar { width:32px;height:32px;background:#e0e7ff;color:#4f46e5;border-radius:50%;display:flex;align-items:center;justify-content:center;font-weight:700;font-size:0.85rem;flex-shrink:0; }
.student-details { display:flex;flex-direction:column; }
.student-name { font-size:0.85rem;font-weight:600;color:#1e293b; }
.student-id { font-size:0.72rem;color:#64748b; }
.error-banner { background:#fee2e2;border:1px solid #fecaca;color:#991b1b;padding:0.75rem 1rem;border-radius:8px;font-size:0.875rem; }
.start-controls { display:flex;justify-content:flex-end; }
.start-btn { display:flex;align-items:center;gap:0.6rem;background:#10b981;color:white;border:none;padding:0.8rem 1.75rem;border-radius:10px;font-size:0.95rem;font-weight:700;cursor:pointer;transition:all 0.2s;box-shadow:0 4px 12px rgba(16,185,129,0.3); }
.start-btn:hover:not(:disabled) { background:#059669;transform:translateY(-1px); }
.start-btn:disabled { background:#cbd5e1;cursor:not-allowed;box-shadow:none; }
.start-btn svg { width:18px;height:18px; }
.spin { animation:spin 0.8s linear infinite; }
@keyframes spin { to { transform:rotate(360deg); } }

.primary-btn { background:#10b981;color:white;border:none;padding:0.75rem 1.5rem;border-radius:8px;font-weight:600;cursor:pointer;transition:background 0.2s; }
.primary-btn:hover { background:#059669; }

@media(max-width:900px) { .session-split { grid-template-columns:1fr; } }
@media(max-width:768px) {
  .session-live-banner { flex-direction:column;align-items:flex-start;gap:1rem; }
  .page-title { font-size:1.4rem; }
}
</style>
