import {
  collection,
  doc,
  getDoc,
  getDocs,
  updateDoc,
  query,
  where,
  onSnapshot,
  serverTimestamp,
  writeBatch,
} from 'firebase/firestore';
import { db } from './firebase';
import { ensureAdminAuth } from './teachersService';
import { fetchTariffsConfig } from './tariffsService';
import { fetchSportsActivities } from './sportsService';
import { INITIAL_RECEIPTS } from '../data/mockFinanceData';

const RECEIPTS_COLLECTION = 'finance_receipts';

export const SPANISH_MONTH_NAMES = [
  'Enero',
  'Febrero',
  'Marzo',
  'Abril',
  'Mayo',
  'Junio',
  'Julio',
  'Agosto',
  'Septiembre',
  'Octubre',
  'Noviembre',
  'Diciembre',
];

const MONTH_NUMBERS = {
  'Marzo 2026': '03',
  'Abril 2026': '04',
  'Mayo 2026': '05',
  'Junio 2026': '06',
  'Julio 2026': '07',
  'Agosto 2026': '08',
  'Septiembre 2026': '09',
  'Octubre 2026': '10',
  'Noviembre 2026': '11',
  'Diciembre 2026': '12',
};

const PAST_MONTHS = [
  'Marzo 2026',
  'Abril 2026',
  'Mayo 2026',
  'Junio 2026',
  'Julio 2026',
  'Agosto 2026',
  'Septiembre 2026',
  'Octubre 2026',
];

const DEFAULT_LEVEL_PRICES = {
  inicial: 52000,
  primario: 65000,
  secundario: 74500,
};

const DEFAULT_SPORT_PRICE = 14500;

/**
 * Normaliza DNI removiendo puntos, espacios y caracteres no numéricos.
 */
const cleanDni = (val) => String(val || '').replace(/\D/g, '');

/**
 * Genera un código de familia seguro para usar como ID de documento Firestore.
 */
const slugify = (text) =>
  String(text || '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');

/**
 * Construye los comprobantes de un mes cruzando alumnos, tutores,
 * disciplinas deportivas extracurriculares y las tarifas vigentes.
 */
