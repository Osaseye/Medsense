import { FaTimes } from 'react-icons/fa';
import { useEffect } from 'react';

const Modal = ({ isOpen, onClose, title, children }) => {
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

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div 
        className="absolute inset-0 bg-navy/50 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      ></div>
      <div className="relative bg-white rounded-3xl shadow-2xl w-full max-w-lg overflow-hidden animate-scale-in">
        <div className="flex justify-between items-center p-6 border-b border-blue-50">
          <h3 className="text-xl font-heading font-bold text-navy">{title}</h3>
          <button 
            onClick={onClose}
            className="text-muted hover:text-primary transition-colors p-2 rounded-lg hover:bg-blue-50"
          >
            <FaTimes />
          </button>
        </div>
        <div className="p-6 max-h-[80vh] overflow-y-auto">
          {children}
        </div>
      </div>
    </div>
  );
};

export default Modal;
