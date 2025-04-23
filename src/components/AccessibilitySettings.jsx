import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useAccessibility } from '../contexts/AccessibilityContext';
import { Check, Info } from 'lucide-react';

const AccessibilitySettings = () => {
  const { t } = useTranslation();
  const {
    highContrast,
    largeText,
    reducedMotion,
    screenReaderMode,
    toggleHighContrast,
    toggleLargeText,
    toggleReducedMotion,
    toggleScreenReaderMode,
    resetToDefaults
  } = useAccessibility();

  const [showKeyboardShortcuts, setShowKeyboardShortcuts] = useState(false);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e) => {
      // Only apply shortcuts when Alt key is pressed
      if (!e.altKey) return;

      switch (e.key) {
        case 'c':
          toggleHighContrast();
          break;
        case 't':
          toggleLargeText();
          break;
        case 'm':
          toggleReducedMotion();
          break;
        case 's':
          toggleScreenReaderMode();
          break;
        default:
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [toggleHighContrast, toggleLargeText, toggleReducedMotion, toggleScreenReaderMode]);

  return (
    <div className="max-w-3xl mx-auto p-4">
      <h2 className="text-2xl font-bold mb-6">{t('accessibility.title')}</h2>
      
      <div className="space-y-6">
        {/* High Contrast */}
        <div className="bg-gray-800 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-medium">{t('accessibility.highContrast')}</h3>
              <p className="text-gray-400 text-sm mt-1">{t('accessibility.highContrastDesc')}</p>
            </div>
            <button
              onClick={toggleHighContrast}
              className={`w-12 h-6 rounded-full p-1 transition-colors ${
                highContrast ? 'bg-blue-600' : 'bg-gray-600'
              }`}
              aria-pressed={highContrast}
            >
              <span
                className={`block w-4 h-4 rounded-full transition-transform ${
                  highContrast ? 'bg-white translate-x-6' : 'bg-gray-300 translate-x-0'
                }`}
              />
            </button>
          </div>
          <div className="mt-2 text-xs text-gray-500">
            {t('accessibility.keyboardShortcuts')}: Alt + C
          </div>
        </div>

        {/* Large Text */}
        <div className="bg-gray-800 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-medium">{t('accessibility.largeText')}</h3>
              <p className="text-gray-400 text-sm mt-1">{t('accessibility.largeTextDesc')}</p>
            </div>
            <button
              onClick={toggleLargeText}
              className={`w-12 h-6 rounded-full p-1 transition-colors ${
                largeText ? 'bg-blue-600' : 'bg-gray-600'
              }`}
              aria-pressed={largeText}
            >
              <span
                className={`block w-4 h-4 rounded-full transition-transform ${
                  largeText ? 'bg-white translate-x-6' : 'bg-gray-300 translate-x-0'
                }`}
              />
            </button>
          </div>
          <div className="mt-2 text-xs text-gray-500">
            {t('accessibility.keyboardShortcuts')}: Alt + T
          </div>
        </div>

        {/* Reduced Motion */}
        <div className="bg-gray-800 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-medium">{t('accessibility.reducedMotion')}</h3>
              <p className="text-gray-400 text-sm mt-1">{t('accessibility.reducedMotionDesc')}</p>
            </div>
            <button
              onClick={toggleReducedMotion}
              className={`w-12 h-6 rounded-full p-1 transition-colors ${
                reducedMotion ? 'bg-blue-600' : 'bg-gray-600'
              }`}
              aria-pressed={reducedMotion}
            >
              <span
                className={`block w-4 h-4 rounded-full transition-transform ${
                  reducedMotion ? 'bg-white translate-x-6' : 'bg-gray-300 translate-x-0'
                }`}
              />
            </button>
          </div>
          <div className="mt-2 text-xs text-gray-500">
            {t('accessibility.keyboardShortcuts')}: Alt + M
          </div>
        </div>

        {/* Screen Reader Mode */}
        <div className="bg-gray-800 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-medium">{t('accessibility.screenReaderMode')}</h3>
              <p className="text-gray-400 text-sm mt-1">{t('accessibility.screenReaderModeDesc')}</p>
            </div>
            <button
              onClick={toggleScreenReaderMode}
              className={`w-12 h-6 rounded-full p-1 transition-colors ${
                screenReaderMode ? 'bg-blue-600' : 'bg-gray-600'
              }`}
              aria-pressed={screenReaderMode}
            >
              <span
                className={`block w-4 h-4 rounded-full transition-transform ${
                  screenReaderMode ? 'bg-white translate-x-6' : 'bg-gray-300 translate-x-0'
                }`}
              />
            </button>
          </div>
          <div className="mt-2 text-xs text-gray-500">
            {t('accessibility.keyboardShortcuts')}: Alt + S
          </div>
        </div>

        {/* Keyboard Shortcuts */}
        <div className="bg-gray-800 rounded-lg p-4">
          <button
            onClick={() => setShowKeyboardShortcuts(!showKeyboardShortcuts)}
            className="flex items-center justify-between w-full"
          >
            <h3 className="text-lg font-medium">{t('accessibility.keyboardShortcuts')}</h3>
            <span className="text-gray-400">
              {showKeyboardShortcuts ? '−' : '+'}
            </span>
          </button>
          
          {showKeyboardShortcuts && (
            <div className="mt-4 space-y-2 text-sm">
              <div className="flex justify-between">
                <span>Alt + C</span>
                <span>{t('accessibility.toggleHighContrast')}</span>
              </div>
              <div className="flex justify-between">
                <span>Alt + T</span>
                <span>{t('accessibility.toggleLargeText')}</span>
              </div>
              <div className="flex justify-between">
                <span>Alt + M</span>
                <span>{t('accessibility.toggleReducedMotion')}</span>
              </div>
              <div className="flex justify-between">
                <span>Alt + S</span>
                <span>{t('accessibility.toggleScreenReaderMode')}</span>
              </div>
              <div className="flex justify-between">
                <span>Tab</span>
                <span>Navigate through interactive elements</span>
              </div>
              <div className="flex justify-between">
                <span>Shift + Tab</span>
                <span>Navigate backwards</span>
              </div>
              <div className="flex justify-between">
                <span>Enter</span>
                <span>Activate buttons or links</span>
              </div>
              <div className="flex justify-between">
                <span>Esc</span>
                <span>Close dialogs or menus</span>
              </div>
            </div>
          )}
        </div>

        {/* Reset to Defaults */}
        <div className="flex justify-center mt-8">
          <button
            onClick={resetToDefaults}
            className="px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded-lg transition-colors"
          >
            {t('accessibility.resetToDefaults')}
          </button>
        </div>
      </div>
    </div>
  );
};

export default AccessibilitySettings;
