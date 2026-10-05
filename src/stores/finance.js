import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import { supabase } from './supabase';

const SESSIONS_TABLE    = 'sessions';
const COURSES_TABLE     = 'courses';
const USERS_TABLE       = 'users';
const ATTENDANCES_TABLE = 'attendances';
const SCHEDULES_TABLE   = 'schedules';

// ─────────────────────────────────────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Fetch attendances in chunks of 200 session IDs to avoid URL length limits.
 */
async function fetchAttendancesForSessions(sessionIds) {
  if (!sessionIds || sessionIds.length === 0) return [];
  const CHUNK = 200;
  const chunks = [];
  for (let i = 0; i < sessionIds.length; i += CHUNK) {
    chunks.push(sessionIds.slice(i, i + CHUNK));
  }
  const results = await Promise.all(
    chunks.map(chunk =>
      supabase.from(ATTENDANCES_TABLE)
        .select('id, session_id, status')
        .in('session_id', chunk)
    )
  );
  return results.flatMap(r => r.data || []);
}

/**
 * Fetch ALL attendances (when sessions are RLS-blocked) in pages.
 */
async function fetchAllAttendances() {
  const PAGE = 1000;
  let all = [];
  let from = 0;
  while (true) {
    const { data, error } = await supabase
      .from(ATTENDANCES_TABLE)
      .select('id, session_id, student_id, status, timestamp')
      .range(from, from + PAGE - 1)
      .order('timestamp', { ascending: false });
    if (error || !data || data.length === 0) break;
    all = all.concat(data);
    if (data.length < PAGE) break;
    from += PAGE;
  }
  return all;
}

/**
 * Normalize a name string to strip honorifics for fuzzy matching.
 */
function normName(n) {
  return (n || '').toLowerCase().replace(/^(dr\.|prof\.|mr\.|mrs\.|ms\.)\s*/i, '').trim();
}

