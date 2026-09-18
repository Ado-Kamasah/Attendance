<template>
  <div class="space-y-8 p-1 sm:p-2 lg:p-4 animate-in fade-in duration-500">

    <!-- Header -->
    <div class="relative bg-white dark:bg-dark-surface border border-slate-200/80 dark:border-dark-outline/60 rounded-2xl p-6 sm:p-8 shadow-sm overflow-hidden">
      <div class="absolute inset-0 bg-[radial-gradient(#031c45_1px,transparent_1px)] dark:bg-[radial-gradient(#bc9333_1px,transparent_1px)] opacity-[0.03] dark:opacity-[0.05] bg-[size:16px_16px] pointer-events-none"></div>
      <div class="absolute top-2 left-2 w-3 h-3 border-t-2 border-l-2 border-secondary/40 pointer-events-none"></div>
      <div class="absolute top-2 right-2 w-3 h-3 border-t-2 border-r-2 border-secondary/40 pointer-events-none"></div>

      <div class="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-5">
        <div>
          <div class="flex items-center gap-2 mb-1.5">
            <span class="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-mono font-medium tracking-wide uppercase bg-violet-50 dark:bg-violet-950/40 text-violet-700 dark:text-violet-400 border border-violet-200 dark:border-violet-800">
              <Star class="w-3 h-3" />
              SUPER ADMIN CONTROL
            </span>
          </div>
          <h1 class="text-2xl sm:text-3xl font-display font-bold text-slate-900 dark:text-white tracking-tight">User Management</h1>
          <p class="text-sm text-slate-500 dark:text-white/75 mt-1">Provision, inspect, update, and manage access roles across the institution.</p>
        </div>

        <div class="flex items-center gap-3">
          <button
            @click="fetchUsers"
            :disabled="isLoading"
            class="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl border border-slate-200 dark:border-dark-outline/70 bg-white dark:bg-dark-muted text-slate-600 dark:text-white/90 hover:text-primary dark:hover:text-secondary text-sm font-medium transition-all shadow-sm disabled:opacity-50"
          >
            <RefreshCw class="w-4 h-4" :class="{ 'animate-spin': isLoading }" />
            <span>Refresh</span>
          </button>

          <button
            id="btn-add-user"
            @click="openCreateModal"
            class="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-primary hover:bg-primary/90 text-white text-sm font-semibold transition-all shadow-md hover:shadow-lg active:scale-95"
          >
            <UserPlus class="w-4 h-4" />
            <span>Add New User</span>
          </button>
        </div>
      </div>
    </div>

    <!-- KPI Filter Strip -->
    <div class="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
      <button
        v-for="kpiItem in kpiItems" :key="kpiItem.filter"
        @click="roleFilter = kpiItem.filter"
        :class="['relative group rounded-2xl p-4 border text-left transition-all shadow-sm hover:shadow-md focus:outline-none',
          roleFilter === kpiItem.filter
            ? 'bg-primary dark:bg-dark-surface border-primary/80 dark:border-secondary/60 ring-2 ring-primary/30 dark:ring-secondary/30'
            : 'bg-white dark:bg-dark-surface border-slate-200 dark:border-dark-outline hover:border-slate-300 dark:hover:border-dark-outline'
        ]"
      >
        <div :class="['w-9 h-9 rounded-xl flex items-center justify-center mb-3', roleFilter === kpiItem.filter ? 'bg-white/20' : kpiItem.iconBg]">
          <component :is="kpiItem.icon" :class="['w-4.5 h-4.5', roleFilter === kpiItem.filter ? 'text-white' : kpiItem.iconColor]" class="w-4 h-4" />
        </div>
        <div :class="['text-2xl font-display font-extrabold', roleFilter === kpiItem.filter ? 'text-white' : 'text-slate-900 dark:text-white']">
          {{ stats[kpiItem.statKey] }}
        </div>
        <div :class="['text-[11px] font-mono uppercase tracking-wider mt-0.5', roleFilter === kpiItem.filter ? 'text-white/70' : 'text-slate-400']">
          {{ kpiItem.label }}
        </div>
        <div v-if="roleFilter === kpiItem.filter" class="absolute top-2 right-2 w-2 h-2 rounded-full bg-secondary"></div>
      </button>
    </div>

    <!-- Search & Filter Bar -->
    <div class="bg-white dark:bg-dark-surface border border-slate-200/80 dark:border-dark-outline/60 rounded-2xl p-5 shadow-sm">
      <div class="flex flex-col sm:flex-row gap-3">
        <!-- Search -->
        <div class="flex-1 relative">
          <Search class="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            v-model="searchQuery"
            id="user-search-input"
            placeholder="Search by name, email, or user ID..."
            class="w-full pl-10 pr-10 py-2.5 bg-slate-50 dark:bg-dark-muted/80 border border-slate-200 dark:border-dark-outline/70 rounded-xl text-sm text-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-secondary/50 focus:border-secondary transition-all placeholder:text-slate-400"
          />
          <button v-if="searchQuery" @click="searchQuery = ''" class="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300">
            <X class="w-4 h-4" />
          </button>
        </div>

        <!-- Role Filter -->
        <select
          v-model="roleFilter"
          id="user-role-filter"
          class="bg-slate-50 dark:bg-dark-muted/80 border border-slate-200 dark:border-dark-outline/70 rounded-xl px-3 py-2.5 text-sm text-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-secondary/50 min-w-[180px]"
        >
          <option value="all">All Roles ({{ stats.total }})</option>
          <option value="SUPER_ADMIN">Super Admins ({{ stats.superAdmins }})</option>
          <option value="ADMIN">Administrators ({{ stats.admins }})</option>
          <option value="LECTURER">Lecturers ({{ stats.lecturers }})</option>
          <option value="STUDENT">Students ({{ stats.students }})</option>
          <option value="FINANCE">Finance ({{ stats.finance }})</option>
        </select>

        <!-- Sort -->
        <select
          v-model="sortBy"
          class="bg-slate-50 dark:bg-dark-muted/80 border border-slate-200 dark:border-dark-outline/70 rounded-xl px-3 py-2.5 text-sm text-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-secondary/50 min-w-[160px]"
        >
          <option value="newest">Newest First</option>
          <option value="oldest">Oldest First</option>
          <option value="name_asc">Name (A–Z)</option>
          <option value="name_desc">Name (Z–A)</option>
          <option value="role">By Role</option>
        </select>

        <button v-if="searchQuery || roleFilter !== 'all'" @click="resetFilters"
          class="px-4 py-2.5 rounded-xl border border-rose-200 dark:border-rose-800 text-rose-600 dark:text-rose-400 text-sm font-medium hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-all flex items-center gap-1.5"
        >
          <RotateCcw class="w-3.5 h-3.5" />
          Reset
        </button>
      </div>
    </div>

    <!-- Alert Banner -->
    <transition name="fade">
      <div
        v-if="alertMessage"
        :class="['flex items-center gap-3 px-4 py-3 rounded-xl border text-sm font-medium',
          alertType === 'success'
            ? 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-400'
            : 'bg-rose-50 dark:bg-rose-950/40 border-rose-200 dark:border-rose-800 text-rose-700 dark:text-rose-400'
        ]"
      >
        <CheckCircle2 v-if="alertType === 'success'" class="w-4 h-4 flex-shrink-0" />
        <AlertCircle v-else class="w-4 h-4 flex-shrink-0" />
        <span class="flex-1">{{ alertMessage }}</span>
        <button @click="alertMessage = ''" class="opacity-60 hover:opacity-100"><X class="w-4 h-4" /></button>
      </div>
    </transition>

    <!-- Users Table -->
    <div class="bg-white dark:bg-dark-surface border border-slate-200/80 dark:border-dark-outline/60 rounded-2xl shadow-sm overflow-hidden">
      <!-- Loading -->
      <div v-if="isLoading" class="flex flex-col items-center justify-center py-20">
        <Loader2 class="w-10 h-10 text-secondary animate-spin mb-4" />
        <p class="text-sm font-mono text-slate-500 dark:text-white/75">LOADING USER ACCOUNTS...</p>
      </div>

      <!-- Empty -->
      <div v-else-if="filteredUsers.length === 0" class="p-12 text-center">
        <div class="w-14 h-14 rounded-2xl bg-slate-100 dark:bg-dark-muted flex items-center justify-center mx-auto mb-4 text-slate-400">
          <UserX class="w-7 h-7" />
        </div>
        <h3 class="font-display font-bold text-slate-900 dark:text-white text-base">No Users Found</h3>
        <p class="text-sm text-slate-500 dark:text-white/75 mt-1">
          {{ searchQuery || roleFilter !== 'all' ? 'No accounts matched your filters.' : 'No accounts created yet.' }}
        </p>
        <button v-if="searchQuery || roleFilter !== 'all'" @click="resetFilters"
          class="mt-4 inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-primary text-white text-xs font-semibold hover:bg-primary/90 transition-all shadow-sm"
        >
          <RotateCcw class="w-3.5 h-3.5" /> Reset Filters
        </button>
        <button v-else @click="openCreateModal"
          class="mt-4 inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-primary text-white text-xs font-semibold hover:bg-primary/90 transition-all shadow-sm"
        >
          <UserPlus class="w-3.5 h-3.5" /> Add First User
        </button>
      </div>

      <!-- Table -->
      <div v-else class="overflow-x-auto">
        <table class="w-full text-left border-collapse text-xs">
          <thead>
            <tr class="bg-slate-50/80 dark:bg-slate-900/50 border-b border-slate-200 dark:border-dark-outline text-slate-500 dark:text-white/75 font-mono uppercase text-[11px] tracking-wider">
              <th class="py-3 px-4 font-semibold">User</th>
              <th class="py-3 px-4 font-semibold">Email</th>
              <th class="py-3 px-4 font-semibold">Role</th>
              <th class="py-3 px-4 font-semibold">Program / Dept</th>
              <th class="py-3 px-4 font-semibold">Registered</th>
              <th class="py-3 px-4 font-semibold text-right">Actions</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-slate-100 dark:divide-slate-800/60 font-sans">
            <tr v-for="user in filteredUsers" :key="user.id" class="hover:bg-slate-50/60 dark:hover:bg-slate-800/30 transition-colors">
              <!-- User -->
              <td class="py-3.5 px-4">
                <div class="flex items-center gap-2.5">
                  <div :class="['w-8 h-8 rounded-xl flex items-center justify-center font-bold text-sm uppercase flex-shrink-0', getAvatarBg(user.role)]">
                    {{ getInitials(user.name) }}
                  </div>
                  <div>
                    <div class="font-semibold text-slate-900 dark:text-white text-xs">{{ user.name }}</div>
                    <div class="text-[10px] text-slate-400 font-mono truncate max-w-[120px]" :title="user.id">{{ user.displayId }}</div>
                  </div>
                </div>
              </td>

              <!-- Email -->
              <td class="py-3.5 px-4 text-slate-600 dark:text-white/75 text-xs">{{ user.email }}</td>

              <!-- Role -->
              <td class="py-3.5 px-4">
                <div class="flex flex-wrap items-center gap-1.5">
                  <span :class="['inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-mono font-bold border', getRoleBadgeCls(user.role)]">
                    <span class="w-1.5 h-1.5 rounded-full" :class="getRoleDotCls(user.role)"></span>
                    {{ formatRole(user.role) }}
                  </span>
                  <span v-if="isClassRep(user.id)" class="text-[10px] font-mono px-2 py-0.5 rounded-full bg-teal-50 dark:bg-teal-950/40 text-teal-700 dark:text-teal-400 border border-teal-200 dark:border-teal-800">
                    Class Rep
                  </span>
                </div>
              </td>

              <!-- Program -->
              <td class="py-3.5 px-4 text-slate-500 dark:text-white/75 text-xs max-w-[140px] truncate">{{ user.program || '—' }}</td>

              <!-- Date -->
              <td class="py-3.5 px-4 text-slate-500 dark:text-white/75 font-mono text-[11px]">{{ formatDate(user.createdAt) }}</td>

              <!-- Actions -->
              <td class="py-3.5 px-4">
                <div class="flex items-center justify-end gap-1.5">
                  <button
                    v-if="user.role === 'STUDENT'"
                    @click="navigateToClassRep"
                    :id="'btn-rep-' + user.id"
                    title="Manage Class Rep"
                    class="p-1.5 text-teal-600 dark:text-teal-400 hover:bg-teal-50 dark:hover:bg-teal-950/40 rounded-lg transition-colors"
                  >
                    <Users class="w-3.5 h-3.5" />
                  </button>
                  <button
                    @click="openEditModal(user)"
                    :id="'btn-edit-' + user.id"
                    title="Edit User"
                    class="p-1.5 text-slate-500 dark:text-white/75 hover:text-primary dark:hover:text-secondary hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
                  >
                    <Edit3 class="w-3.5 h-3.5" />
                  </button>
                  <button
                    @click="openDeleteModal(user)"
                    :id="'btn-delete-' + user.id"
                    :disabled="isCurrentUser(user.id)"
                    title="Delete User"
                    class="p-1.5 text-rose-500 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 rounded-lg transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                  >
                    <Trash2 class="w-3.5 h-3.5" />
                  </button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>

        <!-- Footer -->
        <div class="px-4 py-3 border-t border-slate-100 dark:border-dark-outline text-xs text-slate-500 dark:text-white/75 font-mono">
          Showing <strong class="text-slate-700 dark:text-white/90">{{ filteredUsers.length }}</strong> of <strong class="text-slate-700 dark:text-white/90">{{ users.length }}</strong> users
        </div>
      </div>
    </div>

    <!-- Create/Edit User Modal -->
    <div
      v-if="isModalOpen"
      class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200"
      @click.self="closeModal"
    >
      <div class="relative w-full max-w-2xl bg-white dark:bg-dark-surface border border-slate-200 dark:border-dark-outline rounded-2xl shadow-2xl overflow-hidden max-h-[90vh] flex flex-col">
        <div class="absolute top-2 left-2 w-3 h-3 border-t-2 border-l-2 border-secondary/40 pointer-events-none"></div>
        <div class="absolute top-2 right-2 w-3 h-3 border-t-2 border-r-2 border-secondary/40 pointer-events-none"></div>

        <!-- Header -->
        <div class="p-6 border-b border-slate-100 dark:border-dark-outline flex items-start justify-between gap-4">
          <div class="flex items-start gap-3">
            <div :class="['w-10 h-10 rounded-xl flex items-center justify-center', isEditing ? 'bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 text-amber-600 dark:text-amber-400' : 'bg-primary/10 dark:bg-secondary/15 border border-primary/20 dark:border-secondary/30 text-primary dark:text-secondary']">
              <UserPlus v-if="!isEditing" class="w-5 h-5" />
              <Edit3 v-else class="w-5 h-5" />
            </div>
            <div>
              <span class="text-[10px] font-mono uppercase tracking-wider text-secondary font-bold">
                {{ isEditing ? 'EDIT ACCOUNT' : 'NEW ACCOUNT' }}
              </span>
              <h2 class="text-xl font-display font-bold text-slate-900 dark:text-white">
                {{ isEditing ? 'Edit User Profile' : 'Add New User' }}
              </h2>
              <p class="text-xs text-slate-500 dark:text-white/75 mt-0.5">
                {{ isEditing ? `Updating account for ${userForm.name}` : 'Provision a new student, lecturer, or admin account.' }}
              </p>
            </div>
          </div>
          <button @click="closeModal" class="p-2 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">
            <X class="w-5 h-5" />
          </button>
        </div>

        <!-- Form -->
        <form @submit.prevent="saveUser" class="p-6 overflow-y-auto flex-1 space-y-5">
          <!-- Error banner -->
          <div v-if="modalError" class="flex items-center gap-2.5 px-4 py-3 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 text-rose-700 dark:text-rose-400 text-sm">
            <AlertCircle class="w-4 h-4 flex-shrink-0" />
            <span>{{ modalError }}</span>
          </div>

          <!-- Role Selector -->
          <div class="space-y-2">
            <label class="text-[11px] font-mono uppercase tracking-wider text-slate-500 dark:text-white/75">User Role <span class="text-rose-500">*</span></label>
            <div class="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2">
              <button
                v-for="r in availableRoles"
                :key="r.value"
                type="button"
                @click="userForm.role = r.value"
                :class="['relative rounded-xl border p-3 text-left transition-all focus:outline-none text-xs',
                  userForm.role === r.value
                    ? 'border-secondary bg-primary dark:bg-dark-muted ring-2 ring-secondary/40'
                    : 'border-slate-200 dark:border-dark-outline/70 bg-slate-50 dark:bg-dark-muted/70 hover:border-slate-300 dark:hover:border-slate-600'
                ]"
              >
                <div :class="['font-bold mb-0.5', userForm.role === r.value ? 'text-secondary' : 'text-slate-900 dark:text-white']">{{ r.label }}</div>
                <div :class="['text-[10px] leading-tight', userForm.role === r.value ? 'text-white/60 dark:text-white/75' : 'text-slate-400']">{{ r.description }}</div>
                <div v-if="userForm.role === r.value" class="absolute top-2 right-2 w-2 h-2 rounded-full bg-secondary"></div>
              </button>
            </div>
          </div>

          <!-- Name & Email -->
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div class="space-y-1.5">
              <label for="user-full-name" class="text-[11px] font-mono uppercase tracking-wider text-slate-500 dark:text-white/75">Full Name <span class="text-rose-500">*</span></label>
              <input
                type="text" id="user-full-name" v-model="userForm.name"
                placeholder="e.g. Dr. Jane Mensah or Kofi Owusu"
                required
                class="w-full bg-slate-50 dark:bg-dark-muted/80 border border-slate-200 dark:border-dark-outline/70 rounded-xl px-3 py-2.5 text-sm text-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-secondary/50 focus:border-secondary transition-all"
              />
            </div>
            <div class="space-y-1.5">
              <label for="user-email" class="text-[11px] font-mono uppercase tracking-wider text-slate-500 dark:text-white/75">Email Address <span class="text-rose-500">*</span></label>
              <input
                type="email" id="user-email" v-model="userForm.email"
                placeholder="e.g. name@southshore.edu.gh"
                required
                class="w-full bg-slate-50 dark:bg-dark-muted/80 border border-slate-200 dark:border-dark-outline/70 rounded-xl px-3 py-2.5 text-sm text-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-secondary/50 focus:border-secondary transition-all"
              />
            </div>
          </div>

          <!-- ID & Program -->
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div class="space-y-1.5">
              <label for="user-id" class="text-[11px] font-mono uppercase tracking-wider text-slate-500 dark:text-white/75">
                User ID / Student ID
                <span v-if="!isEditing" class="normal-case text-slate-400"> (auto-generated if empty)</span>
              </label>
              <input
                type="text" id="user-id" v-model="userForm.id"
                :placeholder="isEditing ? '' : 'e.g. BSC/CSM/2026/02'"
                :disabled="isEditing"
                class="w-full bg-slate-50 dark:bg-dark-muted/80 border border-slate-200 dark:border-dark-outline/70 rounded-xl px-3 py-2.5 text-sm text-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-secondary/50 focus:border-secondary transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              />
              <p v-if="isEditing" class="text-[10px] text-slate-400 font-mono">User ID is fixed and cannot be changed.</p>
            </div>
            <div class="space-y-1.5">
              <label for="user-program" class="text-[11px] font-mono uppercase tracking-wider text-slate-500 dark:text-white/75">
                {{ userForm.role === 'STUDENT' ? 'Academic Programme' : 'Department / Specialization' }}
              </label>
              <select v-if="userForm.role === 'STUDENT'" id="user-program" v-model="userForm.program"
                class="w-full bg-slate-50 dark:bg-dark-muted/80 border border-slate-200 dark:border-dark-outline/70 rounded-xl px-3 py-2.5 text-sm text-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-secondary/50"
              >
                <option value="">— Select Programme —</option>
                <option v-for="prog in availableProgrammes" :key="prog.id" :value="prog.name">{{ prog.name }}</option>
              </select>
              <input v-else type="text" id="user-dept" v-model="userForm.program"
                placeholder="e.g. School of Computing"
                class="w-full bg-slate-50 dark:bg-dark-muted/80 border border-slate-200 dark:border-dark-outline/70 rounded-xl px-3 py-2.5 text-sm text-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-secondary/50 transition-all"
              />
            </div>
          </div>

          <!-- Password -->
          <div class="space-y-1.5">
            <label for="user-password" class="text-[11px] font-mono uppercase tracking-wider text-slate-500 dark:text-white/75">
              {{ isEditing ? 'Change Password' : 'Password' }}
              <span v-if="!isEditing" class="text-rose-500"> *</span>
              <span v-else class="normal-case text-slate-400"> (leave blank to keep current)</span>
            </label>
            <div class="relative">
              <input
                :type="showModalPassword ? 'text' : 'password'"
                id="user-password"
                v-model="userForm.password"
                :placeholder="isEditing ? 'Enter new password to update...' : 'Minimum 6 characters'"
                :required="!isEditing"
                class="w-full bg-slate-50 dark:bg-dark-muted/80 border border-slate-200 dark:border-dark-outline/70 rounded-xl px-3 py-2.5 pr-10 text-sm text-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-secondary/50 focus:border-secondary transition-all"
              />
              <button type="button" @click="showModalPassword = !showModalPassword" tabindex="-1"
                class="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300">
                <Eye v-if="!showModalPassword" class="w-4 h-4" />
                <EyeOff v-else class="w-4 h-4" />
              </button>
            </div>
          </div>

          <!-- Actions -->
          <div class="flex items-center justify-end gap-3 pt-2">
            <button type="button" @click="closeModal"
              class="px-4 py-2.5 rounded-xl border border-slate-200 dark:border-dark-outline/70 text-sm font-semibold text-slate-700 dark:text-white/90 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">
              Cancel
            </button>
            <button type="submit" :disabled="isSaving" id="btn-save-user"
              class="px-5 py-2.5 rounded-xl bg-primary hover:bg-primary/90 text-white text-sm font-semibold transition-all shadow-md inline-flex items-center gap-2 disabled:opacity-50 active:scale-95"
            >
              <Loader2 v-if="isSaving" class="w-4 h-4 animate-spin" />
              <span>{{ isSaving ? (isEditing ? 'Saving...' : 'Creating...') : (isEditing ? 'Save Changes' : 'Create User') }}</span>
            </button>
          </div>
        </form>
      </div>
    </div>

    <!-- Delete Confirmation Modal -->
    <div
      v-if="isDeleteModalOpen"
      class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200"
      @click.self="closeDeleteModal"
    >
      <div class="w-full max-w-md bg-white dark:bg-dark-surface border border-rose-200 dark:border-rose-900/50 rounded-2xl p-6 shadow-2xl">
        <div class="w-12 h-12 rounded-xl bg-rose-50 dark:bg-rose-950/50 border border-rose-200 dark:border-rose-900/50 flex items-center justify-center text-rose-600 dark:text-rose-400 mb-4">
          <Trash2 class="w-6 h-6" />
        </div>

        <h3 class="text-lg font-display font-bold text-slate-900 dark:text-white">Delete User Account?</h3>
        <p class="text-xs text-slate-500 dark:text-white/75 mt-2">
          Permanently delete <strong class="text-slate-800 dark:text-white">{{ userToDelete?.name }}</strong>
          (<code class="font-mono text-[11px] bg-slate-100 dark:bg-dark-muted px-1 py-0.5 rounded">{{ userToDelete?.id }}</code>)?
        </p>

        <div class="mt-4 p-3.5 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 text-xs text-rose-700 dark:text-rose-400 font-mono">
          WARNING: All associated attendances, enrollments, notifications, and logs will be cascaded and deleted. This action cannot be undone.
        </div>

        <div class="flex items-center justify-end gap-3 mt-6">
          <button @click="closeDeleteModal" :disabled="isDeleting"
            class="px-4 py-2 rounded-xl border border-slate-200 dark:border-dark-outline/70 text-sm font-semibold text-slate-700 dark:text-white/90 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors disabled:opacity-50">
            Cancel
          </button>
          <button @click="confirmDeleteUser" :disabled="isDeleting" id="btn-confirm-delete"
            class="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-sm font-semibold transition-all inline-flex items-center gap-2 shadow-sm disabled:opacity-50 active:scale-95"
          >
            <Loader2 v-if="isDeleting" class="w-4 h-4 animate-spin" />
            <span>{{ isDeleting ? 'Deleting...' : 'Delete Permanently' }}</span>
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
import { useClassRepStore } from '@/stores/classrep.js';
import {
  Star, RefreshCw, UserPlus, Search, X, RotateCcw, Edit3, Trash2,
  Users, CheckCircle2, AlertCircle, Loader2, UserX, Eye, EyeOff
} from 'lucide-vue-next';

