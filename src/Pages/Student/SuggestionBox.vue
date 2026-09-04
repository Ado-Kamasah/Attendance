<template>
  <div class="sb-container">

    <!-- Header -->
    <div class="sb-header">
      <div class="sb-header-icon">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8">
          <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
        </svg>
      </div>
      <div>
        <h1 class="sb-title">Suggestion Box</h1>
        <p class="sb-subtitle">Submit complaints, suggestions or feedback — your voice matters.</p>
      </div>
    </div>

    <!-- Tabs -->
    <div class="sb-tabs">
      <button :class="['sb-tab', { active: tab === 'submit' }]" @click="tab = 'submit'">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
        New Submission
      </button>
      <button :class="['sb-tab', { active: tab === 'history' }]" @click="tab = 'history'; loadMy()">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="12 8 12 12 14 14"/><path d="M3.05 11a9 9 0 1 0 .5-4.5"/><polyline points="3 3 3 8 8 8"/></svg>
        My Submissions
        <span v-if="myList.length" class="tab-count">{{ myList.length }}</span>
      </button>
    </div>

    <!-- ── SUBMIT FORM ── -->
    <div v-if="tab === 'submit'" class="sb-card">
      <form @submit.prevent="handleSubmit" class="sb-form">

        <!-- Category -->
        <div class="field-group">
          <label class="field-label">Type of Submission</label>
          <div class="category-chips">
            <label
              v-for="c in categories"
              :key="c.value"
              class="cat-chip"
              :class="{ selected: form.category === c.value, [`cat-${c.value}`]: true }"
            >
              <input type="radio" :value="c.value" v-model="form.category" />
              {{ c.icon }} {{ c.label }}
            </label>
          </div>
          <p v-if="errors.category" class="field-err">{{ errors.category }}</p>
        </div>

        <!-- Subject -->
        <div class="field-group">
          <label class="field-label" for="sb-subject">Subject</label>
          <input
            id="sb-subject"
            v-model="form.subject"
            type="text"
            class="sb-input"
            :class="{ 'input-err': errors.subject }"
            placeholder="Brief title of your submission…"
            maxlength="120"
          />
          <div class="field-meta">
            <p v-if="errors.subject" class="field-err">{{ errors.subject }}</p>
            <span class="char-count">{{ form.subject.length }}/120</span>
          </div>
        </div>

        <!-- Message -->
        <div class="field-group">
          <label class="field-label" for="sb-message">Details</label>
          <textarea
            id="sb-message"
            v-model="form.message"
            class="sb-textarea"
            :class="{ 'input-err': errors.message }"
            placeholder="Describe your complaint, suggestion or feedback in detail…"
            rows="6"
            maxlength="2000"
          ></textarea>
          <div class="field-meta">
            <p v-if="errors.message" class="field-err">{{ errors.message }}</p>
            <span class="char-count">{{ form.message.length }}/2000</span>
          </div>
        </div>

        <!-- Anonymous toggle -->
        <label class="anon-toggle">
          <div class="anon-toggle-track" :class="{ on: form.isAnonymous }" @click="form.isAnonymous = !form.isAnonymous">
            <div class="anon-toggle-thumb"></div>
          </div>
          <div class="anon-info">
            <span class="anon-label">Submit Anonymously</span>
            <span class="anon-hint">Your name will be hidden from administrators when enabled.</span>
          </div>
        </label>

        <!-- Success / Error banners -->
        <transition name="fade">
          <div v-if="successMsg" class="banner banner-success">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="20 6 9 17 4 12"/></svg>
            {{ successMsg }}
          </div>
        </transition>
        <transition name="fade">
          <div v-if="submitError" class="banner banner-error">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
            {{ submitError }}
          </div>
        </transition>

        <button type="submit" class="sb-submit-btn" :disabled="isSubmitting">
          <svg v-if="isSubmitting" class="spin" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10" stroke-dasharray="31" stroke-dashoffset="10"/></svg>
          <svg v-else viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/></svg>
          {{ isSubmitting ? 'Submitting…' : 'Submit' }}
        </button>
      </form>
    </div>

    <!-- ── MY SUBMISSIONS ── -->
    <div v-else class="sb-history">
      <div v-if="loadingMy" class="sb-loading">Loading your submissions…</div>

      <div v-else-if="myList.length === 0" class="sb-empty">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
        <p>You haven't submitted anything yet.</p>
      </div>

      <div v-else class="history-list">
        <div v-for="s in myList" :key="s.id" class="history-card">
          <div class="hc-top">
            <span class="hc-cat" :class="`cat-${s.category}`">{{ catIcon(s.category) }} {{ catLabel(s.category) }}</span>
            <span class="hc-status" :class="`status-${s.status}`">{{ statusLabel(s.status) }}</span>
            <span class="hc-date">{{ fmtDate(s.createdAt) }}</span>
          </div>
          <p class="hc-subject">{{ s.subject }}</p>
          <p class="hc-msg">{{ s.message }}</p>
          <div v-if="s.adminNote" class="hc-note">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
            <span><strong>Response:</strong> {{ s.adminNote }}</span>
          </div>
          <span v-if="s.isAnonymous" class="hc-anon">🔒 Submitted anonymously</span>
        </div>
      </div>
    </div>

  </div>
