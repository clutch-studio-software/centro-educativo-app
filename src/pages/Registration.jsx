import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import SuccessModal from '../components/molecules/SuccessModal';
import '../styles/Registration.css';
import {
  isValidEmail,
  isValidPhone,
  isValidDni,
  formatDni,
  validarEdadPorNivel,
  obtenerLimitesFechaPorNivel,
  sanitizePhoneNumber
} from '../utils/validators';

const NIVELES = [
  {
    id: 'inicial',
    icon: '😊',
    nombre: 'Nivel Inicial',
    descripcion: 'Para niños de 2 a 5 años. Un entorno lúdico y seguro.',
  },
  {
    id: 'primaria',
    icon: '📋',
    nombre: 'Primaria',
    descripcion: 'De 1º a 6º grado. Bases sólidas para el futuro.',
  },
  {
    id: 'secundaria',
    icon: '🎓',
    nombre: 'Secundaria',
    descripcion: 'Formación integral y preparación universitaria.',
  },
];

const PASOS = ['Nivel', 'Tutor', 'Alumno'];

const Registration = () => {
  const navigate = useNavigate();
  const [pasoActual, setPasoActual] = useState(1);
  const [showSuccessModal, setShowSuccessModal] = useState(false);

  const [datosFormulario, setDatosFormulario] = useState({
    nivel: '',
    nombreTutor: '',
    dniTutor: '',
    correo: '',
    telefono: '',
    nombreAlumno: '',
    fechaNacimiento: '',
    dniAlumno: '',
    observaciones: '',
  });
  const [errores, setErrores] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const siguientePaso = () => {
    if (validarPaso()) setPasoActual(pasoActual + 1);
  };

  const handleSubmit = () => {
    if (!validarPaso()) return;
    setIsSubmitting(true);
    setTimeout(() => {
      setIsSubmitting(false);
      setShowSuccessModal(true);
    }, 1500);
  };

  const pasoAnterior = () => {
    if (pasoActual > 1) setPasoActual(pasoActual - 1);
  };

  const handleChange = (campo, valor) => {
    let nuevoValor = valor;
    
    if (campo === 'dniTutor' || campo === 'dniAlumno') {
      nuevoValor = formatDni(valor);
    }
    if (campo === 'telefono') {
      nuevoValor = sanitizePhoneNumber(valor);
    }

    setDatosFormulario({ ...datosFormulario, [campo]: nuevoValor });
    if (errores[campo]) setErrores({ ...errores, [campo]: undefined });
  };

  const validarPaso = () => {
    const erroresValidacion = {};
    if (pasoActual === 1 && !datosFormulario.nivel) {
      erroresValidacion.nivel = 'Selecciona un nivel para continuar.';
    }
    if (pasoActual === 2) {
      if (!datosFormulario.nombreTutor.trim()) {
        erroresValidacion.nombreTutor = 'El campo es obligatorio';
      }
      
      if (!datosFormulario.dniTutor.trim()) {
        erroresValidacion.dniTutor = 'El campo es obligatorio';
      } else if (!isValidDni(datosFormulario.dniTutor)) {
        erroresValidacion.dniTutor = 'El DNI debe tener entre 7 y 9 números';
      }

      if (!datosFormulario.correo.trim()) {
        erroresValidacion.correo = 'El campo es obligatorio';
      } else if (!isValidEmail(datosFormulario.correo)) {
        erroresValidacion.correo = 'Ingresa un correo electrónico válido';
      }

      if (!datosFormulario.telefono.trim()) {
        erroresValidacion.telefono = 'El campo es obligatorio';
      } else if (!isValidPhone(datosFormulario.telefono)) {
        erroresValidacion.telefono = 'El teléfono debe tener 10 u 11 dígitos numéricos';
      }
    }
    if (pasoActual === 3) {
      if (!datosFormulario.nombreAlumno.trim()) {
        erroresValidacion.nombreAlumno = 'El campo es obligatorio';
      }
      if (!datosFormulario.fechaNacimiento) {
        erroresValidacion.fechaNacimiento = 'El campo es obligatorio';
      } else {
        const checkEdad = validarEdadPorNivel(
          datosFormulario.fechaNacimiento,
          datosFormulario.nivel
        );
        if (!checkEdad.esValido) {
          erroresValidacion.fechaNacimiento = checkEdad.error;
        }
      }
      if (!datosFormulario.dniAlumno.trim()) {
        erroresValidacion.dniAlumno = 'El campo es obligatorio';
      } else if (!isValidDni(datosFormulario.dniAlumno)) {
        erroresValidacion.dniAlumno = 'El DNI debe tener entre 7 y 9 números';
      }
    }
    setErrores(erroresValidacion);
    return Object.keys(erroresValidacion).length === 0;
  };

  return (
    <>
      <Navbar />
      <main className="registro-main">
        <div className="registro-hero">
          <h1 className="registro-titulo">
            Únete a nuestra <span className="registro-titulo-acento">comunidad</span>
          </h1>
          <p className="registro-subtitulo">
            Comienza el proceso de inscripción para el nuevo ciclo lectivo. Un camino de
            descubrimiento, aprendizaje y transformación te espera.
          </p>
        </div>


        <div className="stepper">
          {PASOS.map((paso, index) => {
            const numero = index + 1;
            const activo = numero === pasoActual;
            const completado = numero < pasoActual;
            return (
              <React.Fragment key={paso}>
                <div className={`stepper-paso ${activo ? 'activo' : ''} ${completado ? 'completado' : ''}`}>
                  <div className="stepper-circulo">
                    {completado ? '✓' : numero}
                  </div>
                  <span className="stepper-etiqueta">{paso}</span>
                </div>
                {index < PASOS.length - 1 && (
                  <div className={`stepper-linea ${completado ? 'completada' : ''}`} />
                )}
              </React.Fragment>
            );
          })}
        </div>


        <div className="registro-card">


          {pasoActual === 1 && (
            <section className="paso" data-testid="reg-step-1">
              <h2 className="paso-titulo">Paso 1: Selección de Nivel</h2>
              <div className="niveles-grid">
                {NIVELES.map((nivel) => (
                  <button
                    key={nivel.id}
                    data-testid={`reg-level-${nivel.id}`}
                    type="button"
                    className={`nivel-card ${datosFormulario.nivel === nivel.id ? 'seleccionado' : ''}`}
                    onClick={() => handleChange('nivel', nivel.id)}
                  >
                    <span className="nivel-icon">{nivel.icon}</span>
                    <strong className="nivel-nombre">{nivel.nombre}</strong>
                    <p className="nivel-desc">{nivel.descripcion}</p>
                  </button>
                ))}
              </div>
              {errores.nivel && <p className="form-error" data-testid="reg-error-nivel">{errores.nivel}</p>}
            </section>
          )}


          {pasoActual === 2 && (
            <section className="paso" data-testid="reg-step-2">
              <h2 className="paso-titulo">Paso 2: Datos del Tutor</h2>
              <div className="form-grid">
                <div className="form-grupo">
                  <label htmlFor="reg-tutor-name" className="form-label">NOMBRE COMPLETO</label>
                  <input
                    id="reg-tutor-name"
                    data-testid="reg-tutor-name"
                    className={`form-input ${errores.nombreTutor ? 'form-input--error' : ''}`}
                    type="text"
                    placeholder="Ej. Juan Pérez"
                    value={datosFormulario.nombreTutor}
                    onChange={(e) => handleChange('nombreTutor', e.target.value)}
                  />
                  {errores.nombreTutor && <p className="form-error" data-testid="reg-error-tutor-name">{errores.nombreTutor}</p>}
                </div>
                <div className="form-grupo">
                  <label htmlFor="reg-tutor-dni" className="form-label">DNI</label>
                  <input
                    id="reg-tutor-dni"
                    data-testid="reg-tutor-dni"
                    className={`form-input ${errores.dniTutor ? 'form-input--error' : ''}`}
                    type="text"
                    placeholder="Número de documento"
                    value={datosFormulario.dniTutor}
                    onChange={(e) => handleChange('dniTutor', e.target.value)}
                  />
                  {errores.dniTutor && <p className="form-error" data-testid="reg-error-tutor-dni">{errores.dniTutor}</p>}
                </div>
                <div className="form-grupo">
                  <label htmlFor="reg-tutor-email" className="form-label">CORREO ELECTRÓNICO</label>
                  <input
                    id="reg-tutor-email"
                    data-testid="reg-tutor-email"
                    className={`form-input ${errores.correo ? 'form-input--error' : ''}`}
                    type="email"
                    placeholder="correo@ejemplo.com"
                    value={datosFormulario.correo}
                    onChange={(e) => handleChange('correo', e.target.value)}
                  />
                  {errores.correo && <p className="form-error" data-testid="reg-error-tutor-email">{errores.correo}</p>}
                </div>
                <div className="form-grupo">
                  <label htmlFor="reg-tutor-phone" className="form-label">TELÉFONO DE CONTACTO</label>
                  <input
                    id="reg-tutor-phone"
                    data-testid="reg-tutor-phone"
                    className={`form-input ${errores.telefono ? 'form-input--error' : ''}`}
                    type="tel"
                    maxLength={11}
                    placeholder="Ej: 1123456789 (10 u 11 dígitos)"
                    value={datosFormulario.telefono}
                    onChange={(e) => handleChange('telefono', e.target.value)}
                  />
                  {errores.telefono && <p className="form-error" data-testid="reg-error-tutor-phone">{errores.telefono}</p>}
                </div>
              </div>
            </section>
          )}


          {pasoActual === 3 && (
            <section className="paso" data-testid="reg-step-3">
              <h2 className="paso-titulo">Paso 3: Datos del Alumno</h2>
              <div className="form-grid">
                <div className="form-grupo">
                  <label htmlFor="reg-student-name" className="form-label">NOMBRE COMPLETO DEL ALUMNO</label>
                  <input
                    id="reg-student-name"
                    data-testid="reg-student-name"
                    className={`form-input ${errores.nombreAlumno ? 'form-input--error' : ''}`}
                    type="text"
                    placeholder="Nombre y apellido"
                    value={datosFormulario.nombreAlumno}
                    onChange={(e) => handleChange('nombreAlumno', e.target.value)}
                  />
                  {errores.nombreAlumno && <p className="form-error" data-testid="reg-error-student-name">{errores.nombreAlumno}</p>}
                </div>
                <div className="form-grupo">
                  <label htmlFor="reg-student-dni" className="form-label">DNI DEL ALUMNO</label>
                  <input
                    id="reg-student-dni"
                    data-testid="reg-student-dni"
                    className={`form-input ${errores.dniAlumno ? 'form-input--error' : ''}`}
                    type="text"
                    placeholder="Número de documento"
                    value={datosFormulario.dniAlumno}
                    onChange={(e) => handleChange('dniAlumno', e.target.value)}
                  />
                  {errores.dniAlumno && <p className="form-error" data-testid="reg-error-student-dni">{errores.dniAlumno}</p>}
                </div>
                <div className="form-grupo form-grupo--full">
                  <label htmlFor="reg-student-birthdate" className="form-label">FECHA DE NACIMIENTO</label>
                  <input
                    id="reg-student-birthdate"
                    data-testid="reg-student-birthdate"
                    className={`form-input ${errores.fechaNacimiento ? 'form-input--error' : ''}`}
                    type="date"
                    min={obtenerLimitesFechaPorNivel(datosFormulario.nivel).min}
                    max={obtenerLimitesFechaPorNivel(datosFormulario.nivel).max}
                    value={datosFormulario.fechaNacimiento}
                    onChange={(e) => handleChange('fechaNacimiento', e.target.value)}
                  />
                  {errores.fechaNacimiento && <p className="form-error" data-testid="reg-error-student-birthdate">{errores.fechaNacimiento}</p>}
                </div>
                <div className="form-grupo form-grupo--full">
                  <label htmlFor="reg-student-observations" className="form-label">OBSERVACIONES / NECESIDADES ESPECIALES</label>
                  <textarea
                    id="reg-student-observations"
                    data-testid="reg-student-observations"
                    className="form-input form-textarea"
                    placeholder="Indicá cualquier información relevante..."
                    value={datosFormulario.observaciones}
                    onChange={(e) => handleChange('observaciones', e.target.value)}
                  />
                </div>
              </div>
            </section>
          )}


          <div className="botones-navegacion">
            {pasoActual > 1 && (
              <button type="button" data-testid="reg-btn-prev" className="btn-anterior" onClick={pasoAnterior}>
                ← Paso Anterior
              </button>
            )}
            {pasoActual < 3 ? (
              <button type="button" data-testid="reg-btn-next" className="btn-siguiente" onClick={siguientePaso}>
                Siguiente Paso →
              </button>
            ) : (
              <button
                type="button"
                data-testid="reg-btn-submit"
                className="btn-finalizar"
                onClick={handleSubmit}
                disabled={isSubmitting}
              >
                {isSubmitting ? 'Enviando...' : 'Finalizar Inscripción ✓'}
              </button>
            )}
          </div>

        </div>
      </main>
      <SuccessModal 
        isOpen={showSuccessModal}
        onClose={() => navigate('/')}
        title="¡Inscripción Exitosa!"
        message="Hemos recibido tus datos correctamente. Nos pondremos en contacto contigo a la brevedad para continuar con el proceso."
        buttonText="Volver al inicio"
        iconBg="bg-green-100"
        iconColor="text-green-600"
      />
    </>
  );
};

export default Registration;
