<template>
  <div class="register-container">
    <div class="register-split">
      
      <!-- Left side: Form -->
      <div class="register-form-area">
        <div class="form-wrapper">
          <div class="form-header">
            <h2>Create an account</h2>
            <p>Join Southshore University College attendance system.</p>
          </div>

          <form @submit.prevent="handleRegister" class="auth-form">
            <!-- Full Name -->
            <div class="input-group">
              <label for="fullName">Full Name</label>
              <div class="input-wrapper">
                <svg class="input-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                  <circle cx="12" cy="7" r="4"></circle>
                </svg>
                <input type="text" id="fullName" v-model="form.fullName" placeholder="kwame" required />
              </div>
            </div>

            <!-- Email Setup -->
            <div class="input-group">
              <label for="email">University Email</label>
              <div class="input-wrapper">
                <svg class="input-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path>
                  <polyline points="22,6 12,13 2,6"></polyline>
                </svg>
                <input type="email" id="email" v-model="form.email" placeholder="student@southshore.edu.gh" required />
              </div>
            </div>

            <!-- Role Selection -->
            <div class="input-group">
              <label>I am a</label>
              <div class="radio-group">
                <label class="radio-card" :class="{ 'active': form.role === 'student' }">
                  <input type="radio" v-model="form.role" value="student" name="role" />
                  <span class="radio-content">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                      <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"></path>
                      <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"></path>
                    </svg>
                    Student
                  </span>
                </label>
                <label class="radio-card" :class="{ 'active': form.role === 'staff' }">
                  <input type="radio" v-model="form.role" value="staff" name="role" />
                  <span class="radio-content">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                      <rect x="2" y="7" width="20" height="14" rx="2" ry="2"></rect>
                      <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"></path>
                    </svg>
                    Staff / Faculty
                  </span>
                </label>
              </div>
            </div>

            <!-- ID number -->
            <div class="input-group">
              <label for="idNumber">{{ form.role === 'student' ? 'Student ID' : 'Staff ID' }}</label>
              <div class="input-wrapper">
                <svg class="input-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
                  <line x1="16" y1="2" x2="16" y2="6"></line>
                  <line x1="8" y1="2" x2="8" y2="6"></line>
                  <line x1="3" y1="10" x2="21" y2="10"></line>
                </svg>
                <input type="text" id="idNumber" v-model="form.idNumber" placeholder="ID Number" required />
              </div>
            </div>

            <!-- Faculty / Program -->
            <div class="input-group">
              <label for="program">Faculty / Program</label>
              <div class="input-wrapper">
                <svg class="input-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <path d="M22 10v6M2 10l10-5 10 5-10 5z"></path>
                  <path d="M6 12v5c3 3 9 3 12 0v-5"></path>
                </svg>
                <select id="program" v-model="form.program" required>
                  <option value="" disabled>Select your faculty/program</option>
                  <option v-for="faculty in faculties" :key="faculty.id" :value="faculty.name">{{ faculty.name }}</option>
                </select>
              </div>
            </div>

            <!-- Password -->
            <div class="input-group">
              <label for="password">Password</label>
              <div class="input-wrapper">
                <svg class="input-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
                  <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
                </svg>
                <input :type="showPassword ? 'text' : 'password'" id="password" v-model="form.password" placeholder="Create a strong password" required />
                <button type="button" class="password-toggle" @click="showPassword = !showPassword" aria-label="Toggle password visibility">
                  <svg v-if="!showPassword" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
                    <circle cx="12" cy="12" r="3"></circle>
                  </svg>
                  <svg v-else viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path>
                    <line x1="1" y1="1" x2="23" y2="23"></line>
                  </svg>
                </button>
              </div>
            </div>

            <div v-if="errorMsg" class="error-message">
              {{ errorMsg }}
            </div>

            <button type="submit" class="submit-btn" :class="{ 'loading': isLoading }">
              <span v-if="!isLoading">Create Account</span>
              <svg v-else class="spinner" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <circle cx="12" cy="12" r="10" stroke-opacity="0.25"></circle>
                <path d="M12 2a10 10 0 0 1 10 10"></path>
              </svg>
            </button>
          </form>

          <p class="login-prompt">
            Already have an account? <a href="#" @click.prevent="$emit('switch-to-login')">Sign in here</a>
          </p>
        </div>
      </div>

      <!-- Right side: Visuals (Reversed from Login) -->
      <div class="register-visual" role="presentation">
        <div class="glass-panel">
          <div class="feature-list">
            <div class="feature-item">
              <div class="feature-icon">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
                  <polyline points="22 4 12 14.01 9 11.01"></polyline>
                </svg>
              </div>
              <div class="feature-text">
                <h3>Instant Attendance</h3>
                <p>Register once and check into classes seamlessly.</p>
              </div>
            </div>
            
            <div class="feature-item">
              <div class="feature-icon">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                  <polyline points="14 2 14 8 20 8"></polyline>
                  <line x1="16" y1="13" x2="8" y2="13"></line>
                  <line x1="16" y1="17" x2="8" y2="17"></line>
                  <polyline points="10 9 9 9 8 9"></polyline>
                </svg>
              </div>
              <div class="feature-text">
                <h3>Track Analytics</h3>
                <p>Keep a real-time eye on your academic progress.</p>
              </div>
            </div>
          </div>
          
          <div class="decorative-circles">
            <div class="circle circle-1"></div>
            <div class="circle circle-2"></div>
          </div>
        </div>
      </div>

    </div>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue';
