<template>
  <div class="reports-container">
    <div class="page-header">
      <div>
        <h1 class="page-title">Detailed Course Reports</h1>
        <p class="page-subtitle">View attendance analytics and student performance across your courses.</p>
      </div>
      <button class="export-btn" @click="exportReport">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
          <polyline points="7 10 12 15 17 10"></polyline>
          <line x1="12" y1="15" x2="12" y2="3"></line>
        </svg>
        Export PDF
      </button>
    </div>

    <!-- Loading -->
    <div v-if="isLoading" class="loading-state page-loading">
      <div class="spinner"></div>
      <p>Loading attendance data…</p>
    </div>

    <template v-else>
      <!-- Filters -->
      <div class="filters-bar">
        <div class="filter-field">
          <label>Course</label>
          <select v-model="filters.courseId">
            <option value="">All courses</option>
            <option v-for="c in courses" :key="c.id" :value="c.id">{{ c.code }} - {{ c.name }}</option>
          </select>
        </div>

        <div class="filter-field">
          <label>Level</label>
          <select v-model="filters.level">
            <option value="">All levels</option>
            <option v-for="lvl in levelOptions" :key="lvl" :value="lvl">{{ lvl }}</option>
          </select>
        </div>

        <div class="filter-field">
          <label>Semester</label>
          <select v-model="filters.semester">
            <option value="">All semesters</option>
            <option v-for="sem in semesterOptions" :key="sem" :value="sem">{{ sem }}</option>
          </select>
        </div>

        <div class="filter-field">
          <label>Student</label>
          <select v-model="filters.studentId">
            <option value="">All students</option>
            <option v-for="s in studentOptions" :key="s.id" :value="s.id">{{ s.name }} ({{ s.studentId }})</option>
          </select>
        </div>

        <div class="filter-field">
          <label>From</label>
          <input type="date" v-model="filters.dateFrom" />
        </div>

        <div class="filter-field">
          <label>To</label>
          <input type="date" v-model="filters.dateTo" />
        </div>

        <div class="filter-field">
          <label>Session Code / PIN</label>
          <input type="text" v-model="filters.pinSearch" placeholder="e.g. 4821" maxlength="8" />
        </div>

        <button class="clear-filters-btn" @click="clearFilters" :disabled="!hasActiveFilters">
          Clear Filters
        </button>
      </div>

      <!-- Empty State -->
      <div v-if="reportData.length === 0" class="empty-state">
        <div class="icon-wrap">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
            <polyline points="14 2 14 8 20 8"></polyline>
            <line x1="16" y1="13" x2="8" y2="13"></line>
            <line x1="16" y1="17" x2="8" y2="17"></line>
            <polyline points="10 9 9 9 8 9"></polyline>
          </svg>
        </div>
        <h2>No Reports Available</h2>
        <p>No attendance data matches the current filters. Try widening your date range or clearing filters.</p>
      </div>

      <!-- Reports Content -->
      <template v-else>
        <div class="reports-content">
          <div class="course-report-card" v-for="report in reportData" :key="report.courseId">
            <div class="card-header">
              <div class="course-info">
                <span class="course-code">{{ report.code }}</span>
                <span class="semester-tag">{{ report.semester }}</span>
                <span class="semester-tag level-tag">{{ report.level }}</span>
                <h3>{{ report.name }}</h3>
              </div>
              <div class="attendance-stat">
                <span class="stat-value">{{ report.avgAttendance }}%</span>
                <span class="stat-label">Avg. Attendance</span>
              </div>
            </div>

            <div class="card-body">
              <div class="stats-grid">
                <div class="stat-item">
                  <span class="label">Total Students</span>
                  <span class="value">{{ report.totalStudents }}</span>
                </div>
                <div class="stat-item">
                  <span class="label">Sessions Held</span>
                  <span class="value">{{ report.sessionsHeld }}</span>
                </div>
                <div class="stat-item">
                  <span class="label">Perfect Attendance</span>
                  <span class="value text-emerald">{{ report.perfectAttendance }}</span>
                </div>
                <div class="stat-item">
                  <span class="label">At Risk (&lt; 50%)</span>
                  <span class="value text-rose">{{ report.atRisk }}</span>
                </div>
              </div>

              <button class="view-details-btn" @click="openStudentList(report)">View Full Student List</button>
            </div>
          </div>
        </div>

        <!-- History grouped by session -->
        <div class="history-card">
          <div class="history-header">
            <div>
              <h2>Attendance History</h2>
              <p class="history-sub">{{ filteredSessions.length }} session{{ filteredSessions.length !== 1 ? 's' : '' }} · {{ historyRows.length }} record{{ historyRows.length !== 1 ? 's' : '' }}</p>
            </div>
            <span class="count-pill">{{ historyRows.length }} record{{ historyRows.length === 1 ? '' : 's' }}</span>
          </div>

          <div v-if="sessionGroups.length === 0" class="empty-students">
            <p>No attendance records match the current filters.</p>
          </div>
          <div v-else class="students-table-wrapper">
            <table class="students-table">
              <thead>
                <tr>
                  <th>Student</th>
                  <th>Course</th>
                  <th>Session PIN</th>
                  <th>Date</th>
                  <th>Time</th>
                  <th>Status</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                <template v-for="group in sessionGroups" :key="group.sessionId">
                  <!-- Session group header row -->
                  <tr class="session-group-row">
                    <td colspan="6" class="session-group-cell">
                      <span class="sg-pin">PIN {{ group.pin }}</span>
                      <span class="sg-course">{{ group.courseCode }} ~ {{ group.courseName }}</span>
                      <span class="sg-date">{{ group.dateStr }}</span>
                      <span class="sg-count">{{ group.rows.length }} student{{ group.rows.length !== 1 ? 's' : '' }}</span>
                    </td>
                    <td class="session-delete-cell">
                      <button
                        class="session-delete-btn"
                        @click="confirmDeleteSession(group)"
                        :disabled="deletingSessionId === group.sessionId"
                        title="Delete this session"
                      >
                        <svg v-if="deletingSessionId === group.sessionId" class="spin-sm" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10" stroke-dasharray="31" stroke-dashoffset="10"/></svg>
                        <svg v-else viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                          <polyline points="3 6 5 6 21 6"/>
                          <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/>
                          <path d="M10 11v6M14 11v6"/>
                          <path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/>
                        </svg>
                      </button>
                    </td>
                  </tr>
                  <!-- Attendance rows for this session -->
                  <tr v-for="row in group.rows" :key="row.id" class="attendance-row">
                    <td>
                      <div class="student-cell">
                        <div class="student-avatar">{{ row.studentName.charAt(0) }}</div>
                        <span class="student-name">{{ row.studentName }}</span>
                      </div>
                    </td>
                    <td>{{ row.courseCode }} ~ {{ row.courseName }}</td>
                    <td><span class="pin-chip">{{ row.pin }}</span></td>
                    <td>{{ row.dateStr }}</td>
                    <td>{{ row.timeStr }}</td>
                    <td>
                      <span class="attendance-badge" :class="row.status === 'present' ? 'excellent' : 'poor'">
                        {{ row.status === 'present' ? 'Present' : 'Absent' }}
                      </span>
                    </td>
                    <td></td>
                  </tr>
                </template>
              </tbody>
            </table>
          </div>
        </div>
      </template>
    </template>

    <!-- Student List Modal -->
    <div class="modal-backdrop" v-if="isModalOpen" @click.self="closeModal">
      <div class="modal-card">
        <div class="modal-header">
          <div>
            <h2>{{ selectedReport?.name }}</h2>
            <p>Student Enrollment List</p>
          </div>
          <button class="close-btn" @click="closeModal">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
          </button>
        </div>
        <div class="modal-body">
          <div v-if="studentsList.length === 0" class="empty-students">
            <p>No students are currently enrolled in this course.</p>
          </div>
          <div v-else class="students-table-wrapper">
            <table class="students-table">
              <thead>
                <tr>
                  <th>Student Name</th>
                  <th>Student ID</th>
                  <th>Program</th>
                  <th>Attendance Rate</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="student in studentsList" :key="student.id">
                  <td>
                    <div class="student-cell">
                      <div class="student-avatar">{{ student.name.charAt(0) }}</div>
                      <span class="student-name">{{ student.name }}</span>
                    </div>
                  </td>
                  <td>{{ student.studentId }}</td>
                  <td>{{ student.program || 'N/A' }}</td>
                  <td>
                    <span class="attendance-badge" :class="getAttendanceClass(student.attendanceRate)">
                      {{ student.attendanceRate }}%
                    </span>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  </div>

  <!-- Delete session confirm modal -->
  <div class="modal-backdrop" v-if="sessionToDelete" @click.self="sessionToDelete = null">
    <div class="modal-card delete-session-modal">
      <div class="ds-icon">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <polyline points="3 6 5 6 21 6"/>
          <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/>
          <path d="M10 11v6M14 11v6"/>
          <path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/>
        </svg>
      </div>
      <h2>Delete Session?</h2>
      <p>This will permanently delete the session and all <strong>{{ sessionToDelete.rows.length }}</strong> attendance record{{ sessionToDelete.rows.length !== 1 ? 's' : '' }} for:</p>
      <div class="ds-info">
        <span class="pin-chip">PIN {{ sessionToDelete.pin }}</span>
        <span class="ds-course">{{ sessionToDelete.courseCode }} — {{ sessionToDelete.courseName }}</span>
        <span class="ds-date">{{ sessionToDelete.dateStr }}</span>
      </div>
      <p class="ds-warn">This action cannot be undone.</p>
      <div class="ds-actions">
        <button class="btn-cancel" @click="sessionToDelete = null" :disabled="!!deletingSessionId">Cancel</button>
        <button class="btn-delete-confirm" @click="deleteSessionById" :disabled="!!deletingSessionId">
          <svg v-if="deletingSessionId" class="spin-sm" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10" stroke-dasharray="31" stroke-dashoffset="10"/></svg>
          {{ deletingSessionId ? 'Deleting…' : 'Delete Session' }}
        </button>
      </div>
    </div>
  </div>
