<template>
  <div class="register-page">
    <div class="register-container">
      <!-- Background Elements -->
      <div class="background-pattern"></div>
      <div class="floating-icons">
        <div class="floating-icon" v-for="n in 6" :key="n">
          <component :is="floatingIcons[n % floatingIcons.length]" :size="24" />
        </div>
      </div>
      
      <!-- Register Card -->
      <div class="register-card">
        <!-- Header -->
        <div class="register-header">
          <RouterLink to="/" class="logo-link">
            <img src="/logo.svg" alt="PythonLearn" class="logo" />
            <span class="logo-text">PythonLearn</span>
          </RouterLink>
          
          <h1 class="register-title">Создать аккаунт</h1>
          <p class="register-subtitle">Присоединяйся к тысячам школьников, изучающих Python!</p>
        </div>

        <!-- Progress Steps -->
        <div class="progress-steps">
          <div 
            v-for="(step, index) in steps" 
            :key="step.id"
            class="progress-step"
            :class="{ 
              'progress-step--active': currentStep === index,
              'progress-step--completed': currentStep > index 
            }"
          >
            <div class="step-number">{{ index + 1 }}</div>
            <span class="step-label">{{ step.label }}</span>
          </div>
        </div>

        <!-- Register Form -->
        <form @submit.prevent="handleSubmit" class="register-form">
          <!-- Step 1: Basic Info -->
          <div v-if="currentStep === 0" class="form-step">
            <div class="step-title">Основная информация</div>
            
            <div class="form-row">
              <BaseInput
                v-model="registerForm.firstName"
                label="Имя"
                placeholder="Введите имя"
                required
                :disabled="loading"
                :error-message="errors.firstName"
                @blur="validateField('firstName')"
              />
              
              <BaseInput
                v-model="registerForm.lastName"
                label="Фамилия"
                placeholder="Введите фамилию"
                required
                :disabled="loading"
                :error-message="errors.lastName"
                @blur="validateField('lastName')"
              />
            </div>

            <BaseInput
              v-model="registerForm.email"
              type="email"
              label="Email"
              placeholder="Введите email"
              leftIcon="IconMail"
              required
              :disabled="loading"
              :error-message="errors.email"
              @blur="validateField('email')"
            />

            <BaseInput
              v-model="registerForm.password"
              type="password"
              label="Пароль"
              placeholder="Создайте надёжный пароль"
              leftIcon="IconLock"
              required
              :disabled="loading"
              :error-message="errors.password"
              @blur="validateField('password')"
            />

            <BaseInput
              v-model="registerForm.confirmPassword"
              type="password"
              label="Подтвердите пароль"
              placeholder="Повторите пароль"
              leftIcon="IconLock"
              required
              :disabled="loading"
              :error-message="errors.confirmPassword"
              @blur="validateField('confirmPassword')"
            />

            <!-- Password Strength -->
            <div v-if="registerForm.password" class="password-strength">
              <div class="strength-label">Надёжность пароля:</div>
              <div class="strength-bar">
                <div 
                  class="strength-fill" 
                  :class="`strength-fill--${passwordStrength.level}`"
                  :style="{ width: `${passwordStrength.score * 25}%` }"
                ></div>
              </div>
              <div class="strength-text">{{ passwordStrength.text }}</div>
            </div>
          </div>

          <!-- Step 2: Academic Info -->
          <div v-if="currentStep === 1" class="form-step">
            <div class="step-title">Информация об обучении</div>
            
            <div class="form-group">
              <label class="form-label">Класс</label>
              <div class="grade-selector">
                <button
                  v-for="grade in grades"
                  :key="grade"
                  type="button"
                  class="grade-option"
                  :class="{ active: registerForm.grade === grade }"
                  @click="registerForm.grade = grade"
                  :disabled="loading"
                >
                  {{ grade }}
                </button>
              </div>
              <div v-if="errors.grade" class="field-error">{{ errors.grade }}</div>
            </div>

            <BaseInput
              v-model="registerForm.school"
              label="Школа (необязательно)"
              placeholder="Название школы или лицея"
              :disabled="loading"
            />

            <div class="form-group">
              <label class="form-label">Опыт программирования</label>
              <div class="experience-options">
                <label 
                  v-for="option in experienceOptions" 
                  :key="option.value"
                  class="experience-option"
                >
                  <input
                    type="radio"
                    :value="option.value"
                    v-model="registerForm.experience"
                    :disabled="loading"
                  />
                  <div class="option-content">
                    <div class="option-title">{{ option.title }}</div>
                    <div class="option-description">{{ option.description }}</div>
                  </div>
                </label>
              </div>
            </div>
          </div>

          <!-- Step 3: Preferences -->
          <div v-if="currentStep === 2" class="form-step">
            <div class="step-title">Настройки и согласия</div>
            
            <div class="form-group">
              <label class="form-label">Цели обучения (выберите несколько)</label>
              <div class="goals-grid">
                <label 
                  v-for="goal in learningGoals" 
                  :key="goal.id"
                  class="goal-option"
                  :class="{ active: registerForm.goals.includes(goal.id) }"
                >
                  <input
                    type="checkbox"
                    :value="goal.id"
                    v-model="registerForm.goals"
                    :disabled="loading"
                  />
                  <div class="goal-icon">
                    <component :is="goal.icon" :size="20" />
                  </div>
                  <div class="goal-text">{{ goal.title }}</div>
                </label>
              </div>
            </div>

            <!-- Agreements -->
            <div class="agreements">
              <label class="agreement-item">
                <input 
                  type="checkbox" 
                  v-model="registerForm.agreeTerms"
                  :disabled="loading"
                  required
                />
                <span class="checkbox-custom"></span>
                <span class="agreement-text">
                  Я согласен с 
                  <a href="/terms" target="_blank" class="agreement-link">Пользовательским соглашением</a>
                  и 
                  <a href="/privacy" target="_blank" class="agreement-link">Политикой конфиденциальности</a>
                </span>
              </label>

              <label class="agreement-item">
                <input 
                  type="checkbox" 
                  v-model="registerForm.agreeEmails"
                  :disabled="loading"
                />
                <span class="checkbox-custom"></span>
                <span class="agreement-text">
                  Я согласен получать уведомления о новых курсах и функциях
                </span>
              </label>
            </div>
          </div>

          <!-- Navigation Buttons -->
          <div class="form-navigation">
            <BaseButton
              v-if="currentStep > 0"
              type="button"
              variant="ghost"
              @click="previousStep"
              :disabled="loading"
              leftIcon="IconChevronLeft"
            >
              Назад
            </BaseButton>

            <BaseButton
              v-if="currentStep < steps.length - 1"
              type="button"
              variant="primary"
              @click="nextStep"
              :disabled="!isCurrentStepValid || loading"
              rightIcon="IconChevronRight"
              class="ml-auto"
            >
              Далее
            </BaseButton>

            <BaseButton
              v-else
              type="submit"
              variant="primary"
              :loading="loading"
              :disabled="!isFormValid || loading"
              leftIcon="IconUserPlus"
              class="ml-auto"
            >
              Создать аккаунт
            </BaseButton>
          </div>

          <!-- Error Message -->
          <div v-if="generalError" class="error-message">
            <IconAlertTriangle :size="16" />
            {{ generalError }}
          </div>
        </form>

        <!-- Login Link -->
        <div class="login-link">
          <span>Уже есть аккаунт?</span>
          <RouterLink to="/login" class="login-button">
            Войти
          </RouterLink>
        </div>
      </div>

      <!-- Benefits Sidebar -->
      <div class="benefits-sidebar">
        <h2 class="benefits-title">Что тебя ждёт?</h2>
        
        <div class="benefits-list">
          <div class="benefit-item">
            <div class="benefit-icon">
              <IconRocket :size="32" />
            </div>
            <div class="benefit-content">
              <h3 class="benefit-title">Быстрый старт</h3>
              <p class="benefit-description">
                Начни программировать уже через 5 минут после регистрации
              </p>
            </div>
          </div>

          <div class="benefit-item">
            <div class="benefit-icon">
              <IconTrendingUp :size="32" />
            </div>
            <div class="benefit-content">
              <h3 class="benefit-title">Прогресс виден сразу</h3>
              <p class="benefit-description">
                Отслеживай свои достижения и соревнуйся с друзьями
              </p>
            </div>
          </div>

          <div class="benefit-item">
            <div class="benefit-icon">
              <IconShield :size="32" />
            </div>
            <div class="benefit-content">
              <h3 class="benefit-title">Безопасная среда</h3>
              <p class="benefit-description">
                Специально адаптировано для школьников
              </p>
            </div>
          </div>
        </div>

        <!-- Testimonial -->
        <div class="testimonial">
          <div class="testimonial-text">
            "PythonLearn помог мне подготовиться к ЕГЭ и поступить на IT-специальность!"
          </div>
          <div class="testimonial-author">
            <div class="author-avatar">М</div>
            <div class="author-info">
              <div class="author-name">Максим Петров</div>
              <div class="author-details">11 класс, 98 баллов ЕГЭ</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { storeToRefs } from 'pinia'
