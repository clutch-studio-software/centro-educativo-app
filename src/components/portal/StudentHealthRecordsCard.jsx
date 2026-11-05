import React, { useMemo } from 'react';
import PortalSectionHeader from './PortalSectionHeader.jsx';
import { getStudentHealthRecords } from '../../utils/studentPortalRecordsUtils.js';
import { formatDateDisplay } from '../../utils/transportSubscriptionUtils.js';

/**
 * Tarjeta de Entradas de Enfermería para el Portal del Estudiante / Tutor
 * Muestra el historial inmutable de atenciones médicas, primeros auxilios y medicación autorizada.
 */
const StudentHealthRecordsCard = ({ student }) => {
  const records = useMemo(() => {
    return getStudentHealthRecords(student);
  }, [student]);

  const count = records.length;

  return (
    <div
      data-testid="student-health-records-card"
      className="bg-white rounded-md border border-slate-200 p-5 md:p-6 space-y-4 shadow-sm text-left"
    >
      <PortalSectionHeader
        icon="medical_services"
        iconBgClass="bg-rose-50"
        iconColorClass="text-rose-600"
        title="Entradas de Enfermería (Gabinete de Salud)"
        subtitle="Historial protegido de atenciones médicas escolares y medicación administrada"
        statusBadge={
          <div className="flex items-center gap-1.5">
            <span
              data-testid="health-records-count-badge"
              className="text-xs font-bold px-2.5 py-1 rounded-full bg-rose-50 text-rose-700 border border-rose-200"
            >
              {count} {count === 1 ? 'atención' : 'atenciones'}
            </span>
            <span
              title="Los registros médicos escolares son permanentes e inmutables"
              className="text-[10px] font-bold text-rose-600 bg-rose-50 border border-rose-200 px-2 py-0.5 rounded-md flex items-center gap-0.5"
            >
              <span className="material-symbols-outlined text-[12px]">lock</span>
              Inmutable
            </span>
          </div>
        }
      />

      {count > 0 ? (
        <div className="space-y-3">
          {records.map((entry) => {
            const dateStr = entry.fecha ? formatDateDisplay(entry.fecha) : 'Fecha reciente';

            return (
              <div
                key={entry.id || entry.fecha || entry.motivo}
                data-testid={`health-record-item-${entry.id || 'entry'}`}
                className="p-3.5 rounded-md border border-rose-100 bg-rose-50/30 space-y-2 text-left"
              >
                <div className="flex flex-wrap items-center justify-between gap-2 border-b border-rose-100/60 pb-2">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-slate-800">
                      {entry.tipo || 'Atención de Salud'}
                    </span>
                    {entry.notificadoFamilias && (
                      <span
                        data-testid="tutor-notified-badge"
                        className="px-2 py-0.5 text-[10px] font-bold rounded-md bg-amber-50 text-amber-800 border border-amber-200 flex items-center gap-1"
                      >
                        <span className="material-symbols-outlined text-[12px]">contact_phone</span>
                        Tutor notificado
                      </span>
                    )}
                  </div>
                  <span className="text-[11px] text-slate-500 font-mono flex items-center gap-1">
                    <span className="material-symbols-outlined text-[13px] text-slate-400">
                      calendar_today
                    </span>
                    {dateStr}
                  </span>
                </div>

                <span className="text-xs text-slate-700 leading-relaxed font-medium">
                  {entry.motivo || entry.detalle || 'Atención registrada en gabinete.'}
                </span>

                <div className="pt-1.5 flex items-center justify-between text-[11px] text-slate-500">
                  <span className="flex items-center gap-1">
                    <span className="material-symbols-outlined text-rose-500 text-[13px]">
                      health_and_safety
                    </span>
                    Atendido por: <strong className="text-slate-700">{entry.autor || 'Enfermería Escolar'}</strong>
                  </span>
                  <span className="text-[10px] font-semibold text-rose-700">
                    Gabinete Médico
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="p-5 bg-slate-50 border border-dashed border-slate-200 rounded-xl text-center space-y-1">
          <p className="text-xs font-semibold text-slate-600">
            Sin atenciones médicas o registros de enfermería por el momento.
          </p>
          <p className="text-[11px] text-slate-400">
            Aquí se registran de forma inmutable todas las consultas realizadas en el gabinete de salud escolar.
          </p>
        </div>
      )}
    </div>
  );
};

export default StudentHealthRecordsCard;
