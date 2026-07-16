import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import { push } from 'notivue';
import { supabase } from './supabase';

const TABLE = 'faculties';

function mapFaculty(row) {
  return {
    id: row.id,
    name: row.name,
    createdAt: row.created_at,
  };
}

function toRow(faculty) {
  const row = {};
  if (faculty.name !== undefined) row.name = faculty.name;
  return row;
}

/** Normalizes known Postgres error codes into stable, UI-friendly codes. */
function normalizeError(err) {
  if (err?.code === '23505') {
    const normalized = new Error('A faculty with this name already exists.');
    normalized.code = 'DUPLICATE_FACULTY';
    return normalized;
  }
  return err instanceof Error ? err : new Error(err?.message || 'Something went wrong.');
}

export const useFacultiesStore = defineStore('faculties', () => {
  const faculties = ref([]);
  const isLoading = ref(false);
  const error = ref('');
  let realtimeChannel = null;

  const facultiesCount = computed(() => faculties.value.length);

  function getFacultyById(id) {
    return faculties.value.find((f) => f.id === id) ?? null;
  }

  function getFacultyByName(name) {
    return faculties.value.find((f) => f.name === name) ?? null;
  }

  async function fetchFaculties() {
    isLoading.value = true;
    error.value = '';

    try {
      const { data, error: fetchErr } = await supabase
        .from(TABLE)
        .select('*')
        .order('name', { ascending: true });

      if (fetchErr) throw fetchErr;

      faculties.value = (data ?? []).map(mapFaculty);
      return faculties.value;
    } catch (err) {
      const normalized = normalizeError(err);
      error.value = normalized.message;
      push.error({ title: 'Failed to load faculties', message: normalized.message });
      throw normalized;
    } finally {
      isLoading.value = false;
    }
  }

  async function createFaculty(faculty) {
    isLoading.value = true;
    error.value = '';

    try {
      const { data, error: insertErr } = await supabase
        .from(TABLE)
        .insert(toRow(faculty))
        .select()
        .single();

      if (insertErr) throw insertErr;

      const created = mapFaculty(data);
      faculties.value.push(created);
      push.success({ title: 'Faculty created', message: created.name });
      return created;
    } catch (err) {
      const normalized = normalizeError(err);
      error.value = normalized.message;
      push.error({ title: 'Failed to create faculty', message: normalized.message });
      throw normalized;
    } finally {
      isLoading.value = false;
    }
  }

  async function updateFaculty(id, updates) {
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

      const updated = mapFaculty(data);
      const index = faculties.value.findIndex((f) => f.id === id);
      if (index !== -1) faculties.value[index] = updated;
      push.success({ title: 'Faculty updated', message: updated.name });
      return updated;
    } catch (err) {
      const normalized = normalizeError(err);
      error.value = normalized.message;
      push.error({ title: 'Failed to update faculty', message: normalized.message });
      throw normalized;
    } finally {
      isLoading.value = false;
    }
  }

  async function deleteFaculty(id) {
    isLoading.value = true;
    error.value = '';

    try {
      const { error: deleteErr } = await supabase.from(TABLE).delete().eq('id', id);
      if (deleteErr) throw deleteErr;

      faculties.value = faculties.value.filter((f) => f.id !== id);
      push.success({ title: 'Faculty deleted' });
    } catch (err) {
      const normalized = normalizeError(err);
      error.value = normalized.message;
      push.error({ title: 'Failed to delete faculty', message: normalized.message });
      throw normalized;
    } finally {
      isLoading.value = false;
    }
  }

  function subscribeToFaculties() {
    if (realtimeChannel) return;

    realtimeChannel = supabase
      .channel('faculties-changes')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: TABLE },
        (payload) => {
          if (payload.eventType === 'INSERT') {
            const incoming = mapFaculty(payload.new);
            if (!faculties.value.some((f) => f.id === incoming.id)) {
              faculties.value.push(incoming);
            }
          } else if (payload.eventType === 'UPDATE') {
            const updated = mapFaculty(payload.new);
            const index = faculties.value.findIndex((f) => f.id === updated.id);
            if (index !== -1) faculties.value[index] = updated;
          } else if (payload.eventType === 'DELETE') {
            faculties.value = faculties.value.filter((f) => f.id !== payload.old.id);
          }
        }
      )
      .subscribe();
  }

  function unsubscribeFromFaculties() {
    if (!realtimeChannel) return;
    supabase.removeChannel(realtimeChannel);
    realtimeChannel = null;
  }

  return {
    faculties,
    isLoading,
    error,
    facultiesCount,
    getFacultyById,
    getFacultyByName,
    fetchFaculties,
    createFaculty,
    updateFaculty,
    deleteFaculty,
    subscribeToFaculties,
    unsubscribeFromFaculties,
  };
});