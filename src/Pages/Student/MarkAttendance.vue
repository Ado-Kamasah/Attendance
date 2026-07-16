<template>
  <div class="attendance-container">
    <div class="page-header">
      <div>
        <p class="institution-tag">Sothshore University</p>
        <h1 class="page-title">Mark Attendance</h1>
        <p class="page-subtitle">Verify your presence for active classes securely.</p>
      </div>
      <div class="live-badge">
        <span class="pulse-dot"></span>
        System Live
      </div>
    </div>

    <div class="attendance-content">
      <!-- Left: Current Session -->
      <div class="active-session-panel">
        <div class="panel-header">
          <h2>Current Session</h2>
          <button class="refresh-btn" @click="fetchActiveSessions" title="Refresh">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="23 4 23 10 17 10"></polyline><polyline points="1 20 1 14 7 14"></polyline><path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15"></path></svg>
          </button>
        </div>

        <div class="session-body">
          <!-- Loading state -->
          <div v-if="isLoading" class="loading-state">
            <div class="loader"></div>
            <p>Checking for active sessions…</p>
          </div>

          <!-- SUCCESS STATE -->
          <div v-else-if="attendanceMarked" class="success-state">
            <div class="success-icon-wrap">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="20 6 9 17 4 12"></polyline></svg>
            </div>
            <h3>Attendance Marked!</h3>
            <p>You are marked <strong>present</strong> for</p>
            <div class="marked-course-badge">{{ markedCourseName }}</div>
            <span class="marked-time">Recorded at {{ markedAtTime }}</span>
            <button class="outline-btn" @click="resetState">Done</button>
          </div>

          <!-- No active class -->
          <div v-else-if="!activeClass" class="no-session-state">
            <div class="icon-wrap-large">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg>
            </div>
            <h3>No Active Classes</h3>
            <p>No attendance session is currently running for your enrolled courses. This page refreshes automatically.</p>
            <button class="outline-btn" @click="fetchActiveSessions">Check Again</button>
          </div>

          <!-- Active class OTP entry -->
          <div v-else class="active-class-ui">
            <!-- "CLASS IN SESSION" indicator -->
            <div class="in-session-indicator">
              <span class="session-live-dot"></span>
              <span class="session-live-text">CLASS IN SESSION</span>
            </div>

            <div class="course-banner">
              <div class="badge-row">
                <span class="course-code">{{ activeClass.code }}</span>
                <span class="semester-badge-tag">{{ activeClass.semester }}</span>
              </div>
              <h3 class="course-name">{{ activeClass.name }}</h3>
              <p class="course-details">{{ activeClass.lecturer }} • Live Session</p>
            </div>

            <div class="verification-box">
              <!-- Stage 1: request the code -->
              <template v-if="otpStage === 'idle'">
                <h4>Verify Your Attendance</h4>
                <p>
                  We'll send a 6-digit verification code to your registered email
                  <strong v-if="maskedEmail">{{ maskedEmail }}</strong>
                  <span v-else>on file</span>.
                </p>
                <button class="primary-btn submit-btn" @click="sendOtp" :disabled="otpSending || !profile?.email">
                  <svg v-if="otpSending" class="spin" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10" stroke-dasharray="31" stroke-dashoffset="10"></circle></svg>
                  <svg v-else viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M4 4h16v16H4z" opacity="0"></path><path d="M22 6l-10 7L2 6"></path><path d="M2 6h20v12H2z"></path></svg>
                  {{ otpSending ? 'Sending Code…' : 'Send Verification Code' }}
                </button>
              </template>

              <!-- Stage 2: enter the code -->
              <template v-else>
                <h4>Enter Verification Code</h4>
                <p>
                  Enter the 6-digit code sent to
                  <strong v-if="maskedEmail">{{ maskedEmail }}</strong>
                  <span v-else>your email</span>.
                </p>

                <div class="code-inputs">
                  <input v-for="(n, idx) in 6" :key="idx" type="text" inputmode="numeric" maxlength="1"
                    class="pin-box" :class="{ 'pin-filled': otpCode[idx] }"
                    v-model="otpCode[idx]"
                    @input="onOtpInput(idx, $event)"
                    @keydown.backspace="onOtpBackspace(idx, $event)"
                    :ref="el => { if (el) otpRefs[idx] = el }" />
                </div>

                <button class="primary-btn submit-btn" @click="verifyOtp" :disabled="otpVerifying || otpCode.join('').length < 6">
                  <svg v-if="otpVerifying" class="spin" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10" stroke-dasharray="31" stroke-dashoffset="10"></circle></svg>
                  <svg v-else viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg>
                  {{ otpVerifying ? 'Verifying…' : 'Verify & Mark Present' }}
                </button>

                <button class="resend-link" @click="resendOtp" :disabled="otpCooldown > 0 || otpSending">
                  {{ otpCooldown > 0 ? `Resend code in ${otpCooldown}s` : (otpSending ? 'Resending…' : 'Resend code') }}
                </button>
              </template>

              <div v-if="otpError" class="pin-error">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="12"></line><line x1="12" y1="16" x2="12.01" y2="16"></line></svg>
                {{ otpError }}
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Right: Recent History -->
      <div class="history-panel">
        <div class="panel-header">
          <h2>Recent Sessions</h2>
        </div>
        <div class="sessions-list">
          <div v-if="attendanceHistory.length === 0" class="empty-history">
            <p>No recent attendance records found.</p>
          </div>
          <div v-else class="history-item" v-for="record in attendanceHistory" :key="record.id">
            <div class="status-icon" :class="record.status">
              <svg v-if="record.status === 'present'" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="20 6 9 17 4 12"></polyline></svg>
              <svg v-else viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
            </div>
            <div class="history-details">
              <h4>{{ record.course }}</h4>
              <p>{{ record.date }} • {{ record.time }}</p>
            </div>
            <div class="history-status" :class="record.status">{{ record.statusText }}</div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch, nextTick, onMounted, onUnmounted } from 'vue';
