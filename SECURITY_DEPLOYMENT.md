# Security & Deployment Guide

## Security Measures

### API Key Protection
1. Environment Variables
```typescript
// .env
VITE_OPENROUTER_KEY=your_key
VITE_ELEVENLABS_KEY=your_key
VITE_GEMINI_KEY=your_key

// src/utils/config.ts
export const config = {
  openRouterKey: import.meta.env.VITE_OPENROUTER_KEY,
  elevenLabsKey: import.meta.env.VITE_ELEVENLABS_KEY,
  geminiKey: import.meta.env.VITE_GEMINI_KEY
};
```

2. Local Storage Encryption
```typescript
// src/utils/storage.ts
import { AES, enc } from 'crypto-js';

const STORAGE_KEY = 'w3j_storage';
const ENCRYPTION_KEY = import.meta.env.VITE_STORAGE_KEY;

export const secureStorage = {
  set: (key: string, value: string) => {
    const encrypted = AES.encrypt(value, ENCRYPTION_KEY).toString();
    const data = JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}');
    data[key] = encrypted;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  },

  get: (key: string): string | null => {
    const data = JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}');
    const encrypted = data[key];
    if (!encrypted) return null;
    const decrypted = AES.decrypt(encrypted, ENCRYPTION_KEY);
    return decrypted.toString(enc.Utf8);
  }
};
```

### Content Security Policy
```html
<!-- index.html -->
<meta http-equiv="Content-Security-Policy" content="
  default-src 'self';
  script-src 'self' 'unsafe-eval';
  style-src 'self' 'unsafe-inline';
  img-src 'self' blob: data:;
  media-src 'self' blob:;
  connect-src 'self' https://api.openrouter.ai https://api.elevenlabs.io;
">
```

### Input Validation
```typescript
// src/utils/validation.ts
export const validateInput = {
  message: (text: string): boolean => {
    return text.length > 0 && text.length <= 4000;
  },

  file: (file: File): boolean => {
    const validTypes = ['text/plain', 'image/jpeg', 'image/png'];
    const maxSize = 5 * 1024 * 1024; // 5MB
    return validTypes.includes(file.type) && file.size <= maxSize;
  },

  apiKey: (key: string): boolean => {
    return /^[a-zA-Z0-9_-]{20,}$/.test(key);
  }
};
```

## Deployment Configuration

### Vite Production Build
```javascript
// vite.config.js
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['favicon.svg', 'robots.txt'],
      manifest: {
        name: 'W3J Assistant',
        short_name: 'W3J',
        theme_color: '#1d4ed8',
        icons: [
          {
            src: '/favicon.svg',
            sizes: '192x192',
            type: 'image/svg+xml'
          }
        ]
      }
    })
  ],
  build: {
    target: 'esnext',
    minify: 'terser',
    sourcemap: false,
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom'],
          ai: ['@google/generative-ai'],
          ui: ['lucide-react']
        }
      }
    }
  },
  server: {
    headers: {
      'Cross-Origin-Embedder-Policy': 'require-corp',
      'Cross-Origin-Opener-Policy': 'same-origin'
    }
  }
});
```

### Netlify Configuration
```toml
# netlify.toml
[build]
  command = "npm run build"
  publish = "dist"

[build.environment]
  NODE_VERSION = "18"

[[redirects]]
  from = "/*"
  to = "/index.html"
  status = 200

[[headers]]
  for = "/*"
  [headers.values]
    X-Frame-Options = "DENY"
    X-XSS-Protection = "1; mode=block"
    X-Content-Type-Options = "nosniff"
    Referrer-Policy = "strict-origin-when-cross-origin"
    Permissions-Policy = "camera=self microphone=self"
```

### Docker Configuration
```dockerfile
# Dockerfile
FROM node:18-alpine as builder

WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

FROM nginx:alpine
COPY --from=builder /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
```

```nginx
# nginx.conf
server {
    listen 80;
    server_name localhost;
    root /usr/share/nginx/html;
    index index.html;

    # Security headers
    add_header X-Frame-Options "DENY";
    add_header X-XSS-Protection "1; mode=block";
    add_header X-Content-Type-Options "nosniff";
    add_header Referrer-Policy "strict-origin-when-cross-origin";
    add_header Permissions-Policy "camera=self microphone=self";

    # Cache control
    location /assets/ {
        expires 1y;
        add_header Cache-Control "public, no-transform";
    }

    # SPA routing
    location / {
        try_files $uri $uri/ /index.html;
    }
}
```

