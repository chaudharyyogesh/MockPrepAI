import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { StartInterviewDto, AnswerQuestionDto } from './dto/interview.dto';
import { AiQuestionService } from '../ai/ai-question.service';

function mapDurationToQuestionCount(durationMinutes: number): number {
  if (durationMinutes <= 5) return 4;
  if (durationMinutes <= 15) return 10;
  return 18;
}

@Injectable()
export class InterviewService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly aiQuestions: AiQuestionService,
  ) {}

  async startInterview(userId: string, dto: StartInterviewDto) {
    const profile = await this.prisma.profile.findFirst({
      where: { userId },
      include: { currentResume: true },
    });
    if (!profile) {
      throw new BadRequestException('Profile not configured');
    }

    const totalQuestions = mapDurationToQuestionCount(dto.durationMinutes);

    const generated = await this.aiQuestions.generateQuestionsForInterview(userId, {
      interviewDomain: dto.interviewDomain,
      experienceLevel: dto.experienceLevel,
      durationMinutes: dto.durationMinutes,
      totalQuestions,
      profile,
      resume: profile.currentResume,
    });

    const questionsData = generated.map((q, idx) => ({
      section: q.section,
      orderIndex: idx,
      text: q.text,
    }));

    const interview = await this.prisma.interview.create({
      data: {
        userId,
        profileId: profile.id,
        status: 'in_progress',
        durationMinutes: dto.durationMinutes,
        interviewDomain: dto.interviewDomain,
        experienceLevel: dto.experienceLevel,
        totalQuestionsPlanned: totalQuestions,
        startTime: new Date(),
        questions: {
          create: questionsData,
        },
      },
      include: { questions: true },
    });

    const firstQuestion = interview.questions.find((q) => q.orderIndex === 0);

    return {
      interviewId: interview.id,
      question: firstQuestion,
    };
  }

  async getCurrentQuestion(userId: string, interviewId: string) {
    const interview = await this.ensureInterviewBelongsToUser(userId, interviewId);

    const questions = await this.prisma.question.findMany({
      where: { interviewId: interview.id },
      orderBy: { orderIndex: 'asc' },
    });

    const answeredIds = new Set(
      (
        await this.prisma.response.findMany({
          where: { interviewId: interview.id },
          select: { questionId: true },
        })
      ).map((r) => r.questionId),
    );

    const nextQuestion = questions.find((q) => !answeredIds.has(q.id));

    if (!nextQuestion) {
      return { done: true };
    }

    return { done: false, question: nextQuestion };
  }

  async submitAnswer(userId: string, interviewId: string, questionId: string, dto: AnswerQuestionDto) {
    const interview = await this.ensureInterviewBelongsToUser(userId, interviewId);

    const question = await this.prisma.question.findFirst({
      where: { id: questionId, interviewId: interview.id },
    });

    if (!question) {
      throw new NotFoundException('Question not found for this interview');
    }

    await this.prisma.response.create({
      data: {
        interviewId: interview.id,
        questionId: question.id,
        transcript: dto.transcript,
        audioUrl: dto.audioUrl,
        durationSeconds: dto.durationSeconds,
        startedAt: new Date(),
        endedAt: new Date(),
      },
    });

    const remaining = await this.getCurrentQuestion(userId, interviewId);
    return remaining;
  }

  async endInterview(userId: string, interviewId: string) {
    const interview = await this.ensureInterviewBelongsToUser(userId, interviewId);

    await this.prisma.interview.update({
      where: { id: interview.id },
      data: {
        status: 'completed',
        endTime: new Date(),
      },
    });

    // TODO: Trigger AI-based scoring and evaluation (Step 7)

    return { status: 'completed' };
  }

  async getReport(userId: string, interviewId: string) {
    await this.ensureInterviewBelongsToUser(userId, interviewId);

    const interview = await this.prisma.interview.findUnique({
      where: { id: interviewId },
      include: {
        questions: true,
        responses: true,
        evaluation: true,
      },
    });

    if (!interview) {
      throw new NotFoundException('Interview not found');
    }

    return interview;
  }

  async history(userId: string) {
    return this.prisma.interview.findMany({
      where: { userId },
      orderBy: { startTime: 'desc' },
      include: { evaluation: true },
    });
  }

  private async ensureInterviewBelongsToUser(userId: string, interviewId: string) {
    const interview = await this.prisma.interview.findUnique({ where: { id: interviewId } });
    if (!interview || interview.userId !== userId) {
      throw new NotFoundException('Interview not found');
    }
    return interview;
  }

  private inferSection(idx: number, total: number): string {
    const ratio = idx / total;
    if (ratio < 0.15) return 'introduction';
    if (ratio < 0.6) return 'technical';
    if (ratio < 0.85) return 'behavioral';
    return 'closing';
  }
}

