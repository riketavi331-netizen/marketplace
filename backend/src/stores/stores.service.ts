import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class StoresService {
  constructor(private prisma: PrismaService) {}

  findAll() {
    return this.prisma.store.findMany({
      include: { _count: { select: { products: true } } },
    });
  }

  async findOne(id: string) {
    const store = await this.prisma.store.findUnique({
      where: { id },
      include: {
        products: {
          where: { inStock: true },
          include: { category: true },
          take: 20,
        },
      },
    });
    if (!store) throw new NotFoundException('Магазин не найден');
    return store;
  }

  create(data: { name: string; address: string; phone?: string; email?: string; geoLat?: number; geoLng?: number }) {
    return this.prisma.store.create({ data });
  }

  update(id: string, data: any) {
    return this.prisma.store.update({ where: { id }, data });
  }
}
