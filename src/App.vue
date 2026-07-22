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
import AdminSidebar from './USERS_ROLES/admin.vue';
import LecturerSidebar from './USERS_ROLES/lecturers.vue';
import StudentSidebar from './USERS_ROLES/students.vue';
import LecturerDashboard from './Pages/Lecturers/lecturerDashboard.vue';
import LecturerCourses from './Pages/Lecturers/MyCourses.vue';
import AttendanceView from './Pages/Lecturers/Attendanceview.vue';
import CourseReports from './Pages/Lecturers/CourseReports.vue';
import Profile from './Pages/Profile/Profile.vue';
import { onMounted, onUnmounted } from 'vue';
import { useAuthStore } from './stores/authstore.js';

const authStore = useAuthStore();

const activeAuthView = ref('login');
const currentRoute = ref(window.location.pathname === '/' ? '/' : window.location.pathname);
const isMobileSidebarOpen = ref(false);
const isReady = ref(false); // avoid flashing the login screen while we check session

const isAuthenticated = computed(() => !!authStore.user);
const userRole = computed(() => {
  const raw = authStore.profile?.role || 'Student';
  return raw.charAt(0).toUpperCase() + raw.slice(1).toLowerCase();
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
  if (role === 'Admin') handleNavigationEvent('/');
  else if (role === 'Lecturer') handleNavigationEvent('/lecturer-dashboard');
  else if (role === 'Student') handleNavigationEvent('/student-dashboard');
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

  <div v-else class="app-layout">
    <AdminSidebar 
      v-if="userRole === 'Admin'"
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
    <div class="main-wrapper">
      <Navbar @toggle-mobile-sidebar="isMobileSidebarOpen = !isMobileSidebarOpen" @logout="handleLogout" />
      <main class="main-content">
        <Dashboard v-if="currentRoute === '/'" />
        <StudentDashboard v-else-if="currentRoute === '/student-dashboard'" @navigate="handleNavigationEvent" />
        <LecturerDashboard v-else-if="currentRoute === '/lecturer-dashboard'" @navigate="handleNavigationEvent" />
        <Courses v-else-if="currentRoute === '/courses'" />
        <CourseRegistration v-else-if="currentRoute === '/registration'" />
        <MyCourses v-else-if="currentRoute === '/my-courses'" @navigate="handleNavigationEvent" />
        <LecturerCourses v-else-if="currentRoute === '/lecturer-courses'" @navigate="handleNavigationEvent" />
        <MarkAttendance v-else-if="currentRoute === '/attendance'" />
        <AttendanceView v-else-if="currentRoute === '/attendance-view'" @navigate="handleNavigationEvent" />
        <CourseReports v-else-if="currentRoute === '/lecturer-reports'" />
        <Schedule v-else-if="currentRoute === '/schedule'" />
        <SemesterSetup v-else-if="currentRoute === '/semestersetup'" />
        <Faculties v-else-if="currentRoute === '/faculties'" />
        <Profile v-else-if="currentRoute === '/profile'" />
        <div v-else class="content-placeholder">
          <h2>Page not implemented yet</h2>
          <p>Navigated to {{ currentRoute }}</p>
        </div>
      </main>
    </div>
  </div>
</template>

<style>
/* Reset basic margins so the app takes full screen */
html, body, #app {
  margin: 0;
  padding: 0;
  height: 100%;
  width: 100%;
  font-family: 'Inter', sans-serif;
  background-color: #f1f5f9; /* Light background for the main content area */
}

/* Base structural layout for the entire app */
.app-layout {
  display: flex;
  height: 100vh;
  width: 100%;
  overflow: hidden;
}

.main-wrapper {
  display: flex;
  flex-direction: column;
  flex: 1;
  min-width: 0;
  overflow-x: hidden;
}

.main-content {
  flex: 1;
  padding: 2rem;
  overflow-y: auto;
  overflow-x: hidden;
  min-width: 0;
}

@media (max-width: 768px) {
  .main-content {
    padding: 1rem;
  }
}

.content-placeholder {
  background-color: #ffffff;
  padding: 2rem;
  border-radius: 12px;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
  color: #334155;
}

.content-placeholder h2 {
  margin-top: 0;
  color: #0f172a;
}
</style>
