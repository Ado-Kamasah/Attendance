<template>
  <div class="space-y-6 p-1 sm:p-2 lg:p-4 animate-in fade-in duration-500">

    <!-- Header -->
    <div class="relative bg-white dark:bg-[#071328] border border-slate-200/80 dark:border-slate-800/80 rounded-2xl p-6 sm:p-8 shadow-sm overflow-hidden">
      <div class="absolute inset-0 bg-[radial-gradient(#031c45_1px,transparent_1px)] dark:bg-[radial-gradient(#bc9333_1px,transparent_1px)] opacity-[0.03] dark:opacity-[0.05] bg-[size:16px_16px] pointer-events-none"></div>
      <div class="absolute top-2 left-2 w-3 h-3 border-t-2 border-l-2 border-secondary/40 pointer-events-none"></div>
      <div class="absolute top-2 right-2 w-3 h-3 border-t-2 border-r-2 border-secondary/40 pointer-events-none"></div>

      <div class="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-5">
        <div>
          <div class="flex items-center gap-2 mb-1.5">
            <span class="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-mono font-medium tracking-wide uppercase bg-primary/10 text-primary dark:bg-secondary/15 dark:text-secondary border border-primary/20 dark:border-secondary/30">
              <CalendarDays class="w-3 h-3" />
              ADMIN // MASTER SCHEDULE
            </span>
          </div>
          <h1 class="text-2xl sm:text-3xl font-display font-bold text-slate-900 dark:text-white tracking-tight">Master Schedule</h1>
          <p class="text-sm text-slate-500 dark:text-slate-400 mt-1">Manage lecture timings, venues, and instructor assignments.</p>
        </div>
        <button @click="openAddModal"
          class="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-primary hover:bg-primary/90 text-white text-sm font-semibold transition-all shadow-md hover:shadow-lg active:scale-95 flex-shrink-0"
        >
          <Plus class="w-4 h-4" />
          <span>Add Class</span>
        </button>
      </div>
    </div>

    <!-- Filters Panel -->
    <div class="bg-white dark:bg-[#071328] border border-slate-200/80 dark:border-slate-800/80 rounded-2xl p-5 shadow-sm space-y-4">
      <!-- Semester pills -->
      <div class="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-5">
        <span class="text-[11px] font-mono uppercase tracking-wider text-slate-500 dark:text-slate-400 font-bold flex-shrink-0">Semester</span>
        <div class="flex flex-wrap gap-2">
          <button v-for="sem in ['All', 'Semester 1', 'Semester 2']" :key="sem"
            @click="selectedSemester = sem"
            :class="['px-3 py-1.5 rounded-lg text-xs font-mono font-semibold border transition-all',
              selectedSemester === sem
                ? 'bg-primary text-white border-primary dark:bg-secondary dark:border-secondary dark:text-primary'
                : 'bg-slate-50 dark:bg-slate-900/60 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600'
            ]">{{ sem }}
          </button>
        </div>
      </div>
      <!-- Level + Mode pills -->
      <div class="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-5">
        <span class="text-[11px] font-mono uppercase tracking-wider text-slate-500 dark:text-slate-400 font-bold flex-shrink-0">Level</span>
        <div class="flex flex-wrap gap-2">
          <button v-for="level in levels" :key="level"
            @click="selectedLevel = level"
            :class="['px-3 py-1.5 rounded-lg text-xs font-mono font-semibold border transition-all',
              selectedLevel === level
                ? 'bg-primary text-white border-primary dark:bg-secondary dark:border-secondary dark:text-primary'
                : 'bg-slate-50 dark:bg-slate-900/60 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600'
            ]">Level {{ level }}
          </button>
        </div>
        <span class="text-[11px] font-mono uppercase tracking-wider text-slate-500 dark:text-slate-400 font-bold sm:ml-4 flex-shrink-0">Mode</span>
        <div class="flex flex-wrap gap-2">
          <button v-for="mode in modes" :key="mode"
            @click="selectedMode = mode"
            :class="['px-3 py-1.5 rounded-lg text-xs font-mono font-semibold border transition-all',
              selectedMode === mode
                ? 'bg-primary text-white border-primary dark:bg-secondary dark:border-secondary dark:text-primary'
                : 'bg-slate-50 dark:bg-slate-900/60 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600'
            ]">{{ mode }}
          </button>
        </div>
      </div>
    </div>

    <!-- Schedule Layout -->
    <div class="grid grid-cols-[auto_1fr] gap-5">
      <!-- Day Sidebar -->
      <div class="flex flex-col gap-2 min-w-[110px]">
        <button
          v-for="day in activeDays"
          :key="day"
          @click="selectedDay = day"
          :class="['relative px-3 py-3 rounded-xl border text-left text-xs font-mono font-semibold transition-all',
            selectedDay === day
              ? 'bg-primary dark:bg-[#071328] border-primary/80 dark:border-secondary/60 text-white shadow-md ring-2 ring-primary/20 dark:ring-secondary/20'
              : 'bg-white dark:bg-[#071328] border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:border-slate-300 dark:hover:border-slate-700 shadow-sm'
          ]"
        >
          <div>{{ day }}</div>
          <div v-if="getClassCount(day) > 0"
            :class="['mt-1.5 inline-flex items-center justify-center w-5 h-5 rounded-full text-[10px] font-bold',
              selectedDay === day ? 'bg-white/20 text-white' : 'bg-primary/10 dark:bg-secondary/15 text-primary dark:text-secondary'
            ]"
          >{{ getClassCount(day) }}</div>
        </button>
      </div>

      <!-- Classes Area -->
      <div class="min-w-0">
        <!-- Empty -->
        <div v-if="filteredClasses.length === 0"
          class="bg-white dark:bg-[#071328] border border-dashed border-slate-200 dark:border-slate-800 rounded-2xl p-12 text-center flex flex-col items-center gap-4"
        >
          <div class="w-14 h-14 rounded-2xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-400">
            <CalendarDays class="w-7 h-7" />
          </div>
          <h3 class="font-display font-bold text-slate-900 dark:text-white text-base">No classes scheduled</h3>
          <p class="text-sm text-slate-400">No classes arranged for <strong>{{ selectedDay }}</strong>. Schedule one now.</p>
          <button @click="openAddModal"
            class="px-4 py-2 rounded-xl bg-primary hover:bg-primary/90 text-white text-xs font-semibold transition-all shadow-sm active:scale-95"
          >Schedule a Class</button>
        </div>

        <!-- Class Cards -->
        <div v-else class="space-y-4">
          <div
            v-for="cls in filteredClasses"
            :key="cls.id"
            class="group flex gap-5 bg-white dark:bg-[#071328] border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-sm hover:shadow-md transition-all"
          >
            <!-- Time column -->
            <div class="flex flex-col items-center gap-1 min-w-[70px] text-center flex-shrink-0">
              <span class="text-xs font-mono font-bold text-slate-900 dark:text-slate-100">{{ formatTime(cls.startTime) }}</span>
              <div class="w-px h-4 bg-gradient-to-b from-secondary to-transparent"></div>
              <span class="text-xs font-mono font-bold text-slate-900 dark:text-slate-100">{{ formatTime(cls.endTime) }}</span>
              <span class="text-[10px] font-mono text-slate-400 mt-1">{{ getDuration(cls.startTime, cls.endTime) }}h</span>
            </div>

            <!-- Divider -->
            <div class="w-px bg-gradient-to-b from-secondary/60 to-secondary/10 flex-shrink-0 rounded-full"></div>

            <!-- Content -->
            <div class="flex-1 min-w-0 space-y-2">
              <div class="flex items-start gap-2 flex-wrap">
                <span class="font-mono text-[11px] font-bold px-2 py-0.5 rounded bg-primary/10 text-primary dark:bg-secondary/15 dark:text-secondary">{{ cls.courseCode }}</span>
                <span class="text-[11px] font-mono px-2 py-0.5 rounded-full bg-sky-50 dark:bg-sky-950/40 text-sky-700 dark:text-sky-400 border border-sky-100 dark:border-sky-900">{{ cls.semester || 'Semester 1' }}</span>
              </div>
              <h3 class="text-sm font-bold text-slate-900 dark:text-white">{{ cls.courseTitle }}</h3>
              <div class="flex flex-wrap items-center gap-3 text-xs text-slate-500 dark:text-slate-400">
                <span class="flex items-center gap-1"><UserIcon class="w-3.5 h-3.5" /> {{ cls.lecturer }}</span>
                <span class="flex items-center gap-1"><MapPin class="w-3.5 h-3.5" /> {{ cls.venue }}</span>
              </div>
            </div>

            <!-- Actions -->
            <div class="flex items-start gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
              <button @click="editClass(cls)" title="Edit"
                class="p-1.5 text-slate-400 hover:text-primary dark:hover:text-secondary hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors">
                <Edit3 class="w-3.5 h-3.5" />
              </button>
              <button @click="deleteClass(cls.id)" title="Delete"
                class="p-1.5 text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/40 rounded-lg transition-colors">
                <Trash2 class="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Add/Edit Schedule Modal -->
    <div v-if="isModalOpen" class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200" @click.self="closeModal">
      <div class="relative w-full max-w-lg bg-white dark:bg-[#071328] border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl overflow-hidden">
        <div class="absolute top-2 left-2 w-3 h-3 border-t-2 border-l-2 border-secondary/40 pointer-events-none"></div>
        <div class="absolute top-2 right-2 w-3 h-3 border-t-2 border-r-2 border-secondary/40 pointer-events-none"></div>

        <div class="p-6 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
          <div>
            <span class="text-[10px] font-mono uppercase tracking-wider text-secondary font-bold">{{ editingScheduleId ? 'EDIT CLASS' : 'NEW CLASS' }}</span>
            <h2 class="text-xl font-display font-bold text-slate-900 dark:text-white">{{ editingScheduleId ? 'Edit Class' : 'Add New Class' }}</h2>
          </div>
          <button @click="closeModal" class="p-2 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">
            <X class="w-5 h-5" />
          </button>
        </div>

        <form @submit.prevent="saveClass" class="p-6 space-y-4">
          <!-- Course -->
          <div class="space-y-1.5">
            <label class="text-[11px] font-mono uppercase tracking-wider text-slate-500 dark:text-slate-400">Select Course <span class="text-rose-500">*</span></label>
            <select v-model="newClass.courseId" required
              class="w-full bg-slate-50 dark:bg-slate-900/80 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2.5 text-sm text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-secondary/50">
              <option disabled value="">Choose a course</option>
              <option v-for="course in courses" :key="course.id" :value="course.id">{{ course.code }} — {{ course.name }}</option>
            </select>
          </div>

          <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <!-- Lecturer -->
            <div class="space-y-1.5">
              <label class="text-[11px] font-mono uppercase tracking-wider text-slate-500 dark:text-slate-400">Lecturer <span class="text-rose-500">*</span></label>
              <select v-model="newClass.lecturer" required
                class="w-full bg-slate-50 dark:bg-slate-900/80 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2.5 text-sm text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-secondary/50">
                <option disabled value="">Select lecturer</option>
                <option v-for="l in lecturers" :key="l.id" :value="l.name">{{ l.name }}</option>
              </select>
              <p v-if="isLoadingLecturers" class="text-[10px] text-slate-400 font-mono">Loading lecturers...</p>
            </div>

            <!-- Venue -->
            <div class="space-y-1.5">
              <label class="text-[11px] font-mono uppercase tracking-wider text-slate-500 dark:text-slate-400">Venue <span class="text-rose-500">*</span></label>
              <input type="text" v-model="newClass.venue" placeholder="Hall / Room" required
                class="w-full bg-slate-50 dark:bg-slate-900/80 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2.5 text-sm text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-secondary/50 transition-all" />
            </div>
          </div>

          <div class="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <!-- Day -->
            <div class="space-y-1.5">
              <label class="text-[11px] font-mono uppercase tracking-wider text-slate-500 dark:text-slate-400">Day <span class="text-rose-500">*</span></label>
              <select v-model="newClass.day" required
                class="w-full bg-slate-50 dark:bg-slate-900/80 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2.5 text-sm text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-secondary/50">
                <option v-for="d in activeDays" :key="d" :value="d">{{ d }}</option>
              </select>
            </div>
            <!-- Start -->
            <div class="space-y-1.5">
              <label class="text-[11px] font-mono uppercase tracking-wider text-slate-500 dark:text-slate-400">Start Time <span class="text-rose-500">*</span></label>
              <input type="time" v-model="newClass.startTime" required
                class="w-full bg-slate-50 dark:bg-slate-900/80 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2.5 text-sm text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-secondary/50 transition-all" />
            </div>
            <!-- End -->
            <div class="space-y-1.5">
              <label class="text-[11px] font-mono uppercase tracking-wider text-slate-500 dark:text-slate-400">End Time <span class="text-rose-500">*</span></label>
              <input type="time" v-model="newClass.endTime" required
                class="w-full bg-slate-50 dark:bg-slate-900/80 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2.5 text-sm text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-secondary/50 transition-all" />
            </div>
          </div>

          <div class="flex items-center justify-end gap-3 pt-2">
            <button type="button" @click="closeModal" class="px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-sm font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">Cancel</button>
            <button type="submit"
              class="px-5 py-2.5 rounded-xl bg-primary hover:bg-primary/90 text-white text-sm font-semibold transition-all shadow-md active:scale-95">
              {{ editingScheduleId ? 'Update Schedule' : 'Save Schedule' }}
            </button>
          </div>
        </form>
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
import { CalendarDays, Plus, Edit3, Trash2, X, MapPin, User as UserIcon } from 'lucide-vue-next';

