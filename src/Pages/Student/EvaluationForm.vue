<template>
  <div class="ef-container">
    <!-- Closed banner -->
    <div v-if="!evalStore.settings.isOpen" class="closed-banner">
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
      <div>
        <h2>Evaluations are currently closed</h2>
        <p>Your administrator will open the evaluation period when it is time. Please check back later.</p>
      </div>
    </div>

    <template v-else>
      <div class="ef-header">
        <div>
          <h1 class="ef-title">Lecturer Evaluation</h1>
          <p class="ef-subtitle">Your feedback helps improve the quality of teaching. All responses are confidential.</p>
        </div>
        <div class="course-select-wrap">
          <label class="sel-label" for="ef-course-select">Select Course / Lecturer</label>
          <!-- Loading state -->
          <div v-if="isLoadingCourses" class="ef-loading">Loading your courses…</div>
          <!-- No courses found -->
          <div v-else-if="eligibleEnrollments.length === 0" class="no-courses-hint">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/></svg>
            No courses with assigned lecturers found. Make sure you are enrolled and a lecturer is assigned to your schedule.
          </div>
          <!-- Dropdown -->
          <select v-else id="ef-course-select" v-model="selectedEnrollment" class="ef-select">
            <option value="">— Choose a course —</option>
            <option v-for="e in eligibleEnrollments" :key="e.key" :value="e.key">
              {{ e.courseCode }} — {{ e.courseName }} ({{ e.lecturerName }})
            </option>
          </select>
        </div>
      </div>

      <!-- Already submitted -->
      <div v-if="alreadySubmitted" class="submitted-banner">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="20 6 9 17 4 12"/></svg>
        <p>You have already submitted an evaluation for this course. Thank you!</p>
      </div>

      <!-- Form -->
      <form v-else-if="selectedEnrollment" @submit.prevent="handleSubmit" class="ef-form">
        <div class="questions-list">
          <div
            v-for="(q, idx) in QUESTIONS"
            :key="q.id"
            class="question-card"
            :class="{ 'q-error': submitted && !responses[q.id] }"
          >
            <div class="q-number">Q{{ idx + 1 }}</div>
            <div class="q-body">
              <p class="q-text">{{ q.text }}</p>
              <div class="q-options" :class="'opts-' + q.type">
                <label
                  v-for="opt in OPTIONS[q.type]"
                  :key="opt"
                  class="opt-chip"
                  :class="{ selected: responses[q.id] === opt }"
                >
                  <input type="radio" :name="q.id" :value="opt" v-model="responses[q.id]" />
                  {{ opt }}
                </label>
              </div>
              <p v-if="submitted && !responses[q.id]" class="q-err-msg">Please select an option</p>
            </div>
          </div>

          <!-- Q17: Comments -->
          <div class="question-card">
            <div class="q-number">Q17</div>
            <div class="q-body">
              <p class="q-text">Please provide any further comments.</p>
              <textarea
                v-model="comments"
                class="ef-textarea"
                placeholder="Share any additional thoughts (optional)…"
                rows="4"
                id="ef-comments"
              ></textarea>
            </div>
          </div>
        </div>

        <div class="ef-footer">
          <div v-if="formError" class="form-error">{{ formError }}</div>
          <button type="submit" class="submit-btn" :disabled="evalStore.isSubmitting" id="ef-submit">
            <svg v-if="evalStore.isSubmitting" class="spin" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10" stroke-dasharray="31" stroke-dashoffset="10"/></svg>
            <svg v-else viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="20 6 9 17 4 12"/></svg>
            {{ evalStore.isSubmitting ? 'Submitting…' : 'Submit Evaluation' }}
          </button>
        </div>
      </form>

      <div v-else class="pick-hint">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/></svg>
        <p>Select a course above to begin your evaluation.</p>
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

// name → UUID map, populated after fetching schedules
const lecturerMap = ref({});
// loading state for the dropdown
const isLoadingCourses = ref(true);

onMounted(async () => {
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

    // Resolve lecturer names → UUIDs via Supabase
    // schedules.lecturer is stored as a plain text name (e.g. "John Doe")
    const names = [...new Set(schedules.value.map(s => s.lecturer).filter(Boolean))];
    if (names.length) {
      const { data } = await supabase
        .from('users')
        .select('id, name')
        .eq('role', 'Lecturer');
      // Build a case-insensitive map: normalized name → id
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

// Build course options for the dropdown.
// Shows all enrolled courses that have a schedule with a lecturer assigned.
// Mode filtering is soft — if the student has no mode set, all schedules are shown.
const eligibleEnrollments = computed(() => {
  if (isLoadingCourses.value) return [];
  const myEnrollments = enrollments.value.filter(e => e.studentId === profile.value?.id);
  const studentMode   = profile.value?.mode?.trim();   // 'Regular' | 'Weekend' | undefined
  const result = [];
  const seen = new Set();

  myEnrollments.forEach(enr => {
    const course = courseStore.getCourseById(enr.courseId);
    if (!course) return;

    // Find the schedule matching this student's mode; fall back to any schedule with a lecturer
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

    // Look up lecturer UUID by name (case-insensitive)
    const match = lecturerMap.value[schedule.lecturer.trim().toLowerCase()];
    const lecturerId   = match?.id   ?? null;
    const lecturerName = match?.name ?? schedule.lecturer;

    // We need a stable key — use courseId::lecturerName if UUID not resolved yet
    const key = lecturerId
      ? `${enr.courseId}::${lecturerId}`
      : `${enr.courseId}::${schedule.lecturer}`;

    if (seen.has(key)) return;
    seen.add(key);

    result.push({
      key,
      courseId:     enr.courseId,
      lecturerId,          // may be null if lookup failed — we catch this at submit
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
    document.querySelector('.q-error')?.scrollIntoView({ behavior: 'smooth', block: 'center' });
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
    // reset form
    QUESTIONS.forEach(q => { delete responses[q.id]; });
    comments.value = '';
    submitted.value = false;
    selectedEnrollment.value = '';
  } catch { /* store handles toast */ }
}
</script>