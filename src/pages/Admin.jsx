import { useEffect, useState } from 'react';

import {
  obtenerUsuarios,
  cambiarEstadoUsuario,
  cerrarSesion
} from '../services/api.js';


function Admin({
  usuario,
  cambiarPantalla,
  setUsuario,
  setIdUsuarioEditar
}) {

  const [usuarios, setUsuarios] =
    useState([]);

  const [mensaje, setMensaje] =
    useState('');


  // ========================================
  // SABER SI EL USUARIO ACTUAL
  // ES SUPERADMIN
  // ========================================

  const usuarioEsSuperadmin =
    usuario?.es_superadmin === true ||
    usuario?.es_superadmin === 1;


  // ========================================
  // CARGAR USUARIOS
  // ========================================

  const cargarUsuarios = async () => {

    const resultado =
      await obtenerUsuarios();


    if (resultado.ok) {

      setUsuarios(
        resultado.datos
      );

    } else {

      setMensaje(
        resultado.datos?.mensaje ||
        resultado.mensaje ||
        'No se pudieron obtener los usuarios'
      );

    }

  };


  // ========================================
  // CARGAR USUARIOS AL ENTRAR
  // ========================================

  useEffect(() => {

    cargarUsuarios();

  }, []);


  // ========================================
  // PERMISO PARA EDITAR
  // ========================================

  const puedeEditar = (item) => {

    // Superadmin puede editar
    // administradores y operativos
    if (usuarioEsSuperadmin) {
      return true;
    }


    // Administrador normal puede
    // modificar su propia cuenta
    if (item.id === usuario?.id) {
      return true;
    }


    // Administrador normal puede
    // modificar operativos
    if (item.rol === 'operativo') {
      return true;
    }


    // No puede modificar
    // otros administradores
    return false;

  };


  // ========================================
  // PERMISO PARA CAMBIAR ESTADO
  // ========================================

  const puedeCambiarEstado = (item) => {

    // Por seguridad, si llegara
    // un superadmin al listado,
    // no permitimos desactivarlo.
    if (
      item.es_superadmin === true ||
      item.es_superadmin === 1
    ) {
      return false;
    }


    // Superadmin puede activar/desactivar
    // administradores y operativos.
    if (usuarioEsSuperadmin) {
      return true;
    }


    // Administrador normal solamente
    // puede activar/desactivar operativos.
    if (item.rol === 'operativo') {
      return true;
    }


    return false;

  };


  // ========================================
  // EDITAR USUARIO
  // ========================================

  const editarUsuario = (id) => {

    // Guardamos el ID REAL de SQL Server.
    setIdUsuarioEditar(id);


    cambiarPantalla(
      'editarUsuario'
    );

  };


  // ========================================
  // ACTIVAR / DESACTIVAR USUARIO
  // ========================================

  const cambiarEstado = async (
    id,
    estadoActual
  ) => {

    const nuevoEstado =
      !estadoActual;


    const accion =
      nuevoEstado
        ? 'activar'
        : 'desactivar';


    const confirmar =
      window.confirm(
        `¿Deseas ${accion} este usuario?`
      );


    if (!confirmar) {
      return;
    }


    const resultado =
      await cambiarEstadoUsuario(
        id,
        nuevoEstado
      );


    if (resultado.ok) {

      setMensaje(
        resultado.mensaje
      );


      // Actualizamos el listado
      await cargarUsuarios();

    } else {

      setMensaje(
        resultado.mensaje ||
        'No se pudo cambiar el estado del usuario'
      );

    }

  };


  // ========================================
  // CERRAR SESIÓN
  // ========================================

  const salir = () => {

    cerrarSesion();

    setUsuario(null);

    cambiarPantalla(
      'login'
    );

  };


  // ========================================
  // OBTENER NIVEL PARA MOSTRAR
  // ========================================

  const obtenerNivel = (item) => {

    if (
      item.es_superadmin === true ||
      item.es_superadmin === 1
    ) {

      return 'Superadministrador';

    }


    if (
      item.rol === 'administrador'
    ) {

      return 'Administrador';

    }


    return 'Operativo';

  };


  // ========================================
  // INTERFAZ
  // ========================================

  return (

    <div className="contenedor-admin">


      {/* ================================= */}
      {/* TÍTULO DINÁMICO */}
      {/* ================================= */}

      <h1>

        {usuarioEsSuperadmin
          ? 'Panel de superadministrador'
          : 'Panel de administrador'}

      </h1>


      <h2>
        Bienvenido {usuario?.nombre}
      </h2>


      <p>

        Nivel:{' '}

        {usuarioEsSuperadmin
          ? 'Superadministrador'
          : 'Administrador'}

      </p>


      <button
        onClick={salir}
      >
        Cerrar sesión
      </button>


      <hr />


      {/* ================================= */}
      {/* TÍTULO DE LA GESTIÓN */}
      {/* ================================= */}

      <h2>

        {usuarioEsSuperadmin
          ? 'Gestión general de usuarios'
          : 'Usuarios registrados'}

      </h2>


      {mensaje && (
        <p>
          {mensaje}
        </p>
      )}


      <table>

        <thead>

          <tr>

            <th>
              IDENTIFICACIÓN
            </th>

            <th>
              Nombre
            </th>

            <th>
              Correo
            </th>

            <th>
              Nivel
            </th>

            <th>
              Estado
            </th>

            <th>
              Acciones
            </th>

          </tr>

        </thead>


        <tbody>

          {usuarios.map(
            (item, index) => {

              const editarPermitido =
                puedeEditar(item);


              const estadoPermitido =
                puedeCambiarEstado(item);


              return (

                <tr key={item.id}>


                  {/* ====================== */}
                  {/* NUMERACIÓN VISUAL */}
                  {/* NO ES EL ID DE SQL */}
                  {/* ====================== */}

                  <td>
                    {index + 1}
                  </td>


                  <td>
                    {item.nombre}
                  </td>


                  <td>
                    {item.correo}
                  </td>


                  <td>
                    {obtenerNivel(item)}
                  </td>


                  <td>

                    {item.activo
                      ? 'Activo'
                      : 'Desactivado'}

                  </td>


                  <td>


                    {/* ====================== */}
                    {/* EDITAR */}
                    {/* ====================== */}

                    <button
                      disabled={
                        !editarPermitido
                      }
                      onClick={() =>
                        editarUsuario(
                          item.id
                        )
                      }
                    >
                      Editar
                    </button>


                    {' '}


                    {/* ====================== */}
                    {/* ACTIVAR / DESACTIVAR */}
                    {/* ====================== */}

                    <button
                      disabled={
                        !estadoPermitido
                      }
                      onClick={() =>
                        cambiarEstado(
                          item.id,
                          item.activo
                        )
                      }
                    >

                      {item.activo
                        ? 'Desactivar'
                        : 'Activar'}

                    </button>


                  </td>

                </tr>

              );

            }
          )}

        </tbody>

      </table>

    </div>

  );

}


export default Admin;