<template>
  <header class="navbar">
    <div class="navbar-left">
      <button class="mobile-toggle-btn" @click="$emit('toggle-mobile-sidebar')" aria-label="Open Menu">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <line x1="3" y1="12" x2="21" y2="12"></line>
          <line x1="3" y1="6" x2="21" y2="6"></line>
          <line x1="3" y1="18" x2="21" y2="18"></line>
        </svg>
      </button>
      <div class="greeting">
        <h2 class="greeting-text">Welcome back, <span class="greeting-name">{{ firstName }}</span></h2>
        <p class="greeting-subtext">{{ roleBadge }}</p>
      </div>
    </div>

    <div class="navbar-right">
      <div class="search-container">
        <svg class="search-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <circle cx="11" cy="11" r="8"></circle>
          <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
        </svg>
        <input type="text" class="search-input" placeholder="Search courses, schedules..." />
      </div>

      <div class="action-buttons">
        <div class="dropdown-wrapper">
          <button class="icon-button" :class="{'active-btn': showNotifications}" aria-label="Notifications" @click="toggleNotifications">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"></path>
              <path d="M13.73 21a2 2 0 0 1-3.46 0"></path>
            </svg>
            <span class="notification-badge" v-if="unreadCount > 0">{{ unreadCount }}</span>
          </button>
          
          <div class="dropdown-panel notifications-panel" v-if="showNotifications">
            <div class="panel-header">
              <h3>Notifications</h3>
              <button class="text-link" @click="markAllRead" v-if="unreadCount > 0">Mark read</button>
            </div>
            <div class="panel-body list-body">
              <div v-if="isLoadingLogs" class="empty-state">Loading…</div>
              <div v-else-if="recentLogs.length === 0" class="empty-state">No notifications yet.</div>
              <div
                v-for="notif in recentLogs"
                :key="notif.id"
                class="notif-item"
                :class="{ 'is-unread': !readIds.has(notif.id), [`notif-${notif.typeClass}`]: true }"
              >
                <div class="notif-icon" :class="notif.typeClass">
                  <svg v-if="notif.typeClass === 'type-created'" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
                  <svg v-else-if="notif.typeClass === 'type-deleted'" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>
                  <svg v-else-if="notif.typeClass === 'type-updated'" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
                  <svg v-else-if="notif.typeClass === 'type-conflict'" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polygon points="7.86 2 16.14 2 22 7.86 22 16.14 16.14 22 7.86 22 2 16.14 2 7.86 7.86 2"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
                  <svg v-else viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
                </div>
                <div class="notif-content">
                  <p class="notif-action">{{ notif.actionLabel }}</p>
                  <p class="notif-detail">{{ notif.details }}</p>
                  <span class="notif-time">{{ notif.relativeTime }} &bull; {{ notif.userName }}</span>
                </div>
              </div>
            </div>
            <div class="panel-footer">
              <button class="block-btn" @click="goToNotifications">View All Notifications</button>
            </div>
          </div>
        </div>

        <div class="dropdown-wrapper">
          <button class="icon-button" :class="{'active-btn': showSettings}" aria-label="Settings" @click="toggleSettings">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <circle cx="12" cy="12" r="3"></circle>
              <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"></path>
            </svg>
          </button>
          
          <div class="dropdown-panel settings-panel" v-if="showSettings">
            <div class="panel-header">
              <h3>Preferences</h3>
            </div>
            <div class="panel-body">
               <div class="setting-row">
                 <span>Theme</span>
                 <select v-model="userSettings.theme" class="setting-select">
                   <option value="Light">Light</option>
                   <option value="Dark">Dark</option>
                 </select>
               </div>
               <div class="setting-row">
                 <span>Language</span>
                 <select v-model="userSettings.language" class="setting-select">
                   <option value="English">English</option>
                 </select>
               </div>
               <div class="setting-row toggle-row">
                 <span>Email Alerts</span>
                 <label class="switch">
                   <input type="checkbox" v-model="userSettings.emailAlerts">
                   <span class="slider round"></span>
                 </label>
               </div>
               <div class="setting-row toggle-row">
                 <span>SMS Alerts</span>
                 <label class="switch">
                   <input type="checkbox" v-model="userSettings.smsAlerts">
                   <span class="slider round"></span>
                 </label>
               </div>
            </div>
            <div class="panel-footer">
              <button class="block-btn" @click="saveSettings">Save Options</button>
            </div>
          </div>
        </div>

        <div class="divider"></div>

        <button class="icon-button logout-btn" aria-label="Logout" @click="$emit('logout')" title="Log Out">
          <svg viewBox="0 0 24 24" fill="none" class="logout-icon" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path>
            <polyline points="16 17 21 12 16 7"></polyline>
            <line x1="21" y1="12" x2="9" y2="12"></line>
          </svg>
        </button>
      </div>
    </div>
  </header>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue';
