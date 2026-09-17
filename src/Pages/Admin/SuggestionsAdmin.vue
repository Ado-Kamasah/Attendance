<template>
  <div class="space-y-8 p-1 sm:p-2 lg:p-4 animate-in fade-in duration-500">

    <!-- Header -->
    <div class="relative bg-white dark:bg-[#071328] border border-slate-200/80 dark:border-slate-800/80 rounded-2xl p-6 sm:p-8 shadow-sm overflow-hidden">
      <div class="absolute inset-0 bg-[radial-gradient(#031c45_1px,transparent_1px)] dark:bg-[radial-gradient(#bc9333_1px,transparent_1px)] opacity-[0.03] dark:opacity-[0.05] bg-[size:16px_16px] pointer-events-none"></div>
      <div class="corner-tl absolute top-2 left-2 w-3 h-3 border-t-2 border-l-2 border-secondary/40 pointer-events-none"></div>
      <div class="corner-tr absolute top-2 right-2 w-3 h-3 border-t-2 border-r-2 border-secondary/40 pointer-events-none"></div>

      <div class="relative z-10">
        <div class="flex items-center gap-2 mb-1.5">
          <span class="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-mono font-medium tracking-wide uppercase bg-primary/10 text-primary dark:bg-secondary/15 dark:text-secondary border border-primary/20 dark:border-secondary/30">
            <MessageSquare class="w-3 h-3" />
            ADMIN // SUGGESTION BOX
          </span>
        </div>
        <h1 class="text-2xl sm:text-3xl font-display font-bold text-slate-900 dark:text-white tracking-tight">Suggestion Box</h1>
        <p class="text-sm text-slate-500 dark:text-slate-400 mt-1">Review complaints, suggestions and feedback submitted by students.</p>
      </div>
    </div>

    <!-- KPI Pills -->
    <div class="flex flex-wrap gap-3">
      <div class="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-sky-50 dark:bg-sky-950/40 border border-sky-200 dark:border-sky-800">
        <span class="text-2xl font-display font-extrabold text-sky-700 dark:text-sky-400">{{ unread }}</span>
        <span class="text-xs font-mono uppercase tracking-wider text-sky-600 dark:text-sky-400 font-bold">Unread</span>
      </div>
      <div class="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800">
        <span class="text-2xl font-display font-extrabold text-amber-700 dark:text-amber-400">{{ reviewed }}</span>
        <span class="text-xs font-mono uppercase tracking-wider text-amber-600 dark:text-amber-400 font-bold">Reviewed</span>
      </div>
      <div class="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800">
        <span class="text-2xl font-display font-extrabold text-emerald-700 dark:text-emerald-400">{{ resolved }}</span>
        <span class="text-xs font-mono uppercase tracking-wider text-emerald-600 dark:text-emerald-400 font-bold">Resolved</span>
      </div>
    </div>

    <!-- Filters -->
    <div class="bg-white dark:bg-[#071328] border border-slate-200/80 dark:border-slate-800/80 rounded-2xl p-5 shadow-sm flex flex-col sm:flex-row flex-wrap gap-3">
      <div class="flex-1 relative min-w-[200px]">
        <Search class="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
        <input v-model="search" type="text" placeholder="Search subject or message…"
          class="w-full pl-10 pr-4 py-2.5 bg-slate-50 dark:bg-slate-900/80 border border-slate-200 dark:border-slate-700 rounded-xl text-sm text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-secondary/50 transition-all" />
      </div>
      <select v-model="filterStatus"
        class="bg-slate-50 dark:bg-slate-900/80 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2.5 text-sm text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-secondary/50">
        <option value="">All Statuses</option>
        <option value="unread">Unread</option>
        <option value="reviewed">Reviewed</option>
        <option value="resolved">Resolved</option>
      </select>
      <select v-model="filterCategory"
        class="bg-slate-50 dark:bg-slate-900/80 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2.5 text-sm text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-secondary/50">
        <option value="">All Categories</option>
        <option value="complaint">Complaint</option>
        <option value="suggestion">Suggestion</option>
        <option value="feedback">Feedback</option>
        <option value="other">Other</option>
      </select>
      <button @click="load" :disabled="isLoading"
        class="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:text-primary dark:hover:text-secondary text-sm font-medium transition-all shadow-sm disabled:opacity-50 whitespace-nowrap"
      >
        <RefreshCw class="w-4 h-4" :class="{ 'animate-spin': isLoading }" />
        Refresh
      </button>
    </div>

    <!-- Loading -->
    <div v-if="isLoading" class="flex flex-col items-center justify-center py-20">
      <Loader2 class="w-10 h-10 text-secondary animate-spin mb-4" />
      <p class="text-sm font-mono text-slate-500 dark:text-slate-400">LOADING SUBMISSIONS...</p>
    </div>

    <!-- Empty -->
    <div v-else-if="filtered.length === 0" class="bg-white dark:bg-[#071328] border border-dashed border-slate-200 dark:border-slate-800 rounded-2xl p-14 text-center">
      <MessageSquare class="w-12 h-12 text-slate-300 dark:text-slate-600 mx-auto mb-4" />
      <p class="text-sm text-slate-400">No submissions found.</p>
    </div>

    <!-- Cards -->
    <div v-else class="space-y-4">
      <div
        v-for="s in filtered"
        :key="s.id"
        :class="['bg-white dark:bg-[#071328] border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-sm hover:shadow-md transition-all border-l-4', getCategoryBorder(s.category)]"
      >
        <!-- Top row -->
        <div class="flex flex-wrap items-center gap-2 mb-3">
          <span :class="['inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-mono font-bold border', getCategoryBadge(s.category)]">
            {{ catLabel(s.category) }}
          </span>
          <span :class="['inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-mono font-bold border', getStatusBadge(s.status)]">
            {{ statusLabel(s.status) }}
          </span>
          <span class="ml-auto text-[11px] font-mono text-slate-400">{{ fmtDate(s.createdAt) }}</span>
        </div>

        <!-- Student info -->
        <div class="flex items-center gap-2 mb-3">
          <template v-if="s.isAnonymous">
            <span class="text-[11px] font-mono px-2 py-0.5 rounded-full bg-violet-50 dark:bg-violet-950/40 text-violet-700 dark:text-violet-400 border border-violet-200 dark:border-violet-800 font-bold">Anonymous Submission</span>
          </template>
          <template v-else>
            <div class="w-7 h-7 rounded-lg bg-gradient-to-br from-primary to-primary/70 dark:from-secondary dark:to-secondary/70 text-white dark:text-primary flex items-center justify-center font-bold text-xs uppercase">
              {{ (s.studentName || '?').charAt(0).toUpperCase() }}
            </div>
            <div>
              <div class="text-xs font-bold text-slate-900 dark:text-slate-100">{{ s.studentName }}</div>
              <div v-if="s.idNumber" class="text-[10px] font-mono text-slate-400">{{ s.idNumber }}</div>
            </div>
          </template>
        </div>

        <!-- Subject + Message -->
        <p class="font-bold text-sm text-slate-900 dark:text-white mb-1">{{ s.subject }}</p>
        <p class="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">{{ s.message }}</p>

        <!-- Admin note -->
        <div v-if="s.adminNote" class="mt-3 flex items-start gap-2 px-3 py-2.5 rounded-xl bg-sky-50 dark:bg-sky-950/40 border border-sky-200 dark:border-sky-800 text-xs text-sky-700 dark:text-sky-400">
          <MessageSquare class="w-3.5 h-3.5 flex-shrink-0 mt-0.5" />
          <span><strong>Your note:</strong> {{ s.adminNote }}</span>
        </div>

        <!-- Actions -->
        <div class="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 flex flex-wrap items-center gap-2">
          <div class="flex gap-1.5 flex-wrap">
            <button v-for="st in statusOptions" :key="st.value"
              @click="changeStatus(s, st.value)"
              :disabled="s.status === st.value || s._saving"
              :class="['px-2.5 py-1 rounded-lg text-[11px] font-mono font-bold border transition-all disabled:cursor-not-allowed',
                s.status === st.value
                  ? getStatusActiveCls(st.value)
                  : 'bg-slate-50 dark:bg-slate-900 text-slate-500 dark:text-slate-400 border-slate-200 dark:border-slate-700 hover:border-slate-300 opacity-60 hover:opacity-100'
              ]"
            >{{ st.label }}</button>
          </div>
          <button @click="openNote(s)"
            class="ml-auto inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-semibold text-slate-600 dark:text-slate-300 hover:border-primary dark:hover:border-secondary hover:text-primary dark:hover:text-secondary transition-all"
          >
            <MessageSquare class="w-3.5 h-3.5" />
            {{ s.adminNote ? 'Edit Note' : 'Add Note' }}
          </button>
        </div>
      </div>
    </div>

    <!-- Note Modal -->
    <Teleport to="body">
      <transition name="fade">
        <div v-if="noteModal.open" class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm" @click.self="noteModal.open = false">
          <div class="relative w-full max-w-md bg-white dark:bg-[#071328] border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl p-6 space-y-4">
            <div class="corner-tl absolute top-2 left-2 w-3 h-3 border-t-2 border-l-2 border-secondary/40 pointer-events-none"></div>
            <div class="corner-tr absolute top-2 right-2 w-3 h-3 border-t-2 border-r-2 border-secondary/40 pointer-events-none"></div>

            <div class="flex items-center justify-between">
              <span class="font-display font-bold text-slate-900 dark:text-white text-base">Add / Edit Response Note</span>
              <button @click="noteModal.open = false" class="p-1.5 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">
                <X class="w-4 h-4" />
              </button>
            </div>

            <p class="text-xs text-slate-500 dark:text-slate-400 font-mono">Re: {{ noteModal.subject }}</p>

            <textarea
              v-model="noteModal.note"
              rows="5"
              placeholder="Write your internal note or response here…"
              class="w-full bg-slate-50 dark:bg-slate-900/80 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2.5 text-sm text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-secondary/50 resize-y transition-all"
            ></textarea>

            <div class="flex items-center justify-end gap-3">
              <button @click="noteModal.open = false" class="px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-sm font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">Cancel</button>
              <button @click="saveNote" :disabled="noteModal.saving"
                class="px-5 py-2.5 rounded-xl bg-primary hover:bg-primary/90 text-white text-sm font-semibold transition-all shadow-md inline-flex items-center gap-2 disabled:opacity-50 active:scale-95"
              >
                <Loader2 v-if="noteModal.saving" class="w-4 h-4 animate-spin" />
                <span>{{ noteModal.saving ? 'Saving…' : 'Save Note' }}</span>
              </button>
            </div>
          </div>
        </div>
      </transition>
    </Teleport>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, reactive } from 'vue';
