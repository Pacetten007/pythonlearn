import api, { apiMethods, apiUtils } from './api'

class AuthService {
  constructor() {
    this.endpoints = {
      login: '/auth/login',
      register: '/auth/register',
      logout: '/auth/logout',
      refresh: '/auth/refresh',
      me: '/auth/me',
      profile: '/auth/profile',
      changePassword: '/auth/change-password',
      requestPasswordReset: '/auth/request-password-reset',
      resetPassword: '/auth/reset-password',
      verifyEmail: '/auth/verify-email',
      resendVerification: '/auth/resend-verification',
      deleteAccount: '/auth/delete-account',
      uploadAvatar: '/auth/upload-avatar',
      sessions: '/auth/sessions'
    }
  }

  /**
   * Вход в систему
   * @param {Object} credentials - Данные для входа
   * @param {string} credentials.email - Email или username
   * @param {string} credentials.password - Пароль
   * @param {boolean} credentials.rememberMe - Запомнить пользователя
   * @returns {Promise<Object>} Данные пользователя и токены
   */
  async login(credentials) {
    try {
      const response = await apiMethods.post(this.endpoints.login, {
        email: credentials.email,
        password: credentials.password,
        rememberMe: credentials.rememberMe || false
      })

      const { user, accessToken, refreshToken } = response.data
      
      // Валидация ответа
      if (!user || !accessToken) {
        throw new Error('Invalid response from server')
      }

      return {
        user: this.normalizeUser(user),
        accessToken,
        refreshToken
      }

    } catch (error) {
      console.error('Login error:', error)
      throw this.normalizeError(error)
    }
  }

  /**
   * Регистрация нового пользователя
   * @param {Object} userData - Данные для регистрации
   * @returns {Promise<Object>} Данные пользователя и токены
   */
  async register(userData) {
    try {
      // Валидация данных
      this.validateRegistrationData(userData)

      const response = await apiMethods.post(this.endpoints.register, {
        username: userData.username,
        email: userData.email,
        password: userData.password,
        firstName: userData.firstName,
        lastName: userData.lastName,
        grade: userData.grade,
        school: userData.school,
        acceptTerms: userData.acceptTerms
      })

      const { user, accessToken, refreshToken } = response.data

      return {
        user: this.normalizeUser(user),
        accessToken,
        refreshToken
      }

    } catch (error) {
      console.error('Registration error:', error)
      throw this.normalizeError(error)
    }
  }

  /**
   * Выход из системы
   * @param {string} refreshToken - Refresh token для инвалидации
   * @returns {Promise<void>}
   */
  async logout(refreshToken) {
    try {
      if (refreshToken) {
        await apiMethods.post(this.endpoints.logout, {
          refreshToken
        }, {
          skipNotification: true // Не показываем уведомления об ошибках
        })
      }
    } catch (error) {
      // Игнорируем ошибки logout - важно очистить локальные данные
      console.warn('Logout request failed:', error)
    }
  }

  /**
   * Обновление access token
   * @param {string} refreshToken - Refresh token
   * @returns {Promise<Object>} Новый access token
   */
  async refreshToken(refreshToken) {
    try {
      const response = await apiMethods.post(this.endpoints.refresh, {
        refreshToken
      }, {
        skipTokenRefresh: true // Избегаем циклических обновлений
      })

      const { accessToken, refreshToken: newRefreshToken } = response.data

      return {
        accessToken,
        refreshToken: newRefreshToken || refreshToken
      }

    } catch (error) {
      console.error('Token refresh error:', error)
      throw this.normalizeError(error)
    }
  }

  /**
   * Получение текущего пользователя
   * @returns {Promise<Object>} Данные пользователя
   */
  async getCurrentUser() {
    try {
      const response = await apiMethods.get(this.endpoints.me)
      return this.normalizeUser(response.data)
    } catch (error) {
      if (error.response?.status === 401) {
        return null // Пользователь не авторизован
      }
      console.error('Get current user error:', error)
      throw this.normalizeError(error)
    }
  }

  /**
   * Обновление профиля пользователя
   * @param {Object} profileData - Данные профиля
   * @returns {Promise<Object>} Обновленные данные пользователя
   */
  async updateProfile(profileData) {
    try {
      const response = await apiMethods.patch(this.endpoints.profile, {
        firstName: profileData.firstName,
        lastName: profileData.lastName,
        bio: profileData.bio,
        grade: profileData.grade,
        school: profileData.school,
        timezone: profileData.timezone,
        language: profileData.language,
        theme: profileData.theme,
        emailNotifications: profileData.emailNotifications,
        pushNotifications: profileData.pushNotifications
      })

      return this.normalizeUser(response.data)

    } catch (error) {
      console.error('Update profile error:', error)
      throw this.normalizeError(error)
    }
  }

