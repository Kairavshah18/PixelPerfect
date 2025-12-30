import { AspectRatio } from './types';

export const ASPECT_RATIOS = [
  { label: 'Freeform', value: AspectRatio.FREE, ratio: 0 },
  { label: 'Square (1:1)', value: AspectRatio.SQUARE, ratio: 1 },
  { label: 'YouTube (16:9)', value: AspectRatio.LANDSCAPE, ratio: 16 / 9 },
  { label: 'Instagram (4:5)', value: AspectRatio.PORTRAIT, ratio: 4 / 5 },
  { label: 'Standard (4:3)', value: AspectRatio.VIDEO, ratio: 4 / 3 },
];

export const MAX_FILE_SIZE_MB = 10;
export const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp'];

export const SCALE_PRESETS = [0.25, 0.5, 0.75, 1, 1.5, 2, 4];