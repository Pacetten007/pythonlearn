<template>
  <BaseModal
    :model-value="true"
    @update:model-value="$emit('close')"
    size="md"
    centered
    :persistent="false"
    transition="slide-up"
  >
    <div class="achievement-modal-content" v-if="achievement">
      <!-- Achievement Animation Container -->
      <div class="achievement-animation">
        <!-- Particles Background -->
        <div class="particles-container">
          <div 
            v-for="particle in particles" 
            :key="particle.id"
            class="particle"
            :style="particle.style"
          ></div>
        </div>

        <!-- Achievement Badge -->
        <div class="achievement-badge" :class="badgeClasses">
          <div class="achievement-icon-container">
            <div class="achievement-icon" :style="iconStyle">
              {{ achievement.icon }}
            </div>
            
            <!-- Glow Effect -->
            <div class="achievement-glow" :class="glowClasses"></div>
            
            <!-- Ring Animation -->
            <div class="achievement-ring" :class="ringClasses"></div>
          </div>
        </div>

        <!-- Achievement Details -->
        <div class="achievement-details">
          <div class="achievement-header">
            <BaseBadge 
              :text="rarityLabels[achievement.rarity] || 'Обычное'" 
              :variant="rarityVariants[achievement.rarity] || 'default'"
              size="sm"
              class="achievement-rarity"
            />
          </div>

          <h2 class="achievement-title">{{ achievement.title }}</h2>
          <p class="achievement-description">{{ achievement.description }}</p>

          <!-- XP Reward -->
          <div v-if="achievement.xpReward > 0" class="achievement-reward">
            <div class="reward-item">
              <IconZap :size="20" class="reward-icon" />
              <span class="reward-text">+{{ achievement.xpReward }} XP</span>
            </div>
          </div>

          <!-- Unlock Rewards -->
          <div v-if="hasUnlockRewards" class="achievement-unlocks">
            <h4 class="unlocks-title">Разблокировано:</h4>
            <div class="unlocks-list">
              <div v-if="achievement.titleUnlock" class="unlock-item">
                <IconCrown :size="16" />
                <span>Титул: "{{ achievement.titleUnlock }}"</span>
              </div>
              <div v-if="achievement.badgeUnlock" class="unlock-item">
                <IconStar :size="16" />
                <span>Значок: {{ achievement.badgeUnlock }}</span>
              </div>
            </div>
          </div>

          <!-- Progress Info (for progress-based achievements) -->
          <div v-if="achievement.progress" class="achievement-progress">
            <div class="progress-info">
              <span class="progress-label">Прогресс</span>
              <span class="progress-value">
                {{ achievement.progress.current }}/{{ achievement.progress.total }}
              </span>
            </div>
            <BaseProgressBar
              :value="achievement.progress.current"
              :max="achievement.progress.total"
              variant="success"
              size="sm"
            />
          </div>

          <!-- Share Button -->
          <div class="achievement-actions">
            <BaseButton
              variant="primary"
              @click="shareAchievement"
              leftIcon="IconShare"
              class="share-btn"
            >
              Поделиться
            </BaseButton>
            
            <BaseButton
              variant="ghost"
              @click="$emit('close')"
              class="close-btn"
            >
              Закрыть
            </BaseButton>
          </div>
        </div>
      </div>
    </div>
  </BaseModal>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useNotifications } from '@/composables/useNotifications'

const props = defineProps({
  achievement: {
    type: Object,
    required: true,
    default: () => ({
      id: '',
      title: '',
      description: '',
      icon: '🏆',
      rarity: 'common',
      xpReward: 0,
      titleUnlock: '',
      badgeUnlock: '',
      progress: null
    })
  }
})

const emit = defineEmits(['close'])

// Composables
const { showNotification } = useNotifications()

// Refs
const particles = ref([])
const particleAnimation = ref(null)

// Computed
const rarityLabels = {
  common: 'Обычное',
  rare: 'Редкое',
  epic: 'Эпическое',
  legendary: 'Легендарное'
}

const rarityVariants = {
  common: 'default',
  rare: 'primary',
  epic: 'warning',
  legendary: 'error'
}

const badgeClasses = computed(() => [
  'achievement-badge',
  `achievement-badge--${props.achievement?.rarity || 'common'}`
])

const glowClasses = computed(() => [
  'achievement-glow',
  `achievement-glow--${props.achievement?.rarity || 'common'}`
])

const ringClasses = computed(() => [
  'achievement-ring',
  `achievement-ring--${props.achievement?.rarity || 'common'}`
])

const iconStyle = computed(() => {
  const colors = {
    common: '#6b7280',
    rare: '#3b82f6',
    epic: '#f59e0b',
    legendary: '#ef4444'
  }
  
  return {
    background: `linear-gradient(135deg, ${colors[props.achievement?.rarity || 'common']}, ${colors[props.achievement?.rarity || 'common']}dd)`,
    boxShadow: `0 0 20px ${colors[props.achievement?.rarity || 'common']}40`
  }
})

