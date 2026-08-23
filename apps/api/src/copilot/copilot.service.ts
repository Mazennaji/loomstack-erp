import { Injectable } from '@nestjs/common';
import OpenAI from 'openai';
import { PrismaService } from '../prisma/prisma.service';
import { MrpService } from '../mrp/mrp.service';
import { ForecastingClientService } from '../mrp/forecasting.service';
import { copilotTools } from './copilot.tools';

@Injectable()
export class CopilotService {
  private openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

  constructor(
    private prisma: PrismaService,
    private mrpService: MrpService,
    private forecastingClient: ForecastingClientService,
  ) {}

  private async executeTool(name: string, args: any, tenantId: string) {
    switch (name) {
      case 'getStockLevels':
        return this.prisma.stockItem.findMany({
          where: { product: { tenantId } },
          include: { product: true, warehouse: true },
        });

      case 'getLowStockProducts': {
        const threshold = args.threshold ?? 10;
        const items = await this.prisma.stockItem.findMany({
          where: { product: { tenantId } },
          include: { product: true, warehouse: true },
        });
        return items
          .filter((i) => i.quantity - i.reserved <= threshold)
          .map((i) => ({
            product: i.product.name,
            sku: i.product.sku,
            warehouse: i.warehouse.name,
            available: i.quantity - i.reserved,
          }));
      }

      case 'getLatestMrpRun': {
        const runs = await this.mrpService.listRuns(tenantId);
        if (runs.length === 0) return { message: 'No MRP runs found.' };
        return this.mrpService.getRun(tenantId, runs[0].id);
      }

      case 'getDemandForecast':
        return this.forecastingClient.getForecast(tenantId, args.productId);

      case 'listProducts':
        return this.prisma.product.findMany({
          where: { tenantId },
          select: { id: true, sku: true, name: true },
        });

      default:
        return { error: `Unknown tool: ${name}` };
    }
  }

  async ask(tenantId: string, message: string) {
    const messages: OpenAI.Chat.Completions.ChatCompletionMessageParam[] = [
      {
        role: 'system',
        content:
          'You are the LoomStack ERP assistant. Answer questions about inventory, MRP suggestions, and demand forecasts using the provided tools. Always call a tool to get real data before answering — never guess numbers. Be concise and specific.',
      },
      { role: 'user', content: message },
    ];

    const firstResponse = await this.openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages,
      tools: copilotTools,
    });

    const responseMessage = firstResponse.choices[0].message;
    const toolCalls = responseMessage.tool_calls;

    if (!toolCalls || toolCalls.length === 0) {
      return { reply: responseMessage.content };
    }

    messages.push(responseMessage);

    for (const toolCall of toolCalls) {
      const args = JSON.parse(toolCall.function.arguments || '{}');
      const result = await this.executeTool(toolCall.function.name, args, tenantId);

      messages.push({
        role: 'tool',
        tool_call_id: toolCall.id,
        content: JSON.stringify(result),
      });
    }

    const secondResponse = await this.openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages,
    });

    return { reply: secondResponse.choices[0].message.content };
  }
}