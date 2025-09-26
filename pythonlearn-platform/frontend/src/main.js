import { createApp } from 'vue'
import { createPinia } from 'pinia'
import Toast from 'vue-toastification'

import App from './App.vue'
import router from './router'

// Импорт стилей
import './assets/styles/main.css'
import './assets/styles/components.css'
import 'vue-toastification/dist/index.css'

// Импорт глобальных компонентов
import BaseButton from './components/ui/BaseButton.vue'
import BaseInput from './components/ui/BaseInput.vue'
import BaseCard from './components/ui/BaseCard.vue'
import BaseModal from './components/ui/BaseModal.vue'
import BaseSpinner from './components/ui/BaseSpinner.vue'
import BaseProgressBar from './components/ui/BaseProgressBar.vue'
import BaseBadge from './components/ui/BaseBadge.vue'

// Импорт иконок
import * as LucideIcons from 'lucide-vue-next'

// Создание приложения
const app = createApp(App)

// Настройка Pinia
const pinia = createPinia()

// Плагин для сохранения состояния в localStorage
pinia.use(({ store }) => {
  // Сохраняем состояние определенных stores в localStorage
  const persistStores = ['auth', 'ui', 'progress']
  
  if (persistStores.includes(store.$id)) {
    const stored = localStorage.getItem(`pinia-${store.$id}`)
    if (stored) {
      try {
        const data = JSON.parse(stored)
        store.$patch(data)
      } catch (error) {
        console.warn(`Ошибка восстановления состояния для ${store.$id}:`, error)
      }
    }

    // Подписываемся на изменения и сохраняем в localStorage
    store.$subscribe((mutation, state) => {
      try {
        // Исключаем временные/чувствительные данные
        const { loading, error, ...persistentState } = state
        localStorage.setItem(`pinia-${store.$id}`, JSON.stringify(persistentState))
      } catch (error) {
        console.warn(`Ошибка сохранения состояния для ${store.$id}:`, error)
      }
    })
  }
})

// Настройка Toast уведомлений
const toastOptions = {
  position: 'top-right',
  timeout: 5000,
  closeOnClick: true,
  pauseOnFocusLoss: true,
  pauseOnHover: true,
  draggable: true,
  draggablePercent: 0.6,
  showCloseButtonOnHover: false,
  hideProgressBar: false,
  closeButton: 'button',
  icon: true,
  rtl: false,
  newestOnTop: true,
  maxToasts: 5,
  transition: 'Vue-Toastification__slideBlurred',
  toastDefaults: {
    success: {
      timeout: 3000,
      hideProgressBar: false
    },
    error: {
      timeout: 0, // Не скрываем ошибки автоматически
      hideProgressBar: true
    },
    info: {
      timeout: 4000
    },
    warning: {
      timeout: 6000
    }
  }
}

// Регистрация плагинов
app.use(pinia)
app.use(router)
app.use(Toast, toastOptions)

// Регистрация глобальных компонентов
const globalComponents = {
  BaseButton,
  BaseInput,
  BaseCard,
  BaseModal,
  BaseSpinner,
  BaseProgressBar,
  BaseBadge
}

Object.entries(globalComponents).forEach(([name, component]) => {
  app.component(name, component)
})

// Регистрация иконок Lucide
const iconComponents = [
  'Menu',
  'X',
  'Home',
  'BookOpen',
  'User',
  'Settings',
  'LogOut',
  'Play',
  'Pause',
  'Check',
  'ChevronRight',
  'ChevronLeft',
  'ChevronDown',
  'ChevronUp',
  'Star',
  'Trophy',
  'Zap',
  'Clock',
  'Calendar',
  'Download',
  'Upload',
  'Search',
  'Filter',
  'Eye',
  'EyeOff',
  'Edit',
  'Trash',
  'Plus',
  'Minus',
  'Copy',
  'Code',
  'Terminal',
  'FileText',
  'Folder',
  'Save',
  'RefreshCw',
  'AlertTriangle',
  'Info',
  'CheckCircle',
  'XCircle',
  'Sun',
  'Moon',
  'Volume2',
  'VolumeX',
  'Maximize',
  'Minimize',
  'RotateCcw',
  'HelpCircle',
  'ExternalLink',
  'ArrowRight',
  'ArrowLeft',
  'ArrowUp',
  'ArrowDown'
]

iconComponents.forEach(iconName => {
  if (LucideIcons[iconName]) {
    app.component(`Icon${iconName}`, LucideIcons[iconName])
  }
})

// Глобальные свойства
app.config.globalProperties.$version = __VERSION__
app.config.globalProperties.$buildTime = __BUILD_TIME__

// Обработка ошибок
app.config.errorHandler = (error, instance, info) => {
  console.error('Vue Error:', error)
  console.error('Instance:', instance)
  console.error('Info:', info)
  
  // В production отправляем ошибки в систему мониторинга
  if (import.meta.env.PROD) {
    // Пример интеграции с сервисом мониторинга
    // Sentry.captureException(error)
  }
}

