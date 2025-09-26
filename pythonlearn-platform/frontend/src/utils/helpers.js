/**
 * Утилиты и вспомогательные функции
 */

// Генерация уникального ID
export const generateId = (prefix = 'id') => {
  const timestamp = Date.now().toString(36)
  const randomStr = Math.random().toString(36).substring(2, 8)
  return `${prefix}-${timestamp}-${randomStr}`
}

// Дебаунс функция
export const debounce = (func, wait) => {
  let timeout
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout)
      func(...args)
    }
    clearTimeout(timeout)
    timeout = setTimeout(later, wait)
  }
}

// Тротлинг функция
export const throttle = (func, limit) => {
  let inThrottle
  return function executedFunction(...args) {
    if (!inThrottle) {
      func.apply(this, args)
      inThrottle = true
      setTimeout(() => inThrottle = false, limit)
    }
  }
}

// Форматирование даты
export const formatDate = (date, options = {}) => {
  if (!date) return ''
  
  const defaultOptions = {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  }
  
  return new Intl.DateTimeFormat('ru-RU', { ...defaultOptions, ...options }).format(new Date(date))
}

// Форматирование времени
export const formatTime = (date) => {
  if (!date) return ''
  return new Intl.DateTimeFormat('ru-RU', {
    hour: '2-digit',
    minute: '2-digit'
  }).format(new Date(date))
}

// Форматирование относительного времени
export const formatRelativeTime = (date) => {
  if (!date) return ''
  
  const now = new Date()
  const past = new Date(date)
  const diffInSeconds = Math.floor((now - past) / 1000)
  
  if (diffInSeconds < 60) return 'только что'
  if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)} мин назад`
  if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)} ч назад`
  if (diffInSeconds < 604800) return `${Math.floor(diffInSeconds / 86400)} дн назад`
  
  return formatDate(date)
}

// Форматирование длительности
export const formatDuration = (seconds) => {
  if (!seconds || seconds < 0) return '0 сек'
  
  const hours = Math.floor(seconds / 3600)
  const minutes = Math.floor((seconds % 3600) / 60)
  const secs = seconds % 60
  
  if (hours > 0) {
    return `${hours}ч ${minutes}м`
  } else if (minutes > 0) {
    return `${minutes}м ${secs}с`
  } else {
    return `${secs}с`
  }
}

// Форматирование размера файла
export const formatFileSize = (bytes) => {
  if (bytes === 0) return '0 Б'
  
  const sizes = ['Б', 'КБ', 'МБ', 'ГБ', 'ТБ']
  const i = Math.floor(Math.log(bytes) / Math.log(1024))
  
  return Math.round(bytes / Math.pow(1024, i) * 100) / 100 + ' ' + sizes[i]
}

// Форматирование чисел
export const formatNumber = (num, options = {}) => {
  if (num === null || num === undefined) return ''
  
  if (num >= 1000000) {
    return (num / 1000000).toFixed(1) + 'М'
  } else if (num >= 1000) {
    return (num / 1000).toFixed(1) + 'К'
  }
  
  return new Intl.NumberFormat('ru-RU', options).format(num)
}

// Валидация email
export const isValidEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email)
}

// Валидация пароля
export const validatePassword = (password) => {
  const minLength = 8
  const hasUpperCase = /[A-Z]/.test(password)
  const hasLowerCase = /[a-z]/.test(password)
  const hasNumbers = /\d/.test(password)
  const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(password)
  
  return {
    isValid: password.length >= minLength && hasUpperCase && hasLowerCase && hasNumbers,
    checks: {
      minLength: password.length >= minLength,
      hasUpperCase,
      hasLowerCase,
      hasNumbers,
      hasSpecialChar
    }
  }
}

// Капитализация первой буквы
export const capitalize = (str) => {
  if (!str) return ''
  return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase()
}

// Усечение текста
export const truncate = (text, length = 100, suffix = '...') => {
  if (!text || text.length <= length) return text
  return text.substring(0, length).trim() + suffix
}

