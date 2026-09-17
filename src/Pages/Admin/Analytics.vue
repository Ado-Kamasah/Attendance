<template>
  <div class="space-y-8 p-1 sm:p-2 lg:p-4 animate-in fade-in duration-500">
    <!-- Header with Blueprint Eyebrow -->
    <div class="relative overflow-hidden rounded-2xl bg-white dark:bg-[#071328] border border-slate-200/80 dark:border-slate-800/80 p-6 sm:p-8 shadow-sm">
      <div class="absolute inset-0 bg-[radial-gradient(#031c45_1px,transparent_1px)] dark:bg-[radial-gradient(#ffffff_1px,transparent_1px)] bg-[size:16px_16px] opacity-[0.03] dark:opacity-[0.02] pointer-events-none"></div>
      
      <!-- Blueprint Corner Accents -->
      <div class="absolute top-0 left-0 w-3 h-3 border-t-2 border-l-2 border-secondary/40"></div>
      <div class="absolute top-0 right-0 w-3 h-3 border-t-2 border-r-2 border-secondary/40"></div>
      <div class="absolute bottom-0 left-0 w-3 h-3 border-b-2 border-l-2 border-secondary/40"></div>
      <div class="absolute bottom-0 right-0 w-3 h-3 border-b-2 border-r-2 border-secondary/40"></div>

      <div class="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
        <div>
          <div class="inline-flex items-center gap-2 px-2.5 py-1 rounded-md bg-secondary/10 border border-secondary/20 text-secondary text-[11px] font-mono uppercase tracking-wider mb-3">
            <BarChart2 class="w-3.5 h-3.5" />
            <span>ATTENDANCE INTELLIGENCE // INSTITUTIONAL AUDIT</span>
          </div>
          <h1 class="text-2xl sm:text-3xl font-extrabold font-display tracking-tight text-slate-900 dark:text-white">
            Attendance <span class="text-secondary">Analytics</span>
          </h1>
          <p class="text-xs sm:text-sm font-mono text-slate-500 dark:text-slate-400 mt-1">
            Complete institutional rollcall statistics across all courses, programmes, and students
          </p>
        </div>

        <div class="flex flex-wrap items-center gap-3">
          <select 
            v-model="selectedCourseFilter" 
            id="course-filter"
            class="bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 rounded-xl px-3.5 py-2 text-xs font-mono text-slate-800 dark:text-slate-200 focus:outline-hidden focus:border-secondary shadow-2xs"
          >
            <option value="">All Courses</option>
            <option v-for="c in courses" :key="c.id" :value="c.id">{{ c.name }}</option>
          </select>

          <select 
            v-model="selectedStatusFilter" 
            id="status-filter"
            class="bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 rounded-xl px-3.5 py-2 text-xs font-mono text-slate-800 dark:text-slate-200 focus:outline-hidden focus:border-secondary shadow-2xs"
          >
            <option value="">All Statuses</option>
            <option value="present">Present</option>
            <option value="absent">Absent</option>
          </select>
        </div>
      </div>
    </div>

    <!-- KPI Grid -->
    <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      <!-- Total Students -->
      <div class="relative overflow-hidden rounded-2xl bg-white dark:bg-[#071328] border border-slate-200/80 dark:border-slate-800/80 p-5 shadow-sm group hover:border-secondary/40 transition-all">
        <div class="flex items-center gap-4">
          <div class="w-12 h-12 rounded-xl bg-sky-50 dark:bg-sky-950/40 border border-sky-200/60 dark:border-sky-800/40 text-sky-600 dark:text-sky-400 flex items-center justify-center shrink-0">
            <Users class="w-6 h-6" />
          </div>
          <div class="min-w-0 flex-1">
            <p class="text-[11px] font-mono uppercase text-slate-500 dark:text-slate-400 font-semibold tracking-wider">Enrolled Students</p>
            <h2 class="text-2xl font-black font-display text-slate-900 dark:text-white tracking-tight mt-0.5">
              {{ totalStudents }}
            </h2>
          </div>
        </div>
      </div>

      <!-- Overall Attendance Rate -->
      <div class="relative overflow-hidden rounded-2xl bg-white dark:bg-[#071328] border border-slate-200/80 dark:border-slate-800/80 p-5 shadow-sm group hover:border-secondary/40 transition-all">
        <div class="flex items-center gap-4">
          <div class="w-12 h-12 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200/60 dark:border-emerald-800/40 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0">
            <Percent class="w-6 h-6" />
          </div>
          <div class="min-w-0 flex-1">
            <p class="text-[11px] font-mono uppercase text-slate-500 dark:text-slate-400 font-semibold tracking-wider">Overall Rate</p>
            <h2 class="text-2xl font-black font-display text-emerald-600 dark:text-emerald-400 tracking-tight mt-0.5">
              {{ overallRate }}%
            </h2>
          </div>
        </div>
      </div>

      <!-- Total Sessions -->
      <div class="relative overflow-hidden rounded-2xl bg-white dark:bg-[#071328] border border-slate-200/80 dark:border-slate-800/80 p-5 shadow-sm group hover:border-secondary/40 transition-all">
        <div class="flex items-center gap-4">
          <div class="w-12 h-12 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200/60 dark:border-amber-800/40 text-amber-600 dark:text-amber-400 flex items-center justify-center shrink-0">
            <Calendar class="w-6 h-6" />
          </div>
          <div class="min-w-0 flex-1">
            <p class="text-[11px] font-mono uppercase text-slate-500 dark:text-slate-400 font-semibold tracking-wider">Total Sessions</p>
            <h2 class="text-2xl font-black font-display text-slate-900 dark:text-white tracking-tight mt-0.5">
              {{ sessions.length }}
            </h2>
          </div>
        </div>
      </div>

      <!-- Total Absences -->
      <div class="relative overflow-hidden rounded-2xl bg-white dark:bg-[#071328] border border-slate-200/80 dark:border-slate-800/80 p-5 shadow-sm group hover:border-secondary/40 transition-all">
        <div class="flex items-center gap-4">
          <div class="w-12 h-12 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200/60 dark:border-rose-800/40 text-rose-600 dark:text-rose-400 flex items-center justify-center shrink-0">
            <UserX class="w-6 h-6" />
          </div>
          <div class="min-w-0 flex-1">
            <p class="text-[11px] font-mono uppercase text-slate-500 dark:text-slate-400 font-semibold tracking-wider">Total Absences</p>
            <h2 class="text-2xl font-black font-display text-rose-500 tracking-tight mt-0.5">
              {{ totalAbsences }}
            </h2>
          </div>
        </div>
      </div>
    </div>

    <!-- Course Breakdown Table Panel -->
    <div class="relative overflow-hidden rounded-2xl bg-white dark:bg-[#071328] border border-slate-200/80 dark:border-slate-800/80 shadow-sm">
      <div class="flex items-center justify-between gap-4 p-5 sm:p-6 border-b border-slate-200/80 dark:border-slate-800/80">
        <div>
          <h2 class="text-base font-bold font-display text-slate-900 dark:text-white">Per-Course Attendance Breakdown</h2>
          <p class="text-xs font-mono text-slate-500 dark:text-slate-400 mt-0.5">Aggregated rollcall performance grouped by course module</p>
        </div>
      </div>

      <div class="overflow-x-auto">
        <table class="w-full text-xs text-left text-slate-600 dark:text-slate-400" id="course-breakdown-table">
          <thead class="text-[11px] font-mono uppercase bg-slate-50/80 dark:bg-slate-900/50 text-slate-500 dark:text-slate-400 border-b border-slate-200/80 dark:border-slate-800/80">
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
              <td colspan="6" class="px-5 py-10 text-center text-xs font-mono text-slate-400">
                No data available.
              </td>
            </tr>
            <tr 
              v-for="row in courseBreakdown" 
              :key="row.courseId"
              class="hover:bg-slate-50/70 dark:hover:bg-slate-900/30 transition-colors"
            >
              <td class="px-5 py-4 font-semibold text-slate-800 dark:text-slate-200">
                {{ row.courseName }}
              </td>
              <td class="px-5 py-4 font-mono font-medium text-slate-700 dark:text-slate-300">
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
                <div class="w-full h-1.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
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

    <!-- Per-Student Attendance Breakdown Panel -->
    <div class="relative overflow-hidden rounded-2xl bg-white dark:bg-[#071328] border border-slate-200/80 dark:border-slate-800/80 shadow-sm">
      <div class="flex flex-col lg:flex-row lg:items-center justify-between gap-4 p-5 sm:p-6 border-b border-slate-200/80 dark:border-slate-800/80">
        <div>
          <h2 class="text-base font-bold font-display text-slate-900 dark:text-white">Per-Student Attendance Rate</h2>
          <p class="text-xs font-mono text-slate-500 dark:text-slate-400 mt-0.5">Individual student course engagement and eligibility metrics</p>
        </div>

        <div class="flex flex-wrap items-center gap-2.5">
          <select 
            v-model="studentProgramFilter" 
            id="student-program-filter"
            class="bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-1.5 text-xs font-mono text-slate-800 dark:text-slate-200 focus:outline-hidden focus:border-secondary shadow-2xs"
          >
            <option value="">All Programmes</option>
            <option v-for="p in programmes" :key="p.id" :value="p.id">{{ p.name }}</option>
          </select>

          <select 
            v-model="studentCourseFilter" 
            id="student-course-filter"
            class="bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-1.5 text-xs font-mono text-slate-800 dark:text-slate-200 focus:outline-hidden focus:border-secondary shadow-2xs"
          >
            <option value="">All Courses</option>
            <option v-for="c in courses" :key="c.id" :value="c.id">{{ c.name }}</option>
          </select>

          <div class="relative min-w-[200px]">
            <Search class="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
            <input 
              v-model="studentSearch" 
              type="text" 
              placeholder="Search name or ID…" 
              id="student-search"
              class="w-full pl-8 pr-3 py-1.5 bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 rounded-xl text-xs font-mono text-slate-800 dark:text-slate-200 placeholder:text-slate-400 focus:outline-hidden focus:border-secondary shadow-2xs"
            />
          </div>
        </div>
      </div>

      <div class="overflow-x-auto">
        <table class="w-full text-xs text-left text-slate-600 dark:text-slate-400" id="student-breakdown-table">
          <thead class="text-[11px] font-mono uppercase bg-slate-50/80 dark:bg-slate-900/50 text-slate-500 dark:text-slate-400 border-b border-slate-200/80 dark:border-slate-800/80">
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
              <td colspan="9" class="px-5 py-10 text-center text-xs font-mono text-slate-400">
                No data matches your filters.
              </td>
            </tr>
            <tr 
              v-for="row in paginatedStudentBreakdown" 
              :key="row.key"
              class="hover:bg-slate-50/70 dark:hover:bg-slate-900/30 transition-colors"
            >
              <td class="px-5 py-4 font-semibold text-slate-800 dark:text-slate-200">
                {{ row.studentName }}
              </td>
              <td class="px-5 py-4 font-mono font-medium text-slate-700 dark:text-slate-300">
                {{ row.idNumber }}
              </td>
              <td class="px-5 py-4 text-slate-500 dark:text-slate-400 truncate max-w-[150px]">
                {{ row.programmeName }}
              </td>
              <td class="px-5 py-4 font-medium text-slate-800 dark:text-slate-200">
                {{ row.courseName }}
              </td>
              <td class="px-5 py-4 font-mono font-medium text-slate-700 dark:text-slate-300">
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
                <div class="w-full h-1.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
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

      <!-- Pagination -->
      <div v-if="studentTotalPages > 1" class="flex items-center justify-between gap-4 p-4 sm:p-5 border-t border-slate-200/80 dark:border-slate-800/80 text-xs font-mono">
        <button 
          :disabled="studentPage === 1" 
          @click="studentPage--" 
          id="student-prev-btn"
          class="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 disabled:opacity-40 disabled:cursor-not-allowed hover:border-secondary transition-colors cursor-pointer"
        >
          <ChevronLeft class="w-3.5 h-3.5" />
          <span>Previous</span>
        </button>

        <span class="text-slate-500 dark:text-slate-400">
          Page <strong class="text-slate-800 dark:text-slate-200">{{ studentPage }}</strong> of <strong class="text-slate-800 dark:text-slate-200">{{ studentTotalPages }}</strong>
        </span>

        <button 
          :disabled="studentPage === studentTotalPages" 
          @click="studentPage++" 
          id="student-next-btn"
          class="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 disabled:opacity-40 disabled:cursor-not-allowed hover:border-secondary transition-colors cursor-pointer"
        >
          <span>Next</span>
          <ChevronRight class="w-3.5 h-3.5" />
        </button>
      </div>
    </div>

    <!-- Attendance Records Panel -->
    <div class="relative overflow-hidden rounded-2xl bg-white dark:bg-[#071328] border border-slate-200/80 dark:border-slate-800/80 shadow-sm">
      <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 sm:p-6 border-b border-slate-200/80 dark:border-slate-800/80">
        <div>
          <h2 class="text-base font-bold font-display text-slate-900 dark:text-white">Individual Attendance Records</h2>
          <p class="text-xs font-mono text-slate-500 dark:text-slate-400 mt-0.5">Chronological audit ledger of all student check-in transactions</p>
        </div>

        <div class="relative min-w-[240px]">
          <Search class="w-3.5 h-3.5 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
          <input 
            v-model="searchQuery" 
            type="text" 
            placeholder="Search name, ID, or course…" 
            id="attendance-search"
            class="w-full pl-9 pr-4 py-1.5 bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 rounded-xl text-xs font-mono text-slate-800 dark:text-slate-200 placeholder:text-slate-400 focus:outline-hidden focus:border-secondary shadow-2xs"
          />
        </div>
      </div>

      <div class="overflow-x-auto">
        <table class="w-full text-xs text-left text-slate-600 dark:text-slate-400" id="attendance-records-table">
          <thead class="text-[11px] font-mono uppercase bg-slate-50/80 dark:bg-slate-900/50 text-slate-500 dark:text-slate-400 border-b border-slate-200/80 dark:border-slate-800/80">
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
              <td colspan="6" class="px-5 py-10 text-center text-xs font-mono text-slate-400">
                No records match your filters.
              </td>
            </tr>
            <tr 
              v-for="rec in paginatedAttendances" 
              :key="rec.id"
              class="hover:bg-slate-50/70 dark:hover:bg-slate-900/30 transition-colors"
            >
              <td class="px-5 py-4 font-semibold text-slate-800 dark:text-slate-200">
                {{ rec.studentName }}
              </td>
              <td class="px-5 py-4 font-mono font-medium text-slate-700 dark:text-slate-300">
                {{ rec.idNumber }}
              </td>
              <td class="px-5 py-4 font-medium text-slate-800 dark:text-slate-200">
                {{ rec.courseName }}
              </td>
              <td class="px-5 py-4 font-mono text-slate-600 dark:text-slate-400">
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
              <td class="px-5 py-4 font-mono text-slate-400">
                {{ rec.recordedAt }}
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- Pagination -->
      <div v-if="totalPages > 1" class="flex items-center justify-between gap-4 p-4 sm:p-5 border-t border-slate-200/80 dark:border-slate-800/80 text-xs font-mono">
        <button 
          :disabled="currentPage === 1" 
          @click="currentPage--" 
          id="prev-page-btn"
          class="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 disabled:opacity-40 disabled:cursor-not-allowed hover:border-secondary transition-colors cursor-pointer"
        >
          <ChevronLeft class="w-3.5 h-3.5" />
          <span>Previous</span>
        </button>

        <span class="text-slate-500 dark:text-slate-400">
          Page <strong class="text-slate-800 dark:text-slate-200">{{ currentPage }}</strong> of <strong class="text-slate-800 dark:text-slate-200">{{ totalPages }}</strong>
        </span>

        <button 
          :disabled="currentPage === totalPages" 
          @click="currentPage++" 
          id="next-page-btn"
          class="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 disabled:opacity-40 disabled:cursor-not-allowed hover:border-secondary transition-colors cursor-pointer"
        >
          <span>Next</span>
          <ChevronRight class="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted, watch } from 'vue';
