import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import { supabase } from '@/stores/supabase';
import { useAuthStore } from '@/stores/authstore.js';
import { useCoursesStore } from '@/stores/courses.js';

export const useClassRepStore = defineStore('classRep', () => {
  // â”€â”€ State â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  const allReps = ref([]);
  const myRoles = ref([]);
  const students = ref([]);
  const attendanceHistory = ref({});
  const isLoading = ref(false);
  const error = ref('');

  // â”€â”€ Computed â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  const isClassRep = computed(() => myRoles.value.length > 0);
  const myRepCourseIds = computed(() => myRoles.value.map((r) => r.courseId));

  // â”€â”€ Admin: fetch all class reps â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  async function fetchAllReps() {
    isLoading.value = true;
    error.value = '';
    try {
      const { data, error: sbErr } = await supabase
        .from('class_reps')
        .select('*, courses(*), users(*, programmes(*))');
      if (sbErr) throw sbErr;

      const coursesStore = useCoursesStore();
      if (!coursesStore.courses?.length) await coursesStore.fetchCourses().catch(() => {});
      if (students.value.length === 0) await fetchStudents().catch(() => {});

      allReps.value = (data ?? []).map((sr) => {
        const c = (coursesStore.courses || []).find((x) => x.id === sr.course_id);
        const code = sr.courses?.code || c?.code || 'â€”';
        const name = sr.courses?.name || c?.name || code;
        const level = sr.courses?.level || c?.level || (() => {
          const m = code.match(/\b([1-4]\d{2})\b/);
          return m ? m[1] : '100';
        })();
        const sUser = sr.users;
        return {
          id: sr.id,
          studentId: sr.student_id,
          studentName: sUser?.name || sUser?.full_name || 'Student Rep',
          studentEmail: sUser?.email || '',
          studentProgram: sUser?.programmes?.name || sUser?.program || c?.program || '-',
          courseId: sr.course_id,
          courseCode: code,
          courseName: name,
          courseLevel: level,
          assignedAt: sr.assigned_at || sr.created_at || new Date().toISOString(),
        };
      });
    } catch (err) {
      error.value = err.message || 'Failed to load class reps.';
      console.error('[classrep] fetchAllReps error:', err);
    } finally {
      isLoading.value = false;
    }
    return allReps.value;
  }

  // â”€â”€ Admin: fetch students â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  async function fetchStudents(courseId = null) {
    isLoading.value = true;
    error.value = '';
    try {
      let query = supabase
        .from('users')
        .select('id, name, email, id_number, program_id, mode, role, programmes(name)')
        .ilike('role', 'student')
        .order('name');

      if (courseId) {
        const { data: enrolled } = await supabase
          .from('enrollments')
          .select('student_id')
          .eq('course_id', courseId);
        const ids = (enrolled ?? []).map((e) => e.student_id);
        if (ids.length > 0) query = query.in('id', ids);
      }

      const { data, error: sbErr } = await query;
      if (sbErr) throw sbErr;

      students.value = (data ?? []).map((u) => ({
        id: u.id,
        studentId: u.id_number || u.id,
        name: u.name || 'Student',
        email: u.email || '',
        program: u.programmes?.name || u.program_id || '',
        mode: u.mode || 'Regular',
        isEnrolled: !!courseId,
      }));
    } catch (err) {
      console.warn('[classrep] fetchStudents error:', err.message);
      students.value = [];
    } finally {
      isLoading.value = false;
    }
    return students.value;
  }

  // â”€â”€ Filter students by mode/query â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  async function fetchStudentsByFilter({ mode, level, courseId, query: q }) {
    if (students.value.length === 0) await fetchStudents(courseId);
    let filtered = [...students.value];
    if (q && q.trim()) {
      const term = q.trim().toLowerCase();
      filtered = filtered.filter((s) =>
        (s.name || '').toLowerCase().includes(term) ||
        (s.email || '').toLowerCase().includes(term) ||
        (s.studentId || '').toLowerCase().includes(term)
      );
    }
    if (mode && mode !== 'All') {
      const withMode = filtered.filter((s) => (s.mode || '').toLowerCase() === mode.toLowerCase());
      if (withMode.length > 0) filtered = withMode;
    }
    return filtered;
  }

  // â”€â”€ Admin: assign class rep â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  async function assignClassRep(studentId, courseId, extraData = {}) {
    isLoading.value = true;
    error.value = '';
    try {
      const { error: sbErr } = await supabase
        .from('class_reps')
        .upsert(
          { student_id: studentId, course_id: courseId, assigned_at: new Date().toISOString() },
          { onConflict: 'course_id' }
        );
      if (sbErr) throw sbErr;
      await fetchAllReps();
      return { message: 'Class Rep assigned successfully' };
    } catch (err) {
      const msg = err.message || 'Failed to assign class rep.';
      error.value = msg;
      throw new Error(msg);
    } finally {
      isLoading.value = false;
    }
  }

  // â”€â”€ Admin: remove class rep â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  async function removeClassRep(courseId) {
    isLoading.value = true;
    error.value = '';
    try {
      const { error: sbErr } = await supabase
        .from('class_reps')
        .delete()
        .eq('course_id', courseId);
      if (sbErr) throw sbErr;
      allReps.value = allReps.value.filter((r) => r.courseId !== courseId);
      return { message: 'Class rep removed successfully' };
    } catch (err) {
      const msg = err.message || 'Failed to remove class rep.';
      error.value = msg;
      throw new Error(msg);
    } finally {
      isLoading.value = false;
    }
  }

  // â”€â”€ Student: fetch my class rep roles â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  async function fetchMyRoles() {
    const authStore = useAuthStore();
    const currentUserId = authStore.user?.id || authStore.profile?.id;
    if (!currentUserId) { myRoles.value = []; return myRoles.value; }
    try {
      const { data, error: sbErr } = await supabase
        .from('class_reps')
        .select('*, courses(*)')
        .eq('student_id', currentUserId);
      if (sbErr) throw sbErr;
      const coursesStore = useCoursesStore();
      myRoles.value = (data ?? []).map((sr) => {
        const c = (coursesStore.courses || []).find((x) => x.id === sr.course_id);
        const code = sr.courses?.code || c?.code || 'â€”';
        const name = sr.courses?.name || c?.name || code;
        return {
          id: sr.id,
          courseId: sr.course_id,
          courseCode: code,
          courseName: name,
          schedules: [],
          assignedAt: sr.assigned_at || sr.created_at,
        };
      });
    } catch (err) {
      console.warn('[classrep] fetchMyRoles error:', err.message);
      myRoles.value = [];
    }
    return myRoles.value;
  }

  // â”€â”€ Verify session code (PIN) â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  async function verifySessionCode(code, courseId) {
    if (!code || !String(code).trim()) throw new Error('Please enter a session code');
    const cleanCode = String(code).trim();
    const { data, error: sbErr } = await supabase
      .from('sessions')
      .select('*, courses(*), users(*)')
      .eq('pin', cleanCode)
      .maybeSingle();
    if (sbErr) throw new Error(sbErr.message);
    if (!data) throw new Error(`No session found matching code "${cleanCode}".`);
    const matchesCourse =
      !courseId ||
      data.course_id === courseId ||
      data.courses?.code?.toUpperCase() === String(courseId).toUpperCase();
    if (!matchesCourse) {
      throw new Error(
        `Session code "${cleanCode}" belongs to ${data.courses?.code || 'another course'}, not the selected course.`
      );
    }
    const createdDate = new Date(data.created_at || data.date || Date.now());
    return {
      id: data.id,
      pin: data.pin,
      courseId: data.course_id,
      courseCode: data.courses?.code || '',
      courseName: data.courses?.name || '',
      date: createdDate.toISOString().split('T')[0],
      time: `${String(createdDate.getHours()).padStart(2, '0')}:${String(createdDate.getMinutes()).padStart(2, '0')}`,
      createdAt: createdDate.toISOString(),
      lecturerName: data.users?.name || data.users?.full_name || 'Lecturer',
    };
  }

  // â”€â”€ Fetch recent sessions for a course â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  async function fetchCourseSessions(courseId) {
    try {
      const { data, error: sbErr } = await supabase
        .from('sessions')
        .select('*, courses(*)')
        .eq('course_id', courseId)
        .order('created_at', { ascending: false })
        .limit(6);
      if (sbErr) throw sbErr;
      return (data ?? []).map((s) => {
        const d = new Date(s.created_at || s.date || Date.now());
        return {
          id: s.id,
          pin: s.pin,
          courseId: s.course_id,
          courseCode: s.courses?.code || '',
          courseName: s.courses?.name || '',
          date: d.toISOString().split('T')[0],
          time: `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`,
          createdAt: d.toISOString(),
          isActive: s.is_active,
        };
      });
    } catch (err) {
      console.warn('[classrep] fetchCourseSessions error:', err.message);
      return [];
    }
  }

  // â”€â”€ Mark lecturer attendance (by class rep) â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  async function markLecturerAttendance({ courseId, sessionCode, date, time, status, notes }) {
    isLoading.value = true;
    error.value = '';
    try {
      const authStore = useAuthStore();
      const currentUserId = authStore.user?.id || authStore.profile?.id || '';
      const taggedNotes = sessionCode
        ? (notes ? `[Session: ${sessionCode}] ${notes}` : `[Session: ${sessionCode}]`)
        : (notes || null);
      const { error: sbErr } = await supabase.from('lecturer_attendances').upsert({
        course_id: courseId,
        date,
        time,
        status,
        notes: taggedNotes,
        marked_by_id: currentUserId,
        created_at: new Date().toISOString(),
      });
      if (sbErr) throw sbErr;
      await fetchAttendanceHistory(courseId);
      return { message: 'Attendance recorded successfully' };
    } catch (err) {
      const msg = err.message || 'Failed to record attendance.';
      error.value = msg;
      throw new Error(msg);
    } finally {
      isLoading.value = false;
    }
  }

  // â”€â”€ Fetch attendance history for a course â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  async function fetchAttendanceHistory(courseId) {
    try {
      const { data, error: sbErr } = await supabase
        .from('lecturer_attendances')
        .select('*')
        .eq('course_id', courseId)
        .order('date', { ascending: false });
      if (sbErr) throw sbErr;
      attendanceHistory.value = { ...attendanceHistory.value, [courseId]: data ?? [] };
    } catch (err) {
      console.warn('[classrep] fetchAttendanceHistory error:', err.message);
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
    verifySessionCode,
    fetchCourseSessions,
    markLecturerAttendance,
    fetchAttendanceHistory,
  };
});
