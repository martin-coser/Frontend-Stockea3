import React, { useState, useEffect, ChangeEvent, FormEvent } from 'react';
import axios from 'axios';
import { PencilSquareIcon } from '@heroicons/react/24/outline';
import { TrashIcon } from '@heroicons/react/24/outline';

const API_URL = 'http://localhost:4000/movimiento';

const Movimiento: React.FC = () => {
  const [fechaHora, setFechaHora] = useState('');
  const [tipoMovimiento, setTipoMovimiento] = useState('');
  const [total, setTotal] = useState('');
  const [mensaje, setMensaje] = useState('');
  const [movimientos, setMovimientos] = useState([]);
  const [todosLosMovimientos, setTodosLosMovimientos] = useState([]);
  const [filtroFechaHora, setFiltroFechaHora] = useState('');


  // Traer todas las marcas
  const obtenerMovimientos = async () => {
    try {
      const res = await axios.get(API_URL);
      setMovimientos(res.data);
      setTodosLosMovimientos(res.data); 
    } catch (error) {
      console.error('Error al obtener los movimientos:', error);
    }
  };

  // Filtrar movimientos por fecha
  const filtrarMovimientos = (fechaFiltro: string) => {
    const resultado = todosLosMovimientos.filter((movimiento: any) =>
      movimiento.nombre.toLowerCase().includes(fechaFiltro.toLowerCase())
    );
    setMovimientos(resultado);
  };

  // Al cambiar el filtro de nombre
  useEffect(() => {
    if (filtroFechaHora.trim() === '') {
      setMovimientos(todosLosMovimientos); // Mostrar todas si no hay filtro
    } else {
      filtrarMovimientos(filtroFechaHora);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filtroFechaHora, todosLosMovimientos]);

  // Ejecutar al montar el componente
  useEffect(() => {
    obtenerMovimientos();
  }, []);

  // Registrar nueva categoria
  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    try {
      await axios.post(API_URL, { fechaHora, tipoMovimiento, total });
      setMensaje('Movimiento registrada con éxito.');
      setFechaHora('');
      setTipoMovimiento('');
      setTotal('');
      obtenerMovimientos();
    } catch (error) {
      console.error('Error al registrar el Movimiento:', error);
      setMensaje('Error al registrar el Movimiento.');
    }
  };

return (
    <div className="flex min-h-screen">
      {/* Formulario para nuevo movimiento */}
      <div className="w-1/3 p-8">
        <h2 className="font-bold text-center">Nuevo Movimiento</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            type="text"
            placeholder="Fecha Hora"
            value={fechaHora}
            onChange={(e: ChangeEvent<HTMLInputElement>) => setFechaHora(e.target.value)}
            className="w-full p-1.5 border border-gray-300 rounded"
          />
          <input
            type="text"
            placeholder="TipoMovimiento"
            value={tipoMovimiento}
            onChange={(e: ChangeEvent<HTMLInputElement>) => setTipoMovimiento(e.target.value)}
            className="w-full p-1.5 border border-gray-300 rounded"
          />
          <input
            type="text"
            placeholder="Total"
            value={total}
            onChange={(e: ChangeEvent<HTMLInputElement>) => setTotal(e.target.value)}
            className="w-full p-1.5 border border-gray-300 rounded"
          />
          <button
            type="submit"
            className="bg-blue-600 text-white px-2 py-1 rounded hover:bg-blue-800"
          >
            Registrar
          </button>
          {mensaje && <p className="text-green-600">{mensaje}</p>}
        </form>
      </div>

      {/* Listado de movimientos con filtro */}
      <div className="w-2/3 p-8">
        <h3 className="font-bold mb-4 text-center">Listado de Movimientos</h3>

        <div className="mb-4">
          <input
            type="text"
            placeholder="Filtrar por fecha..."
            value={filtroFechaHora}
            onChange={(e) => setFiltroFechaHora(e.target.value)}
            className="w-1/2 p-1.5 border border-gray-300 rounded"
          />
        </div>

        <table className="w-full table-fixed">
          <thead>
            <tr>
              <th className="px-4 py-2 text-left">Fecha y Hora</th>
              <th className="px-4 py-2 text-left">Tipo de Movimiento</th>
              <th className="px-4 py-2 text-left">Total</th>
              <th className="px-4 py-2 text-left">Modificar</th>
              <th className="px-4 py-2 text-left">Eliminar</th>
            </tr>
          </thead>
          <tbody>
            {movimientos.map((movimiento: any) => (
              <tr key={movimiento.id}>
                <td className="px-4 py-2">{movimiento.nombre}</td>
                <td className="px-4 py-2">{movimiento.descripcion}</td>
                <td className="px-4 py-2">{movimiento.imagen}</td>
                <td className="px-4 py-2 text-blue-600 cursor-pointer"><PencilSquareIcon className=" h-5 w-5 text-blue-600 ml-6" /></td>
                <td className="px-4 py-2 text-red-600 cursor-pointer"><TrashIcon className="h-5 w-5 text-red-600 ml-5"/></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Movimiento;
