import {
  Controller,
  Post,
  Body,
  Req,
  UseGuards,
  BadRequestException,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { PaymentsService } from './payments.service';
import { PaypalService } from './paypal.service';

@Controller('payments/paypal')
export class PaymentsController {
  constructor(
    private readonly paymentsService: PaymentsService,
    private readonly paypalService: PaypalService,
  ) {}

  /**
   * 1️⃣ יצירת Payment פנימי + יצירת Order ב-PayPal
   */
  @Post('create')
  @UseGuards(AuthGuard('jwt'))
  async create(@Req() req: any, @Body() body: { groupId: number | string }) {
    const userId: string = req.user.userId;

    // 🔥 תיקון קריטי: groupId מגיע כ-string מה-Frontend
    const groupId = Number(body.groupId);
    if (Number.isNaN(groupId)) {
      throw new BadRequestException('Invalid groupId');
    }

    // סכום בדיקה (₪1)
    const amountIls = 1;

    // יצירת תשלום פנימי (CREATED)
    const payment = await this.paymentsService.createPendingPayment(
      userId,
      groupId,
      amountIls,
    );

    // יצירת Order ב-PayPal
    const order = await this.paypalService.createOrder(
      amountIls,
      payment.id,
    );

    // קישור לאישור התשלום
    const approval = order?.links?.find(
      (l: any) => l.rel === 'approve',
    );

    return {
      paymentId: payment.id,
      approvalUrl: approval?.href,
      paypalOrderId: order?.id,
    };
  }

  /**
   * 2️⃣ Capture – נקרא מה-Frontend אחרי חזרה מ-PayPal
   */
  @Post('capture')
  @UseGuards(AuthGuard('jwt'))
  async captureFromClient(
    @Body() body: { orderId: string; paymentId: string },
  ) {
    if (!body.orderId || !body.paymentId) {
      throw new BadRequestException('Missing orderId or paymentId');
    }

    // Capture מול PayPal
    const capture = await this.paypalService.captureOrder(body.orderId);

    const captureId =
      capture?.purchase_units?.[0]?.payments?.captures?.[0]?.id ?? null;

    // עדכון DB
    await this.paymentsService.markPaymentCaptured(
      body.paymentId,
      body.orderId,
      captureId,
    );

    return { success: true };
  }
}
