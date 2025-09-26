import { apiMethods } from './api'

class CodeExecutionService {
  constructor() {
    this.endpoints = {
      execute: '/code/execute',
      check: '/code/check',
      test: '/code/test',
      languages: '/code/languages',
      limits: '/code/limits',
      status: '/code/status/:id'
    }
    
    // Конфигурация по умолчанию
    this.defaultConfig = {
      language: 'python',
      version: '3.11',
      timeout: 10000, // 10 секунд
      memoryLimit: 128 * 1024 * 1024, // 128MB
      cpuLimit: 1000, // 1 секунда CPU времени
      maxOutputSize: 1024 * 1024, // 1MB вывода
      allowNetwork: false,
      allowFileSystem: false
    }
    
    // Очередь выполнения
    this.executionQueue = new Map()
    this.maxConcurrentExecutions = 3
    this.currentExecutions = 0
    
    // Кэш результатов
    this.resultCache = new Map()
    this.maxCacheSize = 50
    this.cacheTimeout = 5 * 60 * 1000 // 5 минут
  }

  /**
   * Выполнение кода на сервере
   * @param {Object} executionData - Данные для выполнения
   * @returns {Promise<Object>} Результат выполнения
   */
  async executeCode(executionData) {
    try {
      const config = this.validateAndNormalizeConfig(executionData)
      
      // Проверяем кэш
      const cacheKey = this.getCacheKey(config)
      const cached = this.getCachedResult(cacheKey)
      if (cached) {
        return { ...cached, cached: true }
      }

      // Добавляем в очередь если превышен лимит одновременных выполнений
      if (this.currentExecutions >= this.maxConcurrentExecutions) {
        return await this.queueExecution(config)
      }

      // Выполняем код
      return await this.performExecution(config, cacheKey)

    } catch (error) {
      console.error('Code execution error:', error)
      throw this.normalizeError(error)
    }
  }

  /**
   * Проверка синтаксиса кода
   * @param {Object} checkData - Код для проверки
   * @returns {Promise<Object>} Результат проверки синтаксиса
   */
  async checkSyntax(checkData) {
    try {
      const response = await apiMethods.post(this.endpoints.check, {
        code: checkData.code,
        language: checkData.language || 'python',
        files: checkData.files || {}
      })

      return this.normalizeCheckResult(response.data)

    } catch (error) {
      console.error('Syntax check error:', error)
      throw this.normalizeError(error)
    }
  }

  /**
   * Выполнение тестов для кода
   * @param {Object} testData - Код и тесты
   * @returns {Promise<Object>} Результаты тестирования
   */
  async runTests(testData) {
    try {
      const response = await apiMethods.post(this.endpoints.test, {
        code: testData.code,
        tests: testData.tests,
        language: testData.language || 'python',
        files: testData.files || {},
        timeout: testData.timeout || this.defaultConfig.timeout
      })

      return this.normalizeTestResults(response.data)

    } catch (error) {
      console.error('Test execution error:', error)
      throw this.normalizeError(error)
    }
  }

  /**
   * Получение поддерживаемых языков
   * @returns {Promise<Array>} Список языков программирования
   */
  async getSupportedLanguages() {
    try {
      const response = await apiMethods.get(this.endpoints.languages, {
        skipCache: false // Кэшируем языки
      })

      return response.data.map(this.normalizeLanguage)

    } catch (error) {
      console.error('Get languages error:', error)
      return [
        {
          id: 'python',
          name: 'Python',
          version: '3.11',
          extensions: ['.py'],
          default: true
        }
      ]
    }
  }

  /**
   * Получение лимитов выполнения
   * @returns {Promise<Object>} Лимиты ресурсов
   */
  async getExecutionLimits() {
    try {
      const response = await apiMethods.get(this.endpoints.limits)
      return this.normalizeExecutionLimits(response.data)

    } catch (error) {
      console.error('Get limits error:', error)
      return this.defaultConfig
    }
  }

  /**
   * Получение статуса выполнения по ID
   * @param {string} executionId - ID выполнения
   * @returns {Promise<Object>} Статус выполнения
   */
  async getExecutionStatus(executionId) {
    try {
      const url = this.endpoints.status.replace(':id', executionId)
      const response = await apiMethods.get(url)
      
      return this.normalizeExecutionStatus(response.data)

    } catch (error) {
      if (error.response?.status === 404) {
        return { status: 'not_found' }
      }
      console.error('Get execution status error:', error)
      throw this.normalizeError(error)
    }
  }

  /**
   * Отмена выполнения кода
   * @param {string} executionId - ID выполнения для отмены
   * @returns {Promise<boolean>} Успешность отмены
   */
  async cancelExecution(executionId) {
    try {
      const url = this.endpoints.status.replace(':id', executionId)
      await apiMethods.delete(url)
      
      // Удаляем из очереди если есть
      this.executionQueue.delete(executionId)
      
      return true

    } catch (error) {
      console.error('Cancel execution error:', error)
      return false
    }
  }

  // === Приватные методы ===

