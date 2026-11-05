import React, { useState } from 'react';
import {
  canCancelTransportToday,
  getNextMonthFirstDay,
} from '../../utils/transportSubscriptionUtils.js';
import ConfirmCancelTransportModal from './ConfirmCancelTransportModal.jsx';
import ParentTransportEnrolledView from './ParentTransportEnrolledView.jsx';
import ParentTransportCatalogForm from './ParentTransportCatalogForm.jsx';
import PortalSectionHeader from './PortalSectionHeader.jsx';

const EMPTY_ROUTES = [];
const EMPTY_STUDENTS = [];

/**
 * Sección de autogestión de transporte escolar para padres y tutores.
 */
const ParentTransportSection = ({
  student,
  routes = EMPTY_ROUTES,
  allStudents = EMPTY_STUDENTS,
  onEnrollTransport,
  onCancelTransport,
  isProcessing = false,
}) => {
  const [selectedRouteId, setSelectedRouteId] = useState(null);
  const [showConfirmCancelModal, setShowConfirmCancelModal] = useState(false);

  const effectiveRouteId =
    selectedRouteId && routes.some((r) => r.id === selectedRouteId)
      ? selectedRouteId
      : routes[0]?.id || 'Recorrido 1';

  const servicios = Array.isArray(student?.servicios) ? student.servicios : [];
  const isEnrolled =
    servicios.some((s) => String(s).toLowerCase().includes('transporte')) ||
    Boolean(student?.recorridoTransporte);

  const assignedRoute = student?.recorridoTransporte;
  const startDate = student?.transporteFechaInicio;
  const bajaSolicitada = Boolean(student?.transporteBajaSolicitada);
  const isCancelableToday = canCancelTransportToday(student);
  const nextMonth = getNextMonthFirstDay();

  const handleEnrollSubmit = (e) => {
    e.preventDefault();
    if (!effectiveRouteId || isProcessing) return;
    onEnrollTransport(effectiveRouteId);
  };

  const confirmCancel = () => {
    setShowConfirmCancelModal(false);
    onCancelTransport();
  };

  return (
    <div
      data-testid="parent-transport-section"
      className="bg-white rounded-xl border border-slate-200 p-5 md:p-6 space-y-5 shadow-sm text-left"
    >
      <PortalSectionHeader
        icon="directions_bus"
        iconBgClass="bg-purple-50"
        iconColorClass="text-purple-600"
        title="Autogestión de Transporte Escolar"
        subtitle="Vehículo: Mercedes-Benz Sprinter"
        statusBadge={
          <span
            data-testid="transport-status-tag"
            className={`text-xs font-bold px-2.5 py-1 rounded-full border ${
              isEnrolled
                ? bajaSolicitada
                  ? 'bg-amber-50 text-amber-800 border-amber-200'
                  : 'bg-emerald-50 text-emerald-700 border-emerald-200'
                : 'bg-slate-100 text-slate-600 border-slate-200'
            }`}
          >
            {isEnrolled
              ? bajaSolicitada
                ? 'Baja Programada (Mes prox.)'
                : 'Inscripto'
              : 'Sin suscripción'}
          </span>
        }
      />

      {isEnrolled ? (
        <ParentTransportEnrolledView
          assignedRoute={assignedRoute}
          startDate={startDate}
          bajaSolicitada={bajaSolicitada}
          isCancelableToday={isCancelableToday}
          nextMonthDisplay={nextMonth.display}
          isProcessing={isProcessing}
          onCancelClick={() => setShowConfirmCancelModal(true)}
        />
      ) : (
        <ParentTransportCatalogForm
          routes={routes}
          allStudents={allStudents}
          selectedRouteId={effectiveRouteId}
          setSelectedRouteId={setSelectedRouteId}
          isProcessing={isProcessing}
          onSubmit={handleEnrollSubmit}
        />
      )}

      {showConfirmCancelModal && (
        <ConfirmCancelTransportModal
          isCancelableToday={isCancelableToday}
          nextMonthDisplay={nextMonth.display}
          onAbort={() => setShowConfirmCancelModal(false)}
          onConfirm={confirmCancel}
        />
      )}
    </div>
  );
};

export default ParentTransportSection;
