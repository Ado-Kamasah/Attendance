<template>
  <div class="space-y-6 w-full max-w-7xl mx-auto">
    <!-- Header with Blueprint Eyebrow -->
    <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-outline/30 dark:border-dark-outline/40">
      <div>
        <div class="dim-eyebrow">
          <span>DELEGATED MONITORING // CLASS REPRESENTATIVE DESK</span>
          <svg class="dim-line w-20 h-2" viewBox="0 0 140 8" fill="none">
            <path d="M0 4H140" stroke="currentColor" stroke-width="1.5" />
          </svg>
        </div>
        <div class="flex items-center gap-3 mt-1">
          <span class="px-2.5 py-0.5 rounded-full text-xs font-bold font-mono bg-secondary text-primary uppercase tracking-wider">
            Class Rep
          </span>
          <h1 class="text-2xl sm:text-3xl font-extrabold font-display tracking-tight text-foreground dark:text-dark-foreground">
            Representative <span class="text-secondary dark:text-dark-secondary">Panel</span>
          </h1>
        </div>
        <p class="text-xs sm:text-sm font-mono text-foreground/60 dark:text-dark-foreground/60 mt-1">
          {{ currentDate }} &bull; Verify faculty lecture delivery, session PINs, and turnout
        </p>
      </div>
    </div>

    <!-- Loading State -->
    <div v-if="isLoading" class="py-16 text-center text-xs font-mono text-foreground/50 flex items-center justify-center gap-2">
      <RefreshCw class="w-4 h-4 animate-spin text-secondary" />
      <span>Loading delegated course assignments…</span>
    </div>

    <!-- No Roles Assigned -->
    <div v-else-if="store.myRoles.length === 0" class="py-16 text-center text-foreground/50 bg-surface dark:bg-dark-surface border border-outline/40 rounded-2xl max-w-md mx-auto p-8">
      <UserCheck class="w-10 h-10 mx-auto mb-2 text-foreground/30" />
      <h3 class="text-base font-bold font-display text-foreground dark:text-dark-foreground">No Class Rep Appointments</h3>
      <p class="text-xs font-mono mt-1">
        You are not assigned as an active class representative for any course cohorts. Contact your department administrator if you were nominated.
      </p>
    </div>

    <template v-else>
      <!-- Course Tabs -->
      <div class="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
        <button
          v-for="role in store.myRoles"
          :key="role.courseId"
          @click="switchCourse(role.courseId)"
          class="px-4 py-2 rounded-xl text-xs font-mono font-medium whitespace-nowrap transition-all border flex items-center gap-2 cursor-pointer"
          :class="activeCourseId === role.courseId 
            ? 'bg-secondary text-primary font-bold border-secondary shadow-xs' 
            : 'bg-surface dark:bg-dark-surface border-outline/40 text-foreground/70 hover:bg-muted/40'"
        >
          <span>{{ role.courseCode }}</span>
          <span class="opacity-70">&bull; {{ role.courseName }}</span>
        </button>
      </div>

      <div v-if="activeCourse" class="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <!-- Left: Mark Lecturer Attendance Form (7 cols) -->
        <div class="lg:col-span-7 space-y-4">
          <div class="relative bg-surface dark:bg-dark-surface border border-outline/50 dark:border-dark-outline/60 rounded-2xl shadow-xs overflow-hidden p-6">
            <div class="corner corner-tl !border-secondary/30 pointer-events-none"></div>
            <div class="corner corner-tr !border-secondary/30 pointer-events-none"></div>

            <div class="pb-3 border-b border-outline/30 dark:border-dark-outline/40">
              <div class="flex items-center gap-2">
                <CheckSquare class="w-4 h-4 text-secondary" />
                <h2 class="text-sm font-bold font-display uppercase tracking-wider text-foreground dark:text-dark-foreground">
                  Record Lecturer Arrival
                </h2>
              </div>
              <p class="text-xs font-mono text-secondary dark:text-dark-secondary mt-0.5">
                {{ activeCourse.courseCode }} &bull; {{ activeCourse.courseName }}
              </p>
            </div>

            <!-- Schedule Chips -->
            <div v-if="activeCourse.schedules?.length" class="flex flex-wrap gap-2 pt-3">
              <div 
                v-for="(sch, i) in activeCourse.schedules" 
                :key="i"
                class="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-muted/40 dark:bg-dark-muted/40 text-[11px] font-mono text-foreground/70 border border-outline/30"
              >
                <Clock class="w-3 h-3 text-foreground/40" />
                <span>{{ sch.day }} {{ sch.startTime }}–{{ sch.endTime }} &bull; {{ sch.venue }}</span>
              </div>
            </div>

            <form @submit.prevent="submitAttendance" class="pt-4 space-y-4 text-xs">
              <!-- Session Code / PIN Auto-Verification -->
              <div class="p-4 rounded-xl bg-muted/20 dark:bg-dark-muted/20 border border-outline/30 dark:border-dark-outline/40 space-y-3">
                <div>
                  <label class="block font-mono font-bold text-foreground dark:text-dark-foreground uppercase tracking-wider text-[11px] mb-1">
                    Lecture Session Code / PIN *
                  </label>
                  <p class="text-[10px] font-mono text-foreground/50">
                    Input 6-digit PIN created by the instructor to synchronize session timestamp.
                  </p>
                </div>

                <div class="flex items-center gap-2">
                  <div class="relative flex-1">
                    <Key class="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-foreground/40" />
                    <input
                      type="text"
                      id="att-session-code"
                      v-model="form.sessionCode"
                      placeholder="e.g. 482913"
                      @input="onSessionCodeInput"
                      @keyup.enter.prevent="handleVerifySession"
                      class="w-full pl-9 pr-8 py-2 text-xs sm:text-sm bg-surface dark:bg-dark-surface border border-outline/40 dark:border-dark-outline/40 focus:border-secondary rounded-xl font-mono text-foreground dark:text-dark-foreground outline-hidden"
                    />
                    <button 
                      v-if="form.sessionCode" 
                      type="button" 
                      @click="clearSessionCode" 
                      class="absolute right-2.5 top-1/2 -translate-y-1/2 text-foreground/40 hover:text-foreground cursor-pointer"
                    >
                      &times;
                    </button>
                  </div>

                  <button
                    type="button"
                    :disabled="isVerifying || !form.sessionCode"
                    @click="handleVerifySession"
                    id="btn-verify-session"
                    class="px-4 py-2 rounded-xl bg-secondary text-primary font-bold text-xs shadow-xs hover:opacity-90 disabled:opacity-40 transition-opacity flex items-center gap-1.5 cursor-pointer shrink-0"
                  >
                    <RefreshCw v-if="isVerifying" class="w-3.5 h-3.5 animate-spin" />
                    <ShieldCheck v-else class="w-3.5 h-3.5" />
                    <span>Verify PIN</span>
                  </button>
                </div>

                <!-- Recent Sessions Quick Selection -->
                <div v-if="courseSessions.length > 0" class="pt-2 border-t border-outline/20">
                  <span class="block text-[10px] font-mono text-foreground/50 mb-1.5">Recent sessions for this module:</span>
                  <div class="flex flex-wrap gap-1.5">
                    <button
                      v-for="s in courseSessions"
                      :key="s.id || s.pin"
                      type="button"
                      @click="selectRecentSession(s)"
                      class="px-2 py-1 rounded-lg text-[10px] font-mono border transition-all cursor-pointer"
                      :class="form.sessionCode === s.pin ? 'bg-secondary text-primary font-bold border-secondary' : 'bg-surface border-outline/40 text-foreground/70 hover:bg-muted/40'"
                    >
                      #{{ s.pin }} &bull; {{ s.date }}
                    </button>
                  </div>
                </div>

                <!-- Verified Session Banner -->
                <div v-if="verifiedSession" class="p-3 rounded-xl bg-success/15 border border-success/30 text-success flex items-center justify-between gap-3 text-xs">
                  <div class="flex items-center gap-2">
                    <CheckCircle2 class="w-4 h-4 shrink-0" />
                    <div>
                      <p class="font-bold font-mono">Session #{{ verifiedSession.pin }} Verified</p>
                      <p class="text-[10px] opacity-80">{{ verifiedSession.date }} &bull; {{ verifiedSession.time }}</p>
                    </div>
                  </div>
                  <span class="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-success/20">Synced</span>
                </div>

                <p v-if="sessionError" class="text-xs font-mono text-error">{{ sessionError }}</p>
              </div>

              <!-- Date & Time Row -->
              <div class="grid grid-cols-2 gap-3">
                <div>
                  <label class="block font-mono text-[11px] text-foreground/70 mb-1" for="att-date">
                    Session Date *
                  </label>
                  <input type="date" id="att-date" v-model="form.date" :max="todayStr" required class="w-full px-3 py-2 text-xs bg-muted/30 dark:bg-dark-muted/30 border border-outline/40 rounded-xl font-mono text-foreground dark:text-dark-foreground outline-hidden focus:border-secondary" />
                </div>
                <div>
                  <label class="block font-mono text-[11px] text-foreground/70 mb-1" for="att-time">
                    Arrival Time *
                  </label>
                  <input type="time" id="att-time" v-model="form.time" required class="w-full px-3 py-2 text-xs bg-muted/30 dark:bg-dark-muted/30 border border-outline/40 rounded-xl font-mono text-foreground dark:text-dark-foreground outline-hidden focus:border-secondary" />
                </div>
              </div>

              <!-- Status Radio Group -->
              <div>
                <label class="block font-mono text-[11px] text-foreground/70 mb-1.5">
                  Instructor Presence *
                </label>
                <div class="grid grid-cols-3 gap-2.5">
                  <label
                    v-for="opt in statusOptions"
                    :key="opt.value"
                    class="p-2.5 rounded-xl border text-center font-mono text-xs font-bold cursor-pointer transition-all select-none"
                    :class="form.status === opt.value 
                      ? (opt.value === 'present' ? 'bg-success text-white border-success' : opt.value === 'late' ? 'bg-amber-500 text-white border-amber-500' : 'bg-error text-white border-error') 
                      : 'bg-muted/20 border-outline/30 text-foreground/70 hover:bg-muted/40'"
                  >
                    <input type="radio" :value="opt.value" v-model="form.status" class="sr-only" />
                    {{ opt.label }}
                  </label>
                </div>
              </div>

              <!-- Notes -->
              <div>
                <label class="block font-mono text-[11px] text-foreground/70 mb-1" for="att-notes">
                  Observation Remarks (Optional)
                </label>
                <textarea 
                  id="att-notes" 
                  v-model="form.notes" 
                  rows="2" 
                  placeholder="Record lecture topics covered or reason for instructor tardiness/absence…" 
                  class="w-full px-3 py-2 text-xs bg-muted/30 dark:bg-dark-muted/30 border border-outline/40 rounded-xl font-mono text-foreground dark:text-dark-foreground outline-hidden focus:border-secondary"
                ></textarea>
              </div>

              <div v-if="formError" class="p-2.5 rounded-lg bg-error/10 border border-error/20 text-error text-xs font-mono">
                {{ formError }}
              </div>
              <div v-if="formSuccess" class="p-2.5 rounded-lg bg-success/10 border border-success/20 text-success text-xs font-mono">
                {{ formSuccess }}
              </div>

              <div class="pt-2">
                <button 
                  type="submit" 
                  :disabled="store.isLoading || !form.status" 
                  id="btn-save-attendance"
                  class="w-full py-2.5 rounded-xl bg-primary dark:bg-dark-secondary text-surface dark:text-primary font-bold text-xs sm:text-sm shadow-md hover:opacity-90 active:scale-98 disabled:opacity-40 transition-all flex items-center justify-center gap-2 cursor-pointer"
                >
                  <RefreshCw v-if="store.isLoading" class="w-4 h-4 animate-spin" />
                  <Save v-else class="w-4 h-4" />
                  <span>{{ store.isLoading ? 'Recording…' : 'Log Lecturer Attendance' }}</span>
                </button>
              </div>
            </form>
          </div>
        </div>

        <!-- Right: Course Attendance History (5 cols) -->
        <div class="lg:col-span-5 space-y-4">
          <div class="relative bg-surface dark:bg-dark-surface border border-outline/50 dark:border-dark-outline/60 rounded-2xl shadow-xs overflow-hidden p-6">
            <div class="corner corner-tl !border-secondary/30 pointer-events-none"></div>
            <div class="corner corner-tr !border-secondary/30 pointer-events-none"></div>

            <div class="flex items-center gap-2 pb-3 border-b border-outline/30 dark:border-dark-outline/40">
              <History class="w-4 h-4 text-secondary" />
              <h2 class="text-sm font-bold font-display uppercase tracking-wider text-foreground dark:text-dark-foreground">
                Attendance Logbook
              </h2>
            </div>

            <!-- Summary Pills -->
            <div v-if="history.length" class="grid grid-cols-4 gap-2 pt-3">
              <div class="p-2 rounded-xl bg-success/10 border border-success/20 text-center">
                <span class="block text-xs font-bold font-mono text-success">{{ countStatus('present') }}</span>
                <span class="block text-[9px] font-mono text-success/80 uppercase">Present</span>
              </div>
              <div class="p-2 rounded-xl bg-amber-500/10 border border-amber-500/20 text-center">
                <span class="block text-xs font-bold font-mono text-amber-500">{{ countStatus('late') }}</span>
                <span class="block text-[9px] font-mono text-amber-500/80 uppercase">Late</span>
              </div>
              <div class="p-2 rounded-xl bg-error/10 border border-error/20 text-center">
                <span class="block text-xs font-bold font-mono text-error">{{ countStatus('absent') }}</span>
                <span class="block text-[9px] font-mono text-error/80 uppercase">Absent</span>
              </div>
              <div class="p-2 rounded-xl bg-muted/40 border border-outline/30 text-center">
                <span class="block text-xs font-bold font-mono text-foreground">{{ history.length }}</span>
                <span class="block text-[9px] font-mono text-foreground/60 uppercase">Total</span>
              </div>
            </div>

            <!-- History Entries -->
            <div class="pt-4">
              <div v-if="histLoading" class="py-12 text-center text-xs font-mono text-foreground/50 flex items-center justify-center gap-2">
                <RefreshCw class="w-4 h-4 animate-spin text-secondary" />
                <span>Loading logbook…</span>
              </div>

              <div v-else-if="history.length === 0" class="py-12 text-center text-xs font-mono text-foreground/50">
                No past logs recorded for this module.
              </div>

              <div v-else class="space-y-2.5 max-h-96 overflow-y-auto pr-1">
                <div 
                  v-for="rec in history" 
                  :key="rec.id"
                  class="p-3 rounded-xl bg-muted/20 dark:bg-dark-muted/20 border border-outline/30 dark:border-dark-outline/40 space-y-1.5 text-xs"
                >
                  <div class="flex items-center justify-between">
                    <span class="font-bold font-mono text-foreground dark:text-dark-foreground">
                      {{ formatDate(rec.date) }} &bull; {{ formatTime(rec.time) }}
                    </span>
                    <span 
                      class="px-2 py-0.2 rounded text-[10px] font-mono font-bold uppercase"
                      :class="rec.status === 'present' ? 'bg-success/15 text-success border border-success/30' : rec.status === 'late' ? 'bg-amber-500/15 text-amber-500 border border-amber-500/30' : 'bg-error/15 text-error border border-error/30'"
                    >
                      {{ rec.status }}
                    </span>
                  </div>

                  <p v-if="rec.notes" class="text-[11px] text-foreground/70 dark:text-dark-foreground/70 italic">
                    "{{ rec.notes }}"
                  </p>

                  <p class="text-[10px] font-mono text-foreground/45 pt-1 border-t border-outline/20">
                    Logged by {{ rec.markedBy }}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </template>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { useClassRepStore } from '@/stores/classrep.js';
