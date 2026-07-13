export interface AIProvider {
  name: string
  generateText(prompt: string, options?: AIOptions): Promise<string>
  streamText(prompt: string, options?: AIOptions): AsyncGenerator<string>
  embedText(text: string): Promise<number[]>
}

export interface AIOptions {
  temperature?: number
  maxTokens?: number
  model?: string
  systemPrompt?: string
}

export interface AIProviderConfig {
  provider: "ollama" | "huggingface" | "groq" | "gemini" | "openrouter"
  apiKey?: string
  baseUrl?: string
  model?: string
}
