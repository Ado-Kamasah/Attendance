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
          <select id="ef-course-select" v-model="selectedEnrollment" class="ef-select">
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

const authStore    = useAuthStore();
const enrollStore  = useEnrollmentsStore();
const courseStore  = useCoursesStore();
const schedStore   = useSchedulesStore();
const evalStore    = useEvaluationStore();

const { profile }     = storeToRefs(authStore);
const { enrollments } = storeToRefs(enrollStore);
const { courses }     = storeToRefs(courseStore);
const { schedules }   = storeToRefs(schedStore);

const selectedEnrollment = ref('');
const responses          = reactive({});
const comments           = ref('');
const submitted          = ref(false);
const formError          = ref('');

// lecturer name cache
const lecturerMap = ref({});

onMounted(async () => {
  const uid = profile.value?.id;
  await Promise.all([
    enrollStore.fetchEnrollments({ studentId: uid }),
    courseStore.fetchCourses(),
    schedStore.fetchSchedules(),
    evalStore.fetchSettings(),
    evalStore.fetchMyEvaluations(uid),
  ]);
  // load lecturer names
  const lecturerIds = [...new Set(schedules.value.map(s => s.lecturerId).filter(Boolean))];
  if (lecturerIds.length) {
    const { data } = await supabase.from('users').select('id, name').in('id', lecturerIds);
    (data ?? []).forEach(u => { lecturerMap.value[u.id] = u.name; });
  }
});

// build enrollment options: one per enrolled course that has a lecturer assigned
const eligibleEnrollments = computed(() => {
  const myEnrollments = enrollments.value.filter(e => e.studentId === profile.value?.id);
  const result = [];
  myEnrollments.forEach(enr => {
    const course    = courseStore.getCourseById(enr.courseId);
    const schedule  = schedules.value.find(s => s.courseId === enr.courseId && s.lecturerId);
    if (!course || !schedule?.lecturerId) return;
    result.push({
      key:          `${enr.courseId}::${schedule.lecturerId}`,
      courseId:     enr.courseId,
      lecturerId:   schedule.lecturerId,
      courseCode:   course.code,
      courseName:   course.name,
      lecturerName: lecturerMap.value[schedule.lecturerId] ?? 'Lecturer',
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
  const missing = QUESTIONS.filter(q => !responses[q.id]);
  if (missing.length) {
    formError.value = `Please answer all ${missing.length} unanswered question(s) before submitting.`;
    document.querySelector('.q-error')?.scrollIntoView({ behavior: 'smooth', block: 'center' });
    return;
  }
  const enr = currentEnrollment.value;
  if (!enr) return;
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
.course-select-wrap { display: flex; flex-direction: column; gap: .35rem; }
.sel-label { font-size: .78rem; font-weight: 600; color: #64748b; text-transform: uppercase; letter-spacing: .05em; }
.ef-select { padding: .55rem 1rem; border: 1.5px solid #e2e8f0; border-radius: 10px; font-size: .9rem; color: #334155; background: #fff; min-width: 320px; outline: none; cursor: pointer; }
.ef-select:focus { border-color: #6366f1; }

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
.q-body { flex: 1; display: flex; flex-direction: column; gap: .75rem; }
.q-text { margin: 0; font-size: .925rem; font-weight: 600; color: #1e293b; line-height: 1.4; }

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
@media(max-width:768px) { .ef-header { flex-direction: column; } .ef-select { min-width: 100%; } }
</style>
