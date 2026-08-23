import { Module } from '@nestjs/common';
import { MrpService } from './mrp.service';
import { MrpController } from './mrp.controller';

@Module({
  controllers: [MrpController],
  providers: [MrpService, ForecastingClientService],
  exports: [MrpService, ForecastingClientService],
})
export class MrpModule {}