## Performance Optimization

### Code Splitting
```typescript
// src/App.tsx
const VideoChat = lazy(() => import('./components/VideoChat'));
const Settings = lazy(() => import('./components/Settings'));

function App() {
  return (
    <Suspense fallback={<Loading />}>
      {showVideo && <VideoChat />}
      {showSettings && <Settings />}
    </Suspense>
  );
}
```

### Asset Optimization
```javascript
// vite.config.js
import imagemin from 'vite-plugin-imagemin';

export default defineConfig({
  plugins: [
    imagemin({
      gifsicle: { optimizationLevel: 7 },
      mozjpeg: { quality: 80 },
      pngquant: { quality: [0.8, 0.9] },
      svgo: {
        plugins: [
          { name: 'removeViewBox', active: false },
          { name: 'removeDimensions', active: true }
        ]
      }
    })
  ]
});
```

## Monitoring & Analytics

### Error Tracking
```typescript
// src/utils/errorTracking.ts
interface ErrorEvent {
  message: string;
  stack?: string;
  timestamp: number;
  tags: Record<string, string>;
}

class ErrorTracker {
  private static instance: ErrorTracker;
  private errors: ErrorEvent[] = [];
  
  static getInstance(): ErrorTracker {
    if (!ErrorTracker.instance) {
      ErrorTracker.instance = new ErrorTracker();
    }
    return ErrorTracker.instance;
  }
  
  trackError(error: Error, tags: Record<string, string> = {}) {
    const event: ErrorEvent = {
      message: error.message,
      stack: error.stack,
      timestamp: Date.now(),
      tags
    };
    
    this.errors.push(event);
    this.sendToServer(event);
  }
  
  private async sendToServer(event: ErrorEvent) {
    try {
      await fetch('/api/errors', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(event)
      });
    } catch (err) {
      console.error('Failed to send error:', err);
    }
  }
}

export const errorTracker = ErrorTracker.getInstance();
```

### Performance Monitoring
```typescript
// src/utils/performance.ts
interface Metric {
  name: string;
  value: number;
  tags: Record<string, string>;
}

class PerformanceMonitor {
  private metrics: Metric[] = [];
  
  trackMetric(name: string, value: number, tags: Record<string, string> = {}) {
    const metric: Metric = { name, value, tags };
    this.metrics.push(metric);
    this.sendToServer(metric);
  }
  
  trackTiming(name: string, fn: () => Promise<any>, tags: Record<string, string> = {}) {
    const start = performance.now();
    return fn().finally(() => {
      const duration = performance.now() - start;
      this.trackMetric(`${name}_duration`, duration, tags);
    });
  }
}

export const performanceMonitor = new PerformanceMonitor();
```

## Backup & Recovery

### Data Backup
```typescript
// src/utils/backup.ts
interface BackupData {
  messages: Message[];
  settings: Settings;
  timestamp: number;
}

export const backup = {
  create: async (): Promise<string> => {
    const data: BackupData = {
      messages: getMessages(),
      settings: getSettings(),
      timestamp: Date.now()
    };
    
    const blob = new Blob([JSON.stringify(data)], {
      type: 'application/json'
    });
    
    return URL.createObjectURL(blob);
  },
  
  restore: async (file: File): Promise<void> => {
    const text = await file.text();
    const data: BackupData = JSON.parse(text);
    
    await restoreMessages(data.messages);
    await restoreSettings(data.settings);
  }
};
```

## Deployment Checklist

### Pre-deployment
- [ ] Run full test suite
- [ ] Check bundle size
- [ ] Validate API keys
- [ ] Review security headers
- [ ] Update documentation

### Deployment
- [ ] Build production assets
- [ ] Deploy to staging
- [ ] Run smoke tests
- [ ] Deploy to production
- [ ] Verify monitoring

### Post-deployment
- [ ] Monitor error rates
- [ ] Check performance metrics
- [ ] Verify backups
- [ ] Update status page

## Emergency Procedures

### Incident Response
1. Identify issue
2. Assess impact
3. Implement fix
4. Verify solution
5. Document incident

### Rollback Plan
1. Identify version
2. Backup data
3. Deploy previous version
4. Verify functionality
5. Monitor metrics

This guide provides comprehensive security measures and deployment procedures to ensure reliable operation of W3J Assistant.
