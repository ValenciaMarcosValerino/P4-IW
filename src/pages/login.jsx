import { useState } from 'react';
import { loginUsuario } from '../services/api.js';

function Login({ cambiarPantalla, setUsuario }) {
  const [correo, setCorreo] = useState('');
  const [contrasena, setContrasena] = useState('');
  const [mensaje, setMensaje] = useState('');
  const [cargando, setCargando] = useState(false);

  // ========================================
  // INICIAR SESIÓN
  // ========================================

  const iniciarSesion = async (e) => {
    e.preventDefault();

    setMensaje('');
    setCargando(true);

    const resultado = await loginUsuario(
      correo,
      contrasena
    );

    // ========================================
    // MENSAJES DE PRUEBA EN CONSOLA
    // ========================================

    console.log(
      'RESULTADO DEL LOGIN:',
      resultado
    );

    console.log(
      'USUARIO RECIBIDO:',
      resultado.usuario
    );

    console.log(
      'ROL RECIBIDO:',
      resultado.usuario?.rol
    );

    setCargando(false);

    // ========================================
    // LOGIN CORRECTO
    // ========================================

    if (resultado.ok) {
      setUsuario(resultado.usuario);

      // Convertimos el rol a texto limpio
      const rol = String(
        resultado.usuario?.rol || ''
      )
        .trim()
        .toLowerCase();

      console.log(
        'ROL PROCESADO:',
        rol
      );

      // ========================================
      // REDIRECCIÓN SEGÚN ROL
      // ========================================

      if (rol === 'administrador') {
        console.log(
          'ENTRANDO A PANEL ADMIN'
        );

        cambiarPantalla('admin');
      } else {
        console.log(
          'ENTRANDO A BIENVENIDA'
        );

        cambiarPantalla(
          'bienvenida'
        );
      }

      return;
    }

    // ========================================
    // LOGIN INCORRECTO
    // ========================================

    setMensaje(
      resultado.mensaje ||
      'Correo o contraseña incorrectos'
    );
  };

  // ========================================
  // INTERFAZ
  // ========================================

  return (
    <div className="contenedor-formulario">

      <h1>
        Iniciar sesión
      </h1>

      <form onSubmit={iniciarSesion}>

        <input
          type="email"
          placeholder="Correo"
          value={correo}
          onChange={(e) =>
            setCorreo(e.target.value)
          }
          required
        />

        <input
          type="password"
          placeholder="Contraseña"
          value={contrasena}
          onChange={(e) =>
            setContrasena(e.target.value)
          }
          required
        />

        <button
          type="submit"
          disabled={cargando}
        >
          {cargando
            ? 'Ingresando...'
            : 'Ingresar'}
        </button>

      </form>

      {mensaje && (
        <p>{mensaje}</p>
      )}

      <button
        type="button"
        onClick={() =>
          cambiarPantalla(
            'registro'
          )
        }
      >
        Crear cuenta
      </button>

    </div>
  );
}

export default Login;