import { storeToRefs } from 'pinia';
import { useAttendancesStore } from '@/stores/attendances';
import { useSessionsStore } from '@/stores/sessions';
import { useCoursesStore } from '@/stores/courses';
import { useEnrollmentsStore } from '@/stores/enrollments';
import { useProgrammesStore } from '@/stores/programmes';
import { supabase } from '@/stores/supabase';
import {
  Users,
  Percent,
  Calendar,
  UserX,
  BarChart2,
  Search,
  ChevronLeft,
  ChevronRight
} from 'lucide-vue-next';

const attendancesStore = useAttendancesStore();
const sessionsStore = useSessionsStore();
const coursesStore = useCoursesStore();
const enrollmentsStore = useEnrollmentsStore();
const programmesStore = useProgrammesStore();

// Map: users.id → { idNumber, name }
const userMap = ref({});

async function loadUsers(ids) {
  const uniqueIds = [...new Set(ids.filter(Boolean))];
  if (uniqueIds.length === 0) return;
  const missing = uniqueIds.filter(id => !userMap.value[id]);
  if (missing.length === 0) return;
  const { data } = await supabase
    .from('users')
    .select('id, name, id_number, program_id')
    .in('id', missing);
  if (data) {
    const updated = { ...userMap.value };
    data.forEach(u => {
      updated[u.id] = { idNumber: u.id_number || '—', name: u.name || '—', programId: u.program_id ?? null };
    });
    userMap.value = updated;
  }
}