import { storeToRefs } from 'pinia';
import { useAuditLogsStore } from '@/stores/auditlogs';
import { useAuthStore } from '@/stores/authstore';

const emit = defineEmits(['toggle-mobile-sidebar', 'logout', 'navigate']);

const auditStore = useAuditLogsStore();
const authStore = useAuthStore();
const { logs, isLoading: isLoadingLogs } = storeToRefs(auditStore);
const { profile } = storeToRefs(authStore);

const showNotifications = ref(false);
const showSettings = ref(false);

// ── User info ──────────────────────────────────────────────────────────────
const firstName = computed(() => {
  const name = profile.value?.name || 'User';
  return name.split(' ')[0];
});
const roleBadge = computed(() => {
  const role = profile.value?.role || '';
  if (role === 'Admin')    return '🛡️ Administrator';
  if (role === 'Lecturer') return '🏫 Lecturer';
  if (role === 'Student')  return '📚 Student';
  return role;
});

// ── Audit log → notifications ─────────────────────────────────────────────
const readIds = ref(new Set());

// Role-based slice
const visibleLogs = computed(() => {
  const role = profile.value?.role;
  const uid  = profile.value?.id;
  if (role === 'Admin') return logs.value;
  if (role === 'Lecturer') return logs.value.filter(l => l.userId === uid);
  // Students: schedule notifications only
  return logs.value.filter(l =>
    ['schedule_created', 'schedule_updated', 'schedule_deleted'].includes(l.action)
  );
});

const recentLogs = computed(() =>
  visibleLogs.value.slice(0, 8).map(l => ({
    id: l.id,
    actionLabel: l.action.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase()),
    typeClass: actionTypeClass(l.action),
    details: l.details || '—',
    userName: l.userName || 'System',
    relativeTime: relTime(l.timestamp),
  }))
);

const unreadCount = computed(() =>
  recentLogs.value.filter(n => !readIds.value.has(n.id)).length
);

function actionTypeClass(action) {
  if (action.includes('created'))  return 'type-created';
  if (action.includes('deleted'))  return 'type-deleted';
  if (action.includes('updated'))  return 'type-updated';
  if (action.includes('conflict')) return 'type-conflict';
  if (action.includes('failed'))   return 'type-failed';
  return 'type-info';
}

function relTime(ts) {
  if (!ts) return '';
  const diff = Date.now() - new Date(ts).getTime();
  const m = Math.floor(diff / 60000);
  const h = Math.floor(diff / 3600000);
  const d = Math.floor(diff / 86400000);
  if (m < 1)  return 'just now';
  if (m < 60) return `${m}m ago`;
  if (h < 24) return `${h}h ago`;
  return `${d}d ago`;
}

const toggleNotifications = () => {
  showNotifications.value = !showNotifications.value;
  if (showNotifications.value) {
    showSettings.value = false;
    // Fetch fresh logs every time the panel opens
    auditStore.fetchLogs();
  }
};

