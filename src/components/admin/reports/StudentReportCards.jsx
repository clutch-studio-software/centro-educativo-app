import React from 'react';

export const ServiceStatCard = ({
  testId,
  label,
  icon,
  iconColor = 'text-blue-600',
  mainText,
  subText,
}) => (
  <div
    data-testid={testId}
    className="bg-white border border-slate-200/80 rounded-md p-4 shadow-2xs flex flex-col justify-between gap-2 text-left"
  >
    <div className="flex items-center justify-between">
      <span className="text-[11px] font-bold text-slate-500 uppercase">{label}</span>
      <span className={`material-symbols-outlined text-[18px] ${iconColor}`}>{icon}</span>
    </div>
    <div>
      <p className="text-xs sm:text-sm font-extrabold text-slate-900 truncate" title={mainText}>
        {mainText}
      </p>
      <p className="text-[11px] text-slate-500 truncate" title={subText}>
        {subText}
      </p>
    </div>
  </div>
);

const StudentReportCards = ({ reportData }) => {
  if (!reportData) return null;

  return (
    <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
      <ServiceStatCard
        testId="card-report-cursado"
        label="Curso y División"
        icon="domain"
        iconColor="text-blue-600"
        mainText={reportData.curso}
        subText={`División ${reportData.division} · Turno ${reportData.turno}`}
      />

      <ServiceStatCard
        testId="card-report-transporte"
        label="Transporte Escolar"
        icon="directions_bus"
        iconColor="text-purple-600"
        mainText={reportData.transporte.recorrido}
        subText={
          reportData.transporte.activo
            ? `Ida: ${reportData.transporte.horarioIda} | Vuelta: ${reportData.transporte.horarioRegreso}`
            : 'Sin asignación'
        }
      />

      <ServiceStatCard
        testId="card-report-comedor"
        label="Comedor Escolar"
        icon="restaurant"
        iconColor="text-amber-600"
        mainText={reportData.comedor.activo ? 'Servicio Habilitado' : 'No inscripto'}
        subText={reportData.comedor.observaciones}
      />

      <ServiceStatCard
        testId="card-report-deportes"
        label="Deportes & Talleres"
        icon="sports_soccer"
        iconColor="text-emerald-600"
        mainText={`${reportData.sports.length} ${reportData.sports.length === 1 ? 'Actividad' : 'Actividades'}`}
        subText={
          reportData.sports.length > 0
            ? reportData.sports.map((s) => s.nombre).join(', ')
            : 'Sin deportes inscriptos'
        }
      />
    </section>
  );
};

export default StudentReportCards;
