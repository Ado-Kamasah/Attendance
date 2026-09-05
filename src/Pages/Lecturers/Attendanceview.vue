<template>
  <div class="attendance-container">
    <!-- No Course Selected -->
    <div v-if="!courseId" class="empty-course-state">
      <div class="empty-icon-wrap">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
          <path d="M13 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V9z"></path>
          <polyline points="13 2 13 9 20 9"></polyline>
        </svg>
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
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <line x1="19" y1="12" x2="5" y2="12"></line>
              <polyline points="12 19 5 12 12 5"></polyline>
            </svg>
            Back to Courses
          </button>
          <div class="title-wrap">
            <h1 class="page-title">Attendance</h1>
            <p class="page-subtitle">
              <span class="semester-tag">{{ courseSemester }}</span>
              <span class="semester-tag">{{ courseMode }}</span>
              {{ courseCode }} - {{ courseName }}
            </p>
          </div>
        </div>
      </div>

      <!-- RESULTS VIEW (shown after submission) -->
      <div v-if="submissionResult" class="results-card card">
        <div class="results-header">
          <div class="results-check-icon">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
              <polyline points="20 6 9 17 4 12"></polyline>
            </svg>
          </div>
          <div>
            <h2 class="results-title">Attendance Recorded</h2>
            <p class="results-subtitle">{{ courseCode }} - {{ submissionResult.submittedAt }}</p>
          </div>
        </div>

        <!-- KPI tiles -->
        <div class="results-kpis">
          <div class="kpi-tile kpi-green">
            <span class="kpi-num">{{ submissionResult.presentCount }}</span>
            <span class="kpi-lbl">Present</span>
          </div>
          <div class="kpi-tile kpi-red">
            <span class="kpi-num">{{ submissionResult.absentCount }}</span>
            <span class="kpi-lbl">Absent</span>
          </div>
          <div class="kpi-tile kpi-gray">
            <span class="kpi-num">{{ submissionResult.total }}</span>
            <span class="kpi-lbl">Total</span>
          </div>
          <div class="kpi-tile kpi-indigo">
            <span class="kpi-num">{{ submissionResult.rate }}%</span>
            <span class="kpi-lbl">Attendance</span>
          </div>
        </div>

        <!-- Per-student email dispatch table -->
        <div class="dispatch-table">
          <!-- Present students -->
          <div class="dispatch-section">
            <div class="dispatch-section-label present-label">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <polyline points="20 6 9 17 4 12"></polyline>
              </svg>
              Present - Confirmation email sent
            </div>
            <div v-if="submissionResult.presentStudents.length === 0" class="dispatch-empty">
              No students marked present.
            </div>
            <div v-else class="dispatch-rows">
              <div v-for="s in submissionResult.presentStudents" :key="s.id" class="dispatch-row">
                <div class="dr-avatar">{{ s.name.charAt(0) }}</div>
                <span class="dr-name">{{ s.name }}</span>
                <span class="dr-badge" :class="'otp-' + (otpDispatch[s.id]?.status ?? 'sending')">
                  {{ otpDispatch[s.id]?.status === 'sent' ? 'Email sent' :
                     otpDispatch[s.id]?.status === 'failed' ? 'Failed' : 'Sending...' }}
                </span>
                <button v-if="otpDispatch[s.id]?.status === 'failed'" class="otp-retry-btn" @click="resendOtpToStudent(s.id)">Retry</button>
              </div>
            </div>
          </div>

          <!-- Absent students -->
          <div class="dispatch-section" v-if="submissionResult.absentStudents.length > 0">
            <div class="dispatch-section-label absent-label">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <circle cx="12" cy="12" r="10"></circle>
                <line x1="12" y1="8" x2="12" y2="12"></line>
                <line x1="12" y1="16" x2="12.01" y2="16"></line>
              </svg>
              Absent - Absence email sent
            </div>
            <div class="dispatch-rows">
              <div v-for="s in submissionResult.absentStudents" :key="s.id" class="dispatch-row">
                <div class="dr-avatar absent-avatar">{{ s.name.charAt(0) }}</div>
                <span class="dr-name">{{ s.name }}</span>
                <span class="dr-badge" :class="'otp-' + (absenceDispatch[s.id]?.status ?? 'sending')">
                  {{ absenceDispatch[s.id]?.status === 'sent' ? 'Email sent' :
                     absenceDispatch[s.id]?.status === 'failed' ? 'Failed' : 'Sending...' }}
                </span>
              </div>
            </div>
          </div>
        </div>

        <div class="results-actions">
          <button class="start-btn" @click="resetForm">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <polyline points="23 4 23 10 17 10"></polyline>
              <path d="M20.49 15a9 9 0 1 1-.49-4"></path>
            </svg>
            Mark Another Class
          </button>
        </div>
      </div>

      <!-- MARK ATTENDANCE FORM -->
      <div v-else class="setup-panel card">
        <div class="card-header">
          <h2>Mark Attendance</h2>
          <span class="date-tag">{{ todayLabel }}</span>
        </div>
        <div class="setup-body">
          <p class="setup-hint">
            Tick the students who are physically present in class.
            Unmarked students will be recorded as absent.
            Both groups receive an email immediately.
          </p>

          <div class="student-selection-list">
            <div class="list-header">
              <h3>
                Class List ({{ selectedStudents.length }}/{{ enrolledStudents.length }} present)
              </h3>
              <button class="btn-sm outline-btn" @click="toggleSelectAll">
                {{ selectedStudents.length === enrolledStudents.length ? 'Deselect All' : 'Select All' }}
              </button>
            </div>
            <div v-if="enrolledStudents.length === 0" class="no-students">
              No students enrolled in this course yet.
            </div>
            <div class="students-grid">
              <label
                v-for="student in enrolledStudents"
                :key="student.id"
                class="student-checkbox-card"
                :class="{ selected: selectedStudents.includes(student.id) }"
              >
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
            <button
              class="start-btn"
              @click="submitAttendance"
              :disabled="enrolledStudents.length === 0 || isStarting"
            >
              <svg v-if="isStarting" class="spin" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <circle cx="12" cy="12" r="10" stroke-dasharray="31" stroke-dashoffset="10"></circle>
              </svg>
              <svg v-else viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <polyline points="20 6 9 17 4 12"></polyline>
              </svg>
              {{ isStarting ? 'Recording...' : 'Submit Attendance' }}
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
import { useAuditLogsStore } from '@/stores/auditlogs';
import { supabase } from '@/stores/supabase';

