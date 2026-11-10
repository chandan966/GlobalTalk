import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    headers: {
      'X-Content-Type-Options': 'nosniff',
      'X-Frame-Options': 'DENY',
      'Referrer-Policy': 'strict-origin-when-cross-origin',
      'Permissions-Policy':
        'camera=(self), microphone=(self), geolocation=(), display-capture=(), payment=(), usb=()',
      'Cross-Origin-Opener-Policy': 'same-origin-allow-popups',
      'Cross-Origin-Resource-Policy': 'same-origin',
      'X-Permitted-Cross-Domain-Policies': 'none',
      'X-XSS-Protection': '0',
    },
    proxy: {
      '/ws': { target: 'ws://localhost:8787', ws: true },
      '/video': { target: 'ws://localhost:8787', ws: true },
    },
  },
  preview: {
    headers: {
      'X-Content-Type-Options': 'nosniff',
      'X-Frame-Options': 'DENY',
      'Referrer-Policy': 'strict-origin-when-cross-origin',
      'Permissions-Policy':
        'camera=(self), microphone=(self), geolocation=(), display-capture=(), payment=(), usb=()',
      'Cross-Origin-Opener-Policy': 'same-origin-allow-popups',
      'Cross-Origin-Resource-Policy': 'same-origin',
      'X-Permitted-Cross-Domain-Policies': 'none',
      'X-XSS-Protection': '0',
    },
  },
  build: {
    sourcemap: false,
  },
});
