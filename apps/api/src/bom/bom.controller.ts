import { Controller, Get, Post, Body, Param, UseGuards } from '@nestjs/common';
import { BomService } from './bom.service';
import { CreateBomVersionDto } from './dto/create-bom-version.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { JwtPayload } from '../auth/strategies/jwt.strategy';

@UseGuards(JwtAuthGuard)
@Controller('bom')
export class BomController {
  constructor(private readonly bomService: BomService) {}

  @Post('versions')
  createVersion(@Body() dto: CreateBomVersionDto, @CurrentUser() user: JwtPayload) {
    return this.bomService.createVersion(user.tenantId, dto);
  }

  @Get(':productId/versions')
  getAllVersions(@Param('productId') productId: string, @CurrentUser() user: JwtPayload) {
    return this.bomService.getAllVersions(user.tenantId, productId);
  }

  @Get(':productId/cost-rollup')
  getCostRollup(@Param('productId') productId: string, @CurrentUser() user: JwtPayload) {
    return this.bomService.getActiveBomTree(user.tenantId, productId);
  }
}