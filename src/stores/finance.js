import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import { supabase } from './supabase';

const SESSIONS_TABLE = 'sessions';
const COURSES_TABLE = 'courses';
const USERS_TABLE = 'users';
const ATTENDANCES_TABLE = 'attendances';

/**
 * Safely fetches attendances in batches of 200 session IDs
 * to avoid URL length constraints on Supabase PostgREST queries.
 */
async function fetchAttendancesForSessions(sessionIds) {
  if (!sessionIds || sessionIds.length === 0) return [];
  const chunkSize = 200;
  if (sessionIds.length <= chunkSize) {
    const { data, error } = await supabase
      .from(ATTENDANCES_TABLE)
      .select('id, session_id, status')
      .in('session_id', sessionIds);
    if (error) {
      console.warn('Supabase attendances fetch warning:', error);
      return [];
    }
    return data || [];
  }

  const chunks = [];
  for (let i = 0; i < sessionIds.length; i += chunkSize) {
    chunks.push(sessionIds.slice(i, i + chunkSize));
  }

  const results = await Promise.all(
    chunks.map(chunk =>
      supabase
        .from(ATTENDANCES_TABLE)
        .select('id, session_id, status')
        .in('session_id', chunk)
    )
  );

  return results.flatMap(r => r.data || []);
}

