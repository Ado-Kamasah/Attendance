<template>
  <div class="space-y-6 w-full max-w-7xl mx-auto">
    <!-- Header with Blueprint Eyebrow -->
    <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-outline/30 dark:border-dark-outline/40">
      <div>
        <div class="dim-eyebrow">
          <span>STUDENT PORTAL // ACADEMIC PROFILE</span>
          <svg class="dim-line w-20 h-2" viewBox="0 0 140 8" fill="none">
            <path d="M0 4H140" stroke="currentColor" stroke-width="1.5" />
          </svg>
        </div>
        <h1 class="text-2xl sm:text-3xl font-extrabold font-display tracking-tight text-foreground dark:text-dark-foreground">
          Welcome back, <span class="text-secondary dark:text-dark-secondary">{{ firstName }}</span>
        </h1>
        <p class="text-xs sm:text-sm font-mono text-foreground/60 dark:text-dark-foreground/60 mt-1">
          {{ currentDate }} &bull; Matriculated Cohort
        </p>
      </div>

      <div class="flex items-center gap-3">
        <button 
          @click="$emit('navigate', '/attendance')"
          class="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-primary dark:bg-dark-secondary text-surface dark:text-primary font-semibold text-xs sm:text-sm shadow-md hover:opacity-90 active:scale-98 transition-all cursor-pointer"
        >
          <CheckCircle2 class="w-4 h-4" />
          <span>Mark Attendance</span>
        </button>
      </div>
    </div>

    <!-- KPI Metric Cards Grid -->
    <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      <!-- Enrolled Courses -->
      <div class="blueprint-card relative p-5 bg-surface dark:bg-dark-surface border border-outline/50 dark:border-dark-outline/60 rounded-2xl shadow-xs overflow-hidden group">
        <div class="flex items-center justify-between">
          <span class="text-xs font-mono font-medium text-foreground/60 dark:text-dark-foreground/60 uppercase tracking-wider">
            Enrolled Courses
          </span>
          <div class="w-9 h-9 rounded-xl bg-blue-500/10 text-blue-500 border border-blue-500/20 flex items-center justify-center">
            <BookOpen class="w-4.5 h-4.5" />
          </div>
        </div>
        <div class="mt-3 flex items-baseline gap-2">
          <span class="text-3xl font-extrabold font-display text-foreground dark:text-dark-foreground">
            {{ enrolledCourseIds.length }}
          </span>
          <span class="text-[11px] font-mono text-foreground/50 dark:text-dark-foreground/50">Active</span>
        </div>
      </div>

      <!-- Attendance Rate -->
      <div class="blueprint-card relative p-5 bg-surface dark:bg-dark-surface border border-outline/50 dark:border-dark-outline/60 rounded-2xl shadow-xs overflow-hidden group">
        <div class="flex items-center justify-between">
          <span class="text-xs font-mono font-medium text-foreground/60 dark:text-dark-foreground/60 uppercase tracking-wider">
            Overall Rate
          </span>
          <div 
            class="w-9 h-9 rounded-xl flex items-center justify-center border"
            :class="overallRate >= 75 ? 'bg-success/10 text-success border-success/20' : overallRate >= 50 ? 'bg-warning/10 text-warning border-warning/20' : 'bg-error/10 text-error border-error/20'"
          >
            <TrendingUp class="w-4.5 h-4.5" />
          </div>
        </div>
        <div class="mt-3 flex items-baseline gap-2">
          <span 
            class="text-3xl font-extrabold font-display"
            :class="overallRate >= 75 ? 'text-success' : overallRate >= 50 ? 'text-warning' : 'text-error'"
          >
            {{ overallRate }}%
          </span>
          <span class="text-[11px] font-mono text-foreground/50 dark:text-dark-foreground/50">Min 75% target</span>
        </div>
      </div>

      <!-- Classes Attended -->
      <div class="blueprint-card relative p-5 bg-surface dark:bg-dark-surface border border-outline/50 dark:border-dark-outline/60 rounded-2xl shadow-xs overflow-hidden group">
        <div class="flex items-center justify-between">
          <span class="text-xs font-mono font-medium text-foreground/60 dark:text-dark-foreground/60 uppercase tracking-wider">
            Classes Attended
          </span>
          <div class="w-9 h-9 rounded-xl bg-secondary/10 text-secondary border border-secondary/20 flex items-center justify-center">
            <CheckCircle2 class="w-4.5 h-4.5" />
          </div>
        </div>
        <div class="mt-3 flex items-baseline gap-2">
          <span class="text-3xl font-extrabold font-display text-foreground dark:text-dark-foreground">
            {{ presentCount }}
          </span>
          <span class="text-[11px] font-mono text-foreground/50 dark:text-dark-foreground/50">Sessions logged</span>
        </div>
      </div>

      <!-- Classes Missed -->
      <div class="blueprint-card relative p-5 bg-surface dark:bg-dark-surface border border-outline/50 dark:border-dark-outline/60 rounded-2xl shadow-xs overflow-hidden group">
        <div class="flex items-center justify-between">
          <span class="text-xs font-mono font-medium text-foreground/60 dark:text-dark-foreground/60 uppercase tracking-wider">
            Classes Missed
          </span>
          <div class="w-9 h-9 rounded-xl bg-error/10 text-error border border-error/20 flex items-center justify-center">
            <AlertOctagon class="w-4.5 h-4.5" />
          </div>
        </div>
        <div class="mt-3 flex items-baseline gap-2">
          <span class="text-3xl font-extrabold font-display text-error">
            {{ absentCount }}
          </span>
          <span class="text-[11px] font-mono text-foreground/50 dark:text-dark-foreground/50">Absences</span>
        </div>
      </div>
    </div>

    <!-- Main Content 2-Column Grid -->
    <div class="grid grid-cols-1 lg:grid-cols-12 gap-6">
      <!-- Left Column: Today's Schedule (7 cols) -->
      <div class="lg:col-span-7 space-y-4">
        <div class="relative bg-surface dark:bg-dark-surface border border-outline/50 dark:border-dark-outline/60 rounded-2xl shadow-xs overflow-hidden p-5">
          <!-- Blueprint corner marks -->
          <div class="corner corner-tl !border-secondary/30 pointer-events-none"></div>
          <div class="corner corner-tr !border-secondary/30 pointer-events-none"></div>

          <div class="flex items-center justify-between pb-3 border-b border-outline/30 dark:border-dark-outline/40">
            <div class="flex items-center gap-2">
              <Calendar class="w-4 h-4 text-secondary" />
              <h2 class="text-sm sm:text-base font-bold font-display uppercase tracking-wider text-foreground dark:text-dark-foreground">
                Today's Schedule
              </h2>
            </div>
            <button 
              @click="$emit('navigate', '/my-courses')"
              class="text-xs font-semibold text-secondary hover:underline flex items-center gap-1 cursor-pointer"
            >
              <span>Full Timetable</span>
              <ChevronRight class="w-3.5 h-3.5" />
            </button>
          </div>

          <!-- Schedule List -->
          <div class="pt-4">
            <div v-if="isLoading" class="py-12 text-center text-xs font-mono text-foreground/50 dark:text-dark-foreground/50 flex items-center justify-center gap-2">
              <RefreshCw class="w-4 h-4 animate-spin text-secondary" />
              <span>Loading today's schedule…</span>
            </div>

            <div v-else-if="todayClasses.length === 0" class="py-12 text-center text-foreground/50 dark:text-dark-foreground/50">
              <CalendarX2 class="w-8 h-8 mx-auto mb-2 text-foreground/30 dark:text-dark-foreground/30" />
              <p class="text-sm font-medium text-foreground dark:text-dark-foreground">No classes today</p>
              <p class="text-xs font-mono mt-0.5">You have no scheduled lectures for {{ todayName }}.</p>
            </div>

            <div v-else class="space-y-3">
              <div 
                v-for="cls in todayClasses" 
                :key="cls.id" 
                class="p-4 rounded-xl border transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                :class="cls.isActive 
                  ? 'bg-secondary/5 dark:bg-dark-secondary/5 border-secondary/40 shadow-xs' 
                  : 'bg-muted/20 dark:bg-dark-muted/20 border-outline/30 dark:border-dark-outline/40 hover:bg-muted/40'"
              >
                <div class="flex items-start gap-3">
                  <!-- Time pillar -->
                  <div class="px-3 py-1.5 rounded-lg bg-surface dark:bg-dark-surface border border-outline/40 dark:border-dark-outline/40 text-center shrink-0">
                    <span class="block text-xs font-bold font-mono text-foreground dark:text-dark-foreground">
                      {{ formatTime(cls.startTime) }}
                    </span>
                    <span class="block text-[10px] font-mono text-foreground/45 dark:text-dark-foreground/45">
                      {{ formatTime(cls.endTime) }}
                    </span>
                  </div>

                  <!-- Details -->
                  <div class="min-w-0">
                    <div class="flex items-center gap-2">
                      <span class="text-xs font-bold font-mono text-secondary dark:text-dark-secondary">
                        {{ cls.courseCode }}
                      </span>
                      <span 
                        v-if="cls.isActive" 
                        class="inline-flex items-center gap-1 px-1.5 py-0.2 rounded-full text-[10px] font-bold font-mono bg-emerald-500/15 text-emerald-500 border border-emerald-500/30 animate-pulse"
                      >
                        <span class="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                        LIVE
                      </span>
                    </div>
                    <h3 class="text-xs sm:text-sm font-semibold text-foreground dark:text-dark-foreground truncate mt-0.5">
                      {{ cls.courseName }}
                    </h3>
                    <p class="text-[11px] font-mono text-foreground/50 dark:text-dark-foreground/50 mt-0.5">
                      {{ cls.lecturer }} &bull; {{ cls.venue }}
                    </p>
                  </div>
                </div>

                <div class="flex items-center gap-2 self-end sm:self-center">
                  <button 
                    v-if="cls.isActive"
                    @click="$emit('navigate', '/attendance')"
                    class="px-3 py-1.5 rounded-lg bg-secondary text-primary font-bold text-xs shadow-xs hover:opacity-90 transition-opacity cursor-pointer flex items-center gap-1.5"
                  >
                    <span>Check In</span>
                    <ArrowRight class="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Right Column: Per-course Attendance Health (5 cols) -->
      <div class="lg:col-span-5 space-y-4">
        <div class="relative bg-surface dark:bg-dark-surface border border-outline/50 dark:border-dark-outline/60 rounded-2xl shadow-xs overflow-hidden p-5">
          <div class="corner corner-tl !border-secondary/30 pointer-events-none"></div>
          <div class="corner corner-tr !border-secondary/30 pointer-events-none"></div>

          <div class="flex items-center justify-between pb-3 border-b border-outline/30 dark:border-dark-outline/40">
            <div class="flex items-center gap-2">
              <Activity class="w-4 h-4 text-secondary" />
              <h2 class="text-sm sm:text-base font-bold font-display uppercase tracking-wider text-foreground dark:text-dark-foreground">
                Course Attendance
              </h2>
            </div>
            <button 
              @click="$emit('navigate', '/attendance')"
              class="text-xs font-semibold text-secondary hover:underline cursor-pointer"
            >
              Mark Now
            </button>
          </div>

          <div class="pt-4">
            <div v-if="isLoading" class="py-12 text-center text-xs font-mono text-foreground/50 dark:text-dark-foreground/50 flex items-center justify-center gap-2">
              <RefreshCw class="w-4 h-4 animate-spin text-secondary" />
              <span>Calculating metrics…</span>
            </div>

            <div v-else-if="courseStats.length === 0" class="py-12 text-center text-foreground/50 dark:text-dark-foreground/50">
              <Activity class="w-8 h-8 mx-auto mb-2 text-foreground/30 dark:text-dark-foreground/30" />
              <p class="text-sm font-medium text-foreground dark:text-dark-foreground">No records logged</p>
              <p class="text-xs font-mono mt-0.5">Attendance records will show here once lectures commence.</p>
            </div>

            <div v-else class="space-y-4">
              <div 
                v-for="stat in courseStats" 
                :key="stat.courseId"
                class="p-3 rounded-xl bg-muted/20 dark:bg-dark-muted/20 border border-outline/30 dark:border-dark-outline/40 space-y-2"
              >
                <div class="flex items-center justify-between gap-2">
                  <div class="min-w-0">
                    <span class="text-[11px] font-bold font-mono text-secondary dark:text-dark-secondary">
                      {{ stat.code }}
                    </span>
                    <p class="text-xs font-semibold text-foreground dark:text-dark-foreground truncate">
                      {{ stat.name }}
                    </p>
                  </div>
                  <span 
                    class="text-xs font-bold font-mono px-2 py-0.5 rounded-md shrink-0"
                    :class="stat.rate >= 75 ? 'bg-success/15 text-success border border-success/30' : stat.rate >= 50 ? 'bg-warning/15 text-warning border border-warning/30' : 'bg-error/15 text-error border border-error/30'"
                  >
                    {{ stat.rate }}%
                  </span>
                </div>

                <!-- Progress Track -->
                <div class="h-2 w-full bg-muted/70 dark:bg-dark-muted/70 rounded-full overflow-hidden">
                  <div 
                    class="h-full rounded-full transition-all duration-500" 
                    :style="{ width: stat.rate + '%', backgroundColor: rateColor(stat.rate) }"
                  ></div>
                </div>

                <div class="flex items-center justify-between text-[10px] font-mono text-foreground/60 dark:text-dark-foreground/60">
                  <span>✓ {{ stat.present }} present</span>
                  <span>✗ {{ stat.absent }} absent</span>
                  <span>{{ stat.total }} total</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Absence Warning Alerts -->
    <div v-if="hasAbsenceAlerts" class="space-y-3">
      <div class="flex items-center justify-between">
        <div class="flex items-center gap-2">
          <AlertTriangle class="w-4 h-4 text-warning" />
          <h2 class="text-sm font-bold font-display uppercase tracking-wider text-foreground dark:text-dark-foreground">
            Academic Alerts & Notices
          </h2>
          <span v-if="notifUnreadCount > 0" class="text-[10px] font-mono px-2 py-0.5 rounded-full bg-error/15 text-error border border-error/30">
            {{ notifUnreadCount }} unread
          </span>
        </div>
        <button 
          @click="$emit('navigate', '/notifications')"
          class="text-xs font-semibold text-secondary hover:underline cursor-pointer"
        >
          View All Notices
        </button>
      </div>

      <div class="grid grid-cols-1 md:grid-cols-2 gap-3">
        <!-- Evaluation Open notices -->
        <div
          v-for="n in evalOpenNotifications"
          :key="n.id"
          class="p-3.5 rounded-xl border border-secondary/40 bg-secondary/5 dark:bg-dark-secondary/5 hover:bg-secondary/10 transition-colors flex items-start gap-3 cursor-pointer"
          :class="{ 'opacity-70': n.isRead }"
          @click="notifStore.markRead(n.id); $emit('navigate', '/evaluation')"
        >
          <div class="w-7 h-7 rounded-lg bg-secondary/20 text-secondary flex items-center justify-center shrink-0 mt-0.5">
            <Award class="w-4 h-4" />
          </div>
          <div class="min-w-0 flex-1">
            <div class="flex items-center justify-between gap-2">
              <p class="text-xs font-bold text-foreground dark:text-dark-foreground">Evaluations Now Open</p>
              <span class="text-[10px] font-mono text-foreground/45 dark:text-dark-foreground/45 shrink-0">
                {{ new Date(n.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) }}
              </span>
            </div>
            <p class="text-[11px] text-foreground/70 dark:text-dark-foreground/70 mt-0.5">{{ n.message }}</p>
          </div>
          <span v-if="!n.isRead" class="w-2 h-2 rounded-full bg-secondary shrink-0 mt-1"></span>
        </div>

        <!-- Ineligible notices -->
        <div 
          v-for="n in ineligibleWarnings" 
          :key="n.id" 
          class="p-3.5 rounded-xl border border-error/40 bg-error/5 dark:bg-dark-error/5 hover:bg-error/10 transition-colors flex items-start gap-3 cursor-pointer"
          :class="{ 'opacity-70': n.isRead }" 
          @click="notifStore.markRead(n.id)"
        >
          <div class="w-7 h-7 rounded-lg bg-error/20 text-error flex items-center justify-center shrink-0 mt-0.5">
            <AlertOctagon class="w-4 h-4" />
          </div>
          <div class="min-w-0 flex-1">
            <div class="flex items-center justify-between gap-2">
              <p class="text-xs font-bold text-error">Exam Ineligibility – {{ n.courseCode }}</p>
              <span class="text-[10px] font-mono text-foreground/45 dark:text-dark-foreground/45 shrink-0">
                {{ new Date(n.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) }}
              </span>
            </div>
            <p class="text-[11px] text-foreground/70 dark:text-dark-foreground/70 mt-0.5">{{ n.message }}</p>
          </div>
          <span v-if="!n.isRead" class="w-2 h-2 rounded-full bg-error shrink-0 mt-1"></span>
        </div>

        <!-- Warning notices -->
        <div 
          v-for="n in absenceWarnings" 
          :key="n.id" 
          class="p-3.5 rounded-xl border flex items-start gap-3 cursor-pointer transition-colors"
          :class="[
            n.type === 'warning_2' 
              ? 'border-error/40 bg-error/5 dark:bg-dark-error/5 hover:bg-error/10' 
              : 'border-warning/40 bg-warning/5 dark:bg-dark-warning/5 hover:bg-warning/10',
            { 'opacity-70': n.isRead }
          ]" 
          @click="notifStore.markRead(n.id)"
        >
          <div 
            class="w-7 h-7 rounded-lg flex items-center justify-center shrink-0 mt-0.5"
            :class="n.type === 'warning_2' ? 'bg-error/20 text-error' : 'bg-warning/20 text-warning'"
          >
            <AlertTriangle class="w-4 h-4" />
          </div>
          <div class="min-w-0 flex-1">
            <div class="flex items-center justify-between gap-2">
              <p class="text-xs font-bold" :class="n.type === 'warning_2' ? 'text-error' : 'text-warning'">
                {{ n.type === 'warning_2' ? 'Critical Warning' : 'Attendance Warning' }} – {{ n.courseCode }}
              </p>
              <span class="text-[10px] font-mono text-foreground/45 dark:text-dark-foreground/45 shrink-0">
                {{ new Date(n.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) }}
              </span>
            </div>
            <p class="text-[11px] text-foreground/70 dark:text-dark-foreground/70 mt-0.5">{{ n.message }}</p>
          </div>
          <span v-if="!n.isRead" class="w-2 h-2 rounded-full bg-secondary shrink-0 mt-1"></span>
        </div>
      </div>
    </div>

    <!-- Quick Actions Grid -->
    <div class="space-y-3">
      <h2 class="text-sm font-bold font-display uppercase tracking-wider text-foreground dark:text-dark-foreground">
        Quick Action Modules
      </h2>
      <div class="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <button 
          @click="$emit('navigate', '/attendance')"
          class="p-4 rounded-xl bg-surface dark:bg-dark-surface border border-outline/50 dark:border-dark-outline/60 hover:border-secondary/40 shadow-xs hover:shadow-md transition-all flex flex-col items-center text-center gap-2.5 group cursor-pointer"
        >
          <div class="w-10 h-10 rounded-xl bg-primary/10 dark:bg-primary/20 text-primary dark:text-dark-primary flex items-center justify-center group-hover:scale-110 transition-transform">
            <CheckCircle2 class="w-5 h-5" />
          </div>
          <span class="text-xs font-semibold text-foreground dark:text-dark-foreground group-hover:text-secondary transition-colors">
            Mark Attendance
          </span>
        </button>

        <button 
          @click="$emit('navigate', '/my-courses')"
          class="p-4 rounded-xl bg-surface dark:bg-dark-surface border border-outline/50 dark:border-dark-outline/60 hover:border-secondary/40 shadow-xs hover:shadow-md transition-all flex flex-col items-center text-center gap-2.5 group cursor-pointer"
        >
          <div class="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-500 flex items-center justify-center group-hover:scale-110 transition-transform">
            <BookOpen class="w-5 h-5" />
          </div>
          <span class="text-xs font-semibold text-foreground dark:text-dark-foreground group-hover:text-secondary transition-colors">
            My Courses
          </span>
        </button>

        <button 
          @click="$emit('navigate', '/registration')"
          class="p-4 rounded-xl bg-surface dark:bg-dark-surface border border-outline/50 dark:border-dark-outline/60 hover:border-secondary/40 shadow-xs hover:shadow-md transition-all flex flex-col items-center text-center gap-2.5 group cursor-pointer"
        >
          <div class="w-10 h-10 rounded-xl bg-amber-500/10 text-amber-500 flex items-center justify-center group-hover:scale-110 transition-transform">
            <Plus class="w-5 h-5" />
          </div>
          <span class="text-xs font-semibold text-foreground dark:text-dark-foreground group-hover:text-secondary transition-colors">
            Register Course
          </span>
        </button>

        <button 
          @click="$emit('navigate', '/notifications')"
          class="relative p-4 rounded-xl bg-surface dark:bg-dark-surface border border-outline/50 dark:border-dark-outline/60 hover:border-secondary/40 shadow-xs hover:shadow-md transition-all flex flex-col items-center text-center gap-2.5 group cursor-pointer"
        >
          <div class="w-10 h-10 rounded-xl bg-rose-500/10 text-rose-500 flex items-center justify-center group-hover:scale-110 transition-transform">
            <Bell class="w-5 h-5" />
          </div>
          <span class="text-xs font-semibold text-foreground dark:text-dark-foreground group-hover:text-secondary transition-colors">
            Notifications
          </span>
          <span 
            v-if="notifUnreadCount > 0" 
            class="absolute top-3 right-3 w-5 h-5 rounded-full bg-error text-white font-mono text-[10px] font-bold flex items-center justify-center ring-2 ring-surface dark:ring-dark-surface"
          >
            {{ notifUnreadCount }}
          </span>
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue';
import { storeToRefs } from 'pinia';
import { useAuthStore } from '@/stores/authstore';
import { useCoursesStore } from '@/stores/courses';
import { useEnrollmentsStore } from '@/stores/enrollments';
import { useSchedulesStore } from '@/stores/schedules';
import { useSessionsStore } from '@/stores/sessions';
import { useAttendancesStore } from '@/stores/attendances';
import { useStudentNotificationsStore } from '@/stores/studentNotifications';
import { 
  BookOpen, 
  TrendingUp, 
  CheckCircle2, 
  AlertOctagon, 
  Calendar, 
  CalendarX2, 
  Activity, 
  ChevronRight, 
  ArrowRight, 
  RefreshCw, 
  AlertTriangle, 
  Award, 
  Plus, 
  Bell 
} from 'lucide-vue-next';

