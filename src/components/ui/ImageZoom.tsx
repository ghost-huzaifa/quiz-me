'use client';

import { useState, useCallback, useEffect } from 'react';

interface ImageZoomProps {
  src: string;
  alt: string;
  className?: string;
}

export default function ImageZoom({ src, alt, className }: ImageZoomProps) {
  const [isOpen, setIsOpen] = useState(false);

  const handleOpen = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsOpen(true);
  }, []);

  const handleClose = useCallback(() => {
    setIsOpen(false);
  }, []);

  // Close on Escape key
  useEffect(() => {
    if (!isOpen) return;
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') handleClose();
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [isOpen, handleClose]);

  return (
    <>
      <img
        src={src}
        alt={alt}
        className={`${className || ''} cursor-zoom-in transition-opacity hover:opacity-80`}
        onClick={handleOpen}
      />

      {isOpen && (
        <div
          className="fixed inset-0 z-[100] bg-black/80 backdrop-blur-md flex items-center justify-center p-4 animate-[fadeIn_150ms_ease-out]"
          onClick={handleClose}
        >
          {/* Close button */}
          <button
            onClick={handleClose}
            className="absolute top-4 right-4 z-[101] w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-colors cursor-pointer backdrop-blur-sm"
            aria-label="Close"
          >
            <span className="material-symbols-outlined">close</span>
          </button>

          {/* Hint text */}
          <span className="absolute bottom-6 left-1/2 -translate-x-1/2 text-white/50 text-xs font-sans font-bold select-none pointer-events-none">
            Click anywhere or press Esc to close
          </span>

          {/* Full-size image */}
          <img
            src={src}
            alt={alt}
            className="max-w-[90vw] max-h-[90vh] object-contain rounded-xl shadow-2xl animate-[zoomIn_200ms_ease-out]"
            onClick={(e) => e.stopPropagation()}
          />
        </div>
      )}
    </>
  );
}
