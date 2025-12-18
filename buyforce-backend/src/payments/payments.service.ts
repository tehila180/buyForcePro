import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { getPayPalClient } from './paypal.client';
import * as paypal from '@paypal/checkout-server-sdk';

@Injectable()
export class PaymentsService {
  constructor(private prisma: PrismaService) {}

  async createPayPalOrder(userId: string, groupId: number) {
    const group = await this.prisma.group.findUnique({
      where: { id: groupId },
      include: { product: true },
    });

    if (!group) {
      throw new Error('Group not found');
    }

    const amount = group.product.priceGroup;

    const payment = await this.prisma.payment.create({
      data: {
        provider: 'PAYPAL',
        userId,
        groupId,
        amount,
        currency: 'ILS',
      },
    });

    const client = getPayPalClient();
    const request = new paypal.orders.OrdersCreateRequest();

    request.requestBody({
      intent: 'CAPTURE',
      purchase_units: [
        {
          amount: {
            currency_code: 'ILS',
            value: (amount / 100).toFixed(2),
          },
        },
      ],
    });

    const response = await client.execute(request);

    await this.prisma.payment.update({
      where: { id: payment.id },
      data: { paypalOrderId: response.result.id },
    });

    return response.result;
  }

  async capturePayPalOrder(orderId: string) {
    const payment = await this.prisma.payment.findUnique({
      where: { paypalOrderId: orderId },
    });

    if (!payment) {
      throw new Error('Payment not found');
    }

    const client = getPayPalClient();
    const request = new paypal.orders.OrdersCaptureRequest(orderId);
    const response = await client.execute(request);

    await this.prisma.payment.update({
      where: { id: payment.id },
      data: {
        status: 'CAPTURED',
        paypalCaptureId: response.result.id,
      },
    });

    await this.checkAndCloseGroup(payment.groupId);

    return response.result;
  }

  async checkAndCloseGroup(groupId: number) {
  const group = await this.prisma.group.findUnique({
    where: { id: groupId },
    include: {
      members: true,
      payments: true,
    },
  });

  if (!group) {
    throw new Error('Group not found');
  }

  // משתמשים ששילמו בפועל
  const paidUserIds = new Set(
    group.payments
      .filter(p => p.status === 'CAPTURED')
      .map(p => p.userId),
  );

  // בדיקה שכל חבר בקבוצה שילם
  const allPaid = group.members.every(member =>
    paidUserIds.has(member.userId),
  );

  if (allPaid) {
    await this.prisma.group.update({
      where: { id: group.id },
      data: {
        status: 'paid',
        paidAt: new Date(),
      },
    });
  }
}

}
