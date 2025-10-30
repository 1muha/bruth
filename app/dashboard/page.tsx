"use client"

import { useState, useEffect } from "react"
import { useAuth } from "@/hooks/use-auth"
import { useNotification } from "@/hooks/use-notification"
import { ContactStorage } from "@/lib/contact-storage"
import { NotificationManager } from "@/lib/notification-manager"
import type { Contact } from "@/lib/contact-parser"
import { AuthGuard } from "@/components/auth-guard"
import { Navbar } from "@/components/navbar"
import { ContactCard } from "@/components/contact-card"
import { Button } from "@/components/ui/button"
import { Plus, Bell } from "lucide-react"
import Link from "next/link"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Alert, AlertDescription } from "@/components/ui/alert"

export default function DashboardPage() {
  const { user } = useAuth()
  const { hasPermission, isSupported, requestPermission } = useNotification()
  const [contacts, setContacts] = useState<Contact[]>([])
  const [editingContact, setEditingContact] = useState<Contact | null>(null)
  const [editForm, setEditForm] = useState({
    ism: "",
    raqami: "",
    qayerdaTanishilgan: "",
    qandayFoydasi: "",
    bizningSFoydamiz: "",
    meetingDate: "",
  })

  useEffect(() => {
    if (user) {
      loadContacts()
    }
  }, [user])

  useEffect(() => {
    if (!user || !hasPermission) return

    // For notification monitoring, we need to use the synchronous version
    const getUserContacts = () => {
      if (user) {
        // We'll use the synchronous method for notifications only
        return ContactStorage.getContactsSync(user.id)
      }
      return []
    }

    const cleanup = NotificationManager.startMonitoring(getUserContacts)
    return cleanup
  }, [user, hasPermission])

  const loadContacts = async () => {
    if (user) {
      const userContacts = await ContactStorage.getContacts(user.id)
      setContacts(userContacts)
    }
  }

  const handleDelete = async (id: string) => {
    if (user && confirm("Bu kontaktni o'chirmoqchimisiz?")) {
      await ContactStorage.deleteContact(id, user.id)
      loadContacts()
    }
  }

  const handleEdit = (contact: Contact) => {
    setEditingContact(contact)
    setEditForm({
      ism: contact.ism,
      raqami: contact.raqami,
      qayerdaTanishilgan: contact.qayerdaTanishilgan,
      qandayFoydasi: contact.qandayFoydasi,
      bizningSFoydamiz: contact.bizningSFoydamiz,
      meetingDate: contact.meetingDate || "",
    })
  }

  const handleSaveEdit = async () => {
    if (user && editingContact) {
      await ContactStorage.updateContact(editingContact.id, user.id, editForm)
      setEditingContact(null)
      loadContacts()
    }
  }

  const handleEnableNotifications = async () => {
    await requestPermission()
  }

  return (
    <AuthGuard>
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
        <Navbar />
        <main className="container mx-auto px-4 py-8">
          {isSupported && !hasPermission && (
            <Alert className="mb-6">
              <Bell className="h-4 w-4" />
              <AlertDescription className="flex items-center justify-between">
                <span>Uchrashuv eslatmalarini olish uchun bildirishnomalarni yoqing</span>
                <Button size="sm" onClick={handleEnableNotifications}>
                  Yoqish
                </Button>
              </AlertDescription>
            </Alert>
          )}

          {hasPermission && (
            <Alert className="mb-6">
              <Bell className="h-4 w-4" />
              <AlertDescription>
                Bildirishnomalar yoqilgan. Uchrashuv vaqti kelganda sizga xabar beramiz! ✅
              </AlertDescription>
            </Alert>
          )}

          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-4xl font-bold mb-2">Mening Kontaktlarim</h1>
              <p className="text-muted-foreground">{contacts.length} ta kontakt</p>
            </div>
            <Button asChild size="lg">
              <Link href="/add-contact">
                <Plus className="h-5 w-5 mr-2" />
                Kontakt Qo'shish
              </Link>
            </Button>
          </div>

          {contacts.length === 0 ? (
            <div className="text-center py-16">
              <p className="text-xl text-muted-foreground mb-4">Hali kontaktlar yo'q</p>
              <Button asChild>
                <Link href="/add-contact">Birinchi kontaktni qo'shing</Link>
              </Button>
            </div>
          ) : (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {contacts.map((contact) => (
                <ContactCard key={contact.id} contact={contact} onEdit={handleEdit} onDelete={handleDelete} />
              ))}
            </div>
          )}
        </main>
      </div>

      <Dialog open={!!editingContact} onOpenChange={() => setEditingContact(null)}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Kontaktni Tahrirlash</DialogTitle>
            <DialogDescription>Kontakt ma'lumotlarini yangilang</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="edit-ism">Ism</Label>
              <Input
                id="edit-ism"
                value={editForm.ism}
                onChange={(e) => setEditForm({ ...editForm, ism: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-raqami">Aloqa (Raqami)</Label>
              <Input
                id="edit-raqami"
                value={editForm.raqami}
                onChange={(e) => setEditForm({ ...editForm, raqami: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-where">Qayerda Tanishilgan</Label>
              <Textarea
                id="edit-where"
                value={editForm.qayerdaTanishilgan}
                onChange={(e) => setEditForm({ ...editForm, qayerdaTanishilgan: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-benefit">Qanday Foydasi Bor</Label>
              <Textarea
                id="edit-benefit"
                value={editForm.qandayFoydasi}
                onChange={(e) => setEditForm({ ...editForm, qandayFoydasi: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-our-benefit">Bizning Foydamiz</Label>
              <Textarea
                id="edit-our-benefit"
                value={editForm.bizningSFoydamiz}
                onChange={(e) => setEditForm({ ...editForm, bizningSFoydamiz: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-meeting-date">Uchrashuv Sanasi</Label>
              <Input
                id="edit-meeting-date"
                type="datetime-local"
                value={editForm.meetingDate}
                onChange={(e) => setEditForm({ ...editForm, meetingDate: e.target.value })}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditingContact(null)}>
              Bekor qilish
            </Button>
            <Button onClick={handleSaveEdit}>Saqlash</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </AuthGuard>
  )
}
