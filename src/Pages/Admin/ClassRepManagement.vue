<template>
  <div class="space-y-8 p-1 sm:p-2 lg:p-4 animate-in fade-in duration-500">

    <!-- Header -->
    <div class="relative bg-white dark:bg-dark-surface border border-slate-200/80 dark:border-dark-outline/60 rounded-2xl p-6 sm:p-8 shadow-sm overflow-hidden">
      <div class="absolute inset-0 bg-[radial-gradient(#031c45_1px,transparent_1px)] dark:bg-[radial-gradient(#bc9333_1px,transparent_1px)] opacity-[0.03] dark:opacity-[0.05] bg-[size:16px_16px] pointer-events-none"></div>
      <div class="absolute top-2 left-2 w-3 h-3 border-t-2 border-l-2 border-secondary/40 pointer-events-none"></div>
      <div class="absolute top-2 right-2 w-3 h-3 border-t-2 border-r-2 border-secondary/40 pointer-events-none"></div>

      <div class="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-5">
        <div>
          <div class="flex items-center gap-2 mb-1.5">
            <span class="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-mono font-medium tracking-wide uppercase bg-primary/10 text-primary dark:bg-secondary/15 dark:text-secondary border border-primary/20 dark:border-secondary/30">
              <Users class="w-3 h-3" />
              ADMIN // CLASS REPS
            </span>
          </div>
          <h1 class="text-2xl sm:text-3xl font-display font-bold text-slate-900 dark:text-white tracking-tight">Class Representative Management</h1>
          <p class="text-sm text-slate-500 dark:text-white/75 mt-1">Assign and manage class representatives for each course.</p>
        </div>
        <button @click="openAssignModal" id="assign-rep-btn"
          class="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-primary hover:bg-primary/90 text-white text-sm font-semibold transition-all shadow-md hover:shadow-lg active:scale-95 flex-shrink-0"
        >
          <Plus class="w-4 h-4" />
          Assign Class Rep
        </button>
      </div>
    </div>

    <!-- Stats Strip -->
    <div class="flex flex-wrap gap-4">
      <div class="flex items-center gap-3 px-5 py-3.5 rounded-2xl bg-white dark:bg-dark-surface border border-slate-200 dark:border-dark-outline shadow-sm">
        <div class="w-9 h-9 rounded-xl bg-primary/10 dark:bg-secondary/15 border border-primary/20 dark:border-secondary/30 flex items-center justify-center text-primary dark:text-secondary">
          <Users class="w-4.5 h-4.5 w-4 h-4" />
        </div>
        <div>
          <div class="text-2xl font-display font-extrabold text-slate-900 dark:text-white leading-none">{{ store.allReps.length }}</div>
          <div class="text-[11px] font-mono uppercase tracking-wider text-slate-400 mt-0.5">Total Class Reps</div>
        </div>
      </div>
      <div class="flex items-center gap-3 px-5 py-3.5 rounded-2xl bg-white dark:bg-dark-surface border border-slate-200 dark:border-dark-outline shadow-sm">
        <div class="w-9 h-9 rounded-xl bg-sky-50 dark:bg-sky-950/40 border border-sky-200 dark:border-sky-800 flex items-center justify-center text-sky-600 dark:text-sky-400">
          <BookOpen class="w-4 h-4" />
        </div>
        <div>
          <div class="text-2xl font-display font-extrabold text-slate-900 dark:text-white leading-none">{{ uniqueCourses }}</div>
          <div class="text-[11px] font-mono uppercase tracking-wider text-slate-400 mt-0.5">Courses Covered</div>
        </div>
      </div>
    </div>

    <!-- Loading -->
    <div v-if="store.isLoading && store.allReps.length === 0" class="flex flex-col items-center justify-center py-20">
      <Loader2 class="w-10 h-10 text-secondary animate-spin mb-3" />
      <span class="text-xs font-mono text-slate-500 dark:text-white/75">LOADING CLASS REPS...</span>
    </div>

    <!-- Empty -->
    <div v-else-if="store.allReps.length === 0" class="bg-white dark:bg-dark-surface border border-dashed border-slate-200 dark:border-dark-outline rounded-2xl p-14 text-center">
      <Users class="w-12 h-12 text-slate-300 dark:text-white/40 mx-auto mb-3" />
      <h3 class="font-display font-bold text-slate-900 dark:text-white text-base mb-1">No Class Reps Assigned</h3>
      <p class="text-sm text-slate-400 mb-4">Click "Assign Class Rep" to get started.</p>
      <button @click="openAssignModal" class="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-primary hover:bg-primary/90 text-white text-xs font-semibold transition-all shadow-sm active:scale-95">
        <Plus class="w-3.5 h-3.5" /> Assign Class Rep
      </button>
    </div>

    <!-- Table Card -->
    <div v-else class="bg-white dark:bg-dark-surface border border-slate-200/80 dark:border-dark-outline/60 rounded-2xl shadow-sm overflow-hidden">
      <!-- Search -->
      <div class="p-4 border-b border-slate-100 dark:border-dark-outline">
        <div class="relative max-w-sm">
          <Search class="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input v-model="search" type="text" placeholder="Search by name or course…" id="classrep-search"
            class="w-full pl-9 pr-4 py-2.5 bg-slate-50 dark:bg-dark-muted/80 border border-slate-200 dark:border-dark-outline/70 rounded-xl text-sm text-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-secondary/50" />
        </div>
      </div>

      <div class="overflow-x-auto">
        <table class="w-full text-left border-collapse text-xs">
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
                  <div class="w-8 h-8 rounded-xl bg-primary/10 dark:bg-secondary/15 text-primary dark:text-secondary flex items-center justify-center font-bold text-xs uppercase flex-shrink-0">
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
                <span class="font-mono text-[11px] font-bold px-2 py-0.5 rounded bg-primary/10 text-primary dark:bg-secondary/15 dark:text-secondary">{{ rep.courseCode }}</span>
                <span class="text-slate-500 dark:text-white/75 ml-2">{{ rep.courseName }}</span>
              </td>
              <td class="py-3.5 px-4">
                <span class="font-mono text-[11px] font-bold px-2 py-0.5 rounded-full bg-slate-100 dark:bg-dark-muted text-slate-600 dark:text-white/75">L{{ rep.courseLevel }}</span>
              </td>
              <td class="py-3.5 px-4 font-mono text-[11px] text-slate-400">{{ formatDate(rep.assignedAt) }}</td>
              <td class="py-3.5 px-4">
                <button @click="confirmRemove(rep)" :id="`remove-rep-${rep.courseId}`"
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
    <div v-if="showModal" class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200" @click.self="closeModal">
      <div class="relative w-full max-w-xl bg-white dark:bg-dark-surface border border-slate-200 dark:border-dark-outline rounded-2xl shadow-2xl overflow-hidden max-h-[90vh] flex flex-col">
        <div class="absolute top-2 left-2 w-3 h-3 border-t-2 border-l-2 border-secondary/40 pointer-events-none"></div>
        <div class="absolute top-2 right-2 w-3 h-3 border-t-2 border-r-2 border-secondary/40 pointer-events-none"></div>

        <div class="p-6 border-b border-slate-100 dark:border-dark-outline flex items-start justify-between">
          <div>
            <span class="text-[10px] font-mono uppercase tracking-wider text-secondary font-bold">ASSIGN CLASS REP</span>
            <h2 class="text-xl font-display font-bold text-slate-900 dark:text-white">Assign Class Representative</h2>
            <p class="text-xs text-slate-500 dark:text-white/75 mt-0.5">Designate an enrolled student to manage attendance for this course.</p>
          </div>
          <button @click="closeModal" class="p-2 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">
            <X class="w-5 h-5" />
          </button>
        </div>

        <div class="p-6 overflow-y-auto flex-1 space-y-5">
          <!-- Step 1: Course -->
          <div class="space-y-1.5">
            <label class="text-[11px] font-mono uppercase tracking-wider text-slate-500 dark:text-white/75">
              <span class="inline-flex items-center justify-center w-4 h-4 rounded-full bg-secondary text-primary text-[10px] font-extrabold mr-1.5">1</span>
              Select Course <span class="text-rose-500">*</span>
              <span v-if="coursesList.length" class="ml-2 text-slate-400 font-normal normal-case">({{ coursesList.length }} available)</span>
            </label>
            <select v-model="form.courseId" id="modal-course-select" @change="onCourseSelect"
              class="w-full bg-slate-50 dark:bg-dark-muted/80 border border-slate-200 dark:border-dark-outline/70 rounded-xl px-3 py-2.5 text-sm text-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-secondary/50">
              <option value="">— Choose a course —</option>
              <option v-for="c in coursesList" :key="c.id" :value="c.id">{{ c.code }} — {{ c.name }} (Level {{ c.level || '100' }})</option>
            </select>
          </div>

          <!-- Step 2: Student -->
          <div class="space-y-2">
            <div class="flex items-center justify-between">
              <label class="text-[11px] font-mono uppercase tracking-wider text-slate-500 dark:text-white/75">
                <span class="inline-flex items-center justify-center w-4 h-4 rounded-full bg-secondary text-primary text-[10px] font-extrabold mr-1.5">2</span>
                Select Student <span class="text-rose-500">*</span>
                <span v-if="store.isLoading" class="text-slate-400 font-normal normal-case ml-1">(Loading...)</span>
                <span v-else-if="displayStudents.length" class="text-slate-400 font-normal normal-case ml-1">({{ displayStudents.length }} students)</span>
              </label>
              <div class="flex gap-1">
                <button v-for="m in ['All', 'Regular', 'Weekend']" :key="m" type="button" @click="filterMode = m"
                  :class="['px-2 py-0.5 rounded-lg text-[10px] font-mono font-bold border transition-all',
                    filterMode === m
                      ? 'bg-primary text-white border-primary dark:bg-secondary dark:border-secondary dark:text-primary'
                      : 'bg-slate-50 dark:bg-dark-muted text-slate-500 dark:text-white/75 border-slate-200 dark:border-dark-outline/70 hover:border-slate-300'
                  ]">{{ m }}</button>
              </div>
            </div>

            <!-- Student Search -->
            <div class="relative">
              <Search class="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
              <input v-model="studentSearch" type="text" placeholder="Search by name, ID or email…" id="modal-student-search"
                class="w-full pl-9 pr-4 py-2 bg-slate-50 dark:bg-dark-muted/80 border border-slate-200 dark:border-dark-outline/70 rounded-xl text-xs text-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-secondary/50" />
            </div>

            <!-- Student List -->
            <div class="max-h-52 overflow-y-auto rounded-xl border border-slate-200 dark:border-dark-outline/70 divide-y divide-slate-100 dark:divide-slate-800">
              <div v-if="store.isLoading && store.students.length === 0" class="flex items-center gap-2 px-4 py-3 text-xs text-slate-400 font-mono">
                <Loader2 class="w-3.5 h-3.5 animate-spin" /> Loading students…
              </div>
              <div v-for="s in displayStudents.slice(0, 15)" :key="s.id"
                :id="`student-opt-${s.id}`"
                @click="selectStudent(s)"
                :class="['flex items-center gap-2.5 px-3 py-2.5 cursor-pointer transition-colors',
                  form.studentId === s.id
                    ? 'bg-primary/10 dark:bg-secondary/15'
                    : 'hover:bg-slate-50 dark:hover:bg-slate-800/60'
                ]"
              >
                <div :class="['w-6 h-6 rounded-lg flex items-center justify-center font-bold text-[10px] uppercase flex-shrink-0',
                  form.studentId === s.id ? 'bg-primary text-white dark:bg-secondary dark:text-primary' : 'bg-slate-100 dark:bg-dark-muted text-slate-600 dark:text-white/75'
                ]">{{ initials(s.name) }}</div>
                <div class="flex-1 min-w-0">
                  <div class="flex items-center gap-1.5">
                    <span class="text-xs font-bold text-slate-900 dark:text-white truncate">{{ s.name }}</span>
                    <span v-if="s.isEnrolled" class="text-[10px] px-1 py-0 rounded bg-emerald-100 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400 font-mono">Enrolled</span>
                  </div>
                  <div class="text-[10px] font-mono text-slate-400 truncate">{{ s.email }} · {{ s.studentId }} · {{ s.program || 'Student' }}</div>
                </div>
                <span class="text-[10px] font-mono px-1.5 py-0.5 rounded bg-slate-100 dark:bg-dark-muted text-slate-500 dark:text-white/75 flex-shrink-0">{{ s.mode || 'Regular' }}</span>
              </div>
              <div v-if="!store.isLoading && displayStudents.length === 0" class="px-4 py-6 text-center text-xs text-slate-400">No students found matching your criteria.</div>
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
          <button @click="submitAssign" :disabled="!form.courseId || !form.studentId || store.isLoading" id="confirm-assign-btn" type="button"
            class="px-5 py-2.5 rounded-xl bg-primary hover:bg-primary/90 text-white text-sm font-semibold transition-all shadow-md inline-flex items-center gap-2 disabled:opacity-50 active:scale-95"
          >
            <Loader2 v-if="store.isLoading" class="w-4 h-4 animate-spin" />
            <span>{{ store.isLoading ? 'Assigning…' : 'Confirm Assignment' }}</span>
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
          <button @click="doRemove" :disabled="store.isLoading" id="confirm-remove-btn"
            class="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-sm font-semibold transition-all inline-flex items-center gap-2 shadow-sm disabled:opacity-50 active:scale-95">
            <Loader2 v-if="store.isLoading" class="w-4 h-4 animate-spin" />
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
import { useClassRepStore } from '@/stores/classrep.js';
import { useCoursesStore } from '@/stores/courses.js';
import { Users, Plus, Search, Trash2, X, CheckCircle2, AlertCircle, Loader2, BookOpen } from 'lucide-vue-next';

