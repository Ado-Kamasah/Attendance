<template>
  <div class="space-y-6">
    <!-- Top CAD Header Banner -->
    <div class="relative bg-white dark:bg-dark-surface border border-slate-200/80 dark:border-dark-outline/60 rounded-3xl p-6 sm:p-8 shadow-sm overflow-hidden">
      <div class="absolute top-3 left-3 w-4 h-4 border-t-2 border-l-2 border-secondary/40 pointer-events-none"></div>
      <div class="absolute top-3 right-3 w-4 h-4 border-t-2 border-r-2 border-secondary/40 pointer-events-none"></div>

      <div class="flex flex-col md:flex-row md:items-center justify-between gap-4 relative z-10">
        <div>
          <div class="flex items-center gap-2 mb-2">
            <span class="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold tracking-wider uppercase bg-secondary/15 text-secondary border border-secondary/30">
              ADMIN // FACULTY ROSTER
            </span>
            <span class="text-xs font-mono text-slate-400">· SOUTHSHORE ACADEMIC STAFF</span>
          </div>
          <h1 class="text-2xl sm:text-3xl font-display font-bold text-slate-900 dark:text-white tracking-tight">
            Lecturers & Faculty Directory
          </h1>
          <p class="text-xs sm:text-sm text-slate-500 dark:text-white/70 mt-1 max-w-2xl">
            Manage all teaching faculty working for the institution. Designate and toggle Full-Time vs Part-Time staff, assign course schedules, and update academic profiles.
          </p>
        </div>

        <div class="flex flex-wrap items-center gap-2.5">
          <button
            @click="fetchLecturers"
            :disabled="isLoading"
            class="px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-dark-outline/70 bg-white dark:bg-dark-muted/50 hover:bg-slate-50 dark:hover:bg-dark-muted text-xs font-semibold text-slate-700 dark:text-white/90 transition-all flex items-center gap-2 cursor-pointer shadow-xs"
            title="Refresh Lecturer Roster"
          >
            <RefreshCw class="w-3.5 h-3.5" :class="{ 'animate-spin': isLoading }" />
            <span class="hidden sm:inline">Refresh</span>
          </button>

          <button
            @click="openAddModal"
            id="btn-add-lecturer"
            class="px-4 py-2.5 rounded-xl bg-primary hover:bg-primary/90 text-white text-xs font-semibold tracking-wide transition-all shadow-md hover:shadow-lg inline-flex items-center gap-2 cursor-pointer active:scale-95"
          >
            <UserPlus class="w-4 h-4 text-secondary" />
            <span>Add New Lecturer</span>
          </button>
        </div>
      </div>

      <!-- KPI Summary Cards -->
      <div class="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mt-6 pt-6 border-t border-slate-100 dark:border-dark-outline/40">
        <!-- Total Lecturers -->
        <div class="p-4 rounded-2xl bg-slate-50 dark:bg-dark-muted/40 border border-slate-200/70 dark:border-dark-outline/50 flex items-center gap-3.5">
          <div class="w-10 h-10 rounded-xl bg-violet-100 dark:bg-violet-950/50 text-violet-600 dark:text-violet-400 flex items-center justify-center shrink-0">
            <GraduationCap class="w-5 h-5" />
          </div>
          <div>
            <span class="text-[10px] font-mono uppercase tracking-wider text-slate-400 block font-semibold">Total Faculty</span>
            <div class="text-xl sm:text-2xl font-bold font-display text-slate-900 dark:text-white">{{ stats.total }}</div>
          </div>
        </div>

        <!-- Full-Time Faculty -->
        <div 
          @click="statusFilter = 'Full-Time'"
          :class="['p-4 rounded-2xl border transition-all cursor-pointer flex items-center gap-3.5',
            statusFilter === 'Full-Time'
              ? 'bg-indigo-50/80 dark:bg-indigo-950/50 border-indigo-300 dark:border-indigo-700 shadow-sm'
              : 'bg-slate-50 dark:bg-dark-muted/40 border-slate-200/70 dark:border-dark-outline/50 hover:border-indigo-200'
          ]"
        >
          <div class="w-10 h-10 rounded-xl bg-indigo-100 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center shrink-0">
            <Briefcase class="w-5 h-5" />
          </div>
          <div>
            <div class="flex items-center gap-1.5">
              <span class="text-[10px] font-mono uppercase tracking-wider text-slate-400 font-semibold">Full-Time</span>
              <span class="text-[10px] font-mono px-1.5 py-0.2 rounded-full bg-indigo-100 text-indigo-700 dark:bg-indigo-900/60 dark:text-indigo-300 font-bold">Salaried</span>
            </div>
            <div class="text-xl sm:text-2xl font-bold font-display text-indigo-900 dark:text-indigo-200">{{ stats.fullTime }}</div>
          </div>
        </div>

        <!-- Part-Time Faculty -->
        <div 
          @click="statusFilter = 'Part-Time'"
          :class="['p-4 rounded-2xl border transition-all cursor-pointer flex items-center gap-3.5',
            statusFilter === 'Part-Time'
              ? 'bg-amber-50/80 dark:bg-amber-950/50 border-amber-300 dark:border-amber-700 shadow-sm'
              : 'bg-slate-50 dark:bg-dark-muted/40 border-slate-200/70 dark:border-dark-outline/50 hover:border-amber-200'
          ]"
        >
          <div class="w-10 h-10 rounded-xl bg-amber-100 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 flex items-center justify-center shrink-0">
            <Clock class="w-5 h-5" />
          </div>
          <div>
            <div class="flex items-center gap-1.5">
              <span class="text-[10px] font-mono uppercase tracking-wider text-slate-400 font-semibold">Part-Time</span>
              <span class="text-[10px] font-mono px-1.5 py-0.2 rounded-full bg-amber-100 text-amber-700 dark:bg-amber-900/60 dark:text-amber-300 font-bold">Claims Sync</span>
            </div>
            <div class="text-xl sm:text-2xl font-bold font-display text-amber-900 dark:text-amber-200">{{ stats.partTime }}</div>
          </div>
        </div>

        <!-- Allocated Courses -->
        <div class="p-4 rounded-2xl bg-slate-50 dark:bg-dark-muted/40 border border-slate-200/70 dark:border-dark-outline/50 flex items-center gap-3.5">
          <div class="w-10 h-10 rounded-xl bg-emerald-100 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0">
            <BookOpen class="w-5 h-5" />
          </div>
          <div>
            <span class="text-[10px] font-mono uppercase tracking-wider text-slate-400 block font-semibold">Taught Courses</span>
            <div class="text-xl sm:text-2xl font-bold font-display text-slate-900 dark:text-white">{{ stats.assignedCourses }}</div>
          </div>
        </div>
      </div>
    </div>

    <!-- Alert / Toast Banner -->
    <transition name="fade">
      <div
        v-if="alertMessage"
        :class="['flex items-center justify-between gap-3 px-4 py-3 rounded-2xl border text-xs sm:text-sm font-semibold shadow-md',
          alertType === 'success'
            ? 'bg-emerald-50 dark:bg-emerald-950/80 border-emerald-300 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300'
            : 'bg-rose-50 dark:bg-rose-950/80 border-rose-300 dark:border-rose-800 text-rose-800 dark:text-rose-300'
        ]"
      >
        <div class="flex items-center gap-2.5">
          <CheckCircle2 v-if="alertType === 'success'" class="w-4 h-4 text-emerald-600 shrink-0" />
          <AlertCircle v-else class="w-4 h-4 text-rose-600 shrink-0" />
          <span>{{ alertMessage }}</span>
        </div>
        <button @click="alertMessage = ''" class="opacity-70 hover:opacity-100 p-1 cursor-pointer">
          <X class="w-4 h-4" />
        </button>
      </div>
    </transition>

    <!-- Filters & Search Toolbar -->
    <div class="bg-white dark:bg-dark-surface border border-slate-200/80 dark:border-dark-outline/60 rounded-2xl p-4 shadow-sm flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
      <!-- Search Input -->
      <div class="relative flex-1">
        <Search class="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
        <input
          v-model="searchQuery"
          type="text"
          id="lecturer-search-input"
          placeholder="Search by lecturer name, staff ID, email, department, or course..."
          class="w-full pl-10 pr-4 py-2 bg-slate-50 dark:bg-dark-muted/80 border border-slate-200 dark:border-dark-outline/70 rounded-xl text-xs sm:text-sm text-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-secondary/50 transition-all placeholder:text-slate-400"
        />
        <button
          v-if="searchQuery"
          @click="searchQuery = ''"
          class="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
        >
          <X class="w-3.5 h-3.5" />
        </button>
      </div>

      <!-- Filter Controls -->
      <div class="flex flex-wrap items-center gap-2">
        <!-- Employment Status Filter -->
        <div class="inline-flex p-1 rounded-xl bg-slate-100 dark:bg-dark-muted/70 border border-slate-200 dark:border-dark-outline/50 shrink-0">
          <button
            v-for="f in ['all', 'Full-Time', 'Part-Time']"
            :key="f"
            @click="statusFilter = f"
            :class="['px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer flex items-center gap-1.5',
              statusFilter === f
                ? 'bg-white dark:bg-dark-surface text-slate-900 dark:text-white shadow-xs font-bold'
                : 'text-slate-500 dark:text-white/70 hover:text-slate-800'
            ]"
          >
            <span v-if="f === 'all'">All ({{ stats.total }})</span>
            <span v-else-if="f === 'Full-Time'" class="flex items-center gap-1">
              <span class="w-2 h-2 rounded-full bg-indigo-500"></span>
              Full-Time ({{ stats.fullTime }})
            </span>
            <span v-else class="flex items-center gap-1">
              <span class="w-2 h-2 rounded-full bg-amber-500"></span>
              Part-Time ({{ stats.partTime }})
            </span>
          </button>
        </div>

        <!-- View Mode Switcher -->
        <div class="inline-flex p-1 rounded-xl bg-slate-100 dark:bg-dark-muted/70 border border-slate-200 dark:border-dark-outline/50 shrink-0">
          <button
            @click="viewMode = 'table'"
            :class="['p-1.5 rounded-lg text-xs transition-colors cursor-pointer',
              viewMode === 'table' ? 'bg-white dark:bg-dark-surface text-secondary shadow-xs' : 'text-slate-400 hover:text-slate-600'
            ]"
            title="Table View"
          >
            <List class="w-4 h-4" />
          </button>
          <button
            @click="viewMode = 'cards'"
            :class="['p-1.5 rounded-lg text-xs transition-colors cursor-pointer',
              viewMode === 'cards' ? 'bg-white dark:bg-dark-surface text-secondary shadow-xs' : 'text-slate-400 hover:text-slate-600'
            ]"
            title="Grid Cards View"
          >
            <LayoutGrid class="w-4 h-4" />
          </button>
        </div>

        <button
          v-if="searchQuery || statusFilter !== 'all'"
          @click="resetFilters"
          class="p-2 text-slate-400 hover:text-rose-600 rounded-xl hover:bg-slate-100 dark:hover:bg-dark-muted transition-colors cursor-pointer"
          title="Reset Filters"
        >
          <RotateCcw class="w-4 h-4" />
        </button>
      </div>
    </div>

    <!-- Loading State -->
    <div v-if="isLoading" class="p-16 text-center bg-white dark:bg-dark-surface rounded-2xl border border-slate-200/80 dark:border-dark-outline/60 flex flex-col items-center justify-center">
      <Loader2 class="w-8 h-8 text-secondary animate-spin mb-3" />
      <p class="text-xs font-mono tracking-wider uppercase text-slate-500 dark:text-white/70">
        Loading Faculty Roster & Allocations...
      </p>
    </div>

    <!-- Empty State -->
    <div v-else-if="filteredLecturers.length === 0" class="p-12 text-center bg-white dark:bg-dark-surface rounded-2xl border border-slate-200/80 dark:border-dark-outline/60">
      <div class="w-14 h-14 rounded-2xl bg-slate-100 dark:bg-dark-muted flex items-center justify-center mx-auto mb-3 text-slate-400">
        <UserX class="w-7 h-7" />
      </div>
      <h3 class="font-display font-bold text-slate-900 dark:text-white text-base">No Lecturers Found</h3>
      <p class="text-xs text-slate-500 dark:text-white/70 mt-1 max-w-sm mx-auto">
        {{ searchQuery || statusFilter !== 'all' ? 'No academic staff match the current search or status filter.' : 'No lecturer accounts exist in the system yet.' }}
      </p>
      <div class="mt-4 flex items-center justify-center gap-2">
        <button
          v-if="searchQuery || statusFilter !== 'all'"
          @click="resetFilters"
          class="px-4 py-2 rounded-xl border border-slate-200 dark:border-dark-outline/70 text-xs font-semibold hover:bg-slate-50 dark:hover:bg-dark-muted transition-all"
        >
          Clear Filters
        </button>
        <button
          @click="openAddModal"
          class="px-4 py-2 rounded-xl bg-primary text-white text-xs font-semibold hover:bg-primary/90 transition-all inline-flex items-center gap-1.5"
        >
          <UserPlus class="w-3.5 h-3.5" /> Add Faculty Member
        </button>
      </div>
    </div>

    <!-- Table View -->
    <div v-else-if="viewMode === 'table'" class="bg-white dark:bg-dark-surface border border-slate-200/80 dark:border-dark-outline/60 rounded-2xl shadow-sm overflow-hidden">
      <div class="overflow-x-auto">
        <table class="w-full text-left border-collapse text-xs sm:text-sm">
          <thead>
            <tr class="border-b border-slate-100 dark:border-dark-outline bg-slate-50/75 dark:bg-dark-muted/40 font-mono text-[11px] text-slate-500 dark:text-white/75 uppercase tracking-wider">
              <th class="py-3 px-4">Faculty Member</th>
              <th class="py-3 px-4">Employment Status</th>
              <th class="py-3 px-4">Department / Spec.</th>
              <th class="py-3 px-4">Taught Courses</th>
              <th class="py-3 px-4">Sessions</th>
              <th class="py-3 px-4 text-right">Quick Actions</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-slate-100 dark:divide-slate-800">
            <tr
              v-for="lecturer in filteredLecturers"
              :key="lecturer.id"
              class="hover:bg-slate-50/70 dark:hover:bg-dark-muted/30 transition-colors group"
            >
              <!-- Name & Email -->
              <td class="py-3.5 px-4">
                <div class="flex items-center gap-3">
                  <div class="w-9 h-9 rounded-xl bg-gradient-to-br from-secondary/20 to-amber-500/20 text-secondary dark:text-dark-secondary border border-secondary/30 flex items-center justify-center font-bold text-xs font-display shrink-0">
                    {{ getInitials(lecturer.name) }}
                  </div>
                  <div class="min-w-0">
                    <div class="font-bold text-slate-900 dark:text-white truncate flex items-center gap-1.5">
                      <span>{{ lecturer.name }}</span>
                    </div>
                    <div class="text-[11px] font-mono text-slate-400 flex items-center gap-2 truncate">
                      <span class="text-secondary font-semibold">{{ lecturer.displayId }}</span>
                      <span>·</span>
                      <span class="truncate">{{ lecturer.email }}</span>
                    </div>
                  </div>
                </div>
              </td>

              <!-- Employment Status (Interactive Toggle Badge) -->
              <td class="py-3.5 px-4">
                <div class="flex items-center gap-2">
                  <button
                    @click="toggleEmployment(lecturer)"
                    :id="'toggle-emp-' + lecturer.id"
                    :title="'Click to toggle: currently ' + (lecturer.employmentType || 'Full-Time')"
                    :class="[
                      'inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-mono font-bold border transition-all cursor-pointer shadow-xs active:scale-95',
                      isPartTime(lecturer)
                        ? 'bg-amber-50 dark:bg-amber-950/50 text-amber-700 dark:text-amber-300 border-amber-300 dark:border-amber-700 hover:bg-amber-100 dark:hover:bg-amber-900/60'
                        : 'bg-indigo-50 dark:bg-indigo-950/50 text-indigo-700 dark:text-indigo-300 border-indigo-300 dark:border-indigo-700 hover:bg-indigo-100 dark:hover:bg-indigo-900/60'
                    ]"
                  >
                    <Clock v-if="isPartTime(lecturer)" class="w-3.5 h-3.5 text-amber-500" />
                    <Briefcase v-else class="w-3.5 h-3.5 text-indigo-500" />
                    <span>{{ isPartTime(lecturer) ? 'Part-Time' : 'Full-Time' }}</span>
                    <span class="text-[10px] opacity-60 ml-0.5" title="Switch status">⇄</span>
                  </button>
                  <span class="text-[10px] font-mono text-slate-400 hidden xl:inline">
                    {{ isPartTime(lecturer) ? 'Contact claims' : 'Salaried staff' }}
                  </span>
                </div>
              </td>

              <!-- Department / Faculty -->
              <td class="py-3.5 px-4 text-xs text-slate-600 dark:text-white/80">
                <span class="px-2 py-0.5 rounded-lg bg-slate-100 dark:bg-dark-muted font-medium text-[11px]">
                  {{ lecturer.program || 'Faculty of Academics' }}
                </span>
              </td>

              <!-- Assigned Courses -->
              <td class="py-3.5 px-4">
                <div v-if="lecturer.assignedCourses && lecturer.assignedCourses.length" class="flex flex-wrap gap-1 max-w-xs">
                  <span
                    v-for="c in lecturer.assignedCourses.slice(0, 3)"
                    :key="c.id || c.code"
                    class="px-2 py-0.5 rounded-md text-[10px] font-mono font-bold bg-secondary/15 text-secondary dark:text-dark-secondary border border-secondary/30"
                    :title="c.name"
                  >
                    {{ c.code }}
                  </span>
                  <span
                    v-if="lecturer.assignedCourses.length > 3"
                    class="px-1.5 py-0.5 rounded-md text-[10px] font-mono text-slate-400 bg-slate-100 dark:bg-dark-muted"
                  >
                    +{{ lecturer.assignedCourses.length - 3 }} more
                  </span>
                </div>
                <span v-else class="text-[11px] font-mono text-slate-400 italic">No courses assigned</span>
              </td>

              <!-- Weekly Sessions / Slots -->
              <td class="py-3.5 px-4 font-mono text-xs text-slate-600 dark:text-white/80">
                <span class="inline-flex items-center gap-1">
                  <CalendarRange class="w-3.5 h-3.5 text-slate-400" />
                  {{ lecturer.schedulesCount || 0 }} slots/wk
                </span>
              </td>

              <!-- Actions -->
              <td class="py-3.5 px-4 text-right">
                <div class="inline-flex items-center gap-1.5">
                  <button
                    @click="openEditModal(lecturer)"
                    :id="'edit-lecturer-' + lecturer.id"
                    class="p-1.5 text-slate-500 hover:text-primary dark:hover:text-secondary hover:bg-slate-100 dark:hover:bg-dark-muted rounded-lg transition-colors cursor-pointer"
                    title="Edit Lecturer Details & Employment"
                  >
                    <Edit3 class="w-3.5 h-3.5" />
                  </button>

                  <button
                    @click="toggleEmployment(lecturer)"
                    :id="'btn-toggle-' + lecturer.id"
                    :class="[
                      'px-2 py-1 rounded-lg text-[10px] font-mono font-bold border transition-colors cursor-pointer',
                      isPartTime(lecturer)
                        ? 'text-indigo-600 border-indigo-200 hover:bg-indigo-50 dark:hover:bg-indigo-950/40'
                        : 'text-amber-600 border-amber-200 hover:bg-amber-50 dark:hover:bg-amber-950/40'
                    ]"
                    :title="isPartTime(lecturer) ? 'Make Full-Time Worker' : 'Make Part-Time Worker'"
                  >
                    {{ isPartTime(lecturer) ? 'Set Full-Time' : 'Set Part-Time' }}
                  </button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- Footer bar -->
      <div class="px-4 py-3 bg-slate-50/50 dark:bg-dark-muted/20 border-t border-slate-100 dark:border-dark-outline/40 flex items-center justify-between text-xs text-slate-400 font-mono">
        <span>Showing {{ filteredLecturers.length }} of {{ lecturers.length }} lecturers</span>
        <span>Southshore Administrative OS</span>
      </div>
    </div>

    <!-- Grid / Cards View -->
    <div v-else class="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
      <div
        v-for="lecturer in filteredLecturers"
        :key="lecturer.id"
        class="bg-white dark:bg-dark-surface border border-slate-200/80 dark:border-dark-outline/60 rounded-2xl p-5 shadow-xs hover:shadow-md transition-all flex flex-col justify-between relative group"
      >
        <div class="space-y-3.5">
          <!-- Card Header -->
          <div class="flex items-start justify-between gap-3">
            <div class="flex items-center gap-3 min-w-0">
              <div class="w-11 h-11 rounded-xl bg-gradient-to-br from-secondary/20 to-amber-500/20 text-secondary dark:text-dark-secondary border border-secondary/30 flex items-center justify-center font-bold text-sm font-display shrink-0">
                {{ getInitials(lecturer.name) }}
              </div>
              <div class="min-w-0">
                <h3 class="font-bold text-sm text-slate-900 dark:text-white truncate">
                  {{ lecturer.name }}
                </h3>
                <p class="text-[11px] font-mono text-secondary font-semibold">
                  {{ lecturer.displayId }}
                </p>
                <p class="text-[11px] text-slate-400 truncate">
                  {{ lecturer.email }}
                </p>
              </div>
            </div>

            <!-- Quick Edit -->
            <button
              @click="openEditModal(lecturer)"
              class="p-1.5 text-slate-400 hover:text-slate-700 dark:hover:text-white rounded-lg hover:bg-slate-100 dark:hover:bg-dark-muted transition-colors cursor-pointer shrink-0"
              title="Edit Lecturer"
            >
              <Edit3 class="w-3.5 h-3.5" />
            </button>
          </div>

          <!-- Employment Status Banner -->
          <div :class="['p-3 rounded-xl border flex items-center justify-between gap-2',
            isPartTime(lecturer)
              ? 'bg-amber-50/70 dark:bg-amber-950/40 border-amber-200 dark:border-amber-800/60'
              : 'bg-indigo-50/70 dark:bg-indigo-950/40 border-indigo-200 dark:border-indigo-800/60'
          ]">
            <div class="flex items-center gap-2">
              <div :class="['w-7 h-7 rounded-lg flex items-center justify-center shrink-0',
                isPartTime(lecturer) ? 'bg-amber-500 text-white' : 'bg-indigo-600 text-white'
              ]">
                <Clock v-if="isPartTime(lecturer)" class="w-3.5 h-3.5" />
                <Briefcase v-else class="w-3.5 h-3.5" />
              </div>
              <div>
                <span class="text-[10px] font-mono uppercase tracking-wider block font-bold" :class="isPartTime(lecturer) ? 'text-amber-800 dark:text-amber-300' : 'text-indigo-800 dark:text-indigo-300'">
                  {{ isPartTime(lecturer) ? 'Part-Time / Adjunct' : 'Full-Time Staff' }}
                </span>
                <span class="text-[10px] text-slate-500 dark:text-white/60">
                  {{ isPartTime(lecturer) ? 'Contact hour claims billing' : 'Salaried institutional faculty' }}
                </span>
              </div>
            </div>

            <!-- Toggle Button -->
            <button
              @click="toggleEmployment(lecturer)"
              class="px-2.5 py-1 rounded-lg text-[10px] font-mono font-bold bg-white dark:bg-dark-surface shadow-xs border border-slate-200 dark:border-dark-outline hover:border-secondary transition-all cursor-pointer active:scale-95 shrink-0"
              title="Switch employment type"
            >
              Switch ⇄
            </button>
          </div>

          <!-- Department / Program -->
          <div class="text-xs text-slate-600 dark:text-white/80">
            <span class="text-[10px] font-mono text-slate-400 block uppercase mb-0.5">Department / Faculty</span>
            <span class="font-medium">{{ lecturer.program || 'Faculty of Academics' }}</span>
          </div>

          <!-- Courses Taught -->
          <div class="text-xs">
            <span class="text-[10px] font-mono text-slate-400 block uppercase mb-1">Assigned Modules</span>
            <div v-if="lecturer.assignedCourses && lecturer.assignedCourses.length" class="flex flex-wrap gap-1.5">
              <span
                v-for="c in lecturer.assignedCourses"
                :key="c.id || c.code"
                class="px-2 py-0.5 rounded-md text-[10px] font-mono font-bold bg-secondary/15 text-secondary dark:text-dark-secondary border border-secondary/30"
              >
                {{ c.code }}
              </span>
            </div>
            <span v-else class="text-[11px] font-mono text-slate-400 italic">No course assignments yet</span>
          </div>
        </div>

        <!-- Card Footer -->
        <div class="mt-4 pt-3 border-t border-slate-100 dark:border-dark-outline/40 flex items-center justify-between text-[11px] text-slate-400 font-mono">
          <span class="flex items-center gap-1">
            <CalendarRange class="w-3.5 h-3.5" />
            {{ lecturer.schedulesCount || 0 }} slots / week
          </span>
          <button
            @click="openEditModal(lecturer)"
            class="text-secondary hover:underline font-semibold"
          >
            Manage Details →
          </button>
        </div>
      </div>
    </div>

    <!-- Add / Edit Lecturer Modal -->
    <div
      v-if="isModalOpen"
      class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200"
      @click.self="closeModal"
    >
      <div class="relative w-full max-w-xl bg-white dark:bg-dark-surface border border-slate-200 dark:border-dark-outline rounded-3xl shadow-2xl overflow-hidden max-h-[92vh] flex flex-col">
        <div class="absolute top-2 left-2 w-3 h-3 border-t-2 border-l-2 border-secondary/40 pointer-events-none"></div>
        <div class="absolute top-2 right-2 w-3 h-3 border-t-2 border-r-2 border-secondary/40 pointer-events-none"></div>

        <!-- Header -->
        <div class="p-6 border-b border-slate-100 dark:border-dark-outline flex items-start justify-between gap-4">
          <div class="flex items-start gap-3">
            <div :class="['w-10 h-10 rounded-xl flex items-center justify-center',
              isEditing ? 'bg-amber-100 dark:bg-amber-950/40 text-amber-600' : 'bg-primary/10 text-primary dark:bg-secondary/15 dark:text-secondary'
            ]">
              <Edit3 v-if="isEditing" class="w-5 h-5" />
              <UserPlus v-else class="w-5 h-5" />
            </div>
            <div>
              <span class="text-[10px] font-mono uppercase tracking-wider text-secondary font-bold">
                {{ isEditing ? 'FACULTY MODIFICATION' : 'FACULTY ONBOARDING' }}
              </span>
              <h2 class="text-xl font-display font-bold text-slate-900 dark:text-white">
                {{ isEditing ? 'Edit Lecturer Profile' : 'Add New Lecturer' }}
              </h2>
              <p class="text-xs text-slate-500 dark:text-white/70 mt-0.5">
                Configure academic identity, department, and Part-Time / Full-Time designation.
              </p>
            </div>
          </div>
          <button @click="closeModal" class="p-2 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 rounded-xl hover:bg-slate-100 dark:hover:bg-dark-muted transition-colors cursor-pointer">
            <X class="w-5 h-5" />
          </button>
        </div>

        <!-- Modal Form Body -->
        <form @submit.prevent="saveLecturer" class="p-6 overflow-y-auto space-y-4 text-xs sm:text-sm flex-1">
          <!-- Employment Type Selector -->
          <div class="space-y-2 p-4 rounded-2xl bg-slate-50 dark:bg-dark-muted/50 border border-slate-200 dark:border-dark-outline/70">
            <div class="flex items-center justify-between">
              <label class="text-[11px] font-mono uppercase tracking-wider text-slate-700 dark:text-white font-bold flex items-center gap-1.5">
                <Briefcase class="w-3.5 h-3.5 text-secondary" />
                Employment Classification <span class="text-rose-500">*</span>
              </label>
              <span class="text-[10px] font-mono px-2 py-0.5 rounded-full bg-secondary/15 text-secondary font-semibold">
                Finance Claims Link
              </span>
            </div>

            <div class="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
              <!-- Full-Time Option -->
              <button
                type="button"
                @click="form.employmentType = 'Full-Time'"
                :class="['p-3.5 rounded-xl border text-left transition-all cursor-pointer relative',
                  form.employmentType === 'Full-Time'
                    ? 'border-indigo-500 bg-indigo-50/80 dark:bg-indigo-950/40 ring-2 ring-indigo-500/30'
                    : 'border-slate-200 dark:border-dark-outline/70 bg-white dark:bg-dark-surface hover:border-slate-300'
                ]"
              >
                <div class="flex items-center gap-2 mb-1">
                  <Briefcase class="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                  <span class="font-bold text-xs text-slate-900 dark:text-white">Full-Time Faculty</span>
                </div>
                <p class="text-[11px] text-slate-500 dark:text-white/70">
                  Permanent academic staff on standard institutional payroll.
                </p>
                <div v-if="form.employmentType === 'Full-Time'" class="absolute top-2.5 right-2.5 w-2 h-2 rounded-full bg-indigo-500"></div>
              </button>

              <!-- Part-Time Option -->
              <button
                type="button"
                @click="form.employmentType = 'Part-Time'"
                :class="['p-3.5 rounded-xl border text-left transition-all cursor-pointer relative',
                  form.employmentType === 'Part-Time'
                    ? 'border-amber-500 bg-amber-50/80 dark:bg-amber-950/40 ring-2 ring-amber-500/30'
                    : 'border-slate-200 dark:border-dark-outline/70 bg-white dark:bg-dark-surface hover:border-slate-300'
                ]"
              >
                <div class="flex items-center gap-2 mb-1">
                  <Clock class="w-4 h-4 text-amber-600 dark:text-amber-400" />
                  <span class="font-bold text-xs text-slate-900 dark:text-white">Part-Time / Adjunct</span>
                </div>
                <p class="text-[11px] text-slate-500 dark:text-white/70">
                  Billed per contact session/hour in Finance Claims Office.
                </p>
                <div v-if="form.employmentType === 'Part-Time'" class="absolute top-2.5 right-2.5 w-2 h-2 rounded-full bg-amber-500"></div>
              </button>
            </div>
          </div>

          <!-- Name & Email -->
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div class="space-y-1.5">
              <label for="lecturer-name-input" class="text-[11px] font-mono uppercase tracking-wider text-slate-500 dark:text-white/75">
                Full Name with Title <span class="text-rose-500">*</span>
              </label>
              <input
                type="text"
                id="lecturer-name-input"
                v-model="form.name"
                placeholder="e.g. Dr. Kwame Mensah or Prof. Sarah Osei"
                required
                class="w-full bg-slate-50 dark:bg-dark-muted/80 border border-slate-200 dark:border-dark-outline/70 rounded-xl px-3 py-2.5 text-xs sm:text-sm text-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-secondary/50"
              />
            </div>

            <div class="space-y-1.5">
              <label for="lecturer-email-input" class="text-[11px] font-mono uppercase tracking-wider text-slate-500 dark:text-white/75">
                Official University Email <span class="text-rose-500">*</span>
              </label>
              <input
                type="email"
                id="lecturer-email-input"
                v-model="form.email"
                placeholder="name@southshore.edu.gh"
                required
                class="w-full bg-slate-50 dark:bg-dark-muted/80 border border-slate-200 dark:border-dark-outline/70 rounded-xl px-3 py-2.5 text-xs sm:text-sm text-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-secondary/50"
              />
            </div>
          </div>

          <!-- Staff ID & Department -->
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div class="space-y-1.5">
              <label for="lecturer-staffid-input" class="text-[11px] font-mono uppercase tracking-wider text-slate-500 dark:text-white/75">
                Staff ID Number
                <span v-if="!isEditing" class="normal-case text-slate-400"> (auto-generated if empty)</span>
              </label>
              <input
                type="text"
                id="lecturer-staffid-input"
                v-model="form.displayId"
                placeholder="e.g. LEC008 or STAFF/KWAME"
                :disabled="isEditing"
                class="w-full bg-slate-50 dark:bg-dark-muted/80 border border-slate-200 dark:border-dark-outline/70 rounded-xl px-3 py-2.5 text-xs sm:text-sm text-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-secondary/50 disabled:opacity-50 disabled:cursor-not-allowed"
              />
            </div>

            <div class="space-y-1.5">
              <label for="lecturer-dept-input" class="text-[11px] font-mono uppercase tracking-wider text-slate-500 dark:text-white/75">
                Department / Specialization
              </label>
              <input
                type="text"
                id="lecturer-dept-input"
                v-model="form.program"
                placeholder="e.g. Computer Science or Business Admin"
                class="w-full bg-slate-50 dark:bg-dark-muted/80 border border-slate-200 dark:border-dark-outline/70 rounded-xl px-3 py-2.5 text-xs sm:text-sm text-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-secondary/50"
              />
            </div>
          </div>

          <!-- Password (Only for new or when changing) -->
          <div class="space-y-1.5">
            <label for="lecturer-pass-input" class="text-[11px] font-mono uppercase tracking-wider text-slate-500 dark:text-white/75">
              {{ isEditing ? 'Change Password' : 'Initial Password' }}
              <span v-if="!isEditing" class="text-rose-500">*</span>
              <span v-else class="normal-case text-slate-400"> (leave blank to keep current)</span>
            </label>
            <div class="relative">
              <input
                :type="showPassword ? 'text' : 'password'"
                id="lecturer-pass-input"
                v-model="form.password"
                :placeholder="isEditing ? 'Enter new password if changing...' : 'Minimum 6 characters'"
                :required="!isEditing"
                class="w-full bg-slate-50 dark:bg-dark-muted/80 border border-slate-200 dark:border-dark-outline/70 rounded-xl px-3 py-2.5 pr-10 text-xs sm:text-sm text-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-secondary/50"
              />
              <button
                type="button"
                @click="showPassword = !showPassword"
                class="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
              >
                <Eye v-if="!showPassword" class="w-4 h-4" />
                <EyeOff v-else class="w-4 h-4" />
              </button>
            </div>
          </div>

          <div v-if="modalError" class="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2">
            <AlertCircle class="w-4 h-4 shrink-0" />
            <span>{{ modalError }}</span>
          </div>

          <!-- Modal Action Buttons -->
          <div class="flex items-center justify-end gap-3 pt-3 border-t border-slate-100 dark:border-dark-outline">
            <button
              type="button"
              @click="closeModal"
              class="px-4 py-2.5 rounded-xl border border-slate-200 dark:border-dark-outline/70 text-xs sm:text-sm font-semibold hover:bg-slate-50 dark:hover:bg-dark-muted transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              :disabled="isSaving"
              id="btn-save-lecturer"
              class="px-5 py-2.5 rounded-xl bg-primary hover:bg-primary/90 text-white text-xs sm:text-sm font-semibold transition-all shadow-md inline-flex items-center gap-2 cursor-pointer active:scale-95 disabled:opacity-50"
            >
              <Loader2 v-if="isSaving" class="w-4 h-4 animate-spin" />
              <span>{{ isSaving ? 'Saving...' : (isEditing ? 'Save Changes' : 'Create Lecturer') }}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { supabase } from '@/stores/supabase';
