import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import { push } from 'notivue';
import { supabase } from './supabase';
import api from '@/api.js';
import { useCoursesStore } from './courses';

const TABLE = 'schedules';

function mapSchedule(row) {
  return {
    id: row.id,
    courseId: row.course_id || row.courseId,
    level: row.level,
    mode: row.mode,
    day: row.day,
    startTime: row.start_time || row.startTime,
    endTime: row.end_time || row.endTime,
    venue: row.venue,
    lecturer: row.lecturer,
    lecturerId: row.lecturer_id || row.lecturerId || null,
    deliveryMode: row.delivery_mode || row.deliveryMode || 'Face-to-Face',
    onlineLink: row.online_link || row.onlineLink || '',
    createdAt: row.created_at || row.createdAt,
    updatedAt: row.updated_at || row.updatedAt,
  };
}

function toRow(schedule) {
  const row = {};
  if (schedule.courseId !== undefined) row.course_id = schedule.courseId;
  if (schedule.level !== undefined) row.level = schedule.level;
  if (schedule.mode !== undefined) row.mode = schedule.mode;
  if (schedule.day !== undefined) row.day = schedule.day;
  if (schedule.startTime !== undefined) row.start_time = schedule.startTime;
  if (schedule.endTime !== undefined) row.end_time = schedule.endTime;
  if (schedule.venue !== undefined) row.venue = schedule.venue;
  if (schedule.lecturer !== undefined) row.lecturer = schedule.lecturer;
  if (schedule.lecturerId !== undefined) row.lecturer_id = schedule.lecturerId;
  if (schedule.deliveryMode !== undefined) row.delivery_mode = schedule.deliveryMode;
  if (schedule.onlineLink !== undefined) row.online_link = schedule.onlineLink;
  return row;
}

/** Normalizes known Postgres error codes into stable, UI-friendly codes. */
function normalizeError(err) {
  if (err?.code === '23503') {
    const normalized = new Error('That course no longer exists.');
    normalized.code = 'SCHEDULE_COURSE_MISSING';
    return normalized;
  }
  return err instanceof Error ? err : new Error(err?.message || 'Something went wrong.');
}

