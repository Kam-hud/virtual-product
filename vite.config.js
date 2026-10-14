import { fileURLToPath, URL } from 'node:url'

import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import vueDevTools from 'vite-plugin-vue-devtools'
import path from 'path';

// base：默认根路径（本地/Vercel），GitHub Pages 子路径时通过 VITE_BASE_PATH 注入
const base = process.env.VITE_BASE_PATH || '/'

// https://vite.dev/config/
export default defineConfig({
    base,
    plugins: [
        vue(),
        vueDevTools(),
    ],
    server: {
        proxy: {
            // 后端接口本身以 /api 开头（Express app 挂载 /api 路由），直接透传不做 rewrite
            '/api': {
                target: 'http://localhost:3001',
                changeOrigin: true,
                secure: false,
                ws: true,
            }
        }
    },
    resolve: {
        alias: {
            '@': path.resolve(__dirname, './src'),
        },
    },
})
