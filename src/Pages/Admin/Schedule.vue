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

<style scoped>
.schedule-container {
  max-width: 1200px;
  margin: 0 auto;
  display: flex;
  flex-direction: column;
  gap: 24px;
  width: 100%;
  box-sizing: border-box;
}

/* Header */
.page-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-end;
  background: white;
  padding: 24px 32px;
  border-radius: 16px;
  box-shadow: 0 4px 20px rgba(0,0,0,0.03);
}

.page-title {
  font-size: 1.8rem;
  font-weight: 800;
  color: #0f172a;
  margin: 0 0 8px 0;
  letter-spacing: -0.02em;
}

.page-subtitle {
  color: #64748b;
  margin: 0;
  font-size: 1rem;
}

/* Buttons */
.btn-primary {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  background: linear-gradient(135deg, #6366f1 0%, #4f46e5 100%);
  color: white;
  border: none;
  padding: 12px 24px;
  border-radius: 10px;
  font-weight: 600;
  font-size: 0.95rem;
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  box-shadow: 0 4px 12px rgba(99, 102, 241, 0.25);
  white-space: nowrap;
  flex-shrink: 0;
}

.btn-primary:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 16px rgba(99, 102, 241, 0.35);
}

.btn-primary .icon {
  width: 20px;
  height: 20px;
  flex-shrink: 0;
}

.btn-outline {
  background: transparent;
  border: 2px solid #e2e8f0;
  color: #475569;
  padding: 10px 20px;
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
  margin-top: 16px;
}

.btn-outline:hover {
  border-color: #6366f1;
  color: #6366f1;
}

