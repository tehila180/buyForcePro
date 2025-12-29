import {
  Injectable,
  BadRequestException,
  ForbiddenException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { PaymentStatus, PaymentProvider } from '@prisma/client';

@Injectable()
export class PaymentsService {
  constructor(private prisma: PrismaService) {}

  // "Pending" אצלך זה CREATED (כי זה enum קיים בסכמה)
  async createPendingPayment(userId: string, groupId: number, amountIls: number) {
    const group = await this.prisma.group.findUnique({
      where: { id: groupId },
      include: { members: true },
    });

    if (!group) throw new BadRequestException('Group not found');

    const isMember = group.members.some(m => m.userId === userId);
    if (!isMember) throw new ForbiddenException('User is not a member');

    // כבר שילם? (CAPTURED)
    const existing = await this.prisma.payment.findFirst({
      where: {
        userId,
        groupId,
        status: PaymentStatus.CAPTURED,
      },
    });

    if (existing) throw new BadRequestException('User already paid');

    return this.prisma.payment.create({
      data: {
        provider: PaymentProvider.PAYPAL,
        status: PaymentStatus.CREATED, // ✅ תואם enum שלך
        userId,
        groupId,
        amount: amountIls,
        currency: 'ILS',
      },
    });
  }

  async markPaymentCaptured(paymentId: string, paypalOrderId: string, paypalCaptureId: string | null) {
    // ✅ paymentId הוא string לפי הסכמה
    const payment = await this.prisma.payment.update({
      where: { id: paymentId },
      data: {
        status: PaymentStatus.CAPTURED,
        paypalOrderId,
        paypalCaptureId,
      },
    });

    // ✅ אצלך יש relation group, אז אפשר לכלול אותו
    const group = await this.prisma.group.findUnique({
      where: { id: payment.groupId },
      include: { members: true, payments: true },
    });

    if (!group) return { success: true };

    const paidUsers = new Set(
      group.payments
        .filter(p => p.status === PaymentStatus.CAPTURED)
        .map(p => p.userId),
    );

    // אם כולם שילמו -> group.status = "paid"
    if (paidUsers.size === group.members.length) {
      await this.prisma.group.update({
        where: { id: group.id },
        data: { status: 'paid', paidAt: new Date() },
      });
    }

    return { success: true };
  }

  async markPaymentCanceled(paymentId: string) {
    return this.prisma.payment.update({
      where: { id: paymentId },
      data: { status: PaymentStatus.CANCELED },
    });
  }

  async markPaymentFailed(paymentId: string) {
    return this.prisma.payment.update({
      where: { id: paymentId },
      data: { status: PaymentStatus.FAILED },
    });
  }
}
