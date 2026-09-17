<template>
  <div class="space-y-6 w-full max-w-7xl mx-auto">
    <!-- Header with Blueprint Eyebrow -->
    <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-outline/30 dark:border-dark-outline/40">
      <div>
        <div class="dim-eyebrow">
          <span>ENROLLED CURRICULUM // ATTENDANCE RECORDS</span>
          <svg class="dim-line w-20 h-2" viewBox="0 0 140 8" fill="none">
            <path d="M0 4H140" stroke="currentColor" stroke-width="1.5" />
          </svg>
        </div>
        <h1 class="text-2xl sm:text-3xl font-extrabold font-display tracking-tight text-foreground dark:text-dark-foreground">
          My <span class="text-secondary dark:text-dark-secondary">Enrolled Courses</span>
        </h1>
        <p class="text-xs sm:text-sm font-mono text-foreground/60 dark:text-dark-foreground/60 mt-1">
          Active semester courses, lecture venues, and individual attendance records
        </p>
      </div>

      <div class="flex items-center gap-3">
        <button 
          @click="$emit('navigate', '/registration')"
          class="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-primary dark:bg-dark-secondary text-surface dark:text-primary font-semibold text-xs sm:text-sm shadow-md hover:opacity-90 active:scale-98 transition-all cursor-pointer"
        >
          <Plus class="w-4 h-4" />
          <span>Add Courses</span>
        </button>
      </div>
    </div>

    <!-- Empty State -->
    <div v-if="myCourses.length === 0" class="py-16 text-center text-foreground/50 dark:text-dark-foreground/50 bg-surface dark:bg-dark-surface border border-outline/40 dark:border-dark-outline/40 rounded-2xl p-8 max-w-md mx-auto">
      <div class="w-12 h-12 rounded-2xl bg-secondary/15 text-secondary mx-auto mb-3 flex items-center justify-center">
        <BookOpen class="w-6 h-6" />
      </div>
      <h3 class="text-base font-bold font-display text-foreground dark:text-dark-foreground">No Enrolled Courses</h3>
      <p class="text-xs font-mono mt-1">You haven't registered for any modules for the active semester yet.</p>
      <button 
        @click="$emit('navigate', '/registration')"
        class="mt-4 px-4 py-2 rounded-xl bg-secondary text-primary font-bold text-xs shadow-md hover:opacity-90 transition-all cursor-pointer"
      >
        Browse Course Catalog
      </button>
    </div>

    <!-- Courses Grid -->
    <div v-else class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
      <div 
        v-for="course in myCourses" 
        :key="course.id"
        class="blueprint-card relative bg-surface dark:bg-dark-surface border border-outline/50 dark:border-dark-outline/60 rounded-2xl shadow-xs overflow-hidden p-5 flex flex-col justify-between group"
      >
        <div>
          <!-- Top Card Meta -->
          <div class="flex items-center justify-between gap-2 pb-3 border-b border-outline/30 dark:border-dark-outline/40">
            <span class="text-xs font-bold font-mono text-secondary dark:text-dark-secondary">
              {{ course.code }}
            </span>
            <div class="flex items-center gap-2">
              <span class="px-2 py-0.5 rounded text-[10px] font-bold font-mono bg-primary/10 dark:bg-primary/20 text-primary dark:text-dark-primary border border-primary/20">
                {{ course.credits }} Credits
              </span>
              <button
                type="button"
                title="Unenroll from this course"
                :disabled="unenrollingId === course.enrollmentId"
                @click="unenrollCourse(course)"
                class="p-1 rounded-lg text-foreground/40 hover:text-error hover:bg-error/10 transition-colors disabled:opacity-40 cursor-pointer"
              >
                <RefreshCw v-if="unenrollingId === course.enrollmentId" class="w-3.5 h-3.5 animate-spin" />
                <Trash2 v-else class="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          <!-- Course Title -->
          <h3 class="text-sm sm:text-base font-bold text-foreground dark:text-dark-foreground mt-3 line-clamp-2">
            {{ course.name }}
          </h3>

          <!-- Instructor Info -->
          <div class="flex items-center gap-2.5 mt-3 text-xs">
            <div 
              class="w-7 h-7 rounded-lg flex items-center justify-center font-bold font-mono text-[10px] text-white shrink-0 shadow-2xs"
              :style="{ backgroundColor: course.color }"
            >
              {{ getInitials(course.lecturer) }}
            </div>
            <span class="font-medium text-foreground/80 dark:text-dark-foreground/80 truncate">
              {{ course.lecturer }}
            </span>
          </div>

          <!-- Schedule & Venue -->
          <div class="mt-3.5 space-y-1.5 text-xs font-mono text-foreground/60 dark:text-dark-foreground/60">
            <div class="flex items-center gap-2">
              <Clock class="w-3.5 h-3.5 text-foreground/40 shrink-0" />
              <span class="truncate">{{ course.schedule }}</span>
            </div>
            <div class="flex items-center gap-2">
              <MapPin class="w-3.5 h-3.5 text-foreground/40 shrink-0" />
              <span class="truncate">{{ course.venue }} &bull; {{ course.mode }}</span>
            </div>
          </div>
        </div>

        <!-- Attendance Tracker & Actions -->
        <div class="mt-5 pt-4 border-t border-outline/30 dark:border-dark-outline/40 space-y-3">
          <div>
            <div class="flex items-center justify-between text-xs font-mono mb-1.5">
              <span class="text-foreground/60 dark:text-dark-foreground/60">Turnout Record</span>
              <span 
                class="font-bold"
                :class="course.attendance >= 75 ? 'text-success' : 'text-error'"
              >
                {{ course.attendance }}%
              </span>
            </div>
            <div class="h-2 w-full bg-muted/70 dark:bg-dark-muted/70 rounded-full overflow-hidden">
              <div 
                class="h-full rounded-full transition-all duration-500" 
                :class="course.attendance >= 75 ? 'bg-success' : 'bg-error'"
                :style="{ width: `${course.attendance}%` }"
              ></div>
            </div>
          </div>

          <button 
            @click="goToAttendance(course)"
            class="w-full py-2 rounded-xl text-surface font-semibold text-xs shadow-xs hover:opacity-90 active:scale-98 transition-all flex items-center justify-center gap-1.5 cursor-pointer"
            :style="{ backgroundColor: course.color }"
          >
            <CheckCircle2 class="w-3.5 h-3.5" />
            <span>Mark Attendance</span>
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue';
import { storeToRefs } from 'pinia';
import { useAuthStore } from '@/stores/authstore';
import { useCoursesStore } from '@/stores/courses';
import { useSchedulesStore } from '@/stores/schedules';
import { useEnrollmentsStore } from '@/stores/enrollments';
import { useSessionsStore } from '@/stores/sessions';
import { useAttendancesStore } from '@/stores/attendances';
import { useAuditLogsStore } from '@/stores/auditlogs';
import { 
  BookOpen, 
  Plus, 
  Trash2, 
  Clock, 
  MapPin, 
  CheckCircle2, 
  RefreshCw 
} from 'lucide-vue-next';

