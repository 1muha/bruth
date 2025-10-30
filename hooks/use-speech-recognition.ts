"use client"

import { useState, useEffect, useRef } from "react"

interface SpeechRecognitionEvent extends Event {
  results: SpeechRecognitionResultList
  resultIndex: number
}

interface SpeechRecognitionErrorEvent extends Event {
  error: string
  message: string
}

interface SpeechRecognitionInterface extends EventTarget {
  continuous: boolean
  interimResults: boolean
  lang: string
  start(): void
  stop(): void
  abort(): void
  onresult: ((event: SpeechRecognitionEvent) => void) | null
  onerror: ((event: SpeechRecognitionErrorEvent) => void) | null
  onend: (() => void) | null
}

declare global {
  interface Window {
    SpeechRecognition: new () => SpeechRecognitionInterface
    webkitSpeechRecognition: new () => SpeechRecognitionInterface
  }
}

export function useSpeechRecognition() {
  const [isListening, setIsListening] = useState(false)
  const [transcript, setTranscript] = useState("")
  const [isSupported, setIsSupported] = useState(false)
  const [error, setError] = useState("")
  const recognitionRef = useRef<SpeechRecognitionInterface | null>(null)

  useEffect(() => {
    if (typeof window !== "undefined") {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition
      setIsSupported(!!SpeechRecognition)

      if (SpeechRecognition) {
        recognitionRef.current = new SpeechRecognition()
        recognitionRef.current.continuous = true
        recognitionRef.current.interimResults = true
        recognitionRef.current.lang = "uz-UZ" // Uzbek language

        recognitionRef.current.onresult = (event: SpeechRecognitionEvent) => {
          let finalTranscript = ""
          let interimTranscript = ""

          for (let i = event.resultIndex; i < event.results.length; i++) {
            const transcript = event.results[i][0].transcript
            if (event.results[i].isFinal) {
              finalTranscript += transcript + " "
            } else {
              interimTranscript += transcript
            }
          }

          setTranscript((prev) => prev + finalTranscript)
        }

        recognitionRef.current.onerror = (event: SpeechRecognitionErrorEvent) => {
          console.error("[v0] Speech recognition error:", JSON.stringify({
            error: event.error,
            message: event.message
          }))
          
          // Handle specific errors
          switch (event.error) {
            case "not-allowed":
              setError("Mikrofon ruxsati berilmagan. Brauzer sozlamalarida ruxsat bering. Sayt manzilini brauzer sozlamalaridan topib, mikrofon ruxsatini yoqing.")
              break
            case "permission-denied":
              setError("Mikrofon ruxsati rad etildi. Brauzer sozlamalaridan mikrofon ruxsatini berishingiz kerak.")
              break
            case "no-speech":
              setError("Ovoz aniqlanmadi. Qaytadan urinib ko‘ring va aniqroq gapiring.")
              break
            case "audio-capture":
              setError("Audio qurilma topilmadi. Mikrofon ulanganligini tekshiring.")
              break
            case "network":
              setError("Tarmoq xatosi yuz berdi. Internet aloqangizni tekshiring.")
              break
            case "bad-grammar":
              setError("So‘rov noto‘g‘ri shakllangan. Iltimos, dasturchiga xabar bering.")
              break
            case "language-not-supported":
              setError("Tanlangan til qo‘llab-quvvatlanmaydi. Iltimos, dasturchiga xabar bering.")
              break
            default:
              setError(`Ovoz kiritishda xatolik: ${event.error}`)
          }
          
          setIsListening(false)
        }

        recognitionRef.current.onend = () => {
          setIsListening(false)
        }
      }
    }

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop()
      }
    }
  }, [])

  const startListening = async () => {
    if (recognitionRef.current && !isListening) {
      try {
        // Reset any previous errors
        setError("")
        setTranscript("")
        recognitionRef.current.start()
        setIsListening(true)
      } catch (err) {
        console.error("[v0] Failed to start speech recognition:", err)
        setError("Mikrofonni ishga tushirib bo‘lmadi. Brauzer sozlamalarini tekshiring.")
        setIsListening(false)
      }
    }
  }

  const stopListening = () => {
    if (recognitionRef.current && isListening) {
      recognitionRef.current.stop()
      setIsListening(false)
    }
  }

  const resetTranscript = () => {
    setTranscript("")
  }

  const resetError = () => {
    setError("")
  }

  // Function to request microphone permissions
  const requestPermission = async () => {
    try {
      if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
        // Stop all tracks to release the microphone
        stream.getTracks().forEach(track => track.stop())
        return true
      }
      return false
    } catch (err) {
      console.error("[v0] Microphone permission denied:", err)
      setError("Mikrofon ruxsati rad etildi. Brauzer sozlamalaridan mikrofon ruxsatini berishingiz kerak.")
      return false
    }
  }

  return {
    isListening,
    transcript,
    isSupported,
    error,
    startListening,
    stopListening,
    resetTranscript,
    resetError,
    requestPermission,
  }
}
