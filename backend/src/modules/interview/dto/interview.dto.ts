import { IsIn, IsInt, IsOptional, IsString, IsUrl, Max, Min } from 'class-validator';

export class StartInterviewDto {
  @IsIn(['software_engineer', 'data_engineer', 'product_manager', 'financial_analyst', 'marketing_analyst'])
  interviewDomain!: string;

  @IsIn(['entry', 'mid', 'senior'])
  experienceLevel!: string;

  @IsInt()
  @Min(5)
  @Max(30)
  durationMinutes!: number;
}

export class AnswerQuestionDto {
  @IsInt()
  durationSeconds!: number;

  @IsString()
  transcript!: string;

  @IsOptional()
  @IsUrl()
  audioUrl?: string;
}

