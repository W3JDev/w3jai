import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    react(),
  ],
  build: {
    sourcemap: false,
    // Increase the warning limit to avoid unnecessary warnings
    chunkSizeWarningLimit: 1500,
    // Properly handle CSS files
    cssCodeSplit: true,
    // Ensure CSS is properly processed
    assetsInlineLimit: 4096,
  },
  server: {
    proxy: {
      // Proxy API requests to avoid CORS issues
      '/api/brave-search': {
        target: 'https://api.search.brave.com/res/v1/web/search',
        changeOrigin: true,
        rewrite: () => '',
        configure: (proxy) => {
          proxy.on('proxyReq', (proxyReq, req) => {
            // Get the API key from the request headers
            const apiKey = req.headers['x-subscription-token'];
            if (apiKey) {
              proxyReq.setHeader('X-Subscription-Token', apiKey);
            }
          });
        }
      }
    }
  }
})
