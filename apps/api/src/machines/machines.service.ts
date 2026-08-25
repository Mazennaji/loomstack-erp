import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateMachineDto } from './dto/create-machine.dto';
import { LogUsageDto } from './dto/log-usage.dto';
import { LogMaintenanceDto } from './dto/log-maintenance.dto';

@Injectable()
export class MachinesService {
  constructor(private prisma: PrismaService) {}

  create(tenantId: string, dto: CreateMachineDto) {
    return this.prisma.machine.create({
      data: {
        tenantId,
        name: dto.name,
        code: dto.code,
        maintenanceIntervalHours: dto.maintenanceIntervalHours ?? 500,
      },
    });
  }

  findAll(tenantId: string) {
    return this.prisma.machine.findMany({
      where: { tenantId },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(tenantId: string, id: string) {
    const machine = await this.prisma.machine.findFirst({
      where: { id, tenantId },
      include: {
        usageLogs: { orderBy: { date: 'asc' } },
        maintenanceEvents: { orderBy: { date: 'desc' } },
      },
    });
    if (!machine) throw new NotFoundException('Machine not found');
    return machine;
  }

  async logUsage(tenantId: string, dto: LogUsageDto) {
    await this.assertMachine(tenantId, dto.machineId);
    return this.prisma.machineUsage.create({
      data: {
        tenantId,
        machineId: dto.machineId,
        date: new Date(dto.date),
        hoursRun: dto.hoursRun,
        cycles: dto.cycles,
      },
    });
  }

  async logMaintenance(tenantId: string, dto: LogMaintenanceDto) {
    await this.assertMachine(tenantId, dto.machineId);
    return this.prisma.maintenanceEvent.create({
      data: {
        tenantId,
        machineId: dto.machineId,
        type: dto.type,
        date: new Date(dto.date),
        hoursAtService: dto.hoursAtService,
        notes: dto.notes,
      },
    });
  }

  private async assertMachine(tenantId: string, machineId: string) {
    const m = await this.prisma.machine.findFirst({ where: { id: machineId, tenantId } });
    if (!m) throw new NotFoundException('Machine not found for this tenant');
  }
}