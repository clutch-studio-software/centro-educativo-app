import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { images } from '../services/imagesConfig';
import Navbar from '../components/Navbar';
import { useAuth } from '../context/AuthContext';
import ForgotPasswordModal from '../components/organisms/ForgotPasswordModal';

const ROLES_INFO = {
  'Estudiante/Tutor': {
    label: 'Estudiante / Tutor',
    icon: 'school',
    displayLabel: 'ESTUDIANTE O TUTOR',
    subtitle: 'Alumnos regulares y familias / adultos responsables',
    permissions: [
      'Consultar calificaciones, boletines y notas parciales',
      'Visualizar asistencias, inasistencias y tardanzas',
      'Descargar material de estudio y programas académicos',
      'Consultar agenda escolar y talleres extracurriculares',
      'Seguimiento de legajos y aranceles (Tutores)',
    ],
  },
  Staff: {
    label: 'Staff Institucional',
    icon: 'badge',
    displayLabel: 'STAFF INSTITUCIONAL',
    subtitle: 'Directivos, Administrativos, Docentes, Preceptoría y Enfermería',
    permissions: [
      'Acceso al panel institucional (/admin) según permisos asignados',
      'Supervisión y gestión de legajos de alumnos y personal',
      'Carga de notas y asistencia áulica / preceptoría',
      'Gestión de actividades extracurriculares y servicios',
      'Administración de usuarios y auditoría de accesos',
    ],
  },
};

const getActiveRoleKey = (role) => {
  const norm = String(role || '').toLowerCase();
  if (
    norm.includes('estudiante') ||
    norm.includes('padre') ||
    norm.includes('tutor') ||
    norm.includes('alumno')
  ) {
    return 'Estudiante/Tutor';
  }
  return 'Staff';
};

