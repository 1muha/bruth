"use client"

import { useState, useEffect } from "react"
import { AuthService, type User } from "@/lib/auth"

export function useAuth() {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const currentUser = AuthService.getCurrentUser()
    setUser(currentUser)
    setIsLoading(false)
  }, [])

  const login = (email: string, password: string) => {
    const result = AuthService.login(email, password)
    if (result.success && result.user) {
      setUser(result.user)
    }
    return result
  }

  const register = (email: string, password: string, name: string) => {
    return AuthService.register(email, password, name)
  }

  const logout = () => {
    AuthService.logout()
    setUser(null)
  }

  return {
    user,
    isLoading,
    isAuthenticated: !!user,
    login,
    register,
    logout,
  }
}
