import { defineConfig,loadEnv } from 'vite'
import react from '@vitejs/plugin-react'
import tsconfigPaths from "vite-tsconfig-paths" 
import { nodePolyfills } from "vite-plugin-node-polyfills"
// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  // 加载环境变量
  const env = loadEnv(mode, process.cwd())

  return {
    plugins: [react(), nodePolyfills(), tsconfigPaths()],
  }
})