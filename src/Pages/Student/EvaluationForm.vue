<template>
  <div class="space-y-6 w-full max-w-4xl mx-auto">
    <!-- Notice Modal Popup -->
    <Teleport to="body">
      <transition enter-active-class="transition duration-200 ease-out" enter-from-class="opacity-0" enter-to-class="opacity-100" leave-active-class="transition duration-150 ease-in" leave-from-class="opacity-100" leave-to-class="opacity-0">
        <div v-if="showPopup" class="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center z-50 p-4" @click.self="showPopup = false">
          <div class="relative bg-surface dark:bg-dark-surface border border-outline/50 dark:border-dark-outline/60 rounded-3xl p-6 sm:p-8 max-w-lg w-full shadow-2xl space-y-5 animate-in fade-in zoom-in-95">
            <div class="corner corner-tl !border-secondary/30 pointer-events-none"></div>
            <div class="corner corner-tr !border-secondary/30 pointer-events-none"></div>

            <div class="w-12 h-12 rounded-2xl bg-secondary/15 text-secondary flex items-center justify-center">
              <Award class="w-6 h-6" />
            </div>

            <div>
              <h2 class="text-xl font-bold font-display text-foreground dark:text-dark-foreground">
                Faculty Instructional Evaluation
              </h2>
              <p class="text-xs font-mono text-foreground/60 dark:text-dark-foreground/60 mt-1">
                Your direct appraisal improves institutional curriculum delivery.
              </p>
            </div>

            <!-- Confidentiality Pills -->
            <div class="flex flex-wrap gap-2 text-xs font-mono">
              <span class="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-500/10 text-blue-500 border border-blue-500/25">
                <Shield class="w-3.5 h-3.5" /> 100% Confidential
              </span>
              <span class="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-purple-500/10 text-purple-500 border border-purple-500/25">
                <Clock class="w-3.5 h-3.5" /> ~3 Minutes
              </span>
              <span class="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-500 border border-emerald-500/25">
                <CheckCircle2 class="w-3.5 h-3.5" /> Single Submission
              </span>
            </div>

            <!-- Rules List -->
            <ul class="text-xs space-y-2 text-foreground/70 dark:text-dark-foreground/70 border-y border-outline/30 dark:border-dark-outline/40 py-3 font-mono">
              <li class="flex items-start gap-2">
                <span class="text-secondary font-bold">&bull;</span>
                <span>Select the specific course and lecturer from the dropdown list.</span>
              </li>
              <li class="flex items-start gap-2">
                <span class="text-secondary font-bold">&bull;</span>
                <span>Responses are aggregated anonymously to protect student identity.</span>
              </li>
              <li class="flex items-start gap-2">
                <span class="text-secondary font-bold">&bull;</span>
                <span>Submissions are final once confirmed.</span>
              </li>
            </ul>

            <button 
              @click="showPopup = false" 
              id="eval-popup-proceed"
              class="w-full py-2.5 rounded-xl bg-primary dark:bg-dark-secondary text-surface dark:text-primary font-bold text-xs sm:text-sm shadow-md hover:opacity-90 active:scale-98 transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              <CheckCircle2 class="w-4 h-4" />
              <span>Proceed to Questionnaire</span>
            </button>
          </div>
        </div>
      </transition>
    </Teleport>

    <!-- Header with Blueprint Eyebrow -->
    <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-outline/30 dark:border-dark-outline/40">
      <div>
        <div class="dim-eyebrow">
          <span>ACADEMIC AUDIT // LECTURER APPRAISAL</span>
          <svg class="dim-line w-20 h-2" viewBox="0 0 140 8" fill="none">
            <path d="M0 4H140" stroke="currentColor" stroke-width="1.5" />
          </svg>
        </div>
        <h1 class="text-2xl sm:text-3xl font-extrabold font-display tracking-tight text-foreground dark:text-dark-foreground">
          Lecturer <span class="text-secondary dark:text-dark-secondary">Evaluation</span>
        </h1>
        <p class="text-xs sm:text-sm font-mono text-foreground/60 dark:text-dark-foreground/60 mt-1">
          Confidential feedback survey on teaching effectiveness and course delivery
        </p>
      </div>
    </div>

    <!-- Closed Banner -->
    <div v-if="!evalStore.settings.isOpen" class="p-6 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-700 dark:text-amber-400 flex items-start gap-4">
      <Lock class="w-6 h-6 shrink-0 mt-0.5" />
      <div>
        <h2 class="text-base font-bold font-display">Evaluations are currently closed</h2>
        <p class="text-xs font-mono mt-1 opacity-90">
          The institutional evaluation period has concluded or has not yet been initiated by the administrator.
        </p>
      </div>
    </div>

    <template v-else>
      <!-- Course Selector Card -->
      <div class="relative bg-surface dark:bg-dark-surface border border-outline/50 dark:border-dark-outline/60 rounded-2xl p-5 shadow-xs">
        <div class="corner corner-tl !border-secondary/30 pointer-events-none"></div>
        <div class="corner corner-tr !border-secondary/30 pointer-events-none"></div>

        <label class="block text-xs font-bold font-mono text-foreground dark:text-dark-foreground uppercase tracking-wider mb-2" for="ef-course-select">
          Select Enrolled Module & Lecturer
        </label>

        <div v-if="isLoadingCourses" class="py-2 text-xs font-mono text-foreground/50 flex items-center gap-2">
          <RefreshCw class="w-3.5 h-3.5 animate-spin text-secondary" />
          <span>Loading enrolled modules…</span>
        </div>

        <div v-else-if="eligibleEnrollments.length === 0" class="py-4 text-xs font-mono text-foreground/50">
          No courses with assigned lecturers found. Ensure you are enrolled and assigned to a lecture schedule.
        </div>

        <select 
          v-else 
          id="ef-course-select" 
          v-model="selectedEnrollment" 
          class="w-full bg-muted/30 dark:bg-dark-muted/30 border border-outline/40 dark:border-dark-outline/40 rounded-xl px-3.5 py-2.5 text-xs sm:text-sm text-foreground dark:text-dark-foreground font-mono outline-hidden focus:border-secondary"
        >
          <option value="">— Choose a course & instructor —</option>
          <option v-for="e in eligibleEnrollments" :key="e.key" :value="e.key">
            {{ e.courseCode }} — {{ e.courseName }} ({{ e.lecturerName }})
          </option>
        </select>
      </div>

      <!-- Already Submitted Banner -->
      <div v-if="alreadySubmitted" class="p-6 rounded-2xl bg-success/10 border border-success/30 text-success text-center space-y-2">
        <CheckCircle2 class="w-8 h-8 mx-auto" />
        <h3 class="text-base font-bold font-display">Evaluation Completed</h3>
        <p class="text-xs font-mono">You have already submitted your confidential evaluation for this module. Thank you!</p>
      </div>

      <!-- Questionnaire Form -->
      <form v-else-if="selectedEnrollment" @submit.prevent="handleSubmit" class="space-y-4">
        <div class="space-y-3">
          <div
            v-for="(q, idx) in QUESTIONS"
            :key="q.id"
            class="relative bg-surface dark:bg-dark-surface border rounded-2xl p-5 shadow-xs transition-colors"
            :class="submitted && !responses[q.id] ? 'border-error/60 bg-error/5' : 'border-outline/50 dark:border-dark-outline/60'"
          >
            <div class="flex items-start gap-3">
              <span class="px-2.5 py-1 rounded-lg bg-secondary/15 text-secondary font-bold font-mono text-xs shrink-0">
                Q{{ idx + 1 }}
              </span>
              <div class="min-w-0 flex-1">
                <p class="text-xs sm:text-sm font-semibold text-foreground dark:text-dark-foreground">
                  {{ q.text }}
                </p>

                <!-- Options Radio Chips -->
                <div class="flex flex-wrap gap-2 mt-3">
                  <label
                    v-for="opt in OPTIONS[q.type]"
                    :key="opt"
                    class="px-3 py-1.5 rounded-xl border text-xs font-mono font-medium cursor-pointer transition-all select-none"
                    :class="responses[q.id] === opt 
                      ? 'bg-secondary text-primary font-bold border-secondary shadow-xs' 
                      : 'bg-muted/30 dark:bg-dark-muted/30 border-outline/30 dark:border-dark-outline/40 text-foreground/70 hover:bg-muted/60'"
                  >
                    <input type="radio" :name="q.id" :value="opt" v-model="responses[q.id]" class="sr-only" />
                    {{ opt }}
                  </label>
                </div>

                <p v-if="submitted && !responses[q.id]" class="text-[11px] font-mono text-error mt-2">
                  Please select a rating for this question.
                </p>
              </div>
            </div>
          </div>

          <!-- Comments Card -->
          <div class="relative bg-surface dark:bg-dark-surface border border-outline/50 dark:border-dark-outline/60 rounded-2xl p-5 shadow-xs">
            <div class="flex items-start gap-3">
              <span class="px-2.5 py-1 rounded-lg bg-secondary/15 text-secondary font-bold font-mono text-xs shrink-0">
                Q17
              </span>
              <div class="min-w-0 flex-1">
                <p class="text-xs sm:text-sm font-semibold text-foreground dark:text-dark-foreground">
                  Constructive Comments & Observations (Optional)
                </p>
                <textarea
                  v-model="comments"
                  rows="4"
                  id="ef-comments"
                  placeholder="Share additional perspectives regarding instructional clarity, lecture pacing, or course structure…"
                  class="mt-3 w-full px-3.5 py-2.5 text-xs sm:text-sm bg-muted/30 dark:bg-dark-muted/30 border border-outline/40 dark:border-dark-outline/40 focus:border-secondary rounded-xl outline-hidden text-foreground dark:text-dark-foreground font-mono"
                ></textarea>
              </div>
            </div>
          </div>
        </div>

        <div v-if="formError" class="p-3.5 rounded-xl bg-error/10 border border-error/30 text-error text-xs font-mono">
          {{ formError }}
        </div>

        <div class="flex justify-end pt-2">
          <button 
            type="submit" 
            :disabled="evalStore.isSubmitting" 
            id="ef-submit"
            class="px-6 py-2.5 rounded-xl bg-primary dark:bg-dark-secondary text-surface dark:text-primary font-bold text-xs sm:text-sm shadow-md hover:opacity-90 active:scale-98 disabled:opacity-40 transition-all flex items-center gap-2 cursor-pointer"
          >
            <RefreshCw v-if="evalStore.isSubmitting" class="w-4 h-4 animate-spin" />
            <CheckCircle2 v-else class="w-4 h-4" />
            <span>{{ evalStore.isSubmitting ? 'Submitting Appraisal…' : 'Submit Evaluation' }}</span>
          </button>
        </div>
      </form>

      <div v-else class="py-16 text-center text-foreground/40 font-mono text-xs">
        Select a module from the dropdown above to begin your evaluation.
      </div>
    </template>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, reactive } from 'vue';
