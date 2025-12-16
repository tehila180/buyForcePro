import { Module } from '@nestjs/common';
import { ProductsService } from './products.service';
import { ProductsController } from './products.controller';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [PrismaModule],        // חובה כדי להשתמש ב-PrismaService
  controllers: [ProductsController],
  providers: [ProductsService],
})
export class ProductsModule {}
