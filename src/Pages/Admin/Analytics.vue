<template>
  <div class="analytics-container">
    <!-- Header -->
    <div class="analytics-header">
      <div>
        <h1 class="page-title">Attendance Analytics</h1>
        <p class="page-subtitle">Full attendance breakdown across all courses and sessions</p>
      </div>
      <div class="header-actions">
        <select v-model="selectedCourseFilter" class="filter-select" id="course-filter">
          <option value="">All Courses</option>
          <option v-for="c in courses" :key="c.id" :value="c.id">{{ c.name }}</option>
        </select>
        <select v-model="selectedStatusFilter" class="filter-select" id="status-filter">
          <option value="">All Statuses</option>
          <option value="present">Present</option>
          <option value="absent">Absent</option>
        </select>
      </div>
    </div>

    <!-- KPI Cards -->
    <div class="kpi-grid">
      <div class="kpi-card kpi-blue">
        <div class="kpi-icon">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>
        </div>
        <div class="kpi-body">
          <p class="kpi-label">Total Students</p>
          <h2 class="kpi-value">{{ totalStudents }}</h2>
        </div>
      </div>

      <div class="kpi-card kpi-green">
        <div class="kpi-icon">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="20 6 9 17 4 12"/></svg>
        </div>
        <div class="kpi-body">
          <p class="kpi-label">Overall Attendance Rate</p>
          <h2 class="kpi-value">{{ overallRate }}%</h2>
        </div>
      </div>

      <div class="kpi-card kpi-amber">
        <div class="kpi-icon">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
        </div>
        <div class="kpi-body">
          <p class="kpi-label">Total Sessions</p>
          <h2 class="kpi-value">{{ sessions.length }}</h2>
        </div>
      </div>

      <div class="kpi-card kpi-red">
        <div class="kpi-icon">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polygon points="7.86 2 16.14 2 22 7.86 22 16.14 16.14 22 7.86 22 2 16.14 2 7.86 7.86 2"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
        </div>
        <div class="kpi-body">
          <p class="kpi-label">Total Absences</p>
          <h2 class="kpi-value">{{ totalAbsences }}</h2>
        </div>
      </div>
    </div>

    <!-- Course Breakdown Table -->
    <div class="panel">
      <div class="panel-header">
        <h2>Per-Course Attendance Breakdown</h2>
      </div>
      <div class="table-wrapper">
        <table class="data-table" id="course-breakdown-table">
          <thead>
            <tr>
              <th>Course</th>
              <th>Sessions</th>
              <th>Present</th>
              <th>Absent</th>
              <th>Attendance Rate</th>
              <th>Rate Bar</th>
            </tr>
          </thead>
          <tbody>
            <tr v-if="courseBreakdown.length === 0">
              <td colspan="6" class="empty-cell">No data available.</td>
            </tr>
            <tr v-for="row in courseBreakdown" :key="row.courseId">
              <td class="course-name-cell">{{ row.courseName }}</td>
              <td>{{ row.sessionCount }}</td>
              <td class="present-cell">{{ row.present }}</td>
              <td class="absent-cell">{{ row.absent }}</td>
              <td>
                <span class="rate-badge" :class="rateClass(row.rate)">{{ row.rate }}%</span>
              </td>
              <td class="bar-cell">
                <div class="progress-track">
                  <div class="progress-fill" :style="{ width: row.rate + '%', backgroundColor: rateColor(row.rate) }"></div>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- Per-Student Attendance Breakdown -->
    <div class="panel">
      <div class="panel-header">
        <h2>Per-Student Attendance Rate</h2>
        <div class="filter-group">
          <select v-model="studentProgramFilter" class="filter-select" id="student-program-filter">
            <option value="">All Programmes</option>
            <option v-for="p in programmes" :key="p.id" :value="p.id">{{ p.name }}</option>
          </select>
          <select v-model="studentCourseFilter" class="filter-select" id="student-course-filter">
            <option value="">All Courses</option>
            <option v-for="c in courses" :key="c.id" :value="c.id">{{ c.name }}</option>
          </select>
          <div class="search-box">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
            <input v-model="studentSearch" type="text" placeholder="Search name or ID…" id="student-search" class="search-input" />
          </div>
        </div>
      </div>
      <div class="table-wrapper">
        <table class="data-table" id="student-breakdown-table">
          <thead>
            <tr>
              <th>Student</th>
              <th>Student ID</th>
              <th>Programme</th>
              <th>Course</th>
              <th>Sessions</th>
              <th>Present</th>
              <th>Absent</th>
              <th>Rate</th>
              <th>Rate Bar</th>
            </tr>
          </thead>
          <tbody>
            <tr v-if="filteredStudentBreakdown.length === 0">
              <td colspan="9" class="empty-cell">No data matches your filters.</td>
            </tr>
            <tr v-for="row in paginatedStudentBreakdown" :key="row.key">
              <td class="student-name-cell">{{ row.studentName }}</td>
              <td class="mono">{{ row.idNumber }}</td>
              <td class="muted">{{ row.programmeName }}</td>
              <td class="course-name-cell">{{ row.courseName }}</td>
              <td>{{ row.sessionCount }}</td>
              <td class="present-cell">{{ row.present }}</td>
              <td class="absent-cell">{{ row.absent }}</td>
              <td>
                <span class="rate-badge" :class="rateClass(row.rate)">{{ row.rate }}%</span>
              </td>
              <td class="bar-cell">
                <div class="progress-track">
                  <div class="progress-fill" :style="{ width: row.rate + '%', backgroundColor: rateColor(row.rate) }"></div>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
      <div class="pagination" v-if="studentTotalPages > 1">
        <button class="page-btn" :disabled="studentPage === 1" @click="studentPage--" id="student-prev-btn">← Prev</button>
        <span class="page-info">Page {{ studentPage }} of {{ studentTotalPages }}</span>
        <button class="page-btn" :disabled="studentPage === studentTotalPages" @click="studentPage++" id="student-next-btn">Next →</button>
      </div>
    </div>

    <div class="panel">
      <div class="panel-header">
        <h2>Attendance Records</h2>
        <div class="search-box">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
          <input v-model="searchQuery" type="text" placeholder="Search by name, student ID or course…" id="attendance-search" class="search-input" />
        </div>
      </div>

      <div class="table-wrapper">
        <table class="data-table" id="attendance-records-table">
          <thead>
            <tr>
              <th>Student</th>
              <th>Student ID</th>
              <th>Course</th>
              <th>Session Date</th>
              <th>Status</th>
              <th>Recorded At</th>
            </tr>
          </thead>
          <tbody>
            <tr v-if="filteredAttendances.length === 0">
              <td colspan="6" class="empty-cell">No records match your filters.</td>
            </tr>
            <tr v-for="rec in paginatedAttendances" :key="rec.id">
              <td class="student-name-cell">{{ rec.studentName }}</td>
              <td class="mono">{{ rec.idNumber }}</td>
              <td>{{ rec.courseName }}</td>
              <td>{{ rec.sessionDate }}</td>
              <td>
                <span class="status-pill" :class="rec.status">{{ rec.status }}</span>
              </td>
              <td class="mono muted">{{ rec.recordedAt }}</td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- Pagination -->
      <div class="pagination" v-if="totalPages > 1">
        <button class="page-btn" :disabled="currentPage === 1" @click="currentPage--" id="prev-page-btn">← Prev</button>
        <span class="page-info">Page {{ currentPage }} of {{ totalPages }}</span>
        <button class="page-btn" :disabled="currentPage === totalPages" @click="currentPage++" id="next-page-btn">Next →</button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted, watch } from 'vue';
