"use client"

import type React from "react"

import { Button } from "@/components/ui/button"
import { PlusCircle, Trash2, Pencil, AlertCircle, Loader2 } from "lucide-react"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"

// Botón para agregar nuevo registro
export function AddButton({ onClick }: { onClick: () => void }) {
  return (
    <Button onClick={onClick} className="flex items-center gap-1 shadow-sm">
      <PlusCircle className="h-4 w-4" />
      <span>Agregar</span>
    </Button>
  )
}

// Botón para editar
export function EditButton({ onClick }: { onClick: () => void }) {
  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            variant="ghost"
            size="icon"
            onClick={onClick}
            className="h-8 w-8 text-slate-600 hover:text-primary hover:bg-primary/10"
          >
            <Pencil className="h-4 w-4" />
            <span className="sr-only">Editar</span>
          </Button>
        </TooltipTrigger>
        <TooltipContent>
          <p>Editar</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  )
}

// Botón para eliminar con confirmación
export function DeleteButton({ onDelete, itemName = "este registro" }: { onDelete: () => void; itemName?: string }) {
  return (
    <TooltipProvider>
      <Tooltip>
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <TooltipTrigger asChild>
              <Button variant="ghost" size="icon" className="h-8 w-8 text-red-500 hover:text-red-600 hover:bg-red-50">
                <Trash2 className="h-4 w-4" />
                <span className="sr-only">Eliminar</span>
              </Button>
            </TooltipTrigger>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>¿Estás seguro?</AlertDialogTitle>
              <AlertDialogDescription>Esta acción eliminará {itemName} y no se puede deshacer.</AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancelar</AlertDialogCancel>
              <AlertDialogAction onClick={onDelete} className="bg-red-500 hover:bg-red-600">
                Eliminar
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
        <TooltipContent>
          <p>Eliminar</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  )
}

// Componente para mostrar errores
export function ErrorMessage({ message }: { message: string }) {
  return (
    <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg flex items-start gap-2 mb-4 shadow-sm">
      <AlertCircle className="h-5 w-5 mt-0.5 flex-shrink-0" />
      <div>{message}</div>
    </div>
  )
}

// Componente para mostrar cuando no hay datos
export function EmptyState({ message, onAdd }: { message: string; onAdd?: () => void }) {
  return (
    <div className="text-center py-12 border rounded-lg bg-slate-50 shadow-sm">
      <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-slate-100 flex items-center justify-center">
        <AlertCircle className="h-8 w-8 text-slate-400" />
      </div>
      <p className="text-muted-foreground mb-4">{message}</p>
      {onAdd && (
        <Button onClick={onAdd} className="flex items-center gap-1">
          <PlusCircle className="h-4 w-4" />
          <span>Agregar nuevo</span>
        </Button>
      )}
    </div>
  )
}

// Componente para mostrar estado de carga
export function LoadingState({ message = "Cargando datos..." }: { message?: string }) {
  return (
    <div className="text-center py-12 border rounded-lg bg-slate-50 shadow-sm">
      <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-slate-100 flex items-center justify-center">
        <Loader2 className="h-8 w-8 text-primary animate-spin" />
      </div>
      <p className="text-muted-foreground">{message}</p>
    </div>
  )
}

// Componente para mostrar badges de estado
export function StatusBadge({
  label,
  variant = "blue",
}: {
  label: string
  variant?: "blue" | "green" | "amber" | "purple" | "red"
}) {
  const variantClasses = {
    blue: "bg-blue-100 text-blue-700",
    green: "bg-green-100 text-green-700",
    amber: "bg-amber-100 text-amber-700",
    purple: "bg-purple-100 text-purple-700",
    red: "bg-red-100 text-red-700",
  }

  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${variantClasses[variant]}`}
    >
      {label}
    </span>
  )
}

// Componente para encabezado de página
export function PageHeader({
  title,
  description,
  action,
}: {
  title: string
  description?: string
  action?: React.ReactNode
}) {
  return (
    <div className="flex justify-between items-center page-header">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">{title}</h1>
        {description && <p className="text-muted-foreground">{description}</p>}
      </div>
      {action}
    </div>
  )
}
