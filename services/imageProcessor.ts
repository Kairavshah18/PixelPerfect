import { CropArea, ProcessingOptions, Stroke } from '../types';

export const loadImage = (url: string): Promise<HTMLImageElement> => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.src = url;
    img.onload = () => resolve(img);
    img.onerror = (e) => reject(e);
  });
};

export const processImage = async (
  imageUrl: string,
  options: ProcessingOptions
): Promise<{ url: string; blob: Blob }> => {
  const img = await loadImage(imageUrl);
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');

  if (!ctx) throw new Error('Could not get canvas context');

  // 1. Calculate Crop
  let sx = 0, sy = 0, sw = img.width, sh = img.height;
  
  if (options.crop) {
    if (options.crop.unit === '%') {
      sx = (options.crop.x / 100) * img.width;
      sy = (options.crop.y / 100) * img.height;
      sw = (options.crop.width / 100) * img.width;
      sh = (options.crop.height / 100) * img.height;
    } else {
      sx = options.crop.x;
      sy = options.crop.y;
      sw = options.crop.width;
      sh = options.crop.height;
    }
  }

  // 2. Calculate Scale
  const scale = options.scale || 1;
  const dw = sw * scale;
  const dh = options.maintainAspect ? sh * scale : (sh * scale); 

  canvas.width = dw;
  canvas.height = dh;

  // Better interpolation for downscaling/upscaling
  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = 'high';

  // Draw
  ctx.drawImage(img, sx, sy, sw, sh, 0, 0, dw, dh);

  return new Promise((resolve, reject) => {
    const mimeType = `image/${options.format}`;
    canvas.toBlob(
      (blob) => {
        if (!blob) return reject(new Error('Canvas conversion failed'));
        const url = URL.createObjectURL(blob);
        resolve({ url, blob });
      },
      mimeType,
      options.quality
    );
  });
};

// Expand image for generative fill (Outpainting)
export const expandImageCanvas = async (
    imageUrl: string, 
    aspectRatio: number, // width / height
    fillColor: string = 'rgba(0,0,0,0)'
): Promise<{ url: string; blob: Blob }> => {
    const img = await loadImage(imageUrl);
    const currentRatio = img.width / img.height;
    
    let newW = img.width;
    let newH = img.height;
    
    // If target is wider than current
    if (aspectRatio > currentRatio) {
        newW = img.height * aspectRatio;
    } else {
        newH = img.width / aspectRatio;
    }

    const canvas = document.createElement('canvas');
    canvas.width = newW;
    canvas.height = newH;
    const ctx = canvas.getContext('2d');
    if (!ctx) throw new Error("Context failed");
    
    // Fill background
    ctx.fillStyle = fillColor;
    ctx.fillRect(0,0,newW, newH);
    
    // Center image
    const dx = (newW - img.width) / 2;
    const dy = (newH - img.height) / 2;
    ctx.drawImage(img, dx, dy);
    
    return new Promise((resolve) => {
        canvas.toBlob(blob => {
            if(blob) resolve({ url: URL.createObjectURL(blob), blob });
        }, 'image/png');
    });
};

// Composite mask onto image for "Visual Prompting"
export const compositeMaskOntoImage = async (
    imageUrl: string,
    strokes: Stroke[],
    originalWidth: number,
    originalHeight: number
): Promise<{ blob: Blob }> => {
    const img = await loadImage(imageUrl);
    const canvas = document.createElement('canvas');
    canvas.width = originalWidth;
    canvas.height = originalHeight;
    const ctx = canvas.getContext('2d');
    if(!ctx) throw new Error("Context failed");
    
    // 1. Draw original image
    ctx.drawImage(img, 0, 0, originalWidth, originalHeight);
    
    // 2. Draw strokes
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    
    strokes.forEach(stroke => {
        ctx.beginPath();
        ctx.strokeStyle = stroke.color; // e.g. "rgba(255, 0, 0, 0.5)"
        ctx.lineWidth = stroke.size;
        if (stroke.points.length > 0) {
            ctx.moveTo(stroke.points[0].x, stroke.points[0].y);
            for (let i = 1; i < stroke.points.length; i++) {
                ctx.lineTo(stroke.points[i].x, stroke.points[i].y);
            }
        }
        ctx.stroke();
    });

    return new Promise((resolve, reject) => {
        canvas.toBlob(blob => {
            if (blob) resolve({ blob });
            else reject(new Error("Mask composite failed"));
        }, 'image/png');
    });
};


// Helper to calculate file size string
export const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};