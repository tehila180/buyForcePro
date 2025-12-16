// src/admin/admin-groups.controller.ts
import {
  Controller,
  Get,
  Put,
  Delete,
  Param,
  UseGuards,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { JwtAuthGuard } from '../auth/jwt.guard';
import { AdminGuard } from '../auth/admin.guard';

@Controller('admin/groups')
@UseGuards(JwtAuthGuard, AdminGuard)
export class AdminGroupsController {
  constructor(private prisma: PrismaService) {}

  // 📋 כל הקבוצות
  @Get()
  getAll() {
    return this.prisma.group.findMany({
      include: {
        product: true,
        members: {
          include: { user: true },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  // 🔄 שינוי סטטוס
  @Put(':id/status/:status')
  updateStatus(
    @Param('id') id: string,
    @Param('status') status: 'open' | 'completed' | 'paid',
  ) {
    return this.prisma.group.update({
      where: { id: Number(id) },
      data: { status },
    });
  }

  // 🗑️ מחיקת קבוצה
 @Delete(':id')
async delete(@Param('id') id: string) {
  const groupId = Number(id);

  // 1️⃣ מחיקת חברי הקבוצה
  await this.prisma.groupMember.deleteMany({
    where: { groupId },
  });

  // 2️⃣ מחיקת הקבוצה
  return this.prisma.group.delete({
    where: { id: groupId },
  });
}
}
