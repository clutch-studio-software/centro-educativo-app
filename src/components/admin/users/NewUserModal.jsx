import React, { useState } from 'react';
import {
  RBAC_ROLES,
  USER_ESTADOS,
  DOCENTE_CONDICIONES,
  validateUserForm,
} from './userRbacConstants';
import { formatDni } from '../../../utils/validators';

const INITIAL_FORM = {
  nombre: '',
  apellido: '',
  email: '',
  dni: '',
  telefono: '',
  role: 'Directivo',
  cargo: '',
  condicion: 'Titular',
  estado: 'Activo',
};

const NewUserModalContent = ({ activeRole = 'Directivo', onClose, onSubmit }) => {
  const [formData, setFormData] = useState(() => ({
    ...INITIAL_FORM,
    role: activeRole === 'Todos' ? 'Directivo' : activeRole,
  }));
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

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

  const handleSubmit = async (e) => {
    e.preventDefault();
    const validationErrors = validateUserForm(formData);
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    setIsSubmitting(true);
    try {
      await onSubmit({
        ...formData,
        cargo: formData.cargo.trim() || `Personal ${formData.role}`,
      });
      onClose();
    } catch (err) {
      console.error('Error al registrar usuario:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="new-user-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200"
    >
      <div className="bg-white rounded-3xl shadow-2xl border border-slate-100 w-full max-w-2xl max-h-[92vh] flex flex-col overflow-hidden animate-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="px-6 py-5 bg-white border-b border-slate-100 flex items-center justify-between gap-4 shrink-0">
          <div className="flex items-center gap-3.5">
            <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-600 text-white flex items-center justify-center shadow-md shadow-blue-500/20 shrink-0">
              <span className="material-symbols-outlined text-[24px]">person_add</span>
            </div>
            <div>
              <h2 id="new-user-title" className="text-base sm:text-lg font-extrabold text-slate-900">
                Registrar Nuevo Usuario (RBAC)
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Alta institucional de directivos, docentes, administrativos, enfermería y preceptoría.
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

        {/* Formulario */}
        <form onSubmit={handleSubmit} className="flex flex-col flex-1 overflow-hidden">
          <div className="p-6 overflow-y-auto space-y-4 flex-1">
            {/* Aviso informativo de credenciales iniciales */}
            <div className="p-3.5 bg-blue-50/80 rounded-2xl border border-blue-100 flex items-start gap-3">
              <span className="material-symbols-outlined text-[20px] text-blue-600 shrink-0 mt-0.5">
                info
              </span>
              <div className="text-xs text-blue-900 leading-relaxed">
                <span className="font-bold">Credenciales iniciales:</span> La contraseña por defecto del usuario será su número de <strong className="underline">DNI sin puntos</strong>. En su primer inicio de sesión se le solicitará actualizar su contraseña.
              </div>
            </div>

            {/* Selector de Rol Institucional */}
            <div className="flex flex-col gap-1.5">
              <label htmlFor="new-user-role" className="text-xs font-bold text-slate-700">
                Rol Institucional *
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

            {/* Datos Personales: Nombre y Apellido */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="flex flex-col gap-1.5">
                <label htmlFor="new-user-nombre" className="text-xs font-bold text-slate-700">
                  Nombre *
                </label>
                <input
                  id="new-user-nombre"
                  type="text"
                  name="nombre"
                  value={formData.nombre}
                  onChange={handleChange}
                  placeholder="ej. Mariana"
                  className={`bg-slate-50 px-4 py-2.5 rounded-full text-xs font-medium text-slate-800 focus:outline-none focus:bg-white border ${
                    errors.nombre ? 'border-red-500' : 'border-slate-200 focus:border-blue-500'
                  }`}
                />
                {errors.nombre && (
                  <span className="text-[11px] text-red-500 font-medium px-2">{errors.nombre}</span>
                )}
              </div>

              <div className="flex flex-col gap-1.5">
                <label htmlFor="new-user-apellido" className="text-xs font-bold text-slate-700">
                  Apellido *
                </label>
                <input
                  id="new-user-apellido"
                  type="text"
                  name="apellido"
                  value={formData.apellido}
                  onChange={handleChange}
                  placeholder="ej. Valenzuela"
                  className={`bg-slate-50 px-4 py-2.5 rounded-full text-xs font-medium text-slate-800 focus:outline-none focus:bg-white border ${
                    errors.apellido ? 'border-red-500' : 'border-slate-200 focus:border-blue-500'
                  }`}
                />
                {errors.apellido && (
                  <span className="text-[11px] text-red-500 font-medium px-2">{errors.apellido}</span>
                )}
              </div>
            </div>

            {/* Documento DNI y Teléfono */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="flex flex-col gap-1.5">
                <label htmlFor="new-user-dni" className="text-xs font-bold text-slate-700">
                  DNI (Documento Nacional) *
                </label>
                <input
                  id="new-user-dni"
                  type="text"
                  name="dni"
                  value={formData.dni}
                  onChange={handleChange}
                  placeholder="ej. 32.189.440"
                  className={`bg-slate-50 px-4 py-2.5 rounded-full text-xs font-medium text-slate-800 focus:outline-none focus:bg-white border ${
                    errors.dni ? 'border-red-500' : 'border-slate-200 focus:border-blue-500'
                  }`}
                />
                {errors.dni && (
                  <span className="text-[11px] text-red-500 font-medium px-2">{errors.dni}</span>
                )}
              </div>

              <div className="flex flex-col gap-1.5">
                <label htmlFor="new-user-telefono" className="text-xs font-bold text-slate-700">
                  Teléfono de Contacto
                </label>
                <input
                  id="new-user-telefono"
                  type="text"
                  name="telefono"
                  value={formData.telefono}
                  onChange={handleChange}
                  placeholder="ej. +54 9 362 489-1120"
                  className={`bg-slate-50 px-4 py-2.5 rounded-full text-xs font-medium text-slate-800 focus:outline-none focus:bg-white border ${
                    errors.telefono ? 'border-red-500' : 'border-slate-200 focus:border-blue-500'
                  }`}
                />
                {errors.telefono && (
                  <span className="text-[11px] text-red-500 font-medium px-2">{errors.telefono}</span>
                )}
              </div>
            </div>

            {/* Correo Electrónico Institucional */}
            <div className="flex flex-col gap-1.5">
              <label htmlFor="new-user-email" className="text-xs font-bold text-slate-700">
                Correo Electrónico Institucional *
              </label>
              <input
                id="new-user-email"
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="ej. m.valenzuela@educar.edu.ar"
                className={`bg-slate-50 px-4 py-2.5 rounded-full text-xs font-medium text-slate-800 focus:outline-none focus:bg-white border ${
                  errors.email ? 'border-red-500' : 'border-slate-200 focus:border-blue-500'
                }`}
              />
              {errors.email && (
                <span className="text-[11px] text-red-500 font-medium px-2">{errors.email}</span>
              )}
            </div>

            {/* Cargo / Función y Estado */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="flex flex-col gap-1.5">
                <label htmlFor="new-user-cargo" className="text-xs font-bold text-slate-700">
                  Cargo / Función Desempeñada
                </label>
                <input
                  id="new-user-cargo"
                  type="text"
                  name="cargo"
                  value={formData.cargo}
                  onChange={handleChange}
                  placeholder={`ej. Titular de Cátedra, Vicedirección, etc.`}
                  className="bg-slate-50 px-4 py-2.5 rounded-full text-xs font-medium text-slate-800 focus:outline-none focus:bg-white border border-slate-200 focus:border-blue-500"
                />
              </div>

              {/* Si es Docente: Condición de Revista */}
              {formData.role === 'Docente' ? (
                <div className="flex flex-col gap-1.5">
                  <label htmlFor="new-user-condicion" className="text-xs font-bold text-slate-700">
                    Condición Docente / Revista *
                  </label>
                  <select
                    id="new-user-condicion"
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
                  <label htmlFor="new-user-estado" className="text-xs font-bold text-slate-700">
                    Estado de la Cuenta *
                  </label>
                  <select
                    id="new-user-estado"
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

            {/* Si es Docente, mostrar Estado de la Cuenta en su propia fila */}
            {formData.role === 'Docente' && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="flex flex-col gap-1.5">
                  <label htmlFor="new-user-estado" className="text-xs font-bold text-slate-700">
                    Estado de la Cuenta *
                  </label>
                  <select
                    id="new-user-estado"
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
                  <span>Registrando...</span>
                </>
              ) : (
                <>
                  <span className="material-symbols-outlined text-[16px]">check</span>
                  <span>Registrar Usuario</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

const NewUserModal = ({ isOpen, activeRole = 'Directivo', onClose, onSubmit }) => {
  if (!isOpen) return null;

  return (
    <NewUserModalContent
      key={activeRole}
      activeRole={activeRole}
      onClose={onClose}
      onSubmit={onSubmit}
    />
  );
};

export default NewUserModal;
