// Управление мобильным меню
document.addEventListener('DOMContentLoaded', function() {
    const menuToggle = document.getElementById('menuToggle');
    const sidebar = document.getElementById('sidebar');
    const closeBtn = document.getElementById('closeBtn');

    // Создаем overlay для мобильного меню
    const overlay = document.createElement('div');
    overlay.className = 'overlay';
    document.body.appendChild(overlay);

    // Открытие меню
    if (menuToggle) {
        menuToggle.addEventListener('click', function() {
            sidebar.classList.add('active');
            overlay.classList.add('active');
            document.body.style.overflow = 'hidden';
        });
    }

    // Закрытие меню
    function closeMenu() {
        sidebar.classList.remove('active');
        overlay.classList.remove('active');
        document.body.style.overflow = '';
    }

    if (closeBtn) {
        closeBtn.addEventListener('click', closeMenu);
    }

    overlay.addEventListener('click', closeMenu);

    // Закрытие меню при клике на ссылку (для мобильных)
    const sidebarLinks = sidebar.querySelectorAll('a');
    sidebarLinks.forEach(link => {
        link.addEventListener('click', function() {
            if (window.innerWidth < 1024) {
                closeMenu();
            }
        });
    });

    // Инициализация Python редактора (если есть на странице)
    initPythonEditor();

    // Инициализация тестов (если есть на странице)
    initQuiz();

    // Отображение пройденных уроков
    updateCompletedLessons();
});

// Python интерпретатор с использованием Skulpt
function initPythonEditor() {
    const runBtns = document.querySelectorAll('.run-btn');
    const clearBtns = document.querySelectorAll('.clear-btn');

    runBtns.forEach((runBtn, index) => {
        runBtn.addEventListener('click', function() {
            const editor = this.closest('.python-editor');
            const code = editor.querySelector('#code-editor, textarea').value;
            const outputElement = editor.querySelector('#output');
            runCode(code, outputElement);
        });
    });

    clearBtns.forEach((clearBtn, index) => {
        clearBtn.addEventListener('click', function() {
            const editor = this.closest('.python-editor');
            editor.querySelector('#code-editor, textarea').value = '';
            editor.querySelector('#output').textContent = '';
        });
    });
}

function runCode(code, outputElement) {
    outputElement.textContent = '';

    // Настройка Skulpt
    Sk.configure({
        output: function(text) {
            outputElement.textContent += text;
        },
        read: function(filename) {
            if (Sk.builtinFiles === undefined || Sk.builtinFiles["files"][filename] === undefined) {
                throw "Файл не найден: '" + filename + "'";
            }
            return Sk.builtinFiles["files"][filename];
        },
        __future__: Sk.python3
    });

    // Выполнение кода
    const myPromise = Sk.misceval.asyncToPromise(function() {
        return Sk.importMainWithBody("<stdin>", false, code, true);
    });

    myPromise.then(
        function(mod) {
            // Успешное выполнение
            if (outputElement.textContent === '') {
                outputElement.textContent = 'Программа выполнена успешно!';
            }
        },
        function(err) {
            // Ошибка
            outputElement.textContent = 'Ошибка: ' + err.toString();
            outputElement.style.color = '#e74c3c';
            setTimeout(() => {
                outputElement.style.color = '#4ec9b0';
            }, 3000);
        }
    );
}

