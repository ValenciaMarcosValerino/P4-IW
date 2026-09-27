import { useState } from 'react';

import Login from './pages/Login.jsx';
import Registro from './pages/Registro.jsx';
import Bienvenida from './pages/Bienvenida.jsx';

import './App.css';

function App() {
  // Pantalla que se está mostrando actualmente
  const [pantalla, setPantalla] = useState('login');

  // Aquí guardaremos los datos del usuario que inició sesión
  const [usuario, setUsuario] = useState(null);

  // =========================
  // PANTALLA DE REGISTRO
  // =========================
  if (pantalla === 'registro') {
    return (
      <Registro
        cambiarPantalla={setPantalla}
      />
    );
  }

  // =========================
  // PANTALLA DE BIENVENIDA
  // =========================
  if (pantalla === 'bienvenida') {
    return (
      <Bienvenida
        usuario={usuario}
        cambiarPantalla={setPantalla}
        setUsuario={setUsuario}
      />
    );
  }

  // =========================
  // PANTALLA DE LOGIN
  // =========================
  return (
    <Login
      cambiarPantalla={setPantalla}
      setUsuario={setUsuario}
    />
  );
}

export default App;