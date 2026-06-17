import React, { useEffect } from 'react';
import { X } from 'lucide-react';
import Button from './Button';

export default function Modal({
  isOpen,
  onClose,
  title,
  children,
  footer,
  maxWidth = 'max-w-md'
}) {
  // Listen for escape key to close
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/45 backdrop-blur-xs p-4 animate-in fade-in duration-200">
      {/* Backdrop tap to close */}
      <div className="absolute inset-0" onClick={onClose}></div>
      
      {/* Modal Container */}
      <div className={`bg-white rounded-2xl shadow-xl border border-gray-100 w-full ${maxWidth} overflow-hidden z-10 animate-in zoom-in-95 duration-200 flex flex-col max-h-[90vh]`}>
        {/* Header */}
        <div className="bg-slate-900 text-white p-5 flex justify-between items-center shrink-0">
          <h3 className="font-bold text-sm tracking-wide">{title}</h3>
          <Button 
            type="button" 
            className="text-slate-400 hover:text-white font-semibold text-lg transition-colors p-1 rounded-lg hover:bg-white/10" 
            onClick={onClose}
          >
            <X className="w-4 h-4" />
          </Button>
        </div>

        {/* Content Body */}
        <div className="p-6 space-y-4 overflow-y-auto text-xs text-gray-700">
          {children}
        </div>

        {/* Footer */}
        {footer && (
          <div className="p-4 bg-gray-50 border-t border-gray-100 flex gap-2 justify-end shrink-0">
            {footer}
          </div>
        )}
      </div>
    </div>
  );
}
