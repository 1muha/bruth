export class NotificationManager {
  private static PERMISSION_KEY = "tanishim_notification_permission"
  private static CHECK_INTERVAL = 60000 // Check every minute

  static async requestPermission(): Promise<boolean> {
    if (!("Notification" in window)) {
      console.log("[v0] Browser doesn't support notifications")
      return false
    }

    if (Notification.permission === "granted") {
      return true
    }

    if (Notification.permission !== "denied") {
      const permission = await Notification.requestPermission()
      return permission === "granted"
    }

    return false
  }

  static hasPermission(): boolean {
    return "Notification" in window && Notification.permission === "granted"
  }

  static showNotification(title: string, body: string, icon?: string) {
    if (!this.hasPermission()) {
      console.log("[v0] No notification permission")
      return
    }

    console.log("[v0] Showing notification:", title)
    new Notification(title, {
      body,
      icon: icon || "/favicon.ico",
      badge: "/favicon.ico",
      tag: "tanishim-meeting",
      requireInteraction: true,
    })
  }

  static checkUpcomingMeetings(contacts: Array<{ id: string; ism: string; meetingDate?: string }>) {
    const now = new Date()
    const upcomingMeetings: Array<{ id: string; ism: string; meetingDate: string }> = []

    for (const contact of contacts) {
      if (!contact.meetingDate) continue

      const meetingDate = new Date(contact.meetingDate)
      const timeDiff = meetingDate.getTime() - now.getTime()
      const hoursDiff = timeDiff / (1000 * 60 * 60)

      // Notify if meeting is within 24 hours or already passed
      if (hoursDiff <= 24 && hoursDiff >= -1) {
        upcomingMeetings.push({
          id: contact.id,
          ism: contact.ism,
          meetingDate: contact.meetingDate,
        })
      }
    }

    return upcomingMeetings
  }

  static notifyUpcomingMeetings(contacts: Array<{ id: string; ism: string; meetingDate?: string }>) {
    const upcoming = this.checkUpcomingMeetings(contacts)

    for (const meeting of upcoming) {
      const meetingDate = new Date(meeting.meetingDate)
      const now = new Date()
      const isPast = meetingDate < now

      if (isPast) {
        this.showNotification(
          "Uchrashuv o'tib ketdi! ⚠️",
          `${meeting.ism} bilan uchrashuv vaqti o'tib ketdi. Iltimos, bog'laning!`,
        )
      } else {
        const hoursLeft = Math.round((meetingDate.getTime() - now.getTime()) / (1000 * 60 * 60))
        this.showNotification(
          "Yaqinlashayotgan uchrashuv! 📅",
          `${meeting.ism} bilan ${hoursLeft} soatdan keyin uchrashuv bor.`,
        )
      }
    }
  }

  static startMonitoring(getUserContacts: () => Array<{ id: string; ism: string; meetingDate?: string }>): () => void {
    console.log("[v0] Starting meeting notification monitoring")

    // Check immediately
    const contacts = getUserContacts()
    this.notifyUpcomingMeetings(contacts)

    // Then check every minute
    const intervalId = setInterval(() => {
      const contacts = getUserContacts()
      this.notifyUpcomingMeetings(contacts)
    }, this.CHECK_INTERVAL)

    // Return cleanup function
    return () => {
      console.log("[v0] Stopping meeting notification monitoring")
      clearInterval(intervalId)
    }
  }
}
