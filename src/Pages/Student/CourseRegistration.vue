<template>
  <div class="space-y-6 w-full max-w-7xl mx-auto">
    <!-- Header with Blueprint Eyebrow -->
    <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-outline/30 dark:border-dark-outline/40">
      <div>
        <div class="flex items-center gap-2 mb-3 text-secondary dark:text-dark-secondary text-xs font-mono uppercase tracking-wider font-semibold">
          <span>COURSE ENROLLMENT // CURRICULUM CATALOGUE</span>
          <svg class="text-secondary/40 w-20 h-2" viewBox="0 0 140 8" fill="none">
            <path d="M0 4H140" stroke="currentColor" stroke-width="1.5" />
          </svg>
        </div>
        <h1 class="text-2xl sm:text-3xl font-extrabold font-display tracking-tight text-foreground dark:text-white">
          Course <span class="text-secondary dark:text-dark-secondary">Registration</span>
        </h1>
        <p class="text-xs sm:text-sm font-mono text-foreground/60 dark:text-white/70 mt-1">
          Select and confirm accredited modules for the active semester &bull; {{ currentUserProgram }}
        </p>
      </div>

      <div class="flex items-center gap-3">
        <!-- Dynamic enrollment status badge -->
        <span v-if="registrationOpen" class="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold font-mono bg-emerald-500/10 text-emerald-500 border border-emerald-500/30">
          <span class="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
          Enrollment Open
        </span>
        <span v-else class="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold font-mono bg-rose-500/10 text-rose-500 border border-rose-500/30">
          <Lock class="w-3 h-3" />
          Registration Closed
        </span>
      </div>
    </div>

    <!-- ============================================================ -->
    <!-- REGISTRATION WINDOW TIMELINE BANNER                          -->
    <!-- ============================================================ -->
    <div
      :class="[
        'relative rounded-2xl border p-5 overflow-hidden',
        registrationOpen
          ? 'bg-gradient-to-r from-emerald-50/80 to-teal-50/60 dark:from-emerald-950/40 dark:to-teal-950/30 border-emerald-200 dark:border-emerald-800/60'
          : 'bg-gradient-to-r from-rose-50/80 to-orange-50/60 dark:from-rose-950/40 dark:to-orange-950/30 border-rose-200 dark:border-rose-800/60'
      ]"
    >
      <!-- Blueprint corner marks -->
      <div class="absolute top-2 left-2 w-3 h-3 border-t-2 border-l-2 border-current opacity-20 pointer-events-none"></div>
      <div class="absolute top-2 right-2 w-3 h-3 border-t-2 border-r-2 border-current opacity-20 pointer-events-none"></div>

      <!-- No active semester -->
      <div v-if="!activeSemester && !semesterLoading" class="flex items-center gap-3">
        <div class="w-10 h-10 rounded-xl bg-slate-200 dark:bg-dark-muted text-slate-500 flex items-center justify-center shrink-0">
          <CalendarOff class="w-5 h-5" />
        </div>
        <div>
          <p class="text-sm font-bold text-slate-700 dark:text-white">No Active Semester Configured</p>
          <p class="text-xs font-mono text-slate-500 dark:text-white/70 mt-0.5">
            Course registration is unavailable until an administrator activates a semester. Contact your academic office.
          </p>
        </div>
      </div>

      <!-- Loading semester -->
      <div v-else-if="semesterLoading" class="flex items-center gap-3">
        <Loader2 class="w-5 h-5 animate-spin text-slate-400" />
        <span class="text-xs font-mono text-slate-400">Loading semester schedule...</span>
      </div>

      <!-- Active semester timeline -->
      <div v-else class="space-y-4">
        <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div class="flex items-center gap-3">
            <div :class="['w-10 h-10 rounded-xl flex items-center justify-center shrink-0',
              registrationOpen
                ? 'bg-emerald-100 dark:bg-emerald-900/60 text-emerald-600 dark:text-emerald-400'
                : 'bg-rose-100 dark:bg-rose-900/60 text-rose-600 dark:text-rose-400'
            ]">
              <CalendarClock class="w-5 h-5" />
            </div>
            <div>
              <div class="flex items-center gap-2">
                <span class="text-[10px] font-mono uppercase tracking-wider font-bold"
                  :class="registrationOpen ? 'text-emerald-700 dark:text-emerald-400' : 'text-rose-700 dark:text-rose-400'"
                >
                  {{ registrationOpen ? '⏳ REGISTRATION WINDOW ACTIVE' : '🔒 REGISTRATION WINDOW CLOSED' }}
                </span>
              </div>
              <p class="text-sm font-bold text-slate-900 dark:text-white mt-0.5">
                {{ activeSemester.name }}
              </p>
              <p class="text-xs font-mono text-slate-500 dark:text-white/70">
                Semester Start: {{ formatDate(activeSemester.startDate) }} &bull; Registration Deadline: {{ formatDate(registrationDeadline) }}
              </p>
            </div>
          </div>

          <!-- Countdown pill or locked badge -->
          <div v-if="registrationOpen" class="flex flex-col items-end gap-1 shrink-0">
            <div class="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-emerald-100 dark:bg-emerald-900/60 border border-emerald-300 dark:border-emerald-700">
              <Timer class="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
              <span class="font-mono font-bold text-sm text-emerald-800 dark:text-emerald-200">
                {{ timeRemainingLabel }}
              </span>
            </div>
            <span class="text-[10px] font-mono text-slate-400">remaining to register</span>
          </div>

          <div v-else class="flex flex-col items-end gap-1 shrink-0">
            <div class="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-rose-100 dark:bg-rose-900/60 border border-rose-300 dark:border-rose-700">
              <Lock class="w-4 h-4 text-rose-600 dark:text-rose-400" />
              <span class="font-mono font-bold text-sm text-rose-800 dark:text-rose-200">Window Expired</span>
            </div>
            <span class="text-[10px] font-mono text-slate-400">
              Closed {{ daysOverDeadline }} day{{ daysOverDeadline === 1 ? '' : 's' }} ago
            </span>
          </div>
        </div>

        <!-- Progress timeline bar (14-day window) -->
        <div class="space-y-1.5">
          <div class="flex items-center justify-between text-[11px] font-mono text-slate-500 dark:text-white/60">
            <span>Day 1 · Semester Start</span>
            <span class="font-semibold" :class="registrationOpen ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-500'">
              Day 14 · Registration Closes
            </span>
          </div>

          <!-- Track -->
          <div class="relative h-3 w-full bg-slate-200/80 dark:bg-dark-muted/60 rounded-full overflow-hidden">
            <!-- Fill bar -->
            <div
              class="absolute left-0 top-0 h-full rounded-full transition-all duration-700"
              :class="registrationOpen ? 'bg-gradient-to-r from-emerald-400 to-teal-500' : 'bg-gradient-to-r from-rose-400 to-rose-600'"
              :style="{ width: `${Math.min(100, windowProgressPercent)}%` }"
            ></div>

            <!-- Day 14 marker line -->
            <div class="absolute top-0 h-full border-r-2 border-white/60 dark:border-white/30"
              style="left: 100%"></div>
          </div>

          <!-- Milestone ticks -->
          <div class="relative flex justify-between">
            <div v-for="day in [1, 3, 7, 10, 14]" :key="day"
              class="flex flex-col items-center gap-0.5"
              :style="{ position: 'absolute', left: `${((day - 1) / 13) * 100}%`, transform: 'translateX(-50%)' }"
            >
              <div :class="['w-1 h-1.5 rounded-sm',
                daysPastSemesterStart >= day
                  ? (registrationOpen ? 'bg-emerald-500' : 'bg-rose-500')
                  : 'bg-slate-300 dark:bg-slate-600'
              ]"></div>
              <span class="text-[9px] font-mono text-slate-400 mt-0.5">{{ day }}</span>
            </div>
          </div>
        </div>

        <!-- Closed: Admin bypass notice -->
        <div v-if="!registrationOpen" class="mt-1 p-3 rounded-xl bg-rose-100/80 dark:bg-rose-950/50 border border-rose-200 dark:border-rose-800/60 flex items-start gap-2.5">
          <ShieldAlert class="w-4 h-4 text-rose-600 dark:text-rose-400 shrink-0 mt-0.5" />
          <div>
            <p class="text-xs font-bold text-rose-800 dark:text-rose-300">Self-registration is no longer available</p>
            <p class="text-[11px] font-mono text-rose-700 dark:text-rose-400 mt-0.5">
              The 2-week enrollment window has passed. To register late or make changes, please contact your Academic Office or Registry — only administrators can process course registrations on your behalf at this stage.
            </p>
          </div>
        </div>
      </div>
    </div>

    <!-- ============================================================ -->
    <!-- LOCKED STATE: Full-page overlay when registration is closed  -->
    <!-- ============================================================ -->
    <div v-if="!registrationOpen && activeSemester" class="relative rounded-2xl border border-rose-200/80 dark:border-rose-800/50 bg-white dark:bg-dark-surface overflow-hidden">
      <!-- Subtle grid pattern -->
      <div class="absolute inset-0 opacity-[0.03] dark:opacity-[0.05]"
        style="background-image: repeating-linear-gradient(0deg, #000 0, #000 1px, transparent 1px, transparent 40px), repeating-linear-gradient(90deg, #000 0, #000 1px, transparent 1px, transparent 40px);">
      </div>

      <div class="relative z-10 flex flex-col items-center justify-center py-20 px-6 text-center">
        <!-- Lock icon -->
        <div class="w-20 h-20 rounded-3xl bg-rose-100 dark:bg-rose-950/60 border-2 border-rose-200 dark:border-rose-800 flex items-center justify-center mb-6 shadow-md">
          <Lock class="w-10 h-10 text-rose-500" />
        </div>

        <div class="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-mono font-bold bg-rose-100 dark:bg-rose-900/50 text-rose-700 dark:text-rose-300 border border-rose-300 dark:border-rose-700 mb-4">
          ENROLLMENT PERIOD CLOSED
        </div>

        <h2 class="text-2xl font-display font-extrabold text-slate-900 dark:text-white mb-2">
          Registration Window Expired
        </h2>
        <p class="text-sm font-mono text-slate-500 dark:text-white/70 max-w-md mb-3">
          The 2-week self-registration period for <strong class="text-slate-700 dark:text-slate-200">{{ activeSemester?.name }}</strong> ended on <strong class="text-rose-600 dark:text-rose-400">{{ formatDate(registrationDeadline) }}</strong>.
        </p>
        <p class="text-xs font-mono text-slate-400 dark:text-white/50 max-w-sm">
          To enroll in courses after the deadline, you must visit the Academic Registry or Student Services desk and request admin-assisted course registration.
        </p>

        <!-- Show currently enrolled courses if any -->
        <div v-if="enrollments.length > 0" class="mt-8 w-full max-w-md">
          <div class="p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/60 text-left">
            <div class="flex items-center gap-2 mb-3">
              <CheckCircle2 class="w-4 h-4 text-emerald-600 shrink-0" />
              <span class="text-xs font-bold font-mono text-emerald-800 dark:text-emerald-300 uppercase tracking-wider">
                Your Registered Modules ({{ enrollments.length }})
              </span>
            </div>
            <div class="space-y-2">
              <div
                v-for="enrollment in enrollmentsWithDetails"
                :key="enrollment.id"
                class="flex items-center justify-between gap-2 p-2 rounded-lg bg-white dark:bg-dark-surface border border-emerald-100 dark:border-emerald-900/40"
              >
                <div class="min-w-0">
                  <p class="text-xs font-bold text-slate-900 dark:text-white truncate">
                    {{ enrollment.code }} &bull; {{ enrollment.name }}
                  </p>
                  <span class="text-[10px] font-mono text-slate-400">{{ enrollment.credits }} Credits</span>
                </div>
                <span class="shrink-0 text-[10px] font-mono px-1.5 py-0.5 rounded bg-emerald-100 dark:bg-emerald-900/60 text-emerald-700 dark:text-emerald-300 font-bold">✓</span>
              </div>
            </div>
          </div>
        </div>

        <!-- Contact info CTA -->
        <div class="mt-6 flex flex-wrap items-center justify-center gap-3">
          <div class="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-100 dark:bg-dark-muted border border-slate-200 dark:border-dark-outline text-xs font-semibold text-slate-700 dark:text-white/90">
            <PhoneCall class="w-3.5 h-3.5 text-secondary" />
            Contact Academic Registry
          </div>
          <div class="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-100 dark:bg-dark-muted border border-slate-200 dark:border-dark-outline text-xs font-semibold text-slate-700 dark:text-white/90">
            <Mail class="w-3.5 h-3.5 text-secondary" />
            registry@southshore.edu.gh
          </div>
        </div>
      </div>
    </div>

    <!-- ============================================================ -->
    <!-- OPEN STATE: Normal registration UI                           -->
    <!-- ============================================================ -->
    <div v-if="registrationOpen || !activeSemester">
      <!-- Notification Toast Banners -->
      <transition enter-active-class="transition duration-200 ease-out" enter-from-class="opacity-0 -translate-y-2" enter-to-class="opacity-100 translate-y-0" leave-active-class="transition duration-150 ease-in" leave-from-class="opacity-100 translate-y-0" leave-to-class="opacity-0 -translate-y-2">
        <div v-if="feedbackMsg" class="p-3.5 rounded-xl border text-xs sm:text-sm font-medium flex items-center justify-between gap-2.5 mb-6" :class="feedbackIsError ? 'bg-error/10 border-error/30 text-error' : 'bg-success/10 border-success/30 text-success'">
          <div class="flex items-center gap-2">
            <component :is="feedbackIsError ? AlertTriangle : CheckCircle2" class="w-4 h-4 shrink-0" />
            <span>{{ feedbackMsg }}</span>
          </div>
          <button @click="feedbackMsg = ''" class="cursor-pointer font-bold">&times;</button>
        </div>
      </transition>

      <div class="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <!-- Left Column: Available Courses (8 cols) -->
        <div class="lg:col-span-8 space-y-4">
          <div class="relative bg-surface dark:bg-dark-surface border border-outline/50 dark:border-dark-outline/60 rounded-2xl shadow-xs overflow-hidden p-5">
            <div class="absolute top-3 left-3 w-4 h-4 border-t-2 border-l-2 border-secondary/30 pointer-events-none"></div>
            <div class="absolute top-3 right-3 w-4 h-4 border-t-2 border-r-2 border-secondary/30 pointer-events-none"></div>

            <!-- Filter / Search Controls -->
            <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-outline/30 dark:border-dark-outline/40">
              <div class="flex items-center gap-2">
                <BookOpen class="w-4 h-4 text-secondary" />
                <h2 class="text-xs sm:text-sm font-bold font-display uppercase tracking-wider text-foreground dark:text-white">
                  Available Courses ({{ filteredCourses.length }})
                </h2>
              </div>

              <div class="flex flex-wrap items-center gap-2">
                <select 
                  v-model="semesterFilter" 
                  class="bg-muted/40 dark:bg-dark-muted/40 border border-outline/40 dark:border-dark-outline/40 rounded-xl px-2.5 py-1 text-xs text-foreground dark:text-white font-mono outline-hidden focus:border-secondary"
                >
                  <option value="all">All Semesters</option>
                  <option value="Semester 1">Semester 1</option>
                  <option value="Semester 2">Semester 2</option>
                </select>

                <select 
                  v-model="levelFilter" 
                  class="bg-muted/40 dark:bg-dark-muted/40 border border-outline/40 dark:border-dark-outline/40 rounded-xl px-2.5 py-1 text-xs text-foreground dark:text-white font-mono outline-hidden focus:border-secondary"
                >
                  <option value="all">All Levels</option>
                  <option value="100">Level 100</option>
                  <option value="200">Level 200</option>
                  <option value="300">Level 300</option>
                  <option value="400">Level 400</option>
                  <option value="500">Level 500</option>
                  <option value="600">Level 600</option>
                  <option value="700">Level 700</option>
                </select>

                <div class="relative">
                  <Search class="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-foreground/40 dark:text-white/40 pointer-events-none" />
                  <input 
                    type="text" 
                    v-model="searchQuery" 
                    placeholder="Filter courses…" 
                    class="pl-7 pr-3 py-1 text-xs bg-muted/40 dark:bg-dark-muted/40 border border-outline/40 dark:border-dark-outline/40 focus:border-secondary rounded-xl outline-hidden text-foreground dark:text-white font-mono placeholder:text-foreground/40 dark:placeholder:text-white/40 w-32 sm:w-40"
                  />
                </div>
              </div>
            </div>

            <!-- Courses List -->
            <div class="pt-4">
              <div v-if="filteredCourses.length === 0" class="py-16 text-center text-foreground/50 dark:text-white/65">
                <BookOpen class="w-8 h-8 mx-auto mb-2 text-foreground/30 dark:text-white/35" />
                <p class="text-sm font-medium text-foreground dark:text-white">No available courses found</p>
                <p class="text-xs font-mono text-foreground/50 dark:text-white/65 mt-0.5">There are no unpublished modules matching your filters.</p>
              </div>

              <div v-else class="space-y-3">
                <div 
                  v-for="course in filteredCourses" 
                  :key="course.id"
                  @click="toggleSelection(course)"
                  class="p-4 rounded-xl border transition-all flex items-start gap-3.5 cursor-pointer select-none"
                  :class="isSelected(course) 
                    ? 'bg-secondary/10 dark:bg-dark-secondary/15 border-secondary shadow-xs ring-1 ring-secondary/30' 
                    : 'bg-muted/20 dark:bg-dark-muted/20 border-outline/30 dark:border-dark-outline/40 hover:bg-muted/40'"
                >
                  <!-- Custom Checkbox -->
                  <div 
                    class="w-5 h-5 rounded-md mt-0.5 shrink-0 flex items-center justify-center border transition-all"
                    :class="isSelected(course) 
                      ? 'bg-secondary border-secondary text-primary' 
                      : 'bg-surface dark:bg-dark-surface border-outline/50 dark:border-dark-outline/60'"
                  >
                    <Check v-if="isSelected(course)" class="w-3.5 h-3.5 stroke-[3]" />
                  </div>

                  <div class="min-w-0 flex-1">
                    <div class="flex items-center justify-between gap-2">
                      <div class="flex items-center gap-2">
                        <span class="text-xs font-bold font-mono text-secondary dark:text-dark-secondary">
                          {{ course.code }}
                        </span>
                        <span class="px-2 py-0.2 rounded text-[10px] font-mono font-medium bg-muted/60 dark:bg-dark-muted/60 text-foreground/60 dark:text-white/60 border border-outline/30">
                          {{ course.semester || 'Semester 1' }}
                        </span>
                      </div>

                      <span class="px-2 py-0.5 rounded-full text-xs font-bold font-mono bg-primary/10 dark:bg-primary/20 text-primary dark:text-dark-primary border border-primary/20">
                        {{ course.credits }} Credits
                      </span>
                    </div>

                    <h3 class="text-xs sm:text-sm font-semibold text-foreground dark:text-white truncate mt-1">
                      {{ course.name }}
                    </h3>
                    <p class="text-[11px] font-mono text-foreground/50 dark:text-white/65 mt-0.5">
                      Faculty Instructor: {{ course.lecturer }}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Right Column: Registration Summary (4 cols) -->
        <div class="lg:col-span-4 space-y-4">
          <div class="relative bg-surface dark:bg-dark-surface border border-outline/50 dark:border-dark-outline/60 rounded-2xl shadow-xs overflow-hidden p-5 flex flex-col justify-between">
            <div class="absolute top-3 left-3 w-4 h-4 border-t-2 border-l-2 border-secondary/30 pointer-events-none"></div>
            <div class="absolute top-3 right-3 w-4 h-4 border-t-2 border-r-2 border-secondary/30 pointer-events-none"></div>

            <div>
              <div class="flex items-center gap-2 pb-3 border-b border-outline/30 dark:border-dark-outline/40">
                <ClipboardList class="w-4 h-4 text-secondary" />
                <h2 class="text-xs sm:text-sm font-bold font-display uppercase tracking-wider text-foreground dark:text-white">
                  Registration Summary
                </h2>
              </div>

              <!-- Deadline mini-reminder in summary panel -->
              <div class="mt-3 p-2.5 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200/70 dark:border-amber-800/50 flex items-center gap-2">
                <Timer class="w-3.5 h-3.5 text-amber-600 dark:text-amber-400 shrink-0" />
                <div class="text-[11px] font-mono">
                  <span class="font-bold text-amber-800 dark:text-amber-300">Deadline: </span>
                  <span class="text-amber-700 dark:text-amber-400">{{ formatDate(registrationDeadline) }}</span>
                  <span v-if="daysRemaining > 0" class="ml-1 font-bold text-amber-700 dark:text-amber-300">({{ daysRemaining }}d left)</span>
                </div>
              </div>

              <!-- Credits Meter -->
              <div class="pt-4 space-y-2">
                <div class="flex items-center justify-between text-xs font-mono">
                  <span class="text-foreground/60 dark:text-white/70">Credit Load</span>
                  <span class="font-bold" :class="totalSelectedCredits > maxCredits ? 'text-error font-extrabold' : 'text-foreground dark:text-white'">
                    {{ totalSelectedCredits }} / {{ maxCredits }} Max
                  </span>
                </div>

                <!-- Meter Bar -->
                <div class="h-2 w-full bg-muted/70 dark:bg-dark-muted/70 rounded-full overflow-hidden">
                  <div 
                    class="h-full rounded-full transition-all duration-300"
                    :class="totalSelectedCredits > maxCredits ? 'bg-error' : totalSelectedCredits >= 15 ? 'bg-emerald-500' : 'bg-secondary'"
                    :style="{ width: `${Math.min(100, (totalSelectedCredits / maxCredits) * 100)}%` }"
                  ></div>
                </div>

                <p v-if="totalSelectedCredits > maxCredits" class="text-[11px] font-mono text-error">
                  You have exceeded the maximum limit of {{ maxCredits }} credits.
                </p>
              </div>

              <!-- Selected Courses List -->
              <div class="pt-5 space-y-3">
                <h3 class="text-xs font-bold font-mono text-foreground/70 dark:text-white/80 uppercase tracking-wider">
                  Selected Modules ({{ selectedCourses.length }})
                </h3>

                <div v-if="selectedCourses.length === 0" class="py-8 text-center text-foreground/40 font-mono text-xs">
                  No courses selected yet.
                </div>

                <div v-else class="space-y-2 max-h-64 overflow-y-auto pr-1">
                  <div 
                    v-for="course in selectedCourses" 
                    :key="course.id"
                    class="p-2.5 rounded-xl bg-muted/30 dark:bg-dark-muted/30 border border-outline/30 dark:border-dark-outline/40 flex items-center justify-between gap-2"
                  >
                    <div class="min-w-0">
                      <p class="text-xs font-bold text-foreground dark:text-white truncate">
                        {{ course.code }} &bull; {{ course.name }}
                      </p>
                      <span class="text-[10px] font-mono text-secondary dark:text-dark-secondary">
                        {{ course.credits }} Credits
                      </span>
                    </div>

                    <button 
                      @click.stop="toggleSelection(course)"
                      class="p-1 rounded-lg text-foreground/40 hover:text-error hover:bg-error/10 transition-colors cursor-pointer"
                      title="Remove from selection"
                    >
                      <X class="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            </div>

            <!-- Footer Submit Button -->
            <div class="pt-6 mt-6 border-t border-outline/30 dark:border-dark-outline/40">
              <button 
                class="w-full py-2.5 rounded-xl bg-primary dark:bg-dark-secondary text-surface dark:text-primary font-bold text-xs shadow-md hover:opacity-90 active:scale-98 disabled:opacity-40 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2 cursor-pointer"
                :disabled="selectedCourses.length === 0 || totalSelectedCredits > maxCredits || isSubmitting"
                @click="submitRegistration"
              >
                <RefreshCw v-if="isSubmitting" class="w-4 h-4 animate-spin" />
                <CheckCircle2 v-else class="w-4 h-4" />
                <span>{{ isSubmitting ? 'Registering Modules…' : 'Submit Registration' }}</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- No active semester, still show empty notice instead of locked UI -->
    <div v-if="!activeSemester && !semesterLoading" class="p-12 text-center rounded-2xl bg-white dark:bg-dark-surface border border-slate-200/80 dark:border-dark-outline/60">
      <CalendarOff class="w-10 h-10 mx-auto mb-3 text-slate-300 dark:text-slate-600" />
      <p class="font-bold text-slate-700 dark:text-white text-sm">No active semester found</p>
      <p class="text-xs font-mono text-slate-400 mt-1">Please check back when an administrator has set up and activated the current semester.</p>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue';
