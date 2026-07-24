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

          <!-- Active class code entry -->
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
              <h4>Enter Verification Code</h4>
              <p>
                Enter the 6-digit code shown on your lecturer's screen — it was also
                emailed to
                <strong v-if="maskedEmail">{{ maskedEmail }}</strong>
                <span v-else>your registered email</span>.
              </p>

              <div class="code-inputs">
                <input v-for="(n, idx) in 6" :key="idx" type="text" inputmode="numeric" maxlength="1"
                  class="pin-box" :class="{ 'pin-filled': otpCode[idx] }"
                  v-model="otpCode[idx]"
                  @input="onOtpInput(idx, $event)"
                  @keydown.backspace="onOtpBackspace(idx, $event)"
                  :ref="el => { if (el) otpRefs[idx] = el }" />
              </div>

              <div v-if="otpError" class="pin-error">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="12"></line><line x1="12" y1="16" x2="12.01" y2="16"></line></svg>
                {{ otpError }}
              </div>

              <button class="primary-btn submit-btn" @click="verifyOtp" :disabled="otpVerifying || otpCode.join('').length < 6">
                <svg v-if="otpVerifying" class="spin" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10" stroke-dasharray="31" stroke-dashoffset="10"></circle></svg>
                <svg v-else viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg>
                {{ otpVerifying ? 'Verifying…' : 'Verify & Mark Present' }}
              </button>

              <p class="resend-note">
                Didn't get the email, or has it expired? Ask your lecturer to resend it — only they can reissue it.
              </p>
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
import { ref, computed, onMounted, onUnmounted, watch } from 'vue';
import { storeToRefs } from 'pinia';
import { useAuthStore } from '@/stores/authstore';
import { useCoursesStore } from '@/stores/courses';
import { useSchedulesStore } from '@/stores/schedules';
import { useEnrollmentsStore } from '@/stores/enrollments';
import { useSessionsStore } from '@/stores/sessions';
import { useAttendancesStore } from '@/stores/attendances';
import { useAuditLogsStore } from '@/stores/auditlogs';
import { supabase } from '@/stores/supabase';

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

const OTP_API_BASE = import.meta.env.VITE_OTP_API_URL || '';

// sessionCourseMap: sessionId -> { code, name } — resolved via store first, then Supabase fallback
const sessionCourseMap = ref({});
const attendanceMarked = ref(false);
const markedCourseName = ref('');
const markedAtTime = ref('');

// 6 digits — matches the PIN shown live on the lecturer's dashboard.
const otpCode = ref(['', '', '', '', '', '']);
const otpRefs = ref([]);
const otpError = ref('');
const otpVerifying = ref(false);

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
      // Fetch ALL sessions (no isActive filter) so history can resolve past sessions
      sessionsStore.fetchSessions(),
      attendancesStore.fetchAttendances({ studentId: profile.value?.id }),
    ]);

    coursesStore.subscribeToCourses();
    schedulesStore.subscribeToSchedules();
    enrollmentsStore.subscribeToEnrollments();
    sessionsStore.subscribeToSessions();
    attendancesStore.subscribeToAttendances();

    // Initial course resolution for existing attendance records
    await resolveSessionCourses();
  } catch (e) {
    console.error('Error loading attendance data:', e);
  } finally {
    isLoading.value = false;
  }
});

// When attendances change (new record arrives via realtime), resolve any new session ids
watch(attendances, async () => { await resolveSessionCourses(); }, { deep: true });

onUnmounted(() => {
  coursesStore.unsubscribeFromCourses();
  schedulesStore.unsubscribeFromSchedules();
  enrollmentsStore.unsubscribeFromEnrollments();
  sessionsStore.unsubscribeFromSessions();
  attendancesStore.unsubscribeFromAttendances();
});

// ── Course resolution ─────────────────────────────────────────────────────────
const isLoading = ref(true);

/**
 * For every attendance record, try to resolve the course via:
 *   1. Local sessions store (fast path)
 *   2. Supabase join sessions -> courses (fallback for sessions not in store cache)
 * Results are cached in sessionCourseMap.
 */
