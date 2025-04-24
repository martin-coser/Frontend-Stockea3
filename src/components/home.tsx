import React from 'react';
import { Link } from 'react-router-dom';
import { Boxes, Package, Truck, Layers, Tags, ArrowRightLeft } from 'lucide-react';

const Home = () => {
  return (
    <div className="bg-gradient-to-br from-green-100 to-white min-h-screen flex flex-col items-center justify-center px-4 py-12">
      <h1 className="text-4xl md:text-5xl font-extrabold text-green-700 mb-6 text-center">
        ¡Bienvenido a Stockea3!
      </h1>
      <p className="text-lg text-gray-700 mb-12 max-w-xl text-center">
        Gestioná tus productos, proveedores, marcas y movimientos de stock de forma rápida y sencilla.
      </p>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-8 w-full max-w-5xl">
        <HomeCard icon={<Tags className="text-green-600" />} title="Categorías" link="/categoria" />
        <HomeCard icon={<Boxes className="text-green-600" />} title="Marcas" link="/marca" />
        <HomeCard icon={<Package className="text-green-600" />} title="Productos" link="/producto" />
        <HomeCard icon={<Truck className="text-green-600" />} title="Proveedores" link="/proveedor" />
        <HomeCard icon={<Layers className="text-green-600" />} title="Lotes" link="/lote" />
        <HomeCard icon={<ArrowRightLeft className="text-green-600" />} title="Movimientos" link="/movimiento" />
      </div>
    </div>
  );
};

const HomeCard = ({ icon, title, link }: { icon: React.ReactNode; title: string; link: string }) => (
  <Link
    to={link}
    className="bg-white shadow-md rounded-xl p-6 flex flex-col items-center justify-center hover:shadow-xl transition-shadow hover:scale-105"
  >
    <div className="mb-4">{icon}</div>
    <h2 className="text-xl font-semibold text-gray-800">{title}</h2>
  </Link>
);

export default Home;
