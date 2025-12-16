import { Injectable, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class AdminCategoriesService {
  constructor(private prisma: PrismaService) {}

  getAll() {
    return this.prisma.category.findMany({
      include: { products: true },
    });
  }

  create(data: { name: string; slug: string }) {
    return this.prisma.category.create({ data });
  }

  async delete(id: number) {
    const products = await this.prisma.product.count({
      where: { categoryId: id },
    });

    if (products > 0) {
      throw new BadRequestException('לא ניתן למחוק קטגוריה עם מוצרים');
    }

    return this.prisma.category.delete({ where: { id } });
  }

  update(id: number, data: any) {
    return this.prisma.category.update({
      where: { id },
      data,
    });
  }
}
