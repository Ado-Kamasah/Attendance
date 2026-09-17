<template>
  <div class="space-y-6 sm:space-y-8 font-sans pb-10">
    
    <!-- ── Top Architectural Header ────────────────────────────────────── -->
    <div class="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-2 border-b border-outline/40 dark:border-dark-outline/60">
      <div>
        <!-- Dimension Line Eyebrow -->
        <div class="flex items-center gap-2 mb-3 text-secondary dark:text-dark-secondary text-xs font-mono uppercase tracking-wider font-semibold flex items-center gap-2 mb-1.5 text-secondary dark:text-dark-secondary">
          <svg class="w-8 h-[2px] text-secondary dark:text-dark-secondary" viewBox="0 0 32 2">
            <line x1="0" y1="1" x2="32" y2="1" stroke="currentColor" stroke-width="2" />
          </svg>
          <span class="tracking-widest font-semibold text-xs font-display">OPERATIONAL HUB // CAD-ADMIN 01</span>
        </div>
        <h1 class="text-2xl sm:text-3xl font-bold font-display tracking-tight text-foreground dark:text-dark-foreground">
          Dashboard Overview
        </h1>
        <p class="text-xs sm:text-sm text-foreground/60 dark:text-dark-foreground/60 mt-0.5">
          Real-time institutional attendance analytics, active schedules, and live system audit streams.
        </p>
      </div>

      <!-- Action Chips & Live Status -->
      <div class="flex flex-wrap items-center gap-2.5 sm:gap-3">
        
        <!-- Live Calendar / Clock Chip -->
        <div class="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-surface dark:bg-dark-surface border border-outline dark:border-dark-outline shadow-sm text-xs font-medium text-foreground/80 dark:text-dark-foreground/80">
          <Calendar class="w-3.5 h-3.5 text-secondary dark:text-dark-secondary" />
          <span>{{ currentDate }}</span>
          <span class="text-foreground/30 dark:text-dark-foreground/30">•</span>
          <span class="font-mono text-primary dark:text-dark-secondary font-semibold">{{ currentTimeString }}</span>
        </div>

        <!-- Live Sync Status -->
        <div class="hidden sm:flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 text-xs font-medium">
          <span class="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
          <span>Live Sync Active</span>
        </div>

        <!-- Refresh Button -->
        <button
          type="button"
          @click="refreshData"
          :disabled="isRefreshing"
          class="p-2 rounded-xl bg-surface dark:bg-dark-surface border border-outline dark:border-dark-outline hover:border-primary dark:hover:border-dark-secondary text-foreground/70 dark:text-dark-foreground/70 hover:text-primary dark:hover:text-dark-secondary transition-all shadow-sm focus:outline-none cursor-pointer disabled:opacity-50"
          title="Refresh Dashboard Data"
        >
          <RotateCw class="w-4 h-4" :class="{ 'animate-spin': isRefreshing }" />
        </button>

        <!-- Quick Navigate to Schedule -->
        <button
          type="button"
          @click="$emit('navigate', '/schedule')"
          class="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-display font-semibold text-white bg-primary hover:bg-[#052b66] dark:bg-primary dark:hover:bg-[#0b295c] shadow-sm shadow-primary/20 transition-all cursor-pointer"
        >
          <CalendarDays class="w-3.5 h-3.5" />
          <span>Full Timetable</span>
        </button>

      </div>
    </div>

    <!-- ── 4 Key Metric Cards ─────────────────────────────────────────── -->
    <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
      
      <!-- Metric 1: Total Students -->
      <div class="relative p-5 bg-surface dark:bg-dark-surface border border-outline/70 dark:border-dark-outline rounded-2xl shadow-sm hover:shadow-md transition-all group overflow-hidden">
        <div class="flex items-start justify-between">
          <div class="space-y-1">
            <span class="text-[11px] font-bold uppercase tracking-wider text-foreground/50 dark:text-dark-foreground/50 font-display">
              Total Students
            </span>
            <div class="text-2xl sm:text-3xl font-bold font-display text-foreground dark:text-dark-foreground">
              {{ totalStudents }}
            </div>
          </div>
          <div class="w-11 h-11 rounded-xl bg-indigo-500/10 dark:bg-indigo-500/20 text-indigo-600 dark:text-indigo-400 flex items-center justify-center transition-transform group-hover:scale-105">
            <Users class="w-5 h-5" />
          </div>
        </div>

        <div class="mt-3.5 pt-3 border-t border-outline/40 dark:border-dark-outline/40 flex items-center justify-between text-xs">
          <span class="inline-flex items-center gap-1 text-emerald-600 dark:text-emerald-400 font-medium">
            <ArrowUpRight class="w-3.5 h-3.5" />
            <span>+5%</span>
          </span>
          <span class="text-foreground/45 dark:text-dark-foreground/45 text-[11px]">from last week</span>
        </div>
      </div>

      <!-- Metric 2: Average Attendance -->
      <div class="relative p-5 bg-surface dark:bg-dark-surface border border-outline/70 dark:border-dark-outline rounded-2xl shadow-sm hover:shadow-md transition-all group overflow-hidden">
        <div class="flex items-start justify-between">
          <div class="space-y-1">
            <span class="text-[11px] font-bold uppercase tracking-wider text-foreground/50 dark:text-dark-foreground/50 font-display">
              Avg Attendance
            </span>
            <div class="text-2xl sm:text-3xl font-bold font-display text-foreground dark:text-dark-foreground">
              {{ averageAttendance }}%
            </div>
          </div>
          <div class="w-11 h-11 rounded-xl bg-emerald-500/10 dark:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 flex items-center justify-center transition-transform group-hover:scale-105">
            <TrendingUp class="w-5 h-5" />
          </div>
        </div>

        <div class="mt-3.5 pt-3 border-t border-outline/40 dark:border-dark-outline/40 flex items-center justify-between text-xs">
          <span class="inline-flex items-center gap-1 text-emerald-600 dark:text-emerald-400 font-medium">
            <ArrowUpRight class="w-3.5 h-3.5" />
            <span>+2%</span>
          </span>
          <!-- Mini Progress Bar -->
          <div class="w-20 h-1.5 bg-background dark:bg-dark-background rounded-full overflow-hidden">
            <div class="h-full bg-emerald-500 rounded-full" :style="{ width: `${averageAttendance}%` }"></div>
          </div>
        </div>
      </div>

      <!-- Metric 3: Active Courses -->
      <div class="relative p-5 bg-surface dark:bg-dark-surface border border-outline/70 dark:border-dark-outline rounded-2xl shadow-sm hover:shadow-md transition-all group overflow-hidden">
        <div class="flex items-start justify-between">
          <div class="space-y-1">
            <span class="text-[11px] font-bold uppercase tracking-wider text-foreground/50 dark:text-dark-foreground/50 font-display">
              Active Courses
            </span>
            <div class="text-2xl sm:text-3xl font-bold font-display text-foreground dark:text-dark-foreground">
              {{ activeCoursesCount }}
            </div>
          </div>
          <div class="w-11 h-11 rounded-xl bg-amber-500/10 dark:bg-amber-500/20 text-secondary dark:text-dark-secondary flex items-center justify-center transition-transform group-hover:scale-105">
            <BookOpen class="w-5 h-5" />
          </div>
        </div>

        <div class="mt-3.5 pt-3 border-t border-outline/40 dark:border-dark-outline/40 flex items-center justify-between text-xs">
          <span class="inline-flex items-center gap-1 text-secondary dark:text-dark-secondary font-medium">
            <ArrowUpRight class="w-3.5 h-3.5" />
            <span>+12%</span>
          </span>
          <span class="text-foreground/45 dark:text-dark-foreground/45 text-[11px]">in current semester</span>
        </div>
      </div>

      <!-- Metric 4: Flagged Absences -->
      <div class="relative p-5 bg-surface dark:bg-dark-surface border border-outline/70 dark:border-dark-outline rounded-2xl shadow-sm hover:shadow-md transition-all group overflow-hidden">
        <div class="flex items-start justify-between">
          <div class="space-y-1">
            <span class="text-[11px] font-bold uppercase tracking-wider text-foreground/50 dark:text-dark-foreground/50 font-display">
              Flagged Absences
            </span>
            <div class="text-2xl sm:text-3xl font-bold font-display text-foreground dark:text-dark-foreground">
              {{ flaggedAbsences }}
            </div>
          </div>
          <div class="w-11 h-11 rounded-xl bg-red-500/10 dark:bg-red-500/20 text-red-600 dark:text-red-400 flex items-center justify-center transition-transform group-hover:scale-105">
            <AlertTriangle class="w-5 h-5" />
          </div>
        </div>

        <div class="mt-3.5 pt-3 border-t border-outline/40 dark:border-dark-outline/40 flex items-center justify-between text-xs">
          <span class="inline-flex items-center gap-1 text-red-600 dark:text-red-400 font-medium">
            <ArrowDownRight class="w-3.5 h-3.5" />
            <span>-4%</span>
          </span>
          <span class="text-foreground/45 dark:text-dark-foreground/45 text-[11px]">needs attention</span>
        </div>
      </div>

    </div>

    <!-- ── Main Content Split (Today's Schedule & Live Audit Logs) ──────── -->
    <div class="grid grid-cols-1 lg:grid-cols-12 gap-6 sm:gap-8">
      
      <!-- Left Column: Today's Schedule (7 cols on lg) -->
      <div class="lg:col-span-7 space-y-4">
        
        <div class="bg-surface dark:bg-dark-surface border border-outline/70 dark:border-dark-outline rounded-2xl shadow-sm p-5 sm:p-6">
          
          <!-- Panel Header -->
          <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-outline/40 dark:border-dark-outline/60">
            <div class="flex items-center gap-2.5">
              <div class="w-8 h-8 rounded-lg bg-primary/10 dark:bg-dark-primary/20 text-primary dark:text-dark-secondary flex items-center justify-center">
                <Clock class="w-4 h-4" />
              </div>
              <div>
                <h2 class="font-display font-bold text-lg text-foreground dark:text-dark-foreground">
                  Today's Schedule
                </h2>
                <span class="text-xs text-foreground/50 dark:text-dark-foreground/50">
                  {{ currentDayName }} • {{ todaySchedule.length }} lecture{{ todaySchedule.length === 1 ? '' : 's' }} scheduled
                </span>
              </div>
            </div>

            <!-- Schedule Filter Tabs -->
            <div class="flex items-center gap-1 p-1 rounded-xl bg-background dark:bg-dark-background border border-outline/50 dark:border-dark-outline/60 text-xs">
              <button
                v-for="tab in filterTabs"
                :key="tab.id"
                @click="activeScheduleFilter = tab.id"
                class="px-2.5 py-1 rounded-lg font-medium transition-colors cursor-pointer"
                :class="activeScheduleFilter === tab.id
                  ? 'bg-surface dark:bg-dark-surface text-primary dark:text-dark-secondary shadow-xs font-semibold'
                  : 'text-foreground/60 dark:text-dark-foreground/60 hover:text-foreground dark:hover:text-dark-foreground'"
              >
                {{ tab.label }}
              </button>
            </div>
          </div>

          <!-- Schedule List -->
          <div class="mt-4 space-y-3">
            
            <div
              v-for="course in filteredSchedule"
              :key="course.id"
              class="p-4 rounded-xl border border-outline/60 dark:border-dark-outline/80 bg-background/50 dark:bg-dark-background/50 hover:bg-background dark:hover:bg-dark-background transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3"
            >
              <!-- Time Block & Course Info -->
              <div class="flex items-start gap-3.5">
                <!-- Time Pillar -->
                <div class="px-2.5 py-2 rounded-lg bg-surface dark:bg-dark-surface border border-outline/50 dark:border-dark-outline text-center shrink-0 min-w-[72px]">
                  <span class="block text-xs font-bold font-mono text-primary dark:text-dark-secondary">
                    {{ course.startTime || 'TBD' }}
                  </span>
                  <span class="block text-[10px] text-foreground/50 dark:text-dark-foreground/50 font-mono">
                    {{ course.endTime || '' }}
                  </span>
                </div>

                <!-- Course Description -->
                <div>
                  <div class="flex items-center gap-2">
                    <h3 class="font-display font-bold text-sm text-foreground dark:text-dark-foreground">
                      {{ course.name }}
                    </h3>
                  </div>
                  <div class="flex flex-wrap items-center gap-2 mt-1 text-xs text-foreground/60 dark:text-dark-foreground/60">
                    <span class="inline-flex items-center gap-1">
                      <GraduationCap class="w-3.5 h-3.5 text-secondary dark:text-dark-secondary" />
                      {{ course.lecturer || 'Faculty Lecturer' }}
                    </span>
                    <span>•</span>
                    <span class="inline-flex items-center gap-1">
                      <MapPin class="w-3.5 h-3.5 text-foreground/40 dark:text-dark-foreground/40" />
                      {{ course.room || 'Room TBD' }}
                    </span>
                  </div>
                </div>
              </div>

              <!-- Status Badge & Action -->
              <div class="flex items-center justify-between sm:justify-end gap-2.5 pt-2 sm:pt-0 border-t sm:border-t-0 border-outline/30 dark:border-dark-outline/30">
                <!-- Status Badge -->
                <span
                  class="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium"
                  :class="{
                    'bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border border-emerald-500/30': course.status === 'ongoing',
                    'bg-amber-500/15 text-amber-700 dark:text-amber-300 border border-amber-500/30': course.status === 'upcoming',
                    'bg-muted dark:bg-dark-muted text-foreground/60 dark:text-dark-foreground/60 border border-outline/40': course.status === 'completed',
                  }"
                >
                  <span
                    v-if="course.status === 'ongoing'"
                    class="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping"
                  ></span>
                  <Radio v-if="course.status === 'ongoing'" class="w-3 h-3" />
                  <Clock v-else-if="course.status === 'upcoming'" class="w-3 h-3" />
                  <CheckCircle2 v-else class="w-3 h-3" />
                  <span>{{ course.statusText }}</span>
                </span>

                <!-- Quick Attendance View -->
                <button
                  type="button"
                  @click="$emit('navigate', '/attendance-view')"
                  class="p-1.5 rounded-lg text-foreground/50 hover:text-primary dark:hover:text-dark-secondary hover:bg-surface dark:hover:bg-dark-surface border border-transparent hover:border-outline dark:hover:border-dark-outline transition-colors cursor-pointer"
                  title="View Attendance Log"
                >
                  <ArrowRight class="w-4 h-4" />
                </button>
              </div>

            </div>

            <!-- Empty State -->
            <div
              v-if="filteredSchedule.length === 0"
              class="py-10 px-4 text-center rounded-xl border border-dashed border-outline dark:border-dark-outline bg-background/30 dark:bg-dark-background/30 space-y-2"
            >
              <div class="w-10 h-10 rounded-full bg-muted dark:bg-dark-muted text-foreground/40 dark:text-dark-foreground/40 flex items-center justify-center mx-auto">
                <CalendarCheck class="w-5 h-5" />
              </div>
              <p class="text-sm font-display font-medium text-foreground/80 dark:text-dark-foreground/80">
                No lectures found for this filter.
              </p>
              <p class="text-xs text-foreground/50 dark:text-dark-foreground/50 max-w-xs mx-auto">
                {{ todaySchedule.length === 0 ? "There are no academic sessions scheduled for today (" + currentDayName + ")." : "Try switching to another tab to view scheduled sessions." }}
              </p>
            </div>

          </div>

          <!-- Bottom Schedule Action Footer -->
          <div class="mt-4 pt-4 border-t border-outline/40 dark:border-dark-outline/60 flex items-center justify-between text-xs">
            <span class="text-foreground/50 dark:text-dark-foreground/50 font-mono text-[11px]">
              UPDATED LIVE EVERY 30 SECONDS
            </span>
            <button
              type="button"
              @click="$emit('navigate', '/schedule')"
              class="font-semibold text-secondary hover:text-[#9e7a25] dark:text-dark-secondary dark:hover:text-[#e4bc5e] inline-flex items-center gap-1 transition-colors cursor-pointer"
            >
              <span>Manage Lecture Schedules</span>
              <ArrowRight class="w-3.5 h-3.5" />
            </button>
          </div>

        </div>

      </div>

      <!-- Right Column: Live Audit Logs & System Status (5 cols on lg) -->
      <div class="lg:col-span-5 space-y-6">
        
        <!-- Live Audit Trail Card -->
        <div class="bg-surface dark:bg-dark-surface border border-outline/70 dark:border-dark-outline rounded-2xl shadow-sm p-5 sm:p-6">
          
          <div class="flex items-center justify-between pb-3.5 border-b border-outline/40 dark:border-dark-outline/60">
            <div class="flex items-center gap-2">
              <div class="w-7 h-7 rounded-lg bg-secondary/15 dark:bg-dark-secondary/20 text-secondary dark:text-dark-secondary flex items-center justify-center">
                <History class="w-4 h-4" />
              </div>
              <h2 class="font-display font-bold text-base text-foreground dark:text-dark-foreground">
                Live Audit Stream
              </h2>
            </div>
            <button
              type="button"
              @click="isAuditModalOpen = true"
              class="text-xs font-semibold text-secondary hover:text-[#9e7a25] dark:text-dark-secondary transition-colors cursor-pointer"
            >
              View All ({{ systemAuditLogs.length }})
            </button>
          </div>

          <!-- Audit Log Entries List -->
          <div class="mt-3.5 space-y-2.5">
            <div
              v-for="log in systemAuditLogs.slice(0, 5)"
              :key="log.id"
              class="p-3 rounded-xl bg-background/60 dark:bg-dark-background/60 border border-outline/40 dark:border-dark-outline/60 hover:border-outline dark:hover:border-dark-outline transition-all"
            >
              <div class="flex items-center justify-between text-xs mb-1">
                <span class="font-display font-semibold text-foreground dark:text-dark-foreground">
                  {{ log.action }}
                </span>
                <span class="text-[10px] font-mono text-foreground/45 dark:text-dark-foreground/45">
                  {{ log.timestamp }}
                </span>
              </div>
              <p class="text-xs text-foreground/70 dark:text-dark-foreground/70 line-clamp-2 leading-relaxed mb-2">
                {{ log.details }}
              </p>
              <div class="flex items-center justify-between text-[11px]">
                <div class="flex items-center gap-1.5">
                  <span
                    class="px-1.5 py-0.5 rounded text-[10px] font-semibold uppercase tracking-wider"
                    :class="getRoleBadgeClass(log.role)"
                  >
                    {{ log.role }}
                  </span>
                  <span class="text-foreground/60 dark:text-dark-foreground/60 font-medium">
                    {{ log.user }}
                  </span>
                </div>
              </div>
            </div>

            <!-- Empty Audit Logs -->
            <div
              v-if="systemAuditLogs.length === 0"
              class="py-8 text-center text-xs text-foreground/50 dark:text-dark-foreground/50"
            >
              No system activity logs recorded yet.
            </div>
          </div>

          <!-- Open Modal CTA -->
          <button
            type="button"
            @click="isAuditModalOpen = true"
            class="w-full mt-4 py-2.5 px-4 rounded-xl border border-outline/70 dark:border-dark-outline text-xs font-display font-semibold text-foreground/80 dark:text-dark-foreground/80 hover:bg-background dark:hover:bg-dark-background transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
          >
            <ShieldCheck class="w-3.5 h-3.5 text-secondary dark:text-dark-secondary" />
            <span>Open Complete Audit Trail</span>
          </button>

        </div>

        <!-- Technical Specification / Architecture Title Block -->
        <div class="relative overflow-hidden bg-surface dark:bg-dark-surface border border-outline dark:border-dark-outline rounded-2xl p-5">
          <!-- Subtle corner marks -->
          <div class="absolute top-3 left-3 w-4 h-4 border-t-2 border-l-2 border-secondary/40 pointer-events-none"></div>
          <div class="absolute top-3 right-3 w-4 h-4 border-t-2 border-r-2 border-secondary/40 pointer-events-none"></div>
          
          <div class="flex items-center gap-2 mb-3">
            <Sparkles class="w-4 h-4 text-secondary dark:text-dark-secondary" />
            <h3 class="text-xs font-bold uppercase tracking-wider text-foreground/70 dark:text-dark-foreground/70 font-display">
              Infrastructure Specifications
            </h3>
          </div>

          <div class="grid grid-cols-2 gap-3 text-xs">
            <div>
              <span class="text-[10px] font-mono uppercase text-foreground/45 dark:text-dark-foreground/45 block mb-0.5">Database Tier</span>
              <span class="font-medium text-foreground dark:text-dark-foreground flex items-center gap-1">
                <Database class="w-3 h-3 text-emerald-500" />
                Supabase PG-15
              </span>
            </div>
            <div>
              <span class="text-[10px] font-mono uppercase text-foreground/45 dark:text-dark-foreground/45 block mb-0.5">Attendance Ledger</span>
              <span class="font-medium font-mono text-foreground dark:text-dark-foreground">
                {{ attendances.length }} logs logged
              </span>
            </div>
            <div>
              <span class="text-[10px] font-mono uppercase text-foreground/45 dark:text-dark-foreground/45 block mb-0.5">Enrollment Count</span>
              <span class="font-medium font-mono text-foreground dark:text-dark-foreground">
                {{ enrollments.length }} records
              </span>
            </div>
            <div>
              <span class="text-[10px] font-mono uppercase text-foreground/45 dark:text-dark-foreground/45 block mb-0.5">Active Session</span>
              <span class="font-medium text-secondary dark:text-dark-secondary">
                Semester 2 (2025)
              </span>
            </div>
          </div>
        </div>

      </div>

    </div>

    <!-- ── Full Audit Trail Modal ──────────────────────────────────────── -->
    <transition
      enter-active-class="transition duration-200 ease-out"
      enter-from-class="opacity-0 scale-95"
      enter-to-class="opacity-100 scale-100"
      leave-active-class="transition duration-150 ease-in"
      leave-from-class="opacity-100 scale-100"
      leave-to-class="opacity-0 scale-95"
    >
      <div
        v-if="isAuditModalOpen"
        class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
        @click.self="isAuditModalOpen = false"
      >
        <div
          class="relative w-full max-w-3xl max-h-[85vh] flex flex-col bg-surface dark:bg-dark-surface border border-outline dark:border-dark-outline rounded-2xl shadow-2xl overflow-hidden"
          role="dialog"
          aria-modal="true"
        >
          <!-- Modal Header -->
          <div class="p-5 sm:p-6 border-b border-outline/50 dark:border-dark-outline/50 flex items-center justify-between shrink-0">
            <div class="flex items-center gap-3">
              <div class="w-10 h-10 rounded-xl bg-primary/10 dark:bg-dark-primary/20 text-primary dark:text-dark-secondary flex items-center justify-center">
                <ShieldCheck class="w-5 h-5" />
              </div>
              <div>
                <h2 class="text-lg font-bold font-display text-foreground dark:text-dark-foreground">
                  Complete System Audit Trail
                </h2>
                <p class="text-xs text-foreground/50 dark:text-dark-foreground/50">
                  Comprehensive append-only record of administrative, faculty, and student operations.
                </p>
              </div>
            </div>
            <button
              type="button"
              @click="isAuditModalOpen = false"
              class="p-2 rounded-xl text-foreground/40 hover:text-foreground dark:text-dark-foreground/40 dark:hover:text-dark-foreground hover:bg-background dark:hover:bg-dark-background transition-colors cursor-pointer"
            >
              <X class="w-5 h-5" />
            </button>
          </div>

          <!-- Search & Filter Bar -->
          <div class="p-4 bg-background/50 dark:bg-dark-background/50 border-b border-outline/40 dark:border-dark-outline/40 flex flex-col sm:flex-row items-center gap-3 shrink-0">
            <div class="relative w-full sm:flex-1">
              <Search class="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-foreground/40 dark:text-dark-foreground/40" />
              <input
                type="text"
                v-model="auditSearchQuery"
                placeholder="Search audit actions, details, or users..."
                class="w-full pl-10 pr-4 py-2 bg-surface dark:bg-dark-surface border border-outline dark:border-dark-outline rounded-xl text-xs text-foreground dark:text-dark-foreground focus:outline-none focus:border-primary dark:focus:border-dark-secondary"
              />
            </div>
            <div class="flex items-center gap-1 text-xs self-start sm:self-auto">
              <span class="text-foreground/50 dark:text-dark-foreground/50 mr-1">Role:</span>
              <button
                v-for="role in ['All', 'Admin', 'Lecturer', 'Student', 'System']"
                :key="role"
                @click="selectedAuditRole = role"
                class="px-2.5 py-1 rounded-lg transition-colors cursor-pointer"
                :class="selectedAuditRole === role
                  ? 'bg-primary dark:bg-dark-secondary text-white dark:text-dark-background font-semibold'
                  : 'text-foreground/60 dark:text-dark-foreground/60 hover:bg-background dark:hover:bg-dark-background'"
              >
                {{ role }}
              </button>
            </div>
          </div>

          <!-- Scrollable Log Table / List -->
          <div class="flex-1 overflow-y-auto p-4 sm:p-6 space-y-2.5 [scrollbar-width:thin]">
            <div
              v-for="log in filteredModalAuditLogs"
              :key="log.id"
              class="p-3.5 rounded-xl border border-outline/50 dark:border-dark-outline/60 bg-background/40 dark:bg-dark-background/40 hover:bg-background dark:hover:bg-dark-background transition-colors flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs"
            >
              <div class="space-y-1 flex-1">
                <div class="flex items-center gap-2">
                  <span class="font-semibold font-display text-foreground dark:text-dark-foreground">
                    {{ log.action }}
                  </span>
                  <span
                    class="px-1.5 py-0.5 rounded text-[9px] font-semibold uppercase tracking-wider"
                    :class="getRoleBadgeClass(log.role)"
                  >
                    {{ log.role }}
                  </span>
                </div>
                <p class="text-foreground/75 dark:text-dark-foreground/75 leading-relaxed">
                  {{ log.details }}
                </p>
              </div>

              <div class="sm:text-right shrink-0">
                <span class="block font-medium text-foreground dark:text-dark-foreground text-[11px]">
                  {{ log.user }}
                </span>
                <span class="block font-mono text-[10px] text-foreground/45 dark:text-dark-foreground/45">
                  {{ log.timestamp }}
                </span>
              </div>
            </div>

            <div
              v-if="filteredModalAuditLogs.length === 0"
              class="py-12 text-center text-xs text-foreground/50 dark:text-dark-foreground/50"
            >
              No matching audit records found.
            </div>
          </div>

          <!-- Modal Footer -->
          <div class="p-4 border-t border-outline/50 dark:border-dark-outline/50 bg-background/30 dark:bg-dark-background/30 flex items-center justify-between text-xs shrink-0">
            <span class="text-foreground/50 dark:text-dark-foreground/50">
              Showing {{ filteredModalAuditLogs.length }} of {{ systemAuditLogs.length }} entries
            </span>
            <button
              type="button"
              @click="isAuditModalOpen = false"
              class="px-4 py-2 rounded-xl bg-primary hover:bg-[#052b66] dark:bg-primary dark:hover:bg-[#0b295c] text-white font-display font-semibold transition-colors cursor-pointer"
            >
              Close
            </button>
          </div>

        </div>
      </div>
    </transition>

  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue';
