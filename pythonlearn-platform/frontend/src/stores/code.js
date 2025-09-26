import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { pyodideService } from '@/services/pyodide.service'
import { codeExecutionService } from '@/services/code-execution.service'
import { useNotifications } from '@/composables/useNotifications'

export const useCodeStore = defineStore('code', () => {
  // Состояние Pyodide
  const pyodideLoaded = ref(false)
  const pyodideLoading = ref(false)
  const pyodideError = ref(null)

  // Код и файлы
  const currentCode = ref('')
  const files = ref({}) // { filename: content }
  const activeFile = ref('main.py')
  const savedCode = ref({}) // Автосохранение по assignmentId

  // Выполнение кода
  const isRunning = ref(false)
  const executionOutput = ref('')
  const executionError = ref('')
  const executionTime = ref(0)
  const memoryUsage = ref(0)

  // Тестирование
  const testResults = ref([])
  const isRunningTests = ref(false)
  const testsPassed = ref(0)
  const testsTotal = ref(0)
  const testScore = ref(0)

  // История выполнения
  const executionHistory = ref([])
  const maxHistorySize = ref(50)

  // Настройки редактора
  const editorSettings = ref({
    theme: 'vs-dark',
    fontSize: 14,
    tabSize: 4,
    insertSpaces: true,
    wordWrap: 'on',
    lineNumbers: true,
    minimap: false,
    folding: true,
    bracketMatching: 'always',
    autoClosingBrackets: 'always',
    autoIndent: 'full'
  })

  // Подсказки и автодополнение
  const hintsAvailable = ref([])
  const currentHint = ref(null)
  const hintsUsed = ref(0)
  const showHints = ref(true)

  // Состояние ошибок
  const syntaxErrors = ref([])
  const runtimeErrors = ref([])

  // Конфигурация выполнения
  const executionConfig = ref({
    timeout: 10000, // 10 секунд
    memoryLimit: 128 * 1024 * 1024, // 128MB
    allowedModules: [
      'sys', 'math', 'random', 'json', 'itertools', 
      'collections', 'datetime', 're', 'string'
    ]
  })

  // Утилиты
  const { showNotification } = useNotifications()

  // Геттеры
  const hasCode = computed(() => currentCode.value.trim().length > 0)
  const hasOutput = computed(() => executionOutput.value.length > 0)
  const hasError = computed(() => executionError.value.length > 0)
  const canRun = computed(() => pyodideLoaded.value && hasCode.value && !isRunning.value)
  
  const testPassRate = computed(() => {
    if (testsTotal.value === 0) return 0
    return Math.round((testsPassed.value / testsTotal.value) * 100)
  })

  const executionStatus = computed(() => {
    if (isRunning.value) return 'running'
    if (hasError.value) return 'error'
    if (hasOutput.value) return 'success'
    return 'ready'
  })

  const currentFileContent = computed(() => {
    return files.value[activeFile.value] || currentCode.value
  })

  const allFiles = computed(() => {
    const result = { ...files.value }
    if (activeFile.value && !result[activeFile.value]) {
      result[activeFile.value] = currentCode.value
    }
    return result
  })

  // Действия для Pyodide
  const initializePyodide = async () => {
    if (pyodideLoaded.value || pyodideLoading.value) {
      return pyodideLoaded.value
    }

    try {
      pyodideLoading.value = true
      pyodideError.value = null

      showNotification('Загружаем Python окружение...', 'info', { duration: 2000 })
      
      await pyodideService.initialize()
      pyodideLoaded.value = true
      
      showNotification('Python окружение готово!', 'success')
      
      return true

    } catch (error) {
      console.error('Ошибка инициализации Pyodide:', error)
      pyodideError.value = error.message || 'Ошибка загрузки Python окружения'
      showNotification('Ошибка загрузки Python окружения', 'error')
      return false
    } finally {
      pyodideLoading.value = false
    }
  }

  const reloadPyodide = async () => {
    pyodideLoaded.value = false
    pyodideError.value = null
    clearExecution()
    return await initializePyodide()
  }

  // Действия для кода
  const setCode = (code) => {
    currentCode.value = code
    clearErrors()
  }

  const updateFile = (filename, content) => {
    files.value[filename] = content
    if (filename === activeFile.value) {
      currentCode.value = content
    }
  }

  const setActiveFile = (filename) => {
    // Сохраняем текущий код перед переключением
    if (activeFile.value) {
      files.value[activeFile.value] = currentCode.value
    }
    
    activeFile.value = filename
    currentCode.value = files.value[filename] || ''
  }

  const createFile = (filename, content = '') => {
    files.value[filename] = content
    setActiveFile(filename)
  }

  const deleteFile = (filename) => {
    if (filename === 'main.py') {
      showNotification('Нельзя удалить основной файл', 'warning')
      return false
    }

    delete files.value[filename]
    
    if (filename === activeFile.value) {
      setActiveFile('main.py')
    }
    
    return true
  }

  const renameFile = (oldName, newName) => {
    if (oldName === 'main.py') {
      showNotification('Нельзя переименовать основной файл', 'warning')
      return false
    }

    if (files.value[newName]) {
      showNotification('Файл с таким именем уже существует', 'warning')
      return false
    }

    files.value[newName] = files.value[oldName]
    delete files.value[oldName]
    
    if (oldName === activeFile.value) {
      activeFile.value = newName
    }
    
    return true
  }

  // Автосохранение
  const autoSave = (assignmentId) => {
    if (assignmentId && currentCode.value) {
      savedCode.value[assignmentId] = {
        code: currentCode.value,
        files: { ...files.value },
        timestamp: Date.now()
      }
      localStorage.setItem(`code-${assignmentId}`, JSON.stringify(savedCode.value[assignmentId]))
    }
  }

  const loadSavedCode = (assignmentId) => {
    try {
      const saved = localStorage.getItem(`code-${assignmentId}`)
      if (saved) {
        const data = JSON.parse(saved)
        setCode(data.code || '')
        files.value = data.files || {}
        return true
      }
    } catch (error) {
      console.error('Ошибка загрузки сохраненного кода:', error)
    }
    return false
  }

  const clearSavedCode = (assignmentId) => {
    if (assignmentId) {
      delete savedCode.value[assignmentId]
      localStorage.removeItem(`code-${assignmentId}`)
    }
  }

  // Выполнение кода
  const runCode = async (code = null, useServer = false) => {
    const codeToRun = code || currentCode.value

    if (!codeToRun.trim()) {
      showNotification('Введите код для выполнения', 'warning')
      return
    }

    try {
      isRunning.value = true
      executionOutput.value = ''
      executionError.value = ''
      clearErrors()

      const startTime = performance.now()

      let result
      if (useServer) {
        // Выполнение на сервере для сложных задач
        result = await codeExecutionService.executeCode({
          code: codeToRun,
          files: allFiles.value,
          language: 'python',
          timeout: executionConfig.value.timeout,
          memoryLimit: executionConfig.value.memoryLimit
        })
      } else {
        // Выполнение в браузере через Pyodide
        if (!pyodideLoaded.value) {
          throw new Error('Python окружение не загружено')
        }

        result = await pyodideService.runCode(codeToRun, {
          timeout: executionConfig.value.timeout,
          allowedModules: executionConfig.value.allowedModules
        })
      }

      const endTime = performance.now()
      executionTime.value = Math.round(endTime - startTime)

      if (result.success) {
        executionOutput.value = result.output || 'Код выполнен успешно'
        memoryUsage.value = result.memoryUsage || 0
      } else {
        executionError.value = result.error || 'Неизвестная ошибка'
        
        // Парсим ошибки для подсветки в редакторе
        parseErrors(result.error, result.traceback)
      }

      // Добавляем в историю
      addToHistory({
        code: codeToRun,
        output: result.output,
        error: result.error,
        executionTime: executionTime.value,
        timestamp: new Date().toISOString(),
        success: result.success
      })

    } catch (error) {
      console.error('Ошибка выполнения кода:', error)
      executionError.value = error.message || 'Ошибка при выполнении кода'
      showNotification('Ошибка выполнения кода', 'error')
    } finally {
      isRunning.value = false
    }
  }

  const stopExecution = async () => {
    if (!isRunning.value) return

    try {
      await pyodideService.interrupt()
      isRunning.value = false
      executionError.value = 'Выполнение прервано пользователем'
      showNotification('Выполнение остановлено', 'info')
    } catch (error) {
      console.error('Ошибка остановки выполнения:', error)
    }
  }

  // Тестирование
  const runTests = async (testCases = []) => {
    if (!testCases.length) {
      showNotification('Нет тестов для выполнения', 'warning')
      return
    }

    try {
      isRunningTests.value = true
      testResults.value = []
      testsPassed.value = 0
      testsTotal.value = testCases.length

      for (const testCase of testCases) {
        const result = await runSingleTest(testCase)
        testResults.value.push(result)
        
        if (result.passed) {
          testsPassed.value++
        }
      }

      // Подсчитываем общий балл
      testScore.value = testsTotal.value > 0 
        ? Math.round((testsPassed.value / testsTotal.value) * 100) 
        : 0

      const message = `Тесты: ${testsPassed.value}/${testsTotal.value} (${testPassRate.value}%)`
      
      if (testsPassed.value === testsTotal.value) {
        showNotification(`✅ Все тесты пройдены! ${message}`, 'success')
      } else {
        showNotification(`⚠️ ${message}`, 'warning')
      }

    } catch (error) {
      console.error('Ошибка выполнения тестов:', error)
      showNotification('Ошибка при выполнении тестов', 'error')
    } finally {
      isRunningTests.value = false
    }
  }

  const runSingleTest = async (testCase) => {
    try {
      const testCode = `
# Пользовательский код
${currentCode.value}

# Тестовые данные
${testCase.inputData || ''}

# Выполнение и проверка
import sys
from io import StringIO

old_stdout = sys.stdout
sys.stdout = StringIO()

try:
    ${testCase.testCode || 'pass'}
    output = sys.stdout.getvalue().strip()
finally:
    sys.stdout = old_stdout

print(output)
`

      const result = await pyodideService.runCode(testCode, {
        timeout: testCase.timeout || 5000
      })

      if (!result.success) {
        return {
          name: testCase.name,
          passed: false,
          expected: testCase.expectedOutput,
          actual: '',
          error: result.error,
          points: 0,
          maxPoints: testCase.points || 10
        }
      }

      const actualOutput = result.output?.trim() || ''
      const expectedOutput = testCase.expectedOutput?.trim() || ''
      const passed = actualOutput === expectedOutput

      return {
        name: testCase.name,
        passed,
        expected: expectedOutput,
        actual: actualOutput,
        error: passed ? null : 'Вывод не соответствует ожидаемому',
        points: passed ? (testCase.points || 10) : 0,
        maxPoints: testCase.points || 10,
        hidden: testCase.isHidden || false
      }

    } catch (error) {
      return {
        name: testCase.name,
        passed: false,
        expected: testCase.expectedOutput,
        actual: '',
        error: error.message,
        points: 0,
        maxPoints: testCase.points || 10
      }
    }
  }

  // Подсказки
  const loadHints = (hints = []) => {
    hintsAvailable.value = hints
    currentHint.value = null
    hintsUsed.value = 0
  }

  const getNextHint = () => {
    if (hintsUsed.value < hintsAvailable.value.length) {
      currentHint.value = hintsAvailable.value[hintsUsed.value]
      hintsUsed.value++
      return currentHint.value
    }
    return null
  }

  const showHint = () => {
    const hint = getNextHint()
    if (hint) {
      showNotification(`💡 Подсказка: ${hint}`, 'info', { 
        duration: 10000 
      })
    } else {
      showNotification('Больше подсказок нет', 'warning')
    }
  }

  // Обработка ошибок
  const parseErrors = (errorMessage, traceback) => {
    syntaxErrors.value = []
    runtimeErrors.value = []

    if (!errorMessage) return

    // Простой парсер ошибок Python
    const lines = errorMessage.split('\n')
    
    for (const line of lines) {
      // Синтаксические ошибки
      const syntaxMatch = line.match(/File ".*", line (\d+)/)
      if (syntaxMatch) {
        const lineNumber = parseInt(syntaxMatch[1]) - 1
        syntaxErrors.value.push({
          line: lineNumber,
          message: errorMessage,
          type: 'syntax'
        })
      }
    }

    // Если есть traceback, парсим runtime ошибки
    if (traceback) {
      const tracebackLines = traceback.split('\n')
      for (const line of tracebackLines) {
        const match = line.match(/line (\d+)/)
        if (match) {
          const lineNumber = parseInt(match[1]) - 1
          runtimeErrors.value.push({
            line: lineNumber,
            message: line,
            type: 'runtime'
          })
        }
      }
    }
  }

  const clearErrors = () => {
    syntaxErrors.value = []
    runtimeErrors.value = []
  }

  // История выполнения
  const addToHistory = (execution) => {
    executionHistory.value.unshift(execution)
    
    // Ограничиваем размер истории
    if (executionHistory.value.length > maxHistorySize.value) {
      executionHistory.value = executionHistory.value.slice(0, maxHistorySize.value)
    }
  }

  const clearHistory = () => {
    executionHistory.value = []
  }

  const getHistoryItem = (index) => {
    return executionHistory.value[index] || null
  }

  const restoreFromHistory = (index) => {
    const item = getHistoryItem(index)
    if (item) {
      setCode(item.code)
      showNotification('Код восстановлен из истории', 'success')
    }
  }

  // Настройки редактора
  const updateEditorSetting = (key, value) => {
    if (editorSettings.value.hasOwnProperty(key)) {
      editorSettings.value[key] = value
      localStorage.setItem('editorSettings', JSON.stringify(editorSettings.value))
    }
  }

  const loadEditorSettings = () => {
    try {
      const saved = localStorage.getItem('editorSettings')
      if (saved) {
        const settings = JSON.parse(saved)
        editorSettings.value = { ...editorSettings.value, ...settings }
      }
    } catch (error) {
      console.error('Ошибка загрузки настроек редактора:', error)
    }
  }

  const resetEditorSettings = () => {
    editorSettings.value = {
      theme: 'vs-dark',
      fontSize: 14,
      tabSize: 4,
      insertSpaces: true,
      wordWrap: 'on',
      lineNumbers: true,
      minimap: false,
      folding: true,
      bracketMatching: 'always',
      autoClosingBrackets: 'always',
      autoIndent: 'full'
    }
    localStorage.setItem('editorSettings', JSON.stringify(editorSettings.value))
  }

  // Очистка состояния
  const clearExecution = () => {
    executionOutput.value = ''
    executionError.value = ''
    executionTime.value = 0
    memoryUsage.value = 0
    clearErrors()
  }

  const clearAll = () => {
    currentCode.value = ''
    files.value = {}
    activeFile.value = 'main.py'
    clearExecution()
    testResults.value = []
    testsPassed.value = 0
    testsTotal.value = 0
    testScore.value = 0
    hintsUsed.value = 0
    currentHint.value = null
  }

  const reset = () => {
    clearAll()
    clearHistory()
    savedCode.value = {}
  }

  return {
    // Состояние Pyodide
    pyodideLoaded,
    pyodideLoading,
    pyodideError,
    
    // Код и файлы
    currentCode,
    files,
    activeFile,
    savedCode,
    
    // Выполнение
    isRunning,
    executionOutput,
    executionError,
    executionTime,
    memoryUsage,
    
    // Тестирование
    testResults,
    isRunningTests,
    testsPassed,
    testsTotal,
    testScore,
    
    // История и настройки
    executionHistory,
    maxHistorySize,
    editorSettings,
    
    // Подсказки
    hintsAvailable,
    currentHint,
    hintsUsed,
    showHints,
    
    // Ошибки
    syntaxErrors,
    runtimeErrors,
    
    // Конфигурация
    executionConfig,
    
    // Геттеры
    hasCode,
    hasOutput,
    hasError,
    canRun,
    testPassRate,
    executionStatus,
    currentFileContent,
    allFiles,
    
    // Действия
    initializePyodide,
    reloadPyodide,
    setCode,
    updateFile,
    setActiveFile,
    createFile,
    deleteFile,
    renameFile,
    autoSave,
    loadSavedCode,
    clearSavedCode,
    runCode,
    stopExecution,
    runTests,
    runSingleTest,
    loadHints,
    getNextHint,
    showHint,
    parseErrors,
    clearErrors,
    addToHistory,
    clearHistory,
    getHistoryItem,
    restoreFromHistory,
    updateEditorSetting,
    loadEditorSettings,
    resetEditorSettings,
    clearExecution,
    clearAll,
    reset
  }
})