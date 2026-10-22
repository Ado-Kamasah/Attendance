<template>
  <div class="space-y-6 p-1 sm:p-2 lg:p-4 animate-in fade-in duration-500">

    <!-- Header -->
    <div class="relative bg-white dark:bg-dark-surface border border-slate-200/80 dark:border-dark-outline/60 rounded-2xl p-6 sm:p-8 shadow-sm overflow-hidden">
      <div class="absolute inset-0 bg-[radial-gradient(#031c45_1px,transparent_1px)] dark:bg-[radial-gradient(#bc9333_1px,transparent_1px)] opacity-[0.03] dark:opacity-[0.05] bg-[size:16px_16px] pointer-events-none"></div>
      <div class="absolute top-2 left-2 w-3 h-3 border-t-2 border-l-2 border-secondary/40 pointer-events-none"></div>
      <div class="absolute top-2 right-2 w-3 h-3 border-t-2 border-r-2 border-secondary/40 pointer-events-none"></div>

      <div class="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-5">
        <div>
          <div class="flex items-center gap-2 mb-1.5">
            <span class="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-mono font-medium tracking-wide uppercase bg-primary/10 text-primary dark:bg-secondary/15 dark:text-secondary border border-primary/20 dark:border-secondary/30">
              <CalendarDays class="w-3 h-3" />
              ADMIN // MASTER SCHEDULE
            </span>
          </div>
          <h1 class="text-2xl sm:text-3xl font-display font-bold text-slate-900 dark:text-white tracking-tight">Master Schedule</h1>
          <p class="text-sm text-slate-500 dark:text-white/75 mt-1">Manage lecture timings, venues, and instructor assignments.</p>
        </div>
        <button @click="openAddModal"
          class="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-primary hover:bg-primary/90 text-white text-sm font-semibold transition-all shadow-md hover:shadow-lg active:scale-95 flex-shrink-0"
        >
          <Plus class="w-4 h-4" />
          <span>Add Class</span>
        </button>
      </div>
    </div>

    <!-- Filters Panel -->
    <div class="bg-white dark:bg-dark-surface border border-slate-200/80 dark:border-dark-outline/60 rounded-2xl p-5 shadow-sm space-y-4">
      <!-- Semester pills -->
      <div class="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-5">
        <span class="text-[11px] font-mono uppercase tracking-wider text-slate-500 dark:text-white/75 font-bold flex-shrink-0">Semester</span>
        <div class="flex flex-wrap gap-2">
          <button v-for="sem in ['All', 'Semester 1', 'Semester 2']" :key="sem"
            @click="selectedSemester = sem"
            :class="['px-3 py-1.5 rounded-lg text-xs font-mono font-semibold border transition-all',
              selectedSemester === sem
                ? 'bg-primary text-white border-primary dark:bg-secondary dark:border-secondary dark:text-primary'
                : 'bg-slate-50 dark:bg-dark-muted/70 text-slate-600 dark:text-white/75 border-slate-200 dark:border-dark-outline/70 hover:border-slate-300 dark:hover:border-slate-600'
            ]">{{ sem }}
          </button>
        </div>
      </div>
      <!-- Level + Mode pills -->
      <div class="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-5">
        <span class="text-[11px] font-mono uppercase tracking-wider text-slate-500 dark:text-white/75 font-bold flex-shrink-0">Level</span>
        <div class="flex flex-wrap gap-2">
          <button v-for="level in levels" :key="level"
            @click="selectedLevel = level"
            :class="['px-3 py-1.5 rounded-lg text-xs font-mono font-semibold border transition-all',
              selectedLevel === level
                ? 'bg-primary text-white border-primary dark:bg-secondary dark:border-secondary dark:text-primary'
                : 'bg-slate-50 dark:bg-dark-muted/70 text-slate-600 dark:text-white/75 border-slate-200 dark:border-dark-outline/70 hover:border-slate-300 dark:hover:border-slate-600'
            ]">Level {{ level }}
          </button>
        </div>
        <span class="text-[11px] font-mono uppercase tracking-wider text-slate-500 dark:text-white/75 font-bold sm:ml-4 flex-shrink-0">Mode</span>
        <div class="flex flex-wrap gap-2">
          <button v-for="mode in modes" :key="mode"
            @click="selectedMode = mode"
            :class="['px-3 py-1.5 rounded-lg text-xs font-mono font-semibold border transition-all',
              selectedMode === mode
                ? 'bg-primary text-white border-primary dark:bg-secondary dark:border-secondary dark:text-primary'
                : 'bg-slate-50 dark:bg-dark-muted/70 text-slate-600 dark:text-white/75 border-slate-200 dark:border-dark-outline/70 hover:border-slate-300 dark:hover:border-slate-600'
            ]">{{ mode }}
          </button>
        </div>
      </div>
      <!-- Search bar -->
      <div class="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-5 pt-3 border-t border-slate-100 dark:border-dark-outline/40">
        <span class="text-[11px] font-mono uppercase tracking-wider text-slate-500 dark:text-white/75 font-bold flex-shrink-0">Search</span>
        <div class="relative flex-1 max-w-sm">
          <Search class="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 dark:text-white/40 pointer-events-none" />
          <input
            v-model="lecturerSearch"
            type="text"
            placeholder="Search lecturer, course code or title…"
            class="w-full pl-8 pr-8 py-1.5 text-xs bg-slate-50 dark:bg-dark-muted/80 border border-slate-200 dark:border-dark-outline/70 rounded-xl text-slate-800 dark:text-white placeholder:text-slate-400 dark:placeholder:text-white/40 focus:outline-none focus:ring-2 focus:ring-secondary/50 font-mono transition-all"
          />
          <button
            v-if="lecturerSearch"
            @click="lecturerSearch = ''"
            class="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-white transition-colors"
          >
            <X class="w-3 h-3" />
          </button>
        </div>
        <span v-if="lecturerSearch" class="text-[11px] font-mono text-secondary dark:text-dark-secondary shrink-0">
          {{ filteredClasses.length }} result{{ filteredClasses.length === 1 ? '' : 's' }}
        </span>
      </div>
    </div>

    <!-- Schedule Layout -->
    <div class="grid grid-cols-[auto_1fr] gap-5">
      <!-- Day Sidebar -->
      <div class="flex flex-col gap-2 min-w-[110px]">
        <button
          v-for="day in activeDays"
          :key="day"
          @click="selectedDay = day"
          :class="['relative px-3 py-3 rounded-xl border text-left text-xs font-mono font-semibold transition-all',
            selectedDay === day
              ? 'bg-primary dark:bg-dark-surface border-primary/80 dark:border-secondary/60 text-white shadow-md ring-2 ring-primary/20 dark:ring-secondary/20'
              : 'bg-white dark:bg-dark-surface border-slate-200 dark:border-dark-outline text-slate-600 dark:text-white/75 hover:border-slate-300 dark:hover:border-dark-outline shadow-sm'
          ]"
        >
          <div>{{ day }}</div>
          <div v-if="getClassCount(day) > 0"
            :class="['mt-1.5 inline-flex items-center justify-center w-5 h-5 rounded-full text-[10px] font-bold',
              selectedDay === day ? 'bg-white/20 text-white' : 'bg-primary/10 dark:bg-secondary/15 text-primary dark:text-secondary'
            ]"
          >{{ getClassCount(day) }}</div>
        </button>
      </div>

      <!-- Classes Area -->
      <div class="min-w-0">
        <!-- Empty -->
        <div v-if="filteredClasses.length === 0"
          class="bg-white dark:bg-dark-surface border border-dashed border-slate-200 dark:border-dark-outline rounded-2xl p-12 text-center flex flex-col items-center gap-4"
        >
          <div class="w-14 h-14 rounded-2xl bg-slate-100 dark:bg-dark-muted flex items-center justify-center text-slate-400 dark:text-white/50">
            <CalendarDays class="w-7 h-7" />
          </div>
          <h3 class="font-display font-bold text-slate-900 dark:text-white text-base">No classes scheduled</h3>
          <p class="text-sm text-slate-400 dark:text-white/60">No classes arranged for <strong>{{ selectedDay }}</strong>. Schedule one now.</p>
          <button @click="openAddModal"
            class="px-4 py-2 rounded-xl bg-primary hover:bg-primary/90 text-white text-xs font-semibold transition-all shadow-sm active:scale-95"
          >Schedule a Class</button>
        </div>

        <!-- Class Cards -->
        <div v-else class="space-y-4">
          <div
            v-for="cls in filteredClasses"
            :key="cls.id"
            class="group flex gap-5 bg-white dark:bg-dark-surface border border-slate-200 dark:border-dark-outline rounded-2xl p-5 shadow-sm hover:shadow-md transition-all"
          >
            <!-- Time column -->
            <div class="flex flex-col items-center gap-1 min-w-[70px] text-center flex-shrink-0">
              <span class="text-xs font-mono font-bold text-slate-900 dark:text-white">{{ formatTime(cls.startTime) }}</span>
              <div class="w-px h-4 bg-gradient-to-b from-secondary to-transparent"></div>
              <span class="text-xs font-mono font-bold text-slate-900 dark:text-white">{{ formatTime(cls.endTime) }}</span>
              <span class="text-[10px] font-mono text-slate-400 dark:text-white/50 mt-1">{{ getDuration(cls.startTime, cls.endTime) }}h</span>
            </div>

            <!-- Divider -->
            <div class="w-px bg-gradient-to-b from-secondary/60 to-secondary/10 flex-shrink-0 rounded-full"></div>

            <!-- Content -->
            <div class="flex-1 min-w-0 space-y-2">
              <div class="flex items-start gap-2 flex-wrap">
                <span class="font-mono text-[11px] font-bold px-2 py-0.5 rounded bg-primary/10 text-primary dark:bg-secondary/15 dark:text-secondary">{{ cls.courseCode }}</span>
                <span class="text-[11px] font-mono px-2 py-0.5 rounded-full bg-sky-50 dark:bg-sky-950/40 text-sky-700 dark:text-sky-400 border border-sky-100 dark:border-sky-900">{{ cls.semester || 'Semester 1' }}</span>
                <!-- Delivery Mode Badge -->
                <span
                  :class="[
                    'text-[11px] font-mono font-bold px-2 py-0.5 rounded-full border flex items-center gap-1',
                    cls.deliveryMode === 'Online'
                      ? 'bg-violet-50 dark:bg-violet-950/40 text-violet-700 dark:text-violet-400 border-violet-200 dark:border-violet-800'
                      : cls.deliveryMode === 'Hybrid'
                      ? 'bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-400 border-amber-200 dark:border-amber-800'
                      : 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800'
                  ]"
                >
                  <span v-if="cls.deliveryMode === 'Online'">🌐</span>
                  <span v-else-if="cls.deliveryMode === 'Hybrid'">⚡</span>
                  <span v-else>🏫</span>
                  {{ cls.deliveryMode || 'Face-to-Face' }}
                </span>
              </div>
              <h3 class="text-sm font-bold text-slate-900 dark:text-white">{{ cls.courseTitle }}</h3>
              <div class="flex flex-wrap items-center gap-3 text-xs text-slate-500 dark:text-white/75">
                <span class="flex items-center gap-1"><UserIcon class="w-3.5 h-3.5" /> {{ cls.lecturer }}</span>
                <span v-if="cls.deliveryMode !== 'Online'" class="flex items-center gap-1"><MapPin class="w-3.5 h-3.5" /> {{ cls.venue }}</span>
                <span v-if="cls.deliveryMode === 'Online' || cls.deliveryMode === 'Hybrid'" class="flex items-center gap-1"><Link2 class="w-3.5 h-3.5 text-violet-500" /><span class="text-violet-600 dark:text-violet-400 font-mono">{{ cls.onlineLink || 'Link TBD' }}</span></span>
              </div>
            </div>

            <!-- Actions -->
            <div class="flex items-start gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
              <button @click="editClass(cls)" title="Edit"
                class="p-1.5 text-slate-400 hover:text-primary dark:hover:text-secondary hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors">
                <Edit3 class="w-3.5 h-3.5" />
              </button>
              <button @click="deleteClass(cls.id)" title="Delete"
                class="p-1.5 text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/40 rounded-lg transition-colors">
                <Trash2 class="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Add/Edit Schedule Modal -->
    <div v-if="isModalOpen" class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200" @click.self="closeModal">
      <div class="relative w-full max-w-lg bg-white dark:bg-dark-surface border border-slate-200 dark:border-dark-outline rounded-2xl shadow-2xl overflow-hidden">
        <div class="absolute top-2 left-2 w-3 h-3 border-t-2 border-l-2 border-secondary/40 pointer-events-none"></div>
        <div class="absolute top-2 right-2 w-3 h-3 border-t-2 border-r-2 border-secondary/40 pointer-events-none"></div>

        <div class="p-6 border-b border-slate-100 dark:border-dark-outline flex items-center justify-between">
          <div>
            <span class="text-[10px] font-mono uppercase tracking-wider text-secondary font-bold">{{ editingScheduleId ? 'EDIT CLASS' : 'NEW CLASS' }}</span>
            <h2 class="text-xl font-display font-bold text-slate-900 dark:text-white">{{ editingScheduleId ? 'Edit Class' : 'Add New Class' }}</h2>
          </div>
          <button @click="closeModal" class="p-2 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">
            <X class="w-5 h-5" />
          </button>
        </div>

        <form @submit.prevent="saveClass" class="p-6 space-y-4 overflow-y-auto max-h-[80vh]">
          <!-- Course: Level picker → filtered course list -->
          <div class="space-y-3">
            <!-- Level pill selector -->
            <div class="space-y-1.5">
              <label class="text-[11px] font-mono uppercase tracking-wider text-slate-500 dark:text-white/75">Level <span class="text-rose-500">*</span></label>
              <div class="flex flex-wrap gap-2">
                <button
                  v-for="lvl in levels"
                  :key="lvl"
                  type="button"
                  @click="setModalLevel(lvl)"
                  :class="[
                    'px-3 py-1.5 rounded-lg text-xs font-mono font-semibold border transition-all',
                    modalLevel === lvl
                      ? 'bg-primary text-white border-primary dark:bg-secondary dark:border-secondary dark:text-primary'
                      : 'bg-slate-50 dark:bg-dark-muted/70 text-slate-600 dark:text-white/75 border-slate-200 dark:border-dark-outline/70 hover:border-slate-300 dark:hover:border-slate-600'
                  ]"
                >Lvl {{ lvl }}</button>
              </div>
            </div>

            <!-- Course dropdown (filtered by modalLevel) -->
            <div class="space-y-1.5">
              <label class="text-[11px] font-mono uppercase tracking-wider text-slate-500 dark:text-white/75">Select Course <span class="text-rose-500">*</span></label>
              <select v-model="newClass.courseId" required
                class="w-full bg-slate-50 dark:bg-dark-muted/80 border border-slate-200 dark:border-dark-outline/70 rounded-xl px-3 py-2.5 text-sm text-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-secondary/50">
                <option disabled value="">
                  {{ coursesForLevel.length ? 'Choose a course' : `No courses at Level ${modalLevel}` }}
                </option>
                <option v-for="course in coursesForLevel" :key="course.id" :value="course.id">
                  {{ course.code }} — {{ course.name }}
                </option>
              </select>
              <p v-if="coursesForLevel.length === 0" class="text-[10px] font-mono text-amber-500 dark:text-amber-400">
                No courses found for Level {{ modalLevel }}. Add courses first or pick another level.
              </p>
            </div>
          </div>

          <!-- Delivery Mode selector -->
          <div class="space-y-2">
            <label class="text-[11px] font-mono uppercase tracking-wider text-slate-500 dark:text-white/75">Class Delivery Mode <span class="text-rose-500">*</span></label>
            <div class="grid grid-cols-3 gap-2">
              <button
                v-for="dm in deliveryModes" :key="dm.value"
                type="button"
                @click="newClass.deliveryMode = dm.value"
                :class="[
                  'relative flex flex-col items-center gap-1.5 p-3 rounded-xl border-2 transition-all font-mono text-xs font-bold',
                  newClass.deliveryMode === dm.value
                    ? dm.activeClass
                    : 'border-slate-200 dark:border-dark-outline/70 bg-slate-50 dark:bg-dark-muted/60 text-slate-500 dark:text-white/60 hover:border-slate-300 dark:hover:border-slate-600'
                ]"
              >
                <span class="text-xl">{{ dm.icon }}</span>
                <span>{{ dm.label }}</span>
                <span v-if="newClass.deliveryMode === dm.value" class="absolute top-1.5 right-1.5 w-2 h-2 rounded-full" :class="dm.dotClass"></span>
              </button>
            </div>
          </div>

          <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <!-- Lecturer (searchable combobox) -->
            <div class="space-y-1.5" v-click-outside="() => showLecturerDropdown = false">
              <label class="text-[11px] font-mono uppercase tracking-wider text-slate-500 dark:text-white/75">Lecturer <span class="text-rose-500">*</span></label>
              <div class="relative">
                <!-- Search input -->
                <div class="relative">
                  <Search class="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                  <input
                    type="text"
                    v-model="lecturerQuery"
                    @focus="showLecturerDropdown = true"
                    @input="showLecturerDropdown = true"
                    @blur="onLecturerBlur"
                    :placeholder="newClass.lecturer || 'Type to search or enter a name…'"
                    autocomplete="off"
                    class="w-full pl-8 pr-8 py-2.5 text-sm bg-slate-50 dark:bg-dark-muted/80 border border-slate-200 dark:border-dark-outline/70 rounded-xl text-slate-800 dark:text-white placeholder:text-slate-400 dark:placeholder:text-white/40 focus:outline-none focus:ring-2 focus:ring-secondary/50 transition-all"
                  />
                  <button v-if="lecturerQuery" type="button" @click="lecturerQuery = ''; newClass.lecturer = ''"
                    class="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-white">
                    <X class="w-3.5 h-3.5" />
                  </button>
                </div>

                <!-- Dropdown list -->
                <div v-if="showLecturerDropdown && filteredLecturers.length > 0"
                  class="absolute z-50 mt-1 w-full bg-white dark:bg-dark-surface border border-slate-200 dark:border-dark-outline rounded-xl shadow-lg overflow-hidden max-h-48 overflow-y-auto"
                >
                  <button
                    v-for="l in filteredLecturers"
                    :key="l.id"
                    type="button"
                    @click="selectLecturer(l)"
                    :class="[
                      'w-full text-left px-3 py-2 text-sm font-mono flex items-center gap-2 transition-colors',
                      newClass.lecturer === l.name
                        ? 'bg-secondary/10 dark:bg-secondary/20 text-secondary dark:text-dark-secondary font-bold'
                        : 'text-slate-700 dark:text-white/90 hover:bg-slate-50 dark:hover:bg-slate-800'
                    ]"
                  >
                    <span class="w-6 h-6 rounded-lg bg-violet-100 dark:bg-violet-950/50 text-violet-700 dark:text-violet-400 flex items-center justify-center text-[10px] font-bold uppercase shrink-0">{{ (l.name || '?').charAt(0) }}</span>
                    <span class="flex-1 truncate">{{ l.name }}</span>
                    <span class="text-[9px] font-mono px-1.5 py-0.5 rounded-md shrink-0"
                      :class="l.role?.toLowerCase().includes('lecturer')
                        ? 'bg-blue-100 dark:bg-blue-950/50 text-blue-600 dark:text-blue-400'
                        : 'bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400'"
                    >{{ l.role }}</span>
                  </button>
                </div>

                <!-- No results — offer to use the typed name directly -->
                <div v-if="showLecturerDropdown && lecturerQuery && filteredLecturers.length === 0"
                  class="absolute z-50 mt-1 w-full bg-white dark:bg-dark-surface border border-slate-200 dark:border-dark-outline rounded-xl shadow-lg overflow-hidden"
                >
                  <button type="button"
                    @click="selectLecturer({ id: '_custom', name: lecturerQuery.trim(), role: 'Custom' })"
                    class="w-full text-left px-3 py-2.5 text-sm font-mono flex items-center gap-2 text-slate-700 dark:text-white/90 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
                  >
                    <span class="w-6 h-6 rounded-lg bg-emerald-100 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-400 flex items-center justify-center text-[10px] shrink-0">+</span>
                    <span>Use <strong>"{{ lecturerQuery.trim() }}"</strong></span>
                    <span class="ml-auto text-[9px] font-mono px-1.5 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-400">custom</span>
                  </button>
                </div>
              </div>
              <!-- Selected lecturer badge -->
              <p v-if="newClass.lecturer && !lecturerQuery" class="text-[11px] font-mono text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                <span>✓</span> {{ newClass.lecturer }}
              </p>
              <p v-if="isLoadingLecturers" class="text-[10px] text-slate-400 dark:text-white/50 font-mono">Loading lecturers...</p>
            </div>

            <!-- Venue (hidden for Online-only) -->
            <div class="space-y-1.5">
              <label class="text-[11px] font-mono uppercase tracking-wider text-slate-500 dark:text-white/75">
                {{ newClass.deliveryMode === 'Online' ? 'Virtual Room / Platform' : 'Venue' }}
                <span v-if="newClass.deliveryMode !== 'Online'" class="text-rose-500">*</span>
              </label>
              <input type="text"
                v-model="newClass.venue"
                :placeholder="newClass.deliveryMode === 'Online' ? 'e.g. Zoom, Google Meet' : 'Hall / Room'"
                :required="newClass.deliveryMode !== 'Online'"
                class="w-full bg-slate-50 dark:bg-dark-muted/80 border border-slate-200 dark:border-dark-outline/70 rounded-xl px-3 py-2.5 text-sm text-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-secondary/50 transition-all" />
            </div>
          </div>

          <!-- Online link (shown for Online or Hybrid) -->
          <div v-if="newClass.deliveryMode === 'Online' || newClass.deliveryMode === 'Hybrid'" class="space-y-1.5">
            <label class="text-[11px] font-mono uppercase tracking-wider text-slate-500 dark:text-white/75">
              Meeting / Stream Link
              <span v-if="newClass.deliveryMode === 'Online'" class="text-rose-500">*</span>
              <span v-else class="text-slate-400">(Optional for Hybrid)</span>
            </label>
            <div class="relative">
              <Link2 class="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-violet-500 pointer-events-none" />
              <input type="url"
                v-model="newClass.onlineLink"
                placeholder="https://meet.google.com/..."
                :required="newClass.deliveryMode === 'Online'"
                class="w-full pl-9 pr-3 bg-slate-50 dark:bg-dark-muted/80 border border-violet-200 dark:border-violet-800/60 rounded-xl py-2.5 text-sm text-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-violet-400/50 transition-all" />
            </div>
          </div>

          <div class="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <!-- Day -->
            <div class="space-y-1.5">
              <label class="text-[11px] font-mono uppercase tracking-wider text-slate-500 dark:text-white/75">Day <span class="text-rose-500">*</span></label>
              <select v-model="newClass.day" required
                class="w-full bg-slate-50 dark:bg-dark-muted/80 border border-slate-200 dark:border-dark-outline/70 rounded-xl px-3 py-2.5 text-sm text-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-secondary/50">
                <option v-for="d in activeDays" :key="d" :value="d">{{ d }}</option>
              </select>
            </div>
            <!-- Start -->
            <div class="space-y-1.5">
              <label class="text-[11px] font-mono uppercase tracking-wider text-slate-500 dark:text-white/75">Start Time <span class="text-rose-500">*</span></label>
              <input type="time" v-model="newClass.startTime" required
                class="w-full bg-slate-50 dark:bg-dark-muted/80 border border-slate-200 dark:border-dark-outline/70 rounded-xl px-3 py-2.5 text-sm text-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-secondary/50 transition-all" />
            </div>
            <!-- End -->
            <div class="space-y-1.5">
              <label class="text-[11px] font-mono uppercase tracking-wider text-slate-500 dark:text-white/75">End Time <span class="text-rose-500">*</span></label>
              <input type="time" v-model="newClass.endTime" required
                class="w-full bg-slate-50 dark:bg-dark-muted/80 border border-slate-200 dark:border-dark-outline/70 rounded-xl px-3 py-2.5 text-sm text-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-secondary/50 transition-all" />
            </div>
          </div>

          <div class="flex items-center justify-end gap-3 pt-2">
            <button type="button" @click="closeModal" class="px-4 py-2.5 rounded-xl border border-slate-200 dark:border-dark-outline/70 text-sm font-semibold text-slate-700 dark:text-white/90 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">Cancel</button>
            <button type="submit" :disabled="isSavingSchedule"
              class="px-5 py-2.5 rounded-xl bg-primary hover:bg-primary/90 text-white text-sm font-semibold transition-all shadow-md active:scale-95 inline-flex items-center gap-2 disabled:opacity-50">
              <Loader2 v-if="isSavingSchedule" class="w-4 h-4 animate-spin" />
              <span>{{ isSavingSchedule ? 'Saving...' : (editingScheduleId ? 'Update Schedule' : 'Save Schedule') }}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch, onMounted, onUnmounted } from 'vue';
