<template>
  <div class="attendance-container">
    <!-- No Course Selected -->
    <div v-if="!courseId" class="empty-course-state">
      <div class="empty-icon-wrap">
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="1.5"
        >
          <path
            d="M13 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V9z"
          ></path>
          <polyline points="13 2 13 9 20 9"></polyline>
        </svg>
      </div>
      <h2>No Course Selected</h2>
      <p>Please select a course from "My Courses" to manage its attendance.</p>
      <button
        class="primary-btn"
        @click="$emit('navigate', '/lecturer-courses')"
      >
        Go to My Courses
      </button>
    </div>

    <div v-else class="attendance-content-wrapper">
      <!-- Header -->
      <div class="page-header">
        <div class="header-left">
          <button
            class="back-btn"
            @click="$emit('navigate', '/lecturer-courses')"
          >
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
            >
              <line x1="19" y1="12" x2="5" y2="12"></line>
              <polyline points="12 19 5 12 12 5"></polyline>
            </svg>
            Back to Courses
          </button>
          <div class="title-wrap">
            <h1 class="page-title">Attendance Management</h1>
            <p class="page-subtitle">
              <span class="semester-tag">{{ courseSemester }}</span>
              <span class="semester-tag">{{ courseMode }}</span>
              {{ courseCode }} — {{ courseName }}
            </p>
          </div>
        </div>
      </div>

      <!-- === CLASS IN SESSION BANNER === -->
      <div v-if="liveAttendanceSession.isActive" class="session-live-banner">
        <div class="banner-left">
          <span class="live-pill"
            ><span class="pulse-dot"></span>CLASS IN SESSION</span
          >
          <span class="banner-course-name"
            >{{ courseCode }} — {{ courseName }}</span
          >
        </div>
        <div class="banner-stats">
          <div class="bstat">
            <span class="bstat-num">{{ checkedInStudents.length }}</span
            ><span class="bstat-lbl">Checked In</span>
          </div>
          <div class="bstat-div"></div>
          <div class="bstat">
            <span class="bstat-num">{{
              liveAttendanceSession.maxStudents
            }}</span
            ><span class="bstat-lbl">Expected</span>
          </div>
          <div class="bstat-div"></div>
          <div class="bstat" :class="{ 'danger-stat': timeLeft <= 15 }">
            <span class="bstat-num">{{ timeLeft }}s</span
            ><span class="bstat-lbl">Remaining</span>
          </div>
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
                <circle
                  class="ring-fill"
                  cx="80"
                  cy="80"
                  r="66"
                  :stroke-dasharray="circumference"
                  :stroke-dashoffset="strokeOffset"
                  :class="{ 'ring-danger': timeLeft <= 15 }"
                  transform="rotate(-90 80 80)"
                />
              </svg>
              <div class="ring-center">
                <span class="ring-label">PIN</span>
                <div class="ring-pin">{{ liveAttendanceSession.pin }}</div>
                <span
                  class="ring-time"
                  :class="{ 'time-danger': timeLeft <= 15 }"
                  >{{ timeLeft }}s</span
                >
              </div>
            </div>
            <div class="session-btns">
              <button class="extend-btn" @click="extendTimer(extendIncrement)">
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  stroke-width="2"
                >
                  <circle cx="12" cy="12" r="10"></circle>
                  <polyline points="12 6 12 12 16 14"></polyline>
                </svg>
                +{{ extendIncrement }}s
              </button>
              <button class="danger-btn" @click="stopLiveSession">
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  stroke-width="2"
                >
                  <rect x="3" y="3" width="18" height="18" rx="2"></rect>
                </svg>
                End Session
              </button>
            </div>
            <p class="share-hint">
              Share this PIN with students present in class
            </p>
            <div
              v-if="Object.keys(otpDispatch).length"
              class="otp-status-block"
            >
              <div class="otp-status-header">
                <span>Email Codes</span>
                <span v-if="isDispatchingOtp" class="otp-sending-label"
                  >Sending…</span
                >
              </div>
              <p v-if="otpBannerMessage" class="otp-banner">
                {{ otpBannerMessage }}
              </p>
              <div class="otp-status-list">
                <div
                  v-for="s in enrolledStudents.filter(
                    (st) => otpDispatch[st.id],
                  )"
                  :key="s.id"
                  class="otp-status-row"
                >
                  <span class="otp-status-name">{{ s.name }}</span>
                  <span
                    class="otp-status-badge"
                    :class="'otp-' + otpDispatch[s.id].status"
                  >
                    {{
                      otpDispatch[s.id].status === "sending"
                        ? "Sending…"
                        : otpDispatch[s.id].status === "sent"
                          ? "Sent ✓"
                          : "Failed"
                    }}
                  </span>
                  <button
                    v-if="otpDispatch[s.id].status === 'failed'"
                    class="otp-retry-btn"
                    @click="resendOtpToStudent(s.id)"
                  >
                    Retry
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Right: Live check-in list -->
        <div class="checkin-panel card">
          <div class="card-header">
            <h2>Live Check-ins</h2>
            <div class="checkin-header-right">
              <span
                class="realtime-pill"
                :class="{ 'realtime-off': !isRealtimeConnected }"
              >
                <span class="realtime-dot"></span>
                {{ isRealtimeConnected ? "Live" : "Reconnecting…" }}
              </span>
              <span class="count-badge"
                >{{ checkedInStudents.length }}/{{
                  liveAttendanceSession.maxStudents
                }}</span
              >
            </div>
          </div>
          <div class="checkin-progress-wrap">
            <div
              class="checkin-progress"
              :style="{ width: progressPct + '%' }"
            ></div>
          </div>
          <div class="checkin-list" v-if="checkedInStudents.length > 0">
            <div
              class="checkin-item"
              v-for="(s, i) in checkedInStudents"
              :key="s.id"
            >
              <span class="ci-num">{{ i + 1 }}</span>
              <div class="ci-avatar">{{ s.name.charAt(0) }}</div>
              <div class="ci-info">
                <span class="ci-name">{{ s.name }}</span
                ><span class="ci-time">{{ formatTime(s.timestamp) }}</span>
              </div>
              <span class="ci-badge">Present</span>
            </div>
          </div>
          <div class="waiting-state" v-else>
            <div class="dots-wrap">
              <span class="dot"></span><span class="dot"></span
              ><span class="dot"></span>
            </div>
            <p>Waiting for students to check in…</p>
          </div>
        </div>
      </div>

      <!-- === SETUP SESSION: not active === -->
      <div v-else class="setup-panel card">
        <div class="card-header"><h2>Start Attendance Session</h2></div>
        <div class="setup-body">
          <p class="setup-hint">
            Select students physically present, then start the session to
            generate a secure PIN.
          </p>

          <!-- Custom timer settings -->
          <div class="timer-settings">
            <div class="list-header">
              <h3>Session Duration</h3>
            </div>
            <div class="duration-presets">
              <button
                v-for="preset in durationPresets"
                :key="preset.secs"
                type="button"
                class="preset-btn"
                :class="{
                  active: !useCustomDuration && durationSecs === preset.secs,
                }"
                @click="selectPreset(preset.secs)"
              >
                {{ preset.label }}
              </button>
              <button
                type="button"
                class="preset-btn"
                :class="{ active: useCustomDuration }"
                @click="useCustomDuration = true"
              >
                Custom
              </button>
            </div>

            <div v-if="useCustomDuration" class="custom-duration-row">
              <label class="custom-duration-field">
                <span>Minutes</span>
                <input
                  type="number"
                  min="0"
                  max="60"
                  v-model.number="customMinutes"
                  @input="clampCustomDuration"
                />
              </label>
              <label class="custom-duration-field">
                <span>Seconds</span>
                <input
                  type="number"
                  min="0"
                  max="59"
                  v-model.number="customSeconds"
                  @input="clampCustomDuration"
                />
              </label>
            </div>

            <p class="duration-summary">
              Session will run for <strong>{{ formattedDuration }}</strong> once
              started. Extend button adds
              <strong>{{ extendIncrement }}s</strong> at a time.
            </p>

            <div v-if="durationError" class="error-banner">
              {{ durationError }}
            </div>
          </div>

          <div class="student-selection-list">
            <div class="list-header">
              <h3>
                Class List ({{ selectedStudents.length }}/{{
                  enrolledStudents.length
                }}
                selected)
              </h3>
              <button class="btn-sm outline-btn" @click="toggleSelectAll">
                {{
                  selectedStudents.length === enrolledStudents.length
                    ? "Deselect All"
                    : "Select All"
                }}
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
                <input
                  type="checkbox"
                  :value="student.id"
                  v-model="selectedStudents"
                />
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
              @click="startLiveSession"
              :disabled="
                selectedStudents.length === 0 || isStarting || durationSecs <= 0
              "
            >
              <svg
                v-if="isStarting"
                class="spin"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="2"
              >
                <circle
                  cx="12"
                  cy="12"
                  r="10"
                  stroke-dasharray="31"
                  stroke-dashoffset="10"
                ></circle>
              </svg>
              <svg
                v-else
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="2"
              >
                <polygon points="5 3 19 12 5 21 5 3"></polygon>
              </svg>
              {{ isStarting ? "Starting…" : "Start Class Session" }}
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- ── Session End Pop Report ─────────────────────────────────────── -->
    <Teleport to="body">
      <div v-if="sessionReport" class="sr-overlay" @click.self="sessionReport = null">
        <div class="sr-modal">
          <!-- Header -->
          <div class="sr-header">
            <div class="sr-header-left">
              <div class="sr-check-icon">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="20 6 9 17 4 12"/></svg>
              </div>
              <div>
                <h2 class="sr-title">Session Complete</h2>
                <p class="sr-subtitle">{{ sessionReport.courseCode }} · {{ sessionReport.courseMode }} · Ended {{ sessionReport.endedAt }}</p>
              </div>
            </div>
            <button class="sr-close" @click="sessionReport = null">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
            </button>
          </div>

          <!-- KPI tiles -->
          <div class="sr-kpis">
            <!-- Rate circle -->
            <div class="sr-rate-wrap">
              <svg class="sr-ring" viewBox="0 0 120 120">
                <circle class="sr-ring-track" cx="60" cy="60" r="50"/>
                <circle
                  class="sr-ring-fill"
                  cx="60" cy="60" r="50"
                  :style="{
                    strokeDasharray: `${2 * Math.PI * 50}`,
                    strokeDashoffset: `${2 * Math.PI * 50 * (1 - sessionReport.rate / 100)}`,
                    stroke: sessionReport.rate >= 70 ? '#10b981' : sessionReport.rate >= 45 ? '#f59e0b' : '#ef4444'
                  }"
                />
              </svg>
              <div class="sr-ring-center">
                <span class="sr-rate-num" :style="{ color: sessionReport.rate >= 70 ? '#10b981' : sessionReport.rate >= 45 ? '#f59e0b' : '#ef4444' }">{{ sessionReport.rate }}%</span>
                <span class="sr-rate-lbl">Rate</span>
              </div>
            </div>

            <div class="sr-tiles">
              <div class="sr-tile sr-tile-green">
                <span class="sr-tile-num">{{ sessionReport.present }}</span>
                <span class="sr-tile-lbl">Present</span>
              </div>
              <div class="sr-tile sr-tile-red">
                <span class="sr-tile-num">{{ sessionReport.absent }}</span>
                <span class="sr-tile-lbl">Absent</span>
              </div>
              <div class="sr-tile sr-tile-gray">
                <span class="sr-tile-num">{{ sessionReport.total }}</span>
                <span class="sr-tile-lbl">Expected</span>
              </div>
            </div>
          </div>

          <!-- Present students list -->
          <div class="sr-list-wrap" v-if="sessionReport.presentStudents.length > 0">
            <p class="sr-list-title">Students Present</p>
            <div class="sr-list">
              <div v-for="(s, i) in sessionReport.presentStudents" :key="s.studentId" class="sr-student">
                <span class="sr-num">{{ i + 1 }}</span>
                <div class="sr-avatar">{{ s.name.charAt(0) }}</div>
                <span class="sr-name">{{ s.name }}</span>
                <span class="sr-time">{{ formatTime(s.timestamp) }}</span>
              </div>
            </div>
          </div>
          <div v-else class="sr-no-present">No students checked in this session.</div>

          <button class="sr-done-btn" @click="sessionReport = null">Done</button>
        </div>
      </div>
    </Teleport>
  </div>
