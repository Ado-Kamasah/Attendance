<template>
  <div class="space-y-8 p-1 sm:p-2 lg:p-4 animate-in fade-in duration-500">

    <!-- Header & Metric Cards -->
    <div class="relative bg-white dark:bg-dark-surface border border-slate-200/80 dark:border-dark-outline/60 rounded-2xl p-6 sm:p-8 shadow-sm overflow-hidden">
      <div class="absolute inset-0 bg-[radial-gradient(#031c45_1px,transparent_1px)] dark:bg-[radial-gradient(#bc9333_1px,transparent_1px)] opacity-[0.03] dark:opacity-[0.05] bg-[size:16px_16px] pointer-events-none"></div>
      <div class="absolute top-2 left-2 w-3 h-3 border-t-2 border-l-2 border-secondary/40 pointer-events-none"></div>
      <div class="absolute top-2 right-2 w-3 h-3 border-t-2 border-r-2 border-secondary/40 pointer-events-none"></div>

      <div class="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-5">
        <div>
          <div class="flex items-center gap-2 mb-1.5">
            <span class="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-mono font-medium tracking-wide uppercase bg-primary/10 text-primary dark:bg-secondary/15 dark:text-secondary border border-primary/20 dark:border-secondary/30">
              <Building2 class="w-3.5 h-3.5" />
              ADMIN // FACULTY & CURRICULUM REGISTRY
            </span>
          </div>
          <h1 class="text-2xl sm:text-3xl font-display font-bold text-slate-900 dark:text-white tracking-tight">Faculty & Course Directory</h1>
          <p class="text-sm text-slate-500 dark:text-white/75 mt-1">Manage university faculties and add or assign academic courses directly under each faculty.</p>
        </div>

        <!-- Quick Stats -->
        <div class="flex items-center gap-3 self-start md:self-auto">
          <div class="px-3.5 py-2 rounded-xl bg-slate-50 dark:bg-dark-muted/60 border border-slate-200 dark:border-dark-outline/60 text-center">
            <div class="text-[10px] font-mono uppercase text-slate-400">Faculties</div>
            <div class="text-lg font-bold text-slate-900 dark:text-white font-mono">{{ allFacultiesList.length }}</div>
          </div>
          <div class="px-3.5 py-2 rounded-xl bg-secondary/10 border border-secondary/30 text-center">
            <div class="text-[10px] font-mono uppercase text-secondary">Total Courses</div>
            <div class="text-lg font-bold text-secondary font-mono">{{ coursesList.length }}</div>
          </div>
        </div>
      </div>
    </div>

    <!-- Add / Edit Faculty Form -->
    <div class="bg-white dark:bg-dark-surface border border-slate-200/80 dark:border-dark-outline/60 rounded-2xl p-6 shadow-sm">
      <h3 class="text-sm font-display font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
        <component :is="editingFacultyId ? Edit3 : Plus" class="w-4 h-4 text-secondary" />
        {{ editingFacultyId ? 'Update Faculty Name' : 'Register New Faculty' }}
      </h3>
      <form @submit.prevent="handleAddFaculty">
        <div class="flex flex-col sm:flex-row gap-3">
          <input
            type="text"
            v-model="newFacultyName"
            :placeholder="editingFacultyId ? 'Update faculty name...' : 'e.g., School of Medicine & Allied Sciences'"
            required
            class="flex-1 bg-slate-50 dark:bg-dark-muted/80 border border-slate-200 dark:border-dark-outline/70 rounded-xl px-4 py-2.5 text-sm text-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-secondary/50 focus:border-secondary transition-all placeholder:text-slate-400"
          />
          <div class="flex gap-2">
            <button v-if="editingFacultyId" type="button" @click="cancelEdit"
              class="px-4 py-2.5 rounded-xl border border-slate-200 dark:border-dark-outline/70 text-sm font-semibold text-slate-700 dark:text-white/90 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors whitespace-nowrap">
              Cancel
            </button>
            <button type="submit" :disabled="isAdding"
              class="px-5 py-2.5 rounded-xl bg-primary hover:bg-primary/90 text-white text-sm font-semibold transition-all shadow-md inline-flex items-center gap-2 disabled:opacity-50 active:scale-95 whitespace-nowrap"
            >
              <Loader2 v-if="isAdding" class="w-4 h-4 animate-spin" />
              <span>{{ isAdding ? 'Saving...' : (editingFacultyId ? 'Update Faculty' : 'Add Faculty') }}</span>
            </button>
          </div>
        </div>

        <div v-if="errorMsg" class="mt-3 text-xs text-rose-600 dark:text-rose-400 flex items-center gap-1.5">
          <AlertCircle class="w-3.5 h-3.5 flex-shrink-0" /> {{ errorMsg }}
        </div>
        <div v-if="successMsg" class="mt-3 text-xs text-emerald-600 dark:text-emerald-400 flex items-center gap-1.5">
          <CheckCircle2 class="w-3.5 h-3.5 flex-shrink-0" /> {{ successMsg }}
        </div>
      </form>
    </div>

    <!-- Search & Filter Bar -->
    <div class="bg-white dark:bg-dark-surface border border-slate-200/80 dark:border-dark-outline/60 rounded-2xl p-4 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-3">
      <div class="relative w-full sm:w-80">
        <Search class="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
        <input
          type="text"
          v-model="searchQuery"
          placeholder="Search faculty or course..."
          class="w-full pl-9 pr-3 py-2 bg-slate-50 dark:bg-dark-muted/80 border border-slate-200 dark:border-dark-outline/70 rounded-xl text-xs text-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-secondary/50"
        />
      </div>

      <div class="flex items-center gap-2 self-end sm:self-auto text-xs text-slate-500 dark:text-white/70 font-mono">
        <button
          @click="toggleExpandAll"
          class="px-3 py-1.5 rounded-xl border border-slate-200 dark:border-dark-outline/70 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
        >
          {{ areAllExpanded ? 'Collapse All Courses' : 'Expand All Courses' }}
        </button>
        <button
          @click="openAddCourseModal(null)"
          class="px-3.5 py-1.5 rounded-xl bg-secondary/15 hover:bg-secondary/25 text-secondary border border-secondary/40 font-semibold transition-all inline-flex items-center gap-1.5 active:scale-95"
        >
          <BookPlus class="w-3.5 h-3.5" />
          <span>Add Course</span>
        </button>
      </div>
    </div>

    <!-- Faculties Directory with Courses Accordion -->
    <div class="space-y-4">
      <!-- Loading State -->
      <div v-if="isLoading" class="bg-white dark:bg-dark-surface border border-slate-200 dark:border-dark-outline rounded-2xl p-16 flex flex-col items-center justify-center">
        <Loader2 class="w-8 h-8 text-secondary animate-spin mb-3" />
        <span class="text-xs font-mono text-slate-500 dark:text-white/75">LOADING FACULTIES & COURSES...</span>
      </div>

      <!-- Empty State -->
      <div v-else-if="filteredFaculties.length === 0" class="bg-white dark:bg-dark-surface border border-slate-200 dark:border-dark-outline rounded-2xl p-12 text-center text-slate-400 text-sm">
        No faculties found matching "{{ searchQuery }}".
      </div>

      <!-- Faculty Card / Accordion -->
      <div
        v-else
        v-for="faculty in filteredFaculties"
        :key="faculty.key"
        class="bg-white dark:bg-dark-surface border border-slate-200/80 dark:border-dark-outline/60 rounded-2xl shadow-sm overflow-hidden transition-all duration-200"
        :class="{ 'ring-2 ring-secondary/30': editingFacultyId === faculty.id }"
      >
        <!-- Faculty Header Row -->
        <div class="p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-50/40 dark:bg-dark-muted/20 border-b border-slate-100 dark:border-dark-outline/50">
          <div class="flex items-center gap-3.5 flex-1 min-w-0">
            <div class="w-10 h-10 rounded-xl bg-primary/10 dark:bg-secondary/15 border border-primary/20 dark:border-secondary/30 text-primary dark:text-secondary flex items-center justify-center font-bold text-sm uppercase shrink-0">
              {{ faculty.name.charAt(0) }}
            </div>
            <div class="min-w-0">
              <div class="flex items-center gap-2 flex-wrap">
                <h4 class="font-display font-bold text-base text-slate-900 dark:text-white truncate" :title="faculty.name">
                  {{ faculty.name }}
                </h4>
                <span v-if="faculty.isOfficial" class="text-[9px] font-mono px-2 py-0.5 rounded-full bg-primary/10 text-primary dark:bg-secondary/15 dark:text-secondary border border-primary/20 dark:border-secondary/30 font-semibold uppercase">
                  Official School
                </span>
                <span v-if="editingFacultyId === faculty.id" class="text-[9px] font-mono px-2 py-0.5 rounded-full bg-secondary/20 text-secondary border border-secondary/40 font-semibold uppercase">
                  Editing
                </span>
              </div>
              <p class="text-xs text-slate-400 mt-0.5 flex items-center gap-2">
                <span>{{ faculty.programmes.length }} registered department(s)</span>
                <span>&bull;</span>
                <span class="font-mono text-secondary font-semibold">{{ getFacultyCourses(faculty.name).length }} course(s) under this faculty</span>
              </p>
            </div>
          </div>

          <!-- Actions on Faculty Header -->
          <div class="flex items-center gap-2 self-end sm:self-auto shrink-0">
            <!-- Add Course Button -->
            <button
              @click="openAddCourseModal(faculty)"
              :id="'btn-add-course-' + faculty.key"
              class="px-3 py-1.5 rounded-xl bg-secondary/15 hover:bg-secondary/25 text-secondary border border-secondary/40 text-xs font-semibold transition-all inline-flex items-center gap-1.5 cursor-pointer active:scale-95 shadow-xs"
              title="Add a new course under this faculty"
            >
              <BookPlus class="w-3.5 h-3.5" />
              <span>Add Course</span>
            </button>

            <!-- Toggle Expand Courses -->
            <button
              @click="toggleFacultyExpand(faculty.key)"
              :id="'btn-toggle-' + faculty.key"
              class="px-3 py-1.5 rounded-xl border border-slate-200 dark:border-dark-outline/70 hover:bg-slate-100 dark:hover:bg-slate-800 text-xs font-medium text-slate-700 dark:text-white/80 transition-colors inline-flex items-center gap-1"
            >
              <span>{{ isFacultyExpanded(faculty.key) ? 'Hide Courses' : 'View Courses' }}</span>
              <component :is="isFacultyExpanded(faculty.key) ? ChevronUp : ChevronDown" class="w-3.5 h-3.5 text-slate-400" />
            </button>

            <!-- Edit Faculty Button -->
            <button
              v-if="faculty.id"
              @click="editFaculty(faculty)"
              aria-label="Edit faculty"
              class="p-1.5 text-slate-400 hover:text-primary dark:hover:text-secondary hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
              title="Edit faculty name"
            >
              <Edit3 class="w-3.5 h-3.5" />
            </button>

            <!-- Delete Faculty Button -->
            <button
              v-if="faculty.id"
              @click="deleteFaculty(faculty.id)"
              aria-label="Delete faculty"
              class="p-1.5 text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/40 rounded-lg transition-colors"
              title="Delete custom faculty"
            >
              <Trash2 class="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        <!-- Expanded Courses Section -->
        <div v-show="isFacultyExpanded(faculty.key)" class="p-5 bg-white dark:bg-dark-surface animate-in fade-in duration-200">
          <div class="flex items-center justify-between mb-3.5">
            <span class="text-xs font-mono uppercase tracking-wider text-slate-500 dark:text-white/70 font-semibold flex items-center gap-1.5">
              <BookOpen class="w-3.5 h-3.5 text-secondary" />
              COURSES OFFERED UNDER {{ faculty.name.toUpperCase() }} ({{ getFacultyCourses(faculty.name).length }})
            </span>
            <button
              @click="openAddCourseModal(faculty)"
              class="text-xs text-secondary hover:underline font-mono inline-flex items-center gap-1"
            >
              <Plus class="w-3 h-3" /> Add course to this faculty
            </button>
          </div>

          <!-- Courses Table / List -->
          <div v-if="getFacultyCourses(faculty.name).length > 0" class="overflow-x-auto border border-slate-100 dark:border-dark-outline/60 rounded-xl">
            <table class="w-full text-left border-collapse text-xs">
              <thead>
                <tr class="bg-slate-50 dark:bg-dark-muted/50 border-b border-slate-100 dark:border-dark-outline text-slate-500 dark:text-white/75 font-mono uppercase text-[10px] tracking-wider">
                  <th class="py-2.5 px-3 font-semibold">Course Code</th>
                  <th class="py-2.5 px-3 font-semibold">Course Title</th>
                  <th class="py-2.5 px-3 font-semibold">Department / Programme</th>
                  <th class="py-2.5 px-3 font-semibold">Level</th>
                  <th class="py-2.5 px-3 font-semibold">Semester</th>
                  <th class="py-2.5 px-3 font-semibold">Credits</th>
                  <th class="py-2.5 px-3 font-semibold text-right">Actions</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-slate-100 dark:divide-slate-800/60 font-sans">
                <tr
                  v-for="course in getFacultyCourses(faculty.name)"
                  :key="course.id || course.code"
                  class="hover:bg-slate-50/60 dark:hover:bg-slate-800/30 transition-colors"
                >
                  <!-- Code -->
                  <td class="py-3 px-3">
                    <span class="font-mono text-xs font-bold px-2 py-0.5 rounded bg-primary/10 text-primary dark:bg-secondary/15 dark:text-secondary">
                      {{ course.code }}
                    </span>
                  </td>

                  <!-- Name -->
                  <td class="py-3 px-3 font-medium text-slate-900 dark:text-white">
                    {{ course.name }}
                  </td>

                  <!-- Programme -->
                  <td class="py-3 px-3 text-slate-600 dark:text-white/80">
                    <span class="truncate max-w-[200px] inline-block font-mono text-[11px]" :title="course.program || course.programId">
                      {{ course.program || course.programId || 'General' }}
                    </span>
                  </td>

                  <!-- Level -->
                  <td class="py-3 px-3 font-mono text-slate-500 dark:text-white/70">
                    L{{ course.level || '100' }}
                  </td>

                  <!-- Semester -->
                  <td class="py-3 px-3 text-slate-500 dark:text-white/70">
                    {{ course.semester || 'Semester 1' }}
                  </td>

                  <!-- Credits -->
                  <td class="py-3 px-3 font-mono font-semibold text-slate-700 dark:text-white/80">
                    {{ course.credits || 3 }} cr
                  </td>

                  <!-- Actions -->
                  <td class="py-3 px-3 text-right">
                    <button
                      @click="openEditCourseModal(course, faculty)"
                      class="p-1 text-slate-400 hover:text-primary dark:hover:text-secondary hover:bg-slate-100 dark:hover:bg-slate-800 rounded transition-colors"
                      title="Edit Course"
                    >
                      <Edit3 class="w-3.5 h-3.5" />
                    </button>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          <!-- Empty Courses Placeholder -->
          <div v-else class="p-8 text-center border border-dashed border-slate-200 dark:border-dark-outline/70 rounded-xl bg-slate-50/50 dark:bg-dark-muted/20">
            <BookOpen class="w-8 h-8 text-slate-300 dark:text-white/20 mx-auto mb-2" />
            <p class="text-xs text-slate-500 dark:text-white/70 font-medium">No courses added under this faculty yet.</p>
            <p class="text-[11px] text-slate-400 mt-0.5">Add courses to assign them to {{ faculty.name }}.</p>
            <button
              @click="openAddCourseModal(faculty)"
              class="mt-3 px-3 py-1.5 rounded-xl bg-secondary/15 hover:bg-secondary/25 text-secondary border border-secondary/40 text-xs font-semibold transition-all inline-flex items-center gap-1.5 active:scale-95"
            >
              <Plus class="w-3.5 h-3.5" />
              <span>Add First Course</span>
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- ========================================================== -->
    <!-- MODAL: ADD / EDIT COURSE UNDER FACULTY                    -->
    <!-- ========================================================== -->
    <div
      v-if="isCourseModalOpen"
      class="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 overflow-y-auto"
      @click.self="closeCourseModal"
    >
      <div class="relative bg-white dark:bg-dark-surface border border-slate-200/90 dark:border-dark-outline rounded-3xl w-full max-w-xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200 my-8">
        
        <!-- Modal Header -->
        <div class="p-6 border-b border-slate-100 dark:border-dark-outline/70 flex items-center justify-between bg-slate-50/50 dark:bg-dark-muted/30">
          <div class="flex items-center gap-2.5">
            <div class="w-9 h-9 rounded-xl bg-secondary/15 text-secondary flex items-center justify-center border border-secondary/30">
              <BookPlus class="w-4 h-4" />
            </div>
            <div>
              <h3 class="text-base font-display font-bold text-slate-900 dark:text-white">
                {{ isEditingCourse ? 'Edit Course under Faculty' : 'Add Course under Faculty' }}
              </h3>
              <p class="text-xs text-slate-400">
                Register or update a course for <span class="font-semibold text-secondary">{{ targetFacultyName }}</span>
              </p>
            </div>
          </div>
          <button
            @click="closeCourseModal"
            class="p-1.5 rounded-xl text-slate-400 hover:text-slate-700 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <X class="w-4 h-4" />
          </button>
        </div>

        <!-- Form -->
        <form @submit.prevent="handleSaveCourse" class="p-6 space-y-4">
          
          <!-- Faculty Selector / Badge -->
          <div class="space-y-1.5">
            <label class="text-[11px] font-mono uppercase tracking-wider text-slate-500 dark:text-white/75 font-semibold">
              Assigned Faculty / School <span class="text-rose-500">*</span>
            </label>
            <select
              v-model="courseForm.faculty"
              @change="onModalFacultyChange"
              required
              class="w-full bg-slate-50 dark:bg-dark-muted/80 border border-slate-200 dark:border-dark-outline/70 rounded-xl px-3 py-2.5 text-xs sm:text-sm text-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-secondary/50"
            >
              <option v-for="fac in allFacultiesList" :key="fac.name" :value="fac.name">
                {{ fac.name }}
              </option>
            </select>
          </div>

          <!-- Department / Programme under this Faculty -->
          <div class="space-y-1.5">
            <div class="flex items-center justify-between">
              <label class="text-[11px] font-mono uppercase tracking-wider text-slate-500 dark:text-white/75 font-semibold">
                Department / Programme <span class="text-rose-500">*</span>
              </label>
              <button
                type="button"
                @click="customProgramMode = !customProgramMode"
                class="text-[10px] text-secondary hover:underline font-mono"
              >
                {{ customProgramMode ? 'Select from list' : '+ Custom programme' }}
              </button>
            </div>

            <!-- List select -->
            <select
              v-if="!customProgramMode"
              v-model="courseForm.program"
              required
              class="w-full bg-slate-50 dark:bg-dark-muted/80 border border-slate-200 dark:border-dark-outline/70 rounded-xl px-3 py-2.5 text-xs sm:text-sm text-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-secondary/50"
            >
              <option value="" disabled>Select Department Programme</option>
              <option v-for="prog in modalAvailableProgrammes" :key="prog" :value="prog">
                {{ prog }}
              </option>
            </select>

            <!-- Custom text input -->
            <input
              v-else
              type="text"
              v-model="courseForm.program"
              placeholder="e.g., BSc Software Engineering"
              required
              class="w-full bg-slate-50 dark:bg-dark-muted/80 border border-slate-200 dark:border-dark-outline/70 rounded-xl px-3 py-2.5 text-xs sm:text-sm text-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-secondary/50"
            />
          </div>

          <!-- Course Code & Name Grid -->
          <div class="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div class="space-y-1.5 sm:col-span-1">
              <label class="text-[11px] font-mono uppercase tracking-wider text-slate-500 dark:text-white/75 font-semibold">
                Course Code <span class="text-rose-500">*</span>
              </label>
              <input
                type="text"
                v-model="courseForm.code"
                placeholder="e.g. BBA 102"
                required
                class="w-full bg-slate-50 dark:bg-dark-muted/80 border border-slate-200 dark:border-dark-outline/70 rounded-xl px-3 py-2.5 text-xs sm:text-sm text-slate-800 dark:text-white font-mono uppercase focus:outline-none focus:ring-2 focus:ring-secondary/50"
              />
            </div>

            <div class="space-y-1.5 sm:col-span-2">
              <label class="text-[11px] font-mono uppercase tracking-wider text-slate-500 dark:text-white/75 font-semibold">
                Course Title / Name <span class="text-rose-500">*</span>
              </label>
              <input
                type="text"
                v-model="courseForm.name"
                placeholder="e.g. Financial Management & Reporting"
                required
                class="w-full bg-slate-50 dark:bg-dark-muted/80 border border-slate-200 dark:border-dark-outline/70 rounded-xl px-3 py-2.5 text-xs sm:text-sm text-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-secondary/50"
              />
            </div>
          </div>

          <!-- Level, Semester, Credits Grid -->
          <div class="grid grid-cols-3 gap-3">
            <div class="space-y-1.5">
              <label class="text-[11px] font-mono uppercase tracking-wider text-slate-500 dark:text-white/75 font-semibold">
                Level <span class="text-rose-500">*</span>
              </label>
              <select
                v-model="courseForm.level"
                required
                class="w-full bg-slate-50 dark:bg-dark-muted/80 border border-slate-200 dark:border-dark-outline/70 rounded-xl px-3 py-2.5 text-xs sm:text-sm text-slate-800 dark:text-white font-mono focus:outline-none focus:ring-2 focus:ring-secondary/50"
              >
                <option value="100">Level 100</option>
                <option value="200">Level 200</option>
                <option value="300">Level 300</option>
                <option value="400">Level 400</option>
                <option value="500">Level 500</option>
                <option value="600">Level 600</option>
                <option value="700">Level 700</option>
              </select>
            </div>

            <div class="space-y-1.5">
              <label class="text-[11px] font-mono uppercase tracking-wider text-slate-500 dark:text-white/75 font-semibold">
                Semester <span class="text-rose-500">*</span>
              </label>
              <select
                v-model="courseForm.semester"
                required
                class="w-full bg-slate-50 dark:bg-dark-muted/80 border border-slate-200 dark:border-dark-outline/70 rounded-xl px-3 py-2.5 text-xs sm:text-sm text-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-secondary/50"
              >
                <option value="Semester 1">Semester 1</option>
                <option value="Semester 2">Semester 2</option>
              </select>
            </div>

            <div class="space-y-1.5">
              <label class="text-[11px] font-mono uppercase tracking-wider text-slate-500 dark:text-white/75 font-semibold">
                Credits <span class="text-rose-500">*</span>
              </label>
              <input
                type="number"
                min="1"
                max="12"
                v-model.number="courseForm.credits"
                required
                class="w-full bg-slate-50 dark:bg-dark-muted/80 border border-slate-200 dark:border-dark-outline/70 rounded-xl px-3 py-2.5 text-xs sm:text-sm text-slate-800 dark:text-white font-mono focus:outline-none focus:ring-2 focus:ring-secondary/50"
              />
            </div>
          </div>

          <!-- Error Feedback -->
          <div v-if="courseModalError" class="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 text-xs text-rose-600 dark:text-rose-400 flex items-center gap-2">
            <AlertCircle class="w-4 h-4 shrink-0" />
            <span>{{ courseModalError }}</span>
          </div>

          <!-- Footer Actions -->
          <div class="pt-2 flex items-center justify-end gap-2.5">
            <button
              type="button"
              @click="closeCourseModal"
              class="px-4 py-2.5 rounded-xl border border-slate-200 dark:border-dark-outline/70 text-xs font-semibold text-slate-700 dark:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              :disabled="isSavingCourse"
              class="px-5 py-2.5 rounded-xl bg-primary hover:bg-primary/90 text-white text-xs font-semibold transition-all shadow-md inline-flex items-center gap-2 disabled:opacity-50 active:scale-95"
            >
              <Loader2 v-if="isSavingCourse" class="w-3.5 h-3.5 animate-spin" />
              <span>{{ isSavingCourse ? 'Saving Course...' : (isEditingCourse ? 'Update Course' : 'Create Course') }}</span>
            </button>
          </div>
        </form>
      </div>
    </div>

  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue';
