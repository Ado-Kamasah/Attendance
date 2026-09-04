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
            <h2 class="logo-text secondary-text">FINANCE OFFICE</h2>
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
        <div class="user-profile" @click="navigate('/profile')">
          <div class="avatar">
            <img :src="`https://ui-avatars.com/api/?name=${encodeURIComponent(userName)}&background=0ea5e9&color=fff`" alt="User Avatar" />
          </div>
          <div class="user-info" v-if="!isCollapsed">
            <p class="user-name">{{ userName }}</p>
            <p class="user-role">Finance Officer</p>
          </div>
        </div>
      </div>
    </aside>
  </div>
</template>

<script>
import { useAuthStore } from '@/stores/authstore';
import { computed, ref } from 'vue';

export default {
  name: 'FinanceSidebar',
  props: { isMobileOpen: { type: Boolean, default: false } },
  emits: ['navigate', 'close-mobile'],
  setup(_, { emit }) {
    const authStore   = useAuthStore();
    const isCollapsed = ref(false);
    const activeRoute = ref(window.location.pathname || '/finance-dashboard');

    const userName = computed(() => authStore.profile?.name || 'Finance Officer');

    const toggleSidebar = () => { isCollapsed.value = !isCollapsed.value; };
    const navigate = (path) => {
      activeRoute.value = path;
      emit('navigate', path);
    };

    const navGroups = [
      {
        label: 'Main',
        items: [
          {
            name: 'Dashboard',
            path: '/finance-dashboard',
            icon: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/></svg>`
          },
        ]
      },
      {
        label: 'Claims',
        items: [
          {
            name: 'Lecturer Claims',
            path: '/finance-claims',
            icon: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/></svg>`
          },
        ]
      },
      {
        label: 'Account',
        items: [
          {
            name: 'My Profile',
            path: '/profile',
            icon: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>`
          },
        ]
      }
    ];

    return { isCollapsed, activeRoute, userName, toggleSidebar, navigate, navGroups };
  }
};
</script>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap');

.sidebar-wrapper { position: relative; z-index: 1000; height: 100%; }
.mobile-overlay  { display: none; }

.sidebar {
  width: 260px;
  height: 100%;
  background: linear-gradient(180deg, #0c1220 0%, #0f172a 50%, #0c1220 100%);
  display: flex;
  flex-direction: column;
  transition: width 0.3s cubic-bezier(0.4,0,0.2,1);
  overflow: hidden;
  border-right: 1px solid rgba(255,255,255,0.05);
  position: relative;
}
.sidebar::before {
  content: '';
  position: absolute;
  top: 0; left: 0; right: 0;
  height: 200px;
  background: linear-gradient(180deg, rgba(14,165,233,0.08) 0%, transparent 100%);
  pointer-events: none;
}
.sidebar.is-collapsed { width: 70px; }

/* Header */
.sidebar-header { display: flex; align-items: center; justify-content: space-between; padding: 1.25rem 1rem; border-bottom: 1px solid rgba(255,255,255,0.06); min-height: 70px; }
.logo-container  { display: flex; align-items: center; gap: 0.75rem; overflow: hidden; }
.logo-icon       { width: 36px; height: 36px; background: linear-gradient(135deg,#0ea5e9,#0284c7); border-radius: 10px; display: flex; align-items: center; justify-content: center; flex-shrink: 0; }
.logo-icon svg   { width: 20px; height: 20px; color: white; }
.logo-text-wrapper { overflow: hidden; }
.logo-text       { margin: 0; line-height: 1.1; white-space: nowrap; }
.primary-text    { font-size: 0.8rem; font-weight: 800; color: #f1f5f9; letter-spacing: 0.08em; }
.secondary-text  { font-size: 0.6rem; font-weight: 600; color: #0ea5e9; letter-spacing: 0.12em; }
.toggle-btn      { background: rgba(255,255,255,0.05); border: 1px solid rgba(255,255,255,0.1); color: #94a3b8; border-radius: 8px; padding: 0.35rem; cursor: pointer; display: flex; align-items: center; flex-shrink: 0; transition: all 0.2s; }
.toggle-btn:hover{ background: rgba(255,255,255,0.1); color: #f1f5f9; }
.toggle-btn svg  { width: 16px; height: 16px; }

/* Nav */
.sidebar-nav   { flex: 1; overflow-y: auto; padding: 0.75rem 0; scrollbar-width: none; }
.sidebar-nav::-webkit-scrollbar { display: none; }
.nav-group     { margin-bottom: 0.25rem; }
.group-label   { font-size: 0.62rem; font-weight: 700; color: #475569; text-transform: uppercase; letter-spacing: 0.1em; padding: 0.75rem 1.25rem 0.35rem; margin: 0; }
.group-divider { height: 1px; background: rgba(255,255,255,0.06); margin: 0.5rem 0.75rem; }
.nav-list      { list-style: none; margin: 0; padding: 0 0.5rem; }
.nav-item      { margin-bottom: 2px; }
.nav-link      { display: flex; align-items: center; gap: 0.75rem; padding: 0.6rem 0.75rem; border-radius: 10px; text-decoration: none; color: #94a3b8; font-size: 0.875rem; font-weight: 500; transition: all 0.2s; position: relative; white-space: nowrap; }
.nav-link:hover{ background: rgba(255,255,255,0.05); color: #e2e8f0; }
.nav-link.active{ background: linear-gradient(135deg,rgba(14,165,233,0.2),rgba(2,132,199,0.15)); color: #38bdf8; border: 1px solid rgba(14,165,233,0.2); }
.nav-icon      { width: 20px; height: 20px; display: flex; align-items: center; justify-content: center; flex-shrink: 0; }
.nav-icon :deep(svg) { width: 18px; height: 18px; }
.nav-text      { font-family: 'Inter', sans-serif; }
.tooltip       { display: none; position: absolute; left: calc(100% + 10px); background: #1e293b; color: #f1f5f9; padding: 0.35rem 0.75rem; border-radius: 8px; font-size: 0.8rem; white-space: nowrap; border: 1px solid rgba(255,255,255,0.1); z-index: 100; pointer-events: none; }
.nav-item:hover .tooltip { display: block; }

/* Footer */
.sidebar-footer { padding: 0.75rem; border-top: 1px solid rgba(255,255,255,0.06); }
.user-profile   { display: flex; align-items: center; gap: 0.75rem; padding: 0.5rem 0.25rem; border-radius: 10px; cursor: pointer; transition: background 0.2s; }
.user-profile:hover { background: rgba(255,255,255,0.05); }
.avatar         { width: 36px; height: 36px; border-radius: 10px; overflow: hidden; flex-shrink: 0; }
.avatar img     { width: 100%; height: 100%; object-fit: cover; }
.user-info      { overflow: hidden; }
.user-name      { margin: 0; font-size: 0.82rem; font-weight: 600; color: #e2e8f0; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.user-role      { margin: 0; font-size: 0.68rem; color: #0ea5e9; font-weight: 600; }

/* Mobile */
@media (max-width: 768px) {
  .sidebar-wrapper { position: fixed; top: 0; left: 0; bottom: 0; transform: translateX(-100%); transition: transform 0.3s ease; }
  .sidebar-wrapper.mobile-open { transform: translateX(0); }
  .sidebar-wrapper.mobile-open .mobile-overlay { display: block; position: fixed; inset: 0; background: rgba(0,0,0,0.5); z-index: -1; }
  .sidebar { width: 260px !important; }
}
</style>
