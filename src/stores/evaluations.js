import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import { supabase } from './supabase';
import { push } from 'notivue';
 
const EVAL_TABLE     = 'evaluations';
const SETTINGS_TABLE = 'evaluation_settings';
const SEMESTER_KEY   = 'Current'; // change to match your semester system

export const QUESTIONS = [
  { id: 'q1',  text: "How would you rate the lecturer's knowledge of the subject matter?",        type: 'rating5' },
  { id: 'q2',  text: 'How often did the lecturer arrive on time for class?',                       type: 'frequency' },
  { id: 'q3',  text: 'Did the lecturer provide advanced notice if a class would start late?',      type: 'frequency' },
  { id: 'q4',  text: 'Was the lecturer prompt in responding to emails or inquiries?',              type: 'frequency' },
  { id: 'q5',  text: 'Did the lecturer provide a course outline which was followed?',              type: 'yesno' },
  { id: 'q6',  text: 'Did the lecturer effectively communicate complex concepts and ideas?',       type: 'yesno' },
  { id: 'q7',  text: 'Were the teaching methods used by the lecturer engaging and interactive?',   type: 'yesno' },
  { id: 'q8',  text: 'Were the learning materials and resources provided useful?',                 type: 'yesno' },
  { id: 'q9',  text: 'Did the lecturer encourage active student participation during class?',      type: 'yesno' },
  { id: 'q10', text: "How would you rate the lecturer's ability to provide constructive feedback?", type: 'rating5' },
  { id: 'q11', text: "Did the lecturer demonstrate passion for the subject and interest in student success?", type: 'yesno' },
  { id: 'q12', text: 'Did the lecturer provide prompt feedback on assignments and CAs?',           type: 'yesno' },
  { id: 'q13', text: 'Were the lectures well-structured and organized?',                           type: 'yesno' },
  { id: 'q14', text: 'Was the lecturer accessible and available for help outside of class?',       type: 'yesno' },
  { id: 'q15', text: "Overall, how would you rate the lecturer's effectiveness in delivering the course content?", type: 'rating5' },
  { id: 'q16', text: 'Would you advise that the lecturer be retained?',                            type: 'yesno' },
];

export const OPTIONS = {
  rating5:   ['Excellent', 'Good', 'Normal', 'Not good', 'Very poor'],
  frequency: ['Always', 'Very often', 'Often', 'Rarely'],
  yesno:     ['Yes', 'No'],
};

// Score mapping for analytics (higher = better)
export const SCORE_MAP = {
  Excellent:    5, Good: 4, Normal: 3, 'Not good': 2, 'Very poor': 1,
  Always:       4, 'Very often': 3, Often: 2, Rarely: 1,
  Yes:          1, No: 0,
};

