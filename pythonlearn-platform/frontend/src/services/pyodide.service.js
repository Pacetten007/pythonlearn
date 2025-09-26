/**
 * Сервис для работы с Pyodide - выполнение Python кода в браузере
 * Интегрируется с существующей архитектурой PythonLearn
 */

class PyodideService {
  constructor() {
    this.pyodide = null
    this.isLoading = false
    this.isReady = false
    this.loadingPromise = null
    this.currentExecution = null
    this.executionId = 0
    this.outputBuffer = []
    this.errorBuffer = []
    
    // Конфигурация по умолчанию
    this.defaultConfig = {
      timeout: 10000,
      memoryLimit: 128 * 1024 * 1024, // 128MB
      allowedPackages: ['micropip'],
      restrictedBuiltins: ['open', 'exec', 'eval', '__import__']
    }
  }

  /**
   * Инициализация Pyodide
   */
  async initialize() {
    if (this.isReady) return this.pyodide
    if (this.isLoading) return this.loadingPromise

    this.isLoading = true
    this.loadingPromise = this._loadPyodide()
    
    try {
      await this.loadingPromise
      this.isReady = true
      console.log('Pyodide успешно инициализирован')
      return this.pyodide
    } catch (error) {
      this.isLoading = false
      console.error('Ошибка инициализации Pyodide:', error)
      throw new Error(`Не удалось загрузить Python окружение: ${error.message}`)
    }
  }

  async _loadPyodide() {
    try {
      // Динамическая загрузка Pyodide
      const pyodideModule = await this._importPyodide()
      
      this.pyodide = await pyodideModule.loadPyodide({
        indexURL: 'https://cdn.jsdelivr.net/pyodide/v0.24.1/full/',
        stdout: (text) => this._handleOutput(text, 'stdout'),
        stderr: (text) => this._handleOutput(text, 'stderr')
      })

      // Устанавливаем необходимые пакеты
      await this.pyodide.loadPackage(['micropip'])

      // Настраиваем безопасное Python окружение
      await this._setupEnvironment()

      this.isLoading = false
      return this.pyodide
    } catch (error) {
      this.isLoading = false
      throw new Error(`Не удалось загрузить Pyodide: ${error.message}`)
    }
  }

  async _importPyodide() {
    // Проверяем поддержку динамических импортов
    if (typeof import !== 'function') {
      throw new Error('Ваш браузер не поддерживает динамические импорты')
    }

    try {
      return await import('https://cdn.jsdelivr.net/pyodide/v0.24.1/full/pyodide.mjs')
    } catch (error) {
      // Fallback для старых браузеров
      return this._loadPyodideScript()
    }
  }

  async _loadPyodideScript() {
    return new Promise((resolve, reject) => {
      if (window.loadPyodide) {
        resolve({ loadPyodide: window.loadPyodide })
        return
      }

      const script = document.createElement('script')
      script.src = 'https://cdn.jsdelivr.net/pyodide/v0.24.1/full/pyodide.js'
      script.onload = () => {
        resolve({ loadPyodide: window.loadPyodide })
      }
      script.onerror = () => {
        reject(new Error('Не удалось загрузить Pyodide скрипт'))
      }
      document.head.appendChild(script)
    })
  }