import { storeToRefs } from 'pinia';
import { useSchedulesStore } from '@/stores/schedules';
import { useCoursesStore } from '@/stores/courses';
import { useAuditLogsStore } from '@/stores/auditlogs';
import { useAuthStore } from '@/stores/authstore';
import { supabase } from '@/stores/supabase';
import api from '@/api.js';
import { CalendarDays, Plus, Edit3, Trash2, X, MapPin, User as UserIcon, Link2, Loader2, Search } from 'lucide-vue-next';

// ── Click-outside directive ────────────────────────────────────────────────────
const vClickOutside = {
  mounted(el, binding) {
    el._clickOutside = (e) => { if (!el.contains(e.target)) binding.value(e); };
    document.addEventListener('mousedown', el._clickOutside);
  },
  unmounted(el) { document.removeEventListener('mousedown', el._clickOutside); },
};

const levels = ['100', '200', '300', '400', '500', '600', '700'];
const modes = ['Regular', 'Weekend'];
const regularDays = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];
const weekendDays = ['Thursday', 'Friday', 'Saturday', 'Sunday'];

const todayName = new Date().toLocaleDateString('en-US', { weekday: 'long' });
const defaultDay = regularDays.includes(todayName) ? todayName : 'Monday';

const selectedLevel = ref('100');
const selectedMode = ref('Regular');
const selectedSemester = ref('Semester 1');
const selectedDay = ref(defaultDay);
const isModalOpen = ref(false);
const isSavingSchedule = ref(false);
const editingScheduleId = ref(null);
const lecturerSearch = ref('');
const beforeEditSnapshot = ref(null);

