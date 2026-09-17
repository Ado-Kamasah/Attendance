<template>
  <div>
    <!-- Mobile Overlay Backdrop -->
    <div 
      v-if="isMobileOpen"
      @click="$emit('close-mobile')" 
      class="fixed inset-0 bg-black/60 backdrop-blur-xs z-50 lg:hidden transition-opacity duration-300"
    ></div>

    <!-- Sidebar Container -->
    <aside 
      class="fixed lg:sticky top-0 left-0 h-screen z-50 flex flex-col shrink-0 bg-[#040e1f] dark:bg-[#020712] border-r border-[#162746] dark:border-[#0e1a30] text-slate-200 transition-all duration-300 ease-in-out select-none"
      :class="[
        isCollapsed ? 'w-20' : 'w-72',
        isMobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
      ]"
    >
      <!-- Blueprint Registration Marks -->
      <div class="absolute top-3 left-3 w-4 h-4 border-t-2 border-l-2 border-secondary/30 pointer-events-none"></div>
      <div class="absolute bottom-3 left-3 w-4 h-4 border-b-2 border-l-2 border-secondary/30 pointer-events-none"></div>

      <!-- Header / Logo -->
      <div class="h-18 px-4 flex items-center justify-between border-b border-[#162746] dark:border-[#0e1a30] shrink-0">
        <div class="flex items-center gap-3 overflow-hidden">
          <div class="w-10 h-10 rounded-xl bg-gradient-to-br from-secondary via-secondary/90 to-amber-700 flex items-center justify-center shrink-0 shadow-md shadow-secondary/20 ring-1 ring-secondary/30">
            <Shield class="w-5 h-5 text-[#040e1f]" />
          </div>

          <div v-if="!isCollapsed" class="min-w-0 transition-opacity duration-200">
            <h1 class="font-display text-xs font-black tracking-widest text-slate-100 uppercase truncate">
              Southshore
            </h1>
            <h2 class="font-mono text-[10px] font-semibold tracking-wider text-secondary uppercase truncate">
              University College
            </h2>
          </div>
        </div>

        <!-- Collapse Toggle (desktop) -->
        <button 
          @click="toggleSidebar" 
          aria-label="Toggle Sidebar"
          class="hidden lg:flex p-1.5 rounded-lg text-slate-400 hover:text-slate-100 hover:bg-white/5 border border-white/10 transition-colors shrink-0 cursor-pointer"
        >
          <ChevronLeft v-if="!isCollapsed" class="w-4 h-4" />
          <ChevronRight v-else class="w-4 h-4" />
        </button>

        <!-- Close Mobile (mobile) -->
        <button 
          @click="$emit('close-mobile')" 
          aria-label="Close Mobile Menu"
          class="lg:hidden p-1.5 rounded-lg text-slate-400 hover:text-slate-100 hover:bg-white/5 transition-colors"
        >
          <X class="w-5 h-5" />
        </button>
      </div>

      <!-- Navigation Links -->
      <nav class="flex-1 overflow-y-auto overflow-x-hidden py-4 px-3 space-y-6 scrollbar-none">
        <div v-for="(group, gIdx) in navGroups" :key="gIdx">
          <div v-if="!isCollapsed" class="px-3 mb-2 flex items-center gap-2">
            <span class="font-mono text-[10px] font-bold tracking-widest text-slate-400 uppercase">
              {{ group.label }}
            </span>
            <div class="h-px flex-1 bg-[#162746]"></div>
          </div>
          <div v-else class="w-8 h-px bg-[#162746] mx-auto mb-3"></div>

          <ul class="space-y-1">
            <li v-for="item in group.items" :key="item.name">
              <a 
                :href="item.path"
                @click.prevent="navigate(item.path)"
                class="group relative flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-medium transition-all duration-150 cursor-pointer"
                :class="[
                  activeRoute === item.path
                    ? 'bg-secondary/15 text-secondary font-semibold shadow-xs border border-secondary/30'
                    : 'text-slate-300 hover:text-slate-100 hover:bg-white/5 border border-transparent'
                ]"
                :title="isCollapsed ? item.name : ''"
              >
                <component 
                  :is="item.icon" 
                  class="w-4.5 h-4.5 shrink-0 transition-transform duration-150 group-hover:scale-105"
                  :class="activeRoute === item.path ? 'text-secondary' : 'text-slate-400 group-hover:text-slate-200'" 
                />

                <span v-if="!isCollapsed" class="truncate">
                  {{ item.name }}
                </span>

                <span 
                  v-if="!isCollapsed && activeRoute === item.path" 
                  class="ml-auto w-1.5 h-1.5 rounded-full bg-secondary shrink-0"
                ></span>

                <div 
                  v-if="isCollapsed" 
                  class="absolute left-full ml-3 px-2.5 py-1.5 rounded-lg bg-[#0b1b36] border border-[#1e3860] text-slate-100 text-xs font-medium whitespace-nowrap shadow-xl opacity-0 pointer-events-none group-hover:opacity-100 transition-opacity z-50"
                >
                  {{ item.name }}
                </div>
              </a>
            </li>
          </ul>
        </div>
      </nav>

      <!-- Sidebar Footer / Profile -->
      <div class="p-3 border-t border-[#162746] dark:border-[#0e1a30] shrink-0 bg-[#030b19]">
        <div 
          @click="navigate('/profile')"
          class="flex items-center gap-3 p-2 rounded-xl hover:bg-white/5 border border-transparent hover:border-white/10 transition-colors cursor-pointer group"
        >
          <div class="relative shrink-0">
            <img 
              src="https://ui-avatars.com/api/?name=Admin+User&background=bc9333&color=031c45&bold=true" 
              alt="User Avatar"
              class="w-9 h-9 rounded-lg object-cover ring-1 ring-secondary/40"
            />
            <span class="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-emerald-500 ring-2 ring-[#030b19]"></span>
          </div>

          <div v-if="!isCollapsed" class="min-w-0 flex-1">
            <p class="text-xs font-semibold text-slate-100 truncate group-hover:text-secondary transition-colors">
              Admin User
            </p>
            <p class="text-[10px] font-mono text-slate-400 truncate">
              Administrator
            </p>
          </div>
        </div>
      </div>
    </aside>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import { 
  Shield, 
  ChevronLeft, 
  ChevronRight, 
  X, 
  LayoutDashboard, 
  Activity, 
  BookOpen, 
  CalendarDays, 
  CalendarRange, 
  ClipboardCheck, 
  CheckCheck 
} from 'lucide-vue-next';

