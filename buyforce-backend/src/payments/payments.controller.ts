import {
  Controller,
  Post,
  Body,
  Req,
  UseGuards,
  Get,
  Query,
  Res,
} from '@nestjs/common';
import type { Response } from 'express';
import { AuthGuard } from '@nestjs/passport';
import { PaymentsService } from './payments.service';
import { PaypalService } from './paypal.service';

@Controller('payments/paypal')
export class PaymentsController {
  constructor(
    private readonly paymentsService: PaymentsService,
    private readonly paypalService: PaypalService,
  ) {}

  // 1) יצירת תשלום פנימי + יצירת Order בפייפל + החזרת approvalUrl
  @Post('create')
  @UseGuards(AuthGuard('jwt'))
  async create(@Req() req: any, @Body() body: { groupId: number }) {
    const userId: string = req.user.userId;

    // ✅ אצלך המחירים הם Int (שקלים/אגורות לפי מה שבחרת).
    // כאן אנחנו עושים דמי הצטרפות ₪1 -> amount = 1
    const amountIls = 1;

    const payment = await this.paymentsService.createPendingPayment(
      userId,
      body.groupId,
      amountIls,
    );

    // ✅ payment.id הוא string לפי הסכמה שלך
    const order = await this.paypalService.createOrder(amountIls, payment.id);

    const approval = order?.links?.find((l: any) => l.rel === 'approve');

    return {
      paymentId: payment.id,
      approvalUrl: approval?.href,
      paypalOrderId: order?.id,
    };
  }

  // 2) PayPal מחזיר לפה אחרי אישור (approve) כדי שנבצע CAPTURE
  // PayPal בד"כ שולח query בשם token (זה ה-orderId)
  @Get('capture')
  async capture(
    @Query('token') orderId: string,
    @Query('paymentId') paymentId: string,
    @Res() res: Response,
  ) {
    try {
      const capture = await this.paypalService.captureOrder(orderId);

      const captureId =
        capture?.purchase_units?.[0]?.payments?.captures?.[0]?.id ?? null;

      await this.paymentsService.markPaymentCaptured(paymentId, orderId, captureId);

      // ✅ את יכולה להחליף ל-deeplink למובייל בהמשך
      return res.redirect(
        `${process.env.FRONTEND_URL || 'http://localhost:3000'}/payment/success?paymentId=${paymentId}`,
      );
    } catch (e) {
      return res.redirect(
        `${process.env.FRONTEND_URL || 'http://localhost:3000'}/payment/success/fail?paymentId=${paymentId}`,
      );
    }
  }

  // 3) ביטול מצד PayPal (או Cancel)
  @Get('cancel')
  async cancel(@Query('paymentId') paymentId: string, @Res() res: Response) {
    try {
      await this.paymentsService.markPaymentCanceled(paymentId);
    } catch {}

    return res.redirect(
      `${process.env.FRONTEND_URL || 'http://localhost:3000'}/payment/cancel?paymentId=${paymentId}`,
    );
  }
}