// Level chosen inside the Add/Edit modal — seeds from the active filter level
const modalLevel = ref('100');

// Courses filtered to the level chosen in the modal
const coursesForLevel = computed(() =>
  courses.value.filter((c) => String(c.level) === modalLevel.value)
);

// Change modal level and clear the selected course so a stale ID isn't carried over
const setModalLevel = (lvl) => {
  modalLevel.value = lvl;
  newClass.value.courseId = '';
};

const activeDays = computed(() => selectedMode.value === 'Regular' ? regularDays : weekendDays);

watch(selectedMode, (newMode) => {
  selectedDay.value = newMode === 'Regular' ? defaultDay : 'Friday';
});

const schedulesStore = useSchedulesStore();
const coursesStore = useCoursesStore();
const auditLogsStore = useAuditLogsStore();
const authStore = useAuthStore();

const { schedules } = storeToRefs(schedulesStore);
const { courses } = storeToRefs(coursesStore);

const lecturers = ref([]);
const isLoadingLecturers = ref(false);
const lecturerQuery = ref('');
const showLecturerDropdown = ref(false);

const filteredLecturers = computed(() => {
  const q = lecturerQuery.value.trim().toLowerCase();
  if (!q) return lecturers.value;
  return lecturers.value.filter(l => (l.name || '').toLowerCase().includes(q));
});

