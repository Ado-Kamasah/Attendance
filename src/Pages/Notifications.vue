<template>
  <div class="space-y-6 w-full max-w-6xl mx-auto">
    <!-- Header with Blueprint Eyebrow -->
    <div class="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-2 border-b border-outline/30 dark:border-dark-outline/40">
      <div>
        <div class="dim-eyebrow">
          <span>EVENT STREAM // AUDIT & COMMUNICATIONS</span>
          <svg class="dim-line w-20 h-2" viewBox="0 0 140 8" fill="none">
            <path d="M0 4H140" stroke="currentColor" stroke-width="1.5" />
          </svg>
        </div>
        <h1 class="text-2xl sm:text-3xl font-extrabold font-display tracking-tight text-foreground dark:text-dark-foreground">
          System <span class="text-secondary dark:text-dark-secondary">Notifications</span>
        </h1>
        <p class="text-xs sm:text-sm font-mono text-foreground/60 dark:text-dark-foreground/60 mt-1">
          {{ roleSubtitle }}
        </p>
      </div>

      <!-- Action & Search Toolbar -->
      <div class="flex flex-wrap items-center gap-2.5">
        <select 
          v-model="filterAction" 
          id="notif-action-filter"
          class="bg-surface dark:bg-dark-surface border border-outline/40 dark:border-dark-outline/40 rounded-xl px-3 py-1.5 text-xs text-foreground dark:text-dark-foreground font-mono outline-hidden focus:border-secondary shadow-2xs"
        >
          <option value="">All Actions</option>
          <option v-for="a in availableActions" :key="a" :value="a">{{ formatAction(a) }}</option>
        </select>

        <select 
          v-if="isAdmin"
          v-model="filterRole" 
          id="notif-role-filter"
          class="bg-surface dark:bg-dark-surface border border-outline/40 dark:border-dark-outline/40 rounded-xl px-3 py-1.5 text-xs text-foreground dark:text-dark-foreground font-mono outline-hidden focus:border-secondary shadow-2xs"
        >
          <option value="">All Roles</option>
          <option value="Admin">Admin</option>
          <option value="Lecturer">Lecturer</option>
          <option value="Student">Student</option>
          <option value="System">System</option>
        </select>

        <div class="relative">
          <Search class="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-foreground/40 pointer-events-none" />
          <input 
            v-model="searchQuery" 
            type="text" 
            placeholder="Search feed…" 
            id="notif-search"
            class="pl-8 pr-3 py-1.5 text-xs bg-surface dark:bg-dark-surface border border-outline/40 dark:border-dark-outline/40 focus:border-secondary rounded-xl outline-hidden text-foreground dark:text-dark-foreground font-mono placeholder:text-foreground/40 w-44 sm:w-52 shadow-2xs"
          />
        </div>

        <button 
          v-if="filterAction || filterRole || searchQuery"
          @click="clearFilters" 
          id="clear-filters-btn"
          class="p-1.5 text-xs font-mono text-secondary hover:underline cursor-pointer"
        >
          Clear
        </button>
      </div>
    </div>

    <!-- Stats Pill Strip -->
    <div v-if="!isLoading && visibleLogs.length > 0" class="flex flex-wrap items-center gap-2">
      <div class="px-3 py-1.5 rounded-xl bg-surface dark:bg-dark-surface border border-outline/40 dark:border-dark-outline/40 flex items-center gap-2 text-xs shadow-2xs">
        <span class="font-extrabold font-mono text-foreground dark:text-dark-foreground">{{ visibleLogs.length }}</span>
        <span class="text-[11px] font-mono text-foreground/50">Total</span>
      </div>

      <div class="px-3 py-1.5 rounded-xl bg-success/10 border border-success/25 text-success flex items-center gap-2 text-xs shadow-2xs">
        <span class="font-extrabold font-mono">{{ countByType('created') }}</span>
        <span class="text-[11px] font-mono opacity-80">Created</span>
      </div>

      <div class="px-3 py-1.5 rounded-xl bg-info/10 border border-info/25 text-info flex items-center gap-2 text-xs shadow-2xs">
        <span class="font-extrabold font-mono">{{ countByType('updated') }}</span>
        <span class="text-[11px] font-mono opacity-80">Updated</span>
      </div>

      <div class="px-3 py-1.5 rounded-xl bg-error/10 border border-error/25 text-error flex items-center gap-2 text-xs shadow-2xs">
        <span class="font-extrabold font-mono">{{ countByType('deleted') }}</span>
        <span class="text-[11px] font-mono opacity-80">Deleted</span>
      </div>

      <div v-if="countByType('conflict') > 0" class="px-3 py-1.5 rounded-xl bg-warning/10 border border-warning/25 text-warning flex items-center gap-2 text-xs shadow-2xs">
        <span class="font-extrabold font-mono">{{ countByType('conflict') }}</span>
        <span class="text-[11px] font-mono opacity-80">Conflicts</span>
      </div>
    </div>

    <!-- Student Absence Warnings Section -->
    <div v-if="isStudent && studentNotifStore.notifications.length > 0" class="space-y-3">
      <div class="flex items-center justify-between pb-2 border-b border-outline/30 dark:border-dark-outline/40">
        <div class="flex items-center gap-2">
          <AlertTriangle class="w-4 h-4 text-warning" />
          <h2 class="text-sm font-bold font-display uppercase tracking-wider text-foreground dark:text-dark-foreground">
            Academic Status Notices
          </h2>
          <span v-if="studentNotifStore.unreadCount > 0" class="text-[10px] font-mono px-2 py-0.5 rounded-full bg-error/15 text-error border border-error/30">
            {{ studentNotifStore.unreadCount }} unread
          </span>
        </div>

        <button 
          v-if="studentNotifStore.unreadCount > 0"
          @click="studentNotifStore.markAllRead()"
          class="text-xs font-semibold text-secondary hover:underline cursor-pointer"
        >
          Mark all read
        </button>
      </div>

      <div class="grid grid-cols-1 md:grid-cols-2 gap-3">
        <div
          v-for="n in studentNotifStore.notifications"
          :key="n.id"
          class="p-4 rounded-xl border flex items-start gap-3 cursor-pointer transition-all"
          :class="[
            n.type === 'ineligible' ? 'bg-error/10 border-error/30' : '',
            n.type === 'warning_2' ? 'bg-error/5 border-error/30' : '',
            n.type === 'warning_1' ? 'bg-warning/10 border-warning/30' : '',
            n.type === 'eval_open' ? 'bg-secondary/10 border-secondary/30' : '',
            { 'opacity-65': n.isRead }
          ]"
          @click="studentNotifStore.markRead(n.id)"
        >
          <div 
            class="w-8 h-8 rounded-lg flex items-center justify-center shrink-0 font-bold font-mono text-sm"
            :class="[
              n.type === 'ineligible' ? 'bg-error text-white' : '',
              n.type === 'warning_2' ? 'bg-error/20 text-error' : '',
              n.type === 'warning_1' ? 'bg-warning/20 text-warning' : '',
              n.type === 'eval_open' ? 'bg-secondary/20 text-secondary' : ''
            ]"
          >
            <AlertOctagon v-if="n.type === 'ineligible'" class="w-4 h-4" />
            <AlertTriangle v-else-if="n.type === 'warning_2' || n.type === 'warning_1'" class="w-4 h-4" />
            <Award v-else class="w-4 h-4" />
          </div>

          <div class="min-w-0 flex-1">
            <div class="flex items-center justify-between gap-2">
              <span 
                class="text-xs font-bold font-mono uppercase"
                :class="n.type === 'ineligible' || n.type === 'warning_2' ? 'text-error' : n.type === 'eval_open' ? 'text-secondary' : 'text-warning'"
              >
                {{ absenceLabel(n.type) }}
              </span>
              <span class="text-[10px] font-mono text-foreground/50 shrink-0">
                {{ relativeTime(n.createdAt) }}
              </span>
            </div>
            <p v-if="n.courseCode" class="text-xs font-semibold text-foreground dark:text-dark-foreground mt-0.5">
              {{ n.courseCode }} &bull; {{ n.courseName }}
            </p>
            <p class="text-[11px] text-foreground/70 dark:text-dark-foreground/70 mt-0.5">
              {{ n.message }}
            </p>
          </div>

          <span v-if="!n.isRead" class="w-2 h-2 rounded-full bg-secondary shrink-0 mt-1"></span>
        </div>
      </div>
    </div>

    <!-- Loading State -->
    <div v-if="isLoading" class="py-16 text-center text-xs font-mono text-foreground/50 dark:text-dark-foreground/50 flex items-center justify-center gap-2">
      <RefreshCw class="w-4 h-4 animate-spin text-secondary" />
      <span>Streaming notification ledger…</span>
    </div>

    <!-- Empty State -->
    <div v-else-if="filteredLogs.length === 0" class="py-16 text-center text-foreground/50 dark:text-dark-foreground/50 bg-surface dark:bg-dark-surface border border-outline/40 dark:border-dark-outline/40 rounded-2xl">
      <BellOff class="w-8 h-8 mx-auto mb-2 text-foreground/30" />
      <p class="text-sm font-medium text-foreground dark:text-dark-foreground">No events recorded</p>
      <p class="text-xs font-mono mt-0.5">There are no notification logs matching your active filters.</p>
    </div>

    <!-- Grouped Activity Feed -->
    <div v-else class="space-y-6">
      <div v-for="group in paginatedGroups" :key="group.label" class="space-y-3">
        <!-- Date Marker -->
        <div class="flex items-center gap-3">
          <span class="text-xs font-bold font-mono uppercase tracking-wider text-foreground/60 dark:text-dark-foreground/60 bg-muted/40 dark:bg-dark-muted/40 px-3 py-1 rounded-lg border border-outline/30 dark:border-dark-outline/40">
            {{ group.label }}
          </span>
          <div class="h-px flex-1 bg-outline/30 dark:bg-dark-outline/40"></div>
        </div>

        <!-- Log Items -->
        <div class="space-y-2">
          <div
            v-for="log in group.items"
            :key="log.id"
            class="p-4 rounded-xl bg-surface dark:bg-dark-surface border border-outline/40 dark:border-dark-outline/50 shadow-2xs hover:border-secondary/30 transition-all flex items-start gap-3.5"
          >
            <!-- Icon -->
            <div 
              class="w-8 h-8 rounded-lg flex items-center justify-center shrink-0 mt-0.5"
              :class="getActionBadgeStyle(log.action)"
            >
              <PlusCircle v-if="log.action.includes('created')" class="w-4 h-4" />
              <Trash2 v-else-if="log.action.includes('deleted')" class="w-4 h-4" />
              <RefreshCw v-else-if="log.action.includes('updated')" class="w-4 h-4" />
              <AlertTriangle v-else-if="log.action.includes('conflict')" class="w-4 h-4" />
              <AlertOctagon v-else-if="log.action.includes('failed')" class="w-4 h-4" />
              <Info v-else class="w-4 h-4" />
            </div>

            <!-- Content -->
            <div class="min-w-0 flex-1">
              <div class="flex items-center justify-between gap-2">
                <span class="text-xs font-bold text-foreground dark:text-dark-foreground">
                  {{ formatAction(log.action) }}
                </span>
                <span class="text-[10px] font-mono text-foreground/45 dark:text-dark-foreground/45 shrink-0">
                  {{ log.relativeTime }}
                </span>
              </div>

              <p class="text-xs text-foreground/75 dark:text-dark-foreground/75 mt-0.5 leading-relaxed">
                {{ log.details }}
              </p>

              <!-- Meta Footer -->
              <div class="flex flex-wrap items-center gap-2 mt-2 pt-2 border-t border-outline/20 dark:border-dark-outline/25 text-[10px] font-mono">
                <span 
                  class="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider"
                  :class="getRoleBadgeStyle(log.userRole)"
                >
                  {{ log.userRole || 'System' }}
                </span>
                <span class="text-foreground/50">By: {{ log.userName }}</span>
                <span v-if="log.relevance && !isAdmin" class="ml-auto px-2 py-0.5 rounded bg-secondary/15 text-secondary border border-secondary/25">
                  {{ log.relevance }}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Pagination -->
    <div v-if="totalPages > 1" class="flex items-center justify-center gap-3 pt-4 border-t border-outline/30 dark:border-dark-outline/40 text-xs font-mono">
      <button 
        :disabled="page === 1" 
        @click="page--" 
        id="notif-prev-btn"
        class="px-3.5 py-1.5 rounded-lg border border-outline/40 dark:border-dark-outline/40 bg-surface dark:bg-dark-surface text-foreground dark:text-dark-foreground disabled:opacity-40 disabled:cursor-not-allowed hover:bg-muted/40 cursor-pointer"
      >
        Previous
      </button>
      <span class="text-foreground/60">Page {{ page }} of {{ totalPages }}</span>
      <button 
        :disabled="page === totalPages" 
        @click="page++" 
        id="notif-next-btn"
        class="px-3.5 py-1.5 rounded-lg border border-outline/40 dark:border-dark-outline/40 bg-surface dark:bg-dark-surface text-foreground dark:text-dark-foreground disabled:opacity-40 disabled:cursor-not-allowed hover:bg-muted/40 cursor-pointer"
      >
        Next
      </button>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted, watch } from 'vue';
