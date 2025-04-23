import React, { useState, useEffect, ChangeEvent, FormEvent } from 'react';
import axios from 'axios';

const API_URL = 'http://localhost:4000/marca';

const Marca: React.FC = () => {
  const [nombre, setNombre] = useState('');
  const [descripcion, setDescripcion] = useState('');
  const [mensaje, setMensaje] = useState('');
  const [marcas, setMarcas] = useState([]);

  // Traer marcas desde el backend
  const obtenerMarcas = async () => {
    try {
      const res = await axios.get(API_URL);
      setMarcas(res.data);
    } catch (error) {
      console.error('Error al obtener las marcas:', error);
    }
  };

  // Ejecutar al montar el componente
  useEffect(() => {
    obtenerMarcas();
  }, []);

  // Registrar nueva marca
  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    try {
      await axios.post(API_URL, { nombre, descripcion });
      setMensaje('Marca registrada con éxito.');
      setNombre('');
      setDescripcion('');
      obtenerMarcas(); 
    } catch (error) {
      console.error('Error al registrar la marca:', error);
      setMensaje('Error al registrar la marca.');
    }
  };

  return (
    <div className="flex min-h-screen">
      {/* Formulario para nueva marca */}
      <div className="w-1/3 p-8">
        <h2 className="font-bold text-center">Marca</h2>
        <h3 className="">Nueva Marca</h3>
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
            placeholder="Descripción"
            value={descripcion}
            onChange={(e: ChangeEvent<HTMLInputElement>) => setDescripcion(e.target.value)}
            className="w-full p-1.5 border border-gray-300 rounded"
          />
          <button
            type="submit"
            className="bg-blue-600 text-white px-2 py-1 rounded hover:bg-blue-800"
          >Registrar</button>

          {mensaje && <p className="text-green-600">{mensaje}</p>}
        </form>
      </div>

      {/* Listado de Marcas existentes */}
      <div className="w-2/3 p-8">
        <h3 className="font-bold mb-4">Listado de Marcas</h3>
        <table className="w-full">
          <thead>
            <tr>
              <th className="px-4 py-2 text-left">Nombre</th>
              <th className="px-4 py-2 text-left">Descripción</th>
              <th className="px-4 py-2 text-left">Modificar</th>
              <th className="px-4 py-2 text-left">Eliminar</th>
            </tr>
          </thead>
          <tbody>
            {marcas.map((marca: any) => (
              <tr key={marca.id}>
                <td className="px-4 py-2">{marca.nombre}</td>
                <td className="px-4 py-2">{marca.descripcion}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Marca;
