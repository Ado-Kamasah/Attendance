<template>
  <div class="space-y-6 w-full max-w-7xl mx-auto">
    <!-- Header with Blueprint Eyebrow -->
    <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-outline/30 dark:border-dark-outline/40">
      <div>
        <div class="flex items-center gap-2 mb-3 text-secondary dark:text-dark-secondary text-xs font-mono uppercase tracking-wider font-semibold">
          <span>FACULTY ROSTER // ASSIGNED MODULE SECTIONS</span>
          <svg class="text-secondary/40 w-20 h-2" viewBox="0 0 140 8" fill="none">
            <path d="M0 4H140" stroke="currentColor" stroke-width="1.5" />
          </svg>
        </div>
        <h1 class="text-2xl sm:text-3xl font-extrabold font-display tracking-tight text-foreground dark:text-dark-foreground">
          Assigned <span class="text-secondary dark:text-dark-secondary">Courses</span>
        </h1>
        <p class="text-xs sm:text-sm font-mono text-foreground/60 dark:text-dark-foreground/60 mt-1">
          Instructional syllabus management, class rosters, and timetable rescheduling
        </p>
      </div>

      <div class="flex items-center gap-3">
        <span class="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold font-mono bg-secondary/15 text-secondary border border-secondary/30">
          <Calendar class="w-3.5 h-3.5" />
          <span>Active Semester</span>
        </span>
      </div>
    </div>

    <!-- Empty State -->
    <div v-if="lecturerCourses.length === 0" class="py-16 text-center text-foreground/50 dark:text-dark-foreground/50 bg-surface dark:bg-dark-surface border border-outline/40 rounded-2xl max-w-md mx-auto p-8">
      <BookOpen class="w-10 h-10 mx-auto mb-2 text-foreground/30" />
      <h3 class="text-base font-bold font-display text-foreground dark:text-dark-foreground">No Courses Assigned</h3>
      <p class="text-xs font-mono mt-1">You haven't been assigned to teach any course sections for the current academic term.</p>
    </div>

    <!-- Courses Grid -->
    <div v-else class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
      <div 
        v-for="course in lecturerCourses" 
        :key="course.id"
        class="relative bg-surface dark:bg-dark-surface border border-outline/50 dark:border-dark-outline/60 rounded-2xl shadow-xs overflow-hidden p-5 flex flex-col justify-between group"
      >
        <div>
          <!-- Top Row -->
          <div class="flex items-center justify-between gap-2 pb-3 border-b border-outline/30 dark:border-dark-outline/40">
            <span class="text-xs font-bold font-mono text-secondary dark:text-dark-secondary">
              {{ course.code }}
            </span>
            <span class="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-bold font-mono bg-primary/10 dark:bg-primary/20 text-primary dark:text-dark-primary border border-primary/20">
              <Users class="w-3 h-3" />
              <span>{{ course.studentsCount }} Enrolled</span>
            </span>
          </div>

          <!-- Course Name -->
          <h3 class="text-sm sm:text-base font-bold text-foreground dark:text-dark-foreground mt-3 line-clamp-2">
            {{ course.name }}
          </h3>

          <!-- Schedule & Venue Details -->
          <div class="mt-3.5 space-y-1.5 text-xs font-mono text-foreground/60 dark:text-dark-foreground/60">
            <div class="flex items-center justify-between gap-2">
              <div class="flex items-center gap-2 truncate">
                <Clock class="w-3.5 h-3.5 text-foreground/40 shrink-0" />
                <span class="truncate">{{ course.day }} &bull; {{ course.time }}</span>
              </div>
              <button 
                @click="openEditModal(course)" 
                class="p-1 rounded-lg text-foreground/40 hover:text-secondary hover:bg-secondary/10 transition-colors cursor-pointer" 
                title="Reschedule Class"
              >
                <Edit3 class="w-3.5 h-3.5" />
              </button>
            </div>

            <div class="flex items-center gap-2">
              <MapPin class="w-3.5 h-3.5 text-foreground/40 shrink-0" />
              <span class="truncate">{{ course.venue }} &bull; {{ course.mode }}</span>
            </div>
          </div>
        </div>

        <!-- Attendance & Actions -->
        <div class="mt-5 pt-4 border-t border-outline/30 dark:border-dark-outline/40 space-y-3">
          <div>
            <div class="flex items-center justify-between text-xs font-mono mb-1.5">
              <span class="text-foreground/60 dark:text-dark-foreground/60">Average Turnout</span>
              <span class="font-bold text-foreground dark:text-dark-foreground">{{ course.avgAttendance }}%</span>
            </div>
            <div class="h-2 w-full bg-muted/70 dark:bg-dark-muted/70 rounded-full overflow-hidden">
              <div 
                class="h-full rounded-full transition-all duration-500" 
                :style="{ width: `${course.avgAttendance}%`, backgroundColor: course.color }"
              ></div>
            </div>
          </div>

          <div class="flex items-center gap-2">
            <button 
              @click="goToAttendance(course)"
              class="flex-1 py-2 rounded-xl text-surface font-semibold text-xs shadow-xs hover:opacity-90 active:scale-98 transition-all flex items-center justify-center gap-1.5 cursor-pointer"
              :style="{ backgroundColor: course.color }"
            >
              <ClipboardCheck class="w-3.5 h-3.5" />
              <span>Roll Call</span>
            </button>

            <button 
              @click="openClassList(course)"
              class="px-3 py-2 rounded-xl bg-muted/40 hover:bg-muted text-foreground text-xs font-mono font-semibold border border-outline/40 transition-colors cursor-pointer"
              title="View Roster"
            >
              <Users class="w-3.5 h-3.5" />
            </button>

            <button 
              @click="confirmDelete(course)" 
              class="p-2 rounded-xl text-foreground/40 hover:text-error hover:bg-error/10 border border-outline/40 transition-colors cursor-pointer"
              title="Remove section assignment"
            >
              <Trash2 class="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Reschedule Modal -->
    <div v-if="editingCourse" class="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center z-50 p-4" @click.self="cancelEdit">
      <div class="relative bg-surface dark:bg-dark-surface border border-outline/50 dark:border-dark-outline/60 rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl space-y-4">
        <div class="absolute top-3 left-3 w-4 h-4 border-t-2 border-l-2 border-secondary/30 pointer-events-none"></div>
        <div class="absolute top-3 right-3 w-4 h-4 border-t-2 border-r-2 border-secondary/30 pointer-events-none"></div>

        <h2 class="text-base sm:text-lg font-bold font-display text-foreground dark:text-dark-foreground">
          Reschedule Lecture Section
        </h2>
        <p class="text-xs font-mono text-foreground/60">
          Update teaching slot for {{ editingCourse.code }} &bull; {{ editingCourse.name }}
        </p>

        <div class="space-y-3 text-xs font-mono pt-2">
          <div>
            <label class="block text-[11px] text-foreground/70 mb-1">Day of Week</label>
            <select v-model="editForm.day" class="w-full bg-muted/30 dark:bg-dark-muted/30 border border-outline/40 rounded-xl px-3 py-2 text-foreground dark:text-dark-foreground outline-hidden focus:border-secondary">
              <option value="Monday">Monday</option>
              <option value="Tuesday">Tuesday</option>
              <option value="Wednesday">Wednesday</option>
              <option value="Thursday">Thursday</option>
              <option value="Friday">Friday</option>
              <option value="Saturday">Saturday</option>
              <option value="Sunday">Sunday</option>
            </select>
          </div>

          <div class="grid grid-cols-2 gap-3">
            <div>
              <label class="block text-[11px] text-foreground/70 mb-1">Start Time</label>
              <input type="time" v-model="editForm.startTime" class="w-full bg-muted/30 dark:bg-dark-muted/30 border border-outline/40 rounded-xl px-3 py-2 text-foreground dark:text-dark-foreground outline-hidden focus:border-secondary" />
            </div>
            <div>
              <label class="block text-[11px] text-foreground/70 mb-1">End Time</label>
              <input type="time" v-model="editForm.endTime" class="w-full bg-muted/30 dark:bg-dark-muted/30 border border-outline/40 rounded-xl px-3 py-2 text-foreground dark:text-dark-foreground outline-hidden focus:border-secondary" />
            </div>
          </div>
        </div>

        <div class="flex justify-end gap-2.5 pt-3 border-t border-outline/30 dark:border-dark-outline/40">
          <button @click="cancelEdit" class="px-4 py-2 rounded-xl text-xs font-semibold hover:bg-muted/40 transition-colors cursor-pointer">
            Cancel
          </button>
          <button @click="saveEdit" class="px-5 py-2 rounded-xl bg-primary dark:bg-dark-secondary text-surface dark:text-primary text-xs font-bold shadow-xs hover:opacity-90 transition-opacity cursor-pointer">
            Save Schedule
          </button>
        </div>
      </div>
    </div>

    <!-- Class Roster Modal -->
    <div v-if="showingClassList" class="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center z-50 p-4" @click.self="closeClassList">
      <div class="relative bg-surface dark:bg-dark-surface border border-outline/50 dark:border-dark-outline/60 rounded-3xl p-6 sm:p-8 max-w-2xl w-full shadow-2xl space-y-4 max-h-[85vh] flex flex-col">
        <div class="absolute top-3 left-3 w-4 h-4 border-t-2 border-l-2 border-secondary/30 pointer-events-none"></div>
        <div class="absolute top-3 right-3 w-4 h-4 border-t-2 border-r-2 border-secondary/30 pointer-events-none"></div>

        <div class="flex items-center justify-between pb-3 border-b border-outline/30 dark:border-dark-outline/40 shrink-0">
          <div>
            <h2 class="text-base sm:text-lg font-bold font-display text-foreground dark:text-dark-foreground">
              {{ activeCourse?.name }}
            </h2>
            <p class="text-xs font-mono text-secondary dark:text-dark-secondary">
              {{ activeCourse?.code }} &bull; Class Enrollment Roster
            </p>
          </div>
          <button @click="closeClassList" class="p-1 text-foreground/40 hover:text-foreground cursor-pointer">
            <X class="w-5 h-5" />
          </button>
        </div>

        <div class="overflow-y-auto flex-1 pt-2">
          <div v-if="isLoadingStudents" class="py-12 text-center text-xs font-mono text-foreground/50 flex items-center justify-center gap-2">
            <RefreshCw class="w-4 h-4 animate-spin text-secondary" />
            <span>Loading student roster…</span>
          </div>

          <div v-else-if="studentsList.length === 0" class="py-12 text-center text-xs font-mono text-foreground/50">
            No students currently enrolled in this course section.
          </div>

          <table v-else class="w-full text-left text-xs font-mono">
            <thead>
              <tr class="border-b border-outline/30 text-[11px] uppercase text-foreground/60">
                <th class="py-2.5 px-3">Student</th>
                <th class="py-2.5 px-3">Student ID</th>
                <th class="py-2.5 px-3">Program</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-outline/20">
              <tr v-for="student in studentsList" :key="student.id" class="hover:bg-muted/20">
                <td class="py-2.5 px-3">
                  <div class="flex items-center gap-2 font-sans font-semibold text-foreground dark:text-dark-foreground">
                    <div class="w-6 h-6 rounded-md bg-secondary/15 text-secondary font-mono font-bold text-[10px] flex items-center justify-center shrink-0">
                      {{ student.name.charAt(0) }}
                    </div>
                    <span>{{ student.name }}</span>
                  </div>
                </td>
                <td class="py-2.5 px-3 text-foreground/70">{{ student.studentId }}</td>
                <td class="py-2.5 px-3 text-foreground/60">{{ programmesStore.getProgrammeById(student.programId)?.name || 'General' }}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>

    <!-- Delete Section Modal -->
    <div v-if="deletingCourse" class="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center z-50 p-4" @click.self="deletingCourse = null">
      <div class="relative bg-surface dark:bg-dark-surface border border-outline/50 dark:border-dark-outline/60 rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl space-y-4">
        <div class="w-12 h-12 rounded-2xl bg-error/15 text-error flex items-center justify-center">
          <Trash2 class="w-6 h-6" />
        </div>
        <h2 class="text-base sm:text-lg font-bold font-display text-foreground dark:text-dark-foreground">
          Remove Section Assignment?
        </h2>
        <p class="text-xs font-mono text-foreground/70">
          You are about to unassign yourself from teaching the <strong>{{ deletingCourse.mode }}</strong> section of <strong>{{ deletingCourse.code }}</strong>.
        </p>

        <div class="flex justify-end gap-2.5 pt-3 border-t border-outline/30 dark:border-dark-outline/40">
          <button @click="deletingCourse = null" :disabled="isDeleting" class="px-4 py-2 rounded-xl text-xs font-semibold hover:bg-muted/40 transition-colors cursor-pointer">
            Cancel
          </button>
          <button @click="deleteSection" :disabled="isDeleting" class="px-5 py-2 rounded-xl bg-error text-white text-xs font-bold shadow-xs hover:opacity-90 transition-opacity flex items-center gap-1.5 cursor-pointer">
            <RefreshCw v-if="isDeleting" class="w-3.5 h-3.5 animate-spin" />
            <span>{{ isDeleting ? 'Removing…' : 'Yes, Remove Section' }}</span>
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
import { useSchedulesStore } from '@/stores/schedules';
import { useCoursesStore } from '@/stores/courses';
import { useEnrollmentsStore } from '@/stores/enrollments';
import { useSessionsStore } from '@/stores/sessions';
import { useAttendancesStore } from '@/stores/attendances';
import { supabase } from '@/stores/supabase';
import { useProgrammesStore } from '@/stores/programmes';
import { 
  BookOpen, 
  Users, 
  Calendar, 
  Clock, 
  MapPin, 
  Edit3, 
  ClipboardCheck, 
  Trash2, 
  X, 
  RefreshCw 
} from 'lucide-vue-next';

