import React from 'react';

interface DeleteConfirmModalProps {
  isOpen: boolean;
  title: string;
  message: string;
  onConfirm: () => void;
  onCancel: () => void;
}

export const DeleteConfirmModal: React.FC<DeleteConfirmModalProps> = ({ 
  isOpen, 
  title, 
  message, 
  onConfirm, 
  onCancel 
}) => {
  if (!isOpen) return null;
  
  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center bg-on-surface/40 backdrop-blur-sm px-4">
      <div className="bg-surface w-full max-w-sm rounded-lg shadow-2xl p-6 flex flex-col gap-4">
        <h2 className="text-xl font-headline font-extrabold text-on-surface">{title}</h2>
        <p className="text-sm font-body text-on-surface-variant font-semibold">{message}</p>
        <div className="flex gap-3 mt-4">
          <button 
            onClick={onCancel}
            className="flex-1 py-2 rounded font-bold text-sm bg-surface-container-high hover:bg-surface-container-highest transition-colors text-on-surface"
          >
            Cancel
          </button>
          <button 
            onClick={onConfirm}
            className="flex-1 py-2 rounded font-bold text-sm bg-error text-on-error hover:brightness-110 transition-colors"
          >
            Delete
          </button>
        </div>
      </div>
    </div>
  );
};