import { useAuthStore } from '@/stores/auth'
import { useNotifications } from '@/composables/useNotifications'
import { isValidEmail, validatePassword } from '@/utils/helpers'

// Router
const router = useRouter()

// Store
const authStore = useAuthStore()
const { loading } = storeToRefs(authStore)

// Composables
const { showNotification } = useNotifications()

// Current step
const currentStep = ref(0)

// Form data
const registerForm = ref({
  firstName: '',
  lastName: '',
  email: '',
  password: '',
  confirmPassword: '',
  grade: null,
  school: '',
  experience: 'beginner',
  goals: [],
  agreeTerms: false,
  agreeEmails: false
})

// Validation
const errors = ref({
  firstName: '',
  lastName: '',
  email: '',
  password: '',
  confirmPassword: '',
  grade: ''
})

const generalError = ref('')

// Data
const steps = [
  { id: 'basic', label: 'Основное' },
  { id: 'academic', label: 'Обучение' },
  { id: 'preferences', label: 'Настройки' }
]

const grades = [8, 9, 10, 11]

const experienceOptions = [
  {
    value: 'beginner',
    title: 'Новичок',
    description: 'Никогда не программировал'
  },
  {
    value: 'some',
    title: 'Немного знаю',
    description: 'Изучал основы в школе или самостоятельно'
  },
  {
    value: 'intermediate',
    title: 'Средний уровень',
    description: 'Умею писать простые программы'
  }
]

