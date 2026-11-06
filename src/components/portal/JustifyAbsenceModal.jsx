import React, { useState, useRef } from 'react';
import { validateUploadedFile } from '../../services/storageService.js';

/**
 * Modal para que los padres/tutores carguen la justificación de una inasistencia escolar
 */
const JustifyAbsenceModal = ({
  absence,
  studentName = 'el alumno',
  onClose,
  onSubmit,
  isProcessing = false,
}) => {
  const [motivo, setMotivo] = useState('Certificado Médico / Reposo de Salud');
  const [detalle, setDetalle] = useState('');
  const [certificadoRef, setCertificadoRef] = useState('');
  const archivoFileRef = useRef(null);
  const [archivoNombre, setArchivoNombre] = useState('');
  const [error, setError] = useState('');

  if (!absence) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!detalle.trim()) {
      setError('Por favor detalle el motivo o diagnóstico de la justificación.');
      return;
    }
    setError('');
    onSubmit({
      absenceId: absence.id || absence.fecha,
      motivo,
      detalle: detalle.trim(),
      certificadoRef: certificadoRef.trim() || archivoNombre || 'Certificado adjunto digitalmente',
      file: archivoFileRef.current,
    });
  };

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) {
      archivoFileRef.current = null;
      setArchivoNombre('');
      return;
    }

    const validation = validateUploadedFile(file);
    if (!validation.valid) {
      setError(validation.error);
      archivoFileRef.current = null;
      setArchivoNombre('');
      e.target.value = '';
      return;
    }

    setError('');
    archivoFileRef.current = file;
    setArchivoNombre(file.name);
  };

  return (
    <dialog
      open
      aria-labelledby="justify-absence-title"
      data-testid="justify-absence-modal"
      className="fixed inset-0 z-50 overflow-hidden bg-transparent p-0 max-w-none w-full h-full border-none m-0"
    >
      <div
        aria-hidden="true"
        onClick={onClose}
        className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-150"
      />
      <div className="fixed inset-0 flex items-center justify-center p-4 pointer-events-none">
        <div className="bg-white rounded-md max-w-lg w-full p-6 space-y-4 shadow-xl border border-slate-200 text-left relative z-10 pointer-events-auto animate-in zoom-in-95 duration-150">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-md bg-blue-50 text-blue-600 flex items-center justify-center">
                <span className="material-symbols-outlined text-xl">assignment_turned_in</span>
              </div>
              <div>
                <h3
                  id="justify-absence-title"
                  className="text-base font-bold text-slate-800"
                >
                  Justificar Inasistencia Escolar
                </h3>
                <p className="text-xs text-slate-500">
                  Estudiante: <strong className="text-slate-700">{studentName}</strong> · Fecha: <strong className="text-slate-700">{absence.fecha}</strong>
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="text-slate-400 hover:text-slate-600 cursor-pointer"
            >
              <span className="material-symbols-outlined text-lg">close</span>
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4 text-xs">
            {error && (
              <div className="p-3 rounded-md bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center gap-2">
                <span className="material-symbols-outlined text-rose-600 text-sm">error</span>
                <span>{error}</span>
              </div>
            )}

            <div>
              <label
                htmlFor="justify-motive-select"
                className="block font-bold text-slate-700 mb-1"
              >
                Causa o Motivo Principal <span className="text-rose-500">*</span>
              </label>
              <select
                id="justify-motive-select"
                data-testid="justify-motive-select"
                value={motivo}
                onChange={(e) => setMotivo(e.target.value)}
                className="w-full p-2.5 rounded-md border border-slate-300 bg-white text-slate-800 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none text-xs"
              >
                <option value="Certificado Médico / Reposo de Salud">
                  Certificado Médico / Reposo de Salud
                </option>
                <option value="Trámite o Turno Médico Impostergable">
                  Trámite o Turno Médico Impostergable
                </option>
                <option value="Fuerza Mayor / Emergencia Familiar">
                  Fuerza Mayor / Emergencia Familiar
                </option>
                <option value="Duelo / Situación Particular">
                  Duelo / Situación Particular
                </option>
                <option value="Aislamiento Preventivo">
                  Aislamiento Preventivo
                </option>
              </select>
            </div>

            <div>
              <label
                htmlFor="justify-detail-input"
                className="block font-bold text-slate-700 mb-1"
              >
                Detalle y Justificación de la Falta <span className="text-rose-500">*</span>
              </label>
              <textarea
                id="justify-detail-input"
                data-testid="justify-detail-input"
                rows={3}
                value={detalle}
                onChange={(e) => setDetalle(e.target.value)}
                placeholder="Indique el diagnóstico médico, motivo circunstancial o justificación institucional..."
                className="w-full p-2.5 rounded-md border border-slate-300 bg-white text-slate-800 placeholder-slate-400 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none text-xs"
              />
            </div>

            <div>
              <label
                htmlFor="justify-cert-input"
                className="block font-bold text-slate-700 mb-1"
              >
                Nº de Certificado / Profesional Interviniente (Opcional)
              </label>
              <input
                id="justify-cert-input"
                data-testid="justify-cert-input"
                type="text"
                value={certificadoRef}
                onChange={(e) => setCertificadoRef(e.target.value)}
                placeholder="Ej. Dr. Mario Ruiz - Mat. 12942 / Clínica Central"
                className="w-full p-2.5 rounded-md border border-slate-300 bg-white text-slate-800 placeholder-slate-400 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none text-xs"
              />
            </div>

            <div>
              <label
                htmlFor="justify-file-input"
                className="block font-bold text-slate-700 mb-1"
              >
                Adjuntar Comprobante o Certificado Médico (Máx. 2 MB - PDF, PNG, JPG o JPEG)
              </label>
              <input
                id="justify-file-input"
                data-testid="justify-file-input"
                type="file"
                accept=".pdf,.png,.jpg,.jpeg"
                onChange={handleFileChange}
                className="w-full text-xs text-slate-500 file:mr-3 file:py-1.5 file:px-3 file:rounded-md file:border-0 file:text-xs file:font-bold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 cursor-pointer"
              />
              {archivoNombre && (
                <p className="mt-1 text-[11px] text-emerald-700 font-medium flex items-center gap-1">
                  <span className="material-symbols-outlined text-[13px]">attach_file</span>
                  Archivo adjuntado: {archivoNombre}
                </p>
              )}
            </div>

            <div className="p-3 rounded-md bg-blue-50/60 border border-blue-200/70 text-[11px] text-blue-900 leading-relaxed">
              <strong>Nota Institucional:</strong> Las justificaciones enviadas son remitidas al preceptor del curso para su constatación. Una vez aprobadas, la inasistencia se computará formalmente como justificada.
            </div>

            <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-slate-100">
              <button
                type="button"
                data-testid="btn-abort-justify"
                disabled={isProcessing}
                onClick={onClose}
                className="px-4 py-2 rounded-md text-xs font-semibold text-slate-600 hover:text-slate-800 hover:bg-slate-100 transition-colors cursor-pointer"
              >
                Cancelar
              </button>
              <button
                type="submit"
                data-testid="btn-submit-justification"
                disabled={isProcessing}
                className="px-4 py-2 rounded-md text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 transition-colors cursor-pointer shadow-sm disabled:opacity-50"
              >
                {isProcessing ? 'Enviando...' : 'Enviar Justificación'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </dialog>
  );
};

export default JustifyAbsenceModal;
