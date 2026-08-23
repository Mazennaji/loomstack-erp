import { Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bullmq';
import { PrismaModule } from './prisma/prisma.module';
import { TenantsModule } from './tenants/tenants.module';
import { UsersModule } from './users/users.module';
import { AuthModule } from './auth/auth.module';
import { ProductsModule } from './products/products.module';
import { WarehousesModule } from './warehouses/warehouses.module';
import { StockModule } from './stock/stock.module';
import { BomModule } from './bom/bom.module';
import { MrpModule } from './mrp/mrp.module';
import { CopilotModule } from './copilot/copilot.module';
import { RealtimeModule } from './realtime/realtime.module';

@Module({
  imports: [
    BullModule.forRoot({
      connection: {
        url: process.env.REDIS_URL || 'redis://localhost:6379',
      },
    }),
    PrismaModule,
    TenantsModule,
    UsersModule,
    AuthModule,
    ProductsModule,
    WarehousesModule,
    StockModule,
    BomModule,
    MrpModule,
    CopilotModule,
    RealtimeModule,
  ],
})
export class AppModule {}