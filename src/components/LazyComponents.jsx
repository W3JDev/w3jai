import { lazy, Suspense } from 'react';

// Lazy load components
export const LazyVideoChat = lazy(() => import('./VideoChat'));
export const LazyStructuredOutputRenderer = lazy(() => import('./StructuredOutputRenderer'));
export const LazySettings = lazy(() => import('./Settings'));
export const LazyAnalyticsDashboard = lazy(() => import('./Analytics/AnalyticsDashboard'));
export const LazyChatSessionsList = lazy(() => import('./ChatHistory/ChatSessionsList'));
export const LazyUserProfile = lazy(() => import('./User/UserProfile'));
export const LazyUserPreferences = lazy(() => import('./User/UserPreferences'));
export const LazyApiKeyManager = lazy(() => import('./User/ApiKeyManager'));

// Suspense wrappers with fallbacks
export const VideoChat = (props) => (
  <Suspense fallback={<VideoFallback />}>
    <LazyVideoChat {...props} />
  </Suspense>
);

export const StructuredOutputRenderer = (props) => (
  <Suspense fallback={<div className="p-4 bg-gray-800/50 rounded-lg animate-pulse">Loading content...</div>}>
    <LazyStructuredOutputRenderer {...props} />
  </Suspense>
);

export const Settings = (props) => (
  <Suspense fallback={<SettingsFallback />}>
    <LazySettings {...props} />
  </Suspense>
);

export const AnalyticsDashboard = (props) => (
  <Suspense fallback={<ComponentFallback height="h-96" />}>
    <LazyAnalyticsDashboard {...props} />
  </Suspense>
);

export const ChatSessionsList = (props) => (
  <Suspense fallback={<ComponentFallback height="h-64" />}>
    <LazyChatSessionsList {...props} />
  </Suspense>
);

export const UserProfile = (props) => (
  <Suspense fallback={<ComponentFallback height="h-48" />}>
    <LazyUserProfile {...props} />
  </Suspense>
);

export const UserPreferences = (props) => (
  <Suspense fallback={<ComponentFallback height="h-64" />}>
    <LazyUserPreferences {...props} />
  </Suspense>
);

export const ApiKeyManager = (props) => (
  <Suspense fallback={<ComponentFallback height="h-64" />}>
    <LazyApiKeyManager {...props} />
  </Suspense>
);

// Fallback components
const ComponentFallback = ({ height = 'h-32' }) => (
  <div className={`mb-4 p-4 bg-gray-800/50 rounded-lg backdrop-blur-sm border border-gray-700/50 animate-pulse ${height}`}>
    <div className="h-5 bg-gray-700 rounded w-1/3 mb-3"></div>
    <div className="space-y-3">
      <div className="h-4 bg-gray-700/70 rounded"></div>
      <div className="h-4 bg-gray-700/70 rounded w-5/6"></div>
      <div className="h-4 bg-gray-700/70 rounded w-4/6"></div>
    </div>
  </div>
);

const VideoFallback = () => (
  <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm">
    <div className="bg-gray-800 p-6 rounded-xl shadow-2xl w-full max-w-lg mx-auto">
      <div className="animate-pulse flex flex-col space-y-4">
        <div className="h-6 bg-gray-700 rounded w-1/3"></div>
        <div className="h-64 bg-gray-700 rounded"></div>
        <div className="flex justify-end space-x-2">
          <div className="h-10 bg-gray-700 rounded w-24"></div>
          <div className="h-10 bg-gray-700 rounded w-24"></div>
        </div>
      </div>
    </div>
  </div>
);

const SettingsFallback = () => (
  <div className="mb-4 p-6 bg-gray-800/50 rounded-2xl backdrop-blur-sm border border-gray-700/50 animate-pulse">
    <div className="h-6 bg-gray-700 rounded w-1/4 mb-4"></div>
    <div className="space-y-4">
      <div className="h-12 bg-gray-700 rounded"></div>
      <div className="h-12 bg-gray-700 rounded"></div>
      <div className="h-12 bg-gray-700 rounded"></div>
      <div className="h-12 bg-gray-700 rounded"></div>
    </div>
  </div>
);
