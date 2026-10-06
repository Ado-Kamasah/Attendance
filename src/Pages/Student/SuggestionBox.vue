<template>
  <div class="space-y-6 w-full max-w-4xl mx-auto">
    <!-- Header with Blueprint Eyebrow -->
    <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-outline/30 dark:border-dark-outline/40">
      <div>
        <div class="flex items-center gap-2 mb-3 text-secondary dark:text-dark-secondary text-xs font-mono uppercase tracking-wider font-semibold">
          <span>STUDENT FORUM // INSTITUTIONAL FEEDBACK</span>
          <svg class="text-secondary/40 w-20 h-2" viewBox="0 0 140 8" fill="none">
            <path d="M0 4H140" stroke="currentColor" stroke-width="1.5" />
          </svg>
        </div>
        <h1 class="text-2xl sm:text-3xl font-extrabold font-display tracking-tight text-foreground dark:text-white">
          Suggestion <span class="text-secondary dark:text-dark-secondary">Box</span>
        </h1>
        <p class="text-xs sm:text-sm font-mono text-foreground/60 dark:text-white/70 mt-1">
          Submit complaints, infrastructure suggestions or general feedback directly to university administration
        </p>
      </div>
    </div>

    <!-- Navigation Tabs -->
    <div class="flex items-center gap-2 border-b border-outline/30 dark:border-dark-outline/40 pb-3">
      <button 
        @click="tab = 'submit'"
        class="px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all flex items-center gap-2 cursor-pointer"
        :class="tab === 'submit' 
          ? 'bg-primary dark:bg-dark-secondary text-surface dark:text-primary shadow-xs font-bold' 
          : 'bg-surface dark:bg-dark-surface border border-outline/40 dark:border-dark-outline/50 text-foreground/70 dark:text-white/80 hover:text-foreground dark:hover:text-white'"
      >
        <PlusCircle class="w-4 h-4" />
        <span>New Submission</span>
      </button>

      <button 
        @click="tab = 'history'; loadMy()"
        class="px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all flex items-center gap-2 cursor-pointer"
        :class="tab === 'history' 
          ? 'bg-primary dark:bg-dark-secondary text-surface dark:text-primary shadow-xs font-bold' 
          : 'bg-surface dark:bg-dark-surface border border-outline/40 dark:border-dark-outline/50 text-foreground/70 dark:text-white/80 hover:text-foreground dark:hover:text-white'"
      >
        <History class="w-4 h-4" />
        <span>My Submissions</span>
        <span v-if="myList.length" class="ml-1 px-1.5 py-0.2 rounded-full text-[10px] font-mono bg-secondary text-primary font-bold">
          {{ myList.length }}
        </span>
      </button>
    </div>

    <!-- ── TAB 1: SUBMIT FORM ── -->
    <div v-if="tab === 'submit'" class="relative bg-surface dark:bg-dark-surface border border-outline/50 dark:border-dark-outline/60 rounded-2xl shadow-xs overflow-hidden p-6">
      <div class="absolute top-3 left-3 w-4 h-4 border-t-2 border-l-2 border-secondary/30 pointer-events-none"></div>
      <div class="absolute top-3 right-3 w-4 h-4 border-t-2 border-r-2 border-secondary/30 pointer-events-none"></div>

      <form @submit.prevent="handleSubmit" class="space-y-5">
        <!-- Category Selection -->
        <div>
          <label class="block text-xs font-bold font-mono text-foreground dark:text-white uppercase tracking-wider mb-2">
            Classification Type
          </label>
          <div class="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
            <label
              v-for="c in categories"
              :key="c.value"
              class="p-3 rounded-xl border text-xs font-mono font-medium cursor-pointer transition-all flex items-center gap-2.5 select-none"
              :class="form.category === c.value 
                ? 'bg-secondary text-primary font-bold border-secondary shadow-xs' 
                : 'bg-muted/20 dark:bg-dark-muted/40 border-outline/30 dark:border-dark-outline/50 text-foreground/70 dark:text-white/80 hover:bg-muted/40 dark:hover:bg-dark-muted/60'"
            >
              <input type="radio" :value="c.value" v-model="form.category" class="sr-only" />
              <component :is="c.icon" class="w-4 h-4 shrink-0" />
              <span>{{ c.label }}</span>
            </label>
          </div>
          <p v-if="errors.category" class="text-[11px] font-mono text-error mt-1.5">{{ errors.category }}</p>
        </div>

        <!-- Subject -->
        <div>
          <div class="flex items-center justify-between mb-1.5">
            <label class="block text-xs font-bold font-mono text-foreground dark:text-white uppercase tracking-wider" for="sb-subject">
              Subject Line
            </label>
            <span class="text-[10px] font-mono text-foreground/45 dark:text-white/55">{{ form.subject.length }}/120</span>
          </div>
          <input
            id="sb-subject"
            v-model="form.subject"
            type="text"
            maxlength="120"
            placeholder="Brief headline summarizing your topic…"
            class="w-full px-3.5 py-2 text-xs sm:text-sm bg-muted/20 dark:bg-dark-muted/20 border rounded-xl outline-hidden text-foreground dark:text-white font-mono focus:border-secondary"
            :class="errors.subject ? 'border-error/60' : 'border-outline/40 dark:border-dark-outline/40'"
          />
          <p v-if="errors.subject" class="text-[11px] font-mono text-error mt-1">{{ errors.subject }}</p>
        </div>

        <!-- Message Details -->
        <div>
          <div class="flex items-center justify-between mb-1.5">
            <label class="block text-xs font-bold font-mono text-foreground dark:text-white uppercase tracking-wider" for="sb-message">
              Details & Context
            </label>
            <span class="text-[10px] font-mono text-foreground/45 dark:text-white/55">{{ form.message.length }}/2000</span>
          </div>
          <textarea
            id="sb-message"
            v-model="form.message"
            rows="6"
            maxlength="2000"
            placeholder="Provide granular details regarding locations, dates, or specific proposals…"
            class="w-full px-3.5 py-2.5 text-xs sm:text-sm bg-muted/20 dark:bg-dark-muted/20 border rounded-xl outline-hidden text-foreground dark:text-white font-mono focus:border-secondary"
            :class="errors.message ? 'border-error/60' : 'border-outline/40 dark:border-dark-outline/40'"
          ></textarea>
          <p v-if="errors.message" class="text-[11px] font-mono text-error mt-1">{{ errors.message }}</p>
        </div>

        <!-- Anonymous Toggle -->
        <div class="p-3.5 rounded-xl bg-muted/30 dark:bg-dark-muted/30 border border-outline/30 dark:border-dark-outline/40 flex items-center justify-between gap-3">
          <div class="flex items-center gap-3">
            <Shield class="w-5 h-5 text-secondary shrink-0" />
            <div>
              <p class="text-xs font-bold text-foreground dark:text-white">Submit Anonymously</p>
              <p class="text-[11px] font-mono text-foreground/50 dark:text-white/65">Your name and student ID will be redacted from administrators.</p>
            </div>
          </div>
          <button 
            type="button" 
            @click="form.isAnonymous = !form.isAnonymous"
            class="w-10 h-5 rounded-full transition-colors relative cursor-pointer shrink-0"
            :class="form.isAnonymous ? 'bg-secondary' : 'bg-muted dark:bg-dark-muted border border-outline/40'"
          >
            <span 
              class="block w-3.5 h-3.5 bg-surface rounded-full shadow-xs transition-transform absolute top-0.75 left-0.75"
              :class="{ 'translate-x-5': form.isAnonymous }"
            ></span>
          </button>
        </div>

        <!-- Success / Error Banners -->
        <div v-if="successMsg" class="p-3.5 rounded-xl bg-success/10 border border-success/30 text-success text-xs font-mono flex items-center gap-2">
          <CheckCircle2 class="w-4 h-4 shrink-0" />
          <span>{{ successMsg }}</span>
        </div>
        <div v-if="submitError" class="p-3.5 rounded-xl bg-error/10 border border-error/30 text-error text-xs font-mono flex items-center gap-2">
          <AlertTriangle class="w-4 h-4 shrink-0" />
          <span>{{ submitError }}</span>
        </div>

        <!-- Submit Button -->
        <div class="flex justify-end pt-2">
          <button 
            type="submit" 
            :disabled="isSubmitting"
            class="px-6 py-2.5 rounded-xl bg-primary dark:bg-dark-secondary text-surface dark:text-primary font-bold text-xs sm:text-sm shadow-md hover:opacity-90 active:scale-98 disabled:opacity-40 transition-all flex items-center gap-2 cursor-pointer"
          >
            <RefreshCw v-if="isSubmitting" class="w-4 h-4 animate-spin" />
            <Send v-else class="w-4 h-4" />
            <span>{{ isSubmitting ? 'Transmitting…' : 'Submit Feedback' }}</span>
          </button>
        </div>
      </form>
    </div>

    <!-- ── TAB 2: MY SUBMISSIONS ── -->
    <!-- ── TAB 2: MY SUBMISSIONS ── -->
    <div v-else class="space-y-4">
      <div v-if="loadingMy" class="py-16 text-center text-xs font-mono text-foreground/50 dark:text-white/70 flex items-center justify-center gap-2">
        <RefreshCw class="w-4 h-4 animate-spin text-secondary" />
        <span>Loading your submission records…</span>
      </div>

      <div v-else-if="myList.length === 0" class="py-16 text-center text-foreground/50 dark:text-white/70 bg-surface dark:bg-dark-surface border border-outline/40 dark:border-dark-outline/50 rounded-2xl">
        <MessageSquare class="w-8 h-8 mx-auto mb-2 text-foreground/30 dark:text-white/40" />
        <p class="text-sm font-medium text-foreground dark:text-white">No submissions found</p>
        <p class="text-xs font-mono mt-0.5">Your sent feedback and administrator responses will show here.</p>
      </div>

      <div v-else class="space-y-4">
        <!-- Download & Export Toolbar for Student -->
        <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 bg-surface dark:bg-dark-surface border border-outline/40 dark:border-dark-outline/50 rounded-2xl shadow-2xs">
          <div>
            <div class="flex items-center gap-2">
              <span class="text-xs font-bold font-mono text-foreground dark:text-white uppercase tracking-wider">
                My Submissions Archive
              </span>
              <span class="px-2 py-0.5 rounded-full text-[10px] font-mono bg-secondary/15 text-secondary border border-secondary/30 font-bold">
                {{ myList.length }} records
              </span>
            </div>
            <p class="text-[11px] font-mono text-foreground/50 dark:text-white/60 mt-0.5">
              Download your personal submission logs and official institutional replies
            </p>
          </div>

          <div class="flex items-center flex-wrap gap-2 shrink-0">
            <button
              @click="downloadStudentCSV"
              title="Download CSV spreadsheet of all your submissions"
              class="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-emerald-200 dark:border-emerald-800/60 bg-emerald-50 dark:bg-emerald-950/30 text-emerald-700 dark:text-emerald-400 text-xs font-mono font-bold hover:bg-emerald-100 dark:hover:bg-emerald-900/40 transition-all cursor-pointer shadow-2xs"
            >
              <FileSpreadsheet class="w-3.5 h-3.5" />
              <span>Download CSV</span>
            </button>
            <button
              @click="downloadStudentPDF"
              title="Print or Save PDF report of your submissions"
              class="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-sky-200 dark:border-sky-800/60 bg-sky-50 dark:bg-sky-950/30 text-sky-700 dark:text-sky-400 text-xs font-mono font-bold hover:bg-sky-100 dark:hover:bg-sky-900/40 transition-all cursor-pointer shadow-2xs"
            >
              <Printer class="w-3.5 h-3.5" />
              <span>Print / PDF</span>
            </button>
          </div>
        </div>

        <div class="space-y-3">
          <div 
            v-for="s in myList" 
            :key="s.id" 
            class="p-5 rounded-2xl bg-surface dark:bg-dark-surface border border-outline/40 dark:border-dark-outline/50 shadow-2xs space-y-3"
          >
            <div class="flex flex-wrap items-center justify-between gap-2">
              <div class="flex items-center gap-2">
                <span class="px-2.5 py-0.5 rounded text-[11px] font-bold font-mono uppercase tracking-wider" :class="getCategoryStyle(s.category)">
                  {{ s.category }}
                </span>
                <span class="px-2 py-0.2 rounded text-[10px] font-mono border" :class="getStatusStyle(s.status)">
                  {{ s.status || 'Pending' }}
                </span>
              </div>
              <div class="flex items-center gap-2.5">
                <span class="text-[10px] font-mono text-foreground/50 dark:text-white/60">{{ fmtDate(s.createdAt) }}</span>
                <button
                  @click="downloadStudentSlip(s)"
                  title="Download text receipt slip"
                  class="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg border border-outline/40 dark:border-dark-outline/50 bg-muted/20 dark:bg-dark-muted/40 text-[11px] font-mono text-foreground/75 dark:text-white/80 hover:text-secondary hover:border-secondary/50 transition-colors cursor-pointer"
                >
                  <Download class="w-3 h-3 text-secondary" />
                  <span>Download Slip</span>
                </button>
                <button
                  @click="printStudentSlip(s)"
                  title="Print official receipt"
                  class="inline-flex items-center p-1 rounded-lg border border-outline/40 dark:border-dark-outline/50 bg-muted/20 dark:bg-dark-muted/40 text-foreground/60 dark:text-white/70 hover:text-sky-500 hover:border-sky-500/50 transition-colors cursor-pointer"
                >
                  <Printer class="w-3 h-3" />
                </button>
              </div>
            </div>

            <div>
              <h3 class="text-sm font-bold text-foreground dark:text-white">{{ s.subject }}</h3>
              <p class="text-xs text-foreground/70 dark:text-white/80 mt-1 whitespace-pre-line leading-relaxed">
                {{ s.message }}
              </p>
            </div>

            <!-- Admin Response Note -->
            <div v-if="s.adminNote" class="p-3.5 rounded-xl bg-secondary/10 border border-secondary/25 text-xs">
              <div class="flex items-center gap-1.5 font-bold text-secondary text-[11px] font-mono uppercase tracking-wider mb-1">
                <MessageCircle class="w-3.5 h-3.5" />
                <span>Official Institutional Response:</span>
              </div>
              <p class="text-foreground/80 dark:text-white/90 leading-relaxed">{{ s.adminNote }}</p>
            </div>

            <div v-if="s.isAnonymous" class="text-[10px] font-mono text-foreground/45 dark:text-white/55 flex items-center gap-1">
              <Shield class="w-3 h-3" />
              <span>Submitted under anonymous protection</span>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Student Toast via Teleport -->
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
          v-if="toastMessage" 
          class="fixed bottom-6 right-6 z-50 flex items-center gap-3 px-5 py-3 rounded-xl bg-slate-900 text-white border border-slate-700 shadow-2xl text-xs font-mono font-medium max-w-md"
        >
          <CheckCircle2 class="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{{ toastMessage }}</span>
        </div>
      </transition>
    </Teleport>
  </div>