const emit = defineEmits(['navigate']);

const authStore     = useAuthStore();
const coursesStore  = useCoursesStore();
const enrollStore   = useEnrollmentsStore();
const schedStore    = useSchedulesStore();
const sessStore     = useSessionsStore();
const attStore      = useAttendancesStore();
const notifStore    = useStudentNotificationsStore();

const { profile }     = storeToRefs(authStore);
const { courses }     = storeToRefs(coursesStore);
const { enrollments } = storeToRefs(enrollStore);
const { schedules }   = storeToRefs(schedStore);
const { sessions }    = storeToRefs(sessStore);
const { attendances } = storeToRefs(attStore);

const isLoading = ref(true);

const firstName = computed(() => (profile.value?.name || 'Student').split(' ')[0]);
const currentDate = new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
const todayName   = new Date().toLocaleDateString('en-US', { weekday: 'long' });

onMounted(async () => {
  isLoading.value = true;
  const uid = profile.value?.id;
  await Promise.all([
    coursesStore.fetchCourses(),
    enrollStore.fetchEnrollments({ studentId: uid }),
    schedStore.fetchSchedules(),
    sessStore.fetchSessions(),
    attStore.fetchAttendances({ studentId: uid }),
    notifStore.fetchNotifications(),
  ]);
  sessStore.subscribeToSessions();
  attStore.subscribeToAttendances();
  isLoading.value = false;
});

