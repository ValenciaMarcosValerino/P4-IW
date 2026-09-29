import express from 'express';

import {
  listarUsuarios,
  consultarUsuarioPorId,
  modificarUsuario,
  cambiarEstadoUsuario,
  eliminarUsuarioLogicamente
} from '../controllers/usersControllersPostgre.js';

import {
  verificarToken,
  soloAdministrador
} from '../middleware/middleware.js';


// ========================================
// ROUTER
// ========================================

const router =
  express.Router();


// ========================================
// OBTENER TODOS LOS USUARIOS
//
// Ruta final:
// GET /api/sqlserver/users
//
// Solo:
// - Administrador
// - Superadministrador
// ========================================

router.get(
  '/',
  verificarToken,
  soloAdministrador,
  listarUsuarios
);


// ========================================
// OBTENER USUARIO POR ID
//
// Ruta final:
// GET /api/sqlserver/users/:id
//
// Permisos:
// - Operativo: únicamente su cuenta
// - Administrador: usuarios permitidos
// - Superadmin: cualquier cuenta
//
// Los permisos específicos los valida
// el controller.
// ========================================

router.get(
  '/:id',
  verificarToken,
  consultarUsuarioPorId
);


// ========================================
// MODIFICAR USUARIO
//
// Ruta final:
// PUT /api/sqlserver/users/:id
//
// Permisos específicos:
// - Operativo: su cuenta
// - Administrador: operativos / propia cuenta
// - Superadmin: administradores y operativos
//
// Los permisos se validan
// en usersControllers.js.
// ========================================

router.put(
  '/:id',
  verificarToken,
  modificarUsuario
);


// ========================================
// ACTIVAR / DESACTIVAR USUARIO
//
// Ruta final:
// PUT /api/sqlserver/users/:id/estado
//
// Solo:
// - Administrador
// - Superadministrador
//
// Después el controller decide
// qué cuentas puede modificar cada uno.
// ========================================

router.put(
  '/:id/estado',
  verificarToken,
  soloAdministrador,
  cambiarEstadoUsuario
);


// ========================================
// ELIMINACIÓN LÓGICA
//
// Ruta final:
// DELETE /api/sqlserver/users/:id
//
// No elimina físicamente.
// activo = 0
//
// Solo:
// - Administrador
// - Superadministrador
// ========================================

router.delete(
  '/:id',
  verificarToken,
  soloAdministrador,
  eliminarUsuarioLogicamente
);


// ========================================
// EXPORTAR ROUTER
// ========================================

export default router;