<template>
  <div class="space-y-8 p-1 sm:p-2 lg:p-4 animate-in fade-in duration-500">
    <!-- Header Section with Blueprint Aesthetics -->
    <div class="relative bg-white dark:bg-[#071328] border border-slate-200/80 dark:border-slate-800/80 rounded-2xl p-6 sm:p-8 shadow-sm overflow-hidden">
      <!-- Decorative background grid -->
      <div class="absolute inset-0 bg-[radial-gradient(#031c45_1px,transparent_1px)] dark:bg-[radial-gradient(#bc9333_1px,transparent_1px)] opacity-[0.03] dark:opacity-[0.05] bg-[size:16px_16px] pointer-events-none"></div>

      <!-- Corner Registration Brackets -->
      <div class="absolute top-2 left-2 w-3 h-3 border-t-2 border-l-2 border-secondary/40 pointer-events-none"></div>
      <div class="absolute top-2 right-2 w-3 h-3 border-t-2 border-r-2 border-secondary/40 pointer-events-none"></div>

      <div class="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <div class="flex items-center gap-2 mb-2">
            <span class="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-mono font-medium tracking-wide uppercase bg-primary/10 text-primary dark:bg-secondary/15 dark:text-secondary border border-primary/20 dark:border-secondary/30">
              <FileText class="w-3 h-3" />
              ANALYTICS // REPORTING
            </span>
          </div>
          <h1 class="text-2xl sm:text-3xl font-display font-bold text-slate-900 dark:text-white tracking-tight">
            Course Performance & Audit Reports
          </h1>
          <p class="text-sm text-slate-500 dark:text-slate-400 mt-1 max-w-2xl">
            Detailed session logs, attendance ratios, and student participation audit for scheduled courses.
          </p>
        </div>

        <div class="flex items-center gap-3">
          <button
            @click="exportReport"
            class="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:text-primary dark:hover:text-secondary hover:border-slate-300 dark:hover:border-slate-600 text-sm font-medium transition-all shadow-sm hover:shadow active:scale-95"
          >
            <Download class="w-4 h-4 text-secondary" />
            <span>Export Report</span>
          </button>
        </div>
      </div>
    </div>

    <!-- Loading State -->
    <div v-if="isLoading" class="flex flex-col items-center justify-center py-20 bg-white/50 dark:bg-slate-900/40 rounded-2xl border border-dashed border-slate-200 dark:border-slate-800">
      <Loader2 class="w-10 h-10 text-secondary animate-spin mb-4" />
      <p class="text-sm font-mono text-slate-600 dark:text-slate-400">INDEXING SESSION AUDIT DATA...</p>
    </div>

    <template v-else>
      <!-- Filter Bar -->
      <div class="relative bg-white dark:bg-[#071328] border border-slate-200/80 dark:border-slate-800/80 rounded-2xl p-5 shadow-sm space-y-4">
        <div class="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
          <div class="flex items-center gap-2 text-xs font-mono font-semibold uppercase text-slate-500 dark:text-slate-400 tracking-wider">
            <Filter class="w-3.5 h-3.5 text-secondary" />
            FILTER AUDIT RECORDS
          </div>
          <button
            v-if="hasActiveFilters"
            @click="clearFilters"
            class="inline-flex items-center gap-1.5 text-xs text-rose-600 dark:text-rose-400 hover:text-rose-700 font-medium transition-colors"
          >
            <RotateCcw class="w-3.5 h-3.5" />
            Reset Filters
          </button>
        </div>

        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-7 gap-3">
          <!-- Course -->
          <div class="space-y-1.5">
            <label class="text-[11px] font-mono uppercase tracking-wider text-slate-500 dark:text-slate-400">Course</label>
            <select
              v-model="filters.courseId"
              class="w-full bg-slate-50 dark:bg-slate-900/80 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-secondary/50 focus:border-secondary transition-all"
            >
              <option value="">All Courses</option>
              <option v-for="c in courses" :key="c.id" :value="c.id">{{ c.code }} - {{ c.name }}</option>
            </select>
          </div>

          <!-- Level -->
          <div class="space-y-1.5">
            <label class="text-[11px] font-mono uppercase tracking-wider text-slate-500 dark:text-slate-400">Level</label>
            <select
              v-model="filters.level"
              class="w-full bg-slate-50 dark:bg-slate-900/80 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-secondary/50 focus:border-secondary transition-all"
            >
              <option value="">All Levels</option>
              <option v-for="lvl in levelOptions" :key="lvl" :value="lvl">Level {{ lvl }}</option>
            </select>
          </div>

          <!-- Semester -->
          <div class="space-y-1.5">
            <label class="text-[11px] font-mono uppercase tracking-wider text-slate-500 dark:text-slate-400">Semester</label>
            <select
              v-model="filters.semester"
              class="w-full bg-slate-50 dark:bg-slate-900/80 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-secondary/50 focus:border-secondary transition-all"
            >
              <option value="">All Semesters</option>
              <option v-for="sem in semesterOptions" :key="sem" :value="sem">{{ sem }}</option>
            </select>
          </div>

          <!-- Student -->
          <div class="space-y-1.5">
            <label class="text-[11px] font-mono uppercase tracking-wider text-slate-500 dark:text-slate-400">Student</label>
            <select
              v-model="filters.studentId"
              class="w-full bg-slate-50 dark:bg-slate-900/80 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-secondary/50 focus:border-secondary transition-all"
            >
              <option value="">All Students</option>
              <option v-for="s in studentOptions" :key="s.id" :value="s.id">{{ s.name }} ({{ s.studentId }})</option>
            </select>
          </div>

          <!-- From -->
          <div class="space-y-1.5">
            <label class="text-[11px] font-mono uppercase tracking-wider text-slate-500 dark:text-slate-400">From Date</label>
            <input
              type="date"
              v-model="filters.dateFrom"
              class="w-full bg-slate-50 dark:bg-slate-900/80 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-secondary/50 focus:border-secondary transition-all"
            />
          </div>

          <!-- To -->
          <div class="space-y-1.5">
            <label class="text-[11px] font-mono uppercase tracking-wider text-slate-500 dark:text-slate-400">To Date</label>
            <input
              type="date"
              v-model="filters.dateTo"
              class="w-full bg-slate-50 dark:bg-slate-900/80 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-secondary/50 focus:border-secondary transition-all"
            />
          </div>

          <!-- PIN -->
          <div class="space-y-1.5">
            <label class="text-[11px] font-mono uppercase tracking-wider text-slate-500 dark:text-slate-400">Session PIN</label>
            <input
              type="text"
              v-model="filters.pinSearch"
              placeholder="e.g. 4821"
              maxlength="8"
              class="w-full bg-slate-50 dark:bg-slate-900/80 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-secondary/50 focus:border-secondary transition-all font-mono"
            />
          </div>
        </div>
      </div>

      <!-- Empty State -->
      <div
        v-if="reportData.length === 0"
        class="bg-white dark:bg-[#071328] border border-slate-200 dark:border-slate-800 rounded-2xl p-12 text-center shadow-sm"
      >
        <div class="w-16 h-16 rounded-2xl bg-slate-100 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/60 flex items-center justify-center mx-auto mb-4 text-slate-400">
          <BookOpen class="w-8 h-8" />
        </div>
        <h3 class="text-lg font-display font-bold text-slate-900 dark:text-white">No Matching Reports Found</h3>
        <p class="text-sm text-slate-500 dark:text-slate-400 mt-1 max-w-md mx-auto">
          No courses or sessions match the applied filter criteria. Try expanding the date range or clearing filters.
        </p>
        <button
          v-if="hasActiveFilters"
          @click="clearFilters"
          class="mt-5 inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-primary text-white text-xs font-semibold hover:bg-primary/90 transition-all shadow-sm"
        >
          <RotateCcw class="w-3.5 h-3.5" />
          Clear All Filters
        </button>
      </div>

      <!-- Course Summary Cards Grid -->
      <div v-else class="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        <div
          v-for="report in reportData"
          :key="report.courseId"
          class="group relative bg-white dark:bg-[#071328] border border-slate-200/80 dark:border-slate-800/80 rounded-2xl p-6 shadow-sm hover:shadow-md hover:border-slate-300 dark:hover:border-slate-700 transition-all flex flex-col justify-between"
        >
          <!-- Corner brackets -->
          <div class="absolute top-2 left-2 w-2 h-2 border-t border-l border-secondary/30 pointer-events-none"></div>
          <div class="absolute bottom-2 right-2 w-2 h-2 border-b border-r border-secondary/30 pointer-events-none"></div>

          <div>
            <!-- Top Tags & Rate -->
            <div class="flex items-start justify-between gap-4 mb-4">
              <div class="space-y-1.5">
                <div class="flex flex-wrap items-center gap-1.5">
                  <span class="font-mono text-xs font-bold px-2.5 py-0.5 rounded-md bg-primary/10 text-primary dark:bg-secondary/15 dark:text-secondary border border-primary/20 dark:border-secondary/30">
                    {{ report.code }}
                  </span>
                  <span v-if="report.semester" class="text-[11px] font-mono px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400">
                    {{ report.semester }}
                  </span>
                  <span v-if="report.level" class="text-[11px] font-mono px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400">
                    L{{ report.level }}
                  </span>
                </div>
                <h3 class="text-base font-display font-bold text-slate-900 dark:text-white leading-snug line-clamp-2">
                  {{ report.name }}
                </h3>
              </div>

              <!-- Avg Attendance Gauge -->
              <div class="flex flex-col items-end flex-shrink-0">
                <div
                  class="text-2xl font-display font-extrabold"
                  :class="report.avgAttendance >= 75 ? 'text-emerald-600 dark:text-emerald-400' : report.avgAttendance >= 50 ? 'text-amber-600 dark:text-amber-400' : 'text-rose-600 dark:text-rose-400'"
                >
                  {{ report.avgAttendance }}%
                </div>
                <span class="text-[10px] font-mono uppercase tracking-wider text-slate-400">AVG RATE</span>
              </div>
            </div>

            <!-- Stats Matrix -->
            <div class="grid grid-cols-2 gap-2.5 my-4 p-3 bg-slate-50 dark:bg-slate-900/60 rounded-xl border border-slate-100 dark:border-slate-800">
              <div class="space-y-0.5">
                <div class="text-[10px] font-mono uppercase tracking-wider text-slate-400">Enrolled</div>
                <div class="text-sm font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                  <Users class="w-3.5 h-3.5 text-slate-400" />
                  {{ report.totalStudents }}
                </div>
              </div>

              <div class="space-y-0.5">
                <div class="text-[10px] font-mono uppercase tracking-wider text-slate-400">Sessions</div>
                <div class="text-sm font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                  <Calendar class="w-3.5 h-3.5 text-slate-400" />
                  {{ report.sessionsHeld }}
                </div>
              </div>

              <div class="space-y-0.5">
                <div class="text-[10px] font-mono uppercase tracking-wider text-slate-400">Perfect (100%)</div>
                <div class="text-sm font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-1.5">
                  <CheckCircle2 class="w-3.5 h-3.5 text-emerald-500" />
                  {{ report.perfectAttendance }}
                </div>
              </div>

              <div class="space-y-0.5">
                <div class="text-[10px] font-mono uppercase tracking-wider text-slate-400">At Risk (&lt;50%)</div>
                <div class="text-sm font-bold text-rose-600 dark:text-rose-400 flex items-center gap-1.5">
                  <AlertTriangle class="w-3.5 h-3.5 text-rose-500" />
                  {{ report.atRisk }}
                </div>
              </div>
            </div>
          </div>

          <!-- Action Button -->
          <button
            @click="openStudentList(report)"
            class="w-full mt-2 py-2.5 px-4 rounded-xl bg-slate-100 dark:bg-slate-800/80 hover:bg-primary dark:hover:bg-secondary hover:text-white dark:hover:text-primary text-slate-700 dark:text-slate-300 text-xs font-semibold transition-all flex items-center justify-center gap-2 group-hover:border-transparent"
          >
            <Users class="w-3.5 h-3.5" />
            <span>View Student Roster ({{ report.totalStudents }})</span>
          </button>
        </div>
      </div>

      <!-- History Grouped by Session -->
      <div
        v-if="sessionGroups.length > 0 || filteredSessions.length > 0"
        class="relative bg-white dark:bg-[#071328] border border-slate-200/80 dark:border-slate-800/80 rounded-2xl shadow-sm overflow-hidden"
      >
        <!-- Corner Brackets -->
        <div class="absolute top-2 left-2 w-3 h-3 border-t-2 border-l-2 border-secondary/40 pointer-events-none"></div>
        <div class="absolute top-2 right-2 w-3 h-3 border-t-2 border-r-2 border-secondary/40 pointer-events-none"></div>

        <div class="p-5 sm:p-6 border-b border-slate-100 dark:border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div class="flex items-center gap-2">
              <h2 class="text-lg font-display font-bold text-slate-900 dark:text-white">Detailed Attendance Log</h2>
              <span class="px-2.5 py-0.5 rounded-full text-xs font-mono font-medium bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400">
                {{ filteredSessions.length }} Session{{ filteredSessions.length !== 1 ? 's' : '' }}
              </span>
            </div>
            <p class="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Comprehensive chronological listing of class sessions, PINs, and attendee status.
            </p>
          </div>

          <div class="flex items-center gap-2">
            <span class="px-3 py-1 rounded-lg text-xs font-mono bg-primary/5 dark:bg-secondary/10 border border-primary/20 dark:border-secondary/20 text-primary dark:text-secondary font-semibold">
              {{ historyRows.length }} Records Total
            </span>
          </div>
        </div>

        <div v-if="sessionGroups.length === 0" class="p-8 text-center text-slate-500 dark:text-slate-400 text-sm">
          No attendance records match the current filters.
        </div>

        <div v-else class="overflow-x-auto">
          <table class="w-full text-left border-collapse text-xs">
            <thead>
              <tr class="bg-slate-50/80 dark:bg-slate-900/50 border-b border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400 font-mono uppercase tracking-wider text-[11px]">
                <th class="py-3 px-4 font-semibold">Student</th>
                <th class="py-3 px-4 font-semibold">Course</th>
                <th class="py-3 px-4 font-semibold">Session PIN</th>
                <th class="py-3 px-4 font-semibold">Date</th>
                <th class="py-3 px-4 font-semibold">Time</th>
                <th class="py-3 px-4 font-semibold">Status</th>
                <th class="py-3 px-4 font-semibold text-right">Actions</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-slate-100 dark:divide-slate-800/60 font-sans">
              <template v-for="group in sessionGroups" :key="group.sessionId">
                <!-- Group Header Row -->
                <tr class="bg-slate-100/70 dark:bg-slate-800/40 border-t-2 border-b border-slate-200/80 dark:border-slate-800/80 font-mono">
                  <td colspan="6" class="py-3 px-4">
                    <div class="flex flex-wrap items-center gap-2.5">
                      <span class="px-2.5 py-1 rounded-md bg-secondary/15 text-secondary border border-secondary/30 font-bold text-xs">
                        PIN {{ group.pin }}
                      </span>
                      <span class="font-bold text-slate-900 dark:text-white font-sans text-xs">
                        {{ group.courseCode }} · {{ group.courseName }}
                      </span>
                      <span class="text-slate-400 text-[11px]">|</span>
                      <span class="text-slate-500 dark:text-slate-400 text-[11px]">
                        {{ group.dateStr }}
                      </span>
                      <span class="px-2 py-0.5 rounded-full bg-slate-200/60 dark:bg-slate-700/60 text-slate-600 dark:text-slate-300 text-[10px]">
                        {{ group.rows.length }} Check-in{{ group.rows.length !== 1 ? 's' : '' }}
                      </span>
                    </div>
                  </td>
                  <td class="py-3 px-4 text-right">
                    <button
                      @click="confirmDeleteSession(group)"
                      :disabled="deletingSessionId === group.sessionId"
                      title="Delete this session"
                      class="p-1.5 text-rose-500 hover:text-rose-700 hover:bg-rose-50 dark:hover:bg-rose-950/40 rounded-lg transition-colors disabled:opacity-50"
                    >
                      <Loader2 v-if="deletingSessionId === group.sessionId" class="w-4 h-4 animate-spin" />
                      <Trash2 v-else class="w-4 h-4" />
                    </button>
                  </td>
                </tr>

                <!-- If Session had no student check-ins -->
                <tr v-if="group.rows.length === 0" class="bg-slate-50/40 dark:bg-slate-900/20">
                  <td colspan="7" class="py-3.5 px-6 text-slate-400 font-mono text-[11px] italic">
                    Session PIN {{ group.pin }} held on {{ group.dateStr }} — No student attendance check-ins recorded.
                  </td>
                </tr>

                <!-- Student Rows -->
                <tr
                  v-for="row in group.rows"
                  :key="row.id"
                  class="hover:bg-slate-50/60 dark:hover:bg-slate-800/30 transition-colors"
                >
                  <td class="py-3 px-4">
                    <div class="flex items-center gap-2.5">
                      <div class="w-7 h-7 rounded-lg bg-primary/10 text-primary dark:bg-secondary/15 dark:text-secondary border border-primary/20 dark:border-secondary/30 flex items-center justify-center font-bold text-xs uppercase">
                        {{ row.studentName.charAt(0) }}
                      </div>
                      <span class="font-medium text-slate-900 dark:text-slate-100">{{ row.studentName }}</span>
                    </div>
                  </td>
                  <td class="py-3 px-4 text-slate-600 dark:text-slate-400">
                    {{ row.courseCode }}
                  </td>
                  <td class="py-3 px-4">
                    <span class="font-mono text-xs px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                      {{ row.pin }}
                    </span>
                  </td>
                  <td class="py-3 px-4 text-slate-600 dark:text-slate-400 font-mono">{{ row.dateStr }}</td>
                  <td class="py-3 px-4 text-slate-600 dark:text-slate-400 font-mono">{{ row.timeStr }}</td>
                  <td class="py-3 px-4">
                    <!-- Inline status editor -->
                    <div v-if="editingRowId === row.id" class="flex items-center gap-1.5">
                      <select
                        v-model="editingStatus"
                        :disabled="savingRowId === row.id"
                        @change="saveStatusEdit(row)"
                        class="bg-white dark:bg-slate-900 border border-secondary rounded-lg px-2 py-1 text-xs text-slate-800 dark:text-slate-200 focus:outline-none"
                      >
                        <option value="pending">Pending</option>
                        <option value="absent">Absent</option>
                        <option value="present">Present</option>
                      </select>
                      <button
                        @click="cancelStatusEdit"
                        :disabled="savingRowId === row.id"
                        class="p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                        title="Cancel"
                      >
                        <X class="w-3.5 h-3.5" />
                      </button>
                    </div>

                    <!-- Static status badge -->
                    <span
                      v-else
                      class="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-mono font-medium"
                      :class="{
                        'bg-emerald-50 text-emerald-700 border border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-400 dark:border-emerald-800': row.status === 'present',
                        'bg-amber-50 text-amber-700 border border-amber-200 dark:bg-amber-950/40 dark:text-amber-400 dark:border-amber-800': row.status === 'pending',
                        'bg-rose-50 text-rose-700 border border-rose-200 dark:bg-rose-950/40 dark:text-rose-400 dark:border-rose-800': row.status === 'absent' || !row.status
                      }"
                    >
                      <span class="w-1.5 h-1.5 rounded-full" :class="{
                        'bg-emerald-500': row.status === 'present',
                        'bg-amber-500': row.status === 'pending',
                        'bg-rose-500': row.status === 'absent' || !row.status
                      }"></span>
                      {{ statusLabel(row.status) }}
                    </span>
                  </td>
                  <td class="py-3 px-4 text-right">
                    <button
                      v-if="editingRowId !== row.id && (row.status === 'pending' || row.status === 'absent')"
                      @click="startStatusEdit(row)"
                      :disabled="!!savingRowId"
                      class="p-1.5 text-slate-400 hover:text-primary dark:hover:text-secondary rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                      title="Edit attendance status"
                    >
                      <Edit3 class="w-3.5 h-3.5" />
                    </button>
                  </td>
                </tr>
              </template>
            </tbody>
          </table>
        </div>
      </div>
    </template>

    <!-- Student Roster Modal -->
    <div
      v-if="isModalOpen"
      class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200"
      @click.self="closeModal"
    >
      <div class="relative w-full max-w-2xl bg-white dark:bg-[#071328] border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl overflow-hidden max-h-[85vh] flex flex-col">
        <!-- Corner Brackets -->
        <div class="absolute top-2 left-2 w-3 h-3 border-t-2 border-l-2 border-secondary/40 pointer-events-none"></div>
        <div class="absolute top-2 right-2 w-3 h-3 border-t-2 border-r-2 border-secondary/40 pointer-events-none"></div>

        <div class="p-6 border-b border-slate-100 dark:border-slate-800 flex items-start justify-between gap-4">
          <div>
            <span class="text-[10px] font-mono uppercase tracking-wider text-secondary font-bold">COURSE ROSTER AUDIT</span>
            <h2 class="text-xl font-display font-bold text-slate-900 dark:text-white">{{ selectedReport?.name }}</h2>
            <p class="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              {{ selectedReport?.code }} · {{ selectedReport?.sessionsHeld }} Session{{ selectedReport?.sessionsHeld !== 1 ? 's' : '' }} Held
            </p>
          </div>
          <button
            @click="closeModal"
            class="p-2 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <X class="w-5 h-5" />
          </button>
        </div>

        <div class="p-6 overflow-y-auto flex-1">
          <div v-if="studentsList.length === 0" class="text-center py-10 text-slate-500 dark:text-slate-400 text-sm">
            No students are currently enrolled in this course.
          </div>
          <div v-else class="overflow-x-auto">
            <table class="w-full text-left border-collapse text-xs">
              <thead>
                <tr class="border-b border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400 font-mono uppercase text-[10px]">
                  <th class="py-2.5 px-3">Student Name</th>
                  <th class="py-2.5 px-3">Student ID</th>
                  <th class="py-2.5 px-3">Program</th>
                  <th class="py-2.5 px-3 text-right">Attendance Rate</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-slate-100 dark:divide-slate-800/60 font-sans">
                <tr v-for="student in studentsList" :key="student.id" class="hover:bg-slate-50/50 dark:hover:bg-slate-800/30">
                  <td class="py-2.5 px-3 font-medium text-slate-900 dark:text-slate-100">
                    <div class="flex items-center gap-2">
                      <div class="w-6 h-6 rounded bg-primary/10 text-primary dark:bg-secondary/15 dark:text-secondary flex items-center justify-center font-bold text-xs uppercase">
                        {{ student.name.charAt(0) }}
                      </div>
                      <span>{{ student.name }}</span>
                    </div>
                  </td>
                  <td class="py-2.5 px-3 font-mono text-slate-600 dark:text-slate-400">{{ student.studentId }}</td>
                  <td class="py-2.5 px-3 text-slate-600 dark:text-slate-400">{{ student.program || 'N/A' }}</td>
                  <td class="py-2.5 px-3 text-right">
                    <span
                      class="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-mono font-bold"
                      :class="{
                        'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-400': student.attendanceRate >= 80,
                        'bg-amber-50 text-amber-700 dark:bg-amber-950/50 dark:text-amber-400': student.attendanceRate >= 50 && student.attendanceRate < 80,
                        'bg-rose-50 text-rose-700 dark:bg-rose-950/50 dark:text-rose-400': student.attendanceRate < 50
                      }"
                    >
                      {{ student.attendanceRate }}%
                    </span>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>

    <!-- Delete Session Confirmation Modal -->
    <div
      v-if="sessionToDelete"
      class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200"
      @click.self="sessionToDelete = null"
    >
      <div class="relative w-full max-w-md bg-white dark:bg-[#071328] border border-rose-200 dark:border-rose-900/50 rounded-2xl p-6 shadow-2xl">
        <div class="w-12 h-12 rounded-xl bg-rose-50 dark:bg-rose-950/50 border border-rose-200 dark:border-rose-900/50 flex items-center justify-center text-rose-600 dark:text-rose-400 mb-4">
          <Trash2 class="w-6 h-6" />
        </div>

        <h3 class="text-lg font-display font-bold text-slate-900 dark:text-white">Permanently Delete Session?</h3>
        <p class="text-xs text-slate-500 dark:text-slate-400 mt-2">
          This will purge the session along with <strong class="text-slate-800 dark:text-slate-200">{{ sessionToDelete.rows.length }}</strong> attendance records:
        </p>

        <div class="my-4 p-3.5 bg-slate-50 dark:bg-slate-900/60 rounded-xl border border-slate-200 dark:border-slate-800 space-y-1 text-xs">
          <div class="font-mono text-secondary font-bold">PIN: {{ sessionToDelete.pin }}</div>
          <div class="text-slate-800 dark:text-slate-200 font-medium">{{ sessionToDelete.courseCode }} — {{ sessionToDelete.courseName }}</div>
          <div class="text-slate-500 text-[11px]">{{ sessionToDelete.dateStr }}</div>
        </div>

        <p class="text-[11px] font-mono text-rose-600 dark:text-rose-400 font-semibold mb-6">
          CAUTION: This action cannot be reversed.
        </p>

        <div class="flex items-center justify-end gap-3">
          <button
            @click="sessionToDelete = null"
            :disabled="!!deletingSessionId"
            class="px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            Cancel
          </button>
          <button
            @click="deleteSessionById"
            :disabled="!!deletingSessionId"
            class="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-semibold transition-all inline-flex items-center gap-1.5 shadow-sm disabled:opacity-50"
          >
            <Loader2 v-if="deletingSessionId" class="w-3.5 h-3.5 animate-spin" />
            <span>{{ deletingSessionId ? 'Purging...' : 'Delete Session' }}</span>
          </button>
        </div>
      </div>
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
import { useSessionsStore } from '@/stores/sessions';
import { useAttendancesStore } from '@/stores/attendances';
import { supabase } from '@/stores/supabase';
import {
  Download,
  BookOpen,
  Users,
  Calendar,
  Filter,
  X,
  Trash2,
  Edit3,
  AlertTriangle,
  CheckCircle2,
  FileText,
  RotateCcw,
  Loader2
} from 'lucide-vue-next';

