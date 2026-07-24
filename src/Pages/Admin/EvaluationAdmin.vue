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
        <div class="kpi-ico kpi-purple"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/></svg></div>
        <div><p class="kpi-lbl">Courses Evaluated</p><h3 class="kpi-val">{{ uniqueCourses }}</h3></div>
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
      <select v-model="filterCourse" class="fsel" id="ea-course-filter">
        <option value="">All Courses</option>
        <option v-for="c in evaluatedCourses" :key="c.id" :value="c.id">{{ c.label }}</option>
      </select>
      <div class="search-wrap">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
        <input v-model="searchQ" type="text" placeholder="Search lecturer or course…" class="search-in" id="ea-search"/>
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
            <!-- Course tags -->
            <div class="course-tags" v-if="lec.courses && lec.courses.length">
              <span v-for="c in lec.courses" :key="c.id" class="course-tag">{{ c.label }}</span>
            </div>
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
const filterCourse   = ref('');
const searchQ        = ref('');
const lecturerNames  = ref({});
const courseNames    = ref({});

onMounted(async () => {
  await Promise.all([evalStore.fetchEvaluations(), evalStore.fetchSettings()]);

  // Load lecturer names
  const lecturerIds = [...new Set(evalStore.evaluations.map(e => e.lecturer_id).filter(Boolean))];
  if (lecturerIds.length) {
    const { data } = await supabase.from('users').select('id, name').in('id', lecturerIds);
    (data ?? []).forEach(u => { lecturerNames.value[u.id] = u.name; });
  }

  // Load course names
  const courseIds = [...new Set(evalStore.evaluations.map(e => e.course_id).filter(Boolean))];
  if (courseIds.length) {
    const { data } = await supabase.from('courses').select('id, code, name').in('id', courseIds);
    (data ?? []).forEach(c => { courseNames.value[c.id] = `${c.code} — ${c.name}`; });
  }
});

async function handleToggle() {
  await evalStore.toggleEvaluationAccess(profile.value?.id);
}

// ── Aggregated analysis ────────────────────────────────────────────────────
// Extends the store's analysisByLecturer with course info for display
const enrichedAnalysis = computed(() => {
  return evalStore.analysisByLecturer.map(lec => {
    // Find all distinct courses this lecturer was evaluated for
    const courses = [...new Set(
      evalStore.evaluations
        .filter(e => e.lecturer_id === lec.lecturerId && e.course_id)
        .map(e => e.course_id)
    )].map(id => ({ id, label: courseNames.value[id] ?? id }));
    return { ...lec, courses };
  });
});

const filteredAnalysis = computed(() => {
  let list = enrichedAnalysis.value;
  if (filterLecturer.value) list = list.filter(l => l.lecturerId === filterLecturer.value);
  if (filterCourse.value)   list = list.filter(l => l.courses.some(c => c.id === filterCourse.value));
  if (searchQ.value.trim()) {
    const q = searchQ.value.toLowerCase();
    list = list.filter(l =>
      (lecturerNames.value[l.lecturerId] ?? '').toLowerCase().includes(q) ||
      l.courses.some(c => c.label.toLowerCase().includes(q))
    );
  }
  return list;
});

const uniqueLecturers = computed(() => new Set(evalStore.evaluations.map(e => e.lecturer_id)).size);
const uniqueCourses   = computed(() => new Set(evalStore.evaluations.map(e => e.course_id)).size);

// For the course filter dropdown — all courses that have been evaluated
const evaluatedCourses = computed(() =>
  [...new Set(evalStore.evaluations.map(e => e.course_id).filter(Boolean))]
    .map(id => ({ id, label: courseNames.value[id] ?? id }))
    .sort((a, b) => a.label.localeCompare(b.label))
);

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