import {
  Controller,
  Get,
  Post,
  Param,
  Req,
  UseGuards,
  BadRequestException,
} from '@nestjs/common';
import { GroupsService } from './groups.service';
import { JwtAuthGuard } from '../auth/jwt.guard';

@Controller('groups')
export class GroupsController {
  constructor(private readonly groupsService: GroupsService) {}

  // ⭐ קבוצות פתוחות לדף הבית
  @Get('featured')
  findFeatured() {
    return this.groupsService.findFeatured();
  }

  // ⭐ קבוצות לפי מוצר (ציבורי)
  @Get('product/:productId')
  getByProduct(@Param('productId') productId: string) {
    const id = Number(productId);
    if (isNaN(id)) {
      throw new BadRequestException('Product ID must be a number');
    }
    return this.groupsService.findByProduct(id);
  }

  // ⭐ הקבוצות שלי
  @UseGuards(JwtAuthGuard)
  @Get('my')
  getMyGroups(@Req() req: any) {
    return this.groupsService.findMyGroups(req.user.userId);
  }

  // ⭐ פתיחת קבוצה חדשה (מחייב התחברות)
  @UseGuards(JwtAuthGuard)
  @Post('create/:productId')
  createGroup(
    @Param('productId') productId: string,
    @Req() req: any,
  ) {
    const id = Number(productId);
    if (isNaN(id)) {
      throw new BadRequestException('Product ID must be a number');
    }
    return this.groupsService.createGroup(id, req.user.userId);
  }

  // ⭐ הצטרפות לקבוצה
  @UseGuards(JwtAuthGuard)
  @Post(':id/join')
  joinGroup(@Param('id') id: string, @Req() req: any) {
    const groupId = Number(id);
    if (isNaN(groupId)) {
      throw new BadRequestException('Group ID must be a number');
    }
    return this.groupsService.joinGroup(groupId, req.user.userId);
  }

  // ⭐ קבוצה אחת – ציבורי
  @Get(':id')
  getOne(@Param('id') id: string) {
    const groupId = Number(id);
    if (isNaN(groupId)) {
      throw new BadRequestException('Group ID must be a number');
    }
    return this.groupsService.findOnePublic(groupId);
  }

  // ⭐ ביטול קבוצה
  @UseGuards(JwtAuthGuard)
  @Post(':id/cancel')
  cancel(@Param('id') id: string) {
    const groupId = Number(id);
    if (isNaN(groupId)) {
      throw new BadRequestException('Group ID must be a number');
    }
    return this.groupsService.cancelGroup(groupId);
  }
}
