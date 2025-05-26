import { render, screen, fireEvent, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import axios from 'axios';
import Categoria from '../categoria';

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

describe('Componente Categoria', () => {
  // Datos simulados para las pruebas
  const mockCategorias = [
    { id: 1, nombre: 'Categoría 1', descripcion: 'Descripción 1' },
    { id: 2, nombre: 'Categoría 2', descripcion: 'Descripción 2' },
  ];
  const mockCategoriasEliminadas = [
    {
      id: 3,
      nombre: 'Categoría Eliminada',
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
      if (url === 'http://localhost:4000/categoria') {
        return Promise.resolve({ data: mockCategorias });
      }
      if (url === 'http://localhost:4000/categoria/findSoftDeleted') {
        return Promise.resolve({ data: mockCategoriasEliminadas });
      }
      return Promise.reject(new Error('No encontrado'));
    });
  });

  // Prueba unitaria: Verifica que el componente se renderiza correctamente
  test('Renderizado de categoría con los componentes iniciales', async () => {
    render(<Categoria />);
    expect(screen.getByText('Listado de Categorías')).toBeInTheDocument();
    expect(screen.getByText('Nueva Categoría')).toBeInTheDocument();
    expect(screen.getByText('Historial de Eliminaciones')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Filtrar por nombre...')).toBeInTheDocument();

    // Verificar que las categorías se cargan
    await waitFor(() => {
      expect(screen.getByText('Categoría 1')).toBeInTheDocument();
    });
    await waitFor(() => {
      expect(screen.getByText('Descripción 1')).toBeInTheDocument();
    });
    await waitFor(() => {
      expect(screen.getByText('Categoría 2')).toBeInTheDocument();
    });
    await waitFor(() => {
      expect(screen.getByText('Descripción 2')).toBeInTheDocument();
    });
  });

  // Prueba unitaria: Verifica el filtrado de categorías
  test('Filtrado de categorías por nombre', async () => {
    render(<Categoria />);
    await waitFor(() => {
      expect(screen.getByText('Categoría 1')).toBeInTheDocument();
    });
    await waitFor(() => {
      expect(screen.getByText('Categoría 2')).toBeInTheDocument();
    });

    const filterInput = screen.getByPlaceholderText('Filtrar por nombre...');
    await userEvent.type(filterInput, 'Categoría 1');

    expect(screen.getByText('Categoría 1')).toBeInTheDocument();
    expect(screen.queryByText('Categoría 2')).not.toBeInTheDocument();
  });

  // Prueba de integración: Crear una nueva categoría
  test('Crear una nueva categoría', async () => {
    // Lista inicial de categorías
    const initialCategorias = [
      { id: 1, nombre: 'Categoría 1', descripcion: 'Descripción 1' },
      { id: 2, nombre: 'Categoría 2', descripcion: 'Descripción 2' },
    ];

    // Lista actualizada con la nueva categoría
    const updatedCategorias = [
      ...initialCategorias,
      { id: 3, nombre: 'Nueva Categoría', descripcion: 'Nueva Desc' },
    ];

    // Mock para la carga inicial de categorías
    mockedAxios.get.mockResolvedValueOnce({ data: initialCategorias });
    // Mock para la creación de la categoría
    mockedAxios.post.mockResolvedValueOnce({ data: { id: 3, nombre: 'Nueva Categoría', descripcion: 'Nueva Desc' } });
    // Mock para la recarga de categorías después de la creación
    mockedAxios.get.mockResolvedValueOnce({ data: updatedCategorias });

    render(<Categoria />);

    // Esperar a que las categorías iniciales se carguen
    await waitFor(() => {
      expect(screen.getByText('Categoría 1')).toBeInTheDocument();
    }, { timeout: 2000 });
    await waitFor(() => {
      expect(screen.getByText('Descripción 1')).toBeInTheDocument();
    }, { timeout: 2000 });

    // Abrir formulario
    const newCategoryButton = screen.getByRole('button', { name: /Nueva Categoría/i });
    await userEvent.click(newCategoryButton);

    // Verificar que el formulario está visible
    expect(screen.getByRole('heading', { name: /Nueva Categoría/i })).toBeInTheDocument();

    // Llenar formulario
    await userEvent.type(screen.getByPlaceholderText('Nombre'), 'Nueva Categoría');
    await userEvent.type(screen.getByPlaceholderText('Descripción'), 'Nueva Desc');

    // Enviar formulario
    await userEvent.click(screen.getByRole('button', { name: /Registrar/i }));

    // Verificar que se llamó a la API de creación
    expect(mockedAxios.post).toHaveBeenCalledWith('http://localhost:4000/categoria', {
      nombre: 'Nueva Categoría',
      descripcion: 'Nueva Desc',
    });

    // Verificar que se llamó a la API para recargar las categorías
    expect(mockedAxios.get).toHaveBeenCalledWith('http://localhost:4000/categoria');

    // Verificar la alerta de éxito
    await waitFor(() => {
      expect(screen.getByText('Categoría registrada con éxito.')).toBeInTheDocument();
    }, { timeout: 2000 });

    // Verificar que la nueva categoría aparece en la lista
    await waitFor(() => {
      const table = screen.getByRole('table');
      expect(within(table).getByText('Nueva Categoría')).toBeInTheDocument();
    }, { timeout: 2000 });

    await waitFor(() => {
      const table = screen.getByRole('table');
      expect(within(table).getByText('Nueva Desc')).toBeInTheDocument();
    }, { timeout: 2000 });
  });

  // Prueba de integración: Editar una categoría existente
  test('Editar categoría existente', async () => {
    mockedAxios.patch.mockResolvedValueOnce({ data: { id: 1, nombre: 'Categoría Editada', descripcion: 'Desc Editada' } });
    render(<Categoria />);

    // Esperar a que las categorías se carguen
    await waitFor(() => {
      expect(screen.getByText('Categoría 1')).toBeInTheDocument();
    });

    // Clic en el ícono de edición
    const editIcons = screen.getAllByTestId('pencil-icon');
    await userEvent.click(editIcons[0]);

    // Verificar que el formulario está en modo edición
    expect(screen.getByText('Editar Categoría')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Nombre')).toHaveValue('Categoría 1');
    expect(screen.getByPlaceholderText('Descripción')).toHaveValue('Descripción 1');

    // Editar los campos
    await userEvent.clear(screen.getByPlaceholderText('Nombre'));
    await userEvent.type(screen.getByPlaceholderText('Nombre'), 'Categoría Editada');
    await userEvent.clear(screen.getByPlaceholderText('Descripción'));
    await userEvent.type(screen.getByPlaceholderText('Descripción'), 'Desc Editada');
    await userEvent.click(screen.getByText('Actualizar'));

    // Verificar llamada a la API
    await waitFor(() => {
      expect(mockedAxios.patch).toHaveBeenCalledWith('http://localhost:4000/categoria/1', {
        id: 1,
        nombre: 'Categoría Editada',
        descripcion: 'Desc Editada',
      });
    });
    await waitFor(() => {
      expect(screen.getByText('Categoría actualizada con éxito.')).toBeInTheDocument();
    });
  });

  // Prueba de integración: Eliminar una categoría
  test('Eliminar categoría con confirmación', async () => {
    mockedAxios.delete.mockResolvedValueOnce({});
    render(<Categoria />);

    // Esperar a que las categorías se carguen
    await waitFor(() => {
      expect(screen.getByText('Categoría 1')).toBeInTheDocument();
    });

    // Clic en el ícono de eliminación
    const deleteIcons = screen.getAllByTestId('trash-icon');
    await userEvent.click(deleteIcons[0]);

    // Verificar que el modal de confirmación aparece
    expect(screen.getByText('Confirmación de Eliminación')).toBeInTheDocument();
    expect(screen.getByText('¿Estás seguro que querés eliminar esta categoría?')).toBeInTheDocument();

    // Confirmar eliminación
    await userEvent.click(screen.getByText('Aceptar'));

    // Verificar llamada a la API
    await waitFor(() => {
      expect(mockedAxios.delete).toHaveBeenCalledWith('http://localhost:4000/categoria/softDelete/1');
    });
    await waitFor(() => {
      expect(screen.getByText('Categoría eliminada correctamente.')).toBeInTheDocument();
    });
  });

  // Prueba de integración: Mostrar y restaurar categorías eliminadas
  test('Mostrar y restaurar categorías eliminadas', async () => {
    mockedAxios.patch.mockResolvedValueOnce({});
    render(<Categoria />);

    // Abrir historial
    await userEvent.click(screen.getByText('Historial de Eliminaciones'));

    // Verificar que el modal de historial aparece
    await waitFor(() => {
      expect(screen.getByText('Historial de Eliminaciones')).toBeInTheDocument();
    });
    await waitFor(() => {
      expect(screen.getByText('Categoría Eliminada')).toBeInTheDocument();
    });

    // Clic en el ícono de restauración
    const restoreIcons = screen.getAllByTestId('arrow-path-icon');
    await userEvent.click(restoreIcons[0]);

    // Verificar modal de confirmación de restauración
    expect(screen.getByText('Confirmación de Restauración')).toBeInTheDocument();
    expect(screen.getByText('¿Estás seguro que querés restaurar esta categoría?')).toBeInTheDocument();

    // Confirmar restauración
    await userEvent.click(screen.getByText('Aceptar'));

    // Verificar llamada a la API
    await waitFor(() => {
      expect(mockedAxios.patch).toHaveBeenCalledWith('http://localhost:4000/categoria/restore/3');
    });
    await waitFor(() => {
      expect(screen.getByText('Categoría restaurada correctamente.')).toBeInTheDocument();
    });
  });

  // Prueba unitaria: Manejo de error en la API al crear una categoría
  test('Error al crear una categoría', async () => {
    mockedAxios.post.mockRejectedValueOnce(new Error('Error en la API'));
    render(<Categoria />);

    // Abrir formulario
    await userEvent.click(screen.getByText('Nueva Categoría'));

    // Llenar formulario
    await userEvent.type(screen.getByPlaceholderText('Nombre'), 'Nueva Categoría');
    await userEvent.type(screen.getByPlaceholderText('Descripción'), 'Nueva Desc');
    await userEvent.click(screen.getByText('Registrar'));

    // Verificar alerta de error
    await waitFor(() => {
      expect(screen.getByText('Error')).toBeInTheDocument();
    });
    await waitFor(() => {
      expect(screen.getByText('Error al registrar/actualizar la categoría.')).toBeInTheDocument();
    });
  });
});