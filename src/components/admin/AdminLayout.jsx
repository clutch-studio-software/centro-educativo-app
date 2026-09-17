import React, { useState } from 'react';
import AdminSidebar from './AdminSidebar';
import AdminHeader from './AdminHeader';

const AdminLayout = ({ children, activeItem = 'alumnos', breadcrumbs = [] }) => {
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(() => {
    try {
      return localStorage.getItem('admin_sidebar_collapsed') === 'true';
    } catch {
      return false;
    }
  });

  const handleToggleCollapse = () => {
    setIsCollapsed((prev) => {
      const nextVal = !prev;
      try {
        localStorage.setItem('admin_sidebar_collapsed', String(nextVal));
      } catch (err) {
        console.warn('No se pudo guardar la preferencia del sidebar en localStorage:', err.message);
      }
      return nextVal;
    });
  };

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
        isCollapsed={isCollapsed}
        onToggleCollapse={handleToggleCollapse}
      />

      {/* Main Container */}
      <div
        className={`${
          isCollapsed ? 'lg:pl-20' : 'lg:pl-72'
        } flex flex-col min-h-screen transition-all duration-300 ease-in-out`}
      >
        {/* Top Header */}
        <AdminHeader
          onToggleMobile={() => setIsMobileOpen(!isMobileOpen)}
          isCollapsed={isCollapsed}
          breadcrumbs={breadcrumbs}
        />

        {/* Content Body */}
        <main
          data-testid="admin-main-content"
          className="relative pt-20 bg-[#f7faf6] w-full px-4 sm:px-8 pb-12 flex-1 transition-all duration-300 ease-in-out"
        >
          {children}
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;
