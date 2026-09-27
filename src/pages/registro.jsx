import { useState } from 'react';
import { registrarUsuario } from '../services/api.js';

function Registro({ cambiarPantalla }) {
  const [formulario, setFormulario] = useState({
    nombre: '',
    correo: '',
    contrasena: '',
    preguntarc: '',
    respuestarc: ''
  });

  const cambiarValor = (e) => {
    setFormulario({
      ...formulario,
      [e.target.name]: e.target.value
    });
  };

  const registrar = async (e) => {
    e.preventDefault();

    const resultado = await registrarUsuario(formulario);

    if (resultado.ok) {
      cambiarPantalla('login');
    }
  };

  return (
    <div className="contenedor-formulario">
      <h1>Registro</h1>

      <form onSubmit={registrar}>
        <input name="nombre" placeholder="Nombre" onChange={cambiarValor} />
        <input name="correo" placeholder="Correo" onChange={cambiarValor} />
        <input name="contrasena" type="password" placeholder="Contraseña" onChange={cambiarValor} />
        <input name="preguntarc" placeholder="Pregunta de recuperación" onChange={cambiarValor} />
        <input name="respuestarc" placeholder="Respuesta de recuperación" onChange={cambiarValor} />

        <button type="submit">Registrarme</button>
      </form>

      <button onClick={() => cambiarPantalla('login')}>
        Volver al login
      </button>
    </div>
  );
}

export default Registro;