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
      <!-- Faculty / Program select -->
<div class="form-group">
  <label for="programme">Faculty / Program</label>
  <select id="programme" v-model="newCourse.programId" required class="form-control">
    <option value="" disabled>Select your faculty/program</option>
    <option v-for="programme in programmes" :key="programme.id" :value="programme.id">
      {{ programme.name }}
    </option>
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
// newCourse state
const newCourse = ref({
  code: '',
  name: '',
  credits: 3,
  programId: '',        // was: program: ''
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

// openModal
const openModal = () => {
  editingCourseId.value = null;
  newCourse.value = { code: '', name: '', credits: 3, programId: '', semester: 'Semester 1', level: '100' };
  isModalOpen.value = true;
};

// editCourse
const editCourse = (course) => {
  editingCourseId.value = course.id;
  newCourse.value = {
    code: course.code,
    name: course.name,
    credits: course.credits,
    programId: course.programId,   // matches mapCourse() output
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