import { 
  UserCheck, 
  CheckSquare, 
  Clock, 
  Key, 
  RefreshCw, 
  ShieldCheck, 
  CheckCircle2, 
  Save, 
  History 
} from 'lucide-vue-next';

const store = useClassRepStore();
const isLoading = ref(true);
const histLoading = ref(false);
const activeCourseId = ref('');
const formError = ref('');
const formSuccess = ref('');

const todayStr = new Date().toISOString().split('T')[0];
const now = new Date();
const currentDate = now.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });

const form = ref({
  sessionCode: '',
  date: todayStr,
  time: `${String(now.getHours()).padStart(2,'0')}:${String(now.getMinutes()).padStart(2,'0')}`,
  status: '',
  notes: '',
});

const isVerifying = ref(false);
const verifiedSession = ref(null);
const sessionError = ref('');
const courseSessions = ref([]);

const statusOptions = [
  { value: 'present', label: 'Present' },
  { value: 'late',    label: 'Late' },
  { value: 'absent',  label: 'Absent' },
];

onMounted(async () => {
  await store.fetchMyRoles();
  isLoading.value = false;
  if (store.myRoles.length > 0) {
    await switchCourse(store.myRoles[0].courseId);
  }
});

const activeCourse = computed(() => store.myRoles.find(r => r.courseId === activeCourseId.value));
const history = computed(() => store.attendanceHistory[activeCourseId.value] || []);

