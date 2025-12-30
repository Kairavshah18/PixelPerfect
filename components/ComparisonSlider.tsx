import React, { useState, useRef, useCallback, useEffect } from 'react';
import { Icons } from './Icon';

interface ComparisonSliderProps {
  beforeImage: string;
  afterImage: string;
  aspectRatio: number;
}

const ComparisonSlider: React.FC<ComparisonSliderProps> = ({ beforeImage, afterImage, aspectRatio }) => {
  const [sliderPosition, setSliderPosition] = useState(50);
  const [isDragging, setIsDragging] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const handleMove = useCallback((clientX: number) => {
    if (containerRef.current) {
      const rect = containerRef.current.getBoundingClientRect();
      const x = Math.max(0, Math.min(clientX - rect.left, rect.width));
      const percentage = (x / rect.width) * 100;
      setSliderPosition(percentage);
    }
  }, []);

  const handlePointerDown = () => setIsDragging(true);
  const handlePointerUp = () => setIsDragging(false);
  const handlePointerMove = (e: React.PointerEvent) => {
    if (isDragging) {
      handleMove(e.clientX);
    }
  };

  useEffect(() => {
    const handleGlobalUp = () => setIsDragging(false);
    const handleGlobalMove = (e: MouseEvent) => {
        if (isDragging) handleMove(e.clientX);
    };

    if (isDragging) {
        window.addEventListener('mouseup', handleGlobalUp);
        window.addEventListener('mousemove', handleGlobalMove);
    }
    return () => {
        window.removeEventListener('mouseup', handleGlobalUp);
        window.removeEventListener('mousemove', handleGlobalMove);
    };
  }, [isDragging, handleMove]);

  return (
    <div 
      className="relative w-full h-full flex items-center justify-center select-none"
    >
      <div 
        ref={containerRef}
        className="relative w-full max-w-full max-h-full overflow-hidden shadow-2xl rounded-sm"
        style={{ 
            aspectRatio: aspectRatio > 0 ? `${aspectRatio}` : 'auto' 
        }}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
      >
        {/* After Image (Background) */}
        <img 
          src={afterImage} 
          alt="After" 
          className="absolute inset-0 w-full h-full object-contain bg-slate-900" 
          draggable={false}
        />
        
        {/* Label After */}
        <div className="absolute top-4 right-4 bg-black/50 text-white px-2 py-1 text-xs rounded font-medium backdrop-blur-sm pointer-events-none z-10">
            After
        </div>

        {/* Before Image (Foreground - Clipped) */}
        <div 
            className="absolute inset-0 w-full h-full bg-slate-900"
            style={{ 
                clipPath: `inset(0 ${100 - sliderPosition}% 0 0)` 
            }}
        >
            <img 
                src={beforeImage} 
                alt="Before" 
                className="w-full h-full object-contain" 
                draggable={false}
            />
             {/* Label Before */}
            <div className="absolute top-4 left-4 bg-black/50 text-white px-2 py-1 text-xs rounded font-medium backdrop-blur-sm pointer-events-none z-10">
                Before
            </div>
        </div>

        {/* Slider Handle */}
        <div 
            className="absolute inset-y-0 w-0.5 bg-white cursor-ew-resize z-20 hover:shadow-[0_0_10px_rgba(255,255,255,0.5)] transition-shadow"
            style={{ left: `${sliderPosition}%` }}
        >
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-8 h-8 bg-white rounded-full shadow-lg flex items-center justify-center text-brand-600">
                <Icons.Move className="w-4 h-4" />
            </div>
        </div>
      </div>
    </div>
  );
};

export default ComparisonSlider;