const LoggedInView = ({ user, onLogout }) => {
  const navigate = useNavigate();
  const activeRoleKey = getActiveRoleKey(user.role);
  const currentRole = ROLES_INFO[activeRoleKey];
  const isStaffUser = activeRoleKey === 'Staff';
  const userDisplayName =
    user.nombre ||
    user.displayName ||
    user.name ||
    user.email?.split('@')[0] ||
    '';

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-body">
      <Navbar />
      <main className="flex-1 flex items-center justify-center p-4 sm:p-8 md:p-16">
        <div className="w-full max-w-2xl bg-white rounded-xl shadow-[0px_20px_40px_rgba(35,44,81,0.06)] border border-slate-100 p-8 sm:p-12 text-center transition-all duration-300 hover:shadow-[0px_25px_50px_rgba(35,44,81,0.1)]">
          <div className="mb-6 flex justify-center">
            <div className="h-20 w-20 bg-orange-100 rounded-full flex items-center justify-center text-orange-600 animate-bounce">
              <span
                className="material-symbols-outlined text-4xl"
                style={{ fontVariationSettings: "'FILL' 1" }}
              >
                {currentRole?.icon || 'verified_user'}
              </span>
            </div>
          </div>

          <h1 className="font-headline font-bold text-2xl sm:text-3xl text-slate-800 tracking-tight mb-2">
            HOLA {userDisplayName ? userDisplayName.toUpperCase() : (currentRole?.displayLabel || 'USUARIO')},
          </h1>
          <div className="flex justify-center mb-4">
            <span className="text-xs font-semibold text-orange-700 bg-orange-50 px-3 py-1 rounded-full border border-orange-200">
              Rol en el sistema: {user.role || (isStaffUser ? 'Staff Institucional' : 'Estudiante / Tutor')}
            </span>
          </div>

          <div className="bg-orange-50/50 border border-orange-100 rounded-2xl p-6 sm:p-8 my-6 text-left max-w-md mx-auto">
            <h2 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3">
              Permisos y Funcionalidades Disponibles:
            </h2>
            <ul className="space-y-3">
              {currentRole?.permissions.map((permission) => (
                <li
                  key={permission}
                  className="flex items-center gap-3 text-slate-700 text-sm font-medium"
                >
                  <span
                    className="material-symbols-outlined text-orange-600 font-bold bg-orange-100 rounded-full p-1 text-xs"
                    style={{ fontVariationSettings: "'FILL' 1" }}
                  >
                    check
                  </span>
                  {permission}
                </li>
              ))}
            </ul>
          </div>

          <div className="flex items-center justify-center gap-3 flex-wrap mt-4">
            {isStaffUser && (
              <button
                type="button"
                onClick={() => navigate('/admin')}
                className="px-6 py-3 bg-orange-600 hover:bg-orange-700 text-white font-bold font-label rounded-full transition-all duration-200 border-none shadow-sm cursor-pointer flex items-center gap-2"
              >
                <span className="material-symbols-outlined text-lg">dashboard</span>
                <span>Ir al Panel de Administración</span>
              </button>
            )}
            <button
              type="button"
              onClick={onLogout}
              className="px-6 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold font-label rounded-full transition-all duration-200 border border-slate-200 shadow-sm cursor-pointer"
            >
              Cerrar Sesión
            </button>
          </div>
        </div>
      </main>
    </div>
  );
};
const LoginBrandingPanel = () => (
  <div className="hidden lg:flex lg:w-1/2 relative bg-gradient-to-br from-orange-500 to-amber-400 p-12 flex-col justify-between overflow-hidden">
    {/* Glassmorphism overlay for subtle texture */}
    <div className="absolute inset-0 bg-white/10 backdrop-blur-sm z-0"></div>
    {/* Abstract decorative elements */}
    <div className="absolute -top-24 -left-24 w-64 h-64 bg-lime-400 rounded-full mix-blend-multiply filter blur-3xl opacity-50 z-0"></div>
    <div className="absolute -bottom-32 -right-32 w-96 h-96 bg-yellow-400 rounded-full mix-blend-multiply filter blur-3xl opacity-50 z-0"></div>

    <div className="relative z-10">
      <div className="mb-8">
        <img
          loading="lazy"
          alt="Logo Educar para Transformar"
          className="h-20 w-auto object-contain bg-white rounded-xl p-2 shadow-lg"
          src={images.logo}
          onError={(e) => {
            e.target.src =
              'https://lh3.googleusercontent.com/aida/ADBb0ugJ1I9qKGq-LA1zkyP0mAJ6KMVoto-k2Bhko7jS4BgxauPND3UeAT0onvR1k3ArEIe80EYEIMFR8Bwmy9Wq6vif1Hl7DAh1-BrEutL_eg8cYRnUjvE5tspD46XGp7iF9rIOZa8T-GNoMMlJIBDJIzgLlyIj-mRW9JHn4QnEsHs-VN4XmpP7DLXTLi0_GmkFUlL2utzr7RRQS131G6KzO_u524R8pUernkXd1WN1UmvTuth2AT7diNd-5Yg';
          }}
        />
      </div>
      <h1 className="font-headline font-extrabold text-5xl leading-tight tracking-tight text-white mb-6">
        Bienvenido a<br />
        Educar para
        <br />
        Transformar.
      </h1>
      <p className="font-body text-lg text-white/90 max-w-md">
        Transformando la interfaz educativa tradicional en una experiencia
        digital de nivel editorial para estudiantes, padres y profesores.
      </p>
    </div>

    <div className="relative z-10 mt-auto bg-white/20 backdrop-blur-md rounded-xl p-6 border border-white/30 shadow-sm">
      <div className="flex items-center gap-4">
        <span
          className="material-symbols-outlined text-lime-300"
          style={{ fontVariationSettings: "'FILL' 1" }}
        >
          lightbulb
        </span>
        <p className="font-body text-sm font-medium text-white">
          "La educación es el arma más poderosa que puedes usar para
          cambiar el mundo."
        </p>
      </div>
    </div>
  </div>
);

