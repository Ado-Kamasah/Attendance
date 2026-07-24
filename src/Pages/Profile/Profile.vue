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
          <div class="meta-item" v-if="profile?.mode">
            <span class="meta-label">Mode</span>
            <span class="meta-value mode-chip" :class="'mode-' + (profile.mode || '').toLowerCase()">{{ profile.mode }}</span>
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
              <label>Study Mode</label>
              <span class="mode-chip" :class="'mode-' + (profile?.mode || '').toLowerCase()">{{ profile?.mode || '—' }}</span>
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
            <div class="form-group full">
              <label>Study Mode</label>
              <div class="mode-toggle-group" id="edit-mode-group">
                <button
                  type="button"
                  class="mode-toggle-btn"
                  :class="{ 'mode-active-regular': editForm.mode === 'Regular' }"
                  @click="editForm.mode = 'Regular'"
                  id="mode-regular-btn"
                >
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
                  Regular
                  <span class="mode-sub">Mon – Fri</span>
                </button>
                <button
                  type="button"
                  class="mode-toggle-btn"
                  :class="{ 'mode-active-weekend': editForm.mode === 'Weekend' }"
                  @click="editForm.mode = 'Weekend'"
                  id="mode-weekend-btn"
                >
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
                  Weekend
                  <span class="mode-sub">Sat – Sun</span>
                </button>
              </div>
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
import { useAuditLogsStore } from '@/stores/auditlogs';
import { supabase } from '@/stores/supabase';

const authStore = useAuthStore();
const auditLogsStore = useAuditLogsStore();
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
const editForm = ref({ name: '', program: '', mode: '' });
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
  editForm.value.name    = profile.value?.name    || '';
  editForm.value.program = profile.value?.program || '';
  editForm.value.mode    = profile.value?.mode    || '';
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
    if (editForm.value.mode) {
      updates.mode = editForm.value.mode;
    }
    const { error } = await supabase
      .from('users')
      .update(updates)
      .eq('id', profile.value.id);
    if (error) throw error;
    await authStore.fetchProfile();
    isEditing.value = false;
    auditLogsStore.logAction({
      action: 'profile_updated',
      details: `Updated profile name to "${updates.name}"${updates.program ? `, program to "${updates.program}"` : ''}${updates.mode ? `, mode to "${updates.mode}"` : ''}`,
      userId:   profile.value.id,
      userRole: profile.value.role,
      userName: profile.value.name,
    });
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
    auditLogsStore.logAction({
      action: 'password_changed',
      details: 'Changed account password',
      userId: profile.value?.id,
      userRole: profile.value?.role,
      userName: profile.value?.name,
    });
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