<template>
  <div class="space-y-6 w-full max-w-7xl mx-auto">
    <!-- Header with Blueprint Eyebrow -->
    <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-outline/30 dark:border-dark-outline/40">
      <div>
        <div class="flex items-center gap-2 mb-3 text-secondary dark:text-dark-secondary text-xs font-mono uppercase tracking-wider font-semibold">
          <span>PRESENCE VERIFICATION // LIVE INSTRUCTION ROLL</span>
          <svg class="text-secondary/40 w-20 h-2" viewBox="0 0 140 8" fill="none">
            <path d="M0 4H140" stroke="currentColor" stroke-width="1.5" />
          </svg>
        </div>
        <h1 class="text-2xl sm:text-3xl font-extrabold font-display tracking-tight text-foreground dark:text-white">
          Attendance <span class="text-secondary dark:text-dark-secondary">Status & Radar</span>
        </h1>
        <p class="text-xs sm:text-sm font-mono text-foreground/60 dark:text-white/70 mt-1">
          Real-time synchronized attendance feed from faculty instructors
        </p>
      </div>

      <div class="flex items-center gap-3">
        <span class="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold font-mono bg-emerald-500/10 text-emerald-500 border border-emerald-500/30">
          <span class="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
          System Live
        </span>
      </div>
    </div>

    <!-- 2-Column Split Content -->
    <div class="grid grid-cols-1 lg:grid-cols-12 gap-6">
      <!-- Left: Active Session Tracker (7 cols) -->
      <div class="lg:col-span-7 space-y-4">
        <div class="relative bg-surface dark:bg-dark-surface border border-outline/50 dark:border-dark-outline/60 rounded-2xl shadow-xs overflow-hidden p-6">
          <div class="absolute top-3 left-3 w-4 h-4 border-t-2 border-l-2 border-secondary/30 pointer-events-none"></div>
          <div class="absolute top-3 right-3 w-4 h-4 border-t-2 border-r-2 border-secondary/30 pointer-events-none"></div>

          <div class="flex items-center justify-between pb-3 border-b border-outline/30 dark:border-dark-outline/40">
            <div class="flex items-center gap-2">
              <Radio class="w-4 h-4 text-secondary animate-pulse" />
              <h2 class="text-sm font-bold font-display uppercase tracking-wider text-foreground dark:text-white">
                Current Active Session
              </h2>
            </div>
            <button 
              @click="fetchActiveSessions" 
              title="Refresh radar"
              class="p-1.5 rounded-lg text-foreground/50 hover:text-foreground hover:bg-muted/40 transition-colors cursor-pointer"
            >
              <RefreshCw class="w-4 h-4" :class="{ 'animate-spin': isLoading }" />
            </button>
          </div>

          <div class="pt-4">
            <!-- Loading -->
            <div v-if="isLoading" class="py-16 text-center text-xs font-mono text-foreground/50 dark:text-white/65 flex items-center justify-center gap-2">
              <RefreshCw class="w-4 h-4 animate-spin text-secondary" />
              <span>Scanning for active lecture sessions…</span>
            </div>

            <!-- SUCCESS STATE (Just marked) -->
            <div v-else-if="attendanceMarked" class="py-10 text-center space-y-3">
              <div class="w-14 h-14 rounded-2xl bg-success/15 text-success mx-auto flex items-center justify-center shadow-lg shadow-success/20">
                <CheckCircle2 class="w-8 h-8" />
              </div>
              <h3 class="text-lg font-bold font-display text-foreground dark:text-white">Attendance Confirmed</h3>
              <p class="text-xs text-foreground/70">You are recorded as <strong>present</strong> for</p>
              <div class="inline-block px-3 py-1 rounded-lg bg-secondary/15 text-secondary font-bold font-mono text-xs border border-secondary/30">
                {{ markedCourseName }}
              </div>
              <p class="text-[11px] font-mono text-foreground/50">Recorded at {{ markedAtTime }}</p>
              <button 
                @click="resetState"
                class="mt-2 px-4 py-1.5 rounded-xl bg-muted/60 text-foreground font-semibold text-xs hover:bg-muted transition-colors cursor-pointer"
              >
                Dismiss
              </button>
            </div>

            <!-- No Active Class -->
            <div v-else-if="!activeClass" class="py-16 text-center text-foreground/50 dark:text-white/65 space-y-3">
              <Clock class="w-10 h-10 mx-auto text-foreground/30 dark:text-white/40" />
              <div>
                <h3 class="text-sm font-bold text-foreground dark:text-white">No Live Classes Active</h3>
                <p class="text-xs font-mono mt-1 max-w-sm mx-auto">
                  No attendance session is running for your enrolled modules. The feed updates automatically.
                </p>
              </div>
              <button 
                @click="fetchActiveSessions"
                class="px-4 py-2 rounded-xl bg-primary dark:bg-dark-secondary text-surface dark:text-primary font-semibold text-xs shadow-xs hover:opacity-90 transition-opacity cursor-pointer"
              >
                Refresh Status
              </button>
            </div>

            <!-- Active class status -->
            <div v-else class="space-y-4">
              <div class="inline-flex items-center gap-2 px-2.5 py-1 rounded-full text-[11px] font-bold font-mono bg-emerald-500/10 text-emerald-500 border border-emerald-500/30">
                <span class="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                <span>CLASS IN SESSION</span>
              </div>

              <!-- Course Details Banner -->
              <div class="p-4 rounded-xl bg-muted/30 dark:bg-dark-muted/30 border border-outline/30 dark:border-dark-outline/40 space-y-1.5">
                <div class="flex items-center gap-2">
                  <span class="text-xs font-bold font-mono text-secondary dark:text-dark-secondary">
                    {{ activeClass.code }}
                  </span>
                  <span class="px-2 py-0.2 rounded text-[10px] font-mono bg-muted/60 text-foreground/60 border border-outline/20">
                    {{ activeClass.semester }}
                  </span>
                </div>
                <h3 class="text-base font-bold text-foreground dark:text-white">
                  {{ activeClass.name }}
                </h3>
                <p class="text-xs font-mono text-foreground/60 dark:text-white/70">
                  {{ activeClass.lecturer }} &bull; Live Session Synchronized
                </p>
              </div>

              <!-- Status Card -->
              <div 
                class="p-4 rounded-xl border flex items-start gap-3.5"
                :class="mySessionStatus === 'present' 
                  ? 'bg-success/10 border-success/30' 
                  : mySessionStatus === 'absent' 
                  ? 'bg-error/10 border-error/30' 
                  : 'bg-amber-500/10 border-amber-500/30'"
              >
                <div 
                  class="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
                  :class="mySessionStatus === 'present' ? 'bg-success text-white' : mySessionStatus === 'absent' ? 'bg-error text-white' : 'bg-amber-500 text-white'"
                >
                  <CheckCircle2 v-if="mySessionStatus === 'present'" class="w-5 h-5" />
                  <AlertOctagon v-else-if="mySessionStatus === 'absent'" class="w-5 h-5" />
                  <Clock v-else class="w-5 h-5 animate-pulse" />
                </div>

                <div class="min-w-0 flex-1 text-xs">
                  <h4 
                    class="font-bold text-sm"
                    :class="mySessionStatus === 'present' ? 'text-success' : mySessionStatus === 'absent' ? 'text-error' : 'text-amber-600 dark:text-amber-400'"
                  >
                    {{ mySessionStatus === 'present' ? "You're Marked Present ✓" : mySessionStatus === 'absent' ? 'Marked Absent' : 'Awaiting Attendance' }}
                  </h4>

                  <p class="text-foreground/70 dark:text-white/80 mt-1 leading-relaxed">
                    <template v-if="mySessionStatus === 'present'">
                      Your presence for <strong>{{ activeClass.code }}</strong> has been confirmed by the instructor.
                    </template>
                    <template v-else-if="mySessionStatus === 'absent'">
                      You were marked absent for this lecture. Please verify with your lecturer if this is an error.
                    </template>
                    <template v-else>
                      The session is live. Your lecturer is conducting roll call — your mark will synchronize here instantly.
                    </template>
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Right: Recent Session History (5 cols) -->
      <div class="lg:col-span-5 space-y-4">
        <div class="relative bg-surface dark:bg-dark-surface border border-outline/50 dark:border-dark-outline/60 rounded-2xl shadow-xs overflow-hidden p-6">
          <div class="absolute top-3 left-3 w-4 h-4 border-t-2 border-l-2 border-secondary/30 pointer-events-none"></div>
          <div class="absolute top-3 right-3 w-4 h-4 border-t-2 border-r-2 border-secondary/30 pointer-events-none"></div>

          <div class="flex items-center gap-2 pb-3 border-b border-outline/30 dark:border-dark-outline/40">
            <History class="w-4 h-4 text-secondary" />
            <h2 class="text-sm font-bold font-display uppercase tracking-wider text-foreground dark:text-white">
              Recent Roll History
            </h2>
          </div>

          <div class="pt-4">
            <div v-if="attendanceHistory.length === 0" class="py-12 text-center text-xs font-mono text-foreground/50 dark:text-white/65">
              No recent attendance logs recorded yet.
            </div>

            <div v-else class="space-y-2.5 max-h-96 overflow-y-auto pr-1">
              <div 
                v-for="record in attendanceHistory" 
                :key="record.id"
                class="p-3 rounded-xl bg-muted/20 dark:bg-dark-muted/20 border border-outline/30 dark:border-dark-outline/40 flex items-center justify-between gap-3 text-xs"
              >
                <div class="flex items-center gap-2.5 min-w-0">
                  <div 
                    class="w-6 h-6 rounded-lg flex items-center justify-center shrink-0"
                    :class="record.status === 'present' ? 'bg-success/15 text-success' : 'bg-error/15 text-error'"
                  >
                    <CheckCircle2 v-if="record.status === 'present'" class="w-3.5 h-3.5" />
                    <AlertOctagon v-else class="w-3.5 h-3.5" />
                  </div>
                  <div class="min-w-0">
                    <p class="font-semibold text-foreground dark:text-white truncate">
                      {{ record.course }}
                    </p>
                    <p class="text-[10px] font-mono text-foreground/50">
                      {{ record.date }} &bull; {{ record.time }}
                    </p>
                  </div>
                </div>

                <span 
                  class="px-2 py-0.5 rounded text-[10px] font-mono font-bold shrink-0 uppercase"
                  :class="record.status === 'present' ? 'bg-success/15 text-success border border-success/30' : 'bg-error/15 text-error border border-error/30'"
                >
                  {{ record.statusText }}
                </span>
              </div>
            </div>
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
import { 
  Radio, 
  RefreshCw, 
  CheckCircle2, 
  Clock, 
  AlertOctagon, 
  History 
} from 'lucide-vue-next';

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

