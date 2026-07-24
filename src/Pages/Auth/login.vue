<template>
  <div class="min-h-screen w-full flex items-center justify-center font-sans relative bg-cover bg-center overflow-hidden" style="background-image: url('https://images.unsplash.com/photo-1541339907198-e08756dedf3f?ixlib=rb-4.0.3&auto=format&fit=crop&w=1920&q=80');">
    <div class="absolute inset-0 z-[1]" style="background: linear-gradient(135deg, rgba(15,23,42,0.8) 0%, rgba(79,70,229,0.4) 100%);"></div>
    
    <div class="relative z-10 w-full max-w-[480px] px-6 animate-[slideUp_0.6s_cubic-bezier(0.16,1,0.3,1)_forwards]">
      <div class="bg-white/[0.98] backdrop-blur-xl p-10 sm:p-12 rounded-3xl shadow-[0_24px_48px_rgba(0,0,0,0.2)]">
        <div class="mb-10 flex flex-col items-center text-center">
          <div class="mb-6">
            <div class="w-14 h-14 rounded-2xl flex items-center justify-center text-white shadow-[0_8px_16px_rgba(99,102,241,0.3)]" style="background: linear-gradient(135deg, #6366f1, #a855f7)">
              <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" class="w-7 h-7">
                <path d="M12 2L2 7L12 12L22 7L12 2Z" fill="currentColor" />
                <path d="M2 17L12 22L22 17" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" />
                <path d="M2 12L12 17L22 12" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" />
              </svg>
            </div>
          </div>
          <h1 class="text-[2rem] font-extrabold text-slate-900 m-0 mb-2 tracking-tight">Welcome</h1>
          <p class="text-slate-500 text-base m-0 leading-relaxed">Access your portal to manage your academic journey.</p>
        </div>

        <form @submit.prevent="handleLogin" class="flex flex-col gap-5">
          <div class="flex items-center bg-slate-50 border-2 rounded-2xl px-5 py-2 transition-all duration-300 hover:bg-white hover:border-slate-300 relative"
               :class="(isEmailFocused || loginId) ? 'bg-white border-indigo-500 shadow-[0_4px_12px_rgba(99,102,241,0.1)]' : 'border-slate-200'">
            <div class="flex items-center mr-4 transition-colors duration-300" :class="(isEmailFocused || loginId) ? 'text-indigo-500' : 'text-slate-400'">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="w-5 h-5"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path><polyline points="22,6 12,13 2,6"></polyline></svg>
            </div>
            <div class="flex-1 relative flex flex-col justify-center h-12">
              <label for="loginId" class="absolute left-0 text-slate-400 font-medium pointer-events-none transition-all duration-200"
                     :class="(isEmailFocused || loginId) ? 'top-2 text-xs text-indigo-500 font-semibold' : 'top-1/2 -translate-y-1/2 text-base'">ID / Email</label>
              <input type="text" id="loginId" v-model="loginId" @focus="isEmailFocused = true" @blur="isEmailFocused = false" required
                     class="border-none bg-transparent w-full p-0 mt-3.5 text-base font-medium text-slate-900 outline-none" />
            </div>
          </div>

          <div class="flex items-center bg-slate-50 border-2 rounded-2xl px-5 py-2 transition-all duration-300 hover:bg-white hover:border-slate-300 relative"
               :class="(isPasswordFocused || password) ? 'bg-white border-indigo-500 shadow-[0_4px_12px_rgba(99,102,241,0.1)]' : 'border-slate-200'">
            <div class="flex items-center mr-4 transition-colors duration-300" :class="(isPasswordFocused || password) ? 'text-indigo-500' : 'text-slate-400'">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="w-5 h-5"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect><path d="M7 11V7a5 5 0 0 1 10 0v4"></path></svg>
            </div>
            <div class="flex-1 relative flex flex-col justify-center h-12">
              <label for="password" class="absolute left-0 text-slate-400 font-medium pointer-events-none transition-all duration-200"
                     :class="(isPasswordFocused || password) ? 'top-2 text-xs text-indigo-500 font-semibold' : 'top-1/2 -translate-y-1/2 text-base'">Password</label>
              <input :type="showPassword ? 'text' : 'password'" id="password" v-model="password" @focus="isPasswordFocused = true" @blur="isPasswordFocused = false" required
                     class="border-none bg-transparent w-full p-0 mt-3.5 text-base font-medium text-slate-900 outline-none" />
            </div>
            <button type="button" class="bg-transparent border-none p-2 -mr-2 text-slate-400 cursor-pointer transition-colors hover:text-slate-600" @click="showPassword = !showPassword" tabindex="-1">
              <svg v-if="!showPassword" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="w-5 h-5"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path><circle cx="12" cy="12" r="3"></circle></svg>
              <svg v-else viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="w-5 h-5"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path><line x1="1" y1="1" x2="23" y2="23"></line></svg>
            </button>
          </div>

          <div class="flex justify-between items-center mt-1 mb-2">
            <label class="flex items-center gap-2.5 cursor-pointer select-none">
              <input type="checkbox" v-model="rememberMe" class="w-4 h-4 accent-indigo-500">
              <span class="text-[0.9rem] font-medium text-slate-600">Remember me</span>
            </label>
            <a href="#" class="text-[0.9rem] font-semibold text-indigo-500 no-underline transition-colors hover:text-indigo-700" @click.prevent="openForgot">Forgot password?</a>
          </div>

          <div v-if="errorMsg" class="text-red-500 bg-red-50 border-l-4 border-red-500 p-2.5 rounded text-[0.9rem] mt-2.5 mb-1">
            {{ errorMsg }}
            <span v-if="showResend">
              <a href="#" @click.prevent="handleResend" class="inline-block mt-1.5 text-indigo-500 font-semibold underline cursor-pointer">
                {{ resendSent ? 'Confirmation email sent' : 'Resend confirmation email' }}
              </a>
            </span>
          </div>

          <button type="submit" class="relative border-none rounded-2xl p-4 text-[1.05rem] font-bold cursor-pointer transition-all duration-200 flex justify-center items-center mt-2 text-white"
                  :class="isLoading ? 'bg-slate-400 cursor-not-allowed' : 'hover:-translate-y-0.5 hover:shadow-[0_14px_28px_rgba(79,70,229,0.35)]'"
                  :style="!isLoading ? 'background: linear-gradient(135deg,#4f46e5,#3b82f6); box-shadow: 0 10px 20px rgba(79,70,229,0.25)' : ''">
            <span v-if="!isLoading">Secure Sign In</span>
            <svg v-else class="w-6 h-6 animate-spin" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10" stroke-opacity="0.25"></circle><path d="M12 2a10 10 0 0 1 10 10"></path></svg>
          </button>
        </form>

        <div class="mt-10 text-center">
          <p class="text-slate-500 text-[0.95rem] font-medium m-0">Don't have an account? <a href="#" @click.prevent="$emit('switch-to-register')" class="text-slate-900 font-bold ml-1 no-underline transition-colors hover:text-indigo-500 hover:underline">Register now</a></p>
        </div>
      </div>
    </div>

    <!-- Forgot Password Modal -->
    <transition name="modal-fade">
      <div v-if="forgotOpen" class="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[100] flex items-center justify-center p-4" @click.self="closeForgot">
        <div class="bg-white rounded-3xl w-full max-w-[440px] shadow-[0_32px_64px_rgba(0,0,0,0.25)] relative overflow-hidden animate-[modalPop_0.3s_cubic-bezier(0.16,1,0.3,1)]" role="dialog" aria-modal="true">

          <!-- Step 1: Enter email -->
          <div v-if="forgotStep === 1">
            <div class="px-8 pt-8 pb-0 text-center">
              <div class="w-[60px] h-[60px] rounded-[18px] inline-flex items-center justify-center mx-auto bg-indigo-100 text-indigo-600 mb-3"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="w-7 h-7"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg></div>
              <h2 class="text-[1.4rem] font-extrabold text-slate-900 mt-3 mb-2 tracking-tight">Reset your password</h2>
              <p class="text-slate-500 text-[0.9rem] m-0 leading-relaxed">Enter your Southshore email and we'll send a 6-digit reset code.</p>
            </div>
            <div class="px-8 py-6 flex flex-col gap-4">
              <div class="relative bg-slate-50 border-2 rounded-2xl px-4 py-2 transition-all" :class="(fpEmailFocused || fpEmail) ? 'bg-white border-indigo-500 shadow-[0_0_0_3px_rgba(99,102,241,0.1)]' : 'border-slate-200'">
                <label class="block text-[0.72rem] font-bold text-indigo-500 uppercase tracking-wider mb-1">Email address</label>
                <input type="email" v-model="fpEmail" placeholder="you@southshore.edu.gh" @focus="fpEmailFocused = true" @blur="fpEmailFocused = false" @keyup.enter="sendFpOtp" autocomplete="email" class="w-full border-none bg-transparent text-[0.95rem] font-medium text-slate-900 outline-none p-0" />
              </div>
              <p v-if="fpError" class="bg-red-50 border-l-4 border-red-500 text-red-600 text-[0.85rem] font-medium px-3 py-2.5 rounded-r-lg m-0">{{ fpError }}</p>
              <button class="fp-btn" @click="sendFpOtp" :disabled="fpLoading"><svg v-if="fpLoading" class="w-5 h-5 animate-spin" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10" stroke-dasharray="31" stroke-dashoffset="10"/></svg>{{ fpLoading ? 'Sending…' : 'Send reset code' }}</button>
            </div>
          </div>

          <!-- Step 2: Enter OTP -->
          <div v-else-if="forgotStep === 2">
            <div class="px-8 pt-8 pb-0 text-center">
              <div class="w-[60px] h-[60px] rounded-[18px] inline-flex items-center justify-center mx-auto bg-purple-100 text-purple-600 mb-3"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="w-7 h-7"><rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg></div>
              <h2 class="text-[1.4rem] font-extrabold text-slate-900 mt-3 mb-2 tracking-tight">Enter the code</h2>
              <p class="text-slate-500 text-[0.9rem] m-0 leading-relaxed">We sent a 6-digit code to <strong>{{ fpEmail }}</strong>. Enter it below.</p>
            </div>
            <div class="px-8 py-6 flex flex-col gap-4">
              <div class="flex gap-2 justify-center">
                <input v-for="(_, i) in 6" :key="i" type="text" inputmode="numeric" maxlength="1"
                  class="w-12 h-14 text-center text-2xl font-extrabold border-2 rounded-xl bg-slate-50 text-slate-900 outline-none transition-all"
                  :class="fpOtp[i] ? 'border-emerald-400 bg-emerald-50 text-emerald-800' : 'border-slate-300 focus:border-indigo-500 focus:shadow-[0_0_0_3px_rgba(99,102,241,0.12)] focus:bg-white'"
                  v-model="fpOtp[i]" @input="onFpOtpInput(i, $event)" @keydown.backspace="onFpOtpBack(i, $event)" :ref="el => { if (el) fpOtpRefs[i] = el }" />
              </div>
              <p v-if="fpError" class="bg-red-50 border-l-4 border-red-500 text-red-600 text-[0.85rem] font-medium px-3 py-2.5 rounded-r-lg m-0">{{ fpError }}</p>
              <button class="fp-btn" @click="verifyFpOtp" :disabled="fpLoading || fpOtp.join('').length < 6"><svg v-if="fpLoading" class="w-5 h-5 animate-spin" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10" stroke-dasharray="31" stroke-dashoffset="10"/></svg>{{ fpLoading ? 'Verifying…' : 'Verify code' }}</button>
              <div class="flex items-center justify-center gap-2 flex-wrap">
                <span v-if="fpResendCountdown > 0" class="text-[0.82rem] text-slate-400">Resend available in <strong class="text-slate-600">{{ fpResendCountdown }}s</strong></span>
                <button v-else class="bg-transparent border-none text-slate-500 text-[0.875rem] font-semibold cursor-pointer p-0 hover:text-indigo-500 transition-colors" @click="sendFpOtp" :disabled="fpLoading">Resend code</button>
                <span class="text-slate-300 text-[0.85rem]">·</span>
                <button class="bg-transparent border-none text-slate-500 text-[0.875rem] font-semibold cursor-pointer p-0 hover:text-indigo-500 transition-colors" @click="forgotStep = 1; fpError = ''">Change email</button>
              </div>
            </div>
          </div>

          <!-- Step 3: New password -->
          <div v-else-if="forgotStep === 3">
            <div class="px-8 pt-8 pb-0 text-center">
              <div class="w-[60px] h-[60px] rounded-[18px] inline-flex items-center justify-center mx-auto bg-emerald-100 text-emerald-600 mb-3"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="w-7 h-7"><polyline points="20 6 9 17 4 12"/></svg></div>
              <h2 class="text-[1.4rem] font-extrabold text-slate-900 mt-3 mb-2 tracking-tight">Set new password</h2>
              <p class="text-slate-500 text-[0.9rem] m-0 leading-relaxed">Choose a strong password for your account.</p>
            </div>
            <div class="px-8 py-6 flex flex-col gap-4">
              <div class="relative bg-slate-50 border-2 rounded-2xl px-4 py-2 transition-all" :class="(fpPw1Focused || fpNewPw) ? 'bg-white border-indigo-500' : 'border-slate-200'">
                <label class="block text-[0.72rem] font-bold text-indigo-500 uppercase tracking-wider mb-1">New password</label>
                <input :type="fpShowPw ? 'text' : 'password'" v-model="fpNewPw" @focus="fpPw1Focused = true" @blur="fpPw1Focused = false" autocomplete="new-password" class="w-full border-none bg-transparent text-[0.95rem] font-medium text-slate-900 outline-none p-0" />
                <button type="button" class="absolute right-3 top-1/2 -translate-y-1/2 bg-transparent border-none text-slate-400 cursor-pointer p-1 hover:text-slate-600 transition-colors" @click="fpShowPw = !fpShowPw" tabindex="-1"><svg v-if="!fpShowPw" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="w-[18px] h-[18px]"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg><svg v-else viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="w-[18px] h-[18px]"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/><line x1="1" y1="1" x2="23" y2="23"/></svg></button>
              </div>
              <div class="relative bg-slate-50 border-2 rounded-2xl px-4 py-2 transition-all" :class="(fpPw2Focused || fpConfirmPw) ? 'bg-white border-indigo-500' : 'border-slate-200'">
                <label class="block text-[0.72rem] font-bold text-indigo-500 uppercase tracking-wider mb-1">Confirm password</label>
                <input :type="fpShowPw ? 'text' : 'password'" v-model="fpConfirmPw" @focus="fpPw2Focused = true" @blur="fpPw2Focused = false" autocomplete="new-password" class="w-full border-none bg-transparent text-[0.95rem] font-medium text-slate-900 outline-none p-0" />
              </div>
              <p v-if="fpError" class="bg-red-50 border-l-4 border-red-500 text-red-600 text-[0.85rem] font-medium px-3 py-2.5 rounded-r-lg m-0">{{ fpError }}</p>
              <button class="fp-btn" @click="resetFpPassword" :disabled="fpLoading"><svg v-if="fpLoading" class="w-5 h-5 animate-spin" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10" stroke-dasharray="31" stroke-dashoffset="10"/></svg>{{ fpLoading ? 'Updating…' : 'Update password' }}</button>
            </div>
          </div>

          <!-- Step 4: Success -->
          <div v-else-if="forgotStep === 4">
            <div class="px-8 pt-8 pb-0 text-center">
              <div class="w-[72px] h-[72px] rounded-full inline-flex items-center justify-center mx-auto bg-emerald-100 text-emerald-600 mb-3"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" class="w-9 h-9"><polyline points="20 6 9 17 4 12"/></svg></div>
              <h2 class="text-[1.4rem] font-extrabold text-slate-900 mt-3 mb-2 tracking-tight">Password updated!</h2>
              <p class="text-slate-500 text-[0.9rem] m-0 leading-relaxed">Your password has been changed. You can now sign in with your new password.</p>
            </div>
            <div class="px-8 py-6 flex flex-col gap-4">
              <button class="fp-btn" @click="closeForgot">Back to sign in</button>
            </div>
          </div>

          <button class="absolute top-4 right-4 bg-slate-100 border-none rounded-full w-8 h-8 flex items-center justify-center cursor-pointer text-slate-500 transition-all hover:bg-slate-200 hover:text-slate-900" @click="closeForgot" aria-label="Close">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="w-4 h-4"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
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
/* Transition for modal */
.modal-fade-enter-active, .modal-fade-leave-active { transition: opacity 0.25s ease; }
.modal-fade-enter-from, .modal-fade-leave-to { opacity: 0; }

/* Slide-up animation for form card */
@keyframes slideUp {
  from { opacity: 0; transform: translateY(30px); }
  to   { opacity: 1; transform: translateY(0); }
}

/* Modal pop animation */
@keyframes modalPop {
  from { transform: scale(0.92) translateY(20px); opacity: 0; }
  to   { transform: scale(1)    translateY(0);    opacity: 1; }
}

/* fp-btn: gradient CTA used inside modal steps */
.fp-btn {
  width: 100%; padding: 14px;
  background: linear-gradient(135deg, #4f46e5 0%, #3b82f6 100%);
  color: white; border: none; border-radius: 14px;
  font-size: 0.95rem; font-weight: 700; cursor: pointer;
  display: flex; align-items: center; justify-content: center; gap: 8px;
  transition: transform 0.2s, box-shadow 0.2s;
  box-shadow: 0 8px 16px rgba(79,70,229,0.2);
}
.fp-btn:hover:not(:disabled) { transform: translateY(-2px); box-shadow: 0 12px 24px rgba(79,70,229,0.3); }
 .fp-btn:disabled { background: #94a3b8; cursor: not-allowed; box-shadow: none; transform: none; }
</style>