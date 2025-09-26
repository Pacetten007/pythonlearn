import { apiMethods, apiUtils } from './api'

class CoursesService {
  constructor() {
    this.endpoints = {
      courses: '/courses',
      course: '/courses/:slug',
      courseModules: '/courses/:id/modules',
      courseLessons: '/courses/:id/lessons',
      courseStats: '/courses/:id/stats',
      courseQuizzes: '/courses/:id/quizzes',
      
      lessons: '/lessons',
      lesson: '/lessons/:slug',
      lessonAssignments: '/lessons/:id/assignments',
      lessonProgress: '/lessons/:id/progress',
      
      assignments: '/assignments',
      assignment: '/assignments/:id',
      assignmentTestCases: '/assignments/:id/test-cases',
      assignmentSubmission: '/assignments/:id/submit',
      assignmentHints: '/assignments/:id/hints',
      
      quizzes: '/quizzes',
      quiz: '/quizzes/:slug',
      quizQuestions: '/quizzes/:id/questions',
      quizAttempt: '/quizzes/:id/attempt',
      quizSubmit: '/quizzes/:id/submit',
      
      search: '/search',
      recommendations: '/recommendations',
      popular: '/popular',
      featured: '/featured'
    }
  }

  // === Курсы ===

  /**
   * Получение списка курсов с фильтрацией и пагинацией
   * @param {Object} params - Параметры запроса
   * @returns {Promise<Object>} Список курсов и метаданные пагинации
   */
  async getCourses(params = {}) {
    try {
      const query = apiUtils.buildQueryString(params)
      const url = query ? `${this.endpoints.courses}?${query}` : this.endpoints.courses
      
      const response = await apiMethods.get(url)
      
      return {
        courses: response.data.courses.map(this.normalizeCourse),
        pagination: this.normalizePagination(response.data.pagination)
      }

    } catch (error) {
      console.error('Get courses error:', error)
      throw this.normalizeError(error, 'Ошибка при загрузке курсов')
    }
  }

  /**
   * Получение курса по slug
   * @param {string} slug - Уникальный идентификатор курса
   * @returns {Promise<Object>} Данные курса
   */
  async getCourseBySlug(slug) {
    try {
      const url = this.endpoints.course.replace(':slug', slug)
      const response = await apiMethods.get(url)
      
      return this.normalizeCourse(response.data)

    } catch (error) {
      console.error('Get course by slug error:', error)
      throw this.normalizeError(error, 'Ошибка при загрузке курса')
    }
  }

  /**
   * Получение модулей курса
   * @param {string} courseId - ID курса
   * @returns {Promise<Array>} Список модулей
   */
  async getCourseModules(courseId) {
    try {
      const url = this.endpoints.courseModules.replace(':id', courseId)
      const response = await apiMethods.get(url)
      
      return response.data.map(this.normalizeModule)

    } catch (error) {
      console.error('Get course modules error:', error)
      throw this.normalizeError(error, 'Ошибка при загрузке модулей курса')
    }
  }

  /**
   * Получение уроков курса
   * @param {string} courseId - ID курса
   * @returns {Promise<Array>} Список уроков
   */
  async getCourseLessons(courseId) {
    try {
      const url = this.endpoints.courseLessons.replace(':id', courseId)
      const response = await apiMethods.get(url)
      
      return response.data.map(this.normalizeLesson)

    } catch (error) {
      console.error('Get course lessons error:', error)
      throw this.normalizeError(error, 'Ошибка при загрузке уроков курса')
    }
  }

  /**
   * Получение статистики курса
   * @param {string} courseId - ID курса
   * @returns {Promise<Object>} Статистика курса
   */
  async getCourseStats(courseId) {
    try {
      const url = this.endpoints.courseStats.replace(':id', courseId)
      const response = await apiMethods.get(url)
      
      return {
        enrolledUsers: response.data.enrolledUsers || 0,
        completionRate: response.data.completionRate || 0,
        averageRating: response.data.averageRating || 0,
        totalRatings: response.data.totalRatings || 0,
        averageCompletionTime: response.data.averageCompletionTime || 0,
        difficulty: response.data.difficulty || 3
      }

    } catch (error) {
      console.error('Get course stats error:', error)
      return null
    }
  }

