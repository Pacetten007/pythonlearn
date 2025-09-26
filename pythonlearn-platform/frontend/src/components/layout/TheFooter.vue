<template>
  <footer class="app-footer">
    <div class="footer-container">
      <!-- Main Footer Content -->
      <div class="footer-content">
        <!-- Brand Section -->
        <div class="footer-section footer-brand">
          <div class="brand-info">
            <img src="/logo.svg" alt="PythonLearn" class="footer-logo" />
            <h3 class="footer-brand-name">PythonLearn</h3>
          </div>
          <p class="footer-description">
            Интерактивная платформа для изучения программирования на Python. 
            Изучайте код, решайте задачи, получайте достижения.
          </p>
          <div class="social-links">
            <a 
              href="https://github.com/pythonlearn" 
              target="_blank" 
              rel="noopener noreferrer"
              class="social-link"
              aria-label="GitHub"
            >
              <IconGithub :size="20" />
            </a>
            <a 
              href="https://t.me/pythonlearn" 
              target="_blank" 
              rel="noopener noreferrer"
              class="social-link"
              aria-label="Telegram"
            >
              <IconMessageCircle :size="20" />
            </a>
            <a 
              href="https://youtube.com/@pythonlearn" 
              target="_blank" 
              rel="noopener noreferrer"
              class="social-link"
              aria-label="YouTube"
            >
              <IconYoutube :size="20" />
            </a>
          </div>
        </div>

        <!-- Navigation Links -->
        <div class="footer-section">
          <h4 class="footer-title">Обучение</h4>
          <ul class="footer-links">
            <li><RouterLink to="/courses" class="footer-link">Курсы</RouterLink></li>
            <li><RouterLink to="/courses/python-basics" class="footer-link">Основы Python</RouterLink></li>
            <li><RouterLink to="/courses/algorithms" class="footer-link">Алгоритмы</RouterLink></li>
            <li><RouterLink to="/leaderboard" class="footer-link">Рейтинг</RouterLink></li>
          </ul>
        </div>

        <!-- Community Links -->
        <div class="footer-section">
          <h4 class="footer-title">Сообщество</h4>
          <ul class="footer-links">
            <li><a href="#" class="footer-link">Форум</a></li>
            <li><a href="#" class="footer-link">Discord сервер</a></li>
            <li><a href="#" class="footer-link">Блог</a></li>
            <li><RouterLink to="/help" class="footer-link">Помощь</RouterLink></li>
          </ul>
        </div>

        <!-- Company Links -->
        <div class="footer-section">
          <h4 class="footer-title">Компания</h4>
          <ul class="footer-links">
            <li><RouterLink to="/about" class="footer-link">О нас</RouterLink></li>
            <li><a href="#" class="footer-link">Карьера</a></li>
            <li><a href="#" class="footer-link">Пресс-центр</a></li>
            <li><a href="#" class="footer-link">Контакты</a></li>
          </ul>
        </div>

        <!-- Legal Links -->
        <div class="footer-section">
          <h4 class="footer-title">Документы</h4>
          <ul class="footer-links">
            <li><a href="#" class="footer-link">Пользовательское соглашение</a></li>
            <li><a href="#" class="footer-link">Политика конфиденциальности</a></li>
            <li><a href="#" class="footer-link">Публичная оферта</a></li>
            <li><a href="#" class="footer-link">GDPR</a></li>
          </ul>
        </div>
      </div>

      <!-- Footer Bottom -->
      <div class="footer-bottom">
        <div class="footer-bottom-content">
          <div class="footer-info">
            <p class="copyright">
              © {{ currentYear }} PythonLearn. Все права защищены.
            </p>
            <p class="version" v-if="showVersion">
              Версия {{ version }} • Обновлено {{ lastUpdated }}
            </p>
          </div>

          <!-- Language Selector -->
          <div class="language-selector" v-if="showLanguageSelector">
            <button 
              class="language-btn"
              @click="toggleLanguageMenu"
              :aria-label="'Текущий язык: ' + currentLanguage.name"
            >
              <span class="language-flag">{{ currentLanguage.flag }}</span>
              <span class="language-name">{{ currentLanguage.name }}</span>
              <IconChevronDown :size="16" />
            </button>

            <div v-if="showLanguageMenu" class="language-menu" v-click-outside="closeLanguageMenu">
              <button 
                v-for="lang in availableLanguages" 
                :key="lang.code"
                class="language-option"
                :class="{ active: lang.code === currentLanguage.code }"
                @click="changeLanguage(lang)"
              >
                <span class="language-flag">{{ lang.flag }}</span>
                <span class="language-name">{{ lang.name }}</span>
                <IconCheck v-if="lang.code === currentLanguage.code" :size="16" />
              </button>
            </div>
          </div>

          <!-- Theme Toggle -->
          <button 
            class="footer-theme-toggle"
            @click="toggleTheme"
            :aria-label="currentTheme === 'dark' ? 'Переключить на светлую тему' : 'Переключить на темную тему'"
          >
            <IconSun v-if="currentTheme === 'dark'" :size="18" />
            <IconMoon v-else :size="18" />
          </button>
        </div>
      </div>
    </div>

    <!-- Newsletter Subscription (если включено) -->
    <div v-if="showNewsletter" class="newsletter-section">
      <div class="newsletter-container">
        <div class="newsletter-content">
          <div class="newsletter-info">
            <h3 class="newsletter-title">Будьте в курсе новостей</h3>
            <p class="newsletter-description">
              Получайте уведомления о новых курсах, функциях и обновлениях платформы
            </p>
          </div>
          
          <form @submit.prevent="subscribeToNewsletter" class="newsletter-form">
            <div class="newsletter-input-group">
              <BaseInput
                v-model="newsletterEmail"
                type="email"
                placeholder="Введите ваш email"
                :disabled="newsletterLoading"
                class="newsletter-input"
              />
              <BaseButton 
                type="submit"
                variant="primary"
                :loading="newsletterLoading"
                :disabled="!isValidEmail(newsletterEmail)"
              >
                Подписаться
              </BaseButton>
            </div>
            <p class="newsletter-note">
              Отправляя форму, вы соглашаетесь с политикой конфиденциальности
            </p>
          </form>
        </div>
      </div>
    </div>
  </footer>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useTheme } from '@/composables/useTheme'
