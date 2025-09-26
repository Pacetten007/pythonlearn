<template>
  <div class="code-runner">
    <div class="runner-header">
      <div class="controls">
        <BaseButton
          @click="runCode" 
          :disabled="isRunning || !canRun"
          :variant="isRunning ? 'secondary' : 'primary'"
          :size="'md'"
          class="btn-run"
        >
          <IconPlay v-if="!isRunning" class="w-4 h-4" />
          <IconRefreshCw v-else class="w-4 h-4 animate-spin" />
          {{ isRunning ? 'Выполняется...' : 'Запустить код' }}
        </BaseButton>
        
        <BaseButton
          @click="stopExecution" 
          :disabled="!isRunning" 
          variant="error"
          size="sm"
          class="btn-stop"
        >
          <IconX class="w-4 h-4" />
          Остановить
        </BaseButton>
        
        <BaseButton
          @click="clearOutput" 
          variant="ghost"
          size="sm"
          class="btn-clear"
        >
          <IconTrash class="w-4 h-4" />
          Очистить
        </BaseButton>
        
        <div v-if="lastExecution" class="execution-info">
          <BaseBadge 
            :variant="getStatusVariant(lastExecution.status)"
            class="status-badge"
          >
            {{ getStatusText(lastExecution.status) }}
          </BaseBadge>
          <span class="execution-time text-sm text-secondary">
            {{ lastExecution.duration }}мс
          </span>
        </div>
      </div>
      
      <div class="settings">
        <BaseButton
          @click="showSettings = !showSettings" 
          variant="ghost"
          size="sm"
          class="btn-settings"
        >
          <IconSettings class="w-4 h-4" />
        </BaseButton>
      </div>
    </div>

    <!-- Настройки выполнения -->
    <Transition name="fade">
      <div v-if="showSettings" class="settings-panel">
        <div class="setting-group">
          <label class="setting-item">
            <input 
              type="checkbox" 
              v-model="settings.useServer"
              class="setting-checkbox"
            />
            <span>Выполнять на сервере</span>
          </label>
          
          <label class="setting-item">
            <input 
              type="checkbox" 
              v-model="settings.showHints"
              class="setting-checkbox"
            />
            <span>Показывать подсказки</span>
          </label>
          
          <div class="setting-item">
            <label>Таймаут (сек):</label>
            <input 
              type="number" 
              v-model.number="settings.timeout"
              min="1"
              max="30"
              class="timeout-input"
            />
          </div>
        </div>
      </div>
    </Transition>

    <div class="output-container">
      <div class="output-tabs">
        <button 
          @click="activeTab = 'output'"
          :class="['tab', { active: activeTab === 'output' }]"
        >
          <IconTerminal class="w-4 h-4" />
          Вывод
          <BaseBadge 
            v-if="output.length" 
            variant="secondary" 
            size="sm"
            class="tab-count"
          >
            {{ output.length }}
          </BaseBadge>
        </button>
        
        <button 
          @click="activeTab = 'errors'"
          :class="['tab', { active: activeTab === 'errors' }]"
        >
          <IconAlertTriangle class="w-4 h-4" />
          Ошибки
          <BaseBadge 
            v-if="errors.length" 
            variant="error" 
            size="sm"
            class="tab-count"
          >
            {{ errors.length }}
          </BaseBadge>
        </button>
        
        <button 
          @click="activeTab = 'tests'"
          :class="['tab', { active: activeTab === 'tests' }]"
        >
          <IconCheckCircle class="w-4 h-4" />
          Тесты
          <BaseBadge 
            v-if="testResults.length" 
            :variant="allTestsPassed ? 'success' : 'warning'" 
            size="sm"
            class="tab-count"
          >
            {{ passedTests }}/{{ testResults.length }}
          </BaseBadge>
        </button>
      </div>

      <div class="output-content">
        <!-- Вывод программы -->
        <div v-if="activeTab === 'output'" class="output-panel">
          <div v-if="output.length === 0 && !isRunning" class="empty-state">
            <IconCode class="w-12 h-12 text-muted" />
            <p class="text-secondary">Запустите код, чтобы увидеть результат</p>
          </div>
          
          <div v-else class="output-lines">
            <div 
              v-for="(line, index) in output" 
              :key="index"
              :class="['output-line', line.type]"
            >
              <span class="line-number">{{ index + 1 }}</span>
              <span class="line-content">{{ line.content }}</span>
              <span v-if="line.timestamp" class="timestamp">
                {{ formatTime(line.timestamp) }}
              </span>
            </div>
          </div>
          
          <!-- Индикатор выполнения -->
          <div v-if="isRunning" class="execution-indicator">
            <BaseSpinner size="sm" />
            <span class="text-sm text-secondary">Выполняется код...</span>
          </div>
        </div>

        <!-- Ошибки -->
        <div v-else-if="activeTab === 'errors'" class="errors-panel">
          <div v-if="errors.length === 0" class="empty-state">
            <IconCheckCircle class="w-12 h-12 text-success" />
            <p class="text-secondary">Ошибок нет</p>
          </div>
          
          <div v-else class="error-list">
            <div 
              v-for="(error, index) in errors" 
              :key="index"
              class="error-item"
            >
              <div class="error-header">
                <BaseBadge variant="error" size="sm">
                  {{ error.type || 'Error' }}
                </BaseBadge>
                <span v-if="error.line" class="error-line text-sm text-secondary">
                  Строка {{ error.line }}
                </span>
              </div>
              <div class="error-message">{{ error.message }}</div>
              <div v-if="error.traceback" class="error-traceback">
                <pre class="text-xs"><code>{{ error.traceback }}</code></pre>
              </div>
            </div>
          </div>
        </div>

        <!-- Результаты тестов -->
        <div v-else-if="activeTab === 'tests'" class="tests-panel">
          <div v-if="testResults.length === 0" class="empty-state">
            <IconCheckCircle class="w-12 h-12 text-muted" />
            <p class="text-secondary">Тесты не запускались</p>
          </div>
          
          <div v-else class="test-results">
            <div class="test-summary">
              <div class="summary-stats">
                <BaseBadge variant="success" size="lg">
                  Пройдено: {{ passedTests }}
                </BaseBadge>
                <BaseBadge 
                  :variant="failedTests > 0 ? 'error' : 'secondary'" 
                  size="lg"
                >
                  Провалено: {{ failedTests }}
                </BaseBadge>
                <BaseBadge variant="secondary" size="lg">
                  Всего: {{ testResults.length }}
                </BaseBadge>
              </div>
              
              <div class="test-score">
                <BaseProgressBar 
                  :value="testPassRate" 
                  :max="100"
                  :variant="testPassRate === 100 ? 'success' : 'warning'"
                  class="score-bar"
                />
                <span class="score-text">{{ testPassRate }}%</span>
              </div>
            </div>
            
            <div class="test-list">
              <div 
                v-for="(test, index) in testResults" 
                :key="index"
                :class="['test-item', test.status]"
              >
                <div class="test-header">
                  <div class="test-icon">
                    <IconCheckCircle v-if="test.status === 'passed'" class="w-5 h-5 text-success" />
                    <IconXCircle v-else class="w-5 h-5 text-error" />
                  </div>
                  <span class="test-name">{{ test.name || `Тест ${index + 1}` }}</span>
                  <span class="test-time text-xs text-secondary">{{ test.duration }}мс</span>
                </div>
                
                <div v-if="test.status === 'failed'" class="test-details">
                  <div class="test-expected">
                    <span class="label">Ожидалось:</span>
                    <code class="value">{{ test.expected }}</code>
                  </div>
                  <div class="test-actual">
                    <span class="label">Получено:</span>
                    <code class="value">{{ test.actual }}</code>
                  </div>
                  <div v-if="test.error" class="test-error">
                    <span class="label">Ошибка:</span>
                    <span class="error-text">{{ test.error }}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch, onMounted } from 'vue'
