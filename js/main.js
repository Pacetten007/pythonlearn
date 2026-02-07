const NavigationManager = {
    loadNavigation() {
        const sidebarContainer = document.getElementById('sidebar-container');
        if (!sidebarContainer) return false;
        if (typeof sidebarHTML !== 'undefined') {
            sidebarContainer.innerHTML = sidebarHTML;
            return true;
        }
        return false;
    },

    getCurrentPage() {
        return window.location.pathname.split('/').pop() || '';
    },

    findActiveGroup() {
        const currentPage = this.getCurrentPage();
        if (!currentPage) return null;

        const lessonGroups = document.querySelectorAll('.lesson-group');
        for (const group of lessonGroups) {
            const links = group.querySelectorAll('a');
            for (const link of links) {
                const href = link.getAttribute('href');
                if (href && href === currentPage) {
                    return group;
                }
            }
        }
        return null;
    },

    expandActiveGroup() {
        const activeGroup = this.findActiveGroup();
        if (activeGroup) {
            activeGroup.classList.remove('collapsed');
        }
    },

    initCollapsibleModules() {
        const lessonGroups = document.querySelectorAll('.lesson-group');
        const savedState = JSON.parse(localStorage.getItem('sidebarState') || '{}');
        const activeGroup = this.findActiveGroup();

        lessonGroups.forEach((group, index) => {
            const header = group.querySelector('.lesson-group-header');
            if (!header) return;

            const groupTitle = header.querySelector('h3')?.textContent || `group-${index}`;
            const isSavedExpanded = savedState[groupTitle] === true;
            const isActive = activeGroup === group;

            if (isActive || isSavedExpanded) {
                group.classList.remove('collapsed');
            } else {
                group.classList.add('collapsed');
            }

            header.addEventListener('click', () => {
                group.classList.toggle('collapsed');
                savedState[groupTitle] = !group.classList.contains('collapsed');
                localStorage.setItem('sidebarState', JSON.stringify(savedState));
            });
        });
    }
};

const SidebarManager = {
    closeSidebar() {
        const sidebar = document.getElementById('sidebar');
        const overlay = document.querySelector('.overlay');
        if (sidebar) sidebar.classList.remove('active');
        if (overlay) overlay.classList.remove('active');
        document.body.style.overflow = '';
    },

    initCloseButton() {
        const sidebar = document.getElementById('sidebar');
        if (!sidebar) return;

        const closeBtn = sidebar.querySelector('#closeBtn');
        if (closeBtn) {
            const newCloseBtn = closeBtn.cloneNode(true);
            closeBtn.parentNode.replaceChild(newCloseBtn, closeBtn);
            newCloseBtn.addEventListener('click', (e) => {
                e.preventDefault();
                e.stopPropagation();
                e.stopImmediatePropagation();
                this.closeSidebar();
                return false;
            });
        }
    },

    initSidebarLinks() {
        const sidebar = document.getElementById('sidebar');
        if (!sidebar) return;

        const sidebarLinks = sidebar.querySelectorAll('a');
        sidebarLinks.forEach(link => {
            link.addEventListener('click', () => {
                if (window.innerWidth < 1024) {
                    this.closeSidebar();
                }
            });
        });
    }
};

document.addEventListener('click', (e) => {
    if (e.target && (e.target.id === 'closeBtn' || e.target.closest('#closeBtn'))) {
        e.preventDefault();
        e.stopPropagation();
        e.stopImmediatePropagation();
        SidebarManager.closeSidebar();
        return false;
    }
}, true);

document.addEventListener('DOMContentLoaded', () => {
    const overlay = document.createElement('div');
    overlay.className = 'overlay';
    document.body.appendChild(overlay);

    if (NavigationManager.loadNavigation()) {
        setTimeout(() => {
            NavigationManager.initCollapsibleModules();
            highlightActiveLesson();
            updateCompletedLessons();
            SidebarManager.initCloseButton();
            SidebarManager.initSidebarLinks();
        }, 10);
    }

    const menuToggle = document.getElementById('menuToggle');
    if (menuToggle) {
        menuToggle.addEventListener('click', () => {
            const sidebar = document.getElementById('sidebar');
            if (sidebar) {
                sidebar.classList.add('active');
                overlay.classList.add('active');
                document.body.style.overflow = 'hidden';
            }
        });
    }

    overlay.addEventListener('click', (e) => {
        if (e.target.closest('.sidebar')) return;
        SidebarManager.closeSidebar();
    });

    const sidebar = document.getElementById('sidebar');
    if (sidebar && !document.getElementById('sidebar-container')) {
        NavigationManager.initCollapsibleModules();
        highlightActiveLesson();
        updateCompletedLessons();
        SidebarManager.initSidebarLinks();
    }

    initPythonEditor();
    initQuiz();
    initMarkComplete();
});

