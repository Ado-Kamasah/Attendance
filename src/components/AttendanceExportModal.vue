<template>
  <div v-if="isOpen" class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs animate-in fade-in duration-200">
    <div class="relative w-full max-w-lg bg-white dark:bg-dark-surface border border-slate-200/80 dark:border-dark-outline rounded-2xl shadow-2xl overflow-hidden">
      <!-- Blueprint Corner Accents -->
      <div class="absolute top-0 left-0 w-3 h-3 border-t-2 border-l-2 border-secondary/50 pointer-events-none"></div>
      <div class="absolute top-0 right-0 w-3 h-3 border-t-2 border-r-2 border-secondary/50 pointer-events-none"></div>

      <!-- Modal Header -->
      <div class="p-6 border-b border-slate-100 dark:border-dark-outline/60 bg-slate-50/50 dark:bg-dark-muted/20">
        <div class="flex items-center justify-between">
          <div class="flex items-center gap-2.5">
            <div class="w-9 h-9 rounded-xl bg-secondary/10 border border-secondary/20 flex items-center justify-center text-secondary">
              <Download class="w-4 h-4" />
            </div>
            <div>
              <h2 class="text-base font-bold font-display text-slate-900 dark:text-white">
                Export Lecture Attendance
              </h2>
              <p class="text-xs font-mono text-slate-500 dark:text-white/70">
                Official register export to Excel (.xls) or printable PDF
              </p>
            </div>
          </div>
          <button
            @click="close"
            class="text-slate-400 hover:text-slate-600 dark:hover:text-white p-1 rounded-lg hover:bg-slate-100 dark:hover:bg-dark-muted transition-colors cursor-pointer"
          >
            <X class="w-5 h-5" />
          </button>
        </div>
      </div>

      <!-- Modal Body -->
      <div class="p-6 space-y-5 text-xs font-sans">
        <!-- Course Selection -->
        <div class="space-y-1.5">
          <label class="block font-mono font-semibold uppercase tracking-wider text-[11px] text-slate-600 dark:text-white/80">
            Course Module *
          </label>
          <select
            v-model="selectedCourseId"
            @change="onCourseChange"
            class="w-full bg-slate-50 dark:bg-dark-muted border border-slate-200 dark:border-dark-outline rounded-xl px-3.5 py-2.5 text-xs font-mono text-slate-800 dark:text-white focus:outline-hidden focus:border-secondary transition-all"
          >
            <option value="" disabled>— Select a course —</option>
            <option v-for="c in courseList" :key="c.id" :value="c.id">
              {{ c.code }} — {{ c.name }}
            </option>
          </select>
        </div>

        <!-- Session Scope -->
        <div class="space-y-1.5">
          <label class="block font-mono font-semibold uppercase tracking-wider text-[11px] text-slate-600 dark:text-white/80">
            Session Scope
          </label>
          <div class="grid grid-cols-2 gap-2.5">
            <button
              type="button"
              @click="exportScope = 'all'"
              class="p-3 rounded-xl border text-left transition-all cursor-pointer flex flex-col justify-between"
              :class="exportScope === 'all'
                ? 'bg-secondary/10 border-secondary text-primary dark:text-white font-semibold shadow-2xs'
                : 'bg-slate-50/70 dark:bg-dark-muted/40 border-slate-200 dark:border-dark-outline text-slate-600 dark:text-white/70'"
            >
              <span class="font-bold flex items-center gap-1.5">
                <Layers class="w-3.5 h-3.5 text-secondary" />
                All Sessions (Weeks)
              </span>
              <span class="text-[10px] font-mono opacity-80 mt-1">
                Creates separate sheet per week if sessions &gt; 1
              </span>
            </button>

            <button
              type="button"
              @click="exportScope = 'single'"
              :disabled="sessionsForCourse.length === 0"
              class="p-3 rounded-xl border text-left transition-all cursor-pointer flex flex-col justify-between disabled:opacity-40 disabled:cursor-not-allowed"
              :class="exportScope === 'single'
                ? 'bg-secondary/10 border-secondary text-primary dark:text-white font-semibold shadow-2xs'
                : 'bg-slate-50/70 dark:bg-dark-muted/40 border-slate-200 dark:border-dark-outline text-slate-600 dark:text-white/70'"
            >
              <span class="font-bold flex items-center gap-1.5">
                <FileSpreadsheet class="w-3.5 h-3.5 text-secondary" />
                Specific Session
              </span>
              <span class="text-[10px] font-mono opacity-80 mt-1">
                Export a single lecture week
              </span>
            </button>
          </div>
        </div>

        <!-- Specific Session Picker (if single) -->
        <div v-if="exportScope === 'single'" class="space-y-1.5 animate-in fade-in duration-200">
          <label class="block font-mono font-semibold uppercase tracking-wider text-[11px] text-slate-600 dark:text-white/80">
            Select Session / Week
          </label>
          <select
            v-model="selectedSessionId"
            class="w-full bg-slate-50 dark:bg-dark-muted border border-slate-200 dark:border-dark-outline rounded-xl px-3.5 py-2 text-xs font-mono text-slate-800 dark:text-white focus:outline-hidden focus:border-secondary transition-all"
          >
            <option v-for="(s, idx) in sessionsForCourse" :key="s.id" :value="s.id">
              Week {{ idx + 1 }} &bull; PIN #{{ s.pin }} ({{ s.date ? s.date.slice(0, 10) : 'Session' }})
            </option>
          </select>
        </div>

        <!-- Format Selector -->
        <div class="space-y-1.5">
          <label class="block font-mono font-semibold uppercase tracking-wider text-[11px] text-slate-600 dark:text-white/80">
            Export Format *
          </label>
          <div class="grid grid-cols-2 gap-3">
            <button
              type="button"
              @click="format = 'excel'"
              class="p-3.5 rounded-xl border flex items-center gap-3 transition-all cursor-pointer"
              :class="format === 'excel'
                ? 'bg-emerald-50 dark:bg-emerald-950/30 border-emerald-500 text-emerald-800 dark:text-emerald-300 font-bold shadow-2xs'
                : 'bg-slate-50 dark:bg-dark-muted/40 border-slate-200 dark:border-dark-outline text-slate-700 dark:text-white/80 hover:bg-slate-100'"
            >
              <div class="w-8 h-8 rounded-lg bg-emerald-600 text-white flex items-center justify-center font-black text-xs shrink-0">
                XLS
              </div>
              <div class="text-left">
                <div class="font-bold text-xs">Excel Workbook</div>
                <div class="text-[10px] font-mono opacity-80">Multi-sheet .xls file</div>
              </div>
            </button>

            <button
              type="button"
              @click="format = 'pdf'"
              class="p-3.5 rounded-xl border flex items-center gap-3 transition-all cursor-pointer"
              :class="format === 'pdf'
                ? 'bg-rose-50 dark:bg-rose-950/30 border-rose-500 text-rose-800 dark:text-rose-300 font-bold shadow-2xs'
                : 'bg-slate-50 dark:bg-dark-muted/40 border-slate-200 dark:border-dark-outline text-slate-700 dark:text-white/80 hover:bg-slate-100'"
            >
              <div class="w-8 h-8 rounded-lg bg-rose-600 text-white flex items-center justify-center font-black text-xs shrink-0">
                PDF
              </div>
              <div class="text-left">
                <div class="font-bold text-xs">Printable PDF</div>
                <div class="text-[10px] font-mono opacity-80">Print / Save as PDF</div>
              </div>
            </button>
          </div>
        </div>

        <!-- Summary Notice Box -->
        <div class="p-3.5 rounded-xl bg-slate-50 dark:bg-dark-muted/30 border border-slate-200/80 dark:border-dark-outline/60 space-y-1 font-mono text-[11px] text-slate-600 dark:text-white/75">
          <div class="flex items-center justify-between">
            <span class="text-slate-500">Target Heading:</span>
            <span class="font-bold text-slate-800 dark:text-white">{ Course, Lecturer, Week 1++(Code) }</span>
          </div>
          <div class="flex items-center justify-between">
            <span class="text-slate-500">Columns:</span>
            <span class="font-bold text-slate-800 dark:text-white">ID, Student Name, Attendance</span>
          </div>
          <div v-if="sessionsForCourse.length > 0" class="flex items-center justify-between pt-1 border-t border-slate-200/60 dark:border-dark-outline/40 text-secondary">
            <span>Sessions Available:</span>
            <span class="font-bold">{{ sessionsForCourse.length }} Session{{ sessionsForCourse.length > 1 ? 's' : '' }}</span>
          </div>
        </div>

        <!-- Error banner -->
        <div v-if="errorMessage" class="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-mono">
          {{ errorMessage }}
        </div>
      </div>

      <!-- Modal Footer -->
      <div class="p-5 border-t border-slate-100 dark:border-dark-outline/60 bg-slate-50/50 dark:bg-dark-muted/20 flex items-center justify-end gap-3">
        <button
          type="button"
          @click="close"
          class="px-4 py-2 rounded-xl border border-slate-200 dark:border-dark-outline text-slate-600 dark:text-white/80 text-xs font-mono font-medium hover:bg-slate-100 dark:hover:bg-dark-muted transition-colors cursor-pointer"
        >
          Cancel
        </button>

        <button
          type="button"
          :disabled="isExporting || !selectedCourseId"
          @click="handleExport"
          class="px-5 py-2 rounded-xl bg-primary text-secondary dark:text-secondary border border-secondary/30 text-xs font-mono font-bold flex items-center gap-2 hover:opacity-90 active:scale-95 disabled:opacity-40 transition-all cursor-pointer shadow-sm"
        >
          <RefreshCw v-if="isExporting" class="w-3.5 h-3.5 animate-spin" />
          <Download v-else class="w-3.5 h-3.5" />
          <span>{{ isExporting ? 'Generating…' : (format === 'excel' ? 'Download Excel' : 'Open PDF Preview') }}</span>
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, watch } from 'vue';
import { supabase } from '@/stores/supabase';
import { 
  Download, 
  X, 
  Layers, 
  FileSpreadsheet, 
  RefreshCw 
} from 'lucide-vue-next';
import { 
  fetchCourseAttendanceExportData, 
  exportAttendanceToExcel, 
  exportAttendanceToPdf 
} from '@/utils/attendanceExport.js';

