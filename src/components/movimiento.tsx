import React, { useState, useEffect, ChangeEvent, FormEvent } from 'react';
import axios from 'axios';
import { PencilSquareIcon } from '@heroicons/react/24/outline';
import { TrashIcon } from '@heroicons/react/24/outline';
import { motion } from 'framer-motion';

const API_URL = 'http://localhost:4000/movimiento';

const Movimiento: React.FC = () => {
    const [fechaHora, setFechaHora] = useState('');
    const [tipoMovimiento, setTipoMovimiento] = useState('');
    const [total, setTotal] = useState('');
    const [mensaje, setMensaje] = useState('');
    const [movimientos, setMovimientos] = useState([]);
    const [todosLosMovimientos, setTodosLosMovimientos] = useState([]);
    const [filtroFechaHora, setFiltroFechaHora] = useState('');
    const [mostrarFormulario, setMostrarFormulario] = useState(false);

    // Traer todos los movimientos
    const obtenerMovimientos = async () => {
        try {
            const res = await axios.get(API_URL);
            setMovimientos(res.data);
            setTodosLosMovimientos(res.data);
        } catch (error) {
            console.error('Error al obtener los movimientos:', error);
        }
    };

    // Filtrar movimientos por fecha y hora
    const filtrarMovimientos = (fechaFiltro: string) => {
        const resultado = todosLosMovimientos.filter((movimiento: any) =>
            movimiento.fechaHora.toLowerCase().includes(fechaFiltro.toLowerCase())
        );
        setMovimientos(resultado);
    };

    useEffect(() => {
        if (filtroFechaHora.trim() === '') {
            setMovimientos(todosLosMovimientos);
        } else {
            filtrarMovimientos(filtroFechaHora);
        }
    }, [filtroFechaHora, todosLosMovimientos]);

    useEffect(() => {
        obtenerMovimientos();
    }, []);

    // Registrar nuevo movimiento
    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();
        try {
            await axios.post(API_URL, { fechaHora, tipoMovimiento, total });
            setMensaje('Movimiento registrado con éxito.');
            setFechaHora('');
            setTipoMovimiento('');
            setTotal('');
            obtenerMovimientos();
            setMostrarFormulario(false);
        } catch (error) {
            console.error('Error al registrar el Movimiento:', error);
            setMensaje('Error al registrar el Movimiento.');
        }
    };

    return (
        <motion.div className="flex min-h-screen bg-gray-600" layout>
            {/* Listado de movimientos (ahora a la izquierda) */}
            <motion.div className="p-8 ml-60 flex-1" layout transition={{ duration: 0.2 }}>
                <div className="flex justify-between items-center mb-4">
                    <h3 className="font-bold mt-2 text-gray-200">Listado de Movimientos</h3>
                    <button
                        onClick={() => setMostrarFormulario(true)}
                        className="w-1/7 py-2 px-4 bg-indigo-500 text-white rounded-lg border border-indigo-500 hover:bg-indigo-600 focus:ring-1 focus:ring-indigo-300 transition"
                    >
                        Nuevo Movimiento
                    </button>
                </div>

                <div className="mb-4">
                    <input
                        type="text"
                        placeholder="Filtrar por fecha..."
                        value={filtroFechaHora}
                        onChange={(e) => setFiltroFechaHora(e.target.value)}
                        className="w-1/2 p-1.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-500 transition"
                    />
                </div>

                <table className="w-full border-collapse rounded-lg overflow-hidden shadow-md border border-indigo-200 bg-gray-100">
                    <thead>
                        <tr className="bg-indigo-100">
                            <th className="border px-4 py-2 text-left text-sm font-semibold">Fecha y Hora</th>
                            <th className="border px-4 py-2 text-left text-sm font-semibold">Tipo de Movimiento</th>
                            <th className="border px-4 py-2 text-left text-sm font-semibold">Total</th>
                            <th className="border px-4 py-2 text-center text-sm font-semibold">Modificar</th>
                            <th className="border px-4 py-2 text-center text-sm font-semibold">Eliminar</th>
                        </tr>
                    </thead>
                    <tbody>
                        {movimientos.map((movimiento: any) => (
                            <tr key={movimiento.id} className="hover:bg-gray-200">
                                <td className="border px-4 py-2 text-sm">{movimiento.fechaHora}</td>
                                <td className="border px-4 py-2 text-sm">{movimiento.tipoMovimiento}</td>
                                <td className="border px-4 py-2 text-sm">{movimiento.total}</td>
                                <td className="border px-4 py-2 text-blue-600 text-center cursor-pointer hover:text-gray-700">
                                    <PencilSquareIcon className="h-5 w-5 mx-auto" />
                                </td>
                                <td className="border px-4 py-2 text-red-600 text-center cursor-pointer hover:text-red-700">
                                    <TrashIcon className="h-5 w-5 mx-auto" />
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </motion.div>

            {/* Formulario para nuevo movimiento (a la derecha) */}
            {mostrarFormulario && (
                <motion.div
                    initial={{ opacity: 0, x: 100 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 100 }}
                    transition={{ duration: 0.2 }}
                    className="w-1/4 p-10 text-gray-200"
                    layout
                >
                    <h2 className="font-bold mb-4 text-center">Nuevo Movimiento</h2>
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <input
                            type="text"
                            placeholder="Fecha y Hora"
                            value={fechaHora}
                            onChange={(e: ChangeEvent<HTMLInputElement>) => setFechaHora(e.target.value)}
                            className="w-full p-1.5 border border-gray-300 rounded bg-gray-100 text-gray-700"
                        />
                        <input
                            type="text"
                            placeholder="Tipo de Movimiento"
                            value={tipoMovimiento}
                            onChange={(e: ChangeEvent<HTMLInputElement>) => setTipoMovimiento(e.target.value)}
                            className="w-full p-1.5 border border-gray-300 rounded bg-gray-100 text-gray-700"
                        />
                        <input
                            type="text"
                            placeholder="Total"
                            value={total}
                            onChange={(e: ChangeEvent<HTMLInputElement>) => setTotal(e.target.value)}
                            className="w-full p-1.5 border border-gray-300 rounded bg-gray-100 text-gray-700"
                        />
                        <button
                            type="submit"
                            className="w-full py-2 px-4 bg-indigo-500 text-white rounded-lg border border-indigo-500 hover:bg-indigo-600 focus:ring-1 focus:ring-indigo-300 transition"
                        >
                            Registrar
                        </button>
                        {mensaje && <p className="text-green-600">{mensaje}</p>}
                    </form>
                </motion.div>
            )}
        </motion.div>
    );
};

export default Movimiento;