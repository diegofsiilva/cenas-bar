// License management utilities

import { licenseStorage } from "./storage"
import type { License } from "./types"

const MASTER_PASSWORD = "MASTER2024@BAR"
const DELIMITER = "|"

export function generateActivationCode(masterPassword: string, days: number): string | null {
  if (masterPassword !== MASTER_PASSWORD) {
    return null
  }

  const expirationDate = new Date(Date.now() + days * 24 * 60 * 60 * 1000)
  const code = btoa(`${MASTER_PASSWORD}${DELIMITER}${expirationDate.toISOString()}${DELIMITER}${Date.now()}`)
  return code
}

export function activateLicense(activationCode: string): boolean {
  try {
    console.log("[v0] Attempting to activate with code:", activationCode)
    const decoded = atob(activationCode)
    console.log("[v0] Decoded string:", decoded)

    const parts = decoded.split(DELIMITER)
    console.log("[v0] Split parts:", parts)
    console.log("[v0] Number of parts:", parts.length)

    if (parts.length !== 3) {
      console.log("[v0] Invalid code format - expected 3 parts, got", parts.length)
      return false
    }

    const password = parts[0]
    const expirationDateStr = parts[1]

    console.log("[v0] Password match:", password === MASTER_PASSWORD)
    console.log("[v0] Expiration date string:", expirationDateStr)

    if (password !== MASTER_PASSWORD) {
      console.log("[v0] Password mismatch!")
      return false
    }

    const expirationDate = new Date(expirationDateStr)
    if (isNaN(expirationDate.getTime())) {
      console.log("[v0] Invalid expiration date!")
      return false
    }

    const license: License = {
      id: crypto.randomUUID(),
      activatedAt: new Date().toISOString(),
      expirationDate: expirationDateStr,
      isActive: true,
      activationCode,
    }

    console.log("[v0] Saving license:", license)
    licenseStorage.save(license)
    console.log("[v0] License saved successfully!")
    return true
  } catch (error) {
    console.log("[v0] Error during activation:", error)
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
