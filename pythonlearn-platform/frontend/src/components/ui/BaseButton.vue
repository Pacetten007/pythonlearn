<template>
  <component
    :is="tag"
    :type="type"
    :disabled="disabled || loading"
    :class="buttonClasses"
    @click="handleClick"
    v-bind="linkProps"
  >
    <!-- Loading spinner -->
    <IconRefreshCw v-if="loading" class="animate-spin" :size="iconSize" />
    
    <!-- Left icon -->
    <component 
      v-else-if="leftIcon" 
      :is="leftIcon" 
      :size="iconSize"
      class="button-icon-left" 
    />
    
    <!-- Content -->
    <span v-if="$slots.default || label" class="button-content">
      <slot>{{ label }}</slot>
    </span>
    
    <!-- Right icon -->
    <component 
      v-if="rightIcon && !loading" 
      :is="rightIcon" 
      :size="iconSize"
      class="button-icon-right" 
    />
  </component>
</template>

<script setup>
import { computed, useSlots } from 'vue'
import { useRouter } from 'vue-router'

const props = defineProps({
  // Основные свойства
  variant: {
    type: String,
    default: 'primary',
    validator: (value) => [
      'primary', 'secondary', 'success', 'warning', 'error', 
      'ghost', 'outline', 'link'
    ].includes(value)
  },
  size: {
    type: String,
    default: 'md',
    validator: (value) => ['xs', 'sm', 'md', 'lg', 'xl'].includes(value)
  },
  
  // Состояния
  disabled: {
    type: Boolean,
    default: false
  },
  loading: {
    type: Boolean,
    default: false
  },
  
  // Контент
  label: {
    type: String,
    default: ''
  },
  leftIcon: {
    type: [String, Object],
    default: null
  },
  rightIcon: {
    type: [String, Object],
    default: null
  },
  
  // Тип элемента
  tag: {
    type: String,
    default: 'button'
  },
  type: {
    type: String,
    default: 'button'
  },
  
  // Навигация (для router-link)
  to: {
    type: [String, Object],
    default: null
  },
  href: {
    type: String,
    default: null
  },
  external: {
    type: Boolean,
    default: false
  },
  
  // Дополнительные настройки
  block: {
    type: Boolean,
    default: false
  },
  rounded: {
    type: Boolean,
    default: false
  },
  shadow: {
    type: Boolean,
    default: false
  }
})

const emit = defineEmits(['click'])
const slots = useSlots()
const router = useRouter()

// Вычисляемые свойства
const buttonClasses = computed(() => {
  return [
    'base-button',
    `base-button--${props.variant}`,
    `base-button--${props.size}`,
    {
      'base-button--disabled': props.disabled || props.loading,
      'base-button--loading': props.loading,
      'base-button--block': props.block,
      'base-button--rounded': props.rounded,
      'base-button--shadow': props.shadow,
      'base-button--icon-only': !slots.default && !props.label && (props.leftIcon || props.rightIcon)
    }
  ]
})

const iconSize = computed(() => {
  const sizes = {
    xs: 14,
    sm: 16,
    md: 18,
    lg: 20,
    xl: 22
  }
  return sizes[props.size] || 18
})

const linkProps = computed(() => {
  if (props.to) {
    return { to: props.to }
  }
  if (props.href) {
    return {
      href: props.href,
      target: props.external ? '_blank' : '_self',
      rel: props.external ? 'noopener noreferrer' : null
    }
  }
  return {}
})

// Методы
const handleClick = (event) => {
  if (props.disabled || props.loading) {
    event.preventDefault()
    return
  }
  
  emit('click', event)
  
  // Программная навигация
  if (props.to && !event.defaultPrevented) {
    router.push(props.to)
  }
}
</script>

<style scoped>
.base-button {
  @apply relative inline-flex items-center justify-center;
  @apply font-medium transition-all duration-200;
  @apply focus:outline-none focus:ring-2 focus:ring-offset-2;
  @apply disabled:cursor-not-allowed;
  border-radius: var(--radius-md);
  font-family: var(--font-ui);
}

/* Размеры */
.base-button--xs {
  @apply px-2 py-1 text-xs;
  height: 28px;
  min-width: 28px;
  gap: 4px;
}

