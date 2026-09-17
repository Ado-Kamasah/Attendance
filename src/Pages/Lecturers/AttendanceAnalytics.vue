<template>
  <div class="space-y-8 p-1 sm:p-2 lg:p-4 animate-in fade-in duration-500">

    <!-- Admin Lecturer Picker Banner -->
    <div v-if="isAdmin" class="relative bg-primary border border-primary/80 rounded-2xl p-5 shadow-lg overflow-hidden">
      <div class="absolute inset-0 bg-[radial-gradient(#bc9333_1px,transparent_1px)] opacity-[0.06] bg-[size:14px_14px] pointer-events-none"></div>
      <div class="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div class="flex items-center gap-2.5 text-secondary font-mono text-xs font-bold uppercase tracking-wider">
          <Users class="w-4 h-4" />
          <span>Viewing Analytics As Lecturer:</span>
        </div>
        <div class="flex flex-wrap items-center gap-3">
          <select
            v-model="selectedLecturerId"
            @change="loadAnalytics"
            class="bg-white/10 border border-white/20 text-white rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-secondary/50 min-w-[240px]"
          >
            <option value="" class="bg-primary text-white">— Select a lecturer —</option>
            <option v-for="l in allLecturers" :key="l.id" :value="l.id" class="bg-primary text-white">
              {{ l.name }} ({{ l.courseCount }} course{{ l.courseCount !== 1 ? 's' : '' }})
            </option>
          </select>
          <div v-if="selectedLecturer" class="flex items-center gap-2 bg-white/10 px-3 py-1.5 rounded-full">
            <div class="w-6 h-6 rounded-full bg-secondary text-primary flex items-center justify-center font-bold text-xs uppercase">
              {{ selectedLecturer.name.charAt(0) }}
            </div>
            <span class="text-white text-sm font-semibold">{{ selectedLecturer.name }}</span>
          </div>
        </div>
      </div>
    </div>

    <!-- Page Header -->
    <div class="relative bg-white dark:bg-[#071328] border border-slate-200/80 dark:border-slate-800/80 rounded-2xl p-6 sm:p-8 shadow-sm overflow-hidden">
      <div class="absolute inset-0 bg-[radial-gradient(#031c45_1px,transparent_1px)] dark:bg-[radial-gradient(#bc9333_1px,transparent_1px)] opacity-[0.03] dark:opacity-[0.05] bg-[size:16px_16px] pointer-events-none"></div>
      <div class="absolute top-2 left-2 w-3 h-3 border-t-2 border-l-2 border-secondary/40 pointer-events-none"></div>
      <div class="absolute top-2 right-2 w-3 h-3 border-t-2 border-r-2 border-secondary/40 pointer-events-none"></div>

      <div class="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-5">
        <div>
          <div class="flex items-center gap-2 mb-1.5">
            <span class="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-mono font-medium tracking-wide uppercase bg-primary/10 text-primary dark:bg-secondary/15 dark:text-secondary border border-primary/20 dark:border-secondary/30">
              <TrendingUp class="w-3 h-3" />
              ANALYTICS // INSIGHTS
            </span>
          </div>
          <h1 class="text-2xl sm:text-3xl font-display font-bold text-slate-900 dark:text-white tracking-tight">
            Attendance Analytics
          </h1>
          <p class="text-sm text-slate-500 dark:text-slate-400 mt-1" v-if="isAdmin && selectedLecturer">
            Showing analytics for <strong class="text-slate-700 dark:text-slate-300">{{ selectedLecturer.name }}</strong>
          </p>
          <p class="text-sm text-slate-500 dark:text-slate-400 mt-1" v-else-if="isAdmin">
            Select a lecturer above to view their analytics
          </p>
          <p class="text-sm text-slate-500 dark:text-slate-400 mt-1" v-else>
            Deep insights into student attendance across all your courses
          </p>
        </div>

        <div class="flex flex-wrap items-center gap-3">
          <select
            v-model="selectedCourseFilter"
            :disabled="isAdmin && !selectedLecturerId"
            class="bg-slate-50 dark:bg-slate-900/80 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-sm text-slate-700 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-secondary/50 disabled:opacity-40"
          >
            <option value="all">All Courses</option>
            <option v-for="c in myCourses" :key="c.id" :value="c.id">{{ c.code }} — {{ c.name }}</option>
          </select>

          <div v-if="lastUpdated" class="flex items-center gap-1.5 text-xs text-slate-400 font-mono">
            <Clock class="w-3.5 h-3.5" />
            {{ lastUpdated }}
          </div>
        </div>
      </div>
    </div>

    <!-- Admin: No Lecturer Selected State -->
    <div
      v-if="isAdmin && !selectedLecturerId"
      class="bg-white dark:bg-[#071328] border border-dashed border-primary/30 dark:border-secondary/30 rounded-2xl p-14 text-center"
    >
      <div class="w-16 h-16 rounded-2xl bg-primary/5 dark:bg-secondary/10 border border-primary/20 dark:border-secondary/20 flex items-center justify-center mx-auto mb-4">
        <Users class="w-8 h-8 text-primary dark:text-secondary" />
      </div>
      <h3 class="text-lg font-display font-bold text-slate-900 dark:text-white">Select a Lecturer</h3>
      <p class="text-sm text-slate-500 dark:text-slate-400 mt-1 max-w-sm mx-auto">
        Choose a lecturer from the dropdown above to view their detailed attendance analytics.
      </p>
    </div>

    <!-- Loading Skeletons -->
    <div v-else-if="isLoading" class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
      <div v-for="i in 4" :key="i" class="h-32 rounded-2xl bg-slate-100 dark:bg-slate-800 animate-pulse"></div>
    </div>

    <template v-else-if="!isAdmin || selectedLecturerId">
      <!-- KPI Tiles -->
      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <!-- Sessions Held -->
        <div class="relative bg-white dark:bg-[#071328] border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-sm hover:shadow-md transition-all overflow-hidden">
          <div class="absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r from-primary to-primary/40 dark:from-secondary dark:to-secondary/30"></div>
          <div class="w-10 h-10 rounded-xl bg-primary/10 dark:bg-secondary/15 border border-primary/20 dark:border-secondary/20 flex items-center justify-center text-primary dark:text-secondary mb-3">
            <Calendar class="w-5 h-5" />
          </div>
          <div class="text-3xl font-display font-extrabold text-slate-900 dark:text-white">{{ kpi.totalSessions }}</div>
          <div class="text-[11px] font-mono uppercase tracking-wider text-slate-400 mt-0.5">Sessions Held</div>
          <div class="mt-2 inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-mono bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400 border border-emerald-100 dark:border-emerald-900">
            +{{ kpi.sessionsThisWeek }} this week
          </div>
        </div>

        <!-- Avg Rate -->
        <div class="relative bg-white dark:bg-[#071328] border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-sm hover:shadow-md transition-all overflow-hidden">
          <div class="absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r from-emerald-500 to-emerald-400/40"></div>
          <div class="w-10 h-10 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-100 dark:border-emerald-900 flex items-center justify-center text-emerald-600 dark:text-emerald-400 mb-3">
            <TrendingUp class="w-5 h-5" />
          </div>
          <div class="text-3xl font-display font-extrabold text-slate-900 dark:text-white">{{ kpi.avgRate }}%</div>
          <div class="text-[11px] font-mono uppercase tracking-wider text-slate-400 mt-0.5">Avg Attendance Rate</div>
          <div class="mt-2 h-1.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
            <div class="h-full bg-gradient-to-r from-emerald-500 to-emerald-400 rounded-full transition-all duration-700" :style="{ width: kpi.avgRate + '%' }"></div>
          </div>
        </div>

        <!-- At Risk -->
        <div class="relative bg-white dark:bg-[#071328] border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-sm hover:shadow-md transition-all overflow-hidden">
          <div class="absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r from-amber-500 to-amber-400/40"></div>
          <div class="w-10 h-10 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-100 dark:border-amber-900 flex items-center justify-center text-amber-600 dark:text-amber-400 mb-3">
            <AlertTriangle class="w-5 h-5" />
          </div>
          <div class="text-3xl font-display font-extrabold text-slate-900 dark:text-white">{{ kpi.atRisk }}</div>
          <div class="text-[11px] font-mono uppercase tracking-wider text-slate-400 mt-0.5">At-Risk Students</div>
          <div class="mt-2 inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-mono bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-400 border border-amber-100 dark:border-amber-900">
            Below 75% threshold
          </div>
        </div>

        <!-- Perfect -->
        <div class="relative bg-white dark:bg-[#071328] border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-sm hover:shadow-md transition-all overflow-hidden">
          <div class="absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r from-violet-500 to-violet-400/40"></div>
          <div class="w-10 h-10 rounded-xl bg-violet-50 dark:bg-violet-950/40 border border-violet-100 dark:border-violet-900 flex items-center justify-center text-violet-600 dark:text-violet-400 mb-3">
            <CheckCircle2 class="w-5 h-5" />
          </div>
          <div class="text-3xl font-display font-extrabold text-slate-900 dark:text-white">{{ kpi.perfect }}</div>
          <div class="text-[11px] font-mono uppercase tracking-wider text-slate-400 mt-0.5">Perfect Attendance</div>
          <div class="mt-2 inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-mono bg-violet-50 dark:bg-violet-950/40 text-violet-700 dark:text-violet-400 border border-violet-100 dark:border-violet-900">
            100% across all sessions
          </div>
        </div>
      </div>

      <!-- Charts Row -->
      <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <!-- Course Breakdown Bar Chart -->
        <div class="lg:col-span-2 bg-white dark:bg-[#071328] border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm">
          <h2 class="text-base font-display font-bold text-slate-900 dark:text-white">Course Attendance Breakdown</h2>
          <p class="text-xs text-slate-400 mt-0.5 mb-5">Average attendance rate per course</p>

          <div v-if="courseBreakdown.length === 0" class="flex items-center justify-center h-24 text-slate-400 text-sm">
            No sessions recorded yet.
          </div>
          <div v-else class="space-y-5">
            <div v-for="c in courseBreakdown" :key="c.id" class="space-y-2">
              <div class="flex items-center justify-between gap-3">
                <div class="flex items-center gap-2 min-w-0">
                  <span class="font-mono text-[11px] font-bold px-2 py-0.5 rounded bg-primary/10 text-primary dark:bg-secondary/15 dark:text-secondary flex-shrink-0">
                    {{ c.code }}
                  </span>
                  <span class="text-sm font-medium text-slate-700 dark:text-slate-300 truncate">{{ c.name }}</span>
                </div>
                <span
                  class="text-sm font-bold flex-shrink-0"
                  :class="c.rate >= 75 ? 'text-emerald-600 dark:text-emerald-400' : c.rate >= 50 ? 'text-amber-600 dark:text-amber-400' : 'text-rose-600 dark:text-rose-400'"
                >{{ c.rate }}%</span>
              </div>
              <div class="h-2 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                <div
                  class="h-full rounded-full transition-all duration-700"
                  :class="c.rate >= 75 ? 'bg-gradient-to-r from-emerald-500 to-emerald-400' : c.rate >= 50 ? 'bg-gradient-to-r from-amber-500 to-amber-400' : 'bg-gradient-to-r from-rose-500 to-rose-400'"
                  :style="{ width: c.rate + '%' }"
                ></div>
              </div>
              <div class="text-[11px] text-slate-400 font-mono">{{ c.sessions }} sessions · {{ c.present }}/{{ c.total }} present</div>
            </div>
          </div>
        </div>

        <!-- Sparkline Trend -->
        <div class="bg-white dark:bg-[#071328] border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm">
          <h2 class="text-base font-display font-bold text-slate-900 dark:text-white">Attendance Trend</h2>
          <p class="text-xs text-slate-400 mt-0.5 mb-5">Rate per session (last 10)</p>

          <div v-if="trendPoints.length < 2" class="flex items-center justify-center h-28 text-slate-400 text-sm text-center">
            Not enough sessions for a trend yet.
          </div>
          <div v-else class="space-y-2">
            <svg viewBox="0 0 220 100" preserveAspectRatio="none" class="w-full h-28">
              <defs>
                <linearGradient id="trendGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stop-color="#bc9333" stop-opacity="0.35"/>
                  <stop offset="100%" stop-color="#bc9333" stop-opacity="0.02"/>
                </linearGradient>
              </defs>
              <path :d="sparkAreaPath" fill="url(#trendGrad)"/>
              <path :d="sparkLinePath" fill="none" stroke="#bc9333" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/>
              <circle v-for="(pt, i) in trendPoints" :key="i" :cx="pt.x" :cy="pt.y" r="3.5" fill="#bc9333" stroke="#fff" stroke-width="1.5"/>
            </svg>
            <div class="flex justify-between text-[11px] font-mono text-slate-400">
              <span>{{ trendMin }}%</span>
              <span>{{ trendMax }}%</span>
            </div>
            <div class="flex justify-between text-[10px] font-mono text-slate-400">
              <span>{{ trendDates[0] }}</span>
              <span>{{ trendDates[trendDates.length - 1] }}</span>
            </div>
          </div>
        </div>
      </div>

      <!-- At-Risk Students Table -->
      <div v-if="atRiskStudents.length > 0" class="bg-white dark:bg-[#071328] border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm overflow-hidden">
        <div class="p-5 sm:p-6 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between gap-4">
          <div>
            <h2 class="text-base font-display font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <AlertTriangle class="w-4 h-4 text-amber-500" />
              At-Risk Students
            </h2>
            <p class="text-xs text-slate-400 mt-0.5">Students with attendance below 75% in one or more courses</p>
          </div>
          <span class="px-3 py-1 rounded-full text-xs font-mono font-bold bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-400 border border-rose-200 dark:border-rose-800">
            {{ atRiskStudents.length }} student{{ atRiskStudents.length !== 1 ? 's' : '' }}
          </span>
        </div>
        <div class="overflow-x-auto">
          <table class="w-full text-left text-xs border-collapse">
            <thead>
              <tr class="bg-slate-50/80 dark:bg-slate-900/50 text-slate-500 dark:text-slate-400 font-mono uppercase text-[11px] tracking-wider border-b border-slate-200 dark:border-slate-800">
                <th class="py-3 px-4 font-semibold">Student</th>
                <th class="py-3 px-4 font-semibold">Course</th>
                <th class="py-3 px-4 font-semibold text-center">Attended</th>
                <th class="py-3 px-4 font-semibold">Rate</th>
                <th class="py-3 px-4 font-semibold">Status</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-slate-100 dark:divide-slate-800/60">
              <tr v-for="s in atRiskStudents" :key="s.key" class="hover:bg-slate-50/60 dark:hover:bg-slate-800/30 transition-colors">
                <td class="py-3 px-4">
                  <div class="flex items-center gap-2.5">
                    <div class="w-7 h-7 rounded-lg bg-violet-100 dark:bg-violet-950/50 text-violet-700 dark:text-violet-400 flex items-center justify-center font-bold text-xs uppercase">
                      {{ (s.name || '?').charAt(0) }}
                    </div>
                    <div>
                      <div class="font-semibold text-slate-900 dark:text-slate-100">{{ s.name }}</div>
                      <div class="text-[10px] text-slate-400 font-mono">{{ s.idNumber }}</div>
                    </div>
                  </div>
                </td>
                <td class="py-3 px-4">
                  <span class="font-mono text-[11px] font-bold px-2 py-0.5 rounded bg-primary/10 text-primary dark:bg-secondary/15 dark:text-secondary">{{ s.courseCode }}</span>
                </td>
                <td class="py-3 px-4 text-center font-mono font-semibold text-slate-700 dark:text-slate-300">{{ s.attended }} / {{ s.total }}</td>
                <td class="py-3 px-4">
                  <div class="flex items-center gap-2">
                    <div class="w-14 h-1.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                      <div
                        class="h-full rounded-full"
                        :class="s.rate >= 75 ? 'bg-emerald-500' : s.rate >= 50 ? 'bg-amber-500' : 'bg-rose-500'"
                        :style="{ width: s.rate + '%' }"
                      ></div>
                    </div>
                    <span
                      class="font-mono font-bold text-xs"
                      :class="s.rate >= 75 ? 'text-emerald-600 dark:text-emerald-400' : s.rate >= 50 ? 'text-amber-600 dark:text-amber-400' : 'text-rose-600 dark:text-rose-400'"
                    >{{ s.rate }}%</span>
                  </div>
                </td>
                <td class="py-3 px-4">
                  <span
                    class="inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-mono font-bold"
                    :class="s.rate < 50 ? 'bg-rose-50 text-rose-700 dark:bg-rose-950/40 dark:text-rose-400 border border-rose-200 dark:border-rose-800' : 'bg-amber-50 text-amber-700 dark:bg-amber-950/40 dark:text-amber-400 border border-amber-200 dark:border-amber-800'"
                  >
                    {{ s.rate < 50 ? 'Critical' : 'At Risk' }}
                  </span>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <!-- Session History Table -->
      <div class="bg-white dark:bg-[#071328] border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm overflow-hidden">
        <div class="p-5 sm:p-6 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between gap-4">
          <div>
            <h2 class="text-base font-display font-bold text-slate-900 dark:text-white">Session History</h2>
            <p class="text-xs text-slate-400 mt-0.5">All recorded student attendance sessions</p>
          </div>
          <span class="px-3 py-1 rounded-lg text-xs font-mono bg-primary/5 dark:bg-secondary/10 border border-primary/20 dark:border-secondary/20 text-primary dark:text-secondary font-semibold">
            {{ filteredSessions.length }} Session{{ filteredSessions.length !== 1 ? 's' : '' }}
          </span>
        </div>

        <div v-if="filteredSessions.length === 0" class="p-10 text-center text-slate-400 text-sm">
          No sessions for the selected filter.
        </div>
        <div v-else class="overflow-x-auto">
          <table class="w-full text-left text-xs border-collapse">
            <thead>
              <tr class="bg-slate-50/80 dark:bg-slate-900/50 text-slate-500 dark:text-slate-400 font-mono uppercase text-[11px] tracking-wider border-b border-slate-200 dark:border-slate-800">
                <th class="py-3 px-4 font-semibold">Date & Time</th>
                <th class="py-3 px-4 font-semibold">Course</th>
                <th class="py-3 px-4 font-semibold">Mode</th>
                <th class="py-3 px-4 font-semibold">PIN</th>
                <th class="py-3 px-4 font-semibold text-center">Present</th>
                <th class="py-3 px-4 font-semibold text-center">Absent</th>
                <th class="py-3 px-4 font-semibold">Rate</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-slate-100 dark:divide-slate-800/60 font-sans">
              <tr v-for="s in filteredSessions" :key="s.id" class="hover:bg-slate-50/60 dark:hover:bg-slate-800/30 transition-colors">
                <td class="py-3 px-4">
                  <div class="font-semibold text-slate-900 dark:text-slate-100">{{ formatDate(s.createdAt) }}</div>
                  <div class="text-[10px] text-slate-400 font-mono">{{ formatTime(s.createdAt) }}</div>
                </td>
                <td class="py-3 px-4">
                  <div class="flex flex-col gap-0.5">
                    <span class="font-mono text-[11px] font-bold px-1.5 py-0.5 rounded bg-primary/10 text-primary dark:bg-secondary/15 dark:text-secondary w-fit">{{ s.courseCode }}</span>
                    <span class="text-slate-500 dark:text-slate-400 text-[11px] max-w-[140px] truncate">{{ s.courseName }}</span>
                  </div>
                </td>
                <td class="py-3 px-4">
                  <span class="text-[11px] font-mono px-2 py-0.5 rounded-md bg-sky-50 dark:bg-sky-950/40 text-sky-700 dark:text-sky-400 border border-sky-100 dark:border-sky-900">
                    {{ s.mode || 'Regular' }}
                  </span>
                </td>
                <td class="py-3 px-4">
                  <code class="font-mono text-xs px-2 py-0.5 rounded bg-slate-900 dark:bg-slate-950 text-cyan-300 tracking-widest">{{ s.pin }}</code>
                </td>
                <td class="py-3 px-4 text-center font-bold text-emerald-600 dark:text-emerald-400 font-mono">{{ s.presentCount }}</td>
                <td class="py-3 px-4 text-center font-bold text-rose-600 dark:text-rose-400 font-mono">{{ s.absentCount }}</td>
                <td class="py-3 px-4">
                  <div class="flex items-center gap-2">
                    <div class="w-10 h-1.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                      <div
                        class="h-full rounded-full"
                        :class="s.rate >= 75 ? 'bg-emerald-500' : s.rate >= 50 ? 'bg-amber-500' : 'bg-rose-500'"
                        :style="{ width: s.rate + '%' }"
                      ></div>
                    </div>
                    <span
                      class="font-mono text-xs font-bold"
                      :class="s.rate >= 75 ? 'text-emerald-600 dark:text-emerald-400' : s.rate >= 50 ? 'text-amber-600 dark:text-amber-400' : 'text-rose-600 dark:text-rose-400'"
                    >{{ s.rate }}%</span>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <!-- Class Rep Lecturer Attendance -->
      <div class="bg-white dark:bg-[#071328] border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm overflow-hidden">
        <div class="p-5 sm:p-6 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between gap-4">
          <div>
            <h2 class="text-base font-display font-bold text-slate-900 dark:text-white">Class Rep Attendance Reports</h2>
            <p class="text-xs text-slate-400 mt-0.5">Lecturer attendance marked by class representatives</p>
          </div>
          <span class="px-3 py-1 rounded-lg text-xs font-mono bg-teal-50 dark:bg-teal-950/40 text-teal-700 dark:text-teal-400 border border-teal-200 dark:border-teal-800 font-semibold">
            {{ filteredLecturerAttendances.length }} record{{ filteredLecturerAttendances.length !== 1 ? 's' : '' }}
          </span>
        </div>

        <div v-if="filteredLecturerAttendances.length === 0" class="p-10 text-center text-slate-400 text-sm">
          No class rep attendance records found for this lecturer's courses.
        </div>
        <div v-else class="overflow-x-auto">
          <table class="w-full text-left text-xs border-collapse">
            <thead>
              <tr class="bg-slate-50/80 dark:bg-slate-900/50 text-slate-500 dark:text-slate-400 font-mono uppercase text-[11px] tracking-wider border-b border-slate-200 dark:border-slate-800">
                <th class="py-3 px-4 font-semibold">Date & Time</th>
                <th class="py-3 px-4 font-semibold">Course</th>
                <th class="py-3 px-4 font-semibold">Status</th>
                <th class="py-3 px-4 font-semibold">Marked By</th>
                <th class="py-3 px-4 font-semibold">Notes</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-slate-100 dark:divide-slate-800/60 font-sans">
              <tr v-for="r in filteredLecturerAttendances" :key="r.id" class="hover:bg-slate-50/60 dark:hover:bg-slate-800/30 transition-colors">
                <td class="py-3 px-4">
                  <div class="font-semibold text-slate-900 dark:text-slate-100">{{ formatDate(r.date + 'T00:00:00') }}</div>
                  <div class="text-[10px] text-slate-400 font-mono">{{ r.time }}</div>
                </td>
                <td class="py-3 px-4">
                  <div class="flex flex-col gap-0.5">
                    <span class="font-mono text-[11px] font-bold px-1.5 py-0.5 rounded bg-primary/10 text-primary dark:bg-secondary/15 dark:text-secondary w-fit">{{ r.courseCode }}</span>
                    <span class="text-slate-500 dark:text-slate-400 text-[11px]">{{ r.courseName }}</span>
                  </div>
                </td>
                <td class="py-3 px-4">
                  <span
                    class="inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-mono font-bold"
                    :class="{
                      'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800': r.status === 'present',
                      'bg-amber-50 text-amber-700 dark:bg-amber-950/40 dark:text-amber-400 border border-amber-200 dark:border-amber-800': r.status === 'late',
                      'bg-rose-50 text-rose-700 dark:bg-rose-950/40 dark:text-rose-400 border border-rose-200 dark:border-rose-800': r.status === 'absent'
                    }"
                  >
                    {{ r.status === 'present' ? 'Present' : r.status === 'late' ? 'Late' : 'Absent' }}
                  </span>
                </td>
                <td class="py-3 px-4">
                  <div class="flex items-center gap-2">
                    <div class="w-7 h-7 rounded-lg bg-teal-100 dark:bg-teal-950/50 text-teal-700 dark:text-teal-400 flex items-center justify-center font-bold text-xs uppercase">
                      {{ (r.markedByName || '?').charAt(0) }}
                    </div>
                    <div>
                      <div class="font-semibold text-slate-900 dark:text-slate-100">{{ r.markedByName }}</div>
                      <div class="text-[10px] text-slate-400">Class Rep</div>
                    </div>
                  </div>
                </td>
                <td class="py-3 px-4 text-slate-500 dark:text-slate-400 max-w-[200px] truncate">{{ r.notes || '—' }}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </template>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { useAuthStore } from '@/stores/authstore';
