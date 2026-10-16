<template>
  <div class="space-y-8 p-1 sm:p-2 lg:p-4 animate-in fade-in duration-500">

    <!-- Header -->
    <div class="relative bg-white dark:bg-dark-surface border border-slate-200/80 dark:border-dark-outline/60 rounded-2xl p-6 sm:p-8 shadow-sm overflow-hidden">
      <div class="absolute inset-0 bg-[radial-gradient(#031c45_1px,transparent_1px)] dark:bg-[radial-gradient(#bc9333_1px,transparent_1px)] opacity-[0.03] dark:opacity-[0.05] bg-[size:16px_16px] pointer-events-none"></div>
      <div class="absolute top-2 left-2 w-3 h-3 border-t-2 border-l-2 border-secondary/40 pointer-events-none"></div>
      <div class="absolute top-2 right-2 w-3 h-3 border-t-2 border-r-2 border-secondary/40 pointer-events-none"></div>

      <div class="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div class="flex items-center gap-2 mb-1.5">
            <span class="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-mono font-medium tracking-wide uppercase bg-primary/10 text-primary dark:bg-secondary/15 dark:text-secondary border border-primary/20 dark:border-secondary/30">
              <MessageSquare class="w-3 h-3" />
              ADMIN // SUGGESTION BOX & 3-DAY SLA
            </span>
          </div>
          <h1 class="text-2xl sm:text-3xl font-display font-bold text-slate-900 dark:text-white tracking-tight">Suggestion Box</h1>
          <p class="text-sm text-slate-500 dark:text-white/75 mt-1">Review student feedback and manage automated 3-day SLA responses.</p>
        </div>

        <!-- Header Actions: Auto-Responder Settings & Export -->
        <div class="flex items-center flex-wrap gap-2 pt-1 md:pt-0">
          <!-- Auto-responder quick config trigger -->
          <button
            @click="openAutoResponderSettings"
            class="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl border border-secondary/40 bg-secondary/10 dark:bg-secondary/15 text-primary dark:text-secondary text-xs font-mono font-bold hover:bg-secondary/20 transition-all shadow-xs cursor-pointer active:scale-95"
            title="Configure automated responses and 3-day SLA turnaround window"
          >
            <Bot class="w-3.5 h-3.5 text-secondary" />
            <span>Auto-Responder: {{ autoResponderConfig.enabled ? 'Active (3d SLA)' : 'Paused' }}</span>
            <Sliders class="w-3 h-3 opacity-60 ml-0.5" />
          </button>

          <button
            @click="downloadCSV('filtered')"
            :disabled="filtered.length === 0"
            title="Download CSV spreadsheet of current list"
            class="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-emerald-200 dark:border-emerald-800/60 bg-emerald-50 dark:bg-emerald-950/30 text-emerald-700 dark:text-emerald-400 text-xs font-mono font-bold hover:bg-emerald-100 dark:hover:bg-emerald-900/40 transition-all disabled:opacity-40 disabled:cursor-not-allowed active:scale-95 cursor-pointer shadow-xs"
          >
            <FileSpreadsheet class="w-3.5 h-3.5" />
            <span>Download CSV ({{ filtered.length }})</span>
          </button>

          <button
            @click="downloadPDF('filtered')"
            :disabled="filtered.length === 0"
            title="Print or Save PDF report of suggestions"
            class="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-sky-200 dark:border-sky-800/60 bg-sky-50 dark:bg-sky-950/30 text-sky-700 dark:text-sky-400 text-xs font-mono font-bold hover:bg-sky-100 dark:hover:bg-sky-900/40 transition-all disabled:opacity-40 disabled:cursor-not-allowed active:scale-95 cursor-pointer shadow-xs"
          >
            <Printer class="w-3.5 h-3.5" />
            <span>PDF Report</span>
          </button>

          <!-- Dropdown for more export options -->
          <div class="relative export-dropdown-container">
            <button
              @click.stop="exportDropdownOpen = !exportDropdownOpen"
              class="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl border border-slate-200 dark:border-dark-outline/70 bg-white dark:bg-dark-muted text-slate-700 dark:text-white/90 text-xs font-mono font-bold hover:border-secondary transition-all shadow-xs cursor-pointer"
            >
              <Download class="w-3.5 h-3.5 text-secondary" />
              <span>Export</span>
              <ChevronDown class="w-3 h-3 text-slate-400 transition-transform" :class="{ 'rotate-180': exportDropdownOpen }" />
            </button>

            <div
              v-if="exportDropdownOpen"
              class="absolute right-0 mt-2 w-56 rounded-xl bg-white dark:bg-dark-surface border border-slate-200 dark:border-dark-outline shadow-2xl py-1.5 z-40 animate-in fade-in zoom-in-95 duration-150"
            >
              <button
                @click="downloadCSV('all'); exportDropdownOpen = false"
                :disabled="suggestions.length === 0"
                class="w-full text-left px-3.5 py-2 text-xs font-mono flex items-center gap-2 hover:bg-slate-50 dark:hover:bg-dark-muted text-slate-700 dark:text-white/90 disabled:opacity-40 cursor-pointer"
              >
                <FileSpreadsheet class="w-3.5 h-3.5 text-emerald-500" />
                <span>Export All as CSV ({{ suggestions.length }})</span>
              </button>
              <button
                @click="downloadJSON('filtered'); exportDropdownOpen = false"
                :disabled="filtered.length === 0"
                class="w-full text-left px-3.5 py-2 text-xs font-mono flex items-center gap-2 hover:bg-slate-50 dark:hover:bg-dark-muted text-slate-700 dark:text-white/90 disabled:opacity-40 cursor-pointer"
              >
                <FileText class="w-3.5 h-3.5 text-amber-500" />
                <span>Export Filtered JSON</span>
              </button>
              <button
                @click="downloadJSON('all'); exportDropdownOpen = false"
                :disabled="suggestions.length === 0"
                class="w-full text-left px-3.5 py-2 text-xs font-mono flex items-center gap-2 hover:bg-slate-50 dark:hover:bg-dark-muted text-slate-700 dark:text-white/90 disabled:opacity-40 cursor-pointer border-t border-slate-100 dark:border-dark-outline"
              >
                <FileText class="w-3.5 h-3.5 text-primary dark:text-secondary" />
                <span>Full JSON Backup ({{ suggestions.length }})</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- ── Automated 3-Day SLA Responder Control Banner ── -->
    <div class="relative rounded-2xl bg-gradient-to-r from-sky-50 via-indigo-50/50 to-white dark:from-dark-surface dark:via-dark-muted/40 dark:to-dark-surface border border-sky-200/80 dark:border-sky-900/60 p-5 shadow-xs overflow-hidden">
      <div class="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div class="flex items-start gap-3.5">
          <div class="w-10 h-10 rounded-xl bg-sky-500/10 dark:bg-sky-400/15 border border-sky-500/30 flex items-center justify-center shrink-0 text-sky-600 dark:text-sky-400 mt-0.5">
            <Bot class="w-5 h-5" />
          </div>
          <div>
            <div class="flex items-center gap-2">
              <h2 class="text-sm font-bold font-display text-slate-900 dark:text-white">
                Automated 3-Day SLA Response System
              </h2>
              <span 
                class="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-mono font-bold border"
                :class="autoResponderConfig.enabled 
                  ? 'bg-emerald-50 text-emerald-700 border-emerald-300 dark:bg-emerald-950/40 dark:text-emerald-400 dark:border-emerald-800' 
                  : 'bg-slate-100 text-slate-600 border-slate-300 dark:bg-dark-muted dark:text-white/60 dark:border-dark-outline'"
              >
                <span class="w-1.5 h-1.5 rounded-full" :class="autoResponderConfig.enabled ? 'bg-emerald-500 animate-pulse' : 'bg-slate-400'"></span>
                <span>{{ autoResponderConfig.enabled ? 'Auto-Responder Armed' : 'Auto-Responder Paused' }}</span>
              </span>
            </div>
            <p class="text-xs text-slate-600 dark:text-white/75 mt-0.5 max-w-2xl">
              Guarantees every student receives an official acknowledgment committing to an administrative review within 
              <strong class="text-sky-700 dark:text-sky-300 font-bold">3 business days (72 hours)</strong>. Tickets track live countdowns and overdue alerts.
            </p>
          </div>
        </div>

        <div class="flex items-center flex-wrap gap-2.5 shrink-0">
          <button
            @click="batchAutoRespond"
            :disabled="isBatching || unrespondedCount === 0"
            title="Send automated 3-day SLA response to all tickets without a note"
            class="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-sky-600 hover:bg-sky-700 text-white text-xs font-mono font-bold transition-all disabled:opacity-40 disabled:cursor-not-allowed shadow-xs cursor-pointer active:scale-95"
          >
            <Loader2 v-if="isBatching" class="w-3.5 h-3.5 animate-spin" />
            <Zap v-else class="w-3.5 h-3.5" />
            <span>Auto-Respond to All Unanswered ({{ unrespondedCount }})</span>
          </button>

          <button
            @click="openAutoResponderSettings"
            class="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl border border-slate-200 dark:border-dark-outline/70 bg-white dark:bg-dark-muted text-xs font-mono font-medium text-slate-700 dark:text-white/90 hover:border-sky-400 transition-all cursor-pointer shadow-2xs"
          >
            <Sliders class="w-3.5 h-3.5 text-slate-500" />
            <span>Edit Template</span>
          </button>
        </div>
      </div>
    </div>

    <!-- KPI Pills with SLA Counters -->
    <div class="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
      <div class="p-3.5 rounded-xl bg-slate-50 dark:bg-dark-surface border border-slate-200 dark:border-dark-outline shadow-2xs">
        <div class="text-2xl font-display font-extrabold text-slate-900 dark:text-white">{{ suggestions.length }}</div>
        <div class="text-[11px] font-mono uppercase tracking-wider text-slate-500 dark:text-white/60 font-bold mt-0.5">Total Tickets</div>
      </div>
      <div class="p-3.5 rounded-xl bg-sky-50 dark:bg-sky-950/40 border border-sky-200 dark:border-sky-800 shadow-2xs">
        <div class="text-2xl font-display font-extrabold text-sky-700 dark:text-sky-400">{{ unread }}</div>
        <div class="text-[11px] font-mono uppercase tracking-wider text-sky-600 dark:text-sky-400 font-bold mt-0.5">Unread</div>
      </div>
      <div class="p-3.5 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 shadow-2xs">
        <div class="text-2xl font-display font-extrabold text-amber-700 dark:text-amber-400">{{ reviewed }}</div>
        <div class="text-[11px] font-mono uppercase tracking-wider text-amber-600 dark:text-amber-400 font-bold mt-0.5">Reviewed</div>
      </div>
      <div class="p-3.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 shadow-2xs">
        <div class="text-2xl font-display font-extrabold text-emerald-700 dark:text-emerald-400">{{ resolved }}</div>
        <div class="text-[11px] font-mono uppercase tracking-wider text-emerald-600 dark:text-emerald-400 font-bold mt-0.5">Resolved</div>
      </div>
      <!-- SLA Active -->
      <div class="p-3.5 rounded-xl bg-indigo-50 dark:bg-indigo-950/40 border border-indigo-200 dark:border-indigo-800 shadow-2xs">
        <div class="text-2xl font-display font-extrabold text-indigo-700 dark:text-indigo-400">{{ activeWithinSla }}</div>
        <div class="text-[11px] font-mono uppercase tracking-wider text-indigo-600 dark:text-indigo-400 font-bold mt-0.5">Within 3d SLA</div>
      </div>
      <!-- SLA Overdue Alert -->
      <div class="p-3.5 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 shadow-2xs">
        <div class="text-2xl font-display font-extrabold text-rose-700 dark:text-rose-400 flex items-center justify-between">
          <span>{{ overdueCount }}</span>
          <AlertTriangle v-if="overdueCount > 0" class="w-5 h-5 text-rose-500 animate-bounce" />
        </div>
        <div class="text-[11px] font-mono uppercase tracking-wider text-rose-600 dark:text-rose-400 font-bold mt-0.5">Overdue SLA (>3d)</div>
      </div>
    </div>

    <!-- Filters Strip -->
    <div class="bg-white dark:bg-dark-surface border border-slate-200/80 dark:border-dark-outline/60 rounded-2xl p-5 shadow-sm flex flex-col sm:flex-row flex-wrap gap-3">
      <div class="flex-1 relative min-w-[200px]">
        <Search class="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
        <input v-model="search" type="text" placeholder="Search subject or message…"
          class="w-full pl-10 pr-4 py-2.5 bg-slate-50 dark:bg-dark-muted/80 border border-slate-200 dark:border-dark-outline/70 rounded-xl text-sm text-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-secondary/50 transition-all" />
      </div>
      <select v-model="filterStatus"
        class="bg-slate-50 dark:bg-dark-muted/80 border border-slate-200 dark:border-dark-outline/70 rounded-xl px-3 py-2.5 text-sm text-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-secondary/50">
        <option value="">All Statuses</option>
        <option value="unread">Unread</option>
        <option value="reviewed">Reviewed</option>
        <option value="resolved">Resolved</option>
      </select>
      <select v-model="filterCategory"
        class="bg-slate-50 dark:bg-dark-muted/80 border border-slate-200 dark:border-dark-outline/70 rounded-xl px-3 py-2.5 text-sm text-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-secondary/50">
        <option value="">All Categories</option>
        <option value="complaint">Complaint</option>
        <option value="suggestion">Suggestion</option>
        <option value="feedback">Feedback</option>
        <option value="other">Other</option>
      </select>
      <!-- SLA Filter Dropdown -->
      <select v-model="filterSla"
        class="bg-slate-50 dark:bg-dark-muted/80 border border-slate-200 dark:border-dark-outline/70 rounded-xl px-3 py-2.5 text-sm text-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-secondary/50">
        <option value="">All SLA Timelines</option>
        <option value="within_sla">Active (Within 3-Day SLA)</option>
        <option value="urgent">Urgent (&lt; 24h Remaining)</option>
        <option value="overdue">Overdue (&gt; 3 Days)</option>
        <option value="responded">Responded / SLA Completed</option>
      </select>
      <button @click="load" :disabled="isLoading"
        class="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl border border-slate-200 dark:border-dark-outline/70 bg-white dark:bg-dark-muted text-slate-600 dark:text-white/90 hover:text-primary dark:hover:text-secondary text-sm font-medium transition-all shadow-sm disabled:opacity-50 whitespace-nowrap cursor-pointer"
      >
        <RefreshCw class="w-4 h-4" :class="{ 'animate-spin': isLoading }" />
        Refresh
      </button>
    </div>

    <!-- Loading -->
    <div v-if="isLoading" class="flex flex-col items-center justify-center py-20">
      <Loader2 class="w-10 h-10 text-secondary animate-spin mb-4" />
      <p class="text-sm font-mono text-slate-500 dark:text-white/75">LOADING SUBMISSIONS...</p>
    </div>

    <!-- Empty -->
    <div v-else-if="filtered.length === 0" class="bg-white dark:bg-dark-surface border border-dashed border-slate-200 dark:border-dark-outline rounded-2xl p-14 text-center">
      <MessageSquare class="w-12 h-12 text-slate-300 dark:text-white/40 mx-auto mb-4" />
      <p class="text-sm text-slate-400">No submissions found.</p>
    </div>

    <!-- Cards List with 3-Day SLA Countdown -->
    <div v-else class="space-y-4">
      <div
        v-for="s in filtered"
        :key="s.id"
        :class="['bg-white dark:bg-dark-surface border rounded-2xl p-5 shadow-sm hover:shadow-md transition-all border-l-4 space-y-3.5', 
          getCategoryBorder(s.category),
          getSLA(s).isOverdue ? 'border-rose-300 dark:border-rose-900/60 ring-1 ring-rose-500/20' : 'border-slate-200 dark:border-dark-outline'
        ]"
      >
        <!-- Top row: Category, Status, SLA Badge, Date -->
        <div class="flex flex-wrap items-center justify-between gap-2">
          <div class="flex flex-wrap items-center gap-2">
            <span :class="['inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-mono font-bold border', getCategoryBadge(s.category)]">
              {{ catLabel(s.category) }}
            </span>
            <span :class="['inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-mono font-bold border', getStatusBadge(s.status)]">
              {{ statusLabel(s.status) }}
            </span>

            <!-- ── 3-Day SLA Status Pill ── -->
            <span 
              v-if="s.status === 'resolved'"
              class="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-emerald-50 text-emerald-700 border border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-400 dark:border-emerald-800"
            >
              <CheckCircle2 class="w-3 h-3 text-emerald-500" />
              <span>Resolved</span>
            </span>

            <span 
              v-else-if="getSLA(s).isOverdue"
              class="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-rose-50 text-rose-700 border border-rose-300 dark:bg-rose-950/50 dark:text-rose-400 dark:border-rose-800"
            >
              <span class="w-1.5 h-1.5 rounded-full bg-rose-500 animate-ping"></span>
              <AlertTriangle class="w-3 h-3 text-rose-500" />
              <span>SLA BREACHED: {{ getSLA(s).remainingText }}</span>
            </span>

            <span 
              v-else-if="getSLA(s).isUrgent"
              class="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-amber-50 text-amber-700 border border-amber-300 dark:bg-amber-950/40 dark:text-amber-400 dark:border-amber-800"
            >
              <Clock class="w-3 h-3 text-amber-500" />
              <span>URGENT: {{ getSLA(s).remainingText }} (Due Today)</span>
            </span>

            <span 
              v-else
              class="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-sky-50 text-sky-700 border border-sky-200 dark:bg-sky-950/40 dark:text-sky-400 dark:border-sky-800"
            >
              <Clock class="w-3 h-3 text-sky-500" />
              <span>3-Day SLA: {{ getSLA(s).remainingText }} (Target: {{ getSLA(s).deadlineFormatted }})</span>
            </span>
          </div>

          <span class="text-[11px] font-mono text-slate-400">{{ fmtDateTime(s.createdAt) }}</span>
        </div>

        <!-- 3-Day SLA Progress Bar (only when active/pending) -->
        <div v-if="s.status !== 'resolved'" class="w-full bg-slate-100 dark:bg-dark-muted/60 h-1.5 rounded-full overflow-hidden">
          <div 
            class="h-full transition-all duration-500 rounded-full"
            :class="{
              'bg-rose-500': getSLA(s).isOverdue,
              'bg-amber-500': getSLA(s).isUrgent && !getSLA(s).isOverdue,
              'bg-sky-500': !getSLA(s).isUrgent && !getSLA(s).isOverdue,
            }"
            :style="{ width: `${getSLA(s).progressPct}%` }"
          ></div>
        </div>

        <!-- Student info -->
        <div class="flex items-center gap-2">
          <template v-if="s.isAnonymous">
            <span class="text-[11px] font-mono px-2 py-0.5 rounded-full bg-violet-50 dark:bg-violet-950/40 text-violet-700 dark:text-violet-400 border border-violet-200 dark:border-violet-800 font-bold">
              Anonymous Submission
            </span>
          </template>
          <template v-else>
            <div class="w-7 h-7 rounded-lg bg-gradient-to-br from-primary to-primary/70 dark:from-secondary dark:to-secondary/70 text-white dark:text-primary flex items-center justify-center font-bold text-xs uppercase">
              {{ (s.studentName || '?').charAt(0).toUpperCase() }}
            </div>
            <div>
              <div class="text-xs font-bold text-slate-900 dark:text-white">{{ s.studentName }}</div>
              <div v-if="s.idNumber" class="text-[10px] font-mono text-slate-400">{{ s.idNumber }}</div>
            </div>
          </template>
        </div>

        <!-- Subject + Message -->
        <div>
          <h3 class="font-bold text-sm text-slate-900 dark:text-white mb-1">{{ s.subject }}</h3>
          <p class="text-xs text-slate-600 dark:text-white/75 leading-relaxed whitespace-pre-line">{{ s.message }}</p>
        </div>

        <!-- Automated Response Section -->
        <div v-if="parseNotes(s.adminNote).autoNote" class="p-3 rounded-xl bg-sky-50/80 dark:bg-sky-950/40 border border-sky-200 dark:border-sky-800/70 text-xs space-y-1">
          <div class="flex items-center justify-between gap-2">
            <div class="flex items-center gap-1.5 font-bold text-sky-700 dark:text-sky-400 text-[11px] font-mono uppercase tracking-wider">
              <Bot class="w-3.5 h-3.5" />
              <span>Automated 3-Day SLA Response Dispatched</span>
            </div>
            <span class="text-[10px] font-mono text-sky-600 dark:text-sky-400">Response Guaranteed</span>
          </div>
          <p class="text-slate-700 dark:text-white/85 text-[11px] font-mono whitespace-pre-line leading-relaxed">
            {{ parseNotes(s.adminNote).autoNote }}
          </p>
        </div>

        <!-- Administrative Resolution / Custom Note -->
        <div v-if="parseNotes(s.adminNote).adminNote" class="p-3 rounded-xl bg-secondary/15 dark:bg-secondary/20 border border-secondary/35 text-xs space-y-1">
          <div class="flex items-center gap-1.5 font-bold text-secondary text-[11px] font-mono uppercase tracking-wider">
            <MessageSquare class="w-3.5 h-3.5" />
            <span>Administrative Action & Note:</span>
          </div>
          <p class="text-slate-800 dark:text-white leading-relaxed whitespace-pre-line">
            {{ parseNotes(s.adminNote).adminNote }}
          </p>
        </div>

        <!-- Actions Toolbar -->
        <div class="pt-2 border-t border-slate-100 dark:border-dark-outline flex flex-wrap items-center justify-between gap-2">
          <!-- Status toggles -->
          <div class="flex gap-1.5 flex-wrap">
            <button v-for="st in statusOptions" :key="st.value"
              @click="changeStatus(s, st.value)"
              :disabled="s.status === st.value || s._saving"
              :class="['px-2.5 py-1 rounded-lg text-[11px] font-mono font-bold border transition-all disabled:cursor-not-allowed cursor-pointer',
                s.status === st.value
                  ? getStatusActiveCls(st.value)
                  : 'bg-slate-50 dark:bg-dark-muted text-slate-500 dark:text-white/75 border-slate-200 dark:border-dark-outline/70 hover:border-slate-300 opacity-60 hover:opacity-100'
              ]"
            >{{ st.label }}</button>
          </div>

          <div class="flex items-center flex-wrap gap-2">
            <!-- Quick 1-Click Auto-Response Button -->
            <button
              v-if="!s.adminNote"
              @click="sendAutoResponse(s)"
              :disabled="s._saving"
              title="Apply official automated 3-day SLA response now"
              class="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-sky-300 dark:border-sky-800 bg-sky-50 dark:bg-sky-950/40 text-xs font-semibold text-sky-700 dark:text-sky-300 hover:bg-sky-100 dark:hover:bg-sky-900/40 transition-all cursor-pointer active:scale-95 shadow-2xs"
            >
              <Zap class="w-3.5 h-3.5 text-sky-600 dark:text-sky-400" />
              <span>Send Auto-Response (3d SLA)</span>
            </button>

            <!-- Single Ticket Download Menu -->
            <div class="relative ticket-dropdown-container">
              <button
                @click.stop="toggleTicketMenu(s.id)"
                title="Download or Print this suggestion ticket"
                class="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl border border-slate-200 dark:border-dark-outline/70 bg-slate-50 dark:bg-dark-muted text-xs font-semibold text-slate-600 dark:text-white/80 hover:text-primary dark:hover:text-secondary hover:border-primary/40 transition-all cursor-pointer"
              >
                <Download class="w-3.5 h-3.5 text-secondary" />
                <span>Ticket Slip</span>
                <ChevronDown class="w-3 h-3 text-slate-400" />
              </button>

              <div
                v-if="openTicketMenuId === s.id"
                class="absolute right-0 bottom-full mb-1.5 w-44 rounded-xl bg-white dark:bg-dark-surface border border-slate-200 dark:border-dark-outline shadow-2xl py-1.5 z-40 text-xs font-mono animate-in fade-in zoom-in-95 duration-100"
              >
                <button
                  @click="downloadSingleText(s); openTicketMenuId = null"
                  class="w-full text-left px-3.5 py-2 flex items-center gap-2 hover:bg-slate-50 dark:hover:bg-dark-muted text-slate-700 dark:text-white/90 cursor-pointer"
                >
                  <FileText class="w-3.5 h-3.5 text-primary dark:text-secondary" />
                  <span>Text Slip (.txt)</span>
                </button>
                <button
                  @click="printSingleTicket(s); openTicketMenuId = null"
                  class="w-full text-left px-3.5 py-2 flex items-center gap-2 hover:bg-slate-50 dark:hover:bg-dark-muted text-slate-700 dark:text-white/90 cursor-pointer"
                >
                  <Printer class="w-3.5 h-3.5 text-sky-500" />
                  <span>Print / PDF Slip</span>
                </button>
                <button
                  @click="downloadSingleJSON(s); openTicketMenuId = null"
                  class="w-full text-left px-3.5 py-2 flex items-center gap-2 hover:bg-slate-50 dark:hover:bg-dark-muted text-slate-700 dark:text-white/90 cursor-pointer border-t border-slate-100 dark:border-dark-outline"
                >
                  <FileSpreadsheet class="w-3.5 h-3.5 text-emerald-500" />
                  <span>JSON Record</span>
                </button>
              </div>
            </div>

            <!-- Add/Edit Note button -->
            <button @click="openNote(s)"
              class="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-200 dark:border-dark-outline/70 bg-white dark:bg-dark-muted text-xs font-semibold text-slate-700 dark:text-white/90 hover:border-primary dark:hover:border-secondary hover:text-primary dark:hover:text-secondary transition-all cursor-pointer shadow-2xs"
            >
              <MessageSquare class="w-3.5 h-3.5 text-secondary" />
              {{ s.adminNote ? 'Edit Response Note' : 'Add Response Note' }}
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- ── Note Modal with SLA Quick Templates ── -->
    <Teleport to="body">
      <transition name="fade">
        <div v-if="noteModal.open" class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm" @click.self="noteModal.open = false">
          <div class="relative w-full max-w-lg bg-white dark:bg-dark-surface border border-slate-200 dark:border-dark-outline rounded-2xl shadow-2xl p-6 space-y-4">
            <div class="absolute top-2 left-2 w-3 h-3 border-t-2 border-l-2 border-secondary/40 pointer-events-none"></div>
            <div class="absolute top-2 right-2 w-3 h-3 border-t-2 border-r-2 border-secondary/40 pointer-events-none"></div>

            <div class="flex items-center justify-between">
              <span class="font-display font-bold text-slate-900 dark:text-white text-base">Administrative Response & Resolution</span>
              <button @click="noteModal.open = false" class="p-1.5 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">
                <X class="w-4 h-4" />
              </button>
            </div>

            <div class="p-3 rounded-xl bg-slate-50 dark:bg-dark-muted/60 border border-slate-200/80 dark:border-dark-outline/60 text-xs space-y-1">
              <div class="flex items-center justify-between">
                <span class="font-mono text-slate-500 dark:text-white/60">Ticket Subject:</span>
                <span class="font-mono font-bold text-slate-800 dark:text-white truncate max-w-xs">{{ noteModal.subject }}</span>
              </div>
              <div v-if="noteModal.slaInfo" class="flex items-center justify-between pt-1 border-t border-slate-200/50 dark:border-dark-outline/40">
                <span class="font-mono text-slate-500 dark:text-white/60">3-Day SLA Target:</span>
                <span class="font-mono font-bold text-sky-600 dark:text-sky-400">
                  {{ noteModal.slaInfo.deadlineFormatted }} ({{ noteModal.slaInfo.remainingText }})
                </span>
              </div>
            </div>

            <!-- Quick Template Insert Buttons -->
            <div>
              <span class="block text-[11px] font-mono font-bold uppercase tracking-wider text-slate-500 dark:text-white/60 mb-1.5">
                Quick Template Responses
              </span>
              <div class="grid grid-cols-2 gap-1.5">
                <button
                  type="button"
                  @click="insertTemplate('auto')"
                  class="px-2.5 py-1.5 text-left text-xs font-mono rounded-lg border border-slate-200 dark:border-dark-outline hover:border-sky-400 bg-white dark:bg-dark-muted text-slate-700 dark:text-white/90 transition-all cursor-pointer"
                >
                  ⚡ Auto-Response (3d SLA)
                </button>
                <button
                  type="button"
                  @click="insertTemplate('under_review')"
                  class="px-2.5 py-1.5 text-left text-xs font-mono rounded-lg border border-slate-200 dark:border-dark-outline hover:border-amber-400 bg-white dark:bg-dark-muted text-slate-700 dark:text-white/90 transition-all cursor-pointer"
                >
                  ⚡ Under Active Review
                </button>
                <button
                  type="button"
                  @click="insertTemplate('resolved')"
                  class="px-2.5 py-1.5 text-left text-xs font-mono rounded-lg border border-slate-200 dark:border-dark-outline hover:border-emerald-400 bg-white dark:bg-dark-muted text-slate-700 dark:text-white/90 transition-all cursor-pointer"
                >
                  ⚡ Resolved Notice
                </button>
                <button
                  type="button"
                  @click="insertTemplate('clarify')"
                  class="px-2.5 py-1.5 text-left text-xs font-mono rounded-lg border border-slate-200 dark:border-dark-outline hover:border-violet-400 bg-white dark:bg-dark-muted text-slate-700 dark:text-white/90 transition-all cursor-pointer"
                >
                  ⚡ Request Information
                </button>
              </div>
            </div>

            <textarea
              v-model="noteModal.note"
              rows="6"
              placeholder="Write administrative response note, resolution details, or action plan…"
              class="w-full bg-slate-50 dark:bg-dark-muted/80 border border-slate-200 dark:border-dark-outline/70 rounded-xl px-3 py-2.5 text-sm text-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-secondary/50 resize-y transition-all font-mono"
            ></textarea>

            <!-- Status update option -->
            <div class="flex items-center gap-2">
              <input type="checkbox" id="mark-resolved" v-model="noteModal.markResolved" class="rounded border-slate-300 text-primary focus:ring-secondary cursor-pointer" />
              <label for="mark-resolved" class="text-xs font-mono text-slate-700 dark:text-white/90 cursor-pointer">
                Mark status as <strong>Resolved</strong> upon saving
              </label>
            </div>

            <div class="flex items-center justify-end gap-3 pt-2">
              <button @click="noteModal.open = false" class="px-4 py-2.5 rounded-xl border border-slate-200 dark:border-dark-outline/70 text-sm font-semibold text-slate-700 dark:text-white/90 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer">
                Cancel
              </button>
              <button @click="saveNote" :disabled="noteModal.saving"
                class="px-5 py-2.5 rounded-xl bg-primary hover:bg-primary/90 text-white text-sm font-semibold transition-all shadow-md inline-flex items-center gap-2 disabled:opacity-50 active:scale-95 cursor-pointer"
              >
                <Loader2 v-if="noteModal.saving" class="w-4 h-4 animate-spin" />
                <span>{{ noteModal.saving ? 'Saving…' : 'Save Response' }}</span>
              </button>
            </div>
          </div>
        </div>
      </transition>
    </Teleport>

    <!-- ── Auto-Responder Settings Modal ── -->
    <Teleport to="body">
      <transition name="fade">
        <div v-if="autoResponderModal.open" class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm" @click.self="autoResponderModal.open = false">
          <div class="relative w-full max-w-lg bg-white dark:bg-dark-surface border border-slate-200 dark:border-dark-outline rounded-2xl shadow-2xl p-6 space-y-4">
            <div class="flex items-center justify-between">
              <div class="flex items-center gap-2">
                <Bot class="w-5 h-5 text-secondary" />
                <span class="font-display font-bold text-slate-900 dark:text-white text-base">Auto-Responder & SLA Settings</span>
              </div>
              <button @click="autoResponderModal.open = false" class="p-1.5 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">
                <X class="w-4 h-4" />
              </button>
            </div>

            <!-- Enable Switch -->
            <div class="p-3.5 rounded-xl bg-slate-50 dark:bg-dark-muted/60 border border-slate-200 dark:border-dark-outline flex items-center justify-between">
              <div>
                <p class="text-xs font-bold text-slate-900 dark:text-white">Enable Automated Responses</p>
                <p class="text-[11px] text-slate-500 dark:text-white/60">Dispatches acknowledgment with response guarantee when students submit feedback.</p>
              </div>
              <button
                type="button"
                @click="autoResponderModal.enabled = !autoResponderModal.enabled"
                class="w-11 h-6 rounded-full transition-colors relative cursor-pointer shrink-0"
                :class="autoResponderModal.enabled ? 'bg-secondary' : 'bg-slate-300 dark:bg-dark-muted border border-slate-400/40'"
              >
                <span
                  class="block w-4 h-4 bg-white rounded-full shadow-xs transition-transform absolute top-1 left-1"
                  :class="{ 'translate-x-5': autoResponderModal.enabled }"
                ></span>
              </button>
            </div>

            <!-- SLA Period in Days -->
            <div>
              <label class="block text-xs font-bold font-mono text-slate-700 dark:text-white/80 uppercase tracking-wider mb-1">
                SLA Turnaround Guarantee (Days)
              </label>
              <div class="flex items-center gap-2">
                <input
                  v-model.number="autoResponderModal.slaDays"
                  type="number"
                  min="1"
                  max="30"
                  class="w-24 px-3 py-2 bg-slate-50 dark:bg-dark-muted/80 border border-slate-200 dark:border-dark-outline/70 rounded-xl text-sm font-mono text-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-secondary/50"
                />
                <span class="text-xs text-slate-500 dark:text-white/60 font-mono">business days (Default: 3 days)</span>
              </div>
            </div>

            <!-- Template Editor -->
            <div>
              <div class="flex items-center justify-between mb-1">
                <label class="block text-xs font-bold font-mono text-slate-700 dark:text-white/80 uppercase tracking-wider">
                  Automated Response Template
                </label>
                <span class="text-[10px] font-mono text-slate-400">Available: {category}, {slaDays}, {deadline}, {ticketId}</span>
              </div>
              <textarea
                v-model="autoResponderModal.template"
                rows="5"
                class="w-full bg-slate-50 dark:bg-dark-muted/80 border border-slate-200 dark:border-dark-outline/70 rounded-xl px-3 py-2 text-xs font-mono text-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-secondary/50 resize-y"
              ></textarea>
            </div>

            <!-- Preview Card -->
            <div class="p-3 rounded-xl bg-sky-50 dark:bg-sky-950/30 border border-sky-200 dark:border-sky-800/60 text-xs">
              <span class="text-[10px] font-mono font-bold uppercase text-sky-700 dark:text-sky-400 block mb-1">Live Preview:</span>
              <p class="text-slate-700 dark:text-white/80 text-[11px] font-mono whitespace-pre-line">
                {{ formatPreview(autoResponderModal.template, autoResponderModal.slaDays) }}
              </p>
            </div>

            <div class="flex items-center justify-end gap-3 pt-2">
              <button @click="autoResponderModal.open = false" class="px-4 py-2 rounded-xl border border-slate-200 dark:border-dark-outline text-xs font-semibold text-slate-700 dark:text-white/90">
                Cancel
              </button>
              <button @click="saveAutoResponderSettings" class="px-5 py-2 rounded-xl bg-primary text-white text-xs font-bold shadow-md hover:bg-primary/90 transition-all cursor-pointer">
                Save Settings
              </button>
            </div>
          </div>
        </div>
      </transition>
    </Teleport>

    <!-- Toast Notification via Teleport -->
    <Teleport to="body">
      <transition 
        enter-active-class="transition ease-out duration-300 transform"
        enter-from-class="opacity-0 translate-y-4"
        enter-to-class="opacity-100 translate-y-0"
        leave-active-class="transition ease-in duration-200 transform"
        leave-from-class="opacity-100 translate-y-0"
        leave-to-class="opacity-0 translate-y-4"
      >
        <div 
          v-if="toastMessage" 
          class="fixed bottom-6 right-6 z-50 flex items-center gap-3 px-5 py-3 rounded-xl bg-slate-900 text-white border border-slate-700 shadow-2xl text-xs font-mono font-medium max-w-md"
        >
          <CheckCircle2 class="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{{ toastMessage }}</span>
        </div>
      </transition>
    </Teleport>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted, reactive } from 'vue';
