import React, { useState, useEffect, ChangeEvent, FormEvent } from "react";
import axios from "axios";
import { PencilSquareIcon } from "@heroicons/react/24/outline";
import { TrashIcon } from "@heroicons/react/24/outline";

const API_URL = "http://localhost:4000/categoria";

const Categoria: React.FC = () => {
  const [nombre, setNombre] = useState("");
  const [descripcion, setDescripcion] = useState("");
  const [imagen, setImagen] = useState("");
  const [mensaje, setMensaje] = useState("");
  const [categorias, setCategorias] = useState([]);
  const [todasLasCategorias, setTodasLasCategorias] = useState([]); // Nuevo estado
  const [filtroNombre, setFiltroNombre] = useState("");

  // Traer todas las marcas
  const obtenerCategorias = async () => {
    try {
      const res = await axios.get(API_URL);
      setCategorias(res.data);
      setTodasLasCategorias(res.data); // Guardamos todas
    } catch (error) {
      console.error("Error al obtener las marcas:", error);
    }
  };

  // Filtrar categorias por nombre
  const filtrarCategorias = (nombreFiltro: string) => {
    const resultado = todasLasCategorias.filter((categoria: any) =>
      categoria.nombre.toLowerCase().includes(nombreFiltro.toLowerCase())
    );
    setCategorias(resultado);
  };

  // Al cambiar el filtro de nombre
  useEffect(() => {
    if (filtroNombre.trim() === "") {
      setCategorias(todasLasCategorias); // Mostrar todas si no hay filtro
    } else {
      filtrarCategorias(filtroNombre);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filtroNombre, todasLasCategorias]);

  // Ejecutar al montar el componente
  useEffect(() => {
    obtenerCategorias();
  }, []);

  // Registrar nueva categoria
  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    try {
      await axios.post(API_URL, { nombre, descripcion, imagen });
      setMensaje("Categoria registrada con éxito.");
      setNombre("");
      setDescripcion("");
      setImagen("");
      obtenerCategorias();
    } catch (error) {
      console.error("Error al registrar la categoria:", error);
      setMensaje("Error al registrar la categoria.");
    }
  };

  return (
    <div className="flex min-h-screen bg-gray-600">
      {/* Formulario para nueva categoria */}
      <div className="w-1/3 p-10 ml-60">
        <h2 className="font-bold mb-4 text-center text-gray-200">
          Nueva Categoria
        </h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            type="text"
            placeholder="Nombre"
            value={nombre}
            onChange={(e: ChangeEvent<HTMLInputElement>) =>
              setNombre(e.target.value)
            }
            className="w-full p-1.5 border border-gray-300 rounded"
          />
          <input
            type="text"
            placeholder="Descripción"
            value={descripcion}
            onChange={(e: ChangeEvent<HTMLInputElement>) =>
              setDescripcion(e.target.value)
            }
            className="w-full p-1.5 border border-gray-300 rounded"
          />
          <input
            type="text"
            placeholder="Imagen"
            value={imagen}
            onChange={(e: ChangeEvent<HTMLInputElement>) =>
              setImagen(e.target.value)
            }
            className="w-full p-1.5 border border-gray-300 rounded"
          />
          <button
            type="submit"
            className="w-full py-2 px-4 bg-indigo-500 text-white rounded-lg border border-indigo-500 hover:bg-indigo-600 focus:ring-4 focus:ring-indigo-300 transition"
          >
            Registrar
          </button>
          {mensaje && <p className="text-green-600">{mensaje}</p>}
        </form>
      </div>

      {/* Listado de categorias con filtro */}
      <div className="w-2/3 w-full p-8">
        <h3 className="font-bold mb-4 mt-2 text-center text-gray-200">
          Listado de Categorias
        </h3>

        <div className="mb-4">
          <input
            type="text"
            placeholder="Filtrar por nombre..."
            value={filtroNombre}
            onChange={(e) => setFiltroNombre(e.target.value)}
            className="w-1/2 p-1.5 border rounded-lg  border-gray-300 rounded"
          />
        </div>

        <table className="w-full border-collapse rounded-lg overflow-hidden shadow-md border border-indigo-200 bg-gray-100">
          <thead>
            <tr className="bg-indigo-100">
              <th className="border px-4 py-2 text-left text-sm font-semibold">
                Nombre
              </th>
              <th className="border px-4 py-2 text-left text-sm font-semibold">
                Descripción
              </th>
              <th className="border px-4 py-2 text-left text-sm font-semibold">
                Imagen
              </th>
              <th className="border px-4 py-2 text-left text-sm font-semibold">
                Modificar
              </th>
              <th className="border px-4 py-2 text-left text-sm font-semibold">
                Eliminar
              </th>
            </tr>
          </thead>

          <tbody>
            {categorias.map((marca: any) => (
              <tr key={marca.id} className="hover:bg-green-50">
                <td className="px-4 py-2">{marca.nombre}</td>
                <td className="px-4 py-2">{marca.descripcion}</td>
                <td className="px-4 py-2">{marca.imagen}</td>
                <td className="px-4 py-2 text-blue-600 cursor-pointer">
                  <PencilSquareIcon className=" h-5 w-5 text-blue-600 ml-6" />
                </td>
                <td className="px-4 py-2 text-red-600 cursor-pointer">
                  <TrashIcon className="h-5 w-5 text-red-600 ml-5" />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Categoria;
