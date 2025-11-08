/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/
import React, { useState, useEffect } from 'react';

const loadingMessages = [
  "Warming up the digital canvas...",
  "Gathering pixels and photons...",
  "Sketching your vision...",
  "Consulting with the AI muse...",
  "Rendering the first layer...",
  "Applying artistic lighting...",
  "This might take a moment, hang tight!",
  "Adding a touch of creative magic...",
  "Composing the final piece...",
  "Polishing the masterpiece...",
  "Teaching pixels to speak Persian...",
  "Checking for digital dust bunnies...",
  "Calibrating the beauty sensors...",
  "Untangling the color palettes...",
  "Enhancing to ludicrous detail...",
  "Don't worry, the pixels are friendly.",
  "Harvesting nano banana stems...",
  "Praying to the Gemini star...",
  "Preparing your artwork for the gallery..."
];

const LoadingIndicator: React.FC = () => {
  const [messageIndex, setMessageIndex] = useState(0);

  useEffect(() => {
    const intervalId = setInterval(() => {
      setMessageIndex((prevIndex) => (prevIndex + 1) % loadingMessages.length);
    }, 3000); // Change message every 3 seconds

    return () => clearInterval(intervalId);
  }, []);

  return (
    <div className="flex flex-col items-center justify-center p-12 bg-gray-800/50 rounded-lg border border-gray-700">
      <div className="w-16 h-16 border-4 border-t-transparent border-indigo-500 rounded-full animate-spin"></div>
      <h2 className="text-2xl font-semibold mt-8 text-gray-200">Generating Your Image</h2>
      <p className="mt-2 text-gray-400 text-center transition-opacity duration-500">
        {loadingMessages[messageIndex]}
      </p>
    </div>
  );
};

export default LoadingIndicator;
