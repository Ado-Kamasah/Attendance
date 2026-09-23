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

      // 2. Absence warnings computed directly from attendances table
      //    This guarantees that warnings (warning_1, warning_2, ineligible)
      //    work 100% of the time directly from the live database.
      const { data: absentRecs, error: attErr } = await supabase
        .from("attendances")
        .select("id, status, created_at, session_id, sessions(id, course_id, courses(id, code, name))")
        .eq("student_id", studentId)
        .eq("status", "absent")
        .order("created_at", { ascending: false });

      if (!attErr && absentRecs && absentRecs.length > 0) {
        // Group absences by course
        const absencesByCourse = new Map();
        absentRecs.forEach((rec) => {
          const course = rec.sessions?.courses;
          const courseId = rec.sessions?.course_id || course?.id;
          if (!courseId) return;

          if (!absencesByCourse.has(courseId)) {
            absencesByCourse.set(courseId, {
              courseId,
              code: course?.code ?? "",
              name: course?.name ?? "",
              records: [],
              latestCreatedAt: rec.created_at,
            });
          }
          absencesByCourse.get(courseId).records.push(rec);
        });

        // For each course, generate the appropriate milestone warning
        absencesByCourse.forEach((group, courseId) => {
          const missedCount = group.records.length;
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
              createdAt: group.latestCreatedAt,
              courseCode: group.code,
              courseName: group.name,
              message,
            });
          }

          // Also include the individual session absence logs
          group.records.slice(0, 5).forEach((rec) => {
            const notifId = "att-" + rec.id;
            results.push({
              id: notifId,
              type: "attendance_absent",
              isRead: readIds.value.has(notifId),
              createdAt: rec.created_at,
              courseCode: group.code,
              courseName: group.name,
              message: `You were marked absent for ${group.name} (${group.code}) on ${new Date(rec.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}.`,
            });
          });
        });
      }

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
      const now = new Date().toISOString();
      const { data: evals, error: evalErr } = await supabase
        .from("evaluations")
        .select("id, title, open_at, close_at")
        .lte("open_at", now)
        .gte("close_at", now)
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

    // Channel 1: attendances table changes (absent marked/updated)
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
