import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import { push } from 'notivue';
import { supabase } from './supabase';
import api from '@/api.js';

const TABLE = 'enrollments';

function mapEnrollment(row) {
  return {
    id: row.id,
    studentId: row.student_id || row.studentId,
    courseId: row.course_id || row.courseId,
    createdAt: row.created_at || row.createdAt,
    student: row.student || null,
    course: row.course || null,
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
      let supaList = [];
      try {
        let query = supabase.from(TABLE).select('*').order('created_at', { ascending: false });

        if (filters.studentId) query = query.eq('student_id', filters.studentId);
        if (filters.courseId) query = query.eq('course_id', filters.courseId);

        const { data, error: fetchErr } = await query;
        if (!fetchErr && data && data.length > 0) {
          supaList = data.map(mapEnrollment);
        }
      } catch (sbErr) {
        console.warn('Supabase enrollments fetch error, falling back to local API:', sbErr);
      }

      if (supaList.length > 0) {
        enrollments.value = supaList;
        return enrollments.value;
      }

      // Backend Express fallback
      try {
        const params = {};
        if (filters.courseId) params.courseId = filters.courseId;
        if (filters.studentId) params.studentId = filters.studentId;
        const res = await api.get('/courses/enrollments/master', { params });
        if (res.data && res.data.length > 0) {
          enrollments.value = res.data.map(mapEnrollment);
          return enrollments.value;
        }
      } catch (apiErr) {
        console.warn('Local enrollments API offline or empty:', apiErr.message);
      }

      enrollments.value = [];
      return enrollments.value;
    } catch (err) {
      const normalized = normalizeError(err);
      error.value = normalized.message;
      return [];
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
      let created = null;

      try {
        const { data, error: insertErr } = await supabase
          .from(TABLE)
          .insert(toRow(enrollment))
          .select()
          .single();

        if (!insertErr && data) {
          created = mapEnrollment(data);
        }
      } catch (sbErr) {
        console.warn('Supabase enrollment insert failed:', sbErr);
      }

      try {
        const res = await api.post(`/courses/${enrollment.courseId}/enroll`, { studentId: enrollment.studentId });
        if (res.data) {
          created = created || {
            id: `local-${Date.now()}`,
            studentId: enrollment.studentId,
            courseId: enrollment.courseId,
            createdAt: new Date().toISOString(),
          };
        }
      } catch (apiErr) {
        console.warn('Local enrollment API:', apiErr.message);
      }

      if (!created) {
        created = {
          id: `local-${Date.now()}`,
          studentId: enrollment.studentId,
          courseId: enrollment.courseId,
          createdAt: new Date().toISOString(),
        };
      }

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
      const existing = enrollments.value.find((e) => e.id === id);
      try {
        await supabase.from(TABLE).delete().eq('id', id);
      } catch (sbErr) {
        console.warn('Supabase delete enrollment failed:', sbErr);
      }

      if (existing) {
        try {
          await api.delete(`/courses/${existing.courseId}/enroll`, { data: { studentId: existing.studentId } });
        } catch (apiErr) {
          console.warn('Local unenroll API:', apiErr.message);
        }
      }

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