</template>
<script setup>
import { ref, computed, watch, onMounted, onUnmounted } from 'vue';
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
const { attendances } = storeToRefs(attendancesStore);

const courseId = ref(localStorage.getItem('activeCourseId') || '');
const courseCode = ref(localStorage.getItem('activeCourseCode') || '');
const courseName = ref(localStorage.getItem('activeCourseName') || '');
const courseSemester = ref(localStorage.getItem('activeCourseSemester') || 'Semester 1');
const courseMode = ref(localStorage.getItem('activeCourseMode') || 'Regular');

const enrolledStudents = ref([]);
const selectedStudents = ref([]);
const liveAttendanceSession = ref({ isActive: false });
const timeLeft = ref(60);
const totalTime = ref(60);
const isStarting = ref(false);
const startError = ref('');

let timerInterval = null;
const OTP_API_BASE = import.meta.env.VITE_OTP_API_URL || '';

// ── Custom timer settings (lecturer-configurable, set before starting) ──
const durationPresets = [
  { label: '30s', secs: 30 },
  { label: '1m', secs: 60 },
  { label: '2m', secs: 120 },
  { label: '5m', secs: 300 },
];
const useCustomDuration = ref(false);
const durationSecs = ref(60); // preset selection lands here
const customMinutes = ref(1);
const customSeconds = ref(0);
const durationError = ref('');

