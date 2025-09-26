<template>
  <div class="home-page">
    <!-- Hero Section -->
    <section class="hero-section">
      <div class="hero-container">
        <div class="hero-content">
          <h1 class="hero-title">
            Изучай <span class="hero-highlight">Python</span><br>
            легко и интересно
          </h1>
          <p class="hero-description">
            Интерактивная платформа для школьников 8-11 классов. 
            Программируй в браузере, решай задачи, получай достижения и готовься к ЕГЭ.
          </p>
          
          <div class="hero-actions">
            <RouterLink to="/register" v-if="!isAuthenticated">
              <BaseButton variant="primary" size="lg" leftIcon="IconRocket">
                Начать обучение
              </BaseButton>
            </RouterLink>
            <RouterLink to="/dashboard" v-else>
              <BaseButton variant="primary" size="lg" leftIcon="IconBookOpen">
                Продолжить обучение
              </BaseButton>
            </RouterLink>
            
            <RouterLink to="/courses">
              <BaseButton variant="outline" size="lg" leftIcon="IconEye">
                Посмотреть курсы
              </BaseButton>
            </RouterLink>
          </div>

          <!-- Quick Stats -->
          <div class="hero-stats">
            <div class="stat-item">
              <div class="stat-number">500+</div>
              <div class="stat-label">Заданий</div>
            </div>
            <div class="stat-item">
              <div class="stat-number">50+</div>
              <div class="stat-label">Уроков</div>
            </div>
            <div class="stat-item">
              <div class="stat-number">1000+</div>
              <div class="stat-label">Учеников</div>
            </div>
          </div>
        </div>

        <!-- Hero Image/Animation -->
        <div class="hero-visual">
          <div class="code-preview">
            <div class="code-header">
              <div class="code-controls">
                <span class="code-dot code-dot--red"></span>
                <span class="code-dot code-dot--yellow"></span>
                <span class="code-dot code-dot--green"></span>
              </div>
              <span class="code-title">main.py</span>
            </div>
            <div class="code-content">
              <div class="code-line">
                <span class="code-keyword">def</span>
                <span class="code-function"> hello_world</span>():
              </div>
              <div class="code-line code-line--indent">
                <span class="code-keyword">print</span>(<span class="code-string">"Привет, Python!"</span>)
              </div>
              <div class="code-line"></div>
              <div class="code-line">
                <span class="code-comment"># Твоё программирование начинается здесь!</span>
              </div>
              <div class="code-line typing-animation">
                <span class="code-function">hello_world</span>()<span class="cursor">|</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- Features Section -->
    <section class="features-section">
      <div class="section-container">
        <div class="section-header">
          <h2 class="section-title">Почему именно PythonLearn?</h2>
          <p class="section-description">
            Мы создали платформу, которая делает изучение программирования увлекательным и эффективным
          </p>
        </div>

        <div class="features-grid">
          <div class="feature-card" v-for="feature in features" :key="feature.id">
            <div class="feature-icon">
              <component :is="feature.icon" :size="32" />
            </div>
            <h3 class="feature-title">{{ feature.title }}</h3>
            <p class="feature-description">{{ feature.description }}</p>
          </div>
        </div>
      </div>
    </section>

    <!-- Learning Path Section -->
    <section class="learning-path-section">
      <div class="section-container">
        <div class="section-header">
          <h2 class="section-title">Твой путь к мастерству</h2>
          <p class="section-description">
            Пошаговый план обучения от основ до подготовки к ЕГЭ
          </p>
        </div>

        <div class="learning-path">
          <div 
            v-for="(step, index) in learningSteps" 
            :key="step.id"
            class="path-step"
            :class="{ 'path-step--completed': index < currentUserLevel }"
          >
            <div class="step-number">{{ index + 1 }}</div>
            <div class="step-content">
              <h3 class="step-title">{{ step.title }}</h3>
              <p class="step-description">{{ step.description }}</p>
              <div class="step-topics">
                <BaseBadge 
                  v-for="topic in step.topics" 
                  :key="topic"
                  :text="topic" 
                  variant="ghost" 
                  size="sm"
                />
              </div>
            </div>
            <div class="step-icon">
              <component :is="step.icon" :size="24" />
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- Demo Section -->
    <section class="demo-section">
      <div class="section-container">
        <div class="demo-content">
          <div class="demo-text">
            <h2 class="demo-title">Попробуй прямо сейчас!</h2>
            <p class="demo-description">
              Напиши свою первую программу на Python в нашем интерактивном редакторе. 
              Никакой установки - всё работает в браузере!
            </p>
            <BaseButton 
              variant="primary" 
              @click="openDemo"
              leftIcon="IconPlay"
            >
              Запустить демо
            </BaseButton>
          </div>
          
          <div class="demo-editor" v-if="showDemo">
            <div class="editor-container">
              <div class="editor-header">
                <span class="editor-title">Попробуй изменить код:</span>
                <BaseButton variant="success" size="sm" @click="runDemoCode">
                  <IconPlay :size="16" />
                  Запустить
                </BaseButton>
              </div>
              <textarea 
                v-model="demoCode" 
                class="demo-textarea"
                @input="formatDemoCode"
              ></textarea>
              <div class="demo-output">
                <div class="output-header">Результат:</div>
                <pre class="output-content">{{ demoOutput }}</pre>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- Testimonials Section -->
    <section class="testimonials-section">
      <div class="section-container">
        <div class="section-header">
          <h2 class="section-title">Что говорят наши ученики</h2>
        </div>

        <div class="testimonials-grid">
          <div 
            v-for="testimonial in testimonials" 
            :key="testimonial.id"
            class="testimonial-card"
          >
            <div class="testimonial-content">
              <p class="testimonial-text">"{{ testimonial.text }}"</p>
            </div>
            <div class="testimonial-author">
              <div class="author-avatar">
                <img 
                  v-if="testimonial.avatar" 
                  :src="testimonial.avatar" 
                  :alt="testimonial.name"
                />
                <div v-else class="avatar-placeholder">
                  {{ testimonial.name[0] }}
                </div>
              </div>
              <div class="author-info">
                <div class="author-name">{{ testimonial.name }}</div>
                <div class="author-grade">{{ testimonial.grade }} класс</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- CTA Section -->
    <section class="cta-section">
      <div class="section-container">
        <div class="cta-content">
          <h2 class="cta-title">Готов начать своё путешествие в мир программирования?</h2>
          <p class="cta-description">
            Присоединяйся к тысячам школьников, которые уже изучают Python на нашей платформе
          </p>
          
          <div class="cta-actions">
            <RouterLink to="/register" v-if="!isAuthenticated">
              <BaseButton variant="primary" size="xl" leftIcon="IconRocket">
                Начать бесплатно
              </BaseButton>
            </RouterLink>
            <RouterLink to="/dashboard" v-else>
              <BaseButton variant="primary" size="xl" leftIcon="IconArrowRight">
                Перейти к обучению
              </BaseButton>
            </RouterLink>
          </div>

          <div class="cta-note">
            <IconCheck :size="16" />
            <span>Бесплатная регистрация • Никаких скрытых платежей • Доступ ко всем базовым курсам</span>
          </div>
        </div>
      </div>
    </section>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { storeToRefs } from 'pinia'