const authStore = useAuthStore();
const coursesStore = useCoursesStore();
const schedulesStore = useSchedulesStore();
const enrollmentsStore = useEnrollmentsStore();
const sessionsStore = useSessionsStore();
const attendancesStore = useAttendancesStore();

const { profile } = storeToRefs(authStore);
const { courses } = storeToRefs(coursesStore);
const { enrollments } = storeToRefs(enrollmentsStore);
const { sessions } = storeToRefs(sessionsStore);
const { attendances } = storeToRefs(attendancesStore);

const isLoading = ref(true);
const studentsById = ref({}); // id -> { id, name, studentId, program }

const isModalOpen = ref(false);
const selectedReport = ref(null);
const studentsList = ref([]);

const filters = ref({
  courseId: '',
  level: '',
  semester: '',
  studentId: '',
  dateFrom: '',
  dateTo: '',
  pinSearch: '',
});

const hasActiveFilters = computed(() =>
  Object.values(filters.value).some((v) => v !== '')
);

const clearFilters = () => {
  filters.value = { courseId: '', level: '', semester: '', studentId: '', dateFrom: '', dateTo: '', pinSearch: '' };
};

onMounted(async () => {
  isLoading.value = true;
  try {
    if (!profile.value) {
      await authStore.fetchProfile();
    }

    await Promise.all([
      coursesStore.fetchCourses(),
      schedulesStore.fetchSchedules(),
      enrollmentsStore.fetchEnrollments(),
      sessionsStore.fetchSessions(),
      attendancesStore.fetchAttendances(),
    ]);

    sessionsStore.subscribeToSessions();
    attendancesStore.subscribeToAttendances();

    // Pull student profiles for enrolled students in this lecturer's courses
    const lecturerCourseIds = new Set(coursesForLecturer.value.map((c) => c.id));
    sessions.value.filter(isMySession).forEach((s) => {
      if (s.courseId) lecturerCourseIds.add(s.courseId);
    });

    const studentIds = [
      ...new Set(
        enrollments.value
          .filter((e) => lecturerCourseIds.has(e.courseId))
          .map((e) => e.studentId)
      ),
    ];

    if (studentIds.length > 0) {
      const { data, error } = await supabase
        .from('users')
        .select('id, name, id_number, program_id')
        .in('id', studentIds)
        .order('name');

      if (!error && data) {
        studentsById.value = Object.fromEntries(
          data.map((u) => [u.id, { id: u.id, name: u.name, studentId: u.id_number, programId: u.program_id }])
        );
      }
    }
  } catch (e) {
    console.error('Error loading report data:', e);
  } finally {
    isLoading.value = false;
  }
});

