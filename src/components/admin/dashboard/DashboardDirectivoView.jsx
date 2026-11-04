import React from 'react';
import { Link } from 'react-router-dom';
import { TRANSPORT_ROUTES } from '../../../utils/academicUtils';

const QUICK_ACTIONS = [
  {
    title: 'Gestión de Alumnos',
    desc: 'Altas, legajos y matrículas',
    icon: 'school',
    to: '/admin/alumnos',
    color: 'from-blue-600 to-indigo-600',
    testId: 'quick-action-alumnos',
  },
  {
    title: 'Cuerpo Docente',
    desc: 'Cátedras, horarios y nómina',
    icon: 'badge',
    to: '/admin/docentes',
    color: 'from-amber-500 to-orange-600',
    testId: 'quick-action-docentes',
  },
  {
    title: 'Oferta Académica',
    desc: 'Cursos, divisiones y materias',
    icon: 'menu_book',
    to: '/admin/oferta-academica',
    color: 'from-emerald-600 to-teal-700',
    testId: 'quick-action-academica',
  },
  {
    title: 'Deportes y Talleres',
    desc: 'Actividades extracurriculares',
    icon: 'sports_soccer',
    to: '/admin/servicios',
    color: 'from-purple-600 to-violet-700',
    testId: 'quick-action-servicios',
  },
  {
    title: 'Finanzas y Pagos',
    desc: 'Aranceles, cuotas y cobros',
    icon: 'payments',
    to: '/admin/finanzas',
    color: 'from-lime-600 to-emerald-600',
    testId: 'quick-action-finanzas',
  },
  {
    title: 'Central de Reportes',
    desc: 'Informes oficiales del TPI',
    icon: 'insights',
    to: '/admin/reportes',
    color: 'from-rose-500 to-pink-600',
    testId: 'quick-action-reportes',
  },
];

