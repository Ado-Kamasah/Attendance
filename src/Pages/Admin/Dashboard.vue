<template>
  <div class="flex flex-col gap-8 w-full">
    <!-- Header -->
    <div class="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
      <h1 class="m-0 text-[1.75rem] sm:text-[1.75rem] font-bold text-slate-900 tracking-tight">Dashboard Overview</h1>
      <div class="flex items-center gap-2 bg-white px-4 py-2 rounded-full text-[0.875rem] font-medium text-slate-500 shadow-sm border border-slate-200 self-start sm:self-auto">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="w-4 h-4 text-indigo-500">
          <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
          <line x1="16" y1="2" x2="16" y2="6"></line>
          <line x1="8" y1="2" x2="8" y2="6"></line>
          <line x1="3" y1="10" x2="21" y2="10"></line>
        </svg>
        <span>{{ currentDate }}</span>
      </div>
    </div>

    <!-- Metrics Grid -->
    <div class="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-6">
      <div
        v-for="metric in metrics"
        :key="metric.title"
        class="bg-white rounded-2xl p-6 flex items-start gap-4 shadow-sm border border-slate-200/80 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md"
      >
        <div
          class="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0"
          :style="{ backgroundColor: metric.bgColor, color: metric.color }"
        >
          <div class="w-6 h-6 flex [&_svg]:w-full [&_svg]:h-full" v-html="metric.icon"></div>
        </div>
        <div class="flex-1">
          <p class="m-0 mb-2 text-[0.875rem] text-slate-500 font-medium">{{ metric.title }}</p>
          <h3 class="m-0 mb-2 text-[1.75rem] font-bold text-slate-900 tracking-tight">{{ metric.value }}</h3>
          <p
            class="flex items-center gap-1 m-0 text-[0.75rem] font-semibold"
            :class="metric.trend > 0 ? 'text-emerald-500' : 'text-red-500'"
          >
            <svg v-if="metric.trend > 0" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="w-3.5 h-3.5"><polyline points="23 6 13.5 15.5 8.5 10.5 1 18"></polyline><polyline points="17 6 23 6 23 12"></polyline></svg>
            <svg v-else viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="w-3.5 h-3.5"><polyline points="23 18 13.5 8.5 8.5 13.5 1 6"></polyline><polyline points="17 18 23 18 23 12"></polyline></svg>
            <span class="text-slate-400 font-medium ml-1">{{ Math.abs(metric.trend) }}% from last week</span>
          </p>
        </div>
      </div>
    </div>

    <!-- Content Split -->
    <div class="grid grid-cols-1 lg:grid-cols-[2fr_1fr] gap-6">
      <!-- Schedule Panel -->
      <div class="bg-white rounded-2xl p-6 shadow-sm border border-slate-200/80">
        <div class="flex justify-between items-center mb-6">
          <h2 class="m-0 text-[1.25rem] font-semibold text-slate-900 tracking-tight">Today's Schedule</h2>
          <button
            class="bg-transparent border-none text-indigo-500 text-[0.875rem] font-semibold cursor-pointer p-0 transition-colors duration-200 hover:text-indigo-700 hover:underline"
            @click="$emit('navigate', '/schedule')"
          >View All</button>
        </div>
        <div class="flex flex-col gap-3">
          <div
            v-for="course in todaySchedule"
            :key="course.id"
            class="flex items-center gap-6 p-4 rounded-xl bg-slate-50 border border-transparent transition-all duration-200 hover:bg-white hover:border-slate-200 hover:shadow-sm max-sm:flex-col max-sm:items-stretch max-sm:gap-3 max-sm:p-5"
          >
            <div class="flex flex-col min-w-[80px] items-end border-r-2 border-slate-200 pr-6 max-sm:flex-row max-sm:items-center max-sm:gap-2 max-sm:border-r-0 max-sm:border-b-2 max-sm:pr-0 max-sm:pb-3">
              <span class="font-semibold text-slate-900 text-[0.95rem]">{{ course.startTime }}</span>
              <span class="text-[0.8rem] text-slate-400 mt-1 max-sm:mt-0">{{ course.endTime }}</span>
            </div>
            <div class="flex-1">
              <h4 class="m-0 mb-1.5 text-base font-semibold text-slate-800">{{ course.name }}</h4>
              <p class="m-0 text-[0.85rem] text-slate-500">{{ course.lecturer }} • {{ course.room }}</p>
            </div>
            <div
              class="px-3 py-1.5 rounded-full text-[0.75rem] font-semibold uppercase tracking-[0.05em] max-sm:self-start max-sm:mt-2"
              :class="{
                'bg-emerald-100 text-emerald-800': course.status === 'completed',
                'bg-indigo-100 text-indigo-800 relative before:content-[\'\'] before:inline-block before:w-1.5 before:h-1.5 before:bg-indigo-600 before:rounded-full before:mr-1.5 before:mb-px before:animate-pulse': course.status === 'ongoing',
                'bg-slate-100 text-slate-500': course.status === 'upcoming'
              }"
            >{{ course.statusText }}</div>
          </div>
          <div v-if="todaySchedule.length === 0" class="py-8 text-center text-slate-400 text-[0.9rem]">
            You have no courses scheduled for today.
          </div>
        </div>
      </div>

      <!-- Side Panel -->
      <div class="flex flex-col gap-6">
        <!-- Audit Logs -->
        <div class="bg-white rounded-2xl p-6 shadow-sm border border-slate-200/80 flex flex-col">
          <div class="flex justify-between items-center mb-6">
            <h2 class="m-0 text-[1.25rem] font-semibold text-slate-900 tracking-tight">Live Audit Logs</h2>
          </div>
          <div class="flex flex-col gap-4 mb-4">
            <div
              v-for="log in systemAuditLogs.slice(0, 5)"
              :key="log.id"
              class="bg-slate-50 p-4 rounded-[10px] border-l-[3px] border-indigo-500"
            >
              <div class="flex justify-between items-center mb-1">
                <span class="font-bold text-[0.9rem] text-slate-900">{{ log.action }}</span>
                <span class="text-[0.75rem] text-slate-400">{{ log.timestamp }}</span>
              </div>
              <p class="m-0 mb-2 text-[0.85rem] text-slate-600 leading-snug">{{ log.details }}</p>
              <div class="flex items-center gap-2">
                <span
                  class="text-[0.65rem] uppercase font-bold px-1.5 py-0.5 rounded"
                  :class="{
                    'bg-slate-100 text-slate-500': log.role.toLowerCase() === 'system',
                    'bg-indigo-100 text-indigo-700': log.role.toLowerCase() === 'lecturer',
                    'bg-emerald-100 text-emerald-700': log.role.toLowerCase() === 'student',
                    'bg-slate-100 text-slate-500': !['system','lecturer','student'].includes(log.role.toLowerCase()),
                  }"
                >{{ log.role }}</span>
                <span class="text-[0.8rem] text-slate-500 font-medium">{{ log.user }}</span>
              </div>
            </div>
            <div v-if="systemAuditLogs.length === 0" class="text-slate-400 text-[0.85rem] text-center py-4">No audit logs available.</div>
          </div>
          <button
            class="w-full py-3 px-4 bg-slate-50 border-none rounded-lg text-indigo-500 text-[0.875rem] font-semibold cursor-pointer transition-colors duration-200 mt-auto hover:bg-slate-100 hover:no-underline"
            @click="alert('Full Audit Trail functionality coming soon')"
          >View Full Audit Trail</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue';
