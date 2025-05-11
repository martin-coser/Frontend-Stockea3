"use client"

import { useState, useEffect } from "react"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useToast } from "@/hooks/use-toast"
import {
  type Producto,
  ProductoService,
  type Marca,
  MarcaService,
  type Categoria,
  CategoriaService,
  type Proveedor,
  ProveedorService,
} from "@/lib/api-service"
import {
  AddButton,
  EditButton,
  DeleteButton,
  ErrorMessage,
  EmptyState,
  LoadingState,
  PageHeader,
  StatusBadge,
} from "@/components/ui-components"
import { Card, CardContent } from "@/components/ui/card"
import { Search, Package, Tag, Layers, Users, Hash } from "lucide-react"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"

export default function ProductosPage() {
  const [productos, setProductos] = useState<Producto[]>([])
  const [filteredProductos, setFilteredProductos] = useState<Producto[]>([])
  const [marcas, setMarcas] = useState<Marca[]>([])
  const [categorias, setCategorias] = useState<Categoria[]>([])
  const [proveedores, setProveedores] = useState<Proveedor[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [currentProducto, setCurrentProducto] = useState<Producto>({
    nombre: "",
    codigo: "",
    descripcion: "",
    categoria: { id: 0, nombre: "" },
    marca: { id: 0, nombre: "" },
    proveedor: { id: 0, nombre: "", codigo: "", telefono: "", cuit: "" },
  })
  const [isEditing, setIsEditing] = useState(false)
  const [formErrors, setFormErrors] = useState<Record<string, string>>({})
  const [searchQuery, setSearchQuery] = useState("")
  const [activeFilter, setActiveFilter] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState("todos")
  const { toast } = useToast()

  // Cargar datos iniciales
  useEffect(() => {
    const loadData = async () => {
      try {
        setIsLoading(true)
        setError(null)

        // Cargar datos en paralelo
        const [productosData, marcasData, categoriasData, proveedoresData] = await Promise.all([
          ProductoService.getAll(),
          MarcaService.getAll(),
          CategoriaService.getAll(),
          ProveedorService.getAll(),
        ])

        setProductos(productosData)
        setFilteredProductos(productosData)
        setMarcas(marcasData)
        setCategorias(categoriasData)
        setProveedores(proveedoresData)
      } catch (err) {
        setError("Error al cargar los datos. Por favor, verifica la conexión con el backend.")
        console.error(err)
      } finally {
        setIsLoading(false)
      }
    }

    loadData()
  }, [])

  // Filtrar productos cuando cambia la búsqueda o filtros
  useEffect(() => {
    let filtered = [...productos]

    // Aplicar filtro de búsqueda
    if (searchQuery.trim() !== "") {
      const query = searchQuery.toLowerCase()
      filtered = filtered.filter(
        (producto) =>
          producto.nombre.toLowerCase().includes(query) ||
          producto.codigo.toLowerCase().includes(query) ||
          (producto.descripcion && producto.descripcion.toLowerCase().includes(query)) ||
          producto.categoria.nombre.toLowerCase().includes(query) ||
          producto.marca.nombre.toLowerCase().includes(query) ||
          producto.proveedor.nombre.toLowerCase().includes(query),
      )
    }

    // Aplicar filtro por categoría
    if (activeTab !== "todos") {
      if (activeTab === "sin-categoria") {
        filtered = filtered.filter((producto) => !producto.categoria.id)
      } else {
        filtered = filtered.filter((producto) => producto.categoria.id === Number.parseInt(activeTab))
      }
    }

    // Aplicar filtro adicional (marca o proveedor)
    if (activeFilter) {
      const [type, id] = activeFilter.split("-")
      const numId = Number.parseInt(id)

      if (type === "marca") {
        filtered = filtered.filter((producto) => producto.marca.id === numId)
      } else if (type === "proveedor") {
        filtered = filtered.filter((producto) => producto.proveedor.id === numId)
      }
    }

    setFilteredProductos(filtered)
  }, [searchQuery, activeFilter, activeTab, productos])

  // Recargar productos
  const loadProductos = async () => {
    try {
      const data = await ProductoService.getAll()
      setProductos(data)
      setFilteredProductos(data)
    } catch (err) {
      toast({
        title: "Error",
        description: "Error al cargar los productos. Por favor, intenta nuevamente.",
        variant: "destructive",
      })
      console.error(err)
    }
  }

  // Abrir diálogo para crear
  const handleCreate = () => {
    setCurrentProducto({
      nombre: "",
      codigo: "",
      descripcion: "",
      categoria: { id: 0, nombre: "" },
      marca: { id: 0, nombre: "" },
      proveedor: { id: 0, nombre: "", codigo: "", telefono: "", cuit: "" },
    })
    setIsEditing(false)
    setFormErrors({})
    setIsDialogOpen(true)
  }

  // Abrir diálogo para editar
  const handleEdit = (producto: Producto) => {
    setCurrentProducto({ ...producto })
    setIsEditing(true)
    setFormErrors({})
    setIsDialogOpen(true)
  }

  // Validar formulario
  const validateForm = () => {
    const errors: Record<string, string> = {}

    if (!currentProducto.nombre.trim()) {
      errors.nombre = "El nombre es obligatorio"
    }

    if (!currentProducto.codigo.trim()) {
      errors.codigo = "El código es obligatorio"
    }

    if (!currentProducto.categoria.id) {
      errors.categoria = "Debes seleccionar una categoría"
    }

    if (!currentProducto.marca.id) {
      errors.marca = "Debes seleccionar una marca"
    }

    if (!currentProducto.proveedor.id) {
      errors.proveedor = "Debes seleccionar un proveedor"
    }

    setFormErrors(errors)
    return Object.keys(errors).length === 0
  }

  // Guardar producto (crear o actualizar)
  const handleSave = async () => {
    try {
      if (!validateForm()) {
        return
      }

      if (isEditing && currentProducto.id) {
        await ProductoService.update(currentProducto.id, currentProducto)
        toast({
          title: "Producto actualizado",
          description: `El producto ${currentProducto.nombre} ha sido actualizado correctamente`,
        })
      } else {
        await ProductoService.create(currentProducto)
        toast({
          title: "Producto creado",
          description: `El producto ${currentProducto.nombre} ha sido creado correctamente`,
        })
      }

      setIsDialogOpen(false)
      loadProductos()
    } catch (err: any) {
      // Manejar errores específicos como duplicación de código
      if (err.message?.includes("unique")) {
        setFormErrors({
          ...formErrors,
          codigo: "Este código ya está en uso por otro producto",
        })
      } else {
        toast({
          title: "Error",
          description: isEditing
            ? "Error al actualizar el producto. Por favor, intenta nuevamente."
            : "Error al crear el producto. Por favor, intenta nuevamente.",
          variant: "destructive",
        })
      }
      console.error(err)
    }
  }

  // Eliminar producto
  const handleDelete = async (id: number) => {
    try {
      await ProductoService.delete(id)
      toast({
        title: "Producto eliminado",
        description: "El producto ha sido eliminado correctamente",
      })
      loadProductos()
    } catch (err) {
      toast({
        title: "Error",
        description: "Error al eliminar el producto. Por favor, intenta nuevamente.",
        variant: "destructive",
      })
      console.error(err)
    }
  }

  // Actualizar campo de categoría
  const handleCategoriaChange = (value: string) => {
    const categoriaId = Number.parseInt(value)
    const categoriaSeleccionada = categorias.find((cat) => cat.id === categoriaId)

    if (categoriaSeleccionada) {
      setCurrentProducto({
        ...currentProducto,
        categoria: categoriaSeleccionada,
      })
    }
  }

  // Actualizar campo de marca
  const handleMarcaChange = (value: string) => {
    const marcaId = Number.parseInt(value)
    const marcaSeleccionada = marcas.find((marca) => marca.id === marcaId)

    if (marcaSeleccionada) {
      setCurrentProducto({
        ...currentProducto,
        marca: marcaSeleccionada,
      })
    }
  }

  // Actualizar campo de proveedor
  const handleProveedorChange = (value: string) => {
    const proveedorId = Number.parseInt(value)
    const proveedorSeleccionado = proveedores.find((prov) => prov.id === proveedorId)

    if (proveedorSeleccionado) {
      setCurrentProducto({
        ...currentProducto,
        proveedor: proveedorSeleccionado,
      })
    }
  }

  // Generar tabs para categorías
  const generateCategoryTabs = () => {
    return (
      <Tabs defaultValue="todos" value={activeTab} onValueChange={setActiveTab} className="mb-6">
        <TabsList className="bg-slate-100 p-1">
          <TabsTrigger value="todos" className="rounded-md">
            Todos
          </TabsTrigger>
          {categorias.map((categoria) => (
            <TabsTrigger key={categoria.id} value={categoria.id?.toString() || ""} className="rounded-md">
              {categoria.nombre}
            </TabsTrigger>
          ))}
          <TabsTrigger value="sin-categoria" className="rounded-md">
            Sin categoría
          </TabsTrigger>
        </TabsList>
      </Tabs>
    )
  }

  // Filtros adicionales
  const renderFilters = () => {
    return (
      <div className="flex flex-wrap gap-2 mb-4">
        <Button
          variant={activeFilter === null ? "secondary" : "outline"}
          size="sm"
          onClick={() => setActiveFilter(null)}
          className="text-xs"
        >
          Todos los filtros
        </Button>

        {marcas.slice(0, 5).map((marca) => (
          <Button
            key={`marca-${marca.id}`}
            variant={activeFilter === `marca-${marca.id}` ? "secondary" : "outline"}
            size="sm"
            onClick={() => setActiveFilter(activeFilter === `marca-${marca.id}` ? null : `marca-${marca.id}`)}
            className="text-xs"
          >
            <Tag className="h-3 w-3 mr-1" />
            {marca.nombre}
          </Button>
        ))}

        {proveedores.slice(0, 3).map((proveedor) => (
          <Button
            key={`proveedor-${proveedor.id}`}
            variant={activeFilter === `proveedor-${proveedor.id}` ? "secondary" : "outline"}
            size="sm"
            onClick={() =>
              setActiveFilter(activeFilter === `proveedor-${proveedor.id}` ? null : `proveedor-${proveedor.id}`)
            }
            className="text-xs"
          >
            <Users className="h-3 w-3 mr-1" />
            {proveedor.nombre}
          </Button>
        ))}
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Productos"
        description="Gestiona tu inventario de productos"
        action={<AddButton onClick={handleCreate} />}
      />

      {error && <ErrorMessage message={error} />}

      <Card className="shadow-sm">
        <CardContent className="p-6">
          <div className="relative mb-6">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
            <Input
              placeholder="Buscar productos por nombre, código, categoría..."
              className="pl-10"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          {!isLoading && categorias.length > 0 && generateCategoryTabs()}
          {!isLoading && (marcas.length > 0 || proveedores.length > 0) && renderFilters()}

          {isLoading ? (
            <LoadingState message="Cargando productos..." />
          ) : filteredProductos.length === 0 ? (
            <EmptyState
              message={
                searchQuery || activeFilter || activeTab !== "todos"
                  ? "No se encontraron productos con los filtros aplicados"
                  : "No hay productos registrados"
              }
              onAdd={handleCreate}
            />
          ) : (
            <div className="rounded-md border overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow className="bg-slate-50">
                    <TableHead>Código</TableHead>
                    <TableHead>Nombre</TableHead>
                    <TableHead>Categoría</TableHead>
                    <TableHead>Marca</TableHead>
                    <TableHead>Proveedor</TableHead>
                    <TableHead className="w-[100px] text-right">Acciones</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredProductos.map((producto) => (
                    <TableRow key={producto.id} className="table-row-hover">
                      <TableCell>
                        <StatusBadge label={producto.codigo} variant="blue" />
                      </TableCell>
                      <TableCell className="font-medium">{producto.nombre}</TableCell>
                      <TableCell>
                        <div className="flex items-center">
                          <Layers className="h-3.5 w-3.5 mr-1.5 text-green-600" />
                          {producto.categoria.nombre}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center">
                          <Tag className="h-3.5 w-3.5 mr-1.5 text-blue-600" />
                          {producto.marca.nombre}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center">
                          <Users className="h-3.5 w-3.5 mr-1.5 text-purple-600" />
                          {producto.proveedor.nombre}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex space-x-1 justify-end">
                          <EditButton onClick={() => handleEdit(producto)} />
                          <DeleteButton
                            onDelete={() => producto.id && handleDelete(producto.id)}
                            itemName={`el producto "${producto.nombre}"`}
                          />
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Diálogo para crear/editar producto */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>{isEditing ? "Editar producto" : "Crear nuevo producto"}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="codigo">Código *</Label>
              <div className="relative">
                <Hash className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                <Input
                  id="codigo"
                  value={currentProducto.codigo}
                  onChange={(e) => setCurrentProducto({ ...currentProducto, codigo: e.target.value })}
                  placeholder="Código único del producto"
                  disabled={isEditing} // No permitir editar el código si está editando
                  className="pl-10 focus-visible:ring-primary"
                />
              </div>
              {formErrors.codigo && <p className="text-sm text-red-500">{formErrors.codigo}</p>}
            </div>
            <div className="space-y-2">
              <Label htmlFor="nombre">Nombre *</Label>
              <div className="relative">
                <Package className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                <Input
                  id="nombre"
                  value={currentProducto.nombre}
                  onChange={(e) => setCurrentProducto({ ...currentProducto, nombre: e.target.value })}
                  placeholder="Nombre del producto"
                  className="pl-10 focus-visible:ring-primary"
                />
              </div>
              {formErrors.nombre && <p className="text-sm text-red-500">{formErrors.nombre}</p>}
            </div>
            <div className="space-y-2">
              <Label htmlFor="descripcion">Descripción</Label>
              <Textarea
                id="descripcion"
                value={currentProducto.descripcion || ""}
                onChange={(e) => setCurrentProducto({ ...currentProducto, descripcion: e.target.value })}
                placeholder="Descripción del producto (opcional)"
                rows={3}
                className="focus-visible:ring-primary"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="categoria">Categoría *</Label>
              <div className="relative">
                <Layers className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4 z-10" />
                <Select value={currentProducto.categoria.id?.toString() || ""} onValueChange={handleCategoriaChange}>
                  <SelectTrigger id="categoria" className="pl-10 focus-visible:ring-primary">
                    <SelectValue placeholder="Selecciona una categoría" />
                  </SelectTrigger>
                  <SelectContent>
                    {categorias.map((categoria) => (
                      <SelectItem key={categoria.id} value={categoria.id?.toString() || ""}>
                        {categoria.nombre}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              {formErrors.categoria && <p className="text-sm text-red-500">{formErrors.categoria}</p>}
              {categorias.length === 0 && (
                <p className="text-sm text-amber-600">
                  No hay categorías disponibles. Debes crear al menos una categoría.
                </p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="marca">Marca *</Label>
              <div className="relative">
                <Tag className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4 z-10" />
                <Select value={currentProducto.marca.id?.toString() || ""} onValueChange={handleMarcaChange}>
                  <SelectTrigger id="marca" className="pl-10 focus-visible:ring-primary">
                    <SelectValue placeholder="Selecciona una marca" />
                  </SelectTrigger>
                  <SelectContent>
                    {marcas.map((marca) => (
                      <SelectItem key={marca.id} value={marca.id?.toString() || ""}>
                        {marca.nombre}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              {formErrors.marca && <p className="text-sm text-red-500">{formErrors.marca}</p>}
              {marcas.length === 0 && (
                <p className="text-sm text-amber-600">No hay marcas disponibles. Debes crear al menos una marca.</p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="proveedor">Proveedor *</Label>
              <div className="relative">
                <Users className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4 z-10" />
                <Select value={currentProducto.proveedor.id?.toString() || ""} onValueChange={handleProveedorChange}>
                  <SelectTrigger id="proveedor" className="pl-10 focus-visible:ring-primary">
                    <SelectValue placeholder="Selecciona un proveedor" />
                  </SelectTrigger>
                  <SelectContent>
                    {proveedores.map((proveedor) => (
                      <SelectItem key={proveedor.id} value={proveedor.id?.toString() || ""}>
                        {proveedor.nombre} ({proveedor.codigo})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              {formErrors.proveedor && <p className="text-sm text-red-500">{formErrors.proveedor}</p>}
              {proveedores.length === 0 && (
                <p className="text-sm text-amber-600">
                  No hay proveedores disponibles. Debes crear al menos un proveedor.
                </p>
              )}
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
              Cancelar
            </Button>
            <Button onClick={handleSave}>{isEditing ? "Actualizar" : "Crear"}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
