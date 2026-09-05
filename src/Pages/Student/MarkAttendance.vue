<template>
  <div class="attendance-container">
    <div class="page-header">
      <div>
        <h1 class="page-title">Attendance Status</h1>
        <p class="page-subtitle">Your presence is recorded automatically by your lecturer.</p>
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

          <!-- Active class status -->
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

            <!-- Attendance status card -->
            <div class="attendance-status-card" :class="mySessionStatus">
              <div class="status-icon-large" :class="mySessionStatus">
                <svg v-if="mySessionStatus === 'present'" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="20 6 9 17 4 12"></polyline></svg>
                <svg v-else-if="mySessionStatus === 'absent'" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
                <svg v-else viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg>
              </div>
              <div class="status-text-wrap">
                <h4 class="status-title" v-if="mySessionStatus === 'present'">You're Marked Present ✓</h4>
                <h4 class="status-title absent-title" v-else-if="mySessionStatus === 'absent'">Marked Absent</h4>
                <h4 class="status-title pending-title" v-else>Awaiting Attendance</h4>
                <p class="status-desc" v-if="mySessionStatus === 'present'">
                  Your attendance for <strong>{{ activeClass.code }}</strong> has been recorded. A confirmation was sent to your email.
                </p>
                <p class="status-desc" v-else-if="mySessionStatus === 'absent'">
                  You were not selected as present for this session. Contact your lecturer if this is incorrect.
                </p>
                <p class="status-desc" v-else>
                  The session is live. Your lecturer is taking attendance — your status will appear here shortly.
                </p>
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

