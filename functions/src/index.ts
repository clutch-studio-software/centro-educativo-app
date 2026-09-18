import { onRequest } from 'firebase-functions/v2/https';
import * as admin from 'firebase-admin';
import * as crypto from 'crypto';
import * as bcrypt from 'bcryptjs';
import { sendEmail } from './email';

// Inicializar la SDK de Admin de Firebase
admin.initializeApp();
const db = admin.firestore();

/**
 * Helper para verificar el ID Token del llamador y retornar sus Claims decodificados.
 */
async function verifyAuth(req: any) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    throw new Error('No autorizado: Cabecera Authorization faltante o inválida.');
  }
  const token = authHeader.split('Bearer ')[1];
  try {
    const decodedToken = await admin.auth().verifyIdToken(token);
    if (!decodedToken.role) {
      const userDoc = await db.collection('users').doc(decodedToken.uid).get();
      if (userDoc.exists) {
        decodedToken.role = userDoc.data()?.role;
      }
    }
    return decodedToken;
  } catch (err) {
    throw new Error('No autorizado: Token de ID inválido.');
  }
}

/**
 * Genera un ID único para estudiante en el formato EST-YYYY-XXXXX
 */
async function generateUniqueStudentIdLogin(): Promise<string> {
  const year = new Date().getFullYear();
  let unique = false;
  let studentID = '';
  
  while (!unique) {
    const randomDigits = Math.floor(10000 + Math.random() * 90000); // 5 dígitos aleatorios
    studentID = `EST-${year}-${randomDigits}`;
    
    const snapshot = await db.collection('students')
      .where('studentID_login', '==', studentID)
      .limit(1)
      .get();
      
    if (snapshot.empty) {
      unique = true;
    }
  }
  
  return studentID;
}

/**
 * 1. cf_createParentAndStudents
 * Invocada por un user_admin para crear un padre y sus hijos.
 */
export const cf_createParentAndStudents = onRequest({ cors: true, invoker: 'public' }, async (req, res) => {
  try {
    // Validar autorización
    const callerClaims = await verifyAuth(req);
    if (callerClaims.role !== 'user_admin') {
       res.status(403).send({ error: 'Permisos insuficientes: Requiere rol user_admin.' });
       return;
    }

    const { parentEmail, parentName, parentDni, students } = req.body;
    if (!parentEmail || !parentDni || !parentName || !students || !Array.isArray(students)) {
       res.status(400).send({ error: 'Faltan parámetros requeridos (parentEmail, parentDni, parentName, students).' });
       return;
    }

    // Crear o recuperar usuario del Padre en Auth usando su DNI como contraseña inicial
    let parentUser;
    try {
      parentUser = await admin.auth().getUserByEmail(parentEmail);
    } catch (notFoundErr: any) {
      try {
        parentUser = await admin.auth().createUser({
          email: parentEmail,
          emailVerified: true,
          password: parentDni.trim()
        });
        // Establecer Custom Claim para el Padre
        await admin.auth().setCustomUserClaims(parentUser.uid, { role: 'Padre' });
      } catch (createErr: any) {
        if (createErr.code === 'auth/email-already-exists' || createErr.message?.includes('already in use')) {
          parentUser = await admin.auth().getUserByEmail(parentEmail);
        } else {
          throw createErr;
        }
      }
    }

    // Procesar estudiantes en paralelo
    const validStudents = (students || []).filter((s: any) => s.nombre && s.dni);
    const createdStudents = await Promise.all(
      validStudents.map(async (student: any) => {
        const studentID_login = await generateUniqueStudentIdLogin();

        // Hashear el DNI del alumno como su contraseña por defecto
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(student.dni.trim(), salt);

        const studentRef = await db.collection('students').add({
          studentID_login,
          parentId: parentUser.uid,
          emailPadre: parentEmail,
          hashedPassword,
          status: 'active',
          mustChangePassword: true,
          nombre: student.nombre || '',
          dni: student.dni || '',
          genero: student.genero || '',
          fechaNacimiento: student.fechaNacimiento || '',
          nivel: student.nivel || 'inicial',
          curso: student.curso || 'sin asignar',
          division: student.division || 'sin asignar',
          createdAt: admin.firestore.FieldValue.serverTimestamp()
        });

        return {
          id: studentRef.id,
          studentID_login,
          nombre: student.nombre
        };
      })
    );

    const studentDocIds: string[] = createdStudents.map(s => s.id);
    const createdStudentsInfo = createdStudents;

    // Guardar o actualizar los datos del Padre en Firestore
    await db.collection('users').doc(parentUser.uid).set({
      role: 'Padre',
      email: parentEmail,
      nombre: parentName || '',
      dni: parentDni.trim(),
      mustChangePassword: true,
      emailInvalid: false,
      studentIds: admin.firestore.FieldValue.arrayUnion(...studentDocIds),
      updatedAt: admin.firestore.FieldValue.serverTimestamp()
    }, { merge: true });

    res.status(201).send({
      parentUid: parentUser.uid,
      students: createdStudentsInfo
    });
  } catch (error: any) {
    console.error('Error en cf_createParentAndStudents:', error);
    res.status(500).send({ error: error.message || 'Error interno del servidor.' });
  }
});

