import React from 'react';
import AdminSectionTitle from '../../AdminSectionTitle';

const TariffHeaderSection = () => {
  return (
    <div data-testid="tariff-header-section" className="flex flex-col gap-6">

      {/* Header Section with editorial contrast & Metric Summary Capsules */}
      <div className="flex gap-6">
        <div className="flex gap-2">
          {/* Reutilización del componente existente AdminSectionTitle */}
          <AdminSectionTitle
            icon="price_change"
            title="Parametrización de Aranceles y Tarifas"
            subtitle="Configuración centralizada de valores arancelarios institucionales, talleres extracurriculares, comedor y recorridos de transporte escolar."
          />
        </div>
      </div>
    </div>
  );
};

export default TariffHeaderSection;
