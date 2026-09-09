import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import { supabase } from '@/stores/supabase';

export const useClassRepStore = defineStore('classRep', () => {
  // ── State ────────────────────────────────────────────────────────────────────
  const allReps = ref([]);           // Admin: list of all class reps
  const myRoles = ref([]);           // Student: courses where I am class rep
  const students = ref([]);          // All students for searchable assign dropdown
  const attendanceHistory = ref({});  // courseId → records[]
  const isLoading = ref(false);
  const error = ref('');

  // ── Computed ─────────────────────────────────────────────────────────────────
  const isClassRep = computed(() => myRoles.value.length > 0);
  const myRepCourseIds = computed(() => myRoles.value.map((r) => r.courseId));

  // ── Admin: Fetch all Class Representatives directly from Supabase ────────────
  async function fetchAllReps() {
    isLoading.value = true;
    error.value = '';
    try {
      const { data: repsData, error: sbErr } = await supabase
        .from('class_reps')
        .select('*')
        .order('assigned_at', { ascending: false });

      if (sbErr) throw sbErr;

      if (!repsData || repsData.length === 0) {
        allReps.value = [];
        return;
      }

      const studentIds = [...new Set(repsData.map((r) => r.student_id).filter(Boolean))];
      const courseIds  = [...new Set(repsData.map((r) => r.course_id).filter(Boolean))];

      // Fetch students in parallel with courses
      const [studentsRes, coursesRes] = await Promise.all([
        supabase
          .from('users')
          .select('id, name, email, program, id_number')
          .in('id', studentIds),
        supabase
          .from('courses')
          .select('id, code, name, level')
          .in('id', courseIds),
      ]);

      const studentMap = new Map((studentsRes.data || []).map((s) => [s.id, s]));
      const courseMap  = new Map((coursesRes.data  || []).map((c) => [c.id, c]));

      allReps.value = repsData.map((r) => {
        const student = studentMap.get(r.student_id);
        const course  = courseMap.get(r.course_id);

        return {
          id:             r.id,
          studentId:      r.student_id,
          studentName:    student?.name    || 'Unknown Student',
          studentEmail:   student?.email   || '—',
          studentProgram: student?.program  || '—',
          courseId:       r.course_id,
          courseCode:     course?.code  || '—',
          courseName:     course?.name  || '—',
          courseLevel:    course?.level || '—',
          assignedAt:     r.assigned_at || new Date().toISOString(),
        };
      });
    } catch (err) {
      console.error('fetchAllReps error:', err);
      error.value = err.message || 'Failed to load class reps';
      allReps.value = [];
    } finally {
      isLoading.value = false;
    }
  }

  // ── Admin: Fetch all Students from Supabase for Searchable Dropdown ───────────
  async function fetchStudents(courseId = null) {
    isLoading.value = true;
    error.value = '';
    try {
      const { data: usersData, error: usersErr } = await supabase
        .from('users')
        .select('id, name, email, program, id_number, mode')
        .ilike('role', 'student')
        .order('name', { ascending: true });

      if (usersErr) throw usersErr;

      let enrolledStudentIds = null;
      if (courseId) {
        const { data: enrData } = await supabase
          .from('enrollments')
          .select('student_id')
          .eq('course_id', courseId);
        if (enrData) {
          enrolledStudentIds = new Set(enrData.map((e) => e.student_id));
        }
      }

      students.value = (usersData ?? []).map((u) => ({
        id:         u.id,
        name:       u.name || 'Unnamed Student',
        email:      u.email || '—',
        studentId:  u.id_number || u.id.slice(0, 8),
        program:    u.program || '—',
        mode:       u.mode || 'Regular',
        isEnrolled: enrolledStudentIds ? enrolledStudentIds.has(u.id) : true,
      }));

      return students.value;
    } catch (err) {
      console.error('fetchStudents error:', err);
      error.value = err.message || 'Failed to load students';
      students.value = [];
    } finally {
      isLoading.value = false;
    }
  }

  // ── Filtered students by mode/level ──────────────────────────────────────────
  async function fetchStudentsByFilter({ mode } = {}) {
    isLoading.value = true;
    error.value = '';
    try {
      let query = supabase.from('users').select('*').ilike('role', 'student');
      if (mode) query = query.ilike('mode', mode);

      const { data, error: sbError } = await query;
      if (sbError) throw sbError;

      students.value = (data ?? []).map((u) => ({
        id:        u.id,
        name:      u.name || 'Unnamed Student',
        email:     u.email || '—',
        studentId: u.id_number || u.id.slice(0, 8),
        program:   u.program || '—',
        mode:      u.mode || 'Regular',
      })).sort((a, b) => (a.name || '').localeCompare(b.name || ''));
    } catch (err) {
      console.error('fetchStudentsByFilter error:', err);
      error.value = err.message || 'Failed to load students';
      students.value = [];
    } finally {
      isLoading.value = false;
    }
  }

  // ── Admin: Assign Class Representative in Supabase ────────────────────────────
  async function assignClassRep(studentId, courseId) {
    isLoading.value = true;
    error.value = '';
    try {
      // Check if an assignment already exists for this course
      const { data: existing } = await supabase
        .from('class_reps')
        .select('id')
        .eq('course_id', courseId)
        .maybeSingle();

      if (existing) {
        // Update the existing record
        const { error: upErr } = await supabase
          .from('class_reps')
          .update({
            student_id:  studentId,
            assigned_at: new Date().toISOString(),
          })
          .eq('id', existing.id);
        if (upErr) throw upErr;
      } else {
        // Insert new record
        const { error: insErr } = await supabase
          .from('class_reps')
          .insert({
            course_id:   courseId,
            student_id:  studentId,
            assigned_at: new Date().toISOString(),
          });
        if (insErr) throw insErr;
      }

      await fetchAllReps();
      return { message: 'Class representative assigned successfully!' };
    } catch (err) {
      const msg = err.message || 'Failed to assign class rep';
      error.value = msg;
      throw new Error(msg);
    } finally {
      isLoading.value = false;
    }
  }

  // ── Admin: Remove Class Representative in Supabase ────────────────────────────
  async function removeClassRep(courseId) {
    isLoading.value = true;
    error.value = '';
    try {
      const { error: delErr } = await supabase
        .from('class_reps')
        .delete()
        .eq('course_id', courseId);

      if (delErr) throw delErr;

      allReps.value = allReps.value.filter((r) => r.courseId !== courseId);
      return { message: 'Class representative removed successfully' };
    } catch (err) {
      const msg = err.message || 'Failed to remove class rep';
      error.value = msg;
      throw new Error(msg);
    } finally {
      isLoading.value = false;
    }
  }

  // ── Student / Class Rep: Roles from Supabase ──────────────────────────────────
  async function fetchMyRoles() {
    try {
      const { data: authData } = await supabase.auth.getUser();
      const userId = authData?.user?.id;
      if (!userId) return;

      const { data: repsData, error: repErr } = await supabase
        .from('class_reps')
        .select('id, course_id, assigned_at')
        .eq('student_id', userId);

      if (repErr) throw repErr;

      if (!repsData || repsData.length === 0) {
        myRoles.value = [];
        return;
      }

      const courseIds = repsData.map((r) => r.course_id);
      const { data: coursesData } = await supabase
        .from('courses')
        .select('id, code, name, level')
        .in('id', courseIds);

      const courseMap = new Map((coursesData || []).map((c) => [c.id, c]));

      myRoles.value = repsData.map((r) => {
        const c = courseMap.get(r.course_id);
        return {
          id:          r.id,
          courseId:    r.course_id,
          courseCode:  c?.code  || '',
          courseName:  c?.name  || '',
          courseLevel: c?.level || '',
          assignedAt:  r.assigned_at,
        };
      });
    } catch (err) {
      console.error('fetchMyRoles error:', err);
      myRoles.value = [];
    }
  }

  // ── Class Rep: Mark Lecturer Attendance in Supabase ───────────────────────────
  async function markLecturerAttendance({ courseId, date, time, status, notes }) {
    isLoading.value = true;
    error.value = '';
    try {
      const { data: authData } = await supabase.auth.getUser();
      const userId = authData?.user?.id;

      const { error: insErr } = await supabase
        .from('lecturer_attendances')
        .insert({
          course_id:    courseId,
          marked_by_id: userId,
          date,
          time,
          status,
          notes: notes || null,
        });

      if (insErr) throw insErr;

      await fetchAttendanceHistory(courseId);
      return { message: 'Lecturer attendance marked successfully!' };
    } catch (err) {
      const msg = err.message || 'Failed to record attendance';
      error.value = msg;
      throw new Error(msg);
    } finally {
      isLoading.value = false;
    }
  }

  // ── Class Rep: Fetch Attendance History from Supabase ─────────────────────────
  async function fetchAttendanceHistory(courseId) {
    try {
      const { data, error: histErr } = await supabase
        .from('lecturer_attendances')
        .select('*')
        .eq('course_id', courseId)
        .order('created_at', { ascending: false });

      if (histErr) throw histErr;

      const records = data || [];

      // Resolve marked_by_id → name
      const markerIds = [...new Set(records.map((r) => r.marked_by_id).filter(Boolean))];
      let nameMap = new Map();
      if (markerIds.length > 0) {
        const { data: markersData } = await supabase
          .from('users')
          .select('id, name')
          .in('id', markerIds);
        nameMap = new Map((markersData || []).map((u) => [u.id, u.name]));
      }

      attendanceHistory.value = {
        ...attendanceHistory.value,
        [courseId]: records.map((r) => ({
          ...r,
          markedBy: nameMap.get(r.marked_by_id) || 'Unknown',
        })),
      };
    } catch (err) {
      console.error('fetchAttendanceHistory error:', err);
      attendanceHistory.value = { ...attendanceHistory.value, [courseId]: [] };
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
