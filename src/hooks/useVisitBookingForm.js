import { useState } from 'react';

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@.]+$/;

const INITIAL_FORM_DATA = {
  name: '',
  email: '',
  date: '',
  level: '',
};

export const useVisitBookingForm = (initialLevel = '') => {
  const [formData, setFormData] = useState(() => ({
    ...INITIAL_FORM_DATA,
    level: initialLevel || '',
  }));
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  };

  const handleBookingSubmit = (e) => {
    if (e?.preventDefault) e.preventDefault();
    const newErrors = {};

    if (!formData.name.trim()) {
      newErrors.name = 'El nombre completo es requerido.';
    }
    if (!formData.email) {
      newErrors.email = 'El correo electrónico es requerido.';
    } else if (!EMAIL_REGEX.test(formData.email)) {
      newErrors.email = 'Introduce un correo válido.';
    }
    if (!formData.date) {
      newErrors.date = 'Debes seleccionar una fecha para la visita.';
    }
    if (!formData.level) {
      newErrors.level = 'Selecciona el nivel educativo de interés.';
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return false;
    }

    setIsSubmitting(true);
    setErrors({});

    setTimeout(() => {
      setIsSubmitting(false);
      setSubmitSuccess(true);
      setFormData({ ...INITIAL_FORM_DATA, level: initialLevel || '' });
    }, 1500);

    return true;
  };

  const handleCloseSuccess = (onCloseModal) => {
    setSubmitSuccess(false);
    if (typeof onCloseModal === 'function') {
      onCloseModal();
    }
  };

  return {
    formData,
    setFormData,
    errors,
    setErrors,
    isSubmitting,
    submitSuccess,
    setSubmitSuccess,
    handleInputChange,
    handleBookingSubmit,
    handleCloseSuccess,
  };
};

export default useVisitBookingForm;
