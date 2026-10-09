<template>
  <div class="space-y-5 sm:space-y-8 p-0 animate-in fade-in duration-500 w-full max-w-screen-2xl mx-auto">

    <!-- Header -->
    <div class="relative bg-white dark:bg-dark-surface border border-slate-200/80 dark:border-dark-outline/60 rounded-2xl p-6 sm:p-8 shadow-sm overflow-hidden">
      <div class="absolute inset-0 bg-[radial-gradient(#031c45_1px,transparent_1px)] dark:bg-[radial-gradient(#10b981_1px,transparent_1px)] opacity-[0.03] dark:opacity-[0.05] bg-[size:16px_16px] pointer-events-none"></div>
      <div class="absolute top-2 left-2 w-3 h-3 border-t-2 border-l-2 border-emerald-500/40 pointer-events-none"></div>
      <div class="absolute top-2 right-2 w-3 h-3 border-t-2 border-r-2 border-emerald-500/40 pointer-events-none"></div>

      <div class="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-5">
        <div>
          <div class="flex items-center gap-2 mb-1.5">
            <span class="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-mono font-medium tracking-wide uppercase bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border border-emerald-500/20">
              <Users class="w-3 h-3" />
              LECTURER // CLASS REPS
            </span>
          </div>
          <h1 class="text-2xl sm:text-3xl font-display font-bold text-slate-900 dark:text-white tracking-tight">Class Representative Management</h1>
          <p class="text-sm text-slate-500 dark:text-white/75 mt-1">Assign and manage class representatives for your courses.</p>
        </div>
        <button @click="openAssignModal" id="lecturer-assign-rep-btn"
          class="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-semibold transition-all shadow-md hover:shadow-lg active:scale-95 flex-shrink-0"
        >
          <Plus class="w-4 h-4" />
          Assign Class Rep
        </button>
      </div>
    </div>

    <!-- Stats Strip -->
    <div class="flex flex-wrap gap-3 sm:gap-4">
      <div class="flex items-center gap-3 px-5 py-3.5 rounded-2xl bg-white dark:bg-dark-surface border border-slate-200 dark:border-dark-outline shadow-sm">
        <div class="w-9 h-9 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 flex items-center justify-center text-emerald-600 dark:text-emerald-400">
          <Users class="w-4 h-4" />
        </div>
        <div>
          <div class="text-2xl font-display font-extrabold text-slate-900 dark:text-white leading-none">{{ myReps.length }}</div>
          <div class="text-[11px] font-mono uppercase tracking-wider text-slate-400 mt-0.5">My Class Reps</div>
        </div>
      </div>
      <div class="flex items-center gap-3 px-5 py-3.5 rounded-2xl bg-white dark:bg-dark-surface border border-slate-200 dark:border-dark-outline shadow-sm">
        <div class="w-9 h-9 rounded-xl bg-sky-50 dark:bg-sky-950/40 border border-sky-200 dark:border-sky-800 flex items-center justify-center text-sky-600 dark:text-sky-400">
          <BookOpen class="w-4 h-4" />
        </div>
        <div>
          <div class="text-2xl font-display font-extrabold text-slate-900 dark:text-white leading-none">{{ myCourses.length }}</div>
          <div class="text-[11px] font-mono uppercase tracking-wider text-slate-400 mt-0.5">My Courses</div>
        </div>
      </div>
    </div>

    <!-- Loading -->
    <div v-if="isLoading && myReps.length === 0" class="flex flex-col items-center justify-center py-20">
      <Loader2 class="w-10 h-10 text-emerald-500 animate-spin mb-3" />
      <span class="text-xs font-mono text-slate-500 dark:text-white/75">LOADING CLASS REPS...</span>
    </div>

    <!-- Empty -->
    <div v-else-if="myReps.length === 0" class="bg-white dark:bg-dark-surface border border-dashed border-slate-200 dark:border-dark-outline rounded-2xl p-14 text-center">
      <Users class="w-12 h-12 text-slate-300 dark:text-white/40 mx-auto mb-3" />
      <h3 class="font-display font-bold text-slate-900 dark:text-white text-base mb-1">No Class Reps Assigned Yet</h3>
      <p class="text-sm text-slate-400 mb-4">Assign a class representative to one of your courses to get started.</p>
      <button @click="openAssignModal" class="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold transition-all shadow-sm active:scale-95">
        <Plus class="w-3.5 h-3.5" /> Assign Class Rep
      </button>
    </div>

    <!-- Table Card -->
    <div v-else class="bg-white dark:bg-dark-surface border border-slate-200/80 dark:border-dark-outline/60 rounded-2xl shadow-sm overflow-hidden">
      <!-- Search -->
      <div class="p-4 border-b border-slate-100 dark:border-dark-outline">
        <div class="relative max-w-sm">
          <Search class="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input v-model="search" type="text" placeholder="Search by name or course…" id="lecturer-classrep-search"
            class="w-full pl-9 pr-4 py-2.5 bg-slate-50 dark:bg-dark-muted/80 border border-slate-200 dark:border-dark-outline/70 rounded-xl text-sm text-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/50" />
        </div>
      </div>

      <div class="w-full overflow-x-auto -mx-0">
        <table class="w-full min-w-[640px] text-left border-collapse text-xs">
          <thead>
            <tr class="bg-slate-50/80 dark:bg-slate-900/50 border-b border-slate-200 dark:border-dark-outline text-slate-500 dark:text-white/75 font-mono uppercase text-[11px] tracking-wider">
              <th class="py-3 px-4 font-semibold">Student</th>
              <th class="py-3 px-4 font-semibold">Program</th>
              <th class="py-3 px-4 font-semibold">Course</th>
              <th class="py-3 px-4 font-semibold">Level</th>
              <th class="py-3 px-4 font-semibold">Assigned On</th>
              <th class="py-3 px-4 font-semibold">Action</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-slate-100 dark:divide-slate-800/60 font-sans">
            <tr v-for="rep in filteredReps" :key="rep.id" class="hover:bg-slate-50/60 dark:hover:bg-slate-800/30 transition-colors">
              <td class="py-3.5 px-4">
                <div class="flex items-center gap-2.5">
                  <div class="w-8 h-8 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400 flex items-center justify-center font-bold text-xs uppercase flex-shrink-0">
                    {{ initials(rep.studentName) }}
                  </div>
                  <div>
                    <div class="font-semibold text-slate-900 dark:text-white">{{ rep.studentName }}</div>
                    <div class="text-[10px] font-mono text-slate-400 truncate max-w-[140px]">{{ rep.studentEmail || rep.studentId }}</div>
                  </div>
                </div>
              </td>
              <td class="py-3.5 px-4 text-slate-500 dark:text-white/75">{{ rep.studentProgram || '—' }}</td>
              <td class="py-3.5 px-4">
                <span class="font-mono text-[11px] font-bold px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-700 dark:text-emerald-400">{{ rep.courseCode }}</span>
                <span class="text-slate-500 dark:text-white/75 ml-2">{{ rep.courseName }}</span>
              </td>
              <td class="py-3.5 px-4">
                <span class="font-mono text-[11px] font-bold px-2 py-0.5 rounded-full bg-slate-100 dark:bg-dark-muted text-slate-600 dark:text-white/75">L{{ rep.courseLevel }}</span>
              </td>
              <td class="py-3.5 px-4 font-mono text-[11px] text-slate-400">{{ formatDate(rep.assignedAt) }}</td>
              <td class="py-3.5 px-4">
                <button @click="confirmRemove(rep)" :id="`lecturer-remove-rep-${rep.courseId}`"
                  class="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border border-rose-200 dark:border-rose-800 text-rose-600 dark:text-rose-400 text-[11px] font-mono font-bold hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors"
                >
                  <Trash2 class="w-3 h-3" /> Remove
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- Assign Modal -->
    <div v-if="showModal" class="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200" @click.self="closeModal">
      <div class="relative w-full max-w-[95vw] sm:max-w-xl bg-white dark:bg-dark-surface border border-slate-200 dark:border-dark-outline rounded-2xl shadow-2xl overflow-hidden max-h-[92dvh] sm:max-h-[90vh] flex flex-col">
        <div class="absolute top-2 left-2 w-3 h-3 border-t-2 border-l-2 border-emerald-500/40 pointer-events-none"></div>
        <div class="absolute top-2 right-2 w-3 h-3 border-t-2 border-r-2 border-emerald-500/40 pointer-events-none"></div>

        <div class="p-6 border-b border-slate-100 dark:border-dark-outline flex items-start justify-between">
          <div>
            <span class="text-[10px] font-mono uppercase tracking-wider text-emerald-600 dark:text-emerald-400 font-bold">ASSIGN CLASS REP</span>
            <h2 class="text-xl font-display font-bold text-slate-900 dark:text-white">Assign Class Representative</h2>
            <p class="text-xs text-slate-500 dark:text-white/75 mt-0.5">Designate an enrolled student to manage attendance for your course.</p>
          </div>
          <button @click="closeModal" class="p-2 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">
            <X class="w-5 h-5" />
          </button>
        </div>

        <div class="p-6 overflow-y-auto flex-1 space-y-5">
          <!-- Step 1: Course (only lecturer's courses) -->
          <div class="space-y-1.5">
            <label class="text-[11px] font-mono uppercase tracking-wider text-slate-500 dark:text-white/75">
              <span class="inline-flex items-center justify-center w-4 h-4 rounded-full bg-emerald-500 text-white text-[10px] font-extrabold mr-1.5">1</span>
              Select Your Course <span class="text-rose-500">*</span>
              <span v-if="myCourses.length" class="ml-2 text-slate-400 font-normal normal-case">({{ myCourses.length }} available)</span>
            </label>
            <select v-model="form.courseId" id="lecturer-modal-course-select" @change="onCourseSelect"
              class="w-full bg-slate-50 dark:bg-dark-muted/80 border border-slate-200 dark:border-dark-outline/70 rounded-xl px-3 py-2.5 text-sm text-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/50">
              <option value="">— Choose a course —</option>
              <option v-for="c in myCourses" :key="c.id" :value="c.id">{{ c.code }} — {{ c.name }}</option>
            </select>
          </div>

          <!-- Step 2: Student -->
          <div class="space-y-2">
            <div class="flex items-center justify-between">
              <label class="text-[11px] font-mono uppercase tracking-wider text-slate-500 dark:text-white/75">
                <span class="inline-flex items-center justify-center w-4 h-4 rounded-full bg-emerald-500 text-white text-[10px] font-extrabold mr-1.5">2</span>
                Select Student <span class="text-rose-500">*</span>
                <span v-if="isLoadingStudents" class="text-slate-400 font-normal normal-case ml-1">(Loading...)</span>
                <span v-else-if="students.length" class="text-slate-400 font-normal normal-case ml-1">({{ students.length }} students)</span>
              </label>
            </div>

            <!-- Student Search -->
            <div class="relative">
              <Search class="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
              <input v-model="studentSearch" type="text" placeholder="Search by name, ID or email…" id="lecturer-modal-student-search"
                class="w-full pl-9 pr-4 py-2 bg-slate-50 dark:bg-dark-muted/80 border border-slate-200 dark:border-dark-outline/70 rounded-xl text-xs text-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/50" />
            </div>

            <!-- Student List -->
            <div class="max-h-52 overflow-y-auto rounded-xl border border-slate-200 dark:border-dark-outline/70 divide-y divide-slate-100 dark:divide-slate-800">
              <div v-if="isLoadingStudents && students.length === 0" class="flex items-center gap-2 px-4 py-3 text-xs text-slate-400 font-mono">
                <Loader2 class="w-3.5 h-3.5 animate-spin" /> Loading students…
              </div>
              <div v-for="s in displayStudents" :key="s.id"
                :id="`lecturer-student-opt-${s.id}`"
                @click="selectStudent(s)"
                :class="['flex items-center gap-2.5 px-3 py-2.5 cursor-pointer transition-colors',
                  form.studentId === s.id
                    ? 'bg-emerald-500/10 dark:bg-emerald-950/40'
                    : 'hover:bg-slate-50 dark:hover:bg-slate-800/60'
                ]"
              >
                <div :class="['w-6 h-6 rounded-lg flex items-center justify-center font-bold text-[10px] uppercase flex-shrink-0',
                  form.studentId === s.id ? 'bg-emerald-600 text-white' : 'bg-slate-100 dark:bg-dark-muted text-slate-600 dark:text-white/75'
                ]">{{ initials(s.name) }}</div>
                <div class="flex-1 min-w-0">
                  <div class="flex items-center gap-1.5">
                    <span class="text-xs font-bold text-slate-900 dark:text-white truncate">{{ s.name }}</span>
                    <span v-if="s.isEnrolled" class="text-[10px] px-1 py-0 rounded bg-emerald-100 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400 font-mono">Enrolled</span>
                  </div>
                  <div class="text-[10px] font-mono text-slate-400 truncate">{{ s.email }} · {{ s.studentId }}</div>
                </div>
              </div>
              <div v-if="!isLoadingStudents && displayStudents.length === 0" class="px-4 py-6 text-center text-xs text-slate-400">
                {{ form.courseId ? 'No students found.' : 'Select a course first.' }}
              </div>
            </div>
          </div>

          <!-- Selected Student Preview -->
          <div v-if="selectedStudent" class="flex items-center gap-3 px-4 py-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800">
            <CheckCircle2 class="w-4 h-4 text-emerald-600 dark:text-emerald-400 flex-shrink-0" />
            <div class="flex-1 min-w-0">
              <div class="text-xs font-bold text-emerald-800 dark:text-emerald-300">{{ selectedStudent.name }}</div>
              <div class="text-[10px] font-mono text-emerald-600 dark:text-emerald-400 truncate">ID: {{ selectedStudent.studentId }} — {{ selectedStudent.email }}</div>
            </div>
            <span class="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-900/50 text-emerald-700 dark:text-emerald-400">Selected</span>
          </div>

          <div v-if="modalError" class="flex items-center gap-2 text-xs text-rose-600 dark:text-rose-400">
            <AlertCircle class="w-3.5 h-3.5 flex-shrink-0" /> {{ modalError }}
          </div>
        </div>

        <div class="p-6 border-t border-slate-100 dark:border-dark-outline flex items-center justify-end gap-3">
          <button @click="closeModal" type="button" class="px-4 py-2.5 rounded-xl border border-slate-200 dark:border-dark-outline/70 text-sm font-semibold text-slate-700 dark:text-white/90 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">Cancel</button>
          <button @click="submitAssign" :disabled="!form.courseId || !form.studentId || isSubmitting" id="lecturer-confirm-assign-btn" type="button"
            class="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-semibold transition-all shadow-md inline-flex items-center gap-2 disabled:opacity-50 active:scale-95"
          >
            <Loader2 v-if="isSubmitting" class="w-4 h-4 animate-spin" />
            <span>{{ isSubmitting ? 'Assigning…' : 'Confirm Assignment' }}</span>
          </button>
        </div>
      </div>
    </div>

    <!-- Remove Confirmation Modal -->
    <div v-if="removeTarget" class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200" @click.self="removeTarget = null">
      <div class="w-full max-w-md bg-white dark:bg-dark-surface border border-rose-200 dark:border-rose-900/50 rounded-2xl p-6 shadow-2xl">
        <div class="w-12 h-12 rounded-xl bg-rose-50 dark:bg-rose-950/50 border border-rose-200 dark:border-rose-900/50 flex items-center justify-center text-rose-600 dark:text-rose-400 mb-4">
          <Trash2 class="w-6 h-6" />
        </div>
        <h3 class="font-display font-bold text-slate-900 dark:text-white text-base mb-2">Remove Class Rep?</h3>
        <p class="text-xs text-slate-500 dark:text-white/75">
          Are you sure you want to remove <strong class="text-slate-800 dark:text-white">{{ removeTarget.studentName }}</strong> as class rep for <strong class="text-slate-800 dark:text-white">{{ removeTarget.courseCode }}</strong>?
        </p>
        <div class="flex items-center justify-end gap-3 mt-5">
          <button @click="removeTarget = null" class="px-4 py-2 rounded-xl border border-slate-200 dark:border-dark-outline/70 text-sm font-semibold text-slate-700 dark:text-white/90 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">Cancel</button>
          <button @click="doRemove" :disabled="isSubmitting" id="lecturer-confirm-remove-btn"
            class="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-sm font-semibold transition-all inline-flex items-center gap-2 shadow-sm disabled:opacity-50 active:scale-95">
            <Loader2 v-if="isSubmitting" class="w-4 h-4 animate-spin" />
            Remove
          </button>
        </div>
      </div>
    </div>

    <!-- Toast -->
    <transition name="fade">
      <div v-if="toast"
        :class="['fixed bottom-5 right-5 z-[100] flex items-center gap-3 px-4 py-3 rounded-xl border text-sm font-semibold shadow-lg',
          toast.type === 'success'
            ? 'bg-emerald-50 dark:bg-emerald-950/90 border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-400'
            : 'bg-rose-50 dark:bg-rose-950/90 border-rose-200 dark:border-rose-800 text-rose-700 dark:text-rose-400'
        ]"
      >
        <CheckCircle2 v-if="toast.type === 'success'" class="w-4 h-4 flex-shrink-0" />
        <AlertCircle v-else class="w-4 h-4 flex-shrink-0" />
        {{ toast.msg }}
      </div>
    </transition>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { useAuthStore } from '@/stores/authstore.js';
