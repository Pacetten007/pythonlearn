import axios from 'axios'
import { useNotifications } from '@/composables/useNotifications'

// Создаем базовый экземпляр axios
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || '/api',
  timeout: 30000, // 30 секунд
  headers: {
    'Content-Type': 'application/json'
  }
})

// Конфигурация для разных типов запросов
const apiConfig = {
  retry: {
    maxRetries: 3,
    retryDelay: 1000, // 1 секунда
    retryCondition: (error) => {
      return error.code === 'NETWORK_ERROR' || 
             error.response?.status >= 500
    }
  },
  cache: {
    enabled: true,
    ttl: 5 * 60 * 1000 // 5 минут
  }
}

// Кэш для GET запросов
const requestCache = new Map()

// Утилиты для кэша
const getCacheKey = (config) => {
  return `${config.method}:${config.url}:${JSON.stringify(config.params || {})}`
}

const isCacheValid = (timestamp, ttl) => {
  return Date.now() - timestamp < ttl
}

// Интерсептор запросов
api.interceptors.request.use(
  (config) => {
    // Добавляем токен авторизации
    const token = localStorage.getItem('accessToken')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }

    // Добавляем уникальный ID запроса для отладки
    config.requestId = Date.now().toString(36) + Math.random().toString(36).substr(2)

    // Логируем запрос в development режиме
    if (import.meta.env.DEV) {
      console.log(`[API Request ${config.requestId}]`, {
        method: config.method.toUpperCase(),
        url: config.url,
        params: config.params,
        data: config.data
      })
    }

    // Проверяем кэш для GET запросов
    if (config.method === 'get' && apiConfig.cache.enabled && !config.skipCache) {
      const cacheKey = getCacheKey(config)
      const cached = requestCache.get(cacheKey)
      
      if (cached && isCacheValid(cached.timestamp, apiConfig.cache.ttl)) {
        // Возвращаем кешированный ответ
        return Promise.reject({
          cached: true,
          data: cached.data,
          config
        })
      }
    }

    return config
  },
  (error) => {
    console.error('Request interceptor error:', error)
    return Promise.reject(error)
  }
)

// Интерсептор ответов
api.interceptors.response.use(
  (response) => {
    const config = response.config

    // Логируем ответ в development режиме
    if (import.meta.env.DEV) {
      console.log(`[API Response ${config.requestId}]`, {
        status: response.status,
        statusText: response.statusText,
        data: response.data
      })
    }

    // Кэшируем GET запросы
    if (config.method === 'get' && apiConfig.cache.enabled && !config.skipCache) {
      const cacheKey = getCacheKey(config)
      requestCache.set(cacheKey, {
        data: response.data,
        timestamp: Date.now()
      })
    }

    return response
  },
  async (error) => {
    const config = error.config
    const { showNotification } = useNotifications()

    // Обработка кешированных ответов
    if (error.cached) {
      return Promise.resolve({
        data: error.data,
        status: 200,
        statusText: 'OK (Cached)',
        config: error.config,
        cached: true
      })
    }

    // Логируем ошибку
    if (import.meta.env.DEV) {
      console.error(`[API Error ${config?.requestId || 'unknown'}]`, {
        message: error.message,
        status: error.response?.status,
        statusText: error.response?.statusText,
        data: error.response?.data
      })
    }

    // Обработка различных типов ошибок
    if (error.response) {
      // Сервер ответил с кодом ошибки
      const { status, data } = error.response

      switch (status) {
        case 401:
          // Неавторизованный запрос
          await handleUnauthorized(error)
          break
          
        case 403:
          // Доступ запрещен
          showNotification('Доступ к ресурсу запрещен', 'error')
          break
          
        case 404:
          // Ресурс не найден
          if (!config.skipNotification) {
            showNotification('Ресурс не найден', 'error')
          }
          break
          
        case 422:
          // Ошибки валидации
          handleValidationErrors(data.errors || data.message)
          break
          
        case 429:
          // Слишком много запросов
          showNotification('Слишком много запросов. Попробуйте позже', 'warning')
          break
          
        case 500:
        case 502:
        case 503:
        case 504:
          // Серверные ошибки - пробуем повторить запрос
          if (shouldRetry(error)) {
            return retryRequest(error)
          }
          showNotification('Ошибка сервера. Попробуйте позже', 'error')
          break
          
        default:
          if (!config.skipNotification) {
            showNotification(
              data?.message || `Ошибка запроса (${status})`,
              'error'
            )
          }
      }
    } else if (error.request) {
      // Запрос был отправлен, но ответ не получен
      if (error.code === 'NETWORK_ERROR') {
        showNotification('Ошибка сети. Проверьте подключение', 'error')
      } else if (error.code === 'ECONNABORTED') {
        showNotification('Превышено время ожидания ответа', 'error')
      } else {
        showNotification('Ошибка соединения с сервером', 'error')
      }
    } else {
      // Ошибка настройки запроса
      showNotification('Ошибка запроса', 'error')
    }

    return Promise.reject(error)
  }
)

