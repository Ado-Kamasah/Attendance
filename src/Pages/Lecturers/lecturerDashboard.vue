<template>
  <div class="space-y-6 w-full max-w-7xl mx-auto">
    <!-- Header with Blueprint Eyebrow -->
    <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-outline/30 dark:border-dark-outline/40">
      <div>
        <div class="flex items-center gap-2 mb-3 text-secondary dark:text-dark-secondary text-xs font-mono uppercase tracking-wider font-semibold">
          <span>FACULTY INSTRUCTION // LECTURER PORTAL</span>
          <svg class="text-secondary/40 w-20 h-2" viewBox="0 0 140 8" fill="none">
            <path d="M0 4H140" stroke="currentColor" stroke-width="1.5" />
          </svg>
        </div>
        <h1 class="text-2xl sm:text-3xl font-extrabold font-display tracking-tight text-foreground dark:text-dark-foreground">
          Academic Overview &bull; <span class="text-secondary dark:text-dark-secondary">{{ lecturerName || 'Faculty Member' }}</span>
        </h1>
        <p class="text-xs sm:text-sm font-mono text-foreground/60 dark:text-dark-foreground/60 mt-1">
          {{ currentDate }} &bull; Today's Instruction Schedule
        </p>
      </div>

      <div class="flex items-center gap-3">
        <button 
          @click="$emit('navigate', '/attendance-view')"
          class="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-primary dark:bg-dark-secondary text-surface dark:text-primary font-semibold text-xs sm:text-sm shadow-md hover:opacity-90 active:scale-98 transition-all cursor-pointer"
        >
          <ClipboardCheck class="w-4 h-4" />
          <span>Launch Roll Call</span>
        </button>
      </div>
    </div>

    <!-- Key Metrics Grid -->
    <div class="grid grid-cols-1 sm:grid-cols-3 gap-4">
      <!-- Total Active Courses -->
      <div class="relative p-5 bg-surface dark:bg-dark-surface border border-outline/50 dark:border-dark-outline/60 rounded-2xl shadow-xs overflow-hidden group">
        <div class="flex items-center justify-between">
          <span class="text-xs font-mono font-medium text-foreground/60 dark:text-dark-foreground/60 uppercase tracking-wider">
            Active Courses
          </span>
          <div class="w-9 h-9 rounded-xl bg-indigo-500/10 text-indigo-500 border border-indigo-500/20 flex items-center justify-center">
            <BookOpen class="w-4.5 h-4.5" />
          </div>
        </div>
        <div class="mt-3 flex items-baseline gap-2">
          <span class="text-3xl font-extrabold font-display text-foreground dark:text-dark-foreground">
            {{ totalActiveCourses }}
          </span>
          <span class="text-[11px] font-mono text-foreground/50 dark:text-dark-foreground/50">Current Term</span>
        </div>
      </div>

      <!-- Total Students Taught -->
      <div class="relative p-5 bg-surface dark:bg-dark-surface border border-outline/50 dark:border-dark-outline/60 rounded-2xl shadow-xs overflow-hidden group">
        <div class="flex items-center justify-between">
          <span class="text-xs font-mono font-medium text-foreground/60 dark:text-dark-foreground/60 uppercase tracking-wider">
            Students Taught
          </span>
          <div class="w-9 h-9 rounded-xl bg-pink-500/10 text-pink-500 border border-pink-500/20 flex items-center justify-center">
            <Users class="w-4.5 h-4.5" />
          </div>
        </div>
        <div class="mt-3 flex items-baseline gap-2">
          <span class="text-3xl font-extrabold font-display text-foreground dark:text-dark-foreground">
            {{ totalStudentsTaught }}
          </span>
          <span class="text-[11px] font-mono text-foreground/50 dark:text-dark-foreground/50">Total Enrolled</span>
        </div>
      </div>

      <!-- Average Attendance Rate -->
      <div class="relative p-5 bg-surface dark:bg-dark-surface border border-outline/50 dark:border-dark-outline/60 rounded-2xl shadow-xs overflow-hidden group">
        <div class="flex items-center justify-between">
          <span class="text-xs font-mono font-medium text-foreground/60 dark:text-dark-foreground/60 uppercase tracking-wider">
            Avg Turnout Rate
          </span>
          <div class="w-9 h-9 rounded-xl bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 flex items-center justify-center">
            <TrendingUp class="w-4.5 h-4.5" />
          </div>
        </div>
        <div class="mt-3 flex items-baseline gap-2">
          <span 
            class="text-3xl font-extrabold font-display"
            :class="averageAttendanceRate >= 75 ? 'text-success' : averageAttendanceRate >= 50 ? 'text-warning' : 'text-error'"
          >
            {{ averageAttendanceRate }}%
          </span>
          <span class="text-[11px] font-mono text-foreground/50 dark:text-dark-foreground/50">Cross-Cohort</span>
        </div>
      </div>
    </div>

    <!-- Split Content: Today's Schedule & Quick Links -->
    <div class="grid grid-cols-1 lg:grid-cols-12 gap-6">
      <!-- Left: Following Classes Today (8 cols) -->
      <div class="lg:col-span-8 space-y-4">
        <div class="relative bg-surface dark:bg-dark-surface border border-outline/50 dark:border-dark-outline/60 rounded-2xl shadow-xs overflow-hidden p-5">
          <div class="absolute top-3 left-3 w-4 h-4 border-t-2 border-l-2 border-secondary/30 pointer-events-none"></div>
          <div class="absolute top-3 right-3 w-4 h-4 border-t-2 border-r-2 border-secondary/30 pointer-events-none"></div>

          <div class="flex items-center justify-between pb-3 border-b border-outline/30 dark:border-dark-outline/40">
            <div class="flex items-center gap-2">
              <Calendar class="w-4 h-4 text-secondary" />
              <h2 class="text-sm sm:text-base font-bold font-display uppercase tracking-wider text-foreground dark:text-dark-foreground">
                Classes Scheduled Today
              </h2>
            </div>
            <button 
              @click="$emit('navigate', '/lecturer-courses')"
              class="text-xs font-semibold text-secondary hover:underline flex items-center gap-1 cursor-pointer"
            >
              <span>View Full Routine</span>
              <ChevronRight class="w-3.5 h-3.5" />
            </button>
          </div>

          <div class="pt-4">
            <div v-if="todaySchedule.length === 0" class="py-12 text-center text-foreground/50 dark:text-dark-foreground/50">
              <CalendarX2 class="w-8 h-8 mx-auto mb-2 text-foreground/30 dark:text-dark-foreground/30" />
              <p class="text-sm font-medium text-foreground dark:text-dark-foreground">No lectures scheduled today</p>
              <p class="text-xs font-mono mt-0.5">Prepare materials for upcoming sessions or review past attendance records.</p>
            </div>

            <div v-else class="space-y-3">
              <div 
                v-for="cls in todaySchedule" 
                :key="cls.id"
                class="p-4 rounded-xl border transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                :class="cls.status === 'ongoing' 
                  ? 'bg-secondary/5 dark:bg-dark-secondary/5 border-secondary/40 shadow-xs ring-1 ring-secondary/20' 
                  : 'bg-muted/20 dark:bg-dark-muted/20 border-outline/30 dark:border-dark-outline/40 hover:bg-muted/40'"
              >
                <div class="flex items-start gap-3">
                  <!-- Time pillar -->
                  <div class="px-3 py-1.5 rounded-lg bg-surface dark:bg-dark-surface border border-outline/40 dark:border-dark-outline/40 text-center shrink-0">
                    <span class="block text-xs font-bold font-mono text-foreground dark:text-dark-foreground">
                      {{ cls.startTime }}
                    </span>
                    <span class="block text-[10px] font-mono text-foreground/45 dark:text-dark-foreground/45">
                      {{ cls.endTime }}
                    </span>
                  </div>

                  <div class="min-w-0">
                    <div class="flex items-center gap-2">
                      <span class="text-xs font-bold font-mono text-secondary dark:text-dark-secondary">
                        {{ cls.code }}
                      </span>
                      <!-- Status badge -->
                      <span 
                        class="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold font-mono"
                        :class="[
                          cls.status === 'ongoing' ? 'bg-emerald-500/15 text-emerald-500 border border-emerald-500/30 animate-pulse' : '',
                          cls.status === 'upcoming' ? 'bg-blue-500/15 text-blue-500 border border-blue-500/30' : '',
                          cls.status === 'completed' ? 'bg-muted text-foreground/60 border border-outline/40' : ''
                        ]"
                      >
                        <span v-if="cls.status === 'ongoing'" class="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                        {{ cls.statusText }}
                      </span>
                    </div>

                    <h3 class="text-xs sm:text-sm font-semibold text-foreground dark:text-dark-foreground truncate mt-0.5">
                      {{ cls.name }}
                    </h3>
                    <p class="text-[11px] font-mono text-foreground/50 dark:text-dark-foreground/50 mt-0.5">
                      Venue: <strong>{{ cls.venue }}</strong> &bull; {{ cls.students }} Students Registered
                    </p>
                  </div>
                </div>

                <div class="flex items-center gap-2 self-end sm:self-center">
                  <button 
                    @click="markAttendance(cls)"
                    class="px-3.5 py-1.5 rounded-lg bg-primary dark:bg-dark-secondary text-surface dark:text-primary font-semibold text-xs shadow-xs hover:opacity-90 transition-opacity flex items-center gap-1.5 cursor-pointer"
                  >
                    <ClipboardCheck class="w-3.5 h-3.5" />
                    <span>Take Attendance</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Right: Quick Actions & Alerts (4 cols) -->
      <div class="lg:col-span-4 space-y-4">
        <!-- Quick Action Tiles -->
        <div class="relative bg-surface dark:bg-dark-surface border border-outline/50 dark:border-dark-outline/60 rounded-2xl shadow-xs overflow-hidden p-5">
          <div class="flex items-center gap-2 pb-3 border-b border-outline/30 dark:border-dark-outline/40">
            <Sparkles class="w-4 h-4 text-secondary" />
            <h2 class="text-xs font-bold font-display uppercase tracking-wider text-foreground dark:text-dark-foreground">
              Teaching Tools
            </h2>
          </div>

          <div class="pt-3 space-y-2">
            <button 
              @click="$emit('navigate', '/lecturer-courses')"
              class="w-full p-3 rounded-xl bg-muted/20 dark:bg-dark-muted/20 hover:bg-muted/40 border border-outline/30 dark:border-dark-outline/40 flex items-center gap-3 transition-colors text-left group cursor-pointer"
            >
              <div class="w-8 h-8 rounded-lg bg-indigo-500/10 text-indigo-500 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                <BookOpen class="w-4 h-4" />
              </div>
              <div class="min-w-0">
                <p class="text-xs font-semibold text-foreground dark:text-dark-foreground group-hover:text-secondary transition-colors">
                  My Assigned Courses
                </p>
                <p class="text-[10px] font-mono text-foreground/50 dark:text-dark-foreground/50">
                  Course details & rosters
                </p>
              </div>
            </button>

            <button 
              @click="$emit('navigate', '/attendance-view')"
              class="w-full p-3 rounded-xl bg-muted/20 dark:bg-dark-muted/20 hover:bg-muted/40 border border-outline/30 dark:border-dark-outline/40 flex items-center gap-3 transition-colors text-left group cursor-pointer"
            >
              <div class="w-8 h-8 rounded-lg bg-emerald-500/10 text-emerald-500 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                <ClipboardCheck class="w-4 h-4" />
              </div>
              <div class="min-w-0">
                <p class="text-xs font-semibold text-foreground dark:text-dark-foreground group-hover:text-secondary transition-colors">
                  Roll Call Manager
                </p>
                <p class="text-[10px] font-mono text-foreground/50 dark:text-dark-foreground/50">
                  Record & edit session marks
                </p>
              </div>
            </button>

            <button 
              @click="$emit('navigate', '/lecturer-reports')"
              class="w-full p-3 rounded-xl bg-muted/20 dark:bg-dark-muted/20 hover:bg-muted/40 border border-outline/30 dark:border-dark-outline/40 flex items-center gap-3 transition-colors text-left group cursor-pointer"
            >
              <div class="w-8 h-8 rounded-lg bg-purple-500/10 text-purple-500 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                <FileSpreadsheet class="w-4 h-4" />
              </div>
              <div class="min-w-0">
                <p class="text-xs font-semibold text-foreground dark:text-dark-foreground group-hover:text-secondary transition-colors">
                  Detailed Course Reports
                </p>
                <p class="text-[10px] font-mono text-foreground/50 dark:text-dark-foreground/50">
                  Export CSV & eligibility lists
                </p>
              </div>
            </button>
          </div>
        </div>

        <!-- System Alerts Panel -->
        <div class="relative bg-surface dark:bg-dark-surface border border-outline/50 dark:border-dark-outline/60 rounded-2xl shadow-xs overflow-hidden p-5">
          <div class="flex items-center gap-2 pb-3 border-b border-outline/30 dark:border-dark-outline/40">
            <Bell class="w-4 h-4 text-secondary" />
            <h2 class="text-xs font-bold font-display uppercase tracking-wider text-foreground dark:text-dark-foreground">
              Faculty Bulletins
            </h2>
          </div>

          <div class="pt-3 space-y-2.5">
            <div class="p-3 rounded-xl bg-amber-500/10 border border-amber-500/25 flex items-start gap-2.5">
              <AlertTriangle class="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
              <div class="min-w-0">
                <p class="text-xs font-bold text-foreground dark:text-dark-foreground">Mid-Semester Audit</p>
                <p class="text-[11px] text-foreground/70 dark:text-dark-foreground/70 mt-0.5">
                  Verify attendance counts before the exam eligibility deadline.
                </p>
              </div>
            </div>

            <div class="p-3 rounded-xl bg-muted/30 dark:bg-dark-muted/30 border border-outline/30 dark:border-dark-outline/40 flex items-start gap-2.5">
              <CheckCircle2 class="w-4 h-4 text-success shrink-0 mt-0.5" />
              <div class="min-w-0">
                <p class="text-xs font-bold text-foreground dark:text-dark-foreground">All Submissions Synced</p>
                <p class="text-[11px] text-foreground/70 dark:text-dark-foreground/70 mt-0.5">
                  Previous week's attendance records have been registered.
                </p>
              </div>
            </div>
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
import { useSchedulesStore } from '@/stores/schedules';
import { useCoursesStore } from '@/stores/courses';
import { useEnrollmentsStore } from '@/stores/enrollments';
import { useSessionsStore } from '@/stores/sessions';
import { useAttendancesStore } from '@/stores/attendances';
import { 
  BookOpen, 
  Users, 
  TrendingUp, 
  Calendar, 
  CalendarX2, 
  ChevronRight, 
  ClipboardCheck, 
  FileSpreadsheet, 
  Sparkles, 
  Bell, 
  AlertTriangle, 
  CheckCircle2 
} from 'lucide-vue-next';

