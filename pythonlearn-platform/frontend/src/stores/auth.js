import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { authService } from '@/services/auth.service'
import { useNotifications } from '@/composables/useNotifications'
import router from '@/router'

export const useAuthStore = defineStore('auth', () => {
  // Состояние
  const user = ref(null)
  const accessToken = ref(localStorage.getItem('accessToken'))
  const refreshToken = ref(localStorage.getItem('refreshToken'))
  const loading = ref(false)
  const error = ref(null)
  const initialized = ref(false)

  // Геттеры
  const isAuthenticated = computed(() => !!accessToken.value && !!user.value)
  const isAdmin = computed(() => user.value?.role === 'admin')
  const isTeacher = computed(() => user.value?.role === 'teacher' || isAdmin.value)
  const isStudent = computed(() => user.value?.role === 'student')
  const isPremium = computed(() => user.value?.isPremium || isAdmin.value)
  const isVerified = computed(() => user.value?.isVerified)
  const userInitials = computed(() => {
    if (!user.value) return ''
    const { firstName, lastName } = user.value
    return `${firstName?.[0] || ''}${lastName?.[0] || ''}`.toUpperCase()
  })
  const userDisplayName = computed(() => {
    if (!user.value) return ''
    const { firstName, lastName, username } = user.value
    if (firstName && lastName) {
      return `${firstName} ${lastName}`
    }
    return username || 'Пользователь'
  })

  // Утилиты
  const { showNotification } = useNotifications()

  // Действия
  const initialize = async () => {
    if (initialized.value) return

    try {
      loading.value = true
      error.value = null

      // Проверяем наличие токенов
      if (!accessToken.value) {
        initialized.value = true
        return
      }

      // Пытаемся получить данные пользователя
      const userData = await authService.getCurrentUser()
      user.value = userData
      
      // Проверяем валидность токена
      if (!userData) {
        await logout()
      }

    } catch (err) {
      console.error('Ошибка инициализации аутентификации:', err)
      
      // Если токен недействителен, пытаемся обновить
      if (err.response?.status === 401 && refreshToken.value) {
        const refreshed = await refreshAccessToken()
        if (!refreshed) {
          await logout()
        }
      } else {
        await logout()
      }
    } finally {
      loading.value = false
      initialized.value = true
    }
  }

  const login = async (credentials) => {
    try {
      loading.value = true
      error.value = null

      const response = await authService.login(credentials)
      const { user: userData, accessToken: newAccessToken, refreshToken: newRefreshToken } = response

      // Сохраняем данные
      user.value = userData
      accessToken.value = newAccessToken
      refreshToken.value = newRefreshToken

      // Сохраняем в localStorage
      localStorage.setItem('accessToken', newAccessToken)
      localStorage.setItem('refreshToken', newRefreshToken)

      showNotification(`Добро пожаловать, ${userData.firstName || userData.username}!`, 'success')

      // Перенаправляем пользователя
      const redirectPath = router.currentRoute.value.query.redirect || '/dashboard'
      router.push(redirectPath)

      return { success: true, user: userData }

    } catch (err) {
      console.error('Ошибка входа:', err)
      error.value = err.response?.data?.message || 'Ошибка при входе в систему'
      
      if (err.response?.status === 401) {
        showNotification('Неверные логин или пароль', 'error')
      } else if (err.response?.status === 403) {
        showNotification('Аккаунт заблокирован. Обратитесь к администратору', 'error')
      } else {
        showNotification('Ошибка при входе в систему', 'error')
      }

      return { success: false, error: error.value }
    } finally {
      loading.value = false
    }
  }

  const register = async (userData) => {
    try {
      loading.value = true
      error.value = null

      const response = await authService.register(userData)
      const { user: newUser, accessToken: newAccessToken, refreshToken: newRefreshToken } = response

      // Сохраняем данные
      user.value = newUser
      accessToken.value = newAccessToken
      refreshToken.value = newRefreshToken

      // Сохраняем в localStorage
      localStorage.setItem('accessToken', newAccessToken)
      localStorage.setItem('refreshToken', newRefreshToken)

      showNotification('Регистрация прошла успешно!', 'success')

      // Если email не подтвержден, показываем уведомление
      if (!newUser.isVerified) {
        showNotification('Проверьте email для подтверждения аккаунта', 'info')
      }

      // Перенаправляем на дашборд
      router.push('/dashboard')

      return { success: true, user: newUser }

    } catch (err) {
      console.error('Ошибка регистрации:', err)
      error.value = err.response?.data?.message || 'Ошибка при регистрации'

      if (err.response?.status === 409) {
        showNotification('Пользователь с таким email уже существует', 'error')
      } else if (err.response?.data?.errors) {
        // Показываем ошибки валидации
        const errors = err.response.data.errors
        Object.values(errors).forEach(errorMsg => {
          showNotification(errorMsg, 'error')
        })
      } else {
        showNotification('Ошибка при регистрации', 'error')
      }

      return { success: false, error: error.value }
    } finally {
      loading.value = false
    }
  }

  const logout = async () => {
    try {
      loading.value = true

      // Отправляем запрос на сервер для инвалидации токена
      if (refreshToken.value) {
        await authService.logout(refreshToken.value)
      }

    } catch (err) {
      console.error('Ошибка при выходе:', err)
    } finally {
      // Очищаем локальное состояние независимо от результата запроса
      user.value = null
      accessToken.value = null
      refreshToken.value = null
      error.value = null

      // Очищаем localStorage
      localStorage.removeItem('accessToken')
      localStorage.removeItem('refreshToken')
      localStorage.removeItem('pinia-auth')
      localStorage.removeItem('pinia-progress')

      loading.value = false

      showNotification('Вы успешно вышли из системы', 'info')

      // Перенаправляем на главную страницу
      if (router.currentRoute.value.meta.requiresAuth) {
        router.push('/')
      }
    }
  }

  const refreshAccessToken = async () => {
    if (!refreshToken.value) {
      return false
    }

    try {
      const response = await authService.refreshToken(refreshToken.value)
      const { accessToken: newAccessToken } = response

      accessToken.value = newAccessToken
      localStorage.setItem('accessToken', newAccessToken)

      return true

    } catch (err) {
      console.error('Ошибка обновления токена:', err)
      await logout()
      return false
    }
  }

  const updateProfile = async (profileData) => {
    try {
      loading.value = true
      error.value = null

      const updatedUser = await authService.updateProfile(profileData)
      user.value = { ...user.value, ...updatedUser }

      showNotification('Профиль обновлен', 'success')
      return { success: true, user: user.value }

    } catch (err) {
      console.error('Ошибка обновления профиля:', err)
      error.value = err.response?.data?.message || 'Ошибка при обновлении профиля'
      showNotification(error.value, 'error')
      return { success: false, error: error.value }
    } finally {
      loading.value = false
    }
  }

  const changePassword = async (passwordData) => {
    try {
      loading.value = true
      error.value = null

      await authService.changePassword(passwordData)

      showNotification('Пароль успешно изменен', 'success')
      return { success: true }

    } catch (err) {
      console.error('Ошибка смены пароля:', err)
      error.value = err.response?.data?.message || 'Ошибка при смене пароля'
      
      if (err.response?.status === 400) {
        showNotification('Текущий пароль неверен', 'error')
      } else {
        showNotification(error.value, 'error')
      }

      return { success: false, error: error.value }
    } finally {
      loading.value = false
    }
  }

  const requestPasswordReset = async (email) => {
    try {
      loading.value = true
      error.value = null

      await authService.requestPasswordReset(email)

      showNotification('Инструкции по сбросу пароля отправлены на email', 'success')
      return { success: true }

    } catch (err) {
      console.error('Ошибка запроса сброса пароля:', err)
      error.value = err.response?.data?.message || 'Ошибка при запросе сброса пароля'
      showNotification(error.value, 'error')
      return { success: false, error: error.value }
    } finally {
      loading.value = false
    }
  }

  const resetPassword = async (token, newPassword) => {
    try {
      loading.value = true
      error.value = null

      await authService.resetPassword(token, newPassword)

      showNotification('Пароль успешно восстановлен', 'success')
      router.push('/login')
      return { success: true }

    } catch (err) {
      console.error('Ошибка восстановления пароля:', err)
      error.value = err.response?.data?.message || 'Ошибка при восстановлении пароля'
      
      if (err.response?.status === 400) {
        showNotification('Недействительный или просроченный токен', 'error')
      } else {
        showNotification(error.value, 'error')
      }

      return { success: false, error: error.value }
    } finally {
      loading.value = false
    }
  }

  const verifyEmail = async (token) => {
    try {
      loading.value = true
      error.value = null

      await authService.verifyEmail(token)

      // Обновляем информацию о пользователе
      if (user.value) {
        user.value.isVerified = true
      }

      showNotification('Email успешно подтвержден!', 'success')
      return { success: true }

    } catch (err) {
      console.error('Ошибка подтверждения email:', err)
      error.value = err.response?.data?.message || 'Ошибка при подтверждении email'
      showNotification(error.value, 'error')
      return { success: false, error: error.value }
    } finally {
      loading.value = false
    }
  }

  const resendEmailVerification = async () => {
    try {
      loading.value = true
      error.value = null

      await authService.resendEmailVerification()

      showNotification('Письмо с подтверждением отправлено повторно', 'success')
      return { success: true }

    } catch (err) {
      console.error('Ошибка повторной отправки подтверждения:', err)
      error.value = err.response?.data?.message || 'Ошибка при отправке подтверждения'
      showNotification(error.value, 'error')
      return { success: false, error: error.value }
    } finally {
      loading.value = false
    }
  }

  const uploadAvatar = async (file) => {
    try {
      loading.value = true
      error.value = null

      const avatarUrl = await authService.uploadAvatar(file)
      
      if (user.value) {
        user.value.avatarUrl = avatarUrl
      }

      showNotification('Аватар обновлен', 'success')
      return { success: true, avatarUrl }

    } catch (err) {
      console.error('Ошибка загрузки аватара:', err)
      error.value = err.response?.data?.message || 'Ошибка при загрузке аватара'
      showNotification(error.value, 'error')
      return { success: false, error: error.value }
    } finally {
      loading.value = false
    }
  }

  const deleteAccount = async (password) => {
    try {
      loading.value = true
      error.value = null

      await authService.deleteAccount(password)

      showNotification('Аккаунт удален', 'info')
      await logout()
      return { success: true }

    } catch (err) {
      console.error('Ошибка удаления аккаунта:', err)
      error.value = err.response?.data?.message || 'Ошибка при удалении аккаунта'
      
      if (err.response?.status === 400) {
        showNotification('Неверный пароль', 'error')
      } else {
        showNotification(error.value, 'error')
      }

      return { success: false, error: error.value }
    } finally {
      loading.value = false
    }
  }

  const clearError = () => {
    error.value = null
  }

  // Автоматическое обновление токена
  const setupTokenRefresh = () => {
    if (!accessToken.value) return

    // Парсим JWT токен для получения времени истечения
    try {
      const payload = JSON.parse(atob(accessToken.value.split('.')[1]))
      const expirationTime = payload.exp * 1000 // Переводим в миллисекунды
      const refreshTime = expirationTime - Date.now() - 60000 // Обновляем за минуту до истечения

      if (refreshTime > 0) {
        setTimeout(async () => {
          if (isAuthenticated.value) {
            await refreshAccessToken()
            setupTokenRefresh() // Планируем следующее обновление
          }
        }, refreshTime)
      }
    } catch (err) {
      console.error('Ошибка парсинга токена:', err)
    }
  }

  // Инициализируем обновление токена при загрузке store
  if (accessToken.value) {
    setupTokenRefresh()
  }

  return {
    // Состояние
    user,
    accessToken,
    refreshToken,
    loading,
    error,
    initialized,
    
    // Геттеры
    isAuthenticated,
    isAdmin,
    isTeacher,
    isStudent,
    isPremium,
    isVerified,
    userInitials,
    userDisplayName,
    
    // Действия
    initialize,
    login,
    register,
    logout,
    refreshAccessToken,
    updateProfile,
    changePassword,
    requestPasswordReset,
    resetPassword,
    verifyEmail,
    resendEmailVerification,
    uploadAvatar,
    deleteAccount,
    clearError,
    setupTokenRefresh
  }
})