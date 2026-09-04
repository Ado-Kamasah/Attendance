<template>
  <div class="sv-container">

    <!-- Header -->
    <div class="sv-header">
      <div>
        <h1 class="sv-title">Suggestion Box</h1>
        <p class="sv-subtitle">Review complaints, suggestions and feedback submitted by students</p>
      </div>
      <div class="sv-kpis">
        <div class="kpi-pill kpi-blue">
          <span class="kpi-num">{{ unread }}</span>
          <span class="kpi-lbl">Unread</span>
        </div>
        <div class="kpi-pill kpi-amber">
          <span class="kpi-num">{{ reviewed }}</span>
          <span class="kpi-lbl">Reviewed</span>
        </div>
        <div class="kpi-pill kpi-green">
          <span class="kpi-num">{{ resolved }}</span>
          <span class="kpi-lbl">Resolved</span>
        </div>
      </div>
    </div>

    <!-- Filters -->
    <div class="sv-filters">
      <div class="search-wrap">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
        <input v-model="search" type="text" placeholder="Search subject or message…" class="search-in" />
      </div>
      <select v-model="filterStatus"   class="fsel">
        <option value="">All Statuses</option>
        <option value="unread">Unread</option>
        <option value="reviewed">Reviewed</option>
        <option value="resolved">Resolved</option>
      </select>
      <select v-model="filterCategory" class="fsel">
        <option value="">All Categories</option>
        <option value="complaint">Complaint</option>
        <option value="suggestion">Suggestion</option>
        <option value="feedback">Feedback</option>
        <option value="other">Other</option>
      </select>
      <button class="refresh-btn" @click="load" :disabled="isLoading">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="23 4 23 10 17 10"/><path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10"/></svg>
        Refresh
      </button>
    </div>

    <!-- Loading / empty -->
    <div v-if="isLoading" class="sv-state">Loading submissions…</div>
    <div v-else-if="filtered.length === 0" class="sv-empty">
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
      <p>No submissions found.</p>
    </div>

    <!-- Cards grid -->
    <div v-else class="sv-grid">
      <div
        v-for="s in filtered"
        :key="s.id"
        class="sv-card"
        :class="`border-${s.category}`"
      >
        <!-- Top row -->
        <div class="svc-top">
          <span class="svc-cat" :class="`cat-${s.category}`">{{ catIcon(s.category) }} {{ catLabel(s.category) }}</span>
          <span class="svc-status" :class="`status-${s.status}`">{{ statusLabel(s.status) }}</span>
          <span class="svc-date">{{ fmtDate(s.createdAt) }}</span>
        </div>

        <!-- Subject -->
        <p class="svc-subject">{{ s.subject }}</p>

        <!-- Message -->
        <p class="svc-msg">{{ s.message }}</p>

        <!-- Admin note (if any) -->
        <div v-if="s.adminNote" class="svc-note">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
          <span><strong>Your note:</strong> {{ s.adminNote }}</span>
        </div>

        <!-- Actions -->
        <div class="svc-actions">
          <div class="svc-status-btns">
            <button
              v-for="st in statusOptions"
              :key="st.value"
              class="st-btn"
              :class="[`st-${st.value}`, { active: s.status === st.value }]"
              @click="changeStatus(s, st.value)"
              :disabled="s.status === st.value || s._saving"
            >{{ st.label }}</button>
          </div>
          <button class="reply-btn" @click="openNote(s)">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
            {{ s.adminNote ? 'Edit Note' : 'Add Note' }}
          </button>
        </div>
      </div>
    </div>

    <!-- Note modal -->
    <Teleport to="body">
      <transition name="modal">
        <div v-if="noteModal.open" class="modal-overlay" @click.self="noteModal.open = false">
          <div class="modal-box">
            <div class="modal-head">
              <h3>Add / Edit Response Note</h3>
              <button class="modal-close" @click="noteModal.open = false">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
              </button>
            </div>
            <p class="modal-subject">Re: {{ noteModal.subject }}</p>
            <textarea
              v-model="noteModal.note"
              class="modal-ta"
              rows="5"
              placeholder="Write your internal note or response here…"
            ></textarea>
            <div class="modal-footer">
              <button class="modal-cancel" @click="noteModal.open = false">Cancel</button>
              <button class="modal-save"   @click="saveNote" :disabled="noteModal.saving">
                {{ noteModal.saving ? 'Saving…' : 'Save Note' }}
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
import api from '@/api.js';

