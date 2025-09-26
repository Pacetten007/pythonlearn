<template>
  <div class="login-page">
    <div class="login-container">
      <!-- Background Pattern -->
      <div class="background-pattern"></div>
      
      <!-- Login Card -->
      <div class="login-card">
        <!-- Header -->
        <div class="login-header">
          <RouterLink to="/" class="logo-link">
            <img src="/logo.svg" alt="PythonLearn" class="logo" />
            <span class="logo-text">PythonLearn</span>
          </RouterLink>
          
          <h1 class="login-title">Добро пожаловать!</h1>
          <p class="login-subtitle">Войдите в свой аккаунт, чтобы продолжить обучение</p>
        </div>

        <!-- Login Form -->
        <form @submit.prevent="handleLogin" class="login-form">
          <!-- Email Field -->
          <BaseInput
            v-model="loginForm.email"
            type="email"
            label="Email"
            placeholder="Введите ваш email"
            leftIcon="IconMail"
            required
            :disabled="loading"
            :error-message="errors.email"
            @blur="validateField('email')"
          />

          <!-- Password Field -->
          <BaseInput
            v-model="loginForm.password"
            type="password"
            label="Пароль"
            placeholder="Введите пароль"
            leftIcon="IconLock"
            required
            :disabled="loading"
            :error-message="errors.password"
            @blur="validateField('password')"
          />

          <!-- Options -->
          <div class="login-options">
            <label class="remember-me">
              <input 
                type="checkbox" 
                v-model="loginForm.rememberMe"
                :disabled="loading"
              />
              <span class="checkbox-custom"></span>
              <span class="checkbox-label">Запомнить меня</span>
            </label>

            <RouterLink to="/forgot-password" class="forgot-link">
              Забыли пароль?
            </RouterLink>
          </div>

          <!-- Submit Button -->
          <BaseButton
            type="submit"
            variant="primary"
            size="lg"
            block
            :loading="loading"
            :disabled="!isFormValid || loading"
          >
            Войти
          </BaseButton>

          <!-- Error Message -->
          <div v-if="generalError" class="error-message">
            <IconAlertTriangle :size="16" />
            {{ generalError }}
          </div>
        </form>

        <!-- Divider -->
        <div class="divider">
          <span>или</span>
        </div>

        <!-- Social Login -->
        <div class="social-login">
          <BaseButton
            variant="outline"
            size="lg"
            block
            @click="loginWithGoogle"
            :disabled="loading"
            class="social-button"
          >
            <img src="/icons/google.svg" alt="Google" class="social-icon" />
            Войти через Google
          </BaseButton>

          <BaseButton
            variant="outline"
            size="lg"
            block
            @click="loginWithGitHub"
            :disabled="loading"
            class="social-button"
          >
            <IconGithub :size="20" class="social-icon" />
            Войти через GitHub
          </BaseButton>
        </div>

        <!-- Register Link -->
        <div class="register-link">
          <span>Нет аккаунта?</span>
          <RouterLink to="/register" class="register-button">
            Зарегистрироваться
          </RouterLink>
        </div>

        <!-- Demo Access -->
        <div class="demo-access">
          <BaseButton
            variant="ghost"
            @click="loginAsDemo"
            :disabled="loading"
            class="demo-button"
          >
            <IconPlay :size="16" />
            Попробовать демо-версию
          </BaseButton>
        </div>
      </div>

      <!-- Features Sidebar -->
      <div class="features-sidebar">
        <h2 class="features-title">Изучай Python эффективно</h2>
        
        <div class="features-list">
          <div class="feature-item">
            <div class="feature-icon">
              <IconCode :size="24" />
            </div>
            <div class="feature-content">
              <h3 class="feature-name">Редактор в браузере</h3>
              <p class="feature-description">
                Пиши и запускай код без установки программ
              </p>
            </div>
          </div>

          <div class="feature-item">
            <div class="feature-icon">
              <IconTrophy :size="24" />
            </div>
            <div class="feature-content">
              <h3 class="feature-name">Геймификация</h3>
              <p class="feature-description">
                Получай опыт, достижения и соревнуйся с друзьями
              </p>
            </div>
          </div>

          <div class="feature-item">
            <div class="feature-icon">
              <IconUsers :size="24" />
            </div>
            <div class="feature-content">
              <h3 class="feature-name">Сообщество</h3>
              <p class="feature-description">
                Общайся с другими учениками и получай помощь
              </p>
            </div>
          </div>

          <div class="feature-item">
            <div class="feature-icon">
              <IconAward :size="24" />
            </div>
            <div class="feature-content">
              <h3 class="feature-name">Подготовка к ЕГЭ</h3>
              <p class="feature-description">
                Специальные задания для экзамена по информатике
              </p>
            </div>
          </div>
        </div>

        <!-- Statistics -->
        <div class="login-stats">
          <div class="stat-item">
            <div class="stat-number">1000+</div>
            <div class="stat-label">Активных учеников</div>
          </div>
          <div class="stat-item">
            <div class="stat-number">50+</div>
            <div class="stat-label">Интерактивных уроков</div>
          </div>
          <div class="stat-item">
            <div class="stat-number">500+</div>
            <div class="stat-label">Практических задач</div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { storeToRefs } from 'pinia'
