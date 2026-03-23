import { INestApplication, Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit {
  private readonly logger = new Logger(PrismaService.name);

  async onModuleInit() {
    try {
      await this.$connect();
    } catch (err) {
      // Allow the API to boot so callers get a proper error response instead of a proxy 502.
      this.logger.error(`Prisma failed to connect: ${String(err)}`);
    }
  }

  async enableShutdownHooks(app: INestApplication) {
    // Prisma's event typings can vary by version; keep this compatible across versions.
    (this as any).$on('beforeExit', async () => {
      await app.close();
    });
  }
}

