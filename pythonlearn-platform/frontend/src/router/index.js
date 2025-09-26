import { createRouter, createWebHistory } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { useUIStore } from '@/stores/ui'

// Импорт страниц
const HomePage = () => import('@/views/HomePage.vue')
const LoginView = () => import('@/views/LoginView.vue')
const RegisterView = () => import('@/views/RegisterView.vue')
const DashboardView = () => import('@/views/DashboardView.vue')
const CourseView = () => import('@/views/CourseView.vue')
const LessonView = () => import('@/views/LessonView.vue')
const QuizView = () => import('@/views/QuizView.vue')
const ProfileView = () => import('@/views/ProfileView.vue')
const ProgressView = () => import('@/views/ProgressView.vue')
const NotFoundView = () => import('@/views/NotFoundView.vue')

const routes = [
  // Главная страница
  {
    path: '/',
    name: 'home',
    component: HomePage,
    meta: {
      title: 'PythonLearn - Изучай Python интерактивно',
      description: 'Современная платформа для изучения Python с интерактивными уроками',
      requiresAuth: false,
      transition: 'fade'
    }
  },

  // Аутентификация
  {
    path: '/login',
    name: 'login',
    component: LoginView,
    meta: {
      title: 'Вход в систему',
      requiresAuth: false,
      guestOnly: true,
      transition: 'slide-up'
    }
  },
  {
    path: '/register',
    name: 'register', 
    component: RegisterView,
    meta: {
      title: 'Регистрация',
      requiresAuth: false,
      guestOnly: true,
      transition: 'slide-up'
    }
  },

  // Дашборд пользователя
  {
    path: '/dashboard',
    name: 'dashboard',
    component: DashboardView,
    meta: {
      title: 'Мой дашборд',
      requiresAuth: true,
      transition: 'fade'
    }
  },

  // Курсы
  {
    path: '/courses',
    name: 'courses',
    component: () => import('@/views/CoursesView.vue'),
    meta: {
      title: 'Курсы',
      requiresAuth: true,
      transition: 'slide-left'
    }
  },
  {
    path: '/courses/:courseId',
    name: 'course',
    component: CourseView,
    props: true,
    meta: {
      title: 'Курс',
      requiresAuth: true,
      transition: 'slide-left'
    }
  },

  // Уроки
  {
    path: '/courses/:courseId/lessons/:lessonId',
    name: 'lesson',
    component: LessonView,
    props: true,
    meta: {
      title: 'Урок',
      requiresAuth: true,
      transition: 'slide-left',
      fullscreen: true // Поддержка полноэкранного режима
    }
  },

  // Тесты и викторины
  {
    path: '/courses/:courseId/lessons/:lessonId/quiz',
    name: 'quiz',
    component: QuizView,
    props: true,
    meta: {
      title: 'Тест',
      requiresAuth: true,
      transition: 'slide-left',
      fullscreen: true
    }
  },
  {
    path: '/quizzes/:quizId',
    name: 'standalone-quiz',
    component: QuizView,
    props: true,
    meta: {
      title: 'Викторина',
      requiresAuth: true,
      transition: 'slide-left'
    }
  },

  // Профиль и прогресс
  {
    path: '/profile',
    name: 'profile',
    component: ProfileView,
    meta: {
      title: 'Мой профиль',
      requiresAuth: true,
      transition: 'slide-up'
    }
  },
  {
    path: '/progress',
    name: 'progress',
    component: ProgressView,
    meta: {
      title: 'Мой прогресс',
      requiresAuth: true,
      transition: 'slide-up'
    }
  },

  // Достижения
  {
    path: '/achievements',
    name: 'achievements',
    component: () => import('@/views/AchievementsView.vue'),
    meta: {
      title: 'Достижения',
      requiresAuth: true,
      transition: 'slide-up'
    }
  },

  // Рейтинги и лидерборды
  {
    path: '/leaderboard',
    name: 'leaderboard',
    component: () => import('@/views/LeaderboardView.vue'),
    meta: {
      title: 'Рейтинг',
      requiresAuth: true,
      transition: 'slide-left'
    }
  },

  // Настройки
  {
    path: '/settings',
    name: 'settings',
    component: () => import('@/views/SettingsView.vue'),
    meta: {
      title: 'Настройки',
      requiresAuth: true,
      transition: 'slide-up'
    }
  },

  // Помощь и документация
  {
    path: '/help',
    name: 'help',
    component: () => import('@/views/HelpView.vue'),
    meta: {
      title: 'Справка',
      requiresAuth: false,
      transition: 'fade'
    }
  },
  {
    path: '/docs',
    name: 'documentation',
    component: () => import('@/views/DocumentationView.vue'),
    meta: {
      title: 'Документация',
      requiresAuth: false,
      transition: 'fade'
    }
  },

  // Проекты (будущая функциональность)
  {
    path: '/projects',
    name: 'projects',
    component: () => import('@/views/ProjectsView.vue'),
    meta: {
      title: 'Мои проекты',
      requiresAuth: true,
      transition: 'slide-left'
    }
  },
  {
    path: '/projects/:projectId',
    name: 'project',
    component: () => import('@/views/ProjectView.vue'),
    props: true,
    meta: {
      title: 'Проект',
      requiresAuth: true,
      transition: 'slide-left',
      fullscreen: true
    }
  },

  // Админские маршруты
  {
    path: '/admin',
    name: 'admin',
    component: () => import('@/views/admin/AdminDashboard.vue'),
    meta: {
      title: 'Админ панель',
      requiresAuth: true,
      requiresRole: 'admin',
      transition: 'fade'
    },
    children: [
      {
        path: 'users',
        name: 'admin-users',
        component: () => import('@/views/admin/UsersManagement.vue'),
        meta: {
          title: 'Управление пользователями',
          requiresAuth: true,
          requiresRole: 'admin'
        }
      },
      {
        path: 'courses',
        name: 'admin-courses',
        component: () => import('@/views/admin/CoursesManagement.vue'),
        meta: {
          title: 'Управление курсами',
          requiresAuth: true,
          requiresRole: 'admin'
        }
      },
      {
        path: 'analytics',
        name: 'admin-analytics',
        component: () => import('@/views/admin/Analytics.vue'),
        meta: {
          title: 'Аналитика',
          requiresAuth: true,
          requiresRole: 'admin'
        }
      }
    ]
  },

  // Редиректы для совместимости
  {
    path: '/course/:courseId',
    redirect: to => `/courses/${to.params.courseId}`
  },
  {
    path: '/lesson/:lessonId',
    redirect: to => {
      // Попытаемся определить courseId из контекста или перенаправим на курсы
      return '/courses'
    }
  },

  // 404 страница
  {
    path: '/404',
    name: 'not-found',
    component: NotFoundView,
    meta: {
      title: 'Страница не найдена',
      requiresAuth: false,
      transition: 'fade'
    }
  },
  {
    path: '/:pathMatch(.*)*',
    redirect: '/404'
  }
]

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes,
  scrollBehavior(to, from, savedPosition) {
    // Возвращаемся к сохраненной позиции при навигации назад
    if (savedPosition) {
      return savedPosition
    }
    
    // Прокручиваем к якорю если есть hash
    if (to.hash) {
      return {
        el: to.hash,
        behavior: 'smooth'
      }
    }
    
    // Для новых страниц прокручиваем вверх
    return { top: 0, behavior: 'smooth' }
  }
})