const emit = defineEmits(['navigate']);

const authStore = useAuthStore();
const schedulesStore = useSchedulesStore();
const coursesStore = useCoursesStore();
const enrollmentsStore = useEnrollmentsStore();
const sessionsStore = useSessionsStore();
const attendancesStore = useAttendancesStore();

const { profile } = storeToRefs(authStore);
const { schedules } = storeToRefs(schedulesStore);
const { courses } = storeToRefs(coursesStore);
const { enrollments } = storeToRefs(enrollmentsStore);
const { sessions } = storeToRefs(sessionsStore);
const { attendances } = storeToRefs(attendancesStore);

const currentDate = new Date().toLocaleDateString('en-US', {
  weekday: 'long',
  year: 'numeric',
  month: 'long',
  day: 'numeric'
});

const currentDayName = new Date().toLocaleDateString('en-US', { weekday: 'long' });

const now = ref(new Date());
let clockInterval = null;

onMounted(async () => {
  try {
    await Promise.all([
      schedulesStore.fetchSchedules(),
      coursesStore.fetchCourses(),
      enrollmentsStore.fetchEnrollments(),
      sessionsStore.fetchSessions(),
      attendancesStore.fetchAttendances(),
    ]);

    schedulesStore.subscribeToSchedules();
    coursesStore.subscribeToCourses();
    enrollmentsStore.subscribeToEnrollments();
    sessionsStore.subscribeToSessions();
    attendancesStore.subscribeToAttendances();
  } catch (error) {
    console.error('Error fetching dashboard data:', error);
  }

  clockInterval = setInterval(() => {
    now.value = new Date();
  }, 30 * 1000);
});

