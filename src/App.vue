<script setup>
import { computed, ref, watch, onMounted, onUnmounted } from 'vue';
import { Loader2 } from 'lucide-vue-next';
import Sidebar from './components/sidebar.vue';
import Navbar from './components/navbar.vue';
import Login from './Pages/Auth/login.vue';
import Register from './Pages/Auth/Register.vue';
import Dashboard from './Pages/Admin/Dashboard.vue';
import Courses from './Pages/Admin/Courses.vue';
import StudentDashboard from './Pages/Student/StudentDashboard.vue';
import CourseRegistration from './Pages/Student/CourseRegistration.vue';
import MyCourses from './Pages/Student/MyCourses.vue';
import MarkAttendance from './Pages/Student/MarkAttendance.vue';
import Schedule from './Pages/Admin/Schedule.vue';
import SemesterSetup from './Pages/Admin/SemesterSetup.vue';
import Faculties from './Pages/Admin/Faculties.vue';
import Analytics from './Pages/Admin/Analytics.vue';
import SessionAnalytics from './Pages/Admin/SessionAnalytics.vue';
import EvaluationAdmin  from './Pages/Admin/EvaluationAdmin.vue';
import UsersAdmin        from './Pages/Admin/UsersAdmin.vue';
import LecturersAdmin    from './Pages/Admin/LecturersAdmin.vue';
import StudentsAdmin     from './Pages/Admin/StudentsAdmin.vue';
import EvaluationForm   from './Pages/Student/EvaluationForm.vue';
import ClassRepManagement from './Pages/Admin/ClassRepManagement.vue';
import ClassRepDashboard  from './Pages/Student/ClassRepDashboard.vue';
import SuggestionBox     from './Pages/Student/SuggestionBox.vue';
import MyTimetable       from './Pages/Student/MyTimetable.vue';
import SuggestionsAdmin  from './Pages/Admin/SuggestionsAdmin.vue';
import AdminSidebar from './USERS_ROLES/admin.vue';
import LecturerSidebar from './USERS_ROLES/lecturers.vue';
import StudentSidebar from './USERS_ROLES/students.vue';
import FinanceSidebar from './USERS_ROLES/finance.vue';
import FinanceDashboard from './Pages/Finance/FinanceDashboard.vue';
import FinanceClaims from './Pages/Finance/FinanceClaims.vue';
import LecturerDashboard from './Pages/Lecturers/lecturerDashboard.vue';
import LecturerCourses from './Pages/Lecturers/MyCourses.vue';
import AttendanceView from './Pages/Lecturers/Attendanceview.vue';
import CourseReports from './Pages/Lecturers/CourseReports.vue';
import AttendanceAnalytics from './Pages/Lecturers/AttendanceAnalytics.vue';
import LecturerClassRepManagement from './Pages/Lecturers/LecturerClassRepManagement.vue';
import Profile from './Pages/Profile/Profile.vue';
import Notifications from './Pages/Notifications.vue';
import { useAuthStore } from './stores/authstore.js';

const authStore = useAuthStore();

const activeAuthView = ref('login');
const currentRoute = ref(window.location.pathname === '/' ? '/' : window.location.pathname);
const routeParams  = ref({});
const isMobileSidebarOpen = ref(false);
const isReady = ref(false); // avoid flashing while session initializes

// User is authenticated ONLY when BOTH auth session user AND profile are loaded
const isAuthenticated = computed(() => !!authStore.user && !!authStore.profile);
// Show splash while checking session or while profile is being fetched
const isAuthenticating = computed(() => !isReady.value || (!!authStore.user && !authStore.profile));

const userRole = computed(() => {
  const raw = (authStore.profile?.role || '').toUpperCase().replace(/[\s_-]+/g, '_');
  if (raw === 'SUPER_ADMIN' || raw === 'SUPERADMIN') return 'Super Admin';
  if (raw === 'ADMIN') return 'Admin';
  if (raw === 'LECTURER' || raw === 'STAFF') return 'Lecturer';
  if (raw === 'FINANCE') return 'Finance';
  if (raw === 'STUDENT') return 'Student';
  return '';
});

const handleNavigationEvent = (path, params = {}) => {
  if (currentRoute.value !== path) {
    currentRoute.value = path;
    routeParams.value  = params;
    window.history.pushState({ path }, '', path);
  } else {
    routeParams.value = params;
  }
  isMobileSidebarOpen.value = false;
};

const redirectForRole = (role) => {
  if (role === 'Super Admin')   handleNavigationEvent('/users-admin');
  else if (role === 'Admin')    handleNavigationEvent('/');
  else if (role === 'Lecturer') handleNavigationEvent('/lecturer-dashboard');
  else if (role === 'Student')  handleNavigationEvent('/student-dashboard');
  else if (role === 'Finance')  handleNavigationEvent('/finance-dashboard');
};

