<template>
  <div class="registration-container">
    <div class="page-header">
      <div>
        <h1 class="page-title">Course Registration</h1>
        <p class="page-subtitle">Select and register for your courses for the current semester.</p>
        <div class="user-program-info" v-if="currentUserProgram">
          <span class="program-label">Program:</span>
          <span class="program-value">{{ currentUserProgram }}</span>
        </div>
      </div>
      <div class="semester-badge">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <circle cx="12" cy="12" r="10"></circle>
          <polyline points="12 6 12 12 16 14"></polyline>
        </svg>
        Registration Open
      </div>
    </div>

    <!-- Registration Content -->
    <div class="registration-content">
      
      <!-- Left Column: Available Courses -->
      <div class="available-courses-panel">
        <div class="panel-header">
          <h2>Available Courses</h2>
          <div class="controls-row">
            <select v-model="semesterFilter" class="filter-select">
              <option value="all">All Semesters</option>
              <option value="Semester 1">Semester 1</option>
              <option value="Semester 2">Semester 2</option>
            </select>
            <div class="search-box">
              <svg class="search-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <circle cx="11" cy="11" r="8"></circle>
                <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
              </svg>
              <input type="text" v-model="searchQuery" placeholder="Search code or name..." />
            </div>
          </div>
        </div>

        <div class="courses-list">
          <!-- Empty State (Defaults to zero as per requirements) -->
          <div v-if="filteredCourses.length === 0" class="empty-state">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
              <path d="M13 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V9z"></path>
              <polyline points="13 2 13 9 20 9"></polyline>
            </svg>
            <p>No courses are currently available for registration.</p>
            <span class="subtext">Waiting for the Administrator to publish the semester courses.</span>
          </div>

          <!-- Active Courses List (Visual layout if items exist) -->
          <div class="course-item" v-for="course in filteredCourses" :key="course.id" :class="{ 'selected': isSelected(course) }">
            <div class="course-checkbox" @click="toggleSelection(course)">
              <div class="checkbox-box" :class="{ 'checked': isSelected(course) }">
                <svg v-if="isSelected(course)" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round">
                  <polyline points="20 6 9 17 4 12"></polyline>
                </svg>
              </div>
            </div>
            <div class="course-details">
              <div class="course-head">
                <div class="head-left">
                  <span class="course-code">{{ course.code }}</span>
                  <span class="semester-tag">{{ course.semester || 'Semester 1' }}</span>
                </div>
                <span class="credit-badge">{{ course.credits }} Credits</span>
              </div>
              <h4 class="course-name">{{ course.name }}</h4>
              <p class="course-lecturer">Instructor: {{ course.lecturer }}</p>
            </div>
          </div>
        </div>
      </div>

      <!-- Right Column: Registration Summary -->
      <div class="summary-panel">
        <div class="panel-header">
          <h2>Your Selection</h2>
        </div>
        
        <div class="summary-content">
          <div class="credits-meter">
            <div class="meter-labels">
              <span>Total Credits</span>
              <span>{{ totalSelectedCredits }} / {{ maxCredits }}</span>
            </div>
            <div class="meter-bar">
              <div class="meter-fill" :style="{ width: `${(totalSelectedCredits / maxCredits) * 100}%` }" :class="{ 'over-limit': totalSelectedCredits > maxCredits }"></div>
            </div>
            <p v-if="totalSelectedCredits > maxCredits" class="error-msg">You have exceeded the maximum credit limit.</p>
          </div>

          <div class="selected-list">
            <h3 class="list-title">Selected Courses ({{ selectedCourses.length }})</h3>
            
            <div v-if="selectedCourses.length === 0" class="empty-selection">
              <p>You haven't selected any courses yet.</p>
            </div>

            <ul v-else class="selected-items">
              <li v-for="course in selectedCourses" :key="course.id">
                <span class="sel-code">{{ course.code }}</span>
                <span class="sel-credits">{{ course.credits }} cr</span>
                <button class="remove-btn" @click="toggleSelection(course)" title="Remove">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
                </button>
              </li>
            </ul>
          </div>
        </div>

        <div class="panel-footer">
          <button 
            class="submit-btn" 
            :disabled="selectedCourses.length === 0 || totalSelectedCredits > maxCredits || isSubmitting"
            @click="submitRegistration"
          >
            {{ isSubmitting ? 'Submitting...' : 'Submit Registration' }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue';
import { storeToRefs } from 'pinia';
import { useAuthStore } from '@/stores/authstore';
import { useCoursesStore } from '@/stores/courses';
import { useSchedulesStore } from '@/stores/schedules';
import { useEnrollmentsStore } from '@/stores/enrollments';
import { useAuditLogsStore } from '@/stores/auditlogs';

const authStore = useAuthStore();
const coursesStore = useCoursesStore();
const schedulesStore = useSchedulesStore();
const enrollmentsStore = useEnrollmentsStore();
const auditLogsStore = useAuditLogsStore();

const { profile } = storeToRefs(authStore);
const { courses } = storeToRefs(coursesStore);
const { schedules } = storeToRefs(schedulesStore);
const { enrollments } = storeToRefs(enrollmentsStore);

const searchQuery = ref('');
const semesterFilter = ref('all');
const maxCredits = 21;

const selectedCourses = ref([]);
const isSubmitting = ref(false);

const currentUserProgram = computed(() => profile.value?.program || 'Unknown');

onMounted(async () => {
  try {
    await Promise.all([
      coursesStore.fetchCourses({ status: 'active' }),
      schedulesStore.fetchSchedules(),
      enrollmentsStore.fetchEnrollments({ studentId: profile.value?.id }),
    ]);

    coursesStore.subscribeToCourses();
    enrollmentsStore.subscribeToEnrollments();
  } catch (error) {
    console.error('Error fetching available courses', error);
  }
});

onUnmounted(() => {
  coursesStore.unsubscribeFromCourses();
  enrollmentsStore.unsubscribeFromEnrollments();
});

/** Lecturer name for a course, taken from any schedule slot on that course. */
function lecturerForCourse(courseId) {
  const match = schedules.value.find((s) => s.courseId === courseId);
  return match?.lecturer || 'Unassigned';
}

const enrolledCourseIds = computed(
  () => new Set(enrollments.value.map((e) => e.courseId))
);

const availableGlobalCourses = computed(() =>
  courses.value
    .filter((c) => !enrolledCourseIds.value.has(c.id))
    .map((c) => ({
      ...c,
      lecturer: lecturerForCourse(c.id),
    }))
);

const filteredCourses = computed(() => {
  let list = availableGlobalCourses.value;

  if (currentUserProgram.value && currentUserProgram.value !== 'Unknown') {
list = list.filter((course) => course.programId === profile.value?.programId);  }

  if (semesterFilter.value !== 'all') {
    list = list.filter((course) => (course.semester || 'Semester 1') === semesterFilter.value);
  }

  if (searchQuery.value) {
    const q = searchQuery.value.toLowerCase();
    list = list.filter(
      (course) =>
        course.code.toLowerCase().includes(q) ||
        course.name.toLowerCase().includes(q)
    );
  }

  return list;
});

const isSelected = (course) => {
  return selectedCourses.value.some((c) => c.id === course.id);
};

const toggleSelection = (course) => {
  if (isSelected(course)) {
    selectedCourses.value = selectedCourses.value.filter((c) => c.id !== course.id);
  } else {
    selectedCourses.value.push(course);
  }
};

const totalSelectedCredits = computed(() => {
  return selectedCourses.value.reduce((total, course) => total + course.credits, 0);
});

const submitRegistration = async () => {
  isSubmitting.value = true;
  const studentId = profile.value?.id;
  const registered = [];
  const failed = [];

  try {
    for (const course of selectedCourses.value) {
      try {
        await enrollmentsStore.createEnrollment({ studentId, courseId: course.id });
        registered.push(course);

        auditLogsStore.logAction({
          action: 'course_registered',
          details: `Registered for ${course.code} — ${course.name}`,
          userId: studentId,
          userRole: profile.value?.role,
          userName: profile.value?.name,
        });
      } catch (err) {
        failed.push({ course, message: err.message });
      }
    }

    if (registered.length > 0) {
      alert(`Successfully registered for ${registered.length} course(s)!`);
    }
    if (failed.length > 0) {
      alert(
        `Could not register for: ${failed.map((f) => `${f.course.code} (${f.message})`).join(', ')}`
      );
    }

    selectedCourses.value = [];
  } catch (error) {
    console.error('Registration failed', error);
    alert('An error occurred during registration.');
  } finally {
    isSubmitting.value = false;
  }
};
</script>