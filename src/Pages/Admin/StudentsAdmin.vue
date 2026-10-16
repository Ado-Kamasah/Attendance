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
              ADMIN // STUDENT ENROLLMENT & ACADEMIC REGISTRY
            </span>
            <span class="text-xs font-mono text-slate-400">· SOUTHSHORE ACADEMIC SERVICES</span>
          </div>
          <h1 class="text-2xl sm:text-3xl font-display font-bold text-slate-900 dark:text-white tracking-tight">
            Students & Course Registration
          </h1>
          <p class="text-xs sm:text-sm text-slate-500 dark:text-white/70 mt-1 max-w-2xl">
            Register students into the academic portal, assist learners facing course enrollment difficulties, and manage course registrations or bulk batch enrolments.
          </p>
        </div>

        <div class="flex flex-wrap items-center gap-2.5">
          <button
            @click="fetchStudentsData"
            :disabled="isLoading"
            class="px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-dark-outline/70 bg-white dark:bg-dark-muted/50 hover:bg-slate-50 dark:hover:bg-dark-muted text-xs font-semibold text-slate-700 dark:text-white/90 transition-all flex items-center gap-2 cursor-pointer shadow-xs"
            title="Refresh Student Roster"
          >
            <RefreshCw class="w-3.5 h-3.5" :class="{ 'animate-spin': isLoading }" />
            <span class="hidden sm:inline">Refresh</span>
          </button>

          <button
            @click="openBatchEnrollModal"
            class="px-3.5 py-2.5 rounded-xl border border-secondary/40 bg-secondary/10 hover:bg-secondary/20 text-secondary text-xs font-semibold tracking-wide transition-all shadow-xs inline-flex items-center gap-2 cursor-pointer active:scale-95"
            title="Batch Enroll Whole Class or Level"
          >
            <Layers class="w-4 h-4 text-secondary" />
            <span>Batch Enroll Cohort</span>
          </button>

          <button
            @click="openAddStudentModal"
            id="btn-add-student"
            class="px-4 py-2.5 rounded-xl bg-primary hover:bg-primary/90 text-white text-xs font-semibold tracking-wide transition-all shadow-md hover:shadow-lg inline-flex items-center gap-2 cursor-pointer active:scale-95"
          >
            <UserPlus class="w-4 h-4 text-secondary" />
            <span>Register New Student</span>
          </button>
        </div>
      </div>

      <!-- KPI Summary Cards -->
      <div class="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mt-6 pt-6 border-t border-slate-100 dark:border-dark-outline/40">
        <!-- Total Students -->
        <div 
          @click="statusFilter = 'all'"
          :class="['p-4 rounded-2xl border transition-all cursor-pointer flex items-center gap-3.5',
            statusFilter === 'all'
              ? 'bg-slate-100/90 dark:bg-dark-muted/80 border-slate-300 dark:border-dark-outline shadow-xs'
              : 'bg-slate-50 dark:bg-dark-muted/40 border-slate-200/70 dark:border-dark-outline/50 hover:border-slate-300'
          ]"
        >
          <div class="w-10 h-10 rounded-xl bg-blue-100 dark:bg-blue-950/50 text-blue-600 dark:text-blue-400 flex items-center justify-center shrink-0">
            <GraduationCap class="w-5 h-5" />
          </div>
          <div>
            <span class="text-[10px] font-mono uppercase tracking-wider text-slate-400 block font-semibold">Total Students</span>
            <div class="text-xl sm:text-2xl font-bold font-display text-slate-900 dark:text-white">{{ stats.total }}</div>
          </div>
        </div>

        <!-- Fully Enrolled (>= 1 course) -->
        <div 
          @click="statusFilter = 'enrolled'"
          :class="['p-4 rounded-2xl border transition-all cursor-pointer flex items-center gap-3.5',
            statusFilter === 'enrolled'
              ? 'bg-emerald-50/90 dark:bg-emerald-950/50 border-emerald-300 dark:border-emerald-700 shadow-xs'
              : 'bg-slate-50 dark:bg-dark-muted/40 border-slate-200/70 dark:border-dark-outline/50 hover:border-emerald-200'
          ]"
        >
          <div class="w-10 h-10 rounded-xl bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0">
            <CheckCircle2 class="w-5 h-5" />
          </div>
          <div>
            <div class="flex items-center gap-1.5">
              <span class="text-[10px] font-mono uppercase tracking-wider text-slate-400 font-semibold">Enrolled</span>
              <span class="text-[10px] font-mono px-1.5 py-0.2 rounded-full bg-emerald-100 text-emerald-700 dark:bg-emerald-900/60 dark:text-emerald-300 font-bold">Active</span>
            </div>
            <div class="text-xl sm:text-2xl font-bold font-display text-emerald-900 dark:text-emerald-200">{{ stats.enrolled }}</div>
          </div>
        </div>

        <!-- Needs Help / Unregistered (0 courses) -->
        <div 
          @click="statusFilter = 'unenrolled'"
          :class="['p-4 rounded-2xl border transition-all cursor-pointer flex items-center gap-3.5',
            statusFilter === 'unenrolled'
              ? 'bg-rose-50/90 dark:bg-rose-950/50 border-rose-300 dark:border-rose-700 shadow-xs ring-2 ring-rose-400/30'
              : 'bg-slate-50 dark:bg-dark-muted/40 border-slate-200/70 dark:border-dark-outline/50 hover:border-rose-200'
          ]"
        >
          <div class="w-10 h-10 rounded-xl bg-rose-100 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400 flex items-center justify-center shrink-0">
            <AlertTriangle class="w-5 h-5" />
          </div>
          <div>
            <div class="flex items-center gap-1.5">
              <span class="text-[10px] font-mono uppercase tracking-wider text-slate-400 font-semibold">Needs Reg Help</span>
              <span class="text-[10px] font-mono px-1.5 py-0.2 rounded-full bg-rose-100 text-rose-700 dark:bg-rose-900/60 dark:text-rose-300 font-bold">0 Courses</span>
            </div>
            <div class="text-xl sm:text-2xl font-bold font-display text-rose-900 dark:text-rose-200">{{ stats.unenrolled }}</div>
          </div>
        </div>

        <!-- Total Course Enrollments -->
        <div class="p-4 rounded-2xl bg-slate-50 dark:bg-dark-muted/40 border border-slate-200/70 dark:border-dark-outline/50 flex items-center gap-3.5">
          <div class="w-10 h-10 rounded-xl bg-violet-100 dark:bg-violet-950/50 text-violet-600 dark:text-violet-400 flex items-center justify-center shrink-0">
            <BookOpen class="w-5 h-5" />
          </div>
          <div>
            <span class="text-[10px] font-mono uppercase tracking-wider text-slate-400 block font-semibold">Total Module Seats</span>
            <div class="text-xl sm:text-2xl font-bold font-display text-slate-900 dark:text-white">{{ stats.totalEnrollments }}</div>
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
          id="student-search-input"
          placeholder="Search by student name, index/ID number, email, program, or enrolled course..."
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
        <!-- Level Filter -->
        <select
          v-model="levelFilter"
          class="px-3 py-2 bg-slate-50 dark:bg-dark-muted/80 border border-slate-200 dark:border-dark-outline/70 rounded-xl text-xs text-slate-700 dark:text-white font-mono focus:outline-none focus:ring-2 focus:ring-secondary/50"
        >
          <option value="all">All Levels</option>
          <option value="100">Level 100</option>
          <option value="200">Level 200</option>
          <option value="300">Level 300</option>
          <option value="400">Level 400</option>
        </select>

        <!-- Program Filter -->
        <select
          v-model="programFilter"
          class="px-3 py-2 bg-slate-50 dark:bg-dark-muted/80 border border-slate-200 dark:border-dark-outline/70 rounded-xl text-xs text-slate-700 dark:text-white font-mono focus:outline-none focus:ring-2 focus:ring-secondary/50 max-w-[160px] truncate"
        >
          <option value="all">All Programs</option>
          <option v-for="prog in availablePrograms" :key="prog" :value="prog">
            {{ prog }}
          </option>
        </select>

        <!-- Registration Status Filter -->
        <div class="inline-flex p-1 rounded-xl bg-slate-100 dark:bg-dark-muted/70 border border-slate-200 dark:border-dark-outline/50 shrink-0">
          <button
            v-for="f in [
              { key: 'all', label: `All (${stats.total})` },
              { key: 'enrolled', label: `Enrolled (${stats.enrolled})` },
              { key: 'unenrolled', label: `Needs Help (${stats.unenrolled})` }
            ]"
            :key="f.key"
            @click="statusFilter = f.key"
            :class="['px-2.5 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer flex items-center gap-1.5',
              statusFilter === f.key
                ? 'bg-white dark:bg-dark-surface text-slate-900 dark:text-white shadow-xs font-bold'
                : 'text-slate-500 dark:text-white/70 hover:text-slate-800'
            ]"
          >
            <span>{{ f.label }}</span>
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
          v-if="searchQuery || statusFilter !== 'all' || levelFilter !== 'all' || programFilter !== 'all'"
          @click="resetFilters"
          class="p-2 text-slate-400 hover:text-rose-600 rounded-xl hover:bg-slate-100 dark:hover:bg-dark-muted transition-colors cursor-pointer"
          title="Reset All Filters"
        >
          <RotateCcw class="w-4 h-4" />
        </button>
      </div>
    </div>

    <!-- Loading State -->
    <div v-if="isLoading" class="p-16 text-center bg-white dark:bg-dark-surface rounded-2xl border border-slate-200/80 dark:border-dark-outline/60 flex flex-col items-center justify-center">
      <Loader2 class="w-8 h-8 text-secondary animate-spin mb-3" />
      <p class="text-xs font-mono tracking-wider uppercase text-slate-500 dark:text-white/70">
        Loading Student Roster & Course Registrations...
      </p>
    </div>

    <!-- Empty State -->
    <div v-else-if="filteredStudents.length === 0" class="p-12 text-center bg-white dark:bg-dark-surface rounded-2xl border border-slate-200/80 dark:border-dark-outline/60">
      <div class="w-14 h-14 rounded-2xl bg-slate-100 dark:bg-dark-muted flex items-center justify-center mx-auto mb-3 text-slate-400">
        <UserX class="w-7 h-7" />
      </div>
      <h3 class="font-display font-bold text-slate-900 dark:text-white text-base">No Students Found</h3>
      <p class="text-xs text-slate-500 dark:text-white/70 mt-1 max-w-sm mx-auto">
        {{ searchQuery || statusFilter !== 'all' || levelFilter !== 'all' || programFilter !== 'all' ? 'No student records match the active search or filter criteria.' : 'No registered student accounts exist in the directory yet.' }}
      </p>
      <div class="mt-4 flex items-center justify-center gap-2">
        <button
          v-if="searchQuery || statusFilter !== 'all' || levelFilter !== 'all' || programFilter !== 'all'"
          @click="resetFilters"
          class="px-4 py-2 rounded-xl border border-slate-200 dark:border-dark-outline/70 text-xs font-semibold hover:bg-slate-50 dark:hover:bg-dark-muted transition-all"
        >
          Clear Filters
        </button>
        <button
          @click="openAddStudentModal"
          class="px-4 py-2 rounded-xl bg-primary text-white text-xs font-semibold hover:bg-primary/90 transition-all inline-flex items-center gap-1.5"
        >
          <UserPlus class="w-3.5 h-3.5" /> Register Student
        </button>
      </div>
    </div>

    <!-- Table View -->
    <div v-else-if="viewMode === 'table'" class="bg-white dark:bg-dark-surface border border-slate-200/80 dark:border-dark-outline/60 rounded-2xl shadow-sm overflow-hidden">
      <div class="overflow-x-auto">
        <table class="w-full text-left border-collapse text-xs sm:text-sm">
          <thead>
            <tr class="border-b border-slate-100 dark:border-dark-outline bg-slate-50/75 dark:bg-dark-muted/40 font-mono text-[11px] text-slate-500 dark:text-white/75 uppercase tracking-wider">
              <th class="py-3 px-4">Student Identification</th>
              <th class="py-3 px-4">Program & Level</th>
              <th class="py-3 px-4">Enrollment Status</th>
              <th class="py-3 px-4">Registered Modules</th>
              <th class="py-3 px-4">Credits</th>
              <th class="py-3 px-4 text-right">Administrative Actions</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-slate-100 dark:divide-slate-800">
            <tr
              v-for="student in filteredStudents"
              :key="student.id"
              class="hover:bg-slate-50/70 dark:hover:bg-dark-muted/30 transition-colors group"
            >
              <!-- Name & ID -->
              <td class="py-3.5 px-4">
                <div class="flex items-center gap-3">
                  <div class="w-9 h-9 rounded-xl bg-gradient-to-br from-primary/15 to-secondary/20 text-primary dark:text-secondary border border-secondary/30 flex items-center justify-center font-bold text-xs font-display shrink-0">
                    {{ getInitials(student.name) }}
                  </div>
                  <div class="min-w-0">
                    <div class="font-bold text-slate-900 dark:text-white truncate flex items-center gap-1.5">
                      <span>{{ student.name }}</span>
                    </div>
                    <div class="text-[11px] font-mono text-slate-400 flex items-center gap-2 truncate">
                      <span class="text-secondary font-semibold">{{ student.displayId }}</span>
                      <span>·</span>
                      <span class="truncate">{{ student.email }}</span>
                    </div>
                  </div>
                </div>
              </td>

              <!-- Program & Level -->
              <td class="py-3.5 px-4">
                <div class="space-y-0.5">
                  <div class="font-medium text-slate-800 dark:text-white text-xs truncate max-w-[200px]" :title="student.program">
                    {{ student.program || 'General Studies' }}
                  </div>
                  <span class="inline-block px-2 py-0.5 rounded-md text-[10px] font-mono font-bold bg-slate-100 dark:bg-dark-muted text-slate-600 dark:text-slate-300 border border-slate-200/60 dark:border-dark-outline/40">
                    Lvl {{ student.level || '100' }}
                  </span>
                </div>
              </td>

              <!-- Enrollment Status Badge -->
              <td class="py-3.5 px-4">
                <div v-if="student.enrolledCourses.length > 0">
                  <span class="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-mono font-bold bg-emerald-50 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-700">
                    <CheckCircle2 class="w-3 h-3 text-emerald-500" />
                    {{ student.enrolledCourses.length }} Module{{ student.enrolledCourses.length === 1 ? '' : 's' }}
                  </span>
                </div>
                <div v-else>
                  <button
                    @click="openCourseRegModal(student)"
                    class="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-mono font-bold bg-rose-50 dark:bg-rose-950/50 text-rose-700 dark:text-rose-300 border border-rose-300 dark:border-rose-700 hover:bg-rose-100 transition-colors cursor-pointer active:scale-95 shadow-xs"
                    title="Click to register courses for this student"
                  >
                    <AlertTriangle class="w-3 h-3 text-rose-500" />
                    <span>Needs Registration ➜</span>
                  </button>
                </div>
              </td>

              <!-- Registered Modules Chips -->
              <td class="py-3.5 px-4">
                <div v-if="student.enrolledCourses.length > 0" class="flex flex-wrap gap-1 max-w-xs">
                  <span
                    v-for="c in student.enrolledCourses.slice(0, 3)"
                    :key="c.id || c.code"
                    class="px-2 py-0.5 rounded-md text-[10px] font-mono font-bold bg-secondary/15 text-secondary dark:text-dark-secondary border border-secondary/30"
                    :title="c.name"
                  >
                    {{ c.code }}
                  </span>
                  <span
                    v-if="student.enrolledCourses.length > 3"
                    class="px-1.5 py-0.5 rounded-md text-[10px] font-mono text-slate-400 bg-slate-100 dark:bg-dark-muted"
                  >
                    +{{ student.enrolledCourses.length - 3 }} more
                  </span>
                </div>
                <span v-else class="text-[11px] font-mono text-rose-500 italic">No courses registered</span>
              </td>

              <!-- Credits -->
              <td class="py-3.5 px-4 font-mono text-xs font-semibold text-slate-700 dark:text-white/90">
                <span>{{ student.totalCredits || 0 }} cr</span>
              </td>

              <!-- Actions -->
              <td class="py-3.5 px-4 text-right">
                <div class="inline-flex items-center gap-1.5">
                  <button
                    @click="openCourseRegModal(student)"
                    :id="'btn-reg-' + student.id"
                    class="px-2.5 py-1.5 rounded-xl bg-secondary/15 hover:bg-secondary/25 text-secondary border border-secondary/40 text-xs font-semibold transition-all inline-flex items-center gap-1.5 cursor-pointer active:scale-95 shadow-xs"
                    title="Register or drop courses for this student"
                  >
                    <BookPlus class="w-3.5 h-3.5" />
                    <span>Manage Courses</span>
                  </button>

                  <button
                    @click="openEditStudentModal(student)"
                    :id="'btn-edit-student-' + student.id"
                    class="p-1.5 text-slate-500 hover:text-primary dark:hover:text-secondary hover:bg-slate-100 dark:hover:bg-dark-muted rounded-lg transition-colors cursor-pointer"
                    title="Edit Student Profile"
                  >
                    <Edit3 class="w-3.5 h-3.5" />
                  </button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- Footer bar -->
      <div class="px-4 py-3 bg-slate-50/50 dark:bg-dark-muted/20 border-t border-slate-100 dark:border-dark-outline/40 flex items-center justify-between text-xs text-slate-400 font-mono">
        <span>Showing {{ filteredStudents.length }} of {{ students.length }} registered students</span>
        <span>Southshore Administrative OS</span>
      </div>
    </div>

    <!-- Grid / Cards View -->
    <div v-else class="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
      <div
        v-for="student in filteredStudents"
        :key="student.id"
        class="bg-white dark:bg-dark-surface border border-slate-200/80 dark:border-dark-outline/60 rounded-2xl p-5 shadow-xs hover:shadow-md transition-all flex flex-col justify-between relative group"
      >
        <div class="space-y-3.5">
          <!-- Card Header -->
          <div class="flex items-start justify-between gap-3">
            <div class="flex items-center gap-3 min-w-0">
              <div class="w-11 h-11 rounded-xl bg-gradient-to-br from-primary/15 to-secondary/20 text-primary dark:text-secondary border border-secondary/30 flex items-center justify-center font-bold text-sm font-display shrink-0">
                {{ getInitials(student.name) }}
              </div>
              <div class="min-w-0">
                <h3 class="font-bold text-sm text-slate-900 dark:text-white truncate">
                  {{ student.name }}
                </h3>
                <p class="text-[11px] font-mono text-secondary font-semibold">
                  {{ student.displayId }}
                </p>
                <p class="text-[11px] text-slate-400 truncate">
                  {{ student.email }}
                </p>
              </div>
            </div>

            <!-- Edit Button -->
            <button
              @click="openEditStudentModal(student)"
              class="p-1.5 text-slate-400 hover:text-slate-700 dark:hover:text-white rounded-lg hover:bg-slate-100 dark:hover:bg-dark-muted transition-colors cursor-pointer shrink-0"
              title="Edit Student Profile"
            >
              <Edit3 class="w-3.5 h-3.5" />
            </button>
          </div>

          <!-- Academic Badge & Level -->
          <div class="flex items-center justify-between p-2.5 rounded-xl bg-slate-50 dark:bg-dark-muted/40 border border-slate-200/70 dark:border-dark-outline/50 text-xs">
            <span class="font-medium text-slate-700 dark:text-white/80 truncate max-w-[170px]" :title="student.program">
              {{ student.program || 'General Program' }}
            </span>
            <span class="px-2 py-0.5 rounded-md font-mono text-[10px] font-bold bg-slate-200/80 dark:bg-dark-muted text-slate-700 dark:text-slate-200">
              Level {{ student.level || '100' }}
            </span>
          </div>

          <!-- Enrolled Courses Preview -->
          <div class="space-y-1.5">
            <div class="flex items-center justify-between text-[11px] font-mono">
              <span class="text-slate-400 uppercase font-semibold">Registered Modules</span>
              <span class="font-bold text-slate-700 dark:text-slate-300">{{ student.totalCredits || 0 }} Credits</span>
            </div>

            <div v-if="student.enrolledCourses.length > 0" class="flex flex-wrap gap-1">
              <span
                v-for="c in student.enrolledCourses.slice(0, 4)"
                :key="c.id || c.code"
                class="px-2 py-0.5 rounded-md text-[10px] font-mono font-bold bg-secondary/15 text-secondary dark:text-dark-secondary border border-secondary/30"
              >
                {{ c.code }}
              </span>
              <span
                v-if="student.enrolledCourses.length > 4"
                class="px-1.5 py-0.5 rounded-md text-[10px] font-mono text-slate-400 bg-slate-100 dark:bg-dark-muted"
              >
                +{{ student.enrolledCourses.length - 4 }}
              </span>
            </div>
            <div v-else class="p-2 rounded-lg bg-rose-50/70 dark:bg-rose-950/40 border border-rose-200/70 dark:border-rose-800/40 text-rose-700 dark:text-rose-300 text-[11px] flex items-center gap-1.5">
              <AlertTriangle class="w-3.5 h-3.5 shrink-0" />
              <span>Not registered for any modules</span>
            </div>
          </div>
        </div>

        <!-- Card Footer Action -->
        <div class="mt-4 pt-3 border-t border-slate-100 dark:border-dark-outline/40 flex items-center justify-between">
          <span class="text-[10px] font-mono text-slate-400">
            {{ student.enrolledCourses.length }} course(s)
          </span>
          <button
            @click="openCourseRegModal(student)"
            class="px-3 py-1.5 rounded-xl bg-primary hover:bg-primary/90 text-white text-xs font-semibold tracking-wide transition-all inline-flex items-center gap-1.5 shadow-xs cursor-pointer active:scale-95"
          >
            <BookPlus class="w-3.5 h-3.5 text-secondary" />
            <span>Manage Courses</span>
          </button>
        </div>
      </div>
    </div>

    <!-- ========================================== -->
    <!-- 1. COURSE REGISTRATION & ENROLLMENT MODAL -->
    <!-- ========================================== -->
    <div
      v-if="isRegModalOpen"
      class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs overflow-y-auto"
      @click.self="closeCourseRegModal"
    >
      <div class="relative w-full max-w-4xl bg-white dark:bg-dark-surface border border-slate-200 dark:border-dark-outline rounded-3xl shadow-2xl overflow-hidden max-h-[92vh] flex flex-col">
        <!-- Blueprint corners -->
        <div class="absolute top-2 left-2 w-3 h-3 border-t-2 border-l-2 border-secondary/40 pointer-events-none"></div>
        <div class="absolute top-2 right-2 w-3 h-3 border-t-2 border-r-2 border-secondary/40 pointer-events-none"></div>

        <!-- Modal Header -->
        <div class="p-6 border-b border-slate-100 dark:border-dark-outline flex items-start justify-between gap-4 bg-slate-50/50 dark:bg-dark-muted/30">
          <div class="flex items-start gap-3.5">
            <div class="w-11 h-11 rounded-2xl bg-secondary/15 text-secondary border border-secondary/30 flex items-center justify-center shrink-0">
              <BookOpen class="w-6 h-6" />
            </div>
            <div>
              <div class="flex items-center gap-2">
                <span class="text-[10px] font-mono uppercase tracking-wider text-secondary font-bold">
                  ADMINISTRATIVE COURSE REGISTRATION ASSISTANT
                </span>
                <span class="text-[10px] font-mono px-2 py-0.2 rounded-full bg-slate-200 dark:bg-dark-muted font-bold">
                  {{ selectedStudent?.displayId }}
                </span>
              </div>
              <h2 class="text-xl font-display font-bold text-slate-900 dark:text-white mt-0.5">
                {{ selectedStudent?.name }}
              </h2>
              <p class="text-xs text-slate-500 dark:text-white/70">
                Program: <span class="font-semibold text-slate-700 dark:text-slate-200">{{ selectedStudent?.program || 'General' }}</span> · 
                Level: <span class="font-semibold text-slate-700 dark:text-slate-200">{{ selectedStudent?.level || '100' }}</span> · 
                Current Load: <span class="font-bold text-secondary font-mono">{{ activeStudentEnrolledCredits }} Credits ({{ activeStudentEnrollments.length }} modules)</span>
              </p>
            </div>
          </div>
          <button @click="closeCourseRegModal" class="p-2 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 rounded-xl hover:bg-slate-100 dark:hover:bg-dark-muted transition-colors cursor-pointer">
            <X class="w-5 h-5" />
          </button>
        </div>

        <!-- Modal Body Content -->
        <div class="p-6 overflow-y-auto space-y-6 flex-1 text-xs sm:text-sm">
          <!-- Live Status & Feedback -->
          <div v-if="regModalAlert" :class="['p-3 rounded-xl border flex items-center justify-between gap-2',
            regModalAlertType === 'success'
              ? 'bg-emerald-50 dark:bg-emerald-950/70 border-emerald-300 text-emerald-800 dark:text-emerald-300'
              : 'bg-rose-50 dark:bg-rose-950/70 border-rose-300 text-rose-800 dark:text-rose-300'
          ]">
            <div class="flex items-center gap-2">
              <CheckCircle2 v-if="regModalAlertType === 'success'" class="w-4 h-4 text-emerald-600" />
              <AlertCircle v-else class="w-4 h-4 text-rose-600" />
              <span>{{ regModalAlert }}</span>
            </div>
            <button @click="regModalAlert = ''" class="cursor-pointer font-bold">&times;</button>
          </div>

          <!-- Section 1: Currently Enrolled Modules -->
          <div>
            <div class="flex items-center justify-between mb-2.5">
              <h3 class="text-xs font-mono font-bold uppercase tracking-wider text-slate-700 dark:text-white flex items-center gap-1.5">
                <CheckCircle2 class="w-4 h-4 text-emerald-500" />
                Active Enrolled Courses ({{ activeStudentEnrollments.length }})
              </h3>
              <span class="text-xs font-mono text-slate-400">
                Click "Drop Module" to remove registration
              </span>
            </div>

            <div v-if="activeStudentEnrollments.length === 0" class="p-6 text-center rounded-2xl bg-slate-50 dark:bg-dark-muted/40 border border-slate-200/80 dark:border-dark-outline/50">
              <p class="text-xs font-mono text-slate-400 italic">This student is not currently enrolled in any course modules.</p>
              <p class="text-[11px] text-slate-500 mt-1">Select and add courses from the catalog below to help them register.</p>
            </div>

            <div v-else class="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div
                v-for="course in activeStudentEnrollments"
                :key="course.id"
                class="p-3.5 rounded-xl border border-emerald-200 dark:border-emerald-800/60 bg-emerald-50/50 dark:bg-emerald-950/30 flex items-center justify-between gap-3"
              >
                <div class="min-w-0">
                  <div class="flex items-center gap-2">
                    <span class="text-xs font-mono font-bold text-emerald-700 dark:text-emerald-300">{{ course.code }}</span>
                    <span class="text-[10px] font-mono px-1.5 py-0.2 rounded bg-emerald-100 dark:bg-emerald-900/60 text-emerald-800 dark:text-emerald-200 font-bold">
                      {{ course.credits || 3 }} Credits
                    </span>
                  </div>
                  <div class="text-xs font-semibold text-slate-800 dark:text-white truncate mt-0.5">
                    {{ course.name }}
                  </div>
                  <div class="text-[10px] font-mono text-slate-400">
                    {{ course.semester || 'Semester 1' }} · Lvl {{ course.level || '100' }}
                  </div>
                </div>

                <button
                  @click="dropCourseForStudent(course)"
                  :disabled="isEnrollingDropping"
                  class="px-2.5 py-1.5 rounded-lg bg-rose-50 hover:bg-rose-100 dark:bg-rose-950/60 dark:hover:bg-rose-900/60 text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-800 text-[11px] font-semibold transition-all cursor-pointer active:scale-95 shrink-0"
                  title="Unenroll student from this course"
                >
                  <Trash2 class="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>

          <!-- Section 2: Available Catalog to Register -->
          <div class="pt-4 border-t border-slate-100 dark:border-dark-outline/40">
            <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-3">
              <div class="flex items-center gap-2">
                <BookPlus class="w-4 h-4 text-secondary" />
                <h3 class="text-xs font-mono font-bold uppercase tracking-wider text-slate-700 dark:text-white">
                  Available Catalog for Registration ({{ availableCoursesForStudent.length }})
                </h3>
              </div>

              <!-- Mini Filter for catalog -->
              <div class="flex items-center gap-2">
                <input
                  v-model="catalogSearch"
                  type="text"
                  placeholder="Filter available..."
                  class="px-2.5 py-1 text-xs bg-slate-50 dark:bg-dark-muted/80 border border-slate-200 dark:border-dark-outline/60 rounded-lg text-slate-800 dark:text-white font-mono w-36 focus:outline-none focus:ring-1 focus:ring-secondary"
                />

                <select
                  v-model="catalogSemesterFilter"
                  class="px-2.5 py-1 text-xs bg-slate-50 dark:bg-dark-muted/80 border border-slate-200 dark:border-dark-outline/60 rounded-lg text-slate-700 dark:text-white font-mono focus:outline-none"
                >
                  <option value="all">All Semesters</option>
                  <option value="Semester 1">Semester 1</option>
                  <option value="Semester 2">Semester 2</option>
                </select>
              </div>
            </div>

            <div v-if="availableCoursesForStudent.length === 0" class="p-8 text-center rounded-2xl bg-slate-50 dark:bg-dark-muted/30 border border-slate-200/80 dark:border-dark-outline/50">
              <BookOpen class="w-6 h-6 mx-auto mb-1.5 text-slate-400" />
              <p class="text-xs font-mono text-slate-500">No additional modules available matching criteria.</p>
              <p class="text-[11px] text-slate-400 mt-0.5">The student may already be enrolled in all relevant curriculum modules.</p>
            </div>

            <div v-else class="space-y-2 max-h-72 overflow-y-auto pr-1">
              <div
                v-for="course in availableCoursesForStudent"
                :key="course.id"
                class="p-3 rounded-xl border border-slate-200 dark:border-dark-outline/70 bg-white dark:bg-dark-surface hover:border-secondary/60 hover:bg-slate-50/70 dark:hover:bg-dark-muted/40 transition-all flex items-center justify-between gap-3"
              >
                <div class="min-w-0">
                  <div class="flex items-center gap-2">
                    <span class="text-xs font-mono font-bold text-secondary">{{ course.code }}</span>
                    <span class="text-[10px] font-mono px-1.5 py-0.2 rounded bg-slate-100 dark:bg-dark-muted text-slate-600 dark:text-slate-300">
                      {{ course.credits || 3 }} Credits
                    </span>
                    <span class="text-[10px] font-mono px-1.5 py-0.2 rounded bg-indigo-50 dark:bg-indigo-950/40 text-indigo-700 dark:text-indigo-300">
                      Lvl {{ course.level || '100' }}
                    </span>
                    <span class="text-[10px] font-mono text-slate-400">
                      {{ course.semester || 'Semester 1' }}
                    </span>
                  </div>
                  <div class="text-xs font-semibold text-slate-800 dark:text-white truncate mt-0.5">
                    {{ course.name }}
                  </div>
                  <div class="text-[10px] text-slate-400 truncate">
                    Program: {{ course.program || 'General' }} · Lecturer: {{ course.lecturer || 'Faculty Staff' }}
                  </div>
                </div>

                <button
                  @click="enrollCourseForStudent(course)"
                  :disabled="isEnrollingDropping"
                  class="px-3 py-1.5 rounded-xl bg-primary hover:bg-primary/90 text-white text-xs font-semibold tracking-wide transition-all inline-flex items-center gap-1.5 cursor-pointer active:scale-95 shadow-xs disabled:opacity-50 shrink-0"
                >
                  <Plus class="w-3.5 h-3.5 text-secondary" />
                  <span>Enroll</span>
                </button>
              </div>
            </div>
          </div>
        </div>

        <!-- Modal Footer -->
        <div class="p-4 px-6 border-t border-slate-100 dark:border-dark-outline flex items-center justify-between bg-slate-50/50 dark:bg-dark-muted/30">
          <span class="text-xs font-mono text-slate-400">
            Total active modules: {{ activeStudentEnrollments.length }} ({{ activeStudentEnrolledCredits }} Credits)
          </span>
          <button
            @click="closeCourseRegModal"
            class="px-5 py-2 rounded-xl bg-slate-200 dark:bg-dark-muted hover:bg-slate-300 dark:hover:bg-dark-muted/80 text-xs font-semibold text-slate-700 dark:text-white transition-colors cursor-pointer"
          >
            Close & Done
          </button>
        </div>
      </div>
    </div>

    <!-- ========================================== -->
    <!-- 2. ADD / EDIT STUDENT PROFILE MODAL        -->
    <!-- ========================================== -->
    <div
      v-if="isStudentModalOpen"
      class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs overflow-y-auto"
      @click.self="closeStudentModal"
    >
      <div class="relative w-full max-w-xl bg-white dark:bg-dark-surface border border-slate-200 dark:border-dark-outline rounded-3xl shadow-2xl overflow-hidden max-h-[92vh] flex flex-col">
        <div class="absolute top-2 left-2 w-3 h-3 border-t-2 border-l-2 border-secondary/40 pointer-events-none"></div>
        <div class="absolute top-2 right-2 w-3 h-3 border-t-2 border-r-2 border-secondary/40 pointer-events-none"></div>

        <!-- Header -->
        <div class="p-6 border-b border-slate-100 dark:border-dark-outline flex items-start justify-between gap-4">
          <div class="flex items-start gap-3">
            <div :class="['w-10 h-10 rounded-xl flex items-center justify-center',
              isEditingStudent ? 'bg-amber-100 dark:bg-amber-950/40 text-amber-600' : 'bg-primary/10 text-primary dark:bg-secondary/15 dark:text-secondary'
            ]">
              <Edit3 v-if="isEditingStudent" class="w-5 h-5" />
              <UserPlus v-else class="w-5 h-5" />
            </div>
            <div>
              <span class="text-[10px] font-mono uppercase tracking-wider text-secondary font-bold">
                {{ isEditingStudent ? 'STUDENT PROFILE MODIFICATION' : 'STUDENT ADMISSIONS & ONBOARDING' }}
              </span>
              <h2 class="text-xl font-display font-bold text-slate-900 dark:text-white">
                {{ isEditingStudent ? 'Edit Student Profile' : 'Register New Student' }}
              </h2>
              <p class="text-xs text-slate-500 dark:text-white/70 mt-0.5">
                Configure student identity, index number, academic department program, and study level.
              </p>
            </div>
          </div>
          <button @click="closeStudentModal" class="p-2 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 rounded-xl hover:bg-slate-100 dark:hover:bg-dark-muted transition-colors cursor-pointer">
            <X class="w-5 h-5" />
          </button>
        </div>

        <!-- Form Body -->
        <form @submit.prevent="saveStudent" class="p-6 overflow-y-auto space-y-4 text-xs sm:text-sm flex-1">
          <!-- Full Name -->
          <div class="space-y-1.5">
            <label for="student-name-input" class="text-[11px] font-mono uppercase tracking-wider text-slate-500 dark:text-white/75 font-semibold">
              Full Legal Name <span class="text-rose-500">*</span>
            </label>
            <input
              type="text"
              id="student-name-input"
              v-model="studentForm.name"
              placeholder="e.g. Ama Serwaa Mensah or Emmanuel K. Addo"
              required
              class="w-full bg-slate-50 dark:bg-dark-muted/80 border border-slate-200 dark:border-dark-outline/70 rounded-xl px-3 py-2.5 text-xs sm:text-sm text-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-secondary/50"
            />
          </div>

          <!-- Email & Student ID -->
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div class="space-y-1.5">
              <label for="student-email-input" class="text-[11px] font-mono uppercase tracking-wider text-slate-500 dark:text-white/75 font-semibold">
                Student Email <span class="text-rose-500">*</span>
              </label>
              <input
                type="email"
                id="student-email-input"
                v-model="studentForm.email"
                placeholder="student@southshore.edu.gh"
                required
                class="w-full bg-slate-50 dark:bg-dark-muted/80 border border-slate-200 dark:border-dark-outline/70 rounded-xl px-3 py-2.5 text-xs sm:text-sm text-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-secondary/50"
              />
            </div>

            <div class="space-y-1.5">
              <label for="student-idnum-input" class="text-[11px] font-mono uppercase tracking-wider text-slate-500 dark:text-white/75 font-semibold">
                Student Index / ID
                <span v-if="!isEditingStudent" class="normal-case text-slate-400 font-normal"> (auto if blank)</span>
              </label>
              <input
                type="text"
                id="student-idnum-input"
                v-model="studentForm.displayId"
                placeholder="e.g. STU/2026/045"
                :disabled="isEditingStudent"
                class="w-full bg-slate-50 dark:bg-dark-muted/80 border border-slate-200 dark:border-dark-outline/70 rounded-xl px-3 py-2.5 text-xs sm:text-sm text-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-secondary/50 disabled:opacity-50"
              />
            </div>
          </div>

          <!-- Program & Level -->
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div class="space-y-1.5">
              <label for="student-prog-input" class="text-[11px] font-mono uppercase tracking-wider text-slate-500 dark:text-white/75 font-semibold">
                Program of Study <span class="text-rose-500">*</span>
              </label>
              <select
                id="student-prog-input"
                v-model="studentForm.program"
                required
                class="w-full bg-slate-50 dark:bg-dark-muted/80 border border-slate-200 dark:border-dark-outline/70 rounded-xl px-3 py-2.5 text-xs sm:text-sm text-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-secondary/50"
              >
                <option value="" disabled>Select Programme</option>
                <option v-for="p in availablePrograms" :key="p" :value="p">{{ p }}</option>
                <option value="Computer Science">Computer Science</option>
                <option value="Information Technology">Information Technology</option>
                <option value="Business Administration">Business Administration</option>
                <option value="Accounting & Finance">Accounting & Finance</option>
              </select>
            </div>

            <div class="space-y-1.5">
              <label for="student-level-input" class="text-[11px] font-mono uppercase tracking-wider text-slate-500 dark:text-white/75 font-semibold">
                Academic Level <span class="text-rose-500">*</span>
              </label>
              <select
                id="student-level-input"
                v-model="studentForm.level"
                required
                class="w-full bg-slate-50 dark:bg-dark-muted/80 border border-slate-200 dark:border-dark-outline/70 rounded-xl px-3 py-2.5 text-xs sm:text-sm text-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-secondary/50 font-mono"
              >
                <option value="100">Level 100</option>
                <option value="200">Level 200</option>
                <option value="300">Level 300</option>
                <option value="400">Level 400</option>
              </select>
            </div>
          </div>

          <!-- Password (Required for new, optional for edit) -->
          <div class="space-y-1.5">
            <label for="student-pass-input" class="text-[11px] font-mono uppercase tracking-wider text-slate-500 dark:text-white/75 font-semibold">
              {{ isEditingStudent ? 'Change Password' : 'Initial Password' }}
              <span v-if="!isEditingStudent" class="text-rose-500">*</span>
              <span v-else class="normal-case text-slate-400 font-normal"> (leave blank to keep current)</span>
            </label>
            <div class="relative">
              <input
                :type="showStudentPassword ? 'text' : 'password'"
                id="student-pass-input"
                v-model="studentForm.password"
                :placeholder="isEditingStudent ? 'Enter new password if changing...' : 'Minimum 6 characters'"
                :required="!isEditingStudent"
                class="w-full bg-slate-50 dark:bg-dark-muted/80 border border-slate-200 dark:border-dark-outline/70 rounded-xl px-3 py-2.5 pr-10 text-xs sm:text-sm text-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-secondary/50"
              />
              <button
                type="button"
                @click="showStudentPassword = !showStudentPassword"
                class="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
              >
                <Eye v-if="!showStudentPassword" class="w-4 h-4" />
                <EyeOff v-else class="w-4 h-4" />
              </button>
            </div>
          </div>

          <div v-if="studentModalError" class="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2">
            <AlertCircle class="w-4 h-4 shrink-0" />
            <span>{{ studentModalError }}</span>
          </div>

          <!-- Modal Action Buttons -->
          <div class="flex items-center justify-end gap-3 pt-3 border-t border-slate-100 dark:border-dark-outline">
            <button
              type="button"
              @click="closeStudentModal"
              class="px-4 py-2.5 rounded-xl border border-slate-200 dark:border-dark-outline/70 text-xs sm:text-sm font-semibold hover:bg-slate-50 dark:hover:bg-dark-muted transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              :disabled="isSavingStudent"
              id="btn-save-student"
              class="px-5 py-2.5 rounded-xl bg-primary hover:bg-primary/90 text-white text-xs sm:text-sm font-semibold transition-all shadow-md inline-flex items-center gap-2 cursor-pointer active:scale-95 disabled:opacity-50"
            >
              <Loader2 v-if="isSavingStudent" class="w-4 h-4 animate-spin" />
              <span>{{ isSavingStudent ? 'Saving...' : (isEditingStudent ? 'Save Profile' : 'Register Student') }}</span>
            </button>
          </div>
        </form>
      </div>
    </div>

    <!-- ========================================== -->
    <!-- 3. BATCH ENROLL COHORT MODAL               -->
    <!-- ========================================== -->
    <div
      v-if="isBatchModalOpen"
      class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs overflow-y-auto"
      @click.self="isBatchModalOpen = false"
    >
      <div class="relative w-full max-w-2xl bg-white dark:bg-dark-surface border border-slate-200 dark:border-dark-outline rounded-3xl shadow-2xl overflow-hidden max-h-[92vh] flex flex-col">
        <div class="absolute top-2 left-2 w-3 h-3 border-t-2 border-l-2 border-secondary/40 pointer-events-none"></div>
        <div class="absolute top-2 right-2 w-3 h-3 border-t-2 border-r-2 border-secondary/40 pointer-events-none"></div>

        <!-- Header -->
        <div class="p-6 border-b border-slate-100 dark:border-dark-outline flex items-start justify-between gap-4">
          <div class="flex items-start gap-3">
            <div class="w-10 h-10 rounded-xl bg-secondary/15 text-secondary flex items-center justify-center shrink-0">
              <Layers class="w-5 h-5" />
            </div>
            <div>
              <span class="text-[10px] font-mono uppercase tracking-wider text-secondary font-bold">
                BATCH COURSE ENROLLMENT ASSISTANT
              </span>
              <h2 class="text-xl font-display font-bold text-slate-900 dark:text-white">
                Batch Enroll Cohort
              </h2>
              <p class="text-xs text-slate-500 dark:text-white/70 mt-0.5">
                Automatically register an entire cohort, class level, or program into a designated course module in 1-click.
              </p>
            </div>
          </div>
          <button @click="isBatchModalOpen = false" class="p-2 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 rounded-xl hover:bg-slate-100 dark:hover:bg-dark-muted transition-colors cursor-pointer">
            <X class="w-5 h-5" />
          </button>
        </div>

        <div class="p-6 overflow-y-auto space-y-4 text-xs sm:text-sm flex-1">
          <!-- Select Target Course -->
          <div class="space-y-1.5">
            <label class="text-[11px] font-mono uppercase tracking-wider text-slate-500 dark:text-white/75 font-semibold">
              Select Target Course Module <span class="text-rose-500">*</span>
            </label>
            <select
              v-model="batchForm.courseId"
              class="w-full bg-slate-50 dark:bg-dark-muted/80 border border-slate-200 dark:border-dark-outline/70 rounded-xl px-3 py-2.5 text-xs sm:text-sm text-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-secondary/50 font-mono"
            >
              <option value="" disabled>-- Choose Course --</option>
              <option v-for="c in allCoursesList" :key="c.id" :value="c.id">
                {{ c.code }} — {{ c.name }} (Lvl {{ c.level || '100' }} · {{ c.credits || 3 }}cr)
              </option>
            </select>
          </div>

          <!-- Filter Cohort -->
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div class="space-y-1.5">
              <label class="text-[11px] font-mono uppercase tracking-wider text-slate-500 dark:text-white/75 font-semibold">
                Filter Target Program
              </label>
              <select
                v-model="batchForm.program"
                class="w-full bg-slate-50 dark:bg-dark-muted/80 border border-slate-200 dark:border-dark-outline/70 rounded-xl px-3 py-2.5 text-xs sm:text-sm text-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-secondary/50"
              >
                <option value="all">All Programs</option>
                <option v-for="p in availablePrograms" :key="p" :value="p">{{ p }}</option>
              </select>
            </div>

            <div class="space-y-1.5">
              <label class="text-[11px] font-mono uppercase tracking-wider text-slate-500 dark:text-white/75 font-semibold">
                Filter Academic Level
              </label>
              <select
                v-model="batchForm.level"
                class="w-full bg-slate-50 dark:bg-dark-muted/80 border border-slate-200 dark:border-dark-outline/70 rounded-xl px-3 py-2.5 text-xs sm:text-sm text-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-secondary/50 font-mono"
              >
                <option value="all">All Levels</option>
                <option value="100">Level 100</option>
                <option value="200">Level 200</option>
                <option value="300">Level 300</option>
                <option value="400">Level 400</option>
              </select>
            </div>
          </div>

          <!-- Matching Students Preview -->
          <div class="p-4 rounded-2xl bg-slate-50 dark:bg-dark-muted/40 border border-slate-200 dark:border-dark-outline/70 space-y-2">
            <div class="flex items-center justify-between text-xs font-mono">
              <span class="text-slate-500 font-semibold">Eligible Candidates Not Yet Registered:</span>
              <span class="font-bold text-secondary text-sm">{{ batchEligibleStudents.length }} student(s)</span>
            </div>

            <div v-if="batchEligibleStudents.length > 0" class="max-h-40 overflow-y-auto space-y-1.5 pr-1 pt-1">
              <div
                v-for="s in batchEligibleStudents.slice(0, 15)"
                :key="s.id"
                class="text-[11px] flex items-center justify-between p-2 rounded-lg bg-white dark:bg-dark-surface border border-slate-200/60 dark:border-dark-outline/40"
              >
                <span class="font-medium text-slate-800 dark:text-white truncate">{{ s.name }}</span>
                <span class="font-mono text-slate-400">{{ s.displayId }} · Lvl {{ s.level || '100' }}</span>
              </div>
              <div v-if="batchEligibleStudents.length > 15" class="text-[10px] text-center text-slate-400 font-mono">
                +{{ batchEligibleStudents.length - 15 }} more candidates will be enrolled
              </div>
            </div>
            <div v-else class="text-xs text-slate-400 italic text-center py-3">
              No matching unenrolled students for the selected course and criteria.
            </div>
          </div>
        </div>

        <!-- Footer -->
        <div class="p-4 px-6 border-t border-slate-100 dark:border-dark-outline flex items-center justify-end gap-3 bg-slate-50/50 dark:bg-dark-muted/30">
          <button
            type="button"
            @click="isBatchModalOpen = false"
            class="px-4 py-2.5 rounded-xl border border-slate-200 dark:border-dark-outline/70 text-xs font-semibold hover:bg-slate-50 dark:hover:bg-dark-muted transition-colors cursor-pointer"
          >
            Cancel
          </button>
          <button
            type="button"
            @click="executeBatchEnrollment"
            :disabled="isBatchEnrolling || batchEligibleStudents.length === 0 || !batchForm.courseId"
            class="px-5 py-2.5 rounded-xl bg-primary hover:bg-primary/90 text-white text-xs font-semibold transition-all shadow-md inline-flex items-center gap-2 cursor-pointer active:scale-95 disabled:opacity-50"
          >
            <Loader2 v-if="isBatchEnrolling" class="w-4 h-4 animate-spin" />
            <Layers v-else class="w-4 h-4 text-secondary" />
            <span>Enroll {{ batchEligibleStudents.length }} Students</span>
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { supabase } from '@/stores/supabase';
import api from '@/api.js';
import { useCoursesStore } from '@/stores/courses.js';
import { useEnrollmentsStore } from '@/stores/enrollments.js';
import { useSchedulesStore } from '@/stores/schedules.js';
import {
  GraduationCap,
  BookOpen,
  BookPlus,
  Layers,
  Search,
  X,
  RotateCcw,
  RefreshCw,
  UserPlus,
  Edit3,
  Trash2,
  Loader2,
  CheckCircle2,
  AlertCircle,
  AlertTriangle,
  List,
  LayoutGrid,
  UserX,
  Eye,
  EyeOff,
  Plus
} from 'lucide-vue-next';