</template>
<script setup>
import { ref, computed, onMounted } from 'vue';
import { storeToRefs } from 'pinia';
import { useAuthStore } from '@/stores/authstore';
import { useCoursesStore } from '@/stores/courses';
import { useSchedulesStore } from '@/stores/schedules';
import { useEnrollmentsStore } from '@/stores/enrollments';
import { useSessionsStore } from '@/stores/sessions';
import { useAttendancesStore } from '@/stores/attendances';
import { supabase } from '@/stores/supabase';

const authStore = useAuthStore();
const coursesStore = useCoursesStore();
const schedulesStore = useSchedulesStore();
const enrollmentsStore = useEnrollmentsStore();
const sessionsStore = useSessionsStore();
const attendancesStore = useAttendancesStore();

const { profile } = storeToRefs(authStore);
const { courses } = storeToRefs(coursesStore);
const { enrollments } = storeToRefs(enrollmentsStore);
const { sessions } = storeToRefs(sessionsStore);
const { attendances } = storeToRefs(attendancesStore);

const isLoading = ref(true);
const studentsById = ref({}); // id -> { id, name, studentId, program }

const isModalOpen = ref(false);
const selectedReport = ref(null);
const studentsList = ref([]);

const filters = ref({
  courseId: '',
  level: '',
  semester: '',
  studentId: '',
  dateFrom: '',
  dateTo: '',
  pinSearch: '',
});

