import { Controller, Get, Post, Body, UseGuards } from '@nestjs/common';
import { StockService } from './stock.service';
import { AdjustStockDto } from './dto/adjust-stock.dto';
import { ReserveStockDto } from './dto/reserve-stock.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import type { JwtPayload } from '../auth/strategies/jwt.strategy';

@UseGuards(JwtAuthGuard)
@Controller('stock')
export class StockController {
  constructor(private readonly stockService: StockService) {}

  @Get()
  getLevels(@CurrentUser() user: JwtPayload) {
    return this.stockService.getLevels(user.tenantId);
  }

  @Post('adjust')
  adjust(@Body() dto: AdjustStockDto, @CurrentUser() user: JwtPayload) {
    return this.stockService.adjustStock(user.tenantId, dto);
  }

  @Post('reserve')
  reserve(@Body() dto: ReserveStockDto, @CurrentUser() user: JwtPayload) {
    return this.stockService.reserveStock(user.tenantId, dto);
  }

  @Post('release')
  release(@Body() dto: ReserveStockDto, @CurrentUser() user: JwtPayload) {
    return this.stockService.releaseReservation(user.tenantId, dto);
  }
}