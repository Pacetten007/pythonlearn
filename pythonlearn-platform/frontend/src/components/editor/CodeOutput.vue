<template>
  <div class="code-output">
    <div class="output-header">
      <div class="output-tabs">
        <button
          v-for="tab in tabs"
          :key="tab.id"
          @click="activeTab = tab.id"
          :class="['tab', { active: activeTab === tab.id }]"
        >
          <component :is="tab.icon" class="w-4 h-4" />
          {{ tab.label }}
          <BaseBadge
            v-if="tab.count > 0"
            :variant="tab.variant"
            size="sm"
            class="tab-badge"
          >
            {{ tab.count }}
          </BaseBadge>
        </button>
      </div>
      
      <div class="output-actions">
        <BaseButton
          @click="clearOutput"
          variant="ghost"
          size="sm"
          class="clear-button"
        >
          <IconTrash class="w-4 h-4" />
        </BaseButton>
        
        <BaseButton
          @click="copyOutput"
          variant="ghost"
          size="sm"
          class="copy-button"
        >
          <IconCopy class="w-4 h-4" />
        </BaseButton>
        
        <BaseButton
          @click="downloadOutput"
          variant="ghost"
          size="sm"
          class="download-button"
        >
          <IconDownload class="w-4 h-4" />
        </BaseButton>
      </div>
    </div>

    <div class="output-content">
      <!-- Консольный вывод -->
      <div v-if="activeTab === 'console'" class="console-output">
        <div v-if="consoleLines.length === 0" class="empty-state">
          <IconTerminal class="w-12 h-12 text-muted" />
          <p class="text-secondary">Вывод программы появится здесь</p>
        </div>
        
        <div v-else class="console-lines">
          <div
            v-for="(line, index) in consoleLines"
            :key="index"
            :class="['console-line', `type-${line.type}`]"
          >
            <span class="line-number">{{ index + 1 }}</span>
            <span class="line-timestamp">{{ formatTime(line.timestamp) }}</span>
            <span class="line-content">{{ line.content }}</span>
          </div>
        </div>
      </div>

      <!-- Ошибки -->
      <div v-else-if="activeTab === 'errors'" class="errors-output">
        <div v-if="errorsList.length === 0" class="empty-state">
          <IconCheckCircle class="w-12 h-12 text-success" />
          <p class="text-secondary">Ошибок нет</p>
        </div>
        
        <div v-else class="errors-list">
          <div
            v-for="(error, index) in errorsList"
            :key="index"
            class="error-item"
          >
            <div class="error-header">
              <BaseBadge :variant="getErrorVariant(error.type)" size="sm">
                {{ error.type }}
              </BaseBadge>
              <span v-if="error.line" class="error-location">
                Строка {{ error.line }}{{ error.column ? `, колонка ${error.column}` : '' }}
              </span>
            </div>
            
            <div class="error-message">{{ error.message }}</div>
            
            <div v-if="error.suggestion" class="error-suggestion">
              <IconHelpCircle class="w-4 h-4" />
              <span>{{ error.suggestion }}</span>
            </div>
            
            <div v-if="error.traceback" class="error-traceback">
              <details>
                <summary>Полная трассировка</summary>
                <pre><code>{{ error.traceback }}</code></pre>
              </details>
            </div>
          </div>
        </div>
      </div>

      <!-- Результаты тестов -->
      <div v-else-if="activeTab === 'tests'" class="tests-output">
        <div v-if="testResults.length === 0" class="empty-state">
          <IconCheckCircle class="w-12 h-12 text-muted" />
          <p class="text-secondary">Запустите тесты для проверки решения</p>
        </div>
        
        <div v-else class="tests-container">
          <!-- Общая статистика -->
          <div class="tests-summary">
            <div class="summary-header">
              <h3>Результаты тестирования</h3>
              <div class="summary-stats">
                <BaseBadge variant="success" size="lg">
                  {{ passedTests }}/{{ totalTests }} пройдено
                </BaseBadge>
                <BaseBadge 
                  :variant="passRate === 100 ? 'success' : 'warning'" 
                  size="lg"
                >
                  {{ passRate }}%
                </BaseBadge>
              </div>
            </div>
            
            <BaseProgressBar
              :value="passRate"
              :max="100"
              :variant="passRate === 100 ? 'success' : 'warning'"
              class="progress-bar"
            />
          </div>

          <!-- Список тестов -->
          <div class="tests-list">
            <div
              v-for="(test, index) in testResults"
              :key="index"
              :class="['test-item', test.status]"
            >
              <div class="test-header">
                <div class="test-status">
                  <IconCheckCircle v-if="test.status === 'passed'" class="w-5 h-5 text-success" />
                  <IconXCircle v-else-if="test.status === 'failed'" class="w-5 h-5 text-error" />
                  <IconClock v-else-if="test.status === 'timeout'" class="w-5 h-5 text-warning" />
                  <IconAlertTriangle v-else class="w-5 h-5 text-warning" />
                </div>
                
                <div class="test-info">
                  <span class="test-name">{{ test.name || `Тест ${index + 1}` }}</span>
                  <span class="test-meta">
                    {{ test.duration }}мс
                    <span v-if="test.points" class="test-points">
                      • {{ test.points }}/{{ test.maxPoints }} баллов
                    </span>
                  </span>
                </div>
                
                <BaseButton
                  v-if="test.status === 'failed'"
                  @click="toggleTestDetails(index)"
                  variant="ghost"
                  size="sm"
                  class="toggle-details"
                >
                  <IconChevronDown 
                    :class="['w-4 h-4', { 'rotate-180': expandedTests.includes(index) }]" 
                  />
                </BaseButton>
              </div>

              <!-- Детали провального теста -->
              <div 
                v-if="test.status === 'failed' && expandedTests.includes(index)"
                class="test-details"
              >
                <div class="test-comparison">
                  <div class="expected">
                    <label>Ожидаемый результат:</label>
                    <pre><code>{{ test.expected }}</code></pre>
                  </div>
                  
                  <div class="actual">
                    <label>Фактический результат:</label>
                    <pre><code>{{ test.actual }}</code></pre>
                  </div>
                </div>
                
                <div v-if="test.input" class="test-input">
                  <label>Входные данные:</label>
                  <pre><code>{{ test.input }}</code></pre>
                </div>
                
                <div v-if="test.error" class="test-error">
                  <label>Ошибка:</label>
                  <p class="error-text">{{ test.error }}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Производительность -->
      <div v-else-if="activeTab === 'performance'" class="performance-output">
        <div class="performance-metrics">
          <div class="metric-card">
            <IconClock class="w-6 h-6 text-primary" />
            <div class="metric-info">
              <span class="metric-value">{{ executionTime }}мс</span>
              <span class="metric-label">Время выполнения</span>
            </div>
          </div>
          
          <div class="metric-card">
            <IconZap class="w-6 h-6 text-warning" />
            <div class="metric-info">
              <span class="metric-value">{{ formatMemory(memoryUsage) }}</span>
              <span class="metric-label">Память</span>
            </div>
          </div>
          
          <div class="metric-card">
            <IconFileText class="w-6 h-6 text-secondary" />
            <div class="metric-info">
              <span class="metric-value">{{ codeLines }}</span>
              <span class="metric-label">Строк кода</span>
            </div>
          </div>
          
          <div class="metric-card">
            <IconTrendingUp class="w-6 h-6 text-success" />
            <div class="metric-info">
              <span class="metric-value">{{ complexity }}</span>
              <span class="metric-label">Сложность</span>
            </div>
          </div>
        </div>
        
        <!-- График производительности (если есть история) -->
        <div v-if="performanceHistory.length > 1" class="performance-chart">
          <h4>История выполнения</h4>
          <div class="chart-placeholder">
            <!-- Здесь можно добавить график с vue-chartjs -->
            <p class="text-secondary">График производительности</p>
          </div>
        </div>
      </div>
    </div>

    <!-- Статус бар -->
    <div class="status-bar">
      <div class="status-left">
        <span v-if="isRunning" class="status-item running">
          <BaseSpinner size="sm" />
          Выполняется...
        </span>
        <span v-else-if="lastExecutionStatus" class="status-item">
          {{ getStatusText(lastExecutionStatus) }}
        </span>
      </div>
      
      <div class="status-right">
        <span class="status-item">
          {{ totalLines }} строк
        </span>
        <span v-if="selectedText" class="status-item">
          Выделено: {{ selectedText.length }} символов
        </span>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import { storeToRefs } from 'pinia'