const emit = defineEmits(['navigate']);

const authStore = useAuthStore();
const sessionsStore = useSessionsStore();
const attendancesStore = useAttendancesStore();
const enrollmentsStore = useEnrollmentsStore();
const auditLogsStore = useAuditLogsStore();

const { profile } = storeToRefs(authStore);

const courseId = ref(localStorage.getItem('activeCourseId') || '');
const courseCode = ref(localStorage.getItem('activeCourseCode') || '');
const courseName = ref(localStorage.getItem('activeCourseName') || '');
const courseSemester = ref(localStorage.getItem('activeCourseSemester') || 'Semester 1');
const courseMode = ref(localStorage.getItem('activeCourseMode') || 'Regular');

const enrolledStudents = ref([]);
const selectedStudents = ref([]);
const isStarting = ref(false);
const startError = ref('');

// Submission state
const submissionResult = ref(null); // set after successful submit
const otpDispatch = ref({});        // present confirmations
const absenceDispatch = ref({});    // absence notifications

const OTP_API_BASE = import.meta.env.VITE_OTP_API_URL || '';

// Today's date label shown in the form header
const todayLabel = computed(() =>
  new Date().toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })
);

const toggleSelectAll = () => {
  selectedStudents.value = selectedStudents.value.length === enrolledStudents.value.length
    ? []
    : enrolledStudents.value.map(s => s.id);
};

const resetForm = () => {
  submissionResult.value = null;
  selectedStudents.value = [];
  otpDispatch.value = {};
  absenceDispatch.value = {};
  startError.value = '';
};

