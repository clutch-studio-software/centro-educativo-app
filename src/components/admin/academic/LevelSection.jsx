import React from 'react';
import CourseCard from './CourseCard';

const LevelSection = ({
  level,
  courses,
  onToggleStatus,
  onEditCourse,
  onManageCourse,
  onViewSubjects,
}) => {
  const { id, name, shortCode, badgeStyle, subtitle, countLabel } = level;

  // Primario has 4 cols, Inicial and Secundario have 3 cols as in the HTML template
  const gridColsClass =
    id === 'primario'
      ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4'
      : 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4';

  const activeCoursesCount = courses.filter((c) => c.activo).length;
  const displayCount = countLabel || `${activeCoursesCount} Cursos`;

  return (
    <section
      data-testid={`level-section-${id}`}
      data-purpose={`nivel-${id}-group`}
      className="bg-white rounded-2xl p-6 border border-slate-100 shadow-[0_2px_10px_rgba(0,0,0,0.02)]"
    >
      <div className="flex items-center justify-between mb-5">
        <div className="flex items-center gap-3">
          <div
            className={`w-8 h-8 rounded-xl flex items-center justify-center font-bold text-xs shrink-0 ${badgeStyle}`}
          >
            {shortCode}
          </div>
          <div>
            <h2 className="text-base font-bold text-slate-900 leading-snug">{name}</h2>
            <p className="text-xs text-slate-400">{subtitle}</p>
          </div>
        </div>
        <span className="text-xs font-semibold px-2.5 py-1 bg-slate-50 text-slate-600 border border-slate-100 rounded-lg">
          {displayCount}
        </span>
      </div>

      <div className={gridColsClass}>
        {courses.map((course) => (
          <CourseCard
            key={course.id}
            course={course}
            onToggleStatus={onToggleStatus}
            onEditCourse={onEditCourse}
            onManageCourse={onManageCourse}
            onViewSubjects={onViewSubjects}
          />
        ))}
      </div>
    </section>
  );
};

export default LevelSection;
