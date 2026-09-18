<template>
  <div class="space-y-6 w-full max-w-6xl mx-auto">
    <!-- Header with Blueprint Eyebrow -->
    <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-outline/30 dark:border-dark-outline/40">
      <div>
        <div class="flex items-center gap-2 mb-3 text-secondary dark:text-dark-secondary text-xs font-mono uppercase tracking-wider font-semibold">
          <span>INSTITUTIONAL REGISTRATION // IDENTITY CARD</span>
          <svg class="text-secondary/40 w-20 h-2" viewBox="0 0 140 8" fill="none">
            <path d="M0 4H140" stroke="currentColor" stroke-width="1.5" />
          </svg>
        </div>
        <h1 class="text-2xl sm:text-3xl font-extrabold font-display tracking-tight text-foreground dark:text-white">
          My Account <span class="text-secondary dark:text-dark-secondary">Profile</span>
        </h1>
        <p class="text-xs sm:text-sm font-mono text-foreground/60 dark:text-white/70 mt-1">
          Institutional credentials and authentication security
        </p>
      </div>

      <div class="flex items-center gap-3">
        <button 
          v-if="!isEditing"
          @click="startEdit" 
          id="edit-profile-btn"
          class="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-primary dark:bg-dark-secondary text-surface dark:text-primary font-semibold text-xs sm:text-sm shadow-md hover:opacity-90 active:scale-98 transition-all cursor-pointer"
        >
          <Edit3 class="w-4 h-4" />
          <span>Edit Profile</span>
        </button>
      </div>
    </div>

    <!-- Feedback Banners -->
    <transition enter-active-class="transition duration-200 ease-out" enter-from-class="opacity-0 -translate-y-2" enter-to-class="opacity-100 translate-y-0" leave-active-class="transition duration-150 ease-in" leave-from-class="opacity-100 translate-y-0" leave-to-class="opacity-0 -translate-y-2">
      <div v-if="successMsg" class="p-3.5 rounded-xl bg-success/10 border border-success/30 text-success text-xs sm:text-sm font-medium flex items-center gap-2.5">
        <CheckCircle2 class="w-4 h-4 shrink-0" />
        <span>{{ successMsg }}</span>
      </div>
    </transition>

    <transition enter-active-class="transition duration-200 ease-out" enter-from-class="opacity-0 -translate-y-2" enter-to-class="opacity-100 translate-y-0" leave-active-class="transition duration-150 ease-in" leave-from-class="opacity-100 translate-y-0" leave-to-class="opacity-0 -translate-y-2">
      <div v-if="errorMsg" class="p-3.5 rounded-xl bg-error/10 border border-error/30 text-error text-xs sm:text-sm font-medium flex items-center gap-2.5">
        <AlertTriangle class="w-4 h-4 shrink-0" />
        <span>{{ errorMsg }}</span>
      </div>
    </transition>

    <div class="grid grid-cols-1 lg:grid-cols-12 gap-6">
      <!-- Left: Identity Badge Card (4 cols) -->
      <div class="lg:col-span-4 space-y-4">
        <div class="relative bg-surface dark:bg-dark-surface border border-outline/50 dark:border-dark-outline/60 rounded-2xl shadow-xs overflow-hidden p-6 text-center">
          <div class="absolute top-3 left-3 w-4 h-4 border-t-2 border-l-2 border-secondary/30 pointer-events-none"></div>
          <div class="absolute top-3 right-3 w-4 h-4 border-t-2 border-r-2 border-secondary/30 pointer-events-none"></div>

          <!-- Avatar Monogram -->
          <div class="relative inline-block mx-auto mb-4">
            <div 
              class="w-24 h-24 rounded-2xl flex items-center justify-center font-display font-extrabold text-3xl text-white shadow-xl ring-4 ring-surface dark:ring-dark-surface"
              :style="{ backgroundColor: avatarBg }"
            >
              {{ initials }}
            </div>
            <span class="absolute -bottom-1 -right-1 w-4 h-4 rounded-full bg-emerald-500 ring-2 ring-surface dark:ring-dark-surface"></span>
          </div>

          <h2 class="text-base sm:text-lg font-bold font-display text-foreground dark:text-white truncate">
            {{ profile?.name || '—' }}
          </h2>
          <p class="text-xs font-mono text-foreground/50 dark:text-white/65 truncate mt-0.5">
            {{ profile?.email || '—' }}
          </p>

          <div class="mt-3 inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold font-mono uppercase tracking-wider" :class="roleBadgeStyle">
            <Shield class="w-3.5 h-3.5" />
            <span>{{ profile?.role || 'User' }}</span>
          </div>

          <!-- Institutional Metadata List -->
          <div class="mt-6 pt-4 border-t border-outline/30 dark:border-dark-outline/40 text-left space-y-3 text-xs font-mono">
            <div class="flex items-center justify-between">
              <span class="text-foreground/50 dark:text-white/65">User ID</span>
              <span class="font-bold text-foreground dark:text-white">{{ profile?.id_number || '—' }}</span>
            </div>
            <div v-if="profile?.program" class="flex items-center justify-between">
              <span class="text-foreground/50 dark:text-white/65">Program</span>
              <span class="font-bold text-foreground dark:text-white truncate max-w-40 text-right">{{ profile.program }}</span>
            </div>
            <div v-if="profile?.mode" class="flex items-center justify-between">
              <span class="text-foreground/50 dark:text-white/65">Study Mode</span>
              <span class="px-2 py-0.5 rounded text-[10px] font-bold" :class="profile.mode === 'Weekend' ? 'bg-amber-500/15 text-amber-600 dark:text-amber-400' : 'bg-blue-500/15 text-blue-600 dark:text-blue-400'">
                {{ profile.mode }}
              </span>
            </div>
            <div class="flex items-center justify-between">
              <span class="text-foreground/50 dark:text-white/65">Member Since</span>
              <span class="font-bold text-foreground dark:text-white">{{ joinDate }}</span>
            </div>
          </div>
        </div>
      </div>

      <!-- Right: Personal Information & Security (8 cols) -->
      <div class="lg:col-span-8 space-y-6">
        <!-- VIEW MODE -->
        <div v-if="!isEditing" class="space-y-6">
          <!-- Information Card -->
          <div class="relative bg-surface dark:bg-dark-surface border border-outline/50 dark:border-dark-outline/60 rounded-2xl shadow-xs overflow-hidden p-6">
            <div class="absolute top-3 left-3 w-4 h-4 border-t-2 border-l-2 border-secondary/30 pointer-events-none"></div>
            <div class="absolute top-3 right-3 w-4 h-4 border-t-2 border-r-2 border-secondary/30 pointer-events-none"></div>

            <div class="flex items-center gap-2 pb-4 border-b border-outline/30 dark:border-dark-outline/40">
              <User class="w-4 h-4 text-secondary" />
              <h3 class="text-xs font-bold font-display uppercase tracking-wider text-foreground dark:text-white">
                Institutional Records
              </h3>
            </div>

            <div class="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4 text-xs">
              <div class="p-3 rounded-xl bg-muted/20 dark:bg-dark-muted/20 border border-outline/30 dark:border-dark-outline/40">
                <span class="text-[10px] font-mono text-foreground/50 dark:text-white/65 uppercase">Full Name</span>
                <p class="font-bold text-sm text-foreground dark:text-white mt-0.5">{{ profile?.name || '—' }}</p>
              </div>

              <div class="p-3 rounded-xl bg-muted/20 dark:bg-dark-muted/20 border border-outline/30 dark:border-dark-outline/40">
                <span class="text-[10px] font-mono text-foreground/50 dark:text-white/65 uppercase">Email Address</span>
                <p class="font-bold text-sm text-foreground dark:text-white mt-0.5 truncate">{{ profile?.email || '—' }}</p>
              </div>

              <div class="p-3 rounded-xl bg-muted/20 dark:bg-dark-muted/20 border border-outline/30 dark:border-dark-outline/40">
                <span class="text-[10px] font-mono text-foreground/50 dark:text-white/65 uppercase">System Role</span>
                <p class="font-bold text-sm text-secondary dark:text-dark-secondary mt-0.5">{{ profile?.role || '—' }}</p>
              </div>

              <div class="p-3 rounded-xl bg-muted/20 dark:bg-dark-muted/20 border border-outline/30 dark:border-dark-outline/40">
                <span class="text-[10px] font-mono text-foreground/50 dark:text-white/65 uppercase">ID Number</span>
                <p class="font-bold text-sm font-mono text-foreground dark:text-white mt-0.5">{{ profile?.id_number || '—' }}</p>
              </div>

              <div v-if="profile?.program" class="p-3 rounded-xl bg-muted/20 dark:bg-dark-muted/20 border border-outline/30 dark:border-dark-outline/40 sm:col-span-2">
                <span class="text-[10px] font-mono text-foreground/50 dark:text-white/65 uppercase">Academic Program</span>
                <p class="font-bold text-sm text-foreground dark:text-white mt-0.5">{{ profile.program }}</p>
              </div>
            </div>
          </div>

          <!-- Security & Credentials Card -->
          <div class="relative bg-surface dark:bg-dark-surface border border-outline/50 dark:border-dark-outline/60 rounded-2xl shadow-xs overflow-hidden p-6">
            <div class="absolute top-3 left-3 w-4 h-4 border-t-2 border-l-2 border-secondary/30 pointer-events-none"></div>
            <div class="absolute top-3 right-3 w-4 h-4 border-t-2 border-r-2 border-secondary/30 pointer-events-none"></div>

            <div class="flex items-center justify-between pb-4 border-b border-outline/30 dark:border-dark-outline/40">
              <div class="flex items-center gap-2">
                <Lock class="w-4 h-4 text-secondary" />
                <h3 class="text-xs font-bold font-display uppercase tracking-wider text-foreground dark:text-white">
                  Security & Access
                </h3>
              </div>
              <button 
                @click="showPasswordSection = !showPasswordSection"
                id="toggle-password-btn"
                class="text-xs font-semibold text-secondary hover:underline cursor-pointer"
              >
                {{ showPasswordSection ? 'Cancel' : 'Change Password' }}
              </button>
            </div>

            <div class="pt-4">
              <div v-if="!showPasswordSection" class="flex items-center justify-between text-xs">
                <div>
                  <p class="font-medium text-foreground dark:text-white">Password Authentication</p>
                  <p class="text-[10px] font-mono text-foreground/50 dark:text-white/65">Protected via Supabase Auth</p>
                </div>
                <span class="font-mono tracking-widest text-foreground/40">••••••••••••</span>
              </div>

              <!-- Password Update Drawer -->
              <div v-else class="space-y-4 pt-2">
                <div class="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                  <div>
                    <label class="block font-mono text-[11px] text-foreground/70 dark:text-white/80 mb-1">
                      New Password (Min. 8 chars)
                    </label>
                    <div class="relative">
                      <input 
                        :type="showNewPw ? 'text' : 'password'" 
                        v-model="pwForm.newPassword" 
                        placeholder="••••••••" 
                        id="new-password-input"
                        class="w-full px-3.5 py-2 text-xs bg-muted/40 dark:bg-dark-muted/40 border border-outline/40 dark:border-dark-outline/40 focus:border-secondary rounded-xl outline-hidden text-foreground dark:text-white font-mono"
                      />
                      <button 
                        type="button" 
                        @click="showNewPw = !showNewPw"
                        class="absolute right-3 top-1/2 -translate-y-1/2 text-foreground/40 hover:text-foreground cursor-pointer"
                      >
                        <Eye v-if="!showNewPw" class="w-3.5 h-3.5" />
                        <EyeOff v-else class="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  <div>
                    <label class="block font-mono text-[11px] text-foreground/70 dark:text-white/80 mb-1">
                      Confirm New Password
                    </label>
                    <div class="relative">
                      <input 
                        :type="showConfirmPw ? 'text' : 'password'" 
                        v-model="pwForm.confirmPassword" 
                        placeholder="••••••••" 
                        id="confirm-password-input"
                        class="w-full px-3.5 py-2 text-xs bg-muted/40 dark:bg-dark-muted/40 border border-outline/40 dark:border-dark-outline/40 focus:border-secondary rounded-xl outline-hidden text-foreground dark:text-white font-mono"
                      />
                      <button 
                        type="button" 
                        @click="showConfirmPw = !showConfirmPw"
                        class="absolute right-3 top-1/2 -translate-y-1/2 text-foreground/40 hover:text-foreground cursor-pointer"
                      >
                        <Eye v-if="!showConfirmPw" class="w-3.5 h-3.5" />
                        <EyeOff v-else class="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>

                <div v-if="pwError" class="p-2.5 rounded-lg bg-error/10 border border-error/20 text-error text-xs font-mono">
                  {{ pwError }}
                </div>

                <div class="flex justify-end pt-2">
                  <button 
                    @click="changePassword" 
                    :disabled="isSavingPw" 
                    id="save-password-btn"
                    class="px-4 py-2 rounded-xl bg-primary dark:bg-dark-secondary text-surface dark:text-primary font-semibold text-xs shadow-xs hover:opacity-90 transition-opacity flex items-center gap-2 cursor-pointer"
                  >
                    <RefreshCw v-if="isSavingPw" class="w-3.5 h-3.5 animate-spin" />
                    <span>{{ isSavingPw ? 'Updating…' : 'Update Password' }}</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- EDIT MODE -->
        <div v-else class="relative bg-surface dark:bg-dark-surface border border-outline/50 dark:border-dark-outline/60 rounded-2xl shadow-xs overflow-hidden p-6 space-y-5">
          <div class="absolute top-3 left-3 w-4 h-4 border-t-2 border-l-2 border-secondary/30 pointer-events-none"></div>
          <div class="absolute top-3 right-3 w-4 h-4 border-t-2 border-r-2 border-secondary/30 pointer-events-none"></div>

          <div class="flex items-center gap-2 pb-4 border-b border-outline/30 dark:border-dark-outline/40">
            <Edit3 class="w-4 h-4 text-secondary" />
            <h3 class="text-xs font-bold font-display uppercase tracking-wider text-foreground dark:text-white">
              Edit Account Information
            </h3>
          </div>

          <div class="space-y-4 text-xs">
            <div>
              <label for="edit-name" class="block font-mono text-[11px] text-foreground/70 dark:text-white/80 mb-1">
                Full Legal Name <span class="text-error">*</span>
              </label>
              <input 
                id="edit-name" 
                type="text" 
                v-model="editForm.name" 
                placeholder="Enter full name" 
                class="w-full px-3.5 py-2 text-xs bg-muted/40 dark:bg-dark-muted/40 border border-outline/40 dark:border-dark-outline/40 focus:border-secondary rounded-xl outline-hidden text-foreground dark:text-white"
              />
            </div>

            <div>
              <label class="block font-mono text-[11px] text-foreground/70 dark:text-white/80 mb-1">
                Institutional Email (Immutable)
              </label>
              <input 
                type="email" 
                :value="profile?.email" 
                disabled 
                class="w-full px-3.5 py-2 text-xs bg-muted/20 dark:bg-dark-muted/20 border border-outline/30 dark:border-dark-outline/40 rounded-xl text-foreground/50 dark:text-white/65 cursor-not-allowed font-mono"
              />
            </div>

            <div v-if="roleLower === 'student'">
              <label for="edit-program" class="block font-mono text-[11px] text-foreground/70 dark:text-white/80 mb-1">
                Academic Programme
              </label>
              <input 
                id="edit-program" 
                type="text" 
                v-model="editForm.program" 
                placeholder="e.g. B.Sc. Computer Science" 
                class="w-full px-3.5 py-2 text-xs bg-muted/40 dark:bg-dark-muted/40 border border-outline/40 dark:border-dark-outline/40 focus:border-secondary rounded-xl outline-hidden text-foreground dark:text-white"
              />
            </div>

            <div>
              <label class="block font-mono text-[11px] text-foreground/70 dark:text-white/80 mb-1.5">
                Study Track Mode
              </label>
              <div class="grid grid-cols-2 gap-3" id="edit-mode-group">
                <button
                  type="button"
                  @click="editForm.mode = 'Regular'"
                  id="mode-regular-btn"
                  class="p-3 rounded-xl border text-left flex items-center gap-2.5 transition-all cursor-pointer"
                  :class="editForm.mode === 'Regular' ? 'bg-primary/10 dark:bg-primary/20 border-primary text-primary dark:text-dark-primary font-bold shadow-xs' : 'bg-muted/30 dark:bg-dark-muted/30 border-outline/40 text-foreground/60'"
                >
                  <Calendar class="w-4 h-4" />
                  <div>
                    <p class="text-xs font-semibold">Regular Mode</p>
                    <p class="text-[10px] font-mono text-foreground/50">Mon – Fri Schedule</p>
                  </div>
                </button>

                <button
                  type="button"
                  @click="editForm.mode = 'Weekend'"
                  id="mode-weekend-btn"
                  class="p-3 rounded-xl border text-left flex items-center gap-2.5 transition-all cursor-pointer"
                  :class="editForm.mode === 'Weekend' ? 'bg-secondary/15 dark:bg-dark-secondary/20 border-secondary text-secondary dark:text-dark-secondary font-bold shadow-xs' : 'bg-muted/30 dark:bg-dark-muted/30 border-outline/40 text-foreground/60'"
                >
                  <CalendarDays class="w-4 h-4" />
                  <div>
                    <p class="text-xs font-semibold">Weekend Mode</p>
                    <p class="text-[10px] font-mono text-foreground/50">Sat – Sun Sessions</p>
                  </div>
                </button>
              </div>
            </div>
          </div>

          <div v-if="editError" class="p-2.5 rounded-lg bg-error/10 border border-error/20 text-error text-xs font-mono">
            {{ editError }}
          </div>

          <div class="flex items-center justify-end gap-3 pt-3 border-t border-outline/30 dark:border-dark-outline/40">
            <button 
              @click="cancelEdit" 
              id="cancel-edit-btn"
              class="px-4 py-2 rounded-xl bg-muted/60 dark:bg-dark-muted/60 text-foreground/70 hover:text-foreground font-semibold text-xs transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button 
              @click="saveProfile" 
              :disabled="isSaving" 
              id="save-profile-btn"
              class="px-5 py-2 rounded-xl bg-primary dark:bg-dark-secondary text-surface dark:text-primary font-semibold text-xs shadow-md hover:opacity-90 transition-opacity flex items-center gap-2 cursor-pointer"
            >
              <RefreshCw v-if="isSaving" class="w-3.5 h-3.5 animate-spin" />
              <span>{{ isSaving ? 'Saving…' : 'Save Changes' }}</span>
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
import { 
  Edit3, 
  CheckCircle2, 
  AlertTriangle, 
  Shield, 
  User, 
  Lock, 
  Eye, 
  EyeOff, 
  RefreshCw, 
  Calendar, 
  CalendarDays 
} from 'lucide-vue-next';

