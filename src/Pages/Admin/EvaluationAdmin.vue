<template>
  <div class="ea-container">
    <!-- Header -->
    <div class="ea-header">
      <div>
        <h1 class="ea-title">Evaluation Management</h1>
        <p class="ea-subtitle">Control access and view analysis of student lecturer evaluations</p>
      </div>
      <!-- Access toggle -->
      <div class="toggle-card" :class="evalStore.settings.isOpen ? 'toggle-open' : 'toggle-closed'">
        <div class="toggle-info">
          <span class="toggle-status-dot"></span>
          <div>
            <p class="toggle-label">Evaluations are {{ evalStore.settings.isOpen ? 'OPEN' : 'CLOSED' }}</p>
            <p class="toggle-hint">{{ evalStore.settings.isOpen ? 'Students can submit evaluations.' : 'Students cannot submit evaluations.' }}</p>
          </div>
        </div>
        <button class="toggle-btn" @click="handleToggle" id="ea-toggle-btn">
          {{ evalStore.settings.isOpen ? 'Close Evaluations' : 'Open Evaluations' }}
        </button>
      </div>
    </div>

    <!-- KPI strip -->
    <div class="kpi-row">
      <div class="kpi-tile">
        <div class="kpi-ico kpi-indigo"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg></div>
        <div><p class="kpi-lbl">Total Responses</p><h3 class="kpi-val">{{ evalStore.evaluations.length }}</h3></div>
      </div>
      <div class="kpi-tile">
        <div class="kpi-ico kpi-green"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/></svg></div>
        <div><p class="kpi-lbl">Lecturers Evaluated</p><h3 class="kpi-val">{{ uniqueLecturers }}</h3></div>
      </div>
      <div class="kpi-tile">
        <div class="kpi-ico kpi-amber"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg></div>
        <div><p class="kpi-lbl">Avg Overall Rating</p><h3 class="kpi-val">{{ avgOverallRating }}%</h3></div>
      </div>
      <div class="kpi-tile">
        <div class="kpi-ico kpi-sky"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="20 6 9 17 4 12"/></svg></div>
        <div><p class="kpi-lbl">Retention Rate</p><h3 class="kpi-val">{{ avgRetentionRate }}%</h3></div>
      </div>
    </div>

    <!-- Filters -->
    <div class="filter-bar">
      <select v-model="filterLecturer" class="fsel" id="ea-lecturer-filter">
        <option value="">All Lecturers</option>
        <option v-for="(name, id) in lecturerNames" :key="id" :value="id">{{ name }}</option>
      </select>
      <div class="search-wrap">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
        <input v-model="searchQ" type="text" placeholder="Search lecturer…" class="search-in" id="ea-search"/>
      </div>
    </div>

    <!-- Per-lecturer analysis cards -->
    <div v-if="evalStore.isLoading" class="loading-state">Loading evaluation data…</div>
    <div v-else-if="filteredAnalysis.length === 0" class="empty-state">
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M9 11l3 3L22 4"/><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"/></svg>
      <p>No evaluation responses found.</p>
    </div>
