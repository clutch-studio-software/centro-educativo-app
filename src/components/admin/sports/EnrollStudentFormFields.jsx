import React from 'react';

export const EnrollStudentFormFields = ({ formData, setFormData, errors }) => {
  const handleCondicionChange = (val) => {
    if (val === 'regular') {
      setFormData({
        ...formData,
        condicionTipo: val,
        condicion: 'Regular • Al día',
        estadoCuota: 'Al Día',
        aptoMedico: true,
      });
    } else if (val === 'becado') {
      setFormData({
        ...formData,
        condicionTipo: val,
        condicion: 'Regular • Becado 100%',
        estadoCuota: 'Becado',
        aptoMedico: true,
      });
    } else {
      setFormData({
        ...formData,
        condicionTipo: val,
        condicion: 'Apto Médico Pendiente',
        estadoCuota: 'Pendiente',
        aptoMedico: false,
      });
    }
  };

  return (
    <>
      <div>
        <label htmlFor="enroll-nombre" className="block text-slate-700 font-bold mb-1">
          Nombre Completo del Alumno *
        </label>
        <input
          id="enroll-nombre"
          type="text"
          value={formData.nombre}
          onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
          placeholder="Ej: Sofía Morales Benítez"
          aria-label="Nombre Completo del Alumno"
          className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-slate-800 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary text-xs"
        />
        {errors.nombre && <p className="text-red-500 text-[11px] mt-1">{errors.nombre}</p>}
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label htmlFor="enroll-dni" className="block text-slate-700 font-bold mb-1">
            DNI del Alumno *
          </label>
          <input
            id="enroll-dni"
            type="text"
            value={formData.dni}
            onChange={(e) => setFormData({ ...formData, dni: e.target.value })}
            placeholder="Ej: 48912004"
            aria-label="DNI del Alumno"
            className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-slate-800 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary text-xs"
          />
          {errors.dni && <p className="text-red-500 text-[11px] mt-1">{errors.dni}</p>}
        </div>

        <div>
          <label htmlFor="enroll-nivel" className="block text-slate-700 font-bold mb-1">
            Nivel Educativo
          </label>
          <select
            id="enroll-nivel"
            value={formData.nivel}
            onChange={(e) => setFormData({ ...formData, nivel: e.target.value })}
            aria-label="Nivel Educativo"
            className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-slate-800 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary text-xs"
          >
            <option value="Primario">Primario</option>
            <option value="Secundario">Secundario</option>
          </select>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label htmlFor="enroll-curso" className="block text-slate-700 font-bold mb-1">
            Curso
          </label>
          <select
            id="enroll-curso"
            value={formData.curso}
            onChange={(e) => setFormData({ ...formData, curso: e.target.value })}
            aria-label="Curso del alumno"
            className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-slate-800 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary text-xs"
          >
            {formData.nivel === 'Primario' ? (
              <>
                <option value="4° Grado">4° Grado</option>
                <option value="5° Grado">5° Grado</option>
                <option value="6° Grado">6° Grado</option>
                <option value="7° Grado">7° Grado</option>
              </>
            ) : (
              <>
                <option value="1° Año">1° Año</option>
                <option value="2° Año">2° Año</option>
                <option value="3° Año">3° Año</option>
                <option value="4° Año">4° Año</option>
                <option value="5° Año">5° Año</option>
                <option value="6° Año">6° Año</option>
              </>
            )}
          </select>
        </div>

        <div>
          <label htmlFor="enroll-division" className="block text-slate-700 font-bold mb-1">
            División
          </label>
          <select
            id="enroll-division"
            value={formData.division}
            onChange={(e) => setFormData({ ...formData, division: e.target.value })}
            aria-label="División del curso"
            className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-slate-800 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary text-xs"
          >
            <option value="A">División A</option>
            <option value="B">División B</option>
            <option value="C">División C</option>
          </select>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label htmlFor="enroll-tutor" className="block text-slate-700 font-bold mb-1">
            Tutor Responsable *
          </label>
          <input
            id="enroll-tutor"
            type="text"
            value={formData.tutor}
            onChange={(e) => setFormData({ ...formData, tutor: e.target.value })}
            placeholder="Ej: Marcelo Gómez"
            aria-label="Tutor Responsable"
            className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-slate-800 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary text-xs"
          />
          {errors.tutor && <p className="text-red-500 text-[11px] mt-1">{errors.tutor}</p>}
        </div>

        <div>
          <label htmlFor="enroll-tutor-tel" className="block text-slate-700 font-bold mb-1">
            Teléfono Contacto *
          </label>
          <input
            id="enroll-tutor-tel"
            type="text"
            value={formData.tutorTelefono}
            onChange={(e) => setFormData({ ...formData, tutorTelefono: e.target.value })}
            placeholder="Ej: 11-4920-1928"
            aria-label="Teléfono Contacto"
            className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-slate-800 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary text-xs"
          />
          {errors.tutorTelefono && <p className="text-red-500 text-[11px] mt-1">{errors.tutorTelefono}</p>}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3 pt-1">
        <div>
          <label htmlFor="enroll-condicion" className="block text-slate-700 font-bold mb-1">
            Condición Deportiva
          </label>
          <select
            id="enroll-condicion"
            value={formData.condicionTipo}
            onChange={(e) => handleCondicionChange(e.target.value)}
            aria-label="Condición Deportiva"
            className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-slate-800 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary text-xs"
          >
            <option value="regular">Regular • Al día</option>
            <option value="becado">Regular • Becado 100%</option>
            <option value="pendiente">Apto Médico Pendiente</option>
          </select>
        </div>

        <div>
          <label htmlFor="enroll-cuota" className="block text-slate-700 font-bold mb-1">
            Estado de Cuota
          </label>
          <select
            id="enroll-cuota"
            value={formData.estadoCuota}
            onChange={(e) => setFormData({ ...formData, estadoCuota: e.target.value })}
            aria-label="Estado de Cuota"
            className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-slate-800 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary text-xs"
          >
            <option value="Al Día">Al Día</option>
            <option value="Pendiente">Pendiente</option>
            <option value="Becado">Becado</option>
          </select>
        </div>
      </div>
    </>
  );
};

export default EnrollStudentFormFields;
