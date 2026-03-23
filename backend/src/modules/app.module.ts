import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { AuthModule } from './auth/auth.module';
import { UserModule } from './user/user.module';
import { ProfileModule } from './profile/profile.module';
import { ResumeModule } from './resume/resume.module';
import { InterviewModule } from './interview/interview.module';
import { PrismaModule } from './prisma.module';
import { AiModule } from './ai/ai.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    JwtModule.register({}), // configured in AuthModule
    PrismaModule,
    AiModule,
    AuthModule,
    UserModule,
    ProfileModule,
    ResumeModule,
    InterviewModule,
  ],
})
export class AppModule {}


