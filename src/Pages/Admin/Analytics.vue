<template>
  <div class="space-y-8 p-1 sm:p-2 lg:p-4 animate-in fade-in duration-500">
    <!-- Header with Blueprint Eyebrow -->
    <div class="relative overflow-hidden rounded-2xl bg-white dark:bg-dark-surface border border-slate-200/80 dark:border-dark-outline/60 p-6 sm:p-8 shadow-sm">
      <div class="absolute inset-0 bg-[radial-gradient(#031c45_1px,transparent_1px)] dark:bg-[radial-gradient(#ffffff_1px,transparent_1px)] bg-[size:16px_16px] opacity-[0.03] dark:opacity-[0.02] pointer-events-none"></div>
      
      <!-- Blueprint Corner Accents -->
      <div class="absolute top-0 left-0 w-3 h-3 border-t-2 border-l-2 border-secondary/40"></div>
      <div class="absolute top-0 right-0 w-3 h-3 border-t-2 border-r-2 border-secondary/40"></div>
      <div class="absolute bottom-0 left-0 w-3 h-3 border-b-2 border-l-2 border-secondary/40"></div>
      <div class="absolute bottom-0 right-0 w-3 h-3 border-b-2 border-r-2 border-secondary/40"></div>

      <div class="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
        <div>
          <div class="flex flex-wrap items-center gap-2 mb-3">
            <div class="inline-flex items-center gap-2 px-2.5 py-1 rounded-md bg-secondary/10 border border-secondary/20 text-secondary text-[11px] font-mono uppercase tracking-wider">
              <BarChart2 class="w-3.5 h-3.5" />
              <span>ATTENDANCE INTELLIGENCE // INSTITUTIONAL AUDIT</span>
            </div>
            <div class="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 text-[11px] font-mono">
              <span class="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
              <span>SUPABASE DIRECT</span>
            </div>
          </div>

          <h1 class="text-2xl sm:text-3xl font-extrabold font-display tracking-tight text-slate-900 dark:text-white">
            Attendance <span class="text-secondary">Analytics</span>
          </h1>
          <p class="text-xs sm:text-sm font-mono text-slate-500 dark:text-white/75 mt-1">
            Real-time Supabase rollcall data, student registered courses performance, and batch download queue
          </p>
        </div>

        <div class="flex flex-wrap items-center gap-3">
          <!-- Live Sync Button -->
          <button
            @click="fetchSupabaseDataDirectly"
            :disabled="isSyncing"
            class="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-slate-50 dark:bg-dark-muted border border-slate-200 dark:border-dark-outline text-slate-700 dark:text-white text-xs font-mono font-semibold hover:border-secondary transition-all shadow-2xs cursor-pointer disabled:opacity-50"
            title="Force immediate refresh directly from Supabase"
          >
            <RefreshCw class="w-3.5 h-3.5 text-secondary" :class="{ 'animate-spin': isSyncing }" />
            <span>{{ isSyncing ? 'Syncing Supabase…' : 'Sync Supabase' }}</span>
          </button>

          <select 
            v-model="selectedCourseFilter" 
            id="course-filter"
            class="bg-slate-50 dark:bg-dark-muted/70 border border-slate-200 dark:border-dark-outline rounded-xl px-3.5 py-2 text-xs font-mono text-slate-800 dark:text-white focus:outline-hidden focus:border-secondary shadow-2xs"
          >
            <option value="">All Courses</option>
            <option v-for="c in courses" :key="c.id" :value="c.id">{{ c.code }} — {{ c.name }}</option>
          </select>

          <select 
            v-model="selectedStatusFilter" 
            id="status-filter"
            class="bg-slate-50 dark:bg-dark-muted/70 border border-slate-200 dark:border-dark-outline rounded-xl px-3.5 py-2 text-xs font-mono text-slate-800 dark:text-white focus:outline-hidden focus:border-secondary shadow-2xs"
          >
            <option value="">All Statuses</option>
            <option value="present">Present</option>
            <option value="absent">Absent</option>
          </select>

          <button
            @click="isExportModalOpen = true"
            id="btn-export-attendance-admin"
            class="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-primary text-secondary dark:text-secondary border border-secondary/30 text-xs font-mono font-bold hover:opacity-90 active:scale-95 transition-all shadow-2xs cursor-pointer"
            title="Export lecture attendance to Excel (multi-sheet) or PDF"
          >
            <Download class="w-3.5 h-3.5" />
            <span>Export Lecture Register</span>
          </button>
        </div>
      </div>
    </div>

    <!-- Error Banner (if any) -->
    <div v-if="syncError" class="p-4 rounded-xl bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-800 text-rose-700 dark:text-rose-300 font-mono text-xs flex items-center justify-between">
      <span>{{ syncError }}</span>
      <button @click="fetchSupabaseDataDirectly" class="underline hover:no-underline font-bold ml-3 cursor-pointer">Retry</button>
    </div>

    <!-- KPI Grid -->
    <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      <!-- Total Students -->
      <div class="relative overflow-hidden rounded-2xl bg-white dark:bg-dark-surface border border-slate-200/80 dark:border-dark-outline/60 p-5 shadow-sm group hover:border-secondary/40 transition-all">
        <div class="flex items-center gap-4">
          <div class="w-12 h-12 rounded-xl bg-sky-50 dark:bg-sky-950/40 border border-sky-200/60 dark:border-sky-800/40 text-sky-600 dark:text-sky-400 flex items-center justify-center shrink-0">
            <Users class="w-6 h-6" />
          </div>
          <div class="min-w-0 flex-1">
            <p class="text-[11px] font-mono uppercase text-slate-500 dark:text-white/75 font-semibold tracking-wider">Enrolled Students</p>
            <h2 class="text-2xl font-black font-display text-slate-900 dark:text-white tracking-tight mt-0.5">
              {{ totalStudents }}
            </h2>
          </div>
        </div>
      </div>

      <!-- Overall Attendance Rate -->
      <div class="relative overflow-hidden rounded-2xl bg-white dark:bg-dark-surface border border-slate-200/80 dark:border-dark-outline/60 p-5 shadow-sm group hover:border-secondary/40 transition-all">
        <div class="flex items-center gap-4">
          <div class="w-12 h-12 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200/60 dark:border-emerald-800/40 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0">
            <Percent class="w-6 h-6" />
          </div>
          <div class="min-w-0 flex-1">
            <p class="text-[11px] font-mono uppercase text-slate-500 dark:text-white/75 font-semibold tracking-wider">Overall Rate</p>
            <h2 class="text-2xl font-black font-display text-emerald-600 dark:text-emerald-400 tracking-tight mt-0.5">
              {{ overallRate }}%
            </h2>
          </div>
        </div>
      </div>

      <!-- Total Sessions -->
      <div class="relative overflow-hidden rounded-2xl bg-white dark:bg-dark-surface border border-slate-200/80 dark:border-dark-outline/60 p-5 shadow-sm group hover:border-secondary/40 transition-all">
        <div class="flex items-center gap-4">
          <div class="w-12 h-12 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200/60 dark:border-amber-800/40 text-amber-600 dark:text-amber-400 flex items-center justify-center shrink-0">
            <Calendar class="w-6 h-6" />
          </div>
          <div class="min-w-0 flex-1">
            <p class="text-[11px] font-mono uppercase text-slate-500 dark:text-white/75 font-semibold tracking-wider">Total Sessions</p>
            <h2 class="text-2xl font-black font-display text-slate-900 dark:text-white tracking-tight mt-0.5">
              {{ sessions.length }}
            </h2>
          </div>
        </div>
      </div>

      <!-- Total Absences -->
      <div class="relative overflow-hidden rounded-2xl bg-white dark:bg-dark-surface border border-slate-200/80 dark:border-dark-outline/60 p-5 shadow-sm group hover:border-secondary/40 transition-all">
        <div class="flex items-center gap-4">
          <div class="w-12 h-12 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200/60 dark:border-rose-800/40 text-rose-600 dark:text-rose-400 flex items-center justify-center shrink-0">
            <UserX class="w-6 h-6" />
          </div>
          <div class="min-w-0 flex-1">
            <p class="text-[11px] font-mono uppercase text-slate-500 dark:text-white/75 font-semibold tracking-wider">Total Absences</p>
            <h2 class="text-2xl font-black font-display text-rose-500 tracking-tight mt-0.5">
              {{ totalAbsences }}
            </h2>
          </div>
        </div>
      </div>
    </div>

    <!-- ═══════════════════════════════════════════════════════════════════════ -->
    <!-- STUDENT ATTENDANCE DOSSIERS & DOWNLOAD QUEUE PANEL                      -->
    <!-- ═══════════════════════════════════════════════════════════════════════ -->
    <div class="relative overflow-hidden rounded-2xl bg-white dark:bg-dark-surface border border-slate-200/80 dark:border-dark-outline/60 shadow-sm space-y-5 p-5 sm:p-6">
      
      <!-- Panel Header & Switcher -->
      <div class="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-4 border-b border-slate-200/80 dark:border-dark-outline/60">
        <div>
          <div class="flex items-center gap-2">
            <div class="w-2.5 h-2.5 rounded-full bg-secondary"></div>
            <h2 class="text-base sm:text-lg font-bold font-display text-slate-900 dark:text-white">
              Student Attendance Dossiers &amp; Download Queue
            </h2>
          </div>
          <p class="text-xs font-mono text-slate-500 dark:text-white/75 mt-0.5">
            Direct Supabase records for each student, registered courses, attendance rates, and verifiable rollcall sessions
          </p>
        </div>

        <!-- View Switcher -->
        <div class="flex items-center gap-1.5 p-1 rounded-xl bg-slate-100 dark:bg-dark-muted border border-slate-200 dark:border-dark-outline text-xs font-mono">
          <button
            type="button"
            @click="studentViewMode = 'dossiers'"
            class="px-3 py-1.5 rounded-lg font-semibold transition-all cursor-pointer flex items-center gap-1.5"
            :class="studentViewMode === 'dossiers'
              ? 'bg-white dark:bg-dark-surface text-slate-900 dark:text-white shadow-2xs font-bold'
              : 'text-slate-500 hover:text-slate-800 dark:hover:text-white'"
          >
            <Layers class="w-3.5 h-3.5 text-secondary" />
            <span>Student Dossiers View</span>
          </button>

          <button
            type="button"
            @click="studentViewMode = 'matrix'"
            class="px-3 py-1.5 rounded-lg font-semibold transition-all cursor-pointer flex items-center gap-1.5"
            :class="studentViewMode === 'matrix'
              ? 'bg-white dark:bg-dark-surface text-slate-900 dark:text-white shadow-2xs font-bold'
              : 'text-slate-500 hover:text-slate-800 dark:hover:text-white'"
          >
            <BookOpen class="w-3.5 h-3.5 text-secondary" />
            <span>Course Matrix View</span>
          </button>
        </div>
      </div>

      <!-- Advanced Filter Toolbar -->
      <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-2.5">
        <!-- Search -->
        <div class="relative md:col-span-2">
          <Search class="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
          <input 
            v-model="studentSearch" 
            type="text" 
            placeholder="Search student name, ID, or course code…" 
            class="w-full pl-8 pr-3 py-2 bg-slate-50 dark:bg-dark-muted/70 border border-slate-200 dark:border-dark-outline rounded-xl text-xs font-mono text-slate-800 dark:text-white placeholder:text-slate-400 focus:outline-hidden focus:border-secondary shadow-2xs"
          />
        </div>

        <!-- Programme -->
        <select 
          v-model="studentProgramFilter" 
          class="bg-slate-50 dark:bg-dark-muted/70 border border-slate-200 dark:border-dark-outline rounded-xl px-3 py-2 text-xs font-mono text-slate-800 dark:text-white focus:outline-hidden focus:border-secondary shadow-2xs"
        >
          <option value="">All Programmes</option>
          <option v-for="p in programmes" :key="p.id" :value="p.id">{{ p.name }}</option>
        </select>

        <!-- Academic Level -->
        <select 
          v-model="studentLevelFilter" 
          class="bg-slate-50 dark:bg-dark-muted/70 border border-slate-200 dark:border-dark-outline rounded-xl px-3 py-2 text-xs font-mono text-slate-800 dark:text-white focus:outline-hidden focus:border-secondary shadow-2xs"
        >
          <option value="">All Levels</option>
          <option value="100">Level 100</option>
          <option value="200">Level 200</option>
          <option value="300">Level 300</option>
          <option value="400">Level 400</option>
          <option value="Postgraduate">Postgraduate</option>
          <option value="PhD">PhD</option>
        </select>

        <!-- Study Mode -->
        <select 
          v-model="studentModeFilter" 
          class="bg-slate-50 dark:bg-dark-muted/70 border border-slate-200 dark:border-dark-outline rounded-xl px-3 py-2 text-xs font-mono text-slate-800 dark:text-white focus:outline-hidden focus:border-secondary shadow-2xs"
        >
          <option value="">All Study Modes</option>
          <option value="Regular">Regular Mode</option>
          <option value="Weekend">Weekend Mode</option>
        </select>
      </div>

      <!-- Persistent / Floating Download Queue Action Bar -->
      <div 
        class="rounded-xl border transition-all p-3.5 sm:p-4 flex flex-col md:flex-row md:items-center justify-between gap-3 shadow-2xs"
        :class="queuedStudentIds.size > 0 
          ? 'bg-secondary/10 border-secondary/40 text-slate-900 dark:text-white' 
          : 'bg-slate-50 dark:bg-dark-muted/30 border-slate-200/80 dark:border-dark-outline/50 text-slate-600 dark:text-white/70'"
      >
        <div class="flex items-center gap-3">
          <button
            type="button"
            @click="toggleSelectAllFiltered"
            class="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border text-xs font-mono font-semibold transition-all cursor-pointer"
            :class="isAllFilteredQueued 
              ? 'bg-primary text-secondary border-secondary/40' 
              : 'bg-white dark:bg-dark-surface border-slate-200 dark:border-dark-outline text-slate-700 dark:text-white hover:border-secondary'"
          >
            <CheckSquare v-if="isAllFilteredQueued" class="w-3.5 h-3.5 text-secondary" />
            <Square v-else class="w-3.5 h-3.5 text-slate-400" />
            <span>{{ isAllFilteredQueued ? 'Deselect All' : 'Select All Filtered' }}</span>
          </button>

          <div class="text-xs font-mono flex items-center gap-2">
            <span class="w-2 h-2 rounded-full" :class="queuedStudentIds.size > 0 ? 'bg-emerald-500 animate-pulse' : 'bg-slate-400'"></span>
            <span>Download Queue:</span>
            <strong class="px-2 py-0.5 rounded-md font-bold" :class="queuedStudentIds.size > 0 ? 'bg-secondary text-primary font-mono' : 'bg-slate-200 dark:bg-dark-muted text-slate-700 dark:text-white'">
              {{ queuedStudentIds.size }} Student{{ queuedStudentIds.size === 1 ? '' : 's' }}
            </strong>
            <span class="text-slate-400 hidden sm:inline">({{ filteredStudentDossiers.length }} matching filters)</span>
          </div>
        </div>

        <div class="flex flex-wrap items-center gap-2">
          <!-- Download Queued PDF -->
          <button
            type="button"
            :disabled="queuedStudentIds.size === 0"
            @click="downloadQueuedPdf"
            class="px-3.5 py-2 rounded-xl bg-primary text-secondary dark:text-secondary border border-secondary/30 text-xs font-mono font-bold flex items-center gap-2 hover:opacity-90 active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed transition-all shadow-2xs cursor-pointer"
            title="Download printable official attendance dossiers for all queued students"
          >
            <Printer class="w-3.5 h-3.5" />
            <span>Download PDF Dossiers ({{ queuedStudentIds.size }})</span>
          </button>

          <!-- Download Queued Excel -->
          <button
            type="button"
            :disabled="queuedStudentIds.size === 0"
            @click="downloadQueuedExcel"
            class="px-3.5 py-2 rounded-xl bg-emerald-600 text-white text-xs font-mono font-bold flex items-center gap-2 hover:bg-emerald-700 active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed transition-all shadow-2xs cursor-pointer"
            title="Download multi-sheet Excel workbook with student courses and session records"
          >
            <FileSpreadsheet class="w-3.5 h-3.5" />
            <span>Download Excel (.xls)</span>
          </button>

          <!-- Clear Queue -->
          <button
            v-if="queuedStudentIds.size > 0"
            type="button"
            @click="clearQueue"
            class="px-2.5 py-2 rounded-xl border border-slate-200 dark:border-dark-outline hover:bg-rose-50 dark:hover:bg-rose-950/20 text-slate-500 hover:text-rose-600 transition-colors text-xs font-mono cursor-pointer"
            title="Clear download queue"
          >
            <Trash2 class="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      <!-- ─── DOSSIERS CARDS VIEW (DEFAULT) ────────────────────────────────── -->
      <div v-if="studentViewMode === 'dossiers'" class="space-y-4">
        <!-- Empty State -->
        <div v-if="paginatedStudentDossiers.length === 0" class="p-12 text-center bg-slate-50 dark:bg-dark-muted/20 rounded-2xl border border-dashed border-slate-200 dark:border-dark-outline font-mono text-xs text-slate-400">
          No students match the selected filters or search criteria.
        </div>

        <!-- Cards Grid -->
        <div v-else class="space-y-3.5">
          <div 
            v-for="st in paginatedStudentDossiers" 
            :key="st.id"
            class="rounded-2xl border transition-all p-4 sm:p-5 bg-white dark:bg-dark-surface shadow-2xs hover:shadow-xs"
            :class="queuedStudentIds.has(st.id) 
              ? 'border-secondary/60 ring-1 ring-secondary/40' 
              : 'border-slate-200/80 dark:border-dark-outline/70'"
          >
            <div class="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
              
              <!-- Left: Student Info & Checkbox -->
              <div class="flex items-start sm:items-center gap-3.5">
                <input
                  type="checkbox"
                  :checked="queuedStudentIds.has(st.id)"
                  @change="toggleQueueStudent(st.id)"
                  class="mt-1 sm:mt-0 w-4 h-4 rounded-md accent-secondary border-slate-300 text-secondary focus:ring-secondary cursor-pointer"
                />

                <div class="w-10 h-10 rounded-xl bg-primary text-secondary flex items-center justify-center font-display font-black text-sm shrink-0">
                  {{ (st.name || 'S').charAt(0).toUpperCase() }}
                </div>

                <div>
                  <div class="flex flex-wrap items-center gap-2">
                    <span class="font-bold font-display text-slate-900 dark:text-white text-sm">
                      {{ st.name }}
                    </span>
                    <span class="px-2 py-0.5 rounded-md font-mono text-[11px] font-bold bg-slate-100 dark:bg-dark-muted text-slate-700 dark:text-white">
                      {{ st.studentId }}
                    </span>
                    <span 
                      class="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold uppercase tracking-wider"
                      :class="st.mode === 'Weekend' ? 'bg-purple-500/10 text-purple-600 border border-purple-500/20' : 'bg-sky-500/10 text-sky-600 border border-sky-500/20'"
                    >
                      {{ st.mode }}
                    </span>
                    <span 
                      class="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold uppercase tracking-wider"
                      :class="st.overallStanding.includes('Ineligible') ? 'bg-rose-500/10 text-rose-600 border border-rose-500/20' : (st.overallStanding === 'At Risk' ? 'bg-amber-500/10 text-amber-600 border border-amber-500/20' : 'bg-emerald-500/10 text-emerald-600 border border-emerald-500/20')"
                    >
                      {{ st.overallStanding }}
                    </span>
                  </div>

                  <div class="text-xs font-mono text-slate-500 dark:text-white/60 mt-1 flex flex-wrap items-center gap-x-2">
                    <span>{{ st.programme }}</span>
                    <span>•</span>
                    <span>Level {{ st.level }}</span>
                    <span>•</span>
                    <span>Registered for <strong>{{ st.totalCourses }}</strong> course{{ st.totalCourses === 1 ? '' : 's' }}</span>
                  </div>
                </div>
              </div>

              <!-- Right: Performance & Action Buttons -->
              <div class="flex flex-wrap items-center justify-between lg:justify-end gap-3 self-stretch lg:self-center pt-3 lg:pt-0 border-t lg:border-t-0 border-slate-100 dark:border-dark-outline/40">
                <!-- Cumulative Rate Display -->
                <div class="text-right">
                  <div class="text-xs font-mono text-slate-500 dark:text-white/60">Overall Turnout</div>
                  <div class="flex items-center gap-2">
                    <span class="text-base font-black font-mono" :style="{ color: rateColor(st.overallRate) }">
                      {{ st.overallRate }}%
                    </span>
                    <span class="text-xs font-mono text-slate-400">
                      ({{ st.cumulativePresent }}/{{ st.cumulativeSessionsHeld }})
                    </span>
                  </div>
                </div>

                <!-- Action Buttons -->
                <div class="flex items-center gap-1.5">
                  <button
                    type="button"
                    @click="openDossierModal(st)"
                    class="px-3 py-1.5 rounded-xl border border-slate-200 dark:border-dark-outline bg-white dark:bg-dark-muted hover:border-secondary text-slate-700 dark:text-white text-xs font-mono font-semibold flex items-center gap-1.5 transition-all cursor-pointer shadow-2xs"
                    title="View full course breakdown and session records"
                  >
                    <Eye class="w-3.5 h-3.5 text-secondary" />
                    <span>View Dossier</span>
                  </button>

                  <button
                    type="button"
                    @click="exportSingleStudentPdf(st)"
                    class="px-2.5 py-1.5 rounded-xl border border-slate-200 dark:border-dark-outline hover:bg-slate-100 dark:hover:bg-dark-muted text-slate-700 dark:text-white text-xs font-mono font-medium transition-all cursor-pointer"
                    title="Print / Save single student PDF"
                  >
                    <Printer class="w-3.5 h-3.5 text-rose-500" />
                  </button>

                  <button
                    type="button"
                    @click="exportSingleStudentExcel(st)"
                    class="px-2.5 py-1.5 rounded-xl border border-slate-200 dark:border-dark-outline hover:bg-slate-100 dark:hover:bg-dark-muted text-slate-700 dark:text-white text-xs font-mono font-medium transition-all cursor-pointer"
                    title="Download single student Excel workbook"
                  >
                    <FileSpreadsheet class="w-3.5 h-3.5 text-emerald-600" />
                  </button>

                  <button
                    type="button"
                    @click="toggleQueueStudent(st.id)"
                    class="px-3 py-1.5 rounded-xl border text-xs font-mono font-semibold transition-all cursor-pointer flex items-center gap-1"
                    :class="queuedStudentIds.has(st.id) 
                      ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-600 dark:text-emerald-400' 
                      : 'border-slate-200 dark:border-dark-outline hover:border-secondary text-slate-600 dark:text-white'"
                  >
                    <Check v-if="queuedStudentIds.has(st.id)" class="w-3 h-3" />
                    <Plus v-else class="w-3 h-3" />
                    <span>{{ queuedStudentIds.has(st.id) ? 'Queued' : 'Queue' }}</span>
                  </button>
                </div>
              </div>
            </div>

            <!-- Registered Courses Inline Badges -->
            <div class="mt-3.5 pt-3 border-t border-slate-100 dark:border-dark-outline/40">
              <div class="text-[11px] font-mono text-slate-400 mb-2 uppercase font-semibold">Registered Modules ({{ st.courses.length }}):</div>
              <div v-if="st.courses.length === 0" class="text-xs font-mono text-slate-400 italic">
                No courses enrolled.
              </div>
              <div v-else class="flex flex-wrap gap-2">
                <div 
                  v-for="c in st.courses" 
                  :key="c.courseId"
                  @click="openDossierModal(st)"
                  class="px-2.5 py-1 rounded-lg border text-xs font-mono flex items-center gap-1.5 transition-all hover:border-secondary cursor-pointer"
                  :class="c.rate >= 75 
                    ? 'bg-emerald-50/50 dark:bg-emerald-950/20 border-emerald-200 dark:border-emerald-800/40 text-emerald-800 dark:text-emerald-300' 
                    : (c.rate >= 60 
                      ? 'bg-amber-50/50 dark:bg-amber-950/20 border-amber-200 dark:border-amber-800/40 text-amber-800 dark:text-amber-300' 
                      : 'bg-rose-50/50 dark:bg-rose-950/20 border-rose-200 dark:border-rose-800/40 text-rose-800 dark:text-rose-300')"
                >
                  <span class="font-bold">{{ c.code }}</span>
                  <span class="text-[10px] opacity-75">({{ c.present }}/{{ c.sessionsHeld }})</span>
                  <span class="font-bold text-[11px]">{{ c.rate !== null ? c.rate + '%' : 'N/A' }}</span>
                </div>
              </div>
            </div>

          </div>
        </div>

        <!-- Dossiers Pagination -->
        <div v-if="studentDossierTotalPages > 1" class="flex items-center justify-between gap-4 pt-3 border-t border-slate-200/80 dark:border-dark-outline/60 text-xs font-mono">
          <button 
            :disabled="studentDossierPage === 1" 
            @click="studentDossierPage--" 
            class="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-200 dark:border-dark-outline bg-white dark:bg-dark-muted text-slate-700 dark:text-white/90 disabled:opacity-40 disabled:cursor-not-allowed hover:border-secondary transition-colors cursor-pointer"
          >
            <ChevronLeft class="w-3.5 h-3.5" />
            <span>Previous</span>
          </button>

          <span class="text-slate-500 dark:text-white/75">
            Page <strong class="text-slate-800 dark:text-white">{{ studentDossierPage }}</strong> of <strong class="text-slate-800 dark:text-white">{{ studentDossierTotalPages }}</strong> ({{ filteredStudentDossiers.length }} Total)
          </span>

          <button 
            :disabled="studentDossierPage === studentDossierTotalPages" 
            @click="studentDossierPage++" 
            class="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-200 dark:border-dark-outline bg-white dark:bg-dark-muted text-slate-700 dark:text-white/90 disabled:opacity-40 disabled:cursor-not-allowed hover:border-secondary transition-colors cursor-pointer"
          >
            <span>Next</span>
            <ChevronRight class="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      <!-- ─── COURSE MATRIX VIEW (TABULAR) ─────────────────────────────────── -->
      <div v-else class="space-y-4">
        <div class="overflow-x-auto">
          <table class="w-full text-xs text-left text-slate-600 dark:text-white/75" id="student-breakdown-table">
            <thead class="text-[11px] font-mono uppercase bg-slate-50/80 dark:bg-slate-900/50 text-slate-500 dark:text-white/75 border-b border-slate-200/80 dark:border-dark-outline/60">
              <tr>
                <th scope="col" class="px-5 py-3.5">Student</th>
                <th scope="col" class="px-5 py-3.5">Student ID</th>
                <th scope="col" class="px-5 py-3.5">Programme</th>
                <th scope="col" class="px-5 py-3.5">Course</th>
                <th scope="col" class="px-5 py-3.5">Sessions</th>
                <th scope="col" class="px-5 py-3.5">Present</th>
                <th scope="col" class="px-5 py-3.5">Absent</th>
                <th scope="col" class="px-5 py-3.5">Rate</th>
                <th scope="col" class="px-5 py-3.5 w-28">Rate Bar</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-slate-100 dark:divide-slate-800/60">
              <tr v-if="filteredStudentBreakdown.length === 0">
                <td colspan="9" class="px-5 py-10 text-center text-xs font-mono text-slate-400 dark:text-white/50">
                  No data matches your filters.
                </td>
              </tr>
              <tr 
                v-for="row in paginatedStudentBreakdown" 
                :key="row.key"
                class="hover:bg-slate-50/70 dark:hover:bg-slate-900/30 transition-colors"
              >
                <td class="px-5 py-4 font-semibold text-slate-800 dark:text-white">
                  {{ row.studentName }}
                </td>
                <td class="px-5 py-4 font-mono font-medium text-slate-700 dark:text-white/90">
                  {{ row.idNumber }}
                </td>
                <td class="px-5 py-4 text-slate-500 dark:text-white/75 truncate max-w-[150px]">
                  {{ row.programmeName }}
                </td>
                <td class="px-5 py-4 font-medium text-slate-800 dark:text-white">
                  {{ row.courseName }}
                </td>
                <td class="px-5 py-4 font-mono font-medium text-slate-700 dark:text-white/90">
                  {{ row.sessionCount }}
                </td>
                <td class="px-5 py-4 font-mono font-bold text-emerald-600 dark:text-emerald-400">
                  {{ row.present }}
                </td>
                <td class="px-5 py-4 font-mono font-bold text-rose-500">
                  {{ row.absent }}
                </td>
                <td class="px-5 py-4">
                  <span 
                    class="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-mono font-bold"
                    :class="row.rate >= 75 
                      ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20' 
                      : row.rate >= 50 
                        ? 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20' 
                        : 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20'"
                  >
                    {{ row.rate }}%
                  </span>
                </td>
                <td class="px-5 py-4">
                  <div class="w-full h-1.5 bg-slate-100 dark:bg-dark-muted rounded-full overflow-hidden">
                    <div 
                      class="h-full rounded-full transition-all duration-500" 
                      :style="{ width: row.rate + '%', backgroundColor: rateColor(row.rate) }"
                    ></div>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <!-- Matrix Pagination -->
        <div v-if="studentTotalPages > 1" class="flex items-center justify-between gap-4 p-4 border-t border-slate-200/80 dark:border-dark-outline/60 text-xs font-mono">
          <button 
            :disabled="studentPage === 1" 
            @click="studentPage--" 
            class="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-200 dark:border-dark-outline bg-white dark:bg-dark-muted text-slate-700 dark:text-white/90 disabled:opacity-40 disabled:cursor-not-allowed hover:border-secondary transition-colors cursor-pointer"
          >
            <ChevronLeft class="w-3.5 h-3.5" />
            <span>Previous</span>
          </button>

          <span class="text-slate-500 dark:text-white/75">
            Page <strong class="text-slate-800 dark:text-white">{{ studentPage }}</strong> of <strong class="text-slate-800 dark:text-white">{{ studentTotalPages }}</strong>
          </span>

          <button 
            :disabled="studentPage === studentTotalPages" 
            @click="studentPage++" 
            class="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-200 dark:border-dark-outline bg-white dark:bg-dark-muted text-slate-700 dark:text-white/90 disabled:opacity-40 disabled:cursor-not-allowed hover:border-secondary transition-colors cursor-pointer"
          >
            <span>Next</span>
            <ChevronRight class="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

    </div>

    <!-- Course Breakdown Table Panel -->
    <div class="relative overflow-hidden rounded-2xl bg-white dark:bg-dark-surface border border-slate-200/80 dark:border-dark-outline/60 shadow-sm">
      <div class="flex items-center justify-between gap-4 p-5 sm:p-6 border-b border-slate-200/80 dark:border-dark-outline/60">
        <div>
          <h2 class="text-base font-bold font-display text-slate-900 dark:text-white">Per-Course Attendance Breakdown</h2>
          <p class="text-xs font-mono text-slate-500 dark:text-white/75 mt-0.5">Aggregated rollcall performance grouped by course module</p>
        </div>
      </div>

      <div class="overflow-x-auto">
        <table class="w-full text-xs text-left text-slate-600 dark:text-white/75" id="course-breakdown-table">
          <thead class="text-[11px] font-mono uppercase bg-slate-50/80 dark:bg-slate-900/50 text-slate-500 dark:text-white/75 border-b border-slate-200/80 dark:border-dark-outline/60">
            <tr>
              <th scope="col" class="px-5 py-3.5">Course</th>
              <th scope="col" class="px-5 py-3.5">Sessions</th>
              <th scope="col" class="px-5 py-3.5">Present</th>
              <th scope="col" class="px-5 py-3.5">Absent</th>
              <th scope="col" class="px-5 py-3.5">Attendance Rate</th>
              <th scope="col" class="px-5 py-3.5 w-32">Rate Bar</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-slate-100 dark:divide-slate-800/60">
            <tr v-if="courseBreakdown.length === 0">
              <td colspan="6" class="px-5 py-10 text-center text-xs font-mono text-slate-400 dark:text-white/50">
                No data available.
              </td>
            </tr>
            <tr 
              v-for="row in courseBreakdown" 
              :key="row.courseId"
              class="hover:bg-slate-50/70 dark:hover:bg-slate-900/30 transition-colors"
            >
              <td class="px-5 py-4 font-semibold text-slate-800 dark:text-white">
                {{ row.courseName }}
              </td>
              <td class="px-5 py-4 font-mono font-medium text-slate-700 dark:text-white/90">
                {{ row.sessionCount }}
              </td>
              <td class="px-5 py-4 font-mono font-bold text-emerald-600 dark:text-emerald-400">
                {{ row.present }}
              </td>
              <td class="px-5 py-4 font-mono font-bold text-rose-500">
                {{ row.absent }}
              </td>
              <td class="px-5 py-4">
                <span 
                  class="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-mono font-bold"
                  :class="row.rate >= 75 
                    ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20' 
                    : row.rate >= 50 
                      ? 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20' 
                      : 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20'"
                >
                  {{ row.rate }}%
                </span>
              </td>
              <td class="px-5 py-4">
                <div class="w-full h-1.5 bg-slate-100 dark:bg-dark-muted rounded-full overflow-hidden">
                  <div 
                    class="h-full rounded-full transition-all duration-500" 
                    :style="{ width: row.rate + '%', backgroundColor: rateColor(row.rate) }"
                  ></div>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- Attendance Records Panel -->
    <div class="relative overflow-hidden rounded-2xl bg-white dark:bg-dark-surface border border-slate-200/80 dark:border-dark-outline/60 shadow-sm">
      <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 sm:p-6 border-b border-slate-200/80 dark:border-dark-outline/60">
        <div>
          <h2 class="text-base font-bold font-display text-slate-900 dark:text-white">Individual Attendance Records</h2>
          <p class="text-xs font-mono text-slate-500 dark:text-white/75 mt-0.5">Chronological audit ledger of all student check-in transactions</p>
        </div>

        <div class="relative min-w-[240px]">
          <Search class="w-3.5 h-3.5 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
          <input 
            v-model="searchQuery" 
            type="text" 
            placeholder="Search name, ID, or course…" 
            id="attendance-search"
            class="w-full pl-9 pr-4 py-1.5 bg-slate-50 dark:bg-dark-muted/70 border border-slate-200 dark:border-dark-outline rounded-xl text-xs font-mono text-slate-800 dark:text-white placeholder:text-slate-400 focus:outline-hidden focus:border-secondary shadow-2xs"
          />
        </div>
      </div>

      <div class="overflow-x-auto">
        <table class="w-full text-xs text-left text-slate-600 dark:text-white/75" id="attendance-records-table">
          <thead class="text-[11px] font-mono uppercase bg-slate-50/80 dark:bg-slate-900/50 text-slate-500 dark:text-white/75 border-b border-slate-200/80 dark:border-dark-outline/60">
            <tr>
              <th scope="col" class="px-5 py-3.5">Student</th>
              <th scope="col" class="px-5 py-3.5">Student ID</th>
              <th scope="col" class="px-5 py-3.5">Course</th>
              <th scope="col" class="px-5 py-3.5">Session Date</th>
              <th scope="col" class="px-5 py-3.5">Status</th>
              <th scope="col" class="px-5 py-3.5">Recorded At</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-slate-100 dark:divide-slate-800/60">
            <tr v-if="filteredAttendances.length === 0">
              <td colspan="6" class="px-5 py-10 text-center text-xs font-mono text-slate-400 dark:text-white/50">
                No records match your filters.
              </td>
            </tr>
            <tr 
              v-for="rec in paginatedAttendances" 
              :key="rec.id"
              class="hover:bg-slate-50/70 dark:hover:bg-slate-900/30 transition-colors"
            >
              <td class="px-5 py-4 font-semibold text-slate-800 dark:text-white">
                {{ rec.studentName }}
              </td>
              <td class="px-5 py-4 font-mono font-medium text-slate-700 dark:text-white/90">
                {{ rec.idNumber }}
              </td>
              <td class="px-5 py-4 font-medium text-slate-800 dark:text-white">
                {{ rec.courseName }}
              </td>
              <td class="px-5 py-4 font-mono text-slate-600 dark:text-white/75">
                {{ rec.sessionDate }}
              </td>
              <td class="px-5 py-4">
                <span 
                  class="inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold uppercase tracking-wider"
                  :class="rec.status === 'present' 
                    ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20' 
                    : 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20'"
                >
                  {{ rec.status }}
                </span>
              </td>
              <td class="px-5 py-4 font-mono text-slate-400 dark:text-white/50">
                {{ rec.recordedAt }}
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- Pagination -->
      <div v-if="totalPages > 1" class="flex items-center justify-between gap-4 p-4 sm:p-5 border-t border-slate-200/80 dark:border-dark-outline/60 text-xs font-mono">
        <button 
          :disabled="currentPage === 1" 
          @click="currentPage--" 
          id="prev-page-btn"
          class="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-200 dark:border-dark-outline bg-white dark:bg-dark-muted text-slate-700 dark:text-white/90 disabled:opacity-40 disabled:cursor-not-allowed hover:border-secondary transition-colors cursor-pointer"
        >
          <ChevronLeft class="w-3.5 h-3.5" />
          <span>Previous</span>
        </button>

        <span class="text-slate-500 dark:text-white/75">
          Page <strong class="text-slate-800 dark:text-white">{{ currentPage }}</strong> of <strong class="text-slate-800 dark:text-white">{{ totalPages }}</strong>
        </span>

        <button 
          :disabled="currentPage === totalPages" 
          @click="currentPage++" 
          id="next-page-btn"
          class="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-200 dark:border-dark-outline bg-white dark:bg-dark-muted text-slate-700 dark:text-white/90 disabled:opacity-40 disabled:cursor-not-allowed hover:border-secondary transition-colors cursor-pointer"
        >
          <span>Next</span>
          <ChevronRight class="w-3.5 h-3.5" />
        </button>
      </div>
    </div>

    <!-- Attendance Export Modal (Course Lecture Scope) -->
    <AttendanceExportModal
      :is-open="isExportModalOpen"
      :courses="courses"
      :initial-course-id="selectedCourseFilter"
      @close="isExportModalOpen = false"
    />

    <!-- Student Attendance Dossier Modal -->
    <StudentAttendanceDossierModal
      :is-open="isDossierModalOpen"
      :dossier="activeDossier"
      :is-queued="activeDossier && queuedStudentIds.has(activeDossier.id)"
      @close="isDossierModalOpen = false"
      @toggle-queue="toggleQueueStudent"
    />
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted, watch } from 'vue';
import { supabase } from '@/stores/supabase';
import AttendanceExportModal from '@/components/AttendanceExportModal.vue';
import StudentAttendanceDossierModal from '@/components/StudentAttendanceDossierModal.vue';
import { 
  buildStudentDossier, 
  exportStudentsAttendanceToPdf, 
  exportStudentsAttendanceToExcel 
} from '@/utils/studentAttendanceExport.js';
import {
  Users,
  Percent,
  Calendar,
  UserX,
  BarChart2,
  Search,
  ChevronLeft,
  ChevronRight,
  Download,
  Printer,
  FileSpreadsheet,
  Check,
  Plus,
  Eye,
  BookOpen,
  Layers,
  CheckSquare,
  Square,
  Trash2,
  RefreshCw
} from 'lucide-vue-next';