// Слагификация (создание URL-friendly строки)
export const slugify = (text) => {
  if (!text) return ''
  
  const cyrillicMap = {
    'а': 'a', 'б': 'b', 'в': 'v', 'г': 'g', 'д': 'd', 'е': 'e', 'ё': 'e',
    'ж': 'zh', 'з': 'z', 'и': 'i', 'й': 'y', 'к': 'k', 'л': 'l', 'м': 'm',
    'н': 'n', 'о': 'o', 'п': 'p', 'р': 'r', 'с': 's', 'т': 't', 'у': 'u',
    'ф': 'f', 'х': 'kh', 'ц': 'ts', 'ч': 'ch', 'ш': 'sh', 'щ': 'shch',
    'ъ': '', 'ы': 'y', 'ь': '', 'э': 'e', 'ю': 'yu', 'я': 'ya'
  }
  
  return text
    .toLowerCase()
    .split('')
    .map(char => cyrillicMap[char] || char)
    .join('')
    .replace(/[^a-z0-9]/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '')
}

// Глубокое копирование объекта
export const deepClone = (obj) => {
  if (obj === null || typeof obj !== 'object') return obj
  if (obj instanceof Date) return new Date(obj.getTime())
  if (obj instanceof Array) return obj.map(item => deepClone(item))
  if (typeof obj === 'object') {
    const clonedObj = {}
    for (const key in obj) {
      if (obj.hasOwnProperty(key)) {
        clonedObj[key] = deepClone(obj[key])
      }
    }
    return clonedObj
  }
}

// Проверка равенства объектов
export const isEqual = (obj1, obj2) => {
  if (obj1 === obj2) return true
  if (obj1 == null || obj2 == null) return false
  if (typeof obj1 !== typeof obj2) return false
  
  if (typeof obj1 === 'object') {
    const keys1 = Object.keys(obj1)
    const keys2 = Object.keys(obj2)
    
    if (keys1.length !== keys2.length) return false
    
    for (const key of keys1) {
      if (!keys2.includes(key) || !isEqual(obj1[key], obj2[key])) {
        return false
      }
    }
    return true
  }
  
  return false
}

// Группировка массива по ключу
export const groupBy = (array, key) => {
  return array.reduce((groups, item) => {
    const group = item[key]
    groups[group] = groups[group] || []
    groups[group].push(item)
    return groups
  }, {})
}

// Сортировка массива объектов
export const sortBy = (array, key, order = 'asc') => {
  return [...array].sort((a, b) => {
    const aVal = a[key]
    const bVal = b[key]
    
    if (aVal < bVal) return order === 'asc' ? -1 : 1
    if (aVal > bVal) return order === 'asc' ? 1 : -1
    return 0
  })
}

// Удаление дубликатов из массива
export const unique = (array, key = null) => {
  if (key) {
    const seen = new Set()
    return array.filter(item => {
      const val = item[key]
      if (seen.has(val)) return false
      seen.add(val)
      return true
    })
  }
  return [...new Set(array)]
}

// Получение случайного элемента из массива
export const randomItem = (array) => {
  if (!array || array.length === 0) return null
  return array[Math.floor(Math.random() * array.length)]
}

// Перемешивание массива
export const shuffle = (array) => {
  const shuffled = [...array]
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]]
  }
  return shuffled
}

// Разбивка массива на чанки
export const chunk = (array, size) => {
  const chunks = []
  for (let i = 0; i < array.length; i += size) {
    chunks.push(array.slice(i, i + size))
  }
  return chunks
}

// Плоское представление вложенного массива
export const flatten = (array, depth = 1) => {
  return depth > 0
    ? array.reduce((acc, val) => 
        acc.concat(Array.isArray(val) ? flatten(val, depth - 1) : val), [])
    : array.slice()
}

// Получение значения по пути в объекте
export const get = (obj, path, defaultValue = undefined) => {
  const keys = path.split('.')
  let result = obj
  
  for (const key of keys) {
    if (result == null || typeof result !== 'object') {
      return defaultValue
    }
    result = result[key]
  }
  
  return result !== undefined ? result : defaultValue
}

// Установка значения по пути в объекте
export const set = (obj, path, value) => {
  const keys = path.split('.')
  let current = obj
  
  for (let i = 0; i < keys.length - 1; i++) {
    const key = keys[i]
    if (!(key in current) || typeof current[key] !== 'object') {
      current[key] = {}
    }
    current = current[key]
  }
  
  current[keys[keys.length - 1]] = value
  return obj
}