const handleLoginSuccess = (payload) => {
  const rawRole = (payload?.role || authStore.profile?.role || '').toUpperCase().replace(/[\s_-]+/g, '_');
  let role = '';
  if (rawRole === 'SUPER_ADMIN' || rawRole === 'SUPERADMIN') role = 'Super Admin';
  else if (rawRole === 'ADMIN') role = 'Admin';
  else if (rawRole === 'LECTURER' || rawRole === 'STAFF') role = 'Lecturer';
  else if (rawRole === 'FINANCE') role = 'Finance';
  else if (rawRole === 'STUDENT') role = 'Student';
  else role = userRole.value;

  if (role) {
    redirectForRole(role);
  }
};

const handleLogout = async () => {
  await authStore.logout();
  currentRoute.value = '/';
  routeParams.value = {};
  window.history.replaceState({ path: '/' }, '', '/');
  activeAuthView.value = 'login';
};

const handleRegisterSuccess = () => {
  activeAuthView.value = 'register' ? (activeAuthView.value = 'login') : null;
};

// Auto-redirect to the proper role dashboard if user lands on root or login page
watch(
  [() => authStore.profile, () => currentRoute.value],
  ([newProfile, route]) => {
    if (newProfile && userRole.value) {
      if (route === '/' || route === '/login') {
        redirectForRole(userRole.value);
      }
    }
  },
  { immediate: true }
);

onMounted(async () => {
  await authStore.initialize();
  isReady.value = true;

  if (authStore.user && authStore.profile) {
    if (currentRoute.value === '/' || currentRoute.value === '/login') {
      redirectForRole(userRole.value);
    }
  }

  window.history.replaceState({ path: currentRoute.value }, '', currentRoute.value);
  window.addEventListener('popstate', (e) => {
    if (e.state && e.state.path) currentRoute.value = e.state.path;
  });
  window.addEventListener('auth-unauthorized', handleLogout);
});

onUnmounted(() => {
  window.removeEventListener('auth-unauthorized', handleLogout);
});
</script>

