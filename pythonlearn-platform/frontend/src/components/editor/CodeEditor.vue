<template>
  <div class="code-editor-container">
    <div class="editor-header">
      <div class="file-tabs">
        <button
          v-for="file in files"
          :key="file.name"
          :class="['tab', { active: file.name === activeFile }]"
          @click="setActiveFile(file.name)"
        >
          {{ file.name }}
          <span v-if="files.length > 1" class="close" @click.stop="closeFile(file.name)">×</span>
        </button>
        <button class="add-file" @click="addFile" title="Добавить файл">+</button>
      </div>
      <div class="editor-actions">
        <button @click="formatCode" class="btn-format" title="Форматировать код">
          <span class="icon">🎨</span>
        </button>
        <button @click="toggleTheme" class="btn-theme" title="Переключить тему">
          <span class="icon">{{ isDarkTheme ? '☀️' : '🌙' }}</span>
        </button>
      </div>
    </div>
    
    <div ref="editorContainer" class="editor-container"></div>
    
    <div class="editor-footer">
      <div class="status-bar">
        <span class="cursor-position">Строка {{ cursorPosition.lineNumber }}, Столбец {{ cursorPosition.column }}</span>
        <span class="language">Python</span>
        <span class="encoding">UTF-8</span>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted, watch, nextTick, computed } from 'vue'
import { useTheme } from '@/composables/useTheme'

// Props
const props = defineProps({
  modelValue: {
    type: String,
    default: ''
  },
  language: {
    type: String,
    default: 'python'
  },
  readOnly: {
    type: Boolean,
    default: false
  },
  height: {
    type: String,
    default: '400px'
  }
})

// Emits
const emit = defineEmits(['update:modelValue', 'change', 'save', 'run'])

// Composables
const { isDarkTheme } = useTheme()

// Refs
const editorContainer = ref(null)
const editor = ref(null)
const files = ref([
  { name: 'main.py', content: props.modelValue }
])
const activeFile = ref('main.py')
const cursorPosition = ref({ lineNumber: 1, column: 1 })

// Computed
const currentFile = computed(() => 
  files.value.find(f => f.name === activeFile.value)
)

// Monaco Editor initialization
const initializeEditor = async () => {
  if (!editorContainer.value || !window.monaco) {
    console.warn('Monaco Editor не загружен')
    return
  }

  try {
    // Monaco Editor конфигурация
    editor.value = window.monaco.editor.create(editorContainer.value, {
      value: props.modelValue,
      language: props.language,
      theme: isDarkTheme.value ? 'vs-dark' : 'vs-light',
      readOnly: props.readOnly,
      automaticLayout: true,
      minimap: { enabled: false },
      scrollBeyondLastLine: false,
      wordWrap: 'on',
      lineNumbers: 'on',
      glyphMargin: true,
      folding: true,
      lineDecorationsWidth: 20,
      lineNumbersMinChars: 3,
      fontSize: 14,
      fontFamily: "'JetBrains Mono', 'SF Mono', Monaco, 'Cascadia Code', monospace",
      tabSize: 4,
      insertSpaces: true,
      detectIndentation: false,
      renderWhitespace: 'selection',
      contextmenu: true,
      mouseWheelZoom: true,
      cursorBlinking: 'blink',
      cursorSmoothCaretAnimation: true,
      smoothScrolling: true,
      multiCursorModifier: 'ctrlCmd',
      selectionHighlight: true,
      occurrencesHighlight: true,
      codeLens: false,
      colorDecorators: true,
      suggest: {
        showKeywords: true,
        showSnippets: true,
        showFunctions: true,
        showConstructors: true,
        showFields: true,
        showVariables: true,
        showClasses: true,
        showModules: true
      }
    })

    // Обработчики событий
    editor.value.onDidChangeModelContent(() => {
      const value = editor.value.getValue()
      if (currentFile.value) {
        currentFile.value.content = value
      }
      emit('update:modelValue', value)
      emit('change', value)
    })

    editor.value.onDidChangeCursorPosition((e) => {
      cursorPosition.value = {
        lineNumber: e.position.lineNumber,
        column: e.position.column
      }
    })

    // Горячие клавиши
    editor.value.addCommand(window.monaco.KeyMod.CtrlCmd | window.monaco.KeyCode.KeyS, () => {
      emit('save', editor.value.getValue())
    })

    editor.value.addCommand(window.monaco.KeyMod.CtrlCmd | window.monaco.KeyCode.KeyR, () => {
      emit('run', editor.value.getValue())
    })

    // Настройка автодополнения для Python
    setupPythonAutoComplete()

  } catch (error) {
    console.error('Ошибка инициализации Monaco Editor:', error)
  }
}

const setupPythonAutoComplete = () => {
  const pythonKeywords = [
    'def', 'class', 'if', 'elif', 'else', 'for', 'while', 'try', 'except', 'finally',
    'import', 'from', 'as', 'return', 'yield', 'lambda', 'with', 'assert', 'break',
    'continue', 'pass', 'raise', 'global', 'nonlocal', 'True', 'False', 'None'
  ]

  const pythonBuiltins = [
    'print', 'input', 'len', 'str', 'int', 'float', 'bool', 'list', 'dict', 'tuple',
    'set', 'range', 'enumerate', 'zip', 'map', 'filter', 'sum', 'max', 'min', 'abs',
    'round', 'sorted', 'reversed', 'all', 'any', 'type', 'isinstance', 'hasattr'
  ]

  window.monaco.languages.registerCompletionItemProvider('python', {
    provideCompletionItems: (model, position) => {
      const suggestions = [
        ...pythonKeywords.map(keyword => ({
          label: keyword,
          kind: window.monaco.languages.CompletionItemKind.Keyword,
          insertText: keyword
        })),
        ...pythonBuiltins.map(builtin => ({
          label: builtin,
          kind: window.monaco.languages.CompletionItemKind.Function,
          insertText: builtin + '($1)',
          insertTextRules: window.monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet
        }))
      ]

      return { suggestions }
    }
  })
}

