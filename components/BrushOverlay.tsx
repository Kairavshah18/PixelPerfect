import React, { useRef, useEffect, useState } from 'react';
import { Stroke, Point } from '../types';

interface BrushOverlayProps {
  width: number;
  height: number;
  brushSize: number;
  onStrokesChange: (strokes: Stroke[]) => void;
}

const BrushOverlay: React.FC<BrushOverlayProps> = ({ width, height, brushSize, onStrokesChange }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [currentPoints, setCurrentPoints] = useState<Point[]>([]);
  const [strokes, setStrokes] = useState<Stroke[]>([]);

  // Repaint canvas when strokes change
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.clearRect(0, 0, width, height);
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';

    const drawStroke = (stroke: Stroke) => {
        ctx.beginPath();
        ctx.strokeStyle = stroke.color; // Display color (e.g., semi-transparent red)
        ctx.lineWidth = stroke.size;
        if (stroke.points.length > 0) {
            ctx.moveTo(stroke.points[0].x, stroke.points[0].y);
            for (let i = 1; i < stroke.points.length; i++) {
                ctx.lineTo(stroke.points[i].x, stroke.points[i].y);
            }
        }
        ctx.stroke();
    };

    strokes.forEach(drawStroke);
    
    // Draw current stroke being drawn
    if (currentPoints.length > 0) {
        drawStroke({
            points: currentPoints,
            size: brushSize,
            color: 'rgba(255, 50, 50, 0.5)'
        });
    }

    onStrokesChange(strokes);
  }, [strokes, currentPoints, width, height, brushSize, onStrokesChange]);

  const getPoint = (e: React.PointerEvent) => {
     const rect = canvasRef.current?.getBoundingClientRect();
     if (!rect) return { x: 0, y: 0 };
     
     // We need to map client coordinates to canvas internal coordinates
     // The canvas internal resolution is `width` x `height`
     // The displayed size is `rect.width` x `rect.height`
     
     const scaleX = width / rect.width;
     const scaleY = height / rect.height;

     return {
        x: (e.clientX - rect.left) * scaleX,
        y: (e.clientY - rect.top) * scaleY
     };
  };

  const handlePointerDown = (e: React.PointerEvent) => {
    e.stopPropagation(); // Prevent dragging the image if draggable
    canvasRef.current?.setPointerCapture(e.pointerId);
    setIsDrawing(true);
    setCurrentPoints([getPoint(e)]);
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!isDrawing) return;
    setCurrentPoints(prev => [...prev, getPoint(e)]);
  };

  const handlePointerUp = (e: React.PointerEvent) => {
    if (!isDrawing) return;
    setIsDrawing(false);
    canvasRef.current?.releasePointerCapture(e.pointerId);
    
    if (currentPoints.length > 0) {
        setStrokes(prev => [...prev, {
            points: currentPoints,
            size: brushSize,
            color: 'rgba(255, 50, 50, 0.5)'
        }]);
    }
    setCurrentPoints([]);
  };

  return (
    <canvas 
      ref={canvasRef}
      width={width}
      height={height}
      className="absolute inset-0 z-30 touch-none cursor-crosshair"
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
    />
  );
};

export default BrushOverlay;