onUnmounted(() => {
  schedulesStore.unsubscribeFromSchedules();
  coursesStore.unsubscribeFromCourses();
  enrollmentsStore.unsubscribeFromEnrollments();
  sessionsStore.unsubscribeFromSessions();
  attendancesStore.unsubscribeFromAttendances();

  if (clockInterval) clearInterval(clockInterval);
});

const lecturerName = computed(() => profile.value?.name ?? '');

const lecturerCourseIds = computed(() => {
  const ids = new Set(
    schedules.value
      .filter((s) => s.lecturer === lecturerName.value)
      .map((s) => s.courseId)
  );
  return [...ids];
});

const lecturerCourses = computed(() =>
  lecturerCourseIds.value
    .map((id) => coursesStore.getCourseById(id))
    .filter(Boolean)
);

const totalActiveCourses = computed(
  () => lecturerCourses.value.filter((c) => c.status === 'active').length
);

const totalStudentsTaught = computed(() => {
  const studentIds = new Set(
    enrollments.value
      .filter((e) => lecturerCourseIds.value.includes(e.courseId))
      .map((e) => e.studentId)
  );
  return studentIds.size;
});

const averageAttendanceRate = computed(() => {
  const lecturerSessionIds = new Set(
    sessions.value
      .filter((s) => lecturerCourseIds.value.includes(s.courseId))
      .map((s) => s.id)
  );
  if (lecturerSessionIds.size === 0) return 0;

  const relevant = attendances.value.filter((a) => lecturerSessionIds.has(a.sessionId));
  if (relevant.length === 0) return 0;

  const present = relevant.filter((a) => a.status === 'present').length;
  return Math.round((present / relevant.length) * 100);
});

