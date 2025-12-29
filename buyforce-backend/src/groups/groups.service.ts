import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class GroupsService {
  constructor(private prisma: PrismaService) {}

  // =========================
  // ⭐ הקבוצות שלי – אזור אישי
  // =========================
  async findMyGroups(userId: string) {
    const memberships = await this.prisma.groupMember.findMany({
      where: { userId },
      include: {
        group: {
          include: {
            product: true,
            members: { include: { user: true } },
            payments: true,
          },
        },
      },
    });

    return memberships.map(m => {
      const group = m.group;

      const paidUserIds = new Set(
        group.payments
          .filter(p => p.status === 'CAPTURED')
          .map(p => p.userId),
      );

      const membersCount = group.members.length;
      const isCompleted = membersCount >= group.target;

      // ✅ כולם שילמו = כל חבר בקבוצה נמצא ב-paidUserIds
      const allPaid = group.members.every(mem => paidUserIds.has(mem.userId));

      return {
        id: group.id,
        product: group.product,

        // זה רק לתצוגה! לא משנה DB
        status: group.status,
        statusView: allPaid ? 'paid' : group.status,

        target: group.target,
        membersCount,
        isCompleted,
        allPaid,

        hasPaid: paidUserIds.has(userId),

        members: group.members.map(mem => ({
          id: mem.user.id,
          name: mem.user.username || mem.user.email,
          hasPaid: paidUserIds.has(mem.user.id),
        })),
      };
    });
  }

  // =========================
  // ⭐ פתיחת קבוצה
  // =========================
  async createGroup(productId: number, userId: string) {
    const product = await this.prisma.product.findUnique({
      where: { id: productId },
    });
    if (!product) throw new NotFoundException('מוצר לא נמצא');

    const group = await this.prisma.group.create({
      data: { productId, status: 'open' },
    });

    await this.prisma.groupMember.create({
      data: { groupId: group.id, userId },
    });

    return group;
  }

  // =========================
  // ⭐ הצטרפות לקבוצה
  // =========================
 async joinGroup(groupId: number, userId: string) {
  // הצטרפות
  await this.prisma.groupMember.upsert({
    where: { groupId_userId: { groupId, userId } },
    update: {},
    create: { groupId, userId },
  });

  // בדיקת מצב הקבוצה
  const group = await this.prisma.group.findUnique({
    where: { id: groupId },
    include: { members: true },
  });

  if (!group) throw new NotFoundException('קבוצה לא נמצאה');

  // ⭐ אם הקבוצה מלאה ועדיין open → נסמן כ-completed
  if (
    group.members.length >= group.target &&
    group.status === 'open'
  ) {
    await this.prisma.group.update({
      where: { id: groupId },
      data: { status: 'completed' },
    });
  }

  return { success: true };
}


  // =========================
  // ⭐ קבוצה ציבורית
  // =========================
  async findOnePublic(groupId: number, userId: string | null) {
    const group = await this.prisma.group.findUnique({
      where: { id: groupId },
      include: {
        product: true,
        members: { include: { user: true } },
        payments: true,
      },
    });

    if (!group) throw new NotFoundException('קבוצה לא נמצאה');

    const paidUserIds = new Set(
      group.payments
        .filter(p => p.status === 'CAPTURED')
        .map(p => p.userId),
    );

    const membersCount = group.members.length;
    const isCompleted = membersCount >= group.target;

    const allPaid = group.members.every(mem => paidUserIds.has(mem.userId));

    const isMember = userId
      ? group.members.some(m => m.userId === userId)
      : false;

    return {
      id: group.id,
      product: group.product,

      status: group.status,
      statusView: allPaid ? 'paid' : group.status,

      target: group.target,
      membersCount,
      isCompleted,
      allPaid,
      isMember,

      members: group.members.map(mem => ({
        id: mem.user.id,
        name: mem.user.username || mem.user.email,
        hasPaid: paidUserIds.has(mem.user.id),
        isMe: userId ? mem.user.id === userId : false,
      })),
    };
  }

  // =========================
  // ⭐ קבוצות לדף הבית
  // =========================
  async findFeatured() {
    return this.prisma.group.findMany({
      where: { status: 'open' },
      include: { product: true, members: true },
      orderBy: { createdAt: 'desc' },
    });
  }

  // =========================
  // ⭐ קבוצות לפי מוצר
  // =========================
  async findByProduct(productId: number) {
    return this.prisma.group.findMany({
      where: { productId, status: 'open' },
      include: { product: true, members: true },
      orderBy: { createdAt: 'desc' },
    });
  }
}
