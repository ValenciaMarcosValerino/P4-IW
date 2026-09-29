import { useState } from 'react';

import Login from './pages/login.jsx';
import Registro from './pages/registro.jsx';
import Bienvenida from './pages/Bienvenida.jsx';
import Admin from './pages/Admin.jsx';
import EditarUsuario from './pages/EditarUsuario.jsx';

import './App.css';


function App() {

  const [pantalla, setPantalla] =
    useState('login');

  const [usuario, setUsuario] =
    useState(null);

  const [
    idUsuarioEditar,
    setIdUsuarioEditar
  ] = useState(null);


  // ========================================
  // REGISTRO
  // ========================================

  if (
    pantalla === 'registro'
  ) {

    return (
      <Registro
        cambiarPantalla={setPantalla}
      />
    );

  }


  // ========================================
  // PANEL ADMINISTRADOR / SUPERADMIN
  // ========================================

  if (
    pantalla === 'admin'
  ) {

    return (
      <Admin
        usuario={usuario}
        cambiarPantalla={setPantalla}
        setUsuario={setUsuario}
        setIdUsuarioEditar={
          setIdUsuarioEditar
        }
      />
    );

  }


  // ========================================
  // EDITAR USUARIO
  // ========================================

  if (
    pantalla === 'editarUsuario'
  ) {

    return (
      <EditarUsuario
        idUsuario={idUsuarioEditar}

        // Usuario que inició sesión
        usuarioSesion={usuario}

        cambiarPantalla={
          setPantalla
        }
      />
    );

  }


  // ========================================
  // USUARIO OPERATIVO
  // ========================================

  if (
    pantalla === 'bienvenida'
  ) {

    return (
      <Bienvenida
        usuario={usuario}
        cambiarPantalla={setPantalla}
        setUsuario={setUsuario}
      />
    );

  }


  // ========================================
  // LOGIN
  // ========================================

  return (
    <Login
      cambiarPantalla={setPantalla}
      setUsuario={setUsuario}
    />
  );

}


export default App;