export const useEvaluationStore = defineStore('evaluations', () => {

  const evaluations   = ref([]);
  const settings      = ref({ isOpen: false, semester: SEMESTER_KEY, id: null });
  const isLoading     = ref(false);
  const isSubmitting  = ref(false);
  const error         = ref('');

  // ── Fetch all evaluations (admin) ─────────────────────────────────────────
  async function fetchEvaluations(filters = {}) {
    isLoading.value = true;
    error.value = '';
    try {
      let query = supabase.from(EVAL_TABLE).select('*').order('submitted_at', { ascending: false });
      if (filters.lecturerId) query = query.eq('lecturer_id', filters.lecturerId);
      if (filters.courseId)   query = query.eq('course_id',   filters.courseId);
      if (filters.semester)   query = query.eq('semester',    filters.semester);

      const { data, err } = await query;
      if (err) throw err;
      evaluations.value = data ?? [];
    } catch (e) {
      error.value = e?.message ?? 'Failed to load evaluations';
      console.error('[EvaluationStore]', e);
    } finally {
      isLoading.value = false;
    }
  }

  // ── Fetch evaluations for a specific student ──────────────────────────────
  async function fetchMyEvaluations(studentId) {
    isLoading.value = true;
    error.value = '';
    try {
      const { data, error: err } = await supabase
        .from(EVAL_TABLE)
        .select('*')
        .eq('student_id', studentId)
        .order('submitted_at', { ascending: false });
      if (err) throw err;
      evaluations.value = data ?? [];
    } catch (e) {
      error.value = e?.message ?? 'Failed to load your evaluations';
    } finally {
      isLoading.value = false;
    }
  }

  // ── Submit a new evaluation ───────────────────────────────────────────────
  async function submitEvaluation({ studentId, lecturerId, courseId, responses, comments }) {
    isSubmitting.value = true;
    error.value = '';
    try {
      const payload = {
        student_id:   studentId,
        lecturer_id:  lecturerId,
        course_id:    courseId,
        semester:     settings.value.semester || SEMESTER_KEY,
        responses,
        comments:     comments ?? '',
        submitted_at: new Date().toISOString(),
      };
      const { data, error: err } = await supabase
        .from(EVAL_TABLE)
        .insert(payload)
        .select()
        .single();
      if (err) throw err;
      evaluations.value.unshift(data);
      push.success({ title: 'Evaluation submitted', message: 'Thank you for your feedback!' });
      return data;
    } catch (e) {
      const msg = e?.message ?? 'Submission failed';
      error.value = msg;
      push.error({ title: 'Submission failed', message: msg });
      throw e;
    } finally {
      isSubmitting.value = false;
    }
  }

  // ── Load evaluation settings ──────────────────────────────────────────────
  async function fetchSettings() {
    try {
      const { data, error: err } = await supabase
        .from(SETTINGS_TABLE)
        .select('*')
        .eq('semester', SEMESTER_KEY)
        .maybeSingle();
      if (err) throw err;
      if (data) {
        settings.value = { isOpen: data.is_open, semester: data.semester, id: data.id };
      }
    } catch (e) {
      console.error('[EvaluationStore] fetchSettings:', e);
    }
  }

  // ── Toggle open/close (admin only) ───────────────────────────────────────
  async function toggleEvaluationAccess(adminId) {
    const newState = !settings.value.isOpen;
    try {
      const { error: err } = await supabase
        .from(SETTINGS_TABLE)
        .update({ is_open: newState, updated_at: new Date().toISOString(), updated_by: adminId })
        .eq('semester', SEMESTER_KEY);
      if (err) throw err;
      settings.value.isOpen = newState;
      push.success({
        title: `Evaluations ${newState ? 'opened' : 'closed'}`,
        message: `Students can ${newState ? 'now' : 'no longer'} submit evaluations.`,
      });
    } catch (e) {
      push.error({ title: 'Failed to update setting', message: e?.message });
    }
  }

  // ── Computed analytics (per lecturer) ────────────────────────────────────
  const analysisByLecturer = computed(() => {
    const grouped = {};
    evaluations.value.forEach(ev => {
      const key = ev.lecturer_id;
      if (!grouped[key]) grouped[key] = { lecturerId: key, responses: [] };
      grouped[key].responses.push(ev.responses);
    });

    return Object.values(grouped).map(({ lecturerId, responses }) => {
      const questionStats = QUESTIONS.map(q => {
        const answers = responses.map(r => r[q.id]).filter(Boolean);
        const counts = {};
        answers.forEach(a => { counts[a] = (counts[a] || 0) + 1; });
        const totalScore = answers.reduce((sum, a) => sum + (SCORE_MAP[a] ?? 0), 0);
        const avgScore   = answers.length ? (totalScore / answers.length).toFixed(2) : null;
        const maxScore   = q.type === 'rating5' ? 5 : q.type === 'frequency' ? 4 : 1;
        const pct        = avgScore ? Math.round((avgScore / maxScore) * 100) : null;
        return { questionId: q.id, text: q.text, type: q.type, counts, avgScore, pct, total: answers.length };
      });
      const yesNoRetained = responses.filter(r => r['q16'] === 'Yes').length;
      return { lecturerId, totalResponses: responses.length, questionStats, retainedPct: responses.length ? Math.round((yesNoRetained / responses.length) * 100) : 0 };
    });
  });

  function hasSubmitted(studentId, lecturerId, courseId) {
    return evaluations.value.some(
      e => e.student_id === studentId && e.lecturer_id === lecturerId && e.course_id === courseId
    );
  }

  return {
    evaluations,
    settings,
    isLoading,
    isSubmitting,
    error,
    analysisByLecturer,
    fetchEvaluations,
    fetchMyEvaluations,
    submitEvaluation,
    fetchSettings,
    toggleEvaluationAccess,
    hasSubmitted,
  };
});
