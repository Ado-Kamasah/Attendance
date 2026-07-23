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

<style scoped>
.notif-page {
  display: flex;
  flex-direction: column;
  gap: 1.75rem;
  width: 100%;
}

/* Stats strip */
.stats-strip {
  display: flex;
  gap: 0.75rem;
  flex-wrap: wrap;
}

.stat-pill {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 1rem;
  border-radius: 10px;
  border: 1px solid transparent;
  font-size: 0.85rem;
}

.stat-num { font-weight: 700; font-size: 1rem; }
.stat-lbl { color: inherit; opacity: 0.75; }

.stat-total    { background: #f8fafc; border-color: #e2e8f0; color: #334155; }
.stat-created  { background: #dcfce7; border-color: #bbf7d0; color: #15803d; }
.stat-updated  { background: #fef9c3; border-color: #fde047; color: #a16207; }
.stat-deleted  { background: #fee2e2; border-color: #fecaca; color: #b91c1c; }
.stat-conflict { background: #ffedd5; border-color: #fed7aa; color: #c2410c; }
.stat-failed   { background: #fee2e2; border-color: #fecaca; color: #991b1b; }

/* Relevance tag */
.relevance-tag {
  display: inline-flex;
  align-items: center;
  gap: 3px;
  font-size: 0.7rem;
  font-weight: 600;
  padding: 0.15rem 0.45rem;
  border-radius: 5px;
  background: #e0e7ff;
  color: #4338ca;
  letter-spacing: 0.02em;
}
.relevance-tag svg { width: 10px; height: 10px; }

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  flex-wrap: wrap;
  gap: 1rem;
}

.page-title {
  margin: 0;
  font-size: 1.75rem;
  font-weight: 700;
  color: #0f172a;
  letter-spacing: -0.025em;
}

.page-subtitle {
  margin: 0.25rem 0 0;
  font-size: 0.9rem;
  color: #64748b;
}

.header-actions {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  flex-wrap: wrap;
}

.filter-sel {
  padding: 0.5rem 0.75rem;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  font-size: 0.875rem;
  color: #334155;
  background: #fff;
  outline: none;
  cursor: pointer;
  transition: border-color 0.2s;
}
.filter-sel:focus { border-color: #6366f1; }

.search-wrap {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  background: #f8fafc;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  padding: 0.45rem 0.75rem;
}
.search-wrap svg { width: 15px; height: 15px; color: #94a3b8; flex-shrink: 0; }
.search-in { border: none; background: transparent; outline: none; font-size: 0.875rem; color: #334155; min-width: 180px; }

.btn-mark-all {
  padding: 0.45rem 0.9rem;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  background: #fff;
  color: #64748b;
  font-size: 0.8rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
}
.btn-mark-all:hover { background: #f1f5f9; color: #334155; }

/* Loading */
.loading-state {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 3rem;
  justify-content: center;
  color: #64748b;
}
.spinner {
  width: 20px;
  height: 20px;
  border: 2px solid #e2e8f0;
  border-top-color: #6366f1;
  border-radius: 50%;
  animation: spin 0.7s linear infinite;
}
@keyframes spin { to { transform: rotate(360deg); } }

/* Empty */
.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 5rem 1rem;
  background: #fff;
  border-radius: 16px;
  border: 1px solid #e2e8f0;
  text-align: center;
}
.empty-icon { width: 64px; height: 64px; background: #f8fafc; border-radius: 50%; display: flex; align-items: center; justify-content: center; margin-bottom: 1rem; color: #94a3b8; }
.empty-icon svg { width: 30px; height: 30px; }
.empty-state h3 { margin: 0 0 0.5rem; color: #1e293b; font-size: 1.1rem; }
.empty-state p  { margin: 0; color: #64748b; font-size: 0.9rem; }

/* Day groups */
.log-groups { display: flex; flex-direction: column; gap: 1.5rem; }
.day-group  { display: flex; flex-direction: column; gap: 0.75rem; }

.day-label {
  font-size: 0.75rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  color: #94a3b8;
  padding: 0 0.25rem;
}

.log-list { display: flex; flex-direction: column; gap: 0.75rem; }

/* Log card */
.log-card {
  display: flex;
  gap: 1rem;
  background: #fff;
  border-radius: 14px;
  padding: 1.1rem 1.25rem;
  border: 1px solid #f1f5f9;
  border-left: 4px solid transparent;
  box-shadow: 0 2px 6px rgba(0,0,0,0.03);
  transition: box-shadow 0.2s, transform 0.2s;
}
.log-card:hover { box-shadow: 0 6px 16px rgba(0,0,0,0.06); transform: translateY(-1px); }

.log-card.type-created  { border-left-color: #10b981; }
.log-card.type-deleted  { border-left-color: #ef4444; }
.log-card.type-updated  { border-left-color: #f59e0b; }
.log-card.type-conflict { border-left-color: #f97316; }
.log-card.type-failed   { border-left-color: #dc2626; }
.log-card.type-info     { border-left-color: #6366f1; }

/* Icon wrap */
.log-icon-wrap {
  width: 38px;
  height: 38px;
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}
.log-icon-wrap svg { width: 18px; height: 18px; }

.log-icon-wrap.type-created  { background: rgba(16,185,129,0.1); color: #10b981; }
.log-icon-wrap.type-deleted  { background: rgba(239,68,68,0.1);  color: #ef4444; }
.log-icon-wrap.type-updated  { background: rgba(245,158,11,0.1); color: #f59e0b; }
.log-icon-wrap.type-conflict { background: rgba(249,115,22,0.1); color: #f97316; }
.log-icon-wrap.type-failed   { background: rgba(220,38,38,0.1);  color: #dc2626; }
.log-icon-wrap.type-info     { background: rgba(99,102,241,0.1); color: #6366f1; }

/* Log body */
.log-body { flex: 1; min-width: 0; }

.log-top { display: flex; align-items: center; justify-content: space-between; gap: 0.5rem; margin-bottom: 0.3rem; }

.log-action-label {
  font-size: 0.78rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  padding: 0.2rem 0.5rem;
  border-radius: 5px;
}
.log-action-label.type-created  { background: #dcfce7; color: #15803d; }
.log-action-label.type-deleted  { background: #fee2e2; color: #b91c1c; }
.log-action-label.type-updated  { background: #fef9c3; color: #a16207; }
.log-action-label.type-conflict { background: #ffedd5; color: #c2410c; }
.log-action-label.type-failed   { background: #fee2e2; color: #991b1b; }
.log-action-label.type-info     { background: #e0e7ff; color: #4338ca; }

.log-time { font-size: 0.78rem; color: #94a3b8; white-space: nowrap; }

.log-detail {
  margin: 0 0 0.5rem;
  font-size: 0.9rem;
  color: #334155;
  line-height: 1.5;
  word-break: break-word;
}

.log-meta { display: flex; align-items: center; gap: 0.5rem; flex-wrap: wrap; }

.role-pill {
  font-size: 0.65rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  padding: 0.15rem 0.4rem;
  border-radius: 4px;
}
.role-pill.admin    { background: #e0e7ff; color: #4338ca; }
.role-pill.lecturer { background: #dcfce7; color: #15803d; }
.role-pill.student  { background: #fef9c3; color: #a16207; }
.role-pill.system   { background: #f1f5f9; color: #64748b; }

.log-user      { font-size: 0.8rem; color: #475569; font-weight: 500; }
.log-timestamp { font-size: 0.78rem; color: #94a3b8; margin-left: auto; }

/* Pagination */
.pagination { display: flex; align-items: center; justify-content: flex-end; gap: 1rem; margin-top: 0.5rem; }
.page-btn { padding: 0.4rem 1rem; border: 1px solid #e2e8f0; border-radius: 8px; background: #fff; color: #6366f1; font-weight: 600; font-size: 0.875rem; cursor: pointer; transition: all 0.2s; }
.page-btn:hover:not(:disabled) { background: #6366f1; color: #fff; border-color: #6366f1; }
.page-btn:disabled { opacity: 0.35; cursor: default; }
.page-info { font-size: 0.875rem; color: #64748b; }

@media (max-width: 768px) {
  .page-header { flex-direction: column; }
  .log-card { flex-direction: column; }
}
</style>
