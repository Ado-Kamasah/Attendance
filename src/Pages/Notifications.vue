<template>
  <div class="notif-page">
    <!-- Header -->
    <div class="page-header">
      <div>
        <h1 class="page-title">Notifications</h1>
        <p class="page-subtitle">{{ roleSubtitle }}</p>
      </div>
      <div class="header-actions">
        <select v-model="filterAction" class="filter-sel" id="notif-action-filter">
          <option value="">All Actions</option>
          <option v-for="a in availableActions" :key="a" :value="a">{{ formatAction(a) }}</option>
        </select>
        <select v-model="filterRole" class="filter-sel" id="notif-role-filter" v-if="isAdmin">
          <option value="">All Roles</option>
          <option value="Admin">Admin</option>
          <option value="Lecturer">Lecturer</option>
          <option value="Student">Student</option>
          <option value="System">System</option>
        </select>
        <div class="search-wrap">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
          <input v-model="searchQuery" type="text" placeholder="Search notifications…" class="search-in" id="notif-search"/>
        </div>
        <button class="btn-mark-all" @click="clearFilters" id="clear-filters-btn" v-if="filterAction || filterRole || searchQuery">
          Clear filters
        </button>
      </div>
    </div>

    <!-- Stats strip -->
    <div class="stats-strip" v-if="!isLoading && visibleLogs.length > 0">
      <div class="stat-pill stat-total">
        <span class="stat-num">{{ visibleLogs.length }}</span>
        <span class="stat-lbl">Total</span>
      </div>
      <div class="stat-pill stat-created">
        <span class="stat-num">{{ countByType('created') }}</span>
        <span class="stat-lbl">Created</span>
      </div>
      <div class="stat-pill stat-updated">
        <span class="stat-num">{{ countByType('updated') }}</span>
        <span class="stat-lbl">Updated</span>
      </div>
      <div class="stat-pill stat-deleted">
        <span class="stat-num">{{ countByType('deleted') }}</span>
        <span class="stat-lbl">Deleted</span>
      </div>
      <div class="stat-pill stat-conflict" v-if="countByType('conflict') > 0">
        <span class="stat-num">{{ countByType('conflict') }}</span>
        <span class="stat-lbl">Conflicts</span>
      </div>
      <div class="stat-pill stat-failed" v-if="countByType('failed') > 0">
        <span class="stat-num">{{ countByType('failed') }}</span>
        <span class="stat-lbl">Failures</span>
      </div>
    </div>

    <!-- Loading -->
    <div v-if="isLoading" class="loading-state">
      <div class="spinner"></div>
      <span>Loading notifications…</span>
    </div>

    <!-- Empty -->
    <div v-else-if="filteredLogs.length === 0" class="empty-state">
      <div class="empty-icon">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/></svg>
      </div>
      <h3>No notifications</h3>
      <p>Nothing matches your current filters.</p>
    </div>

    <!-- Grouped list -->
    <div v-else class="log-groups">
      <div v-for="group in paginatedGroups" :key="group.label" class="day-group">
        <div class="day-label">{{ group.label }}</div>
        <div class="log-list">
          <div
            v-for="log in group.items"
            :key="log.id"
            class="log-card"
            :class="actionClass(log.action)"
          >
            <div class="log-icon-wrap" :class="actionClass(log.action)">
              <svg v-if="log.action.includes('created')" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
              <svg v-else-if="log.action.includes('deleted')" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>
              <svg v-else-if="log.action.includes('updated')" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
              <svg v-else-if="log.action.includes('conflict')" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polygon points="7.86 2 16.14 2 22 7.86 22 16.14 16.14 22 7.86 22 2 16.14 2 7.86 7.86 2"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
              <svg v-else-if="log.action.includes('failed')" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/></svg>
              <svg v-else viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
            </div>
            <div class="log-body">
              <div class="log-top">
                <span class="log-action-label" :class="actionClass(log.action)">{{ formatAction(log.action) }}</span>
                <span class="log-time">{{ log.relativeTime }}</span>
              </div>
              <p class="log-detail">{{ log.details }}</p>
              <div class="log-meta">
                <span class="role-pill" :class="log.userRole?.toLowerCase()">{{ log.userRole }}</span>
                <span class="log-user">{{ log.userName }}</span>
                <!-- relevance tag for non-admins -->
                <span class="relevance-tag" v-if="log.relevance && !isAdmin" :title="log.relevance">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M1 6l11 12 11-12"/></svg>
                  {{ log.relevance }}
                </span>
                <span class="log-timestamp">{{ log.formattedTime }}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Pagination -->
    <div class="pagination" v-if="totalPages > 1">
      <button class="page-btn" :disabled="page === 1" @click="page--" id="notif-prev-btn">← Prev</button>
      <span class="page-info">Page {{ page }} of {{ totalPages }}</span>
      <button class="page-btn" :disabled="page === totalPages" @click="page++" id="notif-next-btn">Next →</button>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted, watch } from 'vue';
