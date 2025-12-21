import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class GroupsService {
  constructor(private prisma: PrismaService) {}

  // ✅ הקבוצות שלי + האם המשתמש שילם
  async findMyGroups(userId: string) {
    const rows = await this.prisma.groupMember.findMany({
      where: { userId },
      include: {
        group: {
          include: {
            product: true,
            members: {
              include: { user: true },
            },
            payments: true,
          },
        },
      },
    });

    return rows.map(row => {
      const hasPaid = row.group.payments.some(
        p => p.userId === userId && p.status === 'CAPTURED'
      );

      return {
        group: row.group,
        hasPaid,
      };
    });
  }

  // ✅ קבוצה אחת + מי שילם
  async findOne(groupId: number, userId: string) {
    const group = await this.prisma.group.findUnique({
      where: { id: groupId },
      include: {
        product: true,
        members: {
          include: { user: true },
        },
        payments: true,
      },
    });

    if (!group) throw new NotFoundException('קבוצה לא נמצאה');

    const paidUserIds = group.payments
      .filter(p => p.status === 'CAPTURED')
      .map(p => p.userId);

    return {
      ...group,
      paidUserIds,
      hasPaid: paidUserIds.includes(userId),
    };
  }
}
