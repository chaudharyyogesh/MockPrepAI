import { IsIn, IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class UpsertProfileDto {
  @IsString()
  @IsNotEmpty()
  primaryRole!: string;

  @IsIn(['entry', 'mid', 'senior'])
  experienceLevel!: string;

  @IsOptional()
  techStack?: any;

  @IsOptional()
  targetCompanies?: any;
}