import { storeToRefs } from 'pinia';
import { useAttendancesStore } from '@/stores/attendances';
import { useSessionsStore } from '@/stores/sessions';
import { useCoursesStore } from '@/stores/courses';
import { useEnrollmentsStore } from '@/stores/enrollments';
import { useProgrammesStore } from '@/stores/programmes';
import { supabase } from '@/stores/supabase';

const attendancesStore = useAttendancesStore();
const sessionsStore = useSessionsStore();
const coursesStore = useCoursesStore();
const enrollmentsStore = useEnrollmentsStore();
const programmesStore = useProgrammesStore();

// Map: users.id → { idNumber, name }
const userMap = ref({});

async function loadUsers(ids) {
  const uniqueIds = [...new Set(ids.filter(Boolean))];
  if (uniqueIds.length === 0) return;
  const missing = uniqueIds.filter(id => !userMap.value[id]);
  if (missing.length === 0) return;
  const { data } = await supabase
    .from('users')
    .select('id, name, id_number, program_id')
    .in('id', missing);
  if (data) {
    const updated = { ...userMap.value };
    data.forEach(u => {
      updated[u.id] = { idNumber: u.id_number || '—', name: u.name || '—', programId: u.program_id ?? null };
    });
    userMap.value = updated;
  }
}

