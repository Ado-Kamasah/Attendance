<template>
  <div class="auth-layout">
    <!-- Solid overlay to darken the background image -->
    <div class="bg-overlay"></div>
    
    <div class="form-container">
      <div class="form-card">
        <div class="form-header">
          <div class="logo-wrapper">
            <div class="logo-icon">
              <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M12 2L2 7L12 12L22 7L12 2Z" fill="currentColor" />
                <path d="M2 17L12 22L22 17" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" />
                <path d="M2 12L12 17L22 12" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" />
              </svg>
            </div>
          </div>
          <h1>Welcome</h1>
          <p>Access your portal to manage your academic journey.</p>
        </div>

        <form @submit.prevent="handleLogin" class="auth-form">
          <div class="input-container" :class="{ 'focused': isEmailFocused || loginId }">
            <div class="icon-wrapper">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path>
                <polyline points="22,6 12,13 2,6"></polyline>
              </svg>
            </div>
            <div class="input-content">
              <label for="loginId">{{ role === 'Student' ? 'Student ID' : 'Email Address' }}</label>
              <input 
                :type="role === 'Student' ? 'text' : 'email'" 
                id="loginId" 
                v-model="loginId" 
                @focus="isEmailFocused = true" 
                @blur="isEmailFocused = false" 
                required 
              />
            </div>
          </div>

          <div class="input-container" :class="{ 'focused': isPasswordFocused || password }">
            <div class="icon-wrapper">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
                <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
              </svg>
            </div>
            <div class="input-content">
              <label for="password">Password</label>
              <input 
                :type="showPassword ? 'text' : 'password'" 
                id="password" 
                v-model="password" 
                @focus="isPasswordFocused = true" 
                @blur="isPasswordFocused = false" 
                required 
              />
            </div>
            <button type="button" class="toggle-password" @click="showPassword = !showPassword" tabindex="-1">
              <svg v-if="!showPassword" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
                <circle cx="12" cy="12" r="3"></circle>
              </svg>
              <svg v-else viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path>
                <line x1="1" y1="1" x2="23" y2="23"></line>
              </svg>
            </button>
          </div>

          <div class="input-container" :class="{ 'focused': isRoleFocused || role }">
            <div class="icon-wrapper">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
                <circle cx="9" cy="7" r="4"></circle>
                <path d="M23 21v-2a4 4 0 0 0-3-3.87"></path>
                <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
              </svg>
            </div>
            <div class="input-content">
              <label for="role">Select Role</label>
              <select id="role" v-model="role" @focus="isRoleFocused = true" @blur="isRoleFocused = false" required>
                <option value="Admin">Administrator</option>
                <option value="Lecturer">Lecturer</option>
                <option value="Student">Student</option>
              </select>
            </div>
          </div>

          <div class="form-options">
            <label class="custom-checkbox">
              <input type="checkbox" v-model="rememberMe">
              <span class="checkmark"></span>
              <span class="checkbox-text">Remember me</span>
            </label>
            <a href="#" class="forgot-link">Forgot password?</a>
          </div>

          <button type="submit" class="btn-submit" :class="{ 'is-loading': isLoading }">
            <span class="btn-text" v-if="!isLoading">Secure Sign In</span>
            <svg v-else class="spinner" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <circle cx="12" cy="12" r="10" stroke-opacity="0.25" stroke="currentColor"></circle>
              <path d="M12 2a10 10 0 0 1 10 10"></path>
            </svg>
          </button>
        </form>

        <div class="auth-footer">
          <p>Don't have an account? <a href="#" @click.prevent="$emit('switch-to-register')" class="register-link">Register now</a></p>
        </div>

        <!-- Quick Demo Accounts for Testing -->
        <div class="demo-section">
          <div class="demo-divider">
            <span>Quick Test Accounts</span>
          </div>
          <p class="demo-hint">Click an account below to autofill and sign in instantly:</p>
          <div class="demo-buttons">
            <button type="button" class="demo-btn admin-btn" @click="fillDemo('Admin')">
              <span class="role-badge admin-badge">Admin</span>
              <span class="user-details">
                <span class="user-id">admin@southshore.edu.gh</span>
                <span class="user-pass">AdminPassword123</span>
              </span>
            </button>
            <button type="button" class="demo-btn lecturer-btn" @click="fillDemo('Lecturer')">
              <span class="role-badge lecturer-badge">Lecturer</span>
              <span class="user-details">
                <span class="user-id">STAFF/KWAME</span>
                <span class="user-pass">StaffPassword123</span>
              </span>
            </button>
            <button type="button" class="demo-btn student-btn" @click="fillDemo('Student')">
              <span class="role-badge student-badge">Student</span>
              <span class="user-details">
                <span class="user-id">BSC/CSM/2026/01</span>
                <span class="user-pass">StudentPassword123</span>
              </span>
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue';

