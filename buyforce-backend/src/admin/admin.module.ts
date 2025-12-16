// src/admin/admin.module.ts
import { Module } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

import { AdminController } from './admin.controller';
import { AdminService } from './admin.service';

import { AdminProductsController } from './admin-products.controller';
import { AdminProductsService } from './admin-products.service';

import { AdminCategoriesController } from './categories.controller';
import { AdminCategoriesService } from './categories.service';

import { AdminGroupsController } from './admin-groups.controller'; // ✅ זה היה חסר
import {  AdminUsersController} from './admin-users.controller'

@Module({
  controllers: [
    AdminController,
    AdminProductsController,
    AdminCategoriesController,
    AdminGroupsController,
      AdminUsersController,
  ],
  providers: [
    PrismaService,
    AdminService,
    AdminProductsService,
    AdminCategoriesService,
  ],
})
export class AdminModule {}
