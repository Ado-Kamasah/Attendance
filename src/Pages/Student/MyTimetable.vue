<template>
  <div class="space-y-6 w-full max-w-7xl mx-auto">
    <!-- Header -->
    <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-outline/30 dark:border-dark-outline/40">
      <div>
        <div class="flex items-center gap-2 mb-3 text-secondary dark:text-dark-secondary text-xs font-mono uppercase tracking-wider font-semibold">
          <span>STUDENT PORTAL // ACADEMIC TIMETABLE</span>
          <svg class="text-secondary/40 w-20 h-2" viewBox="0 0 140 8" fill="none">
            <path d="M0 4H140" stroke="currentColor" stroke-width="1.5" />
          </svg>
        </div>
        <h1 class="text-2xl sm:text-3xl font-extrabold font-display tracking-tight text-foreground dark:text-white">
          My <span class="text-secondary dark:text-dark-secondary">Timetable</span>
        </h1>
        <p class="text-xs sm:text-sm font-mono text-foreground/60 dark:text-white/70 mt-1">
          Weekly schedule generated from your enrolled courses ({{ activeTab === 'regular' ? 'Monday – Friday' : 'Thursday – Sunday' }})
        </p>
      </div>

      <!-- Mode switcher (only shown if student has access to both regular and weekend) -->
      <div
        v-if="availableTabs.length > 1"
        class="flex items-center gap-1 p-1 rounded-xl bg-muted/40 dark:bg-dark-muted/40 border border-outline/30 dark:border-dark-outline/40 self-start sm:self-auto"
      >
        <button
          v-for="tab in availableTabs"
          :key="tab.key"
          @click="activeTab = tab.key"
          class="flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold font-mono transition-all duration-200 cursor-pointer"
          :class="activeTab === tab.key
            ? 'bg-secondary text-primary shadow-sm'
            : 'text-foreground/60 dark:text-white/60 hover:text-foreground dark:hover:text-white'"
        >
          <component :is="tab.icon" class="w-3.5 h-3.5" />
          {{ tab.label }}
        </button>
      </div>

      <!-- Single programme indicator (when student is locked to Regular or Weekend) -->
      <div
        v-else-if="availableTabs.length === 1"
        class="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-muted/40 dark:bg-dark-muted/40 border border-outline/30 dark:border-dark-outline/40 self-start sm:self-auto"
      >
        <component :is="availableTabs[0].icon" class="w-4 h-4 text-secondary dark:text-dark-secondary" />
        <span class="text-xs font-mono font-bold text-foreground dark:text-white">
          {{ availableTabs[0].label }} Timetable
        </span>
        <span class="text-[10px] font-mono px-2 py-0.5 rounded-full bg-secondary/15 text-secondary border border-secondary/30 font-semibold">
          Your Programme
        </span>
      </div>
    </div>

    <!-- Loading -->
    <div v-if="isLoading" class="flex flex-col items-center justify-center py-24 gap-4">
      <div class="w-10 h-10 border-4 border-secondary/30 border-t-secondary rounded-full animate-spin"></div>
      <p class="text-sm font-mono text-foreground/50 dark:text-white/50">Building your timetable...</p>
    </div>

    <template v-else>
      <!-- Empty state -->
      <div
        v-if="timetableEntries.length === 0"
        class="flex flex-col items-center justify-center py-24 gap-4 rounded-2xl border border-dashed border-outline/40 dark:border-dark-outline/40"
      >
        <div class="w-16 h-16 rounded-2xl bg-muted/40 dark:bg-dark-muted/40 flex items-center justify-center">
          <CalendarDays class="w-8 h-8 text-foreground/30 dark:text-white/30" />
        </div>
        <div class="text-center">
          <p class="text-sm font-semibold text-foreground dark:text-white">No timetable entries found</p>
          <p class="text-xs font-mono text-foreground/50 dark:text-white/60 mt-1">
            Register for courses with assigned schedules to see your timetable here.
          </p>
        </div>
      </div>

      <template v-else>
        <!-- Mode badge row -->
        <div class="flex items-center justify-between flex-wrap gap-3">
          <div class="flex items-center gap-2">
            <span
              class="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold font-mono border"
              :class="activeTab === 'regular'
                ? 'bg-blue-500/10 text-blue-400 border-blue-500/30'
                : 'bg-violet-500/10 text-violet-400 border-violet-500/30'"
            >
              <span
                class="w-2 h-2 rounded-full animate-pulse"
                :class="activeTab === 'regular' ? 'bg-blue-400' : 'bg-violet-400'"
              ></span>
              {{ activeTab === 'regular' ? 'Regular Programme · Mon to Fri' : 'Weekend Programme · Thu to Sun' }}
            </span>
            <span class="text-xs font-mono text-foreground/40 dark:text-white/40">
              {{ visibleEntries.length }} class{{ visibleEntries.length !== 1 ? 'es' : '' }} scheduled
            </span>
          </div>
          <span class="text-[11px] font-mono text-foreground/30 dark:text-white/30 hidden sm:block">
            Tip: Use browser print (Ctrl+P) to export your timetable
          </span>
        </div>

        <!-- Timetable grid card -->
        <div class="relative bg-surface dark:bg-dark-surface border border-outline/50 dark:border-dark-outline/60 rounded-2xl shadow-xs overflow-hidden">
          <div class="absolute top-3 left-3 w-4 h-4 border-t-2 border-l-2 border-secondary/20 pointer-events-none z-10"></div>
          <div class="absolute top-3 right-3 w-4 h-4 border-t-2 border-r-2 border-secondary/20 pointer-events-none z-10"></div>

          <div class="overflow-x-auto">
            <div :style="{ minWidth: `${activeDays.length * 160 + 80}px` }">
              <!-- Day header -->
              <div
                class="grid border-b border-outline/30 dark:border-dark-outline/40 bg-muted/30 dark:bg-dark-muted/20"
                :style="{ gridTemplateColumns: `80px repeat(${activeDays.length}, 1fr)` }"
              >
                <div class="px-3 py-4 text-[10px] font-mono font-bold uppercase tracking-wider text-foreground/40 dark:text-white/40 border-r border-outline/20 dark:border-dark-outline/30">
                  TIME
                </div>
                <div
                  v-for="day in activeDays"
                  :key="day"
                  class="px-3 py-4 text-center border-r border-outline/20 dark:border-dark-outline/30 last:border-r-0"
                >
                  <p class="text-[10px] font-mono font-bold uppercase tracking-widest text-foreground/40 dark:text-white/40">
                    {{ day.slice(0, 3) }}
                  </p>
                  <p class="text-sm font-extrabold font-display text-foreground dark:text-white mt-0.5">
                    {{ day }}
                  </p>
                  <p class="text-[10px] font-mono text-foreground/30 dark:text-white/30 mt-0.5">
                    {{ entriesForDay(day).length }} class{{ entriesForDay(day).length !== 1 ? 'es' : '' }}
                  </p>
                </div>
              </div>

              <!-- Grid body -->
              <div
                class="relative grid"
                :style="{ gridTemplateColumns: `80px repeat(${activeDays.length}, 1fr)`, height: `${GRID_HEIGHT}px` }"
              >
                <!-- Time labels -->
                <div class="relative border-r border-outline/20 dark:border-dark-outline/30">
                  <div
                    v-for="(slot, i) in TIME_SLOTS"
                    :key="slot"
                    class="absolute left-0 right-0 px-3 pt-1"
                    :style="{ top: `${i * SLOT_HEIGHT}px`, height: `${SLOT_HEIGHT}px` }"
                  >
                    <span class="text-[10px] font-mono text-foreground/40 dark:text-white/40">{{ slot }}</span>
                    <div class="absolute left-0 right-0 top-0 border-t border-outline/15 dark:border-dark-outline/15"></div>
                  </div>
                </div>

                <!-- Day columns -->
                <div
                  v-for="day in activeDays"
                  :key="day"
                  class="relative border-r border-outline/20 dark:border-dark-outline/30 last:border-r-0"
                >
                  <!-- Hour lines -->
                  <div
                    v-for="(_, i) in TIME_SLOTS"
                    :key="`line-${i}`"
                    class="absolute left-0 right-0 border-t border-outline/15 dark:border-dark-outline/15"
                    :style="{ top: `${i * SLOT_HEIGHT}px` }"
                  ></div>
                  <!-- Half-hour dashes -->
                  <div
                    v-for="(_, i) in TIME_SLOTS"
                    :key="`half-${i}`"
                    class="absolute left-4 right-0 border-t border-dashed border-outline/8 dark:border-dark-outline/10"
                    :style="{ top: `${i * SLOT_HEIGHT + SLOT_HEIGHT / 2}px` }"
                  ></div>

                  <!-- Course blocks (content adapts to available height) -->
                  <div
                    v-for="entry in entriesForDay(day)"
                    :key="`${entry.courseId}-${entry.startTime}`"
                    class="absolute left-1.5 right-1.5 rounded-xl overflow-hidden border shadow-sm transition-all duration-200 hover:scale-[1.02] hover:shadow-lg hover:z-30 cursor-default"
                    :style="blockStyle(entry)"
                    :class="courseColorClasses(entry.colorIndex)"
                    :title="`${entry.courseCode} - ${entry.courseName}\n${entry.startTime} to ${entry.endTime}\nVenue: ${entry.venue}\nLecturer: ${entry.lecturer}\nCredits: ${entry.credits} · Duration: ${durationLabel(entry)}`"
                  >
                    <!-- Left accent bar -->
                    <div class="absolute left-0 top-0 bottom-0 w-1.5 rounded-l-xl" :class="colorAccent(entry.colorIndex)"></div>

                    <!-- ① Tiny block: < 70px — only code + time range -->
                    <div v-if="blockHeightPx(entry) < 70" class="pl-3 pr-2 py-1 h-full flex flex-col justify-center overflow-hidden">
                      <p class="text-[10px] font-black font-mono leading-tight truncate">{{ entry.courseCode }}</p>
                      <p class="text-[9px] font-mono truncate opacity-70 mt-0.5">{{ entry.startTime }}–{{ entry.endTime }}</p>
                    </div>

                    <!-- ② Medium block: 70–149px (≈1 hr) — code, name, time -->
                    <div v-else-if="blockHeightPx(entry) < 150" class="pl-3 pr-2 py-1.5 h-full flex flex-col justify-between overflow-hidden">
                      <div>
                        <p class="text-[10px] font-black font-mono leading-tight truncate">{{ entry.courseCode }}</p>
                        <p class="text-[10px] font-semibold leading-tight truncate opacity-85 mt-0.5">{{ entry.courseName }}</p>
                      </div>
                      <p class="text-[9px] font-mono truncate opacity-70 mt-1">{{ entry.startTime }} – {{ entry.endTime }}</p>
                    </div>

                    <!-- ③ Large block: 150–224px (≈2 hrs) — code, name, time, venue, credits -->
                    <div v-else-if="blockHeightPx(entry) < 225" class="pl-3 pr-2 py-2 h-full flex flex-col justify-between overflow-hidden">
                      <div>
                        <div class="flex items-center justify-between gap-1 mb-0.5">
                          <p class="text-[10px] font-black font-mono leading-tight truncate">{{ entry.courseCode }}</p>
                          <span class="text-[9px] font-bold font-mono px-1.5 py-0.5 rounded-md opacity-80 bg-black/10 dark:bg-white/10 shrink-0">{{ durationLabel(entry) }}</span>
                        </div>
                        <p class="text-[10px] font-semibold leading-tight truncate opacity-85">{{ entry.courseName }}</p>
                      </div>
                      <div class="mt-1 space-y-0.5">
                        <p class="text-[9px] font-mono truncate opacity-75">🕐 {{ entry.startTime }} – {{ entry.endTime }}</p>
                        <p v-if="entry.venue" class="text-[9px] font-mono truncate opacity-70">📍 {{ entry.venue }}</p>
                        <p class="text-[9px] font-mono truncate opacity-65">{{ entry.credits }} cr</p>
                      </div>
                    </div>

                    <!-- ④ Full block: ≥ 225px (≈3 hrs) — everything -->
                    <div v-else class="pl-3 pr-2 py-2.5 h-full flex flex-col justify-between overflow-hidden">
                      <div>
                        <div class="flex items-center justify-between gap-1 mb-1">
                          <p class="text-[11px] font-black font-mono leading-tight truncate">{{ entry.courseCode }}</p>
                          <span class="text-[9px] font-bold font-mono px-1.5 py-0.5 rounded-md bg-black/10 dark:bg-white/10 shrink-0">{{ durationLabel(entry) }}</span>
                        </div>
                        <p class="text-[10px] font-semibold leading-snug opacity-90 line-clamp-2">{{ entry.courseName }}</p>
                      </div>
                      <div class="mt-2 space-y-1">
                        <p class="text-[9px] font-mono truncate opacity-75">🕐 {{ entry.startTime }} – {{ entry.endTime }}</p>
                        <p v-if="entry.venue" class="text-[9px] font-mono truncate opacity-70">📍 {{ entry.venue }}</p>
                        <p class="text-[9px] font-mono truncate opacity-70">👤 {{ entry.lecturer }}</p>
                        <p class="text-[9px] font-bold font-mono opacity-80">{{ entry.credits }} Credit Hrs</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>


        <!-- Summary stats -->
        <div class="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div
            v-for="stat in summaryStats"
            :key="stat.label"
            class="p-4 rounded-xl bg-surface dark:bg-dark-surface border border-outline/40 dark:border-dark-outline/50 flex flex-col gap-1"
          >
            <span class="text-[10px] font-mono font-medium text-foreground/50 dark:text-white/55 uppercase tracking-wider">{{ stat.label }}</span>
            <span class="text-2xl font-extrabold font-display text-foreground dark:text-white">{{ stat.value }}</span>
            <span class="text-[10px] font-mono text-foreground/40 dark:text-white/40">{{ stat.sub }}</span>
          </div>
        </div>
      </template>
    </template>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted, watch } from 'vue';