const emit = defineEmits(['navigate']);

const authStore = useAuthStore();
const schedulesStore = useSchedulesStore();
const coursesStore = useCoursesStore();
const enrollmentsStore = useEnrollmentsStore();
const sessionsStore = useSessionsStore();
const attendancesStore = useAttendancesStore();
const programmesStore = useProgrammesStore();

const { profile } = storeToRefs(authStore);
const { schedules } = storeToRefs(schedulesStore);
const { sessions } = storeToRefs(sessionsStore);
const { attendances } = storeToRefs(attendancesStore);

const lecturerName = computed(() => profile.value?.name ?? '');
const studentModeById = ref({});
const palette = ['#031c45', '#10b981', '#bc9333', '#ec4899', '#0ea5e9', '#6366f1'];

onMounted(async () => {
  try {
    await Promise.all([
      schedulesStore.fetchSchedules(),
      coursesStore.fetchCourses(),
      enrollmentsStore.fetchEnrollments(),
      sessionsStore.fetchSessions(),
      attendancesStore.fetchAttendances(),
      programmesStore.fetchProgrammes(),
    ]);

    schedulesStore.subscribeToSchedules();
    coursesStore.subscribeToCourses();
    enrollmentsStore.subscribeToEnrollments();
    sessionsStore.subscribeToSessions();
    attendancesStore.subscribeToAttendances();

    const { data: usersData } = await supabase
      .from('users')
      .select('id, mode')
      .eq('role', 'Student');
    if (usersData) {
      const map = {};
      usersData.forEach((u) => { map[u.id] = u.mode; });
      studentModeById.value = map;
    }
  } catch (error) {
    console.error('Error fetching lecturer courses:', error);
  }
});