const authStore = useAuthStore();
const auditLogsStore = useAuditLogsStore();
const { profile } = storeToRefs(authStore);

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

const editForm = ref({ name: '', program: '', mode: '' });
const pwForm = ref({ newPassword: '', confirmPassword: '' });

const roleLower = computed(() => (profile.value?.role || 'student').toLowerCase());

const initials = computed(() => {
  const name = profile.value?.name || '';
  return name.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2) || '?';
});

const avatarBg = computed(() => {
  const map = { admin: '#bc9333', lecturer: '#10b981', student: '#3b82f6', finance: '#0ea5e9' };
  return map[roleLower.value] || '#031c45';
});

const roleBadgeStyle = computed(() => {
  const r = roleLower.value;
  if (r === 'admin' || r === 'super_admin') return 'bg-secondary/15 text-secondary border border-secondary/30';
  if (r === 'lecturer') return 'bg-emerald-500/15 text-emerald-500 border border-emerald-500/30';
  if (r === 'finance')  return 'bg-sky-500/15 text-sky-500 border border-sky-500/30';
  return 'bg-blue-500/15 text-blue-500 border border-blue-500/30';
});

const joinDate = computed(() => {
  const d = profile.value?.created_at || profile.value?.createdAt;
  if (!d) return '—';
  return new Date(d).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
});

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