const authStore = useAuthStore();
const classRepStore = useClassRepStore();

// State
const users = ref([]);
const availableProgrammes = ref([]);
const isLoading = ref(false);
const searchQuery = ref('');
const roleFilter = ref('all');
const sortBy = ref('newest');

const stats = ref({ total: 0, students: 0, lecturers: 0, admins: 0, superAdmins: 0, finance: 0 });

// KPI items config
const kpiItems = [
  { filter: 'all', label: 'Total Accounts', statKey: 'total', icon: Users, iconBg: 'bg-primary/10 dark:bg-secondary/15', iconColor: 'text-primary dark:text-secondary' },
  { filter: 'STUDENT', label: 'Students', statKey: 'students', icon: Users, iconBg: 'bg-sky-50 dark:bg-sky-950/40', iconColor: 'text-sky-600 dark:text-sky-400' },
  { filter: 'LECTURER', label: 'Lecturers', statKey: 'lecturers', icon: Users, iconBg: 'bg-violet-50 dark:bg-violet-950/40', iconColor: 'text-violet-600 dark:text-violet-400' },
  { filter: 'ADMIN', label: 'Admins', statKey: 'admins', icon: Users, iconBg: 'bg-amber-50 dark:bg-amber-950/40', iconColor: 'text-amber-600 dark:text-amber-400' },
  { filter: 'SUPER_ADMIN', label: 'Super Admins', statKey: 'superAdmins', icon: Star, iconBg: 'bg-rose-50 dark:bg-rose-950/40', iconColor: 'text-rose-600 dark:text-rose-400' },
  { filter: 'FINANCE', label: 'Finance', statKey: 'finance', icon: Users, iconBg: 'bg-emerald-50 dark:bg-emerald-950/40', iconColor: 'text-emerald-600 dark:text-emerald-400' },
];