/**
 * 2. cf_resendActivationLink
 * Reenvía enlace de activación (de padre o de estudiante).
 */
export const cf_resendActivationLink = onRequest({ cors: true, invoker: 'public' }, async (req, res) => {
  try {
    const callerClaims = await verifyAuth(req);
    const { targetType, targetId } = req.body;

    if (!targetType || !targetId) {
      res.status(400).send({ error: 'Faltan parámetros requeridos (targetType, targetId).' });
      return;
    }

    const redirectUrl = process.env.REDIRECT_URL || 'http://localhost:5173/auth-action';

    if (targetType === 'parent') {
      // Solo el propio padre o un user_admin puede reenviar la activación del padre
      if (callerClaims.role !== 'user_admin' && callerClaims.uid !== targetId) {
        res.status(403).send({ error: 'Permisos insuficientes.' });
        return;
      }

      const parentDoc = await db.collection('users').doc(targetId).get();
      if (!parentDoc.exists) {
        res.status(404).send({ error: 'Padre no encontrado.' });
        return;
      }

      const parentData = parentDoc.data();
      const parentEmail = parentData?.email;

      const actionCodeSettings = {
        url: redirectUrl,
        handleCodeInApp: true
      };

      const emailLink = await admin.auth().generateEmailVerificationLink(parentEmail, actionCodeSettings);

      const htmlContent = `
        <h1>Verificación de Correo - Educar para Transformar</h1>
        <p>Hola ${parentData?.nombre || 'Tutor'},</p>
        <p>Recibimos una solicitud para reenviar el enlace de verificación de su cuenta. Por favor, ingrese al siguiente enlace:</p>
        <p><a href="${emailLink}">Verificar Correo</a></p>
      `;

      await sendEmail({
        to: parentEmail,
        subject: 'Enlace de Verificación de Cuenta - Educar para Transformar',
        html: htmlContent
      });

      // Si estaba marcado como inválido, limpiarlo
      if (parentData?.emailInvalid) {
        await db.collection('users').doc(targetId).update({ emailInvalid: false });
      }

      res.status(200).send({ message: 'Enlace de verificación enviado con éxito al tutor.' });

    } else if (targetType === 'student') {
      const studentDoc = await db.collection('students').doc(targetId).get();
      if (!studentDoc.exists) {
        res.status(404).send({ error: 'Estudiante no encontrado.' });
        return;
      }

      const studentData = studentDoc.data();

      // Solo user_admin o el propio padre asociado pueden reenviar el token de este estudiante
      if (callerClaims.role !== 'user_admin' && callerClaims.uid !== studentData?.parentId) {
        res.status(403).send({ error: 'Permisos insuficientes.' });
        return;
      }

      const activationToken = crypto.randomBytes(32).toString('hex');
      const activationTokenExpires = admin.firestore.Timestamp.fromDate(
        new Date(Date.now() + 48 * 60 * 60 * 1000)
      );

      await db.collection('students').doc(targetId).update({
        activationToken,
        activationTokenExpires
      });

      const customLink = `${redirectUrl}?mode=activateStudent&token=${activationToken}&studentId=${targetId}`;

      const htmlContent = `
        <h1>Activación de Cuenta de Estudiante</h1>
        <p>Hola,</p>
        <p>Se ha generado un nuevo enlace para activar la cuenta del estudiante <strong>${studentData?.nombre || ''}</strong> (Usuario: ${studentData?.studentID_login}).</p>
        <p>Haga clic en el siguiente enlace para establecer su contraseña:</p>
        <p><a href="${customLink}">Establecer Contraseña del Estudiante</a></p>
        <p>Este enlace es válido por 48 horas.</p>
      `;

      await sendEmail({
        to: studentData?.emailPadre,
        subject: `Enlace de Activación para ${studentData?.nombre || 'Estudiante'} - Educar para Transformar`,
        html: htmlContent
      });

      res.status(200).send({ message: 'Enlace de activación de estudiante enviado al correo del tutor.' });
    } else {
      res.status(400).send({ error: 'targetType inválido. Debe ser parent o student.' });
    }
  } catch (error: any) {
    console.error('Error en cf_resendActivationLink:', error);
    res.status(500).send({ error: error.message || 'Error interno.' });
  }
});