const levels = ['100', '200', '300', '400'];
const modes = ['Regular', 'Weekend'];
const regularDays = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];
const weekendDays = ['Thursday', 'Friday', 'Saturday', 'Sunday'];

const todayName = new Date().toLocaleDateString('en-US', { weekday: 'long' });
const defaultDay = regularDays.includes(todayName) ? todayName : 'Monday';

const selectedLevel = ref('100');
const selectedMode = ref('Regular');
const selectedSemester = ref('Semester 1');
const selectedDay = ref(defaultDay);
const isModalOpen = ref(false);
const editingScheduleId = ref(null);
const beforeEditSnapshot = ref(null);

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
    const { data, error } = await supabase.from('users').select('id, name').eq('role', 'Lecturer').order('name');
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
  if (!profile) { console.warn('[Audit] No profile loaded — skipping log for:', action); return; }
  auditLogsStore.logAction({ action, details, userId: profile.id, userRole: profile.role ?? 'Admin', userName: profile.name ?? 'Administrator' });
};

onMounted(async () => {
  await Promise.all([schedulesStore.fetchSchedules(), coursesStore.fetchCourses(), loadLecturers()]);
  schedulesStore.subscribeToSchedules();
  coursesStore.subscribeToCourses();
});

onUnmounted(() => {
  schedulesStore.unsubscribeFromSchedules();
  coursesStore.unsubscribeFromCourses();
});

