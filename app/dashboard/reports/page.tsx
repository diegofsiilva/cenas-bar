"use client"

import { useState, useEffect, useMemo } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import type { Sale, Product } from "@/lib/types"
import { saleStorage, productStorage } from "@/lib/storage"
import { TrendingUp, DollarSign, ShoppingCart, Package, CreditCard, Banknote, Smartphone, Award } from "lucide-react"
import { format, startOfDay, endOfDay, subDays, isWithinInterval } from "date-fns"
import { Bar, BarChart, CartesianGrid, XAxis, YAxis, Pie, PieChart, Cell, ResponsiveContainer } from "recharts"
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"

type DateRange = "today" | "week" | "month" | "all"

export default function ReportsPage() {
  const [sales, setSales] = useState<Sale[]>([])
  const [products, setProducts] = useState<Product[]>([])
  const [dateRange, setDateRange] = useState<DateRange>("week")

  useEffect(() => {
    setSales(saleStorage.getAll())
    setProducts(productStorage.getAll())
  }, [])

  const filteredSales = useMemo(() => {
    const now = new Date()
    let startDate: Date

    switch (dateRange) {
      case "today":
        startDate = startOfDay(now)
        break
      case "week":
        startDate = subDays(now, 7)
        break
      case "month":
        startDate = subDays(now, 30)
        break
      case "all":
        return sales
      default:
        startDate = subDays(now, 7)
    }

    return sales.filter((sale) =>
      isWithinInterval(new Date(sale.soldAt), {
        start: startDate,
        end: endOfDay(now),
      }),
    )
  }, [sales, dateRange])

  // Calculate statistics
  const totalRevenue = filteredSales.reduce((sum, sale) => sum + sale.total, 0)
  const totalSales = filteredSales.length
  const averageTicket = totalSales > 0 ? totalRevenue / totalSales : 0

  // Payment method breakdown
  const paymentBreakdown = useMemo(() => {
    const breakdown = filteredSales.reduce(
      (acc, sale) => {
        acc[sale.paymentMethod] = (acc[sale.paymentMethod] || 0) + sale.total
        return acc
      },
      {} as Record<string, number>,
    )

    return [
      { name: "Dinheiro", value: breakdown.cash || 0, color: "hsl(var(--chart-1))" },
      { name: "Cartão", value: breakdown.card || 0, color: "hsl(var(--chart-2))" },
      { name: "PIX", value: breakdown.pix || 0, color: "hsl(var(--chart-3))" },
    ].filter((item) => item.value > 0)
  }, [filteredSales])

  // Top selling products
  const topProducts = useMemo(() => {
    const productSales = filteredSales.reduce(
      (acc, sale) => {
        sale.items.forEach((item) => {
          if (!acc[item.productId]) {
            acc[item.productId] = {
              id: item.productId,
              name: item.productName,
              quantity: 0,
              revenue: 0,
            }
          }
          acc[item.productId].quantity += item.quantity
          acc[item.productId].revenue += item.subtotal
        })
        return acc
      },
      {} as Record<string, { id: string; name: string; quantity: number; revenue: number }>,
    )

    return Object.values(productSales)
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, 10)
  }, [filteredSales])

  // Daily revenue chart
  const dailyRevenue = useMemo(() => {
    const revenueByDay = filteredSales.reduce(
      (acc, sale) => {
        const day = format(new Date(sale.soldAt), "dd/MM")
        acc[day] = (acc[day] || 0) + sale.total
        return acc
      },
      {} as Record<string, number>,
    )

    return Object.entries(revenueByDay)
      .map(([day, revenue]) => ({ day, revenue }))
      .slice(-7)
  }, [filteredSales])

  // Product performance chart
  const productPerformance = useMemo(() => {
    return topProducts.slice(0, 5).map((product) => ({
      name: product.name.length > 15 ? product.name.substring(0, 15) + "..." : product.name,
      revenue: product.revenue,
    }))
  }, [topProducts])

  const getPaymentIcon = (method: string) => {
    switch (method) {
      case "Dinheiro":
        return <Banknote className="h-4 w-4" />
      case "Cartão":
        return <CreditCard className="h-4 w-4" />
      case "PIX":
        return <Smartphone className="h-4 w-4" />
      default:
        return null
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Relatórios</h1>
          <p className="text-muted-foreground">Análise de vendas e desempenho</p>
        </div>
        <Select value={dateRange} onValueChange={(value: DateRange) => setDateRange(value)}>
          <SelectTrigger className="w-[200px]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="today">Hoje</SelectItem>
            <SelectItem value="week">Últimos 7 dias</SelectItem>
            <SelectItem value="month">Últimos 30 dias</SelectItem>
            <SelectItem value="all">Todo período</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Receita Total</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">R$ {totalRevenue.toFixed(2)}</div>
            <p className="text-xs text-muted-foreground">
              {dateRange === "today"
                ? "Hoje"
                : dateRange === "week"
                  ? "Últimos 7 dias"
                  : dateRange === "month"
                    ? "Últimos 30 dias"
                    : "Todo período"}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total de Vendas</CardTitle>
            <ShoppingCart className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalSales}</div>
            <p className="text-xs text-muted-foreground">Vendas realizadas</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Ticket Médio</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">R$ {averageTicket.toFixed(2)}</div>
            <p className="text-xs text-muted-foreground">Valor médio por venda</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Produtos Vendidos</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {filteredSales.reduce((sum, sale) => sum + sale.items.reduce((s, item) => s + item.quantity, 0), 0)}
            </div>
            <p className="text-xs text-muted-foreground">Unidades vendidas</p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="revenue" className="space-y-4">
        <TabsList>
          <TabsTrigger value="revenue">Receita</TabsTrigger>
          <TabsTrigger value="products">Produtos</TabsTrigger>
          <TabsTrigger value="payments">Pagamentos</TabsTrigger>
        </TabsList>

        <TabsContent value="revenue" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Receita Diária</CardTitle>
            </CardHeader>
            <CardContent>
              {dailyRevenue.length > 0 ? (
                <ChartContainer
                  config={{
                    revenue: {
                      label: "Receita",
                      color: "hsl(var(--chart-1))",
                    },
                  }}
                  className="h-[300px]"
                >
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={dailyRevenue}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="day" />
                      <YAxis />
                      <ChartTooltip content={<ChartTooltipContent />} />
                      <Bar dataKey="revenue" fill="var(--color-revenue)" radius={[8, 8, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </ChartContainer>
              ) : (
                <div className="h-[300px] flex items-center justify-center text-muted-foreground">
                  Nenhum dado disponível
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="products" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Top 5 Produtos por Receita</CardTitle>
              </CardHeader>
              <CardContent>
                {productPerformance.length > 0 ? (
                  <ChartContainer
                    config={{
                      revenue: {
                        label: "Receita",
                        color: "hsl(var(--chart-2))",
                      },
                    }}
                    className="h-[300px]"
                  >
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={productPerformance} layout="vertical">
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis type="number" />
                        <YAxis dataKey="name" type="category" width={100} />
                        <ChartTooltip content={<ChartTooltipContent />} />
                        <Bar dataKey="revenue" fill="var(--color-revenue)" radius={[0, 8, 8, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </ChartContainer>
                ) : (
                  <div className="h-[300px] flex items-center justify-center text-muted-foreground">
                    Nenhum dado disponível
                  </div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Award className="h-5 w-5" />
                  Produtos Mais Vendidos
                </CardTitle>
              </CardHeader>
              <CardContent>
                {topProducts.length > 0 ? (
                  <div className="space-y-3">
                    {topProducts.slice(0, 10).map((product, index) => (
                      <div key={product.id} className="flex items-center justify-between p-3 bg-muted rounded-lg">
                        <div className="flex items-center gap-3">
                          <Badge variant="secondary" className="w-8 h-8 flex items-center justify-center">
                            {index + 1}
                          </Badge>
                          <div>
                            <p className="font-medium">{product.name}</p>
                            <p className="text-sm text-muted-foreground">{product.quantity} unidades</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="font-semibold">R$ {product.revenue.toFixed(2)}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="h-[300px] flex items-center justify-center text-muted-foreground">
                    Nenhum dado disponível
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="payments" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Distribuição por Forma de Pagamento</CardTitle>
              </CardHeader>
              <CardContent>
                {paymentBreakdown.length > 0 ? (
                  <ChartContainer
                    config={{
                      value: {
                        label: "Valor",
                      },
                    }}
                    className="h-[300px]"
                  >
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={paymentBreakdown}
                          cx="50%"
                          cy="50%"
                          labelLine={false}
                          label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                          outerRadius={80}
                          fill="#8884d8"
                          dataKey="value"
                        >
                          {paymentBreakdown.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                          ))}
                        </Pie>
                        <ChartTooltip content={<ChartTooltipContent />} />
                      </PieChart>
                    </ResponsiveContainer>
                  </ChartContainer>
                ) : (
                  <div className="h-[300px] flex items-center justify-center text-muted-foreground">
                    Nenhum dado disponível
                  </div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Detalhamento por Pagamento</CardTitle>
              </CardHeader>
              <CardContent>
                {paymentBreakdown.length > 0 ? (
                  <div className="space-y-4">
                    {paymentBreakdown.map((payment) => {
                      const percentage = (payment.value / totalRevenue) * 100
                      return (
                        <div key={payment.name} className="space-y-2">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              {getPaymentIcon(payment.name)}
                              <span className="font-medium">{payment.name}</span>
                            </div>
                            <span className="font-semibold">R$ {payment.value.toFixed(2)}</span>
                          </div>
                          <div className="w-full bg-muted rounded-full h-2">
                            <div
                              className="h-2 rounded-full"
                              style={{
                                width: `${percentage}%`,
                                backgroundColor: payment.color,
                              }}
                            />
                          </div>
                          <p className="text-xs text-muted-foreground">{percentage.toFixed(1)}% do total</p>
                        </div>
                      )
                    })}
                  </div>
                ) : (
                  <div className="h-[300px] flex items-center justify-center text-muted-foreground">
                    Nenhum dado disponível
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
