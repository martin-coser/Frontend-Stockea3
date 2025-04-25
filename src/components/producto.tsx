import React, { useState, useEffect, ChangeEvent, FormEvent } from 'react';
import axios from 'axios';
import { PencilSquareIcon } from '@heroicons/react/24/outline';
import { TrashIcon } from '@heroicons/react/24/outline';

const API_URL = 'http://localhost:4000/producto';

const Producto: React.FC = () => {
  const [nombre, setNombre] = useState('');
  const [codigo, setCodigo] = useState('');
  const [descripcion, setDescripcion] = useState('');
  const [precioIngreso, setPrecioIngreso] = useState('');
  const [precioEgreso, setPrecioEgreso] = useState('');
  const [marca, setMarca] = useState('');
  const [proveedor, setProveedor] = useState('');
  const [categoria, setCategoria] = useState('');
  const [mensaje, setMensaje] = useState('');
  const [productos, setProductos] = useState([]);

  // Traer categorias desde el backend
  const obtenerProductos = async () => {
    try {
      const res = await axios.get(API_URL);
      setProductos(res.data);
    } catch (error) {
      console.error('Error al obtener los productos:', error);
    }
  };

  // Ejecutar al montar el componente
  useEffect(() => {
    obtenerProductos();
  }, []);

  // Registrar nuevo producto
  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    try {
      await axios.post(API_URL, { nombre, codigo, descripcion, precioIngreso, precioEgreso, marca, categoria, proveedor });
      setMensaje('Producto registrada con éxito.');
      setNombre('');
      setCodigo('');
      setDescripcion('');
      setPrecioIngreso('');
      setPrecioEgreso('');
      setMarca('');
      setCategoria('');
      setProveedor('');
      obtenerProductos();
    } catch (error) {
      console.error('Error al registrar el producto:', error);
      setMensaje('Error al registrar el producto.');
    }
  };

  return (
    <div className="flex min-h-screen bg-gray-600">
      {/* Formulario para nuevo producto */}
      <div className="w-1/3 p-10 ml-60">
        <h2 className="font-bold mb-4 text-center text-gray-200">Nuevo Producto</h2>
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
            placeholder="Descripcion"
            value={descripcion}
            onChange={(e: ChangeEvent<HTMLInputElement>) => setDescripcion(e.target.value)}
            className="w-full p-1.5 border border-gray-300 rounded"
          />
          <input
            type="text"
            placeholder="PrecioIngreso"
            value={precioIngreso}
            onChange={(e: ChangeEvent<HTMLInputElement>) => setPrecioIngreso(e.target.value)}
            className="w-full p-1.5 border border-gray-300 rounded"
          />
          <input
            type="text"
            placeholder="PrecioEgreso"
            value={precioEgreso}
            onChange={(e: ChangeEvent<HTMLInputElement>) => setPrecioEgreso(e.target.value)}
            className="w-full p-1.5 border border-gray-300 rounded"
          />
          <input
            type="text"
            placeholder="Marca"
            value={marca}
            onChange={(e: ChangeEvent<HTMLInputElement>) => setMarca(e.target.value)}
            className="w-full p-1.5 border border-gray-300 rounded"
          />
          <input
            type="text"
            placeholder="Categoria"
            value={categoria}
            onChange={(e: ChangeEvent<HTMLInputElement>) => setCategoria(e.target.value)}
            className="w-full p-1.5 border border-gray-300 rounded"
          />
          <input
            type="text"
            placeholder="Proveedor"
            value={proveedor}
            onChange={(e: ChangeEvent<HTMLInputElement>) => setProveedor(e.target.value)}
            className="w-full p-1.5 border border-gray-300 rounded"
          />
          <button
            type="submit"
            className="w-full py-2 px-4 bg-indigo-500 text-white rounded-lg border border-indigo-500 hover:bg-indigo-600 focus:ring-4 focus:ring-indigo-300 transition"
          >Registrar</button>

          {mensaje && <p className="text-green-600">{mensaje}</p>}
        </form>
      </div>

      {/* Listado de Productos existentes */}
      <div className="w-2/3 w-full p-8">
        <h3 className="font-bold mb-6 text-center text-gray-200">Listado de Productos</h3>
        <table className="w-full border-collapse rounded-lg overflow-hidden shadow-md border border-indigo-200 bg-gray-100">
          <thead>
            <tr className="bg-indigo-100">
              <th className="border px-4 py-2 text-left text-sm font-semibold">Nombre</th>
              <th className="border px-4 py-2 text-left text-sm font-semibold">Codigo</th>
              <th className="border px-4 py-2 text-left text-sm font-semibold">Descripcion</th>
              <th className="border px-4 py-2 text-left text-sm font-semibold">PIngreso</th>
              <th className="border px-4 py-2 text-left text-sm font-semibold">PEgreso</th>
              <th className="border px-4 py-2 text-left text-sm font-semibold">Marca</th>
              <th className="border px-4 py-2 text-left text-sm font-semibold">Categoria</th>
              <th className="border px-4 py-2 text-left text-sm font-semibold">Modificar</th>
              <th className="border px-4 py-2 text-left text-sm font-semibold">Eliminar</th>
            </tr>
          </thead>
          <tbody>
            {productos.map((producto: any) => (
              <tr key={producto.id}>
                <td className="px-4 py-2">{producto.nombre}</td>
                <td className="px-4 py-2">{producto.codigo}</td>
                <td className="px-4 py-2">{producto.descripcion}</td>
                <td className="px-4 py-2">{producto.precioIngreso}</td>
                <td className="px-4 py-2">{producto.precioEgreso}</td>
                <td className="px-4 py-2">{producto.marca}</td>
                <td className="px-4 py-2">{producto.categoria}</td>
                <td className="px-4 py-2 text-blue-600 cursor-pointer"><PencilSquareIcon className=" h-5 w-5 text-blue-600 ml-6" /></td>
                <td className="px-4 py-2 text-red-600 cursor-pointer"><TrashIcon className="h-5 w-5 text-red-600 ml-5" /></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Producto;