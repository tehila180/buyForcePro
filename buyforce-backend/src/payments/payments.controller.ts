import {
  Controller,
  Post,
  Body,
  Req,
  UseGuards,
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

  // 1️⃣ יצירת Payment פנימי + Order ב-PayPal
  @Post('create')
  @UseGuards(AuthGuard('jwt'))
  async create(@Req() req: any, @Body() body: { groupId: number }) {
    const userId: string = req.user.userId;

    const amountIls = 1;

    const payment = await this.paymentsService.createPendingPayment(
      userId,
      body.groupId,
      amountIls,
    );

    const order = await this.paypalService.createOrder(
      amountIls,
      payment.id,
    );

    const approval = order?.links?.find(
      (l: any) => l.rel === 'approve',
    );

    return {
      paymentId: payment.id,
      approvalUrl: approval?.href,
      paypalOrderId: order?.id,
    };
  }

  // 2️⃣ Capture – נקרא מה-Frontend אחרי חזרה מ-PayPal
  @Post('capture')
  @UseGuards(AuthGuard('jwt'))
  async captureFromClient(
    @Body() body: { orderId: string; paymentId: string },
  ) {
    const capture = await this.paypalService.captureOrder(body.orderId);

    const captureId =
      capture?.purchase_units?.[0]?.payments?.captures?.[0]?.id ?? null;

    await this.paymentsService.markPaymentCaptured(
      body.paymentId,
      body.orderId,
      captureId,
    );

    return { success: true };
  }
}
