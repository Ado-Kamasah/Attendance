import { defineStore } from "pinia";
import { ref, computed } from "vue";
import { supabase } from "./supabase";

export const useStudentNotificationsStore = defineStore("studentNotifications", () => {
  const notifications = ref([]);
  const isLoading = ref(false);
  const error = ref("");
  let realtimeChannel = null;

  const unreadCount = computed(() => notifications.value.filter((n) => !n.isRead).length);

  const attendanceNotifications = computed(() =>
    notifications.value.filter((n) => n.type === "attendance_absent")
  );
  const suggestionNotifications = computed(() =>
    notifications.value.filter((n) => n.type === "suggestion_reply" || n.type === "suggestion_resolved")
  );
  const evalNotifications = computed(() =>
    notifications.value.filter((n) => n.type === "eval_open")
  );

  async function fetchNotifications(studentId) {
    if (!studentId) return;
    isLoading.value = true;
    error.value = "";
    try {
      const results = [];

      // 1. Attendance absences
      const { data: absentRecs, error: attErr } = await supabase
        .from("attendances")
        .select("id, status, created_at, sessions(id, course_id, courses(code, name))")
        .eq("student_id", studentId)
        .eq("status", "absent")
        .order("created_at", { ascending: false })
        .limit(20);

      if (!attErr && absentRecs) {
        absentRecs.forEach((rec) => {
          const course = rec.sessions?.courses;
          results.push({
            id: "att-" + rec.id,
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

      // 2. Suggestion replies / resolutions
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

      // 3. Open evaluations
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

  function subscribeToAttendance(studentId) {
    if (realtimeChannel || !studentId) return;

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
  }

  function unsubscribe() {
    if (!realtimeChannel) return;
    supabase.removeChannel(realtimeChannel);
    realtimeChannel = null;
  }

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
    attendanceNotifications,
    suggestionNotifications,
    evalNotifications,
    fetchNotifications,
    subscribeToAttendance,
    unsubscribe,
    markRead,
    markAllRead,
  };
});
