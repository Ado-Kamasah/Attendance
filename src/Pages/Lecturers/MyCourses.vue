<template>
  <div class="lecturer-courses-container">
    <div class="page-header">
      <div>
        <h1 class="page-title">Assigned Courses</h1>
        <p class="page-subtitle">Manage the classes you are currently instructing.</p>
      </div>
      <div class="header-controls">
        <div class="semester-badge">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
            <line x1="16" y1="2" x2="16" y2="6"></line>
            <line x1="8" y1="2" x2="8" y2="6"></line>
            <line x1="3" y1="10" x2="21" y2="10"></line>
          </svg>
          Current Semester
        </div>
      </div>
    </div>

    <!-- Empty State if no courses assigned -->
    <div v-if="lecturerCourses.length === 0" class="empty-state">
      <div class="empty-icon-wrap">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
          <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"></path>
          <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"></path>
        </svg>
      </div>
      <h3>No Assigned Courses</h3>
      <p>You haven't been assigned to teach any courses this semester.</p>
    </div>

    <!-- Courses Grid -->
    <div v-else class="courses-grid">
      <div class="course-card" v-for="course in lecturerCourses" :key="course.id">
        <div class="course-color-bar" :style="{ backgroundColor: course.color }"></div>
        <div class="course-card-content">
          <div class="card-header">
            <span class="course-code">{{ course.code }}</span>
            <span class="student-count">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><path d="M23 21v-2a4 4 0 0 0-3-3.87"></path><path d="M16 3.13a4 4 0 0 1 0 7.75"></path></svg>
              {{ course.studentsCount }} Students
            </span>
          </div>
          
          <h3 class="course-name">{{ course.name }}</h3>
          
          <div class="schedule-info">
             <div class="info-row">
               <svg viewBox="0 0 24 24" fill="none" class="icon" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg>
               <span>{{ course.day }} • {{ course.time }}</span>
               <button class="icon-btn edit-btn" @click="openEditModal(course)" title="Reschedule Class">
                 <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path></svg>
               </button>
             </div>
             <div class="info-row">
               <svg viewBox="0 0 24 24" fill="none" class="icon" stroke="currentColor" stroke-width="2"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path><circle cx="12" cy="10" r="3"></circle></svg>
               <span>{{ course.venue }}</span>
             </div>
             <div class="info-row">
               <svg viewBox="0 0 24 24" fill="none" class="icon" stroke="currentColor" stroke-width="2"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path><circle cx="12" cy="10" r="3"></circle></svg>
               <span>{{ course.mode }}</span>
             </div>
          </div>

          <div class="attendance-summary">
            <div class="summary-top">
              <span class="summary-label">Average Attendance</span>
              <span class="summary-value" :style="{ color: course.color }">{{ course.avgAttendance }}%</span>
            </div>
            <div class="progress-bar">
              <div class="progress-fill" :style="{ width: `${course.avgAttendance}%`, backgroundColor: course.color }"></div>
            </div>
          </div>

          <div class="card-actions">
            <button class="action-btn solid-btn" :style="{ backgroundColor: course.color }" @click="goToAttendance(course)">
              Take Attendance
            </button>
            <button class="action-btn outline-btn" @click="openClassList(course)">
              View Class List
            </button>
            <button class="action-btn delete-btn" @click="confirmDelete(course)" title="Remove this section">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <polyline points="3 6 5 6 21 6"/>
                <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/>
                <path d="M10 11v6M14 11v6"/>
                <path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/>
              </svg>
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Modal for Reschedule -->
    <div v-if="editingCourse" class="modal-overlay">
      <div class="modal-content">
        <h2>Reschedule Class</h2>
        <p>Update the schedule for {{ editingCourse.code }} - {{ editingCourse.name }}</p>
        
        <div class="form-group">
          <label>Day of Week</label>
          <select v-model="editForm.day" class="modern-input">
  <option value="Monday">Mondays</option>
  <option value="Tuesday">Tuesdays</option>
  <option value="Wednesday">Wednesdays</option>
  <option value="Thursday">Thursdays</option>
  <option value="Friday">Fridays</option>
  <option value="Saturday">Saturdays</option>
  <option value="Sunday">Sundays</option>
