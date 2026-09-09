<template>
  <div class="sv-container">

    <!-- Header -->
    <div class="sv-header">
      <div>
        <h1 class="sv-title">Suggestion Box</h1>
        <p class="sv-subtitle">Review complaints, suggestions and feedback submitted by users</p>
      </div>
      <div class="sv-kpis">
        <div class="kpi-pill kpi-blue" @click="filterStatus = filterStatus === 'unread' ? '' : 'unread'" :class="{ 'kpi-active': filterStatus === 'unread' }">
          <span class="kpi-num">{{ unread }}</span>
          <span class="kpi-lbl">Unread</span>
        </div>
        <div class="kpi-pill kpi-amber" @click="filterStatus = filterStatus === 'reviewed' ? '' : 'reviewed'" :class="{ 'kpi-active': filterStatus === 'reviewed' }">
          <span class="kpi-num">{{ reviewed }}</span>
          <span class="kpi-lbl">Reviewed</span>
        </div>
        <div class="kpi-pill kpi-green" @click="filterStatus = filterStatus === 'resolved' ? '' : 'resolved'" :class="{ 'kpi-active': filterStatus === 'resolved' }">
          <span class="kpi-num">{{ resolved }}</span>
          <span class="kpi-lbl">Resolved</span>
        </div>
        <div class="kpi-pill kpi-total">
          <span class="kpi-num">{{ suggestions.length }}</span>
          <span class="kpi-lbl">Total</span>
        </div>
      </div>
    </div>

    <!-- Filters -->
    <div class="sv-filters">
      <div class="search-wrap">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
        <input v-model="search" type="text" placeholder="Search subject or message…" class="search-in" id="suggestions-search" />
        <button v-if="search" @click="search = ''" class="clear-btn">✕</button>
      </div>
      <select v-model="filterStatus" class="fsel" id="suggestions-status-filter">
        <option value="">All Statuses</option>
        <option value="unread">Unread</option>
        <option value="reviewed">Reviewed</option>
        <option value="resolved">Resolved</option>
      </select>
      <select v-model="filterCategory" class="fsel" id="suggestions-category-filter">
        <option value="">All Categories</option>
        <option value="complaint">Complaint</option>
        <option value="suggestion">Suggestion</option>
        <option value="feedback">Feedback</option>
        <option value="other">Other</option>
      </select>
      <button class="refresh-btn" @click="load" :disabled="isLoading" id="suggestions-refresh-btn">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="23 4 23 10 17 10"/><path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10"/></svg>
        Refresh
      </button>
    </div>

    <!-- Loading -->
    <div v-if="isLoading" class="sv-state">
      <div class="spinner"></div>
      Loading submissions…
    </div>

    <!-- Empty -->
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
          <span class="svc-date">{{ fmtDate(s.created_at) }}</span>
        </div>

        <!-- Submitter info (shown unless anonymous) -->
        <div class="svc-submitter" v-if="s.submitterName && !s.is_anonymous">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
          <span>{{ s.submitterName }}</span>
        </div>
        <div class="svc-submitter svc-anon" v-else-if="s.is_anonymous">
          <span>🔒 Anonymous submission</span>
        </div>

        <!-- Subject -->
        <p class="svc-subject">{{ s.subject }}</p>

        <!-- Message -->
        <p class="svc-msg">{{ s.message }}</p>

        <!-- Admin note (if any) -->
        <div v-if="s.admin_note" class="svc-note">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
          <span><strong>Your note:</strong> {{ s.admin_note }}</span>
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
              :id="`status-${st.value}-${s.id}`"
            >{{ st.label }}</button>
          </div>
          <button class="reply-btn" @click="openNote(s)" :id="`note-${s.id}`">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
            {{ s.admin_note ? 'Edit Note' : 'Add Note' }}
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
              <button class="modal-close" @click="noteModal.open = false" id="modal-close-note">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
              </button>
            </div>
            <p class="modal-subject">Re: {{ noteModal.subject }}</p>
            <textarea
              v-model="noteModal.note"
              class="modal-ta"
              rows="5"
              placeholder="Write your internal note or response here…"
              id="modal-note-textarea"
            ></textarea>
            <div class="modal-footer">
              <button class="modal-cancel" @click="noteModal.open = false">Cancel</button>
              <button class="modal-save" @click="saveNote" :disabled="noteModal.saving" id="modal-save-note">
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
import { supabase } from '@/stores/supabase';

