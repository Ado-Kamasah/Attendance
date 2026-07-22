<template>
  <div class="profile-container">
    <!-- Header -->
    <div class="page-header">
      <div class="header-text">
        <h1 class="page-title">My Profile</h1>
        <p class="page-subtitle">View and manage your account details</p>
      </div>
      <button v-if="!isEditing" class="edit-btn" @click="startEdit" id="edit-profile-btn">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
        Edit Profile
      </button>
    </div>

    <!-- Success / Error alerts -->
    <transition name="fade">
      <div v-if="successMsg" class="alert alert-success">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="20 6 9 17 4 12"/></svg>
        {{ successMsg }}
      </div>
    </transition>
    <transition name="fade">
      <div v-if="errorMsg" class="alert alert-error">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
        {{ errorMsg }}
      </div>
    </transition>

    <div class="profile-grid">
      <!-- Left: Avatar card -->
      <div class="avatar-card">
        <div class="avatar-wrap">
          <div class="avatar-circle" :style="{ background: avatarBg }">
            {{ initials }}
          </div>
          <div class="role-badge" :class="'role-' + roleLower">{{ profile?.role || 'User' }}</div>
        </div>
        <h2 class="avatar-name">{{ profile?.name || '—' }}</h2>
        <p class="avatar-email">{{ profile?.email || '—' }}</p>
        <div class="avatar-meta">
          <div class="meta-item">
            <span class="meta-label">User ID</span>
            <span class="meta-value">{{ profile?.id_number || '—' }}</span>
          </div>
          <div class="meta-item" v-if="profile?.program">
            <span class="meta-label">Program</span>
            <span class="meta-value">{{ profile.program }}</span>
          </div>
          <div class="meta-item">
            <span class="meta-label">Member Since</span>
            <span class="meta-value">{{ joinDate }}</span>
          </div>
        </div>
      </div>

      <!-- Right: Details / Edit form -->
      <div class="details-panel">

        <!-- VIEW MODE -->
        <div v-if="!isEditing" class="view-mode">
          <div class="section-header"><h3>Personal Information</h3></div>
          <div class="info-grid">
            <div class="info-item">
              <label>Full Name</label>
              <span>{{ profile?.name || '—' }}</span>
            </div>
            <div class="info-item">
              <label>Email Address</label>
              <span>{{ profile?.email || '—' }}</span>
            </div>
            <div class="info-item">
              <label>Role</label>
              <span class="role-text" :class="'role-' + roleLower">{{ profile?.role || '—' }}</span>
            </div>
            <div class="info-item" v-if="profile?.program">
              <label>Programme</label>
              <span>{{ profile.program }}</span>
            </div>
            <div class="info-item">
              <label>User ID / Index</label>
              <span class="mono">{{ profile?.id_number || '—' }}</span>
            </div>
            <div class="info-item">
              <label>Account Created</label>
              <span>{{ joinDate }}</span>
            </div>
          </div>

          <div class="section-header mt"><h3>Security</h3></div>
          <div class="info-grid">
            <div class="info-item">
              <label>Password</label>
              <span>••••••••</span>
            </div>
          </div>
          <button class="change-pw-btn" @click="showPasswordSection = !showPasswordSection" id="toggle-password-btn">
            {{ showPasswordSection ? 'Cancel' : 'Change Password' }}
          </button>

          <!-- Inline password change -->
          <div v-if="showPasswordSection" class="password-section">
            <div class="form-group">
              <label>New Password</label>
              <div class="input-wrap">
                <input :type="showNewPw ? 'text' : 'password'" v-model="pwForm.newPassword" placeholder="Min. 8 characters" id="new-password-input" />
                <button class="eye-btn" type="button" @click="showNewPw = !showNewPw">
                  <svg v-if="!showNewPw" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
                  <svg v-else viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/><line x1="1" y1="1" x2="23" y2="23"/></svg>
                </button>
              </div>
            </div>
            <div class="form-group">
              <label>Confirm Password</label>
              <div class="input-wrap">
                <input :type="showConfirmPw ? 'text' : 'password'" v-model="pwForm.confirmPassword" placeholder="Repeat new password" id="confirm-password-input" />
                <button class="eye-btn" type="button" @click="showConfirmPw = !showConfirmPw">
                  <svg v-if="!showConfirmPw" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
                  <svg v-else viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/><line x1="1" y1="1" x2="23" y2="23"/></svg>
                </button>
              </div>
            </div>
            <div v-if="pwError" class="inline-error">{{ pwError }}</div>
            <button class="save-pw-btn" @click="changePassword" :disabled="isSavingPw" id="save-password-btn">
              <svg v-if="isSavingPw" class="spin" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10" stroke-dasharray="31" stroke-dashoffset="10"/></svg>
              {{ isSavingPw ? 'Updating…' : 'Update Password' }}
            </button>
          </div>
        </div>

        <!-- EDIT MODE -->
        <div v-else class="edit-mode">
          <div class="section-header"><h3>Edit Personal Information</h3></div>
          <div class="form-grid">
            <div class="form-group full">
              <label for="edit-name">Full Name <span class="req">*</span></label>
              <input id="edit-name" type="text" v-model="editForm.name" placeholder="Enter full name" />
            </div>
            <div class="form-group full">
              <label>Email Address</label>
              <input type="email" :value="profile?.email" disabled class="disabled-input" />
              <span class="field-hint">Email cannot be changed</span>
            </div>
            <div class="form-group full" v-if="roleLower === 'student'">
              <label for="edit-program">Programme</label>
              <input id="edit-program" type="text" v-model="editForm.program" placeholder="e.g. Computer Science" />
            </div>
          </div>

          <div v-if="editError" class="inline-error">{{ editError }}</div>

          <div class="edit-actions">
            <button class="cancel-btn" @click="cancelEdit" id="cancel-edit-btn">Cancel</button>
            <button class="save-btn" @click="saveProfile" :disabled="isSaving" id="save-profile-btn">
              <svg v-if="isSaving" class="spin" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10" stroke-dasharray="31" stroke-dashoffset="10"/></svg>
              {{ isSaving ? 'Saving…' : 'Save Changes' }}
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { storeToRefs } from 'pinia';
import { useAuthStore } from '@/stores/authstore';
import { supabase } from '@/stores/supabase';