</select>
        </div>

       <div class="form-group">
  <label>Start Time</label>
  <input type="time" v-model="editForm.startTime" class="modern-input" />
</div>
<div class="form-group">
  <label>End Time</label>
  <input type="time" v-model="editForm.endTime" class="modern-input" />
</div>
        <div class="modal-actions">
          <button class="action-btn outline-btn" @click="cancelEdit">Cancel</button>
          <button class="action-btn primary-btn" @click="saveEdit">Save Schedule</button>
        </div>
      </div>
    </div>

    <!-- Delete Section Confirmation Modal -->
    <div v-if="deletingCourse" class="modal-overlay" @click.self="deletingCourse = null">
      <div class="modal-content delete-modal">
        <div class="delete-modal-icon">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <polyline points="3 6 5 6 21 6"/>
            <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/>
            <path d="M10 11v6M14 11v6"/>
            <path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/>
          </svg>
        </div>
        <h2>Remove Section?</h2>
        <p>You are about to remove the <strong>{{ deletingCourse.mode }}</strong> section of:</p>
        <div class="delete-course-info">
          <span class="delete-course-code">{{ deletingCourse.code }}</span>
          <span class="delete-course-name">{{ deletingCourse.name }}</span>
          <span class="delete-course-meta">{{ deletingCourse.day }} • {{ deletingCourse.time }}</span>
        </div>
        <p class="delete-warning">This removes your schedule assignment. The course itself remains in the system.</p>
        <div class="modal-actions">
          <button class="action-btn outline-btn" @click="deletingCourse = null" :disabled="isDeleting">Cancel</button>
          <button class="action-btn danger-confirm-btn" @click="deleteSection" :disabled="isDeleting">
            <svg v-if="isDeleting" class="spin-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <circle cx="12" cy="12" r="10" stroke-dasharray="31" stroke-dashoffset="10"/>
            </svg>
            {{ isDeleting ? 'Removing…' : 'Yes, Remove Section' }}
          </button>
        </div>
      </div>
    </div>

    <!-- Modal for Class List -->
    <div v-if="showingClassList" class="modal-overlay" @click.self="closeClassList">
      <div class="modal-content class-list-modal">
        <div class="modal-header-row">
          <div>
            <h2>{{ activeCourse?.name }}</h2>
            <p>Class Enrollment List</p>
          </div>
          <button class="icon-btn" @click="closeClassList">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
          </button>
        </div>
        
        <div v-if="isLoadingStudents" class="loading-state">
          Loading students...
        </div>
        <div v-else-if="studentsList.length === 0" class="empty-state-small">
          <p>No students enrolled in this course.</p>
        </div>
        <div v-else class="table-container">
          <table class="students-table">
            <thead>
              <tr>
                <th>Student</th>
                <th>Student ID</th>
                <th>Program</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="student in studentsList" :key="student.id">
                <td>
                  <div class="student-cell">
                    <div class="student-avatar">{{ student.name.charAt(0) }}</div>
                    <span>{{ student.name }}</span>
                  </div>
                </td>
                <td>{{ student.studentId }}</td>
<td>{{ programmesStore.getProgrammeById(student.programId)?.name || 'N/A' }}</td>              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue';
import { storeToRefs } from 'pinia';
import { useAuthStore } from '@/stores/authstore';
import { useSchedulesStore } from '@/stores/schedules';
import { useCoursesStore } from '@/stores/courses';
import { useEnrollmentsStore } from '@/stores/enrollments';
import { useSessionsStore } from '@/stores/sessions';
import { useAttendancesStore } from '@/stores/attendances';
import { supabase } from '@/stores/supabase';
import { useProgrammesStore } from '@/stores/programmes';

const emit = defineEmits(['navigate']);

