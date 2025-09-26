<template>
  <BaseModal
    :model-value="true"
    @update:model-value="$emit('close')"
    title="Профиль пользователя"
    size="lg"
    :loading="loading"
  >
    <div class="profile-modal-content">
      <!-- Avatar Section -->
      <div class="profile-avatar-section">
        <div class="avatar-container">
          <img 
            v-if="profile.avatarUrl" 
            :src="profile.avatarUrl" 
            :alt="profile.firstName"
            class="profile-avatar"
          />
          <div v-else class="profile-avatar profile-avatar--placeholder">
            {{ getUserInitials }}
          </div>
          
          <button 
            class="avatar-upload-btn"
            @click="openAvatarUpload"
            :disabled="loading"
          >
            <IconCamera :size="16" />
          </button>
          
          <input
            ref="avatarInput"
            type="file"
            accept="image/*"
            @change="handleAvatarUpload"
            class="hidden"
          />
        </div>
        
        <div class="avatar-info">
          <h3 class="profile-name">{{ profile.firstName }} {{ profile.lastName }}</h3>
          <p class="profile-email">{{ profile.email }}</p>
          <BaseBadge 
            :text="`Уровень ${userProgress?.currentLevel || 1}`" 
            variant="primary" 
          />
        </div>
      </div>

      <!-- Tabs -->
      <div class="profile-tabs">
        <button 
          v-for="tab in tabs" 
          :key="tab.id"
          class="tab-button"
          :class="{ active: activeTab === tab.id }"
          @click="activeTab = tab.id"
        >
          <component :is="tab.icon" :size="18" />
          {{ tab.label }}
        </button>
      </div>

      <!-- Tab Content -->
      <div class="tab-content">
        <!-- Personal Info Tab -->
        <div v-if="activeTab === 'personal'" class="tab-panel">
          <form @submit.prevent="savePersonalInfo" class="profile-form">
            <div class="form-row">
              <BaseInput
                v-model="profile.firstName"
                label="Имя"
                placeholder="Введите имя"
                required
                :disabled="loading"
              />
              <BaseInput
                v-model="profile.lastName"
                label="Фамилия"
                placeholder="Введите фамилию"
                required
                :disabled="loading"
              />
            </div>
            
            <BaseInput
              v-model="profile.email"
              label="Email"
              type="email"
              placeholder="Введите email"
              required
              :disabled="loading"
            />
            
            <div class="form-row">
              <div class="form-group">
                <label class="form-label">Класс</label>
                <select v-model="profile.grade" class="form-select" :disabled="loading">
                  <option value="">Выберите класс</option>
                  <option v-for="grade in grades" :key="grade" :value="grade">
                    {{ grade }} класс
                  </option>
                </select>
              </div>
              
              <BaseInput
                v-model="profile.school"
                label="Школа"
                placeholder="Название школы"
                :disabled="loading"
              />
            </div>
            
            <div class="form-group">
              <label class="form-label">О себе</label>
              <textarea
                v-model="profile.bio"
                class="form-textarea"
                placeholder="Расскажите о себе..."
                rows="4"
                :disabled="loading"
              />
            </div>
            
            <div class="form-actions">
              <BaseButton 
                type="submit" 
                variant="primary"
                :loading="loading"
              >
                Сохранить изменения
              </BaseButton>
            </div>
          </form>
        </div>

        <!-- Settings Tab -->
        <div v-if="activeTab === 'settings'" class="tab-panel">
          <div class="settings-section">
            <h4 class="settings-title">Уведомления</h4>
            <div class="settings-group">
              <div class="setting-item">
                <div class="setting-info">
                  <label class="setting-label">Email уведомления</label>
                  <p class="setting-description">Получать уведомления о новых курсах и достижениях</p>
                </div>
                <label class="toggle-switch">
                  <input 
                    type="checkbox" 
                    v-model="profile.emailNotifications"
                    @change="saveSettings"
                  />
                  <span class="toggle-slider"></span>
                </label>
              </div>
              
              <div class="setting-item">
                <div class="setting-info">
                  <label class="setting-label">Push уведомления</label>
                  <p class="setting-description">Получать push-уведомления в браузере</p>
                </div>
                <label class="toggle-switch">
                  <input 
                    type="checkbox" 
                    v-model="profile.pushNotifications"
                    @change="saveSettings"
                  />
                  <span class="toggle-slider"></span>
                </label>
              </div>
            </div>
          </div>

          <div class="settings-section">
            <h4 class="settings-title">Интерфейс</h4>
            <div class="settings-group">
              <div class="setting-item">
                <div class="setting-info">
                  <label class="setting-label">Язык интерфейса</label>
                  <p class="setting-description">Выберите язык интерфейса</p>
                </div>
                <select v-model="profile.language" class="setting-select" @change="saveSettings">
                  <option value="ru">Русский</option>
                  <option value="en">English</option>
                  <option value="es">Español</option>
                </select>
              </div>
              
              <div class="setting-item">
                <div class="setting-info">
                  <label class="setting-label">Часовой пояс</label>
                  <p class="setting-description">Выберите ваш часовой пояс</p>
                </div>
                <select v-model="profile.timezone" class="setting-select" @change="saveSettings">
                  <option value="Europe/Moscow">Москва (UTC+3)</option>
                  <option value="Europe/Kiev">Киев (UTC+2)</option>
                  <option value="Europe/Minsk">Минск (UTC+3)</option>
                  <option value="Asia/Almaty">Алматы (UTC+6)</option>
                </select>
              </div>
            </div>
          </div>
        </div>

        <!-- Statistics Tab -->
        <div v-if="activeTab === 'stats'" class="tab-panel">
          <div class="stats-grid">
            <div class="stat-card">
              <div class="stat-icon">
                <IconTrophy :size="24" />
              </div>
              <div class="stat-info">
                <div class="stat-value">{{ userProgress?.totalXp || 0 }}</div>
                <div class="stat-label">Общий опыт</div>
              </div>
            </div>
            
            <div class="stat-card">
              <div class="stat-icon">
                <IconBookOpen :size="24" />
              </div>
              <div class="stat-info">
                <div class="stat-value">{{ userProgress?.completedLessons || 0 }}</div>
                <div class="stat-label">Уроков пройдено</div>
              </div>
            </div>
            
            <div class="stat-card">
              <div class="stat-icon">
                <IconZap :size="24" />
              </div>
              <div class="stat-info">
                <div class="stat-value">{{ userProgress?.currentStreak || 0 }}</div>
                <div class="stat-label">Текущий стрик</div>
              </div>
            </div>
            
            <div class="stat-card">
              <div class="stat-icon">
                <IconStar :size="24" />
              </div>
              <div class="stat-info">
                <div class="stat-value">{{ achievements?.length || 0 }}</div>
                <div class="stat-label">Достижений</div>
              </div>
            </div>
          </div>

          <!-- Learning Activity Chart -->
          <div class="activity-section">
            <h4 class="section-title">Активность обучения</h4>
            <div class="activity-chart">
              <!-- Здесь может быть компонент графика активности -->
              <div class="activity-placeholder">
                <IconBarChart :size="48" />
                <p>График активности в разработке</p>
              </div>
            </div>
          </div>

          <!-- Recent Achievements -->
          <div class="achievements-section" v-if="recentAchievements.length > 0">
            <h4 class="section-title">Последние достижения</h4>
            <div class="achievements-list">
              <div 
                v-for="achievement in recentAchievements" 
                :key="achievement.id"
                class="achievement-item"
              >
                <div class="achievement-icon">{{ achievement.icon }}</div>
                <div class="achievement-info">
                  <div class="achievement-title">{{ achievement.title }}</div>
                  <div class="achievement-date">{{ formatDate(achievement.earnedAt) }}</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Security Tab -->
        <div v-if="activeTab === 'security'" class="tab-panel">
          <form @submit.prevent="changePassword" class="security-form">
            <h4 class="section-title">Изменить пароль</h4>
            
            <BaseInput
              v-model="passwordForm.currentPassword"
              label="Текущий пароль"
              type="password"
              placeholder="Введите текущий пароль"
              required
              :disabled="loading"
            />
            
            <BaseInput
              v-model="passwordForm.newPassword"
              label="Новый пароль"
              type="password"
              placeholder="Введите новый пароль"
              required
              :disabled="loading"
            />
            
            <BaseInput
              v-model="passwordForm.confirmPassword"
              label="Подтвердите пароль"
              type="password"
              placeholder="Подтвердите новый пароль"
              required
              :disabled="loading"
            />
            
            <div class="form-actions">
              <BaseButton 
                type="submit" 
                variant="primary"
                :loading="loading"
                :disabled="!isPasswordFormValid"
              >
                Изменить пароль
              </BaseButton>
            </div>
          </form>

          <div class="danger-zone">
            <h4 class="section-title section-title--danger">Опасная зона</h4>
            <div class="danger-item">
              <div class="danger-info">
                <div class="danger-title">Удалить аккаунт</div>
                <div class="danger-description">
                  Это действие нельзя отменить. Все ваши данные будут удалены навсегда.
                </div>
              </div>
              <BaseButton 
                variant="error" 
                @click="confirmDeleteAccount"
                :disabled="loading"
              >
                Удалить аккаунт
              </BaseButton>
            </div>
          </div>
        </div>
      </div>
    </div>

    <template #footer>
      <div class="modal-footer">
        <BaseButton variant="ghost" @click="$emit('close')">
          Закрыть
        </BaseButton>
      </div>
    </template>
  </BaseModal>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { storeToRefs } from 'pinia'
