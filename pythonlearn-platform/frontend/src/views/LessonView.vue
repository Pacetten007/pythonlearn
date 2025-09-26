<template>
  <div class="lesson-view" :class="{ 'fullscreen': isFullscreen }">
    <!-- Хедер урока -->
    <div class="lesson-header" v-if="!isFullscreen">
      <div class="lesson-navigation">
        <BaseButton
          @click="goBack"
          variant="ghost"
          size="sm"
          class="back-button"
        >
          <IconArrowLeft class="w-4 h-4" />
          Назад к курсу
        </BaseButton>
        
        <div class="lesson-info">
          <div class="breadcrumb">
            <router-link :to="`/courses/${course?.id}`" class="course-link">
              {{ course?.title }}
            </router-link>
            <IconChevronRight class="w-4 h-4 text-muted" />
            <span class="lesson-title">{{ lesson?.title }}</span>
          </div>
          
          <div class="lesson-meta">
            <BaseBadge variant="secondary" size="sm">
              {{ lesson?.type === 'practice' ? 'Практика' : 'Теория' }}
            </BaseBadge>
            <span class="difficulty">
              Сложность: {{ getDifficultyText(lesson?.difficulty) }}
            </span>
            <span class="duration">
              {{ lesson?.estimatedDuration || 30 }} мин
            </span>
          </div>
        </div>
      </div>
      
      <div class="lesson-actions">
        <BaseButton
          @click="showHint"
          variant="secondary"
          size="sm"
          :disabled="!hasHints"
          class="hint-button"
        >
          <IconHelpCircle class="w-4 h-4" />
          Подсказка
          <BaseBadge v-if="hintsUsed > 0" variant="warning" size="sm">
            {{ hintsUsed }}/{{ hintsAvailable.length }}
          </BaseBadge>
        </BaseButton>
        
        <BaseButton
          @click="resetLesson"
          variant="ghost"
          size="sm"
          class="reset-button"
        >
          <IconRotateCcw class="w-4 h-4" />
          Сбросить
        </BaseButton>
        
        <BaseButton
          @click="toggleFullscreen"
          variant="ghost"
          size="sm"
          class="fullscreen-button"
        >
          <IconMaximize v-if="!isFullscreen" class="w-4 h-4" />
          <IconMinimize v-else class="w-4 h-4" />
        </BaseButton>
      </div>
    </div>

    <!-- Основной контент урока -->
    <div class="lesson-content">
      <!-- Левая панель: инструкции и теория -->
      <div class="content-panel" :class="{ 'hidden': showOnlyEditor }">
        <div class="panel-header">
          <h2 class="panel-title">{{ lesson?.title }}</h2>
          <div class="panel-actions">
            <BaseButton
              @click="showOnlyEditor = !showOnlyEditor"
              variant="ghost"
              size="sm"
              class="toggle-panel"
            >
              <IconEyeOff v-if="showOnlyEditor" class="w-4 h-4" />
              <IconEye v-else class="w-4 h-4" />
            </BaseButton>
          </div>
        </div>
        
        <div class="panel-content">
          <!-- Прогресс урока -->
          <div class="lesson-progress-section" v-if="!isFullscreen">
            <div class="progress-header">
              <span class="progress-label">Прогресс урока</span>
              <span class="progress-percentage">{{ lessonProgress }}%</span>
            </div>
            <BaseProgressBar 
              :value="lessonProgress" 
              :max="100"
              variant="success"
              class="progress-bar"
            />
          </div>

          <!-- Описание и инструкции -->
          <div class="lesson-description">
            <div v-html="lesson?.content?.description" class="description-content"></div>
          </div>

          <!-- Цели урока -->
          <div v-if="lesson?.content?.objectives" class="lesson-objectives">
            <h3 class="objectives-title">Цели урока:</h3>
            <ul class="objectives-list">
              <li v-for="objective in lesson.content.objectives" :key="objective">
                {{ objective }}
              </li>
            </ul>
          </div>

          <!-- Пример кода (если есть) -->
          <div v-if="lesson?.content?.example" class="code-example">
            <h3 class="example-title">Пример:</h3>
            <pre class="example-code"><code>{{ lesson.content.example }}</code></pre>
          </div>

          <!-- Задание -->
          <div v-if="currentAssignment" class="assignment-section">
            <h3 class="assignment-title">Задание:</h3>
            <div v-html="currentAssignment.description" class="assignment-description"></div>
            
            <!-- Требования к решению -->
            <div v-if="currentAssignment.requirements" class="assignment-requirements">
              <h4>Требования:</h4>
              <ul>
                <li v-for="req in currentAssignment.requirements" :key="req">
                  {{ req }}
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      <!-- Правая панель: редактор и выполнение -->
      <div class="editor-panel">
        <div class="panel-header">
          <h3 class="panel-title">Редактор кода</h3>
          <div class="panel-actions">
            <BaseButton
              @click="autoSave"
              variant="ghost"
              size="sm"
              :disabled="!hasUnsavedChanges"
              class="save-button"
            >
              <IconSave class="w-4 h-4" />
              {{ hasUnsavedChanges ? 'Сохранить' : 'Сохранено' }}
            </BaseButton>
          </div>
        </div>
        
        <!-- Monaco Editor -->
        <div class="editor-container">
          <CodeEditor
            v-model="currentCode"
            :language="'python'"
            :height="editorHeight"
            @change="onCodeChange"
            @save="onSave"
            @run="runCode"
            ref="codeEditor"
          />
        </div>

        <!-- CodeRunner -->
        <div class="runner-container">
          <CodeRunner ref="codeRunner" />
        </div>
      </div>
    </div>

    <!-- Футер с навигацией по уроку -->
    <div class="lesson-footer" v-if="!isFullscreen">
      <div class="lesson-navigation-bottom">
        <BaseButton
          @click="goToPreviousLesson"
          :disabled="!hasPreviousLesson"
          variant="secondary"
          class="nav-button"
        >
          <IconArrowLeft class="w-4 h-4" />
          Предыдущий урок
        </BaseButton>
        
        <div class="lesson-status">
          <div class="test-results" v-if="testResults.length > 0">
            <BaseBadge 
              :variant="allTestsPassed ? 'success' : 'warning'" 
              size="lg"
            >
              {{ testsPassed }}/{{ testsTotal }} тестов пройдено
            </BaseBadge>
          </div>
          
          <BaseButton
            @click="runTests"
            :disabled="!hasCode || isRunningTests"
            variant="primary"
            class="test-button"
          >
            <IconPlay v-if="!isRunningTests" class="w-4 h-4" />
            <BaseSpinner v-else size="sm" />
            {{ isRunningTests ? 'Проверяем...' : 'Проверить решение' }}
          </BaseButton>
          
          <BaseButton
            @click="completeLesson"
            :disabled="!canCompleteLesson"
            variant="success"
            class="complete-button"
          >
            <IconCheck class="w-4 h-4" />
            Завершить урок
          </BaseButton>
        </div>
        
        <BaseButton
          @click="goToNextLesson"
          :disabled="!hasNextLesson || !lessonCompleted"
          variant="secondary"
          class="nav-button"
        >
          Следующий урок
          <IconArrowRight class="w-4 h-4" />
        </BaseButton>
      </div>
    </div>

    <!-- Модальные окна -->
    <Teleport to="body">
      <!-- Модалка завершения урока -->
      <BaseModal 
        v-if="showCompletionModal" 
        @close="showCompletionModal = false"
        title="Урок завершен!"
      >
        <div class="completion-content">
          <div class="completion-icon">
            <IconCheckCircle class="w-16 h-16 text-success" />
          </div>
          
          <div class="completion-stats">
            <h3>Отличная работа!</h3>
            <div class="stats-grid">
              <div class="stat-item">
                <span class="stat-value">{{ earnedXP }}</span>
                <span class="stat-label">XP получено</span>
              </div>
              <div class="stat-item">
                <span class="stat-value">{{ testPassRate }}%</span>
                <span class="stat-label">Тесты пройдены</span>
              </div>
              <div class="stat-item">
                <span class="stat-value">{{ formatDuration(timeSpent) }}</span>
                <span class="stat-label">Время выполнения</span>
              </div>
            </div>
          </div>
          
          <div class="completion-actions">
            <BaseButton
              @click="goToNextLesson"
              variant="primary"
              size="lg"
              :disabled="!hasNextLesson"
            >
              Следующий урок
            </BaseButton>
            <BaseButton
              @click="goToCourse"
              variant="secondary"
              size="lg"
            >
              К курсу
            </BaseButton>
          </div>
        </div>
      </BaseModal>
    </Teleport>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted, watch, nextTick } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { storeToRefs } from 'pinia'

