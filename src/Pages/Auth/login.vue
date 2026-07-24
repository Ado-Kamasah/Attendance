<template>
  <div class="auth-layout">
    <!-- Solid overlay to darken the background image -->
    <div class="bg-overlay"></div>
    
    <div class="form-container">
      <div class="form-card">
        <div class="form-header">
          <div class="logo-wrapper">
            <div class="logo-icon">
              <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M12 2L2 7L12 12L22 7L12 2Z" fill="currentColor" />
                <path d="M2 17L12 22L22 17" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" />
                <path d="M2 12L12 17L22 12" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" />
              </svg>
            </div>
          </div>
          <h1>Welcome</h1>
          <p>Access your portal to manage your academic journey.</p>
        </div>

        <form @submit.prevent="handleLogin" class="auth-form">
          <div class="input-container" :class="{ 'focused': isEmailFocused || loginId }">
            <div class="icon-wrapper">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path>
                <polyline points="22,6 12,13 2,6"></polyline>
              </svg>
            </div>
            <div class="input-content">
              <label for="loginId">ID / Email</label>
              <input 
                type="text" 
                id="loginId" 
                v-model="loginId" 
                @focus="isEmailFocused = true" 
                @blur="isEmailFocused = false" 
                required 
              />
            </div>
          </div>

          <div class="input-container" :class="{ 'focused': isPasswordFocused || password }">
            <div class="icon-wrapper">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
                <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
              </svg>
            </div>
            <div class="input-content">
              <label for="password">Password</label>
              <input 
                :type="showPassword ? 'text' : 'password'" 
                id="password" 
                v-model="password" 
                @focus="isPasswordFocused = true" 
                @blur="isPasswordFocused = false" 
                required 
              />
            </div>
            <button type="button" class="toggle-password" @click="showPassword = !showPassword" tabindex="-1">
              <svg v-if="!showPassword" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
                <circle cx="12" cy="12" r="3"></circle>
              </svg>
              <svg v-else viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path>
                <line x1="1" y1="1" x2="23" y2="23"></line>
              </svg>
            </button>
          </div>

          <div class="form-options">
            <label class="custom-checkbox">
              <input type="checkbox" v-model="rememberMe">
              <span class="checkmark"></span>
              <span class="checkbox-text">Remember me</span>
            </label>
            <a href="#" class="forgot-link" @click.prevent="openForgot">Forgot password?</a>
          </div>

          <div v-if="errorMsg" class="error-message">
            {{ errorMsg }}
            <span v-if="showResend">
              <a href="#" @click.prevent="handleResend" class="resend-link">
                {{ resendSent ? 'Confirmation email sent' : 'Resend confirmation email' }}
              </a>
            </span>
          </div>

          <button type="submit" class="btn-submit" :class="{ 'is-loading': isLoading }">
            <span class="btn-text" v-if="!isLoading">Secure Sign In</span>
            <svg v-else class="spinner" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <circle cx="12" cy="12" r="10" stroke-opacity="0.25" stroke="currentColor"></circle>
              <path d="M12 2a10 10 0 0 1 10 10"></path>
            </svg>
          </button>
        </form>

        <div class="auth-footer">
          <p>Don't have an account? <a href="#" @click.prevent="$emit('switch-to-register')" class="register-link">Register now</a></p>
        </div>
      </div>
    </div>

    <!-- ── Forgot Password Modal ───────────────────────────────── -->
    <transition name="modal-fade">
      <div v-if="forgotOpen" class="modal-backdrop" @click.self="closeForgot">
        <div class="modal-card" role="dialog" aria-modal="true">

          <!-- Step 1: Enter email -->
          <div v-if="forgotStep === 1">
            <div class="modal-header">
              <div class="modal-icon modal-icon--blue">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>
              </div>
              <h2>Reset your password</h2>
              <p>Enter your Southshore email and we'll send a 6-digit reset code.</p>
            </div>
            <div class="modal-body">
              <div class="fp-input-wrap" :class="{ focused: fpEmailFocused || fpEmail }">
                <label>Email address</label>
                <input type="email" v-model="fpEmail" placeholder="you@southshore.edu.gh"
                  @focus="fpEmailFocused = true" @blur="fpEmailFocused = false"
                  @keyup.enter="sendFpOtp" autocomplete="email" />
              </div>
              <p v-if="fpError" class="fp-error">{{ fpError }}</p>
              <button class="fp-btn" @click="sendFpOtp" :disabled="fpLoading">
                <svg v-if="fpLoading" class="spin" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10" stroke-dasharray="31" stroke-dashoffset="10"/></svg>
                {{ fpLoading ? 'Sending…' : 'Send reset code' }}
              </button>
            </div>
          </div>

          <!-- Step 2: Enter OTP -->
          <div v-else-if="forgotStep === 2">
            <div class="modal-header">
              <div class="modal-icon modal-icon--purple">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
              </div>
              <h2>Enter the code</h2>
              <p>We sent a 6-digit code to <strong>{{ fpEmail }}</strong>. Enter it below.</p>
            </div>
            <div class="modal-body">
              <div class="otp-inputs">
                <input v-for="(_, i) in 6" :key="i" type="text" inputmode="numeric" maxlength="1"
                  class="otp-box" :class="{ filled: fpOtp[i] }"
                  v-model="fpOtp[i]"
                  @input="onFpOtpInput(i, $event)"
                  @keydown.backspace="onFpOtpBack(i, $event)"
                  :ref="el => { if (el) fpOtpRefs[i] = el }" />
              </div>
              <p v-if="fpError" class="fp-error">{{ fpError }}</p>
              <button class="fp-btn" @click="verifyFpOtp" :disabled="fpLoading || fpOtp.join('').length < 6">
                <svg v-if="fpLoading" class="spin" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10" stroke-dasharray="31" stroke-dashoffset="10"/></svg>
                {{ fpLoading ? 'Verifying…' : 'Verify code' }}
              </button>
              <div class="fp-resend-row">
                <span v-if="fpResendCountdown > 0" class="fp-countdown">
                  Resend available in <strong>{{ fpResendCountdown }}s</strong>
                </span>
                <button v-else class="fp-link-btn" @click="sendFpOtp" :disabled="fpLoading">
                  Resend code
                </button>
                <span class="fp-dot">·</span>
                <button class="fp-link-btn" @click="forgotStep = 1; fpError = ''">Change email</button>
              </div>
            </div>
          </div>

          <!-- Step 3: New password -->
          <div v-else-if="forgotStep === 3">
            <div class="modal-header">
              <div class="modal-icon modal-icon--green">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="20 6 9 17 4 12"/></svg>
              </div>
              <h2>Set new password</h2>
              <p>Choose a strong password for your account.</p>
            </div>
            <div class="modal-body">
              <div class="fp-input-wrap" :class="{ focused: fpPw1Focused || fpNewPw }">
                <label>New password</label>
                <input :type="fpShowPw ? 'text' : 'password'" v-model="fpNewPw"
                  @focus="fpPw1Focused = true" @blur="fpPw1Focused = false" autocomplete="new-password" />
                <button type="button" class="fp-eye" @click="fpShowPw = !fpShowPw" tabindex="-1">
                  <svg v-if="!fpShowPw" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
                  <svg v-else viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/><line x1="1" y1="1" x2="23" y2="23"/></svg>
                </button>
              </div>
              <div class="fp-input-wrap" :class="{ focused: fpPw2Focused || fpConfirmPw }">
                <label>Confirm password</label>
                <input :type="fpShowPw ? 'text' : 'password'" v-model="fpConfirmPw"
                  @focus="fpPw2Focused = true" @blur="fpPw2Focused = false" autocomplete="new-password" />
              </div>
              <p v-if="fpError" class="fp-error">{{ fpError }}</p>
              <button class="fp-btn" @click="resetFpPassword" :disabled="fpLoading">
                <svg v-if="fpLoading" class="spin" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10" stroke-dasharray="31" stroke-dashoffset="10"/></svg>
                {{ fpLoading ? 'Updating…' : 'Update password' }}
              </button>
            </div>
          </div>

          <!-- Step 4: Success -->
          <div v-else-if="forgotStep === 4">
            <div class="modal-header">
              <div class="modal-icon modal-icon--green modal-icon--lg">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="20 6 9 17 4 12"/></svg>
              </div>
              <h2>Password updated!</h2>
              <p>Your password has been changed. You can now sign in with your new password.</p>
            </div>
            <div class="modal-body">
              <button class="fp-btn" @click="closeForgot">Back to sign in</button>
            </div>
          </div>

          <button class="modal-close" @click="closeForgot" aria-label="Close">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
          </button>
        </div>
      </div>
    </transition>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { useAuthStore } from '@/stores/authstore';