// Проверка на пустое значение
export const isEmpty = (value) => {
  if (value == null) return true
  if (typeof value === 'string') return value.trim() === ''
  if (Array.isArray(value)) return value.length === 0
  if (typeof value === 'object') return Object.keys(value).length === 0
  return false
}

// Копирование текста в буфер обмена
export const copyToClipboard = async (text) => {
  try {
    await navigator.clipboard.writeText(text)
    return true
  } catch (error) {
    // Fallback для старых браузеров
    const textArea = document.createElement('textarea')
    textArea.value = text
    textArea.style.position = 'fixed'
    textArea.style.opacity = '0'
    document.body.appendChild(textArea)
    textArea.focus()
    textArea.select()
    
    try {
      const successful = document.execCommand('copy')
      document.body.removeChild(textArea)
      return successful
    } catch (error) {
      document.body.removeChild(textArea)
      return false
    }
  }
}

// Определение типа устройства
export const getDeviceType = () => {
  const width = window.innerWidth
  
  if (width < 768) return 'mobile'
  if (width < 1024) return 'tablet'
  return 'desktop'
}

// Проверка поддержки функции браузером
export const isSupported = (feature) => {
  const features = {
    localStorage: () => typeof Storage !== 'undefined',
    webGL: () => {
      try {
        const canvas = document.createElement('canvas')
        return !!(window.WebGLRenderingContext && canvas.getContext('webgl'))
      } catch {
        return false
      }
    },
    serviceWorker: () => 'serviceWorker' in navigator,
    notification: () => 'Notification' in window,
    geolocation: () => 'geolocation' in navigator,
    webRTC: () => !!(navigator.mediaDevices && navigator.mediaDevices.getUserMedia)
  }
  
  return features[feature] ? features[feature]() : false
}

// Ожидание выполнения условия
export const waitFor = (condition, timeout = 5000, interval = 100) => {
  return new Promise((resolve, reject) => {
    const startTime = Date.now()
    
    const check = () => {
      if (condition()) {
        resolve()
      } else if (Date.now() - startTime >= timeout) {
        reject(new Error('Timeout waiting for condition'))
      } else {
        setTimeout(check, interval)
      }
    }
    
    check()
  })
}

// Промис с таймаутом
export const withTimeout = (promise, timeout) => {
  return Promise.race([
    promise,
    new Promise((_, reject) => 
      setTimeout(() => reject(new Error('Operation timed out')), timeout)
    )
  ])
}

// Повторная попытка выполнения функции
export const retry = async (fn, maxAttempts = 3, delay = 1000) => {
  let lastError
  
  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      return await fn()
    } catch (error) {
      lastError = error
      
      if (attempt === maxAttempts) {
        throw lastError
      }
      
      await new Promise(resolve => setTimeout(resolve, delay * attempt))
    }
  }
}

// Создание безопасного URL для blob
export const createBlobUrl = (data, type = 'application/octet-stream') => {
  const blob = new Blob([data], { type })
  return URL.createObjectURL(blob)
}

// Скачивание файла
export const downloadFile = (data, filename, type = 'application/octet-stream') => {
  const blob = new Blob([data], { type })
  const url = URL.createObjectURL(blob)
  
  const link = document.createElement('a')
  link.href = url
  link.download = filename
  link.style.display = 'none'
  
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  
  URL.revokeObjectURL(url)
}

// Кодирование/декодирование base64
export const base64 = {
  encode: (str) => btoa(unescape(encodeURIComponent(str))),
  decode: (str) => decodeURIComponent(escape(atob(str)))
}

// Работа с URL параметрами
export const urlParams = {
  get: (name) => new URLSearchParams(window.location.search).get(name),
  set: (name, value) => {
    const url = new URL(window.location)
    url.searchParams.set(name, value)
    window.history.replaceState({}, '', url)
  },
  remove: (name) => {
    const url = new URL(window.location)
    url.searchParams.delete(name)
    window.history.replaceState({}, '', url)
  },
  getAll: () => Object.fromEntries(new URLSearchParams(window.location.search))
}