import { supabase } from '@/stores/supabase';
import { 
  MessageSquare, 
  Search, 
  RefreshCw, 
  Loader2, 
  X, 
  Download, 
  FileSpreadsheet, 
  FileText, 
  Printer, 
  ChevronDown, 
  CheckCircle2,
  Clock,
  Bot,
  Zap,
  Sliders,
  AlertTriangle
} from 'lucide-vue-next';

const suggestions = ref([]);
const isLoading   = ref(false);
const search         = ref('');
const filterStatus   = ref('');
const filterCategory = ref('');
const filterSla      = ref('');

const exportDropdownOpen = ref(false);
const openTicketMenuId   = ref(null);
const toastMessage       = ref('');
const isBatching         = ref(false);

const DEFAULT_AUTO_TEMPLATE = `[Automated Response • 3-Day SLA Commitment]
Thank you for your submission. Your {category} has been safely received by the University Administration.

⏱️ Response Policy:
Under our student service standard, all submissions receive an administrative review and follow-up response within {slaDays} business days (by {deadline}). Ticket Ref: #{ticketId}`;

const autoResponderConfig = reactive({
  enabled: localStorage.getItem('admin_suggestion_auto_responder_enabled') !== 'false',
  slaDays: Number(localStorage.getItem('admin_suggestion_sla_days') || 3),
  template: localStorage.getItem('admin_suggestion_auto_template') || DEFAULT_AUTO_TEMPLATE,
});

