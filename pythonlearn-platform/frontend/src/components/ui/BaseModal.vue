<template>
  <Teleport to="body">
    <Transition :name="transitionName" appear>
      <div
        v-if="modelValue"
        class="base-modal-backdrop"
        :class="backdropClasses"
        @click="handleBackdropClick"
        role="dialog"
        :aria-modal="true"
        :aria-labelledby="titleId"
        :aria-describedby="contentId"
      >
        <div
          ref="modalRef"
          :class="modalClasses"
          @click.stop
          tabindex="-1"
        >
          <!-- Header -->
          <header v-if="$slots.header || title || showClose" class="base-modal-header">
            <slot name="header">
              <div class="base-modal-header-content">
                <h2 
                  v-if="title" 
                  :id="titleId"
                  class="base-modal-title"
                >
                  {{ title }}
                </h2>
                <p 
                  v-if="subtitle" 
                  class="base-modal-subtitle"
                >
                  {{ subtitle }}
                </p>
              </div>
              <button
                v-if="showClose"
                type="button"
                class="base-modal-close"
                @click="closeModal"
                aria-label="Закрыть"
              >
                <IconX :size="20" />
              </button>
            </slot>
          </header>

          <!-- Body -->
          <div 
            :id="contentId"
            :class="bodyClasses"
          >
            <slot />
          </div>

          <!-- Footer -->
          <footer v-if="$slots.footer" class="base-modal-footer">
            <slot name="footer" />
          </footer>

          <!-- Loading overlay -->
          <div v-if="loading" class="base-modal-loading">
            <BaseSpinner size="lg" />
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup>
import { ref, computed, watch, nextTick, onMounted, onUnmounted } from 'vue'
import { generateId } from '@/utils/helpers'

const props = defineProps({
  // v-model
  modelValue: {
    type: Boolean,
    default: false
  },
  
  // Контент
  title: {
    type: String,
    default: ''
  },
  subtitle: {
    type: String,
    default: ''
  },
  
  // Размер
  size: {
    type: String,
    default: 'md',
    validator: (value) => ['xs', 'sm', 'md', 'lg', 'xl', 'full'].includes(value)
  },
  
  // Поведение
  persistent: {
    type: Boolean,
    default: false
  },
  escClose: {
    type: Boolean,
    default: true
  },
  showClose: {
    type: Boolean,
    default: true
  },
  
  // Состояния
  loading: {
    type: Boolean,
    default: false
  },
  
  // Стилизация
  centered: {
    type: Boolean,
    default: true
  },
  scrollable: {
    type: Boolean,
    default: false
  },
  fullHeight: {
    type: Boolean,
    default: false
  },
  
  // Отступы в body
  padding: {
    type: String,
    default: 'default',
    validator: (value) => ['none', 'sm', 'default', 'lg'].includes(value)
  },
  
  // Анимация
  transition: {
    type: String,
    default: 'modal',
    validator: (value) => ['modal', 'fade', 'slide-up', 'slide-down'].includes(value)
  },
  
  // Z-index
  zIndex: {
    type: Number,
    default: 1000
  }
})

const emit = defineEmits([
  'update:modelValue',
  'open',
  'close',
  'backdrop-click',
  'escape'
])

// Refs
const modalRef = ref(null)
const previousActiveElement = ref(null)

// Computed
const titleId = computed(() => generateId('modal-title'))
const contentId = computed(() => generateId('modal-content'))

const transitionName = computed(() => `modal-${props.transition}`)

const backdropClasses = computed(() => [
  'base-modal-backdrop',
  {
    'base-modal-backdrop--centered': props.centered,
    'base-modal-backdrop--full-height': props.fullHeight
  }
])

const modalClasses = computed(() => [
  'base-modal',
  `base-modal--${props.size}`,
  {
    'base-modal--loading': props.loading,
    'base-modal--scrollable': props.scrollable,
    'base-modal--full-height': props.fullHeight
  }
])

const bodyClasses = computed(() => [
  'base-modal-body',
  `base-modal-body--${props.padding}`,
  {
    'base-modal-body--scrollable': props.scrollable
  }
])

// Methods
const openModal = () => {
  emit('update:modelValue', true)
  emit('open')
}