onUnmounted(() => {
  schedulesStore.unsubscribeFromSchedules();
  coursesStore.unsubscribeFromCourses();
  enrollmentsStore.unsubscribeFromEnrollments();
  sessionsStore.unsubscribeFromSessions();
  attendancesStore.unsubscribeFromAttendances();
});

const lecturerCourses = computed(() => {
  return schedules.value
    .filter((s) => s.lecturer === lecturerName.value)
    .map((s, index) => {
      const course = coursesStore.getCourseById(s.courseId);
      const allCourseEnrollments = enrollmentsStore.enrollmentsByCourse(s.courseId);
      const sectionEnrollments = allCourseEnrollments.filter((e) => {
        const studentMode = studentModeById.value[e.studentId];
        return !s.mode || !studentMode || studentMode === s.mode;
      });

      const courseSessionIds = new Set(
        sessions.value.filter((sess) => sess.courseId === s.courseId).map((sess) => sess.id)
      );

      const sectionStudentIds = new Set(sectionEnrollments.map((e) => e.studentId));
      const sectionAttendances = attendances.value.filter(
        (a) => courseSessionIds.has(a.sessionId) && sectionStudentIds.has(a.studentId)
      );

      let avgAttendance = 0;
      if (sectionAttendances.length > 0) {
        const presentCount = sectionAttendances.filter((a) => a.status === 'present').length;
        avgAttendance = Math.round((presentCount / sectionAttendances.length) * 100);
      }

      return {
        id: s.id,
        courseId: s.courseId,
        code: course?.code ?? 'Unknown',
        name: course?.name ?? 'Unknown Course',
        day: s.day,
        time: `${s.startTime} - ${s.endTime}`,
        startTime: s.startTime,
        endTime: s.endTime,
        venue: s.venue,
        mode: s.mode || 'Regular',
        studentsCount: sectionEnrollments.length,
        avgAttendance,
        color: palette[index % palette.length],
      };
    });
});

