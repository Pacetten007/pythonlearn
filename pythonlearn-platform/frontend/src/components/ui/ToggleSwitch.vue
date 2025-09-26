<template>
  <label class="toggle-switch" :class="switchClasses">
    <input
      type="checkbox"
      :checked="value"
      :disabled="disabled"
      @change="handleChange"
      class="toggle-input"
    />
    <span class="toggle-slider" :class="sliderClasses">
      <span class="toggle-thumb" :class="thumbClasses">
        <component 
          v-if="showIcons && value" 
          :is="checkedIcon" 
          :size="iconSize" 
          class="toggle-icon"
        />
        <component 
          v-else-if="showIcons && !value" 
          :is="uncheckedIcon" 
          :size="iconSize" 
          class="toggle-icon"
        />
      </span>
    </span>
  </label>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  // v-model value
  value: {
    type: Boolean,
    default: false
  },
  
  // Размер переключателя
  size: {
    type: String,
    default: 'md',
    validator: (value) => ['sm', 'md', 'lg'].includes(value)
  },
  
  // Цветовая схема
  variant: {
    type: String,
    default: 'primary',
    validator: (value) => [
      'primary', 'success', 'warning', 'error'
    ].includes(value)
  },
  
  // Состояние
  disabled: {
    type: Boolean,
    default: false
  },
  
  // Показывать иконки
  showIcons: {
    type: Boolean,
    default: false
  },
  
  // Иконки для состояний
  checkedIcon: {
    type: [String, Object],
    default: 'IconCheck'
  },
  
  uncheckedIcon: {
    type: [String, Object],
    default: 'IconX'
  },
  
  // Кастомные цвета
  checkedColor: {
    type: String,
    default: ''
  },
  
  uncheckedColor: {
    type: String,
    default: ''
  }
})

const emit = defineEmits(['change', 'update:value'])

// Computed properties
const switchClasses = computed(() => [
  `toggle-switch--${props.size}`,
  `toggle-switch--${props.variant}`,
  {
    'toggle-switch--disabled': props.disabled,
    'toggle-switch--checked': props.value,
    'toggle-switch--with-icons': props.showIcons
  }
])

const sliderClasses = computed(() => [
  {
    'toggle-slider--checked': props.value
  }
])

const thumbClasses = computed(() => [
  {
    'toggle-thumb--checked': props.value
  }
])

const iconSize = computed(() => {
  const sizes = {
    sm: 10,
    md: 12,
    lg: 14
  }
  return sizes[props.size] || 12
})

// Methods
const handleChange = (event) => {
  if (props.disabled) return
  
  const newValue = event.target.checked
  emit('change', newValue)
  emit('update:value', newValue)
}
</script>

<style scoped>
.toggle-switch {
  position: relative;
  display: inline-block;
  cursor: pointer;
  user-select: none;
}

.toggle-switch--disabled {
  cursor: not-allowed;
  opacity: 0.6;
}

.toggle-input {
  position: absolute;
  opacity: 0;
  width: 0;
  height: 0;
}

.toggle-slider {
  position: relative;
  display: block;
  border-radius: 9999px;
  background-color: var(--bg-tertiary);
  border: 1px solid var(--border-primary);
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.toggle-thumb {
  position: absolute;
  top: 2px;
  left: 2px;
  border-radius: 50%;
  background-color: white;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.2);
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  display: flex;
  align-items: center;
  justify-content: center;
}

.toggle-icon {
  color: var(--text-primary);
}

/* Sizes */
.toggle-switch--sm {
  width: 40px;
  height: 20px;
}

.toggle-switch--sm .toggle-slider {
  width: 40px;
  height: 20px;
}

.toggle-switch--sm .toggle-thumb {
  width: 16px;
  height: 16px;
}

.toggle-switch--sm .toggle-thumb--checked {
  transform: translateX(20px);
}

.toggle-switch--md {
  width: 50px;
  height: 24px;
}

.toggle-switch--md .toggle-slider {
  width: 50px;
  height: 24px;
}

.toggle-switch--md .toggle-thumb {
  width: 20px;
  height: 20px;
}

.toggle-switch--md .toggle-thumb--checked {
  transform: translateX(26px);
}

.toggle-switch--lg {
  width: 60px;
  height: 28px;
}

.toggle-switch--lg .toggle-slider {
  width: 60px;
  height: 28px;
}

.toggle-switch--lg .toggle-thumb {
  width: 24px;
  height: 24px;
}

.toggle-switch--lg .toggle-thumb--checked {
  transform: translateX(32px);
}

/* Variants - Checked states */
.toggle-switch--primary .toggle-slider--checked {
  background-color: var(--accent-primary);
  border-color: var(--accent-primary);
}

.toggle-switch--success .toggle-slider--checked {
  background-color: var(--accent-success);
  border-color: var(--accent-success);
}

.toggle-switch--warning .toggle-slider--checked {
  background-color: var(--accent-warning);
  border-color: var(--accent-warning);
}

.toggle-switch--error .toggle-slider--checked {
  background-color: var(--accent-error);
  border-color: var(--accent-error);
}

/* Hover effects */
.toggle-switch:not(.toggle-switch--disabled):hover .toggle-slider {
  border-color: var(--border-secondary);
}

.toggle-switch:not(.toggle-switch--disabled):hover .toggle-slider--checked {
  filter: brightness(1.05);
}

/* Focus effects */
.toggle-input:focus + .toggle-slider {
  box-shadow: 0 0 0 3px rgba(var(--accent-primary-rgb), 0.2);
}

/* Active effects */
.toggle-switch:not(.toggle-switch--disabled):active .toggle-thumb {
  transform: scale(0.95);
}

.toggle-switch:not(.toggle-switch--disabled):active .toggle-thumb--checked {
  transform: scale(0.95) translateX(26px);
}

.toggle-switch--sm:not(.toggle-switch--disabled):active .toggle-thumb--checked {
  transform: scale(0.95) translateX(20px);
}

.toggle-switch--lg:not(.toggle-switch--disabled):active .toggle-thumb--checked {
  transform: scale(0.95) translateX(32px);
}

/* Icons */
.toggle-switch--with-icons .toggle-thumb {
  background-color: var(--bg-secondary);
}

.toggle-switch--with-icons .toggle-slider--checked .toggle-thumb {
  background-color: white;
}

.toggle-switch--with-icons .toggle-slider--checked .toggle-icon {
  color: var(--accent-primary);
}

/* Disabled state */
.toggle-switch--disabled .toggle-slider {
  background-color: var(--bg-secondary);
  cursor: not-allowed;
}

.toggle-switch--disabled .toggle-thumb {
  background-color: var(--text-muted);
}

/* Dark theme adjustments */
[data-theme="dark"] .toggle-thumb {
  background-color: var(--bg-primary);
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.4);
}

[data-theme="dark"] .toggle-switch--with-icons .toggle-thumb {
  background-color: var(--bg-secondary);
}

[data-theme="dark"] .toggle-switch--with-icons .toggle-slider--checked .toggle-thumb {
  background-color: var(--bg-primary);
}

/* Reduced motion */
@media (prefers-reduced-motion: reduce) {
  .toggle-slider,
  .toggle-thumb {
    transition: none;
  }
}

/* High contrast mode */
@media (prefers-contrast: high) {
  .toggle-slider {
    border-width: 2px;
  }
  
  .toggle-thumb {
    box-shadow: 0 0 0 1px var(--text-primary);
  }
}

/* Print styles */
@media print {
  .toggle-switch {
    display: none;
  }
}
</style>