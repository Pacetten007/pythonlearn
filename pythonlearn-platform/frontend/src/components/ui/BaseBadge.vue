<template>
  <span :class="badgeClasses" v-bind="$attrs">
    <!-- Left icon -->
    <component 
      v-if="leftIcon" 
      :is="leftIcon" 
      :size="iconSize"
      class="base-badge-icon base-badge-icon--left" 
    />
    
    <!-- Content -->
    <span v-if="$slots.default || text" class="base-badge-content">
      <slot>{{ text }}</slot>
    </span>
    
    <!-- Right icon -->
    <component 
      v-if="rightIcon" 
      :is="rightIcon" 
      :size="iconSize"
      class="base-badge-icon base-badge-icon--right" 
    />
    
    <!-- Dot indicator -->
    <span v-if="dot" class="base-badge-dot"></span>
  </span>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  // Контент
  text: {
    type: String,
    default: ''
  },
  
  // Иконки
  leftIcon: {
    type: [String, Object],
    default: null
  },
  rightIcon: {
    type: [String, Object],
    default: null
  },
  
  // Вариант дизайна
  variant: {
    type: String,
    default: 'default',
    validator: (value) => [
      'default', 'primary', 'secondary', 'success', 'warning', 'error', 
      'outline', 'ghost', 'gradient'
    ].includes(value)
  },
  
  // Размер
  size: {
    type: String,
    default: 'md',
    validator: (value) => ['xs', 'sm', 'md', 'lg', 'xl'].includes(value)
  },
  
  // Форма
  rounded: {
    type: Boolean,
    default: true
  },
  circle: {
    type: Boolean,
    default: false
  },
  
  // Индикатор точка
  dot: {
    type: Boolean,
    default: false
  },
  
  // Состояния
  active: {
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
  removable: {
    type: Boolean,
    default: false
  },
  
  // Анимации
  pulse: {
    type: Boolean,
    default: false
  },
  bounce: {
    type: Boolean,
    default: false
  },
  
  // Кастомные цвета
  color: {
    type: String,
    default: ''
  },
  backgroundColor: {
    type: String,
    default: ''
  }
})

const emit = defineEmits(['click', 'remove'])

// Computed properties
const badgeClasses = computed(() => [
  'base-badge',
  `base-badge--${props.variant}`,
  `base-badge--${props.size}`,
  {
    'base-badge--rounded': props.rounded && !props.circle,
    'base-badge--circle': props.circle,
    'base-badge--dot': props.dot,
    'base-badge--active': props.active,
    'base-badge--disabled': props.disabled,
    'base-badge--clickable': props.clickable,
    'base-badge--removable': props.removable,
    'base-badge--pulse': props.pulse,
    'base-badge--bounce': props.bounce,
    'base-badge--with-left-icon': props.leftIcon,
    'base-badge--with-right-icon': props.rightIcon || props.removable,
    'base-badge--icon-only': !props.text && !$slots.default && (props.leftIcon || props.rightIcon)
  }
])

const iconSize = computed(() => {
  const sizes = {
    xs: 10,
    sm: 12,
    md: 14,
    lg: 16,
    xl: 18
  }
  return sizes[props.size] || 14
})

// Methods
const handleClick = (event) => {
  if (props.disabled) return
  if (props.clickable) {
    emit('click', event)
  }
}

const handleRemove = (event) => {
  if (props.disabled) return
  event.stopPropagation()
  emit('remove', event)
}
</script>

<style scoped>
.base-badge {
  @apply inline-flex items-center justify-center;
  @apply font-medium transition-all duration-200;
  @apply whitespace-nowrap;
  font-family: var(--font-ui);
  position: relative;
}

/* Sizes */
.base-badge--xs {
  @apply px-1.5 py-0.5 text-xs;
  min-height: 16px;
  gap: 2px;
}

.base-badge--sm {
  @apply px-2 py-1 text-xs;
  min-height: 20px;
  gap: 4px;
}

.base-badge--md {
  @apply px-2.5 py-1 text-sm;
  min-height: 24px;
  gap: 4px;
}

.base-badge--lg {
  @apply px-3 py-1.5 text-sm;
  min-height: 28px;
  gap: 6px;
}

.base-badge--xl {
  @apply px-4 py-2 text-base;
  min-height: 32px;
  gap: 6px;
}

/* Variants */
.base-badge--default {
  background-color: var(--bg-tertiary);
  color: var(--text-primary);
  border: 1px solid var(--border-primary);
}

.base-badge--primary {
  background-color: var(--accent-primary);
  color: white;
  border: 1px solid var(--accent-primary);
}

.base-badge--secondary {
  background-color: var(--bg-secondary);
  color: var(--text-primary);
  border: 1px solid var(--border-secondary);
}

.base-badge--success {
  background-color: var(--accent-success);
  color: white;
  border: 1px solid var(--accent-success);
}

.base-badge--warning {
  background-color: var(--accent-warning);
  color: white;
  border: 1px solid var(--accent-warning);
}

.base-badge--error {
  background-color: var(--accent-error);
  color: white;
  border: 1px solid var(--accent-error);
}

.base-badge--outline {
  background-color: transparent;
  color: var(--text-primary);
  border: 1px solid var(--border-primary);
}

.base-badge--ghost {
  background-color: rgba(var(--accent-primary-rgb), 0.1);
  color: var(--accent-primary);
  border: none;
}

