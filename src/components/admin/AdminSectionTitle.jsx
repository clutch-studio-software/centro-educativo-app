import React from 'react';

const AdminSectionTitle = ({ icon, title, subtitle }) => {
  return (
    <div className="flex items-center gap-3">
      <span className="w-12 h-12 rounded-xl bg-gradient-to-tr from-emerald-500 to-lime-400 text-white shadow-md shadow-lime-500/20 flex items-center justify-center shrink-0">
        <span className="material-symbols-outlined text-[22px]">{icon}</span>
      </span>
      <div className="flex items-left flex-col">
        <h1 className="text-2xl text-left lg:text-3xl font-extrabold text-slate-900">
          {title}
        </h1>
        <span className="text-s text-left font-medium text-slate-500 mt-1">
          {subtitle}
        </span>
      </div>
    </div>
  );
};

export default AdminSectionTitle;
