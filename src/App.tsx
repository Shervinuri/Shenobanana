/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */
import React, {useCallback, useState} from 'react';
import ImageResult from './components/ImageResult';
import LoadingIndicator from './components/LoadingIndicator';
import QuotaErrorDialog from './components/QuotaErrorDialog';
import ReferenceImageUploader from './components/ReferenceImageUploader';
import {
  BananaIcon,
  LoaderIcon,
  RectangleHorizontalIcon,
  RectangleStackIcon,
  RectangleVerticalIcon,
  SquareIcon,
} from './components/icons';
import {extractTextAndGeneratePlates} from './components/utils';
import {
  addQuotesToPrompt,
  engineerPrompt,
  generateImage,
  getGroundingImage,
} from './services/geminiService';
import {
  AppState,
  AspectRatio,
  ImageFile,
  TargetModel,
} from './types';

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
  const [appState, setAppState] = useState<AppState>(AppState.IDLE);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isQuotaError, setIsQuotaError] = useState(false);

  // User Inputs
  const [userPrompt, setUserPrompt] = useState('');
  const [referenceImages, setReferenceImages] = useState<ImageFile[]>([]);
  const [aspectRatio, setAspectRatio] = useState<AspectRatio>(
    AspectRatio.SQUARE,
  );

  // Generation Results
  const [resultUrl, setResultUrl] = useState<string | null>(null);
  const [lastConfig, setLastConfig] = useState<
    | {
        prompt: string;
        textPlates: ImageFile[];
        referenceImages: ImageFile[];
      }
    | null
  >(null);
  const [loadingMessage, setLoadingMessage] = useState<string>('');

  const handleError = (
    message: string,
    error?: unknown,
    state: AppState = AppState.ERROR,
  ) => {
    console.error(message, error);
    const errorDetails =
      error instanceof Error ? error.message : 'An unknown error occurred.';

    // Check for the specific error from our service layer indicating all keys failed.
    if (errorDetails.includes('All available API keys are exhausted')) {
      setIsQuotaError(true);
      setAppState(AppState.IDLE);
      return; // Stop further error handling
    }

    const userFriendlyMessage = `${message}: ${errorDetails}`;
    setErrorMessage(userFriendlyMessage);
    setAppState(state);
  };

  const handleGenerate = async (retryConfig?: typeof lastConfig | null) => {
    const isRetry = !!retryConfig;
    const currentPrompt = isRetry ? '' : userPrompt;

    if (!isRetry && !currentPrompt.trim()) {
      handleError('Please enter a prompt to generate.');
      return;
    }

    setAppState(AppState.LOADING);
    setResultUrl(null);
    setErrorMessage(null);
    setIsQuotaError(false); // Reset quota error state on new generation

    try {
      let promptToUse: string;
      let textPlatesToUse: ImageFile[];
      let referenceImagesToUse: ImageFile[];

      if (isRetry && retryConfig) {
        promptToUse = retryConfig.prompt;
        textPlatesToUse = retryConfig.textPlates;
        referenceImagesToUse = retryConfig.referenceImages;
        setLoadingMessage('Re-generating your masterpiece...');
      } else {
        setLoadingMessage('Analyzing prompt for text...');
        const quotedPrompt = await addQuotesToPrompt(currentPrompt);

        setLoadingMessage('Generating text blueprints...');
        const textPlates = await extractTextAndGeneratePlates(quotedPrompt);

        setLoadingMessage('Engineering professional prompt...');
        const engineeredPrompt = await engineerPrompt(
          quotedPrompt,
          TargetModel.IMAGE,
          textPlates,
          referenceImages,
          aspectRatio,
        );

        promptToUse = `${engineeredPrompt.professional_prompt}\n\n${engineeredPrompt.text_replication_instruction}\n\nNegative Prompt: ${engineeredPrompt.negative_prompt}`;
        textPlatesToUse = textPlates;
        referenceImagesToUse = [...referenceImages];

        if (engineeredPrompt.grounding_search_query) {
          setLoadingMessage(
            `Searching for reference: "${engineeredPrompt.grounding_search_query}"...`,
          );
          const groundingImage = await getGroundingImage(
            engineeredPrompt.grounding_search_query,
          );
          referenceImagesToUse.push(groundingImage);
        }
      }

      setLastConfig({
        prompt: promptToUse,
        textPlates: textPlatesToUse,
        referenceImages: referenceImagesToUse,
      });

      setLoadingMessage('Painting your vision with Nano Banana...');
      const {objectUrl} = await generateImage(
        promptToUse,
        textPlatesToUse,
        referenceImagesToUse,
      );
      setResultUrl(objectUrl);
      setAppState(AppState.SUCCESS);
    } catch (error) {
      handleError('Generation failed', error);
    } finally {
      setLoadingMessage('');
    }
  };

  const handleStartOver = useCallback(() => {
    setAppState(AppState.IDLE);
    setResultUrl(null);
    setErrorMessage(null);
    setUserPrompt('');
    setReferenceImages([]);
    setLastConfig(null);
    setAspectRatio(AspectRatio.SQUARE);
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
      {isQuotaError && <QuotaErrorDialog onClose={() => setIsQuotaError(false)} />}
      <header className="py-6 flex justify-center items-center px-8 relative z-10 shrink-0">
        <h1 className="inline-flex justify-center items-baseline text-5xl font-semibold tracking-wide bg-gradient-to-r from-yellow-400 via-gray-200 to-yellow-200 bg-clip-text">
          <span className="text-transparent">SHΞNano Banana&nbsp;</span>
          <span
            role="img"
            aria-label="banana"
            style={{
              WebkitBackgroundClip: 'initial',
              backgroundClip: 'initial',
              textShadow: 'none',
            }}>
            🍌
          </span>
          <span className="text-transparent">&nbsp;™</span>
        </h1>
      </header>

      <main className="w-full max-w-4xl mx-auto flex-grow flex flex-col items-center justify-center p-4">
        {isLoading && <LoadingIndicator message={loadingMessage} />}
        {appState === AppState.ERROR &&
          errorMessage &&
          renderError(errorMessage)}

        {appState === AppState.SUCCESS && resultUrl && (
          <ImageResult
            imageUrl={resultUrl}
            onRetry={() => handleGenerate(lastConfig)}
            onNewImage={handleStartOver}
            modelName="gemini-2.5-flash-image"
          />
        )}

        {/* Show generation form only when not loading/successful */}
        {!isLoading && appState !== AppState.SUCCESS && (
          <div className="w-full space-y-4 bg-gray-900 p-6 rounded-2xl border border-yellow-500/50 shadow-lg">
            <div className="text-center mb-6">
              <h2 className="text-3xl shen-gradient-text">
                ریزمــوز نبین چه ریزه فارسیش خیلی تمیزه
              </h2>
              <p className="text-sm mt-2 shen-gradient-text">
                تصاویر خیره‌کننده با متن فارسی دقیق و تمیز بساز. فقط صحنه و هر متنی که می‌خوای رو بگو.
              </p>
            </div>

            <div className="bg-gray-800 p-4 rounded-lg shadow-inner space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  <RectangleStackIcon className="w-5 h-5 inline-block mr-2" />
                  Aspect Ratio
                </label>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    onClick={() => setAspectRatio(AspectRatio.SQUARE)}
                    className={`flex flex-col items-center justify-center p-2 rounded-md transition-colors ${
                      aspectRatio === AspectRatio.SQUARE
                        ? 'bg-gradient-to-r from-yellow-500 to-yellow-600 text-black font-bold'
                        : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                    }`}>
                    <SquareIcon className="w-6 h-6 mb-1" />
                    <span className="text-xs font-medium">Square (1:1)</span>
                  </button>
                  <button
                    onClick={() => setAspectRatio(AspectRatio.PORTRAIT)}
                    className={`flex flex-col items-center justify-center p-2 rounded-md transition-colors ${
                      aspectRatio === AspectRatio.PORTRAIT
                        ? 'bg-gradient-to-r from-yellow-500 to-yellow-600 text-black font-bold'
                        : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                    }`}>
                    <RectangleVerticalIcon className="w-6 h-6 mb-1" />
                    <span className="text-xs font-medium">
                      Portrait (9:16)
                    </span>
                  </button>
                  <button
                    onClick={() => setAspectRatio(AspectRatio.LANDSCAPE)}
                    className={`flex flex-col items-center justify-center p-2 rounded-md transition-colors ${
                      aspectRatio === AspectRatio.LANDSCAPE
                        ? 'bg-gradient-to-r from-yellow-500 to-yellow-600 text-black font-bold'
                        : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                    }`}>
                    <RectangleHorizontalIcon className="w-6 h-6 mb-1" />
                    <span className="text-xs font-medium">
                      Landscape (16:9)
                    </span>
                  </button>
                </div>
              </div>
              <div>
                <label
                  htmlFor="user_prompt"
                  className="block text-sm font-medium text-gray-300 mb-2 text-right">
                  <span className="shen-gradient-text">چی بکشم با چه نوشته‌ای؟</span>
                </label>
                <textarea
                  id="user_prompt"
                  rows={4}
                  dir="rtl"
                  className="w-full bg-gray-900 border border-gray-700 text-white rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-yellow-500 text-lg placeholder-gradient"
                  placeholder={`مثلاً: با اسپری روی دیوار بنویس "مرگ بر خامنه‌ای"`}
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
              onClick={() => handleGenerate(null)}
              disabled={isLoading || !userPrompt}
              className="w-full bg-yellow-600 text-black px-4 py-4 rounded-md font-bold text-xl hover:bg-yellow-500 disabled:opacity-50 flex items-center justify-center gap-3 transition-all duration-300 transform hover:scale-105">
              {isLoading ? (
                <LoaderIcon className="w-7 h-7 animate-spin" />
              ) : (
                <BananaIcon className="w-7 h-7" />
              )}
              {isLoading ? 'در حال ساخت...' : 'بساز برام'}
            </button>
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
};

export default App;