import { useClassRepStore } from '@/stores/classrep.js';
import { useCoursesStore } from '@/stores/courses.js';
import { useSchedulesStore } from '@/stores/schedules.js';
import { useEnrollmentsStore } from '@/stores/enrollments.js';
import { supabase } from '@/stores/supabase';
import { Users, Plus, Search, Trash2, X, CheckCircle2, AlertCircle, Loader2, BookOpen } from 'lucide-vue-next';

const authStore = useAuthStore();
const classRepStore = useClassRepStore();
const coursesStore = useCoursesStore();
const schedulesStore = useSchedulesStore();
const enrollmentsStore = useEnrollmentsStore();

const search = ref('');
const showModal = ref(false);
const removeTarget = ref(null);
const studentSearch = ref('');
const selectedStudent = ref(null);
const modalError = ref('');
const toast = ref(null);
const isLoading = ref(false);
const isLoadingStudents = ref(false);
const isSubmitting = ref(false);

const form = ref({ courseId: '', studentId: '' });

// All class reps for lecturer's courses
const myReps = ref([]);
// Courses this lecturer teaches
const myCourses = ref([]);
// Students for the assign modal
const students = ref([]);

function isLecturerSchedule(schedule, profile, user) {
  if (!schedule || !schedule.lecturer) return false;
  const sLect = schedule.lecturer.trim().toLowerCase();

  const pName = (profile?.name || profile?.full_name || '').trim().toLowerCase();
  const pEmail = (profile?.email || user?.email || '').trim().toLowerCase();
  const pId = (profile?.id || user?.id || '').trim().toLowerCase();

  if (pName && sLect === pName) return true;
  if (pEmail && sLect === pEmail) return true;
  if (pId && sLect === pId) return true;

  // Clean title prefixes like Dr., Prof., Mr., Mrs., Ms.
  const cleanLect = sLect.replace(/^(dr\.|prof\.|mr\.|mrs\.|ms\.)\s*/, '').trim();
  const cleanProfile = pName.replace(/^(dr\.|prof\.|mr\.|mrs\.|ms\.)\s*/, '').trim();
  if (cleanLect && cleanProfile) {
    if (cleanLect === cleanProfile) return true;
    if (cleanLect.includes(cleanProfile) || cleanProfile.includes(cleanLect)) return true;
  }
  return false;
}

