import React, { useState } from 'react';
import ParentTransportSection from './ParentTransportSection.jsx';
import ParentSportsSection from './ParentSportsSection.jsx';
import ParentDiningSection from './ParentDiningSection.jsx';

const EMPTY_ARRAY = [];

/**
 * Gestor unificado de autogestión de servicios e inscripciones para padres/tutores
 */
const ParentServicesManager = ({
  student,
  routes = EMPTY_ARRAY,
  allStudents = EMPTY_ARRAY,
  allSports = EMPTY_ARRAY,
  onEnrollTransport,
  onCancelTransport,
  onEnrollSport,
  onWithdrawSport,
  onToggleDining,
  isProcessing = false,
}) => {
  const [activeTab, setActiveTab] = useState('transporte');

  const tabs = [
    { id: 'transporte', label: 'Transporte Escolar', icon: 'directions_bus' },
    { id: 'deportes', label: 'Deportes Extracurriculares', icon: 'sports_soccer' },
    { id: 'comedor', label: 'Comedor Escolar', icon: 'restaurant' },
  ];

  return (
    <div
      data-testid="parent-services-manager"
      className="space-y-4"
    >
      {/* Navegación por Pestañas */}
      <div className="flex border-b border-slate-200 gap-2 overflow-x-auto">
        {tabs.map((tab) => {
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              data-testid={`tab-${tab.id}`}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-2.5 text-xs font-bold font-label transition-colors border-b-2 cursor-pointer whitespace-nowrap ${
                isActive
                  ? 'border-orange-600 text-orange-600'
                  : 'border-transparent text-slate-500 hover:text-slate-800'
              }`}
            >
              <span className="material-symbols-outlined text-base">{tab.icon}</span>
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* Contenido de la Pestaña Activa */}
      {activeTab === 'transporte' && (
        <ParentTransportSection
          student={student}
          routes={routes}
          allStudents={allStudents}
          onEnrollTransport={onEnrollTransport}
          onCancelTransport={onCancelTransport}
          isProcessing={isProcessing}
        />
      )}

      {activeTab === 'deportes' && (
        <ParentSportsSection
          student={student}
          allSports={allSports}
          onEnrollSport={onEnrollSport}
          onWithdrawSport={onWithdrawSport}
          isProcessing={isProcessing}
        />
      )}

      {activeTab === 'comedor' && (
        <ParentDiningSection
          student={student}
          onToggleDining={onToggleDining}
          isProcessing={isProcessing}
        />
      )}
    </div>
  );
};

export default ParentServicesManager;