  /**
   * Валидация и нормализация конфигурации
   * @private
   */
  validateAndNormalizeConfig(executionData) {
    if (!executionData.code || typeof executionData.code !== 'string') {
      throw new Error('Код не предоставлен или имеет неверный формат')
    }

    if (executionData.code.trim().length === 0) {
      throw new Error('Код не может быть пустым')
    }

    // Проверяем размер кода
    if (executionData.code.length > 100000) { // 100KB
      throw new Error('Код слишком большой (максимум 100KB)')
    }

    // Базовая проверка безопасности
    this.performSecurityCheck(executionData.code)

    return {
      code: executionData.code,
      language: executionData.language || this.defaultConfig.language,
      files: executionData.files || {},
      timeout: Math.min(executionData.timeout || this.defaultConfig.timeout, 30000),
      memoryLimit: Math.min(
        executionData.memoryLimit || this.defaultConfig.memoryLimit,
        256 * 1024 * 1024 // Максимум 256MB
      ),
      cpuLimit: Math.min(executionData.cpuLimit || this.defaultConfig.cpuLimit, 5000),
      stdin: executionData.stdin || '',
      args: executionData.args || [],
      env: this.sanitizeEnvironment(executionData.env || {}),
      allowNetwork: false, // Всегда false в учебной среде
      allowFileSystem: executionData.allowFileSystem === true
    }
  }