// Computed attendance status for the currently active session
const mySessionStatus = computed(() => {
  const session = activeSessionRaw.value;
  if (!session) return null;
  const studentId = profile.value?.id;
  const record = attendancesStore.getAttendanceRecord(session.id, studentId);
  return record?.status ?? null; // 'present' | 'absent' | null
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

const resetState = () => {
  attendanceMarked.value = false;
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

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap');
* { font-family: 'Inter', sans-serif; box-sizing: border-box; }

.attendance-container { display:flex;flex-direction:column;gap:2rem;width:100%; }
.page-header { display:flex;justify-content:space-between;align-items:center;gap:1rem;flex-wrap:wrap; }
.page-title { margin:0;font-size:1.75rem;font-weight:700;color:#0f172a;letter-spacing:-0.025em; }
.page-subtitle { margin:0.25rem 0 0;font-size:0.95rem;color:#64748b; }
.live-badge { display:flex;align-items:center;gap:0.5rem;background:#f1f5f9;color:#334155;padding:0.5rem 1rem;border-radius:9999px;font-size:0.85rem;font-weight:600;border:1px solid #e2e8f0;white-space:nowrap;flex-shrink:0; }
.pulse-dot { width:8px;height:8px;background:#10b981;border-radius:50%;animation:pulse 2s infinite;flex-shrink:0; }
@keyframes pulse { 0%{transform:scale(.95);box-shadow:0 0 0 0 rgba(16,185,129,.7)} 70%{transform:scale(1);box-shadow:0 0 0 5px rgba(16,185,129,0)} 100%{transform:scale(.95);box-shadow:0 0 0 0 rgba(16,185,129,0)} }

.attendance-content { display:grid;grid-template-columns:3fr 2fr;gap:1.5rem;min-width:0; }
.active-session-panel,.history-panel { background:#fff;border-radius:16px;box-shadow:0 4px 6px -1px rgba(0,0,0,.05);border:1px solid rgba(226,232,240,.8);display:flex;flex-direction:column;min-width:0; }
.panel-header { padding:1.25rem 1.5rem;border-bottom:1px solid #f1f5f9;display:flex;justify-content:space-between;align-items:center; }
.panel-header h2 { margin:0;font-size:1.1rem;font-weight:700;color:#0f172a; }
.refresh-btn { background:none;border:none;color:#94a3b8;cursor:pointer;padding:4px;border-radius:6px;display:flex;align-items:center;transition:all 0.2s; }
.refresh-btn:hover { background:#f1f5f9;color:#475569; }
.refresh-btn svg { width:16px;height:16px; }
.session-body { padding:1.5rem;flex:1;display:flex;flex-direction:column;min-width:0; }

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
.marked-course-badge { background:#e0e7ff;color:#3730a3;padding:0.4rem 1rem;border-radius:8px;font-weight:700;font-size:0.9rem;max-width:100%;word-break:break-word; }
.marked-time { font-size:0.8rem;color:#94a3b8; }

/* No Session */
.no-session-state { display:flex;flex-direction:column;align-items:center;justify-content:center;text-align:center;padding:3rem 1rem;background:#f8fafc;border-radius:12px;border:1px dashed #cbd5e1;flex:1; }
.icon-wrap-large { width:64px;height:64px;background:#fff;border-radius:50%;display:flex;align-items:center;justify-content:center;color:#94a3b8;box-shadow:0 4px 6px rgba(0,0,0,.05);margin-bottom:1.5rem; }
.icon-wrap-large svg { width:32px;height:32px; }
.no-session-state h3 { margin:0 0 0.5rem;color:#1e293b;font-size:1.2rem; }
.no-session-state p { color:#64748b;margin:0 0 1.5rem;max-width:280px;line-height:1.5;font-size:0.9rem; }

/* In-session indicator */
.active-class-ui { display:flex;flex-direction:column;gap:1.25rem;min-width:0; }
.in-session-indicator { display:flex;align-items:center;gap:8px; }
.session-live-dot { width:10px;height:10px;background:#ef4444;border-radius:50%;animation:pulseRed 1.5s infinite;flex-shrink:0; }
@keyframes pulseRed { 0%,100%{opacity:1}50%{opacity:0.25} }
.session-live-text { font-size:0.75rem;font-weight:800;letter-spacing:0.1em;color:#ef4444;text-transform:uppercase; }

/* Course Banner */
.course-banner { background:linear-gradient(135deg,#4f46e5 0%,#6366f1 100%);border-radius:12px;padding:1.25rem;color:white;min-width:0; }
.badge-row { display:flex;gap:0.5rem;margin-bottom:0.5rem;flex-wrap:wrap; }
.course-code { background:rgba(255,255,255,.2);padding:.2rem .7rem;border-radius:6px;font-size:.78rem;font-weight:600; }
.semester-badge-tag { background:rgba(0,0,0,.2);padding:.2rem .7rem;border-radius:6px;font-size:.78rem;font-weight:600; }
.course-name { margin:0 0 0.4rem;font-size:1.15rem;font-weight:700;word-break:break-word; }
.course-details { margin:0;font-size:.85rem;opacity:.85;word-break:break-word; }

/* Attendance Status Card */
.attendance-status-card {
  display: flex;
  align-items: flex-start;
  gap: 1rem;
  padding: 1.25rem;
  border-radius: 12px;
  border: 1.5px solid #e2e8f0;
  background: #f8fafc;
  min-width: 0;
  transition: border-color 0.3s, background 0.3s;
}
.attendance-status-card.present {
  background: #ecfdf5;
  border-color: #6ee7b7;
}
.attendance-status-card.absent {
  background: #fef2f2;
  border-color: #fca5a5;
}
.status-icon-large {
  width: 48px;
  height: 48px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  background: #e2e8f0;
  color: #64748b;
}
.status-icon-large.present {
  background: #dcfce7;
  color: #16a34a;
}
.status-icon-large.absent {
  background: #fee2e2;
  color: #dc2626;
}
.status-icon-large svg { width: 22px; height: 22px; }
.status-text-wrap { flex: 1; min-width: 0; }
.status-title {
  margin: 0 0 0.35rem;
  font-size: 1rem;
  font-weight: 700;
  color: #0f172a;
}
.absent-title { color: #dc2626; }
.pending-title { color: #64748b; }
.status-desc {
  margin: 0;
  font-size: 0.85rem;
  color: #64748b;
  line-height: 1.55;
}

/* Buttons */
.outline-btn { background:transparent;color:#0f172a;border:1px solid #cbd5e1;padding:.65rem 1.5rem;border-radius:8px;font-size:.9rem;font-weight:600;cursor:pointer;transition:all .2s;margin-top:0.5rem; }
.outline-btn:hover { background:#f1f5f9;border-color:#94a3b8; }

/* History */
.sessions-list { padding:1rem;display:flex;flex-direction:column;gap:.75rem;flex:1;overflow-y:auto; }
.empty-history { text-align:center;color:#94a3b8;font-size:.9rem;padding:2rem;font-style:italic; }
.history-item { display:flex;align-items:center;gap:.75rem;padding:.9rem;background:#f8fafc;border-radius:10px;border:1px solid #f1f5f9;min-width:0; }
.status-icon { width:34px;height:34px;border-radius:50%;display:flex;align-items:center;justify-content:center;flex-shrink:0; }
.status-icon.present { background:#dcfce7;color:#10b981; }
.status-icon.absent { background:#fee2e2;color:#ef4444; }
.status-icon svg { width:16px;height:16px; }
.history-details { flex:1;min-width:0; }
.history-details h4 { margin:0 0 .2rem;font-size:.88rem;color:#1e293b;font-weight:600;word-break:break-word; }
.history-details p { margin:0;font-size:.75rem;color:#64748b; }
.history-status { font-size:.75rem;font-weight:700;text-transform:uppercase;flex-shrink:0; }
.history-status.present { color:#10b981; }
.history-status.absent { color:#ef4444; }

/* ==========================================================================
   Responsive Breakpoints
   L  (large / laptop-desktop): < 1200px  — tighten gaps
   M  (tablet):                 < 1024px  — stack columns
   S  (small tablet / large phone): < 768px — stack header, shrink pins
   XS (mobile):                 < 480px  — compact spacing, smaller pins/type
   ========================================================================== */

/* L — Large screens / small laptops */
@media (max-width: 1200px) {
  .attendance-content { gap: 1.25rem; }
}

/* M — Tablets: stack the two-column layout */
@media (max-width: 1024px) {
  .attendance-content { grid-template-columns: 1fr; }
}

/* S — Small tablets / large phones */
@media (max-width: 768px) {
  .attendance-container { gap: 1.5rem; }
  .page-header { flex-direction: column; align-items: flex-start; gap: 1rem; }
  .page-title { font-size: 1.5rem; }
  .panel-header { padding: 1rem 1.25rem; }
  .session-body { padding: 1.25rem; }
  .course-banner { padding: 1rem; }
  .verification-box { padding: 1.25rem; }
  .code-inputs { gap: .5rem; }
  .pin-box { width: 44px; height: 52px; font-size: 1.3rem; }
}

/* XS — Mobile phones */
@media (max-width: 480px) {
  .attendance-container { gap: 1.25rem; }
  .page-title { font-size: 1.3rem; }
  .page-subtitle { font-size: 0.85rem; }
  .live-badge { font-size: 0.78rem; padding: 0.4rem 0.85rem; }
  .panel-header { padding: 1rem; }
  .panel-header h2 { font-size: 1rem; }
  .session-body { padding: 1rem; }
  .course-banner { padding: 0.9rem; }
  .course-name { font-size: 1.05rem; }
  .verification-box { padding: 1rem; }
  .verification-box h4 { font-size: 0.95rem; }
  .code-inputs { gap: .35rem; }
  .pin-box { width: 38px; height: 46px; font-size: 1.15rem; border-radius: 8px; }
  .primary-btn { padding: .75rem 1.25rem; font-size: 0.9rem; }
  .success-icon-wrap { width: 60px; height: 60px; }
  .success-icon-wrap svg { width: 30px; height: 30px; }
  .success-state h3 { font-size: 1.2rem; }
  .icon-wrap-large { width: 52px; height: 52px; margin-bottom: 1rem; }
  .icon-wrap-large svg { width: 26px; height: 26px; }
  .no-session-state { padding: 2rem 1rem; }
  .history-item { padding: 0.75rem; gap: 0.6rem; }
  .sessions-list { padding: 0.75rem; }
}
</style>