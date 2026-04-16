import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import Anthropic from '@anthropic-ai/sdk';
import { PrismaService } from '../prisma/prisma.service';

export interface AiRequest {
  message: string;
  gender?: string;
  occasion?: string;
  budget?: number;
  sizes?: string[];
  history?: { role: 'user' | 'assistant'; content: string }[];
}

@Injectable()
export class AiAssistantService {
  private client: Anthropic;

  constructor(private config: ConfigService, private prisma: PrismaService) {
    this.client = new Anthropic({ apiKey: config.get('ANTHROPIC_API_KEY') });
  }

  async chat(req: AiRequest) {
    const products = await this.prisma.product.findMany({
      where: { inStock: true, ...(req.gender ? { gender: req.gender as any } : {}) },
      include: { category: true },
      take: 50,
    });

    const catalog = products.map((p) => ({
      id: p.id,
      name: p.name,
      category: p.category.name,
      brand: p.brand,
      price: Number(p.price),
      sizes: p.sizes,
      gender: p.gender,
    }));

    const systemPrompt = `Ты — AI-стилист интернет-магазина одежды и обуви.
Помогаешь подобрать образы и товары из каталога.
Отвечай на русском языке, кратко и по делу.
При рекомендации товаров всегда указывай их ID в формате [id:PRODUCT_ID].

Текущий каталог магазина:
${JSON.stringify(catalog, null, 2)}

${req.budget ? `Бюджет клиента: до ${req.budget}₽` : ''}
${req.sizes?.length ? `Размеры: ${req.sizes.join(', ')}` : ''}`;

    const messages: Anthropic.MessageParam[] = [
      ...(req.history || []).map((h) => ({ role: h.role, content: h.content })),
      { role: 'user', content: req.message },
    ];

    const response = await this.client.messages.create({
      model: 'claude-sonnet-4-6',
      max_tokens: 1024,
      system: systemPrompt,
      messages,
    });

    const text = response.content[0].type === 'text' ? response.content[0].text : '';

    // Extract recommended product IDs from response
    const productIds = [...text.matchAll(/\[id:([^\]]+)\]/g)].map((m) => m[1]);
    const recommendedProducts = productIds.length
      ? await this.prisma.product.findMany({ where: { id: { in: productIds } }, include: { category: true } })
      : [];

    return { message: text, products: recommendedProducts };
  }
}
