import { useToast } from 'vue-toastification'
import { storeToRefs } from 'pinia'
import { useUIStore } from '@/stores/ui'

/**
 * Composable для управления уведомлениями
 * Интеграция с vue-toastification и внутренней системой уведомлений
 */
export function useNotifications() {
  const toast = useToast()
  const uiStore = useUIStore()
  
  const { notifications, unreadNotificationsCount } = storeToRefs(uiStore)

  // Типы уведомлений с настройками по умолчанию
  const notificationTypes = {
    success: {
      icon: '✅',
      duration: 4000,
      position: 'top-right',
      hideProgressBar: false
    },
    error: {
      icon: '❌',
      duration: 0, // Не скрываем автоматически
      position: 'top-right',
      hideProgressBar: true
    },
    warning: {
      icon: '⚠️',
      duration: 6000,
      position: 'top-right',
      hideProgressBar: false
    },
    info: {
      icon: 'ℹ️',
      duration: 5000,
      position: 'top-right',
      hideProgressBar: false
    },
    loading: {
      icon: '⏳',
      duration: 0,
      position: 'top-center',
      hideProgressBar: true
    }
  }

  /**
   * Показать уведомление
   * @param {string} message - Текст уведомления
   * @param {string} type - Тип уведомления
   * @param {Object} options - Дополнительные опции
   */
  const showNotification = (message, type = 'info', options = {}) => {
    const config = {
      ...notificationTypes[type],
      ...options
    }

    const toastOptions = {
      timeout: config.duration,
      position: config.position,
      hideProgressBar: config.hideProgressBar,
      closeOnClick: config.closeOnClick !== false,
      pauseOnFocusLoss: config.pauseOnFocusLoss !== false,
      pauseOnHover: config.pauseOnHover !== false,
      draggable: config.draggable !== false,
      icon: config.showIcon !== false ? config.icon : false
    }

    // Добавляем в toast систему
    let toastId
    switch (type) {
      case 'success':
        toastId = toast.success(message, toastOptions)
        break
      case 'error':
        toastId = toast.error(message, toastOptions)
        break
      case 'warning':
        toastId = toast.warning(message, toastOptions)
        break
      case 'info':
        toastId = toast.info(message, toastOptions)
        break
      default:
        toastId = toast(message, toastOptions)
    }

    // Добавляем во внутреннюю систему уведомлений если нужно
    if (options.persistent) {
      const notificationId = uiStore.addNotification({
        type,
        title: options.title || '',
        message,
        duration: config.duration,
        actions: options.actions || [],
        data: options.data || {}
      })
      
      return { toastId, notificationId }
    }

    return { toastId }
  }

  /**
   * Показать уведомление об успехе
   */
  const showSuccess = (message, options = {}) => {
    return showNotification(message, 'success', options)
  }

  /**
   * Показать уведомление об ошибке
   */
  const showError = (message, options = {}) => {
    return showNotification(message, 'error', options)
  }

  /**
   * Показать предупреждение
   */
  const showWarning = (message, options = {}) => {
    return showNotification(message, 'warning', options)
  }

  /**
   * Показать информационное уведомление
   */
  const showInfo = (message, options = {}) => {
    return showNotification(message, 'info', options)
  }

  /**
   * Показать уведомление о загрузке
   */
  const showLoading = (message = 'Загрузка...', options = {}) => {
    return showNotification(message, 'loading', {
      ...options,
      closeOnClick: false,
      draggable: false
    })
  }

  /**
   * Закрыть конкретное уведомление
   */
  const dismissNotification = (toastId) => {
    toast.dismiss(toastId)
  }

  /**
   * Закрыть все уведомления
   */
  const dismissAll = () => {
    toast.clear()
  }

  /**
   * Показать подтверждение действия
   */
  const showConfirmation = async (message, options = {}) => {
    const confirmOptions = {
      title: options.title || 'Подтверждение',
      confirmText: options.confirmText || 'Подтвердить',
      cancelText: options.cancelText || 'Отмена',
      type: options.type || 'warning',
      ...options
    }

    return await uiStore.showConfirmation(confirmOptions)
  }

  /**
   * Показать уведомление с действиями
   */
  const showActionNotification = (message, actions = [], options = {}) => {
    return showNotification(message, options.type || 'info', {
      ...options,
      persistent: true,
      actions: actions.map(action => ({
        label: action.label,
        handler: action.handler,
        style: action.style || 'primary'
      }))
    })
  }

  /**
   * Показать уведомление о достижении
   */
  const showAchievement = (achievement, options = {}) => {
    const achievementOptions = {
      title: achievement.title || 'Новое достижение!',
      icon: achievement.icon || '🏆',
      duration: options.duration || 8000,
      position: 'top-center',
      showIcon: true,
      persistent: true,
      data: { achievement },
      ...options
    }

    return showNotification(
      achievement.description || 'Поздравляем с новым достижением!',
      'success',
      achievementOptions
    )
  }

  /**
   * Показать уведомление о повышении уровня
   */
  const showLevelUp = (newLevel, options = {}) => {
    const levelUpOptions = {
      title: `Уровень ${newLevel}!`,
      icon: '⭐',
      duration: 8000,
      position: 'top-center',
      showIcon: true,
      persistent: true,
      ...options
    }

    return showNotification(
      `Поздравляем! Вы достигли ${newLevel} уровня!`,
      'success',
      levelUpOptions
    )
  }

  /**
   * Показать уведомление о прогрессе
   */
  const showProgress = (message, progress = 0, options = {}) => {
    const progressOptions = {
      duration: 0,
      hideProgressBar: false,
      closeOnClick: false,
      draggable: false,
      progress,
      ...options
    }

    return showNotification(message, 'info', progressOptions)
  }

  /**
   * Обновить прогресс уведомления
   */
  const updateProgress = (toastId, progress, message) => {
    // Vue toastification не поддерживает обновление прогресса
    // Можно реализовать через закрытие старого и создание нового
    dismissNotification(toastId)
    return showProgress(message, progress)
  }

  /**
   * Показать системное уведомление (браузер)
   */
  const showSystemNotification = async (title, options = {}) => {
    if (!('Notification' in window)) {
      console.warn('Браузер не поддерживает системные уведомления')
      return false
    }

    let permission = Notification.permission

    if (permission === 'default') {
      permission = await Notification.requestPermission()
    }

    if (permission === 'granted') {
      const notification = new Notification(title, {
        body: options.body || '',
        icon: options.icon || '/icons/icon-192.png',
        badge: options.badge || '/icons/icon-192.png',
        tag: options.tag || 'pythonlearn',
        requireInteraction: options.requireInteraction || false,
        silent: options.silent || false,
        ...options
      })

      if (options.onClick) {
        notification.onclick = options.onClick
      }

      if (options.onClose) {
        notification.onclose = options.onClose
      }

      // Автоматически закрываем через определенное время
      if (options.duration && options.duration > 0) {
        setTimeout(() => {
          notification.close()
        }, options.duration)
      }

      return notification
    }

    return false
  }

  /**
   * Показать уведомление об ошибке сети
   */
  const showNetworkError = (error, options = {}) => {
    let message = 'Проблемы с подключением к серверу'

    if (error?.code === 'NETWORK_ERROR') {
      message = 'Нет подключения к интернету'
    } else if (error?.status >= 500) {
      message = 'Ошибка сервера. Попробуйте позже'
    } else if (error?.status === 404) {
      message = 'Ресурс не найден'
    } else if (error?.status === 403) {
      message = 'Доступ запрещен'
    } else if (error?.status === 401) {
      message = 'Необходима авторизация'
    }

    return showError(message, {
      title: 'Ошибка сети',
      ...options
    })
  }

  /**
   * Показать уведомление об ошибке валидации
   */
  const showValidationError = (errors, options = {}) => {
    if (typeof errors === 'string') {
      return showError(errors, options)
    }

    if (Array.isArray(errors)) {
      errors.forEach((error, index) => {
        setTimeout(() => {
          showError(error, options)
        }, index * 200) // Задержка между уведомлениями
      })
      return
    }

    if (typeof errors === 'object') {
      Object.entries(errors).forEach(([field, messages], index) => {
        const message = Array.isArray(messages) ? messages[0] : messages
        setTimeout(() => {
          showError(`${field}: ${message}`, options)
        }, index * 200)
      })
    }
  }

  /**
   * Показать уведомление о сохранении
   */
  const showSaveStatus = (success = true, options = {}) => {
    if (success) {
      return showSuccess('Изменения сохранены', {
        duration: 2000,
        ...options
      })
    } else {
      return showError('Ошибка при сохранении', {
        title: 'Не удалось сохранить',
        ...options
      })
    }
  }

  /**
   * Показать копирование в буфер обмена
   */
  const showCopied = (text = 'Скопировано', options = {}) => {
    return showSuccess(text, {
      duration: 1500,
      position: 'bottom-center',
      ...options
    })
  }

  /**
   * Обработка множественных уведомлений
   */
  const handleBulkNotifications = (notifications) => {
    notifications.forEach((notification, index) => {
      setTimeout(() => {
        showNotification(
          notification.message,
          notification.type || 'info',
          notification.options || {}
        )
      }, index * 300)
    })
  }

  /**
   * Получить настройки уведомлений пользователя
   */
  const getNotificationPreferences = () => {
    try {
      const preferences = localStorage.getItem('notificationPreferences')
      return preferences ? JSON.parse(preferences) : {
        enabled: true,
        sound: true,
        desktop: false,
        achievements: true,
        progress: true,
        errors: true,
        position: 'top-right'
      }
    } catch {
      return {
        enabled: true,
        sound: true,
        desktop: false,
        achievements: true,
        progress: true,
        errors: true,
        position: 'top-right'
      }
    }
  }

  /**
   * Сохранить настройки уведомлений
   */
  const saveNotificationPreferences = (preferences) => {
    try {
      localStorage.setItem('notificationPreferences', JSON.stringify(preferences))
    } catch (error) {
      console.error('Не удалось сохранить настройки уведомлений:', error)
    }
  }

  return {
    // Основные методы
    showNotification,
    showSuccess,
    showError,
    showWarning,
    showInfo,
    showLoading,
    
    // Управление уведомлениями
    dismissNotification,
    dismissAll,
    
    // Специальные уведомления
    showConfirmation,
    showActionNotification,
    showAchievement,
    showLevelUp,
    showProgress,
    updateProgress,
    showSystemNotification,
    
    // Обработка ошибок
    showNetworkError,
    showValidationError,
    
    // Утилиты
    showSaveStatus,
    showCopied,
    handleBulkNotifications,
    
    // Настройки
    getNotificationPreferences,
    saveNotificationPreferences,
    
    // Реактивные данные
    notifications,
    unreadNotificationsCount
  }
}