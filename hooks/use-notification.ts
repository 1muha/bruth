"use client"

import { useEffect, useState } from "react"
import { NotificationManager } from "@/lib/notification-manager"

export function useNotification() {
  const [hasPermission, setHasPermission] = useState(false)
  const [isSupported, setIsSupported] = useState(false)

  useEffect(() => {
    setIsSupported("Notification" in window)
    setHasPermission(NotificationManager.hasPermission())
  }, [])

  const requestPermission = async () => {
    const granted = await NotificationManager.requestPermission()
    setHasPermission(granted)
    return granted
  }

  return {
    hasPermission,
    isSupported,
    requestPermission,
  }
}