import { useAuthStore } from '@/stores/auth'
import { useProgressStore } from '@/stores/progress'
import { useNotifications } from '@/composables/useNotifications'
import { formatDate } from '@/utils/helpers'

const emit = defineEmits(['close'])

// Stores
const authStore = useAuthStore()
const progressStore = useProgressStore()
const { user, loading } = storeToRefs(authStore)
const { userProgress, achievements } = storeToRefs(progressStore)

// Composables
const { showNotification } = useNotifications()

// Refs
const avatarInput = ref(null)
const activeTab = ref('personal')

// Form data
const profile = ref({
  firstName: '',
  lastName: '',
  email: '',
  grade: null,
  school: '',
  bio: '',
  avatarUrl: '',
  emailNotifications: true,
  pushNotifications: true,
  language: 'ru',
  timezone: 'Europe/Moscow'
})

const passwordForm = ref({
  currentPassword: '',
  newPassword: '',
  confirmPassword: ''
})

// Computed
const getUserInitials = computed(() => {
  const first = profile.value.firstName?.[0] || ''
  const last = profile.value.lastName?.[0] || ''
  return (first + last).toUpperCase() || 'U'
})

const isPasswordFormValid = computed(() => {
  return passwordForm.value.currentPassword &&
         passwordForm.value.newPassword &&
         passwordForm.value.confirmPassword &&
         passwordForm.value.newPassword === passwordForm.value.confirmPassword &&
         passwordForm.value.newPassword.length >= 8
})

