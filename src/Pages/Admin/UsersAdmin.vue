<template>
  <div class="users-admin-container">
    <!-- Header -->
    <div class="page-header">
      <div>
        <div class="badge-superadmin">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
            <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon>
          </svg>
          Super Admin Control
        </div>
        <h1 class="page-title">User Management</h1>
        <p class="page-subtitle">Provision, inspect, update, and manage access roles across the institution.</p>
      </div>

      <div class="header-actions">
        <button class="secondary-btn" @click="fetchUsers" :disabled="isLoading" title="Refresh Users">
          <svg :class="{ 'spin': isLoading }" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M21.5 2v6h-6M21.34 15.57a10 10 0 1 1-.57-8.38l5.67-5.67"/>
          </svg>
          <span>Refresh</span>
        </button>

        <button class="primary-btn" @click="openCreateModal" id="btn-add-user">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <line x1="12" y1="5" x2="12" y2="19"></line>
            <line x1="5" y1="12" x2="19" y2="12"></line>
          </svg>
          <span>Add New User</span>
        </button>
      </div>
    </div>

    <!-- KPI Strip -->
    <div class="kpi-grid">
      <div class="kpi-card" @click="roleFilter = 'all'" :class="{ 'active-card': roleFilter === 'all' }">
        <div class="kpi-icon kpi-all">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
            <circle cx="9" cy="7" r="4"></circle>
            <path d="M23 21v-2a4 4 0 0 0-3-3.87"></path>
            <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
          </svg>
        </div>
        <div class="kpi-details">
          <span class="kpi-label">Total Accounts</span>
          <h3 class="kpi-value">{{ stats.total }}</h3>
        </div>
      </div>

      <div class="kpi-card" @click="roleFilter = 'STUDENT'" :class="{ 'active-card': roleFilter === 'STUDENT' }">
        <div class="kpi-icon kpi-student">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M22 10v6M2 10l10-5 10 5-10 5z"></path>
            <path d="M6 12v5c3 3 9 3 12 0v-5"></path>
          </svg>
        </div>
        <div class="kpi-details">
          <span class="kpi-label">Students</span>
          <h3 class="kpi-value">{{ stats.students }}</h3>
        </div>
      </div>

      <div class="kpi-card" @click="roleFilter = 'LECTURER'" :class="{ 'active-card': roleFilter === 'LECTURER' }">
        <div class="kpi-icon kpi-lecturer">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"></path>
            <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"></path>
          </svg>
        </div>
        <div class="kpi-details">
          <span class="kpi-label">Lecturers</span>
          <h3 class="kpi-value">{{ stats.lecturers }}</h3>
        </div>
      </div>

      <div class="kpi-card" @click="roleFilter = 'ADMIN'" :class="{ 'active-card': roleFilter === 'ADMIN' }">
        <div class="kpi-icon kpi-admin">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
            <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
          </svg>
        </div>
        <div class="kpi-details">
          <span class="kpi-label">Administrators</span>
          <h3 class="kpi-value">{{ stats.admins }}</h3>
        </div>
      </div>

      <div class="kpi-card" @click="roleFilter = 'SUPER_ADMIN'" :class="{ 'active-card': roleFilter === 'SUPER_ADMIN' }">
        <div class="kpi-icon kpi-superadmin">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon>
          </svg>
        </div>
        <div class="kpi-details">
          <span class="kpi-label">Super Admins</span>
          <h3 class="kpi-value">{{ stats.superAdmins }}</h3>
        </div>
      </div>

      <div class="kpi-card" @click="roleFilter = 'FINANCE'" :class="{ 'active-card': roleFilter === 'FINANCE' }">
        <div class="kpi-icon kpi-finance">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <line x1="12" y1="1" x2="12" y2="23"></line>
            <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"></path>
          </svg>
        </div>
        <div class="kpi-details">
          <span class="kpi-label">Finance</span>
          <h3 class="kpi-value">{{ stats.finance }}</h3>
        </div>
      </div>
    </div>

    <!-- Table Controls -->
    <div class="table-controls-card">
      <div class="search-box">
        <svg class="search-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <circle cx="11" cy="11" r="8"></circle>
          <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
        </svg>
        <input 
          type="text" 
          v-model="searchQuery" 
          placeholder="Search by name, email, or user ID..." 
          class="search-input"
          id="user-search-input"
        />
        <button v-if="searchQuery" @click="searchQuery = ''" class="clear-search-btn">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <line x1="18" y1="6" x2="6" y2="18"></line>
            <line x1="6" y1="6" x2="18" y2="18"></line>
          </svg>
        </button>
      </div>

      <div class="filters-row">
        <div class="filter-group">
          <label class="filter-label">Role:</label>
          <select v-model="roleFilter" class="filter-select" id="user-role-filter">
            <option value="all">All Roles ({{ stats.total }})</option>
            <option value="SUPER_ADMIN">Super Admins ({{ stats.superAdmins }})</option>
            <option value="ADMIN">Administrators ({{ stats.admins }})</option>
            <option value="LECTURER">Lecturers ({{ stats.lecturers }})</option>
            <option value="STUDENT">Students ({{ stats.students }})</option>
            <option value="FINANCE">Finance ({{ stats.finance }})</option>
          </select>
        </div>

        <div class="filter-group">
          <label class="filter-label">Sort:</label>
          <select v-model="sortBy" class="filter-select">
            <option value="newest">Newest First</option>
            <option value="oldest">Oldest First</option>
            <option value="name_asc">Name (A-Z)</option>
            <option value="name_desc">Name (Z-A)</option>
            <option value="role">Role</option>
          </select>
        </div>
      </div>
    </div>

    <!-- Alert / Toast Banner -->
    <transition name="fade">
      <div v-if="alertMessage" :class="['alert-banner', alertType]">
        <svg v-if="alertType === 'success'" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
          <polyline points="22 4 12 14.01 9 11.01"></polyline>
        </svg>
        <svg v-else viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <circle cx="12" cy="12" r="10"></circle>
          <line x1="12" y1="8" x2="12" y2="12"></line>
          <line x1="12" y1="16" x2="12.01" y2="16"></line>
        </svg>
        <span>{{ alertMessage }}</span>
        <button @click="alertMessage = ''" class="alert-close">×</button>
      </div>
    </transition>

    <!-- Users Table Card -->
    <div class="table-card">
      <div v-if="isLoading" class="loading-state">
        <div class="spinner-large"></div>
        <p>Loading user accounts from database...</p>
      </div>

      <div v-else-if="filteredUsers.length === 0" class="empty-state">
        <div class="empty-icon">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
            <circle cx="12" cy="12" r="10"></circle>
            <line x1="4.93" y1="4.93" x2="19.07" y2="19.07"></line>
          </svg>
        </div>
        <h3>No Users Found</h3>
        <p v-if="searchQuery || roleFilter !== 'all'">
          No accounts matched your search query or filter criteria. Try adjusting your filters.
        </p>
        <p v-else>No user accounts exist yet. Click below to add your first user.</p>
        <button v-if="searchQuery || roleFilter !== 'all'" class="secondary-btn" @click="resetFilters">
          Reset Filters
        </button>
        <button v-else class="primary-btn" @click="openCreateModal">
          Add New User
        </button>
      </div>

      <div v-else class="table-responsive">
        <table class="users-table">
          <thead>
            <tr>
              <th>User</th>
              <th>Email</th>
              <th>Role</th>
              <th>Program / Dept</th>
              <th>Registered</th>
              <th class="text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="user in filteredUsers" :key="user.id" class="user-row">
              <!-- User Profile & ID -->
              <td>
                <div class="user-cell">
                  <div class="avatar-badge" :class="getAvatarClass(user.role)">
                    {{ getInitials(user.name) }}
                  </div>
                  <div class="user-meta">
                    <span class="user-name">{{ user.name }}</span>
                    <span class="user-id-tag" :title="user.id">ID: {{ user.id }}</span>
                  </div>
                </div>
              </td>

              <!-- Email -->
              <td>
                <div class="email-cell">
                  <span class="email-text">{{ user.email }}</span>
                </div>
              </td>

              <!-- Role Badge -->
              <td>
                <span class="role-badge" :class="getRoleBadgeClass(user.role)">
                  <span class="role-dot"></span>
                  {{ formatRole(user.role) }}
                </span>
              </td>

              <!-- Program / Department -->
              <td>
                <span class="program-text">
                  {{ user.program || '—' }}
                </span>
              </td>

              <!-- Date Registered -->
              <td>
                <span class="date-text">
                  {{ formatDate(user.createdAt) }}
                </span>
              </td>

              <!-- Actions -->
              <td class="text-right">
                <div class="action-buttons">
                  <button 
                    class="action-btn edit-btn" 
                    @click="openEditModal(user)" 
                    title="Edit User"
                    :id="'btn-edit-' + user.id"
                  >
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                      <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                      <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
                    </svg>
                  </button>

                  <button 
                    class="action-btn delete-btn" 
                    @click="openDeleteModal(user)" 
                    title="Delete User"
                    :disabled="isCurrentUser(user.id)"
                    :class="{ 'disabled-btn': isCurrentUser(user.id) }"
                    :id="'btn-delete-' + user.id"
                  >
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                      <polyline points="3 6 5 6 21 6"></polyline>
                      <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                      <line x1="10" y1="11" x2="10" y2="17"></line>
                      <line x1="14" y1="11" x2="14" y2="17"></line>
                    </svg>
                  </button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- Table Footer Stats -->
      <div class="table-footer" v-if="filteredUsers.length > 0">
        <span class="table-count">
          Showing <strong>{{ filteredUsers.length }}</strong> of <strong>{{ users.length }}</strong> users
        </span>
      </div>
    </div>

    <!-- ── Create / Edit User Modal ─────────────────────────────── -->
    <div class="modal-backdrop" v-if="isModalOpen" @click.self="closeModal">
      <div class="modal-card">
        <div class="modal-header">
          <div class="modal-title-wrap">
            <div class="modal-header-icon" :class="isEditing ? 'icon-edit' : 'icon-create'">
              <svg v-if="!isEditing" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
                <circle cx="8.5" cy="7" r="4"></circle>
                <line x1="20" y1="8" x2="20" y2="14"></line>
                <line x1="23" y1="11" x2="17" y2="11"></line>
              </svg>
              <svg v-else viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
              </svg>
            </div>
            <div>
              <h2 class="modal-title">{{ isEditing ? 'Edit User Profile' : 'Add New User' }}</h2>
              <p class="modal-subtitle">
                {{ isEditing ? `Updating account details for ${userForm.name}` : 'Provision a new student, lecturer, or administrative account.' }}
              </p>
            </div>
          </div>
          <button class="close-btn" @click="closeModal" aria-label="Close">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <line x1="18" y1="6" x2="6" y2="18"></line>
              <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
          </button>
        </div>

        <form @submit.prevent="saveUser" class="modal-form">
          <div v-if="modalError" class="modal-error-banner">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <circle cx="12" cy="12" r="10"></circle>
              <line x1="12" y1="8" x2="12" y2="12"></line>
              <line x1="12" y1="16" x2="12.01" y2="16"></line>
            </svg>
            <span>{{ modalError }}</span>
          </div>

          <!-- Role Selection Cards -->
          <div class="form-group">
            <label class="input-label">User Role <span class="required">*</span></label>
            <div class="role-selector-grid">
              <div 
                v-for="r in availableRoles" 
                :key="r.value" 
                class="role-option-card"
                :class="{ 'selected': userForm.role === r.value, [r.badgeClass]: true }"
                @click="userForm.role = r.value"
              >
                <div class="role-card-header">
                  <span class="role-card-title">{{ r.label }}</span>
                  <span class="role-card-radio"></span>
                </div>
                <p class="role-card-desc">{{ r.description }}</p>
              </div>
            </div>
          </div>

          <!-- Basic Info Row -->
          <div class="form-row">
            <div class="form-group">
              <label class="input-label" for="user-full-name">Full Name <span class="required">*</span></label>
              <input 
                type="text" 
                id="user-full-name" 
                v-model="userForm.name" 
                placeholder="e.g. Dr. Jane Mensah or Kofi Owusu" 
                class="form-input" 
                required 
              />
            </div>

            <div class="form-group">
              <label class="input-label" for="user-email">Email Address <span class="required">*</span></label>
              <input 
                type="email" 
                id="user-email" 
                v-model="userForm.email" 
                placeholder="e.g. name@southshore.edu.gh" 
                class="form-input" 
                required 
              />
            </div>
          </div>

          <!-- ID and Program Row -->
          <div class="form-row">
            <div class="form-group">
              <label class="input-label" for="user-id">
                User ID / Student ID
                <span class="hint-inline" v-if="!isEditing">(Auto-generated if empty)</span>
              </label>
              <input 
                type="text" 
                id="user-id" 
                v-model="userForm.id" 
                :placeholder="isEditing ? '' : 'e.g. BSC/CSM/2026/02 or STAFF/009'" 
                class="form-input" 
                :disabled="isEditing" 
              />
              <p class="field-hint" v-if="isEditing">User ID is fixed and cannot be changed.</p>
            </div>

            <div class="form-group" v-if="userForm.role === 'STUDENT'">
              <label class="input-label" for="user-program">Academic Programme</label>
              <select id="user-program" v-model="userForm.program" class="form-input">
                <option value="">-- Select Programme --</option>
                <option v-for="prog in availableProgrammes" :key="prog.id" :value="prog.name">
                  {{ prog.name }}
                </option>
              </select>
            </div>

            <div class="form-group" v-else>
              <label class="input-label" for="user-dept">Department / Specialization (Optional)</label>
              <input 
                type="text" 
                id="user-dept" 
                v-model="userForm.program" 
                placeholder="e.g. School of Computing or Finance Dept" 
                class="form-input" 
              />
            </div>
          </div>

          <!-- Password Row -->
          <div class="form-group">
            <label class="input-label" for="user-password">
              {{ isEditing ? 'Change Password' : 'Password' }} 
              <span class="required" v-if="!isEditing">*</span>
              <span class="hint-inline" v-else>(Leave blank to keep current password)</span>
            </label>
            <div class="password-input-wrap">
              <input 
                :type="showModalPassword ? 'text' : 'password'" 
                id="user-password" 
                v-model="userForm.password" 
                :placeholder="isEditing ? 'Enter new password if updating...' : 'Minimum 6 characters'" 
                class="form-input" 
                :required="!isEditing" 
              />
              <button 
                type="button" 
                class="eye-btn" 
                @click="showModalPassword = !showModalPassword"
                tabindex="-1"
              >
                <svg v-if="!showModalPassword" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
                  <circle cx="12" cy="12" r="3"></circle>
                </svg>
                <svg v-else viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path>
                  <line x1="1" y1="1" x2="23" y2="23"></line>
                </svg>
              </button>
            </div>
          </div>

          <!-- Actions -->
          <div class="modal-actions">
            <button type="button" class="clear-btn" @click="closeModal">Cancel</button>
            <button type="submit" class="primary-btn" :disabled="isSaving" id="btn-save-user">
              <svg v-if="isSaving" class="spinner-sm spin" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <circle cx="12" cy="12" r="10" stroke-dasharray="31.4" stroke-dashoffset="10"></circle>
              </svg>
              <span>{{ isSaving ? (isEditing ? 'Saving...' : 'Creating...') : (isEditing ? 'Save Changes' : 'Create User') }}</span>
            </button>
          </div>
        </form>
      </div>
    </div>

    <!-- ── Delete Confirmation Modal ────────────────────────────── -->
    <div class="modal-backdrop" v-if="isDeleteModalOpen" @click.self="closeDeleteModal">
      <div class="modal-card modal-card-sm">
        <div class="delete-icon-wrap">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <circle cx="12" cy="12" r="10"></circle>
            <line x1="12" y1="8" x2="12" y2="12"></line>
            <line x1="12" y1="16" x2="12.01" y2="16"></line>
          </svg>
        </div>

        <h3 class="delete-title">Delete User Account?</h3>
        <p class="delete-desc">
          Are you sure you want to permanently delete 
          <strong>{{ userToDelete?.name }}</strong> (<code>{{ userToDelete?.id }}</code>)?
        </p>

        <div class="delete-warning-box">
          <p>⚠️ This will automatically cascade and clean up all associated attendances, enrollments, notifications, and logs. This action cannot be undone.</p>
        </div>

        <div class="modal-actions-center">
          <button type="button" class="clear-btn" @click="closeDeleteModal" :disabled="isDeleting">
            Cancel
          </button>
          <button 
            type="button" 
            class="danger-btn" 
            @click="confirmDeleteUser" 
            :disabled="isDeleting"
            id="btn-confirm-delete"
          >
            <svg v-if="isDeleting" class="spinner-sm spin" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <circle cx="12" cy="12" r="10" stroke-dasharray="31.4" stroke-dashoffset="10"></circle>
            </svg>
            <span>{{ isDeleting ? 'Deleting...' : 'Delete User Permanently' }}</span>
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
import { useAuthStore } from '@/stores/authstore.js';

