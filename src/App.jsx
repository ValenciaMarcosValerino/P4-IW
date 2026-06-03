import { useState } from 'react';
import TarjetaUsuario from './components/TarjetaUsuario.jsx';
import './App.css'
 
 
const avataresUsuarios = [
  { id: 1, nombre: 'Ana López', avatar: 'https://ui-avatars.com/api/?name=Ana+López&size=128&background=ff6b6b&color=fff', rol: 'Desarrolladora' },
  { id: 2, nombre: 'Carlos Ruiz', avatar: 'https://ui-avatars.com/api/?name=Carlos+Ruiz&size=128&background=4ecdc4&color=fff', rol: 'Diseñador' },
  { id: 3, nombre: 'María Gómez', avatar: 'https://ui-avatars.com/api/?name=María+Gómez&size=128&background=45b7d1&color=fff', rol: 'Product Owner' },
  { id: 4, nombre: 'Juan Pérez', avatar: 'https://ui-avatars.com/api/?name=Juan+Pérez&size=128&background=f9ca24&color=333', rol: 'DevOps' },
  { id: 5, nombre: 'Lucía Torres', avatar: 'https://ui-avatars.com/api/?name=Lucía+Torres&size=128&background=6c5ce7&color=fff', rol: 'QA Tester' },
  { id: 6, nombre: 'Diego Silva', avatar: 'https://ui-avatars.com/api/?name=Diego+Silva&size=128&background=48dbfb&color=fff', rol: 'Frontend' },
  { id: 7, nombre: 'Sofía Ramos', avatar: 'https://ui-avatars.com/api/?name=Sofía+Ramos&size=128&background=ff9ff3&color=fff', rol: 'Backend' },
  { id: 8, nombre: 'Miguel Castro', avatar: 'https://ui-avatars.com/api/?name=Miguel+Castro&size=128&background=54a0ff&color=fff', rol: 'Scrum Master' },
  { id: 9, nombre: 'Elena Vega', avatar: 'https://ui-avatars.com/api/?name=Elena+Vega&size=128&background=5f27cd&color=fff', rol: 'UX Writer' },
  { id: 10, nombre: 'Raúl Mendoza', avatar: 'https://ui-avatars.com/api/?name=Raúl+Mendoza&size=128&background=00d2d3&color=fff', rol: 'Data Analyst' }
];
 
 
 
function App() {
  const [seleccionada, setSeleccionada] = useState(null);
 
  return (
    <div style={{ padding: '2rem' }}>
      <h1>Mosaico de tarjetas de usuarios</h1>
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
          gap: '1.5rem',
          maxWidth: '1200px',
          margin: '0 auto'
        }}
      >
        {avataresUsuarios.map((tarjeta) => (
          <TarjetaUsuario
            key={tarjeta.id}
            {...tarjeta}
            onClick={() => setSeleccionada(tarjeta.nombre)}
          />
        ))}
      </div>
      {seleccionada && <p>Seleccionada: {seleccionada}</p>}
    </div>
  );
}
 
export default App;