<template>
  <div class="fc-container">

    <!-- Header -->
    <div class="fc-header">
      <div>
        <h1 class="fc-title">Lecturer Claims Report</h1>
        <p class="fc-subtitle">Session-based claims for all lecturers — filter and download as CSV</p>
      </div>
      <button class="download-btn" @click="downloadCSV" :disabled="isDownloading">
        <svg v-if="isDownloading" class="spin" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10" stroke-dasharray="31" stroke-dashoffset="10"/></svg>
        <svg v-else viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
        {{ isDownloading ? 'Downloading…' : 'Download CSV' }}
      </button>
    </div>

    <!-- Filters -->
    <div class="fc-filters">
      <div class="search-wrap">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
        <input v-model="search" type="text" placeholder="Search lecturer or course…" class="search-in" />
      </div>
      <select v-model="filterLecturer" class="fsel">
        <option value="">All Lecturers</option>
        <option v-for="l in lecturers" :key="l.id" :value="l.id">{{ l.name }}</option>
      </select>
      <div class="date-group">
        <label class="date-label">From</label>
        <input type="date" v-model="fromDate" class="date-in" />
      </div>
      <div class="date-group">
        <label class="date-label">To</label>
        <input type="date" v-model="toDate" class="date-in" />
      </div>
      <button class="apply-btn" @click="loadClaims">Apply</button>
      <button class="reset-btn"  @click="resetFilters">Reset</button>
    </div>

    <!-- Summary pills -->
    <div class="fc-summary" v-if="!isLoading && filtered.length">
      <span class="summary-pill">📋 {{ filtered.length }} claim rows</span>
      <span class="summary-pill">🎓 {{ uniqueLecturers }} lecturers</span>
      <span class="summary-pill">📚 {{ uniqueCourses }} courses</span>
      <span class="summary-pill">🗓️ {{ totalSessions }} sessions</span>
    </div>

    <!-- Loading / empty -->
    <div v-if="isLoading" class="fc-state">
      <div class="spinner"></div>
      <span>Loading claims…</span>
    </div>
    <div v-else-if="filtered.length === 0" class="fc-empty">
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/></svg>
      <p>No claims data found for the selected filters.</p>
    </div>

    <!-- Claims table -->
    <div v-else class="fc-table-wrap">
      <table class="fc-table">
        <thead>
          <tr>
            <th @click="sortBy('lecturerName')" class="sortable">
              Lecturer <span class="sort-arrow">{{ sortKey === 'lecturerName' ? (sortDir === 'asc' ? '↑' : '↓') : '⇅' }}</span>
            </th>
            <th @click="sortBy('courseCode')" class="sortable">
              Course <span class="sort-arrow">{{ sortKey === 'courseCode' ? (sortDir === 'asc' ? '↑' : '↓') : '⇅' }}</span>
            </th>
            <th>Credits</th>
            <th @click="sortBy('totalSessions')" class="sortable">
              Sessions <span class="sort-arrow">{{ sortKey === 'totalSessions' ? (sortDir === 'asc' ? '↑' : '↓') : '⇅' }}</span>
            </th>
            <th>Student Slots</th>
            <th>Total Present</th>
            <th @click="sortBy('attendanceRate')" class="sortable">
              Attendance % <span class="sort-arrow">{{ sortKey === 'attendanceRate' ? (sortDir === 'asc' ? '↑' : '↓') : '⇅' }}</span>
            </th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="c in paginated" :key="`${c.lecturerId}-${c.courseId}`">
            <td>
              <div class="lec-cell">
                <div class="lec-dot">{{ c.lecturerName.charAt(0) }}</div>
                <div>
                  <p class="lec-name">{{ c.lecturerName }}</p>
                  <p class="lec-email">{{ c.lecturerEmail }}</p>
                </div>
              </div>
            </td>
            <td>
              <p class="course-code">{{ c.courseCode }}</p>
              <p class="course-name">{{ c.courseName }}</p>
            </td>
            <td><span class="credit-badge">{{ c.credits }} cr</span></td>
            <td class="num-cell">{{ c.totalSessions }}</td>
            <td class="num-cell">{{ c.totalStudentSlots }}</td>
            <td class="num-cell">{{ c.totalPresent }}</td>
            <td>
              <div class="rate-wrap">
                <div class="rate-track">
                  <div class="rate-fill" :style="{ width: c.attendanceRate + '%', background: rateColor(c.attendanceRate) }"></div>
                </div>
                <span class="rate-pct" :class="rateClass(c.attendanceRate)">{{ c.attendanceRate }}%</span>
              </div>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Pagination -->
    <div class="pagination" v-if="totalPages > 1">
      <button class="page-btn" :disabled="page === 1"          @click="page--">← Prev</button>
      <span class="page-info">Page {{ page }} of {{ totalPages }}</span>
      <button class="page-btn" :disabled="page === totalPages" @click="page++">Next →</button>
    </div>

  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import api from '@/api.js';

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

