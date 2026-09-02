# 🏫 Centro Educativo "Educar para Transformar"

[![React](https://img.shields.io/badge/React-19.2-61DAFB?logo=react&logoColor=black)](https://react.dev/)
[![Vite](https://img.shields.io/badge/Vite-8.0-646CFF?logo=vite&logoColor=white)](https://vitejs.dev/)
[![Firebase](https://img.shields.io/badge/Firebase-v12-FFCA28?logo=firebase&logoColor=black)](https://firebase.google.com/)
[![TailwindCSS](https://img.shields.io/badge/TailwindCSS-v4-38B2AC?logo=tailwind-css&logoColor=white)](https://tailwindcss.com/)
[![Deploy](https://img.shields.io/badge/Deploy-Vercel-black?logo=vercel&logoColor=white)](https://vercel.com/)

Plataforma web integral y ecosistema digital para el centro educativo **"Educar para Transformar"**, diseñado para conectar a la comunidad educativa: postulantes, estudiantes, familias, docentes y equipo directivo.

---

## 🚀 Características Principales

### 🌐 Portal Institucional Público
- **Página de Inicio (`Home`):** Hero interactivo, recorrido del campus educativo, propuesta pedagógica y valores.
- **Niveles Educativos (`Levels`):** Información detallada de Nivel Inicial (3 a 5 años), Primaria (1º a 6º) y Secundaria (formación integral y orientación vocacional).
- **Bienestar y Comunidad (`Wellness`):** Espacios de acompañamiento psicopedagógico, deportes, nutrición y vida saludable.
- **Noticias y Eventos (`News`):** Novedades institucionales conectadas a **Cloud Firestore** con soporte de categorías, carga dinámica y autosebrado de datos (*seeding*).
- **Galería Multimedia (`Gallery`):** Muestra visual de actividades, instalaciones y talleres.

### 📝 Formularios Interactivos y Gestión
- **Pre-inscripción Online (`Registration`):** Formulario guiado por pasos (*Stepper*) con validación de rangos de edad escolar y sanitización en tiempo real.
- **Contacto y Consultas (`Contact`):** Formulario con integración a webhook de Google Sheets y enlace directo a WhatsApp.
- **Trabaja con Nosotros (`EmploymentRequest`):** Postulación espontánea clasificada por áreas (Docencia, Administración, Maestranza) con zona interactiva de carga de CV en PDF (*drag & drop*).

### 🔐 Seguridad y Autenticación Multirrol
- Autenticación mediante **Firebase Authentication** y **Custom Claims**:
  - 👑 **Administrador (`user_admin`):** Acceso total al panel administrativo y control de usuarios.
  - 👨‍🏫 **Staff / Docente (`Staff`):** Visualización de agenda, asistencias y gestión académica.
  - 👨‍👩‍👧 **Padre / Tutor (`Padre`):** Consulta de legajo y seguimiento escolar de sus hijos.
  - 🎓 **Estudiante (`Estudiante`):** Acceso mediante ID único estudiantil (`EST-YYYY-XXXXX`) y visualización de notas/asistencias.

### ⚙️ Panel de Administración (`AdminPanel`)
- **Dashboard de Usuarios:** Tabla y tarjetas móviles con filtros en tiempo real por búsqueda de texto y nivel educativo.
- **Alta de Usuarios:** Creación automatizada de cuentas de tutores y estudiantes vinculados, y creación de personal institucional.
- **Gestión de Credenciales:** Restablecimiento seguro de contraseñas por defecto al DNI del usuario y edición de perfiles en Firestore.
- **Arquitectura SRP:** Separación estricta entre capas de validación pura (`adminValidators.js`), servicios de red (`adminService.js`) y estado de UI.
- **Modo Fallback:** Inyección automática de datos simulados si Firestore no está disponible en entornos locales.

---

## 🛠️ Stack Tecnológico

### Frontend
- **Core:** [React 19](https://react.dev/) + [Vite 8](https://vitejs.dev/)
- **Enrutamiento:** [React Router DOM v7](https://reactrouter.com/)
- **Estilos:** Tailwind CSS + Vanilla CSS modular + Google Fonts (Plus Jakarta Sans, Outfit) + Material Symbols
- **Estado Global:** Context API (`AuthContext.jsx`)

### Backend & Cloud (Serverless)
- **Base de Datos:** [Cloud Firestore](https://firebase.google.com/docs/firestore)
- **Autenticación:** [Firebase Auth](https://firebase.google.com/docs/auth) con Custom Claims JWT
- **Cloud Functions:** [Firebase Functions v2](https://firebase.google.com/docs/functions) (Node.js 20, TypeScript, Bcrypt, Nodemailer)

### Calidad de Código y Tooling
- **Linter & Formatter:** ESLint 9 + Prettier
- **Git Hooks:** Husky + Lint-staged
- **Hosting & CI/CD:** Vercel (Frontend) + Firebase CLI (Backend)

---

## 📂 Estructura del Proyecto

```text
centro-educativo-app/
├── docs/                       # Documentación técnica y guías de Firebase
│   └── firebase-integration.md
├── functions/                  # Cloud Functions de Firebase (Backend Serverless)
│   ├── src/
│   │   ├── index.ts            # Definición de Cloud Functions v2
│   │   └── email.ts            # Servicio de envío de emails
│   ├── package.json
│   └── tsconfig.json
├── public/                     # Recursos estáticos
├── src/
│   ├── components/
│   │   ├── atoms/              # Componentes básicos (Badge, Icon)
│   │   ├── molecules/          # Componentes compuestos (NewsCard, FileUploadZone, SuccessModal)
│   │   ├── organisms/          # Componentes complejos (Navbar, Footer, ContactForm, etc.)
│   │   └── Button.jsx
│   ├── context/
│   │   └── AuthContext.jsx     # Proveedor de autenticación y sesión
│   ├── pages/                  # Vistas principales de la aplicación
│   │   ├── AdminPanel.jsx      # Panel de administración
│   │   ├── Registration.jsx    # Pre-inscripción por pasos
│   │   ├── Login.jsx           # Inicio de sesión multirrol
│   │   ├── News.jsx            # Portal de noticias con Firestore
│   │   ├── EmploymentRequest.jsx # Postulación laboral
│   │   └── ...
│   ├── services/
│   │   ├── firebase.js         # Inicialización del SDK de Firebase
│   │   ├── adminService.js     # Capa de red y Cloud Functions para administración
│   │   └── imagesConfig.js     # Mapeo centralizado de imágenes y assets
│   ├── styles/                 # Hojas de estilo globales y específicas
│   ├── utils/
│   │   ├── validators.js       # Validadores y sanitizadores compartidos (DRY)
│   │   └── adminValidators.js  # Validaciones del panel de administración (SRP)
│   ├── App.jsx                 # Configuración de rutas y layout
│   └── main.jsx                # Punto de entrada de la aplicación
├── .env.example                # Plantilla de variables de entorno
├── eslint.config.js            # Configuración de ESLint
├── firebase.json               # Configuración de Firebase y Emuladores
└── vite.config.js              # Configuración de Vite
```

---

## 🚀 Instalación y Puesta en Marcha

### 1. Prerrequisitos
- [Node.js](https://nodejs.org/) (versión 18 o superior)
- [npm](https://www.npmjs.com/)
- [Firebase CLI](https://firebase.google.com/docs/cli) (opcional, para emuladores locales):
  ```bash
  npm install -g firebase-tools
  ```

### 2. Clonar el repositorio
```bash
git clone https://github.com/tu-usuario/centro-educativo-app.git
cd centro-educativo-app
```

### 3. Instalar dependencias
```bash
# Instalar dependencias del frontend
npm install

# Instalar dependencias de Cloud Functions (si vas a trabajar en backend)
cd functions && npm install && cd ..
```

### 4. Configurar Variables de Entorno
Copia el archivo de ejemplo `.env.example` a `.env`:
```bash
cp .env.example .env
```
Completa las credenciales de tu proyecto de Firebase en `.env`:
```env
VITE_CONTACT_FORM_SHEETS_URL=https://script.google.com/macros/s/.../exec

# Configuración de Firebase
VITE_FIREBASE_API_KEY=tu_api_key
VITE_FIREBASE_AUTH_DOMAIN=tu-proyecto.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=tu-proyecto
VITE_FIREBASE_STORAGE_BUCKET=tu-proyecto.firebasestorage.app
VITE_FIREBASE_MESSAGING_SENDER_ID=tu_sender_id
VITE_FIREBASE_APP_ID=tu_app_id

# URL de Cloud Functions
VITE_FUNCTIONS_BASE_URL=https://us-central1-tu-proyecto.cloudfunctions.net/
```

### 5. Iniciar el Servidor de Desarrollo
```bash
npm run dev
```
La aplicación estará disponible en `http://localhost:5173`.

---

## 📜 Scripts Disponibles

| Comando | Descripción |
| :--- | :--- |
| `npm run dev` | Inicia el servidor de desarrollo local con Vite y Hot Module Replacement (HMR). |
| `npm run build` | Compila y empaqueta la aplicación optimizada para producción en `/dist`. |
| `npm run lint` | Ejecuta ESLint para analizar la calidad y estilo del código. |
| `npm run preview` | Previsualiza localmente el paquete de producción generado. |
| `npm run doctor` | Ejecuta un diagnóstico de salud del ecosistema React. |

---

## 🛠 Guía de Trabajo con Ramas (Git Flow)

Para mantener la estabilidad y calidad en los despliegues continuos, utilizamos el siguiente flujo:

### 1. Rama `master` (Producción)
- **Propósito:** Versión estable y lista para usuarios finales.
- **Despliegue:** Rama productiva vinculada a Vercel.
- **Regla:** **Nunca** realizar commits directos. Solo recibe código mediante *Pull Requests* aprobados desde `develop`.

### 2. Rama `develop` (Desarrollo e Integración)
- **Propósito:** Rama de trabajo diario donde se integran nuevas funciones y correcciones.
- **Despliegue:** Genera automáticamente *Preview Deployments* en Vercel para revisión de equipo.

### Flujo de Trabajo Típico:
```bash
# 1. Sincronizar develop antes de comenzar
git checkout develop
git pull origin develop

# 2. Realizar cambios y commitear (Husky ejecutará linter automáticamente)
git add .
git commit -m "feat: implementar nuevo validador de DNI"

# 3. Subir cambios a develop
git push origin develop
```

---

## 👥 Integrantes del Equipo

* **Erick Vicentin** — Responsable de Entorno, Arquitectura y GitHub.
* **Santiago Nickisch** — Desarrollo y Maquetación Frontend.