onUnmounted(() => {
  sessionsStore.unsubscribeFromSessions();
  attendancesStore.unsubscribeFromAttendances();
});

// Courses this lecturer actually teaches, inferred from schedules and held sessions
const coursesForLecturer = computed(() => {
  const lecturerName = (profile.value?.name || '').trim().toLowerCase();
  const myId = profile.value?.id;
  const myStaffId = profile.value?.id_number || profile.value?.staff_id;

  const scheduledCourseIds = new Set();
  (schedulesStore.schedules || []).forEach((s) => {
    const sName = (s.lecturer || '').trim().toLowerCase();
    if (lecturerName && sName === lecturerName) {
      scheduledCourseIds.add(s.courseId);
    } else if (myStaffId && (s.lecturer === myStaffId || s.lecturerId === myStaffId)) {
      scheduledCourseIds.add(s.courseId);
    } else if (myId && s.lecturerId === myId) {
      scheduledCourseIds.add(s.courseId);
    }
  });

  // Also include any course where this lecturer has created or conducted a session
  sessions.value.forEach((s) => {
    if (
      (myId && s.lecturerId === myId) ||
      (myStaffId && s.lecturerId === myStaffId) ||
      (authStore.user?.id && s.lecturerId === authStore.user?.id) ||
      (lecturerName && (s.lecturerName || '').trim().toLowerCase() === lecturerName)
    ) {
      if (s.courseId) scheduledCourseIds.add(s.courseId);
    }
  });

  const byScheduleOrSession = courses.value.filter((c) => scheduledCourseIds.has(c.id));
  return byScheduleOrSession.length > 0 ? byScheduleOrSession : courses.value;
});

