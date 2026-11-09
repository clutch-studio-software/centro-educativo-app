import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { checkAndExecuteAutoBillingEmissionApi } from '../services/financeService';

/**
 * Hook que verifica automáticamente si venció el plazo del día 5
 * para el mes en curso sin que se hayan emitido las facturas.
 * Si corresponde y el usuario es administrador, ejecuta la emisión
 * automática y expone el estado para abrir el modal informativo.
 */
export const useBillingAutoEmission = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [modalState, setModalState] = useState({
    isOpen: false,
    month: '',
    count: 0,
  });

  useEffect(() => {
    let isMounted = true;

    if (!user) return;

    checkAndExecuteAutoBillingEmissionApi(user)
      .then((result) => {
        if (!isMounted || !result?.autoEmitted) return;

        const dismissKey = `billing_auto_emitted_modal_dismissed_${result.month}`;
        if (sessionStorage.getItem(dismissKey)) return;

        setModalState({
          isOpen: true,
          month: result.month,
          count: result.count,
        });
      })
      .catch((err) => {
        console.warn('Aviso verificando emisión automática de facturas:', err.message);
      });

    return () => {
      isMounted = false;
    };
  }, [user]);

  const handleClose = () => {
    if (modalState.month) {
      sessionStorage.setItem(
        `billing_auto_emitted_modal_dismissed_${modalState.month}`,
        'true'
      );
    }
    setModalState((prev) => ({ ...prev, isOpen: false }));
  };

  const handleGoToFinance = () => {
    handleClose();
    void navigate('/admin/finanzas');
  };

  return {
    isAutoModalOpen: modalState.isOpen,
    autoModalMonth: modalState.month,
    autoModalCount: modalState.count,
    handleCloseAutoModal: handleClose,
    handleGoToFinance,
  };
};