  /**
   * Получение тестов курса
   * @param {string} courseId - ID курса
   * @returns {Promise<Array>} Список тестов
   */
  async getCourseQuizzes(courseId) {
    try {
      const url = this.endpoints.courseQuizzes.replace(':id', courseId)
      const response = await apiMethods.get(url)
      
      return response.data.map(this.normalizeQuiz)

    } catch (error) {
      console.error('Get course quizzes error:', error)
      throw this.normalizeError(error, 'Ошибка при загрузке тестов курса')
    }
  }

  // === Уроки ===

  /**
   * Получение урока по slug
   * @param {string} courseSlug - Slug курса
   * @param {string} lessonSlug - Slug урока
   * @returns {Promise<Object>} Данные урока
   */
  async getLessonBySlug(courseSlug, lessonSlug) {
    try {
      const url = `/courses/${courseSlug}/lessons/${lessonSlug}`
      const response = await apiMethods.get(url)
      
      return this.normalizeLesson(response.data)

    } catch (error) {
      console.error('Get lesson by slug error:', error)
      throw this.normalizeError(error, 'Ошибка при загрузке урока')
    }
  }

  /**
   * Получение заданий урока
   * @param {string} lessonId - ID урока
   * @returns {Promise<Array>} Список заданий
   */
  async getLessonAssignments(lessonId) {
    try {
      const url = this.endpoints.lessonAssignments.replace(':id', lessonId)
      const response = await apiMethods.get(url)
      
      return response.data.map(this.normalizeAssignment)

    } catch (error) {
      console.error('Get lesson assignments error:', error)
      throw this.normalizeError(error, 'Ошибка при загрузке заданий урока')
    }
  }

  // === Задания ===

  /**
   * Получение тест-кейсов задания
   * @param {string} assignmentId - ID задания
   * @returns {Promise<Array>} Список тест-кейсов
   */
  async getAssignmentTestCases(assignmentId) {
    try {
      const url = this.endpoints.assignmentTestCases.replace(':id', assignmentId)
      const response = await apiMethods.get(url)
      
      return response.data.map(this.normalizeTestCase)

    } catch (error) {
      console.error('Get assignment test cases error:', error)
      throw this.normalizeError(error, 'Ошибка при загрузке тест-кейсов')
    }
  }

  /**
   * Отправка решения задания
   * @param {string} assignmentId - ID задания
   * @param {Object} submissionData - Данные решения
   * @returns {Promise<Object>} Результат проверки
   */
  async submitAssignment(assignmentId, submissionData) {
    try {
      const url = this.endpoints.assignmentSubmission.replace(':id', assignmentId)
      
      const response = await apiMethods.post(url, {
        code: submissionData.code,
        files: submissionData.files || {},
        language: submissionData.language || 'python',
        isFinal: submissionData.isFinal || false
      })
      
      return this.normalizeSubmission(response.data)

    } catch (error) {
      console.error('Submit assignment error:', error)
      throw this.normalizeError(error, 'Ошибка при отправке решения')
    }
  }

  /**
   * Получение подсказок для задания
   * @param {string} assignmentId - ID задания
   * @returns {Promise<Array>} Список подсказок
   */
  async getAssignmentHints(assignmentId) {
    try {
      const url = this.endpoints.assignmentHints.replace(':id', assignmentId)
      const response = await apiMethods.get(url)
      
      return response.data.hints || []

    } catch (error) {
      console.error('Get assignment hints error:', error)
      return []
    }
  }

  // === Тесты ===

  /**
   * Получение теста по slug
   * @param {string} courseSlug - Slug курса
   * @param {string} quizSlug - Slug теста
   * @returns {Promise<Object>} Данные теста
   */
  async getQuizBySlug(courseSlug, quizSlug) {
    try {
      const url = `/courses/${courseSlug}/quizzes/${quizSlug}`
      const response = await apiMethods.get(url)
      
      return this.normalizeQuiz(response.data)

    } catch (error) {
      console.error('Get quiz by slug error:', error)
      throw this.normalizeError(error, 'Ошибка при загрузке теста')
    }
  }

  /**
   * Начало прохождения теста
   * @param {string} quizId - ID теста
   * @returns {Promise<Object>} Данные попытки
   */
  async startQuizAttempt(quizId) {
    try {
      const url = this.endpoints.quizAttempt.replace(':id', quizId)
      const response = await apiMethods.post(url)
      
      return this.normalizeQuizAttempt(response.data)

    } catch (error) {
      console.error('Start quiz attempt error:', error)
      throw this.normalizeError(error, 'Ошибка при начале теста')
    }
  }

