<template>
  <div class="fd-container">

    <!-- Header -->
    <div class="fd-header">
      <div class="fd-header-left">
        <div class="fd-header-icon">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8">
            <line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/>
          </svg>
        </div>
        <div>
          <h1 class="fd-title">Finance Dashboard</h1>
          <p class="fd-subtitle">{{ today }} · Lecturer claims overview</p>
        </div>
      </div>
      <button class="go-claims-btn" @click="$emit('navigate', '/finance-claims')">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/></svg>
        View Full Claims Report
      </button>
    </div>

    <!-- KPI Cards -->
    <div v-if="isLoading" class="fd-loading">Loading data…</div>
    <div v-else class="kpi-grid">
      <div class="kpi-card kpi-sky">
        <div class="kpi-icon">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>
        </div>
        <div>
          <p class="kpi-label">Total Lecturers</p>
          <h2 class="kpi-value">{{ totalLecturers }}</h2>
        </div>
      </div>
      <div class="kpi-card kpi-indigo">
        <div class="kpi-icon">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
        </div>
        <div>
          <p class="kpi-label">Total Sessions</p>
          <h2 class="kpi-value">{{ totalSessions }}</h2>
        </div>
      </div>
      <div class="kpi-card kpi-green">
        <div class="kpi-icon">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="20 6 9 17 4 12"/></svg>
        </div>
        <div>
          <p class="kpi-label">Avg Attendance Rate</p>
          <h2 class="kpi-value">{{ avgAttendance }}%</h2>
        </div>
      </div>
      <div class="kpi-card kpi-purple">
        <div class="kpi-icon">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/></svg>
        </div>
        <div>
          <p class="kpi-label">Courses Covered</p>
          <h2 class="kpi-value">{{ totalCourses }}</h2>
        </div>
      </div>
    </div>

    <!-- Top Lecturers by Sessions table -->
    <div v-if="!isLoading" class="fd-card">
      <div class="fd-card-head">
        <h2>Top Lecturers by Sessions Conducted</h2>
        <button class="link-btn" @click="$emit('navigate', '/finance-claims')">Full report →</button>
      </div>
      <div class="fd-table-wrap">
        <table class="fd-table">
          <thead>
            <tr>
              <th>#</th>
              <th>Lecturer</th>
              <th>Email</th>
              <th>Sessions</th>
              <th>Avg Attendance</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="(lec, i) in topLecturers" :key="lec.lecturerId">
              <td class="rank-cell">{{ i + 1 }}</td>
              <td class="name-cell">
                <div class="lec-avatar">{{ lec.lecturerName.charAt(0) }}</div>
                {{ lec.lecturerName }}
              </td>
              <td class="email-cell">{{ lec.lecturerEmail }}</td>
              <td><span class="sessions-badge">{{ lec.totalSessions }}</span></td>
              <td>
                <div class="rate-bar-wrap">
                  <div class="rate-bar" :style="{ width: lec.avgRate + '%', background: rateColor(lec.avgRate) }"></div>
                  <span class="rate-label" :class="rateClass(lec.avgRate)">{{ lec.avgRate }}%</span>
                </div>
              </td>
            </tr>
            <tr v-if="topLecturers.length === 0">
              <td colspan="5" class="empty-row">No session data found.</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import api from '@/api.js';

defineEmits(['navigate']);

const claims    = ref([]);
const isLoading = ref(true);
const today     = new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });

onMounted(async () => {
  try {
    const { data } = await api.get('/finance/claims');
    claims.value = data;
  } catch { /* silent */ } finally {
    isLoading.value = false;
  }
});

// ── KPI computations ──────────────────────────────────────────────────────────
const totalLecturers = computed(() => new Set(claims.value.map(c => c.lecturerId)).size);
const totalSessions  = computed(() => claims.value.reduce((s, c) => s + c.totalSessions, 0));
const totalCourses   = computed(() => new Set(claims.value.map(c => c.courseId)).size);
const avgAttendance  = computed(() => {
  if (!claims.value.length) return 0;
  const sum = claims.value.reduce((s, c) => s + c.attendanceRate, 0);
  return Math.round(sum / claims.value.length);
});

