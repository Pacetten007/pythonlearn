<template>
  <div class="base-input-wrapper">
    <!-- Label -->
    <label v-if="label" :for="inputId" class="base-input-label">
      {{ label }}
      <span v-if="required" class="text-error">*</span>
    </label>

    <!-- Input container -->
    <div class="base-input-container" :class="containerClasses">
      <!-- Left icon -->
      <component
        v-if="leftIcon"
        :is="leftIcon"
        class="base-input-icon base-input-icon--left"
        :size="iconSize"
      />

      <!-- Input element -->
      <input
        :id="inputId"
        ref="inputRef"
        :type="inputType"
        :value="modelValue"
        :placeholder="placeholder"
        :disabled="disabled"
        :readonly="readonly"
        :autocomplete="autocomplete"
        :maxlength="maxlength"
        :min="min"
        :max="max"
        :step="step"
        :class="inputClasses"
        @input="handleInput"
        @focus="handleFocus"
        @blur="handleBlur"
        @keydown="handleKeydown"
        @keyup="handleKeyup"
        @change="handleChange"
        v-bind="$attrs"
      />

      <!-- Password toggle -->
      <button
        v-if="type === 'password' && showPasswordToggle"
        type="button"
        class="base-input-icon base-input-icon--right base-input-password-toggle"
        @click="togglePasswordVisibility"
        :aria-label="showPassword ? 'Скрыть пароль' : 'Показать пароль'"
      >
        <IconEye v-if="!showPassword" :size="iconSize" />
        <IconEyeOff v-else :size="iconSize" />
      </button>

      <!-- Right icon -->
      <component
        v-else-if="rightIcon"
        :is="rightIcon"
        class="base-input-icon base-input-icon--right"
        :size="iconSize"
      />

      <!-- Clear button -->
      <button
        v-if="clearable && modelValue && !disabled && !readonly"
        type="button"
        class="base-input-icon base-input-icon--right base-input-clear"
        @click="clearInput"
        aria-label="Очистить"
      >
        <IconX :size="iconSize" />
      </button>

      <!-- Loading spinner -->
      <div v-if="loading" class="base-input-icon base-input-icon--right">
        <IconRefreshCw class="animate-spin" :size="iconSize" />
      </div>
    </div>

    <!-- Helper text / Error message -->
    <div v-if="helperText || errorMessage" class="base-input-message">
      <span v-if="errorMessage" class="base-input-error">
        <IconAlertTriangle :size="14" />
        {{ errorMessage }}
      </span>
      <span v-else-if="helperText" class="base-input-helper">
        {{ helperText }}
      </span>
    </div>

    <!-- Character counter -->
    <div v-if="showCounter && maxlength" class="base-input-counter">
      {{ characterCount }}/{{ maxlength }}
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch, nextTick, onMounted } from 'vue'
import { generateId } from '@/utils/helpers'

