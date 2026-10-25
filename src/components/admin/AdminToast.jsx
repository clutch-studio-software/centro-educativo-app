import React from 'react';

const AdminToast = ({ notification, onClose, testId = 'admin-notification-toast' }) => {
  if (!notification) return null;

  return (
    <div
      data-testid={testId}
      className="fixed bottom-6 right-6 z-50 animate-in slide-in-from-bottom-4 duration-300"
    >
      <div
        className={`flex items-center gap-3 px-5 py-3 rounded-2xl shadow-xl text-xs font-bold ${
          notification.type === 'success'
            ? 'bg-emerald-600 text-white shadow-emerald-600/30'
            : notification.type === 'error'
              ? 'bg-red-600 text-white shadow-red-600/30'
              : 'bg-slate-900 text-white shadow-slate-900/30'
        }`}
      >
        <span className="material-symbols-outlined text-[18px]">
          {notification.type === 'success'
            ? 'check_circle'
            : notification.type === 'error'
              ? 'error'
              : 'info'}
        </span>
        <span>{notification.message}</span>
        <button
          type="button"
          aria-label="Cerrar notificación"
          data-testid={`${testId}-close`}
          onClick={onClose}
          className="ml-2 text-white/70 hover:text-white cursor-pointer border-none bg-transparent flex items-center justify-center"
        >
          <span className="material-symbols-outlined text-[14px]">close</span>
        </button>
      </div>
    </div>
  );
};

export default AdminToast;
