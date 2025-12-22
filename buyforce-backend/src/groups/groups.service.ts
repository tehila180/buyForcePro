import {
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class GroupsService {
  constructor(private prisma: PrismaService) {}

  // ⭐ הקבוצות שלי
  async findMyGroups(userId: string) {
    const memberships = await this.prisma.groupMember.findMany({
      where: { userId },
      include: {
        group: {
          include: {
            product: true,
            members: true,
            payments: true,
          },
        },
      },
    });

    return memberships.map(m => {
      const hasPaid = m.group.payments.some(
        p => p.userId === userId && p.status === 'CAPTURED',
      );

      return {
        ...m.group,
        hasPaid,
      };
    });
  }

  // ⭐ הצטרפות לקבוצה
  async joinGroup(groupId: number, userId: string) {
    await this.prisma.groupMember.upsert({
      where: { groupId_userId: { groupId, userId } },
      update: {},
      create: { groupId, userId },
    });

    return this.prisma.group.findUnique({
      where: { id: groupId },
      include: { members: true },
    });
  }

  // ⭐ קבוצה אחת – ציבורית
  async findOnePublic(groupId: number) {
    const group = await this.prisma.group.findUnique({
      where: { id: groupId },
      include: {
        product: true,
        members: { include: { user: true } },
      },
    });

    if (!group) {
      throw new NotFoundException('קבוצה לא נמצאה');
    }

    return group;
  }

  // ⭐ ביטול קבוצה
  async cancelGroup(groupId: number) {
    const group = await this.prisma.group.findUnique({
      where: { id: groupId },
    });

    if (!group) {
      throw new NotFoundException('קבוצה לא נמצאה');
    }

    await this.prisma.group.update({
      where: { id: groupId },
      data: { status: 'cancelled' },
    });

    return { success: true };
  }

  // ⭐ קבוצות פתוחות לדף הבית
  async findFeatured() {
    return this.prisma.group.findMany({
      where: { status: 'open' },
      include: {
        product: true,
        members: true,
      },
      orderBy: { createdAt: 'desc' },
    });
  }
}