import { storeToRefs } from 'pinia';
import { useAuthStore } from '@/stores/authstore';
import { useCoursesStore } from '@/stores/courses';
import { useSchedulesStore } from '@/stores/schedules';
import { useEnrollmentsStore } from '@/stores/enrollments';
import { useAuditLogsStore } from '@/stores/auditlogs';
import { useSemestersStore } from '@/stores/semesters';
import { 
  BookOpen, 
  Search, 
  Check, 
  CheckCircle2, 
  ClipboardList, 
  X, 
  RefreshCw, 
  AlertTriangle,
  Lock,
  Timer,
  CalendarClock,
  CalendarOff,
  ShieldAlert,
  PhoneCall,
  Mail,
  Loader2
} from 'lucide-vue-next';

const authStore = useAuthStore();
const coursesStore = useCoursesStore();
const schedulesStore = useSchedulesStore();
const enrollmentsStore = useEnrollmentsStore();
const auditLogsStore = useAuditLogsStore();
const semestersStore = useSemestersStore();

const { profile } = storeToRefs(authStore);
const { courses } = storeToRefs(coursesStore);
const { schedules } = storeToRefs(schedulesStore);
const { enrollments } = storeToRefs(enrollmentsStore);
const { activeSemester } = storeToRefs(semestersStore);

