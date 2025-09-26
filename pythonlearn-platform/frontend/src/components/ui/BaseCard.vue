<template>
  <div 
    :class="cardClasses"
    @click="handleClick"
    role="article"
  >
    <!-- Header -->
    <header v-if="$slots.header || title || subtitle" class="base-card-header">
      <slot name="header">
        <div class="base-card-header-content">
          <h3 v-if="title" class="base-card-title">{{ title }}</h3>
          <p v-if="subtitle" class="base-card-subtitle">{{ subtitle }}</p>
        </div>
        <div v-if="$slots.actions" class="base-card-actions">
          <slot name="actions" />
        </div>
      </slot>
    </header>

    <!-- Body -->
    <div v-if="$slots.default" class="base-card-body" :class="bodyClasses">
      <slot />
    </div>

    <!-- Footer -->
    <footer v-if="$slots.footer" class="base-card-footer">
      <slot name="footer" />
    </footer>

    <!-- Loading overlay -->
    <div v-if="loading" class="base-card-loading">
      <BaseSpinner size="md" />
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  // Контент
  title: {
    type: String,
    default: ''
  },
  subtitle: {
    type: String,
    default: ''
  },
  
  // Вариант дизайна
  variant: {
    type: String,
    default: 'default',
    validator: (value) => [
      'default', 'outlined', 'elevated', 'flat', 'gradient'
    ].includes(value)
  },
  
  // Размер
  size: {
    type: String,
    default: 'md',
    validator: (value) => ['sm', 'md', 'lg', 'xl'].includes(value)
  },
  
  // Состояния
  loading: {
    type: Boolean,
    default: false
  },
  disabled: {
    type: Boolean,
    default: false
  },
  
  // Интерактивность
  clickable: {
    type: Boolean,
    default: false
  },
  hoverable: {
    type: Boolean,
    default: false
  },
  
  // Визуальные эффекты
  shadow: {
    type: Boolean,
    default: false
  },
  rounded: {
    type: Boolean,
    default: true
  },
  border: {
    type: Boolean,
    default: true
  },
  
  // Отступы в body
  padding: {
    type: String,
    default: 'default',
    validator: (value) => ['none', 'sm', 'default', 'lg'].includes(value)
  },
  
  // Цветовая схема
  color: {
    type: String,
    default: '',
    validator: (value) => [
      '', 'primary', 'success', 'warning', 'error'
    ].includes(value)
  }
})

const emit = defineEmits(['click'])

// Computed
const cardClasses = computed(() => [
  'base-card',
  `base-card--${props.variant}`,
  `base-card--${props.size}`,
  {
    'base-card--loading': props.loading,
    'base-card--disabled': props.disabled,
    'base-card--clickable': props.clickable,
    'base-card--hoverable': props.hoverable,
    'base-card--shadow': props.shadow,
    'base-card--rounded': props.rounded,
    'base-card--no-border': !props.border,
    [`base-card--${props.color}`]: props.color
  }
])

const bodyClasses = computed(() => [
  `base-card-body--${props.padding}`
])

// Methods
const handleClick = (event) => {
  if (props.disabled || props.loading) return
  if (props.clickable) {
    emit('click', event)
  }
}
</script>

<style scoped>
.base-card {
  @apply relative overflow-hidden;
  background-color: var(--bg-secondary);
  border: 1px solid var(--border-primary);
  transition: all var(--transition-normal);
}

/* Variants */
.base-card--default {
  /* Стили по умолчанию уже определены выше */
}

.base-card--outlined {
  background-color: transparent;
  border: 2px solid var(--border-primary);
}

.base-card--elevated {
  background-color: var(--bg-secondary);
  border: none;
  box-shadow: var(--shadow-md);
}

.base-card--flat {
  background-color: var(--bg-primary);
  border: none;
  box-shadow: none;
}

.base-card--gradient {
  background: linear-gradient(135deg, var(--bg-secondary) 0%, var(--bg-tertiary) 100%);
  border: 1px solid var(--border-primary);
}

/* Sizes */
.base-card--sm {
  border-radius: var(--radius-sm);
}

.base-card--md {
  border-radius: var(--radius-md);
}

.base-card--lg {
  border-radius: var(--radius-lg);
}

.base-card--xl {
  border-radius: var(--radius-xl);
}