// ── Absence warnings ──────────────────────────────────────────────────────────
const absenceWarnings       = computed(() => notifStore.warningNotifications);
const ineligibleWarnings    = computed(() => notifStore.ineligibleNotifications);
const evalOpenNotifications = computed(() => notifStore.evalOpenNotifications);
const hasAbsenceAlerts      = computed(() => notifStore.notifications.length > 0);
const notifUnreadCount      = computed(() => notifStore.unreadCount);

onUnmounted(() => {
  sessStore.unsubscribeFromSessions();
  attStore.unsubscribeFromAttendances();
});

// ── Enrolled course IDs ───────────────────────────────────────────────────────
const enrolledCourseIds = computed(() =>
  enrollments.value
    .filter(e => e.studentId === profile.value?.id)
    .map(e => e.courseId)
);

// ── KPI counts ────────────────────────────────────────────────────────────────
const myAttendances = computed(() =>
  attendances.value.filter(a => a.studentId === profile.value?.id)
);

const presentCount = computed(() => myAttendances.value.filter(a => a.status === 'present').length);
const absentCount  = computed(() => myAttendances.value.filter(a => a.status === 'absent').length);
const overallRate  = computed(() => {
  const total = myAttendances.value.length;
  return total > 0 ? Math.round((presentCount.value / total) * 100) : 0;
});