export const buildMonthReceipts = ({
  month,
  students = [],
  parents = [],
  disciplines = [],
  tariffsConfig = null,
  baseReceipts = INITIAL_RECEIPTS,
}) => {
  const isPastMonth = PAST_MONTHS.includes(month);
  const monthNum = getMonthNumber(month);
  let academicLevels = DEFAULT_LEVEL_PRICES;
  if (Array.isArray(tariffsConfig?.tariffs?.academicLevels)) {
    const map = {};
    tariffsConfig.tariffs.academicLevels.forEach((l) => {
      if (l.id) map[l.id] = Number(l.amount) || 0;
    });
    academicLevels = { ...DEFAULT_LEVEL_PRICES, ...map };
  } else if (tariffsConfig?.academicLevels) {
    academicLevels = { ...DEFAULT_LEVEL_PRICES, ...tariffsConfig.academicLevels };
  }
  const sportsTariffs = tariffsConfig?.sportsPrices || tariffsConfig?.sports || tariffsConfig?.sportsActivities || {};

  // Función auxiliar para obtener el precio base de nivel
  const getLevelPrice = (rawNivel) => {
    const n = String(rawNivel || '').toLowerCase();
    if (n.includes('ini')) return Number(academicLevels.inicial) || DEFAULT_LEVEL_PRICES.inicial;
    if (n.includes('sec')) return Number(academicLevels.secundario) || DEFAULT_LEVEL_PRICES.secundario;
    return Number(academicLevels.primario) || DEFAULT_LEVEL_PRICES.primario;
  };

  // Función auxiliar para obtener las actividades extracurriculares de un alumno
  const getStudentSports = (student) => {
    const sId = String(student.id || '').trim();
    const sDni = cleanDni(student.dni);
    const sLeg = String(student.legajo || '').trim().toLowerCase();
    const sName = String(student.name || student.nombre || '').trim().toLowerCase();

    const enrolled = [];
    (disciplines || []).forEach((disc) => {
      const inscriptos = Array.isArray(disc.inscriptos) ? disc.inscriptos : [];
      const isIn = inscriptos.some((ins) => {
        if (!ins) return false;
        const insId = String(ins.id || '').trim();
        const insDni = cleanDni(ins.dni);
        const insLeg = String(ins.legajo || '').trim().toLowerCase();
        const insName = String(ins.nombre || ins.name || '').trim().toLowerCase();

        if (sId && insId && sId === insId) return true;
        if (sDni && insDni && sDni === insDni) return true;
        if (sLeg && insLeg && sLeg === insLeg) return true;
        if (
          sName &&
          insName &&
          (sName === insName || sName.includes(insName) || insName.includes(sName))
        ) {
          return true;
        }
        return false;
      });

      if (isIn) {
        const sportPrice =
          Number(sportsTariffs[disc.id]) ||
          Number(sportsTariffs[disc.nombre]) ||
          Number(sportsTariffs[disc.nombre?.toLowerCase()]) ||
          Number(disc.price) ||
          Number(disc.precio) ||
          DEFAULT_SPORT_PRICE;

        enrolled.push({
          disciplineId: disc.id,
          name: disc.nombre,
          price: sportPrice,
        });
      }
    });

    return enrolled;
  };

  // Si hay alumnos reales en Firestore o provistos, agrupamos por tutor/familia
  if (students && students.length > 0) {
    // Agrupar alumnos por familia (parentId o tutorDni o emailPadre)
    const familiesMap = new Map();

    students.forEach((student) => {
      const parent =
        (parents || []).find((p) => p.id && student.parentId && p.id === student.parentId) ||
        (parents || []).find(
          (p) => Array.isArray(p.studentIds) && p.studentIds.includes(student.id)
        ) ||
        (parents || []).find(
          (p) =>
            p.email &&
            student.emailPadre &&
            p.email.trim().toLowerCase() === student.emailPadre.trim().toLowerCase()
        ) ||
        null;

      const familyKey =
        parent?.id ||
        cleanDni(parent?.dni) ||
        cleanDni(student.tutorDni) ||
        student.emailPadre ||
        student.parentId ||
        student.id;

      if (!familiesMap.has(familyKey)) {
        const tutorNombre =
          parent?.nombre ||
          (student.tutorNombre ? student.tutorNombre.replace(' (Padre)', '').replace(' (Madre)', '').replace(' (Tutor)', '') : 'Tutor Familiar');
        const tutorDni = parent?.dni || student.tutorDni || '28.000.000';
        const familyCode =
          parent?.familyCode ||
          `#FAM-${cleanDni(tutorDni).slice(-4) || String(familiesMap.size + 1).padStart(4, '0')}`;

        familiesMap.set(familyKey, {
          familyKey,
          parent,
          tutorNombre,
          tutorDni,
          familyCode,
          studentsList: [],
        });
      }

      familiesMap.get(familyKey).studentsList.push(student);
    });

    // Mapear cada familia a un comprobante mensual
    return Array.from(familiesMap.values()).map((fam, index) => {
      const children = fam.studentsList.map((st, cIdx) => {
        const basePrice = getLevelPrice(st.nivel);
        const sports = getStudentSports(st);

        const feeBreakdown = [
          {
            id: `fee-base-${st.id || cIdx}`,
            label: `Cuota Base Nivel ${st.nivel || 'Primario'}`,
            amount: basePrice,
            dotClass: 'bg-primary',
          },
        ];

        let sportsTotal = 0;
        sports.forEach((sp) => {
          sportsTotal += sp.price;
          feeBreakdown.push({
            id: `fee-sport-${sp.disciplineId}-${st.id || cIdx}`,
            label: `Taller Extracurricular: ${sp.name}`,
            amount: sp.price,
            dotClass: 'bg-secondary',
          });
        });

        const totalAmount = basePrice + sportsTotal;
        const initials =
          (st.nombre || 'AL')
            .split(' ')
            .map((w) => w[0])
            .slice(0, 2)
            .join('')
            .toUpperCase();

        return {
          id: st.id || `child-${fam.familyKey}-${cIdx}`,
          name: `${st.nombre || ''} ${st.apellido || ''}`.trim() || 'Estudiante',
          initials,
          avatarBg: 'bg-primary/10 text-primary',
          legajo: st.studentID_login || st.legajo || `Leg. #EST-${String(cIdx + 1).padStart(4, '0')}`,
          academicInfo: `${st.cursoDisplay || `${st.curso || '1° Año'} ${st.division || 'A'}`} · Turno Mañana`,
          totalAmount,
          discountNotice: null,
          feeBreakdown,
        };
      });

      const declaredAmount = children.reduce((acc, c) => acc + c.totalAmount, 0);
      const allSportsNames = children.flatMap((c) =>
        c.feeBreakdown.filter((f) => f.dotClass === 'bg-secondary').map((f) => f.label.replace('Taller Extracurricular: ', ''))
      );
      const uniqueSports = Array.from(new Set(allSportsNames));
      const conceptSummary =
        uniqueSports.length > 0
          ? `Cuota + ${uniqueSports.join(', ')}`
          : 'Cuota Curricular';

      const status = isPastMonth ? 'aprobado' : 'pendiente';
      const receiptNumber = isPastMonth
        ? `#REC-2026-${monthNum}${String(index + 1).padStart(3, '0')}`
        : null;

      const uploadDate = isPastMonth ? `10/${monthNum}/2026` : 'Sin comprobante';
      const uploadTime = isPastMonth ? '10:00 hs' : 'Pendiente';
      const voucherStatus = isPastMonth ? 'Conciliado OK' : null;

      const initials = (fam.tutorNombre || 'TF')
        .split(' ')
        .map((w) => w[0])
        .slice(0, 2)
        .join('')
        .toUpperCase();

      const docId = `rec-${slugify(fam.familyKey)}-${slugify(month)}`;

      const bankingVoucher = isPastMonth
        ? {
            payerName: fam.tutorNombre,
            payerCuil: `20-${cleanDni(fam.tutorDni)}-9`,
            operationDate: uploadDate,
            paymentType: 'Monto completo',
            transferredAmount: declaredAmount,
            attachmentName: `comprobante_${slugify(fam.familyCode)}_${monthNum}.pdf`,
            attachmentSize: '340 KB',
            voucherStatus,
          }
        : null;

      return {
        id: docId,
        month,
        familyCode: fam.familyCode,
        tutor: fam.tutorNombre,
        tutorDni: fam.tutorDni,
        tutorUid: fam.parent?.id || null,
        initials,
        avatarBg: 'bg-surface-container-high text-on-surface-variant',
        enrolledChildrenCount: children.length,
        uploadDate,
        uploadTime,
        declaredAmount,
        conceptSummary,
        status,
        receiptNumber,
        rejectionReason: null,
        children,
        bankingVoucher,
      };
    });
  }

  // Si no hay alumnos cargados en Firestore aún, usamos la plantilla base inicial
  // enriqueciéndola con las actividades deportivas y tarifas actuales
  return baseReceipts.map((item, index) => {
    const updatedChildren = item.children.map((child) => {
      // Cruzar con deportes inscritos si existen en Firestore
      const sports = getStudentSports(child);
      const baseFee = child.feeBreakdown[0]?.amount || getLevelPrice(child.academicInfo);

      const feeBreakdown = [
        {
          id: `fee-base-${child.id}`,
          label: child.feeBreakdown[0]?.label || 'Cuota Base Curricular',
          amount: baseFee,
          dotClass: 'bg-primary',
        },
      ];

      // Mantener conceptos que no sean talleres extracurriculares (ej. Comedor, Transporte)
      child.feeBreakdown.slice(1).forEach((existingFee) => {
        const isSport =
          existingFee.label.toLowerCase().includes('taller') ||
          existingFee.label.toLowerCase().includes('natación') ||
          existingFee.dotClass === 'bg-secondary';
        if (!isSport) {
          feeBreakdown.push(existingFee);
        }
      });

      // Añadir todas las actividades extracurriculares en las que esté inscripto en Firestore
      if (sports.length > 0) {
        sports.forEach((sp) => {
          feeBreakdown.push({
            id: `fee-sport-${sp.disciplineId}-${child.id}`,
            label: `Taller Extracurricular: ${sp.name}`,
            amount: sp.price,
            dotClass: 'bg-secondary',
          });
        });
      } else {
        // Si no hay deportes en Firestore, mantener los originales
        child.feeBreakdown.slice(1).forEach((existingFee) => {
          if (existingFee.dotClass === 'bg-secondary' && !feeBreakdown.some((f) => f.id === existingFee.id)) {
            feeBreakdown.push(existingFee);
          }
        });
      }

      const totalAmount = feeBreakdown.reduce((sum, f) => sum + f.amount, 0);

      return {
        ...child,
        feeBreakdown,
        totalAmount,
      };
    });

    const declaredAmount = updatedChildren.reduce((sum, c) => sum + c.totalAmount, 0);
    const allSportsNames = updatedChildren.flatMap((c) =>
      c.feeBreakdown
        .filter((f) => f.dotClass === 'bg-secondary')
        .map((f) => f.label.replace('Taller Extracurricular: ', ''))
    );
    const uniqueSports = Array.from(new Set(allSportsNames));
    const conceptSummary =
      uniqueSports.length > 0
        ? `Cuota + ${uniqueSports.join(', ')}`
        : 'Cuota Curricular';

    const status = isPastMonth ? 'aprobado' : item.status;
    const receiptNumber = isPastMonth
      ? `#REC-2026-${monthNum}${String(index + 1).padStart(3, '0')}`
      : item.receiptNumber;

    const uploadDate = isPastMonth ? `10/${monthNum}/2026` : 'Sin comprobante';
    const uploadTime = isPastMonth ? '10:00 hs' : 'Pendiente';
    const docId = `rec-${slugify(item.familyCode)}-${slugify(month)}`;

    const bankingVoucher = isPastMonth
      ? {
          ...(item.bankingVoucher || {}),
          transferredAmount: declaredAmount,
          operationDate: uploadDate,
          voucherStatus: 'Conciliado OK',
        }
      : null;

    return {
      ...item,
      id: docId,
      month,
      status,
      receiptNumber,
      uploadDate,
      uploadTime,
      declaredAmount,
      conceptSummary,
      children: updatedChildren,
      bankingVoucher,
    };
  });
};

