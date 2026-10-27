import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  base: process.env.NODE_ENV === 'production' ? '/teaamo-palermo/' : '/',
  plugins: [react()],
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          three: ['three', '@react-three/fiber', '@react-three/drei'],
          vendor: ['react', 'react-dom', 'lucide-react', 'canvas-confetti'],
        },
      },
    },
    chunkSizeWarningLimit: 1200,
  },
  server: {
    port: 5173,
    host: true,
  },
});
