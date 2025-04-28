import React, { useState, useEffect, ChangeEvent, FormEvent } from "react";
import axios from "axios";
import { PencilSquareIcon } from "@heroicons/react/24/outline";
import { TrashIcon } from "@heroicons/react/24/outline";
import { motion } from 'framer-motion';

const API_URL = "http://localhost:4000/categoria";

const Categoria: React.FC = () => {
  const [nombre, setNombre] = useState("");
  const [descripcion, setDescripcion] = useState("");
  const [imagen, setImagen] = useState("");
  const [mensaje, setMensaje] = useState("");
  const [categorias, setCategorias] = useState([]);
  const [todasLasCategorias, setTodasLasCategorias] = useState([]); // Nuevo estado
  const [filtroNombre, setFiltroNombre] = useState("");
  const [mostrarFormulario, setMostrarFormulario] = useState(false); // Estado para controlar el formulario

  // Traer todas las categorías
  const obtenerCategorias = async () => {
    try {
      const res = await axios.get(API_URL);
      setCategorias(res.data);
      setTodasLasCategorias(res.data); // Guardamos todas
    } catch (error) {
      console.error("Error al obtener las categorías:", error);
    }
  };

  // Filtrar categorías por nombre
  const filtrarCategorias = (nombreFiltro: string) => {
    const resultado = todasLasCategorias.filter((categoria: any) =>
      categoria.nombre.toLowerCase().includes(nombreFiltro.toLowerCase())
    );
    setCategorias(resultado);
  };

  useEffect(() => {
    if (filtroNombre.trim() === "") {
      setCategorias(todasLasCategorias); // Mostrar todas si no hay filtro
    } else {
      filtrarCategorias(filtroNombre);
    }
  }, [filtroNombre, todasLasCategorias]);

  useEffect(() => {
    obtenerCategorias();
  }, []);

  // Registrar nueva categoría
  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    try {
      await axios.post(API_URL, { nombre, descripcion, imagen });
      setMensaje("Categoría registrada con éxito.");
      setNombre("");
      setDescripcion("");
      setImagen("");
      obtenerCategorias();
      setMostrarFormulario(false); // Ocultar formulario después de registrar
    } catch (error) {
      console.error("Error al registrar la categoría:", error);
      setMensaje("Error al registrar la categoría.");
    }
  };

  return (
    <motion.div className="flex min-h-screen bg-gray-600" layout>
      {/* Listado de categorías (ahora a la izquierda) */}
      <motion.div className="p-8 ml-60 flex-1" layout transition={{ duration: 0.1 }}>
        <div className="flex justify-between items-center mb-4">
          <h3 className="font-bold mt-2 text-gray-200">Listado de Categorías</h3>
          <button
            onClick={() => setMostrarFormulario(true)}
            className="w-1/8 py-2 px-4 bg-indigo-500 text-white rounded-lg border border-indigo-500 hover:bg-indigo-600 focus:ring-1 focus:ring-indigo-300 transition"
          >
            Nueva Categoría
          </button>
        </div>

        <div className="mb-4">
          <input
            type="text"
            placeholder="Filtrar por nombre..."
            value={filtroNombre}
            onChange={(e) => setFiltroNombre(e.target.value)}
            className="w-1/2 p-1.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 transition"
          />
        </div>

        <table className="w-full border-collapse rounded-lg overflow-hidden shadow-md border border-indigo-200 bg-gray-100">
          <thead>
            <tr className="bg-indigo-100">
              <th className="border px-4 py-2 text-left text-sm font-semibold">Nombre</th>
              <th className="border px-4 py-2 text-left text-sm font-semibold">Descripción</th>
              <th className="border px-4 py-2 text-left text-sm font-semibold">Imagen</th>
              <th className="border px-4 py-2 text-center text-sm font-semibold">Modificar</th>
              <th className="border px-4 py-2 text-center text-sm font-semibold">Eliminar</th>
            </tr>
          </thead>

          <tbody>
            {categorias.map((categoria: any) => (
              <tr key={categoria.id} className="hover:bg-green-50">
                <td className="border px-4 py-2 text-sm">{categoria.nombre}</td>
                <td className="border px-4 py-2 text-sm">{categoria.descripcion}</td>
                <td className="border px-4 py-2 text-sm">{categoria.imagen}</td>
                <td className="border px-4 py-2 text-blue-600 text-center cursor-pointer hover:text-green-700">
                  <PencilSquareIcon className="h-5 w-5 mx-auto" />
                </td>
                <td className="border px-4 py-2 text-red-600 text-center cursor-pointer hover:text-red-700">
                  <TrashIcon className="h-5 w-5 mx-auto" />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </motion.div>

      {/* Formulario para nueva categoría (a la derecha) */}
      {mostrarFormulario && (
        <motion.div
          initial={{ opacity: 0, x: 100 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: 100 }}
          transition={{ duration: 0.1 }}
          className="w-1/4 p-10"
          layout
        >
          <h2 className="font-bold mb-4 text-center text-gray-200">Nueva Categoría</h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <input
              type="text"
              placeholder="Nombre"
              value={nombre}
              onChange={(e: ChangeEvent<HTMLInputElement>) => setNombre(e.target.value)}
              className="w-full p-1.5 border border-gray-300 rounded"
            />
            <input
              type="text"
              placeholder="Descripción"
              value={descripcion}
              onChange={(e: ChangeEvent<HTMLInputElement>) => setDescripcion(e.target.value)}
              className="w-full p-1.5 border border-gray-300 rounded"
            />
            <input
              type="text"
              placeholder="Imagen"
              value={imagen}
              onChange={(e: ChangeEvent<HTMLInputElement>) => setImagen(e.target.value)}
              className="w-full p-1.5 border border-gray-300 rounded"
            />
            <button
              type="submit"
              className="w-full py-2 px-4 bg-indigo-500 text-white rounded-lg border border-indigo-500 hover:bg-indigo-600 focus:ring-1 focus:ring-indigo-300 transition"
            >
              Registrar
            </button>

            {mensaje && <p className="text-green-600">{mensaje}</p>}
          </form>
        </motion.div>
      )}
    </motion.div>
  );
};

export default Categoria;