import { storeToRefs } from 'pinia';
import { useFacultiesStore } from '@/stores/faculties';
import { useCoursesStore } from '@/stores/courses';
import { useAuditLogsStore } from '@/stores/auditlogs';
import { supabase } from '@/stores/supabase';
import {
  OFFICIAL_FACULTIES,
  FACULTY_PROGRAMME_MAP,
  getProgrammesForFaculty,
  getFacultyForProgramme,
  resolveOfficialFaculty
} from '@/utils/academicRelationships';
import {
  Building2,
  Plus,
  Edit3,
  Trash2,
  Loader2,
  AlertCircle,
  CheckCircle2,
  BookOpen,
  BookPlus,
  ChevronDown,
  ChevronUp,
  Search,
  X
} from 'lucide-vue-next';

const facultiesStore = useFacultiesStore();
const coursesStore = useCoursesStore();
const auditLogsStore = useAuditLogsStore();

const { faculties, isLoading } = storeToRefs(facultiesStore);
const { courses: rawCourses } = storeToRefs(coursesStore);

const newFacultyName = ref('');
const editingFacultyId = ref(null);
const isAdding = ref(false);
const errorMsg = ref('');
const successMsg = ref('');
const currentUser = ref(null);

const searchQuery = ref('');
const expandedFaculties = ref(new Set());

