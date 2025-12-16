// src/admin/admin-products.service.ts
import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class AdminProductsService {
  constructor(private prisma: PrismaService) {}

  getAll() {
    return this.prisma.product.findMany({
      include: { category: true },
    });
  }

  getOne(id: number) {
    return this.prisma.product.findUnique({
      where: { id },
      include: { category: true },
    });
  }

  async create(dto: any) {
    const slug =
      dto.slug ||
      dto.name
        ?.toString()
        .trim()
        .toLowerCase()
        .replace(/\s+/g, '-');

    return this.prisma.product.create({
      data: {
        name: dto.name,
        slug,
        priceRegular: Number(dto.priceRegular),
        priceGroup: Number(dto.priceGroup),
        categoryId: Number(dto.categoryId),
      },
    });
  }

  async update(id: number, dto: any) {
    const data: any = {
      name: dto.name,
      priceRegular: Number(dto.priceRegular),
      priceGroup: Number(dto.priceGroup),
      categoryId: Number(dto.categoryId),
    };

    // אם שלחו slug, נעדכן אותו, אם לא – נשאיר כרגיל
    if (dto.slug) {
      data.slug = dto.slug;
    }

    const exists = await this.prisma.product.findUnique({ where: { id } });
    if (!exists) throw new NotFoundException('המוצר לא נמצא');

    return this.prisma.product.update({
      where: { id },
      data,
    });
  }

  delete(id: number) {
    return this.prisma.product.delete({
      where: { id },
    });
  }
}
