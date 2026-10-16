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

        <!-- Timetable grid card (Days on vertical axis, Allocated scheduled times on horizontal axis) -->
        <div
          v-if="allocatedTimeSlots.length > 0"
          class="relative bg-surface dark:bg-dark-surface border border-outline/50 dark:border-dark-outline/60 rounded-2xl shadow-xs overflow-hidden"
        >
          <div class="absolute top-3 left-3 w-4 h-4 border-t-2 border-l-2 border-secondary/20 pointer-events-none z-30"></div>
          <div class="absolute top-3 right-3 w-4 h-4 border-t-2 border-r-2 border-secondary/20 pointer-events-none z-30"></div>

          <div class="overflow-x-auto">
            <div class="min-w-full inline-block align-middle">
              <!-- Header Row: Allocated Scheduled Time Columns -->
              <div class="flex border-b border-outline/30 dark:border-dark-outline/40 bg-muted/40 dark:bg-dark-muted/30">
                <!-- Day Column Header (Sticky Left) -->
                <div
                  class="w-32 sm:w-44 shrink-0 sticky left-0 z-30 px-4 py-3.5 bg-muted/70 dark:bg-dark-muted/50 backdrop-blur-md border-r border-outline/30 dark:border-dark-outline/40 shadow-[2px_0_6px_rgba(0,0,0,0.03)] dark:shadow-[2px_0_6px_rgba(0,0,0,0.2)] flex items-center justify-between"
                >
                  <span class="text-[10px] font-mono font-bold uppercase tracking-wider text-foreground/50 dark:text-white/50">
                    DAY \ TIME
                  </span>
                </div>

                <!-- Allocated Time Slots Headers -->
                <div
                  v-for="slot in allocatedTimeSlots"
                  :key="slot.key"
                  class="min-w-[220px] sm:min-w-[260px] flex-1 px-4 py-3 border-r border-outline/20 dark:border-dark-outline/30 last:border-r-0 text-center flex flex-col justify-center"
                >
                  <span class="text-xs font-mono font-extrabold text-foreground dark:text-white">
                    {{ slot.label12 }}
                  </span>
                  <div class="flex items-center justify-center gap-1.5 text-[10px] font-mono text-foreground/50 dark:text-white/50 mt-0.5">
                    <span>{{ slot.label24 }}</span>
                    <span>·</span>
                    <span class="font-semibold text-secondary dark:text-dark-secondary">{{ slot.duration }}</span>
                  </div>
                </div>
              </div>

              <!-- Day Rows: Days on Vertical Axis -->
              <div
                v-for="day in activeDays"
                :key="day"
                class="flex border-b border-outline/20 dark:border-dark-outline/30 last:border-b-0 hover:bg-muted/5 dark:hover:bg-dark-muted/5 transition-colors"
              >
                <!-- Day Label Column (Sticky Left) -->
                <div
                  class="w-32 sm:w-44 shrink-0 sticky left-0 z-20 px-4 py-4 bg-surface dark:bg-dark-surface border-r border-outline/30 dark:border-dark-outline/40 shadow-[2px_0_6px_rgba(0,0,0,0.03)] dark:shadow-[2px_0_6px_rgba(0,0,0,0.2)] flex flex-col justify-center"
                >
                  <span class="text-[10px] font-mono font-bold uppercase tracking-widest text-secondary dark:text-dark-secondary">
                    {{ day.slice(0, 3) }}
                  </span>
                  <p class="text-sm font-extrabold font-display text-foreground dark:text-white mt-0.5">
                    {{ day }}
                  </p>
                  <span
                    class="text-[10px] font-mono mt-1 inline-flex items-center gap-1.5"
                    :class="entriesForDay(day).length > 0 ? 'text-foreground/60 dark:text-white/60 font-semibold' : 'text-foreground/30 dark:text-white/30'"
                  >
                    <span
                      v-if="entriesForDay(day).length > 0"
                      class="w-1.5 h-1.5 rounded-full bg-secondary"
                    ></span>
                    {{ entriesForDay(day).length }} {{ entriesForDay(day).length === 1 ? 'class' : 'classes' }}
                  </span>
                </div>

                <!-- Allocated Time Slots Cells -->
                <div
                  v-for="slot in allocatedTimeSlots"
                  :key="slot.key"
                  class="min-w-[220px] sm:min-w-[260px] flex-1 p-2.5 border-r border-outline/15 dark:border-dark-outline/25 last:border-r-0 flex flex-col justify-center"
                >
                  <!-- Classes scheduled at this day and allocated time -->
                  <div
                    v-if="entriesForDayAndSlot(day, slot).length > 0"
                    class="space-y-2"
                  >
                    <div
                      v-for="entry in entriesForDayAndSlot(day, slot)"
                      :key="`${entry.courseId}-${entry.startTime}`"
                      class="relative rounded-xl p-3.5 border shadow-xs transition-all duration-200 hover:scale-[1.01] hover:shadow-md cursor-default overflow-hidden flex flex-col justify-between gap-2.5"
                      :class="courseColorClasses(entry.colorIndex)"
                      :title="`${entry.courseCode} - ${entry.courseName}\n${slot.label12}\nVenue: ${entry.venue || 'TBA'}\nLecturer: ${entry.lecturer || 'TBA'}\nCredits: ${entry.credits}`"
                    >
                      <!-- Left accent bar -->
                      <div class="absolute left-0 top-0 bottom-0 w-1.5 rounded-l-xl" :class="colorAccent(entry.colorIndex)"></div>

                      <!-- Course Header -->
                      <div class="pl-1">
                        <div class="flex items-center justify-between gap-1.5 mb-1">
                          <span class="text-xs font-black font-mono leading-tight tracking-tight text-foreground dark:text-white">
                            {{ entry.courseCode }}
                          </span>
                          <span
                            v-if="entry.credits"
                            class="text-[9px] font-bold font-mono px-1.5 py-0.5 rounded-md bg-black/10 dark:bg-white/10 shrink-0"
                          >
                            {{ entry.credits }} cr
                          </span>
                        </div>
                        <p class="text-xs font-semibold leading-snug line-clamp-2 opacity-90">
                          {{ entry.courseName }}
                        </p>
                      </div>

                      <!-- Course Details: Venue & Lecturer -->
                      <div class="pl-1 pt-1.5 border-t border-black/5 dark:border-white/5 flex flex-col gap-0.5 text-[10px] font-mono opacity-80">
                        <!-- Delivery Mode pill -->
                        <div class="flex items-center gap-1 mb-0.5">
                          <span
                            :class="[
                              'inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded font-bold text-[9px] uppercase tracking-wide',
                              entry.deliveryMode === 'Online'
                                ? 'bg-violet-500/20 text-violet-300'
                                : entry.deliveryMode === 'Hybrid'
                                ? 'bg-amber-500/20 text-amber-300'
                                : 'bg-emerald-500/20 text-emerald-300'
                            ]"
                          >
                            <span v-if="entry.deliveryMode === 'Online'">🌐</span>
                            <span v-else-if="entry.deliveryMode === 'Hybrid'">⚡</span>
                            <span v-else>🏫</span>
                            {{ entry.deliveryMode }}
                          </span>
                        </div>
                        <div v-if="entry.venue && entry.deliveryMode !== 'Online'" class="flex items-center gap-1.5 truncate">
                          <span>📍</span>
                          <span class="truncate">{{ entry.venue }}</span>
                        </div>
                        <div v-if="entry.lecturer" class="flex items-center gap-1.5 truncate">
                          <span>👤</span>
                          <span class="truncate">{{ entry.lecturer }}</span>
                        </div>
                        <!-- Clickable meeting link for Online / Hybrid -->
                        <a
                          v-if="(entry.deliveryMode === 'Online' || entry.deliveryMode === 'Hybrid') && entry.onlineLink"
                          :href="entry.onlineLink"
                          target="_blank"
                          rel="noopener noreferrer"
                          @click.stop
                          class="flex items-center gap-1.5 truncate text-violet-300 hover:text-violet-100 underline underline-offset-2 mt-0.5 transition-colors"
                        >
                          <span>🔗</span>
                          <span class="truncate">Join Class</span>
                        </a>
                        <span
                          v-else-if="(entry.deliveryMode === 'Online' || entry.deliveryMode === 'Hybrid') && !entry.onlineLink"
                          class="text-[9px] italic opacity-60"
                        >Link TBD</span>
                      </div>
                    </div>
                  </div>

                  <!-- Empty slot on this day -->
                  <div
                    v-else
                    class="h-full min-h-[90px] flex items-center justify-center rounded-xl border border-dashed border-outline/15 dark:border-dark-outline/20 bg-muted/5 dark:bg-dark-muted/10"
                  >
                    <span class="text-xs font-mono text-foreground/20 dark:text-white/20 select-none">—</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Fallback if no classes scheduled in active programme -->
        <div
          v-else
          class="flex flex-col items-center justify-center py-20 gap-3 rounded-2xl border border-dashed border-outline/40 dark:border-dark-outline/40 bg-surface dark:bg-dark-surface"
        >
          <CalendarDays class="w-8 h-8 text-foreground/30 dark:text-white/30" />
          <p class="text-sm font-semibold text-foreground dark:text-white">No classes scheduled for this programme</p>
          <p class="text-xs font-mono text-foreground/50 dark:text-white/60">
            Switch programme tabs or contact academic affairs for your schedule.
          </p>
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
        courseId:     s.courseId,
        courseCode:   course?.code    ?? '—',
        courseName:   course?.name    ?? 'Unknown Course',
        credits:      course?.credits ?? 0,
        day:          s.day,
        startTime:    s.startTime,
        endTime:      s.endTime,
        venue:        s.venue,
        lecturer:     s.lecturer,
        mode:         (s.mode ?? '').toLowerCase(),
        deliveryMode: s.deliveryMode || 'Face-to-Face',
        onlineLink:   s.onlineLink   || '',
        colorIndex:   courseColorMap.value[s.courseId] ?? 0,
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