const loginId = ref('');
const password = ref('');
const role = ref('Admin');
const showPassword = ref(false);
const rememberMe = ref(false);
const isLoading = ref(false);

const isEmailFocused = ref(false);
const isPasswordFocused = ref(false);
const isRoleFocused = ref(false);

const emit = defineEmits(['login-success', 'switch-to-register']);

const handleLogin = () => {
  if (!loginId.value || !password.value || !role.value) return;
  
  isLoading.value = true;
  
  setTimeout(() => {
    isLoading.value = false;
    emit('login-success', { loginId: loginId.value, role: role.value });
  }, 1500);
};

const fillDemo = (demoRole) => {
  role.value = demoRole;
  if (demoRole === 'Admin') {
    loginId.value = 'admin@southshore.edu.gh';
    password.value = 'AdminPassword123';
  } else if (demoRole === 'Lecturer') {
    loginId.value = 'STAFF/KWAME';
    password.value = 'StaffPassword123';
  } else if (demoRole === 'Student') {
    loginId.value = 'BSC/CSM/2026/01';
    password.value = 'StudentPassword123';
  }
  
  // Submit automatically after a short delay for smooth transition feel
  setTimeout(() => {
    handleLogin();
  }, 300);
};
</script>

<style scoped>
/* Color Palette & Variables */
:root {
  --primary: #4f46e5;
  --primary-hover: #4338ca;
  --secondary: #ec4899;
  --dark: #0f172a;
  --gray-light: #f8fafc;
  --gray: #94a3b8;
}

.auth-layout {
  min-height: 100vh;
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-family: 'Inter', sans-serif;
  position: relative;
  /* Beautiful university building placeholder image */
  background-image: url('https://images.unsplash.com/photo-1541339907198-e08756dedf3f?ixlib=rb-4.0.3&auto=format&fit=crop&w=1920&q=80');
  background-size: cover;
  background-position: center;
  overflow: hidden;
}

.bg-overlay {
  position: absolute;
  top: 0; left: 0; right: 0; bottom: 0;
  background: linear-gradient(135deg, rgba(15, 23, 42, 0.8) 0%, rgba(79, 70, 229, 0.4) 100%);
  z-index: 1;
}

.form-container {
  position: relative;
  z-index: 10;
  width: 100%;
  max-width: 480px;
  padding: 1.5rem;
  animation: slide-up 0.6s cubic-bezier(0.16, 1, 0.3, 1) forwards;
}

@keyframes slide-up {
  from { opacity: 0; transform: translateY(30px); }
  to { opacity: 1; transform: translateY(0); }
}

.form-card {
  background: rgba(255, 255, 255, 0.98);
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
  padding: 3rem;
  border-radius: 24px;
  box-shadow: 0 24px 48px rgba(0, 0, 0, 0.2);
}

@media (max-width: 480px) {
  .form-card {
    padding: 2rem;
  }
}