import { useAuthStore } from '@/stores/auth'
import { useProgressStore } from '@/stores/progress'
import { useNotifications } from '@/composables/useNotifications'

// Stores
const authStore = useAuthStore()
const progressStore = useProgressStore()
const { isAuthenticated } = storeToRefs(authStore)
const { userProgress } = storeToRefs(progressStore)

// Composables
const { showNotification } = useNotifications()

// Local state
const showDemo = ref(false)
const demoCode = ref(`# Напиши своё имя вместо "Мир"
name = "Мир"
print(f"Привет, {name}!")

# Попробуй изменить код и нажми "Запустить"`)

const demoOutput = ref('')

// Computed
const currentUserLevel = computed(() => {
  return userProgress.value?.currentLevel || 0
})

// Data
const features = [
  {
    id: 1,
    icon: 'IconCode',
    title: 'Редактор в браузере',
    description: 'Пиши и запускай Python код прямо в браузере без установки программ'
  },
  {
    id: 2,
    icon: 'IconTarget',
    title: 'Пошаговое обучение',
    description: 'От переменных до алгоритмов - изучай программирование постепенно'
  },
  {
    id: 3,
    icon: 'IconTrophy',
    title: 'Геймификация',
    description: 'Получай опыт, достижения и соревнуйся с друзьями в рейтинге'
  },
  {
    id: 4,
    icon: 'IconCheckCircle',
    title: 'Автопроверка',
    description: 'Мгновенная проверка решений с подробными объяснениями ошибок'
  },
  {
    id: 5,
    icon: 'IconUsers',
    title: 'Сообщество',
    description: 'Общайся с другими учениками, делись решениями и получай помощь'
  },
  {
    id: 6,
    icon: 'IconAward',
    title: 'Подготовка к ЕГЭ',
    description: 'Специальные задания для подготовки к экзамену по информатике'
  }
]