import { storeToRefs } from 'pinia';
import { useCoursesStore } from '@/stores/courses';
import { useSchedulesStore } from '@/stores/schedules';
import { useAuditLogsStore } from '@/stores/auditlogs';
import { useEnrollmentsStore } from '@/stores/enrollments';
import { useAttendancesStore } from '@/stores/attendances';

const coursesStore = useCoursesStore();
const schedulesStore = useSchedulesStore();
const auditLogsStore = useAuditLogsStore();
const enrollmentsStore = useEnrollmentsStore();
const attendancesStore = useAttendancesStore();

const { courses } = storeToRefs(coursesStore);
const { schedules } = storeToRefs(schedulesStore);
const { logs } = storeToRefs(auditLogsStore);
const { enrollments } = storeToRefs(enrollmentsStore);
const { attendances } = storeToRefs(attendancesStore);

onMounted(async () => {
  try {
    await Promise.all([
      coursesStore.fetchCourses(),
      schedulesStore.fetchSchedules(),
      auditLogsStore.fetchLogs(),
      enrollmentsStore.fetchEnrollments(),
      attendancesStore.fetchAttendances(),
    ]);

    coursesStore.subscribeToCourses();
    schedulesStore.subscribeToSchedules();
    auditLogsStore.subscribeToLogs();
    enrollmentsStore.subscribeToEnrollments();
    attendancesStore.subscribeToAttendances();
  } catch (error) {
    console.error('Error fetching dashboard data:', error);
  }
});

