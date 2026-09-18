<template>
  <div class="space-y-8 p-1 sm:p-2 lg:p-4 animate-in fade-in duration-500">

    <!-- Header -->
    <div class="relative bg-white dark:bg-dark-surface border border-slate-200/80 dark:border-dark-outline/60 rounded-2xl p-6 sm:p-8 shadow-sm overflow-hidden">
      <div class="absolute inset-0 bg-[radial-gradient(#031c45_1px,transparent_1px)] dark:bg-[radial-gradient(#bc9333_1px,transparent_1px)] opacity-[0.03] dark:opacity-[0.05] bg-[size:16px_16px] pointer-events-none"></div>
      <div class="absolute top-2 left-2 w-3 h-3 border-t-2 border-l-2 border-secondary/40 pointer-events-none"></div>
      <div class="absolute top-2 right-2 w-3 h-3 border-t-2 border-r-2 border-secondary/40 pointer-events-none"></div>

      <div class="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-5">
        <div>
          <div class="flex items-center gap-2 mb-1.5">
            <span class="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-mono font-medium tracking-wide uppercase bg-primary/10 text-primary dark:bg-secondary/15 dark:text-secondary border border-primary/20 dark:border-secondary/30">
              <FileSpreadsheet class="w-3 h-3" />
              FINANCE // CLAIMS REPORT
            </span>
          </div>
          <h1 class="text-2xl sm:text-3xl font-display font-bold text-slate-900 dark:text-white tracking-tight">
            Lecturer Claims Report
          </h1>
          <p class="text-sm text-slate-500 dark:text-white/75 mt-1">
            Session-based claims for all lecturers — filter by lecturer, date range, and download as CSV.
          </p>
        </div>

        <button
          @click="downloadCSV"
          :disabled="isDownloading"
          class="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-semibold transition-all shadow-md hover:shadow-lg active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed flex-shrink-0"
        >
          <Loader2 v-if="isDownloading" class="w-4 h-4 animate-spin" />
          <Download v-else class="w-4 h-4" />
          <span>{{ isDownloading ? 'Downloading...' : 'Download CSV' }}</span>
        </button>
      </div>
    </div>

    <!-- Filters Bar -->
    <div class="bg-white dark:bg-dark-surface border border-slate-200/80 dark:border-dark-outline/60 rounded-2xl p-5 shadow-sm">
      <div class="flex flex-col sm:flex-row flex-wrap gap-3 items-end">
        <!-- Search -->
        <div class="flex-1 min-w-[200px]">
          <label class="block text-[11px] font-mono uppercase tracking-wider text-slate-400 mb-1.5">Search</label>
          <div class="relative">
            <Search class="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
            <input
              v-model="search"
              type="text"
              placeholder="Search lecturer or course..."
              class="w-full pl-9 pr-3 py-2 bg-slate-50 dark:bg-dark-muted/80 border border-slate-200 dark:border-dark-outline/70 rounded-xl text-xs text-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-secondary/50 focus:border-secondary"
            />
          </div>
        </div>

        <!-- Lecturer -->
        <div class="min-w-[160px]">
          <label class="block text-[11px] font-mono uppercase tracking-wider text-slate-400 mb-1.5">Lecturer</label>
          <select
            v-model="filterLecturer"
            class="w-full bg-slate-50 dark:bg-dark-muted/80 border border-slate-200 dark:border-dark-outline/70 rounded-xl px-3 py-2 text-xs text-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-secondary/50"
          >
            <option value="">All Lecturers</option>
            <option v-for="l in lecturers" :key="l.id" :value="l.id">{{ l.name }}</option>
          </select>
        </div>

        <!-- From Date -->
        <div>
          <label class="block text-[11px] font-mono uppercase tracking-wider text-slate-400 mb-1.5">From</label>
          <input
            type="date"
            v-model="fromDate"
            class="bg-slate-50 dark:bg-dark-muted/80 border border-slate-200 dark:border-dark-outline/70 rounded-xl px-3 py-2 text-xs text-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-secondary/50"
          />
        </div>

        <!-- To Date -->
        <div>
          <label class="block text-[11px] font-mono uppercase tracking-wider text-slate-400 mb-1.5">To</label>
          <input
            type="date"
            v-model="toDate"
            class="bg-slate-50 dark:bg-dark-muted/80 border border-slate-200 dark:border-dark-outline/70 rounded-xl px-3 py-2 text-xs text-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-secondary/50"
          />
        </div>

        <!-- Actions -->
        <div class="flex gap-2">
          <button
            @click="loadClaims"
            class="px-4 py-2 bg-primary hover:bg-primary/90 text-white text-xs font-semibold rounded-xl transition-all shadow-sm active:scale-95"
          >
            Apply
          </button>
          <button
            @click="resetFilters"
            class="px-4 py-2 border border-slate-200 dark:border-dark-outline/70 text-slate-600 dark:text-white/90 text-xs font-semibold rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800 transition-all"
          >
            Reset
          </button>
        </div>
      </div>
    </div>

    <!-- Summary Pills -->
    <div v-if="!isLoading && filtered.length" class="flex flex-wrap gap-2">
      <span class="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-mono font-bold bg-slate-100 dark:bg-dark-muted text-slate-600 dark:text-white/90 border border-slate-200 dark:border-dark-outline/70">
        <FileSpreadsheet class="w-3 h-3" />
        {{ filtered.length }} claim rows
      </span>
      <span class="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-mono font-bold bg-primary/5 dark:bg-secondary/10 text-primary dark:text-secondary border border-primary/20 dark:border-secondary/20">
        <Users class="w-3 h-3" />
        {{ uniqueLecturers }} lecturer{{ uniqueLecturers !== 1 ? 's' : '' }}
      </span>
      <span class="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-mono font-bold bg-violet-50 dark:bg-violet-950/40 text-violet-700 dark:text-violet-400 border border-violet-200 dark:border-violet-800">
        <BookOpen class="w-3 h-3" />
        {{ uniqueCourses }} course{{ uniqueCourses !== 1 ? 's' : '' }}
      </span>
      <span class="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-mono font-bold bg-sky-50 dark:bg-sky-950/40 text-sky-700 dark:text-sky-400 border border-sky-200 dark:border-sky-800">
        <Calendar class="w-3 h-3" />
        {{ totalSessions }} session{{ totalSessions !== 1 ? 's' : '' }}
      </span>
    </div>

    <!-- Loading State -->
    <div v-if="isLoading" class="flex flex-col items-center justify-center py-20 bg-white/50 dark:bg-dark-muted/60 rounded-2xl border border-dashed border-slate-200 dark:border-dark-outline">
      <Loader2 class="w-10 h-10 text-secondary animate-spin mb-4" />
      <p class="text-sm font-mono text-slate-500 dark:text-white/75">LOADING CLAIMS DATA...</p>
    </div>

    <!-- Empty State -->
    <div
      v-else-if="filtered.length === 0"
      class="bg-white dark:bg-dark-surface border border-dashed border-slate-200 dark:border-dark-outline rounded-2xl p-14 text-center"
    >
      <div class="w-14 h-14 rounded-2xl bg-slate-100 dark:bg-dark-muted border border-slate-200 dark:border-dark-outline/70 flex items-center justify-center mx-auto mb-4 text-slate-400">
        <BarChart3 class="w-7 h-7" />
      </div>
      <h3 class="text-base font-display font-bold text-slate-900 dark:text-white">No Claims Data Found</h3>
      <p class="text-sm text-slate-500 dark:text-white/75 mt-1">No claims data matches the selected filters. Try adjusting dates or clearing filters.</p>
    </div>

    <!-- Claims Table -->
    <div v-else class="bg-white dark:bg-dark-surface border border-slate-200/80 dark:border-dark-outline/60 rounded-2xl shadow-sm overflow-hidden">
      <div class="overflow-x-auto">
        <table class="w-full text-left border-collapse text-xs">
          <thead>
            <tr class="bg-slate-50/80 dark:bg-slate-900/50 border-b border-slate-200 dark:border-dark-outline text-slate-500 dark:text-white/75 font-mono uppercase text-[11px] tracking-wider">
              <th
                @click="sortBy('lecturerName')"
                class="py-3 px-4 font-semibold cursor-pointer select-none hover:text-primary dark:hover:text-secondary transition-colors"
              >
                <div class="flex items-center gap-1">
                  Lecturer
                  <span class="text-[10px]">{{ sortKey === 'lecturerName' ? (sortDir === 'asc' ? '↑' : '↓') : '⇅' }}</span>
                </div>
              </th>
              <th
                @click="sortBy('courseCode')"
                class="py-3 px-4 font-semibold cursor-pointer select-none hover:text-primary dark:hover:text-secondary transition-colors"
              >
                <div class="flex items-center gap-1">
                  Course
                  <span class="text-[10px]">{{ sortKey === 'courseCode' ? (sortDir === 'asc' ? '↑' : '↓') : '⇅' }}</span>
                </div>
              </th>
              <th class="py-3 px-4 font-semibold">Credits</th>
              <th
                @click="sortBy('totalSessions')"
                class="py-3 px-4 font-semibold cursor-pointer select-none hover:text-primary dark:hover:text-secondary transition-colors"
              >
                <div class="flex items-center gap-1">
                  Sessions
                  <span class="text-[10px]">{{ sortKey === 'totalSessions' ? (sortDir === 'asc' ? '↑' : '↓') : '⇅' }}</span>
                </div>
              </th>
              <th class="py-3 px-4 font-semibold">Student Slots</th>
              <th class="py-3 px-4 font-semibold">Total Present</th>
              <th
                @click="sortBy('attendanceRate')"
                class="py-3 px-4 font-semibold cursor-pointer select-none hover:text-primary dark:hover:text-secondary transition-colors"
              >
                <div class="flex items-center gap-1">
                  Attendance %
                  <span class="text-[10px]">{{ sortKey === 'attendanceRate' ? (sortDir === 'asc' ? '↑' : '↓') : '⇅' }}</span>
                </div>
              </th>
            </tr>
          </thead>
          <tbody class="divide-y divide-slate-100 dark:divide-slate-800/60 font-sans">
            <tr
              v-for="c in paginated"
              :key="`${c.lecturerId}-${c.courseId}`"
              class="hover:bg-slate-50/60 dark:hover:bg-slate-800/30 transition-colors"
            >
              <!-- Lecturer -->
              <td class="py-3.5 px-4">
                <div class="flex items-center gap-2.5">
                  <div class="w-8 h-8 rounded-xl bg-gradient-to-br from-primary to-primary/70 dark:from-secondary dark:to-secondary/70 text-white dark:text-primary flex items-center justify-center font-bold text-sm uppercase flex-shrink-0">
                    {{ c.lecturerName.charAt(0) }}
                  </div>
                  <div>
                    <p class="font-semibold text-slate-900 dark:text-white text-xs">{{ c.lecturerName }}</p>
                    <p class="text-[10px] text-slate-400">{{ c.lecturerEmail }}</p>
                  </div>
                </div>
              </td>

              <!-- Course -->
              <td class="py-3.5 px-4">
                <p class="font-bold text-slate-900 dark:text-white text-xs">{{ c.courseCode }}</p>
                <p class="text-[10px] text-slate-400">{{ c.courseName }}</p>
              </td>

              <!-- Credits -->
              <td class="py-3.5 px-4">
                <span class="px-2 py-0.5 rounded-full text-[11px] font-mono font-bold bg-violet-50 dark:bg-violet-950/40 text-violet-700 dark:text-violet-400 border border-violet-200 dark:border-violet-800">
                  {{ c.credits }} cr
                </span>
              </td>

              <!-- Sessions -->
              <td class="py-3.5 px-4 text-center font-bold font-mono text-slate-700 dark:text-white/90">{{ c.totalSessions }}</td>

              <!-- Student Slots -->
              <td class="py-3.5 px-4 text-center font-bold font-mono text-slate-700 dark:text-white/90">{{ c.totalStudentSlots }}</td>

              <!-- Total Present -->
              <td class="py-3.5 px-4 text-center font-bold font-mono text-emerald-600 dark:text-emerald-400">{{ c.totalPresent }}</td>

              <!-- Rate -->
              <td class="py-3.5 px-4">
                <div class="flex items-center gap-2.5">
                  <div class="w-16 h-1.5 bg-slate-100 dark:bg-dark-muted rounded-full overflow-hidden flex-shrink-0">
                    <div
                      class="h-full rounded-full transition-all duration-700"
                      :class="c.attendanceRate >= 70 ? 'bg-emerald-500' : c.attendanceRate >= 45 ? 'bg-amber-500' : 'bg-rose-500'"
                      :style="{ width: c.attendanceRate + '%' }"
                    ></div>
                  </div>
                  <span
                    class="font-mono font-bold text-xs"
                    :class="c.attendanceRate >= 70 ? 'text-emerald-600 dark:text-emerald-400' : c.attendanceRate >= 45 ? 'text-amber-600 dark:text-amber-400' : 'text-rose-600 dark:text-rose-400'"
                  >{{ c.attendanceRate }}%</span>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- Pagination -->
    <div v-if="totalPages > 1" class="flex items-center justify-center gap-3">
      <button
        :disabled="page === 1"
        @click="page--"
        class="px-4 py-2 rounded-xl border border-slate-200 dark:border-dark-outline/70 text-xs font-semibold text-slate-600 dark:text-white/90 hover:border-primary dark:hover:border-secondary hover:text-primary dark:hover:text-secondary disabled:opacity-40 disabled:cursor-not-allowed transition-all"
      >
        ← Prev
      </button>
      <span class="text-sm font-mono text-slate-500 dark:text-white/75">
        Page {{ page }} of {{ totalPages }}
      </span>
      <button
        :disabled="page === totalPages"
        @click="page++"
        class="px-4 py-2 rounded-xl border border-slate-200 dark:border-dark-outline/70 text-xs font-semibold text-slate-600 dark:text-white/90 hover:border-primary dark:hover:border-secondary hover:text-primary dark:hover:text-secondary disabled:opacity-40 disabled:cursor-not-allowed transition-all"
      >
        Next →
      </button>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import api from '@/api.js';