const authStore = useAuthStore();
const router = useRouter();

// Where each detected role lands after a successful login.
// Adjust these paths to match your actual route names/paths.
const ROLE_DASHBOARDS = {
  Admin: '/admin/dashboard',
  Lecturer: '/lecturer/dashboard',
  Student: '/student/dashboard',
};

const loginId = ref('');
const password = ref('');
const showPassword = ref(false);
const rememberMe = ref(false);
const isLoading = ref(false);
const errorMsg = ref('');
const showResend = ref(false);
const resendSent = ref(false);
const unconfirmedEmail = ref('');

const isEmailFocused = ref(false);
const isPasswordFocused = ref(false);

const emit = defineEmits(['login-success', 'switch-to-register']);

const handleLogin = async () => {
  if (!loginId.value || !password.value) return;

  isLoading.value = true;
  errorMsg.value = '';
  showResend.value = false;
  resendSent.value = false;

  try {
    const profile = await authStore.login({
      loginId: loginId.value.trim(),
      password: password.value,
    });

    emit('login-success', {
      loginId: profile.id,
      role: profile.role,
      user: profile,
    });

    // Role comes from the profile row, not user input — route accordingly.
    const destination = ROLE_DASHBOARDS[profile.role] || '/';
    router.push(destination);
  } catch (err) {
    console.error('Login error:', err);
    errorMsg.value = err.message || 'Failed to login. Please check your credentials.';
    if (err.code === 'EMAIL_NOT_CONFIRMED') {
      showResend.value = true;
      unconfirmedEmail.value = err.email;
    }
  } finally {
    isLoading.value = false;
  }
};