onUnmounted(() => {
  coursesStore.unsubscribeFromCourses();
  schedulesStore.unsubscribeFromSchedules();
  auditLogsStore.unsubscribeFromLogs();
  enrollmentsStore.unsubscribeFromEnrollments();
  attendancesStore.unsubscribeFromAttendances();
});

const currentDate = new Date().toLocaleDateString('en-US', {
  weekday: 'long',
  year: 'numeric',
  month: 'long',
  day: 'numeric'
});

const currentDayName = new Date().toLocaleDateString('en-US', { weekday: 'long' });

const totalStudents = computed(() => {
  const uniqueStudentIds = new Set(enrollments.value.map((e) => e.studentId));
  return uniqueStudentIds.size;
});

const averageAttendance = computed(() => {
  if (attendances.value.length === 0) return 0;
  const presentCount = attendances.value.filter((a) => a.status === 'present').length;
  return Math.round((presentCount / attendances.value.length) * 100);
});

const flaggedAbsences = computed(() =>
  attendances.value.filter((a) => a.status === 'absent').length
);

const metrics = computed(() => [
  {
    title: 'Total Students',
    value: totalStudents.value.toString(),
    trend: 5,
    bgColor: 'rgba(99, 102, 241, 0.1)',
    color: '#6366f1',
    icon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><path d="M23 21v-2a4 4 0 0 0-3-3.87"></path><path d="M16 3.13a4 4 0 0 1 0 7.75"></path></svg>'
  },
  {
    title: 'Average Attendance',
    value: `${averageAttendance.value}%`,
    trend: 2,
    bgColor: 'rgba(16, 185, 129, 0.1)',
    color: '#10b981',
    icon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"></polyline></svg>'
  },
  {
    title: 'Active Courses',
    value: courses.value.filter((c) => c.status === 'active').length.toString(),
    trend: 12,
    bgColor: 'rgba(245, 158, 11, 0.1)',
    color: '#f59e0b',
    icon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"></path><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"></path></svg>'
  },
  {
    title: 'Flagged Absences',
    value: flaggedAbsences.value.toString(),
    trend: -4,
    bgColor: 'rgba(239, 68, 68, 0.1)',
    color: '#ef4444',
    icon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polygon points="7.86 2 16.14 2 22 7.86 22 16.14 16.14 22 7.86 22 2 16.14 2 7.86 7.86 2"></polygon><line x1="12" y1="8" x2="12" y2="12"></line><line x1="12" y1="16" x2="12.01" y2="16"></line></svg>'
  }
]);

const todaySchedule = computed(() => {
  return schedules.value
    .filter((s) => s.day === currentDayName)
    .sort((a, b) => (a.startTime || '').localeCompare(b.startTime || ''))
    .map((s) => {
      const course = coursesStore.getCourseById(s.courseId);
      return {
        ...s,
        name: course?.name ?? 'Unknown Course',
        room: s.venue,
        status: 'upcoming',
        statusText: 'Upcoming'
      };
    });
});

const systemAuditLogs = computed(() =>
  logs.value.map((l) => ({
    id: l.id,
    action: l.action,
    details: l.details,
    timestamp: l.timestamp
      ? new Date(l.timestamp).toLocaleString('en-US', {
          hour: 'numeric',
          minute: '2-digit',
          month: 'short',
          day: 'numeric'
        })
      : '',
    role: l.userRole || 'System',
    user: l.userName || 'System',
  }))
);
</script>
