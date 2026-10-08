import React from 'react';
import { CheckCircle2, Info, AlertCircle } from 'lucide-react';
import { useContextMenu } from '../../context/ContextMenuContext';
import './Toast.css';

export function Toast() {
  const { toasts, removeToast } = useContextMenu();

  if (!toasts || toasts.length === 0) return null;

  return (
    <div className="fs-toast-container" role="status" aria-live="polite">
      {toasts.map(toast => {
        let Icon = CheckCircle2;
        if (toast.type === 'error') Icon = AlertCircle;
        if (toast.type === 'info') Icon = Info;

        return (
          <div
            key={toast.id}
            className={`fs-toast-pill ${toast.type || 'success'}`}
            onClick={() => removeToast(toast.id)}
          >
            <Icon size={18} className="fs-toast-icon" />
            <span>{toast.message}</span>
          </div>
        );
      })}
    </div>
  );
}
