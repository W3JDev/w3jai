import { useState, useEffect } from 'react';
import userService from '../../services/userService';
import { Settings, Save } from 'lucide-react';

const UserPreferences = ({ user, onUpdate }) => {
  const [preferences, setPreferences] = useState({
    theme: 'dark',
    defaultProvider: 'openai',
    defaultModel: 'gpt-4o',
    systemPrompt: 'You are Smith, a helpful AI assistant engaging in natural conversation. Keep responses concise and engaging.',
    enableVoice: true,
    enableWebSearch: false
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  useEffect(() => {
    if (user?.id) {
      loadUserPreferences();
    }
  }, [user]);

  const loadUserPreferences = async () => {
    setLoading(true);
    try {
      const { data, error } = await userService.getUserPreferences(user.id);
      if (error) throw error;
      
      if (data?.preferences) {
        setPreferences({
          ...preferences,
          ...data.preferences
        });
      }
    } catch (err) {
      console.error('Error loading user preferences:', err);
      setError('Failed to load preferences');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError(null);
    setSuccess(null);
    
    try {
      const { error } = await userService.updatePreferences(user.id, preferences);
      if (error) throw error;
      
      setSuccess('Preferences saved successfully');
      
      if (onUpdate) {
        onUpdate(preferences);
      }
    } catch (err) {
      console.error('Error saving preferences:', err);
      setError('Failed to save preferences');
    } finally {
      setSaving(false);
    }
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setPreferences({
      ...preferences,
      [name]: type === 'checkbox' ? checked : value
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
          <div className="h-10 bg-gray-700/50 rounded w-1/4"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 bg-gray-800/70 rounded-xl shadow-lg backdrop-blur-sm border border-gray-700/50">
      <h2 className="text-xl font-semibold text-white mb-6 flex items-center gap-2">
        <Settings className="h-5 w-5 text-purple-400" />
        User Preferences
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
      
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="theme" className="block text-sm font-medium text-gray-300 mb-1">
            Theme
          </label>
          <select
            id="theme"
            name="theme"
            value={preferences.theme}
            onChange={handleChange}
            className="w-full p-3 rounded-lg bg-gray-700/90 text-white border border-gray-600/50 focus:border-purple-500 focus:ring-2 focus:ring-purple-500/30 focus:outline-none transition-all duration-200"
          >
            <option value="dark">Dark</option>
            <option value="light">Light</option>
            <option value="system">System</option>
          </select>
        </div>
        
        <div>
          <label htmlFor="defaultProvider" className="block text-sm font-medium text-gray-300 mb-1">
            Default AI Provider
          </label>
          <select
            id="defaultProvider"
            name="defaultProvider"
            value={preferences.defaultProvider}
            onChange={handleChange}
            className="w-full p-3 rounded-lg bg-gray-700/90 text-white border border-gray-600/50 focus:border-purple-500 focus:ring-2 focus:ring-purple-500/30 focus:outline-none transition-all duration-200"
          >
            <option value="openai">OpenAI</option>
            <option value="anthropic">Anthropic</option>
            <option value="groq">Groq</option>
            <option value="deepseek">Deepseek</option>
            <option value="huggingface">Hugging Face</option>
            <option value="openrouter">OpenRouter</option>
          </select>
        </div>
        
        <div>
          <label htmlFor="defaultModel" className="block text-sm font-medium text-gray-300 mb-1">
            Default Model
          </label>
          <select
            id="defaultModel"
            name="defaultModel"
            value={preferences.defaultModel}
            onChange={handleChange}
            className="w-full p-3 rounded-lg bg-gray-700/90 text-white border border-gray-600/50 focus:border-purple-500 focus:ring-2 focus:ring-purple-500/30 focus:outline-none transition-all duration-200"
          >
            <option value="gpt-4o">GPT-4o (OpenAI)</option>
            <option value="gpt-4-turbo">GPT-4 Turbo (OpenAI)</option>
            <option value="gpt-3.5-turbo">GPT-3.5 Turbo (OpenAI)</option>
            <option value="claude-3-opus">Claude 3 Opus (Anthropic)</option>
            <option value="claude-3-sonnet">Claude 3 Sonnet (Anthropic)</option>
            <option value="claude-3-haiku">Claude 3 Haiku (Anthropic)</option>
            <option value="llama3-70b">Llama 3 70B (Groq)</option>
            <option value="llama3-8b">Llama 3 8B (Groq)</option>
            <option value="deepseek-coder">Deepseek Coder</option>
            <option value="mixtral-8x7b">Mixtral 8x7B (Hugging Face)</option>
          </select>
        </div>
        
        <div>
          <label htmlFor="systemPrompt" className="block text-sm font-medium text-gray-300 mb-1">
            Default System Prompt
          </label>
          <textarea
            id="systemPrompt"
            name="systemPrompt"
            value={preferences.systemPrompt}
            onChange={handleChange}
            rows={3}
            className="w-full p-3 rounded-lg bg-gray-700/90 text-white border border-gray-600/50 focus:border-purple-500 focus:ring-2 focus:ring-purple-500/30 focus:outline-none transition-all duration-200"
            placeholder="Enter default system prompt"
          />
        </div>
        
        <div className="flex items-center">
          <input
            type="checkbox"
            id="enableVoice"
            name="enableVoice"
            checked={preferences.enableVoice}
            onChange={handleChange}
            className="h-4 w-4 rounded border-gray-600 text-purple-600 focus:ring-purple-500 bg-gray-700"
          />
          <label htmlFor="enableVoice" className="ml-2 text-sm text-gray-300">
            Enable voice input/output
          </label>
        </div>
        
        <div className="flex items-center">
          <input
            type="checkbox"
            id="enableWebSearch"
            name="enableWebSearch"
            checked={preferences.enableWebSearch}
            onChange={handleChange}
            className="h-4 w-4 rounded border-gray-600 text-purple-600 focus:ring-purple-500 bg-gray-700"
          />
          <label htmlFor="enableWebSearch" className="ml-2 text-sm text-gray-300">
            Enable web search
          </label>
        </div>
        
        <button
          type="submit"
          disabled={saving}
          className={`px-4 py-2 rounded-lg bg-purple-600 text-white font-medium transition-all duration-200 flex items-center gap-2 ${
            saving ? 'opacity-70 cursor-not-allowed' : 'hover:bg-purple-700'
          }`}
        >
          <Save className="h-4 w-4" />
          {saving ? 'Saving...' : 'Save Preferences'}
        </button>
      </form>
    </div>
  );
};

export default UserPreferences;