// Предупреждения в development режиме
if (import.meta.env.DEV) {
  app.config.warnHandler = (msg, instance, trace) => {
    console.warn(`Vue Warning: ${msg}`)
    console.warn('Trace:', trace)
  }
}

// Глобальные директивы
app.directive('focus', {
  mounted(el) {
    el.focus()
  }
})

app.directive('click-outside', {
  beforeMount(el, binding) {
    el.clickOutsideEvent = (event) => {
      if (!(el === event.target || el.contains(event.target))) {
        binding.value(event)
      }
    }
    document.addEventListener('click', el.clickOutsideEvent)
  },
  unmounted(el) {
    document.removeEventListener('click', el.clickOutsideEvent)
  }
})

app.directive('tooltip', {
  beforeMount(el, binding) {
    const tooltip = document.createElement('div')
    tooltip.textContent = binding.value
    tooltip.className = 'tooltip'
    tooltip.style.cssText = `
      position: absolute;
      background: var(--bg-tertiary);
      color: var(--text-primary);
      padding: 0.5rem;
      border-radius: var(--radius-md);
      font-size: var(--text-sm);
      border: 1px solid var(--border-primary);
      z-index: var(--z-tooltip);
      pointer-events: none;
      opacity: 0;
      transform: translateY(5px);
      transition: all var(--transition-fast);
    `
    
    el.addEventListener('mouseenter', () => {
      document.body.appendChild(tooltip)
      const rect = el.getBoundingClientRect()
      tooltip.style.left = rect.left + (rect.width / 2) - (tooltip.offsetWidth / 2) + 'px'
      tooltip.style.top = rect.bottom + 10 + 'px'
      tooltip.style.opacity = '1'
      tooltip.style.transform = 'translateY(0)'
    })
    
    el.addEventListener('mouseleave', () => {
      if (tooltip.parentNode) {
        tooltip.style.opacity = '0'
        tooltip.style.transform = 'translateY(5px)'
        setTimeout(() => {
          if (tooltip.parentNode) {
            document.body.removeChild(tooltip)
          }
        }, 150)
      }
    })
    
    el._tooltip = tooltip
  },
  updated(el, binding) {
    if (el._tooltip) {
      el._tooltip.textContent = binding.value
    }
  },
  unmounted(el) {
    if (el._tooltip && el._tooltip.parentNode) {
      document.body.removeChild(el._tooltip)
    }
  }
})

// Глобальные миксины для утилит
app.mixin({
  methods: {
    // Форматирование даты
    formatDate(date, format = 'dd.MM.yyyy') {
      if (!date) return ''
      const d = new Date(date)
      const day = String(d.getDate()).padStart(2, '0')
      const month = String(d.getMonth() + 1).padStart(2, '0')
      const year = d.getFullYear()
      
      return format
        .replace('dd', day)
        .replace('MM', month)
        .replace('yyyy', year)
    },
    
    // Форматирование времени
    formatDuration(seconds) {
      if (!seconds || seconds < 0) return '0 сек'
      
      const hours = Math.floor(seconds / 3600)
      const minutes = Math.floor((seconds % 3600) / 60)
      const secs = seconds % 60
      
      if (hours > 0) {
        return `${hours}ч ${minutes}м`
      } else if (minutes > 0) {
        return `${minutes}м ${secs}с`
      } else {
        return `${secs}с`
      }
    },
    
    // Форматирование чисел
    formatNumber(num) {
      if (num >= 1000000) {
        return (num / 1000000).toFixed(1) + 'М'
      } else if (num >= 1000) {
        return (num / 1000).toFixed(1) + 'К'
      }
      return num.toString()
    },
    
    // Копирование в буфер обмена
    async copyToClipboard(text) {
      try {
        await navigator.clipboard.writeText(text)
        this.$toast.success('Скопировано в буфер обмена')
        return true
      } catch (error) {
        console.error('Ошибка копирования:', error)
        this.$toast.error('Не удалось скопировать')
        return false
      }
    },
    
    // Безопасная навигация
    safeNavigate(to) {
      try {
        this.$router.push(to)
      } catch (error) {
        console.error('Ошибка навигации:', error)
        this.$toast.error('Ошибка перехода на страницу')
      }
    }
  }
})

// Развертывание приложения
app.mount('#app')

// Регистрация Service Worker для PWA
if ('serviceWorker' in navigator && import.meta.env.PROD) {
  navigator.serviceWorker.register('/sw.js')
    .then(registration => {
      console.log('Service Worker зарегистрирован:', registration)
    })
    .catch(error => {
      console.error('Ошибка регистрации Service Worker:', error)
    })
}

// Обработка необработанных ошибок
window.addEventListener('unhandledrejection', event => {
  console.error('Необработанная ошибка Promise:', event.reason)
  
  if (import.meta.env.PROD) {
    // Отправляем в систему мониторинга
    // Sentry.captureException(event.reason)
  }
})

window.addEventListener('error', event => {
  console.error('Глобальная ошибка:', event.error)
  
  if (import.meta.env.PROD) {
    // Отправляем в систему мониторинга
    // Sentry.captureException(event.error)
  }
})

// Экспорт приложения для тестирования
export default app