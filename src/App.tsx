import './App.css';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import React, { useState } from 'react';
import { Menu } from 'lucide-react';
import Marca from './components/marca'
import Proveedor from './components/proveedor'
import Movimiento from './components/movimiento'
/* import Lote from './components/lote' */
import Producto from './components/producto'
import Categoria from './components/categoria'
import Home from './components/home'; 

function App() {
  const [isOpen, setIsOpen] = useState(false);

  const toggleMenu = () => setIsOpen(!isOpen);

  return (
    <Router>
      <div className="App">
        <header className="App-header">
          <nav className="bg-white shadow-md p-4">
            <div className="max-w-7xl mx-auto flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <img src="/stockea3Logo.png" alt="Logo" className="w-8 h-8" />
              <h1 className="text-xl font-semibold text-gray-800">Stockea3</h1>
            </div>
              <button
                onClick={toggleMenu}
                className="text-gray-800 md:hidden"
                aria-label="Abrir menú"
              >
                <Menu size={28} />
              </button>

              <ul className="hidden md:flex gap-6 text-gray-700 font-medium">
              <li className="cursor-pointer hover:text-blue-600"><Link to="/">Inicio</Link></li>
                <li className="cursor-pointer hover:text-blue-600"><Link to="/marca">Marcas</Link></li>
                <li className="cursor-pointer hover:text-blue-600"><Link to="/categoria">Categorias</Link></li>
                <li className="cursor-pointer hover:text-blue-600"><Link to="/proveedor">Proveedores</Link></li>
                <li className="cursor-pointer hover:text-blue-600"><Link to="/producto">Productos</Link></li>
                <li className="cursor-pointer hover:text-blue-600"><Link to="/movimiento">Movimientos</Link></li>
                <li className="cursor-pointer hover:text-blue-600"><Link to="/lote">Lotes</Link></li>
                
              </ul>
            </div>

          </nav>
        </header>

    <Routes>
          <Route path="/" element={<Inicio />} />
          <Route path="/marca" element={<Marca />} />
          <Route path="/proveedor" element={<Proveedor />} />
          <Route path="/producto" element={<Producto />} />
          <Route path="/movimiento" element={<Movimiento />} />
          {/* <Route path="/lote" element={<Lote />} /> */}
          <Route path="/categoria" element={<Categoria />} />
        </Routes>
      </div>
    </Router>
  );
}


const Inicio = () => <Home />; 

export default App;