import { storeToRefs } from 'pinia';
import { useCoursesStore } from '@/stores/courses';
import { useSchedulesStore } from '@/stores/schedules';
import { useAuditLogsStore } from '@/stores/auditlogs';
import { useEnrollmentsStore } from '@/stores/enrollments';
import { useAttendancesStore } from '@/stores/attendances';
import {
  Users,
  TrendingUp,
  BookOpen,
  AlertTriangle,
  Calendar,
  Clock,
  RotateCw,
  CalendarDays,
  CalendarCheck,
  GraduationCap,
  MapPin,
  Radio,
  CheckCircle2,
  ArrowRight,
  ArrowUpRight,
  ArrowDownRight,
  History,
  ShieldCheck,
  Sparkles,
  Database,
  Search,
  X
} from 'lucide-vue-next';

defineEmits(['navigate']);

const coursesStore = useCoursesStore();
const schedulesStore = useSchedulesStore();
const auditLogsStore = useAuditLogsStore();
const enrollmentsStore = useEnrollmentsStore();
const attendancesStore = useAttendancesStore();

const { courses } = storeToRefs(coursesStore);
const { schedules } = storeToRefs(schedulesStore);
const { logs } = storeToRefs(auditLogsStore);
const { enrollments } = storeToRefs(enrollmentsStore);
const { attendances } = storeToRefs(attendancesStore);