const learningSteps = [
  {
    id: 1,
    title: 'Основы Python',
    description: 'Переменные, типы данных, ввод и вывод',
    topics: ['Переменные', 'Числа', 'Строки', 'Ввод/Вывод'],
    icon: 'IconPlay'
  },
  {
    id: 2,
    title: 'Условия и циклы',
    description: 'Логические операции, if-else, for и while',
    topics: ['if-else', 'for', 'while', 'Логика'],
    icon: 'IconGitBranch'
  },
  {
    id: 3,
    title: 'Функции',
    description: 'Создание и использование функций, параметры',
    topics: ['def', 'return', 'Параметры', 'Области видимости'],
    icon: 'IconBox'
  },
  {
    id: 4,
    title: 'Структуры данных',
    description: 'Списки, словари, множества и кортежи',
    topics: ['Списки', 'Словари', 'Множества', 'Кортежи'],
    icon: 'IconDatabase'
  },
  {
    id: 5,
    title: 'Алгоритмы',
    description: 'Сортировка, поиск, рекурсия',
    topics: ['Сортировка', 'Поиск', 'Рекурсия', 'Сложность'],
    icon: 'IconCpu'
  },
  {
    id: 6,
    title: 'Подготовка к ЕГЭ',
    description: 'Решение задач из реальных экзаменов',
    topics: ['Задачи ЕГЭ', 'Оптимизация', 'Практика'],
    icon: 'IconAward'
  }
]

const testimonials = [
  {
    id: 1,
    name: 'Анна Петрова',
    grade: 10,
    text: 'Благодаря PythonLearn я полюбила программирование! Всё объясняется просто и понятно.',
    avatar: null
  },
  {
    id: 2,
    name: 'Михаил Иванов',
    grade: 11,
    text: 'Отличная подготовка к ЕГЭ. Решил все задания по программированию на максимальный балл!',
    avatar: null
  },
  {
    id: 3,
    name: 'София Козлова',
    grade: 9,
    text: 'Мне нравится система достижений. Это как игра, только ты изучаешь настоящее программирование.',
    avatar: null
  }
]

// Methods
const openDemo = () => {
  showDemo.value = true
  setTimeout(() => {
    const demoElement = document.querySelector('.demo-section')
    if (demoElement) {
      demoElement.scrollIntoView({ behavior: 'smooth' })
    }
  }, 100)
}

