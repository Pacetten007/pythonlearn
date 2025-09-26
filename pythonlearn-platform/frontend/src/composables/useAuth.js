import { computed } from 'vue'
import { storeToRefs } from 'pinia'
import { useAuthStore } from '@/stores/auth'
import { useRouter } from 'vue-router'

/**
 * Composable для работы с аутентификацией
 * Предоставляет удобные методы и реактивные данные для компонентов
 */
export function useAuth() {
  const authStore = useAuthStore()
  const router = useRouter()

  // Получаем реактивные ссылки на данные store
  const {
    user,
    loading,
    error,
    isAuthenticated,
    isAdmin,
    isTeacher,
    isStudent,
    isPremium,
    isVerified,
    userInitials,
    userDisplayName
  } = storeToRefs(authStore)

  // Дополнительные вычисляемые свойства
  const userRole = computed(() => {
    if (!user.value) return null
    
    const roleLabels = {
      admin: 'Администратор',
      teacher: 'Учитель',
      student: 'Ученик'
    }
    
    return roleLabels[user.value.role] || 'Пользователь'
  })

  const userGradeLabel = computed(() => {
    if (!user.value?.grade) return null
    return `${user.value.grade} класс`
  })

  const accountAge = computed(() => {
    if (!user.value?.createdAt) return null
    
    const now = new Date()
    const created = new Date(user.value.createdAt)
    const diffTime = Math.abs(now - created)
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    
    if (diffDays < 30) {
      return `${diffDays} дн.`
    } else if (diffDays < 365) {
      const months = Math.floor(diffDays / 30)
      return `${months} мес.`
    } else {
      const years = Math.floor(diffDays / 365)
      return `${years} г.`
    }
  })

  const hasCompleteProfile = computed(() => {
    if (!user.value) return false
    
    return !!(
      user.value.firstName &&
      user.value.lastName &&
      user.value.grade &&
      user.value.isVerified
    )
  })

  const profileCompleteness = computed(() => {
    if (!user.value) return 0
    
    const fields = [
      'firstName',
      'lastName',
      'grade',
      'school',
      'bio',
      'avatarUrl',
      'isVerified'
    ]
    
    const completedFields = fields.filter(field => {
      const value = user.value[field]
      return value !== null && value !== undefined && value !== ''
    })
    
    return Math.round((completedFields.length / fields.length) * 100)
  })

  const needsEmailVerification = computed(() => {
    return isAuthenticated.value && !isVerified.value
  })

  const canAccessPremiumContent = computed(() => {
    return isPremium.value || isAdmin.value || isTeacher.value
  })

  // Методы аутентификации
  const login = async (credentials) => {
    try {
      const result = await authStore.login(credentials)
      return result
    } catch (error) {
      console.error('Login error in composable:', error)
      throw error
    }
  }

  const register = async (userData) => {
    try {
      const result = await authStore.register(userData)
      return result
    } catch (error) {
      console.error('Registration error in composable:', error)
      throw error
    }
  }

  const logout = async () => {
    try {
      await authStore.logout()
      // Перенаправляем на главную страницу
      await router.push('/')
    } catch (error) {
      console.error('Logout error in composable:', error)
    }
  }

  const updateProfile = async (profileData) => {
    try {
      const result = await authStore.updateProfile(profileData)
      return result
    } catch (error) {
      console.error('Update profile error in composable:', error)
      throw error
    }
  }

  const changePassword = async (passwordData) => {
    try {
      const result = await authStore.changePassword(passwordData)
      return result
    } catch (error) {
      console.error('Change password error in composable:', error)
      throw error
    }
  }

  const requestPasswordReset = async (email) => {
    try {
      const result = await authStore.requestPasswordReset(email)
      return result
    } catch (error) {
      console.error('Request password reset error in composable:', error)
      throw error
    }
  }

  const uploadAvatar = async (file) => {
    try {
      const result = await authStore.uploadAvatar(file)
      return result
    } catch (error) {
      console.error('Upload avatar error in composable:', error)
      throw error
    }
  }

  const resendEmailVerification = async () => {
    try {
      const result = await authStore.resendEmailVerification()
      return result
    } catch (error) {
      console.error('Resend verification error in composable:', error)
      throw error
    }
  }

  // Утилитарные методы
  const requireAuth = (redirectTo = '/login') => {
    if (!isAuthenticated.value) {
      const currentPath = router.currentRoute.value.fullPath
      router.push({
        path: redirectTo,
        query: { redirect: currentPath }
      })
      return false
    }
    return true
  }

  const requireRole = (requiredRole, redirectTo = '/dashboard') => {
    if (!isAuthenticated.value) {
      return requireAuth()
    }

    const userRole = user.value?.role
    const roleHierarchy = {
      student: 1,
      teacher: 2,
      admin: 3
    }

    if (roleHierarchy[userRole] < roleHierarchy[requiredRole]) {
      router.push(redirectTo)
      return false
    }

    return true
  }

  const requireVerification = (redirectTo = '/profile') => {
    if (!requireAuth()) return false

    if (!isVerified.value) {
      router.push(redirectTo)
      return false
    }

    return true
  }

  const requirePremium = (redirectTo = '/dashboard') => {
    if (!requireAuth()) return false

    if (!canAccessPremiumContent.value) {
      router.push(redirectTo)
      return false
    }

    return true
  }

  const checkPermission = (permission) => {
    if (!isAuthenticated.value) return false

    const permissions = {
      // Базовые разрешения для всех авторизованных
      'view_profile': true,
      'edit_profile': true,
      'access_lessons': isVerified.value,
      
      // Разрешения для премиум пользователей
      'access_premium_content': canAccessPremiumContent.value,
      'download_materials': canAccessPremiumContent.value,
      
      // Разрешения для учителей
      'view_student_progress': isTeacher.value,
      'create_assignments': isTeacher.value,
      'grade_assignments': isTeacher.value,
      
      // Разрешения для администраторов
      'manage_users': isAdmin.value,
      'manage_courses': isAdmin.value,
      'view_analytics': isAdmin.value,
      'system_settings': isAdmin.value
    }

    return permissions[permission] === true
  }

  const getAvatarUrl = (size = 40) => {
    if (user.value?.avatarUrl) {
      return `${user.value.avatarUrl}?size=${size}`
    }
    
    // Генерируем Gravatar URL как fallback
    if (user.value?.email) {
      const emailHash = btoa(user.value.email.toLowerCase().trim()).replace(/[/+=]/g, '')
      return `https://www.gravatar.com/avatar/${emailHash}?size=${size}&default=identicon`
    }
    
    return null
  }

  const getInitialsAvatar = (size = 40) => {
    if (!userInitials.value) return null
    
    const colors = [
      '#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEAA7',
      '#DDA0DD', '#98D8C8', '#F7DC6F', '#BB8FCE', '#85C1E9'
    ]
    
    const userId = user.value?.id || 'default'
    const colorIndex = userId.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0) % colors.length
    const backgroundColor = colors[colorIndex]
    
    return {
      initials: userInitials.value,
      backgroundColor,
      size,
      style: {
        width: `${size}px`,
        height: `${size}px`,
        backgroundColor,
        color: 'white',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        borderRadius: '50%',
        fontSize: `${size * 0.4}px`,
        fontWeight: '600'
      }
    }
  }

  const formatUserName = (format = 'full') => {
    if (!user.value) return ''

    const { firstName, lastName, username } = user.value

    switch (format) {
      case 'first':
        return firstName || username || 'Пользователь'
      case 'last':
        return lastName || ''
      case 'initials':
        return userInitials.value
      case 'username':
        return username || 'пользователь'
      case 'short':
        return firstName ? `${firstName} ${lastName?.[0] || ''}`.trim() : username || 'Пользователь'
      case 'full':
      default:
        return userDisplayName.value
    }
  }

  const isCurrentUser = (userId) => {
    return user.value?.id === userId
  }

  const clearError = () => {
    authStore.clearError()
  }

  // Возвращаем все необходимое для компонентов
  return {
    // Реактивные данные
    user: readonly(user),
    loading: readonly(loading),
    error: readonly(error),
    isAuthenticated: readonly(isAuthenticated),
    isAdmin: readonly(isAdmin),
    isTeacher: readonly(isTeacher),
    isStudent: readonly(isStudent),
    isPremium: readonly(isPremium),
    isVerified: readonly(isVerified),
    userInitials: readonly(userInitials),
    userDisplayName: readonly(userDisplayName),
    
    // Вычисляемые свойства
    userRole: readonly(userRole),
    userGradeLabel: readonly(userGradeLabel),
    accountAge: readonly(accountAge),
    hasCompleteProfile: readonly(hasCompleteProfile),
    profileCompleteness: readonly(profileCompleteness),
    needsEmailVerification: readonly(needsEmailVerification),
    canAccessPremiumContent: readonly(canAccessPremiumContent),
    
    // Методы аутентификации
    login,
    register,
    logout,
    updateProfile,
    changePassword,
    requestPasswordReset,
    uploadAvatar,
    resendEmailVerification,
    
    // Утилитарные методы
    requireAuth,
    requireRole,
    requireVerification,
    requirePremium,
    checkPermission,
    getAvatarUrl,
    getInitialsAvatar,
    formatUserName,
    isCurrentUser,
    clearError
  }
}