const searchQuery = ref('');
const semesterFilter = ref('all');
const levelFilter = ref('all');
const maxCredits = 21;
const REGISTRATION_WINDOW_DAYS = 14; // 2 weeks

const selectedCourses = ref([]);
const isSubmitting = ref(false);
const feedbackMsg = ref('');
const feedbackIsError = ref(false);
const semesterLoading = ref(true);

// Ticker to update countdown in real-time
let tickInterval = null;
const now = ref(new Date());

const currentUserProgram = computed(() => profile.value?.program || 'Enrolled Student');

// ==========================================
// REGISTRATION WINDOW LOGIC
// ==========================================

/** Deadline = semester start + 14 days */
const registrationDeadline = computed(() => {
  if (!activeSemester.value?.startDate) return null;
  const start = new Date(activeSemester.value.startDate);
  const deadline = new Date(start);
  deadline.setDate(start.getDate() + REGISTRATION_WINDOW_DAYS);
  deadline.setHours(23, 59, 59, 999); // End of day 14
  return deadline;
});

/** Whether the registration window is currently open */
const registrationOpen = computed(() => {
  if (!activeSemester.value?.startDate) return false;
  const start = new Date(activeSemester.value.startDate);
  if (now.value < start) return false; // Semester hasn't started yet
  return now.value <= registrationDeadline.value;
});

