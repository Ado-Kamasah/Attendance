<template>
  <div class="space-y-6 w-full max-w-6xl mx-auto">
    <!-- No Course Selected -->
    <div v-if="!courseId" class="py-16 text-center text-foreground/50 dark:text-white/65 bg-surface dark:bg-dark-surface border border-outline/40 rounded-2xl max-w-md mx-auto p-8">
      <BookOpen class="w-10 h-10 mx-auto mb-2 text-foreground/30" />
      <h2 class="text-base font-bold font-display text-foreground dark:text-white">No Course Selected</h2>
      <p class="text-xs font-mono mt-1">Please select an assigned course from your courses roster to begin taking attendance.</p>
      <button 
        @click="$emit('navigate', '/lecturer-courses')"
        class="mt-4 px-4 py-2 rounded-xl bg-primary dark:bg-dark-secondary text-surface dark:text-primary font-bold text-xs shadow-md hover:opacity-90 transition-all cursor-pointer"
      >
        Go to Assigned Courses
      </button>
    </div>

    <div v-else class="space-y-6">
      <!-- Header with Blueprint Eyebrow -->
      <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-outline/30 dark:border-dark-outline/40">
        <div>
          <button 
            @click="$emit('navigate', '/lecturer-courses')"
            class="inline-flex items-center gap-1 text-xs font-mono text-secondary hover:underline cursor-pointer mb-2"
          >
            <ArrowLeft class="w-3.5 h-3.5" />
            <span>Back to Courses</span>
          </button>
          <div class="flex items-center gap-2 mb-3 text-secondary dark:text-dark-secondary text-xs font-mono uppercase tracking-wider font-semibold">
            <span>LIVE RECORDING // ATTENDANCE ROLL CALL</span>
            <svg class="text-secondary/40 w-20 h-2" viewBox="0 0 140 8" fill="none">
              <path d="M0 4H140" stroke="currentColor" stroke-width="1.5" />
            </svg>
          </div>
          <h1 class="text-2xl sm:text-3xl font-extrabold font-display tracking-tight text-foreground dark:text-white">
            {{ courseCode }} &bull; <span class="text-secondary dark:text-dark-secondary">{{ courseName }}</span>
          </h1>
          <p class="text-xs sm:text-sm font-mono text-foreground/60 dark:text-white/70 mt-1">
            {{ courseSemester }} &bull; {{ courseMode }} Section &bull; {{ todayLabel }}
          </p>
        </div>
      </div>

      <!-- RESULTS VIEW (Shown after submission) -->
      <div v-if="submissionResult" class="relative bg-surface dark:bg-dark-surface border border-outline/50 dark:border-dark-outline/60 rounded-3xl p-6 sm:p-8 shadow-xs space-y-6">
        <div class="absolute top-3 left-3 w-4 h-4 border-t-2 border-l-2 border-secondary/30 pointer-events-none"></div>
        <div class="absolute top-3 right-3 w-4 h-4 border-t-2 border-r-2 border-secondary/30 pointer-events-none"></div>

        <div class="flex items-center gap-3.5 pb-4 border-b border-outline/30 dark:border-dark-outline/40">
          <div class="w-12 h-12 rounded-2xl bg-success/15 text-success flex items-center justify-center shrink-0 shadow-xs">
            <CheckCircle2 class="w-7 h-7" />
          </div>
          <div>
            <h2 class="text-lg font-bold font-display text-foreground dark:text-white">
              Attendance Recorded Successfully
            </h2>
            <p class="text-xs font-mono text-foreground/50">
              Session PIN #{{ submissionResult.pin }} &bull; Logged at {{ submissionResult.submittedAt }}
            </p>
          </div>
        </div>

        <!-- KPI Tiles -->
        <div class="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div class="p-3.5 rounded-2xl bg-success/10 border border-success/25 text-center">
            <span class="block text-2xl font-bold font-display text-success">{{ submissionResult.presentCount }}</span>
            <span class="block text-[10px] font-mono text-success/80 uppercase">Present</span>
          </div>
          <div class="p-3.5 rounded-2xl bg-error/10 border border-error/25 text-center">
            <span class="block text-2xl font-bold font-display text-error">{{ submissionResult.absentCount }}</span>
            <span class="block text-[10px] font-mono text-error/80 uppercase">Absent</span>
          </div>
          <div class="p-3.5 rounded-2xl bg-muted/40 border border-outline/30 text-center">
            <span class="block text-2xl font-bold font-display text-foreground dark:text-white">{{ submissionResult.total }}</span>
            <span class="block text-[10px] font-mono text-foreground/50 uppercase">Total Enrolled</span>
          </div>
          <div class="p-3.5 rounded-2xl bg-primary/10 dark:bg-primary/20 border border-primary/25 text-center">
            <span class="block text-2xl font-bold font-display text-primary dark:text-dark-primary">{{ submissionResult.rate }}%</span>
            <span class="block text-[10px] font-mono text-primary/80 dark:text-dark-primary/80 uppercase">Turnout Rate</span>
          </div>
        </div>

        <!-- Email Dispatch Feedback -->
        <div class="space-y-4 pt-2">
          <!-- Present Group -->
          <div class="space-y-2">
            <div class="flex items-center gap-2 text-xs font-mono font-bold text-success">
              <CheckCircle2 class="w-4 h-4" />
              <span>Present Students — Confirmation Sent</span>
            </div>
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs font-mono">
              <div 
                v-for="s in submissionResult.presentStudents" 
                :key="s.id"
                class="p-2.5 rounded-xl bg-muted/20 dark:bg-dark-muted/20 border border-outline/30 dark:border-dark-outline/40 flex items-center justify-between gap-2"
              >
                <div class="flex items-center gap-2 truncate">
                  <div class="w-6 h-6 rounded-md bg-success/15 text-success font-bold text-[10px] flex items-center justify-center shrink-0">
                    {{ s.name.charAt(0) }}
                  </div>
                  <span class="truncate font-sans font-medium text-foreground dark:text-white">{{ s.name }}</span>
                </div>
                <div class="flex items-center gap-1.5 shrink-0">
                  <span class="px-2 py-0.5 rounded text-[10px] bg-success/10 text-success border border-success/20">
                    {{ otpDispatch[s.id]?.status === 'sent' ? 'Email sent' : otpDispatch[s.id]?.status === 'failed' ? 'Failed' : 'Sending…' }}
                  </span>
                  <button
                    v-if="otpDispatch[s.id]?.status === 'failed'"
                    @click="resendOtpToStudent(s.id)"
                    class="text-[10px] text-success hover:underline font-sans cursor-pointer px-1 py-0.5"
                    title="Retry sending confirmation email"
                  >
                    Retry
                  </button>
                </div>
              </div>
            </div>
          </div>

          <!-- Absent Group -->
          <div v-if="submissionResult.absentStudents.length > 0" class="space-y-2 pt-3 border-t border-outline/20">
            <div class="flex items-center gap-2 text-xs font-mono font-bold text-error">
              <AlertOctagon class="w-4 h-4" />
              <span>Absent Students — Absence Alert Dispatched</span>
            </div>
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs font-mono">
              <div 
                v-for="s in submissionResult.absentStudents" 
                :key="s.id"
                class="p-2.5 rounded-xl bg-muted/20 dark:bg-dark-muted/20 border border-outline/30 dark:border-dark-outline/40 flex items-center justify-between gap-2"
              >
                <div class="flex items-center gap-2 truncate">
                  <div class="w-6 h-6 rounded-md bg-error/15 text-error font-bold text-[10px] flex items-center justify-center shrink-0">
                    {{ s.name.charAt(0) }}
                  </div>
                  <span class="truncate font-sans font-medium text-foreground dark:text-white">{{ s.name }}</span>
                </div>
                <div class="flex items-center gap-1.5 shrink-0">
                  <span class="px-2 py-0.5 rounded text-[10px] bg-error/10 text-error border border-error/20">
                    {{ absenceDispatch[s.id]?.status === 'sent' ? 'Email sent' : absenceDispatch[s.id]?.status === 'failed' ? 'Failed' : 'Sending…' }}
                  </span>
                  <button
                    v-if="absenceDispatch[s.id]?.status === 'failed'"
                    @click="resendAbsenceToStudent(s.id)"
                    class="text-[10px] text-error hover:underline font-sans cursor-pointer px-1 py-0.5"
                    title="Retry sending absence email"
                  >
                    Retry
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div class="flex justify-end pt-4 border-t border-outline/30 dark:border-dark-outline/40">
          <button 
            @click="resetForm"
            class="px-5 py-2.5 rounded-xl bg-primary dark:bg-dark-secondary text-surface dark:text-primary font-bold text-xs shadow-md hover:opacity-90 active:scale-98 transition-all flex items-center gap-2 cursor-pointer"
          >
            <RotateCcw class="w-4 h-4" />
            <span>Mark Another Session</span>
          </button>
        </div>
      </div>

      <!-- MARK ATTENDANCE FORM -->
      <div v-else class="relative bg-surface dark:bg-dark-surface border border-outline/50 dark:border-dark-outline/60 rounded-3xl p-6 sm:p-8 shadow-xs space-y-5">
        <div class="absolute top-3 left-3 w-4 h-4 border-t-2 border-l-2 border-secondary/30 pointer-events-none"></div>
        <div class="absolute top-3 right-3 w-4 h-4 border-t-2 border-r-2 border-secondary/30 pointer-events-none"></div>

        <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-outline/30 dark:border-dark-outline/40">
          <div>
            <h2 class="text-base sm:text-lg font-bold font-display text-foreground dark:text-white">
              Physical Roster Verification
            </h2>
            <p class="text-xs font-mono text-foreground/50 dark:text-white/60">
              Check off students present in the lecture hall. Unchecked students are marked absent.
            </p>
          </div>

          <div class="flex items-center gap-2">
            <span class="text-xs font-mono font-bold text-secondary">
              {{ selectedStudents.length }}/{{ enrolledStudents.length }} Present
            </span>
            <button 
              @click="toggleSelectAll"
              class="px-3 py-1 rounded-lg text-xs font-mono font-semibold bg-muted/60 dark:bg-dark-muted/60 hover:bg-muted dark:hover:bg-dark-muted border border-outline/40 dark:border-dark-outline/50 text-foreground dark:text-white transition-colors cursor-pointer"
            >
              {{ selectedStudents.length === enrolledStudents.length ? 'Deselect All' : 'Select All' }}
            </button>
          </div>
        </div>

        <div v-if="enrolledStudents.length === 0" class="py-12 text-center text-xs font-mono text-foreground/50 dark:text-white/60">
          No students currently enrolled in this section.
        </div>

        <!-- Students Selection Grid -->
        <div v-else class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5 max-h-96 overflow-y-auto pr-1">
          <label
            v-for="student in enrolledStudents"
            :key="student.id"
            class="p-3 rounded-xl border flex items-center gap-3 cursor-pointer transition-all select-none"
            :class="selectedStudents.includes(student.id) 
              ? 'bg-secondary/15 dark:bg-dark-secondary/20 border-secondary shadow-xs ring-1 ring-secondary/30' 
              : 'bg-muted/20 dark:bg-dark-muted/20 border-outline/30 dark:border-dark-outline/40 hover:bg-muted/40'"
          >
            <input 
              type="checkbox" 
              :value="student.id" 
              v-model="selectedStudents" 
              class="rounded text-secondary focus:ring-secondary w-4 h-4 cursor-pointer"
            />
            <div class="w-8 h-8 rounded-lg bg-surface dark:bg-dark-surface border border-outline/40 text-foreground dark:text-white font-bold font-mono text-xs flex items-center justify-center shrink-0">
              {{ student.name.charAt(0) }}
            </div>
            <div class="min-w-0 flex-1 text-xs">
              <p class="font-semibold text-foreground dark:text-white truncate">{{ student.name }}</p>
              <p class="text-[10px] font-mono text-foreground/50 dark:text-white/60">{{ student.studentId }}</p>
            </div>
          </label>
        </div>

        <div v-if="startError" class="p-3 rounded-xl bg-error/10 border border-error/30 text-error text-xs font-mono">
          {{ startError }}
        </div>

        <div class="flex items-center justify-between pt-4 border-t border-outline/30 dark:border-dark-outline/40">
          <p class="text-[11px] font-mono text-foreground/50 dark:text-white/60 hidden sm:block">
            Notifications dispatched automatically upon submission.
          </p>
          <button
            @click="submitAttendance"
            :disabled="enrolledStudents.length === 0 || isStarting"
            class="px-6 py-2.5 rounded-xl bg-primary dark:bg-dark-secondary text-surface dark:text-primary font-bold text-xs sm:text-sm shadow-md hover:opacity-90 active:scale-98 disabled:opacity-40 transition-all flex items-center gap-2 cursor-pointer ml-auto"
          >
            <RefreshCw v-if="isStarting" class="w-4 h-4 animate-spin" />
            <CheckCircle2 v-else class="w-4 h-4" />
            <span>{{ isStarting ? 'Transmitting Roll…' : 'Submit Attendance' }}</span>
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { storeToRefs } from 'pinia';
import { useAuthStore } from '@/stores/authstore';
import { useSessionsStore } from '@/stores/sessions';
import { useAttendancesStore } from '@/stores/attendances';
import { useEnrollmentsStore } from '@/stores/enrollments';
import { useAuditLogsStore } from '@/stores/auditlogs';
import { supabase } from '@/stores/supabase';
import { 
  BookOpen, 
  ArrowLeft, 
  CheckCircle2, 
  AlertOctagon, 
  RotateCcw, 
  RefreshCw 
} from 'lucide-vue-next';

