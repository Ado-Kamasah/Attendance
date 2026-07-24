<template>
  <div class="faculties-page">
    <div class="page-header">
      <div class="header-content">
        <h1>Faculty Management</h1>
        <p>Add and manage faculties for student and staff registration.</p>
      </div>
    </div>

    <div class="content-card">
      <div class="add-faculty-section">
        <h3>Add New Faculty</h3>
        <form @submit.prevent="handleAddFaculty" class="add-form">
          <div class="input-wrapper">
            <input type="text" v-model="newFacultyName" :placeholder="editingFacultyId ? 'Update Faculty Name' : 'e.g., School of Medicine'" required />
            <button type="button" v-if="editingFacultyId" class="btn-ghost" @click="cancelEdit">Cancel</button>
            <button type="submit" class="btn-primary" :disabled="isAdding">
              <span v-if="!isAdding">{{ editingFacultyId ? 'Update' : 'Add Faculty' }}</span>
              <svg v-else class="spinner" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <circle cx="12" cy="12" r="10" stroke-opacity="0.25"></circle>
                <path d="M12 2a10 10 0 0 1 10 10"></path>
              </svg>
            </button>
          </div>
          <div v-if="errorMsg" class="error-msg">{{ errorMsg }}</div>
          <div v-if="successMsg" class="success-msg">{{ successMsg }}</div>
        </form>
      </div>

      <div class="faculties-list-section">
        <h3>Existing Faculties</h3>
        <div v-if="isLoading" class="loading-state">
          <svg class="spinner" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <circle cx="12" cy="12" r="10" stroke-opacity="0.25"></circle>
            <path d="M12 2a10 10 0 0 1 10 10"></path>
          </svg>
          <p>Loading faculties...</p>
        </div>
        <div v-else-if="faculties.length === 0" class="empty-state">
          <p>No faculties added yet. Add one above.</p>
        </div>
        <ul v-else class="faculties-list">
          <li v-for="faculty in faculties" :key="faculty.id" class="faculty-item" :class="{ 'is-editing': editingFacultyId === faculty.id }">
            <div class="faculty-info">
              <span class="faculty-name">{{ faculty.name }}</span>
            </div>
            <div class="action-buttons">
              <button class="btn-edit" @click="editFaculty(faculty)" aria-label="Edit faculty">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path></svg>
              </button>
              <button class="btn-delete" @click="deleteFaculty(faculty.id)" aria-label="Delete faculty">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <polyline points="3 6 5 6 21 6"></polyline>
                <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                <line x1="10" y1="11" x2="10" y2="17"></line>
                <line x1="14" y1="11" x2="14" y2="17"></line>
              </svg>
              </button>
            </div>
          </li>
        </ul>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue';
import { storeToRefs } from 'pinia';
import { useFacultiesStore } from '@/stores/faculties';
import { useAuditLogsStore } from '@/stores/auditlogs';
import { supabase } from '@/stores/supabase';

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

  const { data, error } = await supabase
    .from('users')
    .select('id, name, role')
    .eq('id', user.id)
    .single();

  if (!error) currentUser.value = data;
};

const logAudit = (action, details) => {
  if (!currentUser.value) return;
  auditLogsStore.logAction({
    action,
    details,
    userId: currentUser.value.id,
    userRole: currentUser.value.role,
    userName: currentUser.value.name,
  });
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

onUnmounted(() => {
  facultiesStore.unsubscribeFromFaculties();
});
</script>