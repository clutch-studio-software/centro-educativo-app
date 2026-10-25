import React, { useState, useEffect } from 'react';
import {
  RBAC_ROLES,
  USER_ESTADOS,
  DOCENTE_CONDICIONES,
  PERMISSION_MODULES,
  validateUserForm,
} from './userRbacConstants';
import { formatDni } from '../../../utils/validators';

const EditUserModal = ({
  isOpen,
  user,
  rolePermissions = {},
  onClose,
  onSave,
}) => {
  const [formData, setFormData] = useState({
    nombre: '',
    apellido: '',
    email: '',
    dni: '',
    telefono: '',
    role: 'Directivo',
    cargo: '',
    condicion: 'Titular',
    estado: 'Activo',
    customPermissions: [],
  });
  const [activeTab, setActiveTab] = useState('general'); // 'general' | 'permissions'
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (user && isOpen) {
      const rawEstado = String(user.estado || '').trim();
      const isRevista = ['titular', 'interino', 'suplente'].includes(rawEstado.toLowerCase());
      const userCondicion = user.condicion || (isRevista ? rawEstado.charAt(0).toUpperCase() + rawEstado.slice(1).toLowerCase() : 'Titular');
      const userEstado = isRevista ? 'Activo' : (rawEstado || 'Activo');

      setFormData({
        nombre: user.nombre || '',
        apellido: user.apellido || '',
        email: user.email || '',
        dni: user.dni || '',
        telefono: user.telefono || '',
        role: user.role || 'Directivo',
        cargo: user.cargo || '',
        condicion: userCondicion,
        estado: userEstado,
        customPermissions: user.customPermissions || [],
      });
      setActiveTab('general');
      setErrors({});
      setIsSubmitting(false);
    }
  }, [user, isOpen]);

  if (!isOpen || !user) return null;

  const handleChange = (e) => {
    const { name, value } = e.target;
    let nextValue = value;

    if (name === 'dni') {
      nextValue = formatDni(value);
    }

    setFormData((prev) => ({ ...prev, [name]: nextValue }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: null }));
    }
  };

  const handleToggleCustomPermission = (permId) => {
    setFormData((prev) => {
      const current = prev.customPermissions || [];
      const has = current.includes(permId);
      return {
        ...prev,
        customPermissions: has
          ? current.filter((id) => id !== permId)
          : [...current, permId],
      };
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const validationErrors = validateUserForm(formData);
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      setActiveTab('general');
      return;
    }

    setIsSubmitting(true);
    try {
      await onSave(user.id, {
        ...formData,
        cargo: formData.cargo.trim() || `Personal ${formData.role}`,
      });
      onClose();
    } catch (err) {
      console.error('Error al actualizar usuario:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const rolePerms = rolePermissions[formData.role] || [];

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="edit-user-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200"
    >
      <div className="bg-white rounded-3xl shadow-2xl border border-slate-100 w-full max-w-2xl max-h-[92vh] flex flex-col overflow-hidden animate-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="px-6 py-5 bg-white border-b border-slate-100 flex items-center justify-between gap-4 shrink-0">
          <div className="flex items-center gap-3.5">
            <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-600 text-white flex items-center justify-center shadow-md shadow-blue-500/20 shrink-0">
              <span className="material-symbols-outlined text-[24px]">edit</span>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 id="edit-user-title" className="text-base sm:text-lg font-extrabold text-slate-900">
                  Modificar Usuario ({user.legajo})
                </h2>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                Actualiza datos personales, rol institucional o permisos individuales.
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 hover:text-slate-800 flex items-center justify-center transition-colors cursor-pointer"
          >
            <span className="material-symbols-outlined text-[18px]">close</span>
          </button>
        </div>

        {/* Pestañas internas del modal */}
        <div className="px-6 py-2.5 bg-slate-50/80 border-b border-slate-100 flex items-center gap-2 shrink-0">
          <button
            type="button"
            onClick={() => setActiveTab('general')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              activeTab === 'general'
                ? 'bg-white text-blue-600 shadow-xs border border-slate-200/80'
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            Datos Personales & Cargo
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('permissions')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'permissions'
                ? 'bg-white text-blue-600 shadow-xs border border-slate-200/80'
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            <span>Permisos & Accesos</span>
            <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-blue-50 text-blue-700">
              {rolePerms.length + (formData.customPermissions || []).length}
            </span>
          </button>
        </div>

        {/* Formulario */}
        <form onSubmit={handleSubmit} className="flex flex-col flex-1 overflow-hidden">
          <div className="p-6 overflow-y-auto space-y-4 flex-1">
            {activeTab === 'general' ? (
              <>
                {/* Selector de Rol Institucional */}
                <div className="flex flex-col gap-1.5">
                  <label htmlFor="edit-user-role" className="text-xs font-bold text-slate-700">
                    Rol Institucional Asignado *
                  </label>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                    {RBAC_ROLES.map((role) => {
                      const isSelected = formData.role === role.id;
                      return (
                        <button
                          key={role.id}
                          type="button"
                          onClick={() => setFormData((p) => ({ ...p, role: role.id }))}
                          className={`flex items-center gap-2 px-3 py-2.5 rounded-xl border text-xs font-bold transition-all cursor-pointer text-left ${
                            isSelected
                              ? 'bg-blue-50 border-blue-500 text-blue-900 shadow-xs ring-1 ring-blue-500/30'
                              : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
                          }`}
                        >
                          <span className="material-symbols-outlined text-[18px] text-blue-600">
                            {role.icon}
                          </span>
                          <span>{role.name}</span>
                        </button>
                      );
                    })}
                  </div>
                  {errors.role && (
                    <span className="text-[11px] text-red-500 font-medium px-2">{errors.role}</span>
                  )}
                </div>

                {/* Nombre y Apellido */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="flex flex-col gap-1.5">
                    <label htmlFor="edit-user-nombre" className="text-xs font-bold text-slate-700">
                      Nombre *
                    </label>
                    <input
                      id="edit-user-nombre"
                      type="text"
                      name="nombre"
                      value={formData.nombre}
                      onChange={handleChange}
                      className={`bg-slate-50 px-4 py-2.5 rounded-full text-xs font-medium text-slate-800 focus:outline-none focus:bg-white border ${
                        errors.nombre ? 'border-red-500' : 'border-slate-200 focus:border-blue-500'
                      }`}
                    />
                    {errors.nombre && (
                      <span className="text-[11px] text-red-500 font-medium px-2">{errors.nombre}</span>
                    )}
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <label htmlFor="edit-user-apellido" className="text-xs font-bold text-slate-700">
                      Apellido *
                    </label>
                    <input
                      id="edit-user-apellido"
                      type="text"
                      name="apellido"
                      value={formData.apellido}
                      onChange={handleChange}
                      className={`bg-slate-50 px-4 py-2.5 rounded-full text-xs font-medium text-slate-800 focus:outline-none focus:bg-white border ${
                        errors.apellido ? 'border-red-500' : 'border-slate-200 focus:border-blue-500'
                      }`}
                    />
                    {errors.apellido && (
                      <span className="text-[11px] text-red-500 font-medium px-2">{errors.apellido}</span>
                    )}
                  </div>
                </div>

                {/* DNI y Teléfono */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="flex flex-col gap-1.5">
                    <label htmlFor="edit-user-dni" className="text-xs font-bold text-slate-700">
                      DNI *
                    </label>
                    <input
                      id="edit-user-dni"
                      type="text"
                      name="dni"
                      value={formData.dni}
                      onChange={handleChange}
                      className={`bg-slate-50 px-4 py-2.5 rounded-full text-xs font-medium text-slate-800 focus:outline-none focus:bg-white border ${
                        errors.dni ? 'border-red-500' : 'border-slate-200 focus:border-blue-500'
                      }`}
                    />
                    {errors.dni && (
                      <span className="text-[11px] text-red-500 font-medium px-2">{errors.dni}</span>
                    )}
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <label htmlFor="edit-user-telefono" className="text-xs font-bold text-slate-700">
                      Teléfono
                    </label>
                    <input
                      id="edit-user-telefono"
                      type="text"
                      name="telefono"
                      value={formData.telefono}
                      onChange={handleChange}
                      className="bg-slate-50 px-4 py-2.5 rounded-full text-xs font-medium text-slate-800 focus:outline-none focus:bg-white border border-slate-200 focus:border-blue-500"
                    />
                  </div>
                </div>

                {/* Email */}
                <div className="flex flex-col gap-1.5">
                  <label htmlFor="edit-user-email" className="text-xs font-bold text-slate-700">
                    Correo Electrónico Institucional *
                  </label>
                  <input
                    id="edit-user-email"
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    className={`bg-slate-50 px-4 py-2.5 rounded-full text-xs font-medium text-slate-800 focus:outline-none focus:bg-white border ${
                      errors.email ? 'border-red-500' : 'border-slate-200 focus:border-blue-500'
                    }`}
                  />
                  {errors.email && (
                    <span className="text-[11px] text-red-500 font-medium px-2">{errors.email}</span>
                  )}
                </div>

                {/* Cargo y Estado */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="flex flex-col gap-1.5">
                    <label htmlFor="edit-user-cargo" className="text-xs font-bold text-slate-700">
                      Cargo / Función Desempeñada
                    </label>
                    <input
                      id="edit-user-cargo"
                      type="text"
                      name="cargo"
                      value={formData.cargo}
                      onChange={handleChange}
                      className="bg-slate-50 px-4 py-2.5 rounded-full text-xs font-medium text-slate-800 focus:outline-none focus:bg-white border border-slate-200 focus:border-blue-500"
                    />
                  </div>

                  {formData.role === 'Docente' ? (
                    <div className="flex flex-col gap-1.5">
                      <label htmlFor="edit-user-condicion" className="text-xs font-bold text-slate-700">
                        Condición Docente / Revista *
                      </label>
                      <select
                        id="edit-user-condicion"
                        name="condicion"
                        value={formData.condicion || 'Titular'}
                        onChange={handleChange}
                        className="bg-slate-50 px-4 py-2.5 rounded-full text-xs font-medium text-slate-800 focus:outline-none focus:bg-white border border-slate-200 focus:border-blue-500 cursor-pointer"
                      >
                        {DOCENTE_CONDICIONES.map((c) => (
                          <option key={c} value={c}>
                            {c}
                          </option>
                        ))}
                      </select>
                    </div>
                  ) : (
                    <div className="flex flex-col gap-1.5">
                      <label htmlFor="edit-user-estado" className="text-xs font-bold text-slate-700">
                        Estado de la Cuenta
                      </label>
                      <select
                        id="edit-user-estado"
                        name="estado"
                        value={formData.estado}
                        onChange={handleChange}
                        className="bg-slate-50 px-4 py-2.5 rounded-full text-xs font-medium text-slate-800 focus:outline-none focus:bg-white border border-slate-200 focus:border-blue-500 cursor-pointer"
                      >
                        {USER_ESTADOS.map((est) => (
                          <option key={est} value={est}>
                            {est}
                          </option>
                        ))}
                      </select>
                    </div>
                  )}
                </div>

                {formData.role === 'Docente' && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="flex flex-col gap-1.5">
                      <label htmlFor="edit-user-estado" className="text-xs font-bold text-slate-700">
                        Estado de la Cuenta
                      </label>
                      <select
                        id="edit-user-estado"
                        name="estado"
                        value={formData.estado}
                        onChange={handleChange}
                        className="bg-slate-50 px-4 py-2.5 rounded-full text-xs font-medium text-slate-800 focus:outline-none focus:bg-white border border-slate-200 focus:border-blue-500 cursor-pointer"
                      >
                        {USER_ESTADOS.map((est) => (
                          <option key={est} value={est}>
                            {est}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                )}
              </>
            ) : (
              /* Pestaña de Permisos */
              <div className="space-y-4">
                <div className="p-3.5 bg-blue-50 rounded-2xl border border-blue-100 flex items-start gap-3">
                  <span className="material-symbols-outlined text-[20px] text-blue-600 shrink-0">
                    shield
                  </span>
                  <div className="text-xs text-blue-900 leading-relaxed">
                    Este usuario hereda automáticamente los <strong className="font-bold">{rolePerms.length} permisos</strong> correspondientes al rol <strong className="font-bold">{formData.role}</strong>. Puedes habilitar privilegios adicionales individuales debajo.
                  </div>
                </div>

                <div className="space-y-4">
                  {PERMISSION_MODULES.map((mod) => (
                    <div
                      key={mod.id}
                      className="bg-slate-50/70 p-4 rounded-2xl border border-slate-200/80"
                    >
                      <h4 className="text-xs font-extrabold text-slate-800 flex items-center gap-2 mb-2">
                        <span className="material-symbols-outlined text-[16px] text-blue-600">
                          {mod.icon}
                        </span>
                        <span>{mod.title}</span>
                      </h4>

                      <div className="space-y-2">
                        {mod.permissions.map((perm) => {
                          const isInherited = rolePerms.includes(perm.id);
                          const isCustom = (formData.customPermissions || []).includes(perm.id);

                          return (
                            <label
                              key={perm.id}
                              className={`flex items-start justify-between gap-3 p-2 rounded-xl text-xs transition-colors cursor-pointer ${
                                isInherited
                                  ? 'bg-white/80 opacity-90'
                                  : isCustom
                                    ? 'bg-blue-50/80 border border-blue-200'
                                    : 'bg-white hover:bg-slate-100'
                              }`}
                            >
                              <div>
                                <span className="font-bold text-slate-800 block">
                                  {perm.label}
                                </span>
                                <span className="text-[11px] text-slate-500">
                                  {perm.description}
                                </span>
                              </div>

                              <div className="shrink-0 flex items-center gap-2">
                                {isInherited ? (
                                  <span className="px-2 py-0.5 rounded-full text-[9px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                                    Heredado
                                  </span>
                                ) : (
                                  <input
                                    type="checkbox"
                                    checked={isCustom}
                                    onChange={() => handleToggleCustomPermission(perm.id)}
                                    className="w-4 h-4 rounded text-blue-600 focus:ring-blue-500 cursor-pointer"
                                  />
                                )}
                              </div>
                            </label>
                          );
                        })}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="px-6 py-4 bg-white border-t border-slate-100 flex items-center justify-end gap-3 shrink-0">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="px-5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-full font-bold text-xs transition-colors cursor-pointer"
            >
              Cancelar
            </button>

            <button
              type="submit"
              disabled={isSubmitting}
              className="inline-flex items-center gap-2 px-6 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white rounded-full font-bold text-xs shadow-md shadow-blue-500/20 active:scale-95 transition-all cursor-pointer disabled:opacity-50"
            >
              {isSubmitting ? (
                <>
                  <span className="material-symbols-outlined text-[16px] animate-spin">sync</span>
                  <span>Guardando...</span>
                </>
              ) : (
                <>
                  <span className="material-symbols-outlined text-[16px]">save</span>
                  <span>Guardar Cambios</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditUserModal;
