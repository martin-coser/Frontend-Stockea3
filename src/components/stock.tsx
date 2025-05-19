import React, { useState, useEffect, ChangeEvent, FormEvent } from "react";
import axios from "axios";
import { motion } from "framer-motion";

// URL base para los endpoints relacionados con productos
const API_URL = "http://localhost:4000/producto";

const Stock: React.FC = () => {
  const [productos, setProductos] = useState([]);
  const [todosLosProductos, setTodosLosProductos] = useState([]);
  const [filtroNombre, setFiltroNombre] = useState("");


  // Obtiene todos los productos
  const obtenerProductos = async () => {
    try {
      const res = await axios.get(API_URL);
      const productosConStock = res.data.filter((producto: any) => producto.stock > 0);
      setProductos(productosConStock);
      setTodosLosProductos(productosConStock);
    } catch (error) {
      console.error("Error al obtener los productos:", error);
    }
  };

  // Filtra los productos según el texto de búsqueda
  const filtrarProductos = (nombreFiltro: string) => {
    const resultado = todosLosProductos.filter((producto: any) =>
      producto.nombre.toLowerCase().includes(nombreFiltro.toLowerCase())
    );
    setProductos(resultado);
  };

  // Efectos para la carga inicial de datos y filtrado
  useEffect(() => {
    obtenerProductos();
  }, []);

  // Actualiza los productos mostrados según el filtro de búsqueda
  useEffect(() => {
    if (filtroNombre.trim() === "") {
      setProductos(todosLosProductos);
    } else {
      filtrarProductos(filtroNombre);
    }
  }, [filtroNombre, todosLosProductos]);

  return (
    <motion.div
      className="flex min-h-screen bg-gray-600"
      layout
    >
      {/* Sección de Listado de Productos */}
      <motion.div
        className="flex-1 p-8 ml-60"
        layout
        transition={{ duration: 0.2 }}
      >
        <div className="flex justify-between items-center mb-4">
          <h3 className="font-bold text-gray-200 mt-2">
            Listado de Productos
          </h3>
        </div>

        <div className="mb-4">
          <input
            type="text"
            placeholder="Filtrar por nombre..."
            value={filtroNombre}
            onChange={(e) => setFiltroNombre(e.target.value)}
            className="w-1/2 p-1.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-500 transition"
          />
        </div>

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
      </motion.div>
    </motion.div>
  );
};

export default Stock;