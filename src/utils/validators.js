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
 * Valida si un número telefónico contiene la cantidad mínima requerida de dígitos.
 * @param {string} phone
 * @param {number} minDigits - Cantidad mínima de dígitos esperados (por defecto 8).
 * @returns {boolean}
 */
export const isValidPhone = (phone, minDigits = 8) => {
  const digitsOnly = sanitizeDigitsOnly(phone);
  return digitsOnly.length >= minDigits;
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
 * Sanitiza una cadena de teléfono permitiendo únicamente dígitos, +, guiones y espacios.
 * @param {string} value
 * @returns {string}
 */
export const sanitizePhoneNumber = (value) => {
  return String(value || '').replace(/[^0-9+\-\s]/g, '');
};