const emit = defineEmits(['navigate']);

const authStore = useAuthStore();
const coursesStore = useCoursesStore();
const schedulesStore = useSchedulesStore();
const enrollmentsStore = useEnrollmentsStore();
const sessionsStore = useSessionsStore();
const attendancesStore = useAttendancesStore();
const auditLogsStore = useAuditLogsStore();

const { profile } = storeToRefs(authStore);
const { courses } = storeToRefs(coursesStore);
const { schedules } = storeToRefs(schedulesStore);
const { enrollments } = storeToRefs(enrollmentsStore);
const { sessions } = storeToRefs(sessionsStore);
const { attendances } = storeToRefs(attendancesStore);

const palette = ['#031c45', '#10b981', '#bc9333', '#ec4899', '#0ea5e9', '#6366f1'];

onMounted(async () => {
  try {
    await Promise.all([
      coursesStore.fetchCourses(),
      schedulesStore.fetchSchedules(),
      enrollmentsStore.fetchEnrollments({ studentId: profile.value?.id }),
      sessionsStore.fetchSessions(),
      attendancesStore.fetchAttendances({ studentId: profile.value?.id }),
    ]);

    coursesStore.subscribeToCourses();
    schedulesStore.subscribeToSchedules();
    enrollmentsStore.subscribeToEnrollments();
    sessionsStore.subscribeToSessions();
    attendancesStore.subscribeToAttendances();
  } catch (error) {
    console.error('Error fetching enrolled courses:', error);
  }
});

