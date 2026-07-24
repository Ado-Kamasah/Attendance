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
      <p>Loading attendance dataâ€¦</p>
    </div>

    <template v-else>
      <!-- Filters -->
      <div class="filters-bar">
        <div class="filter-field">
          <label>Course</label>
          <select v-model="filters.courseId">
            <option value="">All courses</option>
            <option v-for="c in courses" :key="c.id" :value="c.id">{{ c.code }} â€” {{ c.name }}</option>
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
              <p class="history-sub">{{ filteredSessions.length }} session{{ filteredSessions.length !== 1 ? 's' : '' }} Â· {{ historyRows.length }} record{{ historyRows.length !== 1 ? 's' : '' }}</p>
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
                      <span class="sg-course">{{ group.courseCode }} â€” {{ group.courseName }}</span>
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
                    <td>{{ row.courseCode }} â€” {{ row.courseName }}</td>
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
        <span class="ds-course">{{ sessionToDelete.courseCode }} â€” {{ sessionToDelete.courseName }}</span>
        <span class="ds-date">{{ sessionToDelete.dateStr }}</span>
      </div>
      <p class="ds-warn">This action cannot be undone.</p>
      <div class="ds-actions">
        <button class="btn-cancel" @click="sessionToDelete = null" :disabled="!!deletingSessionId">Cancel</button>
        <button class="btn-delete-confirm" @click="deleteSessionById" :disabled="!!deletingSessionId">
          <svg v-if="deletingSessionId" class="spin-sm" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10" stroke-dasharray="31" stroke-dashoffset="10"/></svg>
          {{ deletingSessionId ? 'Deletingâ€¦' : 'Delete Session' }}
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
    // app (AttendanceManagement.vue queries `users` directly too) â€” pull
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
// (schedules.lecturer is a free-text name in the schema shown elsewhere â€”
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

// Sessions after course/level/semester/date/pin filters â€” student filter is
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

// Individual attendance rows for the history table â€” every present record
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
        courseCode: course?.code ?? 'â€”',
        courseName: course?.name ?? 'Unknown course',
        pin: session?.pin ?? 'â€”',
        dateStr: ts ? ts.toLocaleDateString() : 'â€”',
        timeStr: ts ? ts.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'â€”',
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

// â”€â”€ Delete session â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
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

// â”€â”€ Session groups for the history table â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
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

<style scoped>
.reports-container {
  display: flex;
  flex-direction: column;
  gap: 2rem;
  width: 100%;
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.page-title {
  margin: 0;
  font-size: 1.75rem;
  font-weight: 700;
  color: #0f172a;
  letter-spacing: -0.025em;
}

.page-subtitle {
  margin: 0.25rem 0 0 0;
  font-size: 0.95rem;
  color: #64748b;
}

.export-btn {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  background-color: #ffffff;
  color: #334155;
  border: 1px solid #cbd5e1;
  padding: 0.75rem 1.25rem;
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
  box-shadow: 0 1px 2px rgba(0,0,0,0.05);
}

.export-btn:hover {
  background-color: #f8fafc;
  color: #0f172a;
  border-color: #94a3b8;
}

.export-btn svg {
  width: 18px;
  height: 18px;
}

/* Page loading */
.page-loading { padding: 4rem 0; }

/* Filters */
.filters-bar {
  display: flex;
  flex-wrap: wrap;
  align-items: flex-end;
  gap: 1rem;
  background: #ffffff;
  border: 1px solid #e2e8f0;
  border-radius: 12px;
  padding: 1.25rem;
}
.filter-field { display: flex; flex-direction: column; gap: 0.35rem; min-width: 150px; }
.filter-field label { font-size: 0.72rem; font-weight: 700; color: #64748b; text-transform: uppercase; letter-spacing: 0.04em; }
.filter-field select,
.filter-field input {
  padding: 0.55rem 0.7rem;
  border-radius: 8px;
  border: 1.5px solid #cbd5e1;
  font-size: 0.85rem;
  color: #0f172a;
  background: #fff;
}
.filter-field select:focus,
.filter-field input:focus { outline: none; border-color: #6366f1; }
.clear-filters-btn {
  padding: 0.55rem 1rem;
  border-radius: 8px;
  border: 1px solid #cbd5e1;
  background: transparent;
  color: #475569;
  font-weight: 600;
  font-size: 0.85rem;
  cursor: pointer;
  transition: all 0.2s;
}
.clear-filters-btn:hover:not(:disabled) { background: #f1f5f9; color: #0f172a; }
.clear-filters-btn:disabled { opacity: 0.4; cursor: not-allowed; }

/* Empty State */
.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 6rem 1rem;
  background-color: #ffffff;
  border-radius: 16px;
  border: 1px dashed #cbd5e1;
  text-align: center;
}

.icon-wrap {
  width: 80px;
  height: 80px;
  background-color: #f8fafc;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 1.5rem;
  color: #94a3b8;
}

.icon-wrap svg {
  width: 40px;
  height: 40px;
}

.empty-state h2 {
  margin: 0 0 0.5rem 0;
  color: #0f172a;
}

.empty-state p {
  color: #64748b;
  margin: 0;
  max-width: 400px;
}

/* Reports Content */
.reports-content {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(400px, 1fr));
  gap: 1.5rem;
}

.course-report-card {
  background-color: #ffffff;
  border-radius: 16px;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05), 0 2px 4px -1px rgba(0, 0, 0, 0.03);
  border: 1px solid #e2e8f0;
  overflow: hidden;
  display: flex;
  flex-direction: column;
}

.card-header {
  padding: 1.5rem;
  border-bottom: 1px solid #f1f5f9;
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  background-color: #f8fafc;
}

.course-info h3 {
  margin: 0.75rem 0 0 0;
  font-size: 1.25rem;
  font-weight: 700;
  color: #0f172a;
}

.course-code {
  background-color: #e0e7ff;
  color: #4338ca;
  font-size: 0.75rem;
  font-weight: 700;
  padding: 4px 8px;
  border-radius: 6px;
  margin-right: 0.5rem;
}

.semester-tag {
  background-color: #f1f5f9;
  color: #475569;
  font-size: 0.7rem;
  font-weight: 600;
  padding: 4px 8px;
  border-radius: 6px;
}
.level-tag { margin-left: 0.4rem; }

.attendance-stat {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
}

.stat-value {
  font-size: 1.75rem;
  font-weight: 800;
  color: #10b981;
  line-height: 1;
}

.stat-label {
  font-size: 0.75rem;
  font-weight: 600;
  color: #64748b;
  text-transform: uppercase;
  margin-top: 4px;
}

.card-body {
  padding: 1.5rem;
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
  flex: 1;
}

.stats-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1.25rem;
}