const coursesStore = useCoursesStore();
const enrollmentsStore = useEnrollmentsStore();
const schedulesStore = useSchedulesStore();

// State
const students = ref([]);
const isLoading = ref(false);
const searchQuery = ref('');
const statusFilter = ref('all'); // 'all', 'enrolled', 'unenrolled'
const levelFilter = ref('all');   // 'all', '100', '200', '300', '400'
const programFilter = ref('all'); // 'all' or program string
const viewMode = ref('table');     // 'table' or 'cards'

// Toast
const alertMessage = ref('');
const alertType = ref('success');
const showAlert = (msg, type = 'success') => {
  alertMessage.value = msg;
  alertType.value = type;
  setTimeout(() => { if (alertMessage.value === msg) alertMessage.value = ''; }, 4500);
};

// ==========================================
// COURSE REGISTRATION MODAL STATE
// ==========================================
const isRegModalOpen = ref(false);
const selectedStudent = ref(null);
const isEnrollingDropping = ref(false);
const regModalAlert = ref('');
const regModalAlertType = ref('success');
const catalogSearch = ref('');
const catalogSemesterFilter = ref('all');

const showRegAlert = (msg, type = 'success') => {
  regModalAlert.value = msg;
  regModalAlertType.value = type;
  setTimeout(() => { if (regModalAlert.value === msg) regModalAlert.value = ''; }, 3500);
};

