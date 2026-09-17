<template>
  <div class="space-y-6 w-full max-w-7xl mx-auto">
    <!-- Header with Blueprint Eyebrow -->
    <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-outline/30 dark:border-dark-outline/40">
      <div>
        <div class="dim-eyebrow">
          <span>COURSE ENROLLMENT // CURRICULUM CATALOGUE</span>
          <svg class="dim-line w-20 h-2" viewBox="0 0 140 8" fill="none">
            <path d="M0 4H140" stroke="currentColor" stroke-width="1.5" />
          </svg>
        </div>
        <h1 class="text-2xl sm:text-3xl font-extrabold font-display tracking-tight text-foreground dark:text-dark-foreground">
          Course <span class="text-secondary dark:text-dark-secondary">Registration</span>
        </h1>
        <p class="text-xs sm:text-sm font-mono text-foreground/60 dark:text-dark-foreground/60 mt-1">
          Select and confirm accredited modules for the active semester &bull; {{ currentUserProgram }}
        </p>
      </div>

      <div class="flex items-center gap-3">
        <span class="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold font-mono bg-emerald-500/10 text-emerald-500 border border-emerald-500/30">
          <span class="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
          Enrollment Open
        </span>
      </div>
    </div>

    <!-- Notification Toast Banners -->
    <transition enter-active-class="transition duration-200 ease-out" enter-from-class="opacity-0 -translate-y-2" enter-to-class="opacity-100 translate-y-0" leave-active-class="transition duration-150 ease-in" leave-from-class="opacity-100 translate-y-0" leave-to-class="opacity-0 -translate-y-2">
      <div v-if="feedbackMsg" class="p-3.5 rounded-xl border text-xs sm:text-sm font-medium flex items-center justify-between gap-2.5" :class="feedbackIsError ? 'bg-error/10 border-error/30 text-error' : 'bg-success/10 border-success/30 text-success'">
        <div class="flex items-center gap-2">
          <component :is="feedbackIsError ? AlertTriangle : CheckCircle2" class="w-4 h-4 shrink-0" />
          <span>{{ feedbackMsg }}</span>
        </div>
        <button @click="feedbackMsg = ''" class="cursor-pointer font-bold">&times;</button>
      </div>
    </transition>

    <div class="grid grid-cols-1 lg:grid-cols-12 gap-6">
      <!-- Left Column: Available Courses (8 cols) -->
      <div class="lg:col-span-8 space-y-4">
        <div class="relative bg-surface dark:bg-dark-surface border border-outline/50 dark:border-dark-outline/60 rounded-2xl shadow-xs overflow-hidden p-5">
          <div class="corner corner-tl !border-secondary/30 pointer-events-none"></div>
          <div class="corner corner-tr !border-secondary/30 pointer-events-none"></div>

          <!-- Filter / Search Controls -->
          <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-outline/30 dark:border-dark-outline/40">
            <div class="flex items-center gap-2">
              <BookOpen class="w-4 h-4 text-secondary" />
              <h2 class="text-xs sm:text-sm font-bold font-display uppercase tracking-wider text-foreground dark:text-dark-foreground">
                Available Courses ({{ filteredCourses.length }})
              </h2>
            </div>

            <div class="flex flex-wrap items-center gap-2">
              <select 
                v-model="semesterFilter" 
                class="bg-muted/40 dark:bg-dark-muted/40 border border-outline/40 dark:border-dark-outline/40 rounded-xl px-2.5 py-1 text-xs text-foreground dark:text-dark-foreground font-mono outline-hidden focus:border-secondary"
              >
                <option value="all">All Semesters</option>
                <option value="Semester 1">Semester 1</option>
                <option value="Semester 2">Semester 2</option>
              </select>

              <select 
                v-model="levelFilter" 
                class="bg-muted/40 dark:bg-dark-muted/40 border border-outline/40 dark:border-dark-outline/40 rounded-xl px-2.5 py-1 text-xs text-foreground dark:text-dark-foreground font-mono outline-hidden focus:border-secondary"
              >
                <option value="all">All Levels</option>
                <option value="100">Level 100</option>
                <option value="200">Level 200</option>
                <option value="300">Level 300</option>
                <option value="400">Level 400</option>
              </select>

              <div class="relative">
                <Search class="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-foreground/40 pointer-events-none" />
                <input 
                  type="text" 
                  v-model="searchQuery" 
                  placeholder="Filter courses…" 
                  class="pl-7 pr-3 py-1 text-xs bg-muted/40 dark:bg-dark-muted/40 border border-outline/40 dark:border-dark-outline/40 focus:border-secondary rounded-xl outline-hidden text-foreground dark:text-dark-foreground font-mono placeholder:text-foreground/40 w-32 sm:w-40"
                />
              </div>
            </div>
          </div>

          <!-- Courses List -->
          <div class="pt-4">
            <div v-if="filteredCourses.length === 0" class="py-16 text-center text-foreground/50 dark:text-dark-foreground/50">
              <BookOpen class="w-8 h-8 mx-auto mb-2 text-foreground/30" />
              <p class="text-sm font-medium text-foreground dark:text-dark-foreground">No available courses found</p>
              <p class="text-xs font-mono mt-0.5">There are no unpublished modules matching your filters.</p>
            </div>

            <div v-else class="space-y-3">
              <div 
                v-for="course in filteredCourses" 
                :key="course.id"
                @click="toggleSelection(course)"
                class="p-4 rounded-xl border transition-all flex items-start gap-3.5 cursor-pointer select-none"
                :class="isSelected(course) 
                  ? 'bg-secondary/10 dark:bg-dark-secondary/15 border-secondary shadow-xs ring-1 ring-secondary/30' 
                  : 'bg-muted/20 dark:bg-dark-muted/20 border-outline/30 dark:border-dark-outline/40 hover:bg-muted/40'"
              >
                <!-- Custom Checkbox -->
                <div 
                  class="w-5 h-5 rounded-md mt-0.5 shrink-0 flex items-center justify-center border transition-all"
                  :class="isSelected(course) 
                    ? 'bg-secondary border-secondary text-primary' 
                    : 'bg-surface dark:bg-dark-surface border-outline/50 dark:border-dark-outline/60'"
                >
                  <Check v-if="isSelected(course)" class="w-3.5 h-3.5 stroke-[3]" />
                </div>

                <div class="min-w-0 flex-1">
                  <div class="flex items-center justify-between gap-2">
                    <div class="flex items-center gap-2">
                      <span class="text-xs font-bold font-mono text-secondary dark:text-dark-secondary">
                        {{ course.code }}
                      </span>
                      <span class="px-2 py-0.2 rounded text-[10px] font-mono font-medium bg-muted/60 dark:bg-dark-muted/60 text-foreground/60 border border-outline/30">
                        {{ course.semester || 'Semester 1' }}
                      </span>
                    </div>

                    <span class="px-2 py-0.5 rounded-full text-xs font-bold font-mono bg-primary/10 dark:bg-primary/20 text-primary dark:text-dark-primary border border-primary/20">
                      {{ course.credits }} Credits
                    </span>
                  </div>

                  <h3 class="text-xs sm:text-sm font-semibold text-foreground dark:text-dark-foreground truncate mt-1">
                    {{ course.name }}
                  </h3>
                  <p class="text-[11px] font-mono text-foreground/50 dark:text-dark-foreground/50 mt-0.5">
                    Faculty Instructor: {{ course.lecturer }}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Right Column: Registration Summary (4 cols) -->
      <div class="lg:col-span-4 space-y-4">
        <div class="relative bg-surface dark:bg-dark-surface border border-outline/50 dark:border-dark-outline/60 rounded-2xl shadow-xs overflow-hidden p-5 flex flex-col justify-between">
          <div class="corner corner-tl !border-secondary/30 pointer-events-none"></div>
          <div class="corner corner-tr !border-secondary/30 pointer-events-none"></div>

          <div>
            <div class="flex items-center gap-2 pb-3 border-b border-outline/30 dark:border-dark-outline/40">
              <ClipboardList class="w-4 h-4 text-secondary" />
              <h2 class="text-xs sm:text-sm font-bold font-display uppercase tracking-wider text-foreground dark:text-dark-foreground">
                Registration Summary
              </h2>
            </div>

            <!-- Credits Meter -->
            <div class="pt-4 space-y-2">
              <div class="flex items-center justify-between text-xs font-mono">
                <span class="text-foreground/60 dark:text-dark-foreground/60">Credit Load</span>
                <span class="font-bold" :class="totalSelectedCredits > maxCredits ? 'text-error font-extrabold' : 'text-foreground dark:text-dark-foreground'">
                  {{ totalSelectedCredits }} / {{ maxCredits }} Max
                </span>
              </div>

              <!-- Meter Bar -->
              <div class="h-2 w-full bg-muted/70 dark:bg-dark-muted/70 rounded-full overflow-hidden">
                <div 
                  class="h-full rounded-full transition-all duration-300"
                  :class="totalSelectedCredits > maxCredits ? 'bg-error' : totalSelectedCredits >= 15 ? 'bg-emerald-500' : 'bg-secondary'"
                  :style="{ width: `${Math.min(100, (totalSelectedCredits / maxCredits) * 100)}%` }"
                ></div>
              </div>

              <p v-if="totalSelectedCredits > maxCredits" class="text-[11px] font-mono text-error">
                You have exceeded the maximum limit of {{ maxCredits }} credits.
              </p>
            </div>

            <!-- Selected Courses List -->
            <div class="pt-5 space-y-3">
              <h3 class="text-xs font-bold font-mono text-foreground/70 dark:text-dark-foreground/70 uppercase tracking-wider">
                Selected Modules ({{ selectedCourses.length }})
              </h3>

              <div v-if="selectedCourses.length === 0" class="py-8 text-center text-foreground/40 font-mono text-xs">
                No courses selected yet.
              </div>

              <div v-else class="space-y-2 max-h-64 overflow-y-auto pr-1">
                <div 
                  v-for="course in selectedCourses" 
                  :key="course.id"
                  class="p-2.5 rounded-xl bg-muted/30 dark:bg-dark-muted/30 border border-outline/30 dark:border-dark-outline/40 flex items-center justify-between gap-2"
                >
                  <div class="min-w-0">
                    <p class="text-xs font-bold text-foreground dark:text-dark-foreground truncate">
                      {{ course.code }} &bull; {{ course.name }}
                    </p>
                    <span class="text-[10px] font-mono text-secondary dark:text-dark-secondary">
                      {{ course.credits }} Credits
                    </span>
                  </div>

                  <button 
                    @click.stop="toggleSelection(course)"
                    class="p-1 rounded-lg text-foreground/40 hover:text-error hover:bg-error/10 transition-colors cursor-pointer"
                    title="Remove from selection"
                  >
                    <X class="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          </div>

          <!-- Footer Submit Button -->
          <div class="pt-6 mt-6 border-t border-outline/30 dark:border-dark-outline/40">
            <button 
              class="w-full py-2.5 rounded-xl bg-primary dark:bg-dark-secondary text-surface dark:text-primary font-bold text-xs shadow-md hover:opacity-90 active:scale-98 disabled:opacity-40 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2 cursor-pointer"
              :disabled="selectedCourses.length === 0 || totalSelectedCredits > maxCredits || isSubmitting"
              @click="submitRegistration"
            >
              <RefreshCw v-if="isSubmitting" class="w-4 h-4 animate-spin" />
              <CheckCircle2 v-else class="w-4 h-4" />
              <span>{{ isSubmitting ? 'Registering Modules…' : 'Submit Registration' }}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue';
