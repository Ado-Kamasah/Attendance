import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import { push } from 'notivue';
import { supabase } from './supabase';

import api from '@/api.js';

const TABLE = 'courses';

function mapCourse(row) {
  return {
    id: row.id,
    code: row.code,
    name: row.name,
    credits: row.credits ?? 0,
    programId: row.program_id || row.program,        // ✅ FK now
    program: row.program || row.program_id || '',
    faculty: row.faculty || null,
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
  if (course.level !== undefined) row.level = course.level;
  if (course.semester !== undefined) row.semester = course.semester;
  if (course.status !== undefined) row.status = course.status;
  if (course.programId !== undefined) row.program_id = course.programId;
  else if (course.program !== undefined) row.program_id = course.program;
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
      'This course has schedules, enrollments, or sessions attached and cannot be deleted, or the selected programme no longer exists.'
    );
    normalized.code = 'COURSE_IN_USE';
    return normalized;
  }
  return err instanceof Error ? err : new Error(err?.message || 'Something went wrong.');
}

export const useCoursesStore = defineStore('courses', () => {
  const courses = ref([]);
  const isLoading = ref(false); // fetch/read loading
  const isSaving = ref(false);  // create/update/delete loading
  const error = ref('');
  let realtimeChannel = null;

  const activeCourses = computed(() => courses.value.filter((c) => c.status === 'active'));
  const coursesCount = computed(() => courses.value.length);

  function coursesByProgram(programId) {
    return courses.value.filter((c) => c.programId === programId);
  }

  function getCourseById(id) {
    if (!id) return null;
    return courses.value.find((c) => c.id === id || c.code === id) ?? null;
  }

  function getCourseByCode(code) {
    return courses.value.find((c) => c.code === code) ?? null;
  }

  /**
   * filters: { programId?, level?, semester?, status? }
   */
  async function fetchCourses(filters = {}) {
    isLoading.value = true;
    error.value = '';

    try {
      // Try Supabase first — if Supabase returns rows, use them
      let supaList = [];
      try {
        let query = supabase.from(TABLE).select('*').order('code', { ascending: true });

        if (filters.programId) query = query.eq('program_id', filters.programId);
        if (filters.level) query = query.eq('level', filters.level);
        if (filters.semester) query = query.eq('semester', filters.semester);
        if (filters.status) query = query.eq('status', filters.status);

        const { data, error: fetchErr } = await query;
        if (!fetchErr && data && data.length > 0) {
          supaList = data.map(mapCourse);
        }
      } catch (sbErr) {
        console.warn('Supabase courses fetch error, falling back to local API:', sbErr);
      }

      if (supaList.length > 0) {
        courses.value = supaList;
        return courses.value;
      }

      // Backend Express fallback
      try {
        const res = await api.get('/courses');
        if (res.data && res.data.length > 0) {
          courses.value = res.data.map(c => ({
            id: c.id,
            code: c.code,
            name: c.name,
            credits: c.credits ?? 3,
            programId: c.program,
            level: c.level,
            semester: c.semester || 'Semester 1',
            status: c.status || 'active',
            lecturer: c.lecturer || null,
            lecturerId: c.lecturerId || null,
            schedules: Array.isArray(c.schedules) ? c.schedules : [],
            createdAt: c.createdAt,
            updatedAt: c.updatedAt
          }));
          return courses.value;
        }
      } catch (apiErr) {
        console.warn('Local courses API offline or empty:', apiErr.message);
      }

      courses.value = [];
      return courses.value;
    } catch (err) {
      const normalized = normalizeError(err);
      error.value = normalized.message;
      return [];
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
   * course: { code, name, credits, programId, level, semester?, status? }
   */
  async function createCourse(course) {
    isSaving.value = true;
    error.value = '';

    try {
      let created = null;

      // 1. Try Supabase insert
      try {
        const { data, error: insertErr } = await supabase
          .from(TABLE)
          .insert(toRow(course))
          .select()
          .single();

        if (!insertErr && data) {
          created = mapCourse(data);
        }
      } catch (sbErr) {
        console.warn('Supabase course creation notice:', sbErr);
      }

      // 2. Try Backend Express API (persists in dev.db / SQLite)
      try {
        const payload = {
          code: (course.code || '').trim().toUpperCase(),
          name: (course.name || '').trim(),
          credits: parseInt(course.credits ?? 3, 10),
          program: (course.program || course.programId || 'General').trim(),
          faculty: course.faculty ? course.faculty.trim() : null,
          level: (course.level || '100').toString().trim(),
          semester: course.semester || 'Semester 1',
          status: course.status || 'active'
        };
        const res = await api.post('/courses', payload);
        if (res.data?.course) {
          const apiCourse = res.data.course;
          if (!created) {
            created = {
              id: apiCourse.id,
              code: apiCourse.code,
              name: apiCourse.name,
              credits: apiCourse.credits,
              programId: apiCourse.program,
              program: apiCourse.program,
              faculty: apiCourse.faculty || course.faculty || null,
              level: apiCourse.level,
              semester: apiCourse.semester,
              status: apiCourse.status,
              createdAt: apiCourse.createdAt,
              updatedAt: apiCourse.updatedAt
            };
          }
        }
      } catch (apiErr) {
        console.warn('Backend API course creation notice:', apiErr.response?.data?.message || apiErr.message);
      }

      if (!created) {
        created = {
          id: `crs-${Date.now()}`,
          code: (course.code || '').trim().toUpperCase(),
          name: (course.name || '').trim(),
          credits: parseInt(course.credits ?? 3, 10),
          programId: course.program || course.programId || 'General',
          program: course.program || course.programId || 'General',
          faculty: course.faculty || null,
          level: (course.level || '100').toString(),
          semester: course.semester || 'Semester 1',
          status: course.status || 'active',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        };
      }

      if (course.program && !created.program) created.program = course.program;
      if (course.faculty && !created.faculty) created.faculty = course.faculty;

      const idx = courses.value.findIndex(c => c.id === created.id || c.code === created.code);
      if (idx === -1) {
        courses.value.unshift(created);
      } else {
        courses.value[idx] = { ...courses.value[idx], ...created };
      }

      push.success({ title: 'Course created', message: `${created.code} — ${created.name}` });
      return created;
    } catch (err) {
      const normalized = normalizeError(err);
      error.value = normalized.message;
      push.error({ title: 'Failed to create course', message: normalized.message });
      throw normalized;
    } finally {
      isSaving.value = false;
    }
  }

  async function updateCourse(id, updates) {
    isSaving.value = true;
    error.value = '';

    try {
      let updated = null;

      // 1. Try Supabase update
      try {
        const { data, error: updateErr } = await supabase
          .from(TABLE)
          .update(toRow(updates))
          .eq('id', id)
          .select()
          .single();

        if (!updateErr && data) {
          updated = mapCourse(data);
        }
      } catch (sbErr) {
        console.warn('Supabase course update notice:', sbErr);
      }

      // 2. Try Backend Express API update
      try {
        const payload = {
          code: updates.code ? updates.code.trim().toUpperCase() : undefined,
          name: updates.name ? updates.name.trim() : undefined,
          credits: updates.credits !== undefined ? parseInt(updates.credits, 10) : undefined,
          program: updates.program || updates.programId ? (updates.program || updates.programId).trim() : undefined,
          faculty: updates.faculty !== undefined ? (updates.faculty ? updates.faculty.trim() : null) : undefined,
          level: updates.level ? updates.level.toString().trim() : undefined,
          semester: updates.semester ? updates.semester.trim() : undefined,
          status: updates.status || undefined
        };
        const res = await api.put(`/courses/${id}`, payload);
        if (res.data?.course && !updated) {
          const apiCourse = res.data.course;
          updated = {
            id: apiCourse.id,
            code: apiCourse.code,
            name: apiCourse.name,
            credits: apiCourse.credits,
            programId: apiCourse.program,
            program: apiCourse.program,
            faculty: apiCourse.faculty || updates.faculty || null,
            level: apiCourse.level,
            semester: apiCourse.semester,
            status: apiCourse.status,
            createdAt: apiCourse.createdAt,
            updatedAt: apiCourse.updatedAt
          };
        }
      } catch (apiErr) {
        console.warn('Backend API course update notice:', apiErr.response?.data?.message || apiErr.message);
      }

      if (!updated) {
        const existing = courses.value.find(c => c.id === id);
        updated = { ...(existing || {}), ...updates, id };
      }

      if (updates.program && !updated.program) updated.program = updates.program;
      if (updates.faculty !== undefined) updated.faculty = updates.faculty;

      const index = courses.value.findIndex((c) => c.id === id);
      if (index !== -1) {
        courses.value[index] = { ...courses.value[index], ...updated };
      }
      push.success({ title: 'Course updated', message: `${updated.code || ''} — ${updated.name || ''}` });
      return updated;
    } catch (err) {
      const normalized = normalizeError(err);
      error.value = normalized.message;
      push.error({ title: 'Failed to update course', message: normalized.message });
      throw normalized;
    } finally {
      isSaving.value = false;
    }
  }

  async function deleteCourse(id) {
    isSaving.value = true;
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
      isSaving.value = false;
    }
  }

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
    isSaving,
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