// ==========================================
// ADD / EDIT STUDENT MODAL STATE
// ==========================================
const isStudentModalOpen = ref(false);
const isEditingStudent = ref(false);
const isSavingStudent = ref(false);
const studentModalError = ref('');
const showStudentPassword = ref(false);

const studentForm = ref({
  id: '',
  name: '',
  email: '',
  displayId: '',
  program: '',
  level: '100',
  password: ''
});

// ==========================================
// BATCH ENROLLMENT MODAL STATE
// ==========================================
const isBatchModalOpen = ref(false);
const isBatchEnrolling = ref(false);
const batchForm = ref({
  courseId: '',
  program: 'all',
  level: 'all'
});

// Helper: Initials
const getInitials = (name) => {
  if (!name) return 'ST';
  const clean = name.replace(/^(mr\.|mrs\.|ms\.)\s*/i, '').trim();
  const parts = clean.split(/\s+/);
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
};

// All courses shortcut
const allCoursesList = computed(() => coursesStore.courses || []);

// Available distinct programs
const availablePrograms = computed(() => {
  const set = new Set();
  students.value.forEach((s) => {
    if (s.program) set.add(s.program);
  });
  allCoursesList.value.forEach((c) => {
    if (c.program) set.add(c.program);
  });
  return Array.from(set).filter(Boolean).sort();
});

