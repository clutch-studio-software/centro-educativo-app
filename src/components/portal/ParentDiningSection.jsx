import React, { useState } from 'react';
import PortalSectionHeader from './PortalSectionHeader.jsx';
import ConfirmCancelServiceModal from './ConfirmCancelServiceModal.jsx';
import {
  formatDateDisplay,
  canCancelServiceToday,
  getNextMonthFirstDay,
  calculateMonthlyProportional,
} from '../../utils/transportSubscriptionUtils.js';
import LoadingSpinner from '../admin/common/LoadingSpinner.jsx';

/**
 * Sección de autogestión del comedor escolar para padres y tutores.
 * Aplica regla de negocio institucional:
 * - Cancelación el mismo día: baja inmediata.
 * - Cancelación posterior al día de alta: baja programada para el 1º del mes siguiente.
 * - Registro de fecha de inicio para cobro proporcional de días restantes.
 */
const ParentDiningSection = ({
  student,
  onToggleDining,
  isProcessing = false,
}) => {
  const [showConfirmCancelModal, setShowConfirmCancelModal] = useState(false);

  const servicios = Array.isArray(student?.servicios) ? student.servicios : [];
  const isEnrolled =
    servicios.some((s) => String(s).toLowerCase().includes('comedor')) ||
    Boolean(student?.comedor);

  const startDate = student?.comedorFechaInicio;
  const bajaSolicitada = Boolean(student?.comedorBajaSolicitada);
  const isCancelableToday = canCancelServiceToday(startDate);
  const nextMonth = getNextMonthFirstDay();

  const proportionalInfo = calculateMonthlyProportional({
    startDate,
    monthlyRate: 22000,
  });

  const handleCancelClick = () => {
    setShowConfirmCancelModal(true);
  };

  const handleConfirmCancel = () => {
    setShowConfirmCancelModal(false);
    onToggleDining(false);
  };

  return (
    <div
      data-testid="parent-dining-section"
      className="bg-white rounded-xl border border-slate-200 p-5 md:p-6 space-y-4 shadow-sm text-left"
    >
      <PortalSectionHeader
        icon="restaurant"
        iconBgClass="bg-orange-50"
        iconColorClass="text-orange-600"
        title="Autogestión de Comedor Escolar"
        subtitle="Servicio diario de almuerzo institucional y merienda supervisada"
        statusBadge={
          <span
            data-testid="dining-status-tag"
            className={`text-xs font-bold px-2.5 py-1 rounded-full border ${isEnrolled
                ? bajaSolicitada
                  ? 'bg-amber-50 text-amber-800 border-amber-200'
                  : 'bg-orange-50 text-orange-700 border-orange-200'
                : 'bg-slate-100 text-slate-600 border-slate-200'
              }`}
          >
            {isEnrolled
              ? bajaSolicitada
                ? 'Baja Programada (Mes prox.)'
                : 'Servicio Contratado'
              : 'Sin servicio'}
          </span>
        }
      />

      {isEnrolled ? (
        <div className="space-y-4">
          <div className="p-4 rounded-md bg-orange-50/40 border border-orange-100 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="space-y-1 text-xs text-slate-600">
              <p className="font-bold text-slate-800 text-sm">
                Menú Escolar Activo
              </p>
              <p>
                Plato principal balanceado, opciones para celíacos/vegetarianos y control bromatológico permanente.
              </p>
              <p
                data-testid="portal-dining-start-date"
                className="text-[11px] text-slate-500 font-medium pt-1"
              >
                Fecha de inicio de suscripción: <strong>{formatDateDisplay(startDate)}</strong>
              </p>
            </div>

            <button
              type="button"
              data-testid="btn-toggle-dining"
              disabled={isProcessing}
              onClick={handleCancelClick}
              className="px-4 py-2.5 rounded-xl text-xs font-bold bg-rose-50 text-rose-700 hover:bg-rose-100 border border-rose-200 transition-colors cursor-pointer shrink-0"
            >
              {isProcessing ? <span className="animate-pulse"> Procesando </span> : 'Dar de baja comedor'}
            </button>
          </div>

          {/* Liquidación Proporcional */}
          <div className="p-3.5 rounded-md bg-slate-50 border border-slate-200 text-xs text-slate-700 space-y-1">
            <div className="flex items-center justify-between font-bold text-slate-800">
              <span>Facturación del 1º Mes (Proporcional):</span>
              <span className="text-orange-700">{proportionalInfo.formatted}</span>
            </div>
            <span className="text-[11px] text-slate-500">
              Corresponde a {proportionalInfo.activeDays} días activos de {proportionalInfo.daysInMonth} en el período mensual de inicio.
            </span>
            {bajaSolicitada && (
              <p className="text-[11px] font-semibold text-amber-800 pt-1">
                Baja programada: El servicio concluirá el último día del mes en curso y no se renovará en {nextMonth.monthName}.
              </p>
            )}
          </div>
        </div>
      ) : (
        <div className="p-4 rounded-xl bg-orange-50/40 border border-orange-100 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="space-y-1 text-xs text-slate-600">
            <p className="font-bold text-slate-800 text-sm">
              Habilitar Servicio de Almuerzo Escolar
            </p>
            <p>
              Al inscribir al alumno hoy, se registrará la fecha de inicio y se facturará únicamente el proporcional de los días restantes del mes.
            </p>
          </div>

          <button
            type="button"
            data-testid="btn-toggle-dining"
            disabled={isProcessing}
            onClick={() => onToggleDining(true)}
            className="px-5 py-2.5 rounded-xl text-xs font-bold bg-orange-600 hover:bg-orange-700 text-white shadow-sm transition-colors cursor-pointer shrink-0"
          >
            {isProcessing ? <span className="animate-pulse"> Procesando </span> : 'Inscribir al comedor escolar'}
          </button>
        </div>
      )}

      {showConfirmCancelModal && (
        <ConfirmCancelServiceModal
          serviceName="Comedor Escolar"
          isCancelableToday={isCancelableToday}
          nextMonthDisplay={nextMonth.display}
          onAbort={() => setShowConfirmCancelModal(false)}
          onConfirm={handleConfirmCancel}
          isProcessing={isProcessing}
        />
      )}
    </div>
  );
};

export default ParentDiningSection;
