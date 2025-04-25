import React, { useState, useEffect, ChangeEvent, FormEvent } from "react";
import axios from "axios";
import { PencilSquareIcon } from "@heroicons/react/24/outline";
import { TrashIcon } from "@heroicons/react/24/outline";

const API_URL = "http://localhost:4000/proveedor";

const Proveedor: React.FC = () => {
  const [nombre, setNombre] = useState("");
  const [codigo, setCodigo] = useState("");
  const [telefono, setTelefono] = useState("");
  const [cuit, setCuit] = useState("");
  const [mensaje, setMensaje] = useState("");
  const [proveedores, setProveedores] = useState([]);

  // Traer proveedores desde el backend
  const obtenerProveedores = async () => {
    try {
      const res = await axios.get(API_URL);
      setProveedores(res.data);
    } catch (error) {
      console.error("Error al obtener los proveedores:", error);
    }
  };

  // Ejecutar al montar el componente
  useEffect(() => {
    obtenerProveedores();
  }, []);

  // Registrar nuevo proveedor
  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    try {
      await axios.post(API_URL, { nombre, codigo, telefono, cuit });
      setMensaje("Proveedor registrado con éxito.");
      setNombre("");
      setCodigo("");
      setTelefono("");
      setCuit("");
      obtenerProveedores();
    } catch (error) {
      console.error("Error al registrar el proveedor:", error);
      setMensaje("Error al registrar el proveedor.");
    }
  };

  return (
    <div className="flex min-h-screen bg-gray-600">
      {/* Formulario para nuevo proveedor */}
      <div className="w-1/3 p-10 ml-60">
        <h2 className="font-bold mb-4 text-center text-gray-200">
          Nuevo Proveedor
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
            placeholder="Codigo"
            value={codigo}
            onChange={(e: ChangeEvent<HTMLInputElement>) =>
              setCodigo(e.target.value)
            }
            className="w-full p-1.5 border border-gray-300 rounded"
          />
          <input
            type="text"
            placeholder="Telefono"
            value={telefono}
            onChange={(e: ChangeEvent<HTMLInputElement>) =>
              setTelefono(e.target.value)
            }
            className="w-full p-1.5 border border-gray-300 rounded"
          />
          <input
            type="text"
            placeholder="Cuit"
            value={cuit}
            onChange={(e: ChangeEvent<HTMLInputElement>) =>
              setCuit(e.target.value)
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

      {/* Listado de Proveedores existentes */}
      <div className="w-2/3 w-full p-10">
        <h3 className="font-bold mb-4 text-center text-gray-200">Listado de Proveedores</h3>
        <table className="w-full border-collapse rounded-lg overflow-hidden shadow-md border border-indigo-200 bg-gray-100">
          <thead>
            <tr className="bg-indigo-100">
              <th className="border px-4 py-2 text-left text-sm font-semibold">
                Nombre
              </th>
              <th className="border px-4 py-2 text-left text-sm font-semibold">
                Codigo
              </th>
              <th className="border px-4 py-2 text-left text-sm font-semibold">
                Telefono
              </th>
              <th className="border px-4 py-2 text-left text-sm font-semibold">
                Cuit
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
            {proveedores.map((proveedor: any) => (
              <tr key={proveedor.id}>
                <td className="px-4 py-2">{proveedor.nombre}</td>
                <td className="px-4 py-2">{proveedor.codigo}</td>
                <td className="px-4 py-2">{proveedor.telefono}</td>
                <td className="px-4 py-2">{proveedor.cuit}</td>
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

export default Proveedor;
