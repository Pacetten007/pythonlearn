#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Генератор всех 85 уроков курса Python для школьников
Создает полноценные HTML файлы с образовательным контентом, тестами и практическими заданиями
"""

import os

# Полная структура навигации для sidebar
def generate_complete_sidebar():
    return '''
        <div class="lesson-group">
            <div class="lesson-group-header">
                <h3>Основы алгоритмики</h3>
                <span class="toggle-icon">▼</span>
            </div>
            <ul>
                <li><a href="algo-01.html">Что такое алгоритм?</a></li>
                <li><a href="algo-02.html">Блок-схемы</a></li>
                <li><a href="algo-03.html">Линейные алгоритмы</a></li>
                <li><a href="algo-04.html">Ветвления</a></li>
                <li><a href="algo-05.html">Циклы</a></li>
            </ul>
        </div>

        <div class="lesson-group">
            <div class="lesson-group-header">
                <h3>Введение в Python</h3>
                <span class="toggle-icon">▼</span>
            </div>
            <ul>
                <li><a href="python-01.html">Первая программа</a></li>
                <li><a href="python-02.html">Переменные</a></li>
                <li><a href="python-03.html">Типы данных</a></li>
                <li><a href="python-04.html">Арифметические операции</a></li>
                <li><a href="python-05.html">Ввод и вывод</a></li>
                <li><a href="python-06.html">Условия if</a></li>
                <li><a href="python-07.html">Логические операции</a></li>
                <li><a href="python-08.html">Цикл while</a></li>
                <li><a href="python-09.html">Цикл for</a></li>
                <li><a href="python-10.html">Строки</a></li>
            </ul>
        </div>

        <div class="lesson-group">
            <div class="lesson-group-header">
                <h3>Структуры данных</h3>
                <span class="toggle-icon">▼</span>
            </div>
            <ul>
                <li><a href="python-11.html">Списки - основы</a></li>
                <li><a href="python-12.html">Списки - методы</a></li>
                <li><a href="python-13.html">Вложенные списки</a></li>
                <li><a href="python-14.html">Кортежи</a></li>
                <li><a href="python-15.html">Множества</a></li>
                <li><a href="python-16.html">Словари - основы</a></li>
                <li><a href="python-17.html">Словари - методы</a></li>
            </ul>
        </div>

        <div class="lesson-group">
            <div class="lesson-group-header">
                <h3>Функции</h3>
                <span class="toggle-icon">▼</span>
            </div>
            <ul>
                <li><a href="python-18.html">Создание функций</a></li>
                <li><a href="python-19.html">Параметры функций</a></li>
                <li><a href="python-20.html">Возврат значений</a></li>
                <li><a href="python-21.html">Область видимости</a></li>
                <li><a href="python-22.html">Рекурсия</a></li>
                <li><a href="python-23.html">Lambda-функции</a></li>
            </ul>
        </div>

        <div class="lesson-group">
            <div class="lesson-group-header">
                <h3>Работа с файлами</h3>
                <span class="toggle-icon">▼</span>
            </div>
            <ul>
                <li><a href="python-24.html">Чтение файлов</a></li>
                <li><a href="python-25.html">Запись в файлы</a></li>
                <li><a href="python-26.html">Обработка текста</a></li>
                <li><a href="python-27.html">Работа с CSV</a></li>
            </ul>
        </div>

        <div class="lesson-group">
            <div class="lesson-group-header">
                <h3>Алгоритмы</h3>
                <span class="toggle-icon">▼</span>
            </div>
            <ul>
                <li><a href="algo-06.html">Поиск в списке</a></li>
                <li><a href="algo-07.html">Простые сортировки</a></li>
                <li><a href="algo-08.html">Быстрые сортировки</a></li>
                <li><a href="algo-09.html">Обработка последовательностей</a></li>
                <li><a href="algo-10.html">Работа с числами</a></li>
                <li><a href="algo-11.html">Строковые алгоритмы</a></li>
                <li><a href="algo-12.html">ДП - основы</a></li>
                <li><a href="algo-13.html">ДП - продвинутое</a></li>
                <li><a href="algo-14.html">Жадные алгоритмы</a></li>
                <li><a href="algo-15.html">Перебор и комбинаторика</a></li>
            </ul>
        </div>

        <div class="lesson-group">
            <div class="lesson-group-header">
                <h3>Системы счисления</h3>
                <span class="toggle-icon">▼</span>
            </div>
            <ul>
                <li><a href="python-28.html">Двоичная система</a></li>
                <li><a href="python-29.html">8-я и 16-я системы</a></li>
                <li><a href="python-30.html">Арифметика в СС</a></li>
                <li><a href="python-31.html">СС в Python</a></li>
                <li><a href="python-32.html">Задачи ЕГЭ по СС</a></li>
            </ul>
        </div>

        <div class="lesson-group">
            <div class="lesson-group-header">
                <h3>Логика</h3>
                <span class="toggle-icon">▼</span>
            </div>
            <ul>
                <li><a href="python-33.html">Логические операции</a></li>
                <li><a href="python-34.html">Логические выражения</a></li>
                <li><a href="python-35.html">Логика в Python</a></li>
                <li><a href="python-36.html">Логические функции</a></li>
                <li><a href="python-37.html">Задачи ЕГЭ по логике</a></li>
            </ul>
        </div>

        <div class="lesson-group">
            <div class="lesson-group-header">
                <h3>Графы и деревья</h3>
                <span class="toggle-icon">▼</span>
            </div>
            <ul>
                <li><a href="python-38.html">Введение в графы</a></li>
                <li><a href="python-39.html">Обход в ширину (BFS)</a></li>
                <li><a href="python-40.html">Обход в глубину (DFS)</a></li>
                <li><a href="python-41.html">Деревья</a></li>
                <li><a href="python-42.html">Алгоритмы на графах</a></li>
                <li><a href="python-43.html">Задачи ЕГЭ с графами</a></li>
            </ul>
        </div>

        <div class="lesson-group">
            <div class="lesson-group-header">
                <h3>Подготовка к ОГЭ</h3>
                <span class="toggle-icon">▼</span>
            </div>
            <ul>
                <li><a href="oge-01.html">Исполнители алгоритмов</a></li>
                <li><a href="oge-02.html">Анализ программ</a></li>
                <li><a href="oge-03.html">Простые задачи</a></li>
                <li><a href="oge-04.html">Массивы</a></li>
                <li><a href="oge-05.html">Строки</a></li>
                <li><a href="oge-06.html">Файлы</a></li>
                <li><a href="oge-07.html">Электронные таблицы</a></li>
                <li><a href="oge-08.html">Пробный экзамен</a></li>
            </ul>
        </div>

        <div class="lesson-group">
            <div class="lesson-group-header">
                <h3>Подготовка к ЕГЭ</h3>
                <span class="toggle-icon">▼</span>
            </div>
            <ul>
                <li><a href="ege-01.html">Кодирование информации</a></li>
                <li><a href="ege-02.html">Логика и множества</a></li>
                <li><a href="ege-03.html">Системы счисления</a></li>
                <li><a href="ege-04.html">Алгоритмы</a></li>
                <li><a href="ege-05.html">Программирование простое</a></li>
                <li><a href="ege-06.html">Программирование среднее</a></li>
                <li><a href="ege-07.html">Программирование сложное</a></li>
                <li><a href="ege-08.html">Теория игр</a></li>
                <li><a href="ege-09.html">Рекурсия</a></li>
                <li><a href="ege-10.html">Динамическое программирование</a></li>
                <li><a href="ege-11.html">Обработка больших данных</a></li>
                <li><a href="ege-12.html">Пробный экзамен</a></li>
            </ul>
        </div>

        <div class="lesson-group">
            <div class="lesson-group-header">
                <h3>Продвинутые темы</h3>
                <span class="toggle-icon">▼</span>
            </div>
            <ul>
                <li><a href="advanced-01.html">ООП - Классы и объекты</a></li>
                <li><a href="advanced-02.html">ООП - Наследование</a></li>
                <li><a href="advanced-03.html">Обработка исключений</a></li>
                <li><a href="advanced-04.html">Работа с модулями</a></li>
                <li><a href="advanced-05.html">Регулярные выражения</a></li>
                <li><a href="advanced-06.html">Сложность алгоритмов</a></li>
                <li><a href="advanced-07.html">Олимпиадные задачи</a></li>
            </ul>
        </div>'''

# SVG маркер для стрелок в блок-схемах
def get_svg_arrow_marker():
    return '''<marker id="arrowhead" markerWidth="10" markerHeight="10" refX="9" refY="3" orient="auto">
                                <polygon points="0,0 0,6 9,3" fill="#1e293b"/>
                            </marker>'''

# Базовый шаблон HTML
def create_lesson_html(lesson_id, title, module, duration, content_html, prev_lesson, next_lesson, include_skulpt=False):
    sidebar = generate_complete_sidebar()

    skulpt_script = ''
    if include_skulpt:
        skulpt_script = '''<script src="https://cdn.jsdelivr.net/npm/skulpt@1.2.0/dist/skulpt.min.js"></script>
    <script src="https://cdn.jsdelivr.net/npm/skulpt@1.2.0/dist/skulpt-stdlib.js"></script>'''

    return f'''<!DOCTYPE html>
<html lang="ru">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>{title} - Python для школьников</title>
    <link rel="stylesheet" href="../css/style.css">{skulpt_script}
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
                <div class="lesson-meta">{module} • {duration}</div>
            </div>

            <div class="lesson-content">
{content_html}
            </div>

            <div class="lesson-nav">
                <a href="{prev_lesson}">← Предыдущий урок</a>
                <button class="btn-primary" id="mark-complete">Отметить как пройденное</button>
                <a href="{next_lesson}">Следующий урок →</a>
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

# Данные всех 85 уроков
LESSONS_DATA = {
    # Модуль 1: Основы алгоритмики (algo-01 to algo-05)
    "algo-01": {
        "title": "Урок 1: Что такое алгоритм?",
        "module": "Основы алгоритмики",
        "duration": "10 минут",
        "prev": "../index.html",
        "next": "algo-02.html",
        "type": "algorithm"
    },
    "algo-02": {
        "title": "Урок 2: Блок-схемы",
        "module": "Основы алгоритмики",
        "duration": "15 минут",
        "prev": "algo-01.html",
        "next": "algo-03.html",
        "type": "algorithm"
    },
    "algo-03": {
        "title": "Урок 3: Линейные алгоритмы",
        "module": "Основы алгоритмики",
        "duration": "15 минут",
        "prev": "algo-02.html",
        "next": "algo-04.html",
        "type": "algorithm"
    },
    "algo-04": {
        "title": "Урок 4: Алгоритмы с ветвлениями",
        "module": "Основы алгоритмики",
        "duration": "20 минут",
        "prev": "algo-03.html",
        "next": "algo-05.html",
        "type": "algorithm"
    },
    "algo-05": {
        "title": "Урок 5: Циклические алгоритмы",
        "module": "Основы алгоритмики",
        "duration": "20 минут",
        "prev": "algo-04.html",
        "next": "python-01.html",
        "type": "algorithm"
    },

    # Модуль 2: Введение в Python (python-01 to python-10)
    "python-01": {
        "title": "Урок 6: Первая программа на Python",
        "module": "Введение в Python",
        "duration": "15 минут",
        "prev": "algo-05.html",
        "next": "python-02.html",
        "type": "python"
    },
    "python-02": {
        "title": "Урок 7: Переменные",
        "module": "Введение в Python",
        "duration": "20 минут",
        "prev": "python-01.html",
        "next": "python-03.html",
        "type": "python"
    },
    "python-03": {
        "title": "Урок 8: Типы данных",
        "module": "Введение в Python",
        "duration": "25 минут",
        "prev": "python-02.html",
        "next": "python-04.html",
        "type": "python"
    },
    "python-04": {
        "title": "Урок 9: Арифметические операции",
        "module": "Введение в Python",
        "duration": "20 минут",
        "prev": "python-03.html",
        "next": "python-05.html",
        "type": "python"
    },
    "python-05": {
        "title": "Урок 10: Ввод и вывод данных",
        "module": "Введение в Python",
        "duration": "20 минут",
        "prev": "python-04.html",
        "next": "python-06.html",
        "type": "python"
    },
    "python-06": {
        "title": "Урок 11: Условный оператор if",
        "module": "Введение в Python",
        "duration": "25 минут",
        "prev": "python-05.html",
        "next": "python-07.html",
        "type": "python"
    },
    "python-07": {
        "title": "Урок 12: Логические операции",
        "module": "Введение в Python",
        "duration": "20 минут",
        "prev": "python-06.html",
        "next": "python-08.html",
        "type": "python"
    },
    "python-08": {
        "title": "Урок 13: Цикл while",
        "module": "Введение в Python",
        "duration": "25 минут",
        "prev": "python-07.html",
        "next": "python-09.html",
        "type": "python"
    },
    "python-09": {
        "title": "Урок 14: Цикл for",
        "module": "Введение в Python",
        "duration": "25 минут",
        "prev": "python-08.html",
        "next": "python-10.html",
        "type": "python"
    },
    "python-10": {
        "title": "Урок 15: Строки",
        "module": "Введение в Python",
        "duration": "30 минут",
        "prev": "python-09.html",
        "next": "python-11.html",
        "type": "python"
    },

    # Модуль 3: Структуры данных (python-11 to python-17)
    "python-11": {
        "title": "Урок 16: Списки - Основы",
        "module": "Структуры данных",
        "duration": "25 минут",
        "prev": "python-10.html",
        "next": "python-12.html",
        "type": "python"
    },
    "python-12": {
        "title": "Урок 17: Списки - Методы",
        "module": "Структуры данных",
        "duration": "25 минут",
        "prev": "python-11.html",
        "next": "python-13.html",
        "type": "python"
    },
    "python-13": {
        "title": "Урок 18: Вложенные списки (матрицы)",
        "module": "Структуры данных",
        "duration": "30 минут",
        "prev": "python-12.html",
        "next": "python-14.html",
        "type": "python"
    },
    "python-14": {
        "title": "Урок 19: Кортежи (tuple)",
        "module": "Структуры данных",
        "duration": "20 минут",
        "prev": "python-13.html",
        "next": "python-15.html",
        "type": "python"
    },
    "python-15": {
        "title": "Урок 20: Множества (set)",
        "module": "Структуры данных",
        "duration": "25 минут",
        "prev": "python-14.html",
        "next": "python-16.html",
        "type": "python"
    },
    "python-16": {
        "title": "Урок 21: Словари (dict) - Основы",
        "module": "Структуры данных",
        "duration": "25 минут",
        "prev": "python-15.html",
        "next": "python-17.html",
        "type": "python"
    },
    "python-17": {
        "title": "Урок 22: Словари (dict) - Методы",
        "module": "Структуры данных",
        "duration": "25 минут",
        "prev": "python-16.html",
        "next": "python-18.html",
        "type": "python"
    },

    # Модуль 4: Функции (python-18 to python-23)
    "python-18": {
        "title": "Урок 23: Создание функций",
        "module": "Функции",
        "duration": "25 минут",
        "prev": "python-17.html",
        "next": "python-19.html",
        "type": "python"
    },
    "python-19": {
        "title": "Урок 24: Параметры функций",
        "module": "Функции",
        "duration": "25 минут",
        "prev": "python-18.html",
        "next": "python-20.html",
        "type": "python"
    },
    "python-20": {
        "title": "Урок 25: Возврат значений",
        "module": "Функции",
        "duration": "20 минут",
        "prev": "python-19.html",
        "next": "python-21.html",
        "type": "python"
    },
    "python-21": {
        "title": "Урок 26: Область видимости",
        "module": "Функции",
        "duration": "25 минут",
        "prev": "python-20.html",
        "next": "python-22.html",
        "type": "python"
    },
    "python-22": {
        "title": "Урок 27: Рекурсия",
        "module": "Функции",
        "duration": "30 минут",
        "prev": "python-21.html",
        "next": "python-23.html",
        "type": "python"
    },
    "python-23": {
        "title": "Урок 28: Lambda-функции",
        "module": "Функции",
        "duration": "20 минут",
        "prev": "python-22.html",
        "next": "python-24.html",
        "type": "python"
    },

    # Модуль 5: Работа с файлами (python-24 to python-27)
    "python-24": {
        "title": "Урок 29: Чтение файлов",
        "module": "Работа с файлами",
        "duration": "25 минут",
        "prev": "python-23.html",
        "next": "python-25.html",
        "type": "python"
    },
    "python-25": {
        "title": "Урок 30: Запись в файлы",
        "module": "Работа с файлами",
        "duration": "20 минут",
        "prev": "python-24.html",
        "next": "python-26.html",
        "type": "python"
    },
    "python-26": {
        "title": "Урок 31: Обработка текстовых файлов",
        "module": "Работа с файлами",
        "duration": "25 минут",
        "prev": "python-25.html",
        "next": "python-27.html",
        "type": "python"
    },
    "python-27": {
        "title": "Урок 32: Работа с CSV",
        "module": "Работа с файлами",
        "duration": "25 минут",
        "prev": "python-26.html",
        "next": "algo-06.html",
        "type": "python"
    },

    # Модуль 6: Алгоритмы (algo-06 to algo-15)
    "algo-06": {
        "title": "Урок 33: Поиск в списке",
        "module": "Алгоритмы",
        "duration": "25 минут",
        "prev": "python-27.html",
        "next": "algo-07.html",
        "type": "algorithm"
    },
    "algo-07": {
        "title": "Урок 34: Сортировка - Простые методы",
        "module": "Алгоритмы",
        "duration": "30 минут",
        "prev": "algo-06.html",
        "next": "algo-08.html",
        "type": "algorithm"
    },
    "algo-08": {
        "title": "Урок 35: Сортировка - Быстрые методы",
        "module": "Алгоритмы",
        "duration": "30 минут",
        "prev": "algo-07.html",
        "next": "algo-09.html",
        "type": "algorithm"
    },
    "algo-09": {
        "title": "Урок 36: Обработка последовательностей",
        "module": "Алгоритмы",
        "duration": "25 минут",
        "prev": "algo-08.html",
        "next": "algo-10.html",
        "type": "algorithm"
    },
    "algo-10": {
        "title": "Урок 37: Работа с числами",
        "module": "Алгоритмы",
        "duration": "25 минут",
        "prev": "algo-09.html",
        "next": "algo-11.html",
        "type": "algorithm"
    },
    "algo-11": {
        "title": "Урок 38: Строковые алгоритмы",
        "module": "Алгоритмы",
        "duration": "25 минут",
        "prev": "algo-10.html",
        "next": "algo-12.html",
        "type": "algorithm"
    },
    "algo-12": {
        "title": "Урок 39: Динамическое программирование - Основы",
        "module": "Алгоритмы",
        "duration": "30 минут",
        "prev": "algo-11.html",
        "next": "algo-13.html",
        "type": "algorithm"
    },
    "algo-13": {
        "title": "Урок 40: Динамическое программирование - Продвинутое",
        "module": "Алгоритмы",
        "duration": "30 минут",
        "prev": "algo-12.html",
        "next": "algo-14.html",
        "type": "algorithm"
    },
    "algo-14": {
        "title": "Урок 41: Жадные алгоритмы",
        "module": "Алгоритмы",
        "duration": "25 минут",
        "prev": "algo-13.html",
        "next": "algo-15.html",
        "type": "algorithm"
    },
    "algo-15": {
        "title": "Урок 42: Перебор и комбинаторика",
        "module": "Алгоритмы",
        "duration": "30 минут",
        "prev": "algo-14.html",
        "next": "python-28.html",
        "type": "algorithm"
    },

    # Модуль 7: Системы счисления (python-28 to python-32)
    "python-28": {
        "title": "Урок 43: Двоичная система",
        "module": "Системы счисления",
        "duration": "25 минут",
        "prev": "algo-15.html",
        "next": "python-29.html",
        "type": "python"
    },
    "python-29": {
        "title": "Урок 44: Восьмеричная и шестнадцатеричная системы",
        "module": "Системы счисления",
        "duration": "25 минут",
        "prev": "python-28.html",
        "next": "python-30.html",
        "type": "python"
    },
    "python-30": {
        "title": "Урок 45: Арифметика в различных системах",
        "module": "Системы счисления",
        "duration": "25 минут",
        "prev": "python-29.html",
        "next": "python-31.html",
        "type": "python"
    },
    "python-31": {
        "title": "Урок 46: Системы счисления в Python",
        "module": "Системы счисления",
        "duration": "20 минут",
        "prev": "python-30.html",
        "next": "python-32.html",
        "type": "python"
    },
    "python-32": {
        "title": "Урок 47: Задачи ЕГЭ по системам счисления",
        "module": "Системы счисления",
        "duration": "30 минут",
        "prev": "python-31.html",
        "next": "python-33.html",
        "type": "python"
    },

    # Модуль 8: Логика (python-33 to python-37)
    "python-33": {
        "title": "Урок 48: Логические операции",
        "module": "Логика",
        "duration": "25 минут",
        "prev": "python-32.html",
        "next": "python-34.html",
        "type": "python"
    },
    "python-34": {
        "title": "Урок 49: Логические выражения",
        "module": "Логика",
        "duration": "25 минут",
        "prev": "python-33.html",
        "next": "python-35.html",
        "type": "python"
    },
    "python-35": {
        "title": "Урок 50: Логика в Python",
        "module": "Логика",
        "duration": "20 минут",
        "prev": "python-34.html",
        "next": "python-36.html",
        "type": "python"
    },
    "python-36": {
        "title": "Урок 51: Логические функции",
        "module": "Логика",
        "duration": "25 минут",
        "prev": "python-35.html",
        "next": "python-37.html",
        "type": "python"
    },
    "python-37": {
        "title": "Урок 47: Задачи ЕГЭ по логике",
        "module": "Логика",
        "duration": "30 минут",
        "prev": "python-36.html",
        "next": "python-38.html",
        "type": "python"
    },

    # Модуль 9: Графы (python-38 to python-43)
    "python-38": {
        "title": "Урок 53: Введение в графы",
        "module": "Графы и деревья",
        "duration": "25 минут",
        "prev": "python-37.html",
        "next": "python-39.html",
        "type": "python"
    },
    "python-39": {
        "title": "Урок 54: Обход графа в ширину (BFS)",
        "module": "Графы и деревья",
        "duration": "30 минут",
        "prev": "python-38.html",
        "next": "python-40.html",
        "type": "python"
    },
    "python-40": {
        "title": "Урок 55: Обход графа в глубину (DFS)",
        "module": "Графы и деревья",
        "duration": "30 минут",
        "prev": "python-39.html",
        "next": "python-41.html",
        "type": "python"
    },
    "python-41": {
        "title": "Урок 56: Деревья",
        "module": "Графы и деревья",
        "duration": "25 минут",
        "prev": "python-40.html",
        "next": "python-42.html",
        "type": "python"
    },
    "python-42": {
        "title": "Урок 57: Алгоритмы на графах",
        "module": "Графы и деревья",
        "duration": "30 минут",
        "prev": "python-41.html",
        "next": "python-43.html",
        "type": "python"
    },
    "python-43": {
        "title": "Урок 58: Задачи ЕГЭ с графами",
        "module": "Графы и деревья",
        "duration": "30 минут",
        "prev": "python-42.html",
        "next": "oge-01.html",
        "type": "python"
    },

    # Модуль 10: ОГЭ (oge-01 to oge-08)
    "oge-01": {
        "title": "Урок 59: ОГЭ - Исполнители алгоритмов",
        "module": "Подготовка к ОГЭ",
        "duration": "30 минут",
        "prev": "python-43.html",
        "next": "oge-02.html",
        "type": "oge"
    },
    "oge-02": {
        "title": "Урок 60: ОГЭ - Анализ программ",
        "module": "Подготовка к ОГЭ",
        "duration": "25 минут",
        "prev": "oge-01.html",
        "next": "oge-03.html",
        "type": "oge"
    },
    "oge-03": {
        "title": "Урок 61: ОГЭ - Программирование: простые задачи",
        "module": "Подготовка к ОГЭ",
        "duration": "25 минут",
        "prev": "oge-02.html",
        "next": "oge-04.html",
        "type": "oge"
    },
    "oge-04": {
        "title": "Урок 62: ОГЭ - Программирование: массивы",
        "module": "Подготовка к ОГЭ",
        "duration": "30 минут",
        "prev": "oge-03.html",
        "next": "oge-05.html",
        "type": "oge"
    },
    "oge-05": {
        "title": "Урок 63: ОГЭ - Программирование: строки",
        "module": "Подготовка к ОГЭ",
        "duration": "25 минут",
        "prev": "oge-04.html",
        "next": "oge-06.html",
        "type": "oge"
    },
    "oge-06": {
        "title": "Урок 64: ОГЭ - Файлы",
        "module": "Подготовка к ОГЭ",
        "duration": "25 минут",
        "prev": "oge-05.html",
        "next": "oge-07.html",
        "type": "oge"
    },
    "oge-07": {
        "title": "Урок 65: ОГЭ - Электронные таблицы",
        "module": "Подготовка к ОГЭ",
        "duration": "25 минут",
        "prev": "oge-06.html",
        "next": "oge-08.html",
        "type": "oge"
    },
    "oge-08": {
        "title": "Урок 66: ОГЭ - Пробный экзамен",
        "module": "Подготовка к ОГЭ",
        "duration": "90 минут",
        "prev": "oge-07.html",
        "next": "ege-01.html",
        "type": "oge"
    },

    # Модуль 11: ЕГЭ (ege-01 to ege-12)
    "ege-01": {
        "title": "Урок 67: ЕГЭ - Кодирование информации",
        "module": "Подготовка к ЕГЭ",
        "duration": "30 минут",
        "prev": "oge-08.html",
        "next": "ege-02.html",
        "type": "ege"
    },
    "ege-02": {
        "title": "Урок 68: ЕГЭ - Логика и множества",
        "module": "Подготовка к ЕГЭ",
        "duration": "30 минут",
        "prev": "ege-01.html",
        "next": "ege-03.html",
        "type": "ege"
    },
    "ege-03": {
        "title": "Урок 69: ЕГЭ - Системы счисления",
        "module": "Подготовка к ЕГЭ",
        "duration": "30 минут",
        "prev": "ege-02.html",
        "next": "ege-04.html",
        "type": "ege"
    },
    "ege-04": {
        "title": "Урок 70: ЕГЭ - Алгоритмы",
        "module": "Подготовка к ЕГЭ",
        "duration": "30 минут",
        "prev": "ege-03.html",
        "next": "ege-05.html",
        "type": "ege"
    },
    "ege-05": {
        "title": "Урок 71: ЕГЭ - Программирование простое (Задача 22)",
        "module": "Подготовка к ЕГЭ",
        "duration": "25 минут",
        "prev": "ege-04.html",
        "next": "ege-06.html",
        "type": "ege"
    },
    "ege-06": {
        "title": "Урок 72: ЕГЭ - Программирование среднее (Задача 24)",
        "module": "Подготовка к ЕГЭ",
        "duration": "30 минут",
        "prev": "ege-05.html",
        "next": "ege-07.html",
        "type": "ege"
    },
    "ege-07": {
        "title": "Урок 73: ЕГЭ - Программирование сложное (Задача 25)",
        "module": "Подготовка к ЕГЭ",
        "duration": "35 минут",
        "prev": "ege-06.html",
        "next": "ege-08.html",
        "type": "ege"
    },
    "ege-08": {
        "title": "Урок 74: ЕГЭ - Теория игр",
        "module": "Подготовка к ЕГЭ",
        "duration": "35 минут",
        "prev": "ege-07.html",
        "next": "ege-09.html",
        "type": "ege"
    },
    "ege-09": {
        "title": "Урок 75: ЕГЭ - Рекурсия (Задача 23)",
        "module": "Подготовка к ЕГЭ",
        "duration": "30 минут",
        "prev": "ege-08.html",
        "next": "ege-10.html",
        "type": "ege"
    },
    "ege-10": {
        "title": "Урок 76: ЕГЭ - Динамическое программирование (Задача 27)",
        "module": "Подготовка к ЕГЭ",
        "duration": "35 минут",
        "prev": "ege-09.html",
        "next": "ege-11.html",
        "type": "ege"
    },
    "ege-11": {
        "title": "Урок 77: ЕГЭ - Обработка больших данных (Задача 26)",
        "module": "Подготовка к ЕГЭ",
        "duration": "35 минут",
        "prev": "ege-10.html",
        "next": "ege-12.html",
        "type": "ege"
    },
    "ege-12": {
        "title": "Урок 78: ЕГЭ - Пробный экзамен",
        "module": "Подготовка к ЕГЭ",
        "duration": "235 минут",
        "prev": "ege-11.html",
        "next": "advanced-01.html",
        "type": "ege"
    },

    # Модуль 12: Продвинутые темы (advanced-01 to advanced-07)
    "advanced-01": {
        "title": "Урок 79: ООП - Классы и объекты",
        "module": "Продвинутые темы",
        "duration": "30 минут",
        "prev": "ege-12.html",
        "next": "advanced-02.html",
        "type": "python"
    },
    "advanced-02": {
        "title": "Урок 80: ООП - Наследование",
        "module": "Продвинутые темы",
        "duration": "30 минут",
        "prev": "advanced-01.html",
        "next": "advanced-03.html",
        "type": "python"
    },
    "advanced-03": {
        "title": "Урок 81: Обработка исключений",
        "module": "Продвинутые темы",
        "duration": "25 минут",
        "prev": "advanced-02.html",
        "next": "advanced-04.html",
        "type": "python"
    },
    "advanced-04": {
        "title": "Урок 82: Работа с модулями",
        "module": "Продвинутые темы",
        "duration": "25 минут",
        "prev": "advanced-03.html",
        "next": "advanced-05.html",
        "type": "python"
    },
    "advanced-05": {
        "title": "Урок 83: Регулярные выражения",
        "module": "Продвинутые темы",
        "duration": "30 минут",
        "prev": "advanced-04.html",
        "next": "advanced-06.html",
        "type": "python"
    },
    "advanced-06": {
        "title": "Урок 84: Сложность алгоритмов",
        "module": "Продвинутые темы",
        "duration": "30 минут",
        "prev": "advanced-05.html",
        "next": "advanced-07.html",
        "type": "algorithm"
    },
    "advanced-07": {
        "title": "Урок 85: Олимпиадные задачи",
        "module": "Продвинутые темы",
        "duration": "40 минут",
        "prev": "advanced-06.html",
        "next": "../index.html",
        "type": "python"
    },
}

print(f"Всего уроков для генерации: {len(LESSONS_DATA)}")
print("Структура данных готова для генерации контента")