import {
  Download,
  Search,
  Users,
  BookOpen,
  Calendar,
  FileSpreadsheet,
  BarChart3,
  Loader2
} from 'lucide-vue-next';

const claims         = ref([]);
const lecturers      = ref([]);
const isLoading      = ref(true);
const isDownloading  = ref(false);

const search          = ref('');
const filterLecturer  = ref('');
const fromDate        = ref('');
const toDate          = ref('');
const sortKey         = ref('lecturerName');
const sortDir         = ref('asc');
const page            = ref(1);
const PAGE_SIZE       = 20;

// ── Data loading ──────────────────────────────────────────────────────────────
async function loadClaims() {
  isLoading.value = true;
  page.value = 1;
  try {
    const params = {};
    if (filterLecturer.value) params.lecturerId = filterLecturer.value;
    if (fromDate.value)        params.from = fromDate.value;
    if (toDate.value)          params.to   = toDate.value;
    const { data } = await api.get('/finance/claims', { params });
    claims.value = data;
  } catch { /* silent */ } finally {
    isLoading.value = false;
  }
}

async function loadLecturers() {
  try {
    const { data } = await api.get('/finance/lecturers');
    lecturers.value = data;
  } catch { /* silent */ }
}

function resetFilters() {
  search.value = ''; filterLecturer.value = ''; fromDate.value = ''; toDate.value = '';
  loadClaims();
}

