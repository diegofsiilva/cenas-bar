"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { AddCategoryDialog } from "@/components/add-category-dialog"
import { AddProductDialog } from "@/components/add-product-dialog"
import { ProductCard } from "@/components/product-card"
import type { Product, Category } from "@/lib/types"
import { productStorage, categoryStorage } from "@/lib/storage"
import { useToast } from "@/hooks/use-toast"
import { Search, Tag, Trash2 } from "lucide-react"
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
import { Badge } from "@/components/ui/badge"

export default function ProductsPage() {
  const [products, setProducts] = useState<Product[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedCategory, setSelectedCategory] = useState<string>("all")
  const [productToDelete, setProductToDelete] = useState<Product | null>(null)
  const [categoryToDelete, setCategoryToDelete] = useState<Category | null>(null)
  const { toast } = useToast()

  useEffect(() => {
    loadData()
  }, [])

  const loadData = () => {
    setProducts(productStorage.getAll())
    setCategories(categoryStorage.getAll())
  }

  const handleAddCategory = (categoryData: Omit<Category, "id" | "createdAt">) => {
    const newCategory: Category = {
      id: crypto.randomUUID(),
      ...categoryData,
      createdAt: new Date().toISOString(),
    }
    categoryStorage.add(newCategory)
    loadData()
    toast({
      title: "Sucesso",
      description: "Categoria adicionada com sucesso",
    })
  }

  const handleAddProduct = (productData: Omit<Product, "id" | "createdAt">) => {
    const newProduct: Product = {
      id: crypto.randomUUID(),
      ...productData,
      createdAt: new Date().toISOString(),
    }
    productStorage.add(newProduct)
    loadData()
    toast({
      title: "Sucesso",
      description: "Produto adicionado com sucesso",
    })
  }

  const handleDeleteProduct = (product: Product) => {
    setProductToDelete(product)
  }

  const confirmDeleteProduct = () => {
    if (productToDelete) {
      productStorage.delete(productToDelete.id)
      loadData()
      toast({
        title: "Sucesso",
        description: "Produto excluído com sucesso",
      })
      setProductToDelete(null)
    }
  }

  const handleDeleteCategory = (category: Category) => {
    const productsInCategory = products.filter((p) => p.categoryId === category.id)
    if (productsInCategory.length > 0) {
      toast({
        title: "Erro",
        description: "Não é possível excluir uma categoria com produtos",
        variant: "destructive",
      })
      return
    }
    setCategoryToDelete(category)
  }

  const confirmDeleteCategory = () => {
    if (categoryToDelete) {
      categoryStorage.delete(categoryToDelete.id)
      loadData()
      toast({
        title: "Sucesso",
        description: "Categoria excluída com sucesso",
      })
      setCategoryToDelete(null)
    }
  }

  const filteredProducts = products.filter((product) => {
    const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesCategory = selectedCategory === "all" || product.categoryId === selectedCategory
    return matchesSearch && matchesCategory
  })

  const lowStockProducts = products.filter((p) => p.stockQuantity <= p.minStockAlert)

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Produtos</h1>
          <p className="text-muted-foreground">Gerencie produtos e categorias</p>
        </div>
        <div className="flex gap-2">
          <AddCategoryDialog onAdd={handleAddCategory} />
          <AddProductDialog onAdd={handleAddProduct} />
        </div>
      </div>

      {lowStockProducts.length > 0 && (
        <div className="bg-destructive/10 border border-destructive rounded-lg p-4">
          <h3 className="font-semibold text-destructive mb-2">Alerta de Estoque Baixo</h3>
          <p className="text-sm text-muted-foreground">
            {lowStockProducts.length} {lowStockProducts.length === 1 ? "produto está" : "produtos estão"} com estoque
            baixo
          </p>
        </div>
      )}

      <Tabs value={selectedCategory} onValueChange={setSelectedCategory}>
        <div className="flex items-center gap-4 mb-4">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Buscar produtos..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9"
            />
          </div>
        </div>

        <TabsList>
          <TabsTrigger value="all">Todos ({products.length})</TabsTrigger>
          {categories.map((category) => (
            <TabsTrigger key={category.id} value={category.id}>
              {category.name} ({products.filter((p) => p.categoryId === category.id).length})
            </TabsTrigger>
          ))}
        </TabsList>

        <TabsContent value={selectedCategory} className="mt-6">
          {filteredProducts.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-muted-foreground mb-4">Nenhum produto encontrado</p>
              <AddProductDialog onAdd={handleAddProduct} />
            </div>
          ) : (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {filteredProducts.map((product) => (
                <ProductCard key={product.id} product={product} onDelete={handleDeleteProduct} isAdmin={true} />
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>

      {categories.length > 0 && (
        <div className="mt-8">
          <h2 className="text-xl font-semibold mb-4">Categorias</h2>
          <div className="flex flex-wrap gap-2">
            {categories.map((category) => (
              <Badge key={category.id} variant="secondary" className="text-sm py-2 px-3 gap-2">
                <Tag className="h-3 w-3" />
                {category.name}
                <Button
                  size="icon"
                  variant="ghost"
                  className="h-4 w-4 p-0 hover:bg-transparent"
                  onClick={() => handleDeleteCategory(category)}
                >
                  <Trash2 className="h-3 w-3 text-destructive" />
                </Button>
              </Badge>
            ))}
          </div>
        </div>
      )}

      <AlertDialog open={!!productToDelete} onOpenChange={() => setProductToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmar exclusão</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja excluir o produto "{productToDelete?.name}"? Esta ação não pode ser desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDeleteProduct}>Excluir</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog open={!!categoryToDelete} onOpenChange={() => setCategoryToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmar exclusão</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja excluir a categoria "{categoryToDelete?.name}"? Esta ação não pode ser desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDeleteCategory}>Excluir</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