// ─── Direct Supabase Reactive State ──────────────────────────────────────────
const courses = ref([]);
const sessions = ref([]);
const attendances = ref([]);
const enrollments = ref([]);
const programmes = ref([]);
const userMap = ref({});

const isSyncing = ref(false);
const syncError = ref('');

const isExportModalOpen = ref(false);
const isDossierModalOpen = ref(false);
const activeDossier = ref(null);

// View switch: 'dossiers' | 'matrix'
const studentViewMode = ref('dossiers');

// General Filters
const selectedCourseFilter = ref('');
const selectedStatusFilter = ref('');
const searchQuery = ref('');
const currentPage = ref(1);
const pageSize = 15;

// Student breakdown & queue filters
const studentProgramFilter = ref('');
const studentLevelFilter = ref('');
const studentModeFilter = ref('');
const studentSearch = ref('');
const studentPage = ref(1);
const studentPageSize = 20;

const studentDossierPage = ref(1);
const studentDossierPageSize = ref(12);

// Queued student IDs
const queuedStudentIds = ref(new Set());

// ─── Fetch All Data Directly From Supabase ───────────────────────────────────
async function fetchSupabaseDataDirectly() {
  isSyncing.value = true;
  syncError.value = '';

  try {
    const [
      { data: rawUsers, error: uErr },
      { data: rawCourses, error: cErr },
      { data: rawEnrollments, error: eErr },
      { data: rawSessions, error: sErr },
      { data: rawAttendances, error: aErr },
      { data: rawProgrammes, error: pErr },
    ] = await Promise.all([
      supabase
        .from('users')
        .select('id, name, email, role, faculty, program_id, level, mode, id_number')
        .order('name'),
      supabase
        .from('courses')
        .select('id, code, name, credits, semester, level, program_id, status')
        .order('code'),
      supabase
        .from('enrollments')
        .select('id, student_id, course_id, created_at'),
      supabase
        .from('sessions')
        .select('id, course_id, lecturer_id, mode, date, pin, is_active, created_at')
        .order('created_at', { ascending: false }),
      supabase
        .from('attendances')
        .select('id, session_id, student_id, status, timestamp')
        .order('timestamp', { ascending: false }),
      supabase
        .from('programmes')
        .select('id, name, slug, level, degree_abbreviation')
        .order('name'),
    ]);

    if (uErr) console.warn('Supabase users warning:', uErr.message);
    if (cErr) console.warn('Supabase courses warning:', cErr.message);
    if (eErr) console.warn('Supabase enrollments warning:', eErr.message);
    if (sErr) console.warn('Supabase sessions warning:', sErr.message);
    if (aErr) console.warn('Supabase attendances warning:', aErr.message);
    if (pErr) console.warn('Supabase programmes warning:', pErr.message);

    // Map courses directly
    courses.value = (rawCourses || []).map(c => ({
      id: c.id,
      code: c.code || '—',
      name: c.name || '—',
      credits: c.credits ?? 3,
      semester: c.semester || 'Semester 1',
      level: c.level || '100',
      programId: c.program_id,
      status: c.status || 'active',
    }));

    // Map enrollments directly
    enrollments.value = (rawEnrollments || []).map(e => ({
      id: e.id,
      studentId: e.student_id,
      courseId: e.course_id,
      createdAt: e.created_at,
    }));

    // Map sessions directly
    sessions.value = (rawSessions || []).map(s => ({
      id: s.id,
      courseId: s.course_id,
      lecturerId: s.lecturer_id,
      mode: (s.mode || 'Regular').trim(),
      date: s.date,
      pin: s.pin || '—',
      isActive: s.is_active ?? true,
      createdAt: s.created_at,
    }));

    // Map attendances directly
    attendances.value = (rawAttendances || []).map(a => ({
      id: a.id,
      sessionId: a.session_id,
      studentId: a.student_id,
      status: a.status ?? 'present',
      timestamp: a.timestamp,
    }));

    // Map programmes directly
    programmes.value = (rawProgrammes || []).map(p => ({
      id: p.id,
      name: p.name || '—',
      slug: p.slug,
      level: p.level,
      degreeAbbreviation: p.degree_abbreviation,
    }));

    // Map users directly
    const nextUserMap = {};
    (rawUsers || []).forEach(u => {
      nextUserMap[u.id] = {
        id: u.id,
        idNumber: u.id_number || '—',
        name: u.name || '—',
        email: u.email || '—',
        programId: u.program_id ?? null,
        faculty: u.faculty || '—',
        level: u.level || '100',
        mode: (u.mode || 'Regular').trim(),
        role: u.role || 'Student',
      };
    });
    userMap.value = nextUserMap;
  } catch (err) {
    console.error('Failed to fetch from Supabase:', err);
    syncError.value = err.message || 'Failed to connect to Supabase';
  } finally {
    isSyncing.value = false;
  }
}