const props = defineProps({
  isOpen: { type: Boolean, default: false },
  courses: { type: Array, default: () => [] },
  initialCourseId: { type: String, default: '' },
  lecturerNameOverride: { type: String, default: '' },
});

const emit = defineEmits(['close', 'exported']);

const courseList = ref([]);
const selectedCourseId = ref('');
const exportScope = ref('all');
const selectedSessionId = ref('');
const format = ref('excel');
const isExporting = ref(false);
const errorMessage = ref('');
const sessionsForCourse = ref([]);

watch(
  () => props.isOpen,
  async (newVal) => {
    if (newVal) {
      errorMessage.value = '';
      courseList.value = props.courses && props.courses.length > 0 ? props.courses : await loadCoursesFallback();
      selectedCourseId.value = props.initialCourseId || (courseList.value[0]?.id || '');
      if (selectedCourseId.value) {
        await loadSessionsForCourse(selectedCourseId.value);
      }
    }
  }
);

async function loadCoursesFallback() {
  try {
    const { data } = await supabase.from('courses').select('id, code, name').order('code');
    return data || [];
  } catch {
    return [];
  }
}

async function onCourseChange() {
  errorMessage.value = '';
  if (selectedCourseId.value) {
    await loadSessionsForCourse(selectedCourseId.value);
  }
}