import { storeToRefs } from 'pinia';
import { useAuditLogsStore } from '@/stores/auditlogs';
import { useAuthStore } from '@/stores/authstore';
import { useStudentNotificationsStore } from '@/stores/studentNotifications';
import { 
  Search, 
  AlertTriangle, 
  AlertOctagon, 
  Award, 
  RefreshCw, 
  BellOff, 
  PlusCircle, 
  Trash2, 
  Info 
} from 'lucide-vue-next';

const auditStore = useAuditLogsStore();
const authStore = useAuthStore();
const studentNotifStore = useStudentNotificationsStore();

const { logs, isLoading } = storeToRefs(auditStore);
const { profile } = storeToRefs(authStore);

const filterAction = ref('');
const filterRole = ref('');
const searchQuery = ref('');
const page = ref(1);
const pageSize = 3;

const isAdmin = computed(() => profile.value?.role === 'Admin' || profile.value?.role === 'Super Admin');
const isStudent = computed(() => profile.value?.role === 'Student');

watch([filterAction, filterRole, searchQuery], () => { page.value = 1; });

onMounted(async () => {
  await auditStore.fetchLogs();
  auditStore.subscribeToLogs();
  if (profile.value?.role === 'Student') {
    await studentNotifStore.fetchNotifications();
  }
});

