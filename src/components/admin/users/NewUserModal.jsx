import React, { useState, useRef, useEffect } from 'react';
import {
  RBAC_ROLES,
  USER_ESTADOS,
  DOCENTE_CONDICIONES,
  validateUserForm,
} from './userRbacConstants';
import { formatDni } from '../../../utils/validators';
import UserModalFooter from './UserModalFooter';

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

const NewUserRoleDropdown = ({ role, onChange, error }) => {
  const currentRole = RBAC_ROLES.find((r) => r.id === role) || RBAC_ROLES[0];

  return (
    <div className="flex flex-col gap-1.5">
      <label htmlFor="new-user-role" className="text-[11px] font-bold text-slate-600 uppercase tracking-wider block">
        Rol Institucional *
      </label>
      <div className="relative">
        <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-blue-600">
          <span className="material-symbols-outlined text-[20px]">
            {currentRole?.icon || 'badge'}
          </span>
        </div>
        <select
          id="new-user-role"
          name="role"
          value={role}
          onChange={onChange}
          className="w-full bg-slate-50 pl-11 pr-10 py-2.5 rounded-xl text-xs font-semibold text-slate-800 focus:outline-none focus:bg-white focus:ring-2 focus:ring-blue-500/20 border border-slate-200 focus:border-blue-500 transition-all cursor-pointer appearance-none"
        >
          {RBAC_ROLES.map((r) => (
            <option key={r.id} value={r.id}>
              {r.name} ({r.subtitle || r.displayName})
            </option>
          ))}
        </select>
        <div className="absolute inset-y-0 right-0 pr-3.5 flex items-center pointer-events-none text-slate-400">
          <span className="material-symbols-outlined text-[20px]">
            expand_more
          </span>
        </div>
      </div>
      {currentRole?.description && (
        <p className="text-[11px] text-slate-500 px-1 mt-0.5">
          {currentRole.description}
        </p>
      )}
      {error && (
        <span className="text-[11px] text-red-500 font-medium px-2">{error}</span>
      )}
    </div>
  );
};

const NewUserPersonalFields = ({ formData, handleChange, errors }) => (
  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-5">
    <div className="flex flex-col gap-1.5">
      <label htmlFor="new-user-nombre" className="text-[11px] font-bold text-slate-600 uppercase tracking-wider block">
        Nombre *
      </label>
      <input
        id="new-user-nombre"
        type="text"
        name="nombre"
        value={formData.nombre}
        onChange={handleChange}
        placeholder="ej. Mariana"
        className={`bg-slate-50 px-4 py-2.5 rounded-xl text-xs font-semibold text-slate-800 focus:outline-none focus:bg-white border transition-all ${
          errors.nombre ? 'border-red-500' : 'border-slate-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20'
        }`}
      />
      {errors.nombre && (
        <span className="text-[11px] text-red-500 font-medium px-2">{errors.nombre}</span>
      )}
    </div>

    <div className="flex flex-col gap-1.5">
      <label htmlFor="new-user-apellido" className="text-[11px] font-bold text-slate-600 uppercase tracking-wider block">
        Apellido *
      </label>
      <input
        id="new-user-apellido"
        type="text"
        name="apellido"
        value={formData.apellido}
        onChange={handleChange}
        placeholder="ej. Valenzuela"
        className={`bg-slate-50 px-4 py-2.5 rounded-xl text-xs font-semibold text-slate-800 focus:outline-none focus:bg-white border transition-all ${
          errors.apellido ? 'border-red-500' : 'border-slate-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20'
        }`}
      />
      {errors.apellido && (
        <span className="text-[11px] text-red-500 font-medium px-2">{errors.apellido}</span>
      )}
    </div>
  </div>
);