const selectLecturer = (l) => {
  newClass.value.lecturer = l.name;
  lecturerQuery.value = '';
  showLecturerDropdown.value = false;
};

// When the user types a custom name not in the list, wire it directly on blur
const onLecturerBlur = () => {
  setTimeout(() => {
    if (lecturerQuery.value.trim() && !showLecturerDropdown.value) {
      newClass.value.lecturer = lecturerQuery.value.trim();
      lecturerQuery.value = '';
    }
    showLecturerDropdown.value = false;
  }, 150);
};

const loadLecturers = async () => {
  isLoadingLecturers.value = true;
  try {
    const unifiedMap = new Map();

    const addCandidate = (u) => {
      if (!u) return;
      const rawId = (u.id || '').toString().trim();
      const rawEmail = (u.email || '').toString().trim().toLowerCase();
      const rawName = (u.name || u.full_name || u.fullName || '').trim();
      if (!rawName) return;

      const dedupeKey = (rawEmail && rawEmail !== '—') ? `email:${rawEmail}` : `id:${rawId || rawName.toLowerCase()}`;
      if (!dedupeKey || dedupeKey === 'id:') return;

      const existing = unifiedMap.get(dedupeKey) || (rawId ? unifiedMap.get(`id:${rawId}`) : null);
      const role = u.role || existing?.role || 'Lecturer';

      const resolved = {
        id: rawId || existing?.id || `lec-${Date.now()}-${Math.random()}`,
        name: rawName,
        email: rawEmail && rawEmail !== '—' ? rawEmail : (existing?.email || '—'),
        role: role,
      };

      unifiedMap.set(dedupeKey, resolved);
      if (rawId) unifiedMap.set(`id:${rawId}`, resolved);
      if (rawEmail && rawEmail !== '—') unifiedMap.set(`email:${rawEmail}`, resolved);
    };

    // 1. Supabase users
    try {
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .limit(2000);
      if (!error && Array.isArray(data)) {
        data
          .filter(u => u.role && u.role.toString().toLowerCase().includes('lecturer'))
          .forEach(addCandidate);
      }
    } catch (e) {
      console.warn('[loadLecturers] Supabase fetch notice:', e);
    }

    // 2. Backend /users endpoint
    try {
      const { data: bUsers } = await api.get('/users', { params: { role: 'LECTURER' } });
      if (bUsers?.users?.length > 0) {
        bUsers.users
          .filter(u => (u.role || '').toString().toLowerCase().includes('lecturer'))
          .forEach(addCandidate);
      }
    } catch {}

    // 3. Backend /admin/lecturers endpoint
    try {
      const { data: bLecturers } = await api.get('/admin/lecturers');
      if (Array.isArray(bLecturers)) {
        bLecturers.forEach(addCandidate);
      }
    } catch {}

    // 4. Local storage custom created lecturers (registered via LecturersAdmin)
    try {
      const localCreated = JSON.parse(localStorage.getItem('custom_created_lecturers') || '[]');
      if (Array.isArray(localCreated)) {
        localCreated.forEach(addCandidate);
      }
    } catch {}

    // Deduplicate by normalized name
    const seen = new Set();
    const list = [];
    for (const val of unifiedMap.values()) {
      const canonKey = val.name.toLowerCase();
      if (!seen.has(canonKey)) {
        seen.add(canonKey);
        list.push(val);
      }
    }

    lecturers.value = list.sort((a, b) => a.name.localeCompare(b.name));
    console.log('[loadLecturers] lecturers shown:', lecturers.value.length);
  } catch (err) {
    console.error('Failed to load lecturers:', err);
    lecturers.value = [];
  } finally {
    isLoadingLecturers.value = false;
  }
};

