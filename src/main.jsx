import React, { lazy, Suspense } from 'react';
import ReactDOM from 'react-dom/client';
import { createBrowserRouter, RouterProvider } from 'react-router-dom';

// Lazy load page components
const Chat = lazy(() => import('./pages/Chat.jsx'));
const Dashboard = lazy(() => import('./pages/Dashboard.jsx'));
const Settings = lazy(() => import('./pages/Settings.jsx'));
const App = lazy(() => import('./App.jsx'));
import ErrorBoundary from './components/ErrorBoundary';
import { setupGlobalErrorHandler } from './utils/errorHandling';
import { AuthProvider } from './contexts/AuthContext';
import { AdminProvider } from './contexts/AdminContext';
import { ChatProvider } from './contexts/ChatContext';
import { AnalyticsProvider } from './contexts/AnalyticsContext';
import { AccessibilityProvider } from './contexts/AccessibilityContext';
import { initKeyboardNavigation } from './utils/keyboardNavigation';
import './i18n/i18n';
import './styles/accessibility.css';
import './index.css';

// Set up global error handler
setupGlobalErrorHandler((error) => {
  console.error('Global error:', error);
  // You could also send this to an error tracking service
});

// Loading component
const LoadingFallback = () => (
  <div className="flex items-center justify-center h-screen w-screen bg-gray-900">
    <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-blue-500"></div>
  </div>
);

// Create a router with routes
const router = createBrowserRouter([
  {
    path: '/',
    element: (
      <ErrorBoundary>
        <Suspense fallback={<LoadingFallback />}>
          <Chat />
        </Suspense>
      </ErrorBoundary>
    )
  },
  {
    path: '/dashboard',
    element: (
      <ErrorBoundary>
        <Suspense fallback={<LoadingFallback />}>
          <Dashboard />
        </Suspense>
      </ErrorBoundary>
    )
  },
  {
    path: '/settings',
    element: (
      <ErrorBoundary>
        <Suspense fallback={<LoadingFallback />}>
          <Settings />
        </Suspense>
      </ErrorBoundary>
    )
  },
  {
    path: '/legacy',
    element: (
      <ErrorBoundary>
        <Suspense fallback={<LoadingFallback />}>
          <App />
        </Suspense>
      </ErrorBoundary>
    )
  }
]);

// Initialize keyboard navigation
document.addEventListener('DOMContentLoaded', initKeyboardNavigation);

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <AuthProvider>
      <AdminProvider>
        <AnalyticsProvider>
          <AccessibilityProvider>
            <ChatProvider>
              <RouterProvider router={router} />
            </ChatProvider>
          </AccessibilityProvider>
        </AnalyticsProvider>
      </AdminProvider>
    </AuthProvider>
  </React.StrictMode>
);