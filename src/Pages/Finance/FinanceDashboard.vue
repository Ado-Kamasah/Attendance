<template>
  <div class="space-y-6 w-full max-w-7xl mx-auto">
    <!-- Header with Blueprint Eyebrow -->
    <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-outline/30 dark:border-dark-outline/40">
      <div>
        <div class="flex items-center gap-2 mb-3 text-secondary dark:text-dark-secondary text-xs font-mono uppercase tracking-wider font-semibold">
          <span>FINANCE AUDIT // CLAIMS & INSTRUCTION LOGS</span>
          <svg class="text-secondary/40 w-20 h-2" viewBox="0 0 140 8" fill="none">
            <path d="M0 4H140" stroke="currentColor" stroke-width="1.5" />
          </svg>
        </div>
        <h1 class="text-2xl sm:text-3xl font-extrabold font-display tracking-tight text-foreground dark:text-dark-foreground">
          Finance <span class="text-secondary dark:text-dark-secondary">Office Ledger</span>
        </h1>
        <p class="text-xs sm:text-sm font-mono text-foreground/60 dark:text-dark-foreground/60 mt-1">
          {{ today }} &bull; Teaching Hours & Session Verification
        </p>
      </div>

      <div class="flex items-center gap-3">
        <button 
          @click="$emit('navigate', '/finance-claims')"
          class="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-primary dark:bg-dark-secondary text-surface dark:text-primary font-semibold text-xs sm:text-sm shadow-md hover:opacity-90 active:scale-98 transition-all cursor-pointer"
        >
          <FileSpreadsheet class="w-4 h-4" />
          <span>Full Claims Ledger</span>
        </button>
      </div>
    </div>

    <!-- Loading State -->
    <div v-if="isLoading" class="py-16 text-center text-xs font-mono text-foreground/50 dark:text-dark-foreground/50 flex items-center justify-center gap-2">
      <RefreshCw class="w-4 h-4 animate-spin text-secondary" />
      <span>Loading financial records…</span>
    </div>

    <template v-else>
      <!-- KPI Cards Grid -->
      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <!-- Total Lecturers -->
        <div class="relative p-5 bg-surface dark:bg-dark-surface border border-outline/50 dark:border-dark-outline/60 rounded-2xl shadow-xs overflow-hidden group">
          <div class="flex items-center justify-between">
            <span class="text-xs font-mono font-medium text-foreground/60 dark:text-dark-foreground/60 uppercase tracking-wider">
              Total Instructors
            </span>
            <div class="w-9 h-9 rounded-xl bg-sky-500/10 text-sky-500 border border-sky-500/20 flex items-center justify-center">
              <Users class="w-4.5 h-4.5" />
            </div>
          </div>
          <div class="mt-3 flex items-baseline gap-2">
            <span class="text-3xl font-extrabold font-display text-foreground dark:text-dark-foreground">
              {{ totalLecturers }}
            </span>
            <span class="text-[11px] font-mono text-foreground/50 dark:text-dark-foreground/50">Active Faculty</span>
          </div>
        </div>

        <!-- Total Sessions -->
        <div class="relative p-5 bg-surface dark:bg-dark-surface border border-outline/50 dark:border-dark-outline/60 rounded-2xl shadow-xs overflow-hidden group">
          <div class="flex items-center justify-between">
            <span class="text-xs font-mono font-medium text-foreground/60 dark:text-dark-foreground/60 uppercase tracking-wider">
              Total Sessions
            </span>
            <div class="w-9 h-9 rounded-xl bg-indigo-500/10 text-indigo-500 border border-indigo-500/20 flex items-center justify-center">
              <CalendarDays class="w-4.5 h-4.5" />
            </div>
          </div>
          <div class="mt-3 flex items-baseline gap-2">
            <span class="text-3xl font-extrabold font-display text-foreground dark:text-dark-foreground">
              {{ totalSessions }}
            </span>
            <span class="text-[11px] font-mono text-foreground/50 dark:text-dark-foreground/50">Conducted</span>
          </div>
        </div>

        <!-- Avg Attendance Rate -->
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
              :class="avgAttendance >= 70 ? 'text-success' : avgAttendance >= 45 ? 'text-warning' : 'text-error'"
            >
              {{ avgAttendance }}%
            </span>
            <span class="text-[11px] font-mono text-foreground/50 dark:text-dark-foreground/50">Student Turnout</span>
          </div>
        </div>

        <!-- Courses Covered -->
        <div class="relative p-5 bg-surface dark:bg-dark-surface border border-outline/50 dark:border-dark-outline/60 rounded-2xl shadow-xs overflow-hidden group">
          <div class="flex items-center justify-between">
            <span class="text-xs font-mono font-medium text-foreground/60 dark:text-dark-foreground/60 uppercase tracking-wider">
              Courses Billed
            </span>
            <div class="w-9 h-9 rounded-xl bg-purple-500/10 text-purple-500 border border-purple-500/20 flex items-center justify-center">
              <BookOpen class="w-4.5 h-4.5" />
            </div>
          </div>
          <div class="mt-3 flex items-baseline gap-2">
            <span class="text-3xl font-extrabold font-display text-foreground dark:text-dark-foreground">
              {{ totalCourses }}
            </span>
            <span class="text-[11px] font-mono text-foreground/50 dark:text-dark-foreground/50">Distinct Units</span>
          </div>
        </div>
      </div>

      <!-- Top Lecturers by Sessions Table -->
      <div class="relative bg-surface dark:bg-dark-surface border border-outline/50 dark:border-dark-outline/60 rounded-2xl shadow-xs overflow-hidden">
        <div class="absolute top-3 left-3 w-4 h-4 border-t-2 border-l-2 border-secondary/30 pointer-events-none"></div>
        <div class="absolute top-3 right-3 w-4 h-4 border-t-2 border-r-2 border-secondary/30 pointer-events-none"></div>

        <div class="p-4 sm:p-5 border-b border-outline/30 dark:border-dark-outline/40 flex items-center justify-between">
          <div>
            <h2 class="text-sm sm:text-base font-bold font-display uppercase tracking-wider text-foreground dark:text-dark-foreground">
              Teaching Volume & Turnout Ranking
            </h2>
            <p class="text-[11px] font-mono text-foreground/50 dark:text-dark-foreground/50 mt-0.5">
              Top instructors ranked by verified sessions conducted
            </p>
          </div>
          <button 
            @click="$emit('navigate', '/finance-claims')"
            class="text-xs font-semibold text-secondary hover:underline flex items-center gap-1 cursor-pointer"
          >
            <span>Complete Audit List</span>
            <ChevronRight class="w-3.5 h-3.5" />
          </button>
        </div>

        <div class="overflow-x-auto">
          <table class="w-full text-left text-xs sm:text-sm">
            <thead>
              <tr class="bg-muted/30 dark:bg-dark-muted/30 border-b border-outline/30 dark:border-dark-outline/40 font-mono text-[11px] uppercase tracking-wider text-foreground/60 dark:text-dark-foreground/60">
                <th class="py-3 px-4 w-12 text-center">#</th>
                <th class="py-3 px-4">Faculty Member</th>
                <th class="py-3 px-4 hidden md:table-cell">Contact Email</th>
                <th class="py-3 px-4 text-center">Sessions Logged</th>
                <th class="py-3 px-4">Avg Student Turnout</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-outline/20 dark:divide-dark-outline/30">
              <tr 
                v-for="(lec, i) in topLecturers" 
                :key="lec.lecturerId"
                class="hover:bg-muted/20 dark:hover:bg-dark-muted/20 transition-colors"
              >
                <td class="py-3.5 px-4 font-mono font-bold text-center text-foreground/40 dark:text-dark-foreground/40">
                  {{ i + 1 }}
                </td>
                <td class="py-3.5 px-4">
                  <div class="flex items-center gap-3">
                    <div class="w-8 h-8 rounded-lg bg-sky-500/15 text-sky-500 font-bold font-mono text-xs flex items-center justify-center shrink-0 border border-sky-500/30">
                      {{ lec.lecturerName.charAt(0) }}
                    </div>
                    <div class="min-w-0">
                      <p class="font-semibold text-foreground dark:text-dark-foreground truncate">
                        {{ lec.lecturerName }}
                      </p>
                      <p class="text-[11px] font-mono text-foreground/50 md:hidden truncate">
                        {{ lec.lecturerEmail }}
                      </p>
                    </div>
                  </div>
                </td>
                <td class="py-3.5 px-4 font-mono text-xs text-foreground/60 dark:text-dark-foreground/60 hidden md:table-cell">
                  {{ lec.lecturerEmail }}
                </td>
                <td class="py-3.5 px-4 text-center">
                  <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold font-mono bg-sky-500/10 text-sky-600 dark:text-sky-400 border border-sky-500/20">
                    {{ lec.totalSessions }} sessions
                  </span>
                </td>
                <td class="py-3.5 px-4">
                  <div class="flex items-center gap-3">
                    <div class="w-24 sm:w-32 h-2 bg-muted dark:bg-dark-muted rounded-full overflow-hidden shrink-0">
                      <div 
                        class="h-full rounded-full transition-all duration-500" 
                        :style="{ width: lec.avgRate + '%', backgroundColor: rateColor(lec.avgRate) }"
                      ></div>
                    </div>
                    <span 
                      class="text-xs font-bold font-mono"
                      :class="lec.avgRate >= 70 ? 'text-success' : lec.avgRate >= 45 ? 'text-warning' : 'text-error'"
                    >
                      {{ lec.avgRate }}%
                    </span>
                  </div>
                </td>
              </tr>
              <tr v-if="topLecturers.length === 0">
                <td colspan="5" class="py-12 text-center text-xs font-mono text-foreground/50 dark:text-dark-foreground/50">
                  No instructor session data found.
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </template>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import api from '@/api.js';
import { 
  Users, 
  CalendarDays, 
  TrendingUp, 
  BookOpen, 
  FileSpreadsheet, 
  ChevronRight, 
  RefreshCw 
} from 'lucide-vue-next';

