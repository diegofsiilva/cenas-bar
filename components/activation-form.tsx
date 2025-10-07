"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { activateLicense } from "@/lib/auth"
import { KeyRound, AlertCircle } from "lucide-react"

export function ActivationForm() {
  const [activationCode, setActivationCode] = useState("")
  const [error, setError] = useState("")
  const [isLoading, setIsLoading] = useState(false)

  const handleActivate = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setIsLoading(true)

    try {
      const success = await activateLicense(activationCode)

      if (success) {
        window.location.href = "/dashboard"
      } else {
        setError("Código de ativação inválido. Verifique o código e tente novamente.")
      }
    } catch (error) {
      setError("Erro ao ativar o sistema. Tente novamente.")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1 text-center">
          <div className="flex justify-center mb-4">
            <div className="p-3 bg-primary/10 rounded-full">
              <KeyRound className="h-8 w-8 text-primary" />
            </div>
          </div>
          <CardTitle className="text-2xl">Ativação do Sistema</CardTitle>
          <CardDescription>
            Insira o código de ativação fornecido pelo desenvolvedor para liberar o acesso ao sistema.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleActivate} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="activationCode">Código de Ativação</Label>
              <Input
                id="activationCode"
                type="text"
                placeholder="Cole o código aqui"
                value={activationCode}
                onChange={(e) => setActivationCode(e.target.value)}
                required
                className="font-mono text-sm"
              />
            </div>

            {error && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <Button type="submit" className="w-full" disabled={isLoading || !activationCode}>
              {isLoading ? "Ativando..." : "Ativar Sistema"}
            </Button>
          </form>

          <div className="mt-6 p-4 bg-muted rounded-lg">
            <p className="text-sm text-muted-foreground text-center">
              Não possui um código? Entre em contato com o desenvolvedor para obter acesso.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
