import React from 'react';
import ReactDOM from 'react-dom/client';
import { getOrdenPorCodigo } from './services/api';

function App() {
  React.useEffect(() => {
    getOrdenPorCodigo('ORD-2026-1').catch(() => {});
  }, []);

  return (
    <div style={{ padding: 24, fontFamily: 'Segoe UI, sans-serif' }}>
      <h1>Trazabilidad Industrial</h1>
      <p>Cliente de planta en React</p>
      <section>
        <h2>Estado inicial</h2>
        <p>La interfaz React está lista para conectar con el backend.</p>
      </section>
    </div>
  );
}

const root = document.getElementById('root');
if (root) {
  ReactDOM.createRoot(root).render(<App />);
}
