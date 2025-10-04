"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { generateActivationCode } from "@/lib/auth"
import { Copy, Key, CheckCircle2 } from "lucide-react"

export default function AdminPage() {
  const [masterPassword, setMasterPassword] = useState("")
  const [days, setDays] = useState("30")
  const [activationCode, setActivationCode] = useState("")
  const [error, setError] = useState("")
  const [copied, setCopied] = useState(false)

  const handleGenerate = () => {
    setError("")
    setActivationCode("")
    setCopied(false)

    const code = generateActivationCode(masterPassword, Number.parseInt(days))

    if (!code) {
      setError("Senha mestra incorreta!")
      return
    }

    setActivationCode(code)
  }

  const handleCopy = () => {
    navigator.clipboard.writeText(activationCode)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1 text-center">
          <div className="flex justify-center mb-4">
            <div className="p-3 bg-primary/10 rounded-full">
              <Key className="h-8 w-8 text-primary" />
            </div>
          </div>
          <CardTitle className="text-2xl">Gerador de Códigos</CardTitle>
          <CardDescription>Área exclusiva do desenvolvedor para gerar códigos de ativação</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="masterPassword">Senha Mestra</Label>
            <Input
              id="masterPassword"
              type="password"
              placeholder="Digite a senha mestra"
              value={masterPassword}
              onChange={(e) => setMasterPassword(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="days">Dias de Validade</Label>
            <Input
              id="days"
              type="number"
              min="1"
              placeholder="30"
              value={days}
              onChange={(e) => setDays(e.target.value)}
            />
          </div>

          <Button onClick={handleGenerate} className="w-full" disabled={!masterPassword || !days}>
            Gerar Código de Ativação
          </Button>

          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {activationCode && (
            <div className="space-y-2">
              <Label>Código de Ativação Gerado</Label>
              <div className="flex gap-2">
                <Input value={activationCode} readOnly className="font-mono text-xs" />
                <Button onClick={handleCopy} size="icon" variant="outline">
                  {copied ? <CheckCircle2 className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                </Button>
              </div>
              <p className="text-xs text-muted-foreground">
                Envie este código para o cliente ativar o sistema por {days} dias.
              </p>
            </div>
          )}

          <Alert>
            <AlertDescription className="text-xs">
              <strong>Instruções:</strong>
              <br />
              1. Digite sua senha mestra
              <br />
              2. Defina quantos dias de validade
              <br />
              3. Copie o código gerado
              <br />
              4. Envie para o cliente usar na tela de ativação
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    </div>
  )
}