/** Days past the semester start (clamped to 0 minimum) */
const daysPastSemesterStart = computed(() => {
  if (!activeSemester.value?.startDate) return 0;
  const start = new Date(activeSemester.value.startDate);
  const diff = now.value - start;
  return Math.max(0, Math.floor(diff / (1000 * 60 * 60 * 24)));
});

/** Progress percent through the 14-day window (0–100) */
const windowProgressPercent = computed(() => {
  const pct = (daysPastSemesterStart.value / REGISTRATION_WINDOW_DAYS) * 100;
  return Math.min(100, Math.max(0, pct));
});

/** Days remaining until registration closes */
const daysRemaining = computed(() => {
  if (!registrationDeadline.value) return 0;
  const diff = registrationDeadline.value - now.value;
  return Math.max(0, Math.floor(diff / (1000 * 60 * 60 * 24)));
});

/** How many days overdue the deadline is */
const daysOverDeadline = computed(() => {
  if (!registrationDeadline.value) return 0;
  const diff = now.value - registrationDeadline.value;
  return Math.max(0, Math.floor(diff / (1000 * 60 * 60 * 24)));
});

/** Human-readable time remaining label (days + hours, or hours + minutes) */
const timeRemainingLabel = computed(() => {
  if (!registrationDeadline.value) return '';
  const diffMs = registrationDeadline.value - now.value;
  if (diffMs <= 0) return 'Expired';

  const totalMinutes = Math.floor(diffMs / 60000);
  const totalHours = Math.floor(totalMinutes / 60);
  const days = Math.floor(totalHours / 24);
  const hours = totalHours % 24;
  const minutes = totalMinutes % 60;

  if (days > 0) return `${days}d ${hours}h`;
  if (totalHours > 0) return `${totalHours}h ${minutes}m`;
  return `${minutes}m`;
});

