import React, { useState } from 'react';

const EditSportsConfigModal = ({ isOpen, config, onClose, onSave }) => {
  const [formData, setFormData] = useState({
    nombre: config?.nombre || 'Atletismo',
    codigo: config?.codigo || 'DEP-ATL-2026',
    cupoMax: config?.cupoMax || 40,
    horario: config?.horario || 'Martes y Jueves 16:30 - 18:00 hs',
    dias: config?.dias || 'Martes y Jueves',
    horas: config?.horas || '16:30 - 18:00 hs',
    lugar: config?.lugar || 'Pista de Atletismo',
    instalacion: config?.instalacion || 'Gimnasio Central Polideportivo',
    niveles: config?.niveles || 'Primario y Secundario',
    nivelesDetalle: config?.nivelesDetalle || 'Primario (4° a 7°) y Secundario (1° a 6°)',
    politica: config?.politica || 'Control transaccional: Máximo 2 deportes por alumno en el ciclo.',
    supervision: config?.supervision || 'Supervisado por Dpto. Educación Física',
    listaEsperaCount: config?.listaEsperaCount || 4,
  });

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave({
      ...config,
      ...formData,
      cupoMax: Number(formData.cupoMax) || 40,
      listaEsperaCount: Number(formData.listaEsperaCount) || 0,
      titulo: `${formData.nombre} - Padrón y Detalle Operativo`,
    });
    onClose();
  };

  return (
    <div
      data-testid="edit-sports-config-modal"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs animate-in fade-in duration-200"
    >
      <div className="bg-white rounded-3xl shadow-2xl border border-slate-100 w-full max-w-lg overflow-hidden animate-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="px-6 py-5 border-b border-slate-100 flex items-center justify-between bg-slate-50/70">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-orange-100 text-orange-600 flex items-center justify-center font-bold">
              <span className="material-symbols-outlined text-[22px]">tune</span>
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">Configuración de Disciplina</h3>
              <p className="text-xs text-slate-500 font-mono">{formData.codigo}</p>
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

        {/* Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4 text-xs">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-slate-700 font-bold mb-1">Nombre de la Disciplina</label>
              <input
                type="text"
                value={formData.nombre}
                onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-slate-800 focus:outline-none focus:ring-2 focus:ring-primary/20 text-xs font-semibold"
                required
              />
            </div>
            <div>
              <label className="block text-slate-700 font-bold mb-1">Código de Cátedra</label>
              <input
                type="text"
                value={formData.codigo}
                onChange={(e) => setFormData({ ...formData, codigo: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-slate-800 focus:outline-none focus:ring-2 focus:ring-primary/20 text-xs font-mono font-bold"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-slate-700 font-bold mb-1">Cupo Máximo (Plazas)</label>
              <input
                type="number"
                min="1"
                max="100"
                value={formData.cupoMax}
                onChange={(e) => setFormData({ ...formData, cupoMax: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-slate-800 focus:outline-none focus:ring-2 focus:ring-primary/20 text-xs"
                required
              />
            </div>
            <div>
              <label className="block text-slate-700 font-bold mb-1">Lista de Espera Actual</label>
              <input
                type="number"
                min="0"
                value={formData.listaEsperaCount}
                onChange={(e) => setFormData({ ...formData, listaEsperaCount: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-slate-800 focus:outline-none focus:ring-2 focus:ring-primary/20 text-xs"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-slate-700 font-bold mb-1">Días de Cursada</label>
              <input
                type="text"
                value={formData.dias}
                onChange={(e) => setFormData({ ...formData, dias: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-slate-800 focus:outline-none focus:ring-2 focus:ring-primary/20 text-xs"
              />
            </div>
            <div>
              <label className="block text-slate-700 font-bold mb-1">Banda Horaria</label>
              <input
                type="text"
                value={formData.horas}
                onChange={(e) => setFormData({ ...formData, horas: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-slate-800 focus:outline-none focus:ring-2 focus:ring-primary/20 text-xs"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-slate-700 font-bold mb-1">Espacio Asignado</label>
              <input
                type="text"
                value={formData.lugar}
                onChange={(e) => setFormData({ ...formData, lugar: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-slate-800 focus:outline-none focus:ring-2 focus:ring-primary/20 text-xs"
              />
            </div>
            <div>
              <label className="block text-slate-700 font-bold mb-1">Instalación / Sede</label>
              <input
                type="text"
                value={formData.instalacion}
                onChange={(e) => setFormData({ ...formData, instalacion: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-slate-800 focus:outline-none focus:ring-2 focus:ring-primary/20 text-xs"
              />
            </div>
          </div>

          <div>
            <label className="block text-slate-700 font-bold mb-1">Niveles Habilitados</label>
            <input
              type="text"
              value={formData.nivelesDetalle}
              onChange={(e) => setFormData({ ...formData, nivelesDetalle: e.target.value })}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-slate-800 focus:outline-none focus:ring-2 focus:ring-primary/20 text-xs"
            />
          </div>

          <div>
            <label className="block text-slate-700 font-bold mb-1">Política Transaccional Institucional</label>
            <input
              type="text"
              value={formData.politica}
              onChange={(e) => setFormData({ ...formData, politica: e.target.value })}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-slate-800 focus:outline-none focus:ring-2 focus:ring-primary/20 text-xs"
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
              className="px-5 py-2.5 text-xs font-bold text-white bg-primary hover:bg-primary-dim rounded-xl transition-all shadow-sm cursor-pointer border-none"
            >
              Guardar Cambios
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditSportsConfigModal;
