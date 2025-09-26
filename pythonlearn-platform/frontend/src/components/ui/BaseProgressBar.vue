<template>
  <div :class="containerClasses">
    <!-- Label -->
    <div v-if="$slots.label || label" class="base-progress-label">
      <slot name="label">
        <span class="base-progress-label-text">{{ label }}</span>
      </slot>
      <span v-if="showValue" class="base-progress-value">
        {{ formatValue }}
      </span>
    </div>

    <!-- Progress bar -->
    <div :class="barClasses" :style="barStyles">
      <div
        :class="fillClasses"
        :style="fillStyles"
        role="progressbar"
        :aria-valuenow="normalizedValue"
        :aria-valuemin="min"
        :aria-valuemax="max"
        :aria-label="ariaLabel"
      >
        <!-- Animated stripes -->
        <div v-if="animated" class="base-progress-stripes"></div>
        
        <!-- Inner content -->
        <div v-if="$slots.default" class="base-progress-content">
          <slot />
        </div>
      </div>
    </div>

    <!-- Description -->
    <div v-if="$slots.description || description" class="base-progress-description">
      <slot name="description">
        <span class="base-progress-description-text">{{ description }}</span>
      </slot>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  // Значение
  value: {
    type: Number,
    default: 0
  },
  
  // Минимальное и максимальное значение
  min: {
    type: Number,
    default: 0
  },
  max: {
    type: Number,
    default: 100
  },
  
  // Контент
  label: {
    type: String,
    default: ''
  },
  description: {
    type: String,
    default: ''
  },
  
  // Отображение значения
  showValue: {
    type: Boolean,
    default: false
  },
  valueFormat: {
    type: String,
    default: 'percent',
    validator: (value) => ['percent', 'fraction', 'value'].includes(value)
  },
  
  // Размер
  size: {
    type: String,
    default: 'md',
    validator: (value) => ['xs', 'sm', 'md', 'lg', 'xl'].includes(value)
  },
  
  // Цвет/вариант
  variant: {
    type: String,
    default: 'primary',
    validator: (value) => [
      'primary', 'secondary', 'success', 'warning', 'error', 'gradient'
    ].includes(value)
  },
  
  // Состояния
  indeterminate: {
    type: Boolean,
    default: false
  },
  animated: {
    type: Boolean,
    default: false
  },
  
  // Стилизация
  rounded: {
    type: Boolean,
    default: true
  },
  striped: {
    type: Boolean,
    default: false
  },
  
  // Цветовые настройки
  color: {
    type: String,
    default: ''
  },
  backgroundColor: {
    type: String,
    default: ''
  },
  
  // Accessibility
  ariaLabel: {
    type: String,
    default: ''
  }
})

// Computed properties
const normalizedValue = computed(() => {
  if (props.indeterminate) return 0
  return Math.min(Math.max(props.value, props.min), props.max)
})

const percentage = computed(() => {
  if (props.indeterminate) return 0
  const range = props.max - props.min
  return ((normalizedValue.value - props.min) / range) * 100
})

const formatValue = computed(() => {
  switch (props.valueFormat) {
    case 'percent':
      return `${Math.round(percentage.value)}%`
    case 'fraction':
      return `${normalizedValue.value}/${props.max}`
    case 'value':
      return normalizedValue.value.toString()
    default:
      return `${Math.round(percentage.value)}%`
  }
})

const containerClasses = computed(() => [
  'base-progress-container'
])

const barClasses = computed(() => [
  'base-progress-bar',
  `base-progress-bar--${props.size}`,
  {
    'base-progress-bar--rounded': props.rounded,
    'base-progress-bar--striped': props.striped,
    'base-progress-bar--animated': props.animated,
    'base-progress-bar--indeterminate': props.indeterminate
  }
])

const fillClasses = computed(() => [
  'base-progress-fill',
  `base-progress-fill--${props.variant}`,
  {
    'base-progress-fill--striped': props.striped,
    'base-progress-fill--animated': props.animated,
    'base-progress-fill--indeterminate': props.indeterminate
  }
])

const barStyles = computed(() => {
  const styles = {}
  
  if (props.backgroundColor) {
    styles.backgroundColor = props.backgroundColor
  }
  
  return styles
})

const fillStyles = computed(() => {
  const styles = {}
  
  if (props.indeterminate) {
    styles.width = '100%'
  } else {
    styles.width = `${percentage.value}%`
  }
  
  if (props.color) {
    styles.backgroundColor = props.color
  }
  
  return styles
})
</script>

<style scoped>
.base-progress-container {
  @apply w-full;
}

/* Label */
.base-progress-label {
  @apply flex items-center justify-between mb-2;
}

.base-progress-label-text {
  @apply text-sm font-medium;
  color: var(--text-primary);
}

.base-progress-value {
  @apply text-sm font-medium;
  color: var(--text-secondary);
}

