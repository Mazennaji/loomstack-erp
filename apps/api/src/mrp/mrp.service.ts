import { Injectable, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateSalesOrderDto } from './dto/create-sales-order.dto';
import { RunMrpDto } from './dto/run-mrp.dto';

interface Suggestion {
  productId: string;
  type: 'PURCHASE' | 'PRODUCTION';
  quantity: number;
  dueDate: Date;
}

@Injectable()
export class MrpService {
  constructor(private prisma: PrismaService) {}

  createSalesOrder(tenantId: string, dto: CreateSalesOrderDto) {
    return this.prisma.salesOrder.create({
      data: {
        tenantId,
        customerName: dto.customerName,
        lines: {
          create: dto.lines.map((l) => ({
            productId: l.productId,
            quantity: l.quantity,
            dueDate: new Date(l.dueDate),
          })),
        },
      },
      include: { lines: true },
    });
  }

  async runMrp(tenantId: string) {
    const openLines = await this.prisma.salesOrderLine.findMany({
      where: { salesOrder: { tenantId, status: 'OPEN' } },
      include: { product: true },
    });

    if (openLines.length === 0) {
      throw new BadRequestException('No open sales order demand to plan against');
    }

    const suggestions: Suggestion[] = [];

    for (const line of openLines) {
      await this.explode(
        tenantId,
        line.productId,
        line.quantity,
        line.dueDate,
        suggestions,
        new Set(),
      );
    }

    return this.persistRun(tenantId, this.mergeSuggestions(suggestions));
  }

  async runManual(tenantId: string, dto: RunMrpDto) {
    const suggestions: Suggestion[] = [];
    const dueDate = new Date();

    for (const line of dto.demand) {
      const product = await this.prisma.product.findFirst({
        where: { id: line.productId, tenantId },
      });
      if (!product) {
        throw new BadRequestException(
          `Demand product ${line.productId} not found for this tenant`,
        );
      }
      await this.explode(
        tenantId,
        line.productId,
        line.quantity,
        dueDate,
        suggestions,
        new Set(),
      );
    }

    return this.persistRun(tenantId, this.mergeSuggestions(suggestions));
  }

  private persistRun(tenantId: string, merged: Suggestion[]) {
    return this.prisma.mrpRun.create({
      data: {
        tenantId,
        status: 'DRAFT',
        suggestions: {
          create: merged.map((s) => ({
            tenantId,
            productId: s.productId,
            type: s.type,
            quantity: s.quantity,
            dueDate: s.dueDate,
          })),
        },
      },
      include: { suggestions: { include: { product: true } } },
    });
  }

  private async explode(
    tenantId: string,
    productId: string,
    grossQty: number,
    dueDate: Date,
    suggestions: Suggestion[],
    ancestry: Set<string>,
  ) {
    if (ancestry.has(productId)) {
      throw new BadRequestException('Circular BOM detected during MRP explosion');
    }
    const nextAncestry = new Set(ancestry).add(productId);

    const product = await this.prisma.product.findUniqueOrThrow({
      where: { id: productId },
      include: { stockItems: true },
    });

    const available = product.stockItems.reduce(
      (sum, s) => sum + (s.quantity - s.reserved),
      0,
    );

    const netRequirement = Math.max(0, grossQty + product.safetyStock - available);
    if (netRequirement === 0) return;

    const scheduledDate = this.subtractDays(dueDate, product.leadTimeDays);

    const activeVersion = await this.prisma.bomVersion.findFirst({
      where: { productId, isActive: true },
      include: { lines: true },
    });

    if (activeVersion && activeVersion.lines.length > 0) {
      suggestions.push({
        productId,
        type: 'PRODUCTION',
        quantity: netRequirement,
        dueDate: scheduledDate,
      });

      for (const bomLine of activeVersion.lines) {
        const childGrossQty = Number(bomLine.quantity) * netRequirement;
        await this.explode(
          tenantId,
          bomLine.componentProductId,
          childGrossQty,
          scheduledDate,
          suggestions,
          nextAncestry,
        );
      }
    } else {
      suggestions.push({
        productId,
        type: 'PURCHASE',
        quantity: netRequirement,
        dueDate: scheduledDate,
      });
    }
  }

  private subtractDays(date: Date, days: number): Date {
    const result = new Date(date);
    result.setDate(result.getDate() - days);
    return result;
  }

  private mergeSuggestions(suggestions: Suggestion[]): Suggestion[] {
    const map = new Map<string, Suggestion>();

    for (const s of suggestions) {
      const key = `${s.productId}:${s.type}:${s.dueDate.toISOString().slice(0, 10)}`;
      const existing = map.get(key);
      if (existing) {
        existing.quantity += s.quantity;
      } else {
        map.set(key, { ...s });
      }
    }

    return Array.from(map.values());
  }

  async getRun(tenantId: string, runId: string) {
    return this.prisma.mrpRun.findFirst({
      where: { id: runId, tenantId },
      include: { suggestions: { include: { product: true } } },
    });
  }

  async listRuns(tenantId: string) {
    return this.prisma.mrpRun.findMany({
      where: { tenantId },
      orderBy: { runAt: 'desc' },
    });
  }
}