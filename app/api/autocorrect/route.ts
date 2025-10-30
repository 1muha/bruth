import { NextRequest, NextResponse } from "next/server"
import { callOpenAI } from "@/lib/openai-client"

export async function POST(request: NextRequest) {
  try {
    const { text } = await request.json()

    if (!text) {
      return NextResponse.json({ error: "Text is required" }, { status: 400 })
    }

    const apiKey = process.env.OPENAI_API_KEY
    if (!apiKey) {
      throw new Error("OPENAI_API_KEY not found in environment")
    }

    const response = await callOpenAI(apiKey, {
      messages: [
        {
          role: "system",
          content:
            "Siz kontakt ma'lumotlarini (ism, telefon, email, manzil) matndan aniqlovchi yordamchisiz. Matnni to'g'rilang va aniqlikni oshiring. Grammatik xatolar, imlo xatolarini to'g'rilang. Qisqartirilgan so'zlarni ochib yozing. Faqat to'g'rilangan matnni qaytaring.",
        },
        {
          role: "user",
          content: text,
        },
      ],
    })

    if (!response.ok) {
      const err = await response.text()
      console.error("OpenAI API error:", err)
      
      // Handle rate limiting specifically
      if (response.status === 429) {
        return NextResponse.json({ error: "Juda ko'p so'rovlar. Birozdan keyin urinib ko'ring." }, { status: 429 })
      }
      
      return NextResponse.json({ error: `OpenAI error: ${response.status}` }, { status: response.status })
    }

    const data = await response.json()
    const content = data.choices?.[0]?.message?.content || ""
    
    // Return the corrected text
    return NextResponse.json({ correctedText: content.trim() || text })
  } catch (error: any) {
    console.error("Parse Contact Error:", error)
    return NextResponse.json(
      { error: error.message || "Failed to parse contact" },
      { status: 500 }
    )
  }
}