const logAudit = (action, details) => {
  const profile = authStore.profile;
  if (!profile) { console.warn('[Audit] No profile loaded — skipping log for:', action); return; }
  auditLogsStore.logAction({ action, details, userId: profile.id, userRole: profile.role ?? 'Admin', userName: profile.name ?? 'Administrator' });
};

onMounted(async () => {
  await Promise.all([schedulesStore.fetchSchedules(), coursesStore.fetchCourses(), loadLecturers()]);
  schedulesStore.subscribeToSchedules();
  coursesStore.subscribeToCourses();
});

onUnmounted(() => {
  schedulesStore.unsubscribeFromSchedules();
  coursesStore.unsubscribeFromCourses();
});

const deliveryModes = [
  {
    value: 'Face-to-Face',
    label: 'Face-to-Face',
    icon: '🏫',
    activeClass: 'border-emerald-500 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400',
    dotClass: 'bg-emerald-500'
  },
  {
    value: 'Online',
    label: 'Online',
    icon: '🌐',
    activeClass: 'border-violet-500 bg-violet-50 dark:bg-violet-950/40 text-violet-700 dark:text-violet-400',
    dotClass: 'bg-violet-500'
  },
  {
    value: 'Hybrid',
    label: 'Hybrid',
    icon: '⚡',
    activeClass: 'border-amber-500 bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-400',
    dotClass: 'bg-amber-500'
  },
];