  /**
   * Смена пароля
   * @param {Object} passwordData - Данные для смены пароля
   * @param {string} passwordData.currentPassword - Текущий пароль
   * @param {string} passwordData.newPassword - Новый пароль
   * @returns {Promise<void>}
   */
  async changePassword(passwordData) {
    try {
      await apiMethods.post(this.endpoints.changePassword, {
        currentPassword: passwordData.currentPassword,
        newPassword: passwordData.newPassword
      })

    } catch (error) {
      console.error('Change password error:', error)
      throw this.normalizeError(error)
    }
  }

  /**
   * Запрос сброса пароля
   * @param {string} email - Email для сброса
   * @returns {Promise<void>}
   */
  async requestPasswordReset(email) {
    try {
      await apiMethods.post(this.endpoints.requestPasswordReset, {
        email
      })

    } catch (error) {
      console.error('Request password reset error:', error)
      throw this.normalizeError(error)
    }
  }

  /**
   * Сброс пароля по токену
   * @param {string} token - Токен сброса
   * @param {string} newPassword - Новый пароль
   * @returns {Promise<void>}
   */
  async resetPassword(token, newPassword) {
    try {
      await apiMethods.post(this.endpoints.resetPassword, {
        token,
        newPassword
      })

    } catch (error) {
      console.error('Reset password error:', error)
      throw this.normalizeError(error)
    }
  }

  /**
   * Подтверждение email
   * @param {string} token - Токен подтверждения
   * @returns {Promise<void>}
   */
  async verifyEmail(token) {
    try {
      await apiMethods.post(this.endpoints.verifyEmail, {
        token
      })

    } catch (error) {
      console.error('Verify email error:', error)
      throw this.normalizeError(error)
    }
  }

  /**
   * Повторная отправка подтверждения email
   * @returns {Promise<void>}
   */
  async resendEmailVerification() {
    try {
      await apiMethods.post(this.endpoints.resendVerification)

    } catch (error) {
      console.error('Resend verification error:', error)
      throw this.normalizeError(error)
    }
  }

  /**
   * Загрузка аватара
   * @param {File} file - Файл изображения
   * @returns {Promise<string>} URL аватара
   */
  async uploadAvatar(file) {
    try {
      // Валидация файла
      this.validateAvatarFile(file)

      const response = await apiMethods.upload(
        this.endpoints.uploadAvatar,
        file,
        (progress) => {
          console.log(`Avatar upload progress: ${progress}%`)
        }
      )

      return response.data.avatarUrl

    } catch (error) {
      console.error('Upload avatar error:', error)
      throw this.normalizeError(error)
    }
  }

  /**
   * Удаление аккаунта
   * @param {string} password - Пароль для подтверждения
   * @returns {Promise<void>}
   */
  async deleteAccount(password) {
    try {
      await apiMethods.post(this.endpoints.deleteAccount, {
        password
      })

    } catch (error) {
      console.error('Delete account error:', error)
      throw this.normalizeError(error)
    }
  }

  /**
   * Получение активных сессий
   * @returns {Promise<Array>} Список активных сессий
   */
  async getSessions() {
    try {
      const response = await apiMethods.get(this.endpoints.sessions)
      return response.data.map(session => ({
        id: session.id,
        ipAddress: session.ipAddress,
        userAgent: session.userAgent,
        createdAt: new Date(session.createdAt),
        lastActivity: new Date(session.lastActivity),
        isCurrentSession: session.isCurrentSession,
        location: session.location
      }))

    } catch (error) {
      console.error('Get sessions error:', error)
      throw this.normalizeError(error)
    }
  }

  /**
   * Завершение сессии
   * @param {string} sessionId - ID сессии
   * @returns {Promise<void>}
   */
  async terminateSession(sessionId) {
    try {
      await apiMethods.delete(`${this.endpoints.sessions}/${sessionId}`)

    } catch (error) {
      console.error('Terminate session error:', error)
      throw this.normalizeError(error)
    }
  }

  /**
   * Завершение всех сессий кроме текущей
   * @returns {Promise<void>}
   */
  async terminateAllOtherSessions() {
    try {
      await apiMethods.delete(`${this.endpoints.sessions}/others`)

    } catch (error) {
      console.error('Terminate other sessions error:', error)
      throw this.normalizeError(error)
    }
  }

  // Приватные методы

  /**
   * Нормализация данных пользователя
   * @private
   */
  normalizeUser(userData) {
    if (!userData) return null

    return {
      id: userData.id,
      username: userData.username,
      email: userData.email,
      firstName: userData.firstName || '',
      lastName: userData.lastName || '',
      avatarUrl: userData.avatarUrl || null,
      bio: userData.bio || '',
      grade: userData.grade || null,
      school: userData.school || '',
      role: userData.role || 'student',
      isActive: userData.isActive !== false,
      isVerified: userData.isVerified === true,
      isPremium: userData.isPremium === true,
      timezone: userData.timezone || 'Europe/Moscow',
      language: userData.language || 'ru',
      theme: userData.theme || 'dark',
      emailNotifications: userData.emailNotifications !== false,
      pushNotifications: userData.pushNotifications !== false,
      createdAt: userData.createdAt ? new Date(userData.createdAt) : null,
      updatedAt: userData.updatedAt ? new Date(userData.updatedAt) : null,
      lastLogin: userData.lastLogin ? new Date(userData.lastLogin) : null
    }
  }