onMounted(async () => {
  isLoading.value = true;
  try {
    await loadMyCourses();
    await loadMyReps();
  } finally {
    isLoading.value = false;
  }
});

async function loadMyCourses() {
  try {
    await Promise.allSettled([
      schedulesStore.fetchSchedules(),
      coursesStore.fetchCourses(),
      enrollmentsStore.fetchEnrollments(),
    ]);

    const profile = authStore.profile;
    const user = authStore.user;
    const allCourses = coursesStore.courses || [];

    // 1. Gather course IDs from schedules matching this lecturer
    const matchedCourseIds = new Set();
    (schedulesStore.schedules || []).forEach((s) => {
      if (isLecturerSchedule(s, profile, user)) {
        if (s.courseId) matchedCourseIds.add(s.courseId);
      }
    });

    // 2. Also check sessions table for any courses where lecturer created sessions
    const lecturerId = profile?.id || user?.id;
    if (lecturerId) {
      try {
        const { data: sessData } = await supabase
          .from('sessions')
          .select('course_id')
          .eq('lecturer_id', lecturerId);
        (sessData || []).forEach((s) => {
          if (s.course_id) matchedCourseIds.add(s.course_id);
        });
      } catch {}
    }

    // 3. Map matched course IDs to rich course objects
    let list = [];
    matchedCourseIds.forEach((cId) => {
      const c = allCourses.find((x) => x.id === cId || x.code === cId) || {};
      const code = c.code || (cId.length <= 10 ? cId : '—');
      let level = c.level || '100';
      if (!c.level && code) {
        const match = code.match(/\b([1-4]\d{2})\b/);
        if (match) level = match[1];
      }
      list.push({
        id: c.id || cId,
        code,
        name: c.name || code || 'Academic Course',
        level,
        program: c.program || c.programId || 'General',
      });
    });

    // 4. Fallback: if no courses matched the schedules (e.g. testing or newly assigned lecturer)
    if (list.length === 0 && allCourses.length > 0) {
      list = allCourses.map((c) => ({
        id: c.id,
        code: c.code,
        name: c.name,
        level: c.level || '100',
        program: c.program || c.programId || 'General',
      }));
    }

    myCourses.value = list;
  } catch (e) {
    console.error('[LecturerClassRep] loadMyCourses error:', e);
  }
}

