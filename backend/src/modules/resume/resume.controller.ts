import {
  Controller,
  Get,
  Post,
  UseGuards,
  Request,
  UseInterceptors,
  UploadedFile,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage, memoryStorage } from 'multer';
import { extname, join } from 'path';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { ResumeService } from './resume.service';
import type { Request as ExpressRequest } from 'express';

@UseGuards(JwtAuthGuard)
@Controller('resume')
export class ResumeController {
  constructor(private readonly resumeService: ResumeService) {}

  @Get()
  async listUserResumes(@Request() req: any) {
    return { items: [], userId: req.user.userId };
  }

  @Post('upload')
  @UseInterceptors(
    FileInterceptor('file', {
      storage: (process.env.STORAGE_DRIVER || 'local').toLowerCase() === 's3'
        ? memoryStorage()
        : diskStorage({
            destination: (_req: ExpressRequest, _file: Express.Multer.File, cb) => {
              const uploadsDir = process.env.UPLOADS_DIR || 'uploads';
              cb(null, join(process.cwd(), uploadsDir, 'resumes'));
            },
            filename: (_req: ExpressRequest, file: Express.Multer.File, cb) => {
              const safeExt = extname(file.originalname || '').toLowerCase();
              cb(null, `${Date.now()}-${Math.round(Math.random() * 1e9)}${safeExt}`);
            },
          }),
      limits: { fileSize: 10 * 1024 * 1024 }, // 10MB
      fileFilter: (_req, file, cb) => {
        const allowed = new Set([
          'application/pdf',
          'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
          'text/plain',
        ]);
        if (!allowed.has(file.mimetype)) {
          return cb(new Error('Only PDF, DOCX, or TXT files are allowed'), false);
        }
        cb(null, true);
      },
    }),
  )
  async upload(@Request() req: any, @UploadedFile() file?: Express.Multer.File) {
    // If using S3 driver, we prefer memory storage. For now, we support S3 by reading from disk only
    // when Multer provided a buffer (some setups do). If buffer missing in S3 mode, we’ll fail clearly.
    const origin =
      req.headers?.origin ||
      (req.headers?.host ? `${req.protocol}://${req.headers.host}` : undefined);

    return this.resumeService.uploadResume({
      userId: req.user.userId,
      file: file as Express.Multer.File,
      requestOrigin: origin,
    });
  }
}