import { storeToRefs } from 'pinia';
import { useAuthStore } from '@/stores/authstore';
import { useCoursesStore } from '@/stores/courses';
import { useSchedulesStore } from '@/stores/schedules';
import { useEnrollmentsStore } from '@/stores/enrollments';
import { useSessionsStore } from '@/stores/sessions';
import { useAttendancesStore } from '@/stores/attendances';
import { useAuditLogsStore } from '@/stores/auditlogs';

const emit = defineEmits(['navigate']);

const authStore = useAuthStore();
const coursesStore = useCoursesStore();
const schedulesStore = useSchedulesStore();
const enrollmentsStore = useEnrollmentsStore();
const sessionsStore = useSessionsStore();
const attendancesStore = useAttendancesStore();
const auditLogsStore = useAuditLogsStore();

const { profile } = storeToRefs(authStore);
const { enrollments } = storeToRefs(enrollmentsStore);
const { sessions } = storeToRefs(sessionsStore);
const { attendances } = storeToRefs(attendancesStore);

const isLoading = ref(true);
const attendanceMarked = ref(false);
const markedCourseName = ref('');
const markedAtTime = ref('');

// --- Email OTP verification state ---
const otpStage = ref('idle'); // 'idle' | 'sent'
const otpCode = ref(['', '', '', '', '', '']);
const otpRefs = ref([]);
const otpError = ref('');
const otpSending = ref(false);
const otpVerifying = ref(false);
const otpCooldown = ref(0);
let cooldownTimer = null;

const maskedEmail = computed(() => {
  const email = profile.value?.email;
  if (!email || !email.includes('@')) return '';
  const [user, domain] = email.split('@');
  const visible = user.slice(0, Math.min(2, user.length));
  return `${visible}${'*'.repeat(Math.max(user.length - visible.length, 3))}@${domain}`;
});

onMounted(async () => {
  isLoading.value = true;
  try {
    await Promise.all([
      coursesStore.fetchCourses(),
      schedulesStore.fetchSchedules(),
      enrollmentsStore.fetchEnrollments({ studentId: profile.value?.id }),
      sessionsStore.fetchSessions({ isActive: true }),
      attendancesStore.fetchAttendances({ studentId: profile.value?.id }),
    ]);

    coursesStore.subscribeToCourses();
    schedulesStore.subscribeToSchedules();
    enrollmentsStore.subscribeToEnrollments();
    sessionsStore.subscribeToSessions();
    attendancesStore.subscribeToAttendances();
  } catch (e) {
    console.error('Error loading attendance data:', e);
  } finally {
    isLoading.value = false;
  }
});