import { supabase } from '@/stores/supabase';
import { MessageSquare, Search, RefreshCw, Loader2, X } from 'lucide-vue-next';

const suggestions = ref([]);
const isLoading   = ref(false);
const search         = ref('');
const filterStatus   = ref('');
const filterCategory = ref('');

const noteModal = reactive({ open: false, id: '', subject: '', note: '', saving: false });

const statusOptions = [
  { value: 'unread',   label: 'Unread'   },
  { value: 'reviewed', label: 'Reviewed' },
  { value: 'resolved', label: 'Resolved' },
];

const categories = [
  { value: 'complaint',  label: 'Complaint'  },
  { value: 'suggestion', label: 'Suggestion' },
  { value: 'feedback',   label: 'Feedback'   },
  { value: 'other',      label: 'Other'      },
];

const catLabel = (v) => categories.find(c => c.value === v)?.label ?? v;
const statusLabel = (s) => ({ unread: 'Unread', reviewed: 'Reviewed', resolved: 'Resolved' })[s] ?? s;
const fmtDate = (d) => new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });

const unread   = computed(() => suggestions.value.filter(s => s.status === 'unread').length);
const reviewed = computed(() => suggestions.value.filter(s => s.status === 'reviewed').length);
const resolved = computed(() => suggestions.value.filter(s => s.status === 'resolved').length);

