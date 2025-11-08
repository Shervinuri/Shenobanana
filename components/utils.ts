/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import {ImageFile} from '../types';

export const fileToBase64 = <
  T extends {file: File; base64: string; name: string},
>(
  file: File,
): Promise<T> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const base64 = (reader.result as string).split(',')[1];
      if (base64) {
        resolve({file, base64, name: file.name} as T);
      } else {
        reject(new Error('Failed to read file as base64.'));
      }
    };
    reader.onerror = (error) => reject(error);
    reader.readAsDataURL(file);
  });
};

/**
 * Creates an image file from a text string by rendering it on a canvas.
 * @param text The text to render.
 * @param index A unique index for naming the file.
 * @returns A promise that resolves to an ImageFile object.
 */
const generatePlate = (text: string, index: number): Promise<ImageFile> => {
  return new Promise((resolve, reject) => {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    if (!ctx) return reject(new Error('Could not get canvas context'));

    const width = 512;
    const height = 128; // Rectangular shape is good for most text
    canvas.width = width;
    canvas.height = height;

    // White background
    ctx.fillStyle = 'white';
    ctx.fillRect(0, 0, width, height);

    // Black text
    ctx.fillStyle = 'black';
    ctx.font = 'bold 48px Arial';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.direction = 'rtl'; // Crucial for right-to-left languages

    ctx.fillText(text, width / 2, height / 2);

    canvas.toBlob(async (blob) => {
      if (blob) {
        // Name the file systematically so the AI can reference it
        const file = new File([blob], `text_plate_${index + 1}.png`, {
          type: 'image/png',
        });
        try {
          const imageFile = await fileToBase64<ImageFile>(file);
          resolve(imageFile);
        } catch (error) {
          reject(error);
        }
      } else {
        reject(new Error('Canvas toBlob failed.'));
      }
    }, 'image/png');
  });
};

/**
 * Extracts text from a prompt (inside quotes) and generates image plates for each.
 * @param prompt The user's full prompt string.
 * @returns A promise that resolves to an array of ImageFile objects.
 */
export const extractTextAndGeneratePlates = async (
  prompt: string,
): Promise<ImageFile[]> => {
  // Regex to find text inside double or single quotes
  const regex = /"([^"]+)"|'([^']+)'/g;
  const matches = [...prompt.matchAll(regex)];
  // Extract the captured group (the text itself)
  const texts = matches.map((match) => match[1] || match[2]).filter(Boolean);

  if (texts.length === 0) {
    return []; // No text found, return empty array
  }

  // Create a plate generation promise for each found text
  const platePromises = texts.map((text, index) => generatePlate(text, index));

  // Wait for all plates to be generated
  return Promise.all(platePromises);
};
