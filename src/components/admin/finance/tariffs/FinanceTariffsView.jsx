import React from 'react';
import TariffHeaderSection from './TariffHeaderSection';
import TariffEducationalLevelsCard from './TariffEducationalLevelsCard';
import TariffSportsCard from './TariffSportsCard';
import TariffDiningCard from './TariffDiningCard';
import TariffTransportCard from './TariffTransportCard';
import TariffStickyBottomBar from './TariffStickyBottomBar';
import TariffEditAmountModal from './TariffEditAmountModal';
import TariffTransportModal from './TariffTransportModal';
import TariffAuditModal from './TariffAuditModal';
import { useFinanceTariffsManagement } from './useFinanceTariffsManagement';

const FinanceTariffsView = ({ onNotify }) => {
  const {
    tariffs,
    sportsPrices,
    auditLogs,
    isAuditModalOpen,
    setIsAuditModalOpen,
    isSaving,
    isSaved,
    editingAmountItem,
    setEditingAmountItem,
    isTransportModalOpen,
    setIsTransportModalOpen,
    editingRoute,
    setEditingRoute,
    handleSaveAmount,
    handleToggleRoute,
    handleOpenCreateRoute,
    handleOpenEditRoute,
    handleSaveRoute,
    handleDeleteRoute,
    handleSaveTariffs,
    handleResetTariffs,
  } = useFinanceTariffsManagement(onNotify);

  return (
    <div
      data-testid="finance-tariffs-view"
      className="flex flex-col gap-6 animate-in fade-in duration-200"
    >
      {/* Header específico de la matriz de tarifas */}
      <TariffHeaderSection />

      {/* Disposición en 1 sola columna: Cuotas x nivel, Actividades, Comedor, Transporte */}
      <div className="flex flex-col gap-6 pb-28">
        {/* Sección 1: Cuotas por Nivel Educativo */}
        <TariffEducationalLevelsCard
          levels={tariffs.academicLevels}
          onEditItem={setEditingAmountItem}
        />

        {/* Sección 2: Actividades Extracurriculares (desde Firebase) */}
        <TariffSportsCard
          sportsPrices={sportsPrices}
          onEditItem={setEditingAmountItem}
        />

        {/* Sección 3: Servicio de Comedor Escolar */}
        <TariffDiningCard
          diningPlans={tariffs.dining}
          onEditItem={setEditingAmountItem}
        />

        {/* Sección 4: Servicio de Transporte Escolar (Rutas) */}
        <TariffTransportCard
          routes={tariffs.transport}
          onToggleRoute={handleToggleRoute}
          onCreateRoute={handleOpenCreateRoute}
          onEditRoute={handleOpenEditRoute}
          onDeleteRoute={handleDeleteRoute}
        />
      </div>

      {/* Barra de confirmación fija inferior con botón Auditoría */}
      <TariffStickyBottomBar
        isSaving={isSaving}
        isSaved={isSaved}
        onReset={handleResetTariffs}
        onSave={handleSaveTariffs}
        onOpenAudit={() => setIsAuditModalOpen(true)}
      />

      {/* Modal para Editar Montos Individuales */}
      <TariffEditAmountModal
        isOpen={Boolean(editingAmountItem)}
        item={editingAmountItem}
        onClose={() => setEditingAmountItem(null)}
        onSave={handleSaveAmount}
      />

      {/* Modal para Crear y Modificar Rutas de Transporte */}
      <TariffTransportModal
        isOpen={isTransportModalOpen}
        route={editingRoute}
        onClose={() => {
          setIsTransportModalOpen(false);
          setEditingRoute(null);
        }}
        onSave={handleSaveRoute}
      />

      {/* Modal de Auditoría Paginada */}
      <TariffAuditModal
        isOpen={isAuditModalOpen}
        onClose={() => setIsAuditModalOpen(false)}
        auditLogs={auditLogs}
      />
    </div>
  );
};

export default FinanceTariffsView;
