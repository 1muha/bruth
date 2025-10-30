"use client"

import { useState, useEffect } from "react"
import { useAuth } from "@/hooks/use-auth"
import { useSpeechRecognition } from "@/hooks/use-speech-recognition"
import { ContactStorage } from "@/lib/contact-storage"
import type { Contact } from "@/lib/contact-parser"
import { AuthGuard } from "@/components/auth-guard"
import { Navbar } from "@/components/navbar"
import { ContactCard } from "@/components/contact-card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { SearchIcon, Mic, MicOff, X } from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"

export default function SearchPage() {
  const { user } = useAuth()
  const [searchQuery, setSearchQuery] = useState("")
  const [searchResults, setSearchResults] = useState<Contact[]>([])
  const [hasSearched, setHasSearched] = useState(false)
  const [editingContact, setEditingContact] = useState<Contact | null>(null)
  const [editForm, setEditForm] = useState({
    ism: "",
    raqami: "",
    qayerdaTanishilgan: "",
    qandayFoydasi: "",
    bizningSFoydamiz: "",
  })
  const { isListening, transcript, isSupported, error: speechHookError, startListening, stopListening, resetTranscript, requestPermission } =
    useSpeechRecognition()

  useEffect(() => {
    const timer = setTimeout(() => {
      if (searchQuery.trim()) {
        performSearch(searchQuery)
      } else {
        setSearchResults([])
        setHasSearched(false)
      }
    }, 300)

    return () => clearTimeout(timer)
  }, [searchQuery, user])

  useEffect(() => {
    if (transcript && !isListening) {
      setSearchQuery(transcript)
    }
  }, [transcript, isListening])

  const performSearch = async (query: string) => {
    console.log("[v0] Performing search for:", query)
    if (user) {
      const results = await ContactStorage.searchContacts(user.id, query)
      setSearchResults(results)
      setHasSearched(true)
    }
  }

  const handleVoiceSearch = async () => {
    console.log("[v0] Voice search toggled")
    if (isListening) {
      stopListening()
    } else {
      resetTranscript()
      setSearchQuery("")
      // Request permission before starting
      const hasPermission = await requestPermission()
      if (hasPermission || hasPermission === undefined) { // undefined means we couldn't check
        startListening()
      }
      // If hasPermission is false, the error is already set by requestPermission
    }
  }

  const handleClearSearch = () => {
    setSearchQuery("")
    setSearchResults([])
    setHasSearched(false)
    resetTranscript()
    if (isListening) {
      stopListening()
    }
  }

  const handleDelete = async (id: string) => {
    if (user && confirm("Kontaktni o'chirmoqchimisiz?")) {
      await ContactStorage.deleteContact(id, user.id)
      performSearch(searchQuery)
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
    })
  }

  const handleSaveEdit = async () => {
    if (user && editingContact) {
      await ContactStorage.updateContact(editingContact.id, user.id, editForm)
      setEditingContact(null)
      performSearch(searchQuery)
    }
  }

  return (
    <AuthGuard>
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
        <Navbar />
        <main className="container mx-auto px-4 py-8 max-w-6xl">
          <h1 className="text-4xl font-bold mb-8">Kontaktlarni Qidirish</h1>

          <Card className="mb-8">
            <CardHeader>
              <CardTitle>Kontaktlaringizni Toping</CardTitle>
              <CardDescription>Ism, raqam, joy yoki istalgan kalit so'z bilan qidiring</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {!isSupported && (
                <Alert>
                  <AlertDescription>
                    Brauzeringiz ovoz qidirishni qo'llab-quvvatlamaydi. Iltimos, matn kiriting.
                  </AlertDescription>
                </Alert>
              )}
              {speechHookError && (
                <Alert variant="destructive">
                  <AlertDescription>
                    {speechHookError}
                  </AlertDescription>
                </Alert>
              )}

              <div className="flex gap-2">
                <div className="relative flex-1">
                  <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Kontaktlarni qidiring..."
                    value={isListening ? transcript : searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10 pr-10"
                    disabled={isListening}
                  />
                  {(searchQuery || transcript) && (
                    <button
                      onClick={handleClearSearch}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  )}
                </div>
                {isSupported && (
                  <Button type="button" variant={isListening ? "destructive" : "outline"} onClick={handleVoiceSearch}>
                    {isListening ? (
                      <>
                        <MicOff className="h-4 w-4 mr-2" />
                        To'xtatish
                      </>
                    ) : (
                      <>
                        <Mic className="h-4 w-4 mr-2" />
                        Ovoz
                      </>
                    )}
                  </Button>
                )}
              </div>

              {isListening && <p className="text-sm text-muted-foreground">Tinglayapman... Qidiruv so'zini ayting</p>}
            </CardContent>
          </Card>

          {hasSearched && (
            <div>
              <div className="mb-4">
                <p className="text-lg font-medium">
                  {searchResults.length} ta natija topildi
                  {searchQuery && ` "${searchQuery}" uchun`}
                </p>
              </div>

              {searchResults.length === 0 ? (
                <Card>
                  <CardContent className="py-12 text-center">
                    <p className="text-muted-foreground">Qidiruvga mos kontakt topilmadi</p>
                  </CardContent>
                </Card>
              ) : (
                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                  {searchResults.map((contact) => (
                    <ContactCard key={contact.id} contact={contact} onEdit={handleEdit} onDelete={handleDelete} />
                  ))}
                </div>
              )}
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