/**
 * Normaliza un documento de comprobante de Firestore soportando múltiples vouchers en vouchersHistory,
 * calculando la sumatoria de sus importes y estandarizando los campos para la interfaz de usuario.
 */
export const normalizeReceiptDoc = (d, isPastMonth = false) => {
  const data = typeof d.data === 'function' ? d.data() : d;
  const id = d.id || data.id;
  const children = Array.isArray(data.children) ? data.children : [];

  let vouchers = [];
  if (Array.isArray(data.vouchersHistory) && data.vouchersHistory.length > 0) {
    vouchers = data.vouchersHistory;
  } else if (
    data.bankingVoucher &&
    (data.bankingVoucher.attachmentName ||
      data.bankingVoucher.downloadUrl ||
      data.bankingVoucher.fileUrl)
  ) {
    vouchers = [data.bankingVoucher];
  }

  const normalizedVouchers = vouchers.map((v, idx) => {
    const vAmount = Number(v.declaredAmount ?? v.transferredAmount ?? v.amount) || 0;
    const vId = v.id || v.operationCode || `vch-${id}-${idx}`;
    return {
      ...v,
      id: vId,
      amount: vAmount,
      declaredAmount: vAmount,
      transferredAmount: vAmount,
      attachmentName: v.attachmentName || 'comprobante_transferencia.pdf',
      attachmentSize: v.attachmentSize || 'Desconocido',
      downloadUrl: v.downloadUrl || v.fileUrl || '',
      fileUrl: v.fileUrl || v.downloadUrl || '',
      operationDate: v.operationDate || data.uploadDate || '',
      operationCode: v.operationCode || 'S/N',
      originBank: v.originBank || 'Transferencia Bancaria',
      payerName: v.payerName || data.tutor || '',
      payerCuil: v.payerCuil || data.tutorDni || '',
      paymentType: v.paymentType || 'Transferencia Bancaria',
      selectedItemLabels: Array.isArray(v.selectedItemLabels) ? v.selectedItemLabels : [],
      voucherStatus:
        v.voucherStatus ||
        (data.status === 'aprobado'
          ? 'Conciliado OK'
          : data.status === 'rechazado'
            ? 'Observado'
            : 'Pendiente de conciliación'),
    };
  });

  const sumVouchers = normalizedVouchers.reduce((acc, v) => acc + (v.amount || 0), 0);
  const declaredAmount =
    sumVouchers > 0 ? sumVouchers : Number(data.declaredAmount) || 0;

  if (
    !isPastMonth &&
    data.bankingVoucher &&
    !data.bankingVoucher.isUploadedByTutor &&
    normalizedVouchers.length === 0
  ) {
    return {
      ...data,
      children,
      id,
      uploadDate: 'Sin comprobante',
      uploadTime: 'Pendiente',
      bankingVoucher: null,
      vouchers: [],
      vouchersHistory: [],
      declaredAmount: 0,
    };
  }

  const primaryVoucher =
    normalizedVouchers.length > 0 ? normalizedVouchers[0] : data.bankingVoucher || null;

  return {
    ...data,
    children,
    id,
    vouchers: normalizedVouchers,
    vouchersHistory: normalizedVouchers,
    bankingVoucher: primaryVoucher,
    declaredAmount,
  };
};

