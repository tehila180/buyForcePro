import {
  Controller,
  Get,
  Post,
  Param,
  Req,
  UseGuards,
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

  // ⭐ הקבוצות שלי (מחייב התחברות)
  @UseGuards(JwtAuthGuard)
  @Get('my')
  getMyGroups(@Req() req: any) {
    return this.groupsService.findMyGroups(req.user.userId);
  }

  // ⭐ הצטרפות לקבוצה (מחייב התחברות)
  @UseGuards(JwtAuthGuard)
  @Post(':id/join')
  joinGroup(@Param('id') id: string, @Req() req: any) {
    return this.groupsService.joinGroup(Number(id), req.user.userId);
  }

  // ⭐ קבוצה אחת – ציבורי ❗
  @Get(':id')
  getOne(@Param('id') id: string) {
    return this.groupsService.findOnePublic(Number(id));
  }

  // ⭐ ביטול קבוצה (Admin / מחייב התחברות)
  @UseGuards(JwtAuthGuard)
  @Post(':id/cancel')
  cancel(@Param('id') id: string) {
    return this.groupsService.cancelGroup(Number(id));
  }
}
