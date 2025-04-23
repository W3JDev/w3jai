import { useState } from 'react';
import BraveSearchTest from './components/BraveSearchTest';

function TestApp() {
  const [activeTest, setActiveTest] = useState('brave-search');

  return (
    <div className="min-h-screen bg-gray-900 text-white p-4">
      <header className="mb-8">
        <h1 className="text-2xl font-bold mb-4">W3J Assistant Test Suite</h1>
        <div className="flex gap-2">
          <button
            onClick={() => setActiveTest('brave-search')}
            className={`px-4 py-2 rounded ${
              activeTest === 'brave-search'
                ? 'bg-blue-600'
                : 'bg-gray-700 hover:bg-gray-600'
            }`}
          >
            Brave Search Test
          </button>
          {/* Add more test buttons here as needed */}
        </div>
      </header>

      <main>
        {activeTest === 'brave-search' && <BraveSearchTest />}
        {/* Add more test components here as needed */}
      </main>
    </div>
  );
}

export default TestApp;