const hasUnlockRewards = computed(() => {
  return props.achievement?.titleUnlock || props.achievement?.badgeUnlock
})

// Methods
const createParticles = () => {
  const particleCount = 30
  particles.value = []
  
  for (let i = 0; i < particleCount; i++) {
    const particle = {
      id: i,
      style: {
        '--delay': `${Math.random() * 3}s`,
        '--duration': `${2 + Math.random() * 2}s`,
        '--x': `${Math.random() * 100}%`,
        '--y': `${Math.random() * 100}%`,
        '--size': `${2 + Math.random() * 4}px`,
        '--opacity': Math.random() * 0.8 + 0.2
      }
    }
    particles.value.push(particle)
  }
}

const shareAchievement = async () => {
  const shareData = {
    title: `Получено достижение: ${props.achievement.title}`,
    text: props.achievement.description,
    url: window.location.href
  }
  
  try {
    if (navigator.share) {
      await navigator.share(shareData)
      showNotification('Достижение отправлено', 'success')
    } else {
      // Fallback - копируем в буфер обмена
      const text = `🏆 Получено достижение: ${props.achievement.title}\n${props.achievement.description}\n\nИзучай Python на PythonLearn!`
      await navigator.clipboard.writeText(text)
      showNotification('Текст скопирован в буфер обмена', 'success')
    }
  } catch (error) {
    console.error('Ошибка при попытке поделиться:', error)
    showNotification('Не удалось поделиться достижением', 'error')
  }
}

const playSuccessSound = () => {
  // В реальном приложении здесь может быть воспроизведение звука
  if ('speechSynthesis' in window) {
    // Простая звуковая обратная связь
    const utterance = new SpeechSynthesisUtterance()
    utterance.text = '.'
    utterance.volume = 0.1
    utterance.rate = 10
    utterance.pitch = 2
    speechSynthesis.speak(utterance)
  }
}

// Lifecycle
onMounted(() => {
  createParticles()
  playSuccessSound()
  
  // Автоматическое закрытие через 10 секунд
  setTimeout(() => {
    emit('close')
  }, 10000)
})

onUnmounted(() => {
  if (particleAnimation.value) {
    cancelAnimationFrame(particleAnimation.value)
  }
})
</script>

<style scoped>
.achievement-modal-content {
  padding: 0;
  overflow: hidden;
  border-radius: var(--radius-lg);
}

/* Animation Container */
.achievement-animation {
  position: relative;
  padding: 2rem;
  background: linear-gradient(135deg, var(--bg-secondary) 0%, var(--bg-tertiary) 100%);
  text-align: center;
  overflow: hidden;
}

/* Particles Background */
.particles-container {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  pointer-events: none;
  overflow: hidden;
}

.particle {
  position: absolute;
  width: var(--size);
  height: var(--size);
  background: var(--accent-primary);
  border-radius: 50%;
  opacity: var(--opacity);
  animation: float var(--duration) ease-in-out infinite var(--delay);
  left: var(--x);
  top: var(--y);
}

/* Achievement Badge */
.achievement-badge {
  position: relative;
  margin: 0 auto 2rem auto;
  width: 120px;
  height: 120px;
  animation: bounceIn 0.8s cubic-bezier(0.68, -0.55, 0.265, 1.55);
}

.achievement-icon-container {
  position: relative;
  width: 100%;
  height: 100%;
}

.achievement-icon {
  width: 100%;
  height: 100%;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 3rem;
  color: white;
  border: 4px solid rgba(255, 255, 255, 0.3);
  position: relative;
  z-index: 2;
}

/* Glow Effect */
.achievement-glow {
  position: absolute;
  top: -10px;
  left: -10px;
  right: -10px;
  bottom: -10px;
  border-radius: 50%;
  opacity: 0.6;
  animation: pulse 2s ease-in-out infinite;
  z-index: 1;
}

