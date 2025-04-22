import React from 'react';
import './App.css';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import RegistrarMarca from './components/registrar-marca'; 

function App() {
  return (
    <Router>
      <div className="App">
        <header className="App-header">
          <nav>
            <ul>
              <li>
                <Link to="/">Inicio</Link>
              </li>
              <li>
                <Link to="/Marcas/nuevaMarca">Registrar Marcasaaa</Link>
              </li>
            </ul>
          </nav>
          
        </header>
        <Routes>
          <Route path="/" element={<Inicio />} /> {}
          <Route path="/Marcas/nuevaMarca" element={<RegistrarMarca/>} />
        </Routes>
      </div>
      <div className="h-screen bg-gray-100 flex justify-center items-center">
      <h1 className="text-4xl text-red-500 font-bold">¡Hola Tailwind!</h1>
      </div>
    </Router>
  );
}

const Inicio = () => (
  <p>Hola</p>
);

export default App;