// Identifies whether a session belongs to the logged-in lecturer
const isMySession = (s) => {
  const role = (profile.value?.role || '').toUpperCase();
  if (role === 'ADMIN' || role === 'SUPER_ADMIN' || role === 'SUPERADMIN') {
    return true;
  }

  const myId = profile.value?.id;
  const myAuthId = authStore.user?.id;
  const myIdNumber = profile.value?.id_number;
  const myStaffId = profile.value?.staff_id;
  const myStudentId = profile.value?.student_id;
  const myName = (profile.value?.name || '').trim().toLowerCase();

  // Match by lecturerId against any of the user's possible ID representations
  if (s.lecturerId) {
    if (
      (myId && s.lecturerId === myId) ||
      (myAuthId && s.lecturerId === myAuthId) ||
      (myIdNumber && s.lecturerId === myIdNumber) ||
      (myStaffId && s.lecturerId === myStaffId) ||
      (myStudentId && s.lecturerId === myStudentId)
    ) {
      return true;
    }
  }

  // Match by lecturer name if present on session
  if (s.lecturerName && myName && (s.lecturerName || '').trim().toLowerCase() === myName) {
    return true;
  }

  // Match by course: if session course belongs to this lecturer's taught courses
  const lecturerCourseIds = new Set(coursesForLecturer.value.map((c) => c.id));
  if (s.courseId && lecturerCourseIds.has(s.courseId)) {
    return true;
  }

  return false;
};

