import React, { useRef, useState, useEffect } from 'react';
import PDFWysiwygEditor from './PDFWysiwygEditor';

const MIN_WIDTH = 800;
const MIN_HEIGHT = 500;
const SIDEBAR_WIDTH = 220;

const PDFEditModal = ({ open, file, onClose, isDark: isDarkProp }) => {
  const [dimensions, setDimensions] = useState({ width: 1200, height: 800 });
  const resizing = useRef(false);
  const [isDark, setIsDark] = useState(isDarkProp ?? false);

  useEffect(() => {
    if (typeof isDarkProp === 'boolean') {
      setIsDark(isDarkProp);
    } else {
      // Auto-detect dark mode
      const mq = window.matchMedia('(prefers-color-scheme: dark)');
      setIsDark(mq.matches);
      const handler = (e) => setIsDark(e.matches);
      mq.addEventListener('change', handler);
      return () => mq.removeEventListener('change', handler);
    }
  }, [isDarkProp]);

  if (!open) return null;
  const pdfUrl = file?.data || undefined;

  // Mouse event handlers for resizing
  const handleMouseDown = (e) => {
    resizing.current = { startX: e.clientX, startY: e.clientY, ...dimensions };
    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);
  };
  const handleMouseMove = (e) => {
    if (!resizing.current) return;
    const newWidth = Math.max(MIN_WIDTH, resizing.current.width + (e.clientX - resizing.current.startX));
    const newHeight = Math.max(MIN_HEIGHT, resizing.current.height + (e.clientY - resizing.current.startY));
    setDimensions({ width: newWidth, height: newHeight });
  };
  const handleMouseUp = () => {
    resizing.current = false;
    window.removeEventListener('mousemove', handleMouseMove);
    window.removeEventListener('mouseup', handleMouseUp);
  };

  return (
    <div className={`fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40 ${isDark ? 'dark' : ''}`}
      style={{
        backdropFilter: 'blur(2px)',
      }}
    >
      <div
        className={`rounded-xl shadow-lg p-0 w-full max-w-4xl max-h-[98vh] flex flex-col bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 relative overflow-hidden`}
        style={{
          width: '100%',
          minWidth: 0,
          minHeight: 0,
          maxWidth: '98vw',
          maxHeight: '98vh',
        }}
      >
        <div className="flex justify-between items-center px-4 py-3 border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900">
          <h3 className="text-lg font-bold text-gray-900 dark:text-white truncate">PDF Editor - {file?.name || 'WYSIWYG'}</h3>
          <button onClick={onClose} className="text-2xl font-bold text-gray-700 dark:text-gray-200 hover:text-red-500 dark:hover:text-red-400 transition-colors">✕</button>
        </div>
        <div className="flex-1 min-h-0 min-w-0 overflow-auto">
          <PDFWysiwygEditor pdfUrl={pdfUrl} onClose={onClose} />
        </div>
        {/* Resize handle (desktop only) */}
        <div
          className="hidden md:flex"
          style={{
            position: 'absolute',
            right: 0,
            bottom: 0,
            width: 24,
            height: 24,
            cursor: 'nwse-resize',
            zIndex: 100,
            background: 'transparent',
            alignItems: 'flex-end',
            justifyContent: 'flex-end',
          }}
          onMouseDown={handleMouseDown}
          title="Resize"
        >
          <div style={{
            width: 18,
            height: 18,
            background: '#2563eb',
            borderRadius: 4,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#fff',
            fontWeight: 700,
            fontSize: 16,
            userSelect: 'none',
          }}>↔</div>
        </div>
      </div>
    </div>
  );
};

export default PDFEditModal; 