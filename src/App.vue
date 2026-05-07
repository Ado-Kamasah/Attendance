<script setup>
import { ref } from 'vue';
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
import AdminSidebar from './USERS_ROLES/admin.vue';
import LecturerSidebar from './USERS_ROLES/lecturers.vue';
import StudentSidebar from './USERS_ROLES/students.vue';
import LecturerDashboard from './Pages/Lecturers/lecturerDashboard.vue';
import LecturerCourses from './Pages/Lecturers/MyCourses.vue';
import AttendanceView from './Pages/Lecturers/Attendanceview.vue';
import { onMounted, onUnmounted } from 'vue';
import { currentUserId, currentUserProgram } from './store.js';

const isAuthenticated = ref(false);
const activeAuthView = ref('login'); // 'login' or 'register'
const currentRoute = ref(window.location.pathname === '/' ? '/' : window.location.pathname);
const userRole = ref('Admin');
const isMobileSidebarOpen = ref(false);

const handleNavigationEvent = (path) => {
  if (currentRoute.value !== path) {
    currentRoute.value = path;
    window.history.pushState({ path }, '', path);
  }
  isMobileSidebarOpen.value = false; // Always close mobile menu on nav
};

onMounted(() => {
  // Push initial state so back button works out of the gate
  window.history.replaceState({ path: currentRoute.value }, '', currentRoute.value);
  
  window.addEventListener('popstate', (e) => {
    if (e.state && e.state.path) {
      currentRoute.value = e.state.path;
    }
  });
});

const handleLoginSuccess = (userPayload) => {
  isAuthenticated.value = true;
  userRole.value = userPayload.role;
  
  if (userRole.value === 'Admin') {
    handleNavigationEvent('/');
  } else if (userRole.value === 'Lecturer') {
    handleNavigationEvent('/lecturer-dashboard');
  } else if (userRole.value === 'Student') {
    currentUserId.value = userPayload.loginId || '';
    
    // Determine the program based on the ID prefix
    const idUpper = currentUserId.value.toUpperCase();
    if (idUpper.startsWith('BSC/CSM/')) {
      currentUserProgram.value = 'Computer Science';
    } else if (idUpper.startsWith('BBA/')) {
      currentUserProgram.value = 'Business';
    } else {
      currentUserProgram.value = 'Unknown';
    }

    handleNavigationEvent('/student-dashboard');
  }
};

const handleLogout = () => {
  isAuthenticated.value = false;
  activeAuthView.value = 'login';
};

const handleRegisterSuccess = (userPayload) => {
  console.log("Registered:", userPayload);
  isAuthenticated.value = true;
};
</script>

<template>
  <div v-if="!isAuthenticated">
    <Login v-if="activeAuthView === 'login'" 
           @login-success="handleLoginSuccess" 
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
        <Schedule v-else-if="currentRoute === '/schedule'" />
        <SemesterSetup v-else-if="currentRoute === '/semestersetup'" />
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
