import { apiMethods, apiUtils } from './api'

class ProgressService {
  constructor() {
    this.endpoints = {
      userProgress: '/progress',
      lessonProgress: '/progress/lessons/:id',
      updateLessonProgress: '/progress/lessons/:id',
      
      achievements: '/achievements',
      userAchievements: '/progress/achievements',
      checkAchievements: '/progress/achievements/check',
      
      stats: '/progress/stats',
      performanceStats: '/progress/performance',
      weeklyStats: '/progress/stats/weekly',
      monthlyStats: '/progress/stats/monthly',
      
      leaderboard: '/leaderboard',
      userRank: '/leaderboard/rank',
      
      xp: '/progress/xp',
      streak: '/progress/streak',
      
      insights: '/progress/insights',
      weakAreas: '/progress/weak-areas',
      recommendations: '/progress/recommendations',
      
      export: '/progress/export'
    }
  }

  // === Общий прогресс пользователя ===

  /**
   * Получение общего прогресса пользователя
   * @returns {Promise<Object>} Данные прогресса
   */
  async getUserProgress() {
    try {
      const response = await apiMethods.get(this.endpoints.userProgress)
      return this.normalizeUserProgress(response.data)

    } catch (error) {
      console.error('Get user progress error:', error)
      throw this.normalizeError(error, 'Ошибка при загрузке прогресса')
    }
  }

  /**
   * Получение прогресса по конкретному уроку
   * @param {string} lessonId - ID урока
   * @returns {Promise<Object>} Прогресс урока
   */
  async getLessonProgress(lessonId) {
    try {
      const url = this.endpoints.lessonProgress.replace(':id', lessonId)
      const response = await apiMethods.get(url)
      
      return this.normalizeLessonProgress(response.data)

    } catch (error) {
      console.error('Get lesson progress error:', error)
      return null // Возвращаем null если прогресса нет
    }
  }

  /**
   * Обновление прогресса урока
   * @param {string} lessonId - ID урока
   * @param {Object} progressData - Данные прогресса
   * @returns {Promise<Object>} Обновленный прогресс
   */
  async updateLessonProgress(lessonId, progressData) {
    try {
      const url = this.endpoints.updateLessonProgress.replace(':id', lessonId)
      
      const response = await apiMethods.patch(url, {
        status: progressData.status,
        score: progressData.score,
        maxScore: progressData.maxScore,
        attempts: progressData.attempts,
        hintsUsed: progressData.hintsUsed,
        timeSpent: progressData.timeSpent,
        completedAt: progressData.completedAt,
        userNotes: progressData.userNotes
      })
      
      return this.normalizeLessonProgress(response.data)

    } catch (error) {
      console.error('Update lesson progress error:', error)
      throw this.normalizeError(error, 'Ошибка при обновлении прогресса')
    }
  }

  // === Достижения ===

  /**
   * Получение всех доступных достижений
   * @returns {Promise<Array>} Список достижений
   */
  async getAchievements() {
    try {
      const response = await apiMethods.get(this.endpoints.achievements)
      return response.data.map(this.normalizeAchievement)

    } catch (error) {
      console.error('Get achievements error:', error)
      throw this.normalizeError(error, 'Ошибка при загрузке достижений')
    }
  }

  /**
   * Получение достижений пользователя
   * @returns {Promise<Array>} Список полученных достижений
   */
  async getUserAchievements() {
    try {
      const response = await apiMethods.get(this.endpoints.userAchievements)
      return response.data.map(this.normalizeUserAchievement)

    } catch (error) {
      console.error('Get user achievements error:', error)
      throw this.normalizeError(error, 'Ошибка при загрузке достижений пользователя')
    }
  }

