<template>
  <div id="app" :data-theme="currentTheme">
    <!-- Уведомления о загрузке -->
    <Transition name="fade">
      <div v-if="isLoading" class="loading-screen">
        <div class="loading-content">
          <div class="spinner spinner-lg"></div>
          <h2 class="text-xl font-semibold mt-4">PythonLearn</h2>
          <p class="text-secondary">Загружаем платформу...</p>
        </div>
      </div>
    </Transition>

    <!-- Основное приложение -->
    <div v-if="!isLoading" class="app-container">
      <!-- Хедер -->
      <TheHeader v-if="!isFullscreen" />

      <!-- Основной контент -->
      <main class="main-content" :class="{ 'fullscreen': isFullscreen }">
        <RouterView v-slot="{ Component, route }">
          <Transition :name="getTransitionName(route)" mode="out-in">
            <component :is="Component" :key="route.path" />
          </Transition>
        </RouterView>
      </main>

      <!-- Футер -->
      <TheFooter v-if="!isFullscreen && !hideFooterRoutes.includes($route.name)" />
    </div>

    <!-- Глобальные модальные окна -->
    <Teleport to="body">
      <!-- Модалка профиля пользователя -->
      <UserProfileModal 
        v-if="showUserProfile" 
        @close="showUserProfile = false" 
      />
      
      <!-- Модалка настроек -->
      <SettingsModal 
        v-if="showSettings" 
        @close="showSettings = false" 
      />
      
      <!-- Модалка достижений -->
      <AchievementModal 
        v-if="showAchievement" 
        :achievement="currentAchievement"
        @close="showAchievement = false" 
      />
    </Teleport>

    <!-- Уведомления -->
    <NotificationContainer />

    <!-- PWA Update Prompt -->
    <UpdatePrompt v-if="showUpdatePrompt" @update="updateApp" @dismiss="dismissUpdate" />
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch, nextTick } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { storeToRefs } from 'pinia'

// Импорт компонентов
import TheHeader from '@/components/layout/TheHeader.vue'
import TheFooter from '@/components/layout/TheFooter.vue'
import UserProfileModal from '@/components/auth/UserProfileModal.vue'
import SettingsModal from '@/components/ui/SettingsModal.vue'
import AchievementModal from '@/components/progress/AchievementModal.vue'
import NotificationContainer from '@/components/ui/NotificationContainer.vue'
import UpdatePrompt from '@/components/ui/UpdatePrompt.vue'

// Импорт стилей
import '@/assets/styles/main.css'

// Импорт stores
import { useAuthStore } from '@/stores/auth'
import { useUIStore } from '@/stores/ui'
import { useProgressStore } from '@/stores/progress'

// Импорт composables
import { useTheme } from '@/composables/useTheme'
import { useNotifications } from '@/composables/useNotifications'
import { usePWA } from '@/composables/usePWA'

// Настройка stores
const authStore = useAuthStore()
const uiStore = useUIStore()
const progressStore = useProgressStore()

// Получаем реактивные данные из stores
const { isAuthenticated, user } = storeToRefs(authStore)
const { 
  isLoading, 
  showUserProfile, 
  showSettings, 
  showAchievement,
  currentAchievement,
  isFullscreen 
} = storeToRefs(uiStore)

// Composables
const { currentTheme, toggleTheme } = useTheme()
const { showNotification } = useNotifications()
const { showUpdatePrompt, updateApp, dismissUpdate } = usePWA()

const router = useRouter()
const route = useRoute()

// Локальные состояния
const hideFooterRoutes = ref(['lesson', 'quiz', 'project'])

// Инициализация приложения
onMounted(async () => {
  try {
    // Показываем экран загрузки
    uiStore.setLoading(true)
    
    // Инициализируем authentication
    await authStore.initialize()
    
    // Если пользователь авторизован, загружаем его данные
    if (isAuthenticated.value) {
      await Promise.all([
        progressStore.fetchUserProgress(),
        progressStore.fetchAchievements()
      ])
    }
    
    // Инициализация темы
    initializeTheme()
    
    // Проверяем обновления PWA
    checkForUpdates()
    
    await nextTick()
  } catch (error) {
    console.error('Ошибка инициализации приложения:', error)
    showNotification('Ошибка при загрузке приложения', 'error')
  } finally {
    // Скрываем экран загрузки с небольшой задержкой для плавности
    setTimeout(() => {
      uiStore.setLoading(false)
    }, 500)
  }
})

