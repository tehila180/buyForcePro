import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Param,
  Body,
  UseGuards,
  BadRequestException,
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

  // ➕ יצירת קבוצה (בלי לצרף את המנהל!)
  @Post()
  async create(
    @Body() body: { productId: number; target: number },
  ) {
    const { productId, target } = body;

    if (!productId || !target) {
      throw new BadRequestException('productId ו-target חובה');
    }

    return this.prisma.group.create({
      data: {
        productId,
        target,
        status: 'open',
      },
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

  // 🗑️ מחיקת קבוצה (כולל חברים)
  @Delete(':id')
  async delete(@Param('id') id: string) {
    const groupId = Number(id);

    await this.prisma.groupMember.deleteMany({
      where: { groupId },
    });

    return this.prisma.group.delete({
      where: { id: groupId },
    });
  }
}
