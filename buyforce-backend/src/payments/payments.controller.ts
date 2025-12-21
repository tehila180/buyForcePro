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

  // 💳 תשלום סופי לקבוצה
  @Post('confirm')
  async confirmPayment(
    @Req() req: any,
    @Body() body: { groupId: number; paypalOrderId: string },
  ) {
    return this.paymentsService.confirmPayment(
      req.user.userId,
      body.groupId,
      body.paypalOrderId,
    );
  }

  // 💳 תשלום ₪1 לצורך הצטרפות
  @Post('join')
  async confirmJoinPayment(
    @Req() req: any,
    @Body() body: { groupId: number; paypalOrderId: string },
  ) {
    return this.paymentsService.confirmJoinPayment(
      req.user.userId,
      body.groupId,
      body.paypalOrderId,
    );
  }
}
