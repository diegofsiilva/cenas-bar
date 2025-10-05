"use client"

import { useState, useEffect, useMemo } from "react"
import { Button } from "@/components/ui/button"
import { AddTableDialog } from "@/components/add-table-dialog"
import { TableCard } from "@/components/table-card"
import { CommandDialog } from "@/components/command-dialog"
import type { Table, Command, Sale } from "@/lib/types"
import { tableStorage, commandStorage, saleStorage, productStorage, stockMovementStorage } from "@/lib/storage"
import { useToast } from "@/hooks/use-toast"
import { Trash2 } from "lucide-react"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"

export default function TablesPage() {
  const [tables, setTables] = useState<Table[]>([])
  const [commands, setCommands] = useState<Command[]>([])
  const [selectedCommand, setSelectedCommand] = useState<Command | null>(null)
  const [commandDialogOpen, setCommandDialogOpen] = useState(false)
  const [tableToDelete, setTableToDelete] = useState<Table | null>(null)
  const { toast } = useToast()

  useEffect(() => {
    loadData()
  }, [])

  const loadData = () => {
    setTables(tableStorage.getAll())
    setCommands(commandStorage.getAll())
  }

  const handleAddTable = (tableData: Omit<Table, "id" | "createdAt">) => {
    const newTable: Table = {
      id: crypto.randomUUID(),
      ...tableData,
      createdAt: new Date().toISOString(),
    }
    tableStorage.add(newTable)
    loadData()
    toast({
      title: "Sucesso",
      description: "Mesa adicionada com sucesso",
    })
  }

  const handleOpenCommand = (table: Table) => {
    const newCommand: Command = {
      id: crypto.randomUUID(),
      tableId: table.id,
      tableName: table.name,
      openedAt: new Date().toISOString(),
      status: "open",
      items: [],
      total: 0,
    }
    commandStorage.add(newCommand)
    setSelectedCommand(newCommand)
    setCommandDialogOpen(true)
    loadData()
  }

  const handleViewCommand = (command: Command) => {
    setSelectedCommand(command)
    setCommandDialogOpen(true)
  }

  const handleSaveCommand = (command: Command) => {
    commandStorage.update(command.id, command)
    loadData()
  }

  const handleFinalizeCommand = (command: Command, paymentMethod: "cash" | "card" | "pix") => {
    // Update stock for each item
    command.items.forEach((item) => {
      const product = productStorage.getAll().find((p) => p.id === item.productId)
      if (product) {
        productStorage.update(product.id, {
          stockQuantity: product.stockQuantity - item.quantity,
        })

        // Record stock movement
        stockMovementStorage.add({
          id: crypto.randomUUID(),
          productId: product.id,
          productName: product.name,
          type: "out",
          quantity: item.quantity,
          reason: `Venda - Comanda ${command.tableName}`,
          performedBy: "Sistema",
          performedAt: new Date().toISOString(),
        })
      }
    })

    // Create sale record
    const sale: Sale = {
      id: crypto.randomUUID(),
      commandId: command.id,
      tableId: command.tableId,
      tableName: command.tableName,
      items: command.items,
      total: command.total,
      paymentMethod,
      soldBy: "Sistema",
      soldAt: new Date().toISOString(),
    }
    saleStorage.add(sale)

    // Close command
    commandStorage.update(command.id, {
      status: "closed",
      closedAt: new Date().toISOString(),
    })

    setCommandDialogOpen(false)
    setSelectedCommand(null)
    loadData()

    toast({
      title: "Venda finalizada",
      description: `Total: R$ ${command.total.toFixed(2)}`,
    })
  }

  const handleDeleteTable = (table: Table) => {
    const openCommand = commands.find((c) => c.tableId === table.id && c.status === "open")
    if (openCommand) {
      toast({
        title: "Erro",
        description: "Não é possível excluir uma mesa com comanda aberta",
        variant: "destructive",
      })
      return
    }
    setTableToDelete(table)
  }

  const confirmDeleteTable = () => {
    if (tableToDelete) {
      tableStorage.delete(tableToDelete.id)
      loadData()
      toast({
        title: "Sucesso",
        description: "Mesa excluída com sucesso",
      })
      setTableToDelete(null)
    }
  }

  const getCommandForTable = useMemo(() => {
    return (tableId: string) => {
      return commands.find((c) => c.tableId === tableId && c.status === "open")
    }
  }, [commands])

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Mesas e Comandas</h1>
          <p className="text-muted-foreground">Gerencie mesas e comandas abertas</p>
        </div>
        <AddTableDialog onAdd={handleAddTable} />
      </div>

      {tables.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-muted-foreground mb-4">Nenhuma mesa cadastrada</p>
          <AddTableDialog onAdd={handleAddTable} />
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {tables.map((table) => (
            <div key={table.id} className="relative group">
              <TableCard
                table={table}
                command={getCommandForTable(table.id)}
                onOpenCommand={handleOpenCommand}
                onViewCommand={handleViewCommand}
              />
              <Button
                size="icon"
                variant="destructive"
                className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity"
                onClick={() => handleDeleteTable(table)}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          ))}
        </div>
      )}

      <CommandDialog
        command={selectedCommand}
        open={commandDialogOpen}
        onClose={() => {
          setCommandDialogOpen(false)
          setSelectedCommand(null)
        }}
        onSave={handleSaveCommand}
        onFinalize={handleFinalizeCommand}
      />

      <AlertDialog open={!!tableToDelete} onOpenChange={() => setTableToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmar exclusão</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja excluir a mesa "{tableToDelete?.name}"? Esta ação não pode ser desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDeleteTable}>Excluir</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
