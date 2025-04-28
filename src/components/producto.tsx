import React, { useState, useEffect, ChangeEvent, FormEvent } from 'react';
import axios from 'axios';
import { PencilSquareIcon } from '@heroicons/react/24/outline';
import { TrashIcon } from '@heroicons/react/24/outline';
import { motion } from 'framer-motion';

const API_URL = 'http://localhost:4000/producto';

const Producto: React.FC = () => {
    const [nombre, setNombre] = useState('');
    const [codigo, setCodigo] = useState('');
    const [descripcion, setDescripcion] = useState('');
    const [marca, setMarca] = useState('');
    const [proveedor, setProveedor] = useState('');
    const [categoria, setCategoria] = useState('');
    const [mensaje, setMensaje] = useState('');
    const [productos, setProductos] = useState([]);
    const [todosLosProductos, setTodosLosProductos] = useState([]);
    const [filtroNombre, setFiltroNombre] = useState('');
    const [mostrarFormulario, setMostrarFormulario] = useState(false);

    // Traer todos los productos
    const obtenerProductos = async () => {
        try {
            const res = await axios.get(API_URL);
            setProductos(res.data);
            setTodosLosProductos(res.data);
        } catch (error) {
            console.error('Error al obtener los productos:', error);
        }
    };

    // Filtrar productos
    const filtrarProductos = (nombreFiltro: string) => {
        const resultado = todosLosProductos.filter((producto: any) =>
            producto.nombre.toLowerCase().includes(nombreFiltro.toLowerCase())
        );
        setProductos(resultado);
    };

    useEffect(() => {
        if (filtroNombre.trim() === '') {
            setProductos(todosLosProductos);
        } else {
            filtrarProductos(filtroNombre);
        }
    }, [filtroNombre, todosLosProductos]);

    useEffect(() => {
        obtenerProductos();
    }, []);

    // Registrar nuevo producto
    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();
        try {
            await axios.post(API_URL, { nombre, codigo, descripcion, marca, categoria, proveedor });
            setMensaje('Producto registrado con éxito.');
            setNombre('');
            setCodigo('');
            setDescripcion('');
            setMarca('');
            setCategoria('');
            setProveedor('');
            obtenerProductos();
            setMostrarFormulario(false);
        } catch (error) {
            console.error('Error al registrar el producto:', error);
            setMensaje('Error al registrar el producto.');
        }
    };

    return (
        <motion.div className="flex min-h-screen bg-gray-600" layout>
            {/* Listado de Productos (ahora a la izquierda) */}
            <motion.div className="p-8 ml-60 flex-1" layout transition={{ duration: 0.1 }}>
                <div className="flex justify-between items-center mb-4">
                    <h3 className="font-bold mt-2 text-gray-200">Listado de Productos</h3>
                    <button
                        onClick={() => setMostrarFormulario(true)}
                        className="w-1/7 py-2 px-4 bg-indigo-500 text-white rounded-lg border border-indigo-500 hover:bg-indigo-600 focus:ring-1 focus:ring-indigo-300 transition"
                    >
                        Nuevo Producto
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
                            <th className="border px-4 py-2 text-left text-sm font-semibold">Codigo</th>
                            <th className="border px-4 py-2 text-left text-sm font-semibold">Descripcion</th>
                            <th className="border px-4 py-2 text-left text-sm font-semibold">Marca</th>
                            <th className="border px-4 py-2 text-left text-sm font-semibold">Categoria</th>
                            <th className="border px-4 py-2 text-center text-sm font-semibold">Modificar</th>
                            <th className="border px-4 py-2 text-center text-sm font-semibold">Eliminar</th>
                        </tr>
                    </thead>
                    <tbody>
                        {productos.map((producto: any) => (
                            <tr key={producto.id} className="hover:bg-gray-200">
                                <td className="border px-4 py-2 text-sm">{producto.nombre}</td>
                                <td className="border px-4 py-2 text-sm">{producto.codigo}</td>
                                <td className="border px-4 py-2 text-sm">{producto.descripcion}</td>
                                <td className="border px-4 py-2 text-sm">{producto.marca}</td>
                                <td className="border px-4 py-2 text-sm">{producto.categoria}</td>
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

            {/* Formulario para nuevo producto (a la derecha) */}
            {mostrarFormulario && (
                <motion.div
                    initial={{ opacity: 0, x: 100 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 100 }}
                    transition={{ duration: 0.1 }}
                    className="w-1/4 p-10 "
                    layout
                >
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
                            className="w-full py-2 px-4 bg-indigo-500 text-white rounded-lg border border-indigo-500 hover:bg-indigo-600 focus:ring-1 focus:ring-indigo-300 transition"
                        >
                            Registrar
                        </button>
                        {mensaje && <p className="text-gray-600">{mensaje}</p>}
                    </form>
                </motion.div>
            )}
        </motion.div>
    );
};

export default Producto;