const closeModal = () => {
  if (props.persistent) return
  emit('update:modelValue', false)
  emit('close')
}

const handleBackdropClick = (event) => {
  emit('backdrop-click', event)
  if (!props.persistent) {
    closeModal()
  }
}

const handleEscape = (event) => {
  if (event.key === 'Escape' && props.modelValue) {
    emit('escape', event)
    if (props.escClose && !props.persistent) {
      closeModal()
    }
  }
}

const trapFocus = (event) => {
  if (!modalRef.value) return
  
  const focusableElements = modalRef.value.querySelectorAll(
    'a[href], button, textarea, input, select, [tabindex]:not([tabindex="-1"])'
  )
  
  const firstElement = focusableElements[0]
  const lastElement = focusableElements[focusableElements.length - 1]
  
  if (event.key === 'Tab') {
    if (event.shiftKey) {
      if (document.activeElement === firstElement) {
        lastElement.focus()
        event.preventDefault()
      }
    } else {
      if (document.activeElement === lastElement) {
        firstElement.focus()
        event.preventDefault()
      }
    }
  }
}

const lockBodyScroll = () => {
  document.body.style.overflow = 'hidden'
  document.body.style.paddingRight = getScrollbarWidth() + 'px'
}

const unlockBodyScroll = () => {
  document.body.style.overflow = ''
  document.body.style.paddingRight = ''
}

const getScrollbarWidth = () => {
  const scrollDiv = document.createElement('div')
  scrollDiv.style.cssText = 'width: 100px; height: 100px; overflow: scroll; position: absolute; top: -9999px;'
  document.body.appendChild(scrollDiv)
  const scrollbarWidth = scrollDiv.offsetWidth - scrollDiv.clientWidth
  document.body.removeChild(scrollDiv)
  return scrollbarWidth
}

const focusModal = () => {
  if (modalRef.value) {
    const firstFocusable = modalRef.value.querySelector(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    )
    
    if (firstFocusable) {
      firstFocusable.focus()
    } else {
      modalRef.value.focus()
    }
  }
}

// Watchers
watch(() => props.modelValue, async (isOpen) => {
  if (isOpen) {
    // Запоминаем активный элемент
    previousActiveElement.value = document.activeElement
    
    // Блокируем скролл
    lockBodyScroll()
    
    await nextTick()
    
    // Фокусируемся на модалке
    focusModal()
  } else {
    // Разблокируем скролл
    unlockBodyScroll()
    
    // Возвращаем фокус
    if (previousActiveElement.value) {
      previousActiveElement.value.focus()
    }
  }
})

// Lifecycle
onMounted(() => {
  document.addEventListener('keydown', handleEscape)
  document.addEventListener('keydown', trapFocus)
})

onUnmounted(() => {
  document.removeEventListener('keydown', handleEscape)
  document.removeEventListener('keydown', trapFocus)
  
  // Разблокируем скролл при размонтировании
  if (props.modelValue) {
    unlockBodyScroll()
  }
})

// Expose methods
defineExpose({
  open: openModal,
  close: closeModal
})
</script>

<style scoped>
.base-modal-backdrop {
  @apply fixed inset-0 z-50 overflow-y-auto;
  background-color: rgba(0, 0, 0, 0.5);
  backdrop-filter: blur(4px);
}

.base-modal-backdrop--centered {
  @apply flex items-center justify-center p-4;
}

.base-modal-backdrop--full-height {
  @apply items-stretch;
}

.base-modal {
  @apply relative bg-white rounded-lg shadow-xl;
  background-color: var(--bg-secondary);
  border: 1px solid var(--border-primary);
  max-height: 90vh;
  width: 100%;
  max-width: 100%;
  margin: auto;
}

/* Sizes */
.base-modal--xs {
  max-width: 320px;
}

.base-modal--sm {
  max-width: 384px;
}

.base-modal--md {
  max-width: 512px;
}

.base-modal--lg {
  max-width: 768px;
}

.base-modal--xl {
  max-width: 1024px;
}

.base-modal--full {
  @apply h-full m-0 rounded-none;
  max-width: 100%;
  max-height: 100%;
}

.base-modal--scrollable {
  @apply flex flex-col;
  max-height: 90vh;
}

.base-modal--full-height {
  height: 100vh;
  max-height: 100vh;
}