function initCollapsibleModules() {
    NavigationManager.initCollapsibleModules();
}

function highlightActiveLesson() {
    const currentPage = NavigationManager.getCurrentPage();
    const sidebarLinks = document.querySelectorAll('.sidebar a');

    sidebarLinks.forEach(link => {
        const linkPage = link.getAttribute('href');
        if (linkPage === currentPage) {
            link.classList.add('active');
        }
    });
}

function initMarkComplete() {
    const markCompleteBtn = document.getElementById('mark-complete');
    if (!markCompleteBtn) return;

    const lessonId = document.body.dataset.lessonId;
    if (!lessonId) return;

    if (isLessonCompleted(lessonId)) {
        markCompleteBtn.textContent = '✓ Урок пройден';
        markCompleteBtn.style.background = 'var(--success-color)';
    }

    markCompleteBtn.addEventListener('click', () => {
        saveProgress(lessonId);
        markCompleteBtn.textContent = '✓ Урок пройден';
        markCompleteBtn.style.background = 'var(--success-color)';
        markCompleteBtn.style.transform = 'scale(1.1)';
        setTimeout(() => {
            markCompleteBtn.style.transform = 'scale(1)';
        }, 200);
    });
}

const PythonEditor = {
    init() {
        const runBtns = document.querySelectorAll('.run-btn');
        const clearBtns = document.querySelectorAll('.clear-btn');

        runBtns.forEach(runBtn => {
            runBtn.addEventListener('click', function() {
                const editor = this.closest('.python-editor');
                const code = editor.querySelector('#code-editor, textarea').value;
                const outputElement = editor.querySelector('#output');
                PythonEditor.runCode(code, outputElement);
            });
        });

        clearBtns.forEach(clearBtn => {
            clearBtn.addEventListener('click', function() {
                const editor = this.closest('.python-editor');
                editor.querySelector('#code-editor, textarea').value = '';
                editor.querySelector('#output').textContent = '';
            });
        });

        // Добавляем поддержку табов в textarea
        const textareas = document.querySelectorAll('.python-editor textarea, .python-editor #code-editor');
        textareas.forEach(textarea => {
            textarea.addEventListener('keydown', function(e) {
                if (e.key === 'Tab') {
                    e.preventDefault();
                    
                    const start = this.selectionStart;
                    const end = this.selectionEnd;
                    const value = this.value;
                    
                    // Если есть выделенный текст, добавляем таб в начале каждой строки
                    if (start !== end) {
                        const lines = value.substring(start, end).split('\n');
                        const indentedLines = lines.map(line => '\t' + line);
                        const newValue = value.substring(0, start) + indentedLines.join('\n') + value.substring(end);
                        this.value = newValue;
                        
                        // Восстанавливаем выделение
                        this.selectionStart = start;
                        this.selectionEnd = start + newValue.length - value.length;
                    } else {
                        // Если нет выделения, просто вставляем таб
                        const newValue = value.substring(0, start) + '\t' + value.substring(end);
                        this.value = newValue;
                        this.selectionStart = this.selectionEnd = start + 1;
                    }
                }
            });
        });
    },

    runCode(code, outputElement) {
        outputElement.textContent = '';

        Sk.configure({
            output: (text) => {
                outputElement.textContent += text;
            },
            read: (filename) => {
                if (Sk.builtinFiles === undefined || Sk.builtinFiles["files"][filename] === undefined) {
                    throw "Файл не найден: '" + filename + "'";
                }
                return Sk.builtinFiles["files"][filename];
            },
            __future__: Sk.python3
        });

        const myPromise = Sk.misceval.asyncToPromise(() => {
            return Sk.importMainWithBody("<stdin>", false, code, true);
        });

        myPromise.then(
            (mod) => {
                if (outputElement.textContent === '') {
                    outputElement.textContent = 'Программа выполнена успешно!';
                }
            },
            (err) => {
                outputElement.textContent = 'Ошибка: ' + err.toString();
                outputElement.style.color = '#e74c3c';
                setTimeout(() => {
                    outputElement.style.color = '#4ec9b0';
                }, 3000);
            }
        );
    }
};