const learningGoals = [
  { id: 'ege', title: 'Подготовка к ЕГЭ', icon: 'IconAward' },
  { id: 'basics', title: 'Изучить основы', icon: 'IconBookOpen' },
  { id: 'projects', title: 'Создавать проекты', icon: 'IconCode' },
  { id: 'career', title: 'IT карьера', icon: 'IconTrendingUp' },
  { id: 'olympiad', title: 'Олимпиады', icon: 'IconTrophy' },
  { id: 'hobby', title: 'Для себя', icon: 'IconHeart' }
]

const floatingIcons = ['IconCode', 'IconBookOpen', 'IconTrophy', 'IconStar', 'IconRocket']

// Computed
const passwordStrength = computed(() => {
  if (!registerForm.value.password) {
    return { score: 0, level: 'weak', text: '' }
  }
  
  const validation = validatePassword(registerForm.value.password)
  let score = 0
  
  if (validation.checks.minLength) score++
  if (validation.checks.hasUpperCase) score++
  if (validation.checks.hasLowerCase) score++
  if (validation.checks.hasNumbers) score++
  
  const levels = ['weak', 'weak', 'medium', 'strong', 'strong']
  const texts = ['Слабый', 'Слабый', 'Средний', 'Сильный', 'Очень сильный']
  
  return {
    score,
    level: levels[score],
    text: texts[score]
  }
})