async function switchCourse(courseId) {
  activeCourseId.value = courseId;
  formError.value = '';
  formSuccess.value = '';
  sessionError.value = '';
  verifiedSession.value = null;
  form.value.sessionCode = '';
  histLoading.value = true;

  await Promise.allSettled([
    store.fetchAttendanceHistory(courseId),
    loadCourseSessions(courseId)
  ]);

  histLoading.value = false;
}

async function loadCourseSessions(courseId) {
  try {
    courseSessions.value = await store.fetchCourseSessions(courseId);
  } catch (err) {
    console.warn('Error loading course sessions:', err);
    courseSessions.value = [];
  }
}

function onSessionCodeInput() {
  sessionError.value = '';
  if (verifiedSession.value && verifiedSession.value.pin !== form.value.sessionCode) {
    verifiedSession.value = null;
  }
}

async function handleVerifySession() {
  if (!form.value.sessionCode || !form.value.sessionCode.trim()) {
    sessionError.value = 'Please enter a session code to verify.';
    return;
  }
  sessionError.value = '';
  isVerifying.value = true;

  try {
    const session = await store.verifySessionCode(form.value.sessionCode, activeCourseId.value);
    verifiedSession.value = session;
    if (session.date) form.value.date = session.date;
    if (session.time) form.value.time = session.time;
  } catch (err) {
    verifiedSession.value = null;
    sessionError.value = err.message || 'Could not verify session code for this course.';
  } finally {
    isVerifying.value = false;
  }
}

