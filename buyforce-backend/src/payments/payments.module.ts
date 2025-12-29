import { Module } from '@nestjs/common';
import { PaymentsController } from './payments.controller';
import { PaymentsService } from './payments.service';
import { PrismaService } from '../prisma/prisma.service';
import { PaypalService } from './paypal.service';

@Module({
  controllers: [PaymentsController], // ✅ רק זה
  providers: [PaymentsService, PaypalService, PrismaService],
})
export class PaymentsModule {}
