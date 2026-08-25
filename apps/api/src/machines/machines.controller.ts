import { Controller, Get, Post, Body, Param, UseGuards } from '@nestjs/common';
import { MachinesService } from './machines.service';
import { CreateMachineDto } from './dto/create-machine.dto';
import { LogUsageDto } from './dto/log-usage.dto';
import { LogMaintenanceDto } from './dto/log-maintenance.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import type { JwtPayload } from '../auth/strategies/jwt.strategy';

@UseGuards(JwtAuthGuard)
@Controller('machines')
export class MachinesController {
  constructor(private readonly machinesService: MachinesService) {}

  @Post()
  create(@Body() dto: CreateMachineDto, @CurrentUser() user: JwtPayload) {
    return this.machinesService.create(user.tenantId, dto);
  }

  @Get()
  findAll(@CurrentUser() user: JwtPayload) {
    return this.machinesService.findAll(user.tenantId);
  }

  @Get(':id')
  findOne(@Param('id') id: string, @CurrentUser() user: JwtPayload) {
    return this.machinesService.findOne(user.tenantId, id);
  }

  @Post('usage')
  logUsage(@Body() dto: LogUsageDto, @CurrentUser() user: JwtPayload) {
    return this.machinesService.logUsage(user.tenantId, dto);
  }

  @Post('maintenance')
  logMaintenance(@Body() dto: LogMaintenanceDto, @CurrentUser() user: JwtPayload) {
    return this.machinesService.logMaintenance(user.tenantId, dto);
  }
}