onUnmounted(() => {
  coursesStore.unsubscribeFromCourses();
  schedulesStore.unsubscribeFromSchedules();
  enrollmentsStore.unsubscribeFromEnrollments();
  sessionsStore.unsubscribeFromSessions();
  attendancesStore.unsubscribeFromAttendances();
  clearInterval(cooldownTimer);
});

const enrolledCourseIds = computed(() =>
  enrollments.value
    .filter((e) => e.studentId === profile.value?.id)
    .map((e) => e.courseId)
);

/** First active session running for any course this student is enrolled in. */
const activeSessionRaw = computed(() =>
  sessions.value.find(
    (s) => s.isActive && enrolledCourseIds.value.includes(s.courseId)
  ) ?? null
);

const activeClass = computed(() => {
  const session = activeSessionRaw.value;
  if (!session) return null;

  const course = coursesStore.getCourseById(session.courseId);
  const schedule = schedulesStore.schedules.find((s) => s.courseId === session.courseId);

  return {
    id: session.id,
    code: course?.code ?? 'Unknown',
    name: course?.name ?? 'Unknown Course',
    semester: course?.semester || 'Semester 1',
    lecturer: schedule?.lecturer ?? 'Unknown Lecturer',
  };
});

// If the live session ends or changes while the success screen is showing,
// don't yank it away — resetState() clears attendanceMarked when the user
// clicks "Done". If the session itself changes underneath an in-progress
// OTP flow, reset back to stage 1 so the student re-verifies against the
// new session.
watch(activeSessionRaw, () => {
  otpError.value = '';
  otpStage.value = 'idle';
  otpCode.value = ['', '', '', '', '', ''];
  clearInterval(cooldownTimer);
  otpCooldown.value = 0;
});

const fetchActiveSessions = async () => {
  isLoading.value = true;
  otpError.value = '';
  try {
    await sessionsStore.fetchSessions({ isActive: true });
  } catch (e) {
    console.error('Error refreshing sessions:', e);
  } finally {
    isLoading.value = false;
  }
};

const startCooldown = (seconds) => {
  otpCooldown.value = seconds;
  clearInterval(cooldownTimer);
  cooldownTimer = setInterval(() => {
    otpCooldown.value -= 1;
    if (otpCooldown.value <= 0) clearInterval(cooldownTimer);
  }, 1000);
};

const sendOtp = async () => {
  otpError.value = '';
  const email = profile.value?.email;
  if (!email) {
    otpError.value = 'No registered email found on your profile. Contact your administrator.';
    return;
  }

  otpSending.value = true;
  try {
    const res = await fetch(`${import.meta.env.VITE_API_URL}/api/otp/send`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, name: profile.value?.name }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || 'Failed to send verification code.');

    otpStage.value = 'sent';
    otpCode.value = ['', '', '', '', '', ''];
    startCooldown(60);
    nextTick(() => otpRefs.value[0]?.focus());
  } catch (e) {
    otpError.value = e.message || 'Could not send verification code. Try again.';
  } finally {
    otpSending.value = false;
  }
};

const resendOtp = async () => {
  if (otpCooldown.value > 0 || otpSending.value) return;
  await sendOtp();
};

const onOtpInput = (idx, event) => {
  const val = event.target.value.replace(/\D/g, '');
  otpCode.value[idx] = val ? val[val.length - 1] : '';
  otpError.value = '';
  if (otpCode.value[idx] && idx < 5) {
    otpRefs.value[idx + 1]?.focus();
  }
};

const onOtpBackspace = (idx, event) => {
  if (!otpCode.value[idx] && idx > 0) {
    otpRefs.value[idx - 1]?.focus();
  }
};