const filtered = computed(() => {
  let list = suggestions.value;
  if (filterStatus.value)   list = list.filter(s => s.status   === filterStatus.value);
  if (filterCategory.value) list = list.filter(s => s.category === filterCategory.value);
  if (search.value.trim()) { const q = search.value.toLowerCase(); list = list.filter(s => s.subject.toLowerCase().includes(q) || s.message.toLowerCase().includes(q)); }
  return list;
});

// Style helpers
const getCategoryBorder = (v) => ({
  complaint: 'border-l-rose-500', suggestion: 'border-l-amber-500', feedback: 'border-l-emerald-500', other: 'border-l-violet-500'
}[v] ?? 'border-l-slate-400');

const getCategoryBadge = (v) => ({
  complaint: 'bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-950/40 dark:text-rose-400 dark:border-rose-800',
  suggestion: 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/40 dark:text-amber-400 dark:border-amber-800',
  feedback: 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-400 dark:border-emerald-800',
  other: 'bg-violet-50 text-violet-700 border-violet-200 dark:bg-violet-950/40 dark:text-violet-400 dark:border-violet-800',
}[v] ?? 'bg-slate-100 text-slate-600 border-slate-200');

const getStatusBadge = (s) => ({
  unread: 'bg-sky-50 text-sky-700 border-sky-200 dark:bg-sky-950/40 dark:text-sky-400 dark:border-sky-800',
  reviewed: 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/40 dark:text-amber-400 dark:border-amber-800',
  resolved: 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-400 dark:border-emerald-800',
}[s] ?? 'bg-slate-100 text-slate-600 border-slate-200');