const { attendances } = storeToRefs(attendancesStore);
const { sessions } = storeToRefs(sessionsStore);
const { courses } = storeToRefs(coursesStore);
const { enrollments } = storeToRefs(enrollmentsStore);
const { programmes } = storeToRefs(programmesStore);

const selectedCourseFilter = ref('');
const selectedStatusFilter = ref('');
const searchQuery = ref('');
const currentPage = ref(1);
const pageSize = 15;

// Student breakdown filters
const studentProgramFilter = ref('');
const studentCourseFilter = ref('');
const studentSearch = ref('');
const studentPage = ref(1);
const studentPageSize = 20;

onMounted(async () => {
  await Promise.all([
    attendancesStore.fetchAttendances(),
    sessionsStore.fetchSessions(),
    coursesStore.fetchCourses(),
    enrollmentsStore.fetchEnrollments(),
    programmesStore.fetchProgrammes(),
  ]);
  // Load all enrolled student profiles (for student breakdown)
  const enrolledIds = enrollments.value.map(e => e.studentId);
  const attendanceIds = attendances.value.map(a => a.studentId);
  await loadUsers([...enrolledIds, ...attendanceIds]);
  attendancesStore.subscribeToAttendances();
  sessionsStore.subscribeToSessions();
});

// When new attendance records arrive (realtime), load any new student ids
watch(attendances, async (records) => {
  await loadUsers(records.map(a => a.studentId));
}, { deep: false });

onUnmounted(() => {
  attendancesStore.unsubscribeFromAttendances();
  sessionsStore.unsubscribeFromSessions();
});

// Reset pages when filters change
watch([selectedCourseFilter, selectedStatusFilter, searchQuery], () => {
  currentPage.value = 1;
});
watch([studentProgramFilter, studentCourseFilter, studentSearch], () => {
  studentPage.value = 1;
});
// Also load new users when enrollments are populated after mount
watch(enrollments, async (list) => {
  await loadUsers(list.map(e => e.studentId));
}, { deep: false });

// ─── KPIs ────────────────────────────────────────────────────────────────────

const totalStudents = computed(() => new Set(enrollments.value.map(e => e.studentId)).size);

const totalAbsences = computed(() => attendances.value.filter(a => a.status === 'absent').length);

const overallRate = computed(() => {
  const total = attendances.value.length;
  if (total === 0) return 0;
  const present = attendances.value.filter(a => a.status === 'present').length;
  return Math.round((present / total) * 100);
});

// ─── Course Breakdown ─────────────────────────────────────────────────────────

const courseBreakdown = computed(() => {
  return courses.value.map(course => {
    const courseSessions = sessions.value.filter(s => s.courseId === course.id);
    const sessionIds = new Set(courseSessions.map(s => s.id));
    const courseAttendances = attendances.value.filter(a => sessionIds.has(a.sessionId));
    const present = courseAttendances.filter(a => a.status === 'present').length;
    const absent  = courseAttendances.filter(a => a.status === 'absent').length;
    const total   = courseAttendances.length;
    const rate    = total > 0 ? Math.round((present / total) * 100) : 0;
    return {
      courseId: course.id,
      courseName: course.name || course.code || 'Unknown',
      sessionCount: courseSessions.length,
      present,
      absent,
      rate,
    };
  }).filter(r => selectedCourseFilter.value === '' || r.courseId === selectedCourseFilter.value);
});

