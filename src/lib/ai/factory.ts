import { AIProvider, AIProviderConfig } from "./provider.interface"

export class AIProviderFactory {
  static create(config: AIProviderConfig): AIProvider {
    // Implement provider creation
    throw new Error(`Unsupported AI provider: ${config.provider}`)
  }
}