  /**
   * Отправка ответов теста
   * @param {string} quizId - ID теста
   * @param {Object} answers - Ответы пользователя
   * @returns {Promise<Object>} Результаты теста
   */
  async submitQuiz(quizId, answers) {
    try {
      const url = this.endpoints.quizSubmit.replace(':id', quizId)
      
      const response = await apiMethods.post(url, {
        answers,
        completedAt: new Date().toISOString()
      })
      
      return this.normalizeQuizResult(response.data)

    } catch (error) {
      console.error('Submit quiz error:', error)
      throw this.normalizeError(error, 'Ошибка при отправке теста')
    }
  }

  // === Поиск и рекомендации ===

  /**
   * Поиск курсов
   * @param {string} query - Поисковый запрос
   * @param {Object} filters - Дополнительные фильтры
   * @returns {Promise<Array>} Результаты поиска
   */
  async searchCourses(query, filters = {}) {
    try {
      const params = {
        q: query,
        ...filters
      }
      
      const queryString = apiUtils.buildQueryString(params)
      const url = `${this.endpoints.search}?${queryString}`
      
      const response = await apiMethods.get(url)
      
      return {
        courses: response.data.courses?.map(this.normalizeCourse) || [],
        lessons: response.data.lessons?.map(this.normalizeLesson) || [],
        total: response.data.total || 0
      }

    } catch (error) {
      console.error('Search courses error:', error)
      throw this.normalizeError(error, 'Ошибка при поиске')
    }
  }

  /**
   * Получение рекомендованных курсов
   * @param {number} limit - Количество курсов
   * @returns {Promise<Array>} Рекомендованные курсы
   */
  async getRecommendedCourses(limit = 6) {
    try {
      const url = `${this.endpoints.recommendations}?limit=${limit}`
      const response = await apiMethods.get(url)
      
      return response.data.map(this.normalizeCourse)

    } catch (error) {
      console.error('Get recommended courses error:', error)
      return []
    }
  }

  /**
   * Получение популярных курсов
   * @param {number} limit - Количество курсов
   * @returns {Promise<Array>} Популярные курсы
   */
  async getPopularCourses(limit = 10) {
    try {
      const url = `${this.endpoints.popular}?limit=${limit}`
      const response = await apiMethods.get(url)
      
      return response.data.map(this.normalizeCourse)

    } catch (error) {
      console.error('Get popular courses error:', error)
      return []
    }
  }

  /**
   * Получение рекомендуемых курсов
   * @param {number} limit - Количество курсов
   * @returns {Promise<Array>} Рекомендуемые курсы
   */
  async getFeaturedCourses(limit = 6) {
    try {
      const url = `${this.endpoints.featured}?limit=${limit}`
      const response = await apiMethods.get(url)
      
      return response.data.map(this.normalizeCourse)

    } catch (error) {
      console.error('Get featured courses error:', error)
      return []
    }
  }

  // === Трекинг ===

  /**
   * Трекинг просмотра курса
   * @param {string} courseId - ID курса
   */
  async trackCourseView(courseId) {
    try {
      await apiMethods.post('/analytics/course-view', {
        courseId,
        timestamp: Date.now()
      }, {
        skipNotification: true
      })
    } catch (error) {
      console.error('Track course view error:', error)
    }
  }

  /**
   * Трекинг просмотра урока
   * @param {string} lessonId - ID урока
   */
  async trackLessonView(lessonId) {
    try {
      await apiMethods.post('/analytics/lesson-view', {
        lessonId,
        timestamp: Date.now()
      }, {
        skipNotification: true
      })
    } catch (error) {
      console.error('Track lesson view error:', error)
    }
  }

  // === Нормализация данных ===