.base-button--sm {
  @apply px-3 py-1.5 text-sm;
  height: 32px;
  min-width: 32px;
  gap: 6px;
}

.base-button--md {
  @apply px-4 py-2 text-base;
  height: 40px;
  min-width: 40px;
  gap: 8px;
}

.base-button--lg {
  @apply px-6 py-3 text-lg;
  height: 48px;
  min-width: 48px;
  gap: 8px;
}

.base-button--xl {
  @apply px-8 py-4 text-xl;
  height: 56px;
  min-width: 56px;
  gap: 10px;
}

/* Варианты */
.base-button--primary {
  background-color: var(--accent-primary);
  color: var(--text-primary);
  border: 1px solid var(--accent-primary);
}

.base-button--primary:hover:not(:disabled) {
  background-color: var(--accent-primary);
  filter: brightness(1.1);
  transform: translateY(-1px);
}

.base-button--primary:focus {
  @apply ring-blue-500;
}

.base-button--secondary {
  background-color: var(--bg-secondary);
  color: var(--text-primary);
  border: 1px solid var(--border-primary);
}

.base-button--secondary:hover:not(:disabled) {
  background-color: var(--bg-hover);
  border-color: var(--border-secondary);
}

.base-button--success {
  background-color: var(--accent-success);
  color: white;
  border: 1px solid var(--accent-success);
}

.base-button--success:hover:not(:disabled) {
  background-color: var(--accent-success);
  filter: brightness(1.1);
}

.base-button--warning {
  background-color: var(--accent-warning);
  color: white;
  border: 1px solid var(--accent-warning);
}

.base-button--warning:hover:not(:disabled) {
  background-color: var(--accent-warning);
  filter: brightness(1.1);
}

.base-button--error {
  background-color: var(--accent-error);
  color: white;
  border: 1px solid var(--accent-error);
}

.base-button--error:hover:not(:disabled) {
  background-color: var(--accent-error);
  filter: brightness(1.1);
}

.base-button--ghost {
  background-color: transparent;
  color: var(--text-primary);
  border: 1px solid transparent;
}

.base-button--ghost:hover:not(:disabled) {
  background-color: var(--bg-hover);
}

.base-button--outline {
  background-color: transparent;
  color: var(--accent-primary);
  border: 1px solid var(--accent-primary);
}

.base-button--outline:hover:not(:disabled) {
  background-color: var(--accent-primary);
  color: white;
}

.base-button--link {
  background-color: transparent;
  color: var(--accent-primary);
  border: none;
  text-decoration: underline;
}

.base-button--link:hover:not(:disabled) {
  color: var(--accent-primary);
  filter: brightness(1.2);
  text-decoration: none;
}

/* Состояния */
.base-button--disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.base-button--loading {
  pointer-events: none;
}

/* Модификаторы */
.base-button--block {
  @apply w-full;
}

.base-button--rounded {
  border-radius: 9999px;
}

.base-button--shadow {
  box-shadow: var(--shadow-md);
}

.base-button--shadow:hover:not(:disabled) {
  box-shadow: var(--shadow-lg);
}

.base-button--icon-only {
  padding: 0;
}

.base-button--icon-only.base-button--xs {
  width: 28px;
  height: 28px;
}

.base-button--icon-only.base-button--sm {
  width: 32px;
  height: 32px;
}

.base-button--icon-only.base-button--md {
  width: 40px;
  height: 40px;
}

.base-button--icon-only.base-button--lg {
  width: 48px;
  height: 48px;
}

.base-button--icon-only.base-button--xl {
  width: 56px;
  height: 56px;
}

/* Иконки */
.button-icon-left {
  margin-right: var(--space-1);
}

.button-icon-right {
  margin-left: var(--space-1);
}

.button-content {
  @apply truncate;
}

/* Анимации */
@keyframes spin {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}

.animate-spin {
  animation: spin 1s linear infinite;
}

/* Dark theme adjustments */
[data-theme="dark"] .base-button--secondary {
  background-color: var(--bg-secondary);
  border-color: var(--border-primary);
}

[data-theme="dark"] .base-button--ghost:hover:not(:disabled) {
  background-color: var(--bg-hover);
}
</style>