/**
 * Obtiene o inicializa en Firestore los comprobantes para el mes indicado.
 */
export const fetchOrSeedMonthReceiptsApi = async (month) => {
  await ensureAdminAuth();

  const isPastMonth = PAST_MONTHS.includes(month);
  const receiptsRef = collection(db, RECEIPTS_COLLECTION);
  const q = query(receiptsRef, where('month', '==', month));
  const snap = await getDocs(q);

  if (!snap.empty && (isPastMonth || snap.docs.length >= 15)) {
    let needsSanitization = false;
    const batch = writeBatch(db);

    const list = snap.docs.map((d) => {
      const data = d.data();
      const children = Array.isArray(data.children) ? data.children : [];
      // Si no es mes pasado y el comprobante contiene mock anterior no subido por tutor, sanitizarlo
      if (!isPastMonth && data.bankingVoucher && !data.bankingVoucher.isUploadedByTutor) {
        needsSanitization = true;
        const cleaned = {
          ...data,
          children,
          id: d.id,
          uploadDate: 'Sin comprobante',
          uploadTime: 'Pendiente',
          bankingVoucher: null,
        };
        batch.set(doc(db, RECEIPTS_COLLECTION, d.id), cleaned);
        return normalizeReceiptDoc(cleaned, isPastMonth);
      }
      return normalizeReceiptDoc({ ...data, id: d.id }, isPastMonth);
    });

    if (needsSanitization) {
      batch.commit().catch((e) => console.warn('Aviso limpiando vouchers de octubre:', e.message));
    }

    return list;
  }

  // Si no existen en Firestore para este mes, cargamos datos auxiliares y sembramos
  const [tariffsConfig, disciplinesSnap, studentsSnap, usersSnap] = await Promise.all([
    fetchTariffsConfig().catch(() => null),
    fetchSportsActivities().catch(() => []),
    getDocs(collection(db, 'students')).catch(() => ({ docs: [] })),
    getDocs(collection(db, 'users')).catch(() => ({ docs: [] })),
  ]);

  const students = studentsSnap.docs.map((d) => ({ id: d.id, ...d.data() }));
  const allUsers = usersSnap.docs.map((d) => ({ id: d.id, ...d.data() }));
  const parents = allUsers.filter((u) => String(u.role || '').trim().toLowerCase() === 'padre');

  const generatedReceipts = buildMonthReceipts({
    month,
    students,
    parents,
    disciplines: disciplinesSnap,
    tariffsConfig,
    baseReceipts: INITIAL_RECEIPTS,
  });

  // Guardar en batch en Firestore
  try {
    const batch = writeBatch(db);
    generatedReceipts.forEach((r) => {
      const docRef = doc(db, RECEIPTS_COLLECTION, r.id);
      batch.set(docRef, {
        ...r,
        createdAt: serverTimestamp(),
      });
    });
    await batch.commit();
  } catch (err) {
    console.warn(`Aviso guardando comprobantes iniciales del mes ${month} en Firestore:`, err.message);
  }

  return generatedReceipts;
};

/**
 * Se suscribe en tiempo real a los comprobantes de un mes.
 */
export const subscribeToMonthReceipts = (month, onUpdate, onError) => {
  const receiptsRef = collection(db, RECEIPTS_COLLECTION);
  const q = query(receiptsRef, where('month', '==', month));

  return onSnapshot(
    q,
    (snapshot) => {
      if (snapshot.empty) {
        // Ejecutar sembrado si está vacío
        fetchOrSeedMonthReceiptsApi(month)
          .then((data) => onUpdate(data))
          .catch((err) => {
            if (onError) onError(err);
          });
        return;
      }

      const isPastMonth = PAST_MONTHS.includes(month);
      const list = snapshot.docs.map((d) => normalizeReceiptDoc(d, isPastMonth));
      onUpdate(list);
    },
    (err) => {
      console.error(`Error en suscripción de comprobantes para ${month}:`, err);
      if (onError) onError(err);
    }
  );
};

/**
 * Aprueba un comprobante de pago en Firestore y asigna el número de recibo oficial.
 * Soporta aprobación global o de un voucher específico dentro de vouchersHistory.
 */
export const approvePaymentApi = async (
  receiptId,
  explicitReceiptNumber = null,
  voucherId = null
) => {
  await ensureAdminAuth();

  const docRef = doc(db, RECEIPTS_COLLECTION, receiptId);
  const snap = await getDoc(docRef);
  const data = snap.exists() ? snap.data() : {};

  const receiptNumber =
    explicitReceiptNumber ||
    data.receiptNumber ||
    `#REC-2026-${1000 + (crypto.getRandomValues(new Uint32Array(1))[0] % 9000)}`;

  let vouchers =
    Array.isArray(data.vouchersHistory) && data.vouchersHistory.length > 0
      ? [...data.vouchersHistory]
      : data.bankingVoucher
        ? [{ ...data.bankingVoucher }]
        : [];

  if (voucherId && vouchers.length > 0) {
    vouchers = vouchers.map((v) => {
      if (v.id === voucherId || v.operationCode === voucherId) {
        return { ...v, voucherStatus: 'Conciliado OK', rejectionReason: null };
      }
      return v;
    });
  } else if (vouchers.length > 0) {
    vouchers = vouchers.map((v) => ({
      ...v,
      voucherStatus: 'Conciliado OK',
      rejectionReason: null,
    }));
  }

  const allApproved =
    vouchers.length === 0 || vouchers.every((v) => v.voucherStatus === 'Conciliado OK');

  const primaryVoucher =
    vouchers.length > 0 ? vouchers[0] : data.bankingVoucher ? { ...data.bankingVoucher } : null;

  if (primaryVoucher && allApproved) {
    primaryVoucher.voucherStatus = 'Conciliado OK';
  }

  const updates = {
    status: allApproved ? 'aprobado' : data.status,
    receiptNumber: allApproved ? receiptNumber : data.receiptNumber || null,
    vouchersHistory: vouchers,
    validatedAt: serverTimestamp(),
  };

  if (primaryVoucher) {
    updates.bankingVoucher = primaryVoucher;
  }

  await updateDoc(docRef, updates);

  return receiptNumber;
};

