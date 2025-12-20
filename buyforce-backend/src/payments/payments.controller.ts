import {
  Controller,
  Post,
  Body,
  Req,
  UseGuards,
} from '@nestjs/common';
import { PaymentsService } from './payments.service';
import { AuthGuard } from '@nestjs/passport';

@Controller('payments/paypal')
@UseGuards(AuthGuard('jwt'))
export class PaymentsController {
  constructor(private readonly paymentsService: PaymentsService) {}

  // ⬅️ נקרא אחרי PayPal approve + capture בצד לקוח
  @Post('confirm')
  async confirmPayment(
    @Req() req: any,
    @Body()
    body: {
      groupId: number;
      paypalOrderId: string;
    },
  ) {
    return this.paymentsService.confirmPayment(
      req.user.id,
      body.groupId,
      body.paypalOrderId,
    );
  }
}
    