import api from '@/api.js';
import { useCoursesStore } from '@/stores/courses.js';
import { useSchedulesStore } from '@/stores/schedules.js';
import {
  GraduationCap,
  Briefcase,
  Clock,
  BookOpen,
  Search,
  X,
  RotateCcw,
  RefreshCw,
  UserPlus,
  Edit3,
  CalendarRange,
  Loader2,
  CheckCircle2,
  AlertCircle,
  List,
  LayoutGrid,
  UserX,
  Eye,
  EyeOff
} from 'lucide-vue-next';

const coursesStore = useCoursesStore();
const schedulesStore = useSchedulesStore();

// State
const lecturers = ref([]);
const isLoading = ref(false);
const searchQuery = ref('');
const statusFilter = ref('all'); // 'all', 'Full-Time', 'Part-Time'
const viewMode = ref('table'); // 'table' or 'cards'

// Toast
const alertMessage = ref('');
const alertType = ref('success');
const showAlert = (msg, type = 'success') => {
  alertMessage.value = msg;
  alertType.value = type;
  setTimeout(() => { if (alertMessage.value === msg) alertMessage.value = ''; }, 4500);
};

// Modal State
const isModalOpen = ref(false);
const isEditing = ref(false);
const isSaving = ref(false);
const modalError = ref('');
const showPassword = ref(false);

