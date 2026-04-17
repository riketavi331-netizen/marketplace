import {
  Controller, Get, Post, Patch, Delete, Body, Param,
  UseGuards, Request, UseInterceptors, UploadedFiles,
  BadRequestException,
} from '@nestjs/common';
import { FilesInterceptor } from '@nestjs/platform-express';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { diskStorage } from 'multer';
import { extname, join } from 'path';
import { existsSync, mkdirSync } from 'fs';
import { JwtGuard } from '../auth/jwt.guard';
import { SellerService } from './seller.service';

const UPLOAD_DIR = join(process.cwd(), 'uploads', 'products');

@ApiTags('seller')
@ApiBearerAuth()
@UseGuards(JwtGuard)
@Controller('seller')
export class SellerController {
  constructor(private sellerService: SellerService) {}

  // ── Статистика ─────────────────────────────────────────
  @Get('stats')
  @ApiOperation({ summary: 'Статистика магазина продавца' })
  getStats(@Request() req: any) {
    return this.sellerService.getStats(req.user.id);
  }

  // ── Товары ─────────────────────────────────────────────
  @Get('products')
  @ApiOperation({ summary: 'Мои товары' })
  getProducts(@Request() req: any) {
    return this.sellerService.getMyProducts(req.user.id);
  }

  @Post('products')
  @ApiOperation({ summary: 'Создать товар' })
  createProduct(@Request() req: any, @Body() dto: any) {
    return this.sellerService.createProduct(req.user.id, dto);
  }

  @Patch('products/:id')
  @ApiOperation({ summary: 'Обновить товар' })
  updateProduct(@Request() req: any, @Param('id') id: string, @Body() dto: any) {
    return this.sellerService.updateProduct(req.user.id, id, dto);
  }

  @Delete('products/:id')
  @ApiOperation({ summary: 'Удалить товар' })
  deleteProduct(@Request() req: any, @Param('id') id: string) {
    return this.sellerService.deleteProduct(req.user.id, id);
  }

  // ── Загрузка изображений ───────────────────────────────
  @Post('upload')
  @ApiOperation({ summary: 'Загрузить изображения товара (до 5 файлов, до 3MB)' })
  @UseInterceptors(FilesInterceptor('files', 5, {
    storage: diskStorage({
      destination: (_req, _file, cb) => {
        if (!existsSync(UPLOAD_DIR)) mkdirSync(UPLOAD_DIR, { recursive: true });
        cb(null, UPLOAD_DIR);
      },
      filename: (_req, file, cb) => {
        const unique = `${Date.now()}-${Math.round(Math.random() * 1e6)}`;
        cb(null, `${unique}${extname(file.originalname)}`);
      },
    }),
    limits: { fileSize: 3 * 1024 * 1024 }, // 3MB
    fileFilter: (_req, file, cb) => {
      if (!file.mimetype.startsWith('image/')) {
        return cb(new BadRequestException('Только изображения'), false);
      }
      cb(null, true);
    },
  }))
  uploadImages(@UploadedFiles() files: Express.Multer.File[]) {
    if (!files?.length) throw new BadRequestException('Файлы не загружены');
    const baseUrl = process.env.BASE_URL || 'http://localhost:3001';
    return { urls: files.map((f) => `${baseUrl}/uploads/products/${f.filename}`) };
  }

  // ── Заказы ─────────────────────────────────────────────
  @Get('orders')
  @ApiOperation({ summary: 'Заказы моего магазина' })
  getOrders(@Request() req: any) {
    return this.sellerService.getMyOrders(req.user.id);
  }

  @Patch('orders/:id/status')
  @ApiOperation({ summary: 'Обновить статус заказа' })
  updateStatus(@Request() req: any, @Param('id') id: string, @Body('status') status: string) {
    return this.sellerService.updateOrderStatus(req.user.id, id, status);
  }
}