const levelOptions = computed(() =>
  [...new Set(coursesForLecturer.value.map((c) => c.level).filter(Boolean))].sort()
);
const semesterOptions = computed(() =>
  [...new Set(coursesForLecturer.value.map((c) => c.semester).filter(Boolean))].sort()
);
const studentOptions = computed(() =>
  Object.values(studentsById.value).sort((a, b) => a.name.localeCompare(b.name))
);

const inDateRange = (dateStr, from, to) => {
  if (!dateStr) return false;
  const d = new Date(dateStr);
  if (from && d < new Date(from)) return false;
  if (to) {
    const toEnd = new Date(to);
    toEnd.setHours(23, 59, 59, 999);
    if (d > toEnd) return false;
  }
  return true;
};

// Sessions after course/level/semester/date/pin filters
const filteredSessions = computed(() => {
  const f = filters.value;
  return sessions.value.filter((s) => {
    if (!isMySession(s)) return false;

    const course = coursesStore.getCourseById(s.courseId);

    if (f.courseId && s.courseId !== f.courseId) return false;
    if (f.level && course && course.level !== f.level) return false;
    if (f.semester && course && course.semester !== f.semester) return false;
    if ((f.dateFrom || f.dateTo) && !inDateRange(s.date, f.dateFrom, f.dateTo)) return false;
    if (f.pinSearch && !s.pin?.toLowerCase().includes(f.pinSearch.toLowerCase())) return false;

    return true;
  });
});

