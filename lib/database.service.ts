import { Contact } from '@/lib/contact-parser'
// @ts-ignore
import { supabase } from '@/lib/supabase-client'

export class DatabaseService {
  private static isClient(): boolean {
    return typeof window !== "undefined"
  }

  private static getStorageKey(userId: string): string {
    return `tanishim_contacts_${userId}`
  }

  /**
   * Create a new contact in Supabase
   */
  static async createContact(contact: Omit<Contact, 'id' | 'createdAt' | 'updatedAt'>): Promise<Contact | null> {
    try {
      // Try Supabase first
      const newContact = {
        user_id: contact.userId,
        ism: contact.ism,
        raqami: contact.raqami,
        qayerda_tanishilgan: contact.qayerdaTanishilgan,
        qanday_foydasi: contact.qandayFoydasi,
        biznings_foydamiz: contact.bizningSFoydamiz,
        meeting_date: contact.meetingDate || null,
        telegram: contact.telegram || null,
        instagram: contact.instagram || null,
        email: contact.email || null,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      }

      const { data, error } = await supabase
        .from('contacts')
        .insert(newContact)
        .select()
        .single()

      if (error) {
        console.error('[Database] Supabase error creating contact:', error)
        // Fallback to localStorage
        return this.createContactLocal(contact)
      }

      // Convert Supabase response to our Contact format
      return {
        id: data.id,
        userId: data.user_id,
        ism: data.ism,
        raqami: data.raqami,
        qayerdaTanishilgan: data.qayerda_tanishilgan,
        qandayFoydasi: data.qanday_foydasi,
        bizningSFoydamiz: data.biznings_foydamiz,
        meetingDate: data.meeting_date,
        telegram: data.telegram,
        instagram: data.instagram,
        email: data.email,
        createdAt: data.created_at,
        updatedAt: data.updated_at,
      }
    } catch (error) {
      console.error('[Database] Error creating contact:', error)
      // Fallback to localStorage
      return this.createContactLocal(contact)
    }
  }

  /**
   * Get all contacts for a user from Supabase
   */
  static async getContacts(userId: string): Promise<Contact[]> {
    try {
      const { data, error } = await supabase
        .from('contacts')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })

      if (error) {
        console.error('[Database] Supabase error fetching contacts:', error)
        // Fallback to localStorage
        return this.getContactsLocal(userId)
      }