const suggestions  = ref([]);
const isLoading    = ref(false);
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

const catIcon     = (v) => categories.find(c => c.value === v)?.icon  ?? '📌';
const catLabel    = (v) => categories.find(c => c.value === v)?.label ?? v;
const statusLabel = (s) => ({ unread: '🔵 Unread', reviewed: '🟡 Reviewed', resolved: '🟢 Resolved' })[s] ?? s;
const fmtDate     = (d) => d ? new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : '—';

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
      (s.subject || '').toLowerCase().includes(q) ||
      (s.message || '').toLowerCase().includes(q) ||
      (s.submitterName || '').toLowerCase().includes(q)
    );
  }
  return list;
});

async function load() {
  isLoading.value = true;
  try {
    // Fetch all suggestions ordered by newest first
    const { data, error } = await supabase
      .from('suggestions')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;

    const rows = data || [];

    // Resolve non-anonymous submitter names
    const userIds = [...new Set(
      rows.filter(r => r.user_id && !r.is_anonymous).map(r => r.user_id)
    )];

    let nameMap = new Map();
    if (userIds.length > 0) {
      const { data: usersData } = await supabase
        .from('users')
        .select('id, name')
        .in('id', userIds);
      nameMap = new Map((usersData || []).map(u => [u.id, u.name]));
    }

    suggestions.value = rows.map(s => ({
      ...s,
      _saving:       false,
      submitterName: s.is_anonymous ? null : (nameMap.get(s.user_id) || 'Unknown User'),
    }));
  } catch (e) {
    console.error('load suggestions error:', e);
    suggestions.value = [];
  } finally {
    isLoading.value = false;
  }
}

async function changeStatus(s, newStatus) {
  s._saving = true;
  try {
    const { error } = await supabase
      .from('suggestions')
      .update({ status: newStatus })
      .eq('id', s.id);

    if (error) throw error;
    s.status = newStatus;
  } catch (e) {
    console.error('changeStatus error:', e);
  } finally {
    s._saving = false;
  }
}

function openNote(s) {
  noteModal.id      = s.id;
  noteModal.subject = s.subject;
  noteModal.note    = s.admin_note || '';
  noteModal.open    = true;
}

