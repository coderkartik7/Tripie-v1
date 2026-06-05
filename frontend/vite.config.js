import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')

  return {
    plugins: [react()],
    define: {
      'import.meta.env.MAPBOX_ACCESS_TOKEN': JSON.stringify(
        env.MAPBOX_ACCESS_TOKEN || env.VITE_MAPBOX_ACCESS_TOKEN || ''
      ),
    },
  }
})
