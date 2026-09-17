<template>
  <div class="space-y-8 p-1 sm:p-2 lg:p-4 animate-in fade-in duration-500">

    <!-- Header -->
    <div class="relative bg-white dark:bg-[#071328] border border-slate-200/80 dark:border-slate-800/80 rounded-2xl p-6 sm:p-8 shadow-sm overflow-hidden">
      <div class="absolute inset-0 bg-[radial-gradient(#031c45_1px,transparent_1px)] dark:bg-[radial-gradient(#bc9333_1px,transparent_1px)] opacity-[0.03] dark:opacity-[0.05] bg-[size:16px_16px] pointer-events-none"></div>
      <div class="corner-tl absolute top-2 left-2 w-3 h-3 border-t-2 border-l-2 border-secondary/40 pointer-events-none"></div>
      <div class="corner-tr absolute top-2 right-2 w-3 h-3 border-t-2 border-r-2 border-secondary/40 pointer-events-none"></div>

      <div class="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-5">
        <div>
          <div class="flex items-center gap-2 mb-1.5">
            <span class="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-mono font-medium tracking-wide uppercase bg-primary/10 text-primary dark:bg-secondary/15 dark:text-secondary border border-primary/20 dark:border-secondary/30">
              <BookOpen class="w-3 h-3" />
              ADMIN // COURSE REGISTRY
            </span>
          </div>
          <h1 class="text-2xl sm:text-3xl font-display font-bold text-slate-900 dark:text-white tracking-tight">Course Management</h1>
          <p class="text-sm text-slate-500 dark:text-slate-400 mt-1">Manage all university courses, assign lecturers, and track academic schedules.</p>
        </div>
        <button @click="openModal"
          class="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-primary hover:bg-primary/90 text-white text-sm font-semibold transition-all shadow-md hover:shadow-lg active:scale-95 flex-shrink-0"
        >
          <Plus class="w-4 h-4" />
          <span>Add New Course</span>
        </button>
      </div>
    </div>

    <!-- Search & Filter -->
    <div class="bg-white dark:bg-[#071328] border border-slate-200/80 dark:border-slate-800/80 rounded-2xl p-5 shadow-sm flex flex-col sm:flex-row gap-3">
      <div class="flex-1 relative">
        <Search class="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
        <input type="text" v-model="searchQuery" placeholder="Search course code or name..."
          class="w-full pl-10 py-2.5 pr-4 bg-slate-50 dark:bg-slate-900/80 border border-slate-200 dark:border-slate-700 rounded-xl text-sm text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-secondary/50 focus:border-secondary transition-all" />
      </div>
      <select v-model="levelFilter"
        class="bg-slate-50 dark:bg-slate-900/80 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2.5 text-sm text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-secondary/50">
        <option value="all">All Levels</option>
        <option value="100">Level 100</option>
        <option value="200">Level 200</option>
        <option value="300">Level 300</option>
        <option value="400">Level 400</option>
      </select>
      <select v-model="statusFilter"
        class="bg-slate-50 dark:bg-slate-900/80 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2.5 text-sm text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-secondary/50">
        <option value="all">All Statuses</option>
        <option value="active">Active</option>
        <option value="archived">Archived</option>
      </select>
      <button v-if="searchQuery || levelFilter !== 'all' || statusFilter !== 'all'" @click="clearFilters"
        class="px-4 py-2.5 rounded-xl border border-rose-200 dark:border-rose-800 text-rose-600 dark:text-rose-400 text-sm font-medium hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-all flex items-center gap-1.5"
      >
        <RotateCcw class="w-3.5 h-3.5" /> Reset
      </button>
    </div>

    <!-- Courses Table -->
    <div class="bg-white dark:bg-[#071328] border border-slate-200/80 dark:border-slate-800/80 rounded-2xl shadow-sm overflow-hidden">
      <div class="overflow-x-auto">
        <table class="w-full text-left border-collapse text-xs">
          <thead>
            <tr class="bg-slate-50/80 dark:bg-slate-900/50 border-b border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400 font-mono uppercase text-[11px] tracking-wider">
              <th class="py-3 px-4 font-semibold">Course Code</th>
              <th class="py-3 px-4 font-semibold">Course Name</th>
              <th class="py-3 px-4 font-semibold">Semester</th>
              <th class="py-3 px-4 font-semibold">Level</th>
              <th class="py-3 px-4 font-semibold">Lecturer</th>
              <th class="py-3 px-4 font-semibold">Status</th>
              <th class="py-3 px-4 font-semibold text-right">Actions</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-slate-100 dark:divide-slate-800/60 font-sans">
            <tr v-if="isLoading">
              <td colspan="7" class="py-16 text-center">
                <div class="flex flex-col items-center gap-3 text-slate-400">
                  <Loader2 class="w-8 h-8 animate-spin text-secondary" />
                  <span class="text-xs font-mono">LOADING COURSES...</span>
                </div>
              </td>
            </tr>
            <tr v-else-if="filteredCourses.length === 0">
              <td colspan="7" class="py-16 text-center">
                <div class="flex flex-col items-center gap-3 text-slate-400">
                  <BookOpen class="w-10 h-10" />
                  <span class="text-sm">{{ 'No courses found matching your criteria.' }}</span>
                  <button v-if="searchQuery || levelFilter !== 'all' || statusFilter !== 'all'" @click="clearFilters"
                    class="text-xs text-primary dark:text-secondary underline">Clear Filters</button>
                </div>
              </td>
            </tr>
            <tr v-else v-for="course in filteredCourses" :key="course.id" class="hover:bg-slate-50/60 dark:hover:bg-slate-800/30 transition-colors">
              <td class="py-3.5 px-4">
                <span class="font-mono text-xs font-bold px-2 py-0.5 rounded bg-primary/10 text-primary dark:bg-secondary/15 dark:text-secondary">{{ course.code }}</span>
              </td>
              <td class="py-3.5 px-4 font-medium text-slate-900 dark:text-slate-100">{{ course.name }}</td>
              <td class="py-3.5 px-4 text-slate-500 dark:text-slate-400">{{ course.semester || 'Semester 1' }}</td>
              <td class="py-3.5 px-4">
                <span class="font-mono text-[11px] font-bold px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400">L{{ course.level }}</span>
              </td>
              <td class="py-3.5 px-4">
                <div class="flex items-center gap-2">
                  <div v-if="course.lecturer" class="w-6 h-6 rounded-lg bg-violet-100 dark:bg-violet-950/50 text-violet-700 dark:text-violet-400 flex items-center justify-center text-[10px] font-bold uppercase">
                    {{ course.lecturer.charAt(0) }}
                  </div>
                  <span class="text-slate-600 dark:text-slate-400 text-xs">{{ course.lecturer || 'No Lecturer Assigned' }}</span>
                </div>
              </td>
              <td class="py-3.5 px-4">
                <span :class="['inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-mono font-bold border',
                  course.status === 'active'
                    ? 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-400 dark:border-emerald-800'
                    : 'bg-slate-100 text-slate-500 border-slate-200 dark:bg-slate-800 dark:text-slate-400 dark:border-slate-700'
                ]">
                  <span class="w-1.5 h-1.5 rounded-full" :class="course.status === 'active' ? 'bg-emerald-500' : 'bg-slate-400'"></span>
                  {{ course.status === 'active' ? 'Active' : 'Archived' }}
                </span>
              </td>
              <td class="py-3.5 px-4">
                <div class="flex items-center justify-end gap-1.5">
                  <button @click="editCourse(course)" title="Edit Course"
                    class="p-1.5 text-slate-400 hover:text-primary dark:hover:text-secondary hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors">
                    <Edit3 class="w-3.5 h-3.5" />
                  </button>
                  <button v-if="course.status !== 'archived'" @click="archiveCourse(course.id)" title="Archive Course"
                    class="p-1.5 text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/40 rounded-lg transition-colors">
                    <Archive class="w-3.5 h-3.5" />
                  </button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- Footer -->
      <div v-if="!isLoading" class="px-4 py-3 border-t border-slate-100 dark:border-slate-800 text-xs text-slate-500 dark:text-slate-400 font-mono">
        Showing <strong class="text-slate-700 dark:text-slate-300">{{ filteredCourses.length }}</strong> of <strong class="text-slate-700 dark:text-slate-300">{{ courses.length }}</strong> courses
      </div>
    </div>

    <!-- Add/Edit Course Modal -->
    <div v-if="isModalOpen" class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200" @click.self="closeModal">
      <div class="relative w-full max-w-lg bg-white dark:bg-[#071328] border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl overflow-hidden">
        <div class="corner-tl absolute top-2 left-2 w-3 h-3 border-t-2 border-l-2 border-secondary/40 pointer-events-none"></div>
        <div class="corner-tr absolute top-2 right-2 w-3 h-3 border-t-2 border-r-2 border-secondary/40 pointer-events-none"></div>

        <div class="p-6 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
          <div>
            <span class="text-[10px] font-mono uppercase tracking-wider text-secondary font-bold">{{ editingCourseId ? 'EDIT COURSE' : 'NEW COURSE' }}</span>
            <h2 class="text-xl font-display font-bold text-slate-900 dark:text-white">{{ editingCourseId ? 'Edit Course' : 'Add New Course' }}</h2>
          </div>
          <button @click="closeModal" class="p-2 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">
            <X class="w-5 h-5" />
          </button>
        </div>

        <form @submit.prevent="saveCourse" class="p-6 space-y-4">
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div class="space-y-1.5">
              <label class="text-[11px] font-mono uppercase tracking-wider text-slate-500 dark:text-slate-400">Course Code <span class="text-rose-500">*</span></label>
              <input type="text" v-model="newCourse.code" placeholder="e.g. CSC 101" required
                class="w-full bg-slate-50 dark:bg-slate-900/80 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2.5 text-sm text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-secondary/50 transition-all" />
            </div>
            <div class="space-y-1.5">
              <label class="text-[11px] font-mono uppercase tracking-wider text-slate-500 dark:text-slate-400">Credits <span class="text-rose-500">*</span></label>
              <input type="number" v-model.number="newCourse.credits" placeholder="e.g. 3" required min="1"
                class="w-full bg-slate-50 dark:bg-slate-900/80 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2.5 text-sm text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-secondary/50 transition-all" />
            </div>
          </div>

          <div class="space-y-1.5">
            <label class="text-[11px] font-mono uppercase tracking-wider text-slate-500 dark:text-slate-400">Course Name <span class="text-rose-500">*</span></label>
            <input type="text" v-model="newCourse.name" placeholder="e.g. Intro to Computer Science" required
              class="w-full bg-slate-50 dark:bg-slate-900/80 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2.5 text-sm text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-secondary/50 transition-all" />
          </div>

          <div class="space-y-1.5">
            <label for="programme" class="text-[11px] font-mono uppercase tracking-wider text-slate-500 dark:text-slate-400">Faculty / Program <span class="text-rose-500">*</span></label>
            <select id="programme" v-model="newCourse.programId" required
              class="w-full bg-slate-50 dark:bg-slate-900/80 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2.5 text-sm text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-secondary/50">
              <option value="" disabled>Select your faculty/program</option>
              <option v-for="programme in programmes" :key="programme.id" :value="programme.id">{{ programme.name }}</option>
            </select>
          </div>

          <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div class="space-y-1.5">
              <label class="text-[11px] font-mono uppercase tracking-wider text-slate-500 dark:text-slate-400">Semester <span class="text-rose-500">*</span></label>
              <select v-model="newCourse.semester" required
                class="w-full bg-slate-50 dark:bg-slate-900/80 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2.5 text-sm text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-secondary/50">
                <option value="Semester 1">Semester 1</option>
                <option value="Semester 2">Semester 2</option>
              </select>
            </div>
            <div class="space-y-1.5">
              <label class="text-[11px] font-mono uppercase tracking-wider text-slate-500 dark:text-slate-400">Level <span class="text-rose-500">*</span></label>
              <select v-model="newCourse.level" required
                class="w-full bg-slate-50 dark:bg-slate-900/80 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2.5 text-sm text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-secondary/50">
                <option value="100">100</option>
                <option value="200">200</option>
                <option value="300">300</option>
                <option value="400">400</option>
              </select>
            </div>
          </div>

          <div class="flex items-center justify-end gap-3 pt-2">
            <button type="button" @click="closeModal" class="px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-sm font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">Cancel</button>
            <button type="submit" :disabled="isSavingCourse"
              class="px-5 py-2.5 rounded-xl bg-primary hover:bg-primary/90 text-white text-sm font-semibold transition-all shadow-md inline-flex items-center gap-2 disabled:opacity-50 active:scale-95">
              <Loader2 v-if="isSavingCourse" class="w-4 h-4 animate-spin" />
              <span>{{ isSavingCourse ? 'Saving...' : (editingCourseId ? 'Update Course' : 'Save Course') }}</span>
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
import { useCoursesStore } from '@/stores/courses';
import { useAuthStore } from '@/stores/authstore';
import { useAuditLogsStore } from '@/stores/auditlogs';
import { supabase } from '@/stores/supabase';
import { BookOpen, Plus, Search, RotateCcw, Edit3, Archive, X, Loader2 } from 'lucide-vue-next';

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
const newCourse = ref({ code: '', name: '', credits: 3, programId: '', semester: 'Semester 1', level: '100' });