onUnmounted(() => {
  coursesStore.unsubscribeFromCourses();
  schedulesStore.unsubscribeFromSchedules();
  enrollmentsStore.unsubscribeFromEnrollments();
  sessionsStore.unsubscribeFromSessions();
  attendancesStore.unsubscribeFromAttendances();
});

function scheduleForCourse(courseId, mode) {
  return schedules.value.find((s) => s.courseId === courseId && s.mode === mode) ?? null;
}

function attendanceForCourse(courseId) {
  const sessionIds = new Set(
    sessions.value.filter((s) => s.courseId === courseId).map((s) => s.id)
  );
  if (sessionIds.size === 0) return 0;

  const relevant = attendances.value.filter(
    (a) => a.studentId === profile.value?.id && sessionIds.has(a.sessionId)
  );
  if (relevant.length === 0) return 0;

  const present = relevant.filter((a) => a.status === 'present').length;
  return Math.round((present / sessionIds.size) * 100);
}

const myCourses = computed(() => {
  return enrollments.value
    .filter((e) => e.studentId === profile.value?.id)
    .map((e, index) => {
      const course = coursesStore.getCourseById(e.courseId);
      const schedule = scheduleForCourse(e.courseId, profile.value?.mode);

      return {
        id: e.courseId,
        enrollmentId: e.id,
        code: course?.code ?? 'Unknown',
        name: course?.name ?? 'Unknown Course',
        credits: course?.credits ?? 0,
        lecturer: schedule?.lecturer ?? 'Unassigned Faculty',
        schedule: schedule
          ? `${schedule.day} • ${schedule.startTime} - ${schedule.endTime}`
          : 'Schedule pending',
        venue: schedule?.venue ?? 'Venue pending',
        mode: schedule?.mode ?? 'Mode pending',
        attendance: attendanceForCourse(e.courseId),
        color: palette[index % palette.length],
      };
    })
    .filter((c) => c.mode === profile.value?.mode);
});

const getInitials = (name) => {
  if (!name) return 'UN';
  return name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();
};

const unenrollingId = ref(null);

const unenrollCourse = async (course) => {
  if (!course.enrollmentId || unenrollingId.value) return;

  const confirmed = window.confirm(
    `Unenroll from ${course.code} — ${course.name}? This can't be undone.`
  );
  if (!confirmed) return;

  unenrollingId.value = course.enrollmentId;
  try {
    await enrollmentsStore.deleteEnrollment(course.enrollmentId);

    auditLogsStore.logAction({
      action: 'course_unenrolled',
      details: `Unenrolled from ${course.code} — ${course.name}`,
      userId: profile.value?.id,
      userRole: profile.value?.role,
      userName: profile.value?.name,
    });
  } catch (e) {
    console.error('Failed to unenroll:', e);
  } finally {
    unenrollingId.value = null;
  }
};

const goToAttendance = (course) => {
  auditLogsStore.logAction({
    action: 'attendance_check_initiated',
    details: `Opened attendance check-in for ${course.code} — ${course.name}`,
    userId: profile.value?.id,
    userRole: profile.value?.role,
    userName: profile.value?.name,
  });
  emit('navigate', '/attendance');
};
</script>