</template>

<script setup>
import { ref, reactive } from 'vue';
import { supabase } from '@/stores/supabase';
import { useAuthStore } from '@/stores/authstore';
import { 
  PlusCircle, 
  History, 
  AlertTriangle, 
  Lightbulb, 
  MessageSquare, 
  HelpCircle, 
  Shield, 
  CheckCircle2, 
  RefreshCw, 
  Send, 
  MessageCircle,
  Download,
  FileSpreadsheet,
  Printer
} from 'lucide-vue-next';

const authStore = useAuthStore();
const tab       = ref('submit');
const isSubmitting = ref(false);
const successMsg   = ref('');
const submitError  = ref('');
const loadingMy    = ref(false);
const myList       = ref([]);

const categories = [
  { value: 'complaint',   label: 'Complaint',   icon: AlertTriangle },
  { value: 'suggestion',  label: 'Suggestion',  icon: Lightbulb },
  { value: 'feedback',    label: 'Feedback',    icon: MessageSquare },
  { value: 'other',       label: 'Other',       icon: HelpCircle },
];

const form = reactive({
  category:    '',
  subject:     '',
  message:     '',
  isAnonymous: false,
});

const errors = reactive({ category: '', subject: '', message: '' });

function validate() {
  errors.category = form.category ? '' : 'Please select a type.';
  errors.subject  = form.subject.trim() ? '' : 'Subject is required.';
  errors.message  = form.message.trim() ? '' : 'Please write your message.';
  return !errors.category && !errors.subject && !errors.message;
}