// ── Top 10 lecturers by total sessions ───────────────────────────────────────
const topLecturers = computed(() => {
  const map = new Map();
  for (const c of claims.value) {
    if (!map.has(c.lecturerId)) {
      map.set(c.lecturerId, {
        lecturerId:   c.lecturerId,
        lecturerName: c.lecturerName,
        lecturerEmail: c.lecturerEmail,
        totalSessions: 0,
        rateSum: 0,
        count: 0,
      });
    }
    const l = map.get(c.lecturerId);
    l.totalSessions += c.totalSessions;
    l.rateSum       += c.attendanceRate;
    l.count         += 1;
  }
  return [...map.values()]
    .map(l => ({ ...l, avgRate: Math.round(l.rateSum / (l.count || 1)) }))
    .sort((a, b) => b.totalSessions - a.totalSessions)
    .slice(0, 10);
});

const rateClass = (p) => p >= 70 ? 'rate-good' : p >= 45 ? 'rate-warn' : 'rate-bad';
const rateColor = (p) => p >= 70 ? '#10b981' : p >= 45 ? '#f59e0b' : '#ef4444';
</script>

<style scoped>
* { font-family: 'Inter', sans-serif; box-sizing: border-box; }

.fd-container { display: flex; flex-direction: column; gap: 1.75rem; width: 100%; }

