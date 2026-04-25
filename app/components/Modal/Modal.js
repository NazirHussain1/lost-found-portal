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
    return "w-full h-full max-h-[100vh] rounded-t-xl sm:h-auto sm:max-h-[90vh] sm:rounded-xl";
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center sm:items-center sm:justify-center p-0 sm:p-4 modal-fade-in"
      style={{
        backgroundColor: "rgba(0, 0, 0, 0.5)",
        backdropFilter: "blur(4px)"
      }}
      onClick={handleBackdropClick}
      role="dialog"
      aria-modal="true"
      aria-label={ariaLabel}
    >
      <div
        ref={modalRef}
        className={`
          bg-white shadow-2xl overflow-hidden modal-scale-in
          ${getMobileClasses()}
          sm:${getSizeClasses()}
          ${className}
        `}
        onClick={(e) => e.stopPropagation()}
        tabIndex={-1}
        {...props}
      >
        {/* Header */}
        {(title || showCloseButton) && (
          <div
            className={`
              flex items-center justify-between p-4 sm:p-6
              bg-gradient-to-r from-indigo-600 to-purple-600 text-white
              ${headerClassName}
            `}
          >
            <h2 className="text-lg sm:text-xl font-bold truncate pr-4">
              {title}
            </h2>
            {showCloseButton && (
              <button
                onClick={onClose}
                className="
                  flex items-center justify-center w-8 h-8 rounded-full
                  bg-white/20 hover:bg-white/30 btn-hover-subtle
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
            flex-1 overflow-y-auto p-4 sm:p-6
            ${bodyClassName}
          `}
        >
          {children}
        </div>

        {/* Footer */}
        {footer && (
          <div
            className={`
              flex flex-col sm:flex-row items-stretch sm:items-center justify-end gap-3 p-4 sm:p-6
              border-t border-gray-200 bg-gray-50
              ${footerClassName}
            `}
          >
            {footer}
          </div>
        )}
      </div>
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
        className="btn-secondary-custom btn-hover-subtle w-full sm:w-auto"
        onClick={onClose}
        disabled={isLoading}
      >
        {cancelText}
      </button>
      <button
        className={`${getConfirmButtonClass()} btn-hover-lift w-full sm:w-auto`}
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