// The +N button on the ring reuses whatever duration the lecturer picked,
// capped so it can't be absurdly long — matches "custom timer" intent
// without needing a second separate control.
const extendIncrement = computed(() => Math.min(Math.max(durationSecs.value, 5), 120));

const selectPreset = (secs) => {
  useCustomDuration.value = false;
  durationSecs.value = secs;
  durationError.value = '';
};

const clampCustomDuration = () => {
  if (customMinutes.value < 0 || Number.isNaN(customMinutes.value)) customMinutes.value = 0;
  if (customMinutes.value > 60) customMinutes.value = 60;
  if (customSeconds.value < 0 || Number.isNaN(customSeconds.value)) customSeconds.value = 0;
  if (customSeconds.value > 59) customSeconds.value = 59;
};

watch([useCustomDuration, customMinutes, customSeconds], () => {
  if (!useCustomDuration.value) return;
  clampCustomDuration();
  const total = customMinutes.value * 60 + customSeconds.value;
  durationSecs.value = total;
  durationError.value = total <= 0 ? 'Session duration must be at least a few seconds.' : '';
});

const formattedDuration = computed(() => {
  const secs = durationSecs.value;
  if (secs <= 0) return '0s';
  const m = Math.floor(secs / 60);
  const s = secs % 60;
  if (m === 0) return `${s}s`;
  if (s === 0) return `${m}m`;
  return `${m}m ${s}s`;
});

