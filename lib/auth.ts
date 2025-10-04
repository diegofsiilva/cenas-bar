// License management utilities

import { licenseStorage } from "./storage"
import type { License } from "./types"

const MASTER_PASSWORD = "MASTER2024@BAR"

export function generateActivationCode(masterPassword: string, days: number): string | null {
  if (masterPassword !== MASTER_PASSWORD) {
    return null
  }

  const expirationDate = new Date(Date.now() + days * 24 * 60 * 60 * 1000)
  const code = btoa(`${MASTER_PASSWORD}:${expirationDate.toISOString()}:${Date.now()}`)
  return code
}

export function activateLicense(activationCode: string): boolean {
  try {
    const decoded = atob(activationCode)
    const [password, expirationDateStr] = decoded.split(":")

    if (password !== MASTER_PASSWORD) {
      return false
    }

    const license: License = {
      id: crypto.randomUUID(),
      activatedAt: new Date().toISOString(),
      expirationDate: expirationDateStr,
      isActive: true,
      activationCode,
    }

    licenseStorage.save(license)
    return true
  } catch {
    return false
  }
}

export function isLicenseValid(): boolean {
  const license = licenseStorage.get()
  if (!license || !license.isActive) {
    return false
  }

  const now = new Date()
  const expirationDate = new Date(license.expirationDate)

  if (now > expirationDate) {
    // Mark as inactive
    licenseStorage.save({ ...license, isActive: false })
    return false
  }

  return true
}

export function getLicenseInfo(): {
  isValid: boolean
  daysRemaining: number
  expirationDate: string | null
} {
  const license = licenseStorage.get()
  if (!license) {
    return { isValid: false, daysRemaining: 0, expirationDate: null }
  }

  const now = new Date()
  const expirationDate = new Date(license.expirationDate)
  const daysRemaining = Math.ceil((expirationDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))

  return {
    isValid: daysRemaining > 0 && license.isActive,
    daysRemaining: Math.max(0, daysRemaining),
    expirationDate: license.expirationDate,
  }
}

export function sendExpirationNotification(daysRemaining: number) {
  if (typeof window !== "undefined" && "Notification" in window) {
    if (Notification.permission === "granted") {
      new Notification("Aviso de Expiração da Licença", {
        body: `Sua licença expira em ${daysRemaining} dias. Entre em contato com o desenvolvedor.`,
        icon: "/icon.png",
      })
    }
  }
}

export function requestNotificationPermission() {
  if (typeof window !== "undefined" && "Notification" in window) {
    if (Notification.permission === "default") {
      Notification.requestPermission()
    }
  }
}