const hasActiveFilters = computed(() =>
  Object.values(filters.value).some((v) => v !== '')
);

const clearFilters = () => {
  filters.value = { courseId: '', level: '', semester: '', studentId: '', dateFrom: '', dateTo: '', pinSearch: '' };
};

onMounted(async () => {
  isLoading.value = true;
  try {
    await Promise.all([
      coursesStore.fetchCourses(),
      schedulesStore.fetchSchedules(),
      enrollmentsStore.fetchEnrollments(),
      sessionsStore.fetchSessions({ lecturerId: profile.value?.id }),
      attendancesStore.fetchAttendances(),
    ]);

    // Students aren't covered by a dedicated Pinia store elsewhere in the
    // app (AttendanceManagement.vue queries `users` directly too) — pull
    // everyone enrolled in this lecturer's courses in one batch.
    const lecturerCourseIds = new Set(
      sessions.value.filter((s) => s.lecturerId === profile.value?.id).map((s) => s.courseId)
    );
    // Fall back to ALL of the lecturer's courses (not just ones with a
    // session yet) so the student filter isn't empty for a lecturer who
    // hasn't run a session at all.
    coursesForLecturer.value.forEach((c) => lecturerCourseIds.add(c.id));

    const studentIds = [
      ...new Set(
        enrollments.value
          .filter((e) => lecturerCourseIds.has(e.courseId))
          .map((e) => e.studentId)
      ),
    ];

    if (studentIds.length > 0) {
      const { data, error } = await supabase
        .from('users')
        .select('id, name, id_number, program')
        .in('id', studentIds)
        .order('name');

      if (error) throw error;

      studentsById.value = Object.fromEntries(
        (data ?? []).map((u) => [u.id, { id: u.id, name: u.name, studentId: u.id_number, program: u.program }])
      );
    }
  } catch (e) {
    console.error('Error loading report data:', e);
  } finally {
    isLoading.value = false;
  }
});

