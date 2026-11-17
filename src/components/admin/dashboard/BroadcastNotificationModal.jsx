import React, { useEffect, useId, useRef, useState } from 'react';
import { sendBroadcastInstitutionalNotification } from '../../../services/notificationsService';

const AUDIENCE_OPTIONS = [
  { value: 'all', label: 'Todos (Tutores y Alumnos)' },
  { value: 'parents', label: 'Solo Tutores / Padres' },
  { value: 'students', label: 'Solo Alumnos' },
];

const CATEGORY_OPTIONS = [
  { value: 'info', label: 'Información General (info)' },
  { value: 'preceptoria', label: 'Preceptoría' },
  { value: 'enfermeria', label: 'Enfermería' },
  { value: 'inasistencia', label: 'Inasistencia' },
  { value: 'justificacion', label: 'Justificación' },
  { value: 'pago', label: 'Pagos / Cuotas' },
];

const TARGET_TAB_OPTIONS = [
  { value: 'academic', label: 'Académica (academic)' },
  { value: 'billing', label: 'Cobranzas / Pagos (billing)' },
];

const STATUS_OPTIONS = [
  { value: 'info', label: 'Informativo (info)' },
  { value: 'aprobado', label: 'Aprobado' },
  { value: 'rechazado', label: 'Rechazado' },
  { value: 'observado', label: 'Observado' },
];

const INITIAL_FORM = {
  title: '',
  body: '',
  audience: 'all',
  category: 'info',
  targetTab: 'academic',
  status: 'info',
};

const LABEL_BY_VALUE = {
  audience: Object.fromEntries(AUDIENCE_OPTIONS.map((o) => [o.value, o.label])),
  category: Object.fromEntries(CATEGORY_OPTIONS.map((o) => [o.value, o.label])),
  targetTab: Object.fromEntries(TARGET_TAB_OPTIONS.map((o) => [o.value, o.label])),
  status: Object.fromEntries(STATUS_OPTIONS.map((o) => [o.value, o.label])),
};

const validateFieldValue = (field, value) => {
  const trimmed = String(value || '').trim();
  if (field === 'title' && !trimmed) {
    return 'Ingresá un título para el aviso institucional.';
  }
  if (field === 'body' && !trimmed) {
    return 'Ingresá el mensaje o descripción del aviso.';
  }
  return '';
};