const NewUserContactFields = ({ formData, handleChange, errors }) => (
  <>
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-5">
      <div className="flex flex-col gap-1.5">
        <label htmlFor="new-user-dni" className="text-[11px] font-bold text-slate-600 uppercase tracking-wider block">
          DNI (Documento Nacional) *
        </label>
        <input
          id="new-user-dni"
          type="text"
          name="dni"
          value={formData.dni}
          onChange={handleChange}
          placeholder="ej. 32.189.440"
          className={`bg-slate-50 px-4 py-2.5 rounded-xl text-xs font-semibold text-slate-800 focus:outline-none focus:bg-white border transition-all ${
            errors.dni ? 'border-red-500' : 'border-slate-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20'
          }`}
        />
        {errors.dni && (
          <span className="text-[11px] text-red-500 font-medium px-2">{errors.dni}</span>
        )}
      </div>

      <div className="flex flex-col gap-1.5">
        <label htmlFor="new-user-telefono" className="text-[11px] font-bold text-slate-600 uppercase tracking-wider block">
          Teléfono de Contacto
        </label>
        <input
          id="new-user-telefono"
          type="text"
          name="telefono"
          value={formData.telefono}
          onChange={handleChange}
          placeholder="ej. +54 9 362 489-1120"
          className={`bg-slate-50 px-4 py-2.5 rounded-xl text-xs font-semibold text-slate-800 focus:outline-none focus:bg-white border transition-all ${
            errors.telefono ? 'border-red-500' : 'border-slate-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20'
          }`}
        />
        {errors.telefono && (
          <span className="text-[11px] text-red-500 font-medium px-2">{errors.telefono}</span>
        )}
      </div>
    </div>

    <div className="flex flex-col gap-1.5">
      <label htmlFor="new-user-email" className="text-[11px] font-bold text-slate-600 uppercase tracking-wider block">
        Correo Electrónico Institucional *
      </label>
      <input
        id="new-user-email"
        type="email"
        name="email"
        value={formData.email}
        onChange={handleChange}
        placeholder="ej. m.valenzuela@educar.edu.ar"
        className={`bg-slate-50 px-4 py-2.5 rounded-xl text-xs font-semibold text-slate-800 focus:outline-none focus:bg-white border transition-all ${
          errors.email ? 'border-red-500' : 'border-slate-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20'
        }`}
      />
      {errors.email && (
        <span className="text-[11px] text-red-500 font-medium px-2">{errors.email}</span>
      )}
    </div>
  </>
);

