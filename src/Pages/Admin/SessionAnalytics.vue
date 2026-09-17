<template>
  <div class="space-y-8 p-1 sm:p-2 lg:p-4 animate-in fade-in duration-500">
    <!-- Header with Blueprint Eyebrow -->
    <div class="relative overflow-hidden rounded-2xl bg-white dark:bg-[#071328] border border-slate-200/80 dark:border-slate-800/80 p-6 sm:p-8 shadow-sm">
      <div class="absolute inset-0 bg-[radial-gradient(#031c45_1px,transparent_1px)] dark:bg-[radial-gradient(#ffffff_1px,transparent_1px)] bg-[size:16px_16px] opacity-[0.03] dark:opacity-[0.02] pointer-events-none"></div>
      
      <!-- Blueprint Corner Accents -->
      <div class="absolute top-0 left-0 w-3 h-3 border-t-2 border-l-2 border-secondary/40"></div>
      <div class="absolute top-0 right-0 w-3 h-3 border-t-2 border-r-2 border-secondary/40"></div>
      <div class="absolute bottom-0 left-0 w-3 h-3 border-b-2 border-l-2 border-secondary/40"></div>
      <div class="absolute bottom-0 right-0 w-3 h-3 border-b-2 border-r-2 border-secondary/40"></div>

      <div class="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
        <div>
          <div class="inline-flex items-center gap-2 px-2.5 py-1 rounded-md bg-secondary/10 border border-secondary/20 text-secondary text-[11px] font-mono uppercase tracking-wider mb-3">
            <Radio class="w-3.5 h-3.5 animate-pulse" />
            <span>SESSION INTELLIGENCE // LIVE AUDIT FEED</span>
          </div>
          <h1 class="text-2xl sm:text-3xl font-extrabold font-display tracking-tight text-slate-900 dark:text-white">
            Session <span class="text-secondary">Analytics</span>
          </h1>
          <p class="text-xs sm:text-sm font-mono text-slate-500 dark:text-slate-400 mt-1">
            Real-time verification telemetry and historical rollcall records
          </p>
        </div>

        <div class="flex flex-wrap items-center gap-3">
          <!-- Realtime badge -->
          <div class="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 text-xs font-mono font-semibold shadow-2xs">
            <span class="relative flex h-2 w-2">
              <span class="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span class="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </span>
            <span>Real-time Sync</span>
          </div>

          <!-- Course select filter -->
          <select 
            v-model="courseFilter" 
            id="sa-course-filter"
            class="bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-1.5 text-xs font-mono text-slate-800 dark:text-slate-200 focus:outline-hidden focus:border-secondary shadow-2xs"
          >
            <option value="">All Courses</option>
            <option v-for="c in courses" :key="c.id" :value="c.id">{{ c.code }} – {{ c.name }}</option>
          </select>

          <!-- Status select filter -->
          <select 
            v-model="statusFilter" 
            id="sa-status-filter"
            class="bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-1.5 text-xs font-mono text-slate-800 dark:text-slate-200 focus:outline-hidden focus:border-secondary shadow-2xs"
          >
            <option value="">All Statuses</option>
            <option value="active">Active</option>
            <option value="closed">Closed</option>
          </select>
        </div>
      </div>
    </div>

    <!-- KPI Strip -->
    <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      <!-- Total Sessions -->
      <div class="relative overflow-hidden rounded-2xl bg-white dark:bg-[#071328] border border-slate-200/80 dark:border-slate-800/80 p-5 shadow-sm group hover:border-secondary/40 transition-all">
        <div class="flex items-center gap-4">
          <div class="w-12 h-12 rounded-xl bg-sky-50 dark:bg-sky-950/40 border border-sky-200/60 dark:border-sky-800/40 text-sky-600 dark:text-sky-400 flex items-center justify-center shrink-0">
            <Calendar class="w-6 h-6" />
          </div>
          <div class="min-w-0 flex-1">
            <p class="text-[11px] font-mono uppercase text-slate-500 dark:text-slate-400 font-semibold tracking-wider">Total Sessions</p>
            <h3 class="text-2xl font-black font-display text-slate-900 dark:text-white tracking-tight mt-0.5">
              {{ sessions.length }}
            </h3>
          </div>
        </div>
      </div>

      <!-- Active Now -->
      <div class="relative overflow-hidden rounded-2xl bg-white dark:bg-[#071328] border border-slate-200/80 dark:border-slate-800/80 p-5 shadow-sm group hover:border-secondary/40 transition-all">
        <div class="flex items-center gap-4">
          <div class="w-12 h-12 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200/60 dark:border-emerald-800/40 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0">
            <Activity class="w-6 h-6" />
          </div>
          <div class="min-w-0 flex-1">
            <p class="text-[11px] font-mono uppercase text-slate-500 dark:text-slate-400 font-semibold tracking-wider">Active Now</p>
            <h3 class="text-2xl font-black font-display text-emerald-600 dark:text-emerald-400 tracking-tight mt-0.5">
              {{ activeSessions.length }}
            </h3>
          </div>
        </div>
      </div>

      <!-- Total Attendances -->
      <div class="relative overflow-hidden rounded-2xl bg-white dark:bg-[#071328] border border-slate-200/80 dark:border-slate-800/80 p-5 shadow-sm group hover:border-secondary/40 transition-all">
        <div class="flex items-center gap-4">
          <div class="w-12 h-12 rounded-xl bg-indigo-50 dark:bg-indigo-950/40 border border-indigo-200/60 dark:border-indigo-800/40 text-indigo-600 dark:text-indigo-400 flex items-center justify-center shrink-0">
            <Users class="w-6 h-6" />
          </div>
          <div class="min-w-0 flex-1">
            <p class="text-[11px] font-mono uppercase text-slate-500 dark:text-slate-400 font-semibold tracking-wider">Total Check-ins</p>
            <h3 class="text-2xl font-black font-display text-slate-900 dark:text-white tracking-tight mt-0.5">
              {{ attendances.length }}
            </h3>
          </div>
        </div>
      </div>

      <!-- Avg Attendance Rate -->
      <div class="relative overflow-hidden rounded-2xl bg-white dark:bg-[#071328] border border-slate-200/80 dark:border-slate-800/80 p-5 shadow-sm group hover:border-secondary/40 transition-all">
        <div class="flex items-center gap-4">
          <div class="w-12 h-12 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200/60 dark:border-amber-800/40 text-amber-600 dark:text-amber-400 flex items-center justify-center shrink-0">
            <Percent class="w-6 h-6" />
          </div>
          <div class="min-w-0 flex-1">
            <p class="text-[11px] font-mono uppercase text-slate-500 dark:text-slate-400 font-semibold tracking-wider">Avg Check-in Rate</p>
            <h3 class="text-2xl font-black font-display text-slate-900 dark:text-white tracking-tight mt-0.5">
              {{ avgRate }}%
            </h3>
          </div>
        </div>
      </div>
    </div>

    <!-- Active Live Sessions Section -->
    <div v-if="activeSessions.length > 0" class="relative overflow-hidden rounded-2xl bg-white dark:bg-[#071328] border border-slate-200/80 dark:border-slate-800/80 p-6 shadow-sm">
      <div class="flex items-center justify-between gap-4 mb-5 pb-4 border-b border-slate-200/60 dark:border-slate-800/60">
        <div class="flex items-center gap-2.5">
          <span class="relative flex h-2.5 w-2.5">
            <span class="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span class="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
          </span>
          <h2 class="text-base font-bold font-display text-slate-900 dark:text-white">Active Classroom Sessions</h2>
        </div>
        <span class="px-2.5 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 text-xs font-mono font-bold">
          {{ activeSessions.length }} running
        </span>
      </div>

      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <div 
          v-for="s in activeSessions" 
          :key="s.id" 
          class="p-5 rounded-xl bg-gradient-to-br from-emerald-500/5 via-transparent to-emerald-500/10 dark:from-emerald-950/20 dark:to-transparent border border-emerald-500/20 shadow-xs flex flex-col justify-between gap-4 relative overflow-hidden"
        >
          <div class="absolute top-0 right-0 w-3 h-3 border-t-2 border-r-2 border-emerald-500/40"></div>

          <div>
            <div class="flex items-center justify-between gap-2 mb-2">
              <div class="flex items-center gap-2">
                <span class="px-2 py-0.5 rounded-md bg-secondary/10 border border-secondary/20 text-secondary text-[11px] font-mono font-bold">
                  {{ s.courseCode }}
                </span>
                <span class="px-1.5 py-0.5 rounded text-[10px] font-mono font-black uppercase tracking-wider bg-emerald-500 text-white animate-pulse">
                  LIVE
                </span>
              </div>
              <div class="text-xs font-mono text-slate-600 dark:text-slate-300">
                PIN: <span class="font-bold text-slate-900 dark:text-white tracking-wider">{{ s.pin }}</span>
              </div>
            </div>

            <h3 class="text-sm font-bold font-display text-slate-900 dark:text-white line-clamp-1">
              {{ s.courseName }}
            </h3>
          </div>

          <div>
            <!-- Stats -->
            <div class="grid grid-cols-3 gap-2 text-center py-2.5 px-3 rounded-lg bg-white/80 dark:bg-slate-900/60 border border-slate-200/60 dark:border-slate-800/60 mb-3">
              <div>
                <span class="text-base font-black font-display text-emerald-600 dark:text-emerald-400">{{ s.presentCount }}</span>
                <p class="text-[10px] font-mono uppercase text-slate-400 mt-0.5">Present</p>
              </div>
              <div>
                <span class="text-base font-black font-display text-rose-500">{{ s.absentCount }}</span>
                <p class="text-[10px] font-mono uppercase text-slate-400 mt-0.5">Absent</p>
              </div>
              <div>
                <span class="text-base font-black font-display text-indigo-500">{{ s.rate }}%</span>
                <p class="text-[10px] font-mono uppercase text-slate-400 mt-0.5">Rate</p>
              </div>
            </div>

            <!-- Progress bar -->
            <div class="w-full h-1.5 bg-slate-200 dark:bg-slate-800 rounded-full overflow-hidden mb-2">
              <div class="h-full bg-emerald-500 rounded-full transition-all duration-500" :style="{ width: s.rate + '%' }"></div>
            </div>

            <div class="flex items-center gap-1.5 text-[11px] font-mono text-slate-400">
              <Clock class="w-3.5 h-3.5" />
              <span>Started {{ s.startedAgo }}</span>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- All Sessions Table Panel -->
    <div class="relative overflow-hidden rounded-2xl bg-white dark:bg-[#071328] border border-slate-200/80 dark:border-slate-800/80 shadow-sm">
      <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 sm:p-6 border-b border-slate-200/80 dark:border-slate-800/80">
        <div>
          <h2 class="text-base font-bold font-display text-slate-900 dark:text-white">Session Registry Ledger</h2>
          <p class="text-xs font-mono text-slate-500 dark:text-slate-400 mt-0.5">Complete record of lecture sessions and verified logs</p>
        </div>

        <div class="relative min-w-[240px]">
          <Search class="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
          <input 
            v-model="searchQ" 
            type="text" 
            placeholder="Search code, course, or date…" 
            id="sa-search"
            class="w-full pl-9 pr-4 py-1.5 bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 rounded-xl text-xs font-mono text-slate-800 dark:text-slate-200 placeholder:text-slate-400 focus:outline-hidden focus:border-secondary shadow-2xs"
          />
        </div>
      </div>

      <div class="overflow-x-auto">
        <table class="w-full text-xs text-left text-slate-600 dark:text-slate-400" id="sa-sessions-table">
          <thead class="text-[11px] font-mono uppercase bg-slate-50/80 dark:bg-slate-900/50 text-slate-500 dark:text-slate-400 border-b border-slate-200/80 dark:border-slate-800/80">
            <tr>
              <th scope="col" @click="sortBy('date')" class="px-5 py-3.5 cursor-pointer select-none hover:text-slate-900 dark:hover:text-white transition-colors">
                <div class="flex items-center gap-1.5">
                  <span>Date</span>
                  <ArrowUpDown class="w-3 h-3 text-slate-400" />
                </div>
              </th>
              <th scope="col" class="px-5 py-3.5">Course</th>
              <th scope="col" class="px-5 py-3.5">PIN</th>
              <th scope="col" @click="sortBy('present')" class="px-5 py-3.5 cursor-pointer select-none hover:text-slate-900 dark:hover:text-white transition-colors">
                <div class="flex items-center gap-1.5">
                  <span>Present</span>
                  <ArrowUpDown class="w-3 h-3 text-slate-400" />
                </div>
              </th>
              <th scope="col" @click="sortBy('absent')" class="px-5 py-3.5 cursor-pointer select-none hover:text-slate-900 dark:hover:text-white transition-colors">
                <div class="flex items-center gap-1.5">
                  <span>Absent</span>
                  <ArrowUpDown class="w-3 h-3 text-slate-400" />
                </div>
              </th>
              <th scope="col" @click="sortBy('rate')" class="px-5 py-3.5 cursor-pointer select-none hover:text-slate-900 dark:hover:text-white transition-colors">
                <div class="flex items-center gap-1.5">
                  <span>Rate</span>
                  <ArrowUpDown class="w-3 h-3 text-slate-400" />
                </div>
              </th>
              <th scope="col" class="px-5 py-3.5">Status</th>
              <th scope="col" class="px-5 py-3.5 w-28">Progress</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-slate-100 dark:divide-slate-800/60">
            <tr v-if="paginatedSessions.length === 0">
              <td colspan="8" class="px-5 py-12 text-center text-xs font-mono text-slate-400">
                No sessions match your search or filters.
              </td>
            </tr>
            <tr 
              v-for="s in paginatedSessions" 
              :key="s.id"
              class="hover:bg-slate-50/70 dark:hover:bg-slate-900/30 transition-colors"
            >
              <td class="px-5 py-4 font-mono font-medium text-slate-800 dark:text-slate-200 whitespace-nowrap">
                {{ s.dateFormatted }}
              </td>
              <td class="px-5 py-4">
                <div class="flex items-center gap-2">
                  <span class="px-1.5 py-0.5 rounded bg-secondary/10 border border-secondary/20 text-secondary text-[10px] font-mono font-bold shrink-0">
                    {{ s.courseCode }}
                  </span>
                  <span class="font-medium text-slate-800 dark:text-slate-200 truncate max-w-xs">
                    {{ s.courseName }}
                  </span>
                </div>
              </td>
              <td class="px-5 py-4 font-mono font-bold text-slate-700 dark:text-slate-300">
                {{ s.pin }}
              </td>
              <td class="px-5 py-4 font-mono font-bold text-emerald-600 dark:text-emerald-400">
                {{ s.presentCount }}
              </td>
              <td class="px-5 py-4 font-mono font-bold text-rose-500">
                {{ s.absentCount }}
              </td>
              <td class="px-5 py-4">
                <span 
                  class="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-mono font-bold"
                  :class="s.rate >= 75 
                    ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20' 
                    : s.rate >= 50 
                      ? 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20' 
                      : 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20'"
                >
                  {{ s.rate }}%
                </span>
              </td>
              <td class="px-5 py-4">
                <span 
                  class="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold uppercase tracking-wider"
                  :class="s.isActive 
                    ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30' 
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 border border-slate-200 dark:border-slate-700'"
                >
                  <span v-if="s.isActive" class="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                  <span>{{ s.isActive ? 'Active' : 'Closed' }}</span>
                </span>
              </td>
              <td class="px-5 py-4">
                <div class="w-full h-1.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                  <div 
                    class="h-full rounded-full transition-all duration-500" 
                    :style="{ width: s.rate + '%', backgroundColor: rateColor(s.rate) }"
                  ></div>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- Pagination -->
      <div v-if="totalPages > 1" class="flex items-center justify-between gap-4 p-4 sm:p-5 border-t border-slate-200/80 dark:border-slate-800/80 text-xs font-mono">
        <button 
          :disabled="page === 1" 
          @click="page--" 
          id="sa-prev-btn"
          class="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 disabled:opacity-40 disabled:cursor-not-allowed hover:border-secondary transition-colors cursor-pointer"
        >
          <ChevronLeft class="w-3.5 h-3.5" />
          <span>Previous</span>
        </button>

        <span class="text-slate-500 dark:text-slate-400">
          Page <strong class="text-slate-800 dark:text-slate-200">{{ page }}</strong> of <strong class="text-slate-800 dark:text-slate-200">{{ totalPages }}</strong>
        </span>

        <button 
          :disabled="page === totalPages" 
          @click="page++" 
          id="sa-next-btn"
          class="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 disabled:opacity-40 disabled:cursor-not-allowed hover:border-secondary transition-colors cursor-pointer"
        >
          <span>Next</span>
          <ChevronRight class="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted, watch } from 'vue';