// ─── Realtime Subscriptions Directly From Supabase ───────────────────────────
let realtimeChannels = [];

function setupRealtimeSubscriptions() {
  realtimeChannels.forEach(ch => supabase.removeChannel(ch));
  realtimeChannels = [];

  const attChannel = supabase
    .channel('analytics-direct-attendances')
    .on('postgres_changes', { event: '*', schema: 'public', table: 'attendances' }, (payload) => {
      if (payload.eventType === 'INSERT') {
        const item = {
          id: payload.new.id,
          sessionId: payload.new.session_id,
          studentId: payload.new.student_id,
          status: payload.new.status ?? 'present',
          timestamp: payload.new.timestamp,
        };
        if (!attendances.value.some(a => a.id === item.id)) {
          attendances.value.unshift(item);
        }
      } else if (payload.eventType === 'UPDATE') {
        const idx = attendances.value.findIndex(a => a.id === payload.new.id);
        if (idx !== -1) {
          attendances.value[idx] = {
            id: payload.new.id,
            sessionId: payload.new.session_id,
            studentId: payload.new.student_id,
            status: payload.new.status ?? 'present',
            timestamp: payload.new.timestamp,
          };
        }
      } else if (payload.eventType === 'DELETE') {
        attendances.value = attendances.value.filter(a => a.id !== payload.old.id);
      }
    })
    .subscribe();

  const sessChannel = supabase
    .channel('analytics-direct-sessions')
    .on('postgres_changes', { event: '*', schema: 'public', table: 'sessions' }, (payload) => {
      if (payload.eventType === 'INSERT') {
        const item = {
          id: payload.new.id,
          courseId: payload.new.course_id,
          lecturerId: payload.new.lecturer_id,
          mode: (payload.new.mode || 'Regular').trim(),
          date: payload.new.date,
          pin: payload.new.pin || '—',
          isActive: payload.new.is_active ?? true,
          createdAt: payload.new.created_at,
        };
        if (!sessions.value.some(s => s.id === item.id)) {
          sessions.value.unshift(item);
        }
      } else if (payload.eventType === 'UPDATE') {
        const idx = sessions.value.findIndex(s => s.id === payload.new.id);
        if (idx !== -1) {
          sessions.value[idx] = {
            id: payload.new.id,
            courseId: payload.new.course_id,
            lecturerId: payload.new.lecturer_id,
            mode: (payload.new.mode || 'Regular').trim(),
            date: payload.new.date,
            pin: payload.new.pin || '—',
            isActive: payload.new.is_active ?? true,
            createdAt: payload.new.created_at,
          };
        }
      } else if (payload.eventType === 'DELETE') {
        sessions.value = sessions.value.filter(s => s.id !== payload.old.id);
      }
    })
    .subscribe();

  const enrChannel = supabase
    .channel('analytics-direct-enrollments')
    .on('postgres_changes', { event: '*', schema: 'public', table: 'enrollments' }, (payload) => {
      if (payload.eventType === 'INSERT') {
        const item = {
          id: payload.new.id,
          studentId: payload.new.student_id,
          courseId: payload.new.course_id,
          createdAt: payload.new.created_at,
        };
        if (!enrollments.value.some(e => e.id === item.id)) {
          enrollments.value.unshift(item);
        }
      } else if (payload.eventType === 'DELETE') {
        enrollments.value = enrollments.value.filter(e => e.id !== payload.old.id);
      }
    })
    .subscribe();

  realtimeChannels = [attChannel, sessChannel, enrChannel];
}

