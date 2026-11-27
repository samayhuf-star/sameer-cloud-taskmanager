import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// The app is served from a subpath (https://sameer.cloud/task/).
// Override with BASE_PATH, e.g. `BASE_PATH=/ npm run build` for a root deploy,
// or `BASE_PATH=./` for a build that works under any folder.
export default defineConfig({
  base: process.env.BASE_PATH ?? '/task/',
  plugins: [react(), tailwindcss()],
})