import { storeToRefs } from 'pinia';
import { useAuthStore }        from '@/stores/authstore';
import { useEnrollmentsStore } from '@/stores/enrollments';
import { useCoursesStore }     from '@/stores/courses';
import { useSchedulesStore }   from '@/stores/schedules';
import { useEvaluationStore, QUESTIONS, OPTIONS } from '@/stores/evaluations';
import { supabase }            from '@/stores/supabase';
import { 
  Award, 
  Shield, 
  Clock, 
  CheckCircle2, 
  Lock, 
  RefreshCw 
} from 'lucide-vue-next';

const showPopup = ref(false);

const authStore   = useAuthStore();
const enrollStore = useEnrollmentsStore();
const courseStore = useCoursesStore();
const schedStore  = useSchedulesStore();
const evalStore   = useEvaluationStore();

const { profile }     = storeToRefs(authStore);
const { enrollments } = storeToRefs(enrollStore);
const { schedules }   = storeToRefs(schedStore);

const selectedEnrollment = ref('');
const responses          = reactive({});
const comments           = ref('');
const submitted          = ref(false);
const formError          = ref('');

const lecturerMap = ref({});
const isLoadingCourses = ref(true);

onMounted(async () => {
  showPopup.value = true;
  const uid = profile.value?.id;
  isLoadingCourses.value = true;
  try {
    await Promise.all([
      enrollStore.fetchEnrollments({ studentId: uid }),
      courseStore.fetchCourses(),
      schedStore.fetchSchedules(),
      evalStore.fetchSettings(),
      evalStore.fetchMyEvaluations(uid),
    ]);

    const names = [...new Set(schedules.value.map(s => s.lecturer).filter(Boolean))];
    if (names.length) {
      const { data } = await supabase
        .from('users')
        .select('id, name')
        .eq('role', 'Lecturer');
      (data ?? []).forEach(u => {
        lecturerMap.value[u.name.trim().toLowerCase()] = { id: u.id, name: u.name };
      });
    }
  } catch (e) {
    console.error('[EvaluationForm] mount error:', e);
  } finally {
    isLoadingCourses.value = false;
  }
});