const setActiveFile = (fileName) => {
  if (currentFile.value && editor.value) {
    currentFile.value.content = editor.value.getValue()
  }
  activeFile.value = fileName
  if (editor.value) {
    const file = files.value.find(f => f.name === fileName)
    editor.value.setValue(file?.content || '')
  }
}

const addFile = () => {
  const fileName = prompt('Введите имя файла:', 'utils.py')
  if (fileName && !files.value.find(f => f.name === fileName)) {
    files.value.push({ name: fileName, content: '' })
    setActiveFile(fileName)
  }
}

const closeFile = (fileName) => {
  if (files.value.length <= 1) return
  
  const index = files.value.findIndex(f => f.name === fileName)
  if (index !== -1) {
    files.value.splice(index, 1)
    if (activeFile.value === fileName) {
      setActiveFile(files.value[0].name)
    }
  }
}

const formatCode = () => {
  if (editor.value) {
    editor.value.getAction('editor.action.formatDocument').run()
  }
}

const toggleTheme = () => {
  if (editor.value) {
    const newTheme = isDarkTheme.value ? 'vs-light' : 'vs-dark'
    window.monaco.editor.setTheme(newTheme)
  }
}

// Watchers
watch(() => props.modelValue, (newValue) => {
  if (editor.value && editor.value.getValue() !== newValue) {
    editor.value.setValue(newValue)
  }
})

watch(isDarkTheme, (isDark) => {
  if (editor.value) {
    window.monaco.editor.setTheme(isDark ? 'vs-dark' : 'vs-light')
  }
})

// Lifecycle
onMounted(async () => {
  await nextTick()
  
  // Ждем загрузки Monaco Editor
  const waitForMonaco = () => {
    return new Promise((resolve) => {
      if (window.monaco) {
        resolve()
      } else {
        const checkMonaco = setInterval(() => {
          if (window.monaco) {
            clearInterval(checkMonaco)
            resolve()
          }
        }, 100)
      }
    })
  }
  
  await waitForMonaco()
  await initializeEditor()
})

onUnmounted(() => {
  if (editor.value) {
    editor.value.dispose()
  }
})

// Expose methods
defineExpose({
  getCode: () => editor.value?.getValue() || '',
  setCode: (code) => {
    if (editor.value) {
      editor.value.setValue(code)
    }
  },
  focus: () => editor.value?.focus(),
  formatCode,
  getFiles: () => files.value,
  setFiles: (newFiles) => {
    files.value = newFiles
    if (newFiles.length > 0) {
      setActiveFile(newFiles[0].name)
    }
  }
})
</script>

<style scoped>
.code-editor-container {
  display: flex;
  flex-direction: column;
  height: v-bind(height);
  border: 1px solid var(--border-primary);
  border-radius: 8px;
  overflow: hidden;
  background: var(--bg-secondary);
}

.editor-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  background: var(--bg-tertiary);
  border-bottom: 1px solid var(--border-primary);
  padding: 0;
}

.file-tabs {
  display: flex;
  align-items: center;
}

.tab {
  display: flex;
  align-items: center;
  gap: 4px;
  padding: 8px 12px;
  background: transparent;
  border: none;
  color: var(--text-secondary);
  cursor: pointer;
  font-size: 14px;
  border-bottom: 2px solid transparent;
  transition: all 0.2s ease;
}

.tab:hover {
  background: var(--bg-hover);
  color: var(--text-primary);
}

.tab.active {
  color: var(--accent-primary);
  border-bottom-color: var(--accent-primary);
  background: var(--bg-secondary);
}

.close {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 16px;
  height: 16px;
  border-radius: 2px;
  font-size: 12px;
  line-height: 1;
}

.close:hover {
  background: var(--accent-error);
  color: white;
}

.add-file {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  margin: 4px;
  background: transparent;
  border: 1px dashed var(--border-primary);
  border-radius: 4px;
  color: var(--text-secondary);
  cursor: pointer;
  font-size: 16px;
  transition: all 0.2s ease;
}

.add-file:hover {
  background: var(--bg-hover);
  color: var(--accent-primary);
  border-color: var(--accent-primary);
}

.editor-actions {
  display: flex;
  gap: 4px;
  padding: 4px 8px;
}

.btn-format,
.btn-theme {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  background: transparent;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  transition: background-color 0.2s ease;
}

.btn-format:hover,
.btn-theme:hover {
  background: var(--bg-hover);
}

.icon {
  font-size: 14px;
}

.editor-container {
  flex: 1;
  position: relative;
}

.editor-footer {
  background: var(--bg-tertiary);
  border-top: 1px solid var(--border-primary);
}

.status-bar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 4px 12px;
  font-size: 12px;
  color: var(--text-muted);
}

.status-bar span {
  padding: 0 8px;
}

.cursor-position {
  border-right: 1px solid var(--border-secondary);
}

.language {
  border-right: 1px solid var(--border-secondary);
}

/* Адаптивность */
@media (max-width: 768px) {
  .file-tabs {
    overflow-x: auto;
    scrollbar-width: none;
    -ms-overflow-style: none;
  }
  
  .file-tabs::-webkit-scrollbar {
    display: none;
  }
  
  .editor-actions {
    flex-shrink: 0;
  }
  
  .status-bar {
    font-size: 11px;
    padding: 2px 8px;
  }
  
  .status-bar span {
    padding: 0 4px;
  }
}
</style>