// Обработка неавторизованного доступа
async function handleUnauthorized(error) {
  const { showNotification } = useNotifications()
  
  // Пытаемся обновить токен
  const refreshToken = localStorage.getItem('refreshToken')
  
  if (refreshToken && !error.config.skipTokenRefresh) {
    try {
      const response = await api.post('/auth/refresh', 
        { refreshToken },
        { skipTokenRefresh: true }
      )
      
      const { accessToken } = response.data
      localStorage.setItem('accessToken', accessToken)
      
      // Повторяем оригинальный запрос с новым токеном
      error.config.headers.Authorization = `Bearer ${accessToken}`
      return api.request(error.config)
      
    } catch (refreshError) {
      console.error('Token refresh failed:', refreshError)
      await logout()
    }
  } else {
    await logout()
  }
}

// Выход из системы при ошибке авторизации
async function logout() {
  const { showNotification } = useNotifications()
  
  localStorage.removeItem('accessToken')
  localStorage.removeItem('refreshToken')
  localStorage.removeItem('pinia-auth')
  
  showNotification('Сессия истекла. Войдите в систему', 'warning')
  
  // Перенаправляем на страницу входа
  if (window.location.pathname !== '/login') {
    window.location.href = '/login'
  }
}

// Обработка ошибок валидации
function handleValidationErrors(errors) {
  const { showNotification } = useNotifications()
  
  if (typeof errors === 'string') {
    showNotification(errors, 'error')
    return
  }
  
  if (typeof errors === 'object') {
    Object.entries(errors).forEach(([field, messages]) => {
      const message = Array.isArray(messages) ? messages[0] : messages
      showNotification(`${field}: ${message}`, 'error')
    })
  }
}

// Логика повторных попыток
function shouldRetry(error) {
  const config = error.config
  
  if (!config || config.retry === false) {
    return false
  }
  
  const retryCount = config.__retryCount || 0
  const maxRetries = config.maxRetries || apiConfig.retry.maxRetries
  
  return retryCount < maxRetries && apiConfig.retry.retryCondition(error)
}

function retryRequest(error) {
  const config = error.config
  config.__retryCount = (config.__retryCount || 0) + 1
  
  const delay = config.retryDelay || apiConfig.retry.retryDelay
  const backoffDelay = delay * Math.pow(2, config.__retryCount - 1)
  
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve(api.request(config))
    }, backoffDelay)
  })
}

