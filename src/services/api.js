const API_URL = 'http://localhost:5000'; //servidor para el backend express

export const loginUsuario = async (correo, contrasena) => {
  const respuesta = await fetch(`${API_URL}/api/auth/login`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    credentials: 'include',
    body: JSON.stringify({ correo, contrasena })
  });

  return respuesta.json();
};

export const registrarUsuario = async (usuario) => {
  const respuesta = await fetch(`${API_URL}/api/sqlserver/users`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    credentials: 'include',
    body: JSON.stringify(usuario)
  });

  return respuesta.json();
};

export const obtenerSesion = async () => {
  const respuesta = await fetch(`${API_URL}/api/auth/session`, {
    credentials: 'include'
  });

  return respuesta.json();
};

export const cerrarSesion = async () => {
  const respuesta = await fetch(`${API_URL}/api/auth/logout`, {
    method: 'POST',
    credentials: 'include'
  });

  return respuesta.json();
};