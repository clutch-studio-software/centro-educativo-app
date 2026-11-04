import { useState, useMemo } from 'react';
import {
  resolveCoursesForNivel,
  ensureCompleteGrilla,
  deriveScheduleFromGrilla,
  CATEDRA_COLORS,
  MORNING_SCHEDULE_SUGGESTIONS,
  AFTERNOON_SCHEDULE_SUGGESTIONS,
} from './teacherScheduleUtils';

const EMPTY_COURSES = [];

export const useTeacherAssignmentsForm = (
  teacher,
  courses = EMPTY_COURSES,
  readOnly = false,
  onClose,
  onSaveAssignments
) => {
  const [catedrasList, setCatedrasList] = useState(() =>
    Array.isArray(teacher?.catedras) ? [...teacher.catedras] : []
  );
  const [grilla, setGrilla] = useState(() =>
    ensureCompleteGrilla(teacher?.grillaHoraria)
  );
  const [selectedCatedraId, setSelectedCatedraId] = useState(
    () => (Array.isArray(teacher?.catedras) && teacher.catedras[0]?.id) || null
  );

  const [formState, setFormState] = useState(() => {
    const initialCourses = resolveCoursesForNivel(courses, 'Secundario');
    const firstCourse = initialCourses[0];
    const initialTurno = firstCourse?.turno || 'Turno Mañana';
    return {
      nivel: 'Secundario',
      curso: firstCourse?.cursoValue || '1° Año A',
      subjectName: teacher?.especialidad || 'Matemática Aplicada',
      hours: 4,
      scheduleText:
        initialTurno === 'Turno Tarde'
          ? AFTERNOON_SCHEDULE_SUGGESTIONS[0]
          : MORNING_SCHEDULE_SUGGESTIONS[0],
      turno: initialTurno,
    };
  });

  const availableCourses = useMemo(
    () => resolveCoursesForNivel(courses, formState.nivel),
    [courses, formState.nivel]
  );

  const handleFormChange = (field, value) => {
    setFormState((prev) => {
      if (field === 'nivel') {
        const nextCourses = resolveCoursesForNivel(courses, value);
        const nextCourse = nextCourses[0];
        const nextTurno = nextCourse?.turno || 'Turno Mañana';
        return {
          ...prev,
          nivel: value,
          curso: nextCourse?.cursoValue || '',
          turno: nextTurno,
          scheduleText:
            nextTurno === 'Turno Tarde'
              ? AFTERNOON_SCHEDULE_SUGGESTIONS[0]
              : MORNING_SCHEDULE_SUGGESTIONS[0],
        };
      }
      if (field === 'curso') {
        const matched = availableCourses.find((c) => c.cursoValue === value);
        const matchedTurno = matched?.turno || prev.turno;
        return {
          ...prev,
          curso: value,
          turno: matchedTurno,
          scheduleText:
            matchedTurno === 'Turno Tarde'
              ? AFTERNOON_SCHEDULE_SUGGESTIONS[0]
              : MORNING_SCHEDULE_SUGGESTIONS[0],
        };
      }
      return { ...prev, [field]: value };
    });
  };

  const totalHoras = useMemo(
    () => catedrasList.reduce((sum, c) => sum + (Number(c.horasSemanales) || 0), 0),
    [catedrasList]
  );

  const maxHoras = teacher?.cargaMaxHoras || 30;
  const isOverLimit = totalHoras > maxHoras;
  const porcentajeCarga = Math.min(Math.round((totalHoras / maxHoras) * 100), 100);

  const handleAddCatedra = () => {
    const cleanSubject = (formState.subjectName || '').trim() || 'Materia General';
    const selectedNivel = formState.nivel || 'Secundario';
    const newCourseName = formState.curso || availableCourses[0]?.cursoValue || '1° Año A';
    const newHours = Number(formState.hours) || 4;

    if (totalHoras + newHours > maxHoras) return;

    const assignedColor = CATEDRA_COLORS[catedrasList.length % CATEDRA_COLORS.length];
    const newCatId = `cat-${Date.now()}`;
    const newCat = {
      id: newCatId,
      nombre: cleanSubject,
      nivel: selectedNivel,
      curso: newCourseName,
      horasSemanales: newHours,
      horario: (formState.scheduleText || '').trim() || 'Horario a confirmar',
      icon: 'menu_book',
      badgeColor: assignedColor,
      turno: formState.turno || 'Turno Mañana',
    };

    setCatedrasList((prev) => [...prev, newCat]);
    setSelectedCatedraId(newCatId);
  };

  const handleToggleSlot = (hora, dia) => {
    if (readOnly) return;
    const activeCat =
      catedrasList.find((c) => c.id === selectedCatedraId) ||
      catedrasList[catedrasList.length - 1];

    setGrilla((prev) =>
      prev.map((row) => {
        if (row.hora !== hora) return row;
        const currentSlot = row[dia];
        if (currentSlot && (!activeCat || currentSlot.catedraId === activeCat.id)) {
          return { ...row, [dia]: null };
        }
        if (!activeCat) return row;
        return {
          ...row,
          [dia]: {
            catedraId: activeCat.id,
            curso: activeCat.curso,
            materia: activeCat.nombre.slice(0, 14),
            color: activeCat.badgeColor || 'blue',
          },
        };
      })
    );
  };

  const handleRemoveCatedra = (catId) => {
    if (readOnly) return;
    setCatedrasList((prev) => prev.filter((c) => c.id !== catId));
    setGrilla((prev) =>
      prev.map((row) => {
        const nextRow = { ...row };
        for (const dia of ['lun', 'mar', 'mie', 'jue', 'vie']) {
          if (nextRow[dia]?.catedraId === catId) {
            nextRow[dia] = null;
          }
        }
        return nextRow;
      })
    );
    if (selectedCatedraId === catId) {
      const remaining = catedrasList.filter((c) => c.id !== catId);
      setSelectedCatedraId(remaining[0]?.id || null);
    }
  };

  const handleConfirmSave = () => {
    if (isOverLimit) return;
    const finalizedCatedras = catedrasList.map((cat) => ({
      ...cat,
      horario: deriveScheduleFromGrilla(grilla, cat),
    }));

    onSaveAssignments?.(teacher.id, {
      catedras: finalizedCatedras,
      cargaHoras: totalHoras,
      grillaHoraria: grilla,
    });
    onClose?.();
  };

  return {
    catedrasList,
    grilla,
    selectedCatedraId,
    setSelectedCatedraId,
    formState,
    handleFormChange,
    availableCourses,
    totalHoras,
    maxHoras,
    isOverLimit,
    porcentajeCarga,
    handleAddCatedra,
    handleToggleSlot,
    handleRemoveCatedra,
    handleConfirmSave,
  };
};