const authStore = useAuthStore();
const schedulesStore = useSchedulesStore();
const coursesStore = useCoursesStore();
const enrollmentsStore = useEnrollmentsStore();
const sessionsStore = useSessionsStore();
const attendancesStore = useAttendancesStore();
const programmesStore = useProgrammesStore();

const { profile } = storeToRefs(authStore);
const { schedules } = storeToRefs(schedulesStore);
const { sessions } = storeToRefs(sessionsStore);
const { attendances } = storeToRefs(attendancesStore);

const lecturerName = computed(() => profile.value?.name ?? '');

// studentId -> mode, used to scope enrollment counts to the right section
const studentModeById = ref({});

// A rotating palette so cards don't all render the same color.
const palette = ['#4f46e5', '#10b981', '#f59e0b', '#ec4899', '#0ea5e9', '#8b5cf6'];

onMounted(async () => {
  try {
    await Promise.all([
      schedulesStore.fetchSchedules(),
      coursesStore.fetchCourses(),
      enrollmentsStore.fetchEnrollments(),
      sessionsStore.fetchSessions(),
      attendancesStore.fetchAttendances(),
      programmesStore.fetchProgrammes(),
    ]);

    schedulesStore.subscribeToSchedules();
    coursesStore.subscribeToCourses();
    enrollmentsStore.subscribeToEnrollments();
    sessionsStore.subscribeToSessions();
    attendancesStore.subscribeToAttendances();
    programmesStore.subscribeToProgrammes();

    // Load student modes once so course cards can show a mode-scoped count.
    const { data, error } = await supabase
      .from('users')
      .select('id, mode')
      .eq('role', 'Student');

    if (error) throw error;

    studentModeById.value = Object.fromEntries(
      (data ?? []).map((u) => [u.id, u.mode])
    );
  } catch (error) {
    console.error('Error fetching lecturer courses:', error);
  }
});

/**
 * Attendance rate for one course+mode: present / total across sessions
 * belonging to that course's specific section (Regular vs Weekend).
 * Requires the sessions table to have a mode column — added via migration.
 */
function avgAttendanceForCourse(courseId, mode) {
  const sessionIds = new Set(
    sessions.value
      .filter((s) => s.courseId === courseId && s.mode === mode)
      .map((s) => s.id)
  );
  if (sessionIds.size === 0) return 0;

  const relevant = attendances.value.filter((a) => sessionIds.has(a.sessionId));
  if (relevant.length === 0) return 0;

  const present = relevant.filter((a) => a.status === 'present').length;
  return Math.round((present / relevant.length) * 100);
}

function studentsCountForSchedule(courseId, mode) {
  return enrollmentsStore
    .enrollmentsByCourse(courseId)
    .filter((e) => studentModeById.value[e.studentId] === mode)
    .length;
}

const lecturerCourses = computed(() => {
  return schedules.value
    .filter((s) => s.lecturer === lecturerName.value)
    .map((s, index) => {
      const course = coursesStore.getCourseById(s.courseId);
      return {
        scheduleId: s.id,
        id: s.courseId,
        code: course?.code ?? 'Unknown',
        name: course?.name ?? 'Unknown Course',
        semester: course?.semester || 'Semester 1',
        mode: s.mode || 'Unknown',
        studentsCount: studentsCountForSchedule(s.courseId, s.mode),
        day: s.day,
        time: `${s.startTime} - ${s.endTime}`,
        startTime: s.startTime,
        endTime: s.endTime,
        venue: s.venue,
        avgAttendance: avgAttendanceForCourse(s.courseId, s.mode),
        color: palette[index % palette.length],
      };
    });
});

// --- Delete section ---
const deletingCourse = ref(null);
const isDeleting = ref(false);

const confirmDelete = (course) => {
  deletingCourse.value = course;
};

const deleteSection = async () => {
  if (!deletingCourse.value) return;
  isDeleting.value = true;
  try {
    await schedulesStore.deleteSchedule(deletingCourse.value.scheduleId);
    deletingCourse.value = null;
  } catch { /* store handles toast */ } finally {
    isDeleting.value = false;
  }
};