const LoginRoleSelector = ({ selectedRole, setSelectedRole }) => (
  <div className="mb-6">
    <span
      id="role-selector-label"
      className="block font-label text-xs font-bold text-slate-500 mb-2.5 uppercase tracking-wider"
    >
      Selecciona tu perfil de acceso
    </span>
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
      {Object.keys(ROLES_INFO).map((roleKey) => {
        const role = ROLES_INFO[roleKey];
        const isSelected = selectedRole === roleKey;
        return (
          <button
            key={roleKey}
            type="button"
            onClick={() => setSelectedRole(roleKey)}
            className={`p-3.5 rounded-xl border-2 text-left transition-all duration-150 cursor-pointer flex flex-col justify-between gap-1.5 ${
              isSelected
                ? 'border-orange-500 bg-orange-50/80 shadow-xs'
                : 'border-slate-200 bg-slate-50 hover:bg-slate-100/70 text-slate-700'
            }`}
          >
            <div className="flex items-center justify-between w-full">
              <div className="flex items-center gap-2">
                <span
                  className={`material-symbols-outlined rounded-lg p-1.5 text-lg flex items-center justify-center transition-colors ${
                    isSelected
                      ? 'text-orange-600 bg-orange-100'
                      : 'text-slate-500 bg-slate-200/70'
                  }`}
                  style={{
                    fontVariationSettings: isSelected ? "'FILL' 1" : "'FILL' 0",
                  }}
                >
                  {role.icon}
                </span>
                <span
                  className={`font-label text-sm font-bold ${
                    isSelected ? 'text-orange-950' : 'text-slate-800'
                  }`}
                >
                  {role.label}
                </span>
              </div>
              {isSelected && (
                <span className="material-symbols-outlined text-orange-600 text-base font-bold">
                  check_circle
                </span>
              )}
            </div>
          </button>
        );
      })}
    </div>
  </div>
);