</template>

<script setup>
import { ref, reactive } from 'vue';
import api from '@/api.js';

const tab       = ref('submit');
const isSubmitting = ref(false);
const successMsg   = ref('');
const submitError  = ref('');
const loadingMy    = ref(false);
const myList       = ref([]);

const categories = [
  { value: 'complaint',   label: 'Complaint',   icon: '😤' },
  { value: 'suggestion',  label: 'Suggestion',  icon: '💡' },
  { value: 'feedback',    label: 'Feedback',    icon: '📝' },
  { value: 'other',       label: 'Other',       icon: '📌' },
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
    await api.post('/suggestions', {
      category:    form.category,
      subject:     form.subject.trim(),
      message:     form.message.trim(),
      isAnonymous: form.isAnonymous,
    });
    successMsg.value = '✅ Your submission has been received. Thank you!';
    // Reset
    form.category    = '';
    form.subject     = '';
    form.message     = '';
    form.isAnonymous = false;
    setTimeout(() => (successMsg.value = ''), 5000);
  } catch (e) {
    submitError.value = e?.response?.data?.message || 'Failed to submit. Please try again.';
  } finally {
    isSubmitting.value = false;
  }
}

async function loadMy() {
  if (myList.value.length) return; // cache
  loadingMy.value = true;
  try {
    const { data } = await api.get('/suggestions/my');
    myList.value = data;
  } catch { /* silent */ } finally {
    loadingMy.value = false;
  }
}

const catIcon  = (v) => categories.find(c => c.value === v)?.icon  ?? '📌';
const catLabel = (v) => categories.find(c => c.value === v)?.label ?? v;
const statusLabel = (s) => ({ unread: '🔵 Unread', reviewed: '🟡 Reviewed', resolved: '🟢 Resolved' })[s] ?? s;
const fmtDate = (d) => new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
</script>

<style scoped>
* { font-family: 'Inter', sans-serif; box-sizing: border-box; }

.sb-container {
  display: flex;
  flex-direction: column;
  gap: 1.75rem;
  width: 100%;
  max-width: 720px;
  margin: 0 auto;
}