const form = ref({
  id: '',
  name: '',
  email: '',
  displayId: '',
  program: '',
  employmentType: 'Full-Time',
  password: ''
});

// Helper: check if lecturer is part-time
const isPartTime = (l) => (l.employmentType || '').toLowerCase().includes('part');

// Helper: get avatar initials
const getInitials = (name) => {
  if (!name) return 'LC';
  const clean = name.replace(/^(dr\.|prof\.|mr\.|mrs\.|ms\.)\s*/i, '').trim();
  const parts = clean.split(/\s+/);
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
};

// Main Data Fetcher
const fetchLecturers = async () => {
  isLoading.value = true;
  try {
    // 1. Fetch courses and schedules in parallel
    await Promise.allSettled([
      coursesStore.fetchCourses(),
      schedulesStore.fetchSchedules(),
    ]);

    // 2. Read local cache for employment types
    let localEmpMap = {};
    try {
      localEmpMap = JSON.parse(localStorage.getItem('lecturer_employment_types') || '{}');
    } catch {}

    // 3. Fetch backend lecturers
    let bLecturers = [];
    let backendEmpMap = {};
    try {
      const { data } = await api.get('/admin/lecturers');
      if (Array.isArray(data)) {
        bLecturers = data;
        bLecturers.forEach((l) => {
          if (l.id && l.employmentType) backendEmpMap[l.id] = l.employmentType;
          if (l.email && l.employmentType) backendEmpMap[l.email.toLowerCase()] = l.employmentType;
        });
      }
    } catch {}

    // 4. Also fetch from /users endpoint for full user accounts in dev.db
    let bUsersList = [];
    try {
      const { data: bUsers } = await api.get('/users', { params: { role: 'LECTURER' } });
      if (bUsers?.users?.length > 0) {
        bUsersList = bUsers.users.filter((u) => (u.role || '').toUpperCase() === 'LECTURER');
      }
    } catch {}

    // 5. Query all lecturers from Supabase
    let supaList = [];
    try {
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .ilike('role', 'lecturer')
        .order('name');
      if (!error && data) supaList = data;
    } catch (e) {
      console.warn('Supabase lecturer fetch notice:', e);
    }

    // 6. Read locally registered lecturers
    let localCreated = [];
    try {
      localCreated = JSON.parse(localStorage.getItem('custom_created_lecturers') || '[]');
    } catch {}

    // 7. Unify and deduplicate candidates across all data sources
    const unifiedMap = new Map();

    const addCandidate = (u) => {
      if (!u) return;
      const rawId = (u.id || '').toString().trim();
      const rawEmail = (u.email || '').toString().trim().toLowerCase();
      const dedupeKey = (rawEmail && rawEmail !== '—') ? `email:${rawEmail}` : `id:${rawId}`;
      if (!dedupeKey || dedupeKey === 'id:') return;

      const existing = unifiedMap.get(dedupeKey) || (rawId ? unifiedMap.get(`id:${rawId}`) : null);

      const rawEmp =
        u.employment_type ||
        u.employmentType ||
        (rawId ? backendEmpMap[rawId] : null) ||
        (rawEmail ? backendEmpMap[rawEmail] : null) ||
        (rawId ? localEmpMap[rawId] : null) ||
        (rawEmail ? localEmpMap[rawEmail] : null) ||
        existing?.employmentType;

      const employmentType = rawEmp
        ? (rawEmp.toLowerCase().includes('part') ? 'Part-Time' : 'Full-Time')
        : 'Full-Time';

      const resolved = {
        id: rawId || existing?.id || `lec-${Date.now()}`,
        id_number: u.id_number || u.displayId || existing?.id_number || rawId,
        name: u.name || u.full_name || existing?.name || 'Academic Faculty',
        email: u.email && u.email !== '—' ? u.email : (existing?.email || '—'),
        role: 'LECTURER',
        employmentType,
        program: u.program || u.program_id || existing?.program || 'Academic Faculty',
        createdAt: u.created_at || u.createdAt || existing?.createdAt || new Date().toISOString()
      };

      unifiedMap.set(dedupeKey, resolved);
      if (rawId) unifiedMap.set(`id:${rawId}`, resolved);
      if (rawEmail && rawEmail !== '—') unifiedMap.set(`email:${rawEmail}`, resolved);
    };

    // Prioritized ingestion: Supabase -> Backend /users -> Backend /admin/lecturers -> Local Storage
    supaList.forEach(addCandidate);
    bUsersList.forEach(addCandidate);
    bLecturers.forEach(addCandidate);
    localCreated.forEach(addCandidate);

    const unifiedList = Array.from(new Set(unifiedMap.values()));

    const allSchedules = schedulesStore.schedules || [];
    const allCourses = coursesStore.courses || [];

    // 8. Enrich each lecturer with matched courses & schedules
    lecturers.value = unifiedList.map((u) => {
      const uNameLower = (u.name || '').trim().toLowerCase();
      const cleanUName = uNameLower.replace(/^(dr\.|prof\.|mr\.|mrs\.|ms\.)\s*/i, '').trim();

      // Find schedules matching this lecturer
      const matchedSchedules = allSchedules.filter((s) => {
        if (!s.lecturer) return false;
        const sLect = s.lecturer.trim().toLowerCase();
        const cleanSLect = sLect.replace(/^(dr\.|prof\.|mr\.|mrs\.|ms\.)\s*/i, '').trim();
        return (
          sLect === uNameLower ||
          cleanSLect === cleanUName ||
          cleanSLect.includes(cleanUName) ||
          cleanUName.includes(cleanSLect) ||
          s.lecturer === u.id ||
          s.lecturerId === u.id
        );
      });

      // Find distinct courses
      const courseIdSet = new Set(matchedSchedules.map((s) => s.courseId));
      const assignedCourses = [];
      courseIdSet.forEach((cId) => {
        const c = allCourses.find((x) => x.id === cId || x.code === cId);
        if (c) assignedCourses.push(c);
        else if (cId) assignedCourses.push({ id: cId, code: cId, name: cId });
      });

      return {
        id: u.id,
        displayId: u.id_number || (u.id.length > 18 ? u.id.slice(0, 8) + '...' : u.id),
        name: u.name || 'Unnamed Lecturer',
        email: u.email || '—',
        role: 'LECTURER',
        employmentType: u.employmentType,
        program: u.program || u.program_id || 'Academic Faculty',
        assignedCourses,
        schedulesCount: matchedSchedules.length,
        createdAt: u.created_at || u.createdAt || new Date().toISOString(),
      };
    });
  } catch (err) {
    console.error('Failed to load lecturers:', err);
    showAlert('Failed to load lecturers roster.', 'error');
  } finally {
    isLoading.value = false;
  }
};