import { storeToRefs } from 'pinia';
import { useAuthStore } from '@/stores/authstore';
import { useCoursesStore } from '@/stores/courses';
import { useSchedulesStore } from '@/stores/schedules';
import { useEnrollmentsStore } from '@/stores/enrollments';
import { CalendarDays, CalendarRange, Calendar } from 'lucide-vue-next';

const authStore        = useAuthStore();
const coursesStore     = useCoursesStore();
const schedulesStore   = useSchedulesStore();
const enrollmentsStore = useEnrollmentsStore();

const { profile }     = storeToRefs(authStore);
const { courses }     = storeToRefs(coursesStore);
const { schedules }   = storeToRefs(schedulesStore);
const { enrollments } = storeToRefs(enrollmentsStore);

// ── Constants ─────────────────────────────────────────────────────────────────
const REGULAR_DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];
const WEEKEND_DAYS = ['Thursday', 'Friday', 'Saturday', 'Sunday'];

const TIME_START  = 6;   // 06:00
const TIME_END    = 22;  // 22:00
const SLOT_HEIGHT = 90;  // px per hour — 1 hr = 90px, 2 hr = 176px, 3 hr = 266px
const GRID_HEIGHT = (TIME_END - TIME_START) * SLOT_HEIGHT;

const TIME_SLOTS = Array.from({ length: TIME_END - TIME_START }, (_, i) => {
  const h = TIME_START + i;
  return `${String(h).padStart(2, '0')}:00`;
});