// Format dates nicely
const formatDate = (date) => {
  if (!date) return '—';
  const d = date instanceof Date ? date : new Date(date);
  if (isNaN(d.getTime())) return '—';
  return d.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
};

// ==========================================
// ENROLLED COURSES WITH DETAILS
// ==========================================
const enrollmentsWithDetails = computed(() => {
  return enrollments.value.map((e) => {
    const course = courses.value.find((c) => c.id === e.courseId);
    return {
      id: e.id,
      courseId: e.courseId,
      code: course?.code || e.courseId,
      name: course?.name || 'Unknown Course',
      credits: course?.credits || 3
    };
  });
});

// ==========================================
// COURSE FILTERING
// ==========================================

function lecturerForCourse(courseId) {
  const match = schedules.value.find((s) => s.courseId === courseId);
  return match?.lecturer || 'Faculty Staff';
}

const enrolledCourseIds = computed(
  () => new Set(enrollments.value.map((e) => e.courseId))
);

const availableGlobalCourses = computed(() =>
  courses.value
    .filter((c) => !enrolledCourseIds.value.has(c.id))
    .map((c) => ({
      ...c,
      lecturer: lecturerForCourse(c.id),
    }))
);

const filteredCourses = computed(() => {
  let list = availableGlobalCourses.value;

  if (profile.value?.programId) {
    list = list.filter((course) => course.programId === profile.value?.programId);
  }

  if (semesterFilter.value !== 'all') {
    list = list.filter((course) => (course.semester || 'Semester 1') === semesterFilter.value);
  }

  if (levelFilter.value !== 'all') {
    list = list.filter((course) => String(course.level) === levelFilter.value);
  }

  if (searchQuery.value) {
    const q = searchQuery.value.toLowerCase();
    list = list.filter(
      (course) =>
        course.code.toLowerCase().includes(q) ||
        course.name.toLowerCase().includes(q)
    );
  }

  return list;
});

