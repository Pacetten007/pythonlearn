import { useAuthStore } from '@/stores/auth'
import { useNotifications } from '@/composables/useNotifications'

// Guard для проверки аутентификации
export const authGuard = async (to, from, next) => {
  const authStore = useAuthStore()
  const { showNotification } = useNotifications()
  
  try {
    // Проверяем инициализацию store
    if (!authStore.initialized) {
      await authStore.initialize()
    }
    
    // Проверяем аутентификацию
    if (!authStore.isAuthenticated) {
      showNotification('Для доступа к этой странице необходимо войти в систему', 'warning')
      
      // Сохраняем путь для редиректа после авторизации
      const redirectPath = to.fullPath
      next({
        name: 'login',
        query: { redirect: redirectPath }
      })
      return
    }
    
    // Проверяем активность пользователя
    if (!authStore.user.isActive) {
      showNotification('Ваш аккаунт заблокирован. Обратитесь к администратору', 'error')
      await authStore.logout()
      next({ name: 'login' })
      return
    }
    
    // Проверяем верификацию email если требуется
    if (to.meta.requiresEmailVerification && !authStore.user.isVerified) {
      showNotification('Подтвердите email для доступа к этой функции', 'warning')
      next({ name: 'profile' })
      return
    }
    
    next()
    
  } catch (error) {
    console.error('Ошибка в authGuard:', error)
    showNotification('Ошибка при проверке доступа', 'error')
    next({ name: 'login' })
  }
}

// Guard для гостей (неавторизованных пользователей)
export const guestGuard = async (to, from, next) => {
  const authStore = useAuthStore()
  
  try {
    // Проверяем инициализацию store
    if (!authStore.initialized) {
      await authStore.initialize()
    }
    
    // Если пользователь уже авторизован, перенаправляем на дашборд
    if (authStore.isAuthenticated) {
      const redirectTo = to.query.redirect || '/dashboard'
      next(redirectTo)
      return
    }
    
    next()
    
  } catch (error) {
    console.error('Ошибка в guestGuard:', error)
    next()
  }
}

// Guard для администраторов
export const adminGuard = async (to, from, next) => {
  const authStore = useAuthStore()
  const { showNotification } = useNotifications()
  
  try {
    // Сначала проверяем аутентификацию
    if (!authStore.initialized) {
      await authStore.initialize()
    }
    
    if (!authStore.isAuthenticated) {
      showNotification('Необходима авторизация', 'warning')
      next({
        name: 'login',
        query: { redirect: to.fullPath }
      })
      return
    }
    
    // Проверяем права администратора
    if (!authStore.isAdmin) {
      showNotification('Доступ запрещен. Недостаточно прав', 'error')
      next({ name: 'dashboard' })
      return
    }
    
    // Проверяем активность пользователя
    if (!authStore.user.isActive) {
      showNotification('Аккаунт заблокирован', 'error')
      await authStore.logout()
      next({ name: 'login' })
      return
    }
    
    next()
    
  } catch (error) {
    console.error('Ошибка в adminGuard:', error)
    showNotification('Ошибка при проверке прав доступа', 'error')
    next({ name: 'dashboard' })
  }
}

// Guard для учителей
export const teacherGuard = async (to, from, next) => {
  const authStore = useAuthStore()
  const { showNotification } = useNotifications()
  
  try {
    // Проверяем аутентификацию
    if (!authStore.initialized) {
      await authStore.initialize()
    }
    
    if (!authStore.isAuthenticated) {
      showNotification('Необходима авторизация', 'warning')
      next({
        name: 'login',
        query: { redirect: to.fullPath }
      })
      return
    }
    
    // Проверяем права учителя или администратора
    if (!authStore.isTeacher && !authStore.isAdmin) {
      showNotification('Доступ только для учителей', 'error')
      next({ name: 'dashboard' })
      return
    }
    
    next()
    
  } catch (error) {
    console.error('Ошибка в teacherGuard:', error)
    showNotification('Ошибка при проверке прав доступа', 'error')
    next({ name: 'dashboard' })
  }
}

// Guard для премиум функций
export const premiumGuard = async (to, from, next) => {
  const authStore = useAuthStore()
  const { showNotification } = useNotifications()
  
  try {
    // Проверяем аутентификацию
    if (!authStore.initialized) {
      await authStore.initialize()
    }
    
    if (!authStore.isAuthenticated) {
      showNotification('Необходима авторизация', 'warning')
      next({
        name: 'login',
        query: { redirect: to.fullPath }
      })
      return
    }
    
    // Проверяем премиум статус
    if (!authStore.isPremium) {
      showNotification('Эта функция доступна только с Premium подпиской', 'warning')
      next({ name: 'dashboard' })
      return
    }
    
    next()
    
  } catch (error) {
    console.error('Ошибка в premiumGuard:', error)
    next()
  }
}

