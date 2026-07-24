<template>
  <header class="flex justify-between items-center px-4 md:px-8 bg-white border-b border-slate-200 h-[70px] md:h-20 sticky top-0 z-50 shadow-sm box-border">
    <!-- Left -->
    <div class="flex items-center gap-3">
      <!-- Mobile hamburger -->
      <button
        class="md:hidden bg-transparent border-none text-slate-700 p-2 mr-1 cursor-pointer flex items-center justify-center rounded-lg hover:bg-slate-100 transition-colors"
        @click="$emit('toggle-mobile-sidebar')"
        aria-label="Open Menu"
      >
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="w-6 h-6">
          <line x1="3" y1="12" x2="21" y2="12"></line>
          <line x1="3" y1="6" x2="21" y2="6"></line>
          <line x1="3" y1="18" x2="21" y2="18"></line>
        </svg>
      </button>

      <div class="hidden md:block">
        <h2 class="text-[1.25rem] font-bold text-slate-900 m-0 mb-1 tracking-tight">
          Welcome back, <span class="text-indigo-500 font-extrabold">{{ firstName }}</span>
        </h2>
        <p class="text-[0.875rem] text-slate-500 m-0">{{ roleBadge }}</p>
      </div>
    </div>

    <!-- Right -->
    <div class="flex items-center gap-6">
      <!-- Search -->
      <div class="relative w-[300px] hidden md:block">
        <svg class="absolute left-3 top-1/2 -translate-y-1/2 w-[18px] h-[18px] text-slate-400 pointer-events-none" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <circle cx="11" cy="11" r="8"></circle>
          <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
        </svg>
        <input
          type="text"
          class="w-full h-10 pl-10 pr-4 rounded-full border border-slate-200 bg-slate-50 text-slate-700 text-[0.875rem] outline-none transition-all duration-200 box-border placeholder:text-slate-400 focus:bg-white focus:border-indigo-500 focus:ring-3 focus:ring-indigo-500/10"
          placeholder="Search courses, schedules..."
        />
      </div>

      <!-- Action buttons -->
      <div class="flex items-center gap-3 border-l border-slate-200 pl-6">

        <!-- Notifications -->
        <div class="relative" ref="notifWrapper">
          <button
            class="relative w-10 h-10 rounded-full border-none flex items-center justify-center cursor-pointer transition-all duration-200 text-slate-500 hover:bg-slate-100 hover:text-slate-900"
            :class="showNotifications ? 'bg-indigo-100 text-indigo-600' : 'bg-transparent'"
            aria-label="Notifications"
            @click="toggleNotifications"
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="w-5 h-5">
              <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"></path>
              <path d="M13.73 21a2 2 0 0 1-3.46 0"></path>
            </svg>
            <span
              v-if="unreadCount > 0"
              class="absolute top-1 right-1 min-w-[14px] h-[14px] px-1 bg-red-500 text-white text-[0.65rem] font-bold rounded-[10px] border-2 border-white flex items-center justify-center box-content"
            >{{ unreadCount }}</span>
          </button>

          <!-- Notifications dropdown -->
          <div
            v-if="showNotifications"
            class="absolute top-[calc(100%+14px)] right-[-10px] w-80 bg-white rounded-2xl shadow-[0_10px_25px_-5px_rgba(0,0,0,0.1),0_8px_10px_-6px_rgba(0,0,0,0.1)] border border-slate-200 z-[100] flex flex-col overflow-hidden animate-[slideDropdown_0.2s_cubic-bezier(0.16,1,0.3,1)_forwards] origin-top-right"
          >
            <div class="flex justify-between items-center px-5 py-4 border-b border-slate-100 bg-slate-50">
              <h3 class="m-0 text-base font-bold text-slate-900">Notifications</h3>
              <button v-if="unreadCount > 0" class="bg-transparent border-none text-indigo-500 text-[0.8rem] font-semibold cursor-pointer p-0 hover:underline" @click="markAllRead">Mark read</button>
            </div>
            <div class="max-h-[300px] overflow-y-auto py-2">
              <div v-if="isLoadingLogs" class="text-center py-8 text-slate-400 text-[0.9rem]">Loading…</div>
              <div v-else-if="recentLogs.length === 0" class="text-center py-8 text-slate-400 text-[0.9rem]">No notifications yet.</div>
              <div
                v-for="notif in recentLogs"
                :key="notif.id"
                class="flex gap-2.5 px-5 py-3 border-b border-slate-100 transition-colors duration-200 cursor-pointer items-start hover:bg-slate-50 last:border-0"
                :class="{ 'bg-[#f4f6ff]': !readIds.has(notif.id) }"
              >
                <div
                  class="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5"
                  :class="{
                    'bg-emerald-500/10 text-emerald-500': notif.typeClass === 'type-created',
                    'bg-red-500/10 text-red-500': notif.typeClass === 'type-deleted',
                    'bg-amber-500/10 text-amber-500': notif.typeClass === 'type-updated',
                    'bg-orange-500/10 text-orange-500': notif.typeClass === 'type-conflict',
                    'bg-red-600/10 text-red-600': notif.typeClass === 'type-failed',
                    'bg-indigo-500/10 text-indigo-500': notif.typeClass === 'type-info',
                  }"
                >
                  <svg v-if="notif.typeClass === 'type-created'" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="w-3.5 h-3.5"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
                  <svg v-else-if="notif.typeClass === 'type-deleted'" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="w-3.5 h-3.5"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>
                  <svg v-else-if="notif.typeClass === 'type-updated'" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="w-3.5 h-3.5"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
                  <svg v-else-if="notif.typeClass === 'type-conflict'" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="w-3.5 h-3.5"><polygon points="7.86 2 16.14 2 22 7.86 22 16.14 16.14 22 7.86 22 2 16.14 2 7.86 7.86 2"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
                  <svg v-else viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="w-3.5 h-3.5"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
                </div>
                <div>
                  <p class="m-0 mb-0.5 text-[0.8rem] font-bold text-slate-900">{{ notif.actionLabel }}</p>
                  <p class="m-0 mb-1 text-[0.82rem] text-slate-600 leading-snug line-clamp-2">{{ notif.details }}</p>
                  <span class="text-[0.75rem] text-slate-400">{{ notif.relativeTime }} &bull; {{ notif.userName }}</span>
                </div>
              </div>
            </div>
            <div class="px-5 py-3 border-t border-slate-100 bg-slate-50">
              <button class="w-full py-2.5 bg-white border border-slate-200 rounded-lg text-slate-900 text-[0.85rem] font-semibold cursor-pointer transition-all duration-200 hover:bg-slate-100" @click="goToNotifications">View All Notifications</button>
            </div>
          </div>
        </div>

        <!-- Settings -->
        <div class="relative" ref="settingsWrapper">
          <button
            class="relative w-10 h-10 rounded-full border-none flex items-center justify-center cursor-pointer transition-all duration-200 text-slate-500 hover:bg-slate-100 hover:text-slate-900"
            :class="showSettings ? 'bg-indigo-100 text-indigo-600' : 'bg-transparent'"
            aria-label="Settings"
            @click="toggleSettings"
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="w-5 h-5">
              <circle cx="12" cy="12" r="3"></circle>
              <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"></path>
            </svg>
          </button>

          <!-- Settings dropdown -->
          <div
            v-if="showSettings"
            class="absolute top-[calc(100%+14px)] right-[-10px] w-64 bg-white rounded-2xl shadow-[0_10px_25px_-5px_rgba(0,0,0,0.1),0_8px_10px_-6px_rgba(0,0,0,0.1)] border border-slate-200 z-[100] flex flex-col overflow-hidden animate-[slideDropdown_0.2s_cubic-bezier(0.16,1,0.3,1)_forwards] origin-top-right"
          >
            <div class="flex justify-between items-center px-5 py-4 border-b border-slate-100 bg-slate-50">
              <h3 class="m-0 text-base font-bold text-slate-900">Preferences</h3>
            </div>
            <div class="py-2">
              <div class="flex justify-between items-center px-5 py-3 text-[0.9rem] text-slate-700 font-medium">
                <span>Theme</span>
                <select v-model="userSettings.theme" class="py-1.5 px-2 border border-slate-200 rounded-md bg-slate-50 text-[0.85rem] text-slate-900 outline-none cursor-pointer">
                  <option value="Light">Light</option>
                  <option value="Dark">Dark</option>
                </select>
              </div>
              <div class="flex justify-between items-center px-5 py-3 text-[0.9rem] text-slate-700 font-medium">
                <span>Language</span>
                <select v-model="userSettings.language" class="py-1.5 px-2 border border-slate-200 rounded-md bg-slate-50 text-[0.85rem] text-slate-900 outline-none cursor-pointer">
                  <option value="English">English</option>
                </select>
              </div>
              <div class="flex justify-between items-center px-5 py-3 text-[0.9rem] text-slate-700 font-medium">
                <span>Email Alerts</span>
                <label class="relative inline-block w-9 h-5">
                  <input type="checkbox" v-model="userSettings.emailAlerts" class="opacity-0 w-0 h-0 absolute">
                  <span class="toggle-slider absolute cursor-pointer inset-0 bg-slate-300 transition-[0.2s] rounded-[20px] before:absolute before:content-[''] before:h-4 before:w-4 before:left-0.5 before:bottom-0.5 before:bg-white before:transition-[0.2s] before:rounded-full before:shadow-[0_2px_4px_rgba(0,0,0,0.2)]" :class="userSettings.emailAlerts ? '!bg-indigo-500 before:translate-x-4' : ''"></span>
                </label>
              </div>
              <div class="flex justify-between items-center px-5 py-3 text-[0.9rem] text-slate-700 font-medium">
                <span>SMS Alerts</span>
                <label class="relative inline-block w-9 h-5">
                  <input type="checkbox" v-model="userSettings.smsAlerts" class="opacity-0 w-0 h-0 absolute">
                  <span class="toggle-slider absolute cursor-pointer inset-0 bg-slate-300 transition-[0.2s] rounded-[20px] before:absolute before:content-[''] before:h-4 before:w-4 before:left-0.5 before:bottom-0.5 before:bg-white before:transition-[0.2s] before:rounded-full before:shadow-[0_2px_4px_rgba(0,0,0,0.2)]" :class="userSettings.smsAlerts ? '!bg-indigo-500 before:translate-x-4' : ''"></span>
                </label>
              </div>
            </div>
            <div class="px-5 py-3 border-t border-slate-100 bg-slate-50">
              <button class="w-full py-2.5 bg-white border border-slate-200 rounded-lg text-slate-900 text-[0.85rem] font-semibold cursor-pointer transition-all duration-200 hover:bg-slate-100" @click="saveSettings">Save Options</button>
            </div>
          </div>
        </div>

        <!-- Divider -->
        <div class="w-px h-6 bg-slate-200 mx-1"></div>

        <!-- Logout -->
        <button
          class="relative w-10 h-10 rounded-full border-none bg-transparent text-slate-500 flex items-center justify-center cursor-pointer transition-all duration-200 hover:bg-red-100 hover:text-red-500"
          aria-label="Logout"
          @click="$emit('logout')"
          title="Log Out"
        >
          <svg viewBox="0 0 24 24" fill="none" class="-translate-x-px w-5 h-5" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
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

const saveSettings = () => {
  showSettings.value = false;
  if (userSettings.value.theme === 'Dark') {
    document.body.classList.add('dark-theme');
  } else {
    document.body.classList.remove('dark-theme');
  }
  document.documentElement.lang = 'en';
  alert('Your preferences have been saved successfully!');
};

const closeDropdowns = (e) => {
  if (!e.target.closest('.relative')) {
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
@keyframes slideDropdown {
  0%   { opacity: 0; transform: scale(0.95); }
  100% { opacity: 1; transform: scale(1); }
}
</style>
