import React, { useState, useEffect, ChangeEvent, FormEvent } from "react";
import axios from "axios";
import { PencilSquareIcon, TrashIcon, ArrowPathIcon } from "@heroicons/react/24/outline";
import { motion } from "framer-motion";

// URL base para los endpoints relacionados con proveedores
const API_URL = "http://localhost:4000/proveedor";

const Proveedor: React.FC = () => {
  const [nombre, setNombre] = useState("");
  const [codigo, setCodigo] = useState("");
  const [telefono, setTelefono] = useState("");
  const [cuit, setCuit] = useState("");
  const [proveedores, setProveedores] = useState([]);
  const [todosLosProveedores, setTodosLosProveedores] = useState([]);
  const [filtroNombre, setFiltroNombre] = useState("");
  const [mostrarFormulario, setMostrarFormulario] = useState(false);
  const [modoEdicion, setModoEdicion] = useState(false);
  const [idProveedorEditar, setIdProveedorEditar] = useState<number | null>(null);
  const [mostrarHistorial, setMostrarHistorial] = useState(false);
  const [proveedoresEliminados, setProveedoresEliminados] = useState([]);
  const [filtroNombreEliminados, setFiltroNombreEliminados] = useState("");
  const [filtroFechaInicio, setFiltroFechaInicio] = useState("");
  const [filtroFechaFin, setFiltroFechaFin] = useState("");
  const [mostrarAlertaExito, setMostrarAlertaExito] = useState(false);
  const [mensajeAlertaExito, setMensajeAlertaExito] = useState("");
  const [mostrarAlertaError, setMostrarAlertaError] = useState(false);
  const [mensajeAlertaError, setMensajeAlertaError] = useState("");

  // Obtiene todos los proveedores activos desde la API
  const obtenerProveedores = async () => {
    try {
      const res = await axios.get(API_URL);
      setProveedores(res.data);
      setTodosLosProveedores(res.data);
    } catch (error) {
      console.error("Error al obtener los proveedores:", error);
      setMensajeAlertaError("Error al obtener los proveedores.");
      setMostrarAlertaError(true);
    }
  };

  // Obtiene los proveedores eliminados (soft deleted)
  const obtenerProveedoresEliminados = async () => {
    try {
      const res = await axios.get(`${API_URL}/findSoftDeleted`);
      setProveedoresEliminados(res.data);
    } catch (error) {
      console.error("Error al obtener los proveedores eliminados:", error);
      setMensajeAlertaError("No se pudieron cargar los proveedores eliminados.");
      setMostrarAlertaError(true);
    }
  };

  // Filtra los proveedores activos según el texto de búsqueda
  const filtrarProveedores = (nombreFiltro: string) => {
    const resultado = todosLosProveedores.filter((proveedor: any) =>
      proveedor.nombre.toLowerCase().includes(nombreFiltro.toLowerCase())
    );
    setProveedores(resultado);
  };

  // Filtra los proveedores eliminados según nombre y rango de fechas
  const filtrarProveedoresEliminados = (proveedores: any[]) => {
    return proveedores.filter((proveedor: any) => {
      const nombreCoincide = proveedor.nombre
        .toLowerCase()
        .includes(filtroNombreEliminados.toLowerCase());

      const fechaEliminacion = new Date(proveedor.deletedAt).getTime();
      const fechaInicio = filtroFechaInicio ? new Date(filtroFechaInicio).getTime() : null;
      const fechaFin = filtroFechaFin ? new Date(filtroFechaFin).getTime() : null;

      const fechaCoincide =
        (!fechaInicio || fechaEliminacion >= fechaInicio) &&
        (!fechaFin || fechaEliminacion <= fechaFin);

      return nombreCoincide && fechaCoincide;
    });
  };

  // Limpia los filtros de proveedores eliminados
  const limpiarFiltros = () => {
    setFiltroNombreEliminados("");
    setFiltroFechaInicio("");
    setFiltroFechaFin("");
  };

  // Maneja el envío del formulario para crear o actualizar un proveedor
  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    try {
      if (modoEdicion && idProveedorEditar !== null) {
        await axios.patch(`${API_URL}/${idProveedorEditar}`, {
          id: idProveedorEditar,
          nombre,
          telefono: parseInt(telefono),
          cuit: parseInt(cuit),
        });
        setMensajeAlertaExito("Proveedor actualizado con éxito.");
        setMostrarAlertaExito(true);
      } else {
        await axios.post(API_URL, {
          nombre,
          codigo,
          telefono: parseInt(telefono),
          cuit: parseInt(cuit),
        });
        setMensajeAlertaExito("Proveedor registrado con éxito.");
        setMostrarAlertaExito(true);
      }

      setNombre("");
      setCodigo("");
      setTelefono("");
      setCuit("");
      setModoEdicion(false);
      setIdProveedorEditar(null);
      setMostrarFormulario(false);
      obtenerProveedores();
    } catch (error) {
      console.error("Error al registrar/actualizar el proveedor:", error);
      setMensajeAlertaError("Error al registrar/actualizar el proveedor.");
      setMostrarAlertaError(true);
    }
  };

  // Elimina un proveedor tras confirmación del usuario
  const handleEliminarProveedor = async (id: number) => {
    const confirmacion = window.confirm("¿Estás seguro que querés eliminar este proveedor?");
    if (!confirmacion) return;

    try {
      await axios.delete(`${API_URL}/softDelete/${id}`);
      setMensajeAlertaExito("Proveedor eliminado correctamente.");
      setMostrarAlertaExito(true);
      obtenerProveedores();
    } catch (error) {
      console.error("Error al eliminar el proveedor:", error);
      setMensajeAlertaError("Error al eliminar el proveedor.");
      setMostrarAlertaError(true);
    }
  };

  // Restaura un proveedor eliminado
  const handleRestaurarProveedor = async (id: number) => {
    const confirmacion = window.confirm("¿Estás seguro que querés restaurar este proveedor?");
    if (!confirmacion) return;

    try {
      await axios.patch(`${API_URL}/restore/${id}`);
      setMensajeAlertaExito("Proveedor restaurado correctamente.");
      setMostrarAlertaExito(true);
      obtenerProveedores();
      obtenerProveedoresEliminados();
    } catch (error) {
      console.error("Error al restaurar el proveedor:", error);
      setMensajeAlertaError("Error al restaurar el proveedor.");
      setMostrarAlertaError(true);
    }
  };

  // Prepara el formulario para editar un proveedor existente
  const handleEditarProveedor = (proveedor: any) => {
    setNombre(proveedor.nombre);
    setCodigo(proveedor.codigo);
    setTelefono(proveedor.telefono);
    setCuit(proveedor.cuit);
    setIdProveedorEditar(proveedor.id);
    setModoEdicion(true);
    setMostrarFormulario(true);
  };

  // Abre el modal de historial y carga los proveedores eliminados
  const handleAbrirHistorial = async () => {
    await obtenerProveedoresEliminados();
    setMostrarHistorial(true);
  };

  // Efectos para la carga inicial de datos y filtrado
  useEffect(() => {
    obtenerProveedores();
  }, []);

  // Actualiza los proveedores mostrados según el filtro de búsqueda
  useEffect(() => {
    if (filtroNombre.trim() === "") {
      setProveedores(todosLosProveedores);
    } else {
      filtrarProveedores(filtroNombre);
    }
  }, [filtroNombre, todosLosProveedores]);

  // Temporizador para cerrar la alerta de éxito después de 3 segundos
  useEffect(() => {
    if (mostrarAlertaExito) {
      const timer = setTimeout(() => {
        setMostrarAlertaExito(false);
        setMensajeAlertaExito("");
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [mostrarAlertaExito]);

  //Parte visible del frontend
  return (
    <div className="flex min-h-screen bg-gray-600">
      {/* Sección de Listado de Proveedores */}
      <div className="flex-1 p-8 ml-60 relative flex flex-col">
        <div className="flex justify-between items-center mb-4">
          <h3 className="font-bold text-gray-200 mt-2">Listado de Proveedores</h3>
          <div className="space-x-2">
            <button
              onClick={() => setMostrarFormulario(true)}
              className="py-2 px-4 bg-indigo-500 text-white rounded-lg border border-indigo-500 hover:bg-indigo-600 focus:ring-1 focus:ring-indigo-300 transition"
            >
              Nuevo Proveedor
            </button>
            <button
              onClick={handleAbrirHistorial}
              className="py-2 px-4 bg-gray-500 text-white rounded-lg border border-gray-500 hover:bg-gray-600 focus:ring-1 focus:ring-gray-300 transition"
            >
              Historial de Eliminaciones
            </button>
          </div>
        </div>

        {/* Alerta emergente para el mensaje de éxito */}
        {mostrarAlertaExito && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2, ease: "easeInOut" }}
            className="absolute top-3 left-1/3 transform -translate-x-1/2 w-3/5 max-w-sm bg-green-50 border border-green-200 text-green-600 px-3 py-2 rounded-md shadow-sm flex items-center space-x-2 z-50"
          >
            <svg className="h-5 w-5 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
            </svg>
            <div className="flex-1">
              <p className="text-sm font-medium">Éxito</p>
              <p className="text-xs">{mensajeAlertaExito}</p>
            </div>
          </motion.div>
        )}

        {/* Alerta emergente para el mensaje de error */}
        {mostrarAlertaError && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2, ease: "easeInOut" }}
            className="absolute top-3 left-1/3 transform -translate-x-1/2 w-3/5 max-w-sm bg-red-50 border border-red-200 text-red-600 px-3 py-2 rounded-md shadow-sm flex items-center space-x-2 z-50"
          >
            <svg className="h-5 w-5 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <div className="flex-1">
              <p className="text-sm font-medium">Error</p>
              <p className="text-xs">{mensajeAlertaError}</p>
            </div>
            <button
              onClick={() => setMostrarAlertaError(false)}
              className="text-red-500 hover:text-red-700 focus:outline-none"
            >
              <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </motion.div>
        )}

        <div className="mb-4">
          <input
            type="text"
            placeholder="Filtrar por nombre..."
            value={filtroNombre}
            onChange={(e) => setFiltroNombre(e.target.value)}
            className="w-1/2 p-1.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-500 transition"
          />
        </div>

        <div className="flex-1 overflow-hidden">
          <div className="max-h-[70vh] overflow-y-auto">
            <table className="w-full border-collapse rounded-lg overflow-hidden shadow-md border border-indigo-200 bg-gray-100">
              <thead>
                <tr className="bg-indigo-100 sticky top-0 z-10">
                  <th className="border px-4 py-2 text-left text-sm font-semibold">Nombre</th>
                  <th className="border px-4 py-2 text-left text-sm font-semibold">Código</th>
                  <th className="border px-4 py-2 text-left text-sm font-semibold">Teléfono</th>
                  <th className="border px-4 py-2 text-left text-sm font-semibold">CUIT</th>
                  <th className="border px-4 py-2 text-center text-sm font-semibold">Modificar</th>
                  <th className="border px-4 py-2 text-center text-sm font-semibold">Eliminar</th>
                </tr>
              </thead>
              <tbody>
                {proveedores.map((proveedor: any) => (
                  <tr key={proveedor.id} className="hover:bg-gray-200">
                    <td className="border px-4 py-2 text-sm">{proveedor.nombre}</td>
                    <td className="border px-4 py-2 text-sm">{proveedor.codigo}</td>
                    <td className="border px-4 py-2 text-sm">{proveedor.telefono}</td>
                    <td className="border px-4 py-2 text-sm">{proveedor.cuit}</td>
                    <td
                      className="border px-4 py-2 text-blue-600 text-center cursor-pointer hover:text-gray-700"
                      onClick={() => handleEditarProveedor(proveedor)}
                    >
                      <PencilSquareIcon className="h-5 w-5 mx-auto" />
                    </td>
                    <td
                      className="border px-4 py-2 text-red-600 text-center cursor-pointer hover:text-red-700"
                      onClick={() => handleEliminarProveedor(proveedor.id)}
                    >
                      <TrashIcon className="h-5 w-5 mx-auto" />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Sección de Formulario para Nuevo Proveedor */}
      {mostrarFormulario && (
        <motion.div
          initial={{ opacity: 0, x: 100 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: 100 }}
          transition={{ duration: 0.2 }}
          className="w-1/4 p-10"
        >
          <h2 className="font-bold mb-4 text-center text-gray-200">
            {modoEdicion ? "Editar Proveedor" : "Nuevo Proveedor"}
          </h2>
          <form onSubmit={handleSubmit} className="space-y-4">
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
              placeholder="Código"
              value={codigo}
              onChange={(e: ChangeEvent<HTMLInputElement>) => setCodigo(e.target.value)}
              className="w-full p-1.5 border border-gray-300 rounded"
              required
            />
            <input
              type="number"
              placeholder="Teléfono"
              value={telefono}
              onChange={(e: ChangeEvent<HTMLInputElement>) => setTelefono(e.target.value)}
              className="w-full p-1.5 border border-gray-300 rounded"
              required
            />
            <input
              type="number"
              placeholder="CUIT"
              value={cuit}
              onChange={(e: ChangeEvent<HTMLInputElement>) => setCuit(e.target.value)}
              className="w-full p-1.5 border border-gray-300 rounded"
              required
            />
            <button
              type="submit"
              className="w-full py-2 px-4 bg-indigo-500 text-white rounded-lg border border-indigo-500 hover:bg-indigo-600 focus:ring-1 focus:ring-indigo-300 transition"
            >
              {modoEdicion ? "Actualizar" : "Registrar"}
            </button>
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
                value={filtroNombreEliminados}
                onChange={(e) => setFiltroNombreEliminados(e.target.value)}
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
                  className="w-1/3 py-2 px-4 bg-red-500 text-white rounded-lg hover:bg-red-600 transition"
                >
                  Limpiar Filtros
                </button>
              </div>
            </div>
            {filtrarProveedoresEliminados(proveedoresEliminados).length === 0 ? (
              <p className="text-center text-gray-600">No hay proveedores eliminados que coincidan con los filtros.</p>
            ) : (
              <table className="w-full border-collapse">
                <thead>
                  <tr className="bg-gray-100">
                    <th className="border px-4 py-2 text-left text-sm font-semibold">Nombre</th>
                    <th className="border px-4 py-2 text-left text-sm font-semibold">Código</th>
                    <th className="border px-4 py-2 text-left text-sm font-semibold">Teléfono</th>
                    <th className="border px-4 py-2 text-left text-sm font-semibold">CUIT</th>
                    <th className="border px-4 py-2 text-left text-sm font-semibold">Fecha de Eliminación</th>
                    <th className="border px-4 py-2 text-center text-sm font-semibold">Restaurar</th>
                  </tr>
                </thead>
                <tbody>
                  {filtrarProveedoresEliminados(proveedoresEliminados).map((proveedor: any) => (
                    <tr key={proveedor.id} className="hover:bg-gray-50">
                      <td className="border px-4 py-2 text-sm">{proveedor.nombre}</td>
                      <td className="border px-4 py-2 text-sm">{proveedor.codigo}</td>
                      <td className="border px-4 py-2 text-sm">{proveedor.telefono}</td>
                      <td className="border px-4 py-2 text-sm">{proveedor.cuit}</td>
                      <td className="border px-4 py-2 text-sm">
                        {new Date(proveedor.deletedAt).toLocaleString()}
                      </td>
                      <td
                        className="border px-4 py-2 text-green-600 text-center cursor-pointer hover:text-green-700"
                        onClick={() => handleRestaurarProveedor(proveedor.id)}
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
    </div>
  );
};

export default Proveedor;