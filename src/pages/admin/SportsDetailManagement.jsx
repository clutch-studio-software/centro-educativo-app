import React, { useState, useMemo, useCallback } from 'react';
import { Link } from 'react-router-dom';
import AdminLayout from '../../components/admin/AdminLayout';
import AdminToast from '../../components/admin/AdminToast';
import StudentDetailsModal from '../../components/admin/StudentDetailsModal';
import EnrollStudentModal from '../../components/admin/sports/EnrollStudentModal';
import ReassignTeacherModal from '../../components/admin/sports/ReassignTeacherModal';
import TransferWithdrawModal from '../../components/admin/sports/TransferWithdrawModal';
import EditSportsConfigModal from '../../components/admin/sports/EditSportsConfigModal';
import {
  INITIAL_SPORT_DETAIL,
  INITIAL_STUDENTS_ROSTER,
  exportSportRosterCsv,
} from '../../data/mockSportsDetailData';

const PAGE_SIZE = 6;

const SportsDetailManagement = () => {
  // Discipline Operational State
  const [discipline, setDiscipline] = useState(INITIAL_SPORT_DETAIL);
  const [students, setStudents] = useState(INITIAL_STUDENTS_ROSTER);

  // Filters State
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedNivel, setSelectedNivel] = useState('Todos');
  const [selectedCurso, setSelectedCurso] = useState('Todos los Cursos');
  const [selectedEstadoCuota, setSelectedEstadoCuota] = useState('Estado de Cuota: Todos');

  // Pagination State
  const [currentPage, setCurrentPage] = useState(1);

  // Modals State
  const [isEnrollModalOpen, setIsEnrollModalOpen] = useState(false);
  const [isEditConfigModalOpen, setIsEditConfigModalOpen] = useState(false);
  const [isReassignTeacherModalOpen, setIsReassignTeacherModalOpen] = useState(false);
  const [transferStudent, setTransferStudent] = useState(null);
  const [viewingStudent, setViewingStudent] = useState(null);

  // Toast Notification State
  const [notification, setNotification] = useState(null);

  const showToast = useCallback((message, type = 'info') => {
    setNotification({ message, type });
    setTimeout(() => {
      setNotification(null);
    }, 4000);
  }, []);

  // Filter Logic
  const filteredStudents = useMemo(() => {
    return students.filter((student) => {
      // Search term (name, DNI, legajo)
      if (searchTerm) {
        const query = searchTerm.toLowerCase().trim();
        const matchesName = (student.nombre || '').toLowerCase().includes(query);
        const matchesDni = (student.dni || '').replace(/\D/g, '').includes(query.replace(/\D/g, ''));
        const matchesLegajo = (student.legajo || '').toLowerCase().includes(query);
        if (!matchesName && !matchesDni && !matchesLegajo) {
          return false;
        }
      }

      // Nivel filter
      if (selectedNivel !== 'Todos') {
        if ((student.nivel || '').toLowerCase() !== selectedNivel.toLowerCase()) {
          return false;
        }
      }

      // Curso filter
      if (selectedCurso !== 'Todos los Cursos') {
        if (!student.cursoCompleto.includes(selectedCurso) && student.curso !== selectedCurso) {
          return false;
        }
      }

      // Cuota / Arancel filter
      if (selectedEstadoCuota !== 'Estado de Cuota: Todos') {
        if (student.estadoCuota !== selectedEstadoCuota) {
          return false;
        }
      }

      return true;
    });
  }, [students, searchTerm, selectedNivel, selectedCurso, selectedEstadoCuota]);

  // Pagination Calculations
  const totalItems = filteredStudents.length;
  const totalPages = Math.max(1, Math.ceil(totalItems / PAGE_SIZE));
  const validCurrentPage = Math.min(currentPage, totalPages);
  const startIndex = (validCurrentPage - 1) * PAGE_SIZE;
  const currentStudents = filteredStudents.slice(startIndex, startIndex + PAGE_SIZE);

  // Capacity calculations
  const occupancyCount = students.length;
  const maxCapacity = discipline.cupoMax || 40;
  const occupancyPercentage = Math.min(100, Math.round((occupancyCount / maxCapacity) * 100));
  const vacantesDisponibles = Math.max(0, maxCapacity - occupancyCount);
  const isAlmostFull = vacantesDisponibles <= 5 && vacantesDisponibles > 0;
  const isFull = vacantesDisponibles === 0;

  // Handlers
  const handleToggleOffer = () => {
    const nextStatus = !discipline.activo;
    setDiscipline((prev) => ({
      ...prev,
      activo: nextStatus,
      ofertaAbierta: nextStatus,
    }));
    showToast(
      `Oferta de ${discipline.nombre} ${nextStatus ? 'abierta y disponible para inscripciones.' : 'pausada.'}`,
      nextStatus ? 'success' : 'info'
    );
  };

  const handleExportPayroll = () => {
    exportSportRosterCsv(filteredStudents, discipline.nombre);
    showToast(`Padrón descargado con éxito (${filteredStudents.length} alumnos exportados).`, 'success');
  };

  const handleEnrollStudent = (newStudent) => {
    setStudents((prev) => [newStudent, ...prev]);
    showToast(`¡Alumno ${newStudent.nombre} inscripto exitosamente!`, 'success');
  };

  const handleSaveConfig = (updatedConfig) => {
    setDiscipline(updatedConfig);
    showToast('Configuración operativa actualizada correctamente.', 'success');
  };

  const handleReassignTeacher = (newTeacher) => {
    setDiscipline((prev) => ({
      ...prev,
      profesor: {
        ...prev.profesor,
        ...newTeacher,
      },
    }));
    showToast(`Profesor titular reasignado a ${newTeacher.nombre}.`, 'success');
  };

  const handleTransferOrWithdraw = ({ studentId, studentName, actionType, targetDiscipline }) => {
    setStudents((prev) => prev.filter((s) => s.id !== studentId));
    if (actionType === 'transfer') {
      showToast(`Alumno ${studentName} transferido a ${targetDiscipline}.`, 'success');
    } else {
      showToast(`Se registró la baja de ${studentName}. Vacante liberada.`, 'info');
    }
  };

  const handleViewLegajo = (student) => {
    // Adapt student object to the expected format of StudentDetailsModal
    const adapted = {
      id: student.id,
      nombre: student.nombre,
      legajo: student.legajo,
      dni: student.dni,
      estado: 'Activo - Regular',
      nivel: student.nivel,
      curso: student.curso,
      division: student.division || 'A',
      fechaNacimiento: '2014-05-18',
      edad: 11,
      tutorNombre: student.tutor,
      tutorTelefono: student.tutorTelefono,
      tutorEmail: `${student.tutor.toLowerCase().replace(/\s+/g, '.')}@gmail.com`,
      tutorDni: '34.901.882',
      contactoEmergenciaNombre: student.tutor,
      contactoEmergenciaTelefono: student.tutorTelefono,
      obraSocial: 'OSDE 210',
      grupoSanguineo: '0 Positivo (0+)',
      alergias: 'Ninguna alergia registrada',
      observaciones: 'Ficha médica escolar al día. Apto físico deportivo vigente para atletismo.',
      initials: student.iniciales,
    };
    setViewingStudent(adapted);
  };

  const handleResetFilters = () => {
    setSearchTerm('');
    setSelectedNivel('Todos');
    setSelectedCurso('Todos los Cursos');
    setSelectedEstadoCuota('Estado de Cuota: Todos');
    setCurrentPage(1);
    showToast('Filtros restablecidos.', 'info');
  };

  return (
    <AdminLayout
      activeItem="servicios"
      breadcrumbs={['Deportes y Extracurriculares', 'Atletismo - Detalle Operativo']}
    >
      <div className="max-w-[1440px] mx-auto animate-in fade-in duration-200">
        {/* Floating Toast Notification */}
        <AdminToast notification={notification} onClose={() => setNotification(null)} />

        {/* Main Content Area */}
        <div className="flex flex-col w-full">
          {/* Top Action & Navigation Context */}
          <div className="flex flex-col gap-6 mb-8">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <Link
                to="/admin/servicios"
                data-testid="btn-back-to-sports"
                className="inline-flex items-center gap-2 text-sm font-semibold text-primary hover:text-primary-dim transition-colors group cursor-pointer"
              >
                <span className="material-symbols-outlined text-lg transition-transform group-hover:-translate-x-1">
                  arrow_back
                </span>
                Volver al listado
              </Link>

              {/* Action Buttons Cluster */}
              <div className="flex flex-wrap items-center gap-3">
                <button
                  type="button"
                  onClick={handleExportPayroll}
                  data-testid="btn-export-roster"
                  className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-surface-container-lowest text-on-surface hover:bg-surface-container-high transition-all text-sm font-semibold shadow-sm cursor-pointer border border-slate-200/80"
                >
                  <span className="material-symbols-outlined text-lg text-primary">download</span>
                  Exportar Padrón (PDF/Excel)
                </button>

                <button
                  type="button"
                  onClick={() => setIsEditConfigModalOpen(true)}
                  data-testid="btn-edit-config"
                  className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-surface-container-lowest text-on-surface hover:bg-surface-container-high transition-all text-sm font-semibold shadow-sm cursor-pointer border border-slate-200/80"
                >
                  <span className="material-symbols-outlined text-lg text-on-surface-variant">tune</span>
                  Editar Configuración
                </button>

                <button
                  type="button"
                  onClick={() => setIsEnrollModalOpen(true)}
                  data-testid="btn-enroll-student"
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-primary to-primary-container text-on-primary font-semibold text-sm shadow-md hover:shadow-lg transition-all hover:opacity-95 cursor-pointer border-none"
                >
                  <span className="material-symbols-outlined text-lg">person_add</span>
                  + Inscribir Alumno
                </button>
              </div>
            </div>

            {/* Title and Badges Bar */}
            <div
              data-testid="discipline-detail-header-card"
              className="flex flex-wrap items-center justify-between gap-4 bg-white p-6 rounded-2xl shadow-sm border border-slate-100"
            >
              <div className="flex flex-wrap items-center gap-4">
                <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-lime-100 via-amber-50 to-blue-50 flex items-center justify-center text-primary shadow-sm shrink-0 ring-2 ring-lime-400/20">
                  <span
                    className="material-symbols-outlined text-3xl text-primary"
                    style={{ fontVariationSettings: "'FILL' 1" }}
                  >
                    {discipline.icon || 'sprint'}
                  </span>
                </div>
                <div>
                  <div className="flex flex-wrap items-center gap-3">
                    <h1 className="text-2xl font-extrabold text-slate-900 font-headline tracking-tight">
                      {discipline.titulo}
                    </h1>
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-secondary-container/50 text-secondary-dim font-bold text-xs uppercase tracking-wider">
                      <span className="w-2 h-2 rounded-full bg-secondary ring-2 ring-lime-400/20"></span>
                      {discipline.activo ? 'Activo' : 'En Pausa'}
                    </span>
                    <span className="inline-flex items-center px-3 py-1 rounded-full bg-primary-container/20 text-primary font-bold text-xs">
                      Niveles: {discipline.niveles}
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 mt-1 font-medium">
                    Código de Cátedra:{' '}
                    <span className="font-mono text-primary font-bold">{discipline.code}</span> •{' '}
                    {discipline.ciclo}
                  </p>
                </div>
              </div>

              {/* Oferta abierta toggle */}
              <div className="flex items-center gap-3 bg-slate-50 px-4 py-2.5 rounded-xl border border-slate-100">
                <span className="text-xs font-bold text-slate-700">
                  {discipline.activo ? 'Oferta abierta' : 'Oferta cerrada'}
                </span>
                <button
                  type="button"
                  role="switch"
                  aria-checked={discipline.activo}
                  onClick={handleToggleOffer}
                  data-testid="toggle-offer-switch"
                  className={`w-11 h-6 relative inline-flex items-center rounded-full transition-colors focus:outline-none shadow-inner cursor-pointer border-none p-0.5 ${
                    discipline.activo ? 'bg-secondary' : 'bg-slate-300'
                  }`}
                >
                  <span
                    className={`inline-block w-5 h-5 transform bg-white rounded-full transition-transform shadow ${
                      discipline.activo ? 'translate-x-5' : 'translate-x-0'
                    }`}
                  />
                </button>
              </div>
            </div>
          </div>

          {/* Operational Overview Bento Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5 mb-8">
            {/* Card 1: Profesor Titular */}
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex flex-col justify-between relative overflow-hidden">
              <div>
                <div className="flex items-center justify-between mb-4">
                  <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                    Profesor Titular
                  </span>
                  <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                    <span className="material-symbols-outlined text-primary text-lg">sports</span>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-500 text-white font-bold flex items-center justify-center text-sm shrink-0 shadow-sm">
                    {discipline.profesor.iniciales || 'DA'}
                  </div>
                  <div className="min-w-0">
                    <h4 className="font-bold text-sm text-slate-900 truncate">
                      {discipline.profesor.nombre}
                    </h4>
                    <p className="text-xs font-mono text-primary font-bold mt-0.5">
                      Legajo {discipline.profesor.legajo}
                    </p>
                    <p className="text-xs text-slate-500 truncate mt-1">
                      {discipline.profesor.email}
                    </p>
                  </div>
                </div>
              </div>
              <div className="mt-4 pt-3 border-t border-slate-50">
                <button
                  type="button"
                  onClick={() => setIsReassignTeacherModalOpen(true)}
                  data-testid="btn-reassign-teacher"
                  className="w-full text-center py-2 text-xs font-bold text-primary hover:bg-primary-container/20 rounded-xl transition-colors cursor-pointer border-none bg-transparent"
                >
                  Reasignar profesor
                </button>
              </div>
            </div>

            {/* Card 2: Horarios & Espacio */}
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-4">
                  <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                    Horarios &amp; Espacio
                  </span>
                  <div className="w-8 h-8 rounded-full bg-tertiary-container/30 flex items-center justify-center">
                    <span className="material-symbols-outlined text-tertiary-fixed-dim text-lg">
                      schedule
                    </span>
                  </div>
                </div>
                <div className="space-y-3">
                  <div className="flex items-start gap-2.5">
                    <span className="material-symbols-outlined text-base text-tertiary-fixed-dim shrink-0 mt-0.5">
                      event
                    </span>
                    <div>
                      <p className="text-xs font-bold text-slate-800">{discipline.dias}</p>
                      <p className="text-xs text-slate-500 font-medium">{discipline.horas}</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-2.5">
                    <span className="material-symbols-outlined text-base text-tertiary-fixed-dim shrink-0 mt-0.5">
                      stadium
                    </span>
                    <div>
                      <p className="text-xs font-bold text-slate-800">{discipline.lugar}</p>
                      <p className="text-xs text-slate-500">{discipline.instalacion}</p>
                    </div>
                  </div>
                </div>
              </div>
              <div className="mt-4 pt-3 border-t border-slate-50">
                <span className="inline-flex items-center gap-1.5 text-[11px] font-bold text-secondary">
                  <span className="w-2 h-2 rounded-full bg-secondary"></span>
                  Instalaciones disponibles
                </span>
              </div>
            </div>

            {/* Card 3: Ocupación del Cupo */}
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                    Ocupación del Cupo
                  </span>
                  <span className="text-xs font-extrabold text-white bg-tertiary-fixed-dim px-2 py-0.5 rounded-full font-mono shadow-sm">
                    {occupancyPercentage}%
                  </span>
                </div>
                <div className="flex items-baseline gap-1.5 mt-2">
                  <span className="text-3xl font-extrabold text-slate-900 font-headline">
                    {occupancyCount}
                  </span>
                  <span className="text-sm font-semibold text-slate-500">
                    / {maxCapacity} plazas
                  </span>
                </div>
                <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden mt-3">
                  <div
                    className="bg-gradient-to-r from-tertiary-container to-tertiary h-full rounded-full transition-all duration-500"
                    style={{ width: `${occupancyPercentage}%` }}
                  ></div>
                </div>
                <div className="flex items-center justify-between mt-3 text-xs">
                  <span className="text-slate-500 font-medium">
                    {vacantesDisponibles} {vacantesDisponibles === 1 ? 'vacante disponible' : 'vacantes disponibles'}
                  </span>
                  <span className="font-bold text-tertiary">
                    {isFull ? 'Cupo completo' : isAlmostFull ? 'Cupo casi completo' : 'Cupo disponible'}
                  </span>
                </div>
              </div>
              <div className="mt-4 pt-3 border-t border-slate-50">
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-amber-500"></span>
                  <span className="text-[11px] font-bold text-slate-600">
                    Lista de espera: {discipline.listaEsperaCount} alumnos
                  </span>
                </div>
              </div>
            </div>

            {/* Card 4: Políticas y Alcance */}
            <div className="bg-gradient-to-br from-white via-lime-50/30 to-amber-50/20 p-6 rounded-2xl shadow-sm border border-slate-100 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-4">
                  <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                    Políticas y Alcance
                  </span>
                  <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                    <span className="material-symbols-outlined text-primary text-lg">gavel</span>
                  </div>
                </div>
                <div className="space-y-3">
                  <div>
                    <p className="text-[11px] font-bold text-slate-500 uppercase">
                      Niveles Habilitados
                    </p>
                    <p className="text-xs font-bold text-slate-800 mt-0.5">
                      {discipline.nivelesDetalle}
                    </p>
                  </div>
                  <div className="bg-white p-3 rounded-xl border border-slate-100 shadow-sm">
                    <div className="flex items-start gap-2">
                      <span className="material-symbols-outlined text-base text-primary shrink-0 mt-0.5">
                        verified_user
                      </span>
                      <p className="text-[11px] font-bold text-slate-700 leading-tight">
                        {discipline.politica}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
              <div className="mt-4 pt-3 border-t border-slate-50">
                <span className="text-[11px] font-semibold text-slate-500">
                  {discipline.supervision}
                </span>
              </div>
            </div>
          </div>

          {/* Main Section: Alumnos Inscriptos */}
          <div className="bg-surface-container-lowest rounded-2xl shadow-sm border border-slate-100 overflow-hidden flex flex-col">
            {/* Table Header Toolbar */}
            <div className="p-6 flex flex-col gap-4">
              <div className="flex flex-wrap items-center justify-between gap-4">
                <div>
                  <h2 className="text-lg font-bold text-on-surface font-headline">
                    Padrón de Alumnos Inscriptos
                  </h2>
                  <p className="text-xs text-on-surface-variant mt-0.5">
                    Gestión de matrículas, asistencias y fichas médicas activas
                  </p>
                </div>
                <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-surface-container text-on-surface-variant text-xs font-bold font-mono">
                  <span className="w-2 h-2 rounded-full bg-secondary"></span>
                  Mostrando {students.length} alumnos inscriptos
                </div>
              </div>

              {/* Filters & Search Form */}
              <div className="flex flex-wrap items-center gap-3 pt-2">
                <div className="relative flex-1 min-w-[260px]">
                  <span className="material-symbols-outlined absolute left-3.5 top-1/2 -translate-y-1/2 text-on-surface-variant text-lg">
                    search
                  </span>
                  <input
                    type="text"
                    value={searchTerm}
                    onChange={(e) => {
                      setSearchTerm(e.target.value);
                      setCurrentPage(1);
                    }}
                    placeholder="Buscar alumno por nombre, DNI o legajo..."
                    className="w-full pl-10 pr-4 py-2 rounded-xl bg-surface-container-low text-on-surface placeholder:text-on-surface-variant/70 text-xs font-medium focus:bg-surface-container-lowest focus:ring-2 focus:ring-primary/20 outline-none transition-all border-none"
                  />
                </div>

                {/* Filter by Nivel */}
                <div className="flex items-center gap-1 bg-surface-container-low p-1 rounded-xl">
                  {['Todos', 'Primario', 'Secundario'].map((nivel) => (
                    <button
                      key={nivel}
                      type="button"
                      onClick={() => {
                        setSelectedNivel(nivel);
                        setCurrentPage(1);
                      }}
                      className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors cursor-pointer border-none ${
                        selectedNivel === nivel
                          ? 'bg-primary text-white font-bold shadow-sm'
                          : 'text-on-surface-variant hover:text-on-surface bg-transparent'
                      }`}
                    >
                      {nivel}
                    </button>
                  ))}
                </div>

                {/* Filter by Curso */}
                <div className="relative">
                  <select
                    value={selectedCurso}
                    onChange={(e) => {
                      setSelectedCurso(e.target.value);
                      setCurrentPage(1);
                    }}
                    className="appearance-none bg-surface-container-low text-on-surface text-xs font-medium py-2 pl-3 pr-8 rounded-xl focus:bg-surface-container-lowest focus:ring-2 focus:ring-primary/20 outline-none cursor-pointer border-none"
                  >
                    <option value="Todos los Cursos">Todos los Cursos</option>
                    <option value="4° Grado">4° Grado</option>
                    <option value="5° Grado">5° Grado</option>
                    <option value="6° Grado">6° Grado</option>
                    <option value="7° Grado">7° Grado</option>
                    <option value="1° Año">1° Año</option>
                    <option value="2° Año">2° Año</option>
                    <option value="3° Año">3° Año</option>
                    <option value="4° Año">4° Año</option>
                    <option value="5° Año">5° Año</option>
                    <option value="6° Año">6° Año</option>
                  </select>
                  <span className="material-symbols-outlined absolute right-2.5 top-1/2 -translate-y-1/2 text-on-surface-variant text-sm pointer-events-none">
                    expand_more
                  </span>
                </div>

                {/* Filter by Estado de Arancel */}
                <div className="relative">
                  <select
                    value={selectedEstadoCuota}
                    onChange={(e) => {
                      setSelectedEstadoCuota(e.target.value);
                      setCurrentPage(1);
                    }}
                    className="appearance-none bg-surface-container-low text-on-surface text-xs font-medium py-2 pl-3 pr-8 rounded-xl focus:bg-surface-container-lowest focus:ring-2 focus:ring-primary/20 outline-none cursor-pointer border-none"
                  >
                    <option value="Estado de Cuota: Todos">Estado de Cuota: Todos</option>
                    <option value="Al Día">Al Día</option>
                    <option value="Pendiente">Pendiente</option>
                    <option value="Becado">Becado</option>
                  </select>
                  <span className="material-symbols-outlined absolute right-2.5 top-1/2 -translate-y-1/2 text-on-surface-variant text-sm pointer-events-none">
                    expand_more
                  </span>
                </div>
              </div>
            </div>

            {/* Data Table */}
            <div className="overflow-x-auto w-full">
              {currentStudents.length === 0 ? (
                <div className="p-12 text-center flex flex-col items-center justify-center gap-3">
                  <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center">
                    <span className="material-symbols-outlined text-[28px]">search_off</span>
                  </div>
                  <h4 className="text-sm font-bold text-slate-800">
                    No se encontraron alumnos inscriptos
                  </h4>
                  <p className="text-xs text-slate-500 max-w-sm">
                    No hay registros que coincidan con los filtros o término de búsqueda ingresado.
                  </p>
                  <button
                    type="button"
                    onClick={handleResetFilters}
                    className="mt-2 inline-flex items-center gap-2 px-4 py-2 bg-blue-50 text-blue-600 hover:bg-blue-100 rounded-xl text-xs font-semibold transition-colors cursor-pointer border-none"
                  >
                    <span className="material-symbols-outlined text-[16px]">refresh</span>
                    Restablecer filtros
                  </button>
                </div>
              ) : (
                <table className="w-full text-left text-xs">
                  <thead className="bg-surface-container-low text-on-surface-variant uppercase text-[10px] font-bold tracking-wider">
                    <tr>
                      <th className="px-6 py-3.5">Legajo</th>
                      <th className="px-6 py-3.5">Alumno</th>
                      <th className="px-6 py-3.5">Nivel &amp; Curso</th>
                      <th className="px-6 py-3.5">Tutor Responsable</th>
                      <th className="px-6 py-3.5">Inscripción</th>
                      <th className="px-6 py-3.5">Condición Deportiva</th>
                      <th className="px-6 py-3.5 text-right">Acciones</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-surface-container">
                    {currentStudents.map((student) => {
                      const isPendingMedical = student.condicionTipo === 'pendiente';
                      const isScholarship = student.condicionTipo === 'becado';

                      return (
                        <tr
                          key={student.id}
                          data-testid={`roster-row-${student.id}`}
                          className="hover:bg-slate-50 transition-colors"
                        >
                          {/* Legajo */}
                          <td className="px-6 py-4 font-mono font-bold text-primary">
                            {student.legajo}
                          </td>

                          {/* Alumno */}
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-3">
                              <div
                                className={`w-8 h-8 rounded-full bg-gradient-to-tr ${
                                  student.avatarGrad || 'from-blue-600 to-indigo-500'
                                } text-white font-bold flex items-center justify-center text-xs shrink-0 shadow-sm`}
                              >
                                {student.iniciales || 'AL'}
                              </div>
                              <div className="min-w-0">
                                <p className="font-bold text-slate-900 truncate">{student.nombre}</p>
                                <span className="text-[10px] text-slate-400 font-medium">
                                  DNI {student.dni}
                                </span>
                              </div>
                            </div>
                          </td>

                          {/* Nivel & Curso */}
                          <td className="px-6 py-4">
                            <span className="inline-flex items-center px-2.5 py-1 rounded-md bg-slate-100 text-slate-700 font-bold text-[11px]">
                              {student.cursoCompleto}
                            </span>
                          </td>

                          {/* Tutor Responsable */}
                          <td className="px-6 py-4">
                            <div className="flex flex-col">
                              <span className="font-bold text-slate-800 truncate">{student.tutor}</span>
                              <span className="text-[10px] text-slate-400 font-mono">
                                {student.tutorTelefono}
                              </span>
                            </div>
                          </td>

                          {/* Inscripción */}
                          <td className="px-6 py-4 font-mono text-slate-500 font-medium">
                            {student.fechaInscripcion}
                          </td>

                          {/* Condición Deportiva */}
                          <td className="px-6 py-4">
                            {isPendingMedical ? (
                              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-tertiary-container/30 text-tertiary font-bold text-[11px]">
                                <span className="w-1.5 h-1.5 rounded-full bg-tertiary"></span>
                                Apto Médico Pendiente
                              </span>
                            ) : isScholarship ? (
                              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-secondary-container/50 text-secondary-dim text-[11px] font-bold">
                                <span className="w-1.5 h-1.5 rounded-full bg-secondary"></span>
                                Regular • Becado 100%
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-secondary-container/50 text-secondary-dim text-[11px] font-bold">
                                <span className="w-1.5 h-1.5 rounded-full bg-secondary"></span>
                                Regular • Al día
                              </span>
                            )}
                          </td>

                          {/* Acciones */}
                          <td className="px-6 py-4 text-right">
                            <div className="flex items-center justify-end gap-1">
                              <button
                                type="button"
                                onClick={() => handleViewLegajo(student)}
                                data-testid={`btn-view-legajo-${student.id}`}
                                title="Ver Legajo"
                                className="p-1.5 rounded-lg text-primary hover:bg-primary-container/20 transition-colors cursor-pointer border-none bg-transparent flex items-center justify-center"
                              >
                                <span className="material-symbols-outlined text-lg">visibility</span>
                              </button>

                              <button
                                type="button"
                                onClick={() => setTransferStudent(student)}
                                data-testid={`btn-withdraw-${student.id}`}
                                title="Dar de baja / Transferir"
                                className="p-1.5 rounded-lg text-slate-400 hover:text-error hover:bg-slate-100 transition-colors cursor-pointer border-none bg-transparent flex items-center justify-center"
                              >
                                <span className="material-symbols-outlined text-lg">swap_horiz</span>
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              )}
            </div>

            {/* Table Footer / Minimal Pagination */}
            <div className="p-5 flex flex-wrap items-center justify-between gap-4 bg-surface-container-lowest border-t border-slate-100">
              <span className="text-xs text-on-surface-variant">
                Mostrando{' '}
                <span className="font-bold text-on-surface">
                  {totalItems === 0 ? 0 : startIndex + 1} -{' '}
                  {Math.min(startIndex + PAGE_SIZE, totalItems)}
                </span>{' '}
                de <span className="font-bold text-on-surface">{totalItems}</span> alumnos
              </span>

              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                  disabled={validCurrentPage <= 1}
                  data-testid="pagination-prev"
                  className="w-8 h-8 flex items-center justify-center rounded-lg bg-surface-container-low text-on-surface-variant hover:bg-surface-container-high transition-colors text-xs font-semibold disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer border-none"
                >
                  <span className="material-symbols-outlined text-base">chevron_left</span>
                </button>

                {Array.from({ length: totalPages }, (_, i) => i + 1).map((pageNum) => (
                  <button
                    key={pageNum}
                    type="button"
                    onClick={() => setCurrentPage(pageNum)}
                    data-testid={`pagination-page-${pageNum}`}
                    className={`w-8 h-8 flex items-center justify-center rounded-lg text-xs font-bold transition-all cursor-pointer border-none ${
                      validCurrentPage === pageNum
                        ? 'bg-primary text-on-primary shadow-sm'
                        : 'bg-surface-container-low text-on-surface hover:bg-surface-container-high'
                    }`}
                  >
                    {pageNum}
                  </button>
                ))}

                <button
                  type="button"
                  onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                  disabled={validCurrentPage >= totalPages}
                  data-testid="pagination-next"
                  className="w-8 h-8 flex items-center justify-center rounded-lg bg-surface-container-low text-on-surface-variant hover:bg-surface-container-high transition-colors text-xs font-semibold disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer border-none"
                >
                  <span className="material-symbols-outlined text-base">chevron_right</span>
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Modals */}
        <EnrollStudentModal
          isOpen={isEnrollModalOpen}
          onClose={() => setIsEnrollModalOpen(false)}
          onEnroll={handleEnrollStudent}
          currentCount={students.length}
          maxCapacity={discipline.cupoMax}
        />

        <EditSportsConfigModal
          isOpen={isEditConfigModalOpen}
          config={discipline}
          onClose={() => setIsEditConfigModalOpen(false)}
          onSave={handleSaveConfig}
        />

        <ReassignTeacherModal
          isOpen={isReassignTeacherModalOpen}
          currentTeacher={discipline.profesor}
          onClose={() => setIsReassignTeacherModalOpen(false)}
          onReassign={handleReassignTeacher}
        />

        <TransferWithdrawModal
          isOpen={Boolean(transferStudent)}
          student={transferStudent}
          onClose={() => setTransferStudent(null)}
          onConfirm={handleTransferOrWithdraw}
        />

        <StudentDetailsModal
          isOpen={Boolean(viewingStudent)}
          student={viewingStudent}
          onClose={() => setViewingStudent(null)}
        />
      </div>
    </AdminLayout>
  );
};

export default SportsDetailManagement;
