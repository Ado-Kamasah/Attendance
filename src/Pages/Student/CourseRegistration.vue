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

<style scoped>
.registration-container {
  display: flex;
  flex-direction: column;
  gap: 2rem;
  width: 100%;
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.page-title {
  margin: 0;
  font-size: 1.75rem;
  font-weight: 700;
  color: #0f172a;
  letter-spacing: -0.025em;
}

.page-subtitle {
  margin: 0.25rem 0 0.75rem 0;
  font-size: 0.95rem;
  color: #64748b;
}

.user-program-info {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  background-color: #f1f5f9;
  padding: 0.35rem 0.75rem;
  border-radius: 6px;
  border: 1px solid #e2e8f0;
}

.program-label {
  font-size: 0.85rem;
  font-weight: 500;
  color: #64748b;
}

.program-value {
  font-size: 0.9rem;
  font-weight: 700;
  color: #4f46e5;
}

.semester-badge {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  background-color: #dcfce7;
  color: #166534;
  padding: 0.5rem 1rem;
  border-radius: 9999px;
  font-size: 0.875rem;
  font-weight: 600;
  box-shadow: 0 1px 2px 0 rgba(0, 0, 0, 0.05);
}

.semester-badge svg {
  width: 16px;
  height: 16px;
}

/* Base Layout */
.registration-content {
  display: grid;
  grid-template-columns: 2fr 1fr;
  gap: 1.5rem;
}

.available-courses-panel,
.summary-panel {
  background-color: #ffffff;
  border-radius: 16px;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05), 0 2px 4px -1px rgba(0, 0, 0, 0.03);
  border: 1px solid rgba(226, 232, 240, 0.8);
  display: flex;
  flex-direction: column;
}

.panel-header {
  padding: 1.5rem;
  border-bottom: 1px solid #f1f5f9;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.panel-header h2 {
  margin: 0;
  font-size: 1.25rem;
  font-weight: 600;
  color: #0f172a;
}

.controls-row {
  display: flex;
  gap: 1rem;
  align-items: center;
}

.filter-select {
  padding: 0.5rem 2rem 0.5rem 1rem;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  background-color: #f8fafc;
  color: #334155;
  font-size: 0.85rem;
  outline: none;
  cursor: pointer;
  appearance: none;
  background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 24 24' fill='none' stroke='%2364748b' stroke-width='2' stroke-linecap='round' stroke-linejoin='round' xmlns='http://www.w3.org/2000/svg'%3E%3Cpolyline points='6 9 12 15 18 9'%3E%3C/polyline%3E%3C/svg%3E");
  background-repeat: no-repeat;
  background-position: right 0.5rem center;
  background-size: 14px;
  transition: all 0.2s;
  font-family: inherit;
}

.filter-select:focus {
  background-color: #ffffff;
  border-color: #6366f1;
  box-shadow: 0 0 0 3px rgba(99, 102, 241, 0.1);
}

.search-box {
  position: relative;
  width: 280px;
}

.search-icon {
  position: absolute;
  left: 12px;
  top: 50%;
  transform: translateY(-50%);
  width: 16px;
  height: 16px;
  color: #94a3b8;
}

.search-box input {
  width: 100%;
  padding: 0.5rem 1rem 0.5rem 2.25rem;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  background-color: #f8fafc;
  font-size: 0.85rem;
  outline: none;
  font-family: inherit;
  transition: all 0.2s;
}

.search-box input:focus {
  background-color: #ffffff;
  border-color: #6366f1;
  box-shadow: 0 0 0 3px rgba(99, 102, 241, 0.1);
}

/* Empty State */
.courses-list {
  padding: 1.5rem;
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 4rem 1rem;
  text-align: center;
  background-color: #f8fafc;
  border-radius: 12px;
  border: 1px dashed #cbd5e1;
  margin: 1rem 0;
}

.empty-state svg {
  width: 48px;
  height: 48px;
  color: #94a3b8;
  margin-bottom: 1rem;
  opacity: 0.5;
}

.empty-state p {
  color: #334155;
  margin: 0 0 0.5rem 0;
  font-size: 1rem;
  font-weight: 500;
}

.empty-state .subtext {
  color: #64748b;
  font-size: 0.85rem;
}

