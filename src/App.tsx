import React from 'react';
import './App.css';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';

import Sidebar from './components/sidebar';
import Home from './components/home';
import Marca from './components/marca';
import Categoria from './components/categoria';
import Proveedor from './components/proveedor';
import Producto from './components/producto';
import Movimiento from './components/movimiento';
import Stock from './components/stock';

function App() {
  return (
    <Router>
      <div className="flex min-h-screen">
        {/* Menú lateral fijo */}
        <Sidebar />

        {/* Contenido según la ruta */}
        <div className="flex-1 p-0 bg-stone-100 overflow-auto">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/marca" element={<Marca />} />
            <Route path="/categoria" element={<Categoria />} />
            <Route path="/proveedor" element={<Proveedor />} />
            <Route path="/producto" element={<Producto />} />
            <Route path="/movimiento" element={<Movimiento />} />
            <Route path="/stock" element={<Stock />} />
          </Routes>
        </div>
      </div>
    </Router>
  );
}

export default App;