// Ticks every 30s so schedule statuses (upcoming/ongoing/completed) update live
const now = ref(new Date());
let clockInterval = null;
const isRefreshing = ref(false);

// Filter tabs for today's schedule
const activeScheduleFilter = ref('all');
const filterTabs = [
  { id: 'all', label: 'All' },
  { id: 'ongoing', label: 'Ongoing' },
  { id: 'upcoming', label: 'Upcoming' },
  { id: 'completed', label: 'Completed' },
];

// Audit trail modal states
const isAuditModalOpen = ref(false);
const auditSearchQuery = ref('');
const selectedAuditRole = ref('All');

onMounted(async () => {
  await fetchAllDashboardData();

  coursesStore.subscribeToCourses();
  schedulesStore.subscribeToSchedules();
  auditLogsStore.subscribeToLogs();
  enrollmentsStore.subscribeToEnrollments();
  attendancesStore.subscribeToAttendances();

  clockInterval = setInterval(() => {
    now.value = new Date();
  }, 30 * 1000);
});

onUnmounted(() => {
  coursesStore.unsubscribeFromCourses();
  schedulesStore.unsubscribeFromSchedules();
  auditLogsStore.unsubscribeFromLogs();
  enrollmentsStore.unsubscribeFromEnrollments();
  attendancesStore.unsubscribeFromAttendances();

  if (clockInterval) clearInterval(clockInterval);
});

