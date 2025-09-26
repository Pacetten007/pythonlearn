import { ref, computed, watch, onMounted } from 'vue'
import { storeToRefs } from 'pinia'
import { useUIStore } from '@/stores/ui'

/**
 * Composable для управления темой приложения
 * Поддержка светлой/темной темы и автоматического определения
 */
export function useTheme() {
  const uiStore = useUIStore()
  const { theme, systemThemePreference } = storeToRefs(uiStore)

  // Доступные темы
  const availableThemes = ref([
    {
      id: 'light',
      name: 'Светлая',
      icon: '☀️',
      colors: {
        primary: '#0969DA',
        background: '#FFFFFF',
        surface: '#F6F8FA',
        text: '#24292F'
      }
    },
    {
      id: 'dark',
      name: 'Темная',
      icon: '🌙',
      colors: {
        primary: '#58A6FF',
        background: '#0D1117',
        surface: '#161B22',
        text: '#F0F6FC'
      }
    },
    {
      id: 'auto',
      name: 'Автоматически',
      icon: '🔄',
      description: 'Следует системным настройкам'
    }
  ])

  // Текущая активная тема (учитывает auto режим)
  const currentTheme = computed(() => {
    if (theme.value === 'auto') {
      return systemThemePreference.value
    }
    return theme.value
  })

  // Информация о текущей теме
  const currentThemeInfo = computed(() => {
    return availableThemes.value.find(t => t.id === currentTheme.value) ||
           availableThemes.value[0]
  })

  // Проверки темы
  const isDarkTheme = computed(() => currentTheme.value === 'dark')
  const isLightTheme = computed(() => currentTheme.value === 'light')
  const isAutoTheme = computed(() => theme.value === 'auto')

  // CSS переменные для текущей темы
  const themeVariables = computed(() => {
    const themeInfo = currentThemeInfo.value
    if (!themeInfo.colors) return {}

    return {
      '--theme-primary': themeInfo.colors.primary,
      '--theme-background': themeInfo.colors.background,
      '--theme-surface': themeInfo.colors.surface,
      '--theme-text': themeInfo.colors.text
    }
  })

  /**
   * Установка темы
   * @param {string} newTheme - ID темы ('light', 'dark', 'auto')
   */
  const setTheme = (newTheme) => {
    if (!availableThemes.value.find(t => t.id === newTheme)) {
      console.warn(`Неизвестная тема: ${newTheme}`)
      return
    }

    uiStore.setTheme(newTheme)
  }

  /**
   * Переключение между светлой и темной темой
   */
  const toggleTheme = () => {
    const newTheme = currentTheme.value === 'dark' ? 'light' : 'dark'
    setTheme(newTheme)
  }

  /**
   * Переключение на следующую доступную тему
   */
  const cycleTheme = () => {
    const currentIndex = availableThemes.value.findIndex(t => t.id === theme.value)
    const nextIndex = (currentIndex + 1) % availableThemes.value.length
    const nextTheme = availableThemes.value[nextIndex]
    setTheme(nextTheme.id)
  }

  /**
   * Применение темы к DOM
   */
  const applyTheme = () => {
    const actualTheme = currentTheme.value
    
    // Устанавливаем data-theme атрибут
    document.documentElement.setAttribute('data-theme', actualTheme)
    
    // Устанавливаем класс для body
    document.body.className = document.body.className
      .replace(/theme-\w+/g, '')
      .trim()
    document.body.classList.add(`theme-${actualTheme}`)
    
    // Обновляем мета-тег theme-color
    updateThemeColor(actualTheme)
    
    // Применяем CSS переменные
    const root = document.documentElement
    Object.entries(themeVariables.value).forEach(([property, value]) => {
      root.style.setProperty(property, value)
    })
  }

  /**
   * Обновление цвета темы в браузере
   * @param {string} themeName - Название темы
   */
  const updateThemeColor = (themeName) => {
    let themeColor = '#0D1117' // темная тема по умолчанию
    
    if (themeName === 'light') {
      themeColor = '#FFFFFF'
    }
    
    // Обновляем мета-тег
    let metaThemeColor = document.querySelector('meta[name="theme-color"]')
    if (!metaThemeColor) {
      metaThemeColor = document.createElement('meta')
      metaThemeColor.name = 'theme-color'
      document.head.appendChild(metaThemeColor)
    }
    metaThemeColor.content = themeColor
    
    // Обновляем мета-теги для PWA
    const metas = [
      { name: 'msapplication-navbutton-color', content: themeColor },
      { name: 'apple-mobile-web-app-status-bar-style', content: themeName === 'dark' ? 'black-translucent' : 'default' }
    ]
    
    metas.forEach(({ name, content }) => {
      let meta = document.querySelector(`meta[name="${name}"]`)
      if (!meta) {
        meta = document.createElement('meta')
        meta.name = name
        document.head.appendChild(meta)
      }
      meta.content = content
    })
  }

  /**
   * Определение системной темы
   */
  const detectSystemTheme = () => {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)')
    const newSystemTheme = mediaQuery.matches ? 'dark' : 'light'
    
    uiStore.systemThemePreference = newSystemTheme
    
    return newSystemTheme
  }

  /**
   * Получение предпочтений пользователя по темам
   */
  const getThemePreferences = () => {
    try {
      const preferences = localStorage.getItem('themePreferences')
      return preferences ? JSON.parse(preferences) : {
        theme: 'auto',
        highContrast: false,
        reduceMotion: false,
        fontSize: 'normal'
      }
    } catch {
      return {
        theme: 'auto',
        highContrast: false,
        reduceMotion: false,
        fontSize: 'normal'
      }
    }
  }

  /**
   * Сохранение предпочтений пользователя
   */
  const saveThemePreferences = (preferences) => {
    try {
      localStorage.setItem('themePreferences', JSON.stringify(preferences))
    } catch (error) {
      console.error('Не удалось сохранить предпочтения темы:', error)
    }
  }

  /**
   * Проверка поддержки темной темы системой
   */
  const supportsSystemTheme = () => {
    return window.matchMedia && window.matchMedia('(prefers-color-scheme)').media !== 'not all'
  }

  /**
   * Получение контрастности темы
   */
  const getThemeContrast = () => {
    if (window.matchMedia) {
      if (window.matchMedia('(prefers-contrast: high)').matches) {
        return 'high'
      } else if (window.matchMedia('(prefers-contrast: low)').matches) {
        return 'low'
      }
    }
    return 'normal'
  }

  /**
   * Проверка предпочтения пользователя по анимации
   */
  const prefersReducedMotion = () => {
    return window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches
  }

  /**
   * Применение настроек доступности
   */
  const applyAccessibilityPreferences = () => {
    const root = document.documentElement
    
    // Уменьшенные анимации
    if (prefersReducedMotion()) {
      root.style.setProperty('--transition-duration', '0.01ms')
      root.classList.add('reduce-motion')
    } else {
      root.style.removeProperty('--transition-duration')
      root.classList.remove('reduce-motion')
    }
    
    // Высокий контраст
    const contrast = getThemeContrast()
    root.setAttribute('data-contrast', contrast)
  }

  /**
   * Генерация CSS для кастомной темы
   */
  const generateCustomThemeCSS = (colors) => {
    const cssVariables = Object.entries(colors)
      .map(([key, value]) => `  --${key}: ${value};`)
      .join('\n')
    
    return `:root[data-theme="custom"] {\n${cssVariables}\n}`
  }

  /**
   * Применение кастомной темы
   */
  const applyCustomTheme = (customColors) => {
    const cssText = generateCustomThemeCSS(customColors)
    
    let styleElement = document.querySelector('#custom-theme-styles')
    if (!styleElement) {
      styleElement = document.createElement('style')
      styleElement.id = 'custom-theme-styles'
      document.head.appendChild(styleElement)
    }
    
    styleElement.textContent = cssText
    setTheme('custom')
  }

  /**
   * Экспорт текущей темы
   */
  const exportTheme = () => {
    const themeData = {
      theme: theme.value,
      systemPreference: systemThemePreference.value,
      currentTheme: currentTheme.value,
      preferences: getThemePreferences(),
      timestamp: new Date().toISOString()
    }
    
    const blob = new Blob([JSON.stringify(themeData, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    
    const link = document.createElement('a')
    link.href = url
    link.download = `theme-${themeData.theme}-${Date.now()}.json`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    
    URL.revokeObjectURL(url)
  }

  /**
   * Импорт темы из файла
   */
  const importTheme = (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader()
      
      reader.onload = (event) => {
        try {
          const themeData = JSON.parse(event.target.result)
          
          if (themeData.theme) {
            setTheme(themeData.theme)
          }
          
          if (themeData.preferences) {
            saveThemePreferences(themeData.preferences)
          }
          
          resolve(themeData)
        } catch (error) {
          reject(new Error('Неверный формат файла темы'))
        }
      }
      
      reader.onerror = () => reject(new Error('Ошибка при чтении файла'))
      reader.readAsText(file)
    })
  }

  // Инициализация при монтировании
  onMounted(() => {
    // Определяем системную тему
    detectSystemTheme()
    
    // Слушаем изменения системной темы
    if (window.matchMedia) {
      const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)')
      mediaQuery.addEventListener('change', (e) => {
        const newSystemTheme = e.matches ? 'dark' : 'light'
        uiStore.systemThemePreference = newSystemTheme
      })
    }
    
    // Применяем тему
    applyTheme()
    applyAccessibilityPreferences()
  })

  // Отслеживаем изменения темы
  watch(currentTheme, () => {
    applyTheme()
  }, { immediate: true })

  return {
    // Реактивные данные
    theme,
    currentTheme,
    systemThemePreference,
    availableThemes,
    currentThemeInfo,
    themeVariables,
    
    // Проверки
    isDarkTheme,
    isLightTheme,
    isAutoTheme,
    
    // Основные методы
    setTheme,
    toggleTheme,
    cycleTheme,
    applyTheme,
    
    // Утилиты
    detectSystemTheme,
    supportsSystemTheme,
    getThemeContrast,
    prefersReducedMotion,
    applyAccessibilityPreferences,
    
    // Кастомные темы
    generateCustomThemeCSS,
    applyCustomTheme,
    
    // Настройки
    getThemePreferences,
    saveThemePreferences,
    
    // Импорт/экспорт
    exportTheme,
    importTheme
  }
}