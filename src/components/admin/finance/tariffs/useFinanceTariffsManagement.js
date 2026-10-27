import { useState, useRef, useEffect } from 'react';
import { useAuth } from '../../../../context/AuthContext';
import {
  saveTariffsWithAuditLogApi,
  subscribeToTariffAuditLogs,
  INITIAL_AUDIT_LOGS,
} from '../../../../services/tariffsService';
import { INITIAL_TARIFFS } from '../../../../data/mockFinanceData';

const INITIAL_SPORTS_PRICES = INITIAL_TARIFFS.sports.reduce((acc, sp) => {
  acc[sp.id] = sp.amount;
  return acc;
}, {});

export const useFinanceTariffsManagement = (onNotify) => {
  const { user } = useAuth();

  // Estados de edición local
  const [tariffs, setTariffs] = useState(INITIAL_TARIFFS);
  const [sportsPrices, setSportsPrices] = useState(INITIAL_SPORTS_PRICES);

  // Snapshot de referencia guardado (useRef para evitar re-renders innecesarios)
  const savedTariffsRef = useRef(INITIAL_TARIFFS);
  const savedSportsPricesRef = useRef(INITIAL_SPORTS_PRICES);

  // Auditoría
  const [auditLogs, setAuditLogs] = useState(INITIAL_AUDIT_LOGS);
  const [isAuditModalOpen, setIsAuditModalOpen] = useState(false);

  // Estados visuales de guardado
  const [isSaving, setIsSaving] = useState(false);
  const [isSaved, setIsSaved] = useState(false);

  // Modales
  const [editingAmountItem, setEditingAmountItem] = useState(null);
  const [isTransportModalOpen, setIsTransportModalOpen] = useState(false);
  const [editingRoute, setEditingRoute] = useState(null);

  // Suscripción a logs de auditoría en Firestore
  useEffect(() => {
    let isMounted = true;
    const unsubscribe = subscribeToTariffAuditLogs((logs) => {
      if (isMounted) {
        setAuditLogs(logs || INITIAL_AUDIT_LOGS);
      }
    });

    return () => {
      isMounted = false;
      if (typeof unsubscribe === 'function') {
        unsubscribe();
      }
    };
  }, []);

  // Modificar monto en el estado en edición
  const handleSaveAmount = (itemId, newAmount) => {
    if (!editingAmountItem) return;

    if (editingAmountItem.type === 'academicLevels') {
      setTariffs((prev) => ({
        ...prev,
        academicLevels: prev.academicLevels.map((lvl) =>
          lvl.id === itemId ? { ...lvl, amount: newAmount } : lvl
        ),
      }));
    } else if (editingAmountItem.type === 'sports') {
      setSportsPrices((prev) => ({
        ...prev,
        [itemId]: newAmount,
      }));
    } else if (editingAmountItem.type === 'dining') {
      setTariffs((prev) => ({
        ...prev,
        dining: prev.dining.map((plan) =>
          plan.id === itemId ? { ...plan, amount: newAmount } : plan
        ),
      }));
    }

    if (onNotify) {
      onNotify({
        type: 'info',
        title: 'Valor Modificado (En edición)',
        message: `Se ajustó "${editingAmountItem.name}" a $${newAmount.toLocaleString('es-AR')}. Pulsa "Guardar Cambios de Tarifas" para confirmarlo en Firebase y registrar auditoría.`,
      });
    }
  };

  // Rutas
  const handleToggleRoute = (routeId) => {
    setTariffs((prev) => ({
      ...prev,
      transport: prev.transport.map((rt) =>
        rt.id === routeId ? { ...rt, active: !rt.active } : rt
      ),
    }));
  };

  const handleOpenCreateRoute = () => {
    setEditingRoute(null);
    setIsTransportModalOpen(true);
  };

  const handleOpenEditRoute = (route) => {
    setEditingRoute(route);
    setIsTransportModalOpen(true);
  };

  const handleSaveRoute = (routeData) => {
    setTariffs((prev) => {
      const exists = prev.transport.some((r) => r.id === routeData.id);
      const updatedList = exists
        ? prev.transport.map((r) => (r.id === routeData.id ? routeData : r))
        : [...prev.transport, routeData];
      return { ...prev, transport: updatedList };
    });

    if (onNotify) {
      onNotify({
        type: 'info',
        title: editingRoute ? 'Recorrido Modificado' : 'Nuevo Recorrido Asignado',
        message: `El recorrido ${routeData.code} - "${routeData.name}" se actualizó localmente. Recuerda pulsar "Guardar Cambios de Tarifas" para publicar.`,
      });
    }
  };

  const handleDeleteRoute = (routeId) => {
    const route = tariffs.transport.find((r) => r.id === routeId);
    const confirmed = window.confirm(
      `¿Desea dar de baja el recorrido "${route ? route.name : routeId}" para el ciclo lectivo 2026?`
    );
    if (confirmed) {
      setTariffs((prev) => ({
        ...prev,
        transport: prev.transport.filter((r) => r.id !== routeId),
      }));
      if (onNotify) {
        onNotify({
          type: 'info',
          title: 'Ruta Removida',
          message: `El recorrido ${route ? route.name : ''} se quitó de la matriz. Pulsa "Guardar Cambios" para confirmar.`,
        });
      }
    }
  };

  // Guardar cambios en Firebase Firestore y asentar auditoría
  const handleSaveTariffs = async () => {
    setIsSaving(true);
    try {
      const auditResult = await saveTariffsWithAuditLogApi({
        previousTariffs: savedTariffsRef.current,
        currentTariffs: tariffs,
        previousSportsPrices: savedSportsPricesRef.current,
        currentSportsPrices: sportsPrices,
        user,
      });

      // Actualizar la referencia de lo guardado
      savedTariffsRef.current = tariffs;
      savedSportsPricesRef.current = sportsPrices;

      if (auditResult && auditResult.changesCount > 0) {
        setAuditLogs((prev) => [
          { ...auditResult, id: `audit-${Date.now()}` },
          ...prev,
        ]);
      }

      setIsSaving(false);
      setIsSaved(true);

      if (onNotify) {
        const changesText =
          auditResult && auditResult.changesCount > 0
            ? `${auditResult.changesCount} modificaciones registradas en Auditoría.`
            : 'Sin cambios de precio detectados.';
        onNotify({
          type: 'success',
          title: 'Tarifas 2026 Publicadas en Firebase',
          message: `Se han guardado satisfactoriamente los parámetros arancelarios. ${changesText}`,
        });
      }

      setTimeout(() => {
        setIsSaved(false);
      }, 2500);
    } catch (err) {
      setIsSaving(false);
      if (onNotify) {
        onNotify({
          type: 'error',
          title: 'Error al Guardar',
          message: err.message || 'No se pudieron sincronizar los parámetros con Firebase.',
        });
      }
    }
  };

  // Restablecer valores
  const handleResetTariffs = () => {
    const confirmed = window.confirm(
      '¿Desea restablecer todas las tarifas no guardadas al último valor auditado?'
    );
    if (confirmed) {
      setTariffs(savedTariffsRef.current);
      setSportsPrices(savedSportsPricesRef.current);

      if (onNotify) {
        onNotify({
          type: 'info',
          title: 'Valores Restablecidos',
          message: 'Se han restaurado los valores de tarifas a la última versión guardada.',
        });
      }
    }
  };

  return {
    tariffs,
    sportsPrices,
    auditLogs,
    isAuditModalOpen,
    setIsAuditModalOpen,
    isSaving,
    isSaved,
    editingAmountItem,
    setEditingAmountItem,
    isTransportModalOpen,
    setIsTransportModalOpen,
    editingRoute,
    setEditingRoute,
    handleSaveAmount,
    handleToggleRoute,
    handleOpenCreateRoute,
    handleOpenEditRoute,
    handleSaveRoute,
    handleDeleteRoute,
    handleSaveTariffs,
    handleResetTariffs,
  };
};