const toggleSettings = () => {
  showSettings.value = !showSettings.value;
  if (showSettings.value) showNotifications.value = false;
};

const markAllRead = () => {
  recentLogs.value.forEach(n => readIds.value.add(n.id));
};

const goToNotifications = () => {
  showNotifications.value = false;
  emit('navigate', '/notifications');
};

const userSettings = ref({
  theme: 'Light',
  language: 'English',
  emailAlerts: true,
  smsAlerts: false
});

const closeSettings = () => {
  showSettings.value = false;
};

const saveSettings = () => {
  showSettings.value = false;
  
  // Apply Theme
  if (userSettings.value.theme === 'Dark') {
    document.body.classList.add('dark-theme');
  } else {
    document.body.classList.remove('dark-theme');
  }

  // Apply Language
  document.documentElement.lang = 'en';
  alert('Your preferences have been saved successfully!');
};

const closeDropdowns = (e) => {
  if (!e.target.closest('.dropdown-wrapper')) {
    showNotifications.value = false;
    showSettings.value = false;
  }
};

onMounted(async () => {
  document.addEventListener('click', closeDropdowns);
  await auditStore.fetchLogs();
  auditStore.subscribeToLogs();
});
onUnmounted(() => {
  document.removeEventListener('click', closeDropdowns);
  auditStore.unsubscribeFromLogs();
});
</script>

<style scoped>
.navbar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem 2rem;
  background-color: #ffffff;
  border-bottom: 1px solid #e2e8f0;
  height: 80px;
  box-sizing: border-box;
  position: sticky;
  top: 0;
  z-index: 50;
  box-shadow: 0 1px 3px 0 rgba(0, 0, 0, 0.05), 0 1px 2px -1px rgba(0, 0, 0, 0.1);
}

.navbar-left {
  display: flex;
  align-items: center;
}

.greeting-text {
  font-size: 1.25rem;
  font-weight: 700;
  color: #0f172a;
  margin: 0 0 0.25rem 0;
  letter-spacing: -0.025em;
}

.greeting-subtext {
  font-size: 0.875rem;
  color: #64748b;
  margin: 0;
}

.greeting-name {
  color: #6366f1;
  font-weight: 800;
}

.navbar-right {
  display: flex;
  align-items: center;
  gap: 1.5rem;
}

.search-container {
  position: relative;
  width: 300px;
}

.search-icon {
  position: absolute;
  left: 12px;
  top: 50%;
  transform: translateY(-50%);
  width: 18px;
  height: 18px;
  color: #94a3b8;
  pointer-events: none;
}

.search-input {
  width: 100%;
  height: 40px;
  padding: 0 16px 0 40px;
  border-radius: 9999px;
  border: 1px solid #e2e8f0;
  background-color: #f8fafc;
  color: #334155;
  font-size: 0.875rem;
  outline: none;
  transition: all 0.2s ease;
  box-sizing: border-box;
}

.search-input:focus {
  background-color: #ffffff;
  border-color: #6366f1;
  box-shadow: 0 0 0 3px rgba(99, 102, 241, 0.1);
}

.search-input::placeholder {
  color: #94a3b8;
}

.action-buttons {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  border-left: 1px solid #e2e8f0;
  padding-left: 1.5rem;
}

.icon-button {
  position: relative;
  width: 40px;
  height: 40px;
  border-radius: 50%;
  border: none;
  background-color: transparent;
  color: #64748b;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.2s ease;
}

.icon-button:hover {
  background-color: #f1f5f9;
  color: #0f172a;
}

.icon-button svg {
  width: 20px;
  height: 20px;
}

.divider {
  width: 1px;
  height: 24px;
  background-color: #e2e8f0;
  margin: 0 0.25rem;
}

.logout-btn:hover {
  background-color: #fee2e2;
  color: #ef4444;
}

.logout-icon {
  transform: translateX(-1px);
}