const authStore = useAuthStore();
const { profile } = storeToRefs(authStore);

// ── UI state ──────────────────────────────────────────
const isEditing = ref(false);
const isSaving = ref(false);
const isSavingPw = ref(false);
const showPasswordSection = ref(false);
const showNewPw = ref(false);
const showConfirmPw = ref(false);
const successMsg = ref('');
const errorMsg = ref('');
const editError = ref('');
const pwError = ref('');

// ── Forms ─────────────────────────────────────────────
const editForm = ref({ name: '', program: '' });
const pwForm = ref({ newPassword: '', confirmPassword: '' });

// ── Computed ──────────────────────────────────────────
const roleLower = computed(() => (profile.value?.role || 'student').toLowerCase());

const initials = computed(() => {
  const name = profile.value?.name || '';
  return name.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2) || '?';
});

const avatarBg = computed(() => {
  const map = { admin: '#ef4444', lecturer: '#10b981', student: '#3b82f6' };
  return map[roleLower.value] || '#6366f1';
});

const joinDate = computed(() => {
  const d = profile.value?.created_at || profile.value?.createdAt;
  if (!d) return '—';
  return new Date(d).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' });
});

// ── Methods ───────────────────────────────────────────
function clearAlerts() {
  successMsg.value = '';
  errorMsg.value = '';
}

function startEdit() {
  editForm.value.name = profile.value?.name || '';
  editForm.value.program = profile.value?.program || '';
  editError.value = '';
  isEditing.value = true;
}

function cancelEdit() {
  isEditing.value = false;
  editError.value = '';
}

async function saveProfile() {
  clearAlerts();
  editError.value = '';
  if (!editForm.value.name.trim()) {
    editError.value = 'Full name is required.';
    return;
  }
  isSaving.value = true;
  try {
    const updates = { name: editForm.value.name.trim() };
    if (roleLower.value === 'student' && editForm.value.program) {
      updates.program = editForm.value.program.trim();
    }
    const { error } = await supabase
      .from('users')
      .update(updates)
      .eq('id', profile.value.id);
    if (error) throw error;
    await authStore.fetchProfile();
    isEditing.value = false;
    successMsg.value = 'Profile updated successfully!';
    setTimeout(() => (successMsg.value = ''), 4000);
  } catch (e) {
    editError.value = e.message || 'Failed to update profile.';
  } finally {
    isSaving.value = false;
  }
}

async function changePassword() {
  clearAlerts();
  pwError.value = '';
  if (pwForm.value.newPassword.length < 8) {
    pwError.value = 'Password must be at least 8 characters.';
    return;
  }
  if (pwForm.value.newPassword !== pwForm.value.confirmPassword) {
    pwError.value = 'Passwords do not match.';
    return;
  }
  isSavingPw.value = true;
  try {
    const { error } = await supabase.auth.updateUser({ password: pwForm.value.newPassword });
    if (error) throw error;
    pwForm.value = { newPassword: '', confirmPassword: '' };
    showPasswordSection.value = false;
    successMsg.value = 'Password changed successfully!';
    setTimeout(() => (successMsg.value = ''), 4000);
  } catch (e) {
    pwError.value = e.message || 'Failed to change password.';
  } finally {
    isSavingPw.value = false;
  }
}

