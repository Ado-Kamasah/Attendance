<template>
  <div class="schedule-container">
    <header class="page-header">
      <div class="header-content">
        <h1 class="page-title">Master Schedule</h1>
        <p class="page-subtitle">Manage lecture timings, venues, and instructor assignments.</p>
      </div>
      <button class="btn-primary" @click="openAddModal">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="icon">
          <line x1="12" y1="5" x2="12" y2="19"></line>
          <line x1="5" y1="12" x2="19" y2="12"></line>
        </svg>
        <span>Add Class</span>
      </button>
    </header>

    <div class="filters-panel">
      <div class="filter-section">
        <span class="filter-label">Semester</span>
        <div class="pill-group">
          <button class="filter-pill" :class="{ active: selectedSemester === 'All' }" @click="selectedSemester = 'All'">All</button>
          <button class="filter-pill" :class="{ active: selectedSemester === 'Semester 1' }" @click="selectedSemester = 'Semester 1'">Sem 1</button>
          <button class="filter-pill" :class="{ active: selectedSemester === 'Semester 2' }" @click="selectedSemester = 'Semester 2'">Sem 2</button>
        </div>
      </div>

      <div class="filter-section">
        <span class="filter-label">Academic Level</span>
        <div class="pill-group">
          <button v-for="level in levels" :key="level" 
            class="filter-pill" :class="{ active: selectedLevel === level }"
            @click="selectedLevel = level">
            Level {{ level }}
          </button>
        </div>
      </div>
      
      <div class="filter-section">
        <span class="filter-label">Session Mode</span>
        <div class="pill-group">
          <button v-for="mode in modes" :key="mode" 
            class="filter-pill" :class="{ active: selectedMode === mode }"
            @click="selectedMode = mode">
            {{ mode }}
          </button>
        </div>
      </div>
    </div>

    <div class="schedule-layout">
      <aside class="days-sidebar">
        <button v-for="day in activeDays" :key="day" 
          class="day-btn" :class="{ active: selectedDay === day }"
          @click="selectedDay = day">
          <span class="day-name">{{ day }}</span>
          <span class="class-count" v-if="getClassCount(day) > 0">{{ getClassCount(day) }}</span>
        </button>
      </aside>

      <main class="classes-area">
        <div class="classes-list" v-if="filteredClasses.length > 0">
          <div v-for="cls in filteredClasses" :key="cls.id" class="class-card">
            <div class="class-time">
              <span class="time-block">{{ formatTime(cls.startTime) }} - {{ formatTime(cls.endTime) }}</span>
              <span class="duration">{{ getDuration(cls.startTime, cls.endTime) }} hrs</span>
            </div>
            
            <div class="class-divider"></div>
            
            <div class="class-details">
              <div class="course-header">
                <span class="course-code">{{ cls.courseCode }}</span>
                <span class="semester-tag">{{ cls.semester || 'Semester 1' }}</span>
                <h3 class="course-title">{{ cls.courseTitle }}</h3>
              </div>
              <div class="meta-info">
                <span class="meta-item">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="meta-icon"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>
                  {{ cls.lecturer }}
                </span>
                <span class="meta-separator">•</span>
                <span class="meta-item">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="meta-icon"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path><circle cx="12" cy="10" r="3"></circle></svg>
                  {{ cls.venue }}
                </span>
              </div>
            </div>
            
            <div class="class-actions">
              <button class="action-btn edit" title="Edit" @click="editClass(cls)">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path></svg>
              </button>
              <button class="action-btn delete" title="Delete" @click="deleteClass(cls.id)">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>
              </button>
            </div>
          </div>
        </div>

        <div v-else class="empty-state">
          <div class="empty-icon-wrapper">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" class="empty-icon">
              <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
              <line x1="16" y1="2" x2="16" y2="6"></line>
              <line x1="8" y1="2" x2="8" y2="6"></line>
              <line x1="3" y1="10" x2="21" y2="10"></line>
            </svg>
          </div>
          <h3>No classes scheduled</h3>
          <p>No classes are arranged for {{ selectedDay }}. Click "Add Class" to schedule one.</p>
          <button class="btn-outline" @click="openAddModal">Schedule a Class</button>
        </div>
      </main>
    </div>

    <!-- Add Class Modal -->
    <div class="modal-backdrop" v-if="isModalOpen" @click.self="closeModal">
      <div class="modal-card">
        <div class="modal-header">
          <h2>{{ editingScheduleId ? 'Edit Class' : 'Add New Class' }}</h2>
          <button class="close-btn" @click="closeModal" aria-label="Close modal">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
          </button>
        </div>
        <div class="modal-body">
          <form @submit.prevent="saveClass" class="schedule-form">
            <div class="form-grid">
              <div class="form-group col-span-2">
                <label>Select Course</label>
                <select v-model="newClass.courseId" required class="form-select w-full" style="padding: 12px; border: 1px solid #cbd5e1; border-radius: 10px;">
                  <option disabled value="">Choose a course</option>
                  <option v-for="course in courses" :key="course.id" :value="course.id">
                    {{ course.code }} - {{ course.name }}
                  </option>
                </select>
              </div>
              
              <div class="form-group">
                <label>Lecturer</label>
                <select v-model="newClass.lecturer" required class="form-select">
                  <option disabled value="">Select lecturer</option>
                  <option v-for="l in lecturers" :key="l.id" :value="l.name">{{ l.name }}</option>
                </select>
                <p v-if="isLoadingLecturers" class="hint-text">Loading lecturers...</p>
