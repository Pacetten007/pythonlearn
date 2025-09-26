<template>
  <Teleport to="body">
    <div class="notification-container" :class="containerClasses">
      <TransitionGroup name="notification" tag="div">
        <div
          v-for="notification in notifications"
          :key="notification.id"
          class="notification"
          :class="getNotificationClasses(notification)"
          @click="handleNotificationClick(notification)"
          @mouseenter="pauseTimer(notification)"
          @mouseleave="resumeTimer(notification)"
        >
          <!-- Icon -->
          <div class="notification-icon">
            <component 
              :is="getNotificationIcon(notification.type)" 
              :size="20" 
              class="notification-icon-svg"
            />
          </div>

          <!-- Content -->
          <div class="notification-content">
            <h4 v-if="notification.title" class="notification-title">
              {{ notification.title }}
            </h4>
            <p class="notification-message">
              {{ notification.message }}
            </p>
            
            <!-- Actions -->
            <div v-if="notification.actions" class="notification-actions">
              <button
                v-for="action in notification.actions"
                :key="action.label"
                class="notification-action"
                :class="`notification-action--${action.style || 'default'}`"
                @click.stop="handleActionClick(action, notification)"
              >
                {{ action.label }}
              </button>
            </div>
          </div>

          <!-- Close Button -->
          <button
            v-if="notification.closable !== false"
            class="notification-close"
            @click.stop="removeNotification(notification.id)"
            aria-label="Закрыть уведомление"
          >
            <IconX :size="16" />
          </button>

          <!-- Progress Bar -->
          <div
            v-if="notification.duration && !notification.paused"
            class="notification-progress"
            :style="getProgressStyle(notification)"
          ></div>
        </div>
      </TransitionGroup>
    </div>
  </Teleport>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { generateId } from '@/utils/helpers'

// Props
const props = defineProps({
  position: {
    type: String,
    default: 'top-right',
    validator: (value) => [
      'top-left', 'top-center', 'top-right',
      'bottom-left', 'bottom-center', 'bottom-right'
    ].includes(value)
  },
  maxNotifications: {
    type: Number,
    default: 5
  }
})

// Reactive data
const notifications = ref([])
const timers = ref(new Map())

// Computed
const containerClasses = computed(() => [
  `notification-container--${props.position}`
])

// Event listener for global notifications
const handleGlobalNotification = (event) => {
  addNotification(event.detail)
}

// Methods
const addNotification = (notificationData) => {
  const notification = {
    id: generateId('notification'),
    type: 'info',
    title: '',
    message: '',
    duration: 5000,
    closable: true,
    persistent: false,
    actions: null,
    onClick: null,
    onClose: null,
    createdAt: Date.now(),
    paused: false,
    ...notificationData
  }

  // Add to the beginning of the array
  notifications.value.unshift(notification)

  // Remove old notifications if we exceed the maximum
  if (notifications.value.length > props.maxNotifications) {
    const removed = notifications.value.splice(props.maxNotifications)
    removed.forEach(n => clearTimer(n.id))
  }

  // Set auto-remove timer if duration is specified
  if (notification.duration && notification.duration > 0 && !notification.persistent) {
    setTimer(notification)
  }
}

const removeNotification = (id) => {
  const index = notifications.value.findIndex(n => n.id === id)
  if (index > -1) {
    const notification = notifications.value[index]
    
    // Call onClose callback if provided
    if (notification.onClose) {
      notification.onClose(notification)
    }
    
    notifications.value.splice(index, 1)
    clearTimer(id)
  }
}

const setTimer = (notification) => {
  const startTime = Date.now()
  
  const timer = setInterval(() => {
    if (notification.paused) return
    
    const elapsed = Date.now() - startTime
    
    if (elapsed >= notification.duration) {
      removeNotification(notification.id)
    }
  }, 100)
  
  timers.value.set(notification.id, { timer, startTime })
}

const clearTimer = (id) => {
  const timerData = timers.value.get(id)
  if (timerData) {
    clearInterval(timerData.timer)
    timers.value.delete(id)
  }
}

const pauseTimer = (notification) => {
  if (notification.duration && !notification.persistent) {
    notification.paused = true
  }
}

const resumeTimer = (notification) => {
  if (notification.duration && !notification.persistent) {
    notification.paused = false
  }
}

const handleNotificationClick = (notification) => {
  if (notification.onClick) {
    notification.onClick(notification)
  }
}

const handleActionClick = (action, notification) => {
  if (action.handler) {
    action.handler(notification)
  }
  
  // Remove notification after action if not persistent
  if (!notification.persistent) {
    removeNotification(notification.id)
  }
}