/**
 * Observa / rechaza un comprobante de pago en Firestore con el motivo especificado.
 * Soporta rechazo global o de un voucher específico dentro de vouchersHistory.
 */
export const rejectPaymentApi = async (receiptId, reason, voucherId = null) => {
  await ensureAdminAuth();

  const finalReason = reason || 'Comprobante observado por el área de tesorería.';
  const docRef = doc(db, RECEIPTS_COLLECTION, receiptId);
  const snap = await getDoc(docRef);
  const data = snap.exists() ? snap.data() : {};

  let vouchers =
    Array.isArray(data.vouchersHistory) && data.vouchersHistory.length > 0
      ? [...data.vouchersHistory]
      : data.bankingVoucher
        ? [{ ...data.bankingVoucher }]
        : [];

  if (voucherId && vouchers.length > 0) {
    vouchers = vouchers.map((v) => {
      if (v.id === voucherId || v.operationCode === voucherId) {
        return { ...v, voucherStatus: 'Observado', rejectionReason: finalReason };
      }
      return v;
    });
  } else if (vouchers.length > 0) {
    vouchers = vouchers.map((v) => ({
      ...v,
      voucherStatus: 'Observado',
      rejectionReason: finalReason,
    }));
  }

  const primaryVoucher =
    vouchers.length > 0 ? vouchers[0] : data.bankingVoucher ? { ...data.bankingVoucher } : null;

  if (primaryVoucher) {
    primaryVoucher.voucherStatus = 'Observado';
    primaryVoucher.rejectionReason = finalReason;
  }

  const updates = {
    status: 'rechazado',
    rejectionReason: finalReason,
    vouchersHistory: vouchers,
    rejectedAt: serverTimestamp(),
  };

  if (primaryVoucher) {
    updates.bankingVoucher = primaryVoucher;
  }

  await updateDoc(docRef, updates);

  return finalReason;
};

/**
 * Recalcula el saldo de todos los tutores/comprobantes para el mes indicado,
 * sincronizando las inscripciones a actividades extracurriculares y tarifas actuales
 * con Firebase Firestore.
 */
