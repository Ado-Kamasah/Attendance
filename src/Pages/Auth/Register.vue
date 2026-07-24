<template>
  <div class="register-container">
    <div class="register-split">
      
      <!-- Left side: Form -->
      <div class="register-form-area">
        <div class="form-wrapper">
          <div class="form-header">
            <h2>Create an account</h2>
            <p>Join Southshore University College attendance system.</p>
          </div>

          <form @submit.prevent="handleRegister" class="auth-form">
            <!-- Full Name -->
            <div class="input-group">
              <label for="fullName">Full Name</label>
              <div class="input-wrapper">
                <svg class="input-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                  <circle cx="12" cy="7" r="4"></circle>
                </svg>
                <input type="text" id="fullName" v-model="form.fullName" placeholder="kwame" required />
              </div>
            </div>

            <!-- Email Setup -->
            <div class="input-group">
              <label for="email">University Email</label>
              <div class="input-wrapper">
                <svg class="input-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path>
                  <polyline points="22,6 12,13 2,6"></polyline>
                </svg>
                <input
                  type="email"
                  id="email"
                  v-model="form.email"
                  placeholder="student@southshore.edu.gh"
                  @blur="validateEmailDomain"
                  required
                />
              </div>
              <p v-if="emailDomainError" class="field-hint">{{ emailDomainError }}</p>
            </div>

            <!-- Role Selection 
            <div class="input-group">
              <label>I am a</label>
              <div class="radio-group">
                <label class="radio-card" :class="{ 'active': form.role === 'student' }">
                  <input type="radio" v-model="form.role" value="student" name="role" />
                  <span class="radio-content">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                      <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"></path>
                      <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"></path>
                    </svg>
                    Student
                  </span>
                </label>
                <label class="radio-card" :class="{ 'active': form.role === 'staff' }">
                  <input type="radio" v-model="form.role" value="staff" name="role" />
                  <span class="radio-content">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                      <rect x="2" y="7" width="20" height="14" rx="2" ry="2"></rect>
                      <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"></path>
                    </svg>
                    Staff / Faculty
                  </span>
                </label>
              </div>
            </div>/ -->

            <!-- ID number -->
            <div class="input-group">
              <label for="idNumber">{{ form.role === 'student' ? 'Student ID' : 'Staff ID' }}</label>
              <div class="input-wrapper">
                <svg class="input-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
                  <line x1="16" y1="2" x2="16" y2="6"></line>
                  <line x1="8" y1="2" x2="8" y2="6"></line>
                  <line x1="3" y1="10" x2="21" y2="10"></line>
                </svg>
                <input type="text" id="idNumber" v-model="form.idNumber" placeholder="ID Number" required />
              </div>
              <p class="field-hint">You can use this ID number to sign in instead of your email.</p>
            </div>

            <!-- Faculty / Program -->
            <div class="input-group">
              <label for="program">Faculty / Program</label>
              <div class="input-wrapper">
                <svg class="input-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <path d="M22 10v6M2 10l10-5 10 5-10 5z"></path>
                  <path d="M6 12v5c3 3 9 3 12 0v-5"></path>
                </svg>
                <select id="program" v-model="form.programId" required>
  <option value="" disabled>Select your faculty/program</option>
  <option v-for="programme in activeProgrammes" :key="programme.id" :value="programme.id">
    {{ programme.name }}
  </option>
