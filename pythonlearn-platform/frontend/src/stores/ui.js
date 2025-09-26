import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

export const useUIStore = defineStore('ui', () => {
  // Состояние загрузки
  const loading = ref(false)
  const loadingMessage = ref('')
  const loadingProgress = ref(0)

  // Модальные окна
  const modals = ref({
    userProfile: false,
    settings: false,
    achievement: false,
    course: false,
    lesson: false,
    quiz: false,
    confirmation: false,
    fileUpload: false
  })

  // Данные для модальных окон
  const modalData = ref({
    achievement: null,
    course: null,
    lesson: null,
    quiz: null,
    confirmation: null,
    fileUpload: null
  })

  // Сайдбар и навигация
  const sidebarOpen = ref(false)
  const sidebarCollapsed = ref(false)
  const mobileSidebarOpen = ref(false)

  // Поиск
  const searchOpen = ref(false)
  const searchQuery = ref('')
  const searchResults = ref([])
  const searchLoading = ref(false)

  // Тема
  const theme = ref(localStorage.getItem('theme') || 'dark')
  const systemThemePreference = ref('dark')

  // Полноэкранный режим
  const isFullscreen = ref(false)
  const fullscreenElement = ref(null)

  // Уведомления (тосты)
  const notifications = ref([])
  const maxNotifications = ref(5)

  // Размеры экрана
  const screenSize = ref({
    width: window.innerWidth,
    height: window.innerHeight
  })

  // Состояние фокуса окна
  const windowFocused = ref(true)

  // Кастомные настройки пользователя
  const userPreferences = ref({
    animationsEnabled: true,
    soundEnabled: true,
    autoSave: true,
    compactMode: false,
    showHints: true,
    codeTheme: 'dark',
    fontSize: 14,
    tabSize: 4,
    wordWrap: true,
    lineNumbers: true,
    minimap: false
  })

  // Геттеры
  const isMobile = computed(() => screenSize.value.width < 768)
  const isTablet = computed(() => screenSize.value.width >= 768 && screenSize.value.width < 1024)
  const isDesktop = computed(() => screenSize.value.width >= 1024)
  
  const isDarkTheme = computed(() => theme.value === 'dark')
  const isLightTheme = computed(() => theme.value === 'light')
  
  const hasActiveModal = computed(() => {
    return Object.values(modals.value).some(isOpen => isOpen)
  })

  const unreadNotificationsCount = computed(() => {
    return notifications.value.filter(n => !n.read).length
  })

  // Действия для загрузки
  const setLoading = (isLoading, message = '', progress = 0) => {
    loading.value = isLoading
    loadingMessage.value = message
    loadingProgress.value = progress
  }

  const updateLoadingProgress = (progress) => {
    loadingProgress.value = Math.max(0, Math.min(100, progress))
  }

  // Действия для модальных окон
  const openModal = (modalName, data = null) => {
    if (modals.value.hasOwnProperty(modalName)) {
      modals.value[modalName] = true
      if (data) {
        modalData.value[modalName] = data
      }
      
      // Закрываем другие модальные окна (кроме подтверждения)
      if (modalName !== 'confirmation') {
        Object.keys(modals.value).forEach(key => {
          if (key !== modalName && key !== 'confirmation') {
            modals.value[key] = false
          }
        })
      }
    }
  }

  const closeModal = (modalName) => {
    if (modals.value.hasOwnProperty(modalName)) {
      modals.value[modalName] = false
      modalData.value[modalName] = null
    }
  }

  const closeAllModals = () => {
    Object.keys(modals.value).forEach(key => {
      modals.value[key] = false
      modalData.value[key] = null
    })
  }

  // Действия для сайдбара
  const toggleSidebar = () => {
    if (isMobile.value) {
      mobileSidebarOpen.value = !mobileSidebarOpen.value
    } else {
      sidebarOpen.value = !sidebarOpen.value
    }
  }

  const setSidebarOpen = (isOpen) => {
    if (isMobile.value) {
      mobileSidebarOpen.value = isOpen
    } else {
      sidebarOpen.value = isOpen
    }
  }

  const toggleSidebarCollapse = () => {
    sidebarCollapsed.value = !sidebarCollapsed.value
    localStorage.setItem('sidebarCollapsed', sidebarCollapsed.value.toString())
  }

  const setSidebarCollapsed = (collapsed) => {
    sidebarCollapsed.value = collapsed
    localStorage.setItem('sidebarCollapsed', collapsed.toString())
  }

  // Действия для поиска
  const setSearchOpen = (isOpen) => {
    searchOpen.value = isOpen
    if (!isOpen) {
      searchQuery.value = ''
      searchResults.value = []
    }
  }

  const setSearchQuery = (query) => {
    searchQuery.value = query
  }

  const setSearchResults = (results) => {
    searchResults.value = results
  }

  const setSearchLoading = (isLoading) => {
    searchLoading.value = isLoading
  }

  // Действия для темы
  const setTheme = (newTheme) => {
    if (['light', 'dark', 'auto'].includes(newTheme)) {
      theme.value = newTheme
      localStorage.setItem('theme', newTheme)
      
      // Применяем тему
      applyTheme()
    }
  }

  const toggleTheme = () => {
    const newTheme = theme.value === 'dark' ? 'light' : 'dark'
    setTheme(newTheme)
  }

  const applyTheme = () => {
    let actualTheme = theme.value
    
    if (theme.value === 'auto') {
      actualTheme = systemThemePreference.value
    }
    
    document.documentElement.setAttribute('data-theme', actualTheme)
    
    // Обновляем meta theme-color
    const metaThemeColor = document.querySelector('meta[name="theme-color"]')
    if (metaThemeColor) {
      metaThemeColor.content = actualTheme === 'dark' ? '#0D1117' : '#FFFFFF'
    }
  }

  const detectSystemTheme = () => {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)')
    systemThemePreference.value = mediaQuery.matches ? 'dark' : 'light'
    
    if (theme.value === 'auto') {
      applyTheme()
    }
    
    // Слушаем изменения системной темы
    mediaQuery.addEventListener('change', (e) => {
      systemThemePreference.value = e.matches ? 'dark' : 'light'
      if (theme.value === 'auto') {
        applyTheme()
      }
    })
  }

  // Действия для полноэкранного режима
  const setFullscreen = (enabled) => {
    isFullscreen.value = enabled
    
    if (enabled) {
      document.body.classList.add('fullscreen')
    } else {
      document.body.classList.remove('fullscreen')
    }
  }

  const toggleFullscreen = () => {
    setFullscreen(!isFullscreen.value)
  }

  const enterFullscreen = (element = document.documentElement) => {
    if (element.requestFullscreen) {
      element.requestFullscreen()
    } else if (element.mozRequestFullScreen) {
      element.mozRequestFullScreen()
    } else if (element.webkitRequestFullscreen) {
      element.webkitRequestFullscreen()
    } else if (element.msRequestFullscreen) {
      element.msRequestFullscreen()
    }
    
    fullscreenElement.value = element
  }

  const exitFullscreen = () => {
    if (document.exitFullscreen) {
      document.exitFullscreen()
    } else if (document.mozCancelFullScreen) {
      document.mozCancelFullScreen()
    } else if (document.webkitExitFullscreen) {
      document.webkitExitFullscreen()
    } else if (document.msExitFullscreen) {
      document.msExitFullscreen()
    }
    
    fullscreenElement.value = null
  }

  // Действия для уведомлений
  const addNotification = (notification) => {
    const id = Date.now().toString()
    const newNotification = {
      id,
      type: 'info',
      title: '',
      message: '',
      duration: 5000,
      actions: [],
      read: false,
      createdAt: new Date(),
      ...notification
    }

    notifications.value.unshift(newNotification)

    // Ограничиваем количество уведомлений
    if (notifications.value.length > maxNotifications.value) {
      notifications.value = notifications.value.slice(0, maxNotifications.value)
    }

    // Автоматически скрываем уведомление
    if (newNotification.duration > 0) {
      setTimeout(() => {
        removeNotification(id)
      }, newNotification.duration)
    }

    return id
  }

  const removeNotification = (id) => {
    const index = notifications.value.findIndex(n => n.id === id)
    if (index > -1) {
      notifications.value.splice(index, 1)
    }
  }

  const markNotificationAsRead = (id) => {
    const notification = notifications.value.find(n => n.id === id)
    if (notification) {
      notification.read = true
    }
  }

  const clearAllNotifications = () => {
    notifications.value = []
  }

  // Действия для размеров экрана
  const updateScreenSize = () => {
    screenSize.value = {
      width: window.innerWidth,
      height: window.innerHeight
    }
    
    // Автоматически закрываем мобильный сайдбар при увеличении экрана
    if (!isMobile.value) {
      mobileSidebarOpen.value = false
    }
  }

  // Действия для фокуса окна
  const setWindowFocused = (focused) => {
    windowFocused.value = focused
  }

  // Действия для пользовательских настроек
  const updateUserPreference = (key, value) => {
    if (userPreferences.value.hasOwnProperty(key)) {
      userPreferences.value[key] = value
      localStorage.setItem('userPreferences', JSON.stringify(userPreferences.value))
    }
  }

  const resetUserPreferences = () => {
    userPreferences.value = {
      animationsEnabled: true,
      soundEnabled: true,
      autoSave: true,
      compactMode: false,
      showHints: true,
      codeTheme: 'dark',
      fontSize: 14,
      tabSize: 4,
      wordWrap: true,
      lineNumbers: true,
      minimap: false
    }
    localStorage.setItem('userPreferences', JSON.stringify(userPreferences.value))
  }

  const loadUserPreferences = () => {
    const saved = localStorage.getItem('userPreferences')
    if (saved) {
      try {
        const parsed = JSON.parse(saved)
        userPreferences.value = { ...userPreferences.value, ...parsed }
      } catch (error) {
        console.error('Ошибка загрузки пользовательских настроек:', error)
      }
    }
  }

  // Утилитарные действия
  const showConfirmation = (options) => {
    return new Promise((resolve) => {
      modalData.value.confirmation = {
        title: 'Подтверждение',
        message: 'Вы уверены?',
        confirmText: 'Подтвердить',
        cancelText: 'Отмена',
        type: 'warning',
        ...options,
        resolve
      }
      modals.value.confirmation = true
    })
  }

  const hideConfirmation = (result = false) => {
    if (modalData.value.confirmation?.resolve) {
      modalData.value.confirmation.resolve(result)
    }
    closeModal('confirmation')
  }

  // Инициализация
  const initialize = () => {
    // Загружаем пользовательские настройки
    loadUserPreferences()
    
    // Определяем системную тему
    detectSystemTheme()
    
    // Применяем сохраненную тему
    applyTheme()
    
    // Восстанавливаем состояние сайдбара
    const savedSidebarCollapsed = localStorage.getItem('sidebarCollapsed')
    if (savedSidebarCollapsed !== null) {
      sidebarCollapsed.value = savedSidebarCollapsed === 'true'
    }
    
    // Добавляем обработчики событий
    window.addEventListener('resize', updateScreenSize)
    window.addEventListener('focus', () => setWindowFocused(true))
    window.addEventListener('blur', () => setWindowFocused(false))
    
    // Обработчик полноэкранного режима
    document.addEventListener('fullscreenchange', () => {
      const isInFullscreen = !!document.fullscreenElement
      if (!isInFullscreen) {
        fullscreenElement.value = null
      }
    })
    
    // Обработчик Escape для закрытия модальных окон
    document.addEventListener('keydown', (event) => {
      if (event.key === 'Escape') {
        if (hasActiveModal.value) {
          closeAllModals()
        } else if (searchOpen.value) {
          setSearchOpen(false)
        }
      }
    })
  }

  // Очистка обработчиков
  const cleanup = () => {
    window.removeEventListener('resize', updateScreenSize)
    window.removeEventListener('focus', () => setWindowFocused(true))
    window.removeEventListener('blur', () => setWindowFocused(false))
  }

  return {
    // Состояние
    loading,
    loadingMessage,
    loadingProgress,
    modals,
    modalData,
    sidebarOpen,
    sidebarCollapsed,
    mobileSidebarOpen,
    searchOpen,
    searchQuery,
    searchResults,
    searchLoading,
    theme,
    systemThemePreference,
    isFullscreen,
    fullscreenElement,
    notifications,
    maxNotifications,
    screenSize,
    windowFocused,
    userPreferences,

    // Геттеры
    isMobile,
    isTablet,
    isDesktop,
    isDarkTheme,
    isLightTheme,
    hasActiveModal,
    unreadNotificationsCount,

    // Действия
    setLoading,
    updateLoadingProgress,
    openModal,
    closeModal,
    closeAllModals,
    toggleSidebar,
    setSidebarOpen,
    toggleSidebarCollapse,
    setSidebarCollapsed,
    setSearchOpen,
    setSearchQuery,
    setSearchResults,
    setSearchLoading,
    setTheme,
    toggleTheme,
    applyTheme,
    detectSystemTheme,
    setFullscreen,
    toggleFullscreen,
    enterFullscreen,
    exitFullscreen,
    addNotification,
    removeNotification,
    markNotificationAsRead,
    clearAllNotifications,
    updateScreenSize,
    setWindowFocused,
    updateUserPreference,
    resetUserPreferences,
    loadUserPreferences,
    showConfirmation,
    hideConfirmation,
    initialize,
    cleanup
  }
})