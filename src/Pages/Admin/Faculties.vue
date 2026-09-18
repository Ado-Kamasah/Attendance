<template>
  <div class="space-y-8 p-1 sm:p-2 lg:p-4 animate-in fade-in duration-500">

    <!-- Header -->
    <div class="relative bg-white dark:bg-dark-surface border border-slate-200/80 dark:border-dark-outline/60 rounded-2xl p-6 sm:p-8 shadow-sm overflow-hidden">
      <div class="absolute inset-0 bg-[radial-gradient(#031c45_1px,transparent_1px)] dark:bg-[radial-gradient(#bc9333_1px,transparent_1px)] opacity-[0.03] dark:opacity-[0.05] bg-[size:16px_16px] pointer-events-none"></div>
      <div class="absolute top-2 left-2 w-3 h-3 border-t-2 border-l-2 border-secondary/40 pointer-events-none"></div>
      <div class="absolute top-2 right-2 w-3 h-3 border-t-2 border-r-2 border-secondary/40 pointer-events-none"></div>

      <div class="relative z-10">
        <div class="flex items-center gap-2 mb-1.5">
          <span class="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-mono font-medium tracking-wide uppercase bg-primary/10 text-primary dark:bg-secondary/15 dark:text-secondary border border-primary/20 dark:border-secondary/30">
            <Building2 class="w-3 h-3" />
            ADMIN // FACULTY REGISTRY
          </span>
        </div>
        <h1 class="text-2xl sm:text-3xl font-display font-bold text-slate-900 dark:text-white tracking-tight">Faculty Management</h1>
        <p class="text-sm text-slate-500 dark:text-white/75 mt-1">Add and manage faculties for student and staff registration.</p>
      </div>
    </div>

    <!-- Add / Edit Form -->
    <div class="bg-white dark:bg-dark-surface border border-slate-200/80 dark:border-dark-outline/60 rounded-2xl p-6 shadow-sm">
      <h3 class="text-sm font-display font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
        <component :is="editingFacultyId ? Edit3 : Plus" class="w-4 h-4 text-secondary" />
        {{ editingFacultyId ? 'Update Faculty' : 'Add New Faculty' }}
      </h3>
      <form @submit.prevent="handleAddFaculty">
        <div class="flex flex-col sm:flex-row gap-3">
          <input
            type="text"
            v-model="newFacultyName"
            :placeholder="editingFacultyId ? 'Update faculty name...' : 'e.g., School of Medicine'"
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
              <span>{{ isAdding ? 'Saving...' : (editingFacultyId ? 'Update' : 'Add Faculty') }}</span>
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

    <!-- Faculties List -->
    <div class="bg-white dark:bg-dark-surface border border-slate-200/80 dark:border-dark-outline/60 rounded-2xl shadow-sm overflow-hidden">
      <div class="p-5 border-b border-slate-100 dark:border-dark-outline flex items-center justify-between">
        <h3 class="text-sm font-display font-bold text-slate-900 dark:text-white">Registered Faculties</h3>
        <span class="px-2.5 py-1 rounded-lg text-xs font-mono bg-primary/5 dark:bg-secondary/10 border border-primary/20 dark:border-secondary/20 text-primary dark:text-secondary font-semibold">
          {{ faculties.length }} Total
        </span>
      </div>

      <!-- Loading -->
      <div v-if="isLoading" class="flex flex-col items-center justify-center py-16">
        <Loader2 class="w-8 h-8 text-secondary animate-spin mb-3" />
        <span class="text-xs font-mono text-slate-500 dark:text-white/75">LOADING FACULTIES...</span>
      </div>

      <!-- Empty -->
      <div v-else-if="faculties.length === 0" class="py-12 text-center text-slate-400 text-sm">
        No faculties added yet. Add one above.
      </div>

      <!-- List -->
      <ul v-else class="divide-y divide-slate-100 dark:divide-slate-800/60">
        <li
          v-for="faculty in faculties"
          :key="faculty.id"
          :class="['flex items-center justify-between gap-4 px-5 py-4 transition-colors group',
            editingFacultyId === faculty.id ? 'bg-secondary/5 dark:bg-secondary/10' : 'hover:bg-slate-50/60 dark:hover:bg-slate-800/30'
          ]"
        >
          <div class="flex items-center gap-3">
            <div class="w-8 h-8 rounded-lg bg-primary/10 dark:bg-secondary/15 border border-primary/20 dark:border-secondary/30 text-primary dark:text-secondary flex items-center justify-center font-bold text-xs uppercase">
              {{ faculty.name.charAt(0) }}
            </div>
            <span class="font-medium text-sm text-slate-900 dark:text-white">{{ faculty.name }}</span>
            <span v-if="editingFacultyId === faculty.id" class="text-[10px] font-mono px-1.5 py-0.5 rounded bg-secondary/15 text-secondary">Editing</span>
          </div>
          <div class="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
            <button @click="editFaculty(faculty)" aria-label="Edit faculty"
              class="p-1.5 text-slate-400 hover:text-primary dark:hover:text-secondary hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors">
              <Edit3 class="w-3.5 h-3.5" />
            </button>
            <button @click="deleteFaculty(faculty.id)" aria-label="Delete faculty"
              class="p-1.5 text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/40 rounded-lg transition-colors">
              <Trash2 class="w-3.5 h-3.5" />
            </button>
          </div>
        </li>
      </ul>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue';
import { storeToRefs } from 'pinia';
import { useFacultiesStore } from '@/stores/faculties';
import { useAuditLogsStore } from '@/stores/auditlogs';
import { supabase } from '@/stores/supabase';
import { Building2, Plus, Edit3, Trash2, Loader2, AlertCircle, CheckCircle2 } from 'lucide-vue-next';

const facultiesStore = useFacultiesStore();
const auditLogsStore = useAuditLogsStore();
const { faculties, isLoading } = storeToRefs(facultiesStore);

const newFacultyName = ref('');
const editingFacultyId = ref(null);
const isAdding = ref(false);
const errorMsg = ref('');
const successMsg = ref('');
const currentUser = ref(null);

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
  } catch (error) {
    console.error('Error deleting faculty:', error);
    alert('Failed to delete faculty.');
  }
};

onMounted(async () => {
  await Promise.all([facultiesStore.fetchFaculties(), loadCurrentUser()]);
  facultiesStore.subscribeToFaculties();
});

onUnmounted(() => { facultiesStore.unsubscribeFromFaculties(); });
</script>