  /**
   * Проверка новых достижений
   * @returns {Promise<Array>} Список новых достижений
   */
  async checkAchievements() {
    try {
      const response = await apiMethods.post(this.endpoints.checkAchievements, {}, {
        skipNotification: true // Не показываем уведомления об ошибках
      })
      
      return response.data.map(this.normalizeUserAchievement)

    } catch (error) {
      console.error('Check achievements error:', error)
      return [] // Возвращаем пустой массив при ошибке
    }
  }

  // === Статистика ===

  /**
   * Получение статистики за период
   * @param {string} period - Период ('week', 'month', 'year')
   * @returns {Promise<Array>} Статистика по дням
   */
  async getStats(period = 'week') {
    try {
      const url = `${this.endpoints.stats}?period=${period}`
      const response = await apiMethods.get(url)
      
      return response.data.map(this.normalizeStatItem)

    } catch (error) {
      console.error('Get stats error:', error)
      throw this.normalizeError(error, 'Ошибка при загрузке статистики')
    }
  }

  /**
   * Получение статистики производительности
   * @returns {Promise<Object>} Метрики производительности
   */
  async getPerformanceStats() {
    try {
      const response = await apiMethods.get(this.endpoints.performanceStats)
      return this.normalizePerformanceStats(response.data)

    } catch (error) {
      console.error('Get performance stats error:', error)
      throw this.normalizeError(error, 'Ошибка при загрузке статистики производительности')
    }
  }

  /**
   * Получение недельной статистики
   * @returns {Promise<Array>} Статистика по дням недели
   */
  async getWeeklyStats() {
    try {
      const response = await apiMethods.get(this.endpoints.weeklyStats)
      return response.data.map(this.normalizeStatItem)

    } catch (error) {
      console.error('Get weekly stats error:', error)
      return []
    }
  }

  /**
   * Получение месячной статистики
   * @returns {Promise<Array>} Статистика по дням месяца
   */
  async getMonthlyStats() {
    try {
      const response = await apiMethods.get(this.endpoints.monthlyStats)
      return response.data.map(this.normalizeStatItem)

    } catch (error) {
      console.error('Get monthly stats error:', error)
      return []
    }
  }

  // === Рейтинг ===

  /**
   * Получение таблицы лидеров
   * @param {string} type - Тип рейтинга ('xp', 'streak', 'lessons')
   * @param {number} limit - Количество записей
   * @returns {Promise<Array>} Список лидеров
   */
  async getLeaderboard(type = 'xp', limit = 50) {
    try {
      const url = `${this.endpoints.leaderboard}?type=${type}&limit=${limit}`
      const response = await apiMethods.get(url)
      
      return response.data.map(this.normalizeLeaderboardEntry)

    } catch (error) {
      console.error('Get leaderboard error:', error)
      throw this.normalizeError(error, 'Ошибка при загрузке рейтинга')
    }
  }

  /**
   * Получение позиции пользователя в рейтинге
   * @param {string} type - Тип рейтинга
   * @returns {Promise<Object>} Позиция пользователя
   */
  async getUserRank(type = 'xp') {
    try {
      const url = `${this.endpoints.userRank}?type=${type}`
      const response = await apiMethods.get(url)
      
      return this.normalizeUserRank(response.data)

    } catch (error) {
      console.error('Get user rank error:', error)
      return null
    }
  }

  // === XP и уровни ===

  /**
   * Добавление XP
   * @param {number} amount - Количество XP
   * @param {string} source - Источник XP
   * @returns {Promise<Object>} Результат добавления XP
   */
  async addXp(amount, source = 'lesson') {
    try {
      const response = await apiMethods.post(this.endpoints.xp, {
        amount,
        source
      })
      
      return {
        xpAdded: response.data.xpAdded,
        totalXp: response.data.totalXp,
        oldLevel: response.data.oldLevel,
        newLevel: response.data.newLevel,
        leveledUp: response.data.leveledUp
      }

    } catch (error) {
      console.error('Add XP error:', error)
      throw this.normalizeError(error, 'Ошибка при добавлении XP')
    }
  }

  // === Стрики ===

