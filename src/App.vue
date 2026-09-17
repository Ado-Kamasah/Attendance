<script setup>
import { computed, ref } from 'vue';
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
import EvaluationForm   from './Pages/Student/EvaluationForm.vue';
import ClassRepManagement from './Pages/Admin/ClassRepManagement.vue';
import ClassRepDashboard  from './Pages/Student/ClassRepDashboard.vue';
import SuggestionBox     from './Pages/Student/SuggestionBox.vue';
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
import Profile from './Pages/Profile/Profile.vue';
import Notifications from './Pages/Notifications.vue';
import { onMounted, onUnmounted } from 'vue';
import { useAuthStore } from './stores/authstore.js';

const authStore = useAuthStore();

const activeAuthView = ref('login');
const currentRoute = ref(window.location.pathname === '/' ? '/' : window.location.pathname);
const isMobileSidebarOpen = ref(false);
const isReady = ref(false); // avoid flashing the login screen while we check session

const isAuthenticated = computed(() => !!authStore.user);
const userRole = computed(() => {
  const raw = (authStore.profile?.role || 'Student').toUpperCase().replace(/[\s_-]+/g, '_');
  if (raw === 'SUPER_ADMIN' || raw === 'SUPERADMIN') return 'Super Admin';
  if (raw === 'ADMIN') return 'Admin';
  if (raw === 'LECTURER' || raw === 'STAFF') return 'Lecturer';
  if (raw === 'FINANCE') return 'Finance';
  return 'Student';
});

const handleNavigationEvent = (path) => {
  if (currentRoute.value !== path) {
    currentRoute.value = path;
    window.history.pushState({ path }, '', path);
  }
  isMobileSidebarOpen.value = false;
};

onMounted(async () => {
  await authStore.initialize(); // restores Supabase session + profile if one exists
  isReady.value = true;

  if (authStore.user && authStore.profile) {
    // Only auto-redirect if we're not already deep-linked somewhere valid
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

const redirectForRole = (role) => {
  if (role === 'Super Admin')   handleNavigationEvent('/users-admin');
  else if (role === 'Admin')    handleNavigationEvent('/');
  else if (role === 'Lecturer') handleNavigationEvent('/lecturer-dashboard');
  else if (role === 'Student')  handleNavigationEvent('/student-dashboard');
  else if (role === 'Finance')  handleNavigationEvent('/finance-dashboard');
};

const handleLoginSuccess = () => {
  // authStore.user/profile are already set by authStore.login() by the time
  // Login.vue emits this — just redirect based on the now-current role.
  redirectForRole(userRole.value);
};

const handleLogout = async () => {
  await authStore.logout();
  activeAuthView.value = 'login';
};

const handleRegisterSuccess = () => {
  activeAuthView.value = 'register' ? (activeAuthView.value = 'login') : null;
};
</script>

<template>
  <div v-if="!isReady" class="app-loading">
    <!-- spinner / splash -->
  </div>
  <div v-else-if="!isAuthenticated">
    <Login v-if="activeAuthView === 'login'" @login-success="handleLoginSuccess"
           @switch-to-register="activeAuthView = 'register'" />
           
    <Register v-else 
              @register-success="handleRegisterSuccess" 
              @switch-to-login="activeAuthView = 'login'" />
  </div>

  <div v-else class="flex h-screen w-full overflow-hidden bg-background text-foreground dark:bg-dark-background dark:text-dark-foreground">
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
      <main class="flex-1 p-4 md:p-8 overflow-y-auto overflow-x-hidden min-w-0 min-h-0">
        <Dashboard v-if="currentRoute === '/'" @navigate="handleNavigationEvent" />
        <StudentDashboard v-else-if="currentRoute === '/student-dashboard'" @navigate="handleNavigationEvent" />
        <LecturerDashboard v-else-if="currentRoute === '/lecturer-dashboard'" @navigate="handleNavigationEvent" />
        <Courses v-else-if="currentRoute === '/courses'" />
        <CourseRegistration v-else-if="currentRoute === '/registration'" />
        <MyCourses v-else-if="currentRoute === '/my-courses'" @navigate="handleNavigationEvent" />
        <LecturerCourses v-else-if="currentRoute === '/lecturer-courses'" @navigate="handleNavigationEvent" />
        <MarkAttendance v-else-if="currentRoute === '/attendance'" />
        <AttendanceView v-else-if="currentRoute === '/attendance-view'" @navigate="handleNavigationEvent" />
        <CourseReports v-else-if="currentRoute === '/lecturer-reports'" />
        <AttendanceAnalytics v-else-if="currentRoute === '/attendance-analytics'" />
        <Schedule v-else-if="currentRoute === '/schedule'" />
        <SemesterSetup v-else-if="currentRoute === '/semestersetup'" />
        <Faculties v-else-if="currentRoute === '/faculties'" />
        <Analytics v-else-if="currentRoute === '/analytics'" />
        <SessionAnalytics v-else-if="currentRoute === '/session-analytics'" />
        <EvaluationAdmin  v-else-if="currentRoute === '/evaluation-admin'" />
        <UsersAdmin       v-else-if="currentRoute === '/users-admin'" />
        <EvaluationForm   v-else-if="currentRoute === '/evaluation'" />
        <ClassRepManagement v-else-if="currentRoute === '/classrep-management'" />
        <ClassRepDashboard  v-else-if="currentRoute === '/classrep-dashboard'" />
        <SuggestionBox      v-else-if="currentRoute === '/suggestion-box'" />
        <SuggestionsAdmin   v-else-if="currentRoute === '/suggestions-admin'" />
        <FinanceDashboard   v-else-if="currentRoute === '/finance-dashboard'" @navigate="handleNavigationEvent" />
        <FinanceClaims      v-else-if="currentRoute === '/finance-claims'" />
        <Profile v-else-if="currentRoute === '/profile'" />
        <Notifications v-else-if="currentRoute === '/notifications'" />
        <div v-else class="p-8 rounded-xl shadow-md bg-surface dark:bg-dark-surface border border-outline/40 dark:border-dark-outline/40 text-slate-700 dark:text-slate-300">
          <h2 class="text-xl font-bold font-display text-slate-900 dark:text-white">Page not implemented yet</h2>
          <p class="text-sm font-mono mt-1 text-slate-500 dark:text-slate-400">Navigated to {{ currentRoute }}</p>
        </div>
      </main>
    </div>
  </div>
</template>