const props = defineProps({
  isMobileOpen: {
    type: Boolean,
    default: false
  }
});

const isCollapsed = ref(false);
const activeRoute = ref(window.location.pathname || '/');

const emit = defineEmits(['navigate', 'close-mobile']);

const toggleSidebar = () => {
  isCollapsed.value = !isCollapsed.value;
};

const navigate = (path) => {
  activeRoute.value = path;
  emit('navigate', path);
  emit('close-mobile');
};

const navGroups = [
  {
    label: 'OVERVIEW',
    items: [
      { name: 'Admin Dashboard', path: '/', icon: LayoutDashboard },
      { name: 'Student Dashboard', path: '/student-dashboard', icon: Activity }
    ]
  },
  {
    label: 'ADMINISTRATION',
    items: [
      { name: 'Courses', path: '/courses', icon: BookOpen },
      { name: 'Schedule', path: '/schedule', icon: CalendarDays },
      { name: 'Semester Setup', path: '/semestersetup', icon: CalendarRange }
    ]
  },
  {
    label: 'STUDENT PORTAL',
    items: [
      { name: 'My Courses', path: '/my-courses', icon: BookOpen },
      { name: 'Registration', path: '/registration', icon: ClipboardCheck },
      { name: 'Mark Attendance', path: '/attendance', icon: CheckCheck }
    ]
  }
];
</script>