const newClass = ref({ courseId: '', lecturer: '', venue: '', day: 'Monday', startTime: '', endTime: '', deliveryMode: 'Face-to-Face', onlineLink: '' });

const schedulesWithCourse = computed(() =>
  schedules.value.map((s) => {
    const course = coursesStore.getCourseById(s.courseId);
    return { ...s, courseCode: course?.code ?? 'Unknown', courseTitle: course?.name ?? 'Unknown course', semester: course?.semester || 'Semester 1' };
  })
);

const filteredClasses = computed(() => {
  const q = lecturerSearch.value.trim().toLowerCase();
  return schedulesWithCourse.value.filter(c =>
    c.level === selectedLevel.value && c.mode === selectedMode.value && c.day === selectedDay.value &&
    (selectedSemester.value === 'All' || c.semester === selectedSemester.value) &&
    (!q ||
      (c.lecturer || '').toLowerCase().includes(q) ||
      (c.courseCode || '').toLowerCase().includes(q) ||
      (c.courseTitle || '').toLowerCase().includes(q)
    )
  ).sort((a, b) => (a.startTime || '').localeCompare(b.startTime || ''));
});

const getClassCount = (day) =>
  schedulesWithCourse.value.filter(c =>
    c.level === selectedLevel.value && c.mode === selectedMode.value && c.day === day &&
    (selectedSemester.value === 'All' || c.semester === selectedSemester.value)
  ).length;

