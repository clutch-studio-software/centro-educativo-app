/**
 * Expresión regular estándar para la validación de direcciones de correo electrónico.
 */
export const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/**
 * Valida si una cadena de texto corresponde a un formato de correo electrónico válido.
 * @param {string} email
 * @returns {boolean}
 */
export const isValidEmail = (email) => {
  return EMAIL_REGEX.test(String(email || '').trim());
};

/**
 * Valida si un número telefónico contiene exactamente 10 u 11 dígitos numéricos.
 * @param {string} phone
 * @param {number} minDigits - Cantidad mínima de dígitos (por defecto 10).
 * @param {number} maxDigits - Cantidad máxima de dígitos (por defecto 11).
 * @returns {boolean}
 */
export const isValidPhone = (phone, minDigits = 10, maxDigits = 11) => {
  const digitsOnly = sanitizeDigitsOnly(phone);
  return digitsOnly.length >= minDigits && digitsOnly.length <= maxDigits;
};

/**
 * Valida que un número de DNI esté dentro del rango de longitud esperado.
 * @param {string} dni
 * @param {number} minDigits - Longitud mínima (por defecto 7).
 * @param {number} maxDigits - Longitud máxima (por defecto 9).
 * @returns {boolean}
 */
export const isValidDni = (dni, minDigits = 7, maxDigits = 9) => {
  const digitsOnly = sanitizeDigitsOnly(dni);
  return digitsOnly.length >= minDigits && digitsOnly.length <= maxDigits;
};

/**
 * Sanitiza una cadena conservando únicamente los dígitos numéricos (0-9).
 * @param {string} value
 * @returns {string}
 */
export const sanitizeDigitsOnly = (value) => {
  return String(value || '').replace(/\D/g, '');
};

/**
 * Formatea un número de DNI con puntos separadores de miles (XX.XXX.XXX o X.XXX.XXX).
 * Limpia cualquier caracter no numérico previo y aplica el formato de puntos automáticamente.
 * @param {string|number} value
 * @returns {string}
 */
export const formatDni = (value) => {
  if (!value) return '';
  const digits = sanitizeDigitsOnly(value).slice(0, 8);
  return digits.replace(/\B(?=(\d{3})+(?!\d))/g, '.');
};

/**
 * Sanitiza una cadena de teléfono permitiendo únicamente dígitos numéricos hasta un máximo de 11 dígitos.
 * @param {string} value
 * @param {number} maxDigits - Máximo de dígitos permitidos (por defecto 11).
 * @returns {string}
 */
export const sanitizePhoneNumber = (value, maxDigits = 11) => {
  return sanitizeDigitsOnly(value).slice(0, maxDigits);
};


/**
 * Límites de edad por nivel educativo.
 * - Nivel Inicial: 2 a 5 años al momento de inscribirse (salas de 2 a 5 años).
 * - Nivel Primario: 6 a 12 años, con 1 o 2 años de tolerancia por repitencia (6 a 14 años).
 * - Nivel Secundario: 12/13 a 18 años, con 1 o 2 años de tolerancia por repitencia (12 a 20 años).
 */
export const EDAD_LIMITES_POR_NIVEL = {
  inicial: {
    min: 2,
    max: 5,
    nombre: 'Nivel Inicial',
    descripcion: 'entre 2 y 5 años cumplidos',
  },
  primaria: {
    min: 6,
    max: 14,
    nombre: 'Nivel Primario',
    descripcion: 'entre 6 y 14 años (incluye hasta 2 años de tolerancia por repitencia)',
  },
  primario: {
    min: 6,
    max: 14,
    nombre: 'Nivel Primario',
    descripcion: 'entre 6 y 14 años (incluye hasta 2 años de tolerancia por repitencia)',
  },
  secundaria: {
    min: 12,
    max: 20,
    nombre: 'Nivel Secundario',
    descripcion: 'entre 12 y 20 años (incluye hasta 2 años de tolerancia por repitencia)',
  },
  secundario: {
    min: 12,
    max: 20,
    nombre: 'Nivel Secundario',
    descripcion: 'entre 12 y 20 años (incluye hasta 2 años de tolerancia por repitencia)',
  },
};

/**
 * Calcula la edad en años a partir de una fecha de nacimiento (cadena YYYY-MM-DD o Date).
 * @param {string|Date} fechaNacimiento
 * @returns {number|null}
 */
export const calcularEdad = (fechaNacimiento) => {
  if (!fechaNacimiento) return null;
  const nacimiento = new Date(fechaNacimiento);
  if (isNaN(nacimiento.getTime())) return null;

  const hoy = new Date();
  let edad = hoy.getFullYear() - nacimiento.getFullYear();
  const mesDiff = hoy.getMonth() - nacimiento.getMonth();
  if (mesDiff < 0 || (mesDiff === 0 && hoy.getDate() < nacimiento.getDate())) {
    edad--;
  }
  return edad;
};

/**
 * Valida si la fecha de nacimiento ingresada corresponde a la edad permitida para el nivel educativo.
 * @param {string|Date} fechaNacimiento
 * @param {string} nivel - 'inicial', 'primario' / 'primaria', 'secundario' / 'secundaria'
 * @returns {{ esValido: boolean, edad: number|null, error?: string }}
 */
export const validarEdadPorNivel = (fechaNacimiento, nivel) => {
  if (!fechaNacimiento) {
    return { esValido: false, edad: null, error: 'La fecha de nacimiento es obligatoria.' };
  }

  const edad = calcularEdad(fechaNacimiento);
  if (edad === null || isNaN(edad) || edad < 0 || edad > 100) {
    return { esValido: false, edad: null, error: 'Por favor ingresa una fecha de nacimiento válida.' };
  }

  const claveNivel = String(nivel || '').trim().toLowerCase();
  const limites = EDAD_LIMITES_POR_NIVEL[claveNivel];

  if (!limites) {
    return { esValido: true, edad };
  }

  if (edad < limites.min || edad > limites.max) {
    return {
      esValido: false,
      edad,
      error: `Para ${limites.nombre}, el alumno debe tener ${limites.descripcion}. Edad calculada: ${edad} años.`,
    };
  }

  return { esValido: true, edad };
};

/**
 * Obtiene los límites de fecha mínimo y máximo en formato YYYY-MM-DD para inputs de tipo date según el nivel.
 * @param {string} nivel
 * @returns {{ min: string, max: string }}
 */
export const obtenerLimitesFechaPorNivel = (nivel) => {
  const hoy = new Date();
  const formato = (d) => d.toISOString().split('T')[0];
  const clave = String(nivel || '').toLowerCase();
  const limites = EDAD_LIMITES_POR_NIVEL[clave];

  if (!limites) {
    return { min: '', max: '' };
  }

  const maxDate = new Date(hoy.getFullYear() - limites.min, hoy.getMonth(), hoy.getDate());
  const minDate = new Date(hoy.getFullYear() - (limites.max + 1), hoy.getMonth(), hoy.getDate() + 1);

  return {
    min: formato(minDate),
    max: formato(maxDate),
  };
};