.notification-badge {
  position: absolute;
  top: 4px;
  right: 4px;
  min-width: 14px;
  height: 14px;
  padding: 0 4px;
  background-color: #ef4444;
  color: white;
  font-size: 0.65rem;
  font-weight: 700;
  border-radius: 10px;
  border: 2px solid #ffffff;
  display: flex;
  align-items: center;
  justify-content: center;
  box-sizing: content-box;
}

/* Dropdown Base */
.dropdown-wrapper {
  position: relative;
}

.active-btn {
  background-color: #e0e7ff;
  color: #4f46e5;
}

.dropdown-panel {
  position: absolute;
  top: Calc(100% + 14px);
  right: -10px;
  width: 320px;
  background-color: #ffffff;
  border-radius: 16px;
  box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1);
  border: 1px solid #e2e8f0;
  z-index: 100;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  animation: slideDropdown 0.2s cubic-bezier(0.16, 1, 0.3, 1) forwards;
  transform-origin: top right;
}

@keyframes slideDropdown {
  0% { opacity: 0; transform: scale(0.95); }
  100% { opacity: 1; transform: scale(1); }
}

.panel-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem 1.25rem;
  border-bottom: 1px solid #f1f5f9;
  background-color: #f8fafc;
}

.panel-header h3 {
  margin: 0;
  font-size: 1rem;
  font-weight: 700;
  color: #0f172a;
}

.text-link {
  background: none;
  border: none;
  color: #6366f1;
  font-size: 0.8rem;
  font-weight: 600;
  cursor: pointer;
  padding: 0;
}

.text-link:hover {
  text-decoration: underline;
}

.panel-body {
  max-height: 300px;
  overflow-y: auto;
  padding: 0.5rem 0;
}

/* Notifications Specific */
.notif-item {
  display: flex;
  gap: 10px;
  padding: 0.75rem 1.25rem;
  border-bottom: 1px solid #f1f5f9;
  transition: background-color 0.2s;
  cursor: pointer;
  align-items: flex-start;
}

