<template>
  <div class="space-y-8 p-1 sm:p-2 lg:p-4 animate-in fade-in duration-500">

    <!-- Header -->
    <div class="relative bg-white dark:bg-dark-surface border border-slate-200/80 dark:border-dark-outline/60 rounded-2xl p-6 sm:p-8 shadow-sm overflow-hidden">
      <div class="absolute inset-0 bg-[radial-gradient(#031c45_1px,transparent_1px)] dark:bg-[radial-gradient(#bc9333_1px,transparent_1px)] opacity-[0.03] dark:opacity-[0.05] bg-[size:16px_16px] pointer-events-none"></div>
      <div class="absolute top-2 left-2 w-3 h-3 border-t-2 border-l-2 border-secondary/40 pointer-events-none"></div>
      <div class="absolute top-2 right-2 w-3 h-3 border-t-2 border-r-2 border-secondary/40 pointer-events-none"></div>

      <div class="relative z-10">
        <div class="flex items-center gap-2 mb-1.5">
          <span class="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-mono font-medium tracking-wide uppercase bg-primary/10 text-primary dark:bg-secondary/15 dark:text-secondary border border-primary/20 dark:border-secondary/30">
            <GraduationCap class="w-3 h-3" />
            ADMIN // ACADEMIC CALENDAR
          </span>
        </div>
        <h1 class="text-2xl sm:text-3xl font-display font-bold text-slate-900 dark:text-white tracking-tight">Semester Setup</h1>
        <p class="text-sm text-slate-500 dark:text-white/75 mt-1">Configure academic calendars, terms, and active sessions.</p>
      </div>
    </div>

    <div class="grid grid-cols-1 lg:grid-cols-5 gap-6 items-start">

      <!-- LEFT: Configuration Form -->
      <div class="lg:col-span-3 bg-white dark:bg-dark-surface border border-slate-200/80 dark:border-dark-outline/60 rounded-2xl shadow-sm overflow-hidden">
        <div class="p-6 border-b border-slate-100 dark:border-dark-outline">
          <h2 class="text-base font-display font-bold text-slate-900 dark:text-white">{{ editingSemesterId ? 'Update Semester' : 'Configure New Semester' }}</h2>
          <p class="text-xs text-slate-500 dark:text-white/75 mt-0.5">Define the dates and parameters for an academic term.</p>
        </div>

        <form @submit.prevent="saveSemester" class="p-6 space-y-5">
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <!-- Academic Year -->
            <div class="space-y-1.5">
              <label class="text-[11px] font-mono uppercase tracking-wider text-slate-500 dark:text-white/75">Academic Year <span class="text-rose-500">*</span></label>
              <select v-model="form.year" required
                class="w-full bg-slate-50 dark:bg-dark-muted/80 border border-slate-200 dark:border-dark-outline/70 rounded-xl px-3 py-2.5 text-sm text-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-secondary/50">
                <option disabled value="">Select Year</option>
                <option value="2023/2024">2023/2024</option>
                <option value="2024/2025">2024/2025</option>
                <option value="2025/2026">2025/2026</option>
                <option value="2026/2027">2026/2027</option>
              </select>
            </div>

            <!-- Semester Term -->
            <div class="space-y-1.5">
              <label class="text-[11px] font-mono uppercase tracking-wider text-slate-500 dark:text-white/75">Semester Term <span class="text-rose-500">*</span></label>
              <select v-model="form.term" required
                class="w-full bg-slate-50 dark:bg-dark-muted/80 border border-slate-200 dark:border-dark-outline/70 rounded-xl px-3 py-2.5 text-sm text-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-secondary/50">
                <option disabled value="">Select Semester</option>
                <option value="First Semester">First Semester</option>
                <option value="Second Semester">Second Semester</option>
                <option value="Summer Session">Summer Session</option>
              </select>
            </div>
          </div>

          <!-- Lecture Dates -->
          <div>
            <label class="text-[11px] font-mono uppercase tracking-wider text-slate-500 dark:text-white/75 mb-2 block">Lecture Period <span class="text-rose-500">*</span></label>
            <div class="grid grid-cols-2 gap-3">
              <div class="space-y-1">
                <label class="text-[10px] text-slate-400 dark:text-white/50 font-mono">Start Date</label>
                <input type="date" v-model="form.startDate" required
                  class="w-full bg-slate-50 dark:bg-dark-muted/80 border border-slate-200 dark:border-dark-outline/70 rounded-xl px-3 py-2.5 text-sm text-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-secondary/50" />
              </div>
              <div class="space-y-1">
                <label class="text-[10px] text-slate-400 dark:text-white/50 font-mono">End Date</label>
                <input type="date" v-model="form.endDate" required
                  class="w-full bg-slate-50 dark:bg-dark-muted/80 border border-slate-200 dark:border-dark-outline/70 rounded-xl px-3 py-2.5 text-sm text-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-secondary/50" />
              </div>
            </div>
          </div>

          <!-- Exam Dates -->
          <div>
            <label class="text-[11px] font-mono uppercase tracking-wider text-slate-500 dark:text-white/75 mb-2 block">Exam Period (Optional)</label>
            <div class="grid grid-cols-2 gap-3">
              <div class="space-y-1">
                <label class="text-[10px] text-slate-400 dark:text-white/50 font-mono">Exams Start</label>
                <input type="date" v-model="form.examsStart"
                  class="w-full bg-slate-50 dark:bg-dark-muted/80 border border-slate-200 dark:border-dark-outline/70 rounded-xl px-3 py-2.5 text-sm text-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-secondary/50" />
              </div>
              <div class="space-y-1">
                <label class="text-[10px] text-slate-400 dark:text-white/50 font-mono">Exams End</label>
                <input type="date" v-model="form.examsEnd"
                  class="w-full bg-slate-50 dark:bg-dark-muted/80 border border-slate-200 dark:border-dark-outline/70 rounded-xl px-3 py-2.5 text-sm text-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-secondary/50" />
              </div>
            </div>
          </div>

          <!-- Active checkbox -->
          <label class="flex items-start gap-3 cursor-pointer group">
            <input type="checkbox" v-model="form.isCurrent"
              class="w-4 h-4 mt-0.5 rounded border-slate-300 dark:border-slate-600 text-secondary focus:ring-secondary/40 accent-[#bc9333]" />
            <div>
              <div class="text-sm font-semibold text-slate-800 dark:text-white">Set as current active semester</div>
              <div class="text-xs text-slate-400 dark:text-white/50 mt-0.5">This will deactivate any currently active semester automatically.</div>
            </div>
          </label>

          <!-- Actions -->
          <div class="flex items-center gap-3 pt-2">
            <button type="submit" :disabled="semestersStore.isLoading"
              class="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-primary hover:bg-primary/90 text-white text-sm font-semibold transition-all shadow-md disabled:opacity-50 active:scale-95"
            >
              <Save class="w-4 h-4" />
              {{ editingSemesterId ? 'Update Configuration' : 'Save Configuration' }}
            </button>
            <button type="button" @click="resetForm"
              class="px-4 py-2.5 rounded-xl border border-slate-200 dark:border-dark-outline/70 text-sm font-semibold text-slate-700 dark:text-white/90 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">
              {{ editingSemesterId ? 'Cancel' : 'Clear' }}
            </button>
          </div>
        </form>
      </div>

      <!-- RIGHT: Active + History -->
      <div class="lg:col-span-2 space-y-5">

        <!-- Active Semester Card -->
        <div v-if="activeSemester" class="relative bg-primary dark:bg-[#0a1f3d] border border-primary/80 dark:border-secondary/40 rounded-2xl p-5 shadow-md overflow-hidden">
          <div class="absolute inset-0 bg-[radial-gradient(#bc9333_1px,transparent_1px)] opacity-[0.06] bg-[size:14px_14px] pointer-events-none"></div>
          <div class="relative z-10">
            <span class="inline-flex items-center gap-1 text-[10px] font-mono font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-secondary/20 text-secondary border border-secondary/30 mb-3">
              <span class="w-1.5 h-1.5 rounded-full bg-secondary animate-pulse"></span>
              CURRENTLY ACTIVE
            </span>
            <div class="text-2xl font-display font-extrabold text-white">{{ activeSemester.year }}</div>
            <div class="text-sm font-bold text-secondary mt-1">{{ activeSemester.term }}</div>
            <div class="mt-4 space-y-2">
              <div class="flex items-center gap-2 text-xs text-white/70">
                <div class="w-1.5 h-1.5 rounded-full bg-emerald-400"></div>
                <span>Lectures Begin</span>
                <span class="ml-auto font-mono text-white font-bold">{{ formatDate(activeSemester.startDate) }}</span>
              </div>
              <div class="flex items-center gap-2 text-xs text-white/70">
                <div class="w-1.5 h-1.5 rounded-full bg-rose-400"></div>
                <span>Semester Ends</span>
                <span class="ml-auto font-mono text-white font-bold">{{ formatDate(activeSemester.examsEnd || activeSemester.endDate) }}</span>
              </div>
            </div>
          </div>
        </div>

        <!-- History List -->
        <div class="bg-white dark:bg-dark-surface border border-slate-200/80 dark:border-dark-outline/60 rounded-2xl shadow-sm overflow-hidden">
          <div class="p-5 border-b border-slate-100 dark:border-dark-outline">
            <h2 class="text-sm font-display font-bold text-slate-900 dark:text-white">Saved Configurations</h2>
          </div>

          <div v-if="semesters.length === 0" class="p-8 text-center text-slate-400 dark:text-white/50 text-sm">No semesters configured yet.</div>

          <ul v-else class="divide-y divide-slate-100 dark:divide-slate-800/60">
            <li v-for="sem in sortedSemesters" :key="sem.id" class="px-5 py-4 hover:bg-slate-50/60 dark:hover:bg-slate-800/30 transition-colors">
              <div class="flex items-start gap-3">
                <div :class="['w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5',
                  sem.isCurrent ? 'bg-secondary/20 border border-secondary/30 text-secondary' : 'bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-emerald-600 dark:text-emerald-400'
                ]">
                  <Clock v-if="sem.isCurrent" class="w-3.5 h-3.5" />
                  <CheckCircle2 v-else class="w-3.5 h-3.5" />
                </div>
                <div class="flex-1 min-w-0">
                  <div class="text-xs font-bold text-slate-900 dark:text-white">
                    {{ sem.term }} <span class="text-slate-400 dark:text-white/50 font-normal">({{ sem.year }})</span>
                  </div>
                  <div class="text-[11px] font-mono text-slate-400 dark:text-white/50 mt-0.5">{{ formatDate(sem.startDate) }} — {{ formatDate(sem.endDate) }}</div>

                  <div v-if="!sem.isCurrent" class="flex items-center gap-1.5 mt-2">
                    <button @click="setActive(sem.id)" class="text-[10px] font-mono font-bold px-2 py-1 rounded-lg bg-secondary/10 text-secondary border border-secondary/30 hover:bg-secondary/20 transition-colors">
                      Set Active
                    </button>
                    <button @click="editSemester(sem)" title="Edit" class="p-1.5 text-slate-400 hover:text-primary dark:hover:text-secondary hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors">
                      <Edit3 class="w-3 h-3" />
                    </button>
                    <button @click="deleteSemester(sem.id)" title="Delete" class="p-1.5 text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/40 rounded-lg transition-colors">
                      <Trash2 class="w-3 h-3" />
                    </button>
                  </div>
                </div>
              </div>
            </li>
          </ul>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue';
