/**
 * LLM Client for Anthropic Claude API
 *
 * Handles communication with Claude API for habit stack generation
 * and weekly reflection insights.
 */

export interface LLMClientConfig {
  apiKey: string;
  model?: string;
  maxTokens?: number;
}

export interface LLMMessage {
  role: "user" | "assistant";
  content: string;
}

export interface LLMResponse {
  content: string;
  model: string;
  usage?: {
    inputTokens: number;
    outputTokens: number;
  };
}

export class LLMClient {
  private apiKey: string;
  private model: string;
  private maxTokens: number;
  private baseURL = "https://api.anthropic.com/v1/messages";

  constructor(config: LLMClientConfig) {
    this.apiKey = config.apiKey;
    this.model = config.model || "claude-3-5-sonnet-20241022";
    this.maxTokens = config.maxTokens || 2048;
  }

  async generateCompletion(messages: LLMMessage[]): Promise<LLMResponse> {
    try {
      const response = await fetch(this.baseURL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-api-key": this.apiKey,
          "anthropic-version": "2023-06-01",
        },
        body: JSON.stringify({
          model: this.model,
          max_tokens: this.maxTokens,
          messages: messages.map((msg) => ({
            role: msg.role,
            content: msg.content,
          })),
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(
          `Claude API error: ${response.status} ${response.statusText} - ${JSON.stringify(errorData)}`
        );
      }

      const data = await response.json();

      return {
        content: data.content[0].text,
        model: data.model,
        usage: {
          inputTokens: data.usage.input_tokens,
          outputTokens: data.usage.output_tokens,
        },
      };
    } catch (error) {
      if (error instanceof Error) {
        throw new Error(`LLM API call failed: ${error.message}`);
      }
      throw error;
    }
  }

  /**
   * Generate a single completion from a user prompt
   */
  async complete(userPrompt: string): Promise<string> {
    const response = await this.generateCompletion([
      {
        role: "user",
        content: userPrompt,
      },
    ]);

    return response.content;
  }
}