import api from '../../api.js';

const showPassword = ref(false);
const isLoading = ref(false);
const errorMsg = ref('');
const faculties = ref([]);

onMounted(async () => {
  try {
    const res = await api.get('/faculties');
    faculties.value = res.data;
  } catch (err) {
    console.error('Failed to load faculties', err);
  }
});

const form = reactive({
  fullName: '',
  email: '',
  role: 'student',
  idNumber: '',
  program: '',
  password: ''
});

const emit = defineEmits(['register-success', 'switch-to-login']);

const handleRegister = async () => {
  isLoading.value = true;
  errorMsg.value = '';
  
  try {
    const response = await api.post('/auth/register', {
      fullName: form.fullName,
      email: form.email,
      role: form.role,
      idNumber: form.idNumber,
      program: form.program,
      password: form.password
    });
    
    // Auto-login on register could be done, or we emit success
    emit('register-success', { email: response.data.user.email, role: response.data.user.role });
  } catch (err) {
    console.error('Registration error:', err);
    errorMsg.value = err.response?.data?.message || 'Registration failed. Please check your inputs.';
  } finally {
    isLoading.value = false;
  }
};
</script>

<style scoped>
.register-container {
  min-height: 100vh;
  width: 100%;
  display: flex;
  background-color: #f1f5f9;
  font-family: 'Inter', sans-serif;
}

.error-message {
  color: #ef4444;
  background: #fef2f2;
  border-left: 4px solid #ef4444;
  padding: 10px;
  border-radius: 4px;
  font-size: 0.9rem;
  margin-top: 10px;
  margin-bottom: 5px;
}

.register-split {
  display: flex;
  width: 100%;
  min-height: 100vh;
}

/* LEFT SIDE: Form (opposite of login) */
.register-form-area {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: #ffffff;
  padding: 2rem;
}

@media (max-width: 480px) {
  .register-form-area {
    padding: 1.25rem;
  }
}

.form-wrapper {
  width: 100%;
  max-width: 440px;
  animation: fadeIn 0.5s ease-out forwards;
  padding-top: 2rem;
  padding-bottom: 2rem;
}

@keyframes fadeIn {
  from { opacity: 0; transform: translateY(10px); }
  to { opacity: 1; transform: translateY(0); }
}

.form-header {
  margin-bottom: 2.5rem;
}

.form-header h2 {
  font-size: 2rem;
  font-weight: 700;
  color: #0f172a;
  margin: 0 0 0.5rem 0;
  letter-spacing: -0.025em;
}

.form-header p {
  color: #64748b;
  margin: 0;
  font-size: 1rem;
}

.input-group {
  margin-bottom: 1.25rem;
}

.input-group label {
  display: block;
  font-size: 0.875rem;
  font-weight: 500;
  color: #334155;
  margin-bottom: 0.5rem;
}

.input-wrapper {
  position: relative;
  display: flex;
  align-items: center;
}

.input-icon {
  position: absolute;
  left: 14px;
  width: 18px;
  height: 18px;
  color: #94a3b8;
  pointer-events: none;
}

.input-wrapper input,
.input-wrapper select {
  width: 100%;
  padding: 0.75rem 1rem 0.75rem 2.5rem;
  font-size: 0.95rem;
  border: 1px solid #cbd5e1;
  border-radius: 12px;
  background-color: #ffffff;
  color: #0f172a;
  transition: all 0.2s ease;
  font-family: inherit;
  box-sizing: border-box;
}

.input-wrapper select {
  appearance: none;
  cursor: pointer;
}

.input-wrapper input:focus,
.input-wrapper select:focus {
  outline: none;
  border-color: #6366f1;
  box-shadow: 0 0 0 4px rgba(99, 102, 241, 0.1);
}

.input-wrapper input::placeholder {
  color: #94a3b8;
}

