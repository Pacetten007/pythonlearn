<template>
  <BaseModal
    :model-value="true"
    @update:model-value="$emit('close')"
    title="Настройки"
    size="lg"
  >
    <div class="settings-content">
      <!-- Settings Categories -->
      <div class="settings-sidebar">
        <nav class="settings-nav">
          <button
            v-for="category in categories"
            :key="category.id"
            class="settings-nav-item"
            :class="{ active: activeCategory === category.id }"
            @click="activeCategory = category.id"
          >
            <component :is="category.icon" :size="18" />
            {{ category.label }}
          </button>
        </nav>
      </div>

      <!-- Settings Content -->
      <div class="settings-main">
        <!-- Appearance Settings -->
        <div v-if="activeCategory === 'appearance'" class="settings-section">
          <h3 class="section-title">Внешний вид</h3>
          
          <div class="setting-group">
            <div class="setting-item">
              <div class="setting-info">
                <label class="setting-label">Тема</label>
                <p class="setting-description">Выберите светлую или темную тему интерфейса</p>
              </div>
              <div class="theme-selector">
                <button
                  v-for="theme in themes"
                  :key="theme.value"
                  class="theme-option"
                  :class="{ active: currentTheme === theme.value }"
                  @click="changeTheme(theme.value)"
                >
                  <component :is="theme.icon" :size="20" />
                  <span>{{ theme.label }}</span>
                </button>
              </div>
            </div>

            <div class="setting-item">
              <div class="setting-info">
                <label class="setting-label">Размер шрифта</label>
                <p class="setting-description">Настройте размер текста в интерфейсе</p>
              </div>
              <div class="font-size-selector">
                <button
                  v-for="size in fontSizes"
                  :key="size.value"
                  class="font-size-option"
                  :class="{ active: settings.fontSize === size.value }"
                  @click="updateSetting('fontSize', size.value)"
                >
                  {{ size.label }}
                </button>
              </div>
            </div>

            <div class="setting-item">
              <div class="setting-info">
                <label class="setting-label">Анимации</label>
                <p class="setting-description">Включить или отключить анимации интерфейса</p>
              </div>
              <ToggleSwitch
                :value="settings.animations"
                @change="updateSetting('animations', $event)"
              />
            </div>

            <div class="setting-item">
              <div class="setting-info">
                <label class="setting-label">Плотность интерфейса</label>
                <p class="setting-description">Компактный или просторный интерфейс</p>
              </div>
              <select
                v-model="settings.density"
                class="setting-select"
                @change="updateSetting('density', $event.target.value)"
              >
                <option value="compact">Компактный</option>
                <option value="normal">Обычный</option>
                <option value="comfortable">Просторный</option>
              </select>
            </div>
          </div>
        </div>

        <!-- Editor Settings -->
        <div v-if="activeCategory === 'editor'" class="settings-section">
          <h3 class="section-title">Редактор кода</h3>
          
          <div class="setting-group">
            <div class="setting-item">
              <div class="setting-info">
                <label class="setting-label">Тема редактора</label>
                <p class="setting-description">Цветовая схема для редактора кода</p>
              </div>
              <select
                v-model="settings.editorTheme"
                class="setting-select"
                @change="updateSetting('editorTheme', $event.target.value)"
              >
                <option value="vs-dark">Dark (Visual Studio)</option>
                <option value="vs">Light (Visual Studio)</option>
                <option value="hc-black">High Contrast Dark</option>
                <option value="monokai">Monokai</option>
                <option value="github">GitHub</option>
              </select>
            </div>

            <div class="setting-item">
              <div class="setting-info">
                <label class="setting-label">Размер шрифта в редакторе</label>
                <p class="setting-description">Размер шрифта в редакторе кода</p>
              </div>
              <div class="number-input">
                <button @click="adjustEditorFontSize(-1)">
                  <IconMinus :size="16" />
                </button>
                <input
                  type="number"
                  v-model.number="settings.editorFontSize"
                  min="10"
                  max="24"
                  @change="updateSetting('editorFontSize', $event.target.value)"
                />
                <button @click="adjustEditorFontSize(1)">
                  <IconPlus :size="16" />
                </button>
              </div>
            </div>

            <div class="setting-item">
              <div class="setting-info">
                <label class="setting-label">Автодополнение</label>
                <p class="setting-description">Показывать подсказки при вводе кода</p>
              </div>
              <ToggleSwitch
                :value="settings.autocompletion"
                @change="updateSetting('autocompletion', $event)"
              />
            </div>

            <div class="setting-item">
              <div class="setting-info">
                <label class="setting-label">Автосохранение</label>
                <p class="setting-description">Автоматически сохранять код при вводе</p>
              </div>
              <ToggleSwitch
                :value="settings.autosave"
                @change="updateSetting('autosave', $event)"
              />
            </div>

            <div class="setting-item">
              <div class="setting-info">
                <label class="setting-label">Показывать номера строк</label>
                <p class="setting-description">Отображать номера строк в редакторе</p>
              </div>
              <ToggleSwitch
                :value="settings.lineNumbers"
                @change="updateSetting('lineNumbers', $event)"
              />
            </div>

            <div class="setting-item">
              <div class="setting-info">
                <label class="setting-label">Перенос строк</label>
                <p class="setting-description">Автоматически переносить длинные строки</p>
              </div>
              <ToggleSwitch
                :value="settings.wordWrap"
                @change="updateSetting('wordWrap', $event)"
              />
            </div>
          </div>
        </div>

        <!-- Learning Settings -->
        <div v-if="activeCategory === 'learning'" class="settings-section">
          <h3 class="section-title">Обучение</h3>
          
          <div class="setting-group">
            <div class="setting-item">
              <div class="setting-info">
                <label class="setting-label">Уровень сложности</label>
                <p class="setting-description">Предпочитаемый уровень сложности заданий</p>
              </div>
              <select
                v-model="settings.difficultyLevel"
                class="setting-select"
                @change="updateSetting('difficultyLevel', $event.target.value)"
              >
                <option value="beginner">Начинающий</option>
                <option value="intermediate">Средний</option>
                <option value="advanced">Продвинутый</option>
                <option value="expert">Эксперт</option>
              </select>
            </div>

            <div class="setting-item">
              <div class="setting-info">
                <label class="setting-label">Показывать подсказки</label>
                <p class="setting-description">Автоматически показывать подсказки в заданиях</p>
              </div>
              <ToggleSwitch
                :value="settings.showHints"
                @change="updateSetting('showHints', $event)"
              />
            </div>

            <div class="setting-item">
              <div class="setting-info">
                <label class="setting-label">Воспроизводить звуки</label>
                <p class="setting-description">Звуковые уведомления о событиях</p>
              </div>
              <ToggleSwitch
                :value="settings.playSounds"
                @change="updateSetting('playSounds', $event)"
              />
            </div>

            <div class="setting-item">
              <div class="setting-info">
                <label class="setting-label">Цель на день</label>
                <p class="setting-description">Количество уроков для изучения в день</p>
              </div>
              <div class="number-input">
                <button @click="adjustDailyGoal(-1)">
                  <IconMinus :size="16" />
                </button>
                <input
                  type="number"
                  v-model.number="settings.dailyGoal"
                  min="1"
                  max="20"
                  @change="updateSetting('dailyGoal', $event.target.value)"
                />
                <button @click="adjustDailyGoal(1)">
                  <IconPlus :size="16" />
                </button>
              </div>
            </div>
          </div>
        </div>

        <!-- Privacy Settings -->
        <div v-if="activeCategory === 'privacy'" class="settings-section">
          <h3 class="section-title">Конфиденциальность</h3>
          
          <div class="setting-group">
            <div class="setting-item">
              <div class="setting-info">
                <label class="setting-label">Профиль в рейтинге</label>
                <p class="setting-description">Показывать ваш профиль в общем рейтинге</p>
              </div>
              <ToggleSwitch
                :value="settings.showInLeaderboard"
                @change="updateSetting('showInLeaderboard', $event)"
              />
            </div>

            <div class="setting-item">
              <div class="setting-info">
                <label class="setting-label">Статистика обучения</label>
                <p class="setting-description">Делать статистику обучения публичной</p>
              </div>
              <ToggleSwitch
                :value="settings.publicStats"
                @change="updateSetting('publicStats', $event)"
              />
            </div>

            <div class="setting-item">
              <div class="setting-info">
                <label class="setting-label">Аналитика</label>
                <p class="setting-description">Разрешить сбор анонимных данных для улучшения сервиса</p>
              </div>
              <ToggleSwitch
                :value="settings.analytics"
                @change="updateSetting('analytics', $event)"
              />
            </div>

            <div class="setting-item">
              <div class="setting-info">
                <label class="setting-label">Cookies</label>
                <p class="setting-description">Разрешить использование cookies</p>
              </div>
              <ToggleSwitch
                :value="settings.cookies"
                @change="updateSetting('cookies', $event)"
              />
            </div>
          </div>
        </div>

        <!-- Data Settings -->
        <div v-if="activeCategory === 'data'" class="settings-section">
          <h3 class="section-title">Данные</h3>
          
          <div class="setting-group">
            <div class="data-action">
              <div class="data-info">
                <h4 class="data-title">Экспорт данных</h4>
                <p class="data-description">
                  Скачать копию всех ваших данных в формате JSON
                </p>
              </div>
              <BaseButton variant="outline" @click="exportData">
                <IconDownload :size="16" />
                Экспортировать
              </BaseButton>
            </div>

            <div class="data-action">
              <div class="data-info">
                <h4 class="data-title">Импорт данных</h4>
                <p class="data-description">
                  Загрузить данные из резервной копии
                </p>
              </div>
              <BaseButton variant="outline" @click="openImportDialog">
                <IconUpload :size="16" />
                Импортировать
              </BaseButton>
              <input
                ref="importInput"
                type="file"
                accept=".json"
                @change="importData"
                class="hidden"
              />
            </div>

            <div class="data-action">
              <div class="data-info">
                <h4 class="data-title">Очистить кэш</h4>
                <p class="data-description">
                  Очистить локальные данные и кэш браузера
                </p>
              </div>
              <BaseButton variant="outline" @click="clearCache">
                <IconTrash :size="16" />
                Очистить
              </BaseButton>
            </div>

            <div class="data-action danger-action">
              <div class="data-info">
                <h4 class="data-title">Сброс настроек</h4>
                <p class="data-description">
                  Вернуть все настройки к значениям по умолчанию
                </p>
              </div>
              <BaseButton variant="error" @click="resetSettings">
                <IconRotateCcw :size="16" />
                Сбросить
              </BaseButton>
            </div>
          </div>
        </div>
      </div>
    </div>

    <template #footer>
      <div class="modal-footer">
        <BaseButton variant="ghost" @click="$emit('close')">
          Закрыть
        </BaseButton>
        <BaseButton variant="primary" @click="saveSettings">
          Сохранить
        </BaseButton>
      </div>
    </template>
  </BaseModal>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useTheme } from '@/composables/useTheme'