.base-badge--gradient {
  background: linear-gradient(135deg, var(--accent-primary) 0%, var(--accent-purple) 100%);
  color: white;
  border: none;
}

/* Shapes */
.base-badge--rounded {
  border-radius: var(--radius-md);
}

.base-badge--circle {
  border-radius: var(--radius-full);
  aspect-ratio: 1;
  min-width: auto;
}

.base-badge--circle.base-badge--xs {
  width: 16px;
  height: 16px;
}

.base-badge--circle.base-badge--sm {
  width: 20px;
  height: 20px;
}

.base-badge--circle.base-badge--md {
  width: 24px;
  height: 24px;
}

.base-badge--circle.base-badge--lg {
  width: 28px;
  height: 28px;
}

.base-badge--circle.base-badge--xl {
  width: 32px;
  height: 32px;
}

/* Dot indicator */
.base-badge--dot {
  padding: 0;
  min-width: 8px;
  min-height: 8px;
  border-radius: 50%;
}

.base-badge-dot {
  @apply absolute -top-1 -right-1;
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background-color: var(--accent-error);
}

/* States */
.base-badge--active {
  box-shadow: 0 0 0 2px var(--accent-primary);
}

.base-badge--disabled {
  opacity: 0.5;
  cursor: not-allowed;
  pointer-events: none;
}

.base-badge--clickable {
  cursor: pointer;
}

.base-badge--clickable:hover:not(.base-badge--disabled) {
  transform: translateY(-1px);
  box-shadow: var(--shadow-sm);
}

.base-badge--clickable:active:not(.base-badge--disabled) {
  transform: translateY(0);
}

/* Icon adjustments */
.base-badge-icon {
  flex-shrink: 0;
}

.base-badge--with-left-icon.base-badge--xs {
  padding-left: 4px;
}

.base-badge--with-left-icon.base-badge--sm {
  padding-left: 6px;
}

.base-badge--with-left-icon.base-badge--md {
  padding-left: 8px;
}

.base-badge--with-right-icon.base-badge--xs {
  padding-right: 4px;
}

.base-badge--with-right-icon.base-badge--sm {
  padding-right: 6px;
}

.base-badge--with-right-icon.base-badge--md {
  padding-right: 8px;
}

.base-badge--icon-only {
  padding-left: 0;
  padding-right: 0;
}

/* Content */
.base-badge-content {
  @apply truncate;
}

/* Animations */
.base-badge--pulse {
  animation: badge-pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
}

.base-badge--bounce {
  animation: badge-bounce 1s infinite;
}

@keyframes badge-pulse {
  0%, 100% {
    opacity: 1;
  }
  50% {
    opacity: 0.5;
  }
}

@keyframes badge-bounce {
  0%, 20%, 53%, 80%, 100% {
    animation-timing-function: cubic-bezier(0.215, 0.61, 0.355, 1);
    transform: translate3d(0, 0, 0);
  }
  40%, 43% {
    animation-timing-function: cubic-bezier(0.755, 0.05, 0.855, 0.06);
    transform: translate3d(0, -8px, 0);
  }
  70% {
    animation-timing-function: cubic-bezier(0.755, 0.05, 0.855, 0.06);
    transform: translate3d(0, -4px, 0);
  }
  90% {
    transform: translate3d(0, -2px, 0);
  }
}

/* Hover effects for variants */
.base-badge--primary:hover {
  filter: brightness(1.1);
}

.base-badge--success:hover {
  filter: brightness(1.1);
}

.base-badge--warning:hover {
  filter: brightness(1.1);
}

.base-badge--error:hover {
  filter: brightness(1.1);
}

.base-badge--outline:hover {
  background-color: var(--bg-hover);
}

.base-badge--ghost:hover {
  background-color: rgba(var(--accent-primary-rgb), 0.15);
}

/* Responsive */
@media (max-width: 640px) {
  .base-badge--lg {
    @apply px-2.5 py-1 text-sm;
    min-height: 24px;
  }
  
  .base-badge--xl {
    @apply px-3 py-1.5 text-sm;
    min-height: 28px;
  }
}

/* High contrast mode */
@media (prefers-contrast: high) {
  .base-badge {
    border-width: 2px;
  }
}

/* Reduced motion */
@media (prefers-reduced-motion: reduce) {
  .base-badge--pulse,
  .base-badge--bounce {
    animation: none;
  }
  
  .base-badge--clickable:hover {
    transform: none;
  }
}

/* Dark theme adjustments */
[data-theme="dark"] .base-badge--default {
  background-color: var(--bg-tertiary);
  border-color: var(--border-primary);
}

[data-theme="dark"] .base-badge--secondary {
  background-color: var(--bg-secondary);
  border-color: var(--border-secondary);
}

[data-theme="dark"] .base-badge--outline {
  border-color: var(--border-primary);
}

[data-theme="dark"] .base-badge--ghost {
  background-color: rgba(var(--accent-primary-rgb), 0.15);
}

/* Print styles */
@media print {
  .base-badge--pulse,
  .base-badge--bounce {
    animation: none !important;
  }
  
  .base-badge--clickable:hover {
    transform: none !important;
  }
}

/* Focus styles for accessibility */
.base-badge--clickable:focus {
  outline: 2px solid var(--accent-primary);
  outline-offset: 2px;
}
</style>