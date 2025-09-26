<template>
  <div :class="containerClasses">
    <div :class="spinnerClasses" :style="spinnerStyle">
      <!-- Default spinner (circular) -->
      <svg
        v-if="variant === 'default'"
        :width="size"
        :height="size"
        viewBox="0 0 24 24"
        fill="none"
        class="spinner-svg"
      >
        <circle
          cx="12"
          cy="12"
          r="10"
          stroke="currentColor"
          stroke-width="2"
          stroke-linecap="round"
          stroke-dasharray="31.416"
          stroke-dashoffset="31.416"
        />
      </svg>

      <!-- Dots spinner -->
      <div v-else-if="variant === 'dots'" class="spinner-dots">
        <div class="spinner-dot"></div>
        <div class="spinner-dot"></div>
        <div class="spinner-dot"></div>
      </div>

      <!-- Bars spinner -->
      <div v-else-if="variant === 'bars'" class="spinner-bars">
        <div class="spinner-bar"></div>
        <div class="spinner-bar"></div>
        <div class="spinner-bar"></div>
        <div class="spinner-bar"></div>
      </div>

      <!-- Pulse spinner -->
      <div v-else-if="variant === 'pulse'" class="spinner-pulse">
        <div class="spinner-pulse-dot"></div>
      </div>

      <!-- Ring spinner -->
      <svg
        v-else-if="variant === 'ring'"
        :width="size"
        :height="size"
        viewBox="0 0 24 24"
        fill="none"
        class="spinner-svg"
      >
        <circle
          cx="12"
          cy="12"
          r="10"
          stroke="currentColor"
          stroke-width="2"
          stroke-opacity="0.25"
        />
        <circle
          cx="12"
          cy="12"
          r="10"
          stroke="currentColor"
          stroke-width="2"
          stroke-linecap="round"
          stroke-dasharray="15.708"
          transform="rotate(-90 12 12)"
          class="spinner-ring-active"
        />
      </svg>
    </div>

    <!-- Loading text -->
    <span v-if="text" :class="textClasses">{{ text }}</span>
  </div>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  // Размер
  size: {
    type: [String, Number],
    default: 'md',
    validator: (value) => {
      return typeof value === 'number' || ['xs', 'sm', 'md', 'lg', 'xl'].includes(value)
    }
  },
  
  // Вариант спиннера
  variant: {
    type: String,
    default: 'default',
    validator: (value) => ['default', 'dots', 'bars', 'pulse', 'ring'].includes(value)
  },
  
  // Цвет
  color: {
    type: String,
    default: 'primary',
    validator: (value) => [
      'primary', 'secondary', 'success', 'warning', 'error', 'white', 'current'
    ].includes(value)
  },
  
  // Текст загрузки
  text: {
    type: String,
    default: ''
  },
  
  // Центрирование
  centered: {
    type: Boolean,
    default: false
  },
  
  // Inline режим
  inline: {
    type: Boolean,
    default: false
  },
  
  // Скорость анимации
  speed: {
    type: String,
    default: 'normal',
    validator: (value) => ['slow', 'normal', 'fast'].includes(value)
  }
})

// Computed properties
const actualSize = computed(() => {
  if (typeof props.size === 'number') {
    return props.size
  }
  
  const sizes = {
    xs: 16,
    sm: 20,
    md: 24,
    lg: 32,
    xl: 40
  }
  
  return sizes[props.size] || 24
})

const containerClasses = computed(() => [
  'base-spinner-container',
  {
    'base-spinner--centered': props.centered,
    'base-spinner--inline': props.inline,
    'base-spinner--with-text': props.text
  }
])

const spinnerClasses = computed(() => [
  'base-spinner',
  `base-spinner--${props.variant}`,
  `base-spinner--${props.color}`,
  `base-spinner--${props.speed}`
])

const textClasses = computed(() => [
  'base-spinner-text',
  {
    [`base-spinner-text--${props.color}`]: props.color !== 'current'
  }
])

const spinnerStyle = computed(() => ({
  width: `${actualSize.value}px`,
  height: `${actualSize.value}px`
}))
</script>

<style scoped>
.base-spinner-container {
  @apply flex items-center;
}

.base-spinner-container.base-spinner--centered {
  @apply justify-center;
}

.base-spinner-container.base-spinner--inline {
  @apply inline-flex;
}

.base-spinner-container.base-spinner--with-text {
  @apply gap-3;
}

.base-spinner {
  @apply inline-block;
  color: var(--accent-primary);
}

/* Colors */
.base-spinner--primary {
  color: var(--accent-primary);
}

.base-spinner--secondary {
  color: var(--text-secondary);
}

.base-spinner--success {
  color: var(--accent-success);
}

.base-spinner--warning {
  color: var(--accent-warning);
}

.base-spinner--error {
  color: var(--accent-error);
}

.base-spinner--white {
  color: white;
}