// Глобальные guards
router.beforeEach(async (to, from, next) => {
  const authStore = useAuthStore()
  const uiStore = useUIStore()
  
  // Показываем индикатор загрузки для больших переходов
  if (to.name !== from.name) {
    uiStore.setLoading(true)
  }
  
  // Проверяем аутентификацию
  if (!authStore.isInitialized) {
    await authStore.initialize()
  }
  
  // Проверка доступа для защищенных маршрутов
  if (to.meta.requiresAuth && !authStore.isAuthenticated) {
    uiStore.setLoading(false)
    next({
      name: 'login',
      query: { redirect: to.fullPath }
    })
    return
  }
  
  // Проверка доступа только для гостей
  if (to.meta.guestOnly && authStore.isAuthenticated) {
    uiStore.setLoading(false)
    next({ name: 'dashboard' })
    return
  }
  
  // Проверка ролей
  if (to.meta.requiresRole) {
    const userRole = authStore.user?.role
    const requiredRole = to.meta.requiresRole
    
    if (userRole !== requiredRole) {
      uiStore.setLoading(false)
      next({ name: 'dashboard' })
      return
    }
  }
  
  // Проверка прав доступа к курсу/уроку
  if (to.name === 'lesson' || to.name === 'course') {
    const hasAccess = await checkCourseAccess(to.params, authStore.user)
    if (!hasAccess) {
      uiStore.setLoading(false)
      next({ name: 'courses' })
      return
    }
  }
  
  next()
})

