"use client"

import { useLicense } from "./license-provider"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { AlertTriangle, Clock } from "lucide-react"

export function LicenseBanner() {
  const { daysRemaining } = useLicense()

  if (daysRemaining > 7) {
    return null
  }

  return (
    <Alert variant={daysRemaining <= 3 ? "destructive" : "default"} className="mb-4">
      {daysRemaining <= 3 ? <AlertTriangle className="h-4 w-4" /> : <Clock className="h-4 w-4" />}
      <AlertDescription>
        <strong>Atenção:</strong> A licença do sistema expira em {daysRemaining} {daysRemaining === 1 ? "dia" : "dias"}.
        Entre em contato com o desenvolvedor para renovar.
      </AlertDescription>
    </Alert>
  )
}