<template>
  <!-- Full-screen initialization splash: prevents any dashboard flash before role is loaded -->
  <div v-if="isAuthenticating" class="fixed inset-0 flex flex-col items-center justify-center bg-background dark:bg-dark-background text-foreground dark:text-white z-50">
    <div class="w-12 h-12 rounded-2xl bg-secondary/15 border border-secondary/30 flex items-center justify-center mb-4 shadow-sm">
      <Loader2 class="w-6 h-6 animate-spin text-secondary" />
    </div>
    <span class="text-xs font-mono tracking-widest uppercase text-secondary font-semibold">INITIALIZING PORTAL...</span>
  </div>

  <div v-else-if="!isAuthenticated">
    <Login v-if="activeAuthView === 'login'" @login-success="handleLoginSuccess"
           @switch-to-register="activeAuthView = 'register'" />
           
    <Register v-else 
              @register-success="handleRegisterSuccess" 
              @switch-to-login="activeAuthView = 'login'" />
  </div>

  <div v-else class="flex h-screen h-[100dvh] w-full overflow-hidden bg-background text-foreground dark:bg-dark-background dark:text-white">
    <AdminSidebar 
      v-if="userRole === 'Admin' || userRole === 'Super Admin'"
      @navigate="handleNavigationEvent" 
      :is-mobile-open="isMobileSidebarOpen"
      @close-mobile="isMobileSidebarOpen = false"
    />
    <LecturerSidebar 
      v-else-if="userRole === 'Lecturer'"
      @navigate="handleNavigationEvent" 
      :is-mobile-open="isMobileSidebarOpen"
      @close-mobile="isMobileSidebarOpen = false"
    />
    <StudentSidebar 
      v-else-if="userRole === 'Student'"
      @navigate="handleNavigationEvent" 
      :is-mobile-open="isMobileSidebarOpen"
      @close-mobile="isMobileSidebarOpen = false"
    />
    <FinanceSidebar
      v-else-if="userRole === 'Finance'"
      @navigate="handleNavigationEvent"
      :is-mobile-open="isMobileSidebarOpen"
      @close-mobile="isMobileSidebarOpen = false"
    />
    <div class="flex flex-col flex-1 min-w-0 min-h-0 overflow-hidden">
      <Navbar @toggle-mobile-sidebar="isMobileSidebarOpen = !isMobileSidebarOpen" @logout="handleLogout" @navigate="handleNavigationEvent" />
      <main class="flex-1 p-3 sm:p-4 md:p-6 lg:p-8 xl:p-10 overflow-y-auto overflow-x-hidden min-w-0 min-h-0">
        <!-- Root path '/' dynamically renders the user's own role dashboard, never flashing admin for students/lecturers -->
        <template v-if="currentRoute === '/'">
          <Dashboard v-if="userRole === 'Admin'" @navigate="handleNavigationEvent" />
          <UsersAdmin v-else-if="userRole === 'Super Admin'" />
          <LecturerDashboard v-else-if="userRole === 'Lecturer'" @navigate="handleNavigationEvent" />
          <StudentDashboard v-else-if="userRole === 'Student'" @navigate="handleNavigationEvent" />
          <FinanceDashboard v-else-if="userRole === 'Finance'" @navigate="handleNavigationEvent" />
          <div v-else class="flex flex-col items-center justify-center py-24 text-center">
            <Loader2 class="w-8 h-8 animate-spin text-secondary mb-3" />
            <p class="text-xs font-mono text-slate-400">Loading your workspace...</p>
          </div>
        </template>
        <Dashboard v-else-if="currentRoute === '/admin-dashboard'" @navigate="handleNavigationEvent" />
        <StudentDashboard v-else-if="currentRoute === '/student-dashboard'" @navigate="handleNavigationEvent" />
        <LecturerDashboard v-else-if="currentRoute === '/lecturer-dashboard'" @navigate="handleNavigationEvent" />
        <Courses v-else-if="currentRoute === '/courses'" />
        <CourseRegistration v-else-if="currentRoute === '/registration'" />
        <MyCourses v-else-if="currentRoute === '/my-courses'" @navigate="handleNavigationEvent" />
        <LecturerCourses v-else-if="currentRoute === '/lecturer-courses'" @navigate="handleNavigationEvent" />
        <MarkAttendance v-else-if="currentRoute === '/attendance'"
          :course-id="routeParams.courseId || null"
          @navigate="handleNavigationEvent"
          @back="handleNavigationEvent('/my-courses')"
        />
        <AttendanceView v-else-if="currentRoute === '/attendance-view'" @navigate="handleNavigationEvent" />
        <CourseReports v-else-if="currentRoute === '/lecturer-reports'" />
        <AttendanceAnalytics v-else-if="currentRoute === '/attendance-analytics'" />
        <LecturerClassRepManagement v-else-if="currentRoute === '/lecturer-classrep'" />
        <Schedule v-else-if="currentRoute === '/schedule'" />
        <SemesterSetup v-else-if="currentRoute === '/semestersetup'" />
        <Faculties v-else-if="currentRoute === '/faculties'" />
        <Analytics v-else-if="currentRoute === '/analytics'" />
        <SessionAnalytics v-else-if="currentRoute === '/session-analytics'" />
        <EvaluationAdmin  v-else-if="currentRoute === '/evaluation-admin'" />
        <UsersAdmin       v-else-if="currentRoute === '/users-admin'" />
        <LecturersAdmin   v-else-if="currentRoute === '/lecturers-admin'" @navigate="handleNavigationEvent" />
        <StudentsAdmin    v-else-if="currentRoute === '/students-admin'" @navigate="handleNavigationEvent" />
        <EvaluationForm   v-else-if="currentRoute === '/evaluation'" />
        <ClassRepManagement v-else-if="currentRoute === '/classrep-management'" />
        <ClassRepDashboard  v-else-if="currentRoute === '/classrep-dashboard'" @navigate="handleNavigationEvent" />
        <SuggestionBox      v-else-if="currentRoute === '/suggestion-box'" />
        <MyTimetable        v-else-if="currentRoute === '/my-timetable'" />
        <SuggestionsAdmin   v-else-if="currentRoute === '/suggestions-admin'" />
        <FinanceDashboard   v-else-if="currentRoute === '/finance-dashboard'" @navigate="handleNavigationEvent" />
        <FinanceClaims      v-else-if="currentRoute === '/finance-claims'" />
        <Profile v-else-if="currentRoute === '/profile'" />
        <Notifications v-else-if="currentRoute === '/notifications'" />
        <div v-else class="p-8 rounded-xl shadow-md bg-surface dark:bg-dark-surface border border-outline/40 dark:border-dark-outline/40 text-slate-700 dark:text-white/90">
          <h2 class="text-xl font-bold font-display text-slate-900 dark:text-white">Page not implemented yet</h2>
          <p class="text-sm font-mono mt-1 text-slate-500 dark:text-white/75">Navigated to {{ currentRoute }}</p>
        </div>
      </main>
    </div>
  </div>
</template>