function initPythonEditor() {
    PythonEditor.init();
}

const QuizManager = {
    init() {
        const quizContainer = document.querySelector('.quiz-container');
        if (!quizContainer) return;

        const questions = Array.from(quizContainer.querySelectorAll('.question'));
        let currentQuestionIndex = 0;
        let correctAnswersCount = 0;

        const progressDiv = document.createElement('div');
        progressDiv.className = 'quiz-progress';
        questions.forEach((_, index) => {
            const dot = document.createElement('div');
            dot.className = 'progress-dot';
            if (index === 0) dot.classList.add('active');
            progressDiv.appendChild(dot);
        });
        quizContainer.insertBefore(progressDiv, quizContainer.querySelector('h3').nextSibling);

        if (questions.length > 0) {
            questions[0].classList.add('active');
        }

        questions.forEach((question, index) => {
            const checkBtn = question.querySelector('.check-answer-btn');
            const options = question.querySelectorAll('input[type="radio"]');
            const feedback = question.querySelector('.feedback');

            let nextBtn = question.querySelector('.next-question-btn');
            if (!nextBtn) {
                nextBtn = document.createElement('button');
                nextBtn.className = 'next-question-btn';
                nextBtn.textContent = index === questions.length - 1 ? 'Показать результаты' : 'Следующий вопрос →';
                checkBtn.parentNode.insertBefore(nextBtn, checkBtn.nextSibling);
            }

            if (checkBtn) {
                checkBtn.addEventListener('click', () => {
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
                            feedback.textContent = '✓ ' + (selectedOption.dataset.explanation || '');
                        }
                        const progressDots = progressDiv.querySelectorAll('.progress-dot');
                        progressDots[index].classList.add('completed');
                    } else {
                        question.classList.remove('correct');
                        question.classList.add('incorrect');
                        if (feedback) {
                            feedback.className = 'feedback incorrect';
                            feedback.textContent = '✗ ' + (selectedOption.dataset.explanation || 'Попробуй еще раз!');
                        }
                    }

                    options.forEach(opt => opt.disabled = true);
                    checkBtn.disabled = true;
                    checkBtn.style.opacity = '0.5';
                    nextBtn.classList.add('show');
                });
            }

            nextBtn.addEventListener('click', () => {
                const progressDots = progressDiv.querySelectorAll('.progress-dot');
                progressDots[index].classList.remove('active');

                if (index < questions.length - 1) {
                    questions[index].classList.remove('active');
                    currentQuestionIndex = index + 1;
                    questions[currentQuestionIndex].classList.add('active');
                    progressDots[currentQuestionIndex].classList.add('active');
                } else {
                    questions[index].classList.remove('active');
                    this.showResults(correctAnswersCount, questions.length, quizContainer);
                }
            });
        });
    },

    showResults(correct, total, quizContainer) {
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
};

function initQuiz() {
    QuizManager.init();
}

const ProgressManager = {
    saveProgress(lessonId) {
        let progress = JSON.parse(localStorage.getItem('pythonLearnProgress') || '{}');
        progress[lessonId] = {
            completed: true,
            timestamp: new Date().toISOString()
        };
        localStorage.setItem('pythonLearnProgress', JSON.stringify(progress));
        this.updateCompletedLessons();
    },

    isLessonCompleted(lessonId) {
        const progress = JSON.parse(localStorage.getItem('pythonLearnProgress') || '{}');
        return progress[lessonId]?.completed || false;
    },

    updateCompletedLessons() {
        const progress = JSON.parse(localStorage.getItem('pythonLearnProgress') || '{}');
        const sidebarLinks = document.querySelectorAll('.sidebar a');

        sidebarLinks.forEach(link => {
            const href = link.getAttribute('href');
            if (!href) return;

            const lessonId = href.split('/').pop().replace('.html', '');
            if (progress[lessonId]?.completed) {
                link.classList.add('completed');
            }
        });
    }
};

function saveProgress(lessonId) {
    ProgressManager.saveProgress(lessonId);
}

function isLessonCompleted(lessonId) {
    return ProgressManager.isLessonCompleted(lessonId);
}

function updateCompletedLessons() {
    ProgressManager.updateCompletedLessons();
}
