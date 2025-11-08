/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */
// FIX: Added import for Video type from @google/genai
import {Video} from '@google/genai';

export enum AppState {
  IDLE,
  LOADING,
  SUCCESS,
  ERROR,
  // FIX: Added state for prompt engineering loading phase
  PROMPT_ENGINEERING_LOADING,
}

export interface ImageFile {
  file: File;
  base64: string;
  name: string;
}

// FIX: Added VideoFile type
export interface VideoFile extends ImageFile {}

// FIX: Add TargetModel enum to be in sync with services/geminiService.ts
export enum TargetModel {
  IMAGE = 'image',
  VIDEO = 'video',
}

export interface EngineeredPrompt {
  analysis_notes: string;
  stylistic_notes: string;
  professional_prompt: string;
  text_replication_instruction: string;
  negative_prompt: string;
  // FIX: Added missing target_model property
  target_model: string;
  grounding_search_query?: string | null;
}

// FIX: Added types for Veo Video Generation
export enum VeoModel {
  VEO = 'veo-3.1-generate-preview',
  VEO_FAST = 'veo-3.1-fast-generate-preview',
}

export enum AspectRatio {
  SQUARE = '1:1',
  LANDSCAPE = '16:9',
  PORTRAIT = '9:16',
}

export enum Resolution {
  P720 = '720p',
  P1080 = '1080p',
}

export enum GenerationMode {
  TEXT_TO_VIDEO = 'Text to Video',
  FRAMES_TO_VIDEO = 'Frames to Video',
  REFERENCES_TO_VIDEO = 'References to Video',
  EXTEND_VIDEO = 'Extend Video',
}

export interface GenerateVideoParams {
  prompt: string;
  model: VeoModel;
  aspectRatio: AspectRatio;
  resolution: Resolution;
  mode: GenerationMode;
  startFrame: ImageFile | null;
  endFrame: ImageFile | null;
  referenceImages: ImageFile[];
  styleImage: ImageFile | null;
  inputVideo: VideoFile | null;
  inputVideoObject: Video | null;
  isLooping: boolean;
}