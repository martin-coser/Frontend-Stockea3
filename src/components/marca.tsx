import React, { useState, useEffect, ChangeEvent, FormEvent } from 'react';
import axios from 'axios';
import { PencilSquareIcon } from '@heroicons/react/24/outline';
import { TrashIcon } from '@heroicons/react/24/outline';

const API_URL = 'http://localhost:4000/marca';

const Marca: React.FC = () => {
  const [nombre, setNombre] = useState('');
  const [descripcion, setDescripcion] = useState('');
  const [mensaje, setMensaje] = useState('');
  const [marcas, setMarcas] = useState([]);
  const [todasLasMarcas, setTodasLasMarcas] = useState([]); // Nuevo estado
  const [filtroNombre, setFiltroNombre] = useState('');

  // Traer todas las marcas
  const obtenerMarcas = async () => {
    try {
      const res = await axios.get(API_URL);
      setMarcas(res.data);
      setTodasLasMarcas(res.data); // Guardamos todas
    } catch (error) {
      console.error('Error al obtener las marcas:', error);
    }
  };

  // Filtrar marcas por nombre (solo en frontend)
  const filtrarMarcas = (nombreFiltro: string) => {
    const resultado = todasLasMarcas.filter((marca: any) =>
      marca.nombre.toLowerCase().includes(nombreFiltro.toLowerCase())
    );
    setMarcas(resultado);
  };

  // Al cambiar el filtro de nombre
  useEffect(() => {
    if (filtroNombre.trim() === '') {
      setMarcas(todasLasMarcas); // Mostrar todas si no hay filtro
    } else {
      filtrarMarcas(filtroNombre);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filtroNombre, todasLasMarcas]);

  // Al montar componente
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
        <h2 className="font-bold text-center">Nueva Marca</h2>
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
            className="w-full py-2 px-4 bg-green-600 text-white rounded-lg hover:bg-green-700 focus:ring-4 focus:ring-green-300 transition"
          >
            Registrar
          </button>

          {mensaje && <p className="text-green-600">{mensaje}</p>}
        </form>
      </div>

      {/* Listado de marcas con filtro */}
      <div className="w-2/3 p-8">
        <h3 className="font-bold mb-4 text-center">Listado de Marcas</h3>

        <div className="mb-4">
          <input
            type="text"
            placeholder="Filtrar por nombre..."
            value={filtroNombre}
            onChange={(e) => setFiltroNombre(e.target.value)}
            className="w-1/2 p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 transition"
          />
        </div>

        <table className="w-full table-auto border-separate border-spacing-0">
          <thead>
            <tr className="bg-green-100">
              <th className="px-4 py-2 text-left text-sm font-semibold">Nombre</th>
              <th className="px-4 py-2 text-left text-sm font-semibold">Descripción</th>
              <th className="px-4 py-2 text-left text-sm font-semibold">Modificar</th>
              <th className="px-4 py-2 text-left text-sm font-semibold">Eliminar</th>
            </tr>
          </thead>
          <tbody>
            {marcas.map((marca: any) => (
              <tr key={marca.id} className="hover:bg-green-50">
                <td className="px-4 py-2 text-sm">{marca.nombre}</td>
                <td className="px-4 py-2 text-sm">{marca.descripcion}</td>
                <td className="px-4 py-2 text-blue-600 cursor-pointer hover:text-green-700">
                  <PencilSquareIcon className="h-5 w-5" />
                </td>
                <td className="px-4 py-2 text-red-600 cursor-pointer hover:text-red-700">
                  <TrashIcon className="h-5 w-5" />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div> 
  );
};

export default Marca;
