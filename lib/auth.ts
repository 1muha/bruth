export interface User {
  id: string
  email: string
  name: string
  createdAt: string
  blocked?: boolean
}

export interface AuthState {
  user: User | null
  isAuthenticated: boolean
}

// Polyfill for crypto.randomUUID if not available
function generateUUID(): string {
  if (typeof crypto !== "undefined" && crypto.randomUUID) {
    return crypto.randomUUID()
  }
  
  // Fallback implementation
  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, function (c) {
    const r = (Math.random() * 16) | 0
    const v = c === "x" ? r : (r & 0x3) | 0x8
    return v.toString(16)
  })
}

export class AuthService {
  private static USERS_KEY = "tanishim_users"
  private static CURRENT_USER_KEY = "tanishim_current_user"

  private static isClient(): boolean {
    return typeof window !== "undefined"
  }

  static register(email: string, password: string, name: string): { success: boolean; error?: string; user?: User } {
    if (!this.isClient()) {
      return { success: false, error: "Not available on server" }
    }

    console.log("[v0] Registering user:", email)
    const users = this.getUsers()

    if (users.find((u) => u.email === email)) {
      console.log("[v0] Email already exists")
      return { success: false, error: "Email already registered" }
    }

    const user: User = {
      id: generateUUID(),
      email,
      name,
      createdAt: new Date().toISOString(),
    }

    users.push({ ...user, password })
    localStorage.setItem(this.USERS_KEY, JSON.stringify(users))

    localStorage.setItem(this.CURRENT_USER_KEY, JSON.stringify(user))
    console.log("[v0] User registered and logged in successfully")

    return { success: true, user }
  }

  static login(email: string, password: string): { success: boolean; error?: string; user?: User; isAdmin?: boolean } {
    if (!this.isClient()) {
      return { success: false, error: "Not available on server" }
    }

    console.log("[v0] Attempting login for:", email)

    if (email === "admin@gmail.com" && password === "admin123") {
      const adminUser: User = {
        id: "admin",
        email: "admin@gmail.com",
        name: "Administrator",
        createdAt: new Date().toISOString(),
      }
      localStorage.setItem(this.CURRENT_USER_KEY, JSON.stringify(adminUser))
      console.log("[v0] Admin login successful")
      return { success: true, user: adminUser, isAdmin: true }
    }

    const users = this.getUsers()
    const user = users.find((u) => u.email === email && u.password === password)

    if (!user) {
      console.log("[v0] Login failed: Invalid credentials")
      return { success: false, error: "Invalid email or password" }
    }

    if (user.blocked) {
      console.log("[v0] Login failed: User is blocked")
      return { success: false, error: "Your account has been blocked. Please contact admin." }
    }

    const { password: _, ...userWithoutPassword } = user
    localStorage.setItem(this.CURRENT_USER_KEY, JSON.stringify(userWithoutPassword))
    console.log("[v0] Login successful:", userWithoutPassword)

    return { success: true, user: userWithoutPassword, isAdmin: false }
  }

  static logout(): void {
    if (!this.isClient()) return
    console.log("[v0] Logging out user")
    localStorage.removeItem(this.CURRENT_USER_KEY)
  }

  static getCurrentUser(): User | null {
    if (!this.isClient()) return null

    const userStr = localStorage.getItem(this.CURRENT_USER_KEY)
    const user = userStr ? JSON.parse(userStr) : null
    console.log("[v0] Current user:", user)
    return user
  }

  static isAuthenticated(): boolean {
    return this.getCurrentUser() !== null
  }

  static getAllUsers(): User[] {
    if (!this.isClient()) return []

    const users = this.getUsers()
    return users.map(({ password, ...user }) => user)
  }

  static isAdmin(): boolean {
    const user = this.getCurrentUser()
    return user?.id === "admin"
  }

  static toggleBlockUser(userId: string): { success: boolean; error?: string } {
    if (!this.isClient()) {
      return { success: false, error: "Not available on server" }
    }

    if (!this.isAdmin()) {
      return { success: false, error: "Unauthorized" }
    }

    const users = this.getUsers()
    const userIndex = users.findIndex((u) => u.id === userId)

    if (userIndex === -1) {
      return { success: false, error: "User not found" }
    }

    users[userIndex].blocked = !users[userIndex].blocked
    localStorage.setItem(this.USERS_KEY, JSON.stringify(users))
    console.log("[v0] User block status toggled:", userId, users[userIndex].blocked)

    return { success: true }
  }

  static deleteUser(userId: string): { success: boolean; error?: string } {
    if (!this.isClient()) {
      return { success: false, error: "Not available on server" }
    }

    if (!this.isAdmin()) {
      return { success: false, error: "Unauthorized" }
    }

    const users = this.getUsers()
    const filteredUsers = users.filter((u) => u.id !== userId)

    if (filteredUsers.length === users.length) {
      return { success: false, error: "User not found" }
    }

    localStorage.setItem(this.USERS_KEY, JSON.stringify(filteredUsers))
    console.log("[v0] User deleted:", userId)

    return { success: true }
  }

  private static getUsers(): Array<User & { password: string }> {
    if (!this.isClient()) return []

    const usersStr = localStorage.getItem(this.USERS_KEY)
    return usersStr ? JSON.parse(usersStr) : []
  }
}