// Guard для проверки возраста/класса
export const gradeGuard = (minGrade = 8, maxGrade = 11) => {
  return async (to, from, next) => {
    const authStore = useAuthStore()
    const { showNotification } = useNotifications()
    
    try {
      if (!authStore.initialized) {
        await authStore.initialize()
      }
      
      if (!authStore.isAuthenticated) {
        next({
          name: 'login',
          query: { redirect: to.fullPath }
        })
        return
      }
      
      const userGrade = authStore.user.grade
      
      // Если класс не указан, пропускаем
      if (!userGrade) {
        showNotification('Укажите ваш класс в профиле для доступа к контенту', 'warning')
        next({ name: 'profile' })
        return
      }
      
      // Проверяем соответствие класса
      if (userGrade < minGrade || userGrade > maxGrade) {
        showNotification(`Этот контент предназначен для ${minGrade}-${maxGrade} классов`, 'warning')
        next({ name: 'dashboard' })
        return
      }
      
      next()
      
    } catch (error) {
      console.error('Ошибка в gradeGuard:', error)
      next()
    }
  }
}

// Guard для проверки завершения предыдущих уроков
export const lessonProgressGuard = async (to, from, next) => {
  const authStore = useAuthStore()
  const { showNotification } = useNotifications()
  
  try {
    if (!authStore.isAuthenticated) {
      next({ name: 'login' })
      return
    }
    
    // Получаем информацию о требуемых предварительных уроках
    const { courseSlug, lessonSlug } = to.params
    
    if (!courseSlug || !lessonSlug) {
      next()
      return
    }
    
    // Здесь можно добавить логику проверки прогресса
    // Например, запрос к API для проверки выполнения предыдущих уроков
    
    // Временная заглушка - всегда разрешаем доступ
    next()
    
  } catch (error) {
    console.error('Ошибка в lessonProgressGuard:', error)
    next()
  }
}

// Guard для проверки времени доступа к контенту
export const timeAccessGuard = (startTime = '08:00', endTime = '22:00') => {
  return (to, from, next) => {
    const now = new Date()
    const currentTime = now.getHours().toString().padStart(2, '0') + ':' + 
                       now.getMinutes().toString().padStart(2, '0')
    
    if (currentTime < startTime || currentTime > endTime) {
      const { showNotification } = useNotifications()
      showNotification(
        `Доступ к обучающему контенту доступен с ${startTime} до ${endTime}`,
        'info'
      )
      next({ name: 'dashboard' })
      return
    }
    
    next()
  }
}

// Guard для проверки подключения к интернету
export const connectionGuard = (to, from, next) => {
  if (!navigator.onLine) {
    const { showNotification } = useNotifications()
    showNotification('Для доступа к этой странице требуется подключение к интернету', 'error')
    next(false) // Отменяем навигацию
    return
  }
  
  next()
}

// Guard для проверки поддержки браузера
export const browserSupportGuard = (to, from, next) => {
  // Проверяем поддержку WebAssembly (для Pyodide)
  if (to.name === 'lesson' && !('WebAssembly' in window)) {
    const { showNotification } = useNotifications()
    showNotification(
      'Ваш браузер не поддерживает выполнение кода. Обновите браузер или используйте другой',
      'error'
    )
    next({ name: 'dashboard' })
    return
  }
  
  next()
}

// Комбинированный guard для уроков
export const lessonGuard = async (to, from, next) => {
  // Проверяем все необходимые условия для доступа к урокам
  const guards = [
    authGuard,
    browserSupportGuard,
    connectionGuard,
    lessonProgressGuard
  ]
  
  try {
    for (const guard of guards) {
      await new Promise((resolve, reject) => {
        guard(to, from, (result) => {
          if (result === false || (result && typeof result === 'object')) {
            reject(result)
          } else {
            resolve()
          }
        })
      })
    }
    
    next()
    
  } catch (guardResult) {
    if (guardResult === false) {
      next(false)
    } else if (guardResult && typeof guardResult === 'object') {
      next(guardResult)
    } else {
      next({ name: 'dashboard' })
    }
  }
}

// Утилита для создания guard'а с несколькими условиями
export const createMultiGuard = (...guards) => {
  return async (to, from, next) => {
    try {
      for (const guard of guards) {
        await new Promise((resolve, reject) => {
          guard(to, from, (result) => {
            if (result === false || (result && typeof result === 'object')) {
              reject(result)
            } else {
              resolve()
            }
          })
        })
      }
      
      next()
      
    } catch (guardResult) {
      if (guardResult === false) {
        next(false)
      } else if (guardResult && typeof guardResult === 'object') {
        next(guardResult)
      } else {
        next({ name: 'home' })
      }
    }
  }
}

// Экспорт всех guards
export default {
  authGuard,
  guestGuard,
  adminGuard,
  teacherGuard,
  premiumGuard,
  gradeGuard,
  lessonProgressGuard,
  timeAccessGuard,
  connectionGuard,
  browserSupportGuard,
  lessonGuard,
  createMultiGuard
}