const authStore = useAuthStore();

// State
const users = ref([]);
const availableProgrammes = ref([]);
const isLoading = ref(false);
const searchQuery = ref('');
const roleFilter = ref('all');
const sortBy = ref('newest');

const stats = ref({
  total: 0,
  students: 0,
  lecturers: 0,
  admins: 0,
  superAdmins: 0,
  finance: 0
});

// Toast / Alert banner
const alertMessage = ref('');
const alertType = ref('success');

const showAlert = (msg, type = 'success') => {
  alertMessage.value = msg;
  alertType.value = type;
  setTimeout(() => {
    if (alertMessage.value === msg) alertMessage.value = '';
  }, 4500);
};

// Modal State
const isModalOpen = ref(false);
const isEditing = ref(false);
const isSaving = ref(false);
const modalError = ref('');
const showModalPassword = ref(false);

const userForm = ref({
  id: '',
  name: '',
  email: '',
  role: 'STUDENT',
  program: '',
  password: ''
});

// Delete Modal State
const isDeleteModalOpen = ref(false);
const isDeleting = ref(false);
const userToDelete = ref(null);

const availableRoles = [
  {
    value: 'STUDENT',
    label: 'Student',
    badgeClass: 'badge-role-student',
    description: 'Enrolls in courses, attends class, and takes evaluations.'
  },
  {
    value: 'LECTURER',
    label: 'Lecturer',
    badgeClass: 'badge-role-lecturer',
    description: 'Conducts classes, marks attendance, and manages sessions.'
  },
  {
    value: 'ADMIN',
    label: 'Administrator',
    badgeClass: 'badge-role-admin',
    description: 'Manages curriculum, schedule, and course registration.'
  },
  {
    value: 'SUPER_ADMIN',
    label: 'Super Admin',
    badgeClass: 'badge-role-superadmin',
    description: 'Full system privileges including all user management & CRUD.'
  },
  {
    value: 'FINANCE',
    label: 'Finance',
    badgeClass: 'badge-role-finance',
    description: 'Manages lecturer claims, financial records, and audits.'
  }
];

