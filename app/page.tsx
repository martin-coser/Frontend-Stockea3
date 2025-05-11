import { Card, CardContent } from "@/components/ui/card"

export default function Home() {
  return (
    <div className="space-y-6">
      <div className="page-header">
        <h1 className="text-3xl font-bold tracking-tight mb-1">Bienvenido a Stockea3</h1>
        <p className="text-muted-foreground">Sistema de gestión de inventario</p>
      </div>

      <Card>
        <CardContent className="p-6">
          <div className="text-center py-12">
            <h2 className="text-2xl font-semibold mb-4">Sistema de Gestión de Stock</h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Utiliza el menú lateral para navegar por las diferentes secciones del sistema y gestionar tu inventario de
              manera eficiente.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