const isCurrentStepValid = computed(() => {
  switch (currentStep.value) {
    case 0:
      return registerForm.value.firstName &&
             registerForm.value.lastName &&
             registerForm.value.email &&
             registerForm.value.password &&
             registerForm.value.confirmPassword &&
             !errors.value.firstName &&
             !errors.value.lastName &&
             !errors.value.email &&
             !errors.value.password &&
             !errors.value.confirmPassword
             
    case 1:
      return registerForm.value.grade !== null
      
    case 2:
      return registerForm.value.agreeTerms
      
    default:
      return false
  }
})

const isFormValid = computed(() => {
  return isCurrentStepValid.value && currentStep.value === steps.length - 1
})

// Methods
const validateField = (field) => {
  switch (field) {
    case 'firstName':
      if (!registerForm.value.firstName) {
        errors.value.firstName = 'Имя обязательно'
      } else if (registerForm.value.firstName.length < 2) {
        errors.value.firstName = 'Имя должно содержать минимум 2 символа'
      } else {
        errors.value.firstName = ''
      }
      break
      
    case 'lastName':
      if (!registerForm.value.lastName) {
        errors.value.lastName = 'Фамилия обязательна'
      } else if (registerForm.value.lastName.length < 2) {
        errors.value.lastName = 'Фамилия должна содержать минимум 2 символа'
      } else {
        errors.value.lastName = ''
      }
      break
      
    case 'email':
      if (!registerForm.value.email) {
        errors.value.email = 'Email обязателен'
      } else if (!isValidEmail(registerForm.value.email)) {
        errors.value.email = 'Введите корректный email'
      } else {
        errors.value.email = ''
      }
      break
      
    case 'password':
      if (!registerForm.value.password) {
        errors.value.password = 'Пароль обязателен'
      } else if (registerForm.value.password.length < 8) {
        errors.value.password = 'Пароль должен содержать минимум 8 символов'
      } else {
        errors.value.password = ''
      }
      
      // Также проверяем подтверждение пароля
      if (registerForm.value.confirmPassword) {
        validateField('confirmPassword')
      }
      break
      
    case 'confirmPassword':
      if (!registerForm.value.confirmPassword) {
        errors.value.confirmPassword = 'Подтвердите пароль'
      } else if (registerForm.value.password !== registerForm.value.confirmPassword) {
        errors.value.confirmPassword = 'Пароли не совпадают'
      } else {
        errors.value.confirmPassword = ''
      }
      break
      
    case 'grade':
      if (!registerForm.value.grade) {
        errors.value.grade = 'Выберите класс'
      } else {
        errors.value.grade = ''
      }
      break
  }
}

const validateCurrentStep = () => {
  switch (currentStep.value) {
    case 0:
      validateField('firstName')
      validateField('lastName')
      validateField('email')
      validateField('password')
      validateField('confirmPassword')
      break
      
    case 1:
      validateField('grade')
      break
  }
}

const nextStep = () => {
  validateCurrentStep()
  
  if (isCurrentStepValid.value && currentStep.value < steps.length - 1) {
    currentStep.value++
  }
}

const previousStep = () => {
  if (currentStep.value > 0) {
    currentStep.value--
  }
}

const handleSubmit = async () => {
  generalError.value = ''
  validateCurrentStep()
  
  if (!isFormValid.value) {
    return
  }

  try {
    await authStore.register({
      firstName: registerForm.value.firstName,
      lastName: registerForm.value.lastName,
      email: registerForm.value.email,
      password: registerForm.value.password,
      grade: registerForm.value.grade,
      school: registerForm.value.school,
      experience: registerForm.value.experience,
      goals: registerForm.value.goals,
      agreeEmails: registerForm.value.agreeEmails
    })

    showNotification('Аккаунт создан успешно! Добро пожаловать!', 'success')
    router.push('/dashboard')

  } catch (error) {
    console.error('Ошибка регистрации:', error)
    
    if (error.response?.status === 409) {
      generalError.value = 'Пользователь с таким email уже существует'
      currentStep.value = 0 // Возвращаем на первый шаг
    } else if (error.response?.data?.message) {
      generalError.value = error.response.data.message
    } else {
      generalError.value = 'Произошла ошибка при регистрации. Попробуйте позже'
    }
  }
}