// Check if a user ID belongs to the current logged-in super admin
const isCurrentUser = (id) => {
  return authStore.user?.id === id || authStore.profile?.id === id;
};

// Fetch all users (Supabase primary + backend fallback)
const fetchUsers = async () => {
  isLoading.value = true;
  try {
    let fetchedList = null;

    // 1. Try Supabase first
    try {
      const { data: supaUsers, error: supaErr } = await supabase
        .from('users')
        .select('*, programmes(id, name)')
        .order('created_at', { ascending: false });

      if (!supaErr && supaUsers && supaUsers.length > 0) {
        fetchedList = supaUsers.map(u => {
          const rawRole = (u.role || 'Student').toUpperCase().replace(/[\s_-]+/g, '_');
          let displayRole = 'STUDENT';
          if (rawRole.includes('SUPER')) displayRole = 'SUPER_ADMIN';
          else if (rawRole === 'ADMIN') displayRole = 'ADMIN';
          else if (rawRole === 'LECTURER' || rawRole === 'STAFF') displayRole = 'LECTURER';
          else if (rawRole === 'FINANCE') displayRole = 'FINANCE';

          return {
            id: u.id,
            displayId: u.id_number || u.student_id || (u.id.length > 18 ? u.id.slice(0, 8) + '...' : u.id),
            name: u.name || u.full_name || 'Unnamed User',
            email: u.email || '—',
            role: displayRole,
            program: u.program || u.programmes?.name || u.mode || '—',
            program_id: u.program_id,
            createdAt: u.created_at || u.updated_at || new Date().toISOString()
          };
        });
      }
    } catch (sbErr) {
      console.warn('Supabase query failed, falling back to local API:', sbErr);
    }

    // 2. If Supabase yielded no records or failed, try backend Express API
    if (!fetchedList || fetchedList.length === 0) {
      try {
        const res = await api.get('/users');
        if (res.data?.users && res.data.users.length > 0) {
          fetchedList = res.data.users.map(u => ({
            ...u,
            displayId: u.id
          }));
          if (res.data.stats) {
            stats.value = res.data.stats;
          }
        }
      } catch (apiErr) {
        // Backend offline or unreachable
        console.warn('Local Express server offline:', apiErr.message);
      }
    }

    if (fetchedList) {
      users.value = fetchedList;

      // Realtime KPI metrics
      const total = users.value.length;
      const students = users.value.filter(u => u.role === 'STUDENT').length;
      const lecturers = users.value.filter(u => u.role === 'LECTURER').length;
      const admins = users.value.filter(u => u.role === 'ADMIN').length;
      const superAdmins = users.value.filter(u => u.role === 'SUPER_ADMIN').length;
      const finance = users.value.filter(u => u.role === 'FINANCE').length;

      stats.value = { total, students, lecturers, admins, superAdmins, finance };
    } else {
      users.value = [];
    }
  } catch (err) {
    console.error('Failed to fetch users:', err);
    showAlert('Could not load user accounts. Please check your network or database connection.', 'error');
  } finally {
    isLoading.value = false;
  }
};

