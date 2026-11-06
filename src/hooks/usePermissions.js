import { useMemo } from 'react';
import { useAuth } from '../context/AuthContext';
import { DEFAULT_ROLE_PERMISSIONS } from '../data/mockUsersRbac';
import { normalizeRole } from '../components/admin/users/userRbacConstants';

/**
 * Hook centralizado para la verificación efectiva de permisos institucionales (RBAC).
 * Permite controlar accesos a botones, paneles y vistas según el rol y privilegios activos.
 */
export const usePermissions = () => {
  const { user } = useAuth();

  const userRoleRaw = String(user?.rol || user?.role || 'Directivo');
  const role = normalizeRole(userRoleRaw);

  const isSuperadmin =
    userRoleRaw.toLowerCase() === 'user_admin' ||
    String(user?.email || '').toLowerCase() === 'admin@centroeducativo.edu.ar';

  const isDirectivo = role === 'Directivo' || isSuperadmin;
  const isAdministrativo = role === 'Administrativo';
  const isDocente = role === 'Docente';
  const isEnfermeria = role === 'Enfermeria';
  const isPreceptoria = role === 'Preceptoria';

  const permissionsSet = useMemo(() => {
    if (isSuperadmin || role === 'Directivo') {
      return new Set(DEFAULT_ROLE_PERMISSIONS.Directivo || []);
    }
    const defaultList = DEFAULT_ROLE_PERMISSIONS[role] || [];
    const customList = Array.isArray(user?.permisos || user?.permissions)
      ? user.permisos || user.permissions
      : [];
    return new Set([...defaultList, ...customList]);
  }, [isSuperadmin, role, user]);

  const hasPermission = useMemo(
    () => (permId) => {
      if (isSuperadmin || role === 'Directivo') return true;
      if (!permId) return true;
      return permissionsSet.has(permId);
    },
    [isSuperadmin, role, permissionsSet]
  );

  const hasAnyPermission = useMemo(
    () => (permIds = []) => {
      if (isSuperadmin || role === 'Directivo') return true;
      if (!Array.isArray(permIds) || permIds.length === 0) return true;
      return permIds.some((p) => permissionsSet.has(p));
    },
    [isSuperadmin, role, permissionsSet]
  );

  const hasAllPermissions = useMemo(
    () => (permIds = []) => {
      if (isSuperadmin || role === 'Directivo') return true;
      if (!Array.isArray(permIds) || permIds.length === 0) return true;
      return permIds.every((p) => permissionsSet.has(p));
    },
    [isSuperadmin, role, permissionsSet]
  );

  return {
    user,
    role,
    userRole: userRoleRaw,
    isSuperadmin,
    isDirectivo,
    isAdministrativo,
    isDocente,
    isEnfermeria,
    isPreceptoria,
    permissions: Array.from(permissionsSet),
    hasPermission,
    hasAnyPermission,
    hasAllPermissions,
    // Permisos de alto nivel para UI
    canManageStudents: hasPermission('alumnos.crear') || hasPermission('alumnos.editar'),
    canDeleteStudents: hasPermission('alumnos.eliminar'),
    canManageTeachers: hasPermission('docentes.gestionar'),
    canManageAcademicOffer: hasPermission('academico.crear_editar_oferta'),
    canManageSubjects: hasPermission('academico.gestionar_planes_materias'),
    canViewMedicalRecords: hasPermission('enfermeria.ver_fichas'),
    canRegisterMedicalAttention: hasPermission('enfermeria.registrar_atencion'),
    canRegisterAttendance: hasPermission('preceptoria.asistencia_general'),
    canRegisterDisciplinaryNotes: hasPermission('preceptoria.sanciones'),
    canManageFinances: hasPermission('finanzas.cobranzas'),
    canManageUsers: hasPermission('usuarios.administrar'),
    canViewReports: hasPermission('reportes.ver') || isDirectivo || isAdministrativo,
  };
};

export default usePermissions;
