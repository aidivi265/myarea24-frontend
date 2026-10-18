import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  base: process.env.GITHUB_ACTIONS ? '/myarea24-frontend/' : '/',
  plugins: [react()],
  server: {
    port: 5173,
    host: true,
    proxy: {
      '/api': {
        target: 'http://127.0.0.1:8000',
        changeOrigin: true,
      },
    },
  },
  build: {
    chunkSizeWarningLimit: 600,
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes('node_modules')) {
            if (id.includes('lucide-react')) {
              return 'vendor-icons';
            }
            if (/node_modules[\\/](react|react-dom|react-router|react-router-dom|scheduler)[\\/]/.test(id)) {
              return 'vendor-react';
            }
            return 'vendor';
          }
          if (id.includes('src/merchant/') || id.includes('src\\merchant\\')) {
            return 'merchant-portal';
          }
          if (id.includes('src/dashboards/MainDashboards') || id.includes('src\\dashboards\\MainDashboards')) {
            return 'dashboards-main';
          }
          if (id.includes('src/dashboards/IntelligenceDashboards') || id.includes('src\\dashboards\\IntelligenceDashboards')) {
            return 'dashboards-intel';
          }
          if (id.includes('src/dashboards/CommunityDashboards') || id.includes('src\\dashboards\\CommunityDashboards')) {
            return 'dashboards-community';
          }
          if (id.includes('src/components/MobileAppView') || id.includes('src\\components\\MobileAppView')) {
            return 'mobile-app-view';
          }
        },
      },
    },
  },
});

