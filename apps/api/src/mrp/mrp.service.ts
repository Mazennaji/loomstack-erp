import { Injectable, BadRequestException, NotFoundException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateSalesOrderDto } from './dto/create-sales-order.dto';
import { RunMrpDto } from './dto/run-mrp.dto';
import { ExecuteOrderDto } from './dto/execute-order.dto';

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

  async applyRun(tenantId: string, runId: string) {
    const run = await this.prisma.mrpRun.findFirst({
      where: { id: runId, tenantId },
      include: { suggestions: true },
    });
    if (!run) throw new NotFoundException('MRP run not found for this tenant');

    if (run.status !== 'DRAFT') {
      throw new ConflictException(
        `Cannot apply a run with status ${run.status}; only DRAFT runs can be applied`,
      );
    }

    if (run.suggestions.length === 0) {
      throw new BadRequestException('Run has no suggestions to apply');
    }

    return this.prisma.$transaction(async (tx) => {
      for (const s of run.suggestions) {
        const orderData = {
          tenantId,
          productId: s.productId,
          quantity: s.quantity,
          dueDate: s.dueDate,
          mrpRunId: run.id,
        };

        if (s.type === 'PURCHASE') {
          await tx.purchaseOrder.create({ data: orderData });
        } else {
          await tx.productionOrder.create({ data: orderData });
        }
      }

      return tx.mrpRun.update({
        where: { id: run.id },
        data: { status: 'APPLIED' },
        include: {
          suggestions: { include: { product: true } },
          purchaseOrders: { include: { product: true } },
          productionOrders: { include: { product: true } },
        },
      });
    });
  }

  async cancelRun(tenantId: string, runId: string) {
    const run = await this.prisma.mrpRun.findFirst({
      where: { id: runId, tenantId },
    });
    if (!run) throw new NotFoundException('MRP run not found for this tenant');

    if (run.status !== 'APPLIED') {
      throw new ConflictException(
        `Cannot cancel a run with status ${run.status}; only APPLIED runs can be cancelled`,
      );
    }

    return this.prisma.$transaction(async (tx) => {
      await tx.purchaseOrder.deleteMany({ where: { mrpRunId: run.id, tenantId } });
      await tx.productionOrder.deleteMany({ where: { mrpRunId: run.id, tenantId } });

      return tx.mrpRun.update({
        where: { id: run.id },
        data: { status: 'DRAFT' },
        include: { suggestions: { include: { product: true } } },
      });
    });
  }

    async releasePurchaseOrder(tenantId: string, orderId: string) {
    return this.transitionOrder(tenantId, orderId, 'purchase', 'PLANNED', 'RELEASED');
  }

  async releaseProductionOrder(tenantId: string, orderId: string) {
    return this.transitionOrder(tenantId, orderId, 'production', 'PLANNED', 'RELEASED');
  }

  private async transitionOrder(
    tenantId: string,
    orderId: string,
    kind: 'purchase' | 'production',
    from: string,
    to: string,
  ) {
    const model = kind === 'purchase' ? this.prisma.purchaseOrder : this.prisma.productionOrder;

    const order = await (model as any).findFirst({ where: { id: orderId, tenantId } });
    if (!order) throw new NotFoundException(`${kind} order not found for this tenant`);

    if (order.status !== from) {
      throw new ConflictException(
        `Cannot move ${kind} order from ${order.status} to ${to}; expected ${from}`,
      );
    }

    return (model as any).update({ where: { id: orderId }, data: { status: to } });
  }

  async receivePurchaseOrder(tenantId: string, orderId: string, dto: ExecuteOrderDto) {
    const order = await this.prisma.purchaseOrder.findFirst({
      where: { id: orderId, tenantId },
    });
    if (!order) throw new NotFoundException('Purchase order not found for this tenant');

    if (order.status !== 'RELEASED') {
      throw new ConflictException(
        `Cannot receive a purchase order with status ${order.status}; release it first`,
      );
    }

    const warehouse = await this.prisma.warehouse.findFirst({
      where: { id: dto.warehouseId, tenantId },
    });
    if (!warehouse) throw new BadRequestException('Warehouse not found for this tenant');

    return this.prisma.$transaction(async (tx) => {
      await this.addStock(tx, order.productId, dto.warehouseId, order.quantity);

      return tx.purchaseOrder.update({
        where: { id: order.id },
        data: { status: 'COMPLETED' },
        include: { product: true },
      });
    });
  }

  async completeProductionOrder(tenantId: string, orderId: string, dto: ExecuteOrderDto) {
    const order = await this.prisma.productionOrder.findFirst({
      where: { id: orderId, tenantId },
    });
    if (!order) throw new NotFoundException('Production order not found for this tenant');

    if (order.status !== 'RELEASED') {
      throw new ConflictException(
        `Cannot complete a production order with status ${order.status}; release it first`,
      );
    }

    const warehouse = await this.prisma.warehouse.findFirst({
      where: { id: dto.warehouseId, tenantId },
    });
    if (!warehouse) throw new BadRequestException('Warehouse not found for this tenant');

    const activeVersion = await this.prisma.bomVersion.findFirst({
      where: { productId: order.productId, isActive: true },
      include: { lines: true },
    });
    if (!activeVersion || activeVersion.lines.length === 0) {
      throw new BadRequestException('Product has no active BOM to produce from');
    }

    const shortages: string[] = [];
    for (const line of activeVersion.lines) {
      const required = Number(line.quantity) * order.quantity;
      const item = await this.prisma.stockItem.findUnique({
        where: {
          productId_warehouseId: {
            productId: line.componentProductId,
            warehouseId: dto.warehouseId,
          },
        },
      });
      const available = item ? item.quantity - item.reserved : 0;
      if (available < required) {
        shortages.push(
          `component ${line.componentProductId}: need ${required}, have ${available}`,
        );
      }
    }

    if (shortages.length > 0) {
      throw new ConflictException(
        `Insufficient components in warehouse: ${shortages.join('; ')}`,
      );
    }

    return this.prisma.$transaction(async (tx) => {
      for (const line of activeVersion.lines) {
        const required = Number(line.quantity) * order.quantity;
        await this.deductStock(tx, line.componentProductId, dto.warehouseId, required);
      }

      await this.addStock(tx, order.productId, dto.warehouseId, order.quantity);

      return tx.productionOrder.update({
        where: { id: order.id },
        data: { status: 'COMPLETED' },
        include: { product: true },
      });
    });
  }

  private async addStock(tx: any, productId: string, warehouseId: string, qty: number) {
    await tx.stockItem.upsert({
      where: { productId_warehouseId: { productId, warehouseId } },
      create: { productId, warehouseId, quantity: qty, reserved: 0 },
      update: { quantity: { increment: qty } },
    });
  }

  private async deductStock(tx: any, productId: string, warehouseId: string, qty: number) {
    await tx.stockItem.update({
      where: { productId_warehouseId: { productId, warehouseId } },
      data: { quantity: { decrement: qty } },
    });
  }

    async monthlyHistory(tenantId: string, productId: string) {
    const product = await this.prisma.product.findFirst({
      where: { id: productId, tenantId },
    });
    if (!product) throw new NotFoundException('Product not found for this tenant');

    const lines = await this.prisma.salesOrderLine.findMany({
      where: { productId, salesOrder: { tenantId } },
      select: { quantity: true, dueDate: true },
      orderBy: { dueDate: 'asc' },
    });

    const buckets = new Map<string, number>();
    for (const l of lines) {
      const key = l.dueDate.toISOString().slice(0, 7);
      buckets.set(key, (buckets.get(key) ?? 0) + l.quantity);
    }

    return {
      productId,
      monthly: Array.from(buckets.values()),
      months: Array.from(buckets.keys()),
    };
  }
}