// ==========================================
// MAIN DATA FETCHER
// ==========================================
const fetchStudentsData = async () => {
  isLoading.value = true;
  try {
    // 1. Fetch courses, schedules, and enrollments in parallel
    await Promise.allSettled([
      coursesStore.fetchCourses(),
      schedulesStore.fetchSchedules(),
      enrollmentsStore.fetchEnrollments()
    ]);

    // 2. Fetch students from Express backend /users
    let backendStudents = [];
    try {
      const { data } = await api.get('/users', { params: { role: 'STUDENT' } });
      if (data?.users) {
        backendStudents = data.users.filter((u) => (u.role || '').toUpperCase() === 'STUDENT');
      }
    } catch (e) {
      console.warn('Backend student fetch notice:', e.message);
    }

    // 3. Fetch students from Supabase users table
    let supaStudents = [];
    try {
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .ilike('role', 'student')
        .order('name');
      if (!error && data) supaStudents = data;
    } catch (e) {
      console.warn('Supabase student fetch notice:', e.message);
    }

    // 4. Also check custom locally registered students
    let localStudents = [];
    try {
      localStudents = JSON.parse(localStorage.getItem('custom_created_students') || '[]');
    } catch {}

    // 5. Unify and deduplicate candidates
    const unifiedMap = new Map();
    const addCandidate = (u) => {
      if (!u) return;
      const rawId = (u.id || '').toString().trim();
      const rawEmail = (u.email || '').toString().trim().toLowerCase();
      const rawIdNum = (u.id_number || u.displayId || '').toString().trim();
      const dedupeKey = (rawEmail && rawEmail !== '—') ? `email:${rawEmail}` : (rawIdNum ? `idnum:${rawIdNum}` : `id:${rawId}`);
      if (!dedupeKey || dedupeKey === 'id:') return;

      const existing = unifiedMap.get(dedupeKey) || (rawId ? unifiedMap.get(`id:${rawId}`) : null);

      const resolved = {
        id: rawId || existing?.id || `stu-${Date.now()}`,
        id_number: rawIdNum || existing?.id_number || rawId,
        name: u.name || u.full_name || existing?.name || 'Student Learner',
        email: u.email && u.email !== '—' ? u.email : (existing?.email || '—'),
        role: 'STUDENT',
        program: u.program || u.program_id || existing?.program || 'Computer Science',
        level: (u.level || existing?.level || '100').toString(),
        createdAt: u.created_at || u.createdAt || existing?.createdAt || new Date().toISOString()
      };

      unifiedMap.set(dedupeKey, resolved);
      if (rawId) unifiedMap.set(`id:${rawId}`, resolved);
      if (rawEmail && rawEmail !== '—') unifiedMap.set(`email:${rawEmail}`, resolved);
    };

    supaStudents.forEach(addCandidate);
    backendStudents.forEach(addCandidate);
    localStudents.forEach(addCandidate);

    const unifiedList = Array.from(new Set(unifiedMap.values()));
    const allCourses = coursesStore.courses || [];
    const allEnrollments = enrollmentsStore.enrollments || [];

    // 6. Enrich each student with their enrolled courses
    students.value = unifiedList.map((stu) => {
      // Find all enrollments matching this student (by student.id or student.id_number)
      const matchedEnrollments = allEnrollments.filter(
        (e) => e.studentId === stu.id || e.studentId === stu.id_number
      );

      const enrolledCourses = [];
      let totalCredits = 0;

      matchedEnrollments.forEach((e) => {
        const found = allCourses.find((c) => c.id === e.courseId || c.code === e.courseId);
        if (found) {
          enrolledCourses.push({
            ...found,
            enrollmentId: e.id
          });
          totalCredits += Number(found.credits || 3);
        } else if (e.courseId) {
          enrolledCourses.push({
            id: e.courseId,
            code: e.courseId,
            name: e.courseId,
            credits: 3,
            enrollmentId: e.id
          });
          totalCredits += 3;
        }
      });

      return {
        ...stu,
        displayId: stu.id_number || (stu.id.length > 18 ? stu.id.slice(0, 8) + '...' : stu.id),
        enrolledCourses,
        totalCredits
      };
    });
  } catch (err) {
    console.error('Failed to load students:', err);
    showAlert('Failed to load student directory.', 'error');
  } finally {
    isLoading.value = false;
  }
};