import { useCodeStore } from '@/stores/code'
import { useNotifications } from '@/composables/useNotifications'

// Props
const props = defineProps({
  height: {
    type: String,
    default: '300px'
  }
})

// Stores
const codeStore = useCodeStore()
const { showNotification } = useNotifications()

// Store refs
const {
  isRunning,
  executionOutput,
  executionError,
  executionTime,
  memoryUsage,
  testResults,
  testsPassed,
  testsTotal,
  currentCode
} = storeToRefs(codeStore)

// Локальное состояние
const activeTab = ref('console')
const expandedTests = ref([])
const consoleLines = ref([])
const errorsList = ref([])
const performanceHistory = ref([])
const lastExecutionStatus = ref(null)
const selectedText = ref('')

// Вычисляемые свойства
const tabs = computed(() => [
  {
    id: 'console',
    label: 'Консоль',
    icon: 'IconTerminal',
    count: consoleLines.value.length,
    variant: 'secondary'
  },
  {
    id: 'errors',
    label: 'Ошибки',
    icon: 'IconAlertTriangle',
    count: errorsList.value.length,
    variant: 'error'
  },
  {
    id: 'tests',
    label: 'Тесты',
    icon: 'IconCheckCircle',
    count: testResults.value.length,
    variant: passRate.value === 100 ? 'success' : 'warning'
  },
  {
    id: 'performance',
    label: 'Производительность',
    icon: 'IconZap',
    count: 0,
    variant: 'secondary'
  }
])

