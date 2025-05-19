import React, { useState, useEffect, ChangeEvent, FormEvent } from "react";
import axios from "axios";
import { EyeIcon, XMarkIcon } from "@heroicons/react/24/outline";
import { motion } from "framer-motion";

const API_URL = "http://localhost:4000/movimiento";
const PRODUCTOS_API_URL = "http://localhost:4000/producto";

const Movimiento: React.FC = () => {
  // Estados para gestionar los inputs del formulario, lista de movimientos y estados de la UI
  const [nombre, setNombre] = useState("");
  const [mensaje, setMensaje] = useState("");
  const [movimientos, setMovimientos] = useState([]);
  const [todosLosMovimientos, setTodosLosMovimientos] = useState([]);
  const [filtroNombre, setFiltroNombre] = useState("");
  // Estados para el modal de ingreso
  const [mostrarModalIngreso, setMostrarModalIngreso] = useState(false);
  const [costo, setCosto] = useState("");
  const [productos, setProductos] = useState<any[]>([]);
  const [todosLosProductos, setTodosLosProductos] = useState<any[]>([]);
  const [productosSeleccionados, setProductosSeleccionados] = useState<number[]>([]);
  const [cantidades, setCantidades] = useState<{ [key: number]: string }>({});
  const [filtroProductos, setFiltroProductos] = useState("");
  // Estado para el modal de ver movimiento
  const [mostrarModalVer, setMostrarModalVer] = useState(false);
  const [movimientoSeleccionado, setMovimientoSeleccionado] = useState<any | null>(null);
  // Estado para el modal de egreso
  const [mostrarModalEgreso, setMostrarModalEgreso] = useState(false);

  // Obtiene todos los movimientos desde la API
  const obtenerMovimientos = async () => {
    try {
      const res = await axios.get(API_URL);
      setMovimientos(res.data);
      setTodosLosMovimientos(res.data);
    } catch (error) {
      console.error("Error al obtener los movimientos:", error);
    }
  };

  // Obtiene todos los productos desde la API
  const obtenerProductos = async () => {
    try {
      const res = await axios.get(PRODUCTOS_API_URL);
      // Filtrar productos que NO están eliminados (sin deletedAt)
      const productosFiltrados = res.data.filter(
        (producto: any) => !producto.deletedAt
      );
      setProductos(productosFiltrados);
      setTodosLosProductos(productosFiltrados);
    } catch (error) {
      console.error("Error al obtener los productos:", error);
    }
  };

  // Filtra los movimientos según el texto de búsqueda
  const filtrarMovimientos = (nombreFiltro: string) => {
    const resultado = todosLosMovimientos.filter((movimiento: any) =>
      movimiento.nombre.toLowerCase().includes(nombreFiltro.toLowerCase())
    );
    setMovimientos(resultado);
  };

  // Filtra los productos según el texto de búsqueda en el modal
  const filtrarProductosModal = (nombreFiltro: string) => {
    const resultado = todosLosProductos.filter((producto: any) =>
      producto.nombre.toLowerCase().includes(nombreFiltro.toLowerCase())
    );
    setProductos(resultado);
  };

  // Maneja el envío del formulario del modal de ingreso
  const handleSubmitIngreso = async (e: FormEvent) => {
    e.preventDefault();
    if (!costo || !nombre || productosSeleccionados.length === 0) {
      setMensaje("Todos los campos son obligatorios y debe seleccionar al menos un producto.");
      return;
    }

    // Validar que todos los productos seleccionados tengan una cantidad válida
    for (const id of productosSeleccionados) {
      if (!cantidades[id] || parseInt(cantidades[id]) <= 0) {
        setMensaje("Debe especificar una cantidad válida para cada producto seleccionado.");
        return;
      }
    }

    try {
      // Calcular la suma total de las cantidades
      const totalCantidades = productosSeleccionados.reduce(
        (sum, id) => sum + parseInt(cantidades[id]),
        0
      );
      if (totalCantidades <= 0) {
        setMensaje("La suma total de las cantidades debe ser mayor que cero.");
        return;
      }

      // Parsear el costo total
      const costoTotal = parseFloat(costo);
      if (isNaN(costoTotal) || costoTotal <= 0) {
        setMensaje("El costo debe ser un número válido mayor que cero.");
        return;
      }

      // Crear un movimiento por cada producto seleccionado
      for (const id of productosSeleccionados) {
        const cantidad = parseInt(cantidades[id]);
        // Calcular el costo proporcional: (cantidad / totalCantidades) * costoTotal
        const costoProporcional = (cantidad / totalCantidades) * costoTotal;
        const movimiento = {
          nombre,
          tipoMovimiento: 0, // 0 para INGRESO
          costo: costoProporcional,
          producto: id,
          cantidad,
        };
        console.log("JSON del movimiento a enviar:", JSON.stringify(movimiento, null, 2));
        await axios.post(API_URL, movimiento);
      }
      setMensaje("Movimientos de ingreso registrados con éxito.");
      setCosto("");
      setNombre("");
      setProductosSeleccionados([]);
      setCantidades({});
      setFiltroProductos("");
      setMostrarModalIngreso(false);
      obtenerMovimientos();
    } catch (error) {
      console.error("Error al registrar los movimientos de ingreso:", error);
      setMensaje("Error al registrar los movimientos de ingreso.");
    }
  };

    // Maneja el envío del formulario del modal de egreso
  const handleSubmitEgreso = async (e: FormEvent) => {
    e.preventDefault();
    if (!nombre || productosSeleccionados.length === 0) {
      setMensaje("Todos los campos son obligatorios y debe seleccionar al menos un producto.");
      return;
    }

    // Validar que todos los productos seleccionados tengan una cantidad válida
    for (const id of productosSeleccionados) {
      if (!cantidades[id] || parseInt(cantidades[id]) <= 0) {
        setMensaje("Debe especificar una cantidad válida para cada producto seleccionado.");
        return;
      }
    }

    try {
      // Calcular la suma total de las cantidades
      const totalCantidades = productosSeleccionados.reduce(
        (sum, id) => sum + parseInt(cantidades[id]),
        0
      );
      if (totalCantidades <= 0) {
        setMensaje("La suma total de las cantidades debe ser mayor que cero.");
        return;
      }

      // Crear un movimiento por cada producto seleccionado
      for (const id of productosSeleccionados) {
        const cantidad = parseInt(cantidades[id]);
        const movimiento = {
          nombre,
          tipoMovimiento: 1, // 1 para EGRESO
          producto: id,
          cantidad,
        };
        console.log("JSON del movimiento a enviar:", JSON.stringify(movimiento, null, 2));
        await axios.post(API_URL, movimiento);
      }
      setMensaje("Movimientos de egreso registrados con éxito.");
      setCosto("");
      setNombre("");
      setProductosSeleccionados([]);
      setCantidades({});
      setFiltroProductos("");
      setMostrarModalEgreso(false);
      obtenerMovimientos();
    } catch (error) {
      console.error("Error al registrar los movimientos de egreso:", error);
      setMensaje("Error al registrar los movimientos de egreso.");
    }
  };

  // Maneja la visualización de un movimiento (acción para el botón Ver)
  const handleVerMovimiento = (movimiento: any) => {
    setMovimientoSeleccionado(movimiento);
    setMostrarModalVer(true);
  };

  // Maneja la selección de productos en el modal
  const handleSeleccionProducto = (id: number) => {
    setProductosSeleccionados((prev) =>
      prev.includes(id) ? prev.filter((pid) => pid !== id) : [...prev, id]
    );
  };

  // Maneja el cambio en el campo de cantidad
  const handleCantidadChange = (id: number, value: string) => {
    setCantidades((prev) => ({
      ...prev,
      [id]: value,
    }));
  };

  // Efectos para la carga inicial de datos y filtrado
  useEffect(() => {
    obtenerMovimientos();
    obtenerProductos();
  }, []);

  // Actualiza los movimientos mostrados según el filtro de búsqueda
  useEffect(() => {
    if (filtroNombre.trim() === "") {
      setMovimientos(todosLosMovimientos);
    } else {
      filtrarMovimientos(filtroNombre);
    }
  }, [filtroNombre, todosLosMovimientos]);

  // Actualiza los productos mostrados en el modal según el filtro
  useEffect(() => {
    if (filtroProductos.trim() === "") {
      setProductos(todosLosProductos);
    } else {
      filtrarProductosModal(filtroProductos);
    }
  }, [filtroProductos, todosLosProductos]);

  // Abre el modal para registrar un ingreso
  const handleRegistrarIngreso = () => {
    setCosto("");
    setNombre("");
    setProductosSeleccionados([]);
    setCantidades({});
    setFiltroProductos("");
    setMostrarModalIngreso(true);
  };

  // Abre el modal para registrar un egreso
  const handleRegistrarEgreso = () => {
    setCosto("");
    setNombre("");
    setProductosSeleccionados([]);
    setCantidades({});
    setFiltroProductos("");
    setMostrarModalEgreso(true);
  };

  return (
    <motion.div className="flex min-h-screen bg-gray-600" layout>
      {/* Sección de Listado de Movimientos */}
      <motion.div className="flex-1 p-8 ml-60" layout transition={{ duration: 0.2 }}>
        <div className="flex justify-between items-center mb-4">
          <h3 className="font-bold text-gray-200 mt-2">Listado de Movimientos</h3>
          <div className="flex gap-2">
            <button
              onClick={handleRegistrarIngreso}
              className="py-2 px-4 bg-indigo-500 text-white rounded-lg border border-indigo-500 hover:bg-indigo-600 focus:ring-1 focus:ring-indigo-300 transition"
            >
              Registrar Ingreso
            </button>
            <button
              onClick={handleRegistrarEgreso}
              className="py-2 px-4 bg-indigo-500 text-white rounded-lg border border-indigo-500 hover:bg-indigo-600 focus:ring-1 focus:ring-indigo-300 transition"
            >
              Registrar Egreso
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
              <th className="border px-4 py-2 text-left text-sm font-semibold">Código Movimiento</th>
              <th className="border px-4 py-2 text-left text-sm font-semibold">Tipo Movimiento</th>
              <th className="border px-4 py-2 text-left text-sm font-semibold">Nombre</th>
              <th className="border px-4 py-2 text-left text-sm font-semibold">Fecha</th>
              <th className="border px-4 py-2 text-center text-sm font-semibold">Ver</th>
            </tr>
          </thead>
          <tbody>
            {movimientos.map((movimiento: any) => (
              <tr key={movimiento.id} className="hover:bg-gray-200">
                <td className="border px-4 py-2 text-sm">{movimiento.codigo}</td>
                <td className="border px-4 py-2 text-sm">
                  {movimiento.tipoMovimiento === 0 ? "Ingreso" : "Egreso"}
                </td>
                <td className="border px-4 py-2 text-sm">{movimiento.nombre}</td>
                <td className="border px-4 py-2 text-sm">{movimiento.fecha.split("T")[0]}</td>
                <td
                  className="border px-4 py-2 text-green-600 text-center cursor-pointer hover:text-green-700"
                  onClick={() => handleVerMovimiento(movimiento)}
                >
                  <EyeIcon className="h-5 w-5 mx-auto" />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </motion.div>
      
      {/* Modal para Registrar Ingreso */}
      {mostrarModalIngreso && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
        >
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.8, opacity: 0 }}
            className="bg-gray-600 p-6 rounded-lg shadow-lg w-3/4 max-w-4xl"
          >
            <div className="flex justify-between items-center mb-4">
              <h2 className="font-bold text-gray-200 text-xl">Registrar Ingreso</h2>
              <button
                onClick={() => setMostrarModalIngreso(false)}
                className="text-gray-200 hover:text-gray-400"
              >
                <XMarkIcon className="h-6 w-6" />
              </button>
            </div>
            <form onSubmit={handleSubmitIngreso} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <input
                  type="text"
                  placeholder="Nombre"
                  value={nombre}
                  onChange={(e: ChangeEvent<HTMLInputElement>) => setNombre(e.target.value)}
                  className="w-full p-1.5 border border-gray-300 rounded"
                  required
                />
                <input
                  type="number"
                  placeholder="Costo"
                  value={costo}
                  onChange={(e: ChangeEvent<HTMLInputElement>) => setCosto(e.target.value)}
                  className="w-full p-1.5 border border-gray-300 rounded"
                  required
                  step="0.01"
                />
              </div>
              <div className="mt-4">
                <h3 className="font-semibold text-gray-200 mb-2">Seleccionar Productos</h3>
                <div className="mb-4">
                  <input
                    type="text"
                    placeholder="Filtrar por nombre..."
                    value={filtroProductos}
                    onChange={(e) => setFiltroProductos(e.target.value)}
                    className="w-full p-1.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-500 transition"
                  />
                </div>
                <div className="max-h-80 overflow-y-auto">
                  <table className="w-full border-collapse rounded-lg shadow-md border border-indigo-200 bg-gray-100">
                    <thead>
                      <tr className="bg-indigo-100 sticky top-0">
                        <th className="border px-4 py-2 text-left text-sm font-semibold">Seleccionar</th>
                        <th className="border px-4 py-2 text-left text-sm font-semibold">Nombre</th>
                        <th className="border px-4 py-2 text-left text-sm font-semibold">Código</th>
                        <th className="border px-4 py-2 text-left text-sm font-semibold">Categoría</th>
                        <th className="border px-4 py-2 text-left text-sm font-semibold">Proveedor</th>
                        <th className="border px-4 py-2 text-left text-sm font-semibold">Cantidad</th>
                      </tr>
                    </thead>
                    <tbody>
                      {productos.map((producto: any) => (
                        <tr key={producto.id} className="hover:bg-gray-200">
                          <td className="border px-4 py-2 text-sm">
                            <input
                              type="checkbox"
                              checked={productosSeleccionados.includes(producto.id)}
                              onChange={() => handleSeleccionProducto(producto.id)}
                              className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                            />
                          </td>
                          <td className="border px-4 py-2 text-sm">{producto.nombre}</td>
                          <td className="border px-4 py-2 text-sm">{producto.codigo}</td>
                          <td className="border px-4 py-2 text-sm">{producto.categoria.nombre}</td>
                          <td className="border px-4 py-2 text-sm">{producto.proveedor.nombre}</td>
                          <td className="border px-4 py-2 text-sm">
                            <input
                              type="number"
                              placeholder="Cantidad"
                              value={cantidades[producto.id] || ""}
                              onChange={(e) => handleCantidadChange(producto.id, e.target.value)}
                              className="w-full p-1.5 border border-gray-300 rounded"
                              disabled={!productosSeleccionados.includes(producto.id)}
                              min="1"
                            />
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
              <button
                type="submit"
                className="w-full py-2 px-4 bg-indigo-500 text-white rounded-lg border border-indigo-500 hover:bg-indigo-600 focus:ring-1 focus:ring-indigo-300 transition"
              >
                Registrar Movimiento
              </button>
              {mensaje && <p className="text-green-600">{mensaje}</p>}
            </form>
          </motion.div>
        </motion.div>
      )}

      {/* Modal para Registrar Egreso */}
      {mostrarModalEgreso && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
        >
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.8, opacity: 0 }}
            className="bg-gray-600 p-6 rounded-lg shadow-lg w-3/4 max-w-4xl"
          >
            <div className="flex justify-between items-center mb-4">
              <h2 className="font-bold text-gray-200 text-xl">Registrar Egreso</h2>
              <button
                onClick={() => setMostrarModalEgreso(false)}
                className="text-gray-200 hover:text-gray-400"
              >
                <XMarkIcon className="h-6 w-6" />
              </button>
            </div>
            <form onSubmit={handleSubmitEgreso} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <input
                  type="text"
                  placeholder="Nombre"
                  value={nombre}
                  onChange={(e: ChangeEvent<HTMLInputElement>) => setNombre(e.target.value)}
                  className="w-full p-1.5 border border-gray-300 rounded"
                />
              </div>
              <div className="mt-4">
                <h3 className="font-semibold text-gray-200 mb-2">Seleccionar Productos</h3>
                <div className="mb-4">
                  <input
                    type="text"
                    placeholder="Filtrar por nombre..."
                    value={filtroProductos}
                    onChange={(e) => setFiltroProductos(e.target.value)}
                    className="w-full p-1.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-500 transition"
                  />
                </div>
                <div className="max-h-80 overflow-y-auto">
                  <table className="w-full border-collapse rounded-lg shadow-md border border-indigo-200 bg-gray-100">
                    <thead>
                      <tr className="bg-indigo-100 sticky top-0">
                        <th className="border px-4 py-2 text-left text-sm font-semibold">Seleccionar</th>
                        <th className="border px-4 py-2 text-left text-sm font-semibold">Nombre</th>
                        <th className="border px-4 py-2 text-left text-sm font-semibold">Código</th>
                        <th className="border px-4 py-2 text-left text-sm font-semibold">Categoría</th>
                        <th className="border px-4 py-2 text-left text-sm font-semibold">Proveedor</th>
                        <th className="border px-4 py-2 text-left text-sm font-semibold">Cantidad</th>
                      </tr>
                    </thead>
                    <tbody>
                      {productos.map((producto: any) => (
                        <tr key={producto.id} className="hover:bg-gray-200">
                          <td className="border px-4 py-2 text-sm">
                            <input
                              type="checkbox"
                              checked={productosSeleccionados.includes(producto.id)}
                              onChange={() => handleSeleccionProducto(producto.id)}
                              className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                            />
                          </td>
                          <td className="border px-4 py-2 text-sm">{producto.nombre}</td>
                          <td className="border px-4 py-2 text-sm">{producto.codigo}</td>
                          <td className="border px-4 py-2 text-sm">{producto.categoria.nombre}</td>
                          <td className="border px-4 py-2 text-sm">{producto.proveedor.nombre}</td>
                          <td className="border px-4 py-2 text-sm">
                            <input
                              type="number"
                              placeholder="Cantidad"
                              value={cantidades[producto.id] || ""}
                              onChange={(e) => handleCantidadChange(producto.id, e.target.value)}
                              className="w-full p-1.5 border border-gray-300 rounded"
                              disabled={!productosSeleccionados.includes(producto.id)}
                              min="1"
                            />
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
              <button
                type="submit"
                className="w-full py-2 px-4 bg-indigo-500 text-white rounded-lg border border-indigo-500 hover:bg-indigo-600 focus:ring-1 focus:ring-indigo-300 transition"
              >
                Registrar Movimiento
              </button>
            </form>
          </motion.div>
        </motion.div>
      )}

      {/* Modal para Ver Movimiento */}
      {mostrarModalVer && movimientoSeleccionado && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3, ease: "easeOut" }}
          className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50"
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0, y: 50 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.9, opacity: 0, y: 50 }}
            transition={{ duration: 0.3, ease: "easeOut" }}
            className="bg-gradient-to-b from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-900 p-6 rounded-xl shadow-2xl w-11/12 max-w-lg"
          >
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-semibold text-gray-800 dark:text-gray-100 tracking-tight">
                Detalles del Movimiento
              </h2>
              <button
                onClick={() => setMostrarModalVer(false)}
                className="p-2 rounded-full bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600 transition-transform transform hover:scale-110"
              >
                <XMarkIcon className="h-5 w-5" />
              </button>
            </div>
            <div className="space-y-4 text-gray-700 dark:text-gray-200">
              <div className="flex items-center space-x-3">
                <span className="text-indigo-500 dark:text-indigo-400">
                  <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 7h10m0 0v10m0-10L7 17" />
                  </svg>
                </span>
                <p><strong className="font-medium">Código:</strong> {movimientoSeleccionado.codigo}</p>
              </div>
              <div className="flex items-center space-x-3">
                <span className="text-indigo-500 dark:text-indigo-400">
                  <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </span>
                <p><strong className="font-medium">Nombre:</strong> {movimientoSeleccionado.nombre}</p>
              </div>
              <div className="flex items-center space-x-3">
                <span className="text-indigo-500 dark:text-indigo-400">
                  <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                  </svg>
                </span>
                <p><strong className="font-medium">Tipo:</strong> {movimientoSeleccionado.tipoMovimiento === 0 ? "Ingreso" : "Egreso"}</p>
              </div>
              <div className="flex items-center space-x-3">
                <span className="text-indigo-500 dark:text-indigo-400">
                  <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                </span>
                <p><strong className="font-medium">Fecha:</strong> {movimientoSeleccionado.fecha.split("T")[0] || "No especificada"}</p>
              </div>
              {movimientoSeleccionado.producto && (
                <div className="flex items-center space-x-3">
                  <span className="text-indigo-500 dark:text-indigo-400">
                    <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                    </svg>
                  </span>
                  <p><strong className="font-medium">Producto:</strong> {movimientoSeleccionado.producto.nombre}</p>
                </div>
              )}
              {movimientoSeleccionado.cantidad && (
                <div className="flex items-center space-x-3">
                  <span className="text-indigo-500 dark:text-indigo-400">
                    <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20 12H4" />
                    </svg>
                  </span>
                  <p><strong className="font-medium">Cantidad:</strong> {movimientoSeleccionado.cantidad}</p>
                </div>
              )}
              {movimientoSeleccionado.costo && (
                <div className="flex items-center space-x-3">
                  <span className="text-indigo-500 dark:text-indigo-400">
                    <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </span>
                  <p><strong className="font-medium">Costo:</strong> ${movimientoSeleccionado.costo.toFixed(2)}</p>
                </div>
              )}
            </div>
            <button
              onClick={() => setMostrarModalVer(false)}
              className="mt-6 w-full py-2.5 px-4 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 focus:ring-2 focus:ring-indigo-400 focus:ring-opacity-50 transition-all duration-200"
            >
              Cerrar
            </button>
          </motion.div>
        </motion.div>
      )}
    </motion.div>
  );
};

export default Movimiento;