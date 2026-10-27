import React, { useState } from 'react';
import Navbar from '../components/Navbar';
import Icon from '../components/atoms/Icon';
import LevelDetail from '../components/molecules/LevelDetail';
import ValueCard from '../components/molecules/ValueCard';
import SuccessModal from '../components/molecules/SuccessModal';
import LevelsHero from '../components/organisms/LevelsHero';
import LevelsCTA from '../components/organisms/LevelsCTA';
import VisitBookingModal from '../components/organisms/VisitBookingModal';
import useVisitBookingForm from '../hooks/useVisitBookingForm';

// Lists of pilars for each Level (Mapeado dinámico)
const inicialFeatures = [
  {
    title: 'Desarrollo Socio-Emocional',
    desc: 'Acompañamiento afectivo y rutinas seguras.',
    icon: 'check_circle',
    iconBgClass: 'bg-secondary-container/20',
    iconClass: 'text-secondary'
  },
  {
    title: 'Arte y Expresión',
    desc: 'Talleres creativos y estimulación sensorial.',
    icon: 'palette',
    iconBgClass: 'bg-secondary-container/20',
    iconClass: 'text-secondary'
  },
  {
    title: 'Aprendizaje Basado en Juego',
    desc: 'Metodologías activas para el descubrimiento.',
    icon: 'sports_esports',
    iconBgClass: 'bg-secondary-container/20',
    iconClass: 'text-secondary'
  }
];

const primarioFeatures = [
  {
    title: 'Bilingüismo Integrado',
    desc: 'Inmersión diaria en el idioma inglés.',
    icon: 'language',
    iconBgClass: 'bg-primary-container/20',
    iconClass: 'text-primary'
  },
  {
    title: 'Razonamiento Lógico',
    desc: 'Matemática aplicada a problemas reales.',
    icon: 'calculate',
    iconBgClass: 'bg-primary-container/20',
    iconClass: 'text-primary'
  },
  {
    title: 'Apoyo Psicopedagógico',
    desc: 'Seguimiento personalizado del aprendizaje.',
    icon: 'psychology_alt',
    iconBgClass: 'bg-primary-container/20',
    iconClass: 'text-primary'
  }
];

const secundarioFeatures = [
  {
    title: 'Robótica y Tecnología',
    desc: 'Programación y habilidades digitales avanzadas.',
    icon: 'memory',
    iconBgClass: 'bg-tertiary-container/20',
    iconClass: 'text-tertiary-container'
  },
  {
    title: 'Proyectos de Impacto',
    desc: 'Aprendizaje servicio y ciudadanía global.',
    icon: 'public',
    iconBgClass: 'bg-tertiary-container/20',
    iconClass: 'text-tertiary-container'
  },
  {
    title: 'Orientación Vocacional',
    desc: 'Talleres y vínculos con universidades.',
    icon: 'explore',
    iconBgClass: 'bg-tertiary-container/20',
    iconClass: 'text-tertiary-container'
  }
];

// List of transversal values (Mapeado dinámico)
const transversalValues = [
  {
    title: 'Bienestar Integral',
    description: 'Promovemos un clima escolar positivo, donde cada alumno se siente seguro, valorado y escuchado por la comunidad.',
    icon: 'favorite',
    iconBgClass: 'bg-primary-container/20',
    iconColorClass: 'text-primary',
    shadowClass: 'ambient-shadow-primary'
  },
  {
    title: 'Pensamiento Crítico',
    description: 'Enseñamos a cuestionar, investigar y construir conocimiento, no solo a memorizar información pasivamente.',
    icon: 'psychology',
    iconBgClass: 'bg-secondary-container/20',
    iconColorClass: 'text-secondary-dim',
    shadowClass: 'ambient-shadow-secondary'
  },
  {
    title: 'Ciudadanía Responsable',
    description: 'Inculcamos el respeto por el otro y el entorno, fomentando acciones que impacten positivamente en la sociedad.',
    icon: 'handshake',
    iconBgClass: 'bg-tertiary-container/20',
    iconColorClass: 'text-tertiary-dim',
    shadowClass: 'ambient-shadow-tertiary'
  }
];

