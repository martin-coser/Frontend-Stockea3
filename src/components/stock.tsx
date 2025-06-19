import React, { useState, useEffect, ChangeEvent, FormEvent } from "react";
import axios from "axios";
import { motion } from "framer-motion";

// URL base para los endpoints relacionados con productos
const API_URL = process.env.REACT_APP_API_URL 
  ? `${process.env.REACT_APP_API_URL}`
  : 'http://localhost:4000';

const Stock: React.FC = () => {
  const [productos, setProductos] = useState([]);
  const [todosLosProductos, setTodosLosProductos] = useState([]);
  const [filtroNombre, setFiltroNombre] = useState("");
  const [filtroMarca, setFiltroMarca] = useState("");
  const [filtroCategoria, setFiltroCategoria] = useState("");
  const [filtroProveedor, setFiltroProveedor] = useState("");
  const [marcasDisponibles, setMarcasDisponibles] = useState<{ id: string; nombre: string }[]>([]);
  const [categoriasDisponibles, setCategoriasDisponibles] = useState<{ id: string; nombre: string }[]>([]);
  const [proveedoresDisponibles, setProveedoresDisponibles] = useState<{ id: string; nombre: string }[]>([]);


  // Obtiene todos los productos
  const obtenerProductos = async () => {
    try {
      const res = await axios.get(`${API_URL}/producto`);
      const productosConStock = res.data.filter((producto: any) => producto.stock > 0);
      // Filtrar productos que NO están eliminados (sin deletedAt)
      const productosFiltrados = productosConStock.filter(
        (producto: any) => !producto.deletedAt
      );
      setProductos(productosFiltrados);
      setTodosLosProductos(productosFiltrados);
      const mar = await axios.get(`${API_URL}/marca`);
      const cat = await axios.get(`${API_URL}/categoria`);
      const pro = await axios.get(`${API_URL}/proveedor`);

      setMarcasDisponibles(mar.data);
      setCategoriasDisponibles(cat.data);
      setProveedoresDisponibles(pro.data);
    } catch (error) {
      console.error("Error al obtener los productos:", error);
    }
  };

  // Filtra los productos según los filtros activos
  const filtrarProductos = (
    nombreFiltro: string,
    marcaFiltro: string,
    categoriaFiltro: string,
    proveedorFiltro: string
  ) => {
    const resultado = todosLosProductos.filter((producto: any) => {
      const coincideNombre = nombreFiltro
        ? producto.nombre.toLowerCase().includes(nombreFiltro.toLowerCase())
        : true;
      const coincideMarca = marcaFiltro
        ? producto.marca.id === parseInt(marcaFiltro)
        : true;
      const coincideCategoria = categoriaFiltro
        ? producto.categoria.id === parseInt(categoriaFiltro)
        : true;
      const coincideProveedor = proveedorFiltro
        ? producto.proveedor.id === parseInt(proveedorFiltro)
        : true;
      return coincideNombre && coincideMarca && coincideCategoria && coincideProveedor;
    });
    setProductos(resultado);
  };

    // Limpia todos los filtros
  const limpiarFiltros = () => {
    setFiltroNombre("");
    setFiltroMarca("");
    setFiltroCategoria("");
    setFiltroProveedor("");
  };

  // Efectos para la carga inicial de datos y filtrado
  useEffect(() => {
    obtenerProductos();
  }, []);

  // Actualiza los productos mostrados según los filtros
  useEffect(() => {
    filtrarProductos(filtroNombre, filtroMarca, filtroCategoria, filtroProveedor);
  }, [filtroNombre, filtroMarca, filtroCategoria, filtroProveedor, todosLosProductos]);

  //Parte visible del frontend
  return (
    <div className="flex min-h-screen bg-gray-600">
      {/* Sección de Listado de Productos */}
      <div className="flex-1 p-8 ml-60 relative flex flex-col">
        <div className="flex justify-between items-center mb-4">
          <h3 className="font-bold text-gray-200 mt-2">
            Listado de Productos
          </h3>
        </div>

        {/* Contenedor de filtros */}
        <div className="mb-4 bg-gray-500 p-4 rounded-lg shadow-md">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 items-end">
            <div>
              <label className="block text-sm font-medium text-gray-200 mb-1">Nombre</label>
              <input
                type="text"
                placeholder="Filtrar por nombre..."
                value={filtroNombre}
                onChange={(e) => setFiltroNombre(e.target.value)}
                className="w-full p-1.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-500 transition"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-200 mb-1">Marca</label>
              <select
                value={filtroMarca}
                onChange={(e) => setFiltroMarca(e.target.value)}
                className="w-full p-1.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-500 transition"
              >
                <option value="">Todas las marcas</option>
                {marcasDisponibles.map((m) => (
                  <option key={m.id} value={m.id}>
                    {m.nombre}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-200 mb-1">Categoría</label>
              <select
                value={filtroCategoria}
                onChange={(e) => setFiltroCategoria(e.target.value)}
                className="w-full p-1.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-500 transition"
              >
                <option value="">Todas las categorías</option>
                {categoriasDisponibles.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.nombre}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-200 mb-1">Proveedor</label>
              <select
                value={filtroProveedor}
                onChange={(e) => setFiltroProveedor(e.target.value)}
                className="w-full p-1.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-500 transition"
              >
                <option value="">Todos los proveedores</option>
                {proveedoresDisponibles.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.nombre}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <button
                onClick={limpiarFiltros}
                className="w-full py-1.5 px-4 bg-indigo-500 text-white rounded-lg  hover:bg-indigo-700 focus:ring-1 focus:ring-gray-500 transition"
              >
                Limpiar Filtros
              </button>
            </div>
          </div>
        </div>

        <div className="max-h-[68vh] overflow-y-auto">
          <table className="w-full border-collapse rounded-lg overflow-hidden shadow-md border border-indigo-200 bg-gray-100">
            <thead>
              <tr className="bg-indigo-100">
                <th className="border px-4 py-2 text-left text-sm font-semibold">Nombre</th>
                <th className="border px-4 py-2 text-left text-sm font-semibold">Código</th>
                <th className="border px-4 py-2 text-left text-sm font-semibold">Stock</th>
                <th className="border px-4 py-2 text-left text-sm font-semibold">Descripción</th>
                <th className="border px-4 py-2 text-left text-sm font-semibold">Marca</th>
                <th className="border px-4 py-2 text-left text-sm font-semibold">Categoría</th>
                <th className="border px-4 py-2 text-left text-sm font-semibold">Proveedor</th>
              </tr>
            </thead>
            <tbody>
              {productos.map((producto: any) => (
                <tr
                  key={producto.id}
                  className="hover:bg-gray-200"
                >
                  <td className="border px-4 py-2 text-sm">{producto.nombre}</td>
                  <td className="border px-4 py-2 text-sm">{producto.codigo}</td>
                  <td className="border px-4 py-2 text-sm">{producto.stock}</td>
                  <td className="border px-4 py-2 text-sm">{producto.descripcion}</td>
                  <td className="border px-4 py-2 text-sm">{producto.marca.nombre}</td>
                  <td className="border px-4 py-2 text-sm">{producto.categoria.nombre}</td>
                  <td className="border px-4 py-2 text-sm">{producto.proveedor.nombre}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

      </div>
    </div>
  );
};

export default Stock;