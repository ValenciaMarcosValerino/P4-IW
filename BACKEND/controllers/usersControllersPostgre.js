import {
  obtenerTodosLosUsuarios,
  obtenerUsuarioPorId,
  obtenerUsuarioCompletoPorId,
  correoPerteneceAOtroUsuario,
  actualizarUsuario,
  actualizarEstadoUsuario,
  desactivarUsuario
} from '../models/usersPostgre.js';

import {
  esSuperAdministrador
} from '../middleware/middleware.js';


// ========================================
// OBTENER TODOS LOS USUARIOS
//
// ADMINISTRADOR / SUPERADMIN
//
// El modelo ya excluye al superadmin
// del listado general.
// ========================================

export const listarUsuarios =
  async (req, res) => {

    try {

      const usuarios =
        await obtenerTodosLosUsuarios();


      return res.status(200).json(
        usuarios
      );


    } catch (error) {

      console.error(
        'Error al obtener usuarios:',
        error
      );


      return res.status(500).json({
        mensaje:
          'Error al obtener usuarios'
      });

    }

  };


// ========================================
// OBTENER USUARIO POR ID
//
// OPERATIVO:
// solamente puede consultar su cuenta.
//
// ADMINISTRADOR:
// puede consultar usuarios normales,
// pero no al superadmin.
//
// SUPERADMIN:
// puede consultar cualquier cuenta.
// ========================================

export const consultarUsuarioPorId =
  async (req, res) => {

    try {

      const id =
        Number(req.params.id);


      // ========================================
      // VALIDAR ID
      // ========================================

      if (
        !Number.isInteger(id) ||
        id <= 0
      ) {

        return res.status(400).json({
          mensaje:
            'ID de usuario inválido'
        });

      }


      // ========================================
      // OBTENER USUARIO
      // ========================================

      const usuarioObjetivo =
        await obtenerUsuarioPorId(id);


      if (!usuarioObjetivo) {

        return res.status(404).json({
          mensaje:
            'Usuario no encontrado'
        });

      }


      // ========================================
      // INFORMACIÓN DEL SOLICITANTE
      // ========================================

      const solicitanteEsAdministrador =
        req.usuario.rol ===
        'administrador';


      const solicitanteEsSuperadmin =
        esSuperAdministrador(
          req.usuario
        );


      const esCuentaPropia =
        req.usuario.id === id;


      // ========================================
      // OPERATIVO
      // SOLO SU CUENTA
      // ========================================

      if (
        !solicitanteEsAdministrador &&
        !esCuentaPropia
      ) {

        return res.status(403).json({
          mensaje:
            'Solo puedes consultar tu propia cuenta'
        });

      }


      // ========================================
      // ADMINISTRADOR NORMAL
      // NO PUEDE CONSULTAR SUPERADMIN
      // ========================================

      if (
        solicitanteEsAdministrador &&
        !solicitanteEsSuperadmin &&
        Boolean(
          usuarioObjetivo.es_superadmin
        )
      ) {

        return res.status(403).json({
          mensaje:
            'No tienes permiso para consultar esta cuenta'
        });

      }


      // ========================================
      // RESPUESTA
      // ========================================

      return res.status(200).json(
        usuarioObjetivo
      );


    } catch (error) {

      console.error(
        'Error al obtener usuario:',
        error
      );


      return res.status(500).json({
        mensaje:
          'Error al obtener usuario'
      });

    }

  };


// ========================================
// MODIFICAR USUARIO
//
// SUPERADMIN:
// - modifica administradores
// - modifica operativos
// - cambia roles
//
// ADMINISTRADOR NORMAL:
// - modifica operativos
// - modifica su propia cuenta
// - NO modifica otros administradores
// - NO modifica al superadmin
// - NO cambia roles
//
// OPERATIVO:
// - solamente modifica su cuenta
// - NO cambia su rol
// ========================================