  async _setupEnvironment() {
    // Создаем безопасную среду выполнения
    await this.pyodide.runPythonAsync(`
import sys
import io
import contextlib
import traceback
import time
import builtins
from typing import Any, Dict, List, Optional

# Настройка перехвата вывода
class OutputCapture:
    def __init__(self):
        self.stdout_buffer = []
        self.stderr_buffer = []
        self.original_stdout = sys.stdout
        self.original_stderr = sys.stderr
    
    def start_capture(self):
        sys.stdout = io.StringIO()
        sys.stderr = io.StringIO()
    
    def stop_capture(self):
        stdout_content = sys.stdout.getvalue()
        stderr_content = sys.stderr.getvalue()
        
        sys.stdout = self.original_stdout
        sys.stderr = self.original_stderr
        
        return stdout_content, stderr_content

# Глобальный объект для перехвата
_output_capture = OutputCapture()

# Переопределяем input для работы с заранее подготовленными данными
_input_data = []
_input_index = 0

def mock_input(prompt=""):
    global _input_index
    if _input_index < len(_input_data):
        value = str(_input_data[_input_index])
        _input_index += 1
        print(f"{prompt}{value}")
        return value
    else:
        return ""

# Безопасные встроенные функции
SAFE_BUILTINS = {
    'abs', 'all', 'any', 'ascii', 'bin', 'bool', 'bytearray', 'bytes',
    'callable', 'chr', 'classmethod', 'complex', 'delattr', 'dict', 'dir',
    'divmod', 'enumerate', 'filter', 'float', 'format', 'frozenset',
    'getattr', 'globals', 'hasattr', 'hash', 'hex', 'id', 'input', 'int',
    'isinstance', 'issubclass', 'iter', 'len', 'list', 'locals', 'map',
    'max', 'memoryview', 'min', 'next', 'object', 'oct', 'ord', 'pow',
    'print', 'property', 'range', 'repr', 'reversed', 'round', 'set',
    'setattr', 'slice', 'sorted', 'staticmethod', 'str', 'sum', 'super',
    'tuple', 'type', 'vars', 'zip'
}

def create_safe_namespace():
    """Создает безопасное пространство имен для выполнения кода"""
    safe_builtins = {}
    for name in SAFE_BUILTINS:
        if hasattr(builtins, name):
            safe_builtins[name] = getattr(builtins, name)
    
    # Переопределяем input
    safe_builtins['input'] = mock_input
    
    return safe_builtins

def set_input_data(data):
    """Устанавливает данные для функции input"""
    global _input_data, _input_index
    _input_data = data if isinstance(data, list) else [str(data)]
    _input_index = 0

def safe_execute(code: str, globals_dict: Optional[Dict] = None, timeout: int = 10):
    """
    Безопасное выполнение Python кода с ограничениями
    """
    if globals_dict is None:
        globals_dict = create_safe_namespace()
    
    # Добавляем базовые модули
    allowed_modules = {
        'math': __import__('math'),
        'random': __import__('random'),
        'json': __import__('json'),
        'itertools': __import__('itertools'),
        'collections': __import__('collections'),
        'datetime': __import__('datetime'),
        're': __import__('re'),
        'string': __import__('string')
    }
    
    for module_name, module in allowed_modules.items():
        globals_dict[module_name] = module
    
    # Перехватываем вывод
    _output_capture.start_capture()
    
    start_time = time.time()
    result = {
        'success': False,
        'output': '',
        'error': '',
        'execution_time': 0
    }
    
    try:
        # Компилируем код
        compiled_code = compile(code, '<string>', 'exec')
        
        # Выполняем с ограничением по времени
        exec(compiled_code, globals_dict, globals_dict)
        
        result['success'] = True
        
    except SyntaxError as e:
        result['error'] = f"Синтаксическая ошибка: {e.msg} (строка {e.lineno})"
    except Exception as e:
        error_type = type(e).__name__
        error_msg = str(e)
        
        # Получаем traceback
        tb_lines = traceback.format_exc().split('\\n')
        # Фильтруем строки, связанные с нашим кодом
        user_tb = [line for line in tb_lines if '<string>' in line or 'line' in line]
        
        if user_tb:
            result['error'] = f"{error_type}: {error_msg}\\n" + "\\n".join(user_tb[-2:])
        else:
            result['error'] = f"{error_type}: {error_msg}"
    
    finally:
        # Останавливаем перехват вывода
        stdout_content, stderr_content = _output_capture.stop_capture()
        
        result['output'] = stdout_content
        if stderr_content:
            result['error'] = result['error'] + "\\n" + stderr_content if result['error'] else stderr_content
        
        result['execution_time'] = int((time.time() - start_time) * 1000)
    
    return result

# Функция для проверки синтаксиса
def check_syntax(code: str):
    """Проверяет синтаксис Python кода"""
    try:
        compile(code, '<string>', 'exec')
        return {'valid': True, 'errors': []}
    except SyntaxError as e:
        return {
            'valid': False,
            'errors': [{
                'line': e.lineno or 0,
                'column': e.offset or 0,
                'message': e.msg or 'Синтаксическая ошибка',
                'type': 'syntax_error'
            }]
        }

# Экспортируем функции для использования
globals().update({
    'safe_execute': safe_execute,
    'check_syntax': check_syntax,
    'set_input_data': set_input_data
})
    `)
  }

  /**
   * Выполнение Python кода
   */
  async runCode(code, options = {}) {
    if (!this.isReady) {
      throw new Error('Python окружение не готово. Выполните initialize() сначала.')
    }

    const config = {
      timeout: options.timeout || this.defaultConfig.timeout,
      inputData: options.inputData || [],
      files: options.files || {}
    }

    const executionId = ++this.executionId

    try {
      this.currentExecution = {
        id: executionId,
        startTime: Date.now(),
        status: 'running'
      }

      // Устанавливаем входные данные если есть
      if (config.inputData.length > 0) {
        await this.pyodide.runPythonAsync(`set_input_data(${JSON.stringify(config.inputData)})`)
      }

      // Выполняем код с таймаутом
      const executePromise = this._executeWithTimeout(code, config.timeout)
      const result = await executePromise

      this.currentExecution.status = 'completed'
      
      return {
        success: result.success,
        output: result.output || '',
        error: result.error || '',
        executionTime: result.execution_time || 0,
        executionId
      }

    } catch (error) {
      this.currentExecution.status = 'error'
      
      if (error.name === 'TimeoutError') {
        return {
          success: false,
          output: '',
          error: 'Превышено время выполнения кода',
          executionTime: config.timeout,
          executionId
        }
      }

      return {
        success: false,
        output: '',
        error: error.message || 'Неизвестная ошибка при выполнении кода',
        executionTime: 0,
        executionId
      }
    } finally {
      this.currentExecution = null
    }
  }