import { storeToRefs } from 'pinia'
import { useCodeStore } from '@/stores/code'
import { useNotifications } from '@/composables/useNotifications'

// Композейблы
const codeStore = useCodeStore()
const { showNotification } = useNotifications()

// Реактивные данные из store
const {
  isRunning,
  executionOutput,
  executionError,
  executionTime,
  testResults,
  testsPassed,
  testsTotal,
  canRun,
  hasCode,
  syntaxErrors,
  runtimeErrors
} = storeToRefs(codeStore)

// Локальное состояние
const activeTab = ref('output')
const showSettings = ref(false)
const lastExecution = ref(null)
const output = ref([])
const errors = ref([])

// Настройки выполнения
const settings = ref({
  useServer: false,
  showHints: true,
  timeout: 10
})

// Вычисляемые свойства
const failedTests = computed(() => testsTotal.value - testsPassed.value)
const testPassRate = computed(() => {
  if (testsTotal.value === 0) return 0
  return Math.round((testsPassed.value / testsTotal.value) * 100)
})
const allTestsPassed = computed(() => testPassRate.value === 100)
const passedTests = computed(() => testsPassed.value)

// Методы
const runCode = async () => {
  if (!hasCode.value) {
    showNotification('Введите код для выполнения', 'warning')
    return
  }

  try {
    const startTime = performance.now()
    
    await codeStore.runCode(null, settings.value.useServer)
    
    const endTime = performance.now()
    const duration = Math.round(endTime - startTime)
    
    lastExecution.value = {
      status: executionError.value ? 'error' : 'success',
      duration,
      timestamp: Date.now()
    }
    
    // Автоматически переключаемся на вкладку с ошибками если есть ошибка
    if (executionError.value) {
      activeTab.value = 'errors'
    }
    
  } catch (error) {
    console.error('Ошибка выполнения:', error)
    lastExecution.value = {
      status: 'error',
      duration: 0,
      timestamp: Date.now()
    }
  }
}