export const modificarUsuario =
  async (req, res) => {

    try {

      const id =
        Number(req.params.id);


      const {
        nombre,
        correo,
        contrasena,
        preguntarc,
        respuestarc,
        rol
      } = req.body;


      // ========================================
      // VALIDAR ID
      // ========================================

      if (
        !Number.isInteger(id) ||
        id <= 0
      ) {

        return res.status(400).json({
          mensaje:
            'ID de usuario inválido'
        });

      }


      // ========================================
      // OBTENER USUARIO COMPLETO
      // ========================================

      const usuarioActual =
        await obtenerUsuarioCompletoPorId(
          id
        );


      if (!usuarioActual) {

        return res.status(404).json({
          mensaje:
            'Usuario no encontrado'
        });

      }


      // ========================================
      // DATOS DEL SOLICITANTE
      // ========================================

      const solicitanteEsAdministrador =
        req.usuario.rol ===
        'administrador';


      const solicitanteEsSuperadmin =
        esSuperAdministrador(
          req.usuario
        );


      const esCuentaPropia =
        req.usuario.id === id;


      const objetivoEsAdministrador =
        usuarioActual.rol ===
        'administrador';


      const objetivoEsSuperadmin =
        Boolean(
          usuarioActual.es_superadmin
        );


      // ========================================
      // PERMISOS DEL OPERATIVO
      // ========================================

      if (
        !solicitanteEsAdministrador &&
        !esCuentaPropia
      ) {

        return res.status(403).json({
          mensaje:
            'Solo puedes modificar tu propia cuenta'
        });

      }


      // ========================================
      // PERMISOS ADMINISTRADOR NORMAL
      // ========================================

      if (
        solicitanteEsAdministrador &&
        !solicitanteEsSuperadmin
      ) {

        // No puede modificar al superadmin
        if (objetivoEsSuperadmin) {

          return res.status(403).json({
            mensaje:
              'No tienes permiso para modificar esta cuenta'
          });

        }


        // No puede modificar
        // otro administrador
        if (
          !esCuentaPropia &&
          objetivoEsAdministrador
        ) {

          return res.status(403).json({
            mensaje:
              'Un administrador normal no puede modificar a otro administrador'
          });

        }

      }


      // ========================================
      // CONSERVAR DATOS NO MODIFICADOS
      // ========================================

      const nuevoNombre =
        nombre?.trim()
          ? nombre.trim()
          : usuarioActual.nombre;


      const nuevoCorreo =
        correo?.trim()
          ? correo.trim()
          : usuarioActual.correo;


      const nuevaContrasena =
        contrasena?.trim()
          ? contrasena
          : usuarioActual.contrasena;


      const nuevaPregunta =
        preguntarc?.trim()
          ? preguntarc.trim()
          : usuarioActual.preguntarc;


      const nuevaRespuesta =
        respuestarc?.trim()
          ? respuestarc.trim()
          : usuarioActual.respuestarc;


      let nuevoRol =
        usuarioActual.rol;


      // ========================================
      // CAMBIO DE ROL
      // SOLAMENTE SUPERADMIN
      // ========================================

      if (
        rol &&
        rol !== usuarioActual.rol
      ) {

        if (
          !solicitanteEsSuperadmin
        ) {

          return res.status(403).json({
            mensaje:
              'Solo el superadministrador puede cambiar roles'
          });

        }


        // ========================================
        // VALIDAR ROL
        // ========================================

        if (
          rol !== 'administrador' &&
          rol !== 'operativo'
        ) {

          return res.status(400).json({
            mensaje:
              'Rol inválido'
          });

        }


        // ========================================
        // SUPERADMIN DEBE SEGUIR SIENDO ADMIN
        // ========================================

        if (
          objetivoEsSuperadmin &&
          rol !== 'administrador'
        ) {

          return res.status(400).json({
            mensaje:
              'El superadministrador debe conservar el rol administrador'
          });

        }


        nuevoRol =
          rol;

      }


      // ========================================
      // VALIDAR CORREO DUPLICADO
      // ========================================

      const correoDuplicado =
        await correoPerteneceAOtroUsuario(
          nuevoCorreo,
          id
        );


      if (correoDuplicado) {

        return res.status(409).json({
          mensaje:
            'El correo ya pertenece a otro usuario'
        });

      }


      // ========================================
      // ACTUALIZAR USUARIO
      // ========================================

      await actualizarUsuario(
        id,
        {

          nombre:
            nuevoNombre,

          correo:
            nuevoCorreo,

          contrasena:
            nuevaContrasena,

          preguntarc:
            nuevaPregunta,

          respuestarc:
            nuevaRespuesta,

          rol:
            nuevoRol

        }
      );


      // ========================================
      // RESPUESTA
      // ========================================

      return res.status(200).json({
        mensaje:
          'Usuario actualizado correctamente'
      });


    } catch (error) {

      console.error(
        'Error al actualizar usuario:',
        error
      );


      return res.status(500).json({
        mensaje:
          'Error al actualizar usuario'
      });

    }

  };


// ========================================
// CAMBIAR ESTADO
// ACTIVAR / DESACTIVAR
//
// SUPERADMIN:
// puede administrar operativos
// y administradores.
//
// ADMIN NORMAL:
// solamente operativos.
//
// SUPERADMIN PRINCIPAL:
// no puede ser desactivado.
// ========================================