const passedTests = computed(() => testsPassed.value)
const totalTests = computed(() => testsTotal.value)
const passRate = computed(() => {
  if (totalTests.value === 0) return 0
  return Math.round((passedTests.value / totalTests.value) * 100)
})

const totalLines = computed(() => {
  return consoleLines.value.length
})

const codeLines = computed(() => {
  return currentCode.value.split('\n').length
})

const complexity = computed(() => {
  // Простая оценка сложности на основе ключевых слов
  const keywords = ['if', 'for', 'while', 'def', 'class', 'try']
  const code = currentCode.value.toLowerCase()
  let complexity = 1
  
  keywords.forEach(keyword => {
    const matches = code.match(new RegExp(`\\b${keyword}\\b`, 'g'))
    if (matches) complexity += matches.length
  })
  
  return complexity
})

// Методы
const formatTime = (timestamp) => {
  return new Date(timestamp).toLocaleTimeString('ru-RU', {
    hour12: false,
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit'
  })
}

const formatMemory = (bytes) => {
  if (bytes === 0) return '0 B'
  const k = 1024
  const sizes = ['B', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
}

const getErrorVariant = (type) => {
  const variantMap = {
    'SyntaxError': 'error',
    'RuntimeError': 'error', 
    'TypeError': 'warning',
    'NameError': 'warning',
    'ValueError': 'warning',
    'IndexError': 'warning',
    'KeyError': 'warning'
  }
  return variantMap[type] || 'error'
}

const getStatusText = (status) => {
  const statusMap = {
    'success': 'Выполнено успешно',
    'error': 'Выполнено с ошибками',
    'timeout': 'Превышено время выполнения',
    'cancelled': 'Отменено пользователем'
  }
  return statusMap[status] || status
}

const toggleTestDetails = (index) => {
  const pos = expandedTests.value.indexOf(index)
  if (pos === -1) {
    expandedTests.value.push(index)
  } else {
    expandedTests.value.splice(pos, 1)
  }
}

const clearOutput = () => {
  consoleLines.value = []
  errorsList.value = []
  expandedTests.value = []
  codeStore.clearExecution()
  showNotification('Вывод очищен', 'info')
}

const copyOutput = async () => {
  let content = ''
  
  if (activeTab.value === 'console') {
    content = consoleLines.value.map(line => line.content).join('\n')
  } else if (activeTab.value === 'errors') {
    content = errorsList.value.map(error => `${error.type}: ${error.message}`).join('\n')
  } else if (activeTab.value === 'tests') {
    content = testResults.value.map(test => 
      `${test.name}: ${test.status} (${test.duration}мс)`
    ).join('\n')
  }
  
  try {
    await navigator.clipboard.writeText(content)
    showNotification('Вывод скопирован в буфер обмена', 'success')
  } catch (error) {
    showNotification('Не удалось скопировать', 'error')
  }
}

const downloadOutput = () => {
  let content = ''
  let filename = 'output.txt'
  
  if (activeTab.value === 'console') {
    content = consoleLines.value.map(line => 
      `[${formatTime(line.timestamp)}] ${line.content}`
    ).join('\n')
    filename = 'console-output.txt'
  } else if (activeTab.value === 'errors') {
    content = errorsList.value.map(error => 
      `${error.type} (строка ${error.line}): ${error.message}`
    ).join('\n\n')
    filename = 'errors.txt'
  } else if (activeTab.value === 'tests') {
    content = `Результаты тестирования\nПройдено: ${passedTests.value}/${totalTests.value} (${passRate.value}%)\n\n`
    content += testResults.value.map(test => 
      `${test.name}: ${test.status}\nВремя: ${test.duration}мс\n${test.status === 'failed' ? `Ожидалось: ${test.expected}\nПолучено: ${test.actual}\n` : ''}`
    ).join('\n')
    filename = 'test-results.txt'
  }
  
  const blob = new Blob([content], { type: 'text/plain' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  URL.revokeObjectURL(url)
}

// Отслеживание изменений в store
watch(executionOutput, (newOutput) => {
  if (newOutput) {
    consoleLines.value.push({
      type: 'stdout',
      content: newOutput,
      timestamp: Date.now()
    })
    
    // Автоматически переключаемся на консоль при новом выводе
    if (activeTab.value !== 'console') {
      activeTab.value = 'console'
    }
    
    lastExecutionStatus.value = 'success'
  }
})

watch(executionError, (newError) => {
  if (newError) {
    // Парсим ошибку
    const error = parseError(newError)
    errorsList.value.push(error)
    
    // Автоматически переключаемся на ошибки
    activeTab.value = 'errors'
    lastExecutionStatus.value = 'error'
  }
})

watch(testResults, (newResults) => {
  if (newResults.length > 0) {
    // Автоматически переключаемся на тесты
    activeTab.value = 'tests'
  }
})

watch(executionTime, (newTime) => {
  if (newTime > 0) {
    performanceHistory.value.push({
      timestamp: Date.now(),
      time: newTime,
      memory: memoryUsage.value,
      lines: codeLines.value
    })
    
    // Ограничиваем историю последними 50 записями
    if (performanceHistory.value.length > 50) {
      performanceHistory.value = performanceHistory.value.slice(-50)
    }
  }
})

// Парсинг ошибок Python
function parseError(errorText) {
  const lines = errorText.split('\n')
  let errorType = 'Error'
  let message = errorText
  let line = null
  let suggestion = null
  
  // Ищем тип ошибки
  const errorMatch = errorText.match(/(\w+Error|SyntaxError): (.+)/)
  if (errorMatch) {
    errorType = errorMatch[1]
    message = errorMatch[2]
  }
  
  // Ищем номер строки
  const lineMatch = errorText.match(/line (\d+)/)
  if (lineMatch) {
    line = parseInt(lineMatch[1])
  }
  
  // Добавляем подсказки для распространенных ошибок
  if (errorType === 'NameError') {
    suggestion = 'Проверьте правильность написания переменной или импортируйте необходимый модуль'
  } else if (errorType === 'SyntaxError') {
    suggestion = 'Проверьте синтаксис: скобки, двоеточия, отступы'
  } else if (errorType === 'IndentationError') {
    suggestion = 'Проверьте отступы в коде - используйте одинаковое количество пробелов'
  } else if (errorType === 'TypeError') {
    suggestion = 'Проверьте типы данных и соответствие аргументов функции'
  }
  
  return {
    type: errorType,
    message,
    line,
    suggestion,
    traceback: errorText,
    timestamp: Date.now()
  }
}
</script>

<style scoped>
.code-output {
  display: flex;
  flex-direction: column;
  height: v-bind(height);
  background: var(--bg-secondary);
  border-radius: var(--radius-lg);
  overflow: hidden;
}

.output-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  background: var(--bg-tertiary);
  border-bottom: 1px solid var(--border-primary);
}

.output-tabs {
  display: flex;
}

.tab {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem 1rem;
  background: transparent;
  border: none;
  color: var(--text-secondary);
  cursor: pointer;
  font-size: var(--text-sm);
  border-bottom: 2px solid transparent;
  transition: all var(--transition-fast);
}

.tab:hover {
  background: var(--bg-hover);
  color: var(--text-primary);
}

.tab.active {
  color: var(--accent-primary);
  border-bottom-color: var(--accent-primary);
  background: var(--bg-secondary);
}

.tab-badge {
  margin-left: 0.25rem;
}

.output-actions {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem;
}

.output-content {
  flex: 1;
  overflow-y: auto;
  padding: 1rem;
}

.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 200px;
  gap: 1rem;
  text-align: center;
}

.console-lines {
  font-family: var(--font-code);
  font-size: var(--text-sm);
}

.console-line {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.25rem 0;
  border-radius: var(--radius-sm);
}

.console-line:hover {
  background: var(--bg-hover);
}

.line-number {
  color: var(--text-muted);
  font-size: var(--text-xs);
  min-width: 2rem;
  text-align: right;
}

.line-timestamp {
  color: var(--text-muted);
  font-size: var(--text-xs);
  min-width: 5rem;
}

.line-content {
  flex: 1;
  white-space: pre-wrap;
  word-break: break-word;
}

.console-line.type-stderr .line-content {
  color: var(--accent-error);
}

.errors-list {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.error-item {
  padding: 1rem;
  background: var(--bg-tertiary);
  border-radius: var(--radius-lg);
  border-left: 4px solid var(--accent-error);
}

.error-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 0.5rem;
}

.error-location {
  font-size: var(--text-xs);
  color: var(--text-secondary);
}

.error-message {
  font-family: var(--font-code);
  font-size: var(--text-sm);
  margin-bottom: 0.5rem;
  color: var(--text-primary);
}

.error-suggestion {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem;
  background: var(--bg-primary);
  border-radius: var(--radius-md);
  color: var(--accent-primary);
  font-size: var(--text-sm);
  margin-top: 0.5rem;
}

.error-traceback {
  margin-top: 0.5rem;
}

.error-traceback summary {
  cursor: pointer;
  color: var(--text-secondary);
  font-size: var(--text-sm);
  margin-bottom: 0.5rem;
}

.error-traceback pre {
  background: var(--bg-primary);
  border: 1px solid var(--border-primary);
  border-radius: var(--radius-sm);
  padding: 0.5rem;
  font-size: var(--text-xs);
  overflow-x: auto;
}

.tests-summary {
  margin-bottom: 1.5rem;
}

.summary-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
}

