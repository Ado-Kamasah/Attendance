import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import { supabase } from '@/stores/supabase';
import { useAuthStore } from '@/stores/authstore.js';

export const useClassRepStore = defineStore('classRep', () => {
  // ── State ────────────────────────────────────────────────────────────────────
  const allReps = ref([]);           // Admin: list of all class reps
  const myRoles = ref([]);           // Student: courses where I am class rep
<<<<<<< HEAD
  const students = ref([]);          // All students for searchable assign dropdown
=======
  const students = ref([]);          // Admin: student list for assign modal
>>>>>>> c462b06258bbd7443d9e750ae210dc97ea810d4b
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
    const repMap = new Map();

    // 1. Fetch from Express API
    try {
<<<<<<< HEAD
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
=======
      const { data } = await api.get('/classrep/all');
      if (Array.isArray(data)) {
        for (const r of data) {
          const key = r.courseId || r.courseCode;
          repMap.set(key, {
            id: r.id,
            studentId: r.studentId,
            studentName: r.studentName || '',
            studentEmail: r.studentEmail || '',
            studentProgram: r.studentProgram || '',
            courseId: r.courseId,
            courseCode: r.courseCode || '',
            courseName: r.courseName || '',
            courseLevel: r.courseLevel || '',
            assignedAt: r.assignedAt || new Date().toISOString()
          });
        }
      }
    } catch (apiErr) {
      console.warn('Local API classrep/all fetch:', apiErr.message);
>>>>>>> c462b06258bbd7443d9e750ae210dc97ea810d4b
    }

    // 2. Also check Supabase class_reps
    try {
      const { data: supaReps, error: sbErr } = await supabase
        .from('class_reps')
        .select('*, courses(*), users(*)');

      if (!sbErr && Array.isArray(supaReps) && supaReps.length > 0) {
        for (const sr of supaReps) {
          const cId = sr.course_id;
          const existing = repMap.get(cId) || {};

          const sName = sr.users?.full_name || sr.users?.name || existing.studentName || '';
          const sEmail = sr.users?.email || existing.studentEmail || '';
          const sProg = sr.users?.program || existing.studentProgram || '';
          const cCode = sr.courses?.code || existing.courseCode || '';
          const cName = sr.courses?.name || existing.courseName || '';
          const cLvl = sr.courses?.level || existing.courseLevel || '';

          repMap.set(cId, {
            id: sr.id || existing.id,
            studentId: sr.student_id || existing.studentId,
            studentName: sName,
            studentEmail: sEmail,
            studentProgram: sProg,
            courseId: cId,
            courseCode: cCode,
            courseName: cName,
            courseLevel: cLvl,
            assignedAt: sr.assigned_at || existing.assignedAt || new Date().toISOString()
          });
        }
      }
    } catch (sbErr) {
      console.warn('Supabase class_reps fetch error:', sbErr);
    }

    // 3. Post-resolve any missing fields using coursesStore and students list
    const coursesStore = useCoursesStore();
    if (!coursesStore.courses || coursesStore.courses.length === 0) {
      await coursesStore.fetchCourses().catch(() => {});
    }
    if (students.value.length === 0) {
      await fetchStudents().catch(() => {});
    }

    const resolved = Array.from(repMap.values()).map((r) => {
      const c = (coursesStore.courses || []).find(
        (x) => x.id === r.courseId || x.code === r.courseId || (r.courseCode && x.code === r.courseCode)
      );
      const code = r.courseCode || c?.code || (r.courseId && r.courseId.length <= 10 ? r.courseId : '—');
      const name = r.courseName || c?.name || (code !== '—' ? code : 'Course');

      let level = r.courseLevel || c?.level || '';
      if (!level && code) {
        const m = code.match(/\b([1-4]\d{2})\b/);
        if (m) level = m[1];
      }

      const s = (students.value || []).find(
        (x) => x.id === r.studentId || x.studentId === r.studentId || (r.studentEmail && x.email === r.studentEmail)
      );
      const sName = (r.studentName && r.studentName !== 'Student' && r.studentName !== 'Student Rep')
        ? r.studentName
        : (s?.name || s?.full_name || r.studentName || 'Student Rep');
      const sEmail = r.studentEmail || s?.email || '';
      const sProg = r.studentProgram || s?.program || c?.program || '—';

      return {
        ...r,
        studentName: sName,
        studentEmail: sEmail,
        studentProgram: sProg,
        courseCode: code,
        courseName: name,
        courseLevel: level || '100'
      };
    });

    allReps.value = resolved;
    isLoading.value = false;
    return allReps.value;
  }

<<<<<<< HEAD
  // ── Admin: Fetch all Students from Supabase for Searchable Dropdown ───────────
  async function fetchStudents(courseId = null) {
=======
  /**
   * Fetch all students across local backend and Supabase
   */
  async function fetchStudents(courseId = null) {
    isLoading.value = true;
    error.value = '';
    const studentMap = new Map();

    // 1. Try local Express API /classrep/students
    try {
      const params = courseId ? { courseId } : {};
      const { data } = await api.get('/classrep/students', { params });
      if (Array.isArray(data) && data.length > 0) {
        for (const s of data) {
          studentMap.set(s.id, {
            id: s.id,
            studentId: s.studentId || s.id,
            name: s.name || 'Student',
            email: s.email || '',
            program: s.program || 'General',
            mode: s.mode || 'Regular',
            isEnrolled: !!s.isEnrolled
          });
        }
      }
    } catch (apiErr) {
      console.warn('Express /classrep/students fetch failed, trying /users:', apiErr.message);
      try {
        const { data: usersData } = await api.get('/users?role=STUDENT');
        if (usersData?.users && Array.isArray(usersData.users)) {
          for (const s of usersData.users) {
            studentMap.set(s.id, {
              id: s.id,
              studentId: s.id,
              name: s.name,
              email: s.email,
              program: s.program || 'General',
              mode: 'Regular',
              isEnrolled: false
            });
          }
        }
      } catch {}
    }

    // 2. Also check Supabase public.users
    try {
      const { data: supaStudents, error: sbErr } = await supabase
        .from('users')
        .select('*');

      if (!sbErr && Array.isArray(supaStudents)) {
        for (const u of supaStudents) {
          const roleNormalized = (u.role || '').toUpperCase().replace(/[\s_-]+/g, '_');
          if (roleNormalized === 'STUDENT' || roleNormalized === '') {
            const key = u.id;
            if (!studentMap.has(key)) {
              studentMap.set(key, {
                id: u.id,
                studentId: u.id_number || u.student_id || u.id,
                name: u.name || u.full_name || 'Student',
                email: u.email || '',
                program: u.program || '',
                mode: u.mode || 'Regular',
                isEnrolled: false
              });
            }
          }
        }
      }
    } catch (sbErr) {
      console.warn('Supabase fetch students error:', sbErr);
    }

    const list = Array.from(studentMap.values()).sort((a, b) => (a.name || '').localeCompare(b.name || ''));
    students.value = list;
    isLoading.value = false;
    return list;
  }

  /**
   * Filter students by mode, level, and text query without ever returning empty if students exist
   */
  async function fetchStudentsByFilter({ mode, level, courseId, query: q }) {
    if (students.value.length === 0) {
      await fetchStudents(courseId);
    }

    let filtered = [...students.value];

    if (q && q.trim()) {
      const term = q.trim().toLowerCase();
      filtered = filtered.filter(s =>
        (s.name || '').toLowerCase().includes(term) ||
        (s.email || '').toLowerCase().includes(term) ||
        (s.studentId || '').toLowerCase().includes(term)
      );
    }

    // If mode filter specified and some students have that mode
    if (mode && mode !== 'All') {
      const withMode = filtered.filter(s => (s.mode || '').toLowerCase() === mode.toLowerCase());
      if (withMode.length > 0) {
        filtered = withMode;
      }
    }

    return filtered;
  }

  /**
   * Assign a student as Class Rep for a course
   */
  async function assignClassRep(studentId, courseId, extraData = {}) {
>>>>>>> c462b06258bbd7443d9e750ae210dc97ea810d4b
    isLoading.value = true;
    error.value = '';
    let assignResult = null;
    let success = false;
    let lastErrMsg = '';

    const studentObj = students.value.find(s => s.id === studentId || s.studentId === studentId) || {};
    const studentName = extraData.studentName || studentObj.name || 'Student';
    const studentEmail = extraData.studentEmail || studentObj.email || '';
    const studentProgram = extraData.studentProgram || studentObj.program || 'General';

    // 1. Try Express backend API
    try {
<<<<<<< HEAD
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
=======
      const payload = {
        studentId,
        courseId,
        studentName,
        studentEmail,
        studentProgram,
        courseCode: extraData.courseCode,
        courseName: extraData.courseName,
        courseLevel: extraData.courseLevel
      };
      const { data } = await api.post('/classrep/assign', payload);
      assignResult = data;
      success = true;
    } catch (apiErr) {
      lastErrMsg = apiErr?.response?.data?.message || apiErr.message;
      console.warn('Express /classrep/assign notice:', lastErrMsg);
>>>>>>> c462b06258bbd7443d9e750ae210dc97ea810d4b
    }

<<<<<<< HEAD
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
=======
    // 2. Sync to Supabase class_reps table (only valid columns: student_id, course_id, assigned_at)
    try {
      const { error: sbErr } = await supabase
        .from('class_reps')
        .upsert({
          student_id: studentId,
          course_id: courseId,
          assigned_at: new Date().toISOString()
        }, { onConflict: 'course_id' });

      if (!sbErr) {
        success = true;
      }
    } catch (sbErr) {
      console.warn('Supabase class_reps upsert notice:', sbErr);
    }

    if (!success && !assignResult) {
      const msg = lastErrMsg || 'Failed to assign class rep. Please ensure backend is running or check network.';
>>>>>>> c462b06258bbd7443d9e750ae210dc97ea810d4b
      error.value = msg;
      isLoading.value = false;
      throw new Error(msg);
    }

    await fetchAllReps();
    isLoading.value = false;
    return assignResult || { message: 'Class Rep assigned successfully' };
  }

<<<<<<< HEAD
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
=======
  /**
   * Remove a class rep for a course
   */
  async function removeClassRep(courseId) {
    isLoading.value = true;
    error.value = '';

    // 1. Remove from local backend
    try {
      await api.delete(`/classrep/${courseId}`);
    } catch (apiErr) {
      console.warn('Local API remove class rep notice:', apiErr.message);
>>>>>>> c462b06258bbd7443d9e750ae210dc97ea810d4b
    }

    // 2. Remove from Supabase
    try {
      await supabase.from('class_reps').delete().eq('course_id', courseId);
    } catch (sbErr) {
      console.warn('Supabase remove class rep notice:', sbErr);
    }

    allReps.value = allReps.value.filter((r) => r.courseId !== courseId && r.courseCode !== courseId);
    isLoading.value = false;
    return { message: 'Class rep removed successfully' };
  }

  // ── Student / Class Rep: Roles from Supabase ──────────────────────────────────
  async function fetchMyRoles() {
    const authStore = useAuthStore();
    const currentUserId = authStore.user?.id || authStore.profile?.id || localStorage.getItem('userId');
    const currentUserEmail = authStore.user?.email || authStore.profile?.email;

    const rolesMap = new Map();

    // 1. Try local Express API
    try {
<<<<<<< HEAD
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
=======
      const { data } = await api.get('/classrep/my-roles');
      if (Array.isArray(data)) {
        for (const r of data) {
          rolesMap.set(r.courseId, r);
        }
      }
    } catch (apiErr) {
      console.warn('Express /classrep/my-roles notice:', apiErr.message);
>>>>>>> c462b06258bbd7443d9e750ae210dc97ea810d4b
    }

    // 2. Check Supabase class_reps for this student
    if (currentUserId) {
      try {
        const { data: sbRoles, error: sbErr } = await supabase
          .from('class_reps')
          .select('*, courses(*)')
          .eq('student_id', currentUserId);

        if (!sbErr && Array.isArray(sbRoles) && sbRoles.length > 0) {
          const coursesStore = useCoursesStore();
          for (const sr of sbRoles) {
            if (!rolesMap.has(sr.course_id)) {
              const c = (coursesStore.courses || []).find(x => x.id === sr.course_id || x.code === sr.course_id);
              const code = sr.courses?.code || c?.code || (sr.course_id.length <= 10 ? sr.course_id : '—');
              const name = sr.courses?.name || c?.name || (code !== '—' ? code : 'Course');

              rolesMap.set(sr.course_id, {
                id: sr.id,
                courseId: sr.course_id,
                courseCode: code,
                courseName: name,
                schedules: [],
                assignedAt: sr.assigned_at
              });
            }
          }
        }
      } catch (sbErr) {
        console.warn('Supabase my class_reps query notice:', sbErr);
      }
    }

    myRoles.value = Array.from(rolesMap.values());
    return myRoles.value;
  }

<<<<<<< HEAD
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
=======
  /**
   * Verify session code with reference to a course, retrieving creation date and time
   */
  async function verifySessionCode(code, courseId) {
    if (!code || !String(code).trim()) {
      throw new Error('Please enter a session code');
    }
    const cleanCode = String(code).trim();

    // 1. Try local backend
    try {
      const { data } = await api.get('/classrep/verify-session', {
        params: { code: cleanCode, courseId }
      });
      if (data && data.valid && data.session) {
        return data.session;
      }
    } catch (apiErr) {
      if (apiErr.response?.data?.message) {
        throw new Error(apiErr.response.data.message);
      }
      console.warn('Backend verify-session error:', apiErr.message);
    }

    // 2. Fallback to Supabase sessions table
    try {
      const { data, error: sbErr } = await supabase
        .from('sessions')
        .select('*, courses(*), users(*)')
        .eq('pin', cleanCode)
        .maybeSingle();

      if (!sbErr && data) {
        const matchesCourse =
          !courseId ||
          data.course_id === courseId ||
          data.courses?.code?.toUpperCase() === String(courseId).toUpperCase() ||
          data.courses?.id === courseId;

        if (!matchesCourse) {
          throw new Error(`Session code "${cleanCode}" references ${data.courses?.code || 'another course'}, not the selected course.`);
        }

        const createdDate = new Date(data.created_at || data.date || Date.now());
        const dateStr = createdDate.toISOString().split('T')[0];
        const hours = String(createdDate.getHours()).padStart(2, '0');
        const minutes = String(createdDate.getMinutes()).padStart(2, '0');
        const timeStr = `${hours}:${minutes}`;

        return {
          id: data.id,
          pin: data.pin,
          courseId: data.course_id,
          courseCode: data.courses?.code || '',
          courseName: data.courses?.name || '',
          date: dateStr,
          time: timeStr,
          createdAt: createdDate.toISOString(),
          lecturerName: data.users?.full_name || data.users?.name || 'Lecturer'
        };
      }
    } catch (sbErr) {
      if (sbErr.message && sbErr.message.includes('references')) {
        throw sbErr;
      }
    }

    throw new Error(`No session found matching code "${cleanCode}" for this course.`);
  }

  /**
   * Fetch recent sessions for a course
   */
  async function fetchCourseSessions(courseId) {
    const list = [];
    const seen = new Set();

    // 1. Try local Express API
    try {
      const { data } = await api.get(`/classrep/course-sessions/${courseId}`);
      if (Array.isArray(data)) {
        for (const s of data) {
          if (!seen.has(s.pin)) {
            seen.add(s.pin);
            list.push(s);
          }
        }
      }
    } catch {}

    // 2. Try Supabase sessions
    try {
      const { data } = await supabase
        .from('sessions')
        .select('*, courses(*)')
        .eq('course_id', courseId)
        .order('created_at', { ascending: false })
        .limit(6);

      if (Array.isArray(data)) {
        for (const s of data) {
          if (!seen.has(s.pin)) {
            seen.add(s.pin);
            const d = new Date(s.created_at || s.date || Date.now());
            list.push({
              id: s.id,
              pin: s.pin,
              courseId: s.course_id,
              courseCode: s.courses?.code || '',
              courseName: s.courses?.name || '',
              date: d.toISOString().split('T')[0],
              time: `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`,
              createdAt: d.toISOString(),
              isActive: s.is_active
            });
          }
        }
      }
    } catch {}

    return list;
  }

  async function markLecturerAttendance({ courseId, sessionCode, date, time, status, notes }) {
    isLoading.value = true;
    error.value = '';
    let result = null;

    try {
      const { data } = await api.post('/classrep/lecturer-attendance', {
        courseId, sessionCode, date, time, status, notes,
      });
      result = data;
    } catch (apiErr) {
      console.warn('Backend markLecturerAttendance notice:', apiErr.message);
>>>>>>> c462b06258bbd7443d9e750ae210dc97ea810d4b
    }

    // Also sync to Supabase lecturer_attendances
    try {
      const authStore = useAuthStore();
      const currentUserId = authStore.user?.id || authStore.profile?.id || 'class-rep';
      const taggedNotes = sessionCode
        ? (notes ? `[Session: ${sessionCode}] ${notes}` : `[Session: ${sessionCode}]`)
        : (notes || null);

      await supabase.from('lecturer_attendances').upsert({
        course_id: courseId,
        date,
        time,
        status,
        notes: taggedNotes,
        marked_by_id: currentUserId,
        created_at: new Date().toISOString()
      });
    } catch (sbErr) {
      console.warn('Supabase mark attendance notice:', sbErr);
    }

    await fetchAttendanceHistory(courseId);
    isLoading.value = false;
    return result || { message: 'Attendance recorded successfully' };
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
<<<<<<< HEAD
      console.error('fetchAttendanceHistory error:', err);
      attendanceHistory.value = { ...attendanceHistory.value, [courseId]: [] };
=======
      // Supabase fallback
      try {
        const { data: sbData } = await supabase
          .from('lecturer_attendances')
          .select('*')
          .eq('course_id', courseId)
          .order('date', { ascending: false });

        if (sbData) {
          attendanceHistory.value = { ...attendanceHistory.value, [courseId]: sbData };
        }
      } catch {}
>>>>>>> c462b06258bbd7443d9e750ae210dc97ea810d4b
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