// ==========================================
// COURSES UNDER FACULTY MODAL STATE
// ==========================================
const isCourseModalOpen = ref(false);
const isEditingCourse = ref(false);
const editingCourseId = ref(null);
const isSavingCourse = ref(false);
const courseModalError = ref('');
const customProgramMode = ref(false);

const courseForm = ref({
  faculty: '',
  program: '',
  code: '',
  name: '',
  level: '100',
  semester: 'Semester 1',
  credits: 3,
  status: 'active'
});

const targetFacultyName = computed(() => courseForm.value.faculty || 'Selected Faculty');

// Modal cascading programmes
const modalAvailableProgrammes = computed(() => {
  return getProgrammesForFaculty(courseForm.value.faculty);
});

const onModalFacultyChange = () => {
  const progs = modalAvailableProgrammes.value;
  if (!progs.includes(courseForm.value.program)) {
    courseForm.value.program = progs[0] || '';
  }
};

// ==========================================
// UNIFIED FACULTIES & COURSES LIST
// ==========================================
const coursesList = computed(() => coursesStore.courses || []);

// Unified faculties list combining official schools with custom faculties in store
const allFacultiesList = computed(() => {
  const map = new Map();

  // 1. First add Official University Faculties
  OFFICIAL_FACULTIES.forEach((name) => {
    const key = name.toLowerCase().replace(/[^a-z0-9]/g, '');
    map.set(key, {
      id: null,
      name,
      key,
      isOfficial: true,
      programmes: getProgrammesForFaculty(name)
    });
  });

  // 2. Add / Merge faculties from Supabase faculties table
  (faculties.value || []).forEach((f) => {
    if (!f.name) return;
    const resolvedName = resolveOfficialFaculty(f.name);
    const key = (resolvedName || f.name).toLowerCase().replace(/[^a-z0-9]/g, '');
    const existing = map.get(key);
    if (existing) {
      existing.id = f.id;
    } else {
      map.set(key, {
        id: f.id,
        name: f.name,
        key,
        isOfficial: false,
        programmes: getProgrammesForFaculty(f.name)
      });
    }
  });

  return Array.from(map.values()).sort((a, b) => a.name.localeCompare(b.name));
});