const emit = defineEmits(['navigate']);

const authStore = useAuthStore();
const sessionsStore = useSessionsStore();
const attendancesStore = useAttendancesStore();
const enrollmentsStore = useEnrollmentsStore();
const auditLogsStore = useAuditLogsStore();

const { profile } = storeToRefs(authStore);

const courseId = ref(localStorage.getItem('activeCourseId') || '');
const courseCode = ref(localStorage.getItem('activeCourseCode') || '');
const courseName = ref(localStorage.getItem('activeCourseName') || '');
const courseSemester = ref(localStorage.getItem('activeCourseSemester') || 'Semester 1');
const courseMode = ref(localStorage.getItem('activeCourseMode') || 'Regular');

const enrolledStudents = ref([]);
const selectedStudents = ref([]);
const isStarting = ref(false);
const startError = ref('');

const submissionResult = ref(null);
const otpDispatch = ref({});
const absenceDispatch = ref({});

const OTP_API_BASE = import.meta.env.VITE_OTP_API_URL || '';

const todayLabel = computed(() =>
  new Date().toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })
);

onMounted(async () => {
  if (!courseId.value) return;
  try {
    await enrollmentsStore.fetchEnrollments({ courseId: courseId.value });
    const studentIds = enrollmentsStore.enrollmentsByCourse(courseId.value).map((e) => e.studentId);
    if (studentIds.length > 0) {
      const { data, error } = await supabase
        .from('users')
        .select('id, name, email, id_number')
        .in('id', studentIds);
      if (!error && data) {
        enrolledStudents.value = data.map((u) => ({
          id: u.id,
          name: u.name,
          email: u.email,
          studentId: u.id_number || 'N/A',
        }));
      }
    }
  } catch (e) {
    console.error('Error fetching students:', e);
  }
});

