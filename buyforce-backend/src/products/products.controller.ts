import { Controller, Get, Param } from '@nestjs/common';
import { ProductsService } from './products.service';

@Controller('products')
export class ProductsController {
  constructor(private readonly productsService: ProductsService) {}

  // ✅ GET /products
  @Get()
  getAll() {
    return this.productsService.findAll();
  }

  // ✅ GET /products/:slug
  @Get(':slug')
  getOne(@Param('slug') slug: string) {
    return this.productsService.findBySlug(slug);
  }

  // ✅ NEW ✅ GET /products/by-category/:categorySlug
  @Get('by-category/:categorySlug')
  getByCategory(@Param('categorySlug') categorySlug: string) {
    return this.productsService.findByCategory(categorySlug);
  }
}
