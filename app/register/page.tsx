"use client"

import type React from "react"
import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { useAuth } from "@/hooks/use-auth"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { UserPlus, Mail, Lock, User, ArrowRight } from "lucide-react"

export default function RegisterPage() {
  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [error, setError] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const { register } = useAuth()
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")

    if (password !== confirmPassword) {
      setError("Parollar mos kelmadi")
      return
    }

    if (password.length < 6) {
      setError("Parol kamida 6 ta belgidan iborat bo'lishi kerak")
      return
    }

    setIsLoading(true)

    const result = register(email, password, name)

    if (result.success) {
      router.push("/dashboard")
    } else {
      setError(result.error || "Ro'yxatdan o'tish muvaffaqiyatsiz")
    }

    setIsLoading(false)
  }

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-gradient-to-br from-cyan-500 via-blue-500 to-indigo-600 p-4">
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -left-4 top-1/4 h-72 w-72 animate-blob rounded-full bg-cyan-300 opacity-70 mix-blend-multiply blur-xl filter"></div>
        <div className="animation-delay-2000 absolute -right-4 top-1/3 h-72 w-72 animate-blob rounded-full bg-blue-300 opacity-70 mix-blend-multiply blur-xl filter"></div>
        <div className="animation-delay-4000 absolute -bottom-8 left-1/3 h-72 w-72 animate-blob rounded-full bg-indigo-300 opacity-70 mix-blend-multiply blur-xl filter"></div>
      </div>

      <Card className="relative w-full max-w-md animate-fade-in-up border-0 shadow-2xl backdrop-blur-sm bg-white/95">
        <CardHeader className="space-y-3 text-center">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-cyan-500 to-blue-600 animate-bounce-slow">
            <UserPlus className="h-8 w-8 text-white" />
          </div>
          <CardTitle className="text-4xl font-bold bg-gradient-to-r from-cyan-600 to-blue-600 bg-clip-text text-transparent">
            Ro'yxatdan o'tish
          </CardTitle>
          <CardDescription className="text-base">Tanishim ga qo'shiling</CardDescription>
        </CardHeader>
        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-4">
            {error && (
              <Alert variant="destructive" className="animate-shake">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}
            <div className="space-y-2">
              <Label htmlFor="name" className="text-sm font-medium">
                To'liq ism
              </Label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
                <Input
                  id="name"
                  type="text"
                  placeholder="Ismingiz"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="pl-10 transition-all duration-200 focus:scale-[1.02]"
                  required
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="email" className="text-sm font-medium">
                Email
              </Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
                <Input
                  id="email"
                  type="email"
                  placeholder="sizning@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="pl-10 transition-all duration-200 focus:scale-[1.02]"
                  required
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="password" className="text-sm font-medium">
                Parol
              </Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
                <Input
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="pl-10 transition-all duration-200 focus:scale-[1.02]"
                  required
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="confirmPassword" className="text-sm font-medium">
                Parolni tasdiqlang
              </Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
                <Input
                  id="confirmPassword"
                  type="password"
                  placeholder="••••••••"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="pl-10 transition-all duration-200 focus:scale-[1.02]"
                  required
                />
              </div>
            </div>
          </CardContent>
          <CardFooter className="flex flex-col space-y-4">
            <Button
              type="submit"
              className="group relative w-full overflow-hidden bg-gradient-to-r from-cyan-600 to-blue-600 text-white transition-all duration-300 hover:scale-105 hover:shadow-lg"
              disabled={isLoading}
            >
              <span className="relative z-10 flex items-center justify-center gap-2">
                {isLoading ? "Yaratilmoqda..." : "Akkount yaratish"}
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
              </span>
              <div className="absolute inset-0 -z-0 bg-gradient-to-r from-blue-600 to-indigo-600 opacity-0 transition-opacity duration-300 group-hover:opacity-100"></div>
            </Button>
            <p className="text-sm text-center text-muted-foreground">
              Akkauntingiz bormi?{" "}
              <Link
                href="/login"
                className="font-semibold text-transparent bg-gradient-to-r from-cyan-600 to-blue-600 bg-clip-text hover:underline transition-all"
              >
                Kirish
              </Link>
            </p>
          </CardFooter>
        </form>
      </Card>
    </div>
  )
}
