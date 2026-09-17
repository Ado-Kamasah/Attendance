<template>
  <header class="sticky top-0 z-40 w-full h-18 bg-surface/90 dark:bg-dark-surface/90 backdrop-blur-md border-b border-outline/50 dark:border-dark-outline/60 px-4 sm:px-6 lg:px-8 flex items-center justify-between transition-colors duration-200">
    <!-- Left: Mobile Toggle & Greeting -->
    <div class="flex items-center gap-3 sm:gap-4 min-w-0">
      <button 
        class="lg:hidden p-2 rounded-lg text-foreground/70 dark:text-dark-foreground/70 hover:text-foreground dark:hover:text-dark-foreground hover:bg-muted/70 dark:hover:bg-dark-muted/70 border border-outline/40 dark:border-dark-outline/40 transition-colors"
        @click="$emit('toggle-mobile-sidebar')" 
        aria-label="Open Navigation Menu"
      >
        <Menu class="w-5 h-5" />
      </button>

      <div class="min-w-0">
        <div class="flex items-center gap-2">
          <h2 class="text-base sm:text-lg font-bold font-display tracking-tight text-foreground dark:text-dark-foreground truncate">
            Welcome back, <span class="text-secondary dark:text-dark-secondary">{{ firstName }}</span>
          </h2>
        </div>
        <div class="flex items-center gap-2 mt-0.5">
          <span class="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[11px] font-semibold tracking-wide bg-secondary/10 dark:bg-dark-secondary/15 text-secondary dark:text-dark-secondary border border-secondary/25 dark:border-dark-secondary/30">
            <component :is="roleIcon" class="w-3 h-3 shrink-0" />
            <span>{{ roleLabel }}</span>
          </span>
          <span class="hidden md:inline-flex items-center text-[11px] text-foreground/50 dark:text-dark-foreground/50 font-mono">
            ● Southshore OS v2.4
          </span>
        </div>
      </div>
    </div>

    <!-- Right: Search & Action Buttons -->
    <div class="flex items-center gap-2 sm:gap-3">
      <!-- Search Input -->
      <div class="relative hidden sm:block">
        <Search class="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-foreground/40 dark:text-dark-foreground/40 pointer-events-none" />
        <input 
          type="text" 
          v-model="searchQuery"
          @keydown.enter="handleSearch"
          placeholder="Search modules, records... [ / ]" 
          class="w-44 md:w-60 lg:w-72 pl-9 pr-8 py-1.5 text-xs bg-muted/40 dark:bg-dark-muted/40 hover:bg-muted/70 dark:hover:bg-dark-muted/70 focus:bg-surface dark:focus:bg-dark-surface border border-outline/40 dark:border-dark-outline/40 focus:border-secondary dark:focus:border-dark-secondary rounded-lg outline-hidden text-foreground dark:text-dark-foreground placeholder:text-foreground/40 dark:placeholder:text-dark-foreground/40 transition-all font-mono"
        />
        <span class="absolute right-2.5 top-1/2 -translate-y-1/2 text-[10px] font-mono text-foreground/40 dark:text-dark-foreground/40 border border-outline/40 dark:border-dark-outline/40 px-1 rounded">
          /
        </span>
      </div>

      <!-- Instant Theme Toggle -->
      <button 
        @click="toggleThemeQuick"
        class="p-2 rounded-lg text-foreground/70 dark:text-dark-foreground/70 hover:text-foreground dark:hover:text-dark-foreground hover:bg-muted/70 dark:hover:bg-dark-muted/70 border border-outline/40 dark:border-dark-outline/40 transition-all duration-200"
        :title="isDark ? 'Switch to Light Mode' : 'Switch to Dark Mode'"
        aria-label="Toggle Theme"
      >
        <Sun v-if="isDark" class="w-4.5 h-4.5 text-secondary dark:text-dark-secondary" />
        <Moon v-else class="w-4.5 h-4.5 text-primary" />
      </button>

      <!-- Notifications Dropdown -->
      <div class="relative dropdown-wrapper">
        <button 
          class="relative p-2 rounded-lg border transition-all duration-200"
          :class="showNotifications 
            ? 'bg-secondary/15 dark:bg-dark-secondary/20 text-secondary dark:text-dark-secondary border-secondary/40 dark:border-dark-secondary/40' 
            : 'text-foreground/70 dark:text-dark-foreground/70 hover:text-foreground dark:hover:text-dark-foreground hover:bg-muted/70 dark:hover:bg-dark-muted/70 border-outline/40 dark:border-dark-outline/40'"
          aria-label="Notifications" 
          @click="toggleNotifications"
        >
          <Bell class="w-4.5 h-4.5" />
          <span 
            v-if="unreadCount > 0" 
            class="absolute -top-1 -right-1 min-w-4.5 h-4.5 px-1 bg-secondary dark:bg-dark-secondary text-primary dark:text-dark-surface font-bold text-[10px] font-mono rounded-full flex items-center justify-center ring-2 ring-surface dark:ring-dark-surface animate-pulse"
          >
            {{ unreadCount }}
          </span>
        </button>

        <!-- Notifications Dropdown Panel -->
        <div 
          v-if="showNotifications"
          class="absolute right-0 top-full mt-2.5 w-84 sm:w-96 bg-surface dark:bg-dark-surface border border-outline/60 dark:border-dark-outline rounded-xl shadow-2xl z-50 overflow-hidden flex flex-col animate-in fade-in slide-in-from-top-2 duration-150"
        >
          <!-- Blueprint corner marks -->
          <div class="absolute top-3 left-3 w-4 h-4 border-t-2 border-l-2 border-secondary/40 pointer-events-none"></div>
          <div class="absolute top-3 right-3 w-4 h-4 border-t-2 border-r-2 border-secondary/40 pointer-events-none"></div>

          <!-- Panel Header -->
          <div class="p-3.5 px-4 bg-muted/30 dark:bg-dark-muted/30 border-b border-outline/40 dark:border-dark-outline/40 flex items-center justify-between">
            <div class="flex items-center gap-2">
              <span class="text-xs font-bold font-display tracking-wider uppercase text-foreground dark:text-dark-foreground">
                Audit Feed & Alerts
              </span>
              <span v-if="unreadCount > 0" class="text-[10px] font-mono px-1.5 py-0.5 rounded bg-secondary/15 text-secondary dark:text-dark-secondary border border-secondary/30">
                {{ unreadCount }} new
              </span>
            </div>
            <button 
              v-if="unreadCount > 0" 
              @click="markAllRead" 
              class="text-xs font-semibold text-secondary hover:underline flex items-center gap-1 cursor-pointer"
            >
              <CheckCheck class="w-3.5 h-3.5" />
              <span>Mark all read</span>
            </button>
          </div>

          <!-- Panel Body (Scrollable List) -->
          <div class="max-h-80 overflow-y-auto divide-y divide-outline/20 dark:divide-dark-outline/30">
            <div v-if="isLoadingLogs" class="p-6 text-center text-xs font-mono text-foreground/50 dark:text-dark-foreground/50 flex items-center justify-center gap-2">
              <RefreshCw class="w-3.5 h-3.5 animate-spin text-secondary" />
              <span>Streaming activity logs…</span>
            </div>
            <div v-else-if="recentLogs.length === 0" class="p-8 text-center text-xs text-foreground/50 dark:text-dark-foreground/50">
              <CheckCheck class="w-6 h-6 mx-auto mb-2 text-secondary/60" />
              <p class="font-medium text-foreground dark:text-dark-foreground">All caught up</p>
              <p class="text-[11px] mt-0.5">No recent activity logs recorded.</p>
            </div>
            <div
              v-for="notif in recentLogs"
              :key="notif.id"
              class="p-3.5 hover:bg-muted/40 dark:hover:bg-dark-muted/40 transition-colors flex items-start gap-3 cursor-pointer"
              :class="{ 'bg-secondary/5 dark:bg-dark-secondary/5': !readIds.has(notif.id) }"
              @click="readIds.add(notif.id)"
            >
              <!-- Icon based on type -->
              <div 
                class="w-7 h-7 rounded-lg shrink-0 flex items-center justify-center mt-0.5 text-xs"
                :class="getNotifBadgeStyle(notif.typeClass)"
              >
                <PlusCircle v-if="notif.typeClass === 'type-created'" class="w-4 h-4" />
                <Trash2 v-else-if="notif.typeClass === 'type-deleted'" class="w-4 h-4" />
                <RefreshCw v-else-if="notif.typeClass === 'type-updated'" class="w-4 h-4" />
                <AlertTriangle v-else-if="notif.typeClass === 'type-conflict'" class="w-4 h-4" />
                <Info v-else class="w-4 h-4" />
              </div>

              <div class="flex-1 min-w-0">
                <div class="flex items-center justify-between gap-2">
                  <p class="text-xs font-semibold text-foreground dark:text-dark-foreground truncate">
                    {{ notif.actionLabel }}
                  </p>
                  <span class="text-[10px] font-mono text-foreground/45 dark:text-dark-foreground/45 shrink-0">
                    {{ notif.relativeTime }}
                  </span>
                </div>
                <p class="text-[11px] text-foreground/70 dark:text-dark-foreground/70 mt-0.5 line-clamp-2">
                  {{ notif.details }}
                </p>
                <div class="flex items-center gap-2 mt-1 text-[10px] font-mono text-foreground/40 dark:text-dark-foreground/40">
                  <span>By: {{ notif.userName }}</span>
                  <span v-if="!readIds.has(notif.id)" class="inline-block w-1.5 h-1.5 rounded-full bg-secondary"></span>
                </div>
              </div>
            </div>
          </div>

          <!-- Panel Footer -->
          <div class="p-2.5 bg-muted/20 dark:bg-dark-muted/20 border-t border-outline/40 dark:border-dark-outline/40">
            <button 
              @click="goToNotifications" 
              class="w-full py-1.5 text-xs font-semibold text-center rounded-lg bg-muted/60 dark:bg-dark-muted/60 hover:bg-secondary/15 hover:text-secondary dark:hover:bg-dark-secondary/20 dark:hover:text-dark-secondary border border-outline/30 dark:border-dark-outline/30 transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <span>View Full Audit Log</span>
              <ChevronRight class="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      <!-- Settings Dropdown -->
      <div class="relative dropdown-wrapper">
        <button 
          class="p-2 rounded-lg border transition-all duration-200"
          :class="showSettings 
            ? 'bg-secondary/15 dark:bg-dark-secondary/20 text-secondary dark:text-dark-secondary border-secondary/40 dark:border-dark-secondary/40' 
            : 'text-foreground/70 dark:text-dark-foreground/70 hover:text-foreground dark:hover:text-dark-foreground hover:bg-muted/70 dark:hover:bg-dark-muted/70 border-outline/40 dark:border-dark-outline/40'"
          aria-label="Settings" 
          @click="toggleSettings"
        >
          <Settings class="w-4.5 h-4.5" />
        </button>

        <!-- Settings Panel -->
        <div 
          v-if="showSettings"
          class="absolute right-0 top-full mt-2.5 w-76 sm:w-84 bg-surface dark:bg-dark-surface border border-outline/60 dark:border-dark-outline rounded-xl shadow-2xl z-50 overflow-hidden flex flex-col animate-in fade-in slide-in-from-top-2 duration-150"
        >
          <div class="absolute top-3 left-3 w-4 h-4 border-t-2 border-l-2 border-secondary/40 pointer-events-none"></div>
          <div class="absolute top-3 right-3 w-4 h-4 border-t-2 border-r-2 border-secondary/40 pointer-events-none"></div>

          <div class="p-3.5 px-4 bg-muted/30 dark:bg-dark-muted/30 border-b border-outline/40 dark:border-dark-outline/40 flex items-center justify-between">
            <div class="flex items-center gap-2">
              <Sliders class="w-3.5 h-3.5 text-secondary" />
              <span class="text-xs font-bold font-display tracking-wider uppercase text-foreground dark:text-dark-foreground">
                Preferences
              </span>
            </div>
          </div>

          <div class="p-4 space-y-3.5 text-xs">
            <!-- Theme selection -->
            <div class="flex items-center justify-between gap-4">
              <span class="font-medium text-foreground dark:text-dark-foreground">Color Mode</span>
              <div class="inline-flex p-0.5 rounded-lg bg-muted dark:bg-dark-muted border border-outline/40 dark:border-dark-outline/40">
                <button 
                  @click="setTheme('Light')" 
                  class="px-2.5 py-1 rounded-md text-[11px] font-semibold transition-all"
                  :class="userSettings.theme === 'Light' ? 'bg-surface text-primary shadow-xs' : 'text-foreground/60 dark:text-dark-foreground/60 hover:text-foreground'"
                >
                  Light
                </button>
                <button 
                  @click="setTheme('Dark')" 
                  class="px-2.5 py-1 rounded-md text-[11px] font-semibold transition-all"
                  :class="userSettings.theme === 'Dark' ? 'bg-dark-surface text-dark-secondary shadow-xs' : 'text-foreground/60 dark:text-dark-foreground/60 hover:text-foreground'"
                >
                  Dark
                </button>
              </div>
            </div>

            <!-- Language selection -->
            <div class="flex items-center justify-between gap-4">
              <span class="font-medium text-foreground dark:text-dark-foreground">Language</span>
              <select 
                v-model="userSettings.language" 
                class="bg-muted/50 dark:bg-dark-muted/50 border border-outline/40 dark:border-dark-outline/40 rounded-lg px-2.5 py-1 text-xs text-foreground dark:text-dark-foreground font-mono outline-hidden focus:border-secondary"
              >
                <option value="English">English (EN-US)</option>
              </select>
            </div>

            <!-- Email Alerts Toggle -->
            <div class="flex items-center justify-between gap-4 pt-1">
              <div>
                <p class="font-medium text-foreground dark:text-dark-foreground">Email Alerts</p>
                <p class="text-[10px] text-foreground/50 dark:text-dark-foreground/50 font-mono">Digest of critical schedules</p>
              </div>
              <button 
                type="button" 
                @click="userSettings.emailAlerts = !userSettings.emailAlerts"
                class="w-9 h-5 rounded-full transition-colors relative cursor-pointer"
                :class="userSettings.emailAlerts ? 'bg-secondary' : 'bg-muted dark:bg-dark-muted border border-outline/40'"
              >
                <span 
                  class="block w-3.5 h-3.5 bg-surface rounded-full shadow-xs transition-transform absolute top-0.75 left-0.75"
                  :class="{ 'translate-x-4': userSettings.emailAlerts }"
                ></span>
              </button>
            </div>

            <!-- SMS Alerts Toggle -->
            <div class="flex items-center justify-between gap-4">
              <div>
                <p class="font-medium text-foreground dark:text-dark-foreground">SMS Alerts</p>
                <p class="text-[10px] text-foreground/50 dark:text-dark-foreground/50 font-mono">Urgent session cancellations</p>
              </div>
              <button 
                type="button" 
                @click="userSettings.smsAlerts = !userSettings.smsAlerts"
                class="w-9 h-5 rounded-full transition-colors relative cursor-pointer"
                :class="userSettings.smsAlerts ? 'bg-secondary' : 'bg-muted dark:bg-dark-muted border border-outline/40'"
              >
                <span 
                  class="block w-3.5 h-3.5 bg-surface rounded-full shadow-xs transition-transform absolute top-0.75 left-0.75"
                  :class="{ 'translate-x-4': userSettings.smsAlerts }"
                ></span>
              </button>
            </div>
          </div>

          <div class="p-3 bg-muted/20 dark:bg-dark-muted/20 border-t border-outline/40 dark:border-dark-outline/40">
            <button 
              @click="saveSettings" 
              class="w-full py-1.5 text-xs font-semibold text-center rounded-lg bg-primary text-surface dark:bg-dark-secondary dark:text-primary hover:opacity-90 transition-opacity cursor-pointer flex items-center justify-center gap-1.5"
            >
              <Check class="w-3.5 h-3.5" />
              <span>Save Preferences</span>
            </button>
          </div>
        </div>
      </div>

      <!-- Vertical divider -->
      <div class="h-6 w-px bg-outline/40 dark:bg-dark-outline/50 mx-1 hidden sm:block"></div>

      <!-- Logout Button -->
      <button 
        class="p-2 rounded-lg text-foreground/70 dark:text-dark-foreground/70 hover:text-error dark:hover:text-dark-error hover:bg-error/10 dark:hover:bg-dark-error/15 border border-outline/40 dark:border-dark-outline/40 hover:border-error/30 transition-all duration-200 cursor-pointer"
        aria-label="Logout" 
        @click="$emit('logout')" 
        title="Sign Out"
      >
        <LogOut class="w-4.5 h-4.5" />
      </button>
    </div>
  </header>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue';
