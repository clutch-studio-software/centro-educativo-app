import React, { useState, useEffect } from 'react';
import { formatDni, validarEdadPorNivel } from '../../utils/validators';
import { CURSOS_POR_NIVEL } from '../../data/mockStudents';
import { fetchAcademicOfferApi, DEFAULT_ACADEMIC_OFFER } from '../../services/adminService';

const NewStudentModal = ({ isOpen, onClose, onAddStudent, tutors = [] }) => {
  // Tutor Mode ('new' | 'existing')
  const [tutorMode, setTutorMode] = useState('new');

  // Tutor State
  const [tutorNombre, setTutorNombre] = useState('');
  const [tutorDni, setTutorDni] = useState('');
  const [tutorTelefono, setTutorTelefono] = useState('');
  const [tutorEmail, setTutorEmail] = useState('');
  const [tutorDomicilio, setTutorDomicilio] = useState('');
  const [tutorFilter, setTutorFilter] = useState('');

  // Student State
  const [studentDni, setStudentDni] = useState('');
  const [studentFechaNacimiento, setStudentFechaNacimiento] = useState('');
  const [studentNombre, setStudentNombre] = useState('');
  const [studentApellido, setStudentApellido] = useState('');
  const [sameAddressAsTutor, setSameAddressAsTutor] = useState(true);
  const [studentDomicilio, setStudentDomicilio] = useState('');
  const [studentNivel, setStudentNivel] = useState('Primario');
  const [studentCurso, setStudentCurso] = useState('sin asignar');
  const [studentDivision, setStudentDivision] = useState('sin asignar');
  const [studentEstado, setStudentEstado] = useState('Activo - Regular');

  // Academic Offer State (Cursos fijos, divisiones dinámicas desde Firebase)
  const [academicOffer, setAcademicOffer] = useState(DEFAULT_ACADEMIC_OFFER);

  // Fetch academic offer from Firebase whenever modal opens
  useEffect(() => {
    if (!isOpen) {
      setTutorFilter('');
      return;
    }
    let isMounted = true;
    fetchAcademicOfferApi().then((data) => {
      if (isMounted && data) {
        setAcademicOffer(data);
      }
    }).catch(() => { });
    return () => { isMounted = false; };
  }, [isOpen]);

  // Validation / Message State
  const [formError, setFormError] = useState('');
  const [successNotice, setSuccessNotice] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const availableTutors = (tutors || [])
    .filter((t) => !t.role || String(t.role).trim().toLowerCase() === 'padre')
    .sort((a, b) => (a.nombre || '').localeCompare(b.nombre || '', 'es', { sensitivity: 'base' }));

  const filteredTutors = availableTutors.filter((t) => {
    if (!tutorFilter.trim()) return true;
    const term = tutorFilter.toLowerCase().trim();
    return (
      (t.nombre && t.nombre.toLowerCase().includes(term)) ||
      (t.dni && String(t.dni).includes(term)) ||
      (t.email && t.email.toLowerCase().includes(term))
    );
  });

  // Available courses for the selected level (fixed levels & courses)
  const availableCursos = CURSOS_POR_NIVEL[studentNivel] || [];

  // Available divisions: query dynamically for the selected course
  // Always guarantees 'A' as the minimal non-deletable division
  const availableDivisiones = (() => {
    if (studentCurso === 'sin asignar') return ['A'];
    const courseDivs = academicOffer?.[studentNivel]?.[studentCurso];
    if (Array.isArray(courseDivs) && courseDivs.length > 0) {
      return courseDivs.includes('A') ? courseDivs : ['A', ...courseDivs];
    }
    return ['A'];
  })();

  // Handle select existing tutor
  const handleSelectExistingTutor = (selectedVal) => {
    if (!selectedVal) return;
    const found = availableTutors.find((t) => (t.id && t.id === selectedVal) || t.nombre === selectedVal);
    if (found) {
      setTutorNombre(found.nombre || '');
      setTutorDni(formatDni(found.dni || ''));
      setTutorTelefono(found.telefono || '');
      setTutorEmail(found.email || '');
      setTutorDomicilio(found.domicilio || '');
      if (sameAddressAsTutor) {
        setStudentDomicilio(found.domicilio || '');
      }
    }
  };

  const handleTutorAddressChange = (val) => {
    setTutorDomicilio(val);
    if (sameAddressAsTutor) {
      setStudentDomicilio(val);
    }
  };

  const handleSameAddressToggle = (e) => {
    const isChecked = e.target.checked;
    setSameAddressAsTutor(isChecked);
    if (isChecked) {
      setStudentDomicilio(tutorDomicilio);
    }
  };

  const handleNivelChange = (newNivel) => {
    setStudentNivel(newNivel);
    setStudentCurso('sin asignar');
    setStudentDivision('sin asignar');
  };

  const handleCursoChange = (newCurso) => {
    setStudentCurso(newCurso);
    // If selecting a course, verify if the current division is valid in the newly selected course
    if (newCurso === 'sin asignar') {
      setStudentDivision('sin asignar');
    } else {
      const courseDivs = academicOffer?.[studentNivel]?.[newCurso];
      const validDivs = Array.isArray(courseDivs) && courseDivs.length > 0
        ? (courseDivs.includes('A') ? courseDivs : ['A', ...courseDivs])
        : ['A'];
      if (!validDivs.includes(studentDivision)) {
        setStudentDivision('A');
      }
    }
  };

  const validateAndBuildStudent = () => {
    setFormError('');
    if (!tutorNombre.trim() || !tutorDni.trim() || !tutorTelefono.trim()) {
      setFormError('Por favor completa todos los campos obligatorios del Tutor.');
      return null;
    }
    if (!studentDni.trim() || !studentNombre.trim() || !studentApellido.trim()) {
      setFormError('Por favor completa los campos obligatorios del Alumno (DNI, Nombre, Apellido).');
      return null;
    }
    if (!studentFechaNacimiento) {
      setFormError('Por favor ingresa la fecha de nacimiento del alumno.');
      return null;
    }

    const resEdad = validarEdadPorNivel(studentFechaNacimiento, studentNivel);
    if (!resEdad.esValido) {
      setFormError(resEdad.error);
      return null;
    }

    const randomNum = Math.floor(1000 + Math.random() * 9000);
    const legajo = `#LEG-2027-${randomNum}`;
    const initials = `${studentNombre.trim()[0] || ''}${studentApellido.trim()[0] || ''}`.toUpperCase();
    const fullName = `${studentNombre.trim()} ${studentApellido.trim()}`;

    const badgeVariant =
      studentNivel === 'Inicial'
        ? 'lime'
        : studentNivel === 'Primario'
          ? 'sky'
          : 'indigo';

    const avatarGradient =
      studentNivel === 'Inicial'
        ? 'from-orange-400 to-amber-500'
        : studentNivel === 'Primario'
          ? 'from-blue-500 to-indigo-500'
          : 'from-emerald-400 to-lime-500';

    const cursoDisplay =
      studentCurso === 'sin asignar' && studentDivision === 'sin asignar'
        ? 'Sin asignar'
        : studentCurso !== 'sin asignar' && studentDivision !== 'sin asignar'
          ? `${studentCurso} "${studentDivision}"`
          : studentCurso !== 'sin asignar'
            ? studentCurso
            : `División ${studentDivision}`;

    return {
      id: `s-${Date.now()}`,
      legajo,
      dni: studentDni.trim(),
      nombre: fullName,
      tutorNombre: `${tutorNombre.trim()} (Tutor)`,
      tutorTelefono: tutorTelefono.trim(),
      tutorEmail: tutorEmail.trim(),
      tutorDni: tutorDni.trim(),
      domicilio: sameAddressAsTutor ? tutorDomicilio : studentDomicilio,
      fechaNacimiento: studentFechaNacimiento,
      nivel: studentNivel,
      curso: studentCurso || 'sin asignar',
      division: studentDivision || 'sin asignar',
      cursoDisplay,
      estado: studentEstado,
      servicios: ['Comedor Escolar'],
      initials: initials || 'AL',
      avatarGradient,
      badgeVariant,
    };
  };

  // Submit and Close
  const handleSubmit = async (e) => {
    e.preventDefault();
    const newStudent = validateAndBuildStudent();
    if (!newStudent) return;

    setIsSubmitting(true);
    try {
      await onAddStudent(newStudent);
      onClose();
    } catch (err) {
      setFormError(err.message || 'Error al registrar alumno en Firebase.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Save current student and keep tutor for sibling
  const handleAddSibling = async () => {
    const newStudent = validateAndBuildStudent();
    if (!newStudent) return;

    setIsSubmitting(true);
    try {
      await onAddStudent(newStudent);
      // Reset student fields only, preserve tutor fields
      setStudentDni('');
      setStudentFechaNacimiento('');
      setStudentNombre('');
      setStudentApellido('');
      setStudentCurso('sin asignar');
      setStudentDivision('sin asignar');
      setSuccessNotice(`¡Alumno ${newStudent.nombre} guardado en Firebase! Puedes ingresar los datos del hermano.`);
      setTimeout(() => setSuccessNotice(''), 5000);
    } catch (err) {
      setFormError(err.message || 'Error al registrar alumno en Firebase.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div
      id="modal-nuevo-alumno"
      data-testid="new-student-modal-backdrop"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 overflow-y-auto bg-slate-900/50 backdrop-blur-sm animate-in fade-in duration-200"
    >
      <div
        data-testid="new-student-modal-container"
        className="relative w-full max-w-3xl bg-white rounded-3xl shadow-2xl border border-slate-100 flex flex-col max-h-[92vh] overflow-hidden my-auto"
      >
        {/* Header del Modal */}
        <div
          data-testid="new-student-modal-header"
          className="px-6 py-5 bg-white border-b border-slate-100 flex items-start justify-between shrink-0"
        >
          <div className="flex items-center gap-3.5">
            <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-600 text-white flex items-center justify-center shadow-md shadow-blue-500/25 shrink-0">
              <span className="material-symbols-outlined text-[24px]">person_add</span>
            </div>
            <div>
              <h2
                data-testid="new-student-modal-title"
                className="text-lg sm:text-xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2"
              >
                Registrar Nuevo Alumno{' '}
                <span className="px-2.5 py-0.5 bg-emerald-50 text-emerald-700 border border-emerald-200/70 rounded-full text-[11px] font-bold">
                  Ciclo 2027
                </span>
              </h2>
              <p className="text-xs text-slate-500 font-medium mt-0.5">
                Asignación de legajo, vinculación de tutor responsable y datos académicos del ingresante.
              </p>
            </div>
          </div>
          <button
            data-testid="new-student-modal-close-button"
            onClick={onClose}
            className="w-8 h-8 rounded-full flex items-center justify-center text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors shrink-0 cursor-pointer border-none bg-transparent"
            title="Cerrar"
            type="button"
          >
            <span className="material-symbols-outlined text-[20px]">close</span>
          </button>
        </div>

        {/* Cuerpo del Modal (Scrollable) */}
        <div data-testid="new-student-modal-body" className="p-6 overflow-y-auto flex flex-col gap-6">
          {formError && (
            <div
              data-testid="new-student-form-error"
              className="p-3 bg-red-50 border border-red-200 text-red-700 text-xs rounded-xl font-semibold flex items-center gap-2"
            >
              <span className="material-symbols-outlined text-[18px]">error</span>
              <span>{formError}</span>
            </div>
          )}

          {successNotice && (
            <div
              data-testid="new-student-form-success"
              className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs rounded-xl font-semibold flex items-center gap-2"
            >
              <span className="material-symbols-outlined text-[18px]">check_circle</span>
              <span>{successNotice}</span>
            </div>
          )}

          {/* SECCIÓN 1: DATOS DEL TUTOR / RESPONSABLE LEGAL */}
          <div
            data-testid="section-tutor-data"
            className="flex flex-col gap-3.5 p-5 bg-slate-50/70 border border-slate-200/70 rounded-2xl"
          >
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <span className="w-6 h-6 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center text-xs font-extrabold">
                  1
                </span>
                <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wide">
                  Tutor / Responsable Legal
                </h3>
              </div>
              <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-emerald-100/70 text-emerald-800 border border-emerald-200/60 rounded-full text-[10px] font-bold">
                <span className="material-symbols-outlined text-[13px] text-emerald-600">check_circle</span>{' '}
                Permite asociar más de un hijo/alumno
              </span>
            </div>
            <p className="text-[11px] text-slate-500">
              Primero ingrese o verifique los datos del responsable legal. Puede vincular varios hermanos o alumnos al mismo tutor.
            </p>

            {/* Selector Toggle Tutor Existente / Nuevo Tutor */}
            <div className="grid grid-cols-2 p-1 bg-slate-200/60 rounded-xl gap-1 max-w-sm">
              <button
                data-testid="tutor-mode-existing-button"
                onClick={() => setTutorMode('existing')}
                className={`py-1.5 px-3 rounded-lg text-xs font-bold transition-all text-center cursor-pointer border-none ${tutorMode === 'existing'
                    ? 'bg-white text-blue-700 shadow-sm font-extrabold'
                    : 'text-slate-600 hover:text-slate-900 bg-transparent'
                  }`}
                type="button"
              >
                Buscar Existente
              </button>
              <button
                data-testid="tutor-mode-new-button"
                onClick={() => setTutorMode('new')}
                className={`py-1.5 px-3 rounded-lg text-xs font-bold transition-all text-center cursor-pointer border-none ${tutorMode === 'new'
                    ? 'bg-white text-blue-700 shadow-sm font-extrabold'
                    : 'text-slate-600 hover:text-slate-900 bg-transparent'
                  }`}
                type="button"
              >
                + Nuevo Tutor
              </button>
            </div>

            {/* Si es Tutor Existente, dropdown de selección rápida */}
            {tutorMode === 'existing' && (
              <div data-testid="existing-tutor-selector" className="pt-1 flex flex-col gap-2">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1.5">
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">
                    Seleccionar Tutor Registrado (Orden Alfabético A-Z)
                  </label>
                  <span className="text-[10px] text-slate-500 font-medium">
                    {filteredTutors.length} {filteredTutors.length === 1 ? 'tutor' : 'tutores'} {tutorFilter ? 'coincidentes' : 'registrados'}
                  </span>
                </div>

                {/* Buscador interactivo para filtrar la lista */}
                <div className="relative">
                  <span className="material-symbols-outlined absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400 text-[16px]">
                    search
                  </span>
                  <input
                    type="text"
                    data-testid="existing-tutor-search-input"
                    value={tutorFilter}
                    onChange={(e) => setTutorFilter(e.target.value)}
                    placeholder="Filtrar por nombre, apellido, DNI o email..."
                    className="w-full h-8 pl-8 pr-7 bg-white border border-slate-200 rounded-lg text-xs text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-400"
                  />
                  {tutorFilter && (
                    <button
                      type="button"
                      onClick={() => setTutorFilter('')}
                      className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-0.5 border-none bg-transparent cursor-pointer flex items-center justify-center"
                      title="Limpiar búsqueda"
                    >
                      <span className="material-symbols-outlined text-[14px]">close</span>
                    </button>
                  )}
                </div>

                <select
                  data-testid="existing-tutor-select"
                  onChange={(e) => handleSelectExistingTutor(e.target.value)}
                  className="w-full h-9 px-3 bg-white border border-slate-200 rounded-xl text-xs text-slate-800 font-semibold focus:outline-none focus:ring-2 focus:ring-lime-400 cursor-pointer"
                >
                  <option value="">-- Selecciona un tutor registrado (A-Z) --</option>
                  {filteredTutors.map((tutor) => (
                    <option key={tutor.id || tutor.dni} value={tutor.id || tutor.nombre}>
                      {tutor.nombre} (DNI: {formatDni(tutor.dni || '')}{tutor.email ? ` · ${tutor.email}` : ''})
                    </option>
                  ))}
                </select>
              </div>
            )}

            {/* Campos del Tutor */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 pt-1">
              <div>
                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-1">
                  Nombre y Apellido del Tutor *
                </label>
                <div className="relative">
                  <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-[18px]">
                    person
                  </span>
                  <input
                    data-testid="tutor-name-input"
                    className="w-full h-9 pl-9 pr-3 bg-white border border-slate-200 rounded-xl text-xs text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-lime-400"
                    placeholder="Ej: Marcelo Gómez"
                    type="text"
                    value={tutorNombre}
                    onChange={(e) => setTutorNombre(e.target.value)}
                  />
                </div>
              </div>

              <div>
                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-1">
                  DNI del Tutor *
                </label>
                <div className="relative">
                  <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-[18px]">
                    badge
                  </span>
                  <input
                    data-testid="tutor-dni-input"
                    className="w-full h-9 pl-9 pr-3 bg-white border border-slate-200 rounded-xl text-xs text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-lime-400 font-mono"
                    placeholder="Ej: 28.451.902"
                    type="text"
                    value={tutorDni}
                    onChange={(e) => setTutorDni(formatDni(e.target.value))}
                  />
                </div>
              </div>

              <div>
                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-1">
                  Teléfono de Contacto *
                </label>
                <div className="relative">
                  <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-[18px]">
                    call
                  </span>
                  <input
                    data-testid="tutor-phone-input"
                    className="w-full h-9 pl-9 pr-3 bg-white border border-slate-200 rounded-xl text-xs text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-lime-400 font-mono"
                    placeholder="Ej: 11-4920-1928"
                    type="tel"
                    value={tutorTelefono}
                    onChange={(e) => setTutorTelefono(e.target.value)}
                  />
                </div>
              </div>

              <div>
                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-1">
                  Correo Electrónico
                </label>
                <div className="relative">
                  <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-[18px]">
                    mail
                  </span>
                  <input
                    data-testid="tutor-email-input"
                    className="w-full h-9 pl-9 pr-3 bg-white border border-slate-200 rounded-xl text-xs text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-lime-400"
                    placeholder="tutor@correo.com"
                    type="email"
                    value={tutorEmail}
                    onChange={(e) => setTutorEmail(e.target.value)}
                  />
                </div>
              </div>

              <div className="sm:col-span-2">
                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-1">
                  Domicilio Familiar / Tutor *
                </label>
                <div className="relative">
                  <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-[18px]">
                    home
                  </span>
                  <input
                    data-testid="tutor-address-input"
                    className="w-full h-9 pl-9 pr-3 bg-white border border-slate-200 rounded-xl text-xs text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-lime-400"
                    placeholder="Calle, Número, Piso, Localidad"
                    type="text"
                    value={tutorDomicilio}
                    onChange={(e) => handleTutorAddressChange(e.target.value)}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* SECCIÓN 2: DATOS DEL ALUMNO */}
          <div
            data-testid="section-student-data"
            className="flex flex-col gap-3.5 p-5 bg-white border border-slate-200/80 rounded-2xl shadow-xs"
          >
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <span className="w-6 h-6 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center text-xs font-extrabold">
                  2
                </span>
                <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wide">
                  Datos del Alumno
                </h3>
              </div>
            </div>

            {/* Inputs del Alumno */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              <div>
                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-1">
                  DNI del Alumno *
                </label>
                <div className="relative">
                  <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-[18px]">
                    badge
                  </span>
                  <input
                    data-testid="student-dni-input"
                    className="w-full h-9 pl-9 pr-3 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-lime-400 focus:bg-white font-mono"
                    placeholder="Ej: 49.821.305"
                    type="text"
                    value={studentDni}
                    onChange={(e) => setStudentDni(formatDni(e.target.value))}
                  />
                </div>
              </div>

              <div>
                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-1">
                  Fecha de Nacimiento *
                </label>
                <div className="relative">
                  <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-[18px]">
                    calendar_month
                  </span>
                  <input
                    data-testid="student-birthdate-input"
                    className="w-full h-9 pl-9 pr-3 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-lime-400 focus:bg-white cursor-pointer"
                    type="date"
                    value={studentFechaNacimiento}
                    onChange={(e) => setStudentFechaNacimiento(e.target.value)}
                  />
                </div>
                {studentFechaNacimiento && (
                  (() => {
                    const check = validarEdadPorNivel(studentFechaNacimiento, studentNivel);
                    return (
                      <p
                        data-testid="student-birthdate-feedback"
                        className={`text-[10px] font-semibold mt-1 flex items-center gap-1 ${check.esValido ? 'text-emerald-600' : 'text-red-600'
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

              <div>
                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-1">
                  Nombre *
                </label>
                <input
                  data-testid="student-firstname-input"
                  className="w-full h-9 px-3 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-lime-400 focus:bg-white"
                  placeholder="Ej: Lucas Valentín"
                  type="text"
                  value={studentNombre}
                  onChange={(e) => setStudentNombre(e.target.value)}
                />
              </div>

              <div>
                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-1">
                  Apellido *
                </label>
                <input
                  data-testid="student-lastname-input"
                  className="w-full h-9 px-3 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-lime-400 focus:bg-white"
                  placeholder="Ej: Gómez"
                  type="text"
                  value={studentApellido}
                  onChange={(e) => setStudentApellido(e.target.value)}
                />
              </div>

              {/* Domicilio del alumno */}
              <div className="sm:col-span-2 flex flex-col gap-1.5">
                <div>
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-1">
                    Domicilio del Alumno
                  </label>
                  <div className="relative">
                    <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-[18px]">
                      location_on
                    </span>
                    <input
                      data-testid="student-address-input"
                      disabled={sameAddressAsTutor}
                      className={`w-full h-9 pl-9 pr-3 border border-slate-200 rounded-xl text-xs text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-lime-400 ${sameAddressAsTutor
                          ? 'bg-slate-100/70 text-slate-500 cursor-not-allowed'
                          : 'bg-slate-50 focus:bg-white'
                        }`}
                      placeholder="Calle y número"
                      type="text"
                      value={sameAddressAsTutor ? tutorDomicilio : studentDomicilio}
                      onChange={(e) => setStudentDomicilio(e.target.value)}
                    />
                  </div>
                </div>

                <label className="flex items-center gap-2 cursor-pointer mt-0.5">
                  <input
                    data-testid="student-same-address-checkbox"
                    checked={sameAddressAsTutor}
                    onChange={handleSameAddressToggle}
                    className="w-4 h-4 rounded text-blue-600 focus:ring-lime-400 border-slate-300 cursor-pointer"
                    type="checkbox"
                  />
                  <span className="text-xs text-slate-600 font-medium select-none">
                    Mismo domicilio que el tutor responsable
                  </span>
                </label>
              </div>

              {/* Nivel Educativo, Curso y División */}
              <div className="sm:col-span-2 grid grid-cols-1 sm:grid-cols-3 gap-3.5 pt-1">
                <div>
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-1">
                    Nivel Educativo *
                  </label>
                  <select
                    data-testid="student-level-select"
                    value={studentNivel}
                    onChange={(e) => handleNivelChange(e.target.value)}
                    className="w-full h-9 px-3 bg-slate-50 text-slate-800 font-semibold text-xs rounded-xl border border-slate-200 outline-none focus:ring-2 focus:ring-lime-400 focus:bg-white cursor-pointer"
                  >
                    <option value="Inicial">Nivel Inicial</option>
                    <option value="Primario">Nivel Primario</option>
                    <option value="Secundario">Nivel Secundario</option>
                  </select>
                </div>

                <div>
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-1">
                    Curso
                  </label>
                  <select
                    data-testid="student-course-select"
                    value={studentCurso}
                    onChange={(e) => handleCursoChange(e.target.value)}
                    className="w-full h-9 px-3 bg-slate-50 text-slate-800 font-semibold text-xs rounded-xl border border-slate-200 outline-none focus:ring-2 focus:ring-lime-400 focus:bg-white cursor-pointer"
                  >
                    <option value="sin asignar">Sin asignar</option>
                    {availableCursos.map((cursoName) => (
                      <option key={cursoName} value={cursoName}>
                        {cursoName}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-1">
                    División
                  </label>
                  <select
                    data-testid="student-division-select"
                    value={studentDivision}
                    onChange={(e) => setStudentDivision(e.target.value)}
                    disabled={studentCurso === 'sin asignar'}
                    className={`w-full h-9 px-3 text-slate-800 font-semibold text-xs rounded-xl border border-slate-200 outline-none focus:ring-2 focus:ring-lime-400 ${studentCurso === 'sin asignar'
                        ? 'bg-slate-100 text-slate-400 cursor-not-allowed'
                        : 'bg-slate-50 focus:bg-white cursor-pointer'
                      }`}
                  >
                    <option value="sin asignar">Sin asignar</option>
                    {availableDivisiones.map((div) => (
                      <option key={div} value={div}>
                        División {div}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Estado Inicial del Alumno */}
              <div className="sm:col-span-2">
                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-1.5">
                  Estado de Matrícula *
                </label>
                <div className="flex flex-wrap items-center gap-3">
                  <label
                    data-testid="student-status-label-regular"
                    className={`flex items-center gap-1.5 cursor-pointer text-xs font-semibold px-3 py-1.5 rounded-full border transition-all ${studentEstado === 'Activo - Regular'
                        ? 'text-emerald-700 bg-emerald-50 border-emerald-200 shadow-xs'
                        : 'text-slate-600 bg-slate-50 border-slate-200 hover:bg-slate-100'
                      }`}
                  >
                    <input
                      data-testid="student-status-radio-regular"
                      type="radio"
                      name="estado-modal"
                      checked={studentEstado === 'Activo - Regular'}
                      onChange={() => setStudentEstado('Activo - Regular')}
                      className="text-emerald-600 focus:ring-emerald-400"
                    />
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                    Activo Regular
                  </label>

                  <label
                    data-testid="student-status-label-condicional"
                    className={`flex items-center gap-1.5 cursor-pointer text-xs font-medium px-3 py-1.5 rounded-full border transition-all ${studentEstado === 'Documentación Pendiente'
                        ? 'text-blue-700 bg-blue-50 border-blue-200 font-semibold shadow-xs'
                        : 'text-slate-600 bg-slate-50 border-slate-200 hover:bg-slate-100'
                      }`}
                  >
                    <input
                      data-testid="student-status-radio-condicional"
                      type="radio"
                      name="estado-modal"
                      checked={studentEstado === 'Documentación Pendiente'}
                      onChange={() => setStudentEstado('Documentación Pendiente')}
                      className="text-blue-600"
                    />
                    Condicional
                  </label>

                  <label
                    data-testid="student-status-label-pase"
                    className={`flex items-center gap-1.5 cursor-pointer text-xs font-medium px-3 py-1.5 rounded-full border transition-all ${studentEstado === 'Baja Administrativa'
                        ? 'text-purple-700 bg-purple-50 border-purple-200 font-semibold shadow-xs'
                        : 'text-slate-600 bg-slate-50 border-slate-200 hover:bg-slate-100'
                      }`}
                  >
                    <input
                      data-testid="student-status-radio-pase"
                      type="radio"
                      name="estado-modal"
                      checked={studentEstado === 'Baja Administrativa'}
                      onChange={() => setStudentEstado('Baja Administrativa')}
                      className="text-purple-600"
                    />
                    Pase Pendiente
                  </label>
                </div>
              </div>
            </div>

            {/* Vincular Hermanos / Múltiples Alumnos */}
            <div
              data-testid="sibling-linking-card"
              className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 p-3.5 bg-lime-50/40 border border-lime-200/80 rounded-2xl mt-2"
            >
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-full bg-lime-100 text-lime-800 flex items-center justify-center shrink-0">
                  <span className="material-symbols-outlined text-[18px]">diversity_1</span>
                </div>
                <div>
                  <p className="text-xs font-bold text-slate-800">¿Desea inscribir a un hermano?</p>
                  <p className="text-[11px] text-slate-500">
                    Guarda este alumno y continúa automáticamente con los mismos datos del tutor.
                  </p>
                </div>
              </div>

              <button
                data-testid="add-sibling-button"
                onClick={handleAddSibling}
                type="button"
                className="flex items-center gap-1.5 px-3 py-1.5 bg-white hover:bg-lime-50 text-slate-800 hover:text-emerald-700 border border-slate-200 rounded-full text-xs font-bold transition-all shadow-xs cursor-pointer shrink-0"
              >
                <span className="material-symbols-outlined text-[16px] text-emerald-600">
                  add_circle
                </span>
                <span>＋ Vincular otro alumno a este mismo tutor</span>
              </button>
            </div>
          </div>
        </div>

        {/* Footer del Modal con Acciones */}
        <div
          data-testid="new-student-modal-footer"
          className="px-6 py-4 bg-slate-50/80 border-t border-slate-100 flex items-center justify-between shrink-0"
        >
          <button
            data-testid="modal-cancel-button"
            onClick={onClose}
            className="px-4 py-2 text-slate-600 hover:text-slate-900 hover:bg-slate-200/60 rounded-full text-xs font-bold transition-colors cursor-pointer border-none bg-transparent"
            type="button"
          >
            Cancelar
          </button>

          <div className="flex items-center gap-2.5">
            <button
              data-testid="modal-submit-button"
              onClick={handleSubmit}
              disabled={isSubmitting}
              className={`flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white rounded-full shadow-md shadow-blue-500/25 text-xs font-bold transition-all transform hover:-translate-y-0.5 border-none ${isSubmitting ? 'opacity-70 cursor-not-allowed' : 'cursor-pointer'
                }`}
              type="button"
            >
              <span className={`material-symbols-outlined text-[18px] ${isSubmitting ? 'animate-spin' : ''}`}>
                {isSubmitting ? 'sync' : 'check'}
              </span>
              <span>{isSubmitting ? 'Creando alumno...' : 'Guardar y Matricular Alumno'}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NewStudentModal;
