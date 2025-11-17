import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// Vite config (ESM). Using .mjs avoids needing "type":"module" in package.json
export default defineConfig({
  plugins: [react()],
  base: '/math-quiz/'
})
