import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import api from '@/api.js';
import { supabase } from '@/stores/supabase';

export const useClassRepStore = defineStore('classRep', () => {
  // ── State ────────────────────────────────────────────────────────────────────
  const allReps = ref([]);          // Admin: list of all class reps
  const myRoles = ref([]);          // Student: courses where I am class rep
  const students = ref([]);         // Admin: student list for assign modal
  const attendanceHistory = ref({}); // courseId → records[]
  const isLoading = ref(false);
  const error = ref('');

  // ── Computed ─────────────────────────────────────────────────────────────────
  const isClassRep = computed(() => myRoles.value.length > 0);
  const myRepCourseIds = computed(() => myRoles.value.map((r) => r.courseId));

  // ── Admin actions ─────────────────────────────────────────────────────────────
  async function fetchAllReps() {
    isLoading.value = true;
    try {
      const { data } = await api.get('/classrep/all');
      allReps.value = data;
    } catch (err) {
      error.value = err?.response?.data?.message || 'Failed to load class reps';
    } finally {
      isLoading.value = false;
    }
  }

  async function fetchStudents(courseId = null) {
    try {
      const params = courseId ? { courseId } : {};
      const { data } = await api.get('/classrep/students', { params });
      students.value = data;
    } catch (err) {
      error.value = err?.response?.data?.message || 'Failed to load students';
    }
  }

  // Load students directly from Supabase filtered by mode (+ optional level via programme join)
  async function fetchStudentsByFilter({ mode, level }) {
    isLoading.value = true;
    error.value = '';
    try {
      let query = supabase.from('users').select('*').eq('role', 'student'); if (mode) query = query.ilike('mode', mode);

      const { data, error: sbError } = await query;
      if (sbError) throw sbError;

      const mapped = (data ?? []).map(u => ({
        id:        u.id,
        name:      u.name,
        email:     u.email,
        studentId: u.id_number || u.student_id || u.id,
        mode:      u.mode,
      }));
      students.value = mapped.sort((a, b) => (a.name || '').localeCompare(b.name || ''));
    } catch (err) {
      console.error('Fetch students error:', err);
      error.value = err.message || 'Failed to load students';
      students.value = [];
    } finally {
      isLoading.value = false;
    }
  }

  async function assignClassRep(studentId, courseId) {
    isLoading.value = true;
    try {
      const { data } = await api.post('/classrep/assign', { studentId, courseId });
      await fetchAllReps();
      return data;
    } catch (err) {
      const msg = err?.response?.data?.message || 'Failed to assign class rep';
      error.value = msg;
      throw new Error(msg);
    } finally {
      isLoading.value = false;
    }
  }

  async function removeClassRep(courseId) {
    isLoading.value = true;
    try {
      await api.delete(`/classrep/${courseId}`);
      allReps.value = allReps.value.filter((r) => r.courseId !== courseId);
    } catch (err) {
      const msg = err?.response?.data?.message || 'Failed to remove class rep';
      error.value = msg;
      throw new Error(msg);
    } finally {
      isLoading.value = false;
    }
  }

  // ── Student / Class Rep actions ───────────────────────────────────────────────
  async function fetchMyRoles() {
    try {
      const { data } = await api.get('/classrep/my-roles');
      myRoles.value = data;
    } catch (err) {
      error.value = err?.response?.data?.message || 'Failed to load class rep roles';
    }
  }

  async function markLecturerAttendance({ courseId, date, time, status, notes }) {
    isLoading.value = true;
    try {
      const { data } = await api.post('/classrep/lecturer-attendance', {
        courseId, date, time, status, notes,
      });
      // Refresh history for this course
      await fetchAttendanceHistory(courseId);
      return data;
    } catch (err) {
      const msg = err?.response?.data?.message || 'Failed to record attendance';
      error.value = msg;
      throw new Error(msg);
    } finally {
      isLoading.value = false;
    }
  }

  async function fetchAttendanceHistory(courseId) {
    try {
      const { data } = await api.get(`/classrep/lecturer-attendance/${courseId}`);
      attendanceHistory.value = { ...attendanceHistory.value, [courseId]: data };
    } catch (err) {
      error.value = err?.response?.data?.message || 'Failed to load history';
    }
  }

  return {
    allReps,
    myRoles,
    students,
    attendanceHistory,
    isLoading,
    error,
    isClassRep,
    myRepCourseIds,
    fetchAllReps,
    fetchStudents,
    fetchStudentsByFilter,
    assignClassRep,
    removeClassRep,
    fetchMyRoles,
    markLecturerAttendance,
    fetchAttendanceHistory,
  };
});


