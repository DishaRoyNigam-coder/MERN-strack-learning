import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'// or '@vitejs/plugin-react' depending on your vite version
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev
export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
  ],
})