/**
 * 3. cf_updateParentEmailAndResend
 * Invocada por un administrador para corregir el correo electrónico de un padre y volver a enviar la activación.
 */
export const cf_updateParentEmailAndResend = onRequest({ cors: true, invoker: 'public' }, async (req, res) => {
  try {
    const callerClaims = await verifyAuth(req);
    if (callerClaims.role !== 'user_admin') {
      res.status(403).send({ error: 'Permisos insuficientes: Requiere rol user_admin.' });
      return;
    }

    const { parentUid, newEmail } = req.body;
    if (!parentUid || !newEmail) {
      res.status(400).send({ error: 'Faltan parámetros requeridos (parentUid, newEmail).' });
      return;
    }

    // 1. Actualizar en Firebase Authentication
    await admin.auth().updateUser(parentUid, {
      email: newEmail,
      emailVerified: false
    });

    // 2. Actualizar en Firestore users
    await db.collection('users').doc(parentUid).update({
      email: newEmail,
      emailInvalid: false
    });

    // 3. Buscar hijos y actualizar emailPadre
    const parentDoc = await db.collection('users').doc(parentUid).get();
    const studentIds = parentDoc.data()?.studentIds || [];
    
    if (studentIds.length > 0) {
      const batch = db.batch();
      for (const studentId of studentIds) {
        const studentRef = db.collection('students').doc(studentId);
        batch.update(studentRef, { emailPadre: newEmail });
      }
      await batch.commit();
    }

    // 4. Generar y enviar nuevo enlace de verificación
    const redirectUrl = process.env.REDIRECT_URL || 'http://localhost:5173/auth-action';
    const actionCodeSettings = {
      url: redirectUrl,
      handleCodeInApp: true
    };

    const emailLink = await admin.auth().generateEmailVerificationLink(newEmail, actionCodeSettings);

    const htmlContent = `
      <h1>Actualización de Correo y Activación de Cuenta</h1>
      <p>Hola ${parentDoc.data()?.nombre || 'Tutor'},</p>
      <p>Un administrador ha corregido su dirección de correo electrónico en nuestra plataforma. Para verificar su cuenta y activarla, por favor haga clic en el siguiente enlace:</p>
      <p><a href="${emailLink}">Activar Cuenta con nuevo Correo</a></p>
    `;

    await sendEmail({
      to: newEmail,
      subject: 'Activación de Cuenta de Tutor - Educar para Transformar',
      html: htmlContent
    });

    res.status(200).send({ message: 'Correo actualizado y nuevo enlace de activación enviado exitosamente.' });
  } catch (error: any) {
    console.error('Error en cf_updateParentEmailAndResend:', error);
    res.status(500).send({ error: error.message || 'Error interno.' });
  }
});

/**
 * 4. cf_activateStudentAccount
 * Invocada desde el frontend de React para que un estudiante establezca su contraseña. Public API.
 */
export const cf_activateStudentAccount = onRequest({ cors: true, invoker: 'public' }, async (req, res) => {
  try {
    const { studentId, token, newPassword } = req.body;
    if (!studentId || !token || !newPassword) {
      res.status(400).send({ error: 'Faltan parámetros requeridos (studentId, token, newPassword).' });
      return;
    }

    const studentRef = db.collection('students').doc(studentId);
    const studentDoc = await studentRef.get();
    if (!studentDoc.exists) {
      res.status(404).send({ error: 'Estudiante no encontrado.' });
      return;
    }

    const studentData = studentDoc.data();

    // Validar token y expiración
    if (studentData?.activationToken !== token) {
      res.status(400).send({ error: 'Token de activación inválido.' });
      return;
    }

    const expires = studentData?.activationTokenExpires;
    if (!expires || expires.toDate() < new Date()) {
      res.status(400).send({ error: 'El token de activación ha expirado.' });
      return;
    }

    // Hashear la contraseña usando bcryptjs
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(newPassword, salt);

    // Actualizar estudiante en Firestore
    await studentRef.update({
      hashedPassword,
      status: 'active',
      activationToken: null,
      activationTokenExpires: null
    });

    res.status(200).send({ message: 'Cuenta del estudiante activada con éxito. Ya puede iniciar sesión.' });
  } catch (error: any) {
    console.error('Error en cf_activateStudentAccount:', error);
    res.status(500).send({ error: error.message || 'Error interno.' });
  }
});

