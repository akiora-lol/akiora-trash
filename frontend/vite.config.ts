import path from "path"
import tailwindcss from "@tailwindcss/vite"
import react from "@vitejs/plugin-react-swc"
import { defineConfig } from "vite"
import { tanstackRouter } from '@tanstack/router-plugin/vite'
// https://vite.dev/config/
export default defineConfig({
  plugins: [ tanstackRouter({
      target: 'react',
      autoCodeSplitting: true,
    }),react(), tailwindcss()],
   server: {
    host: '0.0.0.0', // Слушать на всех IP-адресах
    port: 5173 // Порт по умолчанию, можно изменить
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  css: {
    postcss: './postcss.config.js'
  }
})
