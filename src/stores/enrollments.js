import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import { push } from 'notivue';
import { supabase } from './supabase';

const TABLE = 'enrollments';

function mapEnrollment(row) {
  return {
    id: row.id,
    studentId: row.student_id,
    courseId: row.course_id,
    createdAt: row.created_at,
  };
}

function toRow(enrollment) {
  const row = {};
  if (enrollment.studentId !== undefined) row.student_id = enrollment.studentId;
  if (enrollment.courseId !== undefined) row.course_id = enrollment.courseId;
  return row;
}

/** Normalizes known Postgres error codes into stable, UI-friendly codes. */
function normalizeError(err) {
  if (err?.code === '23505') {
    const normalized = new Error('This student is already enrolled in this course.');
    normalized.code = 'DUPLICATE_ENROLLMENT';
    return normalized;
  }
  if (err?.code === '23503') {
    const normalized = new Error('That student or course no longer exists.');
    normalized.code = 'ENROLLMENT_REFERENCE_MISSING';
    return normalized;
  }
  return err instanceof Error ? err : new Error(err?.message || 'Something went wrong.');
}

export const useEnrollmentsStore = defineStore('enrollments', () => {
  const enrollments = ref([]);
  const isLoading = ref(false);
  const error = ref('');
  let realtimeChannel = null;

  const enrollmentsCount = computed(() => enrollments.value.length);

  function enrollmentsByStudent(studentId) {
    return enrollments.value.filter((e) => e.studentId === studentId);
  }

  function enrollmentsByCourse(courseId) {
    return enrollments.value.filter((e) => e.courseId === courseId);
  }

  function isEnrolled(studentId, courseId) {
    return enrollments.value.some((e) => e.studentId === studentId && e.courseId === courseId);
  }

  /**
   * filters: { studentId?, courseId? }
   */
  async function fetchEnrollments(filters = {}) {
    isLoading.value = true;
    error.value = '';

    try {
      let query = supabase.from(TABLE).select('*').order('created_at', { ascending: false });

      if (filters.studentId) query = query.eq('student_id', filters.studentId);
      if (filters.courseId) query = query.eq('course_id', filters.courseId);

      const { data, error: fetchErr } = await query;
      if (fetchErr) throw fetchErr;

      enrollments.value = (data ?? []).map(mapEnrollment);
      return enrollments.value;
    } catch (err) {
      const normalized = normalizeError(err);
      error.value = normalized.message;
      push.error({ title: 'Failed to load enrollments', message: normalized.message });
      throw normalized;
    } finally {
      isLoading.value = false;
    }
  }

  /**
   * enrollment: { studentId, courseId }
   */
  async function createEnrollment(enrollment) {
    isLoading.value = true;
    error.value = '';

    try {
      const { data, error: insertErr } = await supabase
        .from(TABLE)
        .insert(toRow(enrollment))
        .select()
        .single();

      if (insertErr) throw insertErr;

      const created = mapEnrollment(data);
      enrollments.value.unshift(created);
      push.success({ title: 'Student enrolled' });
      return created;
    } catch (err) {
      const normalized = normalizeError(err);
      error.value = normalized.message;
      push.error({ title: 'Failed to enroll student', message: normalized.message });
      throw normalized;
    } finally {
      isLoading.value = false;
    }
  }

  async function deleteEnrollment(id) {
    isLoading.value = true;
    error.value = '';

    try {
      const { error: deleteErr } = await supabase.from(TABLE).delete().eq('id', id);
      if (deleteErr) throw deleteErr;

      enrollments.value = enrollments.value.filter((e) => e.id !== id);
      push.success({ title: 'Enrollment removed' });
    } catch (err) {
      const normalized = normalizeError(err);
      error.value = normalized.message;
      push.error({ title: 'Failed to remove enrollment', message: normalized.message });
      throw normalized;
    } finally {
      isLoading.value = false;
    }
  }

  function subscribeToEnrollments() {
    if (realtimeChannel) return;

    realtimeChannel = supabase
      .channel('enrollments-changes')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: TABLE },
        (payload) => {
          if (payload.eventType === 'INSERT') {
            const incoming = mapEnrollment(payload.new);
            if (!enrollments.value.some((e) => e.id === incoming.id)) {
              enrollments.value.unshift(incoming);
            }
          } else if (payload.eventType === 'DELETE') {
            enrollments.value = enrollments.value.filter((e) => e.id !== payload.old.id);
          }
        }
      )
      .subscribe();
  }

  function unsubscribeFromEnrollments() {
    if (!realtimeChannel) return;
    supabase.removeChannel(realtimeChannel);
    realtimeChannel = null;
  }

  return {
    enrollments,
    isLoading,
    error,
    enrollmentsCount,
    enrollmentsByStudent,
    enrollmentsByCourse,
    isEnrolled,
    fetchEnrollments,
    createEnrollment,
    deleteEnrollment,
    subscribeToEnrollments,
    unsubscribeFromEnrollments,
  };
});