import React from 'react';
import { Link } from 'react-router-dom';
import { Boxes, Package, Truck, Tags, ArrowRightLeft } from 'lucide-react';


const Home = () => {
  return (
    <div className="bg-gray-900 min-h-screen flex flex-col items-center justify-center px-4 py-12">
      <div className="flex flex-row items-center justify-start w-full max-w-7xl ml-44 md:ml-64">
    <div className="text-white max-w-lg">
      <h1 className="text-5xl md:text-7xl font-extrabold mb-0">
        ¡Bienvenido a <span className="text-indigo-400">Stockea3</span>!
      </h1>
      <p className="text-xl text-gray-300 mb-8">
        Gestioná tus productos, proveedores, marcas y movimientos de stock de forma rápida y sencilla.
      </p>
    </div>

    <img 
      src="/camion.png" 
      alt="Camión de Bienvenida" 
      className="w-[30rem] h-auto object-contain drop-shadow-2xl" 
    />
  </div>
</div>
  );
};


export default Home;
