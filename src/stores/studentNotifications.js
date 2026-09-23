import { defineStore } from "pinia";
import { ref, computed } from "vue";
import { supabase } from "./supabase";

export const useStudentNotificationsStore = defineStore("studentNotifications", () => {
  const notifications = ref([]);
  const isLoading = ref(false);
  const error = ref("");
  let realtimeChannel = null;
  let notifsChannel = null;

  // ── Counts ────────────────────────────────────────────────────────────────────
  const unreadCount = computed(() => notifications.value.filter((n) => !n.isRead).length);

  // ── Typed slices (used by StudentDashboard and notification pages) ────────────
  const attendanceNotifications = computed(() =>
    notifications.value.filter((n) => n.type === "attendance_absent")
  );
  const suggestionNotifications = computed(() =>
    notifications.value.filter((n) => n.type === "suggestion_reply" || n.type === "suggestion_resolved")
  );
  const evalNotifications = computed(() =>
    notifications.value.filter((n) => n.type === "eval_open")
  );

  /** ⚠️  1st absence warning (warning_1) and 2nd (warning_2) */
  const warningNotifications = computed(() =>
    notifications.value.filter((n) => n.type === "warning_1" || n.type === "warning_2")
  );

  /** ❌  3+ absences — exam ineligibility */
  const ineligibleNotifications = computed(() =>
    notifications.value.filter((n) => n.type === "ineligible")
  );

  /** 📋  Evaluation period open */
  const evalOpenNotifications = computed(() =>
    notifications.value.filter((n) => n.type === "eval_open")
  );

  const readIds = ref(new Set(JSON.parse(localStorage.getItem('student_read_notifs') || '[]')));

  // ── Fetch ─────────────────────────────────────────────────────────────────────
  async function fetchNotifications(studentId) {
    if (!studentId) return;
    isLoading.value = true;
    error.value = "";
    try {
      const results = [];
      const dbCoveredCourseIds = new Set();

      // 1. Absence warnings & ineligibility notices from student_notifications table
      //    (written by backend if available)
      const { data: dbNotifs, error: dbErr } = await supabase
        .from("student_notifications")
        .select("id, type, message, is_read, created_at, course_id, courses(code, name)")
        .eq("student_id", studentId)
        .order("created_at", { ascending: false })
        .limit(50);

      if (!dbErr && dbNotifs && dbNotifs.length > 0) {
        dbNotifs.forEach((n) => {
          if (n.course_id && (n.type === 'warning_1' || n.type === 'warning_2' || n.type === 'ineligible')) {
            dbCoveredCourseIds.add(n.course_id);
          }
          const id = "db-" + n.id;
          results.push({
            id,
            type: n.type,           // warning_1 | warning_2 | ineligible | eval_open
            isRead: n.is_read || readIds.value.has(id),
            createdAt: n.created_at,
            courseCode: n.courses?.code ?? "",
            courseName: n.courses?.name ?? "",
            message: n.message,
          });
        });
      }

      // 2. Absence warnings computed directly from "already attendance" & live data
      // Fetch attendances from Supabase (using 'timestamp' column, NOT 'created_at')
      const { data: dbAtts } = await supabase
        .from("attendances")
        .select("id, session_id, student_id, status, timestamp")
        .eq("student_id", studentId)
        .order("timestamp", { ascending: false });

      // Retrieve in-memory attendances from attendancesStore if available
      let localAtts = [];
      try {
        const { useAttendancesStore } = await import("./attendances");
        const attStore = useAttendancesStore();
        localAtts = (attStore.attendances || [])
          .filter(a => a.studentId === studentId)
          .map(a => ({
            id: a.id,
            session_id: a.sessionId,
            student_id: a.studentId,
            status: a.status,
            timestamp: a.timestamp,
          }));
      } catch (e) {
        console.warn("Could not read local attendancesStore:", e);
      }

      // Merge attendances (deduplicate by id or session_id)
      const attendanceMap = new Map();
      (dbAtts || []).forEach(a => {
        const key = a.session_id ? `sess-${a.session_id}` : `id-${a.id}`;
        attendanceMap.set(key, a);
      });
      localAtts.forEach(a => {
        const key = a.session_id ? `sess-${a.session_id}` : `id-${a.id}`;
        if (!attendanceMap.has(key)) {
          attendanceMap.set(key, a);
        }
      });
      const allStudentAttendances = Array.from(attendanceMap.values());

      // Fetch or read sessions, courses, enrollments
      let coursesMap = new Map();
      let sessionsMap = new Map();
      let enrolledCourseIds = new Set();

      // Read from courses store
      try {
        const { useCoursesStore } = await import("./courses");
        const coursesStore = useCoursesStore();
        (coursesStore.courses || []).forEach(c => coursesMap.set(c.id, { id: c.id, code: c.code, name: c.name }));
      } catch {}

      // Read from sessions store
      try {
        const { useSessionsStore } = await import("./sessions");
        const sessStore = useSessionsStore();
        (sessStore.sessions || []).forEach(s => sessionsMap.set(s.id, {
          id: s.id,
          courseId: s.courseId,
          date: s.date,
          isActive: s.isActive,
          createdAt: s.createdAt,
        }));
      } catch {}

      // Read from enrollments store
      try {
        const { useEnrollmentsStore } = await import("./enrollments");
        const enrollStore = useEnrollmentsStore();
        (enrollStore.enrollments || [])
          .filter(e => e.studentId === studentId)
          .forEach(e => enrolledCourseIds.add(e.courseId));
      } catch {}

      // If coursesMap is empty, query Supabase
      if (coursesMap.size === 0) {
        const { data: dbCourses } = await supabase.from("courses").select("id, code, name");
        (dbCourses || []).forEach(c => coursesMap.set(c.id, { id: c.id, code: c.code, name: c.name }));
      }

      // If sessionsMap is empty, query Supabase
      if (sessionsMap.size === 0) {
        const { data: dbSessions } = await supabase.from("sessions").select("id, course_id, date, is_active, created_at");
        (dbSessions || []).forEach(s => sessionsMap.set(s.id, {
          id: s.id,
          courseId: s.course_id,
          date: s.date,
          isActive: s.is_active,
          createdAt: s.created_at,
        }));
      }

      // If enrolledCourseIds is empty, query Supabase
      if (enrolledCourseIds.size === 0) {
        const { data: dbEnrollments } = await supabase.from("enrollments").select("course_id").eq("student_id", studentId);
        (dbEnrollments || []).forEach(e => enrolledCourseIds.add(e.course_id));
      }

      // Group absences by course
      // An absence occurs when:
      // A) An attendance record explicitly has status === 'absent'
      // B) A conducted/past session exists for an enrolled course, and student was not marked present
      const absencesByCourse = new Map();
      const processedSessionIds = new Set();

      // Process all explicit attendances
      allStudentAttendances.forEach(att => {
        if (!att.session_id) return;
        processedSessionIds.add(att.session_id);

        if (att.status === "absent") {
          const session = sessionsMap.get(att.session_id);
          const courseId = session?.courseId;
          const course = courseId ? coursesMap.get(courseId) : null;
          const courseCode = course?.code || "Course";
          const courseName = course?.name || "Enrolled Course";
          const timestamp = att.timestamp || session?.date || session?.createdAt || new Date().toISOString();

          if (courseId) {
            if (!absencesByCourse.has(courseId)) {
              absencesByCourse.set(courseId, {
                courseId,
                code: courseCode,
                name: courseName,
                missedSessions: [],
                latestTimestamp: timestamp,
              });
            }
            const group = absencesByCourse.get(courseId);
            group.missedSessions.push({
              sessionId: att.session_id,
              recordId: att.id,
              timestamp,
            });
            if (new Date(timestamp) > new Date(group.latestTimestamp)) {
              group.latestTimestamp = timestamp;
            }
          }
        }
      });

      // Also check conducted/inactive sessions for enrolled courses where student has no present record
      const now = new Date();
      sessionsMap.forEach(sess => {
        if (!enrolledCourseIds.has(sess.courseId)) return;
        if (processedSessionIds.has(sess.id)) return; // already processed explicit attendance

        // Check if session has occurred (is not active, or date in past)
        const isPastOrConducted = (!sess.isActive) || (sess.date && new Date(sess.date) <= now);
        if (isPastOrConducted) {
          const courseId = sess.courseId;
          const course = coursesMap.get(courseId);
          const courseCode = course?.code || "Course";
          const courseName = course?.name || "Enrolled Course";
          const timestamp = sess.date || sess.createdAt || new Date().toISOString();

          if (!absencesByCourse.has(courseId)) {
            absencesByCourse.set(courseId, {
              courseId,
              code: courseCode,
              name: courseName,
              missedSessions: [],
              latestTimestamp: timestamp,
            });
          }
          const group = absencesByCourse.get(courseId);
          group.missedSessions.push({
            sessionId: sess.id,
            recordId: `sess-missed-${sess.id}`,
            timestamp,
          });
          if (new Date(timestamp) > new Date(group.latestTimestamp)) {
            group.latestTimestamp = timestamp;
          }
        }
      });

      // Generate milestone notices (warning_1, warning_2, ineligible) and session logs
      absencesByCourse.forEach((group, courseId) => {
        const missedCount = group.missedSessions.length;
        if (missedCount === 0) return;

        let warningType = null;
        let message = "";

        if (missedCount === 1) {
          warningType = "warning_1";
          message = `⚠️ Warning: You have missed 1 class in ${group.name} (${group.code}). Missing 3 classes will make you ineligible to write the exam.`;
        } else if (missedCount === 2) {
          warningType = "warning_2";
          message = `🚨 Critical Warning: You have missed 2 classes in ${group.name} (${group.code}). One more absence will render you ineligible to sit the examination.`;
        } else if (missedCount >= 3) {
          warningType = "ineligible";
          message = `❌ Exam Ineligibility: You have missed ${missedCount} classes in ${group.name} (${group.code}). You are NOT eligible to write the examination for this course.`;
        }

        if (warningType && !dbCoveredCourseIds.has(courseId)) {
          const warnId = `warn-${studentId}-${courseId}-${missedCount}`;
          results.push({
            id: warnId,
            type: warningType,
            isRead: readIds.value.has(warnId),
            createdAt: group.latestTimestamp,
            courseCode: group.code,
            courseName: group.name,
            message,
          });
        }

        // Add individual session absence logs
        group.missedSessions.forEach((item) => {
          const notifId = "att-" + item.recordId;
          const sessionDateStr = item.timestamp
            ? new Date(item.timestamp).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })
            : "Recent Session";

          results.push({
            id: notifId,
            type: "attendance_absent",
            isRead: readIds.value.has(notifId),
            createdAt: item.timestamp,
            courseCode: group.code,
            courseName: group.name,
            message: `You were marked absent for ${group.name} (${group.code}) on ${sessionDateStr}.`,
          });
        });
      });

      // 3. Suggestion replies / resolutions
      const { data: suggestions, error: sugErr } = await supabase
        .from("suggestions")
        .select("id, subject, status, admin_note, updated_at")
        .eq("student_id", studentId)
        .not("admin_note", "is", null)
        .order("updated_at", { ascending: false })
        .limit(10);

      if (!sugErr && suggestions) {
        suggestions.forEach((sug) => {
          const sugId = "sug-" + sug.id;
          results.push({
            id: sugId,
            type: sug.status === "resolved" ? "suggestion_resolved" : "suggestion_reply",
            isRead: readIds.value.has(sugId),
            createdAt: sug.updated_at,
            courseCode: "",
            courseName: "",
            message:
              sug.status === "resolved"
                ? 'Your suggestion "' + sug.subject + '" has been resolved. Admin note: ' + sug.admin_note
                : 'Admin responded to your suggestion "' + sug.subject + '": ' + sug.admin_note,
          });
        });
      }

      // 4. Open evaluations
      const nowIso = new Date().toISOString();
      const { data: evals, error: evalErr } = await supabase
        .from("evaluations")
        .select("id, title, open_at, close_at")
        .lte("open_at", nowIso)
        .gte("close_at", nowIso)
        .limit(5);

      if (!evalErr && evals) {
        evals.forEach((ev) => {
          const evalId = "eval-" + ev.id;
          results.push({
            id: evalId,
            type: "eval_open",
            isRead: readIds.value.has(evalId),
            createdAt: ev.open_at,
            courseCode: "",
            courseName: "",
            message:
              '"' + ev.title + '" evaluation is now open. Deadline: ' +
              new Date(ev.close_at).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }) + ".",
          });
        });
      }

      results.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
      notifications.value = results;
    } catch (err) {
      error.value = err?.message || "Failed to load notifications";
      console.error("fetchNotifications error:", err);
    } finally {
      isLoading.value = false;
    }
  }

  // ── Realtime ──────────────────────────────────────────────────────────────────
  function subscribeToAttendance(studentId) {
    if (realtimeChannel || !studentId) return;

    // Channel 1: attendances & sessions table changes (absent marked/updated)
    realtimeChannel = supabase
      .channel("student-notifs-" + studentId)
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "attendances", filter: "student_id=eq." + studentId },
        async () => {
          // Immediately re-fetch notifications to re-compute course counts and milestone warnings
          await fetchNotifications(studentId);
        }
      )
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "sessions" },
        async () => {
          await fetchNotifications(studentId);
        }
      )
      .on(
        "postgres_changes",
        { event: "UPDATE", schema: "public", table: "suggestions", filter: "student_id=eq." + studentId },
        (payload) => {
          if (payload.new?.admin_note) {
            const sug = payload.new;
            const newNotif = {
              id: "sug-" + sug.id,
              type: sug.status === "resolved" ? "suggestion_resolved" : "suggestion_reply",
              isRead: false,
              createdAt: sug.updated_at || new Date().toISOString(),
              courseCode: "",
              courseName: "",
              message:
                sug.status === "resolved"
                  ? 'Your suggestion "' + sug.subject + '" has been resolved. Admin note: ' + sug.admin_note
                  : 'Admin responded to your suggestion "' + sug.subject + '": ' + sug.admin_note,
            };
            const idx = notifications.value.findIndex((n) => n.id === newNotif.id);
            if (idx >= 0) notifications.value.splice(idx, 1, newNotif);
            else notifications.value.unshift(newNotif);
          }
        }
      )
      .subscribe();

    // Channel 2: student_notifications table (backend absence warnings)
    notifsChannel = supabase
      .channel("student-db-notifs-" + studentId)
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "student_notifications", filter: "student_id=eq." + studentId },
        async () => {
          await fetchNotifications(studentId);
        }
      )
      .subscribe();
  }

  function unsubscribe() {
    if (realtimeChannel) {
      supabase.removeChannel(realtimeChannel);
      realtimeChannel = null;
    }
    if (notifsChannel) {
      supabase.removeChannel(notifsChannel);
      notifsChannel = null;
    }
  }

  // ── Read tracking (local only — no backend call needed) ───────────────────────
  function markRead(id) {
    readIds.value.add(id);
    try {
      localStorage.setItem('student_read_notifs', JSON.stringify([...readIds.value]));
    } catch {}
    const n = notifications.value.find((n) => n.id === id);
    if (n) n.isRead = true;
  }

  function markAllRead() {
    notifications.value.forEach((n) => {
      n.isRead = true;
      readIds.value.add(n.id);
    });
    try {
      localStorage.setItem('student_read_notifs', JSON.stringify([...readIds.value]));
    } catch {}
  }

  return {
    notifications,
    isLoading,
    error,
    unreadCount,
    // Legacy computed (kept for backward compatibility)
    attendanceNotifications,
    suggestionNotifications,
    evalNotifications,
    // New computed properties used by StudentDashboard
    warningNotifications,
    ineligibleNotifications,
    evalOpenNotifications,
    // Actions
    fetchNotifications,
    subscribeToAttendance,
    unsubscribe,
    markRead,
    markAllRead,
  };
});