import { useNotifications } from '@/composables/useNotifications'
import ToggleSwitch from './ToggleSwitch.vue'

const emit = defineEmits(['close'])

// Composables
const { currentTheme, setTheme } = useTheme()
const { showNotification } = useNotifications()

// Refs
const importInput = ref(null)
const activeCategory = ref('appearance')

// Settings data
const settings = ref({
  // Appearance
  fontSize: 'medium',
  animations: true,
  density: 'normal',
  
  // Editor
  editorTheme: 'vs-dark',
  editorFontSize: 14,
  autocompletion: true,
  autosave: true,
  lineNumbers: true,
  wordWrap: false,
  
  // Learning
  difficultyLevel: 'intermediate',
  showHints: true,
  playSounds: true,
  dailyGoal: 3,
  
  // Privacy
  showInLeaderboard: true,
  publicStats: false,
  analytics: true,
  cookies: true
})

// Data
const categories = [
  { id: 'appearance', label: 'Внешний вид', icon: 'IconPalette' },
  { id: 'editor', label: 'Редактор', icon: 'IconCode' },
  { id: 'learning', label: 'Обучение', icon: 'IconBookOpen' },
  { id: 'privacy', label: 'Конфиденциальность', icon: 'IconShield' },
  { id: 'data', label: 'Данные', icon: 'IconDatabase' }
]