const eligibleEnrollments = computed(() => {
  if (isLoadingCourses.value) return [];
  const myEnrollments = enrollments.value.filter(e => e.studentId === profile.value?.id);
  const studentMode   = profile.value?.mode?.trim();
  const result = [];
  const seen = new Set();

  myEnrollments.forEach(enr => {
    const course = courseStore.getCourseById(enr.courseId);
    if (!course) return;

    const schedule =
      schedules.value.find(
        s => s.courseId === enr.courseId &&
             s.mode?.trim() === studentMode &&
             s.lecturer?.trim()
      ) ??
      schedules.value.find(
        s => s.courseId === enr.courseId && s.lecturer?.trim()
      );

    if (!schedule?.lecturer) return;

    const match = lecturerMap.value[schedule.lecturer.trim().toLowerCase()];
    const lecturerId   = match?.id   ?? null;
    const lecturerName = match?.name ?? schedule.lecturer;

    const key = lecturerId
      ? `${enr.courseId}::${lecturerId}`
      : `${enr.courseId}::${schedule.lecturer}`;

    if (seen.has(key)) return;
    seen.add(key);

    result.push({
      key,
      courseId:     enr.courseId,
      lecturerId,
      courseCode:   course.code,
      courseName:   course.name,
      lecturerName,
    });
  });

  return result;
});

