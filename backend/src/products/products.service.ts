import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateProductDto } from './dto/create-product.dto';
import { FilterProductsDto } from './dto/filter-products.dto';

@Injectable()
export class ProductsService {
  constructor(private prisma: PrismaService) {}

  async findAll(filter: FilterProductsDto) {
    const { search, categoryId, storeId, brand, gender, minPrice, maxPrice, page = 1, limit = 20 } = filter;

    const where: any = { status: 'ACTIVE' };
    if (search) where.name = { contains: search, mode: 'insensitive' };
    if (categoryId) where.categoryId = categoryId;
    if (storeId) where.storeId = storeId;
    if (brand) where.brand = { contains: brand, mode: 'insensitive' };
    if (gender) where.gender = gender;
    if (minPrice || maxPrice) where.price = { gte: minPrice, lte: maxPrice };

    const [items, total] = await Promise.all([
      this.prisma.product.findMany({
        where,
        include: {
          category: { select: { name: true, slug: true } },
          store: { select: { name: true } },
        },
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.product.count({ where }),
    ]);

    return { items, total, page, limit, pages: Math.ceil(total / limit) };
  }

  async findOne(id: string) {
    const product = await this.prisma.product.findUnique({
      where: { id },
      include: {
        category: true,
        store: { select: { id: true, name: true, address: true, phone: true } },
      },
    });
    if (!product) throw new NotFoundException('Товар не найден');
    return product;
  }

  async create(dto: CreateProductDto) {
    return this.prisma.product.create({ data: dto as any });
  }

  async update(id: string, dto: Partial<CreateProductDto>) {
    return this.prisma.product.update({ where: { id }, data: dto as any });
  }

  async remove(id: string) {
    return this.prisma.product.delete({ where: { id } });
  }

  async getCategories() {
    return this.prisma.category.findMany();
  }
}
