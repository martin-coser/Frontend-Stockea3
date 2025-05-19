import React, { useState, useEffect, ChangeEvent, FormEvent } from "react";
import axios from "axios";
import { PencilSquareIcon, TrashIcon, ArrowPathIcon } from "@heroicons/react/24/outline";
import { motion } from "framer-motion";

// URL base para los endpoints relacionados con marcas
const API_URL = "http://localhost:4000/marca";

const Marca: React.FC = () => {
  // Estados para gestionar los inputs del formulario, lista de marcas y estados de la UI
  const [nombre, setNombre] = useState("");
  const [descripcion, setDescripcion] = useState("");
  const [mensaje, setMensaje] = useState("");
  const [marcas, setMarcas] = useState([]);
  const [todasLasMarcas, setTodasLasMarcas] = useState([]);
  const [filtroNombre, setFiltroNombre] = useState("");
  const [mostrarFormulario, setMostrarFormulario] = useState(false);
  const [modoEdicion, setModoEdicion] = useState(false);
  const [idMarcaEditar, setIdMarcaEditar] = useState<number | null>(null);
  const [mostrarHistorial, setMostrarHistorial] = useState(false);
  const [marcasEliminadas, setMarcasEliminadas] = useState([]);
  const [filtroNombreEliminadas, setFiltroNombreEliminadas] = useState("");
  const [filtroFechaInicio, setFiltroFechaInicio] = useState("");
  const [filtroFechaFin, setFiltroFechaFin] = useState("");

  // Obtiene todas las marcas activas desde la API
  const obtenerMarcas = async () => {
    try {
      const res = await axios.get(API_URL);
      setMarcas(res.data);
      setTodasLasMarcas(res.data);
    } catch (error) {
      console.error("Error al obtener las marcas:", error);
    }
  };

  // Obtiene las marcas eliminadas (soft deleted)
  const obtenerMarcasEliminadas = async () => {
    try {
      const res = await axios.get(`${API_URL}/findSoftDeleted`);
      setMarcasEliminadas(res.data);
    } catch (error) {
      console.error("Error al obtener las marcas eliminadas:", error);
    }
  };

  // Filtra las marcas activas según el texto de búsqueda
  const filtrarMarcas = (nombreFiltro: string) => {
    const resultado = todasLasMarcas.filter((marca: any) =>
      marca.nombre.toLowerCase().includes(nombreFiltro.toLowerCase())
    );
    setMarcas(resultado);
  };

  // Filtra las marcas eliminadas según nombre y rango de fechas
  const filtrarMarcasEliminadas = (marcas: any[]) => {
    return marcas.filter((marca: any) => {
      const nombreCoincide = marca.nombre
        .toLowerCase()
        .includes(filtroNombreEliminadas.toLowerCase());

      const fechaEliminacion = new Date(marca.deletedAt).getTime();
      const fechaInicio = filtroFechaInicio ? new Date(filtroFechaInicio).getTime() : null;
      const fechaFin = filtroFechaFin ? new Date(filtroFechaFin).getTime() : null;

      const fechaCoincide =
        (!fechaInicio || fechaEliminacion >= fechaInicio) &&
        (!fechaFin || fechaEliminacion <= fechaFin);

      return nombreCoincide && fechaCoincide;
    });
  };

  // Limpia los filtros de marcas eliminadas
  const limpiarFiltros = () => {
    setFiltroNombreEliminadas("");
    setFiltroFechaInicio("");
    setFiltroFechaFin("");
  };

  // Maneja el envío del formulario para crear o actualizar una marca
  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    try {
      if (modoEdicion && idMarcaEditar !== null) {
        await axios.patch(`${API_URL}/${idMarcaEditar}`, {
          id: idMarcaEditar,
          nombre,
          descripcion,
        });
        setMensaje("Marca actualizada con éxito.");
      } else {
        await axios.post(API_URL, { nombre, descripcion });
        setMensaje("Marca registrada con éxito.");
      }

      setNombre("");
      setDescripcion("");
      setModoEdicion(false);
      setIdMarcaEditar(null);
      setMostrarFormulario(false);
      obtenerMarcas();
    } catch (error) {
      console.error("Error al registrar/actualizar la marca:", error);
      setMensaje("Error al registrar/actualizar la marca.");
    }
  };

  // Elimina una marca tras confirmación del usuario
  const handleEliminarMarca = async (id: number) => {
    const confirmacion = window.confirm("¿Estás seguro que querés eliminar esta marca?");
    if (!confirmacion) return;

    try {
      await axios.delete(`${API_URL}/softDelete/${id}`);
      alert("Marca eliminada correctamente");
      obtenerMarcas();
    } catch (error) {
      console.error("Error:", error);
      alert("Error al eliminar la marca");
    }
  };

  // Restaura una marca eliminada
  const handleRestaurarMarca = async (id: number) => {
    const confirmacion = window.confirm("¿Estás seguro que querés restaurar esta marca?");
    if (!confirmacion) return;

    try {
      await axios.patch(`${API_URL}/restore/${id}`);
      alert("Marca restaurada correctamente");
      obtenerMarcas();
      obtenerMarcasEliminadas();
    } catch (error) {
      console.error("Error al restaurar la marca:", error);
      alert("Error al restaurar la marca");
    }
  };

  // Prepara el formulario para editar una marca existente
  const handleEditarMarca = (marca: any) => {
    setNombre(marca.nombre);
    setDescripcion(marca.descripcion);
    setIdMarcaEditar(marca.id);
    setModoEdicion(true);
    setMostrarFormulario(true);
  };

  // Abre el modal de historial y carga las marcas eliminadas
  const handleAbrirHistorial = async () => {
    await obtenerMarcasEliminadas();
    setMostrarHistorial(true);
  };

  // Efectos para la carga inicial de datos y filtrado
  useEffect(() => {
    obtenerMarcas();
  }, []);

  // Actualiza las marcas mostradas según el filtro de búsqueda
  useEffect(() => {
    if (filtroNombre.trim() === "") {
      setMarcas(todasLasMarcas);
    } else {
      filtrarMarcas(filtroNombre);
    }
  }, [filtroNombre, todasLasMarcas]);

  return (
    <motion.div
      className="flex min-h-screen bg-gray-600"
      layout
    >
      {/* Sección de Listado de Marcas */}
      <motion.div
        className="flex-1 p-8 ml-60"
        layout
        transition={{ duration: 0.2 }}
      >
        <div className="flex justify-between items-center mb-4">
          <h3 className="font-bold text-gray-200 mt-2">
            Listado de Marcas
          </h3>
          <div className="space-x-2">
            <button
              onClick={() => setMostrarFormulario(true)}
              className="py-2 px-4 bg-indigo-500 text-white rounded-lg border border-indigo-500 hover:bg-indigo-600 focus:ring-1 focus:ring-indigo-300 transition"
            >
              Nueva Marca
            </button>
            <button
              onClick={handleAbrirHistorial}
              className="py-2 px-4 bg-gray-500 text-white rounded-lg border border-gray-500 hover:bg-gray-600 focus:ring-1 focus:ring-gray-300 transition"
            >
              Historial de Eliminaciones
            </button>
          </div>
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
              <th className="border px-4 py-2 text-center text-sm font-semibold">Modificar</th>
              <th className="border px-4 py-2 text-center text-sm font-semibold">Eliminar</th>
            </tr>
          </thead>
          <tbody>
            {marcas.map((marca: any) => (
              <tr
                key={marca.id}
                className="hover:bg-gray-200"
              >
                <td className="border px-4 py-2 text-sm">{marca.nombre}</td>
                <td className="border px-4 py-2 text-sm">{marca.descripcion}</td>
                <td
                  className="border px-4 py-2 text-blue-600 text-center cursor-pointer hover:text-gray-700"
                  onClick={() => handleEditarMarca(marca)}
                >
                  <PencilSquareIcon className="h-5 w-5 mx-auto" />
                </td>
                <td
                  className="border px-4 py-2 text-red-600 text-center cursor-pointer hover:text-red-700"
                  onClick={() => handleEliminarMarca(marca.id)}
                >
                  <TrashIcon className="h-5 w-5 mx-auto" />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </motion.div>

      {/* Sección de Formulario para Nueva Marca */}
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
            {modoEdicion ? "Editar Marca" : "Nueva Marca"}
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
              className="w-full p-1.5 border border-gray-300 rounded"
              required
            />
            <input
              type="text"
              placeholder="Descripción"
              value={descripcion}
              onChange={(e: ChangeEvent<HTMLInputElement>) => setDescripcion(e.target.value)}
              className="w-full p-1.5 border border-gray-300 rounded"
            />
            <button
              type="submit"
              className="w-full py-2 px-4 bg-indigo-500 text-white rounded-lg border border-indigo-500 hover:bg-indigo-600 focus:ring-1 focus:ring-indigo-300 transition"
            >
              {modoEdicion ? "Actualizar" : "Registrar"}
            </button>
            {mensaje && (
              <p className="text-green-600">{mensaje}</p>
            )}
          </form>
        </motion.div>
      )}

      {/* Modal para Historial de Eliminaciones */}
      {mostrarHistorial && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            className="bg-white p-6 rounded-lg shadow-lg w-1/2 max-h-[80vh] overflow-y-auto"
          >
            <h2 className="text-xl font-bold mb-4 text-center">Historial de Eliminaciones</h2>
            <div className="mb-4 space-y-2">
              <input
                type="text"
                placeholder="Filtrar por nombre..."
                value={filtroNombreEliminadas}
                onChange={(e) => setFiltroNombreEliminadas(e.target.value)}
                className="w-full p-1.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-500 transition"
              />
              <div className="flex space-x-2">
                <input
                  type="date"
                  placeholder="Fecha de inicio"
                  value={filtroFechaInicio}
                  onChange={(e) => setFiltroFechaInicio(e.target.value)}
                  className="w-1/2 p-1.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-500 transition"
                />
                <input
                  type="date"
                  placeholder="Fecha de fin"
                  value={filtroFechaFin}
                  onChange={(e) => setFiltroFechaFin(e.target.value)}
                  className="w-1/2 p-1.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-500 transition"
                />
              </div>
              <div className="flex justify-center">
                <button
                  onClick={limpiarFiltros}
                  className="w-1/4 py-2 px-4 bg-red-500 text-white rounded-lg hover:bg-red-600 transition"
                >
                  Limpiar Filtros
                </button>
              </div>
            </div>
            {filtrarMarcasEliminadas(marcasEliminadas).length === 0 ? (
              <p className="text-center text-gray-600">No hay marcas eliminadas que coincidan con los filtros.</p>
            ) : (
              <table className="w-full border-collapse mt-8">
                <thead>
                  <tr className="bg-gray-100">
                    <th className="border px-4 py-2 text-left text-sm font-semibold">Nombre</th>
                    <th className="border px-4 py-2 text-left text-sm font-semibold">Descripción</th>
                    <th className="border px-4 py-2 text-left text-sm font-semibold">Fecha de Eliminación</th>
                    <th className="border px-4 py-2 text-center text-sm font-semibold">Restaurar</th>
                  </tr>
                </thead>
                <tbody>
                  {filtrarMarcasEliminadas(marcasEliminadas).map((marca: any) => (
                    <tr key={marca.id} className="hover:bg-gray-50">
                      <td className="border px-4 py-2 text-sm">{marca.nombre}</td>
                      <td className="border px-4 py-2 text-sm">{marca.descripcion}</td>
                      <td className="border px-4 py-2 text-sm">
                        {new Date(marca.deletedAt).toLocaleString()}
                      </td>
                      <td
                        className="border px-4 py-2 text-green-600 text-center cursor-pointer hover:text-green-700"
                        onClick={() => handleRestaurarMarca(marca.id)}
                      >
                        <ArrowPathIcon className="h-5 w-5 mx-auto" />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
            <button
              onClick={() => setMostrarHistorial(false)}
              className="mt-4 w-full py-2 px-4 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition"
            >
              Cerrar
            </button>
          </motion.div>
        </div>
      )}
    </motion.div>
  );
};

export default Marca;