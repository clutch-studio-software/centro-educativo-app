import React, { useState, useEffect, useCallback, useRef } from 'react';
import Navbar from '../components/Navbar';
import Icon from '../components/atoms/Icon';
import SuccessModal from '../components/molecules/SuccessModal';
import GalleryHero from '../components/organisms/GalleryHero';
import GalleryGrid from '../components/organisms/GalleryGrid';
import VisitBookingModal from '../components/organisms/VisitBookingModal';
import useVisitBookingForm from '../hooks/useVisitBookingForm';
import { images } from '../services/imagesConfig';

// Carousel Image Data
const carouselImages = [
  { url: images.pool, title: 'Complejo Acuático', description: 'Pileta olímpica techada y climatizada para natación libre y curricular.' },
  { url: images.stadium, title: 'Canchas Profesionales', description: 'Canchas de fútbol de césped sintético profesional.' },
  { url: images.lab, title: 'Laboratorio Maker', description: 'Espacio de experimentación y diseño de proyectos innovadores.' },
  { url: images.lectura, title: 'Biblioteca y Zona de Lectura', description: 'Áreas verdes equipadas para incentivar la lectura al aire libre.' },
  { url: images.basket, title: 'Microestadio de Básquet', description: 'Cancha cubierta reglamentaria para entrenamiento y torneos.' },
  { url: images.escuela, title: 'Edificio Principal', description: 'Acceso principal al campus educativo en Resistencia, Chaco.' },
  { url: images.nivelInicial, title: 'Aulas de Nivel Inicial', description: 'Salones adaptados con estimulación temprana y seguridad.' },
  { url: images.primaria, title: 'Aulas de Primaria', description: 'Espacios dinámicos equipados con pantallas táctiles e internet.' },
  { url: images.robotica, title: 'Taller de Robótica e Impresión 3D', description: 'Equipamiento de robótica y tecnología para proyectos makers.' },
  { url: images.secundaria, title: 'Aulas de Secundaria', description: 'Mobiliario flexible para el trabajo colaborativo en equipo.' },
];