function parseTimeToMinutes(timeStr) {
  if (!timeStr) return null;
  const [h, m] = timeStr.split(':').map(Number);
  if (Number.isNaN(h) || Number.isNaN(m)) return null;
  return h * 60 + m;
}

const todaySchedule = computed(() => {
  const nowMinutes = now.value.getHours() * 60 + now.value.getMinutes();

  return schedules.value
    .filter((s) => s.lecturer === lecturerName.value && s.day === currentDayName)
    .sort((a, b) => (a.startTime || '').localeCompare(b.startTime || ''))
    .map((s) => {
      const course = coursesStore.getCourseById(s.courseId);
      const startMinutes = parseTimeToMinutes(s.startTime);
      const endMinutes = parseTimeToMinutes(s.endTime);

      let status = 'upcoming';
      let statusText = 'Upcoming';

      if (startMinutes !== null && endMinutes !== null) {
        if (nowMinutes >= startMinutes && nowMinutes <= endMinutes) {
          status = 'ongoing';
          statusText = 'Ongoing';
        } else if (nowMinutes > endMinutes) {
          status = 'completed';
          statusText = 'Completed';
        }
      }

      return {
        id: s.id,
        courseId: s.courseId,
        code: course?.code ?? 'Unknown',
        name: course?.name ?? 'Unknown Course',
        startTime: s.startTime,
        endTime: s.endTime,
        venue: s.venue,
        students: enrollmentsStore.enrollmentsByCourse(s.courseId).length,
        status,
        statusText,
      };
    });
});

const markAttendance = (cls) => {
  localStorage.setItem('activeCourseId', cls.courseId);
  localStorage.setItem('activeCourseCode', cls.code);
  localStorage.setItem('activeCourseName', cls.name);
  emit('navigate', '/attendance-view');
};
</script>