onUnmounted(() => auditStore.unsubscribeFromLogs());

function absenceLabel(type) {
  if (type === 'ineligible') return 'Exam Ineligible';
  if (type === 'warning_2')  return 'Critical Warning';
  if (type === 'eval_open')  return 'Evaluation Open';
  return 'Attendance Warning';
}

const roleSubtitle = computed(() => {
  const role = profile.value?.role;
  if (role === 'Admin' || role === 'Super Admin') return 'Full institutional ledger — all recorded system operations';
  if (role === 'Lecturer') return 'Teaching assignments, attendance submissions, and mentions';
  return 'Timetable updates, attendance alerts, and academic notices';
});

const enrichedLogs = computed(() => {
  return logs.value.map(l => ({
    ...l,
    relativeTime: relativeTime(l.timestamp),
    dateKey: l.timestamp ? new Date(l.timestamp).toDateString() : 'Unknown',
  }));
});

const visibleLogs = computed(() => {
  const role = profile.value?.role;
  const uid  = profile.value?.id;
  const name = (profile.value?.name || '').toLowerCase();

  if (role === 'Admin' || role === 'Super Admin') {
    return enrichedLogs.value;
  }

  if (role === 'Lecturer') {
    return enrichedLogs.value
      .filter(l =>
        l.userId === uid ||
        (l.details && l.details.toLowerCase().includes(name))
      )
      .map(l => ({
        ...l,
        relevance: l.userId === uid ? 'Your action' : 'Mentions you',
      }));
  }

  return enrichedLogs.value
    .filter(l =>
      ['schedule_created', 'schedule_updated', 'schedule_deleted',
       'schedule_conflict_rejected'].includes(l.action)
    )
    .map(l => ({ ...l, relevance: 'Timetable update' }));
});