import { storeToRefs } from 'pinia';
import { useAuditLogsStore } from '@/stores/auditlogs';
import { useAuthStore } from '@/stores/authstore';
import { 
  Bell, 
  Settings, 
  LogOut, 
  Search, 
  Menu, 
  CheckCheck, 
  Check, 
  Sun, 
  Moon, 
  PlusCircle, 
  Trash2, 
  RefreshCw, 
  AlertTriangle, 
  Info, 
  Sliders, 
  Shield, 
  GraduationCap, 
  School,
  DollarSign,
  ChevronRight
} from 'lucide-vue-next';

const emit = defineEmits(['toggle-mobile-sidebar', 'logout', 'navigate']);

const auditStore = useAuditLogsStore();
const authStore = useAuthStore();
const { logs, isLoading: isLoadingLogs } = storeToRefs(auditStore);
const { profile } = storeToRefs(authStore);

const showNotifications = ref(false);
const showSettings = ref(false);
const searchQuery = ref('');

// ── Dark Mode State ────────────────────────────────────────────────────────
const isDark = ref(false);

const applyTheme = (dark) => {
  isDark.value = dark;
  if (dark) {
    document.documentElement.classList.add('dark');
    document.body.classList.add('dark-theme');
    localStorage.setItem('theme', 'dark');
    userSettings.value.theme = 'Dark';
  } else {
    document.documentElement.classList.remove('dark');
    document.body.classList.remove('dark-theme');
    localStorage.setItem('theme', 'light');
    userSettings.value.theme = 'Light';
  }
};