// Новая система тестирования с постепенным появлением вопросов
function initQuiz() {
    const quizContainer = document.querySelector('.quiz-container');
    if (!quizContainer) return;

    const questions = Array.from(quizContainer.querySelectorAll('.question'));
    let currentQuestionIndex = 0;
    let correctAnswersCount = 0;

    // Создаем прогресс-бар
    const progressDiv = document.createElement('div');
    progressDiv.className = 'quiz-progress';
    questions.forEach((_, index) => {
        const dot = document.createElement('div');
        dot.className = 'progress-dot';
        if (index === 0) dot.classList.add('active');
        progressDiv.appendChild(dot);
    });
    quizContainer.insertBefore(progressDiv, quizContainer.querySelector('h3').nextSibling);

    // Показываем первый вопрос
    if (questions.length > 0) {
        questions[0].classList.add('active');
    }

    // Обрабатываем каждый вопрос
    questions.forEach((question, index) => {
        const checkBtn = question.querySelector('.check-answer-btn');
        const options = question.querySelectorAll('input[type="radio"]');
        const feedback = question.querySelector('.feedback');

        // Создаем кнопку "Следующий вопрос"
        let nextBtn = question.querySelector('.next-question-btn');
        if (!nextBtn) {
            nextBtn = document.createElement('button');
            nextBtn.className = 'next-question-btn';
            nextBtn.textContent = index === questions.length - 1 ? 'Показать результаты' : 'Следующий вопрос →';
            checkBtn.parentNode.insertBefore(nextBtn, checkBtn.nextSibling);
        }

        if (checkBtn) {
            checkBtn.addEventListener('click', function() {
                const selectedOption = question.querySelector('input[type="radio"]:checked');

                if (!selectedOption) {
                    alert('Пожалуйста, выберите ответ!');
                    return;
                }

                const isCorrect = selectedOption.dataset.correct === 'true';

                if (isCorrect) {
                    question.classList.remove('incorrect');
                    question.classList.add('correct');
                    correctAnswersCount++;
                    if (feedback) {
                        feedback.className = 'feedback correct';
                        feedback.textContent = '✓ Правильно! ' + (selectedOption.dataset.explanation || '');
                    }
                    // Обновляем прогресс
                    const progressDots = progressDiv.querySelectorAll('.progress-dot');
                    progressDots[index].classList.add('completed');
                } else {
                    question.classList.remove('correct');
                    question.classList.add('incorrect');
                    if (feedback) {
                        feedback.className = 'feedback incorrect';
                        feedback.textContent = '✗ Неправильно. ' + (selectedOption.dataset.explanation || 'Попробуй еще раз!');
                    }
                }

                // Отключаем возможность изменить ответ
                options.forEach(opt => opt.disabled = true);
                checkBtn.disabled = true;
                checkBtn.style.opacity = '0.5';

                // Показываем кнопку "Следующий"
                nextBtn.classList.add('show');
            });
        }

        // Обработка кнопки "Следующий вопрос"
        nextBtn.addEventListener('click', function() {
            // Убираем активность с текущей точки прогресса
            const progressDots = progressDiv.querySelectorAll('.progress-dot');
            progressDots[index].classList.remove('active');

            if (index < questions.length - 1) {
                // Скрываем текущий вопрос
                questions[index].classList.remove('active');

                // Показываем следующий вопрос
                currentQuestionIndex = index + 1;
                questions[currentQuestionIndex].classList.add('active');

                // Обновляем прогресс-бар
                progressDots[currentQuestionIndex].classList.add('active');
            } else {
                // Это был последний вопрос - показываем результаты
                questions[index].classList.remove('active');
                showQuizResults(correctAnswersCount, questions.length);
            }
        });
    });

    function showQuizResults(correct, total) {
        const percentage = Math.round((correct / total) * 100);

        let resultsDiv = quizContainer.querySelector('.quiz-results');
        if (!resultsDiv) {
            resultsDiv = document.createElement('div');
            resultsDiv.className = 'quiz-results';
            quizContainer.appendChild(resultsDiv);
        }

        resultsDiv.innerHTML = `
            <h3>Результаты теста</h3>
            <div class="score">${correct} из ${total}</div>
            <p style="font-size: 1.2rem; margin: 1rem 0;">${percentage}% правильных ответов</p>
            ${percentage >= 80 ? '<p style="color: var(--success-color); font-weight: 600; font-size: 1.1rem;">🎉 Отлично! Ты хорошо усвоил материал!</p>' :
              percentage >= 60 ? '<p style="color: var(--warning-color); font-weight: 600; font-size: 1.1rem;">💪 Неплохо! Но стоит повторить некоторые темы.</p>' :
              '<p style="color: var(--danger-color); font-weight: 600; font-size: 1.1rem;">📚 Рекомендуется повторить урок и попробовать снова.</p>'}
            <button class="btn-secondary" onclick="location.reload()">Пройти тест заново</button>
        `;

        resultsDiv.classList.add('show');
    }
}

// Подсветка активной ссылки в меню
function highlightActiveLesson() {
    const currentPage = window.location.pathname.split('/').pop();
    const sidebarLinks = document.querySelectorAll('.sidebar a');

    sidebarLinks.forEach(link => {
        const linkPage = link.getAttribute('href');
        if (linkPage === currentPage) {
            link.classList.add('active');
        }
    });
}

highlightActiveLesson();

// Сохранение прогресса в localStorage
function saveProgress(lessonId) {
    let progress = JSON.parse(localStorage.getItem('pythonLearnProgress') || '{}');
    progress[lessonId] = {
        completed: true,
        timestamp: new Date().toISOString()
    };
    localStorage.setItem('pythonLearnProgress', JSON.stringify(progress));

    // Обновляем отображение в меню
    updateCompletedLessons();
}

function isLessonCompleted(lessonId) {
    const progress = JSON.parse(localStorage.getItem('pythonLearnProgress') || '{}');
    return progress[lessonId]?.completed || false;
}

// Обновление визуального отображения пройденных уроков в меню
function updateCompletedLessons() {
    const progress = JSON.parse(localStorage.getItem('pythonLearnProgress') || '{}');
    const sidebarLinks = document.querySelectorAll('.sidebar a');

    sidebarLinks.forEach(link => {
        const href = link.getAttribute('href');
        if (!href) return;

        // Извлекаем имя файла без расширения
        const lessonId = href.split('/').pop().replace('.html', '');

        if (progress[lessonId]?.completed) {
            link.classList.add('completed');
        }
    });
}

// Кнопка "Отметить как пройденное"
const markCompleteBtn = document.getElementById('mark-complete');
if (markCompleteBtn) {
    const lessonId = document.body.dataset.lessonId;

    // Проверяем, пройден ли урок
    if (lessonId && isLessonCompleted(lessonId)) {
        markCompleteBtn.textContent = '✓ Урок пройден';
        markCompleteBtn.style.background = 'var(--success-color)';
    }

    markCompleteBtn.addEventListener('click', function() {
        if (lessonId) {
            saveProgress(lessonId);
            markCompleteBtn.textContent = '✓ Урок пройден';
            markCompleteBtn.style.background = 'var(--success-color)';

            // Небольшая анимация
            markCompleteBtn.style.transform = 'scale(1.1)';
            setTimeout(() => {
                markCompleteBtn.style.transform = 'scale(1)';
            }, 200);
        }
    });
}

// Кнопка для сброса прогресса (для разработки)
// Раскомментируй если нужно сбросить прогресс
// localStorage.removeItem('pythonLearnProgress');