onMounted(() => {
  fetchStudentsData();
});

// Computed Stats
const stats = computed(() => {
  const total = students.value.length;
  const enrolled = students.value.filter((s) => s.enrolledCourses.length > 0).length;
  const unenrolled = total - enrolled;
  const totalEnrollments = students.value.reduce((acc, s) => acc + s.enrolledCourses.length, 0);

  return { total, enrolled, unenrolled, totalEnrollments };
});

// Filtered Students List
const filteredStudents = computed(() => {
  let list = students.value;

  if (statusFilter.value === 'enrolled') {
    list = list.filter((s) => s.enrolledCourses.length > 0);
  } else if (statusFilter.value === 'unenrolled') {
    list = list.filter((s) => s.enrolledCourses.length === 0);
  }

  if (levelFilter.value !== 'all') {
    list = list.filter((s) => (s.level || '100').toString() === levelFilter.value);
  }

  if (programFilter.value !== 'all') {
    list = list.filter((s) => (s.program || '').toLowerCase() === programFilter.value.toLowerCase());
  }

  if (searchQuery.value.trim()) {
    const q = searchQuery.value.toLowerCase().trim();
    list = list.filter((s) => {
      const matchName = (s.name || '').toLowerCase().includes(q);
      const matchEmail = (s.email || '').toLowerCase().includes(q);
      const matchId = (s.displayId || '').toLowerCase().includes(q) || (s.id || '').toLowerCase().includes(q);
      const matchProg = (s.program || '').toLowerCase().includes(q);
      const matchCourse = (s.enrolledCourses || []).some(
        (c) => (c.code || '').toLowerCase().includes(q) || (c.name || '').toLowerCase().includes(q)
      );
      return matchName || matchEmail || matchId || matchProg || matchCourse;
    });
  }

  return list;
});