.notif-icon {
  width: 32px;
  height: 32px;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  margin-top: 2px;
}
.notif-icon svg { width: 14px; height: 14px; }
.notif-icon.type-created  { background: rgba(16,185,129,0.1); color: #10b981; }
.notif-icon.type-deleted  { background: rgba(239,68,68,0.1);  color: #ef4444; }
.notif-icon.type-updated  { background: rgba(245,158,11,0.1); color: #f59e0b; }
.notif-icon.type-conflict { background: rgba(249,115,22,0.1); color: #f97316; }
.notif-icon.type-failed   { background: rgba(220,38,38,0.1);  color: #dc2626; }
.notif-icon.type-info     { background: rgba(99,102,241,0.1); color: #6366f1; }

.notif-item:hover {
  background-color: #f8fafc;
}

.notif-item:last-child {
  border-bottom: none;
}

.is-unread {
  background-color: #f4f6ff;
}

.notif-dot {
  width: 8px;
  height: 8px;
  background-color: #6366f1;
  border-radius: 50%;
  margin-top: 6px;
  flex-shrink: 0;
}

.notif-action {
  margin: 0 0 2px 0;
  font-size: 0.8rem;
  font-weight: 700;
  color: #0f172a;
}

.notif-detail {
  margin: 0 0 4px 0;
  font-size: 0.82rem;
  color: #475569;
  line-height: 1.4;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.notif-time {
  font-size: 0.75rem;
  color: #94a3b8;
}

.empty-state {
  text-align: center;
  padding: 2rem;
  color: #94a3b8;
  font-size: 0.9rem;
}

/* Settings Specific */
.settings-panel {
  width: 260px;
}

.setting-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.75rem 1.25rem;
  font-size: 0.9rem;
  color: #334155;
  font-weight: 500;
}

.setting-select {
  padding: 0.4rem 0.5rem;
  border: 1px solid #e2e8f0;
  border-radius: 6px;
  background-color: #f8fafc;
  font-size: 0.85rem;
  color: #0f172a;
  outline: none;
  cursor: pointer;
}

/* Toggle Switch */
.switch {
  position: relative;
  display: inline-block;
  width: 36px;
  height: 20px;
}

.switch input { 
  opacity: 0;
  width: 0;
  height: 0;
}

.slider {
  position: absolute;
  cursor: pointer;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: #cbd5e1;
  transition: .2s;
}

.slider:before {
  position: absolute;
  content: "";
  height: 16px;
  width: 16px;
  left: 2px;
  bottom: 2px;
  background-color: white;
  transition: .2s;
  box-shadow: 0 2px 4px rgba(0,0,0,0.2);
}

input:checked + .slider {
  background-color: #6366f1;
}

input:checked + .slider:before {
  transform: translateX(16px);
}

.slider.round {
  border-radius: 20px;
}

.slider.round:before {
  border-radius: 50%;
}

.panel-footer {
  padding: 0.75rem 1.25rem;
  border-top: 1px solid #f1f5f9;
  background-color: #f8fafc;
}

.block-btn {
  width: 100%;
  padding: 0.6rem;
  background: white;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  color: #0f172a;
  font-size: 0.85rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
}

.block-btn:hover {
  background: #f1f5f9;
}

.mobile-toggle-btn {
  display: none;
  background: none;
  border: none;
  color: #334155;
  padding: 0.5rem;
  margin-right: 0.5rem;
  cursor: pointer;
}

.mobile-toggle-btn svg {
  width: 24px;
  height: 24px;
}

/* Responsiveness */
@media (max-width: 768px) {
  .navbar {
    padding: 1rem;
    height: 70px;
  }
  
  .mobile-toggle-btn {
    display: flex;
    align-items: center;
    justify-content: center;
  }
  
  .greeting-text {
    font-size: 1.1rem;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    display: none; /* Hide greeting to save space on mobile */
  }
  
  .greeting-subtext {
    display: none;
  }
  
  .search-container {
    display: none; /* Hide search entirely on mobile for simplicity, or collapse it */
  }
  
  .action-buttons {
    border-left: none;
    padding-left: 0;
  }
}

@media (min-width: 769px) {
  .mobile-toggle-btn {
    display: none;
  }
}

/* Global Dark Theme Mock */
:global(body.dark-theme) {
  background-color: #0f172a !important;
  color: #f1f5f9 !important;
}

:global(body.dark-theme .navbar),
:global(body.dark-theme .main-content),
:global(body.dark-theme .dashboard-container),
:global(body.dark-theme .schedule-panel),
:global(body.dark-theme .action-panel),
:global(body.dark-theme .side-panel > div),
:global(body.dark-theme .metric-card),
:global(body.dark-theme .card),
:global(body.dark-theme .course-card),
:global(body.dark-theme .panel-header),
:global(body.dark-theme .empty-state),
:global(body.dark-theme .modal-card),
:global(body.dark-theme .modal-content),
:global(body.dark-theme .content-placeholder) {
  background-color: #1e293b !important;
  border-color: #334155 !important;
  color: #f1f5f9 !important;
}

:global(body.dark-theme h1),
:global(body.dark-theme h2),
:global(body.dark-theme h3),
:global(body.dark-theme h4),
:global(body.dark-theme p),
:global(body.dark-theme span),
:global(body.dark-theme div) {
  color: #f8fafc;
}

:global(body.dark-theme .dropdown-panel) {
  background-color: #1e293b !important;
  border-color: #334155 !important;
}

:global(body.dark-theme .setting-row),
:global(body.dark-theme .notif-item) {
  border-color: #334155 !important;
}

:global(body.dark-theme .search-input),
:global(body.dark-theme .setting-select) {
  background-color: #334155 !important;
  color: #f8fafc !important;
  border-color: #475569 !important;
}
</style>