async function saveNote() {
  noteModal.saving = true;
  try {
    const { error } = await supabase
      .from('suggestions')
      .update({ admin_note: noteModal.note })
      .eq('id', noteModal.id);

    if (error) throw error;

    const s = suggestions.value.find(x => x.id === noteModal.id);
    if (s) s.admin_note = noteModal.note;
    noteModal.open = false;
  } catch (e) {
    console.error('saveNote error:', e);
  } finally {
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
  display: flex; flex-direction: column; align-items: center;
  padding: .6rem 1.1rem; border-radius: 12px; min-width: 72px;
  cursor: pointer; transition: all .2s; border: 2px solid transparent;
}
.kpi-pill:hover { transform: translateY(-1px); }
.kpi-pill.kpi-active { border-color: currentColor; }
.kpi-num  { font-size: 1.5rem; font-weight: 800; line-height: 1; }
.kpi-lbl  { font-size: .7rem; font-weight: 600; text-transform: uppercase; letter-spacing: .06em; margin-top: .2rem; }
.kpi-blue  { background: #dbeafe; color: #1d4ed8; }
.kpi-amber { background: #fef9c3; color: #a16207; }
.kpi-green { background: #dcfce7; color: #15803d; }
.kpi-total { background: #f1f5f9; color: #475569; cursor: default; }

/* Filters */
.sv-filters {
  display: flex; align-items: center; gap: .75rem; flex-wrap: wrap;
  background: #fff; border-radius: 14px; border: 1px solid #f1f5f9;
  padding: .85rem 1.1rem; box-shadow: 0 2px 6px rgba(0,0,0,.04);
}
.search-wrap { display: flex; align-items: center; gap: .5rem; background: #f8fafc; border: 1.5px solid #e2e8f0; border-radius: 9px; padding: .45rem .75rem; flex: 1; min-width: 180px; }
.search-wrap svg { width: 15px; height: 15px; color: #94a3b8; flex-shrink: 0; }
.search-in { border: none; background: transparent; outline: none; font-size: .875rem; color: #334155; width: 100%; }
.clear-btn { background: none; border: none; color: #94a3b8; cursor: pointer; font-size: .75rem; }
.fsel { padding: .5rem .75rem; border: 1.5px solid #e2e8f0; border-radius: 9px; font-size: .82rem; color: #334155; background: #fff; outline: none; }
.refresh-btn { display: inline-flex; align-items: center; gap: .4rem; padding: .5rem .95rem; border-radius: 9px; background: #f8fafc; border: 1.5px solid #e2e8f0; font-size: .82rem; font-weight: 600; color: #475569; cursor: pointer; transition: all .2s; }
.refresh-btn svg { width: 14px; height: 14px; }
.refresh-btn:disabled { opacity: .5; cursor: not-allowed; }
.refresh-btn:not(:disabled):hover { background: #e2e8f0; }

/* States */
.sv-state { display: flex; align-items: center; gap: .75rem; padding: 3rem; justify-content: center; color: #64748b; }
.spinner { width: 18px; height: 18px; border: 2px solid #e2e8f0; border-top-color: #6366f1; border-radius: 50%; animation: spin .7s linear infinite; }
@keyframes spin { to { transform: rotate(360deg); } }
.sv-empty { display: flex; flex-direction: column; align-items: center; gap: 1rem; padding: 5rem 1rem; background: #fff; border-radius: 20px; border: 1px solid #f1f5f9; color: #94a3b8; text-align: center; }
.sv-empty svg { width: 52px; height: 52px; }
.sv-empty p { margin: 0; font-size: .9rem; }

/* Grid */
.sv-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(340px, 1fr)); gap: 1.25rem; }

/* Cards */
.sv-card {
  background: #fff; border-radius: 16px; border: 1px solid #f1f5f9;
  border-left: 4px solid #e2e8f0;
  padding: 1.25rem 1.5rem; box-shadow: 0 2px 8px rgba(0,0,0,.04);
  display: flex; flex-direction: column; gap: .7rem;
  transition: box-shadow .2s;
}
.sv-card:hover { box-shadow: 0 4px 16px rgba(0,0,0,.08); }
.sv-card.border-complaint  { border-left-color: #ef4444; }
.sv-card.border-suggestion { border-left-color: #f59e0b; }
.sv-card.border-feedback   { border-left-color: #6366f1; }
.sv-card.border-other      { border-left-color: #64748b; }

.svc-top { display: flex; align-items: center; gap: .6rem; flex-wrap: wrap; }
.svc-cat { font-size: .7rem; font-weight: 700; padding: .2rem .55rem; border-radius: 6px; }
.cat-complaint  { background: #fee2e2; color: #b91c1c; }
.cat-suggestion { background: #fef3c7; color: #b45309; }
.cat-feedback   { background: #e0e7ff; color: #4338ca; }
.cat-other      { background: #f1f5f9; color: #475569; }

.svc-status { font-size: .7rem; font-weight: 700; padding: .2rem .55rem; border-radius: 6px; }
.status-unread   { background: #dbeafe; color: #1d4ed8; }
.status-reviewed { background: #fef9c3; color: #a16207; }
.status-resolved { background: #dcfce7; color: #15803d; }

.svc-date { font-size: .72rem; color: #94a3b8; margin-left: auto; }

.svc-submitter { display: flex; align-items: center; gap: .4rem; font-size: .78rem; color: #475569; }
.svc-submitter svg { width: 13px; height: 13px; }
.svc-anon { color: #94a3b8; font-style: italic; }

.svc-subject { margin: 0; font-weight: 700; color: #0f172a; font-size: .95rem; }
.svc-msg     { margin: 0; color: #475569; font-size: .875rem; line-height: 1.6; display: -webkit-box; -webkit-line-clamp: 4; -webkit-box-orient: vertical; overflow: hidden; }

.svc-note {
  display: flex; align-items: flex-start; gap: .5rem;
  background: #f0fdf4; border: 1px solid #bbf7d0; border-radius: 8px;
  padding: .6rem .8rem; font-size: .78rem; color: #15803d;
}
.svc-note svg { width: 13px; height: 13px; flex-shrink: 0; margin-top: 1px; }

.svc-actions { display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: .5rem; margin-top: .25rem; }
.svc-status-btns { display: flex; gap: .35rem; }

.st-btn { padding: .3rem .65rem; border-radius: 7px; border: 1.5px solid #e2e8f0; background: #f8fafc; font-size: .72rem; font-weight: 700; cursor: pointer; transition: all .15s; color: #475569; }
.st-btn.active { cursor: default; opacity: .6; }
.st-btn.st-unread.active   { background: #dbeafe; border-color: #93c5fd; color: #1d4ed8; }
.st-btn.st-reviewed.active { background: #fef9c3; border-color: #fde047; color: #a16207; }
.st-btn.st-resolved.active { background: #dcfce7; border-color: #86efac; color: #15803d; }
.st-btn:not(.active):hover { border-color: #94a3b8; background: #f1f5f9; }
.st-btn:disabled { opacity: .4; cursor: not-allowed; }

.reply-btn { display: inline-flex; align-items: center; gap: .35rem; padding: .35rem .8rem; border-radius: 8px; background: #f8fafc; border: 1.5px solid #e2e8f0; font-size: .78rem; font-weight: 600; color: #475569; cursor: pointer; transition: all .2s; }
.reply-btn svg { width: 13px; height: 13px; }
.reply-btn:hover { background: #e0e7ff; border-color: #a5b4fc; color: #4338ca; }

/* Modal */
.modal-overlay { position: fixed; inset: 0; background: rgba(15,23,42,.5); backdrop-filter: blur(4px); display: flex; align-items: center; justify-content: center; z-index: 9999; padding: 1rem; }
.modal-box { background: #fff; border-radius: 20px; width: 100%; max-width: 500px; box-shadow: 0 24px 48px rgba(0,0,0,.2); padding: 1.75rem; display: flex; flex-direction: column; gap: 1rem; }
.modal-head { display: flex; justify-content: space-between; align-items: center; }
.modal-head h3 { margin: 0; font-size: 1.05rem; font-weight: 700; color: #0f172a; }
.modal-close { background: none; border: none; cursor: pointer; color: #94a3b8; padding: .25rem; border-radius: 6px; transition: color .2s; }
.modal-close:hover { color: #334155; }
.modal-close svg { width: 18px; height: 18px; }
.modal-subject { margin: 0; font-size: .82rem; color: #64748b; border-left: 3px solid #6366f1; padding-left: .6rem; }
.modal-ta { width: 100%; border: 1.5px solid #e2e8f0; border-radius: 10px; padding: .75rem; font-size: .875rem; color: #334155; outline: none; resize: vertical; font-family: 'Inter', sans-serif; transition: border-color .2s; }
.modal-ta:focus { border-color: #6366f1; box-shadow: 0 0 0 3px rgba(99,102,241,.12); }
.modal-footer { display: flex; justify-content: flex-end; gap: .75rem; }
.modal-cancel { background: #f1f5f9; border: none; color: #475569; padding: .6rem 1.2rem; border-radius: 10px; font-weight: 600; cursor: pointer; transition: background .2s; }
.modal-cancel:hover { background: #e2e8f0; }
.modal-save { background: linear-gradient(135deg, #6366f1, #4f46e5); color: #fff; border: none; padding: .6rem 1.4rem; border-radius: 10px; font-weight: 700; cursor: pointer; transition: all .2s; }
.modal-save:disabled { opacity: .5; cursor: not-allowed; }
.modal-save:not(:disabled):hover { transform: translateY(-1px); box-shadow: 0 4px 12px rgba(99,102,241,.3); }

/* Modal transition */
.modal-enter-active, .modal-leave-active { transition: all .25s; }
.modal-enter-from, .modal-leave-to { opacity: 0; transform: scale(.95); }

@media (max-width: 640px) {
  .sv-grid { grid-template-columns: 1fr; }
  .sv-kpis { flex-wrap: wrap; }
  .sv-filters { flex-direction: column; align-items: stretch; }
  .search-wrap { min-width: unset; }
}
</style>