import { useAuthStore } from '@/stores/auth'
import { useNotifications } from '@/composables/useNotifications'
import { isValidEmail } from '@/utils/helpers'

// Router
const router = useRouter()
const route = useRoute()

// Store
const authStore = useAuthStore()
const { loading } = storeToRefs(authStore)

// Composables
const { showNotification } = useNotifications()

// Form data
const loginForm = ref({
  email: '',
  password: '',
  rememberMe: false
})

// Validation
const errors = ref({
  email: '',
  password: ''
})

const generalError = ref('')

// Computed
const isFormValid = computed(() => {
  return loginForm.value.email &&
         loginForm.value.password &&
         !errors.value.email &&
         !errors.value.password
})

// Methods
const validateField = (field) => {
  switch (field) {
    case 'email':
      if (!loginForm.value.email) {
        errors.value.email = 'Email обязателен'
      } else if (!isValidEmail(loginForm.value.email)) {
        errors.value.email = 'Введите корректный email'
      } else {
        errors.value.email = ''
      }
      break
      
    case 'password':
      if (!loginForm.value.password) {
        errors.value.password = 'Пароль обязателен'
      } else if (loginForm.value.password.length < 6) {
        errors.value.password = 'Пароль должен содержать минимум 6 символов'
      } else {
        errors.value.password = ''
      }
      break
  }
}

const validateForm = () => {
  validateField('email')
  validateField('password')
  return isFormValid.value
}

const handleLogin = async () => {
  generalError.value = ''
  
  if (!validateForm()) {
    return
  }

  try {
    await authStore.login({
      email: loginForm.value.email,
      password: loginForm.value.password,
      rememberMe: loginForm.value.rememberMe
    })

    showNotification('Добро пожаловать!', 'success')
    
    // Перенаправляем на изначально запрошенную страницу или на дашборд
    const redirectTo = route.query.redirect || '/dashboard'
    router.push(redirectTo)

  } catch (error) {
    console.error('Ошибка входа:', error)
    
    if (error.response?.status === 401) {
      generalError.value = 'Неверный email или пароль'
    } else if (error.response?.status === 423) {
      generalError.value = 'Аккаунт заблокирован. Обратитесь в поддержку'
    } else if (error.response?.data?.message) {
      generalError.value = error.response.data.message
    } else {
      generalError.value = 'Произошла ошибка при входе. Попробуйте позже'
    }
  }
}

const loginWithGoogle = async () => {
  try {
    showNotification('Перенаправляем на Google...', 'info')
    
    // В реальном приложении здесь будет OAuth flow
    // window.location.href = '/api/auth/google'
    
    // Для демо
    setTimeout(() => {
      showNotification('Google авторизация в разработке', 'warning')
    }, 1000)
    
  } catch (error) {
    console.error('Ошибка Google авторизации:', error)
    showNotification('Ошибка авторизации через Google', 'error')
  }
}

