import { render, screen, fireEvent, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import axios from 'axios';
import Proveedor from '../proveedor';

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

describe('Componente Proveedor', () => {
  // Datos simulados para las pruebas
  const mockProveedores = [
    { id: 1, nombre: 'Proveedor 1', codigo: 'COD1', telefono: '123456789', cuit: '30123456789' },
    { id: 2, nombre: 'Proveedor 2', codigo: 'COD2', telefono: '987654321', cuit: '30987654321' },
  ];
  const mockProveedoresEliminados = [
    {
      id: 3,
      nombre: 'Proveedor Eliminado',
      codigo: 'CODELIM',
      telefono: '555555555',
      cuit: '30555555555',
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
      if (url === 'http://localhost:4000/proveedor') {
        return Promise.resolve({ data: mockProveedores });
      }
      if (url === 'http://localhost:4000/proveedor/findSoftDeleted') {
        return Promise.resolve({ data: mockProveedoresEliminados });
      }
      return Promise.reject(new Error('No encontrado'));
    });
  });

  // Prueba unitaria: Verifica que el componente se renderiza correctamente
  test('Renderizado de proveedor con los componentes iniciales', async () => {
    render(<Proveedor />);
    expect(screen.getByText('Listado de Proveedores')).toBeInTheDocument();
    expect(screen.getByText('Nuevo Proveedor')).toBeInTheDocument();
    expect(screen.getByText('Historial de Eliminaciones')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Filtrar por nombre...')).toBeInTheDocument();

    // Verificar que los proveedores se cargan
    await waitFor(() => {
      expect(screen.getByText('Proveedor 1')).toBeInTheDocument();
    });
    await waitFor(() => {
      expect(screen.getByText('COD1')).toBeInTheDocument();
    });
    await waitFor(() => {
      expect(screen.getByText('123456789')).toBeInTheDocument();
    });
    await waitFor(() => {
      expect(screen.getByText('30123456789')).toBeInTheDocument();
    });
  });

  // Prueba unitaria: Verifica el filtrado de proveedores
  test('Filtrado de proveedores por nombre', async () => {
    render(<Proveedor />);
    await waitFor(() => {
      expect(screen.getByText('Proveedor 1')).toBeInTheDocument();
    });
    await waitFor(() => {
      expect(screen.getByText('Proveedor 2')).toBeInTheDocument();
    });

    const filterInput = screen.getByPlaceholderText('Filtrar por nombre...');
    await userEvent.type(filterInput, 'Proveedor 1');

    expect(screen.getByText('Proveedor 1')).toBeInTheDocument();
    expect(screen.queryByText('Proveedor 2')).not.toBeInTheDocument();
  });

  // Prueba de integración: Crear un nuevo proveedor
  test('Crear un nuevo proveedor', async () => {
    // Lista inicial de proveedores
    const initialProveedores = [
      { id: 1, nombre: 'Proveedor 1', codigo: 'COD1', telefono: '123456789', cuit: '30123456789' },
      { id: 2, nombre: 'Proveedor 2', codigo: 'COD2', telefono: '987654321', cuit: '30987654321' },
    ];

    // Lista actualizada con el nuevo proveedor
    const updatedProveedores = [
      ...initialProveedores,
      { id: 3, nombre: 'Nuevo Proveedor', codigo: 'COD3', telefono: '555123456', cuit: '30555123456' },
    ];

    // Mock para la carga inicial de proveedores
    mockedAxios.get.mockResolvedValueOnce({ data: initialProveedores });
    // Mock para la creación del proveedor
    mockedAxios.post.mockResolvedValueOnce({ 
      data: { id: 3, nombre: 'Nuevo Proveedor', codigo: 'COD3', telefono: 555123456, cuit: 30555123456 } 
    });
    // Mock para la recarga de proveedores después de la creación
    mockedAxios.get.mockResolvedValueOnce({ data: updatedProveedores });

    render(<Proveedor />);

    // Esperar a que los proveedores iniciales se carguen
    await waitFor(() => {
      expect(screen.getByText('Proveedor 1')).toBeInTheDocument();
    }, { timeout: 2000 });

    // Abrir formulario
    const newProviderButton = screen.getByRole('button', { name: /Nuevo Proveedor/i });
    await userEvent.click(newProviderButton);

    // Verificar que el formulario está visible
    expect(screen.getByRole('heading', { name: /Nuevo Proveedor/i })).toBeInTheDocument();

    // Llenar formulario
    await userEvent.type(screen.getByPlaceholderText('Nombre'), 'Nuevo Proveedor');
    await userEvent.type(screen.getByPlaceholderText('Código'), 'COD3');
    await userEvent.type(screen.getByPlaceholderText('Teléfono'), '555123456');
    await userEvent.type(screen.getByPlaceholderText('CUIT'), '30555123456');

    // Enviar formulario
    await userEvent.click(screen.getByRole('button', { name: /Registrar/i }));

    // Verificar que se llamó a la API de creación
    expect(mockedAxios.post).toHaveBeenCalledWith('http://localhost:4000/proveedor', {
      nombre: 'Nuevo Proveedor',
      codigo: 'COD3',
      telefono: 555123456,
      cuit: 30555123456,
    });

    // Verificar que se llamó a la API para recargar los proveedores
    expect(mockedAxios.get).toHaveBeenCalledWith('http://localhost:4000/proveedor');

    // Verificar la alerta de éxito
    await waitFor(() => {
      expect(screen.getByText('Proveedor registrado con éxito.')).toBeInTheDocument();
    }, { timeout: 2000 });

    // Verificar que el nuevo proveedor aparece en la lista
    await waitFor(() => {
      const table = screen.getByRole('table');
      expect(within(table).getByText('Nuevo Proveedor')).toBeInTheDocument();
    }, { timeout: 2000 });

    await waitFor(() => {
      const table = screen.getByRole('table');
      expect(within(table).getByText('COD3')).toBeInTheDocument();
    }, { timeout: 2000 });

    await waitFor(() => {
      const table = screen.getByRole('table');
      expect(within(table).getByText('555123456')).toBeInTheDocument();
    }, { timeout: 2000 });

    await waitFor(() => {
      const table = screen.getByRole('table');
      expect(within(table).getByText('30555123456')).toBeInTheDocument();
    }, { timeout: 2000 });
  });

  // Prueba de integración: Eliminar un proveedor
  test('Eliminar proveedor con confirmación', async () => {
    mockedAxios.delete.mockResolvedValueOnce({});
    render(<Proveedor />);

    // Esperar a que los proveedores se carguen
    await waitFor(() => {
      expect(screen.getByText('Proveedor 1')).toBeInTheDocument();
    });

    // Clic en el ícono de eliminación
    const deleteIcons = screen.getAllByTestId('trash-icon');
    await userEvent.click(deleteIcons[0]);

    // Verificar que el modal de confirmación aparece
    expect(screen.getByText('Confirmación de Eliminación')).toBeInTheDocument();
    expect(screen.getByText('¿Estás seguro que querés eliminar este proveedor?')).toBeInTheDocument();

    // Confirmar eliminación
    await userEvent.click(screen.getByText('Aceptar'));

    // Verificar llamada a la API
    await waitFor(() => {
      expect(mockedAxios.delete).toHaveBeenCalledWith('http://localhost:4000/proveedor/softDelete/1');
    });
    await waitFor(() => {
      expect(screen.getByText('Proveedor eliminado correctamente.')).toBeInTheDocument();
    });
  });

  // Prueba de integración: Mostrar y restaurar proveedores eliminados
  test('Mostrar y restaurar proveedores eliminados', async () => {
    mockedAxios.patch.mockResolvedValueOnce({});
    render(<Proveedor />);

    // Abrir historial
    await userEvent.click(screen.getByText('Historial de Eliminaciones'));

    // Verificar que el modal de historial aparece
    await waitFor(() => {
      expect(screen.getByText('Historial de Eliminaciones')).toBeInTheDocument();
    });
    await waitFor(() => {
      expect(screen.getByText('Proveedor Eliminado')).toBeInTheDocument();
    });

    // Clic en el ícono de restauración
    const restoreIcons = screen.getAllByTestId('arrow-path-icon');
    await userEvent.click(restoreIcons[0]);

    // Verificar modal de confirmación de restauración
    expect(screen.getByText('Confirmación de Restauración')).toBeInTheDocument();
    expect(screen.getByText('¿Estás seguro que querés restaurar este proveedor?')).toBeInTheDocument();

    // Confirmar restauración
    await userEvent.click(screen.getByText('Aceptar'));

    // Verificar llamada a la API
    await waitFor(() => {
      expect(mockedAxios.patch).toHaveBeenCalledWith('http://localhost:4000/proveedor/restore/3');
    });
    await waitFor(() => {
      expect(screen.getByText('Proveedor restaurado correctamente.')).toBeInTheDocument();
    });
  });

  // Prueba unitaria: Manejo de error en la API al crear un proveedor
  test('Error al crear un proveedor', async () => {
    mockedAxios.post.mockRejectedValueOnce(new Error('Error en la API'));
    render(<Proveedor />);

    // Abrir formulario
    await userEvent.click(screen.getByText('Nuevo Proveedor'));

    // Llenar formulario
    await userEvent.type(screen.getByPlaceholderText('Nombre'), 'Nuevo Proveedor');
    await userEvent.type(screen.getByPlaceholderText('Código'), 'COD3');
    await userEvent.type(screen.getByPlaceholderText('Teléfono'), '555123456');
    await userEvent.type(screen.getByPlaceholderText('CUIT'), '30555123456');
    await userEvent.click(screen.getByText('Registrar'));

    // Verificar alerta de error
    await waitFor(() => {
      expect(screen.getByText('Error')).toBeInTheDocument();
    });
    await waitFor(() => {
      expect(screen.getByText('Error al registrar/actualizar el proveedor.')).toBeInTheDocument();
    });
  });
});