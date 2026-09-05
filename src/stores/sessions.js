import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import { push } from 'notivue';
import { supabase } from './supabase';

const TABLE = 'sessions';

function mapSession(row) {
  return {
    id: row.id,
    courseId: row.course_id,
    lecturerId: row.lecturer_id,
    mode: row.mode ?? null,
    date: row.date,
    pin: row.pin,
    maxStudents: row.max_students,
    isActive: row.is_active ?? true,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

function toRow(session) {
  const row = {};
  if (session.courseId !== undefined) row.course_id = session.courseId;
  if (session.lecturerId !== undefined) row.lecturer_id = session.lecturerId;
  if (session.mode !== undefined) row.mode = session.mode;
  if (session.date !== undefined) row.date = session.date;
  if (session.pin !== undefined) row.pin = session.pin;
  if (session.maxStudents !== undefined) row.max_students = session.maxStudents;
  if (session.isActive !== undefined) row.is_active = session.isActive;
  return row;
}

/** Generates a random numeric PIN as a string, e.g. "482913". */
function generatePin(length = 6) {
  let pin = '';
  for (let i = 0; i < length; i++) pin += Math.floor(Math.random() * 10);
  return pin;
}

/** Normalizes known Postgres error codes into stable, UI-friendly codes. */
function normalizeError(err) {
  if (err?.code === '23505') {
    const normalized = new Error('That session PIN is already in use — try again.');
    normalized.code = 'DUPLICATE_SESSION_PIN';
    return normalized;
  }
  if (err?.code === '23503') {
    const normalized = new Error('That course or lecturer no longer exists.');
    normalized.code = 'SESSION_REFERENCE_MISSING';
    return normalized;
  }
  return err instanceof Error ? err : new Error(err?.message || 'Something went wrong.');
}

export const useSessionsStore = defineStore('sessions', () => {
  const sessions = ref([]);
  const isLoading = ref(false);
  const error = ref('');
  let realtimeChannel = null;

  const activeSessions = computed(() => sessions.value.filter((s) => s.isActive));
  const sessionsCount = computed(() => sessions.value.length);

  function sessionsByCourse(courseId) {
    return sessions.value.filter((s) => s.courseId === courseId);
  }

  function sessionsByLecturer(lecturerId) {
    return sessions.value.filter((s) => s.lecturerId === lecturerId);
  }

  function getSessionById(id) {
    return sessions.value.find((s) => s.id === id) ?? null;
  }

  function getSessionByPin(pin) {
    return sessions.value.find((s) => s.pin === pin) ?? null;
  }

  /**
   * filters: { courseId?, lecturerId?, isActive? }
   */
  async function fetchSessions(filters = {}) {
    isLoading.value = true;
    error.value = '';

    try {
      let query = supabase.from(TABLE).select('*').order('date', { ascending: false });

      if (filters.courseId) query = query.eq('course_id', filters.courseId);
      if (filters.lecturerId) query = query.eq('lecturer_id', filters.lecturerId);
      if (filters.isActive !== undefined) query = query.eq('is_active', filters.isActive);

      const { data, error: fetchErr } = await query;
      if (fetchErr) throw fetchErr;

      sessions.value = (data ?? []).map(mapSession);
      return sessions.value;
    } catch (err) {
      const normalized = normalizeError(err);
      error.value = normalized.message;
      push.error({ title: 'Failed to load sessions', message: normalized.message });
      throw normalized;
    } finally {
      isLoading.value = false;
    }
  }

  /**
   * session: { courseId, lecturerId, date?, pin?, maxStudents, isActive? }
   * A PIN is auto-generated if not supplied.
   */
  async function createSession(session) {
    isLoading.value = true;
    error.value = '';

    try {
      const payload = { pin: generatePin(), ...toRow(session) };

      const { data, error: insertErr } = await supabase
        .from(TABLE)
        .insert(payload)
        .select()
        .single();

      if (insertErr) throw insertErr;

      const created = mapSession(data);
      sessions.value.unshift(created);
      push.success({ title: 'Session started', message: 'Attendance recorded and confirmation codes sent.' });
      return created;
    } catch (err) {
      const normalized = normalizeError(err);
      error.value = normalized.message;
      push.error({ title: 'Failed to start session', message: normalized.message });
      throw normalized;
    } finally {
      isLoading.value = false;
    }
  }

  async function updateSession(id, updates) {
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

      const updated = mapSession(data);
      const index = sessions.value.findIndex((s) => s.id === id);
      if (index !== -1) sessions.value[index] = updated;
      push.success({ title: 'Session updated' });
      return updated;
    } catch (err) {
      const normalized = normalizeError(err);
      error.value = normalized.message;
      push.error({ title: 'Failed to update session', message: normalized.message });
      throw normalized;
    } finally {
      isLoading.value = false;
    }
  }

  /** Convenience wrapper to close a session (stop accepting attendance). */
  async function closeSession(id) {
    return updateSession(id, { isActive: false });
  }

  async function deleteSession(id) {
    isLoading.value = true;
    error.value = '';

    try {
      const { error: deleteErr } = await supabase.from(TABLE).delete().eq('id', id);
      if (deleteErr) throw deleteErr;

      sessions.value = sessions.value.filter((s) => s.id !== id);
      push.success({ title: 'Session deleted' });
    } catch (err) {
      const normalized = normalizeError(err);
      error.value = normalized.message;
      push.error({ title: 'Failed to delete session', message: normalized.message });
      throw normalized;
    } finally {
      isLoading.value = false;
    }
  }

  function subscribeToSessions() {
    if (realtimeChannel) return;

    realtimeChannel = supabase
      .channel('sessions-changes')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: TABLE },
        (payload) => {
          if (payload.eventType === 'INSERT') {
            const incoming = mapSession(payload.new);
            if (!sessions.value.some((s) => s.id === incoming.id)) {
              sessions.value.unshift(incoming);
            }
          } else if (payload.eventType === 'UPDATE') {
            const updated = mapSession(payload.new);
            const index = sessions.value.findIndex((s) => s.id === updated.id);
            if (index !== -1) sessions.value[index] = updated;
          } else if (payload.eventType === 'DELETE') {
            sessions.value = sessions.value.filter((s) => s.id !== payload.old.id);
          }
        }
      )
      .subscribe();
  }

  function unsubscribeFromSessions() {
    if (!realtimeChannel) return;
    supabase.removeChannel(realtimeChannel);
    realtimeChannel = null;
  }

  return {
    sessions,
    isLoading,
    error,
    activeSessions,
    sessionsCount,
    sessionsByCourse,
    sessionsByLecturer,
    getSessionById,
    getSessionByPin,
    fetchSessions,
    createSession,
    updateSession,
    closeSession,
    deleteSession,
    subscribeToSessions,
    unsubscribeFromSessions,
  };
});