import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import { push } from 'notivue';
import { supabase } from './supabase';

const TABLE = 'attendances';

function mapAttendance(row) {
  return {
    id: row.id,
    sessionId: row.session_id,
    studentId: row.student_id,
    timestamp: row.timestamp,
    status: row.status ?? 'present',
  };
}

function toRow(attendance) {
  const row = {};
  if (attendance.sessionId !== undefined) row.session_id = attendance.sessionId;
  if (attendance.studentId !== undefined) row.student_id = attendance.studentId;
  if (attendance.status !== undefined) row.status = attendance.status;
  return row;
}

/** Normalizes known Postgres error codes into stable, UI-friendly codes. */
function normalizeError(err) {
  if (err?.code === '23505') {
    const normalized = new Error('Attendance for this student and session is already recorded.');
    normalized.code = 'DUPLICATE_ATTENDANCE';
    return normalized;
  }
  if (err?.code === '23503') {
    const normalized = new Error('That session or student no longer exists.');
    normalized.code = 'ATTENDANCE_REFERENCE_MISSING';
    return normalized;
  }
  return err instanceof Error ? err : new Error(err?.message || 'Something went wrong.');
}

export const useAttendancesStore = defineStore('attendances', () => {
  const attendances = ref([]);
  const isLoading = ref(false);
  const error = ref('');
  let realtimeChannel = null;

  const attendancesCount = computed(() => attendances.value.length);
  const presentCount = computed(() => attendances.value.filter((a) => a.status === 'present').length);

  function attendancesBySession(sessionId) {
    return attendances.value.filter((a) => a.sessionId === sessionId);
  }

  function attendancesByStudent(studentId) {
    return attendances.value.filter((a) => a.studentId === studentId);
  }

  function hasAttended(sessionId, studentId) {
    return attendances.value.some((a) => a.sessionId === sessionId && a.studentId === studentId);
  }

  /** Finds the attendance row (if any) for a given session + student pair. */
  function getAttendanceRecord(sessionId, studentId) {
    return attendances.value.find((a) => a.sessionId === sessionId && a.studentId === studentId) ?? null;
  }

  /**
   * filters: { sessionId?, studentId?, status? }
   */
  async function fetchAttendances(filters = {}) {
    isLoading.value = true;
    error.value = '';

    try {
      let query = supabase.from(TABLE).select('*').order('timestamp', { ascending: false });

      if (filters.sessionId) query = query.eq('session_id', filters.sessionId);
      if (filters.studentId) query = query.eq('student_id', filters.studentId);
      if (filters.status) query = query.eq('status', filters.status);

      const { data, error: fetchErr } = await query;
      if (fetchErr) throw fetchErr;

      attendances.value = (data ?? []).map(mapAttendance);
      return attendances.value;
    } catch (err) {
      const normalized = normalizeError(err);
      error.value = normalized.message;
      push.error({ title: 'Failed to load attendance', message: normalized.message });
      throw normalized;
    } finally {
      isLoading.value = false;
    }
  }

  /**
   * attendance: { sessionId, studentId, status? } — status defaults to 'present'.
   * options: { silent? } — pass { silent: true } for bulk/background writes (e.g.
   * seeding pending/absent rows for a whole class) so it doesn't fire a toast per row.
   */
  async function markAttendance(attendance, options = {}) {
    isLoading.value = true;
    error.value = '';

    try {
      const { data, error: insertErr } = await supabase
        .from(TABLE)
        .insert(toRow(attendance))
        .select()
        .single();

      if (insertErr) throw insertErr;

      const created = mapAttendance(data);
      attendances.value.unshift(created);
      if (!options.silent) push.success({ title: 'Attendance recorded' });
      return created;
    } catch (err) {
      const normalized = normalizeError(err);
      error.value = normalized.message;
      if (!options.silent) push.error({ title: 'Failed to record attendance', message: normalized.message });
      throw normalized;
    } finally {
      isLoading.value = false;
    }
  }

  /**
   * options: { silent? } — see markAttendance.
   */
  async function updateAttendanceStatus(id, status, options = {}) {
    isLoading.value = true;
    error.value = '';

    try {
      const { data, error: updateErr } = await supabase
        .from(TABLE)
        .update({ status })
        .eq('id', id)
        .select()
        .single();

      if (updateErr) throw updateErr;

      const updated = mapAttendance(data);
      const index = attendances.value.findIndex((a) => a.id === id);
      if (index !== -1) attendances.value[index] = updated;
      if (!options.silent) push.success({ title: 'Attendance updated' });
      return updated;
    } catch (err) {
      const normalized = normalizeError(err);
      error.value = normalized.message;
      if (!options.silent) push.error({ title: 'Failed to update attendance', message: normalized.message });
      throw normalized;
    } finally {
      isLoading.value = false;
    }
  }

  async function deleteAttendance(id) {
    isLoading.value = true;
    error.value = '';

    try {
      const { error: deleteErr } = await supabase.from(TABLE).delete().eq('id', id);
      if (deleteErr) throw deleteErr;

      attendances.value = attendances.value.filter((a) => a.id !== id);
      push.success({ title: 'Attendance record deleted' });
    } catch (err) {
      const normalized = normalizeError(err);
      error.value = normalized.message;
      push.error({ title: 'Failed to delete attendance record', message: normalized.message });
      throw normalized;
    } finally {
      isLoading.value = false;
    }
  }

  function subscribeToAttendances() {
    if (realtimeChannel) return;

    realtimeChannel = supabase
      .channel('attendances-changes')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: TABLE },
        (payload) => {
          if (payload.eventType === 'INSERT') {
            const incoming = mapAttendance(payload.new);
            if (!attendances.value.some((a) => a.id === incoming.id)) {
              attendances.value.unshift(incoming);
            }
          } else if (payload.eventType === 'UPDATE') {
            const updated = mapAttendance(payload.new);
            const index = attendances.value.findIndex((a) => a.id === updated.id);
            if (index !== -1) attendances.value[index] = updated;
          } else if (payload.eventType === 'DELETE') {
            attendances.value = attendances.value.filter((a) => a.id !== payload.old.id);
          }
        }
      )
      .subscribe();
  }

  function unsubscribeFromAttendances() {
    if (!realtimeChannel) return;
    supabase.removeChannel(realtimeChannel);
    realtimeChannel = null;
  }

  /** Locally purge all attendance records for a deleted session. */
  function removeBySessionId(sessionId) {
    attendances.value = attendances.value.filter((a) => a.sessionId !== sessionId);
  }

  return {
    attendances,
    isLoading,
    error,
    attendancesCount,
    presentCount,
    attendancesBySession,
    attendancesByStudent,
    hasAttended,
    getAttendanceRecord,
    fetchAttendances,
    markAttendance,
    updateAttendanceStatus,
    deleteAttendance,
    removeBySessionId,
    subscribeToAttendances,
    unsubscribeFromAttendances,
  };
});