/**
 * 5. cf_loginStudent
 * Permite a un estudiante iniciar sesión con su studentID_login y contraseña. Public API.
 */
export const cf_loginStudent = onRequest({ cors: true, invoker: 'public' }, async (req, res) => {
  try {
    const { studentID_login, password } = req.body;
    if (!studentID_login || !password) {
      res.status(400).send({ error: 'Faltan parámetros (studentID_login, password).' });
      return;
    }

    // Buscar estudiante por su ID de inicio de sesión
    const snapshot = await db.collection('students')
      .where('studentID_login', '==', studentID_login)
      .limit(1)
      .get();

    if (snapshot.empty) {
      res.status(401).send({ error: 'ID de estudiante o contraseña incorrectos.' });
      return;
    }

    const studentDoc = snapshot.docs[0];
    const studentData = studentDoc.data();

    // Validar que la cuenta esté activa
    if (studentData.status !== 'active' || !studentData.hashedPassword) {
      res.status(400).send({ error: 'La cuenta del estudiante no ha sido activada o no tiene contraseña.' });
      return;
    }

    // Comparar contraseña con el hash guardado
    const match = await bcrypt.compare(password, studentData.hashedPassword);
    if (!match) {
      res.status(401).send({ error: 'ID de estudiante o contraseña incorrectos.' });
      return;
    }

    // Crear Custom Token de Firebase Auth. Usamos el ID del documento de Firestore como UID del Auth del estudiante.
    const customToken = await admin.auth().createCustomToken(studentDoc.id, {
      role: 'Estudiante',
      studentId: studentID_login
    });

    res.status(200).send({ customToken });
  } catch (error: any) {
    console.error('Error en cf_loginStudent:', error);
    res.status(500).send({ error: error.message || 'Error interno.' });
  }
});

/**
 * 6. cf_resetStudentPassword
 * Envía un enlace de restablecimiento de contraseña para un estudiante al correo del padre.
 */
export const cf_resetStudentPassword = onRequest({ cors: true, invoker: 'public' }, async (req, res) => {
  try {
    const callerClaims = await verifyAuth(req);
    const { studentId } = req.body;

    if (!studentId) {
      res.status(400).send({ error: 'Faltan parámetros requeridos (studentId).' });
      return;
    }

    const studentRef = db.collection('students').doc(studentId);
    const studentDoc = await studentRef.get();
    if (!studentDoc.exists) {
      res.status(404).send({ error: 'Estudiante no encontrado.' });
      return;
    }

    const studentData = studentDoc.data();

    // Validar permisos: Requiere user_admin o ser el padre del estudiante
    if (callerClaims.role !== 'user_admin' && callerClaims.uid !== studentData?.parentId) {
      res.status(403).send({ error: 'Permisos insuficientes.' });
      return;
    }

    // Generar token temporal
    const activationToken = crypto.randomBytes(32).toString('hex');
    const activationTokenExpires = admin.firestore.Timestamp.fromDate(
      new Date(Date.now() + 48 * 60 * 60 * 1000)
    );

    await studentRef.update({
      activationToken,
      activationTokenExpires
    });

    const redirectUrl = process.env.REDIRECT_URL || 'http://localhost:5173/auth-action';
    const resetLink = `${redirectUrl}?mode=resetStudentPassword&token=${activationToken}&studentId=${studentId}`;

    const htmlContent = `
      <h1>Restablecimiento de Contraseña del Estudiante</h1>
      <p>Hola,</p>
      <p>Se ha solicitado restablecer la contraseña para el estudiante <strong>${studentData?.nombre || ''}</strong> (Usuario: ${studentData?.studentID_login}).</p>
      <p>Haga clic en el siguiente enlace para ingresar su nueva contraseña:</p>
      <p><a href="${resetLink}">Restablecer Contraseña</a></p>
      <p>Este enlace es válido por 48 horas.</p>
    `;

    await sendEmail({
      to: studentData?.emailPadre,
      subject: `Restablecimiento de Contraseña para ${studentData?.nombre || 'Estudiante'} - Educar para Transformar`,
      html: htmlContent
    });

    res.status(200).send({ message: 'Enlace de restablecimiento de contraseña enviado al correo del tutor.' });
  } catch (error: any) {
    console.error('Error en cf_resetStudentPassword:', error);
    res.status(500).send({ error: error.message || 'Error interno.' });
  }
});

