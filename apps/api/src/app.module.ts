import { Module } from '@nestjs/common';
import { PrismaModule } from './prisma/prisma.module';
import { TenantsModule } from './tenants/tenants.module';
import { UsersModule } from './users/users.module';
import { AuthModule } from './auth/auth.module';
import { ProductsModule } from './products/products.module';
import { WarehousesModule } from './warehouses/warehouses.module';
import { StockModule } from './stock/stock.module';
import { BomModule } from './bom/bom.module';

@Module({
  imports: [
    PrismaModule,
    TenantsModule,
    UsersModule,
    AuthModule,
    ProductsModule,
    WarehousesModule,
    StockModule,
    BomModule,
  ],
})
export class AppModule {}