/* Header */
.sb-header {
  display: flex;
  align-items: center;
  gap: 1.25rem;
}
.sb-header-icon {
  width: 60px;
  height: 60px;
  border-radius: 18px;
  background: linear-gradient(135deg, #6366f1, #4f46e5);
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  box-shadow: 0 8px 20px rgba(99,102,241,.3);
}
.sb-header-icon svg { width: 28px; height: 28px; color: #fff; }
.sb-title    { margin: 0; font-size: 1.75rem; font-weight: 800; color: #0f172a; letter-spacing: -.025em; }
.sb-subtitle { margin: .25rem 0 0; font-size: .9rem; color: #64748b; }

/* Tabs */
.sb-tabs { display: flex; gap: .75rem; }
.sb-tab {
  display: inline-flex;
  align-items: center;
  gap: .45rem;
  padding: .55rem 1.1rem;
  border-radius: 10px;
  border: 1.5px solid #e2e8f0;
  background: #fff;
  font-size: .875rem;
  font-weight: 600;
  color: #475569;
  cursor: pointer;
  transition: all .2s;
}
.sb-tab svg { width: 15px; height: 15px; }
.sb-tab:hover   { border-color: #6366f1; color: #4f46e5; }
.sb-tab.active  { background: #6366f1; border-color: #6366f1; color: #fff; }
.tab-count {
  background: rgba(255,255,255,.25);
  color: #fff;
  font-size: .7rem;
  font-weight: 700;
  padding: .1rem .45rem;
  border-radius: 999px;
}
.sb-tab:not(.active) .tab-count {
  background: #e0e7ff;
  color: #4f46e5;
}

/* Form card */
.sb-card {
  background: #fff;
  border-radius: 20px;
  border: 1px solid #f1f5f9;
  box-shadow: 0 4px 16px rgba(0,0,0,.05);
  padding: 2rem;
}
.sb-form { display: flex; flex-direction: column; gap: 1.5rem; }

.field-group  { display: flex; flex-direction: column; gap: .4rem; }
.field-label  { font-size: .82rem; font-weight: 700; color: #475569; text-transform: uppercase; letter-spacing: .05em; }
.field-meta   { display: flex; justify-content: space-between; align-items: center; min-height: 1.2rem; }
.field-err    { margin: 0; font-size: .78rem; color: #ef4444; font-weight: 600; }
.char-count   { font-size: .75rem; color: #94a3b8; margin-left: auto; }

/* Category chips */
.category-chips { display: flex; flex-wrap: wrap; gap: .6rem; }
.cat-chip {
  display: inline-flex;
  align-items: center;
  gap: .35rem;
  padding: .5rem 1rem;
  border-radius: 999px;
  border: 1.5px solid #e2e8f0;
  background: #f8fafc;
  font-size: .875rem;
  font-weight: 600;
  color: #475569;
  cursor: pointer;
  transition: all .15s;
  user-select: none;
}
.cat-chip input { display: none; }
.cat-chip:hover { border-color: #6366f1; color: #4338ca; }
.cat-chip.selected { background: #6366f1; border-color: #6366f1; color: #fff; }

/* Inputs */
.sb-input, .sb-textarea {
  width: 100%;
  padding: .7rem 1rem;
  border: 1.5px solid #e2e8f0;
  border-radius: 10px;
  font-size: .9rem;
  color: #334155;
  outline: none;
  transition: border-color .2s;
  font-family: inherit;
  background: #fafafa;
}
.sb-input:focus, .sb-textarea:focus { border-color: #6366f1; background: #fff; }
.sb-textarea { resize: vertical; min-height: 130px; }
.input-err { border-color: #fca5a5 !important; }

/* Anonymous toggle */
.anon-toggle {
  display: flex;
  align-items: center;
  gap: 1rem;
  cursor: pointer;
  padding: 1rem 1.25rem;
  background: #f8fafc;
  border: 1px solid #f1f5f9;
  border-radius: 12px;
  transition: background .15s;
}
.anon-toggle:hover { background: #f1f5f9; }
.anon-toggle-track {
  width: 44px;
  height: 24px;
  border-radius: 999px;
  background: #cbd5e1;
  position: relative;
  transition: background .2s;
  flex-shrink: 0;
}
.anon-toggle-track.on { background: #6366f1; }
.anon-toggle-thumb {
  position: absolute;
  top: 3px;
  left: 3px;
  width: 18px;
  height: 18px;
  border-radius: 50%;
  background: #fff;
  box-shadow: 0 1px 4px rgba(0,0,0,.15);
  transition: transform .2s;
}
.anon-toggle-track.on .anon-toggle-thumb { transform: translateX(20px); }
.anon-info { display: flex; flex-direction: column; gap: .1rem; }
.anon-label { font-size: .875rem; font-weight: 700; color: #334155; }
.anon-hint  { font-size: .78rem; color: #94a3b8; }

/* Banners */
.banner {
  display: flex;
  align-items: center;
  gap: .75rem;
  padding: .85rem 1.1rem;
  border-radius: 10px;
  font-size: .875rem;
  font-weight: 600;
}
.banner svg { width: 18px; height: 18px; flex-shrink: 0; }
.banner-success { background: #dcfce7; color: #15803d; }
.banner-error   { background: #fee2e2; color: #b91c1c; }

/* Submit button */
.sb-submit-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: .6rem;
  background: linear-gradient(135deg, #6366f1, #4f46e5);
  color: #fff;
  border: none;
  padding: .85rem 2rem;
  border-radius: 12px;
  font-size: .95rem;
  font-weight: 700;
  cursor: pointer;
  width: 100%;
  box-shadow: 0 6px 16px rgba(99,102,241,.3);
  transition: all .2s;
}
.sb-submit-btn svg { width: 18px; height: 18px; }
.sb-submit-btn:hover:not(:disabled) { transform: translateY(-1px); box-shadow: 0 8px 20px rgba(99,102,241,.4); }
.sb-submit-btn:disabled { opacity: .55; cursor: not-allowed; transform: none; }

/* History */
.sb-history { display: flex; flex-direction: column; gap: 1rem; }
.sb-loading  { text-align: center; color: #94a3b8; padding: 3rem; }
.sb-empty    { display: flex; flex-direction: column; align-items: center; gap: 1rem; padding: 4rem 2rem; background: #f8fafc; border: 1px dashed #cbd5e1; border-radius: 16px; text-align: center; }
.sb-empty svg { width: 48px; height: 48px; color: #94a3b8; }
.sb-empty p  { margin: 0; color: #64748b; }
.history-list { display: flex; flex-direction: column; gap: 1rem; }

.history-card {
  background: #fff;
  border-radius: 14px;
  border: 1px solid #f1f5f9;
  box-shadow: 0 2px 8px rgba(0,0,0,.04);
  padding: 1.25rem 1.5rem;
  display: flex;
  flex-direction: column;
  gap: .6rem;
}
.hc-top  { display: flex; align-items: center; gap: .75rem; flex-wrap: wrap; }
.hc-cat  { display: inline-flex; align-items: center; gap: .3rem; font-size: .72rem; font-weight: 700; padding: .2rem .6rem; border-radius: 999px; }
.hc-subject { margin: 0; font-size: .95rem; font-weight: 700; color: #0f172a; }
.hc-msg     { margin: 0; font-size: .875rem; color: #475569; line-height: 1.5; }
.hc-date    { font-size: .75rem; color: #94a3b8; margin-left: auto; white-space: nowrap; }
.hc-anon    { font-size: .75rem; color: #94a3b8; }

.hc-note {
  display: flex;
  align-items: flex-start;
  gap: .6rem;
  background: #eff6ff;
  border: 1px solid #bfdbfe;
  border-radius: 10px;
  padding: .75rem 1rem;
  font-size: .85rem;
  color: #1d4ed8;
}
.hc-note svg { width: 15px; height: 15px; flex-shrink: 0; margin-top: 2px; }

/* Category colour variants */
.cat-complaint  { background: #fff1f2; color: #be123c; border-color: #fecdd3; }
.cat-suggestion { background: #fef9c3; color: #a16207; border-color: #fde68a; }
.cat-feedback   { background: #f0fdf4; color: #15803d; border-color: #bbf7d0; }
.cat-other      { background: #f5f3ff; color: #6d28d9; border-color: #ddd6fe; }
.cat-chip.selected.cat-complaint  { background: #be123c; border-color: #be123c; color: #fff; }
.cat-chip.selected.cat-suggestion { background: #a16207; border-color: #a16207; color: #fff; }
.cat-chip.selected.cat-feedback   { background: #15803d; border-color: #15803d; color: #fff; }
.cat-chip.selected.cat-other      { background: #6d28d9; border-color: #6d28d9; color: #fff; }

/* Status badges */
.hc-status { font-size: .72rem; font-weight: 700; padding: .2rem .6rem; border-radius: 999px; }
.status-unread   { background: #dbeafe; color: #1d4ed8; }
.status-reviewed { background: #fef9c3; color: #a16207; }
.status-resolved { background: #dcfce7; color: #15803d; }

/* Transitions */
.fade-enter-active, .fade-leave-active { transition: opacity .3s; }
.fade-enter-from, .fade-leave-to { opacity: 0; }
.spin { animation: spin .8s linear infinite; }
@keyframes spin { to { transform: rotate(360deg); } }

/* Responsive */
@media (max-width: 600px) {
  .sb-header { flex-direction: column; align-items: flex-start; gap: .75rem; }
  .sb-header-icon { width: 48px; height: 48px; }
  .sb-title { font-size: 1.4rem; }
  .sb-card  { padding: 1.25rem; }
  .sb-tabs  { flex-wrap: wrap; }
  .category-chips { gap: .4rem; }
}
</style>
