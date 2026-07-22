<template>
  <div class="courses-container">
    <div class="page-header">
      <div>
        <h1 class="page-title">Course Management</h1>
        <p class="page-subtitle">Manage all university courses, schedules, and assigned lecturers.</p>
      </div>
      <button class="primary-btn" @click="openModal">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"
          stroke-linejoin="round">
          <line x1="12" y1="5" x2="12" y2="19"></line>
          <line x1="5" y1="12" x2="19" y2="12"></line>
        </svg>
        Add New Course
      </button>
    </div>

    <!-- Filters & Search -->
    <div class="table-controls">
      <div class="search-box">
        <svg class="search-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <circle cx="11" cy="11" r="8"></circle>
          <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
        </svg>
        <input type="text" v-model="searchQuery" placeholder="Search course code or name..." />
      </div>

      <div class="filters">
        <select v-model="levelFilter" class="filter-select">
          <option value="all">All Levels</option>
          <option value="100">Level 100</option>
          <option value="200">Level 200</option>
          <option value="300">Level 300</option>
          <option value="400">Level 400</option>
        </select>

        <select v-model="statusFilter" class="filter-select">
          <option value="all">All Statuses</option>
          <option value="active">Active</option>
          <option value="archived">Archived</option>
        </select>
      </div>
    </div>

    <!-- Courses Table -->
    <div class="table-container">
      <table class="data-table">
        <thead>
          <tr>
            <th>Course Code</th>
            <th>Course Name</th>
            <th>Semester</th>
            <th>Level</th>
            <th>Lecturer</th>
           <!-- <th>Schedule</th>-->
            <th>Status</th>
            <th class="actions-col">Actions</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="course in filteredCourses" :key="course.id" class="table-row">
            <td class="font-semibold text-dark">{{ course.code }}</td>
            <td>{{ course.name }}</td>
            <td>{{ course.semester || 'Semester 1' }}</td>
            <td>
              <span class="level-badge">L{{ course.level }}</span>
            </td>
            <td>
              <div class="lecturer-info">
                <img
                  :src="`https://ui-avatars.com/api/?name=${(course.lecturer || 'Unknown').replace(' ', '+')}&background=f1f5f9&color=475569`"
                  alt="avatar" class="sm-avatar" />
                <span>{{ course.lecturer || 'No Lecturer Assigned' }}</span>
              </div>
            </td>
           <!-- <td class="schedule-cell">
              {{ course.schedule || 'Not Assigned' }}
            </td>--> 
            <td>
              <span class="status-badge" :class="course.status">
                {{ course.status === 'active' ? 'Active' : 'Archived' }}
              </span>
            </td>
            <td class="actions-cell">
              <button class="icon-action-btn edit" title="Edit Course" @click="editCourse(course)">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"
                  stroke-linejoin="round">
                  <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                  <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
                </svg>
              </button>
             <!--<button class="icon-action-btn assign" title="Assign Lecturer" @click="openAssignModal(course)">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"
                  stroke-linejoin="round">
                  <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                  <circle cx="12" cy="7" r="4"></circle>
                  <line x1="19" y1="8" x2="19" y2="14"></line>
                  <line x1="16" y1="11" x2="22" y2="11"></line>
                </svg>
              </button> --> 
              <button class="icon-action-btn delete" title="Archive Course" @click="archiveCourse(course.id)"
                v-if="course.status !== 'archived'">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"
                  stroke-linejoin="round">
                  <polyline points="3 6 5 6 21 6"></polyline>
                  <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                </svg>
              </button>
            </td>
          </tr>

          <tr v-if="filteredCourses.length === 0" class="empty-state">
            <td colspan="7">
              <div class="empty-content">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
                  <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
                  <circle cx="8.5" cy="8.5" r="1.5"></circle>
                  <polyline points="21 15 16 10 5 21"></polyline>
                </svg>
                <p>{{ isLoading ? 'Loading courses...' : 'No courses found matching your criteria.' }}</p>
                <button v-if="!isLoading" class="clear-btn" @click="clearFilters">Clear Filters</button>
              </div>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Pagination -->
    <div class="pagination">
      <p class="pagination-info">Showing 1 to {{ filteredCourses.length }} of {{ courses.length }} courses</p>
      <div class="page-controls">
        <button class="page-btn disabled" disabled>Previous</button>
        <button class="page-btn active">1</button>
        <button class="page-btn">2</button>
        <button class="page-btn">Next</button>
      </div>
    </div>

    <!-- Add Course Modal -->
    <div class="modal-backdrop" v-if="isModalOpen" @click.self="closeModal">
      <div class="modal-card">
        <div class="modal-header">
          <h2>{{ editingCourseId ? 'Edit Course' : 'Add New Course' }}</h2>
          <button class="close-btn" @click="closeModal" aria-label="Close modal">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <line x1="18" y1="6" x2="6" y2="18"></line>
              <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
          </button>
        </div>
        <div class="modal-body">
          <form @submit.prevent="saveCourse" class="course-form">
            <div class="form-group">
              <label>Course Code</label>
              <input type="text" v-model="newCourse.code" placeholder="e.g. CSC 101" required class="form-control" />
            </div>
            <div class="form-group">
              <label>Course Name</label>
              <input type="text" v-model="newCourse.name" placeholder="e.g. Intro to Computer Science" required
                class="form-control" />
            </div>
            <div class="form-group">
              <label>Credits</label>
              <input type="number" v-model.number="newCourse.credits" placeholder="e.g. 3" required min="1"
                class="form-control" />
            </div>
            <!-- Faculty / Program -->
            <div class="form-group">
              <label for="programme">Faculty / Program</label>
                <select id="programme" v-model="newCourse.program" required class="form-control">
                  <option value="" disabled>Select your faculty/program</option>
                  <option  v-for="programme in programmes" :key="programme.id" :value="programme.name">{{ programme.name
                    }}</option>
                </select>
            </div>
            <div class="form-group">
              <label>Semester</label>
              <select v-model="newCourse.semester" required class="form-control">
                <option value="Semester 1">Semester 1</option>
                <option value="Semester 2">Semester 2</option>
              </select>
            </div>
            <div class="form-group">
              <label>Level</label>
              <select v-model="newCourse.level" required class="form-control">
                <option value="100">100</option>
                <option value="200">200</option>
                <option value="300">300</option>
                <option value="400">400</option>
              </select>
            </div>
            <div class="form-actions">
              <button type="button" class="clear-btn" @click="closeModal">Cancel</button>
              <button type="submit" class="primary-btn" :disabled="isSavingCourse">
                {{ isSavingCourse ? 'Saving...' : (editingCourseId ? 'Update Course' : 'Save Course') }}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>

    <!-- Assign Lecturer Modal -->
    <div class="modal-backdrop" v-if="isAssignModalOpen" @click.self="closeAssignModal">
      <div class="modal-card assign-modal">
        <div class="modal-header">
          <div>
            <h2>Assign Lecturer</h2>
            <p class="modal-subtitle">{{ assigningCourse?.code }} — {{ assigningCourse?.name }}</p>
          </div>
          <button class="close-btn" @click="closeAssignModal" aria-label="Close">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <line x1="18" y1="6" x2="6" y2="18"></line>
              <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
          </button>
        </div>
        <div class="modal-body">
          <form @submit.prevent="saveAssignment" class="course-form">

            <!-- Lecturer Select -->
            <div class="form-group">
              <label>Select Lecturer</label>
              <div class="lecturer-select-wrap">
                <svg class="select-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                  <circle cx="12" cy="7" r="4"></circle>
                </svg>
                <select v-model="assignForm.lecturerId" required class="form-control pl-icon"
                  @change="onLecturerChange">
                  <option value="" disabled>-- Choose a Lecturer --</option>
                  <option v-for="l in lecturers" :key="l.id" :value="l.id">{{ l.name }}</option>
                </select>
              </div>
              <p v-if="isLoadingLecturers" class="hint-text">Loading lecturers...</p>
              <p v-else-if="lecturers.length === 0" class="hint-text warn">No lecturer accounts found. Create one first.
              </p>
            </div>

            <div class="form-row">
              <!-- Day -->
              <div class="form-group">
                <label>Day of Week</label>
                <select v-model="assignForm.day" required class="form-control">
                  <option value="" disabled>Select day</option>
                  <option>Mondays</option>
                  <option>Tuesdays</option>
                  <option>Wednesdays</option>
                  <option>Thursdays</option>
                  <option>Fridays</option>
                  <option>Saturdays</option>
                </select>
              </div>

              <!-- Mode -->
              <div class="form-group">
                <label>Mode</label>
                <select v-model="assignForm.mode" required class="form-control">
                  <option>Lecture</option>
                  <option>Tutorial</option>
                  <option>Lab</option>
                  <option>Seminar</option>
                </select>
              </div>
            </div>

            <div class="form-row">
              <!-- Start Time -->
              <div class="form-group">
                <label>Start Time</label>
                <input type="time" v-model="assignForm.startTime" required class="form-control" />
              </div>
              <!-- End Time -->
              <div class="form-group">
                <label>End Time</label>
                <input type="time" v-model="assignForm.endTime" required class="form-control" />
              </div>
            </div>

            <!-- Venue -->
            <div class="form-group">
              <label>Venue / Room</label>
              <input type="text" v-model="assignForm.venue" placeholder="e.g. Lecture Hall A, Room 204" required
                class="form-control" />
            </div>

            <!-- Success/Error Banner -->
            <div v-if="assignSuccess" class="alert-banner success">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
                <polyline points="22 4 12 14.01 9 11.01"></polyline>
              </svg>
              Lecturer assigned successfully!
            </div>
            <div v-if="assignError" class="alert-banner error">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <circle cx="12" cy="12" r="10"></circle>
                <line x1="12" y1="8" x2="12" y2="12"></line>
                <line x1="12" y1="16" x2="12.01" y2="16"></line>
              </svg>
              {{ assignError }}
            </div>

            <div class="form-actions">
              <button type="button" class="clear-btn" @click="closeAssignModal">Cancel</button>
              <button type="submit" class="primary-btn" :disabled="isAssigning">
                <svg v-if="isAssigning" class="spinner-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor"
                  stroke-width="2">
                  <circle cx="12" cy="12" r="10" stroke-dasharray="31.4" stroke-dashoffset="10"></circle>
                </svg>
                {{ isAssigning ? 'Assigning...' : 'Confirm Assignment' }}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch, onMounted, onUnmounted } from 'vue';