onMounted(async () => {
  await fetchUsers();
  // Load programmes for select dropdown
  try {
    const { data } = await supabase.from('programmes').select('id, name').order('name');
    if (data) availableProgrammes.value = data;
  } catch (e) {
    console.warn('Could not load programmes list:', e);
  }
});

// Filter & Sort Users
const filteredUsers = computed(() => {
  let list = [...users.value];

  // Search filter
  if (searchQuery.value.trim()) {
    const q = searchQuery.value.toLowerCase().trim();
    list = list.filter(u => 
      (u.name && u.name.toLowerCase().includes(q)) ||
      (u.email && u.email.toLowerCase().includes(q)) ||
      (u.id && u.id.toLowerCase().includes(q)) ||
      (u.displayId && u.displayId.toLowerCase().includes(q)) ||
      (u.program && u.program.toLowerCase().includes(q))
    );
  }

  // Role filter
  if (roleFilter.value !== 'all') {
    list = list.filter(u => u.role === roleFilter.value);
  }

  // Sorting
  if (sortBy.value === 'newest') {
    list.sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0));
  } else if (sortBy.value === 'oldest') {
    list.sort((a, b) => new Date(a.createdAt || 0) - new Date(b.createdAt || 0));
  } else if (sortBy.value === 'name_asc') {
    list.sort((a, b) => (a.name || '').localeCompare(b.name || ''));
  } else if (sortBy.value === 'name_desc') {
    list.sort((a, b) => (b.name || '').localeCompare(a.name || ''));
  } else if (sortBy.value === 'role') {
    list.sort((a, b) => (a.role || '').localeCompare(b.role || ''));
  }

  return list;
});

const resetFilters = () => {
  searchQuery.value = '';
  roleFilter.value = 'all';
  sortBy.value = 'newest';
};

// Modal Operations
const openCreateModal = () => {
  isEditing.value = false;
  modalError.value = '';
  showModalPassword.value = false;
  userForm.value = {
    id: '',
    name: '',
    email: '',
    role: 'STUDENT',
    program: '',
    password: ''
  };
  isModalOpen.value = true;
};