// ── Realtime check-in connection state ──
const isRealtimeConnected = ref(false);

const circumference = 2 * Math.PI * 66; // r=66
const strokeOffset = computed(() => circumference * (1 - timeLeft.value / totalTime.value));
const progressPct = computed(() =>
  liveAttendanceSession.value.maxStudents > 0
    ? Math.min(100, (checkedInStudents.value.length / liveAttendanceSession.value.maxStudents) * 100)
    : 0
);

const formatTime = (ts) => new Date(ts).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });

// Live check-ins for the active session — realtime feed via
// attendancesStore.subscribeToAttendances(). Pending/absent seed rows are
// filtered out here since only 'present' rows count as checked in.
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
          .select('id, name, id_number, email, mode')
          .in('id', studentIds)
          .eq('mode', courseMode.value)
          .order('name');

        if (error) throw error;

        enrolledStudents.value = (data ?? []).map((u) => ({
          id: u.id,
          name: u.name,
          studentId: u.id_number,
          email: u.email,
          mode: u.mode,
        }));
      }
    } catch (e) {
      console.error(e);
    }
  }

  try {
    if (liveAttendanceSession.value.id) {
      await attendancesStore.fetchAttendances({ sessionId: liveAttendanceSession.value.id });
    }
  } catch (e) {
    console.error('Error fetching existing attendances:', e);
  }

  attendancesStore.subscribeToAttendances();
  isRealtimeConnected.value = true;
});

