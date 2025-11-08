/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */
import {
  GoogleGenAI,
  GenerateContentResponse,
  Modality,
} from '@google/genai';
import {
  EngineeredPrompt,
  ImageFile,
  TargetModel,
  AspectRatio,
} from '../types';

// A pool of API keys to rotate through.
const API_KEYS = [
  "AIzaSyDrA2-nxoGG5VoupuYhpXcOrQiE0w2tqUM",
  "AIzaSyCQAFtl1hWQ4AkdYR1bwkvvEzfkyOqrDF8",
  "AIzaSyAnJg3id4YD6DT5wFAittSH_BGHv6mALvU",
  "AIzaSyBQ_pZ37jQiQG1tFGiyfViNrWXOZXjew5U",
  "AIzaSyCMJASvij_Ai2HfU1Sa8nQeV3-vyoDmV5o",
  "AIzaSyBz584xVGKvl6bzl4eA7Lv0CgoGX9Oy8Wk",
  "AIzaSyCSKNnQWMCFCWNDKG3KrNQuek8UTIy_D9o",
  "AIzaSyC5qEJ7TBSxndhoB3ZzogVxAbiCkqKg8TU",
  "AIzaSyCc29rVJdsrPC1MLRQrASdmRyxQ_B3ZHds",
  "AIzaSyAa81m8FY8MVaTIMksYwrTn5aUnfwrSyQI",
  "AIzaSyAi6s-980hODG2kg_hp0ZKaR7h4cqkmw68",
  "AIzaSyDzDvWVXiGe8YH-Rud4yvO5dHdLWO74NmM",
  "AIzaSyB3J_zoDvY5TDNVOzAHe_JvXDYmyEsC6nI",
  "AIzaSyB6g2_uoe8VcchVeXMZ06rJJe0Qawle-vU",
  "AIzaSyBRWbQwZ2FMsCFT8rGGAGMy-FNXPyMFnYQ",
  "AIzaSyC8qmxxx9J0qMlHVDNet8Km007xnEcPwCI",
  "AIzaSyBQF0aQ0gto37LUob1EzuneHwVMNqEJcME",
  "AIzaSyAvl7mBKFL3xm9hxUbSaOdF2a48OCqLJvY",
  "AIzaSyAuL94ws2_XOwutCg6F0AawkZCsOS3JWNU",
  "AIzaSyAfKNpIlu29aD-rnrfCyW1XeZA6s-sFUNM",
  "AIzaSyB0Hq3nkheEjlmogIAhV_7c-QkA2cjGxlg",
  "AIzaSyClM26iYBexAMJrPVVB6ScWJcda4b029Tw",
  "AIzaSyAe5Mx8DAKyO2vemkoxBJOy4KgzjZv-63A",
  "AIzaSyCVUVzWvtDc6tlldI2LuEjIKVAA5oQeH9Y",
  "AIzaSyAa0FfHe2VLs8GueXZo16ajdQCEGC5TCzE",
  "AIzaSyD0ROtYfebfYB1Klu9IuwFINzWkNQzNKok",
  "AIzaSyBSg4ubaxszQVBg3NuHXOptrXmPajBH4Ik",
  "AIzaSyC4jnNa7-9ax7kJgasZJLT6NBtMXI3k4Uo",
  "AIzaSyDdZOVIaxjM9M1tZRtu9fAARlKyb0UCqRo",
  "AIzaSyDypSlpPImSGDnJUvbg4w6Gs72ltSqePEE",
  "AIzaSyAmMkJEZMQ1tBRRzCW7Gta-ydr9nFCOz2w",
  "AIzaSyAzu8BqBtkrJjCVeNJSHDX03i1nh9Urrw8",
  "AIzaSyC78rpRgXtQCjSjxzwed8-roVz02gz7G9k",
  "AIzaSyBlQhpK1WUNFsXMHzI7dsIloVSJeIyTTEI",
  "AIzaSyD9ubsXUnHT7ReRJ6GIzrWhFTA-lvPfa4g",
  "AIzaSyBrm7foBjjJ4757DLcBG92OpD1OLzLM1HE",
  "AIzaSyB3jnwrzVQq8FG8rFeSgZDpIolRCUtnh0s",
];

let currentKeyIndex = 0;