/**
 * 7. cf_createAdministrativeUser
 * Invocada por un user_admin para crear otro administrador, staff (docente) o administrativo.
 */
export const cf_createAdministrativeUser = onRequest({ cors: true, invoker: 'public' }, async (req, res) => {
  try {
    const callerClaims = await verifyAuth(req);
    if (callerClaims.role !== 'user_admin') {
      res.status(403).send({ error: 'Permisos insuficientes: Requiere rol user_admin.' });
      return;
    }

    const { email, name, role, dni, ...extraFields } = req.body;
    if (!email || !name || !role || !dni) {
      res.status(400).send({ error: 'Faltan parámetros requeridos (email, name, role, dni).' });
      return;
    }

    const allowedRoles = ['user_admin', 'Staff', 'Administrativo', 'teacher'];
    if (!allowedRoles.includes(role)) {
      res.status(400).send({ error: 'Rol inválido. Debe ser user_admin, Staff, Administrativo o teacher.' });
      return;
    }

    // Crear el usuario en Auth usando su DNI como contraseña inicial
    let userRecord: admin.auth.UserRecord;
    try {
      userRecord = await admin.auth().createUser({
        email,
        password: dni.trim(),
        emailVerified: true,
        displayName: extraFields.nombreCompleto || name
      });
    } catch (authErr: any) {
      if (authErr.code === 'auth/email-already-exists') {
        const existing = await admin.auth().getUserByEmail(email);
        userRecord = await admin.auth().updateUser(existing.uid, {
          password: dni.trim(),
          displayName: extraFields.nombreCompleto || name,
          disabled: false
        });
      } else {
        throw authErr;
      }
    }

    // Asignar Custom Claim
    await admin.auth().setCustomUserClaims(userRecord.uid, { role });

    // Guardar en Firestore
    await db.collection('users').doc(userRecord.uid).set({
      role,
      email,
      nombre: extraFields.nombre || name,
      dni: dni.trim(),
      mustChangePassword: true,
      emailInvalid: false,
      ...extraFields,
      createdAt: admin.firestore.FieldValue.serverTimestamp()
    });

    res.status(201).send({
      uid: userRecord.uid
    });

  } catch (error: any) {
    console.error('Error en cf_createAdministrativeUser:', error);
    res.status(500).send({ error: error.message || 'Error interno.' });
  }
});

/**
 * 8. cf_resetUserPasswordToDni
 * Invocada por un user_admin para restablecer la contraseña de cualquier usuario a su DNI.
 */
export const cf_resetUserPasswordToDni = onRequest({ cors: true, invoker: 'public' }, async (req, res) => {
  try {
    const callerClaims = await verifyAuth(req);
    if (callerClaims.role !== 'user_admin') {
      res.status(403).send({ error: 'Permisos insuficientes: Requiere rol user_admin.' });
      return;
    }

    const { userId, userType } = req.body;
    if (!userId || !userType) {
      res.status(400).send({ error: 'Faltan parámetros requeridos (userId, userType).' });
      return;
    }

    if (userType === 'parent' || userType === 'administrative' || userType === 'staff' || userType === 'teacher') {
      const userRef = db.collection('users').doc(userId);
      const userDoc = await userRef.get();
      if (!userDoc.exists) {
        res.status(404).send({ error: 'Usuario no encontrado.' });
        return;
      }
      const userData = userDoc.data();
      const dni = userData?.dni;
      if (!dni) {
        res.status(400).send({ error: 'El usuario no tiene registrado un DNI.' });
        return;
      }

      // Restablecer contraseña en Auth al DNI
      await admin.auth().updateUser(userId, {
        password: dni.trim()
      });

      // Forzar cambio de contraseña
      await userRef.update({
        mustChangePassword: true
      });

      res.status(200).send({ message: 'Contraseña del usuario restablecida exitosamente a su DNI.' });

    } else if (userType === 'student') {
      const studentRef = db.collection('students').doc(userId);
      const studentDoc = await studentRef.get();
      if (!studentDoc.exists) {
        res.status(404).send({ error: 'Estudiante no encontrado.' });
        return;
      }
      const studentData = studentDoc.data();
      const dni = studentData?.dni;
      if (!dni) {
        res.status(400).send({ error: 'El estudiante no tiene registrado un DNI.' });
        return;
      }

      // Generar nuevo hash bcrypt para el DNI del alumno
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(dni.trim(), salt);

      // Actualizar en Firestore
      await studentRef.update({
        passwordHash: hashedPassword,
        mustChangePassword: true
      });

      res.status(200).send({ message: 'Contraseña del estudiante restablecida exitosamente a su DNI.' });
    } else {
      res.status(400).send({ error: 'userType inválido. Debe ser parent, administrative o student.' });
    }
  } catch (error: any) {
    console.error('Error en cf_resetUserPasswordToDni:', error);
    res.status(500).send({ error: error.message || 'Error interno.' });
  }
});