const newClass = ref({ courseId: '', lecturer: '', venue: '', day: 'Monday', startTime: '', endTime: '' });

const schedulesWithCourse = computed(() =>
  schedules.value.map((s) => {
    const course = coursesStore.getCourseById(s.courseId);
    return { ...s, courseCode: course?.code ?? 'Unknown', courseTitle: course?.name ?? 'Unknown course', semester: course?.semester || 'Semester 1' };
  })
);

const filteredClasses = computed(() =>
  schedulesWithCourse.value.filter(c =>
    c.level === selectedLevel.value && c.mode === selectedMode.value && c.day === selectedDay.value &&
    (selectedSemester.value === 'All' || c.semester === selectedSemester.value)
  ).sort((a, b) => (a.startTime || '').localeCompare(b.startTime || ''))
);

const getClassCount = (day) =>
  schedulesWithCourse.value.filter(c =>
    c.level === selectedLevel.value && c.mode === selectedMode.value && c.day === day &&
    (selectedSemester.value === 'All' || c.semester === selectedSemester.value)
  ).length;

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
  const [sH, sM] = String(start).split(':').map(Number);
  const [eH, eM] = String(end).split(':').map(Number);
  const diff = (eH * 60 + (eM || 0)) - (sH * 60 + (sM || 0));
  return (diff / 60).toFixed(1).replace('.0', '');
};

