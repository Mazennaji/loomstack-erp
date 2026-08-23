import { Controller, Get, Post, Body, Param, UseGuards } from '@nestjs/common';
import { MrpService } from './mrp.service';
import { CreateSalesOrderDto } from './dto/create-sales-order.dto';
import { RunMrpDto } from './dto/run-mrp.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { JwtPayload } from '../auth/strategies/jwt.strategy';

@UseGuards(JwtAuthGuard)
@Controller('mrp')
export class MrpController {
  constructor(private readonly mrpService: MrpService) {}

  @Post('sales-orders')
  createSalesOrder(@Body() dto: CreateSalesOrderDto, @CurrentUser() user: JwtPayload) {
    return this.mrpService.createSalesOrder(user.tenantId, dto);
  }

  @Post('run')
  run(@CurrentUser() user: JwtPayload) {
    return this.mrpService.runMrp(user.tenantId);
  }

  @Post('run-manual')
  runManual(@Body() dto: RunMrpDto, @CurrentUser() user: JwtPayload) {
    return this.mrpService.runManual(user.tenantId, dto);
  }

  @Get('runs')
  listRuns(@CurrentUser() user: JwtPayload) {
    return this.mrpService.listRuns(user.tenantId);
  }

  @Get('runs/:id')
  getRun(@Param('id') id: string, @CurrentUser() user: JwtPayload) {
    return this.mrpService.getRun(user.tenantId, id);
  }
}