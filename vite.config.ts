import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import tailwindcss from '@tailwindcss/vite';

import { assetpackPlugin } from './scripts/assetpack-vite-plugin';

// https://vite.dev/config/
export default defineConfig({
    plugins: [
        tailwindcss(),
        assetpackPlugin(),
        react()
    ],
    server: {
        port: 8080,
        open: true,
        proxy: {
            '/socket.io': {
                target: 'http://localhost:3000',
                changeOrigin: true,
                ws: true,
            },
        },
    },
    define: {
        APP_VERSION: JSON.stringify(process.env.npm_package_version),
    },
    resolve: {
        alias: {
            '@': path.resolve(__dirname, './src'),
        },
    },
});
