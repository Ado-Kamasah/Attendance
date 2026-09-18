<template>
  <div class="min-h-screen w-full flex items-center justify-center bg-background dark:bg-dark-background text-foreground dark:text-white relative overflow-hidden font-sans p-4 sm:p-6 lg:p-10">
    
    <!-- Blueprint architectural grid background -->
    <div class="absolute inset-0 bg-[radial-gradient(#c2cde0_1px,transparent_1px)] dark:bg-[radial-gradient(#1e3560_1.2px,transparent_1.2px)] [background-size:28px_28px] opacity-70 pointer-events-none"></div>

    <!-- Ambient glowing accents -->
    <div class="absolute -top-40 -right-40 w-96 h-96 rounded-full bg-secondary/10 dark:bg-dark-secondary/10 blur-3xl pointer-events-none"></div>
    <div class="absolute -bottom-40 -left-40 w-96 h-96 rounded-full bg-primary/10 dark:bg-dark-primary/15 blur-3xl pointer-events-none"></div>

    <!-- Main Dual-Column Architectural Container -->
    <div class="relative z-10 w-full max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-12 bg-surface/90 dark:bg-dark-surface/90 backdrop-blur-xl border border-outline dark:border-dark-outline rounded-3xl shadow-2xl shadow-primary/10 overflow-hidden">
      
      <!-- ── Left Column: Registration Form (7 cols on lg) ── -->
      <div class="lg:col-span-7 p-8 sm:p-12 lg:p-14 flex flex-col justify-center bg-surface dark:bg-dark-surface order-2 lg:order-1">
        
        <div class="max-w-lg w-full mx-auto">
          
          <!-- Section Eyebrow -->
          <div class="flex items-center gap-2 mb-3 text-secondary dark:text-dark-secondary text-xs font-mono uppercase tracking-wider font-semibold">
            <svg class="text-secondary/40 w-10 h-[2px]" viewBox="0 0 40 2">
              <line x1="0" y1="1" x2="40" y2="1" stroke="currentColor" stroke-width="2" />
            </svg>
            <span>REGISTRATION GATEWAY // CAD-ID 02</span>
          </div>

          <!-- Header -->
          <div class="mb-6">
            <h1 class="text-2xl sm:text-3xl font-bold font-display tracking-tight text-foreground dark:text-white mb-1.5">
              Create Your Academic Account
            </h1>
            <p class="text-sm text-foreground/60 dark:text-white/70">
              Join Southshore University College automated attendance & lecture portal.
            </p>
          </div>

          <!-- Registration Form -->
          <form @submit.prevent="handleRegister" class="space-y-4 sm:space-y-4.5">
            
            <!-- Full Name -->
            <div class="space-y-1.5">
              <label for="fullName" class="block text-xs font-semibold uppercase tracking-wider text-foreground/75 dark:text-white/88 font-display">
                Full Name
              </label>
              <div class="relative group">
                <div class="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-foreground/40 dark:text-white/50 group-focus-within:text-primary dark:group-focus-within:text-dark-secondary transition-colors">
                  <User class="w-4 h-4" />
                </div>
                <input
                  type="text"
                  id="fullName"
                  v-model="form.fullName"
                  placeholder="e.g. Kwame Mensah"
                  required
                  class="w-full pl-10 pr-4 py-2.5 bg-background dark:bg-dark-background border border-outline dark:border-dark-outline rounded-xl text-sm text-foreground dark:text-white placeholder-foreground/35 dark:placeholder-dark-foreground/35 focus:outline-none focus:border-primary dark:focus:border-dark-secondary focus:ring-4 focus:ring-primary/10 dark:focus:ring-dark-secondary/10 transition-all shadow-sm"
                />
              </div>
            </div>

            <!-- University Email -->
            <div class="space-y-1.5">
              <div class="flex items-center justify-between">
                <label for="email" class="block text-xs font-semibold uppercase tracking-wider text-foreground/75 dark:text-white/88 font-display">
                  Institutional Email
                </label>
                <span class="text-[11px] font-mono text-secondary dark:text-dark-secondary">@southshore.edu.gh</span>
              </div>
              <div class="relative group">
                <div class="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-foreground/40 dark:text-white/50 group-focus-within:text-primary dark:group-focus-within:text-dark-secondary transition-colors">
                  <Mail class="w-4 h-4" />
                </div>
                <input
                  type="email"
                  id="email"
                  v-model="form.email"
                  @blur="validateEmailDomain"
                  placeholder="student@southshore.edu.gh"
                  required
                  class="w-full pl-10 pr-4 py-2.5 bg-background dark:bg-dark-background border rounded-xl text-sm text-foreground dark:text-white placeholder-foreground/35 dark:placeholder-dark-foreground/35 focus:outline-none focus:ring-4 transition-all shadow-sm"
                  :class="emailDomainError ? 'border-red-500 focus:border-red-500 focus:ring-red-500/10' : 'border-outline dark:border-dark-outline focus:border-primary dark:focus:border-dark-secondary focus:ring-primary/10 dark:focus:ring-dark-secondary/10'"
                />
              </div>
              <p v-if="emailDomainError" class="text-xs text-red-500 flex items-center gap-1.5 mt-1">
                <AlertCircle class="w-3.5 h-3.5 shrink-0" />
                <span>{{ emailDomainError }}</span>
              </p>
            </div>

            <!-- Two Columns on Tablet/Desktop: ID Number & Faculty/Program -->
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
              
              <!-- ID Number -->
              <div class="space-y-1.5">
                <label for="idNumber" class="block text-xs font-semibold uppercase tracking-wider text-foreground/75 dark:text-white/88 font-display">
                  Student / Staff ID
                </label>
                <div class="relative group">
                  <div class="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-foreground/40 dark:text-white/50 group-focus-within:text-primary dark:group-focus-within:text-dark-secondary transition-colors">
                    <IdCard class="w-4 h-4" />
                  </div>
                  <input
                    type="text"
                    id="idNumber"
                    v-model="form.idNumber"
                    placeholder="e.g. SUC2025001"
                    required
                    class="w-full pl-10 pr-4 py-2.5 bg-background dark:bg-dark-background border border-outline dark:border-dark-outline rounded-xl text-sm text-foreground dark:text-white placeholder-foreground/35 dark:placeholder-dark-foreground/35 focus:outline-none focus:border-primary dark:focus:border-dark-secondary focus:ring-4 focus:ring-primary/10 dark:focus:ring-dark-secondary/10 transition-all shadow-sm"
                  />
                </div>
              </div>

              <!-- Faculty / Program -->
              <div class="space-y-1.5">
                <label for="program" class="block text-xs font-semibold uppercase tracking-wider text-foreground/75 dark:text-white/88 font-display">
                  Faculty / Programme
                </label>
                <div class="relative group">
                  <div class="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-foreground/40 dark:text-white/50 group-focus-within:text-primary dark:group-focus-within:text-dark-secondary transition-colors">
                    <GraduationCap class="w-4 h-4" />
                  </div>
                  <select
                    id="program"
                    v-model="form.programId"
                    required
                    class="w-full pl-10 pr-9 py-2.5 bg-background dark:bg-dark-background border border-outline dark:border-dark-outline rounded-xl text-sm text-foreground dark:text-white focus:outline-none focus:border-primary dark:focus:border-dark-secondary focus:ring-4 focus:ring-primary/10 dark:focus:ring-dark-secondary/10 transition-all shadow-sm appearance-none cursor-pointer"
                  >
                    <option value="" disabled selected>Select programme</option>
                    <option v-for="programme in activeProgrammes" :key="programme.id" :value="programme.id">
                      {{ programme.name }}
                    </option>
                  </select>
                  <div class="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none text-foreground/40 dark:text-white/50">
                    <ChevronDown class="w-4 h-4" />
                  </div>
                </div>
              </div>

            </div>

            <!-- Study Mode Selection -->
            <div class="space-y-1.5">
              <label class="block text-xs font-semibold uppercase tracking-wider text-foreground/75 dark:text-white/88 font-display">
                Study Mode <span class="text-secondary dark:text-dark-secondary">*</span>
              </label>
              <div class="grid grid-cols-2 gap-3">
                
                <button
                  type="button"
                  id="reg-mode-regular"
                  @click="form.mode = 'Regular'"
                  class="relative p-3 rounded-xl border text-left flex items-center gap-3 transition-all cursor-pointer focus:outline-none"
                  :class="form.mode === 'Regular'
                    ? 'border-primary bg-primary/5 dark:border-dark-secondary dark:bg-dark-secondary/10 ring-2 ring-primary/20 dark:ring-dark-secondary/30'
                    : 'border-outline dark:border-dark-outline bg-background dark:bg-dark-background hover:border-outline/80'"
                >
                  <div class="w-8 h-8 rounded-lg flex items-center justify-center shrink-0"
                    :class="form.mode === 'Regular' ? 'bg-primary text-white dark:bg-dark-secondary dark:text-dark-background' : 'bg-muted dark:bg-dark-muted text-foreground/60 dark:text-white/70'">
                    <CalendarDays class="w-4 h-4" />
                  </div>
                  <div>
                    <span class="block text-xs font-bold font-display text-foreground dark:text-white">Regular</span>
                    <span class="block text-[10px] text-foreground/50 dark:text-white/65">Mon – Fri (Day)</span>
                  </div>
                </button>

                <button
                  type="button"
                  id="reg-mode-weekend"
                  @click="form.mode = 'Weekend'"
                  class="relative p-3 rounded-xl border text-left flex items-center gap-3 transition-all cursor-pointer focus:outline-none"
                  :class="form.mode === 'Weekend'
                    ? 'border-secondary bg-secondary/10 dark:border-dark-secondary dark:bg-dark-secondary/10 ring-2 ring-secondary/20 dark:ring-dark-secondary/30'
                    : 'border-outline dark:border-dark-outline bg-background dark:bg-dark-background hover:border-outline/80'"
                >
                  <div class="w-8 h-8 rounded-lg flex items-center justify-center shrink-0"
                    :class="form.mode === 'Weekend' ? 'bg-secondary text-white dark:bg-dark-secondary dark:text-dark-background' : 'bg-muted dark:bg-dark-muted text-foreground/60 dark:text-white/70'">
                    <CalendarClock class="w-4 h-4" />
                  </div>
                  <div>
                    <span class="block text-xs font-bold font-display text-foreground dark:text-white">Weekend</span>
                    <span class="block text-[10px] text-foreground/50 dark:text-white/65">Sat – Sun (Modular)</span>
                  </div>
                </button>

              </div>
              <p v-if="modeError" class="text-xs text-red-500 flex items-center gap-1.5 mt-1">
                <AlertCircle class="w-3.5 h-3.5 shrink-0" />
                <span>{{ modeError }}</span>
              </p>
            </div>

            <!-- Password -->
            <div class="space-y-1.5">
              <label for="password" class="block text-xs font-semibold uppercase tracking-wider text-foreground/75 dark:text-white/88 font-display">
                Create Secure Password
              </label>
              <div class="relative group">
                <div class="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-foreground/40 dark:text-white/50 group-focus-within:text-primary dark:group-focus-within:text-dark-secondary transition-colors">
                  <Lock class="w-4 h-4" />
                </div>
                <input
                  :type="showPassword ? 'text' : 'password'"
                  id="password"
                  v-model="form.password"
                  placeholder="Min. 8 characters"
                  required
                  minlength="8"
                  class="w-full pl-10 pr-11 py-2.5 bg-background dark:bg-dark-background border border-outline dark:border-dark-outline rounded-xl text-sm text-foreground dark:text-white placeholder-foreground/35 dark:placeholder-dark-foreground/35 focus:outline-none focus:border-primary dark:focus:border-dark-secondary focus:ring-4 focus:ring-primary/10 dark:focus:ring-dark-secondary/10 transition-all shadow-sm"
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

            <!-- Error Banner -->
            <div
              v-if="errorMsg"
              class="p-3.5 rounded-xl bg-red-500/10 border border-red-500/20 text-red-600 dark:text-red-400 text-xs flex items-center gap-2.5"
            >
              <AlertCircle class="w-4 h-4 shrink-0" />
              <span>{{ errorMsg }}</span>
            </div>

            <!-- Submit Button -->
            <button
              type="submit"
              :disabled="isLoading || !!emailDomainError"
              class="w-full py-3.5 px-6 rounded-xl font-display font-semibold text-sm text-white bg-primary hover:bg-[#052b66] dark:bg-primary dark:hover:bg-[#0b295c] border border-primary/20 shadow-lg shadow-primary/20 hover:shadow-primary/30 active:scale-[0.99] transition-all flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed cursor-pointer pt-3"
            >
              <template v-if="!isLoading">
                <span>Create Student Account</span>
                <ArrowRight class="w-4 h-4 transition-transform group-hover:translate-x-0.5" />
              </template>
              <template v-else>
                <Loader2 class="w-4 h-4 animate-spin" />
                <span>Registering Account...</span>
              </template>
            </button>

          </form>

          <!-- Back to Sign In Link -->
          <div class="mt-6 pt-5 border-t border-outline/50 dark:border-dark-outline/50 text-center">
            <p class="text-xs text-foreground/60 dark:text-white/70">
              Already have an active account?
              <button
                type="button"
                @click="$emit('switch-to-login')"
                class="font-semibold text-secondary hover:text-[#9e7a25] dark:text-dark-secondary dark:hover:text-[#e4bc5e] transition-colors ml-1 focus:outline-none cursor-pointer"
              >
                Sign in here
              </button>
            </p>
          </div>

        </div>

      </div>

      <!-- ── Right Column: Visual Architectural Showcase (5 cols on lg) ── -->
      <div class="relative lg:col-span-5 bg-primary dark:bg-dark-surface text-white p-8 sm:p-10 lg:p-12 flex flex-col justify-between overflow-hidden border-b lg:border-b-0 lg:border-l border-outline/20 dark:border-dark-outline order-1 lg:order-2">
        
        <!-- Decorative corners -->
        <div class="absolute top-3 left-3 w-4 h-4 border-t-2 border-l-2 border-secondary/40 pointer-events-none"></div>
        <div class="absolute top-3 right-3 w-4 h-4 border-t-2 border-r-2 border-secondary/40 pointer-events-none"></div>
        <div class="absolute bottom-3 left-3 w-4 h-4 border-b-2 border-l-2 border-secondary/40 pointer-events-none"></div>
        <div class="absolute bottom-3 right-3 w-4 h-4 border-b-2 border-r-2 border-secondary/40 pointer-events-none"></div>

        <!-- Drafting grid overlay -->
        <div class="absolute inset-0 bg-[linear-gradient(to_right,#ffffff08_1px,transparent_1px),linear-gradient(to_bottom,#ffffff08_1px,transparent_1px)] bg-[size:20px_20px] pointer-events-none"></div>

        <!-- Top branding -->
        <div class="relative z-10">
          <div class="flex items-center gap-2 mb-3 text-secondary dark:text-dark-secondary text-xs font-mono uppercase tracking-wider font-semibold mb-4 text-secondary dark:text-dark-secondary flex items-center gap-2">
            <svg class="w-8 h-[2px] text-secondary dark:text-dark-secondary" viewBox="0 0 32 2">
              <line x1="0" y1="1" x2="32" y2="1" stroke="currentColor" stroke-width="2" />
            </svg>
            <span class="tracking-widest font-semibold text-xs font-display">PORTAL // ADMISSIONS</span>
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
            Seamless Academic Onboarding
          </h3>
          <p class="text-white/75 text-sm leading-relaxed">
            Register once using your official university email to access all departmental lecture schedules, attendance logs, and evaluation forms.
          </p>
        </div>

        <!-- Architectural Blueprint Feature Cards with CAD Hover Brackets -->
        <div class="relative z-10 my-8 space-y-3.5">
          
          <div class="bg-white/5 dark:bg-white/[0.03] border border-white/10 rounded-xl p-4 transition-all hover:bg-white/10">
            <div class="flex items-start gap-3.5">
              <div class="w-9 h-9 rounded-lg bg-secondary/20 text-secondary dark:text-dark-secondary flex items-center justify-center shrink-0 mt-0.5">
                <CheckCircle2 class="w-5 h-5" />
              </div>
              <div>
                <h4 class="text-sm font-semibold font-display text-white mb-0.5">Instant Check-In</h4>
                <p class="text-xs text-white/70 leading-relaxed">
                  Verify presence in lectures via class rep coordination, geofence, and biometric verification.
                </p>
              </div>
            </div>
          </div>

          <div class="bg-white/5 dark:bg-white/[0.03] border border-white/10 rounded-xl p-4 transition-all hover:bg-white/10">
            <div class="flex items-start gap-3.5">
              <div class="w-9 h-9 rounded-lg bg-secondary/20 text-secondary dark:text-dark-secondary flex items-center justify-center shrink-0 mt-0.5">
                <BarChart3 class="w-5 h-5" />
              </div>
              <div>
                <h4 class="text-sm font-semibold font-display text-white mb-0.5">Real-Time Analytics</h4>
                <p class="text-xs text-white/70 leading-relaxed">
                  Monitor semester attendance rates, lecture participation thresholds, and exam eligibility.
                </p>
              </div>
            </div>
          </div>

          <div class="bg-white/5 dark:bg-white/[0.03] border border-white/10 rounded-xl p-4 transition-all hover:bg-white/10">
            <div class="flex items-start gap-3.5">
              <div class="w-9 h-9 rounded-lg bg-secondary/20 text-secondary dark:text-dark-secondary flex items-center justify-center shrink-0 mt-0.5">
                <ShieldCheck class="w-5 h-5" />
              </div>
              <div>
                <h4 class="text-sm font-semibold font-display text-white mb-0.5">Secure Institutional Gateway</h4>
                <p class="text-xs text-white/70 leading-relaxed">
                  Directly synced with official faculty registries and university department archives.
                </p>
              </div>
            </div>
          </div>

        </div>

        <!-- Bottom Technical Badge -->
        <div class="relative z-10 pt-4 border-t border-white/10 flex items-center justify-between text-xs text-white/60">
          <span class="font-mono text-[10px] uppercase">SYS: SUC-AUTH-V2.4</span>
          <span class="inline-flex items-center gap-1.5 text-white/80">
            <span class="w-2 h-2 rounded-full bg-secondary dark:bg-dark-secondary"></span>
            Admissions Open
          </span>
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
import {
  GraduationCap,
  ShieldCheck,
  User,
  Mail,
  IdCard,
  Lock,
  Eye,
  EyeOff,
  CalendarDays,
  CalendarClock,
  ArrowRight,
  Loader2,
  AlertCircle,
  CheckCircle2,
  BarChart3,
  ChevronDown
} from 'lucide-vue-next';

const ALLOWED_DOMAIN = 'southshore.edu.gh';

const authStore = useAuthStore();
const programmesStore = useProgrammesStore();
const { activeProgrammes } = storeToRefs(programmesStore);

const showPassword = ref(false);
const isLoading = ref(false);
const errorMsg = ref('');
const emailDomainError = ref('');
const modeError = ref('');

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

const emit = defineEmits(['register-success', 'switch-to-login']);

const validateEmailDomain = () => {
  if (!form.email) {
    emailDomainError.value = '';
    return;
  }
  const domain = form.email.trim().toLowerCase().split('@')[1];
  emailDomainError.value = domain === ALLOWED_DOMAIN
    ? ''
    : `Please use your official @${ALLOWED_DOMAIN} university address`;
};

const handleRegister = async () => {
  validateEmailDomain();
  if (emailDomainError.value) return;

  modeError.value = '';
  if (!form.mode) {
    modeError.value = 'Please select your study mode (Regular or Weekend).';
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