const toggleSelectAll = () => {
  selectedStudents.value = selectedStudents.value.length === enrolledStudents.value.length
    ? []
    : enrolledStudents.value.map(s => s.id);
};

const resetForm = () => {
  submissionResult.value = null;
  selectedStudents.value = [];
  otpDispatch.value = {};
  absenceDispatch.value = {};
  startError.value = '';
};

const submitAttendance = async () => {
  startError.value = '';
  isStarting.value = true;
  try {
    const created = await sessionsStore.createSession({
      courseId: courseId.value,
      lecturerId: profile.value?.id,
      mode: courseMode.value,
      maxStudents: enrolledStudents.value.length,
      isActive: false,
    });

    const selectedIds = new Set(selectedStudents.value);
    const presentStudents = enrolledStudents.value.filter(s => selectedIds.has(s.id));
    const absentStudents  = enrolledStudents.value.filter(s => !selectedIds.has(s.id));

    const attendanceRecords = enrolledStudents.value.map(s => ({
      sessionId: created.id,
      studentId: s.id,
      status: selectedIds.has(s.id) ? 'present' : 'absent',
    }));

    await attendancesStore.markAttendanceBulk(attendanceRecords, { silent: true });

    auditLogsStore.logAction({
      action: 'attendance_recorded',
      details: `Recorded attendance for ${courseCode.value} - ${presentStudents.length} present, ${absentStudents.length} absent`,
      userId: profile.value?.id,
      userRole: profile.value?.role,
      userName: profile.value?.name,
    });

    const total = enrolledStudents.value.length;
    submissionResult.value = {
      presentCount: presentStudents.length,
      absentCount:  absentStudents.length,
      total,
      rate: total > 0 ? Math.round((presentStudents.length / total) * 100) : 0,
      submittedAt: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
      presentStudents,
      absentStudents,
      sessionId: created.id,
      pin: created.pin,
    };

    sendPresentConfirmations(created.id, created.pin, presentStudents);
    sendAbsenceNotifications(created.id, created.pin, absentStudents);
  } catch (e) {
    startError.value = e.message || 'Failed to record attendance.';
  } finally {
    isStarting.value = false;
  }
};