import { storeToRefs } from 'pinia';
import { useCoursesStore } from '@/stores/courses';
import { useAuthStore } from '@/stores/authstore';
import { useAuditLogsStore } from '@/stores/auditlogs';
import { supabase } from '@/stores/supabase';

const coursesStore = useCoursesStore();
const authStore = useAuthStore();
const auditLogsStore = useAuditLogsStore();
const { courses, isLoading } = storeToRefs(coursesStore);

const logAudit = (action, details) => {
  const p = authStore.profile;
  if (!p) return;
  auditLogsStore.logAction({ action, details, userId: p.id, userRole: p.role, userName: p.name });
};

const searchQuery = ref('');
const levelFilter = ref('all');
const statusFilter = ref('all');

const isModalOpen = ref(false);
const isSavingCourse = ref(false);
const editingCourseId = ref(null);
const newCourse = ref({
  code: '',
  name: '',
  credits: 3,
  program: '',
  semester: 'Semester 1',
  level: '100'
});

// Assign Lecturer State
const isAssignModalOpen = ref(false);
const assigningCourse = ref(null);
const lecturers = ref([]);
const isLoadingLecturers = ref(false);
const isAssigning = ref(false);
const assignSuccess = ref(false);
const assignError = ref('');
const assignForm = ref({
  lecturerId: '',
  lecturerName: '',
  day: '',
  startTime: '',
  endTime: '',
  venue: '',
  mode: 'Lecture'
});
const programmes = ref([]);

