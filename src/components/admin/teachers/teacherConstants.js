import { isValidEmail, isValidPhone, isValidDni } from '../../../utils/validators';

export const TRATAMIENTOS_DOCENTE = [
  { value: 'Prof.', label: 'Prof. (Profesor/a)' },
  { value: 'Lic.', label: 'Lic. (Licenciado/a)' },
  { value: 'Ing.', label: 'Ing. (Ingeniero/a)' },
  { value: 'Dr.', label: 'Dr. (Doctor)' },
  { value: 'Dra.', label: 'Dra. (Doctora)' },
  { value: 'Mg.', label: 'Mg. (Magíster)' },
  { value: 'Tec.', label: 'Tec. (Técnico/a)' },
  { value: '', label: 'Sin tratamiento' },
];

export const ESTADOS_DOCENTE = [
  'Titular',
  'Suplente',
  'Interino',
  'Suspendido',
];

export const validateTeacherForm = (formData, phoneMsg = 'El teléfono debe tener entre 10 y 11 dígitos numéricos.') => {
  const newErrors = {};
  if (!formData.nombre.trim()) newErrors.nombre = 'El nombre es obligatorio.';
  if (!formData.apellido.trim()) newErrors.apellido = 'El apellido es obligatorio.';

  if (!formData.dni.trim()) {
    newErrors.dni = 'El DNI es obligatorio.';
  } else if (!isValidDni(formData.dni)) {
    newErrors.dni = 'El DNI debe tener entre 7 y 9 dígitos.';
  }

  if (!formData.titulacion.trim()) {
    newErrors.titulacion = 'El título universitario / pedagógico es obligatorio.';
  }

  if (!formData.especialidad.trim()) {
    newErrors.especialidad = 'La especialidad es obligatoria.';
  }

  if (!formData.email.trim()) {
    newErrors.email = 'El correo electrónico es obligatorio.';
  } else if (!isValidEmail(formData.email)) {
    newErrors.email = 'Ingresa un correo electrónico válido.';
  }

  if (!formData.telefono.trim()) {
    newErrors.telefono = 'El teléfono es obligatorio.';
  } else if (!isValidPhone(formData.telefono)) {
    newErrors.telefono = phoneMsg;
  }

  return newErrors;
};