onMounted(async () => {
  if (!profile.value) await authStore.fetchProfile();
});
</script>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap');
* { font-family: 'Inter', sans-serif; box-sizing: border-box; }

.profile-container { display: flex; flex-direction: column; gap: 1.75rem; width: 100%; max-width: 1100px; }

/* Header */
.page-header { display: flex; justify-content: space-between; align-items: flex-start; }
.page-title { margin: 0; font-size: 1.85rem; font-weight: 800; color: #0f172a; letter-spacing: -0.025em; }
.page-subtitle { margin: 0.25rem 0 0; color: #64748b; font-size: 0.95rem; }

.edit-btn {
  display: flex; align-items: center; gap: 0.5rem;
  background: #0f172a; color: #fff; border: none;
  padding: 0.65rem 1.25rem; border-radius: 10px;
  font-size: 0.875rem; font-weight: 600; cursor: pointer;
  transition: all 0.2s; white-space: nowrap;
}
.edit-btn svg { width: 15px; height: 15px; }
.edit-btn:hover { background: #1e293b; transform: translateY(-1px); box-shadow: 0 4px 12px rgba(15,23,42,0.2); }

/* Alerts */
.alert { display: flex; align-items: center; gap: 0.6rem; padding: 0.85rem 1.25rem; border-radius: 10px; font-size: 0.9rem; font-weight: 500; }
.alert svg { width: 18px; height: 18px; flex-shrink: 0; }
.alert-success { background: #dcfce7; color: #166534; border: 1px solid #bbf7d0; }
.alert-error { background: #fee2e2; color: #991b1b; border: 1px solid #fecaca; }
.fade-enter-active, .fade-leave-active { transition: opacity 0.3s; }
.fade-enter-from, .fade-leave-to { opacity: 0; }

/* Grid layout */
.profile-grid { display: grid; grid-template-columns: 300px 1fr; gap: 1.5rem; align-items: start; }

/* Avatar card */
.avatar-card {
  background: #fff; border-radius: 20px;
  border: 1px solid #e2e8f0; padding: 2rem 1.5rem;
  display: flex; flex-direction: column; align-items: center; gap: 0.6rem;
  box-shadow: 0 4px 6px -1px rgba(0,0,0,0.05);
}
.avatar-wrap { position: relative; margin-bottom: 0.5rem; }
.avatar-circle {
  width: 96px; height: 96px; border-radius: 50%;
  display: flex; align-items: center; justify-content: center;
  font-size: 2rem; font-weight: 800; color: #fff;
  box-shadow: 0 8px 24px rgba(0,0,0,0.15);
}
.role-badge {
  position: absolute; bottom: -6px; left: 50%; transform: translateX(-50%);
  font-size: 0.65rem; font-weight: 700; padding: 0.2rem 0.6rem;
  border-radius: 9999px; text-transform: uppercase; letter-spacing: 0.06em; white-space: nowrap;
}
.role-admin { background: #fee2e2; color: #991b1b; }
.role-lecturer { background: #dcfce7; color: #166534; }
.role-student { background: #dbeafe; color: #1e40af; }

.avatar-name { margin: 0.5rem 0 0; font-size: 1.15rem; font-weight: 700; color: #0f172a; text-align: center; }
.avatar-email { margin: 0; font-size: 0.82rem; color: #64748b; text-align: center; word-break: break-all; }

.avatar-meta { width: 100%; margin-top: 1rem; display: flex; flex-direction: column; gap: 0.6rem; border-top: 1px solid #f1f5f9; padding-top: 1rem; }
.meta-item { display: flex; flex-direction: column; gap: 2px; }
.meta-label { font-size: 0.7rem; font-weight: 700; color: #94a3b8; text-transform: uppercase; letter-spacing: 0.06em; }
.meta-value { font-size: 0.82rem; color: #334155; font-weight: 500; word-break: break-all; }

/* Details panel */
.details-panel {
  background: #fff; border-radius: 20px;
  border: 1px solid #e2e8f0; padding: 2rem;
  box-shadow: 0 4px 6px -1px rgba(0,0,0,0.05);
}

.section-header { margin-bottom: 1.25rem; }
.section-header h3 { margin: 0; font-size: 1rem; font-weight: 700; color: #0f172a; }
.mt { margin-top: 2rem; }

/* Info grid (view) */
.info-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 1.25rem; }
.info-item { display: flex; flex-direction: column; gap: 4px; padding: 0.85rem 1rem; background: #f8fafc; border-radius: 10px; border: 1px solid #f1f5f9; }
.info-item label { font-size: 0.72rem; font-weight: 700; color: #94a3b8; text-transform: uppercase; letter-spacing: 0.06em; }
.info-item span { font-size: 0.9rem; color: #0f172a; font-weight: 500; }
.mono { font-family: 'Courier New', monospace; font-size: 0.82rem !important; }
.role-text { font-weight: 700; }

/* Change password */
.change-pw-btn {
  margin-top: 1.25rem;
  background: transparent; border: 1.5px solid #cbd5e1; color: #475569;
  padding: 0.55rem 1rem; border-radius: 8px; font-size: 0.85rem; font-weight: 600;
  cursor: pointer; transition: all 0.2s;
}
.change-pw-btn:hover { background: #f8fafc; border-color: #94a3b8; color: #0f172a; }

.password-section { margin-top: 1.25rem; padding: 1.5rem; background: #f8fafc; border-radius: 12px; border: 1px solid #e2e8f0; display: flex; flex-direction: column; gap: 1rem; }

/* Form (edit + password) */
.form-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 1rem; }
.form-group { display: flex; flex-direction: column; gap: 0.4rem; }
.form-group.full { grid-column: 1 / -1; }
.form-group label { font-size: 0.78rem; font-weight: 700; color: #475569; }
.req { color: #ef4444; }
.form-group input {
  padding: 0.65rem 0.9rem; border: 1.5px solid #cbd5e1; border-radius: 8px;
  font-size: 0.9rem; color: #0f172a; background: #fff; transition: border-color 0.2s;
  outline: none;
}
.form-group input:focus { border-color: #6366f1; box-shadow: 0 0 0 3px rgba(99,102,241,0.1); }
.disabled-input { background: #f1f5f9 !important; color: #94a3b8 !important; cursor: not-allowed; }
.field-hint { font-size: 0.72rem; color: #94a3b8; }

/* Input wrap (eye toggle) */
.input-wrap { position: relative; }
.input-wrap input { width: 100%; padding-right: 2.75rem; }
.eye-btn { position: absolute; right: 0.75rem; top: 50%; transform: translateY(-50%); background: none; border: none; cursor: pointer; color: #94a3b8; padding: 0; }
.eye-btn svg { width: 16px; height: 16px; }
.eye-btn:hover { color: #475569; }

.inline-error { background: #fee2e2; border: 1px solid #fecaca; color: #991b1b; padding: 0.6rem 0.9rem; border-radius: 8px; font-size: 0.82rem; font-weight: 500; }

/* Edit actions */
.edit-actions { display: flex; justify-content: flex-end; gap: 0.75rem; margin-top: 1.5rem; }
.cancel-btn {
  background: transparent; border: 1.5px solid #cbd5e1; color: #475569;
  padding: 0.65rem 1.5rem; border-radius: 10px; font-size: 0.875rem; font-weight: 600;
  cursor: pointer; transition: all 0.2s;
}
.cancel-btn:hover { background: #f1f5f9; }

.save-btn, .save-pw-btn {
  display: flex; align-items: center; gap: 0.5rem;
  background: linear-gradient(135deg, #6366f1, #4f46e5); color: #fff; border: none;
  padding: 0.65rem 1.75rem; border-radius: 10px; font-size: 0.875rem; font-weight: 700;
  cursor: pointer; transition: all 0.2s; box-shadow: 0 4px 12px rgba(99,102,241,0.3);
}
.save-btn:hover:not(:disabled), .save-pw-btn:hover:not(:disabled) { transform: translateY(-1px); box-shadow: 0 6px 16px rgba(99,102,241,0.4); }
.save-btn:disabled, .save-pw-btn:disabled { opacity: 0.6; cursor: not-allowed; transform: none; }

.spin { animation: spin 0.8s linear infinite; width: 16px; height: 16px; }
@keyframes spin { to { transform: rotate(360deg); } }

/* Responsive */
@media (max-width: 900px) {
  .profile-grid { grid-template-columns: 1fr; }
  .info-grid { grid-template-columns: 1fr; }
  .form-grid { grid-template-columns: 1fr; }
}
@media (max-width: 600px) {
  .page-header { flex-direction: column; gap: 1rem; }
  .page-title { font-size: 1.4rem; }
}
</style>
