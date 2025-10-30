"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/hooks/use-auth"
import { useSpeechRecognition } from "@/hooks/use-speech-recognition"
import { ContactStorage } from "@/lib/contact-storage"
import { AuthGuard } from "@/components/auth-guard"
import { Navbar } from "@/components/navbar"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Mic, MicOff, Sparkles, Save, Calendar, Wand2 } from "lucide-react"

interface ParsedContact {
  ism: string
  raqami: string
  qayerdaTanishilgan: string
  qandayFoydasi: string
  bizningSFoydamiz: string
  meetingDate?: string
  telegram?: string
  instagram?: string
  email?: string
}

export default function AddContactPage() {
  const { user } = useAuth()
  const router = useRouter()
  const [inputText, setInputText] = useState("")
  const [parsedData, setParsedData] = useState<ParsedContact | null>(null)
  const [error, setError] = useState("")
  const [isProcessing, setIsProcessing] = useState(false)
  const [isAutoCorrecting, setIsAutoCorrecting] = useState(false)
  const [autoCorrectEnabled, setAutoCorrectEnabled] = useState(true)
  const { isListening, transcript, isSupported, error: speechHookError, startListening, stopListening, resetTranscript, requestPermission } = useSpeechRecognition()

  useEffect(() => {
    if (!autoCorrectEnabled || !inputText.trim() || inputText.length < 10) return

    const timer = setTimeout(async () => {
      try {
        setIsAutoCorrecting(true)
        const response = await fetch("/api/autocorrect", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ text: inputText }),
        })

        if (response.ok) {
          const { correctedText } = await response.json()
          if (correctedText && correctedText !== inputText) {
            setInputText(correctedText)
          }
        } else {
          // Handle rate limiting for autocorrect
          if (response.status === 429) {
            console.warn("[autocorrect] Rate limited, skipping for now")
            // Don't show error to user for autocorrect rate limiting
            return
          }
          
          const err = await response.json()
          console.error("[autocorrect] error:", err)
        }
      } catch (err) {
        console.error("[autocorrect] error:", err)
        // Don't show error to user for autocorrect failures
      } finally {
        setIsAutoCorrecting(false)
      }
    }, 2000)

    return () => clearTimeout(timer)
  }, [inputText, autoCorrectEnabled])

  const handleParse = async () => {
    if (!inputText.trim()) {
      setError("Iltimos, matn kiriting")
      return
    }

    setError("")
    setIsProcessing(true)

    try {
      const response = await fetch("/api/parse-contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: inputText }),
      })

      if (!response.ok) {
        const err = await response.json()
        
        // Handle rate limiting specifically
        if (response.status === 429) {
          throw new Error("Juda ko'p so'rovlar. Birozdan keyin urinib ko'ring.")
        }
        
        throw new Error(err.error || "Failed to parse contact")
      }

      const parsed = await response.json()
      console.log("[AI parsed result]", parsed)
      setParsedData(parsed)
    } catch (err: any) {
      console.error("[Parse error]:", err)
      setError(err.message || "Kontaktni tahlil qilishda xatolik. Qaytadan urinib ko‘ring.")
    } finally {
      setIsProcessing(false)
    }
  }

  const handleVoiceInput = async () => {
    if (isListening) {
      stopListening()
      if (transcript) {
        setInputText((prev) => (prev ? prev + " " + transcript : transcript))
        resetTranscript()
      }
    } else {
      // Request permission before starting
      const hasPermission = await requestPermission()
      if (hasPermission || hasPermission === undefined) { // undefined means we couldn't check
        startListening()
      }
      // If hasPermission is false, the error is already set by requestPermission
    }
  }

  const handleSave = async () => {
    if (!user) {
      setError("Kontakt saqlash uchun tizimga kiring")
      return
    }

    if (!parsedData) {
      setError("Avval kontaktni tahlil qiling")
      return
    }

    if (!parsedData.ism.trim()) {
      setError("Ism majburiy. Iltimos, ism qo‘shing.")
      return
    }

    try {
      const result = await ContactStorage.addContact(user.id, parsedData)
      if (result) {
        router.push("/dashboard")
      } else {
        setError("Kontaktni saqlashda xatolik. Qaytadan urinib ko‘ring.")
      }
    } catch (err) {
      console.error("[Save error]:", err)
      setError("Kontaktni saqlashda xatolik. Qaytadan urinib ko‘ring.")
    }
  }

  return (
    <AuthGuard>
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
        <Navbar />
        <main className="container mx-auto px-4 py-8 max-w-4xl">
          <h1 className="text-4xl font-bold mb-8">Yangi Kontakt Qo‘shish</h1>

          <div className="grid gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Kontakt Ma’lumotlarini Kiriting</CardTitle>
                <CardDescription>
                  Matn yoki ovoz orqali kiriting. Sun’iy intellekt uni tuzilgan ma’lumotlarga aylantiradi.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {!isSupported && (
                  <Alert>
                    <AlertDescription>
                      Brauzeringiz ovoz kiritishni qo‘llab-quvvatlamaydi. Iltimos, matn kiriting.
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

                {error && (
                  <Alert variant="destructive">
                    <AlertDescription>{error}</AlertDescription>
                  </Alert>
                )}

                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="auto-correct"
                    checked={autoCorrectEnabled}
                    onChange={(e) => setAutoCorrectEnabled(e.target.checked)}
                    className="h-4 w-4"
                  />
                  <Label htmlFor="auto-correct" className="text-sm flex items-center gap-2">
                    <Wand2 className="h-4 w-4" />
                    Avtomatik to‘g‘irlash (AI)
                    {isAutoCorrecting && <span className="text-xs text-muted-foreground">(to‘g‘irlanmoqda...)</span>}
                  </Label>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="input-text">Kontakt Ma’lumotlari</Label>
                  <Textarea
                    id="input-text"
                    placeholder="Misol: Ismi Alisher, telefon raqami +998901234567, universitetda tanishdik, dasturlash bo‘yicha yordam beradi, men ingliz tilini o‘rgataman"
                    value={inputText + (isListening ? " " + transcript : "")}
                    onChange={(e) => setInputText(e.target.value)}
                    rows={6}
                    className="resize-none"
                  />
                  {isListening && <p className="text-sm text-muted-foreground">Tinglayapman... Gapiring</p>}
                </div>

                <div className="flex gap-2">
                  {isSupported && (
                    <Button type="button" variant={isListening ? "destructive" : "outline"} onClick={handleVoiceInput}>
                      {isListening ? (
                        <>
                          <MicOff className="h-4 w-4 mr-2" />
                          To‘xtatish
                        </>
                      ) : (
                        <>
                          <Mic className="h-4 w-4 mr-2" />
                          Ovoz Kiriting
                        </>
                      )}
                    </Button>
                  )}
                  <Button type="button" onClick={handleParse} disabled={isProcessing}>
                    <Sparkles className="h-4 w-4 mr-2" />
                    {isProcessing ? "Tahlil qilinmoqda..." : "AI bilan Tahlil Qilish"}
                  </Button>
                </div>
              </CardContent>
            </Card>

            {parsedData && (
              <Card>
                <CardHeader>
                  <CardTitle>Tahlil Qilingan Kontakt</CardTitle>
                  <CardDescription>Saqlashdan oldin ma’lumotlarni tahrirlang</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="parsed-ism">Ism *</Label>
                    <Input
                      id="parsed-ism"
                      value={parsedData.ism}
                      onChange={(e) => setParsedData({ ...parsedData, ism: e.target.value })}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="parsed-raqami">Aloqa (Raqami)</Label>
                    <Input
                      id="parsed-raqami"
                      value={parsedData.raqami}
                      onChange={(e) => setParsedData({ ...parsedData, raqami: e.target.value })}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="parsed-where">Qayerda Tanishilgan</Label>
                    <Input
                      id="parsed-where"
                      value={parsedData.qayerdaTanishilgan}
                      onChange={(e) => setParsedData({ ...parsedData, qayerdaTanishilgan: e.target.value })}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="parsed-benefit">Qanday Foydasi Bor</Label>
                    <Textarea
                      id="parsed-benefit"
                      value={parsedData.qandayFoydasi}
                      onChange={(e) => setParsedData({ ...parsedData, qandayFoydasi: e.target.value })}
                      rows={2}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="parsed-our-benefit">Bizning Foydamiz</Label>
                    <Textarea
                      id="parsed-our-benefit"
                      value={parsedData.bizningSFoydamiz}
                      onChange={(e) => setParsedData({ ...parsedData, bizningSFoydamiz: e.target.value })}
                      rows={2}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="meeting-date" className="flex items-center gap-2">
                      <Calendar className="h-4 w-4" />
                      Uchrashuv Sanasi (Ixtiyoriy)
                    </Label>
                    <Input
                      id="meeting-date"
                      type="datetime-local"
                      value={parsedData.meetingDate || ""}
                      onChange={(e) => setParsedData({ ...parsedData, meetingDate: e.target.value })}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="parsed-telegram">Telegram</Label>
                    <Input
                      id="parsed-telegram"
                      value={parsedData.telegram || ""}
                      onChange={(e) => setParsedData({ ...parsedData, telegram: e.target.value })}
                      placeholder="@username"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="parsed-instagram">Instagram</Label>
                    <Input
                      id="parsed-instagram"
                      value={parsedData.instagram || ""}
                      onChange={(e) => setParsedData({ ...parsedData, instagram: e.target.value })}
                      placeholder="@username"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="parsed-email">Email</Label>
                    <Input
                      id="parsed-email"
                      value={parsedData.email || ""}
                      onChange={(e) => setParsedData({ ...parsedData, email: e.target.value })}
                      placeholder="example@email.com"
                      type="email"
                    />
                  </div>

                  <Button onClick={handleSave} className="w-full" size="lg">
                    <Save className="h-5 w-5 mr-2" />
                    Kontaktni Saqlash
                  </Button>
                </CardContent>
              </Card>
            )}
          </div>
        </main>
      </div>
    </AuthGuard>
  )
}
