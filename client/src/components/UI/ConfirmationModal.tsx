import React from 'react';

interface ConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  type?: 'danger' | 'warning' | 'info';
}

const ConfirmationModal: React.FC<ConfirmationModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  type = 'warning'
}) => {
  if (!isOpen) return null;

  const getTypeStyles = () => {
    switch (type) {
      case 'danger':
        return {
          icon: '⚠️',
          confirmButton: 'bg-red-600 hover:bg-red-700 focus:ring-red-500',
          iconColor: 'text-red-600'
        };
      case 'warning':
        return {
          icon: '⚠️',
          confirmButton: 'bg-orange-600 hover:bg-orange-700 focus:ring-orange-500',
          iconColor: 'text-orange-600'
        };
      case 'info':
        return {
          icon: 'ℹ️',
          confirmButton: 'bg-blue-600 hover:bg-blue-700 focus:ring-blue-500',
          iconColor: 'text-blue-600'
        };
      default:
        return {
          icon: '⚠️',
          confirmButton: 'bg-orange-600 hover:bg-orange-700 focus:ring-orange-500',
          iconColor: 'text-orange-600'
        };
    }
  };

  const styles = getTypeStyles();

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  return (
    <div 
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
      onClick={handleBackdropClick}
    >
      <div className="bg-white rounded-xl shadow-2xl max-w-md w-full mx-4 transform transition-all">
        <div className="p-6">
          <div className="flex items-center space-x-4 mb-4">
            <div className={`text-3xl ${styles.iconColor}`}>
              {styles.icon}
            </div>
            <div>
              <h3 className="text-lg font-semibold text-slate-900">
                {title}
              </h3>
            </div>
          </div>
          
          <p className="text-slate-700 mb-6 leading-relaxed">
            {message}
          </p>
          
          <div className="flex space-x-3 justify-end">
            <button
              onClick={onClose}
              className="px-4 py-2 text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors font-medium focus:outline-none focus:ring-2 focus:ring-slate-500 focus:ring-offset-2"
            >
              {cancelText}
            </button>
            <button
              onClick={() => {
                onConfirm();
                onClose();
              }}
              className={`px-4 py-2 text-white rounded-lg transition-colors font-medium focus:outline-none focus:ring-2 focus:ring-offset-2 ${styles.confirmButton}`}
            >
              {confirmText}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ConfirmationModal;