.summary-stats {
  display: flex;
  gap: 0.75rem;
}

.progress-bar {
  height: 8px;
}

.tests-list {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.test-item {
  background: var(--bg-tertiary);
  border-radius: var(--radius-lg);
  border-left: 4px solid var(--border-primary);
  overflow: hidden;
}

.test-item.passed {
  border-left-color: var(--accent-success);
}

.test-item.failed {
  border-left-color: var(--accent-error);
}

.test-item.timeout {
  border-left-color: var(--accent-warning);
}

.test-header {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 1rem;
}

.test-info {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.test-name {
  font-weight: 500;
  color: var(--text-primary);
}

.test-meta {
  font-size: var(--text-xs);
  color: var(--text-secondary);
}

.test-points {
  color: var(--accent-primary);
}

.toggle-details {
  transition: transform var(--transition-fast);
}

.rotate-180 {
  transform: rotate(180deg);
}

.test-details {
  padding: 1rem;
  border-top: 1px solid var(--border-primary);
  background: var(--bg-secondary);
}

.test-comparison {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1rem;
  margin-bottom: 1rem;
}

.expected,
.actual,
.test-input,
.test-error {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.expected label,
.actual label,
.test-input label,
.test-error label {
  font-size: var(--text-sm);
  font-weight: 500;
  color: var(--text-secondary);
}

.expected pre,
.actual pre,
.test-input pre {
  background: var(--bg-tertiary);
  border: 1px solid var(--border-primary);
  border-radius: var(--radius-sm);
  padding: 0.5rem;
  font-family: var(--font-code);
  font-size: var(--text-xs);
  overflow-x: auto;
}

.error-text {
  color: var(--accent-error);
  font-size: var(--text-sm);
}

.performance-metrics {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1rem;
  margin-bottom: 2rem;
}

.metric-card {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 1rem;
  background: var(--bg-tertiary);
  border-radius: var(--radius-lg);
}

.metric-info {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.metric-value {
  font-size: var(--text-xl);
  font-weight: 600;
  color: var(--text-primary);
}

.metric-label {
  font-size: var(--text-sm);
  color: var(--text-secondary);
}

.performance-chart {
  padding: 1rem;
  background: var(--bg-tertiary);
  border-radius: var(--radius-lg);
}

.chart-placeholder {
  height: 200px;
  display: flex;
  align-items: center;
  justify-content: center;
  border: 2px dashed var(--border-primary);
  border-radius: var(--radius-md);
}

.status-bar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.5rem 1rem;
  background: var(--bg-tertiary);
  border-top: 1px solid var(--border-primary);
  font-size: var(--text-xs);
}

.status-left,
.status-right {
  display: flex;
  gap: 1rem;
}

.status-item {
  display: flex;
  align-items: center;
  gap: 0.25rem;
  color: var(--text-secondary);
}

.status-item.running {
  color: var(--accent-primary);
}

/* Адаптивность */
@media (max-width: 768px) {
  .test-comparison {
    grid-template-columns: 1fr;
  }
  
  .performance-metrics {
    grid-template-columns: 1fr;
  }
  
  .summary-header {
    flex-direction: column;
    gap: 1rem;
    align-items: stretch;
  }
  
  .status-bar {
    flex-direction: column;
    gap: 0.5rem;
  }
}
</style>