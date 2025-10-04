"use client"

import type React from "react"

import { LicenseBanner } from "@/components/license-banner"
import { Button } from "@/components/ui/button"
import { LayoutDashboard, Package, ShoppingCart, BarChart3, UtensilsCrossed, Warehouse } from "lucide-react"
import Link from "next/link"

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen bg-background">
      {/* Sidebar */}
      <aside className="fixed left-0 top-0 h-screen w-64 border-r bg-card flex flex-col">
        <div className="flex h-16 items-center gap-2 border-b px-6 flex-shrink-0">
        <img src="/logo.png" alt="Logo" className="h-20 w-20" />
          <span className="font-bold text-lg">Cenas Bar e Lounge</span>
        </div>

        <nav className="flex flex-col gap-1 p-4 flex-1 overflow-y-auto">
          <Link href="/dashboard">
            <Button variant="ghost" className="w-full justify-start gap-2">
              <LayoutDashboard className="h-4 w-4" />
              Dashboard
            </Button>
          </Link>

          <Link href="/dashboard/tables">
            <Button variant="ghost" className="w-full justify-start gap-2">
              <UtensilsCrossed className="h-4 w-4" />
              Mesas/Comandas
            </Button>
          </Link>

          <Link href="/dashboard/products">
            <Button variant="ghost" className="w-full justify-start gap-2">
              <Package className="h-4 w-4" />
              Produtos
            </Button>
          </Link>

          <Link href="/dashboard/sales">
            <Button variant="ghost" className="w-full justify-start gap-2">
              <ShoppingCart className="h-4 w-4" />
              Vendas
            </Button>
          </Link>

          <Link href="/dashboard/inventory">
            <Button variant="ghost" className="w-full justify-start gap-2">
              <Warehouse className="h-4 w-4" />
              Estoque
            </Button>
          </Link>

          <Link href="/dashboard/reports">
            <Button variant="ghost" className="w-full justify-start gap-2">
              <BarChart3 className="h-4 w-4" />
              Relatórios
            </Button>
          </Link>
        </nav>
      </aside>

      {/* Main Content */}
      <main className="flex-1 ml-64 overflow-auto">
        <div className="container mx-auto p-6">
          <LicenseBanner />
          {children}
        </div>
      </main>
    </div>
  )
}
