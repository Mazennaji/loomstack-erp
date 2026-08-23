import { Module } from '@nestjs/common';
import { BomService } from './bom.service';
import { BomController } from './bom.controller';

@Module({
  controllers: [BomController],
  providers: [BomService],
})
export class BomModule {}