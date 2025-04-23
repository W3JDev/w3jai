import { useState, useEffect } from 'react';
import { getAvailableProviders, getDefaultModel } from '../config/providers';

const Settings = ({ 
  apiKey, 
  setApiKey, 
  elevenLabsKey, 
  setElevenLabsKey,
  selectedProvider,
  setSelectedProvider,
  selectedModel,
  setSelectedModel,
  systemPrompt,
  setSystemPrompt,
  braveApiKey,
  setBraveApiKey,
  webSearchEnabled,
  setWebSearchEnabled,
  mcpServerUrl,
  setMcpServerUrl,
  useMcpServer,
  setUseMcpServer,
  availableModels,
  setAvailableModels,
  onSave,
  onProviderChange
}) => {
  const [showAdvancedSettings, setShowAdvancedSettings] = useState(false);
  const providers = getAvailableProviders();

  return (
    <div className="mb-4 p-6 bg-gray-800/50 rounded-2xl backdrop-blur-sm border border-gray-700/50 animate-fadeIn shadow-lg">
      <h2 className="text-lg font-semibold text-white mb-4">API Settings</h2>
      <div className="space-y-4">
        <div className="space-y-2">
          <label htmlFor="provider-select" className="block text-sm font-medium text-gray-300">
            AI Provider
          </label>
          <select
            id="provider-select"
            name="provider-select"
            value={selectedProvider}
            onChange={(e) => onProviderChange(e.target.value)}
            className="w-full p-3 rounded-lg bg-gray-700 text-white border border-gray-600 focus:border-purple-500 focus:outline-none transition-all duration-200 hover-lift"
          >
            {providers.map(provider => (
              <option key={provider.id} value={provider.id}>{provider.name}</option>
            ))}
          </select>
        </div>

        <div className="space-y-2">
          <label htmlFor="api-key" className="block text-sm font-medium text-gray-300">
            API Key
          </label>
          <input
            type="password"
            id="api-key"
            name="api-key"
            placeholder={`Enter ${selectedProvider.charAt(0).toUpperCase() + selectedProvider.slice(1)} API Key (required)`}
            value={apiKey}
            onChange={(e) => setApiKey(e.target.value)}
            className="w-full p-3 rounded-lg bg-gray-700 text-white border border-gray-600 focus:border-purple-500 focus:outline-none transition-all duration-200 hover-lift"
          />
        </div>

        <div className="space-y-2">
          <label htmlFor="model-select" className="block text-sm font-medium text-gray-300">
            Model
          </label>
          <select
            id="model-select"
            name="model-select"
            value={selectedModel}
            onChange={(e) => setSelectedModel(e.target.value)}
            className="w-full p-3 rounded-lg bg-gray-700 text-white border border-gray-600 focus:border-purple-500 focus:outline-none transition-all duration-200 hover-lift"
          >
            {availableModels.map(model => (
              <option key={model.id} value={model.id}>{model.name}</option>
            ))}
          </select>
        </div>

        <div className="space-y-2">
          <label htmlFor="elevenlabs-key" className="block text-sm font-medium text-gray-300">
            ElevenLabs API Key (optional for voice responses)
          </label>
          <input
            type="password"
            id="elevenlabs-key"
            name="elevenlabs-key"
            placeholder="Enter ElevenLabs API Key"
            value={elevenLabsKey}
            onChange={(e) => setElevenLabsKey(e.target.value)}
            className="w-full p-3 rounded-lg bg-gray-700 text-white border border-gray-600 focus:border-purple-500 focus:outline-none transition-all duration-200 hover-lift"
          />
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <label htmlFor="system-prompt" className="block text-sm font-medium text-gray-300">
              System Prompt
            </label>
            <button
              type="button"
              onClick={() => setShowAdvancedSettings(!showAdvancedSettings)}
              className="text-xs text-purple-400 hover:text-purple-300"
            >
              {showAdvancedSettings ? 'Hide Advanced Settings' : 'Show Advanced Settings'}
            </button>
          </div>
          <textarea
            id="system-prompt"
            name="system-prompt"
            placeholder="Enter system prompt for the AI"
            value={systemPrompt}
            onChange={(e) => setSystemPrompt(e.target.value)}
            rows={3}
            className="w-full p-3 rounded-lg bg-gray-700 text-white border border-gray-600 focus:border-purple-500 focus:outline-none transition-all duration-200 hover-lift"
          />
        </div>

        {showAdvancedSettings && (
          <>
            <div className="space-y-2">
              <label htmlFor="brave-api-key" className="block text-sm font-medium text-gray-300">
                Brave Search API Key (for web search)
              </label>
              <input
                type="password"
                id="brave-api-key"
                name="brave-api-key"
                placeholder="Enter Brave Search API Key"
                value={braveApiKey}
                onChange={(e) => setBraveApiKey(e.target.value)}
                className="w-full p-3 rounded-lg bg-gray-700 text-white border border-gray-600 focus:border-purple-500 focus:outline-none transition-all duration-200 hover-lift"
              />
            </div>

            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="web-search-enabled"
                name="web-search-enabled"
                checked={webSearchEnabled}
                onChange={(e) => setWebSearchEnabled(e.target.checked)}
                className="h-4 w-4 rounded border-gray-600 text-purple-600 focus:ring-purple-500 bg-gray-700"
              />
              <label htmlFor="web-search-enabled" className="text-sm font-medium text-gray-300">
                Enable Web Search
              </label>
            </div>

            <div className="space-y-2">
              <label htmlFor="mcp-server-url" className="block text-sm font-medium text-gray-300">
                MCP Server URL
              </label>
              <input
                type="text"
                id="mcp-server-url"
                name="mcp-server-url"
                placeholder="Enter MCP Server URL"
                value={mcpServerUrl}
                onChange={(e) => setMcpServerUrl(e.target.value)}
                className="w-full p-3 rounded-lg bg-gray-700 text-white border border-gray-600 focus:border-purple-500 focus:outline-none transition-all duration-200 hover-lift"
              />
            </div>

            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="use-mcp-server"
                name="use-mcp-server"
                checked={useMcpServer}
                onChange={(e) => setUseMcpServer(e.target.checked)}
                className="h-4 w-4 rounded border-gray-600 text-purple-600 focus:ring-purple-500 bg-gray-700"
              />
              <label htmlFor="use-mcp-server" className="text-sm font-medium text-gray-300">
                Use MCP Server
              </label>
            </div>
          </>
        )}

        <button
          type="button"
          onClick={onSave}
          className="w-full px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white rounded-lg transition-all duration-200 flex items-center justify-center gap-2 transform hover:scale-[1.02] shadow-lg hover-lift"
        >
          Save Settings
        </button>
      </div>
    </div>
  );
};

export default Settings;
