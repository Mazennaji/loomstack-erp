import {
  Injectable,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { AdjustStockDto } from './dto/adjust-stock.dto';
import { ReserveStockDto } from './dto/reserve-stock.dto';

interface StockItemRow {
  id: string;
  quantity: number;
  reserved: number;
}

@Injectable()
export class StockService {
  constructor(private prisma: PrismaService) {}

  private async assertBelongsToTenant(
    productId: string,
    warehouseId: string,
    tenantId: string,
  ) {
    const [product, warehouse] = await Promise.all([
      this.prisma.product.findFirst({ where: { id: productId, tenantId } }),
      this.prisma.warehouse.findFirst({ where: { id: warehouseId, tenantId } }),
    ]);
    if (!product || !warehouse) {
      throw new NotFoundException('Product or warehouse not found for this tenant');
    }
  }

  async getLevels(tenantId: string) {
    return this.prisma.stockItem.findMany({
      where: { product: { tenantId } },
      include: { product: true, warehouse: true },
    });
  }

  async adjustStock(tenantId: string, dto: AdjustStockDto) {
    await this.assertBelongsToTenant(dto.productId, dto.warehouseId, tenantId);

    return this.prisma.$transaction(async (tx) => {
      const existing = await tx.stockItem.findUnique({
        where: {
          productId_warehouseId: {
            productId: dto.productId,
            warehouseId: dto.warehouseId,
          },
        },
      });

      if (!existing) {
        if (dto.quantityChange < 0) {
          throw new BadRequestException('Cannot remove stock that does not exist');
        }
        return tx.stockItem.create({
          data: {
            productId: dto.productId,
            warehouseId: dto.warehouseId,
            quantity: dto.quantityChange,
          },
        });
      }

      const newQuantity = existing.quantity + dto.quantityChange;
      if (newQuantity < existing.reserved) {
        throw new BadRequestException(
          'Resulting stock would be less than currently reserved quantity',
        );
      }

      return tx.stockItem.update({
        where: { id: existing.id },
        data: { quantity: newQuantity },
      });
    });
  }

  async reserveStock(tenantId: string, dto: ReserveStockDto) {
    await this.assertBelongsToTenant(dto.productId, dto.warehouseId, tenantId);

    return this.prisma.$transaction(async (tx) => {
      const rows = await tx.$queryRaw<StockItemRow[]>`
        SELECT id, quantity, reserved
        FROM "StockItem"
        WHERE "productId" = ${dto.productId} AND "warehouseId" = ${dto.warehouseId}
        FOR UPDATE
      `;

      const stockItem = rows[0];
      if (!stockItem) {
        throw new NotFoundException('No stock record found for this product/warehouse');
      }

      const available = stockItem.quantity - stockItem.reserved;
      if (available < dto.quantity) {
        throw new BadRequestException(
          `Insufficient available stock. Available: ${available}, requested: ${dto.quantity}`,
        );
      }

      return tx.stockItem.update({
        where: { id: stockItem.id },
        data: { reserved: stockItem.reserved + dto.quantity },
      });
    });
  }

  async releaseReservation(tenantId: string, dto: ReserveStockDto) {
    await this.assertBelongsToTenant(dto.productId, dto.warehouseId, tenantId);

    return this.prisma.$transaction(async (tx) => {
      const stockItem = await tx.stockItem.findUnique({
        where: {
          productId_warehouseId: {
            productId: dto.productId,
            warehouseId: dto.warehouseId,
          },
        },
      });

      if (!stockItem) throw new NotFoundException('Stock record not found');

      const newReserved = Math.max(0, stockItem.reserved - dto.quantity);

      return tx.stockItem.update({
        where: { id: stockItem.id },
        data: { reserved: newReserved },
      });
    });
  }
}