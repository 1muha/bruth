export interface Contact {
  id: string
  userId: string
  ism: string // name
  raqami: string // contact methods
  qayerdaTanishilgan: string // where met
  qandayFoydasi: string // benefit from them
  bizningSFoydamiz: string // benefit to them
  meetingDate?: string // optional meeting date for reminders
  telegram?: string // telegram username
  instagram?: string // instagram username
  email?: string // email address
  createdAt: string
  updatedAt: string
}

export interface ParsedContact {
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


// Uzbek keyword lists for each field with weights
const FIELD_KEYWORDS = {
  ism: {
    keywords: ["ism", "ismi", "nomi", "oti", "ismli", "deb ataladi", "nomli", "ismim", "ismingiz"],
    weight: 1.0,
  },
  raqami: {
    keywords: [
      "raqam",
      "raqami",
      "telefon",
      "tel",
      "nomer",
      "kontakt",
      "aloqa",
      "bog'lanish",
      "qo'ng'iroq",
      "email",
      "pochta",
      "telegram",
      "instagram",
    ],
    weight: 1.0,
  },
  qayerdaTanishilgan: {
    keywords: [
      "tanish",
      "tanishilgan",
      "uchrash",
      "uchrashdik",
      "ko'rish",
      "ko'rishdik",
      "qayerda",
      "qayer",
      "joyda",
      "da",
      "de",
      "universitet",
      "maktab",
      "ish",
      "konferensiya",
      "tadbirda",
    ],
    weight: 1.0,
  },
  qandayFoydasi: {
    keywords: [
      "foyda",
      "foydasi",
      "yordam",
      "yordami",
      "beradi",
      "qiladi",
      "biladi",
      "mutaxassis",
      "professional",
      "tajriba",
      "tajribali",
      "malaka",
      "ko'nikma",
      "ustoz",
      "o'rgatadi",
    ],
    weight: 1.0,
  },
  bizningSFoydamiz: {
    keywords: [
      "bizning",
      "biz",
      "men",
      "mening",
      "yordam qilaman",
      "beraman",
      "qilaman",
      "taklif",
      "taqdim",
      "xizmat",
      "ko'maklashaman",
      "o'rgataman",
    ],
    weight: 1.0,
  },
  meetingDate: {
    keywords: ["meeting", "date", "uzr", "tug'ilgan", "tug'ilgan kuni", "birthday", "yosh"],
    weight: 1.0,
  },
}

export class ContactParser {
  // Tokenize text into words
  private static tokenize(text: string): string[] {
    return text
      .toLowerCase()
      .replace(/[^\w\s\u0400-\u04FF]/g, " ") // Keep Cyrillic characters
      .split(/\s+/)
      .filter((word) => word.length > 0)
  }

  // Calculate term frequency
  private static calculateTF(tokens: string[]): Map<string, number> {
    const tf = new Map<string, number>()
    const totalTokens = tokens.length

    for (const token of tokens) {
      tf.set(token, (tf.get(token) || 0) + 1)
    }

    // Normalize by total tokens
    for (const [token, count] of tf.entries()) {
      tf.set(token, count / totalTokens)
    }

    return tf
  }

  // Calculate inverse document frequency
  private static calculateIDF(allSentences: string[][]): Map<string, number> {
    const idf = new Map<string, number>()
    const totalDocs = allSentences.length

    // Get all unique tokens
    const allTokens = new Set<string>()
    for (const tokens of allSentences) {
      for (const token of tokens) {
        allTokens.add(token)
      }
    }

    // Calculate IDF for each token
    for (const token of allTokens) {
      const docsWithToken = allSentences.filter((tokens) => tokens.includes(token)).length
      idf.set(token, Math.log(totalDocs / (1 + docsWithToken)))
    }

    return idf
  }

  // Calculate TF-IDF vector
  private static calculateTFIDF(tokens: string[], idf: Map<string, number>): Map<string, number> {
    const tf = this.calculateTF(tokens)
    const tfidf = new Map<string, number>()

    for (const [token, tfValue] of tf.entries()) {
      const idfValue = idf.get(token) || 0
      tfidf.set(token, tfValue * idfValue)
    }

    return tfidf
  }

