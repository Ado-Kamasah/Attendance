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
      <div class="corner corner-tl !border-secondary/30 pointer-events-none"></div>
      <div class="corner corner-bl !border-secondary/30 pointer-events-none"></div>

      <!-- Header / Logo -->
      <div class="h-18 px-4 flex items-center justify-between border-b border-[#162746] dark:border-[#0e1a30] shrink-0">
        <div class="flex items-center gap-3 overflow-hidden">
          <!-- Student Cap Icon -->
          <div class="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 via-blue-600 to-indigo-700 flex items-center justify-center shrink-0 shadow-md shadow-blue-500/20 ring-1 ring-blue-400/30">
            <GraduationCap class="w-5 h-5 text-white" />
          </div>

          <div v-if="!isCollapsed" class="min-w-0 transition-opacity duration-200">
            <h1 class="font-display text-xs font-black tracking-widest text-slate-100 uppercase truncate">
              Southshore
            </h1>
            <h2 class="font-mono text-[10px] font-semibold tracking-wider text-blue-400 uppercase truncate">
              Student Portal
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
                    ? 'bg-blue-500/15 text-blue-300 font-semibold shadow-xs border border-blue-400/30'
                    : 'text-slate-300 hover:text-slate-100 hover:bg-white/5 border border-transparent'
                ]"
                :title="isCollapsed ? item.name : ''"
              >
                <component 
                  :is="item.icon" 
                  class="w-4.5 h-4.5 shrink-0 transition-transform duration-150 group-hover:scale-105"
                  :class="activeRoute === item.path ? 'text-blue-400' : 'text-slate-400 group-hover:text-slate-200'" 
                />

                <span v-if="!isCollapsed" class="truncate">
                  {{ item.name }}
                </span>

                <span 
                  v-if="!isCollapsed && activeRoute === item.path" 
                  class="ml-auto w-1.5 h-1.5 rounded-full bg-blue-400 shrink-0"
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

      <!-- Sidebar Footer / Student Profile -->
      <div class="p-3 border-t border-[#162746] dark:border-[#0e1a30] shrink-0 bg-[#030b19]">
        <div 
          @click="navigate('/profile')"
          class="flex items-center gap-3 p-2 rounded-xl hover:bg-white/5 border border-transparent hover:border-white/10 transition-colors cursor-pointer group"
          :title="isCollapsed ? userName : ''"
        >
          <div class="relative shrink-0">
            <img 
              :src="`https://ui-avatars.com/api/?name=${encodeURIComponent(userName)}&background=3b82f6&color=fff&bold=true`" 
              alt="Student Avatar"
              class="w-9 h-9 rounded-lg object-cover ring-1 ring-blue-500/40"
            />
            <span class="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-emerald-500 ring-2 ring-[#030b19]"></span>
          </div>

          <div v-if="!isCollapsed" class="min-w-0 flex-1">
            <div class="flex items-center gap-1.5">
              <p class="text-xs font-semibold text-slate-100 truncate group-hover:text-blue-400 transition-colors">
                {{ userName }}
              </p>
              <span v-if="isClassRep" class="px-1.5 py-0.2 rounded text-[9px] font-bold font-mono bg-secondary/20 text-secondary border border-secondary/40">
                CR
              </span>
            </div>
            <p class="text-[10px] font-mono text-slate-400 truncate">
              {{ userProgram }}
            </p>
          </div>
        </div>
      </div>
    </aside>
  </div>
</template>

<script setup>
import { ref, computed, watch, onMounted } from 'vue';
import { useAuthStore } from '../stores/authstore.js';
import { useClassRepStore } from '../stores/classrep.js';
import { 
  GraduationCap, 
  ChevronLeft, 
  ChevronRight, 
  X, 
  LayoutDashboard, 
  ClipboardCheck, 
  BookOpen, 
  Award, 
  MessageSquare, 
  User, 
  UserCheck 
} from 'lucide-vue-next';

const authStore = useAuthStore();
const classRepStore = useClassRepStore();

const props = defineProps({
  isMobileOpen: {
    type: Boolean,
    default: false
  }
});

const isCollapsed = ref(false);
const activeRoute = ref(window.location.pathname || '/student-dashboard');

const emit = defineEmits(['navigate', 'close-mobile']);

const toggleSidebar = () => {
  isCollapsed.value = !isCollapsed.value;
};

const navigate = (path) => {
  activeRoute.value = path;
  emit('navigate', path);
  emit('close-mobile');
};

const userName = computed(() => authStore.profile?.name || authStore.user?.user_metadata?.full_name || 'Student');
const userProgram = computed(() => authStore.profile?.program || 'Enrolled');
const isClassRep = computed(() => classRepStore.isClassRep);

watch(
  [() => authStore.user, () => authStore.profile],
  async ([newUser, newProfile]) => {
    if (newUser || newProfile) {
      await classRepStore.fetchMyRoles();
    }
  },
  { immediate: true }
);

onMounted(async () => {
  await classRepStore.fetchMyRoles();
});

const navGroups = computed(() => [
  {
    label: 'STUDENT PORTAL',
    items: [
      { name: 'Dashboard', path: '/student-dashboard', icon: LayoutDashboard },
      { name: 'Course Registration', path: '/registration', icon: ClipboardCheck },
      { name: 'My Courses', path: '/my-courses', icon: BookOpen },
      { name: 'Lecturer Evaluation', path: '/evaluation', icon: Award },
      { name: 'Suggestion Box', path: '/suggestion-box', icon: MessageSquare },
      { name: 'My Profile', path: '/profile', icon: User },
      ...(isClassRep.value ? [
        { name: 'Class Rep Panel', path: '/classrep-dashboard', icon: UserCheck }
      ] : [])
    ]
  }
]);
</script>