      // Convert Supabase response to our Contact format
      return data.map((item: any) => ({
        id: item.id,
        userId: item.user_id,
        ism: item.ism,
        raqami: item.raqami,
        qayerdaTanishilgan: item.qayerda_tanishilgan,
        qandayFoydasi: item.qanday_foydasi,
        bizningSFoydamiz: item.biznings_foydamiz,
        meetingDate: item.meeting_date,
        telegram: item.telegram,
        instagram: item.instagram,
        email: item.email,
        createdAt: item.created_at,
        updatedAt: item.updated_at,
      }))
    } catch (error) {
      console.error('[Database] Error fetching contacts:', error)
      // Fallback to localStorage
      return this.getContactsLocal(userId)
    }
  }

  /**
   * Get a specific contact by ID from Supabase
   */
  static async getContactById(id: string, userId: string): Promise<Contact | null> {
    try {
      const { data, error } = await supabase
        .from('contacts')
        .select('*')
        .eq('id', id)
        .eq('user_id', userId)
        .single()

      if (error) {
        console.error('[Database] Supabase error fetching contact:', error)
        // Fallback to localStorage
        return this.getContactByIdLocal(id, userId)
      }

      if (!data) return null

      // Convert Supabase response to our Contact format
      return {
        id: data.id,
        userId: data.user_id,
        ism: data.ism,
        raqami: data.raqami,
        qayerdaTanishilgan: data.qayerda_tanishilgan,
        qandayFoydasi: data.qanday_foydasi,
        bizningSFoydamiz: data.biznings_foydamiz,
        meetingDate: data.meeting_date,
        telegram: data.telegram,
        instagram: data.instagram,
        email: data.email,
        createdAt: data.created_at,
        updatedAt: data.updated_at,
      }
    } catch (error) {
      console.error('[Database] Error fetching contact:', error)
      // Fallback to localStorage
      return this.getContactByIdLocal(id, userId)
    }
  }

  /**
   * Update a contact in Supabase
   */
  static async updateContact(id: string, userId: string, updates: Partial<Contact>): Promise<Contact | null> {
    try {
      // Convert our Contact format to Supabase format
      const supabaseUpdates: any = {}
      if (updates.ism !== undefined) supabaseUpdates.ism = updates.ism
      if (updates.raqami !== undefined) supabaseUpdates.raqami = updates.raqami
      if (updates.qayerdaTanishilgan !== undefined) supabaseUpdates.qayerda_tanishilgan = updates.qayerdaTanishilgan
      if (updates.qandayFoydasi !== undefined) supabaseUpdates.qanday_foydasi = updates.qandayFoydasi
      if (updates.bizningSFoydamiz !== undefined) supabaseUpdates.biznings_foydamiz = updates.bizningSFoydamiz
      if (updates.meetingDate !== undefined) supabaseUpdates.meeting_date = updates.meetingDate
      if (updates.telegram !== undefined) supabaseUpdates.telegram = updates.telegram
      if (updates.instagram !== undefined) supabaseUpdates.instagram = updates.instagram
      if (updates.email !== undefined) supabaseUpdates.email = updates.email
      supabaseUpdates.updated_at = new Date().toISOString()

      const { data, error } = await supabase
        .from('contacts')
        .update(supabaseUpdates)
        .eq('id', id)
        .eq('user_id', userId)
        .select()
        .single()

      if (error) {
        console.error('[Database] Supabase error updating contact:', error)
        // Fallback to localStorage
        return this.updateContactLocal(id, userId, updates)
      }

      // Convert Supabase response to our Contact format
      return {
        id: data.id,
        userId: data.user_id,
        ism: data.ism,
        raqami: data.raqami,
        qayerdaTanishilgan: data.qayerda_tanishilgan,
        qandayFoydasi: data.qanday_foydasi,
        bizningSFoydamiz: data.biznings_foydamiz,
        meetingDate: data.meeting_date,
        telegram: data.telegram,
        instagram: data.instagram,
        email: data.email,
        createdAt: data.created_at,
        updatedAt: data.updated_at,
      }
    } catch (error) {
      console.error('[Database] Error updating contact:', error)
      // Fallback to localStorage
      return this.updateContactLocal(id, userId, updates)
    }
  }

  /**
   * Delete a contact from Supabase
   */
  static async deleteContact(id: string, userId: string): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('contacts')
        .delete()
        .eq('id', id)
        .eq('user_id', userId)

      if (error) {
        console.error('[Database] Supabase error deleting contact:', error)
        // Fallback to localStorage
        return this.deleteContactLocal(id, userId)
      }

      return true
    } catch (error) {
      console.error('[Database] Error deleting contact:', error)
      // Fallback to localStorage
      return this.deleteContactLocal(id, userId)
    }
  }

  /**
   * Search contacts by query in Supabase
   */
  static async searchContacts(userId: string, query: string): Promise<Contact[]> {
    try {
      if (!query.trim()) {
        return await this.getContacts(userId)
      }

      // Use the search function if available
      const { data, error } = await supabase
        .rpc('search_contacts', {
          p_user_id: userId,
          p_query: query
        })

      if (error) {
        console.error('[Database] Supabase error searching contacts:', error)
        // Fallback to localStorage
        return this.searchContactsLocal(userId, query)
      }

      // Convert Supabase response to our Contact format
      return data.map((item: any) => ({
        id: item.id,
        userId: item.user_id,
        ism: item.ism,
        raqami: item.raqami,
        qayerdaTanishilgan: item.qayerda_tanishilgan,
        qandayFoydasi: item.qanday_foydasi,
        bizningSFoydamiz: item.biznings_foydamiz,
        meetingDate: item.meeting_date,
        telegram: item.telegram,
        instagram: item.instagram,
        email: item.email,
        createdAt: item.created_at,
        updatedAt: item.updated_at,
      }))
    } catch (error) {
      console.error('[Database] Error searching contacts:', error)
      // Fallback to localStorage
      return this.searchContactsLocal(userId, query)
    }
  }

  // Local storage fallback methods
  private static async createContactLocal(contact: Omit<Contact, 'id' | 'createdAt' | 'updatedAt'>): Promise<Contact | null> {
    try {
      if (!this.isClient()) return null

      const newContact: Contact = {
        id: crypto.randomUUID(),
        ...contact,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      }

      const storageKey = this.getStorageKey(contact.userId)
      const existingContacts = JSON.parse(localStorage.getItem(storageKey) || '[]')
      existingContacts.push(newContact)
      localStorage.setItem(storageKey, JSON.stringify(existingContacts))

      return newContact
    } catch (error) {
      console.error('[Database] Error creating contact in localStorage:', error)
      return null
    }
  }

  private static async getContactsLocal(userId: string): Promise<Contact[]> {
    try {
      if (!this.isClient()) return []

      const storageKey = this.getStorageKey(userId)
      const contacts = JSON.parse(localStorage.getItem(storageKey) || '[]')
      return contacts.sort((a: Contact, b: Contact) => 
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      )
    } catch (error) {
      console.error('[Database] Error fetching contacts from localStorage:', error)
      return []
    }
  }

  private static async getContactByIdLocal(id: string, userId: string): Promise<Contact | null> {
    try {
      if (!this.isClient()) return null

      const storageKey = this.getStorageKey(userId)
      const contacts = JSON.parse(localStorage.getItem(storageKey) || '[]')
      return contacts.find((contact: Contact) => contact.id === id && contact.userId === userId) || null
    } catch (error) {
      console.error('[Database] Error fetching contact from localStorage:', error)
      return null
    }
  }

  private static async updateContactLocal(id: string, userId: string, updates: Partial<Contact>): Promise<Contact | null> {
    try {
      if (!this.isClient()) return null

      const storageKey = this.getStorageKey(userId)
      const contacts = JSON.parse(localStorage.getItem(storageKey) || '[]')
      const index = contacts.findIndex((contact: Contact) => contact.id === id && contact.userId === userId)

      if (index === -1) return null

      contacts[index] = {
        ...contacts[index],
        ...updates,
        updatedAt: new Date().toISOString(),
      }

      localStorage.setItem(storageKey, JSON.stringify(contacts))
      return contacts[index]
    } catch (error) {
      console.error('[Database] Error updating contact in localStorage:', error)
      return null
    }
  }

  private static async deleteContactLocal(id: string, userId: string): Promise<boolean> {
    try {
      if (!this.isClient()) return false

      const storageKey = this.getStorageKey(userId)
      const contacts = JSON.parse(localStorage.getItem(storageKey) || '[]')
      const filteredContacts = contacts.filter((contact: Contact) => 
        !(contact.id === id && contact.userId === userId)
      )

      localStorage.setItem(storageKey, JSON.stringify(filteredContacts))
      return true
    } catch (error) {
      console.error('[Database] Error deleting contact from localStorage:', error)
      return false
    }
  }

  private static async searchContactsLocal(userId: string, query: string): Promise<Contact[]> {
    try {
      if (!this.isClient()) return []

      const contacts = await this.getContactsLocal(userId)
      
      if (!query.trim()) {
        return contacts
      }

      const lowerQuery = query.toLowerCase().trim()
      
      return contacts.filter((contact: Contact) => {
        return (
          contact.ism.toLowerCase().includes(lowerQuery) ||
          contact.raqami.toLowerCase().includes(lowerQuery) ||
          contact.qayerdaTanishilgan.toLowerCase().includes(lowerQuery) ||
          contact.qandayFoydasi.toLowerCase().includes(lowerQuery) ||
          contact.bizningSFoydamiz.toLowerCase().includes(lowerQuery) ||
          (contact.telegram && contact.telegram.toLowerCase().includes(lowerQuery)) ||
          (contact.instagram && contact.instagram.toLowerCase().includes(lowerQuery)) ||
          (contact.email && contact.email.toLowerCase().includes(lowerQuery))
        )
      })
    } catch (error) {
      console.error('[Database] Error searching contacts in localStorage:', error)
      return []
    }
  }
}