  // Calculate cosine similarity between two vectors
  private static cosineSimilarity(vec1: Map<string, number>, vec2: Map<string, number>): number {
    let dotProduct = 0
    let mag1 = 0
    let mag2 = 0

    // Calculate dot product and magnitude of vec1
    for (const [token, value] of vec1.entries()) {
      mag1 += value * value
      if (vec2.has(token)) {
        dotProduct += value * vec2.get(token)!
      }
    }

    // Calculate magnitude of vec2
    for (const value of vec2.values()) {
      mag2 += value * value
    }

    mag1 = Math.sqrt(mag1)
    mag2 = Math.sqrt(mag2)

    if (mag1 === 0 || mag2 === 0) return 0

    return dotProduct / (mag1 * mag2)
  }

  // Create keyword vector for a field
  private static createKeywordVector(fieldName: keyof typeof FIELD_KEYWORDS): Map<string, number> {
    const vector = new Map<string, number>()
    const { keywords, weight } = FIELD_KEYWORDS[fieldName]

    for (const keyword of keywords) {
      vector.set(keyword.toLowerCase(), weight)
    }

    return vector
  }

  // Split text into sentences
  private static splitIntoSentences(text: string): string[] {
    return text
      .split(/[.!?\n]+/)
      .map((s) => s.trim())
      .filter((s) => s.length > 0)
  }

  // Classify a sentence to the best matching field
  private static classifySentence(
    sentence: string,
    allSentenceTokens: string[][],
  ): { field: keyof ParsedContact; score: number } {
    const tokens = this.tokenize(sentence)
    const idf = this.calculateIDF(allSentenceTokens)
    const sentenceVector = this.calculateTFIDF(tokens, idf)

    let bestField: keyof ParsedContact = "ism"
    let bestScore = 0

    // Check against each field's keywords
    for (const fieldName of Object.keys(FIELD_KEYWORDS) as Array<keyof typeof FIELD_KEYWORDS>) {
      const keywordVector = this.createKeywordVector(fieldName)
      const score = this.cosineSimilarity(sentenceVector, keywordVector)

      if (score > bestScore) {
        bestScore = score
        bestField = fieldName
      }
    }

    return { field: bestField, score: bestScore }
  }

  // Main parsing function
  static parse(text: string): ParsedContact {
    const result: ParsedContact = {
      ism: "",
      raqami: "",
      qayerdaTanishilgan: "",
      qandayFoydasi: "",
      bizningSFoydamiz: "",
      meetingDate: "",
    }

    // Split into sentences
    const sentences = this.splitIntoSentences(text)

    if (sentences.length === 0) {
      return result
    }

    // Tokenize all sentences for IDF calculation
    const allSentenceTokens = sentences.map((s) => this.tokenize(s))

    // Classify each sentence
    const classifications: Array<{ sentence: string; field: keyof ParsedContact; score: number }> = []

    for (let i = 0; i < sentences.length; i++) {
      const { field, score } = this.classifySentence(sentences[i], allSentenceTokens)
      classifications.push({ sentence: sentences[i], field, score })
    }

    // Group sentences by field
    for (const { sentence, field } of classifications) {
      if (result[field]) {
        result[field] += " " + sentence
      } else {
        result[field] = sentence
      }
    }

    // Clean up the results
    for (const key of Object.keys(result) as Array<keyof ParsedContact>) {
      if (result[key]) {
        result[key] = result[key].trim()
      }
    }

    return result
  }

  // Extract phone numbers from text
  static extractPhoneNumbers(text: string): string[] {
    // Correct regex: $$ matches opening parenthesis, $$ matches closing parenthesis
    const phoneRegex = /(\+?\d{1,3}[-.\s]?)?\(?\d{2,3}\)?[-.\s]?\d{3,4}[-.\s]?\d{2,4}/g
    return text.match(phoneRegex) || []
  }

  // Extract email addresses from text
  static extractEmails(text: string): string[] {
    const emailRegex = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g
    return text.match(emailRegex) || []
  }

  // Enhanced parsing with contact extraction
  static parseWithExtraction(text: string): ParsedContact {
    const parsed = this.parse(text)

    // Extract and append phone numbers and emails to raqami field
    const phones = this.extractPhoneNumbers(text)
    const emails = this.extractEmails(text)

    const contacts = [...phones, ...emails].join(", ")
    if (contacts && !parsed.raqami.includes(contacts)) {
      parsed.raqami = parsed.raqami ? `${parsed.raqami} ${contacts}` : contacts
    }

    return parsed
  }
}
