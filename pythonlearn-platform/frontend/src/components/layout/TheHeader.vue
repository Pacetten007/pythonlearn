<template>
  <header class="app-header">
    <div class="app-header-container">
      <!-- Logo and Brand -->
      <div class="app-header-brand">
        <RouterLink to="/" class="brand-link">
          <img src="/logo.svg" alt="PythonLearn" class="brand-logo" />
          <span class="brand-text">PythonLearn</span>
        </RouterLink>
      </div>

      <!-- Navigation (Desktop) -->
      <nav class="app-nav" v-if="!isMobile">
        <RouterLink 
          v-for="item in navigation" 
          :key="item.name"
          :to="item.to" 
          class="nav-link"
          :class="{ 'nav-link--active': $route.name === item.name }"
        >
          <component :is="item.icon" :size="18" />
          {{ item.label }}
        </RouterLink>
      </nav>

      <!-- User Section -->
      <div class="app-header-user">
        <!-- Search -->
        <button 
          class="header-btn header-btn--search"
          @click="openSearch"
          v-tooltip="'Поиск (Ctrl+K)'"
        >
          <IconSearch :size="20" />
        </button>

        <!-- Theme Toggle -->
        <button 
          class="header-btn"
          @click="toggleTheme"
          :aria-label="currentTheme === 'dark' ? 'Переключить на светлую тему' : 'Переключить на темную тему'"
        >
          <IconSun v-if="currentTheme === 'dark'" :size="20" />
          <IconMoon v-else :size="20" />
        </button>

        <!-- Notifications -->
        <div class="header-notifications" v-if="isAuthenticated">
          <button 
            class="header-btn header-btn--notifications"
            @click="toggleNotifications"
            :class="{ 'has-unread': unreadNotifications > 0 }"
          >
            <IconBell :size="20" />
            <span v-if="unreadNotifications > 0" class="notification-badge">
              {{ unreadNotifications > 99 ? '99+' : unreadNotifications }}
            </span>
          </button>

          <!-- Notifications Dropdown -->
          <div v-if="showNotifications" class="notifications-dropdown" v-click-outside="closeNotifications">
            <div class="notifications-header">
              <h3>Уведомления</h3>
              <button @click="markAllAsRead" class="mark-all-read">
                Отметить все как прочитанные
              </button>
            </div>
            <div class="notifications-list">
              <div 
                v-for="notification in notifications" 
                :key="notification.id"
                class="notification-item"
                :class="{ 'unread': !notification.read }"
              >
                <div class="notification-icon">
                  <component :is="getNotificationIcon(notification.type)" :size="16" />
                </div>
                <div class="notification-content">
                  <p>{{ notification.message }}</p>
                  <span class="notification-time">{{ formatTime(notification.createdAt) }}</span>
                </div>
              </div>
              <div v-if="notifications.length === 0" class="no-notifications">
                Нет новых уведомлений
              </div>
            </div>
          </div>
        </div>

        <!-- User Menu -->
        <div class="header-user-menu" v-if="isAuthenticated">
          <button 
            class="user-avatar-btn"
            @click="toggleUserMenu"
            :aria-label="'Меню пользователя: ' + user?.firstName"
          >
            <img 
              v-if="user?.avatarUrl" 
              :src="user.avatarUrl" 
              :alt="user.firstName"
              class="user-avatar"
            />
            <div v-else class="user-avatar user-avatar--placeholder">
              {{ getUserInitials }}
            </div>
            <IconChevronDown :size="16" class="user-menu-arrow" />
          </button>

          <!-- User Dropdown -->
          <div v-if="showUserMenu" class="user-dropdown" v-click-outside="closeUserMenu">
            <div class="user-dropdown-header">
              <div class="user-info">
                <p class="user-name">{{ user?.firstName }} {{ user?.lastName }}</p>
                <p class="user-email">{{ user?.email }}</p>
                <BaseBadge :text="`Уровень ${userProgress?.currentLevel || 1}`" variant="primary" size="sm" />
              </div>
            </div>

            <div class="user-dropdown-menu">
              <RouterLink to="/profile" class="dropdown-item" @click="closeUserMenu">
                <IconUser :size="16" />
                Профиль
              </RouterLink>
              <RouterLink to="/progress" class="dropdown-item" @click="closeUserMenu">
                <IconTrophy :size="16" />
                Прогресс
              </RouterLink>
              <RouterLink to="/achievements" class="dropdown-item" @click="closeUserMenu">
                <IconStar :size="16" />
                Достижения
              </RouterLink>
              <button class="dropdown-item" @click="openSettings">
                <IconSettings :size="16" />
                Настройки
              </button>
              <div class="dropdown-divider"></div>
              <button class="dropdown-item dropdown-item--danger" @click="logout">
                <IconLogOut :size="16" />
                Выйти
              </button>
            </div>
          </div>
        </div>

        <!-- Auth Buttons (Guest) -->
        <div class="auth-buttons" v-else>
          <RouterLink to="/login">
            <BaseButton variant="ghost" size="sm">Войти</BaseButton>
          </RouterLink>
          <RouterLink to="/register">
            <BaseButton variant="primary" size="sm">Регистрация</BaseButton>
          </RouterLink>
        </div>

        <!-- Mobile Menu Toggle -->
        <button 
          class="mobile-menu-btn"
          @click="toggleMobileMenu"
          v-if="isMobile"
          :aria-label="showMobileMenu ? 'Закрыть меню' : 'Открыть меню'"
        >
          <IconMenu v-if="!showMobileMenu" :size="24" />
          <IconX v-else :size="24" />
        </button>
      </div>
    </div>

    <!-- Mobile Menu -->
    <div v-if="isMobile && showMobileMenu" class="mobile-menu">
      <nav class="mobile-nav">
        <RouterLink 
          v-for="item in navigation" 
          :key="item.name"
          :to="item.to" 
          class="mobile-nav-link"
          @click="closeMobileMenu"
        >
          <component :is="item.icon" :size="20" />
          {{ item.label }}
        </RouterLink>
      </nav>

      <!-- Mobile User Section -->
      <div class="mobile-user-section" v-if="isAuthenticated">
        <div class="mobile-user-info">
          <div class="mobile-user-avatar">
            <img 
              v-if="user?.avatarUrl" 
              :src="user.avatarUrl" 
              :alt="user.firstName"
            />
            <div v-else class="user-avatar--placeholder">
              {{ getUserInitials }}
            </div>
          </div>
          <div>
            <p class="mobile-user-name">{{ user?.firstName }} {{ user?.lastName }}</p>
            <p class="mobile-user-email">{{ user?.email }}</p>
          </div>
        </div>

        <div class="mobile-user-menu">
          <RouterLink to="/profile" class="mobile-menu-item" @click="closeMobileMenu">
            <IconUser :size="18" />
            Профиль
          </RouterLink>
          <RouterLink to="/progress" class="mobile-menu-item" @click="closeMobileMenu">
            <IconTrophy :size="18" />
            Прогресс
          </RouterLink>
          <RouterLink to="/achievements" class="mobile-menu-item" @click="closeMobileMenu">
            <IconStar :size="18" />
            Достижения
          </RouterLink>
          <button class="mobile-menu-item" @click="openSettings">
            <IconSettings :size="18" />
            Настройки
          </button>
          <button class="mobile-menu-item mobile-menu-item--danger" @click="logout">
            <IconLogOut :size="18" />
            Выйти
          </button>
        </div>
      </div>
    </div>
  </header>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { storeToRefs } from 'pinia'