async function loadMyReps() {
  try {
    await classRepStore.fetchAllReps();
    const allReps = classRepStore.allReps || [];
    const allCourses = coursesStore.courses || [];
    const allStudents = classRepStore.students || [];

    const myCourseIds = new Set(myCourses.value.map((c) => c.id));
    const myCourseCodes = new Set(myCourses.value.map((c) => (c.code || '').toUpperCase()));

    // Filter reps for courses taught by this lecturer
    let relevantReps = allReps;
    if (myCourses.value.length > 0) {
      const filtered = allReps.filter((r) =>
        myCourseIds.has(r.courseId) ||
        myCourseCodes.has((r.courseCode || '').toUpperCase()) ||
        myCourseCodes.has((r.courseId || '').toUpperCase())
      );
      if (filtered.length > 0 || myCourses.value.length < allCourses.length) {
        relevantReps = filtered;
      }
    }

    // Enrich reps with consistent details
    myReps.value = relevantReps.map((r) => {
      const course = myCourses.value.find((c) => c.id === r.courseId || c.code === r.courseId) ||
                     allCourses.find((c) => c.id === r.courseId || c.code === r.courseId) || {};
      const student = allStudents.find((s) => s.id === r.studentId || s.studentId === r.studentId) || {};

      const code = r.courseCode || course.code || (r.courseId && r.courseId.length <= 10 ? r.courseId : '—');
      const name = r.courseName || course.name || (code !== '—' ? code : 'Course');
      let level = r.courseLevel || course.level;
      if (!level && code) {
        const match = code.match(/\b([1-4]\d{2})\b/);
        if (match) level = match[1];
      }
      level = level || '100';

      return {
        id: r.id,
        studentId: r.studentId,
        studentName: (r.studentName && r.studentName !== 'Student' && r.studentName !== 'Student Rep')
          ? r.studentName
          : (student.name || r.studentName || 'Student Rep'),
        studentEmail: r.studentEmail || student.email || '',
        studentProgram: r.studentProgram || student.program || course.program || '—',
        courseId: r.courseId,
        courseCode: code,
        courseName: name,
        courseLevel: level,
        assignedAt: r.assignedAt,
      };
    });
  } catch (e) {
    console.error('[LecturerClassRep] loadMyReps error:', e);
  }
}