// Lifecycle
onMounted(() => {
  // Автофокус на первое поле
  setTimeout(() => {
    const firstInput = document.querySelector('input')
    if (firstInput) {
      firstInput.focus()
    }
  }, 100)
})
</script>

<style scoped>
.register-page {
  min-height: 100vh;
  background: linear-gradient(135deg, var(--bg-primary) 0%, var(--accent-primary) 100%);
  position: relative;
  overflow: hidden;
}

.background-pattern {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: url('data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><defs><pattern id="grid" width="10" height="10" patternUnits="userSpaceOnUse"><path d="M 10 0 L 0 0 0 10" fill="none" stroke="rgba(255,255,255,0.1)" stroke-width="0.5"/></pattern></defs><rect width="100" height="100" fill="url(%23grid)"/></svg>');
}

.floating-icons {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  pointer-events: none;
  overflow: hidden;
}

.floating-icon {
  position: absolute;
  color: rgba(255, 255, 255, 0.1);
  animation: float 20s linear infinite;
}

.floating-icon:nth-child(1) { top: 10%; left: 10%; animation-delay: 0s; }
.floating-icon:nth-child(2) { top: 20%; right: 20%; animation-delay: 4s; }
.floating-icon:nth-child(3) { bottom: 30%; left: 15%; animation-delay: 8s; }
.floating-icon:nth-child(4) { bottom: 20%; right: 10%; animation-delay: 12s; }
.floating-icon:nth-child(5) { top: 50%; left: 5%; animation-delay: 16s; }
.floating-icon:nth-child(6) { top: 70%; right: 5%; animation-delay: 2s; }

@keyframes float {
  0%, 100% { transform: translateY(0) rotate(0deg); opacity: 0.1; }
  50% { transform: translateY(-20px) rotate(180deg); opacity: 0.3; }
}

.register-container {
  display: grid;
  grid-template-columns: 1fr 1fr;
  min-height: 100vh;
  position: relative;
  z-index: 1;
}

/* Register Card */
.register-card {
  display: flex;
  flex-direction: column;
  justify-content: center;
  padding: 2rem;
  max-width: 520px;
  margin: 0 auto;
  width: 100%;
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(10px);
  border-radius: var(--radius-xl);
  box-shadow: var(--shadow-xl);
  margin-top: 2rem;
  margin-bottom: 2rem;
}

.register-header {
  text-align: center;
  margin-bottom: 2rem;
}

.logo-link {
  display: inline-flex;
  align-items: center;
  gap: 0.75rem;
  text-decoration: none;
  margin-bottom: 1.5rem;
  color: var(--text-primary);
}

.logo {
  width: 32px;
  height: 32px;
}

.logo-text {
  font-size: 1.25rem;
  font-weight: 600;
}

.register-title {
  font-size: 1.75rem;
  font-weight: 700;
  margin: 0 0 0.5rem 0;
  color: var(--text-primary);
}

.register-subtitle {
  color: var(--text-secondary);
  margin: 0;
}

/* Progress Steps */
.progress-steps {
  display: flex;
  justify-content: center;
  margin-bottom: 2rem;
  gap: 1rem;
}

.progress-step {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.5rem;
  opacity: 0.5;
  transition: all var(--transition-fast);
}

.progress-step--active {
  opacity: 1;
}

.progress-step--completed {
  opacity: 1;
}

.step-number {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background: var(--bg-tertiary);
  color: var(--text-secondary);
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 600;
  font-size: 0.875rem;
  border: 2px solid var(--border-primary);
  transition: all var(--transition-fast);
}

.progress-step--active .step-number {
  background: var(--accent-primary);
  color: white;
  border-color: var(--accent-primary);
}

.progress-step--completed .step-number {
  background: var(--accent-success);
  color: white;
  border-color: var(--accent-success);
}

.step-label {
  font-size: 0.75rem;
  color: var(--text-muted);
  font-weight: 500;
}

