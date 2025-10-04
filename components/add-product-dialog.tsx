"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Plus } from "lucide-react"
import type { Product, Category } from "@/lib/types"
import { categoryStorage } from "@/lib/storage"

interface AddProductDialogProps {
  onAdd: (product: Omit<Product, "id" | "createdAt">) => void
  product?: Product
}

export function AddProductDialog({ onAdd, product }: AddProductDialogProps) {
  const [open, setOpen] = useState(false)
  const [categories, setCategories] = useState<Category[]>([])
  const [name, setName] = useState("")
  const [categoryId, setCategoryId] = useState("")
  const [price, setPrice] = useState("")
  const [stockQuantity, setStockQuantity] = useState("")
  const [minStockAlert, setMinStockAlert] = useState("")

  useEffect(() => {
    setCategories(categoryStorage.getAll())
  }, [open])

  useEffect(() => {
    if (product) {
      setName(product.name)
      setCategoryId(product.categoryId)
      setPrice(product.price.toString())
      setStockQuantity(product.stockQuantity.toString())
      setMinStockAlert(product.minStockAlert.toString())
    }
  }, [product])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const category = categories.find((c) => c.id === categoryId)
    if (!category) return

    onAdd({
      name,
      categoryId,
      categoryName: category.name,
      price: Number.parseFloat(price),
      stockQuantity: Number.parseInt(stockQuantity),
      minStockAlert: Number.parseInt(minStockAlert),
    })

    // Reset form
    setName("")
    setCategoryId("")
    setPrice("")
    setStockQuantity("")
    setMinStockAlert("")
    setOpen(false)
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <Plus className="h-4 w-4 mr-2" />
          {product ? "Editar Produto" : "Novo Produto"}
        </Button>
      </DialogTrigger>
      <DialogContent>
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>{product ? "Editar Produto" : "Adicionar Produto"}</DialogTitle>
            <DialogDescription>Cadastre um novo produto no sistema</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="product-name">Nome *</Label>
              <Input
                id="product-name"
                placeholder="Ex: Cerveja, Hambúrguer"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="category">Categoria *</Label>
              <Select value={categoryId} onValueChange={setCategoryId} required>
                <SelectTrigger id="category">
                  <SelectValue placeholder="Selecione uma categoria" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((category) => (
                    <SelectItem key={category.id} value={category.id}>
                      {category.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="price">Preço (R$) *</Label>
                <Input
                  id="price"
                  type="number"
                  step="0.01"
                  min="0"
                  placeholder="0.00"
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="stock">Estoque *</Label>
                <Input
                  id="stock"
                  type="number"
                  min="0"
                  placeholder="0"
                  value={stockQuantity}
                  onChange={(e) => setStockQuantity(e.target.value)}
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="min-stock">Alerta de Estoque Mínimo *</Label>
              <Input
                id="min-stock"
                type="number"
                min="0"
                placeholder="0"
                value={minStockAlert}
                onChange={(e) => setMinStockAlert(e.target.value)}
                required
              />
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Cancelar
            </Button>
            <Button type="submit">{product ? "Salvar" : "Adicionar"}</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