// --- Reschedule modal ---
const editingCourse = ref(null);
const editForm = ref({ day: '', startTime: '', endTime: '' });

const openEditModal = (course) => {
  editingCourse.value = course;
  editForm.value = {
    day: course.day,
    startTime: course.startTime,
    endTime: course.endTime,
  };
};

const cancelEdit = () => {
  editingCourse.value = null;
};

const saveEdit = async () => {
  if (!editingCourse.value) return;

  // Same overlap-based conflict check used in the admin Schedule.vue —
  // prevents this lecturer (or the venue) from double-booking a slot.
  const conflict = schedulesStore.findConflict(
    {
      day: editForm.value.day,
      startTime: editForm.value.startTime,
      endTime: editForm.value.endTime,
      lecturer: lecturerName.value,
      venue: editingCourse.value.venue,
    },
    editingCourse.value.scheduleId
  );

  if (conflict) {
    alert(
      `Scheduling conflict: this overlaps with another class from ${conflict.startTime} to ${conflict.endTime} on ${editForm.value.day}.`
    );
    return;
  }

  try {
    await schedulesStore.updateSchedule(editingCourse.value.scheduleId, {
      day: editForm.value.day,
      startTime: editForm.value.startTime,
      endTime: editForm.value.endTime,
    });
    editingCourse.value = null;
  } catch (error) {
    console.error('Error updating schedule:', error);
  }
};

const goToAttendance = (course) => {
  localStorage.setItem('activeCourseId', course.id);
  localStorage.setItem('activeCourseCode', course.code);
  localStorage.setItem('activeCourseName', course.name);
  localStorage.setItem('activeCourseSemester', course.semester);
  localStorage.setItem('activeCourseMode', course.mode);
  emit('navigate', '/attendance-view');
};

const showingClassList = ref(false);
const activeCourse = ref(null);
const studentsList = ref([]);
const isLoadingStudents = ref(false);

const openClassList = async (course) => {
  activeCourse.value = course;
  showingClassList.value = true;
  isLoadingStudents.value = true;

  try {
    const { data, error } = await supabase
      .from('enrollments')
      .select(`
        student_id,
        users!enrollments_student_id_fkey (
          id,
          name,
          id_number,
          program_id,
          mode
        )
      `)
      .eq('course_id', course.id);

    if (error) throw error;

    studentsList.value = (data ?? [])
      .map((row) => row.users)
      .filter(Boolean)
      .filter((u) => u.mode === course.mode)
      .map((u) => ({
        id: u.id,
        name: u.name,
        studentId: u.id_number,
        programId: u.program_id,
      }))
      .sort((a, b) => (a.name || '').localeCompare(b.name || ''));
  } catch (error) {
    console.error('Error fetching class list:', error);
    studentsList.value = [];
  } finally {
    isLoadingStudents.value = false;
  }
};

const closeClassList = () => {
  showingClassList.value = false;
  activeCourse.value = null;
  studentsList.value = [];
};



</script>

<style scoped>
.lecturer-courses-container {
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

.semester-badge {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  background-color: #f1f5f9;
  color: #475569;
  padding: 0.5rem 1rem;
  border-radius: 9999px;
  font-size: 0.875rem;
  font-weight: 600;
  box-shadow: 0 1px 2px 0 rgba(0, 0, 0, 0.05);
  border: 1px solid #e2e8f0;
}

.semester-badge svg {
  width: 16px;
  height: 16px;
  color: #6366f1;
}

/* Empty State */
.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 6rem 1rem;
  text-align: center;
  background-color: #ffffff;
  border-radius: 16px;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05);
  border: 1px solid rgba(226, 232, 240, 0.8);
}

