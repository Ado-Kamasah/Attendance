<template>
  <div class="analytics-page">
    <!-- Admin Lecturer Picker -->
    <div v-if="isAdmin" class="admin-picker-banner">
      <div class="picker-label">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>
        <span>Viewing as Lecturer:</span>
      </div>
      <div class="picker-controls">
        <select v-model="selectedLecturerId" class="filter-select lecturer-select" @change="loadAnalytics">
          <option value="">— Select a lecturer —</option>
          <option v-for="l in allLecturers" :key="l.id" :value="l.id">{{ l.name }} ({{ l.courseCount }} course{{ l.courseCount !== 1 ? 's' : '' }})</option>
        </select>
        <div v-if="selectedLecturer" class="selected-lecturer-pill">
          <div class="lec-avatar">{{ selectedLecturer.name.charAt(0) }}</div>
          <span>{{ selectedLecturer.name }}</span>
        </div>
      </div>
    </div>

    <!-- Header -->
    <div class="page-header">
      <div>
        <h1 class="page-title">Attendance Analytics</h1>
        <p class="page-subtitle" v-if="isAdmin && selectedLecturer">Showing data for <strong>{{ selectedLecturer.name }}</strong></p>
        <p class="page-subtitle" v-else-if="isAdmin">Select a lecturer above to view their analytics</p>
        <p class="page-subtitle" v-else>Deep insights into student attendance across all your courses</p>
      </div>
      <div class="header-actions">
        <select v-model="selectedCourseFilter" class="filter-select" :disabled="isAdmin && !selectedLecturerId">
          <option value="all">All Courses</option>
          <option v-for="c in myCourses" :key="c.id" :value="c.id">{{ c.code }} — {{ c.name }}</option>
        </select>
        <div class="last-updated" v-if="lastUpdated">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
          {{ lastUpdated }}
        </div>
      </div>
    </div>

    <!-- Empty state for admin with no lecturer selected -->
    <div v-if="isAdmin && !selectedLecturerId" class="admin-empty-state">
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>
      <h3>Select a Lecturer</h3>
      <p>Choose a lecturer from the dropdown above to view their attendance analytics.</p>
    </div>

    <!-- Loading -->
    <div v-else-if="isLoading" class="loading-grid">
      <div v-for="i in 4" :key="i" class="skeleton-card"></div>
    </div>

    <template v-else-if="!isAdmin || selectedLecturerId">
      <!-- KPI Tiles -->
      <div class="kpi-grid">
        <div class="kpi-card kpi-blue">
          <div class="kpi-icon"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg></div>
          <div class="kpi-body">
            <span class="kpi-value">{{ kpi.totalSessions }}</span>
            <span class="kpi-label">Sessions Held</span>
          </div>
          <div class="kpi-trend up">+{{ kpi.sessionsThisWeek }} this week</div>
        </div>
        <div class="kpi-card kpi-green">
          <div class="kpi-icon"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/></svg></div>
          <div class="kpi-body">
            <span class="kpi-value">{{ kpi.avgRate }}%</span>
            <span class="kpi-label">Avg Attendance Rate</span>
          </div>
          <div class="kpi-rate-bar"><div class="kpi-rate-fill" :style="{ width: kpi.avgRate + '%' }"></div></div>
        </div>
        <div class="kpi-card kpi-amber">
          <div class="kpi-icon"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg></div>
          <div class="kpi-body">
            <span class="kpi-value">{{ kpi.atRisk }}</span>
            <span class="kpi-label">At-Risk Students</span>
          </div>
          <div class="kpi-trend warn">Below 75% threshold</div>
        </div>
        <div class="kpi-card kpi-purple">
          <div class="kpi-icon"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 11.08V12a10 10 0 11-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg></div>
          <div class="kpi-body">
            <span class="kpi-value">{{ kpi.perfect }}</span>
            <span class="kpi-label">Perfect Attendance</span>
          </div>
          <div class="kpi-trend up">100% across all sessions</div>
        </div>
      </div>

      <!-- Charts Row -->
      <div class="charts-row">
        <!-- Course Breakdown Bar Chart -->
        <div class="chart-card">
          <div class="chart-header">
            <h2>Course Attendance Breakdown</h2>
            <p>Average attendance rate per course</p>
          </div>
          <div v-if="courseBreakdown.length === 0" class="empty-chart">No sessions recorded yet.</div>
          <div v-else class="bar-chart">
            <div v-for="c in courseBreakdown" :key="c.id" class="bar-row">
              <div class="bar-label">
                <span class="course-tag">{{ c.code }}</span>
                <span class="bar-name">{{ c.name }}</span>
              </div>
              <div class="bar-track">
                <div class="bar-fill" :style="{ width: c.rate + '%' }" :class="rateClass(c.rate) + '-bar'"></div>
              </div>
              <div class="bar-footer">
                <span :class="['bar-pct', rateClass(c.rate)]">{{ c.rate }}%</span>
                <span class="bar-meta">{{ c.sessions }} sessions · {{ c.present }}/{{ c.total }} present</span>
              </div>
            </div>
          </div>
        </div>

        <!-- Sparkline Trend -->
        <div class="chart-card narrow">
          <div class="chart-header">
            <h2>Attendance Trend</h2>
            <p>Rate per session (last 10)</p>
          </div>
          <div v-if="trendPoints.length < 2" class="empty-chart">Not enough sessions for a trend yet.</div>
          <div v-else class="sparkline-wrap">
            <svg viewBox="0 0 220 100" preserveAspectRatio="none" class="sparkline">
              <defs>
                <linearGradient id="sg" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stop-color="#6366f1" stop-opacity="0.35"/>
                  <stop offset="100%" stop-color="#6366f1" stop-opacity="0.02"/>
                </linearGradient>
              </defs>
              <path :d="sparkAreaPath" fill="url(#sg)"/>
              <path :d="sparkLinePath" fill="none" stroke="#6366f1" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/>
              <circle v-for="(pt, i) in trendPoints" :key="i" :cx="pt.x" :cy="pt.y" r="3.5" fill="#6366f1" stroke="#fff" stroke-width="1.5"/>
            </svg>
            <div class="spark-labels">
              <span>{{ trendMin }}%</span>
              <span>{{ trendMax }}%</span>
            </div>
            <div class="spark-axis">
              <span>{{ trendDates[0] }}</span>
              <span>{{ trendDates[trendDates.length - 1] }}</span>
            </div>
          </div>
        </div>
      </div>

      <!-- At-Risk Students -->
      <div class="section-card" v-if="atRiskStudents.length > 0">
        <div class="section-header">
          <div>
            <h2>⚠️ At-Risk Students</h2>
            <p>Students with attendance below 75% in one or more of your courses</p>
          </div>
          <span class="badge badge-red">{{ atRiskStudents.length }} student{{ atRiskStudents.length !== 1 ? 's' : '' }}</span>
        </div>
        <div class="table-wrap">
          <table class="data-table">
            <thead><tr><th>Student</th><th>Course</th><th>Attended</th><th>Rate</th><th>Status</th></tr></thead>
            <tbody>
              <tr v-for="s in atRiskStudents" :key="s.key">
                <td>
                  <div class="student-cell">
                    <div class="s-avatar">{{ (s.name || '?').charAt(0) }}</div>
                    <div><div class="s-name">{{ s.name }}</div><div class="s-id">{{ s.idNumber }}</div></div>
                  </div>
                </td>
                <td><span class="course-tag sm">{{ s.courseCode }}</span></td>
                <td class="centered">{{ s.attended }} / {{ s.total }}</td>
                <td>
                  <div class="rate-wrap">
                    <div class="rate-bar"><div class="rate-fill" :style="{ width: s.rate + '%' }" :class="rateClass(s.rate)"></div></div>
                    <span :class="['rate-num', rateClass(s.rate)]">{{ s.rate }}%</span>
                  </div>
                </td>
                <td><span class="status-chip" :class="rateClass(s.rate)">{{ s.rate < 50 ? 'Critical' : 'At Risk' }}</span></td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <!-- Session History -->
      <div class="section-card">
        <div class="section-header">
          <div>
            <h2>Session History</h2>
            <p>All recorded attendance sessions</p>
          </div>
          <span class="badge badge-purple">{{ filteredSessions.length }} sessions</span>
        </div>
        <div v-if="filteredSessions.length === 0" class="empty-state">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><circle cx="12" cy="12" r="10"/><line x1="8" y1="12" x2="16" y2="12"/></svg>
          <p>No sessions for the selected filter.</p>
        </div>
        <div v-else class="table-wrap">
          <table class="data-table">
            <thead><tr><th>Date &amp; Time</th><th>Course</th><th>Mode</th><th>PIN</th><th>Present</th><th>Absent</th><th>Rate</th></tr></thead>
            <tbody>
              <tr v-for="s in filteredSessions" :key="s.id">
                <td>
                  <div class="date-cell">
                    <span class="date-main">{{ formatDate(s.createdAt) }}</span>
                    <span class="date-time">{{ formatTime(s.createdAt) }}</span>
                  </div>
                </td>
                <td>
                  <div class="course-cell">
                    <span class="course-tag sm">{{ s.courseCode }}</span>
                    <span class="course-name-sm">{{ s.courseName }}</span>
                  </div>
                </td>
                <td><span class="mode-chip">{{ s.mode || 'Regular' }}</span></td>
                <td><code class="pin-code">{{ s.pin }}</code></td>
                <td class="centered clr-green">{{ s.presentCount }}</td>
                <td class="centered clr-red">{{ s.absentCount }}</td>
                <td>
                  <div class="rate-wrap">
                    <div class="rate-bar sm"><div class="rate-fill" :style="{ width: s.rate + '%' }" :class="rateClass(s.rate)"></div></div>
                    <span :class="['rate-num', rateClass(s.rate)]">{{ s.rate }}%</span>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <!-- Class Rep Attendance Reports -->
      <div class="section-card">
        <div class="section-header">
          <div>
            <h2>🎓 Class Rep Attendance Reports</h2>
            <p>Lecturer attendance marked by class representatives</p>
          </div>
          <span class="badge badge-teal">{{ filteredLecturerAttendances.length }} record{{ filteredLecturerAttendances.length !== 1 ? 's' : '' }}</span>
        </div>
        <div v-if="filteredLecturerAttendances.length === 0" class="empty-state">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M9 5H7a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2h-2"/><rect x="9" y="3" width="6" height="4" rx="1"/><path d="M9 12h6M9 16h4"/></svg>
          <p>No class rep attendance records found for this lecturer's courses.</p>
        </div>
        <div v-else class="table-wrap">
          <table class="data-table">
            <thead>
              <tr>
                <th>Date &amp; Time</th>
                <th>Course</th>
                <th>Status</th>
                <th>Marked By</th>
                <th>Notes</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="r in filteredLecturerAttendances" :key="r.id">
                <td>
                  <div class="date-cell">
                    <span class="date-main">{{ formatDate(r.date + 'T00:00:00') }}</span>
                    <span class="date-time">{{ r.time }}</span>
                  </div>
                </td>
                <td>
                  <div class="course-cell">
                    <span class="course-tag sm">{{ r.courseCode }}</span>
                    <span class="course-name-sm">{{ r.courseName }}</span>
                  </div>
                </td>
                <td>
                  <span class="la-status-chip" :class="r.status">
                    {{ r.status === 'present' ? '✅ Present' : r.status === 'late' ? '🕐 Late' : '❌ Absent' }}
                  </span>
                </td>
                <td>
                  <div class="marked-by-cell">
                    <div class="s-avatar rep-avatar">{{ (r.markedByName || '?').charAt(0) }}</div>
                    <div>
                      <div class="s-name">{{ r.markedByName }}</div>
                      <div class="s-id">Class Rep</div>
                    </div>
                  </div>
                </td>
                <td class="notes-cell">{{ r.notes || '—' }}</td>
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
import { useAuthStore } from '@/stores/authstore';
import { supabase } from '@/stores/supabase';

