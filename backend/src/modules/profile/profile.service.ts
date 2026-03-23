import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { UpsertProfileDto } from './dto/profile.dto';

@Injectable()
export class ProfileService {
  constructor(private readonly prisma: PrismaService) {}

  getProfile(userId: string) {
    return this.prisma.profile.findFirst({
      where: { userId },
      include: { currentResume: true },
    });
  }

  async upsertProfile(userId: string, dto: UpsertProfileDto) {
    const existing = await this.prisma.profile.findFirst({ where: { userId } });

    if (existing) {
      return this.prisma.profile.update({
        where: { id: existing.id },
        data: {
          primaryRole: dto.primaryRole,
          experienceLevel: dto.experienceLevel,
          techStack: dto.techStack,
          targetCompanies: dto.targetCompanies,
        },
      });
    }

    return this.prisma.profile.create({
      data: {
        userId,
        primaryRole: dto.primaryRole,
        experienceLevel: dto.experienceLevel,
        techStack: dto.techStack,
        targetCompanies: dto.targetCompanies,
      },
    });
  }
}

