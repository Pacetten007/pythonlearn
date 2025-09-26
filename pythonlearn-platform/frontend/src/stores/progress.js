import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { apiMethods } from '@/services/api'
import { useNotifications } from '@/composables/useNotifications'

export const useProgressStore = defineStore('progress', () => {
  // Основное состояние
  const userProgress = ref(null)
  const lessonProgress = ref(new Map()) // Map<lessonId, progressData>
  const achievements = ref([])
  const userAchievements = ref([])
  const streak = ref(0)
  const totalXP = ref(0)
  const currentLevel = ref(1)
  const isLoading = ref(false)
  const error = ref(null)

  // Кэш прогресса
  const progressCache = ref(new Map())
  const cacheTimestamp = ref(Date.now())
  const CACHE_DURATION = 5 * 60 * 1000 // 5 минут

  // Статистика активности
  const dailyStats = ref([])
  const weeklyStats = ref([])
  const monthlyStats = ref([])

  // Composables
  const { showNotification } = useNotifications()

  // Вычисляемые значения
  const xpToNextLevel = computed(() => {
    // Прогрессивная формула для определения XP до следующего уровня
    const baseXP = 100
    const multiplier = 1.5
    return Math.floor(baseXP * Math.pow(multiplier, currentLevel.value - 1))
  })

  const progressToNextLevel = computed(() => {
    if (!userProgress.value) return 0
    const currentLevelXP = getLevelXP(currentLevel.value)
    const nextLevelXP = getLevelXP(currentLevel.value + 1)
    const currentTotalXP = totalXP.value
    
    if (currentTotalXP >= nextLevelXP) return 100
    
    const progress = ((currentTotalXP - currentLevelXP) / (nextLevelXP - currentLevelXP)) * 100
    return Math.max(0, Math.min(100, progress))
  })

  const completedLessonsCount = computed(() => {
    if (!userProgress.value) return 0
    return userProgress.value.completedLessons || 0
  })

  const totalLessonsCount = computed(() => {
    if (!userProgress.value) return 0
    return userProgress.value.totalLessons || 0
  })

  const completionRate = computed(() => {
    if (totalLessonsCount.value === 0) return 0
    return Math.round((completedLessonsCount.value / totalLessonsCount.value) * 100)
  })

  const currentStreak = computed(() => streak.value)

  const achievementsCount = computed(() => userAchievements.value.length)

  const recentAchievements = computed(() => {
    return userAchievements.value
      .sort((a, b) => new Date(b.earnedAt) - new Date(a.earnedAt))
      .slice(0, 5)
  })

  // Получение данных
  const fetchUserProgress = async (useCache = true) => {
    try {
      // Проверяем кэш
      if (useCache && isProgressCacheValid()) {
        const cached = progressCache.value.get('userProgress')
        if (cached) {
          userProgress.value = cached
          return cached
        }
      }

      isLoading.value = true
      error.value = null

      const response = await apiMethods.get('/progress/user')
      const progress = normalizeUserProgress(response.data)
      
      userProgress.value = progress
      totalXP.value = progress.totalXP
      currentLevel.value = progress.currentLevel
      streak.value = progress.currentStreak

      // Кэшируем результат
      progressCache.value.set('userProgress', progress)
      cacheTimestamp.value = Date.now()

      return progress

    } catch (err) {
      console.error('Ошибка загрузки прогресса:', err)
      error.value = err.message || 'Ошибка загрузки прогресса'
      showNotification('Ошибка загрузки прогресса', 'error')
      throw err
    } finally {
      isLoading.value = false
    }
  }

  const fetchLessonProgress = async (lessonId, useCache = true) => {
    try {
      // Проверяем кэш
      if (useCache && lessonProgress.value.has(lessonId)) {
        return lessonProgress.value.get(lessonId)
      }

      const response = await apiMethods.get(`/progress/lessons/${lessonId}`)
      const progress = normalizeLessonProgress(response.data)
      
      lessonProgress.value.set(lessonId, progress)
      return progress

    } catch (err) {
      console.error('Ошибка загрузки прогресса урока:', err)
      
      // Если урок не начат, возвращаем начальное состояние
      if (err.response?.status === 404) {
        const initialProgress = createInitialLessonProgress(lessonId)
        lessonProgress.value.set(lessonId, initialProgress)
        return initialProgress
      }
      
      throw err
    }
  }

  const fetchAchievements = async () => {
    try {
      const [availableResponse, userResponse] = await Promise.all([
        apiMethods.get('/achievements'),
        apiMethods.get('/achievements/user')
      ])

      achievements.value = availableResponse.data.map(normalizeAchievement)
      userAchievements.value = userResponse.data.map(normalizeUserAchievement)

      return { achievements: achievements.value, userAchievements: userAchievements.value }

    } catch (err) {
      console.error('Ошибка загрузки достижений:', err)
      showNotification('Ошибка загрузки достижений', 'error')
      throw err
    }
  }

  const fetchActivityStats = async (period = 'week') => {
    try {
      const response = await apiMethods.get(`/progress/stats/${period}`)
      
      if (period === 'day') {
        dailyStats.value = response.data
      } else if (period === 'week') {
        weeklyStats.value = response.data
      } else if (period === 'month') {
        monthlyStats.value = response.data
      }

      return response.data

    } catch (err) {
      console.error('Ошибка загрузки статистики:', err)
      throw err
    }
  }

  // Обновление прогресса
  const updateLessonProgress = async (progressData) => {
    try {
      const response = await apiMethods.post(`/progress/lessons/${progressData.lessonId}`, {
        status: progressData.completed ? 'completed' : 'in_progress',
        score: progressData.score || 0,
        timeSpent: progressData.timeSpent || 0,
        hintsUsed: progressData.hintsUsed || 0,
        attempts: progressData.attempts || 1,
        userNotes: progressData.userNotes || ''
      })

      const updatedProgress = normalizeLessonProgress(response.data)
      lessonProgress.value.set(progressData.lessonId, updatedProgress)

      // Обновляем общий прогресс
      if (progressData.completed) {
        await fetchUserProgress(false) // Принудительно обновляем без кэша
        
        // Проверяем новые достижения
        await checkForNewAchievements()
      }

      // Уведомляем об успехе
      if (progressData.completed) {
        showNotification('Урок завершен!', 'success')
        
        // Показываем полученный XP
        const earnedXP = calculateLessonXP(progressData)
        if (earnedXP > 0) {
          showNotification(`+${earnedXP} XP`, 'success')
        }
      }

      return updatedProgress

    } catch (err) {
      console.error('Ошибка обновления прогресса:', err)
      showNotification('Ошибка сохранения прогресса', 'error')
      throw err
    }
  }

  const submitAssignmentSolution = async (assignmentId, solutionData) => {
    try {
      const response = await apiMethods.post(`/assignments/${assignmentId}/submit`, {
        code: solutionData.code,
        files: solutionData.files || {},
        language: solutionData.language || 'python',
        isFinal: solutionData.isFinal || false
      })

      const submission = response.data
      
      // Если решение принято, обновляем прогресс
      if (submission.status === 'accepted') {
        await updateLessonProgress({
          lessonId: submission.lessonId,
          completed: true,
          score: submission.score,
          timeSpent: solutionData.timeSpent,
          hintsUsed: solutionData.hintsUsed,
          attempts: solutionData.attempts
        })
      }

      return submission

    } catch (err) {
      console.error('Ошибка отправки решения:', err)
      showNotification('Ошибка отправки решения', 'error')
      throw err
    }
  }

  // Достижения
  const checkForNewAchievements = async () => {
    try {
      const response = await apiMethods.post('/achievements/check')
      const newAchievements = response.data

      if (newAchievements.length > 0) {
        // Добавляем новые достижения
        newAchievements.forEach(achievement => {
          userAchievements.value.push(normalizeUserAchievement(achievement))
          
          // Показываем уведомление о достижении
          showAchievementNotification(achievement)
        })

        return newAchievements
      }

      return []

    } catch (err) {
      console.error('Ошибка проверки достижений:', err)
      return []
    }
  }

  const showAchievementNotification = (achievement) => {
    showNotification(
      `Получено достижение: ${achievement.title}!`,
      'success',
      { 
        duration: 5000,
        icon: achievement.icon || '🏆'
      }
    )
  }

  // Статистика и аналитика
  const getStreakInfo = () => {
    return {
      current: currentStreak.value,
      longest: userProgress.value?.longestStreak || 0,
      lastActivity: userProgress.value?.lastActivityDate
    }
  }

  const getXPHistory = (days = 30) => {
    // Возвращаем историю XP за последние N дней
    return dailyStats.value.slice(-days).map(day => ({
      date: day.date,
      xp: day.xpEarned || 0,
      lessons: day.lessonsCompleted || 0
    }))
  }

  const getLevelProgress = () => {
    return {
      currentLevel: currentLevel.value,
      currentXP: totalXP.value,
      xpToNext: xpToNextLevel.value,
      progress: progressToNextLevel.value
    }
  }

  const getWeeklyActivity = () => {
    const today = new Date()
    const weekDays = []
    
    for (let i = 6; i >= 0; i--) {
      const date = new Date(today)
      date.setDate(date.getDate() - i)
      
      const dayStats = dailyStats.value.find(
        stat => new Date(stat.date).toDateString() === date.toDateString()
      )
      
      weekDays.push({
        date: date.toISOString().split('T')[0],
        dayName: date.toLocaleDateString('ru-RU', { weekday: 'short' }),
        lessonsCompleted: dayStats?.lessonsCompleted || 0,
        timeSpent: dayStats?.timeSpent || 0,
        xpEarned: dayStats?.xpEarned || 0,
        isActive: (dayStats?.lessonsCompleted || 0) > 0
      })
    }
    
    return weekDays
  }

  // Утилиты
  const getLevelXP = (level) => {
    const baseXP = 100
    const multiplier = 1.5
    let totalXP = 0
    
    for (let i = 1; i < level; i++) {
      totalXP += Math.floor(baseXP * Math.pow(multiplier, i - 1))
    }
    
    return totalXP
  }

  const calculateLevelFromXP = (xp) => {
    let level = 1
    let totalXP = 0
    
    while (totalXP <= xp) {
      const levelXP = Math.floor(100 * Math.pow(1.5, level - 1))
      totalXP += levelXP
      if (totalXP <= xp) level++
    }
    
    return level
  }

  const calculateLessonXP = (progressData) => {
    let baseXP = 50 // Базовое количество XP за урок
    
    // Бонус за полное завершение
    if (progressData.completed && progressData.score >= 100) {
      baseXP += 25
    }
    
    // Бонус за скорость (если быстрее среднего времени)
    if (progressData.timeSpent && progressData.timeSpent < 1800000) { // < 30 минут
      baseXP += 15
    }
    
    // Штраф за подсказки
    const hintPenalty = (progressData.hintsUsed || 0) * 5
    
    // Штраф за попытки
    const attemptPenalty = Math.max(0, (progressData.attempts || 1) - 1) * 3
    
    return Math.max(10, baseXP - hintPenalty - attemptPenalty)
  }

  const isProgressCacheValid = () => {
    return Date.now() - cacheTimestamp.value < CACHE_DURATION
  }

  const clearCache = () => {
    progressCache.value.clear()
    lessonProgress.value.clear()
    cacheTimestamp.value = 0
  }

  // Создание начальных данных
  const createInitialLessonProgress = (lessonId) => {
    return {
      lessonId,
      status: 'not_started',
      score: 0,
      maxScore: 0,
      timeSpent: 0,
      attempts: 0,
      hintsUsed: 0,
      startedAt: null,
      completedAt: null,
      lastAccessed: new Date().toISOString(),
      xpEarned: 0,
      bonusXP: 0,
      userNotes: ''
    }
  }

  // Нормализация данных
  const normalizeUserProgress = (rawProgress) => {
    return {
      totalLessons: rawProgress.totalLessons || 0,
      completedLessons: rawProgress.completedLessons || 0,
      lessonsInProgress: rawProgress.lessonsInProgress || 0,
      totalXP: rawProgress.totalXP || 0,
      currentLevel: rawProgress.currentLevel || 1,
      xpToNextLevel: rawProgress.xpToNextLevel || 100,
      currentStreak: rawProgress.currentStreak || 0,
      longestStreak: rawProgress.longestStreak || 0,
      lastActivityDate: rawProgress.lastActivityDate,
      totalSubmissions: rawProgress.totalSubmissions || 0,
      acceptedSubmissions: rawProgress.acceptedSubmissions || 0,
      averageScore: rawProgress.averageScore || 0,
      totalStudyTime: rawProgress.totalStudyTime || 0,
      lessonsThisWeek: rawProgress.lessonsThisWeek || 0,
      lessonsThisMonth: rawProgress.lessonsThisMonth || 0,
      preferredDifficulty: rawProgress.preferredDifficulty || 3,
      learningStyle: rawProgress.learningStyle || {},
      avgLessonTime: rawProgress.avgLessonTime || 0,
      mostActiveHour: rawProgress.mostActiveHour,
      mostActiveDay: rawProgress.mostActiveDay
    }
  }

  const normalizeLessonProgress = (rawProgress) => {
    return {
      lessonId: rawProgress.lessonId,
      status: rawProgress.status || 'not_started',
      score: rawProgress.score || 0,
      maxScore: rawProgress.maxScore || 0,
      timeSpent: rawProgress.timeSpent || 0,
      attempts: rawProgress.attempts || 0,
      hintsUsed: rawProgress.hintsUsed || 0,
      startedAt: rawProgress.startedAt,
      completedAt: rawProgress.completedAt,
      lastAccessed: rawProgress.lastAccessed || new Date().toISOString(),
      xpEarned: rawProgress.xpEarned || 0,
      bonusXP: rawProgress.bonusXP || 0,
      userNotes: rawProgress.userNotes || ''
    }
  }

  const normalizeAchievement = (rawAchievement) => {
    return {
      id: rawAchievement.id,
      name: rawAchievement.name,
      title: rawAchievement.title,
      description: rawAchievement.description,
      icon: rawAchievement.icon,
      color: rawAchievement.color,
      badgeImageUrl: rawAchievement.badgeImageUrl,
      category: rawAchievement.category,
      rarity: rawAchievement.rarity,
      xpReward: rawAchievement.xpReward || 0,
      conditions: rawAchievement.conditions || {},
      isActive: rawAchievement.isActive !== false,
      isSecret: rawAchievement.isSecret || false,
      timesEarned: rawAchievement.timesEarned || 0
    }
  }

  const normalizeUserAchievement = (rawUserAchievement) => {
    return {
      id: rawUserAchievement.id,
      achievementId: rawUserAchievement.achievementId,
      achievement: rawUserAchievement.achievement ? normalizeAchievement(rawUserAchievement.achievement) : null,
      earnedAt: rawUserAchievement.earnedAt,
      earnedFor: rawUserAchievement.earnedFor || {},
      notificationSent: rawUserAchievement.notificationSent || false,
      notificationRead: rawUserAchievement.notificationRead || false
    }
  }

  // Сброс состояния
  const clearProgress = () => {
    userProgress.value = null
    lessonProgress.value.clear()
    achievements.value = []
    userAchievements.value = []
    streak.value = 0
    totalXP.value = 0
    currentLevel.value = 1
    dailyStats.value = []
    weeklyStats.value = []
    monthlyStats.value = []
    clearCache()
  }

  const reset = () => {
    clearProgress()
    isLoading.value = false
    error.value = null
  }

  return {
    // Состояние
    userProgress,
    lessonProgress,
    achievements,
    userAchievements,
    streak,
    totalXP,
    currentLevel,
    isLoading,
    error,

    // Статистика
    dailyStats,
    weeklyStats,
    monthlyStats,

    // Вычисляемые значения
    xpToNextLevel,
    progressToNextLevel,
    completedLessonsCount,
    totalLessonsCount,
    completionRate,
    currentStreak,
    achievementsCount,
    recentAchievements,

    // Действия
    fetchUserProgress,
    fetchLessonProgress,
    fetchAchievements,
    fetchActivityStats,
    updateLessonProgress,
    submitAssignmentSolution,
    checkForNewAchievements,

    // Утилиты
    getStreakInfo,
    getXPHistory,
    getLevelProgress,
    getWeeklyActivity,
    calculateLessonXP,
    clearCache,
    clearProgress,
    reset
  }
})