defineEmits(['navigate']);

const claims    = ref([]);
const isLoading = ref(true);
const today     = new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });

onMounted(async () => {
  try {
    const { data } = await api.get('/finance/claims');
    claims.value = data;
  } catch { /* silent */ } finally {
    isLoading.value = false;
  }
});

const totalLecturers = computed(() => new Set(claims.value.map(c => c.lecturerId)).size);
const totalSessions  = computed(() => claims.value.reduce((s, c) => s + c.totalSessions, 0));
const totalCourses   = computed(() => new Set(claims.value.map(c => c.courseId)).size);
const avgAttendance  = computed(() => {
  if (!claims.value.length) return 0;
  const sum = claims.value.reduce((s, c) => s + c.attendanceRate, 0);
  return Math.round(sum / claims.value.length);
});

const topLecturers = computed(() => {
  const map = new Map();
  for (const c of claims.value) {
    if (!map.has(c.lecturerId)) {
      map.set(c.lecturerId, {
        lecturerId:   c.lecturerId,
        lecturerName: c.lecturerName,
        lecturerEmail: c.lecturerEmail,
        totalSessions: 0,
        rateSum: 0,
        count: 0,
      });
    }
    const l = map.get(c.lecturerId);
    l.totalSessions += c.totalSessions;
    l.rateSum       += c.attendanceRate;
    l.count         += 1;
  }
  return [...map.values()]
    .map(l => ({ ...l, avgRate: Math.round(l.rateSum / (l.count || 1)) }))
    .sort((a, b) => b.totalSessions - a.totalSessions)
    .slice(0, 10);
});

function rateColor(p) {
  if (p >= 70) return 'var(--color-success, #10b981)';
  if (p >= 45) return 'var(--color-warning, #f59e0b)';
  return 'var(--color-error, #ef4444)';
}
</script>
