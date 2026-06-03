function TarjetaUsuario({ nombre, avatar, rol, onClick }) {
  return (
    <div onClick={onClick} style={{ /* mismo estilo de tarjeta anterior */ }}>
      <div style={{
        width: '100%', height: '200px',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
      }}>
        <img src={avatar} alt={nombre} style={{
          width: '80px', height: '80px',
          borderRadius: '50%', border: '4px solid white',
          boxShadow: '0 4px 12px rgba(0,0,0,0.3)'
        }} />
      </div>
      <div style={{ padding: '1rem' }}>
        <h3 style={{ margin: '0 0 0.25rem', fontSize: '1.1rem' }}>{nombre}</h3>
        <p style={{ margin: 0, color: '#666', fontSize: '0.9rem' }}>{rol}</p>
      </div>
    </div>
  );
}
 
export default TarjetaUsuario;