const programmes = ref([]);

// schedules aren't owned by coursesStore — course_id -> { lecturer, summary }
const schedulesByCourseId = ref({});

const fetchSchedules = async () => {
  const ids = courses.value.map((c) => c.id);
  if (ids.length === 0) { schedulesByCourseId.value = {}; return; }
  const { data, error } = await supabase.from('schedules').select('*').in('course_id', ids).order('created_at', { ascending: false });
  if (error) { console.error('Failed to load schedules:', error); return; }
  const map = {};
  for (const row of data ?? []) {
    if (!map[row.course_id]) {
      map[row.course_id] = { lecturer: row.lecturer, summary: `${row.day} ${row.start_time}-${row.end_time}, ${row.venue}` };
    }
  }
  schedulesByCourseId.value = map;
};

watch(courses, fetchSchedules, { deep: true });

onMounted(async () => {
  await coursesStore.fetchCourses();
  coursesStore.subscribeToCourses();
  const { data, error } = await supabase.from('programmes').select('id, name').order('name');
  if (error) { console.error('Failed to load faculties', error); return; }
  programmes.value = data;
});

onUnmounted(() => { coursesStore.unsubscribeFromCourses(); });

const coursesWithSchedule = computed(() =>
  courses.value.map((course) => ({
    ...course,
    lecturer: schedulesByCourseId.value[course.id]?.lecturer ?? null,
    schedule: schedulesByCourseId.value[course.id]?.summary ?? null,
  }))
);

const openModal = () => {
  editingCourseId.value = null;
  newCourse.value = { code: '', name: '', credits: 3, programId: '', semester: 'Semester 1', level: '100' };
  isModalOpen.value = true;
};

const editCourse = (course) => {
  editingCourseId.value = course.id;
  newCourse.value = { code: course.code, name: course.name, credits: course.credits, programId: course.programId, semester: course.semester || 'Semester 1', level: course.level };
  isModalOpen.value = true;
};

const closeModal = () => { isModalOpen.value = false; editingCourseId.value = null; };

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

const filteredCourses = computed(() =>
  coursesWithSchedule.value.filter(course => {
    const matchesSearch = course.code.toLowerCase().includes(searchQuery.value.toLowerCase()) || course.name.toLowerCase().includes(searchQuery.value.toLowerCase());
    const matchesLevel = levelFilter.value === 'all' || course.level === levelFilter.value;
    const matchesStatus = statusFilter.value === 'all' || course.status === statusFilter.value;
    return matchesSearch && matchesLevel && matchesStatus;
  })
);

const clearFilters = () => { searchQuery.value = ''; levelFilter.value = 'all'; statusFilter.value = 'all'; };
</script>