// Courses this lecturer actually teaches, inferred from schedules
// (schedules.lecturer is a free-text name in the schema shown elsewhere —
// fall back to "all courses" if that linkage can't be made reliably).
const coursesForLecturer = computed(() => {
  const lecturerName = profile.value?.name;
  if (!lecturerName) return courses.value;
  const scheduledCourseIds = new Set(
    schedulesStore.schedules
      .filter((s) => s.lecturer === lecturerName)
      .map((s) => s.courseId)
  );
  const bySchedule = courses.value.filter((c) => scheduledCourseIds.has(c.id));
  return bySchedule.length > 0 ? bySchedule : courses.value;
});

const levelOptions = computed(() =>
  [...new Set(coursesForLecturer.value.map((c) => c.level).filter(Boolean))].sort()
);
const semesterOptions = computed(() =>
  [...new Set(coursesForLecturer.value.map((c) => c.semester).filter(Boolean))].sort()
);
const studentOptions = computed(() =>
  Object.values(studentsById.value).sort((a, b) => a.name.localeCompare(b.name))
);

const inDateRange = (dateStr, from, to) => {
  if (!dateStr) return false;
  const d = new Date(dateStr);
  if (from && d < new Date(from)) return false;
  if (to) {
    const toEnd = new Date(to);
    toEnd.setHours(23, 59, 59, 999);
    if (d > toEnd) return false;
  }
  return true;
};

// Sessions after course/level/semester/date/pin filters — student filter is
// applied later, at the attendance-row level, since "student" narrows
// PEOPLE within a session rather than which sessions existed.
const filteredSessions = computed(() => {
  const f = filters.value;
  return sessions.value.filter((s) => {
    if (s.lecturerId !== profile.value?.id) return false;
    const course = coursesStore.getCourseById(s.courseId);
    if (!course) return false;

    if (f.courseId && s.courseId !== f.courseId) return false;
    if (f.level && course.level !== f.level) return false;
    if (f.semester && course.semester !== f.semester) return false;
    if ((f.dateFrom || f.dateTo) && !inDateRange(s.date, f.dateFrom, f.dateTo)) return false;
    if (f.pinSearch && !s.pin?.toLowerCase().includes(f.pinSearch.toLowerCase())) return false;

    return true;
  });
});

const filteredSessionIds = computed(() => new Set(filteredSessions.value.map((s) => s.id)));

// Individual attendance rows for the history table — every present record
// whose session survived the filters above, further narrowed by student.
const historyRows = computed(() => {
  const f = filters.value;
  return attendances.value
    .filter((a) => filteredSessionIds.value.has(a.sessionId))
    .filter((a) => !f.studentId || a.studentId === f.studentId)
    .map((a) => {
      const session = sessionsStore.getSessionById(a.sessionId);
      const course = session ? coursesStore.getCourseById(session.courseId) : null;
      const student = studentsById.value[a.studentId];
      const ts = a.timestamp ? new Date(a.timestamp) : null;

      return {
        id: a.id,
        sessionId: a.sessionId,
        studentName: student?.name ?? 'Unknown student',
        courseCode: course?.code ?? '—',
        courseName: course?.name ?? 'Unknown course',
        pin: session?.pin ?? '—',
        dateStr: ts ? ts.toLocaleDateString() : '—',
        timeStr: ts ? ts.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '—',
        status: a.status,
        rawTimestamp: a.timestamp,
      };
    })
    .sort((x, y) => new Date(y.rawTimestamp) - new Date(x.rawTimestamp));
});