// Main submission function
const submitAttendance = async () => {
  startError.value = '';
  isStarting.value = true;
  try {
    // 1. Create a session record (implementation detail - closed immediately)
    const created = await sessionsStore.createSession({
      courseId: courseId.value,
      lecturerId: profile.value?.id,
      mode: courseMode.value,
      maxStudents: enrolledStudents.value.length,
      isActive: false, // no live period - mark-and-close immediately
    });

    // 2. Mark every enrolled student present or absent
    const selectedIds = new Set(selectedStudents.value);
    const presentStudents = enrolledStudents.value.filter(s => selectedIds.has(s.id));
    const absentStudents  = enrolledStudents.value.filter(s => !selectedIds.has(s.id));

    await Promise.allSettled(
      enrolledStudents.value.map(s =>
        attendancesStore.markAttendance(
          { sessionId: created.id, studentId: s.id, status: selectedIds.has(s.id) ? 'present' : 'absent' },
          { silent: true }
        )
      )
    );

    auditLogsStore.logAction({
      action: 'attendance_recorded',
      details: `Recorded attendance for ${courseCode.value} - ${presentStudents.length} present, ${absentStudents.length} absent`,
      userId: profile.value?.id,
      userRole: profile.value?.role,
      userName: profile.value?.name,
    });

    // 3. Build the result state for the results view
    const total = enrolledStudents.value.length;
    submissionResult.value = {
      presentCount: presentStudents.length,
      absentCount:  absentStudents.length,
      total,
      rate: total > 0 ? Math.round((presentStudents.length / total) * 100) : 0,
      submittedAt: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
      presentStudents,
      absentStudents,
      sessionId: created.id,
      pin: created.pin,
    };

    // 4. Send emails to both groups (fire-and-forget, results tracked reactively)
    sendPresentConfirmations(created.id, created.pin, presentStudents);
    sendAbsenceNotifications(created.id, absentStudents);
  } catch (e) {
    startError.value = e.message || 'Failed to record attendance.';
  } finally {
    isStarting.value = false;
  }
};

// Email: present confirmations
const sendPresentConfirmations = async (sessionId, pin, presentStudents) => {
  const targets = presentStudents.filter(s => !!s.email);
  if (targets.length === 0) return;

  otpDispatch.value = Object.fromEntries(targets.map(s => [s.id, { status: 'sending' }]));
  try {
    const res = await fetch(`${OTP_API_BASE}/api/otp/send-bulk`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        sessionId,
        otp: pin,
        isConfirmation: true,
        courseCode: courseCode.value,
        courseName: courseName.value,
        students: targets.map(s => ({ studentId: s.id, email: s.email, name: s.name })),
      }),
    });
    const data = await res.json();
    const byId = Object.fromEntries((data.results || []).map(r => [r.studentId, r]));
    const next = {};
    for (const s of targets) {
      if (!s.email) { next[s.id] = { status: 'failed' }; continue; }
      const r = byId[s.id];
      next[s.id] = { status: r?.success ? 'sent' : 'failed' };
    }
    otpDispatch.value = next;
  } catch {
    const next = {};
    for (const s of targets) next[s.id] = { status: 'failed' };
    otpDispatch.value = next;
  }
};

// Email: absence notifications
const sendAbsenceNotifications = async (sessionId, absentStudents) => {
  const targets = absentStudents.filter(s => !!s.email);
  if (targets.length === 0) return;

  absenceDispatch.value = Object.fromEntries(targets.map(s => [s.id, { status: 'sending' }]));
  try {
    const res = await fetch(`${OTP_API_BASE}/api/otp/send-bulk`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        sessionId,
        isAbsence: true,
        courseCode: courseCode.value,
        courseName: courseName.value,
        students: targets.map(s => ({ studentId: s.id, email: s.email, name: s.name })),
      }),
    });
    const data = await res.json();
    const byId = Object.fromEntries((data.results || []).map(r => [r.studentId, r]));
    const next = {};
    for (const s of targets) {
      const r = byId[s.id];
      next[s.id] = { status: r?.success ? 'sent' : 'failed' };
    }
    absenceDispatch.value = next;
  } catch {
    const next = {};
    for (const s of targets) next[s.id] = { status: 'failed' };
    absenceDispatch.value = next;
  }
};