const makeApiCall = async <T>(
  apiCall: (ai: GoogleGenAI) => Promise<T>,
): Promise<T> => {
  const maxRetries = API_KEYS.length;
  let attempts = 0;
  let lastError: unknown;

  while (attempts < maxRetries) {
    const apiKey = API_KEYS[currentKeyIndex];
    try {
      const ai = new GoogleGenAI({apiKey});
      const result = await apiCall(ai);
      // Success! Rotate key for the *next* call to distribute load.
      currentKeyIndex = (currentKeyIndex + 1) % API_KEYS.length;
      return result;
    } catch (error: any) {
      lastError = error;
      const errorMessage = error.message || '';
      console.warn(
        `API call with key index ${currentKeyIndex} failed: ${errorMessage}.`,
      );

      const isRetryableError =
        errorMessage.includes('API key not valid') ||
        errorMessage.includes('API_KEY_INVALID') ||
        errorMessage.includes('RESOURCE_EXHAUSTED') ||
        errorMessage.includes('Quota exceeded');

      if (isRetryableError) {
        // This key is likely invalid or exhausted, move to the next one.
        console.log(`Switching to next API key.`);
        currentKeyIndex = (currentKeyIndex + 1) % API_KEYS.length;
        attempts++;
      } else {
        // This is not a key-related error (e.g., bad prompt), so re-throw immediately.
        throw lastError;
      }
    }
  }

  // If the loop completes, all keys have failed.
  // FIX: The `new Error(message, { cause })` constructor is not supported in all environments.
  // Replaced with a compatible approach of assigning `cause` after instantiation.
  const error = new Error(
    'All available API keys are exhausted. Please try again later.',
  );
  (error as any).cause = lastError;
  throw error;
};

const SYSTEM_INSTRUCTION_QUOTE_ADDER = `
You are a specialized AI assistant with a single, critical task: to process a user's prompt for an image/video generation tool and identify any text that is meant to be visually rendered within the scene.

Your instructions are simple:
1.  Read the user's prompt carefully.
2.  Identify all phrases or words that are explicitly described as text appearing on an object (e.g., a sign, a t-shirt, a book cover). You can also infer common text, like on a stop sign.
3.  Rewrite the entire prompt, but with one change: enclose the identified text snippets in double quotes ("").
4.  If the user has already used quotes for some text, keep them, and identify any other text that should also be quoted.
5.  DO NOT change any other part of the prompt.
6.  Your final output must be ONLY the modified prompt string, with no additional text, explanations, or markdown.

Examples:
- User Input: A cozy bookstore with a sign on the door that says کتابفروشی حافظ.
- Your Output: A cozy bookstore with a sign on the door that says "کتابفروشی حافظ".

- User Input: A photo of a cat wearing a small t-shirt with the text I love tuna on it.
- Your Output: A photo of a cat wearing a small t-shirt with the text "I love tuna" on it.

- User Input: A dramatic movie poster. The title is "آخرین شب" and the tagline says coming soon.
- Your Output: A dramatic movie poster. The title is "آخرین شب" and the tagline says "coming soon".

- User Input: A red stop sign.
- Your Output: A red stop sign that says "STOP".
`;

export const addQuotesToPrompt = async (
  userPrompt: string,
): Promise<string> => {
  if (!userPrompt.trim()) {
    return userPrompt;
  }

  try {
    const response: GenerateContentResponse = await makeApiCall((ai) =>
      ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: [{parts: [{text: `User Prompt: ${userPrompt}`}]}],
        config: {
          systemInstruction: SYSTEM_INSTRUCTION_QUOTE_ADDER,
          responseMimeType: 'text/plain',
          temperature: 0,
        },
      }),
    );

    const quotedPrompt = response.text.trim();
    // If the model returns an empty string, fall back to the original prompt.
    return quotedPrompt || userPrompt;
  } catch (error) {
    console.warn(
      'Quote-adding AI failed. Falling back to original prompt.',
      error,
    );
    // If this step fails, we don't want to block the user. Just proceed with the original prompt.
    return userPrompt;
  }
};