const recentAchievements = computed(() => {
  return achievements.value
    ?.slice(0, 5)
    ?.map(achievement => ({
      ...achievement,
      earnedAt: new Date() // В реальном приложении из API
    })) || []
})

// Data
const tabs = [
  { id: 'personal', label: 'Личные данные', icon: 'IconUser' },
  { id: 'settings', label: 'Настройки', icon: 'IconSettings' },
  { id: 'stats', label: 'Статистика', icon: 'IconBarChart' },
  { id: 'security', label: 'Безопасность', icon: 'IconShield' }
]

const grades = [8, 9, 10, 11]

// Methods
const loadUserData = () => {
  if (user.value) {
    profile.value = {
      firstName: user.value.firstName || '',
      lastName: user.value.lastName || '',
      email: user.value.email || '',
      grade: user.value.grade || null,
      school: user.value.school || '',
      bio: user.value.bio || '',
      avatarUrl: user.value.avatarUrl || '',
      emailNotifications: user.value.emailNotifications ?? true,
      pushNotifications: user.value.pushNotifications ?? true,
      language: user.value.language || 'ru',
      timezone: user.value.timezone || 'Europe/Moscow'
    }
  }
}

const openAvatarUpload = () => {
  avatarInput.value?.click()
}

const handleAvatarUpload = async (event) => {
  const file = event.target.files?.[0]
  if (!file) return

  // Проверяем размер файла (максимум 5MB)
  if (file.size > 5 * 1024 * 1024) {
    showNotification('Файл слишком большой. Максимальный размер: 5MB', 'error')
    return
  }

  // Проверяем тип файла
  if (!file.type.startsWith('image/')) {
    showNotification('Можно загружать только изображения', 'error')
    return
  }

  try {
    // В реальном приложении здесь был бы вызов API для загрузки файла
    const formData = new FormData()
    formData.append('avatar', file)
    
    // Временно показываем preview
    const reader = new FileReader()
    reader.onload = (e) => {
      profile.value.avatarUrl = e.target.result
    }
    reader.readAsDataURL(file)
    
    showNotification('Аватар загружен успешно', 'success')
  } catch (error) {
    console.error('Ошибка загрузки аватара:', error)
    showNotification('Ошибка при загрузке аватара', 'error')
  }

  // Очищаем input
  event.target.value = ''
}

const savePersonalInfo = async () => {
  try {
    await authStore.updateProfile(profile.value)
    showNotification('Профиль обновлен успешно', 'success')
  } catch (error) {
    console.error('Ошибка обновления профиля:', error)
    showNotification('Ошибка при обновлении профиля', 'error')
  }
}

