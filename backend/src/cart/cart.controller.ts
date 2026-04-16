import { Controller, Get, Post, Patch, Delete, Body, UseGuards, Request } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { JwtGuard } from '../auth/jwt.guard';
import { CartService, CartItem } from './cart.service';

@ApiTags('cart')
@ApiBearerAuth()
@UseGuards(JwtGuard)
@Controller('cart')
export class CartController {
  constructor(private cartService: CartService) {}

  @Get()
  @ApiOperation({ summary: 'Получить корзину' })
  getCart(@Request() req) {
    return this.cartService.getCart(req.user.id);
  }

  @Post()
  @ApiOperation({ summary: 'Добавить в корзину' })
  addItem(@Request() req, @Body() item: CartItem) {
    return this.cartService.addItem(req.user.id, item);
  }

  @Patch()
  @ApiOperation({ summary: 'Изменить кол-во' })
  updateItem(@Request() req, @Body() body: { productId: string; size?: string; qty: number }) {
    return this.cartService.updateItem(req.user.id, body.productId, body.size, body.qty);
  }

  @Delete()
  @ApiOperation({ summary: 'Очистить корзину' })
  clearCart(@Request() req) {
    return this.cartService.clearCart(req.user.id);
  }
}