const filteredLogs = computed(() => {
  let list = visibleLogs.value;
  if (filterAction.value) list = list.filter(l => l.action === filterAction.value);
  if (filterRole.value)   list = list.filter(l => l.userRole === filterRole.value);
  if (searchQuery.value.trim()) {
    const q = searchQuery.value.trim().toLowerCase();
    list = list.filter(l =>
      (l.details && l.details.toLowerCase().includes(q)) ||
      (l.userName && l.userName.toLowerCase().includes(q)) ||
      (l.action && l.action.toLowerCase().includes(q))
    );
  }
  return list;
});

const availableActions = computed(() =>
  [...new Set(visibleLogs.value.map(l => l.action))].sort()
);

const groupedLogs = computed(() => {
  const groups = {};
  filteredLogs.value.forEach(l => {
    const key = l.dateKey;
    if (!groups[key]) groups[key] = { label: friendlyDate(l.timestamp), items: [] };
    groups[key].items.push(l);
  });
  return Object.values(groups);
});

const totalPages = computed(() => Math.max(1, Math.ceil(groupedLogs.value.length / pageSize)));

const paginatedGroups = computed(() => {
  const start = (page.value - 1) * pageSize;
  return groupedLogs.value.slice(start, start + pageSize);
});

function clearFilters() {
  filterAction.value = '';
  filterRole.value = '';
  searchQuery.value = '';
}

