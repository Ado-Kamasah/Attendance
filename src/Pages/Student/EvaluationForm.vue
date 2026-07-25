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

<style scoped>
* { font-family: 'Inter', sans-serif; box-sizing: border-box; }
.ef-container { display: flex; flex-direction: column; gap: 1.75rem; width: 100%; }

/* Closed banner */
.closed-banner {
  display: flex; align-items: flex-start; gap: 1.25rem;
  background: linear-gradient(135deg,#fef9c3,#fef3c7);
  border: 1px solid #fde68a; border-radius: 16px; padding: 2rem;
}
.closed-banner svg { width: 42px; height: 42px; color: #a16207; flex-shrink: 0; margin-top: 2px; }
.closed-banner h2 { margin: 0 0 .4rem; font-size: 1.15rem; font-weight: 700; color: #92400e; }
.closed-banner p  { margin: 0; color: #a16207; font-size: .9rem; }

/* Header */
.ef-header { display: flex; justify-content: space-between; align-items: flex-start; flex-wrap: wrap; gap: 1rem; }
.ef-title   { margin: 0; font-size: 1.75rem; font-weight: 700; color: #0f172a; letter-spacing: -.025em; }
.ef-subtitle { margin: .25rem 0 0; font-size: .9rem; color: #64748b; }
.course-select-wrap { display: flex; flex-direction: column; gap: .35rem; min-width: 0; }
.sel-label { font-size: .78rem; font-weight: 600; color: #64748b; text-transform: uppercase; letter-spacing: .05em; }
.ef-select { padding: .55rem 1rem; border: 1.5px solid #e2e8f0; border-radius: 10px; font-size: .9rem; color: #334155; background: #fff; min-width: 320px; max-width: 100%; outline: none; cursor: pointer; box-sizing: border-box; }
.ef-select:focus { border-color: #6366f1; }
.ef-loading { font-size: .9rem; color: #64748b; padding: .5rem 0; }
.no-courses-hint { display: flex; align-items: flex-start; gap: .6rem; background: #fef9c3; border: 1px solid #fde68a; border-radius: 10px; padding: .75rem 1rem; font-size: .82rem; color: #92400e; max-width: 420px; }
.no-courses-hint svg { width: 18px; height: 18px; flex-shrink: 0; margin-top: 1px; color: #a16207; }

/* Submitted banner */
.submitted-banner {
  display: flex; align-items: center; gap: 1rem;
  background: #dcfce7; border: 1px solid #bbf7d0; border-radius: 12px; padding: 1.25rem 1.5rem;
}
.submitted-banner svg { width: 28px; height: 28px; color: #15803d; flex-shrink: 0; }
.submitted-banner p  { margin: 0; font-weight: 600; color: #15803d; }

/* Pick hint */
.pick-hint {
  display: flex; flex-direction: column; align-items: center; gap: 1rem;
  padding: 4rem 2rem; background: #f8fafc; border: 1px dashed #cbd5e1; border-radius: 16px; text-align: center;
}
.pick-hint svg { width: 48px; height: 48px; color: #94a3b8; }
.pick-hint p { margin: 0; color: #64748b; font-size: .95rem; }

/* Form */
.ef-form { display: flex; flex-direction: column; gap: 1.25rem; }
.questions-list { display: flex; flex-direction: column; gap: 1rem; }

.question-card {
  display: flex; gap: 1rem;
  background: #fff; border: 1px solid #f1f5f9; border-radius: 14px; padding: 1.25rem 1.5rem;
  box-shadow: 0 2px 6px rgba(0,0,0,.03); transition: border-color .2s;
}
.question-card.q-error { border-color: #fca5a5; background: #fff5f5; }

.q-number {
  width: 36px; height: 36px; border-radius: 10px;
  background: linear-gradient(135deg,#6366f1,#4f46e5); color: #fff;
  font-size: .78rem; font-weight: 700; display: flex; align-items: center; justify-content: center;
  flex-shrink: 0; margin-top: 2px;
}
.q-body { flex: 1; display: flex; flex-direction: column; gap: .75rem; min-width: 0; }
.q-text { margin: 0; font-size: .925rem; font-weight: 600; color: #1e293b; line-height: 1.4; word-break: break-word; }

/* Option chips */
.q-options { display: flex; flex-wrap: wrap; gap: .5rem; }
.opts-rating5 .opt-chip, .opts-frequency .opt-chip { min-width: 90px; }
.opts-yesno .opt-chip { min-width: 60px; }

.opt-chip {
  display: inline-flex; align-items: center; justify-content: center;
  padding: .45rem .9rem; border-radius: 999px; border: 1.5px solid #e2e8f0;
  background: #f8fafc; color: #475569; font-size: .82rem; font-weight: 600;
  cursor: pointer; transition: all .15s; user-select: none;
}
.opt-chip input { display: none; }
.opt-chip:hover { border-color: #6366f1; color: #4338ca; background: #eef2ff; }
.opt-chip.selected { border-color: #6366f1; background: #6366f1; color: #fff; }

.q-err-msg { margin: 0; font-size: .78rem; color: #ef4444; font-weight: 600; }

.ef-textarea {
  width: 100%; padding: .75rem; border: 1.5px solid #e2e8f0; border-radius: 10px;
  font-size: .9rem; color: #334155; resize: vertical; outline: none; font-family: inherit;
}
.ef-textarea:focus { border-color: #6366f1; }

/* Footer */
.ef-footer { display: flex; flex-direction: column; align-items: flex-end; gap: .75rem; }
.form-error { color: #b91c1c; font-size: .85rem; font-weight: 600; align-self: flex-start; }
.submit-btn {
  display: inline-flex; align-items: center; gap: .6rem;
  background: linear-gradient(135deg,#6366f1,#4f46e5); color: #fff;
  border: none; padding: .8rem 2rem; border-radius: 10px; font-size: .95rem; font-weight: 700;
  cursor: pointer; box-shadow: 0 4px 12px rgba(99,102,241,.3); transition: all .2s;
}
.submit-btn svg { width: 18px; height: 18px; }
.submit-btn:hover:not(:disabled) { transform: translateY(-1px); box-shadow: 0 6px 18px rgba(99,102,241,.4); }
.submit-btn:disabled { opacity: .5; cursor: not-allowed; transform: none; }
.spin { animation: spin .8s linear infinite; }
@keyframes spin { to { transform: rotate(360deg); } }

/* ==========================================================================
   Responsive Breakpoints
   L  (large / laptop-desktop): < 1200px  — tighten spacing
   M  (tablet):                 < 1024px  — select shrinks, cards tighten
   S  (small tablet / large phone): < 768px — stack header, full-width select
   XS (mobile):                 < 480px  — compact cards, stacked option chips
   ========================================================================== */

/* L — Large screens / small laptops */
@media (max-width: 1200px) {
  .ef-container { gap: 1.5rem; }
}

/* M — Tablets */
@media (max-width: 1024px) {
  .ef-select { min-width: 260px; }
  .question-card { padding: 1.1rem 1.25rem; }
}

/* S — Small tablets / large phones */
@media (max-width: 768px) {
  .ef-container { gap: 1.25rem; }
  .ef-header { flex-direction: column; align-items: stretch; }
  .ef-title { font-size: 1.5rem; }
  .course-select-wrap { width: 100%; }
  .ef-select { min-width: 100%; }
  .no-courses-hint { max-width: 100%; }
  .question-card { flex-direction: row; padding: 1rem; }
  .closed-banner { padding: 1.5rem; }
  .pick-hint { padding: 3rem 1.5rem; }
  .ef-footer { align-items: stretch; }
  .submit-btn { justify-content: center; width: 100%; }
  .form-error { align-self: stretch; }
}

/* XS — Mobile phones */
@media (max-width: 480px) {
  .ef-container { gap: 1rem; }
  .ef-title { font-size: 1.3rem; }
  .ef-subtitle { font-size: 0.85rem; }
  .closed-banner { flex-direction: column; gap: 0.75rem; padding: 1.25rem; }
  .closed-banner svg { width: 32px; height: 32px; }
  .submitted-banner { flex-direction: column; text-align: center; gap: 0.6rem; padding: 1rem; }
  .question-card { flex-direction: column; gap: 0.6rem; padding: 0.9rem; }
  .q-number { width: 30px; height: 30px; font-size: 0.7rem; }
  .q-text { font-size: 0.87rem; }
  .opt-chip { padding: 0.4rem 0.75rem; font-size: 0.78rem; }
  .opts-rating5 .opt-chip, .opts-frequency .opt-chip { min-width: 70px; }
  .pick-hint { padding: 2.5rem 1rem; }
  .pick-hint svg { width: 38px; height: 38px; }
  .submit-btn { padding: 0.7rem 1.5rem; font-size: 0.88rem; }
}
</style>