import { storeToRefs } from 'pinia';
import { useSessionsStore }    from '@/stores/sessions';
import { useCoursesStore }     from '@/stores/courses';
import { useAttendancesStore } from '@/stores/attendances';
import {
  Activity,
  Calendar,
  Clock,
  Users,
  Percent,
  Search,
  ArrowUpDown,
  ChevronLeft,
  ChevronRight,
  Radio
} from 'lucide-vue-next';

const sessStore   = useSessionsStore();
const courseStore = useCoursesStore();
const attStore    = useAttendancesStore();

const { sessions }    = storeToRefs(sessStore);
const { courses }     = storeToRefs(courseStore);
const { attendances } = storeToRefs(attStore);

const courseFilter = ref('');
const statusFilter = ref('');
const searchQ      = ref('');
const page         = ref(1);
const pageSize     = 15;
const sortField    = ref('date');
const sortAsc      = ref(false);

watch([courseFilter, statusFilter, searchQ], () => { page.value = 1; });

onMounted(async () => {
  await Promise.all([
    sessStore.fetchSessions(),
    courseStore.fetchCourses(),
    attStore.fetchAttendances(),
  ]);
  sessStore.subscribeToSessions();
  attStore.subscribeToAttendances();
});

onUnmounted(() => {
  sessStore.unsubscribeFromSessions();
  attStore.unsubscribeFromAttendances();
});