const store = useClassRepStore();
const coursesStore = useCoursesStore();

const search = ref('');
const showModal = ref(false);
const removeTarget = ref(null);
const studentSearch = ref('');
const selectedStudent = ref(null);
const modalError = ref('');
const toast = ref(null);
const filterMode = ref('All');

const form = ref({ courseId: '', studentId: '' });

onMounted(async () => {
  await Promise.allSettled([store.fetchAllReps(), coursesStore.fetchCourses(), store.fetchStudents()]);
});

const uniqueCourses = computed(() => new Set(enrichedReps.value.map(r => r.courseId)).size);
const coursesList = computed(() => coursesStore.courses || []);

const enrichedReps = computed(() =>
  (store.allReps || []).map((rep) => {
    const course = (coursesList.value || []).find(c => c.id === rep.courseId || c.code === rep.courseId || (rep.courseCode && c.code === rep.courseCode));
    const student = (store.students || []).find(s => s.id === rep.studentId || s.studentId === rep.studentId || (rep.studentEmail && s.email === rep.studentEmail));
    const sName = (rep.studentName && rep.studentName !== 'Student' && rep.studentName !== 'Student Rep') ? rep.studentName : (student?.name || rep.studentName || 'Student Rep');
    const sEmail = rep.studentEmail || student?.email || rep.studentId || '';
    const sProgram = rep.studentProgram || student?.program || course?.programId || course?.program || '—';
    const cCode = rep.courseCode || course?.code || (rep.courseId && rep.courseId.length <= 10 ? rep.courseId : '—');
    const cName = rep.courseName || course?.name || (cCode !== '—' ? cCode : 'Course');
    let cLevel = rep.courseLevel || course?.level;
    if (!cLevel && cCode) { const match = cCode.match(/\b([1-4]\d{2})\b/); if (match) cLevel = match[1]; }
    cLevel = cLevel || '100';
    return { ...rep, studentName: sName, studentEmail: sEmail, studentProgram: sProgram, courseCode: cCode, courseName: cName, courseLevel: cLevel };
  })
);