// Helper: which courses belong to a given faculty name
const getFacultyCourses = (facultyName) => {
  if (!facultyName) return [];
  const targetNorm = facultyName.toLowerCase().replace(/[^a-z0-9]/g, '');
  const targetResolved = resolveOfficialFaculty(facultyName);

  return coursesList.value.filter((course) => {
    // 1. Direct faculty property match
    if (course.faculty) {
      const cFacNorm = course.faculty.toLowerCase().replace(/[^a-z0-9]/g, '');
      if (cFacNorm === targetNorm) return true;
      if (resolveOfficialFaculty(course.faculty) === targetResolved) return true;
    }

    // 2. Match by course's programme
    const prog = course.program || course.programId;
    if (prog) {
      const progFac = getFacultyForProgramme(prog);
      if (resolveOfficialFaculty(progFac) === targetResolved) return true;
      const validProgs = getProgrammesForFaculty(facultyName);
      if (validProgs.some(p => p.toLowerCase() === prog.toLowerCase())) return true;
    }

    return false;
  });
};

// Filtered faculties by search query (matches faculty name, programme, or course code/name)
const filteredFaculties = computed(() => {
  const q = searchQuery.value.trim().toLowerCase();
  if (!q) return allFacultiesList.value;

  return allFacultiesList.value.filter((fac) => {
    if (fac.name.toLowerCase().includes(q)) return true;
    if (fac.programmes.some(p => p.toLowerCase().includes(q))) return true;
    const courses = getFacultyCourses(fac.name);
    return courses.some(c => (c.code || '').toLowerCase().includes(q) || (c.name || '').toLowerCase().includes(q));
  });
});

