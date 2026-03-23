import { Body, Controller, Get, Put, Request, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { ProfileService } from './profile.service';
import { UpsertProfileDto } from './dto/profile.dto';

@UseGuards(JwtAuthGuard)
@Controller('profile')
export class ProfileController {
  constructor(private readonly profileService: ProfileService) {}

  @Get()
  getProfile(@Request() req: any) {
    return this.profileService.getProfile(req.user.userId);
  }

  @Put()
  upsertProfile(@Request() req: any, @Body() dto: UpsertProfileDto) {
    return this.profileService.upsertProfile(req.user.userId, dto);
  }
}