// Компоненты
import CodeEditor from '@/components/editor/CodeEditor.vue'
import CodeRunner from '@/components/editor/CodeRunner.vue'

// Stores
import { useCodeStore } from '@/stores/code'
import { useCoursesStore } from '@/stores/courses'
import { useProgressStore } from '@/stores/progress'
import { useUIStore } from '@/stores/ui'

// Composables
import { useNotifications } from '@/composables/useNotifications'

const route = useRoute()
const router = useRouter()

// Stores
const codeStore = useCodeStore()
const coursesStore = useCoursesStore()
const progressStore = useProgressStore()
const uiStore = useUIStore()

const { showNotification } = useNotifications()

// Store refs
const {
  currentCode,
  isRunning,
  isRunningTests,
  testResults,
  testsPassed,
  testsTotal,
  hasCode,
  hintsAvailable,
  hintsUsed
} = storeToRefs(codeStore)

const { isFullscreen } = storeToRefs(uiStore)

// Локальное состояние
const lesson = ref(null)
const course = ref(null)
const currentAssignment = ref(null)
const lessonProgress = ref(0)
const showOnlyEditor = ref(false)
const hasUnsavedChanges = ref(false)
const showCompletionModal = ref(false)
const timeSpent = ref(0)
const startTime = ref(Date.now())
const earnedXP = ref(0)
const lessonCompleted = ref(false)