const sendPresentConfirmations = async (sessionId, pin, presentStudents) => {
  const targets = presentStudents.filter(s => !!s.email);
  if (targets.length === 0) return;

  otpDispatch.value = Object.fromEntries(targets.map(s => [s.id, { status: 'sending' }]));
  try {
    const res = await fetch(`${OTP_API_BASE}/api/otp/send-bulk`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        sessionId,
        otp: pin,
        isConfirmation: true,
        courseCode: courseCode.value,
        courseName: courseName.value,
        students: targets.map(s => ({ studentId: s.id, email: s.email, name: s.name })),
      }),
    });
    const data = await res.json().catch(() => ({}));
    const byId = Object.fromEntries((data.results || []).map(r => [r.studentId, r]));
    const next = {};
    for (const s of targets) {
      if (!s.email) { next[s.id] = { status: 'failed' }; continue; }
      const r = byId[s.id];
      next[s.id] = { status: (r?.success || (res.ok && data.sent > 0)) ? 'sent' : 'failed' };
    }
    otpDispatch.value = next;
  } catch {
    const next = {};
    for (const s of targets) next[s.id] = { status: 'failed' };
    otpDispatch.value = next;
  }
};

const sendAbsenceNotifications = async (sessionId, pin, absentStudents) => {
  const targets = absentStudents.filter(s => !!s.email);
  if (targets.length === 0) return;

  absenceDispatch.value = Object.fromEntries(targets.map(s => [s.id, { status: 'sending' }]));
  try {
    // Try dedicated absence endpoint first; if not deployed (404), fallback to send-bulk with isAbsence flag
    let res = await fetch(`${OTP_API_BASE}/api/otp/send-absence-bulk`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        sessionId,
        otp: pin,
        isAbsence: true,
        courseCode: courseCode.value,
        courseName: courseName.value,
        students: targets.map(s => ({ studentId: s.id, email: s.email, name: s.name })),
      }),
    });

    if (!res.ok && res.status === 404) {
      res = await fetch(`${OTP_API_BASE}/api/otp/send-bulk`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sessionId,
          otp: pin,
          isAbsence: true,
          isConfirmation: false,
          courseCode: courseCode.value,
          courseName: courseName.value,
          students: targets.map(s => ({ studentId: s.id, email: s.email, name: s.name })),
        }),
      });
    }

    const data = await res.json().catch(() => ({}));
    const byId = Object.fromEntries((data.results || []).map(r => [r.studentId, r]));
    const next = {};
    for (const s of targets) {
      if (!s.email) { next[s.id] = { status: 'failed' }; continue; }
      const r = byId[s.id];
      next[s.id] = { status: (r?.success || (res.ok && data.sent > 0)) ? 'sent' : 'failed' };
    }
    absenceDispatch.value = next;
  } catch {
    const next = {};
    for (const s of targets) next[s.id] = { status: 'failed' };
    absenceDispatch.value = next;
  }
};