// Retry a failed present-confirmation email
const resendOtpToStudent = async (studentId) => {
  const student = enrolledStudents.value.find(s => s.id === studentId);
  const sessionId = submissionResult.value?.sessionId;
  const pin = submissionResult.value?.pin;
  if (!student?.email || !sessionId) return;

  otpDispatch.value = { ...otpDispatch.value, [studentId]: { status: 'sending' } };
  try {
    const res = await fetch(`${OTP_API_BASE}/api/otp/resend`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ sessionId, studentId, email: student.email, otp: pin, name: student.name }),
    });
    otpDispatch.value = { ...otpDispatch.value, [studentId]: { status: res.ok ? 'sent' : 'failed' } };
  } catch {
    otpDispatch.value = { ...otpDispatch.value, [studentId]: { status: 'failed' } };
  }
};

onMounted(async () => {
  if (!courseId.value) return;
  try {
    const studentIds = enrollmentsStore
      .enrollmentsByCourse(courseId.value)
      .map(e => e.studentId);

    if (studentIds.length > 0) {
      const { data, error } = await supabase
        .from('users')
        .select('id, name, id_number, email, mode')
        .in('id', studentIds)
        .eq('mode', courseMode.value)
        .order('name');

      if (error) throw error;

      enrolledStudents.value = (data ?? []).map(u => ({
        id: u.id,
        name: u.name,
        studentId: u.id_number,
        email: u.email,
        mode: u.mode,
      }));
    }
  } catch (e) {
    console.error('[AttendanceView] Failed to load students:', e);
  }
});
</script>

<style scoped>
@import url("https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap");
* { font-family: "Inter", sans-serif; box-sizing: border-box; }

.attendance-container { display: flex; flex-direction: column; gap: 1.5rem; width: 100%; }
.attendance-content-wrapper { display: flex; flex-direction: column; gap: 1.5rem; }