// schedules aren't owned by coursesStore — course_id -> { lecturer, summary }
const schedulesByCourseId = ref({});

const fetchSchedules = async () => {
  const ids = courses.value.map((c) => c.id);
  if (ids.length === 0) {
    schedulesByCourseId.value = {};
    return;
  }

  const { data, error } = await supabase
    .from('schedules')
    .select('*')
    .in('course_id', ids)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Failed to load schedules:', error);
    return;
  }

  const map = {};
  for (const row of data ?? []) {
    // most recent schedule per course wins, since results are newest-first
    if (!map[row.course_id]) {
      map[row.course_id] = {
        lecturer: row.lecturer,
        summary: `${row.day} ${row.start_time}-${row.end_time}, ${row.venue}`,
      };
    }
  }
  schedulesByCourseId.value = map;
};

// keep the schedule map in sync whenever the course list changes
// (initial load, realtime insert/delete, etc.)
watch(courses, fetchSchedules, { deep: true });

onMounted(async () => {
  await coursesStore.fetchCourses();
  coursesStore.subscribeToCourses();
  const { data, error } = await supabase.from('programmes').select('id, name').order('name');
  if (error) {
    console.error('Failed to load faculties', error);
    return;
  }
  programmes.value = data;
});



onUnmounted(() => {
  coursesStore.unsubscribeFromCourses();
});

