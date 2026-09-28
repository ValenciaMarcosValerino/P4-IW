import sql from 'mssql';

import {
  getConnection
} from '../config/sqlserver.js';


// ========================================
// BUSCAR USUARIO POR CORREO
//
// Se utiliza para comprobar si
// un correo ya existe.
// ========================================

export const buscarUsuarioPorCorreo =
  async (correo) => {

    const pool =
      await getConnection();


    const resultado =
      await pool
        .request()
        .input(
          'correo',
          sql.VarChar,
          correo
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
        `);


    return (
      resultado.recordset[0] ||
      null
    );

  };


// ========================================
// BUSCAR USUARIO PARA LOGIN
//
// Por ahora seguimos utilizando
// contraseña directa.
//
// Más adelante podemos implementar
// bcrypt.
// ========================================

export const buscarUsuarioPorCredenciales =
  async (
    correo,
    contrasena
  ) => {

    const pool =
      await getConnection();


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


    return (
      resultado.recordset[0] ||
      null
    );

  };


// ========================================
// CREAR USUARIO
//
// El rol, activo y es_superadmin
// utilizan los valores DEFAULT
// configurados en SQL Server.
// ========================================

export const crearUsuario =
  async ({
    nombre,
    correo,
    contrasena,
    preguntarc,
    respuestarc
  }) => {

    const pool =
      await getConnection();


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


    return true;

  };


// ========================================
// OBTENER TODOS LOS USUARIOS
//
// IMPORTANTE:
// El superadministrador NO aparece
// en el listado general.
// ========================================

export const obtenerTodosLosUsuarios =
  async () => {

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


    return resultado.recordset;

  };


// ========================================
// OBTENER USUARIO POR ID
//
// Esta versión es segura para
// regresar información al frontend.
//
// NO devuelve:
// - contraseña
// - respuesta de recuperación
// ========================================

export const obtenerUsuarioPorId =
  async (id) => {

    const pool =
      await getConnection();


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


    return (
      resultado.recordset[0] ||
      null
    );

  };


// ========================================
// OBTENER USUARIO COMPLETO POR ID
//
// SOLO PARA USO INTERNO DEL BACKEND.
//
// Esta consulta sí obtiene:
// - contraseña
// - respuesta de recuperación
//
// Se necesita cuando queremos conservar
// esos valores si el usuario no los cambia.
// ========================================

export const obtenerUsuarioCompletoPorId =
  async (id) => {

    const pool =
      await getConnection();


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
            contrasena,
            preguntarc,
            respuestarc,
            rol,
            activo,
            es_superadmin
          FROM dbo.Users
          WHERE id = @id
        `);


    return (
      resultado.recordset[0] ||
      null
    );

  };


// ========================================
// COMPROBAR SI EL CORREO YA PERTENECE
// A OTRO USUARIO
//
// Sirve durante una modificación.
// ========================================

export const correoPerteneceAOtroUsuario =
  async (
    correo,
    id
  ) => {

    const pool =
      await getConnection();


    const resultado =
      await pool
        .request()
        .input(
          'correo',
          sql.VarChar,
          correo
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


    return (
      resultado.recordset.length > 0
    );

  };


// ========================================
// ACTUALIZAR DATOS DEL USUARIO
// ========================================

export const actualizarUsuario =
  async (
    id,
    {
      nombre,
      correo,
      contrasena,
      preguntarc,
      respuestarc,
      rol
    }
  ) => {

    const pool =
      await getConnection();


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
      .input(
        'rol',
        sql.VarChar,
        rol
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


    return true;

  };


// ========================================
// CAMBIAR ESTADO DEL USUARIO
//
// activo = 1
// activo = 0
// ========================================

export const actualizarEstadoUsuario =
  async (
    id,
    activo
  ) => {

    const pool =
      await getConnection();


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
        activo
      )
      .query(`
        UPDATE dbo.Users
        SET activo = @activo
        WHERE id = @id
      `);


    return true;

  };


// ========================================
// ELIMINACIÓN LÓGICA
//
// NO elimina físicamente la fila.
//
// Solamente:
// activo = 0
// ========================================

export const desactivarUsuario =
  async (id) => {

    const pool =
      await getConnection();


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


    return true;

  };