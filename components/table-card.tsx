"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import type { Table, Command } from "@/lib/types"
import { UtensilsCrossed, Plus, Eye } from "lucide-react"

interface TableCardProps {
  table: Table
  command?: Command
  onOpenCommand: (table: Table) => void
  onViewCommand: (command: Command) => void
}

export function TableCard({ table, command, onOpenCommand, onViewCommand }: TableCardProps) {
  const isOpen = command?.status === "open"

  return (
    <Card className={isOpen ? "border-primary" : ""}>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg flex items-center gap-2">
            <UtensilsCrossed className="h-5 w-5" />
            {table.name}
          </CardTitle>
          <Badge variant={isOpen ? "default" : "secondary"}>{isOpen ? "Aberta" : "Livre"}</Badge>
        </div>
        {table.description && <p className="text-sm text-muted-foreground">{table.description}</p>}
      </CardHeader>
      <CardContent>
        {isOpen && command ? (
          <div className="space-y-2">
            <div className="text-sm">
              <p className="text-muted-foreground">Items: {command.items.length}</p>
              <p className="font-semibold text-lg">Total: R$ {command.total.toFixed(2)}</p>
            </div>
            <Button className="w-full" onClick={() => onViewCommand(command)}>
              <Eye className="h-4 w-4 mr-2" />
              Ver Comanda
            </Button>
          </div>
        ) : (
          <Button className="w-full bg-transparent" variant="outline" onClick={() => onOpenCommand(table)}>
            <Plus className="h-4 w-4 mr-2" />
            Abrir Comanda
          </Button>
        )}
      </CardContent>
    </Card>
  )
}