// Accordion Expand / Collapse
const isFacultyExpanded = (key) => expandedFaculties.value.has(key);

const toggleFacultyExpand = (key) => {
  if (expandedFaculties.value.has(key)) {
    expandedFaculties.value.delete(key);
  } else {
    expandedFaculties.value.add(key);
  }
};

const areAllExpanded = computed(() => {
  return filteredFaculties.value.length > 0 &&
    filteredFaculties.value.every(f => expandedFaculties.value.has(f.key));
});

const toggleExpandAll = () => {
  if (areAllExpanded.value) {
    expandedFaculties.value.clear();
  } else {
    filteredFaculties.value.forEach(f => expandedFaculties.value.add(f.key));
  }
};

// ==========================================
// COURSE MODAL ACTIONS
// ==========================================
const openAddCourseModal = (faculty = null) => {
  isEditingCourse.value = false;
  editingCourseId.value = null;
  courseModalError.value = '';
  customProgramMode.value = false;

  const defaultFac = faculty?.name || allFacultiesList.value[0]?.name || OFFICIAL_FACULTIES[0];
  const progs = getProgrammesForFaculty(defaultFac);

  courseForm.value = {
    faculty: defaultFac,
    program: progs[0] || '',
    code: '',
    name: '',
    level: '100',
    semester: 'Semester 1',
    credits: 3,
    status: 'active'
  };

  if (faculty?.key) {
    expandedFaculties.value.add(faculty.key);
  }

  isCourseModalOpen.value = true;
};