  /**
   * Обновление стрика активности
   * @returns {Promise<Object>} Данные стрика
   */
  async updateStreak() {
    try {
      const response = await apiMethods.post(this.endpoints.streak)
      
      return {
        currentStreak: response.data.currentStreak,
        longestStreak: response.data.longestStreak,
        lastActivityDate: response.data.lastActivityDate ? new Date(response.data.lastActivityDate) : null
      }

    } catch (error) {
      console.error('Update streak error:', error)
      throw this.normalizeError(error, 'Ошибка при обновлении стрика')
    }
  }

  // === Аналитика и рекомендации ===

  /**
   * Получение аналитических данных об обучении
   * @returns {Promise<Object>} Аналитические данные
   */
  async getStudyInsights() {
    try {
      const response = await apiMethods.get(this.endpoints.insights)
      return this.normalizeStudyInsights(response.data)

    } catch (error) {
      console.error('Get study insights error:', error)
      throw this.normalizeError(error, 'Ошибка при загрузке аналитики')
    }
  }

  /**
   * Определение слабых областей
   * @returns {Promise<Array>} Слабые области
   */
  async getWeakAreas() {
    try {
      const response = await apiMethods.get(this.endpoints.weakAreas)
      return response.data.map(this.normalizeWeakArea)

    } catch (error) {
      console.error('Get weak areas error:', error)
      return []
    }
  }

  /**
   * Получение рекомендаций для улучшения
   * @returns {Promise<Array>} Рекомендации
   */
  async getRecommendations() {
    try {
      const response = await apiMethods.get(this.endpoints.recommendations)
      return response.data.map(this.normalizeRecommendation)

    } catch (error) {
      console.error('Get recommendations error:', error)
      return []
    }
  }

  // === Экспорт данных ===

  /**
   * Экспорт данных прогресса
   * @param {string} format - Формат экспорта ('json', 'csv', 'pdf')
   * @returns {Promise<Blob>} Файл с данными
   */
  async exportProgress(format = 'json') {
    try {
      const url = `${this.endpoints.export}?format=${format}`
      const response = await apiMethods.get(url, {
        responseType: 'blob'
      })
      
      return response.data

    } catch (error) {
      console.error('Export progress error:', error)
      throw this.normalizeError(error, 'Ошибка при экспорте данных')
    }
  }

  // === Нормализация данных ===

  /**
   * Нормализация общего прогресса пользователя
   * @private
   */
  normalizeUserProgress(progressData) {
    if (!progressData) return null

    return {
      totalLessons: progressData.totalLessons || 0,
      completedLessons: progressData.completedLessons || 0,
      lessonsInProgress: progressData.lessonsInProgress || 0,
      totalXp: progressData.totalXp || 0,
      currentLevel: progressData.currentLevel || 1,
      xpToNextLevel: progressData.xpToNextLevel || 100,
      currentStreak: progressData.currentStreak || 0,
      longestStreak: progressData.longestStreak || 0,
      lastActivityDate: progressData.lastActivityDate ? new Date(progressData.lastActivityDate) : null,
      totalSubmissions: progressData.totalSubmissions || 0,
      acceptedSubmissions: progressData.acceptedSubmissions || 0,
      averageScore: progressData.averageScore || 0,
      totalStudyTime: progressData.totalStudyTime || 0,
      lessonsThisWeek: progressData.lessonsThisWeek || 0,
      lessonsThisMonth: progressData.lessonsThisMonth || 0,
      preferredDifficulty: progressData.preferredDifficulty || 3,
      learningStyle: progressData.learningStyle || { visual: 0.5, practical: 0.5 },
      avgLessonTime: progressData.avgLessonTime || 0,
      mostActiveHour: progressData.mostActiveHour || null,
      mostActiveDay: progressData.mostActiveDay || null,
      updatedAt: progressData.updatedAt ? new Date(progressData.updatedAt) : null
    }
  }