.base-modal--loading {
  pointer-events: none;
}

/* Header */
.base-modal-header {
  @apply flex items-center justify-between p-6 border-b;
  border-color: var(--border-primary);
  background-color: var(--bg-tertiary);
  border-radius: var(--radius-lg) var(--radius-lg) 0 0;
}

.base-modal-header-content {
  @apply flex-1 min-w-0;
}

.base-modal-title {
  @apply text-xl font-semibold;
  color: var(--text-primary);
  margin: 0;
}

.base-modal-subtitle {
  @apply text-sm mt-1;
  color: var(--text-secondary);
  margin: 0;
}

.base-modal-close {
  @apply p-2 rounded-lg transition-colors;
  color: var(--text-secondary);
  background: none;
  border: none;
  cursor: pointer;
}

.base-modal-close:hover {
  color: var(--text-primary);
  background-color: var(--bg-hover);
}

/* Body */
.base-modal-body {
  color: var(--text-primary);
}

.base-modal-body--none {
  padding: 0;
}

.base-modal-body--sm {
  @apply p-4;
}

.base-modal-body--default {
  @apply p-6;
}

.base-modal-body--lg {
  @apply p-8;
}

.base-modal-body--scrollable {
  @apply overflow-y-auto flex-1;
}

/* Footer */
.base-modal-footer {
  @apply p-6 border-t;
  border-color: var(--border-primary);
  background-color: var(--bg-tertiary);
  border-radius: 0 0 var(--radius-lg) var(--radius-lg);
}

/* Loading overlay */
.base-modal-loading {
  @apply absolute inset-0 flex items-center justify-center;
  background-color: rgba(var(--bg-secondary-rgb), 0.8);
  backdrop-filter: blur(2px);
  z-index: 10;
  border-radius: var(--radius-lg);
}

/* Responsive */
@media (max-width: 640px) {
  .base-modal-backdrop--centered {
    @apply p-2;
  }
  
  .base-modal {
    margin: 0;
    border-radius: var(--radius-lg) var(--radius-lg) 0 0;
  }
  
  .base-modal--xs,
  .base-modal--sm,
  .base-modal--md,
  .base-modal--lg,
  .base-modal--xl {
    max-width: 100%;
    width: 100%;
  }
  
  .base-modal-header {
    @apply p-4;
  }
  
  .base-modal-body--default {
    @apply p-4;
  }
  
  .base-modal-footer {
    @apply p-4;
  }
}

/* Transitions */
.modal-modal-enter-active,
.modal-modal-leave-active {
  transition: all 0.3s ease;
}

.modal-modal-enter-from,
.modal-modal-leave-to {
  opacity: 0;
}

.modal-modal-enter-from .base-modal,
.modal-modal-leave-to .base-modal {
  transform: scale(0.9) translateY(-50px);
}

.modal-fade-enter-active,
.modal-fade-leave-active {
  transition: opacity 0.3s ease;
}

.modal-fade-enter-from,
.modal-fade-leave-to {
  opacity: 0;
}

.modal-slide-up-enter-active,
.modal-slide-up-leave-active {
  transition: all 0.3s ease;
}

.modal-slide-up-enter-from,
.modal-slide-up-leave-to {
  opacity: 0;
}

.modal-slide-up-enter-from .base-modal,
.modal-slide-up-leave-to .base-modal {
  transform: translateY(100%);
}

.modal-slide-down-enter-active,
.modal-slide-down-leave-active {
  transition: all 0.3s ease;
}

.modal-slide-down-enter-from,
.modal-slide-down-leave-to {
  opacity: 0;
}

.modal-slide-down-enter-from .base-modal,
.modal-slide-down-leave-to .base-modal {
  transform: translateY(-100%);
}

/* Focus styles */
.base-modal:focus {
  outline: none;
}

/* Dark theme adjustments */
[data-theme="dark"] .base-modal-backdrop {
  background-color: rgba(0, 0, 0, 0.7);
}

[data-theme="dark"] .base-modal {
  background-color: var(--bg-secondary);
  border-color: var(--border-primary);
}

[data-theme="dark"] .base-modal-header {
  background-color: var(--bg-tertiary);
}

[data-theme="dark"] .base-modal-footer {
  background-color: var(--bg-tertiary);
}
</style>