import { useState, useMemo, useCallback } from 'react';
import { INITIAL_RECEIPTS, FINANCE_STATUSES } from '../../../data/mockFinanceData';

export const useFinanceManagement = () => {
  const [receipts, setReceipts] = useState(INITIAL_RECEIPTS);
  const [activeTab, setActiveTab] = useState('comprobantes'); // 'comprobantes' | 'aranceles'
  const [expandedRowId, setExpandedRowId] = useState('fam-0118'); // open by default as in HTML
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStatus, setSelectedStatus] = useState(FINANCE_STATUSES.TODOS);
  const [selectedMonth, setSelectedMonth] = useState('Octubre 2026');
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 5;

  // Modals state
  const [validatingReceipt, setValidatingReceipt] = useState(null);
  const [rejectingReceipt, setRejectingReceipt] = useState(null);
  const [viewingVoucher, setViewingVoucher] = useState(null);
  const [notification, setNotification] = useState(null);

  const showNotification = useCallback((typeOrObj, maybeMessage) => {
    const notif =
      typeof typeOrObj === 'object' && typeOrObj !== null
        ? typeOrObj
        : { type: typeOrObj, message: maybeMessage };
    setNotification(notif);
    setTimeout(() => {
      setNotification((prev) => (prev?.message === notif.message ? null : prev));
    }, 4500);
  }, []);

  const handleToggleAccordion = useCallback((id) => {
    setExpandedRowId((prev) => (prev === id ? null : id));
  }, []);

  const handleApprovePayment = useCallback(
    (receiptId) => {
      const receiptNumber = `#REC-2026-${Math.floor(1000 + Math.random() * 9000)}`;
      setReceipts((prev) =>
        prev.map((item) => {
          if (item.id === receiptId) {
            return {
              ...item,
              status: 'aprobado',
              receiptNumber,
              bankingVoucher: {
                ...item.bankingVoucher,
                voucherStatus: 'Conciliado OK',
              },
            };
          }
          return item;
        })
      );
      setValidatingReceipt(null);
      showNotification(
        'success',
        `¡Pago aprobado! Se generó el Recibo Oficial ${receiptNumber} y fue enviado al tutor.`
      );
    },
    [showNotification]
  );

  const handleRejectPayment = useCallback(
    (receiptId, reason) => {
      setReceipts((prev) =>
        prev.map((item) => {
          if (item.id === receiptId) {
            return {
              ...item,
              status: 'rechazado',
              rejectionReason: reason || 'Comprobante observado por el área de tesorería.',
              bankingVoucher: {
                ...item.bankingVoucher,
                voucherStatus: 'Observado',
              },
            };
          }
          return item;
        })
      );
      setRejectingReceipt(null);
      showNotification(
        'error',
        'Comprobante observado/rechazado. Se envió la notificación de regularización al tutor.'
      );
    },
    [showNotification]
  );


  const handleExportBalance = useCallback(() => {
    // Generar archivo CSV descargable con los comprobantes actuales
    const headers = 'ID,Familia,Tutor,DNI,Hijos,Fecha,Monto,Estado,Recibo\n';
    const rows = receipts
      .map(
        (r) =>
          `"${r.id}","${r.familyCode}","${r.tutor}","${r.tutorDni}",${r.enrolledChildrenCount},"${r.uploadDate}","${r.declaredAmount}","${r.status}","${r.receiptNumber || 'N/A'}"`
      )
      .join('\n');
    const blob = new Blob([headers + rows], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `balance_finanzas_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    showNotification('success', 'Balance financiero exportado exitosamente en formato CSV.');
  }, [receipts, showNotification]);

  const handleResetFilters = useCallback(() => {
    setSearchTerm('');
    setSelectedStatus(FINANCE_STATUSES.TODOS);
    setSelectedMonth('Octubre 2026');
    setCurrentPage(1);
  }, []);

  // Filtered receipts
  const filteredReceipts = useMemo(() => {
    return receipts.filter((receipt) => {
      const term = searchTerm.toLowerCase().trim();
      const matchesSearch =
        !term ||
        receipt.tutor.toLowerCase().includes(term) ||
        receipt.tutorDni.replace(/\./g, '').includes(term.replace(/\./g, '')) ||
        receipt.familyCode.toLowerCase().includes(term) ||
        receipt.children.some(
          (c) =>
            c.name.toLowerCase().includes(term) ||
            c.legajo.toLowerCase().includes(term)
        );

      let matchesStatus = true;
      if (selectedStatus === FINANCE_STATUSES.PENDIENTE) {
        matchesStatus = receipt.status === 'pendiente';
      } else if (selectedStatus === FINANCE_STATUSES.APROBADO) {
        matchesStatus = receipt.status === 'aprobado';
      } else if (selectedStatus === FINANCE_STATUSES.RECHAZADO) {
        matchesStatus = receipt.status === 'rechazado';
      }

      return matchesSearch && matchesStatus;
    });
  }, [receipts, searchTerm, selectedStatus]);

  // Pagination calculation
  const totalItems = filteredReceipts.length;
  const totalPages = Math.max(1, Math.ceil(totalItems / pageSize));
  const startIndex = (currentPage - 1) * pageSize;
  const currentReceipts = filteredReceipts.slice(startIndex, startIndex + pageSize);

  // Dynamic KPI counts
  const pendingCount = useMemo(
    () => receipts.filter((r) => r.status === 'pendiente').length,
    [receipts]
  );
  const pendingAmount = useMemo(
    () =>
      receipts
        .filter((r) => r.status === 'pendiente')
        .reduce((acc, curr) => acc + curr.declaredAmount, 0),
    [receipts]
  );
  const approvedCount = useMemo(
    () => receipts.filter((r) => r.status === 'aprobado').length,
    [receipts]
  );
  const rejectedCount = useMemo(
    () => receipts.filter((r) => r.status === 'rechazado').length,
    [receipts]
  );

  return {
    receipts,
    activeTab,
    setActiveTab,
    expandedRowId,
    setExpandedRowId,
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
  };
};