const { attendances } = storeToRefs(attendancesStore);
const { sessions } = storeToRefs(sessionsStore);
const { courses } = storeToRefs(coursesStore);
const { enrollments } = storeToRefs(enrollmentsStore);
const { programmes } = storeToRefs(programmesStore);

const selectedCourseFilter = ref('');
const selectedStatusFilter = ref('');
const searchQuery = ref('');
const currentPage = ref(1);
const pageSize = 15;

// Student breakdown filters
const studentProgramFilter = ref('');
const studentCourseFilter = ref('');
const studentSearch = ref('');
const studentPage = ref(1);
const studentPageSize = 20;

onMounted(async () => {
  await Promise.all([
    attendancesStore.fetchAttendances(),
    sessionsStore.fetchSessions(),
    coursesStore.fetchCourses(),
    enrollmentsStore.fetchEnrollments(),
    programmesStore.fetchProgrammes(),
  ]);
  // Load all enrolled student profiles (for student breakdown)
  const enrolledIds = enrollments.value.map(e => e.studentId);
  const attendanceIds = attendances.value.map(a => a.studentId);
  await loadUsers([...enrolledIds, ...attendanceIds]);
  attendancesStore.subscribeToAttendances();
  sessionsStore.subscribeToSessions();
});

// When new attendance records arrive (realtime), load any new student ids
watch(attendances, async (records) => {
  await loadUsers(records.map(a => a.studentId));
}, { deep: false });

