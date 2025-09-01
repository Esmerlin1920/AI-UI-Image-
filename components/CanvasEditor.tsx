
import React, { useRef, useEffect, useState, useImperativeHandle, forwardRef, useCallback } from 'react';
import type { CanvasEditorRef } from '../types';
import { Tool } from '../types';
import { BrushIcon, RectangleIcon, EraserIcon } from './icons/ToolIcons';

interface CanvasEditorProps {
  baseImage: string | null;
}

const CanvasEditor = forwardRef<CanvasEditorRef, CanvasEditorProps>(({ baseImage }, ref) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const imageCanvasRef = useRef<HTMLCanvasElement>(null);
  const maskCanvasRef = useRef<HTMLCanvasElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [activeTool, setActiveTool] = useState<Tool>(Tool.Brush);
  const [brushSize, setBrushSize] = useState(20);
  const [rectStart, setRectStart] = useState<{ x: number; y: number } | null>(null);

  const drawImage = useCallback(() => {
    const canvas = imageCanvasRef.current;
    const container = containerRef.current;
    if (!canvas || !baseImage || !container) return;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const img = new Image();
    img.src = baseImage;
    img.onload = () => {
      const containerWidth = container.clientWidth;
      const containerHeight = container.clientHeight;
      const scale = Math.min(containerWidth / img.width, containerHeight / img.height, 1);
      
      canvas.width = img.width;
      canvas.height = img.height;
      canvas.style.width = `${img.width * scale}px`;
      canvas.style.height = `${img.height * scale}px`;

      const maskCanvas = maskCanvasRef.current;
      if (maskCanvas) {
        maskCanvas.width = img.width;
        maskCanvas.height = img.height;
        maskCanvas.style.width = `${img.width * scale}px`;
        maskCanvas.style.height = `${img.height * scale}px`;
        const maskCtx = maskCanvas.getContext('2d');
        if (maskCtx) {
          maskCtx.fillStyle = 'rgba(0,0,0,0.5)';
          maskCtx.fillRect(0, 0, maskCanvas.width, maskCanvas.height);
        }
      }

      ctx.drawImage(img, 0, 0);
    };
  }, [baseImage]);
  
  useEffect(() => {
    drawImage();
    window.addEventListener('resize', drawImage);
    return () => window.removeEventListener('resize', drawImage);
  }, [baseImage, drawImage]);

  useImperativeHandle(ref, () => ({
    exportMask: () => {
      const canvas = maskCanvasRef.current;
      if (!canvas) return '';
      const finalMaskCanvas = document.createElement('canvas');
      finalMaskCanvas.width = canvas.width;
      finalMaskCanvas.height = canvas.height;
      const finalCtx = finalMaskCanvas.getContext('2d');
      if (!finalCtx) return '';

      finalCtx.fillStyle = 'black';
      finalCtx.fillRect(0, 0, finalMaskCanvas.width, finalMaskCanvas.height);

      finalCtx.globalCompositeOperation = 'destination-out';
      finalCtx.drawImage(canvas, 0, 0);
      finalCtx.globalCompositeOperation = 'source-over';
      
      return finalMaskCanvas.toDataURL('image/png');
    },
    clearAll: () => {
       const canvas = imageCanvasRef.current;
       const maskCanvas = maskCanvasRef.current;
       if(canvas) {
          const ctx = canvas.getContext('2d');
          ctx?.clearRect(0,0, canvas.width, canvas.height);
       }
       if(maskCanvas) {
          const maskCtx = maskCanvas.getContext('2d');
          maskCtx?.clearRect(0,0, maskCanvas.width, maskCanvas.height);
       }
    }
  }));

  const getCoords = (e: React.MouseEvent<HTMLCanvasElement>): { x: number; y: number } => {
    const canvas = maskCanvasRef.current;
    if (!canvas) return { x: 0, y: 0 };
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    return {
      x: (e.clientX - rect.left) * scaleX,
      y: (e.clientY - rect.top) * scaleY,
    };
  };

  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!baseImage) return;
    setIsDrawing(true);
    const coords = getCoords(e);
    if (activeTool === Tool.Rectangle) {
        setRectStart(coords);
    } else {
        draw(e);
    }
  };

  const endDrawing = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return;
    setIsDrawing(false);
     const canvas = maskCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx || !rectStart) return;

    if (activeTool === Tool.Rectangle) {
        const endCoords = getCoords(e);
        ctx.clearRect(rectStart.x, rectStart.y, endCoords.x - rectStart.x, endCoords.y - rectStart.y);
    }
    setRectStart(null);
  };

  const draw = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDrawing || activeTool === Tool.Rectangle) return;
    const canvas = maskCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const { x, y } = getCoords(e);
    
    ctx.globalCompositeOperation = 'destination-out';
    if(activeTool === Tool.Eraser) {
        ctx.globalCompositeOperation = 'source-over';
        ctx.fillStyle = 'rgba(0,0,0,0.5)';
        ctx.beginPath();
        ctx.arc(x, y, brushSize / 2, 0, Math.PI * 2);
        ctx.fill();
    } else { // Brush
        ctx.beginPath();
        ctx.arc(x, y, brushSize / 2, 0, Math.PI * 2);
        ctx.fill();
    }
  };

  const ToolButton: React.FC<{ tool: Tool; icon: React.ReactNode; label: string }> = ({ tool, icon, label }) => (
    <button
      title={label}
      onClick={() => setActiveTool(tool)}
      className={`p-2 rounded-md transition-colors ${activeTool === tool ? 'bg-cyan-600 text-white' : 'bg-gray-700 hover:bg-gray-600 text-gray-300'}`}
    >
      {icon}
    </button>
  );

  return (
    <div className="w-full h-full flex flex-col items-center justify-center gap-2">
      <div ref={containerRef} className="relative w-full h-full flex items-center justify-center">
        {baseImage ? (
          <>
            <canvas ref={imageCanvasRef} className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />
            <canvas
              ref={maskCanvasRef}
              className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 cursor-crosshair"
              onMouseDown={startDrawing}
              onMouseUp={endDrawing}
              onMouseOut={endDrawing}
              onMouseMove={draw}
            />
          </>
        ) : (
          <div className="text-gray-500">
            Sube una imagen base para comenzar a editar.
          </div>
        )}
      </div>
      {baseImage && (
        <div className="bg-gray-800 p-2 rounded-lg flex items-center gap-4">
            <div className="flex items-center gap-2">
                <ToolButton tool={Tool.Brush} icon={<BrushIcon />} label="Pincel" />
                <ToolButton tool={Tool.Rectangle} icon={<RectangleIcon />} label="Rectángulo" />
                <ToolButton tool={Tool.Eraser} icon={<EraserIcon />} label="Borrador" />
            </div>
            <div className="flex items-center gap-2 text-sm text-gray-300">
                <label htmlFor="brushSize">Tamaño:</label>
                <input
                    type="range"
                    id="brushSize"
                    min="5"
                    max="100"
                    value={brushSize}
                    onChange={(e) => setBrushSize(Number(e.target.value))}
                    className="w-24"
                />
                <span>{brushSize}</span>
            </div>
        </div>
      )}
    </div>
  );
});

export default CanvasEditor;
