import React from 'react';
import AdminLayout from '../../components/admin/AdminLayout';
import AdminToast from '../../components/admin/AdminToast';
import FinanceHeader from '../../components/admin/finance/FinanceHeader';
import FinanceKpiCards from '../../components/admin/finance/FinanceKpiCards';
import FinanceTabs from '../../components/admin/finance/FinanceTabs';
import FinanceFilterBar from '../../components/admin/finance/FinanceFilterBar';
import FinanceReceiptsTable from '../../components/admin/finance/FinanceReceiptsTable';
import FinancePagination from '../../components/admin/finance/FinancePagination';
import FinanceTariffsView from '../../components/admin/finance/tariffs/FinanceTariffsView';
import FinanceValidateReceiptModal from '../../components/admin/finance/FinanceValidateReceiptModal';
import FinanceRejectReceiptModal from '../../components/admin/finance/FinanceRejectReceiptModal';
import FinanceVoucherModal from '../../components/admin/finance/FinanceVoucherModal';
import { useFinanceManagement } from '../../components/admin/finance/useFinanceManagement';
import { FINANCE_STATUSES } from '../../data/mockFinanceData';

const FinanceManagement = () => {
  const {
    activeTab,
    setActiveTab,
    expandedRowId,
    handleToggleAccordion,
    searchTerm,
    setSearchTerm,
    selectedStatus,
    setSelectedStatus,
    selectedMonth,
    setSelectedMonth,
    currentPage,
    setCurrentPage,
    pageSize,
    totalItems,
    totalPages,
    startIndex,
    currentReceipts,
    pendingCount,
    pendingAmount,
    approvedCount,
    rejectedCount,
    validatingReceipt,
    setValidatingReceipt,
    rejectingReceipt,
    setRejectingReceipt,
    viewingVoucher,
    setViewingVoucher,
    notification,
    setNotification,
    showNotification,
    handleApprovePayment,
    handleRejectPayment,
    handleExportBalance,
    handleResetFilters,
  } = useFinanceManagement();

  const handleReviewPending = () => {
    setSelectedStatus(FINANCE_STATUSES.PENDIENTE);
    setActiveTab('comprobantes');
  };

  return (
    <AdminLayout
      activeItem="finanzas"
      breadcrumbs={['Consola Administrativa', 'Finanzas y Gestión de Pagos']}
    >
      <div
        data-testid="finance-management-page"
        className="flex flex-col w-full relative min-h-screen pb-12"
      >
        {/* Top Ambient Glows */}
        <div className="absolute -top-24 -left-20 w-96 h-96 bg-blue-300/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -top-20 right-10 w-80 h-80 bg-emerald-300/10 rounded-full blur-3xl pointer-events-none" />

        {/* Notificación Toast flotante que no se superpone con los botones inferiores */}
        <AdminToast
          notification={notification}
          onClose={() => setNotification(null)}
          className={
            activeTab === 'aranceles'
              ? 'bottom-28 sm:bottom-24 right-4 sm:right-6'
              : 'bottom-6 right-6'
          }
        />

        {/* Pestañas de Navegación Primaria */}
        <div className="mb-4">
          <FinanceTabs
            activeTab={activeTab}
            onSelectTab={setActiveTab}
            pendingCount={pendingCount}
          />
        </div>

        {/* Vista Tab 1: Comprobantes y Recibos */}
        {activeTab === 'comprobantes' && (
          <div
            id="view-comprobantes"
            data-testid="view-comprobantes"
            className="flex flex-col gap-5 animate-in fade-in duration-200"
          >
            {/* Encabezado Principal y Acciones */}
            <FinanceHeader onExportBalance={handleExportBalance} />

            {/* Quick KPI Strip Bento */}
            <div className="my-2">
              <FinanceKpiCards
                pendingCount={pendingCount}
                pendingAmount={pendingAmount}
                onReviewPending={handleReviewPending}
              />
            </div>

            {/* Barra de Filtros */}
            <FinanceFilterBar
              searchTerm={searchTerm}
              onSearchChange={setSearchTerm}
              selectedStatus={selectedStatus}
              onStatusChange={setSelectedStatus}
              selectedMonth={selectedMonth}
              onMonthChange={setSelectedMonth}
              onResetFilters={handleResetFilters}
              pendingCount={pendingCount}
              approvedCount={approvedCount}
              rejectedCount={rejectedCount}
            />

            {/* Tabla Principal Acordeón */}
            <div className="flex flex-col">
              <FinanceReceiptsTable
                receipts={currentReceipts}
                expandedRowId={expandedRowId}
                onToggleAccordion={handleToggleAccordion}
                onOpenValidate={setValidatingReceipt}
                onOpenReject={setRejectingReceipt}
                onViewVoucher={setViewingVoucher}
                onResetFilters={handleResetFilters}
              />

              {/* Paginación */}
              <FinancePagination
                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={setCurrentPage}
                startIndex={startIndex}
                pageSize={pageSize}
                totalItems={totalItems}
              />
            </div>
          </div>
        )}

        {/* Vista Tab 2: Parametrización de Aranceles */}
        {activeTab === 'aranceles' && (
          <div id="view-aranceles" data-testid="view-aranceles" className="animate-in fade-in duration-200">
            <FinanceTariffsView onNotify={showNotification} />
          </div>
        )}

        {/* Modal: Validar Pago & Emitir Recibo Oficial */}
        <FinanceValidateReceiptModal
          receipt={validatingReceipt}
          onClose={() => setValidatingReceipt(null)}
          onConfirm={handleApprovePayment}
        />

        {/* Modal: Rechazar / Observar Comprobante */}
        <FinanceRejectReceiptModal
          receipt={rejectingReceipt}
          onClose={() => setRejectingReceipt(null)}
          onConfirm={handleRejectPayment}
        />

        {/* Modal: Ver Comprobante Completo / Recibo Oficial */}
        <FinanceVoucherModal
          receipt={viewingVoucher}
          onClose={() => setViewingVoucher(null)}
        />
      </div>
    </AdminLayout>
  );
};

export default FinanceManagement;
