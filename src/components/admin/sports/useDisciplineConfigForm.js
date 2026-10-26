import { useState } from 'react';
import {
  parseHorariosFromDiscipline,
  formatHorarioString,
  buildUpdatedDiscipline,
} from './sportsScheduleUtils';
import { MOCK_TEACHERS } from '../../../data/mockTeachers';

const getInitialDias = (config) => {
  if (Array.isArray(config?.dias) && config.dias.length > 0) {
    return config.dias;
  }
  if (typeof config?.dias === 'string' && config.dias.trim()) {
    const parsed = config.dias
      .split(/,|\sy\s/i)
      .map((d) => d.trim())
      .filter(Boolean);
    if (parsed.length > 0) return parsed;
  }
  return ['Lunes', 'Miércoles'];
};

const getInitialHorarios = (config, dias) => {
  const initialHorarios = parseHorariosFromDiscipline(config);
  dias.forEach((d) => {
    if (!initialHorarios[d]) {
      initialHorarios[d] = { inicio: '16:00', fin: '17:30' };
    }
  });
  return initialHorarios;
};

const validateForm = (formData) => {
  if (!formData.nombre.trim()) {
    return 'Por favor ingresa el nombre de la disciplina.';
  }
  if (!formData.dias || formData.dias.length === 0) {
    return 'Por favor selecciona al menos un día de clase.';
  }
  for (const day of formData.dias) {
    const sched = formData.horariosPorDia?.[day];
    if (!sched?.inicio || !sched?.fin) {
      return `Por favor completa los horarios de inicio y fin para el día ${day}.`;
    }
    if (sched.inicio >= sched.fin) {
      return `El horario de fin debe ser posterior al inicio para el día ${day}.`;
    }
  }
  return '';
};

export const useDisciplineConfigForm = (
  config,
  teachers = MOCK_TEACHERS,
  onSave,
  onClose
) => {
  const [formData, setFormData] = useState(() => {
    const dias = getInitialDias(config);
    const horarios = getInitialHorarios(config, dias);
    return {
      nombre: config?.nombre || config?.titulo?.split(' - ')[0] || '',
      emoji: config?.emoji || '🏃',
      bgColor: config?.bgColor || 'bg-orange-50',
      textColor: config?.textColor || 'text-orange-600',
      profesorNombre: config?.profesor?.nombre || '',
      profesorEmail: config?.profesor?.email || '',
      niveles: config?.niveles || 'Primario y Secundario',
      dias,
      horariosPorDia: horarios,
      horario:
        config?.horario ||
        config?.horas ||
        formatHorarioString(dias, horarios),
      lugar: config?.lugar || config?.instalacion || '',
      cupoMax: config?.cupoMax || 40,
      activo: config?.activo ?? true,
      descripcion: config?.descripcion || config?.politica || '',
    };
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
    const validationError = validateForm(formData);
    if (validationError) {
      setError(validationError);
      return;
    }

    const updatedDiscipline = buildUpdatedDiscipline(config, formData, teachers);
    onSave(updatedDiscipline);
    onClose();
  };

  return {
    formData,
    error,
    handleChange,
    handleEmojiSelect,
    handleToggleDay,
    handleScheduleChange,
    handleCopyScheduleToAll,
    handleSubmit,
  };
};
