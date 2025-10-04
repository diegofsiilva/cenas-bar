"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import type { Sale } from "@/lib/types"
import { saleStorage } from "@/lib/storage"
import { ShoppingCart, Calendar, CreditCard, Banknote, Smartphone, Search } from "lucide-react"
import { format } from "date-fns"
import { ptBR } from "date-fns/locale"

export default function SalesPage() {
  const [sales, setSales] = useState<Sale[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [paymentFilter, setPaymentFilter] = useState<string>("all")

  useEffect(() => {
    loadSales()
  }, [])

  const loadSales = () => {
    const allSales = saleStorage.getAll().sort((a, b) => new Date(b.soldAt).getTime() - new Date(a.soldAt).getTime())
    setSales(allSales)
  }

  const filteredSales = sales.filter((sale) => {
    const matchesSearch =
      sale.tableName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      sale.soldBy.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesPayment = paymentFilter === "all" || sale.paymentMethod === paymentFilter
    return matchesSearch && matchesPayment
  })

  const totalSales = filteredSales.reduce((sum, sale) => sum + sale.total, 0)

  const getPaymentIcon = (method: string) => {
    switch (method) {
      case "cash":
        return <Banknote className="h-4 w-4" />
      case "card":
        return <CreditCard className="h-4 w-4" />
      case "pix":
        return <Smartphone className="h-4 w-4" />
      default:
        return null
    }
  }

  const getPaymentLabel = (method: string) => {
    switch (method) {
      case "cash":
        return "Dinheiro"
      case "card":
        return "Cartão"
      case "pix":
        return "PIX"
      default:
        return method
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Vendas</h1>
          <p className="text-muted-foreground">Histórico de vendas realizadas</p>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total de Vendas</CardTitle>
            <ShoppingCart className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{filteredSales.length}</div>
            <p className="text-xs text-muted-foreground">Vendas registradas</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Valor Total</CardTitle>
            <Banknote className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">R$ {totalSales.toFixed(2)}</div>
            <p className="text-xs text-muted-foreground">Receita total</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Ticket Médio</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              R$ {filteredSales.length > 0 ? (totalSales / filteredSales.length).toFixed(2) : "0.00"}
            </div>
            <p className="text-xs text-muted-foreground">Valor médio por venda</p>
          </CardContent>
        </Card>
      </div>

      <div className="flex gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Buscar por mesa ou vendedor..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-9"
          />
        </div>
        <Select value={paymentFilter} onValueChange={setPaymentFilter}>
          <SelectTrigger className="w-[200px]">
            <SelectValue placeholder="Forma de pagamento" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todas</SelectItem>
            <SelectItem value="cash">Dinheiro</SelectItem>
            <SelectItem value="card">Cartão</SelectItem>
            <SelectItem value="pix">PIX</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {filteredSales.length === 0 ? (
        <div className="text-center py-12">
          <ShoppingCart className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
          <p className="text-muted-foreground">Nenhuma venda registrada</p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredSales.map((sale) => (
            <Card key={sale.id}>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle className="text-lg">{sale.tableName}</CardTitle>
                    <p className="text-sm text-muted-foreground">
                      {format(new Date(sale.soldAt), "PPp", { locale: ptBR })}
                    </p>
                  </div>
                  <div className="text-right">
                    <div className="text-2xl font-bold">R$ {sale.total.toFixed(2)}</div>
                    <Badge variant="secondary" className="mt-1 gap-1">
                      {getPaymentIcon(sale.paymentMethod)}
                      {getPaymentLabel(sale.paymentMethod)}
                    </Badge>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="text-sm">
                    <span className="text-muted-foreground">Vendedor:</span> {sale.soldBy}
                  </div>
                  <div className="text-sm font-medium">Itens:</div>
                  <div className="space-y-1">
                    {sale.items.map((item) => (
                      <div key={item.id} className="flex justify-between text-sm bg-muted p-2 rounded">
                        <span>
                          {item.quantity}x {item.productName}
                        </span>
                        <span className="font-medium">R$ {item.subtotal.toFixed(2)}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
