import { useState } from 'react';
import { loginUsuario } from '../services/api.js';

function Login({ cambiarPantalla, setUsuario }) {
  const [correo, setCorreo] = useState('');
  const [contrasena, setContrasena] = useState('');
  const [mensaje, setMensaje] = useState('');

  const iniciarSesion = async (e) => {
    e.preventDefault();

    const resultado = await loginUsuario(correo, contrasena);

    if (resultado.ok) {
      setUsuario(resultado.usuario);
      cambiarPantalla('bienvenida');
    } else {
      setMensaje(resultado.mensaje || 'Correo o contraseña incorrectos');
    }
  };

  return (
    <div className="contenedor-formulario">
      <h1>Iniciar sesión</h1>

      <form onSubmit={iniciarSesion}>
        <input
          type="email"
          placeholder="Correo"
          value={correo}
          onChange={(e) => setCorreo(e.target.value)}
        />

        <input
          type="password"
          placeholder="Contraseña"
          value={contrasena}
          onChange={(e) => setContrasena(e.target.value)}
        />

        <button type="submit">Ingresar</button>
      </form>

      <p>{mensaje}</p>

      <button onClick={() => cambiarPantalla('registro')}>
        Crear cuenta
      </button>
    </div>
  );
}

export default Login;