const getStatusActiveCls = (s) => ({
  unread: 'bg-sky-100 text-sky-700 border-sky-300 dark:bg-sky-950/60 dark:text-sky-400 dark:border-sky-700',
  reviewed: 'bg-amber-100 text-amber-700 border-amber-300 dark:bg-amber-950/60 dark:text-amber-400 dark:border-amber-700',
  resolved: 'bg-emerald-100 text-emerald-700 border-emerald-300 dark:bg-emerald-950/60 dark:text-emerald-400 dark:border-emerald-700',
}[s] ?? '');

async function load() {
  isLoading.value = true;
  try {
    const { data, error: sbErr } = await supabase.from('suggestions').select('id, student_id, category, subject, message, is_anonymous, status, admin_note, created_at, users(name, id_number)').order('created_at', { ascending: false });
    if (sbErr) throw sbErr;
    suggestions.value = (data ?? []).map(s => ({
      id: s.id, studentId: s.student_id,
      studentName: s.is_anonymous ? 'Anonymous' : (s.users?.name || 'Student'),
      idNumber: s.is_anonymous ? null : (s.users?.id_number || null),
      category: s.category, subject: s.subject, message: s.message,
      isAnonymous: s.is_anonymous, status: s.status, adminNote: s.admin_note,
      createdAt: s.created_at, _saving: false,
    }));
  } catch { /* silent */ } finally {
    isLoading.value = false;
  }
}

async function changeStatus(s, newStatus) {
  s._saving = true;
  try {
    const { error: sbErr } = await supabase.from('suggestions').update({ status: newStatus }).eq('id', s.id);
    if (sbErr) throw sbErr;
    s.status = newStatus;
  } catch { /* silent */ } finally {
    s._saving = false;
  }
}

function openNote(s) {
  noteModal.id = s.id; noteModal.subject = s.subject; noteModal.note = s.adminNote || ''; noteModal.open = true;
}

async function saveNote() {
  noteModal.saving = true;
  try {
    const { error: sbErr } = await supabase.from('suggestions').update({ admin_note: noteModal.note }).eq('id', noteModal.id);
    if (sbErr) throw sbErr;
    const s = suggestions.value.find(x => x.id === noteModal.id);
    if (s) s.adminNote = noteModal.note;
    noteModal.open = false;
  } catch { /* silent */ } finally {
    noteModal.saving = false;
  }
}

onMounted(load);
</script>