const stopExecution = async () => {
  try {
    await codeStore.stopExecution()
    lastExecution.value = {
      status: 'cancelled',
      duration: 0,
      timestamp: Date.now()
    }
  } catch (error) {
    console.error('Ошибка остановки:', error)
  }
}

const clearOutput = () => {
  codeStore.clearExecution()
  output.value = []
  errors.value = []
  lastExecution.value = null
  activeTab.value = 'output'
}

const getStatusText = (status) => {
  const statusMap = {
    success: 'Успешно',
    error: 'Ошибка',
    cancelled: 'Отменено',
    running: 'Выполняется'
  }
  return statusMap[status] || status
}

const getStatusVariant = (status) => {
  const variantMap = {
    success: 'success',
    error: 'error',
    cancelled: 'warning',
    running: 'secondary'
  }
  return variantMap[status] || 'secondary'
}

const formatTime = (timestamp) => {
  return new Date(timestamp).toLocaleTimeString()
}

// Обновление вывода при изменении данных в store
watch(executionOutput, (newOutput) => {
  if (newOutput) {
    output.value.push({
      type: 'stdout',
      content: newOutput,
      timestamp: Date.now()
    })
  }
})

watch(executionError, (newError) => {
  if (newError) {
    errors.value.push({
      type: 'runtime',
      message: newError,
      timestamp: Date.now()
    })
  }
})

watch(syntaxErrors, (newErrors) => {
  errors.value = errors.value.filter(e => e.type !== 'syntax')
  errors.value.push(...newErrors.map(e => ({
    ...e,
    type: 'syntax',
    timestamp: Date.now()
  })))
})

watch(runtimeErrors, (newErrors) => {
  errors.value = errors.value.filter(e => e.type !== 'runtime')
  errors.value.push(...newErrors.map(e => ({
    ...e,
    type: 'runtime', 
    timestamp: Date.now()
  })))
})

// Загружаем настройки при монтировании
onMounted(() => {
  const savedSettings = localStorage.getItem('codeRunnerSettings')
  if (savedSettings) {
    try {
      settings.value = { ...settings.value, ...JSON.parse(savedSettings) }
    } catch (error) {
      console.error('Ошибка загрузки настроек:', error)
    }
  }
})

// Сохраняем настройки при изменении
watch(settings, (newSettings) => {
  localStorage.setItem('codeRunnerSettings', JSON.stringify(newSettings))
}, { deep: true })

// Автоматическая инициализация Pyodide
onMounted(async () => {
  if (!settings.value.useServer) {
    try {
      await codeStore.initializePyodide()
    } catch (error) {
      console.error('Ошибка инициализации Pyodide:', error)
      // Переключаемся на серверное выполнение в случае ошибки
      settings.value.useServer = true
    }
  }
})
</script>

<style scoped>
.code-runner {
  display: flex;
  flex-direction: column;
  height: 100%;
  background: var(--bg-secondary);
  border-radius: var(--radius-lg);
  overflow: hidden;
}

.runner-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem;
  background: var(--bg-tertiary);
  border-bottom: 1px solid var(--border-primary);
}

