import React from 'react';
import type { ToastType } from '../components/Toast';

export const useToast = () => {
  const [toasts, setToasts] = React.useState<
    Array<{
      id: string;
      type: ToastType;
      message: string;
      description?: string;
    }>
  >([]);

  const addToast = (type: ToastType, message: string, description?: string) => {
    const id = Math.random().toString(36).substring(7);
    setToasts(prev => [...prev, { id, type, message, description }]);
  };

  const removeToast = (id: string) => {
    setToasts(prev => prev.filter(toast => toast.id !== id));
  };

  return {
    toasts,
    addToast,
    removeToast,
    success: (message: string, description?: string) => addToast('success', message, description),
    error: (message: string, description?: string) => addToast('error', message, description),
    warning: (message: string, description?: string) => addToast('warning', message, description),
    info: (message: string, description?: string) => addToast('info', message, description),
  };
};