const verifyOtp = async () => {
  if (!activeClass.value) return;
  const code = otpCode.value.join('');
  if (code.length < 6) {
    otpError.value = 'Enter the complete 6-digit code.';
    return;
  }

  otpVerifying.value = true;
  otpError.value = '';

  try {
    const email = profile.value?.email;
    const res = await fetch(`${import.meta.env.VITE_API_URL}/api/otp/verify`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, otp: code }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || 'Invalid verification code.');

    if (attendancesStore.hasAttended(activeClass.value.id, profile.value?.id)) {
      throw new Error('Attendance already recorded for this session.');
    }

    await attendancesStore.markAttendance({
      sessionId: activeClass.value.id,
      studentId: profile.value?.id,
      status: 'present',
    });

    const now = new Date();
    markedCourseName.value = `${activeClass.value.code} — ${activeClass.value.name}`;
    markedAtTime.value = now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });

    auditLogsStore.logAction({
      action: 'attendance_marked',
      details: `Marked present for ${markedCourseName.value} (email OTP verified)`,
      userId: profile.value?.id,
      userRole: profile.value?.role,
      userName: profile.value?.name,
    });

    attendanceMarked.value = true;
    otpStage.value = 'idle';
    otpCode.value = ['', '', '', '', '', ''];
    clearInterval(cooldownTimer);
    otpCooldown.value = 0;
  } catch (e) {
    otpError.value = e.message || 'Verification failed. Please try again.';
    otpCode.value = ['', '', '', '', '', ''];
    otpRefs.value[0]?.focus();
  } finally {
    otpVerifying.value = false;
  }
};

const resetState = () => {
  attendanceMarked.value = false;
  otpStage.value = 'idle';
  otpCode.value = ['', '', '', '', '', ''];
  otpError.value = '';
  clearInterval(cooldownTimer);
  otpCooldown.value = 0;
  fetchActiveSessions();
};

// --- Recent history (right panel) ---
const attendanceHistory = computed(() => {
  return attendances.value
    .filter((a) => a.studentId === profile.value?.id)
    .map((a) => {
      const session = sessionsStore.getSessionById(a.sessionId);
      const course = session ? coursesStore.getCourseById(session.courseId) : null;
      const ts = a.timestamp ? new Date(a.timestamp) : null;

      return {
        id: a.id,
        course: course ? `${course.code} — ${course.name}` : 'Unknown course',
        date: ts ? ts.toLocaleDateString() : '',
        time: ts ? ts.toLocaleTimeString() : '',
        status: a.status,
        statusText: a.status === 'present' ? 'Present' : 'Absent',
        rawTimestamp: a.timestamp,
      };
    })
    .sort((x, y) => new Date(y.rawTimestamp) - new Date(x.rawTimestamp))
    .slice(0, 10);
});
</script>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap');
* { font-family: 'Inter', sans-serif; box-sizing: border-box; }

