const sidebarHTML = `
<nav id="sidebar" class="sidebar">
    <div class="sidebar-header">
        <h2>Содержание курса</h2>
        <button class="close-btn" id="closeBtn">×</button>
    </div>
    
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
            <li><a href="algo-08.html">Работа с числами</a></li>
            <li><a href="algo-09.html">Строковые алгоритмы</a></li>
            <li><a href="algo-10.html">Перебор и комбинаторика</a></li>
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
            <h3>Подготовка к ОГЭ</h3>
            <span class="toggle-icon">▼</span>
        </div>
        <ul>
            <li><a href="oge-01.html">Анализ программ</a></li>
            <li><a href="oge-02.html">Простые задачи</a></li>
            <li><a href="oge-03.html">Массивы и списки</a></li>
            <li><a href="oge-04.html">Строки</a></li>
        </ul>
    </div>

    <div class="lesson-group">
        <div class="lesson-group-header">
            <h3>Подготовка к ЕГЭ</h3>
            <span class="toggle-icon">▼</span>
        </div>
        <ul>
            <li><a href="ege-01.html">Программирование простое</a></li>
            <li><a href="ege-02.html">Программирование среднее</a></li>
            <li><a href="ege-03.html">Программирование сложное</a></li>
            <li><a href="ege-04.html">Файлы</a></li>
            <li><a href="ege-05.html">Рекурсия</a></li>
            <li><a href="ege-06.html">Обработка больших данных</a></li>
        </ul>
    </div>
</nav>
`;