import { supabase } from '@/stores/supabase';
import {
  Users,
  TrendingUp,
  Calendar,
  AlertTriangle,
  CheckCircle2,
  Clock
} from 'lucide-vue-next';

const authStore = useAuthStore();

const isLoading = ref(true);
const selectedCourseFilter = ref('all');
const lastUpdated = ref('');
const rawSessions = ref([]);
const rawLecturerAttendances = ref([]);
const rawAttendances = ref([]);

// My courses derived from sessions already filtered by lecturer_id from Supabase
const myCourses = computed(() => {
  const seen = new Set();
  return rawSessions.value
    .filter(s => { if (seen.has(s.courseId)) return false; seen.add(s.courseId); return true; })
    .map(s => ({ id: s.courseId, code: s.courseCode, name: s.courseName }));
});

const filteredSessions = computed(() =>
  selectedCourseFilter.value === 'all'
    ? rawSessions.value
    : rawSessions.value.filter(s => s.courseId === selectedCourseFilter.value)
);

const filteredLecturerAttendances = computed(() =>
  selectedCourseFilter.value === 'all'
    ? rawLecturerAttendances.value
    : rawLecturerAttendances.value.filter(r => r.courseId === selectedCourseFilter.value)
);

const atRiskStudents = computed(() => {
  const list = [];
  myCourses.value.forEach(course => {
    const sessions = rawSessions.value.filter(s => s.courseId === course.id);
    if (!sessions.length) return;
    const ids = new Set(sessions.map(s => s.id));
    const total = sessions.length;
    const byStudent = new Map();
    rawAttendances.value.filter(a => ids.has(a.sessionId)).forEach(a => {
      if (!byStudent.has(a.studentId)) byStudent.set(a.studentId, { present: 0, name: a.studentName, idNumber: a.idNumber });
      if (a.status === 'present') byStudent.get(a.studentId).present++;
    });
    byStudent.forEach((val, sid) => {
      const rate = Math.round((val.present / total) * 100);
      if (rate < 75) list.push({ key: `${course.id}-${sid}`, studentId: sid, name: val.name, idNumber: val.idNumber, courseCode: course.code, attended: val.present, total, rate });
    });
  });
  return list.sort((a, b) => a.rate - b.rate);
});

