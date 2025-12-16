import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { PaypalService } from './paypal.service';

@Injectable()
export class PaymentsService {
  constructor(
    private prisma: PrismaService,
    private paypal: PaypalService,
  ) {}
async capture(token: string, paymentId: number) {
  // 1️⃣ Capture ב-PayPal
  await this.paypal.captureOrder(token);

  // 2️⃣ מסמנים את התשלום הזה כהצלחה
  const payment = await this.prisma.payment.update({
    where: { id: paymentId },
    data: { status: 'success' },
  });

  // 3️⃣ מביאים את הקבוצה והחברים
  const group = await this.prisma.group.findUnique({
    where: { id: payment.groupId },
    include: { members: true },
  });
  if (!group) throw new NotFoundException('Group not found');

  // 4️⃣ סופרים כמה שילמו
  const paidCount = await this.prisma.payment.count({
    where: {
      groupId: group.id,
      status: 'success',
    },
  });

  // 5️⃣ רק אם כולם שילמו → הקבוצה paid
  if (paidCount === group.members.length) {
    await this.prisma.group.update({
      where: { id: group.id },
      data: {
        status: 'paid',
        paidAt: new Date(),
      },
    });
  }

  return { ok: true, groupId: group.id };
}

 async createOrder(groupId: number, userId: string) {
  const group = await this.prisma.group.findUnique({
    where: { id: groupId },
    include: { product: true, members: true },
  });
  if (!group) throw new NotFoundException('Group not found');

  if (group.status !== 'completed') {
    throw new BadRequestException('אפשר לשלם רק אחרי שהקבוצה מלאה');
  }

  const isMember = group.members.some(m => m.userId === userId);
  if (!isMember) throw new BadRequestException('אינך חברה בקבוצה');

  const payment = await this.prisma.payment.upsert({
    where: { groupId_userId: { groupId, userId } },
    update: { status: 'pending', amount: group.product.priceGroup },
    create: {
      groupId,
      userId,
      amount: group.product.priceGroup,
      status: 'pending',
      provider: 'paypal',
    },
  });

  const order = await this.paypal.createOrder(
    group.product.priceGroup,
    payment.id,
  );

  await this.prisma.payment.update({
    where: { id: payment.id },
    data: { paypalOrderId: order.id },
  });

  const approve = order.links.find(l => l.rel === 'approve')?.href;
  if (!approve) throw new BadRequestException('Approve URL missing');

  return { redirectUrl: approve, paymentId: payment.id };
}
}
