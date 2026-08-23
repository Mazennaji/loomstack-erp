import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { TenantScopedService } from '../common/tenant-scoped.service';

@Injectable()
export class ProductsService extends TenantScopedService<any> {
  protected model;

  constructor(private prisma: PrismaService) {
    super();
    this.model = this.prisma.product;
  }
}