const perfectStudentCount = computed(() => {
  const s = new Set();
  myCourses.value.forEach(course => {
    const sessions = rawSessions.value.filter(x => x.courseId === course.id);
    if (!sessions.length) return;
    const ids = new Set(sessions.map(x => x.id));
    const total = sessions.length;
    const byS = new Map();
    rawAttendances.value.filter(a => ids.has(a.sessionId)).forEach(a => {
      if (!byS.has(a.studentId)) byS.set(a.studentId, 0);
      if (a.status === 'present') byS.set(a.studentId, byS.get(a.studentId) + 1);
    });
    byS.forEach((c, sid) => { if (c === total) s.add(sid); });
  });
  return s.size;
});

const kpi = computed(() => {
  const sessions = filteredSessions.value;
  const now = new Date(), weekAgo = new Date(now - 7 * 86400000);
  const rates = sessions.filter(s => s.total > 0).map(s => s.rate);
  return {
    totalSessions: sessions.length,
    sessionsThisWeek: sessions.filter(s => new Date(s.createdAt) >= weekAgo).length,
    avgRate: rates.length ? Math.round(rates.reduce((a, b) => a + b, 0) / rates.length) : 0,
    atRisk: atRiskStudents.value.length,
    perfect: perfectStudentCount.value,
  };
});