const runDemoCode = () => {
  try {
    // Простая симуляция выполнения Python кода
    let output = ''
    
    // Парсим простые print() вызовы
    const printMatches = demoCode.value.match(/print\([^)]+\)/g)
    if (printMatches) {
      printMatches.forEach(match => {
        // Извлекаем содержимое print()
        const content = match.slice(6, -1) // Убираем 'print(' и ')'
        
        // Простая обработка f-строк
        if (content.includes('f"') || content.includes("f'")) {
          const nameMatch = demoCode.value.match(/name\s*=\s*["']([^"']+)["']/)
          const name = nameMatch ? nameMatch[1] : 'Мир'
          output += `Привет, ${name}!\n`
        } else {
          // Убираем кавычки
          const cleanContent = content.replace(/["']/g, '')
          output += cleanContent + '\n'
        }
      })
    }
    
    if (!output) {
      output = '# Код выполнен успешно!\n# Добавь print() чтобы увидеть результат'
    }
    
    demoOutput.value = output
    showNotification('Код выполнен!', 'success')
  } catch (error) {
    demoOutput.value = 'Ошибка в коде. Проверь синтаксис!'
    showNotification('Ошибка в коде', 'error')
  }
}

const formatDemoCode = () => {
  // Простая подсветка синтаксиса через CSS классы
  // В реальном приложении здесь был бы Monaco Editor
}

// Lifecycle
onMounted(() => {
  // Запускаем демо код при загрузке
  runDemoCode()
})
</script>

<style scoped>
.home-page {
  min-height: 100vh;
}

/* Hero Section */
.hero-section {
  background: linear-gradient(135deg, var(--bg-primary) 0%, var(--bg-secondary) 100%);
  padding: 4rem 0 6rem 0;
  position: relative;
  overflow: hidden;
}

.hero-section::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: url('data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><defs><pattern id="grid" width="10" height="10" patternUnits="userSpaceOnUse"><path d="M 10 0 L 0 0 0 10" fill="none" stroke="rgb(99 102 241 / 0.1)" stroke-width="0.5"/></pattern></defs><rect width="100" height="100" fill="url(%23grid)"/></svg>');
  opacity: 0.3;
}

.hero-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 2rem;
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 4rem;
  align-items: center;
  position: relative;
  z-index: 1;
}

.hero-title {
  font-size: 3.5rem;
  font-weight: 800;
  line-height: 1.1;
  margin: 0 0 1.5rem 0;
  color: var(--text-primary);
}

.hero-highlight {
  background: linear-gradient(135deg, var(--accent-primary), var(--accent-purple));
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.hero-description {
  font-size: 1.25rem;
  line-height: 1.6;
  margin: 0 0 2rem 0;
  color: var(--text-secondary);
}

.hero-actions {
  display: flex;
  gap: 1rem;
  margin-bottom: 3rem;
}

.hero-stats {
  display: flex;
  gap: 2rem;
}

.stat-item {
  text-align: center;
}

.stat-number {
  font-size: 2rem;
  font-weight: 700;
  color: var(--accent-primary);
  display: block;
}

.stat-label {
  font-size: 0.875rem;
  color: var(--text-muted);
  margin-top: 0.25rem;
}

/* Hero Visual */
.hero-visual {
  display: flex;
  justify-content: center;
  align-items: center;
}

.code-preview {
  background: var(--bg-tertiary);
  border: 1px solid var(--border-primary);
  border-radius: var(--radius-lg);
  overflow: hidden;
  box-shadow: var(--shadow-xl);
  max-width: 400px;
  width: 100%;
}

.code-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0.75rem 1rem;
  background: var(--bg-secondary);
  border-bottom: 1px solid var(--border-primary);
}

.code-controls {
  display: flex;
  gap: 0.5rem;
}

.code-dot {
  width: 12px;
  height: 12px;
  border-radius: 50%;
}