const saveSettings = async () => {
  try {
    await authStore.updateProfile({
      emailNotifications: profile.value.emailNotifications,
      pushNotifications: profile.value.pushNotifications,
      language: profile.value.language,
      timezone: profile.value.timezone
    })
    showNotification('Настройки сохранены', 'success')
  } catch (error) {
    console.error('Ошибка сохранения настроек:', error)
    showNotification('Ошибка при сохранении настроек', 'error')
  }
}

const changePassword = async () => {
  try {
    await authStore.changePassword(
      passwordForm.value.currentPassword,
      passwordForm.value.newPassword
    )
    
    passwordForm.value = {
      currentPassword: '',
      newPassword: '',
      confirmPassword: ''
    }
    
    showNotification('Пароль изменен успешно', 'success')
  } catch (error) {
    console.error('Ошибка изменения пароля:', error)
    showNotification('Ошибка при изменении пароля', 'error')
  }
}

const confirmDeleteAccount = () => {
  if (confirm('Вы уверены, что хотите удалить аккаунт? Это действие нельзя отменить.')) {
    deleteAccount()
  }
}

const deleteAccount = async () => {
  try {
    await authStore.deleteAccount()
    showNotification('Аккаунт удален', 'success')
    emit('close')
  } catch (error) {
    console.error('Ошибка удаления аккаунта:', error)
    showNotification('Ошибка при удалении аккаунта', 'error')
  }
}

// Lifecycle
onMounted(() => {
  loadUserData()
})
</script>

<style scoped>
.profile-modal-content {
  min-height: 500px;
}

/* Avatar Section */
.profile-avatar-section {
  display: flex;
  align-items: center;
  gap: 1.5rem;
  padding: 1.5rem 0;
  border-bottom: 1px solid var(--border-primary);
  margin-bottom: 1.5rem;
}

.avatar-container {
  position: relative;
}

.profile-avatar {
  width: 80px;
  height: 80px;
  border-radius: var(--radius-full);
  object-fit: cover;
}

.profile-avatar--placeholder {
  background-color: var(--accent-primary);
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 600;
  font-size: 1.5rem;
}

.avatar-upload-btn {
  position: absolute;
  bottom: 0;
  right: 0;
  width: 32px;
  height: 32px;
  border: 2px solid var(--bg-secondary);
  border-radius: var(--radius-full);
  background-color: var(--accent-primary);
  color: white;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all var(--transition-fast);
}

.avatar-upload-btn:hover {
  background-color: var(--accent-primary);
  filter: brightness(1.1);
}

.avatar-info {
  flex: 1;
}

.profile-name {
  margin: 0 0 0.25rem 0;
  font-size: 1.5rem;
  font-weight: 600;
  color: var(--text-primary);
}

.profile-email {
  margin: 0 0 0.75rem 0;
  color: var(--text-secondary);
}

/* Tabs */
.profile-tabs {
  display: flex;
  border-bottom: 1px solid var(--border-primary);
  margin-bottom: 1.5rem;
}

.tab-button {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem 1rem;
  border: none;
  background: none;
  color: var(--text-secondary);
  cursor: pointer;
  border-bottom: 2px solid transparent;
  transition: all var(--transition-fast);
}

.tab-button:hover {
  color: var(--text-primary);
  background-color: var(--bg-hover);
}

.tab-button.active {
  color: var(--accent-primary);
  border-bottom-color: var(--accent-primary);
}

/* Tab Content */
.tab-content {
  min-height: 400px;
}

.tab-panel {
  animation: fadeIn 0.3s ease-out;
}

/* Forms */
.profile-form,
.security-form {
  max-width: 500px;
}

.form-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1rem;
  margin-bottom: 1rem;
}

.form-group {
  margin-bottom: 1rem;
}

.form-label {
  display: block;
  margin-bottom: 0.5rem;
  font-weight: 500;
  color: var(--text-primary);
}

.form-select,
.form-textarea {
  width: 100%;
  padding: 0.75rem;
  border: 1px solid var(--border-primary);
  border-radius: var(--radius-md);
  background-color: var(--bg-tertiary);
  color: var(--text-primary);
  font-family: var(--font-ui);
  transition: border-color var(--transition-fast);
}

.form-select:focus,
.form-textarea:focus {
  outline: none;
  border-color: var(--accent-primary);
}

.form-textarea {
  resize: vertical;
  min-height: 100px;
}

.form-actions {
  margin-top: 1.5rem;
  padding-top: 1.5rem;
  border-top: 1px solid var(--border-primary);
}

