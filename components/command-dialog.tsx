"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Separator } from "@/components/ui/separator"
import { ScrollArea } from "@/components/ui/scroll-area"
import type { Command, Product, CommandItem } from "@/lib/types"
import { productStorage } from "@/lib/storage"
import { Plus, Trash2, ShoppingCart } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

interface CommandDialogProps {
  command: Command | null
  open: boolean
  onClose: () => void
  onSave: (command: Command) => void
  onFinalize: (command: Command, paymentMethod: "cash" | "card" | "pix") => void
}

export function CommandDialog({ command, open, onClose, onSave, onFinalize }: CommandDialogProps) {
  const [products, setProducts] = useState<Product[]>([])
  const [selectedProductId, setSelectedProductId] = useState("")
  const [quantity, setQuantity] = useState(1)
  const [items, setItems] = useState<CommandItem[]>([])
  const [paymentMethod, setPaymentMethod] = useState<"cash" | "card" | "pix">("cash")
  const { toast } = useToast()

  useEffect(() => {
    setProducts(productStorage.getAll())
  }, [])

  useEffect(() => {
    if (command) {
      setItems(command.items)
    } else {
      setItems([])
    }
  }, [command])

  const handleAddItem = () => {
    const product = products.find((p) => p.id === selectedProductId)
    if (!product) {
      toast({
        title: "Erro",
        description: "Selecione um produto",
        variant: "destructive",
      })
      return
    }

    if (quantity <= 0) {
      toast({
        title: "Erro",
        description: "Quantidade deve ser maior que zero",
        variant: "destructive",
      })
      return
    }

    if (product.stockQuantity < quantity) {
      toast({
        title: "Estoque insuficiente",
        description: `Apenas ${product.stockQuantity} unidades disponíveis`,
        variant: "destructive",
      })
      return
    }

    const newItem: CommandItem = {
      id: crypto.randomUUID(),
      productId: product.id,
      productName: product.name,
      quantity,
      unitPrice: product.price,
      subtotal: product.price * quantity,
      addedAt: new Date().toISOString(),
    }

    setItems([...items, newItem])
    setSelectedProductId("")
    setQuantity(1)
  }

  const handleRemoveItem = (itemId: string) => {
    setItems(items.filter((item) => item.id !== itemId))
  }

  const calculateTotal = () => {
    return items.reduce((sum, item) => sum + item.subtotal, 0)
  }

  const handleSave = () => {
    if (!command) return

    const updatedCommand: Command = {
      ...command,
      items,
      total: calculateTotal(),
    }

    onSave(updatedCommand)
    toast({
      title: "Sucesso",
      description: "Comanda atualizada",
    })
  }

  const handleFinalize = () => {
    if (!command) return

    if (items.length === 0) {
      toast({
        title: "Erro",
        description: "Adicione pelo menos um item",
        variant: "destructive",
      })
      return
    }

    const updatedCommand: Command = {
      ...command,
      items,
      total: calculateTotal(),
    }

    onFinalize(updatedCommand, paymentMethod)
  }

  if (!command) return null

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[85vh] flex flex-col">
        <DialogHeader className="flex-shrink-0">
          <DialogTitle>Comanda - {command.tableName}</DialogTitle>
          <DialogDescription>Adicione produtos e finalize a venda</DialogDescription>
        </DialogHeader>

        <ScrollArea className="flex-1 pr-4">
          <div className="space-y-4">
            {/* Add Item Form */}
            <div className="flex gap-2">
              <div className="flex-1">
                <Label htmlFor="product">Produto</Label>
                <Select value={selectedProductId} onValueChange={setSelectedProductId}>
                  <SelectTrigger id="product">
                    <SelectValue placeholder="Selecione um produto" />
                  </SelectTrigger>
                  <SelectContent>
                    {products.map((product) => (
                      <SelectItem key={product.id} value={product.id}>
                        {product.name} - R$ {product.price.toFixed(2)} (Estoque: {product.stockQuantity})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="w-24">
                <Label htmlFor="quantity">Qtd</Label>
                <Input
                  id="quantity"
                  type="number"
                  min="1"
                  value={quantity}
                  onChange={(e) => setQuantity(Number.parseInt(e.target.value) || 1)}
                />
              </div>
              <div className="flex items-end">
                <Button onClick={handleAddItem}>
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
            </div>

            <Separator />

            {/* Items List */}
            <div>
              <Label>Itens da Comanda</Label>
              <ScrollArea className="h-[150px] mt-2 border rounded-md p-4">
                {items.length === 0 ? (
                  <p className="text-sm text-muted-foreground text-center py-8">Nenhum item adicionado</p>
                ) : (
                  <div className="space-y-2">
                    {items.map((item) => (
                      <div key={item.id} className="flex items-center justify-between p-2 bg-muted rounded-md">
                        <div className="flex-1">
                          <p className="font-medium text-sm">{item.productName}</p>
                          <p className="text-xs text-muted-foreground">
                            {item.quantity}x R$ {item.unitPrice.toFixed(2)}
                          </p>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="font-semibold">R$ {item.subtotal.toFixed(2)}</span>
                          <Button size="icon" variant="ghost" onClick={() => handleRemoveItem(item.id)}>
                            <Trash2 className="h-4 w-4 text-destructive" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </ScrollArea>
            </div>

            {/* Total */}
            <div className="flex justify-between items-center p-4 bg-primary/10 rounded-md">
              <span className="font-semibold text-lg">Total:</span>
              <span className="font-bold text-2xl">R$ {calculateTotal().toFixed(2)}</span>
            </div>

            {/* Payment Method */}
            <div>
              <Label htmlFor="payment">Forma de Pagamento</Label>
              <Select value={paymentMethod} onValueChange={(value: any) => setPaymentMethod(value)}>
                <SelectTrigger id="payment">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="cash">Dinheiro</SelectItem>
                  <SelectItem value="card">Cartão</SelectItem>
                  <SelectItem value="pix">PIX</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </ScrollArea>

        <DialogFooter className="gap-2 flex-shrink-0 pt-4 border-t">
          <Button variant="outline" onClick={onClose}>
            Cancelar
          </Button>
          <Button variant="secondary" onClick={handleSave}>
            Salvar
          </Button>
          <Button onClick={handleFinalize}>
            <ShoppingCart className="h-4 w-4 mr-2" />
            Finalizar Venda
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
