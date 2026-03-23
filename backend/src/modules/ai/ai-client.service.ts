import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

interface AiChatMessage {
  role: 'system' | 'user';
  content: string;
}

@Injectable()
export class AiClientService {
  private readonly logger = new Logger(AiClientService.name);
  private readonly provider: string;
  private readonly openAiApiKey?: string;

  constructor(private readonly config: ConfigService) {
    this.provider = this.config.get<string>('AI_PROVIDER') || 'openai';
    this.openAiApiKey = this.config.get<string>('OPENAI_API_KEY');
  }

  async chatJson<T>(messages: AiChatMessage[], schemaDescription: string): Promise<T> {
    if (this.provider === 'openai') {
      return this.callOpenAiJson<T>(messages, schemaDescription);
    }

    this.logger.warn(`AI provider ${this.provider} not implemented, falling back to error.`);
    throw new Error('AI provider not implemented');
  }

  private async callOpenAiJson<T>(messages: AiChatMessage[], schemaDescription: string): Promise<T> {
    if (!this.openAiApiKey) {
      throw new Error('OPENAI_API_KEY not configured');
    }

    const body = {
      model: this.config.get<string>('OPENAI_MODEL') || 'gpt-4.1-mini',
      messages,
      response_format: {
        type: 'json_schema',
        json_schema: {
          name: 'response',
          schema: {
            type: 'object',
            description: schemaDescription,
            properties: {
              data: {},
            },
            required: ['data'],
          },
        },
      },
    };

    const res = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${this.openAiApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    });

    if (!res.ok) {
      const text = await res.text();
      this.logger.error(`OpenAI error: ${res.status} ${text}`);
      throw new Error('OpenAI request failed');
    }

    const json: any = await res.json();
    const content = json.choices?.[0]?.message?.content;
    if (!content) {
      throw new Error('OpenAI response missing content');
    }

    const parsed = JSON.parse(content);
    return parsed.data as T;
  }
}

