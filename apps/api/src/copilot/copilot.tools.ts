import OpenAI from 'openai';

export const copilotTools: OpenAI.Chat.Completions.ChatCompletionTool[] = [
  {
    type: 'function',
    function: {
      name: 'getStockLevels',
      description: 'Get current stock levels (quantity, reserved, available) for all products across all warehouses for this tenant.',
      parameters: { type: 'object', properties: {}, required: [] },
    },
  },
  {
    type: 'function',
    function: {
      name: 'getLowStockProducts',
      description: 'Get products where available stock (quantity minus reserved) is at or below a given threshold.',
      parameters: {
        type: 'object',
        properties: {
          threshold: { type: 'number', description: 'Available quantity threshold, default 10' },
        },
        required: [],
      },
    },
  },
  {
    type: 'function',
    function: {
      name: 'getLatestMrpRun',
      description: 'Get the most recent MRP run and its suggested purchase/production orders for this tenant.',
      parameters: { type: 'object', properties: {}, required: [] },
    },
  },
  {
    type: 'function',
    function: {
      name: 'getDemandForecast',
      description: 'Get the ML-predicted demand forecast for a specific product by its product ID.',
      parameters: {
        type: 'object',
        properties: {
          productId: { type: 'string', description: 'The product ID to forecast' },
        },
        required: ['productId'],
      },
    },
  },
  {
    type: 'function',
    function: {
      name: 'listProducts',
      description: 'List all products for this tenant, including SKU, name, and product ID — useful for resolving a product name to its ID before calling other tools.',
      parameters: { type: 'object', properties: {}, required: [] },
    },
  },
];