.btn-ghost {
  background: transparent;
  border: none;
  color: #64748b;
  padding: 10px 20px;
  border-radius: 8px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-ghost:hover {
  background: #f1f5f9;
  color: #334155;
}

/* Filters */
.filters-panel {
  display: flex;
  gap: 32px;
  background: white;
  padding: 20px 32px;
  border-radius: 16px;
  box-shadow: 0 4px 20px rgba(0,0,0,0.03);
  flex-wrap: wrap;
}

.filter-section {
  display: flex;
  align-items: center;
  gap: 16px;
  flex-wrap: wrap;
}

.filter-label {
  font-size: 0.85rem;
  font-weight: 700;
  text-transform: uppercase;
  color: #94a3b8;
  letter-spacing: 0.05em;
  white-space: nowrap;
}

.pill-group {
  display: flex;
  background: #f8fafc;
  padding: 4px;
  border-radius: 10px;
  border: 1px solid #e2e8f0;
  flex-wrap: wrap;
}

.filter-pill {
  border: none;
  background: transparent;
  padding: 8px 16px;
  border-radius: 6px;
  font-weight: 600;
  font-size: 0.9rem;
  color: #64748b;
  cursor: pointer;
  transition: all 0.2s;
  white-space: nowrap;
}

.filter-pill:hover {
  color: #334155;
}

.filter-pill.active {
  background: white;
  color: #0f172a;
  box-shadow: 0 2px 6px rgba(0,0,0,0.05);
}

/* Layout */
.schedule-layout {
  display: flex;
  gap: 24px;
  align-items: flex-start;
}

/* Days Sidebar */
.days-sidebar {
  display: flex;
  flex-direction: column;
  gap: 8px;
  width: 220px;
  flex-shrink: 0;
}

.day-btn {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 14px 20px;
  background: white;
  border: 1px solid transparent;
  border-radius: 12px;
  cursor: pointer;
  transition: all 0.2s;
  box-shadow: 0 2px 10px rgba(0,0,0,0.02);
}

.day-btn .day-name {
  font-weight: 600;
  color: #475569;
  font-size: 1rem;
}

.day-btn .class-count {
  background: #f1f5f9;
  color: #64748b;
  font-size: 0.75rem;
  font-weight: 700;
  padding: 2px 8px;
  border-radius: 20px;
}

.day-btn:hover {
  transform: translateX(4px);
  background: #f8fafc;
}

.day-btn.active {
  background: #6366f1;
  border-color: #6366f1;
  box-shadow: 0 4px 12px rgba(99, 102, 241, 0.2);
}

.day-btn.active .day-name {
  color: white;
}

.day-btn.active .class-count {
  background: rgba(255,255,255,0.2);
  color: white;
}

/* Classes Area */
.classes-area {
  flex: 1;
  min-width: 0;
}

.classes-list {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.class-card {
  display: flex;
  background: white;
  border-radius: 16px;
  padding: 20px;
  box-shadow: 0 4px 15px rgba(0,0,0,0.03);
  transition: transform 0.2s, box-shadow 0.2s;
  border: 1px solid #f1f5f9;
  position: relative;
  overflow: hidden;
}

.class-card::before {
  content: '';
  position: absolute;
  left: 0;
  top: 0;
  bottom: 0;
  width: 4px;
  background: #6366f1;
  border-radius: 4px 0 0 4px;
}

.class-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 25px rgba(0,0,0,0.06);
}

.class-time {
  display: flex;
  flex-direction: column;
  justify-content: center;
  min-width: 140px;
}

.time-block {
  font-weight: 700;
  color: #0f172a;
  font-size: 1.1rem;
}

.duration {
  color: #64748b;
  font-size: 0.85rem;
  font-weight: 500;
  margin-top: 4px;
}

.class-divider {
  width: 1px;
  background: #e2e8f0;
  margin: 0 20px;
}

.class-details {
  flex: 1;
  display: flex;
  flex-direction: column;
  justify-content: center;
  min-width: 0;
}

.course-header {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 8px;
  flex-wrap: wrap;
}

.course-code {
  background: #e0e7ff;
  color: #4338ca;
  font-size: 0.75rem;
  font-weight: 700;
  padding: 4px 8px;
  border-radius: 6px;
  letter-spacing: 0.05em;
  white-space: nowrap;
}

.course-title {
  margin: 0;
  font-size: 1.1rem;
  font-weight: 700;
  color: #1e293b;
  overflow-wrap: anywhere;
}

.semester-tag {
  background: #f1f5f9;
  color: #475569;
  font-size: 0.7rem;
  font-weight: 600;
  padding: 4px 8px;
  border-radius: 6px;
  letter-spacing: 0.05em;
  white-space: nowrap;
}

.meta-info {
  display: flex;
  align-items: center;
  gap: 12px;
  color: #64748b;
  font-size: 0.9rem;
  flex-wrap: wrap;
}

.meta-item {
  display: flex;
  align-items: center;
  gap: 6px;
}

.meta-icon {
  width: 16px;
  height: 16px;
  color: #94a3b8;
  flex-shrink: 0;
}

.meta-separator {
  color: #cbd5e1;
}

.class-actions {
  display: flex;
  gap: 8px;
  align-items: flex-start;
  opacity: 0;
  transition: opacity 0.2s;
  flex-shrink: 0;
}

.class-card:hover .class-actions {
  opacity: 1;
}

.action-btn {
  background: transparent;
  border: none;
  width: 36px;
  height: 36px;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  color: #94a3b8;
  transition: all 0.2s;
}

.action-btn:hover {
  background: #f1f5f9;
  color: #334155;
}

.action-btn.delete:hover {
  background: #fee2e2;
  color: #ef4444;
}

.action-btn svg {
  width: 18px;
  height: 18px;
}

/* Empty State */
.empty-state {
  background: white;
  border-radius: 16px;
  padding: 4rem 2rem;
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  border: 1px dashed #cbd5e1;
}

.empty-icon-wrapper {
  background: #f8fafc;
  width: 80px;
  height: 80px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 20px;
}

.empty-icon {
  width: 40px;
  height: 40px;
  color: #94a3b8;
}

.empty-state h3 {
  margin: 0 0 8px 0;
  font-size: 1.4rem;
  color: #1e293b;
}

.empty-state p {
  color: #64748b;
  margin: 0;
  max-width: 400px;
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
  max-width: 600px;
  max-height: calc(100vh - 40px);
  overflow-y: auto;
  box-shadow: 0 20px 40px rgba(0,0,0,0.1);
  animation: modalIn 0.3s cubic-bezier(0.16, 1, 0.3, 1);
}

@keyframes modalIn {
  0% { transform: translateY(20px); opacity: 0; }
  100% { transform: translateY(0); opacity: 1; }
}

.modal-header {
  padding: 24px 32px;
  border-bottom: 1px solid #f1f5f9;
  display: flex;
  justify-content: space-between;
  align-items: center;
  position: sticky;
  top: 0;
  background: white;
  z-index: 1;
}

.modal-header h2 {
  margin: 0;
  font-size: 1.4rem;
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
  flex-shrink: 0;
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
  padding: 32px;
}

.schedule-form {
  display: flex;
  flex-direction: column;
}

.form-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 24px;
}

