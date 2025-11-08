/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */
import React from 'react';
import {ArrowPathIcon, PlusIcon} from './icons';

interface ImageResultProps {
  imageUrl: string;
  onRetry: () => void;
  onNewImage: () => void;
}

const ImageResult: React.FC<ImageResultProps> = ({
  imageUrl,
  onRetry,
  onNewImage,
}) => {
  return (
    <div className="w-full flex flex-col items-center gap-8 p-8 bg-gray-800/50 rounded-lg border border-gray-700 shadow-2xl mt-6">
      <h2 className="text-2xl font-bold text-gray-200">
        Your Image is Ready!
      </h2>
      <div className="w-full max-w-lg rounded-lg overflow-hidden bg-black shadow-lg">
        <img
          src={imageUrl}
          alt="Generated result"
          className="w-full h-full object-contain"
        />
      </div>

      <div className="flex flex-wrap justify-center gap-4">
        <button
          onClick={onRetry}
          className="flex items-center gap-2 px-6 py-3 bg-gray-700 hover:bg-gray-600 text-white font-semibold rounded-lg transition-colors">
          <ArrowPathIcon className="w-5 h-5" />
          Retry
        </button>
        <button
          onClick={onNewImage}
          className="flex items-center gap-2 px-6 py-3 bg-purple-600 hover:bg-purple-700 text-white font-semibold rounded-lg transition-colors">
          <PlusIcon className="w-5 h-5" />
          New Creation
        </button>
      </div>
    </div>
  );
};

export default ImageResult;
