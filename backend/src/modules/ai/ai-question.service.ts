import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { AiClientService } from './ai-client.service';
import { GeneratedQuestion, InterviewSectionKey } from './types';

interface QuestionPlanInput {
  interviewDomain: string;
  experienceLevel: string;
  durationMinutes: number;
  totalQuestions: number;
  profile: any;
  resume: any;
}

@Injectable()
export class AiQuestionService {
  private readonly logger = new Logger(AiQuestionService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly aiClient: AiClientService,
  ) {}

  async generateQuestionsForInterview(userId: string, input: QuestionPlanInput): Promise<GeneratedQuestion[]> {
    const { totalQuestions } = input;

    try {
      const messages = [
        {
          role: 'system' as const,
          content:
            'You are an expert technical interviewer. Generate realistic, concise interview questions as JSON based on the candidate profile.',
        },
        {
          role: 'user' as const,
          content: JSON.stringify(input),
        },
      ];

      type Schema = {
        questions: {
          section: InterviewSectionKey;
          text: string;
          tags?: string[];
        }[];
      };

      const data = await this.aiClient.chatJson<Schema>(messages, 'Interview question plan for a mock interview.');

      if (!data?.questions?.length) {
        throw new Error('Empty questions from AI');
      }

      // Ensure we have at most totalQuestions
      return data.questions.slice(0, totalQuestions);
    } catch (err) {
      this.logger.warn(`AI question generation failed for user ${userId}, falling back. Error: ${String(err)}`);
      return this.fallbackQuestions(input);
    }
  }

  private fallbackQuestions(input: QuestionPlanInput): GeneratedQuestion[] {
    const { totalQuestions, interviewDomain } = input;

    const sections: InterviewSectionKey[] = ['introduction', 'technical', 'behavioral', 'closing'];

    const questions: GeneratedQuestion[] = [];
    for (let i = 0; i < totalQuestions; i += 1) {
      const ratio = i / totalQuestions;
      let section: InterviewSectionKey;
      if (ratio < 0.15) section = 'introduction';
      else if (ratio < 0.6) section = 'technical';
      else if (ratio < 0.85) section = 'behavioral';
      else section = 'closing';

      questions.push({
        section,
        text: `Fallback ${interviewDomain} question ${i + 1} (${section})`,
      });
    }
    return questions;
  }
}

