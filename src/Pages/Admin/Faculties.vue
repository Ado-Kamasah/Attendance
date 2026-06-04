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
            <input type="text" v-model="newFacultyName" placeholder="e.g., School of Medicine" required />
            <button type="submit" class="btn-primary" :disabled="isAdding">
              <span v-if="!isAdding">Add Faculty</span>
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
          <li v-for="faculty in faculties" :key="faculty.id" class="faculty-item">
            <div class="faculty-info">
              <span class="faculty-name">{{ faculty.name }}</span>
            </div>
            <button class="btn-delete" @click="deleteFaculty(faculty.id)" aria-label="Delete faculty">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <polyline points="3 6 5 6 21 6"></polyline>
                <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                <line x1="10" y1="11" x2="10" y2="17"></line>
                <line x1="14" y1="11" x2="14" y2="17"></line>
              </svg>
            </button>
          </li>
        </ul>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import api from '../../api.js';

const faculties = ref([]);
const newFacultyName = ref('');
const isLoading = ref(false);
const isAdding = ref(false);
const errorMsg = ref('');
const successMsg = ref('');

const fetchFaculties = async () => {
  isLoading.value = true;
  try {
    const res = await api.get('/faculties');
    faculties.value = res.data;
  } catch (error) {
    console.error('Error fetching faculties:', error);
  } finally {
    isLoading.value = false;
  }
};

const handleAddFaculty = async () => {
  if (!newFacultyName.value.trim()) return;
  isAdding.value = true;
  errorMsg.value = '';
  successMsg.value = '';
  
  try {
    const res = await api.post('/faculties', { name: newFacultyName.value.trim() });
    faculties.value.push(res.data);
    faculties.value.sort((a, b) => a.name.localeCompare(b.name));
    newFacultyName.value = '';
    successMsg.value = 'Faculty added successfully!';
    setTimeout(() => { successMsg.value = ''; }, 3000);
  } catch (error) {
    console.error('Error adding faculty:', error);
    errorMsg.value = error.response?.data?.message || 'Failed to add faculty.';
  } finally {
    isAdding.value = false;
  }
};

const deleteFaculty = async (id) => {
  if (!confirm('Are you sure you want to delete this faculty?')) return;
  
  try {
    await api.delete(`/faculties/${id}`);
    faculties.value = faculties.value.filter(f => f.id !== id);
  } catch (error) {
    console.error('Error deleting faculty:', error);
    alert('Failed to delete faculty.');
  }
};

onMounted(() => {
  fetchFaculties();
});
</script>

<style scoped>
.faculties-page {
  font-family: 'Inter', sans-serif;
  animation: fadeIn 0.4s ease-out;
}

@keyframes fadeIn {
  from { opacity: 0; transform: translateY(10px); }
  to { opacity: 1; transform: translateY(0); }
}

.page-header {
  margin-bottom: 2rem;
}

.header-content h1 {
  font-size: 1.8rem;
  font-weight: 800;
  color: #0f172a;
  margin: 0 0 0.5rem 0;
  letter-spacing: -0.02em;
}

.header-content p {
  color: #64748b;
  margin: 0;
  font-size: 1rem;
}

.content-card {
  background: white;
  border-radius: 16px;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05), 0 2px 4px -2px rgba(0, 0, 0, 0.025);
  padding: 2rem;
  max-width: 800px;
}

.add-faculty-section {
  margin-bottom: 2.5rem;
  padding-bottom: 2rem;
  border-bottom: 1px solid #e2e8f0;
}

h3 {
  font-size: 1.1rem;
  font-weight: 600;
  color: #1e293b;
  margin: 0 0 1rem 0;
}

.input-wrapper {
  display: flex;
  gap: 1rem;
}

.input-wrapper input {
  flex: 1;
  padding: 0.75rem 1rem;
  font-size: 0.95rem;
  border: 1px solid #cbd5e1;
  border-radius: 10px;
  outline: none;
  transition: all 0.2s;
}

.input-wrapper input:focus {
  border-color: #6366f1;
  box-shadow: 0 0 0 3px rgba(99, 102, 241, 0.1);
}

.btn-primary {
  background: #4f46e5;
  color: white;
  border: none;
  border-radius: 10px;
  padding: 0 1.5rem;
  font-weight: 600;
  font-size: 0.95rem;
  cursor: pointer;
  transition: all 0.2s;
  display: flex;
  align-items: center;
  justify-content: center;
  min-width: 120px;
}

.btn-primary:hover:not(:disabled) {
  background: #4338ca;
}

.btn-primary:disabled {
  background: #94a3b8;
  cursor: not-allowed;
}

.error-msg {
  color: #ef4444;
  font-size: 0.85rem;
  margin-top: 0.5rem;
  font-weight: 500;
}

.success-msg {
  color: #10b981;
  font-size: 0.85rem;
  margin-top: 0.5rem;
  font-weight: 500;
}

.faculties-list {
  list-style: none;
  padding: 0;
  margin: 0;
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.faculty-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 1rem 1.25rem;
  background: #f8fafc;
  border: 1px solid #e2e8f0;
  border-radius: 12px;
  transition: all 0.2s;
}

.faculty-item:hover {
  background: white;
  border-color: #cbd5e1;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
}

.faculty-name {
  font-weight: 600;
  color: #334155;
  font-size: 1rem;
}

.btn-delete {
  background: none;
  border: none;
  color: #94a3b8;
  cursor: pointer;
  padding: 6px;
  border-radius: 6px;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s;
}

.btn-delete:hover {
  color: #ef4444;
  background: #fee2e2;
}

.btn-delete svg {
  width: 18px;
  height: 18px;
}

.loading-state, .empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 3rem 0;
  color: #64748b;
  font-size: 0.95rem;
}

.spinner {
  width: 24px;
  height: 24px;
  animation: spin 1s linear infinite;
  margin-bottom: 0.5rem;
}

@keyframes spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}
</style>
