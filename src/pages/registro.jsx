import { useState } from 'react';
import { registrarUsuario } from '../services/api.js';

function Registro({ cambiarPantalla }) {

  const [nombre, setNombre] = useState('');
  const [correo, setCorreo] = useState('');
  const [contrasena, setContrasena] = useState('');
  const [preguntarc, setPreguntarc] = useState('');
  const [respuestarc, setRespuestarc] = useState('');
  const [mensaje, setMensaje] = useState('');
  const [cargando, setCargando] = useState(false);


  // ========================================
  // CAMBIAR PREGUNTA DE RECUPERACIÓN
  // ========================================

  const cambiarPregunta = (e) => {

    const nuevaPregunta = e.target.value;

    setPreguntarc(nuevaPregunta);

    // Si cambia la pregunta,
    // eliminamos la respuesta anterior
    setRespuestarc('');

  };


  // ========================================
  // REGISTRAR USUARIO
  // ========================================

  const registrar = async (e) => {

    e.preventDefault();

    setMensaje('');


    if (!preguntarc) {

      setMensaje(
        'Selecciona una pregunta de recuperación'
      );

      return;

    }


    if (!respuestarc.trim()) {

      setMensaje(
        'Escribe una respuesta de recuperación'
      );

      return;

    }


    setCargando(true);


    const resultado = await registrarUsuario({

      nombre: nombre.trim(),

      correo: correo.trim(),

      contrasena,

      preguntarc,

      respuestarc:
        respuestarc.trim()

    });


    setCargando(false);


    if (resultado.ok) {

      setMensaje(
        'Usuario registrado correctamente'
      );

      setNombre('');
      setCorreo('');
      setContrasena('');
      setPreguntarc('');
      setRespuestarc('');

      return;

    }


    setMensaje(
      resultado.mensaje ||
      'No se pudo registrar el usuario'
    );

  };


  return (

    <div className="contenedor-formulario">

      <h1>
        Registro
      </h1>


      <form onSubmit={registrar}>

        <input
          type="text"
          placeholder="Nombre"
          value={nombre}
          onChange={(e) =>
            setNombre(e.target.value)
          }
          required
        />


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


        {/* ================================= */}
        {/* COMBO BOX DE PREGUNTAS */}
        {/* ================================= */}

        <select
          className="selector-pregunta"
          value={preguntarc}
          onChange={cambiarPregunta}
          required
        >

          <option value="">
            Selecciona una pregunta de recuperación
          </option>

          <option value="¿Cómo se llamaba tu primera mascota?">
            ¿Cómo se llamaba tu primera mascota?
          </option>

          <option value="¿Cuál es el nombre de tu mejor amigo?">
            ¿Cuál es el nombre de tu mejor amigo?
          </option>

          <option value="¿En qué escuela estudiaste?">
            ¿En qué escuela estudiaste?
          </option>

          <option value="¿Cuál es tu comida favorita?">
            ¿Cuál es tu comida favorita?
          </option>

          <option value="¿En qué ciudad naciste?">
            ¿En qué ciudad naciste?
          </option>

        </select>


        {/* ================================= */}
        {/* RESPUESTA */}
        {/* ================================= */}

        <input
          type="text"
          placeholder={
            preguntarc
              ? 'Respuesta de recuperación'
              : 'Primero selecciona una pregunta'
          }
          value={respuestarc}
          onChange={(e) =>
            setRespuestarc(e.target.value)
          }

          // Aquí se bloquea mientras
          // no haya pregunta seleccionada
          disabled={!preguntarc}

          required
        />


        <button
          type="submit"
          disabled={
            cargando ||
            !preguntarc ||
            !respuestarc.trim()
          }
        >

          {cargando
            ? 'Registrando...'
            : 'Registrarme'}

        </button>

      </form>


      {mensaje && (
        <p>
          {mensaje}
        </p>
      )}


      <button
        type="button"
        onClick={() =>
          cambiarPantalla('login')
        }
      >
        Volver al login
      </button>

    </div>

  );

}

export default Registro;