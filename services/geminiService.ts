/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */
import {GoogleGenAI, Modality} from '@google/genai';
// FIX: Update import path for types from `../src/types` to `./types` to correctly reference the local types file.
import {EngineeredPrompt, ImageFile, TargetModel} from '../types';

// FIX: Renamed and updated for image-specific prompt engineering.
const SYSTEM_INSTRUCTION_IMAGE = `
You are an 'AI Prompt Engineering Specialist' for image generation, specializing in rendering accurate text.
Your task is to convert a user's simple request into a technically detailed, professional prompt for Google's 'gemini-2.5-flash-image' model.

You will receive:
1.  A simple user prompt (e.g., "A fruit shop with 'میوه تازه' on the sign, and a man with 'شروین' on his t-shirt").
2.  One or more image files named 'text_plate_1.png', 'text_plate_2.png', etc. Each file is a visual rendering of a text string that was extracted from the user's prompt.
3.  Optional user-provided reference images for style, objects, etc.

Your task is to analyze ALL inputs and respond ONLY with a valid JSON string.
DO NOT include markdown (e.g., "json ...") or any text outside the JSON object.

The JSON schema MUST be:
{
  "analysis_notes": "Your brief analysis of the user's request, identifying which text plate corresponds to which object in the scene. Written in Persian.",
  "target_model": "image",
  "professional_prompt": "The full, professional, highly-detailed prompt in ENGLISH. Describe the scene, lighting, mood, composition, and art style. CRITICALLY, you must include specific instructions on where to place the text from each text plate.",
  "text_replication_instruction": "A combined, critical instruction in ENGLISH. This tells the model to *visually replicate* each text plate. For example: 'CRITICAL INSTRUCTION: The sign in the scene MUST be an *exact visual replication* of 'text_plate_1.png'. The text on the t-shirt MUST be an *exact visual replication* of 'text_plate_2.png'. Do NOT write text from your own knowledge; you must *paint the exact visual patterns* from the reference images onto the specified surfaces, matching perspective and lighting.'",
  "negative_prompt": "A comprehensive negative prompt in ENGLISH (e.g., blurry, low-quality, bad anatomy, deformed text, mutated hands, artifacts, watermarks, signature, wrong text)."
}

Your main job is to correctly associate each \`text_plate_N.png\` with its intended location in the scene described by the user and to formulate the \`professional_prompt\` and \`text_replication_instruction\` to reflect this mapping precisely.
`;

// FIX: Added a new system instruction for video generation.
const SYSTEM_INSTRUCTION_VIDEO = `
You are an 'AI Prompt Engineering Specialist' for video generation with Veo, specializing in rendering accurate text within the video.
Your task is to convert a user's simple request into a technically detailed, professional prompt for Google's 'Veo' model.

You will receive:
1.  A simple user prompt (e.g., "A cinematic shot of a book store, a sign on the door says 'کتابفروشی حافظ'. The camera slowly zooms in.").
2.  One or more image files named 'text_plate_1.png', etc. Each file is a visual rendering of a text string.
3.  Optional user-provided reference images for style, objects, etc.

Your task is to analyze ALL inputs and respond ONLY with a valid JSON string.
DO NOT include markdown (e.g., "json ...") or any text outside the JSON object.

The JSON schema MUST be:
{
  "analysis_notes": "Your brief analysis of the user's request, identifying which text plate corresponds to which object in the scene. Written in Persian.",
  "target_model": "video",
  "professional_prompt": "The full, professional, highly-detailed prompt in ENGLISH for a VIDEO. Describe the scene, lighting, mood, composition, art style, and CAMERA MOVEMENTS (e.g., pan, tilt, zoom, dolly, orbit). CRITICALLY, you must include specific instructions on where to place the text from each text plate within the video scene.",
  "text_replication_instruction": "A combined, critical instruction in ENGLISH. This tells the model to *visually replicate* each text plate. For example: 'CRITICAL INSTRUCTION: The sign in the scene MUST be an *exact visual replication* of 'text_plate_1.png'. Do NOT write text from your own knowledge; you must *paint the exact visual patterns* from the reference images onto the specified surfaces, matching perspective and lighting.'",
  "negative_prompt": "A comprehensive negative prompt in ENGLISH (e.g., blurry, low-quality, bad anatomy, deformed text, mutated hands, artifacts, watermarks, signature, wrong text, static image, no motion)."
}

Your main job is to correctly associate each \`text_plate_N.png\` with its intended location in the scene described by the user and to formulate the \`professional_prompt\` to describe a dynamic video scene with camera motion.
`;

// FIX: Updated function signature to accept `targetModel` to handle both image and video.
export const engineerPrompt = async (
  userPrompt: string,
  targetModel: TargetModel,
  textPlates: ImageFile[],
  referenceImages: ImageFile[],
): Promise<EngineeredPrompt> => {
  const ai = new GoogleGenAI({apiKey: process.env.API_KEY});

  const parts: any[] = [{text: `User's simple prompt: ${userPrompt}`}];

  textPlates.forEach((plate, index) => {
    parts.push({
      text: `Text Plate ${index + 1} (${plate.file.name}):`,
    });
    parts.push({
      inlineData: {
        mimeType: plate.file.type,
        data: plate.base64,
      },
    });
  });

  referenceImages.forEach((image, index) => {
    parts.push({
      text: `User Reference Image ${index + 1} (${image.file.name}):`,
    });
    parts.push({
      inlineData: {
        mimeType: image.file.type,
        data: image.base64,
      },
    });
  });

  parts.push({
    text: 'Now, generate the professional prompt JSON based on all inputs and the system instruction.',
  });

  const systemInstruction =
    targetModel === TargetModel.VIDEO
      ? SYSTEM_INSTRUCTION_VIDEO
      : SYSTEM_INSTRUCTION_IMAGE;

  const response = await ai.models.generateContent({
    model: 'gemini-2.5-pro',
    contents: [{role: 'user', parts: parts}],
    config: {
      systemInstruction: systemInstruction,
      responseMimeType: 'application/json',
    },
  });

  const responseText = response.text;
  try {
    const parsedJson = JSON.parse(responseText);
    return parsedJson as EngineeredPrompt;
  } catch (e) {
    console.error('Failed to parse JSON response from prompt engineering:', e);
    throw new Error(
      'The AI returned an invalid response. Please try again. Raw response: ' +
        responseText,
    );
  }
};

export const generateImage = async (
  prompt: string,
  images: ImageFile[],
): Promise<{objectUrl: string}> => {
  const ai = new GoogleGenAI({apiKey: process.env.API_KEY});

  const parts: any[] = [{text: prompt}];
  images.forEach((image) => {
    parts.push({
      inlineData: {
        mimeType: image.file.type,
        data: image.base64,
      },
    });
  });

  const response = await ai.models.generateContent({
    model: 'gemini-2.5-flash-image',
    contents: {parts: parts},
    config: {
      responseModalities: [Modality.IMAGE],
    },
  });

  for (const part of response.candidates[0].content.parts) {
    if (part.inlineData) {
      const base64ImageBytes: string = part.inlineData.data;
      const imageUrl = `data:image/png;base64,${base64ImageBytes}`;
      return {objectUrl: imageUrl};
    }
  }

  throw new Error('No image was generated by the model.');
};
