import { createContext, useContext, useState, useEffect } from 'react';

const AccessibilityContext = createContext();

export const useAccessibility = () => useContext(AccessibilityContext);

export const AccessibilityProvider = ({ children }) => {
  const [highContrast, setHighContrast] = useState(false);
  const [largeText, setLargeText] = useState(false);
  const [reducedMotion, setReducedMotion] = useState(false);
  const [screenReaderMode, setScreenReaderMode] = useState(false);
  
  // Load preferences from localStorage on mount
  useEffect(() => {
    try {
      const storedPrefs = localStorage.getItem('accessibility_preferences');
      if (storedPrefs) {
        const prefs = JSON.parse(storedPrefs);
        setHighContrast(prefs.highContrast || false);
        setLargeText(prefs.largeText || false);
        setReducedMotion(prefs.reducedMotion || false);
        setScreenReaderMode(prefs.screenReaderMode || false);
      } else {
        // Check for system preferences
        checkSystemPreferences();
      }
    } catch (error) {
      console.error('Error loading accessibility preferences:', error);
    }
  }, []);
  
  // Save preferences to localStorage when they change
  useEffect(() => {
    try {
      const prefs = {
        highContrast,
        largeText,
        reducedMotion,
        screenReaderMode
      };
      localStorage.setItem('accessibility_preferences', JSON.stringify(prefs));
      
      // Apply preferences to document
      applyPreferences();
    } catch (error) {
      console.error('Error saving accessibility preferences:', error);
    }
  }, [highContrast, largeText, reducedMotion, screenReaderMode]);
  
  // Check system preferences
  const checkSystemPreferences = () => {
    // Check for prefers-reduced-motion
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
    setReducedMotion(prefersReducedMotion.matches);
    
    // Check for prefers-contrast
    const prefersContrast = window.matchMedia('(prefers-contrast: more)');
    setHighContrast(prefersContrast.matches);
    
    // Listen for changes in system preferences
    prefersReducedMotion.addEventListener('change', (e) => {
      setReducedMotion(e.matches);
    });
    
    prefersContrast.addEventListener('change', (e) => {
      setHighContrast(e.matches);
    });
  };
  
  // Apply preferences to document
  const applyPreferences = () => {
    // Apply high contrast
    if (highContrast) {
      document.documentElement.classList.add('high-contrast');
    } else {
      document.documentElement.classList.remove('high-contrast');
    }
    
    // Apply large text
    if (largeText) {
      document.documentElement.classList.add('large-text');
    } else {
      document.documentElement.classList.remove('large-text');
    }
    
    // Apply reduced motion
    if (reducedMotion) {
      document.documentElement.classList.add('reduced-motion');
    } else {
      document.documentElement.classList.remove('reduced-motion');
    }
    
    // Apply screen reader mode
    if (screenReaderMode) {
      document.documentElement.classList.add('screen-reader-mode');
    } else {
      document.documentElement.classList.remove('screen-reader-mode');
    }
  };
  
  // Toggle preferences
  const toggleHighContrast = () => setHighContrast(!highContrast);
  const toggleLargeText = () => setLargeText(!largeText);
  const toggleReducedMotion = () => setReducedMotion(!reducedMotion);
  const toggleScreenReaderMode = () => setScreenReaderMode(!screenReaderMode);
  
  // Reset preferences
  const resetPreferences = () => {
    setHighContrast(false);
    setLargeText(false);
    setReducedMotion(false);
    setScreenReaderMode(false);
  };
  
  const value = {
    highContrast,
    largeText,
    reducedMotion,
    screenReaderMode,
    toggleHighContrast,
    toggleLargeText,
    toggleReducedMotion,
    toggleScreenReaderMode,
    resetPreferences
  };
  
  return (
    <AccessibilityContext.Provider value={value}>
      {children}
    </AccessibilityContext.Provider>
  );
};

export default AccessibilityContext;
