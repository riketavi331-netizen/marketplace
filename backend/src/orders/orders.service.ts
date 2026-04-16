import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

export interface CreateOrderDto {
  storeId: string;
  address: string;
  comment?: string;
  items: { productId: string; size?: string; qty: number }[];
}

@Injectable()
export class OrdersService {
  constructor(private prisma: PrismaService) {}

  async create(userId: string, dto: CreateOrderDto) {
    const productIds = dto.items.map((i) => i.productId);
    const products = await this.prisma.product.findMany({ where: { id: { in: productIds } } });

    const total = dto.items.reduce((sum, item) => {
      const product = products.find((p) => p.id === item.productId);
      return sum + Number(product?.price || 0) * item.qty;
    }, 0);

    return this.prisma.order.create({
      data: {
        userId,
        storeId: dto.storeId,
        address: dto.address,
        comment: dto.comment,
        total,
        items: {
          create: dto.items.map((item) => {
            const product = products.find((p) => p.id === item.productId);
            return { productId: item.productId, size: item.size, qty: item.qty, price: product?.price || 0 };
          }),
        },
      },
      include: { items: { include: { product: true } }, store: true },
    });
  }

  async findOne(id: string, userId: string) {
    const order = await this.prisma.order.findFirst({
      where: { id, userId },
      include: { items: { include: { product: true } }, store: true, user: { select: { name: true, email: true } } },
    });
    if (!order) throw new NotFoundException('Заказ не найден');
    return order;
  }

  async updateStatus(id: string, status: string) {
    return this.prisma.order.update({ where: { id }, data: { status: status as any } });
  }

  async getStats() {
    const [total, byStatus, revenue, recent] = await Promise.all([
      this.prisma.order.count(),
      this.prisma.order.groupBy({ by: ['status'], _count: true }),
      this.prisma.order.aggregate({ _sum: { total: true } }),
      this.prisma.order.findMany({
        take: 10,
        orderBy: { createdAt: 'desc' },
        include: { user: { select: { name: true, email: true } }, store: { select: { name: true } } },
      }),
    ]);

    return { total, byStatus, revenue: revenue._sum.total, recent };
  }
}
