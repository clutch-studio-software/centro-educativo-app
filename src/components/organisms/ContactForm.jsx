import React, { useState } from 'react';
import Icon from '../atoms/Icon';
import '../../styles/Contact.css';
import { isValidEmail, isValidPhone, sanitizePhoneNumber } from '../../utils/validators';

const ContactForm = () => {
  const GOOGLE_SHEETS_URL = import.meta.env.VITE_CONTACT_FORM_SHEETS_URL || '';

  const [formData, setFormData] = useState({
    nombre: '',
    telefono: '',
    email: '',
    asunto: 'Inscripciones Ciclo Lectivo',
    mensaje: '',
  });

  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (e) => {
    const { id, value } = e.target;
    let nuevoValor = value;

    if (id === 'telefono') {
      nuevoValor = sanitizePhoneNumber(value);
    }

    setFormData((prev) => ({
      ...prev,
      [id]: nuevoValor,
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (
      !formData.nombre.trim() ||
      !formData.email.trim() ||
      !formData.mensaje.trim()
    ) {
      alert(
        'Por favor, completa los campos requeridos (Nombre, Correo Electrónico y Mensaje).'
      );
      return;
    }

    if (!isValidEmail(formData.email)) {
      alert('Por favor, ingresa un correo electrónico válido.');
      return;
    }

    if (formData.telefono.trim() && !isValidPhone(formData.telefono)) {
      alert('Por favor, ingresa un número de teléfono válido (mínimo 8 dígitos).');
      return;
    }

    setIsSubmitting(true);

    if (GOOGLE_SHEETS_URL) {
      const params = new URLSearchParams();
      params.append('nombre', formData.nombre);
      params.append('telefono', formData.telefono);
      params.append('email', formData.email);
      params.append('asunto', formData.asunto);
      params.append('mensaje', formData.mensaje);

      fetch(GOOGLE_SHEETS_URL, {
        method: 'POST',
        mode: 'no-cors',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: params.toString(),
      })
        .then(() => {
          alert(
            `¡Gracias ${formData.nombre}! Tu consulta sobre "${formData.asunto}" fue enviada con éxito.`
          );
          setFormData({
            nombre: '',
            telefono: '',
            email: '',
            asunto: 'Inscripciones Ciclo Lectivo',
            mensaje: '',
          });
        })
        .catch((error) => {
          console.error('Error:', error);
          alert('Hubo un error al enviar el mensaje. Inténtalo de nuevo.');
        })
        .finally(() => {
          setIsSubmitting(false);
        });
    } else {
      setTimeout(() => {
        alert(
          `¡Gracias ${formData.nombre}! Recibimos tu consulta sobre "${formData.asunto}". Nos comunicaremos a la brevedad.`
        );
        setFormData({
          nombre: '',
          telefono: '',
          email: '',
          asunto: 'Inscripciones Ciclo Lectivo',
          mensaje: '',
        });
        setIsSubmitting(false);
      }, 1500);
    }
  };

  return (
    <div className="contact-form-card">
      <div className="contact-form-bg-decorator" />
      <h2 className="contact-form-title">Envíanos un mensaje</h2>
      <p className="contact-form-subtitle">
        Completa el formulario y nos pondremos en contacto contigo a la
        brevedad.
      </p>

      <form className="contact-form-element" onSubmit={handleSubmit}>
        <div className="contact-form-row">
          <div className="contact-form-group">
            <label className="contact-form-label" htmlFor="nombre">
              Nombre Completo <span className="required-star">*</span>
            </label>
            <input
              type="text"
              id="nombre"
              className="contact-form-input"
              placeholder="Ej. Ana García"
              value={formData.nombre}
              onChange={handleChange}
              required
            />
          </div>

          <div className="contact-form-group">
            <label className="contact-form-label" htmlFor="telefono">
              Teléfono / WhatsApp
            </label>
            <input
              type="tel"
              id="telefono"
              className="contact-form-input"
              placeholder="+54 362..."
              value={formData.telefono}
              onChange={handleChange}
            />
          </div>
        </div>

        <div className="contact-form-group">
          <label className="contact-form-label" htmlFor="email">
            Correo Electrónico <span className="required-star">*</span>
          </label>
          <input
            type="email"
            id="email"
            className="contact-form-input"
            placeholder="ana@ejemplo.com"
            value={formData.email}
            onChange={handleChange}
            required
          />
        </div>

        <div className="contact-form-group">
          <label className="contact-form-label" htmlFor="asunto">
            Motivo de la consulta
          </label>
          <div className="contact-select-wrapper">
            <select
              id="asunto"
              className="contact-form-select"
              value={formData.asunto}
              onChange={handleChange}
            >
              <option value="Inscripciones Ciclo Lectivo">
                Inscripciones Ciclo Lectivo
              </option>
              <option value="Información General">Información General</option>
              <option value="Trabaja con nosotros">Trabaja con nosotros</option>
              <option value="Otro">Otro</option>
            </select>
          </div>
        </div>

        <div className="contact-form-group">
          <label className="contact-form-label" htmlFor="mensaje">
            Mensaje <span className="required-star">*</span>
          </label>
          <textarea
            id="mensaje"
            className="contact-form-textarea"
            placeholder="Escribe tu consulta aquí..."
            rows="4"
            value={formData.mensaje}
            onChange={handleChange}
            required
          ></textarea>
        </div>

        <div className="contact-form-actions">
          <button
            type="submit"
            className="contact-btn-submit"
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <span>Enviando...</span>
            ) : (
              <>
                <span>Enviar Mensaje</span>
                <Icon name="send" className="text-xl" />
              </>
            )}
          </button>

          <a
            href="https://wa.me/543624123456"
            target="_blank"
            rel="noopener noreferrer"
            className="contact-btn-whatsapp"
          >
            <Icon name="forum" className="text-xl" />
            <span>WhatsApp Directo</span>
          </a>
        </div>
      </form>
    </div>
  );
};

export default ContactForm;
