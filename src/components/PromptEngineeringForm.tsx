/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */
import React, {useState} from 'react';
import {engineerPrompt} from '../services/geminiService';
// FIX: Import AspectRatio to provide a default value for the engineerPrompt function.
import {
  AspectRatio,
  AppState,
  EngineeredPrompt,
  ImageFile,
  TargetModel,
} from '../types';
import {FileTextIcon, ImageIcon, LoaderIcon, VideoIcon} from './icons';
import PersianTextPlateGenerator from './PersianTextPlateGenerator';
import ReferenceImageUploader from './ReferenceImageUploader';

interface PromptEngineeringFormProps {
  onPromptEngineered: (
    prompt: EngineeredPrompt,
    textPlate: ImageFile,
    references: ImageFile[],
  ) => void;
  setAppState: (state: AppState) => void;
  handleError: (message: string, error?: unknown) => void;
  isLoading: boolean;
  // apiKey: string;
}

const PromptEngineeringForm: React.FC<PromptEngineeringFormProps> = ({
  onPromptEngineered,
  setAppState,
  handleError,
  isLoading,
}) => {
  const [persianText, setPersianText] = useState('');
  const [textPlateImage, setTextPlateImage] = useState<ImageFile | null>(null);
  const [referenceImages, setReferenceImages] = useState<ImageFile[]>([]);
  const [userPrompt, setUserPrompt] = useState('');
  const [targetModel, setTargetModel] = useState<TargetModel>(
    TargetModel.IMAGE,
  );

  const handleGenerateProfessionalPrompt = async () => {
    if (!userPrompt || !textPlateImage) {
      handleError('Please provide a simple prompt and create a text plate.');
      return;
    }

    setAppState(AppState.PROMPT_ENGINEERING_LOADING);

    try {
      // FIX: Add a default aspect ratio based on the target model to satisfy the engineerPrompt signature.
      const aspectRatio =
        targetModel === TargetModel.VIDEO
          ? AspectRatio.LANDSCAPE
          : AspectRatio.SQUARE;

      // FIX: Corrected the call to engineerPrompt to match its signature. It expects 5 arguments, but was called with 6. The API key is handled by the service layer.
      const result = await engineerPrompt(
        userPrompt,
        targetModel,
        [textPlateImage],
        referenceImages,
        aspectRatio,
      );
      onPromptEngineered(result, textPlateImage, referenceImages);
    } catch (err) {
      handleError('Failed to engineer prompt', err);
    }
  };

  return (
    <div className="w-full space-y-4">
      <div className="text-center mb-6">
        <h2 className="text-3xl text-gray-300">
          Step 1: Engineer Your Prompt
        </h2>
        <p className="text-md text-gray-500 mt-2">
          Solve Persian text issues and create professional prompts for Veo &
          Nano Banana.
        </p>
      </div>

      <PersianTextPlateGenerator
        persianText={persianText}
        setPersianText={setPersianText}
        textPlateImage={textPlateImage}
        setTextPlateImage={setTextPlateImage}
      />

      <ReferenceImageUploader
        referenceImages={referenceImages}
        setReferenceImages={setReferenceImages}
      />

      <div className="bg-gray-800 p-4 rounded-lg shadow-inner">
        <h2 className="text-lg font-semibold text-white mb-3">
          3. Engineer Prompt
        </h2>

        <div className="mb-3">
          <label className="block text-sm font-medium text-gray-300 mb-1">
            Target Model
          </label>
          <div className="flex gap-2">
            <button
              onClick={() => setTargetModel(TargetModel.IMAGE)}
              className={`flex-1 p-2 rounded-md flex items-center justify-center gap-2 transition-colors ${
                targetModel === TargetModel.IMAGE
                  ? 'bg-indigo-600 text-white'
                  : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
              }`}>
              <ImageIcon className="w-5 h-5" />
              Image (Nano Banana)
            </button>
            <button
              onClick={() => setTargetModel(TargetModel.VIDEO)}
              className={`flex-1 p-2 rounded-md flex items-center justify-center gap-2 transition-colors ${
                targetModel === TargetModel.VIDEO
                  ? 'bg-purple-600 text-white'
                  : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
              }`}>
              <VideoIcon className="w-5 h-5" />
              Video (Veo)
            </button>
          </div>
        </div>

        <div className="mb-3">
          <label
            htmlFor="user_prompt"
            className="block text-sm font-medium text-gray-300 mb-1">
            Your Simple Prompt
          </label>
          <textarea
            id="user_prompt"
            rows={3}
            className="w-full bg-gray-900 border border-gray-700 text-white rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            placeholder="e.g., A man stands next to a sign on a busy street, the camera orbits around him and cranes up."
            value={userPrompt}
            onChange={(e) => setUserPrompt(e.target.value)}
          />
        </div>

        <button
          onClick={handleGenerateProfessionalPrompt}
          disabled={isLoading || !userPrompt || !textPlateImage}
          className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 text-white px-4 py-3 rounded-md font-bold text-lg hover:from-indigo-700 hover:to-purple-700 disabled:opacity-50 flex items-center justify-center gap-3">
          {isLoading ? (
            <LoaderIcon className="w-6 h-6 animate-spin" />
          ) : (
            <FileTextIcon className="w-6 h-6" />
          )}
          {isLoading ? 'Analyzing & Engineering...' : 'Generate Professional Prompt'}
        </button>
      </div>
    </div>
  );
};

export default PromptEngineeringForm;