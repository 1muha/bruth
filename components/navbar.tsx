"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { useAuth } from "@/hooks/use-auth"
import { Button } from "@/components/ui/button"
import { LogOut, Plus, Search, Home, Shield } from "lucide-react"

export function Navbar() {
  const { user, logout } = useAuth()
  const pathname = usePathname()

  if (!user) return null

  return (
    <nav className="border-b border-white/20 bg-white/80 backdrop-blur-lg shadow-lg">
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between">
          <div className="flex items-center gap-6">
            <Link
              href="/dashboard"
              className="text-2xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent hover:from-indigo-700 hover:to-purple-700 transition-all"
            >
              Tanishim
            </Link>
            <div className="flex gap-2">
              <Button
                variant={pathname === "/dashboard" ? "default" : "ghost"}
                size="sm"
                asChild
                className={
                  pathname === "/dashboard"
                    ? "bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white border-0"
                    : "hover:bg-indigo-50 hover:text-indigo-600"
                }
              >
                <Link href="/dashboard">
                  <Home className="h-4 w-4 mr-2" />
                  Dashboard
                </Link>
              </Button>
              <Button
                variant={pathname === "/add-contact" ? "default" : "ghost"}
                size="sm"
                asChild
                className={
                  pathname === "/add-contact"
                    ? "bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white border-0"
                    : "hover:bg-purple-50 hover:text-purple-600"
                }
              >
                <Link href="/add-contact">
                  <Plus className="h-4 w-4 mr-2" />
                  Add Contact
                </Link>
              </Button>
              <Button
                variant={pathname === "/search" ? "default" : "ghost"}
                size="sm"
                asChild
                className={
                  pathname === "/search"
                    ? "bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white border-0"
                    : "hover:bg-pink-50 hover:text-pink-600"
                }
              >
                <Link href="/search">
                  <Search className="h-4 w-4 mr-2" />
                  Search
                </Link>
              </Button>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-sm font-medium bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
              {user.name}
            </span>
            <Button
              variant="outline"
              size="sm"
              onClick={logout}
              className="hover:bg-red-50 hover:text-red-600 hover:border-red-300 transition-all bg-transparent"
            >
              <LogOut className="h-4 w-4 mr-2" />
              Logout
            </Button>
          </div>
        </div>
        {/* HTTPS Info Bar */}
        <div className="bg-yellow-50 border-t border-yellow-200 px-4 py-2 flex items-center justify-center">
          <Shield className="h-4 w-4 text-yellow-600 mr-2" />
          <span className="text-sm text-yellow-800">
            For secure HTTPS access, use: <strong>https://10.15.223.251:3000</strong>
          </span>
        </div>
      </div>
    </nav>
  )
}