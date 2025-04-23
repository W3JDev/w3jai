/**
 * Utility for enhancing keyboard navigation accessibility
 */

/**
 * Initialize keyboard navigation enhancements
 */
export const initKeyboardNavigation = () => {
  // Add keyboard navigation class to body when using keyboard
  document.addEventListener('keydown', handleFirstTab);
  
  // Create keyboard focus indicator
  createFocusIndicator();
  
  // Add skip link
  addSkipLink();
  
  // Add keyboard shortcuts for accessibility features
  addAccessibilityShortcuts();
};

/**
 * Handle first tab press to enable keyboard navigation mode
 * @param {KeyboardEvent} e - The keyboard event
 */
const handleFirstTab = (e) => {
  if (e.key === 'Tab') {
    document.body.classList.add('keyboard-navigation');
    
    // Switch to tracking all keyboard events
    document.removeEventListener('keydown', handleFirstTab);
    document.addEventListener('keydown', handleKeyDown);
    document.addEventListener('mousedown', handleMouseDown);
  }
};

/**
 * Handle keyboard events
 * @param {KeyboardEvent} e - The keyboard event
 */
const handleKeyDown = (e) => {
  // Update focus indicator on tab
  if (e.key === 'Tab') {
    updateFocusIndicator();
  }
  
  // Handle Enter key on non-button/link elements
  if (e.key === 'Enter') {
    const activeElement = document.activeElement;
    if (
      activeElement.tagName !== 'A' && 
      activeElement.tagName !== 'BUTTON' && 
      activeElement.getAttribute('role') !== 'button'
    ) {
      if (activeElement.getAttribute('tabindex') === '0') {
        activeElement.click();
      }
    }
  }
};

/**
 * Handle mouse down to disable keyboard navigation mode
 */
const handleMouseDown = () => {
  document.body.classList.remove('keyboard-navigation');
};

/**
 * Create focus indicator element
 */
const createFocusIndicator = () => {
  const indicator = document.createElement('div');
  indicator.className = 'keyboard-focus-indicator';
  document.body.appendChild(indicator);
};

/**
 * Update focus indicator position
 */
const updateFocusIndicator = () => {
  setTimeout(() => {
    const focusedElement = document.activeElement;
    const indicator = document.querySelector('.keyboard-focus-indicator');
    
    if (focusedElement && indicator) {
      const rect = focusedElement.getBoundingClientRect();
      
      indicator.style.top = `${rect.top - 4}px`;
      indicator.style.left = `${rect.left - 4}px`;
      indicator.style.width = `${rect.width + 8}px`;
      indicator.style.height = `${rect.height + 8}px`;
    }
  }, 10);
};

/**
 * Add skip link to the page
 */
const addSkipLink = () => {
  // Check if skip link already exists
  if (document.querySelector('.skip-link')) {
    return;
  }
  
  const skipLink = document.createElement('a');
  skipLink.className = 'skip-link';
  skipLink.href = '#main-content';
  skipLink.textContent = 'Skip to main content';
  
  document.body.insertBefore(skipLink, document.body.firstChild);
  
  // Add id to main content if it doesn't exist
  const mainContent = document.querySelector('main') || document.querySelector('#root > div');
  if (mainContent && !mainContent.id) {
    mainContent.id = 'main-content';
  }
};

/**
 * Add keyboard shortcuts for accessibility features
 */
const addAccessibilityShortcuts = () => {
  document.addEventListener('keydown', (e) => {
    // Only handle Alt key combinations
    if (!e.altKey) return;
    
    switch (e.key.toLowerCase()) {
      case 'c': // Alt+C: Toggle high contrast
        document.dispatchEvent(new CustomEvent('accessibility:toggle-contrast'));
        e.preventDefault();
        break;
      case 't': // Alt+T: Toggle large text
        document.dispatchEvent(new CustomEvent('accessibility:toggle-text-size'));
        e.preventDefault();
        break;
      case 'm': // Alt+M: Toggle reduced motion
        document.dispatchEvent(new CustomEvent('accessibility:toggle-motion'));
        e.preventDefault();
        break;
      case 's': // Alt+S: Toggle screen reader mode
        document.dispatchEvent(new CustomEvent('accessibility:toggle-screen-reader'));
        e.preventDefault();
        break;
    }
  });
};
