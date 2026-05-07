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
        <h2 class="greeting-text">Welcome back</h2>
        <p class="greeting-subtext">.</p>
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
              <div v-for="notif in notifications" :key="notif.id" class="notif-item" :class="{'is-unread': notif.unread}">
                <div class="notif-dot" v-if="notif.unread"></div>
                <div class="notif-content">
                  <p>{{ notif.text }}</p>
                  <span class="notif-time">{{ notif.time }}</span>
                </div>
              </div>
              <div v-if="notifications.length === 0" class="empty-state">No new notifications.</div>
            </div>
            <div class="panel-footer">
              <button class="block-btn">View All</button>
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
                   <option value="French">Français</option>
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
              <button class="block-btn" @click="closeSettings">Save Options</button>
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

defineEmits(['toggle-mobile-sidebar', 'logout']);

const showNotifications = ref(false);
const showSettings = ref(false);

const notifications = ref([
  { id: 1, text: 'System maintenance scheduled for tonight at 2 AM.', time: '10m ago', unread: true },
  { id: 2, text: 'New course "Introduction to AI" has been added.', time: '2h ago', unread: true },
  { id: 3, text: 'Your attendance report is ready for download.', time: '1d ago', unread: false }
]);

const unreadCount = computed(() => notifications.value.filter(n => n.unread).length);

const toggleNotifications = () => {
  showNotifications.value = !showNotifications.value;
  if (showNotifications.value) showSettings.value = false;
};

const toggleSettings = () => {
  showSettings.value = !showSettings.value;
  if (showSettings.value) showNotifications.value = false;
};

const markAllRead = () => {
  notifications.value.forEach(n => n.unread = false);
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

const closeDropdowns = (e) => {
  if (!e.target.closest('.dropdown-wrapper')) {
    showNotifications.value = false;
    showSettings.value = false;
  }
};

onMounted(() => document.addEventListener('click', closeDropdowns));
onUnmounted(() => document.removeEventListener('click', closeDropdowns));
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
  gap: 12px;
  padding: 0.75rem 1.25rem;
  border-bottom: 1px solid #f1f5f9;
  transition: background-color 0.2s;
  cursor: pointer;
}

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

.notif-content p {
  margin: 0 0 4px 0;
  font-size: 0.9rem;
  color: #334155;
  line-height: 1.4;
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
</style>
