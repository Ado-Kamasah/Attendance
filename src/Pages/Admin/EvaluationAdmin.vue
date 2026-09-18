<template>
  <div class="space-y-8 p-1 sm:p-2 lg:p-4 animate-in fade-in duration-500">
    <!-- Header with Blueprint Eyebrow & Status Toggle -->
    <div class="relative overflow-hidden rounded-2xl bg-white dark:bg-dark-surface border border-slate-200/80 dark:border-dark-outline/60 p-6 sm:p-8 shadow-sm">
      <div class="absolute inset-0 bg-[radial-gradient(#031c45_1px,transparent_1px)] dark:bg-[radial-gradient(#ffffff_1px,transparent_1px)] bg-[size:16px_16px] opacity-[0.03] dark:opacity-[0.02] pointer-events-none"></div>
      
      <!-- Blueprint Corner Accents -->
      <div class="absolute top-0 left-0 w-3 h-3 border-t-2 border-l-2 border-secondary/40"></div>
      <div class="absolute top-0 right-0 w-3 h-3 border-t-2 border-r-2 border-secondary/40"></div>
      <div class="absolute bottom-0 left-0 w-3 h-3 border-b-2 border-l-2 border-secondary/40"></div>
      <div class="absolute bottom-0 right-0 w-3 h-3 border-b-2 border-r-2 border-secondary/40"></div>

      <div class="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
        <div>
          <div class="inline-flex items-center gap-2 px-2.5 py-1 rounded-md bg-secondary/10 border border-secondary/20 text-secondary text-[11px] font-mono uppercase tracking-wider mb-3">
            <Sparkles class="w-3.5 h-3.5" />
            <span>FACULTY EVALUATION // QA INTELLIGENCE</span>
          </div>
          <h1 class="text-2xl sm:text-3xl font-extrabold font-display tracking-tight text-slate-900 dark:text-white">
            Evaluation <span class="text-secondary">Management</span>
          </h1>
          <p class="text-xs sm:text-sm font-mono text-slate-500 dark:text-white/75 mt-1">
            Control student feedback windows and inspect real-time academic survey metrics
          </p>
        </div>

        <!-- Access Toggle Card -->
        <div 
          class="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 sm:p-5 rounded-xl border transition-all duration-200 min-w-[280px] lg:min-w-[360px]"
          :class="evalStore.settings.isOpen 
            ? 'bg-emerald-50/70 dark:bg-emerald-950/20 border-emerald-200 dark:border-emerald-800/40' 
            : 'bg-rose-50/70 dark:bg-rose-950/20 border-rose-200 dark:border-rose-800/40'"
        >
          <div class="flex items-center gap-3">
            <span class="relative flex h-3 w-3">
              <span 
                class="animate-ping absolute inline-flex h-full w-full rounded-full opacity-75"
                :class="evalStore.settings.isOpen ? 'bg-emerald-400' : 'bg-rose-400'"
              ></span>
              <span 
                class="relative inline-flex rounded-full h-3 w-3"
                :class="evalStore.settings.isOpen ? 'bg-emerald-500' : 'bg-rose-500'"
              ></span>
            </span>
            <div>
              <p class="text-xs sm:text-sm font-bold font-display text-slate-900 dark:text-white">
                Evaluations are {{ evalStore.settings.isOpen ? 'OPEN' : 'CLOSED' }}
              </p>
              <p class="text-[11px] font-mono text-slate-500 dark:text-white/75">
                {{ evalStore.settings.isOpen ? 'Students can submit reviews' : 'Survey portal is locked' }}
              </p>
            </div>
          </div>

          <button 
            @click="handleToggle" 
            id="ea-toggle-btn"
            class="px-4 py-2 rounded-xl text-xs font-mono font-bold tracking-wide transition-all shadow-sm active:scale-95 cursor-pointer self-start sm:self-center"
            :class="evalStore.settings.isOpen 
              ? 'bg-rose-600 hover:bg-rose-700 text-white shadow-rose-600/20' 
              : 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-emerald-600/20'"
          >
            {{ evalStore.settings.isOpen ? 'Close Portal' : 'Open Portal' }}
          </button>
        </div>
      </div>
    </div>

    <!-- KPI Strip -->
    <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
      <!-- Total Responses -->
      <div class="relative overflow-hidden rounded-2xl bg-white dark:bg-dark-surface border border-slate-200/80 dark:border-dark-outline/60 p-5 shadow-sm group hover:border-secondary/40 transition-all">
        <div class="flex items-center gap-4">
          <div class="w-12 h-12 rounded-xl bg-indigo-50 dark:bg-indigo-950/40 border border-indigo-200/60 dark:border-indigo-800/40 text-indigo-600 dark:text-indigo-400 flex items-center justify-center shrink-0">
            <Users class="w-6 h-6" />
          </div>
          <div class="min-w-0 flex-1">
            <p class="text-[11px] font-mono uppercase text-slate-500 dark:text-white/75 font-semibold tracking-wider">Responses</p>
            <h3 class="text-2xl font-black font-display text-slate-900 dark:text-white tracking-tight mt-0.5">
              {{ evalStore.evaluations.length }}
            </h3>
          </div>
        </div>
      </div>

      <!-- Lecturers Evaluated -->
      <div class="relative overflow-hidden rounded-2xl bg-white dark:bg-dark-surface border border-slate-200/80 dark:border-dark-outline/60 p-5 shadow-sm group hover:border-secondary/40 transition-all">
        <div class="flex items-center gap-4">
          <div class="w-12 h-12 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200/60 dark:border-emerald-800/40 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0">
            <GraduationCap class="w-6 h-6" />
          </div>
          <div class="min-w-0 flex-1">
            <p class="text-[11px] font-mono uppercase text-slate-500 dark:text-white/75 font-semibold tracking-wider">Lecturers</p>
            <h3 class="text-2xl font-black font-display text-slate-900 dark:text-white tracking-tight mt-0.5">
              {{ uniqueLecturers }}
            </h3>
          </div>
        </div>
      </div>

      <!-- Courses Evaluated -->
      <div class="relative overflow-hidden rounded-2xl bg-white dark:bg-dark-surface border border-slate-200/80 dark:border-dark-outline/60 p-5 shadow-sm group hover:border-secondary/40 transition-all">
        <div class="flex items-center gap-4">
          <div class="w-12 h-12 rounded-xl bg-purple-50 dark:bg-purple-950/40 border border-purple-200/60 dark:border-purple-800/40 text-purple-600 dark:text-purple-400 flex items-center justify-center shrink-0">
            <BookOpen class="w-6 h-6" />
          </div>
          <div class="min-w-0 flex-1">
            <p class="text-[11px] font-mono uppercase text-slate-500 dark:text-white/75 font-semibold tracking-wider">Courses</p>
            <h3 class="text-2xl font-black font-display text-slate-900 dark:text-white tracking-tight mt-0.5">
              {{ uniqueCourses }}
            </h3>
          </div>
        </div>
      </div>

      <!-- Avg Overall Rating -->
      <div class="relative overflow-hidden rounded-2xl bg-white dark:bg-dark-surface border border-slate-200/80 dark:border-dark-outline/60 p-5 shadow-sm group hover:border-secondary/40 transition-all">
        <div class="flex items-center gap-4">
          <div class="w-12 h-12 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200/60 dark:border-amber-800/40 text-amber-600 dark:text-amber-400 flex items-center justify-center shrink-0">
            <Star class="w-6 h-6" />
          </div>
          <div class="min-w-0 flex-1">
            <p class="text-[11px] font-mono uppercase text-slate-500 dark:text-white/75 font-semibold tracking-wider">Avg Rating</p>
            <h3 class="text-2xl font-black font-display text-slate-900 dark:text-white tracking-tight mt-0.5">
              {{ avgOverallRating }}%
            </h3>
          </div>
        </div>
      </div>

      <!-- Retention Rate -->
      <div class="relative overflow-hidden rounded-2xl bg-white dark:bg-dark-surface border border-slate-200/80 dark:border-dark-outline/60 p-5 shadow-sm group hover:border-secondary/40 transition-all">
        <div class="flex items-center gap-4">
          <div class="w-12 h-12 rounded-xl bg-sky-50 dark:bg-sky-950/40 border border-sky-200/60 dark:border-sky-800/40 text-sky-600 dark:text-sky-400 flex items-center justify-center shrink-0">
            <TrendingUp class="w-6 h-6" />
          </div>
          <div class="min-w-0 flex-1">
            <p class="text-[11px] font-mono uppercase text-slate-500 dark:text-white/75 font-semibold tracking-wider">Retention</p>
            <h3 class="text-2xl font-black font-display text-slate-900 dark:text-white tracking-tight mt-0.5">
              {{ avgRetentionRate }}%
            </h3>
          </div>
        </div>
      </div>
    </div>

    <!-- Filters Strip -->
    <div class="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 bg-white dark:bg-dark-surface border border-slate-200/80 dark:border-dark-outline/60 rounded-2xl p-3 shadow-sm">
      <select 
        v-model="filterLecturer" 
        id="ea-lecturer-filter"
        class="bg-slate-50 dark:bg-dark-muted/70 border border-slate-200 dark:border-dark-outline rounded-xl px-3.5 py-2 text-xs font-mono text-slate-800 dark:text-white focus:outline-hidden focus:border-secondary"
      >
        <option value="">All Lecturers</option>
        <option v-for="(name, id) in lecturerNames" :key="id" :value="id">{{ name }}</option>
      </select>

      <select 
        v-model="filterCourse" 
        id="ea-course-filter"
        class="bg-slate-50 dark:bg-dark-muted/70 border border-slate-200 dark:border-dark-outline rounded-xl px-3.5 py-2 text-xs font-mono text-slate-800 dark:text-white focus:outline-hidden focus:border-secondary"
      >
        <option value="">All Courses</option>
        <option v-for="c in evaluatedCourses" :key="c.id" :value="c.id">{{ c.label }}</option>
      </select>

      <div class="relative flex-1">
        <Search class="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
        <input 
          v-model="searchQ" 
          type="text" 
          placeholder="Search lecturer or course name…" 
          id="ea-search"
          class="w-full pl-9 pr-4 py-2 bg-slate-50 dark:bg-dark-muted/70 border border-slate-200 dark:border-dark-outline rounded-xl text-xs font-mono text-slate-800 dark:text-white placeholder:text-slate-400 focus:outline-hidden focus:border-secondary"
        />
      </div>
    </div>

    <!-- Status States -->
    <div v-if="evalStore.isLoading" class="py-20 text-center rounded-2xl bg-white dark:bg-dark-surface border border-slate-200/80 dark:border-dark-outline/60">
      <div class="inline-block animate-spin w-6 h-6 border-2 border-secondary border-t-transparent rounded-full mb-2"></div>
      <p class="text-xs font-mono text-slate-500 dark:text-white/75">Loading evaluation survey data…</p>
    </div>

    <div v-else-if="evalStore.error" class="p-6 rounded-2xl bg-rose-50 dark:bg-rose-950/20 border border-rose-200 dark:border-rose-800/50 text-center">
      <AlertTriangle class="w-8 h-8 text-rose-500 mx-auto mb-2" />
      <p class="text-xs font-mono text-rose-600 dark:text-rose-400">{{ evalStore.error }}</p>
    </div>

    <div v-else-if="filteredAnalysis.length === 0" class="py-20 text-center rounded-2xl bg-white dark:bg-dark-surface border border-dashed border-slate-300 dark:border-dark-outline">
      <CheckCircle2 class="w-10 h-10 text-slate-300 dark:text-white/35 mx-auto mb-3" />
      <h3 class="text-sm font-bold font-display text-slate-700 dark:text-white/90">No evaluation responses found</h3>
      <p class="text-xs font-mono text-slate-400 mt-1">Adjust filters or open evaluations for student submissions</p>
    </div>

    <!-- Per-Lecturer Analysis Cards Grid -->
    <div v-else class="space-y-6">
      <div 
        v-for="lec in filteredAnalysis" 
        :key="lec.lecturerId" 
        class="relative overflow-hidden rounded-2xl bg-white dark:bg-dark-surface border border-slate-200/80 dark:border-dark-outline/60 shadow-sm"
      >
        <!-- Blueprint Corner Accent -->
        <div class="absolute top-0 right-0 w-2.5 h-2.5 border-t-2 border-r-2 border-secondary/30"></div>

        <!-- Lecturer Card Header -->
        <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 sm:p-6 bg-slate-50/70 dark:bg-dark-muted/60 border-b border-slate-200/80 dark:border-dark-outline/60">
          <div class="flex items-center gap-4">
            <div class="w-12 h-12 rounded-xl bg-gradient-to-br from-primary to-slate-800 text-white font-black font-display text-lg flex items-center justify-center shadow-md shrink-0 border border-secondary/20">
              {{ (lecturerNames[lec.lecturerId] || 'L').charAt(0) }}
            </div>
            <div>
              <h2 class="text-base sm:text-lg font-bold font-display text-slate-900 dark:text-white">
                {{ lecturerNames[lec.lecturerId] ?? 'Unknown Lecturer' }}
              </h2>
              <div class="flex items-center gap-2 mt-0.5">
                <span class="text-xs font-mono text-slate-500 dark:text-white/75">
                  {{ lec.totalResponses }} submission{{ lec.totalResponses !== 1 ? 's' : '' }}
                </span>
              </div>
              <!-- Course badges -->
              <div class="flex flex-wrap gap-1.5 mt-2.5" v-if="lec.courses && lec.courses.length">
                <span 
                  v-for="c in lec.courses" 
                  :key="c.id" 
                  class="inline-flex items-center px-2 py-0.5 rounded-md bg-secondary/10 border border-secondary/20 text-secondary text-[10px] font-mono font-semibold"
                >
                  {{ c.label }}
                </span>
              </div>
            </div>
          </div>

          <!-- Retention Metric Pill -->
          <div class="flex sm:flex-col items-center sm:items-end justify-between sm:justify-center p-3 sm:p-0 rounded-xl bg-white dark:bg-dark-muted/80 sm:bg-transparent border border-slate-200 dark:border-dark-outline sm:border-0">
            <span 
              class="text-2xl sm:text-3xl font-black font-display"
              :class="lec.retainedPct >= 70 ? 'text-emerald-500' : lec.retainedPct >= 45 ? 'text-amber-500' : 'text-rose-500'"
            >
              {{ lec.retainedPct }}%
            </span>
            <span class="text-[10px] font-mono uppercase text-slate-400 font-semibold tracking-wider">
              Student Retention
            </span>
          </div>
        </div>

        <!-- Question Breakdown Accordion / List -->
        <div class="divide-y divide-slate-100 dark:divide-slate-800/60">
          <div 
            v-for="qs in lec.questionStats" 
            :key="qs.questionId" 
            class="p-5 sm:p-6 hover:bg-slate-50/50 dark:hover:bg-slate-900/20 transition-colors"
          >
            <div class="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
              <div class="lg:w-2/5">
                <p class="text-xs sm:text-sm font-semibold text-slate-800 dark:text-white leading-relaxed">
                  {{ qs.text }}
                </p>
                <div v-if="qs.pct !== null" class="flex items-center gap-2 mt-2">
                  <div class="w-24 h-1.5 bg-slate-100 dark:bg-dark-muted rounded-full overflow-hidden">
                    <div 
                      class="h-full rounded-full transition-all duration-500" 
                      :style="{ width: qs.pct + '%', backgroundColor: rateColor(qs.pct) }"
                    ></div>
                  </div>
                  <span class="text-xs font-mono font-bold" :class="rateClass(qs.pct)">
                    {{ qs.pct }}% Satisfied
                  </span>
                </div>
              </div>

              <!-- Option distribution bars -->
              <div class="lg:w-3/5 space-y-1.5">
                <div
                  v-for="(count, opt) in qs.counts"
                  :key="opt"
                  class="flex items-center gap-3 text-xs font-mono"
                >
                  <span class="w-24 text-right text-slate-500 dark:text-white/75 truncate text-[11px]">{{ opt }}</span>
                  <div class="flex-1 h-2 bg-slate-100 dark:bg-dark-muted rounded-full overflow-hidden">
                    <div 
                      class="h-full rounded-full transition-all duration-500"
                      :style="{ width: barPct(count, lec.totalResponses) + '%', backgroundColor: optColor(opt) }"
                    ></div>
                  </div>
                  <span class="w-8 text-right font-bold text-slate-700 dark:text-white/90 text-[11px]">{{ count }}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Student Comments Section -->
        <div v-if="commentsFor(lec.lecturerId).length" class="p-5 sm:p-6 bg-slate-50/50 dark:bg-slate-900/30 border-t border-slate-200/80 dark:border-dark-outline/60">
          <div class="flex items-center gap-2 mb-3">
            <MessageSquare class="w-4 h-4 text-secondary" />
            <h3 class="text-xs font-mono uppercase tracking-wider text-slate-500 dark:text-white/75 font-bold">
              Student Qualitative Feedback ({{ commentsFor(lec.lecturerId).length }})
            </h3>
          </div>
          <div class="grid grid-cols-1 md:grid-cols-2 gap-2.5">
            <div 
              v-for="(c, i) in commentsFor(lec.lecturerId)" 
              :key="i"
              class="p-3 rounded-xl bg-white dark:bg-dark-muted border border-slate-200/80 dark:border-dark-outline text-xs font-mono text-slate-600 dark:text-white/90 leading-relaxed shadow-2xs flex items-start gap-2.5"
            >
              <span class="text-secondary select-none font-bold">“</span>
              <span class="flex-1">{{ c }}</span>
              <span class="text-secondary select-none font-bold">”</span>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Admin Notification Toast via Teleport -->
    <Teleport to="body">
      <transition 
        enter-active-class="transition ease-out duration-300 transform"
        enter-from-class="opacity-0 translate-y-4"
        enter-to-class="opacity-100 translate-y-0"
        leave-active-class="transition ease-in duration-200 transform"
        leave-from-class="opacity-100 translate-y-0"
        leave-to-class="opacity-0 translate-y-4"
      >
        <div 
          v-if="toast" 
          class="fixed bottom-6 right-6 z-50 flex items-center gap-3 px-5 py-3 rounded-xl bg-slate-900 text-white border border-slate-700 shadow-2xl text-xs font-mono font-medium max-w-md"
        >
          <Sparkles class="w-4 h-4 text-secondary shrink-0" />
          <span>{{ toast }}</span>
        </div>
      </transition>
    </Teleport>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { storeToRefs } from 'pinia';
