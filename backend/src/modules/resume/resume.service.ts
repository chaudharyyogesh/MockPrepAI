import { Injectable, BadRequestException } from '@nestjs/common';
import { randomUUID } from 'crypto';
import { extname } from 'path';
import { promises as fs } from 'fs';
import { PrismaService } from '../../prisma/prisma.service';
import type { Express } from 'express';

type UploadResult = { fileUrl: string; storedFilename: string };

@Injectable()
export class ResumeService {
  constructor(private readonly prisma: PrismaService) {}

  async uploadResume(params: {
    userId: string;
    file: Express.Multer.File;
    requestOrigin?: string;
  }) {
    const { userId, file, requestOrigin } = params;

    if (!file) throw new BadRequestException('Resume file is required');

    const driver = (process.env.STORAGE_DRIVER || 'local').toLowerCase();
    const safeExt = extname(file.originalname || '').toLowerCase();
    const storedFilename = `${randomUUID()}${safeExt || ''}`;

    let upload: UploadResult;
    if (driver === 's3') {
      upload = await this.uploadToS3({ userId, file, storedFilename });
    } else {
      upload = await this.uploadToLocal({ storedFilename, file, requestOrigin });
    }

    const resume = await this.prisma.resume.create({
      data: {
        userId,
        originalFilename: file.originalname,
        fileUrl: upload.fileUrl,
      },
    });

    const profile = await this.prisma.profile.findFirst({ where: { userId } });
    if (profile) {
      await this.prisma.profile.update({
        where: { id: profile.id },
        data: { currentResumeId: resume.id },
      });
    }

    return { resume, storage: driver };
  }

  private async uploadToLocal(params: {
    storedFilename: string;
    file: Express.Multer.File;
    requestOrigin?: string;
  }): Promise<UploadResult> {
    // Multer diskStorage writes file to disk; memoryStorage provides buffer.
    // Ensure we have a file in uploads/resumes named storedFilename.
    const uploadsDir = process.env.UPLOADS_DIR || 'uploads';
    const targetPath = `${process.cwd()}/${uploadsDir}/resumes/${params.storedFilename}`;
    if (params.file.buffer?.length) {
      await fs.mkdir(`${process.cwd()}/${uploadsDir}/resumes`, { recursive: true });
      await fs.writeFile(targetPath, params.file.buffer);
    } else if (!params.file.path) {
      throw new BadRequestException('Upload failed: missing file contents');
    }

    const base = params.requestOrigin || process.env.BACKEND_ORIGIN || 'http://localhost:3000';
    const fileUrl = `${base}/uploads/resumes/${params.storedFilename}`;
    return { fileUrl, storedFilename: params.storedFilename };
  }

  private async uploadToS3(params: {
    userId: string;
    file: Express.Multer.File;
    storedFilename: string;
  }): Promise<UploadResult> {
    const { S3Client, PutObjectCommand } = await import('@aws-sdk/client-s3');

    const region = process.env.AWS_REGION;
    const bucket = process.env.S3_BUCKET;
    if (!region || !bucket) {
      throw new BadRequestException('S3 storage is not configured (AWS_REGION, S3_BUCKET)');
    }

    const client = new S3Client({
      region,
      credentials: process.env.AWS_ACCESS_KEY_ID && process.env.AWS_SECRET_ACCESS_KEY
        ? {
            accessKeyId: process.env.AWS_ACCESS_KEY_ID,
            secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
          }
        : undefined,
    });

    const key = `resumes/${params.userId}/${params.storedFilename}`;
    await client.send(
      new PutObjectCommand({
        Bucket: bucket,
        Key: key,
        Body: params.file.buffer,
        ContentType: params.file.mimetype,
      }),
    );

    const baseUrl =
      process.env.S3_PUBLIC_BASE_URL ||
      `https://${bucket}.s3.${region}.amazonaws.com`;

    return { storedFilename: params.storedFilename, fileUrl: `${baseUrl}/${key}` };
  }
}

