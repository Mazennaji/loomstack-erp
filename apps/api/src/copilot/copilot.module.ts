import { Module } from '@nestjs/common';
import { CopilotService } from './copilot.service';
import { CopilotController } from './copilot.controller';
import { MrpModule } from '../mrp/mrp.module';

@Module({
  imports: [MrpModule],
  controllers: [CopilotController],
  providers: [CopilotService],
})
export class CopilotModule {}