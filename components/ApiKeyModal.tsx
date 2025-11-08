/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */
import React, { useState } from 'react';
import { KeyIcon } from './icons';

interface ApiKeyModalProps {
  onSave: (apiKey: string) => void;
  initialError?: string;
}

const ApiKeyModal: React.FC<ApiKeyModalProps> = ({ onSave, initialError }) => {
  const [apiKey, setApiKey] = useState('');
  const [error, setError] = useState(initialError);

  const handleSave = () => {
    if (!apiKey.trim()) {
      setError('Please enter a valid API key.');
      return;
    }
    setError('');
    onSave(apiKey);
  };

  return (
    <div className="fixed inset-0 bg-black/90 flex items-center justify-center z-50 p-4">
      <div className="bg-gray-800 border border-gray-700 rounded-2xl shadow-xl max-w-lg w-full p-8 text-center flex flex-col items-center">
        <div className="bg-indigo-600/20 p-4 rounded-full mb-6">
          <KeyIcon className="w-12 h-12 text-indigo-400" />
        </div>
        <h2 className="text-3xl font-bold text-white mb-4">Gemini API Key Required</h2>
        <p className="text-gray-300 mb-6">
          Please enter your Google Gemini API key to use SHΞNano Benana 🍌 ™. Your key will be stored locally in your browser.
        </p>
        <div className="w-full space-y-2">
            <input
                type="password"
                value={apiKey}
                onChange={(e) => {
                  setApiKey(e.target.value);
                  setError(''); // Clear error on typing
                }}
                onKeyDown={(e) => e.key === 'Enter' && handleSave()}
                placeholder="Enter your Gemini API Key"
                className="w-full bg-gray-900 border border-gray-600 text-white rounded-md px-4 py-3 text-center focus:outline-none focus:ring-2 focus:ring-indigo-500"
                aria-label="Gemini API Key"
            />
            {error && <p className="text-red-400 text-sm">{error}</p>}
        </div>
        <p className="text-gray-400 my-6 text-sm">
          You can get your API key from{' '}
          <a
            href="https://aistudio.google.com/app/apikey"
            target="_blank"
            rel="noopener noreferrer"
            className="text-indigo-400 hover:underline font-medium"
          >
            Google AI Studio
          </a>.
        </p>
        <button
          onClick={handleSave}
          disabled={!apiKey.trim()}
          className="w-full px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-lg transition-colors text-lg disabled:bg-gray-600 disabled:cursor-not-allowed"
        >
          Save and Continue
        </button>
      </div>
    </div>
  );
};

export default ApiKeyModal;