onMounted(() => {
  fetchLecturers();
});

// Computed Stats
const stats = computed(() => {
  const total = lecturers.value.length;
  const partTime = lecturers.value.filter((l) => isPartTime(l)).length;
  const fullTime = total - partTime;

  const allAssignedCodes = new Set();
  lecturers.value.forEach((l) => {
    (l.assignedCourses || []).forEach((c) => allAssignedCodes.add(c.code || c.id));
  });

  return {
    total,
    partTime,
    fullTime,
    assignedCourses: allAssignedCodes.size,
  };
});

// Filtered List
const filteredLecturers = computed(() => {
  let list = [...lecturers.value];

  // Status Filter
  if (statusFilter.value === 'Full-Time') {
    list = list.filter((l) => !isPartTime(l));
  } else if (statusFilter.value === 'Part-Time') {
    list = list.filter((l) => isPartTime(l));
  }

  // Search Query
  if (searchQuery.value.trim()) {
    const q = searchQuery.value.toLowerCase().trim();
    list = list.filter((l) => {
      const matchName = (l.name || '').toLowerCase().includes(q);
      const matchEmail = (l.email || '').toLowerCase().includes(q);
      const matchId = (l.displayId || '').toLowerCase().includes(q) || (l.id || '').toLowerCase().includes(q);
      const matchDept = (l.program || '').toLowerCase().includes(q);
      const matchCourse = (l.assignedCourses || []).some(
        (c) => (c.code || '').toLowerCase().includes(q) || (c.name || '').toLowerCase().includes(q)
      );
      return matchName || matchEmail || matchId || matchDept || matchCourse;
    });
  }

  return list;
});

