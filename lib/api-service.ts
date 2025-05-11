// Tipos para las entidades
export interface Marca {
  id?: number
  nombre: string
  descripcion?: string
}

export interface Categoria {
  id?: number
  nombre: string
  descripcion?: string
}

export interface Proveedor {
  id?: number
  codigo: string
  nombre: string
  telefono: string
  cuit: string
}

export interface Producto {
  id?: number
  nombre: string
  codigo: string
  descripcion?: string
  categoria: Categoria
  marca: Marca
  proveedor: Proveedor
}

// DTOs para crear/actualizar entidades (lo que espera el backend)
export interface CreateProductoDto {
  nombre: string
  codigo: string
  descripcion?: string
  categoriaId: number
  marcaId: number
  proveedorId: number
}

export interface UpdateProductoDto {
  nombre?: string
  codigo?: string
  descripcion?: string
  categoriaId?: number
  marcaId?: number
  proveedorId?: number
}

// URLs base para las APIs
const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:4000"

const MARCAS_URL = `${API_BASE_URL}/marcas`
const CATEGORIAS_URL = `${API_BASE_URL}/categorias`
const PROVEEDORES_URL = `${API_BASE_URL}/proveedores`
const PRODUCTOS_URL = `${API_BASE_URL}/productos`

// Configuración común para las peticiones
const defaultHeaders = {
  "Content-Type": "application/json",
}

// Funciones genéricas para CRUD
async function fetchData<T>(url: string): Promise<T[]> {
  const response = await fetch(url, {
    method: "GET",
    headers: defaultHeaders,
  })

  if (!response.ok) {
    throw new Error(`Error al obtener datos: ${response.statusText}`)
  }

  return response.json()
}

async function fetchById<T>(url: string, id: number): Promise<T> {
  const response = await fetch(`${url}/${id}`, {
    method: "GET",
    headers: defaultHeaders,
  })

  if (!response.ok) {
    throw new Error(`Error al obtener el registro: ${response.statusText}`)
  }

  return response.json()
}

async function createData<T, D>(url: string, data: D): Promise<T> {
  const response = await fetch(url, {
    method: "POST",
    headers: defaultHeaders,
    body: JSON.stringify(data),
  })

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}))
    throw new Error(`Error al crear el registro: ${response.statusText}. ${JSON.stringify(errorData)}`)
  }

  return response.json()
}

async function updateData<T, D>(url: string, id: number, data: D): Promise<T> {
  const response = await fetch(`${url}/${id}`, {
    method: "PATCH",
    headers: defaultHeaders,
    body: JSON.stringify(data),
  })

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}))
    throw new Error(`Error al actualizar el registro: ${response.statusText}. ${JSON.stringify(errorData)}`)
  }

  return response.json()
}

async function deleteData(url: string, id: number): Promise<void> {
  const response = await fetch(`${url}/${id}`, {
    method: "DELETE",
    headers: defaultHeaders,
  })

  if (!response.ok) {
    throw new Error(`Error al eliminar el registro: ${response.statusText}`)
  }
}

// Servicios específicos para cada entidad
export const MarcaService = {
  getAll: () => fetchData<Marca>(MARCAS_URL),
  getById: (id: number) => fetchById<Marca>(MARCAS_URL, id),
  create: (data: Marca) => createData<Marca, Marca>(MARCAS_URL, data),
  update: (id: number, data: Marca) => updateData<Marca, Marca>(MARCAS_URL, id, data),
  delete: (id: number) => deleteData(MARCAS_URL, id),
}

export const CategoriaService = {
  getAll: () => fetchData<Categoria>(CATEGORIAS_URL),
  getById: (id: number) => fetchById<Categoria>(CATEGORIAS_URL, id),
  create: (data: Categoria) => createData<Categoria, Categoria>(CATEGORIAS_URL, data),
  update: (id: number, data: Categoria) => updateData<Categoria, Categoria>(CATEGORIAS_URL, id, data),
  delete: (id: number) => deleteData(CATEGORIAS_URL, id),
}

export const ProveedorService = {
  getAll: () => fetchData<Proveedor>(PROVEEDORES_URL),
  getById: (id: number) => fetchById<Proveedor>(PROVEEDORES_URL, id),
  create: (data: Proveedor) => createData<Proveedor, Proveedor>(PROVEEDORES_URL, data),
  update: (id: number, data: Proveedor) => updateData<Proveedor, Proveedor>(PROVEEDORES_URL, id, data),
  delete: (id: number) => deleteData(PROVEEDORES_URL, id),
}

export const ProductoService = {
  getAll: () => fetchData<Producto>(PRODUCTOS_URL),
  getById: (id: number) => fetchById<Producto>(PRODUCTOS_URL, id),

  create: (producto: Producto) => {
    // Convertir de Producto a CreateProductoDto
    const createDto: CreateProductoDto = {
      nombre: producto.nombre,
      codigo: producto.codigo,
      descripcion: producto.descripcion,
      categoriaId: producto.categoria.id || 0,
      marcaId: producto.marca.id || 0,
      proveedorId: producto.proveedor.id || 0,
    }

    return createData<Producto, CreateProductoDto>(PRODUCTOS_URL, createDto)
  },

  update: (id: number, producto: Producto) => {
    // Convertir de Producto a UpdateProductoDto
    const updateDto: UpdateProductoDto = {
      nombre: producto.nombre,
      codigo: producto.codigo,
      descripcion: producto.descripcion,
    }

    // Solo incluir IDs si existen
    if (producto.categoria?.id) {
      updateDto.categoriaId = producto.categoria.id
    }

    if (producto.marca?.id) {
      updateDto.marcaId = producto.marca.id
    }

    if (producto.proveedor?.id) {
      updateDto.proveedorId = producto.proveedor.id
    }

    return updateData<Producto, UpdateProductoDto>(PRODUCTOS_URL, id, updateDto)
  },

  delete: (id: number) => deleteData(PRODUCTOS_URL, id),
}



