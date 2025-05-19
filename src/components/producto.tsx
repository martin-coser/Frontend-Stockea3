import React, { useState, useEffect, ChangeEvent, FormEvent } from "react";
import axios from "axios";
import { PencilSquareIcon, TrashIcon } from "@heroicons/react/24/outline";
import { motion } from "framer-motion";

// URL base para los endpoints relacionados con productos
const API_URL = "http://localhost:4000/producto";

const Producto: React.FC = () => {
  // Estados para gestionar los inputs del formulario, lista de productos y estados de la UI
  const [nombre, setNombre] = useState("");
  const [codigo, setCodigo] = useState("");
  const [descripcion, setDescripcion] = useState("");
  const [marca, setMarca] = useState("");
  const [proveedor, setProveedor] = useState("");
  const [categoria, setCategoria] = useState("");
  const [mensaje, setMensaje] = useState("");
  const [productos, setProductos] = useState([]);
  const [todosLosProductos, setTodosLosProductos] = useState([]);
  const [filtroNombre, setFiltroNombre] = useState("");
  const [mostrarFormulario, setMostrarFormulario] = useState(false);
  const [marcasDisponibles, setMarcasDisponibles] = useState<{ id: string; nombre: string }[]>([]);
  const [categoriasDisponibles, setCategoriasDisponibles] = useState<{ id: string; nombre: string }[]>([]);
  const [proveedoresDisponibles, setProveedoresDisponibles] = useState<{ id: string; nombre: string }[]>([]);
  const [modoEdicion, setModoEdicion] = useState(false);
  const [idProductoEditar, setIdProductoEditar] = useState<number | null>(null);

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
    if (!nombre || !codigo || !descripcion || !marca || !proveedor || !categoria) {
      setMensaje("Todos los campos son obligatorios.");
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
        setMensaje("Producto actualizado con éxito.");
      } else {
        await axios.post(API_URL, {
          nombre,
          codigo,
          descripcion,
          marca: parseInt(marca),
          categoria: parseInt(categoria),
          proveedor: parseInt(proveedor),
        });
        setMensaje("Producto registrado con éxito.");
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
      setMensaje("Error al registrar/actualizar el producto.");
    }
  };

  // Elimina un producto tras confirmación del usuario
  const handleEliminarProducto = async (id: number) => {
    const confirmacion = window.confirm("¿Estás seguro que querés eliminar este producto?");
    if (!confirmacion) return;

    try {
      await axios.delete(`${API_URL}/softDelete/${id}`);
      alert("Producto eliminado correctamente");
      obtenerProductos();
    } catch (error) {
      console.error("Error:", error);
      alert("Error al eliminar el producto");
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
          <button
            onClick={() => setMostrarFormulario(true)}
            className="w-1/7 py-2 px-4 bg-indigo-500 text-white rounded-lg border border-indigo-500 hover:bg-indigo-600 focus:ring-1 focus:ring-indigo-300 transition"
          >
            Nuevo Producto
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
              <th className="border px-4 py-2 text-left text-sm font-semibold">Código</th>
              <th className="border px-4 py-2 text-left text-sm font-semibold">Descripción</th>
              <th className="border px-4 py-2 text-left text-sm font-semibold">Marca</th>
              <th className="border px-4 py-2 text-left text-sm font-semibold">Categoría</th>
              <th className="border px-4 py-2 text-left text-sm font-semibold">Proveedor</th>
              <th className="border px-4 py-2 text-center text-sm font-semibold">Modificar</th>
              <th className="border px-4 py-2 text-center text-sm font-semibold">Eliminar</th>
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
                <td className="border px-4 py-2 text-sm">{producto.descripcion}</td>
                <td className="border px-4 py-2 text-sm">{producto.marca.nombre}</td>
                <td className="border px-4 py-2 text-sm">{producto.categoria.nombre}</td>
                <td className="border px-4 py-2 text-sm">{producto.proveedor.nombre}</td>
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
      </motion.div>

      {/* Sección de Formulario para Nuevo Producto */}
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
            Nuevo Producto
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
              placeholder="Código"
              value={codigo}
              onChange={(e: ChangeEvent<HTMLInputElement>) => setCodigo(e.target.value)}
              className="w-full p-1.5 border border-gray-300 rounded" required
            />
            <input
              type="text"
              placeholder="Descripción"
              value={descripcion}
              onChange={(e: ChangeEvent<HTMLInputElement>) => setDescripcion(e.target.value)}
              className="w-full p-1.5 border border-gray-300 rounded" required
            />
            <select
              value={marca}
              onChange={(e) => setMarca(e.target.value)}
              className="w-full p-1.5 border border-gray-300 rounded" required
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
              className="w-full p-1.5 border border-gray-300 rounded" required
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
              className="w-full p-1.5 border border-gray-300 rounded" required
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
              Registrar
            </button>
            {mensaje && (
              <p className="text-gray-600">{mensaje}</p>
            )}
          </form>
        </motion.div>
      )}
    </motion.div>
  );
};

export default Producto;