async function loadSessionsForCourse(courseId) {
  try {
    const { data } = await supabase
      .from('sessions')
      .select('id, pin, date, created_at')
      .eq('course_id', courseId)
      .order('created_at', { ascending: true });
    sessionsForCourse.value = data || [];
    if (sessionsForCourse.value.length > 0) {
      selectedSessionId.value = sessionsForCourse.value[0].id;
    }
  } catch {
    sessionsForCourse.value = [];
  }
}

function close() {
  emit('close');
}

async function handleExport() {
  if (!selectedCourseId.value) {
    errorMessage.value = 'Please select a course to export.';
    return;
  }

  isExporting.value = true;
  errorMessage.value = '';

  try {
    const options = {
      lecturerName: props.lecturerNameOverride,
    };
    if (exportScope.value === 'single' && selectedSessionId.value) {
      options.sessionId = selectedSessionId.value;
    }

    const exportData = await fetchCourseAttendanceExportData(selectedCourseId.value, options);

    if (format.value === 'excel') {
      exportAttendanceToExcel(exportData);
    } else {
      exportAttendanceToPdf(exportData);
    }

    emit('exported', { courseId: selectedCourseId.value, format: format.value });
    close();
  } catch (err) {
    console.error('Export failed:', err);
    errorMessage.value = err.message || 'Failed to generate export.';
  } finally {
    isExporting.value = false;
  }
}
</script>