const coursesWithSchedule = computed(() =>
  courses.value.map((course) => ({
    ...course,
    lecturer: schedulesByCourseId.value[course.id]?.lecturer ?? null,
    schedule: schedulesByCourseId.value[course.id]?.summary ?? null,
  }))
);

const openModal = () => {
  editingCourseId.value = null;
  newCourse.value = { code: '', name: '', credits: 3, program: '', semester: 'Semester 1', level: '100' };
  isModalOpen.value = true;
};

const editCourse = (course) => {
  editingCourseId.value = course.id;
  newCourse.value = {
    code: course.code,
    name: course.name,
    credits: course.credits,
    program: course.program,   // was: course.programme
    semester: course.semester || 'Semester 1',
    level: course.level
  };
  isModalOpen.value = true;
};


const closeModal = () => {
  isModalOpen.value = false;
  editingCourseId.value = null;
};

const saveCourse = async () => {
  isSavingCourse.value = true;
  try {
    if (editingCourseId.value) {
      await coursesStore.updateCourse(editingCourseId.value, newCourse.value);
      logAudit('course_updated', `Updated course "${newCourse.value.code} — ${newCourse.value.name}"`);
    } else {
      await coursesStore.createCourse(newCourse.value);
      logAudit('course_created', `Created course "${newCourse.value.code} — ${newCourse.value.name}"`);
    }
    closeModal();
  } catch (error) {
    console.error('Error saving course:', error);
  } finally {
    isSavingCourse.value = false;
  }
};

const archiveCourse = async (id) => {
  if (!confirm('Are you sure you want to archive this course?')) return;
  const course = courses.value.find(c => c.id === id);
  try {
    await coursesStore.updateCourse(id, { status: 'archived' });
    logAudit('course_archived', `Archived course "${course?.code ?? id}"`);
  } catch (error) {
    console.error('Error archiving course:', error);
  }
};

// --- Assign Lecturer Logic ---
const openAssignModal = async (course) => {
  assigningCourse.value = course;
  assignSuccess.value = false;
  assignError.value = '';
  assignForm.value = { lecturerId: '', lecturerName: '', day: '', startTime: '', endTime: '', venue: '', mode: 'Lecture' };
  isAssignModalOpen.value = true;

  isLoadingLecturers.value = true;
  try {
    const { data, error } = await supabase
      .from('users')
      .select('id, name')
      .eq('role', 'Lecturer')
      .order('name');

    if (error) throw error;
    lecturers.value = data ?? [];
  } catch (err) {
    console.error('Failed to load lecturers:', err);
    lecturers.value = [];
  } finally {
    isLoadingLecturers.value = false;
  }
};

const closeAssignModal = () => {
  isAssignModalOpen.value = false;
  assigningCourse.value = null;
};

