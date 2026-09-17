import React, { useState, useEffect } from 'react';
import { formatDni, validarEdadPorNivel, isValidPhone, sanitizePhoneNumber } from '../../utils/validators';
import { CURSOS_POR_NIVEL } from '../../data/mockStudents';
import { DEFAULT_ACADEMIC_OFFER } from '../../services/adminService';

const AVAILABLE_SERVICIOS = [
  'Comedor Escolar',
  'Transporte',
  'Club Deportivo',
  'Jornada Extendida',
  'Robótica & Programación',
  'Inglés Cambridge',
];

const EditStudentModal = ({
  isOpen,
  student,
  tutors = [],
  academicOffer = DEFAULT_ACADEMIC_OFFER,
  onClose,
  onSaveStudent,
}) => {
  // Navigation Tabs
  const [activeTab, setActiveTab] = useState('student'); // 'student' | 'tutor'

  // Student State
  const [studentNombre, setStudentNombre] = useState('');
  const [studentDni, setStudentDni] = useState('');
  const [studentFechaNacimiento, setStudentFechaNacimiento] = useState('');
  const [studentDomicilio, setStudentDomicilio] = useState('');
  const [studentNivel, setStudentNivel] = useState('Primario');
  const [studentCurso, setStudentCurso] = useState('sin asignar');
  const [studentDivision, setStudentDivision] = useState('sin asignar');
  const [studentEstado, setStudentEstado] = useState('Activo - Regular');
  const [studentServicios, setStudentServicios] = useState([]);

  // Tutor Mode ('current' | 'reassign')
  const [tutorMode, setTutorMode] = useState('current');
  const [currentTutorId, setCurrentTutorId] = useState(null);
  const [tutorNombre, setTutorNombre] = useState('');
  const [tutorDni, setTutorDni] = useState('');
  const [tutorTelefono, setTutorTelefono] = useState('');
  const [tutorEmail, setTutorEmail] = useState('');
  const [tutorDomicilio, setTutorDomicilio] = useState('');

  // Reassignment State
  const [reassignedTutorId, setReassignedTutorId] = useState(null);
  const [tutorSearchFilter, setTutorSearchFilter] = useState('');

  // UI State
  const [formError, setFormError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Available Tutors (Sorted A-Z)
  const availableTutors = (tutors || [])
    .filter((t) => !t.role || String(t.role).trim().toLowerCase() === 'padre')
    .sort((a, b) => (a.nombre || '').localeCompare(b.nombre || '', 'es', { sensitivity: 'base' }));

  // Populate form on student prop change
  useEffect(() => {
    if (!isOpen || !student) {
      setFormError('');
      setIsSubmitting(false);
      return;
    }

    setActiveTab('student');
    setTutorMode('current');
    setReassignedTutorId(null);
    setTutorSearchFilter('');
    setFormError('');

    // Pre-populate student data
    setStudentNombre(student.nombre || '');
    setStudentDni(formatDni(student.dni || ''));
    setStudentFechaNacimiento(student.fechaNacimiento || '');
    setStudentDomicilio(student.domicilio || '');
    setStudentNivel(student.nivel || 'Primario');
    setStudentCurso(student.curso || 'sin asignar');
    setStudentDivision(student.division || 'sin asignar');
    setStudentEstado(student.estado || 'Activo - Regular');
    setStudentServicios(Array.isArray(student.servicios) ? [...student.servicios] : ['Comedor Escolar']);

    // Pre-populate tutor data
    const sortedTutors = (tutors || [])
      .filter((t) => !t.role || String(t.role).trim().toLowerCase() === 'padre')
      .sort((a, b) => (a.nombre || '').localeCompare(b.nombre || '', 'es', { sensitivity: 'base' }));

    const matchedTutor =
      sortedTutors.find((t) => t.id === student.parentId) ||
      sortedTutors.find(
        (t) =>
          t.email &&
          student.tutorEmail &&
          t.email.trim().toLowerCase() === student.tutorEmail.trim().toLowerCase()
      ) ||
      null;

    const tid = matchedTutor?.id || student.parentId || null;
    setCurrentTutorId(tid);
    setTutorNombre(matchedTutor?.nombre || (student.tutorNombre || '').replace(' (Tutor)', ''));
    setTutorDni(formatDni(matchedTutor?.dni || ''));
    setTutorTelefono(matchedTutor?.telefono || student.tutorTelefono || '');
    setTutorEmail(matchedTutor?.email || student.tutorEmail || '');
    setTutorDomicilio(matchedTutor?.domicilio || '');
  }, [isOpen, student, tutors]);

  if (!isOpen || !student) return null;

  // Cursos disponibles para el nivel seleccionado
  const availableCursos = CURSOS_POR_NIVEL[studentNivel] || [];

  // Divisiones disponibles para el curso seleccionado
  const availableDivisiones = (() => {
    if (studentCurso === 'sin asignar') return ['A'];
    const courseDivs = academicOffer?.[studentNivel]?.[studentCurso];
    if (Array.isArray(courseDivs) && courseDivs.length > 0) {
      return courseDivs.includes('A') ? courseDivs : ['A', ...courseDivs];
    }
    return ['A'];
  })();

  const handleNivelChange = (newNivel) => {
    setStudentNivel(newNivel);
    setStudentCurso('sin asignar');
    setStudentDivision('sin asignar');
  };

  const handleCursoChange = (newCurso) => {
    setStudentCurso(newCurso);
    if (newCurso === 'sin asignar') {
      setStudentDivision('sin asignar');
    } else {
      const courseDivs = academicOffer?.[studentNivel]?.[newCurso];
      const validDivs =
        Array.isArray(courseDivs) && courseDivs.length > 0
          ? courseDivs.includes('A')
            ? courseDivs
            : ['A', ...courseDivs]
          : ['A'];
      if (!validDivs.includes(studentDivision)) {
        setStudentDivision(validDivs[0] || 'A');
      }
    }
  };

  const handleToggleServicio = (servicio) => {
    setStudentServicios((prev) =>
      prev.includes(servicio) ? prev.filter((s) => s !== servicio) : [...prev, servicio]
    );
  };

  // Filtered tutors for reassignment
  const filteredTutors = availableTutors.filter((t) => {
    if (!tutorSearchFilter.trim()) return true;
    const term = tutorSearchFilter.toLowerCase().trim();
    return (
      (t.nombre && t.nombre.toLowerCase().includes(term)) ||
      (t.dni && String(t.dni).includes(term)) ||
      (t.email && t.email.toLowerCase().includes(term))
    );
  });

  const selectedReassignedTutor = availableTutors.find((t) => t.id === reassignedTutorId);

  const handleSubmit = async (e) => {
    e?.preventDefault();
    setFormError('');

    // Validar datos de alumno
    if (!studentNombre.trim() || !studentDni.trim()) {
      setFormError('El nombre y el DNI del alumno son obligatorios.');
      setActiveTab('student');
      return;
    }

    if (studentFechaNacimiento) {
      const ageCheck = validarEdadPorNivel(studentFechaNacimiento, studentNivel);
      if (!ageCheck.esValido) {
        setFormError(ageCheck.error);
        setActiveTab('student');
        return;
      }
    }

    // Validar datos de tutor
    if (tutorMode === 'reassign' && !reassignedTutorId) {
      setFormError('Selecciona un tutor registrado para reasignar al alumno.');
      setActiveTab('tutor');
      return;
    }

    if (tutorMode === 'current') {
      if (!tutorNombre.trim()) {
        setFormError('El nombre del tutor responsable es obligatorio.');
        setActiveTab('tutor');
        return;
      }
      if (tutorTelefono.trim() && !isValidPhone(tutorTelefono)) {
        setFormError('El teléfono debe contener únicamente números y tener 10 u 11 dígitos (ej: 1123456789).');
        setActiveTab('tutor');
        return;
      }
    }

    setIsSubmitting(true);
    try {
      const payload = {
        studentId: student.id,
        studentData: {
          nombre: studentNombre.trim(),
          dni: studentDni.trim(),
          fechaNacimiento: studentFechaNacimiento,
          domicilio: studentDomicilio.trim(),
          nivel: studentNivel,
          curso: studentCurso,
          division: studentDivision,
          estado: studentEstado,
          servicios: studentServicios,
        },
        tutorId: currentTutorId,
        tutorData:
          tutorMode === 'reassign' && selectedReassignedTutor
            ? {
                id: selectedReassignedTutor.id,
                nombre: selectedReassignedTutor.nombre,
                email: selectedReassignedTutor.email,
                telefono: selectedReassignedTutor.telefono || '',
                dni: selectedReassignedTutor.dni || '',
                domicilio: selectedReassignedTutor.domicilio || '',
              }
            : {
                id: currentTutorId,
                nombre: tutorNombre.trim(),
                dni: tutorDni.trim(),
                telefono: tutorTelefono.trim(),
                email: tutorEmail.trim(),
                domicilio: tutorDomicilio.trim(),
              },
        reassignedTutorId: tutorMode === 'reassign' ? reassignedTutorId : null,
      };

      await onSaveStudent(payload);
      onClose();
    } catch (err) {
      console.error('Error guardando edición de alumno:', err);
      setFormError(err.message || 'Error al guardar los cambios.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div
      data-testid="edit-student-modal-overlay"
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-150"
      onClick={(e) => {
        if (e.target === e.currentTarget && !isSubmitting) onClose();
      }}
    >
      <div
        data-testid="edit-student-modal"
        className="relative w-full max-w-3xl max-h-[90vh] bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col animate-in zoom-in-95 duration-150 text-left"
      >
        {/* Modal Header */}
        <div className="px-6 py-4 bg-slate-50/90 border-b border-slate-200 flex items-center justify-between gap-4 shrink-0">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-10 h-10 rounded-2xl bg-blue-100/80 text-blue-700 flex items-center justify-center font-extrabold shrink-0 shadow-xs">
              <span className="material-symbols-outlined text-[22px]">edit_square</span>
            </div>
            <div className="min-w-0">
              <h2 className="text-base font-extrabold text-slate-800 truncate">
                Editar Legajo del Alumno
              </h2>
              <div className="flex items-center gap-2 text-xs text-slate-500 font-medium truncate">
                <span className="font-mono font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded-md border border-blue-100">
                  {student.legajo}
                </span>
                <span>·</span>
                <span className="truncate">{student.nombre}</span>
              </div>
            </div>
          </div>

          <button
            data-testid="edit-student-close-button"
            onClick={onClose}
            disabled={isSubmitting}
            className="p-1.5 rounded-full text-slate-400 hover:text-slate-700 hover:bg-slate-200/60 transition-colors border-none bg-transparent cursor-pointer"
            type="button"
            title="Cerrar modal"
          >
            <span className="material-symbols-outlined text-[20px]">close</span>
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="px-6 pt-3 bg-white border-b border-slate-200 flex items-center gap-4 shrink-0">
          <button
            type="button"
            data-testid="tab-student-data"
            onClick={() => setActiveTab('student')}
            className={`pb-3 px-1 font-bold text-xs flex items-center gap-2 border-b-2 transition-all cursor-pointer ${
              activeTab === 'student'
                ? 'border-blue-600 text-blue-700'
                : 'border-transparent text-slate-400 hover:text-slate-700'
            }`}
          >
            <span className="material-symbols-outlined text-[17px]">school</span>
            <span>1. Datos del Alumno</span>
          </button>

          <button
            type="button"
            data-testid="tab-tutor-data"
            onClick={() => setActiveTab('tutor')}
            className={`pb-3 px-1 font-bold text-xs flex items-center gap-2 border-b-2 transition-all cursor-pointer ${
              activeTab === 'tutor'
                ? 'border-blue-600 text-blue-700'
                : 'border-transparent text-slate-400 hover:text-slate-700'
            }`}
          >
            <span className="material-symbols-outlined text-[17px]">family_restroom</span>
            <span>2. Tutor Responsable</span>
          </button>
        </div>

        {/* Form Error Notice */}
        {formError && (
          <div
            data-testid="edit-student-error"
            className="mx-6 mt-4 p-3 bg-red-50 border border-red-200 rounded-xl text-xs font-semibold text-red-700 flex items-center gap-2 shrink-0 animate-in fade-in"
          >
            <span className="material-symbols-outlined text-[18px] text-red-500">error</span>
            <span>{formError}</span>
          </div>
        )}

        {/* Scrollable Form Body */}
        <form onSubmit={handleSubmit} className="overflow-y-auto p-6 flex flex-col gap-6 flex-1">
          {/* TAB 1: DATOS DEL ALUMNO */}
          {activeTab === 'student' && (
            <div data-testid="section-student-fields" className="flex flex-col gap-5">
              {/* Información Personal */}
              <div className="p-4 bg-slate-50/70 border border-slate-200/80 rounded-2xl flex flex-col gap-3.5">
                <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-2">
                  <span className="material-symbols-outlined text-[16px] text-slate-400">person</span>
                  Información Personal
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                  <div className="sm:col-span-2">
                    <label className="text-[11px] font-bold text-slate-600 uppercase tracking-wider block mb-1">
                      Nombre Completo *
                    </label>
                    <input
                      data-testid="edit-student-name-input"
                      type="text"
                      className="w-full h-9 px-3 bg-white border border-slate-200 rounded-xl text-xs text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 font-medium"
                      placeholder="Ej: Sofía Valentina Gómez"
                      value={studentNombre}
                      onChange={(e) => setStudentNombre(e.target.value)}
                      required
                    />
                  </div>

                  <div>
                    <label className="text-[11px] font-bold text-slate-600 uppercase tracking-wider block mb-1">
                      DNI del Alumno *
                    </label>
                    <div className="relative">
                      <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-[18px]">
                        badge
                      </span>
                      <input
                        data-testid="edit-student-dni-input"
                        type="text"
                        className="w-full h-9 pl-9 pr-3 bg-white border border-slate-200 rounded-xl text-xs text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 font-mono font-semibold"
                        placeholder="Ej: 49.821.305"
                        value={studentDni}
                        onChange={(e) => setStudentDni(formatDni(e.target.value))}
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <label className="text-[11px] font-bold text-slate-600 uppercase tracking-wider block mb-1">
                      Fecha de Nacimiento
                    </label>
                    <div className="relative">
                      <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-[18px]">
                        calendar_month
                      </span>
                      <input
                        data-testid="edit-student-birthdate-input"
                        type="date"
                        className="w-full h-9 pl-9 pr-3 bg-white border border-slate-200 rounded-xl text-xs text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 cursor-pointer"
                        value={studentFechaNacimiento}
                        onChange={(e) => setStudentFechaNacimiento(e.target.value)}
                      />
                    </div>
                    {studentFechaNacimiento && (
                      (() => {
                        const check = validarEdadPorNivel(studentFechaNacimiento, studentNivel);
                        return (
                          <p
                            className={`text-[10px] font-semibold mt-1 flex items-center gap-1 ${
                              check.esValido ? 'text-emerald-600' : 'text-red-600'
                            }`}
                          >
                            <span className="material-symbols-outlined text-[13px]">
                              {check.esValido ? 'check_circle' : 'warning'}
                            </span>
                            {check.esValido
                              ? `Edad: ${check.edad} años (válida para ${studentNivel})`
                              : check.error}
                          </p>
                        );
                      })()
                    )}
                  </div>

                  <div className="sm:col-span-2">
                    <label className="text-[11px] font-bold text-slate-600 uppercase tracking-wider block mb-1">
                      Domicilio
                    </label>
                    <div className="relative">
                      <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-[18px]">
                        location_on
                      </span>
                      <input
                        data-testid="edit-student-address-input"
                        type="text"
                        className="w-full h-9 pl-9 pr-3 bg-white border border-slate-200 rounded-xl text-xs text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 font-medium"
                        placeholder="Ej: Av. Sarmiento 1240, Resistencia"
                        value={studentDomicilio}
                        onChange={(e) => setStudentDomicilio(e.target.value)}
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Asignación Académica */}
              <div className="p-4 bg-slate-50/70 border border-slate-200/80 rounded-2xl flex flex-col gap-3.5">
                <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-2">
                  <span className="material-symbols-outlined text-[16px] text-slate-400">school</span>
                  Asignación Académica
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
                  {/* Selector de Nivel */}
                  <div>
                    <label className="text-[11px] font-bold text-slate-600 uppercase tracking-wider block mb-1">
                      Nivel Educativo *
                    </label>
                    <select
                      data-testid="edit-student-level-select"
                      className="w-full h-9 px-3 bg-white border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 font-bold"
                      value={studentNivel}
                      onChange={(e) => handleNivelChange(e.target.value)}
                    >
                      <option value="Inicial">Inicial</option>
                      <option value="Primario">Primario</option>
                      <option value="Secundario">Secundario</option>
                    </select>
                  </div>

                  {/* Selector de Curso */}
                  <div>
                    <label className="text-[11px] font-bold text-slate-600 uppercase tracking-wider block mb-1">
                      Curso *
                    </label>
                    <select
                      data-testid="edit-student-course-select"
                      className="w-full h-9 px-3 bg-white border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 font-medium"
                      value={studentCurso}
                      onChange={(e) => handleCursoChange(e.target.value)}
                    >
                      <option value="sin asignar">Sin asignar</option>
                      {availableCursos.map((c) => (
                        <option key={c} value={c}>
                          {c}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Selector de División */}
                  <div>
                    <label className="text-[11px] font-bold text-slate-600 uppercase tracking-wider block mb-1">
                      División / Sala *
                    </label>
                    <select
                      data-testid="edit-student-division-select"
                      disabled={studentCurso === 'sin asignar'}
                      className={`w-full h-9 px-3 rounded-xl text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                        studentCurso === 'sin asignar'
                          ? 'bg-slate-100 text-slate-400 border border-slate-200 cursor-not-allowed'
                          : 'bg-white text-slate-800 border border-slate-200 cursor-pointer'
                      }`}
                      value={studentDivision}
                      onChange={(e) => setStudentDivision(e.target.value)}
                    >
                      {availableDivisiones.map((d) => (
                        <option key={d} value={d}>
                          {d.toLowerCase().includes('sala') || d.toLowerCase().includes('div')
                            ? d
                            : `División "${d}"`}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Estado Administrativo */}
                <div className="mt-1">
                  <label className="text-[11px] font-bold text-slate-600 uppercase tracking-wider block mb-1">
                    Estado Administrativo
                  </label>
                  <select
                    data-testid="edit-student-status-select"
                    className="w-full sm:w-1/2 h-9 px-3 bg-white border border-slate-200 rounded-xl text-xs text-slate-800 font-semibold focus:outline-none focus:ring-2 focus:ring-blue-500"
                    value={studentEstado}
                    onChange={(e) => setStudentEstado(e.target.value)}
                  >
                    <option value="Activo - Regular">Activo - Regular</option>
                    <option value="Documentación Pendiente">Documentación Pendiente</option>
                    <option value="Con Deuda Arancelaria">Con Deuda Arancelaria</option>
                    <option value="Baja Administrativa">Baja Administrativa</option>
                  </select>
                </div>
              </div>

              {/* Servicios Adicionales */}
              <div className="p-4 bg-slate-50/70 border border-slate-200/80 rounded-2xl flex flex-col gap-2.5">
                <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-2">
                  <span className="material-symbols-outlined text-[16px] text-slate-400">local_activity</span>
                  Servicios y Actividades Adicionales
                </h3>
                <div className="flex flex-wrap gap-2 pt-1">
                  {AVAILABLE_SERVICIOS.map((servicio) => {
                    const isSelected = studentServicios.includes(servicio);
                    return (
                      <button
                        key={servicio}
                        type="button"
                        onClick={() => handleToggleServicio(servicio)}
                        className={`px-3 py-1.5 rounded-full text-xs font-bold transition-all border cursor-pointer flex items-center gap-1.5 ${
                          isSelected
                            ? 'bg-lime-100 text-lime-900 border-lime-300 shadow-xs'
                            : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-100'
                        }`}
                      >
                        <span className="material-symbols-outlined text-[15px]">
                          {isSelected ? 'check_circle' : 'add_circle'}
                        </span>
                        <span>{servicio}</span>
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: TUTOR RESPONSABLE */}
          {activeTab === 'tutor' && (
            <div data-testid="section-tutor-fields" className="flex flex-col gap-5">
              {/* Selector de Modo: Editar actual vs Reasignar */}
              <div className="flex items-center gap-2 p-1.5 bg-slate-100/80 rounded-2xl border border-slate-200">
                <button
                  type="button"
                  data-testid="tutor-mode-current"
                  onClick={() => setTutorMode('current')}
                  className={`flex-1 py-2 px-3 rounded-xl text-xs font-bold transition-all border-none cursor-pointer flex items-center justify-center gap-2 ${
                    tutorMode === 'current'
                      ? 'bg-white text-blue-700 shadow-xs'
                      : 'bg-transparent text-slate-500 hover:text-slate-700'
                  }`}
                >
                  <span className="material-symbols-outlined text-[16px]">edit</span>
                  <span>Modificar Datos del Tutor Actual</span>
                </button>

                <button
                  type="button"
                  data-testid="tutor-mode-reassign"
                  onClick={() => setTutorMode('reassign')}
                  className={`flex-1 py-2 px-3 rounded-xl text-xs font-bold transition-all border-none cursor-pointer flex items-center justify-center gap-2 ${
                    tutorMode === 'reassign'
                      ? 'bg-white text-blue-700 shadow-xs'
                      : 'bg-transparent text-slate-500 hover:text-slate-700'
                  }`}
                >
                  <span className="material-symbols-outlined text-[16px]">swap_horiz</span>
                  <span>Reasignar a Otro Tutor Registrado</span>
                </button>
              </div>

              {/* MODO 1: EDITAR DATOS DEL TUTOR ACTUAL */}
              {tutorMode === 'current' && (
                <div className="p-4 bg-slate-50/70 border border-slate-200/80 rounded-2xl flex flex-col gap-3.5">
                  <div className="flex items-center justify-between gap-2">
                    <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-2">
                      <span className="material-symbols-outlined text-[16px] text-slate-400">person</span>
                      Datos de Contacto del Tutor
                    </h3>
                    <span className="text-[10px] font-bold text-slate-400 bg-slate-200/70 px-2 py-0.5 rounded-md">
                      ID: {currentTutorId || 'No asignado'}
                    </span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                    <div className="sm:col-span-2">
                      <label className="text-[11px] font-bold text-slate-600 uppercase tracking-wider block mb-1">
                        Nombre y Apellido del Tutor *
                      </label>
                      <input
                        data-testid="edit-tutor-name-input"
                        type="text"
                        className="w-full h-9 px-3 bg-white border border-slate-200 rounded-xl text-xs text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 font-medium"
                        placeholder="Ej: Marcelo Gómez"
                        value={tutorNombre}
                        onChange={(e) => setTutorNombre(e.target.value)}
                        required
                      />
                    </div>

                    <div>
                      <label className="text-[11px] font-bold text-slate-600 uppercase tracking-wider block mb-1">
                        DNI del Tutor
                      </label>
                      <input
                        data-testid="edit-tutor-dni-input"
                        type="text"
                        className="w-full h-9 px-3 bg-white border border-slate-200 rounded-xl text-xs text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono font-semibold"
                        placeholder="Ej: 28.394.021"
                        value={tutorDni}
                        onChange={(e) => setTutorDni(formatDni(e.target.value))}
                      />
                    </div>

                    <div>
                      <label className="text-[11px] font-bold text-slate-600 uppercase tracking-wider block mb-1">
                        Teléfono / WhatsApp de Contacto
                      </label>
                      <div className="relative">
                        <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-[18px]">
                          call
                        </span>
                        <input
                          data-testid="edit-tutor-phone-input"
                          type="tel"
                          maxLength={11}
                          className="w-full h-9 pl-9 pr-3 bg-white border border-slate-200 rounded-xl text-xs text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono"
                          placeholder="Ej: 1123456789 (10 u 11 dígitos)"
                          value={tutorTelefono}
                          onChange={(e) => setTutorTelefono(sanitizePhoneNumber(e.target.value))}
                        />
                      </div>
                    </div>

                    <div>
                      <label className="text-[11px] font-bold text-slate-600 uppercase tracking-wider block mb-1">
                        Correo Electrónico
                      </label>
                      <div className="relative">
                        <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-[18px]">
                          mail
                        </span>
                        <input
                          data-testid="edit-tutor-email-input"
                          type="email"
                          className="w-full h-9 pl-9 pr-3 bg-white border border-slate-200 rounded-xl text-xs text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 font-medium"
                          placeholder="Ej: tutor@gmail.com"
                          value={tutorEmail}
                          onChange={(e) => setTutorEmail(e.target.value)}
                        />
                      </div>
                    </div>

                    <div>
                      <label className="text-[11px] font-bold text-slate-600 uppercase tracking-wider block mb-1">
                        Domicilio del Tutor
                      </label>
                      <div className="relative">
                        <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-[18px]">
                          home
                        </span>
                        <input
                          data-testid="edit-tutor-address-input"
                          type="text"
                          className="w-full h-9 pl-9 pr-3 bg-white border border-slate-200 rounded-xl text-xs text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 font-medium"
                          placeholder="Ej: Av. Sarmiento 1240"
                          value={tutorDomicilio}
                          onChange={(e) => setTutorDomicilio(e.target.value)}
                        />
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* MODO 2: REASIGNAR A OTRO TUTOR REGISTRADO */}
              {tutorMode === 'reassign' && (
                <div className="p-4 bg-slate-50/70 border border-slate-200/80 rounded-2xl flex flex-col gap-3.5 text-left">
                  <div className="flex flex-col gap-1">
                    <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-2">
                      <span className="material-symbols-outlined text-[16px] text-slate-400">group</span>
                      Seleccionar Nuevo Tutor Responsable
                    </h3>
                    <p className="text-[11px] text-slate-500">
                      Transfiere el legajo del alumno a otro tutor ya registrado en la plataforma.
                    </p>
                  </div>

                  {/* Buscador de Tutores */}
                  <div className="relative">
                    <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-[18px]">
                      search
                    </span>
                    <input
                      data-testid="reassign-tutor-search-input"
                      type="text"
                      className="w-full h-9 pl-9 pr-3 bg-white border border-slate-200 rounded-md text-xs text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Filtrar tutores por nombre, DNI o email..."
                      value={tutorSearchFilter}
                      onChange={(e) => setTutorSearchFilter(e.target.value)}
                    />
                  </div>

                  {/* Dropdown / Lista A-Z de Tutores */}
                  <div
                    className="max-h-52 overflow-y-auto border border-slate-200 rounded-md bg-white divide-y divide-slate-100 text-left overflow-hidden shadow-xs no-scrollbar"
                    style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
                  >
                    {filteredTutors.length === 0 ? (
                      <div className="p-4 text-center text-xs text-slate-400">
                        No se encontraron tutores coincidentes.
                      </div>
                    ) : (
                      filteredTutors.map((t) => {
                        const isSelected = reassignedTutorId === t.id;
                        return (
                          <div
                            key={t.id}
                            data-testid={`tutor-option-${t.id}`}
                            onClick={() => setReassignedTutorId(t.id)}
                            className={`px-3.5 py-3 flex items-center gap-3 text-xs transition-colors cursor-pointer ${
                              isSelected
                                ? 'bg-blue-50/90 text-blue-900'
                                : 'hover:bg-slate-50/80 text-slate-700'
                            }`}
                          >
                            {/* Radio Indicator */}
                            <div className="shrink-0">
                              <span
                                className={`w-[18px] h-[18px] rounded-md flex items-center justify-center border-2 text-[11px] transition-colors ${
                                  isSelected
                                    ? 'bg-blue-600 text-white border-blue-600'
                                    : 'border-slate-300 text-transparent bg-white'
                                }`}
                              >
                                ✓
                              </span>
                            </div>

                            {/* Tutor Info */}
                            <div className="flex flex-col min-w-0 flex-1">
                              <span className={`truncate ${isSelected ? 'text-blue-900 font-bold' : 'text-slate-800 font-semibold'}`}>
                                {t.nombre}
                              </span>
                              <span className={`text-[11px] font-normal truncate ${isSelected ? 'text-blue-700/80' : 'text-slate-400'}`}>
                                DNI: {t.dni || 'S/D'} · {t.email || 'Sin email'} · Tel: {t.telefono || 'S/T'}
                              </span>
                            </div>
                          </div>
                        );
                      })
                    )}
                  </div>

                  {/* Confirmación del tutor seleccionado */}
                  {selectedReassignedTutor && (
                    <div
                      data-testid="selected-reassigned-tutor-card"
                      className="p-3 bg-emerald-50 border border-emerald-200/80 rounded-md flex items-center gap-3 text-xs text-emerald-900"
                    >
                      <span className="material-symbols-outlined text-[20px] text-emerald-600 shrink-0">
                        check_circle
                      </span>
                      <div className="flex flex-col min-w-0">
                        <span className="font-bold truncate">
                          Tutor asignado: {selectedReassignedTutor.nombre}
                        </span>
                        <span className="text-[11px] text-emerald-700 truncate">
                          Email: {selectedReassignedTutor.email} · Tel: {selectedReassignedTutor.telefono || 'No registrado'}
                        </span>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {/* Modal Footer Controls */}
          <div className="pt-4 border-t border-slate-200 flex items-center justify-between gap-3 shrink-0">
            <button
              type="button"
              data-testid="edit-student-cancel-button"
              onClick={onClose}
              disabled={isSubmitting}
              className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl transition-colors cursor-pointer border-none"
            >
              Cancelar
            </button>

            <div className="flex items-center gap-2">
              {activeTab === 'student' ? (
                <button
                  type="button"
                  data-testid="edit-student-next-button"
                  onClick={() => setActiveTab('tutor')}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-900 text-white font-bold text-xs rounded-xl transition-colors cursor-pointer border-none flex items-center gap-1.5"
                >
                  <span>Siguiente: Tutor</span>
                  <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
                </button>
              ) : (
                <button
                  type="button"
                  data-testid="edit-student-prev-button"
                  onClick={() => setActiveTab('student')}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl transition-colors cursor-pointer border-none flex items-center gap-1.5"
                >
                  <span className="material-symbols-outlined text-[16px]">arrow_back</span>
                  <span>Volver a Alumno</span>
                </button>
              )}

              <button
                type="submit"
                data-testid="edit-student-submit-button"
                disabled={isSubmitting}
                className="px-5 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-extrabold text-xs rounded-xl shadow-md hover:shadow-lg transition-all cursor-pointer border-none flex items-center gap-1.5 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSubmitting ? (
                  <>
                    <span className="material-symbols-outlined text-[16px] animate-spin">sync</span>
                    <span>Guardando cambios...</span>
                  </>
                ) : (
                  <>
                    <span className="material-symbols-outlined text-[16px]">save</span>
                    <span>Guardar Cambios</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditStudentModal;