const GalleryLightboxModal = ({
  isOpen,
  onClose,
  carouselIndex,
  setCarouselIndex,
  handleNext,
  handlePrev,
  handleTouchStart,
  handleTouchMove,
  handleTouchEnd,
}) => {
  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 bg-slate-950/95 backdrop-blur-lg flex flex-col justify-between p-4 md:p-8 animate-in fade-in duration-300 select-none"
      style={{ zIndex: 3000 }}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      {/* Botón de cerrar flotante */}
      <button 
        type="button"
        onClick={onClose}
        className="fixed top-4 right-4 z-50 w-12 h-12 rounded-full bg-slate-900/90 hover:bg-slate-800 text-white flex items-center justify-center transition-all cursor-pointer border border-slate-700/80 shadow-2xl active:scale-95"
        title="Cerrar (Esc)"
      >
        <Icon name="close" className="text-2xl" />
      </button>

      {/* Barra superior del modal */}
      <div className="flex items-center justify-between w-full text-white z-10 px-4">
        <span className="font-label text-xs uppercase tracking-widest font-bold opacity-75">
          Instalaciones ({carouselIndex + 1} de {carouselImages.length})
        </span>
      </div>

      {/* Area principal (Imagen y Botones laterales) */}
      <div className="flex-1 flex items-center justify-between relative max-w-6xl w-full mx-auto my-4">
        {/* Botón Izquierda */}
        <button
          type="button"
          onClick={handlePrev}
          className="absolute left-2 md:left-6 z-10 w-14 h-14 rounded-full bg-slate-900/90 hover:bg-slate-800 text-white flex items-center justify-center transition-all cursor-pointer border border-slate-700/80 shadow-xl active:scale-95"
          title="Anterior (←)"
        >
          <span className="material-symbols-outlined text-3xl">chevron_left</span>
        </button>

        {/* Contenedor de la Imagen con fade-in suave */}
        <div className="w-full flex items-center justify-center p-2 md:p-8 select-none">
          <img
            src={carouselImages[carouselIndex].url}
            alt={carouselImages[carouselIndex].title}
            className="max-h-[60vh] max-w-full rounded-2xl object-contain shadow-2xl animate-in fade-in zoom-in-95 duration-500"
          />
        </div>

        {/* Botón Derecha */}
        <button
          type="button"
          onClick={handleNext}
          className="absolute right-2 md:right-6 z-10 w-14 h-14 rounded-full bg-slate-900/90 hover:bg-slate-800 text-white flex items-center justify-center transition-all cursor-pointer border border-slate-700/80 shadow-xl active:scale-95"
          title="Siguiente (→)"
        >
          <span className="material-symbols-outlined text-3xl">chevron_right</span>
        </button>
      </div>

      {/* Barra inferior (Descripción y Miniaturas) */}
      <div className="w-full text-center text-white z-10 flex flex-col gap-6 max-w-4xl mx-auto pb-4">
        <div className="flex flex-col gap-1.5 px-4 animate-in slide-in-from-bottom-2 duration-300">
          <h3 className="font-headline text-xl md:text-2xl font-bold text-white">
            {carouselImages[carouselIndex].title}
          </h3>
          <p className="font-body text-sm md:text-base text-slate-300 max-w-2xl mx-auto">
            {carouselImages[carouselIndex].description}
          </p>
        </div>

        {/* Fila de Miniaturas */}
        <div className="flex items-center justify-center gap-2 overflow-x-auto py-2 px-4 scrollbar-none md:scrollbar-thin scrollbar-thumb-white/20 max-w-full">
          {carouselImages.map((img, i) => (
            <button
              key={img.id || img.url}
              type="button"
              aria-label={img.title ? `Ver imagen ${i + 1}: ${img.title}` : `Ver imagen ${i + 1}`}
              onClick={() => setCarouselIndex(i)}
              className={`relative flex-shrink-0 w-16 h-12 rounded-lg overflow-hidden border-2 transition-all cursor-pointer ${
                i === carouselIndex ? 'border-primary scale-110 shadow-lg shadow-primary/20' : 'border-transparent opacity-40 hover:opacity-75'
              }`}
            >
              <img src={img.url} alt="" className="w-full h-full object-cover" />
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

const Gallery = () => {
  // Modal state for booking a visit
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

  // Carousel Lightbox State
  const [isCarouselOpen, setIsCarouselOpen] = useState(false);
  const [carouselIndex, setCarouselIndex] = useState(0);
  const touchStartRef = useRef(0);
  const touchEndRef = useRef(0);

  const handleNext = useCallback(() => {
    setCarouselIndex((prev) => (prev + 1) % carouselImages.length);
  }, []);

  const handlePrev = useCallback(() => {
    setCarouselIndex((prev) => (prev - 1 + carouselImages.length) % carouselImages.length);
  }, []);

  // Keyboard navigation for Lightbox
  useEffect(() => {
    if (!isCarouselOpen) return;

    const handleKeyDown = (e) => {
      if (e.key === 'ArrowRight') {
        handleNext();
      } else if (e.key === 'ArrowLeft') {
        handlePrev();
      } else if (e.key === 'Escape') {
        setIsCarouselOpen(false);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isCarouselOpen, handleNext, handlePrev]);

  // Touch handlers for mobile swiping
  const handleTouchStart = (e) => {
    touchStartRef.current = e.targetTouches[0].clientX;
  };

  const handleTouchMove = (e) => {
    touchEndRef.current = e.targetTouches[0].clientX;
  };

  const handleTouchEnd = () => {
    if (touchStartRef.current - touchEndRef.current > 75) {
      handleNext();
    }
    if (touchStartRef.current - touchEndRef.current < -75) {
      handlePrev();
    }
  };

  const handleOpenCarousel = (index) => {
    setCarouselIndex(index);
    setIsCarouselOpen(true);
  };

  return (
    <div className="relative min-h-screen bg-surface text-on-surface">
      <Navbar />
      
      {/* Main Content */}
      <main className="pt-10 pb-24 px-6 max-w-7xl mx-auto">
        {/* Gallery Hero Component (Organism) */}
        <GalleryHero />

        {/* Gallery Grid Component (Organism) */}
        <GalleryGrid 
          onVisitClick={() => setIsModalOpen(true)} 
          onImageClick={handleOpenCarousel}
        />
      </main>

      {/* 1. Modal de Reserva de Visita (Glassmorphism booking overlay) */}
      <VisitBookingModal
        isOpen={isModalOpen && !submitSuccess}
        onClose={() => setIsModalOpen(false)}
        formData={formData}
        errors={errors}
        isSubmitting={isSubmitting}
        handleInputChange={handleInputChange}
        handleBookingSubmit={handleBookingSubmit}
        idPrefix="gallery-booking"
      />

      {/* 2. Modal de Éxito al Agendar */}
      <SuccessModal 
        isOpen={submitSuccess}
        onClose={() => handleCloseSuccess(() => setIsModalOpen(false))}
        title="¡Visita Agendada!"
        message="Hemos registrado tu reserva para la visita guiada con éxito. Te hemos enviado un correo de confirmación con los horarios y los detalles de acceso al campus."
        buttonText="Excelente"
        iconBg="bg-green-100"
        iconColor="text-green-600"
      />

      {/* 3. Modal de Carrusel / Lightbox (Premium visual overlay) */}
      <GalleryLightboxModal
        isOpen={isCarouselOpen}
        onClose={() => setIsCarouselOpen(false)}
        carouselIndex={carouselIndex}
        setCarouselIndex={setCarouselIndex}
        handleNext={handleNext}
        handlePrev={handlePrev}
        handleTouchStart={handleTouchStart}
        handleTouchMove={handleTouchMove}
        handleTouchEnd={handleTouchEnd}
      />
    </div>
  );
};

export default Gallery;