// Stores
import { useAuthStore } from '@/stores/auth'
import { useUIStore } from '@/stores/ui'
import { useProgressStore } from '@/stores/progress'

// Composables
import { useTheme } from '@/composables/useTheme'
import { useNotifications } from '@/composables/useNotifications'

const route = useRoute()
const router = useRouter()

// Stores
const authStore = useAuthStore()
const uiStore = useUIStore()
const progressStore = useProgressStore()

const { isAuthenticated, user } = storeToRefs(authStore)
const { userProgress } = storeToRefs(progressStore)

// Theme
const { currentTheme, toggleTheme } = useTheme()

// Local state
const showUserMenu = ref(false)
const showNotifications = ref(false)
const showMobileMenu = ref(false)
const isMobile = ref(false)

// Navigation items
const navigation = computed(() => [
  { name: 'home', to: '/', label: 'Главная', icon: 'IconHome' },
  { name: 'courses', to: '/courses', label: 'Курсы', icon: 'IconBookOpen' },
  { name: 'leaderboard', to: '/leaderboard', label: 'Рейтинг', icon: 'IconTrophy' },
  { name: 'help', to: '/help', label: 'Помощь', icon: 'IconHelpCircle' }
])

// Mock notifications (в реальном приложении из API)
const notifications = ref([
  {
    id: 1,
    type: 'achievement',
    message: 'Поздравляем! Вы получили достижение "Первые шаги"',
    read: false,
    createdAt: new Date()
  },
  {
    id: 2,
    type: 'lesson',
    message: 'Новый урок "Циклы в Python" доступен для изучения',
    read: true,
    createdAt: new Date(Date.now() - 3600000)
  }
])

const unreadNotifications = computed(() => 
  notifications.value.filter(n => !n.read).length
)

