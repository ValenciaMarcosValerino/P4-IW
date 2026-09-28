import { useEffect, useState } from 'react';

import {
  obtenerUsuarioPorId,
  modificarUsuario
} from '../services/api.js';


// ========================================
// PREGUNTAS DE RECUPERACIÓN DISPONIBLES
// ========================================

const preguntasRecuperacion = [
  '¿Cómo se llamaba tu primera mascota?',
  '¿Cuál es el nombre de tu mejor amigo?',
  '¿En qué escuela estudiaste?',
  '¿Cuál es tu comida favorita?',
  '¿En qué ciudad naciste?'
];


function EditarUsuario({
  idUsuario,
  usuarioSesion,
  cambiarPantalla
}) {

  // ========================================
  // DATOS DEL USUARIO
  // ========================================

  const [nombre, setNombre] =
    useState('');

  const [correo, setCorreo] =
    useState('');

  const [preguntarc, setPreguntarc] =
    useState('');

  const [
    preguntaOriginal,
    setPreguntaOriginal
  ] = useState('');

  const [rol, setRol] =
    useState('operativo');


  // ========================================
  // CAMPOS OPCIONALES
  // ========================================

  const [
    contrasena,
    setContrasena
  ] = useState('');

  const [
    respuestarc,
    setRespuestarc
  ] = useState('');


  const [
    mensaje,
    setMensaje
  ] = useState('');

  const [
    cargando,
    setCargando
  ] = useState(true);


  // ========================================
  // SABER SI LA SESIÓN ES SUPERADMIN
  // ========================================

  const esSuperadmin =
    usuarioSesion?.es_superadmin === true ||
    usuarioSesion?.es_superadmin === 1;


  // ========================================
  // SABER SI LA PREGUNTA FUE CAMBIADA
  // ========================================

  const preguntaFueCambiada =
    preguntarc !== preguntaOriginal;


  // ========================================
  // SABER SI LA PREGUNTA ACTUAL ES ANTIGUA
  // Y NO FORMA PARTE DEL NUEVO CATÁLOGO
  // ========================================

  const preguntaEsAnterior =
    preguntaOriginal &&
    !preguntasRecuperacion.includes(
      preguntaOriginal
    );


  // ========================================
  // CARGAR USUARIO
  // ========================================

  const cargarUsuario = async () => {

    setCargando(true);

    const resultado =
      await obtenerUsuarioPorId(
        idUsuario
      );


    if (resultado.ok) {

      const usuario =
        resultado.datos;


      setNombre(
        usuario.nombre || ''
      );


      setCorreo(
        usuario.correo || ''
      );


      setPreguntarc(
        usuario.preguntarc || ''
      );


      setPreguntaOriginal(
        usuario.preguntarc || ''
      );


      setRol(
        usuario.rol || 'operativo'
      );


    } else {

      setMensaje(
        resultado.datos?.mensaje ||
        resultado.mensaje ||
        'No se pudo obtener el usuario'
      );

    }


    setCargando(false);

  };


  // ========================================
  // CARGAR AL ENTRAR
  // ========================================

  useEffect(() => {

    if (idUsuario) {

      cargarUsuario();

    }

  }, [idUsuario]);


  // ========================================
  // CAMBIAR PREGUNTA
  // ========================================

  const cambiarPregunta = (e) => {

    const nuevaPregunta =
      e.target.value;


    setPreguntarc(
      nuevaPregunta
    );


    // Limpiamos la respuesta porque
    // corresponde a otra pregunta.
    setRespuestarc('');

  };


  // ========================================
  // GUARDAR CAMBIOS
  // ========================================

  const guardarCambios = async (e) => {

    e.preventDefault();

    setMensaje('');


    // ========================================
    // VALIDAR PREGUNTA
    // ========================================

    if (!preguntarc) {

      setMensaje(
        'Selecciona una pregunta de recuperación'
      );

      return;

    }


    // ========================================
    // SI CAMBIÓ LA PREGUNTA,
    // DEBE CAMBIAR TAMBIÉN LA RESPUESTA
    // ========================================

    if (
      preguntaFueCambiada &&
      !respuestarc.trim()
    ) {

      setMensaje(
        'Al cambiar la pregunta debes escribir una nueva respuesta'
      );

      return;

    }


    // ========================================
    // DATOS A MODIFICAR
    // ========================================

    const usuarioModificado = {

      nombre:
        nombre.trim(),

      correo:
        correo.trim(),

      preguntarc,

      contrasena,

      respuestarc:
        respuestarc.trim()

    };


    // ========================================
    // SOLO SUPERADMIN ENVÍA EL ROL
    // ========================================

    if (esSuperadmin) {

      usuarioModificado.rol =
        rol;

    }


    const resultado =
      await modificarUsuario(
        idUsuario,
        usuarioModificado
      );


    // ========================================
    // MODIFICACIÓN CORRECTA
    // ========================================

    if (resultado.ok) {

      setMensaje(
        'Usuario actualizado correctamente'
      );


      // La pregunta guardada pasa
      // a ser la nueva pregunta original.
      setPreguntaOriginal(
        preguntarc
      );


      // Limpiamos campos sensibles.
      setContrasena('');
      setRespuestarc('');

      return;

    }


    // ========================================
    // ERROR
    // ========================================

    setMensaje(
      resultado.mensaje ||
      'No se pudo actualizar el usuario'
    );

  };


  // ========================================
  // VOLVER AL PANEL
  // ========================================

  const volver = () => {

    cambiarPantalla(
      'admin'
    );

  };


  // ========================================
  // CARGANDO
  // ========================================

  if (cargando) {

    return (

      <div>

        <h2>
          Cargando usuario...
        </h2>

      </div>

    );

  }


  // ========================================
  // INTERFAZ
  // ========================================

  return (

    <div className="contenedor-formulario">

      <h1>
        Editar usuario
      </h1>


      <p>

        Sesión:{' '}

        {esSuperadmin
          ? 'Superadministrador'
          : 'Administrador'}

      </p>


      <form
        onSubmit={guardarCambios}
      >


        {/* ================================= */}
        {/* NOMBRE */}
        {/* ================================= */}

        <label>
          Nombre
        </label>

        <input
          type="text"
          value={nombre}
          onChange={(e) =>
            setNombre(
              e.target.value
            )
          }
          required
        />


        {/* ================================= */}
        {/* CORREO */}
        {/* ================================= */}

        <label>
          Correo
        </label>

        <input
          type="email"
          value={correo}
          onChange={(e) =>
            setCorreo(
              e.target.value
            )
          }
          required
        />


        {/* ================================= */}
        {/* PREGUNTA DE RECUPERACIÓN */}
        {/* ================================= */}

        <label>
          Pregunta de recuperación
        </label>

        <select
          value={preguntarc}
          onChange={cambiarPregunta}
          required
        >

          <option value="">
            Selecciona una pregunta
          </option>


          {/* ================================= */}
          {/* COMPATIBILIDAD CON DATOS ANTIGUOS */}
          {/* ================================= */}

          {preguntaEsAnterior && (

            <option
              value={preguntaOriginal}
            >
              {preguntaOriginal}
            </option>

          )}


          <option
            value="¿Cómo se llamaba tu primera mascota?"
          >
            ¿Cómo se llamaba tu primera mascota?
          </option>


          <option
            value="¿Cuál es el nombre de tu mejor amigo?"
          >
            ¿Cuál es el nombre de tu mejor amigo?
          </option>


          <option
            value="¿En qué escuela estudiaste?"
          >
            ¿En qué escuela estudiaste?
          </option>


          <option
            value="¿Cuál es tu comida favorita?"
          >
            ¿Cuál es tu comida favorita?
          </option>


          <option
            value="¿En qué ciudad naciste?"
          >
            ¿En qué ciudad naciste?
          </option>

        </select>


        {/* ================================= */}
        {/* RESPUESTA */}
        {/* ================================= */}

        <label>
          Nueva respuesta de recuperación
        </label>

        <input
          type="text"
          value={respuestarc}
          onChange={(e) =>
            setRespuestarc(
              e.target.value
            )
          }
          placeholder={
            preguntaFueCambiada
              ? 'Escribe la respuesta para la nueva pregunta'
              : 'Dejar vacío para conservar la respuesta actual'
          }
        />


        {/* ================================= */}
        {/* CONTRASEÑA */}
        {/* ================================= */}

        <label>
          Nueva contraseña
        </label>

        <input
          type="password"
          value={contrasena}
          onChange={(e) =>
            setContrasena(
              e.target.value
            )
          }
          placeholder="Dejar vacío para conservar la actual"
        />


        {/* ================================= */}
        {/* ROL */}
        {/* SOLO SUPERADMIN PUEDE CAMBIARLO */}
        {/* ================================= */}

        {esSuperadmin ? (

          <>

            <label>
              Rol
            </label>

            <select
              value={rol}
              onChange={(e) =>
                setRol(
                  e.target.value
                )
              }
            >

              <option value="operativo">
                Operativo
              </option>

              <option value="administrador">
                Administrador
              </option>

            </select>

          </>

        ) : (

          <>

            <label>
              Nivel actual
            </label>

            <input
              type="text"
              value={
                rol === 'administrador'
                  ? 'Administrador'
                  : 'Operativo'
              }
              disabled
            />

          </>

        )}


        <br />
        <br />


        {/* ================================= */}
        {/* GUARDAR */}
        {/* ================================= */}

        <button
          type="submit"
        >
          Guardar cambios
        </button>

      </form>


      {/* ================================= */}
      {/* MENSAJE */}
      {/* ================================= */}

      {mensaje && (

        <p>
          {mensaje}
        </p>

      )}


      {/* ================================= */}
      {/* VOLVER */}
      {/* ================================= */}

      <button
        type="button"
        onClick={volver}
      >
        Volver al panel
      </button>

    </div>

  );

}


export default EditarUsuario;