.code-dot--red { background: #ff5f57; }
.code-dot--yellow { background: #ffbd2e; }
.code-dot--green { background: #28ca42; }

.code-title {
  font-family: var(--font-code);
  font-size: 0.875rem;
  color: var(--text-secondary);
}

.code-content {
  padding: 1rem;
  font-family: var(--font-code);
  font-size: 0.875rem;
  line-height: 1.6;
}

.code-line {
  margin-bottom: 0.25rem;
}

.code-line--indent {
  margin-left: 2rem;
}

.code-keyword { color: var(--syntax-keyword); }
.code-function { color: var(--syntax-function); }
.code-string { color: var(--syntax-string); }
.code-comment { color: var(--syntax-comment); }

.typing-animation {
  animation: blink 1s infinite;
}

.cursor {
  animation: blink 1s infinite;
}

@keyframes blink {
  0%, 50% { opacity: 1; }
  51%, 100% { opacity: 0; }
}

/* Common Section Styles */
.section-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 2rem;
}

.section-header {
  text-align: center;
  margin-bottom: 4rem;
}

.section-title {
  font-size: 2.5rem;
  font-weight: 700;
  margin: 0 0 1rem 0;
  color: var(--text-primary);
}

.section-description {
  font-size: 1.125rem;
  color: var(--text-secondary);
  max-width: 600px;
  margin: 0 auto;
}

/* Features Section */
.features-section {
  padding: 6rem 0;
  background: var(--bg-secondary);
}

.features-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(350px, 1fr));
  gap: 2rem;
}

.feature-card {
  padding: 2rem;
  background: var(--bg-primary);
  border: 1px solid var(--border-primary);
  border-radius: var(--radius-xl);
  text-align: center;
  transition: all var(--transition-normal);
}

.feature-card:hover {
  transform: translateY(-4px);
  box-shadow: var(--shadow-lg);
  border-color: var(--accent-primary);
}

.feature-icon {
  color: var(--accent-primary);
  margin-bottom: 1rem;
}

.feature-title {
  font-size: 1.25rem;
  font-weight: 600;
  margin: 0 0 0.75rem 0;
  color: var(--text-primary);
}

.feature-description {
  color: var(--text-secondary);
  line-height: 1.6;
}

/* Learning Path Section */
.learning-path-section {
  padding: 6rem 0;
}

.learning-path {
  display: flex;
  flex-direction: column;
  gap: 2rem;
}

.path-step {
  display: flex;
  align-items: center;
  gap: 2rem;
  padding: 2rem;
  background: var(--bg-secondary);
  border: 1px solid var(--border-primary);
  border-radius: var(--radius-lg);
  position: relative;
  transition: all var(--transition-normal);
}

.path-step:hover {
  border-color: var(--accent-primary);
}

.path-step--completed {
  border-color: var(--accent-success);
  background: rgba(var(--accent-success-rgb), 0.05);
}

.step-number {
  width: 48px;
  height: 48px;
  background: var(--accent-primary);
  color: white;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 600;
  font-size: 1.125rem;
  flex-shrink: 0;
}

.path-step--completed .step-number {
  background: var(--accent-success);
}

.step-content {
  flex: 1;
}

.step-title {
  font-size: 1.25rem;
  font-weight: 600;
  margin: 0 0 0.5rem 0;
  color: var(--text-primary);
}

.step-description {
  color: var(--text-secondary);
  margin: 0 0 1rem 0;
}

.step-topics {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
}

.step-icon {
  color: var(--accent-primary);
  flex-shrink: 0;
}

/* Demo Section */
.demo-section {
  padding: 6rem 0;
  background: var(--bg-secondary);
}

.demo-content {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 4rem;
  align-items: center;
}

.demo-title {
  font-size: 2rem;
  font-weight: 700;
  margin: 0 0 1rem 0;
  color: var(--text-primary);
}

.demo-description {
  color: var(--text-secondary);
  line-height: 1.6;
  margin: 0 0 2rem 0;
}

.demo-editor {
  width: 100%;
}

