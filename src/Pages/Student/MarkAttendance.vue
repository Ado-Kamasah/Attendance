<template>

    <!-- ── COURSE-SPECIFIC VIEW (opened from My Courses) ── -->
    <template v-if="courseId">
      <div class="space-y-6 w-full max-w-7xl mx-auto">
      <!-- Back button + Course Header -->
      <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-outline/30 dark:border-dark-outline/40">
        <div class="flex items-center gap-3">
          <button
            @click="$emit('back')"
            class="p-2 rounded-xl bg-surface dark:bg-dark-surface border border-outline/50 dark:border-dark-outline/60 text-foreground/70 dark:text-white/80 hover:text-foreground dark:hover:text-white hover:border-secondary/40 transition-all cursor-pointer"
            title="Back to My Courses"
          >
            <ArrowLeft class="w-4 h-4" />
          </button>
          <div>
            <div class="flex items-center gap-2 mb-1 text-secondary dark:text-dark-secondary text-xs font-mono uppercase tracking-wider font-semibold">
              <span>ATTENDANCE RECORD // {{ filteredCourseCode }}</span>
            </div>
            <h1 class="text-2xl sm:text-3xl font-extrabold font-display tracking-tight text-foreground dark:text-white">
              {{ filteredCourseName }}
            </h1>
            <p class="text-xs font-mono text-foreground/60 dark:text-white/70 mt-0.5">Your full attendance log for this course</p>
          </div>
        </div>

        <!-- Live indicator -->
        <span class="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold font-mono bg-emerald-500/10 text-emerald-500 border border-emerald-500/30 self-start sm:self-auto">
          <span class="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
          Live Sync
        </span>
      </div>

      <!-- Summary KPI cards -->
      <div v-if="!isLoading" class="grid grid-cols-3 gap-4">
        <div class="p-4 rounded-2xl bg-surface dark:bg-dark-surface border border-outline/50 dark:border-dark-outline/60 shadow-xs text-center">
          <div class="text-2xl font-extrabold font-display text-success">{{ courseSummary.present }}</div>
          <div class="text-[11px] font-mono uppercase tracking-wider text-foreground/60 dark:text-white/65 mt-1">Present</div>
        </div>
        <div class="p-4 rounded-2xl bg-surface dark:bg-dark-surface border border-outline/50 dark:border-dark-outline/60 shadow-xs text-center">
          <div class="text-2xl font-extrabold font-display text-error">{{ courseSummary.absent }}</div>
          <div class="text-[11px] font-mono uppercase tracking-wider text-foreground/60 dark:text-white/65 mt-1">Absent</div>
        </div>
        <div class="p-4 rounded-2xl bg-surface dark:bg-dark-surface border border-outline/50 dark:border-dark-outline/60 shadow-xs text-center">
          <div
            class="text-2xl font-extrabold font-display"
            :class="courseSummary.rate >= 75 ? 'text-success' : courseSummary.rate >= 50 ? 'text-warning' : 'text-error'"
          >
            {{ courseSummary.rate }}%
          </div>
          <div class="text-[11px] font-mono uppercase tracking-wider text-foreground/60 dark:text-white/65 mt-1">Attendance Rate</div>
        </div>
      </div>

      <!-- Attendance Rate Bar -->
      <div v-if="!isLoading && courseSummary.total > 0" class="relative bg-surface dark:bg-dark-surface border border-outline/50 dark:border-dark-outline/60 rounded-2xl shadow-xs p-5">
        <div class="flex items-center justify-between mb-2 text-xs font-mono">
          <span class="text-foreground/70 dark:text-white/75 font-semibold">Attendance Rate</span>
          <span
            class="font-bold"
            :class="courseSummary.rate >= 75 ? 'text-success' : courseSummary.rate >= 50 ? 'text-warning' : 'text-error'"
          >{{ courseSummary.rate }}% ({{ courseSummary.total }} sessions)</span>
        </div>
        <div class="h-3 rounded-full bg-muted dark:bg-dark-muted overflow-hidden">
          <div
            class="h-full rounded-full transition-all duration-700"
            :class="courseSummary.rate >= 75 ? 'bg-success' : courseSummary.rate >= 50 ? 'bg-warning' : 'bg-error'"
            :style="{ width: `${courseSummary.rate}%` }"
          ></div>
        </div>
        <p v-if="courseSummary.rate < 75" class="text-[11px] font-mono text-error mt-2">
          ⚠ You need at least 75% attendance. You are {{ 75 - courseSummary.rate }}% below the threshold.
        </p>

        <!-- Absence Milestones Warning Alert -->
        <div 
          v-if="courseSummary.absent >= 3" 
          class="mt-3 p-3.5 rounded-xl border border-error/40 bg-error/10 dark:bg-dark-error/15 text-error flex items-start gap-2.5 text-xs"
        >
          <AlertOctagon class="w-4 h-4 shrink-0 mt-0.5" />
          <div>
            <span class="font-bold block">❌ Exam Ineligibility ({{ courseSummary.absent }} Classes Missed)</span>
            <span class="text-error/90 dark:text-error/80 mt-0.5 block">
              You have exceeded the maximum allowable absences (3 classes). You are NOT eligible to sit the examination for this course. Please consult your academic advisor immediately.
            </span>
          </div>
        </div>

        <div 
          v-else-if="courseSummary.absent === 2" 
          class="mt-3 p-3.5 rounded-xl border border-error/40 bg-error/10 dark:bg-dark-error/15 text-error flex items-start gap-2.5 text-xs"
        >
          <AlertTriangle class="w-4 h-4 shrink-0 mt-0.5 text-error" />
          <div>
            <span class="font-bold block">🚨 Critical Attendance Warning (2 Classes Missed)</span>
            <span class="text-error/90 dark:text-error/80 mt-0.5 block">
              You have missed 2 classes in this course. Missing 1 more class will make you ineligible to write the final examination.
            </span>
          </div>
        </div>

        <div 
          v-else-if="courseSummary.absent === 1" 
          class="mt-3 p-3.5 rounded-xl border border-warning/40 bg-warning/10 dark:bg-dark-warning/15 text-warning flex items-start gap-2.5 text-xs"
        >
          <AlertTriangle class="w-4 h-4 shrink-0 mt-0.5 text-warning" />
          <div>
            <span class="font-bold block">⚠️ Attendance Warning (1 Class Missed)</span>
            <span class="text-warning/90 dark:text-warning/80 mt-0.5 block">
              You have missed 1 class in this course. Remember that missing 3 classes will render you ineligible to sit the final examination.
            </span>
          </div>
        </div>
      </div>

      <!-- Full attendance log for this course -->
      <div class="relative bg-surface dark:bg-dark-surface border border-outline/50 dark:border-dark-outline/60 rounded-2xl shadow-xs overflow-hidden">
        <div class="absolute top-3 left-3 w-4 h-4 border-t-2 border-l-2 border-secondary/30 pointer-events-none"></div>
        <div class="absolute top-3 right-3 w-4 h-4 border-t-2 border-r-2 border-secondary/30 pointer-events-none"></div>

        <div class="flex items-center gap-2 p-5 pb-3 border-b border-outline/30 dark:border-dark-outline/40">
          <History class="w-4 h-4 text-secondary" />
          <h2 class="text-sm font-bold font-display uppercase tracking-wider text-foreground dark:text-white">Full Session Log</h2>
          <span class="ml-auto text-[11px] font-mono text-foreground/50 dark:text-white/60">{{ courseAttendanceHistory.length }} records</span>
        </div>

        <div class="p-5">
          <div v-if="isLoading" class="py-12 text-center text-xs font-mono text-foreground/50 dark:text-white/65 flex items-center justify-center gap-2">
            <RefreshCw class="w-4 h-4 animate-spin text-secondary" />
            <span>Loading attendance records…</span>
          </div>
          <div v-else-if="courseAttendanceHistory.length === 0" class="py-12 text-center space-y-2">
            <History class="w-8 h-8 mx-auto text-foreground/30 dark:text-white/35" />
            <p class="text-sm font-medium text-foreground dark:text-white">No records yet</p>
            <p class="text-xs font-mono text-foreground/50 dark:text-white/60">Attendance records will appear here once sessions have been conducted.</p>
          </div>
          <div v-else class="space-y-2.5">
            <div
              v-for="record in courseAttendanceHistory"
              :key="record.id"
              class="p-3 rounded-xl bg-muted/20 dark:bg-dark-muted/40 border border-outline/30 dark:border-dark-outline/40 flex items-center justify-between gap-3 text-xs"
            >
              <div class="flex items-center gap-2.5 min-w-0">
                <div
                  class="w-7 h-7 rounded-lg flex items-center justify-center shrink-0"
                  :class="record.status === 'present' ? 'bg-success/15 text-success' : 'bg-error/15 text-error'"
                >
                  <CheckCircle2 v-if="record.status === 'present'" class="w-4 h-4" />
                  <AlertOctagon v-else class="w-4 h-4" />
                </div>
                <div class="min-w-0">
                  <p class="font-semibold text-foreground dark:text-white">{{ record.date }}</p>
                  <p class="text-[10px] font-mono text-foreground/50 dark:text-white/60">{{ record.time }}</p>
                </div>
              </div>
              <span
                class="px-2.5 py-1 rounded-lg text-[10px] font-mono font-bold uppercase shrink-0"
                :class="record.status === 'present' ? 'bg-success/15 text-success border border-success/30' : 'bg-error/15 text-error border border-error/30'"
              >
                {{ record.status === 'present' ? 'Present' : 'Absent' }}
              </span>
            </div>
          </div>
        </div>
      </div>
      </div>
    </template>

    <!-- ── DEFAULT VIEW (all courses, opened from sidebar) ── -->
    <template v-else>
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
  AlertTriangle,
  History,
  ArrowLeft
} from 'lucide-vue-next';