.password-toggle {
  position: absolute;
  right: 12px;
  background: none;
  border: none;
  padding: 0;
  cursor: pointer;
  color: #94a3b8;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: color 0.2s;
}

.password-toggle:hover {
  color: #475569;
}

.password-toggle svg {
  width: 18px;
  height: 18px;
}

/* Radio Group styling */
.radio-group {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1rem;
}

.radio-card {
  position: relative;
  border: 1px solid #cbd5e1;
  border-radius: 12px;
  padding: 0.75rem;
  cursor: pointer;
  transition: all 0.2s ease;
  background: #ffffff;
  display: flex;
  align-items: center;
  justify-content: center;
}

.radio-card input[type="radio"] {
  position: absolute;
  opacity: 0;
}

.radio-card:hover {
  border-color: #94a3b8;
  background: #f8fafc;
}

.radio-card.active {
  border-color: #6366f1;
  background: rgba(99, 102, 241, 0.05);
  box-shadow: 0 0 0 2px rgba(99, 102, 241, 0.1);
}

.radio-content {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 0.9rem;
  font-weight: 500;
  color: #475569;
}

.radio-card.active .radio-content {
  color: #4f46e5;
}

.radio-content svg {
  width: 18px;
  height: 18px;
}

/* Submit Button */
.submit-btn {
  width: 100%;
  padding: 0.875rem;
  background-color: #4f46e5;
  color: white;
  border: none;
  border-radius: 12px;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
  display: flex;
  justify-content: center;
  align-items: center;
  box-shadow: 0 4px 6px -1px rgba(79, 70, 229, 0.2), 0 2px 4px -2px rgba(79, 70, 229, 0.2);
  margin-top: 2rem;
}

.submit-btn:hover {
  background-color: #4338ca;
  transform: translateY(-1px);
  box-shadow: 0 10px 15px -3px rgba(79, 70, 229, 0.3), 0 4px 6px -4px rgba(79, 70, 229, 0.3);
}

.submit-btn:active {
  transform: translateY(0);
}

.submit-btn.loading {
  background-color: #818cf8;
  cursor: not-allowed;
  transform: none;
  box-shadow: none;
}

.spinner {
  width: 24px;
  height: 24px;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

.login-prompt {
  margin-top: 2rem;
  text-align: center;
  font-size: 0.875rem;
  color: #64748b;
}

.login-prompt a {
  color: #6366f1;
  font-weight: 600;
  text-decoration: none;
}

.login-prompt a:hover {
  text-decoration: underline;
}


/* RIGHT SIDE: Visuals */
.register-visual {
  flex: 1;
  background: linear-gradient(135deg, #1e293b 0%, #0f172a 100%);
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 4rem;
  overflow: hidden;
  color: white;
}

@media (max-width: 900px) {
  .register-visual {
    display: none;
  }
}

.glass-panel {
  position: relative;
  z-index: 10;
  background: rgba(255, 255, 255, 0.05);
  backdrop-filter: blur(16px);
  -webkit-backdrop-filter: blur(16px);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 24px;
  padding: 3rem;
  max-width: 480px;
  width: 100%;
  box-shadow: 0 24px 48px rgba(0, 0, 0, 0.3);
  transform: translateY(0);
  animation: float 6s ease-in-out infinite reverse;
}

@keyframes float {
  0% { transform: translateY(0px); }
  50% { transform: translateY(-10px); }
  100% { transform: translateY(0px); }
}

.feature-list {
  display: flex;
  flex-direction: column;
  gap: 2rem;
}

.feature-item {
  display: flex;
  align-items: flex-start;
  gap: 1rem;
}

.feature-icon {
  width: 48px;
  height: 48px;
  min-width: 48px;
  background-color: rgba(99, 102, 241, 0.2);
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #818cf8;
}

.feature-icon svg {
  width: 24px;
  height: 24px;
}

.feature-text h3 {
  margin: 0 0 0.25rem 0;
  font-size: 1.1rem;
  font-weight: 600;
  color: #f8fafc;
}

.feature-text p {
  margin: 0;
  font-size: 0.9rem;
  color: #94a3b8;
  line-height: 1.5;
}

.decorative-circles {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  overflow: hidden;
  z-index: 1;
  pointer-events: none;
}

.circle {
  position: absolute;
  border-radius: 50%;
  background: radial-gradient(circle, rgba(255,255,255,0.05) 0%, rgba(255,255,255,0) 70%);
}

.circle-1 {
  width: 600px;
  height: 600px;
  top: -150px;
  right: -150px;
}

.circle-2 {
  width: 400px;
  height: 400px;
  bottom: -100px;
  left: -50px;
  background: radial-gradient(circle, rgba(99,102,241,0.15) 0%, rgba(99,102,241,0) 70%);
}
</style>
