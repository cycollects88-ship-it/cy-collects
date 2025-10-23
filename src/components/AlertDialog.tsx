import React from "react";
import { createPortal } from "react-dom";

interface AlertDialogProps {
  isOpen: boolean;
  title: string;
  message: string;
  variant?: "success" | "error" | "warning" | "info";
  buttonText?: string;
  onClose: () => void;
}

/**
 * AlertDialog component
 * Beautiful custom alert dialog to replace ugly browser alert()
 */
const AlertDialog: React.FC<AlertDialogProps> = ({
  isOpen,
  title,
  message,
  variant = "info",
  buttonText = "OK",
  onClose,
}) => {
  if (!isOpen) return null;

  const variantConfig = {
    success: {
      bgColor: "bg-green-100",
      iconColor: "text-green-600",
      icon: (
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
      ),
    },
    error: {
      bgColor: "bg-red-100",
      iconColor: "text-red-600",
      icon: (
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
      ),
    },
    warning: {
      bgColor: "bg-yellow-100",
      iconColor: "text-yellow-600",
      icon: (
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
      ),
    },
    info: {
      bgColor: "bg-blue-100",
      iconColor: "text-blue-600",
      icon: (
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      ),
    },
  };

  const config = variantConfig[variant];

  if (!isOpen) return null;

  return createPortal(
    <>
      {/* Backdrop */}
      <button
        type="button"
        className="fixed inset-0 bg-black/50 z-50 transition-opacity"
        onClick={onClose}
        aria-label="Close dialog"
      />
      
      {/* Modal */}
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-xl shadow-2xl max-w-md w-full transform transition-all">
          {/* Content */}
          <div className="px-6 pt-6 pb-4">
            <div className="flex items-start">
              <div className={`flex-shrink-0 w-10 h-10 rounded-full ${config.bgColor} flex items-center justify-center`}>
                <svg className={`w-6 h-6 ${config.iconColor}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  {config.icon}
                </svg>
              </div>
              <div className="ml-4">
                <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
                <p className="mt-2 text-sm text-gray-600">{message}</p>
              </div>
            </div>
          </div>

          {/* Action */}
          <div className="px-6 pb-6 flex justify-end">
            <button
              onClick={onClose}
              className="px-6 py-2 bg-[#7D78A3] hover:bg-[#A29CBB] text-white rounded-lg transition-colors duration-200 font-medium"
            >
              {buttonText}
            </button>
          </div>
        </div>
      </div>
    </>,
    document.body
  );
};

export default AlertDialog;