const authStore = useAuthStore();

const isLoading = ref(true);
const selectedCourseFilter = ref('all');
const lastUpdated = ref('');
const rawSessions = ref([]);
const rawLecturerAttendances = ref([]);
const rawAttendances = ref([]);

const PALETTE = ['#6366f1','#10b981','#f59e0b','#ec4899','#0ea5e9','#8b5cf6','#ef4444'];

// My courses derived from sessions already filtered by lecturer_id from Supabase
const myCourses = computed(() => {
  const seen = new Set();
  return rawSessions.value
    .filter(s => { if (seen.has(s.courseId)) return false; seen.add(s.courseId); return true; })
    .map(s => ({ id: s.courseId, code: s.courseCode, name: s.courseName }));
});

const filteredSessions = computed(() =>
  selectedCourseFilter.value === 'all'
    ? rawSessions.value
    : rawSessions.value.filter(s => s.courseId === selectedCourseFilter.value)
);

const filteredLecturerAttendances = computed(() =>
  selectedCourseFilter.value === 'all'
    ? rawLecturerAttendances.value
    : rawLecturerAttendances.value.filter(r => r.courseId === selectedCourseFilter.value)
);

// KPI
const atRiskStudents = computed(() => {
  const list = [];
  myCourses.value.forEach(course => {
    const sessions = rawSessions.value.filter(s => s.courseId === course.id);
    if (!sessions.length) return;
    const ids = new Set(sessions.map(s => s.id));
    const total = sessions.length;
    const byStudent = new Map();
    rawAttendances.value.filter(a => ids.has(a.sessionId)).forEach(a => {
      if (!byStudent.has(a.studentId)) byStudent.set(a.studentId, { present: 0, name: a.studentName, idNumber: a.idNumber });
      if (a.status === 'present') byStudent.get(a.studentId).present++;
    });
    byStudent.forEach((val, sid) => {
      const rate = Math.round((val.present / total) * 100);
      if (rate < 75) list.push({ key: `${course.id}-${sid}`, studentId: sid, name: val.name, idNumber: val.idNumber, courseCode: course.code, attended: val.present, total, rate });
    });
  });
  return list.sort((a, b) => a.rate - b.rate);
});

