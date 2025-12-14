import React, { useEffect } from 'react';

export default function Alert({ 
  show, 
  message, 
  type = 'info', 
  onClose, 
  autoClose = 3000 
}) {
  useEffect(() => {
    if (show && autoClose) {
      const timer = setTimeout(onClose, autoClose);
      return () => clearTimeout(timer);
    }
  }, [show, autoClose, onClose]);

  if (!show) return null;

  const alertClass = {
    success: 'alert-success',
    danger: 'alert-danger',
    warning: 'alert-warning',
    info: 'alert-info'
  }[type] || 'alert-info';

  const icon = {
    success: 'bi-check-circle-fill',
    danger: 'bi-exclamation-triangle-fill',
    warning: 'bi-exclamation-circle-fill',
    info: 'bi-info-circle-fill'
  }[type];

  return (
    <div className={`alert ${alertClass} alert-dismissible fade show`} role="alert">
      <i className={`bi ${icon} me-2`}></i>
      {message}
      <button type="button" className="btn-close" onClick={onClose}></button>
    </div>
  );
}