/* Empty state */
.empty-course-state { display: flex; flex-direction: column; align-items: center; justify-content: center; padding: 6rem 2rem; background: white; border-radius: 16px; border: 1px dashed #cbd5e1; text-align: center; }
.empty-icon-wrap { width: 80px; height: 80px; background: #f8fafc; border-radius: 50%; display: flex; align-items: center; justify-content: center; color: #94a3b8; margin-bottom: 1.5rem; }
.empty-icon-wrap svg { width: 40px; height: 40px; }
.empty-course-state h2 { margin: 0 0 0.5rem; color: #0f172a; }
.empty-course-state p { color: #64748b; margin-bottom: 2rem; }

/* Header */
.page-header { display: flex; justify-content: space-between; align-items: flex-end; border-bottom: 1px solid #e2e8f0; padding-bottom: 1.5rem; flex-wrap: wrap; gap: 1rem; }
.header-left { display: flex; flex-direction: column; gap: 1rem; min-width: 0; }
.back-btn { display: flex; align-items: center; gap: 0.5rem; background: none; border: none; color: #64748b; font-weight: 600; font-size: 0.9rem; cursor: pointer; padding: 0; transition: color 0.2s; align-self: flex-start; }
.back-btn:hover { color: #0f172a; }
.back-btn svg { width: 16px; height: 16px; flex-shrink: 0; }
.title-wrap { display: flex; flex-direction: column; gap: 0.25rem; min-width: 0; }
.page-title { margin: 0; font-size: 1.85rem; font-weight: 800; color: #0f172a; letter-spacing: -0.025em; }
.page-subtitle { margin: 0; font-size: 1rem; color: #6366f1; font-weight: 600; display: flex; align-items: center; gap: 0.5rem; flex-wrap: wrap; }
.semester-tag { background: #e0e7ff; color: #4338ca; font-size: 0.75rem; padding: 0.2rem 0.5rem; border-radius: 6px; font-weight: 700; white-space: nowrap; }

/* Card */
.card { background: #fff; border-radius: 16px; border: 1px solid #e2e8f0; overflow: hidden; }
.card-header { display: flex; justify-content: space-between; align-items: center; padding: 1.25rem 1.5rem; border-bottom: 1px solid #f1f5f9; }
.card-header h2 { margin: 0; font-size: 1.05rem; font-weight: 700; color: #0f172a; }
.date-tag { font-size: 0.8rem; font-weight: 600; color: #6366f1; background: #ede9fe; padding: 0.25rem 0.75rem; border-radius: 20px; }

/* Results card */
.results-header { display: flex; align-items: center; gap: 1rem; padding: 1.5rem; border-bottom: 1px solid #f1f5f9; }
.results-check-icon { width: 52px; height: 52px; background: #dcfce7; border-radius: 50%; display: flex; align-items: center; justify-content: center; color: #16a34a; flex-shrink: 0; }
.results-check-icon svg { width: 24px; height: 24px; }
.results-title { margin: 0 0 0.2rem; font-size: 1.15rem; font-weight: 800; color: #0f172a; }
.results-subtitle { margin: 0; font-size: 0.85rem; color: #64748b; }

.results-kpis { display: grid; grid-template-columns: repeat(4, 1fr); border-bottom: 1px solid #f1f5f9; }
.kpi-tile { display: flex; flex-direction: column; align-items: center; padding: 1.25rem 0.5rem; border-right: 1px solid #f1f5f9; }
.kpi-tile:last-child { border-right: none; }
.kpi-num { font-size: 2rem; font-weight: 800; line-height: 1; }
.kpi-lbl { font-size: 0.72rem; font-weight: 600; color: #94a3b8; margin-top: 0.35rem; text-transform: uppercase; letter-spacing: 0.05em; }
.kpi-green .kpi-num { color: #16a34a; }
.kpi-red .kpi-num { color: #dc2626; }
.kpi-gray .kpi-num { color: #475569; }
.kpi-indigo .kpi-num { color: #6366f1; }

/* Dispatch */
.dispatch-table { padding: 1rem 1.5rem; display: flex; flex-direction: column; gap: 1.25rem; }
.dispatch-section { display: flex; flex-direction: column; gap: 0.5rem; }
.dispatch-section-label { display: flex; align-items: center; gap: 0.5rem; font-size: 0.78rem; font-weight: 700; text-transform: uppercase; letter-spacing: 0.06em; padding: 0.4rem 0; }
.dispatch-section-label svg { width: 14px; height: 14px; flex-shrink: 0; }
.present-label { color: #16a34a; }
.absent-label { color: #dc2626; }
.dispatch-empty { font-size: 0.85rem; color: #94a3b8; padding: 0.5rem 0; }
.dispatch-rows { display: flex; flex-direction: column; gap: 0.4rem; }
.dispatch-row { display: flex; align-items: center; gap: 0.75rem; padding: 0.6rem 0.75rem; background: #f8fafc; border-radius: 8px; }
.dr-avatar { width: 30px; height: 30px; border-radius: 50%; background: #e0e7ff; color: #4338ca; display: flex; align-items: center; justify-content: center; font-weight: 700; font-size: 0.8rem; flex-shrink: 0; }
.absent-avatar { background: #fee2e2; color: #b91c1c; }
.dr-name { flex: 1; font-size: 0.88rem; font-weight: 600; color: #1e293b; min-width: 0; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.results-actions { padding: 1.25rem 1.5rem; border-top: 1px solid #f1f5f9; }

/* Setup form */
.setup-body { padding: 1.5rem; display: flex; flex-direction: column; gap: 1.5rem; }
.setup-hint { margin: 0; color: #64748b; font-size: 0.9rem; line-height: 1.6; }
.student-selection-list { display: flex; flex-direction: column; gap: 1rem; }
.list-header { display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 0.5rem; }
.list-header h3 { margin: 0; font-size: 0.95rem; font-weight: 700; color: #0f172a; }
.students-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(220px, 1fr)); gap: 0.75rem; }
.student-checkbox-card { display: flex; align-items: center; gap: 0.75rem; padding: 0.85rem 1rem; border: 1.5px solid #e2e8f0; border-radius: 12px; cursor: pointer; transition: border-color 0.2s, background 0.2s; background: #f8fafc; position: relative; }
.student-checkbox-card input[type="checkbox"] { position: absolute; opacity: 0; width: 0; height: 0; }
.student-checkbox-card.selected { border-color: #6366f1; background: #ede9fe; }
.student-checkbox-card.selected .student-avatar { background: #6366f1; color: #fff; }
.student-info { display: flex; align-items: center; gap: 0.75rem; width: 100%; min-width: 0; }
.student-avatar { width: 38px; height: 38px; border-radius: 50%; background: #e0e7ff; color: #4338ca; display: flex; align-items: center; justify-content: center; font-weight: 700; font-size: 1rem; flex-shrink: 0; transition: background 0.2s, color 0.2s; }
.student-details { display: flex; flex-direction: column; min-width: 0; }
.student-name { font-size: 0.88rem; font-weight: 600; color: #1e293b; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.student-id { font-size: 0.75rem; color: #94a3b8; }
.no-students { color: #94a3b8; font-size: 0.9rem; padding: 1rem 0; text-align: center; }

/* Buttons */
.primary-btn { background: linear-gradient(135deg, #6366f1, #4f46e5); color: #fff; border: none; padding: 0.8rem 2rem; border-radius: 10px; font-size: 0.95rem; font-weight: 700; cursor: pointer; transition: opacity 0.2s; }
.primary-btn:hover { opacity: 0.9; }
.btn-sm { font-size: 0.8rem; font-weight: 600; padding: 0.4rem 1rem; border-radius: 8px; cursor: pointer; border: none; transition: background 0.2s, color 0.2s; }
.outline-btn { background: #f1f5f9; color: #475569; border: 1px solid #e2e8f0; }
.outline-btn:hover { background: #e2e8f0; color: #0f172a; }
.start-controls { display: flex; justify-content: flex-end; }
.start-btn { display: flex; align-items: center; gap: 0.6rem; background: linear-gradient(135deg, #6366f1, #4f46e5); color: #fff; border: none; padding: 0.85rem 2rem; border-radius: 12px; font-size: 1rem; font-weight: 700; cursor: pointer; transition: opacity 0.2s, transform 0.15s; box-shadow: 0 4px 12px rgba(99,102,241,0.35); }
.start-btn svg { width: 18px; height: 18px; }
.start-btn:hover:not(:disabled) { opacity: 0.9; transform: translateY(-1px); }
.start-btn:disabled { opacity: 0.5; cursor: not-allowed; }
.error-banner { background: #fef2f2; border: 1px solid #fca5a5; color: #dc2626; padding: 0.75rem 1rem; border-radius: 10px; font-size: 0.88rem; font-weight: 500; }

/* Badges */
.dr-badge { font-size: 0.72rem; font-weight: 700; padding: 0.2rem 0.6rem; border-radius: 20px; flex-shrink: 0; }
.otp-sending { background: #fef9c3; color: #92400e; }
.otp-sent { background: #dcfce7; color: #166534; }
.otp-failed { background: #fee2e2; color: #dc2626; }
.otp-retry-btn { background: #fef2f2; color: #dc2626; border: 1px solid #fca5a5; border-radius: 6px; padding: 0.2rem 0.6rem; font-size: 0.75rem; font-weight: 600; cursor: pointer; flex-shrink: 0; }

/* Spinner */
.spin { width: 18px; height: 18px; flex-shrink: 0; animation: spinAnim 0.9s linear infinite; }
@keyframes spinAnim { to { transform: rotate(360deg); } }

@media (max-width: 640px) {
  .results-kpis { grid-template-columns: repeat(2, 1fr); }
  .kpi-tile:nth-child(2) { border-right: none; }
  .students-grid { grid-template-columns: 1fr; }
  .start-controls { justify-content: stretch; }
  .start-btn { width: 100%; justify-content: center; }
}
</style>