const rateClass = (p) => p >= 70 ? 'rate-good' : p >= 45 ? 'rate-warn' : 'rate-bad';
const rateColor = (p) => p >= 70 ? '#10b981' : p >= 45 ? '#f59e0b' : '#ef4444';
</script>

<style scoped>
* { font-family: 'Inter', sans-serif; box-sizing: border-box; }

.fc-container { display: flex; flex-direction: column; gap: 1.5rem; width: 100%; }

/* Header */
.fc-header { display: flex; justify-content: space-between; align-items: flex-start; flex-wrap: wrap; gap: 1rem; }
.fc-title   { margin: 0; font-size: 1.75rem; font-weight: 800; color: #0f172a; letter-spacing: -.025em; }
.fc-subtitle { margin: .25rem 0 0; font-size: .875rem; color: #64748b; }

.download-btn {
  display: inline-flex; align-items: center; gap: .55rem;
  padding: .7rem 1.4rem; background: linear-gradient(135deg, #10b981, #059669);
  color: #fff; border: none; border-radius: 12px; font-size: .875rem; font-weight: 700;
  cursor: pointer; box-shadow: 0 4px 14px rgba(16,185,129,.3); transition: all .2s; white-space: nowrap;
}
.download-btn svg { width: 17px; height: 17px; }
.download-btn:hover:not(:disabled) { transform: translateY(-1px); box-shadow: 0 6px 18px rgba(16,185,129,.4); }
.download-btn:disabled { opacity: .55; cursor: not-allowed; }

/* Filters */
.fc-filters { display: flex; gap: .65rem; flex-wrap: wrap; align-items: flex-end; }
.search-wrap { display: flex; align-items: center; gap: .5rem; background: #fff; border: 1px solid #e2e8f0; border-radius: 9px; padding: .45rem .9rem; flex: 1; min-width: 200px; }
.search-wrap svg { width: 15px; height: 15px; color: #94a3b8; flex-shrink: 0; }
.search-in { border: none; background: transparent; outline: none; font-size: .875rem; color: #334155; width: 100%; }
.fsel { padding: .48rem .75rem; border: 1px solid #e2e8f0; border-radius: 9px; font-size: .875rem; color: #334155; background: #fff; outline: none; cursor: pointer; }
.date-group { display: flex; flex-direction: column; gap: .2rem; }
.date-label { font-size: .7rem; font-weight: 700; color: #64748b; text-transform: uppercase; letter-spacing: .05em; }
.date-in { padding: .45rem .7rem; border: 1px solid #e2e8f0; border-radius: 9px; font-size: .875rem; color: #334155; background: #fff; outline: none; cursor: pointer; }
.apply-btn { padding: .5rem 1.1rem; background: #0ea5e9; color: #fff; border: none; border-radius: 9px; font-size: .875rem; font-weight: 700; cursor: pointer; transition: background .2s; align-self: flex-end; }
.apply-btn:hover { background: #0284c7; }
.reset-btn { padding: .5rem 1rem; background: #fff; color: #475569; border: 1px solid #e2e8f0; border-radius: 9px; font-size: .875rem; font-weight: 600; cursor: pointer; transition: all .2s; align-self: flex-end; }
.reset-btn:hover { border-color: #94a3b8; color: #334155; }

/* Summary pills */
.fc-summary { display: flex; flex-wrap: wrap; gap: .5rem; }
.summary-pill { display: inline-block; background: #f1f5f9; color: #475569; font-size: .78rem; font-weight: 700; padding: .3rem .75rem; border-radius: 999px; border: 1px solid #e2e8f0; }

/* Loading / empty */
.fc-state { display: flex; flex-direction: column; align-items: center; gap: .75rem; padding: 4rem; color: #94a3b8; font-size: .95rem; }
.spinner { width: 28px; height: 28px; border: 3px solid #e2e8f0; border-top-color: #0ea5e9; border-radius: 50%; animation: spin .7s linear infinite; }
@keyframes spin { to { transform: rotate(360deg); } }
.fc-empty { display: flex; flex-direction: column; align-items: center; gap: 1rem; padding: 4rem 2rem; background: #f8fafc; border: 1px dashed #cbd5e1; border-radius: 16px; text-align: center; }
.fc-empty svg { width: 48px; height: 48px; color: #cbd5e1; }
.fc-empty p { margin: 0; color: #64748b; }

/* Table */
.fc-table-wrap { background: #fff; border-radius: 18px; border: 1px solid #f1f5f9; box-shadow: 0 2px 12px rgba(0,0,0,.05); overflow: hidden; }
.fc-table { width: 100%; border-collapse: collapse; font-size: .875rem; }
.fc-table th { background: #f8fafc; color: #64748b; font-size: .72rem; font-weight: 700; text-transform: uppercase; letter-spacing: .05em; padding: .85rem 1.1rem; text-align: left; white-space: nowrap; }
.fc-table th.sortable { cursor: pointer; user-select: none; }
.fc-table th.sortable:hover { color: #0ea5e9; }
.sort-arrow { font-size: .65rem; margin-left: .25rem; }
.fc-table td { padding: .9rem 1.1rem; border-bottom: 1px solid #f8fafc; vertical-align: middle; }
.fc-table tr:last-child td { border-bottom: none; }
.fc-table tr:hover td { background: #f8fafc; }

.lec-cell { display: flex; align-items: center; gap: .65rem; }
.lec-dot { width: 34px; height: 34px; border-radius: 10px; background: linear-gradient(135deg, #0ea5e9, #0284c7); color: #fff; font-size: .9rem; font-weight: 800; display: flex; align-items: center; justify-content: center; flex-shrink: 0; }
.lec-name  { margin: 0; font-size: .875rem; font-weight: 700; color: #0f172a; }
.lec-email { margin: 0; font-size: .75rem; color: #94a3b8; }
.course-code { margin: 0; font-size: .875rem; font-weight: 700; color: #0f172a; }
.course-name { margin: 0; font-size: .75rem; color: #64748b; }
.credit-badge { display: inline-block; background: #f3e8ff; color: #7c3aed; font-size: .72rem; font-weight: 700; padding: .15rem .55rem; border-radius: 999px; }
.num-cell { font-weight: 700; color: #334155; text-align: center; }

.rate-wrap  { display: flex; align-items: center; gap: .65rem; }
.rate-track { flex: 1; height: 6px; background: #f1f5f9; border-radius: 999px; overflow: hidden; min-width: 60px; }
.rate-fill  { height: 100%; border-radius: 999px; transition: width .5s; }
.rate-pct   { font-size: .82rem; font-weight: 700; white-space: nowrap; }
.rate-good  { color: #10b981; }
.rate-warn  { color: #f59e0b; }
.rate-bad   { color: #ef4444; }

/* Pagination */
.pagination { display: flex; justify-content: center; align-items: center; gap: 1rem; padding: .5rem; }
.page-btn   { padding: .45rem 1.1rem; border: 1px solid #e2e8f0; border-radius: 9px; background: #fff; font-size: .875rem; font-weight: 600; color: #475569; cursor: pointer; transition: all .2s; }
.page-btn:hover:not(:disabled) { border-color: #0ea5e9; color: #0ea5e9; }
.page-btn:disabled { opacity: .4; cursor: not-allowed; }
.page-info  { font-size: .875rem; color: #64748b; font-weight: 600; }

/* Spin animation */
.spin { animation: spin .8s linear infinite; }

@media (max-width: 768px) {
  .fc-header { flex-direction: column; }
  .download-btn { width: 100%; justify-content: center; }
  .fc-filters { flex-direction: column; }
  .search-wrap, .fsel, .date-in { width: 100%; }
  .apply-btn, .reset-btn { width: 100%; }
  .fc-table { font-size: .78rem; }
  .fc-table th, .fc-table td { padding: .65rem .75rem; }
  .lec-email, .course-name { display: none; }
}
</style>