.col-span-2 {
  grid-column: span 2;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 8px;
  min-width: 0;
}

.form-group label {
  font-size: 0.85rem;
  font-weight: 600;
  color: #475569;
}

.input-group-row {
  display: flex;
  gap: 16px;
}

.flex-1 { flex: 1; }
.flex-2 { flex: 2; }

.form-input, .form-select {
  padding: 12px 16px;
  border: 1px solid #cbd5e1;
  border-radius: 10px;
  font-family: inherit;
  font-size: 0.95rem;
  color: #0f172a;
  outline: none;
  transition: all 0.2s;
  background: #fff;
  width: 100%;
  box-sizing: border-box;
}

.form-input:focus, .form-select:focus {
  border-color: #6366f1;
  box-shadow: 0 0 0 3px rgba(99, 102, 241, 0.1);
}

.form-input::placeholder {
  color: #94a3b8;
}

.time-group {
  grid-column: span 2;
}

.time-inputs {
  display: flex;
  gap: 16px;
}

.time-field {
  flex: 1;
  display: flex;
  align-items: center;
  gap: 12px;
  background: #f8fafc;
  padding: 8px 16px;
  border-radius: 10px;
  border: 1px solid #e2e8f0;
  min-width: 0;
}

.time-label {
  font-size: 0.9rem;
  font-weight: 500;
  color: #64748b;
  width: 40px;
  flex-shrink: 0;
}

.time-field .form-input {
  flex: 1;
  border: none;
  background: transparent;
  padding: 4px 0;
  min-width: 0;
}

.time-field .form-input:focus {
  box-shadow: none;
}

.time-field:focus-within {
  border-color: #6366f1;
  background: white;
}

.modal-footer {
  margin-top: 32px;
  padding-top: 24px;
  border-top: 1px solid #f1f5f9;
  display: flex;
  justify-content: flex-end;
  gap: 12px;
}

/* ══════════════════════════════════════════════════════
   RESPONSIVE BREAKPOINTS
   S  : ≤ 375px   (small phones)
   M  : 376–480px (large phones)
   L  : 481–767px (phablets / small tablets, portrait)
   Tab: 768–991px (tablets)
   Lap: 992–1199px (small laptops)
   ══════════════════════════════════════════════════════ */

/* ── Small laptops (≤1199px) ── */
@media (max-width: 1199px) {
  .page-header { padding: 22px 28px; }
  .filters-panel { padding: 18px 28px; gap: 24px; }
  .modal-body { padding: 28px; }
}

/* ── Tablets (≤991px) ── */
@media (max-width: 991px) {
  .schedule-layout {
    flex-direction: column;
  }
  .filters-panel {
    flex-direction: column;
    align-items: flex-start;
    gap: 16px;
  }
  .days-sidebar {
    flex-direction: row;
    overflow-x: auto;
    width: 100%;
    padding-bottom: 8px;
  }
  .day-btn {
    flex-shrink: 0;
  }
  .form-grid {
    grid-template-columns: 1fr 1fr;
  }
}