const toggleSelectAll = () => {
  selectedStudents.value = selectedStudents.value.length === enrolledStudents.value.length
    ? []
    : enrolledStudents.value.map(s => s.id);
};

const dispatchOtpsToSelected = async (sessionId, otp) => {
  const targets = enrolledStudents.value.filter((s) => selectedStudents.value.includes(s.id));

  otpDispatch.value = Object.fromEntries(targets.map((s) => [s.id, { status: 'sending', message: '' }]));
  isDispatchingOtp.value = true;
  otpBannerMessage.value = '';

  try {
    const res = await fetch(`${OTP_API_BASE}/api/otp/send-bulk`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        sessionId,
        otp,
        students: targets
          .filter((s) => !!s.email)
          .map((s) => ({ studentId: s.id, email: s.email, name: s.name })),
      }),
    });
    const data = await res.json();

    const byId = Object.fromEntries((data.results || []).map((r) => [r.studentId, r]));
    const next = {};
    for (const s of targets) {
      if (!s.email) {
        next[s.id] = { status: 'failed', message: 'No email on file' };
        continue;
      }
      const r = byId[s.id];
      next[s.id] = r
        ? { status: r.success ? 'sent' : 'failed', message: r.message }
        : { status: 'failed', message: 'No response' };
    }
    otpDispatch.value = next;
    otpBannerMessage.value = res.ok
      ? `${data.sent}/${targets.length} codes emailed successfully`
      : (data.message || 'Failed to send codes');
  } catch (e) {
    const next = {};
    for (const s of targets) next[s.id] = { status: 'failed', message: 'Network error' };
    otpDispatch.value = next;
    otpBannerMessage.value = 'Could not reach the OTP server. Codes were not sent.';
  } finally {
    isDispatchingOtp.value = false;
  }
};

const resendOtpToStudent = async (studentId) => {
  const student = enrolledStudents.value.find((s) => s.id === studentId);
  if (!student?.email || !liveAttendanceSession.value.id) return;

  otpDispatch.value = { ...otpDispatch.value, [studentId]: { status: 'sending', message: '' } };
  try {
    const res = await fetch(`${OTP_API_BASE}/api/otp/resend`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        sessionId: liveAttendanceSession.value.id,
        studentId,
        email: student.email,
        otp: liveAttendanceSession.value.pin,
        name: student.name,
      }),
    });
    const data = await res.json();
    otpDispatch.value = {
      ...otpDispatch.value,
      [studentId]: { status: res.ok ? 'sent' : 'failed', message: data.message },
    };
  } catch (e) {
    otpDispatch.value = { ...otpDispatch.value, [studentId]: { status: 'failed', message: 'Network error' } };
  }
};