.progress-step--active .step-label,
.progress-step--completed .step-label {
  color: var(--text-primary);
}

/* Form */
.register-form {
  margin-bottom: 1.5rem;
}

.form-step {
  animation: slideIn 0.3s ease-out;
}

.step-title {
  font-size: 1.125rem;
  font-weight: 600;
  margin-bottom: 1.5rem;
  color: var(--text-primary);
  text-align: center;
}

.form-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1rem;
  margin-bottom: 1rem;
}

.form-group {
  margin-bottom: 1.5rem;
}

.form-label {
  display: block;
  margin-bottom: 0.75rem;
  font-weight: 500;
  color: var(--text-primary);
}

/* Grade Selector */
.grade-selector {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 0.5rem;
}

.grade-option {
  padding: 0.75rem;
  border: 2px solid var(--border-primary);
  border-radius: var(--radius-md);
  background: var(--bg-tertiary);
  color: var(--text-primary);
  font-weight: 500;
  cursor: pointer;
  transition: all var(--transition-fast);
}

.grade-option:hover {
  border-color: var(--accent-primary);
}

.grade-option.active {
  background: var(--accent-primary);
  color: white;
  border-color: var(--accent-primary);
}

/* Experience Options */
.experience-options {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.experience-option {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 1rem;
  border: 2px solid var(--border-primary);
  border-radius: var(--radius-md);
  cursor: pointer;
  transition: all var(--transition-fast);
}

.experience-option:hover {
  border-color: var(--accent-primary);
}

.experience-option input[type="radio"] {
  accent-color: var(--accent-primary);
}

.option-title {
  font-weight: 500;
  color: var(--text-primary);
}

.option-description {
  font-size: 0.875rem;
  color: var(--text-secondary);
}

/* Goals Grid */
.goals-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
  gap: 0.75rem;
}

.goal-option {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.5rem;
  padding: 1rem;
  border: 2px solid var(--border-primary);
  border-radius: var(--radius-md);
  cursor: pointer;
  transition: all var(--transition-fast);
  text-align: center;
}

.goal-option:hover {
  border-color: var(--accent-primary);
}

.goal-option.active {
  background: rgba(var(--accent-primary-rgb), 0.1);
  border-color: var(--accent-primary);
}

.goal-option input[type="checkbox"] {
  display: none;
}

.goal-icon {
  color: var(--accent-primary);
}

.goal-text {
  font-size: 0.875rem;
  font-weight: 500;
  color: var(--text-primary);
}

/* Password Strength */
.password-strength {
  margin-top: 0.5rem;
}

.strength-label {
  font-size: 0.875rem;
  color: var(--text-secondary);
  margin-bottom: 0.5rem;
}

.strength-bar {
  height: 4px;
  background: var(--bg-tertiary);
  border-radius: var(--radius-full);
  overflow: hidden;
  margin-bottom: 0.25rem;
}

.strength-fill {
  height: 100%;
  transition: all var(--transition-fast);
}

.strength-fill--weak { background: var(--accent-error); }
.strength-fill--medium { background: var(--accent-warning); }
.strength-fill--strong { background: var(--accent-success); }

.strength-text {
  font-size: 0.75rem;
  font-weight: 500;
}

/* Agreements */
.agreements {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  margin-top: 1.5rem;
}

.agreement-item {
  display: flex;
  align-items: flex-start;
  gap: 0.75rem;
  cursor: pointer;
}

.agreement-item input[type="checkbox"] {
  display: none;
}

.checkbox-custom {
  width: 18px;
  height: 18px;
  border: 2px solid var(--border-primary);
  border-radius: var(--radius-sm);
  background: var(--bg-tertiary);
  position: relative;
  flex-shrink: 0;
  margin-top: 2px;
  transition: all var(--transition-fast);
}

.checkbox-custom::after {
  content: '';
  position: absolute;
  width: 6px;
  height: 10px;
  border: solid white;
  border-width: 0 2px 2px 0;
  transform: rotate(45deg) scale(0);
  top: 1px;
  left: 5px;
  transition: transform var(--transition-fast);
}

