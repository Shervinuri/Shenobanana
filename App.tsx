/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */
import React, {useCallback, useState} from 'react';
import ImageResult from './components/ImageResult';
import LoadingIndicator from './components/LoadingIndicator';
import ReferenceImageUploader from './components/ReferenceImageUploader';
import {FileTextIcon, LoaderIcon, SparklesIcon} from './components/icons';
import {extractTextAndGeneratePlates} from './components/utils';
import {engineerPrompt, generateImage} from './services/geminiService';
// FIX: Import TargetModel to be used in engineerPrompt call.
import {AppState, ImageFile, TargetModel} from './types';

// Footer Component
const Footer: React.FC = () => {
  return (
    <footer className="w-full text-center py-4 px-8 shrink-0">
      <a
        href="https://t.me/shervini"
        target="_blank"
        rel="noopener noreferrer"
        className="text-sm font-semibold bg-gradient-to-tr from-white via-gray-400 to-gray-700 bg-clip-text text-transparent"
        style={{fontFamily: 'Arimo, sans-serif'}}>
        Exclusive SHΞN™ made
      </a>
    </footer>
  );
};

const App: React.FC = () => {
  // Overall App State
  const [appState, setAppState] = useState<AppState>(AppState.IDLE);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // User Inputs
  const [userPrompt, setUserPrompt] = useState('');
  const [referenceImages, setReferenceImages] = useState<ImageFile[]>([]);

  // Generation State
  const [resultUrl, setResultUrl] = useState<string | null>(null);

  const handleError = (
    message: string,
    error?: unknown,
    state: AppState = AppState.ERROR,
  ) => {
    console.error(message, error);
    const errorDetails =
      error instanceof Error ? error.message : 'An unknown error occurred.';

    const userFriendlyMessage = `${message}: ${errorDetails}`;

    setErrorMessage(userFriendlyMessage);
    setAppState(state);
  };

  const handleGenerate = async () => {
    if (!userPrompt.trim()) {
      handleError('Please enter a prompt to generate an image.');
      return;
    }

    setAppState(AppState.LOADING);
    setResultUrl(null);
    setErrorMessage(null);

    try {
      // Step 1: Automatically find text in prompt and generate image plates for them.
      const textPlates = await extractTextAndGeneratePlates(userPrompt);

      // Step 2: Send the user prompt and generated text plates to the engineering model.
      // FIX: Pass TargetModel.IMAGE to engineerPrompt as it now requires a target model.
      const engineeredPrompt = await engineerPrompt(
        userPrompt,
        TargetModel.IMAGE,
        textPlates,
        referenceImages,
      );

      // Step 3: Combine the professional prompt and all images (text plates + user references).
      const fullPrompt = `${engineeredPrompt.professional_prompt}\n\n${engineeredPrompt.text_replication_instruction}\n\nNegative Prompt: ${engineeredPrompt.negative_prompt}`;
      const allImages = [...textPlates, ...referenceImages];

      // Step 4: Generate the final image.
      const {objectUrl} = await generateImage(fullPrompt, allImages);

      // Step 5: Display the result.
      setResultUrl(objectUrl);
      setAppState(AppState.SUCCESS);
    } catch (error) {
      handleError('Image generation failed', error);
    }
  };

  const handleStartOver = useCallback(() => {
    setAppState(AppState.IDLE);
    setResultUrl(null);
    setErrorMessage(null);
    setUserPrompt('');
    setReferenceImages([]);
  }, []);

  const renderError = (message: string) => (
    <div className="text-center bg-red-900/20 border border-red-500 p-8 rounded-lg mt-6">
      <h2 className="text-2xl font-bold text-red-400 mb-4">Error</h2>
      <p className="text-red-300">{message}</p>
      <button
        onClick={handleStartOver}
        className="mt-6 px-6 py-2 bg-indigo-600 rounded-lg hover:bg-indigo-700 transition-colors">
        Start Over
      </button>
    </div>
  );

  const isLoading = appState === AppState.LOADING;

  return (
    <div className="min-h-screen bg-black text-gray-200 flex flex-col font-sans">
      <header className="py-6 flex justify-center items-center px-8 relative z-10 shrink-0">
        <h1 className="text-5xl font-semibold tracking-wide text-center bg-gradient-to-r from-indigo-400 via-purple-500 to-pink-500 bg-clip-text text-transparent">
          SHΞN™ Image Studio
        </h1>
      </header>

      <main className="w-full max-w-4xl mx-auto flex-grow flex flex-col items-center justify-center p-4">
        {isLoading && <LoadingIndicator />}
        {appState === AppState.ERROR && errorMessage && renderError(errorMessage)}
        {appState === AppState.SUCCESS && resultUrl && (
          <ImageResult
            imageUrl={resultUrl}
            onRetry={handleGenerate}
            onNewImage={handleStartOver}
          />
        )}

        {/* Show generation form only when not loading */}
        {!isLoading && appState !== AppState.SUCCESS && (
          <div className="w-full space-y-4 bg-gray-900/50 p-6 rounded-2xl border border-gray-800">
            <div className="text-center mb-6">
              <h2 className="text-3xl text-gray-300">
                Describe Your Vision
              </h2>
              <p className="text-md text-gray-500 mt-2">
                Create stunning images with perfectly rendered Persian text.
                Just write what you want to see, and put any text you want in
                the image inside "quotes".
              </p>
            </div>

            <div className="bg-gray-800 p-4 rounded-lg shadow-inner space-y-4">
              <div>
                <label
                  htmlFor="user_prompt"
                  className="block text-sm font-medium text-gray-300 mb-2">
                  <FileTextIcon className="w-5 h-5 inline-block mr-2" />
                  Your Prompt
                </label>
                <textarea
                  id="user_prompt"
                  rows={4}
                  className="w-full bg-gray-900 border border-gray-700 text-white rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-lg"
                  placeholder={`e.g., A fruit shop with a sign that says "میوه تازه". A man is standing in front of it, and on his t-shirt it says "شروین".`}
                  value={userPrompt}
                  onChange={(e) => setUserPrompt(e.target.value)}
                />
              </div>

              <ReferenceImageUploader
                referenceImages={referenceImages}
                setReferenceImages={setReferenceImages}
              />
            </div>

            <button
              onClick={handleGenerate}
              disabled={isLoading || !userPrompt}
              className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 text-white px-4 py-4 rounded-md font-bold text-xl hover:from-indigo-700 hover:to-purple-700 disabled:opacity-50 flex items-center justify-center gap-3 transition-all duration-300 transform hover:scale-105">
              {isLoading ? (
                <LoaderIcon className="w-7 h-7 animate-spin" />
              ) : (
                <SparklesIcon className="w-7 h-7" />
              )}
              {isLoading ? 'Generating...' : 'Generate Image'}
            </button>
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
};

export default App;