const startLiveSession = async () => {
  startError.value = '';

  if (durationSecs.value <= 0) {
    startError.value = 'Set a session duration before starting.';
    return;
  }

  isStarting.value = true;
  try {
    const created = await sessionsStore.createSession({
      courseId: courseId.value,
      lecturerId: profile.value?.id,
      mode: courseMode.value,
      maxStudents: selectedStudents.value.length,
      isActive: true,
    });

    totalTime.value = durationSecs.value;
    timeLeft.value = durationSecs.value;
    liveAttendanceSession.value = {
      id: created.id,
      isActive: true,
      pin: created.pin,
      maxStudents: selectedStudents.value.length,
    };

    // Seed an attendance row for every enrolled student right when the session
    // opens: selected students start 'pending' until they check in with the
    // PIN; unselected students (not present in class) are marked 'absent'
    // immediately. Silent so this doesn't fire a toast per student.
    const selectedIds = new Set(selectedStudents.value);
    await Promise.allSettled(
      enrolledStudents.value.map((s) =>
        attendancesStore.markAttendance(
          {
            sessionId: created.id,
            studentId: s.id,
            status: selectedIds.has(s.id) ? 'pending' : 'absent',
          },
          { silent: true }
        )
      )
    );

    auditLogsStore.logAction({
      action: 'session_started',
      details: `Started attendance session for ${courseCode.value} (PIN: ${created.pin}, ${selectedStudents.value.length} students)`,
      userId: profile.value?.id,
      userRole: profile.value?.role,
      userName: profile.value?.name,
    });

    if (timerInterval) clearInterval(timerInterval);
    timerInterval = setInterval(() => {
      if (timeLeft.value > 0) { timeLeft.value--; }
      else { stopLiveSession(); }
    }, 1000);

    dispatchOtpsToSelected(created.id, created.pin);
  } catch (e) {
    startError.value = e.message || 'Failed to start session.';
  } finally {
    isStarting.value = false;
  }
};

const stopLiveSession = async () => {
  clearInterval(timerInterval); timerInterval = null;
  const sessionId = liveAttendanceSession.value.id;
  const courseCode_ = courseCode.value;

  // Snapshot stats BEFORE clearing state
  const presentList  = [...checkedInStudents.value];
  const totalExpected = liveAttendanceSession.value.maxStudents ?? enrolledStudents.value.length;

  try {
    if (sessionId) {
      await sessionsStore.closeSession(sessionId);

      // Any seed row still 'pending' means that student never checked in —
      // flip it to 'absent'. Students already 'present' or 'absent' (the
      // unselected ones) are left untouched.
      const pendingRecords = attendances.value.filter(
        (a) => a.sessionId === sessionId && a.status === 'pending'
      );
      if (pendingRecords.length > 0) {
        await Promise.allSettled(
          pendingRecords.map((r) => attendancesStore.updateAttendanceStatus(r.id, 'absent', { silent: true }))
        );
      }

      auditLogsStore.logAction({
        action: 'session_ended',
        details: `Ended session for ${courseCode_} — ${presentList.length} present, ${pendingRecords.length} auto-marked absent`,
        userId: profile.value?.id,
        userRole: profile.value?.role,
        userName: profile.value?.name,
      });

      // Show pop report
      const absentCount = totalExpected - presentList.length;
      const rate = totalExpected > 0 ? Math.round((presentList.length / totalExpected) * 100) : 0;
      sessionReport.value = {
        courseCode: courseCode_,
        courseMode: courseMode.value,
        present:    presentList.length,
        absent:     absentCount < 0 ? 0 : absentCount,
        total:      totalExpected,
        rate,
        presentStudents: presentList,
        endedAt: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
      };
    }
  } catch (e) {
    console.error(e);
  }
  liveAttendanceSession.value = { isActive: false };
  otpDispatch.value = {};
  otpBannerMessage.value = '';
};

const extendTimer = (secs) => { if (liveAttendanceSession.value.isActive) timeLeft.value += secs; };

// sessionId -> { status: 'idle'|'sending'|'sent'|'failed', message }
const otpDispatch = ref({});
const isDispatchingOtp = ref(false);
const otpBannerMessage = ref('');

// Session end summary report
const sessionReport = ref(null);

onUnmounted(() => {
  clearInterval(timerInterval);
  attendancesStore.unsubscribeFromAttendances();
  isRealtimeConnected.value = false;
});

</script>