const LevelsDownloadToast = ({ show }) => {
  if (!show) return null;

  return (
    <div className="fixed bottom-8 right-8 z-50 bg-slate-900/95 dark:bg-white/95 text-white dark:text-slate-900 px-6 py-4 rounded-2xl shadow-xl flex items-center gap-3 animate-in slide-in-from-bottom-8 duration-300 max-w-sm">
      <div className="w-8 h-8 rounded-full bg-primary/20 text-primary flex items-center justify-center flex-shrink-0">
        <Icon name="download" className="text-base font-bold animate-bounce" />
      </div>
      <div className="text-left">
        <p className="font-bold text-sm">Proyecto Educativo (PEI)</p>
        <p className="text-xs text-slate-300 dark:text-slate-600">Descarga simulada completada con éxito.</p>
      </div>
    </div>
  );
};

const Levels = () => {
  // Modal states for visit scheduling
  const [isModalOpen, setIsModalOpen] = useState(false);
  const {
    formData,
    errors,
    isSubmitting,
    submitSuccess,
    handleInputChange,
    handleBookingSubmit,
    handleCloseSuccess,
  } = useVisitBookingForm();

  // PEI Download Toast simulation state
  const [showDownloadToast, setShowDownloadToast] = useState(false);


  // PEI Download Simulation
  const handleDownloadPEI = () => {
    setShowDownloadToast(true);
    setTimeout(() => {
      setShowDownloadToast(false);
    }, 4000);
  };

  return (
    <div className="relative min-h-screen bg-surface text-on-surface">
      <Navbar />

      {/* Main Content */}
      <main className="pt-10 pb-24 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto space-y-32">
        
        {/* 1. Hero Section (Organism) */}
        <LevelsHero />

        {/* 2. Detailed Levels Bento Grid Sections */}
        <section className="space-y-24">
          
          {/* Nivel Inicial Detail Card (Image Right) */}
          <LevelDetail
            badgeText="Nivel Inicial"
            icon="toys"
            badgeClass="bg-secondary-container/20 text-on-secondary-container"
            title="Pequeños Exploradores"
            description="Un espacio diseñado para despertar la curiosidad innata. A través del juego estructurado, fomentamos la creatividad, la motricidad y el desarrollo socio-emocional temprano, sentando las bases para el amor por el aprendizaje."
            image="https://lh3.googleusercontent.com/aida-public/AB6AXuDAZz5yaXJA9b49AfLjWpI2538aVWr2hXyval0lV9VPp-bT_G-RKlhPB7s9nwnje7BWycu636QPsTbEl0nqldZy2b1JkKoeexrx4shZXR9LzUDD27nQVOr3CZQomQltWN51msS0t-wGS75_2uf5oF0rvsM6e6erpuh7iYwzeHvl12ZqkgikgWbF0RqPWCmlgGZNq004zFGxrxB8HEmKpIKwxo1GE8Y7WmdWzeF_CYhp6rM0TOjPCE-f0voh7GuqQw4mBH6DNU0gAcY"
            altText="Aula infantil de jardín de infantes bien iluminada"
            imageLeft={false}
            borderClass="asymmetric-border-1"
            shadowClass="ambient-shadow-secondary"
            features={inicialFeatures}
          />

          {/* Nivel Primario Detail Card (Image Left!) */}
          <LevelDetail
            badgeText="Nivel Primario"
            icon="menu_book"
            badgeClass="bg-primary-container/20 text-primary-dim"
            title="Cimientos del Futuro"
            description="Consolidamos la alfabetización integral y el razonamiento lógico matemático. Fomentamos la autonomía intelectual mediante metodologías activas donde el alumno es el protagonista de su propio aprendizaje."
            image="https://lh3.googleusercontent.com/aida-public/AB6AXuBuXW_QfGctMo9pgPrnxK8dp_gPt5xEwmoPfaGBRb1kPB6LP2lg0kFSvEnrng5g-evpQqhbgCj2coUE2HHp00YwiNZrVcsNDfcN7dT1QlhpPBgIVuoPAxnKVxEPcS1yFAD3E9OwjP9J1JZpiBVKkkkV5x32CSAuBa1GZ_5EkskwRBFUDPuBBpt4XzZTZg3447tggpC3TGrt8M8xwW6Idu-KBbfU_lkowpiZ-uPaneFgcGfZxxkjhEkE1gEo-cwvmFlCxff-5o13Jl0"
            altText="Estudiantes de escuela primaria cooperando en clase"
            imageLeft={true}
            borderClass="asymmetric-border-2"
            shadowClass="ambient-shadow-primary"
            features={primarioFeatures}
          />

          {/* Nivel Secundario Detail Card (Image Right) */}
          <LevelDetail
            badgeText="Nivel Secundario"
            icon="rocket_launch"
            badgeClass="bg-tertiary-container/20 text-tertiary-dim"
            title="Líderes Globales"
            description="Preparamos a los jóvenes para los desafíos del mañana. Enfoque en tecnología, proyectos de impacto social, pensamiento crítico y una sólida orientación vocacional para definir su camino universitario."
            image="https://lh3.googleusercontent.com/aida-public/AB6AXuDqgdTBoE_62xXs-LMvgfO6H6b2uc26WGT31mZiH0NQk77m7FHXgiS71RTuZ5WO815CHH4KpgFmMNcGemiUuNOC1G6ldFWBXq1S8KcsoNw4SCt2dx2jMaXT3wcKAk70qySy6zR6wMPno2jVv849LqA-ZYthKW-JwxSXOz8TN2cAYlUYZx_8NRJdgU6NjBTe933uSHXgZegaf86D8WPyWPFOoCktByVbFVlPUNiljx5u3NDn2_z7j9RvVthxxdPVG1jvm52mtAQZs8Q"
            altText="Estudiantes de bachillerato en laboratorio de robótica"
            imageLeft={false}
            borderClass="asymmetric-border-1"
            shadowClass="ambient-shadow-tertiary"
            features={secundarioFeatures}
          />

        </section>

        {/* 3. Transversal Values section (Mapped cards) */}
        <section className="bg-surface-container-low rounded-[3rem] p-8 md:p-16 relative overflow-hidden ghost-border text-center">
          <div className="absolute top-0 right-0 w-full h-1/2 bg-gradient-to-b from-surface-container-lowest/50 to-transparent pointer-events-none"></div>
          
          <div className="text-center max-w-3xl mx-auto mb-16 relative z-10">
            <h2 className="text-headline-lg font-bold Globalesfont-headline text-on-surface mb-6">
              Valores Transversales
            </h2>
            <p className="text-body-lg text-on-surface-variant font-body">
              Más allá del currículo académico, nuestro compromiso es formar personas íntegras. El bienestar emocional y la excelencia humana cruzan todas las etapas de nuestra propuesta.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative z-10">
            {transversalValues.map((value) => (
              <ValueCard
                key={value.id || value.title}
                title={value.title}
                description={value.description}
                icon={value.icon}
                iconBgClass={value.iconBgClass}
                iconColorClass={value.iconColorClass}
                shadowClass={value.shadowClass}
              />
            ))}
          </div>
        </section>

        {/* 4. Bottom CTA Section (Organism) */}
        <LevelsCTA 
          onDownloadPEI={handleDownloadPEI} 
          onScheduleVisit={() => setIsModalOpen(true)} 
        />

      </main>

      {/* 5. Booking Modal (Shared high-fidelity overlay) */}
      <VisitBookingModal
        isOpen={isModalOpen && !submitSuccess}
        onClose={() => setIsModalOpen(false)}
        formData={formData}
        errors={errors}
        isSubmitting={isSubmitting}
        handleInputChange={handleInputChange}
        handleBookingSubmit={handleBookingSubmit}
        idPrefix="level-booking"
      />

      {/* 6. Success Modal for Visit */}
      <SuccessModal 
        isOpen={submitSuccess}
        onClose={() => handleCloseSuccess(() => setIsModalOpen(false))}
        title="¡Visita Agendada!"
        message="Hemos registrado tu reserva para la visita guiada con éxito. Te hemos enviado un correo de confirmación con los horarios y los detalles de acceso al campus."
        buttonText="Excelente"
        iconBg="bg-green-100"
        iconColor="text-green-600"
      />

      {/* 7. PEI Download Toast simulation */}
      <LevelsDownloadToast show={showDownloadToast} />

    </div>
  );
};

export default Levels;