import { useNotifications } from '@/composables/useNotifications'

// Props
const props = defineProps({
  showNewsletter: {
    type: Boolean,
    default: false
  },
  showVersion: {
    type: Boolean,
    default: false
  },
  showLanguageSelector: {
    type: Boolean,
    default: true
  }
})

// Composables
const { currentTheme, toggleTheme } = useTheme()
const { showNotification } = useNotifications()

// Local state
const showLanguageMenu = ref(false)
const newsletterEmail = ref('')
const newsletterLoading = ref(false)

// Computed
const currentYear = computed(() => new Date().getFullYear())

const version = computed(() => {
  return import.meta.env.VITE_APP_VERSION || '1.0.0'
})

const lastUpdated = computed(() => {
  // В реальном приложении это может быть build time
  return new Date().toLocaleDateString('ru-RU')
})

// Language management
const currentLanguage = ref({
  code: 'ru',
  name: 'Русский',
  flag: '🇷🇺'
})

const availableLanguages = ref([
  { code: 'ru', name: 'Русский', flag: '🇷🇺' },
  { code: 'en', name: 'English', flag: '🇺🇸' },
  { code: 'es', name: 'Español', flag: '🇪🇸' },
  { code: 'fr', name: 'Français', flag: '🇫🇷' }
])

// Methods
const toggleLanguageMenu = () => {
  showLanguageMenu.value = !showLanguageMenu.value
}

const closeLanguageMenu = () => {
  showLanguageMenu.value = false
}

const changeLanguage = (language) => {
  currentLanguage.value = language
  closeLanguageMenu()
  
  // В реальном приложении здесь была бы смена локализации
  showNotification(`Язык изменен на ${language.name}`, 'success')
  
  // Сохраняем в localStorage
  localStorage.setItem('language', language.code)
}

const isValidEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email)
}

const subscribeToNewsletter = async () => {
  if (!isValidEmail(newsletterEmail.value)) {
    showNotification('Введите корректный email адрес', 'error')
    return
  }

  newsletterLoading.value = true

  try {
    // Имитация API запроса
    await new Promise(resolve => setTimeout(resolve, 1000))
    
    showNotification('Спасибо за подписку! Проверьте вашу почту для подтверждения.', 'success')
    newsletterEmail.value = ''
  } catch (error) {
    console.error('Ошибка подписки:', error)
    showNotification('Ошибка при подписке. Попробуйте позже.', 'error')
  } finally {
    newsletterLoading.value = false
  }
}

// Lifecycle
onMounted(() => {
  // Восстанавливаем язык из localStorage
  const savedLanguage = localStorage.getItem('language')
  if (savedLanguage) {
    const language = availableLanguages.value.find(lang => lang.code === savedLanguage)
    if (language) {
      currentLanguage.value = language
    }
  }
})
</script>

<style scoped>
.app-footer {
  background-color: var(--bg-secondary);
  border-top: 1px solid var(--border-primary);
  margin-top: auto;
}

.footer-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 1rem;
}

/* Main Footer Content */
.footer-content {
  display: grid;
  grid-template-columns: 2fr 1fr 1fr 1fr 1fr;
  gap: 2rem;
  padding: 3rem 0 2rem 0;
}

.footer-section {
  display: flex;
  flex-direction: column;
}

/* Brand Section */
.footer-brand {
  max-width: 280px;
}

.brand-info {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  margin-bottom: 1rem;
}

.footer-logo {
  width: 32px;
  height: 32px;
}

.footer-brand-name {
  margin: 0;
  font-size: 1.25rem;
  font-weight: 700;
  color: var(--text-primary);
}

.footer-description {
  margin: 0 0 1.5rem 0;
  color: var(--text-secondary);
  line-height: 1.6;
}

.social-links {
  display: flex;
  gap: 0.75rem;
}

.social-link {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 40px;
  border-radius: var(--radius-md);
  background-color: var(--bg-tertiary);
  color: var(--text-secondary);
  text-decoration: none;
  transition: all var(--transition-fast);
}