.empty-icon-wrap {
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

.empty-icon-wrap svg {
  width: 40px;
  height: 40px;
  opacity: 0.8;
}

.empty-state h3 {
  margin: 0 0 0.5rem 0;
  font-size: 1.25rem;
  color: #1e293b;
  font-weight: 600;
}

.empty-state p {
  color: #64748b;
  margin: 0;
  font-size: 1rem;
}

/* Grid Layout */
.courses-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(340px, 1fr));
  gap: 1.5rem;
}

.course-card {
  background-color: #ffffff;
  border-radius: 16px;
  overflow: hidden;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05), 0 2px 4px -1px rgba(0, 0, 0, 0.03);
  border: 1px solid rgba(226, 232, 240, 0.8);
  transition: transform 0.2s ease, box-shadow 0.2s ease;
  display: flex;
  flex-direction: column;
}

.course-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.05);
}

.course-color-bar {
  height: 8px;
  width: 100%;
}

.course-card-content {
  padding: 1.5rem;
  display: flex;
  flex-direction: column;
  flex: 1;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 0.75rem;
}

.course-code {
  font-size: 0.85rem;
  font-weight: 700;
  color: #64748b;
  letter-spacing: 0.05em;
  background: #f1f5f9;
  padding: 4px 8px;
  border-radius: 6px;
}

.student-count {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 0.8rem;
  font-weight: 600;
  color: #475569;
}

.student-count svg {
  width: 14px;
  height: 14px;
  color: #94a3b8;
}

.course-name {
  margin: 0 0 1rem 0;
  font-size: 1.2rem;
  font-weight: 700;
  color: #0f172a;
  line-height: 1.3;
}

.schedule-info {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  margin-bottom: 1.5rem;
}

.info-row {
  display: flex;
  align-items: center;
  gap: 10px;
  color: #475569;
  font-size: 0.9rem;
  font-weight: 500;
}

.info-row .icon {
  width: 18px;
  height: 18px;
  color: #94a3b8;
}

.attendance-summary {
  margin-bottom: 1.5rem;
  padding-bottom: 1.5rem;
  border-bottom: 1px solid #f1f5f9;
}

.summary-top {
  display: flex;
  justify-content: space-between;
  align-items: flex-end;
  margin-bottom: 0.5rem;
}

.summary-label {
  font-size: 0.8rem;
  font-weight: 600;
  color: #64748b;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.summary-value {
  font-size: 1rem;
  font-weight: 800;
}

.progress-bar {
  height: 6px;
  background-color: #e2e8f0;
  border-radius: 999px;
  overflow: hidden;
}

.progress-fill {
  height: 100%;
  border-radius: 999px;
  transition: width 0.5s ease;
}

.card-actions {
  display: flex;
  gap: 0.75rem;
  margin-top: auto;
}

.action-btn {
  flex: 1;
  padding: 0.7rem;
  border-radius: 10px;
  font-size: 0.9rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
  text-align: center;
}

.outline-btn {
  background-color: transparent;
  color: #475569;
  border: 1px solid #cbd5e1;
}

.outline-btn:hover {
  background-color: #f8fafc;
  border-color: #94a3b8;
  color: #0f172a;
}

.solid-btn {
  color: white;
  border: none;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
}

.solid-btn:hover {
  filter: brightness(110%);
  transform: translateY(-1px);
  box-shadow: 0 6px 8px -1px rgba(0, 0, 0, 0.15);
}



/* Reschedule Buttons */
.icon-btn {
  background: none;
  border: none;
  color: #6366f1;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 4px;
  border-radius: 4px;
  transition: all 0.2s;
  margin-left: auto;
}

.icon-btn:hover {
  background: #e0e7ff;
  color: #4338ca;
}

.icon-btn svg {
  width: 16px;
  height: 16px;
}

/* Modal Styles */
.modal-overlay {
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
}

.modal-content {
  background-color: #ffffff;
  border-radius: 16px;
  padding: 2rem;
  width: 90%;
  max-width: 500px;
  box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
}

.modal-content h2 {
  margin: 0 0 0.5rem 0;
  font-size: 1.5rem;
  font-weight: 700;
  color: #0f172a;
}