async function handleSubmit() {
  successMsg.value  = '';
  submitError.value = '';
  if (!validate()) return;

  isSubmitting.value = true;
  try {
    const studentId = authStore.profile?.id || authStore.user?.id;
    const { error: sbErr } = await supabase.from('suggestions').insert({
      student_id:   studentId,
      category:     form.category,
      subject:      form.subject.trim(),
      message:      form.message.trim(),
      is_anonymous: form.isAnonymous,
      status:       'unread',
    });
    if (sbErr) throw sbErr;
    successMsg.value = 'Your submission has been received. Thank you!';
    form.category    = '';
    form.subject     = '';
    form.message     = '';
    form.isAnonymous = false;
    myList.value = [];
    setTimeout(() => (successMsg.value = ''), 5000);
  } catch (e) {
    submitError.value = e?.message || 'Failed to submit. Please try again.';
  } finally {
    isSubmitting.value = false;
  }
}

async function loadMy() {
  if (myList.value.length) return;
  loadingMy.value = true;
  try {
    const studentId = authStore.profile?.id || authStore.user?.id;
    const { data, error: sbErr } = await supabase
      .from('suggestions')
      .select('id, category, subject, message, is_anonymous, status, admin_note, created_at')
      .eq('student_id', studentId)
      .order('created_at', { ascending: false });
    if (sbErr) throw sbErr;
    myList.value = (data ?? []).map(s => ({
      id:          s.id,
      category:    s.category,
      subject:     s.subject,
      message:     s.message,
      isAnonymous: s.is_anonymous,
      status:      s.status,
      adminNote:   s.admin_note,
      createdAt:   s.created_at,
    }));
  } catch { /* silent */ } finally {
    loadingMy.value = false;
  }
}