.controls {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.execution-info {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-left: 1rem;
}

.settings-panel {
  padding: 1rem;
  background: var(--bg-tertiary);
  border-bottom: 1px solid var(--border-primary);
}

.setting-group {
  display: flex;
  flex-wrap: wrap;
  gap: 1rem;
}

.setting-item {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: var(--text-sm);
}

.setting-checkbox {
  width: 1rem;
  height: 1rem;
  accent-color: var(--accent-primary);
}

.timeout-input {
  width: 4rem;
  padding: 0.25rem 0.5rem;
  border: 1px solid var(--border-primary);
  border-radius: var(--radius-sm);
  background: var(--bg-primary);
  color: var(--text-primary);
  font-size: var(--text-sm);
}

.output-container {
  flex: 1;
  display: flex;
  flex-direction: column;
}

.output-tabs {
  display: flex;
  background: var(--bg-tertiary);
  border-bottom: 1px solid var(--border-primary);
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

.tab-count {
  margin-left: 0.25rem;
}

.output-content {
  flex: 1;
  padding: 1rem;
  overflow-y: auto;
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

.output-lines {
  font-family: var(--font-code);
  font-size: var(--text-sm);
}

.output-line {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.25rem 0;
  border-radius: var(--radius-sm);
}

.output-line:hover {
  background: var(--bg-hover);
}

.line-number {
  color: var(--text-muted);
  font-size: var(--text-xs);
  min-width: 2rem;
  text-align: right;
}

.line-content {
  flex: 1;
  white-space: pre-wrap;
  word-break: break-word;
}

.timestamp {
  color: var(--text-muted);
  font-size: var(--text-xs);
}

.execution-indicator {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 1rem;
  color: var(--text-secondary);
}

.error-list {
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

.error-message {
  font-family: var(--font-code);
  font-size: var(--text-sm);
  color: var(--text-primary);
  margin-bottom: 0.5rem;
}

.error-traceback {
  margin-top: 0.5rem;
}

.error-traceback pre {
  background: var(--bg-primary);
  border: 1px solid var(--border-primary);
  border-radius: var(--radius-sm);
  padding: 0.5rem;
  margin: 0;
}

.test-summary {
  margin-bottom: 1.5rem;
}

.summary-stats {
  display: flex;
  gap: 1rem;
  margin-bottom: 1rem;
}

.test-score {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.score-bar {
  flex: 1;
}

.score-text {
  font-weight: 600;
  font-size: var(--text-lg);
}

.test-list {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.test-item {
  padding: 1rem;
  background: var(--bg-tertiary);
  border-radius: var(--radius-lg);
  border-left: 4px solid var(--border-primary);
}

.test-item.passed {
  border-left-color: var(--accent-success);
}

.test-item.failed {
  border-left-color: var(--accent-error);
}

.test-header {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  margin-bottom: 0.5rem;
}

.test-name {
  flex: 1;
  font-weight: 500;
}

.test-details {
  margin-top: 0.75rem;
  padding-top: 0.75rem;
  border-top: 1px solid var(--border-primary);
  font-size: var(--text-sm);
}

.test-expected,
.test-actual,
.test-error {
  margin-bottom: 0.5rem;
}

.label {
  font-weight: 500;
  color: var(--text-secondary);
  margin-right: 0.5rem;
}

.value {
  font-family: var(--font-code);
  background: var(--bg-primary);
  padding: 0.125rem 0.25rem;
  border-radius: var(--radius-sm);
}

.error-text {
  color: var(--accent-error);
}

/* Анимации */
.fade-enter-active, .fade-leave-active {
  transition: opacity var(--transition-fast);
}

.fade-enter-from, .fade-leave-to {
  opacity: 0;
}

/* Адаптивность */
@media (max-width: 768px) {
  .runner-header {
    flex-direction: column;
    gap: 1rem;
    align-items: stretch;
  }
  
  .controls {
    flex-wrap: wrap;
  }
  
  .execution-info {
    margin-left: 0;
    margin-top: 0.5rem;
  }
  
  .setting-group {
    flex-direction: column;
    gap: 0.75rem;
  }
  
  .summary-stats {
    flex-direction: column;
    gap: 0.5rem;
  }
  
  .test-score {
    flex-direction: column;
    align-items: stretch;
    gap: 0.5rem;
  }
}
</style>