// ─── Per-Student Breakdown ────────────────────────────────────────────────────

// Build a quick map: courseId -> Set of sessionIds
const courseSessionMap = computed(() => {
  const map = {};
  sessions.value.forEach(s => {
    if (!map[s.courseId]) map[s.courseId] = new Set();
    map[s.courseId].add(s.id);
  });
  return map;
});

const studentCourseBreakdown = computed(() => {
  return enrollments.value.map(enr => {
    const sessionIds = courseSessionMap.value[enr.courseId] ?? new Set();
    const stuAttendances = attendances.value.filter(
      a => a.studentId === enr.studentId && sessionIds.has(a.sessionId)
    );
    const present = stuAttendances.filter(a => a.status === 'present').length;
    const absent  = stuAttendances.filter(a => a.status === 'absent').length;
    const total   = stuAttendances.length;
    const rate    = total > 0 ? Math.round((present / total) * 100) : 0;

    const user = userMap.value[enr.studentId];
    const course = coursesStore.getCourseById(enr.courseId);
    const programme = user?.programId ? programmesStore.getProgrammeById(user.programId) : null;

    return {
      key: `${enr.studentId}::${enr.courseId}`,
      studentId: enr.studentId,
      idNumber: user?.idNumber ?? '…',
      studentName: user?.name ?? '…',
      programId: user?.programId ?? null,
      programmeName: programme?.name ?? '—',
      courseId: enr.courseId,
      courseName: course?.name || course?.code || '—',
      sessionCount: sessionIds.size,
      present,
      absent,
      rate,
    };
  });
});

const filteredStudentBreakdown = computed(() => {
  let list = studentCourseBreakdown.value;
  if (studentProgramFilter.value) list = list.filter(r => r.programId === studentProgramFilter.value);
  if (studentCourseFilter.value)  list = list.filter(r => r.courseId  === studentCourseFilter.value);
  if (studentSearch.value.trim()) {
    const q = studentSearch.value.trim().toLowerCase();
    list = list.filter(r =>
      r.studentName.toLowerCase().includes(q) ||
      r.idNumber.toLowerCase().includes(q) ||
      r.courseName.toLowerCase().includes(q)
    );
  }
  return list.sort((a, b) => a.studentName.localeCompare(b.studentName));
});

const studentTotalPages = computed(() =>
  Math.max(1, Math.ceil(filteredStudentBreakdown.value.length / studentPageSize))
);

const paginatedStudentBreakdown = computed(() => {
  const start = (studentPage.value - 1) * studentPageSize;
  return filteredStudentBreakdown.value.slice(start, start + studentPageSize);
});

// ─── Enriched Attendance Records ─────────────────────────────────────────────

const enrichedAttendances = computed(() => {
  return attendances.value.map(a => {
    const session = sessionsStore.getSessionById(a.sessionId);
    const course = session ? coursesStore.getCourseById(session.courseId) : null;
    const user = userMap.value[a.studentId];
    return {
      id: a.id,
      studentId: a.studentId,
      idNumber: user?.idNumber ?? '…',
      studentName: user?.name ?? '…',
      status: a.status,
      sessionDate: session?.date
        ? new Date(session.date).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })
        : '—',
      courseName: course?.name || course?.code || '—',
      courseId: course?.id || null,
      recordedAt: a.timestamp
        ? new Date(a.timestamp).toLocaleString('en-US', { dateStyle: 'medium', timeStyle: 'short' })
        : '—',
    };
  });
});