const openEditModal = (user) => {
  isEditing.value = true;
  modalError.value = '';
  showModalPassword.value = false;
  userForm.value = {
    id: user.id,
    name: user.name || '',
    email: user.email === '—' ? '' : (user.email || ''),
    role: user.role || 'STUDENT',
    program: user.program === '—' ? '' : (user.program || ''),
    password: ''
  };
  isModalOpen.value = true;
};

const closeModal = () => {
  isModalOpen.value = false;
  modalError.value = '';
};

// Save User (Create or Update)
const saveUser = async () => {
  modalError.value = '';
  isSaving.value = true;

  try {
    const roleString = userForm.value.role === 'SUPER_ADMIN' ? 'Super Admin' :
                       userForm.value.role === 'ADMIN' ? 'Admin' :
                       userForm.value.role === 'LECTURER' ? 'Lecturer' :
                       userForm.value.role === 'FINANCE' ? 'Finance' : 'Student';

    if (isEditing.value) {
      // 1. Update in Supabase
      const updateData = {
        name: userForm.value.name.trim(),
        role: roleString,
        updated_at: new Date().toISOString()
      };
      if (userForm.value.email) updateData.email = userForm.value.email.trim().toLowerCase();
      if (userForm.value.program) updateData.program = userForm.value.program;

      const { error: supaErr } = await supabase
        .from('users')
        .update(updateData)
        .eq('id', userForm.value.id);

      // 2. Also sync to backend API if available
      try {
        await api.put(`/users/${userForm.value.id}`, {
          name: userForm.value.name,
          email: userForm.value.email,
          role: userForm.value.role,
          program: userForm.value.program,
          password: userForm.value.password || undefined
        });
      } catch {}

      if (supaErr) {
        throw new Error(supaErr.message);
      }

      showAlert(`User '${userForm.value.name}' updated successfully!`, 'success');
    } else {
      // Create user
      let created = false;

      // 1. Try Express backend API first if running (allows custom ID + password hashing)
      try {
        const res = await api.post('/users', {
          id: userForm.value.id ? userForm.value.id.trim() : undefined,
          name: userForm.value.name.trim(),
          email: userForm.value.email.trim().toLowerCase(),
          role: userForm.value.role,
          program: userForm.value.program,
          password: userForm.value.password
        });
        if (res.status === 201) created = true;
      } catch (apiErr) {
        // Backend not running or gave an error
      }

      // 2. Try Supabase Auth SignUp if not created by backend
      if (!created) {
        const { data: signUpData, error: signUpErr } = await supabase.auth.signUp({
          email: userForm.value.email.trim().toLowerCase(),
          password: userForm.value.password,
          options: {
            data: {
              full_name: userForm.value.name.trim(),
              role: roleString,
              id_number: userForm.value.id || undefined,
              program: userForm.value.program || undefined
            }
          }
        });

        if (signUpErr) {
          throw new Error(signUpErr.message);
        }
      }

      showAlert(`User '${userForm.value.name}' created successfully!`, 'success');
    }

    closeModal();
    await fetchUsers();
  } catch (err) {
    console.error('Save user error:', err);
    modalError.value = err.message || 'Operation failed. Please verify inputs.';
  } finally {
    isSaving.value = false;
  }
};

// Delete Modal Operations
const openDeleteModal = (user) => {
  if (isCurrentUser(user.id)) {
    showAlert('You cannot delete your own logged-in Super Admin account.', 'error');
    return;
  }
  userToDelete.value = user;
  isDeleteModalOpen.value = true;
};

const closeDeleteModal = () => {
  isDeleteModalOpen.value = false;
  userToDelete.value = null;
};

const confirmDeleteUser = async () => {
  if (!userToDelete.value) return;
  isDeleting.value = true;

  try {
    // 1. Delete from Supabase
    const { error: supaErr } = await supabase
      .from('users')
      .delete()
      .eq('id', userToDelete.value.id);

    // 2. Also try deleting from backend DB if running
    try {
      await api.delete(`/users/${userToDelete.value.id}`);
    } catch {}

    if (supaErr) {
      throw new Error(supaErr.message);
    }

    showAlert(`User '${userToDelete.value.name}' was successfully deleted.`, 'success');
    closeDeleteModal();
    await fetchUsers();
  } catch (err) {
    console.error('Delete user error:', err);
    showAlert(err.message || 'Failed to delete user account.', 'error');
    closeDeleteModal();
  } finally {
    isDeleting.value = false;
  }
};

// UI Helpers
const getInitials = (name) => {
  if (!name) return 'U';
  return name.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2);
};

const formatRole = (role) => {
  if (!role) return 'Student';
  const r = role.toUpperCase();
  if (r === 'SUPER_ADMIN') return 'Super Admin';
  if (r === 'ADMIN') return 'Admin';
  if (r === 'LECTURER') return 'Lecturer';
  if (r === 'FINANCE') return 'Finance';
  return 'Student';
};

const getRoleBadgeClass = (role) => {
  const r = (role || '').toUpperCase();
  if (r === 'SUPER_ADMIN') return 'role-superadmin';
  if (r === 'ADMIN') return 'role-admin';
  if (r === 'LECTURER') return 'role-lecturer';
  if (r === 'FINANCE') return 'role-finance';
  return 'role-student';
};

const getAvatarClass = (role) => {
  const r = (role || '').toUpperCase();
  if (r === 'SUPER_ADMIN') return 'avatar-superadmin';
  if (r === 'ADMIN') return 'avatar-admin';
  if (r === 'LECTURER') return 'avatar-lecturer';
  if (r === 'FINANCE') return 'avatar-finance';
  return 'avatar-student';
};

const formatDate = (dateStr) => {
  if (!dateStr) return '—';
  try {
    const d = new Date(dateStr);
    return d.toLocaleDateString('en-GB', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    });
  } catch {
    return dateStr;
  }
};
</script>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap');

.users-admin-container {
  font-family: 'Inter', sans-serif;
  max-width: 1400px;
  margin: 0 auto;
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

/* Page Header */
.page-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  flex-wrap: wrap;
  gap: 1rem;
}