.agreement-item input:checked + .checkbox-custom {
  background: var(--accent-primary);
  border-color: var(--accent-primary);
}

.agreement-item input:checked + .checkbox-custom::after {
  transform: rotate(45deg) scale(1);
}

.agreement-text {
  font-size: 0.875rem;
  color: var(--text-secondary);
  line-height: 1.5;
}

.agreement-link {
  color: var(--accent-primary);
  text-decoration: none;
}

.agreement-link:hover {
  text-decoration: underline;
}

/* Navigation */
.form-navigation {
  display: flex;
  justify-content: space-between;
  margin-top: 2rem;
  gap: 1rem;
}

.ml-auto {
  margin-left: auto;
}

/* Error Message */
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
  margin-top: 1rem;
}

.field-error {
  color: var(--accent-error);
  font-size: 0.875rem;
  margin-top: 0.25rem;
}

/* Login Link */
.login-link {
  text-align: center;
  margin-bottom: 1rem;
}

.login-link span {
  color: var(--text-secondary);
  margin-right: 0.5rem;
}

.login-button {
  color: var(--accent-primary);
  text-decoration: none;
  font-weight: 500;
}

.login-button:hover {
  text-decoration: underline;
}

/* Benefits Sidebar */
.benefits-sidebar {
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(10px);
  padding: 3rem;
  display: flex;
  flex-direction: column;
  justify-content: center;
  color: white;
}

.benefits-title {
  font-size: 2rem;
  font-weight: 700;
  margin: 0 0 2rem 0;
}

.benefits-list {
  margin-bottom: 3rem;
}

.benefit-item {
  display: flex;
  gap: 1rem;
  margin-bottom: 2rem;
}

.benefit-icon {
  flex-shrink: 0;
  opacity: 0.8;
}

.benefit-title {
  font-size: 1.125rem;
  font-weight: 600;
  margin: 0 0 0.5rem 0;
}

.benefit-description {
  opacity: 0.9;
  line-height: 1.5;
  margin: 0;
}

/* Testimonial */
.testimonial {
  padding: 1.5rem;
  background: rgba(255, 255, 255, 0.1);
  border-radius: var(--radius-lg);
  backdrop-filter: blur(5px);
}

.testimonial-text {
  font-style: italic;
  margin: 0 0 1rem 0;
  line-height: 1.6;
}

.testimonial-author {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.author-avatar {
  width: 40px;
  height: 40px;
  background: rgba(255, 255, 255, 0.2);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 600;
}

.author-name {
  font-weight: 500;
}

.author-details {
  font-size: 0.875rem;
  opacity: 0.8;
}

/* Animations */
@keyframes slideIn {
  from {
    opacity: 0;
    transform: translateX(20px);
  }
  to {
    opacity: 1;
    transform: translateX(0);
  }
}

/* Responsive */
@media (max-width: 1024px) {
  .register-container {
    grid-template-columns: 1fr;
  }
  
  .benefits-sidebar {
    order: -1;
    padding: 2rem;
  }
  
  .register-card {
    margin: 1rem;
  }
}

@media (max-width: 768px) {
  .register-card {
    padding: 1.5rem;
  }
  
  .form-row {
    grid-template-columns: 1fr;
  }
  
  .grade-selector {
    grid-template-columns: repeat(2, 1fr);
  }
  
  .goals-grid {
    grid-template-columns: repeat(2, 1fr);
  }
  
  .benefits-sidebar {
    padding: 1.5rem;
  }
  
  .benefits-title {
    font-size: 1.5rem;
  }
}

@media (max-width: 640px) {
  .register-card {
    padding: 1rem;
    margin: 0.5rem;
  }
  
  .progress-steps {
    gap: 0.5rem;
  }
  
  .step-label {
    display: none;
  }
  
  .form-navigation {
    flex-direction: column;
  }
  
  .goals-grid {
    grid-template-columns: 1fr;
  }
  
  .floating-icons {
    display: none;
  }
}
</style>