onMounted(async () => {
  await fetchSupabaseDataDirectly();
  setupRealtimeSubscriptions();
});

onUnmounted(() => {
  realtimeChannels.forEach(ch => supabase.removeChannel(ch));
  realtimeChannels = [];
});

// Reset pages when filters change
watch([selectedCourseFilter, selectedStatusFilter, searchQuery], () => {
  currentPage.value = 1;
});
watch([studentProgramFilter, studentLevelFilter, studentModeFilter, studentSearch], () => {
  studentPage.value = 1;
  studentDossierPage.value = 1;
});

// ─── KPIs ────────────────────────────────────────────────────────────────────

const totalStudents = computed(() => new Set(enrollments.value.map(e => e.studentId)).size);

const totalAbsences = computed(() => attendances.value.filter(a => a.status === 'absent').length);

const overallRate = computed(() => {
  const total = attendances.value.length;
  if (total === 0) return 0;
  const present = attendances.value.filter(a => a.status === 'present').length;
  return Math.round((present / total) * 100);
});

// ─── Course Breakdown ─────────────────────────────────────────────────────────

const courseBreakdown = computed(() => {
  return courses.value.map(course => {
    const courseSessions = sessions.value.filter(s => s.courseId === course.id);
    const sessionIds = new Set(courseSessions.map(s => s.id));
    const courseAttendances = attendances.value.filter(a => sessionIds.has(a.sessionId));
    const present = courseAttendances.filter(a => a.status === 'present').length;
    const absent  = courseAttendances.filter(a => a.status === 'absent').length;
    const total   = courseAttendances.length;
    const rate    = total > 0 ? Math.round((present / total) * 100) : 0;
    return {
      courseId: course.id,
      courseName: course.name ? `${course.code ? course.code + ' — ' : ''}${course.name}` : (course.code || 'Unknown'),
      sessionCount: courseSessions.length,
      present,
      absent,
      rate,
    };
  }).filter(r => selectedCourseFilter.value === '' || r.courseId === selectedCourseFilter.value);
});

