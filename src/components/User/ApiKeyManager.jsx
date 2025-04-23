import { useState, useEffect } from 'react';
import userService from '../../services/userService';
import { Key, Save, Trash2, Eye, EyeOff, Shield, Info } from 'lucide-react';
import { useAdmin } from '../../contexts/AdminContext';

const ApiKeyManager = ({ user }) => {
  const { isAdmin } = useAdmin();
  const [apiKeys, setApiKeys] = useState({
    openai: '',
    anthropic: '',
    groq: '',
    deepseek: '',
    huggingface: '',
    openrouter: '',
    elevenlabs: '',
    brave: ''
  });

  const [useEnvKeys, setUseEnvKeys] = useState(false);
  const [envKeysAvailable, setEnvKeysAvailable] = useState({
    openai: false,
    anthropic: false,
    groq: false,
    elevenlabs: false,
    brave: false
  });

  const [visibleKeys, setVisibleKeys] = useState({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  useEffect(() => {
    if (user?.id) {
      loadApiKeys();
      checkEnvKeysAvailability();
      loadUserPreferences();
    }
  }, [user]);

  const loadApiKeys = async () => {
    setLoading(true);
    try {
      const { data, error } = await userService.getUserApiKeys(user.id);
      if (error) throw error;

      const keys = { ...apiKeys };
      data.forEach(item => {
        keys[item.provider] = item.api_key;
      });

      setApiKeys(keys);
    } catch (err) {
      console.error('Error loading API keys:', err);
      setError('Failed to load API keys');
    } finally {
      setLoading(false);
    }
  };

  const loadUserPreferences = async () => {
    try {
      const { data, error } = await userService.getUserPreferences(user.id);
      if (error) throw error;

      if (data?.preferences?.useEnvKeys !== undefined) {
        setUseEnvKeys(data.preferences.useEnvKeys);
      }
    } catch (err) {
      console.error('Error loading user preferences:', err);
    }
  };

  const checkEnvKeysAvailability = async () => {
    try {
      // First, check client-side env vars directly
      const clientSideAvailable = {
        openai: !!import.meta.env.VITE_OPENAI_API_KEY,
        anthropic: !!import.meta.env.VITE_ANTHROPIC_API_KEY,
        groq: !!import.meta.env.VITE_GROQ_API_KEY,
        elevenlabs: !!import.meta.env.VITE_ELEVENLABS_API_KEY,
        brave: !!import.meta.env.VITE_BRAVE_API_KEY
      };

      console.log('Client-side environment keys available:', clientSideAvailable);

      // If any client-side keys are available, use them
      if (Object.values(clientSideAvailable).some(val => val)) {
        setEnvKeysAvailable(clientSideAvailable);
        return;
      }

      // Otherwise, try the server endpoint
      try {
        const response = await fetch('/api/check-env-keys');
        if (response.ok) {
          const data = await response.json();
          console.log('Server-side environment keys available:', data);

          // Handle both old and new response formats
          if (data.viteKeys) {
            // New format with both viteKeys and nonViteKeys
            const combinedKeys = {
              openai: data.viteKeys.openai || data.nonViteKeys.openai,
              anthropic: data.viteKeys.anthropic || data.nonViteKeys.anthropic,
              groq: data.viteKeys.groq || data.nonViteKeys.groq,
              elevenlabs: data.viteKeys.elevenlabs || data.nonViteKeys.elevenlabs,
              brave: data.viteKeys.brave || data.nonViteKeys.brave
            };
            console.log('Combined environment keys:', combinedKeys);
            setEnvKeysAvailable(combinedKeys);
          } else {
            // Old format with just the keys
            setEnvKeysAvailable(data);
          }
          return;
        }
      } catch (serverErr) {
        console.error('Error checking server environment keys:', serverErr);
      }

      // If we get here, neither client nor server keys are available
      console.log('No environment keys available');
      setEnvKeysAvailable(clientSideAvailable);
    } catch (err) {
      console.error('Error in checkEnvKeysAvailability:', err);
      // Final fallback
      const available = {
        openai: false,
        anthropic: false,
        groq: false,
        elevenlabs: false,
        brave: false
      };
      setEnvKeysAvailable(available);
    }
  };

  const handleSaveKey = async (provider) => {
    setSaving(true);
    setError(null);
    setSuccess(null);

    try {
      const { error } = await userService.saveApiKey(user.id, provider, apiKeys[provider]);
      if (error) throw error;

      setSuccess(`${provider.charAt(0).toUpperCase() + provider.slice(1)} API key saved successfully`);

      // Hide the key after saving
      setVisibleKeys({
        ...visibleKeys,
        [provider]: false
      });
    } catch (err) {
      console.error('Error saving API key:', err);
      setError(`Failed to save ${provider} API key`);
    } finally {
      setSaving(false);
    }
  };

  const toggleUseEnvKeys = async () => {
    try {
      const newValue = !useEnvKeys;
      setUseEnvKeys(newValue);

      // Save the preference
      const { data: prefsData } = await userService.getUserPreferences(user.id);
      const currentPrefs = prefsData?.preferences || {};

      await userService.updatePreferences(user.id, {
        ...currentPrefs,
        useEnvKeys: newValue
      });

      setSuccess(`${newValue ? 'Now using' : 'No longer using'} environment API keys`);
    } catch (err) {
      console.error('Error toggling environment keys:', err);
      setError('Failed to update API key preferences');
      setUseEnvKeys(!useEnvKeys); // Revert the UI change
    }
  };

  const handleDeleteKey = async (provider) => {
    if (!confirm(`Are you sure you want to delete your ${provider} API key?`)) return;

    try {
      const { error } = await userService.deleteApiKey(user.id, provider);
      if (error) throw error;

      setApiKeys({
        ...apiKeys,
        [provider]: ''
      });

      setSuccess(`${provider.charAt(0).toUpperCase() + provider.slice(1)} API key deleted successfully`);
    } catch (err) {
      console.error('Error deleting API key:', err);
      setError(`Failed to delete ${provider} API key`);
    }
  };

  const toggleKeyVisibility = (provider) => {
    setVisibleKeys({
      ...visibleKeys,
      [provider]: !visibleKeys[provider]
    });
  };

  const handleChange = (provider, value) => {
    setApiKeys({
      ...apiKeys,
      [provider]: value
    });
  };

  if (loading) {
    return (
      <div className="p-6 bg-gray-800/70 rounded-xl shadow-lg backdrop-blur-sm border border-gray-700/50">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-700/50 rounded w-1/3"></div>
          <div className="h-12 bg-gray-700/50 rounded"></div>
          <div className="h-12 bg-gray-700/50 rounded"></div>
          <div className="h-12 bg-gray-700/50 rounded"></div>
        </div>
      </div>
    );
  }

  // Only show the most important providers to reduce clutter
  const providers = [
    { id: 'openai', name: 'OpenAI', envSupported: true },
    { id: 'anthropic', name: 'Anthropic', envSupported: true },
    { id: 'groq', name: 'Groq', envSupported: true },
    { id: 'elevenlabs', name: 'ElevenLabs', envSupported: true },
    { id: 'brave', name: 'Brave Search', envSupported: true }
  ];

  // Only show these if user expands the advanced section
  const advancedProviders = [
    { id: 'deepseek', name: 'Deepseek', envSupported: false },
    { id: 'huggingface', name: 'Hugging Face', envSupported: false },
    { id: 'openrouter', name: 'OpenRouter', envSupported: false }
  ];

  return (
    <div className="p-6 bg-gray-800/70 rounded-xl shadow-lg backdrop-blur-sm border border-gray-700/50">
      <h2 className="text-xl font-semibold text-white mb-6 flex items-center gap-2">
        <Key className="h-5 w-5 text-yellow-400" />
        API Keys
      </h2>

      {error && (
        <div className="mb-4 p-3 bg-red-500/20 border border-red-500/50 rounded-lg text-red-200 text-sm">
          {error}
        </div>
      )}

      {success && (
        <div className="mb-4 p-3 bg-green-500/20 border border-green-500/50 rounded-lg text-green-200 text-sm">
          {success}
        </div>
      )}

      <div className="space-y-4">
        {/* Environment API Keys Toggle */}
        <div className="mb-6 p-4 bg-blue-900/20 border border-blue-700/50 rounded-lg">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <Shield className="h-5 w-5 text-blue-400" />
              <h3 className="text-white font-medium">Use Environment API Keys</h3>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                className="sr-only peer"
                checked={useEnvKeys}
                onChange={toggleUseEnvKeys}
              />
              <div className="w-11 h-6 bg-gray-700 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-blue-500/30 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
            </label>
          </div>
          <p className="text-gray-300 text-sm">
            {useEnvKeys
              ? "Using environment API keys. You don't need to enter your own keys."
              : "Using your personal API keys. Toggle to use the application's environment keys instead."}
          </p>

          {/* Environment Keys Status */}
          {useEnvKeys && (
            <div className="mt-3 grid grid-cols-1 md:grid-cols-2 gap-2">
              {Object.entries(envKeysAvailable).map(([provider, available]) => (
                <div key={provider} className={`text-xs px-2 py-1 rounded flex items-center gap-1 ${available ? 'bg-green-900/30 text-green-300' : 'bg-red-900/30 text-red-300'}`}>
                  <span className={`w-2 h-2 rounded-full ${available ? 'bg-green-400' : 'bg-red-400'}`}></span>
                  {provider.charAt(0).toUpperCase() + provider.slice(1)}: {available ? 'Available' : 'Not available'}
                </div>
              ))}
            </div>
          )}
        </div>

        {isAdmin && (
          <div className="mb-6 p-4 bg-purple-900/20 border border-purple-700/50 rounded-lg">
            <div className="flex items-center gap-2 mb-2">
              <Shield className="h-5 w-5 text-purple-400" />
              <h3 className="text-white font-medium">Admin Access</h3>
            </div>
            <p className="text-gray-300 text-sm">
              You have admin access. Users with your authorized email domains can use the application's API keys.
            </p>
          </div>
        )}

        <p className="text-gray-300 text-sm mb-4">
          {useEnvKeys
            ? "The application is using environment API keys. You can still add your own keys as a backup."
            : "Your API keys are encrypted and stored securely. We never share your keys with third parties."}
        </p>

        {/* Only show API key inputs if not using env keys or if they're an admin */}
        {(!useEnvKeys || isAdmin) && providers.map(provider => (
          <div key={provider.id} className={`border border-gray-700 rounded-lg p-4 ${provider.envSupported && envKeysAvailable[provider.id] && useEnvKeys ? 'opacity-60' : ''}`}>
            <div className="flex justify-between items-center mb-2">
              <div className="flex items-center gap-2">
                <h3 className="text-white font-medium">{provider.name}</h3>
                {provider.envSupported && envKeysAvailable[provider.id] && useEnvKeys && (
                  <span className="text-xs px-2 py-0.5 bg-blue-500/20 text-blue-300 rounded-full">Using Env</span>
                )}
              </div>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => toggleKeyVisibility(provider.id)}
                  className="p-1 text-gray-400 hover:text-gray-300 transition-colors"
                  title={visibleKeys[provider.id] ? 'Hide API Key' : 'Show API Key'}
                >
                  {visibleKeys[provider.id] ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
                {apiKeys[provider.id] && (
                  <button
                    type="button"
                    onClick={() => handleDeleteKey(provider.id)}
                    className="p-1 text-gray-400 hover:text-red-400 transition-colors"
                    title="Delete API Key"
                  >
                    <Trash2 size={16} />
                  </button>
                )}
              </div>
            </div>

            <div className="flex gap-2">
              <input
                type={visibleKeys[provider.id] ? 'text' : 'password'}
                value={apiKeys[provider.id] || ''}
                onChange={(e) => handleChange(provider.id, e.target.value)}
                placeholder={`Enter ${provider.name} API Key`}
                className="flex-1 p-2 rounded-l-lg bg-gray-700/90 text-white border border-gray-600/50 focus:border-yellow-500 focus:ring-2 focus:ring-yellow-500/30 focus:outline-none transition-all duration-200"
              />
              <button
                type="button"
                onClick={() => handleSaveKey(provider.id)}
                disabled={saving || !apiKeys[provider.id]}
                className={`px-3 py-2 rounded-r-lg bg-yellow-600 text-white font-medium transition-all duration-200 flex items-center gap-1 ${
                  saving || !apiKeys[provider.id] ? 'opacity-50 cursor-not-allowed' : 'hover:bg-yellow-700'
                }`}
              >
                <Save size={16} />
                Save
              </button>
            </div>

            {provider.envSupported && envKeysAvailable[provider.id] && useEnvKeys && (
              <div className="mt-2 text-xs text-blue-300 flex items-center gap-1">
                <Info size={12} />
                <span>Using environment API key. Your personal key will be used as fallback.</span>
              </div>
            )}
          </div>
        ))}

        {/* Show message if using env keys and not admin */}
        {useEnvKeys && !isAdmin && (
          <div className="p-4 bg-gray-700/50 rounded-lg text-center">
            <p className="text-gray-300 text-sm">
              Using environment API keys. No need to enter your own keys.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ApiKeyManager;