const filteredSessionIds = computed(() => new Set(filteredSessions.value.map((s) => s.id)));

// Individual attendance rows for the history table
const historyRows = computed(() => {
  const f = filters.value;
  return attendances.value
    .filter((a) => filteredSessionIds.value.has(a.sessionId))
    .filter((a) => !f.studentId || a.studentId === f.studentId)
    .map((a) => {
      const session = sessionsStore.getSessionById(a.sessionId);
      const course = session ? coursesStore.getCourseById(session.courseId) : null;
      const student = studentsById.value[a.studentId];
      const ts = a.timestamp ? new Date(a.timestamp) : null;

      return {
        id: a.id,
        sessionId: a.sessionId,
        studentName: student?.name ?? 'Unknown student',
        courseCode: course?.code ?? session?.courseCode ?? '—',
        courseName: course?.name ?? session?.courseName ?? 'Unknown course',
        pin: session?.pin ?? '—',
        dateStr: ts ? ts.toLocaleDateString('en-US') : '—',
        timeStr: ts ? ts.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true }) : '—',
        status: a.status,
        rawTimestamp: a.timestamp,
      };
    })
    .sort((x, y) => new Date(y.rawTimestamp) - new Date(x.rawTimestamp));
});

// Per-course aggregate cards with accurate Sessions Held calculation
const reportData = computed(() => {
  const f = filters.value;

  const candidateCoursesMap = new Map();
  for (const c of coursesForLecturer.value) {
    candidateCoursesMap.set(c.id, c);
  }
  // Always include courses from filtered sessions, even if not in coursesForLecturer
  for (const s of filteredSessions.value) {
    if (s.courseId && !candidateCoursesMap.has(s.courseId)) {
      const c = coursesStore.getCourseById(s.courseId);
      if (c) {
        candidateCoursesMap.set(c.id, c);
      } else {
        candidateCoursesMap.set(s.courseId, {
          id: s.courseId,
          code: s.courseCode ?? '—',
          name: s.courseName ?? 'Unknown Course',
          level: null,
          semester: null,
        });
      }
    }
  }

  const rows = [];
  for (const [courseId, course] of candidateCoursesMap) {
    if (f.courseId && courseId !== f.courseId) continue;
    if (f.level && course.level !== f.level) continue;
    if (f.semester && course.semester !== f.semester) continue;

    const courseSessions = filteredSessions.value.filter((s) => s.courseId === courseId);
    const sessionsHeld = courseSessions.length;
    const sessionIds = new Set(courseSessions.map((s) => s.id));

    let enrolledStudentIds = enrollments.value
      .filter((e) => e.courseId === courseId)
      .map((e) => e.studentId);

    if (f.studentId) {
      enrolledStudentIds = enrolledStudentIds.filter((id) => id === f.studentId);
      const hasAttendanceForStudent = attendances.value.some(
        (a) => sessionIds.has(a.sessionId) && a.studentId === f.studentId
      );
      if (enrolledStudentIds.length === 0 && !hasAttendanceForStudent) {
        continue;
      }
    }

    const totalStudents = enrolledStudentIds.length;

    // Present count per student, within this course's filtered sessions
    const presentCountByStudent = new Map(enrolledStudentIds.map((id) => [id, 0]));
    for (const a of attendances.value) {
      if (a.status !== 'present') continue;
      if (!sessionIds.has(a.sessionId)) continue;
      if (!presentCountByStudent.has(a.studentId)) continue;
      presentCountByStudent.set(a.studentId, presentCountByStudent.get(a.studentId) + 1);
    }

    let perfectAttendance = 0;
    let atRisk = 0;
    let totalRatioSum = 0;

    for (const studentId of enrolledStudentIds) {
      const present = presentCountByStudent.get(studentId) ?? 0;
      const rate = sessionsHeld > 0 ? present / sessionsHeld : 0;
      totalRatioSum += rate;
      if (sessionsHeld > 0 && present === sessionsHeld) perfectAttendance += 1;
      if (rate < 0.5) atRisk += 1;
    }

    const avgAttendance = totalStudents > 0 ? Math.round((totalRatioSum / totalStudents) * 100) : 0;

    rows.push({
      courseId,
      code: course.code,
      name: course.name,
      level: course.level,
      semester: course.semester,
      totalStudents,
      sessionsHeld,
      perfectAttendance,
      atRisk,
      avgAttendance,
      sessionIds,
    });
  }

  return rows.sort((a, b) => (a.code ?? '').localeCompare(b.code ?? ''));
});