const loginWithGitHub = async () => {
  try {
    showNotification('Перенаправляем на GitHub...', 'info')
    
    // В реальном приложении здесь будет OAuth flow
    // window.location.href = '/api/auth/github'
    
    // Для демо
    setTimeout(() => {
      showNotification('GitHub авторизация в разработке', 'warning')
    }, 1000)
    
  } catch (error) {
    console.error('Ошибка GitHub авторизации:', error)
    showNotification('Ошибка авторизации через GitHub', 'error')
  }
}

const loginAsDemo = async () => {
  try {
    await authStore.loginAsDemo()
    showNotification('Добро пожаловать в демо-режим!', 'success')
    router.push('/dashboard')
  } catch (error) {
    console.error('Ошибка демо входа:', error)
    showNotification('Ошибка входа в демо-режим', 'error')
  }
}

// Lifecycle
onMounted(() => {
  // Предзаполнить email из query параметров (например, после регистрации)
  if (route.query.email) {
    loginForm.value.email = route.query.email
  }

  // Автофокус на первое поле
  setTimeout(() => {
    const emailInput = document.querySelector('input[type="email"]')
    if (emailInput) {
      emailInput.focus()
    }
  }, 100)
})
</script>

<style scoped>
.login-page {
  min-height: 100vh;
  background: linear-gradient(135deg, var(--bg-primary) 0%, var(--bg-secondary) 100%);
  position: relative;
  overflow: hidden;
}

.background-pattern {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: url('data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><defs><pattern id="grid" width="20" height="20" patternUnits="userSpaceOnUse"><path d="M 20 0 L 0 0 0 20" fill="none" stroke="rgb(99 102 241 / 0.05)" stroke-width="1"/></pattern></defs><rect width="100" height="100" fill="url(%23grid)"/></svg>');
}

.login-container {
  display: grid;
  grid-template-columns: 1fr 1fr;
  min-height: 100vh;
  position: relative;
  z-index: 1;
}

/* Login Card */
.login-card {
  display: flex;
  flex-direction: column;
  justify-content: center;
  padding: 3rem;
  max-width: 480px;
  margin: 0 auto;
  width: 100%;
}

.login-header {
  text-align: center;
  margin-bottom: 2rem;
}

.logo-link {
  display: inline-flex;
  align-items: center;
  gap: 0.75rem;
  text-decoration: none;
  margin-bottom: 2rem;
}

.logo {
  width: 32px;
  height: 32px;
}

.logo-text {
  font-size: 1.25rem;
  font-weight: 600;
  color: var(--text-primary);
}

.login-title {
  font-size: 2rem;
  font-weight: 700;
  margin: 0 0 0.5rem 0;
  color: var(--text-primary);
}

.login-subtitle {
  color: var(--text-secondary);
  margin: 0;
  font-size: 1rem;
}

/* Form */
.login-form {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
  margin-bottom: 2rem;
}

.login-options {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin: -0.5rem 0 0.5rem 0;
}

.remember-me {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  cursor: pointer;
  user-select: none;
}

.remember-me input[type="checkbox"] {
  position: absolute;
  opacity: 0;
  width: 0;
  height: 0;
}

.checkbox-custom {
  width: 16px;
  height: 16px;
  border: 2px solid var(--border-primary);
  border-radius: var(--radius-sm);
  background-color: var(--bg-tertiary);
  position: relative;
  transition: all var(--transition-fast);
}

.checkbox-custom::after {
  content: '';
  position: absolute;
  width: 4px;
  height: 8px;
  border: solid white;
  border-width: 0 2px 2px 0;
  transform: rotate(45deg) scale(0);
  top: 1px;
  left: 4px;
  transition: transform var(--transition-fast);
}

.remember-me input:checked + .checkbox-custom {
  background-color: var(--accent-primary);
  border-color: var(--accent-primary);
}

.remember-me input:checked + .checkbox-custom::after {
  transform: rotate(45deg) scale(1);
}

.checkbox-label {
  font-size: 0.875rem;
  color: var(--text-secondary);
}

.forgot-link {
  font-size: 0.875rem;
  color: var(--accent-primary);
  text-decoration: none;
  transition: color var(--transition-fast);
}

.forgot-link:hover {
  color: var(--accent-primary);
  filter: brightness(1.2);
}