const perfectStudentCount = computed(() => {
  const s = new Set();
  myCourses.value.forEach(course => {
    const sessions = rawSessions.value.filter(x => x.courseId === course.id);
    if (!sessions.length) return;
    const ids = new Set(sessions.map(x => x.id));
    const total = sessions.length;
    const byS = new Map();
    rawAttendances.value.filter(a => ids.has(a.sessionId)).forEach(a => {
      if (!byS.has(a.studentId)) byS.set(a.studentId, 0);
      if (a.status === 'present') byS.set(a.studentId, byS.get(a.studentId) + 1);
    });
    byS.forEach((c, sid) => { if (c === total) s.add(sid); });
  });
  return s.size;
});

const kpi = computed(() => {
  const sessions = filteredSessions.value;
  const now = new Date(), weekAgo = new Date(now - 7 * 86400000);
  const rates = sessions.filter(s => s.total > 0).map(s => s.rate);
  return {
    totalSessions: sessions.length,
    sessionsThisWeek: sessions.filter(s => new Date(s.createdAt) >= weekAgo).length,
    avgRate: rates.length ? Math.round(rates.reduce((a, b) => a + b, 0) / rates.length) : 0,
    atRisk: atRiskStudents.value.length,
    perfect: perfectStudentCount.value,
  };
});