const openEditCourseModal = (course, faculty) => {
  isEditingCourse.value = true;
  editingCourseId.value = course.id;
  courseModalError.value = '';
  customProgramMode.value = false;

  const defaultFac = faculty?.name || course.faculty || resolveOfficialFaculty(getFacultyForProgramme(course.program));

  courseForm.value = {
    faculty: defaultFac,
    program: course.program || course.programId || '',
    code: course.code,
    name: course.name,
    level: course.level || '100',
    semester: course.semester || 'Semester 1',
    credits: course.credits || 3,
    status: course.status || 'active'
  };

  isCourseModalOpen.value = true;
};

const closeCourseModal = () => {
  isCourseModalOpen.value = false;
  courseModalError.value = '';
  editingCourseId.value = null;
};

const handleSaveCourse = async () => {
  courseModalError.value = '';
  isSavingCourse.value = true;

  try {
    const cleanCode = courseForm.value.code.trim().toUpperCase();
    const cleanName = courseForm.value.name.trim();
    const cleanProgram = courseForm.value.program.trim();
    const cleanFaculty = courseForm.value.faculty.trim();

    if (!cleanCode || !cleanName) {
      courseModalError.value = 'Please provide both Course Code and Course Name.';
      isSavingCourse.value = false;
      return;
    }

    if (!cleanProgram) {
      courseModalError.value = 'Please select or provide a department programme.';
      isSavingCourse.value = false;
      return;
    }

    const payload = {
      code: cleanCode,
      name: cleanName,
      program: cleanProgram,
      programId: cleanProgram,
      faculty: cleanFaculty,
      level: courseForm.value.level,
      semester: courseForm.value.semester,
      credits: parseInt(courseForm.value.credits, 10),
      status: courseForm.value.status || 'active'
    };

    if (isEditingCourse.value && editingCourseId.value) {
      await coursesStore.updateCourse(editingCourseId.value, payload);
      logAudit('course_updated_under_faculty', `Updated course "${cleanCode} — ${cleanName}" under faculty "${cleanFaculty}"`);
      successMsg.value = `Course ${cleanCode} updated successfully!`;
    } else {
      await coursesStore.createCourse(payload);
      logAudit('course_created_under_faculty', `Added course "${cleanCode} — ${cleanName}" to faculty "${cleanFaculty}"`);
      successMsg.value = `Course ${cleanCode} created successfully under ${cleanFaculty}!`;
    }

    // Ensure target faculty is expanded to see the new course
    const targetKey = cleanFaculty.toLowerCase().replace(/[^a-z0-9]/g, '');
    expandedFaculties.value.add(targetKey);

    closeCourseModal();
    setTimeout(() => { successMsg.value = ''; }, 3500);
  } catch (err) {
    console.error('Failed to save course under faculty:', err);
    courseModalError.value = err.message || 'Failed to save course under faculty.';
  } finally {
    isSavingCourse.value = false;
  }
};