.error-message {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem;
  background: rgba(var(--accent-error-rgb), 0.1);
  border: 1px solid var(--accent-error);
  border-radius: var(--radius-md);
  color: var(--accent-error);
  font-size: 0.875rem;
}

/* Divider */
.divider {
  position: relative;
  text-align: center;
  margin: 1.5rem 0;
}

.divider::before {
  content: '';
  position: absolute;
  top: 50%;
  left: 0;
  right: 0;
  height: 1px;
  background: var(--border-primary);
}

.divider span {
  background: var(--bg-primary);
  padding: 0 1rem;
  color: var(--text-muted);
  font-size: 0.875rem;
}

/* Social Login */
.social-login {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  margin-bottom: 2rem;
}

.social-button {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.social-icon {
  width: 20px;
  height: 20px;
}

/* Register Link */
.register-link {
  text-align: center;
  margin-bottom: 1.5rem;
}

.register-link span {
  color: var(--text-secondary);
  margin-right: 0.5rem;
}

.register-button {
  color: var(--accent-primary);
  text-decoration: none;
  font-weight: 500;
  transition: color var(--transition-fast);
}

.register-button:hover {
  color: var(--accent-primary);
  filter: brightness(1.2);
}

/* Demo Access */
.demo-access {
  text-align: center;
}

.demo-button {
  color: var(--text-muted);
  font-size: 0.875rem;
}

/* Features Sidebar */
.features-sidebar {
  background: var(--bg-secondary);
  padding: 3rem;
  display: flex;
  flex-direction: column;
  justify-content: center;
  border-left: 1px solid var(--border-primary);
}

.features-title {
  font-size: 1.75rem;
  font-weight: 700;
  margin: 0 0 2rem 0;
  color: var(--text-primary);
}

.features-list {
  margin-bottom: 3rem;
}

.feature-item {
  display: flex;
  gap: 1rem;
  margin-bottom: 2rem;
}

.feature-icon {
  flex-shrink: 0;
  color: var(--accent-primary);
}

.feature-name {
  font-size: 1rem;
  font-weight: 600;
  margin: 0 0 0.5rem 0;
  color: var(--text-primary);
}

.feature-description {
  font-size: 0.875rem;
  color: var(--text-secondary);
  margin: 0;
  line-height: 1.5;
}

/* Statistics */
.login-stats {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 1rem;
  padding-top: 2rem;
  border-top: 1px solid var(--border-primary);
}

.stat-item {
  text-align: center;
}

.stat-number {
  font-size: 1.5rem;
  font-weight: 700;
  color: var(--accent-primary);
  display: block;
}

.stat-label {
  font-size: 0.75rem;
  color: var(--text-muted);
  margin-top: 0.25rem;
}

/* Responsive */
@media (max-width: 1024px) {
  .login-container {
    grid-template-columns: 1fr;
  }
  
  .features-sidebar {
    order: -1;
    padding: 2rem;
  }
  
  .features-title {
    font-size: 1.5rem;
  }
  
  .login-stats {
    grid-template-columns: repeat(3, 1fr);
  }
}

@media (max-width: 768px) {
  .login-card {
    padding: 2rem 1.5rem;
  }
  
  .features-sidebar {
    padding: 1.5rem;
  }
  
  .login-title {
    font-size: 1.75rem;
  }
  
  .feature-item {
    margin-bottom: 1.5rem;
  }
  
  .login-stats {
    grid-template-columns: 1fr;
    gap: 1.5rem;
  }
}

@media (max-width: 640px) {
  .login-card {
    padding: 1.5rem 1rem;
  }
  
  .features-sidebar {
    padding: 1rem;
  }
  
  .login-options {
    flex-direction: column;
    align-items: flex-start;
    gap: 0.75rem;
  }
  
  .social-login {
    gap: 0.5rem;
  }
}

/* Focus styles */
.login-form input:focus {
  outline: 2px solid var(--accent-primary);
  outline-offset: 2px;
}

/* Animation */
.login-card {
  animation: slideUp 0.6s ease-out;
}

@keyframes slideUp {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* Dark theme adjustments */
[data-theme="dark"] .background-pattern {
  opacity: 0.3;
}

[data-theme="dark"] .divider span {
  background: var(--bg-primary);
}
</style>