const sessionCourseMap = ref({});
const attendanceMarked = ref(false);
const markedCourseName = ref('');
const markedAtTime = ref('');
const isLoading = ref(true);

const mySessionStatus = computed(() => {
  const session = activeSessionRaw.value;
  if (!session) return null;
  const studentId = profile.value?.id;
  const record = attendancesStore.getAttendanceRecord(session.id, studentId);
  return record?.status ?? null;
});

onMounted(async () => {
  isLoading.value = true;
  try {
    await Promise.all([
      coursesStore.fetchCourses(),
      schedulesStore.fetchSchedules(),
      enrollmentsStore.fetchEnrollments({ studentId: profile.value?.id }),
      sessionsStore.fetchSessions(),
      attendancesStore.fetchAttendances({ studentId: profile.value?.id }),
    ]);

    coursesStore.subscribeToCourses();
    schedulesStore.subscribeToSchedules();
    enrollmentsStore.subscribeToEnrollments();
    sessionsStore.subscribeToSessions();
    attendancesStore.subscribeToAttendances();

    await resolveSessionCourses();
  } catch (e) {
    console.error('Error loading attendance data:', e);
  } finally {
    isLoading.value = false;
  }
});

watch(attendances, async () => { await resolveSessionCourses(); }, { deep: true });

onUnmounted(() => {
  coursesStore.unsubscribeFromCourses();
  schedulesStore.unsubscribeFromSchedules();
  enrollmentsStore.unsubscribeFromEnrollments();
  sessionsStore.unsubscribeFromSessions();
  attendancesStore.unsubscribeFromAttendances();
});

async function resolveSessionCourses() {
  const myAttendances = attendances.value.filter(
    (a) => a.studentId === profile.value?.id
  );
  const unresolvedIds = myAttendances
    .map((a) => a.sessionId)
    .filter((sid) => sid && !sessionCourseMap.value[sid]);

  if (unresolvedIds.length === 0) return;

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
    lecturer: schedule?.lecturer ?? 'Assigned Faculty',
  };
});

const fetchActiveSessions = async () => {
  isLoading.value = true;
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
        time: ts ? ts.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '',
        status: a.status,
        statusText: a.status === 'present' ? 'Present' : 'Absent',
        rawTimestamp: a.timestamp,
      };
    })
    .sort((x, y) => new Date(y.rawTimestamp) - new Date(x.rawTimestamp))
    .slice(0, 10);
});
</script>