// Рефы компонентов
const codeEditor = ref(null)
const codeRunner = ref(null)

// Вычисляемые свойства
const hasHints = computed(() => hintsAvailable.value.length > 0)
const allTestsPassed = computed(() => testsTotal.value > 0 && testsPassed.value === testsTotal.value)
const testPassRate = computed(() => {
  if (testsTotal.value === 0) return 0
  return Math.round((testsPassed.value / testsTotal.value) * 100)
})

const canCompleteLesson = computed(() => {
  return hasCode.value && (allTestsPassed.value || testResults.value.length === 0)
})

const hasPreviousLesson = computed(() => {
  // Логика определения предыдущего урока
  return course.value?.lessons && lesson.value?.orderIndex > 0
})

const hasNextLesson = computed(() => {
  // Логика определения следующего урока
  return course.value?.lessons && lesson.value?.orderIndex < course.value.lessons.length - 1
})

const editorHeight = computed(() => {
  return isFullscreen.value ? 'calc(60vh - 100px)' : '400px'
})

// Методы
const loadLesson = async () => {
  try {
    const lessonId = route.params.lessonId
    const courseId = route.params.courseId
    
    // Загружаем курс и урок
    [course.value, lesson.value] = await Promise.all([
      coursesStore.fetchCourse(courseId),
      coursesStore.fetchLesson(lessonId)
    ])
    
    if (!lesson.value) {
      throw new Error('Урок не найден')
    }
    
    // Загружаем задания урока
    const assignments = await coursesStore.fetchLessonAssignments(lessonId)
    currentAssignment.value = assignments[0] || null
    
    // Загружаем подсказки
    if (currentAssignment.value?.hints) {
      codeStore.loadHints(currentAssignment.value.hints)
    }
    
    // Загружаем сохраненный код
    if (currentAssignment.value?.id) {
      codeStore.loadSavedCode(currentAssignment.value.id)
    }
    
    // Устанавливаем начальный код если есть
    if (currentAssignment.value?.initialCode && !currentCode.value) {
      codeStore.setCode(currentAssignment.value.initialCode)
    }
    
    // Инициализируем Pyodide
    await codeStore.initializePyodide()
    
  } catch (error) {
    console.error('Ошибка загрузки урока:', error)
    showNotification('Ошибка загрузки урока', 'error')
    router.push('/courses')
  }
}

const onCodeChange = (newCode) => {
  hasUnsavedChanges.value = true
  updateProgress()
}

const onSave = () => {
  autoSave()
}

const autoSave = () => {
  if (currentAssignment.value?.id) {
    codeStore.autoSave(currentAssignment.value.id)
    hasUnsavedChanges.value = false
    showNotification('Код сохранен', 'success', { duration: 2000 })
  }
}

const runCode = async () => {
  await codeStore.runCode()
  updateProgress()
}

const runTests = async () => {
  if (!currentAssignment.value?.testCases) {
    showNotification('Нет тестов для проверки', 'warning')
    return
  }
  
  await codeStore.runTests(currentAssignment.value.testCases)
  updateProgress()
}

const updateProgress = () => {
  let progress = 0
  
  // Код написан - 30%
  if (hasCode.value) progress += 30
  
  // Код выполнился - 40%
  if (codeStore.executionOutput) progress += 40
  
  // Тесты пройдены - 30%
  if (allTestsPassed.value) progress += 30
  
  lessonProgress.value = Math.min(progress, 100)
}