// ── Layout & Allocated Time Helpers ───────────────────────────────────────────
function normalizeTime(t) {
  if (!t) return '00:00';
  const parts = String(t).trim().split(':');
  const h = parts[0].padStart(2, '0');
  const m = (parts[1] || '00').padStart(2, '0');
  return `${h}:${m}`;
}

function toMin(t) {
  if (!t) return 0;
  const parts = String(t).trim().split(':').map(Number);
  return (parts[0] || 0) * 60 + (parts[1] || 0);
}

function formatTime12(t) {
  if (!t) return '';
  const parts = normalizeTime(t).split(':');
  let h = parseInt(parts[0], 10);
  const m = parts[1] || '00';
  const ampm = h >= 12 ? 'PM' : 'AM';
  h = h % 12 || 12;
  return `${h}:${m} ${ampm}`;
}

function durationFromTimes(start, end) {
  const mins = toMin(end) - toMin(start);
  if (mins <= 0) return '';
  const h = Math.floor(mins / 60);
  const m = mins % 60;
  if (m === 0) return `${h} hr`;
  if (h === 0) return `${m} min`;
  return `${h} hr ${m} min`;
}

/**
 * Dynamically extracts all distinct time periods allocated for scheduled classes
 * in the active programme, sorted chronologically.
 */
const allocatedTimeSlots = computed(() => {
  const slotMap = new Map();
  visibleEntries.value.forEach((e) => {
    const start = normalizeTime(e.startTime);
    const end = normalizeTime(e.endTime);
    if (start && end) {
      const key = `${start}-${end}`;
      if (!slotMap.has(key)) {
        slotMap.set(key, {
          key,
          startTime: start,
          endTime: end,
          startMin: toMin(start),
          endMin: toMin(end),
          label12: `${formatTime12(start)} – ${formatTime12(end)}`,
          label24: `${start} – ${end}`,
          duration: durationFromTimes(start, end),
        });
      }
    }
  });

  return Array.from(slotMap.values()).sort((a, b) => {
    if (a.startMin !== b.startMin) return a.startMin - b.startMin;
    return a.endMin - b.endMin;
  });
});

/**
 * Finds all classes scheduled for a specific day and allocated time slot.
 */
function entriesForDayAndSlot(day, slot) {
  return visibleEntries.value.filter((e) => {
    if (e.day !== day) return false;
    const start = normalizeTime(e.startTime);
    const end = normalizeTime(e.endTime);
    return start === slot.startTime && end === slot.endTime;
  });
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
