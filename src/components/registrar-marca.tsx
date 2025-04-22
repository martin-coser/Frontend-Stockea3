import React, { useState, ChangeEvent, FormEvent } from 'react';
import axios from 'axios';

const API_URL = 'http://localhost:4000/Marcas/nuevaMarca';

const RegistrarMarca: React.FC = () => {
  const [nombre, setNombre] = useState('');
  const [descripcion, setDescripcion] = useState('');
  const [mensaje, setMensaje] = useState('');

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    try {
      await axios.post(API_URL, { nombre, descripcion });
      setMensaje('Marca registrada con éxito.');
      setNombre('');
      setDescripcion('');
    } catch (error) {
      console.error('Error al registrar la marca:', error);
      setMensaje('Error al registrar la marca.');
    }
  };

  return (
    <div>
      <h2>Registrar Marca</h2>
      <form onSubmit={handleSubmit}>
        <input
          type="text"
          placeholder="Nombre"
          value={nombre}
          onChange={(e: ChangeEvent<HTMLInputElement>) => setNombre(e.target.value)}
        />
        <input
          type="text"
          placeholder="Descripción"
          value={descripcion}
          onChange={(e: ChangeEvent<HTMLInputElement>) => setDescripcion(e.target.value)}
        />
        <button type="submit">Registrar</button>
      </form>
      {mensaje && <p>{mensaje}</p>}
    </div>
  );
};

export default RegistrarMarca;