.modal-content p {
  margin: 0 0 1.5rem 0;
  color: #64748b;
  font-size: 0.95rem;
}

.form-group {
  margin-bottom: 1.5rem;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.form-group label {
  font-size: 0.85rem;
  font-weight: 600;
  color: #475569;
}

.modern-input {
  padding: 0.75rem 1rem;
  border: 1px solid #cbd5e1;
  border-radius: 8px;
  background-color: #f8fafc;
  font-size: 0.95rem;
  color: #0f172a;
  outline: none;
  transition: all 0.2s;
  font-family: inherit;
  width: 100%;
}

.modern-input:focus {
  background-color: #ffffff;
  border-color: #6366f1;
  box-shadow: 0 0 0 3px rgba(99, 102, 241, 0.1);
}

.modal-actions {
  display: flex;
  justify-content: flex-end;
  gap: 1rem;
  margin-top: 2rem;
}

.primary-btn {
  background-color: #10b981;
  color: white;
  border: none;
}

.primary-btn:hover {
  background-color: #059669;
}

@media (max-width: 768px) {
  .page-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 1rem;
  }
  
  .courses-grid {
    grid-template-columns: 1fr;
  }
  
  .card-actions {
    flex-direction: column;
  }
}

.class-list-modal {
  max-width: 600px !important;
  max-height: 85vh;
  display: flex;
  flex-direction: column;
}

.modal-header-row {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 1.5rem;
}

.loading-state, .empty-state-small {
  text-align: center;
  padding: 3rem 0;
  color: #64748b;
  font-style: italic;
}

.table-container {
  overflow-y: auto;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
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

.student-cell {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  font-weight: 600;
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

/* Delete button on card */
.delete-btn {
  flex: 0 0 auto;
  width: 38px;
  height: 38px;
  padding: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  border: 1.5px solid #fecaca;
  border-radius: 8px;
  background: #fff5f5;
  color: #ef4444;
  cursor: pointer;
  transition: all .2s;
}
.delete-btn:hover { background: #ef4444; color: #fff; border-color: #ef4444; }
.delete-btn svg { width: 16px; height: 16px; }

/* Delete confirm modal */
.delete-modal {
  max-width: 420px;
  text-align: center;
  padding: 2rem;
}
.delete-modal-icon {
  width: 56px; height: 56px;
  background: #fee2e2;
  border-radius: 50%;
  display: flex; align-items: center; justify-content: center;
  margin: 0 auto 1.25rem;
  color: #ef4444;
}
.delete-modal-icon svg { width: 26px; height: 26px; }
.delete-modal h2 { margin: 0 0 .5rem; font-size: 1.2rem; color: #0f172a; }
.delete-modal p  { margin: 0 0 1rem; font-size: .9rem; color: #64748b; }

.delete-course-info {
  display: flex; flex-direction: column; gap: .25rem;
  background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 10px;
  padding: .9rem 1.1rem; margin: 0 0 1rem; text-align: left;
}
.delete-course-code { font-size: .75rem; font-weight: 700; color: #6366f1; text-transform: uppercase; letter-spacing: .05em; }
.delete-course-name { font-size: .95rem; font-weight: 600; color: #0f172a; }
.delete-course-meta { font-size: .8rem; color: #64748b; }
.delete-warning { font-size: .8rem; color: #f59e0b !important; margin-bottom: 1.5rem !important; }

.danger-confirm-btn {
  background: #ef4444; color: #fff; border: none;
  padding: .6rem 1.4rem; border-radius: 8px; font-size: .9rem; font-weight: 700;
  cursor: pointer; display: inline-flex; align-items: center; gap: .5rem;
  transition: background .2s;
}
.danger-confirm-btn:hover:not(:disabled) { background: #dc2626; }
.danger-confirm-btn:disabled { opacity: .6; cursor: not-allowed; }

.spin-icon { width: 16px; height: 16px; animation: spin .7s linear infinite; }
@keyframes spin { to { transform: rotate(360deg); } }
</style>
