import React, { useState } from 'react';
import { INITIAL_DISCIPLINES } from '../../../data/mockSportsActivities';

const TransferWithdrawModal = ({ isOpen, student, onClose, onConfirm }) => {
  const [actionType, setActionType] = useState('withdraw'); // 'withdraw' | 'transfer'
  const [targetDiscipline, setTargetDiscipline] = useState('Natación');
  const [motivo, setMotivo] = useState('');

  if (!isOpen || !student) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    onConfirm({
      studentId: student.id,
      studentName: student.nombre,
      actionType,
      targetDiscipline: actionType === 'transfer' ? targetDiscipline : null,
      motivo,
    });
    onClose();
  };

  return (
    <div
      data-testid="transfer-withdraw-modal"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs animate-in fade-in duration-200"
    >
      <div className="bg-white rounded-3xl shadow-2xl border border-slate-100 w-full max-w-md overflow-hidden animate-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="px-6 py-5 border-b border-slate-100 flex items-center justify-between bg-slate-50/70">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center font-bold">
              <span className="material-symbols-outlined text-[22px]">swap_horiz</span>
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">Baja o Transferencia</h3>
              <p className="text-xs text-slate-500 font-mono">{student.legajo}</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-full transition-colors cursor-pointer border-none bg-transparent"
          >
            <span className="material-symbols-outlined text-[20px]">close</span>
          </button>
        </div>

        {/* Content */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4 text-xs">
          {/* Student Info Card */}
          <div className="p-3 bg-slate-50 rounded-2xl border border-slate-100 flex items-center gap-3">
            <div className={`w-9 h-9 rounded-full bg-gradient-to-tr ${student.avatarGrad || 'from-blue-600 to-indigo-600'} text-white font-bold flex items-center justify-center text-xs shrink-0`}>
              {student.iniciales || 'AL'}
            </div>
            <div className="min-w-0">
              <p className="font-bold text-slate-900 truncate">{student.nombre}</p>
              <p className="text-[11px] text-slate-500">{student.cursoCompleto} • DNI {student.dni}</p>
            </div>
          </div>

          {/* Action selection */}
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => setActionType('withdraw')}
              className={`p-3 rounded-xl border text-center transition-all cursor-pointer ${
                actionType === 'withdraw'
                  ? 'border-red-400 bg-red-50 text-red-700 font-bold shadow-xs'
                  : 'border-slate-200 text-slate-600 hover:bg-slate-50'
              }`}
            >
              <span className="material-symbols-outlined text-base block mx-auto mb-1">person_remove</span>
              Dar de Baja
            </button>

            <button
              type="button"
              onClick={() => setActionType('transfer')}
              className={`p-3 rounded-xl border text-center transition-all cursor-pointer ${
                actionType === 'transfer'
                  ? 'border-blue-400 bg-blue-50 text-blue-700 font-bold shadow-xs'
                  : 'border-slate-200 text-slate-600 hover:bg-slate-50'
              }`}
            >
              <span className="material-symbols-outlined text-base block mx-auto mb-1">move_up</span>
              Transferir a Otra
            </button>
          </div>

          {actionType === 'transfer' ? (
            <div>
              <label className="block text-slate-700 font-bold mb-1">Disciplina de Destino</label>
              <select
                value={targetDiscipline}
                onChange={(e) => setTargetDiscipline(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-slate-800 focus:outline-none focus:ring-2 focus:ring-primary/20 text-xs"
              >
                {INITIAL_DISCIPLINES.filter((d) => d.nombre !== 'Atletismo').map((d) => (
                  <option key={d.id} value={d.nombre}>
                    {d.emoji} {d.nombre} ({d.niveles}) - Vacantes: {Math.max(0, d.cupoMax - d.cupoOcupado)}
                  </option>
                ))}
              </select>
            </div>
          ) : (
            <div className="bg-red-50 border border-red-100 rounded-xl p-3 text-red-800">
              <p className="text-[11px] leading-relaxed">
                Al confirmar la baja, el alumno será retirado del padrón activo de Atletismo y se liberará 1 plaza para la lista de espera.
              </p>
            </div>
          )}

          <div>
            <label className="block text-slate-700 font-bold mb-1">Motivo / Observaciones (Opcional)</label>
            <textarea
              rows={2}
              value={motivo}
              onChange={(e) => setMotivo(e.target.value)}
              placeholder="Indique la justificación de la gestión administrativa..."
              className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-slate-800 focus:outline-none focus:ring-2 focus:ring-primary/20 text-xs"
            />
          </div>

          {/* Footer */}
          <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-2.5">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer border-none bg-transparent"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className={`px-5 py-2.5 text-xs font-bold text-white rounded-xl transition-all shadow-sm cursor-pointer border-none ${
                actionType === 'withdraw'
                  ? 'bg-red-600 hover:bg-red-700'
                  : 'bg-primary hover:bg-primary-dim'
              }`}
            >
              {actionType === 'withdraw' ? 'Confirmar Baja' : 'Confirmar Transferencia'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default TransferWithdrawModal;