const toastMessage = ref('');

function showToast(msg) {
  toastMessage.value = msg;
  setTimeout(() => {
    if (toastMessage.value === msg) toastMessage.value = '';
  }, 3500);
}

function getCategoryStyle(cat) {
  if (cat === 'complaint')  return 'bg-red-500/20 text-red-400 dark:text-red-300 border border-red-500/40';
  if (cat === 'suggestion') return 'bg-amber-500/20 text-amber-600 dark:text-amber-300 border border-amber-500/40';
  if (cat === 'feedback')   return 'bg-blue-500/20 text-blue-600 dark:text-blue-300 border border-blue-500/40';
  return 'bg-purple-500/20 text-purple-600 dark:text-purple-300 border border-purple-500/40';
}

function getStatusStyle(st) {
  if (st === 'resolved') return 'bg-emerald-500/20 text-emerald-600 dark:text-emerald-300 border-emerald-500/40';
  if (st === 'reviewed') return 'bg-sky-500/20 text-sky-600 dark:text-sky-300 border-sky-500/40';
  return 'bg-muted dark:bg-dark-muted text-foreground/60 dark:text-white/70 border-outline/40 dark:border-dark-outline/50';
}

function fmtDate(ts) {
  if (!ts) return '';
  return new Date(ts).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

// ── Student Download & Export Handlers ───────────────────────────────────────

function downloadStudentCSV() {
  if (!myList.value.length) {
    showToast('No submission records to download.');
    return;
  }

  const headers = [
    'Submission ID',
    'Date Submitted',
    'Category',
    'Status',
    'Submission Mode',
    'Subject',
    'Message Details',
    'Official Administration Response'
  ];

  const escapeCSV = (val) => {
    if (val === null || val === undefined) return '""';
    const s = String(val).replace(/"/g, '""');
    return `"${s}"`;
  };

  const rows = [headers.join(',')];

  myList.value.forEach(s => {
    const d = s.createdAt ? new Date(s.createdAt) : null;
    const dateStr = d ? d.toISOString().slice(0, 10) : '';

    rows.push([
      escapeCSV(s.id),
      escapeCSV(dateStr),
      escapeCSV(s.category),
      escapeCSV(s.status || 'unread'),
      escapeCSV(s.isAnonymous ? 'Anonymous' : 'Identified'),
      escapeCSV(s.subject),
      escapeCSV(s.message),
      escapeCSV(s.adminNote || '')
    ].join(','));
  });

  const blob = new Blob([rows.join('\r\n')], { type: 'text/csv;charset=utf-8;' });
  const url  = URL.createObjectURL(blob);
  const a    = document.createElement('a');
  a.href     = url;
  a.download = `my-suggestions-${new Date().toISOString().slice(0, 10)}.csv`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);

  showToast(`Downloaded ${myList.value.length} submission(s) as CSV`);
}

function downloadStudentSlip(s) {
  const dStr = s.createdAt ? new Date(s.createdAt).toLocaleString() : '';
  const text = [
    '================================================================================',
    '               UNIVERSITY STUDENT FORUM // SUGGESTION BOX RECEIPT',
    '================================================================================',
    `Ticket Reference   : ${s.id}`,
    `Date Filed         : ${dStr}`,
    `Classification     : ${String(s.category || '').toUpperCase()}`,
    `Status             : ${String(s.status || 'unread').toUpperCase()}`,
    `Privacy Mode       : ${s.isAnonymous ? 'Anonymous Protection Applied' : 'Standard Student Identification'}`,
    '--------------------------------------------------------------------------------',
    'SUBJECT:',
    s.subject,
    '',
    'SUBMISSION DETAILS:',
    s.message,
    '--------------------------------------------------------------------------------',
    'OFFICIAL INSTITUTIONAL RESPONSE:',
    s.adminNote ? s.adminNote : 'Pending administrative review. Check back later.',
    '================================================================================',
    `Receipt Generated  : ${new Date().toLocaleString()}`,
    '================================================================================',
  ].join('\r\n');

  const blob = new Blob([text], { type: 'text/plain;charset=utf-8;' });
  const url  = URL.createObjectURL(blob);
  const a    = document.createElement('a');
  a.href     = url;
  a.download = `suggestion-receipt-${s.id.slice(0, 8)}.txt`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);

  showToast(`Downloaded receipt slip for "${s.subject.slice(0, 20)}..."`);
}