const openStudentList = (report) => {
  selectedReport.value = report;
  isModalOpen.value = true;

  const f = filters.value;
  let enrolledStudentIds = enrollments.value
    .filter((e) => e.courseId === report.courseId)
    .map((e) => e.studentId);

  if (f.studentId) {
    enrolledStudentIds = enrolledStudentIds.filter((id) => id === f.studentId);
  }

  studentsList.value = enrolledStudentIds
    .map((studentId) => {
      const student = studentsById.value[studentId];
      if (!student) return null;

      let presentCount = 0;
      for (const a of attendances.value) {
        if (a.status === 'present' && a.studentId === studentId && report.sessionIds.has(a.sessionId)) {
          presentCount += 1;
        }
      }
      const attendanceRate = report.sessionsHeld > 0
        ? Math.round((presentCount / report.sessionsHeld) * 100)
        : 0;

      return { ...student, attendanceRate };
    })
    .filter(Boolean)
    .sort((a, b) => a.name.localeCompare(b.name));
};

const closeModal = () => {
  isModalOpen.value = false;
  selectedReport.value = null;
  studentsList.value = [];
};

const exportReport = () => {
  window.print();
};

// ── Delete session ───────────────────────────────────────────────────────────
const sessionToDelete = ref(null);
const deletingSessionId = ref(null);