const handleResend = async () => {
  try {
    await authStore.resendConfirmation(unconfirmedEmail.value);
    resendSent.value = true;
  } catch (err) {
    console.error('Resend error:', err);
    errorMsg.value = err.message || 'Failed to resend confirmation email.';
  }
};

// ── Forgot-password flow ────────────────────────────────────────────────────
const OTP_API = import.meta.env.VITE_OTP_API_URL || '';

const forgotOpen  = ref(false);
const forgotStep  = ref(1);   // 1=email, 2=otp, 3=newPw, 4=done
const fpLoading   = ref(false);
const fpError     = ref('');

// Step 1
const fpEmail        = ref('');
const fpEmailFocused = ref(false);

// Step 2 — OTP inputs + resend timer
const fpOtp            = ref(['', '', '', '', '', '']);
const fpOtpRefs        = ref([]);
const fpResetToken     = ref('');
const fpResendCountdown = ref(0);
let   fpResendTimer     = null;

// Step 3
const fpNewPw      = ref('');
const fpConfirmPw  = ref('');
const fpShowPw     = ref(false);
const fpPw1Focused = ref(false);
const fpPw2Focused = ref(false);

function startResendCountdown() {
  fpResendCountdown.value = 60;
  clearInterval(fpResendTimer);
  fpResendTimer = setInterval(() => {
    fpResendCountdown.value--;
    if (fpResendCountdown.value <= 0) clearInterval(fpResendTimer);
  }, 1000);
}

function openForgot() {
  forgotStep.value = 1;
  fpEmail.value = '';
  fpOtp.value = ['', '', '', '', '', ''];
  fpNewPw.value = '';
  fpConfirmPw.value = '';
  fpError.value = '';
  fpResetToken.value = '';
  fpResendCountdown.value = 0;
  clearInterval(fpResendTimer);
  forgotOpen.value = true;
}

function closeForgot() {
  forgotOpen.value = false;
  clearInterval(fpResendTimer);
}

