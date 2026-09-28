import express from 'express';

import {
  registrarUsuario,
  iniciarSesion
} from '../controllers/authController.js';


// ========================================
// ROUTER
// ========================================

const router =
  express.Router();


// ========================================
// REGISTRAR USUARIO
//
// Ruta final:
// POST /api/sqlserver/users
// ========================================

router.post(
  '/users',
  registrarUsuario
);


// ========================================
// LOGIN
//
// Ruta final:
// POST /api/sqlserver/login
// ========================================

router.post(
  '/login',
  iniciarSesion
);


// ========================================
// EXPORTAR ROUTER
// ========================================

export default router;