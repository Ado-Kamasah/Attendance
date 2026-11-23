<template>
  <div v-if="isOpen && dossier" class="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-slate-950/70 backdrop-blur-xs animate-in fade-in duration-200">
    <div class="relative w-full max-w-4xl max-h-[92vh] flex flex-col bg-white dark:bg-dark-surface border border-slate-200/80 dark:border-dark-outline rounded-2xl shadow-2xl overflow-hidden">
      
      <!-- Blueprint Corner Accents -->
      <div class="absolute top-0 left-0 w-3 h-3 border-t-2 border-l-2 border-secondary/50 pointer-events-none"></div>
      <div class="absolute top-0 right-0 w-3 h-3 border-t-2 border-r-2 border-secondary/50 pointer-events-none"></div>

      <!-- Modal Header Banner -->
      <div class="p-5 sm:p-6 border-b border-slate-100 dark:border-dark-outline/60 bg-slate-50/70 dark:bg-dark-muted/20 shrink-0">
        <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div class="flex items-center gap-3">
            <div class="w-11 h-11 rounded-xl bg-primary text-secondary flex items-center justify-center font-display font-black text-base shadow-xs shrink-0">
              {{ (dossier.name || 'S').charAt(0).toUpperCase() }}
            </div>
            <div>
              <div class="flex items-center gap-2">
                <h2 class="text-lg font-bold font-display text-slate-900 dark:text-white">
                  {{ dossier.name }}
                </h2>
                <span 
                  class="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold uppercase tracking-wider"
                  :class="dossier.overallStanding.includes('Ineligible') 
                    ? 'bg-rose-500/10 text-rose-600 border border-rose-500/20' 
                    : (dossier.overallStanding === 'At Risk' 
                      ? 'bg-amber-500/10 text-amber-600 border border-amber-500/20' 
                      : 'bg-emerald-500/10 text-emerald-600 border border-emerald-500/20')"
                >
                  {{ dossier.overallStanding }}
                </span>
              </div>
              <p class="text-xs font-mono text-slate-500 dark:text-white/70 mt-0.5 flex flex-wrap items-center gap-x-2">
                <span>ID: <strong class="text-slate-800 dark:text-white">{{ dossier.studentId }}</strong></span>
                <span>•</span>
                <span>{{ dossier.programme }}</span>
                <span>•</span>
                <span>Mode: <strong>{{ dossier.mode }}</strong></span>
                <span>•</span>
                <span>Level: <strong>{{ dossier.level }}</strong></span>
              </p>
            </div>
          </div>

          <div class="flex items-center gap-2">
            <button
              type="button"
              @click="$emit('toggle-queue', dossier.id)"
              class="px-3 py-1.5 rounded-xl border text-xs font-mono font-semibold flex items-center gap-1.5 transition-all cursor-pointer"
              :class="isQueued 
                ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-600 dark:text-emerald-400' 
                : 'bg-slate-100 dark:bg-dark-muted border-slate-200 dark:border-dark-outline text-slate-700 dark:text-white hover:border-secondary'"
            >
              <Check v-if="isQueued" class="w-3.5 h-3.5" />
              <Plus v-else class="w-3.5 h-3.5" />
              <span>{{ isQueued ? 'In Download Queue' : 'Add to Queue' }}</span>
            </button>

            <button
              @click="$emit('close')"
              class="text-slate-400 hover:text-slate-600 dark:hover:text-white p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-dark-muted transition-colors cursor-pointer"
            >
              <X class="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>

      <!-- Modal Body (Scrollable) -->
      <div class="flex-1 overflow-y-auto p-5 sm:p-6 space-y-6 text-xs">

        <!-- Cumulative Summary Metric Strip -->
        <div class="grid grid-cols-2 sm:grid-cols-5 gap-3">
          <div class="p-3.5 rounded-xl bg-slate-50 dark:bg-dark-muted/40 border border-slate-200/70 dark:border-dark-outline/50 text-center">
            <div class="text-[10px] font-mono text-slate-500 uppercase font-semibold">Registered Courses</div>
            <div class="text-xl font-bold font-display text-slate-900 dark:text-white mt-1">{{ dossier.totalCourses }}</div>
          </div>
          <div class="p-3.5 rounded-xl bg-slate-50 dark:bg-dark-muted/40 border border-slate-200/70 dark:border-dark-outline/50 text-center">
            <div class="text-[10px] font-mono text-slate-500 uppercase font-semibold">Classes Held</div>
            <div class="text-xl font-bold font-mono text-slate-900 dark:text-white mt-1">{{ dossier.cumulativeSessionsHeld }}</div>
          </div>
          <div class="p-3.5 rounded-xl bg-emerald-50/60 dark:bg-emerald-950/20 border border-emerald-200/60 dark:border-emerald-800/40 text-center">
            <div class="text-[10px] font-mono text-emerald-700 dark:text-emerald-400 uppercase font-semibold">Attended</div>
            <div class="text-xl font-bold font-mono text-emerald-600 dark:text-emerald-400 mt-1">{{ dossier.cumulativePresent }}</div>
          </div>
          <div class="p-3.5 rounded-xl bg-rose-50/60 dark:bg-rose-950/20 border border-rose-200/60 dark:border-rose-800/40 text-center">
            <div class="text-[10px] font-mono text-rose-700 dark:text-rose-400 uppercase font-semibold">Missed</div>
            <div class="text-xl font-bold font-mono text-rose-600 dark:text-rose-400 mt-1">{{ dossier.cumulativeAbsent }}</div>
          </div>
          <div class="p-3.5 rounded-xl bg-sky-50/60 dark:bg-sky-950/20 border border-sky-200/60 dark:border-sky-800/40 text-center col-span-2 sm:col-span-1">
            <div class="text-[10px] font-mono text-sky-700 dark:text-sky-400 uppercase font-semibold">Cumulative Rate</div>
            <div class="text-xl font-bold font-mono text-sky-600 dark:text-sky-400 mt-1">{{ dossier.overallRate }}%</div>
          </div>
        </div>

        <!-- Registered Courses Section -->
        <div>
          <div class="flex items-center justify-between pb-2.5 mb-3 border-b border-slate-200/80 dark:border-dark-outline/60">
            <div>
              <h3 class="text-sm font-bold font-display text-slate-900 dark:text-white flex items-center gap-2">
                <BookOpen class="w-4 h-4 text-secondary" />
                <span>Registered Courses &amp; Performance</span>
              </h3>
              <p class="text-xs font-mono text-slate-500 dark:text-white/70">
                Attendance metrics and session-by-session records for all enrolled modules
              </p>
            </div>
            <span class="text-xs font-mono text-slate-500">
              {{ dossier.courses.length }} Course{{ dossier.courses.length === 1 ? '' : 's' }}
            </span>
          </div>

          <!-- Empty State -->
          <div v-if="dossier.courses.length === 0" class="p-8 text-center bg-slate-50 dark:bg-dark-muted/20 rounded-xl border border-dashed border-slate-200 dark:border-dark-outline text-slate-500 font-mono text-xs">
            No course registrations found for this student.
          </div>

          <!-- Courses Accordion List -->
          <div v-else class="space-y-3">
            <div 
              v-for="course in dossier.courses" 
              :key="course.courseId"
              class="rounded-xl border border-slate-200 dark:border-dark-outline/70 bg-white dark:bg-dark-surface overflow-hidden shadow-2xs transition-all"
            >
              <!-- Course Summary Row (Clickable) -->
              <div 
                @click="toggleCourseExpand(course.courseId)"
                class="p-4 flex flex-col md:flex-row md:items-center justify-between gap-3 hover:bg-slate-50/60 dark:hover:bg-dark-muted/30 cursor-pointer select-none"
              >
                <div class="flex items-start sm:items-center gap-3">
                  <div class="w-9 h-9 rounded-lg bg-secondary/10 border border-secondary/20 flex items-center justify-center font-mono font-bold text-xs text-secondary shrink-0">
                    {{ course.code.slice(0, 4) }}
                  </div>
                  <div>
                    <div class="flex items-center gap-2">
                      <span class="font-mono font-bold text-slate-900 dark:text-white">{{ course.code }}</span>
                      <span class="text-slate-400">•</span>
                      <span class="font-semibold text-slate-800 dark:text-white/90">{{ course.name }}</span>
                    </div>
                    <div class="text-[11px] font-mono text-slate-500 dark:text-white/60 mt-0.5">
                      {{ course.semester }} · {{ course.credits }} Credits
                    </div>
                  </div>
                </div>

                <div class="flex items-center gap-4 self-end md:self-center">
                  <!-- Metrics Badges -->
                  <div class="flex items-center gap-3 font-mono text-xs">
                    <span title="Sessions Held" class="text-slate-600 dark:text-white/80">
                      Held: <strong>{{ course.sessionsHeld }}</strong>
                    </span>
                    <span title="Attended" class="text-emerald-600 dark:text-emerald-400 font-bold">
                      ✓ {{ course.present }}
                    </span>
                    <span title="Missed" class="text-rose-600 dark:text-rose-400 font-bold">
                      ✕ {{ course.absent }}
                    </span>
                    <span 
                      class="px-2 py-0.5 rounded-md font-bold text-[11px]"
                      :class="course.rate >= 75 ? 'bg-emerald-500/10 text-emerald-600 border border-emerald-500/20' : (course.rate >= 60 ? 'bg-amber-500/10 text-amber-600 border border-amber-500/20' : 'bg-rose-500/10 text-rose-600 border border-rose-500/20')"
                    >
                      {{ course.rate !== null ? course.rate + '%' : 'N/A' }}
                    </span>
                  </div>

                  <!-- Expand Icon -->
                  <div class="w-6 h-6 flex items-center justify-center rounded-md bg-slate-100 dark:bg-dark-muted text-slate-500">
                    <ChevronDown class="w-4 h-4 transition-transform duration-200" :class="{ 'rotate-180': expandedCourses.has(course.courseId) }" />
                  </div>
                </div>
              </div>

              <!-- Expanded Session Logs -->
              <div v-if="expandedCourses.has(course.courseId)" class="p-4 pt-1 bg-slate-50/70 dark:bg-dark-muted/20 border-t border-slate-100 dark:border-dark-outline/50 animate-in fade-in duration-150">
                <div class="text-[11px] font-mono uppercase text-slate-500 font-semibold mb-2.5 flex items-center justify-between">
                  <span>Session Rollcall Log ({{ course.sessionLogs.length }} Classes)</span>
                  <span class="text-[10px] text-slate-400">Verifiable PIN records</span>
                </div>

                <div v-if="course.sessionLogs.length === 0" class="text-center py-4 font-mono text-slate-400">
                  No sessions have been recorded for this course yet.
                </div>

                <div v-else class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2">
                  <div 
                    v-for="log in course.sessionLogs" 
                    :key="log.sessionId"
                    class="p-2.5 rounded-lg border flex items-center justify-between gap-2 text-xs font-mono"
                    :class="log.status === 'Present' 
                      ? 'bg-emerald-50/60 dark:bg-emerald-950/20 border-emerald-200/60 dark:border-emerald-800/40 text-emerald-900 dark:text-emerald-200' 
                      : 'bg-rose-50/60 dark:bg-rose-950/20 border-rose-200/60 dark:border-rose-800/40 text-rose-900 dark:text-rose-200'"
                  >
                    <div>
                      <div class="font-bold flex items-center gap-1.5">
                        <span>Week {{ log.sessionNumber }}</span>
                        <span class="text-[10px] font-normal text-slate-500">#{{ log.sessionPin }}</span>
                      </div>
                      <div class="text-[10px] opacity-80">{{ log.date }}</div>
                    </div>
                    
                    <span 
                      class="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider"
                      :class="log.status === 'Present' ? 'bg-emerald-600 text-white' : 'bg-rose-600 text-white'"
                    >
                      {{ log.status }}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

      </div>

      <!-- Modal Footer Action Bar -->
      <div class="p-4 sm:p-5 border-t border-slate-100 dark:border-dark-outline/60 bg-slate-50/70 dark:bg-dark-muted/30 flex flex-wrap items-center justify-between gap-3 shrink-0">
        <div class="text-xs font-mono text-slate-500">
          Ready for export: <strong class="text-slate-800 dark:text-white">{{ dossier.name }}</strong> ({{ dossier.totalCourses }} courses)
        </div>

        <div class="flex items-center gap-2">
          <button
            type="button"
            @click="exportPdf"
            class="px-4 py-2 rounded-xl bg-primary text-secondary dark:text-secondary border border-secondary/30 text-xs font-mono font-bold flex items-center gap-2 hover:opacity-90 active:scale-95 transition-all shadow-2xs cursor-pointer"
          >
            <Printer class="w-3.5 h-3.5" />
            <span>Printable PDF Dossier</span>
          </button>

          <button
            type="button"
            @click="exportExcel"
            class="px-4 py-2 rounded-xl bg-emerald-600 text-white text-xs font-mono font-bold flex items-center gap-2 hover:bg-emerald-700 active:scale-95 transition-all shadow-2xs cursor-pointer"
          >
            <FileSpreadsheet class="w-3.5 h-3.5" />
            <span>Excel Workbook (.xls)</span>
          </button>

          <button
            type="button"
            @click="$emit('close')"
            class="px-3.5 py-2 rounded-xl border border-slate-200 dark:border-dark-outline text-slate-600 dark:text-white/80 text-xs font-mono font-medium hover:bg-slate-100 dark:hover:bg-dark-muted transition-colors cursor-pointer"
          >
            Close
          </button>
        </div>
      </div>

    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import { 
  X, 
  Printer, 
  FileSpreadsheet, 
  Check, 
  Plus, 
  BookOpen, 
  ChevronDown 
} from 'lucide-vue-next';
import { 
  exportStudentsAttendanceToPdf, 
  exportStudentsAttendanceToExcel 
} from '@/utils/studentAttendanceExport.js';

const props = defineProps({
  isOpen: { type: Boolean, default: false },
  dossier: { type: Object, default: null },
  isQueued: { type: Boolean, default: false },
});

defineEmits(['close', 'toggle-queue']);

const expandedCourses = ref(new Set());

function toggleCourseExpand(courseId) {
  if (expandedCourses.value.has(courseId)) {
    expandedCourses.value.delete(courseId);
  } else {
    expandedCourses.value.add(courseId);
  }
}

function exportPdf() {
  if (!props.dossier) return;
  exportStudentsAttendanceToPdf([props.dossier]);
}

function exportExcel() {
  if (!props.dossier) return;
  exportStudentsAttendanceToExcel([props.dossier]);
}
</script>