const NewUserStatusFields = ({ formData, handleChange }) => {
  const isDocente = formData.role === 'Docente';

  return (
    <>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-5">
        <div className="flex flex-col gap-1.5">
          <label htmlFor="new-user-cargo" className="text-[11px] font-bold text-slate-600 uppercase tracking-wider block">
            Cargo / Función Desempeñada
          </label>
          <input
            id="new-user-cargo"
            type="text"
            name="cargo"
            value={formData.cargo}
            onChange={handleChange}
            placeholder="ej. Titular de Cátedra, Vicedirección, etc."
            className="bg-slate-50 px-4 py-2.5 rounded-xl text-xs font-semibold text-slate-800 focus:outline-none focus:bg-white border border-slate-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all"
          />
        </div>

        {isDocente ? (
          <div className="flex flex-col gap-1.5">
            <label htmlFor="new-user-condicion" className="text-[11px] font-bold text-slate-600 uppercase tracking-wider block">
              Condición Docente / Revista *
            </label>
            <select
              id="new-user-condicion"
              name="condicion"
              value={formData.condicion || 'Titular'}
              onChange={handleChange}
              className="bg-slate-50 px-4 py-2.5 rounded-xl text-xs font-semibold text-slate-800 focus:outline-none focus:bg-white border border-slate-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 cursor-pointer transition-all"
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
            <label htmlFor="new-user-estado" className="text-[11px] font-bold text-slate-600 uppercase tracking-wider block">
              Estado de la Cuenta *
            </label>
            <select
              id="new-user-estado"
              name="estado"
              value={formData.estado}
              onChange={handleChange}
              className="bg-slate-50 px-4 py-2.5 rounded-xl text-xs font-semibold text-slate-800 focus:outline-none focus:bg-white border border-slate-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 cursor-pointer transition-all"
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

      {isDocente && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-5">
          <div className="flex flex-col gap-1.5">
            <label htmlFor="new-user-estado-docente" className="text-[11px] font-bold text-slate-600 uppercase tracking-wider block">
              Estado de la Cuenta *
            </label>
            <select
              id="new-user-estado-docente"
              name="estado"
              value={formData.estado}
              onChange={handleChange}
              className="bg-slate-50 px-4 py-2.5 rounded-xl text-xs font-semibold text-slate-800 focus:outline-none focus:bg-white border border-slate-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 cursor-pointer transition-all"
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
  );
};

const NewUserFormFields = ({ formData, setFormData, handleChange, errors }) => (
  <>
    {/* Aviso informativo de credenciales iniciales */}
    <div className="p-4 bg-blue-50/80 rounded-2xl border border-blue-100 flex items-start gap-3">
      <span className="material-symbols-outlined text-[20px] text-blue-600 shrink-0 mt-0.5">
        info
      </span>
      <div className="text-xs text-blue-900 leading-relaxed">
        <span className="font-bold">Credenciales iniciales:</span> La contraseña por defecto del usuario será su número de <strong className="underline">DNI sin puntos</strong>. En su primer inicio de sesión se le solicitará actualizar su contraseña.
      </div>
    </div>

    <NewUserRoleDropdown
      role={formData.role}
      onChange={(e) => {
        const nextRole = e.target.value;
        setFormData((prev) => ({
          ...prev,
          role: nextRole,
          cargo: prev.cargo && !prev.cargo.startsWith('Personal ') ? prev.cargo : '',
        }));
      }}
      error={errors.role}
    />

    <NewUserPersonalFields formData={formData} handleChange={handleChange} errors={errors} />
    <NewUserContactFields formData={formData} handleChange={handleChange} errors={errors} />
    <NewUserStatusFields formData={formData} handleChange={handleChange} />
  </>
);

const NewUserModalContent = ({ activeRole = 'Directivo', onClose, onSubmit }) => {
  const [formData, setFormData] = useState(() => ({
    ...INITIAL_FORM,
    role: activeRole === 'Todos' ? 'Directivo' : activeRole,
  }));
  const [errors, setErrors] = useState({});
  const [submitError, setSubmitError] = useState('');
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
    if (submitError) {
      setSubmitError('');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitError('');
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
      setSubmitError(err.message || 'Error al registrar el usuario en Firebase.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const dialogRef = useRef(null);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (dialog) {
      if (typeof dialog.showModal === 'function') {
        if (!dialog.open) {
          dialog.showModal();
        }
      } else {
        dialog.setAttribute('open', '');
      }
    }
    return () => {
      if (dialog) {
        if (typeof dialog.close === 'function') {
          if (dialog.open) {
            dialog.close();
          }
        } else {
          dialog.removeAttribute('open');
        }
      }
    };
  }, []);

  return (
    <dialog
      ref={dialogRef}
      onCancel={(e) => {
        e.preventDefault();
        onClose();
      }}
      aria-labelledby="new-user-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-sm border-none outline-none m-0 max-w-none max-h-none w-full h-full backdrop:bg-transparent animate-in fade-in duration-200"
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
          <div className="p-6 sm:p-7 overflow-y-auto flex flex-col gap-5 flex-1">
            {submitError && (
              <div className="p-3.5 bg-red-50 border border-red-200 text-red-700 text-xs rounded-2xl font-semibold flex items-center gap-2">
                <span className="material-symbols-outlined text-[18px]">error</span>
                <span>{submitError}</span>
              </div>
            )}
            <NewUserFormFields
              formData={formData}
              setFormData={setFormData}
              handleChange={handleChange}
              errors={errors}
            />
          </div>

          {/* Footer */}
          <UserModalFooter
            onClose={onClose}
            isSubmitting={isSubmitting}
            submitText="Registrar Usuario"
            submittingText="Registrando..."
            submitIcon="check"
          />
        </form>
      </div>
    </dialog>
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