const autoResponderModal = reactive({
  open: false,
  enabled: true,
  slaDays: 3,
  template: '',
});

const noteModal = reactive({
  open: false,
  id: '',
  subject: '',
  note: '',
  markResolved: false,
  saving: false,
  slaInfo: null,
});

const statusOptions = [
  { value: 'unread',   label: 'Unread'   },
  { value: 'reviewed', label: 'Reviewed' },
  { value: 'resolved', label: 'Resolved' },
];

const categories = [
  { value: 'complaint',  label: 'Complaint'  },
  { value: 'suggestion', label: 'Suggestion' },
  { value: 'feedback',   label: 'Feedback'   },
  { value: 'other',      label: 'Other'      },
];

const catLabel = (v) => categories.find(c => c.value === v)?.label ?? v;
const statusLabel = (s) => ({ unread: 'Unread', reviewed: 'Reviewed', resolved: 'Resolved' })[s] ?? s;
const fmtDate = (d) => new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
const fmtDateTime = (d) => new Date(d).toLocaleString('en-US', { month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit' });

// ── SLA Details Calculator ───────────────────────────────────────────────────
function getSLA(s) {
  const days = autoResponderConfig.slaDays || 3;
  const created = new Date(s.createdAt || Date.now());
  const totalWindowMs = days * 24 * 60 * 60 * 1000;
  const deadline = new Date(created.getTime() + totalWindowMs);
  const now = new Date();
  const diffMs = deadline.getTime() - now.getTime();
  const isResponded = Boolean(s.adminNote) || s.status === 'reviewed' || s.status === 'resolved';
  const isOverdue = diffMs < 0 && !isResponded;
  const isUrgent = diffMs >= 0 && diffMs <= 24 * 60 * 60 * 1000 && !isResponded;

  const elapsedMs = Math.max(0, now.getTime() - created.getTime());
  const progressPct = isResponded ? 100 : Math.min(100, Math.round((elapsedMs / totalWindowMs) * 100));

  let remainingText = '';
  if (diffMs > 0) {
    const d = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    const h = Math.floor((diffMs % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const m = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
    if (d > 0) remainingText = `${d}d ${h}h remaining`;
    else if (h > 0) remainingText = `${h}h ${m}m remaining`;
    else remainingText = `${m}m remaining`;
  } else {
    const overdueMs = Math.abs(diffMs);
    const d = Math.floor(overdueMs / (1000 * 60 * 60 * 24));
    const h = Math.floor((overdueMs % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    remainingText = d > 0 ? `Overdue by ${d}d ${h}h` : `Overdue by ${h}h`;
  }

  const deadlineFormatted = deadline.toLocaleDateString('en-US', {
    month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit'
  });

  return {
    deadline,
    deadlineFormatted,
    isResponded,
    isOverdue,
    isUrgent,
    progressPct,
    remainingText,
  };
}

// ── Notes Parser: Automated vs Admin Resolution ──────────────────────────────
function parseNotes(noteStr) {
  if (!noteStr) return { autoNote: '', adminNote: '' };
  if (noteStr.includes('--- Administrative Resolution ---')) {
    const parts = noteStr.split('--- Administrative Resolution ---');
    return {
      autoNote: parts[0].trim(),
      adminNote: parts.slice(1).join('--- Administrative Resolution ---').trim()
    };
  }
  if (noteStr.startsWith('[Automated Response')) {
    return {
      autoNote: noteStr.trim(),
      adminNote: ''
    };
  }
  return {
    autoNote: '',
    adminNote: noteStr.trim()
  };
}

// ── Template Engine ──────────────────────────────────────────────────────────
function generateTicketAutoResponse(s) {
  const days = autoResponderConfig.slaDays || 3;
  const created = new Date(s.createdAt || Date.now());
  const deadline = new Date(created.getTime() + days * 24 * 60 * 60 * 1000);
  const deadlineFormatted = deadline.toLocaleDateString('en-US', {
    weekday: 'short', month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit'
  });

  let text = autoResponderConfig.template || DEFAULT_AUTO_TEMPLATE;
  text = text.replace(/{category}/g, s.category || 'inquiry');
  text = text.replace(/{slaDays}/g, String(days));
  text = text.replace(/{deadline}/g, deadlineFormatted);
  text = text.replace(/{ticketId}/g, (s.id || '').slice(0, 8).toUpperCase());
  text = text.replace(/{subject}/g, s.subject || '');
  return text;
}

function formatPreview(template, days) {
  const deadline = new Date(Date.now() + (Number(days) || 3) * 24 * 60 * 60 * 1000);
  const deadlineFormatted = deadline.toLocaleDateString('en-US', {
    weekday: 'short', month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit'
  });
  let text = template || DEFAULT_AUTO_TEMPLATE;
  text = text.replace(/{category}/g, 'suggestion');
  text = text.replace(/{slaDays}/g, String(days || 3));
  text = text.replace(/{deadline}/g, deadlineFormatted);
  text = text.replace(/{ticketId}/g, 'ABC12345');
  text = text.replace(/{subject}/g, 'Campus Improvement Proposal');
  return text;
}

// ── Computed Counts ──────────────────────────────────────────────────────────
const unread   = computed(() => suggestions.value.filter(s => s.status === 'unread').length);
const reviewed = computed(() => suggestions.value.filter(s => s.status === 'reviewed').length);
const resolved = computed(() => suggestions.value.filter(s => s.status === 'resolved').length);

const unrespondedCount = computed(() => suggestions.value.filter(s => !s.adminNote).length);

const activeWithinSla = computed(() => suggestions.value.filter(s => {
  const sla = getSLA(s);
  return !sla.isResponded && !sla.isOverdue;
}).length);

const overdueCount = computed(() => suggestions.value.filter(s => {
  const sla = getSLA(s);
  return !sla.isResponded && sla.isOverdue;
}).length);

const filtered = computed(() => {
  let list = suggestions.value;
  if (filterStatus.value)   list = list.filter(s => s.status   === filterStatus.value);
  if (filterCategory.value) list = list.filter(s => s.category === filterCategory.value);
  
  if (filterSla.value === 'within_sla') {
    list = list.filter(s => {
      const sla = getSLA(s);
      return !sla.isResponded && !sla.isOverdue;
    });
  } else if (filterSla.value === 'urgent') {
    list = list.filter(s => {
      const sla = getSLA(s);
      return !sla.isResponded && sla.isUrgent;
    });
  } else if (filterSla.value === 'overdue') {
    list = list.filter(s => {
      const sla = getSLA(s);
      return !sla.isResponded && sla.isOverdue;
    });
  } else if (filterSla.value === 'responded') {
    list = list.filter(s => getSLA(s).isResponded);
  }

  if (search.value.trim()) { 
    const q = search.value.toLowerCase(); 
    list = list.filter(s => 
      s.subject.toLowerCase().includes(q) || 
      s.message.toLowerCase().includes(q) || 
      (s.studentName && s.studentName.toLowerCase().includes(q)) ||
      (s.idNumber && s.idNumber.toLowerCase().includes(q))
    ); 
  }
  return list;
});

// Toast notification helper
function showToast(msg) {
  toastMessage.value = msg;
  setTimeout(() => {
    if (toastMessage.value === msg) toastMessage.value = '';
  }, 3500);
}

// Style helpers
const getCategoryBorder = (v) => ({
  complaint: 'border-l-rose-500', suggestion: 'border-l-amber-500', feedback: 'border-l-emerald-500', other: 'border-l-violet-500'
}[v] ?? 'border-l-slate-400');

const getCategoryBadge = (v) => ({
  complaint: 'bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-950/40 dark:text-rose-400 dark:border-rose-800',
  suggestion: 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/40 dark:text-amber-400 dark:border-amber-800',
  feedback: 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-400 dark:border-emerald-800',
  other: 'bg-violet-50 text-violet-700 border-violet-200 dark:bg-violet-950/40 dark:text-violet-400 dark:border-violet-800',
}[v] ?? 'bg-slate-100 text-slate-600 border-slate-200');

const getStatusBadge = (s) => ({
  unread: 'bg-sky-50 text-sky-700 border-sky-200 dark:bg-sky-950/40 dark:text-sky-400 dark:border-sky-800',
  reviewed: 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/40 dark:text-amber-400 dark:border-amber-800',
  resolved: 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-400 dark:border-emerald-800',
}[s] ?? 'bg-slate-100 text-slate-600 border-slate-200');

const getStatusActiveCls = (s) => ({
  unread: 'bg-sky-100 text-sky-700 border-sky-300 dark:bg-sky-950/60 dark:text-sky-400 dark:border-sky-700',
  reviewed: 'bg-amber-100 text-amber-700 border-amber-300 dark:bg-amber-950/60 dark:text-amber-400 dark:border-amber-700',
  resolved: 'bg-emerald-100 text-emerald-700 border-emerald-300 dark:bg-emerald-950/60 dark:text-emerald-400 dark:border-emerald-700',
}[s] ?? '');

async function load() {
  isLoading.value = true;
  try {
    const { data, error: sbErr } = await supabase
      .from('suggestions')
      .select('id, student_id, category, subject, message, is_anonymous, status, admin_note, created_at, users(name, id_number)')
      .order('created_at', { ascending: false });
    if (sbErr) throw sbErr;
    suggestions.value = (data ?? []).map(s => ({
      id: s.id, 
      studentId: s.student_id,
      studentName: s.is_anonymous ? 'Anonymous' : (s.users?.name || 'Student'),
      idNumber: s.is_anonymous ? null : (s.users?.id_number || null),
      category: s.category, 
      subject: s.subject, 
      message: s.message,
      isAnonymous: s.is_anonymous, 
      status: s.status, 
      adminNote: s.admin_note,
      createdAt: s.created_at, 
      _saving: false,
    }));
  } catch { /* silent */ } finally {
    isLoading.value = false;
  }
}

async function changeStatus(s, newStatus) {
  s._saving = true;
  try {
    const { error: sbErr } = await supabase.from('suggestions').update({ status: newStatus }).eq('id', s.id);
    if (sbErr) throw sbErr;
    s.status = newStatus;
    showToast(`Status updated to ${statusLabel(newStatus)}`);
  } catch { /* silent */ } finally {
    s._saving = false;
  }
}

// ── 1-Click Auto-Response Action ─────────────────────────────────────────────
async function sendAutoResponse(s) {
  s._saving = true;
  try {
    const autoMsg = generateTicketAutoResponse(s);
    const newStatus = s.status === 'unread' ? 'reviewed' : s.status;
    const { error: sbErr } = await supabase
      .from('suggestions')
      .update({ 
        admin_note: autoMsg,
        status: newStatus 
      })
      .eq('id', s.id);
    if (sbErr) throw sbErr;
    s.adminNote = autoMsg;
    s.status = newStatus;
    showToast(`Automated 3-day SLA response dispatched for #${s.id.slice(0, 8)}`);
  } catch {
    showToast('Failed to dispatch automated response');
  } finally {
    s._saving = false;
  }
}

// ── Batch Auto-Respond Action ────────────────────────────────────────────────
async function batchAutoRespond() {
  const pending = suggestions.value.filter(s => !s.adminNote);
  if (!pending.length) {
    showToast('All suggestions currently have response notes.');
    return;
  }
  isBatching.value = true;
  let count = 0;
  try {
    for (const s of pending) {
      const autoMsg = generateTicketAutoResponse(s);
      const { error } = await supabase
        .from('suggestions')
        .update({ admin_note: autoMsg, status: 'reviewed' })
        .eq('id', s.id);
      if (!error) {
        s.adminNote = autoMsg;
        s.status = 'reviewed';
        count++;
      }
    }
    showToast(`Dispatched automated 3-day SLA responses to ${count} ticket(s)`);
  } catch {
    showToast('Error during batch response');
  } finally {
    isBatching.value = false;
  }
}

function openAutoResponderSettings() {
  autoResponderModal.enabled = autoResponderConfig.enabled;
  autoResponderModal.slaDays = autoResponderConfig.slaDays;
  autoResponderModal.template = autoResponderConfig.template;
  autoResponderModal.open = true;
}

function saveAutoResponderSettings() {
  autoResponderConfig.enabled = autoResponderModal.enabled;
  autoResponderConfig.slaDays = Number(autoResponderModal.slaDays) || 3;
  autoResponderConfig.template = autoResponderModal.template;
  localStorage.setItem('admin_suggestion_auto_responder_enabled', String(autoResponderConfig.enabled));
  localStorage.setItem('admin_suggestion_sla_days', String(autoResponderConfig.slaDays));
  localStorage.setItem('admin_suggestion_auto_template', autoResponderConfig.template);
  autoResponderModal.open = false;
  showToast('Auto-responder configuration saved');
}

function openNote(s) {
  noteModal.id = s.id; 
  noteModal.subject = s.subject; 
  noteModal.note = s.adminNote || ''; 
  noteModal.markResolved = s.status === 'resolved';
  noteModal.slaInfo = getSLA(s);
  noteModal.open = true;
}

function insertTemplate(type) {
  const s = suggestions.value.find(x => x.id === noteModal.id);
  if (!s) return;
  const sla = getSLA(s);

  if (type === 'auto') {
    noteModal.note = generateTicketAutoResponse(s);
  } else if (type === 'under_review') {
    const autoPart = parseNotes(noteModal.note).autoNote;
    const body = `Your feedback has been received and prioritized by the Administration. An internal review is underway with the relevant departments. An official resolution note will be posted within our 3-day SLA window (by ${sla.deadlineFormatted}).`;
    noteModal.note = autoPart ? `${autoPart}\n\n--- Administrative Resolution ---\n${body}` : body;
  } else if (type === 'resolved') {
    const autoPart = parseNotes(noteModal.note).autoNote;
    const body = `Administrative Resolution:\nThe reported issue has been addressed and rectified by the University Administration. Corrective measures have been enacted. Thank you for your feedback.`;
    noteModal.note = autoPart ? `${autoPart}\n\n--- Administrative Resolution ---\n${body}` : body;
    noteModal.markResolved = true;
  } else if (type === 'clarify') {
    const autoPart = parseNotes(noteModal.note).autoNote;
    const body = `Thank you for your submission. To ensure we can resolve this effectively within our 3-day turnaround, please provide additional specifics (such as course code, lecture hall venue, or exact timestamps).`;
    noteModal.note = autoPart ? `${autoPart}\n\n--- Administrative Resolution ---\n${body}` : body;
  }
}

async function saveNote() {
  noteModal.saving = true;
  try {
    const updates = { admin_note: noteModal.note.trim() };
    if (noteModal.markResolved) {
      updates.status = 'resolved';
    } else {
      const s = suggestions.value.find(x => x.id === noteModal.id);
      if (s && s.status === 'unread') updates.status = 'reviewed';
    }

    const { error: sbErr } = await supabase.from('suggestions').update(updates).eq('id', noteModal.id);
    if (sbErr) throw sbErr;
    
    const s = suggestions.value.find(x => x.id === noteModal.id);
    if (s) {
      s.adminNote = updates.admin_note;
      if (updates.status) s.status = updates.status;
    }
    noteModal.open = false;
    showToast('Administrative response note saved successfully');
  } catch {
    showToast('Failed to save response note');
  } finally {
    noteModal.saving = false;
  }
}

function toggleTicketMenu(id) {
  openTicketMenuId.value = openTicketMenuId.value === id ? null : id;
}

function handleGlobalClick(e) {
  if (!e.target.closest('.export-dropdown-container')) {
    exportDropdownOpen.value = false;
  }
  if (!e.target.closest('.ticket-dropdown-container')) {
    openTicketMenuId.value = null;
  }
}

// ── Export & Download Handlers ───────────────────────────────────────────────

function downloadCSV(subset = 'filtered') {
  const list = subset === 'all' ? suggestions.value : filtered.value;
  if (!list.length) {
    showToast('No suggestion records to download.');
    return;
  }

  const headers = [
    'Ticket ID',
    'Date Submitted',
    'Time Submitted',
    'Category',
    'Status',
    '3-Day SLA Target',
    'SLA Status',
    'Submission Type',
    'Student Name',
    'Student ID',
    'Subject',
    'Message',
    'Admin Response'
  ];

  const escapeCSV = (val) => {
    if (val === null || val === undefined) return '""';
    const s = String(val).replace(/"/g, '""');
    return `"${s}"`;
  };

  const rows = [headers.join(',')];

  list.forEach(s => {
    const d = s.createdAt ? new Date(s.createdAt) : null;
    const dateStr = d ? d.toISOString().slice(0, 10) : '';
    const timeStr = d ? d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '';
    const sla = getSLA(s);

    rows.push([
      escapeCSV(s.id),
      escapeCSV(dateStr),
      escapeCSV(timeStr),
      escapeCSV(catLabel(s.category)),
      escapeCSV(statusLabel(s.status)),
      escapeCSV(sla.deadlineFormatted),
      escapeCSV(sla.isResponded ? 'Responded (Within SLA)' : sla.remainingText),
      escapeCSV(s.isAnonymous ? 'Anonymous' : 'Identified'),
      escapeCSV(s.isAnonymous ? 'Anonymous' : (s.studentName || 'Student')),
      escapeCSV(s.isAnonymous ? 'N/A' : (s.idNumber || 'N/A')),
      escapeCSV(s.subject),
      escapeCSV(s.message),
      escapeCSV(s.adminNote || '')
    ].join(','));
  });

  const blob = new Blob([rows.join('\r\n')], { type: 'text/csv;charset=utf-8;' });
  const url  = URL.createObjectURL(blob);
  const a    = document.createElement('a');
  a.href     = url;
  const tag  = subset === 'all' ? 'all' : (filterStatus.value || filterCategory.value || filterSla.value ? 'filtered' : 'active');
  a.download = `suggestions-${tag}-${new Date().toISOString().slice(0, 10)}.csv`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);

  showToast(`Downloaded ${list.length} suggestion records as CSV`);
}

function downloadJSON(subset = 'filtered') {
  const list = subset === 'all' ? suggestions.value : filtered.value;
  if (!list.length) {
    showToast('No suggestion records to download.');
    return;
  }

  const exportData = list.map(s => {
    const sla = getSLA(s);
    return {
      id: s.id,
      date: s.createdAt,
      category: s.category,
      status: s.status,
      slaTarget: sla.deadlineFormatted,
      slaStatus: sla.isResponded ? 'Responded' : sla.remainingText,
      isAnonymous: s.isAnonymous,
      studentName: s.isAnonymous ? 'Anonymous' : (s.studentName || 'Student'),
      studentId: s.isAnonymous ? null : (s.idNumber || null),
      subject: s.subject,
      message: s.message,
      adminNote: s.adminNote || null,
    };
  });

  const jsonStr = JSON.stringify(exportData, null, 2);
  const blob = new Blob([jsonStr], { type: 'application/json' });
  const url  = URL.createObjectURL(blob);
  const a    = document.createElement('a');
  a.href     = url;
  a.download = `suggestions-export-${new Date().toISOString().slice(0, 10)}.json`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);

  showToast(`Exported ${list.length} records as JSON`);
}

function downloadSingleText(s) {
  const dateStr = fmtDateTime(s.createdAt);
  const sla = getSLA(s);
  const submitterStr = s.isAnonymous 
    ? 'Anonymous Submission (Confidential Protection Policy)' 
    : `${s.studentName || 'Student'}${s.idNumber ? ` [ID: ${s.idNumber}]` : ''}`;

  const text = [
    '================================================================================',
    '                  UNIVERSITY ACADEMIC & ATTENDANCE PORTAL',
    '                 STUDENT SUGGESTION BOX - OFFICIAL RECORD',
    '================================================================================',
    `Ticket ID        : ${s.id}`,
    `Date Filed       : ${dateStr}`,
    `Classification   : ${catLabel(s.category).toUpperCase()}`,
    `Status           : ${statusLabel(s.status).toUpperCase()}`,
    `Submitter        : ${submitterStr}`,
    `3-Day SLA Target : ${sla.deadlineFormatted} (${sla.remainingText})`,
    '--------------------------------------------------------------------------------',
    'SUBJECT:',
    s.subject,
    '',
    'DETAILS / MESSAGE:',
    s.message,
    '--------------------------------------------------------------------------------',
    'ADMINISTRATIVE NOTES / OFFICIAL 3-DAY SLA RESPONSE:',
    s.adminNote ? s.adminNote : 'No administrative response note currently recorded.',
    '================================================================================',
    `Exported on: ${new Date().toLocaleString()}`,
    '================================================================================',
  ].join('\r\n');

  const blob = new Blob([text], { type: 'text/plain;charset=utf-8;' });
  const url  = URL.createObjectURL(blob);
  const a    = document.createElement('a');
  a.href     = url;
  a.download = `suggestion-ticket-${s.id.slice(0, 8)}.txt`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);

  showToast(`Downloaded ticket #${s.id.slice(0, 8)} text slip`);
}

function downloadSingleJSON(s) {
  const sla = getSLA(s);
  const exportData = {
    id: s.id,
    date: s.createdAt,
    category: s.category,
    status: s.status,
    slaTarget: sla.deadlineFormatted,
    slaStatus: sla.isResponded ? 'Responded' : sla.remainingText,
    isAnonymous: s.isAnonymous,
    studentName: s.isAnonymous ? 'Anonymous' : (s.studentName || 'Student'),
    studentId: s.isAnonymous ? null : (s.idNumber || null),
    subject: s.subject,
    message: s.message,
    adminNote: s.adminNote || null,
  };

  const jsonStr = JSON.stringify(exportData, null, 2);
  const blob = new Blob([jsonStr], { type: 'application/json' });
  const url  = URL.createObjectURL(blob);
  const a    = document.createElement('a');
  a.href     = url;
  a.download = `suggestion-record-${s.id.slice(0, 8)}.json`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);

  showToast(`Downloaded ticket record #${s.id.slice(0, 8)} as JSON`);
}

function printSingleTicket(s) {
  const dateStr = fmtDateTime(s.createdAt);
  const sla = getSLA(s);
  const submitterStr = s.isAnonymous 
    ? '<span style="color:#7c3aed;font-weight:bold;">Anonymous Submission (Protected)</span>' 
    : `<strong>${s.studentName || 'Student'}</strong>${s.idNumber ? ` &bull; ID: ${s.idNumber}` : ''}`;

  const catColor = {
    complaint: '#e11d48',
    suggestion: '#d97706',
    feedback: '#059669',
    other: '#7c3aed',
  }[s.category] || '#475569';

  const statusColor = {
    unread: '#0284c7',
    reviewed: '#d97706',
    resolved: '#059669',
  }[s.status] || '#475569';

  const html = `<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>Suggestion Ticket #${s.id.slice(0, 8)}</title>
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; margin: 30px; color: #0f172a; line-height: 1.5; font-size: 13px; }
    .header { border-bottom: 2px solid #031c45; padding-bottom: 12px; margin-bottom: 20px; }
    .header h1 { margin: 0 0 4px 0; font-size: 18px; color: #031c45; letter-spacing: -0.5px; }
    .header p { margin: 0; color: #64748b; font-size: 11px; }
    .card { border: 1px solid #cbd5e1; border-radius: 8px; padding: 18px; margin-bottom: 20px; }
    .pill { display: inline-block; padding: 3px 8px; border-radius: 9999px; font-size: 11px; font-weight: bold; text-transform: uppercase; margin-right: 6px; }
    .meta-row { display: flex; justify-content: space-between; margin-bottom: 14px; font-size: 12px; }
    .subject { font-size: 16px; font-weight: bold; margin-bottom: 8px; color: #0f172a; }
    .message { background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 6px; padding: 12px; margin-bottom: 16px; white-space: pre-wrap; font-size: 12px; color: #334155; }
    .note-box { background: #f0f9ff; border: 1px solid #bae6fd; border-left: 4px solid #0284c7; border-radius: 6px; padding: 12px; font-size: 12px; color: #0369a1; }
    .sla-box { background: #faf5ff; border: 1px solid #e9d5ff; border-radius: 6px; padding: 10px; margin-bottom: 12px; font-size: 12px; color: #6b21a8; }
    .footer { margin-top: 30px; font-size: 11px; color: #94a3b8; border-top: 1px solid #e2e8f0; padding-top: 8px; text-align: right; }
    @media print { body { margin: 15mm; } }
  </style>
</head>
<body>
  <div class="header">
    <h1>UNIVERSITY SUGGESTION BOX — OFFICIAL TICKET</h1>
    <p>ATTENDANCE & STUDENT ENGAGEMENT PORTAL &bull; TICKET #${s.id}</p>
  </div>

  <div class="card">
    <div class="meta-row">
      <div>
        <span class="pill" style="background:#f1f5f9;color:${catColor};border:1px solid ${catColor}40;">${catLabel(s.category)}</span>
        <span class="pill" style="background:#f1f5f9;color:${statusColor};border:1px solid ${statusColor}40;">${statusLabel(s.status)}</span>
      </div>
      <div style="color:#64748b;">Filed: ${dateStr}</div>
    </div>

    <div style="margin-bottom: 12px; font-size: 12px;">
      <strong>Submitter:</strong> ${submitterStr}
    </div>

    <div class="sla-box">
      <strong>3-Day SLA Target Date:</strong> ${sla.deadlineFormatted} &bull; 
      <strong>Status:</strong> ${sla.isResponded ? 'Responded' : sla.remainingText}
    </div>

    <div class="subject">${s.subject}</div>
    <div class="message">${s.message}</div>

    <div class="note-box">
      <strong>Administrative Response & SLA Record:</strong><br/>
      ${s.adminNote ? s.adminNote : '<em>No administrative response recorded yet.</em>'}
    </div>
  </div>

  <div class="footer">
    Generated on ${new Date().toLocaleString()} &bull; System Verified Record
  </div>
</body>
</html>`;

  const win = window.open('', '_blank');
  if (win) {
    win.document.write(html);
    win.document.close();
    win.focus();
    setTimeout(() => { win.print(); }, 400);
  } else {
    showToast('Please allow popups to print ticket slip.');
  }
}

function downloadPDF(subset = 'filtered') {
  const list = subset === 'all' ? suggestions.value : filtered.value;
  if (!list.length) {
    showToast('No suggestion records to print/download.');
    return;
  }

  const dateStr = new Date().toLocaleDateString('en-US', { day: 'numeric', month: 'long', year: 'numeric' });
  const filterDesc = [
    filterStatus.value ? `Status: ${statusLabel(filterStatus.value)}` : 'All Statuses',
    filterCategory.value ? `Category: ${catLabel(filterCategory.value)}` : 'All Categories',
    filterSla.value ? `SLA: ${filterSla.value}` : null,
    search.value.trim() ? `Search: "${search.value.trim()}"` : null
  ].filter(Boolean).join(' • ');

  let itemsHtml = '';
  list.forEach(s => {
    const dStr = fmtDateTime(s.createdAt);
    const sla = getSLA(s);
    const submitter = s.isAnonymous 
      ? '<span style="color:#7c3aed;font-weight:600;">Anonymous Submission</span>' 
      : `<strong>${s.studentName || 'Student'}</strong>${s.idNumber ? ` [${s.idNumber}]` : ''}`;

    const catBadge = catLabel(s.category);
    const stBadge = statusLabel(s.status);

    itemsHtml += `
    <div class="item">
      <div class="item-header">
        <div>
          <span class="badge badge-${s.category}">${catBadge}</span>
          <span class="badge badge-status">${stBadge}</span>
          <span class="badge" style="background:#e0f2fe;color:#0369a1;">SLA: ${sla.deadlineFormatted}</span>
          <span class="ticket-id">#${s.id.slice(0, 8)}</span>
        </div>
        <div class="date">${dStr}</div>
      </div>
      <div class="submitter">Submitter: ${submitter} &bull; <strong>SLA:</strong> ${sla.isResponded ? 'Responded' : sla.remainingText}</div>
      <div class="subject">${s.subject}</div>
      <div class="body">${s.message}</div>
      ${s.adminNote ? `<div class="note"><strong>Administrative Response:</strong> ${s.adminNote}</div>` : ''}
    </div>`;
  });

  const html = `<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>Suggestion Box Dossier — ${dateStr}</title>
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; font-size: 12px; color: #0f172a; margin: 24px; line-height: 1.45; }
    .header { border-bottom: 2px solid #031c45; padding-bottom: 12px; margin-bottom: 16px; }
    .header h1 { margin: 0 0 4px 0; font-size: 20px; color: #031c45; }
    .meta { font-size: 11px; color: #64748b; margin-top: 4px; }
    .kpis { display: flex; gap: 12px; margin: 16px 0; }
    .kpi { border: 1px solid #cbd5e1; border-radius: 6px; padding: 6px 12px; min-width: 90px; }
    .kpi .num { font-size: 18px; font-weight: bold; color: #031c45; }
    .kpi .lbl { font-size: 10px; color: #64748b; text-transform: uppercase; }
    .item { border: 1px solid #e2e8f0; border-radius: 8px; padding: 12px 14px; margin-bottom: 14px; break-inside: avoid; page-break-inside: avoid; }
    .item-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 6px; }
    .badge { display: inline-block; padding: 2px 7px; border-radius: 4px; font-size: 10px; font-weight: bold; text-transform: uppercase; margin-right: 4px; }
    .badge-complaint { background: #ffe4e6; color: #e11d48; }
    .badge-suggestion { background: #fef3c7; color: #d97706; }
    .badge-feedback { background: #d1fae5; color: #059669; }
    .badge-other { background: #ede9fe; color: #7c3aed; }
    .badge-status { background: #f1f5f9; color: #334155; border: 1px solid #cbd5e1; }
    .ticket-id { font-family: monospace; font-size: 11px; color: #94a3b8; }
    .date { font-size: 11px; color: #64748b; }
    .submitter { font-size: 11px; color: #475569; margin-bottom: 4px; }
    .subject { font-size: 14px; font-weight: bold; color: #0f172a; margin-bottom: 6px; }
    .body { font-size: 12px; color: #334155; margin-bottom: 8px; white-space: pre-wrap; }
    .note { background: #f0f9ff; border: 1px solid #bae6fd; border-radius: 4px; padding: 8px 10px; font-size: 11px; color: #0369a1; }
    @media print { body { margin: 10mm; } }
  </style>
</head>
<body>
  <div class="header">
    <h1>University Suggestion Box — Summary Dossier & SLA Audit</h1>
    <div class="meta">Generated: ${dateStr} &bull; Scope: ${filterDesc}</div>
  </div>

  <div class="kpis">
    <div class="kpi"><div class="num">${list.length}</div><div class="lbl">Total Items</div></div>
    <div class="kpi"><div class="num">${list.filter(x => x.status === 'unread').length}</div><div class="lbl">Unread</div></div>
    <div class="kpi"><div class="num">${list.filter(x => x.status === 'reviewed').length}</div><div class="lbl">Reviewed</div></div>
    <div class="kpi"><div class="num">${list.filter(x => x.status === 'resolved').length}</div><div class="lbl">Resolved</div></div>
    <div class="kpi"><div class="num">${list.filter(x => !getSLA(x).isResponded && !getSLA(x).isOverdue).length}</div><div class="lbl">Within 3d SLA</div></div>
    <div class="kpi"><div class="num" style="color:#e11d48;">${list.filter(x => !getSLA(x).isResponded && getSLA(x).isOverdue).length}</div><div class="lbl">Overdue SLA</div></div>
  </div>

  <div class="items">
    ${itemsHtml}
  </div>
</body>
</html>`;

  const win = window.open('', '_blank');
  if (win) {
    win.document.write(html);
    win.document.close();
    win.focus();
    setTimeout(() => { win.print(); }, 400);
  } else {
    showToast('Please allow popups to print report.');
  }
}

onMounted(() => {
  load();
  window.addEventListener('click', handleGlobalClick);
});

onUnmounted(() => {
  window.removeEventListener('click', handleGlobalClick);
});
</script>