const isSelected = (course) => {
  return selectedCourses.value.some((c) => c.id === course.id);
};

const toggleSelection = (course) => {
  if (isSelected(course)) {
    selectedCourses.value = selectedCourses.value.filter((c) => c.id !== course.id);
  } else {
    selectedCourses.value.push(course);
  }
};

const totalSelectedCredits = computed(() => {
  return selectedCourses.value.reduce((total, course) => total + (course.credits || 3), 0);
});

// ==========================================
// SUBMIT REGISTRATION
// ==========================================

const submitRegistration = async () => {
  // Double-check window is still open at submit time
  if (!registrationOpen.value) {
    feedbackMsg.value = 'Registration period has closed. Please contact the Academic Registry.';
    feedbackIsError.value = true;
    return;
  }

  isSubmitting.value = true;
  feedbackMsg.value = '';
  feedbackIsError.value = false;
  const studentId = profile.value?.id;
  const registered = [];
  const failed = [];

  try {
    for (const course of selectedCourses.value) {
      try {
        await enrollmentsStore.createEnrollment({ studentId, courseId: course.id });
        registered.push(course);

        auditLogsStore.logAction({
          action: 'course_registered',
          details: `Registered for ${course.code} — ${course.name}`,
          userId: studentId,
          userRole: profile.value?.role,
          userName: profile.value?.name,
        });
      } catch (err) {
        failed.push({ course, message: err.message });
      }
    }

    if (registered.length > 0 && failed.length === 0) {
      feedbackMsg.value = `Successfully enrolled in ${registered.length} module(s)!`;
      feedbackIsError.value = false;
    } else if (failed.length > 0) {
      feedbackMsg.value = `Registered for ${registered.length} module(s). Issues with: ${failed.map(f => f.course.code).join(', ')}`;
      feedbackIsError.value = true;
    }

    selectedCourses.value = [];
  } catch (error) {
    console.error('Registration failed', error);
    feedbackMsg.value = 'An error occurred during registration.';
    feedbackIsError.value = true;
  } finally {
    isSubmitting.value = false;
  }
};

// ==========================================
// LIFECYCLE
// ==========================================

onMounted(async () => {
  semesterLoading.value = true;
  try {
    await Promise.all([
      coursesStore.fetchCourses({ status: 'active' }),
      schedulesStore.fetchSchedules(),
      enrollmentsStore.fetchEnrollments({ studentId: profile.value?.id }),
      semestersStore.fetchSemesters(),
    ]);

    coursesStore.subscribeToCourses();
    enrollmentsStore.subscribeToEnrollments();
  } catch (error) {
    console.error('Error fetching data', error);
  } finally {
    semesterLoading.value = false;
  }

  // Tick every minute to keep countdown live
  tickInterval = setInterval(() => {
    now.value = new Date();
  }, 60000);
});

onUnmounted(() => {
  coursesStore.unsubscribeFromCourses();
  enrollmentsStore.unsubscribeFromEnrollments();
  if (tickInterval) clearInterval(tickInterval);
});
</script>