export const recalculateAllBalancesApi = async (month) => {
  await ensureAdminAuth();

  // 1. Obtener datos frescos desde Firestore en paralelo
  const [tariffsConfig, disciplines, studentsSnap, receiptsSnap] = await Promise.all([
    fetchTariffsConfig().catch(() => null),
    fetchSportsActivities().catch(() => []),
    getDocs(collection(db, 'students')).catch(() => ({ docs: [] })),
    getDocs(query(collection(db, RECEIPTS_COLLECTION), where('month', '==', month))).catch(() => ({ docs: [] })),
  ]);

  const students = studentsSnap.docs.map((d) => ({ id: d.id, ...d.data() }));

  // Si no existen recibos para este mes, inicializarlos
  if (receiptsSnap.empty) {
    return await fetchOrSeedMonthReceiptsApi(month);
  }

  // 2. Extraer precios de niveles y de actividades deportivas
  let academicLevels = DEFAULT_LEVEL_PRICES;
  if (Array.isArray(tariffsConfig?.tariffs?.academicLevels)) {
    const map = {};
    tariffsConfig.tariffs.academicLevels.forEach((l) => {
      if (l.id) map[l.id] = Number(l.amount) || 0;
    });
    academicLevels = { ...DEFAULT_LEVEL_PRICES, ...map };
  } else if (tariffsConfig?.academicLevels) {
    academicLevels = { ...DEFAULT_LEVEL_PRICES, ...tariffsConfig.academicLevels };
  }
  const sportsTariffs =
    tariffsConfig?.sportsPrices || tariffsConfig?.sports || tariffsConfig?.sportsActivities || {};

  const getLevelPrice = (rawNivel) => {
    const n = String(rawNivel || '').toLowerCase();
    if (n.includes('ini')) return Number(academicLevels.inicial) || DEFAULT_LEVEL_PRICES.inicial;
    if (n.includes('sec')) return Number(academicLevels.secundario) || DEFAULT_LEVEL_PRICES.secundario;
    return Number(academicLevels.primario) || DEFAULT_LEVEL_PRICES.primario;
  };

  const getStudentSports = (student) => {
    const sId = String(student.id || '').trim();
    const sDni = cleanDni(student.dni);
    const sLeg = String(student.legajo || '').trim().toLowerCase();
    const sName = String(student.name || student.nombre || '').trim().toLowerCase();

    const enrolled = [];
    (disciplines || []).forEach((disc) => {
      const inscriptos = Array.isArray(disc.inscriptos) ? disc.inscriptos : [];
      const isIn = inscriptos.some((ins) => {
        if (!ins) return false;
        const insId = String(ins.id || '').trim();
        const insDni = cleanDni(ins.dni);
        const insLeg = String(ins.legajo || '').trim().toLowerCase();
        const insName = String(ins.nombre || ins.name || '').trim().toLowerCase();

        if (sId && insId && sId === insId) return true;
        if (sDni && insDni && sDni === insDni) return true;
        if (sLeg && insLeg && sLeg === insLeg) return true;
        if (
          sName &&
          insName &&
          (sName === insName || sName.includes(insName) || insName.includes(sName))
        ) {
          return true;
        }
        return false;
      });

      if (isIn) {
        const sportPrice =
          Number(sportsTariffs[disc.id]) ||
          Number(sportsTariffs[disc.nombre]) ||
          Number(sportsTariffs[disc.nombre?.toLowerCase()]) ||
          Number(disc.price) ||
          Number(disc.precio) ||
          DEFAULT_SPORT_PRICE;

        enrolled.push({
          disciplineId: disc.id,
          name: disc.nombre,
          price: sportPrice,
        });
      }
    });

    return enrolled;
  };

  // 3. Recalcular cada comprobante en Firestore
  const batch = writeBatch(db);
  const updatedReceipts = [];

  for (const docSnap of receiptsSnap.docs) {
    const currentData = docSnap.data();
    const existingChildren = Array.isArray(currentData.children) ? currentData.children : [];

    const updatedChildren = existingChildren.map((child, cIdx) => {
      const sId = String(child.id || '').trim();
      const sLeg = String(child.legajo || '').trim().toLowerCase();
      const sName = String(child.name || child.nombre || '').trim().toLowerCase();

      const matchedStudent = students.find((st) => {
        const stId = String(st.id || '').trim();
        const stLeg = String(st.legajo || st.studentID_login || '').trim().toLowerCase();
        const stName = `${st.nombre || ''} ${st.apellido || ''}`.trim().toLowerCase();
        if (sId && stId && sId === stId) return true;
        if (sLeg && stLeg && sLeg === stLeg) return true;
        if (sName && stName && (sName === stName || sName.includes(stName) || stName.includes(sName))) {
          return true;
        }
        return false;
      });

      const enrichedChild = {
        ...child,
        ...(matchedStudent ? { dni: matchedStudent.dni, nivel: matchedStudent.nivel } : {}),
      };

      const sports = getStudentSports(enrichedChild);
      const baseLevelPrice = getLevelPrice(enrichedChild.nivel || enrichedChild.academicInfo);

      const baseFeeItem = {
        id: child.feeBreakdown?.[0]?.id || `fee-base-${child.id || cIdx}`,
        label: child.feeBreakdown?.[0]?.label || 'Cuota Base Curricular',
        amount: baseLevelPrice > 0 ? baseLevelPrice : (child.feeBreakdown?.[0]?.amount || DEFAULT_LEVEL_PRICES.primario),
        dotClass: 'bg-primary',
      };

      const feeBreakdown = [baseFeeItem];

      // Conservar conceptos no deportivos (Comedor, Transporte, etc.)
      (child.feeBreakdown || []).slice(1).forEach((existingFee) => {
        const isSport =
          existingFee.label.toLowerCase().includes('taller') ||
          existingFee.label.toLowerCase().includes('natación') ||
          existingFee.dotClass === 'bg-secondary';
        if (!isSport) {
          feeBreakdown.push(existingFee);
        }
      });

      // Añadir las actividades extracurriculares encontradas
      sports.forEach((sp) => {
        feeBreakdown.push({
          id: `fee-sport-${sp.disciplineId}-${child.id || cIdx}`,
          label: `Taller Extracurricular: ${sp.name}`,
          amount: sp.price,
          dotClass: 'bg-secondary',
        });
      });

      const totalAmount = feeBreakdown.reduce((sum, f) => sum + f.amount, 0);

      return {
        ...child,
        feeBreakdown,
        totalAmount,
      };
    });

    const declaredAmount = updatedChildren.reduce((sum, c) => sum + c.totalAmount, 0);
    const allSportsNames = updatedChildren.flatMap((c) =>
      c.feeBreakdown
        .filter((f) => f.dotClass === 'bg-secondary')
        .map((f) => f.label.replace('Taller Extracurricular: ', ''))
    );
    const uniqueSports = Array.from(new Set(allSportsNames));
    const conceptSummary =
      uniqueSports.length > 0
        ? `Cuota + ${uniqueSports.join(', ')}`
        : 'Cuota Curricular';

    const updatedDocData = {
      ...currentData,
      id: docSnap.id,
      children: updatedChildren,
      declaredAmount,
      conceptSummary,
      updatedAt: serverTimestamp(),
    };

    updatedReceipts.push(updatedDocData);

    const docRef = doc(db, RECEIPTS_COLLECTION, docSnap.id);
    batch.update(docRef, {
      children: updatedChildren,
      declaredAmount,
      conceptSummary,
      updatedAt: serverTimestamp(),
    });
  }

  await batch.commit();
  return updatedReceipts;
};

/**
 * Obtiene el monto total facturado/declarado de un mes para calcular comparativas reales.
 */
export const fetchMonthTotalApi = async (month) => {
  if (!month) return 0;
  try {
    await ensureAdminAuth();
    const receiptsRef = collection(db, RECEIPTS_COLLECTION);
    const q = query(receiptsRef, where('month', '==', month));
    const snap = await getDocs(q);

    const isPastMonth = PAST_MONTHS.includes(month);
    if (!snap.empty && (isPastMonth || snap.docs.length >= 15)) {
      return snap.docs.reduce(
        (sum, d) => sum + (Number(d.data().declaredAmount) || 0),
        0
      );
    }

    const seeded = await fetchOrSeedMonthReceiptsApi(month);
    return (seeded || []).reduce(
      (sum, r) => sum + (Number(r.declaredAmount) || 0),
      0
    );
  } catch (err) {
    console.warn(`Aviso calculando total del mes ${month}:`, err.message);
    return INITIAL_RECEIPTS.reduce(
      (sum, r) => sum + (Number(r.declaredAmount) || 0),
      0
    );
  }
};