// ── Enriched sessions ──────────────────────────────────────────────────────────
const enriched = computed(() =>
  sessions.value.map(s => {
    const course      = courseStore.getCourseById(s.courseId);
    const sessionAtts = attendances.value.filter(a => a.sessionId === s.id);
    const present     = sessionAtts.filter(a => a.status === 'present').length;
    const absent      = sessionAtts.filter(a => a.status === 'absent').length;
    const total       = sessionAtts.length;
    const rate        = total > 0 ? Math.round((present / total) * 100) : 0;
    return {
      id:            s.id,
      courseId:      s.courseId,
      courseCode:    course?.code  ?? '—',
      courseName:    course?.name  ?? 'Unknown Course',
      pin:           s.pin         ?? '—',
      isActive:      s.isActive,
      date:          s.date,
      dateFormatted: s.date ? new Date(s.date).toLocaleDateString('en-GB', { day:'2-digit', month:'short', year:'numeric' }) : '—',
      startedAgo:    timeAgo(s.createdAt || s.date),
      presentCount:  present,
      absentCount:   absent,
      total,
      rate,
    };
  })
);

// ── Active sessions (live card grid) ──────────────────────────────────────────
const activeSessions = computed(() =>
  enriched.value.filter(s => s.isActive)
);

// ── KPI: avg rate across all sessions with attendance ─────────────────────────
const avgRate = computed(() => {
  const withData = enriched.value.filter(s => s.total > 0);
  if (!withData.length) return 0;
  return Math.round(withData.reduce((sum, s) => sum + s.rate, 0) / withData.length);
});