<!-- Error state -->
    <div v-if="evalStore.error && !evalStore.isLoading" class="empty-state" style="border-color:#fecaca;background:#fef2f2;">
      <svg viewBox="0 0 24 24" fill="none" stroke="#ef4444" stroke-width="1.5"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
      <p style="color:#ef4444;">{{ evalStore.error }}</p>
    </div>
    <div v-else class="analysis-grid">
      <div v-for="lec in filteredAnalysis" :key="lec.lecturerId" class="lec-card">
        <!-- Card header -->
        <div class="lec-card-head">
          <div class="lec-avatar">{{ (lecturerNames[lec.lecturerId] || 'L').charAt(0) }}</div>
          <div class="lec-info">
            <h2 class="lec-name">{{ lecturerNames[lec.lecturerId] ?? 'Unknown Lecturer' }}</h2>
            <p class="lec-meta">{{ lec.totalResponses }} response{{ lec.totalResponses !== 1 ? 's' : '' }}</p>
          </div>
          <div class="lec-retention">
            <span class="retention-val" :class="retentionClass(lec.retainedPct)">{{ lec.retainedPct }}%</span>
            <span class="retention-lbl">Retention</span>
          </div>
        </div>

        <!-- Question breakdown -->
        <div class="q-breakdown">
          <div v-for="qs in lec.questionStats" :key="qs.questionId" class="qs-row">
            <div class="qs-q">{{ qs.text }}</div>
            <div class="qs-bars">
              <div
                v-for="(count, opt) in qs.counts"
                :key="opt"
                class="qs-bar-row"
              >
                <span class="qs-opt">{{ opt }}</span>
                <div class="qs-track">
                  <div class="qs-fill" :style="{ width: barPct(count, lec.totalResponses) + '%', background: optColor(opt) }"></div>
                </div>
                <span class="qs-count">{{ count }}</span>
              </div>
            </div>
            <div v-if="qs.pct !== null" class="qs-score">
              <div class="qs-score-bar-track">
                <div class="qs-score-bar" :style="{ width: qs.pct + '%', background: rateColor(qs.pct) }"></div>
              </div>
              <span class="qs-pct" :class="rateClass(qs.pct)">{{ qs.pct }}%</span>
            </div>
          </div>
        </div>

        <!-- Comments section -->
        <div class="comments-section" v-if="commentsFor(lec.lecturerId).length">
          <h3 class="comments-title">Student Comments</h3>
          <div class="comments-list">
            <div v-for="(c, i) in commentsFor(lec.lecturerId)" :key="i" class="comment-chip">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
              {{ c }}
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { storeToRefs } from 'pinia';
import { useAuthStore }        from '@/stores/authstore';
import { useEvaluationStore, QUESTIONS, SCORE_MAP } from '@/stores/evaluations';
import { supabase }            from '@/stores/supabase';

const authStore = useAuthStore();
const evalStore = useEvaluationStore();
const { profile } = storeToRefs(authStore);

const filterLecturer = ref('');
const searchQ        = ref('');
const lecturerNames  = ref({});

onMounted(async () => {
  await Promise.all([evalStore.fetchEvaluations(), evalStore.fetchSettings()]);
  // load lecturer names for all lecturers in evaluations
  const ids = [...new Set(evalStore.evaluations.map(e => e.lecturer_id).filter(Boolean))];
  if (ids.length) {
    const { data } = await supabase.from('users').select('id, name').in('id', ids);
    (data ?? []).forEach(u => { lecturerNames.value[u.id] = u.name; });
  }
});

async function handleToggle() {
  await evalStore.toggleEvaluationAccess(profile.value?.id);
}

// ── Aggregated analysis ────────────────────────────────────────────────────
const filteredAnalysis = computed(() => {
  let list = evalStore.analysisByLecturer;
  if (filterLecturer.value) list = list.filter(l => l.lecturerId === filterLecturer.value);
  if (searchQ.value.trim()) {
    const q = searchQ.value.toLowerCase();
    list = list.filter(l => (lecturerNames.value[l.lecturerId] ?? '').toLowerCase().includes(q));
  }
  return list;
});

const uniqueLecturers = computed(() => new Set(evalStore.evaluations.map(e => e.lecturer_id)).size);

const avgOverallRating = computed(() => {
  if (!filteredAnalysis.value.length) return 0;
  const rates = filteredAnalysis.value.map(l => {
    const q15 = l.questionStats.find(q => q.questionId === 'q15');
    return q15?.pct ?? 0;
  });
  return Math.round(rates.reduce((s, r) => s + r, 0) / rates.length);
});

const avgRetentionRate = computed(() => {
  if (!filteredAnalysis.value.length) return 0;
  return Math.round(filteredAnalysis.value.reduce((s, l) => s + l.retainedPct, 0) / filteredAnalysis.value.length);
});

function commentsFor(lecturerId) {
  return evalStore.evaluations
    .filter(e => e.lecturer_id === lecturerId && e.comments?.trim())
    .map(e => e.comments.trim());
}

function barPct(count, total) { return total > 0 ? Math.round((count / total) * 100) : 0; }

function optColor(opt) {
  const good = ['Excellent', 'Always', 'Yes'];
  const bad  = ['Very poor', 'Rarely', 'No'];
  if (good.includes(opt)) return '#10b981';
  if (bad.includes(opt))  return '#ef4444';
  return '#6366f1';
}

