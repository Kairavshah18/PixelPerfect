export interface ImageState {
  originalUrl: string | null;
  currentUrl: string | null;
  filename: string;
  width: number;
  height: number;
  fileSize: number;
  type: string;
}

export interface CropArea {
  x: number;
  y: number;
  width: number;
  height: number;
  unit: 'px' | '%';
}

export interface Point {
  x: number;
  y: number;
}

export interface Stroke {
  points: Point[];
  size: number;
  color: string;
}

export enum AspectRatio {
  FREE = 'Free',
  SQUARE = '1:1',
  LANDSCAPE = '16:9',
  PORTRAIT = '4:5',
  VIDEO = '4:3'
}

export enum AppMode {
  UPLOAD = 'UPLOAD',
  EDIT = 'EDIT',
  PREVIEW = 'PREVIEW',
  MASK = 'MASK'
}

export type ExportFormat = 'png' | 'jpeg' | 'webp';

export interface ProcessingOptions {
  scale: number; // 0.25 to 4
  maintainAspect: boolean;
  crop?: CropArea;
  format: ExportFormat;
  quality: number; // 0.1 to 1.0
}