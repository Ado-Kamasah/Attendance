import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import { push } from 'notivue';
import { supabase } from './supabase';

const TABLE = 'semesters';

function mapSemester(row) {
  return {
    id: row.id,
    name: row.name,
    startDate: row.start_date,
    endDate: row.end_date,
    examsStart: row.exams_start,
    examsEnd: row.exams_end,
    isActive: row.is_active ?? false,
    createdAt: row.created_at,
  };
}

function toRow(semester) {
  const row = {};
  if (semester.name !== undefined) row.name = semester.name;
  if (semester.startDate !== undefined) row.start_date = semester.startDate;
  if (semester.endDate !== undefined) row.end_date = semester.endDate;
  if (semester.examsStart !== undefined) row.exams_start = semester.examsStart;
  if (semester.examsEnd !== undefined) row.exams_end = semester.examsEnd;
  if (semester.isActive !== undefined) row.is_active = semester.isActive;
  return row;
}

/** Normalizes known Postgres error codes into stable, UI-friendly codes. */
function normalizeError(err) {
  if (err?.code === '23505') {
    const normalized = new Error('A semester with this name already exists.');
    normalized.code = 'DUPLICATE_SEMESTER';
    return normalized;
  }
  return err instanceof Error ? err : new Error(err?.message || 'Something went wrong.');
}

export const useSemestersStore = defineStore('semesters', () => {
  const semesters = ref([]);
  const isLoading = ref(false);
  const error = ref('');
  let realtimeChannel = null;

  const activeSemester = computed(() => semesters.value.find((s) => s.isActive) ?? null);
  const semestersCount = computed(() => semesters.value.length);

  function getSemesterById(id) {
    return semesters.value.find((s) => s.id === id) ?? null;
  }

  function getSemesterByName(name) {
    return semesters.value.find((s) => s.name === name) ?? null;
  }

  async function fetchSemesters() {
    isLoading.value = true;
    error.value = '';

    try {
      const { data, error: fetchErr } = await supabase
        .from(TABLE)
        .select('*')
        .order('start_date', { ascending: false });

      if (fetchErr) throw fetchErr;

      semesters.value = (data ?? []).map(mapSemester);
      return semesters.value;
    } catch (err) {
      const normalized = normalizeError(err);
      error.value = normalized.message;
      push.error({ title: 'Failed to load semesters', message: normalized.message });
      throw normalized;
    } finally {
      isLoading.value = false;
    }
  }

  async function createSemester(semester) {
    isLoading.value = true;
    error.value = '';

    try {
      const { data, error: insertErr } = await supabase
        .from(TABLE)
        .insert(toRow(semester))
        .select()
        .single();

      if (insertErr) throw insertErr;

      const created = mapSemester(data);
      semesters.value.push(created);
      push.success({ title: 'Semester created', message: created.name });
      return created;
    } catch (err) {
      const normalized = normalizeError(err);
      error.value = normalized.message;
      push.error({ title: 'Failed to create semester', message: normalized.message });
      throw normalized;
    } finally {
      isLoading.value = false;
    }
  }

  async function updateSemester(id, updates) {
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

      const updated = mapSemester(data);
      const index = semesters.value.findIndex((s) => s.id === id);
      if (index !== -1) semesters.value[index] = updated;
      push.success({ title: 'Semester updated', message: updated.name });
      return updated;
    } catch (err) {
      const normalized = normalizeError(err);
      error.value = normalized.message;
      push.error({ title: 'Failed to update semester', message: normalized.message });
      throw normalized;
    } finally {
      isLoading.value = false;
    }
  }

  /** Sets one semester active and deactivates all others (single active semester). */
  async function setActiveSemester(id) {
    isLoading.value = true;
    error.value = '';

    try {
      const { error: deactivateErr } = await supabase
        .from(TABLE)
        .update({ is_active: false })
        .neq('id', id);
      if (deactivateErr) throw deactivateErr;

      const { data, error: activateErr } = await supabase
        .from(TABLE)
        .update({ is_active: true })
        .eq('id', id)
        .select()
        .single();
      if (activateErr) throw activateErr;

      const activated = mapSemester(data);
      semesters.value = semesters.value.map((s) =>
        s.id === id ? activated : { ...s, isActive: false }
      );
      push.success({ title: 'Active semester updated', message: activated.name });
      return activated;
    } catch (err) {
      const normalized = normalizeError(err);
      error.value = normalized.message;
      push.error({ title: 'Failed to set active semester', message: normalized.message });
      throw normalized;
    } finally {
      isLoading.value = false;
    }
  }

  async function deleteSemester(id) {
    isLoading.value = true;
    error.value = '';

    try {
      const { error: deleteErr } = await supabase.from(TABLE).delete().eq('id', id);
      if (deleteErr) throw deleteErr;

      semesters.value = semesters.value.filter((s) => s.id !== id);
      push.success({ title: 'Semester deleted' });
    } catch (err) {
      const normalized = normalizeError(err);
      error.value = normalized.message;
      push.error({ title: 'Failed to delete semester', message: normalized.message });
      throw normalized;
    } finally {
      isLoading.value = false;
    }
  }

  function subscribeToSemesters() {
    if (realtimeChannel) return;

    realtimeChannel = supabase
      .channel('semesters-changes')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: TABLE },
        (payload) => {
          if (payload.eventType === 'INSERT') {
            const incoming = mapSemester(payload.new);
            if (!semesters.value.some((s) => s.id === incoming.id)) {
              semesters.value.push(incoming);
            }
          } else if (payload.eventType === 'UPDATE') {
            const updated = mapSemester(payload.new);
            const index = semesters.value.findIndex((s) => s.id === updated.id);
            if (index !== -1) semesters.value[index] = updated;
          } else if (payload.eventType === 'DELETE') {
            semesters.value = semesters.value.filter((s) => s.id !== payload.old.id);
          }
        }
      )
      .subscribe();
  }

  function unsubscribeFromSemesters() {
    if (!realtimeChannel) return;
    supabase.removeChannel(realtimeChannel);
    realtimeChannel = null;
  }

  return {
    semesters,
    isLoading,
    error,
    activeSemester,
    semestersCount,
    getSemesterById,
    getSemesterByName,
    fetchSemesters,
    createSemester,
    updateSemester,
    setActiveSemester,
    deleteSemester,
    subscribeToSemesters,
    unsubscribeFromSemesters,
  };
});