import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  optimizeDeps: {
    exclude: ['lucide-react'],
  },
  define: {
    // Определяем process.env для использования в коде
    'process.env': {
      'DFX_NETWORK': 'ic',
      'CANISTER_ID_AGG_V1_BACKEND': '4fd3k-eqaaa-aaaao-qjvuq-cai'
    }
  }
});
