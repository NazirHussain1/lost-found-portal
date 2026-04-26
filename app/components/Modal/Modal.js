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
    const baseClasses = "w-100 overflow-hidden";
    
    switch (size) {
      case "sm":
        return `${baseClasses} modal-sm`;
      case "md":
        return `${baseClasses} modal-md`;
      case "lg":
        return `${baseClasses} modal-lg`;
      case "xl":
        return `${baseClasses} modal-xl`;
      case "full":
        return "w-100 h-100";
      default:
        return `${baseClasses} modal-md`;
    }
  };

  const getMobileClasses = () => {
    if (size === "full") {
      return "w-100 h-100 rounded-0";
    }
    return "w-100 h-100 rounded-top-3 rounded-sm-3";
  };

  return (
    <div
      className="position-fixed top-0 start-0 w-100 h-100 d-flex align-items-end align-items-sm-center justify-content-center p-0 p-sm-4 modal-fade-in"
      style={{
        backgroundColor: "rgba(0, 0, 0, 0.5)",
        backdropFilter: "blur(4px)",
        zIndex: "var(--z-modal-backdrop)"
      }}
      onClick={handleBackdropClick}
      role="dialog"
      aria-modal="true"
      aria-label={ariaLabel}
    >
      <div
        ref={modalRef}
        className={`
          bg-white shadow-lg overflow-hidden modal-scale-in
          ${getMobileClasses()}
          ${getSizeClasses()}
          ${className}
        `}
        style={{ 
          maxWidth: size === "sm" ? "400px" : size === "md" ? "500px" : size === "lg" ? "800px" : size === "xl" ? "1200px" : "500px",
          maxHeight: "90vh"
        }}
        onClick={(e) => e.stopPropagation()}
        tabIndex={-1}
        aria-labelledby={title ? "modal-title" : undefined}
        aria-describedby="modal-content"
        {...props}
      >
        {/* Header */}
        {(title || showCloseButton) && (
          <header
            className={`
              d-flex align-items-center justify-content-between p-4 p-sm-4
              text-white
              ${headerClassName}
            `}
            style={{ background: 'var(--gradient-primary)' }}
          >
            {title && (
              <h1 
                id="modal-title"
                className="h5 h-sm-4 fw-bold text-truncate pe-4 mb-0"
              >
                {title}
              </h1>
            )}
            {showCloseButton && (
              <button
                onClick={onClose}
                type="button"
                className="
                  d-flex align-items-center justify-content-center rounded-circle border-0 btn-hover-subtle
                  bg-white bg-opacity-20
                "
                style={{ width: '32px', height: '32px' }}
                aria-label="Close modal"
              >
                <FaTimes size={16} aria-hidden="true" />
              </button>
            )}
          </header>
        )}

        {/* Body */}
        <main
          id="modal-content"
          className={`
            flex-fill overflow-auto p-4 p-sm-4
            ${bodyClassName}
          `}
        >
          {children}
        </main>

        {/* Footer */}
        {footer && (
          <footer
            className={`
              d-flex flex-column flex-sm-row align-items-stretch align-items-sm-center justify-content-end gap-3 p-4 p-sm-4
              border-top bg-light
              ${footerClassName}
            `}
          >
            {footer}
          </footer>
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