import { storeToRefs } from 'pinia';
import { useAuditLogsStore } from '@/stores/auditlogs';
import { useAuthStore } from '@/stores/authstore';

const auditStore = useAuditLogsStore();
const authStore = useAuthStore();

const { logs, isLoading } = storeToRefs(auditStore);
const { profile } = storeToRefs(authStore);

const filterAction = ref('');
const filterRole = ref('');
const searchQuery = ref('');
const page = ref(1);
const pageSize = 3; // groups per page

const isAdmin = computed(() => profile.value?.role === 'Admin');
const isLecturer = computed(() => profile.value?.role === 'Lecturer');

// Reset page when filters change
watch([filterAction, filterRole, searchQuery], () => { page.value = 1; });

onMounted(async () => {
  await auditStore.fetchLogs();
  auditStore.subscribeToLogs();
});
onUnmounted(() => auditStore.unsubscribeFromLogs());

const roleSubtitle = computed(() => {
  const role = profile.value?.role;
  if (role === 'Admin')    return 'Full system audit trail — all actions by all users';
  if (role === 'Lecturer') return 'Your actions and schedule changes that mention you';
  return 'Timetable announcements and schedule updates relevant to you';
});

// ── Enriched logs ──────────────────────────────────────────────────────────────
const enrichedLogs = computed(() => {
  return logs.value.map(l => ({
    ...l,
    formattedTime: l.timestamp
      ? new Date(l.timestamp).toLocaleString('en-US', { dateStyle: 'medium', timeStyle: 'short' })
      : '—',
    relativeTime: relativeTime(l.timestamp),
    dateKey: l.timestamp ? new Date(l.timestamp).toDateString() : 'Unknown',
  }));
});

// ── Role-based visibility ──────────────────────────────────────────────────────
const visibleLogs = computed(() => {
  const role = profile.value?.role;
  const uid  = profile.value?.id;
  const name = (profile.value?.name || '').toLowerCase();

  if (role === 'Admin') {
    // Admin sees every log
    return enrichedLogs.value;
  }

  if (role === 'Lecturer') {
    // Lecturers see:
    // 1. Logs they personally triggered (their own userId)
    // 2. Logs whose details mention their name (e.g. schedule assigned to them)
    return enrichedLogs.value
      .filter(l =>
        l.userId === uid ||
        (l.details && l.details.toLowerCase().includes(name))
      )
      .map(l => ({
        ...l,
        relevance:
          l.userId === uid
            ? 'Your action'
            : 'Mentions you',
      }));
  }

  // Students: see schedule changes (timetable announcements) + conflict notices
  return enrichedLogs.value
    .filter(l =>
      ['schedule_created', 'schedule_updated', 'schedule_deleted',
       'schedule_conflict_rejected'].includes(l.action)
    )
    .map(l => ({ ...l, relevance: 'Timetable update' }));
});

// ── Filter ─────────────────────────────────────────────────────────────────────
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

// ── Available action types for the filter dropdown ────────────────────────────
const availableActions = computed(() =>
  [...new Set(visibleLogs.value.map(l => l.action))].sort()
);

// ── Group by date ──────────────────────────────────────────────────────────────
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

// ── Helpers ───────────────────────────────────────────────────────────────────
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

function actionClass(action) {
  if (action.includes('created'))  return 'type-created';
  if (action.includes('deleted'))  return 'type-deleted';
  if (action.includes('updated'))  return 'type-updated';
  if (action.includes('conflict')) return 'type-conflict';
  if (action.includes('failed'))   return 'type-failed';
  return 'type-info';
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