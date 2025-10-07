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

export async function activateLicense(activationCode: string): Promise<boolean> {
  try {
    const decoded = atob(activationCode)
    const parts = decoded.split(DELIMITER)

    if (parts.length !== 3) {
      return false
    }

    const password = parts[0]
    const expirationDateStr = parts[1]

    if (password !== MASTER_PASSWORD) {
      return false
    }

    const expirationDate = new Date(expirationDateStr)
    if (isNaN(expirationDate.getTime())) {
      return false
    }

    const response = await fetch("/api/license", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        activationCode,
        expirationDate: expirationDateStr,
        activatedAt: new Date().toISOString(),
      }),
    })

    return response.ok
  } catch (error) {
    console.error("Error during activation:", error)
    return false
  }
}

export async function getLicenseInfo(): Promise<{
  isValid: boolean
  daysRemaining: number
  expirationDate: string | null
}> {
  try {
    const response = await fetch("/api/license")
    if (!response.ok) {
      return { isValid: false, daysRemaining: 0, expirationDate: null }
    }

    const license = await response.json()
    if (!license) {
      return { isValid: false, daysRemaining: 0, expirationDate: null }
    }

    const now = new Date()
    const expirationDate = new Date(license.expirationDate)
    const daysRemaining = Math.ceil((expirationDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))

    return {
      isValid: daysRemaining > 0,
      daysRemaining: Math.max(0, daysRemaining),
      expirationDate: license.expirationDate,
    }
  } catch (error) {
    console.error("Error getting license info:", error)
    return { isValid: false, daysRemaining: 0, expirationDate: null }
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