import { storeToRefs } from 'pinia';
import { useAuthStore } from '@/stores/authstore';
import { useCoursesStore } from '@/stores/courses';
import { useSchedulesStore } from '@/stores/schedules';
import { useEnrollmentsStore } from '@/stores/enrollments';
import { useAuditLogsStore } from '@/stores/auditlogs';
import { 
  BookOpen, 
  Search, 
  Check, 
  CheckCircle2, 
  ClipboardList, 
  X, 
  RefreshCw, 
  AlertTriangle 
} from 'lucide-vue-next';

const authStore = useAuthStore();
const coursesStore = useCoursesStore();
const schedulesStore = useSchedulesStore();
const enrollmentsStore = useEnrollmentsStore();
const auditLogsStore = useAuditLogsStore();

const { profile } = storeToRefs(authStore);
const { courses } = storeToRefs(coursesStore);
const { schedules } = storeToRefs(schedulesStore);
const { enrollments } = storeToRefs(enrollmentsStore);

const searchQuery = ref('');
const semesterFilter = ref('all');
const levelFilter = ref('all');
const maxCredits = 21;

const selectedCourses = ref([]);
const isSubmitting = ref(false);
const feedbackMsg = ref('');
const feedbackIsError = ref(false);

const currentUserProgram = computed(() => profile.value?.program || 'Enrolled Student');