  /**
   * Нормализация данных курса
   * @private
   */
  normalizeCourse(courseData) {
    if (!courseData) return null

    return {
      id: courseData.id,
      title: courseData.title || '',
      slug: courseData.slug || '',
      description: courseData.description || '',
      shortDescription: courseData.shortDescription || '',
      gradeLevel: courseData.gradeLevel || null,
      difficultyLevel: courseData.difficultyLevel || 1,
      estimatedHours: courseData.estimatedHours || 0,
      orderIndex: courseData.orderIndex || 0,
      coverImageUrl: courseData.coverImageUrl || null,
      introVideoUrl: courseData.introVideoUrl || null,
      prerequisites: courseData.prerequisites || [],
      learningObjectives: courseData.learningObjectives || [],
      isPublished: courseData.isPublished === true,
      isFeatured: courseData.isFeatured === true,
      isPremium: courseData.isPremium === true,
      createdBy: courseData.createdBy || null,
      createdAt: courseData.createdAt ? new Date(courseData.createdAt) : null,
      updatedAt: courseData.updatedAt ? new Date(courseData.updatedAt) : null,
      publishedAt: courseData.publishedAt ? new Date(courseData.publishedAt) : null
    }
  }

  /**
   * Нормализация данных модуля
   * @private
   */
  normalizeModule(moduleData) {
    if (!moduleData) return null

    return {
      id: moduleData.id,
      courseId: moduleData.courseId,
      title: moduleData.title || '',
      description: moduleData.description || '',
      orderIndex: moduleData.orderIndex || 0,
      estimatedHours: moduleData.estimatedHours || 0,
      isPublished: moduleData.isPublished === true,
      createdAt: moduleData.createdAt ? new Date(moduleData.createdAt) : null,
      updatedAt: moduleData.updatedAt ? new Date(moduleData.updatedAt) : null
    }
  }

  /**
   * Нормализация данных урока
   * @private
   */
  normalizeLesson(lessonData) {
    if (!lessonData) return null

    return {
      id: lessonData.id,
      moduleId: lessonData.moduleId,
      title: lessonData.title || '',
      slug: lessonData.slug || '',
      description: lessonData.description || '',
      lessonType: lessonData.lessonType || 'theory',
      content: lessonData.content || {},
      orderIndex: lessonData.orderIndex || 0,
      estimatedDuration: lessonData.estimatedDuration || 30,
      xpReward: lessonData.xpReward || 50,
      difficultyLevel: lessonData.difficultyLevel || 1,
      isPublished: lessonData.isPublished === true,
      isFree: lessonData.isFree !== false,
      createdAt: lessonData.createdAt ? new Date(lessonData.createdAt) : null,
      updatedAt: lessonData.updatedAt ? new Date(lessonData.updatedAt) : null
    }
  }

  /**
   * Нормализация данных задания
   * @private
   */
  normalizeAssignment(assignmentData) {
    if (!assignmentData) return null

    return {
      id: assignmentData.id,
      lessonId: assignmentData.lessonId,
      title: assignmentData.title || '',
      description: assignmentData.description || '',
      initialCode: assignmentData.initialCode || '',
      solutionCode: assignmentData.solutionCode || null,
      starterFiles: assignmentData.starterFiles || {},
      timeLimit: assignmentData.timeLimit || 5000,
      memoryLimit: assignmentData.memoryLimit || 128,
      allowedImports: assignmentData.allowedImports || [],
      hints: assignmentData.hints || [],
      hintPenalty: assignmentData.hintPenalty || 5,
      orderIndex: assignmentData.orderIndex || 0,
      maxAttempts: assignmentData.maxAttempts || 0,
      points: assignmentData.points || 100,
      createdAt: assignmentData.createdAt ? new Date(assignmentData.createdAt) : null,
      updatedAt: assignmentData.updatedAt ? new Date(assignmentData.updatedAt) : null
    }
  }

  /**
   * Нормализация данных тест-кейса
   * @private
   */
  normalizeTestCase(testCaseData) {
    if (!testCaseData) return null

    return {
      id: testCaseData.id,
      assignmentId: testCaseData.assignmentId,
      name: testCaseData.name || '',
      inputData: testCaseData.inputData || '',
      expectedOutput: testCaseData.expectedOutput || '',
      isHidden: testCaseData.isHidden === true,
      points: testCaseData.points || 10,
      timeout: testCaseData.timeout || 1000,
      orderIndex: testCaseData.orderIndex || 0,
      customChecker: testCaseData.customChecker || null
    }
  }