async function resolveSessionCourses() {
  const myAttendances = attendances.value.filter(
    (a) => a.studentId === profile.value?.id
  );
  const unresolvedIds = myAttendances
    .map((a) => a.sessionId)
    .filter((sid) => sid && !sessionCourseMap.value[sid]);

  if (unresolvedIds.length === 0) return;

  // Step 1: resolve from local store
  const stillMissing = [];
  for (const sid of unresolvedIds) {
    const session = sessionsStore.getSessionById(sid);
    if (session?.courseId) {
      const course = coursesStore.getCourseById(session.courseId);
      if (course) {
        sessionCourseMap.value = {
          ...sessionCourseMap.value,
          [sid]: { code: course.code, name: course.name },
        };
        continue;
      }
    }
    stillMissing.push(sid);
  }

  if (stillMissing.length === 0) return;

  // Step 2: Supabase fallback — two-step: get course_id from sessions, then fetch courses
  const { data: sessionRows, error: sessErr } = await supabase
    .from('sessions')
    .select('id, course_id')
    .in('id', stillMissing);

  if (sessErr) {
    console.error('[MarkAttendance] Failed to resolve sessions:', sessErr);
    return;
  }

  const courseIds = [...new Set((sessionRows ?? []).map(r => r.course_id).filter(Boolean))];
  if (courseIds.length === 0) return;

  const { data: courseRows, error: courseErr } = await supabase
    .from('courses')
    .select('id, code, name')
    .in('id', courseIds);

  if (courseErr) {
    console.error('[MarkAttendance] Failed to resolve courses:', courseErr);
    return;
  }

  const courseById = {};
  (courseRows ?? []).forEach(c => { courseById[c.id] = c; });

  const updated = { ...sessionCourseMap.value };
  (sessionRows ?? []).forEach((row) => {
    const course = courseById[row.course_id];
    updated[row.id] = course
      ? { code: course.code, name: course.name }
      : { code: row.course_id?.slice(0, 8) ?? '?', name: 'Unknown Course' };
  });
  sessionCourseMap.value = updated;
}

const enrolledCourseIds = computed(() =>
  enrollments.value
    .filter((e) => e.studentId === profile.value?.id)
    .map((e) => e.courseId)
);

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
    const sessionId = activeClass.value.id;
    const studentId = profile.value?.id;

    const res = await fetch(`${OTP_API_BASE}/api/otp/verify`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ sessionId, studentId, otp: code }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || 'Invalid code.');

    // The lecturer pre-seeds a 'pending' row for every selected student when
    // the session starts. Flip that row to 'present' instead of inserting a
    // new one. If no row exists (e.g. a walk-in the lecturer didn't select),
    // fall back to creating one directly.
    const existing = attendancesStore.getAttendanceRecord(sessionId, studentId);

    if (existing?.status === 'present') {
      throw new Error('Attendance already recorded for this session.');
    }

    if (existing) {
      await attendancesStore.updateAttendanceStatus(existing.id, 'present');
    } else {
      await attendancesStore.markAttendance({ sessionId, studentId, status: 'present' });
    }

    const now = new Date();
    markedCourseName.value = `${activeClass.value.code} — ${activeClass.value.name}`;
    markedAtTime.value = now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });

    sessionCourseMap.value = {
      ...sessionCourseMap.value,
      [sessionId]: { code: activeClass.value.code, name: activeClass.value.name },
    };

    auditLogsStore.logAction({
      action: 'attendance_marked',
      details: `Marked present for ${markedCourseName.value} (dashboard code verified)`,
      userId: profile.value?.id,
      userRole: profile.value?.role,
      userName: profile.value?.name,
    });

    attendanceMarked.value = true;
    otpCode.value = ['', '', '', '', '', ''];
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
  otpCode.value = ['', '', '', '', '', ''];
  otpError.value = '';
  fetchActiveSessions();
};

const attendanceHistory = computed(() => {
  return attendances.value
    .filter((a) => a.studentId === profile.value?.id)
    .map((a) => {
      const resolved = sessionCourseMap.value[a.sessionId];
      // Show course code + name if resolved; fall back to raw session ID prefix so it's never blank
      const courseLabel = resolved
        ? `${resolved.code} — ${resolved.name}`
        : a.sessionId
          ? `Session ${a.sessionId.slice(0, 8)}…`
          : 'Loading…';
      const ts = a.timestamp ? new Date(a.timestamp) : null;

      return {
        id: a.id,
        course: courseLabel,
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