const PreviewStatCard = ({ label, value, icon, toneClass }) => (
  <div className="rounded-xl border border-slate-200 bg-slate-50/80 p-3 flex items-center gap-3">
    <div className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 ${toneClass}`}>
      <span className="material-symbols-outlined text-[18px]">{icon}</span>
    </div>
    <div className="min-w-0">
      <p className="text-[11px] font-semibold text-slate-500 m-0">{label}</p>
      <p className="text-lg font-extrabold text-slate-900 m-0 leading-tight">{value}</p>
    </div>
  </div>
);

const RadioOptionGroup = ({ legend, name, options, value, onChange, gridClass }) => (
  <fieldset className="flex flex-col gap-2 border-0 p-0 m-0">
    <legend className="text-xs font-bold text-slate-700 mb-1.5">{legend}</legend>
    <div className={`grid gap-2 ${gridClass}`}>
      {options.map((opt) => (
        <label
          key={opt.value}
          className={`flex items-center gap-2 rounded-xl border px-3 py-2.5 text-xs font-semibold cursor-pointer transition-colors ${
            value === opt.value
              ? 'border-blue-500 bg-blue-50/70 text-blue-900'
              : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50'
          }`}
        >
          <input
            type="radio"
            name={name}
            value={opt.value}
            checked={value === opt.value}
            onChange={(e) => onChange(e.target.value)}
            className="accent-blue-600"
          />
          <span>{opt.label}</span>
        </label>
      ))}
    </div>
  </fieldset>
);

const BroadcastFormStep = ({
  form,
  onFieldChange,
  onCancel,
  onSimulated,
  onError,
  isSimulating,
  setIsSimulating,
}) => {
  const titleInputRef = useRef(null);
  const bodyInputRef = useRef(null);
  const baseId = useId();
  const titleId = `${baseId}-title`;
  const titleErrId = `${baseId}-title-err`;
  const bodyId = `${baseId}-body`;
  const bodyErrId = `${baseId}-body-err`;
  const categoryId = `${baseId}-category`;

  const [touched, setTouched] = useState({ title: false, body: false });
  const [errors, setErrors] = useState({ title: '', body: '' });

  useEffect(() => {
    titleInputRef.current?.focus();
  }, []);

  const handleInput = (field, value) => {
    onFieldChange(field, value);
    if (errors[field] && !validateFieldValue(field, value)) {
      setErrors((prev) => ({ ...prev, [field]: '' }));
    }
  };

  const handleBlur = (field) => {
    setTouched((prev) => ({ ...prev, [field]: true }));
    setErrors((prev) => ({ ...prev, [field]: validateFieldValue(field, form[field]) }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    onError('');

    const titleError = validateFieldValue('title', form.title);
    const bodyError = validateFieldValue('body', form.body);
    setTouched({ title: true, body: true });
    setErrors({ title: titleError, body: bodyError });

    if (titleError) {
      titleInputRef.current?.focus();
      return;
    }
    if (bodyError) {
      bodyInputRef.current?.focus();
      return;
    }

    setIsSimulating(true);
    try {
      const result = await sendBroadcastInstitutionalNotification({ ...form, dryRun: true });
      onSimulated(result);
    } catch (err) {
      onError(err?.message || 'No se pudo ejecutar la simulación previa (dry-run).');
    } finally {
      setIsSimulating(false);
    }
  };

  const titleHasError = touched.title && Boolean(errors.title);
  const bodyHasError = touched.body && Boolean(errors.body);

  return (
    <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-5">
      <div className="flex flex-col gap-1.5">
        <label htmlFor={titleId} className="text-xs font-bold text-slate-700">
          Título del aviso <span aria-hidden="true" className="text-rose-500">*</span>
        </label>
        <input
          ref={titleInputRef}
          id={titleId}
          name="title"
          type="text"
          required
          maxLength={120}
          value={form.title}
          onChange={(e) => handleInput('title', e.target.value)}
          onBlur={() => handleBlur('title')}
          aria-invalid={titleHasError}
          aria-describedby={titleHasError ? titleErrId : undefined}
          placeholder="Ej: Suspensión de actividades por jornada institucional"
          className="w-full min-h-12 rounded-md border border-slate-300 bg-white px-3.5 py-2.5 text-base text-slate-900 placeholder:text-slate-400 focus:border-blue-500 focus:outline-2 focus:outline-blue-500/20"
        />
        {titleHasError && (
          <span id={titleErrId} className="text-xs font-semibold text-rose-600">
            {errors.title}
          </span>
        )}
      </div>

      <div className="flex flex-col gap-1.5">
        <label htmlFor={bodyId} className="text-xs font-bold text-slate-700">
          Mensaje / Descripción <span aria-hidden="true" className="text-rose-500">*</span>
        </label>
        <textarea
          ref={bodyInputRef}
          id={bodyId}
          name="body"
          rows={4}
          required
          maxLength={500}
          value={form.body}
          onChange={(e) => handleInput('body', e.target.value)}
          onBlur={() => handleBlur('body')}
          aria-invalid={bodyHasError}
          aria-describedby={bodyHasError ? bodyErrId : undefined}
          placeholder="Escribí el comunicado completo que verán los tutores y alumnos..."
          className="w-full rounded-md border border-slate-300 bg-white px-3.5 py-2.5 text-base text-slate-900 placeholder:text-slate-400 focus:border-blue-500 focus:outline-2 focus:outline-blue-500/20"
        />
        <div className="flex items-center justify-between">
          {bodyHasError ? (
            <span id={bodyErrId} className="text-xs font-semibold text-rose-600">
              {errors.body}
            </span>
          ) : (
            <span className="text-[11px] text-slate-400">Máximo 500 caracteres</span>
          )}
          <span className="text-[11px] font-mono text-slate-400">{form.body.length}/500</span>
        </div>
      </div>

      <RadioOptionGroup
        legend="Audiencia destinataria (audience)"
        name="audience"
        options={AUDIENCE_OPTIONS}
        value={form.audience}
        onChange={(val) => handleInput('audience', val)}
        gridClass="grid-cols-1 sm:grid-cols-3"
      />

      <div className="flex flex-col gap-1.5">
        <label htmlFor={categoryId} className="text-xs font-bold text-slate-700">
          Categoría (category)
        </label>
        <select
          id={categoryId}
          name="category"
          value={form.category}
          onChange={(e) => handleInput('category', e.target.value)}
          className="w-full min-h-12 rounded-xl border border-slate-300 bg-white px-3.5 py-2.5 text-sm font-medium text-slate-900 focus:border-blue-500 focus:outline-2 focus:outline-blue-500/20"
        >
          {CATEGORY_OPTIONS.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
      </div>

      <RadioOptionGroup
        legend="Pestaña destino en App Móvil (target-tab)"
        name="targetTab"
        options={TARGET_TAB_OPTIONS}
        value={form.targetTab}
        onChange={(val) => handleInput('targetTab', val)}
        gridClass="grid-cols-1 sm:grid-cols-2"
      />

      <RadioOptionGroup
        legend="Estado del aviso (status)"
        name="status"
        options={STATUS_OPTIONS}
        value={form.status}
        onChange={(val) => handleInput('status', val)}
        gridClass="grid-cols-2 sm:grid-cols-4"
      />

      <div className="flex flex-wrap items-center justify-end gap-2.5 border-t border-slate-100 pt-4">
        <button
          type="button"
          onClick={onCancel}
          disabled={isSimulating}
          className="min-h-11 px-4 py-2 rounded-md border border-slate-200 bg-white text-xs font-bold text-slate-700 hover:bg-slate-50 transition-colors cursor-pointer"
        >
          Cancelar
        </button>
        <button
          type="submit"
          disabled={isSimulating}
          data-testid="broadcast-dry-run-btn"
          className="min-h-11 px-5 py-2 rounded-md bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold flex items-center gap-2 shadow-xs transition-colors disabled:opacity-60 cursor-pointer border-none"
        >
          <span className={`material-symbols-outlined text-[18px] ${isSimulating ? 'animate-spin' : ''}`}>
            {isSimulating ? 'sync' : 'science'}
          </span>
          <span>{isSimulating ? 'Calculando estadísticas...' : 'Previsualizar envío (Dry-Run)'}</span>
        </button>
      </div>
    </form>
  );
};

const BroadcastPreviewStep = ({ form, dryRunResult, isSending, onBack, onConfirm }) => (
  <div data-testid="broadcast-dry-run-summary" className="flex flex-col gap-4">
    <div className="rounded-2xl border border-amber-200 bg-amber-50/70 px-4 py-3 text-xs text-amber-900 flex items-start gap-2.5">
      <span className="material-symbols-outlined text-[18px] text-amber-600 shrink-0 mt-0.5">
        info
      </span>
      <div>
        <p className="font-bold m-0">Simulación completada (no se envió nada todavía)</p>
        <p className="m-0 mt-0.5 text-amber-800">
          Verificá el alcance estimado antes de confirmar el envío masivo real.
        </p>
      </div>
    </div>

    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
      <PreviewStatCard
        label="Tutores / Padres alcanzados"
        value={dryRunResult.stats?.parentCount ?? 0}
        icon="family_restroom"
        toneClass="bg-blue-50 text-blue-600"
      />
      <PreviewStatCard
        label="Alumnos alcanzados"
        value={dryRunResult.stats?.studentCount ?? 0}
        icon="school"
        toneClass="bg-indigo-50 text-indigo-600"
      />
      <PreviewStatCard
        label="Notificaciones a crear (Firestore)"
        value={dryRunResult.stats?.firestoreDocsCount ?? 0}
        icon="database"
        toneClass="bg-emerald-50 text-emerald-600"
      />
      <PreviewStatCard
        label="Push Tokens únicos (Expo)"
        value={dryRunResult.stats?.uniquePushTokensCount ?? 0}
        icon="notifications_active"
        toneClass="bg-purple-50 text-purple-600"
      />
    </div>

    <div className="rounded-2xl border border-slate-200 bg-slate-50/70 p-4 flex flex-col gap-2 text-xs">
      <p className="font-extrabold text-slate-900 m-0">{form.title}</p>
      <p className="text-slate-600 m-0 whitespace-pre-wrap">{form.body}</p>
      <div className="flex flex-wrap gap-2 pt-2 border-t border-slate-200/70">
        <span className="px-2.5 py-1 rounded-full bg-white border border-slate-200 font-semibold text-slate-700">
          Audiencia: {LABEL_BY_VALUE.audience[form.audience]}
        </span>
        <span className="px-2.5 py-1 rounded-full bg-white border border-slate-200 font-semibold text-slate-700">
          Categoría: {LABEL_BY_VALUE.category[form.category]}
        </span>
        <span className="px-2.5 py-1 rounded-full bg-white border border-slate-200 font-semibold text-slate-700">
          Tab: {LABEL_BY_VALUE.targetTab[form.targetTab]}
        </span>
        <span className="px-2.5 py-1 rounded-full bg-white border border-slate-200 font-semibold text-slate-700">
          Estado: {LABEL_BY_VALUE.status[form.status]}
        </span>
      </div>
    </div>

    <div className="flex flex-wrap items-center justify-end gap-2.5 border-t border-slate-100 pt-4">
      <button
        type="button"
        onClick={onBack}
        disabled={isSending}
        className="min-h-11 px-4 py-2 rounded-xl border border-slate-200 bg-white text-xs font-bold text-slate-700 hover:bg-slate-50 transition-colors disabled:opacity-50 cursor-pointer"
      >
        Volver y editar
      </button>
      <button
        type="button"
        onClick={onConfirm}
        disabled={isSending}
        data-testid="broadcast-confirm-send-btn"
        className="min-h-11 px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold flex items-center gap-2 shadow-xs transition-colors disabled:opacity-60 cursor-pointer border-none"
      >
        <span className={`material-symbols-outlined text-[18px] ${isSending ? 'animate-spin' : ''}`}>
          {isSending ? 'sync' : 'send'}
        </span>
        <span>{isSending ? 'Enviando notificaciones...' : 'Confirmar y enviar ahora'}</span>
      </button>
    </div>
  </div>
);

const BroadcastNotificationModal = ({ onClose, onSuccess }) => {
  const dialogRef = useRef(null);
  const headingId = useId();

  const [form, setForm] = useState(INITIAL_FORM);
  const [serverError, setServerError] = useState('');
  const [isSimulating, setIsSimulating] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [dryRunResult, setDryRunResult] = useState(null);

  const isBusy = isSimulating || isSending;

  useEffect(() => {
    const dialog = dialogRef.current;
    if (dialog && !dialog.open) {
      dialog.showModal();
    }
  }, []);

  const handleFieldChange = (field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    if (serverError) setServerError('');
  };

  const handleClose = () => {
    if (isBusy) return;
    if (dialogRef.current) {
      dialogRef.current.returnValue = '';
    }
    onClose();
  };

  const handleConfirmSend = async () => {
    setServerError('');
    setIsSending(true);
    try {
      const result = await sendBroadcastInstitutionalNotification({ ...form, dryRun: false });
      onSuccess?.(result);
      if (dialogRef.current) {
        dialogRef.current.returnValue = 'sent';
      }
      onClose();
    } catch (err) {
      setServerError(err?.message || 'Ocurrió un error al enviar el aviso institucional.');
    } finally {
      setIsSending(false);
    }
  };

  return (
    <dialog
      ref={dialogRef}
      data-testid="broadcast-notification-dialog"
      aria-labelledby={headingId}
      closedby={isBusy ? 'none' : 'closerequest'}
      onClose={handleClose}
      onCancel={(e) => {
        if (isBusy) e.preventDefault();
      }}
      className="m-auto w-[min(94vw,42rem)] max-h-[90svh] overflow-y-auto rounded-3xl border border-slate-200 bg-white p-0 text-left text-slate-800 shadow-2xl backdrop:bg-slate-900/55 backdrop:backdrop-blur-xs"
    >
      <div className="flex items-center justify-between gap-3 border-b border-slate-100 px-6 py-4 sticky top-0 bg-white/95 backdrop-blur-xs z-10">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
            <span className="material-symbols-outlined text-[22px]">campaign</span>
          </div>
          <div>
            <h2 id={headingId} className="text-base font-extrabold text-slate-900 m-0">
              {dryRunResult ? 'Confirmar Envío Masivo (Dry-Run)' : 'Nuevo Aviso Institucional'}
            </h2>
            <p className="text-xs text-slate-500 m-0">
              {dryRunResult
                ? 'Revisá las estadísticas previas antes de confirmar el envío real.'
                : 'Configurá el mensaje, destinatarios y metadatos para la app móvil.'}
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={handleClose}
          disabled={isBusy}
          aria-label="Cerrar modal de aviso institucional"
          className="p-2 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors disabled:opacity-40 cursor-pointer border-none bg-transparent"
        >
          <span className="material-symbols-outlined text-[20px]">close</span>
        </button>
      </div>

      <div className="px-6 py-5 flex flex-col gap-4">
        {serverError && (
          <div
            role="status"
            aria-live="polite"
            className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-xs font-semibold text-rose-700 flex items-center gap-2"
          >
            <span className="material-symbols-outlined text-[18px] shrink-0">error</span>
            <span>{serverError}</span>
          </div>
        )}

        {!dryRunResult ? (
          <BroadcastFormStep
            form={form}
            onFieldChange={handleFieldChange}
            onCancel={handleClose}
            onSimulated={setDryRunResult}
            onError={setServerError}
            isSimulating={isSimulating}
            setIsSimulating={setIsSimulating}
          />
        ) : (
          <BroadcastPreviewStep
            form={form}
            dryRunResult={dryRunResult}
            isSending={isSending}
            onBack={() => setDryRunResult(null)}
            onConfirm={handleConfirmSend}
          />
        )}
      </div>
    </dialog>
  );
};

export default BroadcastNotificationModal;
