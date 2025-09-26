import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import { VitePWA } from 'vite-plugin-pwa'
import path from 'path'

export default defineConfig({
  plugins: [
    vue(),
    VitePWA({
      registerType: 'autoUpdate',
      workbox: {
        globPatterns: ['**/*.{js,css,html,ico,png,svg,woff2}']
      },
      includeAssets: ['favicon.ico', 'apple-touch-icon.png', 'masked-icon.svg'],
      manifest: {
        name: 'PythonLearn',
        short_name: 'PythonLearn',
        description: 'Интерактивная платформа для изучения Python',
        theme_color: '#0D1117',
        background_color: '#0D1117',
        display: 'standalone',
        start_url: '/',
        icons: [
          {
            src: 'icons/icon-192.png',
            sizes: '192x192',
            type: 'image/png'
          },
          {
            src: 'icons/icon-512.png',
            sizes: '512x512',
            type: 'image/png'
          }
        ]
      }
    })
  ],
  
  resolve: {
    alias: {
      '@': path.resolve(__dirname, 'src'),
      '@/components': path.resolve(__dirname, 'src/components'),
      '@/views': path.resolve(__dirname, 'src/views'),
      '@/stores': path.resolve(__dirname, 'src/stores'),
      '@/composables': path.resolve(__dirname, 'src/composables'),
      '@/services': path.resolve(__dirname, 'src/services'),
      '@/utils': path.resolve(__dirname, 'src/utils'),
      '@/assets': path.resolve(__dirname, 'src/assets')
    }
  },

  css: {
    preprocessorOptions: {
      css: {
        charset: false
      }
    }
  },

  server: {
    port: 3000,
    host: true,
    open: true,
    proxy: {
      '/api': {
        target: process.env.VITE_API_URL || 'http://localhost:5000',
        changeOrigin: true,
        secure: false,
        rewrite: (path) => path.replace(/^\/api/, '')
      },
      // Для WebSocket соединений (если потребуется)
      '/ws': {
        target: 'ws://localhost:5000',
        ws: true,
        changeOrigin: true
      }
    }
  },

  build: {
    outDir: 'dist',
    sourcemap: true,
    target: 'esnext',
    minify: 'terser',
    terserOptions: {
      compress: {
        drop_console: true,
        drop_debugger: true
      }
    },
    rollupOptions: {
      output: {
        manualChunks: {
          // Выделяем крупные библиотеки в отдельные чанки
          vendor: ['vue', 'vue-router', 'pinia'],
          monaco: ['@monaco-editor/vue', 'monaco-editor'],
          pyodide: ['pyodide'],
          charts: ['chart.js', 'vue-chartjs', 'recharts'],
          utils: ['axios', '@vueuse/core', 'lodash-es', 'date-fns']
        },
        // Настройки для лучшего кэширования
        chunkFileNames: 'js/[name]-[hash].js',
        entryFileNames: 'js/[name]-[hash].js',
        assetFileNames: (assetInfo) => {
          const info = assetInfo.name.split('.')
          const ext = info[info.length - 1]
          if (/\.(mp4|webm|ogg|mp3|wav|flac|aac)$/.test(assetInfo.name)) {
            return `media/[name]-[hash].${ext}`
          }
          if (/\.(png|jpe?g|gif|svg)$/.test(assetInfo.name)) {
            return `images/[name]-[hash].${ext}`
          }
          if (/\.(woff2?|eot|ttf|otf)$/.test(assetInfo.name)) {
            return `fonts/[name]-[hash].${ext}`
          }
          return `assets/[name]-[hash].${ext}`
        }
      }
    },
    // Размер чанка для предупреждений
    chunkSizeWarningLimit: 1600
  },

  optimizeDeps: {
    include: [
      'vue',
      'vue-router',
      'pinia',
      'axios',
      '@vueuse/core',
      'lodash-es'
    ],
    exclude: [
      'pyodide' // Pyodide загружается динамически
    ]
  },

  define: {
    // Переменные окружения доступные в коде
    __VERSION__: JSON.stringify(process.env.npm_package_version),
    __BUILD_TIME__: JSON.stringify(new Date().toISOString())
  },

  // Настройки для тестирования
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: ['src/test/setup.js'],
    coverage: {
      provider: 'c8',
      reporter: ['text', 'json', 'html'],
      exclude: [
        'node_modules/',
        'src/test/',
        '**/*.test.{js,ts,vue}',
        '**/*.spec.{js,ts,vue}'
      ]
    }
  },

  // Настройки для предварительного просмотра
  preview: {
    port: 4173,
    host: true,
    open: true
  }
})