export const cambiarEstadoUsuario =
  async (req, res) => {

    try {

      const id =
        Number(req.params.id);


      const { activo } =
        req.body;


      // ========================================
      // VALIDAR ID
      // ========================================

      if (
        !Number.isInteger(id) ||
        id <= 0
      ) {

        return res.status(400).json({
          mensaje:
            'ID de usuario inválido'
        });

      }


      // ========================================
      // VALIDAR ESTADO
      // ========================================

      if (
        activo !== true &&
        activo !== false &&
        activo !== 1 &&
        activo !== 0
      ) {

        return res.status(400).json({
          mensaje:
            'El estado activo debe ser true o false'
        });

      }


      const nuevoEstado =
        activo === true ||
        activo === 1
          ? 1
          : 0;


      // ========================================
      // OBTENER USUARIO OBJETIVO
      // ========================================

      const usuarioObjetivo =
        await obtenerUsuarioPorId(id);


      if (!usuarioObjetivo) {

        return res.status(404).json({
          mensaje:
            'Usuario no encontrado'
        });

      }


      const solicitanteEsSuperadmin =
        esSuperAdministrador(
          req.usuario
        );


      // ========================================
      // PROTEGER SUPERADMIN PRINCIPAL
      // ========================================

      if (
        Boolean(
          usuarioObjetivo.es_superadmin
        )
      ) {

        return res.status(403).json({
          mensaje:
            'La cuenta del superadministrador no puede ser desactivada'
        });

      }


      // ========================================
      // ADMIN NORMAL
      // NO PUEDE CAMBIAR ESTADO
      // DE ADMINISTRADORES
      // ========================================

      if (
        !solicitanteEsSuperadmin &&
        usuarioObjetivo.rol ===
          'administrador'
      ) {

        return res.status(403).json({
          mensaje:
            'Un administrador normal no puede activar o desactivar a otro administrador'
        });

      }


      // ========================================
      // ACTUALIZAR ESTADO
      // ========================================

      await actualizarEstadoUsuario(
        id,
        nuevoEstado
      );


      // ========================================
      // RESPUESTA
      // ========================================

      if (nuevoEstado === 1) {

        return res.status(200).json({
          mensaje:
            'Usuario activado correctamente'
        });

      }


      return res.status(200).json({
        mensaje:
          'Usuario desactivado correctamente'
      });


    } catch (error) {

      console.error(
        'Error al cambiar estado:',
        error
      );


      return res.status(500).json({
        mensaje:
          'Error al cambiar el estado del usuario'
      });

    }

  };


// ========================================
// ELIMINACIÓN LÓGICA
//
// No elimina físicamente.
//
// SUPERADMIN:
// puede desactivar administradores
// y operativos.
//
// ADMIN NORMAL:
// solamente operativos.
//
// SUPERADMIN PRINCIPAL:
// protegido.
// ========================================

export const eliminarUsuarioLogicamente =
  async (req, res) => {

    try {

      const id =
        Number(req.params.id);


      // ========================================
      // VALIDAR ID
      // ========================================

      if (
        !Number.isInteger(id) ||
        id <= 0
      ) {

        return res.status(400).json({
          mensaje:
            'ID de usuario inválido'
        });

      }


      // ========================================
      // OBTENER USUARIO
      // ========================================

      const usuarioObjetivo =
        await obtenerUsuarioPorId(id);


      if (!usuarioObjetivo) {

        return res.status(404).json({
          mensaje:
            'Usuario no encontrado'
        });

      }


      const solicitanteEsSuperadmin =
        esSuperAdministrador(
          req.usuario
        );


      // ========================================
      // SUPERADMIN PRINCIPAL PROTEGIDO
      // ========================================

      if (
        Boolean(
          usuarioObjetivo.es_superadmin
        )
      ) {

        return res.status(403).json({
          mensaje:
            'La cuenta del superadministrador no puede ser desactivada'
        });

      }


      // ========================================
      // ADMIN NORMAL
      // NO PUEDE DESACTIVAR ADMINS
      // ========================================

      if (
        !solicitanteEsSuperadmin &&
        usuarioObjetivo.rol ===
          'administrador'
      ) {

        return res.status(403).json({
          mensaje:
            'Un administrador normal no puede desactivar a otro administrador'
        });

      }


      // ========================================
      // YA ESTÁ DESACTIVADO
      // ========================================

      if (!usuarioObjetivo.activo) {

        return res.status(400).json({
          mensaje:
            'El usuario ya está desactivado'
        });

      }


      // ========================================
      // ELIMINACIÓN LÓGICA
      // ========================================

      await desactivarUsuario(id);


      return res.status(200).json({
        mensaje:
          'Usuario eliminado lógicamente correctamente'
      });


    } catch (error) {

      console.error(
        'Error al eliminar usuario:',
        error
      );


      return res.status(500).json({
        mensaje:
          'Error al eliminar usuario'
      });

    }

  };