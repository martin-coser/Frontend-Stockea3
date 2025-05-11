"use client"

import { useState, useEffect } from "react"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useToast } from "@/hooks/use-toast"
import { type Proveedor, ProveedorService } from "@/lib/api-service"
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
import { Card } from "@/components/ui/card"
import { Search, Phone, Hash, User } from "lucide-react"

export default function ProveedoresPage() {
  const [proveedores, setProveedores] = useState<Proveedor[]>([])
  const [filteredProveedores, setFilteredProveedores] = useState<Proveedor[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [currentProveedor, setCurrentProveedor] = useState<Proveedor>({
    codigo: "",
    nombre: "",
    telefono: "",
    cuit: "",
  })
  const [isEditing, setIsEditing] = useState(false)
  const [formErrors, setFormErrors] = useState<Record<string, string>>({})
  const [searchQuery, setSearchQuery] = useState("")
  const { toast } = useToast()

  // Cargar proveedores
  useEffect(() => {
    loadProveedores()
  }, [])

  // Filtrar proveedores cuando cambia la búsqueda
  useEffect(() => {
    if (searchQuery.trim() === "") {
      setFilteredProveedores(proveedores)
    } else {
      const query = searchQuery.toLowerCase()
      const filtered = proveedores.filter(
        (proveedor) =>
          proveedor.nombre.toLowerCase().includes(query) ||
          proveedor.codigo.toLowerCase().includes(query) ||
          proveedor.telefono.includes(query) ||
          proveedor.cuit.includes(query),
      )
      setFilteredProveedores(filtered)
    }
  }, [searchQuery, proveedores])

  const loadProveedores = async () => {
    try {
      setIsLoading(true)
      setError(null)
      const data = await ProveedorService.getAll()
      setProveedores(data)
      setFilteredProveedores(data)
    } catch (err) {
      setError("Error al cargar los proveedores. Por favor, intenta nuevamente.")
      console.error(err)
    } finally {
      setIsLoading(false)
    }
  }

  // Abrir diálogo para crear
  const handleCreate = () => {
    setCurrentProveedor({ codigo: "", nombre: "", telefono: "", cuit: "" })
    setIsEditing(false)
    setFormErrors({})
    setIsDialogOpen(true)
  }

  // Abrir diálogo para editar
  const handleEdit = (proveedor: Proveedor) => {
    setCurrentProveedor({ ...proveedor })
    setIsEditing(true)
    setFormErrors({})
    setIsDialogOpen(true)
  }

  // Validar formulario
  const validateForm = () => {
    const errors: Record<string, string> = {}

    if (!currentProveedor.codigo.trim()) {
      errors.codigo = "El código es obligatorio"
    }

    if (!currentProveedor.nombre.trim()) {
      errors.nombre = "El nombre es obligatorio"
    }

    if (!currentProveedor.telefono.trim()) {
      errors.telefono = "El teléfono es obligatorio"
    } else if (!/^\d{7,15}$/.test(currentProveedor.telefono.replace(/\D/g, ""))) {
      errors.telefono = "El teléfono debe tener entre 7 y 15 dígitos"
    }

    if (!currentProveedor.cuit.trim()) {
      errors.cuit = "El CUIT es obligatorio"
    } else if (!/^\d{11}$/.test(currentProveedor.cuit.replace(/\D/g, ""))) {
      errors.cuit = "El CUIT debe tener 11 dígitos"
    }

    setFormErrors(errors)
    return Object.keys(errors).length === 0
  }

  // Guardar proveedor (crear o actualizar)
  const handleSave = async () => {
    try {
      if (!validateForm()) {
        return
      }

      if (isEditing && currentProveedor.id) {
        await ProveedorService.update(currentProveedor.id, currentProveedor)
        toast({
          title: "Proveedor actualizado",
          description: `El proveedor ${currentProveedor.nombre} ha sido actualizado correctamente`,
        })
      } else {
        await ProveedorService.create(currentProveedor)
        toast({
          title: "Proveedor creado",
          description: `El proveedor ${currentProveedor.nombre} ha sido creado correctamente`,
        })
      }

      setIsDialogOpen(false)
      loadProveedores()
    } catch (err: any) {
      // Manejar errores específicos como duplicación de código
      if (err.message?.includes("unique")) {
        setFormErrors({
          ...formErrors,
          codigo: "Este código ya está en uso por otro proveedor",
        })
      } else {
        toast({
          title: "Error",
          description: isEditing
            ? "Error al actualizar el proveedor. Por favor, intenta nuevamente."
            : "Error al crear el proveedor. Por favor, intenta nuevamente.",
          variant: "destructive",
        })
      }
      console.error(err)
    }
  }

  // Eliminar proveedor
  const handleDelete = async (id: number) => {
    try {
      await ProveedorService.delete(id)
      toast({
        title: "Proveedor eliminado",
        description: "El proveedor ha sido eliminado correctamente",
      })
      loadProveedores()
    } catch (err) {
      toast({
        title: "Error",
        description: "Error al eliminar el proveedor. Por favor, intenta nuevamente.",
        variant: "destructive",
      })
      console.error(err)
    }
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Proveedores"
        description="Gestiona los proveedores de tus productos"
        action={<AddButton onClick={handleCreate} />}
      />

      {error && <ErrorMessage message={error} />}

      <Card className="overflow-hidden shadow-sm">
        <div className="p-4 border-b">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
            <Input
              placeholder="Buscar proveedores..."
              className="pl-10 max-w-md"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>

        {isLoading ? (
          <LoadingState message="Cargando proveedores..." />
        ) : filteredProveedores.length === 0 ? (
          <EmptyState
            message={searchQuery ? "No se encontraron proveedores con tu búsqueda" : "No hay proveedores registrados"}
            onAdd={handleCreate}
          />
        ) : (
          <div className="rounded-md">
            <Table>
              <TableHeader>
                <TableRow className="bg-slate-50">
                  <TableHead>Código</TableHead>
                  <TableHead>Nombre</TableHead>
                  <TableHead>Teléfono</TableHead>
                  <TableHead>CUIT</TableHead>
                  <TableHead className="w-[100px] text-right">Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredProveedores.map((proveedor) => (
                  <TableRow key={proveedor.id} className="table-row-hover">
                    <TableCell>
                      <StatusBadge label={proveedor.codigo} variant="purple" />
                    </TableCell>
                    <TableCell className="font-medium">{proveedor.nombre}</TableCell>
                    <TableCell>{proveedor.telefono}</TableCell>
                    <TableCell>{proveedor.cuit}</TableCell>
                    <TableCell>
                      <div className="flex space-x-1 justify-end">
                        <EditButton onClick={() => handleEdit(proveedor)} />
                        <DeleteButton
                          onDelete={() => proveedor.id && handleDelete(proveedor.id)}
                          itemName={`el proveedor "${proveedor.nombre}"`}
                        />
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </Card>

      {/* Diálogo para crear/editar proveedor */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>{isEditing ? "Editar proveedor" : "Crear nuevo proveedor"}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="codigo">Código *</Label>
              <div className="relative">
                <Hash className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                <Input
                  id="codigo"
                  value={currentProveedor.codigo}
                  onChange={(e) => setCurrentProveedor({ ...currentProveedor, codigo: e.target.value })}
                  placeholder="Código único del proveedor"
                  disabled={isEditing} // No permitir editar el código si está editando
                  className="pl-10 focus-visible:ring-primary"
                />
              </div>
              {formErrors.codigo && <p className="text-sm text-red-500">{formErrors.codigo}</p>}
            </div>
            <div className="space-y-2">
              <Label htmlFor="nombre">Nombre *</Label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                <Input
                  id="nombre"
                  value={currentProveedor.nombre}
                  onChange={(e) => setCurrentProveedor({ ...currentProveedor, nombre: e.target.value })}
                  placeholder="Nombre del proveedor"
                  className="pl-10 focus-visible:ring-primary"
                />
              </div>
              {formErrors.nombre && <p className="text-sm text-red-500">{formErrors.nombre}</p>}
            </div>
            <div className="space-y-2">
              <Label htmlFor="telefono">Teléfono *</Label>
              <div className="relative">
                <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                <Input
                  id="telefono"
                  value={currentProveedor.telefono}
                  onChange={(e) => setCurrentProveedor({ ...currentProveedor, telefono: e.target.value })}
                  placeholder="Teléfono del proveedor"
                  className="pl-10 focus-visible:ring-primary"
                />
              </div>
              {formErrors.telefono && <p className="text-sm text-red-500">{formErrors.telefono}</p>}
            </div>
            <div className="space-y-2">
              <Label htmlFor="cuit">CUIT *</Label>
              <div className="relative">
                <Hash className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                <Input
                  id="cuit"
                  value={currentProveedor.cuit}
                  onChange={(e) => setCurrentProveedor({ ...currentProveedor, cuit: e.target.value })}
                  placeholder="CUIT del proveedor"
                  className="pl-10 focus-visible:ring-primary"
                />
              </div>
              {formErrors.cuit && <p className="text-sm text-red-500">{formErrors.cuit}</p>}
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