const editingCourse = ref(null);
const editForm = ref({ day: '', startTime: '', endTime: '' });

const openEditModal = (course) => {
  editingCourse.value = course;
  editForm.value = {
    day: course.day,
    startTime: course.startTime,
    endTime: course.endTime,
  };
};

const cancelEdit = () => {
  editingCourse.value = null;
};

const saveEdit = async () => {
  if (!editingCourse.value) return;
  try {
    await schedulesStore.updateSchedule(editingCourse.value.id, {
      day: editForm.value.day,
      startTime: editForm.value.startTime,
      endTime: editForm.value.endTime,
    });
    editingCourse.value = null;
  } catch (e) {
    console.error('Failed to update schedule:', e);
  }
};

const deletingCourse = ref(null);
const isDeleting = ref(false);

const confirmDelete = (course) => {
  deletingCourse.value = course;
};

const deleteSection = async () => {
  if (!deletingCourse.value) return;
  isDeleting.value = true;
  try {
    await schedulesStore.deleteSchedule(deletingCourse.value.id);
    deletingCourse.value = null;
  } catch (e) {
    console.error('Failed to delete section:', e);
  } finally {
    isDeleting.value = false;
  }
};

const showingClassList = ref(false);
const activeCourse = ref(null);
const studentsList = ref([]);
const isLoadingStudents = ref(false);

