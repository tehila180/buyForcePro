import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class GroupsService {
  constructor(private prisma: PrismaService) {}

  // ✅ הקבוצות שלי
  async findMyGroups(userId: string) {
    return this.prisma.groupMember.findMany({
      where: { userId },
      include: {
        group: {
          include: {
            product: true,
            members: true,
          },
        },
      },
    });
  }

  // ✅ יצירת קבוצה
  async createGroup(productId: number, userId: string) {
    return this.prisma.$transaction(async (tx) => {
      const product = await tx.product.findUnique({
        where: { id: productId },
      });

      if (!product) {
        throw new NotFoundException('המוצר לא נמצא');
      }

      const group = await tx.group.create({
        data: {
          productId,
          status: 'open',
        },
      });

      await tx.groupMember.create({
        data: {
          groupId: group.id,
          userId,
        },
      });

      return group;
    });
  }

  // ✅ הצטרפות + סגירה אוטומטית
  async joinGroup(groupId: number, userId: string) {
    return this.prisma.$transaction(async (tx) => {
      await tx.groupMember.upsert({
        where: {
          groupId_userId: { groupId, userId },
        },
        update: {},
        create: { groupId, userId },
      });

      const group = await tx.group.findUnique({
        where: { id: groupId },
        select: {
          id: true,
          target: true,
          members: true,
        },
      });

      if (!group) throw new NotFoundException('קבוצה לא נמצאה');

      if (group.members.length >= group.target) {
        await tx.group.update({
          where: { id: groupId },
          data: { status: 'completed' },
        });
      }

      return group;
    });
  }

  // ✅ קבוצות פתוחות למוצר
  async findOpenForProduct(productId: number) {
    return this.prisma.group.findMany({
      where: {
        productId,
        status: 'open',
      },
      include: {
        members: true,
      },
    });
  }

  // ✅ קבוצה אחת
  async findOne(groupId: number) {
    const group = await this.prisma.group.findUnique({
      where: { id: groupId },
      include: {
        product: true,
        members: {
          include: { user: true },
        },
      },
    });

    if (!group) throw new NotFoundException('קבוצה לא נמצאה');

    return group;
  }
  async payGroup(groupId: number, userId: string) {
  const group = await this.prisma.group.findUnique({
    where: { id: groupId },
    include: {
      members: true,
    },
  });

  if (!group) throw new NotFoundException('קבוצה לא נמצאה');

  const isMember = group.members.some(m => m.userId === userId);
  if (!isMember) {
    throw new Error('אינך חבר בקבוצה זו');
  }

  if (group.status !== 'completed') {
    throw new Error('הקבוצה עדיין לא מוכנה לתשלום');
  }

  await this.prisma.group.update({
    where: { id: groupId },
    data: {
      status: 'paid',
      paidAt: new Date(),
    },
  });

  return { success: true };
}
// ✅ קבוצות פעילות (לדף הבית)
async findFeatured() {
  return this.prisma.group.findMany({
    where: {
      status: 'open',
    },
    include: {
      product: true,
      members: true,
    },
    orderBy: {
      createdAt: 'desc',
    },
  });
}


}
