import React, { useRef, useState, useEffect, useCallback } from 'react';
import { CropArea, AspectRatio } from '../types';

interface CropOverlayProps {
  width: number;
  height: number;
  aspectRatio: number; // 0 for free
  onCropChange: (crop: CropArea) => void;
}

const HANDLE_SIZE = 20;

const CropOverlay: React.FC<CropOverlayProps> = ({ width, height, aspectRatio, onCropChange }) => {
  const [crop, setCrop] = useState<CropArea>({ x: 0, y: 0, width: width, height: height, unit: 'px' });
  const [isDragging, setIsDragging] = useState(false);
  const [dragHandle, setDragHandle] = useState<string | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const startPos = useRef({ x: 0, y: 0, cx: 0, cy: 0, cw: 0, ch: 0 });

  // Initialize crop centered
  useEffect(() => {
    let initW = width * 0.8;
    let initH = height * 0.8;
    
    if (aspectRatio !== 0) {
      if (width / height > aspectRatio) {
        // Image is wider than target
        initH = height * 0.8;
        initW = initH * aspectRatio;
      } else {
        initW = width * 0.8;
        initH = initW / aspectRatio;
      }
    }

    const initX = (width - initW) / 2;
    const initY = (height - initH) / 2;
    
    const newCrop = { x: initX, y: initY, width: initW, height: initH, unit: 'px' as const };
    setCrop(newCrop);
    onCropChange(newCrop);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [width, height, aspectRatio]);

  const handlePointerDown = (e: React.PointerEvent, handle: string) => {
    e.stopPropagation();
    e.preventDefault();
    setIsDragging(true);
    setDragHandle(handle);
    containerRef.current?.setPointerCapture(e.pointerId);
    startPos.current = {
      x: e.clientX,
      y: e.clientY,
      cx: crop.x,
      cy: crop.y,
      cw: crop.width,
      ch: crop.height
    };
  };

  const handlePointerMove = useCallback((e: React.PointerEvent) => {
    if (!isDragging) return;
    
    const dx = e.clientX - startPos.current.x;
    const dy = e.clientY - startPos.current.y;
    
    let next = { ...crop };

    if (dragHandle === 'move') {
      next.x = Math.max(0, Math.min(width - crop.width, startPos.current.cx + dx));
      next.y = Math.max(0, Math.min(height - crop.height, startPos.current.cy + dy));
    } else {
      // Resizing logic simplified
      if (dragHandle?.includes('e')) next.width = Math.max(50, Math.min(width - crop.x, startPos.current.cw + dx));
      if (dragHandle?.includes('s')) next.height = Math.max(50, Math.min(height - crop.y, startPos.current.ch + dy));
      
      // Enforce aspect ratio
      if (aspectRatio !== 0) {
         if (dragHandle?.includes('e')) next.height = next.width / aspectRatio;
         if (dragHandle?.includes('s')) next.width = next.height * aspectRatio;
         
         // Boundary check after aspect fix
         if (next.width + next.x > width) {
            next.width = width - next.x;
            next.height = next.width / aspectRatio;
         }
         if (next.height + next.y > height) {
           next.height = height - next.y;
           next.width = next.height * aspectRatio;
         }
      }
    }

    setCrop(next);
    onCropChange(next);
  }, [isDragging, dragHandle, crop, width, height, aspectRatio, onCropChange]);

  const handlePointerUp = (e: React.PointerEvent) => {
    setIsDragging(false);
    setDragHandle(null);
    containerRef.current?.releasePointerCapture(e.pointerId);
  };

  return (
    <div 
      ref={containerRef}
      className="absolute top-0 left-0 touch-none select-none z-20"
      style={{ width, height }}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
    >
      {/* Dark overlay outside */}
      <div className="absolute bg-black/50 w-full h-full pointer-events-none" 
           style={{
             clipPath: `polygon(0% 0%, 0% 100%, ${crop.x}px 100%, ${crop.x}px ${crop.y}px, ${crop.x + crop.width}px ${crop.y}px, ${crop.x + crop.width}px ${crop.y + crop.height}px, ${crop.x}px ${crop.y + crop.height}px, ${crop.x}px 100%, 100% 100%, 100% 0%)`
           }}>
      </div>

      {/* Crop Box */}
      <div 
        className="absolute outline outline-2 outline-white cursor-move hover:outline-brand-400 transition-colors"
        style={{
          left: crop.x,
          top: crop.y,
          width: crop.width,
          height: crop.height,
          boxShadow: '0 0 0 9999px rgba(0, 0, 0, 0.5)' // Alternative to clip-path for simple overlay
        }}
        onPointerDown={(e) => handlePointerDown(e, 'move')}
      >
        {/* Grid Lines */}
        <div className="absolute inset-0 grid grid-cols-3 grid-rows-3 pointer-events-none opacity-50">
           <div className="border-r border-white/30 col-span-1 row-span-3"></div>
           <div className="border-r border-white/30 col-span-1 row-span-3"></div>
           <div className="border-b border-white/30 col-span-3 row-span-1 absolute w-full top-1/3"></div>
           <div className="border-b border-white/30 col-span-3 row-span-1 absolute w-full top-2/3"></div>
        </div>

        {/* Handles */}
        <div 
            className="absolute -right-2 -bottom-2 w-6 h-6 bg-brand-500 rounded-full cursor-nwse-resize border-2 border-white z-30"
            onPointerDown={(e) => handlePointerDown(e, 'se')}
        />
      </div>
    </div>
  );
};

export default CropOverlay;