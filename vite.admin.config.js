import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { resolve } from 'path'

export default defineConfig({
    plugins: [react()],
    build: {
        outDir: 'dist-admin',
        rollupOptions: { input: resolve(__dirname, 'admin.html') },
    },
    server: {
        open: '/admin.html',
        proxy: {
            '/api': { target: 'http://localhost:5000', changeOrigin: true, secure: false },
        },
    },
})