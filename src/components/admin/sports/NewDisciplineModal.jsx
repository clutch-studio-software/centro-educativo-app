import React, { useState } from 'react';
import { NewDisciplineFormFields } from './NewDisciplineFormFields';
import { formatHorarioString, sortWeekDays } from './sportsScheduleUtils';

const EMPTY_TEACHERS = [];

const DEFAULT_INITIAL_DAYS = ['Lunes', 'Miércoles'];
const DEFAULT_INITIAL_HORARIOS = {
  Lunes: { inicio: '16:30', fin: '18:00' },
  Miércoles: { inicio: '16:30', fin: '18:00' },
};

const createNewDisciplineRecord = (formData, teachers) => {
  const teacherName = formData.profesorNombre.trim() || 'Profesor a designar';
  const teacherObj = teachers.find(
    (t) => (t.nombreCompleto || `${t.nombre} ${t.apellido}`) === formData.profesorNombre
  );

  const initials =
    teacherObj?.iniciales ||
    teacherName
      .split(' ')
      .filter((w) => !w.toLowerCase().startsWith('prof') && !w.toLowerCase().startsWith('sensei'))
      .map((w) => w[0])
      .slice(0, 2)
      .join('')
      .toUpperCase() ||
    'DOC';

  const finalHorario =
    formatHorarioString(formData.dias, formData.horariosPorDia) ||
    formData.horario?.trim() ||
    '';

  return {
    id: `disc-${Date.now()}`,
    nombre: formData.nombre.trim(),
    emoji: formData.emoji,
    bgColor: formData.bgColor,
    textColor: formData.textColor,
    profesor: {
      nombre: teacherName,
      iniciales: initials,
      email: formData.profesorEmail.trim() || `${teacherName.toLowerCase().replace(/[^a-z]/g, '')}@colegio.edu.ar`,
      telefono: teacherObj?.telefono || '+54 11 4455-0000',
    },
    niveles: formData.niveles,
    nivelId: formData.niveles,
    dias: formData.dias.length > 0 ? formData.dias : ['Lunes'],
    horariosPorDia: formData.horariosPorDia,
    horario: finalHorario,
    lugar: formData.lugar.trim() || 'Campus Deportivo y Recreativo',
    cupoMax: Number(formData.cupoMax) || 25,
    cupoOcupado: 0,
    activo: true,
    descripcion: formData.descripcion.trim() || 'Actividad deportiva y extracurricular de formación integral.',
    inscriptos: [],
  };
};

const NewDisciplineModal = ({ isOpen, onClose, onSave, teachers = EMPTY_TEACHERS }) => {
  const [formData, setFormData] = useState({
    nombre: '',
    emoji: '🏃',
    bgColor: 'bg-orange-50',
    textColor: 'text-orange-600',
    profesorNombre: '',
    profesorEmail: '',
    niveles: 'Primario y Secundario',
    dias: DEFAULT_INITIAL_DAYS,
    horariosPorDia: DEFAULT_INITIAL_HORARIOS,
    horario: formatHorarioString(DEFAULT_INITIAL_DAYS, DEFAULT_INITIAL_HORARIOS),
    lugar: '',
    cupoMax: 25,
    descripcion: '',
  });

  const [error, setError] = useState('');

  if (!isOpen) return null;

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleEmojiSelect = (opt) => {
    setFormData((prev) => ({
      ...prev,
      emoji: opt.emoji,
      bgColor: opt.bg,
      textColor: opt.text,
      nombre: prev.nombre ? prev.nombre : opt.label,
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
      setError('Por favor ingresa el nombre de la disciplina deportiva o extracurricular.');
      return;
    }
    if (!formData.dias || formData.dias.length === 0) {
      setError('Por favor selecciona al menos un día de cursada.');
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

    const newDiscipline = createNewDisciplineRecord(formData, teachers);
    onSave(newDiscipline);
    onClose();
  };

  return (
    <div
      data-testid="new-discipline-modal"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs animate-in fade-in duration-200"
    >
      <div className="bg-white rounded-3xl shadow-2xl border border-slate-100 w-full max-w-lg max-h-[90vh] flex flex-col overflow-hidden animate-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="px-6 py-5 border-b border-slate-100 flex items-center justify-between bg-slate-50/50 shrink-0">
          <div className="flex items-center gap-3">
            <span className="w-10 h-10 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold text-xl">
              {formData.emoji}
            </span>
            <div>
              <h3 className="text-base font-bold text-slate-900">+ Nueva Disciplina / Actividad</h3>
              <p className="text-xs text-slate-500">
                Configuración de oferta extracurricular, cupos y responsable.
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Cerrar modal de creación"
            className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-full transition-colors cursor-pointer border-none bg-transparent"
          >
            <span className="material-symbols-outlined text-[20px]">close</span>
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-4 text-xs">
          <NewDisciplineFormFields
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
              data-testid="submit-new-discipline"
              className="px-5 py-2 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-xl shadow-sm shadow-blue-500/25 transition-all cursor-pointer border-none"
            >
              Guardar Disciplina
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default NewDisciplineModal;