const filteredReps = computed(() => {
  const q = search.value.toLowerCase().trim();
  if (!q) return enrichedReps.value;
  return enrichedReps.value.filter(r =>
    (r.studentName || '').toLowerCase().includes(q) || (r.courseCode || '').toLowerCase().includes(q) ||
    (r.courseName || '').toLowerCase().includes(q) || (r.studentEmail || '').toLowerCase().includes(q) ||
    (r.courseLevel || '').toLowerCase().includes(q) || (r.studentProgram || '').toLowerCase().includes(q)
  );
});

const displayStudents = computed(() => {
  let list = store.students || [];
  if (filterMode.value !== 'All') { const matched = list.filter(s => (s.mode || '').toLowerCase() === filterMode.value.toLowerCase()); if (matched.length) list = matched; }
  const q = studentSearch.value.toLowerCase().trim();
  if (q) list = list.filter(s => (s.name || '').toLowerCase().includes(q) || (s.email || '').toLowerCase().includes(q) || (s.studentId || '').toLowerCase().includes(q) || (s.program || '').toLowerCase().includes(q));
  return list;
});

async function openAssignModal() {
  form.value = { courseId: '', studentId: '' }; studentSearch.value = ''; selectedStudent.value = null; modalError.value = ''; filterMode.value = 'All';
  if (coursesList.value.length === 0) await coursesStore.fetchCourses();
  showModal.value = true;
  await store.fetchStudents();
}

