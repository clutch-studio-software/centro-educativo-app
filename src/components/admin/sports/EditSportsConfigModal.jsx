import React, { useState } from 'react';
import { EditDisciplineFormFields } from './EditDisciplineFormFields';
import {
  parseHorariosFromDiscipline,
  formatHorarioString,
  buildUpdatedDiscipline,
} from './sportsScheduleUtils';
import { MOCK_TEACHERS } from '../../../data/mockTeachers';

const EditSportsConfigModalContent = ({
  config,
  onClose,
  onSave,
  teachers = MOCK_TEACHERS,
}) => {
  const initialHorarios = parseHorariosFromDiscipline(config);
  const rawDias = Array.isArray(config?.dias)
    ? config.dias
    : typeof config?.dias === 'string' && config.dias.trim()
    ? config.dias
        .split(/,|\sy\s/i)
        .map((d) => d.trim())
        .filter(Boolean)
    : ['Lunes', 'Miércoles'];

  const initialDias = rawDias.length > 0 ? rawDias : ['Lunes', 'Miércoles'];

  initialDias.forEach((d) => {
    if (!initialHorarios[d]) {
      initialHorarios[d] = { inicio: '16:00', fin: '17:30' };
    }
  });

  const [formData, setFormData] = useState({
    nombre: config?.nombre || config?.titulo?.split(' - ')[0] || '',
    emoji: config?.emoji || '🏃',
    bgColor: config?.bgColor || 'bg-orange-50',
    textColor: config?.textColor || 'text-orange-600',
    profesorNombre: config?.profesor?.nombre || '',
    profesorEmail: config?.profesor?.email || '',
    niveles: config?.niveles || 'Primario y Secundario',
    dias: initialDias,
    horariosPorDia: initialHorarios,
    horario:
      config?.horario ||
      config?.horas ||
      formatHorarioString(initialDias, initialHorarios),
    lugar: config?.lugar || config?.instalacion || '',
    cupoMax: config?.cupoMax || 40,
    activo: config?.activo ?? true,
    descripcion: config?.descripcion || config?.politica || '',
  });

  const [error, setError] = useState('');

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const handleEmojiSelect = (opt) => {
    setFormData((prev) => ({
      ...prev,
      emoji: opt.emoji,
      bgColor: opt.bg,
      textColor: opt.text,
    }));
  };

  const handleToggleDay = (day) => {
    setFormData((prev) => {
      const current = prev.dias || [];
      const updated = current.includes(day)
        ? current.filter((d) => d !== day)
        : [...current, day];

      const newHorarios = { ...prev.horariosPorDia };
      if (!current.includes(day) && !newHorarios[day]) {
        const existingDay = current.find(
          (d) => newHorarios[d]?.inicio && newHorarios[d]?.fin
        );
        newHorarios[day] = existingDay
          ? { ...newHorarios[existingDay] }
          : { inicio: '16:00', fin: '17:30' };
      }

      return {
        ...prev,
        dias: updated,
        horariosPorDia: newHorarios,
        horario: formatHorarioString(updated, newHorarios),
      };
    });
  };

  const handleScheduleChange = (day, field, value) => {
    setFormData((prev) => {
      const updatedHorarios = {
        ...prev.horariosPorDia,
        [day]: {
          ...(prev.horariosPorDia?.[day] || { inicio: '16:00', fin: '17:30' }),
          [field]: value,
        },
      };
      return {
        ...prev,
        horariosPorDia: updatedHorarios,
        horario: formatHorarioString(prev.dias, updatedHorarios),
      };
    });
  };

  const handleCopyScheduleToAll = (sourceDay) => {
    setFormData((prev) => {
      const template = prev.horariosPorDia?.[sourceDay] || {
        inicio: '16:00',
        fin: '17:30',
      };
      const updatedHorarios = { ...prev.horariosPorDia };
      (prev.dias || []).forEach((d) => {
        updatedHorarios[d] = { ...template };
      });
      return {
        ...prev,
        horariosPorDia: updatedHorarios,
        horario: formatHorarioString(prev.dias, updatedHorarios),
      };
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.nombre.trim()) {
      setError('Por favor ingresa el nombre de la disciplina.');
      return;
    }
    if (!formData.dias || formData.dias.length === 0) {
      setError('Por favor selecciona al menos un día de clase.');
      return;
    }

    for (const day of formData.dias) {
      const sched = formData.horariosPorDia?.[day];
      if (!sched?.inicio || !sched?.fin) {
        setError(`Por favor completa los horarios de inicio y fin para el día ${day}.`);
        return;
      }
      if (sched.inicio >= sched.fin) {
        setError(`El horario de fin debe ser posterior al inicio para el día ${day}.`);
        return;
      }
    }

    const updatedDiscipline = buildUpdatedDiscipline(config, formData, teachers);
    onSave(updatedDiscipline);
    onClose();
  };

  return (
    <div
      data-testid="edit-sports-config-modal"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs animate-in fade-in duration-200"
    >
      <div className="bg-white rounded-3xl shadow-2xl border border-slate-100 w-full max-w-xl max-h-[90vh] flex flex-col overflow-hidden animate-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="px-6 py-5 border-b border-slate-100 flex items-center justify-between bg-slate-50/70 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold">
              <span className="material-symbols-outlined text-[22px]">tune</span>
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">
                Configuración de Disciplina
              </h3>
              <p className="text-xs text-slate-500 font-mono">
                {config?.code || 'Actividad Extracurricular'}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Cerrar modal de configuración"
            className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-full transition-colors cursor-pointer border-none bg-transparent"
          >
            <span className="material-symbols-outlined text-[20px]">close</span>
          </button>
        </div>

        {/* Form Body - exactly matches the activity table panel */}
        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-4 text-xs">
          <EditDisciplineFormFields
            formData={formData}
            onChange={handleChange}
            onEmojiSelect={handleEmojiSelect}
            onToggleDay={handleToggleDay}
            onScheduleChange={handleScheduleChange}
            onCopyScheduleToAll={handleCopyScheduleToAll}
            teachers={teachers}
            error={error}
          />

          {/* Modal Actions */}
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
              data-testid="btn-save-discipline-config"
              className="px-5 py-2.5 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-xl transition-all shadow-sm cursor-pointer border-none"
            >
              Guardar Configuración
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

const EditSportsConfigModal = ({ isOpen, config, onClose, onSave, teachers = MOCK_TEACHERS }) => {
  if (!isOpen) return null;

  return (
    <EditSportsConfigModalContent
      key={config?.id || 'sports-config'}
      config={config}
      onClose={onClose}
      onSave={onSave}
      teachers={teachers}
    />
  );
};

export default EditSportsConfigModal;
