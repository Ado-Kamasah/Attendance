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
        <h1 class="text-2xl sm:text-3xl font-extrabold font-display tracking-tight text-foreground dark:text-dark-foreground">
          Suggestion <span class="text-secondary dark:text-dark-secondary">Box</span>
        </h1>
        <p class="text-xs sm:text-sm font-mono text-foreground/60 dark:text-dark-foreground/60 mt-1">
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
          : 'bg-surface dark:bg-dark-surface border border-outline/40 text-foreground/70 hover:text-foreground'"
      >
        <PlusCircle class="w-4 h-4" />
        <span>New Submission</span>
      </button>

      <button 
        @click="tab = 'history'; loadMy()"
        class="px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all flex items-center gap-2 cursor-pointer"
        :class="tab === 'history' 
          ? 'bg-primary dark:bg-dark-secondary text-surface dark:text-primary shadow-xs font-bold' 
          : 'bg-surface dark:bg-dark-surface border border-outline/40 text-foreground/70 hover:text-foreground'"
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
          <label class="block text-xs font-bold font-mono text-foreground dark:text-dark-foreground uppercase tracking-wider mb-2">
            Classification Type
          </label>
          <div class="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
            <label
              v-for="c in categories"
              :key="c.value"
              class="p-3 rounded-xl border text-xs font-mono font-medium cursor-pointer transition-all flex items-center gap-2.5 select-none"
              :class="form.category === c.value 
                ? 'bg-secondary text-primary font-bold border-secondary shadow-xs' 
                : 'bg-muted/20 dark:bg-dark-muted/20 border-outline/30 dark:border-dark-outline/40 text-foreground/70 hover:bg-muted/40'"
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
            <label class="block text-xs font-bold font-mono text-foreground dark:text-dark-foreground uppercase tracking-wider" for="sb-subject">
              Subject Line
            </label>
            <span class="text-[10px] font-mono text-foreground/45">{{ form.subject.length }}/120</span>
          </div>
          <input
            id="sb-subject"
            v-model="form.subject"
            type="text"
            maxlength="120"
            placeholder="Brief headline summarizing your topic…"
            class="w-full px-3.5 py-2 text-xs sm:text-sm bg-muted/20 dark:bg-dark-muted/20 border rounded-xl outline-hidden text-foreground dark:text-dark-foreground font-mono focus:border-secondary"
            :class="errors.subject ? 'border-error/60' : 'border-outline/40 dark:border-dark-outline/40'"
          />
          <p v-if="errors.subject" class="text-[11px] font-mono text-error mt-1">{{ errors.subject }}</p>
        </div>

        <!-- Message Details -->
        <div>
          <div class="flex items-center justify-between mb-1.5">
            <label class="block text-xs font-bold font-mono text-foreground dark:text-dark-foreground uppercase tracking-wider" for="sb-message">
              Details & Context
            </label>
            <span class="text-[10px] font-mono text-foreground/45">{{ form.message.length }}/2000</span>
          </div>
          <textarea
            id="sb-message"
            v-model="form.message"
            rows="6"
            maxlength="2000"
            placeholder="Provide granular details regarding locations, dates, or specific proposals…"
            class="w-full px-3.5 py-2.5 text-xs sm:text-sm bg-muted/20 dark:bg-dark-muted/20 border rounded-xl outline-hidden text-foreground dark:text-dark-foreground font-mono focus:border-secondary"
            :class="errors.message ? 'border-error/60' : 'border-outline/40 dark:border-dark-outline/40'"
          ></textarea>
          <p v-if="errors.message" class="text-[11px] font-mono text-error mt-1">{{ errors.message }}</p>
        </div>

        <!-- Anonymous Toggle -->
        <div class="p-3.5 rounded-xl bg-muted/30 dark:bg-dark-muted/30 border border-outline/30 dark:border-dark-outline/40 flex items-center justify-between gap-3">
          <div class="flex items-center gap-3">
            <Shield class="w-5 h-5 text-secondary shrink-0" />
            <div>
              <p class="text-xs font-bold text-foreground dark:text-dark-foreground">Submit Anonymously</p>
              <p class="text-[11px] font-mono text-foreground/50">Your name and student ID will be redacted from administrators.</p>
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
    <div v-else class="space-y-4">
      <div v-if="loadingMy" class="py-16 text-center text-xs font-mono text-foreground/50 flex items-center justify-center gap-2">
        <RefreshCw class="w-4 h-4 animate-spin text-secondary" />
        <span>Loading your submission records…</span>
      </div>

      <div v-else-if="myList.length === 0" class="py-16 text-center text-foreground/50 bg-surface dark:bg-dark-surface border border-outline/40 rounded-2xl">
        <MessageSquare class="w-8 h-8 mx-auto mb-2 text-foreground/30" />
        <p class="text-sm font-medium text-foreground dark:text-dark-foreground">No submissions found</p>
        <p class="text-xs font-mono mt-0.5">Your sent feedback and administrator responses will show here.</p>
      </div>

      <div v-else class="space-y-3">
        <div 
          v-for="s in myList" 
          :key="s.id" 
          class="p-5 rounded-2xl bg-surface dark:bg-dark-surface border border-outline/40 dark:border-dark-outline/50 shadow-2xs space-y-3"
        >
          <div class="flex items-center justify-between gap-2">
            <div class="flex items-center gap-2">
              <span class="px-2.5 py-0.5 rounded text-[11px] font-bold font-mono uppercase tracking-wider" :class="getCategoryStyle(s.category)">
                {{ s.category }}
              </span>
              <span class="px-2 py-0.2 rounded text-[10px] font-mono border" :class="getStatusStyle(s.status)">
                {{ s.status || 'Pending' }}
              </span>
            </div>
            <span class="text-[10px] font-mono text-foreground/50">{{ fmtDate(s.createdAt) }}</span>
          </div>

          <div>
            <h3 class="text-sm font-bold text-foreground dark:text-dark-foreground">{{ s.subject }}</h3>
            <p class="text-xs text-foreground/70 dark:text-dark-foreground/70 mt-1 whitespace-pre-line leading-relaxed">
              {{ s.message }}
            </p>
          </div>

          <!-- Admin Response Note -->
          <div v-if="s.adminNote" class="p-3.5 rounded-xl bg-secondary/10 border border-secondary/25 text-xs">
            <div class="flex items-center gap-1.5 font-bold text-secondary text-[11px] font-mono uppercase tracking-wider mb-1">
              <MessageCircle class="w-3.5 h-3.5" />
              <span>Official Institutional Response:</span>
            </div>
            <p class="text-foreground/80 dark:text-dark-foreground/80 leading-relaxed">{{ s.adminNote }}</p>
          </div>

          <div v-if="s.isAnonymous" class="text-[10px] font-mono text-foreground/45 flex items-center gap-1">
            <Shield class="w-3 h-3" />
            <span>Submitted under anonymous protection</span>
          </div>
        </div>
      </div>
    </div>
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
  MessageCircle 
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

function getCategoryStyle(cat) {
  if (cat === 'complaint') return 'bg-error/15 text-error border border-error/30';
  if (cat === 'suggestion') return 'bg-amber-500/15 text-amber-500 border border-amber-500/30';
  if (cat === 'feedback') return 'bg-blue-500/15 text-blue-500 border border-blue-500/30';
  return 'bg-purple-500/15 text-purple-500 border border-purple-500/30';
}

function getStatusStyle(st) {
  if (st === 'resolved') return 'bg-success/10 text-success border-success/30';
  if (st === 'reviewed') return 'bg-info/10 text-info border-info/30';
  return 'bg-muted text-foreground/50 border-outline/40';
}

function fmtDate(ts) {
  if (!ts) return '';
  return new Date(ts).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}
</script>