const PALETTE = ['blue','violet','emerald','amber','rose','cyan','orange','teal','pink','indigo'];

const TABS = [
  { key: 'regular', label: 'Regular',  icon: Calendar },
  { key: 'weekend', label: 'Weekend',  icon: CalendarRange },
];

// ── State ─────────────────────────────────────────────────────────────────────
const activeTab = ref('regular');
const isLoading = ref(true);

const activeDays = computed(() =>
  activeTab.value === 'regular' ? REGULAR_DAYS : WEEKEND_DAYS
);

// ── Data loading ──────────────────────────────────────────────────────────────
onMounted(async () => {
  try {
    await Promise.all([
      coursesStore.fetchCourses({ status: 'active' }),
      schedulesStore.fetchSchedules(),
      enrollmentsStore.fetchEnrollments({ studentId: profile.value?.id }),
    ]);
    enrollmentsStore.subscribeToEnrollments();
    schedulesStore.subscribeToSchedules();
  } catch (e) {
    console.error('Timetable load error', e);
  } finally {
    isLoading.value = false;
  }
});

onUnmounted(() => {
  enrollmentsStore.unsubscribeFromEnrollments();
  schedulesStore.unsubscribeFromSchedules();
});

// ── Computed ──────────────────────────────────────────────────────────────────
const enrolledCourseIds = computed(() =>
  new Set(enrollments.value.map((e) => e.courseId))
);