// ─── Student Full Attendance Dossiers ─────────────────────────────────────────

const allStudentDossiers = computed(() => {
  const enrolledStudentIds = new Set(enrollments.value.map(e => e.studentId));
  const studentUserIds = Object.keys(userMap.value).filter(id => userMap.value[id]?.role === 'Student');
  const allIds = new Set([...enrolledStudentIds, ...studentUserIds]);

  return Array.from(allIds).map(id => {
    const studentUser = userMap.value[id] || { id, name: 'Student', idNumber: '—', mode: 'Regular', level: '100' };
    return buildStudentDossier(studentUser, {
      enrollments: enrollments.value,
      courses: courses.value,
      sessions: sessions.value,
      attendances: attendances.value,
      programmes: programmes.value,
    });
  });
});

const filteredStudentDossiers = computed(() => {
  let list = allStudentDossiers.value;

  if (studentProgramFilter.value) {
    const prog = programmes.value.find(p => p.id === studentProgramFilter.value);
    const progName = prog?.name?.toLowerCase() || '';
    list = list.filter(st => {
      const u = userMap.value[st.id];
      return u?.programId === studentProgramFilter.value || (st.programme && st.programme.toLowerCase().includes(progName));
    });
  }

  if (studentLevelFilter.value) {
    list = list.filter(st => String(st.level).toLowerCase() === String(studentLevelFilter.value).toLowerCase());
  }

  if (studentModeFilter.value) {
    list = list.filter(st => String(st.mode).toLowerCase() === String(studentModeFilter.value).toLowerCase());
  }

  if (studentSearch.value.trim()) {
    const q = studentSearch.value.trim().toLowerCase();
    list = list.filter(st => {
      const nameMatch = st.name.toLowerCase().includes(q);
      const idMatch = String(st.studentId).toLowerCase().includes(q);
      const progMatch = st.programme.toLowerCase().includes(q);
      const courseMatch = st.courses.some(c => c.code.toLowerCase().includes(q) || c.name.toLowerCase().includes(q));
      return nameMatch || idMatch || progMatch || courseMatch;
    });
  }

  return list.sort((a, b) => a.name.localeCompare(b.name));
});