const toggleThemeQuick = () => {
  applyTheme(!isDark.value);
};

const setTheme = (themeName) => {
  applyTheme(themeName === 'Dark');
};

// ── User info ──────────────────────────────────────────────────────────────
const firstName = computed(() => {
  const name = profile.value?.name || 'User';
  return name.split(' ')[0];
});

const roleLabel = computed(() => {
  const raw = (profile.value?.role || '').toUpperCase().replace(/[\s_-]+/g, '_');
  if (raw === 'SUPER_ADMIN') return 'Super Admin';
  if (raw === 'ADMIN')       return 'Administrator';
  if (raw === 'LECTURER')    return 'Lecturer / Staff';
  if (raw === 'STUDENT')     return 'Enrolled Student';
  if (raw === 'FINANCE')     return 'Finance Officer';
  return profile.value?.role || 'User';
});

const roleIcon = computed(() => {
  const raw = (profile.value?.role || '').toUpperCase().replace(/[\s_-]+/g, '_');
  if (raw === 'SUPER_ADMIN' || raw === 'ADMIN') return Shield;
  if (raw === 'LECTURER') return School;
  if (raw === 'FINANCE')  return DollarSign;
  return GraduationCap;
});

// ── Audit log → notifications ─────────────────────────────────────────────
const readIds = ref(new Set());