function closeModal() { showModal.value = false; }
function onCourseSelect() { if (form.value.courseId) store.fetchStudents(form.value.courseId); }
function selectStudent(s) { form.value.studentId = s.id; selectedStudent.value = s; }

async function submitAssign() {
  modalError.value = '';
  if (!form.value.courseId) { modalError.value = 'Please select a course.'; return; }
  if (!form.value.studentId) { modalError.value = 'Please select a student.'; return; }
  const selectedCourse = coursesList.value.find(c => c.id === form.value.courseId || c.code === form.value.courseId);
  try {
    const result = await store.assignClassRep(form.value.studentId, form.value.courseId, { studentName: selectedStudent.value?.name, studentEmail: selectedStudent.value?.email, studentProgram: selectedStudent.value?.program, courseCode: selectedCourse?.code, courseName: selectedCourse?.name, courseLevel: selectedCourse?.level });
    showToast(result.message || 'Class representative assigned successfully!', 'success');
    closeModal();
  } catch (err) { modalError.value = err.message || 'Failed to assign class representative'; }
}

function confirmRemove(rep) { removeTarget.value = rep; }

async function doRemove() {
  try { await store.removeClassRep(removeTarget.value.courseId); showToast(`Class rep removed from ${removeTarget.value.courseCode}`, 'success'); removeTarget.value = null; }
  catch (err) { showToast(err.message, 'error'); }
}

function showToast(msg, type = 'success') { toast.value = { msg, type }; setTimeout(() => (toast.value = null), 3500); }
function initials(name) { return (name || 'ST').split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2); }
function formatDate(d) { if (!d) return '—'; try { return new Date(d).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }); } catch { return '—'; } }
</script>
