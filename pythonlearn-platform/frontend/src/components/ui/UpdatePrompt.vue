<template>
  <Teleport to="body">
    <div class="update-prompt-overlay" @click="handleOverlayClick">
      <div class="update-prompt" @click.stop>
        <!-- Icon -->
        <div class="update-icon">
          <IconRefreshCw :size="48" class="update-icon-svg" />
        </div>

        <!-- Content -->
        <div class="update-content">
          <h3 class="update-title">Доступно обновление</h3>
          <p class="update-description">
            Новая версия PythonLearn готова к установке. 
            Обновление включает исправления ошибок и новые функции.
          </p>

          <!-- Features List -->
          <div v-if="updateFeatures.length > 0" class="update-features">
            <h4 class="features-title">Что нового:</h4>
            <ul class="features-list">
              <li v-for="feature in updateFeatures" :key="feature" class="feature-item">
                <IconCheck :size="16" class="feature-icon" />
                {{ feature }}
              </li>
            </ul>
          </div>

          <!-- Version Info -->
          <div class="version-info">
            <div class="version-item">
              <span class="version-label">Текущая версия:</span>
              <span class="version-value">{{ currentVersion }}</span>
            </div>
            <div class="version-item">
              <span class="version-label">Новая версия:</span>
              <span class="version-value version-value--new">{{ newVersion }}</span>
            </div>
          </div>

          <!-- Size Info -->
          <div v-if="updateSize" class="update-size">
            <IconDownload :size="16" />
            <span>Размер обновления: {{ updateSize }}</span>
          </div>
        </div>

        <!-- Actions -->
        <div class="update-actions">
          <BaseButton
            variant="primary"
            @click="handleUpdate"
            :loading="updating"
            :disabled="updating"
            leftIcon="IconDownload"
            class="update-btn"
          >
            {{ updating ? 'Обновление...' : 'Обновить сейчас' }}
          </BaseButton>
          
          <BaseButton
            variant="ghost"
            @click="handleDismiss"
            :disabled="updating"
            class="dismiss-btn"
          >
            {{ postponeText }}
          </BaseButton>
        </div>

        <!-- Options -->
        <div class="update-options">
          <label class="auto-update-option">
            <input
              type="checkbox"
              v-model="autoUpdate"
              @change="handleAutoUpdateChange"
              :disabled="updating"
            />
            <span class="checkbox-custom"></span>
            <span class="checkbox-label">Автоматически устанавливать обновления</span>
          </label>
        </div>

        <!-- Progress Bar -->
        <div v-if="updating" class="update-progress">
          <BaseProgressBar
            :value="updateProgress"
            :max="100"
            variant="primary"
            size="sm"
            animated
          />
          <span class="progress-text">{{ updateProgress }}%</span>
        </div>
      </div>
    </div>
  </Teleport>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useNotifications } from '@/composables/useNotifications'

const props = defineProps({
  currentVersion: {
    type: String,
    default: '1.0.0'
  },
  newVersion: {
    type: String,
    default: '1.1.0'
  },
  updateSize: {
    type: String,
    default: '2.3 MB'
  },
  features: {
    type: Array,
    default: () => []
  },
  autoUpdateEnabled: {
    type: Boolean,
    default: false
  },
  mandatory: {
    type: Boolean,
    default: false
  }
})

const emit = defineEmits(['update', 'dismiss', 'auto-update-change'])

// Composables
const { showNotification } = useNotifications()

// Local state
const updating = ref(false)
const updateProgress = ref(0)
const autoUpdate = ref(props.autoUpdateEnabled)
const dismissCount = ref(0)

// Computed
const updateFeatures = computed(() => {
  if (props.features.length > 0) {
    return props.features
  }
  
  // Default features if none provided
  return [
    'Улучшена производительность редактора кода',
    'Исправлены ошибки с сохранением прогресса',
    'Добавлены новые подсказки для заданий',
    'Улучшена совместимость с мобильными устройствами'
  ]
})

const postponeText = computed(() => {
  if (props.mandatory) {
    return 'Обновить позже'
  }
  
  if (dismissCount.value === 0) {
    return 'Напомнить позже'
  } else if (dismissCount.value === 1) {
    return 'Напомнить завтра'
  } else {
    return 'Больше не напоминать'
  }
})

