import React, { useState, useRef, useEffect, useMemo } from 'react';
import { parseCourseDivision } from '../../../data/mockAcademicOffer';
import { getEnrolledStudentsForCourse, sortCourseObjects } from '../../../utils/academicUtils';
import { DivisionRowMenu } from './DivisionRowMenu';
import { DivisionStatsCards, DivisionTableToolbar } from './DivisionTableToolbar';
import { DivisionTableRow } from './DivisionTableRow';

const EMPTY_COURSES = [];
const EMPTY_STUDENTS = [];

const DivisionTable = ({
  level,
  courses = EMPTY_COURSES,
  students = EMPTY_STUDENTS,
  onToggleStatus,
  onEditCourse,
  onViewCourse,
  onDeleteCourse,
  onAddNewDivision,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [shiftFilter, setShiftFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');

  // Floating Actions Menu state
  const [activeMenuCourseId, setActiveMenuCourseId] = useState(null);
  const [menuPosition, setMenuPosition] = useState({ top: 0, right: 0 });
  const menuRef = useRef(null);

  // Close menu on outside click or scroll
  useEffect(() => {
    const handleOutsideClick = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setActiveMenuCourseId(null);
      }
    };
    const handleScroll = () => {
      if (activeMenuCourseId) setActiveMenuCourseId(null);
    };

    if (activeMenuCourseId) {
      document.addEventListener('mousedown', handleOutsideClick);
      window.addEventListener('scroll', handleScroll, true);
    }
    return () => {
      document.removeEventListener('mousedown', handleOutsideClick);
      window.removeEventListener('scroll', handleScroll, true);
    };
  }, [activeMenuCourseId]);

  const handleOpenMenu = (e, course) => {
    e.stopPropagation();
    if (activeMenuCourseId === course.id) {
      setActiveMenuCourseId(null);
      return;
    }
    const rect = e.currentTarget.getBoundingClientRect();
    setMenuPosition({
      top: rect.bottom + 6,
      right: Math.max(16, window.innerWidth - rect.right),
    });
    setActiveMenuCourseId(course.id);
  };

  // Filter and sort courses by search, shift, status (sorted by Course and then Division)
  const filteredCourses = useMemo(() => {
    const list = courses.filter((course) => {
      const { nombre, division } = parseCourseDivision(course);
      const matchesSearch =
        searchTerm.trim() === '' ||
        course.nombre?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
        division.toLowerCase().includes(searchTerm.toLowerCase()) ||
        course.aula?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        course.orientacion?.toLowerCase().includes(searchTerm.toLowerCase());

      const isTurnoTarde = course.turno?.toLowerCase().includes('tarde');
      const matchesShift =
        shiftFilter === 'all' ||
        (shiftFilter === 'manana' && !isTurnoTarde) ||
        (shiftFilter === 'tarde' && isTurnoTarde);

      const matchesStatus =
        statusFilter === 'all' ||
        (statusFilter === 'active' && course.activo) ||
        (statusFilter === 'inactive' && !course.activo);

      return matchesSearch && matchesShift && matchesStatus;
    });

    return sortCourseObjects(list);
  }, [courses, searchTerm, shiftFilter, statusFilter]);

  // Aggregate stats dynamically
  const stats = useMemo(() => {
    const totalDivisions = courses.length;
    const activeDivisions = courses.filter((c) => c.activo).length;
    let totalEnrolled = 0;
    let totalCapacity = 0;

    courses.forEach((c) => {
      const enrolled = getEnrolledStudentsForCourse(students, c);
      totalEnrolled += enrolled.length;
      totalCapacity += c.cupoMax || 30;
    });

    const occupancyRate = totalCapacity > 0 ? Math.round((totalEnrolled / totalCapacity) * 100) : 0;
    return {
      totalDivisions,
      activeDivisions,
      totalEnrolled,
      totalCapacity,
      occupancyRate,
    };
  }, [courses, students]);

  const activeMenuCourse = courses.find((c) => c.id === activeMenuCourseId);
  const activeMenuEnrolledStudents = activeMenuCourse
    ? getEnrolledStudentsForCourse(students, activeMenuCourse)
    : EMPTY_STUDENTS;

  return (
    <div className="space-y-5 animate-in fade-in duration-200" data-testid={`division-table-${level?.id}`}>
      {/* Level Summary Banner & Stat Cards */}
      <DivisionStatsCards stats={stats} />

      {/* Filter and Action Toolbar */}
      <DivisionTableToolbar
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
        shiftFilter={shiftFilter}
        onShiftChange={setShiftFilter}
        statusFilter={statusFilter}
        onStatusChange={setStatusFilter}
        onAddNewDivision={onAddNewDivision}
      />

      {/* Main Table */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-[0_4px_18px_rgba(15,23,42,0.03)] overflow-hidden">
        {filteredCourses.length === 0 ? (
          <div className="p-12 text-center flex flex-col items-center justify-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-slate-100 text-slate-400 flex items-center justify-center">
              <span className="material-symbols-outlined text-[28px]">search_off</span>
            </div>
            <h4 className="text-sm font-bold text-slate-700">No se encontraron divisiones</h4>
            <p className="text-xs text-slate-400 max-w-sm">
              No hay registros que coincidan con los filtros aplicados en este nivel educativo.
            </p>
            {(searchTerm || shiftFilter !== 'all' || statusFilter !== 'all') && (
              <button
                type="button"
                onClick={() => {
                  setSearchTerm('');
                  setShiftFilter('all');
                  setStatusFilter('all');
                }}
                className="mt-2 text-xs font-semibold text-blue-600 hover:underline cursor-pointer border-none bg-transparent"
              >
                Limpiar filtros
              </button>
            )}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead className="bg-slate-50/70 border-b border-slate-100 text-[11px] font-bold uppercase tracking-wider text-slate-400">
                <tr>
                  <th className="py-3.5 px-6 font-semibold" scope="col">
                    Nombre / Curso
                  </th>
                  <th className="py-3.5 px-6 font-semibold" scope="col">
                    División
                  </th>
                  <th className="py-3.5 px-6 font-semibold" scope="col">
                    Turno
                  </th>
                  <th className="py-3.5 px-6 font-semibold" scope="col">
                    Ocupación
                  </th>
                  <th className="py-3.5 px-6 font-semibold text-center" scope="col">
                    Estado
                  </th>
                  <th className="py-3.5 px-6 font-semibold text-right" scope="col">
                    Más Acciones
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs text-slate-700">
                {filteredCourses.map((course) => (
                  <DivisionTableRow
                    key={course.id}
                    course={course}
                    level={level}
                    students={students}
                    activeMenuCourseId={activeMenuCourseId}
                    onToggleStatus={onToggleStatus}
                    onOpenMenu={handleOpenMenu}
                  />
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Floating Actions Menu for Course */}
      <DivisionRowMenu
        course={activeMenuCourse}
        enrolledStudents={activeMenuEnrolledStudents}
        menuRef={menuRef}
        menuPosition={menuPosition}
        onClose={() => setActiveMenuCourseId(null)}
        onView={onViewCourse}
        onEdit={onEditCourse}
        onDelete={onDeleteCourse}
      />
    </div>
  );
};

export default DivisionTable;
