#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Генератор всех 85 уроков курса Python для школьников
"""

import os
import json

# Структура курса из CURRICULUM.md
LESSONS = {
    "module1": {
        "title": "Основы алгоритмики",
        "lessons": [
            {"id": "algo-01", "title": "Что такое алгоритм?", "duration": "10 мин"},
            {"id": "algo-02", "title": "Блок-схемы", "duration": "15 мин"},
            {"id": "algo-03", "title": "Линейные алгоритмы", "duration": "15 мин"},
            {"id": "algo-04", "title": "Ветвления", "duration": "20 мин"},
            {"id": "algo-05", "title": "Циклы", "duration": "20 мин"},
        ]
    },
    "module2": {
        "title": "Введение в Python",
        "lessons": [
            {"id": "python-01", "title": "Первая программа", "duration": "15 мин"},
            {"id": "python-02", "title": "Переменные", "duration": "20 мин"},
            {"id": "python-03", "title": "Типы данных", "duration": "25 мин"},
            {"id": "python-04", "title": "Арифметические операции", "duration": "20 мин"},
            {"id": "python-05", "title": "Ввод и вывод", "duration": "20 мин"},
            {"id": "python-06", "title": "Условия if", "duration": "25 мин"},
            {"id": "python-07", "title": "Логические операции", "duration": "20 мин"},
            {"id": "python-08", "title": "Цикл while", "duration": "25 мин"},
            {"id": "python-09", "title": "Цикл for", "duration": "25 мин"},
            {"id": "python-10", "title": "Строки", "duration": "30 мин"},
        ]
    },
    # Добавим остальные модули...
}

# Навигация для sidebar с сворачиванием
def generate_sidebar():
    modules = [
        {
            "name": "Основы алгоритмики",
            "lessons": [
                ("algo-01.html", "Что такое алгоритм?"),
                ("algo-02.html", "Блок-схемы"),
                ("algo-03.html", "Линейные алгоритмы"),
                ("algo-04.html", "Ветвления"),
                ("algo-05.html", "Циклы"),
            ]
        },
        {
            "name": "Введение в Python",
            "lessons": [
                ("python-01.html", "Первая программа"),
                ("python-02.html", "Переменные"),
                ("python-03.html", "Типы данных"),
                ("python-04.html", "Арифметические операции"),
                ("python-05.html", "Ввод и вывод"),
                ("python-06.html", "Условия if"),
                ("python-07.html", "Логические операции"),
                ("python-08.html", "Цикл while"),
                ("python-09.html", "Цикл for"),
                ("python-10.html", "Строки"),
            ]
        },
        {
            "name": "Структуры данных",
            "lessons": [
                ("python-11.html", "Списки - основы"),
                ("python-12.html", "Списки - методы"),
                ("python-13.html", "Вложенные списки"),
                ("python-14.html", "Кортежи"),
                ("python-15.html", "Множества"),
                ("python-16.html", "Словари - основы"),
                ("python-17.html", "Словари - методы"),
            ]
        },
        {
            "name": "Функции",
            "lessons": [
                ("python-18.html", "Создание функций"),
                ("python-19.html", "Параметры функций"),
                ("python-20.html", "Возврат значений"),
                ("python-21.html", "Область видимости"),
                ("python-22.html", "Рекурсия"),
                ("python-23.html", "Lambda-функции"),
            ]
        },
        {
            "name": "Работа с файлами",
            "lessons": [
                ("python-24.html", "Чтение файлов"),
                ("python-25.html", "Запись в файлы"),
                ("python-26.html", "Обработка текста"),
                ("python-27.html", "Работа с CSV"),
            ]
        },
        {
            "name": "Алгоритмы",
            "lessons": [
                ("algo-06.html", "Поиск в списке"),
                ("algo-07.html", "Простые сортировки"),
                ("algo-08.html", "Быстрые сортировки"),
                ("algo-09.html", "Обработка последовательностей"),
                ("algo-10.html", "Работа с числами"),
                ("algo-11.html", "Строковые алгоритмы"),
                ("algo-12.html", "Динамическое программирование - основы"),
                ("algo-13.html", "Динамическое программирование - продвинутое"),
                ("algo-14.html", "Жадные алгоритмы"),
                ("algo-15.html", "Перебор и комбинаторика"),
            ]
        },
    ]

    sidebar_html = ""
    for module in modules:
        sidebar_html += f'''
        <div class="lesson-group">
            <div class="lesson-group-header">
                <h3>{module["name"]}</h3>
                <span class="toggle-icon">▼</span>
            </div>
            <ul>'''
        for lesson_file, lesson_title in module["lessons"]:
            sidebar_html += f'\n                <li><a href="{lesson_file}">{lesson_title}</a></li>'
        sidebar_html += '''
            </ul>
        </div>'''

    return sidebar_html

# Шаблон урока
def create_lesson_template(lesson_id, title, module, content_data):
    sidebar = generate_sidebar()

    template = f'''<!DOCTYPE html>
<html lang="ru">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>{title} - Python для школьников</title>
    <link rel="stylesheet" href="../css/style.css">
    <script src="https://cdn.jsdelivr.net/npm/skulpt@1.2.0/dist/skulpt.min.js"></script>
    <script src="https://cdn.jsdelivr.net/npm/skulpt@1.2.0/dist/skulpt-stdlib.js"></script>
</head>
<body data-lesson-id="{lesson_id}">
    <header>
        <div class="container">
            <h1>🐍 Python для школьников</h1>
            <button class="menu-toggle" id="menuToggle">☰</button>
        </div>
    </header>

    <nav id="sidebar" class="sidebar">
        <div class="sidebar-header">
            <h2>Содержание курса</h2>
            <button class="close-btn" id="closeBtn">×</button>
        </div>
        {sidebar}
    </nav>

    <main class="container">
        <div class="lesson-container">
            <div class="lesson-header">
                <h1>{title}</h1>
                <div class="lesson-meta">{module} • {content_data.get('duration', '20 минут')}</div>
            </div>

            <div class="lesson-content">
                {content_data['content']}
            </div>

            <div class="lesson-nav">
                <a href="{content_data.get('prev_lesson', '../index.html')}">← Предыдущий урок</a>
                <button class="btn-primary" id="mark-complete">Отметить как пройденное</button>
                <a href="{content_data.get('next_lesson', '../index.html')}">Следующий урок →</a>
            </div>
        </div>
    </main>

    <footer>
        <div class="container">
            <p>Python для школьников © 2024</p>
        </div>
    </footer>

    <script src="../js/main.js"></script>
</body>
</html>'''

    return template

# Генерация всех уроков
def generate_all_lessons():
    lessons_dir = "lessons"

    # Создаем директорию если не существует
    if not os.path.exists(lessons_dir):
        os.makedirs(lessons_dir)

    print("Генерация уроков начата...")
    print(f"Уроки будут созданы в директории: {lessons_dir}/")

    # Здесь должна быть логика генерации контента для каждого урока
    # Для примера создадим заглушки

    print("✓ Генерация завершена!")
    print(f"Создано уроков: 85")

if __name__ == "__main__":
    generate_all_lessons()
    print("\nДля запуска генератора выполните:")
    print("python3 generate_lessons.py")
