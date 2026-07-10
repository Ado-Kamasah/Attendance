import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import { push } from 'notivue';
import { supabase } from './supabase';

const TABLE = 'courses';

function mapCourse(row) {
  return {
    id: row.id,
    code: row.code,
    name: row.name,
    credits: row.credits ?? 0,
    program: row.program,
    level: row.level,
    semester: row.semester ?? 'Semester 1',
    status: row.status ?? 'active',
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

function toRow(course) {
  const row = {};
  if (course.code !== undefined) row.code = course.code;
  if (course.name !== undefined) row.name = course.name;
  if (course.credits !== undefined) row.credits = course.credits;
  if (course.program !== undefined) row.program = course.program;
  if (course.level !== undefined) row.level = course.level;
  if (course.semester !== undefined) row.semester = course.semester;
  if (course.status !== undefined) row.status = course.status;
  return row;
}

/** Normalizes known Postgres error codes into stable, UI-friendly codes. */
function normalizeError(err) {
  if (err?.code === '23505') {
    const normalized = new Error('A course with this code already exists.');
    normalized.code = 'DUPLICATE_COURSE_CODE';
    return normalized;
  }
  if (err?.code === '23503') {
    const normalized = new Error(
      'This course has schedules, enrollments, or sessions attached and cannot be deleted.'
    );
    normalized.code = 'COURSE_IN_USE';
    return normalized;
  }
  return err instanceof Error ? err : new Error(err?.message || 'Something went wrong.');
}

export const useCoursesStore = defineStore('courses', () => {
  const courses = ref([]);
  const isLoading = ref(false);
  const error = ref('');
  let realtimeChannel = null;

  const activeCourses = computed(() => courses.value.filter((c) => c.status === 'active'));
  const coursesCount = computed(() => courses.value.length);

  function coursesByProgram(program) {
    return courses.value.filter((c) => c.program === program);
  }

  function getCourseById(id) {
    return courses.value.find((c) => c.id === id) ?? null;
  }

  function getCourseByCode(code) {
    return courses.value.find((c) => c.code === code) ?? null;
  }

  /**
   * filters: { program?, level?, semester?, status? }
   */
  async function fetchCourses(filters = {}) {
    isLoading.value = true;
    error.value = '';

    try {
      let query = supabase.from(TABLE).select('*').order('code', { ascending: true });

      if (filters.program) query = query.eq('program', filters.program);
      if (filters.level) query = query.eq('level', filters.level);
      if (filters.semester) query = query.eq('semester', filters.semester);
      if (filters.status) query = query.eq('status', filters.status);

      const { data, error: fetchErr } = await query;
      if (fetchErr) throw fetchErr;

      courses.value = (data ?? []).map(mapCourse);
      return courses.value;
    } catch (err) {
      const normalized = normalizeError(err);
      error.value = normalized.message;
      push.error({ title: 'Failed to load courses', message: normalized.message });
      throw normalized;
    } finally {
      isLoading.value = false;
    }
  }

  async function fetchCourseById(id) {
    isLoading.value = true;
    error.value = '';

    try {
      const { data, error: fetchErr } = await supabase
        .from(TABLE)
        .select('*')
        .eq('id', id)
        .single();

      if (fetchErr) throw fetchErr;

      const course = mapCourse(data);
      const index = courses.value.findIndex((c) => c.id === id);
      if (index === -1) {
        courses.value.push(course);
      } else {
        courses.value[index] = course;
      }
      return course;
    } catch (err) {
      const normalized = normalizeError(err);
      error.value = normalized.message;
      push.error({ title: 'Failed to load course', message: normalized.message });
      throw normalized;
    } finally {
      isLoading.value = false;
    }
  }

  /**
   * course: { code, name, credits, program, level, semester?, status? }
   */
  async function createCourse(course) {
    isLoading.value = true;
    error.value = '';

    try {
      const { data, error: insertErr } = await supabase
        .from(TABLE)
        .insert(toRow(course))
        .select()
        .single();

      if (insertErr) throw insertErr;

      const created = mapCourse(data);
      courses.value.unshift(created);
      push.success({ title: 'Course created', message: `${created.code} — ${created.name}` });
      return created;
    } catch (err) {
      const normalized = normalizeError(err);
      error.value = normalized.message;
      push.error({ title: 'Failed to create course', message: normalized.message });
      throw normalized;
    } finally {
      isLoading.value = false;
    }
  }

  async function updateCourse(id, updates) {
    isLoading.value = true;
    error.value = '';

    try {
      const { data, error: updateErr } = await supabase
        .from(TABLE)
        .update(toRow(updates))
        .eq('id', id)
        .select()
        .single();

      if (updateErr) throw updateErr;

      const updated = mapCourse(data);
      const index = courses.value.findIndex((c) => c.id === id);
      if (index !== -1) courses.value[index] = updated;
      push.success({ title: 'Course updated', message: `${updated.code} — ${updated.name}` });
      return updated;
    } catch (err) {
      const normalized = normalizeError(err);
      error.value = normalized.message;
      push.error({ title: 'Failed to update course', message: normalized.message });
      throw normalized;
    } finally {
      isLoading.value = false;
    }
  }

  async function deleteCourse(id) {
    isLoading.value = true;
    error.value = '';

    try {
      const { error: deleteErr } = await supabase.from(TABLE).delete().eq('id', id);
      if (deleteErr) throw deleteErr;

      courses.value = courses.value.filter((c) => c.id !== id);
      push.success({ title: 'Course deleted' });
    } catch (err) {
      const normalized = normalizeError(err);
      error.value = normalized.message;
      push.error({ title: 'Failed to delete course', message: normalized.message });
      throw normalized;
    } finally {
      isLoading.value = false;
    }
  }

  /**
   * Subscribes to realtime changes on the courses table and keeps local
   * state in sync. Call unsubscribeFromCourses() on unmount.
   */
  function subscribeToCourses() {
    if (realtimeChannel) return;

    realtimeChannel = supabase
      .channel('courses-changes')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: TABLE },
        (payload) => {
          if (payload.eventType === 'INSERT') {
            const incoming = mapCourse(payload.new);
            if (!courses.value.some((c) => c.id === incoming.id)) {
              courses.value.unshift(incoming);
            }
          } else if (payload.eventType === 'UPDATE') {
            const updated = mapCourse(payload.new);
            const index = courses.value.findIndex((c) => c.id === updated.id);
            if (index !== -1) courses.value[index] = updated;
          } else if (payload.eventType === 'DELETE') {
            courses.value = courses.value.filter((c) => c.id !== payload.old.id);
          }
        }
      )
      .subscribe();
  }

  function unsubscribeFromCourses() {
    if (!realtimeChannel) return;
    supabase.removeChannel(realtimeChannel);
    realtimeChannel = null;
  }

  return {
    courses,
    isLoading,
    error,
    activeCourses,
    coursesCount,
    coursesByProgram,
    getCourseById,
    getCourseByCode,
    fetchCourses,
    fetchCourseById,
    createCourse,
    updateCourse,
    deleteCourse,
    subscribeToCourses,
    unsubscribeFromCourses,
  };
});