// Per-course aggregate cards, built from the same filtered session set.
const reportData = computed(() => {
  const f = filters.value;
  const byCourse = new Map();

  for (const session of filteredSessions.value) {
    const course = coursesStore.getCourseById(session.courseId);
    if (!course) continue;
    if (!byCourse.has(course.id)) {
      byCourse.set(course.id, { course, sessions: [] });
    }
    byCourse.get(course.id).sessions.push(session);
  }

  const rows = [];
  for (const [courseId, { course, sessions: courseSessions }] of byCourse) {
    const sessionIds = new Set(courseSessions.map((s) => s.id));

    let enrolledStudentIds = enrollments.value
      .filter((e) => e.courseId === courseId)
      .map((e) => e.studentId);

    if (f.studentId) {
      enrolledStudentIds = enrolledStudentIds.filter((id) => id === f.studentId);
    }
    if (enrolledStudentIds.length === 0) continue;

    const totalStudents = enrolledStudentIds.length;
    const sessionsHeld = courseSessions.length;

    // present count per student, within this course's filtered sessions
    const presentCountByStudent = new Map(enrolledStudentIds.map((id) => [id, 0]));
    for (const a of attendances.value) {
      if (a.status !== 'present') continue;
      if (!sessionIds.has(a.sessionId)) continue;
      if (!presentCountByStudent.has(a.studentId)) continue;
      presentCountByStudent.set(a.studentId, presentCountByStudent.get(a.studentId) + 1);
    }

    let perfectAttendance = 0;
    let atRisk = 0;
    let totalRatioSum = 0;

    for (const studentId of enrolledStudentIds) {
      const present = presentCountByStudent.get(studentId) ?? 0;
      const rate = sessionsHeld > 0 ? present / sessionsHeld : 0;
      totalRatioSum += rate;
      if (sessionsHeld > 0 && present === sessionsHeld) perfectAttendance += 1;
      if (rate < 0.5) atRisk += 1;
    }

    const avgAttendance = totalStudents > 0 ? Math.round((totalRatioSum / totalStudents) * 100) : 0;

    rows.push({
      courseId,
      code: course.code,
      name: course.name,
      level: course.level,
      semester: course.semester,
      totalStudents,
      sessionsHeld,
      perfectAttendance,
      atRisk,
      avgAttendance,
      sessionIds,
    });
  }

  return rows.sort((a, b) => a.code.localeCompare(b.code));
});

const openStudentList = (report) => {
  selectedReport.value = report;
  isModalOpen.value = true;

  const f = filters.value;
  let enrolledStudentIds = enrollments.value
    .filter((e) => e.courseId === report.courseId)
    .map((e) => e.studentId);

  if (f.studentId) {
    enrolledStudentIds = enrolledStudentIds.filter((id) => id === f.studentId);
  }

  studentsList.value = enrolledStudentIds
    .map((studentId) => {
      const student = studentsById.value[studentId];
      if (!student) return null;

      let presentCount = 0;
      for (const a of attendances.value) {
        if (a.status === 'present' && a.studentId === studentId && report.sessionIds.has(a.sessionId)) {
          presentCount += 1;
        }
      }
      const attendanceRate = report.sessionsHeld > 0
        ? Math.round((presentCount / report.sessionsHeld) * 100)
        : 0;

      return { ...student, attendanceRate };
    })
    .filter(Boolean)
    .sort((a, b) => a.name.localeCompare(b.name));
};

const closeModal = () => {
  isModalOpen.value = false;
  selectedReport.value = null;
  studentsList.value = [];
};

const getAttendanceClass = (rate) => {
  if (rate >= 85) return 'excellent';
  if (rate >= 70) return 'good';
  return 'poor';
};

const exportReport = () => {
  alert('Report export feature will be implemented soon.');
};

// ── Delete session ───────────────────────────────────────────────────────
const sessionToDelete  = ref(null);   // the group object from sessionGroups
const deletingSessionId = ref(null);  // session id being deleted

const confirmDeleteSession = (group) => {
  sessionToDelete.value = group;
};

const deleteSessionById = async () => {
  if (!sessionToDelete.value) return;
  const sid = sessionToDelete.value.sessionId;
  deletingSessionId.value = sid;
  try {
    // Delete all attendance records for this session first, then the session
    const { error: aErr } = await supabase.from('attendances').delete().eq('session_id', sid);
    if (aErr) throw aErr;
    await sessionsStore.deleteSession(sid);
    // Reactively remove from local attendances store state
    attendancesStore.removeBySessionId?.(sid);
    sessionToDelete.value = null;
  } catch (e) {
    console.error('Failed to delete session:', e);
  } finally {
    deletingSessionId.value = null;
  }
};

// ── Session groups for the history table ────────────────────────────────
const sessionGroups = computed(() => {
  const bySession = new Map();
  for (const row of historyRows.value) {
    const session = sessionsStore.getSessionById(row.sessionId ?? row.id);
    const sid = row.sessionId ?? session?.id;
    if (!sid) continue;
    if (!bySession.has(sid)) {
      bySession.set(sid, {
        sessionId: sid,
        pin: row.pin,
        courseCode: row.courseCode,
        courseName: row.courseName,
        dateStr: row.dateStr,
        rows: [],
      });
    }
    bySession.get(sid).rows.push(row);
  }
  return [...bySession.values()].sort((a, b) => b.rows[0]?.rawTimestamp?.localeCompare(a.rows[0]?.rawTimestamp ?? '') ?? 0);
});
</script>