.editor-container {
  background: var(--bg-tertiary);
  border: 1px solid var(--border-primary);
  border-radius: var(--radius-lg);
  overflow: hidden;
}

.editor-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.75rem 1rem;
  background: var(--bg-secondary);
  border-bottom: 1px solid var(--border-primary);
}

.editor-title {
  font-weight: 500;
  color: var(--text-primary);
}

.demo-textarea {
  width: 100%;
  min-height: 150px;
  padding: 1rem;
  border: none;
  background: var(--bg-tertiary);
  color: var(--text-primary);
  font-family: var(--font-code);
  font-size: 0.875rem;
  line-height: 1.6;
  resize: vertical;
}

.demo-textarea:focus {
  outline: none;
}

.demo-output {
  border-top: 1px solid var(--border-primary);
}

.output-header {
  padding: 0.5rem 1rem;
  background: var(--bg-secondary);
  font-size: 0.875rem;
  font-weight: 500;
  color: var(--text-secondary);
}

.output-content {
  padding: 1rem;
  margin: 0;
  font-family: var(--font-code);
  font-size: 0.875rem;
  color: var(--accent-success);
  white-space: pre-wrap;
  min-height: 60px;
}

/* Testimonials Section */
.testimonials-section {
  padding: 6rem 0;
}

.testimonials-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 2rem;
}

.testimonial-card {
  padding: 2rem;
  background: var(--bg-secondary);
  border: 1px solid var(--border-primary);
  border-radius: var(--radius-lg);
}

.testimonial-text {
  font-size: 1.125rem;
  line-height: 1.6;
  color: var(--text-primary);
  margin: 0 0 1.5rem 0;
  font-style: italic;
}

.testimonial-author {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.author-avatar {
  width: 48px;
  height: 48px;
  border-radius: 50%;
  overflow: hidden;
}

.author-avatar img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.avatar-placeholder {
  width: 100%;
  height: 100%;
  background: var(--accent-primary);
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 600;
}

.author-name {
  font-weight: 600;
  color: var(--text-primary);
}

.author-grade {
  font-size: 0.875rem;
  color: var(--text-secondary);
}

/* CTA Section */
.cta-section {
  padding: 6rem 0;
  background: linear-gradient(135deg, var(--accent-primary), var(--accent-purple));
  color: white;
  text-align: center;
}

.cta-title {
  font-size: 2.5rem;
  font-weight: 700;
  margin: 0 0 1rem 0;
}

.cta-description {
  font-size: 1.125rem;
  margin: 0 0 2rem 0;
  opacity: 0.9;
}

.cta-actions {
  margin-bottom: 2rem;
}

.cta-note {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  font-size: 0.875rem;
  opacity: 0.8;
}

/* Responsive */
@media (max-width: 1024px) {
  .hero-container,
  .demo-content {
    grid-template-columns: 1fr;
    gap: 3rem;
  }
  
  .hero-title {
    font-size: 3rem;
  }
  
  .section-title {
    font-size: 2rem;
  }
}

@media (max-width: 768px) {
  .hero-title {
    font-size: 2.5rem;
  }
  
  .hero-actions {
    flex-direction: column;
  }
  
  .hero-stats {
    justify-content: center;
  }
  
  .features-grid {
    grid-template-columns: 1fr;
  }
  
  .path-step {
    flex-direction: column;
    text-align: center;
  }
  
  .step-topics {
    justify-content: center;
  }
  
  .testimonials-grid {
    grid-template-columns: 1fr;
  }
  
  .cta-title {
    font-size: 2rem;
  }
}

@media (max-width: 640px) {
  .hero-section,
  .features-section,
  .learning-path-section,
  .demo-section,
  .testimonials-section,
  .cta-section {
    padding: 3rem 0;
  }
  
  .section-container {
    padding: 0 1rem;
  }
  
  .hero-container {
    padding: 0 1rem;
  }
}
</style>