async function fetchAllDashboardData() {
  try {
    await Promise.all([
      coursesStore.fetchCourses(),
      schedulesStore.fetchSchedules(),
      auditLogsStore.fetchLogs(),
      enrollmentsStore.fetchEnrollments(),
      attendancesStore.fetchAttendances(),
    ]);
  } catch (error) {
    console.error('Error fetching dashboard data:', error);
  }
}

async function refreshData() {
  isRefreshing.value = true;
  await fetchAllDashboardData();
  now.value = new Date();
  setTimeout(() => {
    isRefreshing.value = false;
  }, 400);
}

const currentDate = computed(() =>
  now.value.toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  })
);

const currentTimeString = computed(() =>
  now.value.toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit'
  })
);

const currentDayName = computed(() =>
  now.value.toLocaleDateString('en-US', { weekday: 'long' })
);

// --- Derived Metrics ---
const totalStudents = computed(() => {
  const uniqueStudentIds = new Set(enrollments.value.map((e) => e.studentId));
  return uniqueStudentIds.size;
});

const averageAttendance = computed(() => {
  if (attendances.value.length === 0) return 0;
  const presentCount = attendances.value.filter((a) => a.status === 'present').length;
  return Math.round((presentCount / attendances.value.length) * 100);
});

const activeCoursesCount = computed(() =>
  courses.value.filter((c) => c.status === 'active').length
);

