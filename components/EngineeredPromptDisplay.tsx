/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */
import React, {useState} from 'react';
import {EngineeredPrompt} from '../types';
import {CopyIcon} from './icons';

interface EngineeredPromptDisplayProps {
  engineeredPrompt: EngineeredPrompt;
  onStartOver: () => void;
}

const EngineeredPromptDisplay: React.FC<EngineeredPromptDisplayProps> = ({
  engineeredPrompt,
  onStartOver,
}) => {
  const [copySuccess, setCopySuccess] = useState('');

  const copyToClipboard = (text: string) => {
    const textArea = document.createElement('textarea');
    textArea.value = text;
    textArea.style.position = 'fixed';
    textArea.style.left = '-9999px';
    document.body.appendChild(textArea);
    textArea.focus();
    textArea.select();
    try {
      document.execCommand('copy');
      setCopySuccess('Prompt copied successfully!');
      setTimeout(() => setCopySuccess(''), 2000);
    } catch (err) {
      setCopySuccess('Failed to copy.');
    }
    document.body.removeChild(textArea);
  };

  const {
    analysis_notes,
    target_model,
    professional_prompt,
    text_replication_instruction,
    negative_prompt,
  } = engineeredPrompt;

  const fullPromptToCopy = `
--- PROMPT ---
${professional_prompt}

--- TEXT REPLICATION (CRITICAL) ---
${text_replication_instruction}

--- NEGATIVE PROMPT ---
${negative_prompt}
`;

  return (
    <div className="bg-gray-800 p-4 rounded-lg shadow-inner mt-4 w-full">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold text-white">
          Step 1 Complete: Professional Prompt Ready!
        </h2>
        <button
          onClick={onStartOver}
          className="px-4 py-2 bg-gray-600 hover:bg-gray-700 text-sm rounded-lg transition-colors">
          Start Over
        </button>
      </div>

      <div className="mb-4">
        <h3 className="text-md font-semibold text-blue-300 mb-2">
          AI Analysis:
        </h3>
        <p
          className="text-sm text-gray-300 bg-gray-900 p-3 rounded-md italic"
          dir="rtl">
          {analysis_notes}
        </p>
      </div>

      <div className="mb-4">
        <button
          onClick={() => copyToClipboard(fullPromptToCopy)}
          className="w-full bg-green-600 text-white px-4 py-2 rounded-md font-medium hover:bg-green-700 flex items-center justify-center gap-2">
          <CopyIcon className="w-5 h-5" />
          Copy Full Generated Prompt
        </button>
        {copySuccess && (
          <p className="text-green-400 text-sm mt-2 text-center">
            {copySuccess}
          </p>
        )}
      </div>

      <div className="space-y-3">
        <details className="bg-gray-900 p-3 rounded-lg" open>
          <summary className="text-md font-semibold text-gray-300 cursor-pointer">
            Professional Prompt ({target_model})
          </summary>
          <pre className="text-sm text-gray-400 mt-2 p-2 bg-gray-950 rounded-md overflow-auto whitespace-pre-wrap font-mono">
            {professional_prompt}
          </pre>
        </details>

        <details className="bg-gray-900 p-3 rounded-lg" open>
          <summary className="text-md font-semibold text-yellow-300 cursor-pointer">
            (Critical) Text Replication Instruction
          </summary>
          <pre className="text-sm text-gray-400 mt-2 p-2 bg-gray-950 rounded-md overflow-auto whitespace-pre-wrap font-mono">
            {text_replication_instruction}
          </pre>
        </details>

        <details className="bg-gray-900 p-3 rounded-lg">
          <summary className="text-md font-semibold text-red-300 cursor-pointer">
            Negative Prompt
          </summary>
          <pre className="text-sm text-gray-400 mt-2 p-2 bg-gray-950 rounded-md overflow-auto whitespace-pre-wrap font-mono">
            {negative_prompt}
          </pre>
        </details>
      </div>
    </div>
  );
};

export default EngineeredPromptDisplay;
