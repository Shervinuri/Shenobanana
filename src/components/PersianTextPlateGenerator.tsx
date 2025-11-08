/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */
import React, {useRef} from 'react';
import {ImageFile} from '../types';
import {DownloadIcon, WandIcon} from './icons';
import {fileToBase64} from './utils';

interface PersianTextPlateGeneratorProps {
  persianText: string;
  setPersianText: (text: string) => void;
  textPlateImage: ImageFile | null;
  setTextPlateImage: (image: ImageFile | null) => void;
}

const PersianTextPlateGenerator: React.FC<PersianTextPlateGeneratorProps> = ({
  persianText,
  setPersianText,
  textPlateImage,
  setTextPlateImage,
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const generatePlate = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const width = 512;
    const height = 256;
    canvas.width = width;
    canvas.height = height;

    ctx.fillStyle = 'white';
    ctx.fillRect(0, 0, width, height);

    ctx.fillStyle = 'black';
    ctx.font = 'bold 60px Arial';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.direction = 'rtl';

    ctx.fillText(persianText, width / 2, height / 2);

    canvas.toBlob(async (blob) => {
      if (blob) {
        const file = new File([blob], 'farsi_text_plate.png', {
          type: 'image/png',
        });
        try {
          const imageFile = await fileToBase64<ImageFile>(file);
          setTextPlateImage(imageFile);
        } catch (error) {
          console.error('Error creating image file:', error);
        }
      }
    }, 'image/png');
  };

  return (
    <div className="bg-gray-800 p-4 rounded-lg shadow-inner">
      <h2 className="text-lg font-semibold text-white mb-3">
        1. Create Persian Text Plate
      </h2>
      <p className="text-sm text-gray-400 mb-2">
        Enter the text you want to display in the image or video.
      </p>
      <div className="flex flex-col sm:flex-row gap-2">
        <input
          type="text"
          dir="rtl"
          placeholder="Example: کتابفروشی حافظ"
          className="flex-grow bg-gray-900 border border-gray-700 text-white rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          value={persianText}
          onChange={(e) => setPersianText(e.target.value)}
        />
        <button
          onClick={generatePlate}
          disabled={!persianText}
          className="bg-indigo-600 text-white px-4 py-2 rounded-md font-medium hover:bg-indigo-700 disabled:bg-gray-600 disabled:opacity-50 flex items-center justify-center gap-2">
          <WandIcon className="w-5 h-5" />
          Create Plate
        </button>
      </div>
      <canvas ref={canvasRef} className="hidden" />
      {textPlateImage && (
        <div className="mt-4 p-3 bg-gray-900 rounded-lg">
          <p className="text-sm font-medium text-gray-300 mb-2">
            Plate Created (AI's main reference):
          </p>
          <img
            src={URL.createObjectURL(textPlateImage.file)}
            alt="Persian Text Plate"
            className="rounded-md border border-gray-700 max-w-xs mx-auto"
          />
          <a
            href={URL.createObjectURL(textPlateImage.file)}
            download="farsi_text_plate.png"
            className="mt-3 inline-flex items-center gap-2 bg-green-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-green-700">
            <DownloadIcon className="w-4 h-4" />
            Download Plate (farsi_text_plate.png)
          </a>
        </div>
      )}
    </div>
  );
};

export default PersianTextPlateGenerator;