const themes = [
  { value: 'light', label: 'Светлая', icon: 'IconSun' },
  { value: 'dark', label: 'Темная', icon: 'IconMoon' },
  { value: 'auto', label: 'Авто', icon: 'IconMonitor' }
]

const fontSizes = [
  { value: 'small', label: 'Мелкий' },
  { value: 'medium', label: 'Средний' },
  { value: 'large', label: 'Крупный' }
]

// Methods
const loadSettings = () => {
  const savedSettings = localStorage.getItem('app-settings')
  if (savedSettings) {
    try {
      const parsed = JSON.parse(savedSettings)
      settings.value = { ...settings.value, ...parsed }
    } catch (error) {
      console.error('Ошибка загрузки настроек:', error)
    }
  }
}

const saveSettings = () => {
  try {
    localStorage.setItem('app-settings', JSON.stringify(settings.value))
    showNotification('Настройки сохранены', 'success')
    emit('close')
  } catch (error) {
    console.error('Ошибка сохранения настроек:', error)
    showNotification('Ошибка при сохранении настроек', 'error')
  }
}

const updateSetting = (key, value) => {
  settings.value[key] = value
  
  // Применяем некоторые настройки сразу
  if (key === 'fontSize') {
    applyFontSize(value)
  }
}

const changeTheme = (theme) => {
  setTheme(theme)
}

