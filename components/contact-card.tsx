"use client"

import type { Contact } from "@/lib/contact-parser"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Trash2, Edit, Calendar, Clock } from "lucide-react"

interface ContactCardProps {
  contact: Contact
  onEdit: (contact: Contact) => void
  onDelete: (id: string) => void
}

export function ContactCard({ contact, onEdit, onDelete }: ContactCardProps) {
  const getMeetingStatus = () => {
    if (!contact.meetingDate) return null

    const now = new Date()
    const meetingDate = new Date(contact.meetingDate)
    const timeDiff = meetingDate.getTime() - now.getTime()
    const hoursDiff = timeDiff / (1000 * 60 * 60)
    const daysDiff = timeDiff / (1000 * 60 * 60 * 24)

    if (hoursDiff < 0) {
      return { status: "past", label: "O'tib ketdi", variant: "destructive" as const }
    } else if (hoursDiff <= 24) {
      return { status: "soon", label: "Bugun", variant: "default" as const }
    } else if (daysDiff <= 7) {
      return { status: "upcoming", label: `${Math.ceil(daysDiff)} kun`, variant: "secondary" as const }
    } else {
      return { status: "future", label: "Rejalashtirilgan", variant: "outline" as const }
    }
  }

  const meetingStatus = getMeetingStatus()

  const formatMeetingDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleString("uz-UZ", {
      day: "numeric",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  return (
    <Card className="hover:shadow-2xl transition-all duration-300 border-2 hover:border-indigo-300 bg-gradient-to-br from-white to-indigo-50/30">
      <CardHeader className="flex flex-row items-start justify-between space-y-0 pb-2">
        <div className="flex-1">
          <CardTitle className="text-xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
            {contact.ism || "Ism yo'q"}
          </CardTitle>
          {meetingStatus && (
            <Badge
              variant={meetingStatus.variant}
              className={`mt-2 ${
                meetingStatus.status === "soon"
                  ? "bg-gradient-to-r from-green-500 to-emerald-600 text-white border-0"
                  : meetingStatus.status === "past"
                    ? "bg-gradient-to-r from-red-500 to-rose-600 text-white border-0"
                    : "bg-gradient-to-r from-indigo-500 to-purple-600 text-white border-0"
              }`}
            >
              <Calendar className="h-3 w-3 mr-1" />
              {meetingStatus.label}
            </Badge>
          )}
        </div>
        <div className="flex gap-2">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => onEdit(contact)}
            className="hover:bg-indigo-100 hover:text-indigo-600 transition-all"
          >
            <Edit className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => onDelete(contact.id)}
            className="hover:bg-red-100 hover:text-red-600 transition-all"
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        {contact.meetingDate && (
          <div className="bg-gradient-to-r from-indigo-50 to-purple-50 p-3 rounded-lg border border-indigo-200">
            <p className="text-sm font-medium text-indigo-700 flex items-center gap-2">
              <Clock className="h-4 w-4" />
              Uchrashuv
            </p>
            <p className="text-sm font-semibold text-indigo-900">{formatMeetingDate(contact.meetingDate)}</p>
          </div>
        )}

        {contact.raqami && (
          <div className="p-2 rounded-lg hover:bg-indigo-50/50 transition-colors">
            <p className="text-sm font-medium text-indigo-600">Aloqa</p>
            <p className="text-sm text-gray-700">{contact.raqami}</p>
          </div>
        )}
        {contact.qayerdaTanishilgan && (
          <div className="p-2 rounded-lg hover:bg-purple-50/50 transition-colors">
            <p className="text-sm font-medium text-purple-600">Qayerda Tanishilgan</p>
            <p className="text-sm text-gray-700">{contact.qayerdaTanishilgan}</p>
          </div>
        )}
        {contact.qandayFoydasi && (
          <div className="p-2 rounded-lg hover:bg-pink-50/50 transition-colors">
            <p className="text-sm font-medium text-pink-600">Qanday Foydasi Bor</p>
            <p className="text-sm text-gray-700">{contact.qandayFoydasi}</p>
          </div>
        )}
        {contact.bizningSFoydamiz && (
          <div className="p-2 rounded-lg hover:bg-indigo-50/50 transition-colors">
            <p className="text-sm font-medium text-indigo-600">Bizning Foydamiz</p>
            <p className="text-sm text-gray-700">{contact.bizningSFoydamiz}</p>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