const props = defineProps({
  // v-model
  modelValue: {
    type: [String, Number],
    default: ''
  },
  
  // Основные свойства
  type: {
    type: String,
    default: 'text',
    validator: (value) => [
      'text', 'password', 'email', 'number', 'tel', 
      'url', 'search', 'date', 'time', 'datetime-local'
    ].includes(value)
  },
  
  label: {
    type: String,
    default: ''
  },
  
  placeholder: {
    type: String,
    default: ''
  },
  
  helperText: {
    type: String,
    default: ''
  },
  
  errorMessage: {
    type: String,
    default: ''
  },
  
  // Размер
  size: {
    type: String,
    default: 'md',
    validator: (value) => ['sm', 'md', 'lg'].includes(value)
  },
  
  // Состояния
  disabled: {
    type: Boolean,
    default: false
  },
  
  readonly: {
    type: Boolean,
    default: false
  },
  
  required: {
    type: Boolean,
    default: false
  },
  
  loading: {
    type: Boolean,
    default: false
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
  
  // Функциональность
  clearable: {
    type: Boolean,
    default: false
  },
  
  showPasswordToggle: {
    type: Boolean,
    default: true
  },
  
  showCounter: {
    type: Boolean,
    default: false
  },
  
  // HTML атрибуты
  autocomplete: {
    type: String,
    default: null
  },
  
  maxlength: {
    type: [String, Number],
    default: null
  },
  
  min: {
    type: [String, Number],
    default: null
  },
  
  max: {
    type: [String, Number],
    default: null
  },
  
  step: {
    type: [String, Number],
    default: null
  },
  
  // Фокус
  autofocus: {
    type: Boolean,
    default: false
  },
  
  selectOnFocus: {
    type: Boolean,
    default: false
  }
})

const emit = defineEmits([
  'update:modelValue',
  'focus',
  'blur',
  'keydown',
  'keyup',
  'change',
  'clear',
  'enter'
])

// Refs
const inputRef = ref(null)
const isFocused = ref(false)
const showPassword = ref(false)

// Computed
const inputId = computed(() => generateId('input'))

const inputType = computed(() => {
  if (props.type === 'password') {
    return showPassword.value ? 'text' : 'password'
  }
  return props.type
})

const containerClasses = computed(() => [
  'base-input-container',
  `base-input--${props.size}`,
  {
    'base-input--focused': isFocused.value,
    'base-input--disabled': props.disabled,
    'base-input--readonly': props.readonly,
    'base-input--error': props.errorMessage,
    'base-input--with-left-icon': props.leftIcon,
    'base-input--with-right-icon': props.rightIcon || props.clearable || (props.type === 'password' && props.showPasswordToggle) || props.loading
  }
])

const inputClasses = computed(() => [
  'base-input'
])

const iconSize = computed(() => {
  const sizes = { sm: 16, md: 18, lg: 20 }
  return sizes[props.size] || 18
})

const characterCount = computed(() => {
  return String(props.modelValue || '').length
})

// Methods
const handleInput = (event) => {
  const value = event.target.value
  emit('update:modelValue', value)
}

const handleFocus = (event) => {
  isFocused.value = true
  emit('focus', event)
  
  if (props.selectOnFocus) {
    nextTick(() => {
      event.target.select()
    })
  }
}

const handleBlur = (event) => {
  isFocused.value = false
  emit('blur', event)
}

const handleKeydown = (event) => {
  emit('keydown', event)
  
  if (event.key === 'Enter') {
    emit('enter', event)
  }
}

const handleKeyup = (event) => {
  emit('keyup', event)
}

const handleChange = (event) => {
  emit('change', event)
}

const clearInput = () => {
  emit('update:modelValue', '')
  emit('clear')
  inputRef.value?.focus()
}

const togglePasswordVisibility = () => {
  showPassword.value = !showPassword.value
}

const focus = () => {
  inputRef.value?.focus()
}

const blur = () => {
  inputRef.value?.blur()
}

const select = () => {
  inputRef.value?.select()
}

// Watchers
watch(() => props.autofocus, (newVal) => {
  if (newVal) {
    nextTick(() => focus())
  }
})

// Lifecycle
onMounted(() => {
  if (props.autofocus) {
    nextTick(() => focus())
  }
})

// Expose methods
defineExpose({
  focus,
  blur,
  select
})
</script>

<style scoped>
.base-input-wrapper {
  @apply w-full;
}

.base-input-label {
  @apply block text-sm font-medium mb-2;
  color: var(--text-primary);
}

.base-input-container {
  @apply relative flex items-center;
  background-color: var(--bg-tertiary);
  border: 1px solid var(--border-primary);
  border-radius: var(--radius-md);
  transition: all var(--transition-fast);
}

.base-input-container:hover:not(.base-input--disabled) {
  border-color: var(--border-secondary);
}

.base-input-container.base-input--focused {
  border-color: var(--accent-primary);
  box-shadow: 0 0 0 3px rgba(var(--accent-primary-rgb), 0.1);
}

.base-input-container.base-input--error {
  border-color: var(--accent-error);
}

.base-input-container.base-input--error.base-input--focused {
  box-shadow: 0 0 0 3px rgba(var(--accent-error-rgb), 0.1);
}

.base-input-container.base-input--disabled {
  opacity: 0.6;
  cursor: not-allowed;
  background-color: var(--bg-secondary);
}

/* Размеры */
.base-input--sm {
  height: 36px;
}

.base-input--md {
  height: 40px;
}

.base-input--lg {
  height: 48px;
}

/* Input element */
.base-input {
  @apply w-full bg-transparent border-none outline-none;
  color: var(--text-primary);
  font-family: var(--font-ui);
  font-size: var(--text-base);
}

.base-input--sm .base-input {
  @apply px-3 text-sm;
}

.base-input--md .base-input {
  @apply px-4 text-base;
}

.base-input--lg .base-input {
  @apply px-5 text-lg;
}

.base-input::placeholder {
  color: var(--text-muted);
}

.base-input:disabled {
  cursor: not-allowed;
}

/* Icons */
.base-input-icon {
  @apply flex items-center justify-center shrink-0;
  color: var(--text-secondary);
}

.base-input-icon--left {
  @apply ml-3;
}

.base-input-icon--right {
  @apply mr-3;
}

.base-input--with-left-icon .base-input {
  @apply pl-2;
}

.base-input--with-right-icon .base-input {
  @apply pr-2;
}

/* Interactive icons */
.base-input-password-toggle,
.base-input-clear {
  @apply p-1 rounded cursor-pointer transition-colors;
  background: none;
  border: none;
  color: var(--text-secondary);
}

.base-input-password-toggle:hover,
.base-input-clear:hover {
  color: var(--text-primary);
  background-color: var(--bg-hover);
}

/* Messages */
.base-input-message {
  @apply mt-2 text-sm;
}

.base-input-error {
  @apply flex items-center gap-1;
  color: var(--accent-error);
}

.base-input-helper {
  color: var(--text-secondary);
}

/* Counter */
.base-input-counter {
  @apply mt-1 text-xs text-right;
  color: var(--text-muted);
}

/* Animations */
.animate-spin {
  animation: spin 1s linear infinite;
}

@keyframes spin {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}

/* Number input arrows hiding */
.base-input[type="number"]::-webkit-outer-spin-button,
.base-input[type="number"]::-webkit-inner-spin-button {
  -webkit-appearance: none;
  margin: 0;
}

.base-input[type="number"] {
  -moz-appearance: textfield;
}

/* Focus styles for accessibility */
.base-input:focus {
  outline: none;
}

/* Dark theme adjustments */
[data-theme="dark"] .base-input-container {
  background-color: var(--bg-tertiary);
  border-color: var(--border-primary);
}

[data-theme="dark"] .base-input-container:hover:not(.base-input--disabled) {
  border-color: var(--border-secondary);
}
</style>