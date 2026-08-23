import { Module } from '@nestjs/common';
import { PrismaModule } from './prisma/prisma.module';
import { TenantsModule } from './tenants/tenants.module';

@Module({
  imports: [PrismaModule, TenantsModule],
})
export class AppModule {}