import React from 'react';

export default function ConfirmationModal({ 
  show, 
  title, 
  message, 
  onConfirm, 
  onCancel, 
  confirmText = 'Confirmar',
  cancelText = 'Cancelar',
  isDanger = false 
}) {
  if (!show) return null;

  return (
    <div className="modal d-block" tabIndex="-1" style={{ background: 'rgba(0,0,0,0.5)' }}>
      <div className="modal-dialog">
        <div className="modal-content">
          <div className="modal-header">
            <h5 className="modal-title">{title}</h5>
            <button type="button" className="btn-close" onClick={onCancel}></button>
          </div>
          <div className="modal-body">
            <p>{message}</p>
          </div>
          <div className="modal-footer">
            <button type="button" className="btn btn-secondary" onClick={onCancel}>
              {cancelText}
            </button>
            <button 
              type="button" 
              className={`btn ${isDanger ? 'btn-danger' : 'btn-primary'}`}
              onClick={onConfirm}
            >
              {confirmText}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
