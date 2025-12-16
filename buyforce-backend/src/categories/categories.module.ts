import { Module } from '@nestjs/common';
import { CategoriesService } from './categories.service';
import { CategoriesController } from './categories.controller';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [PrismaModule],      // כאן אנו מספקים את PrismaService
  controllers: [CategoriesController],
  providers: [CategoriesService],
})
export class CategoriesModule {}
