<template>
  <div class="sa-container">

    <!-- Header -->
    <div class="sa-header">
      <div>
        <h1 class="sa-title">Session Analytics</h1>
        <p class="sa-subtitle">Live and historical view of all attendance sessions</p>
      </div>
      <div class="sa-header-right">
        <div class="refresh-info">
          <span class="pulse-dot"></span>
          Real-time
        </div>
        <select v-model="courseFilter" class="fsel" id="sa-course-filter">
          <option value="">All Courses</option>
          <option v-for="c in courses" :key="c.id" :value="c.id">{{ c.code }} – {{ c.name }}</option>
        </select>
        <select v-model="statusFilter" class="fsel" id="sa-status-filter">
          <option value="">All Statuses</option>
          <option value="active">Active</option>
          <option value="closed">Closed</option>
        </select>
      </div>
    </div>

    <!-- KPI strip -->
    <div class="kpi-row">
      <div class="kpi-tile kpi-blue">
        <div class="kpi-ico"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg></div>
        <div><p class="kpi-lbl">Total Sessions</p><h3 class="kpi-val">{{ sessions.length }}</h3></div>
      </div>
      <div class="kpi-tile kpi-green">
        <div class="kpi-ico"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg></div>
        <div><p class="kpi-lbl">Active Now</p><h3 class="kpi-val">{{ activeSessions.length }}</h3></div>
      </div>
      <div class="kpi-tile kpi-indigo">
        <div class="kpi-ico"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg></div>
        <div><p class="kpi-lbl">Total Attendances</p><h3 class="kpi-val">{{ attendances.length }}</h3></div>
      </div>
      <div class="kpi-tile kpi-amber">
        <div class="kpi-ico"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/></svg></div>
        <div><p class="kpi-lbl">Avg Attendance Rate</p><h3 class="kpi-val">{{ avgRate }}%</h3></div>
      </div>
    </div>

    <!-- Active sessions -->
    <div class="panel" v-if="activeSessions.length > 0">
      <div class="panel-head">
        <h2><span class="live-dot"></span> Live Sessions</h2>
        <span class="count-chip">{{ activeSessions.length }} running</span>
      </div>
      <div class="live-grid">
        <div v-for="s in activeSessions" :key="s.id" class="live-card">
          <div class="live-card-top">
            <div>
              <span class="course-code-badge">{{ s.courseCode }}</span>
              <span class="live-badge-pill">LIVE</span>
            </div>
            <div class="live-pin">PIN: <strong>{{ s.pin }}</strong></div>
          </div>
          <h3 class="live-course-name">{{ s.courseName }}</h3>
          <div class="live-stats">
            <div class="live-stat">
              <span class="lst-num present">{{ s.presentCount }}</span>
              <span class="lst-lbl">Present</span>
            </div>
            <div class="live-stat">
              <span class="lst-num absent">{{ s.absentCount }}</span>
              <span class="lst-lbl">Absent</span>
            </div>
            <div class="live-stat">
              <span class="lst-num rate">{{ s.rate }}%</span>
              <span class="lst-lbl">Rate</span>
            </div>
          </div>
          <div class="live-bar-track">
            <div class="live-bar-fill" :style="{ width: s.rate + '%' }"></div>
          </div>
          <p class="live-meta">Started {{ s.startedAgo }}</p>
        </div>
      </div>
    </div>

    <!-- All sessions table -->
    <div class="panel">
      <div class="panel-head">
        <h2>All Sessions</h2>
        <div class="search-wrap">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
          <input v-model="searchQ" type="text" placeholder="Search course or date…" class="search-in" id="sa-search"/>
        </div>
      </div>

      <div class="table-wrap">
        <table class="sa-table" id="sa-sessions-table">
          <thead>
            <tr>
              <th @click="sortBy('date')" class="sortable">Date <span class="sort-arrow">{{ sortField==='date' ? (sortAsc?'↑':'↓') : '↕' }}</span></th>
              <th>Course</th>
              <th>PIN</th>
              <th @click="sortBy('present')" class="sortable">Present <span class="sort-arrow">{{ sortField==='present' ? (sortAsc?'↑':'↓') : '↕' }}</span></th>
              <th @click="sortBy('absent')" class="sortable">Absent <span class="sort-arrow">{{ sortField==='absent' ? (sortAsc?'↑':'↓') : '↕' }}</span></th>
              <th @click="sortBy('rate')" class="sortable">Rate <span class="sort-arrow">{{ sortField==='rate' ? (sortAsc?'↑':'↓') : '↕' }}</span></th>
              <th>Status</th>
              <th>Bar</th>
            </tr>
          </thead>
          <tbody>
            <tr v-if="paginatedSessions.length === 0">
              <td colspan="8" class="empty-cell">No sessions match your filters.</td>
            </tr>
            <tr v-for="s in paginatedSessions" :key="s.id">
              <td class="mono">{{ s.dateFormatted }}</td>
              <td>
                <span class="course-code-badge sm">{{ s.courseCode }}</span>
                {{ s.courseName }}
              </td>
              <td class="mono">{{ s.pin }}</td>
              <td class="present-val">{{ s.presentCount }}</td>
              <td class="absent-val">{{ s.absentCount }}</td>
              <td>
                <span class="rate-badge" :class="rateClass(s.rate)">{{ s.rate }}%</span>
              </td>
              <td>
                <span class="status-chip" :class="s.isActive ? 'chip-active' : 'chip-closed'">
                  {{ s.isActive ? 'Active' : 'Closed' }}
                </span>
              </td>
              <td class="bar-cell">
                <div class="mini-bar-track">
                  <div class="mini-bar-fill" :style="{ width: s.rate + '%', background: rateColor(s.rate) }"></div>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- Pagination -->
      <div class="pagination" v-if="totalPages > 1">
        <button class="page-btn" :disabled="page === 1" @click="page--" id="sa-prev-btn">← Prev</button>
        <span class="page-info">Page {{ page }} of {{ totalPages }}</span>
        <button class="page-btn" :disabled="page === totalPages" @click="page++" id="sa-next-btn">Next →</button>
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
// Absent rows are now written to DB on session close — read them directly.
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
function rateClass(r) { return r >= 75 ? 'rate-good' : r >= 50 ? 'rate-warn' : 'rate-bad'; }
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

