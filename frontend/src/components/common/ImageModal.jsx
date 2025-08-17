import React, { useEffect, useRef } from 'react';
import { X, ZoomIn, ZoomOut, RotateCw, Download } from 'lucide-react';
import { useState } from 'react';

const ImageModal = ({ image, isOpen, onClose }) => {
  const [scale, setScale] = useState(1);
  const [rotation, setRotation] = useState(0);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  
  const modalRef = useRef(null);
  const imageRef = useRef(null);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }

    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  useEffect(() => {
    const handleKeyDown = (e) => {
      switch (e.key) {
        case 'Escape':
          onClose();
          break;
        case 'ArrowLeft':
          setPosition(prev => ({ ...prev, x: prev.x - 50 }));
          break;
        case 'ArrowRight':
          setPosition(prev => ({ ...prev, x: prev.x + 50 }));
          break;
        case 'ArrowUp':
          setPosition(prev => ({ ...prev, y: prev.y - 50 }));
          break;
        case 'ArrowDown':
          setPosition(prev => ({ ...prev, y: prev.y + 50 }));
          break;
        case '0':
          resetTransform();
          break;
        case '+':
        case '=':
          setScale(prev => Math.min(prev * 1.2, 5));
          break;
        case '-':
          setScale(prev => Math.max(prev / 1.2, 0.1));
          break;
        case 'r':
          setRotation(prev => prev + 90);
          break;
        default:
          break;
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleKeyDown);
    }

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose]);

  const resetTransform = () => {
    setScale(1);
    setRotation(0);
    setPosition({ x: 0, y: 0 });
  };

  const handleMouseDown = (e) => {
    if (scale > 1) {
      setIsDragging(true);
      setDragStart({
        x: e.clientX - position.x,
        y: e.clientY - position.y
      });
    }
  };

  const handleMouseMove = (e) => {
    if (isDragging && scale > 1) {
      setPosition({
        x: e.clientX - dragStart.x,
        y: e.clientY - dragStart.y
      });
    }
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const handleWheel = (e) => {
    e.preventDefault();
    const delta = e.deltaY > 0 ? 0.9 : 1.1;
    setScale(prev => Math.max(0.1, Math.min(5, prev * delta)));
  };

  const handleDownload = async () => {
    try {
      const response = await fetch(image.url);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `image-${Date.now()}.jpg`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Download failed:', error);
    }
  };

  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 bg-black/90 backdrop-blur-sm flex items-center justify-center z-50 p-4"
      onClick={(e) => e.target === e.currentTarget && onClose()}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onWheel={handleWheel}
    >
      {/* Toolbar */}
      <div className="absolute top-4 left-1/2 transform -translate-x-1/2 bg-black/50 backdrop-blur-sm rounded-full px-4 py-2 flex items-center gap-3 z-10">
        <button
          onClick={() => setScale(prev => Math.max(0.1, prev / 1.2))}
          className="p-2 bg-white/20 hover:bg-white/30 rounded-full transition-colors text-white"
          title="Zoom Out (or -)"
        >
          <ZoomOut size={18} />
        </button>
        
        <span className="text-white text-sm font-medium min-w-[60px] text-center">
          {Math.round(scale * 100)}%
        </span>
        
        <button
          onClick={() => setScale(prev => Math.min(5, prev * 1.2))}
          className="p-2 bg-white/20 hover:bg-white/30 rounded-full transition-colors text-white"
          title="Zoom In (or +)"
        >
          <ZoomIn size={18} />
        </button>
        
        <button
          onClick={() => setRotation(prev => prev + 90)}
          className="p-2 bg-white/20 hover:bg-white/30 rounded-full transition-colors text-white"
          title="Rotate (or R)"
        >
          <RotateCw size={18} />
        </button>
        
        <button
          onClick={handleDownload}
          className="p-2 bg-white/20 hover:bg-white/30 rounded-full transition-colors text-white"
          title="Download"
        >
          <Download size={18} />
        </button>
        
        <button
          onClick={resetTransform}
          className="px-3 py-1 bg-white/20 hover:bg-white/30 rounded-full transition-colors text-white text-xs font-medium"
          title="Reset (or 0)"
        >
          Reset
        </button>
      </div>

      {/* Close Button */}
      <button
        onClick={onClose}
        className="absolute top-4 right-4 p-2 bg-black/50 hover:bg-black/70 rounded-full transition-colors text-white z-10"
        title="Close (or ESC)"
      >
        <X size={24} />
      </button>

      {/* Image Container */}
      <div 
        ref={modalRef}
        className="relative max-w-full max-h-full overflow-hidden"
        style={{ cursor: scale > 1 ? (isDragging ? 'grabbing' : 'grab') : 'default' }}
      >
        <img
          ref={imageRef}
          src={image.url}
          alt={image.alt}
          className="max-w-full max-h-full object-contain transition-transform duration-200"
          style={{
            transform: `translate(${position.x}px, ${position.y}px) scale(${scale}) rotate(${rotation}deg)`,
            cursor: scale > 1 ? (isDragging ? 'grabbing' : 'grab') : 'default'
          }}
          onMouseDown={handleMouseDown}
          draggable={false}
        />
      </div>

      {/* Instructions */}
      <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 bg-black/50 backdrop-blur-sm rounded-full px-4 py-2 text-white text-xs text-center">
        <span>Use mouse wheel to zoom • Drag to pan • Arrow keys to move • R to rotate • 0 to reset</span>
      </div>
    </div>
  );
};

export default ImageModal;
