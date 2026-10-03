import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import { supabase } from '@/stores/supabase';
import { useAuthStore } from '@/stores/authstore.js';
import { useCoursesStore } from '@/stores/courses.js';
import { useSchedulesStore } from '@/stores/schedules.js';
import api from '@/api.js';

export const useClassRepStore = defineStore('classRep', () => {
  // ── State ───────────────────────────────────────────────────────────────────
  const allReps = ref([]);
  const myRoles = ref([]);
  const students = ref([]);
  const attendanceHistory = ref({});
  const isLoading = ref(false);
  const error = ref('');

  // ── Computed ────────────────────────────────────────────────────────────────
  const isClassRep = computed(() => myRoles.value.length > 0);
  const myRepCourseIds = computed(() => myRoles.value.map((r) => r.courseId));

  // ── Fetch all class reps ───────────────────────────────────────────────────
  async function fetchAllReps() {
    isLoading.value = true;
    error.value = '';
    try {
      const coursesStore = useCoursesStore();
      if (!coursesStore.courses?.length) await coursesStore.fetchCourses().catch(() => {});
      if (students.value.length === 0) await fetchStudents().catch(() => {});

      let data = [];
      try {
        const { data: richData, error: richErr } = await supabase
          .from('class_reps')
          .select('*, courses(*), users(*, programmes(*))')
          .order('assigned_at', { ascending: false });

        if (!richErr && richData && richData.length > 0) {
          data = richData;
        } else {
          const { data: simpleData } = await supabase
            .from('class_reps')
            .select('*, courses(*), users(*)')
            .order('assigned_at', { ascending: false });
          if (simpleData && simpleData.length > 0) {
            data = simpleData;
          } else {
            const { data: plainData } = await supabase.from('class_reps').select('*');
            data = plainData ?? [];
          }
        }
      } catch (err) {
        console.warn('[classrep] Supabase fetch reps notice:', err.message);
      }

      allReps.value = (data ?? []).map((sr) => {
        const c = sr.courses || (coursesStore.courses || []).find((x) => x.id === sr.course_id || x.code === sr.course_id) || {};
        const code = c?.code || (sr.course_id && sr.course_id.length <= 10 ? sr.course_id : '—');
        const name = c?.name || (code !== '—' ? code : 'Course');
        let level = c?.level || '100';

        const sUser = sr.users;
        const matchedStudent = (students.value || []).find((s) => s.id === sr.student_id || s.studentId === sr.student_id);

        return {
          id: sr.id,
          studentId: sr.student_id,
          studentName: sUser?.name || sUser?.full_name || matchedStudent?.name || 'Student Rep',
          studentEmail: sUser?.email || matchedStudent?.email || '',
          studentProgram: sUser?.programmes?.name || sUser?.program || matchedStudent?.program || c?.program || '—',
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

  // ── Fetch students directly from Supabase ──────────────────────────────────
  async function fetchStudents(courseId = null) {
    isLoading.value = true;
    error.value = '';
    try {
      // 1. Check enrolled student IDs for this course if courseId provided
      let enrolledIds = new Set();
      if (courseId) {
        try {
          const { data: enrolled } = await supabase
            .from('enrollments')
            .select('student_id')
            .eq('course_id', courseId);
          enrolledIds = new Set((enrolled ?? []).map((e) => e.student_id));
        } catch {}
      }

      // 2. Fetch all students directly from Supabase users table
      let rawUsers = null;
      try {
        const { data: uData, error: uErr } = await supabase
          .from('users')
          .select('id, name, email, id_number, program_id, mode, role, programmes(name)')
          .ilike('role', 'student')
          .order('name');
        if (!uErr && uData && uData.length > 0) rawUsers = uData;
      } catch {}

      if (!rawUsers || rawUsers.length === 0) {
        try {
          const { data: fallbackUsers } = await supabase
            .from('users')
            .select('id, name, email, id_number, program_id, mode, role')
            .ilike('role', 'student')
            .order('name');
          if (fallbackUsers && fallbackUsers.length > 0) rawUsers = fallbackUsers;
        } catch {}
      }

      if (!rawUsers || rawUsers.length === 0) {
        try {
          const { data: eqUsers } = await supabase
            .from('users')
            .select('id, name, email, id_number, program_id, mode, role')
            .eq('role', 'Student')
            .order('name');
          if (eqUsers && eqUsers.length > 0) rawUsers = eqUsers;
        } catch {}
      }

      students.value = (rawUsers ?? []).map((u) => ({
        id: u.id,
        studentId: u.id_number || u.id,
        name: u.name || u.full_name || u.email || 'Student',
        email: u.email || '',
        program: u.programmes?.name || u.program_id || u.program || '—',
        mode: u.mode || 'Regular',
        isEnrolled: enrolledIds.has(u.id) || enrolledIds.has(u.id_number),
      }));

      if (courseId && enrolledIds.size > 0) {
        students.value.sort((a, b) => (b.isEnrolled ? 1 : 0) - (a.isEnrolled ? 1 : 0));
      }
    } catch (err) {
      console.warn('[classrep] fetchStudents error:', err.message);
      students.value = [];
    } finally {
      isLoading.value = false;
    }
    return students.value;
  }

  // ── Filter students by mode/query ──────────────────────────────────────────
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

  // ── Assign class rep in Supabase database ──────────────────────────────────
  async function assignClassRep(studentId, courseId, extraData = {}) {
    isLoading.value = true;
    error.value = '';

    try {
      // 1. Remove any previous rep for this course in Supabase
      try {
        await supabase
          .from('class_reps')
          .delete()
          .eq('course_id', courseId);
      } catch (delErr) {
        console.warn('[classrep] Pre-cleanup notice:', delErr);
      }

      // 2. Insert new rep record directly into Supabase
      const { data: insData, error: insErr } = await supabase
        .from('class_reps')
        .insert({
          student_id: studentId,
          course_id: courseId,
          assigned_at: new Date().toISOString(),
        })
        .select();

      if (insErr) {
        const { error: upErr } = await supabase
          .from('class_reps')
          .upsert(
            { student_id: studentId, course_id: courseId, assigned_at: new Date().toISOString() },
            { onConflict: 'course_id' }
          );
        if (upErr) throw upErr;
      }

      // 3. Ensure student is enrolled for this course in Supabase
      try {
        await supabase
          .from('enrollments')
          .upsert(
            { student_id: studentId, course_id: courseId },
            { onConflict: 'student_id,course_id' }
          );
      } catch (enrErr) {
        console.warn('[classrep] Enrollment upsert notice:', enrErr);
      }

      await fetchAllReps().catch(() => {});
      return { message: 'Class Rep assigned successfully in database.' };
    } catch (err) {
      console.error('[classrep] assignClassRep error:', err);
      const msg = err.message || 'Failed to assign class rep in database.';
      error.value = msg;
      throw new Error(msg);
    } finally {
      isLoading.value = false;
    }
  }

  // ── Remove class rep from Supabase database ────────────────────────────────
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
      return { message: 'Class rep removed successfully from database.' };
    } catch (err) {
      const msg = err.message || 'Failed to remove class rep.';
      error.value = msg;
      throw new Error(msg);
    } finally {
      isLoading.value = false;
    }
  }

  // ── Student: fetch my class rep roles ──────────────────────────────────────
  async function fetchMyRoles() {
    const authStore = useAuthStore();
    const currentUserId = authStore.user?.id || authStore.profile?.id;
    const userEmail = authStore.profile?.email || authStore.user?.email;
    const idNumber = authStore.profile?.id_number;

    if (!currentUserId && !userEmail && !idNumber) {
      myRoles.value = [];
      return myRoles.value;
    }

    try {
      const coursesStore = useCoursesStore();
      const schedulesStore = useSchedulesStore();
      if (!coursesStore.courses?.length) await coursesStore.fetchCourses().catch(() => {});
      if (!schedulesStore.schedules?.length) await schedulesStore.fetchSchedules().catch(() => {});

      let rolesData = null;
      try {
        const orClauses = [];
        if (currentUserId) orClauses.push(`student_id.eq.${currentUserId}`);
        if (idNumber) orClauses.push(`student_id.eq.${idNumber}`);
        
        const query = supabase.from('class_reps').select('*, courses(*)');
        if (orClauses.length > 0) {
          const { data } = await query.or(orClauses.join(','));
          if (data && data.length > 0) rolesData = data;
        }
      } catch {}

      // Backend fallback
      if (!rolesData || rolesData.length === 0) {
        try {
          const res = await api.get('/classrep/my-roles');
          if (res.data?.length > 0) {
            myRoles.value = res.data;
            return myRoles.value;
          }
        } catch {}
      }

      myRoles.value = (rolesData ?? []).map((sr) => {
        const c = (coursesStore.courses || []).find((x) => x.id === sr.course_id || x.code === sr.course_id);
        const code = sr.courses?.code || c?.code || '—';
        const name = sr.courses?.name || c?.name || code;
        const schedules = (schedulesStore.schedules || []).filter((s) => s.courseId === sr.course_id);
        return {
          id: sr.id,
          courseId: sr.course_id,
          courseCode: code,
          courseName: name,
          schedules,
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
    recordAttendance: markLecturerAttendance,
    fetchAttendanceHistory,
  };
});