const studentDossierTotalPages = computed(() =>
  Math.max(1, Math.ceil(filteredStudentDossiers.value.length / studentDossierPageSize.value))
);

const paginatedStudentDossiers = computed(() => {
  const start = (studentDossierPage.value - 1) * studentDossierPageSize.value;
  return filteredStudentDossiers.value.slice(start, start + studentDossierPageSize.value);
});

// ─── Queue Management ────────────────────────────────────────────────────────

const queuedStudentsList = computed(() => {
  return allStudentDossiers.value.filter(st => queuedStudentIds.value.has(st.id));
});

const isAllFilteredQueued = computed(() => {
  if (filteredStudentDossiers.value.length === 0) return false;
  return filteredStudentDossiers.value.every(st => queuedStudentIds.value.has(st.id));
});

function toggleQueueStudent(studentId) {
  const next = new Set(queuedStudentIds.value);
  if (next.has(studentId)) {
    next.delete(studentId);
  } else {
    next.add(studentId);
  }
  queuedStudentIds.value = next;
}

function toggleSelectAllFiltered() {
  const next = new Set(queuedStudentIds.value);
  if (isAllFilteredQueued.value) {
    filteredStudentDossiers.value.forEach(st => next.delete(st.id));
  } else {
    filteredStudentDossiers.value.forEach(st => next.add(st.id));
  }
  queuedStudentIds.value = next;
}