const filteredAttendances = computed(() => {
  let list = enrichedAttendances.value;
  if (selectedCourseFilter.value) list = list.filter(r => r.courseId === selectedCourseFilter.value);
  if (selectedStatusFilter.value) list = list.filter(r => r.status === selectedStatusFilter.value);
  if (searchQuery.value.trim()) {
    const q = searchQuery.value.trim().toLowerCase();
    list = list.filter(r =>
      (r.idNumber && r.idNumber.toLowerCase().includes(q)) ||
      (r.studentName && r.studentName.toLowerCase().includes(q)) ||
      (r.courseName && r.courseName.toLowerCase().includes(q))
    );
  }
  return list;
});

const totalPages = computed(() => Math.max(1, Math.ceil(filteredAttendances.value.length / pageSize)));

const paginatedAttendances = computed(() => {
  const start = (currentPage.value - 1) * pageSize;
  return filteredAttendances.value.slice(start, start + pageSize);
});

// ─── Helpers ──────────────────────────────────────────────────────────────────

function rateClass(rate) {
  if (rate >= 75) return 'rate-good';
  if (rate >= 50) return 'rate-warn';
  return 'rate-bad';
}

function rateColor(rate) {
  if (rate >= 75) return '#10b981';
  if (rate >= 50) return '#f59e0b';
  return '#ef4444';
}
</script>

<style scoped>
/* ── Layout ─────────────────────────────────────────── */
.analytics-container {
  display: flex;
  flex-direction: column;
  gap: 2rem;
  width: 100%;
}

/* ── Header ─────────────────────────────────────────── */
.analytics-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  flex-wrap: wrap;
  gap: 1rem;
}

.page-title {
  margin: 0;
  font-size: 1.75rem;
  font-weight: 700;
  color: #0f172a;
  letter-spacing: -0.025em;
}

.page-subtitle {
  margin: 0.25rem 0 0;
  font-size: 0.9rem;
  color: #64748b;
}

.header-actions {
  display: flex;
  gap: 0.75rem;
  flex-wrap: wrap;
}

.filter-group {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  flex-wrap: wrap;
}

.filter-select {
  padding: 0.5rem 1rem;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  font-size: 0.875rem;
  color: #334155;
  background: #ffffff;
  cursor: pointer;
  outline: none;
  transition: border-color 0.2s;
}

.filter-select:focus {
  border-color: #6366f1;
}

/* ── KPI Grid ───────────────────────────────────────── */
.kpi-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1.5rem;
}

.kpi-card {
  background: #ffffff;
  border-radius: 16px;
  padding: 1.5rem;
  display: flex;
  align-items: center;
  gap: 1rem;
  box-shadow: 0 4px 6px -1px rgba(0,0,0,0.05);
  border: 1px solid rgba(226,232,240,0.8);
  transition: transform 0.2s, box-shadow 0.2s;
}

.kpi-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 10px 20px -5px rgba(0,0,0,0.08);
}