async function loadStudents(courseId) {
  isLoadingStudents.value = true;
  students.value = [];
  try {
    let enrolledIds = new Set();
    if (courseId) {
      const storeEnrolled = enrollmentsStore.enrollmentsByCourse(courseId);
      if (storeEnrolled.length > 0) {
        enrolledIds = new Set(storeEnrolled.map((e) => e.studentId));
      } else {
        try {
          const { data: enrolled } = await supabase
            .from('enrollments')
            .select('student_id')
            .eq('course_id', courseId);
          enrolledIds = new Set((enrolled ?? []).map((e) => e.student_id));
        } catch {}
      }
    }

    const studentList = await classRepStore.fetchStudents(courseId);
    students.value = (studentList || []).map((s) => ({
      id: s.id,
      name: s.name || s.email || 'Student',
      email: s.email || '',
      studentId: s.studentId || s.id,
      program: s.program || '—',
      isEnrolled: enrolledIds.has(s.id) || enrolledIds.has(s.studentId) || !!s.isEnrolled,
    })).sort((a, b) => (b.isEnrolled ? 1 : 0) - (a.isEnrolled ? 1 : 0));
  } catch (e) {
    console.error('[LecturerClassRep] loadStudents error:', e);
  } finally {
    isLoadingStudents.value = false;
  }
}

