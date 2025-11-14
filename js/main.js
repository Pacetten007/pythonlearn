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
});

// Python интерпретатор с использованием Skulpt
function initPythonEditor() {
    const runBtn = document.querySelector('.run-btn');
    const clearBtn = document.querySelector('.clear-btn');

    if (!runBtn) return;

    runBtn.addEventListener('click', function() {
        runCode();
    });

    if (clearBtn) {
        clearBtn.addEventListener('click', function() {
            document.getElementById('code-editor').value = '';
            document.getElementById('output').textContent = '';
        });
    }
}

function runCode() {
    const code = document.getElementById('code-editor').value;
    const outputElement = document.getElementById('output');

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

// Система тестирования
function initQuiz() {
    const quizContainer = document.querySelector('.quiz-container');
    if (!quizContainer) return;

    const questions = quizContainer.querySelectorAll('.question');

    questions.forEach((question, index) => {
        const checkBtn = question.querySelector('.check-answer-btn');
        const options = question.querySelectorAll('input[type="radio"]');
        const feedback = question.querySelector('.feedback');

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
                    if (feedback) {
                        feedback.className = 'feedback correct';
                        feedback.textContent = '✓ Правильно! ' + (selectedOption.dataset.explanation || '');
                    }
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
            });
        }
    });

    // Кнопка "Показать результаты"
    const showResultsBtn = document.getElementById('show-results');
    if (showResultsBtn) {
        showResultsBtn.addEventListener('click', function() {
            const correctAnswers = quizContainer.querySelectorAll('.question.correct').length;
            const totalQuestions = questions.length;
            const percentage = Math.round((correctAnswers / totalQuestions) * 100);

            const resultsDiv = document.querySelector('.quiz-results');
            if (resultsDiv) {
                resultsDiv.innerHTML = `
                    <h3>Результаты теста</h3>
                    <div class="score">${correctAnswers} из ${totalQuestions}</div>
                    <p>${percentage}% правильных ответов</p>
                    ${percentage >= 80 ? '<p style="color: #27ae60;">Отлично! Ты хорошо усвоил материал!</p>' :
                      percentage >= 60 ? '<p style="color: #f39c12;">Неплохо! Но стоит повторить некоторые темы.</p>' :
                      '<p style="color: #e74c3c;">Рекомендуется повторить урок и попробовать снова.</p>'}
                `;
            }
        });
    }
}

// Подсветка активной ссылки в меню
function highlightActiveLesson() {
    const currentPage = window.location.pathname.split('/').pop();
    const sidebarLinks = document.querySelectorAll('.sidebar a');

    sidebarLinks.forEach(link => {
        if (link.getAttribute('href') === currentPage) {
            link.style.background = '#3498db';
            link.style.color = 'white';
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
}

function isLessonCompleted(lessonId) {
    const progress = JSON.parse(localStorage.getItem('pythonLearnProgress') || '{}');
    return progress[lessonId]?.completed || false;
}

// Кнопка "Отметить как пройденное"
const markCompleteBtn = document.getElementById('mark-complete');
if (markCompleteBtn) {
    const lessonId = document.body.dataset.lessonId;

    if (isLessonCompleted(lessonId)) {
        markCompleteBtn.textContent = '✓ Урок пройден';
        markCompleteBtn.style.background = '#27ae60';
    }

    markCompleteBtn.addEventListener('click', function() {
        if (lessonId) {
            saveProgress(lessonId);
            markCompleteBtn.textContent = '✓ Урок пройден';
            markCompleteBtn.style.background = '#27ae60';
        }
    });
}