const adjustEditorFontSize = (delta) => {
  const newSize = Math.max(10, Math.min(24, settings.value.editorFontSize + delta))
  updateSetting('editorFontSize', newSize)
}

const adjustDailyGoal = (delta) => {
  const newGoal = Math.max(1, Math.min(20, settings.value.dailyGoal + delta))
  updateSetting('dailyGoal', newGoal)
}

const applyFontSize = (size) => {
  const root = document.documentElement
  const sizes = {
    small: '14px',
    medium: '16px',
    large: '18px'
  }
  root.style.setProperty('--base-font-size', sizes[size] || sizes.medium)
}

const exportData = async () => {
  try {
    // В реальном приложении здесь был бы API запрос
    const userData = {
      settings: settings.value,
      progress: {}, // Данные прогресса
      achievements: [], // Достижения
      exportDate: new Date().toISOString()
    }
    
    const blob = new Blob([JSON.stringify(userData, null, 2)], { 
      type: 'application/json' 
    })
    
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `pythonlearn-data-${new Date().toISOString().split('T')[0]}.json`
    link.click()
    
    URL.revokeObjectURL(url)
    showNotification('Данные экспортированы', 'success')
  } catch (error) {
    console.error('Ошибка экспорта:', error)
    showNotification('Ошибка при экспорте данных', 'error')
  }
}

const openImportDialog = () => {
  importInput.value?.click()
}

const importData = async (event) => {
  const file = event.target.files?.[0]
  if (!file) return
  
  try {
    const text = await file.text()
    const data = JSON.parse(text)
    
    if (data.settings) {
      settings.value = { ...settings.value, ...data.settings }
      showNotification('Настройки импортированы', 'success')
    } else {
      showNotification('Неверный формат файла', 'error')
    }
  } catch (error) {
    console.error('Ошибка импорта:', error)
    showNotification('Ошибка при импорте данных', 'error')
  }
  
  // Очищаем input
  event.target.value = ''
}

const clearCache = () => {
  if (confirm('Вы уверены, что хотите очистить кэш? Это может замедлить загрузку приложения.')) {
    try {
      // Очищаем localStorage (кроме настроек)
      const settingsBackup = localStorage.getItem('app-settings')
      localStorage.clear()
      if (settingsBackup) {
        localStorage.setItem('app-settings', settingsBackup)
      }
      
      // Очищаем sessionStorage
      sessionStorage.clear()
      
      // Перезагружаем страницу
      window.location.reload()
    } catch (error) {
      console.error('Ошибка очистки кэша:', error)
      showNotification('Ошибка при очистке кэша', 'error')
    }
  }
}

const resetSettings = () => {
  if (confirm('Вы уверены, что хотите сбросить все настройки?')) {
    // Сбрасываем к значениям по умолчанию
    settings.value = {
      fontSize: 'medium',
      animations: true,
      density: 'normal',
      editorTheme: 'vs-dark',
      editorFontSize: 14,
      autocompletion: true,
      autosave: true,
      lineNumbers: true,
      wordWrap: false,
      difficultyLevel: 'intermediate',
      showHints: true,
      playSounds: true,
      dailyGoal: 3,
      showInLeaderboard: true,
      publicStats: false,
      analytics: true,
      cookies: true
    }
    
    showNotification('Настройки сброшены', 'success')
  }
}

// Lifecycle
onMounted(() => {
  loadSettings()
})
</script>

<style scoped>
.settings-content {
  display: flex;
  min-height: 500px;
}

/* Sidebar */
.settings-sidebar {
  width: 200px;
  border-right: 1px solid var(--border-primary);
  padding-right: 1.5rem;
  margin-right: 1.5rem;
}