// Step 1 — send OTP
async function sendFpOtp() {
  fpError.value = '';
  if (!fpEmail.value.trim()) { fpError.value = 'Please enter your email.'; return; }
  fpLoading.value = true;
  try {
    const res = await fetch(`${OTP_API}/api/auth/forgot-password/send`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: fpEmail.value.trim().toLowerCase() }),
    });
    const data = await res.json();
    if (res.status === 429) throw new Error(data.message || 'Too many requests. Please wait.');
    if (!res.ok && res.status !== 200) throw new Error(data.message || 'Failed to send code.');
    // Always advance — server returns generic 200 even for unknown email (anti-enumeration)
    forgotStep.value = 2;
    fpOtp.value = ['', '', '', '', '', ''];
    startResendCountdown();
  } catch (e) {
    fpError.value = e.message;
  } finally {
    fpLoading.value = false;
  }
}

// Step 2 — OTP digit input helpers
function onFpOtpInput(idx, event) {
  const val = event.target.value.replace(/\D/g, '');
  fpOtp.value[idx] = val ? val[val.length - 1] : '';
  fpError.value = '';
  if (fpOtp.value[idx] && idx < 5) fpOtpRefs.value[idx + 1]?.focus();
}
function onFpOtpBack(idx, event) {
  if (!fpOtp.value[idx] && idx > 0) fpOtpRefs.value[idx - 1]?.focus();
}

// Step 2 — verify OTP
async function verifyFpOtp() {
  fpError.value = '';
  const code = fpOtp.value.join('');
  if (code.length < 6) { fpError.value = 'Enter the full 6-digit code.'; return; }
  fpLoading.value = true;
  try {
    const res = await fetch(`${OTP_API}/api/auth/forgot-password/verify`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: fpEmail.value.trim().toLowerCase(), otp: code }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || 'Invalid or expired code.');
    fpResetToken.value = data.resetToken;
    forgotStep.value = 3;
  } catch (e) {
    fpError.value = e.message;
    fpOtp.value = ['', '', '', '', '', ''];
    fpOtpRefs.value[0]?.focus();
  } finally {
    fpLoading.value = false;
  }
}

// Step 3 — set new password
async function resetFpPassword() {
  fpError.value = '';
  if (fpNewPw.value.length < 8) { fpError.value = 'Password must be at least 8 characters.'; return; }
  if (fpNewPw.value !== fpConfirmPw.value) { fpError.value = 'Passwords do not match.'; return; }
  fpLoading.value = true;
  try {
    const res = await fetch(`${OTP_API}/api/auth/forgot-password/reset`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: fpEmail.value.trim().toLowerCase(),
        resetToken: fpResetToken.value,
        newPassword: fpNewPw.value,
      }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || 'Failed to reset password.');
    forgotStep.value = 4;
  } catch (e) {
    fpError.value = e.message;
  } finally {
    fpLoading.value = false;
  }
}
</script>

<style scoped>
/* Color Palette & Variables */
:root {
  --primary: #4f46e5;
  --primary-hover: #4338ca;
  --secondary: #ec4899;
  --dark: #0f172a;
  --gray-light: #f8fafc;
  --gray: #94a3b8;
  --error: #ef4444;
}

.error-message {
  color: var(--error);
  background: #fef2f2;
  border-left: 4px solid var(--error);
  padding: 10px;
  border-radius: 4px;
  font-size: 0.9rem;
  margin-top: 10px;
  margin-bottom: 5px;
}

.resend-link {
  display: inline-block;
  margin-top: 6px;
  color: #4f46e5;
  font-weight: 600;
  text-decoration: underline;
  cursor: pointer;
}

.auth-layout {
  min-height: 100vh;
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-family: 'Inter', sans-serif;
  position: relative;
  /* Beautiful university building placeholder image */
  background-image: url('https://images.unsplash.com/photo-1541339907198-e08756dedf3f?ixlib=rb-4.0.3&auto=format&fit=crop&w=1920&q=80');
  background-size: cover;
  background-position: center;
  overflow: hidden;
}

.bg-overlay {
  position: absolute;
  top: 0; left: 0; right: 0; bottom: 0;
  background: linear-gradient(135deg, rgba(15, 23, 42, 0.8) 0%, rgba(79, 70, 229, 0.4) 100%);
  z-index: 1;
}

.form-container {
  position: relative;
  z-index: 10;
  width: 100%;
  max-width: 480px;
  padding: 1.5rem;
  animation: slide-up 0.6s cubic-bezier(0.16, 1, 0.3, 1) forwards;
}

