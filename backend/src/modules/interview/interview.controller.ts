import { Body, Controller, Get, Param, Post, Query, Request, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { InterviewService } from './interview.service';
import { StartInterviewDto, AnswerQuestionDto } from './dto/interview.dto';

@UseGuards(JwtAuthGuard)
@Controller('interview')
export class InterviewController {
  constructor(private readonly interviewService: InterviewService) {}

  @Post('start')
  start(@Request() req: any, @Body() dto: StartInterviewDto) {
    return this.interviewService.startInterview(req.user.userId, dto);
  }

  @Get('question')
  getCurrent(@Request() req: any, @Query('interviewId') interviewId: string) {
    return this.interviewService.getCurrentQuestion(req.user.userId, interviewId);
  }

  @Post('answer')
  answer(
    @Request() req: any,
    @Query('interviewId') interviewId: string,
    @Query('questionId') questionId: string,
    @Body() dto: AnswerQuestionDto,
  ) {
    return this.interviewService.submitAnswer(req.user.userId, interviewId, questionId, dto);
  }

  @Post('end')
  end(@Request() req: any, @Body('interviewId') interviewId: string) {
    return this.interviewService.endInterview(req.user.userId, interviewId);
  }

  @Get('report/:id')
  report(@Request() req: any, @Param('id') interviewId: string) {
    return this.interviewService.getReport(req.user.userId, interviewId);
  }

  @Get('history')
  history(@Request() req: any) {
    return this.interviewService.history(req.user.userId);
  }
}

