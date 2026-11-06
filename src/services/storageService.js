import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { auth, storage } from './firebase.js';

export const MAX_FILE_SIZE_BYTES = 2 * 1024 * 1024; // 2 MB
export const ALLOWED_FILE_EXTENSIONS = ['.pdf', '.png', '.jpg', '.jpeg'];
export const ALLOWED_MIME_TYPES = [
  'application/pdf',
  'image/png',
  'image/jpeg',
  'image/jpg',
];

/**
 * Valida que un archivo cumpla con el límite de 2 MB y los tipos autorizados (PDF, PNG, JPG, JPEG)
 */
export const validateUploadedFile = (file) => {
  if (!file) {
    return { valid: false, error: 'No se ha seleccionado ningún archivo.' };
  }

  if (file.size > MAX_FILE_SIZE_BYTES) {
    return {
      valid: false,
      error: `El archivo seleccionado (${(file.size / (1024 * 1024)).toFixed(2)} MB) excede el tamaño máximo permitido de 2 MB.`,
    };
  }

  const name = String(file.name || '').toLowerCase();
  const hasValidExt = ALLOWED_FILE_EXTENSIONS.some((ext) => name.endsWith(ext));
  const hasValidMime = file.type ? ALLOWED_MIME_TYPES.includes(file.type.toLowerCase()) : false;

  if (!hasValidExt && !hasValidMime) {
    return {
      valid: false,
      error: 'Formato de archivo no válido. Solo se admiten documentos PDF e imágenes PNG, JPG o JPEG.',
    };
  }

  return { valid: true, error: null };
};

/**
 * Formatea el tamaño en KB o MB legible
 */
export const formatFileSize = (bytes) => {
  if (!bytes || Number.isNaN(bytes)) return '0 KB';
  if (bytes < 1024 * 1024) {
    return `${Math.round(bytes / 1024)} KB`;
  }
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
};

/**
 * Sube un archivo a Firebase Storage en una ruta protegida asociada al usuario y registro
 *
 * @param {Object} options
 * @param {File} options.file Archivo a subir
 * @param {string} options.folder Carpeta de destino ('vouchers' | 'justifications')
 * @param {string} options.userId UID del usuario tutor autenticado
 * @param {string} [options.recordId] ID del registro asociado (factura o falta)
 * @returns {Promise<{ downloadUrl: string, fileName: string, fileSize: string, storagePath: string }>}
 */
export const uploadFileToStorage = async ({
  file,
  folder = 'vouchers',
  userId = 'general',
  recordId = 'doc',
  extraMetadata = {},
}) => {
  const validation = validateUploadedFile(file);
  if (!validation.valid) {
    throw new Error(validation.error);
  }

  const effectiveUid = auth.currentUser?.uid || userId || 'general';
  const cleanUserId = String(effectiveUid).trim().replace(/[^a-zA-Z0-9_-]/g, '');
  const cleanRecordId = String(recordId || 'doc').trim().replace(/[^a-zA-Z0-9_-]/g, '');
  const safeOriginalName = String(file.name || 'archivo')
    .replace(/[^a-zA-Z0-9._-]/g, '_')
    .slice(0, 80);

  const timestamp = Date.now();
  const storagePath = `${folder}/${cleanUserId}/${cleanRecordId}_${timestamp}_${safeOriginalName}`;

  try {
    const storageRef = ref(storage, storagePath);
    const metadata = {
      contentType: file.type || 'application/octet-stream',
      customMetadata: {
        originalName: file.name,
        uploadedBy: cleanUserId,
        recordId: cleanRecordId,
        uploadedAt: new Date().toISOString(),
        ...extraMetadata,
      },
    };

    const snapshot = await uploadBytes(storageRef, file, metadata);
    const downloadUrl = await getDownloadURL(snapshot.ref);

    return {
      downloadUrl,
      fileName: file.name,
      fileSize: formatFileSize(file.size),
      storagePath,
    };
  } catch (err) {
    console.warn(`Error al subir a Firebase Storage (${storagePath}):`, err.message);
    // Contingencia local si Firebase Storage no está disponible en entorno demo o offline
    return {
      downloadUrl: '',
      fileName: file.name,
      fileSize: formatFileSize(file.size),
      storagePath,
      localFallback: true,
    };
  }
};
