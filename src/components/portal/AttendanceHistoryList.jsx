import React from 'react';

/**
 * Listado de historial de asistencias y faltas con acciones de visto y justificación
 */
const AttendanceHistoryList = ({
  historial = [],
  isProcessing = false,
  onOpenJustify,
  onAcknowledgeAttendance,
}) => {
  if (!historial || historial.length === 0) {
    return (
      <div className="p-4 rounded-md bg-slate-50 border border-dashed border-slate-200 text-center text-xs text-slate-500">
        Sin inasistencias registradas. ¡Asistencia perfecta!
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {historial.map((item) => {
        const isInj =
          item.tipo?.toLowerCase().includes('injustificada') ||
          item.estado === 'injustificada';
        const isJust =
          item.tipo?.toLowerCase().includes('justificada') ||
          item.estado === 'justificada';
        const isAcknowledged = Boolean(item.vistoPorTutor || item.visto);
        const hasJustificationPending = Boolean(item.justificacion || item.estado === 'justificacion_pendiente');
        const itemKey = item.id || item.fecha;

        return (
          <div
            key={itemKey}
            data-testid={`attendance-row-${itemKey}`}
            className="p-3.5 rounded-md border border-slate-200 bg-slate-50/50 hover:bg-slate-50 transition-colors flex flex-col md:flex-row md:items-center justify-between gap-3"
          >
            <div className="space-y-1 text-left flex-1">
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-xs font-bold text-slate-800 font-mono">
                  {item.fecha}
                </span>
                <span
                  className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                    isInj
                      ? 'bg-rose-100 text-rose-800 border-rose-200'
                      : isJust
                        ? 'bg-blue-100 text-blue-800 border-blue-200'
                        : 'bg-amber-100 text-amber-800 border-amber-200'
                  }`}
                >
                  {item.tipo}
                </span>

                {/* Estado de Justificación */}
                {hasJustificationPending ? (
                  <span
                    data-testid={`justification-badge-${itemKey}`}
                    className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-blue-50 text-blue-800 border border-blue-200 flex items-center gap-1"
                  >
                    <span className="material-symbols-outlined text-[12px]">hourglass_top</span>
                    Justificación enviada (En revisión)
                  </span>
                ) : null}

                {/* Estado de Visto */}
                {isAcknowledged ? (
                  <span
                    data-testid={`ack-badge-${itemKey}`}
                    className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200 flex items-center gap-0.5"
                  >
                    <span className="material-symbols-outlined text-[12px]">done_all</span>
                    Visto por tutor
                  </span>
                ) : null}
              </div>

              <p className="text-xs text-slate-600">
                {item.motivo}
              </p>

              {item.justificacion?.detalle && (
                <div className="flex flex-wrap items-center gap-2 pt-0.5">
                  <p className="text-[11px] text-blue-800 font-medium">
                    Justificativo cargado: {item.justificacion.detalle}
                  </p>
                  {item.justificacion.comprobanteUrl && (
                    <a
                      href={item.justificacion.comprobanteUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      data-testid={`link-justification-file-${itemKey}`}
                      className="inline-flex items-center gap-1 text-[11px] font-bold text-blue-700 hover:text-blue-900 underline bg-blue-50 px-2 py-0.5 rounded-md border border-blue-200"
                    >
                      <span className="material-symbols-outlined text-[13px]">attach_file</span>
                      <span>{item.justificacion.comprobanteNombre || 'Ver comprobante'}</span>
                    </a>
                  )}
                </div>
              )}
            </div>

            {/* Acciones para el Tutor */}
            <div className="flex items-center gap-2 shrink-0">
              {/* Botón Justificar Falta si es injustificada y aún no tiene justificativo */}
              {isInj && !hasJustificationPending && (
                <button
                  type="button"
                  data-testid={`btn-justify-absence-${itemKey}`}
                  disabled={isProcessing}
                  onClick={() => onOpenJustify(item)}
                  className="px-2.5 py-1.5 rounded-md text-xs font-bold text-blue-700 bg-blue-50 hover:bg-blue-100 border border-blue-200 transition-colors cursor-pointer flex items-center gap-1"
                >
                  <span className="material-symbols-outlined text-[14px]">edit_document</span>
                  <span>Justificar Falta</span>
                </button>
              )}

              {/* Botón Dar el Visto si no se dio aún */}
              {!isAcknowledged && (
                <button
                  type="button"
                  data-testid={`btn-ack-attendance-${itemKey}`}
                  disabled={isProcessing}
                  onClick={() => onAcknowledgeAttendance && onAcknowledgeAttendance(itemKey)}
                  className="px-2.5 py-1.5 rounded-md text-xs font-bold text-slate-700 bg-white hover:bg-slate-100 border border-slate-300 transition-colors cursor-pointer flex items-center gap-1"
                >
                  <span className="material-symbols-outlined text-[14px]">visibility</span>
                  <span>Dar el Visto</span>
                </button>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default AttendanceHistoryList;
