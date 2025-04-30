import { Link } from "react-router-dom";
import {
  Home,
  Tag,
  LayoutGrid,
  Truck,
  Package,
  RefreshCcw,
} from "lucide-react";

const Sidebar = () => {
  return (
    <div className="w-60 h-screen bg-gray-800 shadow-lg fixed top-0 left-0 flex flex-col p-6">
      <h1 className="text-2xl font-bold text-white mb-10 flex items-center gap-2">
        <Package className="text-yellow-400" size={28} /> Stockea3
      </h1>
      <nav className="flex flex-col gap-6 text-gray-300">
        <Link to="/" className="flex items-center gap-3 hover:text-indigo-400">
          <Home size={20} /> Inicio
        </Link>
        <Link
          to="/marca"
          className="flex items-center gap-3 hover:text-indigo-400"
        >
          <Tag size={20} /> Marca
        </Link>
        <Link
          to="/categoria"
          className="flex items-center gap-3 hover:text-indigo-400"
        >
          <LayoutGrid size={20} /> Categorías
        </Link>
        <Link
          to="/proveedor"
          className="flex items-center gap-3 hover:text-indigo-400"
        >
          <Truck size={20} /> Proveedores
        </Link>
        <Link
          to="/producto"
          className="flex items-center gap-3 hover:text-indigo-400"
        >
          <Package size={20} /> Productos
        </Link>
        <Link
          to="/movimiento"
          className="flex items-center gap-3 hover:text-indigo-400"
        >
          <RefreshCcw size={20} /> Movimientos
        </Link>
      </nav>
    </div>
  );
};

export default Sidebar;
