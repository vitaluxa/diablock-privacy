import React, { useState } from 'react';

export function ApiKeySetup({ onApiKeySet }) {
  const [apiKey, setApiKey] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!apiKey.trim()) {
      setError('Please enter an API key');
      return;
    }
    onApiKeySet(apiKey.trim());
  };

  return (
    <div className="min-h-screen bg-gray-900 flex items-center justify-center p-4">
      <div className="bg-gray-800 rounded-2xl p-8 max-w-md w-full border border-gray-700 shadow-2xl">
        <div className="text-center mb-6">
          <h1 className="text-4xl font-bold text-white mb-2">Dia Block</h1>
          <p className="text-gray-400">AI-Powered Puzzle Game</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-gray-300 text-sm font-medium mb-2">
              Google AI API Key
            </label>
            <input
              type="password"
              value={apiKey}
              onChange={(e) => {
                setApiKey(e.target.value);
                setError('');
              }}
              placeholder="Enter your API key"
              className="w-full px-4 py-3 bg-gray-900 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-blue-500 transition-colors"
            />
            {error && (
              <p className="text-red-400 text-sm mt-2">{error}</p>
            )}
          </div>

          <button
            type="submit"
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-6 rounded-lg transition-colors"
          >
            Start Playing
          </button>
        </form>

        <div className="mt-6 text-center">
          <p className="text-gray-500 text-xs">
            Don't have an API key?{' '}
            <a
              href="https://makersuite.google.com/app/apikey"
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-400 hover:text-blue-300 underline"
            >
              Get one here
            </a>
          </p>
        </div>

        <div className="mt-6 bg-gray-900 rounded-lg p-4 border border-gray-700">
          <h3 className="text-white font-semibold mb-2 text-sm">How to Play:</h3>
          <ul className="text-gray-400 text-xs space-y-1">
            <li>• Drag blocks horizontally or vertically</li>
            <li>• Move the red block to the exit on the right</li>
            <li>• Blocks cannot pass through each other</li>
            <li>• Complete puzzles quickly for higher scores</li>
          </ul>
        </div>
      </div>
    </div>
  );
}