/* States */
.base-card--loading {
  pointer-events: none;
}

.base-card--disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.base-card--clickable {
  cursor: pointer;
}

.base-card--clickable:hover:not(.base-card--disabled):not(.base-card--loading) {
  transform: translateY(-2px);
  box-shadow: var(--shadow-lg);
}

.base-card--hoverable:hover:not(.base-card--disabled):not(.base-card--loading) {
  border-color: var(--border-secondary);
  box-shadow: var(--shadow-sm);
}

/* Modifiers */
.base-card--shadow {
  box-shadow: var(--shadow-md);
}

.base-card--shadow:hover {
  box-shadow: var(--shadow-lg);
}

.base-card--rounded {
  /* Уже установлено в размерах */
}

.base-card--no-border {
  border: none;
}

/* Color variants */
.base-card--primary {
  border-color: var(--accent-primary);
}

.base-card--primary .base-card-header {
  background-color: rgba(var(--accent-primary-rgb), 0.1);
  border-bottom-color: var(--accent-primary);
}

.base-card--success {
  border-color: var(--accent-success);
}

.base-card--success .base-card-header {
  background-color: rgba(var(--accent-success-rgb), 0.1);
  border-bottom-color: var(--accent-success);
}

.base-card--warning {
  border-color: var(--accent-warning);
}

.base-card--warning .base-card-header {
  background-color: rgba(var(--accent-warning-rgb), 0.1);
  border-bottom-color: var(--accent-warning);
}

.base-card--error {
  border-color: var(--accent-error);
}

.base-card--error .base-card-header {
  background-color: rgba(var(--accent-error-rgb), 0.1);
  border-bottom-color: var(--accent-error);
}

/* Header */
.base-card-header {
  @apply flex items-center justify-between p-4;
  border-bottom: 1px solid var(--border-primary);
  background-color: var(--bg-tertiary);
}

.base-card-header-content {
  @apply flex-1 min-w-0;
}

.base-card-title {
  @apply text-lg font-semibold truncate;
  color: var(--text-primary);
  margin: 0;
}

.base-card-subtitle {
  @apply text-sm mt-1 truncate;
  color: var(--text-secondary);
  margin: 0;
}

.base-card-actions {
  @apply flex items-center gap-2 ml-4;
}

/* Body */
.base-card-body {
  color: var(--text-primary);
}

.base-card-body--none {
  padding: 0;
}

.base-card-body--sm {
  @apply p-3;
}

.base-card-body--default {
  @apply p-4;
}

.base-card-body--lg {
  @apply p-6;
}

/* Footer */
.base-card-footer {
  @apply p-4;
  border-top: 1px solid var(--border-primary);
  background-color: var(--bg-tertiary);
}

/* Loading overlay */
.base-card-loading {
  @apply absolute inset-0 flex items-center justify-center;
  background-color: rgba(var(--bg-primary-rgb), 0.8);
  backdrop-filter: blur(2px);
  z-index: 10;
}

/* Responsive adjustments */
@media (max-width: 640px) {
  .base-card-header {
    @apply p-3;
  }
  
  .base-card-body--default {
    @apply p-3;
  }
  
  .base-card-footer {
    @apply p-3;
  }
  
  .base-card-title {
    @apply text-base;
  }
}

/* Focus styles for accessibility */
.base-card--clickable:focus {
  outline: 2px solid var(--accent-primary);
  outline-offset: 2px;
}

/* Animation for elevated cards */
.base-card--elevated:hover:not(.base-card--disabled):not(.base-card--loading) {
  transform: translateY(-1px);
  box-shadow: var(--shadow-lg);
}

/* Dark theme adjustments */
[data-theme="dark"] .base-card--outlined {
  background-color: rgba(var(--bg-secondary-rgb), 0.5);
}

[data-theme="dark"] .base-card--flat {
  background-color: var(--bg-primary);
}

[data-theme="dark"] .base-card-header {
  background-color: rgba(var(--bg-tertiary-rgb), 0.8);
}

[data-theme="dark"] .base-card-footer {
  background-color: rgba(var(--bg-tertiary-rgb), 0.8);
}

/* Print styles */
@media print {
  .base-card {
    box-shadow: none !important;
    transform: none !important;
  }
  
  .base-card--clickable:hover {
    transform: none !important;
  }
}
</style>