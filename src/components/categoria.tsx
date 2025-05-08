import React, { useState, useEffect, ChangeEvent, FormEvent } from "react";
import axios from "axios";
import { PencilSquareIcon, TrashIcon } from "@heroicons/react/24/outline";
import { motion } from "framer-motion";

// URL base para los endpoints relacionados con categorías
const API_URL = "http://localhost:4000/categoria";

const Categoria: React.FC = () => {
  // Estados para gestionar los inputs del formulario, lista de categorías y estados de la UI
  const [nombre, setNombre] = useState("");
  const [descripcion, setDescripcion] = useState("");
  const [imagen, setImagen] = useState("");
  const [mensaje, setMensaje] = useState("");
  const [categorias, setCategorias] = useState([]);
  const [todasLasCategorias, setTodasLasCategorias] = useState([]);
  const [filtroNombre, setFiltroNombre] = useState("");
  const [mostrarFormulario, setMostrarFormulario] = useState(false);
  const [modoEdicion, setModoEdicion] = useState(false);
  const [idCategoriaEditar, setIdCategoriaEditar] = useState<number | null>(null);

  // Obtiene todas las categorías desde la API y actualiza el estado
  const obtenerCategorias = async () => {
    try {
      const res = await axios.get(API_URL);
      setCategorias(res.data);
      setTodasLasCategorias(res.data);
    } catch (error) {
      console.error("Error al obtener las categorías:", error);
    }
  };

  // Filtra las categorías según el texto de búsqueda
  const filtrarCategorias = (nombreFiltro: string) => {
    const resultado = todasLasCategorias.filter((categoria: any) =>
      categoria.nombre.toLowerCase().includes(nombreFiltro.toLowerCase())
    );
    setCategorias(resultado);
  };

  // Maneja el envío del formulario para crear o actualizar una categoría
  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    try {
      if (modoEdicion && idCategoriaEditar !== null) {
        await axios.patch(`${API_URL}/${idCategoriaEditar}`, {
          id: idCategoriaEditar,
          nombre,
          descripcion,
          imagen,
        });
        setMensaje("Categoría actualizada con éxito.");
      } else {
        await axios.post(API_URL, { nombre, descripcion, imagen });
        setMensaje("Categoría registrada con éxito.");
      }

      setNombre("");
      setDescripcion("");
      setImagen("");
      setModoEdicion(false);
      setIdCategoriaEditar(null);
      setMostrarFormulario(false);
      obtenerCategorias();
    } catch (error) {
      console.error("Error al registrar/actualizar la categoría:", error);
      setMensaje("Error al registrar/actualizar la categoría.");
    }
  };

  // Elimina una categoría tras confirmación del usuario
  const handleEliminarCategoria = async (id: number) => {
    const confirmacion = window.confirm("¿Estás seguro que querés eliminar esta categoría?");
    if (!confirmacion) return;

    try {
      await axios.delete(`${API_URL}/softDelete/${id}`);
      alert("Categoría eliminada correctamente");
      obtenerCategorias();
    } catch (error) {
      console.error("Error:", error);
      alert("Error al eliminar la categoría");
    }
  };

  // Prepara el formulario para editar una categoría existente
  const handleEditarCategoria = (categoria: any) => {
    setNombre(categoria.nombre);
    setDescripcion(categoria.descripcion);
    setImagen(categoria.imagen);
    setIdCategoriaEditar(categoria.id);
    setModoEdicion(true);
    setMostrarFormulario(true);
  };

  // Efectos para la carga inicial de datos y filtrado
  useEffect(() => {
    obtenerCategorias();
  }, []);

  // Actualiza las categorías mostradas según el filtro de búsqueda
  useEffect(() => {
    if (filtroNombre.trim() === "") {
      setCategorias(todasLasCategorias);
    } else {
      filtrarCategorias(filtroNombre);
    }
  }, [filtroNombre, todasLasCategorias]);

  return (
    <motion.div
      className="flex min-h-screen bg-gray-600"
      layout
    >
      {/* Sección de Listado de Categorías */}
      <motion.div
        className="flex-1 p-8 ml-60"
        layout
        transition={{ duration: 0.2 }}
      >
        <div className="flex justify-between items-center mb-4">
          <h3 className="font-bold text-gray-200 mt-2">
            Listado de Categorías
          </h3>
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
            className="w-1/2 p-1.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-500 transition"
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
              <tr
                key={categoria.id}
                className="hover:bg-gray-200"
              >
                <td className="border px-4 py-2 text-sm">{categoria.nombre}</td>
                <td className="border px-4 py-2 text-sm">{categoria.descripcion}</td>
                <td className="border px-4 py-2 text-sm">{categoria.imagen}</td>
                <td
                  className="border px-4 py-2 text-blue-600 text-center cursor-pointer hover:text-gray-700"
                  onClick={() => handleEditarCategoria(categoria)}
                >
                  <PencilSquareIcon className="h-5 w-5 mx-auto" />
                </td>
                <td
                  className="border px-4 py-2 text-red-600 text-center cursor-pointer hover:text-red-700"
                  onClick={() => handleEliminarCategoria(categoria.id)}
                >
                  <TrashIcon className="h-5 w-5 mx-auto" />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </motion.div>

      {/* Sección de Formulario para Nueva Categoría */}
      {mostrarFormulario && (
        <motion.div
          initial={{ opacity: 0, x: 100 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: 100 }}
          transition={{ duration: 0.2 }}
          className="w-1/4 p-10"
          layout
        >
          <h2 className="font-bold mb-4 text-center text-gray-200">
            Nueva Categoría
          </h2>
          <form
            onSubmit={handleSubmit}
            className="space-y-4"
          >
            <input
              type="text"
              placeholder="Nombre"
              value={nombre}
              onChange={(e: ChangeEvent<HTMLInputElement>) => setNombre(e.target.value)}
              className="w-full p-1.5 border border-gray-300 rounded" required
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
            {mensaje && (
              <p className="text-green-600">{mensaje}</p>
            )}
          </form>
        </motion.div>
      )}
    </motion.div>
  );
};

export default Categoria;