const resetFilters = () => {
  searchQuery.value = '';
  statusFilter.value = 'all';
  levelFilter.value = 'all';
  programFilter.value = 'all';
};

// ==========================================
// COURSE REGISTRATION MODAL LOGIC
// ==========================================
const openCourseRegModal = (student) => {
  selectedStudent.value = student;
  regModalAlert.value = '';
  catalogSearch.value = '';
  catalogSemesterFilter.value = 'all';
  isRegModalOpen.value = true;
};

const closeCourseRegModal = () => {
  isRegModalOpen.value = false;
  selectedStudent.value = null;
  regModalAlert.value = '';
};

// Currently enrolled courses for active selected student
const activeStudentEnrollments = computed(() => {
  if (!selectedStudent.value) return [];
  // Read dynamically from selected student object or refresh
  const stu = students.value.find((s) => s.id === selectedStudent.value.id);
  return stu ? stu.enrolledCourses : selectedStudent.value.enrolledCourses;
});

const activeStudentEnrolledCredits = computed(() => {
  return activeStudentEnrollments.value.reduce((acc, c) => acc + (c.credits || 3), 0);
});

// Available courses to enroll for selected student
const availableCoursesForStudent = computed(() => {
  if (!selectedStudent.value) return [];
  const enrolledIds = new Set(activeStudentEnrollments.value.map((c) => c.id || c.code));

  let list = allCoursesList.value.filter((c) => !enrolledIds.has(c.id) && !enrolledIds.has(c.code));

  // Match student program if available
  if (catalogSemesterFilter.value !== 'all') {
    list = list.filter((c) => (c.semester || 'Semester 1') === catalogSemesterFilter.value);
  }

  if (catalogSearch.value.trim()) {
    const q = catalogSearch.value.toLowerCase().trim();
    list = list.filter(
      (c) => (c.code || '').toLowerCase().includes(q) || (c.name || '').toLowerCase().includes(q)
    );
  }

  return list;
});

