import { NotFoundException } from '@nestjs/common';

export abstract class TenantScopedService<T> {
  protected abstract model: {
    findMany: (args: any) => Promise<T[]>;
    findFirst: (args: any) => Promise<T | null>;
    create: (args: any) => Promise<T>;
    update: (args: any) => Promise<T>;
    delete: (args: any) => Promise<T>;
  };

  async findAllForTenant(tenantId: string, extraWhere: object = {}) {
    return this.model.findMany({
      where: { tenantId, ...extraWhere },
    });
  }

  async findOneForTenant(id: string, tenantId: string) {
    const record = await this.model.findFirst({
      where: { id, tenantId } as any,
    });
    if (!record) throw new NotFoundException('Resource not found');
    return record;
  }

  async createForTenant(tenantId: string, data: object) {
    return this.model.create({
      data: { ...data, tenantId },
    });
  }

  async updateForTenant(id: string, tenantId: string, data: object) {
    await this.findOneForTenant(id, tenantId);
    return this.model.update({
      where: { id } as any,
      data,
    });
  }

  async removeForTenant(id: string, tenantId: string) {
    await this.findOneForTenant(id, tenantId);
    return this.model.delete({ where: { id } as any });
  }
}