  /**
   * Нормализация ошибок
   * @private
   */
  normalizeError(error) {
    if (error.response?.data) {
      const { message, errors, code } = error.response.data
      
      return {
        message: message || 'Произошла ошибка',
        errors: errors || {},
        code: code || error.response.status,
        status: error.response.status
      }
    }

    return {
      message: error.message || 'Произошла неожиданная ошибка',
      errors: {},
      code: 'NETWORK_ERROR',
      status: 0
    }
  }

  /**
   * Валидация данных регистрации
   * @private
   */
  validateRegistrationData(userData) {
    const errors = {}

    if (!userData.username || userData.username.length < 3) {
      errors.username = 'Имя пользователя должно содержать минимум 3 символа'
    }

    if (!/^[a-zA-Z0-9_]+$/.test(userData.username)) {
      errors.username = 'Имя пользователя может содержать только буквы, цифры и подчеркивания'
    }

    if (!userData.email || !/\S+@\S+\.\S+/.test(userData.email)) {
      errors.email = 'Введите корректный email'
    }

    if (!userData.password || userData.password.length < 6) {
      errors.password = 'Пароль должен содержать минимум 6 символов'
    }

    if (!/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(userData.password)) {
      errors.password = 'Пароль должен содержать заглавные и строчные буквы, а также цифры'
    }

    if (!userData.firstName || userData.firstName.length < 2) {
      errors.firstName = 'Введите имя (минимум 2 символа)'
    }

    if (userData.grade && (userData.grade < 8 || userData.grade > 11)) {
      errors.grade = 'Выберите класс от 8 до 11'
    }

    if (!userData.acceptTerms) {
      errors.acceptTerms = 'Необходимо принять пользовательское соглашение'
    }

    if (Object.keys(errors).length > 0) {
      const error = new Error('Ошибки валидации')
      error.errors = errors
      throw error
    }
  }

  /**
   * Валидация файла аватара
   * @private
   */
  validateAvatarFile(file) {
    const maxSize = 5 * 1024 * 1024 // 5MB
    const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp']

    if (!file) {
      throw new Error('Файл не выбран')
    }

    if (file.size > maxSize) {
      throw new Error('Размер файла не должен превышать 5MB')
    }

    if (!allowedTypes.includes(file.type)) {
      throw new Error('Поддерживаются только изображения: JPEG, PNG, GIF, WebP')
    }
  }

  /**
   * Проверка силы пароля
   * @param {string} password - Пароль для проверки
   * @returns {Object} Результат проверки
   */
  checkPasswordStrength(password) {
    let strength = 0
    const feedback = []

    if (password.length >= 8) {
      strength += 1
    } else {
      feedback.push('Добавьте больше символов')
    }

    if (/[a-z]/.test(password)) {
      strength += 1
    } else {
      feedback.push('Добавьте строчные буквы')
    }

    if (/[A-Z]/.test(password)) {
      strength += 1
    } else {
      feedback.push('Добавьте заглавные буквы')
    }

    if (/\d/.test(password)) {
      strength += 1
    } else {
      feedback.push('Добавьте цифры')
    }

    if (/[!@#$%^&*]/.test(password)) {
      strength += 1
    } else {
      feedback.push('Добавьте специальные символы')
    }

    const levels = ['Очень слабый', 'Слабый', 'Средний', 'Хороший', 'Отличный']
    const level = levels[Math.min(strength, 4)]

    return {
      strength,
      level,
      feedback,
      isStrong: strength >= 3
    }
  }

  /**
   * Генерация безопасного пароля
   * @param {number} length - Длина пароля
   * @returns {string} Сгенерированный пароль
   */
  generateSecurePassword(length = 12) {
    const lowercase = 'abcdefghijklmnopqrstuvwxyz'
    const uppercase = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'
    const numbers = '0123456789'
    const special = '!@#$%^&*'
    
    const allChars = lowercase + uppercase + numbers + special
    let password = ''
    
    // Гарантируем наличие символов каждого типа
    password += lowercase[Math.floor(Math.random() * lowercase.length)]
    password += uppercase[Math.floor(Math.random() * uppercase.length)]
    password += numbers[Math.floor(Math.random() * numbers.length)]
    password += special[Math.floor(Math.random() * special.length)]
    
    // Заполняем остальное случайными символами
    for (let i = password.length; i < length; i++) {
      password += allChars[Math.floor(Math.random() * allChars.length)]
    }
    
    // Перемешиваем символы
    return password.split('').sort(() => Math.random() - 0.5).join('')
  }
}

// Создаем и экспортируем единственный экземпляр
export const authService = new AuthService()
export default authService