  /**
   * Нормализация прогресса урока
   * @private
   */
  normalizeLessonProgress(progressData) {
    if (!progressData) return null

    return {
      id: progressData.id,
      userId: progressData.userId,
      lessonId: progressData.lessonId,
      status: progressData.status || 'not_started',
      score: progressData.score || 0,
      maxScore: progressData.maxScore || 0,
      attempts: progressData.attempts || 0,
      hintsUsed: progressData.hintsUsed || 0,
      xpEarned: progressData.xpEarned || 0,
      bonusXp: progressData.bonusXp || 0,
      timeSpent: progressData.timeSpent || 0,
      userNotes: progressData.userNotes || '',
      startedAt: progressData.startedAt ? new Date(progressData.startedAt) : null,
      completedAt: progressData.completedAt ? new Date(progressData.completedAt) : null,
      lastAccessed: progressData.lastAccessed ? new Date(progressData.lastAccessed) : null,
      createdAt: progressData.createdAt ? new Date(progressData.createdAt) : null,
      updatedAt: progressData.updatedAt ? new Date(progressData.updatedAt) : null
    }
  }

  /**
   * Нормализация достижения
   * @private
   */
  normalizeAchievement(achievementData) {
    if (!achievementData) return null

    return {
      id: achievementData.id,
      name: achievementData.name || '',
      title: achievementData.title || '',
      description: achievementData.description || '',
      icon: achievementData.icon || '🏆',
      color: achievementData.color || '#FFD700',
      badgeImageUrl: achievementData.badgeImageUrl || null,
      animation: achievementData.animation || 'bounce',
      category: achievementData.category || 'general',
      rarity: achievementData.rarity || 'common',
      xpReward: achievementData.xpReward || 0,
      titleUnlock: achievementData.titleUnlock || null,
      badgeUnlock: achievementData.badgeUnlock || null,
      conditions: achievementData.conditions || {},
      isActive: achievementData.isActive !== false,
      isSecret: achievementData.isSecret === true,
      unlockOrder: achievementData.unlockOrder || null,
      timesEarned: achievementData.timesEarned || 0,
      createdAt: achievementData.createdAt ? new Date(achievementData.createdAt) : null
    }
  }

  /**
   * Нормализация достижения пользователя
   * @private
   */
  normalizeUserAchievement(userAchievementData) {
    if (!userAchievementData) return null

    return {
      id: userAchievementData.id,
      userId: userAchievementData.userId,
      achievementId: userAchievementData.achievementId,
      earnedAt: userAchievementData.earnedAt ? new Date(userAchievementData.earnedAt) : null,
      earnedFor: userAchievementData.earnedFor || {},
      notificationSent: userAchievementData.notificationSent === true,
      notificationRead: userAchievementData.notificationRead === true
    }
  }

  /**
   * Нормализация статистического элемента
   * @private
   */
  normalizeStatItem(statData) {
    if (!statData) return null

    return {
      date: statData.date ? new Date(statData.date) : null,
      lessonsCompleted: statData.lessonsCompleted || 0,
      xpEarned: statData.xpEarned || 0,
      timeSpent: statData.timeSpent || 0,
      submissions: statData.submissions || 0,
      correctSubmissions: statData.correctSubmissions || 0,
      avgScore: statData.avgScore || 0,
      streak: statData.streak || 0
    }
  }

  /**
   * Нормализация статистики производительности
   * @private
   */
  normalizePerformanceStats(statsData) {
    if (!statsData) return null

    return {
      accuracy: Math.round((statsData.accuracy || 0) * 100) / 100,
      speed: Math.round((statsData.speed || 0) * 100) / 100,
      consistency: Math.round((statsData.consistency || 0) * 100) / 100,
      improvement: Math.round((statsData.improvement || 0) * 100) / 100,
      strongAreas: statsData.strongAreas || [],
      improvementAreas: statsData.improvementAreas || [],
      overallRating: statsData.overallRating || 'Начинающий'
    }
  }