const getUserInitials = computed(() => {
  if (!user.value) return 'U'
  const first = user.value.firstName?.[0] || ''
  const last = user.value.lastName?.[0] || ''
  return (first + last).toUpperCase() || 'U'
})

// Methods
const toggleUserMenu = () => {
  showUserMenu.value = !showUserMenu.value
  showNotifications.value = false
}

const closeUserMenu = () => {
  showUserMenu.value = false
}

const toggleNotifications = () => {
  showNotifications.value = !showNotifications.value
  showUserMenu.value = false
}

const closeNotifications = () => {
  showNotifications.value = false
}

const toggleMobileMenu = () => {
  showMobileMenu.value = !showMobileMenu.value
}

const closeMobileMenu = () => {
  showMobileMenu.value = false
}

const openSearch = () => {
  uiStore.setSearchOpen(true)
}

const openSettings = () => {
  uiStore.setShowSettings(true)
  closeUserMenu()
  closeMobileMenu()
}

const logout = async () => {
  try {
    await authStore.logout()
    router.push('/')
    closeUserMenu()
    closeMobileMenu()
  } catch (error) {
    console.error('Ошибка выхода:', error)
  }
}

const markAllAsRead = () => {
  notifications.value.forEach(n => n.read = true)
}

const getNotificationIcon = (type) => {
  const icons = {
    achievement: 'IconStar',
    lesson: 'IconBookOpen',
    system: 'IconBell',
    warning: 'IconAlertTriangle'
  }
  return icons[type] || 'IconBell'
}

const formatTime = (date) => {
  const now = new Date()
  const diff = now - date
  const minutes = Math.floor(diff / 60000)
  
  if (minutes < 1) return 'Только что'
  if (minutes < 60) return `${minutes} мин назад`
  
  const hours = Math.floor(minutes / 60)
  if (hours < 24) return `${hours} ч назад`
  
  const days = Math.floor(hours / 24)
  return `${days} дн назад`
}

// Handle resize
const handleResize = () => {
  isMobile.value = window.innerWidth < 768
  if (!isMobile.value) {
    showMobileMenu.value = false
  }
}

// Lifecycle
onMounted(() => {
  handleResize()
  window.addEventListener('resize', handleResize)
})

onUnmounted(() => {
  window.removeEventListener('resize', handleResize)
})
</script>

<style scoped>
.app-header {
  background-color: var(--bg-secondary);
  border-bottom: 1px solid var(--border-primary);
  position: sticky;
  top: 0;
  z-index: 40;
  backdrop-filter: blur(8px);
}

.app-header-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 1rem;
  height: 64px;
  display: flex;
  align-items: center;
  justify-content: space-between;
}

/* Brand */
.app-header-brand {
  flex-shrink: 0;
}

.brand-link {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  text-decoration: none;
  color: var(--text-primary);
  font-weight: 600;
  font-size: 1.25rem;
}

.brand-logo {
  width: 32px;
  height: 32px;
}

/* Navigation */
.app-nav {
  display: flex;
  align-items: center;
  gap: 2rem;
  margin-left: 3rem;
}

.nav-link {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 1rem;
  border-radius: var(--radius-md);
  text-decoration: none;
  color: var(--text-secondary);
  font-weight: 500;
  transition: all var(--transition-fast);
}

.nav-link:hover {
  color: var(--text-primary);
  background-color: var(--bg-hover);
}

.nav-link--active {
  color: var(--accent-primary);
  background-color: rgba(var(--accent-primary-rgb), 0.1);
}

/* Header User Section */
.app-header-user {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.header-btn {
  padding: 0.5rem;
  border-radius: var(--radius-md);
  border: none;
  background: transparent;
  color: var(--text-secondary);
  cursor: pointer;
  transition: all var(--transition-fast);
}

.header-btn:hover {
  color: var(--text-primary);
  background-color: var(--bg-hover);
}

/* Notifications */
.header-notifications {
  position: relative;
}

.header-btn--notifications.has-unread {
  color: var(--accent-primary);
}

.notification-badge {
  position: absolute;
  top: 0;
  right: 0;
  background-color: var(--accent-error);
  color: white;
  font-size: 0.625rem;
  font-weight: 600;
  padding: 0.125rem 0.25rem;
  border-radius: var(--radius-full);
  min-width: 1rem;
  text-align: center;
}

.notifications-dropdown {
  position: absolute;
  top: calc(100% + 0.5rem);
  right: 0;
  width: 320px;
  background-color: var(--bg-secondary);
  border: 1px solid var(--border-primary);
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow-lg);
  z-index: 50;
}