const resendOtpToStudent = async (studentId) => {
  const student = enrolledStudents.value.find((s) => s.id === studentId);
  const sessionId = submissionResult.value?.sessionId;
  const pin = submissionResult.value?.pin;
  if (!student?.email || !sessionId) return;

  otpDispatch.value = { ...otpDispatch.value, [studentId]: { status: 'sending' } };
  try {
    const res = await fetch(`${OTP_API_BASE}/api/otp/resend`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        sessionId,
        studentId,
        email: student.email,
        otp: pin,
        name: student.name,
      }),
    });
    otpDispatch.value = { ...otpDispatch.value, [studentId]: { status: res.ok ? 'sent' : 'failed' } };
  } catch {
    otpDispatch.value = { ...otpDispatch.value, [studentId]: { status: 'failed' } };
  }
};

const resendAbsenceToStudent = async (studentId) => {
  const student = enrolledStudents.value.find((s) => s.id === studentId);
  const sessionId = submissionResult.value?.sessionId;
  const pin = submissionResult.value?.pin;
  if (!student?.email || !sessionId) return;

  absenceDispatch.value = { ...absenceDispatch.value, [studentId]: { status: 'sending' } };
  try {
    let res = await fetch(`${OTP_API_BASE}/api/otp/send-absence-bulk`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        sessionId,
        otp: pin,
        isAbsence: true,
        courseCode: courseCode.value,
        courseName: courseName.value,
        students: [{ studentId: student.id, email: student.email, name: student.name }],
      }),
    });
    if (!res.ok && res.status === 404) {
      res = await fetch(`${OTP_API_BASE}/api/otp/send-bulk`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sessionId,
          otp: pin,
          isAbsence: true,
          isConfirmation: false,
          courseCode: courseCode.value,
          courseName: courseName.value,
          students: [{ studentId: student.id, email: student.email, name: student.name }],
        }),
      });
    }
    const data = await res.json().catch(() => ({}));
    const success = res.ok && (data.sent > 0 || data.results?.[0]?.success || data.results?.[0]?.status === 'sent');
    absenceDispatch.value = { ...absenceDispatch.value, [studentId]: { status: success ? 'sent' : 'failed' } };
  } catch {
    absenceDispatch.value = { ...absenceDispatch.value, [studentId]: { status: 'failed' } };
  }
};
</script>
