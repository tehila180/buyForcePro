import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import { GroupsService } from './groups.service';
import { JwtAuthGuard } from '../auth/jwt.guard';

@Controller('groups')
export class GroupsController {
  constructor(private readonly groupsService: GroupsService) {}

  // PUBLIC
  @Get('featured')
  findFeatured() {
    return this.groupsService.findFeatured();
  }

  // PUBLIC
  @Get('product/:productId')
  getGroupsForProduct(@Param('productId') productId: string) {
    return this.groupsService.findOpenForProduct(Number(productId));
  }

  // LOGIN
  @UseGuards(JwtAuthGuard)
  @Get('my')
  getMyGroups(@Req() req: any) {
    return this.groupsService.findMyGroups(req.user.userId);
  }

  // LOGIN
  @UseGuards(JwtAuthGuard)
  @Post()
  createGroup(@Body('productId') productId: number, @Req() req: any) {
    return this.groupsService.createGroup(
      Number(productId),
      req.user.userId,
    );
  }

  // LOGIN
  @UseGuards(JwtAuthGuard)
  @Post(':id/join')
  joinGroup(@Param('id') id: string, @Req() req: any) {
    return this.groupsService.joinGroup(
      Number(id),
      req.user.userId,
    );
  }

  // LOGIN
  @UseGuards(JwtAuthGuard)
  @Get(':id')
  getOne(@Param('id') id: string) {
    return this.groupsService.findOne(Number(id));
  }
}