  /**
   * Базовая проверка безопасности кода
   * @private
   */
  performSecurityCheck(code) {
    // Список потенциально опасных паттернов
    const dangerousPatterns = [
      /import\s+os\b/,
      /import\s+subprocess\b/,
      /import\s+sys\b.*\.exit/,
      /__import__\s*\(/,
      /eval\s*\(/,
      /exec\s*\(/,
      /open\s*\(.*['"](\/|\\|\.\.|~)/,
      /subprocess\./,
      /os\.(system|popen|execv|spawn)/,
      /socket\./,
      /urllib\.request/,
      /requests\./,
      /http\./
    ]

    // Проверяем на опасные паттерны
    for (const pattern of dangerousPatterns) {
      if (pattern.test(code)) {
        console.warn('Potentially dangerous code detected:', pattern)
        // В учебной среде мы предупреждаем, но не блокируем
        // В продакшене можно добавить более строгие проверки
      }
    }

    // Проверяем на слишком сложные конструкции
    const complexityChecks = [
      { pattern: /while\s+True\s*:/g, message: 'Обнаружен потенциально бесконечный цикл' },
      { pattern: /for.*in.*range\s*\(\s*\d{6,}\s*\)/g, message: 'Обнаружен цикл с большим количеством итераций' },
      { pattern: /def\s+\w+.*def\s+\w+.*def\s+\w+/g, message: 'Слишком много вложенных функций' }
    ]

    for (const check of complexityChecks) {
      if (check.pattern.test(code)) {
        console.info(check.message)
      }
    }
  }

  /**
   * Очистка переменных окружения
   * @private
   */
  sanitizeEnvironment(env) {
    const allowedKeys = ['PYTHONPATH', 'LANG', 'LC_ALL']
    const sanitized = {}

    for (const key of allowedKeys) {
      if (env[key] && typeof env[key] === 'string') {
        sanitized[key] = env[key].slice(0, 100) // Ограничиваем длину
      }
    }

    return sanitized
  }

  /**
   * Выполнение кода
   * @private
   */
  async performExecution(config, cacheKey) {
    this.currentExecutions++
    
    try {
      const startTime = performance.now()
      
      const response = await apiMethods.post(this.endpoints.execute, config, {
        timeout: config.timeout + 5000 // Добавляем запас для HTTP запроса
      })

      const executionTime = performance.now() - startTime
      const result = this.normalizeExecutionResult(response.data, executionTime)

      // Кэшируем результат
      this.cacheResult(cacheKey, result)

      return result

    } finally {
      this.currentExecutions--
      // Проверяем очередь
      this.processQueue()
    }
  }

  /**
   * Добавление в очередь выполнения
   * @private
   */
  async queueExecution(config) {
    return new Promise((resolve, reject) => {
      const queueId = Date.now().toString() + Math.random().toString(36).substr(2, 9)
      
      this.executionQueue.set(queueId, {
        config,
        resolve,
        reject,
        timestamp: Date.now()
      })

      // Устанавливаем тайм-аут для элемента очереди
      setTimeout(() => {
        if (this.executionQueue.has(queueId)) {
          this.executionQueue.delete(queueId)
          reject(new Error('Превышено время ожидания в очереди'))
        }
      }, 30000) // 30 секунд максимум в очереди
    })
  }

  /**
   * Обработка очереди
   * @private
   */
  async processQueue() {
    if (this.currentExecutions >= this.maxConcurrentExecutions || this.executionQueue.size === 0) {
      return
    }

    // Берем самый старый элемент из очереди
    const [queueId, queueItem] = this.executionQueue.entries().next().value
    this.executionQueue.delete(queueId)

    try {
      const cacheKey = this.getCacheKey(queueItem.config)
      const result = await this.performExecution(queueItem.config, cacheKey)
      queueItem.resolve(result)
    } catch (error) {
      queueItem.reject(error)
    }
  }

  /**
   * Получение ключа кэша
   * @private
   */
  getCacheKey(config) {
    const keyData = {
      code: config.code,
      language: config.language,
      files: config.files,
      stdin: config.stdin
    }
    
    return btoa(JSON.stringify(keyData)).replace(/[/+=]/g, '_')
  }

  /**
   * Получение результата из кэша
   * @private
   */
  getCachedResult(cacheKey) {
    const cached = this.resultCache.get(cacheKey)
    
    if (cached && (Date.now() - cached.timestamp) < this.cacheTimeout) {
      return cached.result
    }
    
    if (cached) {
      this.resultCache.delete(cacheKey)
    }
    
    return null
  }

  /**
   * Кэширование результата
   * @private
   */
  cacheResult(cacheKey, result) {
    // Кэшируем только успешные результаты
    if (result.success && result.status !== 'runtime_error') {
      if (this.resultCache.size >= this.maxCacheSize) {
        // Удаляем самый старый результат
        const oldestKey = this.resultCache.keys().next().value
        this.resultCache.delete(oldestKey)
      }

      this.resultCache.set(cacheKey, {
        result: { ...result },
        timestamp: Date.now()
      })
    }
  }

  // === Нормализация данных ===

  normalizeExecutionResult(data, clientExecutionTime) {
    return {
      success: data.success !== false,
      status: data.status || (data.success ? 'completed' : 'error'),
      output: data.output || '',
      error: data.error || '',
      stderr: data.stderr || '',
      exitCode: data.exitCode || 0,
      executionTime: data.executionTime || clientExecutionTime || 0,
      memoryUsed: data.memoryUsed || 0,
      cpuTime: data.cpuTime || 0,
      executionId: data.executionId || null
    }
  }

  normalizeCheckResult(data) {
    return {
      valid: data.valid !== false,
      errors: (data.errors || []).map(error => ({
        line: error.line || 0,
        column: error.column || 0,
        message: error.message || '',
        type: error.type || 'syntax_error'
      })),
      warnings: (data.warnings || []).map(warning => ({
        line: warning.line || 0,
        column: warning.column || 0,
        message: warning.message || '',
        type: warning.type || 'warning'
      }))
    }
  }

  normalizeTestResults(data) {
    return {
      success: data.success !== false,
      totalTests: data.totalTests || 0,
      passedTests: data.passedTests || 0,
      failedTests: data.failedTests || 0,
      executionTime: data.executionTime || 0,
      results: (data.results || []).map(result => ({
        name: result.name || '',
        status: result.status || 'unknown',
        message: result.message || '',
        expected: result.expected || '',
        actual: result.actual || '',
        executionTime: result.executionTime || 0
      }))
    }
  }

  normalizeLanguage(lang) {
    return {
      id: lang.id || lang.name?.toLowerCase(),
      name: lang.name || '',
      version: lang.version || '',
      extensions: lang.extensions || [],
      default: lang.default === true
    }
  }

  normalizeExecutionLimits(limits) {
    return {
      maxTimeout: limits.maxTimeout || 30000,
      maxMemory: limits.maxMemory || 256 * 1024 * 1024,
      maxCpuTime: limits.maxCpuTime || 5000,
      maxOutputSize: limits.maxOutputSize || 1024 * 1024,
      maxConcurrentExecutions: limits.maxConcurrentExecutions || 3
    }
  }

  normalizeExecutionStatus(status) {
    return {
      id: status.id || '',
      status: status.status || 'unknown',
      progress: Math.max(0, Math.min(100, status.progress || 0)),
      message: status.message || '',
      startedAt: status.startedAt ? new Date(status.startedAt) : null,
      completedAt: status.completedAt ? new Date(status.completedAt) : null
    }
  }

  normalizeError(error) {
    if (error.response?.data) {
      return {
        message: error.response.data.message || 'Ошибка выполнения кода',
        code: error.response.status,
        status: error.response.status
      }
    }

    return {
      message: error.message || 'Произошла неожиданная ошибка',
      code: 'NETWORK_ERROR',
      status: 0
    }
  }

  // === Публичные утилиты ===

  clearCache() {
    this.resultCache.clear()
  }

  getStats() {
    return {
      cacheSize: this.resultCache.size,
      queueSize: this.executionQueue.size,
      currentExecutions: this.currentExecutions,
      maxConcurrentExecutions: this.maxConcurrentExecutions
    }
  }

  async healthCheck() {
    try {
      const response = await apiMethods.get('/code/health', {
        timeout: 5000,
        skipNotification: true
      })
      
      return {
        available: true,
        responseTime: response.headers['x-response-time'] || 0,
        version: response.data.version || 'unknown'
      }
    } catch (error) {
      return {
        available: false,
        error: error.message
      }
    }
  }

  reset() {
    this.executionQueue.clear()
    this.resultCache.clear()
    this.currentExecutions = 0
  }
}

// Создаем и экспортируем единственный экземпляр
export const codeExecutionService = new CodeExecutionService()
export default codeExecutionService