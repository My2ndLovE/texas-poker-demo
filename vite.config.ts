import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  build: {
    target: 'es2020',
    sourcemap: true,
    rollupOptions: {
      output: {
        manualChunks: {
          'vendor-react': ['react', 'react-dom'],
          'vendor-xstate': ['xstate', '@xstate/react'],
          'vendor-animation': ['framer-motion'],
          'vendor-canvas': ['konva', 'react-konva'],
          'vendor-poker': ['pokersolver'],
        },
      },
    },
  },
  server: {
    port: 5173,
    strictPort: true,
  },
});
