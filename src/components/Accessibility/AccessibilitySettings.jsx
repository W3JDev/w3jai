import { useAccessibility } from '../../contexts/AccessibilityContext';
import { Eye, Type, Zap, Volume2, RotateCcw } from 'lucide-react';

const AccessibilitySettings = () => {
  const {
    highContrast,
    largeText,
    reducedMotion,
    screenReaderMode,
    toggleHighContrast,
    toggleLargeText,
    toggleReducedMotion,
    toggleScreenReaderMode,
    resetPreferences
  } = useAccessibility();

  return (
    <div className="p-6 bg-gray-800/70 rounded-xl shadow-lg backdrop-blur-sm border border-gray-700/50">
      <h2 className="text-xl font-semibold text-white mb-6 flex items-center gap-2">
        <Eye className="h-5 w-5 text-blue-400" />
        Accessibility Settings
      </h2>
      
      <div className="space-y-6">
        <div className="flex items-center justify-between p-4 bg-gray-700/50 rounded-lg border border-gray-600/30">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-500/20 rounded-lg">
              <Eye className="h-5 w-5 text-blue-400" />
            </div>
            <div>
              <h3 className="text-white font-medium">High Contrast</h3>
              <p className="text-gray-400 text-sm">Increase contrast for better visibility</p>
            </div>
          </div>
          
          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              className="sr-only peer"
              checked={highContrast}
              onChange={toggleHighContrast}
              aria-label="Toggle high contrast mode"
            />
            <div className="w-11 h-6 bg-gray-600 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-blue-500 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
          </label>
        </div>
        
        <div className="flex items-center justify-between p-4 bg-gray-700/50 rounded-lg border border-gray-600/30">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-purple-500/20 rounded-lg">
              <Type className="h-5 w-5 text-purple-400" />
            </div>
            <div>
              <h3 className="text-white font-medium">Large Text</h3>
              <p className="text-gray-400 text-sm">Increase text size for better readability</p>
            </div>
          </div>
          
          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              className="sr-only peer"
              checked={largeText}
              onChange={toggleLargeText}
              aria-label="Toggle large text mode"
            />
            <div className="w-11 h-6 bg-gray-600 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-purple-500 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-purple-600"></div>
          </label>
        </div>
        
        <div className="flex items-center justify-between p-4 bg-gray-700/50 rounded-lg border border-gray-600/30">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-yellow-500/20 rounded-lg">
              <Zap className="h-5 w-5 text-yellow-400" />
            </div>
            <div>
              <h3 className="text-white font-medium">Reduced Motion</h3>
              <p className="text-gray-400 text-sm">Minimize animations and transitions</p>
            </div>
          </div>
          
          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              className="sr-only peer"
              checked={reducedMotion}
              onChange={toggleReducedMotion}
              aria-label="Toggle reduced motion mode"
            />
            <div className="w-11 h-6 bg-gray-600 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-yellow-500 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-yellow-600"></div>
          </label>
        </div>
        
        <div className="flex items-center justify-between p-4 bg-gray-700/50 rounded-lg border border-gray-600/30">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-green-500/20 rounded-lg">
              <Volume2 className="h-5 w-5 text-green-400" />
            </div>
            <div>
              <h3 className="text-white font-medium">Screen Reader Mode</h3>
              <p className="text-gray-400 text-sm">Optimize for screen readers</p>
            </div>
          </div>
          
          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              className="sr-only peer"
              checked={screenReaderMode}
              onChange={toggleScreenReaderMode}
              aria-label="Toggle screen reader mode"
            />
            <div className="w-11 h-6 bg-gray-600 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-green-500 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-green-600"></div>
          </label>
        </div>
        
        <button
          onClick={resetPreferences}
          className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition-colors"
          aria-label="Reset accessibility preferences"
        >
          <RotateCcw className="h-4 w-4" />
          Reset to Defaults
        </button>
      </div>
      
      <div className="mt-6 p-4 bg-blue-500/10 border border-blue-500/30 rounded-lg">
        <h3 className="text-blue-300 font-medium mb-2">Keyboard Shortcuts</h3>
        <ul className="space-y-2 text-gray-300 text-sm">
          <li className="flex justify-between">
            <span>Toggle high contrast:</span>
            <kbd className="px-2 py-1 bg-gray-700 rounded text-xs">Alt + C</kbd>
          </li>
          <li className="flex justify-between">
            <span>Toggle large text:</span>
            <kbd className="px-2 py-1 bg-gray-700 rounded text-xs">Alt + T</kbd>
          </li>
          <li className="flex justify-between">
            <span>Toggle reduced motion:</span>
            <kbd className="px-2 py-1 bg-gray-700 rounded text-xs">Alt + M</kbd>
          </li>
          <li className="flex justify-between">
            <span>Toggle screen reader mode:</span>
            <kbd className="px-2 py-1 bg-gray-700 rounded text-xs">Alt + S</kbd>
          </li>
        </ul>
      </div>
    </div>
  );
};

export default AccessibilitySettings;
