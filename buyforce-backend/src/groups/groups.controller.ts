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
import { OptionalJwtAuthGuard } from '../auth/optional-jwt.guard';

@Controller('groups')
export class GroupsController {
  constructor(private readonly groupsService: GroupsService) {}

  @Get('featured')
  findFeatured() {
    return this.groupsService.findFeatured();
  }

  @Get('product/:productId')
  getByProduct(@Param('productId') productId: string) {
    const id = Number(productId);
    if (isNaN(id)) throw new BadRequestException('Product ID must be a number');
    return this.groupsService.findByProduct(id);
  }

  @UseGuards(JwtAuthGuard)
  @Get('my')
  getMyGroups(@Req() req: any) {
    return this.groupsService.findMyGroups(req.user.userId);
  }

  @UseGuards(JwtAuthGuard)
  @Post('create/:productId')
  createGroup(@Param('productId') productId: string, @Req() req: any) {
    const id = Number(productId);
    if (isNaN(id)) throw new BadRequestException('Product ID must be a number');
    return this.groupsService.createGroup(id, req.user.userId);
  }

  @UseGuards(JwtAuthGuard)
  @Post(':id/join')
  joinGroup(@Param('id') id: string, @Req() req: any) {
    const groupId = Number(id);
    if (isNaN(groupId)) throw new BadRequestException('Group ID must be a number');
    return this.groupsService.joinGroup(groupId, req.user.userId);
  }

  // ציבורי + אם יש טוקן אז נקבל גם userId ונחשב isMember/isMe
  @UseGuards(OptionalJwtAuthGuard)
  @Get(':id')
  getOne(@Param('id') id: string, @Req() req: any) {
    const groupId = Number(id);
    if (isNaN(groupId)) throw new BadRequestException('Group ID must be a number');

    const userId = req.user?.userId ?? null;
    return this.groupsService.findOnePublic(groupId, userId);
  }
}