const openAddModal = () => {
  editingScheduleId.value = null;
  newClass.value = { courseId: '', lecturer: '', venue: '', day: selectedDay.value, startTime: '', endTime: '' };
  isModalOpen.value = true;
};

const editClass = (cls) => {
  editingScheduleId.value = cls.id;
  beforeEditSnapshot.value = { courseCode: cls.courseCode, lecturer: cls.lecturer, venue: cls.venue, day: cls.day, startTime: cls.startTime, endTime: cls.endTime };
  newClass.value = { courseId: cls.courseId, lecturer: cls.lecturer, venue: cls.venue, day: cls.day, startTime: cls.startTime, endTime: cls.endTime };
  isModalOpen.value = true;
};

const closeModal = () => { isModalOpen.value = false; editingScheduleId.value = null; beforeEditSnapshot.value = null; };

const saveClass = async () => {
  try {
    const payload = { level: selectedLevel.value, mode: selectedMode.value, ...newClass.value };
    const conflict = schedulesStore.findConflict({ day: payload.day, startTime: payload.startTime, endTime: payload.endTime, lecturer: payload.lecturer, venue: payload.venue }, editingScheduleId.value);
    if (conflict) {
      const reason = conflict.lecturer === payload.lecturer
        ? `${payload.lecturer} is already scheduled from ${formatTime(conflict.startTime)} to ${formatTime(conflict.endTime)} on ${payload.day}.`
        : `${payload.venue} is already booked from ${formatTime(conflict.startTime)} to ${formatTime(conflict.endTime)} on ${payload.day}.`;
      logAudit('schedule_conflict_rejected', `Rejected: ${payload.lecturer} in ${payload.venue} on ${payload.day} ${payload.startTime}-${payload.endTime}. Reason: ${reason}`);
      alert(`Scheduling conflict: ${reason}`);
      return;
    }
    const course = coursesStore.getCourseById(payload.courseId);
    const label = `${course?.code ?? 'course'} on ${payload.day} ${formatTime(payload.startTime)}-${formatTime(payload.endTime)}, venue: ${payload.venue}, lecturer: ${payload.lecturer}`;
    if (editingScheduleId.value) {
      await schedulesStore.updateSchedule(editingScheduleId.value, payload);
      const before = beforeEditSnapshot.value;
      const changes = [];
      if (before) {
        if (before.lecturer !== payload.lecturer) changes.push(`Lecturer: "${before.lecturer}" → "${payload.lecturer}"`);
        if (before.venue !== payload.venue) changes.push(`Venue: "${before.venue}" → "${payload.venue}"`);
        if (before.day !== payload.day) changes.push(`Day: ${before.day} → ${payload.day}`);
        if (before.startTime !== payload.startTime || before.endTime !== payload.endTime)
          changes.push(`Time: ${formatTime(before.startTime)}-${formatTime(before.endTime)} → ${formatTime(payload.startTime)}-${formatTime(payload.endTime)}`);
      }
      logAudit('schedule_updated', `Updated class: ${label}.${changes.length ? ` Changes — ${changes.join('; ')}` : ''}`);
    } else {
      await schedulesStore.createSchedule(payload);
      logAudit('schedule_created', `Scheduled new class: ${label}`);
    }
    selectedDay.value = newClass.value.day;
    closeModal();
  } catch (error) {
    console.error('Error saving schedule:', error);
    alert('Failed to save schedule');
  }
};

const deleteClass = async (id) => {
  const cls = schedulesWithCourse.value.find(c => c.id === id);
  if (!confirm(`Delete this scheduled class${cls ? ` (${cls.courseCode} on ${cls.day} ${formatTime(cls.startTime)}-${formatTime(cls.endTime)})` : ''}?`)) return;
  try {
    await schedulesStore.deleteSchedule(id);
    if (cls) logAudit('schedule_deleted', `Deleted class: ${cls.courseCode} — ${cls.courseTitle} | ${cls.day} ${formatTime(cls.startTime)}-${formatTime(cls.endTime)} | ${cls.lecturer} | ${cls.venue}`);
  } catch (error) {
    console.error('Error deleting schedule:', error);
    alert('Failed to delete schedule.');
  }
};
</script>