/* Settings */
.settings-section {
  margin-bottom: 2rem;
}

.settings-title {
  margin: 0 0 1rem 0;
  font-size: 1.125rem;
  font-weight: 600;
  color: var(--text-primary);
}

.settings-title--danger {
  color: var(--accent-error);
}

.settings-group {
  space-y: 1rem;
}

.setting-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 1rem;
  border: 1px solid var(--border-primary);
  border-radius: var(--radius-md);
  margin-bottom: 0.75rem;
}

.setting-info {
  flex: 1;
}

.setting-label {
  display: block;
  font-weight: 500;
  color: var(--text-primary);
  margin-bottom: 0.25rem;
}

.setting-description {
  margin: 0;
  font-size: 0.875rem;
  color: var(--text-secondary);
}

.setting-select {
  min-width: 150px;
  padding: 0.5rem;
  border: 1px solid var(--border-primary);
  border-radius: var(--radius-md);
  background-color: var(--bg-tertiary);
  color: var(--text-primary);
}

/* Toggle Switch */
.toggle-switch {
  position: relative;
  display: inline-block;
  width: 50px;
  height: 24px;
}

.toggle-switch input {
  opacity: 0;
  width: 0;
  height: 0;
}

.toggle-slider {
  position: absolute;
  cursor: pointer;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: var(--bg-tertiary);
  border: 1px solid var(--border-primary);
  border-radius: 24px;
  transition: 0.3s;
}

.toggle-slider:before {
  position: absolute;
  content: "";
  height: 18px;
  width: 18px;
  left: 2px;
  bottom: 2px;
  background-color: white;
  border-radius: 50%;
  transition: 0.3s;
}

input:checked + .toggle-slider {
  background-color: var(--accent-primary);
  border-color: var(--accent-primary);
}

input:checked + .toggle-slider:before {
  transform: translateX(26px);
}

/* Statistics */
.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1rem;
  margin-bottom: 2rem;
}

.stat-card {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 1.5rem;
  background-color: var(--bg-tertiary);
  border: 1px solid var(--border-primary);
  border-radius: var(--radius-lg);
}

.stat-icon {
  color: var(--accent-primary);
}

.stat-value {
  font-size: 1.5rem;
  font-weight: 600;
  color: var(--text-primary);
}

.stat-label {
  font-size: 0.875rem;
  color: var(--text-secondary);
}

.section-title {
  margin: 0 0 1rem 0;
  font-size: 1.125rem;
  font-weight: 600;
  color: var(--text-primary);
}

.activity-section,
.achievements-section {
  margin-bottom: 2rem;
}

.activity-chart {
  height: 200px;
  border: 1px solid var(--border-primary);
  border-radius: var(--radius-lg);
  display: flex;
  align-items: center;
  justify-content: center;
}

.activity-placeholder {
  text-align: center;
  color: var(--text-muted);
}

.achievements-list {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.achievement-item {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 1rem;
  background-color: var(--bg-tertiary);
  border-radius: var(--radius-md);
}

.achievement-icon {
  font-size: 1.5rem;
}

.achievement-title {
  font-weight: 500;
  color: var(--text-primary);
}

.achievement-date {
  font-size: 0.875rem;
  color: var(--text-secondary);
}

/* Security */
.danger-zone {
  margin-top: 2rem;
  padding-top: 2rem;
  border-top: 1px solid var(--border-primary);
}

.danger-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 1rem;
  border: 1px solid var(--accent-error);
  border-radius: var(--radius-md);
  background-color: rgba(var(--accent-error-rgb), 0.05);
}

.danger-title {
  font-weight: 500;
  color: var(--accent-error);
  margin-bottom: 0.25rem;
}

.danger-description {
  font-size: 0.875rem;
  color: var(--text-secondary);
}

/* Modal Footer */
.modal-footer {
  display: flex;
  justify-content: flex-end;
  gap: 0.75rem;
}

/* Utilities */
.hidden {
  display: none;
}

/* Animations */
@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* Responsive */
@media (max-width: 768px) {
  .profile-avatar-section {
    flex-direction: column;
    text-align: center;
  }
  
  .form-row {
    grid-template-columns: 1fr;
  }
  
  .stats-grid {
    grid-template-columns: 1fr;
  }
  
  .setting-item,
  .danger-item {
    flex-direction: column;
    align-items: flex-start;
    gap: 1rem;
  }
  
  .profile-tabs {
    overflow-x: auto;
    scrollbar-width: none;
    -ms-overflow-style: none;
  }
  
  .profile-tabs::-webkit-scrollbar {
    display: none;
  }
}
</style>