<p v-else-if="lecturers.length === 0" class="hint-text warn">No lecturer accounts found. Create one first.</p>
              </div>
              
              <div class="form-group">
                <label>Venue</label>
                <input type="text" v-model="newClass.venue" placeholder="Hall/Room" required class="form-input">
              </div>
              
              <div class="form-group">
                <label>Day of Week</label>
                <select v-model="newClass.day" required class="form-select">
                  <option v-for="d in activeDays" :key="d" :value="d">{{ d }}</option>
                </select>
              </div>
              
              <div class="form-group time-group">
                <label>Timing</label>
                <div class="time-inputs">
                  <div class="time-field">
                    <span class="time-label">Start</span>
                    <input type="time" v-model="newClass.startTime" required class="form-input">
                  </div>
                  <div class="time-field">
                    <span class="time-label">End</span>
                    <input type="time" v-model="newClass.endTime" required class="form-input">
                  </div>
                </div>
              </div>
            </div>
            
            <div class="modal-footer">
              <button type="button" class="btn-ghost" @click="closeModal">Cancel</button>
              <button type="submit" class="btn-primary">{{ editingScheduleId ? 'Update Schedule' : 'Save Schedule' }}</button>
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
import { useSchedulesStore } from '@/stores/schedules';
import { useCoursesStore } from '@/stores/courses';
import { useAuditLogsStore } from '@/stores/auditlogs';
import { useAuthStore } from '@/stores/authstore';
import { supabase } from '@/stores/supabase';

const levels = ['100', '200', '300', '400'];
const modes = ['Regular', 'Weekend'];
const regularDays = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];
const weekendDays = ['Thursday', 'Friday', 'Saturday', 'Sunday'];

// Auto-detect today's day name
const todayName = new Date().toLocaleDateString('en-US', { weekday: 'long' }); // e.g. 'Wednesday'
const defaultDay = regularDays.includes(todayName) ? todayName : 'Monday';

const selectedLevel = ref('100');
const selectedMode = ref('Regular');
const selectedSemester = ref('Semester 1');
const selectedDay = ref(defaultDay); // Start on today
const isModalOpen = ref(false);
const editingScheduleId = ref(null);

const activeDays = computed(() => selectedMode.value === 'Regular' ? regularDays : weekendDays);

watch(selectedMode, (newMode) => {
  selectedDay.value = newMode === 'Regular' ? defaultDay : 'Friday';
});



const schedulesStore = useSchedulesStore();
const coursesStore = useCoursesStore();
const auditLogsStore = useAuditLogsStore();
const authStore = useAuthStore();