const onLecturerChange = () => {
  const found = lecturers.value.find((l) => l.id === assignForm.value.lecturerId);
  assignForm.value.lecturerName = found ? found.name : '';
};

const saveAssignment = async () => {
  if (!assigningCourse.value) return;
  assignSuccess.value = false;
  assignError.value = '';
  isAssigning.value = true;

  try {
    const { error } = await supabase.from('schedules').insert({
      course_id: assigningCourse.value.id,
      level: assigningCourse.value.level,
      mode: assignForm.value.mode,
      day: assignForm.value.day,
      start_time: assignForm.value.startTime,
      end_time: assignForm.value.endTime,
      venue: assignForm.value.venue,
      lecturer: assignForm.value.lecturerName,
    });

    if (error) throw error;

    logAudit('lecturer_assigned', `Assigned ${assignForm.value.lecturerName} to ${assigningCourse.value.code} — ${assignForm.value.day} ${assignForm.value.startTime}-${assignForm.value.endTime}, ${assignForm.value.venue}`);
    assignSuccess.value = true;
    await fetchSchedules();
    // Auto-close after short delay
    setTimeout(() => closeAssignModal(), 1800);
  } catch (err) {
    console.error('Assign lecturer error:', err);
    assignError.value = err.message || 'Failed to assign lecturer. Please try again.';
  } finally {
    isAssigning.value = false;
  }
};

const filteredCourses = computed(() => {
  return coursesWithSchedule.value.filter(course => {
    const matchesSearch = course.code.toLowerCase().includes(searchQuery.value.toLowerCase()) ||
      course.name.toLowerCase().includes(searchQuery.value.toLowerCase());
    const matchesLevel = levelFilter.value === 'all' || course.level === levelFilter.value;
    const matchesStatus = statusFilter.value === 'all' || course.status === statusFilter.value;
    return matchesSearch && matchesLevel && matchesStatus;
  });
});

const clearFilters = () => {
  searchQuery.value = '';
  levelFilter.value = 'all';
  statusFilter.value = 'all';
};
</script>

<style scoped>
.courses-container {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
  width: 100%;
}

/* Header */
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

.primary-btn {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  background-color: #4f46e5;
  color: #ffffff;
  border: none;
  border-radius: 10px;
  padding: 0.75rem 1.25rem;
  font-weight: 600;
  font-size: 0.9rem;
  cursor: pointer;
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
  box-shadow: 0 4px 6px -1px rgba(79, 70, 229, 0.2);
}

.primary-btn:hover {
  background-color: #4338ca;
  transform: translateY(-1px);
  box-shadow: 0 6px 10px -2px rgba(79, 70, 229, 0.3);
}

.primary-btn svg {
  width: 18px;
  height: 18px;
}

/* Controls (Filters & Search) */
.table-controls {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 1rem;
  background-color: #ffffff;
  padding: 1rem 1.5rem;
  border-radius: 16px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.02);
  border: 1px solid rgba(226, 232, 240, 0.8);
}

.search-box {
  position: relative;
  width: 100%;
  max-width: 380px;
}

.search-icon {
  position: absolute;
  left: 12px;
  top: 50%;
  transform: translateY(-50%);
  width: 18px;
  height: 18px;
  color: #94a3b8;
}

.search-box input {
  width: 100%;
  padding: 0.65rem 1rem 0.65rem 2.5rem;
  border: 1px solid #e2e8f0;
  border-radius: 10px;
  background-color: #f8fafc;
  color: #0f172a;
  outline: none;
  transition: all 0.2s ease;
  font-family: inherit;
  font-size: 0.9rem;
}

.search-box input:focus {
  background-color: #ffffff;
  border-color: #6366f1;
  box-shadow: 0 0 0 3px rgba(99, 102, 241, 0.1);
}

.filters {
  display: flex;
  gap: 0.75rem;
}