const courseColorMap = computed(() => {
  const map = {};
  let i = 0;
  enrolledCourseIds.value.forEach((id) => { map[id] = i++ % PALETTE.length; });
  return map;
});

const studentProfileMode = computed(() => {
  const raw = profile.value?.mode || profile.value?.study_mode || authStore.user?.user_metadata?.mode || '';
  const m = raw.trim().toLowerCase();
  if (m.includes('regular') || m === 'day' || m === 'full-time' || m === 'full_time') return 'regular';
  if (m.includes('weekend') || m === 'modular' || m === 'part-time' || m === 'part_time') return 'weekend';
  return null;
});

/** Enrolled schedule modes detected from the student's courses */
const detectedScheduleModes = computed(() => {
  const modes = new Set();
  schedules.value
    .filter((s) => enrolledCourseIds.value.has(s.courseId))
    .forEach((s) => {
      const m = (s.mode ?? '').trim().toLowerCase();
      if (m === 'regular' || m === 'weekend') {
        modes.add(m);
      } else if (s.day) {
        if (['Saturday', 'Sunday'].includes(s.day)) modes.add('weekend');
        if (['Monday', 'Tuesday', 'Wednesday'].includes(s.day)) modes.add('regular');
      }
    });
  return modes;
});

const hasRegular = computed(() => {
  // If student profile explicitly sets mode, respect it strictly
  if (studentProfileMode.value) return studentProfileMode.value === 'regular';
  // Otherwise, if student only has weekend schedules, do not show regular
  if (detectedScheduleModes.value.size > 0 && !detectedScheduleModes.value.has('regular')) return false;
  return true;
});