/**
 * 9. cf_verifyCredentials
 * Valida usuario y contraseña contra la base de datos Firestore y Firebase Auth.
 */
export const cf_verifyCredentials = onRequest({ cors: true, invoker: 'public' }, async (req, res) => {
  try {
    const { identifier, password, role } = req.body;
    if (!identifier || !password) {
      res.status(400).send({ error: 'Faltan credenciales.' });
      return;
    }

    // A. Búsqueda si es estudiante
    if (role === 'Estudiante' || identifier.toUpperCase().startsWith('EST-')) {
      const studentSnap = await db.collection('students')
        .where('studentID_login', '==', identifier.trim())
        .limit(1)
        .get();

      if (studentSnap.empty) {
        res.status(401).send({ error: 'Credenciales inválidas de estudiante.' });
        return;
      }

      const studentDoc = studentSnap.docs[0];
      const studentData = studentDoc.data();

      // Comparación con bcrypt
      const passwordMatch = await bcrypt.compare(password.trim(), studentData.passwordHash || studentData.hashedPassword || '');
      if (!passwordMatch) {
        res.status(401).send({ error: 'Contraseña incorrecta.' });
        return;
      }

      res.status(200).send({
        uid: studentDoc.id,
        role: 'Estudiante',
        name: studentData.nombre,
        mustChangePassword: studentData.mustChangePassword ?? false
      });
      return;
    }

    // B. Búsqueda para otros roles (users collection)
    const userSnap = await db.collection('users')
      .where('email', '==', identifier.trim().toLowerCase())
      .limit(1)
      .get();

    if (userSnap.empty) {
      res.status(401).send({ error: 'Usuario no encontrado.' });
      return;
    }

    const userDoc = userSnap.docs[0];
    const userData = userDoc.data();

    res.status(200).send({
      uid: userDoc.id,
      role: userData.role,
      name: userData.nombre,
      mustChangePassword: userData.mustChangePassword ?? false
    });

  } catch (error: any) {
    console.error('Error en cf_verifyCredentials:', error);
    res.status(500).send({ error: error.message || 'Error interno.' });
  }
});

/**
 * 10. cf_changeStudentPassword
 * Invocada por el propio estudiante o administrador para actualizar la contraseña del estudiante.
 */
