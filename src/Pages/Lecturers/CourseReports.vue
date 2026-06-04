<template>
  <div class="reports-container">
    <div class="page-header">
      <div>
        <h1 class="page-title">Detailed Course Reports</h1>
        <p class="page-subtitle">View attendance analytics and student performance across your courses.</p>
      </div>
      <button class="export-btn" @click="exportReport">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
          <polyline points="7 10 12 15 17 10"></polyline>
          <line x1="12" y1="15" x2="12" y2="3"></line>
        </svg>
        Export PDF
      </button>
    </div>

    <!-- Empty State -->
    <div v-if="reportData.length === 0" class="empty-state">
      <div class="icon-wrap">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
          <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
          <polyline points="14 2 14 8 20 8"></polyline>
          <line x1="16" y1="13" x2="8" y2="13"></line>
          <line x1="16" y1="17" x2="8" y2="17"></line>
          <polyline points="10 9 9 9 8 9"></polyline>
        </svg>
      </div>
      <h2>No Reports Available</h2>
      <p>There is currently no attendance data available to generate reports for your courses.</p>
    </div>

    <!-- Reports Content -->
    <div v-else class="reports-content">
      <div class="course-report-card" v-for="report in reportData" :key="report.courseId">
        <div class="card-header">
          <div class="course-info">
            <span class="course-code">{{ report.code }}</span>
            <span class="semester-tag">{{ report.semester }}</span>
            <h3>{{ report.name }}</h3>
          </div>
          <div class="attendance-stat">
            <span class="stat-value">{{ report.avgAttendance }}%</span>
            <span class="stat-label">Avg. Attendance</span>
          </div>
        </div>

        <div class="card-body">
          <div class="stats-grid">
            <div class="stat-item">
              <span class="label">Total Students</span>
              <span class="value">{{ report.totalStudents }}</span>
            </div>
            <div class="stat-item">
              <span class="label">Sessions Held</span>
              <span class="value">{{ report.sessionsHeld }}</span>
            </div>
            <div class="stat-item">
              <span class="label">Perfect Attendance</span>
              <span class="value text-emerald">{{ report.perfectAttendance }}</span>
            </div>
            <div class="stat-item">
              <span class="label">At Risk (< 50%)</span>
              <span class="value text-rose">{{ report.atRisk }}</span>
            </div>
          </div>
          
          <button class="view-details-btn" @click="openStudentList(report)">View Full Student List</button>
        </div>
      </div>
    </div>

    <!-- Student List Modal -->
    <div class="modal-backdrop" v-if="isModalOpen" @click.self="closeModal">
      <div class="modal-card">
        <div class="modal-header">
          <div>
            <h2>{{ selectedReport?.name }}</h2>
            <p>Student Enrollment List</p>
          </div>
          <button class="close-btn" @click="closeModal">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
          </button>
        </div>
        <div class="modal-body">
          <div v-if="isLoadingStudents" class="loading-state">
            <div class="spinner"></div>
            <p>Loading students...</p>
          </div>
          <div v-else-if="studentsList.length === 0" class="empty-students">
            <p>No students are currently enrolled in this course.</p>
          </div>
          <div v-else class="students-table-wrapper">
            <table class="students-table">
              <thead>
                <tr>
                  <th>Student Name</th>
                  <th>Student ID</th>
                  <th>Program</th>
                  <th>Attendance Rate</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="student in studentsList" :key="student.id">
                  <td>
                    <div class="student-cell">
                      <div class="student-avatar">{{ student.name.charAt(0) }}</div>
                      <span class="student-name">{{ student.name }}</span>
                    </div>
                  </td>
                  <td>{{ student.studentId }}</td>
                  <td>{{ student.program || 'N/A' }}</td>
                  <td>
                    <span class="attendance-badge" :class="getAttendanceClass(student.attendanceRate)">
                      {{ student.attendanceRate }}%
                    </span>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import api from '../../api.js';

const reportData = ref([]);
const isModalOpen = ref(false);
const selectedReport = ref(null);
const studentsList = ref([]);
const isLoadingStudents = ref(false);