onMounted(() => { loadClaims(); loadLecturers(); });

// ── Sorting ───────────────────────────────────────────────────────────────────
function sortBy(key) {
  if (sortKey.value === key) sortDir.value = sortDir.value === 'asc' ? 'desc' : 'asc';
  else { sortKey.value = key; sortDir.value = 'asc'; }
}

// ── Filtered + sorted ─────────────────────────────────────────────────────────
const filtered = computed(() => {
  let list = claims.value;
  if (search.value.trim()) {
    const q = search.value.toLowerCase();
    list = list.filter(c =>
      c.lecturerName.toLowerCase().includes(q) ||
      c.courseCode.toLowerCase().includes(q)   ||
      c.courseName.toLowerCase().includes(q)
    );
  }
  return [...list].sort((a, b) => {
    const av = a[sortKey.value] ?? '';
    const bv = b[sortKey.value] ?? '';
    if (typeof av === 'number') return sortDir.value === 'asc' ? av - bv : bv - av;
    return sortDir.value === 'asc'
      ? String(av).localeCompare(String(bv))
      : String(bv).localeCompare(String(av));
  });
});

// ── Summary computeds ─────────────────────────────────────────────────────────
const uniqueLecturers = computed(() => new Set(filtered.value.map(c => c.lecturerId)).size);
const uniqueCourses   = computed(() => new Set(filtered.value.map(c => c.courseId)).size);
const totalSessions   = computed(() => filtered.value.reduce((s, c) => s + c.totalSessions, 0));

