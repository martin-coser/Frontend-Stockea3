"use client"

import { useState, useEffect } from "react"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { useToast } from "@/hooks/use-toast"
import { type Categoria, CategoriaService } from "@/lib/api-service"
import {
  AddButton,
  EditButton,
  DeleteButton,
  ErrorMessage,
  EmptyState,
  LoadingState,
  PageHeader,
} from "@/components/ui-components"
import { Card } from "@/components/ui/card"
import { Search } from "lucide-react"

export default function CategoriasPage() {
  const [categorias, setCategorias] = useState<Categoria[]>([])
  const [filteredCategorias, setFilteredCategorias] = useState<Categoria[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [currentCategoria, setCurrentCategoria] = useState<Categoria>({ nombre: "", descripcion: "" })
  const [isEditing, setIsEditing] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const { toast } = useToast()

  // Cargar categorías
  useEffect(() => {
    loadCategorias()
  }, [])

  // Filtrar categorías cuando cambia la búsqueda
  useEffect(() => {
    if (searchQuery.trim() === "") {
      setFilteredCategorias(categorias)
    } else {
      const query = searchQuery.toLowerCase()
      const filtered = categorias.filter(
        (categoria) =>
          categoria.nombre.toLowerCase().includes(query) ||
          (categoria.descripcion && categoria.descripcion.toLowerCase().includes(query)),
      )
      setFilteredCategorias(filtered)
    }
  }, [searchQuery, categorias])

  const loadCategorias = async () => {
    try {
      setIsLoading(true)
      setError(null)
      const data = await CategoriaService.getAll()
      setCategorias(data)
      setFilteredCategorias(data)
    } catch (err) {
      setError("Error al cargar las categorías. Por favor, intenta nuevamente.")
      console.error(err)
    } finally {
      setIsLoading(false)
    }
  }

  // Abrir diálogo para crear
  const handleCreate = () => {
    setCurrentCategoria({ nombre: "", descripcion: "" })
    setIsEditing(false)
    setIsDialogOpen(true)
  }

  // Abrir diálogo para editar
  const handleEdit = (categoria: Categoria) => {
    setCurrentCategoria({ ...categoria })
    setIsEditing(true)
    setIsDialogOpen(true)
  }

  // Guardar categoría (crear o actualizar)
  const handleSave = async () => {
    try {
      if (!currentCategoria.nombre.trim()) {
        toast({
          title: "Error",
          description: "El nombre de la categoría es obligatorio",
          variant: "destructive",
        })
        return
      }

      if (isEditing && currentCategoria.id) {
        await CategoriaService.update(currentCategoria.id, currentCategoria)
        toast({
          title: "Categoría actualizada",
          description: `La categoría ${currentCategoria.nombre} ha sido actualizada correctamente`,
        })
      } else {
        await CategoriaService.create(currentCategoria)
        toast({
          title: "Categoría creada",
          description: `La categoría ${currentCategoria.nombre} ha sido creada correctamente`,
        })
      }

      setIsDialogOpen(false)
      loadCategorias()
    } catch (err) {
      toast({
        title: "Error",
        description: isEditing
          ? "Error al actualizar la categoría. Por favor, intenta nuevamente."
          : "Error al crear la categoría. Por favor, intenta nuevamente.",
        variant: "destructive",
      })
      console.error(err)
    }
  }

  // Eliminar categoría
  const handleDelete = async (id: number) => {
    try {
      await CategoriaService.delete(id)
      toast({
        title: "Categoría eliminada",
        description: "La categoría ha sido eliminada correctamente",
      })
      loadCategorias()
    } catch (err) {
      toast({
        title: "Error",
        description: "Error al eliminar la categoría. Por favor, intenta nuevamente.",
        variant: "destructive",
      })
      console.error(err)
    }
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Categorías"
        description="Gestiona las categorías de tus productos"
        action={<AddButton onClick={handleCreate} />}
      />

      {error && <ErrorMessage message={error} />}

      <Card className="overflow-hidden shadow-sm">
        <div className="p-4 border-b">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
            <Input
              placeholder="Buscar categorías..."
              className="pl-10 max-w-md"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>

        {isLoading ? (
          <LoadingState message="Cargando categorías..." />
        ) : filteredCategorias.length === 0 ? (
          <EmptyState
            message={searchQuery ? "No se encontraron categorías con tu búsqueda" : "No hay categorías registradas"}
            onAdd={handleCreate}
          />
        ) : (
          <div className="rounded-md">
            <Table>
              <TableHeader>
                <TableRow className="bg-slate-50">
                  <TableHead>Nombre</TableHead>
                  <TableHead>Descripción</TableHead>
                  <TableHead className="w-[100px] text-right">Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredCategorias.map((categoria) => (
                  <TableRow key={categoria.id} className="table-row-hover">
                    <TableCell className="font-medium">{categoria.nombre}</TableCell>
                    <TableCell>{categoria.descripcion || "-"}</TableCell>
                    <TableCell>
                      <div className="flex space-x-1 justify-end">
                        <EditButton onClick={() => handleEdit(categoria)} />
                        <DeleteButton
                          onDelete={() => categoria.id && handleDelete(categoria.id)}
                          itemName={`la categoría "${categoria.nombre}"`}
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

      {/* Diálogo para crear/editar categoría */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>{isEditing ? "Editar categoría" : "Crear nueva categoría"}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="nombre">Nombre *</Label>
              <Input
                id="nombre"
                value={currentCategoria.nombre}
                onChange={(e) => setCurrentCategoria({ ...currentCategoria, nombre: e.target.value })}
                placeholder="Nombre de la categoría"
                className="focus-visible:ring-primary"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="descripcion">Descripción</Label>
              <Textarea
                id="descripcion"
                value={currentCategoria.descripcion || ""}
                onChange={(e) => setCurrentCategoria({ ...currentCategoria, descripcion: e.target.value })}
                placeholder="Descripción de la categoría (opcional)"
                rows={3}
                className="focus-visible:ring-primary"
              />
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