const confirmDeleteSession = (group) => {
  sessionToDelete.value = group;
};

const deleteSessionById = async () => {
  if (!sessionToDelete.value) return;
  const sid = sessionToDelete.value.sessionId;
  deletingSessionId.value = sid;
  try {
    const { error: aErr } = await supabase.from('attendances').delete().eq('session_id', sid);
    if (aErr) throw aErr;
    await sessionsStore.deleteSession(sid);
    attendancesStore.removeBySessionId?.(sid);
    sessionToDelete.value = null;
  } catch (e) {
    console.error('Failed to delete session:', e);
  } finally {
    deletingSessionId.value = null;
  }
};

// ── Attendance status labels ────────────────────────────────────────────────
const statusLabel = (status) => {
  if (status === 'present') return 'Present';
  if (status === 'pending') return 'Pending';
  return 'Absent';
};

// ── Edit attendance status (history table) ──────────────────────────────────
const editingRowId = ref(null);
const editingStatus = ref('');
const savingRowId = ref(null);

const startStatusEdit = (row) => {
  if (savingRowId.value) return;
  if (row.status !== 'pending' && row.status !== 'absent') return;
  editingRowId.value = row.id;
  editingStatus.value = row.status;
};

const cancelStatusEdit = () => {
  if (savingRowId.value) return;
  editingRowId.value = null;
  editingStatus.value = '';
};

const saveStatusEdit = async (row) => {
  if (editingStatus.value === row.status) {
    cancelStatusEdit();
    return;
  }
  savingRowId.value = row.id;
  try {
    await attendancesStore.updateAttendanceStatus(row.id, editingStatus.value);
  } catch (e) {
    console.error('Failed to update attendance status:', e);
  } finally {
    savingRowId.value = null;
    editingRowId.value = null;
    editingStatus.value = '';
  }
};

// ── Session groups for the history table ────────────────────────────────────
const sessionGroups = computed(() => {
  const bySession = new Map();

  for (const session of filteredSessions.value) {
    const course = coursesStore.getCourseById(session.courseId);
    const ts = session.date ? new Date(session.date) : (session.createdAt ? new Date(session.createdAt) : null);
    bySession.set(session.id, {
      sessionId: session.id,
      pin: session.pin ?? '—',
      courseCode: course?.code ?? session.courseCode ?? '—',
      courseName: course?.name ?? session.courseName ?? 'Unknown Course',
      dateStr: ts ? ts.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' }) : '—',
      rawTimestamp: session.createdAt || session.date || '',
      rows: [],
    });
  }

  for (const row of historyRows.value) {
    const sid = row.sessionId;
    if (bySession.has(sid)) {
      bySession.get(sid).rows.push(row);
    } else {
      bySession.set(sid, {
        sessionId: sid,
        pin: row.pin,
        courseCode: row.courseCode,
        courseName: row.courseName,
        dateStr: row.dateStr,
        rawTimestamp: row.rawTimestamp,
        rows: [row],
      });
    }
  }

  return [...bySession.values()].sort((a, b) => {
    const ta = new Date(a.rawTimestamp || 0).getTime();
    const tb = new Date(b.rawTimestamp || 0).getTime();
    return tb - ta;
  });
});
</script>