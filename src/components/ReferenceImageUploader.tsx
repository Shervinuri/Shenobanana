/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */
import React from 'react';
import {ImageFile} from '../types';
import {UploadCloudIcon, XMarkIcon} from './icons';
import {fileToBase64} from './utils';

interface ReferenceImageUploaderProps {
  referenceImages: ImageFile[];
  setReferenceImages: (images: ImageFile[]) => void;
}

const ReferenceImageUploader: React.FC<ReferenceImageUploaderProps> = ({
  referenceImages,
  setReferenceImages,
}) => {
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    const imagePromises = files.map((file: File) =>
      fileToBase64<ImageFile>(file),
    );

    Promise.all(imagePromises).then((newImages) => {
      setReferenceImages(
        [...referenceImages, ...newImages].slice(0, 10), // Limit to 10 images
      );
    });
  };

  const removeImage = (index: number) => {
    setReferenceImages(referenceImages.filter((_, i) => i !== index));
  };

  return (
    <div className="text-right">
      <h3 className="text-base mb-2 shen-gradient-text">
        تصاویر مرجع (اختیاری)
      </h3>
      <p className="text-xs mb-3 shen-gradient-text">
        عکس‌ها رو برای سبک، محیط، شخصیت یا پالت رنگ آپلود کن.
      </p>
      <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-gray-700 border-dashed rounded-lg cursor-pointer bg-gray-900 hover:bg-gray-800/80">
        <div className="flex flex-col items-center justify-center pt-5 pb-6">
          <UploadCloudIcon className="w-8 h-8 mb-3 text-gray-500" />
          <p className="mb-2 text-sm text-gray-500">
            <span className="font-medium shen-gradient-text">برای آپلود کلیک کن</span>
          </p>
          <p className="text-xs shen-gradient-text">
            PNG, JPG (حداکثر ۱۰)
          </p>
        </div>
        <input
          type="file"
          multiple
          accept="image/*"
          className="hidden"
          onChange={handleImageChange}
        />
      </label>
      {referenceImages.length > 0 && (
        <div className="mt-4 grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-2">
          {referenceImages.map((image, index) => (
            <div key={index} className="relative group">
              <img
                src={URL.createObjectURL(image.file)}
                alt={image.name}
                className="w-full h-24 object-cover rounded-md border border-gray-700"
              />
              <button
                onClick={() => removeImage(index)}
                className="absolute top-0 right-0 m-1 p-0.5 bg-red-600/80 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity">
                <XMarkIcon className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ReferenceImageUploader;