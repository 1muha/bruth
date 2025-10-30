import { NextRequest, NextResponse } from "next/server"
import { callOpenAI } from "@/lib/openai-client"

export async function POST(request: NextRequest) {
  try {
    const { text } = await request.json()

    if (!text || typeof text !== "string" || text.trim().length < 3) {
      return NextResponse.json({ error: "Matn kiritilmadi" }, { status: 400 })
    }

    const apiKey = process.env.OPENAI_API_KEY
    if (!apiKey) {
      throw new Error("OPENAI_API_KEY topilmadi")
    }

    const response = await callOpenAI(apiKey, {
      messages: [
        {
          role: "system",
          content: `
Siz kontakt ma'lumotlarini aniqlovchi AI yordamchisiz (o‘zbek tilida). 
Matndan quyidagi tuzilgan ma’lumotlarni chiqar:
{
  "ism": "To'liq ism va familiya. Agar faqat ism bo'lsa, shu holda ham saqlang",
  "raqami": "Telefon raqami, faqat raqamlar, +998 formatida. Agar bo'lmasa 'Kiritilmagan'",
  "qayerdaTanishilgan": "Qayerda tanishilgani haqida batafsil ma'lumot. Kontekstdan chiqarib tushuning",
  "qandayFoydasi": "Bu odam sizga qanday foyda olib kelishi mumkin. Haqiqiy baholash",
  "bizningSFoydamiz": "Siz bu odamdan qanday foyda ko'rasiz. O'z fikringiz",
  "telegram": "Telegram foydalanuvchi nomi (@ bilan). Agar bo'lmasa 'Kiritilmagan'",
  "instagram": "Instagram foydalanuvchi nomi (@ bilan). Agar bo'lmasa 'Kiritilmagan'",
  "email": "Email manzil. Agar bo'lmasa 'Kiritilmagan'"
}
Agar ma’lumot to'liq topilmasa, mavjud bo'lganini to'ldiring, qolganlarini "Kiritilmagan" deb belgilang.
Faqat JSON javob qaytaring, boshqa matn yo‘q.

Namunalar:
Matn: "Alisher 913622536 Namangan Dasturlash"
Natija: {"ism": "Alisher", "raqami": "+998913622536", "qayerdaTanishilgan": "Namangan", "qandayFoydasi": "Dasturlash", "bizningSFoydamiz": "Kiritilmagan", "telegram": "Kiritilmagan", "instagram": "Kiritilmagan", "email": "Kiritilmagan"}

Matn: "tanishdim alisher bilan namanganda, 913622536 raqam, dasturlashda foydasi bor"
Natija: {"ism": "Alisher", "raqami": "+998913622536", "qayerdaTanishilgan": "Namangan", "qandayFoydasi": "Dasturlash", "bizningSFoydamiz": "Kiritilmagan", "telegram": "Kiritilmagan", "instagram": "Kiritilmagan", "email": "Kiritilmagan"}

Matn: "903256987 alisher bilan tanishganman farg‘onada. biz dastur yozamiz — foydasi backend, bizning foydamiz frontend"
Natija: {"ism": "Alisher", "raqami": "+998903256987", "qayerdaTanishilgan": "Farg‘ona", "qandayFoydasi": "Backend", "bizningSFoydamiz": "Frontend", "telegram": "Kiritilmagan", "instagram": "Kiritilmagan", "email": "Kiritilmagan"}

Matn: "Toshkentda Islom bilan tanishganmiz. U raqam 994441122. U bizga dizayn bo‘yicha yordam beradi, biz esa unga web sayt bilan. Telegram: @islom_design"
Natija: {"ism": "Islom", "raqami": "+998994441122", "qayerdaTanishilgan": "Toshkent", "qandayFoydasi": "Dizayn bo‘yicha yordam beradi", "bizningSFoydamiz": "Web sayt bilan yordam beramiz", "telegram": "@islom_design", "instagram": "Kiritilmagan", "email": "Kiritilmagan"}

Matn: "Ismi Jasur raqami 998935551212 Samarqandda ko‘rishganmiz bizga foydasi dizayner"
Natija: {"ism": "Jasur", "raqami": "+998935551212", "qayerdaTanishilgan": "Samarqand", "qandayFoydasi": "Dizayner", "bizningSFoydamiz": "Kiritilmagan", "telegram": "Kiritilmagan", "instagram": "Kiritilmagan", "email": "Kiritilmagan"}

Matn: "998990012233 Jamshid Toshkent Frontend, biz unga backendda yordam beramiz"
Natija: {"ism": "Jamshid", "raqami": "+998990012233", "qayerdaTanishilgan": "Toshkent", "qandayFoydasi": "Frontend", "bizningSFoydamiz": "Backendda yordam beramiz", "telegram": "Kiritilmagan", "instagram": "Kiritilmagan", "email": "Kiritilmagan"}

Matn: "Raqam: 998935551010, Ism: Shodiyor, Joy: Namangan, foyda: dasturlash"
Natija: {"ism": "Shodiyor", "raqami": "+998935551010", "qayerdaTanishilgan": "Namangan", "qandayFoydasi": "Dasturlash", "bizningSFoydamiz": "Kiritilmagan", "telegram": "Kiritilmagan", "instagram": "Kiritilmagan", "email": "Kiritilmagan"}

Matn: "Komil 907770101 Qarshi dasturchi, biz unga dizayn bilan foyda. IG: @komil_dev"
Natija: {"ism": "Komil", "raqami": "+998907770101", "qayerdaTanishilgan": "Qarshi", "qandayFoydasi": "Dasturchi", "bizningSFoydamiz": "Dizayn bilan", "telegram": "Kiritilmagan", "instagram": "@komil_dev", "email": "Kiritilmagan"}
`,
        },
        { role: "user", content: text },
      ],
      response_format: { type: "json_object" },
    })

    if (!response.ok) {
      const err = await response.text()
      console.error("[parse-contact] API error:", err)
      
      // Handle rate limiting specifically
      if (response.status === 429) {
        return NextResponse.json({ error: "Juda ko'p so'rovlar. Birozdan keyin urinib ko'ring." }, { status: 429 })
      }
      
      return NextResponse.json({ error: `OpenAI xatosi: ${response.status}` }, { status: response.status })
    }

    const data = await response.json()
    const content = data.choices?.[0]?.message?.content
    if (!content) throw new Error("Bo‘sh javob olindi")

    try {
      const parsed = JSON.parse(content)
      console.log("[parse-contact] parsed:", parsed)
      return NextResponse.json(parsed)
    } catch (parseError) {
      console.error("[parse-contact] JSON parse error:", parseError)
      console.error("[parse-contact] Raw content:", content)
      throw new Error("AI javobini tahlil qilishda xatolik")
    }
  } catch (error: any) {
    console.error("Parse-contact xato:", error)
    return NextResponse.json(
      { error: error.message || "Kontaktni tahlil qilishda xatolik" },
      { status: 500 },
    )
  }
}