const formatTime = (timeStr) => {
  if (!timeStr) return '';
  const [hours, minutes] = timeStr.split(':');
  let h = parseInt(hours, 10);
  const ampm = h >= 12 ? 'PM' : 'AM';
  h = h % 12 || 12;
  return `${h}:${minutes} ${ampm}`;
};

const getDuration = (start, end) => {
  if (!start || !end) return '';
  const [sH, sM] = String(start).split(':').map(Number);
  const [eH, eM] = String(end).split(':').map(Number);
  const diff = (eH * 60 + (eM || 0)) - (sH * 60 + (sM || 0));
  return (diff / 60).toFixed(1).replace('.0', '');
};

const openAddModal = () => {
  editingScheduleId.value = null;
  modalLevel.value = selectedLevel.value;
  newClass.value = { courseId: '', lecturer: '', venue: '', day: selectedDay.value, startTime: '', endTime: '', deliveryMode: 'Face-to-Face', onlineLink: '' };
  lecturerQuery.value = '';
  showLecturerDropdown.value = false;
  isModalOpen.value = true;
};

const editClass = (cls) => {
  editingScheduleId.value = cls.id;
  const course = coursesStore.getCourseById(cls.courseId);
  modalLevel.value = String(cls.level || course?.level || selectedLevel.value);
  beforeEditSnapshot.value = { courseCode: cls.courseCode, lecturer: cls.lecturer, venue: cls.venue, day: cls.day, startTime: cls.startTime, endTime: cls.endTime, deliveryMode: cls.deliveryMode, onlineLink: cls.onlineLink };
  newClass.value = { courseId: cls.courseId, lecturer: cls.lecturer, venue: cls.venue, day: cls.day, startTime: cls.startTime, endTime: cls.endTime, deliveryMode: cls.deliveryMode || 'Face-to-Face', onlineLink: cls.onlineLink || '' };
  lecturerQuery.value = '';
  showLecturerDropdown.value = false;
  isModalOpen.value = true;
};