export const getMonthNumber = (month) => {
  if (MONTH_NUMBERS[month]) return MONTH_NUMBERS[month];
  const [name] = String(month || '').split(' ');
  const idx = SPANISH_MONTH_NAMES.findIndex(
    (m) => m.toLowerCase() === (name || '').toLowerCase()
  );
  return idx !== -1 ? String(idx + 1).padStart(2, '0') : '11';
};

export const getMonthLabel = (date = new Date()) => {
  const mIndex = date.getMonth();
  const year = date.getFullYear();
  return `${SPANISH_MONTH_NAMES[mIndex]} ${year}`;
};

export const getNextMonthLabel = (date = new Date()) => {
  const nextDate = new Date(date.getFullYear(), date.getMonth() + 1, 1);
  return `${SPANISH_MONTH_NAMES[nextDate.getMonth()]} ${nextDate.getFullYear()}`;
};

/**
 * Devuelve la información del ciclo de facturación escolar actual:
 * - Mes en curso
 * - Mes siguiente
 * - Si está habilitada la emisión manual para el mes siguiente (a partir del día 20)
 * - Si venció el plazo manual para el mes actual (a partir del día 5)
 */
export const getBillingCycleInfo = (referenceDate = new Date()) => {
  const day = referenceDate.getDate();
  const currentMonth = getMonthLabel(referenceDate);
  const nextMonth = getNextMonthLabel(referenceDate);
  const currentMonthName = SPANISH_MONTH_NAMES[referenceDate.getMonth()];

  const isNextMonthWindow = day >= 20;
  const canEmitNextMonth = isNextMonthWindow;
  const isPastManualDeadlineForCurrentMonth = day >= 5;

  return {
    day,
    currentMonth,
    nextMonth,
    currentMonthName,
    isNextMonthWindow,
    canEmitNextMonth,
    isPastManualDeadlineForCurrentMonth,
  };
};

/**
 * Determina cuál es la acción y período de facturación activo a gestionar:
 * - Si el mes actual aún no fue emitido formalmente, el objetivo prioritario es el mes actual.
 * - Si el mes actual ya fue emitido pero aún no es día 20, el mes siguiente NO se muestra para emitir.
 * - A partir del día 20 de cada mes, se habilita la emisión del mes siguiente.
 */
export const getActiveBillingTarget = (
  cycleInfo,
  isCurrentMonthEmitted,
  isNextMonthEmitted = false
) => {
  const { currentMonth, nextMonth, isNextMonthWindow, currentMonthName } = cycleInfo;

  if (!isCurrentMonthEmitted) {
    return {
      targetMonth: currentMonth,
      label: `Emitir Facturación ${currentMonth}`,
      canEmit: true,
      isEmitted: false,
      tooltip: `Emitir facturas y deudas para todos los alumnos matriculados del ciclo ${currentMonth}.`,
      badgeText: null,
      isCurrentMonth: true,
    };
  }

  if (!isNextMonthWindow) {
    return {
      targetMonth: currentMonth,
      label: `${currentMonth} al día`,
      canEmit: false,
      isEmitted: true,
      tooltip: `La emisión de facturas para ${nextMonth} estará disponible a partir del día 20 de ${currentMonthName}.`,
      badgeText: `${currentMonth} emitido`,
      isCurrentMonth: true,
    };
  }

  if (isNextMonthEmitted) {
    return {
      targetMonth: nextMonth,
      label: `${nextMonth} al día`,
      canEmit: false,
      isEmitted: true,
      tooltip: `La facturación de ${nextMonth} ya fue emitida.`,
      badgeText: `${nextMonth} emitido`,
      isCurrentMonth: false,
    };
  }

  return {
    targetMonth: nextMonth,
    label: `Emitir Facturación ${nextMonth}`,
    canEmit: true,
    isEmitted: false,
    tooltip: `Emitir las facturas y deudas para el ciclo escolar ${nextMonth}.`,
    badgeText: null,
    isCurrentMonth: false,
  };
};

/**
 * Verifica si las facturas de un mes ya fueron emitidas en Firestore o en la configuración.
 */
export const checkMonthEmittedApi = async (month) => {
  if (!month) return false;
  const isPast = PAST_MONTHS.includes(month);

  try {
    await ensureAdminAuth();
  } catch {
    // Si aún no se completó la autenticación inicial, continuar con el intento de lectura
  }

  try {
    const configSnap = await getDoc(doc(db, 'systemConfig', 'billing_emissions'));
    if (configSnap.exists()) {
      const data = configSnap.data();
      if (data && data[month]) {
        return true;
      }
    }
  } catch (err) {
    console.warn(`Aviso verificando emisión de ${month} en systemConfig:`, err.message);
  }

  try {
    const receiptsRef = collection(db, RECEIPTS_COLLECTION);
    const q = query(receiptsRef, where('month', '==', month));
    const snap = await getDocs(q);
    // Para considerarse emitido por documentos, debe contar con al menos un volumen representativo
    // de familias (ej. >= 15), evitando falsos positivos por 1 o 2 recibos de prueba aislados.
    if (!snap.empty && (isPast || snap.docs.length >= 15)) {
      return true;
    }
  } catch (err) {
    console.warn(`Aviso verificando emisión de ${month} en receipts:`, err.message);
  }

  return false;
};

/**
 * Emite las facturas y deudas escolares para un mes específico.
 * Cruza alumnos, tutores, disciplinas deportivas y tarifas institucionales vigentes.
 * Preserva estados y comprobantes bancarios ya cargados por tutores para este período.
 */
