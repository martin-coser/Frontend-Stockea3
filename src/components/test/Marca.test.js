import { render, screen, fireEvent, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import axios from 'axios';
import Marca from '../marca';

// Mock de axios
jest.mock('axios');
const mockedAxios = axios;

// Mock de los íconos de Heroicons
jest.mock('@heroicons/react/24/outline', () => ({
  PencilSquareIcon: () => <div data-testid="pencil-icon" />,
  TrashIcon: () => <div data-testid="trash-icon" />,
  ArrowPathIcon: () => <div data-testid="arrow-path-icon" />,
}));

// Mock de framer-motion para evitar problemas con animaciones
jest.mock('framer-motion', () => ({
  motion: {
    div: ({ children, ...props }) => <div {...props}>{children}</div>,
  },
}));

describe('Marca Component', () => {
  // Datos simulados para las pruebas
  const mockMarcas = [
    { id: 1, nombre: 'Marca 1', descripcion: 'Descripción 1' },
    { id: 2, nombre: 'Marca 2', descripcion: 'Descripción 2' },
  ];
  const mockMarcasEliminadas = [
    {
      id: 3,
      nombre: 'Marca Eliminada',
      descripcion: 'Descripción Eliminada',
      deletedAt: '2023-10-01T12:00:00Z',
    },
  ];

  beforeEach(() => {
    // Resetear mocks antes de cada prueba
    mockedAxios.get.mockReset();
    mockedAxios.post.mockReset();
    mockedAxios.patch.mockReset();
    mockedAxios.delete.mockReset();

    // Configurar respuestas por defecto para las llamadas a la API
    mockedAxios.get.mockImplementation((url) => {
      if (url === 'http://localhost:4000/marca') {
        return Promise.resolve({ data: mockMarcas });
      }
      if (url === 'http://localhost:4000/marca/findSoftDeleted') {
        return Promise.resolve({ data: mockMarcasEliminadas });
      }
      return Promise.reject(new Error('Not found'));
    });
  });

  // Prueba unitaria: Verifica que el componente se renderiza correctamente
  test('Renderizado de marca con los componentes iniciales', async () => {
    render(<Marca />);
    expect(screen.getByText('Listado de Marcas')).toBeInTheDocument();
    expect(screen.getByText('Nueva Marca')).toBeInTheDocument();
    expect(screen.getByText('Historial de Eliminaciones')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Filtrar por nombre...')).toBeInTheDocument();

    // Verificar que las marcas se cargan
    await waitFor(() => {
      expect(screen.getByText('Marca 1')).toBeInTheDocument();
    });
    await waitFor(() => {
      expect(screen.getByText('Descripción 1')).toBeInTheDocument();
    });
    await waitFor(() => {
      expect(screen.getByText('Marca 2')).toBeInTheDocument();
    });
    await waitFor(() => {
      expect(screen.getByText('Descripción 2')).toBeInTheDocument();
    });
  });

  // Prueba unitaria: Verifica el filtrado de marcas
  test('Filtrado de marcas por nombre', async () => {
    render(<Marca />);
    await waitFor(() => {
      expect(screen.getByText('Marca 1')).toBeInTheDocument();
    });
    await waitFor(() => {
      expect(screen.getByText('Marca 2')).toBeInTheDocument();
    });

    const filterInput = screen.getByPlaceholderText('Filtrar por nombre...');
    await userEvent.type(filterInput, 'Marca 1');

    expect(screen.getByText('Marca 1')).toBeInTheDocument();
    expect(screen.queryByText('Marca 2')).not.toBeInTheDocument();
  });

  // Prueba de integración: Crear una nueva marca
    test('Crear una nueva marca', async () => {
    // Lista inicial de marcas
    const initialMarcas = [
        { id: 1, nombre: 'Marca 1', descripcion: 'Descripción 1' },
        { id: 2, nombre: 'Marca 2', descripcion: 'Descripción 2' },
    ];

    // Lista actualizada con la nueva marca
    const updatedMarcas = [
        ...initialMarcas,
        { id: 3, nombre: 'Nueva Marca', descripcion: 'Nueva Desc' },
    ];

    // Mock para la carga inicial de marcas
    mockedAxios.get.mockResolvedValueOnce({ data: initialMarcas });
    // Mock para la creación de la marca
    mockedAxios.post.mockResolvedValueOnce({ data: { id: 3, nombre: 'Nueva Marca', descripcion: 'Nueva Desc' } });
    // Mock para la recarga de marcas después de la creación
    mockedAxios.get.mockResolvedValueOnce({ data: updatedMarcas });

    render(<Marca />);

    // Esperar a que las marcas iniciales se carguen
    await waitFor(() => {
        expect(screen.getByText('Marca 1')).toBeInTheDocument();
    }, { timeout: 2000 });
    await waitFor(() => {
        expect(screen.getByText('Descripción 1')).toBeInTheDocument();
    }, { timeout: 2000 });

    // Abrir formulario
    const newBrandButton = screen.getByRole('button', { name: /Nueva Marca/i });
    await userEvent.click(newBrandButton);

    // Verificar que el formulario está visible
    expect(screen.getByRole('heading', { name: /Nueva Marca/i })).toBeInTheDocument();

    // Llenar formulario
    await userEvent.type(screen.getByPlaceholderText('Nombre'), 'Nueva Marca');
    await userEvent.type(screen.getByPlaceholderText('Descripción'), 'Nueva Desc');

    // Enviar formulario
    await userEvent.click(screen.getByRole('button', { name: /Registrar/i }));

    // Verificar que se llamó a la API de creación
    expect(mockedAxios.post).toHaveBeenCalledWith('http://localhost:4000/marca', {
        nombre: 'Nueva Marca',
        descripcion: 'Nueva Desc',
    });

    // Verificar que se llamó a la API para recargar las marcas
    expect(mockedAxios.get).toHaveBeenCalledWith('http://localhost:4000/marca');

    // Verificar la alerta de éxito
    await waitFor(() => {
        expect(screen.getByText('Marca registrada con éxito.')).toBeInTheDocument();
    }, { timeout: 2000 });

    // Verificar que la nueva marca aparece en la lista
    await waitFor(() => {
        // Buscar la celda específica en la tabla
        const table = screen.getByRole('table');
        expect(within(table).getByText('Nueva Marca')).toBeInTheDocument();
    }, { timeout: 2000 });

    await waitFor(() => {
        const table = screen.getByRole('table');
        expect(within(table).getByText('Nueva Desc')).toBeInTheDocument();
    }, { timeout: 2000 });
    });

  // Prueba de integración: Editar una marca existente
  test('Editar marca existente', async () => {
    mockedAxios.patch.mockResolvedValueOnce({ data: { id: 1, nombre: 'Marca Editada', descripcion: 'Desc Editada' } });
    render(<Marca />);

    // Esperar a que las marcas se carguen
    await waitFor(() => {
      expect(screen.getByText('Marca 1')).toBeInTheDocument();
    });

    // Clic en el ícono de edición
    const editIcons = screen.getAllByTestId('pencil-icon');
    await userEvent.click(editIcons[0]);

    // Verificar que el formulario está en modo edición
    expect(screen.getByText('Editar Marca')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Nombre')).toHaveValue('Marca 1');
    expect(screen.getByPlaceholderText('Descripción')).toHaveValue('Descripción 1');

    // Editar los campos
    await userEvent.clear(screen.getByPlaceholderText('Nombre'));
    await userEvent.type(screen.getByPlaceholderText('Nombre'), 'Marca Editada');
    await userEvent.clear(screen.getByPlaceholderText('Descripción'));
    await userEvent.type(screen.getByPlaceholderText('Descripción'), 'Desc Editada');
    await userEvent.click(screen.getByText('Actualizar'));

    // Verificar llamada a la API
    await waitFor(() => {
      expect(mockedAxios.patch).toHaveBeenCalledWith('http://localhost:4000/marca/1', {
        id: 1,
        nombre: 'Marca Editada',
        descripcion: 'Desc Editada',
      });
    });
    await waitFor(() => {
      expect(screen.getByText('Marca actualizada con éxito.')).toBeInTheDocument();
    });
  });

  // Prueba de integración: Eliminar una marca
  test('Eliminar marca con confirmacion', async () => {
    mockedAxios.delete.mockResolvedValueOnce({});
    render(<Marca />);

    // Esperar a que las marcas se carguen
    await waitFor(() => {
      expect(screen.getByText('Marca 1')).toBeInTheDocument();
    });

    // Clic en el ícono de eliminación
    const deleteIcons = screen.getAllByTestId('trash-icon');
    await userEvent.click(deleteIcons[0]);

    // Verificar que el modal de confirmación aparece
    expect(screen.getByText('Confirmación de Eliminación')).toBeInTheDocument();
    expect(screen.getByText('¿Estás seguro que querés eliminar esta marca?')).toBeInTheDocument();

    // Confirmar eliminación
    await userEvent.click(screen.getByText('Aceptar'));

    // Verificar llamada a la API
    await waitFor(() => {
      expect(mockedAxios.delete).toHaveBeenCalledWith('http://localhost:4000/marca/softDelete/1');
    });
    await waitFor(() => {
      expect(screen.getByText('Marca eliminada correctamente.')).toBeInTheDocument();
    });
  });

  // Prueba de integración: Mostrar y restaurar marcas eliminadas
  test('Mostrar y restaurar marcas eliminadas', async () => {
    mockedAxios.patch.mockResolvedValueOnce({});
    render(<Marca />);

    // Abrir historial
    await userEvent.click(screen.getByText('Historial de Eliminaciones'));

    // Verificar que el modal de historial aparece
    await waitFor(() => {
      expect(screen.getByText('Historial de Eliminaciones')).toBeInTheDocument();
    });
    await waitFor(() => {
      expect(screen.getByText('Marca Eliminada')).toBeInTheDocument();
    });

    // Clic en el ícono de restauración
    const restoreIcons = screen.getAllByTestId('arrow-path-icon');
    await userEvent.click(restoreIcons[0]);

    // Verificar modal de confirmación de restauración
    expect(screen.getByText('Confirmación de Restauración')).toBeInTheDocument();
    expect(screen.getByText('¿Estás seguro que querés restaurar esta marca?')).toBeInTheDocument();

    // Confirmar restauración
    await userEvent.click(screen.getByText('Aceptar'));

    // Verificar llamada a la API
    await waitFor(() => {
      expect(mockedAxios.patch).toHaveBeenCalledWith('http://localhost:4000/marca/restore/3');
    });
    await waitFor(() => {
      expect(screen.getByText('Marca restaurada correctamente.')).toBeInTheDocument();
    });
  });

  // Prueba unitaria: Manejo de error en la API al crear una marca
  test('Error al crear una marca', async () => {
    mockedAxios.post.mockRejectedValueOnce(new Error('API Error'));
    render(<Marca />);

    // Abrir formulario
    await userEvent.click(screen.getByText('Nueva Marca'));

    // Llenar formulario
    await userEvent.type(screen.getByPlaceholderText('Nombre'), 'Nueva Marca');
    await userEvent.type(screen.getByPlaceholderText('Descripción'), 'Nueva Desc');
    await userEvent.click(screen.getByText('Registrar'));

    // Verificar alerta de error
    await waitFor(() => {
      expect(screen.getByText('Error')).toBeInTheDocument();
    });
    await waitFor(() => {
      expect(screen.getByText('Error al registrar/actualizar la marca.')).toBeInTheDocument();
    });
  });
});