const flaggedAbsences = computed(() =>
  attendances.value.filter((a) => a.status === 'absent').length
);

// Converts a "HH:MM" (or "HH:MM:SS") string into minutes-since-midnight
function parseTimeToMinutes(timeStr) {
  if (!timeStr) return null;
  const [h, m] = timeStr.split(':').map(Number);
  if (Number.isNaN(h) || Number.isNaN(m)) return null;
  return h * 60 + m;
}

// --- Today's schedule ---
const todaySchedule = computed(() => {
  const nowMinutes = now.value.getHours() * 60 + now.value.getMinutes();

  return schedules.value
    .filter((s) => s.day === currentDayName.value)
    .sort((a, b) => (a.startTime || '').localeCompare(b.startTime || ''))
    .map((s) => {
      const course = coursesStore.getCourseById(s.courseId);
      const startMinutes = parseTimeToMinutes(s.startTime);
      const endMinutes = parseTimeToMinutes(s.endTime);

      let status = 'upcoming';
      let statusText = 'Upcoming';

      if (startMinutes !== null && endMinutes !== null) {
        if (nowMinutes >= startMinutes && nowMinutes <= endMinutes) {
          status = 'ongoing';
          statusText = 'Ongoing';
        } else if (nowMinutes > endMinutes) {
          status = 'completed';
          statusText = 'Completed';
        }
      }

      return {
        ...s,
        name: course?.name ?? 'Unknown Course',
        room: s.venue,
        status,
        statusText
      };
    });
});