function formatAction(action) {
  return action
    .replace(/_/g, ' ')
    .replace(/\b\w/g, c => c.toUpperCase());
}

function getActionBadgeStyle(action) {
  if (action.includes('created'))  return 'bg-success/15 text-success border border-success/30';
  if (action.includes('deleted'))  return 'bg-error/15 text-error border border-error/30';
  if (action.includes('updated'))  return 'bg-info/15 text-info border border-info/30';
  if (action.includes('conflict')) return 'bg-warning/15 text-warning border border-warning/30';
  if (action.includes('failed'))   return 'bg-error/20 text-error border border-error/30';
  return 'bg-secondary/15 text-secondary border border-secondary/30';
}

function getRoleBadgeStyle(role) {
  const r = (role || '').toLowerCase();
  if (r.includes('admin')) return 'bg-secondary/15 text-secondary border border-secondary/30';
  if (r.includes('lecturer')) return 'bg-emerald-500/15 text-emerald-500 border border-emerald-500/30';
  if (r.includes('student')) return 'bg-blue-500/15 text-blue-500 border border-blue-500/30';
  return 'bg-muted text-foreground/60 border border-outline/40';
}

function countByType(keyword) {
  return visibleLogs.value.filter(l => l.action.includes(keyword)).length;
}

function relativeTime(ts) {
  if (!ts) return '';
  const diff = Date.now() - new Date(ts).getTime();
  const mins  = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);
  const days  = Math.floor(diff / 86400000);
  if (mins < 1)   return 'just now';
  if (mins < 60)  return `${mins}m ago`;
  if (hours < 24) return `${hours}h ago`;
  return `${days}d ago`;
}

function friendlyDate(ts) {
  if (!ts) return 'Unknown';
  const d = new Date(ts);
  const today = new Date();
  const yesterday = new Date(today);
  yesterday.setDate(today.getDate() - 1);
  if (d.toDateString() === today.toDateString())     return 'Today';
  if (d.toDateString() === yesterday.toDateString()) return 'Yesterday';
  return d.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' });
}
</script>
