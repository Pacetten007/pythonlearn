import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { apiMethods } from '@/services/api'
import { useNotifications } from '@/composables/useNotifications'

export const useCoursesStore = defineStore('courses', () => {
  // Состояние
  const courses = ref([])
  const currentCourse = ref(null)
  const lessons = ref([])
  const currentLesson = ref(null)
  const assignments = ref([])
  const modules = ref([])
  const isLoading = ref(false)
  const error = ref(null)

  // Кэш для курсов и уроков
  const coursesCache = ref(new Map())
  const lessonsCache = ref(new Map())
  const assignmentsCache = ref(new Map())

  // Фильтры и поиск
  const searchQuery = ref('')
  const filters = ref({
    grade: null,
    difficulty: null,
    type: null,
    category: null,
    featured: false,
    completed: null
  })
  const sortBy = ref('orderIndex') // orderIndex, title, difficulty, createdAt
  const sortOrder = ref('asc') // asc, desc

  // Composables
  const { showNotification } = useNotifications()

  // Геттеры
  const filteredCourses = computed(() => {
    let result = [...courses.value]

    // Поиск по названию и описанию
    if (searchQuery.value) {
      const query = searchQuery.value.toLowerCase()
      result = result.filter(course => 
        course.title.toLowerCase().includes(query) ||
        course.description?.toLowerCase().includes(query) ||
        course.shortDescription?.toLowerCase().includes(query)
      )
    }

    // Фильтр по классу
    if (filters.value.grade) {
      result = result.filter(course => course.gradeLevel === filters.value.grade)
    }

    // Фильтр по сложности
    if (filters.value.difficulty) {
      result = result.filter(course => course.difficultyLevel === filters.value.difficulty)
    }

    // Фильтр по типу
    if (filters.value.type) {
      result = result.filter(course => course.type === filters.value.type)
    }

    // Фильтр по категории
    if (filters.value.category) {
      result = result.filter(course => course.category === filters.value.category)
    }

    // Фильтр рекомендуемых
    if (filters.value.featured) {
      result = result.filter(course => course.isFeatured)
    }

    // Фильтр по завершенности
    if (filters.value.completed !== null) {
      result = result.filter(course => course.isCompleted === filters.value.completed)
    }

    // Сортировка
    result.sort((a, b) => {
      let aValue = a[sortBy.value]
      let bValue = b[sortBy.value]

      // Специальная обработка для некоторых полей
      if (sortBy.value === 'title') {
        aValue = aValue.toLowerCase()
        bValue = bValue.toLowerCase()
      }

      if (sortOrder.value === 'desc') {
        return bValue > aValue ? 1 : -1
      } else {
        return aValue > bValue ? 1 : -1
      }
    })

    return result
  })

  const coursesCount = computed(() => courses.value.length)
  const featuredCourses = computed(() => courses.value.filter(c => c.isFeatured))
  const availableGrades = computed(() => [...new Set(courses.value.map(c => c.gradeLevel))])
  const availableDifficulties = computed(() => [...new Set(courses.value.map(c => c.difficultyLevel))])

  // Действия для курсов
  const fetchCourses = async (options = {}) => {
    try {
      isLoading.value = true
      error.value = null

      const params = {
        page: options.page || 1,
        limit: options.limit || 50,
        grade: options.grade,
        featured: options.featured,
        published: true,
        ...options
      }

      const response = await apiMethods.get('/courses', { params })
      
      courses.value = response.data.courses.map(normalizeCourse)
      
      // Кэшируем курсы
      courses.value.forEach(course => {
        coursesCache.value.set(course.id, course)
      })

      return response.data

    } catch (err) {
      console.error('Ошибка загрузки курсов:', err)
      error.value = err.message || 'Ошибка загрузки курсов'
      showNotification('Ошибка загрузки курсов', 'error')
      throw err
    } finally {
      isLoading.value = false
    }
  }

  const fetchCourse = async (courseId) => {
    try {
      // Проверяем кэш
      if (coursesCache.value.has(courseId)) {
        currentCourse.value = coursesCache.value.get(courseId)
        return currentCourse.value
      }

      isLoading.value = true
      error.value = null

      const response = await apiMethods.get(`/courses/${courseId}`)
      const course = normalizeCourse(response.data)
      
      currentCourse.value = course
      coursesCache.value.set(courseId, course)

      // Обновляем в общем списке если есть
      const index = courses.value.findIndex(c => c.id === courseId)
      if (index !== -1) {
        courses.value[index] = course
      }

      return course

    } catch (err) {
      console.error('Ошибка загрузки курса:', err)
      error.value = err.message || 'Ошибка загрузки курса'
      
      if (err.response?.status === 404) {
        showNotification('Курс не найден', 'error')
      } else {
        showNotification('Ошибка загрузки курса', 'error')
      }
      
      throw err
    } finally {
      isLoading.value = false
    }
  }

  const fetchCourseModules = async (courseId) => {
    try {
      const response = await apiMethods.get(`/courses/${courseId}/modules`)
      modules.value = response.data.map(normalizeModule)
      return modules.value
    } catch (err) {
      console.error('Ошибка загрузки модулей курса:', err)
      throw err
    }
  }

  // Действия для уроков
  const fetchLessons = async (courseId, moduleId = null) => {
    try {
      isLoading.value = true
      error.value = null

      const cacheKey = `${courseId}-${moduleId || 'all'}`
      
      // Проверяем кэш
      if (lessonsCache.value.has(cacheKey)) {
        lessons.value = lessonsCache.value.get(cacheKey)
        return lessons.value
      }

      const params = moduleId ? { moduleId } : {}
      const response = await apiMethods.get(`/courses/${courseId}/lessons`, { params })
      
      const fetchedLessons = response.data.map(normalizeLesson)
      lessons.value = fetchedLessons
      
      // Кэшируем уроки
      lessonsCache.value.set(cacheKey, fetchedLessons)

      return fetchedLessons

    } catch (err) {
      console.error('Ошибка загрузки уроков:', err)
      error.value = err.message || 'Ошибка загрузки уроков'
      showNotification('Ошибка загрузки уроков', 'error')
      throw err
    } finally {
      isLoading.value = false
    }
  }

  const fetchLesson = async (lessonId) => {
    try {
      // Проверяем кэш
      if (lessonsCache.value.has(`lesson-${lessonId}`)) {
        currentLesson.value = lessonsCache.value.get(`lesson-${lessonId}`)
        return currentLesson.value
      }

      isLoading.value = true
      error.value = null

      const response = await apiMethods.get(`/lessons/${lessonId}`)
      const lesson = normalizeLesson(response.data)
      
      currentLesson.value = lesson
      lessonsCache.value.set(`lesson-${lessonId}`, lesson)

      return lesson

    } catch (err) {
      console.error('Ошибка загрузки урока:', err)
      error.value = err.message || 'Ошибка загрузки урока'
      
      if (err.response?.status === 404) {
        showNotification('Урок не найден', 'error')
      } else {
        showNotification('Ошибка загрузки урока', 'error')
      }
      
      throw err
    } finally {
      isLoading.value = false
    }
  }

  const fetchLessonAssignments = async (lessonId) => {
    try {
      // Проверяем кэш
      if (assignmentsCache.value.has(lessonId)) {
        assignments.value = assignmentsCache.value.get(lessonId)
        return assignments.value
      }

      const response = await apiMethods.get(`/lessons/${lessonId}/assignments`)
      const fetchedAssignments = response.data.map(normalizeAssignment)
      
      assignments.value = fetchedAssignments
      assignmentsCache.value.set(lessonId, fetchedAssignments)

      return fetchedAssignments

    } catch (err) {
      console.error('Ошибка загрузки заданий:', err)
      showNotification('Ошибка загрузки заданий', 'error')
      throw err
    }
  }

  // Поиск и фильтрация
  const searchCourses = (query) => {
    searchQuery.value = query
  }

  const setFilter = (key, value) => {
    filters.value[key] = value
  }

  const clearFilters = () => {
    filters.value = {
      grade: null,
      difficulty: null,
      type: null,
      category: null,
      featured: false,
      completed: null
    }
    searchQuery.value = ''
  }

  const setSorting = (field, order = 'asc') => {
    sortBy.value = field
    sortOrder.value = order
  }

  // Прогресс и навигация
  const getNextLesson = (courseId, currentLessonId) => {
    const courseLessons = lessons.value.filter(l => l.courseId === courseId)
    const currentIndex = courseLessons.findIndex(l => l.id === currentLessonId)
    
    if (currentIndex !== -1 && currentIndex < courseLessons.length - 1) {
      return courseLessons[currentIndex + 1]
    }
    
    return null
  }

  const getPreviousLesson = (courseId, currentLessonId) => {
    const courseLessons = lessons.value.filter(l => l.courseId === courseId)
    const currentIndex = courseLessons.findIndex(l => l.id === currentLessonId)
    
    if (currentIndex > 0) {
      return courseLessons[currentIndex - 1]
    }
    
    return null
  }

  const getLessonProgress = (lessonId) => {
    // Здесь можно интегрироваться с progressStore
    return 0 // Заглушка
  }

  const isCourseAvailable = (courseId, userGrade = null) => {
    const course = coursesCache.value.get(courseId)
    if (!course) return false

    // Проверяем, подходит ли курс по классу
    if (userGrade && course.gradeLevel && course.gradeLevel !== userGrade) {
      return false
    }

    // Проверяем, опубликован ли курс
    return course.isPublished
  }

  const isLessonUnlocked = (lessonId) => {
    // Логика разблокировки уроков на основе прогресса
    // Пока возвращаем true для всех
    return true
  }

  // Рекомендации
  const getRecommendedCourses = (userGrade = null, limit = 5) => {
    let recommended = [...courses.value]

    // Фильтруем по классу пользователя
    if (userGrade) {
      recommended = recommended.filter(c => c.gradeLevel === userGrade)
    }

    // Сортируем по рейтингу и популярности
    recommended.sort((a, b) => {
      // Рекомендуемые курсы выше
      if (a.isFeatured && !b.isFeatured) return -1
      if (!a.isFeatured && b.isFeatured) return 1
      
      // Сортируем по рейтингу
      return (b.rating || 0) - (a.rating || 0)
    })

    return recommended.slice(0, limit)
  }

  // Статистика
  const getCourseStats = (courseId) => {
    const course = coursesCache.value.get(courseId)
    if (!course) return null

    const courseLessons = lessons.value.filter(l => l.courseId === courseId)
    
    return {
      totalLessons: courseLessons.length,
      completedLessons: courseLessons.filter(l => l.isCompleted).length,
      estimatedHours: course.estimatedHours || 0,
      difficulty: course.difficultyLevel,
      rating: course.rating || 0
    }
  }

  // Избранное
  const toggleFavoriteCourse = async (courseId) => {
    try {
      const response = await apiMethods.post(`/courses/${courseId}/favorite`)
      
      // Обновляем в кэше
      const course = coursesCache.value.get(courseId)
      if (course) {
        course.isFavorite = response.data.isFavorite
        coursesCache.value.set(courseId, course)
      }

      // Обновляем в списке
      const index = courses.value.findIndex(c => c.id === courseId)
      if (index !== -1) {
        courses.value[index].isFavorite = response.data.isFavorite
      }

      const message = response.data.isFavorite 
        ? 'Курс добавлен в избранное' 
        : 'Курс удален из избранного'
      
      showNotification(message, 'success')
      
      return response.data.isFavorite

    } catch (err) {
      console.error('Ошибка изменения избранного:', err)
      showNotification('Ошибка при изменении избранного', 'error')
      throw err
    }
  }

  // Очистка
  const clearCache = () => {
    coursesCache.value.clear()
    lessonsCache.value.clear()
    assignmentsCache.value.clear()
  }

  const clearCurrentData = () => {
    currentCourse.value = null
    currentLesson.value = null
    lessons.value = []
    assignments.value = []
    modules.value = []
  }

  const reset = () => {
    courses.value = []
    currentCourse.value = null
    lessons.value = []
    currentLesson.value = null
    assignments.value = []
    modules.value = []
    isLoading.value = false
    error.value = null
    clearFilters()
    clearCache()
  }

  // Нормализация данных
  function normalizeCourse(rawCourse) {
    return {
      id: rawCourse.id,
      title: rawCourse.title || '',
      slug: rawCourse.slug || '',
      description: rawCourse.description || '',
      shortDescription: rawCourse.shortDescription || '',
      coverImageUrl: rawCourse.coverImageUrl || '',
      introVideoUrl: rawCourse.introVideoUrl || '',
      gradeLevel: rawCourse.gradeLevel,
      difficultyLevel: rawCourse.difficultyLevel || 1,
      estimatedHours: rawCourse.estimatedHours || 0,
      orderIndex: rawCourse.orderIndex || 0,
      isPublished: rawCourse.isPublished || false,
      isFeatured: rawCourse.isFeatured || false,
      isPremium: rawCourse.isPremium || false,
      isFavorite: rawCourse.isFavorite || false,
      isCompleted: rawCourse.isCompleted || false,
      rating: rawCourse.rating || 0,
      totalStudents: rawCourse.totalStudents || 0,
      prerequisites: rawCourse.prerequisites || [],
      learningObjectives: rawCourse.learningObjectives || [],
      createdAt: rawCourse.createdAt,
      updatedAt: rawCourse.updatedAt,
      publishedAt: rawCourse.publishedAt
    }
  }

  function normalizeModule(rawModule) {
    return {
      id: rawModule.id,
      courseId: rawModule.courseId,
      title: rawModule.title || '',
      description: rawModule.description || '',
      orderIndex: rawModule.orderIndex || 0,
      estimatedHours: rawModule.estimatedHours || 0,
      isPublished: rawModule.isPublished || false,
      createdAt: rawModule.createdAt,
      updatedAt: rawModule.updatedAt
    }
  }

  function normalizeLesson(rawLesson) {
    return {
      id: rawLesson.id,
      moduleId: rawLesson.moduleId,
      courseId: rawLesson.courseId,
      title: rawLesson.title || '',
      slug: rawLesson.slug || '',
      description: rawLesson.description || '',
      type: rawLesson.type || 'theory', // theory, practice, quiz, project, video
      content: rawLesson.content || {},
      orderIndex: rawLesson.orderIndex || 0,
      estimatedDuration: rawLesson.estimatedDuration || 30,
      xpReward: rawLesson.xpReward || 50,
      difficulty: rawLesson.difficulty || 1,
      isPublished: rawLesson.isPublished || false,
      isFree: rawLesson.isFree || true,
      isCompleted: rawLesson.isCompleted || false,
      createdAt: rawLesson.createdAt,
      updatedAt: rawLesson.updatedAt
    }
  }

  function normalizeAssignment(rawAssignment) {
    return {
      id: rawAssignment.id,
      lessonId: rawAssignment.lessonId,
      title: rawAssignment.title || '',
      description: rawAssignment.description || '',
      initialCode: rawAssignment.initialCode || '',
      solutionCode: rawAssignment.solutionCode || '',
      starterFiles: rawAssignment.starterFiles || {},
      timeLimit: rawAssignment.timeLimit || 5000,
      memoryLimit: rawAssignment.memoryLimit || 128,
      allowedImports: rawAssignment.allowedImports || [],
      hints: rawAssignment.hints || [],
      hintPenalty: rawAssignment.hintPenalty || 5,
      orderIndex: rawAssignment.orderIndex || 0,
      maxAttempts: rawAssignment.maxAttempts || 0,
      points: rawAssignment.points || 100,
      testCases: rawAssignment.testCases || [],
      requirements: rawAssignment.requirements || [],
      createdAt: rawAssignment.createdAt,
      updatedAt: rawAssignment.updatedAt
    }
  }

  return {
    // Состояние
    courses,
    currentCourse,
    lessons,
    currentLesson,
    assignments,
    modules,
    isLoading,
    error,

    // Фильтры и поиск
    searchQuery,
    filters,
    sortBy,
    sortOrder,

    // Геттеры
    filteredCourses,
    coursesCount,
    featuredCourses,
    availableGrades,
    availableDifficulties,

    // Действия
    fetchCourses,
    fetchCourse,
    fetchCourseModules,
    fetchLessons,
    fetchLesson,
    fetchLessonAssignments,

    // Поиск и фильтры
    searchCourses,
    setFilter,
    clearFilters,
    setSorting,

    // Навигация
    getNextLesson,
    getPreviousLesson,
    getLessonProgress,
    isCourseAvailable,
    isLessonUnlocked,

    // Рекомендации
    getRecommendedCourses,
    getCourseStats,

    // Избранное
    toggleFavoriteCourse,

    // Утилиты
    clearCache,
    clearCurrentData,
    reset
  }
})