const resetFilters = () => {
  searchQuery.value = '';
  statusFilter.value = 'all';
};

// Quick Toggle Employment Status
const toggleEmployment = async (lecturer) => {
  const oldType = lecturer.employmentType;
  const newType = isPartTime(lecturer) ? 'Full-Time' : 'Part-Time';
  lecturer.employmentType = newType;

  // Persist locally
  try {
    const localMap = JSON.parse(localStorage.getItem('lecturer_employment_types') || '{}');
    localMap[lecturer.id] = newType;
    if (lecturer.email) localMap[lecturer.email.toLowerCase()] = newType;
    localStorage.setItem('lecturer_employment_types', JSON.stringify(localMap));
  } catch {}

  try {
    // 1. Sync with backend API (updates dev.db / SQLite for Finance Claims)
    await api.patch(`/admin/lecturers/${lecturer.id}/employment-type`, {
      employmentType: newType,
      name: lecturer.name,
      email: lecturer.email,
    });

    // 2. Try Supabase update
    try {
      await supabase.from('users').update({ employment_type: newType }).eq('id', lecturer.id);
    } catch {}

    showAlert(`Lecturer ${lecturer.name} is now designated as ${newType}.`, 'success');
  } catch (err) {
    lecturer.employmentType = oldType;
    console.error('Failed to toggle employment:', err);
    showAlert('Could not update employment type on server.', 'error');
  }
};