/* Progress bar */
.base-progress-bar {
  @apply relative overflow-hidden;
  background-color: var(--bg-tertiary);
  border: 1px solid var(--border-primary);
}

.base-progress-bar--rounded {
  border-radius: var(--radius-full);
}

.base-progress-bar--striped .base-progress-fill {
  background-image: linear-gradient(
    45deg,
    rgba(255, 255, 255, 0.15) 25%,
    transparent 25%,
    transparent 50%,
    rgba(255, 255, 255, 0.15) 50%,
    rgba(255, 255, 255, 0.15) 75%,
    transparent 75%,
    transparent
  );
  background-size: 1rem 1rem;
}

.base-progress-bar--animated .base-progress-fill {
  position: relative;
  overflow: hidden;
}

.base-progress-bar--animated .base-progress-stripes {
  @apply absolute inset-0;
  background-image: linear-gradient(
    45deg,
    rgba(255, 255, 255, 0.15) 25%,
    transparent 25%,
    transparent 50%,
    rgba(255, 255, 255, 0.15) 50%,
    rgba(255, 255, 255, 0.15) 75%,
    transparent 75%,
    transparent
  );
  background-size: 1rem 1rem;
  animation: progress-stripes 1s linear infinite;
}

.base-progress-bar--indeterminate .base-progress-fill {
  animation: progress-indeterminate 2s linear infinite;
}

/* Sizes */
.base-progress-bar--xs {
  height: 4px;
}

.base-progress-bar--sm {
  height: 6px;
}

.base-progress-bar--md {
  height: 8px;
}

.base-progress-bar--lg {
  height: 12px;
}

.base-progress-bar--xl {
  height: 16px;
}

/* Progress fill */
.base-progress-fill {
  @apply h-full transition-all duration-300 ease-out;
  border-radius: inherit;
}

.base-progress-fill--primary {
  background-color: var(--accent-primary);
}

.base-progress-fill--secondary {
  background-color: var(--text-secondary);
}

.base-progress-fill--success {
  background-color: var(--accent-success);
}

.base-progress-fill--warning {
  background-color: var(--accent-warning);
}

.base-progress-fill--error {
  background-color: var(--accent-error);
}

.base-progress-fill--gradient {
  background: linear-gradient(90deg, var(--accent-primary) 0%, var(--accent-purple) 100%);
}

.base-progress-fill--indeterminate {
  background: linear-gradient(
    90deg,
    transparent,
    var(--accent-primary),
    transparent
  );
  background-size: 50% 100%;
}

/* Progress content */
.base-progress-content {
  @apply absolute inset-0 flex items-center justify-center;
  color: white;
  font-size: var(--text-xs);
  font-weight: 500;
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.5);
}

/* Description */
.base-progress-description {
  @apply mt-1;
}

.base-progress-description-text {
  @apply text-xs;
  color: var(--text-muted);
}

/* Animations */
@keyframes progress-stripes {
  0% {
    background-position: 1rem 0;
  }
  100% {
    background-position: 0 0;
  }
}

@keyframes progress-indeterminate {
  0% {
    background-position: -200% 0;
  }
  100% {
    background-position: 200% 0;
  }
}

/* Responsive */
@media (max-width: 640px) {
  .base-progress-label-text,
  .base-progress-value {
    @apply text-xs;
  }
  
  .base-progress-description-text {
    @apply text-xs;
  }
}

/* High contrast mode */
@media (prefers-contrast: high) {
  .base-progress-bar {
    border-width: 2px;
  }
  
  .base-progress-fill {
    filter: contrast(1.2);
  }
}

/* Reduced motion */
@media (prefers-reduced-motion: reduce) {
  .base-progress-fill {
    transition: none;
  }
  
  .base-progress-stripes {
    animation: none;
  }
  
  .base-progress-fill--indeterminate {
    animation: none;
    background: var(--accent-primary);
  }
}

/* Dark theme adjustments */
[data-theme="dark"] .base-progress-bar {
  background-color: var(--bg-tertiary);
  border-color: var(--border-primary);
}

[data-theme="dark"] .base-progress-bar--striped .base-progress-fill {
  background-image: linear-gradient(
    45deg,
    rgba(255, 255, 255, 0.1) 25%,
    transparent 25%,
    transparent 50%,
    rgba(255, 255, 255, 0.1) 50%,
    rgba(255, 255, 255, 0.1) 75%,
    transparent 75%,
    transparent
  );
}

[data-theme="dark"] .base-progress-stripes {
  background-image: linear-gradient(
    45deg,
    rgba(255, 255, 255, 0.1) 25%,
    transparent 25%,
    transparent 50%,
    rgba(255, 255, 255, 0.1) 50%,
    rgba(255, 255, 255, 0.1) 75%,
    transparent 75%,
    transparent
  );
}

/* Print styles */
@media print {
  .base-progress-bar--animated .base-progress-stripes {
    animation: none;
  }
  
  .base-progress-fill--indeterminate {
    animation: none;
  }
}
</style>