const suggestions = ref([]);
const isLoading   = ref(false);
const search         = ref('');
const filterStatus   = ref('');
const filterCategory = ref('');

const noteModal = reactive({ open: false, id: '', subject: '', note: '', saving: false });

const statusOptions = [
  { value: 'unread',   label: '🔵 Unread'   },
  { value: 'reviewed', label: '🟡 Reviewed' },
  { value: 'resolved', label: '🟢 Resolved' },
];

const categories = [
  { value: 'complaint',  label: 'Complaint',  icon: '😤' },
  { value: 'suggestion', label: 'Suggestion', icon: '💡' },
  { value: 'feedback',   label: 'Feedback',   icon: '📝' },
  { value: 'other',      label: 'Other',      icon: '📌' },
];

const catIcon  = (v) => categories.find(c => c.value === v)?.icon  ?? '📌';
const catLabel = (v) => categories.find(c => c.value === v)?.label ?? v;
const statusLabel = (s) => ({ unread: '🔵 Unread', reviewed: '🟡 Reviewed', resolved: '🟢 Resolved' })[s] ?? s;
const fmtDate = (d) => new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });

const unread   = computed(() => suggestions.value.filter(s => s.status === 'unread').length);
const reviewed = computed(() => suggestions.value.filter(s => s.status === 'reviewed').length);
const resolved = computed(() => suggestions.value.filter(s => s.status === 'resolved').length);

const filtered = computed(() => {
  let list = suggestions.value;
  if (filterStatus.value)   list = list.filter(s => s.status   === filterStatus.value);
  if (filterCategory.value) list = list.filter(s => s.category === filterCategory.value);
  if (search.value.trim()) {
    const q = search.value.toLowerCase();
    list = list.filter(s =>
      s.subject.toLowerCase().includes(q) ||
      s.message.toLowerCase().includes(q)
    );
  }
  return list;
});

async function load() {
  isLoading.value = true;
  try {
    const { data } = await api.get('/suggestions');
    suggestions.value = data.map(s => ({ ...s, _saving: false }));
  } catch { /* silent */ } finally {
    isLoading.value = false;
  }
}

async function changeStatus(s, newStatus) {
  s._saving = true;
  try {
    await api.patch(`/suggestions/${s.id}`, { status: newStatus });
    s.status = newStatus;
  } catch { /* silent */ } finally {
    s._saving = false;
  }
}

function openNote(s) {
  noteModal.id      = s.id;
  noteModal.subject = s.subject;
  noteModal.note    = s.adminNote || '';
  noteModal.open    = true;
}

async function saveNote() {
  noteModal.saving = true;
  try {
    await api.patch(`/suggestions/${noteModal.id}`, { adminNote: noteModal.note });
    const s = suggestions.value.find(x => x.id === noteModal.id);
    if (s) s.adminNote = noteModal.note;
    noteModal.open = false;
  } catch { /* silent */ } finally {
    noteModal.saving = false;
  }
}

onMounted(load);
</script>

<style scoped>
* { font-family: 'Inter', sans-serif; box-sizing: border-box; }

.sv-container { display: flex; flex-direction: column; gap: 1.75rem; width: 100%; }

