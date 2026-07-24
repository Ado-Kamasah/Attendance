<template>
  <!-- Wrapper -->
  <div class="relative z-[1000] h-full" :class="{ 'mobile-open': isMobileOpen }">
    <!-- Mobile overlay -->
    <div
      class="hidden fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-[900] opacity-0 transition-opacity duration-300"
      :class="{ '!block !opacity-100': isMobileOpen }"
      @click="$emit('close-mobile')"
    ></div>

    <aside
      class="font-sans h-full bg-slate-900 text-slate-50 flex flex-col shadow-[4px_0_24px_rgba(0,0,0,0.15)] relative overflow-visible z-[1000] transition-all duration-400"
      :class="isCollapsed ? 'w-[84px]' : 'w-[290px]'"
    >
      <!-- Header -->
      <div
        class="flex items-center border-b border-white/5 transition-all duration-300"
        :class="isCollapsed ? 'px-0 py-6 flex-col gap-5 justify-center' : 'px-5 py-6 justify-between'"
      >
        <div class="flex items-center gap-3 overflow-hidden" :class="isCollapsed ? 'justify-center' : ''">
          <div class="w-[34px] h-[34px] min-w-[34px] flex items-center justify-center text-red-400 bg-red-500/10 rounded-lg p-[6px]">
            <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" class="w-full h-full">
              <path d="M12 2L2 7L12 12L22 7L12 2Z" fill="currentColor" />
              <path d="M2 17L12 22L22 17" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
              <path d="M2 12L12 17L22 12" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
            </svg>
          </div>
          <div v-if="!isCollapsed" class="flex flex-col animate-[fadeIn_0.3s_ease_forwards]">
            <h1 class="m-0 whitespace-nowrap text-[1.05rem] font-extrabold tracking-[0.05em] text-white leading-tight">SOUTHSHORE</h1>
            <h2 class="m-0 whitespace-nowrap text-[0.65rem] font-medium tracking-[0.08em] text-red-400 leading-tight uppercase mt-0.5">ADMINISTRATION</h2>
          </div>
        </div>
        <button
          class="bg-white/5 border-none rounded-lg w-8 h-8 flex items-center justify-center text-slate-400 cursor-pointer transition-all duration-200 flex-shrink-0 hover:bg-white/10 hover:text-white"
          @click="toggleSidebar"
          aria-label="Toggle Sidebar"
        >
          <svg v-if="!isCollapsed" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="w-4 h-4">
            <path d="M15 18l-6-6 6-6" stroke-linecap="round" stroke-linejoin="round" />
          </svg>
          <svg v-else viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="w-4 h-4">
            <path d="M9 18l6-6-6-6" stroke-linecap="round" stroke-linejoin="round" />
          </svg>
        </button>
      </div>

      <!-- Nav -->
      <nav class="flex-1 p-4 overflow-y-auto flex flex-col gap-6 [&::-webkit-scrollbar]:w-1 [&::-webkit-scrollbar-thumb]:bg-white/10 [&::-webkit-scrollbar-thumb]:rounded">
        <div v-for="(group, index) in navGroups" :key="index" class="flex flex-col gap-2">
          <h3 v-if="!isCollapsed" class="mt-0 mb-1 ml-2 text-[0.65rem] font-bold text-slate-500 tracking-[0.1em] uppercase">{{ group.label }}</h3>
          <div v-else class="h-px bg-white/5 mx-3 my-2"></div>
          <ul class="list-none p-0 m-0 flex flex-col gap-1">
            <li v-for="item in group.items" :key="item.name" class="relative">
              <a
                :href="item.path"
                class="flex items-center gap-3.5 rounded-[10px] text-slate-400 no-underline font-medium transition-all duration-200 relative overflow-hidden hover:text-white hover:bg-red-500/10 group"
                :class="[
                  activeRoute === item.path ? 'text-white bg-red-500 shadow-[0_4px_12px_rgba(239,68,68,0.3)]' : '',
                  isCollapsed ? 'p-3 justify-center' : 'px-3.5 py-2.5'
                ]"
                @click.prevent="navigate(item.path)"
              >
                <span class="w-5 h-5 min-w-5 flex items-center justify-center transition-transform duration-300 group-hover:scale-110" v-html="item.icon"></span>
                <span v-if="!isCollapsed" class="whitespace-nowrap text-[0.9rem]">{{ item.name }}</span>
                <div
                  v-if="isCollapsed"
                  class="absolute left-full top-1/2 -translate-y-1/2 translate-x-2.5 bg-slate-800 text-white px-3 py-1.5 rounded-md text-[0.85rem] font-medium whitespace-nowrap opacity-0 invisible transition-all duration-200 shadow-md pointer-events-none z-[1000] group-hover:opacity-100 group-hover:visible group-hover:translate-x-5 before:content-[''] before:absolute before:-left-1 before:top-1/2 before:-translate-y-1/2 before:border-[5px] before:border-solid before:border-transparent before:border-r-slate-800"
                >{{ item.name }}</div>
              </a>
            </li>
          </ul>
        </div>
      </nav>

      <!-- Footer -->
      <div class="border-t border-white/5 transition-all duration-300" :class="isCollapsed ? 'px-3 py-6' : 'px-5 py-6'">
        <div
          class="flex items-center gap-3 p-2 rounded-xl cursor-pointer transition-colors duration-200 hover:bg-white/5 group"
          :class="isCollapsed ? 'justify-center' : ''"
          @click="navigate('/profile')"
        >
          <div class="w-[38px] h-[38px] min-w-[38px] rounded-[10px] overflow-hidden border-2 border-slate-700 transition-colors duration-300 group-hover:border-red-500">
            <img :src="`https://ui-avatars.com/api/?name=${encodeURIComponent(userName)}&background=ef4444&color=fff`" alt="User Avatar" class="w-full h-full object-cover" />
          </div>
          <div v-if="!isCollapsed" class="flex flex-col overflow-hidden">
            <p class="m-0 text-[0.9rem] font-semibold text-slate-50 whitespace-nowrap text-ellipsis overflow-hidden">{{ userName }}</p>
            <p class="m-0 text-[0.75rem] text-slate-400 whitespace-nowrap">Super Admin</p>
          </div>
        </div>
      </div>
    </aside>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue';
