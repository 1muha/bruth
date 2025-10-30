import type { Contact, ParsedContact } from "./contact-parser"
import { DatabaseService } from "./database.service"

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

export class ContactStorage {
  private static CONTACTS_KEY = "tanishim_contacts"

  private static isClient(): boolean {
    return typeof window !== "undefined"
  }

  static async getContacts(userId: string): Promise<Contact[]> {
    return await DatabaseService.getContacts(userId)
  }

  // Synchronous version for notification monitoring
  static getContactsSync(userId: string): Contact[] {
    if (typeof window === "undefined") return []

    const contactsStr = localStorage.getItem(this.CONTACTS_KEY)
    const allContacts: Contact[] = contactsStr ? JSON.parse(contactsStr) : []
    return allContacts.filter((c) => c.userId === userId)
  }

  static async getContactById(id: string, userId: string): Promise<Contact | null> {
    return await DatabaseService.getContactById(id, userId)
  }

  static async addContact(userId: string, parsedContact: ParsedContact): Promise<Contact | null> {
    return await DatabaseService.createContact({
      userId,
      ...parsedContact
    })
  }

  static async updateContact(id: string, userId: string, updates: Partial<ParsedContact>): Promise<Contact | null> {
    return await DatabaseService.updateContact(id, userId, updates)
  }

  static async deleteContact(id: string, userId: string): Promise<boolean> {
    return await DatabaseService.deleteContact(id, userId)
  }

  static async searchContacts(userId: string, query: string): Promise<Contact[]> {
    return await DatabaseService.searchContacts(userId, query)
  }
}