// Инициализация темы
const initializeTheme = () => {
  const savedTheme = localStorage.getItem('theme')
  if (savedTheme && ['light', 'dark'].includes(savedTheme)) {
    currentTheme.value = savedTheme
  } else {
    // Определяем тему по системным настройкам
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches
    currentTheme.value = prefersDark ? 'dark' : 'light'
  }
  
  document.documentElement.setAttribute('data-theme', currentTheme.value)
}

// Следим за изменениями темы
watch(currentTheme, (newTheme) => {
  document.documentElement.setAttribute('data-theme', newTheme)
  localStorage.setItem('theme', newTheme)
})

// Следим за изменениями аутентификации
watch(isAuthenticated, async (newValue) => {
  if (newValue) {
    // Пользователь авторизовался
    await Promise.all([
      progressStore.fetchUserProgress(),
      progressStore.fetchAchievements()
    ])
    showNotification(`Добро пожаловать, ${user.value?.firstName || 'ученик'}!`, 'success')
  } else {
    // Пользователь разлогинился
    progressStore.clearProgress()
    if (route.meta.requiresAuth) {
      router.push({ name: 'login' })
    }
  }
})

// Функция определения анимации перехода между страницами
const getTransitionName = (route) => {
  if (route.meta.transition) {
    return route.meta.transition
  }
  
  // Анимации по умолчанию в зависимости от типа страницы
  if (route.name === 'lesson' || route.name === 'quiz') {
    return 'slide-left'
  }
  
  if (route.path.includes('/dashboard')) {
    return 'fade'
  }
  
  return 'slide-up'
}

// Проверка обновлений PWA
const checkForUpdates = () => {
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.addEventListener('controllerchange', () => {
      window.location.reload()
    })
  }
}

// Обработчик событий клавиатуры
const handleKeydown = (event) => {
  // Ctrl/Cmd + K для поиска
  if ((event.ctrlKey || event.metaKey) && event.key === 'k') {
    event.preventDefault()
    uiStore.setSearchOpen(true)
  }
  
  // Esc для закрытия модальных окон
  if (event.key === 'Escape') {
    if (showUserProfile.value) showUserProfile.value = false
    if (showSettings.value) showSettings.value = false
    if (showAchievement.value) showAchievement.value = false
  }
  
  // F11 для полноэкранного режима
  if (event.key === 'F11' && (route.name === 'lesson' || route.name === 'quiz')) {
    event.preventDefault()
    uiStore.toggleFullscreen()
  }
}

// Подключаем обработчики событий
onMounted(() => {
  document.addEventListener('keydown', handleKeydown)
})

// Отключаем обработчики при размонтировании
onUnmounted(() => {
  document.removeEventListener('keydown', handleKeydown)
})

// Обработка ошибок Vue
const handleError = (error, instance, info) => {
  console.error('Vue Error:', error)
  console.error('Component:', instance)
  console.error('Info:', info)
  
  showNotification(
    'Произошла неожиданная ошибка. Страница будет перезагружена.',
    'error'
  )
  
  // В production можно отправить ошибку в систему мониторинга
  if (import.meta.env.PROD) {
    // Отправка ошибки в сервис мониторинга (например, Sentry)
    console.log('Отправка ошибки в мониторинг...')
  }
}

// Настройка обработчика ошибок
import { getCurrentInstance } from 'vue'
const instance = getCurrentInstance()
if (instance) {
  instance.appContext.app.config.errorHandler = handleError
}
</script>

<style scoped>
.app-container {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  background-color: var(--bg-primary);
}

.main-content {
  flex: 1;
  transition: all var(--transition-normal);
}

.main-content.fullscreen {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: var(--z-modal);
}

.loading-screen {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: linear-gradient(135deg, var(--bg-primary) 0%, var(--bg-secondary) 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 9999;
}

.loading-content {
  text-align: center;
  animation: fadeIn 0.5s ease-out;
}

/* Анимации переходов между страницами */
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

.slide-left-enter-active,
.slide-left-leave-active {
  transition: all 0.3s ease;
}

.slide-left-enter-from {
  opacity: 0;
  transform: translateX(30px);
}

.slide-left-leave-to {
  opacity: 0;
  transform: translateX(-30px);
}

.slide-up-enter-active,
.slide-up-leave-active {
  transition: all 0.3s ease;
}

.slide-up-enter-from {
  opacity: 0;
  transform: translateY(20px);
}

.slide-up-leave-to {
  opacity: 0;
  transform: translateY(-20px);
}

/* Анимация для экрана загрузки */
@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
</style>