const { schedules } = storeToRefs(schedulesStore);
const { courses } = storeToRefs(coursesStore);

const lecturers = ref([]);
const isLoadingLecturers = ref(false);

const loadLecturers = async () => {
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

const logAudit = (action, details) => {
  const profile = authStore.profile;
  if (!profile) {
    console.warn('[Audit] No profile loaded — skipping log for:', action);
    return;
  }
  auditLogsStore.logAction({
    action,
    details,
    userId: profile.id,
    userRole: profile.role ?? 'Admin',
    userName: profile.name ?? 'Administrator',
  });
};

onMounted(async () => {
  await Promise.all([
    schedulesStore.fetchSchedules(),
    coursesStore.fetchCourses(),
    loadLecturers(),
  ]);
  schedulesStore.subscribeToSchedules();
  coursesStore.subscribeToCourses();
});

onUnmounted(() => {
  schedulesStore.unsubscribeFromSchedules();
  coursesStore.unsubscribeFromCourses();
});

const newClass = ref({
  courseId: '',
  lecturer: '',
  venue: '',
  day: 'Monday',
  startTime: '',
  endTime: ''
});

// schedules store rows only carry courseId — attach course code/title/semester
// from coursesStore for display and semester filtering.
const schedulesWithCourse = computed(() =>
  schedules.value.map((s) => {
    const course = coursesStore.getCourseById(s.courseId);
    return {
      ...s,
      courseCode: course?.code ?? 'Unknown',
      courseTitle: course?.name ?? 'Unknown course',
      semester: course?.semester || 'Semester 1',
    };
  })
);

const filteredClasses = computed(() => {
  return schedulesWithCourse.value.filter(c => 
    c.level === selectedLevel.value && 
    c.mode === selectedMode.value && 
    c.day === selectedDay.value &&
    (selectedSemester.value === 'All' || c.semester === selectedSemester.value)
  ).sort((a, b) => (a.startTime || '').localeCompare(b.startTime || ''));
});

const getClassCount = (day) => {
  return schedulesWithCourse.value.filter(c => 
    c.level === selectedLevel.value && 
    c.mode === selectedMode.value && 
    c.day === day &&
    (selectedSemester.value === 'All' || c.semester === selectedSemester.value)
  ).length;
};

const formatTime = (timeStr) => {
  if (!timeStr) return '';
  const [hours, minutes] = timeStr.split(':');
  let h = parseInt(hours, 10);
  const ampm = h >= 12 ? 'PM' : 'AM';
  h = h % 12 || 12;
  return `${h}:${minutes} ${ampm}`;
};

const getDuration = (start, end) => {
  if (!start || !end) return '';
  const startStr = String(start);
  const endStr = String(end);
  const [sH, sM] = startStr.split(':').map(Number);
  const [eH, eM] = endStr.split(':').map(Number);
  const diff = (eH * 60 + (eM || 0)) - (sH * 60 + (sM || 0));
  return (diff / 60).toFixed(1).replace('.0', '');
};

const openAddModal = () => {
  editingScheduleId.value = null;
  newClass.value = { 
    courseId: '', lecturer: '', venue: '', 
    day: selectedDay.value, startTime: '', endTime: '' 
  };
  isModalOpen.value = true;
};

// Snapshot of the schedule BEFORE editing — used to produce a before/after audit detail
const beforeEditSnapshot = ref(null);

const editClass = (cls) => {
  editingScheduleId.value = cls.id;
  // Capture the current state for diff logging
  beforeEditSnapshot.value = {
    courseCode: cls.courseCode,
    lecturer: cls.lecturer,
    venue: cls.venue,
    day: cls.day,
    startTime: cls.startTime,
    endTime: cls.endTime,
  };
  newClass.value = {
    courseId: cls.courseId,
    lecturer: cls.lecturer,
    venue: cls.venue,
    day: cls.day,
    startTime: cls.startTime,
    endTime: cls.endTime
  };
  isModalOpen.value = true;
};

const closeModal = () => {
  isModalOpen.value = false;
  editingScheduleId.value = null;
  beforeEditSnapshot.value = null;
};

const saveClass = async () => {
  try {
    const payload = {
      level: selectedLevel.value,
      mode: selectedMode.value,
      ...newClass.value
    };

    const conflict = schedulesStore.findConflict(
      {
        day: payload.day,
        startTime: payload.startTime,
        endTime: payload.endTime,
        lecturer: payload.lecturer,
        venue: payload.venue,
      },
      editingScheduleId.value
    );

    if (conflict) {
      const reason = conflict.lecturer === payload.lecturer
        ? `${payload.lecturer} is already scheduled from ${formatTime(conflict.startTime)} to ${formatTime(conflict.endTime)} on ${payload.day}, which overlaps with this slot.`
        : `${payload.venue} is already booked from ${formatTime(conflict.startTime)} to ${formatTime(conflict.endTime)} on ${payload.day}, which overlaps with this slot.`;
      // Log the rejected attempt
      logAudit(
        'schedule_conflict_rejected',
        `Rejected: tried to schedule ${payload.lecturer} in ${payload.venue} on ${payload.day} ${payload.startTime}-${payload.endTime}. Reason: ${reason}`
      );
      alert(`Scheduling conflict: ${reason}`);
      return;
    }

    const course = coursesStore.getCourseById(payload.courseId);
    const label = `${course?.code ?? 'course'} on ${payload.day} ${formatTime(payload.startTime)}-${formatTime(payload.endTime)}, venue: ${payload.venue}, lecturer: ${payload.lecturer}`;

    if (editingScheduleId.value) {
      await schedulesStore.updateSchedule(editingScheduleId.value, payload);
      // Build a before/after diff detail
      const before = beforeEditSnapshot.value;
      const changes = [];
      if (before) {
        if (before.lecturer !== payload.lecturer) changes.push(`Lecturer: "${before.lecturer}" → "${payload.lecturer}"`);
        if (before.venue !== payload.venue)     changes.push(`Venue: "${before.venue}" → "${payload.venue}"`);
        if (before.day !== payload.day)         changes.push(`Day: ${before.day} → ${payload.day}`);
        if (before.startTime !== payload.startTime || before.endTime !== payload.endTime)
          changes.push(`Time: ${formatTime(before.startTime)}-${formatTime(before.endTime)} → ${formatTime(payload.startTime)}-${formatTime(payload.endTime)}`);
      }
      const changeDetail = changes.length > 0 ? ` Changes — ${changes.join('; ')}` : '';
      logAudit('schedule_updated', `Updated class: ${label}.${changeDetail}`);
    } else {
      await schedulesStore.createSchedule(payload);
      logAudit('schedule_created', `Scheduled new class: ${label}`);
    }

    selectedDay.value = newClass.value.day;
    closeModal();
  } catch (error) {
    console.error('Error saving schedule:', error);
    logAudit('schedule_save_failed', `Failed to save schedule for ${newClass.value.lecturer ?? 'unknown'} on ${newClass.value.day}: ${error?.message ?? error}`);
    alert('Failed to save schedule');
  }
};

const deleteClass = async (id) => {
  const cls = schedulesWithCourse.value.find(c => c.id === id);
  if (!confirm(`Are you sure you want to delete this scheduled class${cls ? ` (${cls.courseCode} on ${cls.day} ${formatTime(cls.startTime)}-${formatTime(cls.endTime)})` : ''}?`)) return;

  try {
    await schedulesStore.deleteSchedule(id);
    if (cls) {
      logAudit(
        'schedule_deleted',
        `Deleted class: ${cls.courseCode} — ${cls.courseTitle} | ${cls.day} ${formatTime(cls.startTime)}-${formatTime(cls.endTime)} | Lecturer: ${cls.lecturer} | Venue: ${cls.venue}`
      );
    }
  } catch (error) {
    console.error('Error deleting schedule:', error);
    logAudit('schedule_delete_failed', `Failed to delete schedule id=${id}: ${error?.message ?? error}`);
    alert('Failed to delete schedule.');
  }
};
</script>