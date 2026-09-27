import { cerrarSesion } from '../services/api.js';

function Bienvenida({ usuario, cambiarPantalla, setUsuario }) {
  const salir = async () => {
    await cerrarSesion();
    setUsuario(null);
    cambiarPantalla('login');
  };

  return (
    <div className="contenedor-formulario">
      <h1>Bienvenido</h1>

      <p>Usuario: {usuario?.nombre}</p>
      <p>Correo: {usuario?.correo}</p>

      <button onClick={salir}>Cerrar sesión</button>
    </div>
  );
}

export default Bienvenida;