/* Header */
.fd-header { display: flex; justify-content: space-between; align-items: flex-start; flex-wrap: wrap; gap: 1rem; }
.fd-header-left { display: flex; align-items: center; gap: 1.1rem; }
.fd-header-icon {
  width: 56px; height: 56px; border-radius: 16px;
  background: linear-gradient(135deg, #0ea5e9, #0284c7);
  display: flex; align-items: center; justify-content: center; flex-shrink: 0;
  box-shadow: 0 8px 20px rgba(14,165,233,.3);
}
.fd-header-icon svg { width: 26px; height: 26px; color: #fff; }
.fd-title    { margin: 0; font-size: 1.75rem; font-weight: 800; color: #0f172a; letter-spacing: -.025em; }
.fd-subtitle { margin: .2rem 0 0; font-size: .875rem; color: #64748b; }

.go-claims-btn {
  display: inline-flex; align-items: center; gap: .55rem;
  padding: .65rem 1.4rem; background: linear-gradient(135deg, #0ea5e9, #0284c7);
  color: #fff; border: none; border-radius: 12px; font-size: .875rem; font-weight: 700;
  cursor: pointer; box-shadow: 0 4px 14px rgba(14,165,233,.3); transition: all .2s; white-space: nowrap;
}
.go-claims-btn svg { width: 16px; height: 16px; }
.go-claims-btn:hover { transform: translateY(-1px); box-shadow: 0 6px 18px rgba(14,165,233,.4); }

.fd-loading { text-align: center; color: #94a3b8; padding: 4rem; font-size: .95rem; }

/* KPI grid */
.kpi-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 1.25rem; }
.kpi-card {
  display: flex; align-items: center; gap: 1.1rem;
  padding: 1.4rem 1.5rem; border-radius: 18px; border: 1px solid transparent;
}
.kpi-icon { width: 48px; height: 48px; border-radius: 14px; display: flex; align-items: center; justify-content: center; flex-shrink: 0; }
.kpi-icon svg { width: 22px; height: 22px; }
.kpi-label { margin: 0 0 .2rem; font-size: .75rem; font-weight: 700; text-transform: uppercase; letter-spacing: .05em; }
.kpi-value { margin: 0; font-size: 2rem; font-weight: 800; letter-spacing: -.04em; }
.kpi-sky    { background: #f0f9ff; border-color: #bae6fd; }
.kpi-sky    .kpi-icon { background: #e0f2fe; color: #0284c7; }
.kpi-sky    .kpi-label { color: #0369a1; }
.kpi-sky    .kpi-value { color: #0c4a6e; }
.kpi-indigo { background: #eef2ff; border-color: #c7d2fe; }
.kpi-indigo .kpi-icon { background: #e0e7ff; color: #4338ca; }
.kpi-indigo .kpi-label { color: #3730a3; }
.kpi-indigo .kpi-value { color: #1e1b4b; }
.kpi-green  { background: #f0fdf4; border-color: #bbf7d0; }
.kpi-green  .kpi-icon { background: #dcfce7; color: #15803d; }
.kpi-green  .kpi-label { color: #166534; }
.kpi-green  .kpi-value { color: #14532d; }
.kpi-purple { background: #faf5ff; border-color: #e9d5ff; }
.kpi-purple .kpi-icon { background: #f3e8ff; color: #7c3aed; }
.kpi-purple .kpi-label { color: #6d28d9; }
.kpi-purple .kpi-value { color: #4c1d95; }

/* Card */
.fd-card { background: #fff; border-radius: 18px; border: 1px solid #f1f5f9; box-shadow: 0 2px 12px rgba(0,0,0,.05); overflow: hidden; }
.fd-card-head { display: flex; justify-content: space-between; align-items: center; padding: 1.25rem 1.5rem; border-bottom: 1px solid #f8fafc; }
.fd-card-head h2 { margin: 0; font-size: 1rem; font-weight: 700; color: #0f172a; }
.link-btn { background: none; border: none; color: #0ea5e9; font-size: .85rem; font-weight: 700; cursor: pointer; padding: 0; }
.link-btn:hover { color: #0284c7; text-decoration: underline; }

/* Table */
.fd-table-wrap { overflow-x: auto; }
.fd-table { width: 100%; border-collapse: collapse; font-size: .875rem; }
.fd-table th { background: #f8fafc; color: #64748b; font-size: .72rem; font-weight: 700; text-transform: uppercase; letter-spacing: .05em; padding: .75rem 1.25rem; text-align: left; white-space: nowrap; }
.fd-table td { padding: .85rem 1.25rem; border-bottom: 1px solid #f8fafc; color: #334155; vertical-align: middle; }
.fd-table tr:last-child td { border-bottom: none; }
.fd-table tr:hover td { background: #f8fafc; }

.rank-cell  { font-weight: 700; color: #94a3b8; width: 40px; }
.name-cell  { display: flex; align-items: center; gap: .65rem; font-weight: 600; color: #0f172a; }
.email-cell { color: #64748b; font-size: .82rem; }
.lec-avatar { width: 32px; height: 32px; border-radius: 8px; background: linear-gradient(135deg,#0ea5e9,#0284c7); color: #fff; font-size: .85rem; font-weight: 800; display: flex; align-items: center; justify-content: center; flex-shrink: 0; }
.sessions-badge { display: inline-block; background: #dbeafe; color: #1d4ed8; font-size: .78rem; font-weight: 700; padding: .2rem .65rem; border-radius: 999px; }

.rate-bar-wrap { display: flex; align-items: center; gap: .75rem; }
.rate-bar { height: 6px; border-radius: 999px; min-width: 4px; transition: width .4s; flex-shrink: 0; max-width: 80px; }
.rate-label { font-size: .82rem; font-weight: 700; white-space: nowrap; }
.rate-good { color: #10b981; }
.rate-warn { color: #f59e0b; }
.rate-bad  { color: #ef4444; }
.empty-row { text-align: center; color: #94a3b8; padding: 3rem !important; }

@media (max-width: 768px) {
  .fd-header { flex-direction: column; }
  .go-claims-btn { width: 100%; justify-content: center; }
  .kpi-grid { grid-template-columns: repeat(2, 1fr); }
  .fd-table th, .fd-table td { padding: .65rem .85rem; }
  .email-cell { display: none; }
}
@media (max-width: 480px) {
  .kpi-grid { grid-template-columns: 1fr; }
}
</style>