.filter-select {
  padding: 0.65rem 2rem 0.65rem 1rem;
  border: 1px solid #e2e8f0;
  border-radius: 10px;
  background-color: #ffffff;
  color: #334155;
  font-size: 0.9rem;
  outline: none;
  cursor: pointer;
  appearance: none;
  background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 24 24' fill='none' stroke='%2364748b' stroke-width='2' stroke-linecap='round' stroke-linejoin='round' xmlns='http://www.w3.org/2000/svg'%3E%3Cpolyline points='6 9 12 15 18 9'%3E%3C/polyline%3E%3C/svg%3E");
  background-repeat: no-repeat;
  background-position: right 0.75rem center;
  background-size: 16px;
  transition: border-color 0.2s;
  font-family: inherit;
}

.filter-select:focus {
  border-color: #6366f1;
}

/* Data Table */
.table-container {
  background-color: #ffffff;
  border-radius: 16px;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05), 0 2px 4px -1px rgba(0, 0, 0, 0.03);
  border: 1px solid rgba(226, 232, 240, 0.8);
  overflow-x: auto;
}

.data-table {
  width: 100%;
  border-collapse: separate;
  border-spacing: 0;
  text-align: left;
}

.data-table th {
  padding: 1.25rem 1.5rem;
  font-size: 0.75rem;
  font-weight: 600;
  color: #64748b;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  background-color: #f8fafc;
  border-bottom: 1px solid #e2e8f0;
}

.data-table td {
  padding: 1.25rem 1.5rem;
  font-size: 0.9rem;
  color: #334155;
  border-bottom: 1px solid #f1f5f9;
  vertical-align: middle;
}

.table-row:hover td {
  background-color: #f8fafc;
}

.table-row:last-child td {
  border-bottom: none;
}

.font-semibold {
  font-weight: 600;
}

.text-dark {
  color: #0f172a;
}

.level-badge {
  background-color: #e0e7ff;
  color: #3730a3;
  padding: 0.25rem 0.6rem;
  border-radius: 6px;
  font-size: 0.8rem;
  font-weight: 600;
}

.lecturer-info {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.sm-avatar {
  width: 28px;
  height: 28px;
  border-radius: 50%;
  object-fit: cover;
  border: 1px solid #e2e8f0;
}

.schedule-cell {
  color: #64748b;
}

.status-badge {
  padding: 0.35rem 0.75rem;
  border-radius: 9999px;
  font-size: 0.75rem;
  font-weight: 600;
  letter-spacing: 0.025em;
}

.status-badge.active {
  background-color: #dcfce7;
  color: #166534;
}

.status-badge.archived {
  background-color: #f1f5f9;
  color: #64748b;
}

.actions-col {
  width: 120px;
  text-align: right;
}

.actions-cell {
  display: flex;
  gap: 0.5rem;
  justify-content: flex-end;
}

.icon-action-btn {
  background: none;
  border: none;
  padding: 0.5rem;
  border-radius: 8px;
  cursor: pointer;
  color: #94a3b8;
  transition: all 0.2s;
  display: flex;
  align-items: center;
  justify-content: center;
}

.icon-action-btn svg {
  width: 18px;
  height: 18px;
}

.icon-action-btn.edit:hover {
  background-color: #e0e7ff;
  color: #4f46e5;
}

.icon-action-btn.assign:hover {
  background-color: #d1fae5;
  color: #059669;
}

.icon-action-btn.delete:hover {
  background-color: #fee2e2;
  color: #ef4444;
}

.empty-state td {
  padding: 4rem 2rem;
  text-align: center;
}

.empty-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  color: #94a3b8;
}

.empty-content svg {
  width: 48px;
  height: 48px;
  margin-bottom: 1rem;
  opacity: 0.5;
}

.empty-content p {
  margin: 0 0 1rem 0;
  font-size: 0.95rem;
}

.clear-btn {
  background: none;
  border: 1px solid #cbd5e1;
  padding: 0.5rem 1rem;
  border-radius: 8px;
  color: #475569;
  font-size: 0.85rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
}

.clear-btn:hover {
  background-color: #f1f5f9;
  color: #0f172a;
}

/* Pagination */
.pagination {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0 0.5rem;
}

