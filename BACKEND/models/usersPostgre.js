import {
  getConnection
} from '../config/postgresql.js';


// ========================================
// BUSCAR USUARIO POR CORREO
//
// Se utiliza para comprobar si
// un correo ya existe.
// ========================================

export const buscarUsuarioPorCorreo =
  async (correo) => {

    const resultado =
      await getConnection.query(
        `
          SELECT
            id,
            nombre,
            correo,
            rol,
            activo,
            es_superadmin
          FROM "Users"
          WHERE correo = $1
        `,
        [correo]
      );


    return (
      resultado.rows[0] ||
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

    const resultado =
      await getConnection.query(
        `
          SELECT
            id,
            nombre,
            correo,
            rol,
            activo,
            es_superadmin
          FROM "Users"
          WHERE correo = $1
          AND contrasena = $2
        `,
        [
          correo,
          contrasena
        ]
      );


    return (
      resultado.rows[0] ||
      null
    );

  };


// ========================================
// CREAR USUARIO
//
// El rol, activo y es_superadmin
// utilizan los valores DEFAULT
// configurados en PostgreSQL.
// ========================================

export const crearUsuario =
  async ({
    nombre,
    correo,
    contrasena,
    preguntarc,
    respuestarc
  }) => {

    await getConnection.query(
      `
        INSERT INTO "Users"
        (
          nombre,
          correo,
          contrasena,
          preguntarc,
          respuestarc
        )
        VALUES
        (
          $1,
          $2,
          $3,
          $4,
          $5
        )
      `,
      [
        nombre,
        correo,
        contrasena,
        preguntarc,
        respuestarc
      ]
    );


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

    const resultado =
      await getConnection.query(
        `
          SELECT
            id,
            nombre,
            correo,
            preguntarc,
            rol,
            activo,
            es_superadmin
          FROM "Users"
          WHERE es_superadmin = false
          ORDER BY id
        `
      );


    return resultado.rows;

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

    const resultado =
      await getConnection.query(
        `
          SELECT
            id,
            nombre,
            correo,
            preguntarc,
            rol,
            activo,
            es_superadmin
          FROM "Users"
          WHERE id = $1
        `,
        [id]
      );


    return (
      resultado.rows[0] ||
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

    const resultado =
      await getConnection.query(
        `
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
          FROM "Users"
          WHERE id = $1
        `,
        [id]
      );


    return (
      resultado.rows[0] ||
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

    const resultado =
      await getConnection.query(
        `
          SELECT id
          FROM "Users"
          WHERE correo = $1
          AND id <> $2
        `,
        [
          correo,
          id
        ]
      );


    return (
      resultado.rows.length > 0
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

    await getConnection.query(
      `
        UPDATE "Users"
        SET
          nombre = $1,
          correo = $2,
          contrasena = $3,
          preguntarc = $4,
          respuestarc = $5,
          rol = $6
        WHERE id = $7
      `,
      [
        nombre,
        correo,
        contrasena,
        preguntarc,
        respuestarc,
        rol,
        id
      ]
    );


    return true;

  };


// ========================================
// CAMBIAR ESTADO DEL USUARIO
//
// activo es BOOLEAN
//
// true  = activo
// false = inactivo
// ========================================

export const actualizarEstadoUsuario =
  async (
    id,
    activo
  ) => {

    await getConnection.query(
      `
        UPDATE "Users"
        SET activo = $1
        WHERE id = $2
      `,
      [
        activo,
        id
      ]
    );


    return true;

  };


// ========================================
// ELIMINACIÓN LÓGICA
//
// NO elimina físicamente la fila.
//
// Solamente:
// activo = false
// ========================================

export const desactivarUsuario =
  async (id) => {

    await getConnection.query(
      `
        UPDATE "Users"
        SET activo = false
        WHERE id = $1
      `,
      [id]
    );


    return true;

  };