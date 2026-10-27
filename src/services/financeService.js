import {
  collection,
  doc,
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

const MONTH_NUMBERS = {
  'Marzo 2026': '03',
  'Abril 2026': '04',
  'Mayo 2026': '05',
  'Junio 2026': '06',
  'Julio 2026': '07',
  'Agosto 2026': '08',
  'Septiembre 2026': '09',
  'Octubre 2026': '10',
};

const PAST_MONTHS = [
  'Marzo 2026',
  'Abril 2026',
  'Mayo 2026',
  'Junio 2026',
  'Julio 2026',
  'Agosto 2026',
  'Septiembre 2026',
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
  const monthNum = MONTH_NUMBERS[month] || '10';
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
        const familyCode = `#FAM-${familyKey.slice(-4).toUpperCase()}`;

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

      const docId = `rec-${slugify(fam.familyCode)}-${slugify(month)}`;

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
 * Obtiene o inicializa en Firestore los comprobantes para el mes indicado.
 */
export const fetchOrSeedMonthReceiptsApi = async (month) => {
  await ensureAdminAuth();

  const isPastMonth = PAST_MONTHS.includes(month);
  const receiptsRef = collection(db, RECEIPTS_COLLECTION);
  const q = query(receiptsRef, where('month', '==', month));
  const snap = await getDocs(q);

  if (!snap.empty) {
    let needsSanitization = false;
    const batch = writeBatch(db);

    const list = snap.docs.map((d) => {
      const data = d.data();
      // Si no es mes pasado y el comprobante contiene mock anterior no subido por tutor, sanitizarlo
      if (!isPastMonth && data.bankingVoucher && !data.bankingVoucher.isUploadedByTutor) {
        needsSanitization = true;
        const cleaned = {
          ...data,
          id: d.id,
          uploadDate: 'Sin comprobante',
          uploadTime: 'Pendiente',
          bankingVoucher: null,
        };
        batch.set(doc(db, RECEIPTS_COLLECTION, d.id), cleaned);
        return cleaned;
      }
      return {
        ...data,
        id: d.id,
      };
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
      const list = snapshot.docs.map((d) => {
        const data = d.data();
        if (!isPastMonth && data.bankingVoucher && !data.bankingVoucher.isUploadedByTutor) {
          return {
            ...data,
            id: d.id,
            uploadDate: 'Sin comprobante',
            uploadTime: 'Pendiente',
            bankingVoucher: null,
          };
        }
        return {
          ...data,
          id: d.id,
        };
      });
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
 */
export const approvePaymentApi = async (receiptId, explicitReceiptNumber = null) => {
  await ensureAdminAuth();

  const receiptNumber =
    explicitReceiptNumber || `#REC-2026-${Math.floor(1000 + Math.random() * 9000)}`;

  const docRef = doc(db, RECEIPTS_COLLECTION, receiptId);
  await updateDoc(docRef, {
    status: 'aprobado',
    receiptNumber,
    'bankingVoucher.voucherStatus': 'Conciliado OK',
    validatedAt: serverTimestamp(),
  });

  return receiptNumber;
};

/**
 * Observa / rechaza un comprobante de pago en Firestore con el motivo especificado.
 */
export const rejectPaymentApi = async (receiptId, reason) => {
  await ensureAdminAuth();

  const finalReason = reason || 'Comprobante observado por el área de tesorería.';
  const docRef = doc(db, RECEIPTS_COLLECTION, receiptId);

  await updateDoc(docRef, {
    status: 'rechazado',
    rejectionReason: finalReason,
    'bankingVoucher.voucherStatus': 'Observado',
    rejectedAt: serverTimestamp(),
  });

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

    if (!snap.empty) {
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