export const cf_changeStudentPassword = onRequest({ cors: true, invoker: 'public' }, async (req, res) => {
  try {
    const callerClaims = await verifyAuth(req);
    const { studentId, newPassword } = req.body;

    if (!studentId || !newPassword) {
      res.status(400).send({ error: 'Faltan parámetros requeridos (studentId, newPassword).' });
      return;
    }

    // Permitir si es el propio estudiante o si es un administrador
    if (callerClaims.role !== 'user_admin' && callerClaims.uid !== studentId) {
      res.status(403).send({ error: 'Permisos insuficientes.' });
      return;
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(newPassword, salt);

    await db.collection('students').doc(studentId).update({
      hashedPassword,
      mustChangePassword: false
    });

    res.status(200).send({ message: 'Contraseña del estudiante actualizada con éxito.' });
  } catch (error: any) {
    console.error('Error en cf_changeStudentPassword:', error);
    res.status(500).send({ error: error.message || 'Error interno.' });
  }
});

/**
 * 11. cf_updateUserProfile
 * Invocada por un user_admin para modificar datos de perfiles (padre, alumno o administrativo/staff).
 */
export const cf_updateUserProfile = onRequest({ cors: true, invoker: 'public' }, async (req, res) => {
  try {
    const callerClaims = await verifyAuth(req);
    if (callerClaims.role !== 'user_admin') {
      res.status(403).send({ error: 'Permisos insuficientes.' });
      return;
    }

    const { targetId, targetType, fields } = req.body;
    if (!targetId || !targetType || !fields) {
      res.status(400).send({ error: 'Faltan parámetros requeridos (targetId, targetType, fields).' });
      return;
    }

    if (targetType === 'parent' || targetType === 'administrative' || targetType === 'staff' || targetType === 'teacher') {
      const userRef = db.collection('users').doc(targetId);
      const userDoc = await userRef.get();

      // Si se solicita eliminación definitiva del usuario
      if (fields.deleteUser === true || fields._action === 'delete') {
        try {
          await admin.auth().deleteUser(targetId);
        } catch (authErr: any) {
          console.warn(`No se pudo eliminar de Auth por UID (${targetId}):`, authErr.message);
          const emailCandidate = fields.email || (userDoc.exists ? userDoc.data()?.email : null);
          if (emailCandidate) {
            try {
              const u = await admin.auth().getUserByEmail(emailCandidate);
              await admin.auth().deleteUser(u.uid);
            } catch (_) {}
          }
        }
        if (userDoc.exists) {
          await userRef.delete();
        }
        res.status(200).send({ message: 'Usuario eliminado definitivamente de Auth y Firestore.' });
        return;
      }

      if (!userDoc.exists) {
        res.status(404).send({ error: 'Usuario no encontrado.' });
        return;
      }

      // Si se modifica el email, actualizar también en Firebase Auth
      if (fields.email) {
        await admin.auth().updateUser(targetId, {
          email: fields.email,
          displayName: fields.nombreCompleto || fields.nombre || undefined
        });
      } else if (fields.nombreCompleto || fields.nombre) {
        await admin.auth().updateUser(targetId, {
          displayName: fields.nombreCompleto || fields.nombre
        });
      }

      await userRef.update(fields);
      res.status(200).send({ message: 'Perfil de usuario actualizado exitosamente.' });

    } else if (targetType === 'student') {
      const studentRef = db.collection('students').doc(targetId);
      const studentDoc = await studentRef.get();
      if (!studentDoc.exists) {
        res.status(404).send({ error: 'Estudiante no encontrado.' });
        return;
      }

      // Si se solicita eliminación definitiva del alumno
      if (fields.deleteStudent === true || fields._action === 'delete') {
        const studentData = studentDoc.data();
        if (studentData?.parentId) {
          await db.collection('users').doc(studentData.parentId).update({
            studentIds: admin.firestore.FieldValue.arrayRemove(targetId)
          }).catch(() => {});
        }
        await studentRef.delete();
        res.status(200).send({ message: 'Estudiante eliminado definitivamente de Firestore.' });
        return;
      }

      await studentRef.update(fields);
      res.status(200).send({ message: 'Perfil de estudiante actualizado exitosamente.' });
    } else {
      res.status(400).send({ error: 'targetType inválido. Debe ser parent, administrative o student.' });
    }
  } catch (error: any) {
    console.error('Error en cf_updateUserProfile:', error);
    res.status(500).send({ error: error.message || 'Error interno.' });
  }
});

/**
 * 11. cf_completePasswordChange
 * Invocada por cualquier usuario autenticado tras cambiar su contraseña para marcar mustChangePassword como false.
 */
export const cf_completePasswordChange = onRequest({ cors: true, invoker: 'public' }, async (req, res) => {
  try {
    const callerClaims = await verifyAuth(req);
    const role = callerClaims.role;
    
    if (role === 'Estudiante') {
      await db.collection('students').doc(callerClaims.uid).update({ mustChangePassword: false });
    } else {
      await db.collection('users').doc(callerClaims.uid).update({ mustChangePassword: false });
    }
    
    res.status(200).send({ message: 'Estado de cambio de contraseña registrado exitosamente.' });
  } catch (error: any) {
    console.error('Error en cf_completePasswordChange:', error);
    res.status(500).send({ error: error.message || 'Error interno.' });
  }
});

/**
 * 12. cf_deleteStudent
 * Invocada por un user_admin para eliminar definitivamente un estudiante de Firestore y desvincularlo de su tutor.
 */
export const cf_deleteStudent = onRequest({ cors: true, invoker: 'public' }, async (req, res) => {
  try {
    const callerClaims = await verifyAuth(req);
    if (callerClaims.role !== 'user_admin') {
      res.status(403).send({ error: 'Permisos insuficientes.' });
      return;
    }

    const { studentId } = req.body;
    if (!studentId) {
      res.status(400).send({ error: 'Falta studentId requerido.' });
      return;
    }

    const studentRef = db.collection('students').doc(studentId);
    const studentDoc = await studentRef.get();
    if (!studentDoc.exists) {
      res.status(404).send({ error: 'Estudiante no encontrado.' });
      return;
    }

    const studentData = studentDoc.data();
    if (studentData?.parentId) {
      await db.collection('users').doc(studentData.parentId).update({
        studentIds: admin.firestore.FieldValue.arrayRemove(studentId)
      }).catch(() => {});
    }

    await studentRef.delete();
    res.status(200).send({ message: 'Estudiante eliminado definitivamente.' });
  } catch (error: any) {
    console.error('Error en cf_deleteStudent:', error);
    res.status(500).send({ error: error.message || 'Error interno del servidor.' });
  }
});

/**
 * 13. cf_getAcademicOffer
 * Retorna la configuración de cursos y divisiones por nivel. Si no existe, devuelve la base estándar garantizando división 'A'.
 */
export const cf_getAcademicOffer = onRequest({ cors: true, invoker: 'public' }, async (req, res) => {
  try {
    const docSnap = await db.collection('academicOffer').doc('current').get();
    if (docSnap.exists) {
      res.status(200).send({ academicOffer: docSnap.data() });
      return;
    }

    // Default structure with 'A' guaranteed in all courses
    const defaultOffer = {
      Inicial: {
        'Sala de 2 Años': ['A'],
        'Sala de 3 Años': ['A'],
        'Sala de 4 Años': ['A'],
        'Sala de 5 Años': ['A'],
      },
      Primario: {
        '1er Grado': ['A', 'B'],
        '2do Grado': ['A', 'B'],
        '3er Grado': ['A', 'B'],
        '4to Grado': ['A', 'B'],
        '5to Grado': ['A', 'B'],
        '6to Grado': ['A', 'B'],
        '7mo Grado': ['A', 'B'],
      },
      Secundario: {
        '1er Año': ['A', 'B'],
        '2do Año': ['A', 'B'],
        '3er Año': ['A', 'B'],
        '4to Año': ['A', 'B'],
        '5to Año': ['A'],
        '6to Año': ['A'],
      },
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
    };

    await db.collection('academicOffer').doc('current').set(defaultOffer);
    res.status(200).send({ academicOffer: defaultOffer });
  } catch (error: any) {
    console.error('Error en cf_getAcademicOffer:', error);
    res.status(500).send({ error: error.message || 'Error al obtener oferta académica.' });
  }
});

/**
 * 14. cf_saveAcademicOffer
 * Permite a un user_admin actualizar las divisiones de cada curso, garantizando siempre la división 'A'.
 */
export const cf_saveAcademicOffer = onRequest({ cors: true, invoker: 'public' }, async (req, res) => {
  try {
    const callerClaims = await verifyAuth(req);
    if (callerClaims.role !== 'user_admin') {
      res.status(403).send({ error: 'Permisos insuficientes: Requiere rol user_admin.' });
      return;
    }

    const { academicOffer } = req.body;
    if (!academicOffer || typeof academicOffer !== 'object') {
      res.status(400).send({ error: 'Falta academicOffer válido.' });
      return;
    }

    // Validar y asegurar que la división 'A' exista siempre en cada curso
    for (const nivel of ['Inicial', 'Primario', 'Secundario']) {
      if (academicOffer[nivel] && typeof academicOffer[nivel] === 'object') {
        for (const curso of Object.keys(academicOffer[nivel])) {
          let divs = Array.isArray(academicOffer[nivel][curso]) ? academicOffer[nivel][curso] : [];
          if (!divs.includes('A')) {
            divs = ['A', ...divs];
          }
          // Normalizar mayúsculas y quitar duplicados
          academicOffer[nivel][curso] = Array.from(new Set(divs.map((d: string) => String(d).trim().toUpperCase())));
        }
      }
    }

    academicOffer.updatedAt = admin.firestore.FieldValue.serverTimestamp();
    await db.collection('academicOffer').doc('current').set(academicOffer, { merge: true });

    res.status(200).send({ message: 'Oferta académica actualizada con éxito.', academicOffer });
  } catch (error: any) {
    console.error('Error en cf_saveAcademicOffer:', error);
    res.status(500).send({ error: error.message || 'Error al guardar oferta académica.' });
  }
});