// Role-based slice
const visibleLogs = computed(() => {
  const role = profile.value?.role;
  const uid  = profile.value?.id;
  if (role === 'Admin' || role === 'Super Admin') return logs.value;
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

function getNotifBadgeStyle(typeClass) {
  switch (typeClass) {
    case 'type-created':
      return 'bg-success/15 text-success border border-success/30';
    case 'type-deleted':
      return 'bg-error/15 text-error border border-error/30';
    case 'type-updated':
      return 'bg-info/15 text-info border border-info/30';
    case 'type-conflict':
      return 'bg-warning/15 text-warning border border-warning/30';
    default:
      return 'bg-secondary/15 text-secondary border border-secondary/30';
  }
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

const handleSearch = () => {
  if (searchQuery.value.trim()) {
    emit('navigate', `/courses?q=${encodeURIComponent(searchQuery.value.trim())}`);
  }
};

const userSettings = ref({
  theme: 'Light',
  language: 'English',
  emailAlerts: true,
  smsAlerts: false
});

const saveSettings = () => {
  showSettings.value = false;
  applyTheme(userSettings.value.theme === 'Dark');
  document.documentElement.lang = 'en';
};

const closeDropdowns = (e) => {
  if (!e.target.closest('.dropdown-wrapper')) {
    showNotifications.value = false;
    showSettings.value = false;
  }
};

onMounted(async () => {
  // Sync initial theme
  const savedTheme = localStorage.getItem('theme');
  const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
  const initialDark = savedTheme ? savedTheme === 'dark' : prefersDark;
  applyTheme(initialDark);

  document.addEventListener('click', closeDropdowns);
  await auditStore.fetchLogs();
  auditStore.subscribeToLogs();
});

onUnmounted(() => {
  document.removeEventListener('click', closeDropdowns);
  auditStore.unsubscribeFromLogs();
});
</script>