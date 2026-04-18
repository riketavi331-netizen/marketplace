import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class AdminService {
  constructor(private prisma: PrismaService) {}

  async getStats() {
    const [customers, storeOwners, stores, products, orders] = await Promise.all([
      this.prisma.user.count({ where: { role: 'CUSTOMER' } }),
      this.prisma.user.count({ where: { role: 'STORE_OWNER' } }),
      this.prisma.store.count(),
      this.prisma.product.count(),
      this.prisma.order.count(),
    ]);
    return { customers, storeOwners, stores, products, orders };
  }

  async getCustomers() {
    return this.prisma.user.findMany({
      where: { role: 'CUSTOMER' },
      select: {
        id: true, name: true, email: true, phone: true,
        passportId: true, frozen: true, createdAt: true,
        _count: { select: { orders: true } },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async getStoreOwners() {
    return this.prisma.user.findMany({
      where: { role: 'STORE_OWNER' },
      select: {
        id: true, name: true, email: true, phone: true,
        passportId: true, frozen: true, createdAt: true,
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async getStores() {
    return this.prisma.store.findMany({
      select: {
        id: true, name: true, address: true, phone: true,
        email: true, frozen: true, createdAt: true,
        _count: { select: { products: true, orders: true } },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async freezeUser(id: string, frozen: boolean) {
    const user = await this.prisma.user.findUnique({ where: { id } });
    if (!user) throw new NotFoundException('Пользователь не найден');
    return this.prisma.user.update({ where: { id }, data: { frozen } });
  }

  async freezeStore(id: string, frozen: boolean) {
    const store = await this.prisma.store.findUnique({ where: { id } });
    if (!store) throw new NotFoundException('Магазин не найден');
    return this.prisma.store.update({ where: { id }, data: { frozen } });
  }

  // legacy
  async getDashboard() {
    return this.getStats();
  }

  async getUsers() {
    return this.prisma.user.findMany({
      select: { id: true, name: true, email: true, phone: true, passportId: true, role: true, frozen: true, createdAt: true },
      orderBy: { createdAt: 'desc' },
    });
  }
}
