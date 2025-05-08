import React, { useState, useEffect, ChangeEvent, FormEvent } from "react";
import axios from "axios";
import { PencilSquareIcon, TrashIcon } from "@heroicons/react/24/outline";
import { motion } from "framer-motion";

// URL base para los endpoints relacionados con proveedores
const API_URL = "http://localhost:4000/proveedor";

const Proveedor: React.FC = () => {
  // Estados para gestionar los inputs del formulario, lista de proveedores y estados de la UI
  const [nombre, setNombre] = useState("");
  const [codigo, setCodigo] = useState("");
  const [telefono, setTelefono] = useState("");
  const [cuit, setCuit] = useState("");
  const [mensaje, setMensaje] = useState("");
  const [proveedores, setProveedores] = useState([]);
  const [todosLosProveedores, setTodosLosProveedores] = useState([]);
  const [filtroNombre, setFiltroNombre] = useState("");
  const [mostrarFormulario, setMostrarFormulario] = useState(false);
  const [modoEdicion, setModoEdicion] = useState(false);
  const [idProveedorEditar, setIdProveedorEditar] = useState<number | null>(null);

  // Obtiene todos los proveedores desde la API y actualiza el estado
  const obtenerProveedores = async () => {
    try {
      const res = await axios.get(API_URL);
      setProveedores(res.data);
      setTodosLosProveedores(res.data);
    } catch (error) {
      console.error("Error al obtener los proveedores:", error);
    }
  };

  // Filtra los proveedores según el texto de búsqueda
  const filtrarProveedores = (nombreFiltro: string) => {
    const resultado = todosLosProveedores.filter((proveedor: any) =>
      proveedor.nombre.toLowerCase().includes(nombreFiltro.toLowerCase())
    );
    setProveedores(resultado);
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
        setMensaje("Proveedor actualizado con éxito.");
      } else {
        await axios.post(API_URL, { nombre, codigo, telefono:parseInt(telefono), cuit:parseInt(cuit) });
        setMensaje("Proveedor registrado con éxito.");
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
      setMensaje("Error al registrar/actualizar el proveedor.");
    }
  };

  // Elimina un proveedor tras confirmación del usuario
  const handleEliminarProveedor = async (id: number) => {
    const confirmacion = window.confirm("¿Estás seguro que querés eliminar este proveedor?");
    if (!confirmacion) return;

    try {
      await axios.delete(`${API_URL}/softDelete/${id}`);
      alert("Proveedor eliminado correctamente");
      obtenerProveedores();
    } catch (error) {
      console.error("Error:", error);
      alert("Error al eliminar el proveedor");
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

  return (
    <motion.div
      className="flex min-h-screen bg-gray-600"
      layout
    >
      {/* Sección de Listado de Proveedores */}
      <motion.div
        className="flex-1 p-8 ml-60"
        layout
        transition={{ duration: 0.2 }}
      >
        <div className="flex justify-between items-center mb-4">
          <h3 className="font-bold text-gray-200 mt-2">
            Listado de Proveedores
          </h3>
          <button
            onClick={() => setMostrarFormulario(true)}
            className="w-1/7 py-2 px-4 bg-indigo-500 text-white rounded-lg border border-indigo-500 hover:bg-indigo-600 focus:ring-1 focus:ring-indigo-300 transition"
          >
            Nuevo Proveedor
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
              <th className="border px-4 py-2 text-left text-sm font-semibold">Teléfono</th>
              <th className="border px-4 py-2 text-left text-sm font-semibold">CUIT</th>
              <th className="border px-4 py-2 text-center text-sm font-semibold">Modificar</th>
              <th className="border px-4 py-2 text-center text-sm font-semibold">Eliminar</th>
            </tr>
          </thead>
          <tbody>
            {proveedores.map((proveedor: any) => (
              <tr
                key={proveedor.id}
                className="hover:bg-gray-200"
              >
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
      </motion.div>

      {/* Sección de Formulario para Nuevo Proveedor */}
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
            Nuevo Proveedor
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
              type="number"
              placeholder="Teléfono"
              value={telefono}
              onChange={(e: ChangeEvent<HTMLInputElement>) => setTelefono(e.target.value)}
              className="w-full p-1.5 border border-gray-300 rounded" required
            />
            <input
              type="number"
              placeholder="CUIT"
              value={cuit}
              onChange={(e: ChangeEvent<HTMLInputElement>) => setCuit(e.target.value)}
              className="w-full p-1.5 border border-gray-300 rounded" required
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

export default Proveedor;