import { useSemestersStore } from '@/stores/semesters';
import { useAuditLogsStore } from '@/stores/auditlogs';
import { supabase } from '@/stores/supabase';
import { GraduationCap, Save, Clock, CheckCircle2, Edit3, Trash2 } from 'lucide-vue-next';

const semestersStore = useSemestersStore();
const auditLogsStore = useAuditLogsStore();

const initialForm = { year: '', term: '', startDate: '', endDate: '', examsStart: '', examsEnd: '', isCurrent: false };
const form = ref({ ...initialForm });
const editingSemesterId = ref(null);
const currentUser = ref(null);

const semesters = computed(() =>
  semestersStore.semesters.map((s) => ({
    ...s,
    year: s.name.split(' - ')[0],
    term: s.name.split(' - ')[1] || s.name,
    isCurrent: s.isActive,
  }))
);

const loadCurrentUser = async () => {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return;
  const { data, error } = await supabase.from('users').select('id, name, role').eq('id', user.id).single();
  if (!error) currentUser.value = data;
};

const logAudit = (action, details) => {
  if (!currentUser.value) return;
  auditLogsStore.logAction({ action, details, userId: currentUser.value.id, userRole: currentUser.value.role, userName: currentUser.value.name });
};

onMounted(async () => {
  await Promise.all([semestersStore.fetchSemesters(), loadCurrentUser()]);
  semestersStore.subscribeToSemesters();
});