const filteredReps = computed(() => {
  const q = search.value.toLowerCase().trim();
  if (!q) return myReps.value;
  return myReps.value.filter((r) =>
    (r.studentName || '').toLowerCase().includes(q) ||
    (r.studentEmail || '').toLowerCase().includes(q) ||
    (r.courseCode || '').toLowerCase().includes(q) ||
    (r.courseName || '').toLowerCase().includes(q) ||
    (r.studentProgram || '').toLowerCase().includes(q)
  );
});

const displayStudents = computed(() => {
  const q = studentSearch.value.toLowerCase().trim();
  if (!q) return students.value;
  return students.value.filter((s) =>
    (s.name || '').toLowerCase().includes(q) ||
    (s.email || '').toLowerCase().includes(q) ||
    (s.studentId || '').toLowerCase().includes(q) ||
    (s.program || '').toLowerCase().includes(q)
  );
});

async function openAssignModal() {
  form.value = { courseId: '', studentId: '' };
  studentSearch.value = '';
  selectedStudent.value = null;
  modalError.value = '';
  showModal.value = true;
  if (myCourses.value.length === 0) await loadMyCourses();
  if (students.value.length === 0) await loadStudents();
}

function closeModal() {
  showModal.value = false;
  modalError.value = '';
}

function onCourseSelect() {
  form.value.studentId = '';
  selectedStudent.value = null;
  if (form.value.courseId) {
    loadStudents(form.value.courseId);
  }
}

