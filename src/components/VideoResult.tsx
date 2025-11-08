/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */
import React from 'react';
import {ArrowPathIcon, PlusIcon, SparklesIcon} from './icons';

interface VideoResultProps {
  videoUrl: string;
  onRetry: () => void;
  onNewVideo: () => void;
  onExtend: () => void;
  canExtend: boolean;
  modelName: string;
}

const VideoResult: React.FC<VideoResultProps> = ({
  videoUrl,
  onRetry,
  onNewVideo,
  onExtend,
  canExtend,
  modelName,
}) => {
  return (
    <div className="w-full flex flex-col items-center gap-8 p-8 bg-gray-800/50 rounded-lg border border-gray-700 shadow-2xl mt-6">
      <h2 className="text-2xl font-bold text-gray-200">
        Your Creation is Ready!
      </h2>
      <div className="w-full max-w-2xl aspect-video rounded-lg overflow-hidden bg-black shadow-lg">
        <video
          src={videoUrl}
          controls
          autoPlay
          loop
          className="w-full h-full object-contain"
        />
      </div>

      <div className="flex flex-col items-center gap-4">
        <div className="flex flex-wrap justify-center gap-4">
          <button
            onClick={onRetry}
            className="flex items-center gap-2 px-6 py-3 bg-gray-700 hover:bg-gray-600 text-white font-semibold rounded-lg transition-colors">
            <ArrowPathIcon className="w-5 h-5" />
            Retry
          </button>
          {canExtend && (
            <button
              onClick={onExtend}
              disabled // TODO: Implement extend functionality
              className="flex items-center gap-2 px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-lg transition-colors disabled:bg-gray-600 disabled:cursor-not-allowed">
              <SparklesIcon className="w-5 h-5" />
              Extend
            </button>
          )}
          <button
            onClick={onNewVideo}
            className="flex items-center gap-2 px-6 py-3 bg-purple-600 hover:bg-purple-700 text-white font-semibold rounded-lg transition-colors">
            <PlusIcon className="w-5 h-5" />
            New Creation
          </button>
        </div>
        <p className="text-xs text-gray-500 mt-2">
          Generated with: <span className="font-mono">{modelName}</span>
        </p>
      </div>
    </div>
  );
};

export default VideoResult;
