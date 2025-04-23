import { useState } from 'react';
import testBraveSearchIntegration from '../utils/testBraveSearchIntegration';

const BraveSearchTest = () => {
  const [apiKey, setApiKey] = useState('');
  const [query, setQuery] = useState('latest news about MCP');
  const [results, setResults] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleTest = async () => {
    if (!apiKey) {
      setError('Please enter a Brave Search API key');
      return;
    }

    setLoading(true);
    setError(null);
    setResults(null);

    try {
      console.log(`Starting Brave Search test with API key: ${apiKey.substring(0, 5)}... and query: "${query}"`);
      const testResults = await testBraveSearchIntegration(apiKey, query);

      if (testResults.success) {
        console.log('Test successful:', testResults);
        setResults(testResults);
      } else {
        console.error('Test failed:', testResults.error);
        setError(testResults.error || 'Test failed');
      }
    } catch (err) {
      console.error('Test error:', err);
      setError(err.message || 'An unexpected error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-4 bg-gray-800 rounded-lg shadow-lg max-w-2xl mx-auto">
      <h2 className="text-xl font-bold text-white mb-4">Brave Search Integration Test</h2>

      <div className="mb-4">
        <label htmlFor="api-key" className="block text-gray-300 mb-2">
          Brave Search API Key:
        </label>
        <input
          type="password"
          id="api-key"
          value={apiKey}
          onChange={(e) => setApiKey(e.target.value)}
          className="w-full p-2 rounded bg-gray-700 text-white border border-gray-600"
          placeholder="Enter your Brave Search API key"
        />
      </div>

      <div className="mb-4">
        <label htmlFor="query" className="block text-gray-300 mb-2">
          Search Query:
        </label>
        <input
          type="text"
          id="query"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="w-full p-2 rounded bg-gray-700 text-white border border-gray-600"
          placeholder="Enter search query"
        />
      </div>

      <button
        onClick={handleTest}
        disabled={loading}
        className={`px-4 py-2 rounded ${
          loading
            ? 'bg-gray-500 cursor-not-allowed'
            : 'bg-blue-600 hover:bg-blue-700'
        } text-white`}
      >
        {loading ? 'Testing...' : 'Test Brave Search'}
      </button>

      {error && (
        <div className="mt-4 p-3 bg-red-500/20 border border-red-500/50 text-red-100 rounded">
          <strong>Error:</strong> {error}
        </div>
      )}

      {results && (
        <div className="mt-4">
          <h3 className="text-lg font-semibold text-white mb-2">Test Results:</h3>

          <div className="bg-gray-700 p-3 rounded mb-4">
            <p className="text-green-400 font-semibold">✓ Brave Search integration test passed!</p>
            <p className="text-gray-300">Found {results.results.length} results for "{query}"</p>
          </div>

          <div className="bg-gray-700 p-3 rounded">
            <h4 className="text-md font-semibold text-white mb-2">Markdown Output:</h4>
            <pre className="whitespace-pre-wrap text-gray-300 text-sm overflow-auto max-h-60">
              {results.markdown}
            </pre>
          </div>

          <div className="mt-4 bg-gray-700 p-3 rounded">
            <h4 className="text-md font-semibold text-white mb-2">Raw Results:</h4>
            <pre className="whitespace-pre-wrap text-gray-300 text-sm overflow-auto max-h-60">
              {JSON.stringify(results.results, null, 2)}
            </pre>
          </div>
        </div>
      )}
    </div>
  );
};

export default BraveSearchTest;