// Methods
const handleUpdate = async () => {
  if (updating.value) return
  
  updating.value = true
  updateProgress.value = 0
  
  try {
    // Simulate update progress
    const progressInterval = setInterval(() => {
      updateProgress.value += Math.random() * 15
      
      if (updateProgress.value >= 100) {
        clearInterval(progressInterval)
        updateProgress.value = 100
        
        setTimeout(() => {
          emit('update')
          showNotification('Обновление установлено! Перезагружаем приложение...', 'success')
          
          // Reload the page after a short delay
          setTimeout(() => {
            window.location.reload()
          }, 1500)
        }, 500)
      }
    }, 300)
    
  } catch (error) {
    console.error('Ошибка обновления:', error)
    showNotification('Ошибка при установке обновления', 'error')
    updating.value = false
  }
}

const handleDismiss = () => {
  if (updating.value) return
  
  dismissCount.value++
  
  // Set reminder based on dismiss count
  let reminderDelay = 0
  if (dismissCount.value === 1) {
    reminderDelay = 4 * 60 * 60 * 1000 // 4 hours
  } else if (dismissCount.value === 2) {
    reminderDelay = 24 * 60 * 60 * 1000 // 1 day
  }
  
  if (reminderDelay > 0 && !props.mandatory) {
    localStorage.setItem('update-reminder', Date.now() + reminderDelay)
  }
  
  emit('dismiss', {
    dismissCount: dismissCount.value,
    reminderDelay
  })
}

const handleOverlayClick = () => {
  if (!props.mandatory && !updating.value) {
    handleDismiss()
  }
}

const handleAutoUpdateChange = () => {
  emit('auto-update-change', autoUpdate.value)
  
  localStorage.setItem('auto-update-enabled', autoUpdate.value)
  
  showNotification(
    autoUpdate.value 
      ? 'Автообновления включены' 
      : 'Автообновления отключены',
    'info'
  )
}

// Lifecycle
onMounted(() => {
  // Check for saved auto-update preference
  const savedAutoUpdate = localStorage.getItem('auto-update-enabled')
  if (savedAutoUpdate !== null) {
    autoUpdate.value = savedAutoUpdate === 'true'
  }
  
  // If auto-update is enabled and this is not a mandatory update, auto-install
  if (autoUpdate.value && !props.mandatory) {
    setTimeout(() => {
      showNotification('Автоматическая установка обновления...', 'info')
      handleUpdate()
    }, 2000)
  }
})
</script>

<style scoped>
.update-prompt-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  backdrop-filter: blur(4px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 10000;
  padding: 1rem;
}

.update-prompt {
  background-color: var(--bg-secondary);
  border: 1px solid var(--border-primary);
  border-radius: var(--radius-xl);
  box-shadow: var(--shadow-xl);
  max-width: 480px;
  width: 100%;
  overflow: hidden;
  animation: slideUp 0.3s ease-out;
}

/* Icon */
.update-icon {
  padding: 2rem 2rem 1rem 2rem;
  text-align: center;
}

.update-icon-svg {
  color: var(--accent-primary);
  animation: pulse 2s ease-in-out infinite;
}

/* Content */
.update-content {
  padding: 0 2rem 1rem 2rem;
  text-align: center;
}

.update-title {
  margin: 0 0 0.75rem 0;
  font-size: 1.5rem;
  font-weight: 600;
  color: var(--text-primary);
}

.update-description {
  margin: 0 0 1.5rem 0;
  color: var(--text-secondary);
  line-height: 1.6;
}

/* Features */
.update-features {
  margin-bottom: 1.5rem;
  text-align: left;
}

.features-title {
  margin: 0 0 0.75rem 0;
  font-size: 1rem;
  font-weight: 600;
  color: var(--text-primary);
}

.features-list {
  list-style: none;
  margin: 0;
  padding: 0;
}

.feature-item {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-bottom: 0.5rem;
  font-size: 0.875rem;
  color: var(--text-secondary);
}

.feature-icon {
  color: var(--accent-success);
  flex-shrink: 0;
}

/* Version Info */
.version-info {
  display: flex;
  justify-content: space-between;
  gap: 1rem;
  margin-bottom: 1rem;
  padding: 1rem;
  background-color: var(--bg-tertiary);
  border-radius: var(--radius-md);
}