const emit = defineEmits(['navigate', 'back']);

const props = defineProps({
  courseId: { type: String, default: null },
});

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
// ── Course-specific computed (when courseId prop is set) ──────────────────────
const filteredCourseCode = computed(() => {
  if (!props.courseId) return '';
  const c = coursesStore.getCourseById(props.courseId);
  return c?.code ?? '';
});

const filteredCourseName = computed(() => {
  if (!props.courseId) return '';
  const c = coursesStore.getCourseById(props.courseId);
  return c?.name ?? 'Course';
});

// All session IDs that belong to this course
const courseSessions = computed(() => {
  if (!props.courseId) return new Set();
  return new Set(sessions.value.filter(s => s.courseId === props.courseId).map(s => s.id));
});

// Attendance records for the student filtered to this course's sessions
const courseAttendanceHistory = computed(() => {
  if (!props.courseId) return [];
  const studentId = profile.value?.id;
  return attendances.value
    .filter(a => a.studentId === studentId && courseSessions.value.has(a.sessionId))
    .map(a => {
      const ts = a.timestamp ? new Date(a.timestamp) : null;
      return {
        id: a.id,
        date: ts ? ts.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' }) : '—',
        time: ts ? ts.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '—',
        status: a.status,
        rawTimestamp: a.timestamp,
      };
    })
    .sort((a, b) => new Date(b.rawTimestamp) - new Date(a.rawTimestamp));
});

const courseSummary = computed(() => {
  const records = courseAttendanceHistory.value;
  const present = records.filter(r => r.status === 'present').length;
  const absent  = records.filter(r => r.status === 'absent').length;
  const total   = records.length;
  const rate    = total > 0 ? Math.round((present / total) * 100) : 0;
  return { present, absent, total, rate };
});
</script>