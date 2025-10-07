"use client"

import type React from "react"

import { createContext, useContext, useEffect, useState } from "react"
import { usePathname } from "next/navigation"
import { getLicenseInfo, requestNotificationPermission, sendExpirationNotification } from "@/lib/auth"
import { ActivationForm } from "./activation-form"

interface LicenseContextType {
  isValid: boolean
  daysRemaining: number
  expirationDate: string | null
}

const LicenseContext = createContext<LicenseContextType>({
  isValid: false,
  daysRemaining: 0,
  expirationDate: null,
})

export function useLicense() {
  return useContext(LicenseContext)
}

export function LicenseProvider({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const [licenseInfo, setLicenseInfo] = useState<LicenseContextType>({
    isValid: false,
    daysRemaining: 0,
    expirationDate: null,
  })
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const checkLicense = async () => {
      const info = await getLicenseInfo()
      setLicenseInfo(info)
      setIsLoading(false)

      requestNotificationPermission()

      if (info.isValid && info.daysRemaining <= 7 && info.daysRemaining > 0) {
        sendExpirationNotification(info.daysRemaining)
      }
    }

    checkLicense()

    const interval = setInterval(checkLicense, 60 * 60 * 1000)
    return () => clearInterval(interval)
  }, [])

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
        <div className="text-white">Carregando...</div>
      </div>
    )
  }

  if (!licenseInfo.isValid && pathname !== "/admin") {
    return <ActivationForm />
  }

  return <LicenseContext.Provider value={licenseInfo}>{children}</LicenseContext.Provider>
}
