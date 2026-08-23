import {
  Injectable,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateBomVersionDto } from './dto/create-bom-version.dto';

interface CostNode {
  productId: string;
  sku: string;
  name: string;
  unitCost: number;
  totalCost: number;
  quantity: number;
  components: CostNode[];
}

@Injectable()
export class BomService {
  constructor(private prisma: PrismaService) {}

  async createVersion(tenantId: string, dto: CreateBomVersionDto) {
    const product = await this.prisma.product.findFirst({
      where: { id: dto.productId, tenantId },
    });
    if (!product) throw new NotFoundException('Product not found for this tenant');

    for (const line of dto.lines) {
      const component = await this.prisma.product.findFirst({
        where: { id: line.componentProductId, tenantId },
      });
      if (!component) {
        throw new BadRequestException(
          `Component product ${line.componentProductId} not found for this tenant`,
        );
      }
      if (line.componentProductId === dto.productId) {
        throw new BadRequestException('A product cannot be a component of itself');
      }
    }

    await this.assertNoCycle(dto.productId, dto.lines.map((l) => l.componentProductId));

    const latest = await this.prisma.bomVersion.findFirst({
      where: { productId: dto.productId },
      orderBy: { version: 'desc' },
    });
    const nextVersion = (latest?.version ?? 0) + 1;

    await this.prisma.bomVersion.updateMany({
      where: { productId: dto.productId, isActive: true },
      data: { isActive: false },
    });

    return this.prisma.bomVersion.create({
      data: {
        productId: dto.productId,
        version: nextVersion,
        isActive: true,
        lines: {
          create: dto.lines.map((l) => ({
            componentProductId: l.componentProductId,
            parentProductId: dto.productId,
            quantity: l.quantity,
          })),
        },
      },
      include: { lines: true },
    });
  }

  private async assertNoCycle(rootProductId: string, directComponentIds: string[]) {
    const visited = new Set<string>();
    const stack = [...directComponentIds];

    while (stack.length > 0) {
      const currentId = stack.pop()!;
      if (currentId === rootProductId) {
        throw new BadRequestException('Circular BOM detected: a component cannot depend on its own parent');
      }
      if (visited.has(currentId)) continue;
      visited.add(currentId);

      const activeVersion = await this.prisma.bomVersion.findFirst({
        where: { productId: currentId, isActive: true },
        include: { lines: true },
      });

      if (activeVersion) {
        for (const line of activeVersion.lines) {
          stack.push(line.componentProductId);
        }
      }
    }
  }

  async getActiveBomTree(tenantId: string, productId: string): Promise<CostNode> {
    const product = await this.prisma.product.findFirst({
      where: { id: productId, tenantId },
    });
    if (!product) throw new NotFoundException('Product not found for this tenant');

    return this.buildCostNode(productId, 1, new Set());
  }

  private async buildCostNode(
    productId: string,
    quantity: number,
    ancestry: Set<string>,
  ): Promise<CostNode> {
    if (ancestry.has(productId)) {
      throw new BadRequestException('Circular BOM detected during cost rollup');
    }
    const nextAncestry = new Set(ancestry).add(productId);

    const product = await this.prisma.product.findUniqueOrThrow({
      where: { id: productId },
    });

    const activeVersion = await this.prisma.bomVersion.findFirst({
      where: { productId, isActive: true },
      include: { lines: true },
    });

    if (!activeVersion || activeVersion.lines.length === 0) {
      const unitCost = Number(product.unitCost);
      return {
        productId: product.id,
        sku: product.sku,
        name: product.name,
        unitCost,
        totalCost: unitCost * quantity,
        quantity,
        components: [],
      };
    }

    const componentNodes: CostNode[] = [];
    let computedUnitCost = 0;

    for (const line of activeVersion.lines) {
      const childNode = await this.buildCostNode(
        line.componentProductId,
        Number(line.quantity),
        nextAncestry,
      );
      componentNodes.push(childNode);
      computedUnitCost += childNode.totalCost;
    }

    return {
      productId: product.id,
      sku: product.sku,
      name: product.name,
      unitCost: computedUnitCost,
      totalCost: computedUnitCost * quantity,
      quantity,
      components: componentNodes,
    };
  }

  async getAllVersions(tenantId: string, productId: string) {
    const product = await this.prisma.product.findFirst({
      where: { id: productId, tenantId },
    });
    if (!product) throw new NotFoundException('Product not found for this tenant');

    return this.prisma.bomVersion.findMany({
      where: { productId },
      include: { lines: true },
      orderBy: { version: 'desc' },
    });
  }
}