onUnmounted(() => {
  attendancesStore.unsubscribeFromAttendances();
  sessionsStore.unsubscribeFromSessions();
});

// Reset pages when filters change
watch([selectedCourseFilter, selectedStatusFilter, searchQuery], () => {
  currentPage.value = 1;
});
watch([studentProgramFilter, studentCourseFilter, studentSearch], () => {
  studentPage.value = 1;
});
// Also load new users when enrollments are populated after mount
watch(enrollments, async (list) => {
  await loadUsers(list.map(e => e.studentId));
}, { deep: false });

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
      courseName: course.name || course.code || 'Unknown',
      sessionCount: courseSessions.length,
      present,
      absent,
      rate,
    };
  }).filter(r => selectedCourseFilter.value === '' || r.courseId === selectedCourseFilter.value);
});

// ─── Per-Student Breakdown ────────────────────────────────────────────────────

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
    const course = coursesStore.getCourseById(enr.courseId);
    const programme = user?.programId ? programmesStore.getProgrammeById(user.programId) : null;

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
  if (studentCourseFilter.value)  list = list.filter(r => r.courseId  === studentCourseFilter.value);
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
    const session = sessionsStore.getSessionById(a.sessionId);
    const course = session ? coursesStore.getCourseById(session.courseId) : null;
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