/* Header */
.sv-header  { display: flex; justify-content: space-between; align-items: flex-start; flex-wrap: wrap; gap: 1rem; }
.sv-title   { margin: 0; font-size: 1.75rem; font-weight: 800; color: #0f172a; letter-spacing: -.025em; }
.sv-subtitle { margin: .25rem 0 0; font-size: .9rem; color: #64748b; }
.sv-kpis    { display: flex; gap: .75rem; flex-wrap: wrap; }

.kpi-pill {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: .6rem 1.1rem;
  border-radius: 12px;
  min-width: 72px;
}
.kpi-num  { font-size: 1.5rem; font-weight: 800; line-height: 1; }
.kpi-lbl  { font-size: .7rem; font-weight: 600; text-transform: uppercase; letter-spacing: .06em; margin-top: .2rem; }
.kpi-blue  { background: #dbeafe; color: #1d4ed8; }
.kpi-amber { background: #fef9c3; color: #a16207; }
.kpi-green { background: #dcfce7; color: #15803d; }

/* Filters */
.sv-filters { display: flex; gap: .75rem; flex-wrap: wrap; align-items: center; }
.search-wrap { display: flex; align-items: center; gap: .5rem; background: #fff; border: 1px solid #e2e8f0; border-radius: 9px; padding: .45rem .85rem; flex: 1; min-width: 200px; }
.search-wrap svg { width: 15px; height: 15px; color: #94a3b8; flex-shrink: 0; }
.search-in { border: none; background: transparent; outline: none; font-size: .875rem; color: #334155; width: 100%; }
.fsel { padding: .45rem .75rem; border: 1px solid #e2e8f0; border-radius: 9px; font-size: .875rem; color: #334155; background: #fff; outline: none; cursor: pointer; }
.refresh-btn { display: inline-flex; align-items: center; gap: .4rem; padding: .45rem .9rem; border: 1px solid #e2e8f0; border-radius: 9px; font-size: .875rem; font-weight: 600; color: #475569; background: #fff; cursor: pointer; transition: all .2s; white-space: nowrap; }
.refresh-btn svg { width: 14px; height: 14px; }
.refresh-btn:hover:not(:disabled) { border-color: #6366f1; color: #4f46e5; }

/* States */
.sv-state { text-align: center; color: #94a3b8; padding: 4rem; }
.sv-empty { display: flex; flex-direction: column; align-items: center; gap: 1rem; padding: 4rem 2rem; background: #f8fafc; border: 1px dashed #cbd5e1; border-radius: 16px; text-align: center; }
.sv-empty svg { width: 48px; height: 48px; color: #cbd5e1; }
.sv-empty p  { margin: 0; color: #64748b; }

/* Grid */
.sv-grid { display: flex; flex-direction: column; gap: 1rem; }

.sv-card {
  background: #fff;
  border-radius: 16px;
  border: 1px solid #f1f5f9;
  border-left: 5px solid #e2e8f0;
  box-shadow: 0 2px 8px rgba(0,0,0,.04);
  padding: 1.5rem;
  display: flex;
  flex-direction: column;
  gap: .75rem;
  transition: box-shadow .2s;
}
.sv-card:hover { box-shadow: 0 4px 16px rgba(0,0,0,.08); }
.border-complaint  { border-left-color: #be123c; }
.border-suggestion { border-left-color: #a16207; }
.border-feedback   { border-left-color: #15803d; }
.border-other      { border-left-color: #6d28d9; }

.svc-top     { display: flex; align-items: center; gap: .6rem; flex-wrap: wrap; }
.svc-cat     { display: inline-flex; align-items: center; gap: .3rem; font-size: .72rem; font-weight: 700; padding: .2rem .6rem; border-radius: 999px; }
.svc-subject { margin: 0; font-size: 1rem; font-weight: 700; color: #0f172a; }
.svc-date    { font-size: .75rem; color: #94a3b8; margin-left: auto; white-space: nowrap; }
.svc-status  { font-size: .72rem; font-weight: 700; padding: .2rem .6rem; border-radius: 999px; }
.svc-msg     { margin: 0; font-size: .875rem; color: #475569; line-height: 1.6; }

.svc-note {
  display: flex; align-items: flex-start; gap: .6rem;
  background: #eff6ff; border: 1px solid #bfdbfe; border-radius: 10px;
  padding: .75rem 1rem; font-size: .85rem; color: #1d4ed8;
}
.svc-note svg { width: 14px; height: 14px; flex-shrink: 0; margin-top: 2px; }

/* Actions */
.svc-actions { display: flex; align-items: center; gap: .75rem; flex-wrap: wrap; padding-top: .5rem; border-top: 1px solid #f8fafc; }
.svc-status-btns { display: flex; gap: .4rem; flex-wrap: wrap; }
.st-btn { padding: .35rem .8rem; border-radius: 8px; font-size: .78rem; font-weight: 700; cursor: pointer; border: 1.5px solid transparent; transition: all .15s; opacity: .55; }
.st-btn.active, .st-btn:not(:disabled):hover { opacity: 1; }
.st-unread   { background: #dbeafe; color: #1d4ed8; border-color: #bfdbfe; }
.st-reviewed { background: #fef9c3; color: #a16207; border-color: #fde68a; }
.st-resolved { background: #dcfce7; color: #15803d; border-color: #bbf7d0; }
.st-btn.active { transform: scale(1.05); }
.st-btn:disabled { cursor: not-allowed; }

.reply-btn {
  display: inline-flex; align-items: center; gap: .4rem;
  padding: .35rem .85rem; border-radius: 8px; border: 1px solid #e2e8f0;
  background: #fff; color: #475569; font-size: .78rem; font-weight: 600;
  cursor: pointer; transition: all .2s; margin-left: auto;
}
.reply-btn svg { width: 13px; height: 13px; }
.reply-btn:hover { border-color: #6366f1; color: #4f46e5; background: #f5f3ff; }

/* Category + status colours shared */
.cat-complaint  { background: #fff1f2; color: #be123c; }
.cat-suggestion { background: #fef9c3; color: #a16207; }
.cat-feedback   { background: #f0fdf4; color: #15803d; }
.cat-other      { background: #f5f3ff; color: #6d28d9; }
.status-unread   { background: #dbeafe; color: #1d4ed8; }
.status-reviewed { background: #fef9c3; color: #a16207; }
.status-resolved { background: #dcfce7; color: #15803d; }

/* Modal */
.modal-overlay {
  position: fixed; inset: 0;
  background: rgba(15,23,42,.55); backdrop-filter: blur(5px);
  display: flex; align-items: center; justify-content: center;
  z-index: 9999; padding: 1rem;
}
.modal-box {
  background: #fff; border-radius: 20px; padding: 2rem;
  width: 100%; max-width: 480px;
  box-shadow: 0 24px 48px rgba(0,0,0,.18);
  display: flex; flex-direction: column; gap: 1rem;
}
.modal-head { display: flex; justify-content: space-between; align-items: center; }
.modal-head h3 { margin: 0; font-size: 1.05rem; font-weight: 700; color: #0f172a; }
.modal-close { background: none; border: none; cursor: pointer; color: #94a3b8; padding: 0; }
.modal-close svg { width: 20px; height: 20px; }
.modal-subject { margin: 0; font-size: .85rem; color: #64748b; }
.modal-ta { width: 100%; border: 1.5px solid #e2e8f0; border-radius: 10px; padding: .75rem; font-size: .9rem; color: #334155; outline: none; resize: vertical; font-family: inherit; }
.modal-ta:focus { border-color: #6366f1; }
.modal-footer { display: flex; justify-content: flex-end; gap: .75rem; }
.modal-cancel { padding: .6rem 1.25rem; border: 1px solid #e2e8f0; border-radius: 9px; background: #fff; font-size: .875rem; font-weight: 600; color: #475569; cursor: pointer; }
.modal-save   { padding: .6rem 1.5rem; border: none; border-radius: 9px; background: linear-gradient(135deg,#6366f1,#4f46e5); color: #fff; font-size: .875rem; font-weight: 700; cursor: pointer; transition: all .2s; }
.modal-save:hover:not(:disabled) { transform: translateY(-1px); }
.modal-save:disabled { opacity: .55; cursor: not-allowed; }

.modal-enter-active, .modal-leave-active { transition: all .25s ease; }
.modal-enter-from, .modal-leave-to { opacity: 0; transform: scale(.96); }

@media (max-width: 640px) {
  .sv-header { flex-direction: column; }
  .sv-kpis   { width: 100%; }
  .kpi-pill  { flex: 1; }
  .sv-filters { flex-direction: column; }
  .search-wrap { min-width: 100%; }
  .fsel { width: 100%; }
  .svc-actions { flex-direction: column; align-items: flex-start; }
  .reply-btn { margin-left: 0; }
}
</style>
