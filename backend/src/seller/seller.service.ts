import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class SellerService {
  constructor(private prisma: PrismaService) {}

  // ── Найти магазин продавца ─────────────────────────────
  private async getStore(userId: string) {
    const store = await this.prisma.store.findFirst({
      where: { email: { not: null } }, // будем искать по email пользователя
    });
    // Ищем магазин, email которого совпадает с email пользователя
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    const myStore = await this.prisma.store.findFirst({ where: { email: user!.email } });
    if (!myStore) throw new NotFoundException('Магазин не найден');
    return myStore;
  }

  // ── Мои товары ─────────────────────────────────────────
  async getMyProducts(userId: string) {
    const store = await this.getStore(userId);
    return this.prisma.product.findMany({
      where: { storeId: store.id },
      include: {
        category: { select: { id: true, name: true } },
        colors: true,
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  // ── Создать товар ──────────────────────────────────────
  async createProduct(userId: string, dto: any) {
    const store = await this.getStore(userId);
    const { colors, ...data } = dto;

    const product = await this.prisma.product.create({
      data: {
        ...data,
        storeId: store.id,
        inStock: (data.stock ?? 0) > 0,
        colors: colors?.length
          ? { create: colors.map((c: any) => ({ name: c.name, hex: c.hex, image: c.image })) }
          : undefined,
      },
      include: { category: { select: { id: true, name: true } }, colors: true },
    });
    return product;
  }

  // ── Обновить товар ─────────────────────────────────────
  async updateProduct(userId: string, productId: string, dto: any) {
    const store = await this.getStore(userId);
    const product = await this.prisma.product.findFirst({ where: { id: productId, storeId: store.id } });
    if (!product) throw new ForbiddenException('Товар не найден или нет доступа');

    const { colors, ...data } = dto;

    return this.prisma.product.update({
      where: { id: productId },
      data: {
        ...data,
        inStock: data.stock !== undefined ? data.stock > 0 : undefined,
        colors: colors
          ? { deleteMany: {}, create: colors.map((c: any) => ({ name: c.name, hex: c.hex, image: c.image })) }
          : undefined,
      },
      include: { category: { select: { id: true, name: true } }, colors: true },
    });
  }

  // ── Удалить товар ──────────────────────────────────────
  async deleteProduct(userId: string, productId: string) {
    const store = await this.getStore(userId);
    const product = await this.prisma.product.findFirst({ where: { id: productId, storeId: store.id } });
    if (!product) throw new ForbiddenException('Товар не найден или нет доступа');
    return this.prisma.product.delete({ where: { id: productId } });
  }

  // ── Заказы моего магазина ──────────────────────────────
  async getMyOrders(userId: string) {
    const store = await this.getStore(userId);
    return this.prisma.order.findMany({
      where: { storeId: store.id },
      include: {
        user: { select: { name: true, email: true, phone: true } },
        items: {
          include: {
            product: { select: { id: true, name: true, images: true, price: true } },
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  // ── Обновить статус заказа ─────────────────────────────
  async updateOrderStatus(userId: string, orderId: string, status: string) {
    const store = await this.getStore(userId);
    const order = await this.prisma.order.findFirst({ where: { id: orderId, storeId: store.id } });
    if (!order) throw new ForbiddenException('Заказ не найден или нет доступа');
    return this.prisma.order.update({ where: { id: orderId }, data: { status: status as any } });
  }

  // ── Статистика магазина ────────────────────────────────
  async getStats(userId: string) {
    const store = await this.getStore(userId);
    const [products, orders, revenue] = await Promise.all([
      this.prisma.product.count({ where: { storeId: store.id } }),
      this.prisma.order.count({ where: { storeId: store.id } }),
      this.prisma.order.aggregate({
        where: { storeId: store.id, status: { not: 'CANCELLED' } },
        _sum: { total: true },
      }),
    ]);
    return { store, products, orders, revenue: revenue._sum.total ?? 0 };
  }
}
