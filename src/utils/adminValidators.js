/**
 * Lógica pura de validación para los formularios y acciones del Panel de Administración.
 * Cada función retorna un string con el mensaje de error o null si los datos son válidos.
 */

/**
 * Valida los datos requeridos para la creación de un tutor y sus alumnos asociados.
 * @param {Object} parentData - Datos del tutor ({ parentEmail, parentName, parentDni }).
 * @param {Array} studentsList - Lista de estudiantes a registrar.
 * @returns {string|null} Mensaje de error o null si es válido.
 */
export const validateParentAndStudentsForm = (parentData, studentsList) => {
  const { parentEmail, parentName, parentDni } = parentData || {};

  if (!parentEmail?.trim() || !parentName?.trim() || !parentDni?.trim()) {
    return 'Por favor, completa todos los datos del tutor (nombre, email y DNI).';
  }

  if (!Array.isArray(studentsList) || studentsList.length === 0) {
    return 'Debes incluir al menos un estudiante.';
  }

  for (const student of studentsList) {
    if (!student.nombre?.trim() || !student.dni?.trim() || !student.fechaNacimiento || !student.genero) {
      return 'Por favor, completa todos los datos de los estudiantes (incluyendo género).';
    }
  }

  return null;
};

/**
 * Valida los datos requeridos para la creación de un usuario administrativo / staff.
 * @param {Object} adminData - Datos del usuario ({ adminEmail, adminName, adminRole, adminDni }).
 * @returns {string|null} Mensaje de error o null si es válido.
 */
export const validateAdminUserForm = (adminData) => {
  const { adminEmail, adminName, adminRole, adminDni } = adminData || {};

  if (!adminEmail?.trim() || !adminName?.trim() || !adminRole || !adminDni?.trim()) {
    return 'Por favor, completa todos los campos del formulario (incluyendo DNI).';
  }

  return null;
};

/**
 * Valida que el DNI esté presente para solicitar el restablecimiento de contraseña.
 * @param {string} userDni - DNI del usuario a restablecer.
 * @returns {string|null} Mensaje de error o null si es válido.
 */
export const validateResetPasswordDni = (userDni) => {
  if (!userDni || !String(userDni).trim()) {
    return 'Error: El DNI del usuario es requerido para el restablecimiento.';
  }
  return null;
};
