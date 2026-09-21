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

  // ── Fetch ─────────────────────────────────────────────────────────────────────
  async function fetchNotifications(studentId) {
    if (!studentId) return;
    isLoading.value = true;
    error.value = "";
    try {
      const results = [];

      // 1. Absence warnings & ineligibility notices from student_notifications table
      //    (written by the backend's runAbsencesCheck after each session)
      const { data: dbNotifs, error: dbErr } = await supabase
        .from("student_notifications")
        .select("id, type, message, is_read, created_at, course_id, courses(code, name)")
        .eq("student_id", studentId)
        .order("created_at", { ascending: false })
        .limit(50);

      if (!dbErr && dbNotifs) {
        dbNotifs.forEach((n) => {
          results.push({
            id: "db-" + n.id,
            type: n.type,           // warning_1 | warning_2 | ineligible | eval_open
            isRead: n.is_read ?? false,
            createdAt: n.created_at,
            courseCode: n.courses?.code ?? "",
            courseName: n.courses?.name ?? "",
            message: n.message,
          });
        });
      } else if (dbErr) {
        // Table may not exist in Supabase yet — fall back gracefully
        console.warn("student_notifications table not accessible via Supabase:", dbErr.message);
      }

      // 2. Raw attendance absences (direct Supabase fallback when backend is offline)
      //    Only add if not already covered by a db notification for the same session.
      const dbAbsentSessionIds = new Set(
        results
          .filter((n) => n.type === "warning_1" || n.type === "warning_2" || n.type === "ineligible" || n.type === "attendance_absent")
          .map((n) => n.id)
      );

      const { data: absentRecs, error: attErr } = await supabase
        .from("attendances")
        .select("id, status, created_at, sessions(id, course_id, courses(code, name))")
        .eq("student_id", studentId)
        .eq("status", "absent")
        .order("created_at", { ascending: false })
        .limit(20);

      if (!attErr && absentRecs) {
        absentRecs.forEach((rec) => {
          const notifId = "att-" + rec.id;
          if (dbAbsentSessionIds.has(notifId)) return; // already have a proper warning
          const course = rec.sessions?.courses;
          results.push({
            id: notifId,
            type: "attendance_absent",
            isRead: false,
            createdAt: rec.created_at,
            courseCode: course?.code ?? "",
            courseName: course?.name ?? "",
            message:
              "You were marked absent" +
              (course?.name ? " for " + course.name : "") +
              ". If this is an error, contact your lecturer.",
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
          results.push({
            id: "sug-" + sug.id,
            type: sug.status === "resolved" ? "suggestion_resolved" : "suggestion_reply",
            isRead: false,
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
          results.push({
            id: "eval-" + ev.id,
            type: "eval_open",
            isRead: false,
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

    // Channel 1: raw attendances table (absence marked)
    realtimeChannel = supabase
      .channel("student-notifs-" + studentId)
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "attendances", filter: "student_id=eq." + studentId },
        async (payload) => {
          if (payload.new?.status === "absent") {
            const { data: session } = await supabase
              .from("sessions")
              .select("id, course_id, courses(code, name)")
              .eq("id", payload.new.session_id)
              .single();
            const course = session?.courses;
            const newNotif = {
              id: "att-" + payload.new.id,
              type: "attendance_absent",
              isRead: false,
              createdAt: payload.new.created_at,
              courseCode: course?.code ?? "",
              courseName: course?.name ?? "",
              message:
                "You were marked absent" +
                (course?.name ? " for " + course.name : "") +
                ". If this is an error, contact your lecturer.",
            };
            if (!notifications.value.some((n) => n.id === newNotif.id)) {
              notifications.value.unshift(newNotif);
            }
          }
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
        async (payload) => {
          const n = payload.new;
          if (!n) return;

          // Fetch course details
          let courseCode = "";
          let courseName = "";
          if (n.course_id) {
            const { data: course } = await supabase
              .from("courses")
              .select("code, name")
              .eq("id", n.course_id)
              .single();
            courseCode = course?.code ?? "";
            courseName = course?.name ?? "";
          }

          const newNotif = {
            id: "db-" + n.id,
            type: n.type,
            isRead: n.is_read ?? false,
            createdAt: n.created_at,
            courseCode,
            courseName,
            message: n.message,
          };

          const idx = notifications.value.findIndex((existing) => existing.id === newNotif.id);
          if (idx >= 0) notifications.value.splice(idx, 1, newNotif);
          else notifications.value.unshift(newNotif);
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
    const n = notifications.value.find((n) => n.id === id);
    if (n) n.isRead = true;
  }

  function markAllRead() {
    notifications.value.forEach((n) => (n.isRead = true));
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