// ── Pagination ────────────────────────────────────────────────────────────────
const totalPages = computed(() => Math.max(1, Math.ceil(filtered.value.length / PAGE_SIZE)));
const paginated  = computed(() => filtered.value.slice((page.value - 1) * PAGE_SIZE, page.value * PAGE_SIZE));

// ── CSV Download ──────────────────────────────────────────────────────────────
async function downloadCSV() {
  isDownloading.value = true;
  try {
    const params = new URLSearchParams();
    if (filterLecturer.value) params.set('lecturerId', filterLecturer.value);
    if (fromDate.value)        params.set('from', fromDate.value);
    if (toDate.value)          params.set('to',   toDate.value);

    const token    = localStorage.getItem('token') || sessionStorage.getItem('token') || '';
    const baseURL  = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000';
    const url      = `${baseURL}/api/finance/claims/download?${params.toString()}`;

    const response = await fetch(url, { headers: { Authorization: `Bearer ${token}` } });
    if (!response.ok) throw new Error('Download failed');

    const blob      = await response.blob();
    const filename  = `lecturer_claims_${new Date().toISOString().slice(0, 10)}.csv`;
    const link      = document.createElement('a');
    link.href       = URL.createObjectURL(blob);
    link.download   = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(link.href);
  } catch { /* silent */ } finally {
    isDownloading.value = false;
  }
}
</script>
