#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Финальный генератор всех 85 уроков
Чистая версия с правильным порядком функций
"""

import os
import sys

# Изменяем рабочую директорию
os.chdir('/home/user/pythonlearn')

# === ДАННЫЕ ВСЕХ УРОКОВ ===
# Importing from create_all_lessons.py
exec(open('create_all_lessons.py').read())

# === ГЕНЕРАТОРЫ КОНТЕНТА (определены ДО использования) ===

def generate_algorithm_lesson_content(lesson_id, title):
    """Контент для уроков алгоритмов"""
    topics_map = {
        'algo-02': ('Блок-схемы', 'графическое представление'),
        'algo-03': ('Линейные алгоритмы', 'последовательное выполнение'),
        'algo-04': ('Ветвления', 'условные операторы'),
        'algo-05': ('Циклы', 'повторение действий'),
        'algo-06': ('Поиск', 'алгоритмы поиска'),
        'algo-07': ('Простые сортировки', 'базовая сортировка'),
        'algo-08': ('Быстрые сортировки', 'эффективная сортировка'),
        'algo-09': ('Последовательности', 'обработка данных'),
        'algo-10': ('Числа', 'числовые алгоритмы'),
        'algo-11': ('Строки', 'текстовые алгоритмы'),
        'algo-12': ('ДП основы', 'динамическое программирование'),
        'algo-13': ('ДП продвинутое', 'сложное ДП'),
        'algo-14': ('Жадные алгоритмы', 'жадные стратегии'),
        'algo-15': ('Перебор', 'комбинаторика'),
    }

    topic_name, topic_desc = topics_map.get(lesson_id, ('Алгоритмы', 'решение задач'))

    return f'''<h2>Введение</h2>
                <p>В этом уроке мы изучим <strong>{topic_desc}</strong>. Это важная тема для программирования и подготовки к ОГЭ/ЕГЭ.</p>

                <h2>Что такое {topic_name}?</h2>
                <p><strong>{topic_name}</strong> - фундаментальная концепция в информатике.</p>

                <div class="diagram">
                    <svg class="diagram-svg" width="100%" height="300" viewBox="0 0 400 300" style="max-width: 400px;">
                        <defs>
                            <marker id="arrowhead" markerWidth="10" markerHeight="10" refX="9" refY="3" orient="auto">
                                <polygon points="0,0 0,6 9,3" fill="#1e293b"/>
                            </marker>
                        </defs>
                        <ellipse cx="200" cy="40" rx="70" ry="25" fill="#dbeafe" stroke="#6366f1" stroke-width="2"/>
                        <text x="200" y="48" text-anchor="middle" font-size="13" font-weight="bold" fill="#1e293b">НАЧАЛО</text>
                        <path d="M 200 65 L 200 95" stroke="#1e293b" stroke-width="2" marker-end="url(#arrowhead)"/>
                        <rect x="130" y="95" width="140" height="50" fill="#d1fae5" stroke="#10b981" stroke-width="2" rx="5"/>
                        <text x="200" y="125" text-anchor="middle" font-size="12" fill="#1e293b">Обработка</text>
                        <path d="M 200 145 L 200 175" stroke="#1e293b" stroke-width="2" marker-end="url(#arrowhead)"/>
                        <ellipse cx="200" cy="205" rx="70" ry="25" fill="#dbeafe" stroke="#6366f1" stroke-width="2"/>
                        <text x="200" y="213" text-anchor="middle" font-size="13" font-weight="bold" fill="#1e293b">КОНЕЦ</text>
                    </svg>
                </div>

                <h2>Основные понятия</h2>
                <ul>
                    <li>Принципы работы алгоритма</li>
                    <li>Применение на практике</li>
                    <li>Типовые задачи</li>
                </ul>

                <div class="quiz-container">
                    <h3>Тест к уроку</h3>
                    <div class="question">
                        <h4>Вопрос 1: Для чего нужны алгоритмы?</h4>
                        <ul class="options">
                            <li><label><input type="radio" name="q1" data-correct="true" data-explanation="Верно!">Для решения задач</label></li>
                            <li><label><input type="radio" name="q1" data-correct="false">Для украшения</label></li>
                        </ul>
                        <button class="check-answer-btn">Проверить</button>
                        <div class="feedback"></div>
                    </div>
                    <button class="btn-secondary" id="show-results">Показать результаты</button>
                    <div class="quiz-results"></div>
                </div>'''

def generate_python_lesson_content(lesson_id, title):
    """Контент для уроков Python"""
    python_code_examples = {
        'python-03': 'x = 5\nprint(type(x))',
        'python-04': 'print(10 + 5)\nprint(10 ** 2)',
        'python-05': 'name = input("Имя: ")\nprint("Привет,", name)',
        'python-06': 'x = 10\nif x > 5:\n    print("Больше 5")',
        'python-07': 'if x > 0 and x < 10:\n    print("OK")',
        'python-08': 'i = 0\nwhile i < 5:\n    print(i)\n    i += 1',
        'python-09': 'for i in range(5):\n    print(i)',
        'python-10': 'text = "Hello"\nprint(text.upper())',
    }

    code_example = python_code_examples.get(lesson_id, 'print("Hello, World!")')

    return f'''<h2>Введение</h2>
                <p>В этом уроке изучим важную тему Python для программирования и экзаменов.</p>

                <h2>Основные концепции</h2>
                <p>Разберём ключевые операторы и функции.</p>

                <div class="code-block">
                    <pre>{code_example}</pre>
                </div>

                <h2>Попробуй сам!</h2>
                <div class="python-editor">
                    <div class="editor-header">
                        <h3>Python редактор</h3>
                        <div class="editor-controls">
                            <button class="run-btn">▶ Запустить</button>
                            <button class="clear-btn">✕ Очистить</button>
                        </div>
                    </div>
                    <textarea id="code-editor" spellcheck="false">{code_example}</textarea>
                    <div class="output-container">
                        <h4>Результат:</h4>
                        <div id="output"></div>
                    </div>
                </div>

                <div class="quiz-container">
                    <h3>Тест к уроку</h3>
                    <div class="question">
                        <h4>Вопрос 1: Как работает эта функция?</h4>
                        <ul class="options">
                            <li><label><input type="radio" name="q1" data-correct="true" data-explanation="Верно!">Правильно</label></li>
                            <li><label><input type="radio" name="q1" data-correct="false">Неправильно</label></li>
                        </ul>
                        <button class="check-answer-btn">Проверить</button>
                        <div class="feedback"></div>
                    </div>
                    <button class="btn-secondary" id="show-results">Показать результаты</button>
                    <div class="quiz-results"></div>
                </div>'''

def generate_oge_lesson_content():
    """Контент для уроков ОГЭ"""
    return '''<h2>Подготовка к ОГЭ</h2>
                <p>Разбор типовых задач ОГЭ по информатике.</p>

                <h2>Типовые задачи</h2>
                <ul>
                    <li>Анализ алгоритмов</li>
                    <li>Программирование</li>
                    <li>Работа с данными</li>
                </ul>

                <div class="python-editor">
                    <div class="editor-header">
                        <h3>Решение задачи</h3>
                        <div class="editor-controls">
                            <button class="run-btn">▶ Запустить</button>
                            <button class="clear-btn">✕ Очистить</button>
                        </div>
                    </div>
                    <textarea id="code-editor" spellcheck="false"># Напиши решение здесь</textarea>
                    <div class="output-container">
                        <h4>Результат:</h4>
                        <div id="output"></div>
                    </div>
                </div>

                <div class="quiz-container">
                    <h3>Тест к уроку</h3>
                    <div class="question">
                        <h4>Вопрос 1: Максимум баллов за ОГЭ?</h4>
                        <ul class="options">
                            <li><label><input type="radio" name="q1" data-correct="true" data-explanation="Правильно! 19 баллов.">19</label></li>
                            <li><label><input type="radio" name="q1" data-correct="false">10</label></li>
                        </ul>
                        <button class="check-answer-btn">Проверить</button>
                        <div class="feedback"></div>
                    </div>
                    <button class="btn-secondary" id="show-results">Показать результаты</button>
                    <div class="quiz-results"></div>
                </div>'''

def generate_ege_lesson_content():
    """Контент для уроков ЕГЭ"""
    return '''<h2>Подготовка к ЕГЭ</h2>
                <p>Сложные задачи ЕГЭ по информатике.</p>

                <h2>Типы заданий</h2>
                <ul>
                    <li>Базовые (1-12)</li>
                    <li>Средние (13-21)</li>
                    <li>Высокие (22-27)</li>
                </ul>

                <div class="python-editor">
                    <div class="editor-header">
                        <h3>Решение</h3>
                        <div class="editor-controls">
                            <button class="run-btn">▶ Запустить</button>
                            <button class="clear-btn">✕ Очистить</button>
                        </div>
                    </div>
                    <textarea id="code-editor" spellcheck="false"># Оптимальное решение</textarea>
                    <div class="output-container">
                        <h4>Результат:</h4>
                        <div id="output"></div>
                    </div>
                </div>

                <div class="quiz-container">
                    <h3>Тест к уроку</h3>
                    <div class="question">
                        <h4>Вопрос 1: Сколько заданий в ЕГЭ?</h4>
                        <ul class="options">
                            <li><label><input type="radio" name="q1" data-correct="true" data-explanation="Верно! 27 заданий.">27</label></li>
                            <li><label><input type="radio" name="q1" data-correct="false">20</label></li>
                        </ul>
                        <button class="check-answer-btn">Проверить</button>
                        <div class="feedback"></div>
                    </div>
                    <button class="btn-secondary" id="show-results">Показать результаты</button>
                    <div class="quiz-results"></div>
                </div>'''

# === ГЛАВНАЯ ФУНКЦИЯ ГЕНЕРАЦИИ ===

def create_all_lessons():
    """Создаёт все 85 уроков"""
    os.makedirs('lessons', exist_ok=True)

    created = 0
    updated = 0

    for lesson_id, data in LESSONS_DATA.items():
        filepath = f"lessons/{lesson_id}.html"

        # Определяем тип урока
        lesson_type = data['type']

        # Генерируем контент
        if lesson_id.startswith('algo'):
            content = generate_algorithm_lesson_content(lesson_id, data['title'])
        elif lesson_id.startswith('python'):
            content = generate_python_lesson_content(lesson_id, data['title'])
        elif lesson_id.startswith('oge'):
            content = generate_oge_lesson_content()
        elif lesson_id.startswith('ege'):
            content = generate_ege_lesson_content()
        else:
            content = generate_python_lesson_content(lesson_id, data['title'])

        # Создаём HTML
        include_skulpt = lesson_type in ['python', 'oge', 'ege']

        html = create_lesson_html(
            lesson_id=lesson_id,
            title=data['title'],
            module=data['module'],
            duration=data['duration'],
            content_html=content,
            prev_lesson=data['prev'],
            next_lesson=data['next'],
            include_skulpt=include_skulpt
        )

        # Записываем
        with open(filepath, 'w', encoding='utf-8') as f:
            f.write(html)

        created += 1
        if created % 10 == 0:
            print(f"Создано: {created}/85")

    return created

# === ЗАПУСК ===

if __name__ == "__main__":
    print("="*60)
    print("ГЕНЕРАТОР ВСЕХ 85 УРОКОВ")
    print("="*60)
    print()

    total = create_all_lessons()

    print()
    print("="*60)
    print(f"✓ ГОТОВО! Создано {total} уроков")
    print("="*60)
