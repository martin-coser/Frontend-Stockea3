import React, { useState, useEffect, ChangeEvent, FormEvent } from 'react';
import axios from 'axios';

const API_URL = 'http://localhost:4000/proveedor';

const Proveedor: React.FC = () => {
  const [nombre, setNombre] = useState('');
  const [codigo, setCodigo] = useState('');
  const [telefono, setTelefono] = useState('');
  const [cuit, setCuit] = useState('');
  const [mensaje, setMensaje] = useState('');
  const [proveedores, setProveedores] = useState([]);

  // Traer proveedores desde el backend
  const obtenerProveedores = async () => {
    try {
      const res = await axios.get(API_URL);
      setProveedores(res.data);
    } catch (error) {
      console.error('Error al obtener los proveedores:', error);
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
      setMensaje('Proveedor registrado con éxito.');
      setNombre('');
      setCodigo('');
      setTelefono('');
      setCuit('');
      obtenerProveedores();
    } catch (error) {
      console.error('Error al registrar el proveedor:', error);
      setMensaje('Error al registrar el proveedor.');
    }
  };

  return (
    <div className="flex min-h-screen">
      {/* Formulario para nuevo proveedor */}
      <div className="w-1/3 p-8">
        <h2 className="font-bold text-center">Proveedor</h2>
        <h3 className="">Nuevo Proveedor</h3>
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
            placeholder="Codigo"
            value={codigo}
            onChange={(e: ChangeEvent<HTMLInputElement>) => setCodigo(e.target.value)}
            className="w-full p-1.5 border border-gray-300 rounded"
          />
          <input
            type="text"
            placeholder="Telefono"
            value={telefono}
            onChange={(e: ChangeEvent<HTMLInputElement>) => setTelefono(e.target.value)}
            className="w-full p-1.5 border border-gray-300 rounded"
          />
          <input
            type="text"
            placeholder="Cuit"
            value={cuit}
            onChange={(e: ChangeEvent<HTMLInputElement>) => setCuit(e.target.value)}
            className="w-full p-1.5 border border-gray-300 rounded"
          />
          <button
            type="submit"
            className="bg-blue-600 text-white px-2 py-1 rounded hover:bg-blue-800"
          >Registrar</button>

          {mensaje && <p className="text-green-600">{mensaje}</p>}
        </form>
      </div>

      {/* Listado de Proveedores existentes */}
      <div className="w-2/3 p-8">
        <h3 className="font-bold mb-4">Listado de Proveedores</h3>
        <table className="w-full">
          <thead>
            <tr>
              <th className="px-4 py-2 text-left">Nombre</th>
              <th className="px-4 py-2 text-left">Codigo</th>
              <th className="px-4 py-2 text-left">Telefono</th>
              <th className="px-4 py-2 text-left">Cuit</th>
              <th className="px-4 py-2 text-left">Modificar</th>
              <th className="px-4 py-2 text-left">Eliminar</th>
            </tr>
          </thead>
          <tbody>
            {proveedores.map((proveedor: any) => (
              <tr key={proveedor.id}>
                <td className="px-4 py-2">{proveedor.nombre}</td>
                <td className="px-4 py-2">{proveedor.codigo}</td>
                <td className="px-4 py-2">{proveedor.telefono}</td>
                <td className="px-4 py-2">{proveedor.cuit}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Proveedor;