function printStudentSlip(s) {
  const dStr = s.createdAt ? new Date(s.createdAt).toLocaleString() : '';
  const html = `<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>Submission Receipt #${s.id.slice(0, 8)}</title>
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; margin: 30px; color: #0f172a; line-height: 1.5; font-size: 13px; }
    .header { border-bottom: 2px solid #031c45; padding-bottom: 12px; margin-bottom: 20px; }
    .header h1 { margin: 0 0 4px 0; font-size: 18px; color: #031c45; }
    .header p { margin: 0; color: #64748b; font-size: 11px; }
    .card { border: 1px solid #cbd5e1; border-radius: 8px; padding: 18px; }
    .meta { display: flex; justify-content: space-between; margin-bottom: 14px; font-size: 12px; color: #64748b; }
    .subject { font-size: 16px; font-weight: bold; margin-bottom: 8px; color: #0f172a; }
    .message { background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 6px; padding: 12px; margin-bottom: 16px; white-space: pre-wrap; font-size: 12px; }
    .note-box { background: #f0fdf4; border: 1px solid #bbf7d0; border-left: 4px solid #16a34a; border-radius: 6px; padding: 12px; font-size: 12px; color: #166534; }
    .footer { margin-top: 24px; font-size: 11px; color: #94a3b8; text-align: right; }
    @media print { body { margin: 15mm; } }
  </style>
</head>
<body>
  <div class="header">
    <h1>STUDENT FORUM // SUGGESTION RECEIPT</h1>
    <p>UNIVERSITY ATTENDANCE & FEEDBACK SYSTEM &bull; TICKET #${s.id}</p>
  </div>

  <div class="card">
    <div class="meta">
      <div><strong>Type:</strong> ${String(s.category || '').toUpperCase()} &bull; <strong>Status:</strong> ${String(s.status || 'UNREAD').toUpperCase()}</div>
      <div>Filed: ${dStr}</div>
    </div>

    <div class="subject">${s.subject}</div>
    <div class="message">${s.message}</div>

    <div class="note-box">
      <strong>Official Institutional Response:</strong><br/>
      ${s.adminNote ? s.adminNote : '<em>Pending administrative review.</em>'}
    </div>
  </div>

  <div class="footer">
    Verified Student Submission Record &bull; Generated on ${new Date().toLocaleString()}
  </div>
</body>
</html>`;

  const win = window.open('', '_blank');
  if (win) {
    win.document.write(html);
    win.document.close();
    win.focus();
    setTimeout(() => { win.print(); }, 400);
  } else {
    showToast('Please allow popups to print slip.');
  }
}