.achievement-glow--common {
  background: radial-gradient(circle, #6b728040 0%, transparent 70%);
}

.achievement-glow--rare {
  background: radial-gradient(circle, #3b82f640 0%, transparent 70%);
}

.achievement-glow--epic {
  background: radial-gradient(circle, #f59e0b40 0%, transparent 70%);
}

.achievement-glow--legendary {
  background: radial-gradient(circle, #ef444440 0%, transparent 70%);
}

/* Ring Animation */
.achievement-ring {
  position: absolute;
  top: -15px;
  left: -15px;
  right: -15px;
  bottom: -15px;
  border: 2px solid;
  border-radius: 50%;
  opacity: 0;
  animation: ringExpand 1.5s ease-out infinite 0.5s;
}

.achievement-ring--common {
  border-color: #6b7280;
}

.achievement-ring--rare {
  border-color: #3b82f6;
}

.achievement-ring--epic {
  border-color: #f59e0b;
}

.achievement-ring--legendary {
  border-color: #ef4444;
}

/* Achievement Details */
.achievement-details {
  animation: slideUp 0.6s ease-out 0.3s both;
}

.achievement-header {
  margin-bottom: 1rem;
}

.achievement-rarity {
  animation: fadeIn 0.4s ease-out 0.8s both;
}

.achievement-title {
  margin: 0 0 1rem 0;
  font-size: 1.5rem;
  font-weight: 700;
  color: var(--text-primary);
  animation: fadeIn 0.6s ease-out 0.4s both;
}

.achievement-description {
  margin: 0 0 1.5rem 0;
  color: var(--text-secondary);
  line-height: 1.6;
  animation: fadeIn 0.6s ease-out 0.6s both;
}

/* Rewards */
.achievement-reward {
  margin-bottom: 1.5rem;
  animation: fadeIn 0.6s ease-out 0.8s both;
}

.reward-item {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 1rem;
  background: rgba(var(--accent-success-rgb), 0.1);
  border: 1px solid var(--accent-success);
  border-radius: var(--radius-full);
  color: var(--accent-success);
  font-weight: 600;
}

.reward-icon {
  animation: bounce 1s ease-in-out infinite;
}

/* Unlocks */
.achievement-unlocks {
  margin-bottom: 1.5rem;
  text-align: left;
  animation: fadeIn 0.6s ease-out 1s both;
}

.unlocks-title {
  margin: 0 0 0.5rem 0;
  font-size: 0.875rem;
  font-weight: 600;
  color: var(--text-primary);
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.unlocks-list {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.unlock-item {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem;
  background: var(--bg-tertiary);
  border-radius: var(--radius-md);
  color: var(--text-primary);
  font-size: 0.875rem;
}

/* Progress */
.achievement-progress {
  margin-bottom: 1.5rem;
  animation: fadeIn 0.6s ease-out 1.2s both;
}

.progress-info {
  display: flex;
  justify-content: space-between;
  margin-bottom: 0.5rem;
}

.progress-label {
  font-weight: 500;
  color: var(--text-primary);
}

.progress-value {
  font-weight: 600;
  color: var(--accent-success);
}

/* Actions */
.achievement-actions {
  display: flex;
  gap: 0.75rem;
  justify-content: center;
  animation: fadeIn 0.6s ease-out 1.4s both;
}

.share-btn,
.close-btn {
  flex: 1;
  max-width: 120px;
}

/* Rarity Variants */
.achievement-badge--common .achievement-icon {
  background: linear-gradient(135deg, #6b7280, #4b5563);
}

.achievement-badge--rare .achievement-icon {
  background: linear-gradient(135deg, #3b82f6, #2563eb);
}

.achievement-badge--epic .achievement-icon {
  background: linear-gradient(135deg, #f59e0b, #d97706);
}

.achievement-badge--legendary .achievement-icon {
  background: linear-gradient(135deg, #ef4444, #dc2626);
}

/* Animations */
@keyframes float {
  0%, 100% {
    transform: translateY(0) rotate(0deg);
    opacity: var(--opacity);
  }
  50% {
    transform: translateY(-20px) rotate(180deg);
    opacity: 0;
  }
}

@keyframes bounceIn {
  0% {
    transform: scale(0.3) rotate(-180deg);
    opacity: 0;
  }
  50% {
    transform: scale(1.1) rotate(-90deg);
    opacity: 1;
  }
  100% {
    transform: scale(1) rotate(0deg);
    opacity: 1;
  }
}

@keyframes pulse {
  0%, 100% {
    transform: scale(1);
    opacity: 0.6;
  }
  50% {
    transform: scale(1.1);
    opacity: 0.8;
  }
}

@keyframes ringExpand {
  0% {
    transform: scale(1);
    opacity: 1;
  }
  100% {
    transform: scale(1.5);
    opacity: 0;
  }
}

@keyframes slideUp {
  from {
    transform: translateY(30px);
    opacity: 0;
  }
  to {
    transform: translateY(0);
    opacity: 1;
  }
}

@keyframes fadeIn {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}

@keyframes bounce {
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

/* Responsive */
@media (max-width: 640px) {
  .achievement-animation {
    padding: 1.5rem;
  }
  
  .achievement-badge {
    width: 100px;
    height: 100px;
    margin-bottom: 1.5rem;
  }
  
  .achievement-icon {
    font-size: 2.5rem;
  }
  
  .achievement-title {
    font-size: 1.25rem;
  }
  
  .achievement-actions {
    flex-direction: column;
  }
  
  .share-btn,
  .close-btn {
    max-width: none;
  }
}

/* Reduced motion */
@media (prefers-reduced-motion: reduce) {
  * {
    animation-duration: 0.01s !important;
    animation-iteration-count: 1 !important;
  }
  
  .particle {
    display: none;
  }
}

/* Print styles */
@media print {
  .achievement-modal-content {
    background: white !important;
    color: black !important;
  }
  
  .particles-container,
  .achievement-glow,
  .achievement-ring {
    display: none !important;
  }
}
</style>