.badge-superadmin {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 4px 12px;
  background: linear-gradient(135deg, rgba(124, 58, 237, 0.12), rgba(219, 39, 119, 0.12));
  color: #7c3aed;
  border: 1px solid rgba(124, 58, 237, 0.25);
  border-radius: 9999px;
  font-size: 0.75rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  margin-bottom: 0.5rem;
}

.badge-superadmin svg {
  width: 14px;
  height: 14px;
}

.page-title {
  font-size: 2rem;
  font-weight: 800;
  color: #0f172a;
  margin: 0 0 0.25rem 0;
  letter-spacing: -0.02em;
}

.page-subtitle {
  color: #64748b;
  font-size: 0.95rem;
  margin: 0;
}

.header-actions {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

/* KPI Grid */
.kpi-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
  gap: 1rem;
}

.kpi-card {
  background: white;
  border-radius: 16px;
  padding: 1.25rem;
  display: flex;
  align-items: center;
  gap: 1rem;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
  border: 1px solid #e2e8f0;
  cursor: pointer;
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
}

.kpi-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 16px rgba(0, 0, 0, 0.06);
  border-color: #cbd5e1;
}

.kpi-card.active-card {
  border-color: #6366f1;
  background: #fdfcff;
  box-shadow: 0 0 0 2px rgba(99, 102, 241, 0.2);
}