// ── Filter + sort + paginate ──────────────────────────────────────────────────
const filtered = computed(() => {
  let list = enriched.value;
  if (courseFilter.value) list = list.filter(s => s.courseId === courseFilter.value);
  if (statusFilter.value === 'active') list = list.filter(s =>  s.isActive);
  if (statusFilter.value === 'closed') list = list.filter(s => !s.isActive);
  if (searchQ.value.trim()) {
    const q = searchQ.value.trim().toLowerCase();
    list = list.filter(s =>
      s.courseCode.toLowerCase().includes(q) ||
      s.courseName.toLowerCase().includes(q) ||
      s.dateFormatted.toLowerCase().includes(q)
    );
  }
  list = [...list].sort((a, b) => {
    let av = a[sortField.value], bv = b[sortField.value];
    if (sortField.value === 'date') { av = new Date(a.date||0); bv = new Date(b.date||0); }
    if (av < bv) return sortAsc.value ? -1 : 1;
    if (av > bv) return sortAsc.value ?  1 : -1;
    return 0;
  });
  return list;
});

const totalPages = computed(() => Math.max(1, Math.ceil(filtered.value.length / pageSize)));
const paginatedSessions = computed(() => filtered.value.slice((page.value - 1) * pageSize, page.value * pageSize));

function sortBy(field) {
  if (sortField.value === field) sortAsc.value = !sortAsc.value;
  else { sortField.value = field; sortAsc.value = false; }
}

// ── Helpers ───────────────────────────────────────────────────────────────────
function rateColor(r) { return r >= 75 ? '#10b981' : r >= 50 ? '#f59e0b' : '#ef4444'; }
function timeAgo(ts) {
  if (!ts) return '—';
  const diff = Date.now() - new Date(ts).getTime();
  const m = Math.floor(diff / 60000), h = Math.floor(diff / 3600000), d = Math.floor(diff / 86400000);
  if (m < 1)  return 'just now';
  if (m < 60) return `${m}m ago`;
  if (h < 24) return `${h}h ago`;
  return `${d}d ago`;
}
</script>