.base-spinner--current {
  color: currentColor;
}

/* Speed variants */
.base-spinner--slow .spinner-svg circle,
.base-spinner--slow .spinner-dots .spinner-dot,
.base-spinner--slow .spinner-bars .spinner-bar,
.base-spinner--slow .spinner-pulse .spinner-pulse-dot,
.base-spinner--slow .spinner-ring-active {
  animation-duration: 2s;
}

.base-spinner--normal .spinner-svg circle,
.base-spinner--normal .spinner-dots .spinner-dot,
.base-spinner--normal .spinner-bars .spinner-bar,
.base-spinner--normal .spinner-pulse .spinner-pulse-dot,
.base-spinner--normal .spinner-ring-active {
  animation-duration: 1s;
}

.base-spinner--fast .spinner-svg circle,
.base-spinner--fast .spinner-dots .spinner-dot,
.base-spinner--fast .spinner-bars .spinner-bar,
.base-spinner--fast .spinner-pulse .spinner-pulse-dot,
.base-spinner--fast .spinner-ring-active {
  animation-duration: 0.6s;
}

/* Default (circular) spinner */
.spinner-svg {
  animation: spin 1s linear infinite;
}

.spinner-svg circle {
  animation: dash 1s ease-in-out infinite;
}

/* Dots spinner */
.spinner-dots {
  @apply flex gap-1;
}

.spinner-dot {
  width: 20%;
  height: 20%;
  background-color: currentColor;
  border-radius: 50%;
  animation: dot-bounce 1s ease-in-out infinite both;
}

.spinner-dot:nth-child(1) {
  animation-delay: -0.32s;
}

.spinner-dot:nth-child(2) {
  animation-delay: -0.16s;
}

.spinner-dot:nth-child(3) {
  animation-delay: 0s;
}

/* Bars spinner */
.spinner-bars {
  @apply flex gap-1 items-end;
  height: 100%;
}

.spinner-bar {
  width: 20%;
  background-color: currentColor;
  animation: bar-scale 1s ease-in-out infinite;
}

.spinner-bar:nth-child(1) {
  animation-delay: -0.4s;
}

.spinner-bar:nth-child(2) {
  animation-delay: -0.2s;
}

.spinner-bar:nth-child(3) {
  animation-delay: 0s;
}

.spinner-bar:nth-child(4) {
  animation-delay: 0.2s;
}

/* Pulse spinner */
.spinner-pulse {
  @apply relative w-full h-full;
}

.spinner-pulse-dot {
  @apply absolute inset-0;
  background-color: currentColor;
  border-radius: 50%;
  opacity: 0.6;
  animation: pulse-scale 1s ease-in-out infinite;
}

/* Ring spinner */
.spinner-ring-active {
  animation: spin 1s linear infinite;
}

/* Text */
.base-spinner-text {
  @apply text-sm font-medium;
  color: var(--text-secondary);
}

.base-spinner-text--primary {
  color: var(--accent-primary);
}

.base-spinner-text--secondary {
  color: var(--text-secondary);
}

.base-spinner-text--success {
  color: var(--accent-success);
}

.base-spinner-text--warning {
  color: var(--accent-warning);
}

.base-spinner-text--error {
  color: var(--accent-error);
}

.base-spinner-text--white {
  color: white;
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

@keyframes dash {
  0% {
    stroke-dasharray: 1, 150;
    stroke-dashoffset: 0;
  }
  50% {
    stroke-dasharray: 90, 150;
    stroke-dashoffset: -35;
  }
  100% {
    stroke-dasharray: 90, 150;
    stroke-dashoffset: -124;
  }
}

@keyframes dot-bounce {
  0%, 80%, 100% {
    transform: scale(0);
  }
  40% {
    transform: scale(1);
  }
}

@keyframes bar-scale {
  0%, 40%, 100% {
    transform: scaleY(0.4);
  }
  20% {
    transform: scaleY(1);
  }
}

@keyframes pulse-scale {
  0% {
    transform: scale(0);
    opacity: 1;
  }
  100% {
    transform: scale(1);
    opacity: 0;
  }
}

/* Responsive adjustments */
@media (max-width: 640px) {
  .base-spinner-container.base-spinner--with-text {
    @apply gap-2;
  }
  
  .base-spinner-text {
    @apply text-xs;
  }
}

/* Reduced motion */
@media (prefers-reduced-motion: reduce) {
  .spinner-svg,
  .spinner-ring-active {
    animation: none;
  }
  
  .spinner-dot,
  .spinner-bar,
  .spinner-pulse-dot {
    animation: none;
  }
  
  .base-spinner {
    opacity: 0.7;
  }
}

/* High contrast mode */
@media (prefers-contrast: high) {
  .base-spinner {
    filter: contrast(2);
  }
}

/* Print styles */
@media print {
  .base-spinner-container {
    display: none !important;
  }
}
</style>