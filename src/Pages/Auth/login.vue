<template>
  <div class="min-h-screen w-full flex items-center justify-center bg-background dark:bg-dark-background text-foreground dark:text-white relative overflow-hidden font-sans p-4 sm:p-6 lg:p-10">
    
    <!-- Blueprint architectural grid background -->
    <div class="absolute inset-0 bg-[radial-gradient(#c2cde0_1px,transparent_1px)] dark:bg-[radial-gradient(#1e3560_1.2px,transparent_1.2px)] [background-size:28px_28px] opacity-70 pointer-events-none"></div>

    <!-- Soft ambient lighting effects matching Navy & Gold theme -->
    <div class="absolute -top-40 -left-40 w-96 h-96 rounded-full bg-secondary/10 dark:bg-dark-secondary/10 blur-3xl pointer-events-none"></div>
    <div class="absolute -bottom-40 -right-40 w-96 h-96 rounded-full bg-primary/10 dark:bg-dark-primary/15 blur-3xl pointer-events-none"></div>

    <!-- Main Dual-Column Architectural Container -->
    <div class="relative z-10 w-full max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-12 bg-surface/90 dark:bg-dark-surface/90 backdrop-blur-xl border border-outline dark:border-dark-outline rounded-3xl shadow-2xl shadow-primary/10 overflow-hidden">
      
      <!-- ── Left Column: Blueprint Visual & Academic Showcase (5 cols on lg) ── -->
      <div class="relative lg:col-span-5 bg-primary dark:bg-dark-surface text-white p-8 sm:p-10 lg:p-12 flex flex-col justify-between overflow-hidden border-b lg:border-b-0 lg:border-r border-outline/20 dark:border-dark-outline">
        
        <!-- Decorative corners -->
        <div class="absolute top-3 left-3 w-4 h-4 border-t-2 border-l-2 border-secondary/40 pointer-events-none"></div>
        <div class="absolute top-3 right-3 w-4 h-4 border-t-2 border-r-2 border-secondary/40 pointer-events-none"></div>
        <div class="absolute bottom-3 left-3 w-4 h-4 border-b-2 border-l-2 border-secondary/40 pointer-events-none"></div>
        <div class="absolute bottom-3 right-3 w-4 h-4 border-b-2 border-r-2 border-secondary/40 pointer-events-none"></div>

        <!-- Subtle drafting watermark grid -->
        <div class="absolute inset-0 bg-[linear-gradient(to_right,#ffffff08_1px,transparent_1px),linear-gradient(to_bottom,#ffffff08_1px,transparent_1px)] bg-[size:20px_20px] pointer-events-none"></div>

        <!-- Top branding -->
        <div class="relative z-10">
          <div class="flex items-center gap-2 mb-3 text-secondary dark:text-dark-secondary text-xs font-mono uppercase tracking-wider font-semibold mb-4 text-secondary dark:text-dark-secondary flex items-center gap-2">
            <svg class="w-8 h-[2px] text-secondary dark:text-dark-secondary" viewBox="0 0 32 2">
              <line x1="0" y1="1" x2="32" y2="1" stroke="currentColor" stroke-width="2" />
            </svg>
            <span class="tracking-widest font-semibold text-xs font-display">PORTAL // CAD-ID 01</span>
          </div>

          <div class="flex items-center gap-3.5 mb-6">
            <div class="w-12 h-12 rounded-xl bg-gradient-to-br from-secondary to-[#8c6b1f] dark:from-dark-secondary dark:to-[#8c6b1f] flex items-center justify-center text-white shadow-lg shadow-secondary/20 ring-2 ring-white/15">
              <GraduationCap class="w-7 h-7" />
            </div>
            <div>
              <h2 class="font-display font-bold text-xl sm:text-2xl tracking-tight text-white leading-tight">
                Southshore
              </h2>
              <p class="text-xs uppercase tracking-wider text-secondary dark:text-dark-secondary font-medium">
                University College
              </p>
            </div>
          </div>

          <h3 class="font-display text-2xl sm:text-3xl font-bold tracking-tight text-white mb-3 leading-snug">
            Intelligent Attendance & Academic Management
          </h3>
          <p class="text-white/75 text-sm leading-relaxed">
            Engineered for high precision verification, streamlined student roll-call, and automated real-time faculty tracking.
          </p>
        </div>

        <!-- Middle: technical specifications panel -->
        <div class="relative z-10 my-8 bg-white/5 dark:bg-white/[0.03] border border-white/10 rounded-xl p-4.5 backdrop-blur-md">
          <div class="grid grid-cols-2 gap-3 text-xs">
            <div>
              <span class="text-white/50 block font-mono text-[10px] uppercase tracking-wider mb-0.5">Gateway Status</span>
              <span class="inline-flex items-center gap-1.5 font-medium text-emerald-400">
                <span class="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                Active // 99.9% Up
              </span>
            </div>
            <div>
              <span class="text-white/50 block font-mono text-[10px] uppercase tracking-wider mb-0.5">Security Level</span>
              <span class="inline-flex items-center gap-1.5 text-white/90 font-medium">
                <ShieldCheck class="w-3.5 h-3.5 text-secondary dark:text-dark-secondary" />
                Role-Based AES-256
              </span>
            </div>
            <div>
              <span class="text-white/50 block font-mono text-[10px] uppercase tracking-wider mb-0.5">Academic Session</span>
              <span class="text-white/90 font-medium font-mono">2025/2026</span>
            </div>
            <div>
              <span class="text-white/50 block font-mono text-[10px] uppercase tracking-wider mb-0.5">Verification</span>
              <span class="inline-flex items-center gap-1 text-white/90 font-medium">
                <Sparkles class="w-3.5 h-3.5 text-secondary dark:text-dark-secondary" />
                Instant Synced
              </span>
            </div>
          </div>
        </div>

        <!-- Bottom feature list -->
        <div class="relative z-10 space-y-3">
          <div class="flex items-center gap-3 text-xs text-white/85">
            <div class="w-6 h-6 rounded-md bg-white/10 flex items-center justify-center shrink-0 text-secondary dark:text-dark-secondary">
              <Clock class="w-3.5 h-3.5" />
            </div>
            <span>Instant time-stamped biometric & manual check-in</span>
          </div>
          <div class="flex items-center gap-3 text-xs text-white/85">
            <div class="w-6 h-6 rounded-md bg-white/10 flex items-center justify-center shrink-0 text-secondary dark:text-dark-secondary">
              <Cpu class="w-3.5 h-3.5" />
            </div>
            <span>Cross-device responsive dashboards for all roles</span>
          </div>
        </div>

      </div>

      <!-- ── Right Column: Sign In Form (7 cols on lg) ── -->
      <div class="lg:col-span-7 p-8 sm:p-12 lg:p-14 flex flex-col justify-center bg-surface dark:bg-dark-surface">
        
        <div class="max-w-md w-full mx-auto">
          
          <!-- Section Eyebrow -->
          <div class="flex items-center gap-2 mb-3 text-secondary dark:text-dark-secondary text-xs font-mono uppercase tracking-wider font-semibold">
            <svg class="text-secondary/40 w-10 h-[2px]" viewBox="0 0 40 2">
              <line x1="0" y1="1" x2="40" y2="1" stroke="currentColor" stroke-width="2" />
            </svg>
            <span>SECURITY CREDENTIALS</span>
          </div>

          <!-- Header -->
          <div class="mb-8">
            <h1 class="text-2xl sm:text-3xl font-bold font-display tracking-tight text-foreground dark:text-white mb-2">
              Sign In to Your Account
            </h1>
            <p class="text-sm text-foreground/60 dark:text-white/70">
              Access your institutional attendance records and academic console.
            </p>
          </div>

          <!-- Login Form -->
          <form @submit.prevent="handleLogin" class="space-y-5">
            
            <!-- Login ID / Email -->
            <div class="space-y-1.5">
              <label for="loginId" class="block text-xs font-semibold uppercase tracking-wider text-foreground/75 dark:text-white/88 font-display">
                Institutional ID or Email
              </label>
              <div class="relative group">
                <div class="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-foreground/40 dark:text-white/50 group-focus-within:text-primary dark:group-focus-within:text-dark-secondary transition-colors">
                  <User class="w-4 h-4" />
                </div>
                <input
                  type="text"
                  id="loginId"
                  v-model="loginId"
                  @focus="isEmailFocused = true"
                  @blur="isEmailFocused = false"
                  placeholder="Student ID, Staff ID, or university email"
                  required
                  class="w-full pl-10 pr-4 py-3 bg-background dark:bg-dark-background border border-outline dark:border-dark-outline rounded-xl text-sm text-foreground dark:text-white placeholder-foreground/35 dark:placeholder-dark-foreground/35 focus:outline-none focus:border-primary dark:focus:border-dark-secondary focus:ring-4 focus:ring-primary/10 dark:focus:ring-dark-secondary/10 transition-all shadow-sm"
                />
              </div>
            </div>

            <!-- Password -->
            <div class="space-y-1.5">
              <div class="flex items-center justify-between">
                <label for="password" class="block text-xs font-semibold uppercase tracking-wider text-foreground/75 dark:text-white/88 font-display">
                  Password
                </label>
                <button
                  type="button"
                  @click="openForgot"
                  class="text-xs font-medium text-secondary hover:text-[#9e7a25] dark:text-dark-secondary dark:hover:text-[#e4bc5e] transition-colors focus:outline-none cursor-pointer"
                >
                  Forgot password?
                </button>
              </div>
              <div class="relative group">
                <div class="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-foreground/40 dark:text-white/50 group-focus-within:text-primary dark:group-focus-within:text-dark-secondary transition-colors">
                  <Lock class="w-4 h-4" />
                </div>
                <input
                  :type="showPassword ? 'text' : 'password'"
                  id="password"
                  v-model="password"
                  @focus="isPasswordFocused = true"
                  @blur="isPasswordFocused = false"
                  placeholder="••••••••••••"
                  required
                  class="w-full pl-10 pr-11 py-3 bg-background dark:bg-dark-background border border-outline dark:border-dark-outline rounded-xl text-sm text-foreground dark:text-white placeholder-foreground/35 dark:placeholder-dark-foreground/35 focus:outline-none focus:border-primary dark:focus:border-dark-secondary focus:ring-4 focus:ring-primary/10 dark:focus:ring-dark-secondary/10 transition-all shadow-sm"
                />
                <button
                  type="button"
                  @click="showPassword = !showPassword"
                  tabindex="-1"
                  class="absolute inset-y-0 right-0 pr-3.5 flex items-center text-foreground/40 hover:text-foreground/70 dark:text-white/50 dark:hover:text-dark-foreground/80 transition-colors focus:outline-none cursor-pointer"
                  aria-label="Toggle password visibility"
                >
                  <Eye v-if="!showPassword" class="w-4 h-4" />
                  <EyeOff v-else class="w-4 h-4" />
                </button>
              </div>
            </div>

            <!-- Remember me checkbox -->
            <div class="flex items-center">
              <label class="flex items-center gap-2.5 cursor-pointer text-xs text-foreground/70 dark:text-white/80 select-none">
                <input
                  type="checkbox"
                  v-model="rememberMe"
                  class="w-4 h-4 rounded border-outline dark:border-dark-outline text-primary focus:ring-primary/20 accent-[#031c45] dark:accent-[#bc9333]"
                />
                <span>Remember this device for 30 days</span>
              </label>
            </div>

            <!-- Error Banner -->
            <div
              v-if="errorMsg"
              class="p-3.5 rounded-xl bg-red-500/10 border border-red-500/20 text-red-600 dark:text-red-400 text-xs flex items-start gap-2.5"
            >
              <AlertCircle class="w-4 h-4 shrink-0 mt-0.5" />
              <div class="flex-1">
                <span>{{ errorMsg }}</span>
                <div v-if="showResend" class="mt-2">
                  <button
                    type="button"
                    @click="handleResend"
                    class="font-semibold underline hover:no-underline text-red-700 dark:text-red-300"
                  >
                    {{ resendSent ? 'Confirmation email sent' : 'Resend confirmation email' }}
                  </button>
                </div>
              </div>
            </div>

            <!-- Submit Button -->
            <button
              type="submit"
              :disabled="isLoading"
              class="w-full py-3.5 px-6 rounded-xl font-display font-semibold text-sm text-white bg-primary hover:bg-[#052b66] dark:bg-primary dark:hover:bg-[#0b295c] border border-primary/20 shadow-lg shadow-primary/20 hover:shadow-primary/30 active:scale-[0.99] transition-all flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed cursor-pointer"
            >
              <template v-if="!isLoading">
                <span>Authorize & Sign In</span>
                <ArrowRight class="w-4 h-4 transition-transform group-hover:translate-x-0.5" />
              </template>
              <template v-else>
                <Loader2 class="w-4 h-4 animate-spin" />
                <span>Authenticating...</span>
              </template>
            </button>

          </form>

          <!-- Divider & Register Link -->
          <div class="mt-8 pt-6 border-t border-outline/50 dark:border-dark-outline/50 text-center">
            <p class="text-xs text-foreground/60 dark:text-white/70">
              Don't have an academic account yet?
              <button
                type="button"
                @click="$emit('switch-to-register')"
                class="font-semibold text-secondary hover:text-[#9e7a25] dark:text-dark-secondary dark:hover:text-[#e4bc5e] transition-colors ml-1 focus:outline-none cursor-pointer"
              >
                Register here
              </button>
            </p>
          </div>

        </div>

      </div>

    </div>

    <!-- ── Forgot Password Multi-Step Modal ────────────────────────────── -->
    <transition
      enter-active-class="transition duration-200 ease-out"
      enter-from-class="opacity-0 scale-95"
      enter-to-class="opacity-100 scale-100"
      leave-active-class="transition duration-150 ease-in"
      leave-from-class="opacity-100 scale-100"
      leave-to-class="opacity-0 scale-95"
    >
      <div
        v-if="forgotOpen"
        class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
        @click.self="closeForgot"
      >
        <div
          class="relative w-full max-w-md bg-surface dark:bg-dark-surface border border-outline dark:border-dark-outline rounded-2xl shadow-2xl p-6 sm:p-8 overflow-hidden"
          role="dialog"
          aria-modal="true"
        >
          <!-- Blueprint corner accents -->
          <div class="absolute top-3 left-3 w-4 h-4 border-t-2 border-l-2 border-secondary/40 pointer-events-none"></div>
          <div class="absolute top-3 right-3 w-4 h-4 border-t-2 border-r-2 border-secondary/40 pointer-events-none"></div>
          <div class="absolute bottom-3 left-3 w-4 h-4 border-b-2 border-l-2 border-secondary/40 pointer-events-none"></div>
          <div class="absolute bottom-3 right-3 w-4 h-4 border-b-2 border-r-2 border-secondary/40 pointer-events-none"></div>

          <!-- Close Modal Button -->
          <button
            @click="closeForgot"
            class="absolute top-4 right-4 p-1.5 rounded-lg text-foreground/50 hover:text-foreground dark:text-white/65 dark:hover:text-dark-foreground bg-background dark:bg-dark-background border border-outline/60 dark:border-dark-outline transition-colors focus:outline-none z-10 cursor-pointer"
            aria-label="Close"
          >
            <X class="w-4 h-4" />
          </button>

          <!-- Step 1: Request OTP -->
          <div v-if="forgotStep === 1">
            <div class="mb-5">
              <div class="w-10 h-10 rounded-xl bg-primary/10 dark:bg-dark-primary/20 text-primary dark:text-dark-secondary flex items-center justify-center mb-3">
                <Mail class="w-5 h-5" />
              </div>
              <h2 class="text-xl font-bold font-display tracking-tight text-foreground dark:text-white">
                Reset Portal Password
              </h2>
              <p class="text-xs text-foreground/60 dark:text-white/70 mt-1">
                Enter your registered Southshore email and we'll send a 6-digit verification code.
              </p>
            </div>

            <div class="space-y-4">
              <div class="space-y-1">
                <label class="block text-xs font-semibold uppercase tracking-wider text-foreground/75 dark:text-white/88 font-display">
                  University Email Address
                </label>
                <div class="relative group">
                  <div class="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-foreground/40 dark:text-white/50">
                    <Mail class="w-4 h-4" />
                  </div>
                  <input
                    type="email"
                    v-model="fpEmail"
                    placeholder="you@southshore.edu.gh"
                    @keyup.enter="sendFpOtp"
                    class="w-full pl-10 pr-4 py-2.5 bg-background dark:bg-dark-background border border-outline dark:border-dark-outline rounded-xl text-sm text-foreground dark:text-white focus:outline-none focus:border-primary dark:focus:border-dark-secondary focus:ring-4 focus:ring-primary/10 dark:focus:ring-dark-secondary/10 transition-all"
                  />
                </div>
              </div>

              <div v-if="fpError" class="p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-600 dark:text-red-400 text-xs flex items-center gap-2">
                <AlertCircle class="w-4 h-4 shrink-0" />
                <span>{{ fpError }}</span>
              </div>

              <button
                type="button"
                @click="sendFpOtp"
                :disabled="fpLoading"
                class="w-full py-3 px-4 rounded-xl font-display font-semibold text-xs text-white bg-primary hover:bg-[#052b66] dark:bg-primary dark:hover:bg-[#0b295c] transition-all flex items-center justify-center gap-2 disabled:opacity-60 cursor-pointer"
              >
                <Loader2 v-if="fpLoading" class="w-4 h-4 animate-spin" />
                <span>{{ fpLoading ? 'Transmitting Code...' : 'Send Reset Code' }}</span>
                <ArrowRight v-if="!fpLoading" class="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          <!-- Step 2: Input 6-digit OTP -->
          <div v-else-if="forgotStep === 2">
            <div class="mb-5">
              <div class="w-10 h-10 rounded-xl bg-secondary/15 dark:bg-dark-secondary/20 text-secondary dark:text-dark-secondary flex items-center justify-center mb-3">
                <KeyRound class="w-5 h-5" />
              </div>
              <h2 class="text-xl font-bold font-display tracking-tight text-foreground dark:text-white">
                Enter Verification Code
              </h2>
              <p class="text-xs text-foreground/60 dark:text-white/70 mt-1">
                We sent a 6-digit one-time code to <strong class="text-foreground dark:text-white">{{ fpEmail }}</strong>.
              </p>
            </div>

            <div class="space-y-4">
              <!-- Segmented 6-digit code inputs -->
              <div class="flex items-center justify-between gap-2">
                <input
                  v-for="(_, i) in 6"
                  :key="i"
                  type="text"
                  inputmode="numeric"
                  maxlength="1"
                  v-model="fpOtp[i]"
                  @input="onFpOtpInput(i, $event)"
                  @keydown.backspace="onFpOtpBack(i, $event)"
                  :ref="el => { if (el) fpOtpRefs[i] = el }"
                  class="w-11 h-12 text-center text-lg font-bold font-mono bg-background dark:bg-dark-background border-2 rounded-xl text-foreground dark:text-white transition-all focus:outline-none focus:ring-4 focus:ring-primary/10 dark:focus:ring-dark-secondary/10"
                  :class="fpOtp[i] ? 'border-secondary dark:border-dark-secondary shadow-sm' : 'border-outline dark:border-dark-outline'"
                />
              </div>

              <div v-if="fpError" class="p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-600 dark:text-red-400 text-xs flex items-center gap-2">
                <AlertCircle class="w-4 h-4 shrink-0" />
                <span>{{ fpError }}</span>
              </div>

              <button
                type="button"
                @click="verifyFpOtp"
                :disabled="fpLoading || fpOtp.join('').length < 6"
                class="w-full py-3 px-4 rounded-xl font-display font-semibold text-xs text-white bg-primary hover:bg-[#052b66] dark:bg-primary dark:hover:bg-[#0b295c] transition-all flex items-center justify-center gap-2 disabled:opacity-50 cursor-pointer"
              >
                <Loader2 v-if="fpLoading" class="w-4 h-4 animate-spin" />
                <span>{{ fpLoading ? 'Verifying Code...' : 'Verify Code' }}</span>
                <CheckCircle2 v-if="!fpLoading" class="w-3.5 h-3.5" />
              </button>

              <!-- Resend / Change Email actions -->
              <div class="pt-2 flex items-center justify-between text-xs text-foreground/60 dark:text-white/70 border-t border-outline/50 dark:border-dark-outline/50">
                <span v-if="fpResendCountdown > 0" class="font-mono text-[11px]">
                  Resend in <strong>{{ fpResendCountdown }}s</strong>
                </span>
                <button
                  v-else
                  type="button"
                  @click="sendFpOtp"
                  :disabled="fpLoading"
                  class="flex items-center gap-1 font-semibold text-secondary dark:text-dark-secondary hover:underline cursor-pointer"
                >
                  <RotateCcw class="w-3 h-3" />
                  <span>Resend code</span>
                </button>

                <button
                  type="button"
                  @click="forgotStep = 1; fpError = ''"
                  class="hover:underline text-foreground/75 dark:text-white/88 cursor-pointer"
                >
                  Change email
                </button>
              </div>
            </div>
          </div>

          <!-- Step 3: Set New Password -->
          <div v-else-if="forgotStep === 3">
            <div class="mb-5">
              <div class="w-10 h-10 rounded-xl bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mb-3">
                <Lock class="w-5 h-5" />
              </div>
              <h2 class="text-xl font-bold font-display tracking-tight text-foreground dark:text-white">
                Set New Password
              </h2>
              <p class="text-xs text-foreground/60 dark:text-white/70 mt-1">
                Choose a robust password of at least 8 characters.
              </p>
            </div>

            <div class="space-y-4">
              <div class="space-y-1">
                <label class="block text-xs font-semibold uppercase tracking-wider text-foreground/75 dark:text-white/88 font-display">
                  New Password
                </label>
                <div class="relative group">
                  <div class="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-foreground/40 dark:text-white/50">
                    <Lock class="w-4 h-4" />
                  </div>
                  <input
                    :type="fpShowPw ? 'text' : 'password'"
                    v-model="fpNewPw"
                    placeholder="At least 8 characters"
                    class="w-full pl-10 pr-10 py-2.5 bg-background dark:bg-dark-background border border-outline dark:border-dark-outline rounded-xl text-sm text-foreground dark:text-white focus:outline-none focus:border-primary dark:focus:border-dark-secondary focus:ring-4 focus:ring-primary/10 dark:focus:ring-dark-secondary/10 transition-all"
                  />
                  <button
                    type="button"
                    @click="fpShowPw = !fpShowPw"
                    class="absolute inset-y-0 right-0 pr-3 flex items-center text-foreground/40 hover:text-foreground/70 dark:text-white/50 cursor-pointer"
                  >
                    <Eye v-if="!fpShowPw" class="w-4 h-4" />
                    <EyeOff v-else class="w-4 h-4" />
                  </button>
                </div>
              </div>

              <div class="space-y-1">
                <label class="block text-xs font-semibold uppercase tracking-wider text-foreground/75 dark:text-white/88 font-display">
                  Confirm Password
                </label>
                <div class="relative group">
                  <div class="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-foreground/40 dark:text-white/50">
                    <Lock class="w-4 h-4" />
                  </div>
                  <input
                    :type="fpShowPw ? 'text' : 'password'"
                    v-model="fpConfirmPw"
                    placeholder="Repeat password"
                    class="w-full pl-10 pr-10 py-2.5 bg-background dark:bg-dark-background border border-outline dark:border-dark-outline rounded-xl text-sm text-foreground dark:text-white focus:outline-none focus:border-primary dark:focus:border-dark-secondary focus:ring-4 focus:ring-primary/10 dark:focus:ring-dark-secondary/10 transition-all"
                  />
                </div>
              </div>

              <div v-if="fpError" class="p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-600 dark:text-red-400 text-xs flex items-center gap-2">
                <AlertCircle class="w-4 h-4 shrink-0" />
                <span>{{ fpError }}</span>
              </div>

              <button
                type="button"
                @click="resetFpPassword"
                :disabled="fpLoading"
                class="w-full py-3 px-4 rounded-xl font-display font-semibold text-xs text-white bg-primary hover:bg-[#052b66] dark:bg-primary dark:hover:bg-[#0b295c] transition-all flex items-center justify-center gap-2 disabled:opacity-60 cursor-pointer"
              >
                <Loader2 v-if="fpLoading" class="w-4 h-4 animate-spin" />
                <span>{{ fpLoading ? 'Updating Password...' : 'Save & Update Password' }}</span>
                <CheckCircle2 v-if="!fpLoading" class="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          <!-- Step 4: Success Confirmation -->
          <div v-else-if="forgotStep === 4" class="text-center py-4">
            <div class="w-14 h-14 rounded-2xl bg-emerald-500/15 text-emerald-500 flex items-center justify-center mx-auto mb-4 ring-8 ring-emerald-500/5">
              <CheckCircle2 class="w-8 h-8" />
            </div>
            <h2 class="text-xl font-bold font-display tracking-tight text-foreground dark:text-white mb-2">
              Password Successfully Updated
            </h2>
            <p class="text-xs text-foreground/60 dark:text-white/70 mb-6 max-w-xs mx-auto">
              Your security credentials have been updated. You can now authenticate with your new credentials.
            </p>
            <button
              type="button"
              @click="closeForgot"
              class="w-full py-3 px-4 rounded-xl font-display font-semibold text-xs text-white bg-primary hover:bg-[#052b66] dark:bg-primary dark:hover:bg-[#0b295c] transition-all cursor-pointer"
            >
              Proceed to Sign In
            </button>
          </div>

        </div>
      </div>
    </transition>

  </div>
</template>

<script setup>
import { ref } from 'vue';
import { useAuthStore } from '@/stores/authstore';
import {
  GraduationCap,
  ShieldCheck,
  Sparkles,
  Clock,
  Cpu,
  User,
  Lock,
  Eye,
  EyeOff,
  ArrowRight,
  Loader2,
  AlertCircle,
  Mail,
  KeyRound,
  RotateCcw,
  CheckCircle2,
  X
} from 'lucide-vue-next';

const authStore = useAuthStore();

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

    // Emit to App.vue which handles navigation via redirectForRole()
    emit('login-success', {
      loginId: profile.id,
      role: profile.role,
      user: profile,
    });
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
const fpEmail = ref('');

// Step 2 — OTP inputs + resend timer
const fpOtp             = ref(['', '', '', '', '', '']);
const fpOtpRefs         = ref([]);
const fpResetToken      = ref('');
const fpResendCountdown = ref(0);
let   fpResendTimer     = null;

// Step 3
const fpNewPw      = ref('');
const fpConfirmPw  = ref('');
const fpShowPw     = ref(false);

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
    // Advance to step 2
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