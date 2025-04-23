import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { Save, ArrowLeft, Eye, EyeOff } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import userService from '../services/userService';

const Settings = () => {
  const { user, preferences, updateUserPreferences } = useAuth();
  const navigate = useNavigate();
  const { t } = useTranslation();

  const [formData, setFormData] = useState({
    defaultProvider: 'openai',
    defaultModel: 'gpt-4o',
    defaultSystemPrompt: '',
    apiKeys: {
      openai: '',
      groq: '',
      anthropic: '',
      elevenlabs: '',
      brave: ''
    },
    webSearch: {
      enabled: false,
      useMcpServer: false,
      mcpServerUrl: ''
    }
  });

  const [showApiKeys, setShowApiKeys] = useState({
    openai: false,
    groq: false,
    anthropic: false,
    elevenlabs: false,
    brave: false
  });

  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  const [showAdvanced, setShowAdvanced] = useState(false);

  // Load user preferences
  useEffect(() => {
    if (preferences) {
      setFormData(prev => ({
        ...prev,
        defaultProvider: preferences.defaultProvider || prev.defaultProvider,
        defaultModel: preferences.defaultModel || prev.defaultModel,
        defaultSystemPrompt: preferences.defaultSystemPrompt || prev.defaultSystemPrompt,
        apiKeys: {
          ...prev.apiKeys,
          ...(preferences.apiKeys || {})
        },
        webSearch: {
          ...prev.webSearch,
          ...(preferences.webSearch || {})
        }
      }));
    }
  }, [preferences]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    
    if (name.startsWith('apiKeys.')) {
      const key = name.split('.')[1];
      setFormData(prev => ({
        ...prev,
        apiKeys: {
          ...prev.apiKeys,
          [key]: value
        }
      }));
    } else if (name.startsWith('webSearch.')) {
      const key = name.split('.')[1];
      setFormData(prev => ({
        ...prev,
        webSearch: {
          ...prev.webSearch,
          [key]: type === 'checkbox' ? checked : value
        }
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: type === 'checkbox' ? checked : value
      }));
    }
  };

  const toggleShowApiKey = (provider) => {
    setShowApiKeys(prev => ({
      ...prev,
      [provider]: !prev[provider]
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!user) {
      setError('You must be logged in to save settings');
      return;
    }
    
    setSaving(true);
    setError(null);
    setSuccess(false);
    
    try {
      const { data, error } = await userService.updateUserPreferences(user.id, formData);
      
      if (error) throw new Error(error.message);
      
      updateUserPreferences(formData);
      setSuccess(true);
      
      // Hide success message after 3 seconds
      setTimeout(() => setSuccess(false), 3000);
    } catch (err) {
      console.error('Error saving settings:', err);
      setError(err.message || 'Failed to save settings');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="container mx-auto max-w-4xl p-4">
      <div className="flex items-center mb-6">
        <button
          onClick={() => navigate(-1)}
          className="mr-4 p-2 rounded-full hover:bg-gray-700 transition-colors"
          aria-label="Go back"
        >
          <ArrowLeft size={20} />
        </button>
        <h1 className="text-2xl font-bold">{t('settings.title')}</h1>
      </div>

      {error && (
        <div className="mb-6 p-4 bg-red-500/20 border border-red-500/50 text-red-200 rounded-lg">
          {error}
        </div>
      )}

      {success && (
        <div className="mb-6 p-4 bg-green-500/20 border border-green-500/50 text-green-200 rounded-lg">
          {t('common.success')}! {t('settings.saveSettings')} {t('common.success').toLowerCase()}.
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-8">
        <div className="bg-gray-800 rounded-lg p-6 shadow-lg">
          <h2 className="text-xl font-semibold mb-4">{t('settings.apiSettings')}</h2>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2" htmlFor="defaultProvider">
                {t('settings.provider')}
              </label>
              <select
                id="defaultProvider"
                name="defaultProvider"
                value={formData.defaultProvider}
                onChange={handleChange}
                className="w-full p-3 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="openai">OpenAI</option>
                <option value="groq">GROQ</option>
                <option value="anthropic">Anthropic</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2" htmlFor="defaultModel">
                {t('settings.model')}
              </label>
              <select
                id="defaultModel"
                name="defaultModel"
                value={formData.defaultModel}
                onChange={handleChange}
                className="w-full p-3 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {formData.defaultProvider === 'openai' && (
                  <>
                    <option value="gpt-4o">GPT-4o</option>
                    <option value="gpt-4-turbo">GPT-4 Turbo</option>
                    <option value="gpt-3.5-turbo">GPT-3.5 Turbo</option>
                  </>
                )}
                {formData.defaultProvider === 'groq' && (
                  <>
                    <option value="llama3-70b-8192">Llama 3 70B</option>
                    <option value="llama3-8b-8192">Llama 3 8B</option>
                    <option value="mixtral-8x7b-32768">Mixtral 8x7B</option>
                  </>
                )}
                {formData.defaultProvider === 'anthropic' && (
                  <>
                    <option value="claude-3-opus-20240229">Claude 3 Opus</option>
                    <option value="claude-3-sonnet-20240229">Claude 3 Sonnet</option>
                    <option value="claude-3-haiku-20240307">Claude 3 Haiku</option>
                  </>
                )}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2" htmlFor="defaultSystemPrompt">
                {t('settings.systemPrompt')}
              </label>
              <textarea
                id="defaultSystemPrompt"
                name="defaultSystemPrompt"
                value={formData.defaultSystemPrompt}
                onChange={handleChange}
                rows={4}
                placeholder="You are a helpful AI assistant..."
                className="w-full p-3 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
              />
            </div>

            <div className="space-y-4">
              <div className="relative">
                <label className="block text-sm font-medium mb-2" htmlFor="apiKeys.openai">
                  OpenAI {t('settings.apiKey')}
                </label>
                <div className="flex">
                  <input
                    id="apiKeys.openai"
                    name="apiKeys.openai"
                    type={showApiKeys.openai ? 'text' : 'password'}
                    value={formData.apiKeys.openai}
                    onChange={handleChange}
                    placeholder="sk-..."
                    className="flex-1 p-3 bg-gray-700 border border-gray-600 rounded-l-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <button
                    type="button"
                    onClick={() => toggleShowApiKey('openai')}
                    className="p-3 bg-gray-700 border border-gray-600 border-l-0 rounded-r-lg text-gray-400 hover:text-white"
                  >
                    {showApiKeys.openai ? <EyeOff size={20} /> : <Eye size={20} />}
                  </button>
                </div>
              </div>

              <div className="relative">
                <label className="block text-sm font-medium mb-2" htmlFor="apiKeys.groq">
                  GROQ {t('settings.apiKey')}
                </label>
                <div className="flex">
                  <input
                    id="apiKeys.groq"
                    name="apiKeys.groq"
                    type={showApiKeys.groq ? 'text' : 'password'}
                    value={formData.apiKeys.groq}
                    onChange={handleChange}
                    placeholder="gsk_..."
                    className="flex-1 p-3 bg-gray-700 border border-gray-600 rounded-l-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <button
                    type="button"
                    onClick={() => toggleShowApiKey('groq')}
                    className="p-3 bg-gray-700 border border-gray-600 border-l-0 rounded-r-lg text-gray-400 hover:text-white"
                  >
                    {showApiKeys.groq ? <EyeOff size={20} /> : <Eye size={20} />}
                  </button>
                </div>
              </div>

              <div className="relative">
                <label className="block text-sm font-medium mb-2" htmlFor="apiKeys.anthropic">
                  Anthropic {t('settings.apiKey')}
                </label>
                <div className="flex">
                  <input
                    id="apiKeys.anthropic"
                    name="apiKeys.anthropic"
                    type={showApiKeys.anthropic ? 'text' : 'password'}
                    value={formData.apiKeys.anthropic}
                    onChange={handleChange}
                    placeholder="sk-ant-..."
                    className="flex-1 p-3 bg-gray-700 border border-gray-600 rounded-l-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <button
                    type="button"
                    onClick={() => toggleShowApiKey('anthropic')}
                    className="p-3 bg-gray-700 border border-gray-600 border-l-0 rounded-r-lg text-gray-400 hover:text-white"
                  >
                    {showApiKeys.anthropic ? <EyeOff size={20} /> : <Eye size={20} />}
                  </button>
                </div>
              </div>

              <div className="relative">
                <label className="block text-sm font-medium mb-2" htmlFor="apiKeys.elevenlabs">
                  {t('settings.elevenlabsKey')}
                </label>
                <div className="flex">
                  <input
                    id="apiKeys.elevenlabs"
                    name="apiKeys.elevenlabs"
                    type={showApiKeys.elevenlabs ? 'text' : 'password'}
                    value={formData.apiKeys.elevenlabs}
                    onChange={handleChange}
                    placeholder="..."
                    className="flex-1 p-3 bg-gray-700 border border-gray-600 rounded-l-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <button
                    type="button"
                    onClick={() => toggleShowApiKey('elevenlabs')}
                    className="p-3 bg-gray-700 border border-gray-600 border-l-0 rounded-r-lg text-gray-400 hover:text-white"
                  >
                    {showApiKeys.elevenlabs ? <EyeOff size={20} /> : <Eye size={20} />}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-gray-800 rounded-lg p-6 shadow-lg">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold">{t('settings.webSearch')}</h2>
            <button
              type="button"
              onClick={() => setShowAdvanced(!showAdvanced)}
              className="text-blue-400 hover:text-blue-300 text-sm"
            >
              {showAdvanced ? t('settings.hideAdvanced') : t('settings.showAdvanced')}
            </button>
          </div>
          
          <div className="space-y-4">
            <div className="flex items-center">
              <input
                id="webSearch.enabled"
                name="webSearch.enabled"
                type="checkbox"
                checked={formData.webSearch.enabled}
                onChange={handleChange}
                className="h-4 w-4 rounded border-gray-600 bg-gray-700 text-blue-500 focus:ring-blue-500 focus:ring-offset-gray-800"
              />
              <label htmlFor="webSearch.enabled" className="ml-2 text-sm font-medium">
                {t('settings.enableWebSearch')}
              </label>
            </div>

            {formData.webSearch.enabled && (
              <>
                <div className="relative">
                  <label className="block text-sm font-medium mb-2" htmlFor="apiKeys.brave">
                    {t('settings.braveApiKey')}
                  </label>
                  <div className="flex">
                    <input
                      id="apiKeys.brave"
                      name="apiKeys.brave"
                      type={showApiKeys.brave ? 'text' : 'password'}
                      value={formData.apiKeys.brave}
                      onChange={handleChange}
                      placeholder="..."
                      className="flex-1 p-3 bg-gray-700 border border-gray-600 rounded-l-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    <button
                      type="button"
                      onClick={() => toggleShowApiKey('brave')}
                      className="p-3 bg-gray-700 border border-gray-600 border-l-0 rounded-r-lg text-gray-400 hover:text-white"
                    >
                      {showApiKeys.brave ? <EyeOff size={20} /> : <Eye size={20} />}
                    </button>
                  </div>
                </div>

                {showAdvanced && (
                  <>
                    <div className="flex items-center">
                      <input
                        id="webSearch.useMcpServer"
                        name="webSearch.useMcpServer"
                        type="checkbox"
                        checked={formData.webSearch.useMcpServer}
                        onChange={handleChange}
                        className="h-4 w-4 rounded border-gray-600 bg-gray-700 text-blue-500 focus:ring-blue-500 focus:ring-offset-gray-800"
                      />
                      <label htmlFor="webSearch.useMcpServer" className="ml-2 text-sm font-medium">
                        {t('settings.useMcpServer')}
                      </label>
                    </div>

                    {formData.webSearch.useMcpServer && (
                      <div>
                        <label className="block text-sm font-medium mb-2" htmlFor="webSearch.mcpServerUrl">
                          {t('settings.mcpServerUrl')}
                        </label>
                        <input
                          id="webSearch.mcpServerUrl"
                          name="webSearch.mcpServerUrl"
                          type="text"
                          value={formData.webSearch.mcpServerUrl}
                          onChange={handleChange}
                          placeholder="http://localhost:3000"
                          className="w-full p-3 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      </div>
                    )}
                  </>
                )}
              </>
            )}
          </div>
        </div>

        <div className="flex justify-end">
          <button
            type="submit"
            disabled={saving}
            className="px-6 py-3 bg-blue-600 hover:bg-blue-700 rounded-lg text-white flex items-center gap-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {saving ? t('common.saving') : t('settings.saveSettings')}
            {!saving && <Save size={18} />}
          </button>
        </div>
      </form>
    </div>
  );
};

export default Settings;