const getNotificationClasses = (notification) => [
  `notification--${notification.type}`,
  {
    'notification--clickable': !!notification.onClick,
    'notification--with-actions': !!notification.actions,
    'notification--persistent': notification.persistent
  }
]

const getNotificationIcon = (type) => {
  const icons = {
    success: 'IconCheckCircle',
    error: 'IconXCircle',
    warning: 'IconAlertTriangle',
    info: 'IconInfo',
    loading: 'IconRefreshCw'
  }
  return icons[type] || 'IconInfo'
}

const getProgressStyle = (notification) => {
  if (!notification.duration || notification.paused) return {}
  
  const timerData = timers.value.get(notification.id)
  if (!timerData) return {}
  
  const elapsed = Date.now() - timerData.startTime
  const progress = Math.min((elapsed / notification.duration) * 100, 100)
  
  return {
    width: `${100 - progress}%`,
    transition: notification.paused ? 'none' : 'width 100ms linear'
  }
}

// Utility methods for external use
const success = (message, options = {}) => {
  addNotification({
    type: 'success',
    message,
    ...options
  })
}

const error = (message, options = {}) => {
  addNotification({
    type: 'error',
    message,
    duration: 0, // Don't auto-remove errors by default
    ...options
  })
}

const warning = (message, options = {}) => {
  addNotification({
    type: 'warning',
    message,
    ...options
  })
}

const info = (message, options = {}) => {
  addNotification({
    type: 'info',
    message,
    ...options
  })
}

const loading = (message, options = {}) => {
  return addNotification({
    type: 'loading',
    message,
    duration: 0,
    closable: false,
    ...options
  })
}

const clear = () => {
  notifications.value.forEach(n => clearTimer(n.id))
  notifications.value.splice(0)
}

const clearByType = (type) => {
  const toRemove = notifications.value.filter(n => n.type === type)
  toRemove.forEach(n => removeNotification(n.id))
}

// Lifecycle
onMounted(() => {
  // Listen for global notification events
  document.addEventListener('notification', handleGlobalNotification)
  
  // Expose methods globally
  window.$notification = {
    success,
    error,
    warning,
    info,
    loading,
    clear,
    clearByType,
    add: addNotification,
    remove: removeNotification
  }
})

onUnmounted(() => {
  document.removeEventListener('notification', handleGlobalNotification)
  
  // Clear all timers
  timers.value.forEach(({ timer }) => clearInterval(timer))
  timers.value.clear()
  
  // Remove global methods
  if (window.$notification) {
    delete window.$notification
  }
})

// Expose methods for parent components
defineExpose({
  success,
  error,
  warning,
  info,
  loading,
  clear,
  clearByType,
  addNotification,
  removeNotification
})
</script>

<style scoped>
.notification-container {
  position: fixed;
  z-index: 9999;
  pointer-events: none;
  max-width: 400px;
  width: 100%;
}

/* Positioning */
.notification-container--top-left {
  top: 1rem;
  left: 1rem;
}

.notification-container--top-center {
  top: 1rem;
  left: 50%;
  transform: translateX(-50%);
}

.notification-container--top-right {
  top: 1rem;
  right: 1rem;
}

.notification-container--bottom-left {
  bottom: 1rem;
  left: 1rem;
}

.notification-container--bottom-center {
  bottom: 1rem;
  left: 50%;
  transform: translateX(-50%);
}

.notification-container--bottom-right {
  bottom: 1rem;
  right: 1rem;
}

/* Notification */
.notification {
  position: relative;
  display: flex;
  align-items: flex-start;
  gap: 0.75rem;
  padding: 1rem;
  margin-bottom: 0.75rem;
  background-color: var(--bg-secondary);
  border: 1px solid var(--border-primary);
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow-lg);
  pointer-events: auto;
  overflow: hidden;
  max-width: 100%;
  word-wrap: break-word;
}

.notification--clickable {
  cursor: pointer;
}

.notification--clickable:hover {
  transform: translateY(-1px);
  box-shadow: var(--shadow-xl);
}

/* Notification Types */
.notification--success {
  border-left: 4px solid var(--accent-success);
}

.notification--success .notification-icon-svg {
  color: var(--accent-success);
}

.notification--error {
  border-left: 4px solid var(--accent-error);
}

.notification--error .notification-icon-svg {
  color: var(--accent-error);
}

.notification--warning {
  border-left: 4px solid var(--accent-warning);
}

.notification--warning .notification-icon-svg {
  color: var(--accent-warning);
}

.notification--info {
  border-left: 4px solid var(--accent-primary);
}

.notification--info .notification-icon-svg {
  color: var(--accent-primary);
}

.notification--loading .notification-icon-svg {
  color: var(--accent-primary);
  animation: spin 1s linear infinite;
}

