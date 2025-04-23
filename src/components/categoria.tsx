import React, { useState, useEffect, ChangeEvent, FormEvent } from 'react';
import axios from 'axios';

const API_URL = 'http://localhost:4000/categoria';

const Categoria: React.FC = () => {
  const [nombre, setNombre] = useState('');
  const [descripcion, setDescripcion] = useState('');
  const [imagen, setImagen] = useState('');
  const [mensaje, setMensaje] = useState('');
  const [categorias, setCategorias] = useState([]);

  // Traer categorias desde el backend
  const obtenerCategorias = async () => {
    try {
      const res = await axios.get(API_URL);
      setCategorias(res.data);
    } catch (error) {
      console.error('Error al obtener las categorias:', error);
    }
  };

  // Ejecutar al montar el componente
  useEffect(() => {
    obtenerCategorias();
  }, []);

  // Registrar nueva categoria
  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    try {
      await axios.post(API_URL, { nombre, descripcion });
      setMensaje('Marca registrada con éxito.');
      setNombre('');
      setDescripcion('');
      setImagen('');
      obtenerCategorias();
    } catch (error) {
      console.error('Error al registrar la categoria:', error);
      setMensaje('Error al registrar la categoria.');
    }
  };

  return (
    <div className="flex min-h-screen">
      {/* Formulario para nueva categoria */}
      <div className="w-1/3 p-8">
        <h2 className="font-bold text-center">Marca</h2>
        <h3 className="">Nueva Categoría</h3>
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
          <input
            type="text"
            placeholder="Imagen"
            value={imagen}
            onChange={(e: ChangeEvent<HTMLInputElement>) => setImagen(e.target.value)}
            className="w-full p-1.5 border border-gray-300 rounded"
          />
          <button
            type="submit"
            className="bg-blue-600 text-white px-2 py-1 rounded hover:bg-blue-800"
          >Registrar</button>

          {mensaje && <p className="text-green-600">{mensaje}</p>}
        </form>
      </div>

      {/* Listado de Categorias existentes */}
      <div className="w-2/3 p-8">
        <h3 className="font-bold mb-4">Listado de Categorías</h3>
        <ul className="space-y-2">
          {categorias.map((categoria: any) => (
            <li key={categoria.id} className="p-2 border-b border-gray-200">
              {categoria.nombre} - {categoria.descripcion} - {categoria.imagen}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default Categoria;