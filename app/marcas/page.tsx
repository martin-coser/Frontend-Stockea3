"use client"

import { useState, useEffect } from "react"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { useToast } from "@/hooks/use-toast"
import { type Marca, MarcaService } from "@/lib/api-service"
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

export default function MarcasPage() {
  const [marcas, setMarcas] = useState<Marca[]>([])
  const [filteredMarcas, setFilteredMarcas] = useState<Marca[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [currentMarca, setCurrentMarca] = useState<Marca>({ nombre: "", descripcion: "" })
  const [isEditing, setIsEditing] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const { toast } = useToast()

  // Cargar marcas
  useEffect(() => {
    loadMarcas()
  }, [])

  // Filtrar marcas cuando cambia la búsqueda
  useEffect(() => {
    if (searchQuery.trim() === "") {
      setFilteredMarcas(marcas)
    } else {
      const query = searchQuery.toLowerCase()
      const filtered = marcas.filter(
        (marca) =>
          marca.nombre.toLowerCase().includes(query) ||
          (marca.descripcion && marca.descripcion.toLowerCase().includes(query)),
      )
      setFilteredMarcas(filtered)
    }
  }, [searchQuery, marcas])

  const loadMarcas = async () => {
    try {
      setIsLoading(true)
      setError(null)
      const data = await MarcaService.getAll()
      setMarcas(data)
      setFilteredMarcas(data)
    } catch (err) {
      setError("Error al cargar las marcas. Por favor, intenta nuevamente.")
      console.error(err)
    } finally {
      setIsLoading(false)
    }
  }

  // Abrir diálogo para crear
  const handleCreate = () => {
    setCurrentMarca({ nombre: "", descripcion: "" })
    setIsEditing(false)
    setIsDialogOpen(true)
  }

  // Abrir diálogo para editar
  const handleEdit = (marca: Marca) => {
    setCurrentMarca({ ...marca })
    setIsEditing(true)
    setIsDialogOpen(true)
  }

  // Guardar marca (crear o actualizar)
  const handleSave = async () => {
    try {
      if (!currentMarca.nombre.trim()) {
        toast({
          title: "Error",
          description: "El nombre de la marca es obligatorio",
          variant: "destructive",
        })
        return
      }

      if (isEditing && currentMarca.id) {
        await MarcaService.update(currentMarca.id, currentMarca)
        toast({
          title: "Marca actualizada",
          description: `La marca ${currentMarca.nombre} ha sido actualizada correctamente`,
        })
      } else {
        await MarcaService.create(currentMarca)
        toast({
          title: "Marca creada",
          description: `La marca ${currentMarca.nombre} ha sido creada correctamente`,
        })
      }

      setIsDialogOpen(false)
      loadMarcas()
    } catch (err) {
      toast({
        title: "Error",
        description: isEditing
          ? "Error al actualizar la marca. Por favor, intenta nuevamente."
          : "Error al crear la marca. Por favor, intenta nuevamente.",
        variant: "destructive",
      })
      console.error(err)
    }
  }

  // Eliminar marca
  const handleDelete = async (id: number) => {
    try {
      await MarcaService.delete(id)
      toast({
        title: "Marca eliminada",
        description: "La marca ha sido eliminada correctamente",
      })
      loadMarcas()
    } catch (err) {
      toast({
        title: "Error",
        description: "Error al eliminar la marca. Por favor, intenta nuevamente.",
        variant: "destructive",
      })
      console.error(err)
    }
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Marcas"
        description="Gestiona las marcas de tus productos"
        action={<AddButton onClick={handleCreate} />}
      />

      {error && <ErrorMessage message={error} />}

      <Card className="overflow-hidden shadow-sm">
        <div className="p-4 border-b">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
            <Input
              placeholder="Buscar marcas..."
              className="pl-10 max-w-md"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>

        {isLoading ? (
          <LoadingState message="Cargando marcas..." />
        ) : filteredMarcas.length === 0 ? (
          <EmptyState
            message={searchQuery ? "No se encontraron marcas con tu búsqueda" : "No hay marcas registradas"}
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
                {filteredMarcas.map((marca) => (
                  <TableRow key={marca.id} className="table-row-hover">
                    <TableCell className="font-medium">{marca.nombre}</TableCell>
                    <TableCell>{marca.descripcion || "-"}</TableCell>
                    <TableCell>
                      <div className="flex space-x-1 justify-end">
                        <EditButton onClick={() => handleEdit(marca)} />
                        <DeleteButton
                          onDelete={() => marca.id && handleDelete(marca.id)}
                          itemName={`la marca "${marca.nombre}"`}
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

      {/* Diálogo para crear/editar marca */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>{isEditing ? "Editar marca" : "Crear nueva marca"}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="nombre">Nombre *</Label>
              <Input
                id="nombre"
                value={currentMarca.nombre}
                onChange={(e) => setCurrentMarca({ ...currentMarca, nombre: e.target.value })}
                placeholder="Nombre de la marca"
                className="focus-visible:ring-primary"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="descripcion">Descripción</Label>
              <Textarea
                id="descripcion"
                value={currentMarca.descripcion || ""}
                onChange={(e) => setCurrentMarca({ ...currentMarca, descripcion: e.target.value })}
                placeholder="Descripción de la marca (opcional)"
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