/* Course Items */
.course-item {
  display: flex;
  align-items: flex-start;
  gap: 1rem;
  padding: 1rem;
  border-radius: 12px;
  background-color: #ffffff;
  border: 1px solid #e2e8f0;
  transition: all 0.2s ease;
  cursor: pointer;
}

.course-item:hover {
  border-color: #cbd5e1;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.02);
}

.course-item.selected {
  background-color: #f5f3ff;
  border-color: #8b5cf6;
}

.course-checkbox {
  padding-top: 0.25rem;
}

.checkbox-box {
  width: 20px;
  height: 20px;
  border-radius: 6px;
  border: 2px solid #cbd5e1;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s;
  background-color: #ffffff;
  color: white;
}

.checkbox-box.checked {
  background-color: #8b5cf6;
  border-color: #8b5cf6;
}

.checkbox-box svg {
  width: 12px;
  height: 12px;
}

.course-details {
  flex: 1;
}

.course-head {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 0.25rem;
}

.course-code {
  font-weight: 700;
  color: #0f172a;
  font-size: 0.9rem;
}

.head-left {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.semester-tag {
  font-size: 0.7rem;
  padding: 0.15rem 0.4rem;
  border-radius: 4px;
  background-color: #e2e8f0;
  color: #475569;
  font-weight: 600;
}

.credit-badge {
  background-color: #f1f5f9;
  color: #475569;
  padding: 0.2rem 0.5rem;
  border-radius: 4px;
  font-size: 0.75rem;
  font-weight: 600;
}

.course-name {
  margin: 0 0 0.25rem 0;
  font-size: 1rem;
  color: #1e293b;
}

.course-lecturer {
  margin: 0;
  font-size: 0.85rem;
  color: #64748b;
}

/* Summary Panel */
.summary-content {
  padding: 1.5rem;
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.meter-labels {
  display: flex;
  justify-content: space-between;
  margin-bottom: 0.5rem;
  font-size: 0.85rem;
  font-weight: 600;
  color: #1e293b;
}

.meter-bar {
  height: 8px;
  background-color: #e2e8f0;
  border-radius: 999px;
  overflow: hidden;
}

.meter-fill {
  height: 100%;
  background-color: #4f46e5;
  transition: width 0.3s ease;
}

.meter-fill.over-limit {
  background-color: #ef4444;
}

.error-msg {
  margin: 0.5rem 0 0 0;
  font-size: 0.75rem;
  color: #ef4444;
  font-weight: 500;
}

.list-title {
  font-size: 0.95rem;
  font-weight: 600;
  color: #0f172a;
  margin: 0 0 1rem 0;
  padding-bottom: 0.5rem;
  border-bottom: 1px solid #f1f5f9;
}

.empty-selection p {
  font-size: 0.85rem;
  color: #94a3b8;
  font-style: italic;
}

.selected-items {
  list-style: none;
  padding: 0;
  margin: 0;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.selected-items li {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.75rem;
  background-color: #f8fafc;
  border-radius: 8px;
  border: 1px solid #f1f5f9;
}

.sel-code {
  font-weight: 600;
  font-size: 0.85rem;
  color: #1e293b;
  flex: 1;
}

.sel-credits {
  font-size: 0.75rem;
  font-weight: 500;
  color: #64748b;
}

.remove-btn {
  background: none;
  border: none;
  color: #94a3b8;
  cursor: pointer;
  padding: 0.25rem;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 4px;
}

.remove-btn:hover {
  background-color: #fee2e2;
  color: #ef4444;
}

.remove-btn svg {
  width: 14px;
  height: 14px;
}

.panel-footer {
  padding: 1.5rem;
  border-top: 1px solid #f1f5f9;
}

.submit-btn {
  width: 100%;
  padding: 0.85rem;
  background-color: #4f46e5;
  color: white;
  border: none;
  border-radius: 10px;
  font-size: 0.95rem;
  font-weight: 600;
  cursor: pointer;
  transition: background-color 0.2s;
  box-shadow: 0 4px 6px -1px rgba(79, 70, 229, 0.2);
}

.submit-btn:hover:not(:disabled) {
  background-color: #4338ca;
}

.submit-btn:disabled {
  background-color: #cbd5e1;
  cursor: not-allowed;
  box-shadow: none;
}

/* Responsiveness */
@media (max-width: 1024px) {
  .registration-content {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 768px) {
  .page-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 1rem;
  }
  
  .panel-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 1rem;
  }
  
  .search-box {
    width: 100%;
  }
}
</style>
