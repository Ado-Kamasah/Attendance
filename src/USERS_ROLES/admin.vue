<template>
  <div class="sidebar-wrapper" :class="{ 'mobile-open': isMobileOpen }">
    <div class="mobile-overlay" @click="$emit('close-mobile')"></div>
    <aside class="sidebar" :class="{ 'is-collapsed': isCollapsed }">
      <div class="sidebar-header">
        <div class="logo-container">
          <div class="logo-icon">
            <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M12 2L2 7L12 12L22 7L12 2Z" fill="currentColor" />
              <path d="M2 17L12 22L22 17" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
              <path d="M2 12L12 17L22 12" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
            </svg>
          </div>
          <div class="logo-text-wrapper" v-if="!isCollapsed">
            <h1 class="logo-text primary-text">SOUTHSHORE</h1>
            <h2 class="logo-text secondary-text">ADMINISTRATION</h2>
          </div>
        </div>
        <button class="toggle-btn" @click="toggleSidebar" aria-label="Toggle Sidebar">
          <svg v-if="!isCollapsed" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M15 18l-6-6 6-6" stroke-linecap="round" stroke-linejoin="round" />
          </svg>
          <svg v-else viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M9 18l6-6-6-6" stroke-linecap="round" stroke-linejoin="round" />
          </svg>
        </button>
      </div>

      <nav class="sidebar-nav">
        <div v-for="(group, index) in navGroups" :key="index" class="nav-group">
          <h3 class="group-label" v-if="!isCollapsed">{{ group.label }}</h3>
          <div class="group-divider" v-else></div>
          
          <ul class="nav-list">
            <li v-for="item in group.items" :key="item.name" class="nav-item">
              <a :href="item.path" class="nav-link" :class="{ 'active': activeRoute === item.path }" @click.prevent="navigate(item.path)">
                <span class="nav-icon" v-html="item.icon"></span>
                <span class="nav-text" v-if="!isCollapsed">{{ item.name }}</span>
                <div class="tooltip" v-if="isCollapsed">{{ item.name }}</div>
              </a>
            </li>
          </ul>
        </div>
      </nav>

      <div class="sidebar-footer">
        <div class="user-profile">
          <div class="avatar">
            <img src="https://ui-avatars.com/api/?name=Ad+Min&background=ef4444&color=fff" alt="User Avatar" />
          </div>
          <div class="user-info" v-if="!isCollapsed">
            <p class="user-name">Administrator</p>
            <p class="user-role">Super Admin</p>
          </div>
        </div>
      </div>
    </aside>
  </div>
</template>

<script setup>
import { ref } from 'vue';

const props = defineProps({
  isMobileOpen: {
    type: Boolean,
    default: false
  }
});

const isCollapsed = ref(false);
const activeRoute = ref('/');

const emit = defineEmits(['navigate', 'close-mobile']);

const toggleSidebar = () => {
  isCollapsed.value = !isCollapsed.value;
};

const navigate = (path) => {
  activeRoute.value = path;
  emit('navigate', path);
};

