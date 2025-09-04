import { fileURLToPath, URL } from 'node:url'

import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import vueDevTools from 'vite-plugin-vue-devtools'
import tailwindcss from '@tailwindcss/vite'
import ui from '@nuxt/ui/vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    vue(),
    vueDevTools(),
    tailwindcss(),
    ui({
      ui: {
        colors: {
          primary: 'blue',
        },
        tabs: {
          slots: {
            root: 'w-48',
            trigger: 'cursor-pointer font-bold',
          },
        },
        card: {
          slots: {
            root: 'rounded-sm',
            body: 'p-0 sm:p-0',
          },
        },
        table: {
          slots: {
            th: 'py-2 text-base [&>button]:text-base [&>button]:text-highlighted [&>button]:font-semibold',
            td: 'py-2 text-base',
          },
        },
        select: {
          slots: {
            content: 'max-h-96',
          },
        },
        popover: {
          slots: {
            content: 'z-10',
          },
        },
      },
    }),
  ],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
  server: {
    host: '127.0.0.1',
  },
})
