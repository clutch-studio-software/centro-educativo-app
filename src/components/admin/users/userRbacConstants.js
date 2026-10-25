import { isValidEmail, isValidPhone, isValidDni } from '../../../utils/validators';
import { RBAC_ROLES, PERMISSION_MODULES, DEFAULT_ROLE_PERMISSIONS } from '../../../data/mockUsersRbac';

export { RBAC_ROLES, PERMISSION_MODULES, DEFAULT_ROLE_PERMISSIONS };

export const USER_ESTADOS = ['Activo', 'Inactivo', 'Suspendido'];

/**
 * Normaliza un rol proveniente de Firestore o Auth a uno de los 5 roles canónicos:
 * 'Directivo', 'Administrativo', 'Docente', 'Enfermeria', 'Preceptoria'.
 */
export const normalizeRole = (roleStr = '') => {
  const norm = String(roleStr || '').trim().toLowerCase();
  if (['directivo', 'user_admin', 'administrador', 'admin', 'director'].includes(norm)) {
    return 'Directivo';
  }
  if (['administrativo', 'staff', 'secretaria', 'secretaría', 'administracion', 'administración'].includes(norm)) {
    return 'Administrativo';
  }
  if (['docente', 'teacher', 'profesor', 'profesora', 'maestro'].includes(norm)) {
    return 'Docente';
  }
  if (['enfermeria', 'enfermería', 'salud', 'medico', 'médico'].includes(norm)) {
    return 'Enfermeria';
  }
  if (['preceptoria', 'preceptoría', 'preceptor', 'preceptora', 'celador'].includes(norm)) {
    return 'Preceptoria';
  }
  return 'Administrativo';
};

/**
 * Obtiene la configuración visual del rol para badges y etiquetas.
 */
export const getRoleConfig = (role = '') => {
  const normalized = normalizeRole(role);
  const found = RBAC_ROLES.find((r) => r.id === normalized);
  if (found) return found;

  return {
    id: normalized,
    name: normalized,
    displayName: normalized,
    icon: 'person',
    badgeColor: 'slate',
    gradient: 'from-slate-600 to-slate-800',
    description: 'Usuario del sistema institucional.',
  };
};

/**
 * Retorna las clases de Tailwind correspondientes al badge de un rol.
 */
export const getRoleBadge = (role = '') => {
  const normalized = normalizeRole(role);
  switch (normalized) {
    case 'Directivo':
      return {
        label: 'Directivo',
        icon: 'shield_person',
        badgeClass: 'bg-emerald-50 text-emerald-700 border-emerald-200/80',
        dotClass: 'bg-emerald-500',
      };
    case 'Administrativo':
      return {
        label: 'Administrativo',
        icon: 'badge',
        badgeClass: 'bg-blue-50 text-blue-700 border-blue-200/80',
        dotClass: 'bg-blue-500',
      };
    case 'Docente':
      return {
        label: 'Docente',
        icon: 'school',
        badgeClass: 'bg-amber-50 text-amber-700 border-amber-200/80',
        dotClass: 'bg-amber-500',
      };
    case 'Enfermeria':
      return {
        label: 'Enfermería',
        icon: 'medical_services',
        badgeClass: 'bg-rose-50 text-rose-700 border-rose-200/80',
        dotClass: 'bg-rose-500',
      };
    case 'Preceptoria':
      return {
        label: 'Preceptoría',
        icon: 'assignment_ind',
        badgeClass: 'bg-purple-50 text-purple-700 border-purple-200/80',
        dotClass: 'bg-purple-500',
      };
    default:
      return {
        label: role,
        icon: 'person',
        badgeClass: 'bg-slate-50 text-slate-700 border-slate-200/80',
        dotClass: 'bg-slate-500',
      };
  }
};

/**
 * Retorna el badge de estado de un usuario (Activo / Suspendido / Inactivo).
 */
export const getStatusBadge = (estado = '') => {
  const norm = String(estado).toLowerCase().trim();
  switch (norm) {
    case 'activo':
      return {
        label: 'Activo',
        badgeClass: 'bg-emerald-50 text-emerald-700 border-emerald-200',
        dotClass: 'bg-emerald-500',
      };
    case 'suspendido':
      return {
        label: 'Suspendido',
        badgeClass: 'bg-rose-50 text-rose-700 border-rose-200',
        dotClass: 'bg-rose-500',
      };
    case 'inactivo':
      return {
        label: 'Inactivo',
        badgeClass: 'bg-slate-100 text-slate-600 border-slate-200',
        dotClass: 'bg-slate-400',
      };
    default:
      return {
        label: estado || 'Activo',
        badgeClass: 'bg-slate-50 text-slate-700 border-slate-200',
        dotClass: 'bg-slate-400',
      };
  }
};

const AVATAR_GRADIENTS = [
  'from-blue-600 to-indigo-600',
  'from-emerald-500 to-teal-600',
  'from-amber-500 to-orange-500',
  'from-purple-600 to-violet-600',
  'from-rose-500 to-pink-600',
  'from-cyan-500 to-blue-500',
];

export const getAvatarGradient = (id = '') => {
  let hash = 0;
  for (let i = 0; i < id.length; i++) {
    hash = (hash + id.charCodeAt(i)) % AVATAR_GRADIENTS.length;
  }
  return AVATAR_GRADIENTS[hash];
};

export const getInitials = (nombre = '', apellido = '') => {
  const cleanNombre = String(nombre).replace(/^(Prof\.|Ing\.|Lic\.|Dra\.|Dr\.)\s*/i, '').trim();
  const cleanApellido = String(apellido).trim();

  if (cleanNombre && cleanApellido) {
    return `${cleanNombre[0]}${cleanApellido[0]}`.toUpperCase();
  }
  const parts = cleanNombre.split(' ');
  if (parts.length >= 2) {
    return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
  }
  return (parts[0] || 'US').slice(0, 2).toUpperCase();
};

/**
 * Validador para el formulario de alta y edición de usuario.
 */
export const validateUserForm = (formData) => {
  const errors = {};

  if (!formData.nombre?.trim()) {
    errors.nombre = 'El nombre es obligatorio.';
  }

  if (!formData.apellido?.trim()) {
    errors.apellido = 'El apellido es obligatorio.';
  }

  if (!formData.email?.trim()) {
    errors.email = 'El correo electrónico es obligatorio.';
  } else if (!isValidEmail(formData.email)) {
    errors.email = 'Ingresa un correo electrónico con formato válido.';
  }

  if (!formData.dni?.trim()) {
    errors.dni = 'El documento (DNI) es obligatorio.';
  } else if (!isValidDni(formData.dni)) {
    errors.dni = 'El DNI debe tener entre 7 y 9 dígitos.';
  }

  if (formData.telefono?.trim() && !isValidPhone(formData.telefono)) {
    errors.telefono = 'El teléfono debe contener entre 10 y 11 dígitos numéricos.';
  }

  if (!formData.role) {
    errors.role = 'Debes seleccionar un rol para el usuario.';
  }

  return errors;
};
