import {
  Controller,
  Post,
  Body,
  Req,
  UseGuards,
  Get,
  Query,
  Res,
  BadRequestException,
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

  // 1️⃣ יצירת תשלום + Order ב-PayPal
  @Post('create')
  @UseGuards(AuthGuard('jwt'))
  async create(@Req() req: any, @Body() body: { groupId: number | string }) {
    const userId: string = req.user.userId;

    const groupId = Number(body.groupId);
    if (Number.isNaN(groupId)) {
      throw new BadRequestException('Invalid groupId');
    }

    const amountIls = 1;

    const payment = await this.paymentsService.createPendingPayment(
      userId,
      groupId,
      amountIls,
    );

    const order = await this.paypalService.createOrder(amountIls, payment.id);

    const approval = order.links.find((l: any) => l.rel === 'approve');

    return {
      approvalUrl: approval.href,
    };
  }

  // 2️⃣ PayPal חוזר לשרת → CAPTURE → redirect ל-Frontend
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

      await this.paymentsService.markPaymentCaptured(
        paymentId,
        orderId,
        captureId,
      );

      return res.redirect(
        `${process.env.FRONTEND_URL || 'http://localhost:8081'}/payment/success`,
      );
    } catch {
      return res.redirect(
        `${process.env.FRONTEND_URL || 'http://localhost:8081'}/payment/fail`,
      );
    }
  }

  // 3️⃣ ביטול
  @Get('cancel')
  async cancel(@Res() res: Response) {
    return res.redirect(
      `${process.env.FRONTEND_URL || 'http://localhost:8081'}/payment/cancel`,
    );
  }
}