const courseBreakdown = computed(() =>
  myCourses.value.map((course) => {
    const sessions = rawSessions.value.filter(s => s.courseId === course.id);
    const ids = new Set(sessions.map(s => s.id));
    const rel = rawAttendances.value.filter(a => ids.has(a.sessionId));
    const present = rel.filter(a => a.status === 'present').length;
    const total = rel.length;
    return { id: course.id, code: course.code, name: course.name, sessions: sessions.length, present, total, rate: total > 0 ? Math.round((present / total) * 100) : 0 };
  }).filter(c => c.sessions > 0).sort((a, b) => b.rate - a.rate)
);

// Sparkline
const trendData = computed(() =>
  [...filteredSessions.value].sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt)).slice(-10).filter(s => s.total > 0).map(s => ({ rate: s.rate, date: formatDateShort(s.createdAt) }))
);
const trendPoints = computed(() => {
  const d = trendData.value;
  if (d.length < 2) return [];
  const min = Math.min(...d.map(x => x.rate)), max = Math.max(...d.map(x => x.rate)), range = max - min || 1;
  return d.map((x, i) => ({ x: 8 + (i / (d.length - 1)) * 204, y: 8 + ((max - x.rate) / range) * 84 }));
});
const sparkLinePath = computed(() => trendPoints.value.map((p, i) => `${i === 0 ? 'M' : 'L'}${p.x.toFixed(1)},${p.y.toFixed(1)}`).join(' '));
const sparkAreaPath = computed(() => {
  const pts = trendPoints.value;
  if (pts.length < 2) return '';
  return sparkLinePath.value + ` L${pts[pts.length-1].x.toFixed(1)},100 L${pts[0].x.toFixed(1)},100 Z`;
});
const trendMin = computed(() => trendData.value.length ? Math.min(...trendData.value.map(d => d.rate)) : 0);
const trendMax = computed(() => trendData.value.length ? Math.max(...trendData.value.map(d => d.rate)) : 0);
const trendDates = computed(() => trendData.value.map(d => d.date));