.version-item {
  text-align: left;
}

.version-label {
  display: block;
  font-size: 0.75rem;
  color: var(--text-muted);
  text-transform: uppercase;
  letter-spacing: 0.05em;
  margin-bottom: 0.25rem;
}

.version-value {
  font-family: var(--font-code);
  font-weight: 600;
  color: var(--text-primary);
}

.version-value--new {
  color: var(--accent-primary);
}

/* Update Size */
.update-size {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  font-size: 0.875rem;
  color: var(--text-muted);
  margin-bottom: 1rem;
}

/* Actions */
.update-actions {
  display: flex;
  gap: 0.75rem;
  padding: 0 2rem 1rem 2rem;
}

.update-btn {
  flex: 1;
}

.dismiss-btn {
  flex: 1;
}

/* Options */
.update-options {
  padding: 1rem 2rem;
  border-top: 1px solid var(--border-primary);
  background-color: var(--bg-tertiary);
}

.auto-update-option {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  cursor: pointer;
  user-select: none;
}

.auto-update-option input[type="checkbox"] {
  position: absolute;
  opacity: 0;
  width: 0;
  height: 0;
}

.checkbox-custom {
  width: 18px;
  height: 18px;
  border: 2px solid var(--border-primary);
  border-radius: var(--radius-sm);
  background-color: var(--bg-secondary);
  position: relative;
  transition: all var(--transition-fast);
  flex-shrink: 0;
}

.checkbox-custom::after {
  content: '';
  position: absolute;
  width: 6px;
  height: 10px;
  border: solid white;
  border-width: 0 2px 2px 0;
  transform: rotate(45deg) scale(0);
  top: 1px;
  left: 5px;
  transition: transform var(--transition-fast);
}

.auto-update-option input:checked + .checkbox-custom {
  background-color: var(--accent-primary);
  border-color: var(--accent-primary);
}

.auto-update-option input:checked + .checkbox-custom::after {
  transform: rotate(45deg) scale(1);
}

.checkbox-label {
  font-size: 0.875rem;
  color: var(--text-primary);
}

/* Progress */
.update-progress {
  padding: 1rem 2rem;
  border-top: 1px solid var(--border-primary);
}

.progress-text {
  display: block;
  text-align: center;
  margin-top: 0.5rem;
  font-size: 0.875rem;
  color: var(--text-secondary);
  font-weight: 500;
}

/* Animations */
@keyframes slideUp {
  from {
    opacity: 0;
    transform: translateY(20px) scale(0.95);
  }
  to {
    opacity: 1;
    transform: translateY(0) scale(1);
  }
}

@keyframes pulse {
  0%, 100% {
    opacity: 1;
    transform: scale(1);
  }
  50% {
    opacity: 0.7;
    transform: scale(1.05);
  }
}

/* Responsive */
@media (max-width: 640px) {
  .update-prompt {
    margin: 1rem;
    max-width: none;
  }
  
  .update-icon {
    padding: 1.5rem 1.5rem 0.75rem 1.5rem;
  }
  
  .update-content {
    padding: 0 1.5rem 0.75rem 1.5rem;
  }
  
  .update-title {
    font-size: 1.25rem;
  }
  
  .version-info {
    flex-direction: column;
    gap: 0.75rem;
  }
  
  .update-actions {
    flex-direction: column;
    padding: 0 1.5rem 0.75rem 1.5rem;
  }
  
  .update-options {
    padding: 0.75rem 1.5rem;
  }
  
  .update-progress {
    padding: 0.75rem 1.5rem;
  }
}

/* Reduced motion */
@media (prefers-reduced-motion: reduce) {
  .update-prompt {
    animation: none;
  }
  
  .update-icon-svg {
    animation: none;
  }
  
  .checkbox-custom,
  .checkbox-custom::after {
    transition: none;
  }
}

/* High contrast mode */
@media (prefers-contrast: high) {
  .update-prompt {
    border-width: 2px;
  }
  
  .checkbox-custom {
    border-width: 3px;
  }
}

/* Print styles */
@media print {
  .update-prompt-overlay {
    display: none !important;
  }
}
</style>