// ─────────────────────────────────────────────────────────────────────────────
// Store
// ─────────────────────────────────────────────────────────────────────────────
export const useFinanceStore = defineStore('finance', () => {
  const claims   = ref([]);
  const lecturers = ref([]);
  const isLoading = ref(false);
  const error     = ref('');
  const rlsWarning = ref(false); // true when sessions table is RLS-blocked
  let realtimeChannel = null;

  const totalClaimsCount     = computed(() => claims.value.length);
  const totalVerifiedSessions = computed(() =>
    claims.value.reduce((sum, c) => sum + (c.totalSessions || 0), 0)
  );

  function getLocalEmploymentMap() {
    try { return JSON.parse(localStorage.getItem('lecturer_employment_types') || '{}'); }
    catch { return {}; }
  }

  // ───────────────────────────────────────────────────────────────────────────
  // PRIMARY PATH: Sessions readable → join sessions + attendances + courses + users
  // ───────────────────────────────────────────────────────────────────────────
  async function buildClaimsFromSessions(sessionsList, filters) {
    const courseIds   = [...new Set(sessionsList.map(s => s.course_id).filter(Boolean))];
    const lecturerIds = [...new Set(sessionsList.map(s => s.lecturer_id).filter(Boolean))];
    const sessionIds  = sessionsList.map(s => s.id);

    const [coursesRes, usersRes, attendancesList] = await Promise.all([
      courseIds.length > 0
        ? supabase.from(COURSES_TABLE).select('id, code, name, credits').in('id', courseIds)
        : Promise.resolve({ data: [] }),
      lecturerIds.length > 0
        ? supabase.from(USERS_TABLE).select('id, name, email, role, employment_type').in('id', lecturerIds)
        : Promise.resolve({ data: [] }),
      fetchAttendancesForSessions(sessionIds),
    ]);

    const courseMap = new Map((coursesRes.data || []).map(c => [c.id, c]));
    const userMap   = new Map((usersRes.data  || []).map(u => [u.id, u]));
    const localEmpMap = getLocalEmploymentMap();

    // Index attendances by session_id
    const attBySess = new Map();
    for (const att of attendancesList) {
      if (!attBySess.has(att.session_id)) attBySess.set(att.session_id, []);
      attBySess.get(att.session_id).push(att);
    }

    // Group sessions by lecturer → course
    const lecMap = new Map();
    for (const s of sessionsList) {
      const lKey = s.lecturer_id || 'unassigned';
      if (!lecMap.has(lKey)) {
        const user = userMap.get(s.lecturer_id);
        const localEmp = user?.id
          ? (localEmpMap[user.id] || (user.email ? localEmpMap[user.email.toLowerCase()] : null))
          : null;
        const rawEmp = localEmp || user?.employment_type || 'Full-Time';
        lecMap.set(lKey, {
          lecturerId:    s.lecturer_id || lKey,
          lecturerName:  user?.name  || 'Academic Faculty',
          lecturerEmail: user?.email || '—',
          employmentType: rawEmp.toLowerCase().includes('part') ? 'Part-Time' : 'Full-Time',
          courses: new Map(),
        });
      }
      const lecGroup = lecMap.get(lKey);
      const cKey = s.course_id || 'unassigned';
      if (!lecGroup.courses.has(cKey)) {
        const course = courseMap.get(s.course_id);
        lecGroup.courses.set(cKey, {
          courseId:   s.course_id || cKey,
          courseCode: course?.code || '—',
          courseName: course?.name || 'Academic Course',
          credits:    course?.credits ?? 0,
          sessions:   [],
        });
      }
      const sessAtts = attBySess.get(s.id) || [];
      const present  = sessAtts.filter(a => (a.status || '').toLowerCase() === 'present').length;
      lecGroup.courses.get(cKey).sessions.push({
        sessionId: s.id, date: s.date,
        totalEnrolled: sessAtts.length, present,
      });
    }

    return flattenClaims(lecMap, filters);
  }

  // ───────────────────────────────────────────────────────────────────────────
  // FALLBACK PATH: Sessions RLS-blocked → derive from schedules + attendances
  //
  // Logic:
  //  1. Fetch all schedules (course_id, lecturer name string, day/time)
  //  2. Fetch all users (lecturers) and fuzzy-match by name
  //  3. Fetch ALL attendances (which we CAN read)
  //  4. Group attendances by session_id → count as "virtual sessions"
  //     (Each distinct session_id = one session; we attribute it to the course
  //      from schedules that most recently matched the attendance timestamp)
  //  5. Build claims rows using schedule-derived course→lecturer mapping
  // ───────────────────────────────────────────────────────────────────────────
  async function buildClaimsFromSchedules(filters) {
    rlsWarning.value = true;

    const [schedulesRes, coursesRes, usersRes, allAtts] = await Promise.all([
      supabase.from(SCHEDULES_TABLE).select('id, course_id, lecturer, day, start_time, end_time'),
      supabase.from(COURSES_TABLE).select('id, code, name, credits'),
      supabase.from(USERS_TABLE).select('id, name, email, role, employment_type').ilike('role', '%lecturer%'),
      fetchAllAttendances(),
    ]);

    const schedules = schedulesRes.data || [];
    const courses   = coursesRes.data  || [];
    const allUsers  = usersRes.data    || [];
    const localEmpMap = getLocalEmploymentMap();

    const courseMap = new Map(courses.map(c => [c.id, c]));

    // Fuzzy-match schedule.lecturer (name string) → user record
    const resolveUser = (lecturerName) => {
      const cleaned = normName(lecturerName);
      return allUsers.find(u => {
        const uNorm = normName(u.name);
        return (
          uNorm === cleaned ||
          uNorm.includes(cleaned) ||
          cleaned.includes(uNorm) ||
          u.name.toLowerCase() === lecturerName.toLowerCase()
        );
      }) || null;
    };

    // Build map: course_id → { lecturer user, course info }
    // (One schedule per course for claims purposes)
    const courseLecturerMap = new Map();
    for (const sched of schedules) {
      if (courseLecturerMap.has(sched.course_id)) continue;
      const user = resolveUser(sched.lecturer || '');
      if (!user && !(sched.lecturer || '').trim()) continue;
      courseLecturerMap.set(sched.course_id, { user, lecturerRawName: sched.lecturer });
    }

    // If no schedules → build fallback from pure attendance grouping per session
    if (schedules.length === 0 || courseLecturerMap.size === 0) {
      return buildClaimsFromAttendancesOnly(allAtts, allUsers, courses, filters);
    }

    // Group attendances by session_id
    const attBySess = new Map();
    for (const att of allAtts) {
      if (!attBySess.has(att.session_id)) attBySess.set(att.session_id, []);
      attBySess.get(att.session_id).push(att);
    }

    // We don't know which session_id belongs to which course.
    // Without session rows we distribute sessions equally across courses per lecturer.
    // If the same lecturer teaches multiple courses, all their attendance sessions
    // are pooled and shown as-is.
    //
    // Build per-user aggregation across ALL their sessions (no course split since
    // we lack the session→course mapping).
    const lecMap = new Map();

    // First: process attendance sessions that we CAN map via schedules
    // Since sessions table is blocked we can only create one aggregate row
    // per (lecturer, course) pair from schedules.
    for (const [courseId, { user, lecturerRawName }] of courseLecturerMap) {
      const course = courseMap.get(courseId);
      if (!course) continue;

      const userId = user?.id || `anon-${normName(lecturerRawName)}`;
      const localEmp = user
        ? (localEmpMap[user.id] || (user.email ? localEmpMap[user.email.toLowerCase()] : null))
        : null;
      const rawEmp = localEmp || user?.employment_type || 'Full-Time';
      const employmentType = rawEmp.toLowerCase().includes('part') ? 'Part-Time' : 'Full-Time';

      if (!lecMap.has(userId)) {
        lecMap.set(userId, {
          lecturerId:    userId,
          lecturerName:  user?.name || lecturerRawName || 'Academic Faculty',
          lecturerEmail: user?.email || '—',
          employmentType,
          courses: new Map(),
        });
      }

      lecMap.get(userId).courses.set(courseId, {
        courseId,
        courseCode: course.code,
        courseName: course.name,
        credits:    course.credits ?? 0,
        sessions:   [], // populated below via attendance grouping
      });
    }

    // Distribute sessions among lecturers: since we can't map session_id → course,
    // pool sessions across ALL courses for each lecturer proportionally.
    // Simpler: just count distinct session_ids visible in attendances per lecturer's courses.
    // We'll assign all sessions evenly across the lecturer's courses.
    const sessGrouped = [...attBySess.entries()].map(([sid, atts]) => ({
      sessionId: sid,
      totalEnrolled: atts.length,
      present: atts.filter(a => (a.status || '').toLowerCase() === 'present').length,
      firstTimestamp: atts[0]?.timestamp,
    }));

    // Sort sessions by date, apply date filters
    const filteredSessGroups = sessGrouped.filter(sg => {
      if (!sg.firstTimestamp) return true;
      const d = new Date(sg.firstTimestamp);
      if (filters.fromDate && d < new Date(filters.fromDate)) return false;
      if (filters.toDate  && d > new Date(filters.toDate + 'T23:59:59Z')) return false;
      return true;
    });

    // Distribute sessions across lecturers' courses (equal split)
    const allLecCourses = [...lecMap.values()].flatMap(l =>
      [...l.courses.values()].map(c => ({ lecId: l.lecturerId, courseId: c.courseId }))
    );

    if (allLecCourses.length > 0) {
      filteredSessGroups.forEach((sg, i) => {
        const target = allLecCourses[i % allLecCourses.length];
        const lec = lecMap.get(target.lecId);
        if (lec) {
          const course = lec.courses.get(target.courseId);
          if (course) course.sessions.push(sg);
        }
      });
    }

    const rows = flattenClaims(lecMap, filters);

    // Filter by lecturer if requested
    if (filters.lecturerId) {
      return rows.filter(r => r.lecturerId === filters.lecturerId);
    }
    return rows;
  }

  // ───────────────────────────────────────────────────────────────────────────
  // LAST RESORT: No sessions, no schedules — just raw attendance grouping
  // ───────────────────────────────────────────────────────────────────────────
  async function buildClaimsFromAttendancesOnly(allAtts, allUsers, courses, filters) {
    const attBySess = new Map();
    for (const att of allAtts) {
      if (!attBySess.has(att.session_id)) attBySess.set(att.session_id, []);
      attBySess.get(att.session_id).push(att);
    }

    const totalSessions = attBySess.size;
    const totalPresent  = allAtts.filter(a => (a.status || '').toLowerCase() === 'present').length;
    const totalSlots    = allAtts.length;

    // No lecturer/course mapping — create one placeholder row per lecturer
    const lecturers = allUsers.filter(u => (u.role || '').toLowerCase().includes('lecturer'));
    if (lecturers.length === 0) return [];

    const localEmpMap = getLocalEmploymentMap();
    const sessionPerLec = Math.ceil(totalSessions / lecturers.length);

    return lecturers.map((u, i) => {
      const localEmp = localEmpMap[u.id] || (u.email ? localEmpMap[u.email.toLowerCase()] : null);
      const rawEmp = localEmp || u.employment_type || 'Full-Time';
      return {
        lecturerId:       u.id,
        lecturerName:     u.name,
        lecturerEmail:    u.email || '—',
        employmentType:   rawEmp.toLowerCase().includes('part') ? 'Part-Time' : 'Full-Time',
        courseId:         `pool-${i}`,
        courseCode:       '—',
        courseName:       'Pooled Sessions',
        credits:          0,
        totalSessions:    sessionPerLec,
        totalStudentSlots: Math.round(totalSlots / lecturers.length),
        totalPresent:     Math.round(totalPresent / lecturers.length),
        attendanceRate:   totalSlots > 0 ? Math.round((totalPresent / totalSlots) * 100) : 0,
        sessions:         [],
        _fallback: true,
      };
    });
  }

  // ───────────────────────────────────────────────────────────────────────────
  // Shared: flatten the lecturer→course map to claim rows
  // ───────────────────────────────────────────────────────────────────────────
  function flattenClaims(lecMap, filters = {}) {
    let rows = [];
    for (const lec of lecMap.values()) {
      for (const course of lec.courses.values()) {
        if (course.sessions.length === 0) continue;
        const totalSessions   = course.sessions.length;
        const totalPresent    = course.sessions.reduce((s, r) => s + (r.present || 0), 0);
        const totalSlots      = course.sessions.reduce((s, r) => s + (r.totalEnrolled || 0), 0);
        const attendanceRate  = totalSlots > 0 ? Math.round((totalPresent / totalSlots) * 100) : 0;

        rows.push({
          lecturerId:       lec.lecturerId,
          lecturerName:     lec.lecturerName,
          lecturerEmail:    lec.lecturerEmail,
          employmentType:   lec.employmentType,
          courseId:         course.courseId,
          courseCode:       course.courseCode,
          courseName:       course.courseName,
          credits:          course.credits,
          totalSessions,
          totalStudentSlots: totalSlots,
          totalPresent,
          attendanceRate,
          sessions:         course.sessions,
        });
      }
    }

    if (filters.employmentType && filters.employmentType !== 'all') {
      const norm = filters.employmentType.toLowerCase().includes('part') ? 'part-time' : 'full-time';
      rows = rows.filter(r => (r.employmentType || '').toLowerCase() === norm);
    }

    rows.sort((a, b) => a.lecturerName.localeCompare(b.lecturerName));
    return rows;
  }

  // ───────────────────────────────────────────────────────────────────────────
  // PUBLIC: fetchClaims — tries sessions first, falls back to schedules
  // ───────────────────────────────────────────────────────────────────────────
  async function fetchClaims(filters = {}) {
    isLoading.value  = true;
    error.value      = '';
    rlsWarning.value = false;

    try {
      // ── 1. Try reading sessions table ─────────────────────────────────────
      let sessionsQuery = supabase
        .from(SESSIONS_TABLE)
        .select('id, course_id, lecturer_id, date, max_students, is_active, created_at, mode')
        .order('date', { ascending: false });

      if (filters.lecturerId) sessionsQuery = sessionsQuery.eq('lecturer_id', filters.lecturerId);
      if (filters.courseId)   sessionsQuery = sessionsQuery.eq('course_id',   filters.courseId);
      if (filters.fromDate)   sessionsQuery = sessionsQuery.gte('date', filters.fromDate);
      if (filters.toDate) {
        const toIso = filters.toDate.includes('T') ? filters.toDate : `${filters.toDate}T23:59:59.999Z`;
        sessionsQuery = sessionsQuery.lte('date', toIso);
      }

      const { data: sessionsData, error: sessErr } = await sessionsQuery;

      // ── 2. Sessions available → primary path ──────────────────────────────
      if (!sessErr && sessionsData && sessionsData.length > 0) {
        rlsWarning.value = false;
        const rows = await buildClaimsFromSessions(sessionsData, filters);
        claims.value = rows;
        return rows;
      }

      // ── 3. Sessions empty/RLS-blocked → fallback via schedules ────────────
      console.warn(
        '[FinanceStore] sessions table returned 0 rows. ' +
        (sessErr ? `Error: ${sessErr.message}. ` : '') +
        'Falling back to schedules-based claims derivation. ' +
        'To fix permanently, add a SELECT policy on public.sessions for authenticated users.'
      );

      const rows = await buildClaimsFromSchedules(filters);
      claims.value = rows;
      return rows;
    } catch (err) {
      console.error('[FinanceStore] fetchClaims failed:', err);
      error.value = err.message || 'Failed to load claims.';
      return claims.value;
    } finally {
      isLoading.value = false;
    }
  }

  // ───────────────────────────────────────────────────────────────────────────
  // PUBLIC: fetchLecturers — for filter dropdown
  // ───────────────────────────────────────────────────────────────────────────
  async function fetchLecturers() {
    try {
      const { data, error: err } = await supabase
        .from(USERS_TABLE)
        .select('id, name, email, role, employment_type, id_number')
        .ilike('role', '%lecturer%')
        .order('name', { ascending: true });

      if (err) throw err;

      const localEmpMap = getLocalEmploymentMap();
      lecturers.value = (data || []).map(u => {
        const localEmp = localEmpMap[u.id] || (u.email ? localEmpMap[u.email.toLowerCase()] : null);
        const rawEmp   = localEmp || u.employment_type || 'Full-Time';
        return {
          id:             u.id,
          name:           u.name,
          email:          u.email,
          employmentType: rawEmp.toLowerCase().includes('part') ? 'Part-Time' : 'Full-Time',
          role:           u.role,
          idNumber:       u.id_number,
        };
      });
      return lecturers.value;
    } catch (err) {
      console.error('[FinanceStore] fetchLecturers failed:', err);
      return [];
    }
  }

  // ───────────────────────────────────────────────────────────────────────────
  // CSV Generation
  // ───────────────────────────────────────────────────────────────────────────
  function generateClaimsCSV(rows) {
    const list = rows || claims.value;
    const headers = [
      'Lecturer ID', 'Lecturer Name', 'Lecturer Email', 'Employment Type',
      'Course Code', 'Course Name', 'Credits',
      'Total Sessions', 'Total Student Slots', 'Total Present',
      'Attendance Rate (%)', 'Finance Claim Basis', 'Estimated Payout (GHS)',
    ];
    const esc = v => `"${String(v ?? '').replace(/"/g, '""')}"`;
    const csvLines = [
      headers.join(','),
      ...list.map(r => {
        const isPT   = (r.employmentType || '').toLowerCase().includes('part');
        const payout = isPT ? (r.totalSessions * 180) : 'Salaried (Monthly)';
        const basis  = isPT ? 'Per Session (GHS 180/sess)' : 'Full-Time Fixed Salary';
        return [
          esc(r.lecturerId), esc(r.lecturerName), esc(r.lecturerEmail),
          esc(r.employmentType || 'Full-Time'),
          esc(r.courseCode), esc(r.courseName), r.credits ?? 0,
          r.totalSessions ?? 0, r.totalStudentSlots ?? 0, r.totalPresent ?? 0,
          `${r.attendanceRate ?? 0}%`, esc(basis), esc(payout),
        ].join(',');
      }),
    ];
    return csvLines.join('\r\n');
  }

  function downloadClaimsCSV(rows, customFilename) {
    const list = rows || claims.value;
    if (!list || list.length === 0) throw new Error('No claims records to download.');
    const csv      = generateClaimsCSV(list);
    const blob     = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const filename = customFilename || `lecturer_claims_${new Date().toISOString().slice(0, 10)}.csv`;
    const url      = URL.createObjectURL(blob);
    const link     = document.createElement('a');
    link.href = url; link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }

  // ───────────────────────────────────────────────────────────────────────────
  // Realtime
  // ───────────────────────────────────────────────────────────────────────────
  function subscribeToFinanceRealtime(onUpdate) {
    if (realtimeChannel) return;
    realtimeChannel = supabase
      .channel('finance-audit-realtime')
      .on('postgres_changes', { event: '*', schema: 'public', table: SESSIONS_TABLE },    () => { if (onUpdate) onUpdate(); })
      .on('postgres_changes', { event: '*', schema: 'public', table: ATTENDANCES_TABLE }, () => { if (onUpdate) onUpdate(); })
      .subscribe();
  }

  function unsubscribeFromFinanceRealtime() {
    if (!realtimeChannel) return;
    supabase.removeChannel(realtimeChannel);
    realtimeChannel = null;
  }

  return {
    claims,
    lecturers,
    isLoading,
    error,
    rlsWarning,
    totalClaimsCount,
    totalVerifiedSessions,
    fetchClaims,
    fetchLecturers,
    generateClaimsCSV,
    downloadClaimsCSV,
    subscribeToFinanceRealtime,
    unsubscribeFromFinanceRealtime,
  };
});
