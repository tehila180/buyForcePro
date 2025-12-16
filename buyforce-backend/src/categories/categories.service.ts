import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class CategoriesService {
  constructor(private prisma: PrismaService) {}

  async findAll() {
    return this.prisma.category.findMany();
  }

  async findBySlug(slug: string) {
    return this.prisma.category.findUnique({
      where: { slug },
    });
  }

  // ✅ זה החלק הקריטי
  async findProductsByCategory(slug: string) {
    return this.prisma.product.findMany({
      where: {
        category: {
          slug,
        },
      },
      include: {
        category: true,
      },
    });
  }
}