function formatDate(iso) { return iso ? new Date(iso).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }) : '—'; }
function formatTime(iso) { return iso ? new Date(iso).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' }) : ''; }
function formatDateShort(iso) { return iso ? new Date(iso).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' }) : ''; }

const isAdmin = computed(() => {
  const role = (authStore.profile?.role || '').toUpperCase().replace(/[\s_-]+/g, '_');
  return role === 'ADMIN' || role === 'SUPER_ADMIN';
});

// Admin-only: lecturer list + selection
const allLecturers = ref([]);
const selectedLecturerId = ref('');
const selectedLecturer = computed(() => allLecturers.value.find(l => l.id === selectedLecturerId.value) ?? null);

async function fetchAllLecturers() {
  try {
    const { data } = await supabase
      .from('users')
      .select('id, name, email, role')
      .or('role.ilike.lecturer,role.ilike.staff')
      .order('name');
    if (!data) return;
    const { data: sessionCounts } = await supabase
      .from('sessions')
      .select('lecturer_id, course_id');
    const coursesByLec = new Map();
    (sessionCounts ?? []).forEach(s => {
      if (!coursesByLec.has(s.lecturer_id)) coursesByLec.set(s.lecturer_id, new Set());
      coursesByLec.get(s.lecturer_id).add(s.course_id);
    });
    allLecturers.value = data.map(u => ({
      id: u.id,
      name: u.name || u.email || 'Lecturer',
      email: u.email,
      courseCount: coursesByLec.get(u.id)?.size ?? 0,
    }));
  } catch (e) { console.error('[Analytics] fetchAllLecturers', e); }
}

async function loadAnalytics() {
  const lecturerId = isAdmin.value ? selectedLecturerId.value : authStore.profile?.id;
  if (!lecturerId) { isLoading.value = false; return; }
  isLoading.value = true;
  selectedCourseFilter.value = 'all';
  rawSessions.value = [];
  rawAttendances.value = [];
  rawLecturerAttendances.value = [];
  try {
    const { data: sd } = await supabase.from('sessions').select('id,course_id,mode,pin,created_at,courses(code,name)').eq('lecturer_id', lecturerId).order('created_at', { ascending: false });
    const sessionIds = (sd ?? []).map(s => s.id);
    let ad = [];
    if (sessionIds.length) {
      const { data } = await supabase.from('attendances').select('id,session_id,student_id,status,users(name,id_number)').in('session_id', sessionIds);
      ad = data ?? [];
    }
    const bySession = new Map();
    ad.forEach(a => { if (!bySession.has(a.session_id)) bySession.set(a.session_id, []); bySession.get(a.session_id).push(a); });
    rawAttendances.value = ad.map(a => ({ sessionId: a.session_id, studentId: a.student_id, status: a.status, studentName: a.users?.name || 'Unknown', idNumber: a.users?.id_number || '—' }));
    rawSessions.value = (sd ?? []).map(s => {
      const atts = bySession.get(s.id) ?? [];
      const presentCount = atts.filter(a => a.status === 'present').length;
      const absentCount = atts.filter(a => a.status === 'absent').length;
      const total = atts.length;
      return { id: s.id, courseId: s.course_id, courseCode: s.courses?.code ?? '—', courseName: s.courses?.name ?? 'Unknown', mode: s.mode, pin: s.pin, createdAt: s.created_at, presentCount, absentCount, total, rate: total > 0 ? Math.round((presentCount / total) * 100) : 0 };
    });
    const lecturerCourseIds = [...new Set((sd ?? []).map(s => s.course_id))];
    if (lecturerCourseIds.length) {
      const { data: laData } = await supabase
        .from('lecturer_attendances')
        .select('id, course_id, date, time, status, notes, marked_by_id, courses(code, name), users!lecturer_attendances_marked_by_id_fkey(name)')
        .in('course_id', lecturerCourseIds)
        .order('date', { ascending: false });
      if (laData) {
        rawLecturerAttendances.value = laData.map(r => ({
          id: r.id,
          courseId: r.course_id,
          courseCode: r.courses?.code ?? '—',
          courseName: r.courses?.name ?? 'Unknown',
          date: r.date,
          time: r.time ?? '—',
          status: r.status ?? 'present',
          notes: r.notes ?? '',
          markedById: r.marked_by_id,
          markedByName: r.users?.name ?? 'Class Rep',
        }));
      }
    }
    lastUpdated.value = 'Updated ' + formatTime(new Date().toISOString());
  } catch (e) { console.error('[Analytics]', e); }
  finally { isLoading.value = false; }
}

onMounted(async () => {
  if (isAdmin.value) {
    isLoading.value = false;
    await fetchAllLecturers();
  } else {
    await loadAnalytics();
  }
});
</script>