.form-header {
  margin-bottom: 2.5rem;
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
}

.logo-wrapper {
  margin-bottom: 1.5rem;
}

.logo-icon {
  width: 56px;
  height: 56px;
  background: linear-gradient(135deg, #6366f1, #a855f7);
  border-radius: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  box-shadow: 0 8px 16px rgba(99, 102, 241, 0.3);
}

.logo-icon svg {
  width: 28px;
  height: 28px;
}

.form-header h1 {
  font-size: 2rem;
  font-weight: 800;
  color: #0f172a;
  margin: 0 0 0.5rem 0;
  letter-spacing: -0.03em;
}

.form-header p {
  color: #64748b;
  font-size: 1rem;
  margin: 0;
  line-height: 1.5;
}

.auth-form {
  display: flex;
  flex-direction: column;
  gap: 1.25rem;
}

/* Floating Label Inputs */
.input-container {
  display: flex;
  align-items: center;
  background: #f8fafc;
  border: 2px solid #e2e8f0;
  border-radius: 16px;
  padding: 8px 20px;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  position: relative;
}

.input-container:hover {
  background: white;
  border-color: #cbd5e1;
}

.input-container.focused {
  background: white;
  border-color: #6366f1;
  box-shadow: 0 4px 12px rgba(99, 102, 241, 0.1);
}

.icon-wrapper {
  color: #94a3b8;
  margin-right: 16px;
  display: flex;
  align-items: center;
  transition: color 0.3s;
}

.input-container.focused .icon-wrapper {
  color: #6366f1;
}

.icon-wrapper svg {
  width: 20px;
  height: 20px;
}

.input-content {
  flex: 1;
  position: relative;
  display: flex;
  flex-direction: column;
  justify-content: center;
  height: 48px;
}

.input-content label {
  position: absolute;
  left: 0;
  top: 50%;
  transform: translateY(-50%);
  color: #94a3b8;
  font-size: 1rem;
  font-weight: 500;
  pointer-events: none;
  transition: all 0.2s ease-out;
}

.input-container.focused .input-content label {
  top: 8px;
  font-size: 0.75rem;
  color: #6366f1;
  font-weight: 600;
}

.input-content input {
  border: none;
  background: transparent;
  width: 100%;
  padding: 0;
  margin-top: 14px;
  font-size: 1rem;
  font-weight: 500;
  color: #0f172a;
  outline: none;
}

.input-content select {
  border: none;
  background: transparent;
  width: 100%;
  padding: 0;
  margin-top: 14px;
  font-size: 1rem;
  font-weight: 500;
  color: #0f172a;
  outline: none;
  appearance: none;
  cursor: pointer;
}

.input-content input:-webkit-autofill {
  -webkit-box-shadow: 0 0 0 30px white inset !important;
}

.toggle-password {
  background: none;
  border: none;
  padding: 8px;
  margin-right: -8px;
  color: #94a3b8;
  cursor: pointer;
  transition: color 0.2s;
}

.toggle-password:hover {
  color: #475569;
}

.toggle-password svg {
  width: 20px;
  height: 20px;
}

.form-options {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 0.25rem;
  margin-bottom: 0.5rem;
}

/* Custom Checkbox */
.custom-checkbox {
  display: flex;
  align-items: center;
  gap: 10px;
  cursor: pointer;
  position: relative;
}

.custom-checkbox input {
  position: absolute;
  opacity: 0;
  cursor: pointer;
}

.checkmark {
  width: 20px;
  height: 20px;
  border: 2px solid #cbd5e1;
  border-radius: 6px;
  transition: all 0.2s;
  display: flex;
  align-items: center;
  justify-content: center;
}

.custom-checkbox input:checked ~ .checkmark {
  background: #6366f1;
  border-color: #6366f1;
}

.custom-checkbox input:checked ~ .checkmark::after {
  content: '';
  width: 5px;
  height: 10px;
  border: solid white;
  border-width: 0 2px 2px 0;
  transform: rotate(45deg);
  margin-top: -2px;
}

.checkbox-text {
  font-size: 0.9rem;
  font-weight: 500;
  color: #475569;
}

.forgot-link {
  font-size: 0.9rem;
  font-weight: 600;
  color: #6366f1;
  text-decoration: none;
  transition: color 0.2s;
}

.forgot-link:hover {
  color: #4338ca;
}

/* Submit Button */
.btn-submit {
  position: relative;
  background: linear-gradient(135deg, #4f46e5 0%, #3b82f6 100%);
  color: white;
  border: none;
  border-radius: 16px;
  padding: 16px;
  font-size: 1.05rem;
  font-weight: 700;
  cursor: pointer;
  transition: transform 0.2s, box-shadow 0.2s;
  display: flex;
  justify-content: center;
  align-items: center;
  box-shadow: 0 10px 20px rgba(79, 70, 229, 0.25);
  margin-top: 0.5rem;
}

.btn-submit:hover {
  transform: translateY(-2px);
  box-shadow: 0 14px 28px rgba(79, 70, 229, 0.35);
}

.btn-submit:active {
  transform: translateY(1px);
}

.btn-submit.is-loading {
  background: #94a3b8;
  cursor: not-allowed;
  transform: none;
  box-shadow: none;
}

.spinner {
  width: 24px;
  height: 24px;
  animation: rotate 1s linear infinite;
}

@keyframes rotate {
  100% { transform: rotate(360deg); }
}

/* Footer */
.auth-footer {
  margin-top: 2.5rem;
  text-align: center;
}

.auth-footer p {
  color: #64748b;
  font-size: 0.95rem;
  font-weight: 500;
  margin: 0;
}

.register-link {
  color: #0f172a;
  font-weight: 700;
  text-decoration: none;
  margin-left: 4px;
  transition: color 0.2s;
}

.register-link:hover {
  color: #6366f1;
  text-decoration: underline;
}

/* Quick Demo Section */
.demo-section {
  margin-top: 2rem;
  border-top: 1px dashed #e2e8f0;
  padding-top: 1.5rem;
}

.demo-divider {
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 0.75rem;
}

.demo-divider span {
  font-size: 0.8rem;
  font-weight: 700;
  color: #6366f1;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  background: white;
  padding: 0 10px;
}

.demo-hint {
  font-size: 0.8rem;
  color: #64748b;
  text-align: center;
  margin: 0 0 1rem 0;
}

.demo-buttons {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.demo-btn {
  display: flex;
  align-items: center;
  text-align: left;
  background: #f8fafc;
  border: 1px solid #e2e8f0;
  border-radius: 12px;
  padding: 10px 14px;
  cursor: pointer;
  width: 100%;
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
}

.demo-btn:hover {
  background: #f1f5f9;
  border-color: #cbd5e1;
  transform: translateY(-1px);
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05);
}

.demo-btn:active {
  transform: translateY(0);
}

.role-badge {
  font-size: 0.75rem;
  font-weight: 700;
  padding: 4px 8px;
  border-radius: 6px;
  margin-right: 12px;
  min-width: 75px;
  text-align: center;
  text-transform: uppercase;
  letter-spacing: 0.02em;
}

.admin-badge {
  background-color: #fee2e2;
  color: #ef4444;
}

.lecturer-badge {
  background-color: #fef3c7;
  color: #d97706;
}

.student-badge {
  background-color: #dcfce7;
  color: #16a34a;
}

.user-details {
  display: flex;
  flex-direction: column;
  flex: 1;
  gap: 2px;
}

.user-id {
  font-size: 0.85rem;
  font-weight: 600;
  color: #1e293b;
}

.user-pass {
  font-size: 0.75rem;
  color: #64748b;
  font-family: 'Courier New', Courier, monospace;
  font-weight: 500;
}
</style>