function selectRecentSession(s) {
  form.value.sessionCode = s.pin;
  verifiedSession.value = s;
  sessionError.value = '';
  if (s.date) form.value.date = s.date;
  if (s.time) form.value.time = s.time;
}

function clearSessionCode() {
  form.value.sessionCode = '';
  verifiedSession.value = null;
  sessionError.value = '';
}

function countStatus(st) {
  return history.value.filter(r => r.status === st).length;
}

function formatDate(d) {
  if (!d) return '';
  return new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

function formatTime(t) {
  if (!t) return '';
  return t.slice(0, 5);
}

async function submitAttendance() {
  formError.value = '';
  formSuccess.value = '';

  if (!form.value.status) {
    formError.value = 'Please select the lecturer status (Present, Late, or Absent).';
    return;
  }

  try {
    await store.recordAttendance({
      courseId: activeCourseId.value,
      date: form.value.date,
      time: form.value.time,
      status: form.value.status,
      notes: form.value.notes,
      sessionCode: form.value.sessionCode || undefined,
    });

    formSuccess.value = 'Lecturer attendance recorded successfully!';
    form.value.notes = '';
    form.value.status = '';
    form.value.sessionCode = '';
    verifiedSession.value = null;
  } catch (err) {
    formError.value = err.message || 'Failed to record attendance.';
  }
}
</script>