const hasWeekend = computed(() => {
  // If student profile explicitly sets mode, respect it strictly
  if (studentProfileMode.value) return studentProfileMode.value === 'weekend';
  // Otherwise, if student only has regular schedules, do not show weekend
  if (detectedScheduleModes.value.size > 0 && !detectedScheduleModes.value.has('weekend')) return false;
  return true;
});

/** Only expose tabs the student is allowed to see */
const availableTabs = computed(() =>
  TABS.filter((t) => (t.key === 'regular' ? hasRegular.value : hasWeekend.value))
);

// Auto-select and lock the correct tab
watch(availableTabs, (tabs) => {
  if (tabs.length && !tabs.some((t) => t.key === activeTab.value)) {
    activeTab.value = tabs[0].key;
  }
}, { immediate: true });

/**
 * Filter timetable entries strictly for the active/allowed programme.
 * Regular students will never see weekend slots; Weekend students will never see regular slots.
 */
const timetableEntries = computed(() => {
  const currentMode = activeTab.value; // 'regular' | 'weekend'

  return schedules.value
    .filter((s) => enrolledCourseIds.value.has(s.courseId))
    .filter((s) => {
      const sMode = (s.mode ?? '').trim().toLowerCase();
      if (sMode) {
        return sMode === currentMode;
      }
      // If schedule mode is not explicitly specified, filter strictly by day
      if (currentMode === 'regular') {
        return REGULAR_DAYS.includes(s.day);
      }
      if (currentMode === 'weekend') {
        return WEEKEND_DAYS.includes(s.day);
      }
      return true;
    })
    .map((s) => {
      const course = courses.value.find((c) => c.id === s.courseId);
      return {
        courseId:   s.courseId,
        courseCode: course?.code    ?? '—',
        courseName: course?.name    ?? 'Unknown Course',
        credits:    course?.credits ?? 0,
        day:        s.day,
        startTime:  s.startTime,
        endTime:    s.endTime,
        venue:      s.venue,
        lecturer:   s.lecturer,
        mode:       (s.mode ?? '').toLowerCase(),
        colorIndex: courseColorMap.value[s.courseId] ?? 0,
      };
    });
});

/** Entries visible on the active grid (matches active mode days) */
const visibleEntries = computed(() => {
  return timetableEntries.value.filter((e) => activeDays.value.includes(e.day));
});

function entriesForDay(day) {
  return visibleEntries.value.filter((e) => e.day === day);
}

const uniqueCourses = computed(() => {
  const enrolled = courses.value.filter((c) => enrolledCourseIds.value.has(c.id));
  return enrolled.map((c) => ({
    id: c.id,
    code: c.code,
    name: c.name,
    credits: c.credits,
    colorIndex: courseColorMap.value[c.id] ?? 0,
  }));
});

const totalCredits = computed(() =>
  uniqueCourses.value.reduce((s, c) => s + (c.credits || 0), 0)
);

const weeklyHours = computed(() => {
  const totalMins = visibleEntries.value.reduce((acc, e) => {
    return acc + Math.max(0, toMin(e.endTime) - toMin(e.startTime));
  }, 0);
  const h = Math.round((totalMins / 60) * 10) / 10;
  return `${h} hrs`;
});

const scheduledCourseCount = computed(() => {
  return new Set(visibleEntries.value.map((e) => e.courseId)).size;
});