.kpi-icon {
  width: 48px;
  height: 48px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.kpi-icon svg {
  width: 22px;
  height: 22px;
}

.kpi-blue .kpi-icon  { background: rgba(99,102,241,0.1); color: #6366f1; }
.kpi-green .kpi-icon { background: rgba(16,185,129,0.1); color: #10b981; }
.kpi-amber .kpi-icon { background: rgba(245,158,11,0.1); color: #f59e0b; }
.kpi-red .kpi-icon   { background: rgba(239,68,68,0.1);  color: #ef4444; }

.kpi-label {
  margin: 0 0 0.25rem;
  font-size: 0.8rem;
  color: #64748b;
  font-weight: 500;
}

.kpi-value {
  margin: 0;
  font-size: 1.75rem;
  font-weight: 700;
  color: #0f172a;
  letter-spacing: -0.025em;
}

/* ── Panel ──────────────────────────────────────────── */
.panel {
  background: #ffffff;
  border-radius: 16px;
  padding: 1.5rem;
  box-shadow: 0 4px 6px -1px rgba(0,0,0,0.05);
  border: 1px solid rgba(226,232,240,0.8);
}

.panel-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 1rem;
  margin-bottom: 1.25rem;
}

.panel-header h2 {
  margin: 0;
  font-size: 1.1rem;
  font-weight: 600;
  color: #0f172a;
}

/* ── Search ─────────────────────────────────────────── */
.search-box {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  background: #f8fafc;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  padding: 0.45rem 0.75rem;
}

.search-box svg {
  width: 15px;
  height: 15px;
  color: #94a3b8;
  flex-shrink: 0;
}

.search-input {
  border: none;
  background: transparent;
  outline: none;
  font-size: 0.875rem;
  color: #334155;
  min-width: 220px;
}

/* ── Table ──────────────────────────────────────────── */
.table-wrapper {
  overflow-x: auto;
}

.data-table {
  width: 100%;
  border-collapse: collapse;
  font-size: 0.875rem;
}

.data-table th {
  text-align: left;
  padding: 0.75rem 1rem;
  color: #64748b;
  font-weight: 600;
  font-size: 0.78rem;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  background: #f8fafc;
  border-bottom: 1px solid #e2e8f0;
}

.data-table th:first-child { border-radius: 8px 0 0 8px; }
.data-table th:last-child  { border-radius: 0 8px 8px 0; }

.data-table td {
  padding: 0.85rem 1rem;
  color: #334155;
  border-bottom: 1px solid #f1f5f9;
  vertical-align: middle;
}

.data-table tbody tr:last-child td { border-bottom: none; }

.data-table tbody tr:hover td {
  background: #fafbff;
}

.empty-cell {
  text-align: center;
  color: #94a3b8;
  padding: 2rem !important;
}

.course-name-cell { font-weight: 600; color: #1e293b; }
.student-name-cell { font-weight: 600; color: #1e293b; }
.present-cell { color: #10b981; font-weight: 600; }
.absent-cell  { color: #ef4444; font-weight: 600; }
.mono  { font-family: 'JetBrains Mono', 'Courier New', monospace; font-size: 0.82rem; }
.muted { color: #94a3b8; }

/* ── Rate Badge ─────────────────────────────────────── */
.rate-badge {
  display: inline-block;
  padding: 0.25rem 0.6rem;
  border-radius: 9999px;
  font-size: 0.78rem;
  font-weight: 700;
}
.rate-badge.rate-good { background: #dcfce7; color: #15803d; }
.rate-badge.rate-warn { background: #fef9c3; color: #a16207; }
.rate-badge.rate-bad  { background: #fee2e2; color: #b91c1c; }

/* ── Progress Bar ───────────────────────────────────── */
.bar-cell { min-width: 120px; }
.progress-track {
  background: #f1f5f9;
  border-radius: 9999px;
  height: 8px;
  overflow: hidden;
}
.progress-fill {
  height: 100%;
  border-radius: 9999px;
  transition: width 0.6s ease;
}

/* ── Status Pill ────────────────────────────────────── */
.status-pill {
  display: inline-block;
  padding: 0.25rem 0.6rem;
  border-radius: 9999px;
  font-size: 0.75rem;
  font-weight: 600;
  text-transform: capitalize;
}
.status-pill.present { background: #dcfce7; color: #15803d; }
.status-pill.absent  { background: #fee2e2; color: #b91c1c; }

/* ── Pagination ─────────────────────────────────────── */
.pagination {
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: 1rem;
  margin-top: 1rem;
}

.page-btn {
  padding: 0.4rem 1rem;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  background: #fff;
  color: #6366f1;
  font-weight: 600;
  font-size: 0.875rem;
  cursor: pointer;
  transition: all 0.2s;
}
.page-btn:hover:not(:disabled) { background: #6366f1; color: #fff; border-color: #6366f1; }
.page-btn:disabled { opacity: 0.35; cursor: default; }
.page-info { font-size: 0.875rem; color: #64748b; }

/* ── Responsive ─────────────────────────────────────── */
@media (max-width: 768px) {
  .analytics-header { flex-direction: column; }
  .kpi-grid { grid-template-columns: 1fr 1fr; }
  .search-input { min-width: 140px; }
}

@media (max-width: 480px) {
  .kpi-grid { grid-template-columns: 1fr; }
  .panel-header { flex-direction: column; align-items: flex-start; }
}
</style>
