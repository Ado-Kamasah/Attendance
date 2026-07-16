import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import { push } from 'notivue';
import { supabase } from './supabase';

const TABLE = 'programmes';

function mapProgramme(row) {
  return {
    id: row.id,
    slug: row.slug,
    name: row.name,
    degreeAbbreviation: row.degree_abbreviation,
    level: row.level,
    displayOrder: row.display_order ?? 0,
    isActive: row.is_active ?? true,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

function toRow(programme) {
  const row = {};
  if (programme.slug !== undefined) row.slug = programme.slug;
  if (programme.name !== undefined) row.name = programme.name;
  if (programme.degreeAbbreviation !== undefined) row.degree_abbreviation = programme.degreeAbbreviation;
  if (programme.level !== undefined) row.level = programme.level;
  if (programme.displayOrder !== undefined) row.display_order = programme.displayOrder;
  if (programme.isActive !== undefined) row.is_active = programme.isActive;
  return row;
}

/** Normalizes known Postgres error codes into stable, UI-friendly codes. */
function normalizeError(err) {
  if (err?.code === '23505') {
    const normalized = new Error('A programme with this slug or name already exists.');
    normalized.code = 'DUPLICATE_PROGRAMME';
    return normalized;
  }
  if (err?.code === '23514') {
    const normalized = new Error('Level must be Undergraduate, Postgraduate, or Doctorate.');
    normalized.code = 'INVALID_PROGRAMME_LEVEL';
    return normalized;
  }
  return err instanceof Error ? err : new Error(err?.message || 'Something went wrong.');
}

export const useProgrammesStore = defineStore('programmes', () => {
  const programmes = ref([]);
  const isLoading = ref(false);
  const error = ref('');
  let realtimeChannel = null;

  const activeProgrammes = computed(() =>
    programmes.value
      .filter((p) => p.isActive)
      .sort((a, b) => a.displayOrder - b.displayOrder)
  );
  const programmesCount = computed(() => programmes.value.length);

  function programmesByLevel(level) {
    return programmes.value.filter((p) => p.level === level);
  }

  function getProgrammeById(id) {
    return programmes.value.find((p) => p.id === id) ?? null;
  }

  function getProgrammeBySlug(slug) {
    return programmes.value.find((p) => p.slug === slug) ?? null;
  }

  async function fetchProgrammes(filters = {}) {
    isLoading.value = true;
    error.value = '';

    try {
      let query = supabase.from(TABLE).select('*').order('display_order', { ascending: true });

      if (filters.level) query = query.eq('level', filters.level);
      if (filters.isActive !== undefined) query = query.eq('is_active', filters.isActive);

      const { data, error: fetchErr } = await query;
      if (fetchErr) throw fetchErr;

      programmes.value = (data ?? []).map(mapProgramme);
      return programmes.value;
    } catch (err) {
      const normalized = normalizeError(err);
      error.value = normalized.message;
      push.error({ title: 'Failed to load programmes', message: normalized.message });
      throw normalized;
    } finally {
      isLoading.value = false;
    }
  }

  async function fetchProgrammeById(id) {
    isLoading.value = true;
    error.value = '';

    try {
      const { data, error: fetchErr } = await supabase
        .from(TABLE)
        .select('*')
        .eq('id', id)
        .single();

      if (fetchErr) throw fetchErr;

      const programme = mapProgramme(data);
      const index = programmes.value.findIndex((p) => p.id === id);
      if (index === -1) {
        programmes.value.push(programme);
      } else {
        programmes.value[index] = programme;
      }
      return programme;
    } catch (err) {
      const normalized = normalizeError(err);
      error.value = normalized.message;
      push.error({ title: 'Failed to load programme', message: normalized.message });
      throw normalized;
    } finally {
      isLoading.value = false;
    }
  }

  /**
   * programme: { slug, name, degreeAbbreviation, level, displayOrder?, isActive? }
   */
  async function createProgramme(programme) {
    isLoading.value = true;
    error.value = '';

    try {
      const { data, error: insertErr } = await supabase
        .from(TABLE)
        .insert(toRow(programme))
        .select()
        .single();

      if (insertErr) throw insertErr;

      const created = mapProgramme(data);
      programmes.value.push(created);
      programmes.value.sort((a, b) => a.displayOrder - b.displayOrder);
      push.success({ title: 'Programme created', message: created.name });
      return created;
    } catch (err) {
      const normalized = normalizeError(err);
      error.value = normalized.message;
      push.error({ title: 'Failed to create programme', message: normalized.message });
      throw normalized;
    } finally {
      isLoading.value = false;
    }
  }

  async function updateProgramme(id, updates) {
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

      const updated = mapProgramme(data);
      const index = programmes.value.findIndex((p) => p.id === id);
      if (index !== -1) programmes.value[index] = updated;
      programmes.value.sort((a, b) => a.displayOrder - b.displayOrder);
      push.success({ title: 'Programme updated', message: updated.name });
      return updated;
    } catch (err) {
      const normalized = normalizeError(err);
      error.value = normalized.message;
      push.error({ title: 'Failed to update programme', message: normalized.message });
      throw normalized;
    } finally {
      isLoading.value = false;
    }
  }

  async function deleteProgramme(id) {
    isLoading.value = true;
    error.value = '';

    try {
      const { error: deleteErr } = await supabase.from(TABLE).delete().eq('id', id);
      if (deleteErr) throw deleteErr;

      programmes.value = programmes.value.filter((p) => p.id !== id);
      push.success({ title: 'Programme deleted' });
    } catch (err) {
      const normalized = normalizeError(err);
      error.value = normalized.message;
      push.error({ title: 'Failed to delete programme', message: normalized.message });
      throw normalized;
    } finally {
      isLoading.value = false;
    }
  }

  function subscribeToProgrammes() {
    if (realtimeChannel) return;

    realtimeChannel = supabase
      .channel('programmes-changes')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: TABLE },
        (payload) => {
          if (payload.eventType === 'INSERT') {
            const incoming = mapProgramme(payload.new);
            if (!programmes.value.some((p) => p.id === incoming.id)) {
              programmes.value.push(incoming);
              programmes.value.sort((a, b) => a.displayOrder - b.displayOrder);
            }
          } else if (payload.eventType === 'UPDATE') {
            const updated = mapProgramme(payload.new);
            const index = programmes.value.findIndex((p) => p.id === updated.id);
            if (index !== -1) programmes.value[index] = updated;
            programmes.value.sort((a, b) => a.displayOrder - b.displayOrder);
          } else if (payload.eventType === 'DELETE') {
            programmes.value = programmes.value.filter((p) => p.id !== payload.old.id);
          }
        }
      )
      .subscribe();
  }

  function unsubscribeFromProgrammes() {
    if (!realtimeChannel) return;
    supabase.removeChannel(realtimeChannel);
    realtimeChannel = null;
  }

  return {
    programmes,
    isLoading,
    error,
    activeProgrammes,
    programmesCount,
    programmesByLevel,
    getProgrammeById,
    getProgrammeBySlug,
    fetchProgrammes,
    fetchProgrammeById,
    createProgramme,
    updateProgramme,
    deleteProgramme,
    subscribeToProgrammes,
    unsubscribeFromProgrammes,
  };
});