onMounted(async () => {
  try {
    const userJson = localStorage.getItem('user');
    const user = userJson ? JSON.parse(userJson) : null;
    const lecturerName = user ? user.name : '';

    // Fetch schedules to get lecturer's courses
    const res = await api.get('/schedules');
    const schedules = res.data.filter(s => !lecturerName || s.lecturer === lecturerName);
    
    // In a real app, you would fetch actual attendance stats from the backend.
    // Here we generate placeholder report data based on their assigned courses.
    reportData.value = schedules.map(s => ({
      courseId: s.courseId,
      code: s.course?.code || 'Unknown',
      name: s.course?.name || 'Unknown Course',
      semester: s.course?.semester || 'Semester 1',
      avgAttendance: Math.floor(Math.random() * (95 - 60) + 60), // Mock data: 60-95%
      totalStudents: Math.floor(Math.random() * (120 - 20) + 20), // Mock data: 20-120 students
      sessionsHeld: Math.floor(Math.random() * (15 - 3) + 3), // Mock data
      perfectAttendance: Math.floor(Math.random() * 15),
      atRisk: Math.floor(Math.random() * 5)
    }));
  } catch (error) {
    console.error('Error fetching course reports:', error);
  }
});

const exportReport = () => {
  alert('Report export feature will be implemented soon.');
};

const openStudentList = async (report) => {
  selectedReport.value = report;
  isModalOpen.value = true;
  isLoadingStudents.value = true;
  
  try {
    const response = await api.get(`/courses/${report.courseId}/students`);
    // Assign a random attendance rate for demonstration purposes since backend doesn't provide it yet
    studentsList.value = response.data.map(student => ({
      ...student,
      attendanceRate: Math.floor(Math.random() * (100 - 50) + 50)
    }));
  } catch (error) {
    console.error('Error fetching students:', error);
    studentsList.value = [];
  } finally {
    isLoadingStudents.value = false;
  }
};

const closeModal = () => {
  isModalOpen.value = false;
  selectedReport.value = null;
  studentsList.value = [];
};

const getAttendanceClass = (rate) => {
  if (rate >= 85) return 'excellent';
  if (rate >= 70) return 'good';
  return 'poor';
};
</script>

<style scoped>
.reports-container {
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
  margin: 0.25rem 0 0 0;
  font-size: 0.95rem;
  color: #64748b;
}

.export-btn {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  background-color: #ffffff;
  color: #334155;
  border: 1px solid #cbd5e1;
  padding: 0.75rem 1.25rem;
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
  box-shadow: 0 1px 2px rgba(0,0,0,0.05);
}

.export-btn:hover {
  background-color: #f8fafc;
  color: #0f172a;
  border-color: #94a3b8;
}

.export-btn svg {
  width: 18px;
  height: 18px;
}

/* Empty State */
.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 6rem 1rem;
  background-color: #ffffff;
  border-radius: 16px;
  border: 1px dashed #cbd5e1;
  text-align: center;
}

.icon-wrap {
  width: 80px;
  height: 80px;
  background-color: #f8fafc;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 1.5rem;
  color: #94a3b8;
}

.icon-wrap svg {
  width: 40px;
  height: 40px;
}

.empty-state h2 {
  margin: 0 0 0.5rem 0;
  color: #0f172a;
}

.empty-state p {
  color: #64748b;
  margin: 0;
  max-width: 400px;
}

/* Reports Content */
.reports-content {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(400px, 1fr));
  gap: 1.5rem;
}

.course-report-card {
  background-color: #ffffff;
  border-radius: 16px;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05), 0 2px 4px -1px rgba(0, 0, 0, 0.03);
  border: 1px solid #e2e8f0;
  overflow: hidden;
  display: flex;
  flex-direction: column;
}

.card-header {
  padding: 1.5rem;
  border-bottom: 1px solid #f1f5f9;
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  background-color: #f8fafc;
}

.course-info h3 {
  margin: 0.75rem 0 0 0;
  font-size: 1.25rem;
  font-weight: 700;
  color: #0f172a;
}

.course-code {
  background-color: #e0e7ff;
  color: #4338ca;
  font-size: 0.75rem;
  font-weight: 700;
  padding: 4px 8px;
  border-radius: 6px;
  margin-right: 0.5rem;
}

.semester-tag {
  background-color: #f1f5f9;
  color: #475569;
  font-size: 0.7rem;
  font-weight: 600;
  padding: 4px 8px;
  border-radius: 6px;
}