// Modal Operations
const openAddModal = () => {
  isEditing.value = false;
  modalError.value = '';
  showPassword.value = false;
  form.value = {
    id: '',
    name: '',
    email: '',
    displayId: '',
    program: '',
    employmentType: 'Full-Time',
    password: '',
  };
  isModalOpen.value = true;
};

const openEditModal = (lecturer) => {
  isEditing.value = true;
  modalError.value = '';
  showPassword.value = false;
  form.value = {
    id: lecturer.id,
    name: lecturer.name || '',
    email: lecturer.email === '—' ? '' : lecturer.email,
    displayId: lecturer.displayId || '',
    program: lecturer.program || '',
    employmentType: lecturer.employmentType || 'Full-Time',
    password: '',
  };
  isModalOpen.value = true;
};

const closeModal = () => {
  isModalOpen.value = false;
  modalError.value = '';
};

// Save Lecturer (Add or Edit)
const saveLecturer = async () => {
  modalError.value = '';
  isSaving.value = true;
  try {
    const chosenEmployment = form.value.employmentType || 'Full-Time';

    if (isEditing.value) {
      // 1. Cache locally
      try {
        const localMap = JSON.parse(localStorage.getItem('lecturer_employment_types') || '{}');
        localMap[form.value.id] = chosenEmployment;
        if (form.value.email) localMap[form.value.email.toLowerCase()] = chosenEmployment;
        localStorage.setItem('lecturer_employment_types', JSON.stringify(localMap));
      } catch {}

      // 2. Update backend database
      try {
        await api.patch(`/admin/lecturers/${form.value.id}/employment-type`, {
          employmentType: chosenEmployment,
          name: form.value.name,
          email: form.value.email,
        });
      } catch {}

      // 3. Update Supabase
      const updateData = {
        name: form.value.name.trim(),
        role: 'Lecturer',
        updated_at: new Date().toISOString(),
      };
      if (form.value.email) updateData.email = form.value.email.trim().toLowerCase();
      if (form.value.program) updateData.program = form.value.program.trim();

      const { error: supaErr } = await supabase
        .from('users')
        .update({ ...updateData, employment_type: chosenEmployment })
        .eq('id', form.value.id);

      if (supaErr) {
        // Fallback without employment_type if column missing
        await supabase.from('users').update(updateData).eq('id', form.value.id);
      }

      showAlert(`Lecturer '${form.value.name}' updated successfully!`, 'success');
    } else {
      // Create New Lecturer
      let backendId = null;
      let created = false;
      const cleanEmail = form.value.email.trim().toLowerCase();
      const cleanName = form.value.name.trim();
      const customId = form.value.displayId ? form.value.displayId.trim() : null;

      // 1. Post to Express backend API (dev.db)
      try {
        const res = await api.post('/users', {
          id: customId || undefined,
          name: cleanName,
          email: cleanEmail,
          role: 'LECTURER',
          employmentType: chosenEmployment,
          program: form.value.program,
          password: form.value.password,
        });
        if (res.status === 201 || res.status === 200) {
          created = true;
          backendId = res.data?.user?.id || res.data?.id;
        }
      } catch (backendErr) {
        console.warn('Backend user creation response:', backendErr?.response?.data || backendErr);
        // If already exists or error, still proceed to sync
        if (backendErr?.response?.data?.message?.includes('already exists')) {
          created = true;
        }
      }

      // 2. Also register in Supabase Auth
      try {
        await supabase.auth.signUp({
          email: cleanEmail,
          password: form.value.password,
          options: {
            data: {
              full_name: cleanName,
              role: 'Lecturer',
              employment_type: chosenEmployment,
              id_number: customId || undefined,
              program: form.value.program || undefined,
            },
          },
        });
      } catch (signUpErr) {
        console.warn('Supabase auth signup notice:', signUpErr);
      }

      // 3. Persist locally in cache
      const finalId = customId || backendId || `LEC${Date.now().toString().slice(-4)}`;
      try {
        const localMap = JSON.parse(localStorage.getItem('lecturer_employment_types') || '{}');
        localMap[finalId] = chosenEmployment;
        localMap[cleanEmail] = chosenEmployment;
        localStorage.setItem('lecturer_employment_types', JSON.stringify(localMap));

        const customLecturers = JSON.parse(localStorage.getItem('custom_created_lecturers') || '[]');
        const newRecord = {
          id: finalId,
          displayId: finalId,
          name: cleanName,
          email: cleanEmail,
          role: 'LECTURER',
          employmentType: chosenEmployment,
          program: form.value.program || 'Academic Faculty',
          createdAt: new Date().toISOString()
        };
        const deduped = customLecturers.filter(l => (l.email || '').toLowerCase() !== cleanEmail && l.id !== finalId);
        deduped.unshift(newRecord);
        localStorage.setItem('custom_created_lecturers', JSON.stringify(deduped));
      } catch {}

      showAlert(`Lecturer '${cleanName}' added successfully as ${chosenEmployment}!`, 'success');
    }

    closeModal();
    await fetchLecturers();
  } catch (err) {
    console.error('Error saving lecturer:', err);
    modalError.value = err.message || 'Operation failed. Please check inputs.';
  } finally {
    isSaving.value = false;
  }
};
</script>

<style scoped>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.2s ease;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