// Enroll a single course for student
const enrollCourseForStudent = async (course) => {
  if (!selectedStudent.value) return;
  isEnrollingDropping.value = true;
  regModalAlert.value = '';

  const studentId = selectedStudent.value.id;
  const courseId = course.id;

  try {
    // 1. Supabase enrollments store
    await enrollmentsStore.createEnrollment({
      studentId,
      courseId
    });

    // 2. Also sync to Express backend (dev.db / SQLite)
    try {
      await api.post(`/courses/${courseId}/enroll`, {
        studentId
      });
    } catch (e) {
      console.warn('Backend enrollment sync notice:', e.message);
    }

    // 3. Update local student record
    const targetStu = students.value.find((s) => s.id === studentId);
    if (targetStu) {
      targetStu.enrolledCourses.push({
        ...course,
        enrollmentId: `temp-${Date.now()}`
      });
      targetStu.totalCredits = (targetStu.totalCredits || 0) + (course.credits || 3);
    }

    showRegAlert(`Successfully enrolled in ${course.code} (${course.name})!`, 'success');
  } catch (err) {
    console.error('Failed to enroll course:', err);
    showRegAlert(err.message || 'Could not enroll student in course.', 'error');
  } finally {
    isEnrollingDropping.value = false;
  }
};

// Drop course for student
const dropCourseForStudent = async (course) => {
  if (!selectedStudent.value) return;
  isEnrollingDropping.value = true;
  regModalAlert.value = '';

  const studentId = selectedStudent.value.id;
  const courseId = course.id;

  try {
    // 1. Supabase enrollment deletion if we have an enrollmentId
    if (course.enrollmentId) {
      try {
        await enrollmentsStore.deleteEnrollment(course.enrollmentId);
      } catch {
        // Fallback: delete directly by student_id and course_id
        await supabase
          .from('enrollments')
          .delete()
          .eq('student_id', studentId)
          .eq('course_id', courseId);
      }
    } else {
      await supabase
        .from('enrollments')
        .delete()
        .eq('student_id', studentId)
        .eq('course_id', courseId);
    }

    // 2. Sync deletion to Express backend
    try {
      await api.delete(`/courses/${courseId}/enroll`, {
        data: { studentId }
      });
    } catch (e) {
      console.warn('Backend drop sync notice:', e.message);
    }

    // 3. Update local student record
    const targetStu = students.value.find((s) => s.id === studentId);
    if (targetStu) {
      targetStu.enrolledCourses = targetStu.enrolledCourses.filter((c) => c.id !== courseId && c.code !== course.code);
      targetStu.totalCredits = Math.max(0, (targetStu.totalCredits || 0) - (course.credits || 3));
    }

    showRegAlert(`Dropped course ${course.code} successfully.`, 'success');
  } catch (err) {
    console.error('Failed to drop course:', err);
    showRegAlert(err.message || 'Could not drop course for student.', 'error');
  } finally {
    isEnrollingDropping.value = false;
  }
};

