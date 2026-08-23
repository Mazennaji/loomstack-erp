import { Module } from '@nestjs/common';
import { MrpController } from './mrp.controller';
import { MrpService } from './mrp.service';

@Module({
  controllers: [MrpController],
  providers: [MrpService]
})
export class MrpModule {}