function clearQueue() {
  queuedStudentIds.value = new Set();
}

function downloadQueuedPdf() {
  if (queuedStudentsList.value.length === 0) return;
  exportStudentsAttendanceToPdf(queuedStudentsList.value);
}

function downloadQueuedExcel() {
  if (queuedStudentsList.value.length === 0) return;
  exportStudentsAttendanceToExcel(queuedStudentsList.value);
}

function openDossierModal(dossier) {
  activeDossier.value = dossier;
  isDossierModalOpen.value = true;
}

function exportSingleStudentPdf(dossier) {
  exportStudentsAttendanceToPdf([dossier]);
}

function exportSingleStudentExcel(dossier) {
  exportStudentsAttendanceToExcel([dossier]);
}

// ─── Matrix View (Per-Student Course Flat Breakdown) ──────────────────────────

const courseSessionMap = computed(() => {
  const map = {};
  sessions.value.forEach(s => {
    if (!map[s.courseId]) map[s.courseId] = new Set();
    map[s.courseId].add(s.id);
  });
  return map;
});

const studentCourseBreakdown = computed(() => {
  return enrollments.value.map(enr => {
    const sessionIds = courseSessionMap.value[enr.courseId] ?? new Set();
    const stuAttendances = attendances.value.filter(
      a => a.studentId === enr.studentId && sessionIds.has(a.sessionId)
    );
    const present = stuAttendances.filter(a => a.status === 'present').length;
    const absent  = stuAttendances.filter(a => a.status === 'absent').length;
    const total   = stuAttendances.length;
    const rate    = total > 0 ? Math.round((present / total) * 100) : 0;

    const user = userMap.value[enr.studentId];
    const course = courses.value.find(c => c.id === enr.courseId || c.code === enr.courseId);
    const programme = user?.programId ? programmes.value.find(p => p.id === user.programId) : null;

    return {
      key: `${enr.studentId}::${enr.courseId}`,
      studentId: enr.studentId,
      idNumber: user?.idNumber ?? '…',
      studentName: user?.name ?? '…',
      programId: user?.programId ?? null,
      programmeName: programme?.name ?? '—',
      courseId: enr.courseId,
      courseName: course?.name || course?.code || '—',
      sessionCount: sessionIds.size,
      present,
      absent,
      rate,
    };
  });
});