@keyframes slide-up {
  from { opacity: 0; transform: translateY(30px); }
  to { opacity: 1; transform: translateY(0); }
}

.form-card {
  background: rgba(255, 255, 255, 0.98);
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
  padding: 3rem;
  border-radius: 24px;
  box-shadow: 0 24px 48px rgba(0, 0, 0, 0.2);
}

@media (max-width: 480px) {
  .form-card {
    padding: 2rem;
  }
}

.form-header {
  margin-bottom: 2.5rem;
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
}

.logo-wrapper {
  margin-bottom: 1.5rem;
}

.logo-icon {
  width: 56px;
  height: 56px;
  background: linear-gradient(135deg, #6366f1, #a855f7);
  border-radius: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  box-shadow: 0 8px 16px rgba(99, 102, 241, 0.3);
}

.logo-icon svg {
  width: 28px;
  height: 28px;
}

.form-header h1 {
  font-size: 2rem;
  font-weight: 800;
  color: #0f172a;
  margin: 0 0 0.5rem 0;
  letter-spacing: -0.03em;
}

.form-header p {
  color: #64748b;
  font-size: 1rem;
  margin: 0;
  line-height: 1.5;
}

.auth-form {
  display: flex;
  flex-direction: column;
  gap: 1.25rem;
}

/* Floating Label Inputs */
.input-container {
  display: flex;
  align-items: center;
  background: #f8fafc;
  border: 2px solid #e2e8f0;
  border-radius: 16px;
  padding: 8px 20px;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  position: relative;
}

.input-container:hover {
  background: white;
  border-color: #cbd5e1;
}

.input-container.focused {
  background: white;
  border-color: #6366f1;
  box-shadow: 0 4px 12px rgba(99, 102, 241, 0.1);
}

.icon-wrapper {
  color: #94a3b8;
  margin-right: 16px;
  display: flex;
  align-items: center;
  transition: color 0.3s;
}

.input-container.focused .icon-wrapper {
  color: #6366f1;
}

.icon-wrapper svg {
  width: 20px;
  height: 20px;
}

.input-content {
  flex: 1;
  position: relative;
  display: flex;
  flex-direction: column;
  justify-content: center;
  height: 48px;
}

.input-content label {
  position: absolute;
  left: 0;
  top: 50%;
  transform: translateY(-50%);
  color: #94a3b8;
  font-size: 1rem;
  font-weight: 500;
  pointer-events: none;
  transition: all 0.2s ease-out;
}

.input-container.focused .input-content label {
  top: 8px;
  font-size: 0.75rem;
  color: #6366f1;
  font-weight: 600;
}

.input-content input {
  border: none;
  background: transparent;
  width: 100%;
  padding: 0;
  margin-top: 14px;
  font-size: 1rem;
  font-weight: 500;
  color: #0f172a;
  outline: none;
}

.input-content select {
  border: none;
  background: transparent;
  width: 100%;
  padding: 0;
  margin-top: 14px;
  font-size: 1rem;
  font-weight: 500;
  color: #0f172a;
  outline: none;
  appearance: none;
  cursor: pointer;
}

.input-content input:-webkit-autofill {
  -webkit-box-shadow: 0 0 0 30px white inset !important;
}

.toggle-password {
  background: none;
  border: none;
  padding: 8px;
  margin-right: -8px;
  color: #94a3b8;
  cursor: pointer;
  transition: color 0.2s;
}

.toggle-password:hover {
  color: #475569;
}

.toggle-password svg {
  width: 20px;
  height: 20px;
}

.form-options {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 0.25rem;
  margin-bottom: 0.5rem;
}

/* Custom Checkbox */
.custom-checkbox {
  display: flex;
  align-items: center;
  gap: 10px;
  cursor: pointer;
  position: relative;
}

.custom-checkbox input {
  position: absolute;
  opacity: 0;
  cursor: pointer;
}

.checkmark {
  width: 20px;
  height: 20px;
  border: 2px solid #cbd5e1;
  border-radius: 6px;
  transition: all 0.2s;
  display: flex;
  align-items: center;
  justify-content: center;
}

.custom-checkbox input:checked ~ .checkmark {
  background: #6366f1;
  border-color: #6366f1;
}

.custom-checkbox input:checked ~ .checkmark::after {
  content: '';
  width: 5px;
  height: 10px;
  border: solid white;
  border-width: 0 2px 2px 0;
  transform: rotate(45deg);
  margin-top: -2px;
}

.checkbox-text {
  font-size: 0.9rem;
  font-weight: 500;
  color: #475569;
}

.forgot-link {
  font-size: 0.9rem;
  font-weight: 600;
  color: #6366f1;
  text-decoration: none;
  transition: color 0.2s;
}

.forgot-link:hover {
  color: #4338ca;
}

/* Submit Button */
.btn-submit {
  position: relative;
  background: linear-gradient(135deg, #4f46e5 0%, #3b82f6 100%);
  color: white;
  border: none;
  border-radius: 16px;
  padding: 16px;
  font-size: 1.05rem;
  font-weight: 700;
  cursor: pointer;
  transition: transform 0.2s, box-shadow 0.2s;
  display: flex;
  justify-content: center;
  align-items: center;
  box-shadow: 0 10px 20px rgba(79, 70, 229, 0.25);
  margin-top: 0.5rem;
}

.btn-submit:hover {
  transform: translateY(-2px);
  box-shadow: 0 14px 28px rgba(79, 70, 229, 0.35);
}

.btn-submit:active {
  transform: translateY(1px);
}

.btn-submit.is-loading {
  background: #94a3b8;
  cursor: not-allowed;
  transform: none;
  box-shadow: none;
}

.spinner {
  width: 24px;
  height: 24px;
  animation: rotate 1s linear infinite;
}

@keyframes rotate {
  100% { transform: rotate(360deg); }
}

/* Footer */
.auth-footer {
  margin-top: 2.5rem;
  text-align: center;
}

.auth-footer p {
  color: #64748b;
  font-size: 0.95rem;
  font-weight: 500;
  margin: 0;
}

.register-link {
  color: #0f172a;
  font-weight: 700;
  text-decoration: none;
  margin-left: 4px;
  transition: color 0.2s;
}

.register-link:hover {
  color: #6366f1;
  text-decoration: underline;
}

/* ── Forgot-password modal ──────────────────────────────────────────────── */
.modal-fade-enter-active,
.modal-fade-leave-active { transition: opacity 0.25s ease; }
.modal-fade-enter-from,
.modal-fade-leave-to { opacity: 0; }

.modal-backdrop {
  position: fixed;
  inset: 0;
  background: rgba(15, 23, 42, 0.6);
  backdrop-filter: blur(4px);
  z-index: 100;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 1rem;
}

.modal-card {
  background: #ffffff;
  border-radius: 24px;
  width: 100%;
  max-width: 440px;
  box-shadow: 0 32px 64px rgba(0, 0, 0, 0.25);
  position: relative;
  overflow: hidden;
  animation: modal-pop 0.3s cubic-bezier(0.16, 1, 0.3, 1);
}
@keyframes modal-pop {
  from { transform: scale(0.92) translateY(20px); opacity: 0; }
  to   { transform: scale(1) translateY(0);       opacity: 1; }
}

.modal-close {
  position: absolute;
  top: 1rem;
  right: 1rem;
  background: #f1f5f9;
  border: none;
  border-radius: 50%;
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  color: #64748b;
  transition: background 0.2s, color 0.2s;
}
.modal-close:hover { background: #e2e8f0; color: #0f172a; }
.modal-close svg   { width: 16px; height: 16px; }

.modal-header {
  padding: 2rem 2rem 0;
  text-align: center;
}
.modal-header h2 {
  margin: 0.75rem 0 0.5rem;
  font-size: 1.4rem;
  font-weight: 800;
  color: #0f172a;
  letter-spacing: -0.02em;
}
.modal-header p {
  color: #64748b;
  font-size: 0.9rem;
  margin: 0;
  line-height: 1.5;
}

.modal-icon {
  width: 60px;
  height: 60px;
  border-radius: 18px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto;
  animation: popIn 0.4s cubic-bezier(0.16, 1, 0.3, 1);
}
@keyframes popIn {
  from { transform: scale(0); opacity: 0; }
  to   { transform: scale(1); opacity: 1; }
}
.modal-icon svg        { width: 28px; height: 28px; }
.modal-icon--blue      { background: #e0e7ff; color: #4f46e5; }
.modal-icon--purple    { background: #f3e8ff; color: #9333ea; }
.modal-icon--green     { background: #dcfce7; color: #16a34a; }
.modal-icon--lg        { width: 72px; height: 72px; border-radius: 50%; }
.modal-icon--lg svg    { width: 36px; height: 36px; }

.modal-body {
  padding: 1.5rem 2rem 2rem;
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

/* Floating-label input inside modal */
.fp-input-wrap {
  position: relative;
  background: #f8fafc;
  border: 2px solid #e2e8f0;
  border-radius: 14px;
  padding: 8px 16px;
  transition: border-color 0.2s, background 0.2s;
}
.fp-input-wrap.focused {
  background: #fff;
  border-color: #6366f1;
  box-shadow: 0 0 0 3px rgba(99,102,241,0.1);
}
.fp-input-wrap label {
  display: block;
  font-size: 0.72rem;
  font-weight: 700;
  color: #6366f1;
  text-transform: uppercase;
  letter-spacing: 0.06em;
  margin-bottom: 4px;
}
.fp-input-wrap input {
  width: 100%;
  border: none;
  background: transparent;
  font-size: 0.95rem;
  font-weight: 500;
  color: #0f172a;
  outline: none;
  padding: 0;
}

/* Show/hide password button inside input */
.fp-eye {
  position: absolute;
  right: 12px;
  top: 50%;
  transform: translateY(-50%);
  background: none;
  border: none;
  color: #94a3b8;
  cursor: pointer;
  padding: 4px;
  display: flex;
  align-items: center;
  transition: color 0.2s;
}
.fp-eye:hover { color: #475569; }
.fp-eye svg   { width: 18px; height: 18px; }

/* OTP digit boxes */
.otp-inputs {
  display: flex;
  gap: 8px;
  justify-content: center;
}
.otp-box {
  width: 48px;
  height: 56px;
  text-align: center;
  font-size: 1.5rem;
  font-weight: 800;
  border: 2px solid #cbd5e1;
  border-radius: 12px;
  background: #f8fafc;
  color: #0f172a;
  outline: none;
  transition: border-color 0.2s, box-shadow 0.2s;
}
.otp-box:focus  { border-color: #6366f1; box-shadow: 0 0 0 3px rgba(99,102,241,0.12); background: #fff; }
.otp-box.filled { border-color: #10b981; background: #ecfdf5; color: #065f46; }

/* Primary button */
.fp-btn {
  width: 100%;
  padding: 14px;
  background: linear-gradient(135deg, #4f46e5 0%, #3b82f6 100%);
  color: white;
  border: none;
  border-radius: 14px;
  font-size: 0.95rem;
  font-weight: 700;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  transition: transform 0.2s, box-shadow 0.2s;
  box-shadow: 0 8px 16px rgba(79,70,229,0.2);
}
.fp-btn:hover:not(:disabled) { transform: translateY(-2px); box-shadow: 0 12px 24px rgba(79,70,229,0.3); }
.fp-btn:disabled { background: #94a3b8; cursor: not-allowed; box-shadow: none; transform: none; }
.fp-btn .spin { width: 20px; height: 20px; animation: rotate 0.8s linear infinite; }

/* Ghost back-link */
.fp-link-btn {
  background: none;
  border: none;
  color: #64748b;
  font-size: 0.875rem;
  font-weight: 600;
  cursor: pointer;
  text-align: center;
  transition: color 0.2s;
  padding: 0;
}
.fp-link-btn:hover { color: #4f46e5; }

/* Error */
.fp-error {
  background: #fef2f2;
  border-left: 4px solid #ef4444;
  color: #dc2626;
  font-size: 0.85rem;
  font-weight: 500;
  padding: 10px 12px;
  border-radius: 0 8px 8px 0;
  margin: 0;
}

/* Resend row */
.fp-resend-row {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  flex-wrap: wrap;
}
.fp-countdown {
  font-size: 0.82rem;
  color: #94a3b8;
}
.fp-countdown strong { color: #475569; }
.fp-dot { color: #cbd5e1; font-size: 0.85rem; }
</style>