</select>
              </div>
            </div>

            <!-- Study Mode -->
            <div class="input-group">
              <label>Study Mode <span class="req">*</span></label>
              <div class="mode-toggle-group">
                <button
                  type="button"
                  class="mode-btn"
                  :class="{ 'mode-btn-active-regular': form.mode === 'Regular' }"
                  @click="form.mode = 'Regular'"
                  id="reg-mode-regular"
                >
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
                  <span class="mode-btn-label">Regular</span>
                  <span class="mode-btn-sub">Mon – Fri</span>
                </button>
                <button
                  type="button"
                  class="mode-btn"
                  :class="{ 'mode-btn-active-weekend': form.mode === 'Weekend' }"
                  @click="form.mode = 'Weekend'"
                  id="reg-mode-weekend"
                >
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
                  <span class="mode-btn-label">Weekend</span>
                  <span class="mode-btn-sub">Sat – Sun</span>
                </button>
              </div>
              <p v-if="modeError" class="field-hint field-hint-error">{{ modeError }}</p>
            </div>

            <!-- Password -->
            <div class="input-group">
              <label for="password">Password</label>
              <div class="input-wrapper">
                <svg class="input-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
                  <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
                </svg>
                <input :type="showPassword ? 'text' : 'password'" id="password" v-model="form.password" placeholder="Create a strong password" required minlength="8" />
                <button type="button" class="password-toggle" @click="showPassword = !showPassword" aria-label="Toggle password visibility">
                  <svg v-if="!showPassword" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
                    <circle cx="12" cy="12" r="3"></circle>
                  </svg>
                  <svg v-else viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path>
                    <line x1="1" y1="1" x2="23" y2="23"></line>
                  </svg>
                </button>
              </div>
            </div>

            <div v-if="errorMsg" class="error-message">
              {{ errorMsg }}
            </div>

            <button type="submit" class="submit-btn" :class="{ 'loading': isLoading }" :disabled="!!emailDomainError">
              <span v-if="!isLoading">Create Account</span>
              <svg v-else class="spinner" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <circle cx="12" cy="12" r="10" stroke-opacity="0.25"></circle>
                <path d="M12 2a10 10 0 0 1 10 10"></path>
              </svg>
            </button>
          </form>

          <p class="login-prompt">
            Already have an account? <a href="#" @click.prevent="$emit('switch-to-login')">Sign in here</a>
          </p>
        </div>
      </div>

      <!-- Right side: Visuals (Reversed from Login) -->
      <div class="register-visual" role="presentation">
        <div class="glass-panel">
          <div class="feature-list">
            <div class="feature-item">
              <div class="feature-icon">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
                  <polyline points="22 4 12 14.01 9 11.01"></polyline>
                </svg>
              </div>
              <div class="feature-text">
                <h3>Instant Attendance</h3>
                <p>Register once and check into classes seamlessly.</p>
              </div>
            </div>
            
            <div class="feature-item">
              <div class="feature-icon">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                  <polyline points="14 2 14 8 20 8"></polyline>
                  <line x1="16" y1="13" x2="8" y2="13"></line>
                  <line x1="16" y1="17" x2="8" y2="17"></line>
                  <polyline points="10 9 9 9 8 9"></polyline>
                </svg>
              </div>
              <div class="feature-text">
                <h3>Track Analytics</h3>
                <p>Keep a real-time eye on your academic progress.</p>
              </div>
            </div>
          </div>
          
          <div class="decorative-circles">
            <div class="circle circle-1"></div>
            <div class="circle circle-2"></div>
          </div>
        </div>
      </div>

    </div>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue';
import { useAuthStore } from '@/stores/authstore';
import { useProgrammesStore } from '@/stores/programmes';
import { storeToRefs } from 'pinia';

const ALLOWED_DOMAIN = 'southshore.edu.gh';

const authStore = useAuthStore();
const programmesStore = useProgrammesStore();
const { activeProgrammes } = storeToRefs(programmesStore);

const showPassword = ref(false);
const isLoading = ref(false);
const errorMsg = ref('');
const emailDomainError = ref('');

onMounted(async () => {
  try {
    await programmesStore.fetchProgrammes({ isActive: true });
  } catch (error) {
    console.error('Failed to load programmes', error);
  }
});

const form = reactive({
  fullName: '',
  email: '',
  role: 'student',
  idNumber: '',
  programId: '',
  mode: '',
  password: '',
});

const modeError = ref('');

const emit = defineEmits(['register-success', 'switch-to-login']);

const validateEmailDomain = () => {
  if (!form.email) {
    emailDomainError.value = '';
    return;
  }
  const domain = form.email.trim().toLowerCase().split('@')[1];
  emailDomainError.value = domain === ALLOWED_DOMAIN
    ? ''
    : `Please use your @${ALLOWED_DOMAIN} email address`;
};

const handleRegister = async () => {
  validateEmailDomain();
  if (emailDomainError.value) return;

  modeError.value = '';
  if (!form.mode) {
    modeError.value = 'Please select a study mode.';
    return;
  }

  isLoading.value = true;
  errorMsg.value = '';

  try {
    const data = await authStore.register(form);

    emit('register-success', {
      email: data.user?.email,
      role: form.role === 'staff' ? 'Lecturer' : 'Student',
      needsEmailConfirmation: !data.session,
    });
  } catch (err) {
    console.error('Registration error:', err);
    errorMsg.value = err.message || 'Registration failed. Please check your inputs.';
  } finally {
    isLoading.value = false;
  }
};
</script>