/* ── Large phones / small tablets, portrait (≤767px) ── */
@media (max-width: 767px) {
  .schedule-container { gap: 18px; }

  .page-header {
    flex-direction: column;
    align-items: stretch;
    gap: 16px;
    padding: 18px 20px;
    border-radius: 12px;
  }
  .page-title { font-size: 1.4rem; margin-bottom: 4px; }
  .page-subtitle { font-size: 0.9rem; }
  .btn-primary {
    width: 100%;
    justify-content: center;
    padding: 12px 20px;
  }

  .filters-panel {
    padding: 16px;
    border-radius: 12px;
  }
  .filter-section {
    flex-direction: column;
    align-items: flex-start;
    gap: 8px;
    width: 100%;
  }
  .pill-group {
    width: 100%;
    overflow-x: auto;
  }

  .class-card {
    flex-direction: column;
    padding: 16px;
    border-radius: 12px;
  }
  .class-time {
    flex-direction: row;
    align-items: baseline;
    justify-content: space-between;
    min-width: 0;
    width: 100%;
  }
  .class-divider {
    width: 100%;
    height: 1px;
    margin: 14px 0;
  }
  .course-header {
    gap: 8px;
  }
  .course-title { font-size: 1rem; }
  .class-actions {
    opacity: 1;
    justify-content: flex-end;
    width: 100%;
    margin-top: 12px;
    padding-top: 12px;
    border-top: 1px solid #f1f5f9;
  }

  .empty-state { padding: 3rem 1.25rem; }
  .empty-state h3 { font-size: 1.2rem; }

  .modal-backdrop { padding: 0; align-items: flex-end; }
  .modal-card {
    max-width: 100%;
    max-height: 92vh;
    border-radius: 20px 20px 0 0;
  }
  .modal-header { padding: 18px 20px; }
  .modal-header h2 { font-size: 1.2rem; }
  .modal-body { padding: 20px; }

  .form-grid {
    grid-template-columns: 1fr;
    gap: 16px;
  }
  .col-span-2, .time-group {
    grid-column: span 1;
  }
  .time-inputs {
    flex-direction: column;
    gap: 10px;
  }

  .modal-footer {
    flex-direction: column-reverse;
    margin-top: 24px;
    padding-top: 18px;
  }
  .modal-footer .btn-ghost,
  .modal-footer .btn-primary {
    width: 100%;
  }
}

/* ── Large phones (≤480px) ── */
@media (max-width: 480px) {
  .page-title { font-size: 1.2rem; }

  .filter-label { font-size: 0.75rem; }
  .filter-pill { padding: 7px 12px; font-size: 0.82rem; }

  .day-btn { padding: 12px 16px; }
  .day-btn .day-name { font-size: 0.9rem; }

  .time-block { font-size: 0.95rem; }
  .duration { font-size: 0.78rem; }

  .course-code, .semester-tag { font-size: 0.68rem; padding: 3px 6px; }
  .meta-info { font-size: 0.82rem; gap: 8px; }

  .action-btn { width: 32px; height: 32px; }
  .action-btn svg { width: 16px; height: 16px; }

  .empty-icon-wrapper { width: 64px; height: 64px; }
  .empty-icon { width: 32px; height: 32px; }
}

/* ── Small phones (≤375px) ── */
@media (max-width: 375px) {
  .page-header { padding: 16px; }
  .filters-panel { padding: 14px; }
  .modal-header { padding: 16px; }
  .modal-body { padding: 16px; }

  .class-card { padding: 14px; }

  .form-input, .form-select { padding: 10px 12px; font-size: 0.9rem; }
  .time-field { padding: 6px 12px; }
}
</style>