const showHint = () => {
  codeStore.showHint()
}

const resetLesson = () => {
  if (confirm('Вы уверены, что хотите сбросить весь прогресс урока?')) {
    codeStore.clearAll()
    if (currentAssignment.value?.initialCode) {
      codeStore.setCode(currentAssignment.value.initialCode)
    }
    lessonProgress.value = 0
    hasUnsavedChanges.value = false
    showNotification('Урок сброшен', 'info')
  }
}

const completeLesson = async () => {
  try {
    timeSpent.value = Date.now() - startTime.value
    
    // Сохраняем прогресс
    const progressData = {
      lessonId: lesson.value.id,
      completed: true,
      score: testPassRate.value,
      timeSpent: timeSpent.value,
      hintsUsed: hintsUsed.value,
      attempts: 1 // TODO: трекинг попыток
    }
    
    await progressStore.updateLessonProgress(progressData)
    
    // Вычисляем XP
    earnedXP.value = calculateEarnedXP()
    
    lessonCompleted.value = true
    showCompletionModal.value = true
    
  } catch (error) {
    console.error('Ошибка завершения урока:', error)
    showNotification('Ошибка при сохранении прогресса', 'error')
  }
}

const calculateEarnedXP = () => {
  let baseXP = lesson.value?.xpReward || 50
  
  // Бонус за полное прохождение тестов
  if (allTestsPassed.value) baseXP += 25
  
  // Штраф за использование подсказок
  const hintPenalty = hintsUsed.value * 5
  
  return Math.max(baseXP - hintPenalty, 10)
}

const getDifficultyText = (level) => {
  const difficultyMap = {
    1: 'Очень легко',
    2: 'Легко', 
    3: 'Средне',
    4: 'Сложно',
    5: 'Очень сложно'
  }
  return difficultyMap[level] || 'Неизвестно'
}

const goBack = () => {
  router.push(`/courses/${course.value?.id}`)
}

const goToCourse = () => {
  router.push(`/courses/${course.value?.id}`)
}

const goToPreviousLesson = () => {
  // TODO: реализовать навигацию к предыдущему уроку
}

const goToNextLesson = () => {
  showCompletionModal.value = false
  // TODO: реализовать навигацию к следующему уроку
}

const toggleFullscreen = () => {
  uiStore.toggleFullscreen()
}

// Автосохранение каждые 30 секунд
let autoSaveInterval
onMounted(() => {
  loadLesson()
  
  autoSaveInterval = setInterval(() => {
    if (hasUnsavedChanges.value) {
      autoSave()
    }
  }, 30000)
})

onUnmounted(() => {
  if (autoSaveInterval) {
    clearInterval(autoSaveInterval)
  }
  
  // Финальное сохранение при выходе
  if (hasUnsavedChanges.value) {
    autoSave()
  }
})

// Хоткеи
const handleKeydown = (event) => {
  // Ctrl+S для сохранения
  if ((event.ctrlKey || event.metaKey) && event.key === 's') {
    event.preventDefault()
    autoSave()
  }
  
  // F11 для полноэкранного режима
  if (event.key === 'F11') {
    event.preventDefault()
    toggleFullscreen()
  }
  
  // Ctrl+Enter для запуска кода
  if ((event.ctrlKey || event.metaKey) && event.key === 'Enter') {
    event.preventDefault()
    runCode()
  }
}

onMounted(() => {
  document.addEventListener('keydown', handleKeydown)
})

onUnmounted(() => {
  document.removeEventListener('keydown', handleKeydown)
})
</script>

<style scoped>
.lesson-view {
  display: flex;
  flex-direction: column;
  height: 100vh;
  background: var(--bg-primary);
}

.lesson-view.fullscreen {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: var(--z-modal);
}

.lesson-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem 1.5rem;
  background: var(--bg-secondary);
  border-bottom: 1px solid var(--border-primary);
}