<style scoped>
* { font-family: 'Inter', sans-serif; box-sizing: border-box; }
.sa-container { display: flex; flex-direction: column; gap: 1.75rem; width: 100%; }

/* Header */
.sa-header { display: flex; justify-content: space-between; align-items: flex-start; flex-wrap: wrap; gap: 1rem; }
.sa-title   { margin: 0; font-size: 1.75rem; font-weight: 700; color: #0f172a; letter-spacing: -0.025em; }
.sa-subtitle { margin: .25rem 0 0; font-size: .9rem; color: #64748b; }
.sa-header-right { display: flex; align-items: center; gap: .75rem; flex-wrap: wrap; }
.refresh-info { display: flex; align-items: center; gap: .4rem; font-size: .8rem; font-weight: 600; color: #10b981; background: #dcfce7; padding: .35rem .75rem; border-radius: 999px; }
.pulse-dot { width: 8px; height: 8px; background: #10b981; border-radius: 50%; animation: pulse 2s infinite; }
@keyframes pulse { 0%,100%{opacity:1}50%{opacity:.3} }

/* Filter selects */
.fsel { padding: .45rem .75rem; border: 1px solid #e2e8f0; border-radius: 8px; font-size: .875rem; color: #334155; background: #fff; outline: none; cursor: pointer; }
.fsel:focus { border-color: #6366f1; }

/* KPI row */
.kpi-row { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px,1fr)); gap: 1.25rem; }
.kpi-tile { display: flex; align-items: center; gap: 1rem; background: #fff; border-radius: 16px; padding: 1.25rem 1.5rem; border: 1px solid #f1f5f9; box-shadow: 0 2px 8px rgba(0,0,0,.04); transition: transform .2s; }
.kpi-tile:hover { transform: translateY(-2px); }
.kpi-ico { width: 46px; height: 46px; border-radius: 12px; display: flex; align-items: center; justify-content: center; flex-shrink: 0; }
.kpi-ico svg { width: 22px; height: 22px; }
.kpi-lbl { margin: 0 0 2px; font-size: .78rem; font-weight: 600; text-transform: uppercase; letter-spacing: .05em; color: #64748b; }
.kpi-val { margin: 0; font-size: 1.9rem; font-weight: 700; color: #0f172a; letter-spacing: -.03em; }
.kpi-blue   .kpi-ico { background: #e0f2fe; color: #0369a1; }
.kpi-green  .kpi-ico { background: #dcfce7; color: #15803d; }
.kpi-indigo .kpi-ico { background: #e0e7ff; color: #4338ca; }
.kpi-amber  .kpi-ico { background: #fef9c3; color: #a16207; }

/* Panel */
.panel { background: #fff; border-radius: 16px; padding: 1.5rem; border: 1px solid #f1f5f9; box-shadow: 0 2px 8px rgba(0,0,0,.04); }
.panel-head { display: flex; justify-content: space-between; align-items: center; margin-bottom: 1.25rem; flex-wrap: wrap; gap: .75rem; }
.panel-head h2 { margin: 0; font-size: 1rem; font-weight: 700; color: #0f172a; display: flex; align-items: center; gap: .5rem; }
.count-chip { font-size: .75rem; font-weight: 700; background: #dcfce7; color: #15803d; padding: .2rem .6rem; border-radius: 999px; }

/* Live dot */
.live-dot { width: 10px; height: 10px; background: #10b981; border-radius: 50%; display: inline-block; animation: pulse 1.5s infinite; }

/* Live grid */
.live-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(260px,1fr)); gap: 1rem; }
.live-card { background: linear-gradient(135deg,#f0fdf4,#dcfce7); border: 1px solid #bbf7d0; border-radius: 14px; padding: 1.25rem; display: flex; flex-direction: column; gap: .6rem; }
.live-card-top { display: flex; justify-content: space-between; align-items: center; }
.course-code-badge { font-size: .72rem; font-weight: 700; background: #e0e7ff; color: #4338ca; padding: .15rem .45rem; border-radius: 5px; }
.course-code-badge.sm { font-size: .68rem; }
.live-badge-pill { font-size: .65rem; font-weight: 700; background: #10b981; color: #fff; padding: .15rem .45rem; border-radius: 4px; margin-left: .35rem; letter-spacing: .04em; animation: pulse 2s infinite; }
.live-pin { font-size: .78rem; color: #475569; font-weight: 600; }
.live-course-name { margin: 0; font-size: .95rem; font-weight: 700; color: #0f172a; }
.live-stats { display: flex; gap: 1rem; }
.live-stat { display: flex; flex-direction: column; align-items: center; }
.lst-num { font-size: 1.3rem; font-weight: 700; }
.lst-num.present { color: #10b981; }
.lst-num.absent  { color: #ef4444; }
.lst-num.rate    { color: #6366f1; }
.lst-lbl { font-size: .68rem; color: #64748b; font-weight: 600; text-transform: uppercase; letter-spacing: .04em; }
.live-bar-track { height: 6px; background: rgba(0,0,0,.08); border-radius: 999px; overflow: hidden; }
.live-bar-fill  { height: 100%; background: #10b981; border-radius: 999px; transition: width .6s; }
.live-meta { margin: 0; font-size: .75rem; color: #64748b; }

/* Search */
.search-wrap { display: flex; align-items: center; gap: .5rem; background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: .4rem .75rem; }
.search-wrap svg { width: 15px; height: 15px; color: #94a3b8; flex-shrink: 0; }
.search-in { border: none; background: transparent; outline: none; font-size: .875rem; color: #334155; min-width: 200px; }

/* Table */
.table-wrap { overflow-x: auto; }
.sa-table { width: 100%; border-collapse: collapse; font-size: .875rem; }
.sa-table thead th { padding: .65rem 1rem; text-align: left; font-size: .72rem; font-weight: 700; text-transform: uppercase; letter-spacing: .05em; color: #64748b; background: #f8fafc; border-bottom: 1px solid #e2e8f0; white-space: nowrap; }
.sa-table thead th.sortable { cursor: pointer; user-select: none; }
.sa-table thead th.sortable:hover { color: #6366f1; }
.sort-arrow { color: #94a3b8; margin-left: .25rem; }
.sa-table tbody tr { border-bottom: 1px solid #f1f5f9; transition: background .15s; }
.sa-table tbody tr:hover { background: #f8fafc; }
.sa-table tbody td { padding: .75rem 1rem; color: #334155; vertical-align: middle; }
.empty-cell { text-align: center; color: #94a3b8; padding: 3rem !important; }
.mono { font-family: 'JetBrains Mono','Courier New',monospace; font-size: .82rem; color: #475569; }
.present-val { color: #10b981; font-weight: 700; }
.absent-val  { color: #ef4444; font-weight: 700; }

.rate-badge { font-size: .75rem; font-weight: 700; padding: .2rem .5rem; border-radius: 5px; }
.rate-good { background: #dcfce7; color: #15803d; }
.rate-warn { background: #fef9c3; color: #a16207; }
.rate-bad  { background: #fee2e2; color: #b91c1c; }

.status-chip { font-size: .72rem; font-weight: 700; padding: .2rem .5rem; border-radius: 5px; }
.chip-active { background: #dcfce7; color: #15803d; }
.chip-closed { background: #f1f5f9; color: #64748b; }

.bar-cell { width: 120px; }
.mini-bar-track { height: 5px; background: #f1f5f9; border-radius: 999px; overflow: hidden; }
.mini-bar-fill  { height: 100%; border-radius: 999px; transition: width .4s; }

/* Pagination */
.pagination { display: flex; align-items: center; justify-content: flex-end; gap: 1rem; margin-top: 1rem; }
.page-btn { padding: .4rem 1rem; border: 1px solid #e2e8f0; border-radius: 8px; background: #fff; color: #6366f1; font-weight: 600; font-size: .875rem; cursor: pointer; transition: all .2s; }
.page-btn:hover:not(:disabled) { background: #6366f1; color: #fff; border-color: #6366f1; }
.page-btn:disabled { opacity: .35; cursor: default; }
.page-info { font-size: .875rem; color: #64748b; }

@media(max-width:768px) { .sa-header { flex-direction: column; } .kpi-row { grid-template-columns: repeat(2,1fr); } }
</style>
