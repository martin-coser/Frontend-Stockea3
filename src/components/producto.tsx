import React, { useState, useEffect, ChangeEvent, FormEvent } from "react";
import axios from "axios";
import { PencilSquareIcon, TrashIcon } from "@heroicons/react/24/outline";
import { motion } from "framer-motion";

// URL base para los endpoints relacionados con productos
const API_URL = "http://localhost:4000/producto";

const Producto: React.FC = () => {
  const [nombre, setNombre] = useState("");
  const [codigo, setCodigo] = useState("");
  const [descripcion, setDescripcion] = useState("");
  const [marca, setMarca] = useState("");
  const [proveedor, setProveedor] = useState("");
  const [categoria, setCategoria] = useState("");
  const [productos, setProductos] = useState([]);
  const [todosLosProductos, setTodosLosProductos] = useState([]);
  const [filtroNombre, setFiltroNombre] = useState("");
  const [mostrarFormulario, setMostrarFormulario] = useState(false);
  const [marcasDisponibles, setMarcasDisponibles] = useState<
    { id: string; nombre: string }[]
  >([]);
  const [categoriasDisponibles, setCategoriasDisponibles] = useState<
    { id: string; nombre: string }[]
  >([]);
  const [proveedoresDisponibles, setProveedoresDisponibles] = useState<
    { id: string; nombre: string }[]
  >([]);
  const [modoEdicion, setModoEdicion] = useState(false);
  const [idProductoEditar, setIdProductoEditar] = useState<number | null>(null);
  const [mostrarAlertaExito, setMostrarAlertaExito] = useState(false);
  const [mensajeAlertaExito, setMensajeAlertaExito] = useState("");
  const [mostrarAlertaError, setMostrarAlertaError] = useState(false);
  const [mensajeAlertaError, setMensajeAlertaError] = useState("");
  const [
    mostrarAlertaConfirmacionEliminacion,
    setMostrarAlertaConfirmacionEliminacion,
  ] = useState(false);
  const [idProductoAEliminar, setIdProductoAEliminar] = useState<number | null>(
    null
  );

  // Obtiene todos los productos, marcas, categorías y proveedores desde la API
  const obtenerProductos = async () => {
    try {
      const res = await axios.get(API_URL);
      // Filtrar productos que NO están eliminados (sin deletedAt)
      const productosFiltrados = res.data.filter(
        (producto: any) => !producto.deletedAt
      );
      setProductos(productosFiltrados);
      setTodosLosProductos(productosFiltrados);

      const mar = await axios.get("http://localhost:4000/marca");
      const cat = await axios.get("http://localhost:4000/categoria");
      const pro = await axios.get("http://localhost:4000/proveedor");

      setMarcasDisponibles(mar.data);
      setCategoriasDisponibles(cat.data);
      setProveedoresDisponibles(pro.data);
    } catch (error) {
      console.error("Error al obtener los productos:", error);
      setMensajeAlertaError("Error al obtener los productos.");
      setMostrarAlertaError(true);
    }
  };

  // Filtra los productos según el texto de búsqueda
  const filtrarProductos = (nombreFiltro: string) => {
    const resultado = todosLosProductos.filter((producto: any) =>
      producto.nombre.toLowerCase().includes(nombreFiltro.toLowerCase())
    );
    setProductos(resultado);
  };

  // Maneja el envío del formulario para crear o actualizar un producto
  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (
      !nombre ||
      !codigo ||
      !descripcion ||
      !marca ||
      !proveedor ||
      !categoria
    ) {
      setMensajeAlertaError("Todos los campos son obligatorios.");
      setMostrarAlertaError(true);
      return;
    }

    try {
      if (modoEdicion && idProductoEditar !== null) {
        await axios.patch(`${API_URL}/${idProductoEditar}`, {
          id: idProductoEditar,
          nombre,
          codigo,
          descripcion,
          marca: parseInt(marca),
          categoria: parseInt(categoria),
          proveedor: parseInt(proveedor),
        });
        setMensajeAlertaExito("Producto actualizado con éxito.");
        setMostrarAlertaExito(true);
      } else {
        await axios.post(API_URL, {
          nombre,
          codigo,
          descripcion,
          marca: parseInt(marca),
          categoria: parseInt(categoria),
          proveedor: parseInt(proveedor),
        });
        setMensajeAlertaExito("Producto registrado con éxito.");
        setMostrarAlertaExito(true);
      }

      setNombre("");
      setCodigo("");
      setDescripcion("");
      setMarca("");
      setCategoria("");
      setProveedor("");
      setModoEdicion(false);
      setIdProductoEditar(null);
      setMostrarFormulario(false);
      obtenerProductos();
    } catch (error) {
      console.error("Error al registrar/actualizar el producto:", error);
      setMensajeAlertaError("Error al registrar/actualizar el producto.");
      setMostrarAlertaError(true);
    }
  };

  // Elimina un producto tras confirmación del usuario
  const handleEliminarProducto = async (id: number) => {
    setIdProductoAEliminar(id);
    setMostrarAlertaConfirmacionEliminacion(true);
  };
  const confirmarEliminarProducto = async () => {
    if (idProductoAEliminar === null) {
      console.error("No hay ID de producto para eliminar.");
      setMostrarAlertaConfirmacionEliminacion(false);
      return;
    }

    try {
      await axios.delete(`${API_URL}/softDelete/${idProductoAEliminar}`);
      setMensajeAlertaExito("Producto eliminado correctamente.");
      setMostrarAlertaExito(true);
      obtenerProductos(); // Refresca la lista de productos activos
      // Si tienes un historial de eliminados para productos, deberías refrescarlo aquí también.
    } catch (error) {
      console.error("Error al eliminar el producto:", error);
      setMensajeAlertaError("Error al eliminar el producto.");
      setMostrarAlertaError(true);
    } finally {
      setMostrarAlertaConfirmacionEliminacion(false); // Cierra el modal de confirmación
      setIdProductoAEliminar(null); // Limpia el ID
    }
  };
  // Prepara el formulario para editar un producto existente
  const handleEditarProducto = (producto: any) => {
    setNombre(producto.nombre);
    setCodigo(producto.codigo);
    setDescripcion(producto.descripcion);
    setMarca(producto.marca.id);
    setCategoria(producto.categoria.id);
    setProveedor(producto.proveedor.id);
    setIdProductoEditar(producto.id);
    setModoEdicion(true);
    setMostrarFormulario(true);
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

  return (
    <div className="flex min-h-screen bg-gray-600">
      {/* Sección de Listado de Productos */}
      <div className="flex-1 p-8 ml-60 relative flex flex-col">
        <div className="flex justify-between items-center mb-4">
          <h3 className="font-bold text-gray-200 mt-2">Listado de Productos</h3>
          <button
            onClick={() => setMostrarFormulario(true)}
            className="w-1/7 py-2 px-4 bg-indigo-500 text-white rounded-lg border border-indigo-500 hover:bg-indigo-600 focus:ring-1 focus:ring-indigo-300 transition"
          >
            Nuevo Producto
          </button>
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
            <svg
              className="h-5 w-5 text-green-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M5 13l4 4L19 7"
              />
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
            <svg
              className="h-5 w-5 text-red-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            <div className="flex-1">
              <p className="text-sm font-medium">Error</p>
              <p className="text-xs">{mensajeAlertaError}</p>
            </div>
            <button
              onClick={() => setMostrarAlertaError(false)}
              className="text-red-500 hover:text-red-700 focus:outline-none"
            >
              <svg
                className="h-4 w-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </motion.div>
        )}
        {/* Alerta de confirmación de eliminación */}
        {mostrarAlertaConfirmacionEliminacion && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
          >
            <div className="bg-white p-6 rounded-lg shadow-lg max-w-sm w-full">
              <h2 className="text-xl font-bold mb-4 text-center text-gray-800">
                Confirmación de Eliminación
              </h2>
              <p className="text-center text-gray-700 mb-6">
                ¿Estás seguro que querés eliminar este producto?
              </p>
              <div className="flex justify-around space-x-4">
                <button
                  onClick={confirmarEliminarProducto}
                  className="py-2 px-6 bg-red-500 text-white rounded-lg border border-red-500 hover:bg-red-600 focus:ring-1 focus:ring-red-300 transition"
                >
                  Aceptar
                </button>
                <button
                  onClick={() => {
                    setMostrarAlertaConfirmacionEliminacion(false);
                    setIdProductoAEliminar(null);
                  }}
                  className="py-2 px-6 bg-gray-300 text-gray-800 rounded-lg border border-gray-300 hover:bg-gray-400 focus:ring-1 focus:ring-gray-200 transition"
                >
                  Cancelar
                </button>
              </div>
            </div>
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
                  <th className="border px-4 py-2 text-left text-sm font-semibold">
                    Nombre
                  </th>
                  <th className="border px-4 py-2 text-left text-sm font-semibold">
                    Código
                  </th>
                  <th className="border px-4 py-2 text-left text-sm font-semibold">
                    Descripción
                  </th>
                  <th className="border px-4 py-2 text-left text-sm font-semibold">
                    Marca
                  </th>
                  <th className="border px-4 py-2 text-left text-sm font-semibold">
                    Categoría
                  </th>
                  <th className="border px-4 py-2 text-left text-sm font-semibold">
                    Proveedor
                  </th>
                  <th className="border px-4 py-2 text-center text-sm font-semibold">
                    Modificar
                  </th>
                  <th className="border px-4 py-2 text-center text-sm font-semibold">
                    Eliminar
                  </th>
                </tr>
              </thead>
              <tbody>
                {productos.map((producto: any) => (
                  <tr key={producto.id} className="hover:bg-gray-200">
                    <td className="border px-4 py-2 text-sm">
                      {producto.nombre}
                    </td>
                    <td className="border px-4 py-2 text-sm">
                      {producto.codigo}
                    </td>
                    <td className="border px-4 py-2 text-sm">
                      {producto.descripcion}
                    </td>
                    <td className="border px-4 py-2 text-sm">
                      {producto.marca.nombre}
                    </td>
                    <td className="border px-4 py-2 text-sm">
                      {producto.categoria.nombre}
                    </td>
                    <td className="border px-4 py-2 text-sm">
                      {producto.proveedor.nombre}
                    </td>
                    <td
                      className="border px-4 py-2 text-blue-600 text-center cursor-pointer hover:text-gray-700"
                      onClick={() => handleEditarProducto(producto)}
                    >
                      <PencilSquareIcon className="h-5 w-5 mx-auto" />
                    </td>
                    <td
                      className="border px-4 py-2 text-red-600 text-center cursor-pointer hover:text-red-700"
                      onClick={() => handleEliminarProducto(producto.id)}
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

      {/* Sección de Formulario para Nuevo Producto */}
      {mostrarFormulario && (
        <motion.div
          initial={{ opacity: 0, x: 100 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: 100 }}
          transition={{ duration: 0.2 }}
          className="w-1/4 p-10"
        >
          <h2 className="font-bold mb-4 text-center text-gray-200">
            {modoEdicion ? "Editar Producto" : "Nuevo Producto"}
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
              required
            />
            <input
              type="text"
              placeholder="Código"
              value={codigo}
              onChange={(e: ChangeEvent<HTMLInputElement>) =>
                setCodigo(e.target.value)
              }
              className="w-full p-1.5 border border-gray-300 rounded"
              required
            />
            <input
              type="text"
              placeholder="Descripción"
              value={descripcion}
              onChange={(e: ChangeEvent<HTMLInputElement>) =>
                setDescripcion(e.target.value)
              }
              className="w-full p-1.5 border border-gray-300 rounded"
              required
            />
            <select
              value={marca}
              onChange={(e) => setMarca(e.target.value)}
              className="w-full p-1.5 border border-gray-300 rounded"
              required
            >
              <option value="">Seleccionar marca</option>
              {marcasDisponibles.map((m) => (
                <option key={m.id} value={m.id}>
                  {m.nombre}
                </option>
              ))}
            </select>
            <select
              value={categoria}
              onChange={(e) => setCategoria(e.target.value)}
              className="w-full p-1.5 border border-gray-300 rounded"
              required
            >
              <option value="">Seleccionar categoría</option>
              {categoriasDisponibles.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.nombre}
                </option>
              ))}
            </select>
            <select
              value={proveedor}
              onChange={(e) => setProveedor(e.target.value)}
              className="w-full p-1.5 border border-gray-300 rounded"
              required
            >
              <option value="">Seleccionar proveedor</option>
              {proveedoresDisponibles.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.nombre}
                </option>
              ))}
            </select>
            <button
              type="submit"
              className="w-full py-2 px-4 bg-indigo-500 text-white rounded-lg border border-indigo-500 hover:bg-indigo-600 focus:ring-1 focus:ring-indigo-300 transition"
            >
              {modoEdicion ? "Actualizar" : "Registrar"}
            </button>
          </form>
        </motion.div>
      )}
    </div>
  );
};

export default Producto;