function selectStudent(s) {
  form.value.studentId = s.id;
  selectedStudent.value = s;
}

async function submitAssign() {
  modalError.value = '';
  if (!form.value.courseId) {
    modalError.value = 'Please select a course.';
    return;
  }
  if (!form.value.studentId) {
    modalError.value = 'Please select a student.';
    return;
  }

  const selectedCourse = myCourses.value.find((c) => c.id === form.value.courseId) ||
                         coursesStore.courses.find((c) => c.id === form.value.courseId);
  const student = selectedStudent.value || students.value.find((s) => s.id === form.value.studentId);

  isSubmitting.value = true;
  try {
    const extraData = {
      studentName: student?.name,
      studentEmail: student?.email,
      studentProgram: student?.program,
      courseCode: selectedCourse?.code,
      courseName: selectedCourse?.name,
      courseLevel: selectedCourse?.level,
    };

    const res = await classRepStore.assignClassRep(form.value.studentId, form.value.courseId, extraData);
    showToast(res.message || `${student?.name || 'Student'} assigned as Class Rep for ${selectedCourse?.code || 'course'}`, 'success');
    closeModal();
    await loadMyReps();
  } catch (err) {
    modalError.value = err.message || 'Failed to assign class representative';
  } finally {
    isSubmitting.value = false;
  }
}

function confirmRemove(rep) {
  removeTarget.value = rep;
}

async function doRemove() {
  if (!removeTarget.value) return;
  isSubmitting.value = true;
  try {
    const courseId = removeTarget.value.courseId;
    const courseCode = removeTarget.value.courseCode;

    await classRepStore.removeClassRep(courseId);
    showToast(`Class rep removed from ${courseCode}`, 'success');
    removeTarget.value = null;
    await loadMyReps();
  } catch (err) {
    showToast(err.message || 'Failed to remove class rep', 'error');
  } finally {
    isSubmitting.value = false;
  }
}

function showToast(msg, type = 'success') {
  toast.value = { msg, type };
  setTimeout(() => (toast.value = null), 3500);
}

function initials(name) {
  return (name || 'ST').split(' ').map((w) => w[0]).join('').toUpperCase().slice(0, 2);
}

function formatDate(d) {
  if (!d) return '—';
  try {
    return new Date(d).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
  } catch {
    return '—';
  }
}
</script>
