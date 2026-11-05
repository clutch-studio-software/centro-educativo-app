import React, { useMemo } from 'react';
import PortalSectionHeader from './PortalSectionHeader.jsx';
import { getStudentPreceptoriaRecords } from '../../utils/studentPortalRecordsUtils.js';
import { formatDateDisplay } from '../../utils/transportSubscriptionUtils.js';

/**
 * Tarjeta de Entradas de Preceptoría para el Portal del Estudiante / Tutor
 * Permite supervisar partes de convivencia, observaciones disciplinarias y comunicaciones de preceptoría.
 */
const StudentPreceptoriaRecordsCard = ({ student }) => {
  const records = useMemo(() => {
    return getStudentPreceptoriaRecords(student);
  }, [student]);

  const count = records.length;

  return (
    <div
      data-testid="student-preceptoria-records-card"
      className="bg-white rounded-md border border-slate-200 p-5 md:p-6 space-y-4 shadow-sm text-left"
    >
      <PortalSectionHeader
        icon="assignment_ind"
        iconBgClass="bg-indigo-50"
        iconColorClass="text-indigo-600"
        title="Entradas de Preceptoría (Convivencia y Seguimiento)"
        subtitle="Observaciones institucionales, partes de convivencia y justificaciones"
        statusBadge={
          <span
            data-testid="preceptoria-records-count-badge"
            className="text-xs font-bold px-2.5 py-1 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-200"
          >
            {count} {count === 1 ? 'registro' : 'registros'}
          </span>
        }
      />

      {count > 0 ? (
        <div className="space-y-3">
          {records.map((entry) => {
            const dateStr = entry.fecha ? formatDateDisplay(entry.fecha) : 'Fecha reciente';

            return (
              <div
                key={entry.id || entry.fecha || entry.motivo}
                data-testid={`preceptoria-record-item-${entry.id || 'entry'}`}
                className="p-3.5 rounded-md border border-indigo-100 bg-indigo-50/20 space-y-2 text-left"
              >
                <div className="flex flex-wrap items-center justify-between gap-2 border-b border-indigo-100/60 pb-2">
                  <span className="text-xs font-bold text-slate-800">
                    {entry.tipo || entry.titulo || 'Observación Institucional'}
                  </span>
                  <span className="text-[11px] text-slate-500 font-mono flex items-center gap-1">
                    <span className="material-symbols-outlined text-[13px] text-slate-400">
                      calendar_today
                    </span>
                    {dateStr}
                  </span>
                </div>

                <span className="text-xs text-slate-700 leading-relaxed font-medium">
                  {entry.motivo || entry.detalle || 'Observación asentada por preceptoría.'}
                </span>

                <div className="pt-1.5 flex items-center justify-between text-[11px] text-slate-500">
                  <span className="flex items-center gap-1">
                    <span className="material-symbols-outlined text-indigo-500 text-[13px]">
                      badge
                    </span>
                    Registrado por: <strong className="text-slate-700">{entry.autor || 'Preceptoría'}</strong>
                  </span>
                  <span className="text-[10px] font-semibold text-indigo-700">
                    Seguimiento Escolar
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="p-5 bg-slate-50 border border-dashed border-slate-200 rounded-xl text-center space-y-1">
          <p className="text-xs font-semibold text-slate-600">
            Sin observaciones o registros de preceptoría por el momento.
          </p>
          <p className="text-[11px] text-slate-400">
            Aquí se asientan las comunicaciones disciplinarias y observaciones de convivencia escolar.
          </p>
        </div>
      )}
    </div>
  );
};

export default StudentPreceptoriaRecordsCard;