router.afterEach((to, from) => {
  const uiStore = useUIStore()
  
  // Скрываем индикатор загрузки
  uiStore.setLoading(false)
  
  // Обновляем заголовок страницы
  if (to.meta.title) {
    document.title = `${to.meta.title} | PythonLearn`
  } else {
    document.title = 'PythonLearn - Изучай Python интерактивно'
  }
  
  // Обновляем meta описание
  if (to.meta.description) {
    updateMetaDescription(to.meta.description)
  }
  
  // Логируем навигацию в development
  if (import.meta.env.DEV) {
    console.log(`Навигация: ${from.name || '/'} → ${to.name || '/'}`)
  }
  
  // Отправляем событие для аналитики (в production)
  if (import.meta.env.PROD && window.gtag) {
    window.gtag('config', 'GA_TRACKING_ID', {
      page_title: to.meta.title,
      page_location: window.location.href
    })
  }
})

// Обработка ошибок навигации
router.onError((error) => {
  console.error('Ошибка навигации:', error)
  
  const uiStore = useUIStore()
  uiStore.setLoading(false)
  
  // В зависимости от типа ошибки можем перенаправить на соответствующую страницу
  if (error.message.includes('Failed to fetch')) {
    // Ошибка сети - показываем уведомление
    // Можно добавить retry логику
  }
})

// Вспомогательные функции
async function checkCourseAccess(params, user) {
  // Проверяем доступ к курсу/уроку
  // Можно проверить подписку, прогресс, права доступа
  try {
    if (!user) return false
    
    // Здесь можно добавить логику проверки:
    // - Есть ли доступ к курсу
    // - Открыт ли урок (зависит от прогресса)
    // - Активна ли подписка для premium контента
    
    return true // Пока разрешаем всем авторизованным
  } catch (error) {
    console.error('Ошибка проверки доступа:', error)
    return false
  }
}

function updateMetaDescription(description) {
  let metaDescription = document.querySelector('meta[name="description"]')
  
  if (!metaDescription) {
    metaDescription = document.createElement('meta')
    metaDescription.name = 'description'
    document.head.appendChild(metaDescription)
  }
  
  metaDescription.content = description
}

// Программные методы навигации
export const navigation = {
  // Навигация к курсу
  toCourse(courseId) {
    return router.push({ name: 'course', params: { courseId } })
  },
  
  // Навигация к уроку
  toLesson(courseId, lessonId) {
    return router.push({ 
      name: 'lesson', 
      params: { courseId, lessonId } 
    })
  },
  
  // Навигация к тесту
  toQuiz(courseId, lessonId) {
    return router.push({
      name: 'quiz',
      params: { courseId, lessonId }
    })
  },
  
  // Навигация назад с fallback
  goBack(fallback = { name: 'dashboard' }) {
    if (window.history.length > 1) {
      router.back()
    } else {
      router.push(fallback)
    }
  },
  
  // Навигация с подтверждением (для несохраненных изменений)
  async navigateWithConfirmation(to, message = 'У вас есть несохраненные изменения. Продолжить?') {
    if (window.confirm(message)) {
      return router.push(to)
    }
  }
}

// Middleware для lazy loading
export const lazyMiddleware = {
  // Предзагрузка маршрутов
  preloadRoute(routeName) {
    const route = routes.find(r => r.name === routeName)
    if (route && typeof route.component === 'function') {
      route.component()
    }
  },
  
  // Предзагрузка критичных маршрутов
  preloadCriticalRoutes() {
    const criticalRoutes = ['dashboard', 'courses', 'lesson']
    criticalRoutes.forEach(this.preloadRoute)
  }
}

// Предзагружаем критичные маршруты через некоторое время после загрузки
setTimeout(() => {
  lazyMiddleware.preloadCriticalRoutes()
}, 2000)

export default router
export { routes }