const summaryStats = computed(() => [
  { 
    label: 'Scheduled Courses',   
    value: scheduledCourseCount.value,
    sub: 'on this timetable' 
  },
  { 
    label: 'Total Credit Hours', 
    value: totalCredits.value,
    sub: 'this semester' 
  },
  { 
    label: activeTab.value === 'regular' ? 'Regular Classes' : 'Weekend Classes',    
    value: visibleEntries.value.length,
    sub: activeTab.value === 'regular' ? 'Mon – Fri sessions' : 'Thu – Sun sessions' 
  },
  { 
    label: 'Weekly Class Time',    
    value: weeklyHours.value,
    sub: 'contact hours' 
  },
]);

// ── Grid helpers ──────────────────────────────────────────────────────────────
function toMin(t) {
  const [h, m] = (t ?? '00:00').split(':').map(Number);
  return h * 60 + (m || 0);
}

/** Returns the pixel height for a given entry so the template can pick the right content tier. */
function blockHeightPx(entry) {
  const pxPerMin = SLOT_HEIGHT / 60;
  return Math.max(24, (toMin(entry.endTime) - toMin(entry.startTime)) * pxPerMin - 4);
}

/** Human-readable duration label, e.g. "2 hr" or "3 hr" or "1 hr 30 min" */
function durationLabel(entry) {
  const mins = toMin(entry.endTime) - toMin(entry.startTime);
  if (mins <= 0) return '';
  const h = Math.floor(mins / 60);
  const m = mins % 60;
  if (m === 0) return `${h} hr`;
  return `${h} hr ${m} min`;
}

function blockStyle(entry) {
  const pxPerMin = SLOT_HEIGHT / 60;
  const origin   = TIME_START * 60;
  const top      = Math.max(0, (toMin(entry.startTime) - origin) * pxPerMin);
  const height   = blockHeightPx(entry);
  return { position: 'absolute', top: `${top}px`, height: `${height}px`, zIndex: 10 };
}

// ── Color helpers ─────────────────────────────────────────────────────────────
const COLORS = {
  blue:    { bg:'bg-blue-500/15 dark:bg-blue-500/20',   border:'border-blue-400/30',    text:'text-blue-900 dark:text-blue-100',   accent:'bg-blue-400' },
  violet:  { bg:'bg-violet-500/15 dark:bg-violet-500/20',border:'border-violet-400/30', text:'text-violet-900 dark:text-violet-100',accent:'bg-violet-400' },
  emerald: { bg:'bg-emerald-500/15 dark:bg-emerald-500/20',border:'border-emerald-400/30',text:'text-emerald-900 dark:text-emerald-100',accent:'bg-emerald-400' },
  amber:   { bg:'bg-amber-500/15 dark:bg-amber-500/20',  border:'border-amber-400/30',  text:'text-amber-900 dark:text-amber-100',  accent:'bg-amber-400' },
  rose:    { bg:'bg-rose-500/15 dark:bg-rose-500/20',    border:'border-rose-400/30',    text:'text-rose-900 dark:text-rose-100',    accent:'bg-rose-400' },
  cyan:    { bg:'bg-cyan-500/15 dark:bg-cyan-500/20',    border:'border-cyan-400/30',    text:'text-cyan-900 dark:text-cyan-100',    accent:'bg-cyan-400' },
  orange:  { bg:'bg-orange-500/15 dark:bg-orange-500/20',border:'border-orange-400/30',  text:'text-orange-900 dark:text-orange-100',accent:'bg-orange-400' },
  teal:    { bg:'bg-teal-500/15 dark:bg-teal-500/20',    border:'border-teal-400/30',    text:'text-teal-900 dark:text-teal-100',    accent:'bg-teal-400' },
  pink:    { bg:'bg-pink-500/15 dark:bg-pink-500/20',    border:'border-pink-400/30',    text:'text-pink-900 dark:text-pink-100',    accent:'bg-pink-400' },
  indigo:  { bg:'bg-indigo-500/15 dark:bg-indigo-500/20',border:'border-indigo-400/30',  text:'text-indigo-900 dark:text-indigo-100',accent:'bg-indigo-400' },
};

function palColor(idx) { return COLORS[PALETTE[idx % PALETTE.length]]; }
function courseColorClasses(idx) { const c = palColor(idx); return `${c.bg} ${c.border} ${c.text}`; }
function colorAccent(idx) { return palColor(idx).accent; }
</script>