const navGroups = [
  {
    label: 'CORE ADMINISTRATION',
    items: [
      {
        name: 'Dashboard',
        path: '/',
        icon: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="7" height="9"></rect><rect x="14" y="3" width="7" height="5"></rect><rect x="14" y="12" width="7" height="9"></rect><rect x="3" y="16" width="7" height="5"></rect></svg>`
      },
      {
        name: 'Semester Setup',
        path: '/semestersetup',
        icon: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="3"></circle><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"></path></svg>`
      },
      {
        name: 'Courses',
        path: '/courses',
        icon: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"></path><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"></path></svg>`
      },
      {
        name: 'Schedule',
        path: '/schedule',
        icon: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect><line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" y2="6"></line><line x1="3" y1="10" x2="21" y2="10"></line></svg>`
      },
      {
        name: 'Faculties',
        path: '/faculties',
        icon: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"></path><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"></path><path d="M10 6h4M10 10h4"></path></svg>`
      }
    ]
  }
];
</script>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap');

.sidebar-wrapper {
  position: relative;
  z-index: 1000;
  height: 100%;
}

.mobile-overlay {
  display: none;
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  background-color: rgba(15, 23, 42, 0.4);
  backdrop-filter: blur(4px);
  z-index: 900;
  opacity: 0;
  transition: opacity 0.3s ease;
}

.sidebar {
  font-family: 'Inter', sans-serif;
  width: 290px;
  height: 100%;
  background-color: #0f172a;
  color: #f8fafc;
  display: flex;
  flex-direction: column;
  transition: width 0.4s cubic-bezier(0.2, 0.8, 0.2, 1), transform 0.4s cubic-bezier(0.2, 0.8, 0.2, 1);
  box-shadow: 4px 0 24px rgba(0, 0, 0, 0.15);
  position: relative;
  overflow: visible;
  z-index: 1000;
}

.sidebar.is-collapsed {
  width: 84px;
}

.sidebar-header {
  padding: 24px 20px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  border-bottom: 1px solid rgba(255, 255, 255, 0.05);
}

.logo-container {
  display: flex;
  align-items: center;
  gap: 12px;
  overflow: hidden;
}

.logo-icon {
  width: 34px;
  height: 34px;
  min-width: 34px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #ef4444; /* Admin Red */
  background: rgba(239, 68, 68, 0.1);
  border-radius: 8px;
  padding: 6px;
}

.logo-icon svg {
  width: 100%;
  height: 100%;
}

.logo-text-wrapper {
  display: flex;
  flex-direction: column;
  animation: fadeIn 0.3s ease forwards;
}

.logo-text {
  margin: 0;
  white-space: nowrap;
}

.primary-text {
  font-size: 1.05rem;
  font-weight: 800;
  letter-spacing: 0.05em;
  color: #ffffff;
  line-height: 1.1;
}

.secondary-text {
  font-size: 0.65rem;
  font-weight: 500;
  letter-spacing: 0.08em;
  color: #ef4444;
  line-height: 1.1;
  text-transform: uppercase;
  margin-top: 2px;
}

@keyframes fadeIn {
  from { opacity: 0; transform: translateX(-10px); }
  to { opacity: 1; transform: translateX(0); }
}

.toggle-btn {
  background: rgba(255, 255, 255, 0.05);
  border: none;
  border-radius: 8px;
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #94a3b8;
  cursor: pointer;
  transition: all 0.2s ease;
  flex-shrink: 0;
}

.toggle-btn:hover {
  background: rgba(255, 255, 255, 0.1);
  color: #ffffff;
}

.sidebar.is-collapsed .sidebar-header {
  padding: 24px 0;
  flex-direction: column;
  gap: 20px;
}

.sidebar.is-collapsed .logo-container {
  justify-content: center;
}

.sidebar-nav {
  flex: 1;
  padding: 16px;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  gap: 24px;
}

/* Hide scrollbar */
.sidebar-nav::-webkit-scrollbar {
  width: 4px;
}
.sidebar-nav::-webkit-scrollbar-thumb {
  background: rgba(255, 255, 255, 0.1);
  border-radius: 4px;
}

.nav-group {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.group-label {
  margin: 0 0 4px 8px;
  font-size: 0.65rem;
  font-weight: 700;
  color: #64748b;
  letter-spacing: 0.1em;
  text-transform: uppercase;
}

.group-divider {
  height: 1px;
  background-color: rgba(255, 255, 255, 0.05);
  margin: 8px 12px;
}

.nav-list {
  list-style: none;
  padding: 0;
  margin: 0;
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.nav-item {
  position: relative;
}

.nav-link {
  display: flex;
  align-items: center;
  gap: 14px;
  padding: 10px 14px;
  border-radius: 10px;
  color: #94a3b8;
  text-decoration: none;
  font-weight: 500;
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
  position: relative;
  overflow: hidden;
}

.sidebar.is-collapsed .nav-link {
  padding: 12px;
  justify-content: center;
}

.nav-link:hover {
  color: #ffffff;
  background-color: rgba(239, 68, 68, 0.08);
}

.nav-link.active {
  color: #ffffff;
  background-color: #ef4444;
  box-shadow: 0 4px 12px rgba(239, 68, 68, 0.3);
}

.nav-icon {
  width: 20px;
  height: 20px;
  min-width: 20px;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: transform 0.3s ease;
}

.nav-link:hover .nav-icon {
  transform: scale(1.1);
}

.nav-text {
  white-space: nowrap;
  font-size: 0.9rem;
}

.tooltip {
  position: absolute;
  left: 100%;
  top: 50%;
  transform: translateY(-50%) translateX(10px);
  background-color: #1e293b;
  color: #ffffff;
  padding: 6px 12px;
  border-radius: 6px;
  font-size: 0.85rem;
  font-weight: 500;
  white-space: nowrap;
  opacity: 0;
  visibility: hidden;
  transition: all 0.2s ease;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  pointer-events: none;
  z-index: 1000;
}

.tooltip::before {
  content: '';
  position: absolute;
  left: -4px;
  top: 50%;
  transform: translateY(-50%);
  border-width: 5px 5px 5px 0;
  border-style: solid;
  border-color: transparent #1e293b transparent transparent;
}

.nav-link:hover .tooltip {
  opacity: 1;
  visibility: visible;
  transform: translateY(-50%) translateX(20px);
}

.sidebar-footer {
  padding: 24px 20px;
  border-top: 1px solid rgba(255, 255, 255, 0.05);
  transition: all 0.3s ease;
}

.sidebar.is-collapsed .sidebar-footer {
  padding: 24px 12px;
}

.user-profile {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 8px;
  border-radius: 12px;
  cursor: pointer;
  transition: background-color 0.2s ease;
}

.sidebar.is-collapsed .user-profile {
  justify-content: center;
}

.user-profile:hover {
  background-color: rgba(255, 255, 255, 0.05);
}

.avatar {
  width: 38px;
  height: 38px;
  min-width: 38px;
  border-radius: 10px;
  overflow: hidden;
  border: 2px solid #334155;
  transition: border-color 0.3s ease;
}

.user-profile:hover .avatar {
  border-color: #ef4444;
}

.avatar img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.user-info {
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.user-name {
  margin: 0;
  font-size: 0.9rem;
  font-weight: 600;
  color: #f8fafc;
  white-space: nowrap;
  text-overflow: ellipsis;
  overflow: hidden;
}

.user-role {
  margin: 0;
  font-size: 0.75rem;
  color: #94a3b8;
  white-space: nowrap;
}

/* Responsiveness */
@media (max-width: 768px) {
  .sidebar {
    position: fixed;
    top: 0;
    left: 0;
    transform: translateX(-100%);
    width: 280px;
  }
  
  .sidebar.is-collapsed {
    width: 280px; /* Disable collapsing on mobile to keep it simple */
  }

  .toggle-btn {
    display: none; /* Hide collapse btn on mobile since it works as off-canvas */
  }

  .sidebar-wrapper.mobile-open .sidebar {
    transform: translateX(0);
  }

  .sidebar-wrapper.mobile-open .mobile-overlay {
    display: block;
    opacity: 1;
  }
}
</style>