// Toast / Alert banner
const alertMessage = ref('');
const alertType = ref('success');
const showAlert = (msg, type = 'success') => {
  alertMessage.value = msg;
  alertType.value = type;
  setTimeout(() => { if (alertMessage.value === msg) alertMessage.value = ''; }, 4500);
};

// Modal State
const isModalOpen = ref(false);
const isEditing = ref(false);
const isSaving = ref(false);
const modalError = ref('');
const showModalPassword = ref(false);
const userForm = ref({ id: '', name: '', email: '', role: 'STUDENT', program: '', password: '' });

// Delete Modal State
const isDeleteModalOpen = ref(false);
const isDeleting = ref(false);
const userToDelete = ref(null);

const availableRoles = [
  { value: 'STUDENT', label: 'Student', description: 'Enrolls in courses and attends class.' },
  { value: 'LECTURER', label: 'Lecturer', description: 'Conducts classes & manages sessions.' },
  { value: 'ADMIN', label: 'Administrator', description: 'Manages curriculum and schedules.' },
  { value: 'SUPER_ADMIN', label: 'Super Admin', description: 'Full system privileges.' },
  { value: 'FINANCE', label: 'Finance', description: 'Manages lecturer claims & audits.' },
];

const isCurrentUser = (id) => authStore.user?.id === id || authStore.profile?.id === id;

