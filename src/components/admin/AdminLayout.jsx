import React, { useState } from 'react';
import AdminSidebar from './AdminSidebar';
import AdminHeader from './AdminHeader';

const AdminLayout = ({ children, activeItem = 'alumnos', breadcrumbs = [] }) => {
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  return (
    <div
      data-testid="admin-layout"
      className="min-h-screen bg-[#f7faf6] font-sans text-slate-800 antialiased selection:bg-lime-200 selection:text-slate-900"
    >
      {/* Sidebar */}
      <AdminSidebar
        isMobileOpen={isMobileOpen}
        onCloseMobile={() => setIsMobileOpen(false)}
        activeItem={activeItem}
      />

      {/* Main Container */}
      <div className="lg:pl-72 flex flex-col min-h-screen transition-all">
        {/* Top Header */}
        <AdminHeader
          onToggleMobile={() => setIsMobileOpen(!isMobileOpen)}
          breadcrumbs={breadcrumbs}
        />

        {/* Content Body */}
        <main
          data-testid="admin-main-content"
          className="relative pt-20 bg-[#f7faf6] w-full px-4 sm:px-8 pb-12 flex-1"
        >
          {children}
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;
