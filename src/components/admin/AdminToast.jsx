import React, { useState, useEffect, useRef } from 'react';

const AdminToast = ({
  notification,
  onClose,
  testId = 'admin-notification-toast',
  className = '',
}) => {
  const [activeNotification, setActiveNotification] = useState(notification);
  const [prevNotification, setPrevNotification] = useState(notification);
  const [isVisible, setIsVisible] = useState(false);
  const timeoutRef = useRef(null);

  // Store information from previous renders per React guidelines
  if (notification !== prevNotification) {
    setPrevNotification(notification);
    if (notification) {
      setActiveNotification(notification);
    }
  }

  useEffect(() => {
    if (notification) {
      const enterTimer = setTimeout(() => {
        setIsVisible(true);
      }, 20);

      return () => clearTimeout(enterTimer);
    }

    const exitAnimTimer = setTimeout(() => {
      setIsVisible(false);
    }, 10);

    const cleanupTimer = setTimeout(() => {
      setActiveNotification(null);
    }, 320);

    return () => {
      clearTimeout(exitAnimTimer);
      clearTimeout(cleanupTimer);
    };
  }, [notification]);

  const handleClose = () => {
    setIsVisible(false);
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    timeoutRef.current = setTimeout(() => {
      setActiveNotification(null);
      if (onClose) onClose();
    }, 300);
  };

  if (!activeNotification) return null;

  const positionClasses = className || 'bottom-6 right-6';

  return (
    <div
      data-testid={testId}
      className={`fixed ${positionClasses} z-50 transform transition-all duration-300 ${
        isVisible
          ? 'translate-y-0 opacity-100 scale-100 ease-out'
          : 'translate-y-6 opacity-0 scale-95 ease-in pointer-events-none'
      }`}
    >
      <div
        className={`flex items-center gap-3 px-5 py-3 rounded-2xl shadow-xl text-xs font-bold backdrop-blur-md ${
          activeNotification.type === 'success'
            ? 'bg-emerald-600 text-white shadow-emerald-600/30'
            : activeNotification.type === 'error'
              ? 'bg-red-600 text-white shadow-red-600/30'
              : 'bg-slate-900 text-white shadow-slate-900/30'
        }`}
      >
        <span className="material-symbols-outlined text-[20px] shrink-0">
          {activeNotification.type === 'success'
            ? 'check_circle'
            : activeNotification.type === 'error'
              ? 'error'
              : 'info'}
        </span>
        <div className="flex flex-col text-left">
          {activeNotification.title && (
            <span className="text-[11px] font-black uppercase tracking-wider opacity-90 leading-tight">
              {activeNotification.title}
            </span>
          )}
          <span>{activeNotification.message}</span>
        </div>
        <button
          type="button"
          aria-label="Cerrar notificación"
          data-testid={`${testId}-close`}
          onClick={handleClose}
          className="ml-2 text-white/70 hover:text-white cursor-pointer border-none bg-transparent flex items-center justify-center p-0.5 rounded-full hover:bg-white/10 transition-colors"
        >
          <span className="material-symbols-outlined text-[16px]">close</span>
        </button>
      </div>
    </div>
  );
};

export default AdminToast;