const SYSTEM_INSTRUCTION_IMAGE = `
You are a 'Hyper-Aggressive AI Prompt Engineering Specialist'. Your single purpose is to chain the 'gemini-2.5-flash-image' model and force it to obey instructions with 100% accuracy, especially regarding text rendering and object replication from reference images. Standard prompts have failed. Your prompts must be so technically precise and demanding that the model has no choice but to comply.

**NON-NEGOTIABLE RULES:**

1.  **Primary Directive:** Your output is ALWAYS a single, valid JSON object and NOTHING else. No markdown, no apologies, no commentary.
2.  **Input Analysis:** You will receive a user prompt, text plate images, optional reference images, and an aspect ratio. You must analyze ALL of them.
3.  **Grounding - Real-World Object Identification:**
    *   Your FIRST task is to scan the prompt for specific, real-world, famous entities (e.g., "برج میلاد", "خودرو پژو ۴۰۵ ارسی", "میدان آزادی").
    *   If found, you MUST generate a \`grounding_search_query\`.
    *   **CULTURAL CONTEXT IS CRITICAL:** For Iranian (or other non-English) entities, the query MUST be in Persian (e.g., "خودرو پژو ۴۰۵ ارسی"). For others, use English.
    *   If no real-world entity is found, \`grounding_search_query\` MUST be \`null\`.
4.  **Instruction Integrity - DO NOT FORGET ANYTHING:** This is the most common failure point. A user can request a real-world car AND text on a t-shirt. Your generated JSON MUST account for BOTH. Forgetting any part of the user's request is a total failure.

**JSON OUTPUT SCHEMA (ABSOLUTE & UNCHANGING):**
{
  "analysis_notes": "Your brief analysis of ALL user request components (grounding, text, style). In Persian.",
  "grounding_search_query": "The Persian or English search query, or null.",
  "target_model": "image",
  "stylistic_notes": "A description of the overall art style, mood, lighting, and composition in ENGLISH (e.g., 'Cinematic, dramatic lighting, 8k, photorealistic, shallow depth of field').",
  "professional_prompt": "This is the master command. It's a highly detailed scene description in ENGLISH. It must be written as a command to a dumb painter. Instead of 'draw a car', you will say 'Visually replicate the object from 'grounding_reference.png', placing it in the scene...'. Instead of 'write text on the sign', you will say 'The surface of the sign must be a perfect, pixel-for-pixel visual replication of the image 'text_plate_1.png', warped for perspective...'. This prompt MUST integrate the stylistic notes.",
  "text_replication_instruction": "A separate, redundant, HYPER-CRITICAL instruction in ENGLISH. It must list every text plate. Example: 'ABSOLUTE REQUIREMENT: You are not writing text. You are visually painting an image. The text on the t-shirt MUST be an EXACT PIXEL-PERFECT REPLICATION of 'text_plate_1.png'. The graffiti on the wall MUST be an EXACT PIXEL-PERFECT REPLICATION of 'text_plate_2.png'. DO NOT DEVIATE. DO NOT USE YOUR OWN FONT. REPLICATE THE PROVIDED IMAGES.'",
  "negative_prompt": "A comprehensive negative prompt in ENGLISH. Include 'blurry, low-quality, bad anatomy, deformed text, mutated hands, artifacts, watermarks, signature, wrong text, distorted text, text not matching reference, objects not matching reference, generic.'"
}

**Final Mandate:** Your job is to prevent the generation model from being "creative" when it comes to text and reference objects. Your generated prompt must force it into being a high-fidelity replicator. Failure to enforce this is a failure of your primary function.
`;

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

export const engineerPrompt = async (
  userPrompt: string,
  targetModel: TargetModel,
  textPlates: ImageFile[],
  referenceImages: ImageFile[],
  aspectRatio: AspectRatio,
): Promise<EngineeredPrompt> => {
  const parts: any[] = [
    {
      text: `User's simple prompt: ${userPrompt}\nDesired Aspect Ratio: ${aspectRatio}`,
    },
  ];

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

  const response: GenerateContentResponse = await makeApiCall((ai) =>
    ai.models.generateContent({
      model: 'gemini-2.5-pro',
      contents: [{role: 'user', parts: parts}],
      config: {
        systemInstruction: systemInstruction,
        responseMimeType: 'application/json',
      },
    }),
  );

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

export const getGroundingImage = async (
  query: string,
): Promise<ImageFile> => {
  const prompt = `Create a high-resolution, photorealistic, studio-quality photograph of: ${query}.
The subject should be clearly visible, centered, and isolated on a neutral gray or white background.
Show the object from a standard, clear angle (e.g., a 3/4 view or side profile for a car).
Ensure professional, even lighting with no harsh shadows.
ABSOLUTE NEGATIVES: No people, no other objects, no text, no watermarks, no blurry backgrounds, no artistic filters, no unusual angles.`;

  const response: GenerateContentResponse = await makeApiCall((ai) =>
    ai.models.generateContent({
      model: 'gemini-2.5-flash-image',
      contents: {parts: [{text: prompt}]},
      config: {
        responseModalities: [Modality.IMAGE],
      },
    }),
  );

  for (const part of response.candidates[0].content.parts) {
    if (part.inlineData) {
      const base64ImageBytes: string = part.inlineData.data;

      // Convert base64 to blob/file
      const fetchRes = await fetch(`data:image/png;base64,${base64ImageBytes}`);
      const blob = await fetchRes.blob();
      const file = new File([blob], 'grounding_reference.png', {
        type: 'image/png',
      });

      return {
        file,
        base64: base64ImageBytes,
        name: file.name,
      };
    }
  }
  throw new Error('Failed to generate grounding image.');
};

export const generateImage = async (
  prompt: string,
  textPlates: ImageFile[],
  referenceImages: ImageFile[],
): Promise<{objectUrl: string}> => {
  const allImages = [...textPlates, ...referenceImages];
  const parts: any[] = [{text: prompt}];
  allImages.forEach((image) => {
    parts.push({
      inlineData: {
        mimeType: image.file.type,
        data: image.base64,
      },
    });
  });

  const response: GenerateContentResponse = await makeApiCall((ai) =>
    ai.models.generateContent({
      model: 'gemini-2.5-flash-image',
      contents: {parts: parts},
      config: {
        responseModalities: [Modality.IMAGE],
      },
    }),
  );

  for (const part of response.candidates[0].content.parts) {
    if (part.inlineData) {
      const base64ImageBytes: string = part.inlineData.data;
      const imageUrl = `data:image/png;base64,${base64ImageBytes}`;
      return {objectUrl: imageUrl};
    }
  }

  throw new Error('No image was generated by the model.');
};