  /**
   * Нормализация данных теста
   * @private
   */
  normalizeQuiz(quizData) {
    if (!quizData) return null

    return {
      id: quizData.id,
      lessonId: quizData.lessonId,
      title: quizData.title || '',
      description: quizData.description || '',
      instructions: quizData.instructions || '',
      timeLimit: quizData.timeLimit || null,
      attemptsAllowed: quizData.attemptsAllowed || 3,
      passingScore: quizData.passingScore || 70,
      shuffleQuestions: quizData.shuffleQuestions === true,
      shuffleAnswers: quizData.shuffleAnswers === true,
      questionsPerAttempt: quizData.questionsPerAttempt || null,
      showCorrectAnswers: quizData.showCorrectAnswers !== false,
      showScoreImmediately: quizData.showScoreImmediately !== false,
      showDetailedFeedback: quizData.showDetailedFeedback !== false,
      isPublished: quizData.isPublished === true,
      questions: quizData.questions?.map(this.normalizeQuizQuestion) || [],
      createdAt: quizData.createdAt ? new Date(quizData.createdAt) : null,
      updatedAt: quizData.updatedAt ? new Date(quizData.updatedAt) : null
    }
  }

  /**
   * Нормализация вопроса теста
   * @private
   */
  normalizeQuizQuestion(questionData) {
    if (!questionData) return null

    return {
      id: questionData.id,
      quizId: questionData.quizId,
      questionText: questionData.questionText || '',
      questionType: questionData.questionType || 'multiple_choice',
      answerOptions: questionData.answerOptions || [],
      correctAnswers: questionData.correctAnswers || [],
      codeSnippet: questionData.codeSnippet || null,
      explanation: questionData.explanation || '',
      hint: questionData.hint || '',
      points: questionData.points || 1,
      orderIndex: questionData.orderIndex || 0,
      difficultyLevel: questionData.difficultyLevel || 1
    }
  }

  /**
   * Нормализация результата отправки
   * @private
   */
  normalizeSubmission(submissionData) {
    if (!submissionData) return null

    return {
      id: submissionData.id,
      userId: submissionData.userId,
      assignmentId: submissionData.assignmentId,
      code: submissionData.code || '',
      language: submissionData.language || 'python',
      files: submissionData.files || {},
      status: submissionData.status || 'pending',
      executionTime: submissionData.executionTime || null,
      memoryUsed: submissionData.memoryUsed || null,
      output: submissionData.output || '',
      errorMessage: submissionData.errorMessage || '',
      testsPassed: submissionData.testsPassed || 0,
      testsTotal: submissionData.testsTotal || 0,
      testResults: submissionData.testResults || [],
      score: submissionData.score || 0,
      maxScore: submissionData.maxScore || 100,
      isFinal: submissionData.isFinal === true,
      submittedAt: submissionData.submittedAt ? new Date(submissionData.submittedAt) : null,
      judgedAt: submissionData.judgedAt ? new Date(submissionData.judgedAt) : null
    }
  }

  /**
   * Нормализация попытки теста
   * @private
   */
  normalizeQuizAttempt(attemptData) {
    if (!attemptData) return null

    return {
      id: attemptData.id,
      userId: attemptData.userId,
      quizId: attemptData.quizId,
      attemptNumber: attemptData.attemptNumber || 1,
      questions: attemptData.questions?.map(this.normalizeQuizQuestion) || [],
      startedAt: attemptData.startedAt ? new Date(attemptData.startedAt) : null,
      timeLimit: attemptData.timeLimit || null
    }
  }

  /**
   * Нормализация результата теста
   * @private
   */
  normalizeQuizResult(resultData) {
    if (!resultData) return null

    return {
      id: resultData.id,
      score: resultData.score || 0,
      maxScore: resultData.maxScore || 0,
      percentage: resultData.percentage || 0,
      questionsCorrect: resultData.questionsCorrect || 0,
      questionsTotal: resultData.questionsTotal || 0,
      timeSpent: resultData.timeSpent || 0,
      isPassed: resultData.isPassed === true,
      questionResults: resultData.questionResults || [],
      completedAt: resultData.completedAt ? new Date(resultData.completedAt) : null
    }
  }

  /**
   * Нормализация пагинации
   * @private
   */
  normalizePagination(paginationData) {
    if (!paginationData) {
      return {
        page: 1,
        limit: 12,
        total: 0,
        totalPages: 0
      }
    }

    return {
      page: paginationData.page || 1,
      limit: paginationData.limit || 12,
      total: paginationData.total || 0,
      totalPages: paginationData.totalPages || 0
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
export const coursesService = new CoursesService()
export default coursesService