  /**
   * Нормализация записи рейтинга
   * @private
   */
  normalizeLeaderboardEntry(entryData) {
    if (!entryData) return null

    return {
      rank: entryData.rank || 0,
      userId: entryData.userId,
      username: entryData.username || '',
      displayName: entryData.displayName || entryData.username || '',
      avatarUrl: entryData.avatarUrl || null,
      grade: entryData.grade || null,
      totalXp: entryData.totalXp || 0,
      currentLevel: entryData.currentLevel || 1,
      currentStreak: entryData.currentStreak || 0,
      completedLessons: entryData.completedLessons || 0,
      value: entryData.value || 0, // Значение по которому ранжируется
      change: entryData.change || 0 // Изменение позиции
    }
  }

  /**
   * Нормализация позиции пользователя в рейтинге
   * @private
   */
  normalizeUserRank(rankData) {
    if (!rankData) return null

    return {
      rank: rankData.rank || null,
      totalUsers: rankData.totalUsers || 0,
      percentile: rankData.percentile || 0,
      value: rankData.value || 0,
      change: rankData.change || 0,
      nextRankValue: rankData.nextRankValue || null,
      prevRankValue: rankData.prevRankValue || null
    }
  }

  /**
   * Нормализация аналитических данных
   * @private
   */
  normalizeStudyInsights(insightsData) {
    if (!insightsData) return null

    return {
      totalStudyDays: insightsData.totalStudyDays || 0,
      averageSessionLength: insightsData.averageSessionLength || 0,
      mostProductiveTime: insightsData.mostProductiveTime || null,
      favoriteTopics: insightsData.favoriteTopics || [],
      learningVelocity: insightsData.learningVelocity || 0,
      consistencyScore: insightsData.consistencyScore || 0,
      motivationLevel: insightsData.motivationLevel || 'средний',
      nextGoals: insightsData.nextGoals || [],
      studyPattern: insightsData.studyPattern || 'смешанный'
    }
  }

  /**
   * Нормализация слабой области
   * @private
   */
  normalizeWeakArea(areaData) {
    if (!areaData) return null

    return {
      topic: areaData.topic || '',
      category: areaData.category || '',
      accuracy: areaData.accuracy || 0,
      averageAttempts: areaData.averageAttempts || 0,
      lastPracticed: areaData.lastPracticed ? new Date(areaData.lastPracticed) : null,
      recommendedLessons: areaData.recommendedLessons || [],
      priority: areaData.priority || 'medium'
    }
  }

  /**
   * Нормализация рекомендации
   * @private
   */
  normalizeRecommendation(recommendationData) {
    if (!recommendationData) return null

    return {
      id: recommendationData.id,
      type: recommendationData.type || 'lesson',
      title: recommendationData.title || '',
      description: recommendationData.description || '',
      reason: recommendationData.reason || '',
      priority: recommendationData.priority || 'medium',
      difficulty: recommendationData.difficulty || 3,
      estimatedTime: recommendationData.estimatedTime || 0,
      targetId: recommendationData.targetId || null,
      action: recommendationData.action || 'study',
      benefits: recommendationData.benefits || [],
      createdAt: recommendationData.createdAt ? new Date(recommendationData.createdAt) : null
    }
  }

  /**
   * Нормализация ошибок
   * @private
   */
  normalizeError(error, defaultMessage = 'Произошла ошибка') {
    if (error.response?.data) {
      const { message, errors, code } = error.response.data
      
      return {
        message: message || defaultMessage,
        errors: errors || {},
        code: code || error.response.status,
        status: error.response.status
      }
    }

    return {
      message: error.message || defaultMessage,
      errors: {},
      code: 'NETWORK_ERROR',
      status: 0
    }
  }
}

// Создаем и экспортируем единственный экземпляр
export const progressService = new ProgressService()
export default progressService