import { useAuthStore }        from '@/stores/authstore';
import { useEvaluationStore, QUESTIONS, SCORE_MAP } from '@/stores/evaluations';
import { supabase }            from '@/stores/supabase';
import api                     from '@/api.js';
import {
  Users,
  GraduationCap,
  BookOpen,
  Star,
  TrendingUp,
  Search,
  MessageSquare,
  AlertTriangle,
  CheckCircle2,
  Sparkles
} from 'lucide-vue-next';

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

const toast = ref('');

async function handleToggle() {
  const wasOpen = evalStore.settings.isOpen;
  await evalStore.toggleEvaluationAccess(profile.value?.id);

  // Only broadcast when opening (not closing)
  if (!wasOpen && evalStore.settings.isOpen) {
    try {
      const { data } = await api.post('/notifications/evaluation-open');
      toast.value = `Evaluations opened — ${data.count} student(s) notified`;
    } catch (e) {
      toast.value = 'Evaluations opened but student notifications could not be sent.';
    }
    setTimeout(() => (toast.value = ''), 4500);
  }
}

// ── Aggregated analysis ────────────────────────────────────────────────────
const enrichedAnalysis = computed(() => {
  return evalStore.analysisByLecturer.map(lec => {
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
  return '#bc9333';
}

function rateClass(p) { return p >= 70 ? 'text-emerald-500' : p >= 45 ? 'text-amber-500' : 'text-rose-500'; }
function rateColor(p) { return p >= 70 ? '#10b981' : p >= 45 ? '#f59e0b' : '#ef4444'; }
</script>