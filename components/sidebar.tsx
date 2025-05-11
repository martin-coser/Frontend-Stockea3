"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { LayoutDashboard, Tag, Layers, Users, Package, Menu, X, ChevronRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useState } from "react"
import { useMobile } from "@/hooks/use-mobile"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"

export default function Sidebar() {
  const pathname = usePathname()
  const isMobile = useMobile()
  const [isOpen, setIsOpen] = useState(!isMobile)

  const toggleSidebar = () => {
    setIsOpen(!isOpen)
  }

  const navItems = [
    { href: "/", label: "Dashboard", icon: LayoutDashboard },
    { href: "/marcas", label: "Marcas", icon: Tag },
    { href: "/categorias", label: "Categorías", icon: Layers },
    { href: "/proveedores", label: "Proveedores", icon: Users },
    { href: "/productos", label: "Productos", icon: Package },
  ]

  return (
    <>
      {isMobile && (
        <Button
          variant="ghost"
          size="icon"
          className="fixed top-4 left-4 z-50 bg-white shadow-md rounded-full"
          onClick={toggleSidebar}
        >
          {isOpen ? <X size={20} /> : <Menu size={20} />}
        </Button>
      )}

      <div
        className={cn(
          "bg-gradient-to-b from-slate-800 to-slate-900 text-white transition-all duration-300 ease-in-out shadow-xl z-40",
          isOpen ? "w-64" : isMobile ? "w-0" : "w-20",
          isMobile && isOpen ? "fixed inset-y-0 left-0" : "",
        )}
      >
        <div className="p-4 h-full flex flex-col">
          <div className={cn("flex items-center h-16 mb-8", !isOpen && "justify-center", isOpen && "justify-between")}>
            {isOpen ? (
              <>
                <div className="flex items-center">
                  <div className="w-8 h-8 rounded-md gradient-bg flex items-center justify-center mr-2">
                    <span className="font-bold text-white">S3</span>
                  </div>
                  <h1 className="text-xl font-bold">Stockea3</h1>
                </div>
                {!isMobile && (
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 text-slate-300 hover:text-white hover:bg-slate-700 rounded-full"
                    onClick={toggleSidebar}
                  >
                    <ChevronRight size={16} />
                  </Button>
                )}
              </>
            ) : (
              !isMobile && (
                <div className="w-10 h-10 rounded-md gradient-bg flex items-center justify-center">
                  <span className="font-bold text-white">S3</span>
                </div>
              )
            )}
          </div>

          <nav className="space-y-1 flex-1">
            {navItems.map((item) => {
              const Icon = item.icon
              const isActive = pathname === item.href

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "flex items-center py-3 px-4 rounded-md transition-colors sidebar-item",
                    isActive ? "bg-slate-700/50 text-white active" : "text-slate-300 hover:text-white",
                    !isOpen && "justify-center px-2",
                  )}
                  onClick={() => isMobile && setIsOpen(false)}
                >
                  <div className={cn("flex items-center justify-center", isActive ? "text-primary" : "text-slate-400")}>
                    <Icon size={20} />
                  </div>
                  {isOpen && <span className="ml-3 font-medium">{item.label}</span>}
                </Link>
              )
            })}
          </nav>

          <div className="pt-4 border-t border-slate-700/50">
            <div className={cn("flex items-center", !isOpen && "justify-center")}>
              {isOpen ? (
                <div className="flex items-center w-full">
                  <div className="flex items-center">
                    <Avatar className="h-8 w-8 mr-2">
                      <AvatarFallback className="bg-primary text-white">AD</AvatarFallback>
                    </Avatar>
                    <div className="flex flex-col items-start">
                      <p className="text-sm font-medium text-white">Admin</p>
                      <p className="text-xs text-slate-400">admin@stockea3.com</p>
                    </div>
                  </div>
                </div>
              ) : (
                !isMobile && (
                  <Avatar className="h-8 w-8">
                    <AvatarFallback className="bg-primary text-white">AD</AvatarFallback>
                  </Avatar>
                )
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  )
}
