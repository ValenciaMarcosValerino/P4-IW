import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import sql from 'mssql';
import jwt from 'jsonwebtoken';

import { getConnection } from './config/sqlserver.js';


// ========================================
// VARIABLES DE ENTORNO
// ========================================

dotenv.config();

const app = express();

const PORT = process.env.PORT || 5000;
const JWT_SECRET = process.env.JWT_SECRET;


// ========================================
// VALIDAR JWT_SECRET
// ========================================

if (!JWT_SECRET) {

  console.error(
    'ERROR: No existe JWT_SECRET en el archivo .env'
  );

  process.exit(1);

}


// ========================================
// MIDDLEWARES GENERALES
// ========================================

app.use(
  cors({
    origin: 'http://localhost:5173',
    credentials: true
  })
);

app.use(express.json());


// ========================================
// VERIFICAR TOKEN JWT
// ========================================

const verificarToken = (
  req,
  res,
  next
) => {

  const authorization =
    req.headers.authorization;


  // No se recibió token
  if (!authorization) {

    return res.status(401).json({
      mensaje:
        'Token requerido'
    });

  }


  // Formato esperado:
  // Bearer TOKEN

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


  try {

    const usuario =
      jwt.verify(
        token,
        JWT_SECRET
      );


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
// ADMIN NORMAL O SUPERADMIN
// ========================================

const soloAdministrador = (
  req,
  res,
  next
) => {

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
// ========================================

const esSuperAdministrador = (
  usuario
) => {

  return (
    usuario.es_superadmin === true ||
    usuario.es_superadmin === 1
  );

};


// ========================================
// RUTA DE PRUEBA
// ========================================

app.get(
  '/',
  (req, res) => {

    res.json({
      mensaje:
        'Backend funcionando correctamente'
    });

  }
);


// ========================================
// REGISTRAR USUARIO
//
// Todo usuario nuevo entra como:
// rol = operativo
// es_superadmin = 0
//
// Esto lo controlan los valores DEFAULT
// de SQL Server.
// ========================================

app.post(
  '/api/sqlserver/users',
  async (req, res) => {

    try {

      const {
        nombre,
        correo,
        contrasena,
        preguntarc,
        respuestarc
      } = req.body;


      // ========================================
      // VALIDAR CAMPOS
      // ========================================

      if (
        !nombre ||
        !correo ||
        !contrasena ||
        !preguntarc ||
        !respuestarc
      ) {

        return res.status(400).json({
          mensaje:
            'Todos los campos son obligatorios'
        });

      }


      const pool =
        await getConnection();


      // ========================================
      // COMPROBAR CORREO DUPLICADO
      // ========================================

      const correoExistente =
        await pool
          .request()
          .input(
            'correo',
            sql.VarChar,
            correo
          )
          .query(`
            SELECT id
            FROM dbo.Users
            WHERE correo = @correo
          `);


      if (
        correoExistente
          .recordset.length > 0
      ) {

        return res.status(409).json({
          mensaje:
            'El correo ya está registrado'
        });

      }


      // ========================================
      // INSERTAR USUARIO
      // ========================================

      await pool
        .request()
        .input(
          'nombre',
          sql.VarChar,
          nombre
        )
        .input(
          'correo',
          sql.VarChar,
          correo
        )
        .input(
          'contrasena',
          sql.VarChar,
          contrasena
        )
        .input(
          'preguntarc',
          sql.VarChar,
          preguntarc
        )
        .input(
          'respuestarc',
          sql.VarChar,
          respuestarc
        )
        .query(`
          INSERT INTO dbo.Users
          (
            nombre,
            correo,
            contrasena,
            preguntarc,
            respuestarc
          )
          VALUES
          (
            @nombre,
            @correo,
            @contrasena,
            @preguntarc,
            @respuestarc
          )
        `);


      return res.status(201).json({
        mensaje:
          'Usuario registrado correctamente'
      });


    } catch (error) {

      console.error(
        'Error al registrar usuario:',
        error
      );


      return res.status(500).json({
        mensaje:
          'Error al registrar usuario'
      });

    }

  }
);


// ========================================
// LOGIN
// ========================================

app.post(
  '/api/sqlserver/login',
  async (req, res) => {

    try {

      const {
        correo,
        contrasena
      } = req.body;


      // ========================================
      // VALIDAR CAMPOS
      // ========================================

      if (
        !correo ||
        !contrasena
      ) {

        return res.status(400).json({
          mensaje:
            'Correo y contraseña son obligatorios'
        });

      }


      const pool =
        await getConnection();


      // ========================================
      // BUSCAR USUARIO
      // ========================================

      const resultado =
        await pool
          .request()
          .input(
            'correo',
            sql.VarChar,
            correo
          )
          .input(
            'contrasena',
            sql.VarChar,
            contrasena
          )
          .query(`
            SELECT
              id,
              nombre,
              correo,
              rol,
              activo,
              es_superadmin
            FROM dbo.Users
            WHERE correo = @correo
            AND contrasena = @contrasena
          `);


      // ========================================
      // CREDENCIALES INCORRECTAS
      // ========================================

      if (
        resultado.recordset.length === 0
      ) {

        return res.status(401).json({
          mensaje:
            'Correo o contraseña incorrectos'
        });

      }


      const usuario =
        resultado.recordset[0];


      // ========================================
      // USUARIO DESACTIVADO
      // ========================================

      if (!usuario.activo) {

        return res.status(403).json({
          mensaje:
            'Este usuario está desactivado'
        });

      }


      // ========================================
      // GENERAR JWT
      // ========================================

      const token =
        jwt.sign(
          {
            id:
              usuario.id,

            correo:
              usuario.correo,

            rol:
              usuario.rol,

            es_superadmin:
              Boolean(
                usuario.es_superadmin
              )
          },
          JWT_SECRET,
          {
            expiresIn: '1h'
          }
        );


      // ========================================
      // RESPUESTA
      // ========================================

      return res.status(200).json({

        mensaje:
          'Inicio de sesión correcto',

        token,

        usuario: {

          id:
            usuario.id,

          nombre:
            usuario.nombre,

          correo:
            usuario.correo,

          rol:
            usuario.rol,

          es_superadmin:
            Boolean(
              usuario.es_superadmin
            )

        }

      });


    } catch (error) {

      console.error(
        'Error en login:',
        error
      );


      return res.status(500).json({
        mensaje:
          'Error al iniciar sesión'
      });

    }

  }
);


// ========================================
// OBTENER TODOS LOS USUARIOS
//
// SOLO ADMINISTRADORES.
//
// IMPORTANTE:
// El superadministrador NO aparece
// en el listado.
// ========================================

app.get(
  '/api/sqlserver/users',
  verificarToken,
  soloAdministrador,
  async (req, res) => {

    try {

      const pool =
        await getConnection();


      const resultado =
        await pool
          .request()
          .query(`
            SELECT
              id,
              nombre,
              correo,
              preguntarc,
              rol,
              activo,
              es_superadmin
            FROM dbo.Users
            WHERE es_superadmin = 0
            ORDER BY id
          `);


      return res.status(200).json(
        resultado.recordset
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

  }
);


// ========================================
// OBTENER USUARIO POR ID
//
// OPERATIVO:
// solamente puede verse a sí mismo.
//
// ADMINISTRADOR NORMAL:
// puede consultar usuarios,
// excepto al superadministrador.
//
// SUPERADMIN:
// puede consultar cualquier cuenta.
// ========================================

app.get(
  '/api/sqlserver/users/:id',
  verificarToken,
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


      const pool =
        await getConnection();


      // ========================================
      // BUSCAR USUARIO
      // ========================================

      const resultado =
        await pool
          .request()
          .input(
            'id',
            sql.Int,
            id
          )
          .query(`
            SELECT
              id,
              nombre,
              correo,
              preguntarc,
              rol,
              activo,
              es_superadmin
            FROM dbo.Users
            WHERE id = @id
          `);


      if (
        resultado.recordset.length === 0
      ) {

        return res.status(404).json({
          mensaje:
            'Usuario no encontrado'
        });

      }


      const usuarioObjetivo =
        resultado.recordset[0];


      const solicitanteEsSuperadmin =
        esSuperAdministrador(
          req.usuario
        );


      const solicitanteEsAdministrador =
        req.usuario.rol ===
        'administrador';


      const esCuentaPropia =
        req.usuario.id === id;


      // ========================================
      // OPERATIVO
      // SOLO SU PROPIA CUENTA
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
      // ADMIN NORMAL
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

  }
);


// ========================================
// MODIFICAR USUARIO
//
// SUPERADMIN:
// - modifica operativos
// - modifica administradores
// - cambia roles
//
// ADMINISTRADOR NORMAL:
// - modifica operativos
// - modifica sus propios datos
// - NO modifica otro administrador
// - NO modifica al superadmin
// - NO cambia roles
//
// OPERATIVO:
// - solamente modifica su propia cuenta
// - NO cambia rol
// ========================================

app.put(
  '/api/sqlserver/users/:id',
  verificarToken,
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


      const pool =
        await getConnection();


      // ========================================
      // OBTENER USUARIO OBJETIVO
      // ========================================

      const resultadoUsuario =
        await pool
          .request()
          .input(
            'id',
            sql.Int,
            id
          )
          .query(`
            SELECT
              id,
              nombre,
              correo,
              contrasena,
              preguntarc,
              respuestarc,
              rol,
              activo,
              es_superadmin
            FROM dbo.Users
            WHERE id = @id
          `);


      if (
        resultadoUsuario
          .recordset.length === 0
      ) {

        return res.status(404).json({
          mensaje:
            'Usuario no encontrado'
        });

      }


      const usuarioActual =
        resultadoUsuario.recordset[0];


      // ========================================
      // DATOS DEL SOLICITANTE
      // ========================================

      const solicitanteEsSuperadmin =
        esSuperAdministrador(
          req.usuario
        );


      const solicitanteEsAdministrador =
        req.usuario.rol ===
        'administrador';


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
      // OPERATIVO
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
      // ADMINISTRADOR NORMAL
      // ========================================

      if (
        solicitanteEsAdministrador &&
        !solicitanteEsSuperadmin
      ) {

        // No puede modificar al superadmin
        if (
          objetivoEsSuperadmin
        ) {

          return res.status(403).json({
            mensaje:
              'No tienes permiso para modificar esta cuenta'
          });

        }


        // Puede modificar su propia cuenta,
        // pero no otro administrador.
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


        if (
          rol !== 'administrador' &&
          rol !== 'operativo'
        ) {

          return res.status(400).json({
            mensaje:
              'Rol inválido'
          });

        }


        // La cuenta superadmin siempre
        // debe conservar rol administrador.
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
      // CORREO DUPLICADO
      // ========================================

      const correoExistente =
        await pool
          .request()
          .input(
            'correo',
            sql.VarChar,
            nuevoCorreo
          )
          .input(
            'id',
            sql.Int,
            id
          )
          .query(`
            SELECT id
            FROM dbo.Users
            WHERE correo = @correo
            AND id <> @id
          `);


      if (
        correoExistente
          .recordset.length > 0
      ) {

        return res.status(409).json({
          mensaje:
            'El correo ya pertenece a otro usuario'
        });

      }


      // ========================================
      // ACTUALIZAR USUARIO
      // ========================================

      await pool
        .request()
        .input(
          'id',
          sql.Int,
          id
        )
        .input(
          'nombre',
          sql.VarChar,
          nuevoNombre
        )
        .input(
          'correo',
          sql.VarChar,
          nuevoCorreo
        )
        .input(
          'contrasena',
          sql.VarChar,
          nuevaContrasena
        )
        .input(
          'preguntarc',
          sql.VarChar,
          nuevaPregunta
        )
        .input(
          'respuestarc',
          sql.VarChar,
          nuevaRespuesta
        )
        .input(
          'rol',
          sql.VarChar,
          nuevoRol
        )
        .query(`
          UPDATE dbo.Users
          SET
            nombre = @nombre,
            correo = @correo,
            contrasena = @contrasena,
            preguntarc = @preguntarc,
            respuestarc = @respuestarc,
            rol = @rol
          WHERE id = @id
        `);


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

  }
);


// ========================================
// CAMBIAR ESTADO
// ACTIVAR / DESACTIVAR
//
// SUPERADMIN:
// puede cambiar estado de
// operativos y administradores.
//
// ADMIN NORMAL:
// solamente operativos.
//
// CUENTA SUPERADMIN:
// nunca puede ser desactivada.
// ========================================

app.put(
  '/api/sqlserver/users/:id/estado',
  verificarToken,
  soloAdministrador,
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


      const pool =
        await getConnection();


      // ========================================
      // OBTENER USUARIO OBJETIVO
      // ========================================

      const resultado =
        await pool
          .request()
          .input(
            'id',
            sql.Int,
            id
          )
          .query(`
            SELECT
              id,
              rol,
              activo,
              es_superadmin
            FROM dbo.Users
            WHERE id = @id
          `);


      if (
        resultado.recordset.length === 0
      ) {

        return res.status(404).json({
          mensaje:
            'Usuario no encontrado'
        });

      }


      const usuarioObjetivo =
        resultado.recordset[0];


      const solicitanteEsSuperadmin =
        esSuperAdministrador(
          req.usuario
        );


      // ========================================
      // CUENTA SUPERADMIN PROTEGIDA
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
      // ADMIN NORMAL NO PUEDE CAMBIAR
      // ESTADO DE ADMINISTRADORES
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

      await pool
        .request()
        .input(
          'id',
          sql.Int,
          id
        )
        .input(
          'activo',
          sql.Bit,
          nuevoEstado
        )
        .query(`
          UPDATE dbo.Users
          SET activo = @activo
          WHERE id = @id
        `);


      if (
        nuevoEstado === 1
      ) {

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

  }
);


// ========================================
// ELIMINACIÓN LÓGICA
//
// Se conserva por compatibilidad
// con la API anterior.
//
// SUPERADMIN:
// puede desactivar operativos y admins.
//
// ADMIN NORMAL:
// solamente operativos.
//
// SUPERADMIN PRINCIPAL:
// protegido.
// ========================================

app.delete(
  '/api/sqlserver/users/:id',
  verificarToken,
  soloAdministrador,
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


      const pool =
        await getConnection();


      // ========================================
      // BUSCAR USUARIO
      // ========================================

      const resultado =
        await pool
          .request()
          .input(
            'id',
            sql.Int,
            id
          )
          .query(`
            SELECT
              id,
              rol,
              activo,
              es_superadmin
            FROM dbo.Users
            WHERE id = @id
          `);


      if (
        resultado.recordset.length === 0
      ) {

        return res.status(404).json({
          mensaje:
            'Usuario no encontrado'
        });

      }


      const usuarioObjetivo =
        resultado.recordset[0];


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
      // ADMIN NORMAL NO PUEDE DESACTIVAR
      // OTROS ADMINISTRADORES
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

      if (
        !usuarioObjetivo.activo
      ) {

        return res.status(400).json({
          mensaje:
            'El usuario ya está desactivado'
        });

      }


      // ========================================
      // ELIMINACIÓN LÓGICA
      // ========================================

      await pool
        .request()
        .input(
          'id',
          sql.Int,
          id
        )
        .query(`
          UPDATE dbo.Users
          SET activo = 0
          WHERE id = @id
        `);


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

  }
);


// ========================================
// INICIAR SERVIDOR
// ========================================

app.listen(
  PORT,
  () => {

    console.log(
      `Servidor backend corriendo en http://localhost:${PORT}`
    );

  }
);
//en este index ya tenemos 2 endpoints uno que es el GET y otro que es el POST