onUnmounted(() => { semestersStore.unsubscribeFromSemesters(); });

const activeSemester = computed(() => semesters.value.find(s => s.isCurrent));
const sortedSemesters = computed(() => [...semesters.value].sort((a, b) => new Date(b.startDate) - new Date(a.startDate)));

const formatDate = (dateStr) => {
  if (!dateStr) return '';
  return new Date(dateStr).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
};

const resetForm = () => { form.value = { ...initialForm }; editingSemesterId.value = null; };

const editSemester = (sem) => {
  editingSemesterId.value = sem.id;
  form.value = {
    year: sem.year, term: sem.term,
    startDate: sem.startDate ? sem.startDate.split('T')[0] : '',
    endDate: sem.endDate ? sem.endDate.split('T')[0] : '',
    examsStart: sem.examsStart ? sem.examsStart.split('T')[0] : '',
    examsEnd: sem.examsEnd ? sem.examsEnd.split('T')[0] : '',
    isCurrent: sem.isCurrent
  };
};

const saveSemester = async () => {
  const name = `${form.value.year} - ${form.value.term}`;
  const payload = { name, startDate: form.value.startDate, endDate: form.value.endDate, examsStart: form.value.examsStart || null, examsEnd: form.value.examsEnd || null };
  try {
    let semesterId = editingSemesterId.value;
    if (semesterId) {
      await semestersStore.updateSemester(semesterId, payload);
      logAudit('semester_updated', `Updated semester "${name}"`);
    } else {
      const created = await semestersStore.createSemester({ ...payload, isActive: false });
      semesterId = created.id;
      logAudit('semester_created', `Created semester "${name}"`);
    }
    if (form.value.isCurrent) {
      await semestersStore.setActiveSemester(semesterId);
      logAudit('semester_activated', `Set semester "${name}" as active`);
    }
    resetForm();
  } catch (error) { console.error('Error saving semester:', error); }
};

const setActive = async (id) => {
  try {
    const sem = semesters.value.find(s => s.id === id);
    await semestersStore.setActiveSemester(id);
    if (sem) logAudit('semester_activated', `Set semester "${sem.name}" as active`);
  } catch (error) { console.error('Error setting active semester:', error); }
};

const deleteSemester = async (id) => {
  const sem = semesters.value.find(s => s.id === id);
  if (!confirm(`Delete semester "${sem?.name ?? ''}"? This cannot be undone.`)) return;
  try {
    await semestersStore.deleteSemester(id);
    logAudit('semester_deleted', `Deleted semester "${sem?.name ?? ''}"`);
  } catch (error) { console.error('Error deleting semester:', error); }
};
</script>