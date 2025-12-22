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

  @Get('featured')
  findFeatured() {
    return this.groupsService.findFeatured();
  }

  @UseGuards(JwtAuthGuard)
  @Get('my')
  getMyGroups(@Req() req: any) {
    return this.groupsService.findMyGroups(req.user.userId);
  }

  @UseGuards(JwtAuthGuard)
  @Post(':id/join')
  joinGroup(@Param('id') id: string, @Req() req: any) {
    const groupId = Number(id);
    if (isNaN(groupId)) {
      throw new BadRequestException('Group ID must be a number');
    }
    return this.groupsService.joinGroup(groupId, req.user.userId);
  }

  // ⭐ ציבורי ומוגן משגיאות
  @Get(':id')
  getOne(@Param('id') id: string) {
    const groupId = Number(id);
    if (isNaN(groupId)) {
      throw new BadRequestException('Group ID must be a number');
    }
    return this.groupsService.findOnePublic(groupId);
  }

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