const LoginForm = ({
  handleLoginSubmit,
  identifier,
  setIdentifier,
  password,
  setPassword,
  showPassword,
  setShowPassword,
  rememberMe,
  setRememberMe,
  isSubmitting,
  loginError,
  selectedRole,
  onForgotPasswordClick,
}) => {
  const isStaff = selectedRole === 'Staff';

  return (
    <form onSubmit={handleLoginSubmit} className="space-y-6">
      {/* ID / Email Field */}
      <div>
        <label
          className="block font-label text-sm font-medium text-slate-600 mb-2"
          htmlFor="identifier"
        >
          {isStaff ? 'Correo Electrónico Institucional' : 'ID de Estudiante o Correo del Tutor'}
        </label>
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
            <span className="material-symbols-outlined text-slate-400">
              {isStaff ? 'badge' : 'account_circle'}
            </span>
          </div>
          <input
            className="w-full pl-12 pr-4 py-3 bg-slate-50 text-slate-800 placeholder-slate-400 border-2 border-slate-200 rounded-xl focus:bg-white focus:border-orange-500 focus:ring-0 transition-colors font-body text-base"
            id="identifier"
            name="identifier"
            placeholder={
              isStaff ? 'ej. usuario@colegio.edu.ar' : 'ej. EST-2027-42035 o tutor@correo.com'
            }
            type="text"
            required
            value={identifier}
            onChange={(e) => setIdentifier(e.target.value)}
          />
        </div>
        {!isStaff && (
          <p className="text-[11px] text-slate-500 mt-1.5 flex items-center gap-1">
            <span className="material-symbols-outlined text-[14px] text-slate-400">info</span>
            Estudiantes ingresan con su ID (EST-...) y Tutores con su correo (contraseña: DNI).
          </p>
        )}
      </div>

      {/* Password Field */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <label
            className="block font-label text-sm font-medium text-slate-600"
            htmlFor="password"
          >
            Contraseña
          </label>
          <button
            type="button"
            onClick={onForgotPasswordClick}
            className="font-label text-sm font-medium text-orange-600 hover:text-orange-700 transition-colors border-none bg-transparent cursor-pointer p-0"
          >
            ¿Olvidaste tu contraseña?
          </button>
        </div>
      <div className="relative">
        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
          <span className="material-symbols-outlined text-slate-400">
            lock
          </span>
        </div>
        <input
          className="w-full pl-12 pr-12 py-3 bg-slate-50 text-slate-800 placeholder-slate-400 border-2 border-slate-200 rounded-xl focus:bg-white focus:border-orange-500 focus:ring-0 transition-colors font-body text-base"
          id="password"
          name="password"
          placeholder="••••••••"
          type={showPassword ? 'text' : 'password'}
          required
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        <div className="absolute inset-y-0 right-0 pr-4 flex items-center">
          <button
            className="text-slate-400 hover:text-slate-600 focus:outline-none"
            type="button"
            onClick={() => setShowPassword(!showPassword)}
          >
            <span className="material-symbols-outlined">
              {showPassword ? 'visibility' : 'visibility_off'}
            </span>
          </button>
        </div>
      </div>
    </div>

    {/* Remember Me */}
    <div className="flex items-center">
      <input
        className="h-5 w-5 rounded-md bg-slate-50 border-slate-300 text-orange-600 focus:ring-orange-500 focus:ring-offset-0 cursor-pointer"
        id="remember-me"
        name="remember-me"
        type="checkbox"
        checked={rememberMe}
        onChange={(e) => setRememberMe(e.target.checked)}
      />
      <label
        className="ml-3 block font-body text-sm text-slate-600 cursor-pointer select-none"
        htmlFor="remember-me"
      >
        Mantener sesión iniciada
      </label>
    </div>

    {/* Submit Button */}
    <button
      className="w-full flex justify-center items-center py-4 px-6 border border-transparent rounded-full shadow-md text-base font-bold font-label text-white bg-orange-600 hover:bg-orange-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-600 transition-all active:scale-95 cursor-pointer disabled:opacity-75 disabled:cursor-not-allowed"
      type="submit"
      disabled={isSubmitting}
    >
      {isSubmitting ? 'Verificando...' : 'Acceso Seguro'}
      <span className="material-symbols-outlined ml-2">
        arrow_forward
      </span>
    </button>
    {loginError && (
      <p
        test-dataid="login-error-text"
        className="text-red-500 text-sm font-bold text-center mt-4 bg-red-50 p-2.5 rounded-xl border border-red-200"
      >
        {loginError}
      </p>
    )}
  </form>
);
};

const Login = () => {
  const navigate = useNavigate();
  const { user, login, logout, isLoggedIn } = useAuth();

  const [selectedRole, setSelectedRole] = useState('Estudiante/Tutor');
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [loginError, setLoginError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isForgotPasswordOpen, setIsForgotPasswordOpen] = useState(false);

  // Redirigir automáticamente a los usuarios administradores / staff con privilegios
  useEffect(() => {
    if (isLoggedIn && user) {
      const staffRoles = [
        'user_admin',
        'admin',
        'directivo',
        'administrativo',
        'docente',
        'preceptoria',
        'enfermeria',
        'staff',
      ];
      const userRole = String(user.role || '').toLowerCase();
      if (staffRoles.includes(userRole)) {
        navigate('/admin');
      }
    }
  }, [isLoggedIn, user, navigate]);

  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setLoginError('');
    try {
      await login(identifier, password, selectedRole);
    } catch (err) {
      switch (err.code) {
        case 'auth/invalid-credential':
          setLoginError('Credenciales inválidas. Verifica tu ID o correo.');
          break;
        default:
          setLoginError(
            err.code || 'Error al iniciar sesión. Revisa tus credenciales.'
          );
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleLogout = () => {
    logout();
    setIdentifier('');
    setPassword('');
  };

  // Logged-in screen (Simulated Firebase Auth View)
  if (isLoggedIn && user) {
    return <LoggedInView user={user} onLogout={handleLogout} />;
  }

  // Login Form Screen (based on design mock)
  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 font-body flex items-center justify-center p-4 sm:p-8">
      {/* Main Container */}
      <main className="w-full max-w-6xl mx-auto flex flex-col lg:flex-row items-stretch bg-white rounded-xl shadow-[0px_20px_40px_rgba(35,44,81,0.06)] overflow-hidden">
        {/* Left Side: Visual/Branding Panel */}
        <LoginBrandingPanel />

        {/* Right Side: Login Form Panel */}
        <div className="w-full lg:w-1/2 p-8 sm:p-12 xl:p-16 flex flex-col justify-center bg-white relative">
          {/* Volver (Go Back) Button */}
          <button
            type="button"
            onClick={() => navigate('/')}
            className="absolute top-6 left-6 sm:top-8 sm:left-8 flex items-center gap-2 text-slate-500 hover:text-orange-600 transition-colors duration-200 focus:outline-none font-label text-sm font-semibold group cursor-pointer"
          >
            <span className="material-symbols-outlined text-lg transition-transform duration-200 group-hover:-translate-x-1">
              arrow_back
            </span>
            Volver
          </button>

          <div className="max-w-md w-full mx-auto">
            {/* Mobile Logo (visible only on small screens) */}
            <div className="lg:hidden mb-10 text-center flex flex-col items-center mt-6">
              <img
                loading="lazy"
                alt="Logo Educar para Transformar"
                className="h-16 w-auto object-contain mb-4 bg-white rounded-xl p-2 shadow-md"
                src={images.logo}
                onError={(e) => {
                  e.target.src =
                    'https://lh3.googleusercontent.com/aida/ADBb0ugJ1I9qKGq-LA1zkyP0mAJ6KMVoto-k2Bhko7jS4BgxauPND3UeAT0onvR1k3ArEIe80EYEIMFR8Bwmy9Wq6vif1Hl7DAh1-BrEutL_eg8cYRnUjvE5tspD46XGp7iF9rIOZa8T-GNoMMlJIBDJIzgLlyIj-mRW9JHn4QnEsHs-VN4XmpP7DLXTLi0_GmkFUlL2utzr7RRQS131G6KzO_u524R8pUernkXd1WN1UmvTuth2AT7diNd-5Yg';
                }}
              />
              <h2 className="font-headline font-bold text-3xl text-slate-800 tracking-tight">
                Portal de Acceso
              </h2>
            </div>

            <div className="hidden lg:block mb-10">
              <h2 className="font-headline font-bold text-4xl text-slate-800 tracking-tight mb-2">
                Portal de Acceso
              </h2>
              <p className="font-body text-slate-500">
                Inicia sesión para continuar tu viaje.
              </p>
            </div>

            {/* Role Selection Segmented Cards */}
            <LoginRoleSelector
              selectedRole={selectedRole}
              setSelectedRole={setSelectedRole}
            />

            {/* Login Form */}
            <LoginForm
              handleLoginSubmit={handleLoginSubmit}
              identifier={identifier}
              setIdentifier={setIdentifier}
              password={password}
              setPassword={setPassword}
              showPassword={showPassword}
              setShowPassword={setShowPassword}
              rememberMe={rememberMe}
              setRememberMe={setRememberMe}
              isSubmitting={isSubmitting}
              loginError={loginError}
              selectedRole={selectedRole}
              onForgotPasswordClick={() => setIsForgotPasswordOpen(true)}
            />

            {/* Help Link */}
            <div className="mt-8 text-center">
              <p className="font-body text-sm text-slate-500">
                ¿Necesitas ayuda para acceder a tu cuenta?{' '}
                <br className="sm:hidden" />
                <button
                  type="button"
                  onClick={() => setIsForgotPasswordOpen(true)}
                  className="font-medium text-orange-600 hover:text-orange-700 transition-colors border-none bg-transparent cursor-pointer p-0 underline"
                >
                  Contactar Soporte
                </button>
              </p>
            </div>
          </div>
        </div>
      </main>

      {/* Modal de Restablecimiento de Contraseña */}
      <ForgotPasswordModal
        isOpen={isForgotPasswordOpen}
        onClose={() => setIsForgotPasswordOpen(false)}
      />
    </div>
  );
};

export default Login;
