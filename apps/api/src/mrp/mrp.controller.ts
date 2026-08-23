import { Controller, Get, Post, Body, Param, UseGuards } from '@nestjs/common';
import { MrpService } from './mrp.service';
import { CreateSalesOrderDto } from './dto/create-sales-order.dto';
import { RunMrpDto } from './dto/run-mrp.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import type { JwtPayload } from '../auth/strategies/jwt.strategy';
import { ExecuteOrderDto } from './dto/execute-order.dto';

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

  @Post('runs/:id/apply')
  applyRun(@Param('id') id: string, @CurrentUser() user: JwtPayload) {
    return this.mrpService.applyRun(user.tenantId, id);
  }

  @Post('runs/:id/cancel')
  cancelRun(@Param('id') id: string, @CurrentUser() user: JwtPayload) {
    return this.mrpService.cancelRun(user.tenantId, id);
  }

    @Post('purchase-orders/:id/release')
  releasePurchaseOrder(@Param('id') id: string, @CurrentUser() user: JwtPayload) {
    return this.mrpService.releasePurchaseOrder(user.tenantId, id);
  }

  @Post('production-orders/:id/release')
  releaseProductionOrder(@Param('id') id: string, @CurrentUser() user: JwtPayload) {
    return this.mrpService.releaseProductionOrder(user.tenantId, id);
  }

  @Post('purchase-orders/:id/receive')
  receivePurchaseOrder(
    @Param('id') id: string,
    @Body() dto: ExecuteOrderDto,
    @CurrentUser() user: JwtPayload,
  ) {
    return this.mrpService.receivePurchaseOrder(user.tenantId, id, dto);
  }

  @Post('production-orders/:id/complete')
  completeProductionOrder(
    @Param('id') id: string,
    @Body() dto: ExecuteOrderDto,
    @CurrentUser() user: JwtPayload,
  ) {
    return this.mrpService.completeProductionOrder(user.tenantId, id, dto);
  }

    @Get('history/:productId')
    monthlyHistory(@Param('productId') productId: string, @CurrentUser() user: JwtPayload) {
    return this.mrpService.monthlyHistory(user.tenantId, productId);
  }
}