// ── Today's schedule ──────────────────────────────────────────────────────────
const todayClasses = computed(() => {
  const activeSessions = new Set(sessions.value.filter(s => s.isActive).map(s => s.courseId));
  return schedules.value
    .filter(s => s.day === todayName && enrolledCourseIds.value.includes(s.courseId))
    .map(s => {
      const course = coursesStore.getCourseById(s.courseId);
      return {
        id: s.id,
        courseCode: course?.code  ?? '—',
        courseName: course?.name  ?? 'Unknown',
        lecturer:   s.lecturer    ?? '—',
        venue:      s.venue       ?? '—',
        startTime:  s.startTime,
        endTime:    s.endTime,
        isActive:   activeSessions.has(s.courseId),
      };
    })
    .sort((a, b) => (a.startTime || '').localeCompare(b.startTime || ''));
});

// ── Per-course attendance stats ───────────────────────────────────────────────
const courseStats = computed(() => {
  return enrolledCourseIds.value.map(cid => {
    const course = coursesStore.getCourseById(cid);
    const courseSessIds = new Set(sessions.value.filter(s => s.courseId === cid).map(s => s.id));
    const recs    = myAttendances.value.filter(a => courseSessIds.has(a.sessionId));
    const present = recs.filter(a => a.status === 'present').length;
    const absent  = recs.filter(a => a.status === 'absent').length;
    const total   = recs.length;
    const rate    = total > 0 ? Math.round((present / total) * 100) : 0;
    return { courseId: cid, code: course?.code ?? '—', name: course?.name ?? 'Unknown', present, absent, total, rate };
  }).filter(s => s.total > 0);
});

// ── Helpers ───────────────────────────────────────────────────────────────────
function formatTime(t) {
  if (!t) return '';
  const [h, m] = t.split(':').map(Number);
  const ampm = h >= 12 ? 'PM' : 'AM';
  return `${h % 12 || 12}:${String(m).padStart(2, '0')} ${ampm}`;
}

function rateColor(r) {
  if (r >= 75) return 'var(--color-success, #10b981)';
  if (r >= 50) return 'var(--color-warning, #f59e0b)';
  return 'var(--color-error, #ef4444)';
}
</script>