.settings-nav {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.settings-nav-item {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.75rem;
  border: none;
  background: none;
  color: var(--text-secondary);
  text-align: left;
  border-radius: var(--radius-md);
  cursor: pointer;
  transition: all var(--transition-fast);
}

.settings-nav-item:hover {
  color: var(--text-primary);
  background-color: var(--bg-hover);
}

.settings-nav-item.active {
  color: var(--accent-primary);
  background-color: rgba(var(--accent-primary-rgb), 0.1);
}

/* Main Content */
.settings-main {
  flex: 1;
}

.settings-section {
  animation: fadeIn 0.3s ease-out;
}

.section-title {
  margin: 0 0 1.5rem 0;
  font-size: 1.25rem;
  font-weight: 600;
  color: var(--text-primary);
}

.setting-group {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.setting-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 1rem;
  border: 1px solid var(--border-primary);
  border-radius: var(--radius-md);
  gap: 1rem;
}

.setting-info {
  flex: 1;
}

.setting-label {
  display: block;
  font-weight: 500;
  color: var(--text-primary);
  margin-bottom: 0.25rem;
}

.setting-description {
  margin: 0;
  font-size: 0.875rem;
  color: var(--text-secondary);
}

.setting-select {
  min-width: 150px;
  padding: 0.5rem;
  border: 1px solid var(--border-primary);
  border-radius: var(--radius-md);
  background-color: var(--bg-tertiary);
  color: var(--text-primary);
}

/* Theme Selector */
.theme-selector {
  display: flex;
  gap: 0.5rem;
}

.theme-option {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem;
  border: 1px solid var(--border-primary);
  border-radius: var(--radius-md);
  background-color: var(--bg-tertiary);
  color: var(--text-secondary);
  cursor: pointer;
  transition: all var(--transition-fast);
  min-width: 80px;
}

.theme-option:hover {
  border-color: var(--border-secondary);
  color: var(--text-primary);
}

.theme-option.active {
  border-color: var(--accent-primary);
  color: var(--accent-primary);
  background-color: rgba(var(--accent-primary-rgb), 0.1);
}

.theme-option span {
  font-size: 0.75rem;
}

/* Font Size Selector */
.font-size-selector {
  display: flex;
  gap: 0.25rem;
}

.font-size-option {
  padding: 0.5rem 1rem;
  border: 1px solid var(--border-primary);
  background-color: var(--bg-tertiary);
  color: var(--text-secondary);
  cursor: pointer;
  transition: all var(--transition-fast);
}

.font-size-option:first-child {
  border-radius: var(--radius-md) 0 0 var(--radius-md);
}

.font-size-option:last-child {
  border-radius: 0 var(--radius-md) var(--radius-md) 0;
}

.font-size-option:hover {
  color: var(--text-primary);
}

.font-size-option.active {
  border-color: var(--accent-primary);
  color: var(--accent-primary);
  background-color: rgba(var(--accent-primary-rgb), 0.1);
}

/* Number Input */
.number-input {
  display: flex;
  align-items: center;
  border: 1px solid var(--border-primary);
  border-radius: var(--radius-md);
  overflow: hidden;
}

.number-input button {
  padding: 0.5rem;
  border: none;
  background-color: var(--bg-tertiary);
  color: var(--text-secondary);
  cursor: pointer;
  transition: all var(--transition-fast);
}

.number-input button:hover {
  background-color: var(--bg-hover);
  color: var(--text-primary);
}

.number-input input {
  width: 60px;
  padding: 0.5rem;
  border: none;
  background-color: var(--bg-tertiary);
  color: var(--text-primary);
  text-align: center;
}

.number-input input:focus {
  outline: none;
}

/* Data Actions */
.data-action {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 1rem;
  border: 1px solid var(--border-primary);
  border-radius: var(--radius-md);
  gap: 1rem;
}

.data-action.danger-action {
  border-color: var(--accent-error);
  background-color: rgba(var(--accent-error-rgb), 0.05);
}

.data-info {
  flex: 1;
}

.data-title {
  margin: 0 0 0.25rem 0;
  font-weight: 500;
  color: var(--text-primary);
}

.data-description {
  margin: 0;
  font-size: 0.875rem;
  color: var(--text-secondary);
}

/* Modal Footer */
.modal-footer {
  display: flex;
  justify-content: flex-end;
  gap: 0.75rem;
}

/* Utilities */
.hidden {
  display: none;
}

/* Animations */
@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* Responsive */
@media (max-width: 768px) {
  .settings-content {
    flex-direction: column;
  }
  
  .settings-sidebar {
    width: 100%;
    border-right: none;
    border-bottom: 1px solid var(--border-primary);
    padding-right: 0;
    padding-bottom: 1rem;
    margin-right: 0;
    margin-bottom: 1rem;
  }
  
  .settings-nav {
    flex-direction: row;
    overflow-x: auto;
    scrollbar-width: none;
    -ms-overflow-style: none;
  }
  
  .settings-nav::-webkit-scrollbar {
    display: none;
  }
  
  .settings-nav-item {
    flex-shrink: 0;
    white-space: nowrap;
  }
  
  .setting-item,
  .data-action {
    flex-direction: column;
    align-items: flex-start;
    gap: 1rem;
  }
  
  .theme-selector {
    width: 100%;
    justify-content: space-between;
  }
}
</style>