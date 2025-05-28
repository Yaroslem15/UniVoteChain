import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    allowedHosts: [
      'ee75bc8b-5c17-4f82-bce9-383edb4d14ba-00-3o9rdtedzwll3.worf.replit.dev',
      '.replit.dev'
    ]
  }
});