const courseBreakdown = computed(() =>
  myCourses.value.map((course, idx) => {
    const sessions = rawSessions.value.filter(s => s.courseId === course.id);
    const ids = new Set(sessions.map(s => s.id));
    const rel = rawAttendances.value.filter(a => ids.has(a.sessionId));
    const present = rel.filter(a => a.status === 'present').length;
    const total = rel.length;
    return { id: course.id, code: course.code, name: course.name, sessions: sessions.length, present, total, rate: total > 0 ? Math.round((present / total) * 100) : 0, color: PALETTE[idx % PALETTE.length] };
  }).filter(c => c.sessions > 0).sort((a, b) => b.rate - a.rate)
);

// Sparkline
const trendData = computed(() =>
  [...filteredSessions.value].sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt)).slice(-10).filter(s => s.total > 0).map(s => ({ rate: s.rate, date: formatDateShort(s.createdAt) }))
);
const trendPoints = computed(() => {
  const d = trendData.value;
  if (d.length < 2) return [];
  const min = Math.min(...d.map(x => x.rate)), max = Math.max(...d.map(x => x.rate)), range = max - min || 1;
  return d.map((x, i) => ({ x: 8 + (i / (d.length - 1)) * 204, y: 8 + ((max - x.rate) / range) * 84 }));
});
const sparkLinePath = computed(() => trendPoints.value.map((p, i) => `${i === 0 ? 'M' : 'L'}${p.x.toFixed(1)},${p.y.toFixed(1)}`).join(' '));
const sparkAreaPath = computed(() => {
  const pts = trendPoints.value;
  if (pts.length < 2) return '';
  return sparkLinePath.value + ` L${pts[pts.length-1].x.toFixed(1)},100 L${pts[0].x.toFixed(1)},100 Z`;
});
const trendMin = computed(() => trendData.value.length ? Math.min(...trendData.value.map(d => d.rate)) : 0);
const trendMax = computed(() => trendData.value.length ? Math.max(...trendData.value.map(d => d.rate)) : 0);
const trendDates = computed(() => trendData.value.map(d => d.date));

