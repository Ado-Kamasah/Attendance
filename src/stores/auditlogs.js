import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import { push } from 'notivue';
import { supabase } from './supabase';

const TABLE = 'audit_logs';

function mapAuditLog(row) {
  return {
    id: row.id,
    action: row.action,
    details: row.details,
    userId: row.user_id,
    userRole: row.user_role,
    userName: row.user_name,
    timestamp: row.timestamp,
  };
}

function toRow(entry) {
  const row = {};
  if (entry.action !== undefined) row.action = entry.action;
  if (entry.details !== undefined) row.details = entry.details;
  if (entry.userId !== undefined) row.user_id = entry.userId;
  if (entry.userRole !== undefined) row.user_role = entry.userRole;
  if (entry.userName !== undefined) row.user_name = entry.userName;
  return row;
}

function normalizeError(err) {
  return err instanceof Error ? err : new Error(err?.message || 'Something went wrong.');
}

/**
 * audit_logs is an append-only trail: writes go through logAction(), and there
 * is deliberately no updateLog(). deleteLog() exists only for admin cleanup
 * (e.g. retention policies), not for correcting entries.
 */
export const useAuditLogsStore = defineStore('auditLogs', () => {
  const logs = ref([]);
  const isLoading = ref(false);
  const error = ref('');
  let realtimeChannel = null;

  const logsCount = computed(() => logs.value.length);

  function logsByUser(userId) {
    return logs.value.filter((l) => l.userId === userId);
  }

  function logsByAction(action) {
    return logs.value.filter((l) => l.action === action);
  }

  /**
   * filters: { userId?, action?, since? } — since is an ISO timestamp string.
   */
  async function fetchLogs(filters = {}) {
    isLoading.value = true;
    error.value = '';

    try {
      let query = supabase.from(TABLE).select('*').order('timestamp', { ascending: false });

      if (filters.userId) query = query.eq('user_id', filters.userId);
      if (filters.action) query = query.eq('action', filters.action);
      if (filters.since) query = query.gte('timestamp', filters.since);

      const { data, error: fetchErr } = await query;
      if (fetchErr) throw fetchErr;

      logs.value = (data ?? []).map(mapAuditLog);
      return logs.value;
    } catch (err) {
      const normalized = normalizeError(err);
      error.value = normalized.message;
      push.error({ title: 'Failed to load audit logs', message: normalized.message });
      throw normalized;
    } finally {
      isLoading.value = false;
    }
  }

  /**
   * entry: { action, details, userId, userRole, userName }
   * Records an audit trail entry. Fails silently into the console rather than
   * blocking the calling action — a logging failure shouldn't break the app.
   */
  async function logAction(entry) {
    try {
      const { data, error: insertErr } = await supabase
        .from(TABLE)
        .insert(toRow(entry))
        .select()
        .single();

      if (insertErr) throw insertErr;

      const created = mapAuditLog(data);
      logs.value.unshift(created);
      return created;
    } catch (err) {
      console.error('Failed to write audit log:', err);
      return null;
    }
  }

  /** Admin-only cleanup of a single log entry. */
  async function deleteLog(id) {
    isLoading.value = true;
    error.value = '';

    try {
      const { error: deleteErr } = await supabase.from(TABLE).delete().eq('id', id);
      if (deleteErr) throw deleteErr;

      logs.value = logs.value.filter((l) => l.id !== id);
      push.success({ title: 'Log entry deleted' });
    } catch (err) {
      const normalized = normalizeError(err);
      error.value = normalized.message;
      push.error({ title: 'Failed to delete log entry', message: normalized.message });
      throw normalized;
    } finally {
      isLoading.value = false;
    }
  }

  function subscribeToLogs() {
    if (realtimeChannel) return;

    realtimeChannel = supabase
      .channel('audit-logs-changes')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: TABLE },
        (payload) => {
          if (payload.eventType === 'INSERT') {
            const incoming = mapAuditLog(payload.new);
            if (!logs.value.some((l) => l.id === incoming.id)) {
              logs.value.unshift(incoming);
            }
          } else if (payload.eventType === 'DELETE') {
            logs.value = logs.value.filter((l) => l.id !== payload.old.id);
          }
        }
      )
      .subscribe();
  }

  function unsubscribeFromLogs() {
    if (!realtimeChannel) return;
    supabase.removeChannel(realtimeChannel);
    realtimeChannel = null;
  }

  return {
    logs,
    isLoading,
    error,
    logsCount,
    logsByUser,
    logsByAction,
    fetchLogs,
    logAction,
    deleteLog,
    subscribeToLogs,
    unsubscribeFromLogs,
  };
});