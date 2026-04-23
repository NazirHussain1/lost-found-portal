"use client";

import { useEffect, useRef } from "react";
import { FaTimes } from "react-icons/fa";

export default function Modal({
  isOpen,
  onClose,
  title,
  children,
  size = "md", // sm, md, lg, xl, full
  showCloseButton = true,
  closeOnBackdrop = true,
  closeOnEscape = true,
  className = "",
  headerClassName = "",
  bodyClassName = "",
  footerClassName = "",
  footer = null,
  ariaLabel = "Modal dialog",
  ...props
}) {
  const modalRef = useRef(null);
  const previousFocusRef = useRef(null);

  // Handle ESC key press
  useEffect(() => {
    if (!isOpen || !closeOnEscape) return;

    const handleEscape = (e) => {
      if (e.key === "Escape") {
        onClose();
      }
    };

    document.addEventListener("keydown", handleEscape);
    return () => document.removeEventListener("keydown", handleEscape);
  }, [isOpen, closeOnEscape, onClose]);

  // Handle focus management and body scroll lock
  useEffect(() => {
    if (isOpen) {
      // Store the currently focused element
      previousFocusRef.current = document.activeElement;
      
      // Lock body scroll
      document.body.style.overflow = "hidden";
      
      // Focus the modal
      setTimeout(() => {
        if (modalRef.current) {
          modalRef.current.focus();
        }
      }, 100);
    } else {
      // Restore body scroll
      document.body.style.overflow = "auto";
      
      // Return focus to the previously focused element
      if (previousFocusRef.current) {
        previousFocusRef.current.focus();
      }
    }

    // Cleanup on unmount
    return () => {
      document.body.style.overflow = "auto";
    };
  }, [isOpen]);

  // Focus trap within modal
  useEffect(() => {
    if (!isOpen) return;

    const handleTabKey = (e) => {
      if (e.key !== "Tab") return;

      const focusableElements = modalRef.current?.querySelectorAll(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
      );

      if (!focusableElements?.length) return;

      const firstElement = focusableElements[0];
      const lastElement = focusableElements[focusableElements.length - 1];

      if (e.shiftKey) {
        if (document.activeElement === firstElement) {
          e.preventDefault();
          lastElement.focus();
        }
      } else {
        if (document.activeElement === lastElement) {
          e.preventDefault();
          firstElement.focus();
        }
      }
    };

    document.addEventListener("keydown", handleTabKey);
    return () => document.removeEventListener("keydown", handleTabKey);
  }, [isOpen]);

  if (!isOpen) return null;

  const handleBackdropClick = (e) => {
    if (closeOnBackdrop && e.target === e.currentTarget) {
      onClose();
    }
  };

  const getSizeClasses = () => {
    const baseClasses = "w-full max-h-[90vh] overflow-hidden";
    
    switch (size) {
      case "sm":
        return `${baseClasses} max-w-md`;
      case "md":
        return `${baseClasses} max-w-lg`;
      case "lg":
        return `${baseClasses} max-w-2xl`;
      case "xl":
        return `${baseClasses} max-w-4xl`;
      case "full":
        return "w-full h-full max-w-none max-h-none";
      default:
        return `${baseClasses} max-w-lg`;
    }
  };

  const getMobileClasses = () => {
    if (size === "full") {
      return "w-full h-full rounded-none";
    }
    return "w-full h-full max-h-[100vh] rounded-t-xl md:h-auto md:max-h-[90vh] md:rounded-xl";
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center md:items-center md:justify-center p-0 md:p-4"
      style={{
        backgroundColor: "rgba(0, 0, 0, 0.5)",
        backdropFilter: "blur(4px)",
        animation: "fadeIn 200ms ease-out"
      }}
      onClick={handleBackdropClick}
      role="dialog"
      aria-modal="true"
      aria-label={ariaLabel}
    >
      <div
        ref={modalRef}
        className={`
          bg-white shadow-2xl overflow-hidden
          ${getMobileClasses()}
          md:${getSizeClasses()}
          ${className}
        `}
        style={{
          animation: "slideUp 300ms cubic-bezier(0.175, 0.885, 0.32, 1.275)"
        }}
        onClick={(e) => e.stopPropagation()}
        tabIndex={-1}
        {...props}
      >
        {/* Header */}
        {(title || showCloseButton) && (
          <div
            className={`
              flex items-center justify-between p-4 md:p-6
              bg-gradient-to-r from-indigo-600 to-purple-600 text-white
              ${headerClassName}
            `}
          >
            <h2 className="text-lg md:text-xl font-bold truncate pr-4">
              {title}
            </h2>
            {showCloseButton && (
              <button
                onClick={onClose}
                className="
                  flex items-center justify-center w-8 h-8 rounded-full
                  bg-white/20 hover:bg-white/30 transition-all duration-200
                  focus:outline-none focus:ring-2 focus:ring-white/50
                "
                aria-label="Close modal"
              >
                <FaTimes size={16} />
              </button>
            )}
          </div>
        )}

        {/* Body */}
        <div
          className={`
            flex-1 overflow-y-auto p-4 md:p-6
            ${bodyClassName}
          `}
        >
          {children}
        </div>

        {/* Footer */}
        {footer && (
          <div
            className={`
              flex items-center justify-end gap-3 p-4 md:p-6
              border-t border-gray-200 bg-gray-50
              ${footerClassName}
            `}
          >
            {footer}
          </div>
        )}
      </div>

      <style jsx>{`
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }

        @keyframes slideUp {
          from {
            opacity: 0;
            transform: translateY(20px) scale(0.95);
          }
          to {
            opacity: 1;
            transform: translateY(0) scale(1);
          }
        }

        /* Mobile-first full screen on small devices */
        @media (max-width: 767px) {
          .modal-mobile-full {
            width: 100% !important;
            height: 100% !important;
            max-width: none !important;
            max-height: none !important;
            border-radius: 0 !important;
          }
        }
      `}</style>
    </div>
  );
}

// Convenience components for common modal patterns
export function ConfirmModal({
  isOpen,
  onClose,
  onConfirm,
  title = "Confirm Action",
  message,
  confirmText = "Confirm",
  cancelText = "Cancel",
  confirmVariant = "primary",
  isLoading = false,
  ...props
}) {
  const getConfirmButtonClass = () => {
    switch (confirmVariant) {
      case "danger":
        return "btn-danger-custom";
      case "success":
        return "btn-success-custom";
      case "primary":
      default:
        return "btn-primary-custom";
    }
  };

  const footer = (
    <>
      <button
        className="btn-secondary-custom"
        onClick={onClose}
        disabled={isLoading}
      >
        {cancelText}
      </button>
      <button
        className={getConfirmButtonClass()}
        onClick={onConfirm}
        disabled={isLoading}
      >
        {isLoading ? "Processing..." : confirmText}
      </button>
    </>
  );

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={title}
      size="sm"
      footer={footer}
      {...props}
    >
      <div className="text-center py-4">
        <p className="text-gray-700 mb-0">{message}</p>
      </div>
    </Modal>
  );
}