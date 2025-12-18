// src/payments/payments.service.ts
import { Injectable, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { getPayPalClient } from './paypal.client';
import * as paypal from '@paypal/checkout-server-sdk';

@Injectable()
export class PaymentsService {
  constructor(private prisma: PrismaService) {}

  async createPayPalOrder(userId: string, groupId: number) {
    const group = await this.prisma.group.findUnique({
      where: { id: groupId },
      include: {
        product: true,
        members: true,
        payments: true,
      },
    });

    if (!group) throw new BadRequestException('Group not found');
    if (group.status !== 'open') throw new BadRequestException('Group is not open');

    // חייב להיות חבר בקבוצה כדי לשלם
    const isMember = group.members.some((m) => m.userId === userId);
    if (!isMember) throw new BadRequestException('You must join the group before paying');

    // אם כבר שילם – לא ליצור עוד תשלום
    const alreadyPaid = group.payments.some(
      (p) => p.userId === userId && p.status === 'CAPTURED',
    );
    if (alreadyPaid) throw new BadRequestException('User already paid');

    const amount = group.product.priceGroup; // אצלך זה באגורות/סנטים

    // 1) create payment row (CREATED)
    const payment = await this.prisma.payment.create({
      data: {
        provider: 'PAYPAL',
        userId,
        groupId,
        amount,
        currency: 'ILS',
        status: 'CREATED',
      },
    });

    // 2) create PayPal order
    const client = getPayPalClient();
    const request = new paypal.orders.OrdersCreateRequest();
    request.prefer('return=representation');
    request.requestBody({
      intent: 'CAPTURE',
      purchase_units: [
        {
          reference_id: payment.id, // עוזר לזהות
          amount: {
            currency_code: 'ILS',
            value: (amount / 100).toFixed(2),
          },
        },
      ],
    });

    const response = await client.execute(request);

    // 3) save orderId
    await this.prisma.payment.update({
      where: { id: payment.id },
      data: { paypalOrderId: response.result.id },
    });

    return { id: response.result.id }; // <-- זה מה שה-frontend צריך ל-PayPalButtons
  }

  async capturePayPalOrder(userId: string, orderId: string) {
    const payment = await this.prisma.payment.findUnique({
      where: { paypalOrderId: orderId },
    });

    if (!payment) throw new BadRequestException('Payment not found');
    if (payment.userId !== userId) throw new BadRequestException('Not your payment');

    const client = getPayPalClient();
    const request = new paypal.orders.OrdersCaptureRequest(orderId);
    request.requestBody({});

    const response = await client.execute(request);

    await this.prisma.payment.update({
      where: { id: payment.id },
      data: {
        status: 'CAPTURED',
        paypalCaptureId: response.result?.id ?? null,
      },
    });

    await this.checkAndCloseGroup(payment.groupId);

    return response.result;
  }

  private async checkAndCloseGroup(groupId: number) {
    const group = await this.prisma.group.findUnique({
      where: { id: groupId },
      include: { members: true, payments: true },
    });
    if (!group) return;

    // ✅ לא סוגרים קבוצה לפני שמלאה (target)
    if (group.members.length < group.target) return;

    const paidUserIds = new Set(
      group.payments
        .filter((p) => p.status === 'CAPTURED')
        .map((p) => p.userId),
    );

    // ✅ כולם שילמו (כל מי שחבר בקבוצה)
    if (paidUserIds.size === group.members.length) {
      await this.prisma.group.update({
        where: { id: group.id },
        data: { status: 'paid', paidAt: new Date() },
      });
    }
  }
}