onMounted(async () => {
  try {
    await Promise.all([
      coursesStore.fetchCourses({ status: 'active' }),
      schedulesStore.fetchSchedules(),
      enrollmentsStore.fetchEnrollments({ studentId: profile.value?.id }),
    ]);

    coursesStore.subscribeToCourses();
    enrollmentsStore.subscribeToEnrollments();
  } catch (error) {
    console.error('Error fetching available courses', error);
  }
});

onUnmounted(() => {
  coursesStore.unsubscribeFromCourses();
  enrollmentsStore.unsubscribeFromEnrollments();
});

function lecturerForCourse(courseId) {
  const match = schedules.value.find((s) => s.courseId === courseId);
  return match?.lecturer || 'Faculty Staff';
}

const enrolledCourseIds = computed(
  () => new Set(enrollments.value.map((e) => e.courseId))
);

const availableGlobalCourses = computed(() =>
  courses.value
    .filter((c) => !enrolledCourseIds.value.has(c.id))
    .map((c) => ({
      ...c,
      lecturer: lecturerForCourse(c.id),
    }))
);

const filteredCourses = computed(() => {
  let list = availableGlobalCourses.value;

  if (profile.value?.programId) {
    list = list.filter((course) => course.programId === profile.value?.programId);
  }

  if (semesterFilter.value !== 'all') {
    list = list.filter((course) => (course.semester || 'Semester 1') === semesterFilter.value);
  }

  if (levelFilter.value !== 'all') {
    list = list.filter((course) => String(course.level) === levelFilter.value);
  }

  if (searchQuery.value) {
    const q = searchQuery.value.toLowerCase();
    list = list.filter(
      (course) =>
        course.code.toLowerCase().includes(q) ||
        course.name.toLowerCase().includes(q)
    );
  }

  return list;
});