const openClassList = async (course) => {
  activeCourse.value = course;
  showingClassList.value = true;
  isLoadingStudents.value = true;
  try {
    const allCourseEnrollments = enrollmentsStore.enrollmentsByCourse(course.courseId);
    const sectionEnrollments = allCourseEnrollments.filter((e) => {
      const studentMode = studentModeById.value[e.studentId];
      return !course.mode || !studentMode || studentMode === course.mode;
    });

    const studentIds = sectionEnrollments.map((e) => e.studentId);
    if (studentIds.length === 0) {
      studentsList.value = [];
      return;
    }

    const { data, error } = await supabase
      .from('users')
      .select('id, name, id_number, program_id')
      .in('id', studentIds);

    if (error) throw error;
    studentsList.value = (data || []).map((u) => ({
      id: u.id,
      name: u.name,
      studentId: u.id_number || 'N/A',
      programId: u.program_id,
    }));
  } catch (e) {
    console.error('Failed to load class list:', e);
  } finally {
    isLoadingStudents.value = false;
  }
};

const closeClassList = () => {
  showingClassList.value = false;
  activeCourse.value = null;
  studentsList.value = [];
};

const goToAttendance = (course) => {
  localStorage.setItem('activeCourseId', course.courseId);
  localStorage.setItem('activeCourseCode', course.code);
  localStorage.setItem('activeCourseName', course.name);
  emit('navigate', '/attendance-view');
};
</script>