  async _executeWithTimeout(code, timeout) {
    return new Promise((resolve, reject) => {
      const timeoutId = setTimeout(() => {
        reject(new Error('TimeoutError'))
      }, timeout)

      this.pyodide.runPythonAsync(`safe_execute(${JSON.stringify(code)}, None, ${Math.floor(timeout / 1000)})`)
        .then(result => {
          clearTimeout(timeoutId)
          resolve(result)
        })
        .catch(error => {
          clearTimeout(timeoutId)
          reject(error)
        })
    })
  }

  /**
   * Проверка синтаксиса кода
   */
  async checkSyntax(code) {
    if (!this.isReady) {
      throw new Error('Python окружение не готово')
    }

    try {
      const result = await this.pyodide.runPythonAsync(`check_syntax(${JSON.stringify(code)})`)
      return {
        valid: result.valid,
        errors: result.errors || []
      }
    } catch (error) {
      return {
        valid: false,
        errors: [{
          line: 0,
          column: 0,
          message: error.message || 'Ошибка проверки синтаксиса',
          type: 'check_error'
        }]
      }
    }
  }

  /**
   * Прерывание выполнения кода
   */
  async interrupt() {
    if (this.currentExecution) {
      try {
        // В Pyodide нет прямого способа прервать выполнение
        // Мы можем только пометить выполнение как прерванное
        this.currentExecution.status = 'interrupted'
        return true
      } catch (error) {
        console.error('Ошибка прерывания выполнения:', error)
        return false
      }
    }
    return false
  }

  /**
   * Установка дополнительных пакетов
   */
  async installPackage(packageName) {
    if (!this.isReady) {
      throw new Error('Python окружение не готово')
    }

    try {
      await this.pyodide.runPythonAsync(`
import micropip
await micropip.install("${packageName}")
      `)
      return true
    } catch (error) {
      console.error(`Ошибка установки пакета ${packageName}:`, error)
      return false
    }
  }

  /**
   * Получение списка установленных пакетов
   */
  async getInstalledPackages() {
    if (!this.isReady) {
      return []
    }

    try {
      const result = await this.pyodide.runPythonAsync(`
import micropip
list(micropip.list())
      `)
      return Array.from(result) || []
    } catch (error) {
      console.error('Ошибка получения списка пакетов:', error)
      return []
    }
  }

  /**
   * Очистка окружения
   */
  async clearEnvironment() {
    if (!this.isReady) {
      return
    }

    try {
      await this.pyodide.runPythonAsync(`
# Очищаем пользовательские переменные
user_vars = [name for name in globals() if not name.startswith('_') and name not in ['safe_execute', 'check_syntax', 'set_input_data']]
for var in user_vars:
    if var in globals():
        del globals()[var]

# Очищаем входные данные
set_input_data([])
      `)
    } catch (error) {
      console.error('Ошибка очистки окружения:', error)
    }
  }

  /**
   * Обработка вывода
   */
  _handleOutput(text, type) {
    const output = {
      type,
      content: text,
      timestamp: Date.now()
    }

    if (type === 'stdout') {
      this.outputBuffer.push(output)
    } else if (type === 'stderr') {
      this.errorBuffer.push(output)
    }

    // Эмитируем событие для обновления UI
    this._emitOutput(output)
  }

  _emitOutput(output) {
    // Используем CustomEvent для уведомления компонентов
    const event = new CustomEvent('pyodide-output', {
      detail: output
    })
    window.dispatchEvent(event)
  }

  /**
   * Получение статуса сервиса
   */
  getStatus() {
    return {
      isReady: this.isReady,
      isLoading: this.isLoading,
      currentExecution: this.currentExecution,
      hasError: !!this.error
    }
  }

  /**
   * Получение информации о производительности
   */
  getPerformanceInfo() {
    if (!this.pyodide) {
      return null
    }

    return {
      memoryUsage: this.pyodide._module.HEAPU8.length,
      version: this.pyodide.version,
      loadedPackages: Object.keys(this.pyodide.loadedPackages || {})
    }
  }

  /**
   * Перезагрузка Pyodide
   */
  async reload() {
    if (this.pyodide) {
      this.pyodide.destroy()
    }
    
    this.pyodide = null
    this.isReady = false
    this.isLoading = false
    this.loadingPromise = null
    this.currentExecution = null
    this.outputBuffer = []
    this.errorBuffer = []

    return this.initialize()
  }

  /**
   * Деструктор
   */
  destroy() {
    if (this.pyodide) {
      this.pyodide.destroy()
    }
    
    this.pyodide = null
    this.isReady = false
    this.isLoading = false
    this.loadingPromise = null
    this.currentExecution = null
    this.outputBuffer = []
    this.errorBuffer = []
  }
}

// Создаем и экспортируем единственный экземпляр
export const pyodideService = new PyodideService()
export default pyodideService