const filteredStudentBreakdown = computed(() => {
  let list = studentCourseBreakdown.value;
  if (studentProgramFilter.value) list = list.filter(r => r.programId === studentProgramFilter.value);
  if (studentSearch.value.trim()) {
    const q = studentSearch.value.trim().toLowerCase();
    list = list.filter(r =>
      r.studentName.toLowerCase().includes(q) ||
      r.idNumber.toLowerCase().includes(q) ||
      r.courseName.toLowerCase().includes(q)
    );
  }
  return list.sort((a, b) => a.studentName.localeCompare(b.studentName));
});

const studentTotalPages = computed(() =>
  Math.max(1, Math.ceil(filteredStudentBreakdown.value.length / studentPageSize))
);

const paginatedStudentBreakdown = computed(() => {
  const start = (studentPage.value - 1) * studentPageSize;
  return filteredStudentBreakdown.value.slice(start, start + studentPageSize);
});

// ─── Enriched Attendance Records ─────────────────────────────────────────────

const enrichedAttendances = computed(() => {
  return attendances.value.map(a => {
    const session = sessions.value.find(s => s.id === a.sessionId);
    const course = session ? courses.value.find(c => c.id === session.courseId || c.code === session.courseId) : null;
    const user = userMap.value[a.studentId];
    return {
      id: a.id,
      studentId: a.studentId,
      idNumber: user?.idNumber ?? '…',
      studentName: user?.name ?? '…',
      status: a.status,
      sessionDate: session?.date
        ? new Date(session.date).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })
        : '—',
      courseName: course?.name || course?.code || '—',
      courseId: course?.id || null,
      recordedAt: a.timestamp
        ? new Date(a.timestamp).toLocaleString('en-US', { dateStyle: 'medium', timeStyle: 'short' })
        : '—',
    };
  });
});

const filteredAttendances = computed(() => {
  let list = enrichedAttendances.value;
  if (selectedCourseFilter.value) list = list.filter(r => r.courseId === selectedCourseFilter.value);
  if (selectedStatusFilter.value) list = list.filter(r => r.status === selectedStatusFilter.value);
  if (searchQuery.value.trim()) {
    const q = searchQuery.value.trim().toLowerCase();
    list = list.filter(r =>
      (r.idNumber && r.idNumber.toLowerCase().includes(q)) ||
      (r.studentName && r.studentName.toLowerCase().includes(q)) ||
      (r.courseName && r.courseName.toLowerCase().includes(q))
    );
  }
  return list;
});

const totalPages = computed(() => Math.max(1, Math.ceil(filteredAttendances.value.length / pageSize)));

const paginatedAttendances = computed(() => {
  const start = (currentPage.value - 1) * pageSize;
  return filteredAttendances.value.slice(start, start + pageSize);
});

// ─── Helpers ──────────────────────────────────────────────────────────────────

function rateColor(rate) {
  if (rate >= 75) return '#10b981';
  if (rate >= 50) return '#f59e0b';
  return '#ef4444';
}
</script>
