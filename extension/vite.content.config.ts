import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { resolve } from 'path';

export default defineConfig({
    plugins: [react()],
    define: {
        'process.env.NODE_ENV': '"production"',
    },
    build: {
        emptyOutDir: false,
        outDir: 'dist',
        lib: {
            entry: resolve(__dirname, 'src/content/index.ts'),
            name: 'JobTrackerContent',
            formats: ['iife'],
            fileName: () => 'assets/content.js',
        },
        rollupOptions: {
            output: {
                extend: true,
            },
        },
    },
});