.kpi-icon {
  width: 44px;
  height: 44px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.kpi-icon svg {
  width: 22px;
  height: 22px;
}

.kpi-all { background: #f1f5f9; color: #475569; }
.kpi-student { background: #ecfdf5; color: #059669; }
.kpi-lecturer { background: #eff6ff; color: #2563eb; }
.kpi-admin { background: #fef2f2; color: #dc2626; }
.kpi-superadmin { background: #f5f3ff; color: #7c3aed; }
.kpi-finance { background: #fffbeb; color: #d97706; }

.kpi-details {
  display: flex;
  flex-direction: column;
}

.kpi-label {
  font-size: 0.75rem;
  font-weight: 600;
  text-transform: uppercase;
  color: #64748b;
  letter-spacing: 0.05em;
}

.kpi-value {
  font-size: 1.5rem;
  font-weight: 800;
  color: #0f172a;
  margin: 0;
  line-height: 1.2;
}

/* Controls Card */
.table-controls-card {
  background: white;
  border-radius: 16px;
  padding: 1rem 1.25rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 1rem;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
  border: 1px solid #e2e8f0;
}

.search-box {
  position: relative;
  display: flex;
  align-items: center;
  flex: 1;
  min-width: 280px;
}

.search-icon {
  position: absolute;
  left: 14px;
  width: 18px;
  height: 18px;
  color: #94a3b8;
  pointer-events: none;
}

.search-input {
  width: 100%;
  padding: 10px 38px 10px 42px;
  background: #f8fafc;
  border: 1.5px solid #e2e8f0;
  border-radius: 12px;
  font-size: 0.9rem;
  color: #0f172a;
  outline: none;
  transition: all 0.2s;
}

.search-input:focus {
  background: white;
  border-color: #6366f1;
  box-shadow: 0 0 0 3px rgba(99, 102, 241, 0.12);
}

.clear-search-btn {
  position: absolute;
  right: 12px;
  background: none;
  border: none;
  color: #94a3b8;
  cursor: pointer;
  padding: 2px;
  display: flex;
}

.clear-search-btn svg {
  width: 16px;
  height: 16px;
}

.filters-row {
  display: flex;
  align-items: center;
  gap: 1rem;
  flex-wrap: wrap;
}

.filter-group {
  display: flex;
  align-items: center;
  gap: 6px;
}

.filter-label {
  font-size: 0.85rem;
  font-weight: 600;
  color: #64748b;
}

.filter-select {
  padding: 8px 12px;
  background: #f8fafc;
  border: 1.5px solid #e2e8f0;
  border-radius: 10px;
  font-size: 0.85rem;
  font-weight: 500;
  color: #334155;
  outline: none;
  cursor: pointer;
  transition: all 0.2s;
}

.filter-select:focus {
  border-color: #6366f1;
  background: white;
}

/* Alert Banner */
.alert-banner {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 16px;
  border-radius: 12px;
  font-size: 0.9rem;
  font-weight: 500;
  position: relative;
}

.alert-banner.success {
  background: #ecfdf5;
  color: #065f46;
  border: 1px solid #a7f3d0;
}

.alert-banner.error {
  background: #fef2f2;
  color: #991b1b;
  border: 1px solid #fecaca;
}

.alert-banner svg {
  width: 20px;
  height: 20px;
  flex-shrink: 0;
}

.alert-close {
  margin-left: auto;
  background: none;
  border: none;
  font-size: 1.25rem;
  line-height: 1;
  color: currentColor;
  cursor: pointer;
  opacity: 0.7;
}

.alert-close:hover {
  opacity: 1;
}

/* Table Card */
.table-card {
  background: white;
  border-radius: 20px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.04);
  border: 1px solid #e2e8f0;
  overflow: hidden;
}

.table-responsive {
  overflow-x: auto;
}

.users-table {
  width: 100%;
  border-collapse: collapse;
  text-align: left;
}

.users-table th {
  background: #f8fafc;
  padding: 14px 20px;
  font-size: 0.75rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.06em;
  color: #64748b;
  border-bottom: 1px solid #e2e8f0;
}

.users-table td {
  padding: 16px 20px;
  border-bottom: 1px solid #f1f5f9;
  vertical-align: middle;
}

.user-row {
  transition: background-color 0.15s ease;
}

.user-row:hover {
  background-color: #f8fafc;
}

/* User Cell */
.user-cell {
  display: flex;
  align-items: center;
  gap: 12px;
}

.avatar-badge {
  width: 40px;
  height: 40px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 700;
  font-size: 0.85rem;
  flex-shrink: 0;
}

.avatar-superadmin {
  background: linear-gradient(135deg, #8b5cf6, #ec4899);
  color: white;
  box-shadow: 0 4px 10px rgba(139, 92, 246, 0.3);
}

.avatar-admin {
  background: linear-gradient(135deg, #ef4444, #f97316);
  color: white;
  box-shadow: 0 4px 10px rgba(239, 68, 68, 0.25);
}

.avatar-lecturer {
  background: linear-gradient(135deg, #3b82f6, #06b6d4);
  color: white;
  box-shadow: 0 4px 10px rgba(59, 130, 246, 0.25);
}

.avatar-student {
  background: linear-gradient(135deg, #10b981, #059669);
  color: white;
  box-shadow: 0 4px 10px rgba(16, 185, 129, 0.25);
}

.avatar-finance {
  background: linear-gradient(135deg, #f59e0b, #d97706);
  color: white;
  box-shadow: 0 4px 10px rgba(245, 158, 11, 0.25);
}

.user-meta {
  display: flex;
  flex-direction: column;
}

.user-name {
  font-size: 0.95rem;
  font-weight: 600;
  color: #0f172a;
}

.user-id-tag {
  font-size: 0.75rem;
  color: #64748b;
  font-family: monospace;
}

/* Email Cell */
.email-text {
  font-size: 0.9rem;
  color: #334155;
}

/* Role Badges */
.role-badge {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 4px 10px;
  border-radius: 9999px;
  font-size: 0.75rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.04em;
}

.role-dot {
  width: 6px;
  height: 6px;
  border-radius: 50%;
}

.role-superadmin {
  background: #f5f3ff;
  color: #7c3aed;
  border: 1px solid #ddd6fe;
}
.role-superadmin .role-dot { background: #7c3aed; }

.role-admin {
  background: #fef2f2;
  color: #dc2626;
  border: 1px solid #fecaca;
}
.role-admin .role-dot { background: #dc2626; }

.role-lecturer {
  background: #eff6ff;
  color: #2563eb;
  border: 1px solid #bfdbfe;
}
.role-lecturer .role-dot { background: #2563eb; }

.role-student {
  background: #ecfdf5;
  color: #059669;
  border: 1px solid #a7f3d0;
}
.role-student .role-dot { background: #059669; }

.role-finance {
  background: #fffbeb;
  color: #d97706;
  border: 1px solid #fde68a;
}
.role-finance .role-dot { background: #d97706; }

.program-text {
  font-size: 0.85rem;
  color: #475569;
}

.date-text {
  font-size: 0.85rem;
  color: #64748b;
}

/* Action Buttons */
.action-buttons {
  display: flex;
  justify-content: flex-end;
  gap: 6px;
}

.action-btn {
  width: 32px;
  height: 32px;
  border-radius: 8px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border: 1px solid #e2e8f0;
  background: white;
  cursor: pointer;
  transition: all 0.15s ease;
  color: #64748b;
}

.action-btn svg {
  width: 16px;
  height: 16px;
}

.edit-btn:hover {
  background: #eff6ff;
  border-color: #bfdbfe;
  color: #2563eb;
}

.delete-btn:hover {
  background: #fef2f2;
  border-color: #fecaca;
  color: #dc2626;
}

.disabled-btn {
  opacity: 0.4;
  cursor: not-allowed;
  pointer-events: none;
}

/* Table Footer */
.table-footer {
  padding: 14px 20px;
  background: #f8fafc;
  border-top: 1px solid #e2e8f0;
  font-size: 0.85rem;
  color: #64748b;
}

/* Buttons */
.primary-btn {
  background: linear-gradient(135deg, #4f46e5, #3b82f6);
  color: white;
  border: none;
  padding: 10px 18px;
  border-radius: 12px;
  font-size: 0.9rem;
  font-weight: 600;
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  gap: 8px;
  box-shadow: 0 4px 12px rgba(79, 70, 229, 0.25);
  transition: all 0.2s;
}

.primary-btn:hover:not(:disabled) {
  transform: translateY(-1px);
  box-shadow: 0 6px 16px rgba(79, 70, 229, 0.35);
}

.primary-btn:disabled {
  opacity: 0.7;
  cursor: not-allowed;
}

.secondary-btn {
  background: white;
  color: #334155;
  border: 1.5px solid #e2e8f0;
  padding: 10px 16px;
  border-radius: 12px;
  font-size: 0.9rem;
  font-weight: 600;
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  gap: 8px;
  transition: all 0.2s;
}

.secondary-btn:hover:not(:disabled) {
  background: #f8fafc;
  border-color: #cbd5e1;
}

.danger-btn {
  background: #dc2626;
  color: white;
  border: none;
  padding: 10px 18px;
  border-radius: 12px;
  font-size: 0.9rem;
  font-weight: 600;
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  gap: 8px;
  box-shadow: 0 4px 12px rgba(220, 38, 38, 0.25);
  transition: all 0.2s;
}

.danger-btn:hover:not(:disabled) {
  background: #b91c1c;
  transform: translateY(-1px);
}

.clear-btn {
  background: transparent;
  color: #64748b;
  border: 1px solid #cbd5e1;
  padding: 10px 16px;
  border-radius: 12px;
  font-size: 0.9rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
}

.clear-btn:hover {
  background: #f1f5f9;
  color: #0f172a;
}

/* Loading & Empty States */
.loading-state, .empty-state {
  padding: 4rem 2rem;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  text-align: center;
}

.empty-icon {
  width: 56px;
  height: 56px;
  border-radius: 16px;
  background: #f1f5f9;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #94a3b8;
  margin-bottom: 1rem;
}

.empty-icon svg {
  width: 28px;
  height: 28px;
}

.empty-state h3 {
  font-size: 1.25rem;
  font-weight: 700;
  color: #0f172a;
  margin: 0 0 0.5rem 0;
}

.empty-state p {
  color: #64748b;
  max-width: 420px;
  margin: 0 0 1.5rem 0;
  font-size: 0.95rem;
}

/* Spinner */
.spinner-large {
  width: 40px;
  height: 40px;
  border: 3px solid #e2e8f0;
  border-top-color: #6366f1;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
  margin-bottom: 1rem;
}

.spinner-sm {
  width: 18px;
  height: 18px;
}

.spin {
  animation: spin 0.8s linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

/* ── Modal Styles ─────────────────────────────────────────── */
.modal-backdrop {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(15, 23, 42, 0.6);
  backdrop-filter: blur(6px);
  z-index: 1100;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 1rem;
}

.modal-card {
  background: white;
  border-radius: 24px;
  width: 100%;
  max-width: 640px;
  max-height: 90vh;
  overflow-y: auto;
  box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
  animation: modal-appear 0.25s ease-out;
  padding: 2rem;
}

.modal-card-sm {
  max-width: 460px;
  text-align: center;
}

@keyframes modal-appear {
  from {
    opacity: 0;
    transform: scale(0.95) translateY(10px);
  }
  to {
    opacity: 1;
    transform: scale(1) translateY(0);
  }
}

.modal-header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  margin-bottom: 1.5rem;
}

.modal-title-wrap {
  display: flex;
  align-items: center;
  gap: 12px;
}

.modal-header-icon {
  width: 44px;
  height: 44px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.modal-header-icon.icon-create {
  background: #f5f3ff;
  color: #7c3aed;
}

.modal-header-icon.icon-edit {
  background: #eff6ff;
  color: #2563eb;
}

.modal-header-icon svg {
  width: 22px;
  height: 22px;
}

.modal-title {
  font-size: 1.25rem;
  font-weight: 800;
  color: #0f172a;
  margin: 0;
}

.modal-subtitle {
  font-size: 0.85rem;
  color: #64748b;
  margin: 2px 0 0 0;
}

.close-btn {
  background: #f1f5f9;
  border: none;
  border-radius: 10px;
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #64748b;
  cursor: pointer;
  transition: all 0.15s;
}

.close-btn:hover {
  background: #e2e8f0;
  color: #0f172a;
}

.close-btn svg {
  width: 18px;
  height: 18px;
}

.modal-form {
  display: flex;
  flex-direction: column;
  gap: 1.25rem;
}

.modal-error-banner {
  background: #fef2f2;
  color: #dc2626;
  padding: 10px 14px;
  border-radius: 10px;
  border: 1px solid #fecaca;
  font-size: 0.85rem;
  font-weight: 500;
  display: flex;
  align-items: center;
  gap: 8px;
}

.modal-error-banner svg {
  width: 18px;
  height: 18px;
  flex-shrink: 0;
}

/* Role Selector Grid */
.role-selector-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(110px, 1fr));
  gap: 8px;
  margin-top: 6px;
}

.role-option-card {
  padding: 10px;
  border: 1.5px solid #e2e8f0;
  border-radius: 12px;
  cursor: pointer;
  transition: all 0.2s;
  background: #f8fafc;
}

.role-option-card:hover {
  background: white;
  border-color: #cbd5e1;
}

.role-option-card.selected {
  background: #f5f3ff;
  border-color: #7c3aed;
  box-shadow: 0 0 0 2px rgba(124, 58, 237, 0.15);
}

.role-card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.role-card-title {
  font-size: 0.8rem;
  font-weight: 700;
  color: #0f172a;
}

.role-card-radio {
  width: 12px;
  height: 12px;
  border-radius: 50%;
  border: 1.5px solid #cbd5e1;
  transition: all 0.2s;
}

.role-option-card.selected .role-card-radio {
  border-color: #7c3aed;
  background: #7c3aed;
}

.role-card-desc {
  font-size: 0.7rem;
  color: #64748b;
  margin: 4px 0 0 0;
  line-height: 1.2;
}

/* Form Inputs */
.form-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1rem;
}

@media (max-width: 600px) {
  .form-row {
    grid-template-columns: 1fr;
  }
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.input-label {
  font-size: 0.85rem;
  font-weight: 600;
  color: #334155;
}

.required {
  color: #dc2626;
}

.hint-inline {
  font-weight: 400;
  font-size: 0.75rem;
  color: #94a3b8;
  margin-left: 4px;
}

.field-hint {
  font-size: 0.75rem;
  color: #94a3b8;
  margin: 2px 0 0 0;
}

.form-input {
  width: 100%;
  padding: 10px 14px;
  background: #f8fafc;
  border: 1.5px solid #e2e8f0;
  border-radius: 12px;
  font-size: 0.9rem;
  color: #0f172a;
  outline: none;
  transition: all 0.2s;
  box-sizing: border-box;
}

.form-input:focus {
  background: white;
  border-color: #6366f1;
  box-shadow: 0 0 0 3px rgba(99, 102, 241, 0.12);
}

.form-input:disabled {
  background: #f1f5f9;
  color: #94a3b8;
  cursor: not-allowed;
}

.password-input-wrap {
  position: relative;
  display: flex;
  align-items: center;
}

.eye-btn {
  position: absolute;
  right: 12px;
  background: none;
  border: none;
  color: #94a3b8;
  cursor: pointer;
  padding: 2px;
  display: flex;
}

.eye-btn:hover {
  color: #475569;
}

.eye-btn svg {
  width: 18px;
  height: 18px;
}

.modal-actions {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
  margin-top: 1rem;
  padding-top: 1rem;
  border-top: 1px solid #f1f5f9;
}

/* Delete Modal Styling */
.delete-icon-wrap {
  width: 56px;
  height: 56px;
  border-radius: 20px;
  background: #fef2f2;
  color: #dc2626;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto 1.25rem auto;
}

.delete-icon-wrap svg {
  width: 28px;
  height: 28px;
}

.delete-title {
  font-size: 1.25rem;
  font-weight: 800;
  color: #0f172a;
  margin: 0 0 0.5rem 0;
}

.delete-desc {
  font-size: 0.95rem;
  color: #64748b;
  margin: 0 0 1rem 0;
}

.delete-desc code {
  background: #f1f5f9;
  padding: 2px 6px;
  border-radius: 4px;
  font-size: 0.85rem;
  color: #0f172a;
}

.delete-warning-box {
  background: #fffbeb;
  border: 1px solid #fef3c7;
  border-radius: 12px;
  padding: 10px 14px;
  margin-bottom: 1.5rem;
}

.delete-warning-box p {
  font-size: 0.8rem;
  color: #92400e;
  margin: 0;
  line-height: 1.4;
  text-align: left;
}

.modal-actions-center {
  display: flex;
  justify-content: center;
  gap: 12px;
}

.text-right {
  text-align: right;
}
</style>
