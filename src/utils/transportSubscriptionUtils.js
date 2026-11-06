import { TRANSPORT_ROUTES, SPRINTER_CAPACITY } from './academicUtils.js';

/**
 * Capacidad estándar del vehículo escolar oficial Mercedes-Benz Sprinter
 */
export const SPRINTER_STANDARD_CAPACITY = SPRINTER_CAPACITY || 15;

/**
 * Obtiene la fecha actual en formato local ISO 'YYYY-MM-DD'
 */
export const getTodayDateString = (date = new Date()) => {
  const d = date instanceof Date ? date : new Date(date);
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

/**
 * Formatea una fecha 'YYYY-MM-DD' o Date a formato legible 'DD/MM/AAAA'
 */
export const formatDateDisplay = (dateValue) => {
  if (!dateValue) return 'Fecha no registrada';
  try {
    if (typeof dateValue === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(dateValue.trim())) {
      const [year, month, day] = dateValue.trim().split('-');
      return `${day}/${month}/${year}`;
    }
    const d = new Date(dateValue);
    if (isNaN(d.getTime())) return String(dateValue);
    const day = String(d.getDate()).padStart(2, '0');
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const year = d.getFullYear();
    return `${day}/${month}/${year}`;
  } catch {
    return String(dateValue);
  }
};

/**
 * Calcula el 1º día del mes siguiente para la baja programada
 */
export const getNextMonthFirstDay = (referenceDate = new Date()) => {
  const d = referenceDate instanceof Date ? referenceDate : new Date(referenceDate);
  const nextMonthYear = d.getMonth() === 11 ? d.getFullYear() + 1 : d.getFullYear();
  const nextMonth = (d.getMonth() + 1) % 12;
  const firstDay = new Date(nextMonthYear, nextMonth, 1);
  return {
    iso: getTodayDateString(firstDay),
    display: formatDateDisplay(getTodayDateString(firstDay)),
    monthName: firstDay.toLocaleDateString('es-AR', { month: 'long', year: 'numeric' }),
  };
};

/**
 * Evalúa si una suscripción a cualquier servicio fue iniciada hoy y por ende se puede dar de baja en el día
 */
export const canCancelServiceToday = (startDateStr, today = new Date()) => {
  if (!startDateStr) return true;
  const todayStr = getTodayDateString(today);
  return String(startDateStr).trim().slice(0, 10) === todayStr;
};

export const UNIVERSAL_CANCELLATION_POLICY_MESSAGE =
  'Solo un administrador podrá gestionar la baja inmediata dentro del mes en curso si se requiere. La solicitud actual surtirá efecto a partir del 1º del mes siguiente.';

/**
 * Evalúa si la suscripción de transporte fue realizada hoy y por ende se puede dar de baja en el día
 */
export const canCancelTransportToday = (student, today = new Date()) => {
  if (!student) return true;
  return canCancelServiceToday(student.transporteFechaInicio, today);
};

/**
 * Calcula la ocupación actual de un recorrido de transporte dado
 */
export const getTransportRouteOccupancy = (
  routeId,
  students = [],
  routes = TRANSPORT_ROUTES,
  maxCapacity = SPRINTER_STANDARD_CAPACITY
) => {
  if (!routeId) {
    return {
      ocupados: 0,
      capacidad: maxCapacity,
      disponibles: maxCapacity,
      estaLleno: false,
      porcentaje: 0,
    };
  }

  const cleanRoute = String(routeId).trim().toLowerCase();
  const matchedRoute = (routes || TRANSPORT_ROUTES).find(
    (r) =>
      r.id.toLowerCase() === cleanRoute ||
      r.nombre.toLowerCase() === cleanRoute
  );
  const effectiveCapacity = matchedRoute?.capacidadMaxima || maxCapacity;

  const count = (students || []).filter((st) => {
    const servicios = Array.isArray(st.servicios) ? st.servicios : [];
    const hasTransport = servicios.some((s) =>
      String(s).toLowerCase().includes('transporte')
    );
    if (!hasTransport) return false;
    const stRoute = String(st.recorridoTransporte || '').trim().toLowerCase();
    return (
      stRoute === cleanRoute ||
      (matchedRoute &&
        (stRoute === matchedRoute.id.toLowerCase() ||
          stRoute === matchedRoute.nombre.toLowerCase()))
    );
  }).length;

  return {
    ocupados: count,
    capacidad: effectiveCapacity,
    disponibles: Math.max(0, effectiveCapacity - count),
    estaLleno: count >= effectiveCapacity,
    porcentaje: Math.min(100, Math.round((count / effectiveCapacity) * 100)),
  };
};

const ARS_CURRENCY_FORMATTER = new Intl.NumberFormat('es-AR', {
  style: 'currency',
  currency: 'ARS',
  maximumFractionDigits: 0,
});

/**
 * Calcula el proporcional del mes según la fecha de inicio de suscripción
 * (Regla de facturación escolar)
 */
export const calculateMonthlyProportional = ({
  startDate,
  monthlyRate = 18000,
  referenceDate = new Date(),
}) => {
  const d = startDate ? new Date(startDate) : new Date(referenceDate);
  const validDate = isNaN(d.getTime()) ? new Date(referenceDate) : d;

  const year = validDate.getFullYear();
  const month = validDate.getMonth();
  const startDay = validDate.getDate();

  // Días totales en el mes
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  // Días restantes activos en el mes (incluyendo el día de inicio)
  const activeDays = Math.max(1, daysInMonth - startDay + 1);

  const dailyRate = monthlyRate / daysInMonth;
  const proportionalAmount = Math.round(dailyRate * activeDays);
  const percentage = Math.round((activeDays / daysInMonth) * 100);

  return {
    daysInMonth,
    startDay,
    activeDays,
    dailyRate: Math.round(dailyRate),
    proportionalAmount,
    formattedProportional: ARS_CURRENCY_FORMATTER.format(proportionalAmount),
    formattedMonthlyRate: ARS_CURRENCY_FORMATTER.format(monthlyRate),
    percentage,
  };
};
