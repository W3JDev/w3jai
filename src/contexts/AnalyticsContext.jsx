import { createContext, useContext, useEffect } from 'react';
import { useAuth } from './AuthContext';
import analyticsService from '../services/analyticsService';

const AnalyticsContext = createContext();

export const useAnalytics = () => useContext(AnalyticsContext);

export const AnalyticsProvider = ({ children }) => {
  const { user } = useAuth();
  
  // Initialize analytics with user ID when available
  useEffect(() => {
    if (user) {
      analyticsService.init(user.id);
    } else {
      analyticsService.init(null);
    }
  }, [user]);
  
  // Track page views
  useEffect(() => {
    const trackPageView = () => {
      const pageName = window.location.pathname;
      analyticsService.trackPageView(pageName);
    };
    
    // Track initial page view
    trackPageView();
    
    // Track page views on navigation
    const handleRouteChange = () => {
      trackPageView();
    };
    
    window.addEventListener('popstate', handleRouteChange);
    
    return () => {
      window.removeEventListener('popstate', handleRouteChange);
    };
  }, []);
  
  const track = (eventName, properties = {}) => {
    analyticsService.track(eventName, properties);
  };
  
  const trackChatMessage = (role, messageLength, properties = {}) => {
    analyticsService.trackChatMessage(role, messageLength, properties);
  };
  
  const trackError = (errorType, errorMessage, properties = {}) => {
    analyticsService.trackError(errorType, errorMessage, properties);
  };
  
  const trackFeatureUsage = (featureName, properties = {}) => {
    analyticsService.trackFeatureUsage(featureName, properties);
  };
  
  const setEnabled = (enabled) => {
    analyticsService.setEnabled(enabled);
  };
  
  const value = {
    track,
    trackChatMessage,
    trackError,
    trackFeatureUsage,
    setEnabled
  };
  
  return (
    <AnalyticsContext.Provider value={value}>
      {children}
    </AnalyticsContext.Provider>
  );
};

export default AnalyticsContext;