const currentEnrollment = computed(() =>
  eligibleEnrollments.value.find(e => e.key === selectedEnrollment.value)
);

const alreadySubmitted = computed(() => {
  if (!currentEnrollment.value) return false;
  return evalStore.hasSubmitted(
    profile.value?.id,
    currentEnrollment.value.lecturerId,
    currentEnrollment.value.courseId
  );
});

async function handleSubmit() {
  submitted.value = true;
  formError.value = '';

  const enr = currentEnrollment.value;
  if (!enr) return;

  if (!enr.lecturerId) {
    formError.value = 'Could not identify the lecturer for this course. Please contact your administrator.';
    return;
  }

  const missing = QUESTIONS.filter(q => !responses[q.id]);
  if (missing.length) {
    formError.value = `Please answer all ${missing.length} unanswered question(s) before submitting.`;
    return;
  }

  try {
    await evalStore.submitEvaluation({
      studentId:  profile.value.id,
      lecturerId: enr.lecturerId,
      courseId:   enr.courseId,
      responses:  { ...responses },
      comments:   comments.value,
    });
    QUESTIONS.forEach(q => { delete responses[q.id]; });
    comments.value = '';
    submitted.value = false;
    selectedEnrollment.value = '';
  } catch { /* store handles toast */ }
}
</script>