function rateClass(r) { return r >= 75 ? 'good' : r >= 50 ? 'warn' : 'danger'; }
function formatDate(iso) { return iso ? new Date(iso).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }) : '—'; }
function formatTime(iso) { return iso ? new Date(iso).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' }) : ''; }
function formatDateShort(iso) { return iso ? new Date(iso).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' }) : ''; }

const isAdmin = computed(() => {
  const role = (authStore.profile?.role || '').toUpperCase().replace(/[\s_-]+/g, '_');
  return role === 'ADMIN' || role === 'SUPER_ADMIN';
});

// Admin-only: lecturer list + selection
const allLecturers = ref([]);
const selectedLecturerId = ref('');
const selectedLecturer = computed(() => allLecturers.value.find(l => l.id === selectedLecturerId.value) ?? null);

async function fetchAllLecturers() {
  try {
    const { data } = await supabase
      .from('users')
      .select('id, name, email, role')
      .or('role.ilike.lecturer,role.ilike.staff')
      .order('name');
    if (!data) return;
    // Count sessions per lecturer for display
    const { data: sessionCounts } = await supabase
      .from('sessions')
      .select('lecturer_id, course_id');
    const coursesByLec = new Map();
    (sessionCounts ?? []).forEach(s => {
      if (!coursesByLec.has(s.lecturer_id)) coursesByLec.set(s.lecturer_id, new Set());
      coursesByLec.get(s.lecturer_id).add(s.course_id);
    });
    allLecturers.value = data.map(u => ({
      id: u.id,
      name: u.name || u.email || 'Lecturer',
      email: u.email,
      courseCount: coursesByLec.get(u.id)?.size ?? 0,
    }));
  } catch (e) { console.error('[Analytics] fetchAllLecturers', e); }
}

async function loadAnalytics() {
  const lecturerId = isAdmin.value ? selectedLecturerId.value : authStore.profile?.id;
  if (!lecturerId) { isLoading.value = false; return; }
  isLoading.value = true;
  selectedCourseFilter.value = 'all';
  rawSessions.value = [];
  rawAttendances.value = [];
  rawLecturerAttendances.value = [];
  try {
    const { data: sd } = await supabase.from('sessions').select('id,course_id,mode,pin,created_at,courses(code,name)').eq('lecturer_id', lecturerId).order('created_at', { ascending: false });
    const sessionIds = (sd ?? []).map(s => s.id);
    let ad = [];
    if (sessionIds.length) {
      const { data } = await supabase.from('attendances').select('id,session_id,student_id,status,users(name,id_number)').in('session_id', sessionIds);
      ad = data ?? [];
    }
    const bySession = new Map();
    ad.forEach(a => { if (!bySession.has(a.session_id)) bySession.set(a.session_id, []); bySession.get(a.session_id).push(a); });
    rawAttendances.value = ad.map(a => ({ sessionId: a.session_id, studentId: a.student_id, status: a.status, studentName: a.users?.name || 'Unknown', idNumber: a.users?.id_number || '—' }));
    rawSessions.value = (sd ?? []).map(s => {
      const atts = bySession.get(s.id) ?? [];
      const presentCount = atts.filter(a => a.status === 'present').length;
      const absentCount = atts.filter(a => a.status === 'absent').length;
      const total = atts.length;
      return { id: s.id, courseId: s.course_id, courseCode: s.courses?.code ?? '—', courseName: s.courses?.name ?? 'Unknown', mode: s.mode, pin: s.pin, createdAt: s.created_at, presentCount, absentCount, total, rate: total > 0 ? Math.round((presentCount / total) * 100) : 0 };
    });
    // Fetch class rep lecturer attendance records for this lecturer's courses
    const lecturerCourseIds = [...new Set((sd ?? []).map(s => s.course_id))];
    if (lecturerCourseIds.length) {
      const { data: laData } = await supabase
        .from('lecturer_attendances')
        .select('id, course_id, date, time, status, notes, marked_by_id, courses(code, name), users!lecturer_attendances_marked_by_id_fkey(name)')
        .in('course_id', lecturerCourseIds)
        .order('date', { ascending: false });
      if (laData) {
        rawLecturerAttendances.value = laData.map(r => ({
          id: r.id,
          courseId: r.course_id,
          courseCode: r.courses?.code ?? '—',
          courseName: r.courses?.name ?? 'Unknown',
          date: r.date,
          time: r.time ?? '—',
          status: r.status ?? 'present',
          notes: r.notes ?? '',
          markedById: r.marked_by_id,
          markedByName: r.users?.name ?? 'Class Rep',
        }));
      }
    }
    lastUpdated.value = 'Updated ' + formatTime(new Date().toISOString());
  } catch (e) { console.error('[Analytics]', e); }
  finally { isLoading.value = false; }
}

onMounted(async () => {
  if (isAdmin.value) {
    isLoading.value = false; // wait for lecturer selection
    await fetchAllLecturers();
  } else {
    await loadAnalytics();
  }
});
</script>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap');
* { font-family: 'Inter', sans-serif; box-sizing: border-box; }
.analytics-page { display: flex; flex-direction: column; gap: 1.75rem; }
/* Admin picker banner */
.admin-picker-banner { background: linear-gradient(135deg, #1e1b4b 0%, #312e81 100%); border-radius: 16px; padding: 1.1rem 1.5rem; display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: 1rem; box-shadow: 0 4px 20px rgba(99,102,241,.25); }
.picker-label { display: flex; align-items: center; gap: .6rem; color: #c7d2fe; font-size: .85rem; font-weight: 700; letter-spacing: .04em; text-transform: uppercase; }
.picker-label svg { width: 18px; height: 18px; }
.picker-controls { display: flex; align-items: center; gap: .75rem; flex-wrap: wrap; }
.lecturer-select { background: rgba(255,255,255,.1); color: #fff; border-color: rgba(255,255,255,.2); min-width: 260px; }
.lecturer-select option { background: #1e1b4b; color: #fff; }
.selected-lecturer-pill { display: flex; align-items: center; gap: .5rem; background: rgba(255,255,255,.12); padding: .35rem .8rem; border-radius: 20px; }
.lec-avatar { width: 26px; height: 26px; border-radius: 50%; background: linear-gradient(135deg,#818cf8,#6366f1); color: #fff; display: flex; align-items: center; justify-content: center; font-weight: 700; font-size: .78rem; flex-shrink: 0; }
.selected-lecturer-pill span { color: #e0e7ff; font-size: .82rem; font-weight: 600; }
/* Admin empty state */
.admin-empty-state { display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 1rem; padding: 4rem 1rem; background: #fff; border-radius: 16px; border: 1.5px dashed #c7d2fe; color: #6366f1; }
.admin-empty-state svg { width: 52px; height: 52px; opacity: .5; }
.admin-empty-state h3 { margin: 0; font-size: 1.1rem; font-weight: 700; color: #312e81; }
.admin-empty-state p { margin: 0; font-size: .9rem; color: #64748b; text-align: center; max-width: 320px; }
/* Header */
.page-header { display: flex; justify-content: space-between; align-items: flex-start; flex-wrap: wrap; gap: 1rem; }
.page-title { margin: 0; font-size: 1.8rem; font-weight: 800; color: #0f172a; letter-spacing: -0.025em; }
.page-subtitle { margin: .25rem 0 0; font-size: .95rem; color: #64748b; }
.header-actions { display: flex; align-items: center; gap: .75rem; flex-wrap: wrap; }
.filter-select { padding: .5rem 1rem; border-radius: 10px; border: 1.5px solid #e2e8f0; font-size: .875rem; font-weight: 600; color: #334155; background: #fff; cursor: pointer; outline: none; }
.filter-select:focus { border-color: #6366f1; }
.last-updated { display: flex; align-items: center; gap: .4rem; font-size: .8rem; color: #94a3b8; font-weight: 500; }
.last-updated svg { width: 14px; height: 14px; }
/* Skeleton */
.loading-grid { display: grid; grid-template-columns: repeat(4,1fr); gap: 1rem; }
.skeleton-card { height: 120px; border-radius: 16px; background: linear-gradient(90deg,#f1f5f9 25%,#e2e8f0 50%,#f1f5f9 75%); background-size: 200% 100%; animation: shimmer 1.4s infinite; }
@keyframes shimmer { 0%{background-position:200% 0} 100%{background-position:-200% 0} }
/* KPI */
.kpi-grid { display: grid; grid-template-columns: repeat(4,1fr); gap: 1rem; }
.kpi-card { background: #fff; border-radius: 16px; padding: 1.25rem 1.5rem; border: 1.5px solid #e2e8f0; display: flex; flex-direction: column; gap: .5rem; transition: transform .2s, box-shadow .2s; position: relative; overflow: hidden; }
.kpi-card::before { content: ''; position: absolute; top: 0; left: 0; right: 0; height: 3px; }
.kpi-blue::before { background: linear-gradient(90deg,#6366f1,#818cf8); }
.kpi-green::before { background: linear-gradient(90deg,#10b981,#34d399); }
.kpi-amber::before { background: linear-gradient(90deg,#f59e0b,#fbbf24); }
.kpi-purple::before { background: linear-gradient(90deg,#8b5cf6,#a78bfa); }
.kpi-card:hover { transform: translateY(-3px); box-shadow: 0 12px 24px -6px rgba(0,0,0,.08); }
.kpi-icon { width: 40px; height: 40px; border-radius: 10px; display: flex; align-items: center; justify-content: center; }
.kpi-blue .kpi-icon { background: #ede9fe; color: #6366f1; }
.kpi-green .kpi-icon { background: #d1fae5; color: #10b981; }
.kpi-amber .kpi-icon { background: #fef3c7; color: #f59e0b; }
.kpi-purple .kpi-icon { background: #ede9fe; color: #8b5cf6; }
.kpi-icon svg { width: 20px; height: 20px; }
.kpi-body { display: flex; flex-direction: column; }
.kpi-value { font-size: 2rem; font-weight: 800; color: #0f172a; line-height: 1.1; }
.kpi-label { font-size: .78rem; color: #64748b; font-weight: 600; text-transform: uppercase; letter-spacing: .05em; margin-top: .2rem; }
.kpi-trend { font-size: .75rem; font-weight: 600; padding: .2rem .6rem; border-radius: 20px; align-self: flex-start; }
.kpi-trend.up { background: #f0fdf4; color: #15803d; }
.kpi-trend.warn { background: #fffbeb; color: #b45309; }
.kpi-rate-bar { height: 5px; background: #e2e8f0; border-radius: 99px; overflow: hidden; margin-top: .25rem; }
.kpi-rate-fill { height: 100%; background: linear-gradient(90deg,#10b981,#34d399); border-radius: 99px; transition: width .8s ease; }
/* Charts */
.charts-row { display: grid; grid-template-columns: 1fr 320px; gap: 1.25rem; }
.chart-card { background: #fff; border-radius: 16px; border: 1.5px solid #e2e8f0; padding: 1.5rem; }
.chart-header h2 { margin: 0; font-size: 1rem; font-weight: 700; color: #0f172a; }
.chart-header p { margin: .2rem 0 1.25rem; font-size: .82rem; color: #94a3b8; }
.empty-chart { display: flex; align-items: center; justify-content: center; min-height: 100px; color: #94a3b8; font-size: .9rem; }
/* Bar chart */
.bar-chart { display: flex; flex-direction: column; gap: 1.1rem; }
.bar-row { display: flex; flex-direction: column; gap: .3rem; }
.bar-label { display: flex; align-items: center; gap: .5rem; }
.course-tag { background: #ede9fe; color: #4f46e5; font-size: .7rem; font-weight: 700; padding: .15rem .45rem; border-radius: 6px; white-space: nowrap; letter-spacing: .04em; }
.course-tag.sm { font-size: .65rem; }
.bar-name { font-size: .85rem; font-weight: 600; color: #334155; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.bar-track { width: 100%; height: 10px; background: #f1f5f9; border-radius: 99px; position: relative; overflow: hidden; }
.bar-fill { position: absolute; left: 0; top: 0; height: 100%; border-radius: 99px; transition: width .8s cubic-bezier(.4,0,.2,1); }
.good-bar { background: linear-gradient(90deg,#10b981,#34d399); }
.warn-bar { background: linear-gradient(90deg,#f59e0b,#fbbf24); }
.danger-bar { background: linear-gradient(90deg,#ef4444,#f87171); }
.bar-footer { display: flex; align-items: center; gap: .75rem; }
.bar-pct { font-size: .82rem; font-weight: 700; }
.bar-meta { font-size: .75rem; color: #94a3b8; }
.good { color: #15803d; } .warn { color: #b45309; } .danger { color: #dc2626; }
/* Sparkline */
.sparkline-wrap { display: flex; flex-direction: column; gap: .5rem; }
.sparkline { width: 100%; height: 110px; }
.spark-labels, .spark-axis { display: flex; justify-content: space-between; font-size: .7rem; color: #94a3b8; }
/* Sections */
.section-card { background: #fff; border-radius: 16px; border: 1.5px solid #e2e8f0; overflow: hidden; }
.section-header { display: flex; justify-content: space-between; align-items: center; padding: 1.25rem 1.5rem; border-bottom: 1px solid #f1f5f9; flex-wrap: wrap; gap: .75rem; }
.section-header h2 { margin: 0; font-size: 1rem; font-weight: 700; color: #0f172a; }
.section-header p { margin: .2rem 0 0; font-size: .82rem; color: #94a3b8; }
.badge { font-size: .78rem; font-weight: 700; padding: .3rem .8rem; border-radius: 20px; white-space: nowrap; }
.badge-red { background: #fef2f2; color: #dc2626; border: 1px solid #fca5a5; }
.badge-purple { background: #ede9fe; color: #4f46e5; }
.badge-teal { background: #f0fdfa; color: #0d9488; border: 1px solid #99f6e4; }
/* Table */
.table-wrap { overflow-x: auto; }
.data-table { width: 100%; border-collapse: collapse; font-size: .875rem; }
.data-table thead tr { background: #f8fafc; border-bottom: 1px solid #e2e8f0; }
.data-table th { padding: .75rem 1rem; text-align: left; font-size: .7rem; font-weight: 700; color: #64748b; text-transform: uppercase; letter-spacing: .06em; white-space: nowrap; }
.data-table td { padding: .85rem 1rem; border-bottom: 1px solid #f1f5f9; color: #334155; vertical-align: middle; }
.data-table tbody tr:last-child td { border-bottom: none; }
.data-table tbody tr:hover { background: #f8fafc; }
.centered { text-align: center; }
.student-cell { display: flex; align-items: center; gap: .6rem; }
.s-avatar { width: 32px; height: 32px; border-radius: 50%; background: linear-gradient(135deg,#6366f1,#4f46e5); color: #fff; display: flex; align-items: center; justify-content: center; font-weight: 700; font-size: .85rem; flex-shrink: 0; }
.s-name { font-weight: 600; color: #1e293b; font-size: .875rem; }
.s-id { font-size: .72rem; color: #94a3b8; }
.date-cell { display: flex; flex-direction: column; }
.date-main { font-weight: 600; color: #1e293b; font-size: .875rem; }
.date-time { font-size: .72rem; color: #94a3b8; }
.course-cell { display: flex; flex-direction: column; gap: .2rem; }
.course-name-sm { font-size: .75rem; color: #64748b; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; max-width: 150px; }
.mode-chip { background: #f0f9ff; color: #0369a1; font-size: .7rem; font-weight: 700; padding: .15rem .45rem; border-radius: 6px; white-space: nowrap; }
.pin-code { background: #1e293b; color: #a5f3fc; font-size: .82rem; font-family: monospace; padding: .15rem .5rem; border-radius: 6px; letter-spacing: .1em; }
.clr-green { color: #16a34a; font-weight: 700; }
.clr-red { color: #dc2626; font-weight: 700; }
.rate-wrap { display: flex; align-items: center; gap: .45rem; }
.rate-bar { width: 56px; height: 6px; background: #e2e8f0; border-radius: 99px; overflow: hidden; flex-shrink: 0; }
.rate-bar.sm { width: 44px; }
.rate-fill { height: 100%; border-radius: 99px; transition: width .6s ease; }
.rate-fill.good { background: linear-gradient(90deg,#10b981,#34d399); }
.rate-fill.warn { background: linear-gradient(90deg,#f59e0b,#fbbf24); }
.rate-fill.danger { background: linear-gradient(90deg,#ef4444,#f87171); }
.rate-num { font-size: .82rem; font-weight: 700; white-space: nowrap; }
.rate-num.good { color: #15803d; } .rate-num.warn { color: #b45309; } .rate-num.danger { color: #dc2626; }
.status-chip { font-size: .7rem; font-weight: 700; padding: .2rem .55rem; border-radius: 20px; }
.status-chip.good { background: #f0fdf4; color: #15803d; }
.status-chip.warn { background: #fffbeb; color: #b45309; }
.status-chip.danger { background: #fef2f2; color: #dc2626; }
/* Lecturer Attendance (Class Rep) */
.la-status-chip { font-size: .78rem; font-weight: 700; padding: .25rem .65rem; border-radius: 20px; white-space: nowrap; }
.la-status-chip.present { background: #f0fdf4; color: #15803d; }
.la-status-chip.late { background: #fffbeb; color: #b45309; }
.la-status-chip.absent { background: #fef2f2; color: #dc2626; }
.rep-avatar { background: linear-gradient(135deg,#0d9488,#0f766e) !important; }
.marked-by-cell { display: flex; align-items: center; gap: .6rem; }
.notes-cell { font-size: .8rem; color: #64748b; max-width: 220px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.empty-state { display: flex; flex-direction: column; align-items: center; justify-content: center; padding: 3rem 1rem; color: #94a3b8; gap: .75rem; }
.empty-state svg { width: 38px; height: 38px; }
.empty-state p { margin: 0; font-size: .9rem; }
@media (max-width: 1100px) {
  .kpi-grid { grid-template-columns: repeat(2,1fr); }
  .charts-row { grid-template-columns: 1fr; }
}
@media (max-width: 640px) {
  .kpi-grid { grid-template-columns: 1fr; }
  .page-header { flex-direction: column; }
}
</style>
