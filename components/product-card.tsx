"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import type { Product } from "@/lib/types"
import { Package, AlertTriangle, Pencil, Trash2 } from "lucide-react"

interface ProductCardProps {
  product: Product
  onEdit?: (product: Product) => void
  onDelete?: (product: Product) => void
  isAdmin?: boolean
}

export function ProductCard({ product, onEdit, onDelete, isAdmin }: ProductCardProps) {
  const isLowStock = product.stockQuantity <= product.minStockAlert

  return (
    <Card className={isLowStock ? "border-destructive" : ""}>
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <CardTitle className="text-lg flex items-center gap-2">
              <Package className="h-5 w-5" />
              {product.name}
            </CardTitle>
            <Badge variant="secondary" className="mt-1">
              {product.categoryName}
            </Badge>
          </div>
          {isAdmin && (
            <div className="flex gap-1">
              <Button size="icon" variant="ghost" onClick={() => onEdit?.(product)}>
                <Pencil className="h-4 w-4" />
              </Button>
              <Button size="icon" variant="ghost" onClick={() => onDelete?.(product)}>
                <Trash2 className="h-4 w-4 text-destructive" />
              </Button>
            </div>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-2">
        <div className="flex justify-between items-center">
          <span className="text-sm text-muted-foreground">Preço:</span>
          <span className="font-semibold text-lg">R$ {product.price.toFixed(2)}</span>
        </div>
        <div className="flex justify-between items-center">
          <span className="text-sm text-muted-foreground">Estoque:</span>
          <div className="flex items-center gap-2">
            {isLowStock && <AlertTriangle className="h-4 w-4 text-destructive" />}
            <span className={isLowStock ? "text-destructive font-semibold" : ""}>{product.stockQuantity}</span>
          </div>
        </div>
        {isLowStock && <p className="text-xs text-destructive mt-2">Estoque baixo! Mínimo: {product.minStockAlert}</p>}
      </CardContent>
    </Card>
  )
}