.pagination-info {
  margin: 0;
  font-size: 0.875rem;
  color: #64748b;
}

.page-controls {
  display: flex;
  gap: 0.25rem;
}

.page-btn {
  background-color: #ffffff;
  border: 1px solid #e2e8f0;
  color: #475569;
  padding: 0.5rem 0.85rem;
  border-radius: 8px;
  font-size: 0.85rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
}

.page-btn:hover:not(.disabled):not(.active) {
  background-color: #f8fafc;
  border-color: #cbd5e1;
}

.page-btn.active {
  background-color: #4f46e5;
  color: #ffffff;
  border-color: #4f46e5;
}

.page-btn.disabled {
  opacity: 0.5;
  cursor: not-allowed;
  background-color: #f8fafc;
}

/* Page Responsiveness */
@media (max-width: 768px) {
  .page-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 1.25rem;
  }

  .table-controls {
    flex-direction: column;
    align-items: stretch;
  }

  .search-box {
    max-width: 100%;
  }

  .filters {
    flex-wrap: wrap;
  }

  .filter-select {
    flex: 1;
    min-width: 140px;
  }

  .page-title {
    font-size: 1.5rem;
  }
}

@media (max-width: 480px) {
  .pagination {
    flex-direction: column;
    align-items: flex-start;
    gap: 1rem;
  }
}

/* Modal */
.modal-backdrop {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(15, 23, 42, 0.5);
  backdrop-filter: blur(4px);
  z-index: 1000;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px;
}

.modal-card {
  background: white;
  border-radius: 20px;
  width: 100%;
  max-width: 500px;
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.1);
  overflow: hidden;
  animation: modalIn 0.3s cubic-bezier(0.16, 1, 0.3, 1);
}

@keyframes modalIn {
  0% {
    transform: translateY(20px);
    opacity: 0;
  }

  100% {
    transform: translateY(0);
    opacity: 1;
  }
}

.modal-header {
  padding: 20px 24px;
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
  padding: 24px;
}

.course-form {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.form-group label {
  font-size: 0.85rem;
  font-weight: 600;
  color: #475569;
}

.form-control {
  padding: 10px 12px;
  border: 1px solid #cbd5e1;
  border-radius: 8px;
  font-size: 0.95rem;
  outline: none;
  transition: border-color 0.2s;
}

.form-control:focus {
  border-color: #6366f1;
}

.form-actions {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  margin-top: 16px;
}

/* Assign Lecturer Modal extras */
.assign-modal {
  max-width: 560px;
}

.modal-subtitle {
  margin: 0.2rem 0 0 0;
  font-size: 0.875rem;
  color: #64748b;
  font-weight: 500;
}

.lecturer-select-wrap {
  position: relative;
}

.select-icon {
  position: absolute;
  left: 12px;
  top: 50%;
  transform: translateY(-50%);
  width: 18px;
  height: 18px;
  color: #94a3b8;
  pointer-events: none;
}

.pl-icon {
  padding-left: 2.5rem !important;
}

.form-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 14px;
}

.hint-text {
  margin: 4px 0 0 0;
  font-size: 0.8rem;
  color: #64748b;
  font-style: italic;
}

.hint-text.warn {
  color: #d97706;
}

.alert-banner {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 0.75rem 1rem;
  border-radius: 10px;
  font-size: 0.9rem;
  font-weight: 500;
  margin-top: 4px;
}

.alert-banner svg {
  width: 18px;
  height: 18px;
  flex-shrink: 0;
}

.alert-banner.success {
  background-color: #dcfce7;
  color: #166534;
  border: 1px solid #bbf7d0;
}

.alert-banner.error {
  background-color: #fee2e2;
  color: #991b1b;
  border: 1px solid #fecaca;
}

.spinner-icon {
  width: 16px;
  height: 16px;
  animation: spin 0.8s linear infinite;
}

@keyframes spin {
  from {
    transform: rotate(0deg);
  }

  to {
    transform: rotate(360deg);
  }
}

.primary-btn:disabled {
  opacity: 0.7;
  cursor: not-allowed;
  transform: none !important;
}
</style>