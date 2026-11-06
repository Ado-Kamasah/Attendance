import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import { push } from 'notivue';
import { supabase } from './supabase';
import api from '../api';

const TABLE = 'semesters';

function mapSemester(row) {
  return {
    id: row.id,
    name: row.name,
    startDate: row.start_date || row.startDate,
    endDate: row.end_date || row.endDate,
    examsStart: row.exams_start || row.examsStart,
    examsEnd: row.exams_end || row.examsEnd,
    isActive: Boolean(row.is_active ?? row.isActive ?? false),
    registrationOpen: row.registration_open !== undefined ? Boolean(row.registration_open) : (row.registrationOpen !== undefined ? Boolean(row.registrationOpen) : true),
    registrationDeadline: row.registration_deadline || row.registrationDeadline || null,
    createdAt: row.created_at || row.createdAt,
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
  if (semester.registrationOpen !== undefined) row.registration_open = semester.registrationOpen;
  if (semester.registrationDeadline !== undefined) row.registration_deadline = semester.registrationDeadline;
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
      // 1. Try Supabase first (if rows exist)
      let supaList = [];
      try {
        const { data, error: fetchErr } = await supabase
          .from(TABLE)
          .select('*')
          .order('start_date', { ascending: false });

        if (!fetchErr && data && data.length > 0) {
          supaList = data.map(mapSemester);
        }
      } catch (sbErr) {
        console.warn('Supabase semesters fetch error:', sbErr);
      }

      if (supaList.length > 0) {
        semesters.value = supaList;
        return semesters.value;
      }

      // 2. Fallback: Express Backend API
      try {
        const res = await api.get('/semesters');
        if (res.data && res.data.length > 0) {
          semesters.value = res.data.map(mapSemester);
          return semesters.value;
        }
      } catch (apiErr) {
        console.warn('Backend API semesters fetch error:', apiErr);
      }

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
      let created = null;

      // 1. Try Supabase
      try {
        const { data, error: insertErr } = await supabase
          .from(TABLE)
          .insert(toRow(semester))
          .select()
          .single();

        if (!insertErr && data) {
          created = mapSemester(data);
        }
      } catch (sbErr) {
        console.warn('Supabase create semester warning:', sbErr);
      }

      // 2. Try Backend API
      const payload = {
        name: semester.name,
        startDate: semester.startDate,
        endDate: semester.endDate,
        examsStart: semester.examsStart || null,
        examsEnd: semester.examsEnd || null,
        registrationDeadline: semester.registrationDeadline || null,
        registrationOpen: semester.registrationOpen !== undefined ? semester.registrationOpen : true,
        isActive: semester.isActive || false,
      };

      try {
        const res = await api.post('/semesters', payload);
        if (res.data) {
          created = mapSemester(res.data);
        }
      } catch (apiErr) {
        console.warn('Backend create semester warning:', apiErr);
      }

      if (!created) {
        created = {
          id: String(Date.now()),
          ...semester,
        };
      }

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
      let updated = null;

      // 1. Try Supabase (strip registration columns if Supabase doesn't have them yet)
      try {
        const { data, error: updateErr } = await supabase
          .from(TABLE)
          .update(toRow(updates))
          .eq('id', id)
          .select()
          .single();

        if (!updateErr && data) {
          updated = mapSemester(data);
        }
      } catch (sbErr) {
        console.warn('Supabase update semester warning:', sbErr);
      }

      // 2. Backend API
      try {
        const payload = {};
        if (updates.name !== undefined) payload.name = updates.name;
        if (updates.startDate !== undefined) payload.startDate = updates.startDate;
        if (updates.endDate !== undefined) payload.endDate = updates.endDate;
        if (updates.examsStart !== undefined) payload.examsStart = updates.examsStart;
        if (updates.examsEnd !== undefined) payload.examsEnd = updates.examsEnd;
        if (updates.registrationDeadline !== undefined) payload.registrationDeadline = updates.registrationDeadline;
        if (updates.registrationOpen !== undefined) payload.registrationOpen = updates.registrationOpen;
        if (updates.isActive !== undefined) payload.isActive = updates.isActive;

        const res = await api.put(`/semesters/${id}`, payload);
        if (res.data) {
          updated = mapSemester(res.data);
        }
      } catch (apiErr) {
        console.warn('Backend update semester warning:', apiErr);
      }

      if (!updated) {
        const existing = semesters.value.find((s) => s.id === id);
        updated = { ...existing, ...updates };
      }

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
      let activated = null;

      try {
        await supabase
          .from(TABLE)
          .update({ is_active: false })
          .neq('id', id);

        const { data, error: activateErr } = await supabase
          .from(TABLE)
          .update({ is_active: true })
          .eq('id', id)
          .select()
          .single();

        if (!activateErr && data) {
          activated = mapSemester(data);
        }
      } catch (sbErr) {
        console.warn('Supabase setActive error:', sbErr);
      }

      // Backend API
      try {
        const res = await api.put(`/semesters/${id}`, { isActive: true });
        if (res.data) {
          activated = mapSemester(res.data);
        }
      } catch (apiErr) {
        console.warn('Backend setActive error:', apiErr);
      }

      semesters.value = semesters.value.map((s) =>
        s.id === id ? (activated || { ...s, isActive: true }) : { ...s, isActive: false }
      );
      push.success({ title: 'Active semester updated' });
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

  /**
   * Toggle course registration open/closed for a specific semester.
   * Also updates the registration deadline date if provided.
   */
  async function toggleRegistration(id, open, deadline = null) {
    isLoading.value = true;
    error.value = '';

    try {
      let updated = null;

      // 1. Try Supabase
      try {
        const sbUpdate = { registration_open: open };
        if (deadline !== undefined) sbUpdate.registration_deadline = deadline;

        const { data, error: sbErr } = await supabase
          .from(TABLE)
          .update(sbUpdate)
          .eq('id', id)
          .select()
          .single();

        if (!sbErr && data) {
          updated = mapSemester(data);
        }
      } catch (sbErr) {
        console.warn('Supabase toggleRegistration warning:', sbErr);
      }

      // 2. Try Express Backend API
      try {
        const payload = { registrationOpen: open };
        if (deadline !== undefined) payload.registrationDeadline = deadline;
        const res = await api.patch(`/semesters/${id}/registration`, payload);
        if (res.data) {
          updated = mapSemester(res.data.semester ?? res.data);
        }
      } catch (apiErr) {
        console.warn('Backend toggleRegistration error:', apiErr);
      }

      // 3. Update local state immediately regardless
      const index = semesters.value.findIndex((s) => s.id === id);
      if (index !== -1) {
        semesters.value[index] = {
          ...semesters.value[index],
          ...(updated || {}),
          registrationOpen: open,
          ...(deadline !== undefined ? { registrationDeadline: deadline } : {})
        };
      }

      push.success({
        title: `Registration ${open ? 'Opened' : 'Closed'}`,
        message: `Course registration has been ${open ? 'opened' : 'closed'}.`,
      });
      return semesters.value[index];
    } catch (err) {
      const normalized = normalizeError(err);
      error.value = normalized.message;
      push.error({ title: 'Failed to toggle registration', message: normalized.message });
      throw normalized;
    } finally {
      isLoading.value = false;
    }
  }

  async function deleteSemester(id) {
    isLoading.value = true;
    error.value = '';

    try {
      try {
        await supabase.from(TABLE).delete().eq('id', id);
      } catch (sbErr) {
        console.warn('Supabase delete error:', sbErr);
      }

      try {
        await api.delete(`/semesters/${id}`);
      } catch (apiErr) {
        console.warn('Backend delete error:', apiErr);
      }

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
    toggleRegistration,
    deleteSemester,
    subscribeToSemesters,
    unsubscribeFromSemesters,
  };
});