const closeModal = () => {
  isModalOpen.value = false;
  editingScheduleId.value = null;
  beforeEditSnapshot.value = null;
  lecturerQuery.value = '';
  showLecturerDropdown.value = false;
};

const saveClass = async () => {
  isSavingSchedule.value = true;
  try {
    // Use modalLevel (chosen inside the modal) as the authoritative level for the new/updated schedule
    const payload = { level: modalLevel.value, mode: selectedMode.value, ...newClass.value };
    // For purely online classes, venue conflict check is skipped on the venue dimension
    const skipVenueConflict = payload.deliveryMode === 'Online';
    const conflict = schedulesStore.findConflict(
      { day: payload.day, startTime: payload.startTime, endTime: payload.endTime, lecturer: payload.lecturer, venue: skipVenueConflict ? null : payload.venue },
      editingScheduleId.value
    );
    if (conflict) {
      const reason = conflict.lecturer === payload.lecturer
        ? `${payload.lecturer} is already scheduled from ${formatTime(conflict.startTime)} to ${formatTime(conflict.endTime)} on ${payload.day}.`
        : `${payload.venue} is already booked from ${formatTime(conflict.startTime)} to ${formatTime(conflict.endTime)} on ${payload.day}.`;
      logAudit('schedule_conflict_rejected', `Rejected: ${payload.lecturer} in ${payload.venue} on ${payload.day} ${payload.startTime}-${payload.endTime}. Reason: ${reason}`);
      alert(`Scheduling conflict: ${reason}`);
      return;
    }
    const course = coursesStore.getCourseById(payload.courseId);
    const modeLabel = payload.deliveryMode || 'Face-to-Face';
    const label = `${course?.code ?? 'course'} [${modeLabel}] on ${payload.day} ${formatTime(payload.startTime)}-${formatTime(payload.endTime)}, ${modeLabel === 'Online' ? 'platform' : 'venue'}: ${payload.venue}, lecturer: ${payload.lecturer}`;
    if (editingScheduleId.value) {
      await schedulesStore.updateSchedule(editingScheduleId.value, payload);
      const before = beforeEditSnapshot.value;
      const changes = [];
      if (before) {
        if (before.deliveryMode !== payload.deliveryMode) changes.push(`Mode: "${before.deliveryMode}" → "${payload.deliveryMode}"`);
        if (before.lecturer !== payload.lecturer) changes.push(`Lecturer: "${before.lecturer}" → "${payload.lecturer}"`);
        if (before.venue !== payload.venue) changes.push(`Venue/Platform: "${before.venue}" → "${payload.venue}"`);
        if (before.day !== payload.day) changes.push(`Day: ${before.day} → ${payload.day}`);
        if (before.startTime !== payload.startTime || before.endTime !== payload.endTime)
          changes.push(`Time: ${formatTime(before.startTime)}-${formatTime(before.endTime)} → ${formatTime(payload.startTime)}-${formatTime(payload.endTime)}`);
        if ((before.onlineLink || '') !== (payload.onlineLink || '')) changes.push(`Meeting link updated`);
      }
      logAudit('schedule_updated', `Updated class: ${label}.${changes.length ? ` Changes — ${changes.join('; ')}` : ''}`);
    } else {
      await schedulesStore.createSchedule(payload);
      logAudit('schedule_created', `Scheduled new class: ${label}`);
    }
    selectedDay.value = newClass.value.day;
    closeModal();
  } catch (error) {
    console.error('Error saving schedule:', error);
    alert('Failed to save schedule');
  } finally {
    isSavingSchedule.value = false;
  }
};

const deleteClass = async (id) => {
  const cls = schedulesWithCourse.value.find(c => c.id === id);
  if (!confirm(`Delete this scheduled class${cls ? ` (${cls.courseCode} on ${cls.day} ${formatTime(cls.startTime)}-${formatTime(cls.endTime)})` : ''}?`)) return;
  try {
    await schedulesStore.deleteSchedule(id);
    if (cls) logAudit('schedule_deleted', `Deleted class: ${cls.courseCode} — ${cls.courseTitle} | ${cls.day} ${formatTime(cls.startTime)}-${formatTime(cls.endTime)} | ${cls.lecturer} | ${cls.venue}`);
  } catch (error) {
    console.error('Error deleting schedule:', error);
    alert('Failed to delete schedule.');
  }
};
</script>