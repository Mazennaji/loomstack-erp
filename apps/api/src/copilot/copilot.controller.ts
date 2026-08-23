import { Body, Controller, Post, UseGuards } from '@nestjs/common';
import { CopilotService } from './copilot.service';
import { AskCopilotDto } from './dto/ask-copilot.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import type { JwtPayload } from '../auth/strategies/jwt.strategy';

@UseGuards(JwtAuthGuard)
@Controller('copilot')
export class CopilotController {
  constructor(private readonly copilotService: CopilotService) {}

  @Post('ask')
  ask(@Body() dto: AskCopilotDto, @CurrentUser() user: JwtPayload) {
    return this.copilotService.ask(user.tenantId, dto.message);
  }
}