.social-link:hover {
  background-color: var(--accent-primary);
  color: white;
  transform: translateY(-2px);
}

/* Footer Links */
.footer-title {
  margin: 0 0 1rem 0;
  font-size: 0.875rem;
  font-weight: 600;
  color: var(--text-primary);
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.footer-links {
  list-style: none;
  margin: 0;
  padding: 0;
}

.footer-links li {
  margin-bottom: 0.5rem;
}

.footer-link {
  color: var(--text-secondary);
  text-decoration: none;
  font-size: 0.875rem;
  transition: color var(--transition-fast);
}

.footer-link:hover {
  color: var(--accent-primary);
}

/* Footer Bottom */
.footer-bottom {
  border-top: 1px solid var(--border-primary);
  padding: 1.5rem 0;
}

.footer-bottom-content {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
}

.footer-info {
  flex: 1;
}

.copyright {
  margin: 0 0 0.25rem 0;
  color: var(--text-secondary);
  font-size: 0.875rem;
}

.version {
  margin: 0;
  color: var(--text-muted);
  font-size: 0.75rem;
}

/* Language Selector */
.language-selector {
  position: relative;
}

.language-btn {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 0.75rem;
  border: 1px solid var(--border-primary);
  border-radius: var(--radius-md);
  background-color: var(--bg-tertiary);
  color: var(--text-primary);
  cursor: pointer;
  transition: all var(--transition-fast);
}

.language-btn:hover {
  border-color: var(--border-secondary);
  background-color: var(--bg-hover);
}

.language-flag {
  font-size: 1rem;
}

.language-name {
  font-size: 0.875rem;
}

.language-menu {
  position: absolute;
  bottom: 100%;
  right: 0;
  margin-bottom: 0.5rem;
  min-width: 160px;
  background-color: var(--bg-secondary);
  border: 1px solid var(--border-primary);
  border-radius: var(--radius-md);
  box-shadow: var(--shadow-lg);
  z-index: 10;
}

.language-option {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  width: 100%;
  padding: 0.75rem;
  border: none;
  background: none;
  color: var(--text-primary);
  cursor: pointer;
  transition: background-color var(--transition-fast);
}

.language-option:hover {
  background-color: var(--bg-hover);
}

.language-option.active {
  background-color: rgba(var(--accent-primary-rgb), 0.1);
  color: var(--accent-primary);
}

.language-option:first-child {
  border-radius: var(--radius-md) var(--radius-md) 0 0;
}

.language-option:last-child {
  border-radius: 0 0 var(--radius-md) var(--radius-md);
}

/* Theme Toggle */
.footer-theme-toggle {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 40px;
  border: 1px solid var(--border-primary);
  border-radius: var(--radius-md);
  background-color: var(--bg-tertiary);
  color: var(--text-secondary);
  cursor: pointer;
  transition: all var(--transition-fast);
}

.footer-theme-toggle:hover {
  border-color: var(--border-secondary);
  background-color: var(--bg-hover);
  color: var(--text-primary);
}

/* Newsletter Section */
.newsletter-section {
  background-color: var(--bg-primary);
  border-top: 1px solid var(--border-primary);
}

.newsletter-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 2rem 1rem;
}

.newsletter-content {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 2rem;
}

.newsletter-info {
  flex: 1;
}

.newsletter-title {
  margin: 0 0 0.5rem 0;
  font-size: 1.25rem;
  font-weight: 600;
  color: var(--text-primary);
}

.newsletter-description {
  margin: 0;
  color: var(--text-secondary);
}

.newsletter-form {
  flex: 1;
  max-width: 400px;
}

.newsletter-input-group {
  display: flex;
  gap: 0.75rem;
  margin-bottom: 0.5rem;
}

.newsletter-input {
  flex: 1;
}

.newsletter-note {
  margin: 0;
  font-size: 0.75rem;
  color: var(--text-muted);
}

/* Responsive */
@media (max-width: 1024px) {
  .footer-content {
    grid-template-columns: 2fr 1fr 1fr 1fr;
    gap: 1.5rem;
  }
}

@media (max-width: 768px) {
  .footer-content {
    grid-template-columns: 1fr 1fr;
    gap: 2rem;
  }
  
  .footer-brand {
    grid-column: 1 / -1;
    max-width: none;
    margin-bottom: 1rem;
  }
  
  .footer-bottom-content {
    flex-direction: column;
    gap: 1rem;
    text-align: center;
  }
  
  .newsletter-content {
    flex-direction: column;
    text-align: center;
  }
  
  .newsletter-input-group {
    flex-direction: column;
  }
}

@media (max-width: 480px) {
  .footer-content {
    grid-template-columns: 1fr;
    gap: 1.5rem;
    padding: 2rem 0 1.5rem 0;
  }
  
  .footer-container {
    padding: 0 0.5rem;
  }
  
  .social-links {
    justify-content: center;
  }
}

/* Print styles */
@media print {
  .newsletter-section,
  .social-links,
  .language-selector,
  .footer-theme-toggle {
    display: none !important;
  }
}
</style>