const StatCard = ({ icon, label, value, sublabel, colorClass, testId }) => (
  <div
    data-testid={testId}
    className="bg-white rounded-2xl border border-slate-200/80 p-4 shadow-xs flex items-center justify-between transition-all hover:shadow-md"
  >
    <div className="flex flex-col">
      <span className="text-xs font-semibold text-slate-500">{label}</span>
      <span className="text-2xl font-extrabold text-slate-900 mt-1">{value}</span>
      {sublabel && <span className="text-[11px] text-slate-400 mt-0.5">{sublabel}</span>}
    </div>
    <div className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 ${colorClass}`}>
      <span className="material-symbols-outlined text-[24px]">{icon}</span>
    </div>
  </div>
);

const TransportRoutesGrid = ({ transportePorRecorrido = {} }) => (
  <div data-testid="transport-routes-summary" className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
    {TRANSPORT_ROUTES.map((route) => {
      const count = transportePorRecorrido[route.id] || 0;
      return (
        <div
          key={route.id}
          data-testid={`kpi-route-${route.id.replace(/\s+/g, '-').toLowerCase()}`}
          className="bg-slate-50/70 border border-slate-200/70 rounded-md p-3 flex flex-col justify-between gap-2"
        >
          <div className="flex items-center justify-between">
            <span className="px-2 py-0.5 text-[10px] font-extrabold bg-blue-100 text-blue-800 rounded-md">
              {route.id}
            </span>
            <span className="text-xs font-black text-slate-900">{count} alumnos</span>
          </div>
          <div>
            <p className="text-xs font-bold text-slate-800 truncate" title={route.nombre}>
              {route.nombre.replace(`${route.id} - `, '')}
            </p>
            <p className="text-[10px] text-slate-500 truncate" title={route.zona}>
              {route.zona}
            </p>
          </div>
          <div className="text-[10px] text-slate-400 font-mono flex items-center justify-between border-t border-slate-200/60 pt-1.5">
            <span>Ida: {route.horarioIda}</span>
            <span>Regreso: {route.horarioRegreso}</span>
          </div>
        </div>
      );
    })}
  </div>
);

const DashboardDirectivoView = ({ stats, roleTitle = 'Personal Directivo' }) => {
  return (
    <div data-testid="dashboard-directivo-view" className="flex flex-col gap-6">
      {/* Banner de Bienvenida y Resumen Ejecutivo */}
      <section
        data-testid="dashboard-welcome-banner"
        className="bg-gradient-to-r text-center from-blue-600 via-indigo-600 to-slate-800 rounded-3xl p-6 text-white shadow-md relative overflow-hidden"
      >
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-center gap-4">
          <div className="flex flex-col gap-1 ">
            <span className="text-xs font-bold text-blue-200 uppercase tracking-widest animate-pulse">
              Sistema de Gestión Integral · {roleTitle}
            </span>
            <h1 className="text-2xl font-black tracking-tight text-white">
              Tablero General Institucional
            </h1>
            <p className="text-xs text-blue-100 leading-relaxed">
              Monitoreo centralizado de matrícula escolar, servicios complementarios,
              cobertura de cátedras y accesos rápidos de supervisión.
            </p>
          </div>
        </div>
      </section>

      {/* Grid de 4 KPIs Principales */}
      <section data-testid="kpis-main-grid" className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          icon="groups"
          label="Matrícula Total Activa"
          value={stats.total}
          sublabel="Estudiantes en el padrón"
          colorClass="bg-blue-50 text-blue-600"
          testId="kpi-total-alumnos"
        />
        <StatCard
          icon="wb_sunny"
          label="Nivel Inicial"
          value={stats.porNivel.Inicial}
          sublabel="Salas de 2 a 5 años"
          colorClass="bg-amber-50 text-amber-600"
          testId="kpi-nivel-inicial"
        />
        <StatCard
          icon="history_edu"
          label="Nivel Primario"
          value={stats.porNivel.Primario}
          sublabel="1° a 7° Grado"
          colorClass="bg-emerald-50 text-emerald-600"
          testId="kpi-nivel-primario"
        />
        <StatCard
          icon="account_balance"
          label="Nivel Secundario"
          value={stats.porNivel.Secundario}
          sublabel="1° a 6° Año"
          colorClass="bg-indigo-50 text-indigo-600"
          testId="kpi-nivel-secundario"
        />
      </section>

      {/* Panel de Servicios Escolares y 4 Recorridos de Transporte */}
      <section
        data-testid="dashboard-services-section"
        className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs flex flex-col gap-4"
      >
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 pb-3">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center">
              <span className="material-symbols-outlined text-[20px]">directions_bus</span>
            </div>
            <div className='text-start'>
              <p className="font-extrabold text-slate-900 text-sm">
                Servicios Escolares & Transporte (4 Recorridos Oficiales)
              </p>
              <p className="text-xs text-slate-500">
                Inscripciones vigentes a los servicios.
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3 text-xs font-bold text-slate-700">
            <span className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-100">
              <span className="material-symbols-outlined text-[16px] text-amber-600">restaurant</span>
              Comedor: {stats.servicios.comedor}
            </span>
            <span className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-100">
              <span className="material-symbols-outlined text-[16px] text-emerald-600">sports_soccer</span>
              Deportes: {stats.servicios.deportes}
            </span>
          </div>
        </div>

        <TransportRoutesGrid transportePorRecorrido={stats.transportePorRecorrido} />
      </section>

      {/* Accesos Rápidos de Gestión */}
      <section data-testid="dashboard-quick-actions" className="flex flex-col gap-3">
        <h3 className="font-extrabold text-slate-900 text-sm">Módulos Operativos y Accesos Directos</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
          {QUICK_ACTIONS.map((action) => (
            <Link
              key={action.to}
              to={action.to}
              data-testid={action.testId}
              className="bg-white rounded-2xl border border-slate-200/80 p-4 shadow-xs flex items-center gap-3.5 transition-all hover:shadow-md hover:border-slate-300 group"
            >
              <div
                className={`w-11 h-11 rounded-xl bg-gradient-to-tr ${action.color} text-white flex items-center justify-center shadow-xs shrink-0 group-hover:scale-105 transition-transform`}
              >
                <span className="material-symbols-outlined text-[22px]">{action.icon}</span>
              </div>
              <div className="flex flex-col min-w-0">
                <span className="font-bold text-xs text-slate-900 group-hover:text-blue-600 transition-colors">
                  {action.title}
                </span>
                <span className="text-[11px] text-slate-500 truncate">{action.desc}</span>
              </div>
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
};

export default DashboardDirectivoView;
