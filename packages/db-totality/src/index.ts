export * as prisma from '@prisma/client';
import { Prisma, PrismaClient } from '@prisma/client';

export class DbClient<T extends Prisma.PrismaClientOptions = Prisma.PrismaClientOptions> {
  public client: PrismaClient;
  constructor(arg?: Prisma.Subset<T, Prisma.PrismaClientOptions>) {
    this.client = new PrismaClient(arg);
  }

  async exec<T>(fn: (client: PrismaClient) => Promise<T>): Promise<T> {
    await this.client.$connect();
    try {
      return await fn(this.client);
    } finally { 
      await this.client.$disconnect();
    }
  }
}