.notifications-header {
  padding: 1rem;
  border-bottom: 1px solid var(--border-primary);
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.notifications-header h3 {
  margin: 0;
  font-size: 1rem;
  font-weight: 600;
}

.mark-all-read {
  font-size: 0.875rem;
  color: var(--accent-primary);
  background: none;
  border: none;
  cursor: pointer;
}

.notifications-list {
  max-height: 300px;
  overflow-y: auto;
}

.notification-item {
  padding: 1rem;
  border-bottom: 1px solid var(--border-primary);
  display: flex;
  gap: 0.75rem;
}

.notification-item:last-child {
  border-bottom: none;
}

.notification-item.unread {
  background-color: rgba(var(--accent-primary-rgb), 0.05);
}

.notification-icon {
  flex-shrink: 0;
  color: var(--accent-primary);
}

.notification-content p {
  margin: 0 0 0.25rem 0;
  font-size: 0.875rem;
}

.notification-time {
  font-size: 0.75rem;
  color: var(--text-muted);
}

.no-notifications {
  padding: 2rem;
  text-align: center;
  color: var(--text-muted);
}

/* User Menu */
.header-user-menu {
  position: relative;
}

.user-avatar-btn {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.25rem;
  border-radius: var(--radius-md);
  border: none;
  background: transparent;
  cursor: pointer;
  transition: all var(--transition-fast);
}

.user-avatar-btn:hover {
  background-color: var(--bg-hover);
}

.user-avatar {
  width: 32px;
  height: 32px;
  border-radius: var(--radius-full);
  object-fit: cover;
}

.user-avatar--placeholder {
  background-color: var(--accent-primary);
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 600;
  font-size: 0.875rem;
}

.user-menu-arrow {
  color: var(--text-muted);
  transition: transform var(--transition-fast);
}

.user-avatar-btn:hover .user-menu-arrow {
  transform: rotate(180deg);
}

.user-dropdown {
  position: absolute;
  top: calc(100% + 0.5rem);
  right: 0;
  min-width: 240px;
  background-color: var(--bg-secondary);
  border: 1px solid var(--border-primary);
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow-lg);
  z-index: 50;
}

.user-dropdown-header {
  padding: 1rem;
  border-bottom: 1px solid var(--border-primary);
}

.user-name {
  margin: 0 0 0.25rem 0;
  font-weight: 600;
}

.user-email {
  margin: 0 0 0.5rem 0;
  font-size: 0.875rem;
  color: var(--text-secondary);
}

.dropdown-item {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  width: 100%;
  padding: 0.75rem 1rem;
  text-decoration: none;
  color: var(--text-primary);
  border: none;
  background: none;
  cursor: pointer;
  transition: background-color var(--transition-fast);
}

.dropdown-item:hover {
  background-color: var(--bg-hover);
}

.dropdown-item--danger {
  color: var(--accent-error);
}

.dropdown-divider {
  height: 1px;
  background-color: var(--border-primary);
  margin: 0.5rem 0;
}

/* Auth Buttons */
.auth-buttons {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

/* Mobile */
.mobile-menu-btn {
  display: none;
  padding: 0.5rem;
  border: none;
  background: transparent;
  color: var(--text-primary);
  cursor: pointer;
}

.mobile-menu {
  position: absolute;
  top: 100%;
  left: 0;
  right: 0;
  background-color: var(--bg-secondary);
  border-bottom: 1px solid var(--border-primary);
  box-shadow: var(--shadow-lg);
}

.mobile-nav {
  padding: 1rem;
  border-bottom: 1px solid var(--border-primary);
}

.mobile-nav-link {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.75rem;
  text-decoration: none;
  color: var(--text-primary);
  border-radius: var(--radius-md);
  margin-bottom: 0.5rem;
}

.mobile-nav-link:hover {
  background-color: var(--bg-hover);
}

.mobile-user-section {
  padding: 1rem;
}

.mobile-user-info {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  margin-bottom: 1rem;
}

.mobile-user-avatar {
  width: 40px;
  height: 40px;
}

.mobile-user-name {
  margin: 0;
  font-weight: 600;
}

.mobile-user-email {
  margin: 0;
  font-size: 0.875rem;
  color: var(--text-secondary);
}

.mobile-menu-item {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  width: 100%;
  padding: 0.75rem;
  text-decoration: none;
  color: var(--text-primary);
  border: none;
  background: none;
  cursor: pointer;
  border-radius: var(--radius-md);
  margin-bottom: 0.25rem;
}

.mobile-menu-item:hover {
  background-color: var(--bg-hover);
}

.mobile-menu-item--danger {
  color: var(--accent-error);
}

@media (max-width: 768px) {
  .app-nav {
    display: none;
  }
  
  .mobile-menu-btn {
    display: block;
  }
  
  .auth-buttons {
    display: none;
  }
}
</style>