/* Icon */
.notification-icon {
  flex-shrink: 0;
  margin-top: 0.125rem;
}

/* Content */
.notification-content {
  flex: 1;
  min-width: 0;
}

.notification-title {
  margin: 0 0 0.25rem 0;
  font-size: 0.875rem;
  font-weight: 600;
  color: var(--text-primary);
}

.notification-message {
  margin: 0;
  font-size: 0.875rem;
  color: var(--text-secondary);
  line-height: 1.4;
}

/* Actions */
.notification-actions {
  display: flex;
  gap: 0.5rem;
  margin-top: 0.75rem;
}

.notification-action {
  padding: 0.25rem 0.75rem;
  border: 1px solid var(--border-primary);
  border-radius: var(--radius-md);
  background-color: var(--bg-tertiary);
  color: var(--text-primary);
  font-size: 0.75rem;
  font-weight: 500;
  cursor: pointer;
  transition: all var(--transition-fast);
}

.notification-action:hover {
  background-color: var(--bg-hover);
  border-color: var(--border-secondary);
}

.notification-action--primary {
  background-color: var(--accent-primary);
  border-color: var(--accent-primary);
  color: white;
}

.notification-action--primary:hover {
  background-color: var(--accent-primary);
  filter: brightness(1.1);
}

.notification-action--danger {
  background-color: var(--accent-error);
  border-color: var(--accent-error);
  color: white;
}

.notification-action--danger:hover {
  background-color: var(--accent-error);
  filter: brightness(1.1);
}

/* Close Button */
.notification-close {
  flex-shrink: 0;
  padding: 0.25rem;
  border: none;
  background: none;
  color: var(--text-muted);
  cursor: pointer;
  border-radius: var(--radius-sm);
  transition: all var(--transition-fast);
  margin-top: -0.125rem;
  margin-right: -0.25rem;
}

.notification-close:hover {
  background-color: var(--bg-hover);
  color: var(--text-primary);
}

/* Progress Bar */
.notification-progress {
  position: absolute;
  bottom: 0;
  left: 0;
  height: 2px;
  background-color: currentColor;
  opacity: 0.3;
  transition: width 100ms linear;
}

.notification--success .notification-progress {
  background-color: var(--accent-success);
}

.notification--error .notification-progress {
  background-color: var(--accent-error);
}

.notification--warning .notification-progress {
  background-color: var(--accent-warning);
}

.notification--info .notification-progress {
  background-color: var(--accent-primary);
}

/* Animations */
@keyframes spin {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}

/* Transition Animations */
.notification-enter-active {
  transition: all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
}

.notification-leave-active {
  transition: all 0.3s ease-in;
}

.notification-enter-from {
  opacity: 0;
  transform: translateX(100%);
}

.notification-leave-to {
  opacity: 0;
  transform: translateX(100%);
}

/* For left-positioned containers */
.notification-container--top-left .notification-enter-from,
.notification-container--bottom-left .notification-enter-from {
  transform: translateX(-100%);
}

.notification-container--top-left .notification-leave-to,
.notification-container--bottom-left .notification-leave-to {
  transform: translateX(-100%);
}

/* For center-positioned containers */
.notification-container--top-center .notification-enter-from,
.notification-container--bottom-center .notification-enter-from {
  transform: translateY(-100%);
}

.notification-container--top-center .notification-leave-to,
.notification-container--bottom-center .notification-leave-to {
  transform: translateY(-100%);
}

/* Move animation for stacked notifications */
.notification-move {
  transition: transform 0.3s ease;
}

/* Responsive */
@media (max-width: 640px) {
  .notification-container {
    left: 1rem !important;
    right: 1rem !important;
    max-width: none;
    transform: none !important;
  }
  
  .notification {
    margin-bottom: 0.5rem;
    padding: 0.75rem;
  }
  
  .notification-title {
    font-size: 0.8125rem;
  }
  
  .notification-message {
    font-size: 0.8125rem;
  }
  
  .notification-actions {
    flex-direction: column;
    gap: 0.25rem;
  }
  
  .notification-action {
    width: 100%;
    justify-content: center;
  }
}

/* Reduced motion */
@media (prefers-reduced-motion: reduce) {
  .notification-enter-active,
  .notification-leave-active,
  .notification-move {
    transition: none !important;
  }
  
  .notification--loading .notification-icon-svg {
    animation: none;
  }
  
  .notification-progress {
    transition: none !important;
  }
}

/* High contrast mode */
@media (prefers-contrast: high) {
  .notification {
    border-width: 2px;
  }
  
  .notification--success,
  .notification--error,
  .notification--warning,
  .notification--info {
    border-left-width: 6px;
  }
}

/* Print styles */
@media print {
  .notification-container {
    display: none !important;
  }
}
</style>