// ==========================================
// AUDIT & USER CONTEXT
// ==========================================
const loadCurrentUser = async () => {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return;
  const { data, error } = await supabase.from('users').select('id, name, role').eq('id', user.id).single();
  if (!error) currentUser.value = data;
};

const logAudit = (action, details) => {
  if (!currentUser.value) return;
  auditLogsStore.logAction({ action, details, userId: currentUser.value.id, userRole: currentUser.value.role, userName: currentUser.value.name });
};

// ==========================================
// FACULTY CRUD
// ==========================================
const handleAddFaculty = async () => {
  if (!newFacultyName.value.trim()) return;
  isAdding.value = true;
  errorMsg.value = '';
  successMsg.value = '';
  const name = newFacultyName.value.trim();
  try {
    if (editingFacultyId.value) {
      await facultiesStore.updateFaculty(editingFacultyId.value, { name });
      logAudit('faculty_updated', `Renamed faculty to "${name}"`);
      successMsg.value = 'Faculty updated successfully!';
    } else {
      await facultiesStore.createFaculty({ name });
      logAudit('faculty_created', `Added faculty "${name}"`);
      successMsg.value = 'Faculty added successfully!';
    }
    faculties.value.sort((a, b) => a.name.localeCompare(b.name));
    cancelEdit();
    setTimeout(() => { successMsg.value = ''; }, 3000);
  } catch (error) {
    console.error('Error saving faculty:', error);
    errorMsg.value = error.message || 'Failed to save faculty.';
  } finally {
    isAdding.value = false;
  }
};

