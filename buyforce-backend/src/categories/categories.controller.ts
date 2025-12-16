import { Controller, Get, Param } from '@nestjs/common';
import { CategoriesService } from './categories.service';

@Controller('categories')
export class CategoriesController {
  constructor(private readonly categoriesService: CategoriesService) {}

  @Get()
  getAll() {
    return this.categoriesService.findAll();
  }

  @Get(':slug')
  getOne(@Param('slug') slug: string) {
    return this.categoriesService.findBySlug(slug);
  }

  // ✅ זה החסר
  @Get(':slug/products')
  getProductsByCategory(@Param('slug') slug: string) {
    return this.categoriesService.findProductsByCategory(slug);
  }
}