.attendance-container { display:flex;flex-direction:column;gap:2rem;width:100%; }
.page-header { display:flex;justify-content:space-between;align-items:center; }
.institution-tag { margin:0 0 .35rem;font-size:.75rem;font-weight:800;letter-spacing:.12em;text-transform:uppercase;color:#6366f1; }
.page-title { margin:0;font-size:1.75rem;font-weight:700;color:#0f172a;letter-spacing:-0.025em; }
.page-subtitle { margin:0.25rem 0 0;font-size:0.95rem;color:#64748b; }
.live-badge { display:flex;align-items:center;gap:0.5rem;background:#f1f5f9;color:#334155;padding:0.5rem 1rem;border-radius:9999px;font-size:0.85rem;font-weight:600;border:1px solid #e2e8f0; }
.pulse-dot { width:8px;height:8px;background:#10b981;border-radius:50%;animation:pulse 2s infinite; }
@keyframes pulse { 0%{transform:scale(.95);box-shadow:0 0 0 0 rgba(16,185,129,.7)} 70%{transform:scale(1);box-shadow:0 0 0 5px rgba(16,185,129,0)} 100%{transform:scale(.95);box-shadow:0 0 0 0 rgba(16,185,129,0)} }

.attendance-content { display:grid;grid-template-columns:3fr 2fr;gap:1.5rem; }
.active-session-panel,.history-panel { background:#fff;border-radius:16px;box-shadow:0 4px 6px -1px rgba(0,0,0,.05);border:1px solid rgba(226,232,240,.8);display:flex;flex-direction:column; }
.panel-header { padding:1.25rem 1.5rem;border-bottom:1px solid #f1f5f9;display:flex;justify-content:space-between;align-items:center; }
.panel-header h2 { margin:0;font-size:1.1rem;font-weight:700;color:#0f172a; }
.refresh-btn { background:none;border:none;color:#94a3b8;cursor:pointer;padding:4px;border-radius:6px;display:flex;align-items:center;transition:all 0.2s; }
.refresh-btn:hover { background:#f1f5f9;color:#475569; }
.refresh-btn svg { width:16px;height:16px; }
.session-body { padding:1.5rem;flex:1;display:flex;flex-direction:column; }

/* Loading */
.loading-state { display:flex;flex-direction:column;align-items:center;justify-content:center;flex:1;gap:1rem;color:#64748b; }
.loader { width:36px;height:36px;border:3px solid #e2e8f0;border-top-color:#6366f1;border-radius:50%;animation:spin 0.8s linear infinite; }
@keyframes spin { to { transform:rotate(360deg); } }

/* Success State */
.success-state { display:flex;flex-direction:column;align-items:center;text-align:center;gap:0.75rem;padding:2rem 1rem;flex:1;justify-content:center; }
.success-icon-wrap { width:72px;height:72px;background:#dcfce7;border-radius:50%;display:flex;align-items:center;justify-content:center;color:#16a34a;margin-bottom:0.5rem;animation:popIn 0.4s cubic-bezier(0.16,1,0.3,1); }
@keyframes popIn { from{transform:scale(0);opacity:0} to{transform:scale(1);opacity:1} }
.success-icon-wrap svg { width:36px;height:36px; }
.success-state h3 { margin:0;font-size:1.4rem;font-weight:800;color:#0f172a; }
.success-state p { margin:0;color:#64748b;font-size:0.95rem; }
.marked-course-badge { background:#e0e7ff;color:#3730a3;padding:0.4rem 1rem;border-radius:8px;font-weight:700;font-size:0.9rem; }
.marked-time { font-size:0.8rem;color:#94a3b8; }

/* No Session */
.no-session-state { display:flex;flex-direction:column;align-items:center;justify-content:center;text-align:center;padding:3rem 1rem;background:#f8fafc;border-radius:12px;border:1px dashed #cbd5e1;flex:1; }
.icon-wrap-large { width:64px;height:64px;background:#fff;border-radius:50%;display:flex;align-items:center;justify-content:center;color:#94a3b8;box-shadow:0 4px 6px rgba(0,0,0,.05);margin-bottom:1.5rem; }
.icon-wrap-large svg { width:32px;height:32px; }
.no-session-state h3 { margin:0 0 0.5rem;color:#1e293b;font-size:1.2rem; }
.no-session-state p { color:#64748b;margin:0 0 1.5rem;max-width:280px;line-height:1.5;font-size:0.9rem; }

/* In-session indicator */
.active-class-ui { display:flex;flex-direction:column;gap:1.25rem; }
.in-session-indicator { display:flex;align-items:center;gap:8px; }
.session-live-dot { width:10px;height:10px;background:#ef4444;border-radius:50%;animation:pulseRed 1.5s infinite; }
@keyframes pulseRed { 0%,100%{opacity:1}50%{opacity:0.25} }
.session-live-text { font-size:0.75rem;font-weight:800;letter-spacing:0.1em;color:#ef4444;text-transform:uppercase; }

/* Course Banner */
.course-banner { background:linear-gradient(135deg,#4f46e5 0%,#6366f1 100%);border-radius:12px;padding:1.25rem;color:white; }
.badge-row { display:flex;gap:0.5rem;margin-bottom:0.5rem; }
.course-code { background:rgba(255,255,255,.2);padding:.2rem .7rem;border-radius:6px;font-size:.78rem;font-weight:600; }
.semester-badge-tag { background:rgba(0,0,0,.2);padding:.2rem .7rem;border-radius:6px;font-size:.78rem;font-weight:600; }
.course-name { margin:0 0 0.4rem;font-size:1.15rem;font-weight:700; }
.course-details { margin:0;font-size:.85rem;opacity:.85; }

/* OTP Entry */
.verification-box { background:#f8fafc;border-radius:12px;padding:1.5rem;text-align:center;border:1px solid #e2e8f0; }
.verification-box h4 { margin:0 0 .4rem;font-size:1.05rem;color:#0f172a; }
.verification-box p { margin:0 0 1.25rem;color:#64748b;font-size:.9rem; }
.code-inputs { display:flex;justify-content:center;gap:.6rem;margin-bottom:1.25rem; }
.pin-box { width:52px;height:60px;font-size:1.6rem;font-weight:800;text-align:center;border-radius:10px;border:2px solid #cbd5e1;background:#fff;color:#0f172a;outline:none;transition:all .2s; }
.pin-box:focus { border-color:#6366f1;box-shadow:0 0 0 3px rgba(99,102,241,.1); }
.pin-filled { border-color:#10b981;background:#ecfdf5;color:#065f46; }
.pin-error { display:flex;align-items:center;gap:8px;color:#dc2626;font-size:.85rem;font-weight:500;margin-top:0.9rem;background:#fef2f2;padding:0.6rem 0.75rem;border-radius:8px;text-align:left; }
.pin-error svg { width:16px;height:16px;flex-shrink:0; }
.primary-btn { background:#4f46e5;color:white;border:none;padding:.85rem 1.75rem;border-radius:10px;font-size:.95rem;font-weight:600;cursor:pointer;width:100%;display:flex;align-items:center;justify-content:center;gap:.5rem;transition:background .2s; }
.primary-btn:hover:not(:disabled) { background:#4338ca; }
.primary-btn:disabled { background:#94a3b8;cursor:not-allowed; }
.primary-btn svg { width:20px;height:20px; }
.spin { animation:spin 0.8s linear infinite; }
.resend-link { background:none;border:none;color:#6366f1;font-size:.85rem;font-weight:600;cursor:pointer;margin-top:.85rem;padding:.25rem; }
.resend-link:disabled { color:#94a3b8;cursor:not-allowed; }
.resend-link:hover:not(:disabled) { text-decoration:underline; }

/* Buttons */
.outline-btn { background:transparent;color:#0f172a;border:1px solid #cbd5e1;padding:.65rem 1.5rem;border-radius:8px;font-size:.9rem;font-weight:600;cursor:pointer;transition:all .2s;margin-top:0.5rem; }
.outline-btn:hover { background:#f1f5f9;border-color:#94a3b8; }

/* History */
.sessions-list { padding:1rem;display:flex;flex-direction:column;gap:.75rem;flex:1;overflow-y:auto; }
.empty-history { text-align:center;color:#94a3b8;font-size:.9rem;padding:2rem;font-style:italic; }
.history-item { display:flex;align-items:center;gap:.75rem;padding:.9rem;background:#f8fafc;border-radius:10px;border:1px solid #f1f5f9; }
.status-icon { width:34px;height:34px;border-radius:50%;display:flex;align-items:center;justify-content:center;flex-shrink:0; }
.status-icon.present { background:#dcfce7;color:#10b981; }
.status-icon.absent { background:#fee2e2;color:#ef4444; }
.status-icon svg { width:16px;height:16px; }
.history-details { flex:1; }
.history-details h4 { margin:0 0 .2rem;font-size:.88rem;color:#1e293b;font-weight:600; }
.history-details p { margin:0;font-size:.75rem;color:#64748b; }
.history-status { font-size:.75rem;font-weight:700;text-transform:uppercase; }
.history-status.present { color:#10b981; }
.history-status.absent { color:#ef4444; }

@media(max-width:1024px) { .attendance-content { grid-template-columns:1fr; } }
@media(max-width:768px) { .page-header { flex-direction:column;align-items:flex-start;gap:1rem; } .code-inputs { gap:.4rem; } .pin-box { width:44px;height:52px;font-size:1.3rem; } }
</style>