const fetchUsers = async () => {
  isLoading.value = true;
  try {
    let fetchedList = null;
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
    } catch {}

    if (!fetchedList || fetchedList.length === 0) {
      try {
        const res = await api.get('/users');
        if (res.data?.users?.length > 0) {
          fetchedList = res.data.users.map(u => ({ ...u, displayId: u.id }));
          if (res.data.stats) stats.value = res.data.stats;
        }
      } catch {}
    }

    if (fetchedList) {
      users.value = fetchedList;
      stats.value = {
        total: fetchedList.length,
        students: fetchedList.filter(u => u.role === 'STUDENT').length,
        lecturers: fetchedList.filter(u => u.role === 'LECTURER').length,
        admins: fetchedList.filter(u => u.role === 'ADMIN').length,
        superAdmins: fetchedList.filter(u => u.role === 'SUPER_ADMIN').length,
        finance: fetchedList.filter(u => u.role === 'FINANCE').length,
      };
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
  await classRepStore.fetchAllReps().catch(() => {});
  try {
    const { data } = await supabase.from('programmes').select('id, name').order('name');
    if (data) availableProgrammes.value = data;
  } catch {}
});

const filteredUsers = computed(() => {
  let list = [...users.value];
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
  if (roleFilter.value !== 'all') list = list.filter(u => u.role === roleFilter.value);
  if (sortBy.value === 'newest') list.sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0));
  else if (sortBy.value === 'oldest') list.sort((a, b) => new Date(a.createdAt || 0) - new Date(b.createdAt || 0));
  else if (sortBy.value === 'name_asc') list.sort((a, b) => (a.name || '').localeCompare(b.name || ''));
  else if (sortBy.value === 'name_desc') list.sort((a, b) => (b.name || '').localeCompare(a.name || ''));
  else if (sortBy.value === 'role') list.sort((a, b) => (a.role || '').localeCompare(b.role || ''));
  return list;
});

