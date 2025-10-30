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
import { Users, Mail, Lock, ArrowRight } from "lucide-react"

export default function LoginPage() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const { login } = useAuth()
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setIsLoading(true)

    const result = login(email, password)

    if (result.success) {
      if (result.isAdmin) {
        router.push("/admin")
      } else {
        router.push("/dashboard")
      }
    } else {
      setError(result.error || "Login failed")
    }

    setIsLoading(false)
  }

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 p-4">
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -left-4 top-1/4 h-72 w-72 animate-blob rounded-full bg-purple-300 opacity-70 mix-blend-multiply blur-xl filter"></div>
        <div className="animation-delay-2000 absolute -right-4 top-1/3 h-72 w-72 animate-blob rounded-full bg-yellow-300 opacity-70 mix-blend-multiply blur-xl filter"></div>
        <div className="animation-delay-4000 absolute -bottom-8 left-1/3 h-72 w-72 animate-blob rounded-full bg-pink-300 opacity-70 mix-blend-multiply blur-xl filter"></div>
      </div>

      <Card className="relative w-full max-w-md animate-fade-in-up border-0 shadow-2xl backdrop-blur-sm bg-white/95">
        <CardHeader className="space-y-3 text-center">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 animate-bounce-slow">
            <Users className="h-8 w-8 text-white" />
          </div>
          <CardTitle className="text-4xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
            Tanishim
          </CardTitle>
          <CardDescription className="text-base">Tanishlaringizni boshqaring</CardDescription>
        </CardHeader>
        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-5">
            {error && (
              <Alert variant="destructive" className="animate-shake">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}
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
          </CardContent>
          <CardFooter className="flex flex-col space-y-4">
            <Button
              type="submit"
              className="group relative w-full overflow-hidden bg-gradient-to-r from-indigo-600 to-purple-600 text-white transition-all duration-300 hover:scale-105 hover:shadow-lg"
              disabled={isLoading}
            >
              <span className="relative z-10 flex items-center justify-center gap-2">
                {isLoading ? "Kirish..." : "Kirish"}
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
              </span>
              <div className="absolute inset-0 -z-0 bg-gradient-to-r from-purple-600 to-pink-600 opacity-0 transition-opacity duration-300 group-hover:opacity-100"></div>
            </Button>
            <p className="text-sm text-center text-muted-foreground">
              Akkauntingiz yo'qmi?{" "}
              <Link
                href="/register"
                className="font-semibold text-transparent bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text hover:underline transition-all"
              >
                Ro'yxatdan o'ting
              </Link>
            </p>
          </CardFooter>
        </form>
      </Card>
    </div>
  )
}