export const useFinanceStore = defineStore('finance', () => {
  const claims = ref([]);
  const lecturers = ref([]);
  const isLoading = ref(false);
  const error = ref('');
  let realtimeChannel = null;

  const totalClaimsCount = computed(() => claims.value.length);
  const totalVerifiedSessions = computed(() =>
    claims.value.reduce((sum, c) => sum + (c.totalSessions || 0), 0)
  );

  /**
   * Helper to retrieve any locally cached employment type overrides
   * set by Admin in LecturersAdmin view.
   */
  function getLocalEmploymentMap() {
    try {
      return JSON.parse(localStorage.getItem('lecturer_employment_types') || '{}');
    } catch {
      return {};
    }
  }

  /**
   * Fetch all lecturer claims aggregated by (Lecturer, Course)
   * from Supabase tables: sessions, courses, users, and attendances.
   *
   * @param {Object} filters
   * @param {string} [filters.lecturerId]
   * @param {string} [filters.courseId]
   * @param {string} [filters.employmentType] - 'part-time', 'full-time', or 'all'
   * @param {string} [filters.fromDate] - 'YYYY-MM-DD'
   * @param {string} [filters.toDate] - 'YYYY-MM-DD'
   */
  async function fetchClaims(filters = {}) {
    isLoading.value = true;
    error.value = '';

    try {
      // 1. Query sessions from Supabase
      let sessionsQuery = supabase
        .from(SESSIONS_TABLE)
        .select('id, course_id, lecturer_id, date, max_students, is_active, created_at, mode')
        .order('date', { ascending: false });

      if (filters.lecturerId) {
        sessionsQuery = sessionsQuery.eq('lecturer_id', filters.lecturerId);
      }
      if (filters.courseId) {
        sessionsQuery = sessionsQuery.eq('course_id', filters.courseId);
      }
      if (filters.fromDate) {
        sessionsQuery = sessionsQuery.gte('date', filters.fromDate);
      }
      if (filters.toDate) {
        const toIso = filters.toDate.includes('T')
          ? filters.toDate
          : `${filters.toDate}T23:59:59.999Z`;
        sessionsQuery = sessionsQuery.lte('date', toIso);
      }

      const { data: sessionsData, error: sessErr } = await sessionsQuery;
      if (sessErr) throw sessErr;

      const sessionsList = sessionsData || [];
      if (sessionsList.length === 0) {
        claims.value = [];
        return [];
      }

      // 2. Identify referenced course IDs, lecturer IDs, and session IDs
      const courseIds = [...new Set(sessionsList.map(s => s.course_id).filter(Boolean))];
      const lecturerIds = [...new Set(sessionsList.map(s => s.lecturer_id).filter(Boolean))];
      const sessionIds = sessionsList.map(s => s.id);

      // 3. Fetch courses, users (lecturers), and attendances concurrently
      const [coursesRes, usersRes, attendancesList] = await Promise.all([
        courseIds.length > 0
          ? supabase.from(COURSES_TABLE).select('id, code, name, credits').in('id', courseIds)
          : Promise.resolve({ data: [] }),
        lecturerIds.length > 0
          ? supabase.from(USERS_TABLE).select('id, name, email, role, employment_type, id_number').in('id', lecturerIds)
          : Promise.resolve({ data: [] }),
        fetchAttendancesForSessions(sessionIds),
      ]);

      const courseMap = new Map((coursesRes.data || []).map(c => [c.id, c]));
      const userMap = new Map((usersRes.data || []).map(u => [u.id, u]));
      const localEmpMap = getLocalEmploymentMap();

      // 4. Index attendances by session_id
      const attendancesBySession = new Map();
      for (const att of attendancesList) {
        if (!attendancesBySession.has(att.session_id)) {
          attendancesBySession.set(att.session_id, []);
        }
        attendancesBySession.get(att.session_id).push(att);
      }

      // 5. Group sessions by lecturer -> course
      const lecturerGroupMap = new Map();

      for (const s of sessionsList) {
        const lKey = s.lecturer_id || 'unassigned';
        if (!lecturerGroupMap.has(lKey)) {
          const user = userMap.get(s.lecturer_id);
          const localEmp = user?.id
            ? (localEmpMap[user.id] || (user.email ? localEmpMap[user.email.toLowerCase()] : null))
            : null;
          const rawEmp = localEmp || user?.employment_type || 'Full-Time';
          const employmentType = rawEmp.toLowerCase().includes('part') ? 'Part-Time' : 'Full-Time';

          lecturerGroupMap.set(lKey, {
            lecturerId: s.lecturer_id || lKey,
            lecturerName: user?.name || 'Academic Faculty',
            lecturerEmail: user?.email || '—',
            employmentType,
            courses: new Map(),
          });
        }

        const lecGroup = lecturerGroupMap.get(lKey);
        const cKey = s.course_id || 'unassigned';
        if (!lecGroup.courses.has(cKey)) {
          const course = courseMap.get(s.course_id);
          lecGroup.courses.set(cKey, {
            courseId: s.course_id || cKey,
            courseCode: course?.code || '—',
            courseName: course?.name || 'Academic Course',
            credits: course?.credits ?? 0,
            sessions: [],
          });
        }

        const sessAtts = attendancesBySession.get(s.id) || [];
        const present = sessAtts.filter(a => (a.status || '').toLowerCase() === 'present').length;
        const absent = sessAtts.filter(a => (a.status || '').toLowerCase() === 'absent').length;

        lecGroup.courses.get(cKey).sessions.push({
          sessionId: s.id,
          date: s.date,
          totalEnrolled: sessAtts.length,
          present,
          absent,
        });
      }

      // 6. Flatten to claim rows
      let rows = [];
      for (const lec of lecturerGroupMap.values()) {
        for (const course of lec.courses.values()) {
          const totalSessions = course.sessions.length;
          const totalPresent = course.sessions.reduce((sum, r) => sum + r.present, 0);
          const totalStudentSlots = course.sessions.reduce((sum, r) => sum + r.totalEnrolled, 0);
          const attendanceRate = totalStudentSlots > 0
            ? Math.round((totalPresent / totalStudentSlots) * 100)
            : 0;

          rows.push({
            lecturerId: lec.lecturerId,
            lecturerName: lec.lecturerName,
            lecturerEmail: lec.lecturerEmail,
            employmentType: lec.employmentType,
            courseId: course.courseId,
            courseCode: course.courseCode,
            courseName: course.courseName,
            credits: course.credits,
            totalSessions,
            totalStudentSlots,
            totalPresent,
            attendanceRate,
            sessions: course.sessions,
          });
        }
      }

      // 7. Filter by employmentType if requested
      if (filters.employmentType && filters.employmentType !== 'all') {
        const norm = filters.employmentType.toLowerCase().includes('part') ? 'part-time' : 'full-time';
        rows = rows.filter(r => (r.employmentType || '').toLowerCase() === norm);
      }

      // Sort by Lecturer Name ascending
      rows.sort((a, b) => a.lecturerName.localeCompare(b.lecturerName));

      claims.value = rows;
      return rows;
    } catch (err) {
      console.error('Failed to fetch finance claims from Supabase:', err);
      error.value = err.message || 'Failed to load claims from Supabase.';
      return claims.value;
    } finally {
      isLoading.value = false;
    }
  }

  /**
   * Fetch all lecturers for the filter dropdown
   */
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
        const rawEmp = localEmp || u.employment_type || 'Full-Time';
        return {
          id: u.id,
          name: u.name,
          email: u.email,
          employmentType: rawEmp.toLowerCase().includes('part') ? 'Part-Time' : 'Full-Time',
          role: u.role,
          idNumber: u.id_number,
        };
      });

      return lecturers.value;
    } catch (err) {
      console.error('Failed to fetch lecturers for finance:', err);
      return [];
    }
  }

  /**
   * Generate CSV format string from claims list
   */
  function generateClaimsCSV(rows) {
    const list = rows || claims.value;
    const headers = [
      'Lecturer ID',
      'Lecturer Name',
      'Lecturer Email',
      'Employment Type',
      'Course Code',
      'Course Name',
      'Credits',
      'Total Sessions',
      'Total Student Slots',
      'Total Present',
      'Attendance Rate (%)',
      'Finance Claim Basis',
      'Estimated Claim Payout (GHS)'
    ];

    const escapeCsv = (val) => {
      if (val === null || val === undefined) return '""';
      const str = String(val).replace(/"/g, '""');
      return `"${str}"`;
    };

    const csvLines = [
      headers.join(','),
      ...list.map(r => {
        const isPT = (r.employmentType || '').toLowerCase().includes('part');
        const payout = isPT ? (r.totalSessions * 180) : 'Salaried (Monthly)';
        const basis = isPT ? 'Per Session (GHS 180/sess)' : 'Full-Time Fixed Salary';
        return [
          escapeCsv(r.lecturerId),
          escapeCsv(r.lecturerName),
          escapeCsv(r.lecturerEmail),
          escapeCsv(r.employmentType || 'Full-Time'),
          escapeCsv(r.courseCode),
          escapeCsv(r.courseName),
          r.credits ?? 0,
          r.totalSessions ?? 0,
          r.totalStudentSlots ?? 0,
          r.totalPresent ?? 0,
          `${r.attendanceRate ?? 0}%`,
          escapeCsv(basis),
          escapeCsv(payout)
        ].join(',');
      })
    ];

    return csvLines.join('\r\n');
  }

  /**
   * Client-side CSV file download
   */
  function downloadClaimsCSV(rows, customFilename) {
    const list = rows || claims.value;
    if (!list || list.length === 0) {
      throw new Error('No claims records available to download.');
    }

    const csvContent = generateClaimsCSV(list);
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const filename = customFilename || `lecturer_claims_${new Date().toISOString().slice(0, 10)}.csv`;
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }

  /**
   * Subscribe to Supabase realtime events on sessions and attendances
   */
  function subscribeToFinanceRealtime(onUpdate) {
    if (realtimeChannel) return;

    realtimeChannel = supabase
      .channel('finance-audit-realtime')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: SESSIONS_TABLE },
        () => {
          if (onUpdate) onUpdate();
        }
      )
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: ATTENDANCES_TABLE },
        () => {
          if (onUpdate) onUpdate();
        }
      )
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
