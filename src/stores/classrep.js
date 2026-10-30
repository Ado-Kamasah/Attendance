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

      const repMap = new Map();

      // 1. Fetch from Backend Express / SQLite API
      try {
        const bRes = await api.get('/classrep/all');
        if (Array.isArray(bRes.data)) {
          bRes.data.forEach((br) => {
            const rawMode = br.mode || 'Regular';
            const mode = String(rawMode).toLowerCase() === 'weekend' ? 'Weekend' : 'Regular';
            const key = `${br.courseId}_${mode}`;
            repMap.set(key, {
              id: br.id,
              studentId: br.studentId,
              studentName: br.studentName || 'Student Rep',
              studentEmail: br.studentEmail || '',
              studentProgram: br.studentProgram || '',
              courseId: br.courseId,
              courseCode: br.courseCode,
              courseName: br.courseName,
              courseLevel: br.courseLevel || '100',
              mode,
              assignedAt: br.assignedAt || new Date().toISOString(),
            });
          });
        }
      } catch (bErr) {
        console.warn('[classrep] Backend fetch reps notice:', bErr.message);
      }

      // 2. Fetch from Supabase
      try {
        let sbReps = [];
        const { data: richData, error: richErr } = await supabase
          .from('class_reps')
          .select('*, courses(*), users(*, programmes(*))')
          .order('assigned_at', { ascending: false });

        if (!richErr && richData && richData.length > 0) {
          sbReps = richData;
        } else {
          const { data: plainData } = await supabase.from('class_reps').select('*, courses(*), users(*), study_mode');
          sbReps = plainData ?? [];
        }

        sbReps.forEach((sr) => {
          const c = sr.courses || (coursesStore.courses || []).find((x) => x.id === sr.course_id || x.code === sr.course_id) || {};
          const code = c?.code || (sr.course_id && sr.course_id.length <= 10 ? sr.course_id : '—');
          const name = c?.name || (code !== '—' ? code : 'Course');
          let level = c?.level || '100';

          const sUser = sr.users;
          const matchedStudent = (students.value || []).find((s) => s.id === sr.student_id || s.studentId === sr.student_id);

          // study_mode is the Supabase column name (avoids Postgres aggregate collision with 'mode')
          const rawMode = sr.study_mode || sUser?.mode || matchedStudent?.mode || 'Regular';
          const mode = String(rawMode).toLowerCase() === 'weekend' ? 'Weekend' : 'Regular';
          const key = `${sr.course_id}_${mode}`;

          // Keep whichever is richest
          const existing = repMap.get(key);
          repMap.set(key, {
            id: sr.id || existing?.id,
            studentId: sr.student_id,
            studentName: sUser?.name || sUser?.full_name || matchedStudent?.name || existing?.studentName || 'Student Rep',
            studentEmail: sUser?.email || matchedStudent?.email || existing?.studentEmail || '',
            studentProgram: sUser?.programmes?.name || sUser?.program || matchedStudent?.program || c?.program || existing?.studentProgram || '—',
            courseId: sr.course_id,
            courseCode: code || existing?.courseCode || '—',
            courseName: name || existing?.courseName || 'Course',
            courseLevel: level || existing?.courseLevel || '100',
            mode,
            assignedAt: sr.assigned_at || sr.created_at || existing?.assignedAt || new Date().toISOString(),
          });
        });
      } catch (err) {
        console.warn('[classrep] Supabase fetch reps notice:', err.message);
      }

      allReps.value = Array.from(repMap.values());
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

      // If Supabase users empty, fallback to backend students
      if (!rawUsers || rawUsers.length === 0) {
        try {
          const { data: bStudents } = await api.get('/classrep/students');
          if (Array.isArray(bStudents) && bStudents.length > 0) {
            rawUsers = bStudents;
          }
        } catch {}
      }

      students.value = (rawUsers ?? []).map((u) => ({
        id: u.id,
        studentId: u.id_number || u.studentId || u.id,
        name: u.name || u.full_name || u.email || 'Student',
        email: u.email || '',
        program: u.programmes?.name || u.program_id || u.program || '—',
        mode: (u.mode || 'Regular').toLowerCase() === 'weekend' ? 'Weekend' : 'Regular',
        isEnrolled: enrolledIds.has(u.id) || enrolledIds.has(u.id_number) || !!u.isEnrolled,
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
      const withMode = filtered.filter((s) => (s.mode || 'Regular').toLowerCase() === mode.toLowerCase());
      if (withMode.length > 0) filtered = withMode;
    }
    return filtered;
  }

  // ── Assign class rep in Backend & Supabase (Mode-Aware) ─────────────────────
  async function assignClassRep(studentId, courseId, extraData = {}) {
    isLoading.value = true;
    error.value = '';

    // Determine student mode: Regular or Weekend
    const studentMode = extraData.mode || 'Regular';
    const validMode = String(studentMode).toLowerCase() === 'weekend' ? 'Weekend' : 'Regular';

    try {
      // 1. Sync with Express / Prisma backend first (persists with @@unique([courseId, mode]))
      let backendSuccess = false;
      try {
        const res = await api.post('/classrep/assign', {
          studentId,
          courseId,
          mode: validMode,
          studentName: extraData.studentName,
          studentEmail: extraData.studentEmail,
          studentProgram: extraData.studentProgram,
          courseCode: extraData.courseCode,
          courseName: extraData.courseName,
          courseLevel: extraData.courseLevel,
        });
        if (res.status === 200 || res.status === 201) backendSuccess = true;
      } catch (backendErr) {
        console.warn('[classrep] Backend assign notice:', backendErr.message);
      }

      // 2. Remove ONLY existing rep for this course of the SAME mode in Supabase
      // Crucial: do NOT delete the other mode's rep!
      try {
        // Find existing reps for this course in Supabase
        const { data: existingReps } = await supabase
          .from('class_reps')
          .select('id, student_id, course_id, study_mode, users(mode)')
          .eq('course_id', courseId);

        if (Array.isArray(existingReps)) {
          for (const er of existingReps) {
            const erMode = er.study_mode 
              ? (String(er.study_mode).toLowerCase() === 'weekend' ? 'Weekend' : 'Regular')
              : (er.users?.mode ? (er.users.mode.toLowerCase() === 'weekend' ? 'Weekend' : 'Regular') : 'Regular');
            if (erMode === validMode || er.student_id === studentId) {
              await supabase.from('class_reps').delete().eq('id', er.id);
            }
          }
        }
      } catch (delErr) {
        console.warn('[classrep] Mode-specific cleanup notice:', delErr.message);
      }

      // 3. Insert new rep record into Supabase (mode-aware)
      try {
        const { error: insErr } = await supabase
          .from('class_reps')
          .insert({
            student_id: studentId,
            course_id: courseId,
            study_mode: validMode,
            assigned_at: new Date().toISOString(),
          });
        if (insErr) {
          // Fallback if study_mode column not yet migrated in Supabase
          await supabase
            .from('class_reps')
            .insert({
              student_id: studentId,
              course_id: courseId,
              assigned_at: new Date().toISOString(),
            });
        }
      } catch (insertCatch) {
        console.warn('[classrep] Supabase insert notice:', insertCatch.message);
      }

      // 4. Ensure student is enrolled for this course in Supabase
      try {
        await supabase
          .from('enrollments')
          .upsert(
            { student_id: studentId, course_id: courseId },
            { onConflict: 'student_id,course_id' }
          );
      } catch (enrErr) {
        console.warn('[classrep] Enrollment upsert notice:', enrErr.message);
      }

      await fetchAllReps().catch(() => {});
      return { message: `Class Rep (${validMode}) assigned successfully!` };
    } catch (err) {
      console.error('[classrep] assignClassRep error:', err);
      const msg = err.message || 'Failed to assign class rep.';
      error.value = msg;
      throw new Error(msg);
    } finally {
      isLoading.value = false;
    }
  }

  // ── Remove class rep (Mode-Aware) ──────────────────────────────────────────
  async function removeClassRep(courseId, mode = null) {
    isLoading.value = true;
    error.value = '';
    const validMode = mode ? (String(mode).toLowerCase() === 'weekend' ? 'Weekend' : 'Regular') : null;

    try {
      // 1. Sync with backend API
      try {
        const queryParam = validMode ? `?mode=${encodeURIComponent(validMode)}` : '';
        await api.delete(`/classrep/${encodeURIComponent(courseId)}${queryParam}`);
      } catch (bErr) {
        console.warn('[classrep] Backend remove notice:', bErr.message);
      }

      // 2. Remove matching rep from Supabase database
      try {
        const { data: existingReps } = await supabase
          .from('class_reps')
          .select('id, student_id, course_id, users(mode)')
          .eq('course_id', courseId);

        if (Array.isArray(existingReps)) {
          for (const er of existingReps) {
            const erMode = er.study_mode 
              ? (String(er.study_mode).toLowerCase() === 'weekend' ? 'Weekend' : 'Regular')
              : (er.users?.mode ? (er.users.mode.toLowerCase() === 'weekend' ? 'Weekend' : 'Regular') : 'Regular');
            if (!validMode || erMode === validMode) {
              await supabase.from('class_reps').delete().eq('id', er.id);
            }
          }
        }
      } catch (sbErr) {
        console.warn('[classrep] Supabase delete notice:', sbErr.message);
      }

      // 3. Update local state
      allReps.value = allReps.value.filter((r) => {
        if (r.courseId !== courseId) return true;
        if (!validMode) return false;
        return r.mode !== validMode;
      });

      return { message: 'Class rep removed successfully.' };
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
    const currentUserId = authStore.user?.id;
    const profileId = authStore.profile?.id;
    const userEmail = (authStore.profile?.email || authStore.user?.email || '').toLowerCase().trim();
    const idNumber = authStore.profile?.id_number;

    if (!currentUserId && !profileId && !userEmail && !idNumber) {
      myRoles.value = [];
      return myRoles.value;
    }

    try {
      const coursesStore = useCoursesStore();
      const schedulesStore = useSchedulesStore();
      if (!coursesStore.courses?.length) await coursesStore.fetchCourses().catch(() => {});
      if (!schedulesStore.schedules?.length) await schedulesStore.fetchSchedules().catch(() => {});

      // Collect all candidate student identifiers
      const candidateIds = new Set();
      if (currentUserId) candidateIds.add(String(currentUserId));
      if (profileId) candidateIds.add(String(profileId));
      if (idNumber) candidateIds.add(String(idNumber));
      if (userEmail) candidateIds.add(userEmail);

      let rolesData = null;

      // 1. Direct query to Supabase class_reps with orClauses
      try {
        const orClauses = [];
        for (const cid of candidateIds) {
          orClauses.push(`student_id.eq.${cid}`);
        }

        if (orClauses.length > 0) {
          const { data: d1, error: e1 } = await supabase
            .from('class_reps')
            .select('*, courses(*), users(*)')
            .or(orClauses.join(','));
          if (!e1 && d1 && d1.length > 0) {
            rolesData = d1;
          } else {
            const { data: d2, error: e2 } = await supabase
              .from('class_reps')
              .select('*, courses(*)')
              .or(orClauses.join(','));
            if (!e2 && d2 && d2.length > 0) {
              rolesData = d2;
            } else {
              const { data: d3, error: e3 } = await supabase
                .from('class_reps')
                .select('*')
                .or(orClauses.join(','));
              if (!e3 && d3 && d3.length > 0) {
                rolesData = d3;
              }
            }
          }
        }
      } catch (err) {
        console.warn('[classrep] Supabase direct query notice:', err.message);
      }

      // 2. Fallback: match from allReps
      if (!rolesData || rolesData.length === 0) {
        try {
          if (allReps.value.length === 0) {
            await fetchAllReps().catch(() => {});
          }
          const matched = (allReps.value || []).filter((r) => {
            const rSid = String(r.studentId || '');
            const rEmail = String(r.studentEmail || '').toLowerCase().trim();
            return (
              candidateIds.has(rSid) ||
              (userEmail && rEmail === userEmail) ||
              (userEmail && rSid.toLowerCase() === userEmail)
            );
          });
          if (matched.length > 0) {
            myRoles.value = matched.map((r) => {
              const schedules = (schedulesStore.schedules || []).filter((s) => s.courseId === r.courseId);
              return {
                id: r.id,
                courseId: r.courseId,
                courseCode: r.courseCode,
                courseName: r.courseName,
                mode: r.mode || 'Regular',
                schedules,
                assignedAt: r.assignedAt,
              };
            });
            return myRoles.value;
          }
        } catch (err) {
          console.warn('[classrep] allReps fallback notice:', err.message);
        }
      }

      // 3. Backend fallback
      if (!rolesData || rolesData.length === 0) {
        try {
          const res = await api.get('/classrep/my-roles');
          if (res.data?.length > 0) {
            myRoles.value = res.data;
            return myRoles.value;
          }
        } catch {}
      }

      // 4. Map rolesData to myRoles
      myRoles.value = (rolesData ?? []).map((sr) => {
        const c = sr.courses || (coursesStore.courses || []).find((x) => x.id === sr.course_id || x.code === sr.course_id);
        const code = sr.courses?.code || c?.code || sr.course_id || '—';
        const name = sr.courses?.name || c?.name || code;
        const schedules = (schedulesStore.schedules || []).filter((s) => s.courseId === sr.course_id);
        const rawMode = sr.study_mode || sr.mode || sr.users?.mode || 'Regular';
        return {
          id: sr.id,
          courseId: sr.course_id,
          courseCode: code,
          courseName: name,
          mode: String(rawMode).toLowerCase() === 'weekend' ? 'Weekend' : 'Regular',
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

  // ── Verify session code (PIN) ──────────────────────────────────────────────
  async function verifySessionCode(code, courseId) {
    if (!code || !String(code).trim()) throw new Error('Please enter a session code');
    const cleanCode = String(code).trim();
    let data = null;
    let sbErr = null;

    try {
      const res = await supabase
        .from('sessions')
        .select('*, courses(*), users(*)')
        .eq('pin', cleanCode)
        .maybeSingle();
      data = res.data;
      sbErr = res.error;
    } catch (e) {
      sbErr = e;
    }

    if (sbErr || !data) {
      try {
        const res2 = await supabase
          .from('sessions')
          .select('*')
          .eq('pin', cleanCode)
          .maybeSingle();
        if (res2.data) {
          data = res2.data;
          sbErr = null;
        }
      } catch {}
    }

    if (sbErr) throw new Error(sbErr.message);
    if (!data) throw new Error(`No session found matching code "${cleanCode}".`);

    const coursesStore = useCoursesStore();
    const c = data.courses || (coursesStore.courses || []).find(x => x.id === data.course_id);
    const courseCode = c?.code || data.courses?.code || '';
    const courseName = c?.name || data.courses?.name || '';

    const matchesCourse =
      !courseId ||
      data.course_id === courseId ||
      (courseCode && courseCode.toUpperCase() === String(courseId).toUpperCase()) ||
      (c && c.id === courseId);
    if (!matchesCourse) {
      throw new Error(
        `Session code "${cleanCode}" belongs to ${courseCode || 'another course'}, not the selected course.`
      );
    }
    const createdDate = new Date(data.created_at || data.date || Date.now());
    return {
      id: data.id,
      pin: data.pin,
      courseId: data.course_id,
      courseCode,
      courseName,
      date: createdDate.toISOString().split('T')[0],
      time: `${String(createdDate.getHours()).padStart(2, '0')}:${String(createdDate.getMinutes()).padStart(2, '0')}`,
      createdAt: createdDate.toISOString(),
      lecturerName: data.users?.name || data.users?.full_name || 'Lecturer',
    };
  }

  // ── Fetch recent sessions for a course ─────────────────────────────────────
  async function fetchCourseSessions(courseId) {
    try {
      let data = null;
      try {
        const res = await supabase
          .from('sessions')
          .select('*, courses(*)')
          .eq('course_id', courseId)
          .order('created_at', { ascending: false })
          .limit(6);
        if (!res.error && res.data) data = res.data;
      } catch {}

      if (!data) {
        const res2 = await supabase
          .from('sessions')
          .select('*')
          .eq('course_id', courseId)
          .order('created_at', { ascending: false })
          .limit(6);
        data = res2.data ?? [];
      }

      const coursesStore = useCoursesStore();
      return (data ?? []).map((s) => {
        const c = s.courses || (coursesStore.courses || []).find(x => x.id === s.course_id);
        const d = new Date(s.created_at || s.date || Date.now());
        return {
          id: s.id,
          pin: s.pin,
          courseId: s.course_id,
          courseCode: c?.code || s.courses?.code || '',
          courseName: c?.name || s.courses?.name || '',
          date: d.toISOString().split('T')[0],
          time: `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`,
          createdAt: d.toISOString(),
          isActive: s.is_active ?? s.isActive,
        };
      });
    } catch (err) {
      console.warn('[classrep] fetchCourseSessions error:', err.message);
      return [];
    }
  }

  // ── Mark lecturer attendance (by class rep) ────────────────────────────────
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

  // ── Fetch attendance history for a course ──────────────────────────────────
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
