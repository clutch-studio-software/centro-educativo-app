import React, { useState } from 'react';
import { EditDisciplineFormFields } from './EditDisciplineFormFields';
import {
  parseHorariosFromDiscipline,
  formatHorarioString,
  buildUpdatedDiscipline,
  sortWeekDays,
} from './sportsScheduleUtils';

const EMPTY_TEACHERS = [];

const EditDisciplineModalContent = ({ discipline, onClose, onSave, teachers = EMPTY_TEACHERS }) => {
  const initialHorarios = parseHorariosFromDiscipline(discipline);
  const initialDias = sortWeekDays(
    discipline.dias && discipline.dias.length > 0
      ? discipline.dias
      : ['Lunes', 'Miércoles']
  );

  initialDias.forEach((d) => {
    if (!initialHorarios[d]) {
      initialHorarios[d] = { inicio: '16:00', fin: '17:30' };
    }
  });

  const [formData, setFormData] = useState({
    nombre: discipline.nombre || '',
    emoji: discipline.emoji || '🏃',
    bgColor: discipline.bgColor || 'bg-blue-50',
    textColor: discipline.textColor || 'text-blue-600',
    profesorNombre: discipline.profesor?.nombre || '',
    profesorEmail: discipline.profesor?.email || '',
    niveles: discipline.niveles || 'Primario y Secundario',
    dias: initialDias,
    horariosPorDia: initialHorarios,
    horario: discipline.horario || formatHorarioString(initialDias, initialHorarios),
    lugar: discipline.lugar || '',
    cupoMax: discipline.cupoMax || 25,
    activo: discipline.activo ?? true,
    descripcion: discipline.descripcion || '',
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
      const updated = sortWeekDays(
        current.includes(day)
          ? current.filter((d) => d !== day)
          : [...current, day]
      );

      const newHorarios = { ...prev.horariosPorDia };
      if (!current.includes(day) && !newHorarios[day]) {
        const existingDay = current.find((d) => newHorarios[d]?.inicio && newHorarios[d]?.fin);
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
      const template = prev.horariosPorDia?.[sourceDay] || { inicio: '16:00', fin: '17:30' };
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

    const updatedDiscipline = buildUpdatedDiscipline(discipline, formData, teachers);
    onSave(discipline.id, updatedDiscipline);
    onClose();
  };

  return (
    <div
      data-testid="edit-discipline-modal"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs animate-in fade-in duration-200"
    >
      <div className="bg-white rounded-3xl shadow-2xl border border-slate-100 w-full max-w-xl max-h-[90vh] flex flex-col overflow-hidden animate-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="px-6 py-5 border-b border-slate-100 flex items-center justify-between bg-slate-50/50 shrink-0">
          <div className="flex items-center gap-3">
            <div className='items-center'>
              <h1 className="text-base font-bold text-slate-900">Editar Disciplina Deportiva</h1>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Cerrar modal de edición"
            className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-full transition-colors cursor-pointer border-none bg-transparent"
          >
            <span className="material-symbols-outlined text-[20px]">close</span>
          </button>
        </div>

        {/* Form Body */}
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

          {/* Actions */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer border-none bg-transparent"
            >
              Cancelar
            </button>
            <button
              type="submit"
              data-testid="submit-edit-discipline"
              className="px-5 py-2 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-xl shadow-sm shadow-blue-500/25 transition-all cursor-pointer border-none"
            >
              Guardar Cambios
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

const EditDisciplineModal = ({ isOpen, discipline, onClose, onSave, teachers = EMPTY_TEACHERS }) => {
  if (!isOpen || !discipline) return null;

  return (
    <EditDisciplineModalContent
      key={discipline.id}
      discipline={discipline}
      onClose={onClose}
      onSave={onSave}
      teachers={teachers}
    />
  );
};

export default EditDisciplineModal;