// Утилитарные функции для API
export const apiUtils = {
  // Создание FormData для загрузки файлов
  createFormData: (data) => {
    const formData = new FormData()
    
    Object.entries(data).forEach(([key, value]) => {
      if (value instanceof File || value instanceof Blob) {
        formData.append(key, value)
      } else if (Array.isArray(value)) {
        value.forEach((item, index) => {
          formData.append(`${key}[${index}]`, item)
        })
      } else if (value !== null && value !== undefined) {
        formData.append(key, String(value))
      }
    })
    
    return formData
  },

  // Создание query string из объекта
  buildQueryString: (params) => {
    const searchParams = new URLSearchParams()
    
    Object.entries(params).forEach(([key, value]) => {
      if (value !== null && value !== undefined && value !== '') {
        if (Array.isArray(value)) {
          value.forEach(item => searchParams.append(key, item))
        } else {
          searchParams.append(key, String(value))
        }
      }
    })
    
    return searchParams.toString()
  },

  // Очистка кэша
  clearCache: (pattern = null) => {
    if (pattern) {
      // Удаляем записи по паттерну
      const regex = new RegExp(pattern)
      for (const [key] of requestCache.entries()) {
        if (regex.test(key)) {
          requestCache.delete(key)
        }
      }
    } else {
      // Очищаем весь кэш
      requestCache.clear()
    }
  },

  // Получение размера кэша
  getCacheSize: () => requestCache.size,

  // Получение статистики кэша
  getCacheStats: () => {
    const entries = Array.from(requestCache.entries())
    const now = Date.now()
    const ttl = apiConfig.cache.ttl
    
    const valid = entries.filter(([, value]) => isCacheValid(value.timestamp, ttl))
    const expired = entries.filter(([, value]) => !isCacheValid(value.timestamp, ttl))
    
    return {
      total: entries.length,
      valid: valid.length,
      expired: expired.length,
      hitRate: entries.length > 0 ? (valid.length / entries.length * 100).toFixed(2) : 0
    }
  },

  // Предзагрузка данных
  preload: async (endpoints) => {
    const promises = endpoints.map(endpoint => {
      if (typeof endpoint === 'string') {
        return api.get(endpoint, { skipNotification: true })
      } else {
        const { url, method = 'get', ...config } = endpoint
        return api[method](url, config)
      }
    })
    
    try {
      await Promise.allSettled(promises)
    } catch (error) {
      console.error('Preload error:', error)
    }
  }
}

// Специализированные методы API
export const apiMethods = {
  // GET запрос с кэшированием
  get: (url, config = {}) => {
    return api.get(url, config)
  },

  // POST запрос
  post: (url, data, config = {}) => {
    return api.post(url, data, config)
  },

  // PUT запрос
  put: (url, data, config = {}) => {
    return api.put(url, data, config)
  },

  // PATCH запрос
  patch: (url, data, config = {}) => {
    return api.patch(url, data, config)
  },

  // DELETE запрос
  delete: (url, config = {}) => {
    return api.delete(url, config)
  },

  // Загрузка файла
  upload: (url, file, onProgress = null) => {
    const formData = apiUtils.createFormData({ file })
    
    return api.post(url, formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      },
      onUploadProgress: (progressEvent) => {
        if (onProgress && progressEvent.lengthComputable) {
          const percentCompleted = Math.round(
            (progressEvent.loaded * 100) / progressEvent.total
          )
          onProgress(percentCompleted)
        }
      }
    })
  },

  // Скачивание файла
  download: async (url, filename) => {
    try {
      const response = await api.get(url, {
        responseType: 'blob',
        skipNotification: true
      })
      
      const blob = response.data
      const downloadUrl = window.URL.createObjectURL(blob)
      
      const link = document.createElement('a')
      link.href = downloadUrl
      link.download = filename || 'download'
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      
      window.URL.revokeObjectURL(downloadUrl)
      
    } catch (error) {
      const { showNotification } = useNotifications()
      showNotification('Ошибка при скачивании файла', 'error')
      throw error
    }
  },

  // Пакетные запросы
  batch: async (requests) => {
    try {
      const promises = requests.map(request => {
        const { method, url, data, config } = request
        return api[method](url, data, config)
      })
      
      const results = await Promise.allSettled(promises)
      
      return results.map((result, index) => ({
        id: requests[index].id || index,
        success: result.status === 'fulfilled',
        data: result.status === 'fulfilled' ? result.value.data : null,
        error: result.status === 'rejected' ? result.reason : null
      }))
      
    } catch (error) {
      console.error('Batch request error:', error)
      throw error
    }
  },

  // Запрос с повторными попытками
  retry: (requestFn, options = {}) => {
    const { maxAttempts = 3, delay = 1000, backoff = true } = options
    
    const attempt = async (attemptNumber) => {
      try {
        return await requestFn()
      } catch (error) {
        if (attemptNumber >= maxAttempts) {
          throw error
        }
        
        const waitTime = backoff ? delay * Math.pow(2, attemptNumber) : delay
        await new Promise(resolve => setTimeout(resolve, waitTime))
        
        return attempt(attemptNumber + 1)
      }
    }
    
    return attempt(1)
  }
}

// Экспорт основного API клиента
export default api

// Экспорт конфигурации
export { apiConfig }