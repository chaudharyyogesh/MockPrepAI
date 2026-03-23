import { Module } from '@nestjs/common';
import { AiClientService } from './ai-client.service';
import { AiQuestionService } from './ai-question.service';

@Module({
  providers: [AiClientService, AiQuestionService],
  exports: [AiQuestionService],
})
export class AiModule {}

