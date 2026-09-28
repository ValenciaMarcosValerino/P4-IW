const API_URL = 'http://localhost:5000';


// ========================================
// OBTENER TOKEN GUARDADO
// ========================================

export const obtenerToken = () => {
  return sessionStorage.getItem('token');
};


// ========================================
// LOGIN
// ========================================

export const loginUsuario = async (
  correo,
  contrasena
) => {

  try {

    const respuesta = await fetch(
      `${API_URL}/api/sqlserver/login`,
      {
        method: 'POST',

        headers: {
          'Content-Type': 'application/json'
        },

        body: JSON.stringify({
          correo,
          contrasena
        })
      }
    );


    const datos =
      await respuesta.json();


    if (respuesta.ok) {

      sessionStorage.setItem(
        'token',
        datos.token
      );

      return {
        ok: true,
        mensaje: datos.mensaje,
        token: datos.token,
        usuario: datos.usuario
      };

    }


    return {
      ok: false,
      mensaje:
        datos.mensaje ||
        'Correo o contraseña incorrectos'
    };


  } catch (error) {

    console.error(
      'Error al iniciar sesión:',
      error
    );

    return {
      ok: false,
      mensaje:
        'No se pudo conectar con el servidor'
    };

  }

};


// ========================================
// REGISTRAR USUARIO
// ========================================

export const registrarUsuario = async (
  usuario
) => {

  try {

    const respuesta = await fetch(
      `${API_URL}/api/sqlserver/users`,
      {
        method: 'POST',

        headers: {
          'Content-Type': 'application/json'
        },

        body: JSON.stringify(usuario)
      }
    );


    const datos =
      await respuesta.json();


    return {
      ok: respuesta.ok,
      ...datos
    };


  } catch (error) {

    console.error(
      'Error al registrar usuario:',
      error
    );

    return {
      ok: false,
      mensaje:
        'No se pudo conectar con el servidor'
    };

  }

};


// ========================================
// OBTENER TODOS LOS USUARIOS
// SOLO ADMINISTRADOR
// ========================================

export const obtenerUsuarios = async () => {

  try {

    const token =
      obtenerToken();


    const respuesta = await fetch(
      `${API_URL}/api/sqlserver/users`,
      {
        method: 'GET',

        headers: {
          Authorization:
            `Bearer ${token}`
        }
      }
    );


    const datos =
      await respuesta.json();


    return {
      ok: respuesta.ok,
      datos
    };


  } catch (error) {

    console.error(
      'Error al obtener usuarios:',
      error
    );

    return {
      ok: false,
      mensaje:
        'No se pudo conectar con el servidor'
    };

  }

};


// ========================================
// OBTENER USUARIO POR ID
// ========================================

export const obtenerUsuarioPorId =
  async (id) => {

    try {

      const token =
        obtenerToken();


      const respuesta = await fetch(
        `${API_URL}/api/sqlserver/users/${id}`,
        {
          method: 'GET',

          headers: {
            Authorization:
              `Bearer ${token}`
          }
        }
      );


      const datos =
        await respuesta.json();


      return {
        ok: respuesta.ok,
        datos
      };


    } catch (error) {

      console.error(
        'Error al obtener usuario:',
        error
      );

      return {
        ok: false,
        mensaje:
          'No se pudo conectar con el servidor'
      };

    }

  };


// ========================================
// MODIFICAR USUARIO
// ========================================

export const modificarUsuario = async (
  id,
  usuario
) => {

  try {

    const token =
      obtenerToken();


    const respuesta = await fetch(
      `${API_URL}/api/sqlserver/users/${id}`,
      {
        method: 'PUT',

        headers: {
          'Content-Type':
            'application/json',

          Authorization:
            `Bearer ${token}`
        },

        body:
          JSON.stringify(usuario)
      }
    );


    const datos =
      await respuesta.json();


    return {
      ok: respuesta.ok,
      ...datos
    };


  } catch (error) {

    console.error(
      'Error al modificar usuario:',
      error
    );

    return {
      ok: false,
      mensaje:
        'No se pudo conectar con el servidor'
    };

  }

};


// ========================================
// ELIMINACIÓN LÓGICA
// SOLO ADMINISTRADOR
// ========================================

export const eliminarUsuario = async (
  id
) => {

  try {

    const token =
      obtenerToken();


    const respuesta = await fetch(
      `${API_URL}/api/sqlserver/users/${id}`,
      {
        method: 'DELETE',

        headers: {
          Authorization:
            `Bearer ${token}`
        }
      }
    );


    const datos =
      await respuesta.json();


    return {
      ok: respuesta.ok,
      ...datos
    };


  } catch (error) {

    console.error(
      'Error al eliminar usuario:',
      error
    );

    return {
      ok: false,
      mensaje:
        'No se pudo conectar con el servidor'
    };

  }

};


// ========================================
// CAMBIAR ESTADO DEL USUARIO
// ACTIVAR / DESACTIVAR
// SOLO ADMINISTRADOR
// ========================================

export const cambiarEstadoUsuario =
  async (id, activo) => {

    try {

      const token =
        obtenerToken();


      const respuesta = await fetch(
        `${API_URL}/api/sqlserver/users/${id}/estado`,
        {
          method: 'PUT',

          headers: {
            'Content-Type':
              'application/json',

            Authorization:
              `Bearer ${token}`
          },

          body: JSON.stringify({
            activo
          })
        }
      );


      const datos =
        await respuesta.json();


      return {
        ok: respuesta.ok,
        ...datos
      };


    } catch (error) {

      console.error(
        'Error al cambiar estado:',
        error
      );


      return {
        ok: false,
        mensaje:
          'No se pudo conectar con el servidor'
      };

    }

  };


// ========================================
// CERRAR SESIÓN
// ========================================

export const cerrarSesion = () => {

  sessionStorage.removeItem(
    'token'
  );


  return {
    ok: true,
    mensaje:
      'Sesión cerrada correctamente'
  };

};