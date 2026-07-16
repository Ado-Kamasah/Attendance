import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import { push } from 'notivue';
import { supabase } from './supabase';

const TABLE = 'schedules';

function mapSchedule(row) {
  return {
    id: row.id,
    courseId: row.course_id,
    level: row.level,
    mode: row.mode,
    day: row.day,
    startTime: row.start_time,
    endTime: row.end_time,
    venue: row.venue,
    lecturer: row.lecturer,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
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
      let query = supabase.from(TABLE).select('*').order('created_at', { ascending: false });

      if (filters.courseId) query = query.eq('course_id', filters.courseId);
      if (filters.lecturer) query = query.eq('lecturer', filters.lecturer);
      if (filters.day) query = query.eq('day', filters.day);

      const { data, error: fetchErr } = await query;
      if (fetchErr) throw fetchErr;

      schedules.value = (data ?? []).map(mapSchedule);
      return schedules.value;
    } catch (err) {
      const normalized = normalizeError(err);
      error.value = normalized.message;
      push.error({ title: 'Failed to load schedules', message: normalized.message });
      throw normalized;
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
      const { data, error: insertErr } = await supabase
        .from(TABLE)
        .insert(toRow(schedule))
        .select()
        .single();

      if (insertErr) throw insertErr;

      const created = mapSchedule(data);
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
      const { data, error: updateErr } = await supabase
        .from(TABLE)
        .update(toRow(updates))
        .eq('id', id)
        .select()
        .single();

      if (updateErr) throw updateErr;

      const updated = mapSchedule(data);
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
      const { error: deleteErr } = await supabase.from(TABLE).delete().eq('id', id);
      if (deleteErr) throw deleteErr;

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