.lesson-navigation {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.lesson-info {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.breadcrumb {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: var(--text-sm);
}

.course-link {
  color: var(--accent-primary);
  text-decoration: none;
}

.course-link:hover {
  text-decoration: underline;
}

.lesson-title {
  font-weight: 600;
  color: var(--text-primary);
}

.lesson-meta {
  display: flex;
  align-items: center;
  gap: 1rem;
  font-size: var(--text-xs);
  color: var(--text-secondary);
}

.lesson-actions {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.lesson-content {
  display: grid;
  grid-template-columns: 1fr 1fr;
  flex: 1;
  overflow: hidden;
}

.content-panel {
  background: var(--bg-secondary);
  border-right: 1px solid var(--border-primary);
  display: flex;
  flex-direction: column;
}

.content-panel.hidden {
  display: none;
}

.editor-panel {
  display: flex;
  flex-direction: column;
  background: var(--bg-primary);
}

.panel-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem;
  background: var(--bg-tertiary);
  border-bottom: 1px solid var(--border-primary);
}

.panel-title {
  font-size: var(--text-lg);
  font-weight: 600;
  margin: 0;
}

.panel-actions {
  display: flex;
  gap: 0.5rem;
}

.panel-content {
  flex: 1;
  padding: 1.5rem;
  overflow-y: auto;
}

.lesson-progress-section {
  margin-bottom: 2rem;
}

.progress-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 0.5rem;
}

.progress-label {
  font-weight: 500;
  font-size: var(--text-sm);
}

.progress-percentage {
  font-weight: 600;
  color: var(--accent-primary);
}

.lesson-description {
  margin-bottom: 2rem;
}

.description-content {
  line-height: var(--leading-relaxed);
}

.lesson-objectives {
  margin-bottom: 2rem;
}

.objectives-title {
  font-size: var(--text-lg);
  margin-bottom: 1rem;
}

.objectives-list {
  margin-left: 1.5rem;
}

.objectives-list li {
  margin-bottom: 0.5rem;
}

.code-example {
  margin-bottom: 2rem;
}

.example-title {
  font-size: var(--text-lg);
  margin-bottom: 1rem;
}

.example-code {
  background: var(--bg-tertiary);
  border: 1px solid var(--border-primary);
  border-radius: var(--radius-lg);
  padding: 1rem;
  font-family: var(--font-code);
  font-size: var(--text-sm);
  overflow-x: auto;
}

.assignment-section {
  margin-bottom: 2rem;
}

.assignment-title {
  font-size: var(--text-xl);
  margin-bottom: 1rem;
  color: var(--accent-primary);
}

.assignment-description {
  margin-bottom: 1.5rem;
  line-height: var(--leading-relaxed);
}

.assignment-requirements h4 {
  margin-bottom: 0.5rem;
}

.assignment-requirements ul {
  margin-left: 1.5rem;
}

.editor-container {
  flex: 1;
  border-bottom: 1px solid var(--border-primary);
}

.runner-container {
  height: 300px;
  display: flex;
  flex-direction: column;
}

.lesson-footer {
  background: var(--bg-secondary);
  border-top: 1px solid var(--border-primary);
  padding: 1rem 1.5rem;
}

.lesson-navigation-bottom {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.lesson-status {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.test-results {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.completion-content {
  text-align: center;
  padding: 2rem;
}

.completion-icon {
  margin-bottom: 1.5rem;
}

.completion-stats h3 {
  margin-bottom: 1.5rem;
  font-size: var(--text-2xl);
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 1.5rem;
  margin-bottom: 2rem;
}

.stat-item {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.stat-value {
  font-size: var(--text-2xl);
  font-weight: 700;
  color: var(--accent-primary);
}

.stat-label {
  font-size: var(--text-sm);
  color: var(--text-secondary);
}

.completion-actions {
  display: flex;
  gap: 1rem;
  justify-content: center;
}

/* Адаптивность */
@media (max-width: 1024px) {
  .lesson-content {
    grid-template-columns: 1fr;
  }
  
  .content-panel {
    border-right: none;
    border-bottom: 1px solid var(--border-primary);
  }
  
  .showOnlyEditor .content-panel {
    display: none;
  }
}

@media (max-width: 768px) {
  .lesson-header {
    flex-direction: column;
    gap: 1rem;
    align-items: stretch;
  }
  
  .lesson-navigation {
    flex-direction: column;
    align-items: flex-start;
    gap: 0.75rem;
  }
  
  .lesson-meta {
    flex-wrap: wrap;
    gap: 0.5rem;
  }
  
  .lesson-navigation-bottom {
    flex-direction: column;
    gap: 1rem;
  }
  
  .lesson-status {
    flex-direction: column;
    gap: 0.75rem;
  }
  
  .stats-grid {
    grid-template-columns: 1fr;
    gap: 1rem;
  }
  
  .completion-actions {
    flex-direction: column;
  }
}

/* Полноэкранный режим */
.fullscreen .lesson-content {
  grid-template-columns: 1fr;
}

.fullscreen .content-panel {
  display: none;
}

.fullscreen .editor-container {
  height: calc(60vh - 50px);
}

.fullscreen .runner-container {
  height: calc(40vh - 50px);
}
</style>