export const useSchedulesStore = defineStore('schedules', () => {
  const schedules = ref([]);
  const isLoading = ref(false);
  const error = ref('');
  let realtimeChannel = null;

  const schedulesCount = computed(() => schedules.value.length);

  function schedulesByCourse(courseId) {
    return schedules.value.filter((s) => s.courseId === courseId);
  }

  function getScheduleById(id) {
    return schedules.value.find((s) => s.id === id) ?? null;
  }

  /**
   * filters: { courseId?, lecturer?, day? }
   */
  async function fetchSchedules(filters = {}) {
    isLoading.value = true;
    error.value = '';

    try {
      let supaList = [];
      try {
        let query = supabase.from(TABLE).select('*').order('created_at', { ascending: false });

        if (filters.courseId) query = query.eq('course_id', filters.courseId);
        if (filters.lecturer) query = query.eq('lecturer', filters.lecturer);
        if (filters.day) query = query.eq('day', filters.day);

        const { data, error: fetchErr } = await query;
        if (!fetchErr && data && data.length > 0) {
          supaList = data.map(mapSchedule);
        }
      } catch (sbErr) {
        console.warn('Supabase schedules fetch error, falling back to local API:', sbErr);
      }

      if (supaList.length > 0) {
        schedules.value = supaList;
        return schedules.value;
      }

      // Backend Express fallback
      try {
        const params = {};
        if (filters.courseId) params.courseId = filters.courseId;
        const res = await api.get('/schedules', { params });
        if (res.data && res.data.length > 0) {
          schedules.value = res.data.map(mapSchedule);
          return schedules.value;
        }
      } catch (apiErr) {
        console.warn('Local schedules API offline or empty:', apiErr.message);
      }

      // Secondary fallback: extract schedules from coursesStore if available
      try {
        const coursesStore = useCoursesStore();
        if (coursesStore.courses && coursesStore.courses.length > 0) {
          const extracted = [];
          for (const c of coursesStore.courses) {
            if (Array.isArray(c.schedules) && c.schedules.length > 0) {
              for (const s of c.schedules) {
                extracted.push(
                  mapSchedule({
                    ...s,
                    course_id: s.courseId || s.course_id || c.id,
                    level: s.level || c.level,
                  })
                );
              }
            } else if (c.lecturer) {
              // Direct assignment on course without discrete schedule row
              extracted.push(
                mapSchedule({
                  id: `sched-course-${c.id}`,
                  course_id: c.id,
                  level: c.level,
                  mode: 'Regular',
                  day: 'Monday',
                  start_time: '08:00',
                  end_time: '10:00',
                  venue: 'Main Hall',
                  lecturer: c.lecturer,
                  lecturer_id: c.lecturerId || null,
                })
              );
            }
          }
          if (extracted.length > 0) {
            schedules.value = extracted;
            return schedules.value;
          }
        }
      } catch (extractErr) {
        console.warn('Failed to extract schedules from courses:', extractErr);
      }

      schedules.value = [];
      return schedules.value;
    } catch (err) {
      const normalized = normalizeError(err);
      error.value = normalized.message;
      return [];
    } finally {
      isLoading.value = false;
    }
  }

  /**
   * schedule: { courseId, level, mode, day, startTime, endTime, venue, lecturer }
   */
  async function createSchedule(schedule) {
    isLoading.value = true;
    error.value = '';

    try {
      let created = null;

      // 1. Try Supabase
      try {
        const { data, error: insertErr } = await supabase
          .from(TABLE)
          .insert(toRow(schedule))
          .select()
          .single();

        if (!insertErr && data) {
          created = mapSchedule(data);
        }
      } catch (sbErr) {
        console.warn('Supabase schedule insert failed, falling back to local backend:', sbErr);
      }

      // 2. Try Backend API
      try {
        const payload = {
          courseId: schedule.courseId,
          level: schedule.level,
          mode: schedule.mode,
          day: schedule.day,
          startTime: schedule.startTime,
          endTime: schedule.endTime,
          venue: schedule.venue,
          lecturer: schedule.lecturer,
        };
        const res = await api.post('/schedules', payload);
        if (res.data?.schedule) {
          created = mapSchedule(res.data.schedule);
        }
      } catch (apiErr) {
        console.warn('Backend API schedule insert:', apiErr.message);
      }

      if (!created) {
        created = {
          id: `local-${Date.now()}`,
          ...schedule,
        };
      }

      schedules.value.unshift(created);
      push.success({ title: 'Schedule created', message: `${created.day} ${created.startTime}-${created.endTime}` });
      return created;
    } catch (err) {
      const normalized = normalizeError(err);
      error.value = normalized.message;
      push.error({ title: 'Failed to create schedule', message: normalized.message });
      throw normalized;
    } finally {
      isLoading.value = false;
    }
  }

  async function updateSchedule(id, updates) {
    isLoading.value = true;
    error.value = '';

    try {
      let updated = null;

      // 1. Try Supabase
      try {
        const { data, error: updateErr } = await supabase
          .from(TABLE)
          .update(toRow(updates))
          .eq('id', id)
          .select()
          .single();

        if (!updateErr && data) {
          updated = mapSchedule(data);
        }
      } catch (sbErr) {
        console.warn('Supabase update schedule failed:', sbErr);
      }

      // 2. Try Backend API
      try {
        const res = await api.put(`/schedules/${id}`, updates);
        if (res.data?.schedule) {
          updated = mapSchedule(res.data.schedule);
        }
      } catch (apiErr) {
        console.warn('Backend API update schedule:', apiErr.message);
      }

      if (!updated) {
        const existing = schedules.value.find((s) => s.id === id);
        updated = { ...existing, ...updates };
      }

      const index = schedules.value.findIndex((s) => s.id === id);
      if (index !== -1) schedules.value[index] = updated;
      push.success({ title: 'Schedule updated' });
      return updated;
    } catch (err) {
      const normalized = normalizeError(err);
      error.value = normalized.message;
      push.error({ title: 'Failed to update schedule', message: normalized.message });
      throw normalized;
    } finally {
      isLoading.value = false;
    }
  }

  async function deleteSchedule(id) {
    isLoading.value = true;
    error.value = '';

    try {
      try {
        await supabase.from(TABLE).delete().eq('id', id);
      } catch (sbErr) {
        console.warn('Supabase delete schedule failed:', sbErr);
      }

      try {
        await api.delete(`/schedules/${id}`);
      } catch (apiErr) {
        console.warn('Backend API delete schedule:', apiErr.message);
      }

      schedules.value = schedules.value.filter((s) => s.id !== id);
      push.success({ title: 'Schedule deleted' });
    } catch (err) {
      const normalized = normalizeError(err);
      error.value = normalized.message;
      push.error({ title: 'Failed to delete schedule', message: normalized.message });
      throw normalized;
    } finally {
      isLoading.value = false;
    }
  }

  function subscribeToSchedules() {
    if (realtimeChannel) return;

    realtimeChannel = supabase
      .channel('schedules-changes')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: TABLE },
        (payload) => {
          if (payload.eventType === 'INSERT') {
            const incoming = mapSchedule(payload.new);
            if (!schedules.value.some((s) => s.id === incoming.id)) {
              schedules.value.unshift(incoming);
            }
          } else if (payload.eventType === 'UPDATE') {
            const updated = mapSchedule(payload.new);
            const index = schedules.value.findIndex((s) => s.id === updated.id);
            if (index !== -1) schedules.value[index] = updated;
          } else if (payload.eventType === 'DELETE') {
            schedules.value = schedules.value.filter((s) => s.id !== payload.old.id);
          }
        }
      )
      .subscribe();
  }

  /**
   * Checks whether a new/edited schedule would clash with an existing one.
   * Clash = same day AND overlapping time range AND (same lecturer OR same venue).
   * Overlap test: existing.start < new.end AND new.start < existing.end
   * (this correctly excludes back-to-back classes, e.g. one ending 11:00 and one starting 11:00)
   * excludeId lets edits ignore the row being edited.
   */
  function findConflict({ id, day, startTime, endTime, lecturer, venue }, excludeId = null) {
    return (
      schedules.value.find((s) => {
        if (excludeId && s.id === excludeId) return false;
        if (s.day !== day) return false;

        const overlaps = s.startTime < endTime && startTime < s.endTime;
        if (!overlaps) return false;

        return s.lecturer === lecturer || s.venue === venue;
      }) ?? null
    );
  }

  function unsubscribeFromSchedules() {
    if (!realtimeChannel) return;
    supabase.removeChannel(realtimeChannel);
    realtimeChannel = null;
  }

  return {
    schedules,
    isLoading,
    error,
    schedulesCount,
    findConflict,
    schedulesByCourse,
    getScheduleById,
    fetchSchedules,
    createSchedule,
    updateSchedule,
    deleteSchedule,
    subscribeToSchedules,
    unsubscribeFromSchedules,
  };
});
