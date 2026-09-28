import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';


// ========================================
// CARGAR VARIABLES DE ENTORNO
// ========================================

dotenv.config();


// ========================================
// OBTENER JWT_SECRET
// ========================================

const JWT_SECRET =
  process.env.JWT_SECRET;


// ========================================
// VERIFICAR TOKEN JWT
//
// Espera recibir:
//
// Authorization: Bearer TOKEN
// ========================================

export const verificarToken = (
  req,
  res,
  next
) => {

  const authorization =
    req.headers.authorization;


  // ========================================
  // TOKEN NO ENVIADO
  // ========================================

  if (!authorization) {

    return res.status(401).json({
      mensaje:
        'Token requerido'
    });

  }


  // ========================================
  // VALIDAR FORMATO
  // ========================================

  const partes =
    authorization.split(' ');


  if (
    partes.length !== 2 ||
    partes[0] !== 'Bearer'
  ) {

    return res.status(401).json({
      mensaje:
        'Formato de token inválido'
    });

  }


  const token =
    partes[1];


  // ========================================
  // VALIDAR JWT_SECRET
  // ========================================

  if (!JWT_SECRET) {

    console.error(
      'JWT_SECRET no está definido'
    );


    return res.status(500).json({
      mensaje:
        'Error de configuración del servidor'
    });

  }


  // ========================================
  // VERIFICAR TOKEN
  // ========================================

  try {

    const usuario =
      jwt.verify(
        token,
        JWT_SECRET
      );


    // Guardamos los datos del JWT
    // para que los controllers
    // puedan utilizarlos.
    req.usuario =
      usuario;


    next();


  } catch (error) {

    return res.status(401).json({
      mensaje:
        'Token inválido o expirado'
    });

  }

};


// ========================================
// SOLO ADMINISTRADOR
//
// Permite:
// - administrador normal
// - superadministrador
//
// Bloquea:
// - operativo
// ========================================

export const soloAdministrador = (
  req,
  res,
  next
) => {

  // ========================================
  // COMPROBAR QUE EXISTA USUARIO
  // ========================================

  if (!req.usuario) {

    return res.status(401).json({
      mensaje:
        'Usuario no autenticado'
    });

  }


  // ========================================
  // VALIDAR ROL
  // ========================================

  if (
    req.usuario.rol !==
    'administrador'
  ) {

    return res.status(403).json({
      mensaje:
        'Acceso exclusivo para administradores'
    });

  }


  next();

};


// ========================================
// SABER SI UN USUARIO ES SUPERADMIN
//
// Se utiliza desde los controllers.
//
// Puede recibir:
//
// es_superadmin = true
//
// o:
//
// es_superadmin = 1
// ========================================

export const esSuperAdministrador = (
  usuario
) => {

  if (!usuario) {
    return false;
  }


  return (
    usuario.es_superadmin === true ||
    usuario.es_superadmin === 1
  );

};