const editFaculty = (faculty) => {
  editingFacultyId.value = faculty.id;
  newFacultyName.value = faculty.name;
  errorMsg.value = '';
  successMsg.value = '';
  window.scrollTo({ top: 0, behavior: 'smooth' });
};

const cancelEdit = () => {
  editingFacultyId.value = null;
  newFacultyName.value = '';
  errorMsg.value = '';
};

const deleteFaculty = async (id) => {
  if (!confirm('Are you sure you want to delete this faculty?')) return;
  const faculty = faculties.value.find(f => f.id === id);
  try {
    await facultiesStore.deleteFaculty(id);
    logAudit('faculty_deleted', `Deleted faculty "${faculty?.name ?? ''}"`);
    successMsg.value = `Faculty "${faculty?.name ?? ''}" deleted successfully.`;
    setTimeout(() => { successMsg.value = ''; }, 3000);
  } catch (error) {
    console.error('Error deleting faculty:', error);
    alert('Failed to delete faculty.');
  }
};

// ==========================================
// LIFECYCLE
// ==========================================
onMounted(async () => {
  await Promise.all([
    facultiesStore.fetchFaculties(),
    coursesStore.fetchCourses(),
    loadCurrentUser()
  ]);
  facultiesStore.subscribeToFaculties();

  // Expand the first 3 faculties by default for great UX
  allFacultiesList.value.slice(0, 3).forEach(f => expandedFaculties.value.add(f.key));
});

onUnmounted(() => {
  facultiesStore.unsubscribeFromFaculties();
});
</script>