.stat-item {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.stat-item .label {
  font-size: 0.85rem;
  color: #64748b;
  font-weight: 500;
}

.stat-item .value {
  font-size: 1.15rem;
  font-weight: 700;
  color: #1e293b;
}

.text-emerald { color: #10b981 !important; }
.text-rose { color: #e11d48 !important; }

.view-details-btn {
  margin-top: auto;
  width: 100%;
  padding: 0.85rem;
  background-color: transparent;
  color: #6366f1;
  border: 1px solid #6366f1;
  border-radius: 8px;
  font-weight: 600;
  font-size: 0.95rem;
  cursor: pointer;
  transition: all 0.2s;
}

.view-details-btn:hover {
  background-color: #e0e7ff;
}

/* History section */
.history-card {
  background: #ffffff;
  border: 1px solid #e2e8f0;
  border-radius: 16px;
  overflow: hidden;
}
.history-header {
  padding: 1.25rem 1.5rem;
  border-bottom: 1px solid #f1f5f9;
  display: flex;
  align-items: center;
  justify-content: space-between;
  background: #f8fafc;
}
.history-header h2 { margin: 0; font-size: 1.1rem; font-weight: 700; color: #0f172a; }
.count-pill { font-size: 0.78rem; font-weight: 700; color: #4338ca; background: #e0e7ff; padding: 0.25rem 0.7rem; border-radius: 9999px; }
.pin-chip { font-family: 'Courier New', monospace; font-weight: 700; letter-spacing: 0.08em; background: #f1f5f9; color: #334155; padding: 0.2rem 0.5rem; border-radius: 6px; font-size: 0.8rem; }

/* Modal Styles */
.modal-backdrop {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(15, 23, 42, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  backdrop-filter: blur(4px);
  padding: 1rem;
}

.modal-card {
  background-color: #ffffff;
  border-radius: 16px;
  width: 100%;
  max-width: 700px;
  max-height: 90vh;
  display: flex;
  flex-direction: column;
  box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
  animation: modalIn 0.3s ease;
}

@keyframes modalIn {
  from { opacity: 0; transform: translateY(20px); }
  to { opacity: 1; transform: translateY(0); }
}

.modal-header {
  padding: 1.5rem;
  border-bottom: 1px solid #f1f5f9;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.modal-header h2 {
  margin: 0;
  font-size: 1.25rem;
  color: #0f172a;
}

.modal-header p {
  margin: 0.25rem 0 0 0;
  font-size: 0.9rem;
  color: #64748b;
}

.close-btn {
  background: #f1f5f9;
  border: none;
  width: 32px;
  height: 32px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #64748b;
  cursor: pointer;
  transition: all 0.2s;
}

.close-btn:hover {
  background: #e2e8f0;
  color: #0f172a;
}

.close-btn svg {
  width: 18px;
  height: 18px;
}

.modal-body {
  padding: 1.5rem;
  overflow-y: auto;
}

.loading-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 3rem 0;
  color: #64748b;
}

.spinner {
  width: 32px;
  height: 32px;
  border: 3px solid #e2e8f0;
  border-top-color: #6366f1;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin-bottom: 1rem;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

.empty-students {
  text-align: center;
  padding: 3rem 0;
  color: #64748b;
  font-style: italic;
}

.students-table-wrapper {
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  overflow: hidden;
}

.students-table {
  width: 100%;
  border-collapse: collapse;
}

.students-table th {
  background-color: #f8fafc;
  padding: 0.75rem 1rem;
  text-align: left;
  font-size: 0.8rem;
  font-weight: 600;
  color: #64748b;
  text-transform: uppercase;
  border-bottom: 1px solid #e2e8f0;
}

.students-table td {
  padding: 1rem;
  border-bottom: 1px solid #f1f5f9;
  font-size: 0.9rem;
  color: #1e293b;
}

.students-table tr:last-child td {
  border-bottom: none;
}

.student-cell {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.student-avatar {
  width: 32px;
  height: 32px;
  background-color: #e0e7ff;
  color: #4338ca;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 700;
  font-size: 0.9rem;
}

.student-name {
  font-weight: 600;
}

.attendance-badge {
  padding: 0.25rem 0.5rem;
  border-radius: 999px;
  font-size: 0.75rem;
  font-weight: 700;
}

.attendance-badge.excellent { background-color: #dcfce7; color: #166534; }
.attendance-badge.good { background-color: #fef9c3; color: #854d0e; }
.attendance-badge.poor { background-color: #fee2e2; color: #991b1b; }

@media (max-width: 768px) {
  .reports-content {
    grid-template-columns: 1fr;
  }

  .page-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 1rem;
  }

  .filters-bar { flex-direction: column; align-items: stretch; }
  .filter-field { min-width: 0; }
}

/* History subtitle */
.history-sub { margin: 2px 0 0; font-size: .8rem; color: #94a3b8; }

/* Session group header band */
.session-group-row > td { background: #f8fafc; border-top: 2px solid #e2e8f0; border-bottom: 1px solid #e2e8f0; padding: .6rem 1rem !important; }
.session-group-cell { display: flex; align-items: center; gap: .75rem; flex-wrap: wrap; }
.sg-pin { background: #e0e7ff; color: #4338ca; font-size: .72rem; font-weight: 800; padding: .2rem .55rem; border-radius: 6px; letter-spacing: .06em; }
.sg-course { font-weight: 600; color: #1e293b; font-size: .88rem; }
.sg-date { color: #64748b; font-size: .8rem; }
.sg-count { margin-left: auto; color: #94a3b8; font-size: .75rem; font-weight: 600; }

.attendance-row > td:first-child { padding-left: 1.5rem; }

.session-delete-cell { text-align: right; padding: .4rem .8rem !important; }
.session-delete-btn { width: 30px; height: 30px; padding: 0; display: inline-flex; align-items: center; justify-content: center; border: 1.5px solid #fecaca; border-radius: 7px; background: #fff5f5; color: #ef4444; cursor: pointer; transition: all .18s; }
.session-delete-btn:hover:not(:disabled) { background: #ef4444; color: #fff; border-color: #ef4444; }
.session-delete-btn:disabled { opacity: .5; cursor: not-allowed; }
.session-delete-btn svg { width: 14px; height: 14px; }
.spin-sm { animation: spinSm .7s linear infinite; }
@keyframes spinSm { to { transform: rotate(360deg); } }

.delete-session-modal { max-width: 400px; text-align: center; padding: 2rem; }
.ds-icon { width: 52px; height: 52px; border-radius: 50%; background: #fee2e2; color: #ef4444; display: flex; align-items: center; justify-content: center; margin: 0 auto 1rem; }
.ds-icon svg { width: 24px; height: 24px; }
.delete-session-modal h2 { margin: 0 0 .5rem; font-size: 1.1rem; color: #0f172a; }
.delete-session-modal > p { margin: 0 0 1rem; font-size: .88rem; color: #64748b; }
.ds-info { display: flex; flex-direction: column; gap: .3rem; align-items: flex-start; background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 10px; padding: .85rem 1rem; margin: 0 0 .8rem; }
.ds-course { font-weight: 600; color: #1e293b; font-size: .92rem; }
.ds-date { font-size: .78rem; color: #64748b; }
.ds-warn { font-size: .78rem; color: #f59e0b !important; margin-bottom: 1.25rem !important; }
.ds-actions { display: flex; gap: .75rem; justify-content: center; }
.btn-cancel { padding: .6rem 1.2rem; border-radius: 8px; border: 1px solid #cbd5e1; background: #fff; color: #475569; font-weight: 600; cursor: pointer; }
.btn-cancel:hover:not(:disabled) { background: #f1f5f9; }
.btn-cancel:disabled, .btn-delete-confirm:disabled { opacity: .6; cursor: not-allowed; }
.btn-delete-confirm { padding: .6rem 1.4rem; border-radius: 8px; border: none; background: #ef4444; color: #fff; font-weight: 700; cursor: pointer; display: inline-flex; align-items: center; gap: .5rem; }
.btn-delete-confirm:hover:not(:disabled) { background: #dc2626; }
</style>