function rateClass(p) { return p >= 70 ? 'rate-good' : p >= 45 ? 'rate-warn' : 'rate-bad'; }
function rateColor(p) { return p >= 70 ? '#10b981' : p >= 45 ? '#f59e0b' : '#ef4444'; }
function retentionClass(p) { return p >= 70 ? 'ret-good' : p >= 45 ? 'ret-warn' : 'ret-bad'; }
</script>

<style scoped>
* { font-family: 'Inter', sans-serif; box-sizing: border-box; }
.ea-container { display: flex; flex-direction: column; gap: 1.75rem; width: 100%; }

/* Header */
.ea-header { display: flex; justify-content: space-between; align-items: flex-start; flex-wrap: wrap; gap: 1.25rem; }
.ea-title   { margin: 0; font-size: 1.75rem; font-weight: 700; color: #0f172a; letter-spacing: -.025em; }
.ea-subtitle { margin: .25rem 0 0; font-size: .9rem; color: #64748b; }

/* Toggle card */
.toggle-card { display: flex; align-items: center; gap: 1.25rem; padding: 1rem 1.25rem; border-radius: 14px; border: 1px solid; }
.toggle-open  { background: #f0fdf4; border-color: #bbf7d0; }
.toggle-closed { background: #fef2f2; border-color: #fecaca; }
.toggle-info { display: flex; align-items: center; gap: .75rem; }
.toggle-status-dot { width: 12px; height: 12px; border-radius: 50%; flex-shrink: 0; animation: pulse 2s infinite; }
.toggle-open  .toggle-status-dot { background: #10b981; }
.toggle-closed .toggle-status-dot { background: #ef4444; }
@keyframes pulse { 0%,100%{opacity:1}50%{opacity:.3} }
.toggle-label { margin: 0 0 2px; font-size: .85rem; font-weight: 700; color: #0f172a; }
.toggle-hint  { margin: 0; font-size: .75rem; color: #64748b; }
.toggle-btn { padding: .5rem 1.1rem; border-radius: 8px; font-size: .85rem; font-weight: 700; cursor: pointer; border: none; transition: all .2s; }
.toggle-open  .toggle-btn { background: #ef4444; color: #fff; }
.toggle-open  .toggle-btn:hover { background: #dc2626; }
.toggle-closed .toggle-btn { background: #10b981; color: #fff; }
.toggle-closed .toggle-btn:hover { background: #059669; }

/* KPI row */
.kpi-row { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px,1fr)); gap: 1.25rem; }
.kpi-tile { display: flex; align-items: center; gap: 1rem; background: #fff; border-radius: 16px; padding: 1.25rem 1.5rem; border: 1px solid #f1f5f9; box-shadow: 0 2px 8px rgba(0,0,0,.04); }
.kpi-ico  { width: 46px; height: 46px; border-radius: 12px; display: flex; align-items: center; justify-content: center; flex-shrink: 0; }
.kpi-ico svg { width: 22px; height: 22px; }
.kpi-lbl  { margin: 0 0 2px; font-size: .78rem; font-weight: 600; text-transform: uppercase; letter-spacing: .05em; color: #64748b; }
.kpi-val  { margin: 0; font-size: 1.9rem; font-weight: 700; color: #0f172a; letter-spacing: -.03em; }
.kpi-indigo { background: #e0e7ff; color: #4338ca; }
.kpi-green  { background: #dcfce7; color: #15803d; }
.kpi-amber  { background: #fef9c3; color: #a16207; }
.kpi-sky    { background: #e0f2fe; color: #0369a1; }

/* Filters */
.filter-bar { display: flex; gap: .75rem; flex-wrap: wrap; }
.fsel { padding: .45rem .75rem; border: 1px solid #e2e8f0; border-radius: 8px; font-size: .875rem; color: #334155; background: #fff; outline: none; cursor: pointer; }
.fsel:focus { border-color: #6366f1; }
.search-wrap { display: flex; align-items: center; gap: .5rem; background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: .4rem .75rem; }
.search-wrap svg { width: 15px; height: 15px; color: #94a3b8; flex-shrink: 0; }
.search-in { border: none; background: transparent; outline: none; font-size: .875rem; color: #334155; min-width: 180px; }

/* States */
.loading-state, .empty-state { text-align: center; padding: 4rem; color: #94a3b8; font-size: .95rem; }
.empty-state { display: flex; flex-direction: column; align-items: center; gap: 1rem; background: #f8fafc; border-radius: 16px; border: 1px dashed #cbd5e1; }
.empty-state svg { width: 48px; height: 48px; color: #cbd5e1; }
.empty-state p { margin: 0; }

/* Analysis grid */
.analysis-grid { display: flex; flex-direction: column; gap: 1.5rem; }

/* Lecturer card */
.lec-card { background: #fff; border-radius: 16px; border: 1px solid #f1f5f9; box-shadow: 0 2px 8px rgba(0,0,0,.04); overflow: hidden; }
.lec-card-head { display: flex; align-items: center; gap: 1rem; padding: 1.25rem 1.5rem; background: linear-gradient(135deg,#f8fafc,#f1f5f9); border-bottom: 1px solid #f1f5f9; }
.lec-avatar { width: 48px; height: 48px; border-radius: 14px; background: linear-gradient(135deg,#6366f1,#4f46e5); color: #fff; font-size: 1.2rem; font-weight: 800; display: flex; align-items: center; justify-content: center; flex-shrink: 0; }
.lec-info { flex: 1; }
.lec-name { margin: 0 0 2px; font-size: 1.05rem; font-weight: 700; color: #0f172a; }
.lec-meta { margin: 0; font-size: .8rem; color: #64748b; }
.lec-retention { display: flex; flex-direction: column; align-items: center; }
.retention-val { font-size: 1.5rem; font-weight: 800; }
.ret-good { color: #10b981; }
.ret-warn { color: #f59e0b; }
.ret-bad  { color: #ef4444; }
.retention-lbl { font-size: .68rem; font-weight: 600; color: #94a3b8; text-transform: uppercase; letter-spacing: .04em; }

/* Question breakdown */
.q-breakdown { display: flex; flex-direction: column; divide-y: 1px solid #f1f5f9; }
.qs-row { display: flex; flex-direction: column; gap: .5rem; padding: 1rem 1.5rem; border-bottom: 1px solid #f8fafc; }
.qs-q  { font-size: .85rem; font-weight: 600; color: #334155; }
.qs-bars { display: flex; flex-direction: column; gap: .3rem; }
.qs-bar-row { display: flex; align-items: center; gap: .6rem; }
.qs-opt   { width: 80px; font-size: .75rem; color: #64748b; font-weight: 600; text-align: right; flex-shrink: 0; }
.qs-track { flex: 1; height: 8px; background: #f1f5f9; border-radius: 999px; overflow: hidden; }
.qs-fill  { height: 100%; border-radius: 999px; transition: width .5s; }
.qs-count { font-size: .75rem; font-weight: 700; color: #475569; width: 24px; text-align: right; }
.qs-score { display: flex; align-items: center; gap: .5rem; margin-top: .25rem; }
.qs-score-bar-track { flex: 1; height: 5px; background: #f1f5f9; border-radius: 999px; overflow: hidden; }
.qs-score-bar { height: 100%; border-radius: 999px; transition: width .5s; }
.qs-pct { font-size: .78rem; font-weight: 700; width: 36px; text-align: right; }
.rate-good { color: #10b981; }
.rate-warn { color: #f59e0b; }
.rate-bad  { color: #ef4444; }

/* Comments */
.comments-section { padding: 1.25rem 1.5rem; background: #fafafa; border-top: 1px solid #f1f5f9; }
.comments-title { margin: 0 0 .75rem; font-size: .85rem; font-weight: 700; color: #64748b; text-transform: uppercase; letter-spacing: .05em; }
.comments-list { display: flex; flex-direction: column; gap: .5rem; }
.comment-chip { display: flex; align-items: flex-start; gap: .6rem; background: #fff; border: 1px solid #e2e8f0; border-radius: 10px; padding: .75rem 1rem; font-size: .85rem; color: #334155; line-height: 1.4; }
.comment-chip svg { width: 14px; height: 14px; color: #94a3b8; flex-shrink: 0; margin-top: 2px; }

@media(max-width:768px) { .ea-header { flex-direction: column; } .toggle-card { flex-direction: column; align-items: flex-start; } }
</style>