// ==========================================
// ADD / EDIT STUDENT MODAL LOGIC
// ==========================================
const openAddStudentModal = () => {
  isEditingStudent.value = false;
  studentModalError.value = '';
  showStudentPassword.value = false;
  studentForm.value = {
    id: '',
    name: '',
    email: '',
    displayId: '',
    program: availablePrograms.value[0] || 'Computer Science',
    level: '100',
    password: ''
  };
  isStudentModalOpen.value = true;
};

const openEditStudentModal = (student) => {
  isEditingStudent.value = true;
  studentModalError.value = '';
  showStudentPassword.value = false;
  studentForm.value = {
    id: student.id,
    name: student.name || '',
    email: student.email === '—' ? '' : student.email,
    displayId: student.displayId || student.id_number || '',
    program: student.program || 'Computer Science',
    level: student.level || '100',
    password: ''
  };
  isStudentModalOpen.value = true;
};

const closeStudentModal = () => {
  isStudentModalOpen.value = false;
  studentModalError.value = '';
};

// Save Student
const saveStudent = async () => {
  studentModalError.value = '';
  isSavingStudent.value = true;

  try {
    const cleanName = studentForm.value.name.trim();
    const cleanEmail = studentForm.value.email.trim().toLowerCase();
    const cleanProgram = studentForm.value.program;
    const cleanLevel = studentForm.value.level;

    if (isEditingStudent.value) {
      // 1. Update Supabase
      const updateData = {
        name: cleanName,
        email: cleanEmail,
        program: cleanProgram,
        level: cleanLevel,
        updated_at: new Date().toISOString()
      };

      try {
        await supabase.from('users').update(updateData).eq('id', studentForm.value.id);
      } catch (e) {
        console.warn('Supabase update error:', e.message);
      }

      // 2. Update Express backend
      try {
        await api.put(`/users/${studentForm.value.id}`, {
          name: cleanName,
          email: cleanEmail,
          program: cleanProgram,
          level: cleanLevel,
          password: studentForm.value.password || undefined
        });
      } catch (e) {
        console.warn('Backend update error:', e.message);
      }

      // 3. Update local array
      const existing = students.value.find((s) => s.id === studentForm.value.id);
      if (existing) {
        existing.name = cleanName;
        existing.email = cleanEmail;
        existing.program = cleanProgram;
        existing.level = cleanLevel;
      }

      showAlert(`Student '${cleanName}' profile updated successfully!`, 'success');
    } else {
      // Create New Student
      const cleanId = studentForm.value.displayId?.trim() || `STU/${Date.now().toString().slice(-6)}`;
      let backendCreated = false;

      // 1. Post to Express backend
      try {
        const res = await api.post('/users', {
          id: cleanId,
          name: cleanName,
          email: cleanEmail,
          role: 'STUDENT',
          program: cleanProgram,
          level: cleanLevel,
          password: studentForm.value.password || 'Student@123'
        });
        if (res.status === 201 || res.status === 200) backendCreated = true;
      } catch (backendErr) {
        console.warn('Backend student creation:', backendErr?.response?.data || backendErr);
      }

      // 2. Register in Supabase users table
      try {
        await supabase.from('users').upsert({
          id: cleanId,
          id_number: cleanId,
          name: cleanName,
          email: cleanEmail,
          role: 'student',
          program: cleanProgram,
          level: cleanLevel,
          created_at: new Date().toISOString()
        });
      } catch (e) {
        console.warn('Supabase insert notice:', e.message);
      }

      // 3. Persist in local storage fallback
      try {
        const localList = JSON.parse(localStorage.getItem('custom_created_students') || '[]');
        localList.push({
          id: cleanId,
          id_number: cleanId,
          name: cleanName,
          email: cleanEmail,
          role: 'STUDENT',
          program: cleanProgram,
          level: cleanLevel,
          created_at: new Date().toISOString()
        });
        localStorage.setItem('custom_created_students', JSON.stringify(localList));
      } catch {}

      showAlert(`Student '${cleanName}' registered successfully into academic registry!`, 'success');
      await fetchStudentsData();
    }

    closeStudentModal();
  } catch (err) {
    console.error('Failed to save student:', err);
    studentModalError.value = err.message || 'Failed to save student profile.';
  } finally {
    isSavingStudent.value = false;
  }
};

// ==========================================
// BATCH ENROLLMENT MODAL LOGIC
// ==========================================
const openBatchEnrollModal = () => {
  batchForm.value = {
    courseId: allCoursesList.value[0]?.id || '',
    program: 'all',
    level: 'all'
  };
  isBatchModalOpen.value = true;
};

// Eligible students for the chosen course
const batchEligibleStudents = computed(() => {
  if (!batchForm.value.courseId) return [];
  const targetCourseId = batchForm.value.courseId;

  return students.value.filter((stu) => {
    // Check program filter
    if (batchForm.value.program !== 'all' && (stu.program || '').toLowerCase() !== batchForm.value.program.toLowerCase()) {
      return false;
    }
    // Check level filter
    if (batchForm.value.level !== 'all' && (stu.level || '100').toString() !== batchForm.value.level) {
      return false;
    }
    // Check if student is NOT already enrolled in targetCourseId
    const isEnrolled = stu.enrolledCourses.some((c) => c.id === targetCourseId || c.code === targetCourseId);
    return !isEnrolled;
  });
});

const executeBatchEnrollment = async () => {
  if (!batchForm.value.courseId || batchEligibleStudents.value.length === 0) return;
  isBatchEnrolling.value = true;

  const targetCourse = allCoursesList.value.find((c) => c.id === batchForm.value.courseId);
  const eligible = [...batchEligibleStudents.value];
  let successCount = 0;

  try {
    for (const stu of eligible) {
      try {
        await enrollmentsStore.createEnrollment({
          studentId: stu.id,
          courseId: batchForm.value.courseId
        });

        // Also sync backend
        api.post(`/courses/${batchForm.value.courseId}/enroll`, {
          studentId: stu.id
        }).catch(() => {});

        // Local update
        stu.enrolledCourses.push({
          ...(targetCourse || { id: batchForm.value.courseId, code: 'MOD' }),
          enrollmentId: `batch-${Date.now()}-${stu.id}`
        });
        stu.totalCredits = (stu.totalCredits || 0) + (targetCourse?.credits || 3);
        successCount++;
      } catch (err) {
        console.warn(`Failed batch enrolling student ${stu.id}:`, err.message);
      }
    }

    showAlert(`Successfully batch enrolled ${successCount} student(s) into ${targetCourse?.code || 'course'}!`, 'success');
    isBatchModalOpen.value = false;
  } catch (err) {
    showAlert('Error during batch enrollment process.', 'error');
  } finally {
    isBatchEnrolling.value = false;
  }
};
</script>

<style scoped>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.25s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