.attendance-stat {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
}

.stat-value {
  font-size: 1.75rem;
  font-weight: 800;
  color: #10b981;
  line-height: 1;
}

.stat-label {
  font-size: 0.75rem;
  font-weight: 600;
  color: #64748b;
  text-transform: uppercase;
  margin-top: 4px;
}

.card-body {
  padding: 1.5rem;
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
  flex: 1;
}

.stats-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1.25rem;
}

.stat-item {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.stat-item .label {
  font-size: 0.85rem;
  color: #64748b;
  font-weight: 500;
}

.stat-item .value {
  font-size: 1.15rem;
  font-weight: 700;
  color: #1e293b;
}

.text-emerald { color: #10b981 !important; }
.text-rose { color: #e11d48 !important; }

.view-details-btn {
  margin-top: auto;
  width: 100%;
  padding: 0.85rem;
  background-color: transparent;
  color: #6366f1;
  border: 1px solid #6366f1;
  border-radius: 8px;
  font-weight: 600;
  font-size: 0.95rem;
  cursor: pointer;
  transition: all 0.2s;
}

.view-details-btn:hover {
  background-color: #e0e7ff;
}

/* Modal Styles */
.modal-backdrop {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(15, 23, 42, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  backdrop-filter: blur(4px);
  padding: 1rem;
}

.modal-card {
  background-color: #ffffff;
  border-radius: 16px;
  width: 100%;
  max-width: 700px;
  max-height: 90vh;
  display: flex;
  flex-direction: column;
  box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
  animation: modalIn 0.3s ease;
}

@keyframes modalIn {
  from { opacity: 0; transform: translateY(20px); }
  to { opacity: 1; transform: translateY(0); }
}

.modal-header {
  padding: 1.5rem;
  border-bottom: 1px solid #f1f5f9;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.modal-header h2 {
  margin: 0;
  font-size: 1.25rem;
  color: #0f172a;
}

.modal-header p {
  margin: 0.25rem 0 0 0;
  font-size: 0.9rem;
  color: #64748b;
}

.close-btn {
  background: #f1f5f9;
  border: none;
  width: 32px;
  height: 32px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #64748b;
  cursor: pointer;
  transition: all 0.2s;
}

.close-btn:hover {
  background: #e2e8f0;
  color: #0f172a;
}

.close-btn svg {
  width: 18px;
  height: 18px;
}

.modal-body {
  padding: 1.5rem;
  overflow-y: auto;
}

.loading-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 3rem 0;
  color: #64748b;
}

.spinner {
  width: 32px;
  height: 32px;
  border: 3px solid #e2e8f0;
  border-top-color: #6366f1;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin-bottom: 1rem;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

.empty-students {
  text-align: center;
  padding: 3rem 0;
  color: #64748b;
  font-style: italic;
}

.students-table-wrapper {
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  overflow: hidden;
}

.students-table {
  width: 100%;
  border-collapse: collapse;
}

.students-table th {
  background-color: #f8fafc;
  padding: 0.75rem 1rem;
  text-align: left;
  font-size: 0.8rem;
  font-weight: 600;
  color: #64748b;
  text-transform: uppercase;
  border-bottom: 1px solid #e2e8f0;
}

.students-table td {
  padding: 1rem;
  border-bottom: 1px solid #f1f5f9;
  font-size: 0.9rem;
  color: #1e293b;
}

.students-table tr:last-child td {
  border-bottom: none;
}

.student-cell {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.student-avatar {
  width: 32px;
  height: 32px;
  background-color: #e0e7ff;
  color: #4338ca;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 700;
  font-size: 0.9rem;
}

.student-name {
  font-weight: 600;
}

.attendance-badge {
  padding: 0.25rem 0.5rem;
  border-radius: 999px;
  font-size: 0.75rem;
  font-weight: 700;
}

.attendance-badge.excellent { background-color: #dcfce7; color: #166534; }
.attendance-badge.good { background-color: #fef9c3; color: #854d0e; }
.attendance-badge.poor { background-color: #fee2e2; color: #991b1b; }

@media (max-width: 768px) {
  .reports-content {
    grid-template-columns: 1fr;
  }
  
  .page-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 1rem;
  }
}
</style>
