import { Module } from '@nestjs/common';
import { BomController } from './bom.controller';
import { BomService } from './bom.service';

@Module({
  controllers: [BomController],
  providers: [BomService]
})
export class BomModule {}