const filteredSchedule = computed(() => {
  if (activeScheduleFilter.value === 'all') return todaySchedule.value;
  return todaySchedule.value.filter((s) => s.status === activeScheduleFilter.value);
});

// --- Audit logs ---
const systemAuditLogs = computed(() =>
  logs.value.map((l) => ({
    id: l.id,
    action: l.action,
    details: l.details,
    timestamp: l.timestamp
      ? new Date(l.timestamp).toLocaleString('en-US', {
          hour: 'numeric',
          minute: '2-digit',
          month: 'short',
          day: 'numeric'
        })
      : '',
    role: l.userRole || 'System',
    user: l.userName || 'System',
  }))
);

const filteredModalAuditLogs = computed(() => {
  return systemAuditLogs.value.filter((log) => {
    const matchesRole =
      selectedAuditRole.value === 'All' ||
      log.role.toLowerCase() === selectedAuditRole.value.toLowerCase();

    const query = auditSearchQuery.value.trim().toLowerCase();
    const matchesSearch =
      !query ||
      log.action.toLowerCase().includes(query) ||
      log.details.toLowerCase().includes(query) ||
      log.user.toLowerCase().includes(query);

    return matchesRole && matchesSearch;
  });
});

function getRoleBadgeClass(role) {
  const r = (role || '').toLowerCase();
  if (r.includes('admin')) return 'bg-purple-500/15 text-purple-600 dark:text-purple-400 border border-purple-500/30';
  if (r.includes('lecturer') || r.includes('staff')) return 'bg-blue-500/15 text-blue-600 dark:text-blue-400 border border-blue-500/30';
  if (r.includes('student')) return 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30';
  return 'bg-amber-500/15 text-amber-600 dark:text-amber-400 border border-amber-500/30';
}
</script>