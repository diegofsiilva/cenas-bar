"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { StockAdjustmentDialog } from "@/components/stock-adjustment-dialog"
import type { Product, StockMovement } from "@/lib/types"
import { productStorage, stockMovementStorage } from "@/lib/storage"
import { useToast } from "@/hooks/use-toast"
import { Package, TrendingUp, TrendingDown, AlertTriangle, Search, Plus, Minus, Settings } from "lucide-react"
import { format } from "date-fns"
import { ptBR } from "date-fns/locale"

export default function InventoryPage() {
  const [products, setProducts] = useState<Product[]>([])
  const [movements, setMovements] = useState<StockMovement[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [typeFilter, setTypeFilter] = useState<string>("all")
  const { toast } = useToast()

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    const [productsData, movementsData] = await Promise.all([productStorage.getAll(), stockMovementStorage.getAll()])
    setProducts(productsData)
    const sortedMovements = movementsData.sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
    )
    setMovements(sortedMovements)
  }

  const handleStockAdjustment = async (movementData: Omit<StockMovement, "id" | "performedAt">) => {
    const product = products.find((p) => p.id === movementData.productId)
    if (!product) return

    let newStock = product.stock

    switch (movementData.type) {
      case "in":
        newStock += movementData.quantity
        break
      case "out":
        newStock -= movementData.quantity
        break
      case "adjustment":
        newStock = movementData.quantity
        break
    }

    if (newStock < 0) {
      toast({
        title: "Erro",
        description: "Estoque não pode ser negativo",
        variant: "destructive",
      })
      return
    }

    // Update product stock
    await productStorage.update(product.id, { stock: newStock })

    // Record movement
    const movement: StockMovement = {
      id: crypto.randomUUID(),
      ...movementData,
      performedBy: "Sistema",
      createdAt: new Date().toISOString(),
    }
    await stockMovementStorage.add(movement)

    await loadData()
    toast({
      title: "Sucesso",
      description: "Estoque atualizado com sucesso",
    })
  }

  const filteredMovements = movements.filter((movement) => {
    const matchesSearch = movement.productName.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesType = typeFilter === "all" || movement.type === typeFilter
    return matchesSearch && matchesType
  })

  const lowStockProducts = products.filter((p) => p.stock <= 10)
  const totalProducts = products.length
  const totalStockValue = products.reduce((sum, p) => sum + p.price * p.stock, 0)

  const getMovementIcon = (type: string) => {
    switch (type) {
      case "in":
        return <Plus className="h-4 w-4 text-green-500" />
      case "out":
        return <Minus className="h-4 w-4 text-red-500" />
      case "adjustment":
        return <Settings className="h-4 w-4 text-blue-500" />
      default:
        return null
    }
  }

  const getMovementLabel = (type: string) => {
    switch (type) {
      case "in":
        return "Entrada"
      case "out":
        return "Saída"
      case "adjustment":
        return "Ajuste"
      default:
        return type
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Controle de Estoque</h1>
          <p className="text-muted-foreground">Gerencie o inventário e movimentações</p>
        </div>
        <StockAdjustmentDialog onAdjust={handleStockAdjustment} />
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total de Produtos</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalProducts}</div>
            <p className="text-xs text-muted-foreground">Produtos cadastrados</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Valor em Estoque</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">R$ {totalStockValue.toFixed(2)}</div>
            <p className="text-xs text-muted-foreground">Valor total do inventário</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Estoque Baixo</CardTitle>
            <AlertTriangle className="h-4 w-4 text-destructive" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-destructive">{lowStockProducts.length}</div>
            <p className="text-xs text-muted-foreground">Produtos com estoque baixo</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Movimentações</CardTitle>
            <TrendingDown className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{movements.length}</div>
            <p className="text-xs text-muted-foreground">Total de movimentações</p>
          </CardContent>
        </Card>
      </div>

      {lowStockProducts.length > 0 && (
        <Card className="border-destructive">
          <CardHeader>
            <CardTitle className="text-destructive flex items-center gap-2">
              <AlertTriangle className="h-5 w-5" />
              Produtos com Estoque Baixo
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {lowStockProducts.map((product) => (
                <div key={product.id} className="flex items-center justify-between p-3 bg-destructive/10 rounded-md">
                  <div>
                    <p className="font-medium">{product.name}</p>
                    <p className="text-sm text-muted-foreground">{product.categoryName}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-destructive">
                      {product.stock} / {product.minStockAlert}
                    </p>
                    <p className="text-xs text-muted-foreground">Atual / Mínimo</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      <div>
        <h2 className="text-xl font-semibold mb-4">Histórico de Movimentações</h2>

        <div className="flex gap-4 mb-4">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Buscar por produto..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9"
            />
          </div>
          <Select value={typeFilter} onValueChange={setTypeFilter}>
            <SelectTrigger className="w-[200px]">
              <SelectValue placeholder="Tipo de movimentação" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todas</SelectItem>
              <SelectItem value="in">Entrada</SelectItem>
              <SelectItem value="out">Saída</SelectItem>
              <SelectItem value="adjustment">Ajuste</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {filteredMovements.length === 0 ? (
          <div className="text-center py-12">
            <Package className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <p className="text-muted-foreground">Nenhuma movimentação registrada</p>
          </div>
        ) : (
          <div className="space-y-3">
            {filteredMovements.map((movement) => (
              <Card key={movement.id}>
                <CardContent className="p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        {getMovementIcon(movement.type)}
                        <span className="font-semibold">{movement.productName}</span>
                        <Badge variant="secondary">{getMovementLabel(movement.type)}</Badge>
                      </div>
                      <p className="text-sm text-muted-foreground mb-1">{movement.reason}</p>
                      <div className="flex items-center gap-4 text-xs text-muted-foreground">
                        <span>{format(new Date(movement.createdAt), "PPp", { locale: ptBR })}</span>
                        <span>Por: {movement.performedBy}</span>
                      </div>
                    </div>
                    <div className="text-right">
                      <div
                        className={`text-2xl font-bold ${
                          movement.type === "in"
                            ? "text-green-500"
                            : movement.type === "out"
                              ? "text-red-500"
                              : "text-blue-500"
                        }`}
                      >
                        {movement.type === "in" ? "+" : movement.type === "out" ? "-" : ""}
                        {movement.quantity}
                      </div>
                      <p className="text-xs text-muted-foreground">unidades</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
