import { NextResponse } from "next/server"

// Retry logic with exponential backoff
async function fetchWithRetry(
  url: string,
  options: RequestInit,
  maxRetries: number = 3,
  baseDelay: number = 1000
): Promise<Response> {
  let lastError: Error

  for (let i = 0; i <= maxRetries; i++) {
    try {
      const response = await fetch(url, options)
      
      // If we get a 429 (rate limit) error and have retries left, wait and retry
      if (response.status === 429 && i < maxRetries) {
        const retryAfter = response.headers.get("Retry-After")
        const delay = retryAfter ? parseInt(retryAfter) * 1000 : baseDelay * Math.pow(2, i)
        console.log(`[OpenAI] Rate limited. Waiting ${delay}ms before retry ${i + 1}/${maxRetries}`)
        await new Promise(resolve => setTimeout(resolve, delay))
        continue
      }
      
      return response
    } catch (error) {
      lastError = error as Error
      if (i === maxRetries) {
        throw error
      }
      
      // Wait before retrying
      const delay = baseDelay * Math.pow(2, i)
      console.log(`[OpenAI] Request failed. Waiting ${delay}ms before retry ${i + 1}/${maxRetries}`)
      await new Promise(resolve => setTimeout(resolve, delay))
    }
  }
  
  throw lastError!
}

export async function callOpenAI(
  apiKey: string,
  body: any,
  model: string = "gpt-4o-mini"
) {
  try {
    const response = await fetchWithRetry("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model,
        ...body,
      }),
    })

    return response
  } catch (error) {
    console.error("[OpenAI] Request failed:", error)
    throw error
  }
}