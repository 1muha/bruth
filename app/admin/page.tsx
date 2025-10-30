"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { AuthService } from "@/lib/auth"
import type { User } from "@/lib/auth"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { LogOut, Users, Ban, Trash2, ShieldCheck } from "lucide-react"

export default function AdminPage() {
  const [users, setUsers] = useState<User[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const router = useRouter()

  const loadUsers = () => {
    const allUsers = AuthService.getAllUsers()
    setUsers(allUsers)
  }

  useEffect(() => {
    // Check if user is admin
    if (!AuthService.isAdmin()) {
      router.push("/login")
      return
    }

    // Load all users
    loadUsers()
    setIsLoading(false)
  }, [router])

  const handleLogout = () => {
    AuthService.logout()
    router.push("/login")
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  const handleToggleBlock = (userId: string) => {
    const result = AuthService.toggleBlockUser(userId)
    if (result.success) {
      loadUsers()
    } else {
      alert(result.error || "Failed to toggle block status")
    }
  }

  const handleDeleteUser = (userId: string, userName: string) => {
    if (confirm(`Are you sure you want to delete user "${userName}"? This action cannot be undone.`)) {
      const result = AuthService.deleteUser(userId)
      if (result.success) {
        loadUsers()
      } else {
        alert(result.error || "Failed to delete user")
      }
    }
  }

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-lg">Loading...</div>
      </div>
    )
  }

  return (
    <div className="relative min-h-screen overflow-hidden">
      <div className="fixed inset-0 -z-10">
        <div className="absolute inset-0 bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50" />
        <div className="blob blob-1" />
        <div className="blob blob-2" />
        <div className="blob blob-3" />
      </div>

      <header className="border-b bg-white/80 backdrop-blur-lg shadow-lg">
        <div className="container mx-auto flex items-center justify-between px-4 py-4">
          <div className="flex items-center gap-3">
            <div className="rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600 p-2">
              <Users className="h-6 w-6 text-white" />
            </div>
            <h1 className="text-2xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
              Admin Panel
            </h1>
          </div>
          <Button
            onClick={handleLogout}
            variant="outline"
            size="sm"
            className="hover:bg-red-50 hover:text-red-600 hover:border-red-300 transition-all bg-transparent"
          >
            <LogOut className="mr-2 h-4 w-4" />
            Logout
          </Button>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <Card className="border-2 border-white/50 bg-white/80 backdrop-blur-lg shadow-2xl">
          <CardHeader className="bg-gradient-to-r from-indigo-500 to-purple-600 text-white rounded-t-lg">
            <CardTitle className="flex items-center gap-2 text-2xl">
              <Users className="h-6 w-6" />
              Registered Users
            </CardTitle>
            <CardDescription className="text-indigo-100">
              Total users:{" "}
              <Badge variant="secondary" className="bg-white text-indigo-600 font-bold">
                {users.length}
              </Badge>
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-6">
            {users.length === 0 ? (
              <div className="py-12 text-center">
                <Users className="h-16 w-16 mx-auto text-muted-foreground/30 mb-4" />
                <p className="text-lg text-muted-foreground">No users registered yet</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-gradient-to-r from-indigo-50 to-purple-50 hover:from-indigo-100 hover:to-purple-100">
                      <TableHead className="font-bold text-indigo-900">Name</TableHead>
                      <TableHead className="font-bold text-indigo-900">Email</TableHead>
                      <TableHead className="font-bold text-indigo-900">User ID</TableHead>
                      <TableHead className="font-bold text-indigo-900">Registered At</TableHead>
                      <TableHead className="font-bold text-indigo-900">Status</TableHead>
                      <TableHead className="font-bold text-indigo-900 text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {users.map((user, index) => (
                      <TableRow
                        key={user.id}
                        className={`hover:bg-gradient-to-r hover:from-indigo-50 hover:to-purple-50 transition-all ${
                          index % 2 === 0 ? "bg-white" : "bg-slate-50/50"
                        }`}
                      >
                        <TableCell className="font-medium">{user.name}</TableCell>
                        <TableCell>{user.email}</TableCell>
                        <TableCell className="font-mono text-xs text-muted-foreground">{user.id}</TableCell>
                        <TableCell className="text-sm text-muted-foreground">{formatDate(user.createdAt)}</TableCell>
                        <TableCell>
                          {user.blocked ? (
                            <Badge variant="destructive" className="gap-1">
                              <Ban className="h-3 w-3" />
                              Blocked
                            </Badge>
                          ) : (
                            <Badge variant="default" className="gap-1 bg-green-500">
                              <ShieldCheck className="h-3 w-3" />
                              Active
                            </Badge>
                          )}
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-2">
                            <Button
                              size="sm"
                              variant={user.blocked ? "default" : "outline"}
                              onClick={() => handleToggleBlock(user.id)}
                              className={
                                user.blocked
                                  ? "bg-green-500 hover:bg-green-600 text-white"
                                  : "hover:bg-orange-50 hover:text-orange-600 hover:border-orange-300"
                              }
                            >
                              <Ban className="h-4 w-4 mr-1" />
                              {user.blocked ? "Unblock" : "Block"}
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleDeleteUser(user.id, user.name)}
                              className="hover:bg-red-50 hover:text-red-600 hover:border-red-300"
                            >
                              <Trash2 className="h-4 w-4 mr-1" />
                              Delete
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>
      </main>
    </div>
  )
}