export const emitMonthBillingApi = async (month, options = {}) => {
  await ensureAdminAuth();

  const [tariffsConfig, disciplinesSnap, studentsSnap, usersSnap, existingReceiptsSnap] =
    await Promise.all([
      fetchTariffsConfig().catch(() => null),
      fetchSportsActivities().catch(() => []),
      getDocs(collection(db, 'students')).catch(() => ({ docs: [] })),
      getDocs(collection(db, 'users')).catch(() => ({ docs: [] })),
      getDocs(query(collection(db, RECEIPTS_COLLECTION), where('month', '==', month))).catch(() => ({ docs: [] })),
    ]);

  const students = studentsSnap.docs.map((d) => ({ id: d.id, ...d.data() }));
  const allUsers = usersSnap.docs.map((d) => ({ id: d.id, ...d.data() }));
  const parents = allUsers.filter((u) => String(u.role || '').trim().toLowerCase() === 'padre');

  // Mapear recibos preexistentes para no perder comprobantes ni pagos ya registrados
  const existingMap = new Map();
  (existingReceiptsSnap.docs || []).forEach((d) => {
    const data = d.data();
    if (d.id) existingMap.set(d.id, { docId: d.id, ...data });
    if (data.tutorUid) existingMap.set(data.tutorUid, { docId: d.id, ...data });
    if (data.parentId) existingMap.set(data.parentId, { docId: d.id, ...data });
    if (data.tutorDni) existingMap.set(cleanDni(data.tutorDni), { docId: d.id, ...data });
    if (data.familyCode) existingMap.set(String(data.familyCode).toLowerCase(), { docId: d.id, ...data });
  });

  const generatedReceipts = buildMonthReceipts({
    month,
    students,
    parents,
    disciplines: disciplinesSnap,
    tariffsConfig,
    baseReceipts: INITIAL_RECEIPTS,
  });

  // Fusionar con recibos existentes respetando comprobantes y estados ya conciliados o cargados
  const finalReceipts = generatedReceipts.map((r) => {
    const matched =
      (r.tutorUid && existingMap.get(r.tutorUid)) ||
      (r.tutorDni && existingMap.get(cleanDni(r.tutorDni))) ||
      (r.familyCode && existingMap.get(String(r.familyCode).toLowerCase())) ||
      existingMap.get(r.id);

    if (matched) {
      return {
        ...r,
        id: matched.docId || r.id,
        status: matched.status || r.status,
        receiptNumber: matched.receiptNumber || r.receiptNumber,
        uploadDate: matched.uploadDate || r.uploadDate,
        uploadTime: matched.uploadTime || r.uploadTime,
        rejectionReason: matched.rejectionReason || r.rejectionReason,
        bankingVoucher: matched.bankingVoucher || r.bankingVoucher,
        validatedAt: matched.validatedAt || null,
        rejectedAt: matched.rejectedAt || null,
      };
    }
    return r;
  });

  const BATCH_SIZE = 400;
  for (let i = 0; i < finalReceipts.length; i += BATCH_SIZE) {
    const chunk = finalReceipts.slice(i, i + BATCH_SIZE);
    const batch = writeBatch(db);
    chunk.forEach((r) => {
      const docRef = doc(db, RECEIPTS_COLLECTION, r.id);
      batch.set(docRef, {
        ...r,
        createdAt: serverTimestamp(),
      });
    });
    await batch.commit();
  }

  try {
    const batch = writeBatch(db);
    const emissionsDocRef = doc(db, 'systemConfig', 'billing_emissions');
    batch.set(
      emissionsDocRef,
      {
        [month]: {
          emittedAt: new Date().toISOString(),
          emittedBy: options.emittedBy || 'Administración',
          type: options.isAutomatic ? 'automatic' : 'manual',
          count: finalReceipts.length,
        },
        updatedAt: serverTimestamp(),
      },
      { merge: true }
    );
    await batch.commit();
  } catch (err) {
    console.warn(`Aviso guardando registro en billing_emissions:`, err.message);
  }

  return {
    success: true,
    alreadyExisted: false,
    count: finalReceipts.length,
    receipts: finalReceipts,
    month,
    isAutomatic: Boolean(options.isAutomatic),
  };
};

/**
 * Evalúa si se debe ejecutar la emisión automática al iniciar sesión un administrador:
 * Si para el día 5 de un mes no se emitieron las facturas de dicho mes,
 * se ejecuta la emisión automática y se devuelve la información para notificar con modal.
 */
export const checkAndExecuteAutoBillingEmissionApi = async (
  currentUser,
  referenceDate = new Date()
) => {
  if (!currentUser) return null;

  const role = String(currentUser.rol || currentUser.role || '').toLowerCase();
  const isAdmin =
    role === 'user_admin' ||
    role === 'directivo' ||
    role === 'administrador' ||
    role === 'admin' ||
    role === 'director' ||
    role === 'administrativo';

  if (!isAdmin) return null;

  const cycleInfo = getBillingCycleInfo(referenceDate);
  const currentMonth = cycleInfo.currentMonth;

  if (!cycleInfo.isPastManualDeadlineForCurrentMonth) {
    return null;
  }

  const isEmitted = await checkMonthEmittedApi(currentMonth);
  if (isEmitted) {
    return null;
  }

  const sessionKey = `billing_auto_emitted_in_progress_${currentMonth}`;
  if (sessionStorage.getItem(sessionKey)) {
    return null;
  }
  sessionStorage.setItem(sessionKey, 'true');

  try {
    const emitterName =
      currentUser.nombreCompleto || currentUser.nombre || currentUser.email || 'Sistema Automático';

    const result = await emitMonthBillingApi(currentMonth, {
      emittedBy: emitterName,
      isAutomatic: true,
    });

    return {
      autoEmitted: true,
      month: currentMonth,
      count: result.count,
    };
  } catch (err) {
    console.error('Error durante la emisión automática de facturas:', err);
    sessionStorage.removeItem(sessionKey);
    return null;
  }
};