import { useAuthStore } from '../stores/authstore.js';

const authStore = useAuthStore();

const props = defineProps({
  isMobileOpen: {
    type: Boolean,
    default: false
  }
});

const isCollapsed = ref(false);
const activeRoute = ref('/');

const emit = defineEmits(['navigate', 'close-mobile']);

const toggleSidebar = () => {
  isCollapsed.value = !isCollapsed.value;
};

const navigate = (path) => {
  activeRoute.value = path;
  emit('navigate', path);
};

const userName = computed(() => authStore.profile?.name || 'Administrator');
const userInitials = computed(() => {
  const n = userName.value;
  return n.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2);
});

const navGroups = [
  {
    label: 'CORE ADMINISTRATION',
    items: [
      {
        name: 'Dashboard',
        path: '/',
        icon: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="7" height="9"></rect><rect x="14" y="3" width="7" height="5"></rect><rect x="14" y="12" width="7" height="9"></rect><rect x="3" y="16" width="7" height="5"></rect></svg>`
      },
      {
        name: 'Analytics',
        path: '/analytics',
        icon: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/></svg>`
      },
      {
        name: 'Session Analytics',
        path: '/session-analytics',
        icon: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>`
      },
      {
        name: 'Semester Setup',
        path: '/semestersetup',
        icon: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="3"></circle><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"></path></svg>`
      },
      {
        name: 'Courses',
        path: '/courses',
        icon: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"></path><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"></path></svg>`
      },
      {
        name: 'Schedule',
        path: '/schedule',
        icon: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect><line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" y2="6"></line><line x1="3" y1="10" x2="21" y2="10"></line></svg>`
      },
      {
        name: 'Faculties',
        path: '/faculties',
        icon: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"></path><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"></path><path d="M10 6h4M10 10h4"></path></svg>`
      },
      {
        name: 'My Profile',
        path: '/profile',
        icon: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>`
      },
      {
        name: 'Evaluations',
        path: '/evaluation-admin',
        icon: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M9 11l3 3L22 4"/><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"/></svg>`
      }
    ]
  }
];
</script>

<style scoped>
@media (max-width: 768px) {
  aside {
    position: fixed !important;
    top: 0;
    left: 0;
    transform: translateX(-100%);
    width: 280px !important;
    transition: transform 0.4s cubic-bezier(0.2, 0.8, 0.2, 1);
  }
  .mobile-open aside {
    transform: translateX(0);
  }
  aside button[aria-label="Toggle Sidebar"] {
    display: none;
  }
}

@keyframes fadeIn {
  from { opacity: 0; transform: translateX(-10px); }
  to   { opacity: 1; transform: translateX(0); }
}
</style>
