<template>
  <div class="relative z-[1000] h-full" :class="{ 'mobile-open': isMobileOpen }">
    <div
      class="hidden fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-[900] opacity-0 transition-opacity duration-300"
      :class="{ '!block !opacity-100': isMobileOpen }"
      @click="$emit('close-mobile')"
    ></div>

    <aside
      class="font-sans h-full bg-slate-900 text-slate-50 flex flex-col shadow-[4px_0_24px_rgba(0,0,0,0.15)] relative overflow-visible z-[1000] transition-all duration-400"
      :class="isCollapsed ? 'w-[84px]' : 'w-[290px]'"
    >
      <div
        class="flex items-center border-b border-white/5 transition-all duration-300"
        :class="isCollapsed ? 'px-0 py-6 flex-col gap-5 justify-center' : 'px-5 py-6 justify-between'"
      >
        <div class="flex items-center gap-3 overflow-hidden" :class="isCollapsed ? 'justify-center' : ''">
          <div class="w-[34px] h-[34px] min-w-[34px] flex items-center justify-center text-blue-400 bg-blue-500/10 rounded-lg p-[6px]">
            <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" class="w-full h-full">
              <path d="M12 2L2 7L12 12L22 7L12 2Z" fill="currentColor" />
              <path d="M2 17L12 22L22 17" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
              <path d="M2 12L12 17L22 12" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
            </svg>
          </div>
          <div v-if="!isCollapsed" class="flex flex-col">
            <h1 class="m-0 whitespace-nowrap text-[1.05rem] font-extrabold tracking-[0.05em] text-white leading-tight">SOUTHSHORE</h1>
            <h2 class="m-0 whitespace-nowrap text-[0.65rem] font-medium tracking-[0.08em] text-blue-400 leading-tight uppercase mt-0.5">STUDENT PORTAL</h2>
          </div>
        </div>
        <button
          class="bg-white/5 border-none rounded-lg w-8 h-8 flex items-center justify-center text-slate-400 cursor-pointer transition-all duration-200 flex-shrink-0 hover:bg-white/10 hover:text-white"
          @click="toggleSidebar" aria-label="Toggle Sidebar"
        >
          <svg v-if="!isCollapsed" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="w-4 h-4"><path d="M15 18l-6-6 6-6" stroke-linecap="round" stroke-linejoin="round" /></svg>
          <svg v-else viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="w-4 h-4"><path d="M9 18l6-6-6-6" stroke-linecap="round" stroke-linejoin="round" /></svg>
        </button>
      </div>

      <nav class="flex-1 p-4 overflow-y-auto flex flex-col gap-6 [&::-webkit-scrollbar]:w-1 [&::-webkit-scrollbar-thumb]:bg-white/10 [&::-webkit-scrollbar-thumb]:rounded">
        <div v-for="(group, index) in navGroups" :key="index" class="flex flex-col gap-2">
          <h3 v-if="!isCollapsed" class="mt-0 mb-1 ml-2 text-[0.65rem] font-bold text-slate-500 tracking-[0.1em] uppercase">{{ group.label }}</h3>
          <div v-else class="h-px bg-white/5 mx-3 my-2"></div>
          <ul class="list-none p-0 m-0 flex flex-col gap-1">
            <li v-for="item in group.items" :key="item.name" class="relative">
              <a
                :href="item.path"
                class="flex items-center gap-3.5 rounded-[10px] text-slate-400 no-underline font-medium transition-all duration-200 hover:text-white hover:bg-blue-500/10 group"
                :class="[activeRoute === item.path ? 'text-white bg-blue-500 shadow-[0_4px_12px_rgba(59,130,246,0.3)]' : '', isCollapsed ? 'p-3 justify-center' : 'px-3.5 py-2.5']"
                @click.prevent="navigate(item.path)"
              >
                <span class="w-5 h-5 min-w-5 flex items-center justify-center transition-transform duration-300 group-hover:scale-110" v-html="item.icon"></span>
                <span v-if="!isCollapsed" class="whitespace-nowrap text-[0.9rem]">{{ item.name }}</span>
                <div v-if="isCollapsed" class="absolute left-full top-1/2 -translate-y-1/2 translate-x-2.5 bg-slate-800 text-white px-3 py-1.5 rounded-md text-[0.85rem] font-medium whitespace-nowrap opacity-0 invisible transition-all duration-200 pointer-events-none z-[1000] group-hover:opacity-100 group-hover:visible group-hover:translate-x-5">{{ item.name }}</div>
              </a>
            </li>
          </ul>
        </div>
      </nav>

      <div class="border-t border-white/5 transition-all duration-300" :class="isCollapsed ? 'px-3 py-6' : 'px-5 py-6'">
        <div class="flex items-center gap-3 p-2 rounded-xl cursor-pointer hover:bg-white/5 group" :class="isCollapsed ? 'justify-center' : ''" @click="navigate('/profile')">
          <div class="w-[38px] h-[38px] min-w-[38px] rounded-[10px] overflow-hidden border-2 border-slate-700 group-hover:border-blue-500 transition-colors duration-300">
            <img :src="`https://ui-avatars.com/api/?name=${encodeURIComponent(userName)}&background=3b82f6&color=fff`" alt="User Avatar" class="w-full h-full object-cover" />
          </div>
          <div v-if="!isCollapsed" class="flex flex-col overflow-hidden">
            <p class="m-0 text-[0.9rem] font-semibold text-slate-50 whitespace-nowrap overflow-hidden text-ellipsis">{{ userName }}</p>
            <p class="m-0 text-[0.75rem] text-slate-400 whitespace-nowrap">{{ userProgram }}</p>
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

const props = defineProps({ isMobileOpen: { type: Boolean, default: false } });
const isCollapsed = ref(false);
const activeRoute = ref('/student-dashboard');
const emit = defineEmits(['navigate', 'close-mobile']);

const toggleSidebar = () => { isCollapsed.value = !isCollapsed.value; };
const navigate = (path) => { activeRoute.value = path; emit('navigate', path); };

const userName = computed(() => authStore.profile?.name || 'Student');
const userProgram = computed(() => authStore.profile?.program || 'Enrolled');

const navGroups = [{
  label: 'STUDENT PORTAL',
  items: [
    { name: 'Dashboard', path: '/student-dashboard', icon: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 12h-4l-3 9L9 3l-3 9H2"></path></svg>` },
    { name: 'Course Registration', path: '/registration', icon: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line><polyline points="10 9 9 9 8 9"></polyline></svg>` },
    { name: 'My Courses', path: '/my-courses', icon: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"></path></svg>` },
    { name: 'Mark Attendance', path: '/attendance', icon: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg>` },
    { name: 'Lecturer Evaluation', path: '/evaluation', icon: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M9 11l3 3L22 4"/><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"/></svg>` },
    { name: 'My Profile', path: '/profile', icon: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>` }
  ]
}];
</script>

<style scoped>
@media (max-width: 768px) {
  aside { position: fixed !important; top: 0; left: 0; transform: translateX(-100%); width: 280px !important; transition: transform 0.4s cubic-bezier(0.2,0.8,0.2,1); }
  .mobile-open aside { transform: translateX(0); }
  aside button[aria-label="Toggle Sidebar"] { display: none; }
}
</style>