const isSelected = (course) => {
  return selectedCourses.value.some((c) => c.id === course.id);
};

const toggleSelection = (course) => {
  if (isSelected(course)) {
    selectedCourses.value = selectedCourses.value.filter((c) => c.id !== course.id);
  } else {
    selectedCourses.value.push(course);
  }
};

const totalSelectedCredits = computed(() => {
  return selectedCourses.value.reduce((total, course) => total + (course.credits || 3), 0);
});

const submitRegistration = async () => {
  isSubmitting.value = true;
  feedbackMsg.value = '';
  feedbackIsError.value = false;
  const studentId = profile.value?.id;
  const registered = [];
  const failed = [];

  try {
    for (const course of selectedCourses.value) {
      try {
        await enrollmentsStore.createEnrollment({ studentId, courseId: course.id });
        registered.push(course);

        auditLogsStore.logAction({
          action: 'course_registered',
          details: `Registered for ${course.code} — ${course.name}`,
          userId: studentId,
          userRole: profile.value?.role,
          userName: profile.value?.name,
        });
      } catch (err) {
        failed.push({ course, message: err.message });
      }
    }

    if (registered.length > 0 && failed.length === 0) {
      feedbackMsg.value = `Successfully enrolled in ${registered.length} module(s)!`;
      feedbackIsError.value = false;
    } else if (failed.length > 0) {
      feedbackMsg.value = `Registered for ${registered.length} module(s). Issues with: ${failed.map(f => f.course.code).join(', ')}`;
      feedbackIsError.value = true;
    }

    selectedCourses.value = [];
  } catch (error) {
    console.error('Registration failed', error);
    feedbackMsg.value = 'An error occurred during registration.';
    feedbackIsError.value = true;
  } finally {
    isSubmitting.value = false;
  }
};
</script>