function downloadStudentPDF() {
  if (!myList.value.length) {
    showToast('No submission records to print/download.');
    return;
  }

  const dateStr = new Date().toLocaleDateString('en-US', { day: 'numeric', month: 'long', year: 'numeric' });

  let itemsHtml = '';
  myList.value.forEach(s => {
    const dStr = s.createdAt ? new Date(s.createdAt).toLocaleString() : '';
    itemsHtml += `
    <div style="border:1px solid #e2e8f0; border-radius:8px; padding:12px 14px; margin-bottom:14px; break-inside:avoid; page-break-inside:avoid;">
      <div style="display:flex; justify-content:space-between; font-size:11px; color:#64748b; margin-bottom:6px;">
        <span><strong>${String(s.category || '').toUpperCase()}</strong> &bull; Status: ${String(s.status || 'UNREAD').toUpperCase()}</span>
        <span>${dStr}</span>
      </div>
      <div style="font-size:14px; font-weight:bold; color:#0f172a; margin-bottom:4px;">${s.subject}</div>
      <div style="font-size:12px; color:#334155; margin-bottom:8px; white-space:pre-wrap;">${s.message}</div>
      ${s.adminNote ? `<div style="background:#f0fdf4; border:1px solid #bbf7d0; border-radius:4px; padding:8px 10px; font-size:11px; color:#166534;"><strong>Admin Response:</strong> ${s.adminNote}</div>` : ''}
    </div>`;
  });

  const html = `<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>My Suggestions History — ${dateStr}</title>
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; font-size: 12px; color: #0f172a; margin: 24px; line-height: 1.45; }
    .header { border-bottom: 2px solid #031c45; padding-bottom: 10px; margin-bottom: 16px; }
    .header h1 { margin: 0 0 4px 0; font-size: 18px; color: #031c45; }
    .meta { font-size: 11px; color: #64748b; }
    @media print { body { margin: 10mm; } }
  </style>
</head>
<body>
  <div class="header">
    <h1>Student Suggestion Box — Submission History</h1>
    <div class="meta">Generated: ${dateStr} &bull; Total Submissions: ${myList.value.length}</div>
  </div>

  <div>
    ${itemsHtml}
  </div>
</body>
</html>`;

  const win = window.open('', '_blank');
  if (win) {
    win.document.write(html);
    win.document.close();
    win.focus();
    setTimeout(() => { win.print(); }, 400);
  } else {
    showToast('Please allow popups to print report.');
  }
}
</script>
