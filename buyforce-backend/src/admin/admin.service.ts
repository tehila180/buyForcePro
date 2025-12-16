// src/admin/admin.service.ts
import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class AdminService {
  constructor(private prisma: PrismaService) {}

  async getStats() {
    const users = await this.prisma.user.count();
    const products = await this.prisma.product.count();
    const openGroups = await this.prisma.group.count({ where: { status: 'open' } });
    const completed = await this.prisma.group.count({ where: { status: 'completed' } });
    const paid = await this.prisma.group.count({ where: { status: 'paid' } });

    return {
      users,
      products,
      groups: {
        open: openGroups,
        completed,
        paid,
      },
    };
  }
}
