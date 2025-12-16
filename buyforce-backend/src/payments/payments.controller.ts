import {
  Controller, Post, Body, Req, UseGuards, Get, Query, Res
} from '@nestjs/common';
import type { Response } from 'express';
import { JwtAuthGuard } from '../auth/jwt.guard';
import { PaymentsService } from './payments.service';

@Controller('payments/paypal')
export class PaymentsController {
  constructor(private service: PaymentsService) {}

  @UseGuards(JwtAuthGuard)
  @Post('create')
  create(@Body('groupId') groupId: number, @Req() req: any) {
    return this.service.createOrder(groupId, req.user.userId);
  }

  @Get('capture')
  async capture(
    @Query('token') token: string,
    @Query('paymentId') paymentId: string,
    @Res() res: Response,
  ) {
    const result = await this.service.capture(token, Number(paymentId));
    const frontend = process.env.FRONTEND_URL || 'http://localhost:3000';

    return res.redirect(
      `${frontend}/payment/success?groupId=${result.groupId}`,
    );
  }
}