const resetFilters = () => { searchQuery.value = ''; roleFilter.value = 'all'; sortBy.value = 'newest'; };

const openCreateModal = () => {
  isEditing.value = false; modalError.value = ''; showModalPassword.value = false;
  userForm.value = { id: '', name: '', email: '', role: 'STUDENT', program: '', password: '' };
  isModalOpen.value = true;
};

const openEditModal = (user) => {
  isEditing.value = true; modalError.value = ''; showModalPassword.value = false;
  userForm.value = { id: user.id, name: user.name || '', email: user.email === '—' ? '' : (user.email || ''), role: user.role || 'STUDENT', program: user.program === '—' ? '' : (user.program || ''), password: '' };
  isModalOpen.value = true;
};

const closeModal = () => { isModalOpen.value = false; modalError.value = ''; };

const saveUser = async () => {
  modalError.value = '';
  isSaving.value = true;
  try {
    const roleString = userForm.value.role === 'SUPER_ADMIN' ? 'Super Admin' : userForm.value.role === 'ADMIN' ? 'Admin' : userForm.value.role === 'LECTURER' ? 'Lecturer' : userForm.value.role === 'FINANCE' ? 'Finance' : 'Student';
    if (isEditing.value) {
      const updateData = { name: userForm.value.name.trim(), role: roleString, updated_at: new Date().toISOString() };
      if (userForm.value.email) updateData.email = userForm.value.email.trim().toLowerCase();
      if (userForm.value.program) updateData.program = userForm.value.program;
      const { error: supaErr } = await supabase.from('users').update(updateData).eq('id', userForm.value.id);
      try { await api.put(`/users/${userForm.value.id}`, { name: userForm.value.name, email: userForm.value.email, role: userForm.value.role, program: userForm.value.program, password: userForm.value.password || undefined }); } catch {}
      if (supaErr) throw new Error(supaErr.message);
      showAlert(`User '${userForm.value.name}' updated successfully!`, 'success');
    } else {
      let created = false;
      try { const res = await api.post('/users', { id: userForm.value.id ? userForm.value.id.trim() : undefined, name: userForm.value.name.trim(), email: userForm.value.email.trim().toLowerCase(), role: userForm.value.role, program: userForm.value.program, password: userForm.value.password }); if (res.status === 201) created = true; } catch {}
      if (!created) {
        const { error: signUpErr } = await supabase.auth.signUp({ email: userForm.value.email.trim().toLowerCase(), password: userForm.value.password, options: { data: { full_name: userForm.value.name.trim(), role: roleString, id_number: userForm.value.id || undefined, program: userForm.value.program || undefined } } });
        if (signUpErr) throw new Error(signUpErr.message);
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

const openDeleteModal = (user) => {
  if (isCurrentUser(user.id)) { showAlert('You cannot delete your own logged-in account.', 'error'); return; }
  userToDelete.value = user;
  isDeleteModalOpen.value = true;
};

const closeDeleteModal = () => { isDeleteModalOpen.value = false; userToDelete.value = null; };

const confirmDeleteUser = async () => {
  if (!userToDelete.value) return;
  isDeleting.value = true;
  try {
    const { error: supaErr } = await supabase.from('users').delete().eq('id', userToDelete.value.id);
    try { await api.delete(`/users/${userToDelete.value.id}`); } catch {}
    if (supaErr) throw new Error(supaErr.message);
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
const getInitials = (name) => { if (!name) return 'U'; return name.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2); };
const formatRole = (role) => { if (!role) return 'Student'; const r = role.toUpperCase(); if (r === 'SUPER_ADMIN') return 'Super Admin'; if (r === 'ADMIN') return 'Admin'; if (r === 'LECTURER') return 'Lecturer'; if (r === 'FINANCE') return 'Finance'; return 'Student'; };
const getAvatarBg = (role) => {
  const r = (role || '').toUpperCase();
  if (r === 'SUPER_ADMIN') return 'bg-rose-100 dark:bg-rose-950/50 text-rose-700 dark:text-rose-400';
  if (r === 'ADMIN') return 'bg-amber-100 dark:bg-amber-950/50 text-amber-700 dark:text-amber-400';
  if (r === 'LECTURER') return 'bg-violet-100 dark:bg-violet-950/50 text-violet-700 dark:text-violet-400';
  if (r === 'FINANCE') return 'bg-emerald-100 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-400';
  return 'bg-sky-100 dark:bg-sky-950/50 text-sky-700 dark:text-sky-400';
};
const getRoleBadgeCls = (role) => {
  const r = (role || '').toUpperCase();
  if (r === 'SUPER_ADMIN') return 'bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-950/40 dark:text-rose-400 dark:border-rose-800';
  if (r === 'ADMIN') return 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/40 dark:text-amber-400 dark:border-amber-800';
  if (r === 'LECTURER') return 'bg-violet-50 text-violet-700 border-violet-200 dark:bg-violet-950/40 dark:text-violet-400 dark:border-violet-800';
  if (r === 'FINANCE') return 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-400 dark:border-emerald-800';
  return 'bg-sky-50 text-sky-700 border-sky-200 dark:bg-sky-950/40 dark:text-sky-400 dark:border-sky-800';
};
const getRoleDotCls = (role) => {
  const r = (role || '').toUpperCase();
  if (r === 'SUPER_ADMIN') return 'bg-rose-500';
  if (r === 'ADMIN') return 'bg-amber-500';
  if (r === 'LECTURER') return 'bg-violet-500';
  if (r === 'FINANCE') return 'bg-emerald-500';
  return 'bg-sky-500';
};
const isClassRep = (id) => classRepStore.allReps.some(r => r.studentId === id || r.studentEmail === id);
const navigateToClassRep = () => {
  window.history.pushState({ path: '/classrep-management' }, '', '/classrep-management');
  window.dispatchEvent(new PopStateEvent('popstate', { state: { path: '/classrep-management' } }));
};
const formatDate = (dateStr) => {
  if (!dateStr) return '—';
  try { return new Date(dateStr).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }); }
  catch { return dateStr; }
};
</script>
