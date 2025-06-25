import { fileURLToPath, URL } from 'node:url'
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import vueDevTools from 'vite-plugin-vue-devtools'
import tailwindcss from '@tailwindcss/vite'
import path from 'node:path'
import tsconfigPaths from 'vite-tsconfig-paths'
import yamlPlugin from '@rollup/plugin-yaml'

export default defineConfig({
  base: '/',
  plugins: [
    {
      ...yamlPlugin(),
      enforce: 'pre',
    },
    vue(),
    vueDevTools(),
    tailwindcss(),
    tsconfigPaths(),
  ],
  build: {
    cssCodeSplit: true,
  },
  define: {},
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
      '@nandos-types': path.resolve(__dirname, '../nandos-types'),
    },
    extensions: ['.mjs', '.js', '.ts', '.jsx', '.tsx', '.json'],
  },
} as never)
