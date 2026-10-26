/**
 * Utility functions for parsing and formatting sports discipline schedules
 */

export const parseHorariosFromDiscipline = (discipline) => {
  if (discipline?.horariosPorDia && typeof discipline.horariosPorDia === 'object') {
    return { ...discipline.horariosPorDia };
  }

  let defaultInicio = '16:00';
  let defaultFin = '17:30';

  if (discipline?.horario) {
    const match = discipline.horario.match(/(\d{1,2}:\d{2})\s*(?:-|a|–|al)\s*(\d{1,2}:\d{2})/);
    if (match) {
      defaultInicio = match[1].padStart(5, '0');
      defaultFin = match[2].padStart(5, '0');
    }
  }

  const dias = discipline?.dias || [];
  const result = {};
  dias.forEach((dia) => {
    result[dia] = { inicio: defaultInicio, fin: defaultFin };
  });
  return result;
};

export const getDayOrderIndex = (day) => {
  const normalized = String(day || '')
    .trim()
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '');

  if (normalized.startsWith('lun')) return 1;
  if (normalized.startsWith('mar')) return 2;
  if (normalized.startsWith('mie')) return 3;
  if (normalized.startsWith('jue')) return 4;
  if (normalized.startsWith('vie')) return 5;
  if (normalized.startsWith('sab')) return 6;
  if (normalized.startsWith('dom')) return 7;
  return 99;
};

export const sortWeekDays = (days = []) => {
  if (!Array.isArray(days)) return [];
  return [...days].sort((a, b) => getDayOrderIndex(a) - getDayOrderIndex(b));
};

export const formatHorarioString = (dias = [], horariosPorDia = {}) => {
  if (!dias || dias.length === 0) return '';
  const sortedDays = sortWeekDays(dias);

  const firstDay = sortedDays[0];
  const firstHorario = horariosPorDia[firstDay] || { inicio: '16:00', fin: '17:30' };
  const allSame = sortedDays.every(
    (d) =>
      horariosPorDia[d]?.inicio === firstHorario.inicio &&
      horariosPorDia[d]?.fin === firstHorario.fin
  );

  if (allSame) {
    const formattedDays =
      sortedDays.length === 1
        ? sortedDays[0]
        : `${sortedDays.slice(0, -1).join(', ')} y ${sortedDays[sortedDays.length - 1]}`;
    return `${formattedDays} ${firstHorario.inicio} - ${firstHorario.fin}`;
  }

  return sortedDays
    .map((d) => {
      const h = horariosPorDia[d] || { inicio: '16:00', fin: '17:30' };
      return `${d} ${h.inicio} - ${h.fin}`;
    })
    .join(', ');
};

export const buildUpdatedDiscipline = (discipline, formData, teachers = []) => {
  const teacherObj = teachers.find(
    (t) => (t.nombreCompleto || `${t.nombre} ${t.apellido}`) === formData.profesorNombre
  );

  const initials =
    teacherObj?.iniciales ||
    formData.profesorNombre
      .split(' ')
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
    ...discipline,
    nombre: formData.nombre.trim(),
    emoji: formData.emoji,
    bgColor: formData.bgColor,
    textColor: formData.textColor,
    profesor: {
      nombre: formData.profesorNombre || 'Sin asignar',
      email: teacherObj?.email || formData.profesorEmail || '',
      telefono: teacherObj?.telefono || discipline.profesor?.telefono || '',
      iniciales: initials,
    },
    niveles: formData.niveles,
    dias: formData.dias,
    horariosPorDia: formData.horariosPorDia,
    horario: finalHorario,
    lugar: formData.lugar.trim() || 'Campus Deportivo',
    cupoMax: Number(formData.cupoMax) || 25,
    activo: formData.activo,
    descripcion: formData.descripcion.trim(),
  };
};

export const isStudentLevelAllowed = (studentNivel, disciplineNiveles) => {
  if (!disciplineNiveles) return true;
  const discStr = String(disciplineNiveles).toLowerCase();
  const studStr = String(studentNivel).toLowerCase();

  if (discStr.includes('todos')) return true;
  if (discStr.includes('inicial') && studStr.includes('inicial')) return true;
  if (discStr.includes('primario') && studStr.includes('primario')) return true;
  if (discStr.includes('secundario') && studStr.includes('secundario')) return true;

  return false;
};

